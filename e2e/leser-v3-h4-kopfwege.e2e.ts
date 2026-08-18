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
//  · (b) in `v3/LeserKopf.tsx` das ✕ wieder einsetzen (H4-Nachzug 18.8.2026:
//        `zeigeSchliessKreuz` ist gestrichen, siehe (d) unten),
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
    // B2 (H4-Nachzug 18.8.2026): der Schalter heisst nach seiner WIRKUNG —
    // «Rechtsprechung im Text» war eine Zusage, die V3 nicht einlöst (0
    // Bezugs-Zeilen im Lesetext, gemessen). Wortlaut-Herleitung in
    // `v3/LeserAnsichtV3.tsx`.
    await page.getByRole('switch', { name: 'Rechtsprechung anzeigen' }).click()
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

  // ══ H4-NACHZUG (18.8.2026) · Ä87 · Ä91 · Ä90 · Ä92 ═══════════════════════
  //
  // Vier Befunde derselben Zeile, alle am gebauten H4-Stand gemessen
  // (`scratchpad/a-mess.cjs`, StPO Art. 429):
  //   Ä87  @1440 mit offenem Blatt ZWEI ✕, 47 px übereinander (Kopf y = 80,
  //        Blatt y = 127).
  //   Ä91  @720 FÜNF Elemente in der Zeile (Ort · ⚖ · ☰ · Ansicht · ✕) gegen
  //        einen Deckel von vier; und der Ansicht-Öffner trug drei Gesichter
  //        («···» · «◧▾» · «◧ Ansicht ▾»), weil das Wort an einem `lg:`-Präfix
  //        hing, also am Viewport statt am gemessenen Zuschnitt (Kap. 10).
  //   Ä90  @390 drei Bauformen (⚖ Chip 24 px · ☰ nackt 24 px · ··· Pille 28 px).
  //   Ä92  Chip UND Menü-Eintrag zugleich: zwei Öffner für eine Fläche.
  //
  // WIEDER ROT ZU BEKOMMEN — je Fall an genau einer Stelle:
  //   (d) in `v3/LeserKopf.tsx` das ✕ wieder einsetzen;
  //   (e) in `v3/LeserAnsichtV3.tsx` das Wort «Ansicht» wieder mit
  //       `className="hidden lg:inline"` versehen;
  //   (f) in `v3/kopfStufen.ts` `kopfGriffKlassen` auf `lc-leiste-griff`
  //       zurücksetzen (dann fehlt dem ☰ der Chip-Umriss und das 32-px-Ziel);
  //   (g) in `v3/LeserRahmenV3.tsx` `onPanelOeffnen` wieder unbedingt setzen.
  test('(d) Ä87 · @1440 mit offenem Blatt steht genau EIN ✕ — das des Blatts', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await warteLeser(page)
    await page.waitForTimeout(400)
    // Ruhezustand: gar kein ✕ — der Rücksprung steht als Wort in der Ort-Zone.
    await expect(page.locator('[data-v3-kopf-schliessen]')).toHaveCount(0)
    await expect(page.locator('[data-v3-kopf] nav[aria-label="Ort im Gesetz"]')
      .getByRole('link', { name: 'Gesetze' })).toHaveAttribute('href', '/gesetze')

    await page.locator('[data-v3-panel-zaehler]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
    // Und mit offenem Blatt: genau eines, und zwar das des Blatts.
    const kreuze = await page.evaluate(() => [...document.querySelectorAll('button')]
      .filter((b) => (b.textContent ?? '').trim() === '✕'
        && b.getBoundingClientRect().width > 0)
      .map((b) => ({ name: b.getAttribute('aria-label') ?? '?', y: Math.round(b.getBoundingClientRect().y) })))
    expect(kreuze.length, `✕ @1440 mit offenem Blatt: ${JSON.stringify(kreuze)}`).toBe(1)
    expect(kreuze[0].name).toMatch(/Rechtsprechung und Kontext schliessen/)
    expect(fehler, fehler.join(' | ')).toEqual([])
  })

  test('(e) Ä91 · der Ansicht-Öffner hat ZWEI Gesichter, nicht drei — und @720 hält der Deckel', async ({ page }) => {
    // Ein Gesicht je Zuschnitt: «···» auf `mini`, «◧ Ansicht ▾» sonst. Die
    // frühere dritte Gestalt «◧▾» trat genau zwischen 640 und 1023 px auf; die
    // Breiten unten liegen darum beidseits dieser Lücke.
    const gesichter = new Map<number, string>()
    for (const [w, h] of [[390, 844], [720, 900], [900, 900], [1024, 800], [1440, 900]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('/gesetze/bund/STPO?leser=v3')
      await warteLeser(page)
      await page.waitForTimeout(300)
      const m = await page.evaluate(() => {
        const zeile = document.querySelector('[data-v3-kopf]')!.firstElementChild!
        const griffe = zeile.lastElementChild!
        const oeffner = document.querySelector('[data-v3-ansicht]')!
        return {
          gesicht: (oeffner.textContent ?? '').replace(/\s+/g, ''),
          elemente: 1 /* Ort-Zone */ + griffe.children.length,
          ueberlauf: zeile.scrollWidth - zeile.clientWidth,
        }
      })
      gesichter.set(w, m.gesicht)
      expect(m.elemente, `Kopfzeile @${w} trägt ${m.elemente} Elemente`).toBeLessThanOrEqual(4)
      expect(m.ueberlauf, `Kopfzeile @${w} läuft über (${m.ueberlauf} px)`).toBeLessThanOrEqual(0)
    }
    const verschiedene = new Set(gesichter.values())
    expect(verschiedene.size,
      `Ansicht-Öffner zeigt ${verschiedene.size} Gesichter: ${JSON.stringify([...gesichter])}`).toBe(2)
    expect(gesichter.get(390)).toBe('···')
    // Und das Wort steht ÜBERALL sonst — auch unter 1024 px, wo das `lg:`-Präfix
    // es verschluckte (das ist der Kern von Ä91).
    for (const w of [720, 900, 1024, 1440]) {
      expect(gesichter.get(w), `@${w}: der Öffner zeigt «${gesichter.get(w)}»`).toContain('Ansicht')
    }
  })

  test('(f) Ä90 · @390 tragen alle Kopf-Griffe EINE Bauform und ein 32-px-Ziel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await warteLeser(page)
    await page.waitForTimeout(400)
    const griffe = await page.evaluate(() => [...document.querySelectorAll(
      '[data-v3-kopf-griffe] > *, [data-v3-kopf-griffe] > div > button')]
      .filter((e) => e.tagName === 'BUTTON')
      .map((e) => {
        const r = e.getBoundingClientRect()
        const cs = getComputedStyle(e)
        return { w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, radius: cs.borderTopLeftRadius }
      }))
    expect(griffe.length, 'auf `mini` stehen drei Griffe: ⚖ · ☰ · ···').toBe(3)
    // EINE Bauform: gleiche Fläche, gleiche Rundung, gleiche Höhe.
    expect(new Set(griffe.map((g) => g.bg)).size, `Flächen: ${griffe.map((g) => g.bg).join(' | ')}`).toBe(1)
    expect(new Set(griffe.map((g) => g.radius)).size).toBe(1)
    expect(new Set(griffe.map((g) => g.h)).size).toBe(1)
    // Und ein Ziel, das ein Finger trifft (32 px; WCAG 2.5.8 verlangt 24).
    for (const g of griffe) {
      expect(g.h, `Griff ${g.w}×${g.h}`).toBeGreaterThanOrEqual(32)
      expect(g.w, `Griff ${g.w}×${g.h}`).toBeGreaterThanOrEqual(32)
    }
  })

  test('(g) Ä92 · ein Öffner je Breite: Chip ODER Menü-Eintrag, nie beide', async ({ page }) => {
    for (const [w, h] of [[390, 844], [1440, 900]] as const) {
      await page.setViewportSize({ width: w, height: h })
      await page.goto('/gesetze/bund/STPO?leser=v3')
      await warteLeser(page)
      await page.waitForTimeout(300)
      // Mit Zähler: der Menü-Eintrag fehlt — auch bei AUFGEZOGENEM Menü, denn
      // genau dort standen bis 18.8.2026 beide (gemessen: chip 1, Eintrag 1).
      await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(1)
      await page.locator('[data-v3-ansicht]').click()
      await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
      await expect(page.locator('[data-v3-ansicht-panel-auf]'),
        `@${w}: Menü-Eintrag steht neben dem Chip`).toHaveCount(0)
      // Ohne Zähler (F8-Regel): der Eintrag tritt an seine Stelle — der Zugang
      // bleibt, die Doppelung verschwindet.
      await page.getByRole('switch', { name: 'Rechtsprechung anzeigen' }).click()
      await expect(page.locator('[data-v3-panel-zaehler]')).toHaveCount(0)
      await expect(page.locator('[data-v3-ansicht-panel-auf]')).toHaveCount(1)
      await page.locator('[data-v3-ansicht-panel-auf]').click()
      await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
      // Zurückstellen — der Store ist geteilt und überlebt die Navigation.
      await page.locator('[data-v3-panel-zu]').click()
      await page.locator('[data-v3-ansicht]').click()
      await page.getByRole('switch', { name: 'Rechtsprechung anzeigen' }).click()
      await page.keyboard.press('Escape')
    }
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
