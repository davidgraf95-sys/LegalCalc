// Browser-Smoke der Rechtsprechungs-Auflistung am Artikel (FAHRPLAN-DATENHALTUNG
// §11.2, Weiche B): lazy aus dem erlass-lokalen Shard geladen. Prüft (a) ein Artikel
// MIT Entscheiden zeigt die Auflistung + Entscheid-Link, (b) ohne Treffer bzw. ohne
// aktive Facette rendert der Artikelfuss NICHTS, (c) der vollständige Normtext
// bleibt im DOM (Ctrl+F, §15.1), keine Console-/Page-Errors. Läuft gegen
// `vite preview` (dist).
//
// §6.3-DEKLARATION (28.7.2026, W2·7-BEZUG/B4 — Vorgabe David «bezüge kann weg, nur
// auflistung wenn aktiviert»): Die Fälle (a)/(b) prüften die V1a-Overline
// «Leitfälle» der flachen Chip-Reihe. Diese Darstellung ist mit B4 ENTFALLEN — der
// Artikelfuss zeigt jetzt die facettierte Auflistung mit Gruppenkopf
// («LEITENTSCHEIDE n von m»), und ohne aktive Facette steht dort gar nichts. Die
// Nachführung ist Teil dieser deklarierten fachlichen Änderung, nicht ein
// Aufweichen des Tests: der GEPRÜFTE SACHVERHALT bleibt identisch (Artikel mit
// Treffern zeigt verlinkte Entscheide · Artikel ohne Treffer erzeugt keinen
// Leerraum), nur die Darstellung, an der er gemessen wird, ist die neue.
// Anker am Bestand verifiziert (public/rechtsprechung/bezuege/OR.json, 28.7.2026):
// OR/41 führt 8 von 30 Leitentscheiden, Rang 1 unverändert BGE 146 IV 76;
// OR Art. 4 trägt weiterhin keinen Bucket.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('Rechtsprechungs-Auflistung im ArtikelLeser (OR)', () => {
  test('(a) Artikel MIT Entscheiden zeigt die Auflistung + Entscheid-Link', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/OR')
    const art41 = page.locator('#art-41')
    await art41.scrollIntoViewIfNeeded()
    // Die Auflistung wächst idle ein (requestIdleCallback). Im Grundzustand ist
    // genau eine Facette aktiv (Leitentscheide) — also steht dort die
    // bge-Gruppe mit ihrem Kopf und den Chip-Links auf die einschlägigen BGE.
    const bgeGruppe = art41.locator('[data-bezug-gruppe="bge"]')
    await expect(bgeGruppe).toBeVisible()
    // Ehrliche Grundgesamtheit am Gruppenkopf (§8): gezeigt UND erfasst.
    await expect(bgeGruppe).toContainText('8 von 30')
    await expect(art41.getByRole('link', { name: /BGE 146 IV 76/ })).toBeVisible()
    // Der Chip führt in die Rechtsprechungs-Detailseite.
    await expect(art41.getByRole('link', { name: /BGE 146 IV 76/ })).toHaveAttribute('href', /\/rechtsprechung\/bge_146_IV_76/)
    expect(fehler).toEqual([])
  })

  test('(b) ohne Treffer und ohne aktive Facette steht am Artikelfuss NICHTS', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    // Anker Art. 4: im OR-Shard weiterhin ohne Bucket (verifiziert 28.7.2026).
    const artOhne = page.locator('#art-4')
    await expect(artOhne).toHaveCount(1)
    await artOhne.scrollIntoViewIfNeeded()
    // Warten bis die Auflistung generell geladen ist (art-41 als Anker), dann
    // prüfen, dass Art. 4 keinen Artikelfuss trägt — kein reservierter Leerraum.
    await expect(page.locator('#art-41').locator('[data-bezuege-zeile]')).toBeVisible()
    await expect(artOhne.locator('[data-bezuege-zeile]')).toHaveCount(0)

    // Und der zweite, mit B4 neu deklarierte Fall (Vorgabe David 28.7.2026):
    // sind ALLE Facetten abgewählt, verschwindet die Verzahnungs-UI vollständig —
    // null Pixel im Lesetext-Bereich, auch am gut belegten Art. 41.
    await page.locator('[data-rechtsprechung-menu]').first().click()
    await page.locator('[data-bezug-klasse="bge"]').click()
    await expect(page.locator('[data-bezuege-zeile]')).toHaveCount(0)
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
