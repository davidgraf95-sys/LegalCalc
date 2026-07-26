/**
 * FN-5/M14 (W2·5d): wortgenaue Fussnoten-Marker-Positionen — als SIDECAR-Daten,
 * die Haupt-Snapshots bleiben byte-unverändert (M14-Gating, FAHRPLAN-NORMTEXT-
 * DARSTELLUNG §M14: «Sidecar-Variante hält golden»).
 *
 * Verfahren (deterministisch, §2):
 *  1. Im Artikel-HTML wird jeder Fussnoten-Marker <sup><a href="#fn-…">N</a></sup>
 *     durch einen Platzhalter U+E000<id>U+E001 (Private Use Area) ersetzt — statt
 *     ihn wie `entferneFussnotenSups` zu löschen. Marker in <dt>-Marken werden
 *     entfernt (eine Wortposition in der Marke gibt es nicht; sie behalten das
 *     heutige Verhalten «Marker am Item»).
 *  2. Derselbe Parser (`parseArtikelInner`) läuft über das Platzhalter-HTML.
 *     Die Platzhalter überleben alle Normalisierungen (PUA-Zeichen sind weder
 *     Tag noch Whitespace noch Entity).
 *  3. Je Textfeld (Absatz-Text, Item-Text) wird der Platzhalter-Text gegen den
 *     REFERENZ-Text (unveränderter Parse = exakt der Snapshot-Wortlaut)
 *     ausgerichtet: Zwei-Zeiger-Abgleich, an Marker-Stellen ist begrenzte
 *     Whitespace-Elastizität erlaubt (die Original-Pipeline kollabiert den
 *     Leerraum um den gelöschten Marker). Gelingt die Ausrichtung nicht
 *     ZEICHENGENAU bis zum Ende, werden für dieses Textfeld KEINE Positionen
 *     emittiert — der Renderer fällt auf das heutige Verhalten (Marker am
 *     Absatz-/Item-Ende) zurück. Falsche Position = Amtstreue-Fehler; darum
 *     ist «kein Offset» immer dem «geratenen Offset» vorzuziehen (§1/§7).
 *
 * Ergebnis: fn-id → { b: Block-Index in e.bloecke, it?: Item-Index, o: Zeichen-
 * Offset im finalen Text }. Konsumiert von fussnoten-extrahiere.ts (Sidecar-Feld
 * `pos`) und dem Reader (ArtikelLeser/ArtikelBody: Marker an der Wortstelle).
 */
import { parseArtikelInner } from './extrahiere-fedlex';

export interface FnPos {
  /** Block-Index in `e.bloecke` (0-basiert, deckungsgleich mit dem Snapshot). */
  b: number;
  /** Item-Index innerhalb `bloecke[b].items` (nur bei Marker im Item-Text). */
  it?: number;
  /** Zeichen-Offset im finalen Text des Blocks bzw. Items (0 ≤ o ≤ l). */
  o: number;
  /** Länge des Zieltexts zur Generationszeit — Drift-Riegel: weicht die Länge
   *  im Reader ab (Sidecar ↔ Snapshot nicht aus demselben Lauf), wird der
   *  Offset verworfen und der Marker rendert am Absatz-/Item-Ende (§1/§7). */
  l: number;
}

const PUA_A = '\uE000';
const PUA_B = '\uE001';

/**
 * Marker-Ersetzungs-Regex: identische Form-Toleranz wie `entferneFussnotenSups`
 * (Whitespace/&nbsp;/<inl>-Wrapper), aber mit href-Capture der fn-id. Nicht-
 * Fussnoten-<sup><a> (ohne #fn-href) bleiben stehen und werden von den
 * unveränderten Pipeline-Aufrufen in parseArtikelInner wie im Referenz-Parse
 * entfernt — beide Parses bleiben dort deckungsgleich.
 */
const FN_SUP_RE =
  /<sup\b[^>]*>(?:\s|&nbsp;|<\/?inl>)*<a\b[^>]*\bhref="#(fn-[^"]+)"[^>]*>[\s\S]*?<\/a>(?:\s|&nbsp;|<\/?inl>)*<\/sup>/gi;

const PLATZHALTER_RE = /\uE000([^\uE001]*)\uE001/g;

/**
 * Richtet einen Platzhalter-Text am Referenz-Text aus und liefert je Marker den
 * Zeichen-Offset im Referenz-Text — oder null, wenn die Ausrichtung nicht
 * zeichengenau gelingt (dann kein Offset, Fallback aufs heutige Verhalten).
 * Exportiert für den Wort-Position-Check (Unit-Tests).
 */
export function richteMarkerAus(
  ph: string,
  ref: string,
): Array<{ id: string; o: number }> | null {
  const marker: Array<{ id: string; o: number }> = [];
  let i = 0;
  let j = 0;
  while (i < ph.length) {
    const c = ph[i];
    if (c === PUA_A) {
      const ende = ph.indexOf(PUA_B, i);
      if (ende < 0) return null;
      const id = ph.slice(i + 1, ende);
      i = ende + 1;
      // Stand der Marker im Quelltext beidseitig in Leerraum («wort ⁴ mehr»),
      // hat die Referenz den Leerraum kollabiert — der Marker klebt dann am
      // Wort DAVOR (vor dem verbleibenden Leerzeichen), wie auf Fedlex.
      let o = j;
      if (j > 0 && ref[j - 1] === ' ' && ph[i] === ' ') o = j - 1;
      marker.push({ id, o });
      // Junction-Elastizität: höchstens EIN überzähliges Leerzeichen je Seite
      // (die Pipeline kollabiert genau den Leerraum um den gelöschten Marker).
      if (i < ph.length && ph[i] === ' ' && ref[j] !== ' ') i++;
      else if (j < ref.length && ref[j] === ' ' && ph[i] !== ' ') j++;
      continue;
    }
    // Leerzeichen unmittelbar VOR einem Marker, das die Referenz getilgt hat
    // (z. B. Fallback-Pfad «wort ⁴.» → «wort.»): dem Marker-Junction überlassen.
    if (c === ' ' && ph[i + 1] === PUA_A && ref[j] !== ' ') {
      i++;
      continue;
    }
    if (c !== ref[j]) return null;
    i++;
    j++;
  }
  if (j !== ref.length) return null;
  return marker;
}

/** Platzhalter aus einem Text entfernen (für Struktur-/Markenvergleich). */
function ohnePlatzhalter(s: string): string {
  return s.replace(PLATZHALTER_RE, '');
}

/**
 * Berechnet je Fussnoten-id die wortgenaue Position im Snapshot-Block-Text.
 * `innerRoh` = Artikel-Body OHNE Fussnoten-Apparat und OHNE Kopf-<h6> (gleicher
 * Zuschnitt wie der A31a-Referenz-Parse in fussnoten-extrahiere.ts); `referenz`
 * = dessen unveränderte `bloecke` (byte-gleich zum Snapshot, Golden-bewiesen).
 * Erste Vorkommens-Position gewinnt (gleiches Dedupe wie extrahiereFussnoten).
 */
export function berechneFnPositionen(
  innerRoh: string,
  referenz: { bloecke: ReturnType<typeof parseArtikelInner>['bloecke'] },
): Map<string, FnPos> {
  const leer = new Map<string, FnPos>();
  if (!FN_SUP_RE.test(innerRoh)) return leer;
  FN_SUP_RE.lastIndex = 0;
  const mitPh = innerRoh
    .replace(FN_SUP_RE, (_m, id: string) => PUA_A + id + PUA_B)
    // Marker in <dt>-Marken: keine Wortposition möglich → entfernen (wie die
    // Referenz-Pipeline sie löscht); sie behalten das Item-Ende-Verhalten.
    .replace(/<dt[^>]*>[\s\S]*?<\/dt>/gi, (seg) => seg.replace(PLATZHALTER_RE, ''));
  let ph: ReturnType<typeof parseArtikelInner>;
  try {
    ph = parseArtikelInner(mitPh);
  } catch {
    return leer; // defensiv: Platzhalter-Parse scheitert → keine Offsets
  }
  const refB = referenz.bloecke;
  // Struktur-Gleichheit: die Platzhalter dürfen die Block-/Item-Struktur nicht
  // verändert haben, sonst wären Indizes nicht übertragbar → ganz aussteigen.
  if (ph.bloecke.length !== refB.length) return leer;
  const pos = new Map<string, FnPos>();
  const nimm = (id: string, p: FnPos) => {
    if (!pos.has(id)) pos.set(id, p);
  };
  for (let b = 0; b < refB.length; b++) {
    const pb = ph.bloecke[b];
    const rb = refB[b];
    if (pb.absatz !== rb.absatz) return leer;
    const pItems = pb.items ?? [];
    const rItems = rb.items ?? [];
    if (pItems.length !== rItems.length) return leer;
    if (pItems.some((it, j) => ohnePlatzhalter(it.marke) !== rItems[j].marke)) return leer;
    // Absatz-Text: Offsets nur bei zeichengenauer Ausrichtung UND nicht-leerem
    // Referenztext (in Tabellen-/Bild-Blöcken gibt es keine Wortstelle).
    if (pb.text.includes(PUA_A)) {
      const m = rb.text ? richteMarkerAus(pb.text, rb.text) : null;
      if (m) for (const { id, o } of m) nimm(id, { b, o, l: rb.text.length });
    }
    for (let j = 0; j < pItems.length; j++) {
      if (!pItems[j].text.includes(PUA_A)) continue;
      const m = rItems[j].text ? richteMarkerAus(pItems[j].text, rItems[j].text) : null;
      if (m) for (const { id, o } of m) nimm(id, { b, it: j, o, l: rItems[j].text.length });
    }
  }
  return pos;
}
