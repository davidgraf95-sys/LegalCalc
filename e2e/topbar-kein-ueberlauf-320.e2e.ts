// @shard-gruppe: 6
// ═══ C2 (Design-Review 29.8.2026) · DER APP-STREIFEN LÄUFT NICHT QUER @320 ═══
//
// BEFUND, gemessen 29.8.2026 gegen `vite preview` (Chromium, 320×800):
// die Rechtsgruppe der Topbar (Verlauf · Reiter · Thema · Sprache) endete bei
// x = 332 in einem 320-px-Fenster — «de ▾» hing 12 px über der Fensterkante.
// `documentElement.scrollWidth` war 332 auf `/gesetze` und 355 im Leser.
//
// DIE MESSBEDINGUNG IST TEIL DES BEFUNDS (§0 Ziff. 3). Kalt ist der Streifen
// unauffällig: Verlauf- und Reiter-Trigger erscheinen erst, wenn Verlauf bzw.
// offene Reiter existieren (beide client-only, `useZuletzt`/`useTabs`). Die
// Rechtsgruppe misst darum 98 px beim allerersten Seitenaufruf und 198 px,
// sobald man EIN Gesetz geöffnet hat — und genau dann läuft sie über. Der
// Review-Bericht las das als «Leser-Zusatzgriffe»; es sind keine Leser-Griffe,
// es ist der WARME Zustand desselben Streifens auf jeder Route. Die Fälle unten
// wärmen darum bewusst vor, statt kalt zu messen (kalt wäre grün ohne Aussage).
//
// GEPRÜFT WIRD NUR DER STREIFEN, nicht die ganze Seite. Der Leser hat @320 einen
// ZWEITEN, hiervon unabhängigen Überläufer: die Gliederungs-Titel in
// `SektionBaumTOC` (`whitespace-nowrap`, rechte Kante 355). Der gehört zu einer
// anderen Bau-Einheit (offener PR #567) und wird hier bewusst nicht mitgemessen
// — ein Tor, das auf fremde Arbeit wartet, wäre entweder rot oder aufgeweicht.
// Sobald die Gliederung nachgezogen ist, gehört die Schranke auf die ganze Seite
// gehoben (Rest-Vermerk in der Rückgabe der Bau-Einheit W2·11-MOBILKOPF).
//
// ROT ZU BEKOMMEN (§6.7): in `src/components/layout/Topbar.tsx` BEIDE
// `max-[480px]:hidden` entfernen — am Logo-`<Link>` und an der Hülle um
// `<VerlaufUebersicht/>`. Gemessen 29.8.2026 @320 auf `/gesetze`, warm:
//   Fix                12 px → 0 px    (rechte Kante 320)
//   nur Logo zurück            0 px    (rechte Kante 320) — GRÜN
//   nur Verlauf zurück         0 px    (rechte Kante 320) — GRÜN
//   beide zurück              12 px    (rechte Kante 332) — ROT
// Dass die Einzelproben grün bleiben, ist kein Messfehler, sondern der Zustand
// des Streifens: das Suchfeld ist `flex-1 min-w-0` und schluckt den Mangel, bis
// es 0 px breit ist. Genau das ist der Nachbar-Befund C1/B10 — ein Feld, das
// unter Druck verschwindet statt zu drücken. Sobald es (Posten a derselben
// Bau-Einheit) unter 480 px zur 44-px-Lupe wird, kann es nicht mehr schlucken,
// und dieses Tor wird auf JEDE einzelne Rücknahme rot.
import { test, expect, type Page } from '@playwright/test'

/** Rechte Kante des am weitesten rechts stehenden Streifen-Elements. */
async function streifenKante(page: Page): Promise<{ ueberlauf: number; quellen: string[] }> {
  return page.evaluate(() => {
    const grenze = document.documentElement.clientWidth
    const kopf = document.querySelector('header.sticky')
    if (!kopf) return { ueberlauf: Number.NaN, quellen: ['header.sticky fehlt'] }
    const quellen: string[] = []
    let weiteste = 0
    for (const el of kopf.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      weiteste = Math.max(weiteste, r.right)
      if (r.right > grenze + 1) {
        quellen.push(`${el.tagName}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`
          + ` right=${Math.round(r.right)} «${(el.textContent ?? '').trim().slice(0, 24)}»`)
      }
    }
    return { ueberlauf: Math.round(weiteste - grenze), quellen: quellen.slice(0, 6) }
  })
}

/** Warmer Zustand: Verlauf UND offener Reiter vorhanden — sonst misst der Fall
 *  einen Streifen, den es im Alltag nach dem ersten Klick nicht mehr gibt. */
async function waerme(page: Page): Promise<void> {
  await page.goto('/gesetze/bund/OR?leser=v3')
  await expect(page.locator('article[id^="art-"]').first()).toBeAttached({ timeout: 20_000 })
}

test.describe('C2 — die Topbar bleibt @320 im Fenster', () => {
  for (const [name, pfad] of [
    ['Leser', '/gesetze/bund/OR?leser=v3'],
    ['Gesetze-Übersicht', '/gesetze'],
    ['Startseite', '/'],
  ] as const) {
    test(`${name} @320: kein Element des Streifens ragt über die Fensterkante`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await waerme(page)
      await page.goto(pfad)
      await expect(page.locator('header.sticky')).toBeVisible({ timeout: 20_000 })

      // Vorbedingung (§6.7): der Streifen ist WARM — sonst wäre der Fall grün,
      // weil zwei der vier Werkzeug-Knöpfe schlicht fehlen.
      await expect(page.locator('header.sticky button[aria-label="Alle geöffneten Reiter"]'))
        .toHaveCount(1, { timeout: 20_000 })

      const { ueberlauf, quellen } = await streifenKante(page)
      expect(ueberlauf, `Streifen-Überlauf @320 auf ${pfad}: ${ueberlauf} px — ${quellen.join(' | ') || 'keine Quelle'}`)
        .toBeLessThanOrEqual(0)
    })
  }

  // Gegenprobe: die Entlastung gilt NUR unter 480 px. Darüber muss der Streifen
  // wieder vollständig sein — sonst hätte der Fix oben die Werkzeuge dauerhaft
  // entfernt und das Tor hätte das nicht gemerkt (§6.7).
  // WARUM 500 UND NICHT 480: `setViewportSize` setzt die FENSTER-Breite, die
  // Media-Query misst die Layout-Breite ohne die klassische Scrollleiste — bei
  // 480 sind das 465 px, die Schwelle greift also noch. Gemessen 29.8.2026:
  // bei 480 meldet der Fall «Logo hidden». 500 liegt mit 485 px sicher darüber
  // und bleibt trotzdem im Mobil-Bereich (< sm = 640).
  test('@500 stehen Logo und Verlauf-Trigger wieder im Streifen', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 })
    await waerme(page)
    await expect(page.locator('header.sticky a[aria-label="LexMetrik – Startseite"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('header.sticky button[aria-label="Verlauf – zuletzt geöffnet"]')).toBeVisible()

    // Und dort läuft er ebenfalls nicht über.
    const { ueberlauf, quellen } = await streifenKante(page)
    expect(ueberlauf, `Streifen-Überlauf @500: ${ueberlauf} px — ${quellen.join(' | ') || 'keine Quelle'}`)
      .toBeLessThanOrEqual(0)
  })
})
