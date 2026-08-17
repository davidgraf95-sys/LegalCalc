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
  /** ── Die FÜHRENDEN Krumen-Stufen «Gesetze › Bund ›». Fallen als erstes. ───
   *  Hiess bis 17.8.2026 `sektion` und trug nur «Gesetze ›»: die Ebene-Stufe
   *  («Bund», «Kanton BS», «International») stand in der App-Krumen-Leiste
   *  darüber, die A-2 abgelöst hat. Seither trägt die Kopfzeile die ganze Kette
   *  — aus EINER Quelle (`erlassAnsicht.brotkrume`, die auch die Ebene aus dem
   *  Datenmodell ableitet statt aus `if (bund)`).
   *  EIN Feld für beide Stufen und nicht zwei: sie beantworten dieselbe Frage
   *  («woher komme ich»), und wo der Platz für die eine nicht reicht, reicht er
   *  für die andere auch nicht — zwei Flags, die nie auseinandergehen können,
   *  wären ein Tor, das nicht scheitern kann (§6.7/§17).
   *
   *  ── V2 (Nachzug 17.8.2026) · SIE FÄLLT NICHT MEHR GANZ, SIE SCHRUMPFT ─────
   *  Das Feld war bis hierher ein `boolean`: unter 900 px Elementbreite (Handy
   *  @390, JEDES Pane unter 900 px) gab es gar keine Krume. Solange die
   *  App-Krumen-Leiste darüberstand, fing sie das auf — seit A-2 steht dort
   *  nichts mehr, und der einzige Weg nach oben war das ✕ («Gesetz schliessen»),
   *  das auf die Übersicht springt und die Ebene überspringt. Ein Zuschnitt, der
   *  auf zwei von drei Breiten die Aufwärts-Navigation entfernt, ist keiner.
   *  DARUM DREI WERTE — und ausdrücklich KEIN zweites Flag daneben:
   *    'voll'  die ganze Kette «Gesetze › Bund ›»;
   *    'kurz'  EIN klickbarer Rücksprung «‹ Gesetze» — die erste Stufe derselben
   *            Kette, aus derselben Quelle (`erlassAnsicht.brotkrume`), nie ein
   *            zweites Mal getextet.
   *  Einen dritten Wert «weg» gibt es nicht: die Krume fällt auf KEINER Breite
   *  ganz aus, und genau das prüft `leser-v3-kopfstufen.test.ts` über jede Breite
   *  von 280 bis 2000 px — eine Aussage über den Rückgabewert, kein abwesender
   *  Code (§6.7).
   *  Die Kopf-ZEILE wächst dadurch nicht: der Rücksprung steht IN der Ort-Zone
   *  (Design-Grundlage Kap. 6, ≤ 4 Elemente), die Höhe bleibt
   *  `--leser-v3-kopf-h`, und das Suchfeld bleibt oberstes Element des klebenden
   *  Blocks (Ä19). */
  krume: 'voll' | 'kurz';
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
   * ── H4-II (17./18.8.2026) · ER SCHRUMPFT, ER FÄLLT NICHT ──────────────────
   * Das Feld war bis hierher ein `boolean` und auf `mini` `false`: die
   * Design-Grundlage Kap. 6 deckelt die Ruhezustand-Kopfzeile auf VIER
   * Elemente, und dort standen bereits Ort · ☰ · ··· · ✕. Die Randlasche, die
   * den Zähler auf dem Handy ersetzen sollte, ist im H3-Nachzug gestrichen
   * worden (sie lag gemessen 16 px IM Normtext) — seither führte auf `mini`
   * kein Öffner mehr in der Kopfzeile zur Rechtsprechung. Gemessen
   * 17.8.2026 @390 (StPO Art. 429): `[data-v3-panel-oeffner]` sichtbar **0**,
   * der Weg über «···» → «Entscheide & Kontext …» kostete **2 Taps** gegen
   * einen auf D/S (NM-2 des Kontaktbogens H4, dort der Flip-Blocker).
   *
   * DARUM ZWEI WERTE statt eines Flags — dieselbe Bauform wie `krume` (V2), und
   * aus demselben Grund: ein Zuschnitt, der eine Handlung auf einer von drei
   * Breiten ENTFERNT, ist keiner.
   *   'voll'     «⚖ 14 Entscheide» — Ikone, Zahl, Zähl-Substantiv;
   *   'kompakt'  «⚖ 14» — Ikone und Zahl, ohne Wort. Gemessen @390 bleiben in
   *              der Ort-Zone 115 px frei (Zeile 350 px, Ort-Inhalt 144 px,
   *              Griff-Zone 84 px); der Chip misst 24 px ohne und rund 45 px
   *              mit Zahl.
   *              EHRLICHER REST, gemessen 18.8.2026: im RUHEZUSTAND trägt er
   *              nur die Ikone — die Zahl kennt niemand, bevor der Bezugs-Shard
   *              geladen ist, und eine erfundene 0 verbietet §8
   *              (`panelModell.oeffnerLabelKompakt`, dieselbe Schranke wie bei
   *              `oeffnerLabel`, das auf D/S solange «Rechtsprechung» schreibt).
   *              Er ist damit auf `mini` bis zum ersten Öffnen ein reines Icon,
   *              und die zweite Hälfte der Design-Grundlage Kap. 6 («≤ 2 reine
   *              Icons») bleibt @390 mit ⚖ · ☰ · ··· gerissen — genauso wie
   *              vorher mit ☰ · ··· · ✕. Kein Rückschritt, aber auch kein
   *              Fortschritt; als offener Punkt im Kontaktbogen geführt.
   * Einen dritten Wert «weg» gibt es nicht, und genau das prüft
   * `leser-v3-kopfstufen.test.ts` über jede Breite — eine Aussage über den
   * Rückgabewert, nicht über abwesenden Code (§6.7).
   *
   * DAS ELEMENT-BUDGET HÄLT TROTZDEM: auf `mini` weicht dafür das ✕, weil es
   * dort das Duplikat des sichtbaren Rücksprungs «‹ Gesetze» ist — siehe
   * `zeigeSchliessKreuz` unten.
   */
  panel: 'voll' | 'kompakt';
}

export function kopfElemente(stufe: KopfStufe): KopfElemente {
  return {
    krume: stufe === 'voll' ? 'voll' : 'kurz',
    volltitel: stufe === 'voll',
    kuerzel: true,
    artikel: true,
    ansicht: true,
    panel: stufe === 'mini' ? 'kompakt' : 'voll',
  };
}

/**
 * Trägt die Kopfzeile ihr eigenes ✕ («Gesetz schliessen — zur Übersicht»)?
 *
 * ── DER BEFUND, GEMESSEN 17.8.2026 ──────────────────────────────────────────
 * Das ✕ navigiert auf `/gesetze`. Genau dorthin führt auch die erste Stufe der
 * Krume, die seit dem V2-Nachzug auf JEDER Breite in derselben Kopfzeile steht
 * — als volle Kette «Gesetze › Bund ›» oder als Rücksprung «‹ Gesetze»
 * (`erlassAnsicht.brotkrume`, `to: '/gesetze'`). Zwei Bedienelemente, ein Ziel,
 * eine Zeile. Das ist derselbe §5-Befund, der Ä56 erledigt hat, nur an der
 * anderen Ecke der Zeile.
 *
 * Zwei Lagen machen ihn zum echten Mangel, und nur dort weicht das ✕:
 *
 *   IM PANE (Ä46). Gemessen im Split @1600: je Pane ZWEI sichtbare ✕, 44 px
 *   übereinander (Griffleiste y = 69 «Hauptfenster schliessen» / «‹BGFA›
 *   schliessen», V3-Kopf y = 113 «Gesetz schliessen»), unterscheidbar allein
 *   am Accessible Name. Eine Inhaltsseite kann ihr eigenes Fenster nicht
 *   schliessen — das ✕ gehört der Fenster-Steuerung; die INHALTS-Handlung
 *   («zurück zur Übersicht») bleibt, aber sie zeigt sich als benanntes Wort in
 *   der Ort-Zone statt als zweites gleiches Zeichen (§8).
 *
 *   AUF `mini`. Dort ist die Zeile 350 px breit und die Design-Grundlage
 *   Kap. 6 deckelt sie auf vier Elemente. Mit dem Zähler-Chip (oben) wären es
 *   fünf. Von den fünf ist das ✕ das einzige, dessen Handlung nebenan schon
 *   sichtbar steht — es weicht, und die Zeile bleibt bei vier: Ort · ⚖ · ☰ ·
 *   ··· (gemessen 18.8.2026 an StPO und BS-640.100). Die zweite Hälfte des
 *   Deckels («≤ 2 reine Icons») ist damit NICHT eingelöst und war es vorher
 *   auch nicht — siehe den ehrlichen Rest am Feld `panel` oben.
 *
 * `vollflaechig` und nicht `imPane`: dieselbe Begründung wie bei `panelForm`
 * — die Fundament-Sonde lässt `imPane` nur in den Wurzel-Dateien zu, und diese
 * Funktion verzweigt auf eine EIGENSCHAFT DER FLÄCHE, die ihr der Rahmen
 * mitteilt.
 *
 * §7-ABWEICHUNG, offengelegt: der Auftrag zu Ä46 sagt «Einzelansicht bleibt bei
 * 1». Auf `voll`/`kompakt` ist sie das; auf `mini` sinkt sie auf 0, weil das
 * Element-Budget sonst nicht zu halten ist. Verloren geht dabei nichts — das
 * Ziel `/gesetze` steht dort als beschrifteter Rücksprung, und ein Wort ist
 * eine bessere Auskunft als ein Zeichen.
 */
export function zeigeSchliessKreuz(stufe: KopfStufe, vollflaechig: boolean): boolean {
  return vollflaechig && stufe !== 'mini';
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
 *             (18 % der Spaltenbreite; @1280: 192, @1024: 320), die Zeilenenden
 *             fehlen also. Und keine feste Breite behebt das: @1440 misst der
 *             Rand rechts der Spalte 240 px, @1280 nur 160.
 *             ── SEIT Ä60 (c) IST DIESE FUNKTION NICHT MEHR DAS LETZTE WORT ──
 *             David-Entscheid 17.8.2026: der Leser-Rahmen wird breiter, und
 *             `rahmenSpalten.rahmenBild` gibt dem Blatt dort eine EIGENE Spur
 *             (`'spalte'`). `'rechts'` bleibt die Gestalt für den ENGEN Rahmen
 *             — Fenster unter 1024 px, ausgeklappte App-Seitenleiste —, und
 *             dort gilt die Messreihe oben unverändert. Dieser Kommentar sagt
 *             sie darum weiter, statt sie wegzuglätten (§8).
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
