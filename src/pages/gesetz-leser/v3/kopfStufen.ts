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
// ── A-8 (H4, 17.8.2026): DIE SCHWELLEN STEHEN NICHT MEHR HIER ──────────────
// Bis hierher trug diese Datei die Zahlen 900/640 UND die Messung selbst — und
// `istXl` (Ist-Hülle, 1024 px) entschied unabhängig davon über denselben Platz.
// Zwei Entscheider über eine Frage sind eine zweite Wahrheit (§5, Kap. 12 A-8).
// Seit A-8 liegt beides in `./useElementBreite`: dort die drei Schwellen, dort
// der ResizeObserver. Diese Datei ist nur noch der KOPF-Zuschnitt — sie
// übersetzt den Modus in ihre Stufen und sagt, was auf welcher Stufe steht.
// Verhalten unverändert: die Stufen liegen weiter an 640 und 900, bewiesen über
// jede Breite von 200 bis 2000 px in `src/tests/leser-v3-elementbreite.test.ts`.

import {
  SCHWELLE_D, SCHWELLE_S, modusFuer, useElementBreite, type Breitenmodus,
} from './useElementBreite';


/** Die drei Zuschnitte der Kopfzeile. Reihenfolge = abnehmender Platz. */
export type KopfStufe = 'voll' | 'kompakt' | 'mini';

/** Modus der einen Breiten-Quelle → Kopf-Zuschnitt. Die EINE Abbildung; sie
 *  steht als Tabelle da, damit ein Widerspruch zum Modus nicht in einer
 *  if-Kette versteckt entstehen kann. */
const STUFE_JE_MODUS: Record<Breitenmodus, KopfStufe> = {
  d: 'voll',
  s: 'kompakt',
  sheet: 'mini',
};

/** Grenze, ab der die Sektions-Krume «Gesetze» fällt (Kap. 4a) — Weiterleitung
 *  auf die eine Quelle, keine zweite Zahl. */
export const KOPF_SCHWELLE_KOMPAKT = SCHWELLE_D;
/** Grenze «H» der Skizze (Kap. 4): darunter der Handy-Zuschnitt. */
export const KOPF_SCHWELLE_MINI = SCHWELLE_S;

/** Breite (px) → Zuschnitt. Rein, monoton, an jeder Breite prüfbar. */
export function kopfStufe(breitePx: number): KopfStufe {
  return STUFE_JE_MODUS[modusFuer(breitePx)];
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
    sektion: stufe === 'voll',
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
 * Der Kopf-Zuschnitt der gemessenen Rahmenbreite.
 *
 * A-8 (17.8.2026): Messung und Schwellen sind nach `./useElementBreite`
 * gewandert — die Herleitung des Callback-Refs, des `border-box`-Observers und
 * des Startwerts aus `window.innerWidth` steht dort im Kopfkommentar. Hier
 * bleibt nur die Übersetzung Modus → Stufe. Der Name `kopfRef` bleibt, damit
 * `LeserRahmenV3` unverändert bleibt (der Rahmen hängt den Ref an sein
 * Wurzel-Element).
 */
export function useKopfStufe(): { stufe: KopfStufe; kopfRef: (el: HTMLDivElement | null) => void } {
  const { modus, messRef } = useElementBreite();
  return { stufe: STUFE_JE_MODUS[modus], kopfRef: messRef };
}
