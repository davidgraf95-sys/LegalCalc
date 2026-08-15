// scripts/fremdmodule.d.ts — Umgebungs-Deklarationen für Fremdmodule ohne
// mitgelieferte Typen (QS-TYP-LUECKE 15.8.2026).
//
// ANLASS: `tsc -b` prüfte `scripts/**` bis 15.8.2026 gar nicht. Mit der Aufnahme
// meldete `scripts/check-farbwelt.ts` für `culori` und `apca-w3` TS7016
// («implicitly has an 'any' type») — beide Pakete liefern kein `.d.ts`.
//
// WARUM HIER STATT `@types/*`: die Alternative wäre eine neue devDependency
// gewesen; sie hätte package.json + Lockfile angefasst, wo aktuell zwei
// Dependabot-PRs offen stehen. Die Deklarationen unten bilden AUSSCHLIESSLICH
// die tatsächlich benutzte Oberfläche ab — nicht die vollen APIs. Wer mehr
// braucht, ergänzt hier oder holt echte Typen.
//
// KEIN `any` als Rückgabewert der Farb-Funktionen: die Farbobjekte tragen die
// Kanäle, die check-farbwelt.ts liest (l/c/h/r/g/b), alles optional — so bleibt
// ein Tippfehler im Kanalnamen ein Fehler und kein stiller `undefined`.

declare module 'culori' {
  /** Farbe in einem der von culori unterstützten Räume. Nur die hier gelesenen
   *  Kanäle sind benannt; `mode` trägt den Raum ('rgb' | 'oklab' | 'oklch' | …). */
  export interface CuloriFarbe {
    mode: string;
    /** Lightness (oklab/oklch) */
    l?: number;
    /** Chroma (oklch) */
    c?: number;
    /** Hue in Grad (oklch) — bei achromatischen Farben undefined. */
    h?: number;
    /** oklab-Gegenfarbachsen */
    a?: number;
    b?: number;
    /** sRGB-Kanäle 0..1 */
    r?: number;
    g?: number;
    alpha?: number;
  }

  type Eingang = CuloriFarbe | string | undefined;

  /** Konverter-Fabrik: `converter('oklch')` liefert die Umrechnung in den Raum.
   *  Je Raum sind die Kanäle des ZIELRAUMS garantiert gesetzt — nur `h` bleibt
   *  optional, weil achromatische Farben keinen definierten Farbton haben (genau
   *  die Unterscheidung, die check-farbwelt.ts in `hueDrift` auswertet). */
  export function converter(mode: 'rgb'): (farbe: Eingang) => { mode: 'rgb'; r: number; g: number; b: number; alpha?: number };
  export function converter(mode: 'oklab'): (farbe: Eingang) => { mode: 'oklab'; l: number; a: number; b: number; alpha?: number };
  export function converter(mode: 'oklch'): (farbe: Eingang) => { mode: 'oklch'; l: number; c: number; h?: number; alpha?: number };
  export function converter(mode: string): (farbe: Eingang) => CuloriFarbe;

  /** CSS-Farbstring parsen; `undefined`, wenn nicht parsebar. */
  export function parse(css: string): CuloriFarbe | undefined;

  /** WCAG-2-Kontrastverhältnis (1..21). */
  export function wcagContrast(a: CuloriFarbe | string, b: CuloriFarbe | string): number;
}

declare module 'apca-w3' {
  /** APCA-Lc. Gibt je nach Aufruf Zahl oder formatierten String zurück — die
   *  Aufrufstelle in check-farbwelt.ts schiebt das Ergebnis durch `Number()`. */
  export function calcAPCA(text: string, hintergrund: string): number | string;
}
