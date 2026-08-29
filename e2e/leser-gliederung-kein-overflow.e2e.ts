// @shard-gruppe: 5
// W2·19-GLIEDERUNG/S9 — Zusatzpunkt David 9.8.2026: die Leiste darf NICHT von
// links nach rechts scrollbar sein. Kein horizontaler Overflow im
// [data-toc]-Scroller (Baum, Trefferliste, Zonen A/C) — lange Etikette
// (HAdoptÜ-Anhang, tief verschachtelte OR-Zweige) brechen um statt
// überzulaufen oder einen Scrollbalken zu erzeugen. Dieselbe Garantie im
// mobilen Gliederungs-Sheet (eigener Scroller, `[data-gliederung-baum-scroll]`).
// Abnahme-Mass: `scrollWidth <= clientWidth` am Scroller-Container — die
// harte, messbare Fassung von «nicht scrollbar» (ein Scrollbalken selbst ist
// browserabhängig sichtbar/unsichtbar, `scrollWidth` ist es nicht).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

async function keinHorizontalerOverflow(page: Page, selektor: string): Promise<void> {
  const diff = await page.locator(selektor).evaluate((el) => el.scrollWidth - el.clientWidth)
  expect(diff, `${selektor}: scrollWidth (${diff >= 0 ? '+' : ''}${diff}px über clientWidth) darf nicht überlaufen`).toBeLessThanOrEqual(0)
}

test.describe('W2·19-GLIEDERUNG/S9 — Leiste ohne horizontalen Overflow', () => {
  test('Desktop OR, tief aufgeklappter Pfad: [data-toc] überläuft nicht', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    // Hash-Sprung auf einen tief verschachtelten Artikel öffnet den vollen
    // Ahnen-Pfad (5 Ebenen, T1-Kodifikation) — genau der «tief aufgeklappt»-Fall.
    await page.goto('/gesetze/bund/OR#art-530')
    await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 40_000 })
    await expect(page.locator('[data-toc] [data-toc-aktiv]')).toHaveCount(1, { timeout: 40_000 })
    await page.waitForTimeout(500)
    await keinHorizontalerOverflow(page, '[data-toc]')
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('HAdoptÜ (HAUE) — lange Anhang-/Titel-Etikette überlaufen nicht', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/international/HAUE')
    await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 40_000 })
    await page.waitForTimeout(500)
    await keinHorizontalerOverflow(page, '[data-toc]')
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('Mobiles Gliederungs-Sheet — Baum-Scroller überläuft nicht', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/international/HAUE')
    await expect(page.locator('article').first()).toBeVisible({ timeout: 40_000 })
    await page.getByRole('button', { name: /Gliederung/ }).first().click()
    await expect(page.locator('[data-gliederung-sheet]')).toBeVisible({ timeout: 40_000 })
    await page.waitForTimeout(400)
    await keinHorizontalerOverflow(page, '[data-gliederung-baum-scroll]')
    expect(fehler, fehler.join('\n')).toEqual([])
  })
})
