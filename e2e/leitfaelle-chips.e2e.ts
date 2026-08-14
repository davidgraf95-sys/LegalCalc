// @shard-gruppe: 6
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
// §6.3-NACHTRAG (29.7.2026, W2·7-BEZUG/B7): der Anker lautete «8 von 30» und
// mass den ENTFERNTEN Auslieferungs-Deckel «8 je Status». Der Shard liefert
// jetzt alle 30 Leitentscheide zu OR/41; die Linie zeigt davon 5 auf einmal und
// lädt auf Klick die nächsten 5 (David 29.7.2026). Der geprüfte Sachverhalt ist
// unverändert — ein Artikel mit Treffern zeigt verlinkte Entscheide —, nur die
// Zahl daneben ist die neue.
// Anker am Bestand verifiziert (public/rechtsprechung/bezuege/OR.json, 29.7.2026):
// OR/41 führt 30 Leitentscheide, gezeigt werden 5; Rang 1 der CHRONOLOGISCHEN
// Ordnung ist nicht mehr BGE 146 IV 76 (das war die Gewichts-Ordnung), sondern
// der jüngste — geprüft wird darum die Existenz des Chips, nicht sein Platz.
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
    // ZEITBUDGET, KEINE ASSERTION (§6.3 — CI-Empirie 29.7.2026, PR #406): dieser
    // Fall riss auf dem 2-vCPU-Runner über alle drei Retries das 90-s-Budget.
    // Gemessen gegen dist unter CPU-Drossel (Sonde 29.7.2026, Kosten JE KLICK):
    // 1× 2.2 s · 4× 8.9 s · 8× 16.7 s · 20× 47 s. Fünf Klicks kosten unter 8×
    // allein ~85 s — der Shard-Fetch dagegen ist billig («5 von 30» stand unter
    // 8× nach 3.6 s, unter 20× nach 9.2 s). Ursache ist also NICHT das Laden,
    // sondern Re-Render/Relayout je Klick auf der 500-Artikel-Seite; `force:true`
    // und `dispatchEvent` kosteten dasselbe, die Zeit liegt in der Seite. Darum
    // `test.slow()` (verdreifacht die Frist) statt eines schwächeren Prüfsatzes:
    // kein `expect` und kein Prüf-Schritt wird berührt, nur das Zeitbudget.
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/OR')
    const art41 = page.locator('#art-41')
    await art41.scrollIntoViewIfNeeded()
    // Die Auflistung wächst idle ein (requestIdleCallback). Im Grundzustand ist
    // genau eine Facette aktiv (Leitentscheide) — also steht dort die
    // bge-Gruppe mit ihrem Kopf und den Chip-Links auf die einschlägigen BGE.
    // ERST das Laden abwarten, dann Wortlaut prüfen: sonst misst die erste
    // Text-Zusicherung den Shard-Fetch mit, und ein langsamer Runner sieht eine
    // leere Zeichenkette statt des Zählers.
    await expect(art41.locator('[data-bezuege-zeile]')).toBeVisible({ timeout: 30_000 })
    const bgeGruppe = art41.locator('[data-bezug-gruppe="bge"]')
    await expect(bgeGruppe).toBeVisible()
    // Ehrliche Zahl am Gruppenkopf (§8): gezeigt UND Grundmenge.
    await expect(bgeGruppe).toContainText('5 von 30')
    // BGE 146 IV 76 ist unter den 30 — chronologisch aber weit hinten. Erst
    // «weitere» klicken, bis er geladen ist; genau das ist die B7-Zusage
    // «alles erreichbar, nichts versteckt».
    //
    // §6.7/F2d (Gegenprüfung Runde 3/B-1): der abgelöste Schluss-Wächter lautete
    // `toContainText('30')` und war von der Zeile «5 von 30» oben STRIKT
    // impliziert — er konnte nicht scheitern, solange die Grundmenge 30 ist, und
    // hätte einen stehengebliebenen oder falsch schreitenden Zähler mitgetragen.
    // Ersetzt durch Zusicherungen, die fallen, sobald die Schrittweite nicht mehr
    // stimmt: JEDER Schritt wird einzeln benannt, und am Ende steht der
    // erschöpfte Zähler als NACKTE Zahl direkt am Klassennamen.
    const weitere = bgeGruppe.locator('[data-bezug-weitere="bge"]')
    for (const schritt of ['10 von 30', '15 von 30', '20 von 30', '25 von 30']) {
      await weitere.click()
      await expect(bgeGruppe).toContainText(schritt)
    }
    await weitere.click()
    // ABWEICHUNG vom Prüfer-Wortlaut, deklariert (§7): vorgeschlagen war
    // 'LEITENTSCHEIDE30'. Die Grossschreibung kommt aber aus `text-transform:
    // uppercase` (.lc-overline, src/index.css:531), und `toContainText` misst
    // `textContent` — dort steht die Schreibweise der Quelle. Geprüft wird darum
    // 'Leitentscheide30'; die Aussage ist dieselbe und trifft empirisch.
    await expect(bgeGruppe).toContainText('Leitentscheide30')
    await expect(bgeGruppe).not.toContainText('von 30')
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

  // ── V3 (W2·10-UI-NAV): Kurztext-Popover am Entscheid-Chip ──────────────────
  // Prüfsatz: der Bestandstext des Shards (`regesteKurz`) wird auf eine Geste
  // hin LESBAR (bisher nur `title`), trägt die beiden Wege «Öffnen»/«Daneben
  // öffnen», ist per Tastatur erreichbar und wieder schliessbar — und er hängt
  // NIE im Erst-Markup (§15).
  test('(d) V3: Chip zeigt den Kurztext auf Hover + Tastatur, Esc schliesst', async ({ page }) => {
    // Wie (a): die OR-Seite mit ~500 Artikeln + Shard-Resolve reisst auf dem
    // 2-vCPU-Runner das Default-Budget. Zeitbudget, keine Assertion (§6.3).
    test.slow()
    const fehler = fehlerSammeln(page)
    // ≥ lg, damit das Pane-Gating den «Daneben öffnen»-Weg überhaupt anbietet.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/OR')
    const art41 = page.locator('#art-41')
    await art41.scrollIntoViewIfNeeded()
    await expect(art41.locator('[data-bezuege-zeile]')).toBeVisible({ timeout: 30_000 })

    // Kein Popover, solange niemand etwas tut (§15: der Kasten ist lazy).
    await expect(page.locator('[data-regeste-popover]')).toHaveCount(0)

    const chip = art41.locator('[data-bezug-linie="bge"] a.lc-chip').first()
    await chip.hover()
    // Die Vorschau öffnet ABSICHTLICH erst nach ruhendem Zeiger (450 ms, damit ein
    // Vorbeifahren über eine 5-Chip-Linie nicht fünf Kästen aufreisst). Die Wartezeit
    // gehört darum zum Prüfsatz und wird ausgesessen, nicht wegdefiniert.
    await page.waitForTimeout(800)
    const popover = page.locator('[data-regeste-popover]')
    await expect(popover).toBeVisible({ timeout: 10_000 })
    // §8: der Block heisst «Kurztext», NICHT «Regeste» — der Shard führt das
    // unterscheidende Flag nicht mit (amtliche Regeste ODER amtlicher Betreff).
    await expect(popover).toContainText('Kurztext')
    await expect(popover.getByRole('link', { name: /Öffnen/ })).toBeVisible()
    // Der zugängliche Name der Split-Aktion IM Popover ist ihr sichtbarer Text
    // «Daneben öffnen» (der `title` ist nur Fallback) — anders als beim wortlosen
    // ⧉-Glyph an der Zelle, der sein `aria-label` braucht.
    await expect(popover.getByRole('button', { name: /Daneben öffnen/ })).toBeVisible()

    // B2 (§9-Bug-Check 4.8.2026): der Kasten ist KEIN modaler Dialog — er fängt
    // den Fokus nicht und liegt auf einer Hover-Fläche. Rolle `group` + benannter
    // Kasten; der Chip sagt über `aria-expanded`/`aria-controls`, dass und was er
    // aufgeklappt hat. `role="dialog"` wäre ein Versprechen (Fokus-Fang,
    // Hintergrund inert), das diese Fläche nicht einlöst.
    await expect(popover).toHaveAttribute('role', 'group')
    await expect(popover).not.toHaveAttribute('aria-modal', /.*/)
    await expect(chip).toHaveAttribute('aria-expanded', 'true')
    const kastenId = (await popover.getAttribute('id'))!
    expect(kastenId).toBeTruthy()
    await expect(chip).toHaveAttribute('aria-controls', kastenId)

    // Tastatur (WCAG 2.1.1): Fokus auf den Chip öffnet, ↓ setzt den Fokus in die
    // erste Aktion des portalierten Kastens, Esc schliesst wieder.
    await page.keyboard.press('Escape')
    await expect(popover).toHaveCount(0)
    // Geschlossen darf der Chip weder «offen» behaupten noch auf einen Kasten
    // zeigen, den es nicht gibt (baumelnde `aria-controls`-Referenz).
    await expect(chip).toHaveAttribute('aria-expanded', 'false')
    await expect(chip).not.toHaveAttribute('aria-controls', /.*/)

    await chip.focus()
    await expect(popover).toBeVisible({ timeout: 10_000 })
    await page.keyboard.press('ArrowDown')
    await expect(popover.getByRole('link', { name: /Öffnen/ })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(popover).toHaveCount(0)
    // B1 (§9-Bug-Check 4.8.2026): WCAG 2.4.3 — nach dem Schliessen darf der Fokus
    // NICHT auf <body> fallen. Er gehört zurück auf den Chip, von dem aus der
    // Kasten geöffnet wurde; sonst müsste eine Tastatur-Bedienung von vorn durch
    // die ganze 500-Artikel-Seite tabben.
    await expect(chip).toBeFocused()
    expect(fehler).toEqual([])
  })
})
