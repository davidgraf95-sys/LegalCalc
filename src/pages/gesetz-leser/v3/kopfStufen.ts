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

import { useCallback, useEffect, useRef, useState } from 'react';


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
  /** ── Die FÜHRENDEN Krumen-Stufen «Gesetze › Bund ›». Fallen als erstes. ───
   *  Hiess bis 17.8.2026 `sektion` und trug nur «Gesetze ›»: die Ebene-Stufe
   *  («Bund», «Kanton BS», «International») stand in der App-Krumen-Leiste
   *  darüber, die A-2 abgelöst hat. Seither trägt die Kopfzeile die ganze Kette
   *  — aus EINER Quelle (`erlassAnsicht.brotkrume`, die auch die Ebene aus dem
   *  Datenmodell ableitet statt aus `if (bund)`).
   *  EIN Feld für beide Stufen und nicht zwei: sie beantworten dieselbe Frage
   *  («woher komme ich»), und wo der Platz für die eine nicht reicht, reicht er
   *  für die andere auch nicht — zwei Flags, die nie auseinandergehen können,
   *  wären ein Tor, das nicht scheitern kann (§6.7/§17). */
  krume: boolean;
  /** Erlass-Volltitel neben dem Kürzel. Fällt als zweites. */
  volltitel: boolean;
  /** Erlass-Kürzel («StPO»). Bleibt immer — es ist die Ortsangabe. */
  kuerzel: true;
  /** Laufender Artikel («Art. 429»). Bleibt IMMER (Fahrplan Kap. 4a). */
  artikel: true;
  /** Öffner «Ansicht ▾» bzw. «···». Bleibt IMMER (Fahrplan Kap. 4a). */
  ansicht: true;
  /**
   * H3/Ä11 — Zähler «⚖ 14 Entscheide» in der Kopfzeile.
   *
   * AUF `mini` NICHT: dort stehen bereits Ort · ☰ · ··· · ✕, und die
   * Design-Grundlage Kap. 6 deckelt die Ruhezustand-Kopfzeile auf VIER Elemente.
   * Der Öffner verschwindet damit nicht — er lebt auf dem Handy-Zuschnitt
   * ausschliesslich als Randlasche, also in der Daumenzone statt in der engsten
   * Zeile des Bildschirms. Das ist der Teil von Ä11 («Split-Pane-Icon-Flut»),
   * den H3 zu verantworten hat: die neue Fläche vergrössert die Kopfzeile nicht.
   */
  panel: boolean;
}

export function kopfElemente(stufe: KopfStufe): KopfElemente {
  return {
    krume: stufe === 'voll',
    volltitel: stufe === 'voll',
    kuerzel: true,
    artikel: true,
    ansicht: true,
    panel: stufe !== 'mini',
  };
}

/**
 * WELCHE GESTALT hat das Panel-Blatt? (Kap. 4d)
 *
 * Beides sind Überlagerungen — sie nehmen dem Lesetext keine Spalte weg und
 * brechen ihn darum nie neu um (Rechnung zur gestrichenen Grid-Spalte im
 * Rahmen). Nur die KANTE, an der sie hängen, unterscheidet sie:
 *
 *   'rechts'  22 rem breit, am rechten Rand, von der Kopf-Unterkante bis zum
 *             Fensterboden — die Gestalt, die die Skizze für D zeigt («Panel
 *             rechts 22rem»). Das Panel ist Beiwerk und verhält sich auch so:
 *             kein Scrim, keine Modalität, keine Fokus-Falle; der Lesetext
 *             daneben bleibt scrollbar und anklickbar (Ä52, `usePopoverAutoZu`
 *             Modus `beiwerk`).
 *
 *             ── EHRLICHE EINSCHRÄNKUNG, GEMESSEN (Ä60, 17.8.2026) ──────────
 *             «Der Lesetext bleibt links sichtbar UND LESBAR» stand hier bis
 *             zum H3-Nachzug als unbedingte Zusage. Sie ist NICHT eingelöst:
 *             gemessen @1440 liegt die Lesespalte bei x 580…1200 und das Blatt
 *             bei x 1088…1440 — es verdeckt die äusseren **112 px jeder Zeile**
 *             (18 % der Spaltenbreite), die Zeilenenden fehlen also. Und keine
 *             feste Breite behebt das: @1440 misst der Rand rechts der Spalte
 *             240 px, @1280 nur 160 — dieselbe Arithmetik, die schon die
 *             angedockte Spalte unmöglich gemacht hat (Rechnung im Rahmen).
 *             Die Zusage gehört darum zum offenen Spalten-Entscheid (H4,
 *             Vollzugsvermerk H3); bis dahin sagt dieser Kommentar, was das
 *             Blatt WIRKLICH tut (§8 — ein Kommentar, der mehr verspricht als
 *             der Bau hält, ist die Sorte Beleg, die niemand nachprüft).
 *   'unten'   Bottom-Sheet über die ganze Breite — die Gestalt für H (Daumenzone)
 *             und für jede geteilte Fläche (dort verbietet die harte Regel eine
 *             dritte vertikale Fläche, und ein 22-rem-Streifen in einer
 *             600-px-Spalte liesse vom Text nichts übrig).
 *
 * `vollflaechig` = der Leser hat die ganze Seite für sich (Einzelansicht). Die
 * Prop heisst NICHT `imPane`, und das ist kein Kosmetik-Entscheid: die
 * Fundament-Sonde lässt `imPane` nur in den Wurzel-Dateien zu — zu Recht, denn
 * eine Datei, die den Hüllen-Zustand selbst liest, verzweigt auf ihn. Diese
 * Funktion verzweigt auf eine EIGENSCHAFT DER FLÄCHE, die ihr der Rahmen
 * mitteilt; die eine Übersetzung (`!umgebung.imPane`) steht dort. Der erste Bau
 * hiess hier `imPane` und wurde von der Sonde zurückgewiesen (17.8.2026).
 *
 * Gemessen 17.8.2026 am ersten Bildbogen: auf D @1440 wirkte das Bottom-Sheet
 * wie ein Vollbild-Dialog — es verdeckte den ganzen Gesetzestext, obwohl das
 * Panel Beiwerk ist. Genau das behebt die Unterscheidung.
 */
export function panelForm(stufe: KopfStufe, vollflaechig: boolean): 'rechts' | 'unten' {
  return vollflaechig && stufe === 'voll' ? 'rechts' : 'unten';
}

/** Höhe der Kopfzeile je Stufe (Design-Grundlage Kap. 3: H 48 px · D 56 px ·
 *  S 48 px). EINE Quelle — der Rahmen legt sie als `--leser-v3-kopf-h` aus und
 *  die Sprung-Offsets (`--nt-stick`) rechnen daraus (Risiko R1). */
export function kopfHoehe(stufe: KopfStufe): string {
  return stufe === 'voll' ? '3.5rem' : '3rem';
}

/**
 * Misst die Breite des Rahmens und liefert den Zuschnitt.
 *
 * CALLBACK-REF, NICHT `useRef` — und das ist hier kein Stilfrage, sondern ein
 * reproduzierter Fehler (gefunden 16.8.2026 im Browser, StPO @1440): der Rahmen
 * kehrt beim ersten Render früh mit dem Lade-Platzhalter zurück, das gemessene
 * Element existiert also noch gar nicht. Ein `useEffect` auf einem `useRef`
 * läuft genau einmal — mit `ref.current === null` —, hängt keinen Observer ein
 * und wird nie wieder gerufen, weil sich die Ref-Identität nicht ändert. Der
 * Kopf blieb dadurch dauerhaft auf dem Startwert stehen: bei 1440 px stand der
 * Handy-Zuschnitt. Ein Callback-Ref meldet das Element, SOBALD es entsteht, und
 * der Effekt läuft dann erneut.
 *
 * Startwert aus `window.innerWidth` statt aus `'voll'`: die V3-Hülle wird nicht
 * prerendert (R10), der erste Client-Render kennt den Viewport also bereits.
 * Ein pauschales `'voll'` liesse den Kopf auf einem Telefon einen Frame lang zu
 * hoch stehen — genau der Layout-Sprung, den §15.2 verbietet.
 *
 * IM PANE ist der Viewport aber die falsche Zahl: eine 620-px-Spalte in einem
 * 1440-px-Fenster startete auf `'voll'` (3.5rem) und fiel beim ersten
 * Observer-Lauf auf `'kompakt'` (3rem) — ein sichtbarer 8-px-Sprung der
 * Kopfzeile (Bug-Check «Nice», 16.8.2026). Darum misst der Callback-Ref SOFORT,
 * wenn das Element entsteht: er läuft im React-Commit, also vor dem Paint, und
 * ein `setState` dort wird noch im selben Frame verarbeitet. Der Startwert ist
 * damit nur noch der Wert für den einen Render, in dem es das Element gar nicht
 * gibt (Lade-Platzhalter).
 */
export function useKopfStufe(): { stufe: KopfStufe; kopfRef: (el: HTMLDivElement | null) => void } {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [stufe, setStufe] = useState<KopfStufe>(() =>
    kopfStufe(typeof window === 'undefined' ? 1200 : window.innerWidth));
  // Der zuletzt gemeldete Wert, damit der Observer nur bei echtem Stufenwechsel
  // einen Re-Render auslöst (jede Pixel-Änderung beim Ziehen des Pane-Gutters
  // feuert sonst — §15).
  const letzte = useRef<KopfStufe>(stufe);

  const uebernimm = useCallback((breite: number) => {
    // Breite 0 kommt vor, solange das Element noch nicht gelayoutet ist —
    // sie als «Handy» zu lesen wäre eine Messung von nichts.
    if (breite <= 0) return;
    const neu = kopfStufe(breite);
    if (neu === letzte.current) return;
    letzte.current = neu;
    setStufe(neu);
  }, []);

  const kopfRef = useCallback((el: HTMLDivElement | null) => {
    setEl(el);
    // Vor dem Paint messen — sonst zeigt das Pane einen Frame lang die Stufe
    // des VIEWPORTS (siehe Kopfkommentar). Stabile Identität via useCallback,
    // damit der Ref nicht bei jedem Render ab- und wieder angehängt wird.
    if (el) uebernimm(el.getBoundingClientRect().width);
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
  return { stufe, kopfRef };
}
