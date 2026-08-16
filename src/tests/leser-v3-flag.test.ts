import { describe, expect, it } from 'vitest';
import { LESER_V3_KEY, leserFlagAuswerten } from '../pages/GesetzLeser';

// FAHRPLAN-LESER-V3 Kap. 5 (FL-1…FL-3, FL-6) + Risiko R10 «Das Flag leckt».
//
// Diese Datei ist der von FL-3 verlangte Vitest-Beweis, dass der Grundzustand
// AUS ist. Sie prüft die REINE Auswertung (§2) statt die Komponente — dieselbe
// Aussage, aber ohne DOM und ohne Render-Kosten.
//
// Jede der vier Aussagen ist einzeln rot zu bekommen: Default-Zweig auf 'v3'
// drehen, Query-Zweige vertauschen, oder LESER_V3_KEY auf den Optionen-
// Schlüssel setzen.

describe('Fassaden-Flag V1/V3 (FL-3, R10)', () => {
  it('Grundzustand ist AUS: ohne Parameter und ohne Speicher rendert V1', () => {
    expect(leserFlagAuswerten('', null)).toEqual({ modus: 'v1', speichern: null });
    expect(leserFlagAuswerten('?foo=bar', null)).toEqual({ modus: 'v1', speichern: null });
    // Auch ein fremder/kaputter Speicherwert darf nicht anschalten.
    expect(leserFlagAuswerten('', '0').modus).toBe('v1');
    expect(leserFlagAuswerten('', 'true').modus).toBe('v1');
  });

  it('?leser=v3 schaltet an und merkt es sich', () => {
    expect(leserFlagAuswerten('?leser=v3', null)).toEqual({ modus: 'v3', speichern: 'setzen' });
    // Mehrere Parameter, beliebige Reihenfolge.
    expect(leserFlagAuswerten('?x=1&leser=v3', null).modus).toBe('v3');
  });

  it('?leser=v1 schaltet aus und löscht die Merkung — auch bei gesetztem Flag', () => {
    expect(leserFlagAuswerten('?leser=v1', '1')).toEqual({ modus: 'v1', speichern: 'loeschen' });
  });

  it('ohne Parameter entscheidet allein der Speicher', () => {
    expect(leserFlagAuswerten('', '1')).toEqual({ modus: 'v3', speichern: null });
  });

  it('Optionen sind GETEILT, nicht dupliziert (FL-6, §5)', () => {
    // Der Hüllen-Schalter hat einen EIGENEN Schlüssel und fasst den
    // Optionen-Store nicht an. Gäbe es einen zweiten Optionen-Schlüssel je
    // Hülle, wären es zwei gepflegte Wahrheiten (§5).
    expect(LESER_V3_KEY).toBe('lm.leser.v3');
    expect(LESER_V3_KEY).not.toBe('lm.leser.optionen');
    expect(LESER_V3_KEY.startsWith('lm.leser.optionen')).toBe(false);
  });
});
