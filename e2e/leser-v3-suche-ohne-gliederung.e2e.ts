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

/**
 * Suchen und warten, bis der Begriff durch das Debounce im Modell ist.
 *
 * WORAUF gewartet wird, hängt von der Lage ab — und das ist keine Feinheit,
 * sondern ein beim Bau gesehener Fehlschlag: `[data-v3-treffer-weg]` (die
 * Zähler-Zeile) lebt in der Such-ZONE, und die gibt es nur OHNE stehende Spalte.
 * Mit Spalte wartete der Helfer auf ein Element, das dort nie erscheint.
 */
async function suche(page: Page, wort = BEGRIFF, mitSpalte = false): Promise<void> {
  const feld = page.locator('[data-v3-suchsprung] input').first()
  await feld.click()
  await feld.fill(wort)
  const zeuge = mitSpalte ? '[data-treffer-liste]' : '[data-v3-treffer-weg]'
  await expect(page.locator(zeuge).first()).toBeVisible({ timeout: 15000 })
}

/**
 * Liegt das Rechteck VOLLSTÄNDIG im Viewport? Genau das war beim Prod-Stand
 * falsch, während `isVisible()` true meldete.
 *
 * GEMESSEN WIRD DAS BLATT, NICHT DIE LISTE. Beim ersten Lauf dieser Fassung stand
 * hier `[data-treffer-liste]` — und die ist im Blatt 4519 px hoch (StPO,
 * «Entschädigung»), weil sie darin SCROLLT. Die Zusicherung wäre damit nur
 * erfüllbar gewesen, wenn das Blatt jede Trefferzeile gleichzeitig zeigt; das
 * verlangt niemand und widerspräche dem Höhendeckel aus Ä19. Die Frage, die
 * Davids Befund stellt, lautet: sieht man das Ergebnis, ohne suchen zu müssen —
 * also ist die FLÄCHE im Bild und steht oben drin etwas Lesbares.
 */
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
    // begann das Rechteck bei y = 755 und war 3596 px hoch — es begann also
    // unterhalb der Falz. Gemessen wird die FLÄCHE, auf der die Liste liegt.
    const { drin, box } = await imViewport(page, '[data-v3-treffer-blatt]')
    expect(drin, `Treffer-Blatt nicht vollständig im Viewport: ${JSON.stringify(box)}`).toBe(true)

    // Und darin steht wirklich etwas Lesbares: die erste Trefferzeile liegt
    // ebenfalls ganz im Bild. Ohne diese zweite Sonde wäre ein leeres,
    // korrekt platziertes Blatt grün (§6.7).
    const ersteZeile = await imViewport(page, '[data-v3-treffer-blatt] [data-treffer-artikel]')
    expect(ersteZeile.drin, `erste Trefferzeile nicht im Bild: ${JSON.stringify(ersteZeile.box)}`).toBe(true)

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

test('(d) Esc schliesst ohne Sprung — der gelesene Text bleibt exakt stehen', async ({ page }) => {
  // ── WAS «KEIN SPRUNG» HIER HEISST, und warum nicht `scrollY` ────────────────
  // GEMESSEN beim ersten Lauf dieser Fassung: nach Esc stand `scrollY` auf 876
  // statt 900 — genau **24 px** weniger. Das ist kein Defekt, sondern die
  // Gegenbewegung: die Such-Zone im klebenden Kopf schrumpft beim Leeren von
  // `SUCH_H_AKTIV` (4.25 rem) auf `SUCH_H_RUHE` (2.75 rem), also um exakt diese
  // 24 px (`v3/SuchZone.tsx`, B9). Alles darunter rückt 24 px hoch, und Chromes
  // Scroll-Anchoring zieht `scrollY` um dieselben 24 px nach — damit der Leser
  // NICHTS wandern sieht.
  //
  // Eine Zusicherung auf gleichbleibendes `scrollY` würde hier also das Gegenteil
  // dessen verlangen, was Pos. 14 verspricht: sie wäre nur erfüllbar, wenn der
  // Text tatsächlich springt. Gemessen wird darum die Grösse, um die es geht —
  // die Lage eines Artikels IM BILD. (Die ältere Spec
  // `leser-v3-esc-ohne-sprung` misst weiter `scrollY` und ist dort richtig: mit
  // stehender Gliederungs-Spalte gibt es gar keine Such-Zone, die wachsen kann.)
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await gliederungZu(page)
  await suche(page)
  await expect(page.locator('[data-v3-treffer-blatt]')).toBeVisible()

  // Erst ein Stück lesen, damit «kein Sprung» überhaupt etwas behauptet: bei
  // scrollY 0 wäre die Zusicherung trivial erfüllt (§6.7).
  await page.evaluate(() => window.scrollTo(0, 900))
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)

  // Ein Artikel, der gerade im Bild steht, ist der Zeuge.
  const zeuge = page.locator('#lc-lesespalte [id^="art-"]').first()
  const lage = () => zeuge.evaluate((el) => Math.round(el.getBoundingClientRect().top))
  const vorher = await lage()

  await page.locator('[data-v3-suchsprung] input').first().press('Escape')
  // Esc IM FELD ist Pos. 14: leeren, nicht springen. Damit endet die Suche und
  // das Blatt ist weg.
  await expect(page.locator('[data-v3-treffer-blatt]')).toHaveCount(0)
  await expect(page.locator('[data-v3-suchsprung] input').first()).toHaveValue('')
  const nachher = await lage()
  expect(
    Math.abs(nachher - vorher),
    `Esc hat den Lesetext bewegt: ${vorher} px → ${nachher} px im Bild`,
  ).toBeLessThanOrEqual(2)

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

test('(f) mit STEHENDER Spalte gibt es kein Blatt — nie zwei Listen', async ({ page }) => {
  // Die Kehrseite von (a): das Blatt ist der Ersatz für die fehlende Spalte, nicht
  // ein zweiter Ort daneben. Zwei Listen gleichzeitig wären die Doppelwahrheit,
  // die `LeserGliederung` ausdrücklich ausschliesst (§5).
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await suche(page, BEGRIFF, true)

  await expect(page.locator('[data-v3-aside]')).toHaveCount(1)
  await expect(page.locator('[data-v3-treffer-blatt]')).toHaveCount(0)
  await expect(page.locator('[data-treffer-liste]')).toHaveCount(1)
})

test('(g) Split-Pane: schmale Panes behalten das Bottom-Sheet, und nie beides', async ({ page }) => {
  // Im Split @1600 misst jedes Pane rund 590 px und unterschreitet damit die
  // xl-Schwelle — dort gibt es keinen Platz für ein Blatt NEBEN dem Text, und der
  // Weg zur Liste bleibt das Bottom-Sheet (Kap. 4b). Geprüft wird, dass die
  // Blatt-Weiche diese Breite nicht mit erwischt: sonst hinge das Blatt in einem
  // 590-px-Pane und verdeckte genau den Text, für den Ä19 es gebaut hat.
  test.slow() // zwei volle Leser-Instanzen
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
  await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 30000 })
  // Positiv-Sonde: es gibt wirklich zwei Felder (§6.7).
  await expect(page.locator('[data-v3-suchsprung] input')).toHaveCount(2, { timeout: 20000 })

  const feld = page.locator('[data-pane="primaer"] [data-v3-suchsprung] input')
  await feld.click()
  await feld.fill(BEGRIFF)
  // Der Zähler-Weg steht auch hier — die Liste ist erreichbar, nur anders.
  await expect(page.locator('[data-pane="primaer"] [data-v3-treffer-weg]')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-v3-treffer-blatt]'), 'Blatt im schmalen Pane').toHaveCount(0)
})
