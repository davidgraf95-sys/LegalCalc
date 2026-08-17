// ─── Die Tastenbelegung des Lesers — EINE Quelle für Auswertung UND Hilfe ────
//
// Eigene Datei, weil `LeserTastatur.tsx` eine Komponenten-Datei ist: die
// Lint-Regel `react-refresh/only-export-components` verbietet dort einen
// zweiten, nicht-Komponenten-Export (Fast Refresh würde sonst beim Editieren
// den Modul-Zustand verlieren). Der Inhalt ist unverändert der von H1 — nur der
// «r»-Eintrag ist neu und an eine Bedingung gebunden.
//
// Ein Eintrag, der hier fehlt, taucht auch in der Hilfe nicht auf; einer, der
// hier steht und nicht wirkt, fiele beim Lesen der Hilfe sofort auf.

export interface Tastenbelegung {
  taste: string;
  wirkung: string;
}

/**
 * `hatPanel` = der Aufrufer hat ein Rechtsprechungs-/Kontext-Panel (LESER-V3,
 * H3). NUR DANN steht «r» in der Hilfe. Die Ist-Hülle hat kein solches Panel;
 * einen Eintrag zu zeigen, der dort nichts tut, wäre genau die Hilfe, die lügt
 * (§8) — und der Grund, warum diese Liste überhaupt EINE Quelle für Auswertung
 * und Overlay ist. Rein, damit die Zuordnung ohne Browser prüfbar ist (§6.7).
 */
export function belegung(hatPanel: boolean): readonly Tastenbelegung[] {
  return [
    { taste: 'j', wirkung: 'Zum nächsten Artikel' },
    { taste: 'k', wirkung: 'Zum vorigen Artikel' },
    { taste: 't', wirkung: 'Fokus in die Gliederung' },
    ...(hatPanel ? [{ taste: 'r', wirkung: 'Rechtsprechung und Kontext öffnen' }] : []),
    { taste: '?', wirkung: 'Diese Übersicht öffnen' },
    { taste: 'Esc', wirkung: 'Übersicht schliessen' },
  ];
}

/** Tasten, die der Leser-Listener beansprucht (ohne «?»/Escape, die separat
 *  laufen). «r» ist frei: «/» und ⌘K gehören der HeaderSuche, j/k/t diesem
 *  Listener; kein Browser-Standard belegt ein blankes «r» (Reload ist ⌘/Ctrl+R
 *  und fällt bereits am Modifier-Guard). */
export const NAVIGATION: ReadonlySet<string> = new Set(['j', 'k', 't', 'r']);
