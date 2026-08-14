// src/tests/plan-buchung.test.ts
import { parseBuchung, parseStatusTrailer } from '../../scripts/plan/buchung';

describe('parseStatusTrailer', () => {
  it('parst "done" ohne Blocker', () => {
    expect(parseStatusTrailer('done')).toEqual({ status: 'done', blocker: null });
  });

  it('parst "ready" ohne Blocker', () => {
    expect(parseStatusTrailer('ready')).toEqual({ status: 'ready', blocker: null });
  });

  it('parst "parked(<token>)" mit Blocker-Token', () => {
    expect(parseStatusTrailer('parked(a33-flake)')).toEqual({ status: 'parked', blocker: 'a33-flake' });
  });

  it('trimmt umgebende Leerzeichen (git-Trailer-Wert)', () => {
    expect(parseStatusTrailer('  ready  ')).toEqual({ status: 'ready', blocker: null });
  });

  // §6.7-Rot-Fall: ungültiger Status wirft.
  it('wirft bei unbekanntem Status', () => {
    expect(() => parseStatusTrailer('erledigt')).toThrow(/ungültiger Wert "erledigt"/);
  });

  it('wirft bei wip/blocked (kein Merge-Trailer-Ergebnis)', () => {
    expect(() => parseStatusTrailer('wip')).toThrow(/ungültiger Wert "wip"/);
    expect(() => parseStatusTrailer('blocked')).toThrow(/ungültiger Wert "blocked"/);
  });

  it('wirft bei "parked" ohne Blocker-Token', () => {
    expect(() => parseStatusTrailer('parked')).toThrow(/verlangt ein Blocker-Token/);
    expect(() => parseStatusTrailer('parked()')).toThrow(/verlangt ein Blocker-Token/);
  });

  it('wirft bei Klammer-Zusatz ausserhalb von "parked"', () => {
    expect(() => parseStatusTrailer('done(x)')).toThrow(/nur bei "parked" erlaubt/);
  });

  it('wirft bei unlesbarem Wert', () => {
    expect(() => parseStatusTrailer('!!!')).toThrow(/unlesbar/);
  });
});

describe('parseBuchung', () => {
  it('kombiniert Roadmap- und Roadmap-Status-Trailer zu einer Buchung', () => {
    expect(parseBuchung('QS-PLAN-EINFACH', 'done')).toEqual({
      id: 'QS-PLAN-EINFACH',
      status: 'done',
      blocker: null,
    });
  });

  it('trägt den Blocker bei "parked" mit', () => {
    expect(parseBuchung('QS-CURRENCY-KANON', 'parked(warten-auf-david)')).toEqual({
      id: 'QS-CURRENCY-KANON',
      status: 'parked',
      blocker: 'warten-auf-david',
    });
  });

  it('wirft bei leerem ID-Trailer', () => {
    expect(() => parseBuchung('', 'done')).toThrow(/Trailer ist leer/);
    expect(() => parseBuchung('   ', 'done')).toThrow(/Trailer ist leer/);
  });

  it('wirft bei ungültigem Status-Trailer (Rot-Fall über die kombinierte Funktion)', () => {
    expect(() => parseBuchung('QS-PLAN-EINFACH', 'fertig')).toThrow(/ungültiger Wert "fertig"/);
  });
});
