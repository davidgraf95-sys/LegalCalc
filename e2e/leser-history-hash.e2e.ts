// W2·17-UI-BEFUNDE-B2 · Los G — History und Scroll im Gesetzes-Leser.
//
// LM-199: «Zurück» mit stehendem #hash in der URL. Der Einstiegs-Anker (Deep-
// Link) ist nach dem ersten Sprung VERBRAUCHT — kehrt man per Browser-Zurück aus
// einer anderen Route auf den Eintrag zurück, muss die A16-Anker-Restauration
// (letzte Leseposition) gewinnen, nicht der alte Hash. Prod-Messung 2.8.2026:
// mit stehendem Hash landete «Zurück» ~149'000 px daneben (am Hash-Artikel).
// Ohne Hash war A16 korrekt — der Fall hier ergänzt die bestehenden A16-Tests
// (leser-position-u.e2e.ts), er ersetzt sie nicht.
//
// LM-201: Wechsel auf eine kürzere Seite ohne anstehende Restauration beginnt
// oben — SYNCHRON vor dem ersten Paint, ohne Zwischenzustand «neues (kurzes)
// Dokument + alte/geklemmte Scrollposition» (Prod-Messung: Ankunft bei y=2'520
// auf 3'249 px Dokumenthöhe, +15 ms Zwischenzustand belegt).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// ── LM-199: Zurück auf einen Eintrag MIT stehendem #hash ⇒ Anker gewinnt ─────
test.describe('LM-199 — Zurück mit stehendem #hash: Leseposition, nicht Einstiegs-Anker', () => {
  test('AIG#art-90 → zu Art. 5 gescrollt → StGB → Zurück ⇒ Art. 5 im Viewport (nicht Art. 90)', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    // Einstieg per Deep-Link: der Hash-Sprung selbst muss funktionieren (Wächter
    // gegen Über-Unterdrückung — ein frischer Deep-Link bleibt ein Sprungziel).
    await page.goto('/gesetze/bund/AIG#art-90')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AIG')
    await expect(page.locator('#art-90')).toBeInViewport({ timeout: 20000 })

    // Organisch weg vom Einstiegs-Anker zu Art. 5 scrollen (Anker-Erfassung).
    const art5 = page.locator('#art-5')
    await expect(art5).toBeAttached({ timeout: 20000 })
    await art5.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250) // Anker-Scroll-Listener (rAF) erfassen lassen
    await expect(art5).toBeInViewport()

    // Cross-Erlass-Navigation wie im A16-Bestandstest: Fremdverweis-Popover
    // (StGB) → «Im Gesetz öffnen» (SPA-Navigation, echter History-Eintrag).
    const stgbLink = art5.locator('a[href*="54/757_781_799"][href*="#art_66_a"]:not([href*="66_a_bis"])').first()
    await expect(stgbLink).toBeVisible({ timeout: 10000 })
    await stgbLink.click()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    const oeffnen = dialog.getByRole('link', { name: /Im Gesetz öffnen/ })
    await expect(oeffnen).toBeVisible()
    await oeffnen.click()
    await expect(page).toHaveURL(/\/gesetze\/bund\/STGB/i, { timeout: 15000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('StGB', { timeout: 15000 })

    // ZURÜCK: der History-Eintrag trägt noch «#art-90» — der ist verbraucht.
    // Massgeblich ist die verlassene Leseposition (Art. 5), nicht der Einstieg.
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AIG', { timeout: 15000 })
    await expect(page.locator('#art-5')).toBeInViewport({ timeout: 15000 })
    await expect(page.locator('#art-90')).not.toBeInViewport()
    // Kein Hash-Sync (§Z Ziff. 7): die URL wird dabei NICHT umgeschrieben.
    await expect(page).toHaveURL(/#art-90$/)
    expect(fehler).toEqual([])
  })

  test('Intra-Dokument-Zurück (MWSTG Art. 5 → 31 → zurück) bleibt ein Hash-Sprung', async ({ page }) => {
    // Wächter: die LM-199-Unterdrückung gilt NUR beim Rückweg aus einer ANDEREN
    // Route. Innerhalb desselben Dokuments (gleiche Reiter-Identität) bleibt der
    // Hash beim Zurück das Sprungziel (deckungsgleich mit A16, leser-position-u).
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/MWSTG#art-5')
    await expect(page.locator('#art-5')).toBeInViewport({ timeout: 20000 })
    const link31 = page.locator('a[href="/gesetze/bund/MWSTG#art-31"]').first()
    await expect(link31).toBeVisible({ timeout: 10000 })
    await link31.click()
    await expect(page.locator('#art-31')).toBeInViewport({ timeout: 10000 })
    await page.goBack()
    await expect(page.locator('#art-5')).toBeInViewport({ timeout: 10000 })
    expect(fehler).toEqual([])
  })
})

