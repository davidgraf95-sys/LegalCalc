import { useEffect, useMemo, useState } from 'react';
import { ladeLeitfallShard, type LeitfallShard } from '../../lib/rechtsprechung/norm-index';
import { ladeKantenShard, type KantenShard } from '../../lib/materialien/kanten-shard';
import { artikelWerkzeugGruppen } from '../../lib/normtext/werkzeuge';
import { normArtikelToken } from '../../lib/rechtsprechung/bezuege';
import { beiLeerlauf } from '../../lib/leerlauf';
import type { ArtikelRevision } from '../../lib/verzahnung/artikel-revisionen';
import type { StrukturMap } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { ArtikelKontextAnsicht, KontextVerweis } from '../../lib/kontext';
import { internerErlassFuerSr } from './helpers';

// ═══ ABSCHNITT · Artikel-Kontext (W2·19-GLIEDERUNG/S7, Bau-Spec §5.2) ════════
//
// Der WEGWEISER zum aktiven Artikel: «Wieviel Praxis gibt es dazu, wann wurde er
// zuletzt geändert, wohin verweist er, welches Werkzeug gehört dazu?» Das DETAIL
// bleibt am Artikelfuss und in den bestehenden Panel-Gruppen (§5 SSoT) — diese
// Ansicht zeigt Zahlen und Sprünge, nie eine zweite Liste derselben Sachen.
//
// KEIN NEUER DATENWEG ÜBER DIE LEITUNG (§15.3): beide Shards, die hier geladen
// werden, holt das KontextPanel für seine eigenen Gruppen ohnehin — und beide
// Loader haben einen modulweiten Promise-Cache (norm-index.ts, kanten-shard.ts).
// Es entsteht also KEIN zweiter Fetch, nur eine zweite Projektion derselben
// Bytes. Geladen wird im Leerlauf (`beiLeerlauf`, dasselbe Muster wie Leitfall-/
// Revisions-/Historie-Shard des Readers), nie im kritischen Pfad.
//
// WARUM NICHT `gesamtProArtikel` AUS DEM BEZUGS-SHARD (Bau-Spec §5.2 nennt ihn):
// Der Bezugs-Shard wiegt bis 300 KB gzip (BGG) und wird nach Davids Vorgabe vom
// 28.7.2026 NUR geladen, wenn eine Instanz-Facette aktiv ist (bezuegeLaden.ts).
// Ihn für eine Zahl in der Seitenleiste eager zu holen, kehrte genau diesen
// Entscheid um. Der Leitfall-Shard ist die schlanke Projektion derselben Quelle,
// liegt für das Panel ohnehin im Cache — und die Zahl wird entsprechend ehrlich
// beschriftet («erfasste Leitentscheide»), nicht als Gesamtpraxis ausgegeben (§8).
//
// §15.2/CLS: die Ansicht hat IMMER dieselbe Zeilenzahl (vier Rollen, jede mit
// ihrem ehrlichen Leer-Satz). Ein Artikelwechsel tauscht nur Text in Zeilen, die
// schon stehen — er kann nichts verschieben. Die Höhe nagelt zusätzlich
// `.lc-artikelkontext` fest (index.css).

// Die TYPEN liegen in `src/lib/kontext.ts` — das KontextPanel (Komponenten-
// Schicht) muss die Form kennen dürfen, ohne in die Seiten-Schicht hinauf zu
// importieren (check:zyklen). Gebaut wird die Ansicht hier.
export type { ArtikelKontextAnsicht, KontextVerweis } from '../../lib/kontext';

/** Erste (kleinste) Artikelnummer eines Tokens — «20_a» → 20, «annex_1» → null. */
function artikelNummer(token: string): number | null {
  const m = /^(\d+)/.exec(token);
  return m ? Number.parseInt(m[1], 10) : null;
}

/**
 * Ausgehende Verweise EINES Artikels, rein abgeleitet aus dem, was der Reader
 * ohnehin hält: der Delegationsnorm-Verweis `grundlage` (Verordnung →
 * Trägergesetz, G23/M8) und die Erlass-Verweise der amtlichen Fussnoten
 * (`links[].intern` beim Kanton, `links[].rs` beim Bund). Dedupliziert über das
 * Label; Reihenfolge = Grundlage zuerst, dann Dokumentreihenfolge der Fussnoten.
 *
 * §7/§8: Es wird NICHTS aufgelöst, was nicht belegt ist — ein SR-Verweis auf
 * einen Erlass, den wir nicht im Volltext halten, behält den amtlichen Link
 * statt eines toten internen Pfads.
 */
export function ausgehendeVerweise(
  eintrag: NormSnapshot | undefined,
  struktur: StrukturMap | null,
  token: string,
): KontextVerweis[] {
  const out: KontextVerweis[] = [];
  const gesehen = new Set<string>();
  const nimm = (v: KontextVerweis) => {
    if (!v.label || gesehen.has(v.label)) return;
    gesehen.add(v.label);
    out.push(v);
  };
  if (eintrag?.grundlage) nimm({ label: eintrag.grundlage });
  for (const fn of struktur?.[token]?.fussnoten ?? []) {
    for (const l of fn.links) {
      if (l.intern) {
        nimm({ label: l.label, pfad: `/gesetze/${l.intern.ebene}/${encodeURIComponent(l.intern.key)}`, url: l.url });
        continue;
      }
      if (!l.rs) continue;
      const intern = internerErlassFuerSr(l.rs);
      nimm({
        label: l.label,
        pfad: intern ? `/gesetze/${intern.ebene}/${encodeURIComponent(intern.key)}` : undefined,
        url: l.url,
      });
    }
  }
  return out;
}

/** Artikelscharfe Material-Dokumente aus dem Kanten-Shard (je Dokument eines). */
export function materialienAmArtikel(shard: KantenShard | null, token: string): number {
  if (!shard) return 0;
  const kanon = normArtikelToken(token);
  const dok = new Set<string>();
  for (const k of shard.kanten) if (k.artikel && normArtikelToken(k.artikel) === kanon) dok.add(k.dok);
  return dok.size;
}

/** Leitentscheide am Artikel aus dem Schaufenster-Shard. */
export function leitentscheideAmArtikel(shard: LeitfallShard | null, token: string): number {
  return shard?.proArtikel[normArtikelToken(token)]?.length ?? 0;
}

/**
 * Der Artikel-Kontext des AKTIVEN Artikels. Ein Hook im Leser (nicht im Panel),
 * damit die gegatete Gruppe eine reine Prop bleibt und nichts in den
 * Entscheid-Leser lecken kann (Bau-Spec §5.2).
 *
 * Die Aktualisierung braucht KEINEN eigenen Takt: `aktivToken` kommt aus dem
 * bereits entprellten Scroll-Spy (`aktArtikelTimer`, inhalt-hooks) — ein
 * zweiter Timer daneben wäre eine zweite Wahrheit über «wo bin ich» (§5).
 */
export function useArtikelKontext({ erlass, token, label, eintraege, struktur, revision, onSprung }: {
  erlass: BrowseErlass | null;
  /** Aktiver Artikel-Token aus dem Scroll-Spy; `null` = noch keine Leseposition. */
  token: string | null;
  /** Amtliches Label des aktiven Artikels («Art. 41»). */
  label: string | null;
  eintraege: NormSnapshot[] | null;
  struktur: StrukturMap | null;
  /** `revisionFuer(token)` des Readers — kein zweiter Shard-Zugriff (§5). */
  revision: ArtikelRevision | null | undefined;
  onSprung?: (token: string) => void;
}): ArtikelKontextAnsicht | null {
  const key = erlass?.key;
  const [leitfall, setLeitfall] = useState<{ key: string; shard: LeitfallShard | null } | null>(null);
  const [kanten, setKanten] = useState<{ key: string; shard: KantenShard | null } | null>(null);
  useEffect(() => {
    if (!key) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      void ladeLeitfallShard(key).then((s) => { if (lebt) setLeitfall({ key, shard: s }); });
      void ladeKantenShard(key).then((s) => { if (lebt) setKanten({ key, shard: s }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [key]);

  // Snapshot-Eintrag des aktiven Artikels — EINE Map je Einträge-Satz statt einer
  // linearen Suche je Render (§15.4, grosse Erlasse haben ~1000 Artikel).
  const eintragByToken = useMemo(
    () => new Map((eintraege ?? []).map((e) => [e.artikel, e])),
    [eintraege],
  );
  const werkzeugGruppen = useMemo(() => (key ? artikelWerkzeugGruppen(key) : []), [key]);

  return useMemo<ArtikelKontextAnsicht | null>(() => {
    if (!erlass) return null;
    if (!token) return { label: '', token: '', verweise: [] };
    const nr = artikelNummer(token);
    const gruppe = nr === null ? undefined : werkzeugGruppen.find((g) => nr >= g.von && nr <= g.bis);
    return {
      label: label ?? '',
      token,
      leitentscheide: leitfall?.key === erlass.key ? leitentscheideAmArtikel(leitfall.shard, token) : undefined,
      materialien: kanten?.key === erlass.key ? materialienAmArtikel(kanten.shard, token) : undefined,
      revision,
      verweise: ausgehendeVerweise(eintragByToken.get(token), struktur, token),
      werkzeugGruppe: gruppe?.label,
      onSprung: onSprung ? () => onSprung(token) : undefined,
    };
  }, [erlass, token, label, leitfall, kanten, revision, eintragByToken, struktur, werkzeugGruppen, onSprung]);
}
