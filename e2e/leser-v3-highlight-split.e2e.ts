// @shard-gruppe: 5
// FAHRPLAN-LESER-V3 Kap. 14 / Etappe H2 — absorbierter ROADMAP-Schritt
// `QS-UI-HIGHLIGHT`: «::highlight()-Registry je Leser-Instanz; heute löscht im
// Split-View das Rail-Suchfeld die Markierung des Nachbar-Panes».
//
// WAS HIER GEPRÜFT WIRD UND WARUM IM BROWSER. Die BUCHFÜHRUNG (welche Instanz
// hält welche Ranges) ist rein und liegt in `src/tests/suchHighlight.test.ts` —
// dort wird sie ohne Browser bewiesen, samt Rot-Beweis. Was nur hier prüfbar
// ist: dass zwei echte Leser-Instanzen im Split-View auch wirklich zwei
// Instanzen sind und die eine CSS-Registry-Position gemeinsam tragen. Genau
// diese Verdrahtung — ein Hook-Aufruf je Pane, ein Symbol je Hook-Aufruf —
// sieht der reine Test nicht.
//
// AUFBAU DES SPLIT-VIEW: über den teilbaren Layout-Link `?p=` (usePaneLayout.ts,
// B-5) statt über den ⧉-Knopf an einer Leitfall-Zeile. Der Knopf öffnet einen
// ENTSCHEID daneben; hier werden aber zwei GESETZE gebraucht, weil nur sie zwei
// In-Gesetz-Suchfelder haben. `?p=` ist derselbe Weg, den ein geteilter Link
// nimmt, also kein Test-Sonderpfad.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/**
 * Macht das Such-/Sprungfeld EINES Panes erreichbar und gibt es zurück.
 *
 * In der Einzelansicht steht es in der Seitenleisten-Spalte; im Pane ist die
 * Leiste ein Bottom-Sheet hinter ☰ (Kap. 4b), weil die Pane-Breite unter der
 * xl-Schwelle liegt. Der Helfer öffnet darum bei Bedarf zuerst — das ist keine
 * Test-Bequemlichkeit, sondern derselbe Weg, den ein Nutzer im Split geht.
 */
async function oeffneFeld(pane: import('@playwright/test').Locator) {
  const feld = pane.locator('[data-v3-suchsprung] input').first()
  if (!(await feld.isVisible().catch(() => false))) {
    await pane.locator('[data-v3-gliederung-auf]').first().click()
  }
  await expect(feld).toBeVisible({ timeout: 20_000 })
  return feld
}

/** Grösse der einen Registry-Position — 0, wenn sie gar nicht gesetzt ist. */
async function highlightGroesse(page: Page): Promise<number> {
  return page.evaluate(() => {
    const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS?.highlights
    return reg?.get('lc-such-treffer')?.size ?? 0
  })
}

test.describe('QS-UI-HIGHLIGHT — Suche in Pane A löscht die Markierung in Pane B nicht', () => {
  test('(≥lg) zwei Gesetz-Panes: Feld A leeren lässt die Markierung von Pane B stehen', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen samt Idle-Shards — 3× Budget gegen CI-CPU-Starvation
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })

    // BGFA (klein, 13 Artikel) neben BGBM (klein): beide laden schnell und
    // tragen beide den Begriff «Anwalt» bzw. «Markt» sicher NICHT im jeweils
    // anderen — die Mengen sind darum unterscheidbar.
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })

    const paneA = page.locator('[data-pane="primaer"]')
    const paneB = page.locator('[data-pane="sekundaer"]')
    // Im Pane ist die Seitenleiste ein SHEET (die Pane-Breite unterschreitet die
    // xl-Schwelle), das Suchfeld liegt also hinter ☰ und nicht in einer Spalte.
    // Erst öffnen, dann greifen — sonst prüfte der Test eine Fläche, die es in
    // dieser Breite gar nicht gibt.
    const feldA = await oeffneFeld(paneA)
    const feldB = await oeffneFeld(paneB)

    // ── Pane B sucht und malt ────────────────────────────────────────────────
    await feldB.fill('Markt')
    await expect.poll(() => highlightGroesse(page), { timeout: 30_000 }).toBeGreaterThan(0)
    const nurB = await highlightGroesse(page)

    // ── Pane A sucht ebenfalls: die EINE Position trägt jetzt BEIDE Mengen ───
    // Vor dem Fix ersetzte hier Pane A die Menge von Pane B vollständig — die
    // Vereinigung entstand nie, und im Nachbar-Pane erlosch die Markierung
    // schon bei der ersten fremden Eingabe (nicht erst beim Leeren).
    await feldA.fill('Anwalt')
    await expect.poll(() => highlightGroesse(page), { timeout: 30_000 }).toBeGreaterThan(nurB)

    // ── Der eigentliche Befund: Pane A leert sein Feld ───────────────────────
    await feldA.fill('')
    // Pane B hat weiterhin einen Begriff im Feld …
    await expect(feldB).toHaveValue('Markt')
    // … und darum muss seine Markierung stehen bleiben. Vor dem Fix fiel die
    // Position hier auf 0 (`reg.delete`), obwohl das Feld gefüllt blieb — die
    // Anzeige log über den Zustand (§8).
    await expect.poll(() => highlightGroesse(page), { timeout: 30_000 }).toBe(nurB)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(≥lg) leeren BEIDE Panes ihr Feld, verschwindet die Registry-Position ganz', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })

    const feldA = await oeffneFeld(page.locator('[data-pane="primaer"]'))
    const feldB = await oeffneFeld(page.locator('[data-pane="sekundaer"]'))

    await feldA.fill('Anwalt')
    await feldB.fill('Markt')
    await expect.poll(() => highlightGroesse(page), { timeout: 30_000 }).toBeGreaterThan(0)

    // Kein Rest: eine leere `Highlight`-Instanz in der Registry stehenzulassen
    // wäre ein Zustand, den niemand sieht und den der nächste Leser als «da»
    // läse. Die Gegenprobe zum Test oben — sonst könnte die Instanz-Buchführung
    // auch dadurch «bestehen», dass sie nie etwas löscht.
    await feldA.fill('')
    await feldB.fill('')
    await expect.poll(async () => page.evaluate(() => {
      const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, unknown> } }).CSS?.highlights
      return reg?.has('lc-such-treffer') ?? false
    }), { timeout: 90_000 }).toBe(false)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
