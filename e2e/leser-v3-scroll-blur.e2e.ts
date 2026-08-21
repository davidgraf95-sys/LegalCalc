// @shard-gruppe: 8
// ─── Scroll-Blur an der Lesespalte (Auftrag David 21.8.2026) ────────────────
//
// Zwei dezente Verlaufskanten (CSS-Gradient, `bg-paper` → transparent) am
// Kopf-Unterrand (wo `--nt-stick` endet) und am unteren Viewport-Rand der
// Lesespalte — Text verschwindet sanft unter dem klebenden Kopf statt hart zu
// schneiden (LeserLeseZeile.tsx). Reines CSS (§15, keine Scroll-Handler):
// `position: sticky` folgt automatisch dem jeweils näheren Scroll-Container
// (Fenster in der Einzelansicht, `overflow-y-auto`-Pane im Split-View).
import { test, expect } from '@playwright/test'

test.describe('Scroll-Blur an der Lesespalte (V3)', () => {
  test('obere/untere Verlaufskante: sticky, korrekt verankert, Gradient auf `paper`, kein Layout-Einfluss', async ({ page }) => {
    await page.goto('/gesetze/bund/OR?leser=v3')
    const spalte = page.locator('#lc-lesespalte')
    await expect(spalte).toBeVisible({ timeout: 20_000 })

    // Die beiden Träger sind die Geschwister der Lesespalten-Zelle — direkte
    // Kinder desselben Wrappers (`relative min-w-0`, LeserLeseZeile.tsx).
    const zelle = spalte.locator('xpath=../..')
    const traeger = zelle.locator('> div')
    await expect(traeger).toHaveCount(3) // oben-Träger · Zelle (space-y-5) · unten-Träger
    const oben = traeger.first()
    const unten = traeger.last()

    // Kein Layout-Einfluss (kein CLS): beide Träger nehmen im Fluss 0 Höhe ein.
    await expect(oben).toHaveCSS('height', '0px')
    await expect(unten).toHaveCSS('height', '0px')
    await expect(oben).toHaveCSS('position', 'sticky')
    await expect(unten).toHaveCSS('position', 'sticky')
    await expect(unten).toHaveCSS('bottom', '0px')
    // `top` folgt `--nt-stick` — dieselbe Grösse, an der der Kopf klebt (nie
    // 0, sonst läge der Streifen unter statt am Kopf-Unterrand).
    const obenTop = await oben.evaluate((el) => parseFloat(getComputedStyle(el).top))
    expect(obenTop).toBeGreaterThan(0)

    // Beide Streifen sind reine Dekoration: nicht klickbar, für Screenreader
    // unsichtbar, im Druck ganz weg.
    await expect(oben).toHaveAttribute('aria-hidden', 'true')
    await expect(oben).toHaveCSS('pointer-events', 'none')
    await expect(oben).toHaveClass(/print:hidden/)
    await expect(unten).toHaveClass(/print:hidden/)

    // Gradient auf dem Token `paper`, nicht auf einem Hex-Literal — beide
    // Themes prüft die Sichtprüfung (Scratchpad-Screenshots), hier nur die
    // strukturelle Zusicherung: ein Gradient ist gesetzt.
    const obenGradient = await oben.locator('> div').first().evaluate((el) => getComputedStyle(el).backgroundImage)
    expect(obenGradient).toContain('gradient')
  })

  test('Split-View: derselbe Streifen funktioniert im Pane (eigener Scroll-Container)', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen (Muster leser-v3-eine-kopfzeile.e2e.ts)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"] #lc-lesespalte')).toBeVisible({ timeout: 20_000 })
    const spalte = page.locator('[data-pane="sekundaer"] #lc-lesespalte')
    const oben = spalte.locator('xpath=../..').locator('> div').first()
    await expect(oben).toHaveCSS('position', 'sticky')
    await expect(oben).toHaveCSS('height', '0px')
  })
})
