// ─── B4: Reader-seitiges Laden + Auflösen der Bezugs-Shards ──────────────────
//
// W2·7-BEZUG/B4. UI-naher Lade-/Auflöse-Helfer — KEINE Datenschicht: das Laden,
// Auflösen, Filtern und Zählen liegt vollständig in `lib/rechtsprechung/bezuege.ts`
// (B1) und wird hier nur konsumiert (§3). Was hier lebt, ist die Bedien-Frage
// «WANN wird geladen und für welchen Artikel gilt was» — und die ist reine
// Darstellung.
//
// ── ON DEMAND, NIE EAGER (§15) ─────────────────────────────────────────────
// Der Bezugs-Shard ist mit 717 KB (StPO, 65 KB gzip) rund fünfmal so schwer wie
// der schlanke Leitfall-Shard. Er wird darum NUR geladen, wenn der Nutzer die
// Facetten überhaupt erweitert hat (`istErweitert`) — im Grundzustand fasst der
// Reader ihn nie an und lädt weiter den schlanken Shard. Das Laden läuft im
// Leerlauf (`beiLeerlauf`, dasselbe Muster wie Leitfall-/Revisions-/Historie-
// Shard), nie im kritischen Pfad des Seitenaufbaus.
//
// ── EIN FETCH JE ERLASS, NICHT EINER JE ARTIKEL (§15.4) ────────────────────
// Grosse Erlasse haben ~1000 Artikel. Ein Fetch je Zeile war der belegte
// Idle-Herden-Befund aus W2·7-VZUI (>13 s Long-Tasks im 20×-Throttle). Darum:
// EIN Fetch auf Reader-Ebene, das Ergebnis als Prop an reine Renderer.
//
// ── WARUM «STATT», NICHT «ZUSÄTZLICH» (§5) ─────────────────────────────────
// Der Bezugs-Shard ist die OBERMENGE des Leitfall-Shards (Abgrenzungs-Kommentar
// in bezuege.ts). Beide zu laden hiesse, dieselben BGE-Kanten zweimal über die
// Leitung zu holen und zwei Wahrheiten am selben Artikel zu haben. Der Reader
// lädt deshalb GENAU EINEN der beiden — und wechselt mit der Facetten-Wahl.
// Nebeneffekt, der zählt: es gibt nur EIN Einwachsen der Zeile, also keinen
// zweiten Layout-Sprung beim Nachladen (CLS).

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ladeBezugsShard, bezuegeFuerArtikel, filtereBezuege, normArtikelToken,
  type Bezug, type BezugsShard,
} from '../../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { istErweitert, zuFacettenAuswahl } from './bezugAuswahl';
import { useBezugKantone, useBezugKlassen } from './leserOptionen';
import { beiLeerlauf } from '../../lib/leerlauf';

/** Was ein Artikel-Fuss zum Rendern braucht (siehe `BezuegeZeile`). */
export interface ArtikelBezuege {
  /** Kanten NACH Facetten-Filter, in Shard-Ordnung. */
  kanten: Bezug[];
  /** Vor-Deckel-Grundgesamtheit je Status an diesem Artikel (§8). */
  gesamt: Partial<Record<BezugStatus, number>>;
  /** Wie viele Kanten der Filter weggenommen hat (§8-Hinweis, kein stilles Nichts). */
  ausgeblendet: number;
}

/**
 * Bezüge des aktuellen Erlasses bereitstellen.
 *
 * Rückgabe:
 *  · `erweitert` — ist die Facetten-Wahl vom Grundzustand abgewichen? Der Reader
 *    entscheidet daran, ob er den SCHLANKEN Leitfall-Shard lädt (false) oder
 *    diesen hier (true). Der Wert ist auch dann true, wenn der Shard noch lädt
 *    oder 404 war — sonst flackerte die Darstellung zwischen beiden Formen hin
 *    und her, sobald der Fetch etwas später zurückkommt.
 *  · `bezuegeFuer(artikel)` — die gefilterten Kanten eines Artikels, oder
 *    `undefined`, solange nichts geladen ist bzw. der Erlass keinen Shard hat.
 *
 * Das Ergebnis ist an den Erlass-Key gebunden (wie beim Leitfall-Shard): ein
 * Pane-/Erlass-Wechsel liefert nie fremde Kanten.
 */
export function useBezuege(erlassKey: string | undefined): {
  erweitert: boolean;
  bezuegeFuer: (artikel: string) => ArtikelBezuege | undefined;
  /** Kantone, zu denen dieser Erlass wirklich Kanten hat (leer, solange der
   *  Shard nicht geladen ist) — speist den Kanton-Schalter im «Ansicht ▾». */
  kantoneVerfuegbar: string[];
} {
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  const erweitert = istErweitert(klassen);
  const [shard, setShard] = useState<{ key: string; shard: BezugsShard | null } | null>(null);

  useEffect(() => {
    // Grundzustand ⇒ GAR NICHT laden. Das ist der Kern der §15-Zusage: wer die
    // Facetten nie anfasst, zahlt für sie auch nichts.
    if (!erlassKey || !erweitert) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      void ladeBezugsShard(erlassKey).then((s) => { if (lebt) setShard({ key: erlassKey, shard: s }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [erlassKey, erweitert]);

  const bezuegeFuer = useCallback((artikel: string): ArtikelBezuege | undefined => {
    if (!erweitert || !erlassKey || shard?.key !== erlassKey || !shard.shard) return undefined;
    const s = shard.shard;
    const token = normArtikelToken(artikel);
    const alle = bezuegeFuerArtikel(s, token);
    if (alle.length === 0) return undefined;
    const kanten = filtereBezuege(alle, zuFacettenAuswahl(klassen, kantone));
    return {
      kanten,
      // Grundgesamtheit AUS DEM SHARD (Vor-Deckel), nicht aus der gerenderten
      // Liste — sonst wäre «8 von 8» das Beste, was die Zahl je sagen könnte.
      gesamt: s.gesamtProArtikel?.[token] ?? {},
      ausgeblendet: alle.length - kanten.length,
    };
  }, [erweitert, erlassKey, shard, klassen, kantone]);

  // useMemo, nicht bei jedem Render neu: die Ableitung geht über ALLE Dokumente
  // des Shards (bis ~1200 bei der StPO) und das Ergebnis hängt an einem Prop-
  // Pfad bis ins «Ansicht ▾»-Menü — eine neue Array-Identität je Render machte
  // dessen memo-Wrapper wirkungslos (§15.4).
  const kantoneVerfuegbar = useMemo(
    () => (shard?.key === erlassKey ? kantoneImShard(shard.shard) : []),
    [shard, erlassKey],
  );

  return { erweitert, bezuegeFuer, kantoneVerfuegbar };
}

/**
 * Welche Kantone kommen im Shard dieses Erlasses überhaupt vor?
 *
 * Der Kanton-Schalter im «Ansicht ▾»-Menü wird AUS DEN DATEN gebaut, nicht aus
 * einer Kantonsliste: ein Schalter für einen Kanton, zu dem dieser Erlass keine
 * Kante hat, wäre ein Steuerelement, das garantiert nichts findet (§13 F4) —
 * und zugleich die stille Behauptung, dort gäbe es Praxis, die wir nur gerade
 * ausgeblendet haben (§8). 'CH' ist kein Kanton und fällt weg.
 *
 * Rein abgeleitet, alphabetisch (§2 — nie nach Häufigkeit, das wäre eine
 * Gewichtung, die die Daten nicht tragen).
 */
export function kantoneImShard(shard: BezugsShard | null | undefined): string[] {
  if (!shard) return [];
  const aus = new Set<string>();
  for (const d of Object.values(shard.dokumente)) {
    if (d.facetten.kanton !== 'CH') aus.add(d.facetten.kanton);
  }
  return [...aus].sort();
}
