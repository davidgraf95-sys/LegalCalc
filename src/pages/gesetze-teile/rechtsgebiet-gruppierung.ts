// J3 · Gesetzesübersicht nach Rechtsgebieten (ROADMAP.md W2·10-UI-NAV, Idee
// David 16.8.2026): reine, testbare Gruppier-Logik für die dichte
// Rechtsgebiets-Übersicht auf /gesetze (RechtsgebietUebersicht.tsx).
// Darstellungsschicht-Ableitung (§3) — KEINE Rechtslogik, KEIN neuer
// Suchindex (K10): rechnet auf dem bereits geladenen BrowseErlass[].
//
// Bewusst NICHT in `src/lib/normtext/browse.ts` (wo `gruppiereNachKanton`
// lebt): jede Datei unter `src/lib/normtext/` ist per Pfad-Regel Risikopfad
// (`istRisikoPfad`, scripts/gegenpruefung/kern.ts) — dort gilt Gegenprüfungs-
// Pflicht für Norm-/Extraktions-Inhalt. Diese Funktion trägt keinen: sie
// sortiert nur die bereits deklarierte, bereits gegenprüfte `rechtsgebiet`-
// Achse (register.ts) um — reine UI-Anordnung, am selben Ort wie ihre
// Geschwister `filter-scope.ts`/`az-register.ts` (ebenfalls page-lokal, kein
// Risikopfad). Kein neuer Fakt, keine neue Norm-Behauptung.
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import { GEBIETE, type Rechtsgebiet } from '../../lib/normtext/register';

export interface RechtsgebietGruppe { gebiet: Rechtsgebiet; label: string; erlasse: BrowseErlass[] }

/**
 * Erlasse nach der deklarierten `rechtsgebiet`-Achse (SSoT `register.ts`
 * GEBIETE — dieselbe Achse trägt `EntscheidSnapshot.sachgebiet` in der
 * Rechtsprechung, §5: EINE Taxonomie für Gesetze UND Entscheide). Reihenfolge
 * = GEBIETE-Deklarationsreihenfolge; je Gruppe nach Rang, dann Kürzel (de-CH).
 * Nur Gebiete mit mind. einem Erlass — leere Gebiete werden nicht gerendert
 * (§8: keine leere Rubrik vortäuschen). Aufrufer filtert vorgängig auf
 * `ebene === 'bund'` — Kantone tragen `rechtsgebiet` nur als Default (§8,
 * vgl. Kommentar in `RechtsgebietSicht.tsx`), keine deklarierte
 * Zweitklassifikation.
 */
export function gruppiereNachRechtsgebiet(erlasse: BrowseErlass[]): RechtsgebietGruppe[] {
  const map = new Map<Rechtsgebiet, BrowseErlass[]>();
  for (const e of erlasse) {
    const liste = map.get(e.rechtsgebiet);
    if (liste) liste.push(e); else map.set(e.rechtsgebiet, [e]);
  }
  for (const liste of map.values()) {
    liste.sort((a, b) => a.rang - b.rang || a.kuerzel.localeCompare(b.kuerzel, 'de'));
  }
  const gruppen = GEBIETE
    .filter((g) => map.has(g.id))
    .map((g) => ({ gebiet: g.id, label: g.label, erlasse: map.get(g.id)! }));
  // Kein Wert fällt still raus (§8, Gegenprüfung 21.8.2026): trägt ein Erlass
  // ein Rechtsgebiet, das (noch) nicht in GEBIETE deklariert ist — möglich,
  // weil die `as Record`-Casts in register.ts den Compile-Schutz aushebeln —,
  // erscheint er in einer Rest-Rubrik am Ende statt zu verschwinden. Der
  // Wächter-Test in rechtsgebiet-gruppierung.test.ts hält den Fall rot-fähig.
  const deklariert = new Set<Rechtsgebiet>(GEBIETE.map((g) => g.id));
  const rest = [...map.entries()].filter(([id]) => !deklariert.has(id));
  for (const [id, liste] of rest) gruppen.push({ gebiet: id, label: 'Weitere Erlasse', erlasse: liste });
  return gruppen;
}
