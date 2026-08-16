import { describe, expect, it } from 'vitest';
import { histUmschalten, histZuSicht, sichtZuHist } from '../pages/gesetz-leser/v3/v3Optionen';
import type { HistAnsicht } from '../pages/gesetz-leser/leserOptionen';

// FAHRPLAN-LESER-V3 Kap. 4f — die Historie-Option wird in V3 ZWEIWERTIG
// bedient, während der geteilte Store (FL-6, §5) weiter drei Werte trägt. Diese
// Datei prüft genau die Abbildung dazwischen, DOM-frei (§2).
//
// Warum das ein eigener Test ist und keine Zeile im Menü: der Fall, der wehtut,
// ist der Nutzer, der in V1 «Chronologie» gewählt hat und dann V3 öffnet. Zeigt
// V3 dort «aus», hat er stillschweigend Information verloren; schreibt V3 beim
// blossen Anzeigen zurück, hat er seine Wahl verloren. Beide Fehler wären in
// einem `onClick`-Ausdruck unsichtbar.
//
// Rot zu bekommen: in `histZuSicht` die 'chronologie'-Zeile auf 'aus' drehen,
// oder in `sichtZuHist` 'an' auf 'chronologie' abbilden.

const ALLE: HistAnsicht[] = ['aus', 'fussnoten', 'chronologie'];

describe('V3-Sicht auf die dreiwertige Historie (Kap. 4f)', () => {
  it('nur «aus» ist AUS — jeder andere Wert zeigt Änderungsvermerke an', () => {
    expect(histZuSicht('aus')).toBe('aus');
    expect(histZuSicht('fussnoten')).toBe('an');
    // Der entscheidende Fall: «Chronologie» ist eine ANDERE Darstellung
    // derselben Vermerke, nicht deren Abwesenheit. Sie als «aus» zu zeigen
    // hiesse, dem Nutzer amtliche Substanz als versteckt zu melden (§8).
    expect(histZuSicht('chronologie')).toBe('an');
  });

  it('Setzen schreibt den Grundzustand «fussnoten» bzw. «aus»', () => {
    expect(sichtZuHist('an')).toBe('fussnoten');
    expect(sichtZuHist('aus')).toBe('aus');
  });

  it('Umschalten kehrt die Sicht immer um — aus jedem der drei Store-Werte', () => {
    for (const h of ALLE) {
      const nachher = histUmschalten(h);
      expect(histZuSicht(nachher), `Umschalten aus «${h}» kehrt nicht um`)
        .not.toBe(histZuSicht(h));
    }
  });

  it('zweimal Umschalten landet im Grundzustand, nie in einem vierten Wert', () => {
    for (const h of ALLE) {
      const zurueck = histUmschalten(histUmschalten(h));
      expect(ALLE).toContain(zurueck);
      // Idempotenz der SICHT (nicht des Store-Werts): «chronologie» → an → aus
      // → an landet auf 'fussnoten'. Das ist der einzige Normalisierungs-
      // Schritt, und er passiert nur nach einer ausdrücklichen Nutzer-Geste.
      expect(histZuSicht(zurueck)).toBe(histZuSicht(h));
    }
    expect(histUmschalten(histUmschalten('chronologie'))).toBe('fussnoten');
  });

  it('die Abbildung erfindet keinen Wert ausserhalb des Store-Vokabulars', () => {
    for (const h of ALLE) expect(ALLE).toContain(histUmschalten(h));
  });
});
