// IA-4 · Scope-Chip lokale Suche (FAHRPLAN-GESETZES-UX §11.5, O5-Rest):
// Jedes lokale Browse-Filterfeld trägt ein ehrliches Scope-Label (§8), und wo
// der Default-Scope die aktive Ebene ist, weitet der Chip «auf alle Ebenen
// erweitern» mit EINEM Klick. Beweise dieser Spec:
//   – Scope-Label je Ebene (Landeplatz «alle Ebenen» / Säule / Kanton XX),
//     programmatisch mit dem Input verknüpft (aria-describedby → id).
//   – Chip-Klick weitet die Ergebnisliste NACHWEISBAR (ZH-Scope ohne Treffer
//     → alle Ebenen: Bund-Treffer erscheinen); zweiter Klick engt zurück.
//   – A–Z-Register: bereits alle Ebenen ⇒ nur Label, KEIN Chip (§3.1).
//   – KEIN dritter Suchpfad (O5/A5): der Chip ändert nur den Scope des
//     bestehenden Filters; §11.6.5 CLS 0 unter CPU-Throttle 6×.
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const scopeZeile = (page: Page) => page.locator('#gesetze-filter-scope')
const chip = (page: Page) => page.getByRole('button', { name: 'auf alle Ebenen erweitern' })
const feld = (page: Page) => page.getByRole('searchbox', { name: 'Gesetze durchsuchen (Kürzel, Titel, SR-Nr.)' })

test.describe('IA-4 · Scope-Label je Ebene + programmatische Verknüpfung', () => {
  test('Landeplatz: «alle Ebenen», kein Chip; Label per aria-describedby am Input', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    await expect(scopeZeile(page)).toContainText('Filtert: alle Ebenen (Bund, Kantone, International)')
    // Kein enger Default-Scope ⇒ kein Chip (er wäre wirkungslos, §3.1).
    await expect(chip(page)).toHaveCount(0)
    // Programmatische Verknüpfung: aria-describedby des Feldes zeigt auf das Label.
    await expect(feld(page)).toHaveAttribute('aria-describedby', 'gesetze-filter-scope')

    // A–Z-Register (filtert BEREITS über alle Ebenen): ehrliches Label, kein Chip.
    const azFeld = page.getByRole('searchbox', { name: 'A–Z-Register filtern (Titel oder Kürzel)' })
    await expect(azFeld).toHaveAttribute('aria-describedby', 'az-register-scope')
    await expect(page.locator('#az-register-scope')).toContainText('Filtert: alle Ebenen')
    expect(fehler).toEqual([])
  })

  test('Säule Bund: «Filtert: Bund» + Chip (nicht gedrückt); Kanton ZH: «Filtert: Kanton Zürich»', async ({ page }) => {
    await page.goto('/gesetze?ebene=bund')
    await expect(scopeZeile(page)).toContainText('Filtert: Bund')
    await expect(chip(page)).toHaveAttribute('aria-pressed', 'false')

    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    await expect(scopeZeile(page)).toContainText('Filtert: Kanton Zürich')
    await expect(chip(page)).toHaveAttribute('aria-pressed', 'false')
  })
})

test.describe('IA-4 · Chip weitet die Ergebnisliste nachweisbar', () => {
  test('ZH-Scope ohne Treffer → 1 Klick → Bund-Treffer sichtbar; 2. Klick engt zurück', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    const main = page.getByRole('main')

    // Default-Scope = aktive Ebene (Kanton ZH): «Obligationenrecht» trifft dort
    // nichts → Abdeckungslücke (IA-2, bleibt), KEIN Bund-Abschnitt.
    await feld(page).fill('Obligationenrecht')
    await expect(main.getByText(/in diesem Kanton erfasst/)).toBeVisible()
    await expect(main.getByRole('heading', { name: /^Bund/ })).toHaveCount(0)

    // EIN Klick weitet auf alle Ebenen: Bund-Treffer (OR) erscheinen.
    await chip(page).click()
    await expect(chip(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(scopeZeile(page)).toContainText('Filtert: alle Ebenen')
    await expect(main.getByRole('heading', { name: /^Bund/ })).toBeVisible()
    await expect(main.getByRole('link', { name: /^Obligationenrecht/ }).first()).toBeVisible()

    // Zurück-Engen (Toggle, aria-pressed): wieder Kanton-Scope + Lücken-Hinweis.
    await chip(page).click()
    await expect(chip(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(scopeZeile(page)).toContainText('Filtert: Kanton Zürich')
    await expect(main.getByText(/in diesem Kanton erfasst/)).toBeVisible()
    expect(fehler).toEqual([])
  })
})

test.describe('IA-4 · Perf/CLS (§11.6.5) + Mobil (§11.6.9)', () => {
  test('CLS 0 unter CPU-Throttle 6× — Tippen + Chip-Toggle sind shift-frei', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 })

    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    await expect(scopeZeile(page)).toBeVisible({ timeout: 20_000 })

    // Beobachter NACH dem eingeschwungenen Zustand installieren — gemessen
    // werden die FILTER-Interaktionen (input-freie Shifts), nicht der Erst-Load.
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as PerformanceEntry[]) {
          const s = e as unknown as { value: number; hadRecentInput: boolean }
          if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value
        }
      }).observe({ type: 'layout-shift' })
    })

    await feld(page).fill('Obligationenrecht')
    await expect(page.getByRole('main').getByText(/in diesem Kanton erfasst/)).toBeVisible({ timeout: 15_000 })
    await chip(page).click()
    await expect(page.getByRole('main').getByRole('heading', { name: /^Bund/ })).toBeVisible({ timeout: 15_000 })
    await chip(page).click()
    await expect(page.getByRole('main').getByText(/in diesem Kanton erfasst/)).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(600)

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls, 'Layout-Shift (input-frei) am Scope-Feld').toBe(0)

    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })

  test('Mobil @390: Label + Chip im Layout, kein H-Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    await expect(scopeZeile(page)).toContainText('Filtert: Kanton Zürich')
    await expect(chip(page)).toBeVisible()
    const b = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})
