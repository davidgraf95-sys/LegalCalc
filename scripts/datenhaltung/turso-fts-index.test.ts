// scripts/datenhaltung/turso-fts-index.test.ts
// Hält die zwei Annahmen fest, auf denen der Shadow-Transport des Syncs steht
// (QS-CODE-TURSO). Beide sind empirisch, nicht dogmatisch — und beide würden, wenn sie
// kippen, einen FALSCHEN Suchindex live stellen, ohne dass eine Zeilenzahl auffiele.
//
// Der Test läuft VOLLSTÄNDIG LOKAL (node:sqlite, in-memory). Er braucht kein Turso, kein
// Netz und kein Token — genau darum kann er im normalen Test-Lauf mitfahren.
import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { leseFtsSchatten } from './turso-fts-index';

const TOKENIZER = 'unicode61 remove_diacritics 2';
const STANDALONE = (t: string) =>
  `CREATE VIRTUAL TABLE ${t} USING fts5(id UNINDEXED, titel, regeste, text, quelle_url UNINDEXED, tokenize='${TOKENIZER}')`;

/** Genug Zeilen, dass FTS5 mehrere Segmente anlegt und mergt — mit einem einzigen Segment
 *  wäre der Test blind für genau den Fall, der den Index kompliziert macht. */
function zeilen(n: number): Array<[string, string, string, string, string]> {
  const aus: Array<[string, string, string, string, string]> = [];
  for (let i = 1; i <= n; i++) {
    aus.push([
      `bund/bge/${140 + (i % 9)}_III_${i}`,
      `BGE ${140 + (i % 9)} III ${i}`,
      `Regeste ${i}: Verjährung und Kündigung, Art. ${i} OR.`,
      `Die Beschwerde ist ${i % 3 === 0 ? 'gutzuheissen' : 'abzuweisen'}. ` +
        `Rechtsöffnung, Verjährung, Kündigung — «Zitat» mit "Anführung" und \\ Backslash. ` +
        `Füllwort${i % 41} `.repeat(30),
      `https://example.invalid/${i}`,
    ]);
  }
  return aus;
}

/** Baut die Tabelle so, wie der Sync sie HEUTE auf der Gegenseite baut: Zeile für Zeile. */
function ueberZeilen(n: number): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(STANDALONE('f'));
  const ins = db.prepare('INSERT INTO f(id, titel, regeste, text, quelle_url) VALUES (?, ?, ?, ?, ?)');
  for (const z of zeilen(n)) ins.run(...z);
  return db;
}

/** Spielt eine Shadow-Ladung in eine FRISCHE FTS5-Tabelle ein — exakt die Schritte, die
 *  `ladeFtsIndex()` in turso-sync.ts gegen Turso fährt. */
function ueberSchatten(quelle: DatabaseSync, mitContent: boolean, ddl: string): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(ddl);
  // `node:sqlite` schaltet SQLITE_DBCONFIG_DEFENSIVE standardmässig EIN und verbietet damit
  // Schreibzugriffe auf Shadow-Tabellen («table f_data may not be modified»). Der
  // libsql-Server hinter Turso tut das nicht — dort laufen die Inserts (empirisch geprüft
  // 4.8.2026). Für diesen Test wird der Riegel darum lokal gelöst, damit er DENSELBEN
  // Ablauf nachstellt, den der Sync remote fährt.
  db.enableDefensive(false);
  // Eine frisch angelegte FTS5-Tabelle trägt bereits Zeilen in `_data` (averages + structure)
  // und `_config` (version). Ohne dieses Leeren kollidierten die PRIMARY KEYs beim Laden.
  db.exec('DELETE FROM f_data');
  db.exec('DELETE FROM f_config');
  for (const l of leseFtsSchatten(quelle, 'f', mitContent)) {
    const ins = db.prepare(
      `INSERT INTO f${l.suffix} (${l.spalten.join(', ')}) VALUES (${l.spalten.map(() => '?').join(', ')})`,
    );
    for (const w of l.werte) ins.run(...(w as Array<string | number | null | Uint8Array>));
  }
  return db;
}

/** Die Abfragen, die api/suche.ts real fährt (SQL_ENTSCHEIDE_COUNT/_TREFFER in suche-kern.ts). */
function befund(db: DatabaseSync) {
  const zaehle = (w: string) =>
    (db.prepare(`SELECT count(*) AS n FROM f WHERE f MATCH '"${w}"'`).get() as { n: number }).n;
  return {
    gesamt: (db.prepare('SELECT count(*) AS n FROM f').get() as { n: number }).n,
    treffer: ['beschwerde', 'verjahrung', 'kundigung', 'rechtsoffnung', 'gutzuheissen'].map(zaehle),
    // Rangfolge UND Snippet — nicht nur «findet irgendwas»: eine kaputte Segment-Struktur
    // kann dieselbe Treffermenge bei anderer bm25-Ordnung liefern.
    top: db
      .prepare(
        `SELECT id, snippet(f, -1, '[', ']', '…', 8) AS snip FROM f WHERE f MATCH '"verjahrung"'
         ORDER BY bm25(f), rowid LIMIT 10`,
      )
      .all(),
  };
}

describe('FTS5-Shadow-Transport (turso-sync überträgt den fertigen Index statt der Zeilen)', () => {
  it('Shadow-Ladung reproduziert den Index verhaltensgleich — Treffer, bm25-Rang und Snippet', () => {
    const original = ueberZeilen(400);
    const kopie = ueberSchatten(original, true, STANDALONE('f'));
    const a = befund(original);
    const b = befund(kopie);
    expect(b.gesamt).toBe(a.gesamt);
    expect(b.treffer).toEqual(a.treffer);
    expect(b.top).toEqual(a.top);
    // Der Test wäre wertlos, wenn die Proben gar nichts fänden (§6.7).
    expect(a.gesamt).toBe(400);
    expect(a.treffer.every((n) => n > 0)).toBe(true);
    expect(a.top.length).toBeGreaterThan(0);
  });

  it('FTS5 meldet den übertragenen Index als integer (integrity-check)', () => {
    const kopie = ueberSchatten(ueberZeilen(400), true, STANDALONE('f'));
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).not.toThrow();
  });

  it('integrity-check schlägt an, wenn eine Shadow-Zeile fehlt (das Tor kann scheitern, §6.7)', () => {
    const kopie = ueberSchatten(ueberZeilen(400), true, STANDALONE('f'));
    // Eine einzige Index-Seite entfernen — die Zeilenzahl bleibt unverändert, nur der Index
    // ist unvollständig. Genau der stille Fehlmodus, gegen den der integrity-check steht.
    kopie.exec('DELETE FROM f_data WHERE id = (SELECT max(id) FROM f_data)');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).toThrow();
  });

  it('contentless (fts_artikel) überträgt sich gleich — Treffer, rowid-Spanne, integrity-check', () => {
    // Eigener Fall, weil `fts_artikel` remote CONTENTLESS liegt: dort gibt es keine
    // `_content`-Tabelle, gegen die der integrity-check rechnen könnte. Die Prüfung wäre
    // also denkbar blind — sie ist es nicht (letzte Zusicherung unten), und die
    // rowid-Spannweite, an der die Nachkontrolle des Syncs hängt, überlebt den Transport.
    const contentless = `CREATE VIRTUAL TABLE f USING fts5(text, content='', tokenize='${TOKENIZER}')`;
    const original = new DatabaseSync(':memory:');
    original.exec(contentless);
    const ins = original.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');
    // rowids mit Lücken — genau wie `artikel.rowid` sie haben darf (Gegenprüfungs-Befund B2).
    for (let i = 1; i <= 400; i++) ins.run(i * 3, `Verjährung Beschwerde Kündigung ${i} ${`fuell${i % 29} `.repeat(25)}`);

    const kopie = ueberSchatten(original, false, contentless);
    const spanne = (db: DatabaseSync) => JSON.stringify(db.prepare('SELECT min(rowid) AS a, max(rowid) AS b FROM f').get());
    const treffer = (db: DatabaseSync) =>
      (db.prepare(`SELECT count(*) AS n FROM f WHERE f MATCH '"verjahrung"'`).get() as { n: number }).n;
    expect(kopie.prepare('SELECT count(*) AS n FROM f').get()).toEqual({ n: 400 });
    expect(treffer(kopie)).toBe(treffer(original));
    expect(treffer(kopie)).toBe(400);
    expect(spanne(kopie)).toBe(spanne(original));
    expect(spanne(kopie)).toBe('{"a":3,"b":1200}');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).not.toThrow();
    // Und er ist auch ohne `_content` nicht blind:
    kopie.exec('DELETE FROM f_data WHERE id = (SELECT max(id) FROM f_data)');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).toThrow();
  });

  it('contentless und external content tragen BYTE-GLEICHE Index-Shadowtabellen', () => {
    // Trägt die Annahme, mit der `fts_artikel` übertragen wird: lokal liegt er als
    // external-content-Tabelle über `artikel`, remote als contentless. Kippt diese
    // Gleichheit in einer künftigen SQLite-Fassung, zeigt die Suche systematisch falsche
    // Artikel — und keine Zeilenzahl würde es merken.
    const text = (i: number) => `Verjährung Beschwerde Kündigung Nr ${i} ${`wort${i % 37} `.repeat(20)}`;

    const contentless = new DatabaseSync(':memory:');
    contentless.exec(`CREATE VIRTUAL TABLE f USING fts5(text, content='', tokenize='${TOKENIZER}')`);
    const iC = contentless.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');

    const extern = new DatabaseSync(':memory:');
    extern.exec('CREATE TABLE artikel (text TEXT)');
    extern.exec(`CREATE VIRTUAL TABLE f USING fts5(text, content='artikel', content_rowid='rowid', tokenize='${TOKENIZER}')`);
    const iE = extern.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');

    // Nicht lückenlos ab 1: die rowid-Lücken sind real (artikel.rowid), und sie gehen in die
    // Doclist-Kodierung ein.
    for (let i = 1; i <= 300; i++) {
      iC.run(i * 3, text(i));
      iE.run(i * 3, text(i));
    }
    const roh = (db: DatabaseSync) => JSON.stringify([...leseFtsSchatten(db, 'f', false)]);
    expect(roh(extern)).toBe(roh(contentless));
  });
});
