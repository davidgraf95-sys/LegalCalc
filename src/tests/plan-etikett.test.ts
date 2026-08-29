// src/tests/plan-etikett.test.ts
import { parseEtikett, serializeEtikett } from '../../scripts/plan/etikett';

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
