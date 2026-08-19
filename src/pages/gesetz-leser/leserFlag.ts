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
//
// ═══ H4 · DER FLIP (David-Ja 17.8.2026, «ja und c, mach so») ════════════════
//
// Bis H4 war der Grundzustand AUS: ohne Flag rendert V1, `?leser=v3` schaltet
// V3 an und merkt es. Seit H4 ist es GESPIEGELT — V3 ist der Standard-Leser,
// `?leser=v1` ist der Rückweg und wird gemerkt. Der Code darunter ist
// zeichengleich derselbe Bau; getauscht sind nur die Rollen von 'v1' und 'v3'.
//
// DER SCHLÜSSEL WECHSELT MIT, und das ist der Kern der Spiegelung: der
// gespeicherte Wert bedeutet nicht mehr «V3 gewünscht», sondern «V1 gewünscht».
// Denselben Schlüssel mit umgedrehter Bedeutung weiterzuverwenden wäre ein
// stiller Bedeutungswechsel an fremden Browsern — wer bis gestern ausdrücklich
// V3 wählte, trüge `lm.leser.v3='1'` und bekäme mit einer Invertierung
// ausgerechnet V1, also das Gegenteil seiner Wahl. Mit dem eigenen Schlüssel
// `lm.leser.v1` ist der alte Eintrag schlicht WIRKUNGSLOS: der V3-Wähler von
// gestern sieht V3, weil V3 jetzt der Default ist. Der Alt-Eintrag wird bewusst
// NICHT weggeräumt — er ist inert, und H5 entfernt den ganzen Mechanismus
// (FL-7). Eine Aufräum-Routine wäre Code, den nur H5 wieder löschen müsste.
//
// V1 bleibt bis H5 lauffähig; H5 (Löschung der alten Hülle samt Flag) folgt
// spätestens einen PR später (Kap. 7, «Fenster-Deckel»).

/** localStorage-Schlüssel der Hüllen-Wahl. Der Wert `'1'` heisst seit dem H4-Flip
 *  **«V1 gewünscht»** (Rückweg), vorher hiess `lm.leser.v3='1'` «V3 gewünscht».
 *  Zuwachs auf Zeit — die Entfernung ist Abnahmezeile von H5, nicht Nacharbeit
 *  (FL-7). NICHT verwandt mit `lm.leser.optionen`: die Leser-Optionen sind
 *  GETEILT, nicht dupliziert (FL-6, §5); dieser Schlüssel steht allein für die
 *  Hülle. */
export const LESER_V1_KEY = 'lm.leser.v1';

export type LeserModus = 'v1' | 'v3';

export interface LeserFlagWirkung {
  /** Welche Hülle rendert JETZT — sofort, ohne auf den Speicher-Effekt zu warten. */
  modus: LeserModus;
  /** Was der Speicher danach tragen soll. `null` = unverändert lassen. */
  speichern: 'setzen' | 'loeschen' | null;
}

/**
 * `?leser=v1` schaltet auf die alte Hülle UND merkt es sich; `?leser=v3`
 * schaltet zurück auf den Standard UND löscht die Merkung. Ohne Parameter
 * entscheidet allein der Speicher — und dessen Abwesenheit heisst V3.
 * **Der Grundzustand ist V3** (H4-Flip): ohne ausdrückliche Anforderung sieht
 * jeder Besucher den neuen Leser.
 *
 * @param suche       Query-String der aktuellen Location (`?leser=v1`).
 * @param gespeichert Rohwert von `localStorage[LESER_V1_KEY]` bzw. `null`.
 */
export function leserFlagAuswerten(suche: string, gespeichert: string | null): LeserFlagWirkung {
  const wunsch = new URLSearchParams(suche).get('leser');
  if (wunsch === 'v1') return { modus: 'v1', speichern: 'setzen' };
  if (wunsch === 'v3') return { modus: 'v3', speichern: 'loeschen' };
  return { modus: gespeichert === '1' ? 'v1' : 'v3', speichern: null };
}

/** localStorage kann werfen (Privat-Modus, deaktivierte Speicherung) und im
 *  Prerender-Node ganz fehlen. Beides bedeutet: kein Flag ⇒ V3 (der Default). */
export function leserFlagLesen(): string | null {
  try {
    return localStorage.getItem(LESER_V1_KEY);
  } catch {
    return null;
  }
}

/**
 * Vollzug der Merkung. Schlägt der Speicher fehl, bleibt das Flag flüchtig —
 * die aktuelle Ansicht stimmt trotzdem, sie kam aus dem Query-Parameter.
 *
 * IDEMPOTENT (Bug-Check B2, 16.8.2026). Der Vollzug lief bis dahin in einem
 * `useEffect` der Fassade — also NACH dem Render. Im Split-View rendern beide
 * Panes durch denselben `RouteSwitch`; das zweite Pane wertete sein Flag aus,
 * während der Effekt des ersten noch ausstand, las `null` und rendert die eine
 * Hülle neben der anderen (FL-1 verspricht das Gegenteil). Weil diese Funktion
 * nichts mehr tut, wenn der Speicher schon stimmt, darf die Fassade sie synchron
 * im Render-Rumpf rufen: kein wiederholtes Schreiben, kein Effekt-Verzug, keine
 * Reihenfolge-Abhängigkeit zwischen zwei Panes.
 *
 * Ein Schreibvorgang im Render-Rumpf ist sonst ein Anti-Muster — hier ist er
 * zulässig, weil er GEGEN EINE AUSSENWELT idempotent ist (kein React-Zustand,
 * kein Re-Render, gleiche Eingabe ⇒ gleiche Wirkung, §2).
 */
export function leserFlagSchreiben(speichern: LeserFlagWirkung['speichern']): void {
  if (speichern === null) return;
  try {
    const ist = localStorage.getItem(LESER_V1_KEY);
    if (speichern === 'setzen') {
      if (ist !== '1') localStorage.setItem(LESER_V1_KEY, '1');
    } else if (ist !== null) {
      localStorage.removeItem(LESER_V1_KEY);
    }
  } catch {
    /* siehe oben */
  }
}
