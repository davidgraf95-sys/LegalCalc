// @shard-gruppe: 4
// ─── H3 · Drei Reiter, Facetten im Panel, Sachgebiet-Platzhalter ─────────────
//
// WAS HIER BEWIESEN WIRD (Kap. 4d):
//  1. Die Facetten Instanz/Kanton/Zeit stehen IM PANEL — dort, wo ihr Ergebnis
//     steht. In der Ist-Hülle hängen sie im Kopf-Dropdown «Rechtsprechung ▾»,
//     zwei Zentimeter von der Liste entfernt, die sie schneiden.
//  2. Drei benannte Reiter statt sechs bedingter Sektionen (Pos. 17), mit
//     echter Pfeiltasten-Bedienung — `role="tablist"` verspricht sie.
//  3. Der vierte Filter «Sachgebiet» ist baulich vorgesehen und heute NICHT im
//     DOM: kein leeres Steuerelement (Kap. 14, `W2·7-VZUI-SACHGEBIET`).
//  4. ERLASS-NEUTRALITÄT: ein Kantonserlass ohne Bezüge zeigt keinen leeren
//     Zähler und kein leeres Panel-Element — sondern einen ehrlichen Satz.
//
// ROT ZU BEKOMMEN (§6.7):
//  · (a): in `v3/PanelEntscheide.tsx` die `BezugFacettenWahl` entfernen.
//  · (b): in `v3/LeserPanel.tsx` den `taste`-Handler abklemmen.
//  · (c): in `v3/PanelSachgebiet.tsx` das `if (gebiete.length === 0) return null`
//    streichen — der leere Streifen erscheint, rot.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

async function panelAuf(page: Page, pfad: string): Promise<void> {
  await page.goto(pfad)
  await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
  await page.locator('[data-v3-panel-lasche], [data-v3-panel-zaehler]').first().click()
  await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
}

test.describe('H3 — Panel: Facetten, Reiter, Platzhalter', () => {
  test('(a) Instanz-, Kanton- und Zeit-Facette stehen im Panel', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await panelAuf(page, '/gesetze/bund/STPO?leser=v3')

    const filter = page.locator('[data-v3-panel] [data-v3-panel-filter]')
    await expect(filter).toBeVisible()
    // Instanz-Schalter (dieselbe geteilte Komponente wie in der Ist-Hülle).
    for (const klasse of ['bge', 'bger', 'eidg', 'kantonal']) {
      await expect(filter.locator(`[data-bezug-klasse="${klasse}"]`)).toHaveCount(1)
    }
    // Zeit-Achse: die Von-Bis-Eingabe der `BezugZeitWahl`.
    await expect(filter.locator('input[type="date"]').first()).toBeAttached()

    // Kantonale Klasse zuschalten ⇒ der Kanton-Feinschnitt erscheint (er ist
    // ohne diese Klasse wirkungslos und darum gar nicht da, §13 F4).
    await expect(filter.locator('[data-bezug-kanton]')).toHaveCount(0)
    await filter.locator('[data-bezug-klasse="kantonal"]').click()
    await expect(filter.locator('[data-bezug-kanton]').first()).toBeVisible({ timeout: 20_000 })
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('(b) drei Reiter, mit Maus und mit Pfeiltasten', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await panelAuf(page, '/gesetze/bund/STPO?leser=v3')

    const reiter = page.locator('[data-v3-panel] [role="tab"]')
    await expect(reiter).toHaveCount(3)
    await expect(page.locator('[data-v3-panel-reiter-inhalt="entscheide"]')).toBeVisible()

    await page.locator('[data-v3-panel-reiter="aenderungen"]').click()
    await expect(page.locator('[data-v3-panel-reiter-inhalt="aenderungen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-v3-panel-reiter="aenderungen"]')).toHaveAttribute('aria-selected', 'true')

    // Pfeil rechts ⇒ «Materialien». Das Versprechen der Rolle `tablist`.
    await page.locator('[data-v3-panel-reiter="aenderungen"]').press('ArrowRight')
    await expect(page.locator('[data-v3-panel-reiter="materialien"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-v3-panel-reiter-inhalt="materialien"]')).toBeVisible({ timeout: 20_000 })
    // Home springt zurück auf den ersten.
    await page.locator('[data-v3-panel-reiter="materialien"]').press('Home')
    await expect(page.locator('[data-v3-panel-reiter="entscheide"]')).toHaveAttribute('aria-selected', 'true')
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('(c) «Sachgebiet» ist vorgesehen, aber ohne Daten NICHT im DOM', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await panelAuf(page, '/gesetze/bund/STPO?leser=v3')
    // Positiv-Sonde daneben: die Filterzeile IST da (sonst prüfte die Abwesenheit
    // unten nur, dass das Panel leer ist).
    await expect(page.locator('[data-v3-panel] [data-v3-panel-filter]')).toBeVisible()
    await expect(page.locator('[data-v3-panel-sachgebiet]')).toHaveCount(0)
    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('(d) Kantonserlass ohne Bezüge: kein leerer Zähler, kein leeres Element', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await panelAuf(page, '/gesetze/kanton/BS-640.100?leser=v3')

    // Der Öffner trägt keine Zahl — weder eine 0 noch eine erfundene.
    const oeffner = page.locator('[data-v3-panel-zaehler], [data-v3-panel-lasche]').first()
    const anzahl = await oeffner.getAttribute('data-v3-panel-anzahl')
    expect(anzahl === null || Number(anzahl) > 0, `Öffner zeigt «${anzahl}»`).toBe(true)

    // Und der Reiter «Entscheide» sagt ehrlich, was Sache ist, statt eine leere
    // Liste oder einen leeren Streifen zu zeigen.
    const inhalt = page.locator('[data-v3-panel-reiter-inhalt="entscheide"]')
    await expect(inhalt).toBeVisible()
    await expect(page.locator('[data-v3-panel-sachgebiet]')).toHaveCount(0)
    await expect(inhalt.locator('[data-v3-panel-entscheid]')).toHaveCount(0)
    // Der ehrliche Satz statt einer leeren Liste (§8). Gezielt EIN Absatz — die
    // Filterzeile bringt eigene Erklärtexte mit, ein `p`-Sammler wäre unscharf.
    await expect(inhalt.getByText(/ist kein Entscheid der eingeschalteten Instanzen erfasst/))
      .toBeVisible({ timeout: 20_000 })
    expect(fehler, fehler.join('\n')).toEqual([])
  })
})
