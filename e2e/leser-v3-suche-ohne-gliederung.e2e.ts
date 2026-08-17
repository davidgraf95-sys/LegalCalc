// @shard-gruppe: 7
// ─── Ä70 (David-Befund 17.8.2026 abends) · SUCHE BEI EINGEKLAPPTER GLIEDERUNG ─
//
// BEFUND, wörtlich: «wenn die gliederung ausgeblendet ist funktioniert suche
// nicht mehr resp. resultat ist versteckt. andere lösung finden.»
//
// WAS DER PROD-STAND (afc008c19) TAT, gemessen @1440 und @1024 auf der StPO mit
// «Entschädigung», Gliederung per «‹ Gliederung ausblenden» zugeklappt:
//   Suchfeld       1 (in der Kopf-Zone — Ä19 hielt)
//   Zähler-Zeile   «50 Artikel · 88 Fundstellen  Treffer anzeigen →», sichtbar
//   Trefferliste   im DOM, `isVisible()` true — aber y = 755, HÖHE 3596 px,
//                  INLINE über dem Lesetext
// Formal sichtbar, faktisch verschwunden: die Liste begann unter der Falz
// (Viewport 900) und schob den gesamten Gesetzestext um 3,6 Bildschirmhöhen nach
// unten. Ursache war der `trefferListe`-Zweig der Lesespalte, dessen Bedingung
// (`!zweiSpalten`) auch die EINGEKLAPPTE Spalte traf — ein Zweig, der etwas
// anderes tat als sein Kommentar behauptete.
//
// DIE GEPRÜFTE REGEL: **Die Trefferliste steht dort, wo das Feld steht.** Fehlt
// die Spalte, ist aber Platz neben dem Text (Desktop/breites Pane), liegt sie als
// Blatt DIREKT unter dem Suchfeld — ausserhalb des Flusses, damit die Suche den
// Satzspiegel um exakt 0 px verschiebt (die verworfene Alternative «Spalte
// automatisch aufziehen» hätte den Lesetext @1440 um 126 px seitwärts bewegt,
// zweimal pro Suche; Herleitung in `src/pages/gesetz-leser/v3/LeserTrefferBlatt.tsx`).
//
// WARUM IM BROWSER: geprüft werden Rechtecke gegen den Viewport, eine gerechnete
// Breiten-Weiche (ResizeObserver auf der Pane-Wurzel) und Stapelung. Nichts davon
// sieht ein Unit-Test — «im DOM und isVisible()» war beim Prod-Stand ja wahr.
//
// ROT ZU BEKOMMEN (§6.7): in `LeserRahmenV3.tsx` die Prop `blatt={…}` an der
// `<SuchZone>` entfernen. Dann ist die Liste bei eingeklappter Spalte nirgends
// mehr — (a) fällt auf 0 sichtbare Listen, (c) und (d) finden ihr Blatt nicht.
// Umgekehrt bringt das Wiederherstellen des Inline-Zweigs (a) zu Fall, weil das
// Listen-Rechteck dann wieder unter der Falz beginnt und (e) einen Textsprung
// meldet.
import { test, expect, type Page } from '@playwright/test'

const BEGRIFF = 'Entschädigung'

async function warteLeser(page: Page): Promise<void> {
  await page.goto('/gesetze/bund/STPO?leser=v3')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('StPO', { timeout: 30000 })
  await expect(page.locator('[data-v3-suchsprung] input').first()).toBeVisible({ timeout: 20000 })
  await page.evaluate(() => document.fonts?.ready)
}

/** Gliederung einklappen — der Zustand, in dem David gesucht hat. */
async function gliederungZu(page: Page): Promise<void> {
  const zu = page.locator('[data-v3-gliederung-zu]')
  await expect(zu, 'kein «Gliederung ausblenden» — Vorbedingung fehlt (§6.7)').toHaveCount(1)
  await zu.click()
  await expect(page.locator('[data-v3-aside]')).toHaveCount(0)
  // POSITIV-Vorbedingung: die Spalte ist weg, das Feld ist trotzdem da (Ä19).
  await expect(page.locator('[data-v3-such-zone] input')).toHaveCount(1)
}

async function suche(page: Page, wort = BEGRIFF): Promise<void> {
  const feld = page.locator('[data-v3-suchsprung] input').first()
  await feld.click()
  await feld.fill(wort)
  // Der Begriff läuft durch ein Debounce ins Modell; die Zähler-Zeile ist das
  // erste, was danach steht.
  await expect(page.locator('[data-v3-treffer-weg]')).toBeVisible({ timeout: 15000 })
}

/** Liegt das Rechteck VOLLSTÄNDIG im Viewport? Genau das war beim Prod-Stand
 *  falsch, während `isVisible()` true meldete. */
async function imViewport(page: Page, wahl: string): Promise<{ drin: boolean; box: unknown }> {
  return page.locator(wahl).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    return {
      drin: r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw && r.width > 0 && r.height > 0,
      box: { t: Math.round(r.top), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), vh, vw },
    }
  })
}

for (const breite of [1024, 1440]) {
  test(`(a) @${breite}: eingeklappte Gliederung — Trefferliste sichtbar UND vollständig im Viewport`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: 900 })
    await warteLeser(page)
    await gliederungZu(page)
    await suche(page)

    const liste = page.locator('[data-treffer-liste]')
    await expect(liste, 'Trefferliste fehlt ganz').toHaveCount(1)
    await expect(liste).toBeVisible()

    // DER KERN DES BEFUNDS: nicht «im DOM», sondern «im Bild». Beim Prod-Stand
    // begann das Rechteck bei y = 755 und war 3596 px hoch.
    const { drin, box } = await imViewport(page, '[data-treffer-liste]')
    expect(drin, `Trefferliste nicht vollständig im Viewport: ${JSON.stringify(box)}`).toBe(true)

    // Sie hängt am FELD, nicht irgendwo: dasselbe Blatt, und das Blatt liegt in
    // der Such-Zone (die einzige Stelle, die ohne Spalte klebt).
    await expect(page.locator('[data-v3-such-zone] [data-v3-treffer-blatt] [data-treffer-liste]')).toHaveCount(1)

    // Und der Zähler ist da und sagt dieselben Zahlen wie der Listenkopf (§5).
    const weg = page.locator('[data-v3-treffer-weg]')
    await expect(weg).toBeVisible()
    const zaehler = (await weg.innerText()).replace(/\s+/g, ' ')
    expect(zaehler, `Zähler ohne Artikel-Zahl: ${zaehler}`).toMatch(/\d+ (Artikel|Paragraphen)/)
    expect(zaehler, `Zähler ohne Fundstellen-Zahl: ${zaehler}`).toMatch(/\d+ Fundstellen?/)
  })
}

test('(b) das Blatt bleibt schmal und deckelt seine Höhe — der Lesetext bleibt daneben sichtbar', async ({ page }) => {
  // Ä19 in Zahlen: «schmales Blatt am Feld, max-h ~50 %, kein Vollflächen-Scrim».
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await gliederungZu(page)
  await suche(page)

  const mass = await page.locator('[data-v3-treffer-blatt]').evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height), vh: window.innerHeight, vw: window.innerWidth }
  })
  expect(mass.w, `Blatt zu breit (${mass.w} px) — es soll den Text nicht ersetzen`).toBeLessThanOrEqual(340)
  expect(mass.h, `Blatt höher als die halbe Fensterhöhe (${mass.h}/${mass.vh})`).toBeLessThanOrEqual(Math.round(mass.vh / 2) + 2)

  // KEIN Vollflächen-Scrim: nichts liegt über dem Lesetext ausser dem Blatt
  // selbst. Gemessen an einem Punkt WEIT rechts im Satzspiegel — dort muss der
  // Text getroffen werden, nicht ein Overlay.
  const treffer = await page.evaluate(() => {
    const spalte = document.querySelector('#lc-lesespalte')
    if (!spalte) return 'keine Lesespalte'
    const r = spalte.getBoundingClientRect()
    const el = document.elementFromPoint(Math.round(r.right - 20), Math.round(window.innerHeight / 2))
    return el?.closest('[data-v3-treffer-blatt]') ? 'BLATT' : 'text'
  })
  expect(treffer, 'am rechten Rand des Satzspiegels liegt ein Overlay').toBe('text')
})

test('(c) Klick auf einen Treffer springt — und lässt das Blatt offen (wie in der Spalte)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await gliederungZu(page)
  await suche(page)

  const blatt = page.locator('[data-v3-treffer-blatt]')
  const erster = blatt.locator('[data-treffer-artikel]').first()
  await expect(erster, 'kein Treffer zum Klicken — Vorbedingung fehlt (§6.7)').toHaveCount(1)
  const token = await erster.getAttribute('data-treffer-artikel')
  expect(token).toBeTruthy()

  const vorher = await page.evaluate(() => window.scrollY)
  await erster.locator('button, a').first().click()
  // Der Sprung ist der Zweck: die Seite bewegt sich.
  await expect.poll(async () => page.evaluate(() => window.scrollY), { timeout: 10000 })
    .not.toBe(vorher)
  // Und das Blatt steht weiter — sonst müsste man für jeden zweiten Treffer neu
  // suchen (dieselbe Zusage wie in der Spalte).
  await expect(blatt).toBeVisible()
  await expect(blatt.locator('[data-treffer-liste]')).toHaveCount(1)
})

test('(d) Esc schliesst ohne Sprung — die Leseposition bleibt exakt stehen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await gliederungZu(page)
  await suche(page)
  await expect(page.locator('[data-v3-treffer-blatt]')).toBeVisible()

  // Erst ein Stück lesen, damit «kein Sprung» überhaupt etwas behauptet: bei
  // scrollY 0 wäre die Zusicherung trivial erfüllt (§6.7).
  await page.evaluate(() => window.scrollTo(0, 900))
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  const vorher = await page.evaluate(() => window.scrollY)

  await page.locator('[data-v3-suchsprung] input').first().press('Escape')
  // Esc IM FELD ist Pos. 14: leeren, nicht springen. Damit endet die Suche und
  // das Blatt ist weg.
  await expect(page.locator('[data-v3-treffer-blatt]')).toHaveCount(0)
  await expect(page.locator('[data-v3-suchsprung] input').first()).toHaveValue('')
  expect(await page.evaluate(() => window.scrollY), 'Esc hat gescrollt').toBe(vorher)

  // Der zweite Weg heraus: ✕ am Blatt nimmt NUR das Blatt, die Suche bleibt —
  // und «Treffer anzeigen →» holt es zurück. Auch das ohne Scroll.
  await suche(page)
  await expect(page.locator('[data-v3-treffer-blatt]')).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 900))
  const vorher2 = await page.evaluate(() => window.scrollY)
  await page.locator('[data-v3-treffer-blatt-zu]').click()
  await expect(page.locator('[data-v3-treffer-blatt]')).toHaveCount(0)
  await expect(page.locator('[data-v3-suchsprung] input').first()).not.toHaveValue('')
  expect(await page.evaluate(() => window.scrollY), '✕ hat gescrollt').toBe(vorher2)
  await page.locator('[data-v3-treffer-weg]').click()
  await expect(page.locator('[data-v3-treffer-blatt]')).toBeVisible()
  expect(await page.evaluate(() => window.scrollY), '«Treffer anzeigen» hat gescrollt').toBe(vorher2)
})

test('(e) das Öffnen verschiebt den Lesetext um 0 px — darum ein Blatt und keine aufziehende Spalte', async ({ page }) => {
  // Das ist die MESSUNG, die die Alternative ausgeschlossen hat: «Spalte beim
  // Suchen aufziehen» hätte den Satzspiegel @1440 um 126 px seitwärts bewegt.
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await gliederungZu(page)

  const kasten = () => page.locator('#lc-lesespalte').evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.left + window.scrollX), w: Math.round(r.width) }
  })
  const vorher = await kasten()
  await suche(page)
  await expect(page.locator('[data-v3-treffer-blatt]')).toBeVisible()
  const nachher = await kasten()
  expect(nachher, `Satzspiegel verschoben: ${JSON.stringify(vorher)} → ${JSON.stringify(nachher)}`)
    .toEqual(vorher)
})

test('(f) Split-Pane: dieselbe Regel, und je Pane genau ein Blatt', async ({ page }) => {
  // Im Split sind die Panes schmaler als die xl-Schwelle — dort bleibt das
  // Bottom-Sheet der Weg (Platz für ein Blatt daneben gibt es nicht). Geprüft
  // wird darum, dass die Liste auch dort ERREICHBAR ist und dass die Wahl
  // zwischen Blatt und Sheet nicht beide gleichzeitig erzeugt (§5).
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/gesetze/bund/STPO?leser=v3')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('StPO', { timeout: 30000 })
  await expect(page.locator('[data-v3-suchsprung] input').first()).toBeVisible({ timeout: 20000 })

  const feld = page.locator('[data-v3-suchsprung] input').first()
  await feld.click()
  await feld.fill(BEGRIFF)
  await expect(page.locator('[data-treffer-liste]').first()).toBeVisible({ timeout: 15000 })

  // Mit STEHENDER Spalte gibt es KEIN Blatt — die Liste steht in der Spalte, und
  // zwei Listen gleichzeitig wären die Doppelwahrheit, die `LeserGliederung`
  // ausdrücklich ausschliesst.
  await expect(page.locator('[data-v3-aside]')).toHaveCount(1)
  await expect(page.locator('[data-v3-treffer-blatt]')).toHaveCount(0)
  await expect(page.locator('[data-treffer-liste]')).toHaveCount(1)
})
