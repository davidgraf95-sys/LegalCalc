// @shard-gruppe: 2
// ═══ W2·24 §5a Ziff. 3 + Befund F5 · WIE VIELE REITER EINE NAVIGATION KOSTET ═
//
// GEMESSENER ANLASS (6.9.2026, Preview 4335, gebautes dist/): drei Klicks über
// die Gesetze-Übersicht (OR → ZGB → ZPO) hinterliessen DREI Reiter —
// `components/TabTracker.tsx` rief bei jeder Navigation `lib/tabs.merkeTab()`,
// und das hängt an. David 6.9.2026: «kein Reiter-Wildwuchs» · «analog zum
// browser». Seit dem R2-Nachzug gilt die Browser-Regel: die Navigation ERSETZT
// den aktiven Reiter, ein zweiter entsteht nur auf ausdrückliche Geste.
//
// Und dieselbe Messung zeigte den zweiten Defekt (F5): nach 1500 px Scrollen
// stand im Reiter `/gesetze/bund/ZGB#art-3`, in der Adresse weiter
// `/gesetze/bund/ZGB` — dieselbe Adresse trug zwei Beschriftungen («ZGB» kalt,
// «Art. 3 ZGB» nach dem Scrollen), ohne dass jemand einen Artikel gewählt
// hätte. Die Beschriftung kommt jetzt aus `TabEintrag.wahl` (dem Anker der
// ADRESSE), die Lesestellung bleibt in `path`.
//
// ROT ZU BEKOMMEN (§6.7), je Fall einer:
//   (a)/(b) in `TabTracker.tsx` `ersetzeTab(...)` wieder durch `merkeTab(...)`
//           ersetzen ⇒ (a) findet 3 statt 1 Reiter.
//   (c) den Capture-Handler `useNeuerReiterGeste` entfernen ⇒ der Ctrl-Klick
//       legt keinen Reiter an (bzw. der Browser öffnet ein eigenes Fenster).
//   (d) in `layout/HeaderSuche.tsx` den `lmNeuerReiter`-Zweig streichen ⇒ der
//       Treffer verbraucht den Reiter, aus dem er kommt.
//   (e) in `layout/Reiterleiste.tsx` `kurzform` wieder aus `t.path` statt
//       `t.wahl` lesen ⇒ die Beschriftung wechselt beim Scrollen.
import { test, expect, type Page } from '@playwright/test'
import { kopfSucheOeffnen } from './helpers/kopfSuche'

const REITER = 'nav[aria-label="Offene Reiter"]'

/** Die gespeicherte Reiter-Liste — die Wahrheit, die auch den Neustart überlebt. */
const pfade = (page: Page) => page.evaluate(() =>
  (JSON.parse(localStorage.getItem('lexmetrik-tabs') ?? '[]') as { path: string }[]).map((t) => t.path))

/** Reiter-IDENTITÄTEN ohne den Lesestellungs-Anker, den der Leser laufend
 *  nachführt (`#art-…`, s. `lib/tabs.aktualisiereTabArtikel`). */
const identitaeten = async (page: Page) => (await pfade(page)).map((p) => p.split('#')[0])

/** Sichtbare Beschriftungen der Arbeitsleiste (erster Knopf je Reiter = der
 *  Name; die Griffe ✕/⧉ dahinter zählen nicht mit, ohne die sr-only-Ordnungszahl). */
const beschriftungen = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Offene Reiter"] [data-reiter-aktiv]')]
    .map((d) => [...(d.querySelector('button')?.querySelectorAll('span:not(.sr-only)') ?? [])]
      .map((s) => s.textContent?.trim()).join(' ')))

async function leserBereit(page: Page): Promise<void> {
  await expect(page.locator('article[id^="art-"]').first()).toBeAttached({ timeout: 20_000 })
}

test.describe('Arbeitsleiste — eine Navigation, ein Reiter', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    // ── DEKLARIERTE TEST-ÄNDERUNG (§6.3, W2·24-R5-F1C, David-Befund D17,
    // 6.9.2026) · WO DER RÜCKWEG AUF DIE ÜBERSICHT KLICKBAR IST ──────────────
    // Vier Fälle klickten «zurück auf /gesetze» am Bereichs-Reiter im
    // Titelblatt (`header.sticky a[href="/gesetze"]`). Den gibt es nicht mehr:
    // «ich mochte die seitenleiste. können wir die behalten. und das oben
    // entfernen?» — die Bereichs-Navigation lebt seither ausschliesslich in der
    // Seitenleiste. Geklickt wird darum dort. Damit die Leiste auch IM LESER
    // offen steht (dort startet sie per Ä1c-Vorgabe eingeklappt, und eine
    // einmal getroffene Nutzerwahl gewinnt), wird die Wahl vorab gesetzt — das
    // ist Testaufbau, keine Assertion: Umfang, Zusagen und Erwartungen der
    // Fälle bleiben Wort für Wort dieselben.
    await page.addInitScript(() => {
      try { localStorage.setItem('lexmetrik-seitenleiste-eingeklappt.v2', '0') } catch { /* privater Modus */ }
    })
    await page.goto('/gesetze')
    await page.evaluate(() => localStorage.removeItem('lexmetrik-tabs'))
  })

  // ── DEKLARIERTE TEST-ÄNDERUNG (§6.3, David-Befund D7, 6.9.2026) ───────────
  // «achte darauf dass der reiter bei gesetz mitzählt». Bis zu diesem Nachzug
  // waren die Bereichs-Übersichten für die Reiter unsichtbar; die Schleife
  // dieses Falls kehrt nach jedem Erlass über den Kopf-Link auf `/gesetze`
  // zurück, und diese Rückkehr liess den Reiter darum unverändert stehen.
  // Seit `lib/tabs.istReiterPfad` ist `/gesetze` ein Reiter-Ziel wie jedes
  // andere — die Rückkehr ERSETZT den aktiven Reiter, genau wie im Browser.
  // Die geprüfte ZUSAGE ist unverändert die von §5a Ziff. 3 (kein Wildwuchs:
  // sechs Navigationen, EIN Reiter); nachgeführt ist nur, welchen Inhalt
  // dieser eine Reiter am Ende trägt — den zuletzt besuchten, und das ist
  // nach der letzten Schleifenrunde die Übersicht.
  test('(a) sechs Navigationen hinterlassen EINEN Reiter', async ({ page }) => {
    await page.goto('/gesetze')
    for (const key of ['ZGB', 'OR', 'ZPO']) {
      await page.locator(`a[href="/gesetze/bund/${key}"]`).first().click()
      await leserBereit(page)
      // Zwischenstand: der Erlass hat den Reiter der Übersicht übernommen.
      expect(await identitaeten(page)).toEqual([`/gesetze/bund/${key}`])
      await page.locator('aside[data-app-seitenleiste] a[href="/gesetze"]').first().click()
      await expect(page).toHaveURL(/\/gesetze$/, { timeout: 20_000 })
    }
    expect(await identitaeten(page)).toEqual(['/gesetze'])
  })

  // ── D7 · DIE PFLICHTFÄLLE (a)–(e) DES DAVID-BEFUNDS ───────────────────────
  // ROT ZU BEKOMMEN: in `lib/tabs.istReiterPfad` die `BEREICHS_UEBERSICHTEN`-
  // Zeile streichen ⇒ (D7-e) findet 0 Reiter; `ersetzeTab` in `TabTracker`
  // durch `merkeTab` tauschen ⇒ (D7-c) findet 2 statt 1.
  test('(D7 a/b) Erlass ohne und mit Artikel-Anker erzeugt je EINEN zählenden Reiter', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/OR'])
    await expect(page.locator(`${REITER} [data-reiter-aktiv]`)).toHaveCount(1)
    // (b) derselbe Erlass über einen Deep-Link auf den Artikel
    await page.goto('/gesetze/bund/OR#art-336_c')
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/OR'])
    expect((await beschriftungen(page))[0]).toContain('336c')
  })

  test('(D7 c) Blättern im selben Erlass erzeugt keinen zweiten Reiter', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB')
    await leserBereit(page)
    const vorher = await identitaeten(page)
    // Sprung über die Gliederung/Deep-Link INNERHALB desselben Erlasses.
    await page.goto('/gesetze/bund/ZGB#art-3')
    await leserBereit(page)
    await page.mouse.wheel(0, 1500)
    await page.waitForTimeout(600)
    expect(await identitaeten(page)).toEqual(vorher)
    await expect(page.locator(`${REITER} [data-reiter-aktiv]`)).toHaveCount(1)
  })

  // (D7 d) «Wechsel Bund→Kanton→International je eigener Reiter nur bei
  // Ctrl-Klick, sonst Ersatz». Geprüft wird der ERLASS-Wechsel; die Ebene
  // spielt für die Regel keine Rolle (`istReiterPfad` und `tabSchluessel`
  // kennen nur den Pfad, nicht die Ebene) — und dieselbe Ebenen-Frage prüft
  // `(f)` samt Kanonisierung der Alt-Adressen bereits am Datenmodell.
  // WICHTIG für die Nachbau-Treue: die Schritte laufen als SPA-KLICKS. Ein
  // `page.goto()` ist ein Kaltstart, und dort ersetzt der Tracker bewusst
  // nichts (`aktiv.current === null`) — mit `goto` gemessen sähe man einen
  // Defekt, wo keiner ist (so beim ersten Bau dieses Falls geschehen).
  test('(D7 d) der Erlass-Wechsel ersetzt; Ctrl-Klick öffnet den zweiten', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/ZGB'])
    await page.locator('aside[data-app-seitenleiste] a[href="/gesetze"]').first().click()
    await page.locator('a[href="/gesetze/bund/OR"]').first().click()
    await leserBereit(page)
    expect(await identitaeten(page), 'der Wechsel hat einen zweiten Reiter angelegt').toEqual(['/gesetze/bund/OR'])
    await page.locator('aside[data-app-seitenleiste] a[href="/gesetze"]').first().click()
    await page.locator('a[href="/gesetze/bund/ZPO"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => identitaeten(page), { timeout: 10_000 })
      .toEqual(['/gesetze', '/gesetze/bund/ZPO'])
  })

  test('(D7 e) die Übersicht /gesetze ist ein Reiter «Gesetze» und zählt mit', async ({ page }) => {
    await page.goto('/gesetze')
    await expect.poll(() => identitaeten(page), { timeout: 10_000 }).toEqual(['/gesetze'])
    await expect(page.locator(`${REITER} [data-reiter-aktiv]`)).toHaveCount(1)
    // §5a Ziff. 2: die Beschriftung ist die Kurzform, NICHT der SEO-Titel
    // («Schweizer Recht an einem Ort: …», Prüfbefund R3-F7).
    expect((await beschriftungen(page))[0]).toBe('Gesetze')
    // Die Startseite bleibt bewusst ohne Reiter (Begründung an `istReiterPfad`).
    await page.locator('header.sticky a[aria-label^="LexMetrik"]').first().click()
    await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
    expect(await identitaeten(page)).toEqual(['/gesetze'])
  })

  test('(b) der Wechsel auf einen offenen Reiter wirft den aktiven NICHT weg', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    // zweiter Reiter per Geste, dann zurück auf den ersten — beide müssen bleiben
    await page.locator('aside[data-app-seitenleiste] a[href="/gesetze"]').first().click()
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => pfade(page), { timeout: 10_000 }).toHaveLength(2)
    // ── DEKLARIERTE TEST-ÄNDERUNG (§6.3, W2·24-R5-F1C, D16, 6.9.2026) ────────
    // Hier stand ein Sammel-Selektor mit `.first()`, der den anzuklickenden
    // Reiter aus der DOM-REIHENFOLGE griff. Die war bis D16 eine andere: die
    // Leiste bündelte nach Kategorie/Herkunft und stellte darum den
    // OR-Erlass vor die Übersicht. Seit D16 zeigt sie die Speicherreihenfolge
    // (der Bug war genau dieses Bündeln, `e2e/w224-reiter-umordnen-d16`), also
    // steht die Übersicht vorn — und `.first()` träfe sie statt des Lesers.
    // Der Reiter wird deshalb BENANNT statt gezählt; die geprüfte Zusage
    // («ein Klick in der Leiste kostet keinen Reiter») ist unverändert.
    await page.locator(`${REITER} [data-reiter-schluessel="/gesetze/bund/OR"]`)
      .getByRole('button', { name: /^Reiter \d+: / }).click()
    await leserBereit(page)
    expect((await pfade(page)).length, 'ein Klick in der Leiste kostete einen Reiter').toBe(2)
  })

  test('(c) Ctrl/⌘-Klick öffnet im Hintergrund — die Ansicht bleibt stehen', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    await page.locator('aside[data-app-seitenleiste] a[href="/gesetze"]').first().click()
    await expect(page).toHaveURL(/\/gesetze$/, { timeout: 20_000 })
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    // §6.3/D7: der Rückweg auf die Übersicht ersetzt den ZGB-Reiter durch den
    // Übersichts-Reiter (siehe (a)); die geprüfte Zusage dieses Falls — der
    // Ctrl-Klick legt einen ZWEITEN an und die Ansicht bleibt stehen — ist
    // unverändert.
    await expect.poll(() => identitaeten(page), { timeout: 10_000 })
      .toEqual(['/gesetze', '/gesetze/bund/OR'])
    // Wie im Browser: der neue Reiter geht im HINTERGRUND auf.
    await expect(page).toHaveURL(/\/gesetze$/)
  })

  test('(d) ⌘/Ctrl+Enter in der Kopfsuche öffnet einen NEUEN Reiter', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB')
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(['/gesetze/bund/ZGB'])
    const feld = await kopfSucheOeffnen(page)
    await feld.fill('Obligationenrecht')
    await expect(page.locator('header.sticky [role="option"], header.sticky [role="listbox"] a').first())
      .toBeVisible({ timeout: 20_000 })
    await feld.press('ControlOrMeta+Enter')
    await leserBereit(page)
    const nach = await identitaeten(page)
    expect(nach.length, `Reiter nach ⌘+Enter: ${nach.join(' | ')}`).toBe(2)
    expect(nach[0], 'der Reiter, aus dem der Treffer kam, ist verbraucht').toBe('/gesetze/bund/ZGB')
  })

  test('(e) die Beschriftung folgt der Adresse, nicht dem Scrollen (F5)', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB')
    await leserBereit(page)
    const kalt = await beschriftungen(page)
    expect(kalt).toEqual(['ZGB'])
    await page.mouse.wheel(0, 1500)
    await page.waitForTimeout(1200)
    expect(await beschriftungen(page), 'die Beschriftung wanderte beim Scrollen').toEqual(kalt)
    // Die Lesestellung ist NICHT verloren: sie steht im gespeicherten Pfad
    // (Neustart) und im `title` des Reiters.
    expect((await pfade(page))[0]).toMatch(/#art-/)

    // Gegenprobe SPA: derselbe Weg über einen Klick ergibt dieselbe Kurzform.
    await page.goto('/gesetze')
    await page.evaluate(() => localStorage.removeItem('lexmetrik-tabs'))
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    expect(await beschriftungen(page)).toEqual(kalt)
  })

  test('(f) der Neustart ändert nichts an der Liste', async ({ page }) => {
    await page.goto('/gesetze')
    await page.locator('a[href="/gesetze/bund/ZGB"]').first().click()
    await leserBereit(page)
    await page.locator('a[href="/gesetze/bund/OR"]').first().click({ modifiers: ['ControlOrMeta'] })
    await expect.poll(() => pfade(page), { timeout: 10_000 }).toHaveLength(2)
    // Verglichen werden die IDENTITÄTEN: die Lesestellung (`#art-…`) führt der
    // Leser laufend nach, sie ist kein Neustart-Effekt.
    const vorher = await identitaeten(page)
    await page.reload()
    await leserBereit(page)
    expect(await identitaeten(page)).toEqual(vorher)
  })
})
