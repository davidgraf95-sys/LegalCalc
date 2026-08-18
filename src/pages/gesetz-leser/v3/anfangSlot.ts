import { createContext, useContext } from 'react';

// ─── Ä94 (H4-Nachzug 18.8.2026) · WO «↑ ANFANG» STEHT, WENN DIE LEISTE SCHWEIGT ─
//
// BEFUND (gemessen 18.8.2026, `vite preview`, StPO/«Entschädigung», Handy 390,
// Bottom-Sheet mit Trefferliste):
//
//   Zone A (`data-v3-leiste-baumkopf`)   358 × 34 px   Inhalt: «↑ Anfang», 62 px
//   → 246 px leere Fläche, als eigene klebende Leiste, direkt über der
//     klebenden Leiste der Trefferliste (358 × 90 px).
//   Trefferliste, Zeile 1: Segment 288 px im 358-Kasten → 70 px Stummel rechts.
//
// Zwei klebende Balken übereinander, der obere zu 69 % leer, der untere mit
// einem Loch an genau der Stelle, an der oben der Knopf steht. Ä32 hat
// entschieden, dass «↑ Anfang» im Blatt BLEIBT (es bezieht sich auf den Erlass,
// nicht auf den Baum) — die Frage war nie das Ob, sondern das Wo.
//
// WARUM EIN SLOT UND KEIN PROP: die Bedingung «Zone A trägt nichts ausser dem
// Knopf» kennt nur die Leiste (sie sieht `baumTitel` und `baumKnoepfe`), die
// freie Fläche kennt nur die Trefferliste (sie besitzt ihre Werkzeugzeile).
// Zwischen beiden liegt `LeserGliederung` als Weiche Baum/Treffer, die weder das
// eine noch das andere weiss. Ein Prop müsste also durch den Rahmen laufen und
// dort eine Bedingung doppeln, die die Leiste schon auswertet — zwei Stellen für
// eine Aussage (§5). Der Slot lässt die Leiste ABGEBEN, was sie nicht selbst
// unterbringen kann, und die Trefferliste nimmt es genau dann an.
//
// GENAU EIN KNOPF PRO SEITE (Kap. 4b Pos. 15) bleibt die Invariante, und sie ist
// hier struktureller Natur, nicht bewacht: die Leiste gibt den Knopf ENTWEDER
// selbst aus ODER reicht ihn weiter — nie beides. Fehlt der Slot (Spalte mit
// «Treffer»-Überschrift; Treffer-Blatt am Feld, das ganz ohne Leiste steht),
// findet die Trefferliste `null` und rendert nichts.

/** Der abgegebene «↑ Anfang»-Knopf: `null` = die Leiste zeigt ihn selbst. */
export const AnfangSlot = createContext<(() => void) | null>(null);

/** Nimmt den abgegebenen Knopf an — `null`, wenn keiner abgegeben wurde. */
export function useAnfangSlot(): (() => void) | null {
  return useContext(AnfangSlot);
}
