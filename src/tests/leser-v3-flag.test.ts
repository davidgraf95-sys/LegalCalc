import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  LESER_V1_KEY, leserFlagAuswerten, leserFlagLesen, leserFlagSchreiben,
} from '../pages/gesetz-leser/leserFlag';

// FAHRPLAN-LESER-V3 Kap. 5 (FL-1…FL-3, FL-6) + Risiko R10 «Das Flag leckt».
//
// Diese Datei ist der von FL-3 verlangte Vitest-Beweis über den Grundzustand.
// Sie prüft die REINE Auswertung (§2) statt die Komponente — dieselbe Aussage,
// aber ohne DOM und ohne Render-Kosten.
//
// ═══ H4 · GESPIEGELT (Flip, David-Ja 17.8.2026) ════════════════════════════
// Bis H4 lautete die Aussage «Grundzustand ist AUS ⇒ V1». Sie ist mit dem Flip
// FALSCH GEWORDEN und darum hier ehrlich umgeschrieben — eine DEKLARIERTE
// fachliche Änderung (§6.3: bei einem Refactoring dürften Tests nicht wandern;
// dies ist keines, sondern der Verhaltenswechsel selbst). Was gleich bleibt:
// jede Aussage ist einzeln rot zu bekommen — Default-Zweig auf 'v1' drehen,
// Query-Zweige vertauschen, oder LESER_V1_KEY auf den Optionen-Schlüssel setzen.

describe('Fassaden-Flag V1/V3 nach dem H4-Flip (FL-3, R10)', () => {
  it('Grundzustand ist V3: ohne Parameter und ohne Speicher rendert der neue Leser', () => {
    expect(leserFlagAuswerten('', null)).toEqual({ modus: 'v3', speichern: null });
    expect(leserFlagAuswerten('?foo=bar', null)).toEqual({ modus: 'v3', speichern: null });
    // Auch ein fremder/kaputter Speicherwert darf nicht auf die alte Hülle
    // zurückwerfen — nur die ausdrückliche `'1'` tut das.
    expect(leserFlagAuswerten('', '0').modus).toBe('v3');
    expect(leserFlagAuswerten('', 'true').modus).toBe('v3');
  });

  it('?leser=v1 ist der Rückweg und merkt sich die Wahl', () => {
    expect(leserFlagAuswerten('?leser=v1', null)).toEqual({ modus: 'v1', speichern: 'setzen' });
    // Mehrere Parameter, beliebige Reihenfolge.
    expect(leserFlagAuswerten('?x=1&leser=v1', null).modus).toBe('v1');
  });

  it('?leser=v3 kehrt zum Standard zurück und löscht die Merkung — auch bei gesetztem Flag', () => {
    expect(leserFlagAuswerten('?leser=v3', '1')).toEqual({ modus: 'v3', speichern: 'loeschen' });
  });

  it('ohne Parameter entscheidet allein der Speicher', () => {
    expect(leserFlagAuswerten('', '1')).toEqual({ modus: 'v1', speichern: null });
  });

  it('Optionen sind GETEILT, nicht dupliziert (FL-6, §5)', () => {
    // Der Hüllen-Schalter hat einen EIGENEN Schlüssel und fasst den
    // Optionen-Store nicht an. Gäbe es einen zweiten Optionen-Schlüssel je
    // Hülle, wären es zwei gepflegte Wahrheiten (§5).
    expect(LESER_V1_KEY).toBe('lm.leser.v1');
    expect(LESER_V1_KEY).not.toBe('lm.leser.optionen');
    expect(LESER_V1_KEY.startsWith('lm.leser.optionen')).toBe(false);
  });

  it('der Flip hat den SCHLÜSSEL mitgedreht — kein stiller Bedeutungswechsel', () => {
    // Der alte Schlüssel `lm.leser.v3='1'` hiess «V3 gewünscht». Bliebe er in
    // Gebrauch, bekäme genau der Nutzer, der V3 ausdrücklich gewählt hat, nach
    // dem Flip V1 — das Gegenteil seiner Wahl, an fremden Browsern, ohne dass
    // es hier irgendwo rot würde. Mit dem eigenen Schlüssel ist der Alt-Eintrag
    // wirkungslos, und der V3-Wähler von gestern sieht V3 (den neuen Default).
    expect(LESER_V1_KEY).not.toBe('lm.leser.v3');
    expect(leserFlagAuswerten('', null).modus, 'Alt-Eintrag ist inert ⇒ Default gilt').toBe('v3');
  });
});

// ─── B2 · Das Flag-Rennen zwischen zwei Panes (Bug-Check 16.8.2026) ──────────
//
// `Pane.tsx` schickt BEIDE Split-Panes durch denselben `RouteSwitch` und damit
// durch dieselbe Fassade. Der Vollzug der Merkung lief in einem `useEffect` —
// also NACH dem Render. Rendert das zweite Pane, bevor der Effekt des ersten
// gelaufen ist, liest es `null` und rendert die andere Hülle daneben. FL-1
// verspricht das Gegenteil: EIN Flag schaltet beide.
//
// Der Test bildet genau diese Reihenfolge ab, statt sie zu behaupten: erst der
// Fall «Vollzug sofort» (so ist es jetzt), dann die Gegenprobe «Vollzug
// aufgeschoben» (so war es) — sie muss den Fehler zeigen, sonst prüft der erste
// Fall nichts.
//
// H4-FLIP: der Parameter im Test ist `?leser=v1`, nicht mehr `?leser=v3`. Grund
// ist §6.7, nicht Kosmetik — nach dem Flip ist V3 der Default, das zweite Pane
// stünde also auch OHNE gelesenen Speicherwert in V3, und beide Sonden wären
// grundlos grün. Nur der Parameter, der VOM Default WEGFÜHRT, kann das Rennen
// überhaupt zeigen.

function speicherAttrappe() {
  const daten = new Map<string, string>();
  const zaehler = { setItem: 0, removeItem: 0 };
  return {
    zaehler,
    api: {
      getItem: (k: string) => (daten.has(k) ? daten.get(k)! : null),
      setItem: (k: string, v: string) => { zaehler.setItem += 1; daten.set(k, v); },
      removeItem: (k: string) => { zaehler.removeItem += 1; daten.delete(k); },
    },
  };
}

describe('Flag-Rennen: zwei Panes, EIN Speicherwert (B2, FL-1)', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  /** Was ein Pane tut: auswerten, vollziehen, Modus melden. */
  const pane = (suche: string, sofortVollziehen: boolean) => {
    const w = leserFlagAuswerten(suche, leserFlagLesen());
    if (sofortVollziehen) leserFlagSchreiben(w.speichern);
    return { modus: w.modus, nachziehen: () => leserFlagSchreiben(w.speichern) };
  };

  it('Vollzug SOFORT: das zweite Pane sieht den Wert des ersten', () => {
    const { api } = speicherAttrappe();
    vi.stubGlobal('localStorage', api);

    const a = pane('?leser=v1', true);       // primäres Pane, trägt den Parameter
    const b = pane('', true);                // sekundäres Pane, ohne Parameter
    expect(a.modus).toBe('v1');
    expect(b.modus, 'zweites Pane rendert die andere Hülle daneben').toBe('v1');
  });

  it('Gegenprobe — Vollzug AUFGESCHOBEN (der alte useEffect) zerreisst die Panes', () => {
    const { api } = speicherAttrappe();
    vi.stubGlobal('localStorage', api);

    const a = pane('?leser=v1', false);      // Effekt steht noch aus
    const b = pane('', false);
    expect(a.modus).toBe('v1');
    expect(b.modus, 'ohne den Fehler wäre die Sonde oben grundlos grün').toBe('v3');
    a.nachziehen();
    b.nachziehen();
    expect(leserFlagLesen()).toBe('1');
  });

  it('idempotent: derselbe Vollzug schreibt kein zweites Mal', () => {
    const { api, zaehler } = speicherAttrappe();
    vi.stubGlobal('localStorage', api);

    leserFlagSchreiben('setzen');
    leserFlagSchreiben('setzen');
    leserFlagSchreiben('setzen');
    expect(zaehler.setItem, 'jeder Render schriebe erneut').toBe(1);

    leserFlagSchreiben('loeschen');
    leserFlagSchreiben('loeschen');
    expect(zaehler.removeItem, 'Löschen auf leerem Speicher fasst ihn trotzdem an').toBe(1);

    leserFlagSchreiben(null);
    expect(zaehler.setItem + zaehler.removeItem).toBe(2);
  });

  it('ein werfender Speicher (Privat-Modus) bleibt folgenlos', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('SecurityError'); },
      removeItem: () => { throw new Error('SecurityError'); },
    });
    expect(() => leserFlagSchreiben('setzen')).not.toThrow();
    expect(leserFlagLesen()).toBeNull();
  });

  it('die Fassade vollzieht im Render-Rumpf, NICHT im Effekt', () => {
    // Quellensonde: die Aussage oben ist nur wahr, wenn `GesetzLeser.tsx` den
    // Vollzug auch wirklich synchron ruft. Ein zurückgedrehter `useEffect`
    // machte die Verhaltens-Sonden oben nicht rot — diese hier schon (§6.7).
    const roh = readFileSync('src/pages/GesetzLeser.tsx', 'utf8');
    // Ohne Kommentare — die Begründung IM Code nennt `useEffect` ausdrücklich,
    // und eine Sonde, die an ihrer eigenen Erklärung scheitert, misst Prosa.
    const code = roh.replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\/\*[\s\S]*?\*\//g, ' ');
    expect(code).toContain('leserFlagSchreiben(speichern);');
    expect(/useEffect/.test(code), 'der Vollzug ist wieder in einen Effekt gewandert').toBe(false);
  });
});
