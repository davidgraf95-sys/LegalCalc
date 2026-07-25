// IA-4 · Scope-Chip lokale Suche (FAHRPLAN-GESETZES-UX §11.5, O5-Rest): reine,
// testbare Scope-Helfer für das lokale Browse-Filterfeld der Gesetzes-Übersicht
// (Gesetze.tsx). Darstellungsschicht-Ableitung (§3) — KEINE Rechtslogik.
//
// Regeln (deterministisch, dokumentiert — §8 «nie raten»):
//   1. Default-Scope = aktive Ebene: gewählte Säule (Bund/Kantone/International)
//      bzw. der gewählte Kanton (?kt=XX, N6-Muster). Ohne Säulen-Wahl
//      (Landeplatz, Rechtsgebiets-Sicht) ist der Scope «alle Ebenen».
//   2. Der Chip «auf alle Ebenen erweitern» (client-only State) weitet JEDEN
//      engen Scope mit EINEM Klick auf alle Ebenen — er ändert nur die
//      BASIS-Menge des bestehenden Filters, nie den Suchweg: KEIN dritter
//      Suchpfad (O5/A5), KEIN zweiter Index (K10 — alles rechnet auf dem
//      bereits geladenen register.json-Manifest).
//   3. Säulen-Logik identisch zu Gesetze.tsx (§5, eine Wahrheit):
//      International = ebene 'bund' + rechtsgebiet 'international'; «Bund»
//      schliesst diese aus. Vollständigkeit: Bund ∪ Kantone ∪ International
//      = alle (Test-verankert — nichts fällt still weg, §8).
//   4. Das Label sagt ehrlich, WAS durchsucht wird (§8) — es wird per
//      aria-describedby programmatisch mit dem Input verknüpft (a11y).

import type { BrowseErlass } from '../../lib/normtext/browse-typen';

/** Säulen der Übersicht — strukturell identisch zu `Ebene` in Gesetze.tsx. */
export type ScopeSaeule = 'bund' | 'kanton' | 'international';

/** Geschlossene Union: Erweiterungen sind Spec-Änderungen an §11.5, nie ad hoc. */
export type FilterScope =
  | { art: 'alle' }
  | { art: 'saeule'; saeule: ScopeSaeule }
  | { art: 'kanton'; kanton: string };

/** Löst den wirksamen Filter-Scope aus Säulen-Wahl, Kanton und Chip-Zustand. */
export function loeseFilterScope(
  gewaehlt: ScopeSaeule | null,
  kanton: string | null,
  alleEbenen: boolean,
): FilterScope {
  if (alleEbenen || gewaehlt === null) return { art: 'alle' };
  if (gewaehlt === 'kanton' && kanton) return { art: 'kanton', kanton };
  return { art: 'saeule', saeule: gewaehlt };
}

const SAEULE_LABEL: Record<ScopeSaeule, string> = {
  bund: 'Bund',
  kanton: 'Kantone',
  international: 'International',
};

/** Ehrliches Scope-Label («Filtert: …», §8); `kantonName` liefert den vollen
 *  Kantonsnamen (Fallback: Code — der Aufrufer reicht KANTON_NAMEN durch, §5). */
export function scopeLabel(scope: FilterScope, kantonName?: (k: string) => string): string {
  switch (scope.art) {
    case 'alle': return 'Filtert: alle Ebenen (Bund, Kantone, International)';
    case 'saeule': return `Filtert: ${SAEULE_LABEL[scope.saeule]}`;
    case 'kanton': return `Filtert: Kanton ${kantonName?.(scope.kanton) ?? scope.kanton}`;
  }
}

/** Basis-Menge des Filters je Scope — reine Teilmengen-Bildung auf dem bereits
 *  geladenen Manifest (kein neuer Index, K10). */
export function scopeBasis(erlasse: BrowseErlass[], scope: FilterScope): BrowseErlass[] {
  switch (scope.art) {
    case 'alle': return erlasse;
    case 'kanton': return erlasse.filter((e) => e.kanton === scope.kanton);
    case 'saeule':
      switch (scope.saeule) {
        case 'bund': return erlasse.filter((e) => e.ebene === 'bund' && e.rechtsgebiet !== 'international');
        case 'kanton': return erlasse.filter((e) => e.ebene === 'kanton');
        case 'international': return erlasse.filter((e) => e.rechtsgebiet === 'international');
      }
  }
}
