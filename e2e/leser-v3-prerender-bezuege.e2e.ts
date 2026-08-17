// @shard-gruppe: 6
// ─── H3 · SEO-Prüfpunkt: das Nachladen erreicht den Prerender nicht ──────────
//
// ── §7-BEFUND, ABWEICHEND UMGESETZT UND OFFENGELEGT ─────────────────────────
// Der Fahrplan (Kap. 7, «Panel-Nachladen») formuliert den harten SEO-Prüfpunkt
// so: «Der Prerender behält die Bezüge serverseitig im HTML — nur der Browser
// lädt nach.» Beim Bau nachgemessen: **der prerenderte Erlass-HTML trug nie
// Bezüge.** `erlassVolltextHtml` (`src/lib/seo-detail.ts`) schreibt Kopf +
// Artikel-Volltext und sonst nichts; weder `scripts/prerender.ts` noch
// `seo-detail.ts` berühren `rechtsprechung/bezuege` oder `norm-index`
// (Quellensonde in `src/tests/leser-v3-fundament.test.ts`). Die Prämisse des
// Prüfpunkts ist also falsch — es gibt keine Bezüge im Prerender, die das
// Nachladen verlieren könnte.
//
// WAS DER WÄCHTER STATTDESSEN SICHERT — die reale Fassung derselben Sorge:
//  (a) Die SEO-Substanz der Erlass-Seite ist unverändert im ausgelieferten HTML:
//      Artikel-Volltext, ohne JavaScript, im prerenderten Dokument.
//  (b) Das Nachladen wirkt AUSSCHLIESSLICH im Browser und AUSSCHLIESSLICH nach
//      einer Nutzer-Geste: vor dem Öffnen des Panels geht KEIN Byte des
//      Bezugs-Shards über die Leitung, danach genau dieser eine.
//      Das ist zugleich die Messung der Ersparnis — die Zahl steht im
//      Vollzugsvermerk, das VERHALTEN steht hier.
//
// Ohne (b) wäre das Nachladen eine Behauptung: `useBezuege` lädt in ihrem
// EIGENEN Effekt, nicht beim Konsumieren — ein Panel, das die Daten nur nicht
// anzeigt, hätte sie trotzdem geholt.
//
// ROT ZU BEKOMMEN (§6.7):
//  · (a): in `src/lib/seo-detail.ts` `erlassVolltextHtml` auf den Kopf kürzen.
//  · (b): in `v3/leserV3Modell.ts` `bezuegeVorladen: false` entfernen — dann
//    liegt der Shard schon beim Seitenaufruf auf der Leitung, rot.
import { test, expect, type Page } from '@playwright/test'

const BEZUG_MUSTER = /\/rechtsprechung\/bezuege\//

function bezugAnfragen(page: Page): string[] {
  const treffer: string[] = []
  page.on('request', (r) => { if (BEZUG_MUSTER.test(r.url())) treffer.push(r.url()) })
  return treffer
}

test.describe('H3 — Prerender bleibt unberührt, das Nachladen bleibt im Browser', () => {
  test('(a) das prerenderte Erlass-HTML trägt den Artikel-Volltext', async ({ request }) => {
    // Direkt die vom Prerender geschriebene Datei, nicht die SPA-Route: das ist
    // das Dokument, das ein Crawler bekommt (Vercel matcht es über das
    // Dateisystem, `vite preview` liefert es unter demselben Pfad mit `.html`).
    const antwort = await request.get('/gesetze/bund/STPO.html')
    expect(antwort.status(), 'prerenderte Erlass-Seite fehlt').toBe(200)
    const html = await antwort.text()

    // Kopf-Substanz (§8: Identität + amtliche Quelle).
    expect(html).toContain('SR 312.0')
    expect(html).toContain('amtliche Fassung (geltend)')
    // Artikel-Substanz: Überschrift UND Wortlaut, nicht bloss die Marke.
    expect(html).toContain('Art. 429')
    expect(html).toMatch(/Anspruch/)
    // Genug Artikel, um «thin content» auszuschliessen — die StPO führt 480.
    const artikel = html.match(/<article>/g)?.length ?? 0
    expect(artikel, `nur ${artikel} <article> im prerenderten HTML`).toBeGreaterThan(400)
    // Und KEIN Stück Hüllen-Zustand: der Prerender kennt das Panel nicht.
    expect(html).not.toContain('data-v3-panel')
    expect(html).not.toContain('data-leser-v3')
  })

  test('(b) Bezugs-Shard: null Anfragen beim Seitenaufruf, genau eine nach dem Öffnen', async ({ page }) => {
    const anfragen = bezugAnfragen(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    // Der Lader läuft im Leerlauf (`beiLeerlauf`) — es wird also bewusst gewartet,
    // statt sofort zu behaupten, es käme nichts.
    await page.waitForTimeout(2500)

    expect(anfragen, `Bezugs-Shard schon beim Seitenaufruf geladen: ${anfragen.join(', ')}`).toEqual([])

    await page.locator('[data-v3-panel-zaehler]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible()
    await expect(page.locator('[data-v3-panel] [data-v3-panel-gruppe]').first()).toBeVisible({ timeout: 20_000 })

    expect(anfragen.length, 'nach dem Öffnen wurde kein Shard geladen').toBeGreaterThan(0)
    expect(anfragen.length, `mehr als ein Shard-Fetch: ${anfragen.join(', ')}`).toBe(1)
    expect(anfragen[0]).toMatch(/STPO\.json/)

    // Schliessen und wieder öffnen lädt NICHT erneut (`jeGeoeffnet`, nicht `offen`).
    await page.locator('[data-v3-panel-zu]').click()
    await page.locator('[data-v3-panel-zaehler]').click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible()
    await page.waitForTimeout(1200)
    expect(anfragen.length, `Zweit-Fetch nach Wieder-Öffnen: ${anfragen.join(', ')}`).toBe(1)
  })

  test('(c) ohne JavaScript bleibt die Erlass-Seite lesbar (Crawler-Sicht)', async ({ browser }) => {
    const kontext = await browser.newContext({ javaScriptEnabled: false })
    const seite = await kontext.newPage()
    const anfragen = bezugAnfragen(seite)
    await seite.goto('/gesetze/bund/STPO.html')
    await expect(seite.locator('h1')).toContainText('StPO', { timeout: 20_000 })
    await expect(seite.locator('article').first()).toBeVisible()
    expect(anfragen, 'ohne JS wurde ein Bezugs-Shard geholt').toEqual([])
    await kontext.close()
  })
})
