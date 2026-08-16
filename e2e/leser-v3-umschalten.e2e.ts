// @shard-gruppe: 5
// FAHRPLAN-LESER-V3, FL-6 — Umschalten V1↔V3 verliert nichts. Zwei geteilte
// Wahrheiten dürfen beim Wechsel nicht auseinanderlaufen: der Options-Store
// `lm.leser.optionen` (leserOptionen.ts, §5 — EIN Speicher, KEIN zweiter für
// V3) und der Artikel-Anker in der Adresse (`#art-N`). FL-7-Fussnote: solange
// FL-1…FL-6 gelten, bleibt `inhalt.tsx` (V1) eingefroren — dieser Test prüft
// darum nur, dass V3 sich an die geteilten Wahrheiten hält, nie den V1-Code.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('FL-6 — Umschalten V1 ↔ V3 verliert nichts', () => {
  test('(a) Options-Schalter (Fussnoten aus) ist NACH dem Wechsel auf V1 noch aus — geteilter Store', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    // BGBM: kleiner Erlass mit Fussnoten-Apparat (Präzedenz leser-optionen.e2e.ts).
    await page.goto('/gesetze/bund/BGBM?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first()
    await expect(marker).toBeVisible({ timeout: 15_000 })

    await page.locator('[data-v3-ansicht]').click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await page.getByRole('switch', { name: 'Fussnoten' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus')
    await expect(marker).toBeHidden()

    // Wechsel auf V1 — derselbe Erlass, derselbe localStorage-Origin.
    await page.goto('/gesetze/bund/BGBM?leser=v1')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus')
    // Die Ist-Hülle zeigt denselben Zustand — kein zweiter, unabhängiger Speicher.
    const markerV1 = page.locator('.lc-leser button[aria-label^="Fussnote"]').first()
    await expect(markerV1).toBeHidden({ timeout: 15_000 })

    expect(fehler).toEqual([])
  })

  test('(b) #art-429 bleibt beim Wechsel V3→V1→V3 im Viewport (Erlass + Anker gehen nicht verloren)', async ({ page }) => {
    test.slow() // grosser Erlass (StPO)
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    await page.goto('/gesetze/bund/STPO?leser=v1#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('StPO', { timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    expect(fehler).toEqual([])
  })

  test('(b2) Ansicht-Öffner: `aria-controls` erst, wenn das Panel wirklich da ist (B3)', async ({ page }) => {
    // Bug-Check 16.8.2026: der Öffner trug `aria-controls` auch im Ruhezustand,
    // in dem das Panel gar nicht gerendert wird — eine Id-Referenz ins Leere
    // (axe `aria-valid-attr-value`; ein Screenreader bietet einen Sprung an,
    // der nirgends landet, §8). Geprüft wird der VERTRAG in beiden Zuständen,
    // nicht nur die Abwesenheit des Attributs: im offenen Zustand muss die
    // referenzierte Id auch wirklich existieren, sonst wäre «weg damit» ein
    // Fix, der die Verbindung ganz zerstört.
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })

    const oeffner = page.locator('[data-v3-ansicht]')
    await expect(oeffner).toHaveAttribute('aria-expanded', 'false')
    await expect(oeffner).not.toHaveAttribute('aria-controls', /./)

    await oeffner.click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await expect(oeffner).toHaveAttribute('aria-expanded', 'true')
    const ziel = await oeffner.getAttribute('aria-controls')
    expect(ziel, 'offen ohne aria-controls — die Verbindung fehlt ganz').toBeTruthy()
    await expect(
      page.locator(`[id="${ziel}"]`),
      `aria-controls zeigt auf «${ziel}» — kein solches Element im DOM`,
    ).toHaveCount(1)

    expect(fehler).toEqual([])
  })

  test('(c) Grundzustand: ohne Flag existiert [data-leser-v3="rahmen"] NICHT (R10)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/BGFA')
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)

    expect(fehler).toEqual([])
  })
})
