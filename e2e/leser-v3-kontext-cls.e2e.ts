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
//  (2) KEIN NEUUMBRUCH. Auf D bleibt die BREITE der Lesespalte gleich. Genau
//      dafür steht die Schwelle `PANEL_DOCK_PX` (1344 px, gerechnet aus
//      18 rem + 40 rem + 22 rem + zwei Abständen): darunter dockt das Panel
//      nicht an, sondern öffnet als Blatt. Ohne diese Schwelle würde die
//      Lesespalte beim Öffnen unter ihr Mass gedrückt, der Normtext bräche neu
//      um — sichtbar auf jeder Zeile, und §1 zufolge nie zulässig als
//      Nebenwirkung eines Beiwerk-Fensters.
//
//  (3) LAYOUT-SHIFT OHNE EINGABE. Die `layout-shift`-Einträge mit
//      `hadRecentInput === false` bleiben bei 0. Diese Bedingung IST der
//      CLS-Begriff: eine vom Nutzer ausgelöste Bewegung zählt nicht, eine
//      unangekündigte schon. Gemessen wird darum das, was nach dem Klick von
//      selbst passiert — namentlich das Einwachsen der nachgeladenen Daten.
//      Das ist die eigentliche Gefahr des Nachladens (Kap. 7).
//
// WARUM DER ZÄHLER JE ARTIKEL NICHT IN H3 GEBAUT IST, steht in
// `v3/LeserLesespalte.tsx`: er erschiene erst nach dem Öffnen und dann an jedem
// Artikel gleichzeitig — ein Sprung über das ganze Dokument, den genau diese
// Spec verbieten würde. Er gehört in die höhenfeste Beiwerk-Zone von S2.
//
// ROT ZU BEKOMMEN (§6.7): in `v3/LeserRahmenV3.tsx` die dritte Grid-Spur von
// `2.25rem` (geschlossen) auf `0rem` setzen — dann verschiebt sich die
// Lesespalte beim Öffnen um 36 px und Fall (2) wird rot. Oder `PANEL_DOCK_PX`
// auf 1024 senken und @1280 fahren: Fall (2) wird rot, weil die Spalte schmaler
// wird.
import { test, expect, type Page } from '@playwright/test'

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

/** Summe der `layout-shift`-Einträge OHNE kürzliche Eingabe (= CLS-Definition). */
async function shiftBeobachten(page: Page): Promise<void> {
  await page.evaluate(() => {
    ;(window as unknown as { __shift: number }).__shift = 0
    new PerformanceObserver((liste) => {
      for (const e of liste.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __shift: number }).__shift += e.value
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
    // Auf `mini` trägt die Kopfzeile keinen Zähler (Ä11) — die Lasche ist der
    // Öffner, und dass sie es IST, ist Teil der Zusage.
    await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(0)
    await page.locator('[data-v3-panel-lasche]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible()
    await page.waitForTimeout(600)

    const offen = await geometrie(page)
    expect(offen.ys, `Artikel senkrecht verschoben: ${vorher.ys} → ${offen.ys}`).toEqual(vorher.ys)
    expect(offen.breite, `Lesespalte verändert: ${vorher.breite} → ${offen.breite} px`).toBe(vorher.breite)
    const shift = await shiftLesen(page)
    expect(shift, `unangekündigter Layout-Shift ${shift}`).toBeLessThan(0.01)
    expect(fehler, fehler.join('\n')).toEqual([])
  })
})
