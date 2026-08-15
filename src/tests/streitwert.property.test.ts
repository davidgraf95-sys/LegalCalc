// ─── Property-Tests: streitwert (Art. 91–94a ZPO) — QS-CODE-PROP ─────────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  berechneStreitwert, streitwertGrenzwerte,
  type Begehren, type StreitwertInput, type StreitwertGebiet,
} from '../lib/streitwert';
import { PROPERTY_SEED, chfArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

/** Bezifferbare Begehren (Art. 91 Abs. 1 / 92 ZPO) — die rechenbare Domäne. */
const bezifferbarArb: fc.Arbitrary<Begehren> = fc.oneof(
  chfArb(5_000_000).map((betragCHF): Begehren => ({ typ: 'einmalig', betragCHF })),
  chfArb(500_000).map((jahresbetragCHF): Begehren => ({ typ: 'wiederkehrend', jahresbetragCHF, dauer: 'unbestimmt' })),
  fc.tuple(chfArb(500_000), fc.integer({ min: 1, max: 50 }))
    .map(([jahresbetragCHF, jahre]): Begehren => ({ typ: 'wiederkehrend', jahresbetragCHF, dauer: 'bestimmt', jahre })),
  chfArb(5_000_000).map((barwertCHF): Begehren => ({ typ: 'wiederkehrend', dauer: 'leibrente', barwertCHF })),
);

const eingabeArb: fc.Arbitrary<StreitwertInput> = fc.record({
  begehren: fc.array(bezifferbarArb, { minLength: 1, maxLength: 4 }),
  begehrenSchliessenSichAus: fc.boolean(),
});

// ─── SW-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('streitwert — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. Rechenweg)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneStreitwert(e)).toEqual(berechneStreitwert(e));
    }));
  });
});

// ─── SW-2 · Grenzen: nie negativ, nie NaN, nie Infinity ─────────────────────
describe('streitwert — Ergebnis ist endlich und nie negativ', () => {
  it('beide Ausgaben sind null oder endliche Zahlen ≥ 0', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneStreitwert(e);
      for (const [name, v] of [['Verfahrens-Streitwert', r.streitwertVerfahrenCHF], ['Kosten-Basis', r.kostenBasisCHF]] as const) {
        if (v === null) continue;
        expect(Number.isFinite(v), `${name} ist nicht endlich: ${v}`).toBe(true);
        expect(v >= 0, `${name} ist negativ: ${v}`).toBe(true);
      }
    }));
  });
});

// ─── SW-3 · Ermessens-Weiche: nicht bezifferbare Begehren werden NIE geschätzt ─
// §2 / Art. 91 Abs. 2 bzw. Art. 94a ZPO: Enthält die Häufung ein nicht
// beziffertes Begehren (oder eine Leibrente ohne Barwert), setzt das GERICHT
// den Streitwert fest — die Engine gibt dann KEINE Zahl aus. Eine Schätzung
// wäre ein erfundener Wert.
describe('streitwert — kein Schätzen bei Ermessens-Begehren (§2)', () => {
  it('ein nicht bezifferbares Begehren ⇒ beide Ausgaben null', () => {
    fc.assert(fc.property(fc.array(bezifferbarArb, { minLength: 0, maxLength: 3 }), fc.boolean(),
      fc.constantFrom<Begehren>({ typ: 'unbeziffert' }, { typ: 'wiederkehrend', dauer: 'leibrente' }, { typ: 'einmalig' }),
      (rest, aus, ermessen) => {
        const r = berechneStreitwert({ begehren: [...rest, ermessen], begehrenSchliessenSichAus: aus });
        expect(r.streitwertVerfahrenCHF, `Ermessens-Begehren (${ermessen.typ}) wurde zu ${r.streitwertVerfahrenCHF} geschätzt`).toBeNull();
        expect(r.kostenBasisCHF, 'Kosten-Basis trotz Ermessens-Begehren beziffert').toBeNull();
        expect(r.warnungen.length > 0, 'Ermessens-Weiche ohne Warnung (§8)').toBe(true);
      }));
  });
});

// ─── SW-4 · Häufung: Zusammenrechnung ≥ Ausschluss-Variante (Art. 93 ZPO) ────
// Sich ausschliessende Begehren werden NICHT zusammengerechnet; massgeblich ist
// dann der höchste Einzelwert. Der ist nie grösser als die Summe.
describe('streitwert — Klagenhäufung: Summe ≥ höchster Einzelwert (Art. 93 ZPO)', () => {
  it('sich ausschliessende Begehren ergeben nie mehr als die Zusammenrechnung', () => {
    fc.assert(fc.property(fc.array(bezifferbarArb, { minLength: 2, maxLength: 4 }), (begehren) => {
      const summe = berechneStreitwert({ begehren }).streitwertVerfahrenCHF;
      const max = berechneStreitwert({ begehren, begehrenSchliessenSichAus: true }).streitwertVerfahrenCHF;
      if (summe === null || max === null) return;
      expect(max <= summe + 1e-6, `Ausschluss-Variante ${max} > Zusammenrechnung ${summe}`).toBe(true);
    }));
  });
});

// ─── SW-5 · Widerklage: Verfahrens-Streitwert ist das HÖHERE Begehren ───────
// Art. 94 Abs. 1 ZPO. Die Kosten-Bemessungsgrundlage folgt einem EIGENEN
// Regime (Abs. 2/3) und darf mit dem Verfahrens-Streitwert nicht kollabieren:
// bei Teilklage (Abs. 3, Rev. 2025) zählt allein die Hauptklage.
describe('streitwert — Widerklage: Verfahren ≠ Kosten (Art. 94 ZPO, §4)', () => {
  it('Verfahren = max(Haupt, Widerklage); Teilklage bemisst die Kosten nur nach der Hauptklage', () => {
    fc.assert(fc.property(chfArb(5_000_000), chfArb(5_000_000), fc.boolean(), fc.boolean(),
      (haupt, wk, teilklage, schliesstAus) => {
        const e: StreitwertInput = {
          begehren: [{ typ: 'einmalig', betragCHF: haupt }],
          widerklage: { betragCHF: wk, schliesstAus },
          hauptklageIstTeilklage: teilklage,
        };
        const r = berechneStreitwert(e);
        expect(r.streitwertVerfahrenCHF, `Verfahrens-Streitwert ≠ max(${haupt}, ${wk})`).toBe(Math.max(haupt, wk));
        expect(r.kostenBasisCHF! >= 0 && Number.isFinite(r.kostenBasisCHF!), 'Kosten-Basis ungültig').toBe(true);
        if (teilklage) {
          expect(r.kostenBasisCHF, 'Teilklage (Art. 94 Abs. 3 ZPO): Kosten nicht allein nach der Hauptklage bemessen').toBe(haupt);
        } else if (schliesstAus) {
          expect(r.kostenBasisCHF, 'sich ausschliessende Klagen wurden zusammengerechnet (Art. 94 Abs. 2 ZPO)').toBe(Math.max(haupt, wk));
        } else {
          expect(r.kostenBasisCHF, 'Kosten-Basis ist nicht die Summe beider Streitwerte').toBeCloseTo(haupt + wk, 6);
        }
      }));
  });
});

// ─── SW-6 · Monotonie: mehr Forderung ⇒ nie kleinerer Streitwert ────────────
describe('streitwert — Monotonie im bezifferten Betrag', () => {
  it('höherer Einzelbetrag ergibt nie einen kleineren Streitwert', () => {
    fc.assert(fc.property(chfArb(5_000_000), chfArb(1_000_000), fc.array(bezifferbarArb, { maxLength: 2 }), fc.boolean(),
      (basis, zuschlag, weitere, aus) => {
        const bau = (b: number) => berechneStreitwert({
          begehren: [{ typ: 'einmalig', betragCHF: b }, ...weitere], begehrenSchliessenSichAus: aus,
        }).streitwertVerfahrenCHF;
        const klein = bau(basis), gross = bau(basis + zuschlag);
        if (klein === null || gross === null) return;
        expect(gross >= klein - 1e-6, `${basis + zuschlag} ergab ${gross} < ${klein} bei ${basis}`).toBe(true);
      }));
  });
});

// ─── SW-7 · Grenzwert-Abgleich: ZPO-Verfahrensart ≠ BGG-Schwelle (§4) ───────
// Zwei streng getrennte Regimes: Art. 243 Abs. 1 ZPO (vereinfacht BIS 30 000,
// gebietsUNabhängig) und Art. 74 Abs. 1 BGG (Beschwerde AB 15 000 bzw. 30 000,
// gebietsABHÄNGIG). Ein Kollaps — gleiche Schwelle, gleiche Richtung, oder eine
// gebietsabhängige ZPO-Grenze — wäre eine falsche Rechtsauskunft.
describe('streitwert — Grenzwerte ZPO und BGG kollabieren nicht (§4)', () => {
  const gebietArb = fc.constantFrom<StreitwertGebiet>('miete_arbeit', 'uebrige');

  it('Richtung und Schwelle je Regime, ZPO gebietsunabhängig, Ermessen ⇒ keine Aussage', () => {
    fc.assert(fc.property(fc.option(chfArb(1_000_000), { nil: null }), gebietArb, (sw, gebiet) => {
      const [zpo, bgg] = streitwertGrenzwerte(sw, gebiet);
      expect(zpo.regime, 'erster Grenzwert ist nicht die ZPO-Verfahrensart').toBe('zpo-verfahrensart');
      expect(bgg.regime, 'zweiter Grenzwert ist nicht die BGG-Beschwerde').toBe('bgg-beschwerde-zivil');
      expect(zpo.schwelleCHF, 'ZPO-Grenze ist nicht 30 000 (Art. 243 Abs. 1 ZPO)').toBe(30_000);
      expect(bgg.schwelleCHF, `BGG-Schwelle für «${gebiet}» falsch (Art. 74 Abs. 1 lit. a/b BGG)`)
        .toBe(gebiet === 'miete_arbeit' ? 15_000 : 30_000);
      // ZPO-Grenze hängt NIE vom Gebiet ab (das tut nur die BGG-Schwelle).
      const [zpoAndersGebiet] = streitwertGrenzwerte(sw, gebiet === 'miete_arbeit' ? 'uebrige' : 'miete_arbeit');
      expect(zpoAndersGebiet.schwelleCHF, 'ZPO-Verfahrensgrenze wurde gebietsabhängig').toBe(zpo.schwelleCHF);
      expect(zpoAndersGebiet.erfuellt, 'ZPO-Verdikt wurde gebietsabhängig').toBe(zpo.erfuellt);
      if (sw === null) {
        expect(zpo.erfuellt, 'Ermessen: ZPO-Verdikt trotzdem gesetzt').toBeNull();
        expect(bgg.erfuellt, 'Ermessen: BGG-Verdikt trotzdem gesetzt').toBeNull();
      } else {
        expect(zpo.erfuellt, `ZPO: ${sw} ≤ 30 000 falsch beurteilt`).toBe(sw <= 30_000);
        expect(bgg.erfuellt, `BGG: ${sw} ≥ ${bgg.schwelleCHF} falsch beurteilt`).toBe(sw >= bgg.schwelleCHF);
      }
      expect(zpo.selbstPruefen.length > 0 && bgg.selbstPruefen.length > 0,
        'nicht-rechenbare Tore werden nicht offengelegt (§8)').toBe(true);
    }));
  });
});
