// ─── Adress-Schreibregeln — geteilter Baustein ──────────────────────────────
//
// Die eine Stelle, an der steht, WANN und WIE die Adresse geschrieben wird.
// Rein und deterministisch (§2), ohne React/Router — darum browserfrei prüfbar.
//
// ── Die Grenze, die hier gilt (LM-202, David-Entscheid 3.8.2026) ────────────
// «Die URL ändert sich NUR bei explizitem Klick auf einen Artikel-Anker bzw.
// bei der Teilen-Aktion.» Ein SCROLL-Ereignis schreibt nie in die Adresse —
// weder im Gesetzes- noch im Entscheid-Leser. Das ist kein Versehen, sondern
// der bestätigte Bestands-Entscheid (`FAHRPLAN-UI-NAVIGATION.md` §Z Ziff. 7):
// der kontinuierliche Scroll-Hash-Sync kollidiert mit der empirisch begründeten
// A16-Anker-Restauration (manuelles pushState war der «widerlegte Irrweg») und
// ist eine Perf-/History-Falle. Teilbarkeit leistet stattdessen R3 —
// Zitat + Permalink am Artikel, ein diskreter Klick.
//
// ── LM-205 (3.8.2026) · Debounce für den `LinkTeilenButton` ─────────────────
// Der Rechenzustand soll ohne Klick in der Adresse stehen (reload-/teilfest),
// aber ohne bei jedem Tastendruck einen `history.replaceState`-Aufruf
// auszulösen. Betrifft ausschliesslich EINGABE-Änderungen der Rechner (ein
// diskretes Nutzer-Ereignis), nicht Scroll. In eigener Datei statt in
// LinkTeilenButton.tsx, weil eine Komponentendatei laut
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

// ── Anker in die Adresse setzen (LM-209 Entscheid-Leser · LM-202 Gesetz-Leser) ─
//
// Ursprünglich in `pages/entscheidLeserRegeln.ts` gebaut (LM-209: Abschnitts-
// Reiter ohne Verlaufsflut). Mit LM-202 braucht der Gesetzes-Leser dieselbe
// Regel für den Teilen-Knopf am Artikel — darum hier, an der einen Stelle
// (§5: keine zweite Adress-Wahrheit); `entscheidLeserRegeln` re-exportiert sie
// unverändert weiter.
//
// Aufrufer schreiben das Ergebnis IMMER per `history.replaceState`, nie per
// `pushState`: der Verlauf gehört den echten Ortswechseln. Der Hash bleibt in
// der Adresse stehen (teilbar, als Lesezeichen sicherbar), erzeugt aber keinen
// zusätzlichen «Zurück»-Schritt.

/** Adresse mit gesetztem Anker; Pfad und Query bleiben unberührt. */
export function urlMitHash(href: string, anker: string): string {
  const u = new URL(href);
  u.hash = anker;
  return u.toString();
}
