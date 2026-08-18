// @shard-gruppe: 6
// FAHRPLAN-LESER-V3, Vorprobe V-2 · Regeln FL-1 und FL-3.
//
// WOZU DIESE DATEI: Zwei Playwright-Projekte fahren dieselben N-Specs gegen
// zwei Hüllen — `chromium` gegen den Grundzustand (seit dem H4-Flip: V3) und
// `leser-v1` gegen den Rückweg. Greift die Umschaltung NICHT (falscher Origin
// im `storageState`, umbenannter Schlüssel, Fassade liest nicht mehr), dann
// läuft ein Projekt still gegen dieselbe Hülle wie das andere und ist grün,
// ohne irgendetwas zu prüfen — ein Tor, das nicht scheitern kann (§6.7). Genau
// das schliessen die Tests hier aus: sie sehen die Hülle POSITIV, in beide
// Richtungen, statt sie vorauszusetzen.
//
// H4-FLIP (David-Ja 17.8.2026, «ja und c, mach so»). Bis H4 hiess die Aussage
// «ohne Flag kein V3-Rahmen» (R10, Grundzustand AUS). Sie ist mit dem Flip
// falsch geworden und darum hier ehrlich gespiegelt — deklarierte fachliche
// Änderung (§6.3). Was NICHT gespiegelt wurde, wäre wertlos: eine Sonde, die
// nach dem Flip den Default gegen den Default prüft, ist immer grün. Jeder Test
// unten führt darum VOM Default WEG, bevor er etwas behauptet.
import { test, expect, type Page } from '@playwright/test'

/** Der Rahmen der neuen Hülle — existiert nur in V3. */
const MARKER = '[data-leser-v3="rahmen"]'
/** Der Ansicht-Öffner der ALTEN Hülle — existiert nur in V1
 *  (`LeserAnsichtMenu.tsx`; V3 trägt `[data-v3-ansicht]`, s.
 *  `e2e/helpers/leserBereit.ts`). Positiv-Beweis statt blosser Abwesenheit. */
const MARKER_V1 = '[data-ansicht-menu]'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// ── FL-3: der Grundzustand und die beiden Query-Zweige ───────────────────────

test('FL-3: das Projekt entscheidet die Hülle — Grundzustand V3, Rückweg V1', async ({ page }, info) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  if (info.project.name === 'leser-v1') {
    // Der `storageState` des Rückweg-Projekts hat `lm.leser.v1` gesetzt. Die
    // alte Hülle muss POSITIV da sein — bloss «kein V3-Rahmen» wäre auch dann
    // grün, wenn der Leser gar nicht übernommen hätte.
    await expect(page.locator(MARKER_V1).first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator(MARKER)).toHaveCount(0)
  } else {
    // Seit H4: ohne jede Anforderung sieht der Besucher den neuen Leser — und
    // von der alten Hülle steht nichts mehr im DOM.
    await expect(page.locator(MARKER)).toBeVisible({ timeout: 20_000 })
    await expect(page.locator(MARKER_V1)).toHaveCount(0)
  }
  expect(fehler).toEqual([])
})

test('FL-3: ?leser=v1 schaltet zurück und merkt es sich, ?leser=v3 löscht es wieder', async ({ page }) => {
  // Vier volle ZGB-Navigationen (607 KB Erlass) in EINEM Test — die Datei misst
  // seriell 33.9 s und reisst damit STRUKTURELL am 30-s-Default, nicht wegen
  // eines Defekts. Gemessen 16.8.2026; unter Last fiel FL-3 stets mit
  // `Test timeout ... exceeded` bzw. `net::ERR_ABORTED`, NIE mit einer
  // Assertion. Dasselbe Zeitbudget wie FL-1 zwei Tests weiter unten
  // (Präzedenz A17) — reine Infrastruktur, kein `expect` und kein Prüfschritt
  // berührt (§6.3).
  //
  // REIHENFOLGE NACH DEM FLIP: erst weg vom Default, dann zurück. Umgekehrt
  // wäre der erste Schritt («?leser=v3 zeigt V3») auch ohne jede Merkung grün.
  test.slow()
  const fehler = fehlerSammeln(page)
  const marker = page.locator(MARKER)

  // Rückweg anschalten — wirkt sofort, ohne Reload.
  await page.goto('/gesetze/bund/ZGB?leser=v1')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(marker).toHaveCount(0)

  // Gemerkt: die nächste Adresse OHNE Parameter bleibt in der alten Hülle.
  // Das ist der eigentliche Persistenz-Beweis — ohne Merkung stünde hier V3.
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await expect(marker).toHaveCount(0)

  // Zurück auf den Standard — und zwar dauerhaft, nicht nur für diesen Aufruf.
  await page.goto('/gesetze/bund/ZGB?leser=v3')
  await expect(marker).toBeVisible({ timeout: 20_000 })

  // Der Gegenbeweis zur Zeile davor: wäre die Merkung NICHT gelöscht worden,
  // stünde hier wieder V1.
  await page.goto('/gesetze/bund/ZGB')
  await expect(marker).toBeVisible({ timeout: 20_000 })

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
// NACH DEM FLIP fährt der Test den RÜCKWEG `?leser=v1`: die Behauptung ist
// dieselbe, aber nur diese Richtung kann sie noch beweisen — ein Pane, das V3
// zeigt, weil V3 ohnehin der Default ist, beweist über die Weitergabe des Flags
// gar nichts (§6.7).
//
// Weg: Entscheid → Norm-Link → «nebeneinander öffnen» (Idiom aus
// leser-position-u.e2e.ts A17). Das Hauptfenster zeigt dabei einen Entscheid,
// das Pane ein Gesetz — die Hüllen-Marken dürfen deshalb NUR im Pane stehen.
// Das prüft nebenbei, dass keine der beiden Hüllen über die App leckt.
test('FL-1: dasselbe Flag schaltet das sekundäre Pane mit — ohne zweite Umschalt-Stelle', async ({ page }) => {
  test.slow() // schwere Split-View-Interaktion (Präzedenz A17)
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })

  // Flag EINMAL im Hauptfenster setzen — und zwar weg vom Default …
  await page.goto('/gesetze/bund/ZGB?leser=v1')
  await expect(page.locator(MARKER_V1).first()).toBeVisible({ timeout: 20_000 })
  await expect(page.locator(MARKER)).toHaveCount(0)

  // … dann zu einem Entscheid wechseln (kein Gesetz-Leser ⇒ keine Hüllen-Marke) …
  await page.goto('/rechtsprechung/bge_152_V_52')
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible({ timeout: 20_000 })
  await expect(page.locator(MARKER)).toHaveCount(0)
  await expect(page.locator(MARKER_V1)).toHaveCount(0)

  // … und das Gesetz daneben aufschlagen.
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /nebeneinander öffnen/ }).click()

  const pane = page.locator('[data-pane="sekundaer"]')
  await expect(pane).toBeVisible({ timeout: 10_000 })
  // Der Kern: das Pane steht in der ALTEN Hülle, obwohl niemand das Pane
  // umgeschaltet hat — und nicht im Default, in dem es ohne Weitergabe stünde.
  await expect(pane.locator(MARKER_V1).first()).toBeVisible({ timeout: 20_000 })
  await expect(pane.locator(MARKER)).toHaveCount(0)
  // Und der Normtext im Pane ist trotzdem da (die Hülle verdrängt ihn nicht).
  await expect(pane.locator('#art-18')).toBeVisible({ timeout: 20_000 })

  expect(fehler).toEqual([])
})
