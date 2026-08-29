// Ziel-Adressierung des Norm-Chips (V4, W2·10-UI-NAV). Eigenes Modul, weil
// NormChip.tsx nur Komponenten exportieren darf (react-refresh).

import { erlassPfadVonKey } from '../../lib/normtext/erlassAdresse';

/**
 * V4 (W2·10-UI-NAV): interner Reader-Pfad zu einem Snapshot-Bezug.
 *
 * Spiegelt die Ableitung im NormPopover-Fuss («Im Gesetz öffnen ›»): der
 * Artikel-Anker ist der Snapshot-Token ohne `art_`-Präfix. Reine Adressierung
 * (§3) — kein Normtext, keine Regel; exportiert, damit der Pfad ohne DOM
 * prüfbar ist.
 *
 * Befund 45 (Entscheid David 29.8.2026): bis hierher stand `/gesetze/bund/`
 * fest im Text. Ein Chip auf einen Staatsvertrag (CISG, LugÜ) zeigte damit auf
 * die Alt-Adresse — auflösbar, aber eine Weiterleitung zu viel. Die Ebene
 * beantwortet jetzt `erlassAdresse` aus dem Register (§5).
 */
export function readerHrefFuerRef(ref: { quelle: string; token: string }): string {
  return `${erlassPfadVonKey(ref.quelle)}#art-${ref.token.replace(/^art_/, '')}`;
}
