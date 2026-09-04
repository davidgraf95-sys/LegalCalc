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
  parseFremdagentenRegister,
  parseTokenMetriken,
  pruefeZeitreihe,
  quoteText,
  reworkKennzahl,
  zaehleFlakySpecs,
  type RwCommit,
  type Snapshot,
  type Zeitreihe,
} from '../../scripts/plan/selbstoptKern';
import { lageBlock, selbstoptZeile, vorschlagsZeile } from '../../scripts/plan/lage';
import {
  JULES_QUOTE_MIN_N,
  JULES_RUECKBAU_QUOTE,
  JULES_SKALIEREN_MEDIAN_MAX_MIN,
  JULES_SKALIEREN_MIN_N,
  JULES_SKALIEREN_QUOTE,
  MIN_SNAPSHOTS,
  ZWEITBLICK_DURCHGAENGE_SCHWELLE,
  befunde,
} from '../../scripts/plan/retro17Kern';
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
    '| **F2a** | Selbstvalidierung | Vorfall 3.8.2026, erneut 5.8.2026 | Wächter, Fix 9.8.2026 |',
    '| **F6** | Doppelarbeit | 28.7.2026 und nochmals 28.7.2026 | Sonden |',
    '| **F9** | Nur repariert | keine Datumsangabe im Ereignis | Fix 1.1.2027, PR #999 |',
    '',
    '## Eine neue Lehre ablegen',
    '',
    'Hier steht 9.9.2026 und darf NICHT mitzählen.',
  ].join('\n');

  it('zählt datierte Vorfälle je Klasse', () => {
    expect(parseFKlassen(FIXTURE)).toEqual({ F1: 0, F2a: 2, F6: 1, F9: 0 });
  });

  // Der Befund der Gegenprüfung 7.8.2026: Reparaturdaten sind keine Vorfälle.
  // Zählte man sie mit, schlüge retro:17 nach jedem Fix eine Eskalation vor —
  // der Bau antwortete auf eine Reparatur mit «Gegenmittel greift nicht».
  it('zählt Daten aus der Gegenmittel-Spalte NICHT mit', () => {
    const out = parseFKlassen(FIXTURE);
    expect(out.F9).toBe(0); // «Fix 1.1.2027» steht nur im Gegenmittel
    expect(out.F2a).toBe(2); // 3.8. + 5.8. im Ereignis; «Fix 9.8.» bleibt draussen
  });

  it('zählt dasselbe Datum nur einmal und hört am nächsten Abschnitt auf', () => {
    const out = parseFKlassen(FIXTURE);
    expect(out.F6).toBe(1); // zweimal 28.7.2026 = ein Vorfall
    expect(Object.keys(out)).toEqual(['F1', 'F2a', 'F6', 'F9']); // nichts aus dem Folgeabschnitt
  });

  it('überspringt Zeilen ohne Ereignis-Spalte, statt zu raten', () => {
    const kaputt = ['## Register der belegten Fehlerklassen', '', '| **F1** | nur zwei Spalten |', ''].join('\n');
    expect(parseFKlassen(kaputt)).toEqual({});
  });

  it('liefert leer, wenn es den Registerabschnitt nicht gibt', () => {
    expect(parseFKlassen('# ohne Register')).toEqual({});
  });

  // §5-Bindung an die echte Quelle: der Parser ist eine Projektion des
  // Lehren-Registers. Ändert dort die Tabellenform, liefert er still `{}` und
  // die Messreihe verlöre eine Grösse, ohne dass irgendetwas rot würde.
  it('findet die echten Klassen im Lehren-Register', () => {
    const md = readFileSync('.claude/skills/lehren/SKILL.md', 'utf8');
    const out = parseFKlassen(md);
    for (const k of ['F1', 'F2a', 'F2b', 'F2c', 'F2d', 'F2e', 'F2f', 'F3', 'F4', 'F5', 'F6']) {
      expect(Object.keys(out)).toContain(k);
    }
  });

  // Präsenz der Schlüssel genügt NICHT (Gegenprüfung 7.8.2026): eine Umstellung
  // des Registers auf ISO-Daten würde jeden Zähler still auf 0 setzen, und der
  // Test oben bliebe grün. Es MUSS also mindestens ein datierter Vorfall
  // gefunden werden — heute belegt durch F2e («Anlage 20.7.2026»), F2f
  // («Bauplan-Review 4./5.8.2026») und F6 («2. Vorfall 28.7.2026»).
  it('findet im echten Register mindestens die bekannt datierten Vorfälle', () => {
    const md = readFileSync('.claude/skills/lehren/SKILL.md', 'utf8');
    const out = parseFKlassen(md);
    const summe = Object.values(out).reduce((a, b) => a + b, 0);
    expect(summe).toBeGreaterThanOrEqual(3);
    for (const k of ['F2e', 'F2f', 'F6']) expect(out[k]).toBeGreaterThanOrEqual(1);
  });
});

describe('parseFremdagentenRegister', () => {
  const FIXTURE = [
    '## §5 · Werkzeugstand',
    '',
    '**Diskrepanz-Finder-Läufe (Phase 2)** — Werte aus §2 Phase 2 übernommen:',
    '',
    '| Datum | Erlass | Artikel mit Diff | an Gemini | echt | Schein | Tokens |',
    '|---|---|---|---|---|---|---|',
    '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |',
    '| 4.9.2026 | DBG Art. 1–60 | 1 | 3 | 0 | 1 | 54 836 |',
    '',
    '**Phase 3 — Zweitblick-Durchgänge** (leer, entsteht im Alltag):',
    '',
    '| Datum | Erlass/Norm | Prüfer | echt | Schein | verpasst | Tokens |',
    '|---|---|---|---|---|---|---|',
    '',
    '**Kontingent-Ereignisse** (leer, Skript …):',
    '',
    '| Datum | Dienst | Signal | Dauer | Folge |',
    '|---|---|---|---|---|',
    '| 5.9.2026 | Jules | ALARM Issue #1 ohne Annahme | 12 min | keine neuen Tickets |',
    '',
    '## §6 · Entscheide',
  ].join('\n');

  it('zählt Datenzeilen und summiert echt/Schein je Register', () => {
    const out = parseFremdagentenRegister(FIXTURE);
    expect(out.ausfaelle).toEqual([]);
    expect(out.mess).toEqual({
      diskrepanz_laeufe: 2,
      diskrepanz_echt: 8,
      diskrepanz_schein: 1,
      zweitblick_durchgaenge: 0,
      kontingent_ereignisse: 1,
    });
  });

  // ROT-BEWEIS der Nachbesserung 4.9.2026: vorher lieferte ein fehlendes oder
  // umbenanntes Register still lauter Nullen — eine Zahl, die «gemessen und
  // nichts gefunden» behauptet, wo nichts gemessen wurde (§8). Jetzt: `null`
  // plus ein benannter Ausfall je Register.
  it('meldet Ausfall statt Nullen, wenn keines der Register vorkommt', () => {
    const out = parseFremdagentenRegister('# ohne Register');
    expect(out.mess).toBeNull();
    expect(out.ausfaelle).toHaveLength(3);
    expect(out.ausfaelle.join(' ')).toContain('Diskrepanz-Finder-Läufe');
  });

  it('meldet Ausfall bei abweichender Kopfzeile, statt die Spalten zu raten', () => {
    const verdreht = FIXTURE.replace(
      '| Datum | Erlass | Artikel mit Diff | an Gemini | echt | Schein | Tokens |',
      '| Datum | Erlass | Artikel mit Diff | an Gemini | Schein | echt | Tokens |',
    );
    const out = parseFremdagentenRegister(verdreht);
    expect(out.mess).toBeNull();
    expect(out.ausfaelle.join(' ')).toContain('Kopfzeile');
  });

  it('meldet Ausfall, wenn die Marke da ist, aber gar keine Tabelle folgt', () => {
    const ohneTabelle = [
      '**Diskrepanz-Finder-Läufe (Phase 2)** — noch nichts erhoben.',
      '',
      '**Phase 3 — Zweitblick-Durchgänge**',
      '',
      '| Datum | Erlass/Norm | Prüfer | echt | Schein | verpasst | Tokens |',
      '|---|---|---|---|---|---|---|',
      '',
      '**Kontingent-Ereignisse**',
      '',
      '| Datum | Dienst | Signal | Dauer | Folge |',
      '|---|---|---|---|---|',
    ].join('\n');
    const out = parseFremdagentenRegister(ohneTabelle);
    expect(out.mess).toBeNull();
    expect(out.ausfaelle).toHaveLength(1);
  });

  // GRÜN-Fall der Nachbesserung: eine Leerzeile MITTEN in der Tabelle (im
  // Markdown ein Formatierungsversehen, kein Tabellenende) darf das Zählen
  // nicht abbrechen — vorher fielen alle Zeilen danach unter den Tisch.
  it('überspringt eine Leerzeile INNERHALB der Tabelle und zählt danach weiter', () => {
    const mitLuecke = FIXTURE.replace(
      '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |',
      '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |\n',
    );
    const out = parseFremdagentenRegister(mitLuecke);
    expect(out.mess?.diskrepanz_laeufe).toBe(2);
    expect(out.mess?.diskrepanz_echt).toBe(8);
  });

  it('hört bei der nächsten Nicht-Tabellenzeile auf (zählt keine Folgeabschnitte mit)', () => {
    const nurEinRegister = FIXTURE.split('\n').slice(0, 8).join('\n'); // ohne Zweitblick/Kontingent
    const out = parseFremdagentenRegister(nurEinRegister);
    expect(out.mess).toBeNull(); // Zweitblick/Kontingent fehlen ganz
    expect(out.ausfaelle).toHaveLength(2);
  });

  // §5-Bindung an die echte Quelle (Muster wie bei `parseFKlassen`): ändert
  // sich dort die Überschrift, soll der Parser sichtbar auf 0 fallen, nicht
  // raten. Die drei Marken müssen also im echten Fahrplan vorkommen.
  it('findet die drei Register-Überschriften im echten Fahrplan', () => {
    const md = readFileSync('fahrplaene/FAHRPLAN-FREMDAGENTEN.md', 'utf8');
    expect(md).toContain('**Diskrepanz-Finder-Läufe (Phase 2)**');
    expect(md).toContain('**Phase 3 — Zweitblick-Durchgänge**');
    expect(md).toContain('**Kontingent-Ereignisse**');
    const out = parseFremdagentenRegister(md);
    expect(out.ausfaelle).toEqual([]);
    // Stand 4.9.2026: zwei Diskrepanz-Läufe (AMBV, DBG), 8 echt / 1 Schein.
    expect(out.mess?.diskrepanz_laeufe).toBeGreaterThanOrEqual(2);
    expect(out.mess?.diskrepanz_echt).toBeGreaterThanOrEqual(8);
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
  // Gegenprüfung 7.8.2026: `cancelled` ist KEIN Ausfall — nachgemessen lagen
  // 11 der 15 abgebrochenen Läufe auf `main` (Concurrency-Verdrängung).
  it('nimmt abgebrochene Läufe aus Zähler UND Nenner der Ausfallquote', () => {
    const k = ciKennzahl([
      { attempt: 1, conclusion: 'success', status: 'completed' },
      { attempt: 2, conclusion: 'failure', status: 'completed' },
      { attempt: 1, conclusion: 'cancelled', status: 'completed' },
      { attempt: 1, conclusion: 'skipped', status: 'completed' },
      { attempt: 1, conclusion: null, status: 'in_progress' }, // zählt nicht mit
    ]);
    expect(k.laeufe).toBe(4);
    expect(k.verdikte).toBe(2); // success + failure
    expect(k.failureRate).toBe(0.5); // 1 von 2 Verdikten — nicht 3 von 4
    expect(k.cancelledRate).toBe(0.5); // 2 von 4 abgeschlossenen
    expect(k.rerunRate).toBe(0.25); // 1 von 4
    expect(k.je).toEqual({ cancelled: 1, failure: 1, skipped: 1, success: 1 });
  });

  it('zählt timed_out weiterhin als Ausfall — der Lauf hatte seine Gelegenheit', () => {
    const k = ciKennzahl([
      { attempt: 1, conclusion: 'success', status: 'completed' },
      { attempt: 1, conclusion: 'timed_out', status: 'completed' },
    ]);
    expect(k.verdikte).toBe(2);
    expect(k.failureRate).toBe(0.5);
    expect(k.cancelledRate).toBe(0);
  });

  it('nur abgebrochene Läufe ⇒ Ausfallquote 0, nicht 1 (kein Verdikt heisst kein Ausfall)', () => {
    const k = ciKennzahl([{ attempt: 1, conclusion: 'cancelled', status: 'completed' }]);
    expect(k.verdikte).toBe(0);
    expect(k.failureRate).toBe(0);
    expect(k.cancelledRate).toBe(1);
  });

  it('ohne abgeschlossene Läufe keine Division durch null', () => {
    expect(ciKennzahl([])).toMatchObject({ laeufe: 0, verdikte: 0, failureRate: 0, cancelledRate: 0, rerunRate: 0 });
  });
});

// ─────────────────────────── Token-/Kosten-Messung ───────────────────────────

describe('parseTokenMetriken', () => {
  // ACHTUNG, ausdrücklich (§7): Diese Fixture ist nach der
  // Prometheus-TEXTFORMAT-SPEZIFIKATION gebaut, NICHT von einem laufenden
  // Endpunkt abgeschrieben — beim Bau war der OTel-Export nicht aktiviert (die
  // Env-Variable wartet auf David). Metrik- und Labelnamen sind damit eine
  // begründete Annahme, keine Beobachtung. Sie sind beim ERSTEN REALEN LAUF
  // gegen die echte Ausgabe von localhost:9464/metrics zu verifizieren; das
  // Snapshot-Feld `metriken` führt die tatsächlich gefundenen Namen mit, damit
  // das ohne Zusatzaufwand möglich ist. Weicht die Wirklichkeit ab, wird DIESE
  // Fixture korrigiert — nicht der Parser aufgeweicht, bis er zufällig passt.
  const FIXTURE = [
    '# HELP claude_code_token_usage_tokens_total Number of tokens used',
    '# TYPE claude_code_token_usage_tokens_total counter',
    'claude_code_token_usage_tokens_total{type="input",model="claude-opus-5"} 1200',
    'claude_code_token_usage_tokens_total{type="output",model="claude-opus-5"} 340',
    'claude_code_token_usage_tokens_total{type="cacheRead",model="claude-opus-5"} 98000',
    'claude_code_token_usage_tokens_total{type="cacheCreation",model="claude-opus-5"} 5000',
    '# HELP claude_code_cost_usage_USD_total Cost in USD',
    '# TYPE claude_code_cost_usage_USD_total counter',
    'claude_code_cost_usage_USD_total{model="claude-opus-5"} 0.4231',
    '# fremde Metriken desselben Endpunkts',
    'process_cpu_seconds_total 1234.5',
    'go_goroutines 42',
  ].join('\n');

  it('summiert die Token-Zähler und schlüsselt nach Typ auf', () => {
    const k = parseTokenMetriken(FIXTURE)!;
    expect(k.gesamt).toBe(1200 + 340 + 98000 + 5000);
    expect(k.jeTyp).toEqual({ cacheCreation: 5000, cacheRead: 98000, input: 1200, output: 340 });
  });

  it('liest die Kosten und ignoriert fremde Metriken', () => {
    const k = parseTokenMetriken(FIXTURE)!;
    expect(k.kostenUsd).toBe(0.4231);
    expect(k.metriken).toEqual(['claude_code_cost_usage_USD_total', 'claude_code_token_usage_tokens_total']);
  });

  it('kommt mit abweichenden Metrik- und Label-Namen zurecht', () => {
    // Der Exporter hängt je nach Version andere Suffixe an, und der Typ kann
    // unter `token_type` stehen. Beides darf den Parser nicht auf 0 werfen —
    // genau dieses stille 0 wäre der teuerste Ausgang.
    const k = parseTokenMetriken(
      ['claude_code_token_usage{token_type="input"} 10', 'claude_code_token_usage{token_type="output"} 20'].join('\n'),
    )!;
    expect(k.gesamt).toBe(30);
    expect(k.jeTyp).toEqual({ input: 10, output: 20 });
  });

  it('macht ein fehlendes Typ-Label sichtbar, statt es zu verschweigen', () => {
    const k = parseTokenMetriken('claude_code_token_usage_total 77')!;
    expect(k.jeTyp).toEqual({ ohne_typ: 77 });
    expect(k.gesamt).toBe(77);
  });

  it('null heisst «keine claude_code-Metrik», nicht «null Token»', () => {
    expect(parseTokenMetriken('process_cpu_seconds_total 1')).toBeNull();
    expect(parseTokenMetriken('')).toBeNull();
    expect(parseTokenMetriken('# nur Kommentare\n')).toBeNull();
  });

  it('überspringt unbrauchbare Werte und kaputte Zeilen', () => {
    const k = parseTokenMetriken(
      ['claude_code_token_usage{type="input"} NaN', 'claude_code_token_usage{type="output"} 5', 'völliger Unsinn'].join('\n'),
    )!;
    expect(k.gesamt).toBe(5);
    expect(k.jeTyp).toEqual({ output: 5 });
  });

  it('kommt mit Zeitstempel-Spalte und escapten Labelwerten zurecht', () => {
    const k = parseTokenMetriken('claude_code_token_usage{type="in\\"put"} 3 1700000000000')!;
    expect(k.jeTyp).toEqual({ 'in"put': 3 });
  });

  it('kostenUsd bleibt null, wenn es keine Kosten-Metrik gibt', () => {
    expect(parseTokenMetriken('claude_code_token_usage{type="input"} 1')!.kostenUsd).toBeNull();
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
    tokens: null,
    fKlassen: {},
    fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null },
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

  // Gegenprüfung 7.8.2026: Die Prüfung deckte weniger, als ihre Konsumenten
  // voraussetzen. Eine Datei ohne `fKlassen` galt als valide, check:plan blieb
  // grün — und retro:17 starb an `Object.keys(undefined)`.
  it('meldet fehlendes fKlassen — retro:17 iteriert darüber', () => {
    const ohne = { ...snapshot() } as Partial<Snapshot>;
    delete ohne.fKlassen;
    expect(pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n')).toContain('fKlassen');
  });

  it('meldet fKlassen, das kein Zahlen-Register ist', () => {
    const falsch = snapshot({ fKlassen: { F1: 'viele' } as unknown as Record<string, number> });
    expect(pruefeZeitreihe(reihe([falsch])).join('\n')).toContain('fKlassen');
  });

  it('verlangt ci/rework/flaky/tokens ausdrücklich — null ja, fehlend nein', () => {
    for (const feld of ['ci', 'rework', 'flaky', 'tokens'] as const) {
      const ohne = { ...snapshot() } as Partial<Snapshot>;
      delete ohne[feld];
      const befunde = pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n');
      expect(befunde).toContain(`"${feld}" fehlt`);
    }
    // null bleibt zulässig: das IST die Ausfall-Semantik.
    expect(pruefeZeitreihe(reihe([snapshot({ ci: null, rework: null, flaky: null, tokens: null })]))).toEqual([]);
  });

  // QS-FREMDAGENTEN (Schema 3): dasselbe Muster wie bei ci/rework/flaky/tokens
  // oben, nur eine Ebene tiefer — das Block-Objekt selbst ist Pflicht, seine
  // beiden Quellen dürfen `null` sein.
  it('meldet fehlendes "fremdagenten"', () => {
    const ohne = { ...snapshot() } as Partial<Snapshot>;
    delete ohne.fremdagenten;
    expect(pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n')).toContain('"fremdagenten" fehlt');
  });

  it('akzeptiert fremdagenten mit lauter null-Quellen', () => {
    expect(
      pruefeZeitreihe(
        reihe([snapshot({ fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null } })]),
      ),
    ).toEqual([]);
  });

  it('akzeptiert eine vollständige Jules-/Gemini-Messung', () => {
    expect(
      pruefeZeitreihe(
        reihe([
          snapshot({
            fremdagenten: {
              jules: {
                prs_gemerged_7d: 3,
                prs_geschlossen_7d: 1,
                proben_7d: 1,
                prs_geschlossen_nummern: [662],
                median_dauer_min: 30,
                tickets_24h: 2,
                alarm: false,
              },
              gemini: { diskrepanz_laeufe: 2, diskrepanz_echt: 8, diskrepanz_schein: 1, zweitblick_durchgaenge: 0, kontingent_ereignisse: 0 },
              claude_token_pro_schritt: null,
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  // Schema 4: `proben_7d` und `prs_geschlossen_nummern` dürfen `null` sein —
  // das ist die Migrations-Aussage «diese Messung unterschied noch keine
  // Proben», nicht «null Proben gemessen».
  it('akzeptiert eine migrierte Jules-Messung ohne Proben-Unterscheidung', () => {
    expect(
      pruefeZeitreihe(
        reihe([
          snapshot({
            fremdagenten: {
              jules: {
                prs_gemerged_7d: 3,
                prs_geschlossen_7d: 1,
                proben_7d: null,
                prs_geschlossen_nummern: null,
                median_dauer_min: 30,
                tickets_24h: 2,
                alarm: false,
              },
              gemini: null,
              claude_token_pro_schritt: null,
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  it('meldet eine Jules-Messung, der die Schema-4-Felder ganz fehlen', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: {
          prs_gemerged_7d: 3,
          prs_geschlossen_7d: 1,
          median_dauer_min: 30,
          tickets_24h: 2,
          alarm: false,
        } as unknown as Snapshot['fremdagenten']['jules'],
        gemini: null,
        claude_token_pro_schritt: null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('fremdagenten.jules');
  });

  it('meldet ein unvollständiges "fremdagenten.jules"', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: { prs_gemerged_7d: 1 } as unknown as Snapshot['fremdagenten']['jules'],
        gemini: null,
        claude_token_pro_schritt: null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('fremdagenten.jules');
  });

  it('meldet claude_token_pro_schritt ungleich null', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: null,
        gemini: null,
        claude_token_pro_schritt: 123 as unknown as null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('claude_token_pro_schritt');
  });

  // Gegenprüfung 7.8.2026 (B6): Zonen-Offsets sind verboten, weil die
  // Chronologie lexikografisch entschieden wird. `…T09:00:00Z` ist SPÄTER als
  // `…T10:30:00+02:00`, die Zeichenkette behauptet das Gegenteil.
  it('lehnt Zeitstempel mit Zonen-Offset ab', () => {
    const mitOffset = snapshot({ erhobenAm: '2026-08-07T10:30:00+02:00' });
    expect(pruefeZeitreihe(reihe([mitOffset])).join('\n')).toContain('erhobenAm');
  });

  it('akzeptiert Z-Stempel mit und ohne Millisekunden', () => {
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: '2026-08-07T10:00:00Z' })]))).toEqual([]);
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: '2026-08-07T10:00:00.123Z' })]))).toEqual([]);
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
          ci: { laeufe: 50, verdikte: 35, failureRate: 0.23, cancelledRate: 0.3, rerunRate: 0.06, je: {} },
          torRot: { seitLetztem: { gesamt: 44, rot: 3, je: {} }, kumuliert: { gesamt: 44, rot: 3, je: {} } },
        }),
      ],
    };
    const zeile = selbstoptZeile(z)[0];
    expect(zeile).toContain('2026-08-07');
    expect(zeile).toContain('23 %');
    // Die Basis muss dastehen: 23 % von 35 Verdikten ist eine andere Aussage
    // als 23 % von 50 Läufen — und genau daran ist die erste Fassung gescheitert.
    expect(zeile).toContain('35 von 50');
    expect(zeile).toContain('3 von 44');
    // Der Zusatz ist nicht Zierde: ohne ihn liest sich die Zahl wie ein Urteil.
    expect(zeile).toContain('kein Tor-Kriterium');
  });

  it('bleibt vollständig, wenn die CI-Rate fehlt', () => {
    const z: Zeitreihe = { _generiert: GENERIERT_MARKE, schema: 1, snapshots: [snapshot()] };
    expect(selbstoptZeile(z)[0]).toContain('CI-Rate nicht erhoben');
  });
});

describe('befunde — Fremdagenten (QS-FREMDAGENTEN)', () => {
  const jules = (p: Partial<NonNullable<Snapshot['fremdagenten']['jules']>> = {}) => ({
    prs_gemerged_7d: 0,
    prs_geschlossen_7d: 0,
    proben_7d: 0,
    prs_geschlossen_nummern: [],
    median_dauer_min: null,
    tickets_24h: 0,
    alarm: false,
    ...p,
  });
  const gemini = (p: Partial<NonNullable<Snapshot['fremdagenten']['gemini']>> = {}) => ({
    diskrepanz_laeufe: 0,
    diskrepanz_echt: 0,
    diskrepanz_schein: 0,
    zweitblick_durchgaenge: 0,
    kontingent_ereignisse: 0,
    ...p,
  });
  const mitFremdagenten = (jules_: ReturnType<typeof jules> | null, gemini_: ReturnType<typeof gemini> | null): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 3,
    snapshots: [snapshot({ fremdagenten: { jules: jules_, gemini: gemini_, claude_token_pro_schritt: null } })],
  });
  /** Mehrere Snapshots mit aufsteigenden Stempeln, je einer Jules-Messung. */
  const reiheAus = (js: (ReturnType<typeof jules> | null)[]): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 4,
    snapshots: js.map((j, i) =>
      snapshot({
        erhobenAm: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
        fremdagenten: { jules: j, gemini: null, claude_token_pro_schritt: null },
      }),
    ),
  });
  const arten = (z: Zeitreihe) => befunde(z, '').map((b) => b.art);

  it('schweigt ganz, wenn fremdagenten nicht erhoben ist (null/null)', () => {
    expect(arten(mitFremdagenten(null, null))).toEqual([]);
  });

  // (a) Rückbau-Regel: Quote < 2/3 über n ≥ 3.
  it('(a) schlägt Rückbau vor, wenn die Quote unter der Schwelle liegt', () => {
    expect(JULES_QUOTE_MIN_N).toBe(3);
    expect(JULES_RUECKBAU_QUOTE).toBeCloseTo(2 / 3);
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 1, prs_geschlossen_7d: 2 }), null); // 1/3 < 2/3, n=3
    expect(arten(z)).toContain('jules-rueckbau');
  });

  it('(a) schweigt an der Schwelle selbst (2/3 ist NICHT < 2/3)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 2, prs_geschlossen_7d: 1 }), null); // genau 2/3
    expect(arten(z)).not.toContain('jules-rueckbau');
  });

  it('(a) schweigt unter der Mindest-Stichprobe, auch bei tiefer Quote', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 0, prs_geschlossen_7d: 1 }), null); // n=1 < 3
    expect(arten(z)).not.toContain('jules-rueckbau');
  });

  // (b) Skalierungs-Vorschlag: Quote ≥ 5/6 UND Median ≤ 45 min.
  it('(b) schlägt Skalierung vor, wenn Quote und Median beide die Schwelle reissen', () => {
    expect(JULES_SKALIEREN_QUOTE).toBeCloseTo(5 / 6);
    expect(JULES_SKALIEREN_MEDIAN_MAX_MIN).toBe(45);
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 45 }), null);
    expect(arten(z)).toContain('jules-skalieren');
  });

  it('(b) schweigt, wenn der Median über der Schwelle liegt (Quote allein reicht nicht)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 46 }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  it('(b) schweigt ohne auflösbare Dauer (median_dauer_min null)', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: null }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  // (b) Mindest-Stichprobe n >= 6 (Fahrplan §3, Zeile «Skalierung Jules»).
  it('(b) schweigt unter n = 6, auch wenn Quote und Median stimmen', () => {
    expect(JULES_SKALIEREN_MIN_N).toBe(6);
    // 5 gemerged / 0 geschlossen: Quote 100 %, Median gut — aber n = 5 < 6.
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 0, median_dauer_min: 10 }), null);
    expect(arten(z)).not.toContain('jules-skalieren');
  });

  // Beschriftung (Nachbesserung 4.9.2026): die Kennzahl heisst Landungsquote,
  // nicht «Quote ohne Nacharbeit» — geschlossen misst Ablehnung, nicht Nacharbeit.
  it('(a) nennt die Kennzahl Landungsquote und grenzt sie gegen Nacharbeit ab', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 1, prs_geschlossen_7d: 2, prs_geschlossen_nummern: [1, 2] }), null);
    const b = befunde(z, '').find((x) => x.art === 'jules-rueckbau');
    expect(b?.anlass).toContain('Landungsquote (gemerged ÷ (gemerged + geschlossen), Proben ausgeschlossen)');
    expect(b?.hinweis).toContain('geschlossen ≠ Nacharbeit; handgeführte Nacharbeits-Quote steht in Fahrplan §5');
  });

  it('(b) belegt die Skalierungs-Schwelle mit Fahrplan §3, nicht §2', () => {
    const z = mitFremdagenten(jules({ prs_gemerged_7d: 5, prs_geschlossen_7d: 1, median_dauer_min: 45, prs_geschlossen_nummern: [7] }), null);
    const b = befunde(z, '').find((x) => x.art === 'jules-skalieren');
    expect(b?.anlass).toContain('Fahrplan §3');
  });

  // (c) jeder NEU geschlossene Jules-PR ⇒ Lehre verankern. Je PR genau einmal.
  it('(c) schlägt vor, sobald ein Jules-PR geschlossen wurde, und nennt die Nummer', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }), null);
    expect(arten(z)).toContain('jules-lehre');
    expect(befunde(z, '').find((b) => b.art === 'jules-lehre')?.anlass).toContain('#662');
  });

  it('(c) schweigt ohne geschlossenen PR', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 0 }), null);
    expect(arten(z)).not.toContain('jules-lehre');
  });

  // ROT-BEWEIS der Nachbesserung: derselbe abgelehnte PR steht 7 Tage lang in
  // jedem Snapshot. Ohne Entdopplung schlägt die Regel bei jeder Erhebung
  // dieselbe Lehre erneut vor — Muster wie bei den F-Klassen, die nur NEUE
  // datierte Vorfälle melden.
  it('(c) feuert je PR-Nummer nur einmal — frühere Snapshots entdoppeln', () => {
    const z = reiheAus([
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
    ]);
    expect(arten(z)).not.toContain('jules-lehre');
  });

  it('(c) feuert wieder, sobald eine NEUE Nummer dazukommt — und nennt nur sie', () => {
    const z = reiheAus([
      jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: [662] }),
      jules({ prs_geschlossen_7d: 2, prs_geschlossen_nummern: [662, 700] }),
    ]);
    const b = befunde(z, '').find((x) => x.art === 'jules-lehre');
    expect(b?.anlass).toContain('#700');
    expect(b?.anlass).not.toContain('#662');
  });

  it('(c) ohne mitgeführte Nummern (Messung vor Schema 4) fällt auf die Zählung zurück', () => {
    const z = mitFremdagenten(jules({ prs_geschlossen_7d: 1, prs_geschlossen_nummern: null }), null);
    expect(arten(z)).toContain('jules-lehre');
  });

  // (d) Gemini Schein > echt.
  it('(d) schlägt Rückbau des Diskrepanz-Finders vor, wenn Schein überwiegt', () => {
    const z = mitFremdagenten(null, gemini({ diskrepanz_laeufe: 3, diskrepanz_echt: 1, diskrepanz_schein: 2 }));
    expect(arten(z)).toContain('gemini-rueckbau');
  });

  it('(d) schweigt, wenn echt mindestens gleich auf ist', () => {
    const z = mitFremdagenten(null, gemini({ diskrepanz_laeufe: 3, diskrepanz_echt: 2, diskrepanz_schein: 2 }));
    expect(arten(z)).not.toContain('gemini-rueckbau');
  });

  // (e) Phase-3-Durchgänge ≥ Schwelle (5).
  it('(e) schlägt vor, ab Schwelle Zweitblick-Durchgänge', () => {
    expect(ZWEITBLICK_DURCHGAENGE_SCHWELLE).toBe(5);
    const z = mitFremdagenten(null, gemini({ zweitblick_durchgaenge: 5 }));
    expect(arten(z)).toContain('zweitblick-schwelle');
  });

  it('(e) schweigt knapp unter der Schwelle', () => {
    const z = mitFremdagenten(null, gemini({ zweitblick_durchgaenge: 4 }));
    expect(arten(z)).not.toContain('zweitblick-schwelle');
  });

  // (f) jedes Kontingent-Ereignis.
  it('(f) schlägt vor, sobald ein Kontingent-Ereignis protokolliert ist', () => {
    const z = mitFremdagenten(null, gemini({ kontingent_ereignisse: 1 }));
    expect(arten(z)).toContain('kontingent-beleg');
  });

  it('(f) schweigt ohne Kontingent-Ereignis', () => {
    const z = mitFremdagenten(null, gemini({ kontingent_ereignisse: 0 }));
    expect(arten(z)).not.toContain('kontingent-beleg');
  });

  // (g) Alarm «Issue ohne Annahme».
  it('(g) schlägt vor, wenn die Jules-Messung einen Alarm meldet', () => {
    const z = mitFremdagenten(jules({ alarm: true, tickets_24h: 4 }), null);
    expect(arten(z)).toContain('jules-alarm');
  });

  it('(g) schweigt ohne Alarm', () => {
    const z = mitFremdagenten(jules({ alarm: false }), null);
    expect(arten(z)).not.toContain('jules-alarm');
  });
});

describe('vorschlagsZeile', () => {
  /** N Snapshots mit aufsteigenden Zeitstempeln; der letzte trägt die Daten. */
  const reiheMit = (n: number, letzter: Partial<Snapshot> = {}): Zeitreihe => ({
    _generiert: GENERIERT_MARKE,
    schema: 2,
    snapshots: Array.from({ length: n }, (_, i) =>
      snapshot({
        erhobenAm: `2026-08-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
        ...(i === n - 1 ? letzter : {}),
      }),
    ),
  });

  it('schweigt still, wenn es keine (brauchbare) Zeitreihe gibt', () => {
    expect(vorschlagsZeile(null)).toEqual([]);
    expect(vorschlagsZeile(reiheMit(0))).toEqual([]);
  });

  it('nennt bei dünner Datenlage den Zählerstand', () => {
    const zeile = vorschlagsZeile(reiheMit(2))[0];
    expect(zeile).toContain(`Datenlage 2/${MIN_SNAPSHOTS}`);
    expect(zeile).toContain('zu dünn');
  });

  it('zählt ab genügender Datenlage die offenen Vorschläge', () => {
    const z = reiheMit(MIN_SNAPSHOTS, {
      ci: { laeufe: 50, verdikte: 50, failureRate: 0.9, cancelledRate: 0, rerunRate: 0.9, je: {} },
    });
    const zeile = vorschlagsZeile(z)[0];
    expect(zeile).toContain('2 Vorschlagsblöcke offen'); // ci-failure + ci-rerun
    expect(zeile).toContain('retro:17');
  });

  it('sagt es, wenn nichts über den Schwellen liegt', () => {
    expect(vorschlagsZeile(reiheMit(MIN_SNAPSHOTS))[0]).toContain('keine Vorschläge über den Schwellen');
  });

  // Der Pflicht-Einstieg darf keine Chronik lesen (~186 KB, Regex je Tor-Name).
  // Die Zahl hängt nicht davon ab — das ist die Voraussetzung dafür, sie
  // wegzulassen, und wird hier festgenagelt statt bloss behauptet.
  it('die Vorschlagszahl ist unabhängig vom Chronik-Text', () => {
    const z = reiheMit(MIN_SNAPSHOTS, {
      torRot: {
        seitLetztem: { gesamt: 0, rot: 0, je: {} },
        kumuliert: { gesamt: 20, rot: 5, je: { 'check:wackel': { gesamt: 20, rot: 5 } } },
      },
    });
    expect(befunde(z, '').length).toBe(befunde(z, 'check:wackel wurde am 1.1.2026 gebaut').length);
  });
});

describe('lageBlock — Andock-Muster', () => {
  let pos = 0;
  const einheit = (id: string): Einheit => ({
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung', pos: pos++,
    etikett: { id, status: 'ready', blocker: null, dep: [], feld: null, fahrplan: null },
  });
  const kaputt = () => { throw new Error('git fehlt'); };

  it('hängt die Messreihen-Zeile GENAU EINMAL ans Ende an', () => {
    const zeilen = lageBlock([einheit('QS-SELBSTOPT')], [], { prs: false, laufe: kaputt, zeitreihe: () => null });
    const treffer = zeilen.filter((z) => z.startsWith('📈'));
    expect(treffer).toHaveLength(1);
    expect(zeilen[zeilen.length - 1]).toBe(treffer[0]);
  });

  /** Alle von QS-SELBSTOPT angehängten Zeilen — Messreihe und Vorschlagslage. */
  const ohneSelbstopt = (zeilen: string[]): string[] =>
    zeilen.filter((z) => !z.startsWith('📈') && !z.trimStart().startsWith('Selbstopt:'));

  it('zieht man die neuen Zeilen ab, ist der Block wie vorher', () => {
    const opt = { prs: false, laufe: kaputt } as const;
    const ohne = ohneSelbstopt(lageBlock([einheit('QS-A')], [], { ...opt, zeitreihe: () => null }));
    const mit = ohneSelbstopt(
      lageBlock([einheit('QS-A')], [], {
        ...opt,
        zeitreihe: () => ({ _generiert: GENERIERT_MARKE, schema: 2, snapshots: [snapshot()] }),
      }),
    );
    expect(mit).toEqual(ohne);
  });

  it('die Vorschlagszeile hängt unter der Messreihen-Zeile, nie dazwischen', () => {
    const zeilen = lageBlock([einheit('QS-B')], [], {
      prs: false,
      laufe: kaputt,
      zeitreihe: () => ({ _generiert: GENERIERT_MARKE, schema: 2, snapshots: [snapshot()] }),
    });
    const iMess = zeilen.findIndex((z) => z.startsWith('📈'));
    const iVor = zeilen.findIndex((z) => z.trimStart().startsWith('Selbstopt:'));
    expect(iMess).toBeGreaterThanOrEqual(0);
    expect(iVor).toBe(iMess + 1);
    expect(iVor).toBe(zeilen.length - 1);
  });
});
