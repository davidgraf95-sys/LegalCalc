// src/tests/plan-next.test.ts
import { resolve } from '../../scripts/plan/next';
import type { Einheit } from '../../scripts/plan/parse';

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
