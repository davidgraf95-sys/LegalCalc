// ─── Live-URL-Sync — geteilter Baustein (LM-205, 3.8.2026) ──────────────────
// Debounce-Entscheidung für den `LinkTeilenButton`: der Rechenzustand soll
// ohne Klick in der Adresse stehen (reload-/teilfest), aber ohne bei jedem
// Tastendruck einen `history.replaceState`-Aufruf auszulösen. In eigener
// Datei statt in LinkTeilenButton.tsx, weil eine Komponentendatei laut
// react-refresh/only-export-components nur Komponenten exportieren darf.

export const LIVE_SYNC_DEBOUNCE_MS = 400;

/**
 * Reine Entscheidungs- und Timer-Funktion — unabhängig von React/Router
 * testbar. Plant `schreiben` nur, wenn sich der kodierte Query tatsächlich
 * vom aktuellen Adress-Query unterscheidet (vermeidet unnötige
 * replaceState-Aufrufe bei reinen Re-Renders ohne Eingabe-Änderung) und
 * liefert die Aufräumfunktion (Timer löschen), sonst `undefined`.
 */
export function planeLiveSync(
  neuerQuery: string,
  aktuelleSearch: string,
  schreiben: () => void,
  verzoegerungMs: number = LIVE_SYNC_DEBOUNCE_MS,
): (() => void) | undefined {
  if (neuerQuery === aktuelleSearch) return undefined;
  const timer = setTimeout(schreiben, verzoegerungMs);
  return () => clearTimeout(timer);
}
