// @shard-gruppe: 2
// IA-3 · A–Z-/Kürzel-Register auf /gesetze (FAHRPLAN-GESETZES-UX §11.5/§11.6):
// Browse-Zwilling zum Norm-Sprung (Muster M6 gesetze-im-internet) auf dem
// neutralen G4-Landeplatz. Beweise dieser Spec:
//   – §11.3-Budget «Erlass OHNE Kürzel-Kenntnis (H1)»: Buchstabe → Titel = 2
//     Interaktionen bis in den Reader (Zählregel: 1 Klick ODER 1 Eingabe+Enter).
//   – Einsortierung: Ü unter U (DIN 5007-1); Buchstaben-Leiste A–Z + «0–9» als
//     Navigation, leere Klassen deaktiviert (Anzahl im aria-label, §11.6.8).
//   – Ebenen-Mix Bund/Kanton/International korrekt gelabelt.
//   – §11.6.5 Perf: CLS 0 unter CPU-Throttle 6× (input-freie Shifts).
//   – §11.6.9 Mobil @390: Sektion kollabiert, kein H-Overflow.
// J3-Säuberung (Cowork-Befund 18, 18.8.2026): das frühere eigene Titel/
// Kürzel-Filterfeld dieses Registers ist entfernt (redundant mit dem
// Gesetze.tsx-Browse-Filter) — dessen Deckung lebt jetzt in
// gesetze-ia4-scope.e2e.ts (Feld «Gesetze durchsuchen …») und
// az-register.test.ts (Gruppierung). Diese Spec beweist nur noch die
// verbleibende Buchstaben-Navigation.
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const leiste = (page: Page) =>
  page.getByRole('navigation', { name: 'Erlasse nach Anfangsbuchstaben' })
const kopfToggle = (page: Page) =>
  page.getByRole('button', { name: /A–Z-Register/ })

async function keinOverflow(page: Page) {
  const b = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
}

test.describe('IA-3 · A–Z-Register — Budget-Walk + Einsortierung', () => {
  // §11.3-Zeile «Erlass OHNE Kürzel-Kenntnis (H1)»: Buchstabe → Titel, Budget 2.
  test('H1-Walk: Buchstabe «Z» → Titel → Reader in 2 Interaktionen', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    let interaktionen = 0
    await page.goto('/gesetze')

    // Desktop: Register offen ohne Zusatz-Interaktion (Mobil-Kollaps separat).
    await expect(kopfToggle(page)).toHaveAttribute('aria-expanded', 'true')

    // (1) Buchstabe Z — per Tastatur aktiviert (Leiste ist tastatur-bedienbar).
    await leiste(page).getByRole('button', { name: /^Z — / }).press('Enter'); interaktionen++
    await expect(page.getByText(/Titel unter «Z»/)).toBeVisible()

    // (2) Titel (ohne Kürzel-Kenntnis erkennbar) → In-App-Reader.
    await page.getByRole('link', { name: /Zivilstandsverordnung/ }).click(); interaktionen++
    await expect(page).toHaveURL(/\/gesetze\/bund\/ZSTV$/)

    expect(interaktionen, 'Budget §11.3 «Erlass ohne Kürzel-Kenntnis»').toBeLessThanOrEqual(2)
    expect(fehler).toEqual([])
  })

  test('Leiste: A–Z + «0–9» (27 Klassen), leere Klassen deaktiviert mit Anzahl im aria-label', async ({ page }) => {
    await page.goto('/gesetze')
    const knoepfe = leiste(page).getByRole('button')
    await expect(knoepfe).toHaveCount(27)
    // Kein eigener Ä/Ö/Ü-Knopf: Umlaute sind gefaltet (DIN 5007-1).
    await expect(leiste(page).getByRole('button', { name: /^Ä/ })).toHaveCount(0)
    // Eine heute leere Klasse (X) ist deaktiviert und sagt das ehrlich (§8).
    const x = leiste(page).getByRole('button', { name: 'X — keine Erlasse' })
    await expect(x).toBeDisabled()
    // «0–9» steht als LETZTE Klasse in der Leiste.
    await expect(knoepfe.last()).toHaveAccessibleName(/^0–9 — /)
  })

  test('Ü unter U (DIN 5007-1) + Ebenen-Mix Bund/Kanton/International gelabelt', async ({ page }) => {
    await page.goto('/gesetze')

    // Z-Klasse: Bund (ZStV) + Kanton AR + Kanton BS nebeneinander, je gelabelt.
    await leiste(page).getByRole('button', { name: /^Z — / }).click()
    const zListe = page.getByRole('link', { name: /Zivilstandsverordnung/ })
    await expect(zListe.getByText('Bund')).toBeVisible()
    await expect(page.getByRole('link', { name: /Zivilschutzgesetz/ }).getByText('Kanton AR')).toBeVisible()
    await expect(page.getByRole('link', { name: /Zonenordnung Riehen/ }).getByText('Kanton BS')).toBeVisible()

    // U-Klasse trägt die Ü-Titel (kein eigener Ü-Buchstabe) inkl. International.
    await leiste(page).getByRole('button', { name: /^U — / }).click()
    const uest = page.getByRole('link', { name: /Übertretungsstrafgesetz/ }).first()
    await uest.scrollIntoViewIfNeeded()
    await expect(uest).toBeVisible()
    const intl = page.getByRole('link', { name: /Übereinkommen/ }).filter({ hasText: 'International' }).first()
    await intl.scrollIntoViewIfNeeded()
    await expect(intl).toBeVisible()
  })

  test('Leerer Startzustand: schlanker Hinweis statt reservierter Register-Box (Befund 19)', async ({ page }) => {
    await page.goto('/gesetze')
    // Kein Buchstabe gewählt ⇒ kein Scroll-Container, nur der Hinweis-Satz —
    // die frühere fixe h-96-Leerfläche ist weg (Rechtsgebiets-Übersicht trägt
    // jetzt den gehaltvollen Default-Inhalt des Landeplatzes).
    await expect(page.getByRole('region', { name: 'Register-Liste' })).toHaveCount(0)
    await expect(page.getByText(/Einen Anfangsbuchstaben wählen/)).toBeVisible()
    // Die Sprung-Karte (HeaderSuche-CTA) bleibt unverändert daneben bestehen
    // (kein dritter Suchpfad, A5).
    await expect(page.getByRole('button', { name: /Direkt zum Artikel springen/ })).toBeVisible()
  })

  test('Register nur auf dem Landeplatz — Säulen-Sichten bleiben unverändert (G4)', async ({ page }) => {
    await page.goto('/gesetze?ebene=bund')
    // Bund-Säule gewählt → kein Register-Block (der Landeplatz trägt ihn).
    await expect(page.getByRole('main').getByText(/Systematische Sammlung|Erlasse/).first()).toBeVisible()
    await expect(kopfToggle(page)).toHaveCount(0)
    // Landeplatz-Deep-Link unverändert auflösbar (E.4).
    await page.goto('/gesetze')
    await expect(kopfToggle(page)).toBeVisible()
  })
})

test.describe('IA-3 · Perf/CLS + Mobil (§11.6.5/§11.6.9)', () => {
  test('CLS 0 unter CPU-Throttle 6× — grösste Klasse «V», Wechsel + Filter', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 })

    await page.goto('/gesetze')
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 })

    // Beobachter NACH dem eingeschwungenen Landeplatz installieren — gemessen
    // werden die REGISTER-Interaktionen (input-freie Shifts), nicht der
    // Erst-Load (den deckt check:perf-budget/Lighthouse ab).
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as PerformanceEntry[]) {
          const s = e as unknown as { value: number; hadRecentInput: boolean }
          if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value
        }
      }).observe({ type: 'layout-shift' })
    })

    // Grösste Klasse (V, ~589 Titel — Lazy-je-Buchstabe rendert NUR diese).
    const t0 = Date.now()
    await leiste(page).getByRole('button', { name: /^V — / }).click()
    await expect(page.getByText(/Titel unter «V»/)).toBeVisible({ timeout: 15_000 })
    expect(Date.now() - t0, 'V-Klasse öffnen zu langsam').toBeLessThan(8000)

    // Klassen-Wechsel (input-gebunden ⇒ CLS-frei).
    await leiste(page).getByRole('button', { name: /^G — / }).click()
    await expect(page.getByText(/Titel unter «G»/)).toBeVisible({ timeout: 15_000 })
    // Innen-Scroll der Register-Liste: Scrollen ist KEIN «recent input» — hier
    // darf strukturell nichts nachwachsen (CI-Befund PR #347: die früheren
    // content-visibility-Zeilen wuchsen genau so input-frei ein).
    await page.getByRole('region', { name: 'Register-Liste' }).evaluate((el) => { el.scrollTop = el.scrollHeight / 2 })
    await page.waitForTimeout(600)

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls, 'Layout-Shift (input-frei) im A–Z-Register').toBe(0)

    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })

  test('Mobil @390: Register kollabiert, Toggle öffnet, kein H-Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')

    // Kollabiert: Kopf sichtbar, Panel zu (§3.1 «keine Wucherung»).
    const toggle = kopfToggle(page)
    await toggle.scrollIntoViewIfNeeded()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(leiste(page)).toHaveCount(0)
    await keinOverflow(page)

    // Toggle öffnet; Buchstaben-Leiste + Liste bleiben im Viewport-Rahmen.
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(leiste(page)).toBeVisible()
    await leiste(page).getByRole('button', { name: /^Z — / }).click()
    await expect(page.getByText(/Titel unter «Z»/)).toBeVisible()
    await keinOverflow(page)
  })
})
