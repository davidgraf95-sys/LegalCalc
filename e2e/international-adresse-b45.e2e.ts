// @shard-gruppe: 2
// ─── Befund 45 · Staatsverträge unter eigener Adresse ───────────────────────
//
// Cowork-Befund 45 (18.8.2026): Staatsverträge lagen unter `/gesetze/bund/…`,
// während Brotkrume und Reiter-Herkunft «International» sagten. Entscheid David
// 29.8.2026: eigener Pfad `/gesetze/international/:kuerzel`, MIT dauerhaften
// Weiterleitungen.
//
// Was diese Suite beweist:
//   – Die neue Adresse liefert den Leser (200, Volltext, Kopf).
//   – Die ALTE Adresse leitet auf die neue — der Kern des Entscheids.
//   – Ein Deep-Link mit Artikel-Anker ÜBERLEBT die Weiterleitung. Das ist die
//     eigentliche Zusage: eine Weiterleitung, die den Anker verliert, wirft den
//     Leser an den Erlass-Anfang zurück, und genau solche Links stehen in
//     versendeten Rechtsschriften.
//   – Die Brotkrume nennt «International», nicht «Bund» (die Falschangabe, an
//     der der Befund hing).
//   – Gegenprobe: ein normaler Bundeserlass leitet NICHT — die Weiterleitung
//     darf nicht zur Allerwelts-Umleitung werden.
//   – Keine Schleife: die Zieladresse leitet nicht weiter.
//
// GRENZE (ehrlich, §8): läuft gegen `vite preview` (dist), prüft also den
// CLIENT-Redirect (src/pages/GesetzLeser.tsx → gesetz-leser/adressUmzug.ts) und
// den prerenderten Stub an der Alt-Adresse. Ein 301 auf Server-Ebene gibt es
// bewusst nicht — er liesse sich nur als handgepflegte Schlüsselliste in
// vercel.json schreiben (zweite Wahrheit neben dem Register, §5); Herleitung im
// Kopf von adressUmzug.ts.
import { test, expect, type Page } from '@playwright/test'

// CISG: Staatsvertrag MIT gerendertem Volltext (status snapshot) — nur an einem
// solchen lässt sich der Artikel-Anker über die Weiterleitung hinweg prüfen.
const VERTRAG = 'CISG'
const NEU = `/gesetze/international/${VERTRAG}`
const ALT = `/gesetze/bund/${VERTRAG}`
// Art. 35 CISG (Vertragsmässigkeit der Ware) — im Snapshot vorhanden.
const ANKER = 'art-35'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('Befund 45 · neue Adresse', () => {
  test('die kanonische Adresse liefert den Leser', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    const antwort = await page.goto(NEU)
    expect(antwort?.status(), 'neue Adresse muss 200 liefern').toBe(200)
    await expect(page).toHaveURL(new RegExp(`${NEU}$`))
    // Der Erlass ist wirklich geladen (nicht nur die Hülle): sein Kürzel steht im Kopf.
    await expect(page.getByRole('heading', { name: new RegExp(VERTRAG) }).first()).toBeVisible()
    expect(fehler).toEqual([])
  })

  test('die Brotkrume nennt International, nicht Bund', async ({ page }) => {
    await page.goto(NEU)
    const krume = page.getByRole('link', { name: 'International' }).first()
    await expect(krume).toBeVisible()
    // Die Falschangabe des Befunds darf nicht daneben stehen bleiben.
    await expect(page.getByRole('link', { name: /^Bund$/ })).toHaveCount(0)
  })
})

test.describe('Befund 45 · die Alt-Adresse leitet dauerhaft weiter', () => {
  test('alte Adresse landet auf der neuen', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    const antwort = await page.goto(ALT)
    // Kein 404: die Alt-Adresse bleibt erreichbar (Prerender-Stub bzw. SPA-Fallback).
    expect(antwort?.status(), 'Alt-Adresse darf nie 404 liefern').toBeLessThan(400)
    await expect(page).toHaveURL(new RegExp(`${NEU}$`))
    expect(fehler).toEqual([])
  })

  test('der Artikel-Anker überlebt die Weiterleitung', async ({ page }) => {
    await page.goto(`${ALT}#${ANKER}`)
    await expect(page).toHaveURL(new RegExp(`${NEU}#${ANKER}$`))
    // Nicht nur die URL: der Zielartikel steht wirklich da.
    const ziel = page.locator(`#${ANKER}`)
    await expect(ziel).toBeVisible()
  })

  test('die Weiterleitung hinterlässt keinen History-Eintrag (kein Zurück-Loop)', async ({ page }) => {
    await page.goto('/gesetze')
    await page.goto(ALT)
    await expect(page).toHaveURL(new RegExp(`${NEU}$`))
    await page.goBack()
    await expect(page).toHaveURL(/\/gesetze(\?.*)?$/)
  })

  test('der Stub an der Alt-Adresse kanonisiert auf die neue', async ({ request }) => {
    // Roh geholt, ohne SPA-Takeover: so sieht ein Crawler die Seite.
    const roh = await request.get(ALT)
    expect(roh.status()).toBe(200)
    const html = await roh.text()
    expect(html, 'canonical fehlt oder zeigt nicht auf die neue Adresse')
      .toContain(`rel="canonical" href="https://lexmetrik.vercel.app${NEU}"`)
    expect(html, 'die Alt-Adresse darf nicht indexiert werden').toContain('content="noindex, follow"')
  })
})

test.describe('Befund 45 · Gegenproben', () => {
  test('ein normaler Bundeserlass leitet NICHT weiter', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR$/)
  })

  test('die Zieladresse leitet nicht weiter (keine Schleife)', async ({ page }) => {
    await page.goto(NEU)
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(new RegExp(`${NEU}$`))
  })
})
