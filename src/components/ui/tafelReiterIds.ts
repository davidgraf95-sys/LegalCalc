// ─── Die Id-Grammatik der Reiter/Tafel-Verdrahtung (§5) ─────────────────────
//
// Eigene Datei und nicht `TafelReiter.tsx`, weil eine .tsx-Datei ausser
// Komponenten nichts exportieren soll (`react-refresh/only-export-components`)
// — dieselbe Aufteilung wie `datumText.ts` neben `Datum.tsx`.
//
// EINE Ableitung für BEIDE Enden: der Reiter setzt `aria-controls` auf
// `tafelId(...)`, die Tafel setzt `aria-labelledby` auf `tafelReiterId(...)`.
// Zwei getrennte Schreibweisen wären zwei Wahrheiten, die still auseinander-
// laufen — genau das, wovor §5 warnt, und hier ist es kein Kosmetik-Problem:
// eine falsch verdrahtete Tafel ist für den Screenreader eine namenlose Fläche.

/** Id des Reiters. */
export const tafelReiterId = (praefix: string, code: string): string => `${praefix}-tab-${code}`;

/** Id der zugehörigen Tafel (`role="tabpanel"`). */
export const tafelId = (praefix: string, code: string): string => `${praefix}-tafel-${code}`;
