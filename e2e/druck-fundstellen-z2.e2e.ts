// ─── W2·10-UI-NAV-Z2 · Print-CSS für Fundstellen ───────────────────────────
//
// Reproduktion VOR dem Fix (§0.2 «erst reproduzieren, dann fixen»): der
// Druckstand vom 3.8.2026 blendete mit `@media print { header { display:none } }`
// nicht nur die Topbar aus, sondern AUCH den Erlass-/Entscheid-Kopf — also
// genau die Fundstelle: Titel, SR-Nummer, Stand-Zeile, Link auf die geltende
// Fassung und (§8) das Aufhebungs-Banner. Ein Ausdruck ohne Stand-Zeile ist
// als Aktenstück wertlos und im Aufhebungsfall irreführend.
//
// Diese Spec misst den echten `print`-Medienzustand (page.emulateMedia) im
// gebauten Stand — keine CSS-Textsuche, sondern computed styles am DOM.
import { test, expect } from '@playwright/test'

const ERLASS = '/gesetze/bund/OR'

/** Sichtbar im Sinne des Druckers: kein display:none in der Vorfahrenkette. */
async function druckSichtbar(el: import('@playwright/test').Locator) {
  return el.evaluate((n) => {
    for (let k: Element | null = n; k; k = k.parentElement) {
      if (getComputedStyle(k).display === 'none') return false
    }
    return true
  })
}

test.describe('Z2 · Druck der Fundstelle', () => {
  test('Erlass-Kopf mit Titel, SR und Stand bleibt im Ausdruck', async ({ page }) => {
    await page.goto(ERLASS)
    const kopf = page.locator('main header').first()
    await expect(kopf).toBeVisible()
    await page.emulateMedia({ media: 'print' })

    expect(await druckSichtbar(kopf), 'Erlass-Kopf (Titel/SR/Stand) im Druck sichtbar').toBe(true)
    const text = await kopf.innerText()
    expect(text, 'Stand-Zeile steht im Ausdruck').toContain('Stand')
    expect(text, 'SR-Nummer steht im Ausdruck').toContain('SR')
  })

  test('Topbar-Chrome verschwindet im Ausdruck', async ({ page }) => {
    await page.goto(ERLASS)
    await page.emulateMedia({ media: 'print' })
    const topbar = page.locator('header.lc-glass')
    await expect(topbar).toHaveCount(1)
    expect(await druckSichtbar(topbar), 'sticky Topbar wird nicht mitgedruckt').toBe(false)
  })

  test('amtlicher Quell-Link druckt seine URL aus', async ({ page }) => {
    await page.goto(ERLASS)
    const link = page.locator('main header a[href^="http"]').first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    await page.emulateMedia({ media: 'print' })
    const nach = await link.evaluate((n) => getComputedStyle(n, '::after').content)
    expect(nach, `URL steht im Ausdruck (href ${href})`).toContain('http')
  })

  test('Leser-Spalten werden im Ausdruck nicht abgeschnitten', async ({ page }) => {
    test.slow() // OR-Volltext (1686 Artikel) — 3× Budget gegen CI-CPU-Starvation
    await page.goto(ERLASS)
    // `toBeAttached` statt `toBeVisible`: gemessen werden berechnete Stile, nicht
    // Sichtbarkeit — und der OR-Leser braucht unter Worker-Konkurrenz länger, bis
    // der Wrapper im Layout steht (Muster aus split-view-a34.e2e.ts).
    //
    // CI-Budget 90 s statt 30 s (QS-E2E-STABIL, Beleg 7.8.2026, Lauf 31204889639).
    // Das 30-s-Fenster war zu knapp bemessen und riss auf einem gestarveten
    // 2-vCPU-Runner: `.lc-leser` war nach 30 s noch nicht im DOM, die Seite stand
    // auf «Wird geladen …». Der Trace weist den Fehlschlag eindeutig als LADEZEIT
    // aus, nicht als Defekt — alle 36 Anfragen kamen mit 200 zurück, keine
    // Konsolen- oder Netzwerkfehler. Dass es lange dauert, ist auf dieser Seite
    // erklärbar: der OR-Leser zieht 1.9 MB OR-Volltext, 1.4 MB Struktur und
    // 9.5 MB `rechtsprechung/register.json`, die alle geparst sein wollen.
    // Eigene Messreihe auf 10-Kern-Maschine (je 3 Läufe): 1.0 s ungedrosselt,
    // 2.6 s bei 4×, 3.9 s bei 6× — der CI-Runner liegt also nochmals um ein
    // Vielfaches darunter, und ein Deckel bei 30 s misst dort die Maschine statt
    // die Sache (dieselbe Fehlerklasse wie der Standzeit-Deckel in
    // leser-ruecksprung-r5-r7, dort schon einmal als Messfehler erkannt).
    // Das ist ein ZEITBUDGET, keine Assertion (§6.3): geprüft wird unverändert,
    // dass kein Container clippt und kein Artikel via content-visibility
    // ungerendert bleibt. `test.slow()` gibt 270 s Gesamtbudget, 90 s passen hinein.
    // LOKAL bleiben 30 s — dort ist die Seite in ~1 s da, und ein weites Fenster
    // würde einen echten Ladefehler nur verzögert sichtbar machen.
    const ladeBudget = process.env.CI ? 90_000 : 30_000
    await expect(page.locator('.lc-leser')).toBeAttached({ timeout: ladeBudget })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: ladeBudget })
    await page.emulateMedia({ media: 'print' })

    // (a) Scroll-Panes dürfen im Druck nicht clippen — sonst endet der Ausdruck
    //     nach dem sichtbaren Ausschnitt.
    const clippend = await page.evaluate(() =>
      [...document.querySelectorAll('main *')].filter((n) => {
        const s = getComputedStyle(n)
        return (
          (s.overflowY === 'auto' || s.overflowY === 'scroll' || s.overflowX === 'auto' || s.overflowX === 'scroll') &&
          n.scrollHeight > n.clientHeight + 2
        )
      }).length,
    )
    expect(clippend, 'kein scrollender Container schneidet Inhalt ab').toBe(0)

    // (b) content-visibility:auto überspringt Rendering ausserhalb des Viewports —
    //     im Druck muss der Artikeltext ausgeschrieben sein.
    const versteckt = await page.evaluate(() =>
      [...document.querySelectorAll('.nt-art-cv')].filter(
        (n) => getComputedStyle(n).contentVisibility === 'auto',
      ).length,
    )
    expect(versteckt, 'kein Artikel bleibt via content-visibility ungerendert').toBe(0)
  })

  // ── §9-Bug-Check M-3 (Wächter-Ehrlichkeit, §6.7) ────────────────────────
  // Der Test darüber öffnet gar keinen zweiten Pane — er kann seinen eigenen
  // Fall also nicht sehen. Im Split-View liegt die Höhenbegrenzung nämlich
  // NICHT am gemessenen Element, sondern am Multipane-Rahmen (`h-dvh` in
  // Shell.tsx) und am Pane-`<main>` selbst (`absolute inset-0 overflow-y-auto`,
  // das kein `main …`-Nachfahren-Selektor trifft). Ergebnis vor dem Fix: der
  // Ausdruck endet nach EINER Seite, während derselbe Erlass ohne Split über
  // hunderte Seiten läuft. Dieser Test öffnet den zweiten Pane real und misst.
  test('Split-View-Ausdruck bleibt nicht auf eine Seite zugeschnitten', async ({ page }) => {
    test.slow() // schwere Split-View-Interaktion (Panes + idle-Shards + Scroll)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/ZGB#art-1')
    await expect(page.locator('#art-1')).toBeAttached()

    // Referenz: derselbe Erlass OHNE Split — so hoch druckt er wirklich.
    await page.emulateMedia({ media: 'print' })
    const ohneSplit = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(ohneSplit, 'Referenz: der Erlass ist vielseitig').toBeGreaterThan(20_000)
    await page.emulateMedia({ media: 'screen' })

    // Zweiten Pane real öffnen (Muster aus split-view-a34.e2e.ts).
    const art = page.locator('#art-684')
    await expect(async () => {
      await art.scrollIntoViewIfNeeded()
      await expect(art.getByRole('button', { name: /nebeneinander öffnen/ }).first()).toBeVisible({ timeout: 2000 })
    }).toPass({ timeout: 20_000 })
    await art.getByRole('button', { name: /nebeneinander öffnen/ }).first().click()
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 10_000 })

    await page.emulateMedia({ media: 'print' })
    const mass = await page.evaluate(() => {
      const primaer = document.querySelector('[data-pane="primaer"]') as HTMLElement
      return {
        doku: document.documentElement.scrollHeight,
        paneUeberhang: primaer.scrollHeight - primaer.clientHeight,
      }
    })

    // (a) Das Primär-Pane clippt seinen eigenen Inhalt nicht mehr.
    expect(mass.paneUeberhang, `Pane-Überhang ${mass.paneUeberhang}px wird abgeschnitten`).toBeLessThanOrEqual(2)
    // (b) Und das Dokument bleibt vielseitig statt auf eine Bildschirmhöhe
    //     zusammenzufallen (der Split-Ausdruck war ~1 Seite, ohne Split ~hunderte).
    expect(mass.doku, `Split-Ausdruck ${mass.doku}px vs. ${ohneSplit}px ohne Split`).toBeGreaterThan(20_000)
  })
})
