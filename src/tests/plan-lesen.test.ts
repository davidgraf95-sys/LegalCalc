// src/tests/plan-lesen.test.ts — die LESENDEN Plan-Werkzeuge. Ein Werkzeug-Strang, eine Datei: scripts/plan/{parse,etikett,dump,next}.
// Zusammengelegt 31.8.2026 (QS-EFFIZIENZ, Ent-Regulierung Runde 2 Batch B; Beleg:
// bibliothek/betrieb/testapparat-fang-historie-2026-08-31.md §3 Kandidat 1). Die
// Fälle stehen WÖRTLICH unter dem Banner ihrer Herkunftsdatei; gestrichen wurde
// nur ein wörtliches Rumpf-Duplikat (ROADMAP-CHRONIK.md, 31.8.2026).
import { dump } from '../../scripts/plan/dump';
import { parseEtikett, serializeEtikett } from '../../scripts/plan/etikett';
import { resolve } from '../../scripts/plan/next';
import { parseRoadmap } from '../../scripts/plan/parse';
import type { Einheit } from '../../scripts/plan/parse';

// ─── aus src/tests/plan-parse.test.ts ──────────────────────────────────────────
// src/tests/plan-parse.test.ts

const FIXTURE = `# Plan

## Die geordnete Abarbeitung

<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Recherche offen
§4-lizenz: Live-Rechtsprechung — CORS unbestätigt
-->

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ)*
  <!-- @meta id: W1·1 · status: done · blocker: null · dep: [] · feld: betrieb -->
  Prosa hier.
- [ ] **6 · Konsultieren** *(amtlich)*
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · feld: betrieb -->

## Querschnitt-Band

- **Performance** *(QS-PERF)*
  <!-- @meta id: QS-PERF · status: wip(perf-wt) · blocker: null · dep: [] · feld: betrieb -->

## Geparkt

- **Markt-Themen** — kein Etikett hier.
`;

describe('parseRoadmap', () => {
  it('liest Einheiten mit Checkbox + Sektion', () => {
    const { einheiten } = parseRoadmap(FIXTURE);
    const ids = einheiten.map((e) => e.id);
    expect(ids).toEqual(['W1·1', 'W2·6', 'QS-PERF']);
    const w11 = einheiten.find((e) => e.id === 'W1·1')!;
    expect(w11.checkbox).toBe('[x]');
    expect(w11.sektion).toBe('Die geordnete Abarbeitung');
    const qs = einheiten.find((e) => e.id === 'QS-PERF')!;
    expect(qs.checkbox).toBeNull(); // Querschnitt-Bullet ohne Checkbox
    // Alt-Notation `wip(agent)` bleibt lesbar; der Agent-Zusatz ist gestrichen.
    expect(qs.etikett.status).toBe('wip');
  });

  it('liest das @blockers-Register', () => {
    const { blockers } = parseRoadmap(FIXTURE);
    expect(Object.keys(blockers)).toEqual(['wbqdyap3x', '§4-lizenz']);
    expect(blockers['wbqdyap3x']).toContain('Recherche offen');
  });
});

describe('parseRoadmap — Robustheit', () => {
  it('CRLF: @blockers werden trotz \\r geparst', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers', 'b1: grund', '-->', '- [ ] **x**', '  <!-- @meta id: A · status: blocked · blocker: b1 · dep: [] · feld: betrieb -->'].join('\r\n');
    const { blockers, einheiten } = parseRoadmap(md);
    expect(blockers.b1).toBe('grund');
    expect(einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('einzeiliger @blockers-Kommentar schluckt nicht das ganze Dokument', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers b1: x -->', '- [ ] **y**', '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · feld: betrieb -->'].join('\n');
    expect(parseRoadmap(md).einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('einzeiliger @blockers MIT Inline-Eintrag registriert ihn', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers b1: grund -->', '- [ ] **y**', '  <!-- @meta id: A · status: blocked · blocker: b1 · dep: [] · feld: betrieb -->'].join('\n');
    const { blockers, einheiten } = parseRoadmap(md);
    expect(blockers.b1).toBe('grund');
    expect(einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('Checkbox [X] gross + * /+ -Bullets werden erkannt', () => {
    const md = ['## Die geordnete Abarbeitung', '* [X] **z**', '  <!-- @meta id: A · status: done · blocker: null · dep: [] · feld: betrieb -->'].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[x]');
  });
});

// ---------------------------------------------------------------------------
// Fund R2-1/R2-10 der Endprüfung Runde 2 (31.7.2026) — KRITISCH.
//
// Die Checkbox wurde in der «nächsten nicht-leeren Zeile DARÜBER» gesucht und die
// Suche dort abgebrochen. Steht zwischen Bullet und @meta auch nur EINE Prosa-
// Zeile, bindet parse.ts die Checkbox nicht mehr (`checkbox = null`) — und
// check.ts Regel 2 prüft nur `if (e.checkbox && …)`, ist also genau dort blind.
// Folge: `plan:set <id> status=done` schreibt das @meta, lässt die sichtbare
// Liste auf «offen» stehen, und kein Tor sieht es (§6.7).
//
// Belegt am echten Bestand (31.7.2026):
//   W2·17-UI-BEFUNDE-B20 — Bullet, 5 Prosa-Zeilen, @meta  → checkbox = null
//   W2·5g-ZEIT           — Bullet, 1 Prosa-Zeile,  @meta  → checkbox = null
// Beide Layouts stehen unten WÖRTLICH als Fixture; sie sind der Rot-Beweis.
//
// Neue Regel: rückwärts bis zur ersten Listen-Bullet-Zeile im selben Block; deren
// Checkbox bindet (hat sie keine, bindet nichts). Abbruch an Überschrift,
// Kommentar-Grenze (`<!--`/`-->`, also auch an einem fremden @meta) und an einer
// doppelten Leerzeile.
// ---------------------------------------------------------------------------
describe('parseRoadmap — Checkbox-Bindung über Prosa hinweg (Fund R2-1/R2-10)', () => {
  const META_B20 =
    '    <!-- @meta id: W2·17-UI-BEFUNDE-B20 · status: ready · blocker: null · dep: [] · feld: betrieb -->';

  // Wörtlich aus ROADMAP.md Z.700-706 (Stand f9d7fbb74).
  const B20_LAYOUT = [
    '## Die geordnete Abarbeitung',
    '  - [ ] **B20 · Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)** — 15 Befunde (Blocker 1 · Hoch 5). §21.',
    '    **`dep: []` seit 31.7.2026 (Endprüfungs-Fund 18):** B20 ist kein Neubau, sondern Nachmessung,',
    '    und trägt mit LM-062 den einzigen Blocker der «bereits gebaut»-Klasse. Am Kettenende hätte die',
    '    Behauptung «ist gebaut» erst nach 19 Bau-Batches geprüft — erwiese sie sich als falsch, entstünde',
    '    der Bau-Posten am spätesten möglichen Punkt. B20 ist damit **unabhängig und vorziehbar**; die',
    '    Bau-Kette B1→…→B19 bleibt unverändert seriell. `plan:next` führt B20 dadurch gewollt in ready-now.',
    META_B20,
  ].join('\n');

  // Wörtlich aus ROADMAP.md Z.448-450.
  const ZEIT_LAYOUT = [
    '## Die geordnete Abarbeitung',
    '- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)*:',
    '  **Status 20.7.2026 (David):** «irgendwann, aktuell nicht relevant» → von `blocked` auf `parked`; der Blocker `zeit-historik-poc` bleibt bestehen.',
    '  <!-- @meta id: W2·5g-ZEIT · status: parked · blocker: zeit-historik-poc · dep: [] · feld: betrieb -->',
  ].join('\n');

  it('B20-Layout (Bullet, 5 Prosa-Zeilen, @meta) bindet die Checkbox', () => {
    expect(parseRoadmap(B20_LAYOUT).einheiten[0].checkbox).toBe('[ ]');
  });

  it('W2·5g-ZEIT-Layout (Bullet, 1 Prosa-Zeile, @meta) bindet die Checkbox', () => {
    expect(parseRoadmap(ZEIT_LAYOUT).einheiten[0].checkbox).toBe('[ ]');
  });

  // Gegenprobe zur Gegenrichtung: die neue Suche darf NICHT über eine fremde
  // Bullet-Zeile hinweg an eine beliebige Checkbox weiter oben binden. Layout
  // wörtlich nach ROADMAP.md Z.212-214 (QS-DATA unter der QS-PERF-Befundliste):
  // eine Checkbox-Bullet der Nachbar-Liste steht direkt über der eigenen,
  // checkbox-losen Querschnitt-Bullet.
  it('bindet NICHT an die Checkbox einer fremden Bullet-Zeile darüber', () => {
    const md = [
      '## Querschnitt-Band',
      '  - [ ] **e2e-Shard-Balance gegen GEMESSENE CI-Dauern packen** — geparkt.',
      '- **Datenhaltung / Single-Source-DB** *(QS-DATA)*.',
      '  <!-- @meta id: QS-DATA · status: blocked · blocker: b1 · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBeNull();
  });

  it('bricht an einer Überschrift ab', () => {
    const md = [
      '- [x] **weit oben**',
      '',
      '## ⚡ S0 — fristgetrieben',
      '<!-- @meta id: S0 · status: done · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBeNull();
  });

  it('bricht an einer fremden Kommentar-Grenze (@meta darüber) ab', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [x] **7-BEZUG · Dach**',
      '  - [x] **B7 · Unterschritt**',
      '    <!-- @meta id: B7 · status: done · blocker: null · dep: [] · feld: betrieb -->',
      '  Detail: Chronik.',
      '  <!-- @meta id: BEZUG · status: done · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    const e = parseRoadmap(md).einheiten;
    expect(e.find((x) => x.id === 'B7')!.checkbox).toBe('[x]');
    expect(e.find((x) => x.id === 'BEZUG')!.checkbox).toBeNull();
  });

  it('bricht an einer doppelten Leerzeile ab', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [x] **weit oben**',
      '',
      '',
      '  <!-- @meta id: A · status: done · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBeNull();
  });

  // Fund R3-7 (Endprüfung Runde 3): Die Kommentar-Grenzen-Prüfung stand VOR dem
  // Bullet-Test. `z.includes('-->')` trifft aber auch, wenn die Zeichenfolge
  // blosser Fliesstext der Bullet selbst ist — ein Pfeil im Schritt-Titel genügt.
  // Folge: die Bindung brach ab (`checkbox = null`), und Regel 10 wurde
  // falsch-positiv rot mit einer Meldung, die auf die falsche Ursache zeigt.
  // Eine Bullet-Zeile ist nie eine Kommentar-Grenze.
  it('bindet auch, wenn die Bullet «-->» im eigenen Titel führt (Fund R3-7)', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [ ] **A · Migration (Pfeil: alt --> neu)**',
      '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[ ]');
  });

  it('bindet auch, wenn die Bullet «<!--» im eigenen Titel führt (Fund R3-7)', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [~] **A · Kommentar-Syntax «<!--» im Titel**',
      '  <!-- @meta id: A · status: wip · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[~]');
  });

  it('EINE Leerzeile zwischen Bullet und @meta bindet weiterhin', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [~] **läuft**',
      '',
      '  <!-- @meta id: A · status: wip · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[~]');
  });
});

// @queue-Direktive (Einbau 24.7.2026): die EINE maschinenlesbare Prioritäts-Quelle.
describe('parseRoadmap — @queue', () => {
  it('liest die @queue-Direktive als ID-Liste', () => {
    const md = FIXTURE.replace('<!-- @blockers', '<!-- @queue: W2·6, QS-PERF -->\n<!-- @blockers');
    expect(parseRoadmap(md).queue).toEqual(['W2·6', 'QS-PERF']);
  });
  it('ohne Direktive: leere Queue', () => {
    expect(parseRoadmap(FIXTURE).queue).toEqual([]);
  });
  it('pinnt die Sektions-Ableitung der Querschnitt-Überschrift (next.ts-Filter hängt am Präfix)', () => {
    const md = FIXTURE.replace('## Querschnitt-Band', '## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)');
    const qs = parseRoadmap(md).einheiten.find((e) => e.id === 'QS-PERF')!;
    expect(qs.sektion.startsWith('Querschnitt-Band')).toBe(true);
  });
});


// ─── aus src/tests/plan-etikett.test.ts ────────────────────────────────────────
// src/tests/plan-etikett.test.ts

const ZEILE =
  '  <!-- @meta id: W2·6 · status: wip · blocker: null · dep: [W1·4] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-X.md -->';

describe('parseEtikett', () => {
  it('parst alle Felder: Liste, null', () => {
    const e = parseEtikett(ZEILE);
    expect(e.id).toBe('W2·6');
    expect(e.status).toBe('wip');
    expect(e.blocker).toBeNull();
    expect(e.dep).toEqual(['W1·4']);
    expect(e.feld).toBe('korpus');
    expect(e.fahrplan).toBe('fahrplaene/FAHRPLAN-X.md');
  });

  it('leere Liste + gesetzter blocker + fehlendes feld', () => {
    const e = parseEtikett(
      '<!-- @meta id: W1·4 · status: parked · blocker: wbqdyap3x · dep: [] -->',
    );
    expect(e.dep).toEqual([]);
    expect(e.blocker).toBe('wbqdyap3x');
    // Kein Wurf: die Pflicht prüft check.ts Regel 14 — ein fehlendes Feld darf
    // nicht die ganze Werkzeugkette lahmlegen (Kommentar in etikett.ts).
    expect(e.feld).toBeNull();
  });

  it('toleriert unbekanntes feld-Vokabular beim Parsen (check.ts meldet es)', () => {
    const e = parseEtikett('<!-- @meta id: X · status: ready · blocker: null · dep: [] · feld: lesser -->');
    expect(e.feld).toBe('lesser');
  });

  it('wirft bei ungültigem Status', () => {
    expect(() => parseEtikett('<!-- @meta id: X · status: fertig · blocker: null · dep: [] · feld: betrieb -->')).toThrow();
  });

  it('toleriert die gestrichenen Altfelder im Bestand und schreibt sie nie zurück', () => {
    // QS-PLAN-EINFACH (14.8.2026) strich `of`/`seq-hart`/`seq-weich`, die
    // Steuerungs-Diät (29.8.2026) `kollision`/`worktree`/`26x`/`groesse`/`slot`.
    // Alt-Zeilen (Archiv, alte Branches) dürfen die Werkzeugkette nicht
    // lahmlegen; die Felder werden gelesen und ignoriert.
    const e = parseEtikett(
      '<!-- @meta id: ALT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/x.ts] · ' +
        'seq-hart: [X(y)] · worktree: ja · 26x: ja · groesse: L · slot: inhaber · feld: betrieb -->',
    );
    expect(e.id).toBe('ALT');
    expect(e.feld).toBe('betrieb');
    // Der Serializer schreibt sie nie mehr — plan:set räumt sie mechanisch ab.
    const wieder = serializeEtikett(e, '');
    for (const tot of ['of:', 'seq-hart', 'kollision', 'worktree', '26x', 'groesse', 'slot']) {
      expect(wieder).not.toContain(tot);
    }
  });
});

describe('serializeEtikett', () => {
  it('round-trip: parse→serialize→parse ist stabil', () => {
    const e = parseEtikett(ZEILE);
    const wieder = parseEtikett(serializeEtikett(e, '  '));
    expect(wieder).toEqual(e);
  });
});

describe('parseEtikett — Robustheit', () => {
  it('leere Listen-Member werden gefiltert', () => {
    const e = parseEtikett('<!-- @meta id: A · status: ready · blocker: null · dep: [W1,] · feld: betrieb -->');
    expect(e.dep).toEqual(['W1']);
  });
  it('`feld` und `fahrplan` überleben den Round-Trip byte-gleich an ihrer Position', () => {
    // Ein Feld, das serializeEtikett verwirft oder umstellt, geht bei jedem
    // `plan:set` still verloren bzw. erzeugt Diff-Rauschen.
    expect(serializeEtikett(parseEtikett(ZEILE), '  ')).toBe(ZEILE);
    const ohne = '<!-- @meta id: A · status: ready · blocker: null · dep: [] -->';
    expect(serializeEtikett(parseEtikett(ohne), '')).toBe(ohne);
  });
});


// ─── aus src/tests/plan-dump.test.ts ───────────────────────────────────────────
// src/tests/plan-dump.test.ts
//
// Fund R2-3 (Endprüfung Runde 2, 31.7.2026): Der ad-hoc-«einheiten-dump», mit dem
// die Verhaltensneutralität der ROADMAP-Umbauten belegt wurde, führte das Feld
// `checkbox` nicht — er konnte in genau dem Feld nicht scheitern, in dem die
// B20-Regression steckte, und meldete «GENAU 2 Zeilen» statt drei. Der Dump ist
// deshalb ein benanntes Skript geworden; diese Tests halten fest, dass er ALLE
// Felder führt und dass er den historischen Rot-Fall sieht.

const MD = [
  '## Die geordnete Abarbeitung',
  '<!-- @queue: A -->',
  '<!-- @blockers',
  'b1: grund',
  '-->',
  '- [ ] **A · X**',
  '  Prosa dazwischen.',
  '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-X.md -->',
].join('\n');

describe('plan:dump', () => {
  it('führt jedes Feld der Einheit — inkl. checkbox, pos, sektion', () => {
    const zeile = dump(MD).split('\n')[0];
    for (const feld of ['id=', 'pos=', 'checkbox=', 'sektion=', 'status=',
      'blocker=', 'dep=', 'feld=', 'fahrplan=']) {
      expect(zeile).toContain(feld);
    }
    expect(zeile).toContain('checkbox=[ ]');
  });

  it('führt @queue und das @blockers-Register', () => {
    const out = dump(MD);
    expect(out).toContain('@queue=[A]');
    expect(out).toContain('@blocker b1=grund');
  });

  // Der historische Fall: derselbe Schritt, einmal mit gebundener und einmal mit
  // gekappter Checkbox. Der alte Dump war hier byte-gleich, der neue nicht.
  it('sieht eine geänderte Checkbox-Bindung (der Fall, den der alte Dump durchwinkte)', () => {
    const ohne = MD.replace('- [ ] **A · X**', '- **A · X**');
    expect(dump(ohne)).not.toBe(dump(MD));
    expect(dump(ohne).split('\n')[0]).toContain('checkbox=—');
  });
});


// ─── aus src/tests/plan-next.test.ts ───────────────────────────────────────────
// src/tests/plan-next.test.ts

// `pos` = Dokumentreihenfolge. Im Test zählt ein Modul-Zähler hoch, damit die
// Aufrufreihenfolge der Helferfunktion die ROADMAP-Reihenfolge nachbildet.
let posZaehler = 0;
function einheit(id: string, p: Partial<Einheit['etikett']> = {}): Einheit {
  return {
    id, checkbox: null, sektion: 'Die geordnete Abarbeitung', pos: posZaehler++,
    etikett: { id, status: 'ready', blocker: null, dep: [], feld: null, fahrplan: null, ...p },
  };
}

describe('resolve', () => {
  it('ready-now nur bei status=ready, kein blocker, deps done', () => {
    const b = resolve([
      einheit('A'),
      einheit('B', { status: 'blocked', blocker: 'wbqdyap3x' }),
      einheit('D', { status: 'parked' }),
      einheit('E', { dep: ['Z'] }),
    ]);
    expect(b.readyNow).toContain('A');
    expect(b.blockiert.map((x) => x.id)).toEqual(['B']);
    expect(b.geparkt).toEqual(['D']);
    expect(b.wartetDep).toEqual([{ id: 'E', offen: ['Z'] }]);
  });

  it('dep erfüllt, wenn Abhängigkeit done', () => {
    const b = resolve([einheit('Z', { status: 'done' }), einheit('E', { dep: ['Z'] })]);
    expect(b.readyNow).toContain('E');
  });

  it('Lanes: verschiedene Baufelder parallel, gleiches Feld in getrennte Lanes', () => {
    const b = resolve([
      einheit('A', { feld: 'leser' }),
      einheit('B', { feld: 'korpus' }),
      einheit('C', { feld: 'leser' }),
    ]);
    // A+B verschiedene Felder → eine Lane; C teilt das Feld von A → eigene Lane
    expect(b.lanes).toEqual([['A', 'B'], ['C']]);
  });
});

// Ersetzt die 26×-Slot-Sperre (Regeln 5/5b/5c, Felder `26x`/`slot`), gestrichen
// mit der Steuerungs-Diät 29.8.2026. Die Nachfolge WARNT statt zu sperren: ein
// Baufeld bündelt sieben statt hunderter Flächen, eine harte Sperre wäre darum
// zu grob. Wer trotzdem baut, tut es im eigenen Worktree (§12).
describe('resolve — Kollisionswarnung über das Baufeld', () => {
  it('ein wip belegt sein Feld; ein ready-Schritt desselben Felds wird gemeldet', () => {
    const b = resolve([
      einheit('P', { status: 'wip', feld: 'korpus' }),
      einheit('Q', { feld: 'korpus' }),
    ]);
    // Anders als beim alten 26×-Slot bleibt Q BAUBAR — die Warnung ersetzt die Sperre.
    expect(b.readyNow).toEqual(['Q']);
    expect(b.feldBelegt).toEqual([{ id: 'Q', feld: 'korpus', durch: 'P' }]);
  });

  it('anderes Feld auf wip → keine Warnung', () => {
    const b = resolve([
      einheit('P', { status: 'wip', feld: 'korpus' }),
      einheit('Q', { feld: 'leser' }),
    ]);
    expect(b.feldBelegt).toEqual([]);
  });

  it('Schritt ohne Feld erzeugt keine Warnung (nichts behauptet, was man nicht weiss)', () => {
    const b = resolve([einheit('P', { status: 'wip', feld: 'korpus' }), einheit('Q')]);
    expect(b.feldBelegt).toEqual([]);
  });
});

describe('resolve — Lane-Sicherheit + inArbeit (Sweep)', () => {
  it('fehlendes feld → konservativ eigene Lane (nicht co-laned)', () => {
    const b = resolve([einheit('A'), einheit('B')]);
    expect(b.lanes).toEqual([['A'], ['B']]);
  });
  it('ein Schritt OHNE Feld kollidiert auch mit einem, der eines trägt', () => {
    const b = resolve([einheit('A'), einheit('B', { feld: 'design' })]);
    expect(b.lanes).toEqual([['A'], ['B']]);
  });
  it('verschiedene Felder → co-laned', () => {
    const b = resolve([einheit('A', { feld: 'werkzeuge' }), einheit('B', { feld: 'suche' })]);
    expect(b.lanes).toEqual([['A', 'B']]);
  });
  it('wip-Einheit erscheint in inArbeit, nicht lautlos weg', () => {
    const b = resolve([einheit('A', { status: 'wip' }), einheit('B')]);
    expect(b.inArbeit).toEqual(['A']);
    expect(b.readyNow).toEqual(['B']);
  });
});

// GEÄNDERTE SEMANTIK 24.7.2026 (deklarierter Tooling-Schritt): @queue-Rang vor
// pos-Ordnung. Der frühere Querschnitt-Filter (Sektion «Querschnitt-Band» läuft
// begleitend) ist mit dem Plan-Neuschnitt vom 29.8.2026 entfallen — die ROADMAP
// gliedert nach Baufeldern, eine Querschnitt-Sektion gibt es nicht mehr.
describe('resolve — @queue-Rang', () => {
  it('gequeuete IDs führen in Queue-Reihenfolge, auch gegen die pos-Ordnung', () => {
    const b = resolve([einheit('A'), einheit('B')], ['B', 'A']);
    expect(b.readyNow).toEqual(['B', 'A']);
  });
  it('nicht-gequeuete IDs behalten ihre pos-Ordnung hinter der Queue (stabiler Sort)', () => {
    const b = resolve([einheit('X'), einheit('Y'), einheit('Z')], ['Z']);
    expect(b.readyNow).toEqual(['Z', 'X', 'Y']);
  });
  it('die Sektion steuert nichts mehr — ein Schritt aus jeder Sektion kann oberster sein', () => {
    // Absicherung des Neuschnitts: früher hätte die Sektion «Querschnitt-Band»
    // diesen Schritt aus readyNow herausgefiltert.
    const qs: Einheit = { ...einheit('QS'), sektion: 'Betrieb & Prüfstrasse' };
    const b = resolve([qs, einheit('W')]);
    expect(b.readyNow).toEqual(['QS', 'W']);
  });
  it('ohne Queue bleibt die pos-Ordnung unverändert (Rückwärtskompatibilität)', () => {
    const b = resolve([einheit('E1'), einheit('E2')]);
    expect(b.readyNow).toEqual(['E1', 'E2']);
  });
});
