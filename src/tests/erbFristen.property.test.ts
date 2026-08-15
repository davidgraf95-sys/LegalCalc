// ─── Property-Tests: erbFristen (Art. 567/570/580/521/533/600/601 ZGB) ───────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addMonths, addYears, isSaturday, isSunday } from 'date-fns';
import { berechneErbFrist, ERB_FRISTEN, type ErbFristKey } from '../lib/erbFristen';
import { istFeiertag } from '../data/zpoFeiertage';
import { PROPERTY_SEED, isoDatumArb, kantonArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const keyArb = fc.constantFrom(...ERB_FRISTEN.map((p) => p.key as ErbFristKey));

// ─── EF-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('erbFristen — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis', () => {
    fc.assert(fc.property(keyArb, isoDatumArb(), fc.boolean(), kantonArb, (key, trigger, wv, kanton) => {
      const e = { key, trigger, werktagsVerschiebung: wv, kanton };
      expect(berechneErbFrist(e)).toEqual(berechneErbFrist(e));
    }));
  });
});

// ─── EF-2 · Ordnung: Fristende stets nach dem Trigger ───────────────────────
// Art.-77-OR-analog (Katalog-Annahme im Engine-Kommentar): der Trigger-Tag
// zählt nicht mit — das Ende liegt nie am oder vor dem Trigger.
describe('erbFristen — Fristende liegt stets nach dem Trigger-Ereignis', () => {
  it('endDatumISO > trigger für jeden Katalog-Tatbestand', () => {
    fc.assert(fc.property(keyArb, isoDatumArb(), fc.boolean(), kantonArb, (key, trigger, wv, kanton) => {
      const r = berechneErbFrist({ key, trigger, werktagsVerschiebung: wv, kanton });
      expect(+parseISO(r.resultat.endDatumISO) > +parseISO(trigger),
        `${key}: Ende ${r.resultat.endDatumISO} liegt nicht nach dem Trigger ${trigger}`).toBe(true);
      expect(r.status, `${key}: Status nicht ok`).toBe('ok');
    }));
  });
});

// ─── EF-3 · Der Katalog wird unverfälscht angewandt ─────────────────────────
// §5 Single Source of Truth: Dauer und Einheit stammen aus ERB_FRISTEN; das
// zurückgegebene Preset ist genau der angefragte Tatbestand, und das ROHE
// Fristende entspricht Trigger + Katalog-Dauer (Monatsende-Klemmung via
// date-fns, Art. 77 Abs. 1 Ziff. 3 OR analog). Ein Verrutschen im Katalog
// (falsche Zeile, falsche Dauer) fällt hier auf.
describe('erbFristen — Katalog-Dauer wird unverfälscht gerechnet (§5)', () => {
  it('preset entspricht dem key und das rohe Ende der Katalog-Dauer', () => {
    fc.assert(fc.property(keyArb, isoDatumArb(), (key, trigger) => {
      const r = berechneErbFrist({ key, trigger });
      expect(r.preset.key, 'zurückgegebenes Preset gehört zu einem anderen Tatbestand').toBe(key);
      const start = parseISO(trigger);
      const erwartet = r.preset.einheit === 'jahre'
        ? addYears(start, r.preset.laenge)
        : addMonths(start, r.preset.laenge);
      const [dd, mm, yyyy] = r.resultat.rohEndDatum.split('.');
      expect(`${yyyy}-${mm}-${dd}`,
        `${key}: rohes Ende ${r.resultat.rohEndDatum} ≠ Trigger + ${r.preset.laenge} ${r.preset.einheit}`)
        .toBe(`${erwartet.getFullYear()}-${String(erwartet.getMonth() + 1).padStart(2, '0')}-${String(erwartet.getDate()).padStart(2, '0')}`);
    }));
  });
});

// ─── EF-4 · Werktags-Option verschiebt nur vorwärts ─────────────────────────
// Art. 78 OR analog: eine Rückverschiebung würde die Frist verkürzen.
describe('erbFristen — Werktags-Verschiebung nur vorwärts', () => {
  it('mit Verschiebung nie früher als ohne, und nie an einem gesperrten Tag', () => {
    fc.assert(fc.property(keyArb, isoDatumArb(), kantonArb, (key, trigger, kanton) => {
      const ohne = berechneErbFrist({ key, trigger });
      const mit = berechneErbFrist({ key, trigger, werktagsVerschiebung: true, kanton });
      expect(+parseISO(mit.resultat.endDatumISO) >= +parseISO(ohne.resultat.endDatumISO),
        `${key}: Verschiebung ergab ein FRÜHERES Ende (${mit.resultat.endDatumISO} < ${ohne.resultat.endDatumISO})`).toBe(true);
      const d = parseISO(mit.resultat.endDatumISO);
      expect(isSaturday(d) || isSunday(d) || istFeiertag(d, kanton),
        `${key}: verschobenes Ende ${mit.resultat.endDatumISO} liegt auf einem gesperrten Tag (${kanton})`).toBe(false);
    }));
  });
});

// ─── EF-5 · Gruppen-Trennung Erbgang ≠ Klage (§4/§8) ────────────────────────
// Die Ausschlagungs-/Inventarfristen (Gruppe «erbgang») und die Klagefristen
// (Gruppe «klage») tragen fachlich getrennte Vorbehalte: nur der Erbgang
// verweist auf die kantonale Behörde (Art. 570/580 ZGB) und die Verlängerung
// nach Art. 576 ZGB, nur die Klage auf die zeitlich unbefristete EINREDE
// (Art. 521 Abs. 3 / 533 Abs. 3 ZGB). Ein Kollaps beider Gruppen — derselbe
// Hinweistext für beide — wäre eine falsche Rechtsauskunft.
describe('erbFristen — Erbgang und Klage bleiben getrennt (§4)', () => {
  it('jede Gruppe trägt ihre eigenen Vorbehalte und Normverweise', () => {
    fc.assert(fc.property(keyArb, isoDatumArb(), (key, trigger) => {
      const r = berechneErbFrist({ key, trigger });
      const text = r.warnungen.join(' ');
      const normen = r.normverweise.map((n) => n.artikel).join(' ');
      if (r.preset.gruppe === 'erbgang') {
        expect(normen.includes('Art. 570 ZGB') && normen.includes('Art. 576 ZGB'),
          `${key} (erbgang) ohne Behörden-/Verlängerungs-Norm: ${normen}`).toBe(true);
        expect(text.includes('EINREDEWEISE'), `${key} (erbgang) trägt den Klage-Vorbehalt`).toBe(false);
      } else {
        expect(text.includes('EINREDEWEISE'), `${key} (klage) ohne Einrede-Vorbehalt (Art. 521 III / 533 III ZGB)`).toBe(true);
        expect(normen.includes('Art. 576 ZGB'), `${key} (klage) trägt die Erbgangs-Verlängerungsnorm`).toBe(false);
      }
      expect(normen.includes(r.preset.norm), `${key}: eigene Katalog-Norm ${r.preset.norm} fehlt in ${normen}`).toBe(true);
    }));
  });
});
