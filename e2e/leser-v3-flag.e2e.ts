// @shard-gruppe: 6
// FAHRPLAN-LESER-V3, Vorprobe V-2 · Regeln FL-1 und FL-3.
//
// WOZU DIESE DATEI: Das Playwright-Projekt `leser-v3` fährt die zehn N-Specs
// mit gesetztem Flag. Greift die Aktivierung NICHT (falscher Origin im
// `storageState`, umbenannter Schlüssel, Fassade liest nicht mehr), dann läuft
// das Projekt still gegen V1 und ist grün, ohne irgendetwas zu prüfen — ein
// Tor, das nicht scheitern kann (§6.7). Genau das schliessen die Tests hier
// aus: sie sehen den V3-Marker POSITIV, statt ihn vorauszusetzen.
//
// Die Datei läuft in beiden Projekten (sie steht in `N_SPECS`), weil die
// Aussage in beiden Richtungen zu prüfen ist: `chromium` beweist den
// Grundzustand AUS (R10), `leser-v3` beweist, dass das Flag ankommt.
import { test, expect, type Page } from '@playwright/test'

const MARKER = '[data-leser-v3="rahmen"]'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// ── FL-3: der Grundzustand und die beiden Query-Zweige ───────────────────────

test('FL-3: das Projekt entscheidet den Grundzustand — ohne Flag kein V3-Rahmen', async ({ page }, info) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  if (info.project.name === 'leser-v3') {
    // Der `storageState` des Flag-Projekts hat `lm.leser.v3` gesetzt.
    await expect(page.locator(MARKER)).toBeVisible()
  } else {
    // R10 «Das Flag leckt»: ohne ausdrückliche Anforderung sieht der Besucher
    // exakt den Ist-Stand. Nicht bloss unsichtbar — gar nicht im DOM.
    await expect(page.locator(MARKER)).toHaveCount(0)
  }
  expect(fehler).toEqual([])
})

test('FL-3: ?leser=v3 schaltet an und merkt es sich, ?leser=v1 löscht es wieder', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  const marker = page.locator(MARKER)

  // Anschalten über den Query-Parameter — wirkt sofort, ohne Reload.
  await page.goto('/gesetze/bund/ZGB?leser=v3')
  await expect(marker).toBeVisible({ timeout: 20_000 })

  // Gemerkt: die nächste Adresse OHNE Parameter bleibt in V3.
  await page.goto('/gesetze/bund/ZGB')
  await expect(marker).toBeVisible({ timeout: 20_000 })

  // Ausschalten — und zwar dauerhaft, nicht nur für diesen einen Aufruf.
  await page.goto('/gesetze/bund/ZGB?leser=v1')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(marker).toHaveCount(0)

  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(marker).toHaveCount(0)

  expect(fehler).toEqual([])
})

// ── FL-1: EIN Schaltpunkt für Einzelansicht UND Pane ─────────────────────────
//
// Das ist die eigentliche Behauptung der Vorprobe. `Pane.tsx` schickt das
// sekundäre Pane durch denselben `RouteSwitch` und damit durch dieselbe
// Fassade — also muss ein im Hauptfenster gesetztes Flag ohne jedes weitere
// Zutun auch im Pane wirken. Wäre das falsch, bräuchte jede Etappe eine
// zweite Umschalt-Stelle, und der Grundentscheid (B-hybrid) fiele.
//
// Weg: Entscheid → Norm-Link → «nebeneinander öffnen» (Idiom aus
// leser-position-u.e2e.ts A17). Das Hauptfenster zeigt dabei einen Entscheid,
// das Pane ein Gesetz — der Marker darf deshalb NUR im Pane stehen. Das prüft
// nebenbei, dass der Rahmen nicht global über die App leckt.
test('FL-1: dasselbe Flag schaltet das sekundäre Pane mit — ohne zweite Umschalt-Stelle', async ({ page }) => {
  test.slow() // schwere Split-View-Interaktion (Präzedenz A17)
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })

  // Flag EINMAL im Hauptfenster setzen …
  await page.goto('/gesetze/bund/ZGB?leser=v3')
  await expect(page.locator(MARKER)).toBeVisible({ timeout: 20_000 })

  // … dann zu einem Entscheid wechseln (kein Gesetz-Leser ⇒ kein Marker) …
  await page.goto('/rechtsprechung/bge_152_V_52')
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible({ timeout: 20_000 })
  await expect(page.locator(MARKER)).toHaveCount(0)

  // … und das Gesetz daneben aufschlagen.
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /nebeneinander öffnen/ }).click()

  const pane = page.locator('[data-pane="sekundaer"]')
  await expect(pane).toBeVisible({ timeout: 10_000 })
  // Der Kern: das Pane steht in V3, obwohl niemand das Pane umgeschaltet hat.
  await expect(pane.locator(MARKER)).toBeVisible({ timeout: 20_000 })
  // Und der Normtext im Pane ist trotzdem da (der Rahmen verdrängt ihn nicht).
  await expect(pane.locator('#art-18')).toBeVisible({ timeout: 20_000 })

  expect(fehler).toEqual([])
})
