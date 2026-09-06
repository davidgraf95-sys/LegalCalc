// @shard-gruppe: 2
// ═══ W2·24 §5a Ziff. 3 + Befund F5 · WIE VIELE REITER EINE NAVIGATION KOSTET ═
//
// GEMESSENER ANLASS (6.9.2026, Preview 4335, gebautes dist/): drei Klicks über
// die Gesetze-Übersicht (OR → ZGB → ZPO) hinterliessen DREI Reiter —
// `components/TabTracker.tsx` rief bei jeder Navigation `lib/tabs.merkeTab()`,
// und das hängt an. David 6.9.2026: «kein Reiter-Wildwuchs» · «analog zum
// browser». Seit dem R2-Nachzug gilt die Browser-Regel: die Navigation ERSETZT
// den aktiven Reiter, ein zweiter entsteht nur auf ausdrückliche Geste.
//
// Und dieselbe Messung zeigte den zweiten Defekt (F5): nach 1500 px Scrollen
// stand im Reiter `/gesetze/bund/ZGB#art-3`, in der Adresse weiter
// `/gesetze/bund/ZGB` — dieselbe Adresse trug zwei Beschriftungen («ZGB» kalt,
// «Art. 3 ZGB» nach dem Scrollen), ohne dass jemand einen Artikel gewählt
// hätte. Die Beschriftung kommt jetzt aus `TabEintrag.wahl` (dem Anker der
// ADRESSE), die Lesestellung bleibt in `path`.
//
// ROT ZU BEKOMMEN (§6.7), je Fall einer:
//   (a)/(b) in `TabTracker.tsx` `ersetzeTab(...)` wieder durch `merkeTab(...)`
//           ersetzen ⇒ (a) findet 3 statt 1 Reiter.
//   (c) den Capture-Handler `useNeuerReiterGeste` entfernen ⇒ der Ctrl-Klick
//       legt keinen Reiter an (bzw. der Browser öffnet ein eigenes Fenster).
//   (d) in `layout/HeaderSuche.tsx` den `lmNeuerReiter`-Zweig streichen ⇒ der
//       Treffer verbraucht den Reiter, aus dem er kommt.
//   (e) in `layout/Reiterleiste.tsx` `kurzform` wieder aus `t.path` statt
//       `t.wahl` lesen ⇒ die Beschriftung wechselt beim Scrollen.
import { test, expect, type Page } from '@playwright/test'
import { kopfSucheOeffnen } from './helpers/kopfSuche'

const REITER = 'nav[aria-label="Offene Reiter"]'

/** Die gespeicherte Reiter-Liste — die Wahrheit, die auch den Neustart überlebt. */
const pfade = (page: Page) => page.evaluate(() =>
  (JSON.parse(localStorage.getItem('lexmetrik-tabs') ?? '[]') as { path: string }[]).map((t) => t.path))

/** Reiter-IDENTITÄTEN ohne den Lesestellungs-Anker, den der Leser laufend
 *  nachführt (`#art-…`, s. `lib/tabs.aktualisiereTabArtikel`). */
const identitaeten = async (page: Page) => (await pfade(page)).map((p) => p.split('#')[0])

/** Sichtbare Beschriftungen der Arbeitsleiste (erster Knopf je Reiter = der
 *  Name; die Griffe ✕/⧉ dahinter zählen nicht mit, ohne die sr-only-Ordnungszahl). */
const beschriftungen = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Offene Reiter"] [data-reiter-aktiv]')]
    .map((d) => [...(d.querySelector('button')?.querySelectorAll('span:not(.sr-only)') ?? [])]
      .map((s) => s.textContent?.trim()).join(' ')))

async function leserBereit(page: Page): Promise<void> {
  await expect(page.locator('article[id^="art-"]').first()).toBeAttached({ timeout: 20_000 })
}

test.describe('Arbeitsleiste — eine Navigation, ein Reiter', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze')
    await page.evaluate(() => localStorage.removeItem('lexmetrik-tabs'))
  })

  test('(a) drei Navigationen hinterlassen EINEN Reiter', async ({ page }) => {
    await page.goto('/gesetze')
    for (const key of ['ZGB', 'OR', 'ZPO']) {
      await page.locator(`a[href="/gesetze/bund/${key}"]`).first().click()
      await leserBereit(page)
      await page.locator('header.sticky a[href="/gesetze"]').first().click()
      await expect(page).toHaveURL(/\/gesetze$/, { timeout: 20_000 })
    }
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/ZPO'])
  })

  test('(b) der Wechsel auf einen offenen Reiter wirft den aktiven NICHT weg', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    // zweiter Reiter per Geste, dann zurück auf den ersten — beide müssen bleiben
    await page.locator('header.sticky a[href="/gesetze"]').first().click()
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => pfade(page), { timeout: 10_000 }).toHaveLength(2)
    await page.locator(`${REITER} button[aria-current="page"], ${REITER} [data-reiter-aktiv] > button`).first().click()
    await leserBereit(page)
    expect((await pfade(page)).length, 'ein Klick in der Leiste kostete einen Reiter').toBe(2)
  })

  test('(c) Ctrl/⌘-Klick öffnet im Hintergrund — die Ansicht bleibt stehen', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    await page.locator('header.sticky a[href="/gesetze"]').first().click()
    await expect(page).toHaveURL(/\/gesetze$/, { timeout: 20_000 })
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => identitaeten(page), { timeout: 10_000 })
      .toEqual(['/gesetze/bund/ZGB', '/gesetze/bund/OR'])
    // Wie im Browser: der neue Reiter geht im HINTERGRUND auf.
    await expect(page).toHaveURL(/\/gesetze$/)
  })

  test('(d) ⌘/Ctrl+Enter in der Kopfsuche öffnet einen NEUEN Reiter', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB')
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/ZGB'])
    const feld = await kopfSucheOeffnen(page)
    await feld.fill('Obligationenrecht')
    await expect(page.locator('header.sticky [role="option"], header.sticky [role="listbox"] a').first())
      .toBeVisible({ timeout: 20_000 })
    await feld.press('ControlOrMeta+Enter')
    await leserBereit(page)
    const nach = await identitaeten(page)
    expect(nach.length, `Reiter nach ⌘+Enter: ${nach.join(' | ')}`).toBe(2)
    expect(nach[0], 'der Reiter, aus dem der Treffer kam, ist verbraucht').toBe('/gesetze/bund/ZGB')
  })

  test('(e) die Beschriftung folgt der Adresse, nicht dem Scrollen (F5)', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB')
    await leserBereit(page)
    const kalt = await beschriftungen(page)
    expect(kalt).toEqual(['ZGB'])
    await page.mouse.wheel(0, 1500)
    await page.waitForTimeout(1200)
    expect(await beschriftungen(page), 'die Beschriftung wanderte beim Scrollen').toEqual(kalt)
    // Die Lesestellung ist NICHT verloren: sie steht im gespeicherten Pfad
    // (Neustart) und im `title` des Reiters.
    expect((await pfade(page))[0]).toMatch(/#art-/)

    // Gegenprobe SPA: derselbe Weg über einen Klick ergibt dieselbe Kurzform.
    await page.goto('/gesetze')
    await page.evaluate(() => localStorage.removeItem('lexmetrik-tabs'))
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    expect(await beschriftungen(page)).toEqual(kalt)
  })

  test('(f) der Neustart ändert nichts an der Liste', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => pfade(page), { timeout: 10_000 }).toHaveLength(2)
    // Verglichen werden die IDENTITÄTEN: die Lesestellung (`#art-…`) führt der
    // Leser laufend nach, sie ist kein Neustart-Effekt.
    const vorher = await identitaeten(page)
    await page.reload()
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(vorher)
  })
})
