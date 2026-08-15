// ─── Property-Tests: schkgFristen (Art. 31/56/63 SchKG) — QS-CODE-PROP ───────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
//
// WICHTIGE ABGRENZUNG (Fund 15.8.2026, §7-Verifikation am gepinnten Cache
// /tmp/schkg.html): Im Regime `schkg_betreibungsferien` ist das Fristende
// NICHT monoton in der Fristlänge — und das ist NORM-GETREU, kein Defekt.
// Art. 63 Satz 2 SchKG verlängert «bis zum dritten Tag nach deren Ende», also
// nach dem Ende der GESCHLOSSENEN ZEIT, nicht nach dem ursprünglichen Ablauf.
// Belegte Sprungstelle (Ereignis 25.12.2015, Tagesfrist, AG):
//   7 Tage → Ablauf 1.1.2016 (in den Ferien) → 3. Werktag danach = 6.1.2016
//   8 Tage → Ablauf 2.1.2016 (ausserhalb)    → nächster Werktag    = 4.1.2016
// Eine LÄNGERE Frist endet also FRÜHER. Die Monotonie- und Hemmungs-
// Invarianten unten sind darum auf die Regimes eingegrenzt, in denen sie
// belegbar gelten; die Sprungstelle selbst hält der Pin-Test am Ende fest.
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addDays } from 'date-fns';
import { berechneSchkgFrist } from '../lib/schkgFristen';
import { formatISO } from '../lib/datumsUtils';
import type { SchkgInput, SchkgModus, SchkgFristnatur, SchkgEinheit } from '../types/schkg';
import { istArbeitsfreierTag } from '../data/zpoFeiertage';
import { PROPERTY_SEED, isoDatumArb, kantonArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 400 });

const modusArb = fc.constantFrom<SchkgModus>('schkg_betreibungsferien', 'zpo_stillstand', 'kein');
const naturArb = fc.constantFrom<SchkgFristnatur>('verwirkung', 'wartefrist', 'beschwerdefrist', 'klagefrist', 'ordnungsfrist', 'frist');
const einheitArb = fc.constantFrom<SchkgEinheit>('tage', 'monate', 'jahre');

const eingabeArb: fc.Arbitrary<SchkgInput> = fc.record({
  ereignis: isoDatumArb(),
  einheit: einheitArb,
  laenge: fc.integer({ min: 1, max: 40 }),
  modus: modusArb,
  fristnatur: naturArb,
  kanton: kantonArb,
});

// ─── SF-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('schkgFristen — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneSchkgFrist(e)).toEqual(berechneSchkgFrist(e));
    }));
  });
});

// ─── SF-2 · Ordnung: Ereignis ≤ dies a quo ≤ dies ad quem ───────────────────
// Art. 31 SchKG i.V.m. Art. 142 ZPO: Bei der TAGESfrist beginnt der Lauf am
// Folgetag (Abs. 1, Zustelltag zählt nicht); bei der Monats-/Jahresfrist ist
// der Ereignistag selbst der dies a quo (Abs. 2, gleichbezeichneter Tag).
describe('schkgFristen — Fristende nie vor Fristbeginn', () => {
  it('ereignis ≤ diesAQuo ≤ diesAdQuem (bei Tagesfristen echt später)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneSchkgFrist(e);
      const ev = parseISO(r.ereignisISO), aq = parseISO(r.diesAQuoISO), adq = parseISO(r.diesAdQuemISO);
      expect(+ev, 'Ereignis-ISO weicht von der Eingabe ab').toBe(+parseISO(e.ereignis));
      expect(+aq >= +ev, `dies a quo ${r.diesAQuoISO} liegt VOR dem Ereignis ${r.ereignisISO}`).toBe(true);
      if (e.einheit === 'tage') {
        expect(+aq > +ev, `Tagesfrist: dies a quo ${r.diesAQuoISO} ist nicht der Folgetag (Art. 142 Abs. 1 ZPO)`).toBe(true);
      }
      expect(+adq >= +aq, `dies ad quem ${r.diesAdQuemISO} liegt vor dem dies a quo ${r.diesAQuoISO}`).toBe(true);
      expect(Number.isNaN(+adq), `dies ad quem ${r.diesAdQuemISO} ist kein gültiges Datum`).toBe(false);
    }));
  });
});

// ─── SF-3 · Wartefrist ist eine «frühestens»-Frist ───────────────────────────
// Art. 88 Abs. 1 SchKG («frühestens 20 Tage NACH der Zustellung»), Bug-Check
// 10.6.2026: Das ausgewiesene Datum ist der FRÜHESTE Handlungstag und liegt
// daher echt NACH dem rechnerischen Fristablauf — und nie auf einem
// arbeitsfreien Tag (Art. 142 Abs. 3 ZPO auf den Folgetag angewandt).
describe('schkgFristen — Wartefrist weist den frühesten Handlungstag aus', () => {
  it('das Wartefrist-Datum ist stets ein Werktag im Kanton', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneSchkgFrist({ ...e, fristnatur: 'wartefrist' });
      expect(istArbeitsfreierTag(parseISO(r.diesAdQuemISO), e.kanton),
        `frühester Handlungstag ${r.diesAdQuemISO} ist arbeitsfrei (${e.kanton})`).toBe(false);
    }));
  });

  it('ohne Stillstand liegt der früheste Handlungstag ECHT nach dem Fristablauf', () => {
    fc.assert(fc.property(isoDatumArb(), fc.integer({ min: 1, max: 40 }), kantonArb, (ereignis, laenge, kanton) => {
      const r = berechneSchkgFrist({ ereignis, einheit: 'tage', laenge, modus: 'kein', fristnatur: 'wartefrist', kanton });
      const ablauf = addDays(parseISO(ereignis), laenge); // Art. 142 Abs. 1 ZPO: Beginn Folgetag
      expect(+parseISO(r.diesAdQuemISO) > +ablauf,
        `frühester Handlungstag ${r.diesAdQuemISO} liegt nicht NACH dem Fristablauf ${formatISO(ablauf)} (Art. 88 Abs. 1 SchKG)`).toBe(true);
    }));
  });
});

// ─── SF-4 · Handlungsfristen enden auf einem Werktag ─────────────────────────
// Art. 31 SchKG i.V.m. Art. 142 Abs. 3 ZPO bzw. Art. 63 SchKG.
describe('schkgFristen — Handlungsfrist endet nie an einem arbeitsfreien Tag', () => {
  it('jedes Nicht-Wartefrist-Ende ist ein Werktag im Kanton', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      if (e.fristnatur === 'wartefrist') return;
      const r = berechneSchkgFrist(e);
      expect(istArbeitsfreierTag(parseISO(r.diesAdQuemISO), e.kanton),
        `Fristende ${r.diesAdQuemISO} (${e.modus}) ist arbeitsfrei in ${e.kanton}`).toBe(false);
    }));
  });
});

// ─── SF-5 · Regime-Trennung (§4): Stillstand verlängert, verkürzt nie ────────
// Ruhen (Art. 145 ZPO) und Art.-63-Verlängerung schieben ein Fristende nur
// NACH HINTEN; ein Regime, das gegenüber «kein Stillstand» früher endet, hätte
// die Frist verkürzt. Zusätzlich: das gewählte Regime bleibt im Ergebnis
// erkennbar (modusAktiv) — die Regimes kollabieren nicht.
describe('schkgFristen — Stillstand-Regimes verlängern nur (§4, kein Kollaps)', () => {
  it('Betreibungsferien- und ZPO-Regime enden nie vor dem Regime «kein»', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      if (e.fristnatur === 'wartefrist') return;
      const ohne = berechneSchkgFrist({ ...e, modus: 'kein' });
      for (const modus of ['schkg_betreibungsferien', 'zpo_stillstand'] as const) {
        const mit = berechneSchkgFrist({ ...e, modus });
        expect(+parseISO(mit.diesAdQuemISO) >= +parseISO(ohne.diesAdQuemISO),
          `${modus}: ${mit.diesAdQuemISO} endet VOR «kein» (${ohne.diesAdQuemISO}) — Frist verkürzt`).toBe(true);
        expect(mit.modusAktiv, 'modusAktiv weicht vom gewählten Regime ab').toBe(modus);
      }
    }));
  });
});

// ─── SF-6 · Monotonie in der Fristlänge (ohne Art.-63-Regime) ────────────────
// Eingegrenzt auf `kein` und `zpo_stillstand`: dort ist die Endverschiebung
// eine Untergrenzen-Operation («nächster offener Tag») und damit monoton. Für
// `schkg_betreibungsferien` gilt die Aussage NICHT — siehe Kopfkommentar und
// den Pin-Test unten (norm-getreue Nicht-Monotonie des Art. 63 SchKG).
describe('schkgFristen — Monotonie: mehr Frist ⇒ nie früheres Ende (kein/ZPO)', () => {
  it('laenge+1 endet nie vor laenge', () => {
    fc.assert(fc.property(eingabeArb, fc.constantFrom<SchkgModus>('kein', 'zpo_stillstand'), (e, modus) => {
      const kurz = berechneSchkgFrist({ ...e, modus }).diesAdQuemISO;
      const lang = berechneSchkgFrist({ ...e, modus, laenge: e.laenge + 1 }).diesAdQuemISO;
      expect(+parseISO(lang) >= +parseISO(kurz),
        `${modus}: ${e.laenge + 1} ${e.einheit} (${lang}) enden vor ${e.laenge} (${kurz})`).toBe(true);
    }));
  });
});

// ─── SF-7 · Hemmung der Verwirkungsfrist verlängert nur (ohne Art.-63-Regime) ─
// Art. 88 Abs. 2 / Art. 166 Abs. 2 SchKG: echtes Ruhen im Fenster — das Ende
// kann dadurch nur später liegen. Im Art.-63-Regime greift dieselbe Norm-
// Eigenheit wie bei SF-6 (die Hemmung kann den Ablauf aus den Betreibungs-
// ferien hinausschieben und damit die 3-Werktage-Verlängerung entfallen
// lassen); dort ist die Aussage darum nicht behauptet, sondern David
// vorzulegen (Katalog «fachlich vorzulegen»).
describe('schkgFristen — Hemmung (Art. 88 II SchKG) verlängert nur (kein/ZPO)', () => {
  it('mit Hemmungsfenster endet die Frist nie vor der ungehemmten Frist', () => {
    fc.assert(fc.property(eingabeArb, fc.constantFrom<SchkgModus>('kein', 'zpo_stillstand'),
      fc.integer({ min: 0, max: 60 }), fc.integer({ min: 0, max: 200 }),
      (e, modus, versatz, dauer) => {
        const basis = { ...e, modus, fristnatur: 'verwirkung' as const };
        const ohne = berechneSchkgFrist(basis);
        const von = addDays(parseISO(e.ereignis), versatz);
        const mit = berechneSchkgFrist({ ...basis, hemmungVon: formatISO(von), hemmungBis: formatISO(addDays(von, dauer)) });
        expect(+parseISO(mit.diesAdQuemISO) >= +parseISO(ohne.diesAdQuemISO),
          `${modus}: Hemmung verkürzte die Frist: ${mit.diesAdQuemISO} < ${ohne.diesAdQuemISO}`).toBe(true);
      }));
  });
});

// ─── SF-8 · Pin: die norm-getreue Sprungstelle des Art. 63 SchKG ─────────────
// KEINE Behauptung, dass dieses Verhalten erwünscht ist — ein PIN, damit die
// Stelle sichtbar bleibt und eine spätere fachliche Korrektur (Entscheid
// David) hier auffällt statt still zu passieren. Wortlaut verifiziert am
// gepinnten Cache: «… so wird die Frist bis zum dritten Tag nach deren Ende
// verlängert» — «deren» = Betreibungsferien/Rechtsstillstand.
describe('schkgFristen — Art. 63 SchKG: Verlängerung ankert am Ferienende (Pin)', () => {
  it('7 Tage enden am 6.1.2016, 8 Tage bereits am 4.1.2016', () => {
    const basis = {
      ereignis: '2015-12-25', einheit: 'tage' as const,
      modus: 'schkg_betreibungsferien' as const, fristnatur: 'verwirkung' as const, kanton: 'AG' as const,
    };
    expect(berechneSchkgFrist({ ...basis, laenge: 7 }).diesAdQuemISO).toBe('2016-01-06');
    expect(berechneSchkgFrist({ ...basis, laenge: 8 }).diesAdQuemISO).toBe('2016-01-04');
  });
});
