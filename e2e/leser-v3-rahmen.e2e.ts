// @shard-gruppe: 3
import { test, expect, type Page } from '@playwright/test'

// ═══ Ä60 (c) · DER BREITERE LESER-RAHMEN (W2·5m-LESER-V3, Etappe H4) ═════════
//
// DAVID-ENTSCHEID 17.8.2026 (Chat, wörtlich «ja und c, mach so»): von den drei
// Optionen des Spalten-Entscheids gilt (c) — der Rahmen des GESETZ-LESERS wird
// breiter, damit Gesetzestext und Beiwerk-Blatt NEBENEINANDER stehen statt
// übereinander. Jede andere Seite bleibt auf `max-w-content`.
//
// DER BEFUND, DEN DAS BEHEBT (gemessen 17./18.8.2026, StPO Art. 429, Panel offen
// — verdeckte px je Textzeile bzw. am Erlass-Titel):
//
//   Viewport   1024   1150   1280   1440   1920
//   Text        320    257    192    112      0
//   Titel       328    313    248    168      0   ← das ist Ä59
//
// ROT ZU BEKOMMEN (§6.7): in `src/pages/gesetz-leser/v3/rahmenSpalten.ts` die
// Zeile `const blattSpur = …` auf `false` setzen (dann liegt das Blatt wieder
// über dem Text ⇒ (a)/(b)/(e) rot) oder `LESER_MAX_REM` auf 67 zurücksetzen
// (der Rahmen kann nicht mehr wachsen ⇒ (a) rot, weil die Spur den Text unter
// das Lesemass drückt). Beide Beweise sind am 18.8.2026 gefahren worden.

const ERLASS = '/gesetze/bund/STPO?leser=v3'

async function leserLaden(page: Page, breite: number): Promise<void> {
  await page.setViewportSize({ width: breite, height: 900 })
  await page.goto(ERLASS)
  await expect(page.locator('.lc-leser[data-leser-v3="rahmen"]')).toHaveCount(1)
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 })
  await page.evaluate(() => document.fonts?.ready)
  await page.evaluate(() => document.getElementById('art-429')?.scrollIntoView())
  await page.waitForTimeout(300)
}

/** Panel über den Kopf-Zähler aufziehen — der Weg, den auch ein Nutzer hat. */
async function panelAufziehen(page: Page): Promise<void> {
  await page.locator('[data-v3-panel-zaehler]').first().click()
  await expect(page.locator('[data-v3-panel]').first()).toBeVisible({ timeout: 20_000 })
}

interface Masse {
  text: { x: number; r: number; b: number } | null
  blatt: { x: number; r: number; b: number } | null
  titel: { x: number; r: number; b: number } | null
  aside: number
  schiene: number
  form: string | null
  rahmen: number
  ch: number | null
  overflow: number
}

/** Alle Masse in EINEM `evaluate` — sonst misst jede Zeile einen anderen Moment. */
function messen(page: Page): Promise<Masse> {
  return page.evaluate(() => {
    const kasten = (sel: string) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), r: Math.round(r.right), b: Math.round(r.width) }
    }
    // Lesemass nach der Methode von `leser-lesemass.e2e.ts`: der Absatz mit den
    // MEISTEN Zeichen je Zeile, nicht irgendeiner.
    let ch: number | null = null
    let text: { x: number; r: number; b: number } | null = null
    document.querySelectorAll('#lc-lesespalte [id^="art-"] p').forEach((p) => {
      const inhalt = (p.textContent ?? '').trim()
      if (inhalt.length < 40) return
      const range = document.createRange()
      range.selectNodeContents(p)
      const kaesten = range.getClientRects()
      if (kaesten.length < 3) return
      const wert = Math.round(inhalt.length / kaesten.length)
      if (ch === null || wert > ch) {
        ch = wert
        const r = (p as HTMLElement).getBoundingClientRect()
        text = { x: Math.round(r.x), r: Math.round(r.right), b: Math.round(r.width) }
      }
    })
    // Ohne umbrechenden Absatz (schmale Spalte) trägt die Lesespalte selbst die
    // Kante — gemessen wird dann sie, nie gar nichts.
    return {
      text: text ?? kasten('#lc-lesespalte'),
      blatt: kasten('[data-v3-panel-form]'),
      titel: kasten('[data-v3-erlass-kopf] h1') ?? kasten('h1'),
      aside: document.querySelectorAll('[data-v3-aside]').length,
      schiene: document.querySelectorAll('[data-v3-gliederung-schiene]').length,
      form: document.querySelector('[data-v3-panel-form]')?.getAttribute('data-v3-panel-form') ?? null,
      rahmen: Math.round(document.querySelector('[data-leser-v3="rahmen"]')!.getBoundingClientRect().width),
      ch,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
}

/** Überlappung zweier Kästen in px (0 = keine). */
function deckung(a: { x: number; r: number } | null, b: { x: number; r: number } | null): number {
  if (!a || !b) return 0
  return Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x))
}

test.describe('Ä60 (c) — Text und Beiwerk-Blatt stehen nebeneinander', () => {
  // ── (a) @1440: die volle Lage — drei Spuren, nichts verdeckt ───────────────
  test('(a) @1440: Blatt als eigene Spur, keine Überlappung, Lesemass ≤ 80 ch', async ({ page }) => {
    await leserLaden(page, 1440)
    const zu = await messen(page)
    // Positiv-Sonde (§6.7 b): OHNE Panel ist der Rahmen unverändert der alte —
    // sonst prüfte der Fall unten eine Seite, die immer schon breit war.
    expect(zu.rahmen, '@1440 mit geschlossenem Panel ist der Rahmen nicht mehr 1072 px — die Aufweitung greift zu früh')
      .toBe(1072)

    await panelAufziehen(page)
    const auf = await messen(page)

    expect(auf.form, '@1440 trägt das Blatt nicht die eigene Spur').toBe('spalte')
    expect(auf.aside, '@1440 passen alle drei Spuren — die Gliederungsspalte muss stehen bleiben').toBe(1)
    expect(deckung(auf.text, auf.blatt),
      `Blatt verdeckt den Lesetext (Text ${auf.text?.x}…${auf.text?.r}, Blatt ${auf.blatt?.x}…${auf.blatt?.r})`)
      .toBe(0)
    // Ä59: derselbe Befund am Erlass-Titel, und mit derselben Messung erledigt.
    expect(deckung(auf.titel, auf.blatt), 'der Erlass-Titel liegt unter dem Blatt (Ä59)').toBe(0)
    // Das Lesemass bleibt, was es war: die Spur nimmt den freien Rand, nicht den Text.
    expect(auf.text!.b, '@1440 verliert die Lesespalte durch die Spur an Breite').toBe(zu.text!.b)
    expect(auf.ch!, `Lesemass ${auf.ch} ch (WCAG SC 1.4.8)`).toBeLessThanOrEqual(80)
    expect(auf.overflow, 'waagrechter Überlauf des Dokuments').toBeLessThanOrEqual(1)
  })

  // ── (b) @1150: der enge Fall — die Gliederung weicht, der Text bleibt ──────
  test('(b) @1150: keine Überlappung, Textspalte ≥ 28 rem, Schiene statt Spalte', async ({ page }) => {
    await leserLaden(page, 1150)
    await panelAufziehen(page)
    const auf = await messen(page)

    expect(auf.form, '@1150 trägt das Blatt nicht die eigene Spur').toBe('spalte')
    expect(deckung(auf.text, auf.blatt), 'Blatt verdeckt den Lesetext @1150').toBe(0)
    expect(deckung(auf.titel, auf.blatt), 'der Erlass-Titel liegt unter dem Blatt @1150 (Ä59)').toBe(0)
    // Die Gliederung weicht auf ihre Schiene — und ist damit EIN Klick entfernt,
    // nicht fort (`rahmenSpalten`: die Spalte bleibt nur bei vollem Lesemass).
    expect(auf.aside, '@1150 stehen Gliederungsspalte UND Blatt — dann ist der Text zu schmal').toBe(0)
    expect(auf.schiene, '@1150 fehlt die Schiene — die Gliederung wäre unerreichbar').toBe(1)
    // 28 rem = 448 px ist der Boden, den `rahmenSpalten.LESE_MIN` zusichert.
    expect(auf.text!.b, `Lesespalte @1150 nur ${auf.text!.b} px`).toBeGreaterThanOrEqual(448)
    expect(auf.overflow, 'waagrechter Überlauf des Dokuments @1150').toBeLessThanOrEqual(1)
  })

  // ── (c) die Spaltengrenze 1024 ist UNVERÄNDERT ────────────────────────────
  // Der Rahmen wird breiter — die Schwelle, ab der die Gliederung überhaupt eine
  // Spalte sein kann, bleibt der Viewport 1024 (A-8, Kap. 12: die Umstellung auf
  // eine Element-Messung würde sie verschieben und ist darum NICHT erfolgt).
  test('(c) @1024 trägt die Gliederungsspalte, @1023 nicht — die Grenze bleibt', async ({ page }) => {
    await leserLaden(page, 1024)
    expect((await messen(page)).aside, '@1024 fehlt die Gliederungsspalte — die Grenze ist gewandert').toBe(1)

    await leserLaden(page, 1023)
    const schmal = await messen(page)
    expect(schmal.aside, '@1023 steht eine Gliederungsspalte — die Grenze ist gewandert').toBe(0)
    // Und unter 1024 bleibt ALLES wie bisher (David: «unter 1024 bleibt alles wie
    // heute»): das Blatt bekommt dort KEINE Spur, der Rahmen wächst nicht.
    await panelAufziehen(page)
    const auf = await messen(page)
    expect(auf.form, '@1023 hat das Blatt eine eigene Spur bekommen — unter 1024 sollte nichts anders sein').toBe('rechts')
    expect(auf.rahmen, '@1023 ist der Rahmen gewachsen').toBe(schmal.rahmen)
  })

  // ── (d) jede andere Seite bleibt auf `max-w-content` ──────────────────────
  test('(d) Startseite und Rechner behalten ihre Inhaltsbreite (1072 px @1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    for (const pfad of ['/', '/gesetze']) {
      await page.goto(pfad)
      await expect(page.locator('main#inhalt')).toBeVisible({ timeout: 20_000 })
      const breite = await page.evaluate(() => {
        const wrap = document.querySelector('main#inhalt > div') as HTMLElement | null
        if (!wrap) return null
        const cs = getComputedStyle(wrap)
        return Math.round(wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))
      })
      expect(breite, `${pfad}: Inhaltsbreite ${breite} px statt 1072 — die Leser-Aufweitung leckt`).toBe(1072)
    }
  })

  // ── (f) Ä86 · die Spur ist Layout, kein Popover ───────────────────────────
  // BEFUND (Klick-Test 18.8.2026, Stand `6ca1609b3`, @1440/@1024): das
  // angedockte Panel schloss bei JEDEM Klick in die Lesespalte — Textmarkieren
  // bei offenem Panel war unmöglich (`usePopoverAutoZu` Modus «beiwerk»).
  // Sobald das Blatt als eigene Spur NEBEN dem Text steht, ist es kein
  // aufgezogenes Blatt mehr: Schliessen nur über ✕ · Esc · Zweitklick auf den
  // Zähler · «r». UNTER 1024 px bleibt es beim alten Verhalten — der dritte
  // Fall unten ist die Gegenprobe dazu (§6.7: sonst prüfte (f) nur, dass
  // irgendwo nichts schliesst).
  for (const breite of [1440, 1150]) {
    test(`(f) @${breite}: Klick in den Text lässt das Blatt offen, Auswahl möglich`, async ({ page }) => {
      await leserLaden(page, breite)
      await panelAufziehen(page)
      const panel = page.locator('[data-v3-panel]').first()

      const absatz = page.locator('#lc-lesespalte [id^="art-"] p').first()
      await absatz.scrollIntoViewIfNeeded()
      await absatz.click({ position: { x: 5, y: 5 } })
      await expect(panel, `@${breite}: der Klick in den Text hat das Blatt geschlossen`).toBeVisible()

      // Und wirklich MARKIEREN, nicht nur klicken: der Dreifachklick wählt den
      // Absatz. Ein Blatt, das dabei zugeht, macht die Auswahl unbrauchbar.
      await absatz.click({ clickCount: 3 })
      const auswahl = await page.evaluate(() => (window.getSelection()?.toString() ?? '').trim().length)
      expect(auswahl, `@${breite}: nichts markiert`).toBeGreaterThan(20)
      await expect(panel, `@${breite}: das Markieren hat das Blatt geschlossen`).toBeVisible()

      // Die benannten Wege heraus bleiben: Zweitklick auf den Zähler schliesst.
      await page.locator('[data-v3-panel-zaehler]').first().click()
      await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    })
  }

  test('(f2) Gegenprobe @1023: unter der Spalten-Grenze schliesst der Aussenklick weiterhin', async ({ page }) => {
    await leserLaden(page, 1023)
    await panelAufziehen(page)
    await expect(page.locator('[data-v3-panel-form="rechts"]')).toBeVisible()
    const absatz = page.locator('#lc-lesespalte [id^="art-"] p').first()
    await absatz.scrollIntoViewIfNeeded()
    await absatz.click({ position: { x: 5, y: 5 } })
    await expect(page.locator('[data-v3-panel]'),
      '@1023 bleibt das Blatt offen — die neue Regel leckt unter die 1024er-Grenze').toHaveCount(0)
  })

  // ── (e) der gelesene Text bleibt an seiner Leseposition ──────────────────
  // Die Aufweitung verstellt die BREITE des Rahmens. Sie darf den gelesenen
  // Text darum waagrecht bewegen (die Spur braucht Platz) — senkrecht NICHT.
  // Ein Blatt, das beim Aufziehen die Lesestelle wegschiebt, ist genau der
  // Mangel, den `useStickAusgleich` für die Gliederung behoben hat.
  test('(e) Öffnen und Schliessen verschieben die Lesestelle senkrecht nicht', async ({ page }) => {
    await leserLaden(page, 1440)
    const y = () => page.evaluate(() => Math.round(document.getElementById('art-429')!.getBoundingClientRect().y))
    const vorher = await y()
    await panelAufziehen(page)
    expect(Math.abs((await y()) - vorher), 'das Aufziehen verschiebt die Lesestelle senkrecht').toBeLessThanOrEqual(2)
    // Und zurück: der Rundlauf lässt keinen Versatz zurück (Klasse Ä26/S2).
    await page.locator('[data-v3-panel-zu]').first().click()
    await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    expect(Math.abs((await y()) - vorher), 'nach dem Schliessen steht die Lesestelle woanders').toBeLessThanOrEqual(2)
    // Der Rahmen ist danach wieder genau der alte — die Aufweitung ist an das
    // offene Blatt gebunden, nicht an den Seitenaufruf.
    expect((await messen(page)).rahmen, 'der Rahmen bleibt nach dem Schliessen aufgeweitet').toBe(1072)
  })
})
