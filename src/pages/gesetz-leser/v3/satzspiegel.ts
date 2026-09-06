import { createContext, useContext } from 'react';

// ═══ W2·24-R4 · DER SATZSPIEGEL (Marginalie links, Randnotizen rechts) ══════
//
// Referenzbild (`abnahme/design-identitaet/vorschlag-freigegeben.html`, Seite
// «Gesetzesleser»): links eine 150-px-Marginalie mit Randtitel und
// Registerfarben-Strich, rechts eine 210-px-Spalte mit den Bezügen als
// Randnotizen. Beide sind DARSTELLUNG derselben Daten, die der Artikel heute
// schon führt (§6 (e) des Fahrplans: «keine neue Logik, kein neuer Ladepfad»).
//
// ── WARUM DIE SCHWELLE AN DER LESE-ZELLE HÄNGT UND NICHT AN `@3xl/pane` ─────
// Der Fahrplan (§6 (c)) nennt `@3xl/pane` (48 rem) als Schwelle. Gemessen ist
// das die Breite des PANE-Scrollers — die Lese-Zelle ist schmaler, und zwar um
// genau die Gliederungsspur (18 rem offen, 2.25 rem als Schiene) und die
// Blatt-Spur (22 rem), wenn sie steht. Eine Schwelle auf die Pane-Breite
// gerechnet ist darum bei offener Gliederung um 19.25 rem zu grosszügig: der
// Satzspiegel spränge auf, wo der Text keine 30 ch mehr behielte. Diese Datei
// `rahmenSpalten.ts` KENNT die Zellenbreite bereits (es rechnet sie für
// `lesemassMaxRem` aus denselben Grössen) und reicht sie hierher — die
// Schwelle hängt darum an ihr. Absicht des Fahrplans
// («die Marginalie darf den Text nicht quetschen») unverändert, Massstab
// präziser; offengelegte Abweichung (§7).
//
// ── DIE ZAHLEN ──────────────────────────────────────────────────────────────
/** Breite der Marginalienspalte (rem) = 150 px im Referenzbild. */
const SPUR_MARGINALIE = 9.375;
/** Breite der Randnotiz-Spalte (rem) = 210 px im Referenzbild. */
const SPUR_RANDNOTIZ = 13.125;
/** Rinne zwischen Satzspiegel-Spalten (rem) = 36 px im Referenzbild. */
const SPUR_RINNE = 2.25;
/**
 * Textbreite, die der Satzspiegel dem Normtext SCHULDET (rem).
 *
 * ── HERGELEITET AUS DEM REFERENZBILD, NICHT AUS DEM IST-DECKEL ─────────────
 * Erster Ansatz war der Ist-Wert: 37 rem = die 591 px, die der Zeilenmass-
 * Deckel dem Text in der Vorgabestufe heute gibt (`index.css`, Block
 * «ZEILENMASS-DECKEL AM TEXTKÖRPER»). GEMESSEN am gebauten Stand (OR @1440,
 * Gliederung als Spalte) ist die Lese-Zelle aber 764 px breit — mit
 * Marginalie und Rinne (186 px) bräuchte diese Schwelle 777 px. Sie hätte den
 * Satzspiegel also in der VORGABELAGE des häufigsten Fensters um 13 px
 * verfehlt: gebaut, aber nie zu sehen.
 *
 * Der Fehler lag im Massstab. Das Referenzbild (`abnahme/design-identitaet/
 * vorschlag-freigegeben.html`, `.norm { max-width: 62ch }`) setzt den Text
 * neben der Marginalie auf **62 Zeichen** — schmaler als die 68 des heutigen
 * Zeilenmass-Deckels, und das ist Absicht: ein Satzspiegel mit Marginalie
 * BRAUCHT eine engere Textspalte, sonst ist es kein Satzspiegel, sondern eine
 * breite Spalte mit etwas daneben. Und das Referenzbild ist das Mass (§5).
 *
 * 62 Zeichen in denselben Einheiten, in denen `--leser-zeilenmass` rechnet:
 *   62 × 0.4805 (mittlere Prosa-Zeichenbreite) × 1.0625 rem = 31.65 rem
 *   + 2.25 rem Absatznummer-Rinne (`pl-9`, trägt keinen Fliesstext)
 *   = 33.9 rem → aufgerundet 34.
 * Der Text WIRD dabei nicht auf 62 ch verengt — sein Deckel bleibt der
 * unveränderte `min(--leser-lesemass-max, --leser-zeilenmass)`. Die Zahl sagt
 * nur, ab wie viel Platz der Spiegel aufgeht; gemessen bekommt der Text @1440
 * mit Marginalie 578 px ≈ 66 ch, also mehr als die Referenz und nur 13 px
 * weniger als ohne sie.
 */
const TEXT_SOLL = 34;

/** Ausbaustufe des Satzspiegels — was neben dem Normtext Platz hat. */
export type Satzspiegel =
  /** Einspaltig: Randtitel als Zeile über dem Artikel, Bezüge als Zeile darunter (Ist-Form). */
  | 'zeile'
  /** Marginalie links steht; die Bezüge bleiben in der Zeilen-/Panel-Form. */
  | 'marg'
  /** Marginalie links UND Randnotizen rechts. */
  | 'voll';

/** Kleinste Lese-Zelle (rem), die die Marginalie trägt. */
export const SPIEGEL_MIN_MARG = SPUR_MARGINALIE + SPUR_RINNE + TEXT_SOLL;      // 48.625 rem = 778 px
/** Kleinste Lese-Zelle (rem), die zusätzlich die Randnotizen trägt. */
export const SPIEGEL_MIN_VOLL = SPIEGEL_MIN_MARG + SPUR_RINNE + SPUR_RANDNOTIZ; // 64 rem = 1024 px

/**
 * Der Satzspiegel, den der Leser gerade fährt.
 *
 * Kontext statt Prop, weil `ArtikelLeser` in vier Hüllen gerendert wird (V3-
 * Volltext, V3-Trefferliste, V1-Volltext, V1-Suchsicht) und nur EINE davon den
 * Rahmen kennt. Die Vorgabe ist die Ist-Form (`'zeile'`): wo kein Provider
 * steht — also in V1 —, ändert sich nichts (§6, Verhaltensneutralität).
 */
export const SatzspiegelKontext = createContext<Satzspiegel>('zeile');

/** Liest den Satzspiegel; ohne Provider die Ist-Form. */
export function useSatzspiegel(): Satzspiegel {
  return useContext(SatzspiegelKontext);
}

/**
 * Die Ausbaustufe zu einer gemessenen Lese-Zelle — rein, an jeder Breite
 * nachrechenbar (§2).
 *
 * @param zellePx  Breite der Lese-ZELLE in px — die Fläche, die dem Satzspiegel
 *                 nach Gliederungs- und Blatt-Spur bleibt (`rahmenSpalten.ts`
 *                 rechnet sie aus denselben Spur-Massen, die dort den Rahmen
 *                 setzen; §5 — eine Quelle für «wie breit ist eine Spur»).
 *                 `null`, solange nichts gemessen
 *                 ist. Dann gilt die Ist-Form: der Leser startet einspaltig und
 *                 baut den Spiegel erst auf, wenn die Breite belegt ist — nie
 *                 umgekehrt (ein Spiegel, der beim ersten Paint wieder
 *                 zusammenfällt, wäre ein Layout-Sprung).
 * @param remPx    Gemessene Wurzel-Schriftgrösse; die Schwellen stehen in rem,
 *                 weil der Schriftregler sie mitzieht.
 */
export function satzspiegelFuer(zellePx: number | null, remPx: number): Satzspiegel {
  if (zellePx == null) return 'zeile';
  if (zellePx >= SPIEGEL_MIN_VOLL * remPx) return 'voll';
  if (zellePx >= SPIEGEL_MIN_MARG * remPx) return 'marg';
  return 'zeile';
}

