// IA-3 · A–Z-/Kürzel-Register (FAHRPLAN-GESETZES-UX §11.5): reine, testbare
// Gruppier-/Filter-Helfer für den Browse-Zwilling auf /gesetze (Muster M6
// gesetze-im-internet). Darstellungsschicht-Ableitung (§3) — KEINE Rechtslogik,
// KEIN zweiter Suchindex (K10): alles rechnet auf dem bereits client-geladenen
// register.json-Manifest (BrowseErlass[]).
//
// Einsortierung (deterministisch, dokumentiert — §8 «nie raten»):
//   1. Anfangsklasse = erstes Zeichen des TITELS (title-only; H1: der Nutzer
//      kennt das Kürzel nicht), führender Leerraum ignoriert.
//   2. Diakritika werden gefaltet (NFD, Combining Marks entfernt): Ä→A, Ö→O,
//      Ü→U, É→E, À→A — DIN-5007-1-Praxis, wie das Vorbild gesetze-im-internet
//      («Übereinkommen» steht unter U). Kleinbuchstaben werden gehoben
//      (eGovG → E, kant. BBV → K).
//   3. Alles, was danach kein A–Z ist (führende Ziffern, «§», Anführungszeichen),
//      fällt in GENAU EINE Sammelklasse ZIFFERN_KLASSE («0–9»), die am ENDE der
//      Buchstaben-Leiste steht (heute leer — Regel steht trotzdem fest, §11.0
//      Skalierungs-Invariante: neue Erlasse kippen nur Werte, keine Struktur).
//   4. Innerhalb einer Klasse: de-CH-Kollation über den Titel (numeric, damit
//      «2.» vor «10.» steht), Tie-Break über den stabilen key.

import type { BrowseErlass } from '../../lib/normtext/browse-typen';

/** Sammelklasse für Titel, die nicht mit A–Z beginnen (Ziffern, «§», …). */
export const ZIFFERN_KLASSE = '0–9';

/** Alle Klassen der Buchstaben-Leiste: A–Z, dann die Ziffern-Sammelklasse. */
export const AZ_KLASSEN: readonly string[] = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ZIFFERN_KLASSE,
];

/** Faltet Diakritika (NFD → Combining Marks entfernen) und hebt in Grossbuchstaben. */
function falte(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

/** Anfangsklasse eines Titels nach den oben dokumentierten Regeln 1–3. */
export function anfangsklasse(titel: string): string {
  const erst = falte(titel.trimStart().charAt(0));
  return /^[A-Z]$/.test(erst) ? erst : ZIFFERN_KLASSE;
}

// EINE Kollation für alle Gruppen (numeric: «2.» < «10.»; de-CH wie die
// übrigen Übersichts-Sortierungen).
const kollation = new Intl.Collator('de-CH', { numeric: true, sensitivity: 'base' });

/** Gruppiert Erlasse nach Anfangsklasse; jede Gruppe de-CH-sortiert (Regel 4).
 *  Vollständig: jeder Erlass liegt in genau einer Klasse. */
export function gruppiereAZ(erlasse: BrowseErlass[]): Map<string, BrowseErlass[]> {
  const m = new Map<string, BrowseErlass[]>();
  for (const e of erlasse) {
    const k = anfangsklasse(e.titel);
    const liste = m.get(k);
    if (liste) liste.push(e);
    else m.set(k, [e]);
  }
  for (const liste of m.values()) {
    liste.sort((a, b) => kollation.compare(a.titel, b.titel) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  }
  return m;
}

/** Title-only-Filter (Titel + Kürzel, diakritika- und case-gefaltet beidseitig).
 *  Bewusst KEIN SR-/Kanton-Match — das ist der bestehende Übersichts-Filter
 *  (browse.ts filtern); hier nur der Register-Zwilling (K10, kein Duplikat).
 *  Leerer Term → leere Liste (die Buchstaben-Sicht trägt dann die Anzeige). */
export function filterTitelKuerzel(erlasse: BrowseErlass[], term: string): BrowseErlass[] {
  const s = falte(term.trim());
  if (!s) return [];
  return erlasse
    .filter((e) => falte(e.titel).includes(s) || falte(e.kuerzel).includes(s))
    .sort((a, b) => kollation.compare(a.titel, b.titel) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** Ebenen-Label eines Registereintrags — dieselbe Säulen-Logik wie Gesetze.tsx
 *  (International = ebene 'bund' + rechtsgebiet 'international'). */
export function ebeneLabel(e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'>): string {
  if (e.ebene === 'kanton') return `Kanton ${e.kanton ?? '?'}`;
  return e.rechtsgebiet === 'international' ? 'International' : 'Bund';
}
