// IA-3 · A–Z-/Kürzel-Register (FAHRPLAN-GESETZES-UX §11.5): reine Gruppier-
// Helfer für den Browse-Zwilling auf /gesetze. Deterministische
// Einsortierung (dokumentiert in az-register.ts):
//   – Anfangsklasse = erster Buchstabe des TITELS (title-only, H1: Nutzer kennt
//     das Kürzel nicht), Diakritika gefaltet (Ä→A, Ö→O, Ü→U, É→E; DIN 5007-1,
//     wie gesetze-im-internet), Kleinbuchstaben gehoben (eGovG → E).
//   – Führende Ziffern/«§»/Sonderzeichen → EINE Sammelklasse ZIFFERN_KLASSE
//     («0–9»), am ENDE der Buchstaben-Leiste.
//   – Innerhalb einer Klasse: de-CH-Kollation über den Titel, Tie-Break key.
// KEIN zweiter Suchindex (K10): alles rechnet auf dem bereits geladenen
// register.json-Manifest (BrowseErlass[]).
import { describe, it, expect } from 'vitest';
import {
  anfangsklasse, gruppiereAZ, ebeneLabel,
  AZ_KLASSEN, ZIFFERN_KLASSE,
} from '../pages/gesetze-teile/az-register';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// Minimaler Erlass-Bauer (nur die für die Helfer relevanten Felder variieren).
function erlass(teil: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'X', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'X',
    sr: null, rechtsgebiet: 'privat', sprache: 'de', rang: 0,
    status: 'snapshot', datei: 'bund/X.json', artikelAnzahl: 1,
    stand: '2026-01-01', quelleUrl: 'https://example.org', fassungsToken: '',
    pdfPfad: null,
    ...teil,
  } as BrowseErlass;
}

describe('anfangsklasse — deterministische Einsortierung (§11.5 IA-3)', () => {
  it('gewöhnliche Titel: erster Buchstabe, gross', () => {
    expect(anfangsklasse('Schweizerisches Zivilgesetzbuch')).toBe('S');
    expect(anfangsklasse('Bundesverfassung')).toBe('B');
  });

  it('Umlaute werden gefaltet: Ä→A, Ö→O, Ü→U (DIN 5007-1)', () => {
    expect(anfangsklasse('Übertretungsstrafgesetz')).toBe('U');
    expect(anfangsklasse('Ärzteverordnung')).toBe('A');
    expect(anfangsklasse('Öffentlichkeitsgesetz')).toBe('O');
  });

  it('französische Akzente werden gefaltet (É→E, À→A)', () => {
    expect(anfangsklasse('École cantonale')).toBe('E');
    expect(anfangsklasse('Àccord test')).toBe('A');
  });

  it('kleingeschriebene Titel-Anfänge werden gehoben (eGovG, kant. BBV)', () => {
    expect(anfangsklasse('eGovG (142.3)')).toBe('E');
    expect(anfangsklasse('kant. BBV (414.111)')).toBe('K');
    expect(anfangsklasse('kÖREBKV (723.104)')).toBe('K');
  });

  it('führende Ziffern und «§» fallen in die Sammelklasse am Ende', () => {
    expect(anfangsklasse('2. Nachtragsverordnung')).toBe(ZIFFERN_KLASSE);
    expect(anfangsklasse('§ 12-Verordnung')).toBe(ZIFFERN_KLASSE);
    expect(anfangsklasse('«Anführungs»-Titel')).toBe(ZIFFERN_KLASSE);
  });

  it('führender Leerraum wird ignoriert', () => {
    expect(anfangsklasse('  Obligationenrecht')).toBe('O');
  });

  it('AZ_KLASSEN: A–Z, dann die Ziffern-Klasse als letztes Element', () => {
    expect(AZ_KLASSEN).toHaveLength(27);
    expect(AZ_KLASSEN[0]).toBe('A');
    expect(AZ_KLASSEN[25]).toBe('Z');
    expect(AZ_KLASSEN[26]).toBe(ZIFFERN_KLASSE);
  });
});

describe('gruppiereAZ — vollständig, deterministisch sortiert', () => {
  const liste = [
    erlass({ key: 'ZGB', titel: 'Schweizerisches Zivilgesetzbuch' }),
    erlass({ key: 'USG-BS', titel: 'Übertretungsstrafgesetz', ebene: 'kanton', kanton: 'BS' }),
    erlass({ key: 'UVG', titel: 'Unfallversicherungsgesetz' }),
    erlass({ key: 'N2', titel: '2. Nachtrag' }),
    erlass({ key: 'StGB', titel: 'Schweizerisches Strafgesetzbuch' }),
  ];

  it('jeder Erlass landet in genau einer Klasse (nichts verloren, nichts doppelt)', () => {
    const g = gruppiereAZ(liste);
    const summe = [...g.values()].reduce((a, l) => a + l.length, 0);
    expect(summe).toBe(liste.length);
  });

  it('Ü-Titel liegt unter U, gemeinsam mit U-Titeln, de-CH-sortiert (Ü≈U: «Übertretung…» vor «Unfall…», DIN 5007-1)', () => {
    const g = gruppiereAZ(liste);
    const u = g.get('U')!;
    expect(u.map((e) => e.key)).toEqual(['USG-BS', 'UVG']);
  });

  it('innerhalb einer Klasse: Titel-Kollation, Tie-Break key', () => {
    const g = gruppiereAZ(liste);
    expect(g.get('S')!.map((e) => e.key)).toEqual(['StGB', 'ZGB']);
  });

  it('Ziffern-Titel liegen in der Sammelklasse', () => {
    const g = gruppiereAZ(liste);
    expect(g.get(ZIFFERN_KLASSE)!.map((e) => e.key)).toEqual(['N2']);
  });
});

describe('ebeneLabel — Ebenen-Mix Bund/Kanton/International korrekt gelabelt', () => {
  it('Bund', () => {
    expect(ebeneLabel(erlass({ ebene: 'bund' }))).toBe('Bund');
  });
  it('Kanton mit Kürzel', () => {
    expect(ebeneLabel(erlass({ ebene: 'kanton', kanton: 'BS' }))).toBe('Kanton BS');
  });
  it('International (ebene bund, rechtsgebiet international — wie die Säulen-Logik)', () => {
    expect(ebeneLabel(erlass({ ebene: 'bund', rechtsgebiet: 'international' }))).toBe('International');
  });
});
