/**
 * kanton-abk-regeln — der reine Regel-Kern der Kanton-Kürzel-Aliase (R2–R7),
 * seiteneffektfrei importierbar (R8.3: kanton-abk-aliase-generieren.ts führt
 * beim Import ausserhalb von vitest main() aus; der Rohfeld-Runner braucht die
 * Regeln aber für die Kandidaten-Auswahl von --netz-ambig, und die Tests der
 * Gefahren-Klassen importieren sie direkt). Regel-DOKU: Kopf des Generators.
 *
 * R1 (Titel-Kopie) ist mit dem Wurzel-Fix F8 GESTORBEN (Rückbau, §17-Gegen-
 * gewicht): die Quelle ist seit R8.3 das ROHE Registerfeld `abkRoh` — eine
 * Titel-Kopie kann gar nicht mehr eintreten, weil ein leeres abbreviation-Feld
 * als leeres Rohfeld ankommt («leer ⇒ kein Alias», gezählt als
 * 'kein-amtliches-kuerzel') statt als zurückgeratener Titel.
 */

import { istKuerzelFragment } from './browse-manifest.ts';

/** Warum ein Kandidat KEIN Alias wurde — für Statistik und Tests. */
export type AusschlussGrund =
  | 'kein-amtliches-kuerzel'
  | 'zu-lang'
  | 'kleinwoerter'
  | 'zu-kurz'
  | 'klammer'
  | 'kantonskuerzel';

/** R3-Grenze: längstes echtes Mehrwort-Kürzel des Bestands, s. Generator-Kopf. */
export const MAX_LAENGE = 30;

/** R7: die 26 Kantonskürzel (geschlossene Liste; Kopie-Disziplin wie
 *  src/lib/permalink.ts — der Test hält eine GEGENkopie, kein Selbstbeweis). */
export const KANTONSKUERZEL = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);

const KLEINWORT = /^[a-zäöüéèàçâêîôû]/;

/**
 * Der Regel-Kern: EIN roher abbreviation-Wert → Alias oder Ausschluss.
 * Reine Funktion (§2). Leerer Rohwert = die Quelle führt kein amtliches
 * Kürzel (fail-closed, F8).
 */
export function aliasAusRoh(
  roh: string,
): { abk: string } | { abk: null; grund: AusschlussGrund } {
  let wert = roh.trim();
  if (!wert) return { abk: null, grund: 'kein-amtliches-kuerzel' };
  // R2: «Langform; Kürzel» (AR-Konvention) bzw. «Langform, Kürzel» (BS/BE-
  // Konvention, live belegt 1.9.2026 am ROHEN abbreviation-Feld: BS-154.100
  // «Gerichtsorganisationsgesetz, GOG», BE-168.811 «Parteikostenverordnung,
  // PKV», BS-415.150 «… Jugendkommissionsverordnung , KJKV» — je
  // https://<host>/api/de/texts_of_law/<nr>) → Kürzel-Hälfte DESSELBEN
  // amtlichen Werts, keine Erfindung. Semikolon vor Komma; letzter Separator.
  // Komma-Tail zusätzlich fragment-bewacht (T2/S2-Wächter): ein Titel-Wert
  // mit Binnenkomma («Gesetz über X, Y und Z») darf nicht zum Fragment-Alias
  // «Y und Z» splitten — dann bleibt der Vollwert stehen und fällt an R3/R4.
  if (wert.includes(';')) {
    const tail = wert.split(';').pop()!.trim();
    if (tail) wert = tail;
  } else if (wert.includes(',')) {
    const tail = wert.split(',').pop()!.trim();
    if (tail && !istKuerzelFragment(tail)) wert = tail;
  }
  if (wert.length > MAX_LAENGE) return { abk: null, grund: 'zu-lang' };
  const kleine = wert.split(/\s+/).filter((w) => KLEINWORT.test(w));
  if (kleine.length >= 2) return { abk: null, grund: 'kleinwoerter' };
  if (wert.length < 2) return { abk: null, grund: 'zu-kurz' };
  // R6/R7 zuletzt (Statistik = artefakt-relevante Ausschlüsse, s. Generator-Kopf):
  if (wert.includes('(') || wert.includes(')')) return { abk: null, grund: 'klammer' };
  if (KANTONSKUERZEL.has(wert.toUpperCase())) return { abk: null, grund: 'kantonskuerzel' };
  return { abk: wert };
}
