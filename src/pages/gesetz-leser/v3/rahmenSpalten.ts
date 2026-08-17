import { useCallback, useEffect, useState, type CSSProperties } from 'react';

// ═══ Ä60 (c) · WIE BREIT DER LESER IST UND WELCHE SPUREN ER TRÄGT ════════════
//
// David-Entscheid 17.8.2026 (Chat, wörtlich «ja und c, mach so»): von den drei
// Optionen des Spalten-Entscheids gilt **(c)** — der Rahmen des GESETZ-LESERS
// darf breiter werden als eine Textseite, damit Gesetzestext und Beiwerk-Blatt
// nebeneinander stehen statt übereinander. Kein anderer Seitentyp ist berührt:
// `max-w-content` (70 rem, `tailwind.config.js`) bleibt unverändert, die
// Aufweitung geschieht am Leser-Wurzelelement und nur dort.
//
// ── DER BEFUND, DEN DAS BEHEBT (Ä60/Ä59, gemessen 17./18.8.2026, StPO 429) ──
// Das rechts angeschlagene Blatt lag ÜBER dem Lesetext, weil der Rahmen auf
// 1072 px gedeckelt war, das Blatt aber am FENSTER klebt:
//
//   Viewport   Rahmen        Textabsatz     Blatt          verdeckt   Titel
//   1024        24… 999      372… 992        672…1024      320 px     328 px
//   1150        39…1111      435…1055        798…1150      257 px     313 px
//   1280       104…1176      500…1120        928…1280      192 px     248 px
//   1440       184…1256      580…1200       1088…1440      112 px     168 px
//   1920       424…1496      820…1440       1568…1920        0 px       0 px
//
// Erst ab 1920 px läuft das Blatt am Rahmen vorbei — auf jedem realen
// Laptop-Fenster fehlten die Zeilenenden. «Keine feste Blattbreite behebt das»
// (Vollzugsvermerk H3): der Rand rechts der Lesespalte misst @1440 240 px,
// @1280 nur 160 — die Arithmetik, nicht die Zahl, war der Defekt.
//
// ── DIE RECHNUNG, DIE DEN DECKEL SETZT ──────────────────────────────────────
// Der frühere Kommentar im Rahmen («KEINE DRITTE SPUR») rechnete richtig und
// zog den falschen Schluss: 18 rem Gliederung + 40 rem Lesemass + 22 rem Blatt
// samt zwei Abständen à 2 rem sind **84 rem**, der Seitenrahmen bot 67 rem
// (1072 px). Der Zweig war nicht unmöglich, ihm fehlten 272 px. Genau die gibt
// (c) ihm — und keinen Schritt mehr: `LESER_MAX_REM` IST diese Summe. Ein
// Rahmen, der breiter wäre als seine drei Spuren, wäre Fensterbreite für
// Fliesstext (Design-Grundlage Kap. 8 Nr. 7).
//
// ── DIE EINE SCHWELLE: «BEHÄLT DER TEXT SEIN VOLLES LESEMASS?» ──────────────
// Unterhalb von 84 rem passen die drei Spuren nicht zusammen. Statt den Text zu
// quetschen (bei 976 px Raum blieben ihm 272 px = ~30 ch) weicht die
// GLIEDERUNG auf ihre Schiene (2.25 rem) — dasselbe Bauteil, das Ä79 als «den
// einen Griff» festgehalten hat, und ein Klick zurück. Gemessen ergibt das:
//
//   Raum (px)   Spuren                        Lesespalte   ch (StPO)
//    976 (VP 1024)  Schiene · Text · Blatt        524 px      ~56
//   1102 (VP 1150)  Schiene · Text · Blatt        640 px       73  (voll)
//   1232 (VP 1280)  Schiene · Text · Blatt        640 px       73  (voll)
//   1344 (VP≥1392)  Gliederung · Text · Blatt     640 px       73  (voll)
//
// Der Text ist also ab 1150 px Fenster in KEINER Lage schmaler als heute, und
// unter 1024 px ändert sich nichts (dort trägt die Gliederung ohnehin ein
// Sheet, und das Blatt bleibt, was es war — David-Entscheid: «unter 1024 bleibt
// alles wie heute»).
//
// ── GEMESSEN WIRD DER RAUM, NICHT DAS EIGENE ELEMENT ────────────────────────
// `useElementBreite` misst das Wurzelelement — genau das, dessen Breite diese
// Datei VERSTELLT. Als Entscheidungsgrundlage wäre es eine Rückkopplung. Der
// `raum` ist darum die Breite, die die Lesefläche im `<main>` HÄTTE (Fenster
// bzw. Pane minus Aussenabstände, ohne Scrollbar); sie ändert sich, wenn das
// Fenster oder die App-Seitenleiste sich ändert, nie durch diese Datei selbst.

// ── WARUM DAS GRID AUCH EINGEKLAPPT STEHEN BLEIBT (David 16.8.2026) ─────────
// Befund am H1-Stand, @1440 reproduziert: klappte man die Gliederung ein,
// verschwand das Grid ganz. Die Lesespalte sprang um 175 px nach links
// (x 600 → 424) und gewann ganze 31 px Breite (641 → 672, mehr lässt das
// Lesemass nicht zu) — ein Sprung ohne Gewinn, und der einzige Weg zurück war
// ein unbeschriftetes 24-px-☰ an der GEGENÜBERLIEGENDEN Fensterkante (x = 1101).
// Darum bleibt die linke Spur immer stehen und wird zur Schiene (Ä79).

/** Breite der Gliederungsspalte (rem) — Ist-Wert des Rahmens, hier benannt. */
const SPUR_GLIEDERUNG = 18;
/** Breite der eingeklappten Gliederungs-Schiene (rem), `LeserGliederungSchiene`. */
const SPUR_SCHIENE = 2.25;
/** Breite des Beiwerk-Blatts (rem) — Kap. 4d «Panel rechts 22rem». */
const SPUR_BLATT = 22;
/** Abstand zwischen zwei Spuren (rem) = `gap-8`. */
const SPUR_ABSTAND = 2;
/** Lesemass der Lesespalte (rem) = `max-w-reading`, `LeserLesespalte`. */
const LESEMASS = 40;

/**
 * Deckel des Leser-Rahmens (rem) = die Summe seiner drei Spuren samt Abständen.
 * NICHT `max-w-content`: der gilt für jede andere Seite unverändert weiter.
 */
export const LESER_MAX_REM = SPUR_GLIEDERUNG + SPUR_ABSTAND + LESEMASS + SPUR_ABSTAND + SPUR_BLATT; // 84

/**
 * Kleinste Lesespalte, die das Blatt als Spur überhaupt rechtfertigt (rem).
 *
 * WOHER DIE ZAHL: 28 rem = 448 px sind bei gemessenen 8.5 px/ch (StPO, 17-px-
 * Stufe: 620 px Absatzbreite = 73 ch) rund **46 ch** — die Untergrenze, die die
 * Design-Grundlage für eine Lesespalte nennt. Sie greift real erst, wenn die
 * App-Seitenleiste ausgeklappt ist (Fenster 1200 px − 256 − 48 = 896 < 900);
 * ohne sie ist der Raum ab 1024 px Fenster immer ≥ 976 px. Ein Deckel, der
 * NIE greifen kann, wäre kein Deckel (§6.7) — dieser kann.
 */
const LESE_MIN = 28;
/** Raum (rem), unter dem das Blatt keine eigene Spur bekommt. */
const RAUM_MIN_BLATT = SPUR_SCHIENE + SPUR_ABSTAND + LESE_MIN + SPUR_ABSTAND + SPUR_BLATT; // 56.25

export interface RahmenRaum {
  /** Breite (px), die dem Leser im `<main>` zur Verfügung steht. */
  raumPx: number;
  /** Breite (px), die der Rahmen ohne Aufweitung hat (gedeckelte Elternbreite). */
  ruhePx: number;
  /** Gemessene Wurzel-Schriftgrösse (px) — der Schriftregler verstellt sie (R3). */
  remPx: number;
}

export interface RahmenLage {
  /** Gemessener Raum; `null`, solange nichts gemessen ist (dann bleibt alles wie bisher). */
  raum: RahmenRaum | null;
  /** Steht die Gliederung auf dieser Fläche überhaupt als Spalte zur Wahl? */
  spaltenLage: boolean;
  /** Hat der Nutzer die Gliederung offen? */
  tocOffen: boolean;
  /** Ist das Beiwerk-Blatt offen? */
  blattOffen: boolean;
  /** Gestalt, die das Blatt ohne eigene Spur hätte (`kopfStufen.panelForm`). */
  ruheForm: 'rechts' | 'unten';
}

export interface RahmenBild {
  /** Gestalt des Beiwerk-Blatts — `'spalte'` ist die neue, nicht überlagernde. */
  blattForm: 'rechts' | 'unten' | 'spalte';
  /** Steht die Gliederung als 18-rem-Spalte? */
  gliederungSpalte: boolean;
  /** Steht statt ihrer die schmale Schiene? */
  schiene: boolean;
  /** Muss ein Klick auf die Schiene das Blatt schliessen? (Es hat ihren Platz.) */
  schieneHoltPlatz: boolean;
  /** `grid-template-columns` der Lese-Zeile; `undefined` = kein Grid (wie bisher). */
  spalten: string | undefined;
  /** Aufweitung des Wurzelelements; `undefined` = unverändert wie bisher. */
  breite: CSSProperties | undefined;
}

/**
 * Die eine Entscheidung über Rahmenbreite und Spuren — rein, an jeder Breite
 * nachrechenbar (§2), Beweis in `src/tests/leser-v3-rahmenspalten.test.ts`.
 */
export function rahmenBild(lage: RahmenLage): RahmenBild {
  const { raum, spaltenLage, tocOffen, blattOffen, ruheForm } = lage;
  const rem = raum?.remPx ?? 16;
  const passt = raum != null && raum.raumPx >= RAUM_MIN_BLATT * rem;
  // Eine eigene Spur bekommt das Blatt nur dort, wo es sonst ÜBER dem Text läge
  // (`'rechts'`) — im Pane und auf dem Handy bleibt es das Bottom-Sheet, weil
  // dort die harte Regel «nie drei vertikale Flächen» gilt (Kap. 4d).
  const blattSpur = blattOffen && ruheForm === 'rechts' && spaltenLage && passt;
  // Die Gliederungsspalte bleibt genau so lange, wie der Text sein volles
  // Lesemass behält; darunter weicht sie auf ihre Schiene (Herleitung oben).
  const vollesLesemass = raum != null && raum.raumPx >= LESER_MAX_REM * rem;
  const gliederungSpalte = spaltenLage && tocOffen && (!blattSpur || vollesLesemass);
  const schiene = spaltenLage && !gliederungSpalte;

  return {
    blattForm: blattSpur ? 'spalte' : ruheForm,
    gliederungSpalte,
    schiene,
    schieneHoltPlatz: blattSpur && tocOffen && !gliederungSpalte,
    spalten: spaltenLage
      ? `${gliederungSpalte ? `${SPUR_GLIEDERUNG}rem` : `${SPUR_SCHIENE}rem`} minmax(0,1fr)`
        + (blattSpur ? ` ${SPUR_BLATT}rem` : '')
      : undefined,
    breite: blattSpur && raum ? aufweitung(raum, LESER_MAX_REM * rem) : undefined,
  };
}

/**
 * Die Aufweitung als Kasten-Rechnung.
 *
 * WARUM NICHT EINFACH ZENTRIERT: der Rahmen steht in einem zentrierten Eltern-
 * Kasten. Ihn beim Öffnen des Blatts neu zu zentrieren, schöbe den gelesenen
 * Text waagrecht weg — @1920 um 152 px, obwohl rechts 400 px frei sind. Der
 * Rahmen wächst darum ZUERST in den freien Rand rechts und rückt nur um den
 * Rest nach links (@1920: 0 px, @1440: 112 px). Der Text bleibt stehen, wo der
 * Platz es zulässt; das ist dieselbe Zusage wie die von `useStickAusgleich` für
 * die senkrechte Richtung.
 */
function aufweitung(raum: RahmenRaum, maxPx: number): CSSProperties | undefined {
  const breite = Math.min(maxPx, raum.raumPx);
  if (breite <= raum.ruhePx) return undefined; // kein Gewinn — nichts anfassen
  const linksHeute = (raum.raumPx - raum.ruhePx) / 2;
  const links = Math.min(linksHeute, raum.raumPx - breite);
  const dx = links - linksHeute; // ≤ 0
  return {
    // Als eigenes Token ausgelegt, damit die Zahl im Browser ablesbar ist und
    // eine spätere Regel sie lesen kann, ohne sie zu wiederholen (§5).
    '--leser-max-w': `${breite}px`,
    width: 'var(--leser-max-w)',
    marginInlineStart: `${dx}px`,
    // Der Kasten muss aufgehen: dx + Breite + Ende = Elternbreite. Ohne die
    // zweite Zahl löst der Browser die Übergleichung selbst auf — sichtbar
    // gleich, aber nicht mehr nachrechenbar.
    marginInlineEnd: `${raum.ruhePx - breite - dx}px`,
  } as CSSProperties;
}

/**
 * Misst den Raum am Elternkasten und am umgebenden `<main>`.
 *
 * `ruhePx` ist die INHALTSBREITE des Elternkastens — also genau die Breite, die
 * der Rahmen ohne Aufweitung hätte, unabhängig davon, wie viele neutrale
 * Zwischen-Container die Hülle einzieht. `raumPx` ist die Breite des `<main>`
 * abzüglich aller Polsterungen und Kanten auf dem Weg dorthin; `clientWidth`
 * lässt die Scrollbar aussen vor, `100vw` täte das nicht.
 */
function raumMessen(el: HTMLElement): RahmenRaum | null {
  const eltern = el.parentElement;
  if (!eltern) return null;
  const innen = (n: HTMLElement) => {
    const cs = getComputedStyle(n);
    return { pad: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) };
  };
  const ruhePx = eltern.clientWidth - innen(eltern).pad;
  let rand = 0;
  let lauf: HTMLElement | null = eltern;
  while (lauf && lauf.tagName !== 'MAIN') {
    rand += innen(lauf).pad;
    lauf = lauf.parentElement;
  }
  // Ohne `<main>` gibt es keine belastbare Aussenkante — dann NICHT aufweiten
  // (der Rahmen bleibt, was er heute ist), statt auf `100vw` zu raten.
  if (!lauf) return null;
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const raumPx = lauf.clientWidth - rand;
  if (!(raumPx > 0) || !(ruhePx > 0)) return null;
  return { raumPx, ruhePx, remPx };
}

function gleich(a: RahmenRaum | null, b: RahmenRaum | null): boolean {
  if (a === null || b === null) return a === b;
  return a.raumPx === b.raumPx && a.ruhePx === b.ruhePx && a.remPx === b.remPx;
}

/**
 * Der Mess-Ref des Rahmens.
 *
 * CALLBACK-REF und Messung im Commit — dieselbe Begründung und derselbe
 * reproduzierte Fehler wie bei `useElementBreite`: der Rahmen kehrt beim ersten
 * Render mit dem Lade-Platzhalter zurück, ein `useEffect` auf einem `useRef`
 * liefe genau einmal mit `null` und hinge nie einen Observer ein.
 *
 * Beobachtet werden BEIDE Kästen: das `<main>` (Fenster, Pane-Breite,
 * App-Seitenleiste) und der Elternkasten (er folgt dem Schriftregler, weil
 * `max-w-content` in rem misst — das `<main>` täte das nicht).
 */
export function useRahmenRaum(): {
  raum: RahmenRaum | null;
  raumRef: (el: HTMLDivElement | null) => void;
} {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [raum, setRaum] = useState<RahmenRaum | null>(null);

  const uebernimm = useCallback((ziel: HTMLElement) => {
    const neu = raumMessen(ziel);
    setRaum((alt) => (gleich(alt, neu) ? alt : neu));
  }, []);

  const raumRef = useCallback((ziel: HTMLDivElement | null) => {
    setEl(ziel);
    if (ziel) uebernimm(ziel);
  }, [uebernimm]);

  // KEINE Messung im Effekt-Körper (Lint `react-hooks/set-state-in-effect`, rot
  // gesehen im `npm run gate` vom 18.8.2026): ein `setState` direkt im Effekt
  // erzeugt eine Kaskaden-Renderung. Und es wäre die DRITTE Messung derselben
  // Zahl — der Callback-Ref oben misst beim Einhängen, und `ResizeObserver`
  // liefert für jedes neu beobachtete Ziel von sich aus eine erste Meldung.
  // Verhalten bleibt damit gleich; bewiesen an `leser-v3-rahmen` (a)–(f2), die
  // ALLE eine gemessene Aufweitung voraussetzen und ohne sie rot werden.
  useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const haupt = el.closest('main');
    const eltern = el.parentElement;
    const ro = new ResizeObserver(() => uebernimm(el));
    if (haupt) ro.observe(haupt, { box: 'border-box' });
    if (eltern) ro.observe(eltern, { box: 'border-box' });
    return () => ro.disconnect();
  }, [el, uebernimm]);

  return { raum, raumRef };
}
