// ─── A-8 · EINE Breiten-Quelle der V3-Hülle ─────────────────────────────────
//
// FAHRPLAN-LESER-V3 Kap. 12 A-8, Entscheid «H4»: «heute entscheiden zwei Quellen
// unabhängig über denselben Platz — `istXl` (Rahmen, 1024-px-Schwelle) und
// `kopfStufe` (Kopfzeile, 900/640 px). Eine dritte Schwelle einzuziehen, hiesse
// eine dritte Wahrheit über die Breite (§5).»
//
// Diese Datei ist die eine Quelle: hier stehen die Schwellen, hier steht die
// Messung, und `./kopfStufen` leitet nur noch weiter. Die drei Modi tragen die
// Namen der Skizze (Kap. 4): `d` Desktop · `s` schmal · `sheet` Handy/geteilt.
//
// ── GEMESSEN WIRD DAS ELEMENT, NICHT DER VIEWPORT ──────────────────────────
// Das ist die Zusage, die die Pane-Parität überhaupt möglich macht: in der
// Einzelansicht, im breiten und im schmalen Pane gilt dieselbe Regel aus
// derselben Quelle, ohne `imPane`-Verzweigung (Kap. 10, Ziel «Kopf-/Layout-
// Verzweigungen auf `imPane` → 0»). Ein `xl:`-Präfix oder ein `matchMedia`
// hätte im Pane den Viewport gemessen und dort das Desktop-Bild in eine
// 620-px-Spalte gezwungen.
//
// ── WARUM DER RAHMEN-ENTSCHEID (1024) HIER NOCH NICHT ANGESCHLOSSEN IST ─────
// `SCHWELLE_SPALTE` steht hier, weil sie zur selben Frage gehört; die Bindung
// des Zwei-Spalten-Entscheids an DIESE Messung ist aber KEINE Umbenennung,
// sondern eine sichtbare Verschiebung — gemessen 17.8.2026 am gebauten Stand:
// das Rahmen-Element ist bis ~1120 px Viewport konstant **48 px schmaler** als
// das Fenster (Aussenabstand der Inhaltsspalte) und ab 1120 px auf 1072 px
// gedeckelt (`max-w-content`, 70 rem).
//
//   Viewport   640   900  1023  1024  1025  1100  1280  1440
//   Rahmen     592   852   975   976   977  1052  1072  1072
//
// Der heutige Entscheid `istXl` misst den VIEWPORT gegen 1024. Würde er auf das
// Rahmen-Element umgestellt, verschöbe sich die Zwei-Spalten-Grenze von
// Viewport 1024 auf Viewport **1072** — die Gliederungsspalte verschwände auf
// jedem Fenster zwischen 1024 und 1071 px. Das ist genau der offene
// S-Breiten-/Spalten-Entscheid (Ä60, Vollzugsvermerk H3) und gehört nicht in
// einen Schritt, der «Verhalten unverändert» zugesichert hat (§6.3). Die Zahl
// steht hier, damit der Entscheid mit ihr getroffen wird und nicht ohne sie.
import { useCallback, useEffect, useRef, useState } from 'react';

/** Die drei Platz-Lagen der Skizze (Kap. 4). Reihenfolge = abnehmender Platz. */
export type Breitenmodus = 'd' | 's' | 'sheet';

/** Ab hier ist der volle Desktop-Zuschnitt möglich (Kap. 4a: 900 px). */
export const SCHWELLE_D = 900;
/** Grenze «H» der Skizze (Kap. 4: «H Handy ≤ 640 px»). Darunter Bottom-Sheet. */
export const SCHWELLE_S = 640;
/**
 * Ab hier hat die Gliederung als SPALTE Platz (heute `PANE_BREIT_PX` /
 * `matchMedia('(min-width: 1024px)')` in der Ist-Hülle, `inhalt-zustand.tsx`).
 * Bewusst hier und nicht dort importiert: die Fundament-Sonde
 * (`src/tests/leser-v3-fundament.test.ts`) verbietet der V3-Hülle den Import
 * aus den Naht-Modulen der Ist-Hülle, und die Ist-Hülle fällt mit H5 ohnehin.
 * Bis dahin ist die Doppelung der Zahl deklariert statt versteckt.
 */
export const SCHWELLE_SPALTE = 1024;

/** Breite (px) → Modus. Rein, monoton, an jeder Breite prüfbar. */
export function modusFuer(breitePx: number): Breitenmodus {
  if (breitePx < SCHWELLE_S) return 'sheet';
  if (breitePx < SCHWELLE_D) return 's';
  return 'd';
}

// ── V4 (Nachzug 17.8.2026) · `spalteFuer()` IST GESTRICHEN ──────────────────
// Hier stand `export function spalteFuer(b) { return b >= SCHWELLE_SPALTE; }`
// mit dem Zusatz «noch nicht angeschlossen». Der Architektur-Review 17.8.2026
// hat nachgezählt: NULL Aufrufer — weder in `v3/`, noch in `src/`, noch in
// `e2e/`, seit A-8. Ein Export, den niemand ruft, kann nicht scheitern und wird
// gestrichen statt bewacht (§17 in der Fassung vom 13.8.2026). Die Funktion war
// ohnehin nur ein Vergleich; wer den Entscheid anschliesst, schreibt ihn dort,
// wo er getroffen wird. Die ZAHL bleibt hier — sie ist die deklarierte
// Doppelung zu `inhalt-zustand.tsx` und hat seit V4 einen Wächter, der sie
// gegen die Ist-Hülle vergleicht (`src/tests/leser-v3-elementbreite.test.ts`).

/**
 * Misst die Breite des Elements, an dem `messRef` hängt, und liefert den Modus.
 *
 * CALLBACK-REF, NICHT `useRef` — und das ist keine Stilfrage, sondern ein
 * reproduzierter Fehler (16.8.2026 im Browser, StPO @1440): der Rahmen kehrt
 * beim ersten Render früh mit dem Lade-Platzhalter zurück, das gemessene Element
 * existiert also noch gar nicht. Ein `useEffect` auf einem `useRef` läuft genau
 * einmal — mit `ref.current === null` —, hängt keinen Observer ein und wird nie
 * wieder gerufen, weil sich die Ref-Identität nicht ändert. Der Kopf blieb
 * dadurch dauerhaft auf dem Startwert stehen: bei 1440 px stand der
 * Handy-Zuschnitt. Ein Callback-Ref meldet das Element, SOBALD es entsteht.
 *
 * Startwert aus `window.innerWidth` statt aus `'d'`: die V3-Hülle wird nicht
 * prerendert (R10), der erste Client-Render kennt den Viewport also bereits. Ein
 * pauschales `'d'` liesse den Kopf auf einem Telefon einen Frame lang zu hoch
 * stehen — genau der Layout-Sprung, den §15.2 verbietet. IM PANE ist der
 * Viewport aber die falsche Zahl: eine 620-px-Spalte in einem 1440-px-Fenster
 * startete auf `'d'` und fiel beim ersten Observer-Lauf auf `'s'` — ein
 * sichtbarer 8-px-Sprung der Kopfzeile (Bug-Check «Nice», 16.8.2026). Darum
 * misst der Callback-Ref SOFORT, wenn das Element entsteht: er läuft im
 * React-Commit, also vor dem Paint, und ein `setState` dort wird noch im selben
 * Frame verarbeitet.
 *
 * Der Zustand hält NUR den Modus, nie die Pixelzahl: jede Pixel-Änderung beim
 * Ziehen des Pane-Gutters würde sonst einen Re-Render auslösen (§15).
 */
export function useElementBreite(): {
  modus: Breitenmodus;
  messRef: (el: HTMLDivElement | null) => void;
} {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [modus, setModus] = useState<Breitenmodus>(() =>
    modusFuer(typeof window === 'undefined' ? 1200 : window.innerWidth));
  const letzter = useRef<Breitenmodus>(modus);

  const uebernimm = useCallback((breite: number) => {
    // Breite 0 kommt vor, solange das Element noch nicht gelayoutet ist —
    // sie als «Handy» zu lesen wäre eine Messung von nichts.
    if (breite <= 0) return;
    const neu = modusFuer(breite);
    if (neu === letzter.current) return;
    letzter.current = neu;
    setModus(neu);
  }, []);

  const messRef = useCallback((element: HTMLDivElement | null) => {
    setEl(element);
    // Vor dem Paint messen — sonst zeigt das Pane einen Frame lang den Modus
    // des VIEWPORTS (siehe oben). Stabile Identität via `useCallback`, damit der
    // Ref nicht bei jedem Render ab- und wieder angehängt wird.
    if (element) uebernimm(element.getBoundingClientRect().width);
  }, [uebernimm]);

  useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    uebernimm(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((eintraege) => {
      for (const e of eintraege) {
        // border-box: die Scrollbar des Panes verschiebt die Schwelle nicht.
        uebernimm(e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width);
      }
    });
    ro.observe(el, { box: 'border-box' });
    return () => ro.disconnect();
  }, [el, uebernimm]);

  return { modus, messRef };
}
