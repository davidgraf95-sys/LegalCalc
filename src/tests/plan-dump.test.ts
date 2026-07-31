// src/tests/plan-dump.test.ts
//
// Fund R2-3 (Endprüfung Runde 2, 31.7.2026): Der ad-hoc-«einheiten-dump», mit dem
// die Verhaltensneutralität der ROADMAP-Umbauten belegt wurde, führte das Feld
// `checkbox` nicht — er konnte in genau dem Feld nicht scheitern, in dem die
// B20-Regression steckte, und meldete «GENAU 2 Zeilen» statt drei. Der Dump ist
// deshalb ein benanntes Skript geworden; diese Tests halten fest, dass er ALLE
// Felder führt und dass er den historischen Rot-Fall sieht.
import { dump } from '../../scripts/plan/dump';

const MD = [
  '## Die geordnete Abarbeitung',
  '<!-- @queue: A -->',
  '<!-- @blockers',
  'b1: grund',
  '-->',
  '- [ ] **A · X**',
  '  Prosa dazwischen.',
  '  <!-- @meta id: A · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/x.ts] · seq-hart: [B(x.ts)] · seq-weich: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-X.md -->',
].join('\n');

describe('plan:dump', () => {
  it('führt jedes Feld der Einheit — inkl. checkbox, seq-hart, seq-weich, pos, sektion', () => {
    const zeile = dump(MD).split('\n')[0];
    for (const feld of ['id=', 'pos=', 'checkbox=', 'sektion=', 'status=', 'statusAgent=', 'of=',
      'blocker=', 'dep=', 'kollision=', 'seq-hart=', 'seq-weich=', 'worktree=', '26x=', 'fahrplan=', 'slot=']) {
      expect(zeile).toContain(feld);
    }
    expect(zeile).toContain('checkbox=[ ]');
    expect(zeile).toContain('seq-hart=[B(x.ts)]');
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
