// ─── Property-Tests: kuendigungsfrist (Art. 335a–c OR) — QS-CODE-PROP ────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addDays, addMonths, isLastDayOfMonth, differenceInCalendarDays } from 'date-fns';
import { berechneKuendigungsfrist } from '../lib/kuendigungsfrist';
import type { KuendigungsfristInput } from '../types/legal';
import { PROPERTY_SEED, isoDatumArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const parteiArb = fc.constantFrom<KuendigungsfristInput['kuendigendePartei']>('arbeitgeber', 'arbeitnehmer');

/** Gültige Domäne: Zugang liegt nie vor dem Vertragsbeginn. */
const eingabeArb: fc.Arbitrary<KuendigungsfristInput> = fc.record({
  vertragsbeginn: isoDatumArb(2015, 2030),
  versatzTage: fc.integer({ min: 0, max: 4000 }),
  kuendigendePartei: parteiArb,
  probezeitMonate: fc.integer({ min: 0, max: 3 }),
  kuendigungsterminMonatsende: fc.boolean(),
}).map(({ vertragsbeginn, versatzTage, ...rest }) => ({
  vertragsbeginn,
  zugangKuendigung: formatTag(addDays(parseISO(vertragsbeginn), versatzTage)),
  ...rest,
}));

function formatTag(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── KF-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('kuendigungsfrist — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneKuendigungsfrist(e)).toEqual(berechneKuendigungsfrist(e));
    }));
  });
});

// ─── KF-2 · Ordnung: Beendigung stets nach dem Zugang ───────────────────────
// Zugangsprinzip + Art. 335b/335c OR: Das Arbeitsverhältnis endet nie am oder
// vor dem Tag des Kündigungszugangs — weder in der Probezeit (7 Tage) noch bei
// ordentlicher Frist.
describe('kuendigungsfrist — Beendigung liegt stets nach dem Zugang', () => {
  it('beendigungsdatum > zugang, Ergebnis vollständig', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneKuendigungsfrist(e);
      expect(r.beendigungsdatum, 'kein Beendigungsdatum').toBeDefined();
      expect(+r.beendigungsdatum! > +parseISO(e.zugangKuendigung),
        `Beendigung ${formatTag(r.beendigungsdatum!)} liegt nicht nach dem Zugang ${e.zugangKuendigung}`).toBe(true);
      expect(Number.isNaN(+r.beendigungsdatum!), 'Beendigungsdatum ungültig').toBe(false);
    }));
  });
});

// ─── KF-3 · Probezeit ist ein eigenes Regime (Art. 335b OR) ─────────────────
// In der Probezeit gilt die 7-Tage-Frist ohne Monatsendtermin; ausserhalb die
// Monatsfrist. Beide Regimes dürfen nicht kollabieren (§4): das Probezeit-
// Ergebnis ist immer taggenau Zugang + 7 und trägt fristMonate = 0.
describe('kuendigungsfrist — Probezeit-Regime bleibt getrennt (Art. 335b OR)', () => {
  it('istProbezeit ⟺ fristMonate 0 ⟺ Beendigung = Zugang + 7 Tage', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneKuendigungsfrist(e);
      if (r.istProbezeit) {
        expect(r.fristMonate, 'Probezeit mit fristMonate ≠ 0').toBe(0);
        expect(+r.beendigungsdatum!, `Probezeit: ${formatTag(r.beendigungsdatum!)} ≠ Zugang + 7 Tage`)
          .toBe(+addDays(parseISO(e.zugangKuendigung), 7));
      } else {
        expect([1, 2, 3].includes(r.fristMonate),
          `ordentliche Frist ${r.fristMonate} liegt ausserhalb der gesetzlichen Staffel 1/2/3 (Art. 335c Abs. 1 OR)`).toBe(true);
      }
      // Ohne vereinbarte Probezeit gibt es sie nicht (Art. 335b Abs. 1 OR).
      if (e.probezeitMonate === 0) expect(r.istProbezeit, 'Probezeit ohne vereinbarte Probezeit').toBe(false);
    }));
  });
});

// ─── KF-4 · Dienstjahr-Staffel steigt, sinkt nie (Art. 335c Abs. 1 OR) ──────
// 1. Dienstjahr 1 Monat · 2.–9. Dienstjahr 2 Monate · ab dem 10. 3 Monate.
// Bei gleichem Zugang und FRÜHEREM Vertragsbeginn ist das Dienstjahr höher,
// die Frist also nie kürzer — und die Beendigung nie früher. Ohne Probezeit
// geprüft, weil das Probezeit-Regime (7 Tage) eine eigene, kürzere Frist ist.
describe('kuendigungsfrist — längere Betriebszugehörigkeit ⇒ nie kürzere Frist', () => {
  it('früherer Vertragsbeginn ⇒ fristMonate nie kleiner, Beendigung nie früher', () => {
    fc.assert(fc.property(isoDatumArb(2016, 2030), fc.integer({ min: 0, max: 4000 }), fc.integer({ min: 1, max: 4000 }),
      parteiArb, fc.boolean(), (beginn, versatz, frueher, partei, monatsende) => {
        const zugang = formatTag(addDays(parseISO(beginn), versatz));
        const basis = {
          zugangKuendigung: zugang, kuendigendePartei: partei,
          probezeitMonate: 0, kuendigungsterminMonatsende: monatsende,
        };
        const spaet = berechneKuendigungsfrist({ ...basis, vertragsbeginn: beginn });
        const frueh = berechneKuendigungsfrist({ ...basis, vertragsbeginn: formatTag(addDays(parseISO(beginn), -frueher)) });
        expect(frueh.fristMonate >= spaet.fristMonate,
          `früherer Beginn ergab kürzere Frist: ${frueh.fristMonate} < ${spaet.fristMonate}`).toBe(true);
        expect(+frueh.beendigungsdatum! >= +spaet.beendigungsdatum!,
          `früherer Beginn ergab frühere Beendigung: ${formatTag(frueh.beendigungsdatum!)} < ${formatTag(spaet.beendigungsdatum!)}`).toBe(true);
      }));
  });
});

// ─── KF-5 · Kündigungstermin Monatsende (Art. 335c Abs. 1 OR) ───────────────
// Ist der Monatsendtermin vereinbart, endet das Verhältnis auf dem letzten Tag
// des Monats — und der Monatsend-Termin liegt nie VOR dem taggenauen Fristlauf.
describe('kuendigungsfrist — Monatsendtermin endet auf dem Monatsletzten', () => {
  it('ordentlicher Endtermin ist Monatsletzter und ≥ Fristlauf', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneKuendigungsfrist({ ...e, kuendigungsterminMonatsende: true });
      if (r.istProbezeit) return; // Probezeit kennt keinen Endtermin (Art. 335b OR)
      expect(isLastDayOfMonth(r.ordentlichesEndeDatum!),
        `Endtermin ${formatTag(r.ordentlichesEndeDatum!)} ist nicht der Monatsletzte`).toBe(true);
      expect(+r.ordentlichesEndeDatum! >= +r.fristLaufendeDatum!,
        `Monatsende-Erstreckung ging zurück: ${formatTag(r.ordentlichesEndeDatum!)} < ${formatTag(r.fristLaufendeDatum!)}`).toBe(true);
      expect(+r.fristLaufendeDatum!, 'Fristlauf ≠ Zugang + fristMonate')
        .toBe(+addMonths(parseISO(e.zugangKuendigung), r.fristMonate));
    }));
  });
});

// ─── KF-6 · Art. 335c Abs. 3 OR: Verlängerung läuft taggenau, nur vorwärts ──
// SHK-Abgleich-Fix 10.6.2026: Die nicht bezogenen Tage des Urlaubs des andern
// Elternteils (Art. 329g OR) verlängern die Frist TAGGENAU über den
// ordentlichen Endtermin hinaus — nur bei ARBEITGEBER-Kündigung, nie kürzend.
describe('kuendigungsfrist — Urlaubs-Resttage verlängern taggenau (Art. 335c Abs. 3 OR)', () => {
  it('Arbeitgeber: Beendigung = ordentlicher Endtermin + Resttage; Arbeitnehmer: keine Wirkung', () => {
    fc.assert(fc.property(eingabeArb, fc.integer({ min: 1, max: 40 }), (e, resttage) => {
      const ohne = berechneKuendigungsfrist(e);
      if (ohne.istProbezeit) return;
      const mit = berechneKuendigungsfrist({ ...e, vaterschaftsurlaubResttage: resttage });
      expect(+mit.beendigungsdatum! >= +ohne.beendigungsdatum!,
        `Resttage verkürzten die Frist: ${formatTag(mit.beendigungsdatum!)} < ${formatTag(ohne.beendigungsdatum!)}`).toBe(true);
      const delta = differenceInCalendarDays(mit.beendigungsdatum!, ohne.beendigungsdatum!);
      expect(delta, e.kuendigendePartei === 'arbeitgeber'
        ? `Arbeitgeber: Verlängerung ${delta} ≠ ${resttage} Resttage (nicht taggenau)`
        : `Arbeitnehmer: Art. 335c Abs. 3 OR wirkte trotz Arbeitnehmerkündigung (+${delta} Tage)`)
        .toBe(e.kuendigendePartei === 'arbeitgeber' ? resttage : 0);
      expect(+mit.ordentlichesEndeDatum!, 'ordentlicher Endtermin durch die Resttage verschoben')
        .toBe(+ohne.ordentlichesEndeDatum!);
    }));
  });
});
