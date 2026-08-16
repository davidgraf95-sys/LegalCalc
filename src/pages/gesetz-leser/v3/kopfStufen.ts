// ─── Overflow-Regel der V3-Kopfzeile (FAHRPLAN-LESER-V3 Kap. 4a) ────────────
//
// «Unter 900 px fällt zuerst «Gesetze», dann der Volltitel; **nie** der Artikel,
// nie «Ansicht».» — das ist eine REGEL, keine Klassenliste, und sie steht darum
// hier als reine Funktion (§2, §3) statt als Kette von `hidden sm:inline` im
// Markup. Zwei Gründe:
//
//  ① SIE IST PRÜFBAR. Die Zusicherung «der Artikel fällt nie» lässt sich an
//     einer Funktion für JEDE Breite beweisen (src/tests/leser-v3-kopfstufen.test.ts);
//     an verstreuten Utility-Klassen liesse sie sich nur an den drei Breiten
//     stichproben, die zufällig ein Screenshot trifft.
//  ② SIE BRAUCHT KEINE `imPane`-VERZWEIGUNG. Gemessen wird die Breite des
//     KOPF-ELEMENTS selbst (ResizeObserver), nicht der Viewport. Damit gilt in
//     der Einzelansicht, im breiten und im schmalen Pane exakt dieselbe Regel
//     aus derselben Quelle — genau das verlangt Kap. 10 («Kopf-/Layout-
//     Verzweigungen auf `imPane` → 0»), und genau das prüft
//     `e2e/leser-kopf-paritaet.e2e.ts`. Ein `xl:`-Präfix hätte im Pane den
//     Viewport gemessen und dort das Desktop-Bild in eine 620-px-Spalte gezwungen.
//
// Die Schwellen: 900 px ist die im Fahrplan genannte Grenze; 640 px ist die
// Handy-Grenze «H» derselben Skizze (Kap. 4, «H Handy ≤ 640 px»).

import { useEffect, useRef, useState } from 'react';

/** Die drei Zuschnitte der Kopfzeile. Reihenfolge = abnehmender Platz. */
export type KopfStufe = 'voll' | 'kompakt' | 'mini';

/** Grenze, ab der die Sektions-Krume «Gesetze» fällt (Kap. 4a). */
export const KOPF_SCHWELLE_KOMPAKT = 900;
/** Grenze «H» der Skizze (Kap. 4): darunter der Handy-Zuschnitt. */
export const KOPF_SCHWELLE_MINI = 640;

/** Breite (px) → Zuschnitt. Rein, monoton, an jeder Breite prüfbar. */
export function kopfStufe(breitePx: number): KopfStufe {
  if (breitePx < KOPF_SCHWELLE_MINI) return 'mini';
  if (breitePx < KOPF_SCHWELLE_KOMPAKT) return 'kompakt';
  return 'voll';
}

/** Was auf einer Stufe sichtbar ist. `artikel` und `ansicht` sind bewusst als
 *  Felder geführt, obwohl sie immer `true` sind: so ist die Zusicherung des
 *  Fahrplans («nie der Artikel, nie Ansicht») eine Aussage über den Rückgabewert
 *  und nicht über abwesenden Code — ein Tor, das scheitern KANN (§6.7). */
export interface KopfElemente {
  /** Sektions-Krume «Gesetze ›». Fällt als erstes. */
  sektion: boolean;
  /** Erlass-Volltitel neben dem Kürzel. Fällt als zweites. */
  volltitel: boolean;
  /** Erlass-Kürzel («StPO»). Bleibt immer — es ist die Ortsangabe. */
  kuerzel: true;
  /** Laufender Artikel («Art. 429»). Bleibt IMMER (Fahrplan Kap. 4a). */
  artikel: true;
  /** Öffner «Ansicht ▾» bzw. «···». Bleibt IMMER (Fahrplan Kap. 4a). */
  ansicht: true;
}

export function kopfElemente(stufe: KopfStufe): KopfElemente {
  return {
    sektion: stufe === 'voll',
    volltitel: stufe === 'voll',
    kuerzel: true,
    artikel: true,
    ansicht: true,
  };
}

/** Höhe der Kopfzeile je Stufe (Design-Grundlage Kap. 3: H 48 px · D 56 px ·
 *  S 48 px). EINE Quelle — der Rahmen legt sie als `--leser-v3-kopf-h` aus und
 *  die Sprung-Offsets (`--nt-stick`) rechnen daraus (Risiko R1). */
export function kopfHoehe(stufe: KopfStufe): string {
  return stufe === 'voll' ? '3.5rem' : '3rem';
}

/**
 * Misst die Breite des übergebenen Elements und liefert den Zuschnitt.
 *
 * Startwert aus `window.innerWidth` statt aus `'voll'`: die V3-Hülle wird nicht
 * prerendert (R10 — der Prerender rendert die Hülle ohnehin nicht), der erste
 * Client-Render kennt den Viewport also bereits. Ein pauschales `'voll'` als
 * Startwert liesse den Kopf auf einem Telefon einen Frame lang zu hoch stehen
 * und erzeugte genau den Layout-Sprung, den §15.2 verbietet.
 */
export function useKopfStufe(ref: React.RefObject<HTMLElement | null>): KopfStufe {
  const [stufe, setStufe] = useState<KopfStufe>(() =>
    kopfStufe(typeof window === 'undefined' ? 1200 : window.innerWidth));
  // Der zuletzt gemeldete Wert, damit der Observer nur bei echtem Stufenwechsel
  // einen Re-Render auslöst (jede Pixel-Änderung beim Ziehen des Pane-Gutters
  // feuert sonst — §15).
  const letzte = useRef<KopfStufe>(stufe);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const messe = (breite: number) => {
      const neu = kopfStufe(breite);
      if (neu === letzte.current) return;
      letzte.current = neu;
      setStufe(neu);
    };
    messe(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((eintraege) => {
      for (const e of eintraege) {
        // border-box: die Scrollbar des Panes verschiebt die Schwelle nicht.
        messe(e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width);
      }
    });
    ro.observe(el, { box: 'border-box' });
    return () => ro.disconnect();
  }, [ref]);
  return stufe;
}
