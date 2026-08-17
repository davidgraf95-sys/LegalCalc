// @shard-gruppe: 7
// ─── Ä19 (LESER-V3 H2b) · JE PANE EIN ZUGREIFBARES SUCHFELD ──────────────────
//
// DER GEWICHTIGSTE BEFUND des Ästhetik-Reviews H1, gemessen 17.8.2026 im Split
// @1440 unter `?leser=v3`: `[data-v3-suchsprung] input` **count === 0**. Die
// Panes waren 590 px breit, unterschritten also die xl-Schwelle; die
// Seitenleiste ist dort ein Bottom-Sheet, und das Such-/Sprungfeld lebte
// ausschliesslich darin. Wer im Split suchen wollte, musste ein Blatt öffnen, das
// das Pane vollständig verdeckt — man suchte im Text, den man dabei nicht mehr
// sah. V1 hat je Pane ein Feld; V3 hatte keines. Derselbe Mangel traf das Handy
// und, unbemerkt, den Desktop mit EINGEKLAPPTER Gliederung.
//
// DIE GEPRÜFTE REGEL: das Feld ist auf JEDER Breite das oberste Element des
// klebenden Blocks — in der Spalte deren Sockel (Kap. 4b), sonst der klebende
// Kopf-Block (`v3/SuchZone.tsx`). Es ist ohne jede Geste erreichbar und verdeckt
// den Lesetext nicht.
//
// WARUM IM BROWSER: «existiert das Feld in dieser Breite überhaupt» und «liegt an
// seiner Stelle auch das Feld» sind Aussagen über die gerechnete Breiten-Weiche
// (ResizeObserver auf der Pane-Wurzel) und über die Stapelung. Kein Unit-Test
// sieht das.
//
// ROT ZU BEKOMMEN (§6.7): in `src/pages/gesetz-leser/v3/LeserRahmenV3.tsx` die
// Prop `suchZone={suchZone}` am `<LeserKopf>` entfernen — dann fällt Fall (a) auf
// 0 Felder zurück (der Vorzustand), (b) und (c) verlieren ihr Feld ebenfalls.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Zu welchem Pane gehört jedes gefundene Suchfeld? Über die Vorfahrenkette, weil
 *  das Feld im Kopf-Block liegt und ein Blatt per Portal auch AUSSERHALB von
 *  `[data-pane]` landen kann (Befund H2, `leser-v3-highlight-split`). */
async function paneRollen(page: Page): Promise<string[]> {
  return page.locator('[data-v3-suchsprung] input').evaluateAll((els) => els.map((el) => {
    let n: HTMLElement | null = el as HTMLElement
    while (n) {
      const v = n.getAttribute('data-v3-pane') ?? n.getAttribute('data-pane')
      if (v) return v
      n = n.parentElement
    }
    return '(ohne Pane-Rolle)'
  }))
}

test.describe('Ä19 — das Such-/Sprungfeld ist in jeder Breite erreichbar', () => {
  test('(a) Split-View: JE Pane genau ein sichtbares Feld, ohne eine Geste', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen samt Idle-Shards
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })

    // KEIN Klick, kein ☰: genau das ist der Prüfgegenstand. Vorher stand hier 0.
    const felder = page.locator('[data-v3-suchsprung] input')
    await expect(felder, 'im Split fehlt je Pane ein Suchfeld (Ä19)').toHaveCount(2, { timeout: 20_000 })
    await expect(felder.nth(0)).toBeVisible()
    await expect(felder.nth(1)).toBeVisible()

    // Und es sind wirklich ZWEI Panes, nicht zweimal dasselbe Feld.
    const rollen = await paneRollen(page)
    expect(rollen.slice().sort(), `Pane-Rollen der Felder: ${rollen.join(', ')}`)
      .toEqual(['primaer', 'sekundaer'])

    // Der Text bleibt sichtbar: das Feld ist Chrome, kein Overlay über dem Pane.
    await expect(page.locator('[data-pane="sekundaer"] article').first()).toBeVisible()

    // Suchen in Pane A markiert nur in Pane A — die Markierung ist eine Zusage
    // JE Instanz (Buchführung: `suchHighlight.ts`, Nachweis in
    // `leser-v3-highlight-split`). Hier genügt: die Eingabe wirkt, ohne dass
    // irgendetwas geöffnet werden musste, und das Nachbar-Feld bleibt leer.
    await felder.nth(0).fill('Anwalt')
    await expect(felder.nth(0)).toHaveValue('Anwalt')
    await expect(felder.nth(1)).toHaveValue('')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Handy @390: das Feld steht im klebenden Kopf-Block, nicht im Blatt', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })

    const feld = page.locator('[data-v3-suchsprung] input')
    await expect(feld, 'auf dem Handy gibt es genau EIN Feld').toHaveCount(1, { timeout: 20_000 })
    await expect(feld).toBeVisible()

    // Es liegt IM Kopf-Block (nicht im Gliederungs-Blatt) — sonst wäre es wieder
    // eine Geste entfernt, und im Blatt gäbe es die zweite Eingabe (§5, K2).
    const imKopf = await feld.evaluate((el) => !!el.closest('[data-v3-kopf]'))
    expect(imKopf, 'das Feld liegt nicht im klebenden Kopf-Block').toBe(true)

    // ── §6.3-NACHZUG (A2, H2b-Nachzug) · DIE ZUSAGE IST GESCHÄRFT, NICHT GELOCKERT
    // Bis hierher stand hier «im Blatt steht KEIN Feld» (`count === 0`). Das war
    // die richtige Antwort auf K2 (zwei Eingaben für eine Absicht) und die falsche
    // auf WCAG: das Blatt ist ein `role=dialog`, und ohne Feld darin gab es bei
    // offener Trefferliste @390 überhaupt kein erreichbares Eingabefeld mehr —
    // gemessen 17.8.2026 zog Ctrl+K den Fokus auf das VERDECKTE Kopf-Feld
    // (`sheet.contains(activeElement) === false`), Tippen landete unsichtbar.
    // NEUE ZUSAGE, strenger als die alte: es gibt weiterhin GENAU EIN Feld im
    // ganzen Dokument — es steht nur dort, wo der Fokus hin darf. Solange das
    // Blatt offen ist, IM Blatt; sonst im Kopf-Block.
    await page.locator('[data-v3-gliederung-auf]').first().click()
    await expect(page.locator('[data-gliederung-sheet]')).toBeVisible({ timeout: 15_000 })
    await expect(feld, 'bei offenem Blatt gibt es nicht mehr genau EIN Feld (K2)').toHaveCount(1)
    expect(await page.locator('[data-gliederung-sheet] [data-v3-suchsprung]').count(),
      'im offenen Blatt fehlt das Feld — der Fokus müsste den Dialog verlassen').toBe(1)
    expect(await feld.evaluate((el) => !!el.closest('[data-v3-kopf]')),
      'das Feld steht bei offenem Blatt noch im (verdeckten) Kopf-Block').toBe(false)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(c) Desktop @1440 mit eingeklappter Gliederung: das Feld bleibt da', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-aside]')).toBeVisible({ timeout: 20_000 })

    // Mit Spalte: das Feld gehört in deren klebenden Sockel (Kap. 4b).
    const feld = page.locator('[data-v3-suchsprung] input')
    await expect(feld).toHaveCount(1)
    expect(await feld.evaluate((el) => !!el.closest('[data-toc-zone-a]')),
      'mit Spalte muss das Feld im Sockel der Leiste stehen').toBe(true)

    // Gliederung einklappen — vor H2b verschwand das Feld hier ersatzlos.
    await page.locator('[data-v3-gliederung-zu]').first().click()
    await expect(page.locator('[data-v3-aside]')).toHaveCount(0)
    await expect(feld, 'nach dem Einklappen fehlt das Suchfeld').toHaveCount(1)
    await expect(feld).toBeVisible()
    expect(await feld.evaluate((el) => !!el.closest('[data-v3-kopf]')),
      'ohne Spalte muss das Feld in den Kopf-Block wandern').toBe(true)

    // Und es ist bedienbar, nicht nur sichtbar.
    await feld.click()
    await expect(feld).toBeFocused()

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── B9 (H2b-Nachzug) · DIE AUSGELEGTE HÖHE IST DIE GEMESSENE ──────────────
  // `--leser-v3-such-h` speist `--nt-stick`, also den Sprung-Offset JEDES
  // Artikel-Ankers. Die zwei Werte standen als rem-Literale im Rahmen, das
  // Markup in `SuchZone.tsx` — ohne Wächter dazwischen (Klasse LM-003). Jetzt
  // exportiert die Zone die Konstanten, und diese Spec misst, dass sie stimmen.
  // ROT ZU BEKOMMEN (§6.7): `SUCH_H_RUHE` in `v3/SuchZone.tsx` auf `'3.5rem'`
  // setzen ⇒ ausgelegt 56 px, gemessen 44 px.
  test('(e) die Höhe der Such-Zone stimmt mit der ausgelegten Variable überein', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-such-zone]')).toBeVisible({ timeout: 20_000 })

    const mass = async () => page.evaluate(() => {
      const zone = document.querySelector('[data-v3-such-zone]') as HTMLElement | null
      const wurzel = document.querySelector('[data-leser-v3="rahmen"]') as HTMLElement | null
      if (!zone || !wurzel) return null
      const roh = getComputedStyle(wurzel).getPropertyValue('--leser-v3-such-h').trim()
      // rem → px über eine Sonde, damit die Spec keine 16-px-Annahme trifft.
      const probe = document.createElement('div')
      probe.style.cssText = `position:absolute;visibility:hidden;height:${roh}`
      wurzel.appendChild(probe)
      const ausgelegt = Math.round(probe.getBoundingClientRect().height)
      probe.remove()
      return { ausgelegt, gemessen: Math.round(zone.getBoundingClientRect().height), roh }
    })

    const ruhe = await mass()
    expect(ruhe, 'Zone oder Rahmen nicht gefunden').not.toBe(null)
    expect(ruhe!.gemessen, `Ruhezustand: ausgelegt ${ruhe!.roh} = ${ruhe!.ausgelegt} px, gemessen ${ruhe!.gemessen} px`)
      .toBe(ruhe!.ausgelegt)

    // Mit laufender Suche wächst die Zone um die Zähler-Zeile — der zweite Wert.
    await page.locator('[data-v3-such-zone] input').fill('Anwalt')
    await expect(page.locator('[data-v3-treffer-weg]')).toBeVisible({ timeout: 15_000 })
    const aktiv = await mass()
    expect(aktiv!.gemessen, `mit Suche: ausgelegt ${aktiv!.roh} = ${aktiv!.ausgelegt} px, gemessen ${aktiv!.gemessen} px`)
      .toBe(aktiv!.ausgelegt)
    expect(aktiv!.ausgelegt, 'die Zone wächst mit der Suche gar nicht — Fall untauglich')
      .toBeGreaterThan(ruhe!.ausgelegt)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
