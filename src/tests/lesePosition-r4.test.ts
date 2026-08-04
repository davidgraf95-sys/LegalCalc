import { describe, it, expect, beforeEach } from 'vitest';
import {
  holeLesePosition, merkeLesePosition, vergissLesePosition, type LesePosition,
} from '../pages/gesetz-leser/lesePosition';

// ─── W2·10-UI-NAV/R4 · Positions-Persistenz ──────────────────────────────────
//
// Geprüft wird das, was der Chip verspricht: die zuletzt gelesene Stelle je
// Erlass, EINMAL je Erlass, und NUR solange der Snapshot derselbe ist. Der
// Stand-Vergleich ist der Kern (Fahrplan R4: «Stand-Marker des Snapshots als
// Invalidierungs-Arbiter») — ohne ihn führte ein Angebot nach einer Revision an
// einen Artikel, der inzwischen anderen Text trägt oder fehlt (§7/§8).
//
// Speicher-Attrappe wie `zuletztVerwendet.test.ts` (§5: dasselbe Muster für
// dieselbe Sache).
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

const pos = (key: string, token: string, stand = '2026-01-01'): LesePosition =>
  ({ key, token, label: `Art. ${token}`, stand });

describe('lesePosition.ts (R4)', () => {
  it('kennt beim Erstbesuch keine Stelle', () => {
    expect(holeLesePosition('OR', '2026-01-01')).toBeNull();
  });

  it('gibt die gemerkte Stelle bei gleichem Stand zurück', () => {
    merkeLesePosition(pos('OR', '335_c'));
    const p = holeLesePosition('OR', '2026-01-01');
    expect(p?.token).toBe('335_c');
    expect(p?.label).toBe('Art. 335_c');
  });

  it('verwirft die Stelle bei GEÄNDERTEM Snapshot-Stand (Invalidierungs-Arbiter)', () => {
    merkeLesePosition(pos('OR', '335_c', '2026-01-01'));
    // Der Erlass wurde revidiert: derselbe Token kann anderen Text tragen.
    expect(holeLesePosition('OR', '2026-06-01')).toBeNull();
  });

  it('hält die Erlasse auseinander — ein «Art. 1» ist nicht der andere', () => {
    merkeLesePosition(pos('OR', '5'));
    merkeLesePosition(pos('ZGB', '12'));
    expect(holeLesePosition('OR', '2026-01-01')?.token).toBe('5');
    expect(holeLesePosition('ZGB', '2026-01-01')?.token).toBe('12');
  });

  it('merkt je Erlass genau EINE Stelle (die neueste ersetzt die alte)', () => {
    merkeLesePosition(pos('OR', '5'));
    merkeLesePosition(pos('OR', '400'));
    expect(holeLesePosition('OR', '2026-01-01')?.token).toBe('400');
    const roh = JSON.parse(localStorage.getItem('lexmetrik-leseposition') ?? '[]');
    expect(roh.filter((e: LesePosition) => e.key === 'OR').length).toBe(1);
  });

  it('kappt auf 20 Erlasse — der am längsten nicht gelesene fällt heraus', () => {
    for (let i = 0; i < 25; i++) merkeLesePosition(pos(`E${i}`, '1'));
    const roh = JSON.parse(localStorage.getItem('lexmetrik-leseposition') ?? '[]');
    expect(roh.length).toBe(20);
    expect(roh[0].key).toBe('E24'); // zuletzt gelesen steht vorne
    expect(holeLesePosition('E0', '2026-01-01')).toBeNull();
  });

  it('vergisst eine Stelle vollständig (Chip weggeklickt)', () => {
    merkeLesePosition(pos('OR', '5'));
    merkeLesePosition(pos('ZGB', '12'));
    vergissLesePosition('OR');
    expect(holeLesePosition('OR', '2026-01-01')).toBeNull();
    expect(holeLesePosition('ZGB', '2026-01-01')?.token).toBe('12');
  });

  it('merkt nichts ohne Label — ein Chip ohne Artikelname wäre keine Aussage (§8)', () => {
    merkeLesePosition({ key: 'OR', token: '5', label: '', stand: '2026-01-01' });
    expect(holeLesePosition('OR', '2026-01-01')).toBeNull();
  });

  it('überlebt korrupten Speicherinhalt, statt die Seite zu zerlegen', () => {
    localStorage.setItem('lexmetrik-leseposition', '{kaputt');
    expect(holeLesePosition('OR', '2026-01-01')).toBeNull();
    merkeLesePosition(pos('OR', '5'));
    expect(holeLesePosition('OR', '2026-01-01')?.token).toBe('5');
  });

  it('ist ohne localStorage ein stiller No-op (Prerender-Node, privater Modus)', () => {
    const echt = globalThis.localStorage;
    // @ts-expect-error — der Prerender-Node hat kein localStorage; genau das wird geprüft.
    delete globalThis.localStorage;
    expect(() => merkeLesePosition(pos('OR', '5'))).not.toThrow();
    expect(holeLesePosition('OR', '2026-01-01')).toBeNull();
    expect(() => vergissLesePosition('OR')).not.toThrow();
    globalThis.localStorage = echt;
  });
});
