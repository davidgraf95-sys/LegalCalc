// @shard-gruppe: 6
// ─── Ä1 (LESER-V3 H2b) · KEINE LEERZONE UNTER DER KRUMEN-LEISTE ──────────────
//
// BEFUND, gemessen 17.8.2026 @1440 (StPO, `?leser=v3`): die Krumen-Leiste endet
// bei y = 102, der V3-Kopf begann bei y = 150 — 48 px Leerzone im RUHEZUSTAND,
// die beim ersten Scroll auf 0 px zusammenfiel (dort klebt der Kopf bei y = 100).
// Der Leser sah zwei verschiedene Bilder derselben Kopfzone, je nachdem ob er
// schon gescrollt hatte.
//
// URSACHE: die 48 px sind die obere Polsterung des Route-Wrappers
// (`components/layout/Shell.tsx`, `py-8 sm:py-12`); im Split-View-Pane sind es
// 24 px (`components/layout/Pane.tsx`, `py-6`). Sie gehört dem Seiteninhalt, nicht
// einer klebenden Leiste. Der V3-Kopf verschluckt sie über
// `--leser-v3-kopf-luecke` (Vorgabe in `src/index.css`, Pane-Wert inline vom
// Rahmen).
//
// WARUM DIESE SPEC UND NICHT EINE ZUSICHERUNG: der Wert ist an ZWEI fremde
// Polsterungen gekoppelt, die niemand für den Leser pflegt. Ändert eine davon,
// öffnet sich die Leerzone wieder — still. Die Spec MISST die Lücke auf allen
// drei Breiten gegen 0 statt sie zu behaupten.
//
// ROT ZU BEKOMMEN (§6.7): in `src/pages/gesetz-leser/v3/LeserKopf.tsx` die Zeile
// `marginTop: 'calc(-1 * var(--leser-v3-kopf-luecke, 0px))'` entfernen — dann
// misst der Fall (a) 48 px, (b) 32 px und (c) 24 px statt je 0.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Lücke zwischen der Unterkante der App-Krumen-Leiste und der Oberkante des
 *  V3-Kopfs. Negativ ist erlaubt (der Kopf klebt dann 1–2 px unter der Leiste,
 *  die opak darüber liegt) — eine POSITIVE Lücke ist der Befund. */
async function luecke(page: Page, krumeWahl: string): Promise<number> {
  return page.evaluate((sel) => {
    const krume = document.querySelector(sel)
    const kopf = document.querySelector('[data-v3-kopf]')
    if (!krume || !kopf) return Number.NaN
    return Math.round(kopf.getBoundingClientRect().top - krume.getBoundingClientRect().bottom)
  }, krumeWahl)
}

test.describe('Ä1 — der V3-Kopf sitzt bündig an der Krumen-Leiste', () => {
  test('(a) Einzelansicht @1440: im Ruhezustand UND gescrollt keine Leerzone', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    const ruhe = await luecke(page, '[data-inhalt-kopf]')
    expect(ruhe, `Leerzone im Ruhezustand: ${ruhe} px (war 48 px vor H2b)`).toBeLessThanOrEqual(0)

    // Und im geklebten Zustand ebenfalls — sonst wäre der Ruhezustand nur zufällig
    // richtig und das Bild sprang beim Scrollen weiterhin.
    await page.evaluate(() => window.scrollBy(0, 1200))
    await page.waitForTimeout(300)
    const geklebt = await luecke(page, '[data-inhalt-kopf]')
    expect(geklebt, `Leerzone nach 1200 px Scroll: ${geklebt} px`).toBeLessThanOrEqual(0)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Handy @390: dieselbe Bündigkeit bei kleinerer Wrapper-Polsterung', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    const ruhe = await luecke(page, '[data-inhalt-kopf]')
    expect(ruhe, `Leerzone @390: ${ruhe} px (Wrapper dort py-8 = 32 px)`).toBeLessThanOrEqual(0)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(c) Split-View: der Kopf des Panes sitzt bündig an der Pane-Titelleiste', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 20_000 })

    // Im Pane ist der Bezugspunkt die Pane-Titelleiste (PaneKopf) statt der
    // App-Krume: sie liegt AUSSERHALB des Pane-Scrollers und ist dort die Kante,
    // an der der V3-Kopf klebt (`--leser-v3-kopf-top: 0`).
    const paneLuecke = await page.evaluate(() => {
      const pane = document.querySelector('[data-pane="sekundaer"]')
      const scroller = pane as HTMLElement | null
      const kopf = pane?.querySelector('[data-v3-kopf]')
      if (!scroller || !kopf) return Number.NaN
      return Math.round(kopf.getBoundingClientRect().top - scroller.getBoundingClientRect().top)
    })
    expect(paneLuecke, `Leerzone im Pane: ${paneLuecke} px (Wrapper dort py-6 = 24 px)`)
      .toBeLessThanOrEqual(0)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
