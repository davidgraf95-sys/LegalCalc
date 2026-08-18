// @shard-gruppe: 5
// ─── H3 · Öffnen und Schliessen des Panels bewegt den Lesekörper nicht ───────
//
// WAS GEMESSEN WIRD, und warum GENAU das:
//
//  (1) SENKRECHTE RUHE. Die y-Koordinaten der Artikel im Lesekörper sind vor und
//      nach dem Öffnen identisch. Das ist die harte Zusage: ein Panel, das den
//      Text nach unten schiebt, hat die Leseposition verloren — beim Öffnen und
//      beim Schliessen noch einmal.
//
//  (2) KEIN NEUUMBRUCH. Die BREITE der Lesespalte bleibt gleich. Das Panel ist
//      in jeder Breite ein Blatt ÜBER der Fläche und nimmt dem Text darum keine
//      Spalte weg (Rechnung dazu im Rahmen, «KEINE DRITTE SPUR»). Ein Panel, das
//      den Satzspiegel verstellte, bräche den Normtext auf jeder Zeile neu um —
//      §1 zufolge nie zulässig als Nebenwirkung eines Beiwerk-Fensters. Diese
//      Zusage muss gemessen bleiben, auch wenn die angedockte Spalte später
//      kommt: sie ist dann die Stelle, an der sie brechen würde.
//
//  (3) LAYOUT-SHIFT OHNE EINGABE, IM LESEKÖRPER. Die `layout-shift`-Einträge
//      mit `hadRecentInput === false`, deren Quelle im Lesekörper liegt, bleiben
//      bei 0. `hadRecentInput` IST der CLS-Begriff: eine vom Nutzer ausgelöste
//      Bewegung zählt nicht, eine unangekündigte schon. Gemessen wird darum das,
//      was nach dem Klick von selbst passiert — namentlich das Einwachsen der
//      nachgeladenen Daten. Das ist die eigentliche Gefahr des Nachladens
//      (Kap. 7). Zur Quellen-Filterung siehe `shiftBeobachten`.
//
// WARUM DER ZÄHLER JE ARTIKEL NICHT IN H3 GEBAUT IST, steht in
// `v3/LeserLesespalte.tsx`: er erschiene erst nach dem Öffnen und dann an jedem
// Artikel gleichzeitig — ein Sprung über das ganze Dokument, den genau diese
// Spec verbieten würde. Er gehört in die höhenfeste Beiwerk-Zone von S2.
//
// ROT GESEHEN (§6.7, 17.8.2026, gemessen an einem Zwischenstand, in dem das
// Panel noch als Spalte andocken konnte): die Andock-Schwelle von 1344 auf 1024
// gesenkt ⇒ Fall (a) rot mit «Artikel senkrecht verschoben:
// 883,1162,1514,1961,2241 → 1064,1402,1890,2624,2991». Lehrreich am Rot: eine zu
// knappe Lesespalte bricht den Normtext neu um, und der Umbruch schiebt jeden
// folgenden Artikel NACH UNTEN — der Reflow zeigt sich zuerst in der SENKRECHTEN
// Achse. Fall (1) misst damit den Fall (2) mit, und die Spec bleibt scharf, wenn
// die angedockte Spalte später doch gebaut wird.
// NICHT rot wird die Spec durch eine blosse WAAGRECHTE Verschiebung des
// Textblocks: die ist input-ausgelöst, also kein CLS, und die Fahrplan-Zusage
// lautet «kein Sprung», nicht «keine Bewegung».
import { test, expect, type Page } from '@playwright/test'
import { panelAufziehen } from './helpers/panelOeffnen'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Geometrie des Lesekörpers: Breite der Spalte + y der ersten fünf Artikel. */
async function geometrie(page: Page): Promise<{ breite: number; ys: number[] }> {
  return page.evaluate(() => {
    const spalte = document.querySelector('#lc-lesespalte')
    const arts = [...document.querySelectorAll('#lc-lesespalte article')].slice(0, 5)
    return {
      breite: Math.round(spalte?.getBoundingClientRect().width ?? -1),
      ys: arts.map((a) => Math.round(a.getBoundingClientRect().top + window.scrollY)),
    }
  })
}

/**
 * Summe der `layout-shift`-Einträge OHNE kürzliche Eingabe, GEFILTERT auf
 * Quellen IM LESEKÖRPER.
 *
 * WARUM GEFILTERT (Befund 17.8.2026, erster Batterie-Lauf mit 5 Workern): ohne
 * Filter zählte die Messung die Shifts der GANZEN Seite und schlug mit 0.0174
 * an, obwohl weder y noch Breite der Artikel sich bewegt hatten. Der Wert liegt
 * exakt in der Grössenordnung, die S3 für das Seiten-Chrom gemessen hat
 * (0.0087 @1280 · 0.019 @390 für die ganze V3-Seite, «die Shift-Quellen liegen
 * laut `sources` im Seiten-Chrom, nicht im Kopf») — er war also nie eine Aussage
 * über das Panel. Eine Schwelle gegen eine fremde Grundlast ist ein Tor, das
 * beim ersten Nachbarn-Umbau rot wird und dann gelockert würde (§6.7); der
 * Wurzelfix ist, das Richtige zu messen.
 *
 * `sources[].node` nennt das verschobene Element. Gezählt wird ein Eintrag nur,
 * wenn mindestens eine Quelle im Lesekörper liegt — genau die Zusage dieser Spec.
 */
async function shiftBeobachten(page: Page): Promise<void> {
  await page.evaluate(() => {
    ;(window as unknown as { __shift: number }).__shift = 0
    const imLesekoerper = (knoten: Node | null | undefined): boolean => {
      const spalte = document.querySelector('#lc-lesespalte')
      return !!spalte && !!knoten && spalte.contains(knoten)
    }
    new PerformanceObserver((liste) => {
      const eintraege = liste.getEntries() as unknown as {
        value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[]
      }[]
      for (const e of eintraege) {
        if (e.hadRecentInput) continue
        if (!(e.sources ?? []).some((q) => imLesekoerper(q.node))) continue
        ;(window as unknown as { __shift: number }).__shift += e.value
      }
    }).observe({ type: 'layout-shift', buffered: false })
  })
}

async function shiftLesen(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __shift: number }).__shift)
}

test.describe('H3 — kein Layout-Sprung im Lesekörper', () => {
  test('(a) D @1440: Öffnen und Schliessen lassen y und Breite unverändert', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    // Erst nach Ruhe messen: der Erlass-Kopf und die Gliederung wachsen beim
    // ersten Laden ohnehin ein, und das ist nicht die gemessene Frage.
    await page.waitForTimeout(600)

    const vorher = await geometrie(page)
    expect(vorher.ys.length, 'keine Artikel gefunden — die Messung prüfte nichts').toBeGreaterThan(0)
    await shiftBeobachten(page)

    await page.locator('[data-v3-panel-zaehler]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible()
    // Auf das NACHGELADENE warten: erst dann ist die eigentliche Sprungquelle
    // vorbei (die Fundstellen-Liste wächst in das Panel ein).
    await expect(page.locator('[data-v3-panel] [data-v3-panel-gruppe]').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)

    const offen = await geometrie(page)
    expect(offen.ys, `Artikel senkrecht verschoben: ${vorher.ys} → ${offen.ys}`).toEqual(vorher.ys)
    expect(offen.breite, `Lesespalte neu umgebrochen: ${vorher.breite} → ${offen.breite} px`).toBe(vorher.breite)

    await page.locator('[data-v3-panel-zu]').click()
    await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    await page.waitForTimeout(400)
    const zu = await geometrie(page)
    expect(zu.ys).toEqual(vorher.ys)
    expect(zu.breite).toBe(vorher.breite)

    const shift = await shiftLesen(page)
    expect(shift, `unangekündigter Layout-Shift ${shift} (Schwelle 0.01)`).toBeLessThan(0.01)
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('(b) H @390: das Blatt liegt über dem Text und bewegt ihn nicht', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const vorher = await geometrie(page)
    await shiftBeobachten(page)
    // Vorbedingung, nicht die Sachaussage dieses Tests: WO der Öffner auf `mini`
    // steht. Bis H4-II stand hier `toHaveCount(0)` — die Kopfzeile trug auf
    // diesem Zuschnitt keinen Zähler (Ä11), und seit dem H3-Nachzug auch keine
    // Randlasche mehr (Ä53: sie lag 16 px im Normtext); der Öffner war der
    // Menü-Eintrag. Genau das war der NM-2-Blocker — zwei Taps statt einem.
    // Seit H4-II trägt die Kopfzeile hier den Chip «⚖ N», und zwar GENAU EINEN
    // (zwei Öffner für eine Fläche waren Ä56). Die geprüfte Zusage darunter —
    // das Blatt bewegt den Lesetext nicht — ist unberührt (§6.3).
    await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(1)
    await panelAufziehen(page)
    await page.waitForTimeout(600)

    const offen = await geometrie(page)
    expect(offen.ys, `Artikel senkrecht verschoben: ${vorher.ys} → ${offen.ys}`).toEqual(vorher.ys)
    expect(offen.breite, `Lesespalte verändert: ${vorher.breite} → ${offen.breite} px`).toBe(vorher.breite)
    const shift = await shiftLesen(page)
    expect(shift, `unangekündigter Layout-Shift ${shift}`).toBeLessThan(0.01)
    expect(fehler, fehler.join('\n')).toEqual([])
  })
})
