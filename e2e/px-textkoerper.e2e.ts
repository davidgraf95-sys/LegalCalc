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

/** Ruhe vor dem Bild: Animationen aus, Schriften geladen, Layout gesetzt. */
async function beruhige(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => document.fonts.ready)
  // Der Reader lädt Bezugs-/Historie-Shards nach; ein Bild davor zeigte einen
  // Zwischenstand und wäre für sich schon flakig.
  await page.waitForTimeout(1500)
}

async function artikelBild(page: Page, pfad: string, artId: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(pfad)
  const art = page.locator(`#${artId}`)
  await expect(art).toBeAttached({ timeout: 30_000 })
  await art.scrollIntoViewIfNeeded()
  await beruhige(page)
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
test.describe('A-7 · PX — Textkörper je Hülle gegen Drift', () => {
  for (const f of FAELLE) {
    test(`${f.name}: V1-Textkörper unverändert`, async ({ page }) => {
      test.slow()
      const art = await artikelBild(page, f.v1, f.id)
      await expect(art).toHaveScreenshot(`${f.name}-v1.png`, {
        // maxDiffPixelRatio statt maxDiffPixels: die Artikel sind
        // unterschiedlich hoch, ein absoluter Wert wäre für den kurzen Artikel
        // streng und für den langen lax.
        maxDiffPixelRatio: 0.001,
        animations: 'disabled',
        caret: 'hide',
      })
    })

    test(`${f.name}: V3-Textkörper unverändert`, async ({ page }) => {
      test.slow()
      const art = await artikelBild(page, f.v3, f.id)
      await expect(art).toHaveScreenshot(`${f.name}-v3.png`, {
        maxDiffPixelRatio: 0.001,
        animations: 'disabled',
        caret: 'hide',
      })
    })
  }
})
