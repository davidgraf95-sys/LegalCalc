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
 * sie erst nach 2400 ms zurück. Beim ersten Lauf mit erzwungen gleicher Breite
 * blieben genau daran 40 276 Pixel (ratio 0.05) Unterschied hängen, obwohl
 * Inhalt und Geometrie beider Hüllen NACHWEISLICH identisch waren: Höhe 1526 px,
 * `font-size` 16 px, `line-height` 25.6 px, 8 Fussnoten-Marker, 1 Apparat,
 * dieselben Optionen `an/fussnoten/an`, 3145 Zeichen Text — in V1 wie in V3.
 * Die Hüllen unterschieden sich nur darin, WANN der Puls relativ zum Bild
 * verklungen war.
 *
 * Darum beides: die Klasse aktiv entfernen UND lange genug warten. Die Klasse
 * nur zu entfernen genügte nicht, weil der Timer sie nicht neu setzt, ein
 * später eintreffender zweiter Sprung aber schon.
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

// ═══ BEFUND DES ERSTEN LAUFS — und warum das Tor jetzt anders schneidet ═════
//
// Der erste scharfe Lauf (16.8.2026, macOS, `PX=1`) hat die Zusage aus Kap. 7
// WIDERLEGT, und zwar deterministisch: OR Art. 336c unterscheidet sich zwischen
// V1 und V3 um 40 377 Pixel (ratio 0.05) — in jedem Lauf exakt dieselbe Zahl,
// also kein Rauschen. StPO Art. 429 war pixelgleich.
//
// URSACHE, direkt am DOM nachgemessen @1440 (nicht aus dem Bild geschlossen):
//
//                       V1        V3
//   #lc-lesespalte     874 px    691 px
//   article#art-336_c  744 px    561 px      ⇒ 183 px schmaler
//
// Der Satzspiegel ist in V3 also ENGER, weil die 18-rem-Seitenleiste (Kap. 4b)
// Breite verbraucht, die es in V1 an dieser Stelle nicht gibt. Andere Breite =
// andere Zeilenumbrüche = andere Pixel. Bei StPO Art. 429 fielen die Umbrüche
// zufällig gleich, deshalb war dort nichts zu sehen — genau die Sorte
// Scheingrün, gegen die PX gebaut ist.
//
// DAS IST KEIN FEHLER IM TEST UND KEINER, DEN H2 STILL WEGRÄUMEN DARF.
// «Der Textkörper ändert sich nicht um ein Pixel» und «die neue Hülle hat eine
// 18-rem-Seitenleiste» sind bei gleicher Fensterbreite nicht gleichzeitig
// erfüllbar. Welche der beiden Zusagen weicht, ist eine Gestaltungs- und
// Treue-Frage für David (Satzspiegel!), keine, die eine Bau-Etappe nebenbei
// entscheidet (§7: abweichend umsetzen UND die Abweichung offenlegen). Sie ist
// im Fahrplan als offener Entscheid vermerkt und im PR-Body benannt.
//
// WAS DAS TOR BIS DAHIN LEISTET — bewusst weniger, als Kap. 7 wollte, und
// ausdrücklich so deklariert (§6.7: lieber ein ehrlich schmaleres Tor als eines,
// das eine widerlegte Zusage weiter behauptet): JE HÜLLE eine eigene Baseline.
// Damit ist jede Hülle gegen ihre EIGENE Drift geschützt — ein Refactoring, das
// den Wortlaut verschiebt, fällt sofort auf. Was es NICHT mehr behauptet, ist
// die Gleichheit der beiden untereinander; die steht unter Entscheid.
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
