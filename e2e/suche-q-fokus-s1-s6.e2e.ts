// @shard-gruppe: 6
// Browser-Kontrakt der beiden Suche-Rest-Schritte (FAHRPLAN-UI-NAVIGATION §2):
//
//   S1 · Query-Durchreichung `?q=` — der «alle N →»-Sprung der Universal-Suche
//        nimmt den Suchbegriff mit, die Zielseite filtert damit; auf
//        /rechtsprechung wandert der getippte Begriff entprellt in die Adresse,
//        so dass ein Neuladen `rg` UND `q` wiederherstellt.
//
//   S6 · Mobiler Such-Fokusmodus — @390 keine Fokus-Zoom-Falle (Feldschrift
//        ≥ 16 px), Feld über die volle Streifenbreite, ✕ führt zurück.
//
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

// Der Artikel-Volltext-Index (~4 MB) lädt einmal; unter Runner-Last reicht das
// 30-s-Standardbudget nicht (Muster norm-sprung.e2e.ts). INFRASTRUKTUR, keine
// Assertion-Änderung (§6.3).
test.describe.configure({ timeout: 60_000 })

const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })
const listbox = (page: Page) => page.getByRole('listbox', { name: 'Suchtreffer' })

test.describe('S1 · Query-Durchreichung ?q=', () => {
  test('«alle N →» führt MIT dem Begriff auf /gesetze (Feld vorgefüllt, gefiltert)', async ({ page }) => {
    await page.goto('/')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('recht')
    const box = listbox(page)
    await expect(box).toBeVisible()
    // Die Gesetze-Gruppe kappt bei vielen Treffern und bietet den Sammel-Sprung.
    const mehr = box.getByRole('option', { name: /alle \d+ Treffer anzeigen/ }).first()
    await expect(mehr).toBeVisible()
    await mehr.click()
    // Kern von S1: die Query steht in der Adresse UND im Filterfeld der Zielseite.
    await expect(page).toHaveURL(/[?&]q=recht/)
    const zielFeld = page.getByRole('searchbox', { name: /durchsuchen/ })
    await expect(zielFeld.first()).toHaveValue('recht')
  })

  test('/gesetze?q= füllt das Filterfeld auch OHNE Remount (SPA-Sprung auf der eigenen Seite)', async ({ page }) => {
    await page.goto('/gesetze?ebene=bund')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('recht')
    await expect(listbox(page)).toBeVisible()
    const mehr = listbox(page).getByRole('option', { name: /alle \d+ Treffer anzeigen/ }).first()
    await mehr.click()
    // Ohne den laufenden ?q=-Abgleich bliebe das Feld hier leer (Lazy-Init greift
    // nur beim Mount — /gesetze → /gesetze mountet nicht neu).
    await expect(page.getByRole('searchbox', { name: /Gesetze durchsuchen/ })).toHaveValue('recht')
  })

  test('Rechtsprechung: getippter Begriff landet in der Adresse und übersteht das Neuladen (rg UND q)', async ({ page }) => {
    await page.goto('/rechtsprechung?rg=zpo')
    const feld = page.getByRole('searchbox', { name: 'Rechtsprechung durchsuchen' })
    await feld.fill('Kündigung')
    // Entprellt (300 ms) — die Adresse zieht kurz danach nach.
    await expect(page).toHaveURL(/[?&]q=K%C3%BCndigung/)
    await expect(page).toHaveURL(/[?&]rg=zpo/)
    await page.reload()
    await expect(page.getByRole('searchbox', { name: 'Rechtsprechung durchsuchen' })).toHaveValue('Kündigung')
    await expect(page).toHaveURL(/[?&]rg=zpo/)
  })

  // Gegenprüfungs-Befund 7.8.2026 (ERNST): die Merkung des selbst gespiegelten
  // Werts galt unbegrenzt — die Zurück-Taste führte auf die alte Adresse, das
  // Feld behielt den neuen Begriff, und der Spiegel schrieb die History-Position
  // 300 ms später wieder um. Die Zustandslogik dahinter ist in
  // src/tests/useSucheAusUrl.test.ts einzeln festgenagelt.
  test('Zurück-Taste stellt den früheren Begriff wieder her und bleibt stehen', async ({ page }) => {
    await page.goto('/rechtsprechung')
    const feld = page.getByRole('searchbox', { name: 'Rechtsprechung durchsuchen' })
    await feld.fill('miete')
    await expect(page).toHaveURL(/[?&]q=miete/)
    // Fremde Adressänderung auf denselben Achsen (Header-Sprung-Äquivalent).
    await page.goto('/rechtsprechung?q=recht')
    await expect(feld).toHaveValue('recht')
    await page.goBack()
    await expect(page).toHaveURL(/[?&]q=miete/)
    await expect(feld).toHaveValue('miete')
    // …und der Spiegel schreibt die History-Position NICHT wieder um.
    await page.waitForTimeout(600)
    await expect(page).toHaveURL(/[?&]q=miete/)
  })

  // Gegenprüfungs-Befund 7.8.2026 (§8-Zählparität): Header dedupliziert die
  // Gemeinde-Doppel, die Zielseite tat es nicht — «alle 73 →» landete auf «74».
  test('«alle N →» und die Trefferzahl der Zielseite nennen dieselbe Zahl (§8)', async ({ page }) => {
    await page.goto('/')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('recht')
    const box = listbox(page)
    await expect(box).toBeVisible()
    const gesetzGruppe = box.getByRole('group', { name: 'Gesetze' })
    const mehr = gesetzGruppe.getByRole('option', { name: /alle \d+ Treffer anzeigen/ })
    const kopfZahl = Number(/\d+/.exec((await mehr.textContent()) ?? '')![0])
    await mehr.click()
    const seitenZahl = Number(/\d+/.exec((await page.getByText(/Treffer für «recht»/).textContent()) ?? '')![0])
    expect(seitenZahl).toBe(kopfZahl)
  })
})

test.describe('S6 · Mobiler Such-Fokusmodus @390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('Feldschrift ≥ 16 px (keine iOS-Fokus-Zoom-Falle)', async ({ page }) => {
    await page.goto('/')
    const feld = sucheFeld(page)
    const px = await feld.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    // iOS Safari zoomt beim Fokus auf jedes Feld unter 16 px; der Nutzer muss
    // danach von Hand herauszoomen. 14 px (text-body-s) war genau dieser Fall.
    expect(px).toBeGreaterThanOrEqual(16)
  })

  test('Fokus blendet Logo und Werkzeuge aus, ✕ holt sie zurück', async ({ page }) => {
    await page.goto('/')
    // Nur der Top-Streifen (die Fusszeile trägt dasselbe Logo-Label).
    const logo = page.getByRole('banner').getByRole('link', { name: /LexMetrik – Startseite/ })
    await expect(logo).toBeVisible()
    const feld = sucheFeld(page)
    const vorher = (await feld.boundingBox())!.width
    await feld.click()
    await expect(logo).toBeHidden()
    const schliessen = page.getByRole('button', { name: 'Suche schliessen' })
    await expect(schliessen).toBeVisible()
    // Das Feld gewinnt die frei gewordene Breite.
    const nachher = (await feld.boundingBox())!.width
    expect(nachher).toBeGreaterThan(vorher)
    // Ziel-Komfortmass der Zone: 44 px (min-h-11/min-w-11), wie die übrigen
    // Streifen-Knöpfe — 36 px lagen darunter (Gegenprüfungs-Befund 7.8.2026).
    const kasten = (await schliessen.boundingBox())!
    expect(kasten.height).toBeGreaterThanOrEqual(44)
    expect(kasten.width).toBeGreaterThanOrEqual(44)
    await schliessen.click()
    await expect(logo).toBeVisible()
    await expect(schliessen).toBeHidden()
    // Fokus kehrt gezielt in den Streifen zurück, nicht auf <body>
    // (Gegenprüfungs-Befund 7.8.2026, Tastatur-/Screenreader-Position).
    await expect(page.getByRole('button', { name: 'Navigation öffnen' })).toBeFocused()
  })

  test('getippte Query bleibt im Feld sichtbar (nicht abgeschnitten)', async ({ page }) => {
    await page.goto('/')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('arbeitsvertrag')
    // scrollWidth > clientWidth hiesse: der Anfang der Query ist aus dem Feld
    // gescrollt — genau der S6-Prüfpunkt «getippte Query voll lesbar».
    const passt = await feld.evaluate((el: HTMLInputElement) => el.scrollWidth <= el.clientWidth + 1)
    expect(passt).toBe(true)
  })
})
