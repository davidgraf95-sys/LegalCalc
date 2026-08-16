// ─── Hüllen-Flag V1/V3 · die Regel, getrennt von der Fassade ─────────────────
//
// FAHRPLAN-LESER-V3 Kap. 5 (FL-1…FL-3, FL-6) · Risiko R10 «Das Flag leckt».
//
// WARUM EIN EIGENES MODUL statt der Fassade selbst: `GesetzLeser.tsx` ist eine
// Komponenten-Datei; exportiert sie nebenher Konstanten und Funktionen, bricht
// `react-refresh/only-export-components` (Tor `lint`). Die Regel muss aber
// exportierbar sein — der Vitest prüft sie DOM-frei (FL-3 verlangt den
// Default-Beweis), und H5 wird sie beim Entfernen des Flags an genau einer
// Stelle finden müssen (FL-7, §5).
//
// Die Datei enthält ausschliesslich die ENTSCHEIDUNG, nie deren Vollzug: sie
// liest kein `localStorage` und schreibt keines. Damit bleibt sie rein und
// deterministisch (§2) und im Prerender-Node ungefährlich.

/** localStorage-Schlüssel der Hüllen-Wahl. Zuwachs auf Zeit — die Entfernung
 *  ist Abnahmezeile von H5, nicht Nacharbeit (FL-7). NICHT verwandt mit
 *  `lm.leser.optionen`: die Leser-Optionen sind GETEILT, nicht dupliziert
 *  (FL-6, §5); dieser Schlüssel steht allein für die Hülle. */
export const LESER_V3_KEY = 'lm.leser.v3';

export type LeserModus = 'v1' | 'v3';

export interface LeserFlagWirkung {
  /** Welche Hülle rendert JETZT — sofort, ohne auf den Speicher-Effekt zu warten. */
  modus: LeserModus;
  /** Was der Speicher danach tragen soll. `null` = unverändert lassen. */
  speichern: 'setzen' | 'loeschen' | null;
}

/**
 * `?leser=v3` schaltet an UND merkt es sich; `?leser=v1` schaltet aus UND
 * löscht die Merkung. Ohne Parameter entscheidet allein der Speicher — und
 * dessen Abwesenheit heisst V1. **Der Grundzustand ist AUS** (R10): ohne
 * ausdrückliche Anforderung sieht jeder Besucher exakt den Ist-Stand.
 *
 * @param suche       Query-String der aktuellen Location (`?leser=v3`).
 * @param gespeichert Rohwert von `localStorage[LESER_V3_KEY]` bzw. `null`.
 */
export function leserFlagAuswerten(suche: string, gespeichert: string | null): LeserFlagWirkung {
  const wunsch = new URLSearchParams(suche).get('leser');
  if (wunsch === 'v3') return { modus: 'v3', speichern: 'setzen' };
  if (wunsch === 'v1') return { modus: 'v1', speichern: 'loeschen' };
  return { modus: gespeichert === '1' ? 'v3' : 'v1', speichern: null };
}

/** localStorage kann werfen (Privat-Modus, deaktivierte Speicherung) und im
 *  Prerender-Node ganz fehlen. Beides bedeutet: kein Flag ⇒ V1. */
export function leserFlagLesen(): string | null {
  try {
    return localStorage.getItem(LESER_V3_KEY);
  } catch {
    return null;
  }
}

/** Vollzug der Merkung. Schlägt der Speicher fehl, bleibt das Flag flüchtig —
 *  die aktuelle Ansicht stimmt trotzdem, sie kam aus dem Query-Parameter. */
export function leserFlagSchreiben(speichern: LeserFlagWirkung['speichern']): void {
  try {
    if (speichern === 'setzen') localStorage.setItem(LESER_V3_KEY, '1');
    else if (speichern === 'loeschen') localStorage.removeItem(LESER_V3_KEY);
  } catch {
    /* siehe oben */
  }
}
