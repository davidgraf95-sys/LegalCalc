// @shard-gruppe: 2
// FAHRPLAN-LESER-V3, Etappe H1 — die zentrale H1-Zusicherung (siehe
// LeserKopf.tsx-Kopf): «EIN VERTRAG FÜR DREI BREITEN» — dieselbe Komponente,
// dieselben Bedienelemente in der Einzelansicht, im primären UND im
// sekundären Pane. `LeserKopf` kennt keine `imPane`-Verzweigung; wäre das
// falsch, bräuchte jede Etappe eine zweite Umschalt-Stelle (Kap. 10, Ziel
// «Kopf-/Layout-Verzweigungen 21 → 0»).
//
// WEG ZUM SPLIT-VIEW: das A16-Idiom aus `leser-position-u.e2e.ts` (AIG Art. 5
// → Fremdverweis-Popover → StGB) — hier NICHT «Im Gesetz öffnen» (echte
// Navigation), sondern «nebeneinander öffnen» (NormPopover.tsx), damit das
// Hauptfenster ein GESETZ bleibt (AIG in V3) und das Pane ein zweites Gesetz
// (StGB in V3) daneben aufschlägt — beide zugleich in V3, weil FL-1 dasselbe
// Flag ohne zweite Umschalt-Stelle in beide Panes trägt.
//
// GEPRÜFT WIRD DAS ELEMENT-INVENTAR, NICHT PIXEL: beide `[data-v3-kopf]`
// tragen Kürzel, Ansicht-Öffner und den Rücksprung zur Übersicht — unabhängig
// von der (unterschiedlichen) gemessenen Breite jedes Panes
// (`kopfElemente(stufe)` lässt nur Volltitel fallen, nie diese drei, und die
// Krume schrumpft, statt zu verschwinden — `./kopfStufen.ts`).
//
// ── Ä46 (H4-II, 17./18.8.2026) · DER RÜCKSPRUNG STATT DES ✕ ────────────────
// Bis hierher stand in dieser Liste das ✕ des V3-Kopfes. Gemessen im Split
// @1600 trug jedes Pane damit ZWEI sichtbare ✕, 44 px übereinander: die
// Pane-Griffleiste («Hauptfenster schliessen» / «‹BGFA› schliessen», y = 69)
// und dieser Kopf («Gesetz schliessen — zur Gesetzesübersicht», y = 113).
// Gleiches Zeichen, gleiche Ecke, verschiedene Wirkung, unterscheidbar allein
// am Accessible Name — genau der Befund Ä46.
// DIE PARITÄTS-AUSSAGE IST UNVERÄNDERT (§6.3): geprüft wird weiter, dass beide
// Panes DENSELBEN Kopf mit DENSELBEN Bedienelementen tragen. Nur trägt die
// Rücksprung-Handlung im Pane jetzt ihren Namen («‹ Gesetze») statt ein zweites
// Mal dasselbe Zeichen; das Ziel `/gesetze` und die pane-lokale Auflösung sind
// dieselben. Dass je Pane genau EIN ✕ übrig ist, misst
// `leser-v3-h4-kopfwege` (b).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test('H1 — beide Split-View-Panes tragen denselben V3-Kopf (Kürzel, Ansicht-Öffner, Rücksprung)', async ({ page }) => {
  test.slow() // schwere Split-View-Interaktion (Präzedenz A17/FL-1)
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })

  // Hauptfenster: AIG in V3, an Art. 5 (derselbe Anker-Pfad wie A16).
  await page.goto('/gesetze/bund/AIG?leser=v3')
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  const art5 = page.locator('#art-5')
  await expect(art5).toBeAttached({ timeout: 20_000 })
  await art5.scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)

  // Fremdverweis (StGB) öffnen → Popover mit «nebeneinander öffnen» (NICHT
  // «Im Gesetz öffnen» — das wäre echte Navigation und liesse kein Pane
  // entstehen).
  const stgbLink = art5.locator('a[href*="54/757_781_799"][href*="#art_66_a"]:not([href*="66_a_bis"])').first()
  await expect(stgbLink).toBeVisible({ timeout: 10_000 })
  await stgbLink.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /nebeneinander öffnen/ }).click()

  const pane = page.locator('[data-pane="sekundaer"]')
  await expect(pane).toBeVisible({ timeout: 10_000 })
  await expect(pane.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(pane.locator('#art-66_a')).toBeAttached({ timeout: 20_000 })

  // Primäres Fenster steht jetzt ebenfalls unter `data-pane="primaer"`
  // (Shell.tsx setzt das Attribut erst, sobald ein zweites Pane offen ist).
  const primaer = page.locator('[data-pane="primaer"]')
  await expect(primaer).toBeVisible({ timeout: 10_000 })
  await expect(primaer.locator('[data-v3-kopf]')).toBeVisible()
  await expect(pane.locator('[data-v3-kopf]')).toBeVisible()

  // Das Element-Inventar: Kürzel · Ansicht-Öffner · Rücksprung — in BEIDEN Panes.
  for (const wurzel of [primaer, pane]) {
    const kopf = wurzel.locator('[data-v3-kopf]')
    await expect(kopf.locator('[data-v3-kopf-kuerzel]')).toBeVisible()
    await expect(kopf.locator('[data-v3-ansicht]')).toBeVisible()
    // Ä46: der Weg zurück zur Übersicht, benannt statt als zweites ✕. Beide
    // Panes liegen unter 900 px Elementbreite, tragen also die kurze Form.
    const zurueck = kopf.locator('[data-v3-kopf-krume-kurz]')
    await expect(zurueck).toBeVisible()
    await expect(zurueck).toHaveAttribute('href', '/gesetze')
    // Und der V3-Kopf trägt hier kein ✕ mehr — sonst stünden wieder zwei.
    await expect(kopf.locator('[data-v3-kopf-schliessen]')).toHaveCount(0)
  }
  // Und die Kürzel unterscheiden sich inhaltlich (zwei verschiedene Gesetze,
  // keine zufällige Doppelung, die den Vergleich entwerten würde).
  const kuerzelPrimaer = (await primaer.locator('[data-v3-kopf-kuerzel]').textContent())?.trim()
  const kuerzelPane = (await pane.locator('[data-v3-kopf-kuerzel]').textContent())?.trim()
  expect(kuerzelPrimaer).toBe('AIG')
  expect(kuerzelPane).toBe('StGB')

  expect(fehler).toEqual([])
})
