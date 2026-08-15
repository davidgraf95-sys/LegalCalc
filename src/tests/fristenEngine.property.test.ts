// ─── Property-Tests: fristenEngine (QS-CODE-PROP) ────────────────────────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// (Abschnitt «fristenEngine»). Diese Datei prüft die fachNEUTRALEN Fristen-
// Primitiven, auf denen ZPO-, SchKG-, BGG/VwVG- und OR-Engines aufsetzen.
// Fällt hier eine Eigenschaft, fällt sie in ALLEN Fristenrechnern.
//
// KEINE Engine-Änderung. Wird eine Property real rot, ist das ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { addDays, addMonths, addYears, isBefore } from 'date-fns';
import {
  nthWerktagNach, fristendeTage, fristendeKalender, normalisiereEnde,
  OHNE_STILLSTAND, type Stillstand, type Einheit,
} from '../lib/fristenEngine';
import { stillstandsperioden, stillstandsperiodeFuer, istArbeitsfreierTag } from '../data/zpoFeiertage';
import { betreibungsferien, betreibungsperiodeFuer } from '../data/schkgFeiertage';
import { PROPERTY_SEED, datumArb, kantonArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

// Die drei realen Stillstand-Regimes (§4: regime-treu, kein Kollaps).
const ZPO_RUHEN: Stillstand = {
  periodeFuer: stillstandsperiodeFuer, perioden: stillstandsperioden,
  ruhenZaehlung: true, endregel: 'ruhen_weiter',
};
const SCHKG_63: Stillstand = {
  periodeFuer: betreibungsperiodeFuer, perioden: betreibungsferien,
  ruhenZaehlung: false, endregel: 'verlaengerung_3wt',
};
const REGIMES: { label: string; st: Stillstand }[] = [
  { label: 'ohne Stillstand', st: OHNE_STILLSTAND },
  { label: 'ZPO-Ruhen (Art. 145 ZPO)', st: ZPO_RUHEN },
  { label: 'SchKG-Betreibungsferien (Art. 63 SchKG)', st: SCHKG_63 },
];
const regimeArb = fc.constantFrom(...REGIMES);
const laengeArb = fc.integer({ min: 1, max: 120 });
const einheitArb = fc.constantFrom<Einheit>('tage', 'wochen', 'monate', 'jahre');

// ─── FE-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('fristenEngine — Determinismus (§2)', () => {
  it('fristendeTage/fristendeKalender/normalisiereEnde: f(x) === f(x)', () => {
    fc.assert(fc.property(datumArb(), laengeArb, einheitArb, regimeArb, kantonArb,
      (d, n, einheit, { st }, kt) => {
        expect(fristendeTage(d, n, st)).toEqual(fristendeTage(d, n, st));
        expect(fristendeKalender(d, einheit, n, st, false)).toEqual(fristendeKalender(d, einheit, n, st, false));
        expect(normalisiereEnde(d, kt, st)).toEqual(normalisiereEnde(d, kt, st));
        expect(+nthWerktagNach(d, 3, kt)).toBe(+nthWerktagNach(d, 3, kt));
      }));
  });
});

// ─── FE-2 · nthWerktagNach: nur vorwärts, landet auf einem Werktag ───────────
// Herleitung: Code-Doc «Der n-te Werktag NACH d» (Art. 63 SchKG; BGE 108 III 49).
describe('fristenEngine — nthWerktagNach zählt vorwärts und landet auf einem Werktag', () => {
  it('Ergebnis liegt strikt nach d, ist ein Werktag und wächst streng mit n', () => {
    fc.assert(fc.property(datumArb(), fc.integer({ min: 1, max: 10 }), kantonArb, (d, n, kt) => {
      const r = nthWerktagNach(d, n, kt);
      expect(isBefore(d, r), `nthWerktagNach(${d.toISOString()}, ${n}, ${kt}) = ${r.toISOString()} liegt nicht nach d`).toBe(true);
      expect(istArbeitsfreierTag(r, kt), `${r.toISOString()} ist kein Werktag (${kt})`).toBe(false);
      const rPlus = nthWerktagNach(d, n + 1, kt);
      expect(isBefore(r, rPlus), `n+1 (${rPlus.toISOString()}) liegt nicht nach n (${r.toISOString()})`).toBe(true);
    }));
  });
});

// ─── FE-3 · Tagesfrist: Ordnung und Untergrenze ──────────────────────────────
// «Eine Frist endet nie vor ihrem Beginn»: Ereignistag < dies a quo ≤ Ende
// (Art. 142 Abs. 1 ZPO — Beginn am Folgetag). Ruhen kann nur VERLÄNGERN, also
// liegt das Ende nie vor dem naiven Ende (Ereignis + laenge Kalendertage).
describe('fristenEngine — Tagesfrist: Ende nie vor Beginn, Ruhen verlängert nur', () => {
  it('ereignis < diesAQuo ≤ ende und ende ≥ ereignis + laenge', () => {
    fc.assert(fc.property(datumArb(), laengeArb, regimeArb, (d, n, { label, st }) => {
      const { diesAQuo, ende } = fristendeTage(d, n, st);
      expect(isBefore(d, diesAQuo), `${label}: dies a quo ${diesAQuo.toISOString()} nicht nach dem Ereignis`).toBe(true);
      expect(+ende >= +diesAQuo, `${label}: Ende ${ende.toISOString()} vor dem Beginn ${diesAQuo.toISOString()}`).toBe(true);
      expect(+ende >= +addDays(d, n), `${label}: Ende ${ende.toISOString()} vor dem naiven Ende ${addDays(d, n).toISOString()}`).toBe(true);
    }));
  });

  it('streng monoton in der Fristlänge (mehr Tage ⇒ späteres Ende)', () => {
    fc.assert(fc.property(datumArb(), laengeArb, regimeArb, (d, n, { label, st }) => {
      const kurz = fristendeTage(d, n, st).ende;
      const lang = fristendeTage(d, n + 1, st).ende;
      expect(isBefore(kurz, lang), `${label}: ${n + 1} Tage (${lang.toISOString()}) enden nicht nach ${n} Tagen (${kurz.toISOString()})`).toBe(true);
    }));
  });
});

// ─── FE-4 · Kalenderfrist: Verlängerung nur vorwärts ─────────────────────────
// Art. 146 Abs. 1 ZPO (dies a quo ans Periodenende) und die kumulative
// Ruhen-Verlängerung schieben stets NACH HINTEN; verlaengerungTage ist ein
// Zuschlag, nie ein Abzug.
describe('fristenEngine — Kalenderfrist: dies a quo und Verlängerung nur vorwärts', () => {
  const naiv = (ref: Date, e: Einheit, n: number): Date =>
    e === 'wochen' ? addDays(ref, 7 * n) : e === 'monate' ? addMonths(ref, n) : e === 'jahre' ? addYears(ref, n) : addDays(ref, n);

  it('diesAQuo ≥ ereignis, verlaengerungTage ≥ 0, ende ≥ naives Ende ab diesAQuo', () => {
    fc.assert(fc.property(datumArb(), einheitArb, fc.integer({ min: 1, max: 30 }), regimeArb, fc.boolean(),
      (d, einheit, n, { label, st }, folgetag) => {
        const r = fristendeKalender(d, einheit, n, st, folgetag);
        expect(+r.diesAQuo >= +d, `${label}: diesAQuo ${r.diesAQuo.toISOString()} vor dem Ereignis`).toBe(true);
        expect(r.verlaengerungTage >= 0, `${label}: negative Verlängerung ${r.verlaengerungTage}`).toBe(true);
        const ref = folgetag ? addDays(r.diesAQuo, 1) : r.diesAQuo;
        expect(+r.ende >= +naiv(ref, einheit, n), `${label}: Ende ${r.ende.toISOString()} vor dem naiven Ende ${naiv(ref, einheit, n).toISOString()}`).toBe(true);
      }));
  });
});

// ─── FE-5 · Endnormalisierung: nie rückwärts, Ergebnis ist ein offener Tag ───
// Art. 142 Abs. 3 ZPO / Art. 63 SchKG verschieben das Ende ausschliesslich
// NACH VORNE (eine Rückverschiebung würde die Frist verkürzen). Das Ergebnis
// ist stets ein Werktag und liegt in keiner geschlossenen Zeit.
describe('fristenEngine — normalisiereEnde verschiebt nur vorwärts', () => {
  it('tag ≥ ende, verschoben ⟺ tag ≠ ende, Ergebnis ist Werktag ausserhalb geschlossener Zeit', () => {
    fc.assert(fc.property(datumArb(), kantonArb, regimeArb, (d, kt, { label, st }) => {
      const { tag, verschoben } = normalisiereEnde(d, kt, st);
      expect(+tag >= +d, `${label}: ${tag.toISOString()} liegt VOR dem Ende ${d.toISOString()} — Frist verkürzt`).toBe(true);
      expect(verschoben, `${label}: verschoben-Flag widerspricht dem Datum`).toBe(+tag !== +d);
      expect(istArbeitsfreierTag(tag, kt), `${label}: Fristende ${tag.toISOString()} ist ein arbeitsfreier Tag (${kt})`).toBe(false);
      if (st.endregel !== 'nur_werktag') {
        expect(st.periodeFuer(tag), `${label}: Fristende ${tag.toISOString()} liegt in geschlossener Zeit`).toBeNull();
      }
    }));
  });
});
