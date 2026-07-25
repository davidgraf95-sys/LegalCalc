// IA-5 · Rechtsgebiet-Parameter-Kanonisierung (FAHRPLAN-GESETZES-UX §11.4
// Ziff. 2): `?ansicht=rechtsgebiet` ist ein auflösbarer Alias (A15: «Tür bleibt
// zusätzlich erreichbar, NICHT entfernt») auf den EINEN kanonischen Zustand
// `?gliederung=rechtsgebiet` (A15-Mechanik) in der Bund-Säule. Die Normalisierung
// ist reiner Parse (client-seitig, kein Router-Redirect — Leitplanke E.4) und
// deterministisch (§8): gleiche URL → gleiche kanonische Form.
import { describe, it, expect } from 'vitest';
import { istRechtsgebietAlias, normalisiereAnsicht } from '../pages/gesetze-teile/ansicht-alias';

function params(s: string): URLSearchParams {
  return new URLSearchParams(s);
}

describe('istRechtsgebietAlias — erkennt NUR den dokumentierten Alt-Wert', () => {
  it('?ansicht=rechtsgebiet ist der Alias', () => {
    expect(istRechtsgebietAlias(params('ansicht=rechtsgebiet'))).toBe(true);
  });
  it('ohne ansicht-Parameter kein Alias', () => {
    expect(istRechtsgebietAlias(params('ebene=bund'))).toBe(false);
  });
  it('fremder ansicht-Wert ist KEIN Alias (nicht raten, §8)', () => {
    expect(istRechtsgebietAlias(params('ansicht=liste'))).toBe(false);
  });
});

describe('normalisiereAnsicht — Alt-URL → kanonische Form (§11.4 Ziff. 2)', () => {
  it('?ansicht=rechtsgebiet → ?ebene=bund&gliederung=rechtsgebiet, Alias entfernt', () => {
    const n = normalisiereAnsicht(params('ansicht=rechtsgebiet'));
    expect(n).not.toBeNull();
    expect(n!.get('ansicht')).toBeNull();
    expect(n!.get('gliederung')).toBe('rechtsgebiet');
    expect(n!.get('ebene')).toBe('bund');
  });

  it('fremde Parameter bleiben erhalten (Deep-Links E.4)', () => {
    const n = normalisiereAnsicht(params('ansicht=rechtsgebiet&q=miete'));
    expect(n!.get('q')).toBe('miete');
    expect(n!.get('gliederung')).toBe('rechtsgebiet');
  });

  it('ohne Alias nichts zu tun → null (Eingabe unangetastet)', () => {
    const p = params('ebene=kanton&kt=BS');
    expect(normalisiereAnsicht(p)).toBeNull();
    // Die Eingabe wird nie mutiert.
    expect(p.toString()).toBe('ebene=kanton&kt=BS');
  });

  it('fremder ansicht-Wert wird NICHT normalisiert (kein Raten, §8)', () => {
    expect(normalisiereAnsicht(params('ansicht=liste'))).toBeNull();
  });

  it('Alias gewinnt über widersprüchliches ?gliederung= (alte Tür = Rechtsgebiets-Sicht)', () => {
    const n = normalisiereAnsicht(params('ansicht=rechtsgebiet&gliederung=relevanz'));
    expect(n!.get('gliederung')).toBe('rechtsgebiet');
  });

  it('Alias erzwingt die Bund-Säule und räumt ?ebene=/?kt= (identischer Inhalt wie die alte Tür)', () => {
    // Alt-Verhalten: die themenSicht überdeckte jede Ebenen-Wahl und zeigte die
    // Bund-Querschnitts-Sicht — die kanonische Form bildet GENAU das ab (§11.4 Ziff. 1).
    const n = normalisiereAnsicht(params('ansicht=rechtsgebiet&ebene=kanton&kt=BS'));
    expect(n!.get('ebene')).toBe('bund');
    expect(n!.get('kt')).toBeNull();
  });

  it('idempotent: die kanonische Form normalisiert nicht weiter (kein Effekt-Loop)', () => {
    const einmal = normalisiereAnsicht(params('ansicht=rechtsgebiet'))!;
    expect(normalisiereAnsicht(einmal)).toBeNull();
  });
});
