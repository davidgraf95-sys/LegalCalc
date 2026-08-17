// KEINE `@shard-gruppe`-Kopfzeile, und das ist Absicht: diese Datei wird von
// KEINEM Projekt gesammelt, solange `PX=1` fehlt (playwright.config.ts). Der
// Shard-Union-Wächter prüft gegen `playwright test --list` und sieht sie darum
// gar nicht — eine Gruppenzuordnung wäre eine Zeile über eine Spec, die im
// CI-Lauf nicht existiert.
//
// ═══ A-7 · PIXELVERGLEICH DES TEXTKÖRPERS (FAHRPLAN-LESER-V3 Kap. 7 «PX») ════
//
// DIE ZUSAGE, die hier bewiesen wird: «Der Textkörper darf sich beim
// Hüllen-Umbau nicht um ein Pixel ändern.» Das ist der schärfste verfügbare
// Beweis für «Kern unangetastet» und fängt, was DOM-Sonden durchlassen —
// Abstände, Einzüge, Zeilenumbrüche.
//
// ── WARUM DIESES TOR OPT-IN IST UND NICHT IN DEN CI-SHARDS LÄUFT ────────────
// Kap. 12 A-7 verlangt die Flake-Basisrate MIT Messbedingung, bevor das Tor
// scharf geschaltet wird (§0 Ziff. 3). Zwei Gründe stehen dem CI-Betrieb heute
// entgegen, und beide sind gemessen bzw. belegt, nicht vermutet:
//
//  ① KEINE SCHOTTEN-BASELINE. Im Repo existiert bisher NIRGENDS ein
//    `toHaveScreenshot`, kein Snapshot-Verzeichnis, keine Toleranz-Politik.
//    Diese Datei führt eine neue Testklasse ein.
//  ② BASELINE IST OS-GEBUNDEN. Die Baseline entsteht lokal auf macOS, der
//    CI-Runner ist Linux. Font-Rasterung und Subpixel-Hinting unterscheiden
//    sich dort systematisch — eine macOS-Baseline würde auf CI nicht
//    „gelegentlich" reissen, sondern zuverlässig, und zwar ohne dass am
//    Textkörper irgendetwas falsch wäre. Ein Tor, das aus einer bekannten,
//    sachfremden Ursache immer rot ist, erzeugt rote Läufe ohne Aussage.
//
// Playwright legt Baselines darum bereits plattform-getaggt ab
// (`…-darwin.png` / `…-linux.png`). Der saubere CI-Betrieb verlangt eine
// Linux-Baseline, die auf einem Linux-Runner erzeugt wird — das ist ein eigener
// Schritt (im Fahrplan als Folge notiert), kein Nebenprodukt dieser Etappe.
//
// LOKAL SCHARF, und dort trägt es: `PX=1 npx playwright test --project=px`.
// Die gemessene Flake-Basisrate steht im PR-Body samt Messbedingung.
//
// ── WAS VERGLICHEN WIRD ─────────────────────────────────────────────────────
// NUR der Artikel-Knoten (`article#art-…`), nicht die Seite: die Hülle SOLL
// sich ändern, der Wortlaut nicht. Gleiche Breite, gleiche Schriftstufe, beide
// Läufe im selben Browser — der einzige Unterschied ist das Hüllen-Flag.
import { test, expect, type Page } from '@playwright/test'

/**
 * Ruhe vor dem Bild: Animationen aus, Schriften geladen, Layout gesetzt.
 *
 * DER SPRUNG-PULS MUSS WEG — sonst misst PX ihn statt des Textes. Der
 * Anker-Sprung (`#art-…`) legt `lc-ziel-blink` auf den Zielartikel und nimmt
 * sie erst nach 2400 ms zurück. Darum beides: die Klasse aktiv entfernen UND
 * lange genug warten. Die Klasse nur zu entfernen genügte nicht, weil der
 * Timer sie nicht neu setzt, ein später eintreffender zweiter Sprung aber
 * schon.
 *
 * KORREKTUR 16.8.2026 — hier stand, die 40 276 Pixel Unterschied bei OR
 * Art. 336c hingen «genau daran». Das ist widerlegt: der Puls war entfernt und
 * abgewartet, die Zahl blieb Lauf für Lauf identisch. Die wirkliche Ursache
 * steht am `test.describe` unten (ausgelagertes Rendering). Der Puls-Ausschluss
 * bleibt, er ist für sich richtig — er war nur nicht die Erklärung.
 */
async function beruhige(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => document.fonts.ready)
  // Der Reader lädt Bezugs-/Historie-Shards nach; ein Bild davor zeigte einen
  // Zwischenstand und wäre für sich schon flakig. 2600 ms deckt zusätzlich die
  // 2400-ms-Lebensdauer des Sprung-Pulses ab.
  await page.waitForTimeout(2600)
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('.lc-ziel-blink')) el.classList.remove('lc-ziel-blink')
  })
}

/**
 * Breite, auf die BEIDE Hüllen für die Messung gezwungen werden.
 *
 * ENTSCHEID 16.8.2026: PX misst bei GLEICHER Spaltenbreite. Der erste scharfe
 * Lauf hatte gezeigt, dass V1 und V3 den Artikel unterschiedlich breit setzen
 * (874 gegen 691 px Spalte, 744 gegen 561 px Artikel) — und dass das kein
 * Treue-Bruch ist, sondern der beabsichtigte Satzspiegel der neuen Hülle
 * (18-rem-Seitenleiste, seit Ä2 zusätzlich 40 rem Lesemass).
 *
 * Ein Tor, das beides zugleich misst, misst nichts Brauchbares: jede
 * Layout-Entscheidung risse es mit, und niemand könnte mehr unterscheiden, ob
 * sich der WORTLAUT verschoben hat oder nur die Spalte. PX beweist darum ab
 * jetzt den TEXT-KERN — Schrift, Laufweite, Einzüge, Absatzabstände,
 * Fussnoten-Apparat — und ausdrücklich NICHT den Satzspiegel. Der ist eine
 * Gestaltungsfrage und hat mit Ä2 seine eigene Entscheidung bekommen.
 *
 * Erzwungen wird die Breite am Artikel-Knoten selbst statt über das Fenster:
 * die Spaltenbreite hängt in V3 von Seitenleiste und Klapp-Zustand ab, ein
 * Viewport-Wert träfe sie also nur zufällig. `!important`, weil der Container
 * seine Breite über eine Utility-Klasse setzt.
 */
const MESS_BREITE_PX = 640

async function artikelBild(page: Page, pfad: string, artId: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(pfad)
  const art = page.locator(`#${artId}`)
  await expect(art).toBeAttached({ timeout: 30_000 })

  // Beide Hüllen auf dieselbe Artikelbreite zwingen — VOR dem Beruhigen, damit
  // die Zeilenumbrüche im gemessenen Zustand entstehen.
  await page.evaluate(({ id, breite }) => {
    const el = document.getElementById(id)
    if (el) el.style.setProperty('width', `${breite}px`, 'important')
    // Auch den Lesespalten-Container klemmen: er trägt das Lesemass, und ein
    // breiterer Elternknoten liesse Randabstände anders auflösen.
    const spalte = document.getElementById('lc-lesespalte')
    if (spalte) spalte.style.setProperty('max-width', `${breite}px`, 'important')

    // ── AUSGELAGERTES RENDERING AM MESS-ARTIKEL ABSCHALTEN ────────────────
    // `.nt-art-cv` trägt `content-visibility: auto` (src/index.css, 1686
    // Artikel allein im OR). Ein übersprungener Artikel behält dank
    // `contain-intrinsic-size: auto` seine zuletzt bekannte Grösse — er MISST
    // sich also vollständig, während er NICHTS malt. Genau deshalb blieb der
    // Befund so lange unerklärt: siehe den Messbeleg am Test unten.
    // NUR der Mess-Artikel wird umgestellt, nicht alle `.nt-art-cv`: nähme man
    // dem ganzen Dokument die Ersatzhöhen, flösse es neu und der Artikel
    // wanderte während der Aufnahme weg (gemessen: y −2690 px statt +100 px).
    if (el) {
      el.style.setProperty('content-visibility', 'visible', 'important')
      // Und die Einschliessung von Hand nachziehen: `content-visibility: auto`
      // bringt `contain: layout style paint` MIT, auch solange der Artikel
      // gemalt wird. Ohne diese Zeile misst PX ein anderes Bild als das
      // ausgelieferte — gemessen gegen die V1-Baseline 4383 px (StPO 429) bzw.
      // 15 350 px (OR 336c) Unterschied, nur aus der fehlenden Einschliessung.
      el.style.setProperty('contain', 'layout style paint', 'important')
    }
  }, { id: artId, breite: MESS_BREITE_PX })

  await art.scrollIntoViewIfNeeded()
  await beruhige(page)

  // Beweis, dass die Klemme wirklich griff — sonst verglichen wir wieder zwei
  // verschiedene Breiten und merkten es nicht (§6.7).
  const breite = await art.evaluate((el) => Math.round(el.getBoundingClientRect().width))
  expect(breite, `Artikelbreite ${breite} px statt ${MESS_BREITE_PX} px — die Mess-Klemme greift nicht`)
    .toBe(MESS_BREITE_PX)
  return art
}

// Die zwei Artikel aus Kap. 7: StPO Art. 429 (Fliesstext + Fussnoten) und
// OR Art. 336c (Absatzstruktur + Aufzählung). Der OR-Anker trägt die
// Unterstrich-Notation `art-336_c` — nicht `art-336c` (Bestand, s.
// `gesetze-ia-v2-walks.e2e.ts`).
const FAELLE = [
  { name: 'stpo-429', v1: '/gesetze/bund/STPO?leser=v1#art-429', v3: '/gesetze/bund/STPO?leser=v3#art-429', id: 'art-429' },
  { name: 'or-336c', v1: '/gesetze/bund/OR?leser=v1#art-336_c', v3: '/gesetze/bund/OR?leser=v3#art-336_c', id: 'art-336_c' },
]

// ═══ BEFUND OR ART. 336c — 40 276 PIXEL, UND WAS SIE NICHT WAREN ════════════
//
// Messbedingung: 16.8.2026, macOS (darwin-Baseline), `PX=1`, warmer
// Preview-Server, Fenster 1440×900, `retries: 0`. Die Zahl kam in JEDEM Lauf
// identisch heraus — kein Rauschen, also keine Toleranz-Frage.
//
// SYMPTOM: OR Art. 336c riss mit 40 276 Pixeln (ratio 0.05) im ZWEITEN Schritt
// (V3 gegen die V1-Baseline). StPO Art. 429 war pixelgleich.
//
// DREI FALSCHE FÄHRTEN, alle drei ausgeschlossen statt geglaubt:
//  ① Der Sprung-Puls `lc-ziel-blink` — entfernt UND abgewartet, Zahl blieb.
//  ② Der Satzspiegel. V1 setzt den Artikel breiter als V3 (gemessen @1440:
//    Spalte 874 gegen 691 px, Artikel 744 gegen 561 px — die 18-rem-
//    Seitenleiste nimmt die Breite). Real, aber seit der Mess-Klemme auf
//    640 px keine Erklärung mehr: die Klemme greift beidseits nachweislich
//    (Prüfung in `artikelBild`), die Zahl blieb trotzdem exakt gleich.
//  ③ Knoten-für-Knoten-Sonden. Sie fanden NICHTS: 139 sichtbare Knoten
//    beidseits, Artikelhöhe 1526 px, `font-size` 16 / `line-height` 25.6,
//    8 Fussnoten-Marker + 1 Apparat, 3145 Zeichen — in V1 wie in V3.
//
// URSACHE — im Diff-Bild GESEHEN, nicht gerechnet (genau daran scheiterte die
// vorige Diagnose: sie hat nur gerechnet). Markiert war weder ein Rand noch
// eine Zeile noch ein Subpixel-Saum, sondern JEDER BUCHSTABE des Artikels. Das
// ist die Signatur von «eine Seite ist leer», nicht von Rundungsrauschen.
// Nachgemessen an der Aufnahme selbst, gleiche Klemme, gleicher Puls-Ausschluss
// (Bytes des Element-Screenshots als Tinten-Indikator):
//
//                                        V1          V3
//   Element-Screenshot                341 696 B     5 856 B  ← V3 nur Papier
//   dasselbe, content-visibility:visible    —     341 673 B  ← Text da
//
// `.nt-art-cv` trägt `content-visibility: auto` (src/index.css; 1686 Artikel
// allein im OR). Ein ÜBERSPRUNGENER Artikel behält über
// `contain-intrinsic-size: auto` seine zuletzt bekannte Grösse: er misst sich
// vollständig und malt nichts. Deshalb war jede DOM-Sonde grün, während das
// Bild leer blieb — das erklärt Fährte ③ vollständig. Playwrights
// Element-Aufnahme (Clip über den Viewport hinaus) trifft in V3 den Zustand
// «übersprungen», in V1 nicht; der Artikel steht in V3 56 px tiefer (höhere
// Kopfzeile), und das genügt für eine andere Relevanz-Entscheidung des Browsers.
//
// KEIN PRODUKTFEHLER — GEPRÜFT, NICHT ANGENOMMEN: ein Viewport-Bild derselben
// V3-Seite ohne Element-Clip zeigt Art. 336c vollständig gesetzt. Leer war die
// AUFNAHME, nie die Seite. Dieselbe Falle ist im Druck schon einmal
// aufgeschlagen und dort gleich gelöst (src/index.css, `@media print`:
// `.nt-art-cv { content-visibility: visible !important }`).
//
// FOLGE FÜR DAS TOR: `artikelBild` schaltet das ausgelagerte Rendering am
// Mess-Artikel ab — in BEIDEN Hüllen gleich und mit von Hand nachgezogener
// Einschliessung, damit weiterhin das AUSGELIEFERTE Bild gemessen wird. Die
// Toleranz wurde NICHT angefasst: `maxDiffPixelRatio` steht unverändert bei
// 0.001, und die Baseline ist nicht neu aufgenommen worden.
//
// ROT-BEWEIS (§6.7), beides in diesem Lauf gesehen, nicht behauptet: ohne die
// Abschaltung 40 276 px (V3 leer); mit Abschaltung, aber OHNE nachgezogene
// Einschliessung 4383 px (StPO 429) bzw. 15 350 px (OR 336c) schon im ersten
// Schritt gegen die V1-Baseline. Das Tor kann scheitern.
//
// OFFEN BLEIBT der Satzspiegel: dass V3 den Text schmaler setzt als V1, ist
// gemessen und eine Gestaltungs-/Treue-Frage für David — PX misst seit der
// Klemme ausdrücklich den TEXT-KERN und nicht den Satzspiegel.
//
// OFFEN BLEIBT ZWEITENS EIN 1-PX-HÖHEN-WACKLER — hier notiert, weil eine Lehre,
// die nur im Chat steht, keine ist. Nach dem Fix oben lief das Tor grün (2/2,
// Exit 0); ein späterer Lauf mit UNVERÄNDERTEM Code riss bei StPO Art. 429 im
// ZWEITEN Schritt mit «Expected an image 640px by 856px, received 640px by
// 857px» (31 508 px). Nicht die Tinte wich ab, sondern die HÖHE um 1 px, und
// zwar in V3. Plausibler Mechanismus, noch nicht bewiesen: die Artikelhöhe ist
// gebrochen (gemessen 1526.34 px bei OR 336c), und der Artikel sitzt in V3
// 56 px tiefer — je nach Bruchteil der y-Position rundet der Bild-Ausschnitt
// auf 856 oder 857 Zeilen. Messbedingung: macOS, warmer Preview, 1440×900,
// `retries: 0`; gesehen in 1 von 4 Läufen (StPO), OR war in allen 4 stabil.
// EINE GRÖSSEN-ABWEICHUNG IST DURCH KEINE TOLERANZ ZU DECKEN — Playwright
// vergleicht Bildmasse hart, `maxDiffPixelRatio` greift daran gar nicht. Der
// Wurzel-Fix (y-Position vor der Aufnahme auf ganze Pixel legen, ohne dass
// Playwrights eigenes Scroll-in-View sie wieder verstellt) ist eigene Arbeit
// und ausdrücklich NICHT in dieser Etappe erledigt.
test.describe('A-7 · PX — der Text-Kern ist in V1 und V3 pixelgleich', () => {
  for (const f of FAELLE) {
    test(`${f.name}: V3-Artikel gleicht bei gleicher Breite der V1-Baseline`, async ({ page }) => {
      test.slow()

      // Schritt 1 — V1 ist die BASELINE: der eingefrorene Ist-Zustand.
      const artV1 = await artikelBild(page, f.v1, f.id)
      await expect(artV1).toHaveScreenshot(`${f.name}.png`, {
        // maxDiffPixelRatio statt maxDiffPixels: die Artikel sind
        // unterschiedlich hoch, ein absoluter Wert wäre für den kurzen streng
        // und für den langen lax.
        maxDiffPixelRatio: 0.001,
        animations: 'disabled',
        caret: 'hide',
      })

      // Schritt 2 — V3 muss DIESELBE Baseline treffen. Derselbe Dateiname ist
      // der ganze Test: zwei getrennte Bilder zu pflegen hiesse, zwei
      // Baselines zu haben, von denen jede für sich grün bleibt, während sie
      // auseinanderlaufen (§6.7 — ein Tor, das nicht scheitern kann).
      const artV3 = await artikelBild(page, f.v3, f.id)
      await expect(artV3).toHaveScreenshot(`${f.name}.png`, {
        maxDiffPixelRatio: 0.001,
        animations: 'disabled',
        caret: 'hide',
      })
    })
  }
})
