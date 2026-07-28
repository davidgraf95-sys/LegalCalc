// Browser-Smoke der «Leitfälle zu diesem Artikel»-Chips (FAHRPLAN-DATENHALTUNG
// §11.2, Weiche B): lazy aus dem erlass-lokalen Shard geladen. Prüft (a) ein Artikel
// MIT Leitfällen zeigt die Chips + Entscheid-Link, (b) ein Artikel OHNE rendert KEINE
// leere Zeile, (c) der vollständige Normtext bleibt im DOM (Ctrl+F, §15.1), keine
// Console-/Page-Errors. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('Leitfälle-Chips im ArtikelLeser (OR)', () => {
  test('(a) Artikel MIT Leitfällen zeigt die Chips + Entscheid-Link', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/OR')
    const art41 = page.locator('#art-41')
    await art41.scrollIntoViewIfNeeded()
    // Chips wachsen idle ein (requestIdleCallback). Die Zeile trägt die Overline
    // «Leitfälle» und einen Chip-Link auf den einschlägigen BGE (aus dem OR-Shard).
    //
    // §6.3-DEKLARATION (28.7.2026, W2·6-NKEY): der Norm-Schlüssel-Backfill dieses
    // Schritts hat die Fliesstext-Abdeckung erweitert — der OR/41-Bucket führt
    // seither andere Entscheide. Erwartung darum vom früheren BGE 152 III 7 auf den
    // Rang-1-Eintrag (`gewicht`-Reihenfolge) des Buckets umgestellt: BGE 146 IV 76
    // aus public/rechtsprechung/norm-index/OR.json. Der geprüfte Sachverhalt bleibt
    // identisch (Overline + Chip-Link + Ziel-Href), nur der Korpusstand ist neu.
    await expect(art41.getByText('Leitfälle', { exact: true })).toBeVisible()
    await expect(art41.getByRole('link', { name: /BGE 146 IV 76/ })).toBeVisible()
    // Der Chip führt in die Rechtsprechungs-Detailseite.
    await expect(art41.getByRole('link', { name: /BGE 146 IV 76/ })).toHaveAttribute('href', /\/rechtsprechung\/bge_146_IV_76/)
    expect(fehler).toEqual([])
  })

  test('(b) Artikel OHNE Leitfälle rendert KEINE leere Zeile', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    // §6.3-DEKLARATION (28.7.2026, W2·6-NKEY): der Norm-Schlüssel-Backfill hat die
    // Fliesstext-Abdeckung erweitert — OR Art. 2 trägt seither einen Bucket und ist
    // als «ohne Leitfälle»-Anker verbraucht. Anker darum auf Art. 4 verschoben (im
    // OR-Shard weiterhin ohne Bucket, vgl. public/rechtsprechung/norm-index/OR.json).
    // Der geprüfte Sachverhalt bleibt identisch: kein Bucket ⇒ KEINE leere Zeile.
    const artOhne = page.locator('#art-4')
    await expect(artOhne).toHaveCount(1)
    await artOhne.scrollIntoViewIfNeeded()
    // Warten bis die Chips generell geladen sind (art-41 als Anker), dann prüfen,
    // dass Art. 4 (ohne Treffer im Shard) KEINE «Leitfälle»-Overline trägt.
    await expect(page.locator('#art-41').getByText('Leitfälle', { exact: true })).toBeVisible()
    await expect(artOhne.getByText('Leitfälle', { exact: true })).toHaveCount(0)
  })

  test('(c) vollständiger Normtext bleibt im DOM (Ctrl+F / §15.1)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('#art-1')).toBeVisible()
    // Tiefe Artikel bleiben im DOM (content-visibility, kein Windowing) — die Chips
    // hängen sich nur an, sie entfernen nichts. Ein weit unten liegender Artikel und
    // die Gesamtzahl der Artikel-Knoten beweisen die Vollständigkeit.
    await expect(page.locator('#art-529')).toHaveCount(1)
    const artikelZahl = await page.locator('article[id^="art-"]').count()
    expect(artikelZahl).toBeGreaterThan(500)
  })
})
