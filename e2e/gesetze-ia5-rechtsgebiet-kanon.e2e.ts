// IA-5 (W2·5d · FAHRPLAN-GESETZES-UX §11.4 Ziff. 2) — Rechtsgebiet-Parameter-
// Kanonisierung: `?ansicht=rechtsgebiet` bleibt auflösbarer Alias (A15: «Tür
// bleibt zusätzlich erreichbar, NICHT entfernt»), wird aber beim Parse auf den
// EINEN kanonischen Zustand `?gliederung=rechtsgebiet` (A15-Mechanik, Bund-
// Säule) normalisiert — client-seitig, kein Router-Redirect (Leitplanke E.4).
// Die Erreichbarkeits-Pins selbst leben UNANGEPASST in
// gesetze-uebersicht-u.e2e.ts:112 und gesetze-rechtsgebiet-g6.e2e.ts:62.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('IA-5 — ?ansicht=rechtsgebiet → kanonisch ?gliederung=rechtsgebiet', () => {
  test('Alt-URL löst auf UND wird kanonisch normalisiert (Umschalter zeigt die Wahl)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze?ansicht=rechtsgebiet')
    const main = page.getByRole('main')
    // Inhalt der alten Tür: beide Ebenen der Rechtsgebiets-Sicht rendern.
    await expect(main.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Grundgerüst nach Rechtsgebiet' })).toBeVisible()
    // Kanonische Form: EIN Zustand `?gliederung=rechtsgebiet`, der Alias ist ersetzt.
    await expect(page).toHaveURL(/gliederung=rechtsgebiet/)
    await expect(page).not.toHaveURL(/ansicht=/)
    // A15-Mechanik: der bestehende Gliederungs-Umschalter trägt den Zustand.
    await expect(main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Rechtsgebiet' }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(fehler).toEqual([])
  })

  test('Nach der Normalisierung normal umschaltbar: Systematisch zeigt die amtliche Ordnung', async ({ page }) => {
    await page.goto('/gesetze?ansicht=rechtsgebiet')
    const main = page.getByRole('main')
    await main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Systematisch' }).click()
    await expect(main.getByRole('button', { name: 'Alle aufklappen' })).toBeVisible()
    await expect(page).toHaveURL(/gliederung=systematisch/)
    await expect(page).not.toHaveURL(/ansicht=/)
  })

  test('Alias räumt eine widersprüchliche Ebenen-Wahl (alte Tür = Bund-Querschnitts-Sicht)', async ({ page }) => {
    await page.goto('/gesetze?ansicht=rechtsgebiet&ebene=kanton&kt=BS')
    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()
    await expect(page).toHaveURL(/ebene=bund/)
    await expect(page).not.toHaveURL(/kt=BS/)
  })
})
