// ─── Fedlex · Achse 2: Anker-Token und URL-Bau ───
//
// Teil der Achsen-Aufteilung von src/lib/fedlex.ts (QS-CODE-SPLITS): dort steht
// nur noch die Fassade, die alles Bisherige unveraendert re-exportiert. Gerichtete
// Kette ohne Zyklus: tabelle ← url ← erkennung ← parser.

import { FEDLEX, type FedlexGesetz } from './tabelle';

// Anker '#art_<nummer>'. Buchstaben-Artikel nutzen das Fedlex-Unterstrich-
// Format: 335c → #art_335_c, 334bis → #art_334_bis (empirisch gegen die
// id="art_…"-Anker des konsolidierten Filestore-HTML, Stand 20250101,
// verifiziert – Varianten ohne Unterstrich existieren dort NICHT).
// Spannen-/Folgeverweise (–, f., ff.) verlinken den führenden Artikel.
// Audit 5.6.2026: auch Kombi-Anker Buchstabe+lat. Suffix abgedeckt —
// im OR real: 329gbis/663bbis/697hbis → art_329_g_bis (Form n_b_suffix).
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies|sexies)?$/;

// Artikelnummer → Fedlex-Anker-Token («335c»→«335_c», «334bis»→«334_bis»,
// «49abis»→«49_a_bis», «329gbis»→«329_g_bis»). EINE Ableitung (§5), von fedlexUrl
// UND der Fremdgesetz-Aufzählungs-Verlinkung (fremdRoutingFormB) genutzt — die
// Buchstabe+«bis»-Zerlegung wird nicht dupliziert (die bekannte \b-Backtracking-
// Falle «[a-z]? frisst das b von bis» ist hier über die SUFFIX-Alternation gebannt).
export function artikelToken(nummer: string | number): string {
  return String(nummer).toLowerCase().replace(/\s+/g, '')
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
}

export function fedlexUrl(gesetz: FedlexGesetz, artikel: string | number): string {
  return `${FEDLEX[gesetz]}#art_${artikelToken(artikel)}`;
}
