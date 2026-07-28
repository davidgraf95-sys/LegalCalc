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
// in bezuege.ts). Beide für DIESELBE Zeile zu laden hiesse, dieselben BGE-Kanten
// zweimal über die Leitung zu holen und zwei Wahrheiten am selben Artikel zu
// haben. Der ARTIKEL-FUSS speist sich deshalb aus genau einem der beiden und
// wechselt mit der Facetten-Wahl; es gibt nur EIN Einwachsen der Zeile, also
// keinen zweiten Layout-Sprung (CLS).
//
// EHRLICHE EINSCHRÄNKUNG (an der Netzwerk-Sonde gemessen, 28.7.2026): «kein
// norm-index-Fetch mehr» gilt NICHT für die Seite als Ganzes. Das KontextPanel
// (`components/kontext/KontextPanel.tsx`) lädt denselben Shard für seinen
// eigenen Zweck und ist von B4 unberührt — im erweiterten Zustand gehen daher
// weiterhin beide Dateien über die Leitung, nur eben für zwei verschiedene
// Flächen. Wer das zusammenlegen will, muss das KontextPanel umstellen; das ist
// bewusst NICHT Teil von B4 (fremde Fläche, eigener Schritt).

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ladeBezugsShard, bezuegeFuerArtikel, normArtikelToken,
  type Bezug, type BezugsShard,
} from '../../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { bauePraedikate, waehleBezuege } from './bezugAuswahl';
import { baueJahresHistogramm, type Histogramm, type Zeitbereich } from './bezugZeit';
import { holeBezugKlassen, useBezugBis, useBezugKantone, useBezugKlassen, useBezugVon } from './leserOptionen';
import { beiLeerlauf } from '../../lib/leerlauf';

/** Was ein Artikel-Fuss zum Rendern braucht (siehe `BezuegeZeile`). */
export interface ArtikelBezuege {
  /** Kanten NACH Facetten-Filter, in Shard-Ordnung. */
  kanten: Bezug[];
  /** Vor-Deckel-Grundgesamtheit je Status an diesem Artikel (§8). */
  gesamt: Partial<Record<BezugStatus, number>>;
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
  /** Ist überhaupt eine Facette aktiv? Nur dann wird geladen und gerendert. */
  aktiv: boolean;
  bezuegeFuer: (artikel: string) => ArtikelBezuege | undefined;
  /** Kantone, zu denen dieser Erlass wirklich Kanten hat (leer, solange der
   *  Shard nicht geladen ist) — speist den Kanton-Schalter im «Ansicht ▾». */
  kantoneVerfuegbar: string[];
  /** B5: Jahres-Verteilung der Kanten DIESES Erlasses für den Zeitstrahl. */
  histogramm: Histogramm;
  /** B5: der aktive Von-Bis-Bereich, für Steuerung und Kanten-Auswahl. */
  bereich: Zeitbereich;
} {
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  // B5: zwei Primitiv-Selektoren (Begründung in leserOptionen.ts) — das Objekt
  // entsteht memoisiert hier, damit es eine stabile Referenz für die
  // Abhängigkeits-Listen unten hat.
  const von = useBezugVon();
  const bis = useBezugBis();
  const bereich = useMemo<Zeitbereich>(() => ({ von, bis }), [von, bis]);
  // Vorgabe David 28.7.2026 («nur auflistung wenn aktiviert»): geladen wird,
  // sobald ÜBERHAUPT eine Facette aktiv ist — auch im Default (nur
  // Leitentscheide). Das ist kein Rückschritt gegenüber dem Bestand: die alte
  // V1a-Chip-Reihe lud dort faktisch ebenfalls einen Shard, nur den schlanken.
  // Sind ALLE Facetten aus, wird nichts geladen und nichts gerendert — dann
  // kostet die Verzahnung null Byte und null Pixel.
  const aktiv = klassen.length > 0;
  const [shard, setShard] = useState<{ key: string; shard: BezugsShard | null } | null>(null);

  useEffect(() => {
    if (!erlassKey) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      // Grundzustand ⇒ GAR NICHT laden. Das ist der Kern der §15-Zusage: wer die
      // Facetten nie anfasst, zahlt für sie auch nichts.
      //
      // Gefragt wird der MODULWERT, nicht der gerenderte `erweitert`: während der
      // Hydration liefert der Store noch den Default (Begründung an
      // `holeBezugKlassen`). Der Effekt läuft trotzdem auf `erweitert` als
      // Abhängigkeit — er soll ja erneut anlaufen, wenn der Nutzer umschaltet.
      if (holeBezugKlassen().length === 0) return;
      void ladeBezugsShard(erlassKey).then((s) => { if (lebt) setShard({ key: erlassKey, shard: s }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [erlassKey, aktiv]);

  const bezuegeFuer = useCallback((artikel: string): ArtikelBezuege | undefined => {
    if (!aktiv || !erlassKey || shard?.key !== erlassKey || !shard.shard) return undefined;
    const s = shard.shard;
    const token = normArtikelToken(artikel);
    const alle = bezuegeFuerArtikel(s, token);
    if (alle.length === 0) return undefined;
    // `waehleBezuege` statt `filtereBezuege` direkt: die LEERE Auswahl heisst
    // in der Datenschicht «keine Einschränkung», in dieser Bedienung aber
    // «alles abgewählt» (Begründung dort, mit reproduziertem Befund).
    //
    // B5: der Zeit-Bereich geht als weiteres Prädikat mit hinein — dieselbe
    // Stelle, dieselbe Auswahl. Ein zweiter Filter irgendwo weiter unten in der
    // Darstellung erzeugte eine zweite Auswahl-Wahrheit am selben Artikel (§5).
    const kanten = waehleBezuege(alle, klassen, kantone, bereich);
    return {
      kanten,
      // Grundgesamtheit AUS DEM SHARD (Vor-Deckel), nicht aus der gerenderten
      // Liste — sonst wäre «8 von 8» das Beste, was die Zahl je sagen könnte.
      //
      // §8/B5-Auflage: `gesamt` bleibt die Zahl OHNE Zeitfilter. Die Zahl neben
      // dem Gruppenkopf antwortet damit auf «wie viel gibt es zu diesem
      // Artikel», nicht auf «wie viel habe ich gerade eingestellt» — sonst
      // schrumpfte die Grundgesamtheit mit dem Filter mit und behauptete, es
      // gäbe weniger Praxis, als es gibt.
      gesamt: s.gesamtProArtikel?.[token] ?? {},
    };
  }, [aktiv, erlassKey, shard, klassen, kantone, bereich]);

  // useMemo, nicht bei jedem Render neu: die Ableitung geht über ALLE Dokumente
  // des Shards (bis ~1200 bei der StPO) und das Ergebnis hängt an einem Prop-
  // Pfad bis ins «Ansicht ▾»-Menü — eine neue Array-Identität je Render machte
  // dessen memo-Wrapper wirkungslos (§15.4).
  //
  // `shard != null` MUSS zuerst stehen und nicht bloss `shard?.key === erlassKey`:
  // solange kein Erlass geladen ist, sind BEIDE Seiten `undefined`, der Vergleich
  // ist wahr und der Zugriff auf `shard.shard` lief auf null («Cannot read
  // properties of null (reading 'shard')» — reproduziert 28.7.2026 im Dev-Server,
  // die ganze Leser-Seite fiel in die Fehlergrenze).
  const kantoneVerfuegbar = useMemo(
    () => (shard && erlassKey && shard.key === erlassKey ? kantoneImShard(shard.shard) : []),
    [shard, erlassKey],
  );

  // B5: Jahres-Verteilung für den Zeitstrahl. BEWUSST OHNE den Zeit-Bereich in
  // der Abhängigkeitsliste — der Zeitstrahl zeigt die Verteilung, AUS DER man
  // wählt, nicht das Ergebnis der eigenen Wahl. Ein Histogramm, das sich beim
  // Ziehen selbst umbaut, entzieht der Geste die Bezugsgrösse; man könnte eine
  // einmal enger gezogene Auswahl nicht mehr sehend erweitern.
  //
  // Die FACETTEN gehen hingegen ein: wer nur Leitentscheide zeigt, soll die
  // Verteilung der Leitentscheide sehen und nicht die aller 3207 Kanten der
  // StPO — sonst zöge er an Balken, die zu Entscheiden gehören, die er gar nicht
  // eingeschaltet hat (§8: keine Verteilung behaupten, die nicht die gezeigte ist).
  //
  // useMemo, nicht je Render: der Lauf geht über ALLE Kanten des Shards
  // (StPO 3207) — bei jedem Tastendruck im Datumsfeld wäre das eine vermeidbare
  // Runde (§15).
  const histogramm = useMemo<Histogramm>(() => {
    if (!aktiv || !shard || !erlassKey || shard.key !== erlassKey || !shard.shard) {
      return LEERES_HISTOGRAMM;
    }
    return histogrammAusShard(shard.shard, klassen, kantone);
  }, [aktiv, shard, erlassKey, klassen, kantone]);

  return { aktiv, bezuegeFuer, kantoneVerfuegbar, histogramm, bereich };
}

/** Geteilte Leer-Instanz: hält die Referenz stabil, solange nichts geladen ist. */
const LEERES_HISTOGRAMM: Histogramm = { balken: [], ohneJahr: 0 };

/**
 * Jahres-Verteilung ALLER Kanten eines Shards, gefiltert nach den aktiven
 * Facetten (ohne Zeit-Achse — siehe Aufruf-Kommentar).
 *
 * ZÄHLEINHEIT IST DIE KANTE, nicht das Dokument: ein Entscheid, der fünf Artikel
 * dieses Erlasses auslegt, ist an diesem Erlass fünfmal einschlägig. Die
 * Auflistung unter den Artikeln zählt genauso, und ein Zeitstrahl, der anders
 * zählte als die Liste darunter, wäre eine zweite Zahl-Wahrheit (§5). Die
 * Summen-Identität (Balken + `ohneJahr` = Kanten) ist im Test festgehalten.
 *
 * Rein (§2), exportiert für genau diesen Test.
 */
export function histogrammAusShard(
  shard: BezugsShard,
  klassen: readonly BezugStatus[],
  kantone: readonly string[],
): Histogramm {
  if (klassen.length === 0) return LEERES_HISTOGRAMM;
  const praedikate = bauePraedikate(klassen, kantone);
  const daten: string[] = [];
  for (const eintraege of Object.values(shard.proArtikel)) {
    for (const e of eintraege) {
      const kopf = shard.dokumente[e.key];
      // Eintrag ohne Dokument-Kopf wird ÜBERSPRUNGEN — genau wie in
      // `bezuegeFuerArtikel`, sonst zählte der Strahl Kanten, die die Liste
      // darunter gar nicht rendert.
      if (!kopf) continue;
      if (!praedikate.every((p) => p(kopf))) continue;
      daten.push(kopf.datum);
    }
  }
  return baueJahresHistogramm(daten);
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
