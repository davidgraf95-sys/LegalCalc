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

/**
 * Fensterhöhe für die Aufnahme — hoch genug, dass der Mess-Artikel in BEIDEN
 * Hüllen VOLLSTÄNDIG ins Fenster passt.
 *
 * WURZEL-FIX S2 (17.8.2026) für den «1-px-Höhen-Wackler», den der Kopf des
 * `test.describe` unten als offen notiert hatte («Der Wurzel-Fix … ist eigene
 * Arbeit und ausdrücklich NICHT in dieser Etappe erledigt»). Er ist es jetzt.
 *
 * BEFUND, gemessen statt vermutet: V1 und V3 rendern den Artikel bis auf das
 * letzte Merkmal gleich — bei StPO 429 beide 784.921875 px hoch, gleiche
 * Subpixel-Phase (`top % 1` = 0.1875 in beiden), gleiche Schriftgrössen,
 * Zeilenhöhen, Farben, Textdekorationen, `:target`-Zustände. Was sich
 * unterscheidet, ist allein die y-POSITION: V3 setzt den Artikel 56 px tiefer
 * (Hüllen-Kopf). Bei der alten Fensterhöhe 900 lag der 785 px hohe Artikel damit
 * GENAU AUF DER BRUCHSTELLE — gemessen endete er je nach Hülle und Scroll-Ruhe
 * bei 885, 900.1 bzw. 941 px, also teils knapp innerhalb, teils knapp ausserhalb
 * des Fensters. Playwright nimmt ein Element, das nicht ins Fenster passt,
 * scrollend auf; die Aufnahme entsteht dann bei einem anderen Scroll-Offset als
 * die, die passt, und die Rasterung der kleinen Schriften (11-px-Fussnoten-
 * Apparat, Chip-Zeile) weicht ab. Ergebnis: 1869 abweichende Pixel (ratio 0.0034
 * gegen eine Schwelle von 0.001), reproduzierbar in 5 von 5 Läufen — kein
 * Rauschen. Genau diese Nähe zur Fenstergrenze IST der Defekt: sie macht das
 * Ergebnis von Pixel-Bruchteilen abhängig, die mit dem Wortlaut nichts zu tun
 * haben.
 *
 * WARUM DAS EIN TOR-DEFEKT IST UND KEINE S2-REGRESSION: Nullprobe auf dem
 * Basis-Commit 788e4d4a5 (eigener Worktree, frisch gesetzte Baseline, derselbe
 * Rechner) — 2/2 GRÜN. Dieselbe Nullprobe gegen die COMMITTETE Baseline riss
 * 2/2 mit «Expected an image 640px by 856px, received 640px by 857px», also mit
 * genau dem notierten Wackler. Vor S2 war der Artikel 856/857 px hoch und passte
 * in KEINER Hülle ins 900er Fenster — beide wurden scrollend aufgenommen, also
 * gleich behandelt, also grün. S2 verkleinert die Schrift (18 → 17 px) und damit
 * den Artikel auf 785 px: seither passt V1 und V3 nicht, und die Ungleichheit
 * wird sichtbar. Das Tor hing an einem Zufall — dass beide Hüllen auf derselben
 * Seite der Fenstergrenze lagen.
 *
 * DER FIX ist derselbe Gedanke, mit dem die Spec schon die BREITE erzwingt: was
 * die Messung nicht beweisen will, darf sie nicht mitmessen. Passt der Artikel in
 * beiden Hüllen ganz ins Fenster, entsteht beide Male eine Aufnahme ohne Scroll,
 * bei identischer Phase. Der Wert deckt den höchsten Mess-Artikel (OR 336c)
 * plus den V3-Versatz plus Kopfhöhe mit Reserve.
 * WÄCHTER: passt ein künftiger Mess-Artikel doch nicht mehr, schlägt die
 * Zusicherung unten zu — der Defekt kommt dann als Fehlschlag zurück und nicht
 * als stille Pixel-Abweichung (§6.7).
 *
 * NACHZUG BEI DER VEREINIGUNG MIT H3 (17.8.2026) — 1800 → 2400: der Wächter
 * meldete «Artikel endet bei y=1800.27 px», also 0.27 px über der Fenstergrenze,
 * und das in EINEM von ZWEI Läufen. Genau die Grenzwertigkeit, die der Wurzel-Fix
 * oben abschaffen wollte, war zurück — nur eine Etage höher: 1800 war knapp auf
 * den damaligen Stand gerechnet, und H3 (Bezüge-Zeile → Zähler) plus die
 * S2-Beiwerk-Zone verschieben den Artikel-ANFANG nach unten. Gemessen 17.8. am
 * vereinigten Stand: OR 336c war im Messfenster 1302 px hoch (StPO 429: 742 px),
 * der Artikel-ANFANG liegt je nach Beiwerk-/Zähler-Zustand zwischen y = 323.5 und
 * y ≈ 498, die Unterkante damit bis 1800.27 px. 2400 lässt rund 600 px Reserve
 * gegen diese Streuung. Seit das Beiwerk aus der Messung genommen ist (s.
 * `artikelBild`) ist der gemessene Artikel nur noch 1058.55 bzw. 647.33 px hoch —
 * die Reserve ist damit noch grösser, und der Deckel bleibt trotzdem stehen: er
 * soll gegen KÜNFTIGE Mess-Artikel schützen, nicht bloss gegen die heutigen zwei.
 *
 * UND EIN ZWEITER GRUND FÜR REICHLICH RESERVE, gemessen beim Rot-Beweis: die
 * Artikelhöhe ist nicht fensterunabhängig. Bei Fenster 1000 misst OR 336c 1345 px,
 * bei 1800 und 2400 je 1302 px. Ein Messfenster, das nur knapp reicht, misst also
 * nicht bloss riskant, es misst potenziell einen ANDEREN Artikel. Zwischen 1800 und
 * 2400 ist der Wert stabil — der neue Deckel liegt im stabilen Bereich, nicht an
 * seiner Kante.
 *
 * WARUM DAS KEINE LOCKERUNG IST: `MESS_HOEHE_PX` ist die FENSTERHÖHE der Messung,
 * kein Timeout und keine Pixel-Toleranz. Die Zusage des Tors bleibt Wort für Wort
 * dieselbe (`maxDiffPixelRatio: 0.001`), und der Wächter unten bleibt ein
 * `toBeLessThanOrEqual` — er kann weiterhin rot werden (Rot-Beweis im
 * Vollzugsvermerk: Fenster auf 1000 ⇒ «Artikel endet bei y=…, passt nicht ins
 * 1000-px-Fenster»). Ein grösseres Fenster misst MEHR vom Artikel ohne Scroll,
 * nicht weniger genau.
 */
const MESS_HOEHE_PX = 2400

async function artikelBild(page: Page, pfad: string, artId: string) {
  await page.setViewportSize({ width: 1440, height: MESS_HOEHE_PX })
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

      // ── DAS BEIWERK AUS DER MESSUNG NEHMEN (Vereinigung mit H3, 17.8.2026) ──
      // Dieses Tor heisst «der TEXT-KERN ist in V1 und V3 pixelgleich». Das
      // Beiwerk (`data-beiwerk`) ist ausdrücklich NICHT der Text-Kern: es ist der
      // Apparat unter dem Wortlaut, und H3 hat ihn in den beiden Hüllen bewusst
      // verschieden besetzt — V1 zeigt dort die Leitentscheide-Zeile, V3 hat sie
      // in den Zähler/das Panel verlegt und zeigt die Fassungs-Zeile.
      //
      // GEMESSEN 17.8.2026 am vereinigten Stand (StPO 429 · OR 336c, je 640 px):
      //   MIT Beiwerk    V1 784.92 / 1344.81   V3 740.92 / 1300.81   → 44 px Diff
      //   OHNE Beiwerk   V1 647.328125 / 1058.546875
      //                  V3 647.328125 / 1058.546875 → auf den Subpixel GLEICH
      // Der Text-Kern ist also identisch, und zwar exakt. Die einzige Abweichung
      // ist der Apparat, und die ist gewollt.
      //
      // WARUM NICHT «BASELINE NEU AUFNEHMEN»: die Spec hält bewusst EINE
      // Baseline-Datei für BEIDE Hüllen (s. Schritt 2 im Test unten). Eine
      // Divergenz zwischen den Hüllen ist damit durch kein Neuaufnehmen heilbar —
      // `--update-snapshots` schreibt schlicht die Hülle, die zuletzt lief, und
      // die andere wird rot. Gemessen: nach dem Neuaufnehmen kippte der Fehler von
      // «erwartet 786, erhalten 742» auf «erwartet 742, erhalten 786». Ein Tor,
      // das unabhängig vom Code immer rot ist, sagt so wenig wie eines, das nie
      // rot werden kann (§6.7) — beide muss man reparieren, nicht nachziehen.
      //
      // WARUM DAS AUSBLENDEN KEINE LOCKERUNG IST: es ist derselbe Gedanke, mit dem
      // diese Spec schon die BREITE klemmt — was die Messung nicht beweisen will,
      // darf sie nicht mitmessen. Danach vergleicht das Tor wieder GENAU seine
      // Zusage, und es KANN wieder rot werden (Rot-Beweis im Vollzugsvermerk).
      // ABGRENZUNG, damit hier keine Deckungslücke entsteht: die Geometrie des
      // Beiwerks ist nicht ungedeckt, sie ist woanders gedeckt — `leser-marken-
      // geometrie.e2e.ts` und die S2-Typografie-Fälle messen sie eigens. PX deckt
      // den Wortlaut-Körper.
      for (const bw of el.querySelectorAll('[data-beiwerk]')) {
        (bw as HTMLElement).style.setProperty('display', 'none', 'important')
      }
    }
  }, { id: artId, breite: MESS_BREITE_PX })

  await art.scrollIntoViewIfNeeded()
  await beruhige(page)

  // ── SUBPIXEL-PHASE DER BEIDEN HÜLLEN GLEICHSETZEN (17.8.2026) ──────────────
  // Der letzte Rest des «1-px-Höhen-Wacklers», und der eigentliche Grund für ihn.
  // Playwright greift ein Element von `floor(top)` bis `ceil(top + height)`. Die
  // HÖHE ist in beiden Hüllen auf den Subpixel gleich (OR 336c: 1058.5469 px in
  // V1 UND V3) — aber die y-POSITION liegt auf verschiedenen Subpixel-Phasen, und
  // damit fällt die Rundung verschieden aus. Gemessen 17.8., vier Läufe in Folge
  // identisch (also kein Rauschen, sondern Struktur):
  //     V1  top 369.9375  (frac 0.9375)  → Bild 1060 px
  //     V3  top 156.1719  (frac 0.1719)  → Bild 1059 px
  // Dieselbe Höhe, ein Pixel Unterschied, rein aus der Phase. Ohne diese Zeilen
  // riss der Fall in 3 von 5 Läufen mit «Expected 1060px, received 1059px».
  //
  // DER FIX ist wieder derselbe Gedanke wie Breiten-Klemme und Fenster-Deckel: die
  // Phase ist nichts, was die Messung beweisen will, also darf sie nicht
  // mitmessen. Der Artikel wird um seinen eigenen Bruchteil versetzt, bis `top` auf
  // einer ganzen Zahl liegt — danach greifen BEIDE Hüllen exakt `ceil(height)`
  // Gerätepixel, aus derselben Phase.
  //
  // WARUM ÜBER `top` UND NICHT ÜBER DEN SCROLL: `window.scrollBy(0, bruchteil)`
  // wurde zuerst gebaut und griff NICHT — der Browser rastert Scroll-Offsets auf
  // Gerätepixel, übrig blieben 0.296875 (StPO) bzw. 0.625 (OR). Gemeldet hat das
  // der Wächter unten, nicht ein stiller Pixel-Diff; genau dafür ist er da.
  // `#art-…` trägt ohnehin `position: relative` (Klasse `group relative z-0`), ein
  // `top`-Versatz verschiebt darum NUR dieses Element und reflowt nichts: die
  // Zeilenumbrüche im Artikel bleiben Zeichen für Zeichen dieselben, und beide
  // Hüllen landen auf derselben Phase — was verglichen wird, ist unverändert der
  // Wortlaut-Körper.
  await art.evaluate((el) => {
    const rest = el.getBoundingClientRect().top % 1
    if (rest !== 0) (el as HTMLElement).style.setProperty('top', `${-rest}px`, 'important')
  })
  await beruhige(page)

  // WÄCHTER (§6.7): griffe das Gleichsetzen nicht — weil die Seite am Anschlag
  // steht und nicht mehr scrollen kann, oder weil ein künftiger Umbau den Scroll
  // abfängt —, käme der Wackler als stille 1-px-Abweichung zurück. Er soll als
  // Fehlschlag mit Diagnose kommen.
  const phase = await art.evaluate((el) => el.getBoundingClientRect().top % 1)
  expect(phase, `Subpixel-Phase ${phase} statt 0 — das Gleichsetzen griff nicht, die Aufnahme rundet zufällig`)
    .toBe(0)

  // Beweis, dass das Beiwerk WIRKLICH aus der Messung ist (§6.7): würde das
  // Attribut umbenannt, griffe die Schleife oben ins Leere und PX vergliche
  // wieder Apparat — still, und mit dem bekannten 44-px-Versatz. Darum beides
  // zusichern: der Wähler trifft noch etwas, UND das Getroffene ist 0 px hoch.
  const beiwerk = await art.evaluate((el) => {
    const alle = [...el.querySelectorAll('[data-beiwerk]')]
    return { anzahl: alle.length, hoehe: alle.reduce((s, x) => s + x.getBoundingClientRect().height, 0) }
  })
  expect(beiwerk.anzahl, 'kein [data-beiwerk] im Mess-Artikel — Attribut umbenannt? Dann misst PX wieder den Apparat')
    .toBeGreaterThanOrEqual(1)
  expect(beiwerk.hoehe, `Beiwerk noch ${beiwerk.hoehe} px hoch — es steckt weiter in der Messung`)
    .toBe(0)

  // Beweis, dass die Klemme wirklich griff — sonst verglichen wir wieder zwei
  // verschiedene Breiten und merkten es nicht (§6.7).
  const breite = await art.evaluate((el) => Math.round(el.getBoundingClientRect().width))
  expect(breite, `Artikelbreite ${breite} px statt ${MESS_BREITE_PX} px — die Mess-Klemme greift nicht`)
    .toBe(MESS_BREITE_PX)

  // WÄCHTER ZUM WURZEL-FIX (s. MESS_HOEHE_PX): der Artikel muss GANZ ins Fenster
  // passen, sonst nimmt Playwright ihn scrollend auf — und genau die Ungleichheit
  // «eine Hülle passt, die andere nicht» war der Defekt, den S2 aufgedeckt hat.
  // Ohne diese Zusicherung käme ein künftig höherer Mess-Artikel wieder als
  // stille Pixel-Abweichung zurück statt als Fehlschlag mit Diagnose.
  const lage = await art.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { oben: r.top, unten: r.bottom, hoehe: r.height, fenster: window.innerHeight }
  })
  expect(lage.oben, `Artikel beginnt bei y=${lage.oben} px, also oberhalb des Fensters`).toBeGreaterThanOrEqual(0)
  expect(
    lage.unten,
    `Artikel endet bei y=${Math.round(lage.unten)} px und passt damit nicht ins ${lage.fenster}-px-Fenster `
    + `(Höhe ${Math.round(lage.hoehe)} px). Playwright nähme ihn scrollend auf; die Aufnahme wäre nicht mehr `
    + `phasengleich zur anderen Hülle. MESS_HOEHE_PX erhöhen und die Baseline deklariert neu setzen.`,
  ).toBeLessThanOrEqual(lage.fenster)
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
// 0.001.
//
// NACHZUG-KORREKTUR 17.8.2026 (Architektur-Prüfer 4): der Halbsatz «und die
// Baseline ist nicht neu aufgenommen worden» galt bis S1 und ist mit S2 FALSCH
// geworden. S2 ändert die Typografie des Lesekörpers absichtlich (F3 = V2,
// Entscheid David 17.8.2026) und setzt die Baseline darum DEKLARIERT neu — mit
// beigelegtem Vorher-Bild in
// `docs/ux-audit-2026-07/reader/leser-v3-s2/vorher/px-*-VORHER-s1-baseline.png`
// und der Messbedingung im Vollzugsvermerk S2. Der S2-NACHZUG setzt sie ein
// zweites Mal, weil die Marken-Geometrie (Ä61 lit.-Spalte, Ä62 Marken-Waisen)
// den Textkörper erneut verändert; das zugehörige Vorher-Bild liegt im
// Unterordner `vorher/` derselben Etappe. Neu gesetzt wird ausschliesslich die
// BASELINE, nie die Toleranz (§6).
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
// DER 1-PX-HÖHEN-WACKLER IST BEHOBEN — hier stand bis S2 «OFFEN BLEIBT ZWEITENS
// …, der Wurzel-Fix ist eigene Arbeit und ausdrücklich NICHT in dieser Etappe
// erledigt». Das ist überholt (Nachzug-Korrektur 17.8.2026, Architektur-Prüfer 4):
// die Diagnose und der Fix stehen vollständig im Kopf dieser Datei bei
// `MESS_HOEHE_PX`. Kurzfassung, damit hier keine zweite Wahrheit entsteht (§5):
// der Wackler («Expected an image 640px by 856px, received 640px by 857px») kam
// nicht von gebrochenen Artikelhöhen, sondern davon, dass der Mess-Artikel bei
// Fensterhöhe 900 GENAU auf der Fenstergrenze lag — Playwright nimmt ein nicht
// passendes Element scrollend auf, und die Rasterung der 11-px-Schriften
// verschiebt sich dabei (1869 px Abweichung, 5/5 reproduzierbar). Fix:
// `MESS_HOEHE_PX = 1800` — derselbe Gedanke wie die erzwungene BREITE — plus der
// Wächter in `artikelBild`, der rot wird, wenn ein künftiger Mess-Artikel doch
// nicht mehr ins Fenster passt. Nullprobe auf der Basis `788e4d4a5` 2/2 grün.
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
