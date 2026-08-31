// scripts/datenhaltung/suche-rang.test.ts
// QS-BASIS (d) K2 — RANKING-PARITÄT des Edge-/DB-Weges.
//
// Das Gegenstück zu src/tests/suche/rankingTestset.test.ts: DASSELBE S4-Testset,
// aber gegen den DB-Weg (fts_artikel + suche-kern-SQL) statt gegen FlexSearch +
// artikelRanking. Lokal gegen daten/normtext.db-Bausteine, nicht gegen Turso — der
// SQL-Kern ist derselbe, den api/suche.ts an die Replika schickt (§5).
//
// WARUM ES DIESE DATEI BRAUCHT. Nach der K1-Recall-Erweiterung FAND der Edge-Weg die
// Kernartikel — aber an unbrauchbarer Stelle. Gemessen am 31.8.2026 mit bm25 und
// Feldgewichten, ohne topische Stufung:
//
//   «Miete»      → OR 253 auf Rang 128 von 165 · OR 267 auf Rang 111
//   «Verjährung» → OR 127 auf Rang  89 von 259
//   «Eigentum»   → ZGB 641 auf Rang 466 von 658
//
// Diese Zahlen haben die Bau-Richtung umgedreht: der naheliegende Weg — die
// Edge-Zeilen clientseitig durch `artikelRanking.rangiere()` schicken — kann nicht
// funktionieren, weil er nur das zurückgegebene Fenster (max. 50 Zeilen) umsortiert.
// Ein Re-Ranking rettet keinen Kandidaten, den die Abfrage nie geliefert hat.
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel } from './ingest';
import { baueFtsArtikel } from './fts';
import { sucheArtikel, MAX_LIMIT, KERNERLASSE } from './suche';

let db: DatabaseSync;

beforeAll(() => {
  db = oeffneDb();
  frischesSchema(db, 'normtext');
  ingestNormtext(db);
  ingestNormtextZiel(db);
  baueFtsArtikel(db);
  // Budget wie in suche.test.ts begründet (QS-E2E-STABIL, Messung 14.8.2026):
  // der Hook baut die volle Normtext-DB aus den echten Quellen.
}, 95000);

afterAll(() => {
  db?.close();
});

/** 0-basierter Rang des erwarteten Artikels, -1 = nicht im Fenster. */
function rang(query: string, erlassKey: string, artId: string): number {
  const a = sucheArtikel(db, query, { limit: MAX_LIMIT });
  return a.treffer.findIndex((t) => t.id === `art:${erlassKey}:${artId}`);
}

// DASSELBE Testset wie src/tests/suche/rankingTestset.test.ts — bewusst wörtlich
// gespiegelt, damit beide Wege am gleichen Massstab gemessen werden. Unterschied nur
// in der Artikel-Kennung: dort das Index-Token `a` («253»), hier die DB-`art_id`
// («art_253»), weil die Treffer-id des DB-Weges daraus gebaut wird.
const TESTSET: { q: string; k: string; artId: string; maxRang: number }[] = [
  { q: 'Miete', k: 'OR', artId: 'art_253', maxRang: 2 },
  { q: 'Verjährung', k: 'OR', artId: 'art_127', maxRang: 5 },
  { q: 'Verjährung', k: 'OR', artId: 'art_60', maxRang: 2 },
  { q: 'Kündigung', k: 'OR', artId: 'art_271', maxRang: 3 },
  { q: 'Werkvertrag', k: 'OR', artId: 'art_363', maxRang: 2 },
  { q: 'Notwehr', k: 'STGB', artId: 'art_15', maxRang: 4 },
  { q: 'Mäklervertrag', k: 'OR', artId: 'art_412', maxRang: 3 },
  { q: 'Bürgschaft', k: 'OR', artId: 'art_492', maxRang: 3 },
];

describe('K2 Ranking-Parität: S4-Testset gegen den Edge-/DB-Weg', () => {
  it('metrik: Rang des erwarteten Kernartikels je Query', () => {
    const zeilen = TESTSET.map(({ q, k, artId, maxRang }) => {
      const r = rang(q, k, artId);
      return `  «${q}» → ${k} ${artId}: Rang ${r < 0 ? '—' : r + 1} (erlaubt Top-${maxRang})`;
    });
    console.log('K2 Edge-Ranking-Metrik:\n' + zeilen.join('\n'));
    expect(zeilen.length).toBe(TESTSET.length);
  });

  for (const { q, k, artId, maxRang } of TESTSET) {
    it(`«${q}» hebt ${k} ${artId} in die Top-${maxRang}`, () => {
      const r = rang(q, k, artId);
      expect(r, `${k} ${artId} gar nicht im Fenster (Recall-Defekt, nicht Rang-Defekt)`).toBeGreaterThanOrEqual(0);
      expect(r, `${k} ${artId} auf Rang ${r + 1} > erlaubtem Top-${maxRang}`).toBeLessThan(maxRang);
    });
  }

  it('«Verjährung»: OR 127 steht vor jedem Nicht-OR-Treffer', () => {
    const top = sucheArtikel(db, 'Verjährung', { limit: 8 }).treffer;
    const orRang = top.findIndex((t) => t.id === 'art:OR:art_127');
    expect(orRang).toBeGreaterThanOrEqual(0);
    const ersterNichtOr = top.findIndex((t) => !t.id.startsWith('art:OR:'));
    if (ersterNichtOr >= 0) expect(orRang).toBeLessThan(ersterNichtOr);
  });

  it('deterministisch: zwei Läufe derselben Query liefern identische Reihenfolge (§2)', () => {
    const a = sucheArtikel(db, 'Miete', { limit: 20 }).treffer.map((t) => t.id);
    const b = sucheArtikel(db, 'Miete', { limit: 20 }).treffer.map((t) => t.id);
    expect(a).toEqual(b);
  });

  it('topische Stufung ändert die Treffermenge NICHT, nur ihre Ordnung', () => {
    // Die Stufung darf ausschliesslich sortieren. Verlöre sie Treffer, wäre aus einer
    // Rang-Änderung stillschweigend eine Recall-Änderung geworden — genau der Fehler,
    // den K1 gerade behoben hat.
    for (const q of ['Miete', 'Verjährung', 'Eigentum']) {
      const gesamt = sucheArtikel(db, q, { limit: 1 }).gesamt;
      const gesehen = new Set<string>();
      for (let off = 0; off < gesamt; off += MAX_LIMIT) {
        for (const t of sucheArtikel(db, q, { limit: MAX_LIMIT, offset: off }).treffer) gesehen.add(t.id);
      }
      expect(gesehen.size, `«${q}»: Pagination deckt nicht alle ${gesamt} Treffer`).toBe(gesamt);
    }
  });
});

describe('K2 Spiegel-Pflicht: die zwei Rang-Implementierungen dürfen nicht auseinanderlaufen', () => {
  it('KERNERLASSE in suche-kern.ts == KERNERLASSE in artikelRanking.ts', async () => {
    // Die Rang-Politik steht an zwei Stellen (SQL für den Edge-Weg, TypeScript für den
    // statischen Weg) — auflösbar wäre das nur über einen Import aus scripts/ nach src/,
    // den es im Produktivcode nirgends gibt und der Build-Code ins Client-Bundle zöge.
    // Statt die Doppelung zu verstecken, wird sie hier bewacht: dieser Test ist der
    // einzige Ort, an dem beide Seiten zusammenkommen (ein TEST darf die Grenze queren).
    const client = await import('../../src/lib/suche/artikelRanking');
    expect(client.KERNERLASSE_FUER_SPIEGELPRUEFUNG).toEqual(KERNERLASSE);
  });
});
