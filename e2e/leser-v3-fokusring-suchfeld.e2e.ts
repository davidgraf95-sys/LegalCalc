// @shard-gruppe: 7
// ─── Ä67 (David-Befund 17.8.2026 abends) · DER FOKUSRING WIRD NICHT BESCHNITTEN ─
//
// BEFUND, wörtlich: «um das suchfeld erscheint bei klick darin ein braun
// umrundetes feld dass abgeschnitten ist. ändern.»
//
// GEMESSEN am Prod-Stand (afc008c19), StPO/V3 @1440, Gliederung als Spalte, Feld
// fokussiert:
//   Feld                       x = 184 … 464
//   Ring (`outline`, 2 px, `outline-offset: 0`)   x = 182 … 466
//   Clip (`[data-v3-leiste-scroller]`, `overflow-x: hidden`)  x = 184 …
//   ⇒ linke Ring-Kante 2 px AUSSERHALB des Clips — abgeschnitten.
// `outline` liegt immer aussen; ein Ring, der aus seinem Element herausragt, ist
// in jedem scrollenden Behälter angreifbar. Der Fix zieht ihn nach INNEN
// (`outline-offset: -2px`, index.css Ä67), womit ihn kein Vorfahre mehr treffen
// kann — heute nicht und nach dem nächsten Layout-Umbau auch nicht.
//
// WAS DIESE SPEC PRÜFT: alle VIER Kanten des Ring-Rechtecks gegen das
// Clip-Rechteck des ENGSTEN clippenden Vorfahren — nicht die CSS-Deklaration.
// Eine Zusicherung auf `outline-offset === '-2px'` wäre eine Behauptung über die
// Schreibweise; hier steht die Frage, die David gestellt hat: ist etwas
// abgeschnitten.
//
// DREI LAGEN, weil das Feld drei Zuhause hat (Ä19): Spalte (dort trat der Befund
// auf), Kopf-Zone bei eingeklappter Gliederung, und die Spalte im GESCROLLTEN
// Zustand — dort führt der klebende Sockel nur 2 px über dem Feld, die OBERE
// Kante war also derselbe Fall wie die linke.
//
// ROT ZU BEKOMMEN (§6.7): in `src/index.css` beim Selektor
// `.lc-input.lc-v3-feld:focus` den Wert `outline-offset: -2px` auf `0` setzen —
// der Vorzustand. Dann meldet (a) links −2 px und (c) oben −2 px.
import { test, expect, type Page } from '@playwright/test'

type Kanten = {
  links: number; oben: number; rechts: number; unten: number;
  clipMarke: string; ring: unknown; ow: number;
}

/**
 * Überstand des Ring-Rechtecks über den engsten clippenden Vorfahren, je Kante.
 * Positiv = ragt hinaus (= abgeschnitten). Kein clippender Vorfahre ⇒ alle 0.
 */
async function ringKanten(page: Page): Promise<Kanten> {
  return page.evaluate(() => {
    const inp = document.querySelector('[data-v3-suchsprung] input') as HTMLElement | null
    if (!inp) throw new Error('kein Suchfeld im DOM')
    const cs = getComputedStyle(inp)
    const fb = inp.getBoundingClientRect()
    const ow = parseFloat(cs.outlineWidth) || 0
    const oo = parseFloat(cs.outlineOffset) || 0
    // `outline` wird ab der Border-Box nach AUSSEN gezeichnet; ein negativer
    // Offset zieht das Ring-Rechteck nach innen. Bei `-ow` liegt es genau auf der
    // Border-Box, also vollständig im Element.
    const ring = {
      l: fb.left - oo - ow, t: fb.top - oo - ow,
      r: fb.right + oo + ow, b: fb.bottom + oo + ow,
    }
    let el = inp.parentElement
    let clip: { l: number; t: number; r: number; b: number; marke: string } | null = null
    while (el && el !== document.documentElement) {
      const s = getComputedStyle(el)
      const clippt = [s.overflow, s.overflowX, s.overflowY]
        .some((v) => v === 'hidden' || v === 'clip' || v === 'auto' || v === 'scroll')
      if (clippt) {
        const b = el.getBoundingClientRect()
        const marke = el.hasAttribute('data-v3-leiste-scroller') ? 'data-v3-leiste-scroller'
          : el.hasAttribute('data-toc') ? 'data-toc'
          : el.hasAttribute('data-v3-such-zone') ? 'data-v3-such-zone'
          : el.tagName.toLowerCase()
        clip = { l: b.left, t: b.top, r: b.right, b: b.bottom, marke }
        break
      }
      el = el.parentElement
    }
    if (!clip) {
      return { links: 0, oben: 0, rechts: 0, unten: 0, clipMarke: '(keiner)', ring, ow }
    }
    return {
      links: +(clip.l - ring.l).toFixed(1),
      oben: +(clip.t - ring.t).toFixed(1),
      rechts: +(ring.r - clip.r).toFixed(1),
      unten: +(ring.b - clip.b).toFixed(1),
      clipMarke: clip.marke, ring, ow,
    }
  })
}

function pruefeGanz(k: Kanten, lage: string): void {
  // Der Ring muss überhaupt einer sein — 0 px breit wäre ein Tor, das nicht
  // scheitern kann (§6.7, und WCAG 2.4.7 verlangt einen sichtbaren Indikator).
  expect(k.ow, `${lage}: kein Fokusring gemessen (outline-width 0)`).toBeGreaterThanOrEqual(2)
  for (const kante of ['links', 'oben', 'rechts', 'unten'] as const) {
    expect(
      k[kante],
      `${lage}: Ring ${kante} um ${k[kante]} px vom Clip «${k.clipMarke}» beschnitten — Ring ${JSON.stringify(k.ring)}`,
    ).toBeLessThanOrEqual(0)
  }
}

async function warteLeser(page: Page): Promise<void> {
  await page.goto('/gesetze/bund/STPO?leser=v3')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('StPO', { timeout: 30000 })
  await expect(page.locator('[data-v3-suchsprung] input').first()).toBeVisible({ timeout: 20000 })
  await page.evaluate(() => document.fonts?.ready)
}

async function fokussiere(page: Page): Promise<void> {
  const feld = page.locator('[data-v3-suchsprung] input').first()
  await feld.click()
  // Vorbedingung: der Ring gehört dem Feld, nicht einem Nachbarn.
  await expect(feld).toBeFocused()
}

for (const schema of ['light', 'dark'] as const) {
  test(`(a) Spalte @1440 (${schema}): Ring vollständig sichtbar — der Ort des Befunds`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: schema, reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await warteLeser(page)
    // Vorbedingung: die Gliederung STEHT als Spalte, das Feld liegt also im
    // Leisten-Scroller — genau die Lage, in der David geklickt hat.
    await expect(page.locator('[data-v3-aside]')).toHaveCount(1)
    await fokussiere(page)
    const k = await ringKanten(page)
    expect(k.clipMarke, 'Vorbedingung: das Feld liegt in einem clippenden Scroller').not.toBe('(keiner)')
    pruefeGanz(k, `Spalte/${schema}`)
  })
}

test('(b) Kopf-Zone bei eingeklappter Gliederung: Ring vollständig sichtbar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  const zu = page.locator('[data-v3-gliederung-zu]')
  await expect(zu).toHaveCount(1)
  await zu.click()
  await expect(page.locator('[data-v3-such-zone] input')).toHaveCount(1)
  await fokussiere(page)
  pruefeGanz(await ringKanten(page), 'Kopf-Zone')
})

test('(c) Spalte GESCROLLT: auch die obere Kante bleibt ganz', async ({ page }) => {
  // Der Sockel über dem Feld führt nur `pt-0.5` (2 px). Scrollt die Leiste, liegt
  // die obere Ring-Kante am Clip-Rand — derselbe Fall wie links, nur oben.
  await page.setViewportSize({ width: 1440, height: 900 })
  await warteLeser(page)
  await expect(page.locator('[data-v3-aside]')).toHaveCount(1)
  const scroller = page.locator('[data-v3-leiste-scroller]').first()
  await expect(scroller).toHaveCount(1)

  // Erst ALLE Gliederungsstufen aufklappen. Beim ersten Lauf dieser Fassung
  // scrollte die Leiste sonst nur 55 px weit (der Baum steht eingeklappt), und
  // die feste Marke «> 100» scheiterte an der PRÜFMECHANIK statt an der Sache —
  // ein Fehlschlag, der nichts über den Ring aussagt.
  await page.locator('[data-v3-alle]').click()
  // POSITIV-Vorbedingung: die Leiste ist überhaupt scrollbar. Ohne sie liefe der
  // Test gegen einen ungescrollten Scroller und behauptete nichts (§6.7).
  await expect
    .poll(async () => scroller.evaluate((el) => el.scrollHeight - el.clientHeight), { timeout: 15000 })
    .toBeGreaterThan(200)

  await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight })
  await expect.poll(async () => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(100)
  await fokussiere(page)
  pruefeGanz(await ringKanten(page), 'Spalte gescrollt')
})

// «(d) V1 ist unberührt — der Ring dort ist der alte» GELÖSCHT 21.8.2026 (H5).
// Bewachte die Fassaden-Grenze `.lc-input` (ganze App) vs. `.lc-v3-feld`
// (nur V3) gegen die Ist-Hülle — mit deren Löschung gibt es kein zweites
// Feld mehr, das mitgezogen werden könnte.
