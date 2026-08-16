// @shard-gruppe: 4
// FAHRPLAN-LESER-V3, Kap. 4b — feste Reihenfolge der Seitenleiste:
//
//   ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)        scrollt MIT weg
//   [ Suchen oder «Art. 429» …                    ⌘K ]  scrollt MIT weg
//   Gliederung        [alles auf/zu]   [↑ Anfang]       ◀ ab hier sticky
//    1. Teil … / 1. Titel …
//
// `LeserSeitenleiste.tsx` ist reine Anordnung (§3): Übersicht, Feld und Baum
// kommen fertig herein, die Datei kennt weder Erlass noch Suchzustand.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

async function oeffneBGFA(page: Page): Promise<string[]> {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/gesetze/bund/BGFA?leser=v3')
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(page.locator('[data-v3-aside]')).toBeVisible({ timeout: 20_000 })
  return fehler
}

test.describe('Kap. 4b — feste Reihenfolge der Seitenleiste', () => {
  test('(a) Dokument-Reihenfolge: Übersicht → Feld → Gliederung', async ({ page }) => {
    const fehler = await oeffneBGFA(page)

    const reihenfolge = await page.evaluate(() => {
      const uebersicht = document.querySelector('[data-v3-uebersicht]')
      const feld = document.querySelector('[data-v3-leiste-feld]')
      const baumkopf = document.querySelector('[data-v3-leiste-baumkopf]')
      if (!uebersicht || !feld || !baumkopf) return null
      // Node.compareDocumentPosition: Bit 4 (DOCUMENT_POSITION_FOLLOWING) gesetzt
      // ⇒ das zweite Argument steht NACH dem Aufrufer im Dokument.
      const FOLGT = Node.DOCUMENT_POSITION_FOLLOWING
      return {
        uebersichtVorFeld: !!(uebersicht.compareDocumentPosition(feld) & FOLGT),
        feldVorBaumkopf: !!(feld.compareDocumentPosition(baumkopf) & FOLGT),
      }
    })
    expect(reihenfolge, 'einer der drei Anker fehlt im DOM').not.toBeNull()
    expect(reihenfolge!.uebersichtVorFeld, 'Übersicht steht nicht vor dem Feld').toBe(true)
    expect(reihenfolge!.feldVorBaumkopf, 'Feld steht nicht vor der Gliederung').toBe(true)

    expect(fehler).toEqual([])
  })

  test('(b) Übersicht + Feld scrollen weg, der Baum-Kopf klebt (sticky) — OR, dessen Leisteninhalt die Spalte übersteigt', async ({ page }) => {
    // GEFUNDENER PRODUKTFEHLER (16.8.2026, H1 — gemeldet, NICHT gefixt: kein
    // src/**-Zugriff in diesem Bau-Auftrag). Wurzel: `[data-v3-aside]`
    // (LeserRahmenV3.tsx) trägt nur `max-h-[calc(100dvh-var(--leser-kopf-h)-2rem)]`,
    // keine dazu passende `h-[...]`. Eine Prozent-/`h-full`-Höhe eines Kindes
    // (hier: `[data-v3-leiste]` → `[data-v3-leiste-scroller]`, LeserSeitenleiste.tsx)
    // braucht nach CSS-Spec eine EXPLIZITE Höhe des Vorfahren — `max-height`
    // allein reicht nicht. Ohne sie wächst der Scroller auf die volle
    // Inhaltshöhe (`scrollHeight === clientHeight`, gemessen an OR@1440×900:
    // 1082 === 1082, obwohl die Aside-Box nur 712 px hoch ist) und hat darum
    // NICHTS zu scrollen — der Überschuss wird von `overflow-hidden` am Aside
    // STUMM abgeschnitten statt über die Leiste erreichbar zu sein. Bestätigt
    // per Diagnose-Eingriff: `aside.style.height = <computed max-height>` senkt
    // `clientHeight` sofort auf 712 (Beleg im Bau-Bericht). Vorschlag (nicht
    // angewandt): dieselbe `calc(...)`-Formel als `h-[...]` neben `max-h-[...]`
    // an `[data-v3-aside]` ergänzen. Bis zum Fix bleibt dieser Fall `fixme` —
    // die Assertions unten sind die Zielsetzung und laufen automatisch wieder
    // mit, sobald `test.fixme` entfernt wird.
    test.fixme(true, 'Produktfehler: [data-v3-aside] fehlt h-[...] neben max-h-[...] — Leiste scrollt nicht, Inhalt wird stumm abgeschnitten (s. Kommentar oben)')
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/OR?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-v3-aside]')).toBeVisible({ timeout: 20_000 })

    const uebersicht = page.locator('[data-v3-uebersicht]')
    const baumkopf = page.locator('[data-v3-leiste-baumkopf]')
    await expect(uebersicht).toBeInViewport()
    await expect(baumkopf).toBeInViewport()

    const scroller = page.locator('[data-v3-leiste-scroller]')
    await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight })
    await page.waitForTimeout(200)

    await expect(uebersicht).not.toBeInViewport()
    await expect(baumkopf).toBeInViewport()

    expect(fehler).toEqual([])
  })

  test('(c) «alles auf» klappt alle Gliederungsstufen auf und wird zu «alles zu» (OR, zunächst zugeklappt)', async ({ page }) => {
    test.slow() // schwerer Erlass (OR) nötig, damit der Baum überhaupt zu startet
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/OR?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-v3-aside]')).toBeVisible({ timeout: 20_000 })
    const alleKnopf = page.locator('[data-v3-alle]')
    await expect(alleKnopf).toBeVisible({ timeout: 20_000 })
    await expect(alleKnopf).toContainText('alles auf')

    const baum = page.locator('[data-v3-leiste-baum] li')
    await expect(baum.first()).toBeVisible({ timeout: 20_000 })
    const vorher = await baum.count()

    await alleKnopf.click()

    await expect(alleKnopf).toContainText('alles zu', { timeout: 15_000 })
    const nachher = await baum.count()
    expect(nachher, `Baumzeilen vorher ${vorher}, nachher ${nachher}`).toBeGreaterThan(vorher)

    expect(fehler).toEqual([])
  })

  test('(d) «↑ Anfang» scrollt das Fenster auf 0', async ({ page }) => {
    const fehler = await oeffneBGFA(page)

    await page.evaluate(() => window.scrollTo(0, 1200))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)

    await page.locator('[data-v3-anfang]').click()

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

    expect(fehler).toEqual([])
  })
})
