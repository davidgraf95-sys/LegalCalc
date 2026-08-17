// @shard-gruppe: 4
// ─── H4-Vorbereitung II · die drei Wege aus der Kopfzeile ────────────────────
//
// Drei Befunde des Kontaktbogens H4 (`docs/ux-audit-2026-07/reader/leser-v3-h4/`),
// die alle dieselbe Frage stellen: **führt von der Kopfzeile aus genau EIN
// sichtbarer Weg zu jeder Handlung — und führt er überhaupt?**
//
//   (a) NM-2   Rechtsprechung: auf `mini` (@390) stand im Ruhezustand KEIN
//              Öffner in der Kopfzeile (gemessen 17.8.2026:
//              `[data-v3-panel-oeffner]` count 0). Der Weg über «···» →
//              «Entscheide & Kontext …» existierte, kostete aber ZWEI Taps
//              gegen einen auf D/S.
//   (b) Ä46    Schliessen: im Split-View trug jedes Pane ZWEI ✕ (Griffleiste
//              «Pane schliessen» y = 69, V3-Kopf «zur Gesetzesübersicht»
//              y = 113), unterscheidbar nur am Accessible Name.
//   (c) Ä79    Gliederung: @1440 mit eingeklappter Gliederung standen ZWEI ☰
//              für dieselbe Handlung (Kopf x = 1117, Schiene x = 184).
//
// ── ROT GESEHEN (§6.7), gemessen vor dem Fix am Stand 6ca1609b3 ─────────────
//  · (a) @390: «Erwartet mindestens 1 sichtbaren Öffner, gezählt 0».
//  · (b) Split: «✕ je Pane: 2, erwartet 1» (beide Panes).
//  · (c) @1440 eingeklappt: «☰ für ‹Gliederung öffnen›: 2, erwartet 1».
// Wieder rot zu bekommen ist jeder Fall an genau einer Stelle:
//  · (a) in `v3/kopfStufen.ts` `panel` auf `mini` wieder auf «weg» setzen,
//  · (b) in `v3/kopfStufen.ts` `zeigeSchliessKreuz` auf `true` festnageln,
//  · (c) in `v3/LeserRahmenV3.tsx` den `schieneSteht`-Term aus `gliederungKnopf`
//        entfernen.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

async function warteLeser(page: Page): Promise<void> {
  await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
}

/** Sichtbare ✕-Knöpfe je Pane. Gefasst am sichtbaren ZEICHEN, nicht an einer
 *  der drei Beschriftungen — genau darum ging Ä46: die Namen unterschieden
 *  sich, das Bild nicht (dieselbe Fassung wie in `leser-v3-eine-kopfzeile`). */
async function kreuzeJePane(page: Page): Promise<Record<string, string[]>> {
  return page.evaluate(() => {
    const sicht = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const raus: Record<string, string[]> = { primaer: [], sekundaer: [] }
    for (const b of document.querySelectorAll('button')) {
      if ((b.textContent ?? '').trim() !== '✕' || !sicht(b)) continue
      const kopf = b.closest('[data-pane-kopf]')
      const rolle = kopf?.getAttribute('data-pane-rolle')
        ?? b.closest('[data-pane]')?.getAttribute('data-pane')
      if (rolle && rolle in raus) raus[rolle].push(b.getAttribute('aria-label') ?? '?')
    }
    return raus
  })
}

test.describe('H4-II — ein Weg je Handlung aus der V3-Kopfzeile', () => {
  // ── (a) NM-2 · der Finger-Weg zur Rechtsprechung, auf JEDER Breite ────────
  for (const [tag, w, h] of [['H', 390, 844], ['S', 720, 900], ['D', 1280, 800]] as const) {
    test(`(a) NM-2 · ${tag} @${w}: die Kopfzeile trägt einen tapbaren Panel-Öffner`, async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.setViewportSize({ width: w, height: h })
      await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
      await warteLeser(page)
      await expect(page.locator('#art-429')).toBeAttached({ timeout: 20_000 })

      // DIE ZUSAGE: im RUHEZUSTAND steht mindestens ein sichtbarer, klickbarer
      // Öffner — kein Menü, das man erst aufziehen muss (das war der
      // NM-2-Verlust auf H: zwei Taps statt einem).
      const oeffner = page.locator('[data-v3-panel-oeffner]:visible')
      const anzahl = await oeffner.count()
      expect(anzahl, `@${w}: sichtbare Panel-Öffner im Ruhezustand`).toBeGreaterThanOrEqual(1)
      // Und höchstens einer — zwei Öffner für dieselbe Fläche waren Ä56.
      expect(anzahl, `@${w}: mehr als ein Öffner in der Kopfzeile`).toBeLessThanOrEqual(1)
      await expect(oeffner.first()).toBeEnabled()

      // EIN Tap führt zu den Entscheiden — nicht bloss zum Panel-Rahmen.
      await oeffner.first().click()
      await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
      await expect(page.locator('[data-v3-panel] [data-v3-panel-gruppe]').first())
        .toBeVisible({ timeout: 20_000 })

      expect(fehler, fehler.join(' | ')).toEqual([])
    })
  }

  test('(a2) NM-2 · @390 bleibt die Kopfzeile bei vier Elementen', async ({ page }) => {
    // Design-Grundlage Kap. 6 («Kopfzeile im Ruhezustand ≤ 4 Elemente, davon
    // ≤ 2 reine Icons»). Der neue Zähler-Chip darf den Deckel nicht sprengen —
    // gemessen: Ort · ⚖ N · ☰ · ··· .
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await warteLeser(page)
    const m = await page.evaluate(() => {
      const zeile = document.querySelector('[data-v3-kopf]')!.firstElementChild!
      const griffe = zeile.lastElementChild!
      return {
        elemente: 1 /* Ort-Zone */ + griffe.children.length,
        breiteZeile: Math.round(zeile.getBoundingClientRect().width),
        breiteGriffe: Math.round(griffe.getBoundingClientRect().width),
      }
    })
    expect(m.elemente, `Kopfzeile @390 trägt ${m.elemente} Elemente`).toBeLessThanOrEqual(4)
    // Positiv-Sonde: die Zeile ist wirklich die gemessene 390-px-Zeile, sonst
    // wäre die Zählung oben grundlos grün (§6.7 b).
    expect(m.breiteZeile).toBeLessThanOrEqual(390)
    expect(m.breiteGriffe).toBeLessThan(m.breiteZeile)
  })

  test('(a3) NM-2 · F8-Regel unberührt: Schalter aus ⇒ kein Zähler, Menü-Weg bleibt', async ({ page }) => {
    // Regel David 16.8.2026: «Rechtsprechung im Text» AUS ⇒ Zähler weg; Panel
    // bleibt über «Ansicht ▾» und Taste «r» erreichbar. Der neue Chip auf `mini`
    // darf diese Regel nicht aushebeln — er hängt an derselben einen Stelle
    // (`panelModell.oeffnerSichtbar`).
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await warteLeser(page)
    await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(1)

    await page.locator('[data-v3-ansicht]').click()
    await page.getByRole('switch', { name: 'Rechtsprechung im Text' }).click()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(0)

    // … und der Menü-Weg trägt weiter.
    await page.locator('[data-v3-ansicht]').click()
    await page.locator('[data-v3-ansicht-panel-auf]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
  })

  // ── (b) Ä46 · ein ✕ je Pane ───────────────────────────────────────────────
  test('(b) Ä46 · Split-View: ein ✕ je Pane, die Rücksprung-Handlung bleibt sichtbar', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 25_000 })
    await page.waitForTimeout(800)

    const kreuze = await kreuzeJePane(page)
    for (const rolle of ['primaer', 'sekundaer'] as const) {
      expect(kreuze[rolle].length, `Pane «${rolle}» trägt ${kreuze[rolle].length} ✕: ${kreuze[rolle].join(' | ')}`).toBe(1)
      // Und das eine ist das der FENSTER-Steuerung — eine Inhaltsseite kann ihr
      // eigenes Fenster nicht schliessen, also gehört das ✕ der Griffleiste.
      expect(kreuze[rolle][0]).toMatch(/schliessen/)
    }

    // DIE HANDLUNG IST NICHT VERLOREN, sie steht sichtbar und BENANNT: der
    // Rücksprung «‹ Gesetze» in der Ort-Zone desselben Kopfes, mit demselben
    // Ziel, das der V3-✕ ansteuerte (gemessen: beide `/gesetze`).
    for (const wahl of ['[data-pane="primaer"]', '[data-pane="sekundaer"]']) {
      const kurz = page.locator(`${wahl} [data-v3-kopf-krume-kurz]`)
      await expect(kurz).toHaveCount(1)
      await expect(kurz).toHaveAttribute('href', '/gesetze')
    }
    expect(fehler, fehler.join(' | ')).toEqual([])
  })

  // ── (c) Ä79 · ein ☰ für die Gliederung ────────────────────────────────────
  test('(c) Ä79 · @1440 eingeklappt: ein ☰ für die Gliederung, und es ist die Schiene', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await warteLeser(page)
    await page.waitForTimeout(400)

    await page.locator('[data-v3-gliederung-zu]').click()
    await expect(page.locator('[data-v3-gliederung-schiene]')).toBeVisible()

    // Die Schiene ist der Ort, an dem die Gliederung WAR und wieder erscheint —
    // der Kopf-☰ auf der Gegenseite des Fensters ist damit ein zweiter Knopf
    // für dieselbe Handlung (Ä79). Er tritt erst wieder auf, wenn es keine
    // Schiene gibt (unter der Schienen-Schwelle, Fall unten).
    await expect(page.locator('[data-v3-gliederung-auf]')).toHaveCount(0)

    // Und die Schiene TUT es auch — sonst wäre die Abwesenheit oben ein Verlust
    // statt einer Aufräumung (§6.7 b).
    await page.locator('[data-v3-gliederung-schiene]').click()
    await expect(page.locator('[data-v3-aside]')).toBeVisible({ timeout: 10_000 })
    expect(fehler, fehler.join(' | ')).toEqual([])
  })

  test('(c2) Ä79 · @390 gibt es keine Schiene — dort bleibt der Kopf-☰', async ({ page }) => {
    // Die Gegenprobe: der Kopf-☰ wird nicht generell gestrichen, sondern nur
    // dort, wo die Schiene dieselbe Handlung sichtbar trägt.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await warteLeser(page)
    await expect(page.locator('[data-v3-gliederung-schiene]')).toHaveCount(0)
    await expect(page.locator('[data-v3-gliederung-auf]')).toBeVisible()
  })
})
