import { expect, type Page } from '@playwright/test'

// ── DIE KOPF-SUCHE AUFMACHEN, AUF JEDER BREITE ───────────────────────────────
// Entscheid David 29.8.2026 (Design-Review C1/B10/L3): unter 480 px ist die
// globale Suche im Ruhezustand eine 44-px-Lupe, nicht ein 28-px-Rahmen. Das
// FELD steht dort erst im geöffneten Zustand im Streifen — `max-[480px]:hidden`
// in `HeaderSuche.tsx`. Damit hat der Weg zum Feld eine Breiten-Fallunter-
// scheidung bekommen, und die hat genau EINE Stelle (§5):
//
//   < 480 px  Lupe antippen  → Fokusmodus → Feld über die volle Streifenbreite
//   ≥ 480 px  Feld antippen  → unverändert wie seit S6
//
// Der Helfer prüft NICHTS weg: er stellt nur die Vorbedingung her, auf der die
// aufrufenden Wächter ihre eigene Zusage messen, und besteht dabei darauf, dass
// das Feld danach WIRKLICH den Fokus trägt. Eine tote Lupe (Knopf da, Feld ohne
// Fokus) lässt ihn scheitern — nicht erst die Assertion des Aufrufers.
export const kopfSuchFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })

const kopfLupe = (page: Page) => page.locator('header.sticky [data-suche-lupe]')

/**
 * Öffnet die globale Kopf-Suche breitenunabhängig und gibt das fokussierte Feld
 * zurück. Wartet zuvor darauf, dass der Streifen hydriert ist (genau eines von
 * Lupe/Feld ist sichtbar) — sonst liefe der Aufruf in das bekannte Rennen
 * «Klick vor Hydration».
 */
export async function kopfSucheOeffnen(page: Page, timeout = 20_000) {
  const feld = kopfSuchFeld(page)
  const lupe = kopfLupe(page)
  await expect
    .poll(async () => ((await lupe.isVisible()) ? 'lupe' : (await feld.isVisible()) ? 'feld' : 'nichts'), { timeout })
    .not.toBe('nichts')
  if (await lupe.isVisible()) await lupe.click()
  else await feld.click()
  await expect(feld).toBeFocused({ timeout: 10_000 })
  return feld
}
