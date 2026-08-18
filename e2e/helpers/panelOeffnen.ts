// e2e/helpers/panelOeffnen.ts — die EINE Geste «Panel aufziehen» (§5, H3-Nachzug).
//
// ── Warum diese Datei existiert ───────────────────────────────────────────────
// Seit dem H3-Nachzug (Ä53/Ä56) hat das Rechtsprechungs-Panel je Zuschnitt GENAU
// EINEN sichtbaren Öffner, und es ist nicht überall derselbe:
//
//   Zuschnitt              Öffner
//   ────────────────────────────────────────────────────────────────────────────
//   voll / kompakt         Zähler «⚖ 14 Entscheide» (`[data-v3-panel-zaehler]`)
//   mini (H, schmales Pane) derselbe Zähler als Chip «⚖ 14» (H4-II, s. u.)
//   überall                das Menü zusätzlich — der F8-Weg, wenn der Zähler weg ist
//
// ── H4-II (17./18.8.2026) ────────────────────────────────────────────────────
// Die Zeile für `mini` hiess bis dahin «Eintrag im ···-Menü», und genau das war
// der NM-2-Befund des Kontaktbogens H4: @390 stand im Ruhezustand KEIN Öffner in
// der Kopfzeile, der Weg zu den Entscheiden kostete zwei Taps statt einem.
// Seither trägt auch `mini` den Zähler — als Chip ohne Zähl-Substantiv, damit
// die Zeile bei vier Elementen bleibt (`v3/kopfStufen.kopfElemente(…).panel`).
// DIE FUNKTION UNTEN BLEIBT UNVERÄNDERT: ihr Menü-Zweig ist weiterhin nötig,
// denn mit «Rechtsprechung im Text: aus» (F8) gibt es auf JEDEM Zuschnitt keinen
// Zähler — dann ist das Menü der Weg.
//
// Bis zum Nachzug klickte jede Spec ihre eigene Variante
// (`[data-v3-panel-lasche], [data-v3-panel-zaehler]`). Die Randlasche ist
// gestrichen; ohne diesen Helfer stünde die Zuschnitt-Regel in fünf Specs, und
// die nächste Öffner-Änderung müsste in fünf Dateien nachgezogen werden — genau
// die §5-Verletzung, die `helpers/budgets.ts` für die A9-Zahlen behoben hat.
//
// Die Funktion prüft KEINE Zusage — sie bedient. Was am Öffner stehen muss (Zahl,
// `aria-expanded`, `aria-controls`) und WELCHER Öffner auf welchem Zuschnitt
// existieren darf, prüfen `leser-v3-panel-zaehler` und `leser-v3-panel-nachzug`.

import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Zieht das Panel im gegebenen Bereich auf und wartet, bis die Fläche steht.
 *
 * @param bereich Wurzel des zu bedienenden Lesers — in der Einzelansicht `page`,
 *   im Split das jeweilige `[data-pane="…"]`. Das PANEL selbst liegt per Portal
 *   ausserhalb des Panes (H2-Befund) und wird darum immer an `page` erwartet.
 */
export async function panelAufziehen(page: Page, bereich: Page | Locator = page): Promise<void> {
  const zaehler = bereich.locator('[data-v3-panel-zaehler]')
  if (await zaehler.count() > 0) {
    await zaehler.first().click()
  } else {
    // Der Weg, den es auf JEDEM Zuschnitt gibt: «Ansicht ▾» bzw. «···».
    await bereich.locator('[data-v3-ansicht]').first().click()
    await bereich.locator('[data-v3-ansicht-panel-auf]').first().click()
  }
  await expect(page.locator('[data-v3-panel]').first()).toBeVisible({ timeout: 20_000 })
}
