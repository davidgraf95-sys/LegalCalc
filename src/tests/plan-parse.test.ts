// src/tests/plan-parse.test.ts
import { parseRoadmap } from '../../scripts/plan/parse';

const FIXTURE = `# Plan

## Die geordnete Abarbeitung

<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Recherche offen
§4-lizenz: Live-Rechtsprechung — CORS unbestätigt
-->

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ)*
  <!-- @meta id: W1·1 · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  Prosa hier.
- [ ] **6 · Konsultieren** *(amtlich)*
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · kollision: [src/lib/norm-index.ts] · worktree: ja · 26x: nein -->

## Querschnitt-Band

- **Performance** *(QS-PERF)*
  <!-- @meta id: QS-PERF · status: wip(perf-wt) · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->

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
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers', 'b1: grund', '-->', '- [ ] **x**', '  <!-- @meta id: A · status: blocked · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\r\n');
    const { blockers, einheiten } = parseRoadmap(md);
    expect(blockers.b1).toBe('grund');
    expect(einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('einzeiliger @blockers-Kommentar schluckt nicht das ganze Dokument', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers b1: x -->', '- [ ] **y**', '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
    expect(parseRoadmap(md).einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('einzeiliger @blockers MIT Inline-Eintrag registriert ihn', () => {
    const md = ['## Die geordnete Abarbeitung', '<!-- @blockers b1: grund -->', '- [ ] **y**', '  <!-- @meta id: A · status: blocked · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
    const { blockers, einheiten } = parseRoadmap(md);
    expect(blockers.b1).toBe('grund');
    expect(einheiten.map((e) => e.id)).toEqual(['A']);
  });
  it('Checkbox [X] gross + * /+ -Bullets werden erkannt', () => {
    const md = ['## Die geordnete Abarbeitung', '* [X] **z**', '  <!-- @meta id: A · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
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
    '    <!-- @meta id: W2·17-UI-BEFUNDE-B20 · status: ready · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->';

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
    '  <!-- @meta id: W2·5g-ZEIT · status: parked · blocker: zeit-historik-poc · dep: [] · kollision: [] · worktree: ja · 26x: nein -->',
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
      '  <!-- @meta id: QS-DATA · status: blocked · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBeNull();
  });

  it('bricht an einer Überschrift ab', () => {
    const md = [
      '- [x] **weit oben**',
      '',
      '## ⚡ S0 — fristgetrieben',
      '<!-- @meta id: S0 · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBeNull();
  });

  it('bricht an einer fremden Kommentar-Grenze (@meta darüber) ab', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [x] **7-BEZUG · Dach**',
      '  - [x] **B7 · Unterschritt**',
      '    <!-- @meta id: B7 · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
      '  Detail: Chronik.',
      '  <!-- @meta id: BEZUG · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
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
      '  <!-- @meta id: A · status: done · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
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
      '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[ ]');
  });

  it('bindet auch, wenn die Bullet «<!--» im eigenen Titel führt (Fund R3-7)', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [~] **A · Kommentar-Syntax «<!--» im Titel**',
      '  <!-- @meta id: A · status: wip · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    expect(parseRoadmap(md).einheiten[0].checkbox).toBe('[~]');
  });

  it('EINE Leerzeile zwischen Bullet und @meta bindet weiterhin', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '- [~] **läuft**',
      '',
      '  <!-- @meta id: A · status: wip · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
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
