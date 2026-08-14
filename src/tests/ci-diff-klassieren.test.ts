// src/tests/ci-diff-klassieren.test.ts
import { klassifiziereDateien, klassifiziereDiff } from '../../scripts/ci/diff-klassieren';

// §6.7-Beweis: die vier Testfälle aus dem Auftrag (QS-PLAN-EINFACH, 14.8.2026,
// Punkt 3), gegen die volle Drei-Klassen-Entscheidung (Modell des PR-Zweigs).
describe('klassifiziereDiff — Auftrags-Testmatrix', () => {
  it('[nur ROADMAP.md] → doku', () => {
    expect(klassifiziereDiff(['ROADMAP.md'])).toBe('doku');
  });

  it('[scripts/plan/x.ts] → code-fern', () => {
    expect(klassifiziereDiff(['scripts/plan/x.ts'])).toBe('code-fern');
  });

  it('[src/App.tsx] → code', () => {
    expect(klassifiziereDiff(['src/App.tsx'])).toBe('code');
  });

  it('[scripts/plan/x.ts + src/App.tsx] → code (eine app-nahe Datei genügt)', () => {
    expect(klassifiziereDiff(['scripts/plan/x.ts', 'src/App.tsx'])).toBe('code');
  });
});

describe('klassifiziereDateien — die einzelnen code-fernen Flächen', () => {
  it('scripts/cowork/** ist code-fern', () => {
    expect(klassifiziereDateien(['scripts/cowork/y.ts'])).toBe('code-fern');
  });

  it('.claude/** ist code-fern', () => {
    expect(klassifiziereDateien(['.claude/agents/foo.md'])).toBe('code-fern');
  });

  it('docs/** ist code-fern', () => {
    expect(klassifiziereDateien(['docs/anleitung.md'])).toBe('code-fern');
  });

  it('bibliothek/** ist code-fern', () => {
    expect(klassifiziereDateien(['bibliothek/register/x.md'])).toBe('code-fern');
  });

  it('messwerte/** ist code-fern', () => {
    expect(klassifiziereDateien(['messwerte/lauf.json'])).toBe('code-fern');
  });

  it('archiv/** ist code-fern', () => {
    expect(klassifiziereDateien(['archiv/FAHRPLAN-ALT.md'])).toBe('code-fern');
  });

  it('mehrere code-ferne Dateien zusammen bleiben code-fern', () => {
    expect(klassifiziereDateien(['scripts/plan/x.ts', 'docs/y.md', 'ROADMAP.md'])).toBe('code-fern');
  });

  // KONSERVATIV: jede andere Fläche kippt auf `code` — auch scripts/** ausserhalb
  // von plan/cowork, e2e/** und package.json (Auftrag: "konservativ").
  it('package.json ist code (keine Ausnahme)', () => {
    expect(klassifiziereDateien(['package.json'])).toBe('code');
  });

  it('e2e/** ist code (keine Ausnahme)', () => {
    expect(klassifiziereDateien(['e2e/foo.e2e.ts'])).toBe('code');
  });

  it('scripts/** ausserhalb plan/cowork ist code', () => {
    expect(klassifiziereDateien(['scripts/logik-sweep.ts'])).toBe('code');
  });

  it('scripts/plan/x.ts + scripts/logik-sweep.ts → code (ein Ausreisser genügt)', () => {
    expect(klassifiziereDateien(['scripts/plan/x.ts', 'scripts/logik-sweep.ts'])).toBe('code');
  });
});
