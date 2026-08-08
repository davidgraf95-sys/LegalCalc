// Ziel-Adressierung des Norm-Chips (V4, W2·10-UI-NAV). Eigenes Modul, weil
// NormChip.tsx nur Komponenten exportieren darf (react-refresh).

/**
 * V4 (W2·10-UI-NAV): interner Reader-Pfad zu einem Bund-Snapshot-Bezug.
 *
 * Spiegelt die Ableitung im NormPopover-Fuss («Im Gesetz öffnen ›»): Bund-
 * Snapshots liegen unter `/gesetze/bund/<quelle>`, der Artikel-Anker ist der
 * Snapshot-Token ohne `art_`-Präfix. Reine Adressierung (§3) — kein Normtext,
 * keine Regel; exportiert, damit der Pfad ohne DOM prüfbar ist.
 */
export function readerHrefFuerRef(ref: { quelle: string; token: string }): string {
  return `/gesetze/bund/${encodeURIComponent(ref.quelle)}#art-${ref.token.replace(/^art_/, '')}`;
}
