// ─── Property-Tests: allgemeineFrist (Art. 77/78 OR) — QS-CODE-PROP ──────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, isSaturday, isSunday, addDays, differenceInCalendarDays } from 'date-fns';
import {
  berechneAllgemeineFrist, berechneRueckwaertsFrist, tageZwischen,
  type AllgFristInput, type Einheit,
} from '../lib/allgemeineFrist';
import { istFeiertag } from '../data/zpoFeiertage';
import { PROPERTY_SEED, isoDatumArb, kantonArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const einheitArb = fc.constantFrom<Einheit>('tage', 'wochen', 'monate', 'jahre');
const laengeArb = fc.integer({ min: 1, max: 60 });

/** Gültige Eingabe-Domäne: Kanton ist Pflicht, sobald Feiertage verschieben. */
const eingabeArb: fc.Arbitrary<AllgFristInput> = fc.record({
  start: isoDatumArb(),
  laenge: laengeArb,
  einheit: einheitArb,
  wochenendeVerschieben: fc.boolean(),
  feiertageVerschieben: fc.boolean(),
  kanton: kantonArb,
});

// ─── AF-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('allgemeineFrist — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. Rechenweg)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneAllgemeineFrist(e)).toEqual(berechneAllgemeineFrist(e));
    }));
  });
});

// ─── AF-2 · Ordnung: Fristende nie vor Fristbeginn ───────────────────────────
// Art. 77 Abs. 1 OR: dies a quo non computatur → der erste mitzählende Tag ist
// der Folgetag; das Ende liegt nie davor. Die Verschiebung nach Art. 78 OR
// läuft ausschliesslich VORWÄRTS (eine Rückverschiebung würde die Frist kürzen).
describe('allgemeineFrist — Ende nie vor Beginn, Verschiebung nur vorwärts', () => {
  it('start < fristbeginn ≤ rohes Ende ≤ Fristende', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneAllgemeineFrist(e);
      const start = parseISO(r.startISO);
      const ende = parseISO(r.endDatumISO);
      expect(typeof r.fristbeginnISO, 'Fristbeginn fehlt in der Vorwärtsfrist').toBe('string');
      const beginn = parseISO(r.fristbeginnISO!);
      expect(+beginn, `Fristbeginn ${r.fristbeginnISO} ist nicht der Folgetag von ${r.startISO}`).toBe(+addDays(start, 1));
      expect(+ende >= +beginn, `Fristende ${r.endDatumISO} liegt vor dem Fristbeginn ${r.fristbeginnISO}`).toBe(true);
      expect(Number.isNaN(+ende), `Fristende ${r.endDatumISO} ist kein gültiges Datum`).toBe(false);
    }));
  });

  it('verschoben ⟺ Endedatum ≠ rohes Ende, und die Verschiebung geht nie zurück', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneAllgemeineFrist(e);
      expect(r.verschoben, 'verschoben-Flag widerspricht dem Datum').toBe(r.endDatum !== r.rohEndDatum);
      // rohEndDatum ist dd.MM.yyyy → für den Ordnungsvergleich zurückrechnen.
      const [dd, mm, yyyy] = r.rohEndDatum.split('.');
      const roh = parseISO(`${yyyy}-${mm}-${dd}`);
      expect(+parseISO(r.endDatumISO) >= +roh, `Fristende ${r.endDatumISO} liegt VOR dem rohen Ende ${r.rohEndDatum} — Frist verkürzt`).toBe(true);
    }));
  });
});

// ─── AF-3 · Monotonie in der Fristlänge ──────────────────────────────────────
describe('allgemeineFrist — Monotonie: mehr Frist ⇒ nie früheres Ende', () => {
  it('laenge+1 endet nie vor laenge', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const kurz = parseISO(berechneAllgemeineFrist(e).endDatumISO);
      const lang = parseISO(berechneAllgemeineFrist({ ...e, laenge: e.laenge + 1 }).endDatumISO);
      expect(+lang >= +kurz, `${e.laenge + 1} ${e.einheit} (${lang.toISOString()}) enden vor ${e.laenge} ${e.einheit} (${kurz.toISOString()})`).toBe(true);
    }));
  });
});

// ─── AF-4 · Ein Fristende fällt nie auf einen gesperrten Tag ─────────────────
// Art. 78 Abs. 1 OR + Fristengesetz (SR 173.110.3): Ist die Verschiebung
// gewählt, darf das ausgewiesene Ende kein Samstag/Sonntag sein; mit
// Feiertags-Option zusätzlich kein anerkannter Feiertag des Kantons.
// (Die Engine implizite Kopplung «Feiertag ⇒ auch Wochenende» ist Teil der Regel.)
describe('allgemeineFrist — gewähltes Verschiebe-Regime hält das Ende offen', () => {
  it('mit Verschiebung endet die Frist nie an einem gesperrten Tag', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      if (!e.wochenendeVerschieben && !e.feiertageVerschieben) return;
      const r = berechneAllgemeineFrist(e);
      const ende = parseISO(r.endDatumISO);
      expect(isSaturday(ende) || isSunday(ende), `Fristende ${r.endDatumISO} fällt auf ein Wochenende`).toBe(false);
      if (e.feiertageVerschieben) {
        expect(istFeiertag(ende, e.kanton!), `Fristende ${r.endDatumISO} fällt auf einen Feiertag in ${e.kanton}`).toBe(false);
      }
    }));
  });
});

// ─── AF-5 · Rückwärtsfrist spiegelt: Handlungstag stets VOR dem Stichtag ─────
// Art. 77 OR sinngemäss (Beleg: Code-Doc + Art. 700 Abs. 1 OR): zwischen
// Handlung und Stichtag liegt die VOLLE Frist. Die Option «vorverlegen»
// verschiebt ausschliesslich nach HINTEN in der Zeit (nie später), weil ein
// Hinausschieben die Frist verkürzen würde.
describe('allgemeineFrist — Rückwärtsfrist: Handlungstag vor dem Stichtag, Vorverlegung nur rückwärts', () => {
  it('Ergebnis liegt strikt vor dem Stichtag; Vorverlegung nie in die Zukunft', () => {
    fc.assert(fc.property(isoDatumArb(), laengeArb, einheitArb, kantonArb, fc.boolean(),
      (stichtag, laenge, einheit, kanton, feiertage) => {
        const ohne = berechneRueckwaertsFrist({ stichtag, laenge, einheit, verschiebung: 'keine' });
        const mit = berechneRueckwaertsFrist({ stichtag, laenge, einheit, verschiebung: 'vorverlegen', feiertageBeruecksichtigen: feiertage, kanton });
        const st = parseISO(stichtag);
        expect(+parseISO(ohne.endDatumISO) < +st, `Handlungstag ${ohne.endDatumISO} liegt nicht vor dem Stichtag ${stichtag}`).toBe(true);
        expect(+parseISO(mit.endDatumISO) <= +parseISO(ohne.endDatumISO), `Vorverlegung schob ${mit.endDatumISO} NACH ${ohne.endDatumISO} — Frist verkürzt`).toBe(true);
        expect(mit.verschoben, 'verschoben-Flag widerspricht dem Datum').toBe(mit.endDatum !== mit.rohEndDatum);
      }));
  });

  it('Vorverlegung landet nie auf einem Wochenende', () => {
    fc.assert(fc.property(isoDatumArb(), laengeArb, einheitArb, (stichtag, laenge, einheit) => {
      const r = berechneRueckwaertsFrist({ stichtag, laenge, einheit, verschiebung: 'vorverlegen' });
      const d = parseISO(r.endDatumISO);
      expect(isSaturday(d) || isSunday(d), `vorverlegter Handlungstag ${r.endDatumISO} ist ein Wochenendtag`).toBe(false);
    }));
  });
});

// ─── AF-6 · tageZwischen: symmetrisch, nie negativ, Werktage ⊆ Kalendertage ──
describe('allgemeineFrist — tageZwischen (reines Zählwerkzeug)', () => {
  it('symmetrisch, ≥ 0, werktageMoFr ≤ kalendertage', () => {
    fc.assert(fc.property(isoDatumArb(), isoDatumArb(), (a, b) => {
      const ab = tageZwischen(a, b);
      const ba = tageZwischen(b, a);
      expect(ab.kalendertage, 'Kalendertage nicht symmetrisch').toBe(ba.kalendertage);
      expect(ab.werktageMoFr, 'Werktage nicht symmetrisch').toBe(ba.werktageMoFr);
      expect(ab.kalendertage >= 0 && ab.werktageMoFr >= 0, 'negative Tageszahl').toBe(true);
      expect(ab.werktageMoFr <= ab.kalendertage, `Werktage ${ab.werktageMoFr} > Kalendertage ${ab.kalendertage}`).toBe(true);
      expect(ab.kalendertage, 'Kalendertage weichen von differenceInCalendarDays ab')
        .toBe(Math.abs(differenceInCalendarDays(parseISO(b), parseISO(a))));
    }));
  });
});
