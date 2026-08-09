// Verzahnungs-UI V1a (W2·7-VZUI): die 5 Magic-Moment-Leitfälle aus
// FAHRPLAN-VERZAHNUNG-UI §4 + die Zusatzaufträge David 3.7.2026 (Fundstellen-
// Landung je Linkquelle, Popover-Verankerung am Link) + a11y-Stichprobe auf den
// neuen Flächen. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// EIN Leitentscheid-aria-label an allen vier Fundorten (Magic Moment 4) —
// dieselbe Konstante wie in StatusBadge.tsx (Textgleichheit ist der Testinhalt).
const LEIT_ARIA = 'Leitentscheid — amtlich publizierter BGE'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// ── MM1: Steuerbeamter auf Art. 16 DBG — Artikel/Erlass als Hub ──────────────
test('MM1: DBG-Fuss trägt ≥2 Kontextgruppen mit Overline + Zähler + Hinweis; CLS ≈ 0', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/gesetze/bund/DBG')
  await expect(page.locator('#art-16')).toBeAttached()
  // CLS-Probe des Erstaufbaus (§15.2): Layout-Shifts ohne Nutzereingabe aufsummieren.
  const cls = await page.evaluate(() => new Promise<number>((res) => {
    let sum = 0
    type LS = PerformanceEntry & { hadRecentInput: boolean; value: number }
    new PerformanceObserver((l) => { for (const e of l.getEntries() as LS[]) if (!e.hadRecentInput) sum += e.value })
      .observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => res(sum), 1500)
  }))
  expect(cls).toBeLessThan(0.05)
  // Kontext-Panel am Erlass-Ende: Entscheide + Materialien + Werkzeuge.
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  const gruppen = kontext.locator('h3')
  await expect(gruppen.first()).toBeVisible({ timeout: 10_000 })
  expect(await gruppen.count()).toBeGreaterThanOrEqual(2)
  // ── §6.3-DEKLARATION (9.8.2026, W2·19-GLIEDERUNG/S7) ────────────────────────
  // Freigabe David 8.8.2026 («e2e-Anpassungen in deklarierten Commits erlaubt»,
  // Bau-Spec §10 Entscheid (a)); der 3.7.-Auftrag hinter MM1 bleibt unberührt.
  //
  // GEPRÜFTER SACHVERHALT UNVERÄNDERT: «jede Gruppe, die eine MENGE auflöst,
  // zeigt ihren Zähler». Die Zeile iterierte bisher ALLE `h3` und nahm damit
  // stillschweigend an, dass jede Panel-Gruppe eine Kanten-Menge ist. Seit S7
  // gibt es eine Gruppe, die keine ist: der Artikel-Kontext «Zu Art. X» zeigt
  // vier feste, benannte ROLLEN-Zeilen (Praxis · Verweise · letzte Änderung ·
  // Werkzeuge). Sie trägt darum — konsistent mit FAHRPLAN-VERZAHNUNG-UI §1.4,
  // wo Richtungs-Label, Zähler und Hinweis ein Trio sind — auch keine Richtung
  // und keinen Hinweis.
  //
  // WARUM NICHT EINFACH EINE ZAHL DRANSCHREIBEN: der Zähler ist hier die
  // PRÜFSTAND-Angabe («n erfasste Entscheide») — er sagt, wie viel wir gefunden
  // haben. Für den Wegweiser gäbe es nur zwei Kandidaten: die konstante Vier
  // (die Zeilenzahl) oder die Zahl der befüllten Zeilen. Beides zählt UNSERE
  // Darstellung, nicht erfasste Einträge — also genau die Zahl ohne Aussagewert,
  // gegen die §8 sich richtet. Die Ehrlichkeitspflicht wird stattdessen FEINER
  // erfüllt: jede der vier Zeilen nennt ihre eigene Zahl oder sagt ausdrücklich,
  // dass nichts erfasst ist — und genau das prüft der Zusatz unten mit.
  //
  // NICHT AUFGEWEICHT: die Iteration wird auf `[data-kontext-rolle="liste"]`
  // GESCHÄRFT, nicht auf «Gruppen, die zufällig einen Zähler haben» (das wäre
  // zirkulär und kein Tor mehr). Der Default der Hülle ist `liste` — wer eine
  // neue Listen-Gruppe baut und `anzahl` vergisst, wird weiterhin rot. Die
  // Ausnahme muss im Code AUSDRÜCKLICH erklärt werden, und die zwei Zusatz-
  // Assertions halten sie klein und ehrlich.
  const listen = kontext.locator('[data-kontext-rolle="liste"] > h3')
  expect(await listen.count(), 'MM1 braucht ≥2 mengen-auflösende Gruppen').toBeGreaterThanOrEqual(2)
  // Jede Listen-Gruppe: Zähler (num-Span in der Overline).
  for (const g of await listen.all()) await expect(g.locator('.num')).toBeVisible()
  // Die Ausnahme bleibt eine Ausnahme — höchstens EIN Wegweiser je Panel …
  const wegweiser = kontext.locator('[data-kontext-rolle="wegweiser"]')
  expect(await wegweiser.count(), 'Wegweiser-Ausnahme darf sich nicht ausbreiten').toBeLessThanOrEqual(1)
  // … und sie erfüllt ihre §8-Pflicht in den Zeilen statt in der Overline:
  // entweder eine Zahl oder ein ausdrückliches «nichts erfasst».
  if (await wegweiser.count() === 1) {
    const txt = (await wegweiser.textContent()) ?? ''
    expect(txt, 'Wegweiser ohne Zahl UND ohne Leer-Aussage (§8)').toMatch(/\d|kein|keine|keines|nicht erfasst/)
  }
  await expect(kontext.getByText('Wird zitiert von', { exact: false }).first()).toBeVisible()
  await expect(kontext.getByText('erfasste Entscheide', { exact: false }).first()).toBeVisible()
  await expect(kontext.getByText('Legt aus', { exact: false }).first()).toBeVisible()
  expect(fehler).toEqual([])
})

// ── MM2: Anwältin im Leitentscheid — beide Richtungen am Fuss, kein Gütesiegel ─
test('MM2: Entscheid-Fuss trägt «Zitierte Normen» artikelscharf; kein «gültig»/«geprüft»', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/rechtsprechung/bge_151_III_377')
  await expect(page.getByRole('heading', { level: 1, name: /151 III 377/ })).toBeVisible()
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.getByText('Zitierte Normen', { exact: false }).first()).toBeVisible({ timeout: 10_000 })
  // artikelscharfe Chips (Art.-Buttons) statt grober Erlass-Gruppe (§2.2):
  expect(await kontext.getByRole('button', { name: /^Art\./ }).count()).toBeGreaterThanOrEqual(2)
  await expect(kontext.getByText('Wendet an', { exact: false }).first()).toBeVisible()
  // §8-rote Linie: nirgends ein Gültigkeits-/Prüf-Siegel.
  const text = (await kontext.textContent()) ?? ''
  expect(text).not.toMatch(/gültig|geprüft|verifiziert/)
  expect(fehler).toEqual([])
})

// ── MM3: Gericht liest Entscheid, schlägt Norm daneben auf (Split-View) ───────
test('MM3 (≥lg): NormPopover-⧉ öffnet die Norm im Pane, der Entscheid bleibt offen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible()
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  const scrollVor = await page.evaluate(() => window.scrollY)
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  const daneben = dialog.getByRole('button', { name: /nebeneinander öffnen/ })
  await expect(daneben).toBeVisible()
  await daneben.click()
  // Pane offen (Split-View), Entscheid bleibt Hauptfenster + Lese-Position
  // erhalten: der Scroll wandert vom window in den PRIMÄR-Pane-Container
  // (Split-View-Architektur) — der Betrag bleibt derselbe.
  await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible()
  const primaerScroll = await page.evaluate(() =>
    document.querySelector('[data-pane="primaer"]')?.scrollTop ?? -1)
  expect(Math.abs(primaerScroll - scrollVor)).toBeLessThan(150)
})

test('MM3 (Mobile): kein ⧉ im NormPopover unter lg', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /nebeneinander öffnen/ })).toHaveCount(0)
})

// ── MM4: Studentin am ★ — EIN aria-label an allen vier Fundorten ─────────────
test('MM4: ★-aria-label textgleich in Reader, Panel, Leitfall-Zeile und Suche; Tooltip fokussier-/klickbar', async ({ page }) => {
  // (a) Reader-Kopf (Volltext-Badge, interaktiv): das aria-label trägt der
  // fokussierbare Begriff-Button selbst (accessible name, kein aria-label auf
  // role-losem Span — axe aria-prohibited-attr).
  await page.goto('/rechtsprechung/bge_151_III_377')
  const begriff = page.locator('header').getByRole('button', { name: LEIT_ARIA })
  await expect(begriff).toBeVisible()
  await begriff.click()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)

  // (b) KontextPanel-Zeile (Glyph) am Gesetz.
  await page.goto('/gesetze/bund/ZGB')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.locator(`[role="img"][aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 10_000 })

  // (c) Leitfall-Zeile am Artikel (Glyph im KantenChip). reload(): von (b) aus
  // wäre das eine Fragment-Navigation OHNE Neuladen — die Zeile erbte dann den
  // Seitenzustand aus (b) (auf dem gedrosselten CI-Runner deterministisch rot).
  // Frisch geladen prüft (c) dieselbe Produkt-Wahrheit wie ein direkter
  // Deep-Link-Aufruf; Assertion unverändert.
  await page.goto('/gesetze/bund/ZGB#art-684')
  await page.reload()
  const art = page.locator('#art-684')
  // Scroll+Sicht als Poll (Hydrations-Drift, s. leitfaelle-chips.e2e.ts) — erst
  // der Zeilen-Container (klareres Fehlersignal), dann der ★-Glyph mit dem
  // geteilten aria-label.
  //
  // §6.3-DEKLARATION (28.7.2026, W2·7-BEZUG/B4): die Overline «Leitfälle» der
  // V1a-Chip-Reihe ist entfallen; der Container ist jetzt die bge-Gruppe der
  // facettierten Auflistung. Geprüfter Sachverhalt unverändert — der ★-Glyph mit
  // dem geteilten aria-label steht am Leitentscheid-Chip.
  await expect(async () => {
    await art.scrollIntoViewIfNeeded()
    await expect(art.locator('[data-bezug-gruppe="bge"]')).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 20_000 })
  await expect(art.locator(`[role="img"][aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 15_000 })

  // (d) Universal-Suche (Volltext-Badge im Treffer).
  await page.goto('/')
  await page.keyboard.press('/')
  await page.keyboard.type('152 II 19')
  await expect(page.locator(`[aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 10_000 })
})

// ── MM5: Nutzer am Erlass-Ende — Top-Entscheide MIT Artikel-Sublabel ─────────
test('MM5: jeder OR-Panel-Entscheid trägt das «via Art. N»-Sublabel', async ({ page }) => {
  await page.goto('/gesetze/bund/OR')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  const links = kontext.locator('a[href^="/rechtsprechung/"]:not([href^="/rechtsprechung?"])')
  await expect(links.first()).toBeVisible({ timeout: 10_000 })
  const texte = await links.allTextContents()
  const chips = texte.filter((t) => !/^Alle /.test(t))
  expect(chips.length).toBeGreaterThanOrEqual(5)
  for (const t of chips) expect(t).toMatch(/via Art\./)
})

// ── Fundstellen-Landung je Linkquelle (Zusatzauftrag David 3.7.2026) ──────────
test('Fundstelle A (Gesetz-Chip): ZGB Art. 684 → BGE 151 III 377 landet auf der Erwägung', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-684')
  const art = page.locator('#art-684')
  const chip = art.locator('a[href*="bge_151_III_377"]').first()
  // Scroll+Sicht als Poll (Hydrations-Drift; Chips laden in Viewport-Nähe).
  await expect(async () => {
    await art.scrollIntoViewIfNeeded()
    await expect(chip).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 20_000 })
  await expect(chip).toHaveAttribute('href', /norm=Art\.(%20|\+| )684(%20|\+| )ZGB/)
  await chip.click()
  // Referenzfall (David): die massgebliche Erwägung E. 2.3.1 («Art. 684 i.V.m.
  // Art. 679 ZGB») steht nach dem on-demand-Laden im Viewport.
  await expect(page.locator('#e-2-3-1')).toBeInViewport({ timeout: 15_000 })
})

test('Fundstelle B (Zitiert-Gruppe): ↳ E.-Sprung erreicht die zitierende Erwägung; Chip löst ins Korpus auf', async ({ page }) => {
  await page.goto('/rechtsprechung/bger_8C_559_2025')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.getByText('Zitierte Entscheide', { exact: false }).first()).toBeVisible({ timeout: 10_000 })
  // Ehrlicher Zähler: «… davon n im Korpus» + Hinweissatz zum Rest.
  await expect(kontext.getByText(/davon\s+\d+\s+im\s*Korpus/).first()).toBeVisible()
  await expect(kontext.getByText('im Korpus (noch) nicht erfasst', { exact: false }).first()).toBeVisible()
  // Aufgelöster Treffer als Link-Chip (BGE 150 II 346) — kein grauer Nicht-Link.
  const chipZeile = kontext.locator('li', { has: page.locator('a[href*="bge_150_II_346"]') })
  await expect(chipZeile).toBeVisible()
  // In-Text-Sprung zur zitierenden Stelle: der ↳-Sprung-Button, der ZU DIESEM Chip
  // gehört (dieselbe <li>-Zeile), landet an dessen erster Fundstelle (E. 1.1 = #e-1-1).
  // NICHT `.first()` der ganzen Gruppe: seit O-4 (#263, de-Filter gehoben) lösen auch
  // BGE 148 I 104 / 148 V 321 auf, deren erste Fundstelle (E. 4.3.3 / E. 3.2) VOR E. 1.1
  // steht — `.first()` zeigte damit auf E. 4.3.3, nicht mehr auf die hier verifizierte
  // Kante. Zeilen-scharf gebunden bleibt der Test robust gegen weiteres Kanten-Wachstum.
  const sprung = chipZeile.getByRole('button', { name: /zitierende.*springen/i })
  await expect(sprung).toBeVisible()
  await sprung.click()
  await expect(page.locator('#e-1-1')).toBeInViewport({ timeout: 10_000 })
})

// ── Popover-Verankerung am Link (Zusatzauftrag David 3.7.2026) ────────────────
test('Popover öffnet AM Link (tief im Dokument), Seite scrollt nicht', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  const scrollVor = await page.evaluate(() => window.scrollY)
  expect(scrollVor).toBeGreaterThan(500)   // wirklich tief im Dokument
  await link.click()
  const karte = page.locator('[role="dialog"]')
  await expect(karte).toBeVisible()
  // Erst der GELADENE Volltext-Zustand ist der Messgegenstand: die Lade-Hülle
  // wird beim Snapshot-Eintreffen durch ein NEUES role=dialog ersetzt — ein
  // boundingBox() im Swap-Moment liefert null (CI-Race). Der Fuss-Link
  // existiert nur im Volltext-Popover.
  await expect(karte.getByText('Im Gesetz öffnen')).toBeVisible()

  // ── §17-WURZELFIX (9.8.2026, W2·19-GLIEDERUNG) ──────────────────────────────
  // Vorher standen hier ZWEI Messungen mit demselben Defekt:
  //     const linkBox = (await link.boundingBox())!            // vor dem Klick
  //     await expect.poll(… karte.boundingBox() !== null …)
  //     const kBox = (await karte.boundingBox())!
  // Beide `!` behaupten eine Zusicherung, die Playwright nicht gibt:
  // `boundingBox()` liefert `null`, sobald das Element im Messmoment nicht
  // gelayoutet ist — und der Entscheid-Leser lädt seinen Volltext on demand,
  // tauscht also Knoten aus, während `scrollIntoViewIfNeeded()` längst zurück
  // ist. Das `null` lief stumm durch und schlug 17 Zeilen später als
  // `TypeError: Cannot read properties of null (reading 'y')` auf — ein
  // Fehlerbild, das den ECHTEN Ort verschweigt und wie ein Produktdefekt aussieht.
  //
  // GEMESSENE RATE, Bedingung jeweils genannt (Streuung statt Einzelwert,
  // §0 Ziff. 3 — identischer Build):
  //     1 Worker (= CI-Konfiguration)          0 rot / 6 Läufe
  //     5 Worker (lokaler Default)             1 rot / 7 Läufe
  //     8 Worker + repeat-each=3               2 rot / 3 Wiederholungen
  // Lastabhängig ⇒ kein Produktdefekt, sondern fehlende Stabilitäts-Wartung.
  //
  // ERSTER FIX-VERSUCH WAR ZU KURZ und ist hier dokumentiert, damit ihn niemand
  // wiederholt: ein `expect.poll(… !== null)` VOR dem `boundingBox()` behebt
  // nichts, weil Prüfung und Lesung zwei getrennte Zugriffe sind
  // (check-then-act). Der Knoten kann zwischen beiden erneut getauscht werden —
  // der erste Lauf unter Last war grün, der zweite wieder rot (2 × 8 Worker ×
  // repeat-each=3). Ein einzelner grüner Lauf hätte den falschen Fix belegt.
  //
  // RICHTIG: EINE atomare Messung. Der Poll liest beide Boxen im selben Zugriff
  // und BEHÄLT genau die Werte, die die Bedingung erfüllt haben. Zusätzlich
  // werden sie jetzt im SELBEN, gesetzten Zustand genommen (nach dem Volltext-
  // Swap statt davor) — das beseitigt neben dem `null` auch die stille
  // Zweit-Gefahr, die Link-Geometrie von VOR dem Swap gegen die Karten-Geometrie
  // von DANACH zu vergleichen.
  //
  // KEINE ASSERTION ABGESCHWÄCHT: verglichen wird unverändert dieselbe Geometrie
  // mit denselben Toleranzen (≤ 12 px vertikal, ≤ 8 px horizontal); es wird
  // ausschliesslich gewartet, bis die Messwerte überhaupt existieren.
  type Kasten = { x: number; y: number; width: number; height: number }
  const gemessen: { link?: Kasten; karte?: Kasten } = {}
  await expect.poll(async () => {
    const [l, k] = await Promise.all([link.boundingBox(), karte.boundingBox()])
    if (l && k) { gemessen.link = l; gemessen.karte = k }
    return !!(gemessen.link && gemessen.karte)
  }, { message: 'Link- und Karten-Geometrie nie gleichzeitig messbar' }).toBe(true)
  const linkBox = gemessen.link!
  const kBox = gemessen.karte!

  // Kein Seiten-Sprung beim Öffnen.
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollVor)
  // Vertikal unmittelbar unter ODER über dem Link (wenige px Toleranz).
  const vertikalNah = Math.min(
    Math.abs(kBox.y - (linkBox.y + linkBox.height)),
    Math.abs(kBox.y + kBox.height - linkBox.y),
  )
  expect(vertikalNah).toBeLessThanOrEqual(12)
  // Horizontal am Link (Überlappung bzw. Viewport-Klemmung angrenzend).
  expect(kBox.x).toBeLessThanOrEqual(linkBox.x + linkBox.width + 8)
  expect(kBox.x + kBox.width).toBeGreaterThanOrEqual(linkBox.x - 8)
})

// ── a11y-Stichprobe auf den neuen Verzahnungs-Flächen (axe, critical/serious) ─
for (const [name, url] of [
  ['entscheid-fuss', '/rechtsprechung/bge_151_III_377'],
  ['gesetz-panel-ZGB', '/gesetze/bund/ZGB'],
] as const) {
  test(`a11y: ${name} ohne critical/serious-Verstösse (Kontext-Bereich)`, async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('lexmetrik-thema', 'hell') } catch { /* egal */ } })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
    await page.goto(url)
    const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
    await kontext.scrollIntoViewIfNeeded()
    await expect(kontext.locator('h3').first()).toBeVisible({ timeout: 10_000 })
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('section[aria-labelledby="kontext-titel"]')
      // Marken-Entscheid B-2 (BERICHT.md): Inline-Links ohne Unterstreichung.
      .disableRules(['link-in-text-block'])
      .analyze()
    const hart = ergebnis.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(hart.map((v) => `${v.id}: ${v.nodes.length}×`)).toEqual([])
  })
}

// ── Mobil: neue Flächen ohne horizontalen Overflow (390px, §13-Schlussprüfpunkt) ─
for (const [name, url] of [
  ['gesetz-artikel', '/gesetze/bund/ZGB#art-684'],
  ['entscheid-fuss', '/rechtsprechung/bger_8C_559_2025'],
] as const) {
  test(`Mobil 390px: ${name} ohne horizontalen Overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url)
    const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
    await kontext.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(1500)
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
