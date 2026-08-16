// @shard-gruppe: 1
// FAHRPLAN-LESER-V3, Kap. 4b Pos. 4 (FL-5) — EIN Feld sucht UND springt.
// `SuchSprungFeld.tsx` löst die Eingabe gegen die Artikel-Token auf
// (`loeseArtikelEingabe`, suchTreffer.ts): eine auflösbare Zahl SPRINGT beim
// Enter/Klick, alles andere bleibt die bestehende In-Gesetz-Suche. Esc leert
// nur, springt aber nie (Pos. 14, «recover from mistakes»).
//
// STPO (480 Artikel, Art. 429 «Entschädigung und Genugtuung») ist bewusst
// gewählt: derselbe Artikel beweist sowohl den Zahlen-Sprung (a) als auch,
// dass der Volltextbegriff «Entschädigung» dort real vorkommt (b) — kein
// erfundener Suchbegriff.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const suchFeld = (page: Page) => page.locator('[data-v3-suchsprung] input')

async function oeffneStPO(page: Page): Promise<string[]> {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/gesetze/bund/STPO?leser=v3')
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(suchFeld(page)).toBeVisible({ timeout: 20_000 })
  return fehler
}

test.describe('FL-5 — EIN Feld für Suchen und Springen', () => {
  test('(a) «429» löst auf, Enter springt UNTER die klebende Kopfzeile', async ({ page }) => {
    test.slow() // grosser Erlass (StPO, 480 Art.)
    const fehler = await oeffneStPO(page)

    await suchFeld(page).fill('429')
    const hinweis = page.locator('[data-v3-sprung-hinweis]')
    await expect(hinweis).toBeVisible({ timeout: 10_000 })
    await expect(hinweis).toContainText('429')

    await suchFeld(page).press('Enter')
    const art = page.locator('#art-429')
    await expect(art).toBeInViewport({ timeout: 15_000 })
    await expect(page).toHaveURL(/#art-429$/)

    // Landepunkt: die Oberkante von Art. 429 liegt auf der Unterkante der
    // klebenden Kopfzeile (Risiko R1, `--nt-stick`) — nie negativ (hinter dem
    // Kopf verschwunden), nie deutlich darunter (zu weit gescrollt).
    const kopfBox = await page.locator('[data-v3-kopf]').boundingBox()
    const artBox = await art.boundingBox()
    expect(kopfBox, 'Kopfzeile nicht gefunden').not.toBeNull()
    expect(artBox, 'Art. 429 nicht gefunden').not.toBeNull()
    const artTop = artBox!.y
    const kopfUnterkante = kopfBox!.y + kopfBox!.height
    expect(artTop, `Art. 429 top=${artTop}, Kopf-Unterkante=${kopfUnterkante}`).toBeGreaterThanOrEqual(0)
    expect(Math.abs(artTop - kopfUnterkante), `Abstand Art.-Oberkante zu Kopf-Unterkante`).toBeLessThanOrEqual(8)

    expect(fehler).toEqual([])
  })

  test('(b) Volltext-Begriff «Entschädigung»: kein Sprung-Hinweis, Seitenleiste zeigt Trefferliste', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    await suchFeld(page).fill('Entschädigung')
    // Kein Sprung möglich — «Entschädigung» löst nicht auf keinen Artikel-Token.
    await expect(page.locator('[data-v3-sprung-hinweis]')).toHaveCount(0)

    // Die Seitenleiste wechselt von «Gliederung» auf «Treffer» (Debounce ~200 ms).
    const baumkopf = page.locator('[data-v3-leiste-baumkopf]')
    await expect(baumkopf.locator('h2')).toHaveText('Treffer', { timeout: 10_000 })
    await expect(page.locator('[data-treffer-liste]')).toBeVisible({ timeout: 10_000 })

    expect(fehler).toEqual([])
  })

  test('(c) Esc leert das Feld, springt aber NIE — Scrollposition bleibt exakt stehen', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    // Erst etwas herunterscrollen, damit ein Sprung überhaupt sichtbar wäre.
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.waitForTimeout(150)
    const vorher = await page.evaluate(() => window.scrollY)

    await suchFeld(page).fill('429')
    await expect(page.locator('[data-v3-sprung-hinweis]')).toBeVisible({ timeout: 10_000 })
    await suchFeld(page).press('Escape')

    await expect(suchFeld(page)).toHaveValue('')
    await expect(page.locator('[data-v3-sprung-hinweis]')).toHaveCount(0)
    const nachher = await page.evaluate(() => window.scrollY)
    expect(nachher, `Scroll vorher ${vorher}, nachher ${nachher}`).toBe(vorher)

    expect(fehler).toEqual([])
  })

  test('(d) ⌘K/Ctrl+K und «/» fokussieren das Feld', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    await page.keyboard.press('Control+k')
    await expect(suchFeld(page)).toBeFocused()

    // Weg vom Feld, dann «/» probieren (Fokus liegt jetzt im Fliesstext, nicht
    // in einem Eingabefeld — sonst würde `/` als Zeichen getippt).
    await page.locator('body').click({ position: { x: 5, y: 5 } })
    await expect(suchFeld(page)).not.toBeFocused()
    await page.keyboard.press('/')
    await expect(suchFeld(page)).toBeFocused()

    expect(fehler).toEqual([])
  })
})
