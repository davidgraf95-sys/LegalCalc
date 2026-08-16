// @shard-gruppe: 1
// FAHRPLAN-LESER-V3, Etappe H2 (Kap. 4b Pos. 5) — die Trefferliste ist ein
// VERZEICHNIS in Erlass-Reihenfolge, je Artikel gruppiert.
//
// Abnahme-Satz der H2-Zeile: «Treffer stehen in Erlass-Reihenfolge je Artikel
// gruppiert». Beides wird hier am gemalten DOM geprüft — die reine Sortierregel
// selbst liegt in `src/tests/leser-suche-w219.test.ts` (S4, ohne Browser, samt
// Mutanten-Test). Hier zählt nur, ob die Hülle liefert, was die Regel zusagt.
//
// STPO (480 Artikel): gross genug, dass eine Relevanz-Rangfolge die Liste
// sichtbar durchmischt hätte, und mit «Entschädigung» ein Begriff, der über den
// ganzen Erlass verstreut vorkommt.
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

/** Dokument-Position jedes gelisteten Artikels, gemessen am ECHTEN Lesetext. */
async function listenPositionen(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const alle = [...document.querySelectorAll('article[id^="art-"]')].map((a) => a.id)
    return [...document.querySelectorAll('[data-treffer-artikel]')]
      .map((li) => alle.indexOf(`art-${li.getAttribute('data-treffer-artikel')}`))
      .filter((i) => i >= 0)
  })
}

test.describe('H2 — Trefferliste in Erlass-Reihenfolge, je Artikel gruppiert', () => {
  test('(a) die Liste läuft mit dem Gesetz mit, nicht nach Relevanz', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    await suchFeld(page).fill('Entschädigung')
    await expect(page.locator('[data-treffer-liste]')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('[data-treffer-artikel]').first()).toBeVisible({ timeout: 30_000 })

    const pos = await listenPositionen(page)
    expect(pos.length, 'zu wenige Treffer für eine Reihenfolge-Aussage').toBeGreaterThan(3)
    // STRIKT aufsteigend: Dokument-Position ist je Artikel eindeutig, also gibt
    // es keinen Gleichstand, den eine zweite Stufe brechen müsste.
    expect(pos, `Listen-Reihenfolge: ${pos.join(',')}`).toEqual([...pos].sort((a, b) => a - b))
    expect(new Set(pos).size).toBe(pos.length)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) jeder Gruppenkopf steht GENAU EINMAL — in der Rangfolge sprang er hin und her', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)
    await suchFeld(page).fill('Entschädigung')
    await expect(page.locator('[data-treffer-artikel]').first()).toBeVisible({ timeout: 30_000 })

    const koepfe = await page.locator('[data-treffer-liste] li.lc-overline').allInnerTexts()
    expect(koepfe.length, 'keine Gruppenköpfe — Testfall trägt nicht').toBeGreaterThan(1)
    expect(new Set(koepfe).size, `doppelte Gruppenköpfe: ${koepfe.join(' | ')}`).toBe(koepfe.length)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(c) der aktive Artikel klappt auf und zeigt eine Zeile JE Fundstelle', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)
    await suchFeld(page).fill('Entschädigung')
    await expect(page.locator('[data-treffer-artikel]').first()).toBeVisible({ timeout: 30_000 })

    // Einen Artikel mit mehr als einer Fundstelle wählen — sonst beweist die
    // Zeile «eine Stelle» nichts über die Gruppierung.
    const mehrfach = page.locator('[data-treffer-artikel]').filter({
      has: page.locator('[data-fundstellen-zahl]'),
    })
    const ziel = mehrfach.first()
    const token = await ziel.getAttribute('data-treffer-artikel')
    const zahl = Number(await ziel.getAttribute('data-fundstellen-zahl'))
    await ziel.locator('button').first().click()

    // Aufgeklappt: so viele Fundstellen-Zeilen wie der Zähler nennt (bis zum
    // Deckel von 40 — der Zähler bleibt datenseitig und nennt die volle Zahl).
    const stellen = page.locator(`[data-treffer-artikel="${token}"] [data-treffer-stelle]`)
    await expect(stellen.first()).toBeVisible({ timeout: 20_000 })
    expect(await stellen.count()).toBe(Math.min(zahl, 40))

    // Genau EINE Zeile ist die laufende Fundstelle (die ↑↓-Position).
    await expect(page.locator('[data-treffer-stelle-aktiv="1"]')).toHaveCount(1)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(d) ↓ im Suchfeld rückt die laufende Fundstelle vor', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)
    await suchFeld(page).fill('Entschädigung')
    await expect(page.locator('[data-treffer-position]')).toBeVisible({ timeout: 30_000 })

    const stand = () => page.locator('[data-treffer-position]').innerText()
    await suchFeld(page).focus()
    await page.keyboard.press('ArrowDown')
    await expect.poll(stand, { timeout: 20_000 }).toContain('1/')
    await page.keyboard.press('ArrowDown')
    await expect.poll(stand, { timeout: 20_000 }).toContain('2/')
    await page.keyboard.press('ArrowUp')
    await expect.poll(stand, { timeout: 20_000 }).toContain('1/')

    // Und der Text bleibt beim Feld: ↑↓ dürfen die Schreibmarke nicht bewegen
    // und nichts an der Eingabe ändern.
    await expect(suchFeld(page)).toHaveValue('Entschädigung')
    await expect(suchFeld(page)).toBeFocused()

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(e) Suchbereich «Fussnoten» ändert Zähler und Liste', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)
    await suchFeld(page).fill('Entschädigung')
    await expect(page.locator('[data-treffer-artikel]').first()).toBeVisible({ timeout: 30_000 })
    const alle = await page.locator('[data-treffer-artikel]').count()

    // «Titel» ist eine echte Teilmenge: Randtitel + Gliederung, nie Fliesstext.
    await page.locator('[data-v3-bereich="titel"]').click()
    await expect.poll(async () => page.locator('[data-treffer-artikel]').count(), { timeout: 20_000 })
      .toBeLessThan(alle)
    await expect(page.locator('[data-v3-bereich="titel"]')).toHaveAttribute('aria-checked', 'true')

    // Zurück auf «Alles» ⇒ wieder die volle Menge (der Bereich ist ein Filter,
    // kein zweiter Suchlauf mit eigener Semantik).
    await page.locator('[data-v3-bereich="alles"]').click()
    await expect.poll(async () => page.locator('[data-treffer-artikel]').count(), { timeout: 20_000 })
      .toBe(alle)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
