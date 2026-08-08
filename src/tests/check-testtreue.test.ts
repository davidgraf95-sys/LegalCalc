// src/tests/check-testtreue.test.ts — §6.3-Diff-Tor: der reine Kern, ohne git
// (QS-AUDIT-VERWEISE 8.8.2026). Der Rot-Fall hier ist der §6.7-Beweis, dass
// das Tor scheitern kann; der Live-Rot-Lauf ist im Bau-Protokoll dokumentiert.
import { describe, expect, it } from 'vitest';
import { findeVerstoesse, istRefactorCommit, istTestDatei, type CommitInfo } from '../../scripts/check-testtreue-kern';

const commit = (betreff: string, dateien: string[]): CommitInfo => ({ sha: 'deadbeef00', betreff, dateien });

describe('check:testtreue — §6.3 (Tests bleiben bei Refactorings unangetastet)', () => {
  it('ROT: als refactor deklarierter Commit ändert eine Test-Datei', () => {
    const v = findeVerstoesse([
      commit('refactor(engine): verjaehrung entdoppelt', ['src/lib/verjaehrung/engine.ts', 'src/tests/verjaehrung.test.ts']),
    ]);
    expect(v).toHaveLength(1);
    expect(v[0].testDateien).toEqual(['src/tests/verjaehrung.test.ts']);
  });

  it('ROT auch bei Scope-losem refactor: und bei e2e-Dateien', () => {
    expect(findeVerstoesse([commit('refactor: split', ['e2e/a11y.e2e.ts'])])).toHaveLength(1);
    expect(findeVerstoesse([commit('refactor!: breaking split', ['src/lib/x.test.ts'])])).toHaveLength(1);
  });

  it('GRÜN: refactor ohne Test-Berührung', () => {
    expect(findeVerstoesse([commit('refactor(ui): karten entdoppelt', ['src/components/Card.tsx'])])).toHaveLength(0);
  });

  it('GRÜN: fachlicher Commit darf Tests ändern — genau das verlangt §6.3 (eigener, deklarierter Schritt)', () => {
    expect(findeVerstoesse([
      commit('fix(verjaehrung): Stichtagsregel korrigiert', ['src/lib/verjaehrung/engine.ts', 'src/tests/verjaehrung.test.ts']),
      commit('test(plan): Regressionstest ergänzt', ['src/tests/plan-lage.test.ts']),
    ])).toHaveLength(0);
  });

  it('erkennt refactor-Deklarationen präzise (kein Treffer auf «feat: refactor vorbereiten»)', () => {
    expect(istRefactorCommit('refactor(plan-bild): …')).toBe(true);
    expect(istRefactorCommit('feat: refactor vorbereiten')).toBe(false);
    expect(istRefactorCommit('docs(refactoring): Skill ergänzt')).toBe(false);
  });

  it('klassifiziert Test-Dateien wie §6.3 sie meint', () => {
    expect(istTestDatei('src/tests/plan-groesse.test.ts')).toBe(true);
    expect(istTestDatei('e2e/verzahnung.e2e.ts')).toBe(true);
    expect(istTestDatei('src/lib/foo.test.tsx')).toBe(true);
    expect(istTestDatei('src/lib/verjaehrung/engine.ts')).toBe(false);
    expect(istTestDatei('scripts/check-testtreue.ts')).toBe(false);
  });
});
