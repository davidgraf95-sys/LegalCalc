import { createContext, useContext, type RefObject } from 'react';

// ─── Die EINE Wurzel-Quelle für Pane und Breite (Kap. 10, Fundament-Auflage 1) ─
//
// «Keine `imPane`/`istSekundaer`-Verzweigungen ausserhalb der einen Wurzel
//  `PaneKontext`.» (Auftrag David 16.8.2026)
//
// `usePaneKontext()` (components/layout) beantwortet die Frage «laufe ich in
// einem Split-View-Pane?» für die ganze App. Der V3-Leser liest sie **genau
// einmal** — im Rahmen — und legt das Ergebnis zusammen mit den beiden davon
// abhängigen Ableitungen hier ab. Alles Weitere in `v3/` konsumiert diesen
// Kontext und stellt die Frage nicht noch einmal.
//
// WARUM EIN EIGENER KONTEXT UND NICHT DIREKT `usePaneKontext`:
//  ① `istXl` (2-Spalten-Schwelle) ist im Pane eine CONTAINER-Breite und sonst
//     eine VIEWPORT-Breite. Diese Auflösung passiert einmal; wer sie mehrfach
//     macht, bekommt zwei Observer und zwei Wahrheiten über dieselbe Zahl.
//  ② Der Kontext ist die Stelle, an der ein Architektur-Prüfer nachsieht, was
//     die Hülle über ihre Umgebung überhaupt weiss. Sechs Felder, mehr nicht.
//  ③ Prop-Drilling über mehr als zwei Ebenen entfällt: Kopf, Seitenleiste und
//     Lesespalte greifen zu, ohne dass der Rahmen sie durchreicht.
//
// WAS HIER BEWUSST NICHT DRIN STEHT: der Erlass, die Optionen, der Suchzustand.
// Ein Kontext, in dem alles liegt, ist ein globaler Zustand mit anderem Namen —
// und jede Änderung daran rendert die 1686 Artikel des OR neu (§15). Daten
// fliessen als Props aus dem Modell (`./leserV3Modell`), nicht durch diesen
// Kontext.

export interface LeserV3KontextWert {
  /** Läuft dieser Teilbaum in einem Split-View-Pane? */
  imPane: boolean;
  /** Ist es das SEKUNDÄRE Pane? Nur dieses schreibt weder URL noch Tab-Titel
   *  (B-2.5) — die Unterscheidung ist die Rolle, nicht `imPane`: das primäre
   *  Pane läuft ebenfalls mit `imPane: true` (B1-Falle). */
  istSekundaer: boolean;
  /** Scroll-/Wurzelelement des Panes; `null` ausserhalb. DOM-Abfragen und
   *  Scroll-Ziele werden darauf gescopt, sonst trifft ein `#art-…` das falsche
   *  Pane (zwei Gesetz-Panes tragen dieselben Ids). */
  wurzel: RefObject<HTMLElement | null> | null;
  /** Overlay-Schicht des Panes für Sheets; `null` ⇒ Portal an `document.body`. */
  overlayWurzel: RefObject<HTMLElement | null> | null;
  /** Ab 1024 px: zwei Spalten. Im Pane aus der PANE-Breite, sonst aus dem
   *  Viewport — eine Zahl, eine Auflösung. */
  istXl: boolean;
}

const LeerKontext: LeserV3KontextWert = {
  imPane: false, istSekundaer: false, wurzel: null, overlayWurzel: null, istXl: false,
};

const Kontext = createContext<LeserV3KontextWert>(LeerKontext);

/** Provider — nur `LeserRahmenV3` setzt ihn, und nur einmal. */
export const LeserV3Provider = Kontext.Provider;

export function useLeserV3Kontext(): LeserV3KontextWert {
  return useContext(Kontext);
}
