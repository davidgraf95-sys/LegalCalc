import type { Bezug } from '../../../lib/rechtsprechung/bezuege';

// ─── Nicht-Komponenten-Teil von PanelEntscheide.tsx ─────────────────────────
//
// Ausgelagert (react-refresh/only-export-components) — Muster wie
// `InhaltsKopfKontext.ts` neben `InhaltsKopf.tsx`: Verhalten byte-gleich, nur
// der Ort wechselt.
//
// ─── Befund 6b (Cowork 21.8.2026): Weiterzug-Klammerzusatz erklären ─────────
//
// 272 von 3'795 kantonalen Entscheiden (BS-Tranche, amtliche Kurzzeile statt
// Regeste — s. `manifestRegesteKurz`) tragen einen amtlichen Klammerzusatz
// «(BGer <Az.> vom <Datum>)»: die Quelle selbst vermerkt damit, dass der
// Entscheid ans Bundesgericht weitergezogen wurde. Ohne Erklärung liest sich
// das wie ein Daten-/Render-Fehler. EIN dezenter Hinweis auf GRUPPEN-Ebene
// (nicht je Zeile — Ä106/Icon-Flut-Regel) erscheint nur, wenn mindestens EIN
// Eintrag der Gruppe das Muster trägt.
export const WEITERZUG_MUSTER = /\(BGer\b[^()]*\bvom\b[^()]*\)/;
export const WEITERZUG_ERKLAERUNG = 'Klammerzusatz „BGer …“: der Entscheid wurde ans Bundesgericht weitergezogen.';
/** Exportiert für den gezielten Unit-Test (leser-v3-panel-weiterzug.test.ts) —
 *  reine Zeichenketten-Prüfung, keine Rechtslogik (§3). */
export function traegtWeiterzugHinweis(liste: readonly Bezug[]): boolean {
  return liste.some((b) => !!b.regesteKurz && WEITERZUG_MUSTER.test(b.regesteKurz));
}
