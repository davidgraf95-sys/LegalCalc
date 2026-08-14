// src/tests/plan-etikett.test.ts
import { parseEtikett, serializeEtikett } from '../../scripts/plan/etikett';

const ZEILE =
  '  <!-- @meta id: W2·6 · status: wip · blocker: null · dep: [W1·4] · kollision: [src/lib/norm-index.ts, src/lib/x.ts] · worktree: ja · 26x: nein -->';

describe('parseEtikett', () => {
  it('parst alle Felder: Liste, null', () => {
    const e = parseEtikett(ZEILE);
    expect(e.id).toBe('W2·6');
    expect(e.status).toBe('wip');
    expect(e.blocker).toBeNull();
    expect(e.dep).toEqual(['W1·4']);
    expect(e.kollision).toEqual(['src/lib/norm-index.ts', 'src/lib/x.ts']);
    expect(e.worktree).toBe(true);
    expect(e.asset26x).toBe(false);
  });

  it('leere Liste + gesetzter blocker + 26x ja', () => {
    const e = parseEtikett(
      '<!-- @meta id: W1·4 · status: parked · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: ja -->',
    );
    expect(e.dep).toEqual([]);
    expect(e.blocker).toBe('wbqdyap3x');
    expect(e.asset26x).toBe(true);
  });

  it('wirft bei ungültigem Status', () => {
    expect(() => parseEtikett('<!-- @meta id: X · status: fertig · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->')).toThrow();
  });

  it('toleriert die gestrichenen Altfelder of/seq-hart/seq-weich im Bestand', () => {
    // QS-PLAN-EINFACH (14.8.2026): Alt-Zeilen (Archiv, alte Branches) dürfen die
    // Werkzeugkette nicht lahmlegen; die Felder werden gelesen und ignoriert.
    const e = parseEtikett(
      '<!-- @meta id: ALT · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · seq-hart: [X(y)] · worktree: nein · 26x: nein -->',
    );
    expect(e.id).toBe('ALT');
    // Der Serializer schreibt sie nie mehr — plan:set räumt sie mechanisch ab.
    expect(serializeEtikett(e, '')).not.toContain('of:');
    expect(serializeEtikett(e, '')).not.toContain('seq-hart');
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
    const e = parseEtikett('<!-- @meta id: A · status: ready · blocker: null · dep: [W1,] · kollision: [] · worktree: nein · 26x: nein -->');
    expect(e.dep).toEqual(['W1']);
  });
  it('das optionale `groesse` überlebt den Round-Trip an seiner Bestands-Position', () => {
    // Ein Feld, das serializeEtikett verwirft oder umstellt, geht bei jedem
    // `plan:set` still verloren bzw. erzeugt Diff-Rauschen.
    const mit = ZEILE.replace('26x: nein', '26x: nein · groesse: M');
    expect(serializeEtikett(parseEtikett(mit), '  ')).toBe(mit);
    expect(parseEtikett(ZEILE).groesse).toBeNull();
  });
});
