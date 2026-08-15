// ─── Property-Tests: bgerRechtsweg (BGG) — QS-CODE-PROP ──────────────────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { parseISO, addDays } from 'date-fns';
import {
  berechneBgerRechtsweg, bgerAbteilungZivil, bgerKapitalwert20x, BGER_SCHWELLEN,
  type BgerInput, type BgerWeg, type BgerZivilgebiet, type BgerObjekt, type BgerVerwaltungSonderfall,
} from '../lib/bgerRechtsweg';
import { istArbeitsfreierTag } from '../data/zpoFeiertage';
import { PROPERTY_SEED, isoDatumArb, kantonArb, chfArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const wegArb = fc.constantFrom<BgerWeg>('zivil', 'schkg_aufsicht', 'straf', 'verwaltung');
const gebietArb = fc.constantFrom<BgerZivilgebiet>(
  'schuldrecht', 'arbeit', 'miete', 'versicherungsvertrag', 'haftpflicht',
  'uwg', 'immaterialgueter', 'rechtsoeffnung', 'personenrecht', 'familienrecht', 'erbrecht',
  'sachenrecht', 'baeuerliches_bodenrecht', 'schkg_uebrig');
const objektArb = fc.constantFrom<BgerObjekt>('endentscheid', 'teilentscheid', 'zwischen_zustaendigkeit_ausstand', 'zwischen_anderer');
const sonderfallArb = fc.constantFrom<BgerVerwaltungSonderfall>(
  'keiner', 'rechtshilfe_amtshilfe', 'abstimmung', 'nationalratswahl', 'stimmrechtssache', 'beschaffung');

const eingabeArb: fc.Arbitrary<BgerInput> = fc.record({
  weg: wegArb,
  objekt: objektArb,
  zivilGebiet: gebietArb,
  vermoegensrechtlich: fc.boolean(),
  streitwertCHF: fc.option(chfArb(1_000_000), { nil: null }),
  vorsorglicheMassnahme: fc.boolean(),
  rechtsverweigerung: fc.boolean(),
  schiedsgericht: fc.boolean(),
  einzigeKantonaleInstanz: fc.boolean(),
  konkursNachlassrichter: fc.boolean(),
  hkueKindesrueckgabe: fc.boolean(),
  wechselbetreibung: fc.boolean(),
  verwaltungSonderfall: sonderfallArb,
  eroeffnung: isoDatumArb(),
  kanton: kantonArb,
});

// ─── BG-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('bgerRechtsweg — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. Rechenweg)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneBgerRechtsweg(e)).toEqual(berechneBgerRechtsweg(e));
    }));
  });
});

// ─── BG-2 · Fristen stammen aus dem geschlossenen Katalog des Art. 100 BGG ──
// 30 Tage (Abs. 1) · 10 Tage (Abs. 2) · 5 Tage (Abs. 3) · 3 Tage (Abs. 4) ·
// null = jederzeit (Abs. 7). Ein anderer Wert wäre eine erfundene Frist.
describe('bgerRechtsweg — Beschwerdefrist stammt aus Art. 100 BGG', () => {
  it('fristTage ∈ {null, 3, 5, 10, 30} und Norm-Anker gesetzt', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneBgerRechtsweg(e);
      expect([null, 3, 5, 10, 30].includes(r.fristTage as never),
        `unbekannte Frist ${r.fristTage} (${e.weg}/${e.verwaltungSonderfall})`).toBe(true);
      expect(r.fristNorm.length > 0, 'Frist ohne Norm-Anker').toBe(true);
      // Rechtsverweigerung: jederzeit (Abs. 7) — dann auch kein Fristende.
      if (e.rechtsverweigerung) {
        expect(r.fristTage, 'Rechtsverweigerung mit laufender Frist (Art. 100 Abs. 7 BGG)').toBeNull();
        expect(r.fristende, 'Rechtsverweigerung mit konkretem Fristende').toBeNull();
        expect(r.stillstand, 'Stillstandsfrage ohne laufende Frist beantwortet').toBe(false);
      }
    }));
  });
});

// ─── BG-3 · Konkretes Fristende: nach der Eröffnung, auf einem Werktag ──────
// Art. 44 Abs. 1 BGG (Beginn am Folgetag) + Art. 45 BGG (Werktagsverschiebung).
describe('bgerRechtsweg — Fristende liegt nach der Eröffnung und auf einem Werktag', () => {
  it('endeISO > eroeffnung und endeISO ≥ eroeffnung + fristTage', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneBgerRechtsweg(e);
      if (!r.fristende || r.fristTage === null) return;
      const ende = parseISO(r.fristende.endeISO);
      expect(+ende > +parseISO(e.eroeffnung!), `Fristende ${r.fristende.endeISO} nicht nach der Eröffnung ${e.eroeffnung}`).toBe(true);
      expect(+ende >= +addDays(parseISO(e.eroeffnung!), r.fristTage),
        `Fristende ${r.fristende.endeISO} liegt vor dem naiven Ablauf`).toBe(true);
      expect(istArbeitsfreierTag(ende, e.kanton!), `Fristende ${r.fristende.endeISO} ist arbeitsfrei in ${e.kanton}`).toBe(false);
    }));
  });
});

// ─── BG-4 · Hard-Stop Art. 73 BGG schlägt jeden Streitwert ─────────────────
// Entscheide im Markenwiderspruchsverfahren sind von der Beschwerde in
// Zivilsachen ausgenommen — unabhängig von Streitwert und Ausnahmegründen.
describe('bgerRechtsweg — Markenwiderspruch bleibt unzulässig (Art. 73 BGG)', () => {
  it('unzulaessig, ohne Frist und ohne Abteilung — bei jedem Streitwert', () => {
    fc.assert(fc.property(chfArb(10_000_000), gebietArb, fc.boolean(), fc.boolean(),
      (streitwertCHF, zivilGebiet, einzigeKantonaleInstanz, konkursNachlassrichter) => {
        const r = berechneBgerRechtsweg({
          weg: 'zivil', zivilGebiet, streitwertCHF, markenwiderspruch: true,
          einzigeKantonaleInstanz, konkursNachlassrichter,
        });
        expect(r.zulaessigkeit, `Markenwiderspruch bei CHF ${streitwertCHF} als «${r.zulaessigkeit}» ausgewiesen`).toBe('unzulaessig');
        expect(r.status, 'Status widerspricht dem Hard-Stop').toBe('unzulaessig');
        expect(r.abteilung, 'Abteilung trotz Unzulässigkeit zugeteilt').toBeNull();
        expect(r.fristende, 'Fristende trotz Unzulässigkeit berechnet').toBeNull();
      }));
  });
});

// ─── BG-5 · Streitwert-Schwelle Art. 74 Abs. 1 BGG, gebietsabhängig ────────
// lit. a arbeits-/mietrechtlich CHF 15 000, lit. b übrige CHF 30 000. Ohne
// bezifferten Streitwert bleibt die Aussage OFFEN (§8: nie «zulässig» raten).
describe('bgerRechtsweg — Zivil: Schwellen-Verdikt folgt Art. 74 Abs. 1 BGG', () => {
  it('Verdikt entspricht der gebietsabhängigen Schwelle; ohne Streitwert «offen»', () => {
    fc.assert(fc.property(gebietArb, fc.option(chfArb(200_000), { nil: null }), objektArb,
      (zivilGebiet, streitwertCHF, objekt) => {
        const r = berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet, streitwertCHF, objekt, vermoegensrechtlich: true });
        const schwelle = (zivilGebiet === 'arbeit' || zivilGebiet === 'miete')
          ? BGER_SCHWELLEN.MIETE_ARBEIT : BGER_SCHWELLEN.UEBRIGE;
        if (streitwertCHF === null) {
          expect(r.zulaessigkeit, 'ohne Streitwert wurde ein Verdikt gefällt (§8)').toBe('offen');
        } else {
          expect(r.zulaessigkeit, `CHF ${streitwertCHF} gegen Schwelle ${schwelle} (${zivilGebiet}) falsch beurteilt`)
            .toBe(streitwertCHF >= schwelle ? 'zulaessig' : 'schwelle_verfehlt');
        }
      }));
  });

  it('Schiedsbeschwerde ist streitwertunabhängig (Art. 77 BGG) — nie «schwelle_verfehlt»', () => {
    fc.assert(fc.property(gebietArb, chfArb(200_000), (zivilGebiet, streitwertCHF) => {
      const r = berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet, streitwertCHF, schiedsgericht: true, vermoegensrechtlich: true });
      expect(r.zulaessigkeit, `Schiedsentscheid an der Streitwertgrenze gescheitert (CHF ${streitwertCHF})`).not.toBe('schwelle_verfehlt');
    }));
  });

  it('SchKG-Aufsicht ist streitwertunabhängig (Art. 74 Abs. 2 lit. c BGG)', () => {
    fc.assert(fc.property(chfArb(200_000), fc.boolean(), (streitwertCHF, wechselbetreibung) => {
      const r = berechneBgerRechtsweg({ weg: 'schkg_aufsicht', streitwertCHF, wechselbetreibung });
      expect(r.zulaessigkeit, 'Aufsichtsentscheid an der Streitwertgrenze gescheitert').toBe('zulaessig_ausnahme');
      expect(r.fristTage, `Aufsichtsfrist falsch (${wechselbetreibung ? 'Wechselbetreibung 5' : 'Regel 10'} Tage)`)
        .toBe(wechselbetreibung ? 5 : 10);
      // Art. 46 Abs. 2 lit. b BGG: bei Wechselbetreibung kein Stillstand.
      if (wechselbetreibung) expect(r.stillstand, 'Wechselbetreibung mit Fristenstillstand (Art. 46 Abs. 2 lit. b BGG)').toBe(false);
    }));
  });
});

// ─── BG-6 · Abteilungs-Zuteilung ist total und regime-treu (Art. 33/34 BGerR) ─
describe('bgerRechtsweg — Abteilungs-Zuteilung deckt jedes Zivilgebiet ab', () => {
  it('genau eine der beiden Abteilungen; Rechtsöffnung geht in die I.', () => {
    fc.assert(fc.property(gebietArb, (gebiet) => {
      const a = bgerAbteilungZivil(gebiet);
      expect(['I. zivilrechtliche Abteilung', 'II. zivilrechtliche Abteilung'].includes(a.name),
        `unbekannte Abteilung «${a.name}» für ${gebiet}`).toBe(true);
      expect(a.norm, `Norm-Anker passt nicht zur Abteilung ${a.name}`)
        .toBe(a.name.startsWith('I. ') ? 'Art. 33 BGerR' : 'Art. 34 BGerR');
    }));
  });

  it('Rechtsöffnung: I. zivilrechtliche Abteilung (Art. 33 lit. i BGerR)', () => {
    expect(bgerAbteilungZivil('rechtsoeffnung').name).toBe('I. zivilrechtliche Abteilung');
    expect(bgerAbteilungZivil('schkg_uebrig').name).toBe('II. zivilrechtliche Abteilung');
  });
});

// ─── BG-7 · Kapitalisierung Art. 51 Abs. 4 BGG: exakt ×20, monoton ─────────
describe('bgerRechtsweg — Kapitalwert wiederkehrender Leistungen (Art. 51 Abs. 4 BGG)', () => {
  it('bgerKapitalwert20x(x) = 20·x, monoton, nie negativ bei x ≥ 0', () => {
    fc.assert(fc.property(chfArb(1_000_000), chfArb(1_000_000), (a, b) => {
      expect(bgerKapitalwert20x(a)).toBeCloseTo(a * 20, 6);
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      expect(bgerKapitalwert20x(hi) >= bgerKapitalwert20x(lo), 'Kapitalwert nicht monoton').toBe(true);
      expect(bgerKapitalwert20x(a) >= 0, 'negativer Kapitalwert bei nicht negativer Jahresleistung').toBe(true);
    }));
  });
});
