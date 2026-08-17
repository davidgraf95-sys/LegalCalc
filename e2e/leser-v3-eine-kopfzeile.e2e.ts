// @shard-gruppe: 8
// ─── A-2 (LESER-V3, Auftrag David 17.8.2026) · EINE KOPFZEILE, NICHT ZWEI ─────
//
// DER AUFTRAG, wörtlich: «beachte dass wir jetzt oben einen header haben mit
// ähnlichem inhalt: Gesetze › Bund › StPO · Art. 144 · Stand 01.04.2025 · ✕ —
// und darunter: Gesetze › StPO … · Art. 144 · ◧ Ansicht ▾ — passe das
// entsprechend sinnvoll an».
//
// DER BEFUND, gemessen 17.8.2026 am Stand afc008c19 (`?leser=v3`, StPO):
//   @1440  Topbar bis 65 · App-Krumen-Leiste 65…102 (37 px) · V3-Kopf 102…159
//          ⇒ 2 `nav`-Krumen, 2 ✕, `--nt-stick` 156 px
//   @390   dasselbe Bild, V3-Kopf bis 195 px
//   Split  4 ✕ (2 je Pane), Pane-Titelleiste nennt Krume UND Artikel
//
// DIE NEUE WAHRHEIT, die diese Spec festhält:
//  (a) Unter `?leser=v3` gibt es GENAU EINE Krumen-Leiste — die des Lesers. Die
//      App-Leiste ist nicht «leer», sondern nicht da (`[data-inhalt-kopf]`
//      count 0), und der Kopf schliesst bündig an die Topbar an.
//  (b) Sie trägt alles, was die alte Leiste trug und was ihr gehört: die ganze
//      Krume (Gesetze › Bund › StPO, klickbar), die Ortsangabe, Ansicht, ✕.
//  (c) Den STAND trägt sie NICHT — er steht seit S3 im Erlass-Kopf, und zweimal
//      wäre eine zweite Wahrheit (§5). Geprüft in beide Richtungen: nicht im
//      Kopf, genau einmal auf der Seite.
//  (d) Im Split behält die Pane-Titelleiste ihre FENSTER-Steuerung (sie kann
//      keine Inhaltsseite tragen) und gibt die Identität ab.
//  (e) OHNE Flag ist die App-Leiste unverändert da (FL-4). Diese Sonde ist der
//      Grund, warum die Spec nicht nur «eine Leiste» zählt: eine Zählung, die
//      auch in V1 stimmt, hätte nichts über die Verschmelzung gesagt.
//  (f) Erlass-neutral: Kanton BS zeigt «Gesetze › Kanton BS › …» aus derselben
//      Ableitung, ohne Sonderpfad.
//
// ROT ZU BEKOMMEN (§6.7, am 17.8.2026 gesehen — Ausgaben im Vollzugsvermerk):
//  · in `src/components/layout/InhaltsKopf.tsx` den Block
//    `if (daten.kopfzeileSelbst) { … }` entfernen ⇒ (a)/(b) messen wieder zwei
//    Krumen-Leisten, zwei ✕ und 159 px Chrome;
//  · in `src/pages/gesetz-leser/GesetzLeserV3.tsx` die Meldung
//    `meldeInhaltsKopf({ kopfzeileSelbst: true, … })` streichen ⇒ dasselbe;
//  · in `src/pages/gesetz-leser/v3/kopfStufen.ts` `krume: stufe === 'voll'` auf
//    `false` setzen ⇒ (b)/(f) verlieren «Gesetze ›» und die Ebene-Stufe;
//  · in `src/components/layout/PaneKopf.tsx` `nurSteuerung` ignorieren ⇒ (d)
//    findet die Ortsangabe wieder in der Pane-Titelleiste.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Chrome-Höhen und Leisten-Inventar der Einzelansicht. */
async function chrome(page: Page) {
  return page.evaluate(() => {
    const kasten = (sel: string) => {
      const el = document.querySelector(sel)
      return el ? el.getBoundingClientRect() : null
    }
    const topbar = kasten('header.sticky')
    const kopf = kasten('[data-v3-kopf]')
    return {
      topbarUnten: topbar ? Math.round(topbar.bottom) : null,
      kopfOben: kopf ? Math.round(kopf.top) : null,
      kopfUnten: kopf ? Math.round(kopf.bottom) : null,
      appLeisten: document.querySelectorAll('[data-inhalt-kopf]').length,
      appKrumen: document.querySelectorAll('nav[aria-label="Brotkrümel"]').length,
      leserKrumen: document.querySelectorAll('nav[aria-label="Ort im Gesetz"]').length,
      // Schliess-Griffe im Ruhezustand: ein Knopf, dessen sichtbarer Text genau
      // «✕» ist. Deckt App-✕, Pane-✕ und Leser-✕ gleichermassen, ohne sich auf
      // eine der drei Beschriftungen zu verlassen.
      kreuze: [...document.querySelectorAll('button')]
        .filter((b) => (b.textContent ?? '').trim() === '✕')
        .map((b) => b.getAttribute('aria-label') ?? '?'),
      ortsangabenImChrome: document.querySelectorAll('[data-ort-artikel]').length,
    }
  })
}

/**
 * WO steht ein Stand-Datum, und klebt diese Stelle? Gesucht werden die INNERSTEN
 * Elemente, die die Zeichenkette tragen — sonst zählte jeder Vorfahre mit und
 * die Zahl sagte nichts. `klebt` heisst: die Stelle liegt in einer der beiden
 * klebenden Kopfleisten (App-Leiste oder V3-Kopfzeile). Nötig, weil die Orte
 * verschieden gebaut sind: die App-Leiste setzt das Datum in ein Kind-`span`,
 * der Erlass-Kopf schreibt «Stand 01.04.2025» als einen Textknoten.
 */
async function standStellen(page: Page, datum: string): Promise<{ text: string; klebt: boolean }[]> {
  return page.evaluate((d) => {
    const raus: { text: string; klebt: boolean }[] = []
    for (const el of document.querySelectorAll('body *')) {
      if (!(el.textContent ?? '').includes(d)) continue
      if ([...el.children].some((k) => (k.textContent ?? '').includes(d))) continue
      raus.push({
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
        klebt: !!el.closest('[data-inhalt-kopf], [data-v3-kopf]'),
      })
    }
    return raus
  }, datum)
}

// Die Vorzustände, gegen die der Gewinn gemessen wird (Stand afc008c19,
// 17.8.2026) und die Höhe der weggefallenen Leiste. Die Schranke ist damit keine
// runde Wunschzahl, sondern «vorher minus die Leiste».
const VORHER_D = 159
const VORHER_H = 195
const APP_LEISTE_H = 36

test.describe('A-2 — unter ?leser=v3 trägt der Leser die eine Kopfzeile', () => {
  test('(a)+(b)+(c) Einzelansicht @1440: eine Leiste, volle Krume, kein zweiter Stand', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const m = await chrome(page)
    // (a) EINE Leiste — und der Kopf klebt direkt an der Topbar.
    expect(m.appLeisten, 'die App-Krumen-Leiste ist noch im DOM').toBe(0)
    expect(m.appKrumen, 'zweite Brotkrümel-Navigation im DOM').toBe(0)
    expect(m.leserKrumen, 'die Kopfzeile des Lesers fehlt — die Messung prüfte nichts').toBe(1)
    expect(m.kopfOben, `der Kopf schliesst nicht an die Topbar an (${m.topbarUnten} → ${m.kopfOben})`)
      .toBeLessThanOrEqual((m.topbarUnten ?? 0) + 1)
    expect(m.kopfOben).toBeGreaterThanOrEqual((m.topbarUnten ?? 0) - 2)
    expect(m.kopfUnten, `Chrome bis zur Lesefläche ${m.kopfUnten} px — erlaubt ist ${VORHER_D} − ${APP_LEISTE_H}`)
      .toBeLessThanOrEqual(VORHER_D - APP_LEISTE_H)
    // EIN Schliess-Griff, und zwar der des Gesetzes (der App-✕ «zur Startseite»
    // ist mit seiner Leiste gegangen; die Topbar trägt die App-Navigation).
    expect(m.kreuze.length, `Schliess-Griffe: ${m.kreuze.join(' | ')}`).toBe(1)
    expect(m.kreuze[0]).toMatch(/Gesetz schliessen/)
    expect(m.ortsangabenImChrome, 'die App-Leiste nennt noch eine Ortsangabe').toBe(0)

    // (b) Die Kopfzeile trägt die VOLLE Krume — klickbar, mit den Zielen der
    // alten Leiste — plus Kürzel, Ortsangabe und Ansicht.
    const ort = page.locator('[data-v3-kopf] nav[aria-label="Ort im Gesetz"]')
    await expect(ort.getByRole('link', { name: 'Gesetze' })).toHaveAttribute('href', '/gesetze')
    await expect(ort.getByRole('link', { name: 'Bund' })).toHaveAttribute('href', '/gesetze')
    await expect(page.locator('[data-v3-kopf-kuerzel]')).toHaveText('StPO')
    await expect(page.locator('[data-v3-kopf] [data-v3-ansicht]')).toBeVisible()
    await expect(page.locator('[data-v3-kopf-schliessen]')).toBeVisible()
    const krumeText = (await ort.innerText()).replace(/\s+/g, ' ')
    expect(krumeText, `Krume lautet «${krumeText}»`).toContain('Gesetze › Bund › StPO')

    // (c) DER STAND IST NICHT MITGEWANDERT — und trotzdem ohne Scrollen da.
    // Die Verschmelzung hätte ihn leicht in die Kopfzeile nachziehen können; das
    // wäre die dritte Ausgabe derselben Zahl gewesen (Erlass-Kopf + Übersichts-
    // zeile tragen sie in V3 bereits, beide im Lesebereich und beide vor A-2).
    // Geprüft wird darum genau die A-2-Aussage: KEIN klebendes Chrome nennt den
    // Stand mehr, und der Erlass-Kopf tut es im Ruhezustand sichtbar (NM-3).
    const kopfText = await page.locator('[data-v3-kopf]').innerText()
    expect(kopfText, `«Stand» steht in der Kopfzeile: ${kopfText}`).not.toContain('Stand')
    const stellen = await standStellen(page, '01.04.2025')
    const imChrome = stellen.filter((s) => s.klebt)
    expect(imChrome.length, `Stand in klebendem Chrome: ${imChrome.map((s) => s.text).join(' || ')}`).toBe(0)
    const ausgeschrieben = stellen.filter((s) => s.text.includes('Stand'))
    expect(ausgeschrieben.length, 'kein ausgeschriebener «Stand …» mehr auf der Seite').toBeGreaterThan(0)
    await expect(page.getByText('Stand 01.04.2025').first()).toBeInViewport()

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b2) Handy @390: dasselbe, mit dem Zuschnitt «mini»', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const m = await chrome(page)
    expect(m.appLeisten, 'die App-Krumen-Leiste ist noch im DOM').toBe(0)
    expect(m.leserKrumen).toBe(1)
    expect(m.kopfOben).toBeLessThanOrEqual((m.topbarUnten ?? 0) + 1)
    expect(m.kopfUnten, `Chrome bis zur Lesefläche @390 ${m.kopfUnten} px — erlaubt ${VORHER_H} − ${APP_LEISTE_H}`)
      .toBeLessThanOrEqual(VORHER_H - APP_LEISTE_H)
    expect(m.kreuze.length, `Schliess-Griffe: ${m.kreuze.join(' | ')}`).toBe(1)
    // Auf `mini` fällt die Krume (Kap. 4a) — die Ortsangabe bleibt, und das
    // Suchfeld ist weiterhin das oberste Element des klebenden Blocks.
    await expect(page.locator('[data-v3-kopf-kuerzel]')).toHaveText('StPO')
    await expect(page.locator('[data-v3-kopf] [data-v3-suchsprung] input')).toBeVisible()

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(d) Split-View: die Pane-Leiste behält die Fenster-Steuerung, gibt die Identität ab', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(800)

    // Je Pane GENAU EINE Kopfzeile — und keine App-Krume irgendwo.
    for (const wahl of ['[data-pane="primaer"]', '[data-pane="sekundaer"]']) {
      await expect(page.locator(`${wahl} [data-v3-kopf]`)).toHaveCount(1)
      await expect(page.locator(`${wahl} [data-v3-kopf-kuerzel]`)).toBeVisible()
      await expect(page.locator(`${wahl} [data-v3-kopf-schliessen]`)).toBeVisible()
    }
    await expect(page.locator('[data-inhalt-kopf]')).toHaveCount(0)
    // Die Identität ist aus der Titelleiste verschwunden — geprüft am TEXT der
    // Leiste, nicht nur an der abgeschalteten Meldung: `titelVon(pathname)` gibt
    // ihr weiterhin ein `label`, sie würde es ohne `nurSteuerung` als Titel
    // ausgeben. Ein Test, der nur `[data-ort-artikel]` zählt, bliebe grün, wenn
    // die Leiste stattdessen «StPO» schreibt (am 17.8.2026 genau so gemessen —
    // darum diese scharfere Fassung).
    const leisten = page.locator('[data-pane-kopf]')
    await expect(leisten).toHaveCount(2)
    for (let i = 0; i < 2; i++) {
      const text = (await leisten.nth(i).innerText()).replace(/\s+/g, ' ').trim()
      expect(text, `Pane-Titelleiste ${i} nennt noch Identität: «${text}»`).not.toMatch(/StPO|BGFA|Gesetze|Stand/)
    }
    await expect(page.locator('[data-ort-artikel]')).toHaveCount(0)
    // Höhe unverändert 36 px: die Leiste verliert Inhalt, nicht ihren Platz —
    // sie trägt weiter die Fenster-Steuerung (kein Sprung im Pane, §15.2).
    for (let i = 0; i < 2; i++) {
      const box = await leisten.nth(i).boundingBox()
      expect(Math.round(box!.height), `Pane-Titelleiste ${i} hat ${box!.height} px`).toBe(36)
    }
    // … die Fenster-Steuerung nicht: sie kann nicht wandern, weil eine
    // Inhaltsseite ihr eigenes Fenster nicht schliessen und nicht verschieben kann.
    await expect(page.getByRole('button', { name: /Hauptfenster schliessen/ })).toHaveCount(1)
    await expect(page.getByRole('button', { name: /«BGFA» zum Hauptfenster machen/ })).toHaveCount(1)
    await expect(page.getByRole('button', { name: /Layout-Link kopieren/ })).toHaveCount(1)
    await expect(page.getByTitle('Zum Verschieben ziehen')).toHaveCount(2)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(e) OHNE Flag ist die App-Leiste unverändert da (FL-4)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    // `?leser=v1` und nicht «kein Parameter»: im Projekt `leser-v3` steht das
    // Flag im localStorage, ein Aufruf ohne Parameter liefe dort in V3 und die
    // Sonde prüfte nichts (`pages/gesetz-leser/leserFlag.ts`).
    await page.goto('/gesetze/bund/STPO?leser=v1')
    await expect(page.locator('[data-inhalt-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const m = await chrome(page)
    expect(m.appLeisten, 'die App-Leiste fehlt in V1 — FL-4 gebrochen').toBe(1)
    expect(m.appKrumen, 'die Brotkrümel-Navigation der App-Leiste fehlt in V1').toBe(1)
    expect(m.leserKrumen, 'V1 zeigt eine V3-Kopfzeile').toBe(0)
    expect(m.ortsangabenImChrome, 'V1 verliert die Ortsangabe der App-Leiste').toBeGreaterThan(0)
    const leiste = await page.locator('[data-inhalt-kopf]').innerText()
    expect(leiste, `App-Leiste in V1: ${leiste}`).toContain('Stand')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(f) erlass-neutral: Kanton BS zeigt «Gesetze › Kanton BS › …»', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/kanton/BS-640.100?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const m = await chrome(page)
    expect(m.appLeisten).toBe(0)
    expect(m.kopfUnten).toBeLessThanOrEqual(VORHER_D - APP_LEISTE_H)
    const ort = page.locator('[data-v3-kopf] nav[aria-label="Ort im Gesetz"]')
    const text = (await ort.innerText()).replace(/\s+/g, ' ')
    expect(text, `Krume lautet «${text}»`).toContain('Gesetze › Kanton BS ›')
    await expect(ort.getByRole('link', { name: 'Kanton BS' }))
      .toHaveAttribute('href', '/gesetze?ebene=kanton&kt=BS')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── (g) DIE WEICHENDE LEISTE DARF DEN INHALT NICHT VERSCHIEBEN ─────────────
  //
  // DER BEFUND, der diese Sonde erzwungen hat (17.8.2026, im Bau gemessen): die
  // Route `/gesetze/:ebene/:key` ist `lazy` (RouteSwitch), die Shell rät solange
  // aus dem Pfad, dass eine App-Leiste kommt (`kopfVonPfad`). Die erste Fassung
  // liess die Leiste bei der Meldung «ich trage sie selbst» auf 0 px fallen —
  // `main#inhalt` rückte 102 → 65 px hoch, EIN Shift von 0.0238 bei t ≈ 395 ms,
  // Gesamt-CLS 0.0309 gegen 0.0048 in V1. Das Bestands-Tor `leser-kopf-cls-s3`
  // (v3 @390) riss damit seine Schwelle 0.05 mit 0.0573.
  //
  // DER WURZELFIX (nicht umschifft, §17): das Band der Leiste BLEIBT reserviert,
  // der Leser-Kopf legt sich darüber und verschluckt es (`--leser-v3-app-band`).
  // Sichtbar sind die 37 px trotzdem gewonnen — das misst (a) —, gesprungen ist
  // nichts. Nachher: 0 Sprünge von `main#inhalt`, Gesamt-CLS 0.0064–0.0071
  // @1440 und 0.0028–0.018 @390, also auf V1-Niveau.
  //
  // GEMESSEN WIRD DER EINE SPRUNG, NICHT DAS GESAMT-CLS — und das ist §0.3, nicht
  // Bequemlichkeit: das Gesamt-CLS derselben Seite mass in der defekten Fassung
  // 0.030 allein und 0.054 unter drei parallelen Workern (dieselbe Datei,
  // derselbe Build). Eine Zahl ohne Messbedingung wäre hier ein Flake-Generator;
  // die Frage «wandert der Inhaltsrahmen?» ist dagegen bedingungsfrei.
  // ROT ZU BEKOMMEN (§6.7, am 17.8.2026 gesehen): in `InhaltsKopf.tsx` dem
  // stillen Träger seine Höhe nehmen (`h-9 border-b border-transparent` weg) ⇒
  // ein Sprung mit 0.0238.
  test('(g) beim Laden wandert der Inhaltsrahmen nicht', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => {
      const w = window as unknown as { __haupt: number[] }
      w.__haupt = []
      new PerformanceObserver((liste) => {
        type Shift = PerformanceEntry & {
          value: number; hadRecentInput: boolean; sources?: { node?: Node | null }[]
        }
        for (const e of liste.getEntries() as Shift[]) {
          if (e.hadRecentInput) continue
          const trifftMain = (e.sources ?? []).some((q) => (q.node as Element | null)?.id === 'inhalt')
          if (trifftMain) w.__haupt.push(e.value)
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(3000)

    const spruenge = await page.evaluate(() => (window as unknown as { __haupt: number[] }).__haupt)
    const summe = spruenge.reduce((s, v) => s + v, 0)
    // Gemessen 17.8.2026 @1440 StPO nach dem Wurzelfix: NULL Einträge. Die
    // Schranke lässt Chrom-Grundrauschen zu (Sub-Pixel-Rundung beim Einlaufen der
    // Webfont), aber nicht die weichende Leiste: die schlägt mit 0.0238 zu Buche,
    // also dem Fünffachen.
    expect(summe, `main#inhalt verschiebt sich um ${summe} — Sprünge ${JSON.stringify(spruenge)}; die weichende 37-px-Leiste kostet 0.0238`)
      .toBeLessThan(0.005)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
