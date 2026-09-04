import type { NormSnapshot } from '../../lib/normtext/typen';
import type { BildDaten, BildKachel } from './BildElemente';

// Bild-/Kachel-Felder eines Blocks (bild/bildKacheln) sind neu im Snapshot-Daten-
// format; die Render-Schicht liest sie über diese lokale Erweiterung des
// Snapshot-Block-Typs (wie TabSpalte — kein Import aus scripts/, §3). Additiv:
// bestehende Blöcke ohne die Felder rendern unverändert.
export type BildBlock = NormSnapshot['bloecke'][number] & { bild?: BildDaten; bildKacheln?: BildKachel[] };

/** Zitier-Kontext der Lesesicht: macht Absatz-/lit.-/Ziff.-Marken klickbar
 *  («Art. X Abs. Y lit. z ERLASS» kopieren). Im Popover undefiniert → unverändert.
 *  B-6 (QS-BASIS): `fassung`/`permalinkBasis` (optional) rüsten die inline-Kopie
 *  mit dem Stand-Ausweis (§7 a–d) nach; fehlen sie (z. B. Popover), bleibt die
 *  Marke bei der reinen Fundstelle — byte-gleich zu vorher. */
export interface ZitierKontext {
  artikelLabel: string;
  kuerzel: string;
  /** Konsolidierungs-/Fassungsdatum ISO des Erlasses (Stand-Ausweis). */
  fassung?: string;
  /** Permalink-Pfad inkl. #anker OHNE origin (origin kommt zur Klick-Zeit). */
  permalinkBasis?: string;
}

// M6-D: leere Self-Ziel-Map + No-op-Sprung für den Fremdgesetz-Chapeau-Kontext —
// dort gibt es kein «eigenes» Sprungziel; NormText routet bare «Art. N» allein über
// `fremdKuerzel` auf das Fremdgesetz (NormChip). Modul-konstant (keine Re-Allokation).
export const FREMD_LEER: Map<string, string> = new Map();
export const NOOP = (): void => {};

/** lit. (Buchstaben, Bund) vs. Ziff. (Zahlen, Kanton) anhand der Marke. */
export function litZiff(marke: string): string {
  return /^\d/.test(marke.trim()) ? 'Ziff.' : 'lit.';
}

/** Verschachtelungsstufe je Item. PRIMÄR aus der EXPLIZITEN `tiefe` des
 *  Snapshots (M6, §1): liefert Fedlex die Stufe mit, wird sie NICHT mehr aus
 *  dem Markentyp geraten — das Raten erzeugte falsche Zitate, wenn die
 *  Reihenfolge umgekehrt ist (Ziff. → lit. statt lit. → Ziff.).
 *  FALLBACK-Heuristik nur für Daten OHNE tiefe (Kanton-Snapshots, noch nicht
 *  re-segnete Bund-Erlasse): Bst (a,b,c) = Stufe 0; Ziff (1,2,3) NACH einem
 *  Bst = Stufe 1, sonst 0; Gedankenstrich = eine Stufe tiefer als das
 *  vorausgehende Item. EINE Stelle (§5) — genutzt für die block-lokale
 *  Darstellung UND die blockübergreifende Fortsetzungs-Kette der Bild-Blöcke. */
export function stufenFuer(items: Array<{ marke: string; tiefe?: number }>): number[] {
  const hatTiefe = items.some((it) => typeof it.tiefe === 'number');
  if (hatTiefe) return items.map((it) => it.tiefe ?? 0);
  const typ = (m: string) => /^[–—-]$/.test(m.trim()) ? 'strich' : /^\d/.test(m.trim()) ? 'ziff' : 'lit';
  const stufen: number[] = [];
  let sahLit = false, letzteNichtStrich = 0;
  for (const it of items) {
    const t = typ(it.marke);
    let lv: number;
    if (t === 'strich') lv = letzteNichtStrich + 1;
    else if (t === 'ziff') { lv = sahLit ? 1 : 0; letzteNichtStrich = lv; }
    else { lv = 0; sahLit = true; letzteNichtStrich = 0; }
    stufen.push(lv);
  }
  return stufen;
}

/** Stand-Ausweis-Basis (B-6): dieselbe Fassung + Permalink-Basis für alle Marken
 *  eines Artikels; der Abruf-Tag und der origin kommen zur Klick-Zeit dazu. */
export interface AusweisBasis { fassung?: string; permalinkBasis: string }

// FN-5: numerischer Nr-Vergleich («95» < «95a» < «96») für die stabile Reihung
// der End-Marker, wenn Rückfall-Kandidaten mit bestehenden zusammentreffen —
// gleiche Ordnung wie die fussAnzeige-Sortierung im ArtikelLeser (A43).
export function vglFnNr(a: string, b: string): number {
  const key = (nr: string): [number, string] => {
    const m = /^(\d+)([a-z]*)$/i.exec(nr.trim());
    return m ? [parseInt(m[1], 10), m[2].toLowerCase()] : [Number.POSITIVE_INFINITY, nr];
  };
  const ka = key(a), kb = key(b);
  return ka[0] - kb[0] || ka[1].localeCompare(kb[1]);
}
