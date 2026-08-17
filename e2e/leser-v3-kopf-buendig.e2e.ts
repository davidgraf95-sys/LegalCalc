// @shard-gruppe: 6
// ─── Ä1 (LESER-V3 H2b) · KEINE LEERZONE UNTER DER KRUMEN-LEISTE ──────────────
//
// BEFUND, gemessen 17.8.2026 @1440 (StPO, `?leser=v3`): die Krumen-Leiste endet
// bei y = 102, der V3-Kopf begann bei y = 150 — 48 px Leerzone im RUHEZUSTAND,
// die beim ersten Scroll auf 0 px zusammenfiel (dort klebt der Kopf bei y = 100).
// Der Leser sah zwei verschiedene Bilder derselben Kopfzone, je nachdem ob er
// schon gescrollt hatte.
//
// URSACHE: die 48 px sind die obere Polsterung des Route-Wrappers
// (`components/layout/Shell.tsx`, `py-8 sm:py-12`); im Split-View-Pane sind es
// 24 px (`components/layout/Pane.tsx`, `py-6`). Sie gehört dem Seiteninhalt, nicht
// einer klebenden Leiste. Der V3-Kopf verschluckt sie über
// `--leser-v3-kopf-luecke` (Vorgabe in `src/index.css`, Pane-Wert inline vom
// Rahmen).
//
// WARUM DIESE SPEC UND NICHT EINE ZUSICHERUNG: der Wert ist an ZWEI fremde
// Polsterungen gekoppelt, die niemand für den Leser pflegt. Ändert eine davon,
// öffnet sich die Leerzone wieder — still. Die Spec MISST die Lücke auf allen
// drei Breiten gegen 0 statt sie zu behaupten.
//
// ROT ZU BEKOMMEN (§6.7): in `src/pages/gesetz-leser/v3/LeserKopf.tsx` die Zeile
// `marginTop: 'calc(-1 * var(--leser-v3-kopf-luecke, 0px))'` entfernen — dann
// misst der Fall (a) 48 px, (b) 32 px und (c) 24 px statt je 0.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Lücke zwischen der Unterkante der App-Krumen-Leiste und der Oberkante des
 *  V3-Kopfs. */
async function luecke(page: Page, krumeWahl: string): Promise<number> {
  return page.evaluate((sel) => {
    const krume = document.querySelector(sel)
    const kopf = document.querySelector('[data-v3-kopf]')
    if (!krume || !kopf) return Number.NaN
    return Math.round(kopf.getBoundingClientRect().top - krume.getBoundingClientRect().bottom)
  }, krumeWahl)
}

/** ── B3 (H2b-Nachzug) · ZWEISEITIG, NICHT NUR NACH OBEN ─────────────────────
 *  Die Zusicherung lautete `toBeLessThanOrEqual(0)` und war damit halb blind: sie
 *  blieb grün, wenn der Kopf UNTER die Krumen-Leiste rutscht — bei −40 px läge er
 *  hinter ihr, die Ortsangabe wäre verdeckt, und kein Tor hätte es gemerkt. Ein
 *  Tor, das nur eine Richtung kennt, bewacht die halbe Aussage (§6.7).
 *  DIE SCHRANKE: −2 … 0 px. Nach unten 0, weil eine positive Lücke der Befund
 *  ist; nach oben −2, weil der Kopf konstruktiv bündig anschliesst und 1–2 px
 *  Überlappung nur aus Sub-Pixel-Rundung entstehen könnten (gemessen 17.8.2026:
 *  0 px auf allen drei Breiten, keine Überlappung).
 *  ROT IN BEIDE RICHTUNGEN (§6.7): in `v3/LeserKopf.tsx` die Zeile
 *  `marginTop: 'calc(-1 * var(--leser-v3-kopf-luecke, 0px))'` ENTFERNEN ⇒ +48/+32/
 *  +24 px; sie auf `marginTop: '-4rem'` setzen ⇒ −64/−64/−64 px. Beide gemessen. */
const LUECKE_MIN = -2
const LUECKE_MAX = 0

function buendig(px: number, wo: string): void {
  expect(px, `Leerzone ${wo}: ${px} px — erlaubt ist ${LUECKE_MIN} … ${LUECKE_MAX}`)
    .toBeLessThanOrEqual(LUECKE_MAX)
  expect(px, `Der Kopf rutscht unter die Krumen-Leiste (${wo}): ${px} px`)
    .toBeGreaterThanOrEqual(LUECKE_MIN)
}

test.describe('Ä1 — der V3-Kopf sitzt bündig an der Krumen-Leiste', () => {
  test('(a) Einzelansicht @1440: im Ruhezustand UND gescrollt keine Leerzone', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    const ruhe = await luecke(page, '[data-inhalt-kopf]')
    buendig(ruhe, 'Ruhezustand @1440 (war 48 px vor H2b)')

    // Und im geklebten Zustand ebenfalls — sonst wäre der Ruhezustand nur zufällig
    // richtig und das Bild sprang beim Scrollen weiterhin.
    await page.evaluate(() => window.scrollBy(0, 1200))
    await page.waitForTimeout(300)
    buendig(await luecke(page, '[data-inhalt-kopf]'), 'nach 1200 px Scroll @1440')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Handy @390: dieselbe Bündigkeit bei kleinerer Wrapper-Polsterung', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    buendig(await luecke(page, '[data-inhalt-kopf]'), '@390 (Wrapper dort py-8 = 32 px)')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(c) Split-View: der Kopf des Panes sitzt bündig an der Pane-Titelleiste', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 20_000 })

    // Im Pane ist der Bezugspunkt die Pane-Titelleiste (PaneKopf) statt der
    // App-Krume: sie liegt AUSSERHALB des Pane-Scrollers und ist dort die Kante,
    // an der der V3-Kopf klebt (`--leser-v3-kopf-top: 0`).
    const paneLuecke = await page.evaluate(() => {
      const pane = document.querySelector('[data-pane="sekundaer"]')
      const scroller = pane as HTMLElement | null
      const kopf = pane?.querySelector('[data-v3-kopf]')
      if (!scroller || !kopf) return Number.NaN
      return Math.round(kopf.getBoundingClientRect().top - scroller.getBoundingClientRect().top)
    })
    buendig(paneLuecke, 'im Pane (Wrapper dort py-6 = 24 px)')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── A4 (H2b-Nachzug) · DIE KENNUNG WIRD NIE ELLIPSIERT ────────────────────
  // BEFUND, gemessen 17.8.2026 @1440 am LugÜ: Ä21 gab dem Kürzel `min-w-0
  // truncate`, und in einer Zone mit ZWEI truncate-Geschwistern verteilt Flexbox
  // den Platzmangel auf beide — das vier Zeichen kurze «LugÜ» wurde zu «Lu…»
  // (`scrollWidth` 29 in `clientWidth` 23). Ausgerechnet die Kennung, die Ä-(d)
  // im Titel gerade nach vorn gezogen hat, verschwand als erste.
  // ROT ZU BEKOMMEN (§6.7): in `v3/LeserKopf.tsx` die Klassenwahl am
  // `data-v3-kopf-kuerzel` wieder fest auf `min-w-0 truncate` setzen — dann misst
  // der Fall LugÜ @1440 erneut 29 in 23.
  test('(d) das Erlass-Kürzel im Kopf ist nie angeschnitten (LugÜ · StPO · ZH-211.11)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    for (const [pfad, kuerzel, breite] of [
      ['/gesetze/bund/LUGUE?leser=v3', 'LugÜ', 1440],
      ['/gesetze/bund/STPO?leser=v3', 'StPO', 1440],
      ['/gesetze/kanton/ZH-211.11?leser=v3', null, 1440],
      ['/gesetze/bund/LUGUE?leser=v3', 'LugÜ', 390],
    ] as const) {
      await page.setViewportSize({ width: breite, height: 900 })
      await page.goto(pfad)
      const el = page.locator('[data-v3-kopf-kuerzel]')
      await expect(el).toBeVisible({ timeout: 20_000 })
      const mass = await el.evaluate((n) => ({
        text: n.textContent ?? '', sw: n.scrollWidth, cw: n.clientWidth,
      }))
      // ZH-211.11 trägt als Kürzel den ganzen Namen (45 Zeichen) — dort DARF
      // gekürzt werden, dann ist das Kürzel der Titel und es gibt keinen zweiten.
      // Geprüft wird also nur, wo eine echte KENNUNG steht.
      if (kuerzel === null) {
        expect(mass.text.length, 'ZH-211.11 trägt kein langes Kürzel mehr — Fall untauglich')
          .toBeGreaterThan(20)
        continue
      }
      expect(mass.text.trim(), `${pfad}: falsches Kürzel im Kopf`).toBe(kuerzel)
      expect(mass.sw, `${pfad} @${breite}: «${kuerzel}» ist ellipsiert (${mass.sw} in ${mass.cw})`)
        .toBeLessThanOrEqual(mass.cw)
    }

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
