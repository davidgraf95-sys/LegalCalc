// ─── Property-Tests: bggVwvgFristen (Art. 22a VwVG / Art. 46 BGG) ────────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addDays } from 'date-fns';
import { berechneBggVwvgFrist, bvAusnahmenSatz, type BvFristInput, type StillstandRegime } from '../lib/bggVwvgFristen';
import type { Einheit } from '../lib/fristenEngine';
import { istArbeitsfreierTag } from '../data/zpoFeiertage';
import { PROPERTY_SEED, isoDatumArb, kantonArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const regimeArb = fc.constantFrom<StillstandRegime>('vwvg', 'bgg');
const einheitArb = fc.constantFrom<Einheit>('tage', 'wochen', 'monate', 'jahre');

const eingabeArb: fc.Arbitrary<BvFristInput> = fc.record({
  regime: regimeArb,
  ereignis: isoDatumArb(),
  einheit: einheitArb,
  laenge: fc.integer({ min: 1, max: 60 }),
  kanton: kantonArb,
});

// ─── BV-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('bggVwvgFristen — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneBggVwvgFrist(e)).toEqual(berechneBggVwvgFrist(e));
    }));
  });
});

// ─── BV-2 · Ordnung und Werktags-Ende ────────────────────────────────────────
// Art. 20 Abs. 3 VwVG / Art. 45 BGG: der letzte Tag wird auf den nächsten
// Werktag verschoben — nur vorwärts. Das Ende liegt nie vor Ereignis+laenge
// (Tagesfrist) und nie vor dem Ereignis selbst.
describe('bggVwvgFristen — Ende nie vor Beginn, stets ein Werktag', () => {
  it('Ende > Ereignis, Ende ist Werktag, verschoben-Flag stimmig', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneBggVwvgFrist(e);
      const ende = parseISO(r.diesAdQuemISO);
      expect(+ende > +parseISO(e.ereignis), `Ende ${r.diesAdQuemISO} liegt nicht nach dem Ereignis ${e.ereignis}`).toBe(true);
      expect(istArbeitsfreierTag(ende, e.kanton), `Ende ${r.diesAdQuemISO} ist arbeitsfrei in ${e.kanton}`).toBe(false);
      expect(Number.isNaN(+ende), `Ende ${r.diesAdQuemISO} ist kein gültiges Datum`).toBe(false);
    }));
  });

  it('Tagesfrist: Ende nie vor Ereignis + laenge (Stillstand verlängert nur)', () => {
    fc.assert(fc.property(isoDatumArb(), fc.integer({ min: 1, max: 60 }), regimeArb, kantonArb,
      (ereignis, laenge, regime, kanton) => {
        const r = berechneBggVwvgFrist({ regime, ereignis, einheit: 'tage', laenge, kanton });
        expect(+parseISO(r.diesAdQuemISO) >= +addDays(parseISO(ereignis), laenge),
          `Ende ${r.diesAdQuemISO} liegt vor dem naiven Ablauf`).toBe(true);
      }));
  });
});

// ─── BV-3 · Geltungsbereich des Stillstands (Art. 22a I VwVG / 46 I BGG) ────
// Beide Normen stellen den Stillstand ausdrücklich nur für «nach Tagen
// bestimmte» Fristen auf. Wochen-, Monats- und Jahresfristen stehen NICHT
// still — diese Schranke unterscheidet beide Regimes von der ZPO (Art. 145).
describe('bggVwvgFristen — Stillstand nur bei Tagesfristen', () => {
  it('stillstandAktiv ⟺ einheit === «tage»', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneBggVwvgFrist(e);
      expect(r.stillstandAktiv, `stillstandAktiv=${r.stillstandAktiv} bei Einheit «${e.einheit}»`).toBe(e.einheit === 'tage');
      // Und die Schranke wird ehrlich offengelegt (§8): Nicht-Tagesfristen
      // tragen die Warnung, Tagesfristen die Annahme.
      expect(r.warnungen.length > 0 || e.einheit === 'tage', 'Nicht-Tagesfrist ohne Offenlegung der Schranke').toBe(true);
    }));
  });
});

// ─── BV-4 · Regime-Trennung (§4): gleiche Arithmetik, getrennte Normen ──────
// Beide Regimes teilen die fachneutralen Stillstandsperioden (dasselbe Datum),
// bleiben aber im Norm-Anker und im Abs.-2-Ausnahmekatalog getrennt: VwVG
// kennt 2 Ausnahmen (Art. 22a II), das BGG deren 5 (Art. 46 II lit. a–e).
// Ein Kollaps beider Regimes würde genau hier auffallen.
describe('bggVwvgFristen — Regime-Trennung VwVG ≠ BGG (§4)', () => {
  it('identisches Datum, aber nie identische Normen/Ausnahmen', () => {
    fc.assert(fc.property(isoDatumArb(), einheitArb, fc.integer({ min: 1, max: 60 }), kantonArb,
      (ereignis, einheit, laenge, kanton) => {
        const v = berechneBggVwvgFrist({ regime: 'vwvg', ereignis, einheit, laenge, kanton });
        const b = berechneBggVwvgFrist({ regime: 'bgg', ereignis, einheit, laenge, kanton });
        expect(v.diesAdQuemISO, 'geteilte Perioden liefern unterschiedliche Daten').toBe(b.diesAdQuemISO);
        expect(v.normen, 'VwVG und BGG tragen denselben Norm-Anker — Regime kollabiert').not.toEqual(b.normen);
        expect(v.ausnahmen, 'VwVG und BGG tragen denselben Ausnahmekatalog — Regime kollabiert').not.toEqual(b.ausnahmen);
        expect(v.normen.every((n) => n.includes('VwVG')), `VwVG-Anker enthält Fremdnorm: ${v.normen.join(' / ')}`).toBe(true);
        expect(b.normen.every((n) => n.includes('BGG')), `BGG-Anker enthält Fremdnorm: ${b.normen.join(' / ')}`).toBe(true);
        expect(v.ausnahmen.length, 'VwVG-Ausnahmekatalog (Art. 22a Abs. 2) hat nicht 2 Einträge').toBe(2);
        expect(b.ausnahmen.length, 'BGG-Ausnahmekatalog (Art. 46 Abs. 2 lit. a–e) hat nicht 5 Einträge').toBe(5);
        expect(bvAusnahmenSatz('vwvg'), 'Offenlegungssatz beider Regimes identisch').not.toBe(bvAusnahmenSatz('bgg'));
      }));
  });
});

// ─── BV-5 · Monotonie in der Fristlänge ──────────────────────────────────────
// Beide Regimes kennen nur das Ruhen (Art. 22a I / 46 I) und die
// Werktagsverschiebung — beides Untergrenzen-Operationen, daher monoton.
describe('bggVwvgFristen — Monotonie: mehr Frist ⇒ nie früheres Ende', () => {
  it('laenge+1 endet nie vor laenge', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const kurz = berechneBggVwvgFrist(e).diesAdQuemISO;
      const lang = berechneBggVwvgFrist({ ...e, laenge: e.laenge + 1 }).diesAdQuemISO;
      expect(+parseISO(lang) >= +parseISO(kurz),
        `${e.regime}: ${e.laenge + 1} ${e.einheit} (${lang}) enden vor ${e.laenge} (${kurz})`).toBe(true);
    }));
  });
});
