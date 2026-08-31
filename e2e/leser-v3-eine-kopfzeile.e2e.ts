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
//  · in `src/pages/GesetzLeser.tsx` (bis H5, 21.8.2026: `gesetz-leser/GesetzLeserV3.tsx`)
//    die Meldung `meldeInhaltsKopf({ kopfzeileSelbst: true, … })` streichen
//    ⇒ dasselbe;
//  · in `src/pages/gesetz-leser/v3/kopfStufen.ts` `krume` auf einem Zuschnitt
//    abschalten ⇒ (b)/(f) verlieren «Gesetze ›» und die Ebene-Stufe, (b2)/(h)
//    den Rücksprung «‹ Gesetze»;
//  · in `src/pages/gesetz-leser/v3/LeserRahmenV3.tsx` den Aufruf
//    `useKopfAnspruch(...)` durch `useKopfAnspruch(false)` ersetzen ⇒ (i) findet
//    auf EMRK/DSGVO/Fehlseite wieder KEINE Krume und KEIN ✕;
//  · in `src/components/layout/PaneKopf.tsx` `nurSteuerung` ignorieren ⇒ (d)
//    findet die Ortsangabe wieder in der Pane-Titelleiste.
import { test, expect, type Page } from '@playwright/test'
import { fehlerSammeln } from './helpers/fehlerSammeln'

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
    await page.goto('/gesetze/bund/STPO')
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
    // ── Ä87/Ä91 (H4-Nachzug 18.8.2026) · KEIN Schliess-Griff mehr ──────────
    // Hier stand «EIN Schliess-Griff, und zwar der des Gesetzes». Gemessen
    // 18.8.2026 @1440 lag genau dieses ✕ bei offenem Beiwerk-Blatt 47 px über
    // dessen eigenem ✕ (y 80 / y 127) — zwei gleiche Zeichen, zwei Wirkungen.
    // Es ist gestrichen; sein Ziel `/gesetze` steht in derselben Zeile als
    // beschriftete Krume (Zusicherung (b) unten). Die Aussage bleibt damit
    // scharf: im RUHEZUSTAND trägt die ganze Kopfzone NULL Schliess-Griffe.
    expect(m.kreuze.length, `Schliess-Griffe: ${m.kreuze.join(' | ')}`).toBe(0)
    expect(m.ortsangabenImChrome, 'die App-Leiste nennt noch eine Ortsangabe').toBe(0)

    // (b) Die Kopfzeile trägt die VOLLE Krume — klickbar, mit den Zielen der
    // alten Leiste — plus Kürzel, Ortsangabe und Ansicht.
    const ort = page.locator('[data-v3-kopf] nav[aria-label="Ort im Gesetz"]')
    await expect(ort.getByRole('link', { name: 'Gesetze' })).toHaveAttribute('href', '/gesetze')
    // Cowork-Befund 14 (18.8.2026, fachliche Korrektur): «Bund» zeigte vorher
    // auf dasselbe Ziel wie «Gesetze» — jetzt auf die gefilterte Bund-Übersicht.
    await expect(ort.getByRole('link', { name: 'Bund' })).toHaveAttribute('href', '/gesetze?ebene=bund')
    await expect(page.locator('[data-v3-kopf-kuerzel]')).toHaveText('StPO')
    await expect(page.locator('[data-v3-kopf] [data-v3-ansicht]')).toBeVisible()
    await expect(page.locator('[data-v3-kopf-schliessen]'),
      'Ä87: das Kopf-✕ ist gestrichen — der Rücksprung steht als Krume').toHaveCount(0)
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
    await page.goto('/gesetze/bund/STPO')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await page.waitForTimeout(600)

    const m = await chrome(page)
    expect(m.appLeisten, 'die App-Krumen-Leiste ist noch im DOM').toBe(0)
    expect(m.leserKrumen).toBe(1)
    expect(m.kopfOben).toBeLessThanOrEqual((m.topbarUnten ?? 0) + 1)
    expect(m.kopfUnten, `Chrome bis zur Lesefläche @390 ${m.kopfUnten} px — erlaubt ${VORHER_H} − ${APP_LEISTE_H}`)
      .toBeLessThanOrEqual(VORHER_H - APP_LEISTE_H)
    // ── Ä46/NM-2 (H4-II, 17./18.8.2026) · @390 STEHT GAR KEIN ✕ MEHR ────────
    // Hier stand `.toBe(1)`. Die Zahl war nie das Ziel, sondern «nicht zwei»
    // (A-2 hatte sie von 2 auf 1 gebracht). H4-II bringt sie auf 0, und zwar
    // nicht durch Verlust: das ✕ führte auf `/gesetze` — genau dorthin, wohin
    // der Rücksprung «‹ Gesetze» zwei Zentimeter weiter links in DERSELBEN
    // Zeile führt (unten geprüft, samt Klick). Zwei Griffe, ein Ziel, 350 px
    // Zeilenbreite. Der frei gewordene Platz trägt jetzt den Panel-Zähler, den
    // `mini` bis dahin gar nicht hatte (NM-2, `leser-v3-h4-kopfwege` (a)).
    // §6.3: fachliche Änderung, deklariert — die Aussage wird nicht weicher,
    // sondern schärfer (genau 0 statt «nicht mehr als 1»).
    expect(m.kreuze.length, `Schliess-Griffe @390: ${m.kreuze.join(' | ')}`).toBe(0)
    // Auf `mini` fällt die KETTE (Kap. 4a) — nicht die Krume: seit V2 (Nachzug
    // 17.8.2026) bleibt ihre erste Stufe als klickbarer Rücksprung «‹ Gesetze»
    // stehen. Vorher war das ✕ hier der einzige Weg nach oben, und es springt an
    // der Ebene vorbei. Die Ortsangabe bleibt, und das Suchfeld ist weiterhin das
    // oberste Element des klebenden Blocks.
    await expect(page.locator('[data-v3-kopf-kuerzel]')).toHaveText('StPO')
    await expect(page.locator('[data-v3-kopf] [data-v3-suchsprung] input')).toBeVisible()
    const kurz = page.locator('[data-v3-kopf-krume-kurz]')
    await expect(kurz).toHaveCount(1)
    await expect(kurz).toHaveAttribute('href', '/gesetze')
    await expect(kurz).toBeVisible()
    // Die volle Kette steht hier NICHT — sonst prüfte die Zeile oben nur, dass
    // der Zuschnitt gar nicht greift.
    const ortH = (await page.locator('[data-v3-kopf] nav[aria-label="Ort im Gesetz"]').innerText())
      .replace(/\s+/g, ' ')
    expect(ortH, `Ortsangabe @390: «${ortH}»`).not.toContain('Bund')
    // Und er ist wirklich bedienbar: ein Klick führt zur Gesetzes-Übersicht.
    await kurz.click()
    await expect(page).toHaveURL(/\/gesetze(\?|$)/, { timeout: 20_000 })

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
      // Ä46 (H4-II) / Ä87 (H4-Nachzug): der V3-Kopf trägt kein eigenes ✕ mehr —
      // im Pane war es das zweite Kreuz (44 px unter dem der Griffleiste), seit
      // 18.8.2026 ist es auf JEDER Breite gestrichen; das Duplikat des
      // Rücksprungs, der hier steht und dasselbe Ziel hat.
      await expect(page.locator(`${wahl} [data-v3-kopf-schliessen]`)).toHaveCount(0)
      await expect(page.locator(`${wahl} [data-v3-kopf-krume-kurz]`)).toBeVisible()
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

  // «(e) OHNE Flag ist die App-Leiste unverändert da (FL-4)» GELÖSCHT
  // 21.8.2026 (H5) — prüfte `[data-inhalt-kopf]` der Ist-Hülle (FL-4, mit dem
  // Flag-Code gefallen). Kein Rückweg mehr, den man ohne Flag prüfen könnte.

  test('(f) erlass-neutral: Kanton BS zeigt «Gesetze › Kanton BS › …»', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/kanton/BS-640.100')
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
    await page.goto('/gesetze/bund/STPO')
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

  // ── (h) V2 · IM PANE GILT DIESELBE REGEL, GEMESSEN AN DER ELEMENTBREITE ────
  // Ein 700-px-Pane unterschreitet die 900-px-Schwelle und bekommt darum den
  // Zuschnitt `kompakt` — mit demselben Rücksprung wie das Handy, aus derselben
  // Funktion (`kopfStufen`, ResizeObserver am Rahmen; Kap. 10: keine
  // `imPane`-Verzweigung). Das ist der Fall, den A-2 unbemerkt gebrochen hatte:
  // im Split gab es über dem Kopf gar keine App-Leiste mehr, die hätte auffangen
  // können.
  test('(h) V2 · Pane unter 900 px trägt den Rücksprung «‹ Gesetze»', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(800)

    for (const wahl of ['[data-pane="primaer"]', '[data-pane="sekundaer"]']) {
      const kopf = page.locator(`${wahl} [data-v3-kopf]`)
      // Positiv-Sonde: das Pane ist wirklich schmaler als 900 px — sonst prüfte
      // die Zeile darunter den Desktop-Zuschnitt und wäre grundlos grün.
      const breite = (await kopf.boundingBox())!.width
      expect(breite, `${wahl} ist ${breite} px breit — über der 900-px-Schwelle`).toBeLessThan(900)
      const kurz = kopf.locator('[data-v3-kopf-krume-kurz]')
      await expect(kurz, `${wahl} ohne Rücksprung`).toHaveCount(1)
      await expect(kurz).toHaveAttribute('href', '/gesetze')
      await expect(kurz).toBeVisible()
    }

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── (j) DIE RESERVIERUNG ÜBERLEBT JEDEN PFADWECHSEL (Cowork-Befund 1/53) ──
  //
  // BEFUND (externe Test-Session 18.8.2026, Mechanik dort vermessen): nach einem
  // Erlass-Wechsel (ZGB → OR) oder der Zurücktaste in einen zuvor besuchten
  // Erlass erschien die App-Krumen-Leiste im LAUTEN Zustand («‹ Gesetze › StPO ✕»,
  // z-19) GENAU AUF der V3-Werkzeugleiste (z-17, gleiches top 64 px) und
  // übermalte «Rechtsprechung» und «Ansicht»; ihr ✕ führte auf die Startseite
  // (Befunde 1, 4, 15, 17, 53). WURZEL im Code: die Shell setzt ihre Kopfdaten
  // bei JEDEM Pfadwechsel zurück (Shell.tsx, «frische Seite meldet neu»), aber
  // die Melde-Effekte des Lesers (`useKopfAnspruch`, Fassaden-Reservierung)
  // hingen nicht am Pfad — sie meldeten nur beim Mount, und der Leser bleibt
  // beim Erlass-Wechsel gemountet. Danach griff der `kopfVonPfad`-Fallback.
  // ROT ZU BEKOMMEN (§6.7, am 21.8.2026 gesehen): in `useKopfAnspruch.ts` den
  // `pathname` wieder aus den Deps nehmen ⇒ nach dem Wechsel misst `appLeisten` 1.
  test('(j) Erlass-Wechsel und Zurücktaste: die App-Leiste bleibt still', async ({ page }) => {
    test.slow() // drei Leser-Ladevorgänge in einer Sitzung
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })

    // Client-seitiger Wechsel in einen ZWEITEN Erlass über die Fuss-Navigation
    // («<Kürzel> ›», exakt die Repro der Test-Session). Kein `page.goto`: ein
    // Vollreload wäre der Erstaufruf, den (a) schon prüft — der Befund braucht
    // den Route-Param-Wechsel bei GEMOUNTETEM Leser.
    await page.locator('nav[aria-label="Weitere Erlasse"] a').last().click()
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)
    let m = await chrome(page)
    expect(m.appLeisten, 'App-Leiste laut nach Erlass-Wechsel (Befund 1)').toBe(0)
    expect(m.appKrumen, 'zweite Krume nach Erlass-Wechsel').toBe(0)

    // Zurücktaste in den vorher besuchten Erlass (Befund 53).
    await page.goBack() // → BGFA, client-seitig (popstate)
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)
    m = await chrome(page)
    expect(m.appLeisten, 'App-Leiste laut nach Zurücktaste (Befund 53)').toBe(0)
    expect(m.appKrumen, 'zweite Krume nach Zurücktaste').toBe(0)
    // Und die Werkzeugleiste ist BEDIENBAR: der oberste Treffer am «Ansicht»-Griff
    // ist der Griff selbst, nicht der Container der App-Leiste (elementFromPoint —
    // exakt die Messung der Test-Session).
    const oben = await page.evaluate(() => {
      const griff = document.querySelector('[data-v3-kopf] [data-v3-ansicht]')
      if (!griff) return 'kein-griff'
      const r = griff.getBoundingClientRect()
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return el && (griff === el || griff.contains(el) || el.contains(griff)) ? 'griff' : `verdeckt:${el?.className}`
    })
    expect(oben, 'die V3-Werkzeugleiste ist übermalt').toBe('griff')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── (k) AUCH DER RÜCKWEG AUS ENTSCHEID/MATERIAL LÄSST DIE LEISTE STILL ────
  //
  // BEFUND David 21.8.2026 (nach dem (j)-Fix): «der gleiche bug … liegt noch
  // vor wenn ich von entscheid rückwärts auf das gesetz gehe». Gleiche Wurzel,
  // anderer Melder: EntscheidLeser/MaterialLeser räumten ihre Kopf-Meldung im
  // passiven Unmount-Cleanup — das lief NACH dem Layout-Effekt des wieder
  // montierten Gesetz-Lesers und wischte dessen Reservierung weg. ROT ZU
  // BEKOMMEN (§6.7, 21.8.2026 gesehen): das Cleanup in `EntscheidLeser.tsx`
  // wieder einsetzen ⇒ nach goBack misst `appLeisten` 1.
  test('(k) Entscheid öffnen und Zurücktaste: die App-Leiste bleibt still', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    // OR Art. 41: verlässliche «viele BGE»-Stelle (der Standard-Instanzfilter
    // zeigt nur BGE — ein Artikel ohne BGE-Treffer liesse den Test ohne Link
    // verhungern, gesehen 21.8. an SchKG Art. 10).
    await page.goto('/gesetze/bund/OR#art-41')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    // Panel öffnen und client-seitig in einen Entscheid navigieren.
    await page.locator('[data-v3-panel-oeffner]').click()
    const entscheid = page.locator('a[href^="/rechtsprechung/"]:visible').first()
    await expect(entscheid).toBeVisible({ timeout: 20_000 })
    await entscheid.click()
    await expect(page).toHaveURL(/\/rechtsprechung\//, { timeout: 20_000 })
    await page.waitForTimeout(400)
    // Zurück in den Gesetz-Leser (Befund-Repro).
    await page.goBack()
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(400)
    const m = await chrome(page)
    expect(m.appLeisten, 'App-Leiste laut nach Zurück aus dem Entscheid').toBe(0)
    expect(m.appKrumen, 'zweite Krume nach Zurück aus dem Entscheid').toBe(0)
    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  // ── (i) V1 · WO KEIN V3-KOPF STEHT, MUSS DIE APP-LEISTE ZURÜCKKOMMEN ──────
  //
  // BEFUND (Ästhetik-Review 17.8.2026): die Fassade meldete `kopfzeileSelbst`
  // UNBEDINGT — auf den drei Wegen, auf denen der Rahmen früh zurückkehrt
  // (Fehlseite · pdf-embed · nur-live-link), rendert sie aber nie eine Kopfzeile.
  // Gemessen 17.8.2026 an `/gesetze/bund/EMRK?leser=v3` (damalige Adresse; seit Befund 45 kanonisch `/gesetze/international/EMRK`): null Krumen, null ✕. Der Leser sass
  // auf einer Seite ohne jeden Weg zurück — in V1 trug die App-Leiste ihn.
  // Geprüft wird das SICHTBARE Ergebnis (Krume + Schliessen), nicht die Meldung:
  // eine Sonde auf `kopfzeileSelbst` bliebe grün, wenn die Leiste aus einem
  // anderen Grund verschwände.
  for (const [name, pfad] of [
    ['pdf-embed (EMRK)', '/gesetze/international/EMRK'],
    ['nur-live-link (DSGVO)', '/gesetze/international/DSGVO'],
    ['Fehlseite', '/gesetze/bund/GIBTSNICHT'],
  ] as const) {
    test(`(i) V1 · ${name}: App-Krume und ✕ sind da`, async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(pfad)
      // Positiv-Sonde: es steht wirklich KEIN V3-Kopf auf dieser Seite — sonst
      // prüfte der Test den Normalfall.
      await expect(page.locator('[data-inhalt-kopf]')).toBeVisible({ timeout: 20_000 })
      await page.waitForTimeout(600)
      await expect(page.locator('[data-v3-kopf]'), 'diese Ansicht rendert doch einen V3-Kopf').toHaveCount(0)
      await expect(page.locator('[data-inhalt-kopf-still]'), 'die Leiste schweigt weiterhin').toHaveCount(0)

      const leiste = page.locator('[data-inhalt-kopf]')
      await expect(leiste.locator('nav')).toHaveCount(1)
      const text = (await leiste.innerText()).replace(/\s+/g, ' ')
      expect(text, `App-Leiste: «${text}»`).toContain('Gesetze')
      await expect(leiste.getByRole('link', { name: 'Gesetze' })).toHaveAttribute('href', '/gesetze')
      // Ein Schliess-Griff — der Weg zurück, der auf diesen Seiten fehlte.
      await expect(leiste.getByRole('button', { name: /schliessen/i })).toHaveCount(1)

      expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
    })
  }
})
