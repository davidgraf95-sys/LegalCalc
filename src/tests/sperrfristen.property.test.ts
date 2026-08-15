// ─── Property-Tests: sperrfristen (Art. 336c OR) — QS-CODE-PROP ──────────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addDays } from 'date-fns';
import { berechneSperrfristen } from '../lib/sperrfristen';
import { berechneKuendigungsfrist } from '../lib/kuendigungsfrist';
import { formatISO } from '../lib/datumsUtils';
import type { SperrfristenInput, Sperrereignis, SperrereignisTyp } from '../types/legal';
import { PROPERTY_SEED, isoDatumArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 500 });

const typArb = fc.constantFrom<SperrereignisTyp>(
  'krankheit_unfall', 'schwangerschaft', 'militaer_zivil', 'hilfsaktion', 'betreuungsurlaub',
  'mutterschaftsurlaub_verlaengert', 'zusatzurlaub_tod_elternteil', 'urlaub_tod_mutter');

/** Gültige Domäne: Ereignis-Ende nie vor dem Beginn, Zugang nach Vertragsbeginn. */
const eingabeArb: fc.Arbitrary<SperrfristenInput> = fc.record({
  vertragsbeginn: isoDatumArb(2018, 2028),
  versatzTage: fc.integer({ min: 0, max: 3000 }),
  kuendigendePartei: fc.constantFrom<SperrfristenInput['kuendigendePartei']>('arbeitgeber', 'arbeitnehmer'),
  probezeitMonate: fc.integer({ min: 0, max: 3 }),
  kuendigungsterminMonatsende: fc.boolean(),
  ereignisse: fc.array(fc.record({
    typ: typArb,
    versatz: fc.integer({ min: -400, max: 400 }),
    dauer: fc.integer({ min: 0, max: 300 }),
  }), { maxLength: 3 }),
}).map(({ versatzTage, ereignisse, ...rest }) => {
  const zugang = addDays(parseISO(rest.vertragsbeginn), versatzTage);
  const sperrereignisse: Sperrereignis[] = ereignisse.map(({ typ, versatz, dauer }) => {
    const von = addDays(zugang, versatz);
    return { typ, von: formatISO(von), bis: formatISO(addDays(von, dauer)) };
  });
  return { ...rest, zugangKuendigung: formatISO(zugang), sperrereignisse };
});

// ─── SP-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('sperrfristen — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. Rechenweg)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneSperrfristen(e)).toEqual(berechneSperrfristen(e));
    }));
  });
});

// ─── SP-2 · Ordnung und Wohlgeformtheit der Ausgabe ────────────────────────
// Ein Arbeitsverhältnis endet nie am oder vor dem Zugang der Kündigung; jedes
// ausgewiesene Sperrintervall hat von ≤ bis; Zähler sind nie negativ.
describe('sperrfristen — Beendigung nach dem Zugang, Intervalle wohlgeformt', () => {
  it('beendigungISO > zugangISO, von ≤ bis, Zähler ≥ 0', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneSperrfristen(e);
      if (r.beendigungISO) {
        expect(+parseISO(r.beendigungISO) > +parseISO(e.zugangKuendigung),
          `Beendigung ${r.beendigungISO} liegt nicht nach dem Zugang ${e.zugangKuendigung}`).toBe(true);
      }
      for (const iv of r.sperrIntervalle ?? []) {
        expect(+parseISO(iv.von) <= +parseISO(iv.bis), `Sperrintervall invertiert: ${iv.von} > ${iv.bis} (${iv.typ})`).toBe(true);
      }
      for (const s of r.sperrtage ?? []) {
        expect(s.beansprucht >= 0, `negative Sperrtage (${s.typ}): ${s.beansprucht}`).toBe(true);
        if (s.kontingent != null) {
          expect(s.kontingent > 0, `nicht positives Kontingent (${s.typ}): ${s.kontingent}`).toBe(true);
          expect((s.verbleibend ?? 0) >= 0, `negatives Restkontingent (${s.typ}): ${s.verbleibend}`).toBe(true);
        }
      }
      expect((r.gehemmtTage ?? 0) >= 0, `negative Hemmungstage: ${r.gehemmtTage}`).toBe(true);
    }));
  });
});

// ─── SP-3 · Art. 336c OR schützt nur gegen ARBEITGEBER-Kündigungen ─────────
// Regime-Trennung (§4): Bei Arbeitnehmerkündigung entfaltet Art. 336c OR keine
// Wirkung — das Ergebnis muss identisch zur reinen Kündigungsfrist-Engine sein,
// unabhängig davon, wie viele Sperrereignisse eingegeben wurden.
describe('sperrfristen — Arbeitnehmerkündigung bleibt ungehemmt (Art. 336c OR)', () => {
  it('Beendigung identisch zur Kündigungsfrist-Engine, keine Nichtigkeit', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const an = { ...e, kuendigendePartei: 'arbeitnehmer' as const };
      const r = berechneSperrfristen(an);
      const kb = berechneKuendigungsfrist(an);
      expect(r.beendigungISO, 'Arbeitnehmerkündigung wurde durch eine Sperrfrist verändert')
        .toBe(formatISO(kb.beendigungsdatum!));
      expect(r.fruehesteNeueKuendigungISO, 'Arbeitnehmerkündigung als nichtig behandelt').toBeUndefined();
    }));
  });

  it('Probezeit kennt keine Sperrfristen (Art. 335b OR)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const kb = berechneKuendigungsfrist(e);
      if (!kb.istProbezeit) return;
      const r = berechneSperrfristen(e);
      expect(r.beendigungISO, 'Probezeit-Kündigung durch Sperrfrist verändert').toBe(formatISO(kb.beendigungsdatum!));
      expect(r.fruehesteNeueKuendigungISO, 'Probezeit-Kündigung als nichtig behandelt').toBeUndefined();
    }));
  });
});

// ─── SP-4 · Hemmung verlängert, verkürzt nie (Art. 336c Abs. 2/3 OR) ───────
// Der zeitliche Kündigungsschutz kann die Beendigung nur NACH HINTEN schieben
// (Unterbruch + Erstreckung auf den nächsten Endtermin). Endet das Verhältnis
// mit Sperrereignissen FRÜHER als ohne, wäre der Schutz zur Falle geworden.
describe('sperrfristen — Sperrereignisse verlängern nur (Art. 336c Abs. 2/3 OR)', () => {
  it('mit Sperrereignissen endet das Verhältnis nie vor der ungehemmten Beendigung', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const ohne = berechneSperrfristen({ ...e, sperrereignisse: [] });
      const mit = berechneSperrfristen(e);
      if (!ohne.beendigungISO || !mit.beendigungISO) return; // Nichtigkeit → kein Vergleich
      expect(+parseISO(mit.beendigungISO) >= +parseISO(ohne.beendigungISO),
        `Sperrereignisse verkürzten das Verhältnis: ${mit.beendigungISO} < ${ohne.beendigungISO}`).toBe(true);
    }));
  });
});

// ─── SP-5 · Nichtigkeit ist vollständig ausgewiesen (§8) ───────────────────
// Fällt der Zugang in eine Sperrfrist, ist die Kündigung nichtig (Art. 336c
// Abs. 2 Satz 1 OR). Dann darf KEIN Beendigungsdatum suggeriert werden — statt
// dessen steht das Sperrfristende und der früheste neue Kündigungstag, und der
// liegt nie vor dem Sperrfristende.
describe('sperrfristen — bei Nichtigkeit kein Beendigungsdatum, dafür der Neustart', () => {
  it('fruehesteNeueKuendigungISO ≥ sperrfristEndeISO, Beendigung entfällt', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneSperrfristen(e);
      if (!r.fruehesteNeueKuendigungISO) return;
      expect(r.beendigungISO, 'nichtige Kündigung mit Beendigungsdatum ausgewiesen').toBeUndefined();
      expect(r.sperrfristEndeISO, 'Nichtigkeit ohne ausgewiesenes Sperrfristende').toBeDefined();
      expect(+parseISO(r.fruehesteNeueKuendigungISO) >= +parseISO(r.sperrfristEndeISO!),
        `neue Kündigung ab ${r.fruehesteNeueKuendigungISO} liegt vor dem Sperrfristende ${r.sperrfristEndeISO}`).toBe(true);
      expect(+parseISO(r.fruehesteNeueKuendigungISO) > +parseISO(e.zugangKuendigung),
        'nichtige Kündigung darf nicht am selben Tag wiederholt werden').toBe(true);
      expect(e.kuendigendePartei, 'Nichtigkeit bei Arbeitnehmerkündigung').toBe('arbeitgeber');
    }));
  });
});
