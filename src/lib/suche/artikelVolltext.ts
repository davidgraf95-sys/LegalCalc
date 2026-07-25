import type { SuchTreffer } from '../universalSuche';
import { sucherTerme, rangiere, type RankEintrag } from './artikelRanking';

// ─── Artikel-Volltextsuche (ROADMAP Schritt 5, FlexSearch) ──────────────────
//
// LAZY: FlexSearch-Lib UND der Artikel-Index werden erst beim ERSTEN Aufruf dynamisch
// geladen und client-seitig zu einem Index gebaut — nie im Haupt-Bundle (§3/§6.4:
// eigener Chunk, nur Ladezeitpunkt). Danach gecacht. Term-/Zitat-Suche (z. B.
// «243 ZPO», «Notwehr»), KEINE semantische Suche — deklinationsabhängige Phrasen
// treffen unscharf (§8, ehrlich kommuniziert).
//
// UI-NAV S4: FlexSearch liefert nur noch den RECALL (Kandidatenmenge); die
// Reihenfolge bestimmt die deterministische Relevanz-Schicht artikelRanking.ts
// (Sachüberschrift-Boost + Termfrequenz + Kernerlass-Priorität + Synonyme). Feld
// `m` (Marginalie/Gliederung) macht Alltagsbegriffe wie «Miete» auffindbar, die
// im Artikeltext nie vorkommen (K10: dasselbe Daten-Sidecar, das der Reader nutzt).

interface IndexEintrag extends RankEintrag {
  k: string; ku: string; a: string; l: string; m: string; n: string; g: string; t: string; tb: string; f: string;
  /** Ebene des Erlasses — trägt den href auf die richtige Route. */
  eb: 'bund' | 'kanton';
  /** Kantonskürzel («AG») bei eb==='kanton', sonst ''. */
  kt: string;
}

// Kandidaten-Pool: deutlich grösser als das Anzeige-Limit, damit die Re-Rangierung
// die wirklich relevanten Treffer aus einer breiten Recall-Menge heben kann.
const POOL = 300;

let suchFn: ((q: string, limit?: number) => SuchTreffer[]) | null = null;
let ladePromise: Promise<(q: string, limit?: number) => SuchTreffer[]> | null = null;

/** Liefert (lazy, gecacht) die synchrone Artikel-Suchfunktion. */
export function ladeArtikelSuche(): Promise<(q: string, limit?: number) => SuchTreffer[]> {
  if (suchFn) return Promise.resolve(suchFn);
  if (!ladePromise) ladePromise = baue();
  return ladePromise;
}

function snippet(text: string, q: string): string {
  const lower = text.toLowerCase();
  const term = q.toLowerCase().split(/\s+/).find((w) => w.length > 2 && lower.includes(w));
  if (!term) return text.length > 120 ? text.slice(0, 120).trimEnd() + ' …' : text;
  const i = lower.indexOf(term);
  const start = Math.max(0, i - 45);
  const ende = Math.min(text.length, start + 130);
  return (start > 0 ? '… ' : '') + text.slice(start, ende).trim() + (ende < text.length ? ' …' : '');
}

function treffer(e: IndexEintrag, q: string): SuchTreffer {
  // HERKUNFT EHRLICH (§8, W2·5): Seit der Kanton im selben Index liegt, muss ein
  // kantonaler Treffer als kantonal lesbar sein — sonst liest sich «§ 1
  // Anwaltstarif» wie Bundesrecht. Zwei Träger, bewusst redundant (dasselbe
  // Muster wie gesetzGruppe in universalSuche.ts):
  //   · Label-Suffix « · AG» — steht auch dort, wo keine Marke gerendert wird.
  //   · Marke «AG» OHNE `redundant` — die Bund-Marke «Gesetzestext» ist auf
  //     Mobile ausgeblendet (redundant zum Gruppentitel), das Kantonskürzel
  //     trägt dagegen Information und muss auf JEDER Breite sichtbar bleiben.
  const kantonal = e.eb === 'kanton' && e.kt !== '';
  return {
    id: `art:${e.k}:${e.a}`,
    // Label: Anzeige-Kürzel (e.ku, «StGB»); href: ROUTEN-Key (e.k, «STGB»).
    label: kantonal ? `${e.l} ${e.ku} · ${e.kt}` : `${e.l} ${e.ku}`,
    untertitel: snippet(e.t, q),
    marke: kantonal
      ? { text: e.kt, ton: 'soft' as const }
      : { text: 'Gesetzestext', ton: 'soft' as const, redundant: true },
    href: `/gesetze/${e.eb}/${encodeURIComponent(e.k)}#art-${e.a}`,
  };
}

// Minimal-Typen für die FlexSearch-Document-Oberfläche (die Lib bringt keine
// passenden ESM-Typen für diese Nutzung mit).
interface DocLike {
  add(doc: { id: number; t: string; l: string; m: string; n: string; g: string; tb: string; f: string }): void;
  search(q: string, opt: { limit: number; suggest: boolean }): { field: string; result: (number | string)[] }[];
}
type FlexLike = {
  Document: new (cfg: unknown) => DocLike;
  Charset?: { LatinBalance?: unknown };
};

/**
 * Baut die synchrone Suchfunktion aus den Index-Einträgen + der FlexSearch-Lib.
 * Herausgezogen (§5), damit der Query-Testset-Test (src/tests/suche/…) exakt
 * dieselbe Pipeline (Recall + Re-Rangierung) gegen den echten Korpus fahren kann.
 */
export function baueSuchFn(eintraege: IndexEintrag[], FlexSearch: FlexLike): (q: string, limit?: number) => SuchTreffer[] {
  const Document = FlexSearch.Document;
  const Charset = FlexSearch.Charset;
  const neuesDoc = () => new Document({
    document: {
      id: 'id',
      index: [
        { field: 't', tokenize: 'forward' },
        { field: 'l', tokenize: 'forward' },
        // S4: Marginalie (primär + nachrangig) + Gliederung als eigene Recall-
        // Felder — «Miete» findet so «Achter Titel: Die Miete», auch wo der
        // Artikeltext das Wort nie führt.
        { field: 'm', tokenize: 'forward' },
        { field: 'n', tokenize: 'forward' },
        { field: 'g', tokenize: 'forward' },
        // G-SUCH: Tabellen-Tier (Tabellenzellen + Bild-Alt + grundlage) und
        // Fussnoten-Body als eigene Recall-Felder — findet Werte, die NUR in
        // einer Tabelle oder Fussnote stehen (Korpus-Suche fand sie bisher nie).
        { field: 'tb', tokenize: 'forward' },
        { field: 'f', tokenize: 'forward' },
      ],
    },
    encoder: Charset?.LatinBalance,
  });

  // EIN INDEX JE EBENE (W2·5) — nicht ein gemeinsamer.
  //
  // Gemessen am 25.7.2026, und der Grund für diese Aufteilung: FlexSearch kappt
  // JE FELD bei `limit`. In einem gemeinsamen Index teilen sich Bund und Kanton
  // dieses eine Kontingent — die 29 055 kantonalen Artikel drückten OR 253
  // («Miete» ist dort NUR über die Gliederung «Achter Titel: Die Miete»
  // erreichbar) im g-Feld von Rang 259 auf 339 und damit aus dem 300er-Fenster:
  // der zentrale Mietrechts-Artikel war über «Miete» nicht mehr auffindbar.
  //
  // Mit einem eigenen Recall-Kontingent je Ebene ist der Bund-Recall EXAKT der
  // von vorher — er hängt nicht mehr davon ab, wie viel kantonales Recht im
  // Korpus liegt. Jeder weitere Kanton kann die Bund-Trefferlage damit nicht
  // mehr verschlechtern (§1: Vollständigkeit vor Sparsamkeit; §6: der Zuwachs
  // verschlechtert Bestehendes nicht). Die Re-Rangierung sieht danach beide
  // Mengen und ordnet sie deterministisch (artikelRanking: Bund vor Kanton bei
  // gleicher Themennähe).
  const indizes: { eb: 'bund' | 'kanton'; doc: DocLike }[] = [];
  const docFuer = new Map<string, DocLike>();
  for (const eb of ['bund', 'kanton'] as const) {
    const doc = neuesDoc();
    docFuer.set(eb, doc);
    indizes.push({ eb, doc });
  }
  eintraege.forEach((e, i) => {
    // Unbekannte/fehlende Ebene landet im Bund-Index statt im Nichts — ein
    // Eintrag darf nie unauffindbar werden, nur weil sein Ebenen-Feld fehlt (§8).
    const doc = docFuer.get(e.eb) ?? docFuer.get('bund')!;
    doc.add({
      id: i,
      // Kürzel UND Routen-Key mitindexieren (z. B. «StGB» und «STGB», «ArGV 1»/«ARGV_1»).
      t: (e.l + ' ' + e.ku + ' ' + e.k + ' ' + e.t).toLowerCase(),
      l: (e.l + ' ' + e.ku + ' ' + e.k).toLowerCase(),
      m: e.m.toLowerCase(),
      n: e.n.toLowerCase(),
      g: e.g.toLowerCase(),
      tb: (e.tb ?? '').toLowerCase(),
      f: (e.f ?? '').toLowerCase(),
    });
  });

  // Feld-Priorität im Recall: Marginalie/Gliederung ZUERST einsammeln, damit
  // topische Treffer nicht von der (oft grösseren) Textmenge aus dem Pool
  // gedrängt werden. Kritisch für Fälle wie OR 253, dessen Artikeltext das Wort
  // «Miete» nie führt — er ist NUR über die Gliederung «Die Miete» auffindbar.
  // tb/f sammeln NACH dem Haupttext ein (niedrigster Recall-Rang): ein reiner
  // Tabellen-/Fussnoten-Treffer soll topische und Haupttext-Treffer nicht aus dem
  // Pool drängen. Tabelle vor Fussnote (Feld-Gewichtung t > m > n > g > tb > f).
  const FELD_PRIO: Record<string, number> = { m: 0, n: 1, g: 2, l: 3, t: 4, tb: 5, f: 6 };

  return (q: string, limit = 40): SuchTreffer[] => {
    // RECALL: Original-Query + Vokabular-Synonyme (OCL-portiert, §2-deterministisch)
    // über alle Felder sammeln — grosser Pool, damit die Re-Rangierung die besten
    // Treffer heben kann (z. B. «vaterschaftsurlaub» → «Urlaub … Geburt»).
    const { orig, syn } = sucherTerme(q);
    const terme = [q.toLowerCase(), ...orig, ...syn];
    const gesehen = new Set<number>();
    const kandidaten: IndexEintrag[] = [];
    for (const term of terme) {
      if (kandidaten.length >= POOL) break;
      // Je Ebene das VOLLE Kontingent (POOL je Feld) — die Ebenen konkurrieren
      // nicht um dieselben Plätze. Bund zuerst eingesammelt, damit die
      // Ankunftsordnung der rein textuellen Stufe (rangiere, Gruppe B) die
      // bisherige bleibt.
      for (const { doc } of indizes) {
        const buckets = doc.search(term, { limit: POOL, suggest: true })
          .slice()
          .sort((a, b) => (FELD_PRIO[a.field] ?? 9) - (FELD_PRIO[b.field] ?? 9));
        for (const bucket of buckets) {
          for (const id of bucket.result) {
            const n = id as number;
            if (!gesehen.has(n)) { gesehen.add(n); kandidaten.push(eintraege[n]); }
          }
        }
      }
    }
    // RE-RANGIERUNG (S4): deterministische Relevanz statt FlexSearch-Roh-Ordnung.
    return rangiere(kandidaten, q, limit).map((e) => treffer(e, q));
  };
}

async function baue(): Promise<(q: string, limit?: number) => SuchTreffer[]> {
  const [flex, daten] = await Promise.all([
    import('flexsearch'),
    fetch(import.meta.env.BASE_URL + 'such-index/artikel.json').then((r) => {
      if (!r.ok) throw new Error('Index ' + r.status);
      return r.json() as Promise<{ eintraege: IndexEintrag[] }>;
    }),
  ]);
  const FlexSearch = ((flex as unknown as { default?: unknown }).default ?? flex) as FlexLike;
  suchFn = baueSuchFn(daten.eintraege, FlexSearch);
  return suchFn;
}
