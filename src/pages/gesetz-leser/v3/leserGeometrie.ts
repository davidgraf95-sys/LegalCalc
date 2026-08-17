import type { CSSProperties } from 'react';
import { kopfHoehe, type KopfStufe } from './kopfStufen';
import { SUCH_H_AKTIV, SUCH_H_RUHE } from './SuchZone';

// ═══ Die EINE Stelle, an der die Geometrie des Lesers V3 gerechnet wird ══════
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H3-Nachzug C5a, §6.6): der Rahmen soll
// sagen, WO etwas steht — nicht auch noch, welche CSS-Variable aus welcher
// anderen folgt. Der Block war 16 Zeilen JSX-Attribut mit sechs voneinander
// abhängigen Werten und liess sich nur im Browser prüfen; als reine Funktion ist
// er an jeder Kombination von Stufe, Fläche und Such-Zustand nachrechenbar
// (§2/§6.7) — genau das Argument, mit dem `kopfStufen` entstanden ist.
//
// ── RISIKO R1 / LEHRE LM-003, WÖRTLICH MITGENOMMEN ──────────────────────────
// `--leser-kopf-h` behält seine Ist-BEDEUTUNG (Topbar + App-Leiste). Sie
// umzudeuten hätte das geteilte `GliederungSheet` still verstellt, das daraus
// seine Höhe rechnet (§5: eine Variable, eine Bedeutung). `--nt-stick` speist
// sich daraus und ist damit automatisch richtig, wenn die Kopfzeile ihre Stufe
// wechselt — genau das fehlte im Ist-Stand. Wer hier eine Zeile ändert,
// verschiebt jeden Artikel-Sprung; die Werte der Such-Zone kommen darum aus der
// Zone selbst (`./SuchZone`, B9) und nicht als Literal von hier.
//
// ── KEIN `imPane` (Fundament-Sonde) ─────────────────────────────────────────
// Das Argument heisst `vollflaechig` und beschreibt eine EIGENSCHAFT DER
// LESEFLÄCHE, nicht ihre Umgebung. Die eine Übersetzung (`!umgebung.imPane`)
// steht im Rahmen — dieselbe Regel und derselbe Grund wie bei `panelForm`
// (Zurückweisung durch die Sonde am 17.8.2026).

export interface LeserGeometrieLage {
  /** Zuschnitt der Kopfzeile (gemessene Breite → `kopfStufe`). */
  stufe: KopfStufe;
  /** Hat der Leser die ganze Seite für sich (Einzelansicht)? */
  vollflaechig: boolean;
  /** Trägt der klebende Kopf-BLOCK die Such-Zone? (Ä19: nur ohne Spalte.) */
  suchZoneKlebt: boolean;
  /** Läuft eine Suche? Die Zone ist dann höher (zweite Zeile mit den Zahlen). */
  sucheAktiv: boolean;
}

/**
 * Die CSS-Variablen am Wurzel-Element des Lesers.
 *
 * Reihenfolge und Werte sind gegenüber dem Zwischenstand UNVERÄNDERT — dies ist
 * eine Auslagerung, keine Änderung (§6: Verhaltensneutralität ist zu beweisen;
 * `leser-v3-kopf-buendig` und `leser-v3-suchfeld-ueberall` messen beide Enden).
 */
export function leserCssVariablen(lage: LeserGeometrieLage): CSSProperties {
  const { stufe, vollflaechig, suchZoneKlebt, sucheAktiv } = lage;
  return {
    '--leser-v3-kopf-h': kopfHoehe(stufe),
    '--leser-v3-kopf-top': vollflaechig ? 'var(--leser-kopf-h)' : '0rem',
    '--leser-kopf-h': 'calc(4rem + 2.25rem)',
    // Ä19: Höhe der Such-Zone — 0, wo die Leiste als Spalte das Feld trägt.
    // Zwei feste Werte, damit `--nt-stick` unten aus derselben Quelle rechnet.
    // B9: die zwei Werte gehören der Zone (`./SuchZone`), nicht dieser Datei.
    '--leser-v3-such-h': suchZoneKlebt ? (sucheAktiv ? SUCH_H_AKTIV : SUCH_H_RUHE) : '0rem',
    // Ä1: Wrapper-Polsterung, die der Kopf verschluckt. Vorgabe in index.css
    // (Shell `py-8 sm:py-12`); im Pane sind es `py-6` (Pane.tsx).
    ...(vollflaechig ? {} : { '--leser-v3-kopf-luecke': '1.5rem' }),
    '--leser-sub-h': vollflaechig ? '0rem' : 'var(--leser-v3-kopf-h)',
    '--nt-stick': vollflaechig
      ? 'calc(var(--leser-kopf-h) + var(--leser-v3-kopf-h) + var(--leser-v3-such-h))'
      : 'calc(var(--leser-sub-h) + var(--leser-v3-such-h))',
  } as CSSProperties;
}
