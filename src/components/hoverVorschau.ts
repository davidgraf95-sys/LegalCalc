// ─── Hover-Vorschau: EINE Anatomie für alle Vorschau-Chips (§5) ─────────────
//
// Zwei Chip-Familien zeigen eine Vorschau auf ruhendem Zeiger: die Kanten-Zelle
// (V3, `verzahnung/KanteMitVorschau.tsx` → Regeste) und der Norm-Chip (V2,
// `vorlagen/NormChip.tsx` → Wortlaut). Ihre Zeit- und Zeiger-Regeln stehen
// darum EINMAL hier statt als zwei driftende Kopien: eine spätere Korrektur an
// der Verzögerung wirkt sonst nur an einer der beiden Flächen.
//
// Reine Darstellungs-Konstanten (§3), keine Rechtslogik.

/** Öffnen erst nach ruhendem Zeiger. Ohne Verzögerung feuerte jedes Vorbei-
 *  fahren über eine 5-Chip-Linie fünf Popover-Mounts (Befund V3, Zeiger-
 *  Rauschen). Der Wert deckt zugleich die V2-Spec «~500 ms» ab. */
export const HOVER_OEFFNEN_MS = 450;

/** Nachlauf beim Verlassen: der Zeiger muss vom Chip in die Karte wandern
 *  können (WCAG 1.4.13 «hoverable»), ohne dass sie unterwegs zuklappt. */
export const HOVER_SCHLIESSEN_MS = 180;

/**
 * Öffnet dieser Zeiger per Hover? Nur echte Zeiger (Maus/Stift). Auf Touch ist
 * «hover» ein Synthese-Ereignis DES TAPS — dort bleibt es beim Klick, sonst
 * öffnete sich die Karte genau im Moment der Navigation (Befund V3).
 * Reiner Helfer → in Node-Env testbar, ohne DOM.
 */
export function istHoverZeiger(pointerType: string): boolean {
  return pointerType !== 'touch';
}
