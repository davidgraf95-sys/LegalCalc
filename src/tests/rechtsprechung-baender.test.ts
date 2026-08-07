// Band-/Jahr-Gruppierung der Sprungleiste (W2·10-UI-NAV/J1).
//
// Die Leiste verspricht dreierlei, und genau das prüfen diese Fälle:
//   1. Sie bildet die REIHENFOLGE DER LISTE ab, sortiert nicht um.
//   2. Sie schreibt einen BGE-Band nur an, wenn er für das Jahr eindeutig ist
//      (§8 — sonst behauptete der Chip eine Zuordnung, die die Daten nicht tragen).
//   3. Sie zeigt sich nur bei chronologischer Sicht (`istChronologisch`); bei
//      einer Liste, die zwischen Jahren hin- und herspringt, hätte ein Chip
//      mehrere Fundstellen und der Sprung landete willkürlich.
//
// `ersterIndex` ist der Vertrag zum Batching: das Sprungziel muss geladen sein,
// bevor dorthin gescrollt werden kann.

import { describe, it, expect } from 'vitest';
import { jahrVon, bandVon, zaehleBaender, istChronologisch } from '../components/rechtsprechung/baender';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';

function e(teil: Partial<BrowseEntscheid> & { key: string }): BrowseEntscheid {
  return {
    gericht: 'bger', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', nummer: '5A_1/2025', bgeReferenz: null, datum: '2025-01-01',
    zitierung: 'BGer 5A_1/2025', leitcharakter: 'routine', regesteVorhanden: false,
    regesteKurz: null, sachgebiet: 'privat', sprache: 'de', normKeys: [],
    bestand: 'vollstaendig', kuratierung: 'maschinell', datei: null,
    quelle: 'opencaselaw', quelleUrl: 'https://example.invalid', fassungsToken: 'x',
    ...teil,
  } as BrowseEntscheid;
}

describe('jahrVon / bandVon', () => {
  it('liest das Jahr aus dem ISO-Datum', () => {
    expect(jahrVon(e({ key: 'a', datum: '2026-08-07' }))).toBe('2026');
  });

  it('behält das Jahr auch bei unbekanntem TAG (BS §3.3/§7.2)', () => {
    // Unbekannt ist der Tag, nicht das Jahr — die Anzeige sagt «2024, o. D.».
    expect(jahrVon(e({ key: 'a', datum: '2024-01-01', datumUnbekannt: true }))).toBe('2024');
  });

  it('liest den Band aus der BGE-Referenz, sonst null', () => {
    expect(bandVon(e({ key: 'a', bgeReferenz: '152 IV 14' }))).toBe('152');
    expect(bandVon(e({ key: 'b', bgeReferenz: null }))).toBeNull();
  });

  it('verträgt historische Abteilungen («148 Ia 31»)', () => {
    expect(bandVon(e({ key: 'a', bgeReferenz: '148 Ia 31' }))).toBe('148');
  });
});

describe('zaehleBaender', () => {
  it('gruppiert aufeinanderfolgende Jahre und merkt sich den ersten Index', () => {
    const liste = [
      e({ key: 'a', datum: '2026-08-07' }),
      e({ key: 'b', datum: '2026-03-01' }),
      e({ key: 'c', datum: '2025-11-02' }),
    ];
    const g = zaehleBaender(liste);
    expect(g.map((x) => x.jahr)).toEqual(['2026', '2025']);
    expect(g.map((x) => x.count)).toEqual([2, 1]);
    expect(g.map((x) => x.ersterIndex)).toEqual([0, 2]);
  });

  it('schreibt den Band an, wenn er für das Jahr EINDEUTIG ist', () => {
    const g = zaehleBaender([
      e({ key: 'a', datum: '2026-08-07', bgeReferenz: '152 IV 14' }),
      e({ key: 'b', datum: '2026-03-01', bgeReferenz: '152 III 9' }),
    ]);
    expect(g[0].label).toBe('2026 · BGE 152');
  });

  it('lässt den Band weg, wenn ein Jahr MEHRERE Bände trägt (§8)', () => {
    const g = zaehleBaender([
      e({ key: 'a', datum: '2026-08-07', bgeReferenz: '152 IV 14' }),
      e({ key: 'b', datum: '2026-01-04', bgeReferenz: '151 III 9' }),
    ]);
    expect(g[0].label).toBe('2026');
  });

  it('lässt den Band weg, wenn das Jahr gar keine BGE enthält', () => {
    const g = zaehleBaender([e({ key: 'a', datum: '2026-08-07', bgeReferenz: null })]);
    expect(g[0].label).toBe('2026');
  });

  it('zählt Verweis-Einträge nicht mit (symmetrisch zum Treffer-Zähler)', () => {
    const g = zaehleBaender([
      e({ key: 'a', datum: '2026-08-07' }),
      e({ key: 'b', datum: '2026-03-01', verweis: { zielKey: 'a', ansicht: 'voll', bgeReferenz: '152 IV 14' } }),
    ]);
    expect(g[0].count).toBe(1);
  });

  it('sortiert NICHT um — die Leiste spiegelt die Liste', () => {
    const g = zaehleBaender([
      e({ key: 'a', datum: '2019-05-05' }),
      e({ key: 'b', datum: '2026-08-07' }),
    ]);
    expect(g.map((x) => x.jahr)).toEqual(['2019', '2026']);
  });
});

describe('istChronologisch', () => {
  it('true, wenn jedes Jahr genau einmal vorkommt', () => {
    expect(istChronologisch(zaehleBaender([
      e({ key: 'a', datum: '2026-08-07' }),
      e({ key: 'b', datum: '2025-01-01' }),
    ]))).toBe(true);
  });

  it('false, wenn ein Jahr mehrfach auftaucht (z. B. Relevanz-Sortierung)', () => {
    // Genau der Fall, in dem ein Chip zwei Fundstellen hätte → Leiste bleibt weg.
    expect(istChronologisch(zaehleBaender([
      e({ key: 'a', datum: '2026-08-07' }),
      e({ key: 'b', datum: '2025-01-01' }),
      e({ key: 'c', datum: '2026-02-02' }),
    ]))).toBe(false);
  });
});
