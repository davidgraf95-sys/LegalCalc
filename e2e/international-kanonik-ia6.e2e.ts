// IA-6 · International-Kanonik Stufe 1 (FAHRPLAN-GESETZES-UX §11.4 Ziff. 3,
// §11.5-IA-6, W2·5d): Kanonik = Säule /gesetze?ebene=international;
// /international bleibt VOLL funktionale Alias-Seite. Beweise dieser Spec:
//   – rel=canonical der Alias-Seite zeigt auf die kanonische Säulen-URL
//     (prerendert in dist/international.html, von RouteMeta client-seitig
//     identisch nachgeführt); og:url konsistent dazu.
//   – Gegenprobe: /gesetze bleibt Self-Canonical (die Ausnahme überstrahlt nicht).
//   – Deep-Link-REGRESSION: alle 5 Hash-Anker (navigation.ts) laden die Seite
//     und scrollen die Ziel-Sektion in den Viewport — KEIN Redirect, die URL
//     bleibt /international#<anker> (Stufe 2 nur mit separatem David-Go).
//   – Interne Link-Vereinheitlichung: der Sidebar-Gruppen-Kopf «International»
//     zielt auf die kanonische Säule (wie Bund/Kantone), die 5 Anker-Kinder
//     unverändert auf /international#….
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

const SITE_URL = 'https://lexmetrik.vercel.app'
const KANONISCH = `${SITE_URL}/gesetze?ebene=international`

// Die 5 Anker — Wortlaut-identisch zu src/lib/navigation.ts (Spec §11.4 Ziff. 3).
const ANKER = ['menschenrechte', 'privat-zivil', 'rechtshilfe', 'schweiz-eu', 'eu-verordnungen']

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('IA-6 · rel=canonical (Stufe 1, kein Redirect)', () => {
  test('/international trägt canonical + og:url auf die kanonische Säulen-URL', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/international')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Kein Redirect: die Alias-Route bleibt stehen (Stufe 2 = separates Go).
    expect(new URL(page.url()).pathname).toBe('/international')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', KANONISCH)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', KANONISCH)
    expect(fehler).toEqual([])
  })

  test('Gegenprobe: /gesetze bleibt Self-Canonical', async ({ page }) => {
    await page.goto('/gesetze')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/gesetze`)
  })
})

test.describe('IA-6 · Deep-Link-Regression: alle 5 Anker der Alias-Seite', () => {
  for (const anker of ANKER) {
    test(`/international#${anker} lädt und scrollt die Sektion in den Viewport`, async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.goto(`/international#${anker}`)
      const sektion = page.locator(`section#${anker}`)
      // Sektion existiert, trägt eine Überschrift und ist in den Viewport gescrollt
      // (ScrollZuHash wartet das async geladene Manifest ab).
      await expect(sektion).toBeVisible()
      await expect(sektion.getByRole('heading', { level: 2 })).toBeVisible()
      await expect(sektion).toBeInViewport()
      // Kein Redirect, kein Hash-Verlust: URL unverändert.
      const url = new URL(page.url())
      expect(url.pathname).toBe('/international')
      expect(url.hash).toBe(`#${anker}`)
      expect(fehler).toEqual([])
    })
  }
})

test.describe('IA-6 · Sidebar: interne Links vereinheitlicht', () => {
  test('Gruppen-Kopf «International» zielt auf die Säule; die 5 Anker-Kinder bleiben auf /international', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' })
    // Kopf-Link der Gruppe (Vereinheitlichung mit Bund/Kantone: Säulen-URL).
    const kopf = nav.getByRole('link', { name: 'International', exact: true })
    await expect(kopf).toHaveAttribute('href', '/gesetze?ebene=international')
    // Kinder aufklappen und alle 5 Anker-Ziele unverändert nachweisen.
    await nav.getByRole('button', { name: 'International aufklappen' }).click()
    for (const [label, anker] of [
      ['Menschenrechte', 'menschenrechte'],
      ['Int. Privat- & Zivilrecht', 'privat-zivil'],
      ['Rechtshilfe (Haager)', 'rechtshilfe'],
      ['Schweiz–EU', 'schweiz-eu'],
      ['EU-Verordnungen (DSGVO u. a.)', 'eu-verordnungen'],
    ] as const) {
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute('href', `/international#${anker}`)
    }
    // Klick auf den Kopf landet auf der kanonischen Säule (International-Inhalt).
    await kopf.click()
    await expect(page).toHaveURL(/\/gesetze\?ebene=international$/)
    expect(fehler).toEqual([])
  })
})
