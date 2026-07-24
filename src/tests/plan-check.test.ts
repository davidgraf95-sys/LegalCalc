import { pruefe } from '../../scripts/plan/check';

const OK = `## Die geordnete Abarbeitung
<!-- @blockers
wbqdyap3x: I2 offen
-->
- [x] **1 · A**
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **4 · D**
  <!-- @meta id: W1·4 · status: blocked · of: ja · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

Siehe FAHRPLAN-PLAN-STEUERUNG.md.
`;
const inv = ['W1·1', 'W1·4'];
const existiert = () => true;

describe('pruefe', () => {
  it('sauberer Plan → keine Probleme', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv)).toEqual([]);
  });

  it('done mit [ ]-Checkbox → Problem', () => {
    const bad = OK.replace('- [x] **1 · A**', '- [ ] **1 · A**');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv).some((p) => p.id === 'W1·1')).toBe(true);
  });

  it('blocker nicht im Register → Problem', () => {
    const bad = OK.replace('blocker: wbqdyap3x', 'blocker: xxxxx');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv).some((p) => p.id === 'W1·4')).toBe(true);
  });

  it('Inventar-ID ohne @meta → Problem', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, ['W1·1', 'W1·4', 'W2·6']).some((p) => p.id === 'W2·6')).toBe(true);
  });

  it('nicht verlinkte FAHRPLAN-Datei → Problem', () => {
    expect(pruefe(OK, ['FAHRPLAN-PLAN-STEUERUNG.md', 'FAHRPLAN-GEISTER.md'], existiert, inv).some((p) => /GEISTER/.test(p.meldung))).toBe(true);
  });

  // Regel (4c), Befund 20.7.2026: W2·6a-MAT stand auf done und hing an
  // W2·7-VZUI (ready) — die Regel fehlte, also fiel der falsche Plan-Zustand
  // monatelang nicht auf. Beide Richtungen festhalten.
  it('done mit offenem dep → Problem', () => {
    const bad = OK.replace(
      'id: W1·1 · status: done · of: ja · blocker: null · dep: []',
      'id: W1·1 · status: done · of: ja · blocker: null · dep: [W1·4]');
    const p = pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv);
    expect(p.some((x) => x.id === 'W1·1' && /dep "W1·4" ist blocked/.test(x.meldung))).toBe(true);
  });

  it('done mit done-dep → kein Problem', () => {
    const gut = OK.replace(
      'id: W1·4 · status: blocked · of: ja · blocker: wbqdyap3x · dep: []',
      'id: W1·4 · status: done · of: ja · blocker: null · dep: [W1·1]')
      .replace('- [ ] **4 · D**', '- [x] **4 · D**');
    expect(pruefe(gut, ['FAHRPLAN-PLAN-STEUERUNG.md'], existiert, inv)).toEqual([]);
  });

  it('kollision-Pfad existiert nicht → Problem', () => {
    const bad = OK.replace('kollision: [] · worktree: nein · 26x: nein -->\n- [ ] **4 · D**', 'kollision: [src/fehlt.ts] · worktree: nein · 26x: nein -->\n- [ ] **4 · D**');
    expect(pruefe(bad, ['FAHRPLAN-PLAN-STEUERUNG.md'], (p) => p !== 'src/fehlt.ts', inv).some((p) => /fehlt\.ts/.test(p.meldung))).toBe(true);
  });
});

describe('pruefe — Lücken-Abdeckung (Task-5-Review)', () => {
  const REG = ['<!-- @blockers', 'b1: grund', '-->'].join('\n');
  const plan = (units: string) =>
    `## Die geordnete Abarbeitung\n${REG}\n${units}\n\nSiehe FAHRPLAN-PLAN-STEUERUNG.md.\n`;
  const unit = (cb: string, meta: string) => `- ${cb} **x**\n  <!-- @meta ${meta} -->`;
  const ok = (md: string, inv: string[]) => pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, inv);

  it('verwaistes @meta (id nicht im Inventar) → Problem', () => {
    const md = plan(unit('[ ]', 'id: W9·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, []).some((p) => p.id === 'W9·9')).toBe(true);
  });
  it('doppelte id → Problem', () => {
    const u = 'id: A · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein';
    const md = plan(`${unit('[ ]', u)}\n${unit('[ ]', u)}`);
    expect(ok(md, ['A']).some((p) => /mehrfach/.test(p.meldung))).toBe(true);
  });
  it('Zyklus A→B→A → Problem', () => {
    const md = plan(
      `${unit('[ ]', 'id: A · status: ready · of: ja · blocker: null · dep: [B] · kollision: [] · worktree: nein · 26x: nein')}\n` +
      `${unit('[ ]', 'id: B · status: ready · of: ja · blocker: null · dep: [A] · kollision: [] · worktree: nein · 26x: nein')}`,
    );
    expect(ok(md, ['A', 'B']).some((p) => /Zyklus/.test(p.meldung))).toBe(true);
  });
  it('dep auf nicht existierende id → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: ready · of: ja · blocker: null · dep: [ZZ] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => /ZZ/.test(p.meldung))).toBe(true);
  });
  it('Checkbox [~] mit status done → Problem', () => {
    const md = plan(unit('[~]', 'id: A · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('Checkbox [D] (geparkt) mit status parked → kein Coupling-Problem', () => {
    const md = plan(unit('[D]', 'id: A · status: parked · of: ja · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A'])).toEqual([]);
  });
  it('Checkbox [D] (geparkt) mit status done → Problem', () => {
    const md = plan(unit('[D]', 'id: A · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('status ready mit blocker → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: ready · of: ja · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('status blocked ohne blocker → Problem', () => {
    const md = plan(unit('[ ]', 'id: A · status: blocked · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein'));
    expect(ok(md, ['A']).some((p) => p.id === 'A')).toBe(true);
  });
  it('zwei 26x auf wip → Problem', () => {
    const md = plan(
      `${unit('[~]', 'id: A · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja')}\n` +
      `${unit('[~]', 'id: B · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja')}`,
    );
    expect(ok(md, ['A', 'B']).some((p) => /wip/.test(p.meldung))).toBe(true);
  });

  // Regel (5c): `slot: inhaber` verträgt sich nicht mit einem Status, der den
  // 26×-Slot nie zurückgibt. Genau diese Kombination hält über next.ts jeden
  // anderen 26×-Schritt an, ohne dass noch jemand am Slot arbeitet.
  const slotUnit = (cb: string, status: string, blocker: string) =>
    unit(cb, `id: A · status: ${status} · of: ja · blocker: ${blocker} · dep: [] · kollision: [] · worktree: nein · 26x: ja · slot: inhaber`);

  it('slot: inhaber mit status done → Problem', () => {
    const md = plan(slotUnit('[x]', 'done', 'null'));
    expect(ok(md, ['A']).some((p) => p.id === 'A' && /nie zurück/.test(p.meldung))).toBe(true);
  });
  it('slot: inhaber mit status parked → Problem (gibt den Slot ebenso wenig zurück)', () => {
    const md = plan(slotUnit('[d]', 'parked', 'b1'));
    expect(ok(md, ['A']).some((p) => p.id === 'A' && /nie zurück/.test(p.meldung))).toBe(true);
  });
  it('slot: inhaber mit status blocked → Problem', () => {
    const md = plan(slotUnit('[ ]', 'blocked', 'b1'));
    expect(ok(md, ['A']).some((p) => p.id === 'A' && /nie zurück/.test(p.meldung))).toBe(true);
  });
  it('slot: inhaber mit status ready → kein Problem (Inhaber wartet auf seinen Bau)', () => {
    expect(ok(plan(slotUnit('[ ]', 'ready', 'null')), ['A'])).toEqual([]);
  });
  it('slot: inhaber mit status wip → kein Problem (Inhaber baut)', () => {
    expect(ok(plan(slotUnit('[~]', 'wip', 'null')), ['A'])).toEqual([]);
  });
});

// Regel 8 (@queue-Integrität, Einbau 24.7.2026): die Queue ist die EINE
// Prioritäts-Quelle; tote/erledigte IDs oder Prosa-Widerspruch steuern falsch.
describe('pruefe — Regel 8 @queue-Integrität', () => {
  const mitQueue = (queue: string, extra = '') =>
    `## Die geordnete Abarbeitung\n<!-- @queue: ${queue} -->\n${extra}` + OK.replace('## Die geordnete Abarbeitung\n', '');

  it('konsistente Queue → kein Problem', () => {
    expect(pruefe(mitQueue('W1·4'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, ['W1·1', 'W1·4'])).toEqual([]);
  });
  it('8.1: Queue-ID ohne @meta → Problem', () => {
    const p = pruefe(mitQueue('GEIST'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, ['W1·1', 'W1·4']);
    expect(p.some((x) => x.id === 'GEIST' && /kein @meta/.test(x.meldung))).toBe(true);
  });
  it('8.2: Dublette in der Queue → Problem', () => {
    const p = pruefe(mitQueue('W1·4, W1·4'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, ['W1·1', 'W1·4']);
    expect(p.some((x) => x.id === 'W1·4' && /mehrfach/.test(x.meldung))).toBe(true);
  });
  it('8.3: done-ID in der Queue → Problem (Stale-Guard)', () => {
    const p = pruefe(mitQueue('W1·1'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, ['W1·1', 'W1·4']);
    expect(p.some((x) => x.id === 'W1·1' && /veraltete Steuerung/.test(x.meldung))).toBe(true);
  });
  // 8.4 prüft gegen die TATSÄCHLICHE plan:next-Ausgabe (resolve().readyNow[0]),
  // nicht bloss gegen queue[0] — Härtung nach adversarialem Verify-Befund 24.7.2026.
  const READY = `- [ ] **5 · E**\n  <!-- @meta id: W1·5 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->\n`;
  const invR = ['W1·1', 'W1·4', 'W1·5'];

  it('8.4: Prosa-«OBERSTER» widerspricht der plan:next-Ausgabe → Problem', () => {
    const md = mitQueue('W1·5', '> **⬆ OBERSTER OFFENER SCHRITT:** `W1·1` zuerst.\n' + READY);
    const p = pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, invR);
    expect(p.some((x) => x.id === 'W1·1' && /Prosa behauptet oberster/.test(x.meldung))).toBe(true);
  });
  it('8.4: Prosa-«OBERSTER» ohne @queue → Problem', () => {
    const md = OK + '\n> **⬆ OBERSTER OFFENER SCHRITT:** `W1·4` zuerst.\n';
    const p = pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, ['W1·1', 'W1·4']);
    expect(p.some((x) => x.id === null && /keine @queue/.test(x.meldung))).toBe(true);
  });
  it('8.4: Prosa-«OBERSTER» == plan:next-Ausgabe → kein Problem', () => {
    const md = mitQueue('W1·5', '> **⬆ OBERSTER OFFENER SCHRITT:** `W1·5` zuerst.\n' + READY);
    expect(pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, invR)).toEqual([]);
  });
  it('8.4: Queue-Kopf nicht baubar (blocked) → Prosa==queue[0] genügt NICHT (Drift-Szenario)', () => {
    // W1·4 ist blocked und Queue-Kopf; plan:next liefert W1·5. Die alte queue[0]-Prüfung
    // wäre hier grün geblieben — genau die Drift, die der Guard schliessen soll.
    const md = mitQueue('W1·4, W1·5', '> **⬆ OBERSTER OFFENER SCHRITT:** `W1·4` zuerst.\n' + READY);
    const p = pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, invR);
    expect(p.some((x) => x.id === 'W1·4' && /plan:next liefert "W1·5"/.test(x.meldung))).toBe(true);
  });
  it('8.4: Backtick-Fragment VOR dem Marker bindet nicht (Marker-verankerte ID)', () => {
    const md = mitQueue('W1·5', '> Datei `foo.ts` gefixt. **⬆ OBERSTER OFFENER SCHRITT:** `W1·5` zuerst.\n' + READY);
    expect(pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, invR)).toEqual([]);
  });
});

// Verify-Befund 24.7.2026: Querschnitt-Filter darf of/dep-Signale nicht schlucken.
describe('resolve-Kopplung — Querschnitt mit offener Voraussetzung', () => {
  it('Querschnitt-ready mit offener dep landet in wartetDep, nicht still in begleitend', async () => {
    const { resolve } = await import('../../scripts/plan/next');
    const qs = {
      id: 'QS-X', checkbox: null, sektion: 'Querschnitt-Band (läuft begleitend', pos: 0,
      etikett: { id: 'QS-X', status: 'ready' as const, statusAgent: null, of: true, blocker: null, dep: ['FEHLT'], kollision: [], worktree: false, asset26x: false, fahrplan: null },
    };
    const b = resolve([qs]);
    expect(b.wartetDep).toEqual([{ id: 'QS-X', offen: ['FEHLT'] }]);
    expect(b.begleitend).toEqual([]);
  });
});
