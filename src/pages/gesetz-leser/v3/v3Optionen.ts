// ─── V3-Sichten: drei zweiwertige Schalter statt vier Optionen ───────────────
//
// FAHRPLAN-LESER-V3 Kap. 4f · Etappe H1 (UI-Seite) / S1 (Rückbau im Store).
//
// Die V3-Kopfzeile bietet GENAU DREI Schalter, alle zweiwertig:
//   Fussnoten · Änderungsvermerke · Rechtsprechung im Text
// Der Store darunter (`leserOptionen.ts`) bleibt in H1 UNVERÄNDERT — er ist
// GETEILT mit der Ist-Hülle (FL-6, §5: ein Schlüssel `lm.leser.optionen`, ein
// Hörer-Satz). Was V3 hier tut, ist ausschliesslich eine ABBILDUNG:
//
//   `hist` ist im Store dreiwertig ('aus' | 'fussnoten' | 'chronologie').
//   V3 zeigt daraus eine ZWEIWERTIGE Sicht:
//     'aus'                        → Schalter AUS
//     'fussnoten' | 'chronologie'  → Schalter AN
//   Setzen schreibt 'fussnoten' bzw. 'aus'.
//
// WARUM ABBILDUNG UND NICHT RÜCKBAU: den dritten Wert wirklich zu streichen ist
// Etappe S1 und braucht Davids Entscheid F1 (Kap. 9). Bis dahin darf V3 den
// Wert nicht zerstören — wer in V1 «Chronologie» gewählt hat, findet sie dort
// unverändert vor, auch wenn er zwischendurch in V3 gelesen hat. Die Abbildung
// ist verlustfrei in genau einer Richtung (an/aus bleibt an/aus); nur das
// AUSDRÜCKLICHE Umschalten auf «an» in V3 normalisiert 'chronologie' auf
// 'fussnoten' — das ist eine Nutzer-Geste, kein stiller Datenverlust (§8).
//
// Rein und deterministisch (§2): die beiden Abbildungen unten kennen weder DOM
// noch Speicher und sind darum DOM-frei prüfbar (src/tests/leser-v3-optionen.test.ts).

import type { HistAnsicht } from '../leserOptionen';

/** Zweiwertige Sicht der V3-Kopfzeile. */
export type V3Sicht = 'an' | 'aus';

/**
 * Store-Wert → Schalterstellung. Alles, was nicht ausdrücklich «aus» ist, zeigt
 * Änderungsvermerke an — auch ein künftiger, hier noch unbekannter vierter Wert
 * (Sicherheitsrichtung: nie amtliche Substanz stillschweigend verstecken, §8).
 */
export function histZuSicht(hist: HistAnsicht): V3Sicht {
  return hist === 'aus' ? 'aus' : 'an';
}

/**
 * Schalterstellung → Store-Wert. «an» schreibt den Grundzustand 'fussnoten'
 * (der Apparat am Artikelfuss), «aus» schreibt 'aus'.
 */
export function sichtZuHist(sicht: V3Sicht): HistAnsicht {
  return sicht === 'an' ? 'fussnoten' : 'aus';
}

/**
 * Die Umschaltung als EINE Funktion — was der Klick auf den Schalter in den
 * Store schreibt, wenn er gerade `hist` zeigt. Ausdrücklich hier und nicht in
 * der Komponente: `sichtZuHist(histZuSicht(h) === 'an' ? 'aus' : 'an')` ist die
 * Stelle, an der 'chronologie' auf 'fussnoten' normalisiert wird, und die
 * gehört unter einen Test, nicht in einen onClick-Ausdruck.
 */
export function histUmschalten(hist: HistAnsicht): HistAnsicht {
  return sichtZuHist(histZuSicht(hist) === 'an' ? 'aus' : 'an');
}
