import type { Page } from '@playwright/test'

/**
 * Sammelt Konsolen-Fehler und ungefangene Laufzeitfehler der Seite.
 *
 * ANLASS DER ZUSAMMENFÜHRUNG (Ent-Regulierung Runde 2 / Batch A, 31.8.2026):
 * diese sechs Zeilen standen **67-mal** wörtlich in `e2e/*.e2e.ts` — in fünf
 * Fassungen, die sich ausschliesslich in Zeilenumbruch, Semikolon und dem Namen
 * des Callback-Parameters unterschieden (66× semantisch zeichengleich, 1×
 * abweichend nur im TEXT der Fehlermeldung, siehe unten). Das ist die
 * Boilerplate-Klasse, die §5 meint: derselbe Fachinhalt an 67 Stellen gepflegt.
 * Wer die Sammlung erweitern will (etwa um `requestfailed`), musste bisher 67
 * Dateien anfassen — praktisch also: keiner.
 *
 * VERWENDUNG. Vor der Navigation aufrufen, am Ende des Falls prüfen:
 *
 *     const fehler = fehlerSammeln(page)
 *     …
 *     expect(fehler, fehler.join('\n')).toEqual([])
 *
 * Der Aufruf muss VOR `page.goto()` stehen — die Listener fangen nur, was nach
 * ihrer Anmeldung passiert.
 *
 * EINE ABWEICHUNG IST DEKLARIERT (§6.3): `leser-kopf-a9.e2e.ts` trug als einzige
 * Datei eine Fassung ohne die Präfixe («pageerror: …» / «console.error: …») und
 * mit `String(e)` statt `e.message`. Sie ist hier aufgegangen. Geändert hat sich
 * dadurch allein der WORTLAUT der Fehlermeldung im Rot-Fall; die geprüfte
 * Bedingung ist in allen 67 Fällen dieselbe und unverändert — die gesammelte
 * Liste muss leer sein, und leer bleibt leer.
 */
export function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}
