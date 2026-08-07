// src/tests/plan-selbstopt.test.ts — Rechenkerne der Bau-Messreihe (QS-SELBSTOPT).
//
// Geprüft wird ausschliesslich `scripts/plan/selbstoptKern.ts` plus die Anzeige
// in `lage.ts`: alles Reine. Kein git, kein gh, kein Netz, keine Wanduhr — der
// Bezugszeitpunkt wird überall hereingegeben. Ein Test, der die Maschine misst,
// auf der er läuft, prüft nicht den Code (Muster von `plan-lage.test.ts`).
import { readFileSync } from 'node:fs';
import {
  GENERIERT_MARKE,
  addiereAggregat,
  aggregiereTore,
  ciKennzahl,
  istHandschrift,
  letzterSnapshot,
  parseEreignisse,
  parseEreignisseMitRest,
  parseFKlassen,
  pruefeZeitreihe,
  quoteText,
  reworkKennzahl,
  zaehleFlakySpecs,
  type RwCommit,
  type Snapshot,
  type Zeitreihe,
} from '../../scripts/plan/selbstoptKern';
import { lageBlock, selbstoptZeile } from '../../scripts/plan/lage';
import type { Einheit } from '../../scripts/plan/parse';

// ───────────────────────────── Tor-Ereignisse ─────────────────────────────

describe('parseEreignisse', () => {
  it('liest gültige JSONL-Zeilen', () => {
    const jsonl = [
      '{"ts":"2026-08-07T10:00:00.000Z","tor":"check:plan","ok":true}',
      '{"ts":"2026-08-07T10:00:01.000Z","tor":"check:smoke","ok":false}',
    ].join('\n');
    expect(parseEreignisse(jsonl)).toEqual([
      { ts: '2026-08-07T10:00:00.000Z', tor: 'check:plan', ok: true },
      { ts: '2026-08-07T10:00:01.000Z', tor: 'check:smoke', ok: false },
    ]);
  });

  it('überspringt kaputte und unvollständige Zeilen, statt zu werfen', () => {
    // Realfall: der Schreiber wird mitten in der letzten Zeile abgebrochen.
    const jsonl = [
      '{"ts":"2026-08-07T10:00:00.000Z","tor":"check:plan","ok":true}',
      'kein json',
      '{"ts":"2026-08-07T10:00:02.000Z","tor":"ohne-ok"}',
      '',
      '{"ts":"2026-08-07T10:00:03.000Z","tor":"check:zy',
    ].join('\n');
    const { ereignisse, verworfen } = parseEreignisseMitRest(jsonl);
    expect(ereignisse).toHaveLength(1);
    expect(verworfen).toBe(3);
  });
});

describe('aggregiereTore', () => {
  const ereignisse = parseEreignisse(
    [
      '{"ts":"2026-08-01T10:00:00.000Z","tor":"check:plan","ok":true}',
      '{"ts":"2026-08-05T10:00:00.000Z","tor":"check:plan","ok":false}',
      '{"ts":"2026-08-05T10:00:01.000Z","tor":"check:smoke","ok":true}',
      '{"ts":"2026-08-05T10:00:02.000Z","tor":"check:plan","ok":false}',
    ].join('\n'),
  );

  it('zählt je Tor über alles, wenn kein Schnitt gesetzt ist', () => {
    const a = aggregiereTore(ereignisse, null);
    expect(a).toEqual({
      gesamt: 4,
      rot: 2,
      je: { 'check:plan': { gesamt: 3, rot: 2 }, 'check:smoke': { gesamt: 1, rot: 0 } },
    });
  });

  it('schneidet ECHT grösser als der Schnitt-Zeitpunkt', () => {
    // Das Ereignis EXAKT auf dem Schnitt hat der vorige Snapshot bereits
    // gezählt; zählte es hier nochmals, wäre die kumulierte Reihe zu hoch.
    const a = aggregiereTore(ereignisse, '2026-08-05T10:00:00.000Z');
    expect(a.gesamt).toBe(2);
    expect(a.rot).toBe(1);
    expect(a.je['check:plan']).toEqual({ gesamt: 1, rot: 1 });
  });

  it('sortiert die Tor-Namen, damit die JSON-Datei nicht an der Lauf-Reihenfolge hängt', () => {
    const gemischt = parseEreignisse(
      [
        '{"ts":"2026-08-01T10:00:00.000Z","tor":"check:zyklen","ok":true}',
        '{"ts":"2026-08-01T10:00:01.000Z","tor":"check:alpha","ok":true}',
      ].join('\n'),
    );
    expect(Object.keys(aggregiereTore(gemischt, null).je)).toEqual(['check:alpha', 'check:zyklen']);
  });
});

describe('addiereAggregat', () => {
  it('summiert Gesamt-, Rot- und Je-Tor-Zähler', () => {
    const a = { gesamt: 2, rot: 1, je: { 'check:plan': { gesamt: 2, rot: 1 } } };
    const b = { gesamt: 3, rot: 0, je: { 'check:plan': { gesamt: 1, rot: 0 }, 'check:smoke': { gesamt: 2, rot: 0 } } };
    expect(addiereAggregat(a, b)).toEqual({
      gesamt: 5,
      rot: 1,
      je: { 'check:plan': { gesamt: 3, rot: 1 }, 'check:smoke': { gesamt: 2, rot: 0 } },
    });
  });
});

// ─────────────────────────── Fehlerklassen-Parser ───────────────────────────

describe('parseFKlassen', () => {
  const FIXTURE = [
    '# Kopf',
    '',
    '## Register der belegten Fehlerklassen (Vorfälle 18.–20.7.2026)',
    '',
    '| # | Klasse | Was passierte | Gegenmittel |',
    '|---|---|---|---|',
    '| **F1** | Merge vor Prüfung | PR #309, kein Datum in der Zeile | Hook |',
    '| **F2a** | Selbstvalidierung | Rückfall 3.8.2026, erneut 5.8.2026 | Wächter |',
    '| **F6** | Doppelarbeit | 28.7.2026 und nochmals 28.7.2026 | Sonden |',
    '',
    '## Eine neue Lehre ablegen',
    '',
    'Hier steht 9.9.2026 und darf NICHT mitzählen.',
  ].join('\n');

  it('zählt datierte Belege je Klasse', () => {
    expect(parseFKlassen(FIXTURE)).toEqual({ F1: 0, F2a: 2, F6: 1 });
  });

  it('zählt dasselbe Datum nur einmal und hört am nächsten Abschnitt auf', () => {
    const out = parseFKlassen(FIXTURE);
    expect(out.F6).toBe(1); // zweimal 28.7.2026 = ein Beleg
    expect(Object.keys(out)).toEqual(['F1', 'F2a', 'F6']); // nichts aus dem Folgeabschnitt
  });

  it('liefert leer, wenn es den Registerabschnitt nicht gibt', () => {
    expect(parseFKlassen('# ohne Register')).toEqual({});
  });

  // §5-Bindung an die echte Quelle: der Parser ist eine Projektion des
  // Lehren-Registers. Ändert dort die Tabellenform, liefert er still `{}` und
  // die Messreihe verlöre eine Grösse, ohne dass irgendetwas rot würde. Dieser
  // Test bindet ihn an die Wirklichkeit, statt nur an eine Fixture.
  it('findet die echten Klassen im Lehren-Register', () => {
    const md = readFileSync('.claude/skills/lehren/SKILL.md', 'utf8');
    const out = parseFKlassen(md);
    for (const k of ['F1', 'F2a', 'F2b', 'F2c', 'F2d', 'F2e', 'F2f', 'F3', 'F4', 'F5', 'F6']) {
      expect(Object.keys(out)).toContain(k);
    }
  });
});

// ────────────────────────────── Rework-Heuristik ──────────────────────────────

describe('reworkKennzahl', () => {
  const H: RwCommit[] = [
    { sha: 'c1', ts: '2026-08-01T10:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] },
    { sha: 'c2', ts: '2026-08-01T20:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] }, // 10 h später
    { sha: 'c3', ts: '2026-08-05T10:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] }, // 86 h später
    { sha: 'c4', ts: '2026-08-05T11:00:00Z', autor: 'b@x', dateien: ['src/a.ts'] }, // fremder Autor
  ];
  const JETZT = Date.parse('2026-08-06T00:00:00Z');

  it('zählt nur eigene Vorgänger binnen Frist', () => {
    const k = reworkKennzahl(H, JETZT);
    expect(k.commits).toBe(4);
    expect(k.reworkCommits).toBe(1); // nur c2
    expect(k.anteil).toBe(0.25);
  });

  it('lange Frist macht auch den späten Folge-Commit zur Nacharbeit', () => {
    const k = reworkKennzahl(H, JETZT, 14, 100);
    expect(k.reworkCommits).toBe(2); // c2 (10 h) und c3 (86 h)
  });

  it('nutzt Commits VOR dem Fenster als Vorgänger, ohne sie mitzuzählen', () => {
    // Fenster 6 h bis jetzt2: c1 (10:00) liegt davor, c2 (20:00) darin, c3/c4
    // liegen dahinter. Beurteilt wird also nur c2 — und c2 gilt als Nacharbeit
    // ausschliesslich deshalb, weil c1 als Vorgänger sichtbar bleibt.
    const jetzt2 = Date.parse('2026-08-02T00:00:00Z');
    const k = reworkKennzahl(H, jetzt2, 6 / 24, 48);
    expect(k.commits).toBe(1);
    expect(k.reworkCommits).toBe(1);
    expect(k.anteil).toBe(1);
  });

  it('zählt Commits NACH dem Bezugszeitpunkt nicht mit (Uhr-Versatz)', () => {
    const zukunft: RwCommit[] = [
      ...H,
      { sha: 'z1', ts: '2030-01-01T00:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] },
    ];
    expect(reworkKennzahl(zukunft, JETZT).commits).toBe(4);
  });

  it('leeres Fenster ergibt 0 und keine Division durch null', () => {
    const k = reworkKennzahl([], JETZT);
    expect(k).toMatchObject({ commits: 0, reworkCommits: 0, anteil: 0 });
  });

  it('mit Datei-Filter fallen Commits ohne gemessene Datei aus dem Nenner', () => {
    const gemischt: RwCommit[] = [
      ...H,
      { sha: 'k1', ts: '2026-08-05T12:00:00Z', autor: 'a@x', dateien: ['public/normtext/x.json'] },
      { sha: 'k2', ts: '2026-08-05T13:00:00Z', autor: 'a@x', dateien: ['public/normtext/x.json'] },
    ];
    expect(reworkKennzahl(gemischt, JETZT).commits).toBe(6);
    expect(reworkKennzahl(gemischt, JETZT, 14, 48, istHandschrift).commits).toBe(4);
  });
});

describe('istHandschrift', () => {
  it('nimmt Quelltext, verwirft Projektionen und Generate', () => {
    expect(istHandschrift('src/lib/x.ts')).toBe(true);
    expect(istHandschrift('scripts/plan/lage.ts')).toBe(true);
    expect(istHandschrift('e2e/leser.spec.ts')).toBe(true);
    expect(istHandschrift('public/normtext/OR.json')).toBe(false);
    expect(istHandschrift('ROADMAP.md')).toBe(false);
    expect(istHandschrift('src/lib/normtext/grundart.generated.ts')).toBe(false);
  });
});

// ─────────────────────────────── CI-Kennzahlen ───────────────────────────────

describe('ciKennzahl', () => {
  it('zählt jedes Nicht-success als Ausfall (Fehlerklasse F2c: grau ist nicht grün)', () => {
    const k = ciKennzahl([
      { attempt: 1, conclusion: 'success', status: 'completed' },
      { attempt: 2, conclusion: 'failure', status: 'completed' },
      { attempt: 1, conclusion: 'cancelled', status: 'completed' },
      { attempt: 1, conclusion: null, status: 'in_progress' }, // zählt nicht mit
    ]);
    expect(k.laeufe).toBe(3);
    expect(k.failureRate).toBe(0.6667);
    expect(k.rerunRate).toBe(0.3333);
    expect(k.je).toEqual({ cancelled: 1, failure: 1, success: 1 });
  });

  it('ohne abgeschlossene Läufe keine Division durch null', () => {
    expect(ciKennzahl([])).toMatchObject({ laeufe: 0, failureRate: 0, rerunRate: 0 });
  });
});

// ──────────────────────────────── Flaky-Zähler ────────────────────────────────

describe('zaehleFlakySpecs', () => {
  it('findet wiederholte Specs auch in verschachtelten Suiten', () => {
    const report = {
      suites: [
        {
          specs: [{ tests: [{ results: [{ retry: 0 }, { retry: 1 }] }] }],
          suites: [
            { specs: [{ tests: [{ results: [{ retry: 0 }] }] }, { tests: [{ results: [{ retry: 2 }] }] }] },
          ],
        },
      ],
    };
    expect(zaehleFlakySpecs(report)).toBe(2);
  });

  it('kommt mit leerem oder fremdem Inhalt klar', () => {
    expect(zaehleFlakySpecs({})).toBe(0);
    expect(zaehleFlakySpecs(null)).toBe(0);
  });
});

// ─────────────────────────── Schema-Prüfung (check:plan) ───────────────────────────

function snapshot(p: Partial<Snapshot> = {}): Snapshot {
  return {
    erhobenAm: '2026-08-07T10:00:00.000Z',
    headCommit: 'abcdef1234567890abcdef1234567890abcdef12',
    torRot: { seitLetztem: { gesamt: 0, rot: 0, je: {} }, kumuliert: { gesamt: 0, rot: 0, je: {} } },
    ci: null,
    rework: null,
    flaky: null,
    fKlassen: {},
    ausfaelle: [],
    ...p,
  };
}

function reihe(snapshots: Snapshot[], kopf: Partial<Zeitreihe> = {}): string {
  return JSON.stringify({ _generiert: GENERIERT_MARKE, schema: 1, snapshots, ...kopf });
}

describe('pruefeZeitreihe', () => {
  it('fehlende Datei ist KEIN Fehler', () => {
    expect(pruefeZeitreihe(null)).toEqual([]);
  });

  it('gültige Reihe passiert', () => {
    expect(pruefeZeitreihe(reihe([snapshot(), snapshot({ erhobenAm: '2026-08-07T11:00:00.000Z' })]))).toEqual([]);
  });

  it('meldet fehlende Generat-Marke', () => {
    const roh = reihe([snapshot()], { _generiert: 'von Hand gepflegt' });
    expect(pruefeZeitreihe(roh).join('\n')).toContain('_generiert');
  });

  it('meldet nicht aufsteigende Snapshots', () => {
    const roh = reihe([snapshot({ erhobenAm: '2026-08-07T11:00:00.000Z' }), snapshot({ erhobenAm: '2026-08-07T10:00:00.000Z' })]);
    expect(pruefeZeitreihe(roh).join('\n')).toContain('chronologisch');
  });

  it('meldet gleiche Zeitstempel (nicht später ist nicht aufsteigend)', () => {
    expect(pruefeZeitreihe(reihe([snapshot(), snapshot()])).join('\n')).toContain('chronologisch');
  });

  it('meldet kaputtes JSON, fehlende Pflichtfelder und falschen SHA', () => {
    expect(pruefeZeitreihe('{kein json').join('\n')).toContain('kein gültiges JSON');
    expect(pruefeZeitreihe(reihe([snapshot({ headCommit: 'ZZZ' })])).join('\n')).toContain('headCommit');
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: 'gestern' })])).join('\n')).toContain('erhobenAm');
    const ohneTorRot = JSON.stringify({
      _generiert: GENERIERT_MARKE,
      schema: 1,
      snapshots: [{ erhobenAm: '2026-08-07T10:00:00.000Z', headCommit: 'abcdef1', ausfaelle: [] }],
    });
    expect(pruefeZeitreihe(ohneTorRot).join('\n')).toContain('torRot');
  });

  it('meldet fehlende snapshots-Liste', () => {
    expect(pruefeZeitreihe(JSON.stringify({ _generiert: GENERIERT_MARKE, schema: 1 })).join('\n')).toContain('snapshots');
  });
});

// ────────────────────────────────── Anzeige ──────────────────────────────────

describe('letzterSnapshot / quoteText', () => {
  it('nimmt den jüngsten Eintrag, sonst null', () => {
    const a = snapshot();
    const b = snapshot({ erhobenAm: '2026-08-08T10:00:00.000Z' });
    expect(letzterSnapshot({ _generiert: GENERIERT_MARKE, schema: 1, snapshots: [a, b] })).toBe(b);
    expect(letzterSnapshot({ _generiert: GENERIERT_MARKE, schema: 1, snapshots: [] })).toBeNull();
    expect(letzterSnapshot(null)).toBeNull();
  });

  it('formatiert Quoten als Prozent und Unbekanntes als Gedankenstrich', () => {
    expect(quoteText(0.4567)).toBe('46 %');
    expect(quoteText(null)).toBe('—');
  });
});

describe('selbstoptZeile', () => {
  it('sagt es geradeheraus, wenn noch nichts gemessen wurde', () => {
    expect(selbstoptZeile(null)[0]).toContain('noch keine Zeitreihe');
  });

  it('zeigt Stand, CI-Rate und Tor-Rot des letzten Snapshots', () => {
    const z: Zeitreihe = {
      _generiert: GENERIERT_MARKE,
      schema: 1,
      snapshots: [
        snapshot({
          erhobenAm: '2026-08-07T12:00:00.000Z',
          ci: { laeufe: 50, failureRate: 0.46, rerunRate: 0.06, je: {} },
          torRot: { seitLetztem: { gesamt: 44, rot: 3, je: {} }, kumuliert: { gesamt: 44, rot: 3, je: {} } },
        }),
      ],
    };
    const zeile = selbstoptZeile(z)[0];
    expect(zeile).toContain('2026-08-07');
    expect(zeile).toContain('46 %');
    expect(zeile).toContain('3 von 44');
    // Der Zusatz ist nicht Zierde: ohne ihn liest sich die Zahl wie ein Urteil.
    expect(zeile).toContain('kein Tor-Kriterium');
  });

  it('bleibt vollständig, wenn die CI-Rate fehlt', () => {
    const z: Zeitreihe = { _generiert: GENERIERT_MARKE, schema: 1, snapshots: [snapshot()] };
    expect(selbstoptZeile(z)[0]).toContain('CI-Rate nicht erhoben');
  });
});

describe('lageBlock — Andock-Muster', () => {
  let pos = 0;
  const einheit = (id: string): Einheit => ({
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung', pos: pos++,
    etikett: { id, status: 'ready', statusAgent: null, of: true, blocker: null, dep: [], kollision: [], seqHart: [], seqWeich: [], worktree: false, asset26x: false, groesse: null, fahrplan: null },
  });
  const kaputt = () => { throw new Error('git fehlt'); };

  it('hängt die Messreihen-Zeile GENAU EINMAL ans Ende an', () => {
    const zeilen = lageBlock([einheit('QS-SELBSTOPT')], [], { prs: false, laufe: kaputt, zeitreihe: () => null });
    const treffer = zeilen.filter((z) => z.startsWith('📈'));
    expect(treffer).toHaveLength(1);
    expect(zeilen[zeilen.length - 1]).toBe(treffer[0]);
  });

  it('zieht man die neue Zeile ab, ist der Block wie vorher', () => {
    const opt = { prs: false, laufe: kaputt } as const;
    const ohne = lageBlock([einheit('QS-A')], [], { ...opt, zeitreihe: () => null }).filter((z) => !z.startsWith('📈'));
    const mit = lageBlock([einheit('QS-A')], [], {
      ...opt,
      zeitreihe: () => ({ _generiert: GENERIERT_MARKE, schema: 1, snapshots: [snapshot()] }),
    }).filter((z) => !z.startsWith('📈'));
    expect(mit).toEqual(ohne);
  });
});
