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
//
// ── NACHGEFÜHRT AUF DIE A-2-WAHRHEIT (17.8.2026, Auftrag David) ──────────────
// Die Krumen-Leiste, an der der Kopf bündig sass, GIBT ES IN DER EINZELANSICHT
// NICHT MEHR (Leisten-Verschmelzung: die Seite trägt ihre Kopfzeile selbst).
// Damit hätte `luecke(page, '[data-inhalt-kopf]')` in (a)/(b) `NaN` gemessen —
// und `expect(NaN).toBeLessThanOrEqual(0)` ist rot, die Spec also nicht bloss
// stumm, sondern falsch. Nachgezogen wird der BEZUGSPUNKT, nicht die Schranke:
// oberhalb des Kopfes steht jetzt die Topbar, an ihr muss er bündig sitzen. Die
// Aussage ist unverändert streng («keine Leerzone, kein Verrutschen darunter»)
// und deckt seit A-2 sogar mehr, weil sie die neue Anschlusskante prüft.
// (c) bleibt Zeichen für Zeichen: im Pane bleibt die Titelleiste (sie trägt die
// Fenster-Steuerung) und damit der alte Bezugspunkt.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Lücke zwischen der Unterkante der Leiste ÜBER dem Kopf und dessen Oberkante.
 *  Seit A-2 ist das in der Einzelansicht die Topbar (`header.sticky`), im Pane
 *  weiterhin die Pane-Titelleiste. */
async function luecke(page: Page, obenWahl: string): Promise<number> {
  return page.evaluate((sel) => {
    const oben = document.querySelector(sel)
    const kopf = document.querySelector('[data-v3-kopf]')
    if (!oben || !kopf) return Number.NaN
    return Math.round(kopf.getBoundingClientRect().top - oben.getBoundingClientRect().bottom)
  }, obenWahl)
}

/** Die App-Topbar — der Anschlag, an dem der Kopf in der Einzelansicht klebt. */
const TOPBAR = 'header.sticky'

/** ── B3 (H2b-Nachzug) · ZWEISEITIG, NICHT NUR NACH OBEN ─────────────────────
 *  Die Zusicherung lautete `toBeLessThanOrEqual(0)` und war damit halb blind: sie
 *  blieb grün, wenn der Kopf UNTER die Krumen-Leiste rutscht — bei −40 px läge er
 *  hinter ihr, die Ortsangabe wäre verdeckt, und kein Tor hätte es gemerkt. Ein
 *  Tor, das nur eine Richtung kennt, bewacht die halbe Aussage (§6.7).
 *  DIE SCHRANKE: −2 … 0 px. Nach unten 0, weil eine positive Lücke der Befund
 *  ist; nach oben −2, weil der Kopf konstruktiv bündig anschliesst und 1–2 px
 *  Überlappung nur aus Sub-Pixel-Rundung entstehen könnten (gemessen 17.8.2026:
 *  0 px auf allen drei Breiten, keine Überlappung).
 *  ROT IN BEIDE RICHTUNGEN (§6.7), beides am 17.8.2026 gemessen:
 *   · NACH OBEN: in `v3/LeserKopf.tsx` die Zeile
 *     `marginTop: 'calc(-1 * var(--leser-v3-kopf-luecke, 0px))'` entfernen ⇒
 *     +48 px (a) / +32 px (b) / +24 px (c).
 *   · NACH UNTEN: `top: 'var(--leser-v3-kopf-top)'` auf `top: '0rem'` setzen ⇒
 *     im Ruhezustand 0 px, GESCROLLT −101 px (Messung 17.8.2026 vor A-2, Bezug
 *     Krumen-Leiste; seit A-2 ist der Bezug die Topbar, also −65 px): der Kopf
 *     klebt an der Fensterkante und schiebt sich unter die opake Leiste über
 *     ihm, die Ortsangabe ist verdeckt. GEGENPROBE, die NICHT trägt und darum hier
 *     steht: `marginTop: '-4rem'` bleibt grün — im Ruhezustand schluckt die
 *     Wrapper-Polsterung den Wert, im geklebten Zustand klemmt `top` ihn ab.
 *     Wer die untere Schranke prüfen will, muss also am `top` drehen. */
const LUECKE_MIN = -2
const LUECKE_MAX = 0

function buendig(px: number, wo: string): void {
  expect(px, `Leerzone ${wo}: ${px} px — erlaubt ist ${LUECKE_MIN} … ${LUECKE_MAX}`)
    .toBeLessThanOrEqual(LUECKE_MAX)
  expect(px, `Der Kopf rutscht unter die Krumen-Leiste (${wo}): ${px} px`)
    .toBeGreaterThanOrEqual(LUECKE_MIN)
}

test.describe('Ä1 — der V3-Kopf sitzt bündig an der Leiste über ihm', () => {
  test('(a) Einzelansicht @1440: im Ruhezustand UND gescrollt keine Leerzone', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    // A-2: die App-Krumen-Leiste ist weg — geprüft, damit der Bezugspunkt-Wechsel
    // unten nicht still an einer noch vorhandenen Leiste vorbeimisst.
    await expect(page.locator('[data-inhalt-kopf]')).toHaveCount(0)
    const ruhe = await luecke(page, TOPBAR)
    buendig(ruhe, 'Ruhezustand @1440 (war 48 px vor H2b, Bezug seit A-2 die Topbar)')

    // Und im geklebten Zustand ebenfalls — sonst wäre der Ruhezustand nur zufällig
    // richtig und das Bild sprang beim Scrollen weiterhin.
    await page.evaluate(() => window.scrollBy(0, 1200))
    await page.waitForTimeout(300)
    buendig(await luecke(page, TOPBAR), 'nach 1200 px Scroll @1440')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Handy @390: dieselbe Bündigkeit bei kleinerer Wrapper-Polsterung', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    await expect(page.locator('[data-inhalt-kopf]')).toHaveCount(0)
    buendig(await luecke(page, TOPBAR), '@390 (Wrapper dort py-8 = 32 px)')

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

  // ── (e) V6 (Nachzug 17.8.2026) · DER KOPF WÄCHST, DER TEXT BLEIBT STEHEN ───
  //
  // BEFUND des Ästhetik-Reviews, gemessen @1440 an der StPO: klappt man die
  // Gliederung ein, verliert der Leser die Spalte — und der klebende Kopf-BLOCK
  // übernimmt dafür die Such-Zone (Ä19). Er wächst von 121 auf 164 px. Der
  // Lesetext rutscht um dieselben ~43 px nach unten, die Scroll-Position bleibt
  // aber stehen: `#art-429` lag vorher bündig unter dem Kopf (y = 120) und danach
  // DAHINTER. Wer die Gliederung ausblendet, um mehr Text zu sehen, verliert als
  // erstes die Überschrift, an der er gerade las.
  //
  // GEPRÜFT WIRD DIE ZUSAGE, NICHT DIE ZAHL (§0.3): «der Artikelkopf, der vor dem
  // Umschalten sichtbar unter dem Kopf stand, steht danach immer noch unter ihm».
  // Eine feste Pixeldifferenz wäre an Schriftskala und Such-Zustand gebunden und
  // liefe bei der nächsten Höhenänderung falsch — die Aussage nicht.
  // Beide Richtungen, weil der Ausgleich in beide funktionieren muss: zuklappen
  // (Kopf wächst) und wieder aufklappen (Kopf schrumpft).
  //
  // ROT ZU BEKOMMEN (§6.7): in `v3/LeserRahmenV3.tsx` die drei `setzeTocOffen`
  // wieder durch `m.setTocOffen` ersetzen (oder in `v3/useStickAusgleich.ts` das
  // `scrollBy` streichen) ⇒ der Artikelkopf liegt nach dem Zuklappen hinter dem
  // Kopf, die Differenz ist die Höhe der Such-Zone.
  test('(e) V6 · Gliederung umschalten schiebt den gelesenen Artikel nicht unter den Kopf', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(1200) // der Anker-Sprung hat zwei Nachläufe

    /** Unterkante des klebenden Blocks und Oberkante des gelesenen Artikels. */
    const lage = () => page.evaluate(() => {
      const kopf = document.querySelector('[data-v3-kopf]')!.getBoundingClientRect()
      const art = document.querySelector('#art-429')!.getBoundingClientRect()
      return { kopfUnten: kopf.bottom, artOben: art.top, kopfHoehe: kopf.height }
    })

    // Vorbedingung (§6.7): der Artikel steht WIRKLICH sichtbar unter dem Kopf —
    // sonst prüfte der Test eine Lage, in der es nichts zu verlieren gibt.
    const vorher = await lage()
    expect(vorher.artOben, `Vorbedingung: #art-429 steht bei ${vorher.artOben}, Kopf endet bei ${vorher.kopfUnten}`)
      .toBeGreaterThanOrEqual(vorher.kopfUnten - 2)
    expect(vorher.artOben, 'Vorbedingung: #art-429 liegt nicht im Bild').toBeLessThan(900)

    // ZUKLAPPEN — der Kopf wächst um die Such-Zone.
    await page.locator('[data-v3-gliederung-zu]').click()
    await expect(page.locator('[data-v3-aside]')).toHaveCount(0)
    await page.waitForTimeout(400)
    const zu = await lage()
    expect(zu.kopfHoehe, `Vorbedingung: der Kopf ist nicht gewachsen (${vorher.kopfHoehe} → ${zu.kopfHoehe})`)
      .toBeGreaterThan(vorher.kopfHoehe + 1)
    expect(zu.artOben, `#art-429 liegt nach dem Zuklappen bei ${zu.artOben}, der Kopf endet bei ${zu.kopfUnten}`)
      .toBeGreaterThanOrEqual(zu.kopfUnten - 2)

    // AUFKLAPPEN — der Kopf schrumpft, und der Artikel bleibt wieder stehen.
    await page.locator('[data-v3-gliederung-auf]').click()
    await expect(page.locator('[data-v3-aside]')).toHaveCount(1)
    await page.waitForTimeout(400)
    const auf = await lage()
    expect(auf.artOben, `#art-429 liegt nach dem Aufklappen bei ${auf.artOben}, der Kopf endet bei ${auf.kopfUnten}`)
      .toBeGreaterThanOrEqual(auf.kopfUnten - 2)
    expect(auf.artOben, 'nach dem Aufklappen aus dem Bild gescrollt').toBeLessThan(900)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
