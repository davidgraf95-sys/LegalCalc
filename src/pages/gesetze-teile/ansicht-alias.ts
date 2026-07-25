// IA-5 · Rechtsgebiet-Parameter-Kanonisierung (FAHRPLAN-GESETZES-UX §11.4
// Ziff. 2, W2·5d): `?ansicht=rechtsgebiet` — die alte G6-Tür — bleibt ein
// auflösbarer Alias (A15, bindend: «Tür bleibt zusätzlich erreichbar, NICHT
// entfernt»), intern wird aber EIN kanonischer Zustand geführt:
// `?ebene=bund&gliederung=rechtsgebiet` (A15-Mechanik — die Rechtsgebiets-
// Sicht ist eine Gliederung der Bund-Säule, kein eigener Seiten-Zustand).
//
// Die Normalisierung ist reiner client-seitiger Parse (kein Router-Redirect,
// Leitplanke E.4) und Darstellungsschicht (§3) — KEINE Rechtslogik. Sie ist
// deterministisch (§8) und idempotent (kein Effekt-Loop): die kanonische Form
// normalisiert nicht weiter.

/** Erkennt NUR den dokumentierten Alt-Wert — fremde `ansicht`-Werte werden
 *  nicht gedeutet (§8 «nie raten»). */
export function istRechtsgebietAlias(params: URLSearchParams): boolean {
  return params.get('ansicht') === 'rechtsgebiet';
}

/** Alt-URL → kanonische Form. Liefert die normalisierten Params oder `null`,
 *  wenn nichts zu tun ist (kein Alias). Die Eingabe wird nie mutiert.
 *
 *  Alt-Verhalten als Massstab (§11.4 Ziff. 1 «identischer Inhalt»): die
 *  frühere themenSicht überdeckte jede Ebenen-/Gliederungs-Wahl und zeigte
 *  die Bund-Querschnitts-Sicht — darum erzwingt die kanonische Form
 *  `ebene=bund` + `gliederung=rechtsgebiet` und räumt `kt`. */
export function normalisiereAnsicht(params: URLSearchParams): URLSearchParams | null {
  if (!istRechtsgebietAlias(params)) return null;
  const p = new URLSearchParams(params);
  p.delete('ansicht');
  p.set('ebene', 'bund');
  p.delete('kt');
  p.set('gliederung', 'rechtsgebiet');
  return p;
}
