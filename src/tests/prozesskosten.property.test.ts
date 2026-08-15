// ─── Property-Tests: prozesskosten (Art. 95–99/106–118 ZPO) — QS-CODE-PROP ───
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  berechneProzesskosten, berechneKostenrisiko, berechneKostenvorschuss,
  berechneMwstParteientschaedigung, berechneSicherheitsleistung,
  KANTONE, type KantonCode, type Materie, type Verfahrensphase,
  type Instanz, type Verfahrensart, type ProzesskostenEingabe, type PostenErgebnis,
} from '../lib/prozesskosten';
import { PROPERTY_SEED, chfArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 400 });

const kantonArb = fc.constantFrom(...(KANTONE as readonly KantonCode[]));
const materieArb = fc.constantFrom<Materie>(
  'allgemein', 'arbeit', 'miete_pacht', 'gleichstellung', 'behindertengleichstellung',
  'mitwirkung', 'zusatzversicherung_kvg', 'datenschutz', 'gewaltschutz');
const phaseArb = fc.constantFrom<Verfahrensphase>('schlichtung', 'entscheid');
const instanzArb = fc.constantFrom<Instanz>('erstinstanz', 'rechtsmittel', 'handelsgericht', 'bundesgericht');
const verfahrenArb = fc.constantFrom<Verfahrensart>('ordentlich', 'vereinfacht', 'summarisch');

const eingabeArb: fc.Arbitrary<ProzesskostenEingabe> = fc.record({
  kanton: kantonArb,
  streitwertCHF: chfArb(2_000_000),
  phase: phaseArb,
  materie: materieArb,
  instanz: instanzArb,
  verfahren: verfahrenArb,
  nichtVermoegensrechtlich: fc.boolean(),
});

/** Untergrenze eines Postens in CHF — kostenlos zählt als 0. */
function untergrenze(p: PostenErgebnis): number | null {
  if (p.kostenlos) return 0;
  const e = p.ergebnis;
  if (!e) return null;
  return e.deterministisch ? e.betragChf : (typeof e.vonChf === 'number' ? e.vonChf : null);
}

// ─── PK-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('prozesskosten — Determinismus (§2)', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. Hinweise)', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      expect(berechneProzesskosten(e)).toEqual(berechneProzesskosten(e));
    }));
  });
});

// ─── PK-2 · Grenzen: kein Betrag negativ, keine invertierte Spanne ──────────
// Ein Ermessens-Rahmen mit von > bis wäre in der UI sinnlos; ein negativer
// Kostenbetrag existiert im Tarifrecht nicht.
describe('prozesskosten — Beträge nie negativ, Spannen nie invertiert', () => {
  it('jeder Posten liefert endliche, nicht negative Werte mit von ≤ bis', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const r = berechneProzesskosten(e);
      for (const [name, p] of [['Gerichtskosten', r.gerichtskosten], ['Parteientschädigung', r.parteientschaedigung]] as const) {
        if (p.kostenlos || !p.ergebnis) continue;
        const erg = p.ergebnis;
        if (erg.deterministisch) {
          expect(Number.isFinite(erg.betragChf) && erg.betragChf >= 0, `${name}: ${erg.betragChf} ungültig`).toBe(true);
        } else if (typeof erg.vonChf === 'number' && typeof erg.bisChf === 'number') {
          expect(erg.vonChf >= 0, `${name}: negative Untergrenze ${erg.vonChf}`).toBe(true);
          expect(erg.vonChf <= erg.bisChf, `${name}: Spanne invertiert (${erg.vonChf} > ${erg.bisChf})`).toBe(true);
        }
        expect(p.quelle.artikel.length > 0, `${name}: Tarif ohne Norm-Anker (§7)`).toBe(true);
      }
    }));
  });
});

// ─── PK-3 · Schlichtung: keine Parteientschädigung (Art. 113 Abs. 1 ZPO) ────
// Ausnahmslose Rechtsregel — sie darf durch keinen Kanton, keine Materie und
// keine Verfahrensart aufgeweicht werden.
describe('prozesskosten — im Schlichtungsverfahren nie eine Parteientschädigung', () => {
  it('Art. 113 Abs. 1 ZPO gilt in allen Kantonen und Materien', () => {
    fc.assert(fc.property(kantonArb, chfArb(2_000_000), materieArb, fc.boolean(),
      (kanton, streitwertCHF, materie, nv) => {
        const r = berechneProzesskosten({ kanton, streitwertCHF, phase: 'schlichtung', materie, nichtVermoegensrechtlich: nv });
        expect(r.parteientschaedigung.kostenlos, `${kanton}/${materie}: Parteientschädigung in der Schlichtung gesprochen`).toBe(true);
        expect(r.parteientschaedigung.kostenlosGrund ?? '', 'Kostenlosigkeit ohne Art.-113-Begründung').toContain('Art. 113 Abs. 1 ZPO');
      }));
  });
});

// ─── PK-4 · Miete/Pacht: kostenlos NUR in der Schlichtung ──────────────────
// Art. 113 Abs. 2 lit. c ZPO nennt Miete/Pacht; Art. 114 ZPO (Entscheid-
// verfahren) tut es NICHT. Der Kollaps beider Phasen wäre eine falsche
// Kostenauskunft — der Code markiert die Stelle ausdrücklich als «WICHTIG».
describe('prozesskosten — Schlichtung und Entscheidverfahren kollabieren nicht (§4)', () => {
  it('Miete/Pacht: Schlichtung kostenlos, Entscheidverfahren nicht', () => {
    fc.assert(fc.property(kantonArb, chfArb(2_000_000), (kanton, streitwertCHF) => {
      const s = berechneProzesskosten({ kanton, streitwertCHF, phase: 'schlichtung', materie: 'miete_pacht' });
      const e = berechneProzesskosten({ kanton, streitwertCHF, phase: 'entscheid', materie: 'miete_pacht' });
      expect(s.gerichtskosten.kostenlos, `${kanton}: Miete/Pacht in der Schlichtung nicht kostenlos (Art. 113 II lit. c ZPO)`).toBe(true);
      expect(e.gerichtskosten.kostenlos, `${kanton}: Miete/Pacht im Entscheidverfahren kostenlos (Art. 114 ZPO nennt sie nicht)`).toBe(false);
    }));
  });

  it('Arbeitsrecht: Kostenfreiheit endet oberhalb CHF 30 000 (Art. 113 II lit. d / 114 lit. c ZPO)', () => {
    fc.assert(fc.property(kantonArb, phaseArb, (kanton, phase) => {
      const frei = berechneProzesskosten({ kanton, streitwertCHF: 30_000, phase, materie: 'arbeit' });
      const teuer = berechneProzesskosten({ kanton, streitwertCHF: 30_000.01, phase, materie: 'arbeit' });
      expect(frei.gerichtskosten.kostenlos, `${kanton}/${phase}: bei genau CHF 30 000 nicht kostenlos`).toBe(true);
      expect(teuer.gerichtskosten.kostenlos, `${kanton}/${phase}: über CHF 30 000 noch kostenlos`).toBe(false);
    }));
  });
});

// ─── PK-5 · Monotonie im Streitwert ────────────────────────────────────────
// Die kantonalen Tarife sind aufsteigende Staffeln; die Kostenfreiheits-
// Schwelle (30 000) springt aufwärts. Eine höhere Streitsumme darf nie
// billiger sein.
describe('prozesskosten — höherer Streitwert ⇒ nie tiefere Kosten', () => {
  it('Untergrenze von Gerichtskosten und Parteientschädigung ist monoton', () => {
    fc.assert(fc.property(eingabeArb, chfArb(500_000), (e, zuschlag) => {
      const lo = berechneProzesskosten(e);
      const hi = berechneProzesskosten({ ...e, streitwertCHF: e.streitwertCHF + zuschlag });
      for (const feld of ['gerichtskosten', 'parteientschaedigung'] as const) {
        const a = untergrenze(lo[feld]), b = untergrenze(hi[feld]);
        if (a === null || b === null) continue;
        expect(b >= a - 0.5, `${e.kanton}/${e.materie}/${feld}: CHF ${e.streitwertCHF + zuschlag} kostet ${b} < ${a} bei CHF ${e.streitwertCHF}`).toBe(true);
      }
    }));
  });
});

// ─── PK-6 · Kostenrisiko: Quote 0..1, monoton fallend, Grenzfälle exakt ─────
// Art. 106 ZPO (Verteilung nach Ausgang): Bei vollem Obsiegen trägt die Partei
// keine Gerichtskosten; die Netto-Belastung sinkt mit steigender Quote.
describe('prozesskosten — Kostenrisiko folgt der Obsiegensquote (Art. 106/111 ZPO)', () => {
  it('Quote wird auf [0,1] geklemmt, volles Obsiegen kostet nichts, Netto sinkt monoton', () => {
    fc.assert(fc.property(eingabeArb, fc.double({ min: -2, max: 3, noNaN: true }), fc.boolean(),
      (e, quote, unentgeltlich) => {
        const p = berechneProzesskosten(e);
        const r = berechneKostenrisiko(p.gerichtskosten, p.parteientschaedigung, quote, unentgeltlich);
        expect(r.obsiegensquote >= 0 && r.obsiegensquote <= 1, `Quote ${r.obsiegensquote} ausserhalb [0,1]`).toBe(true);
        if (!r.berechenbar) return;
        expect(r.gerichtskostenZuLasten!.vonChf <= r.gerichtskostenZuLasten!.bisChf, 'Gerichtskosten-Spanne invertiert').toBe(true);
        const voll = berechneKostenrisiko(p.gerichtskosten, p.parteientschaedigung, 1, unentgeltlich);
        const null_ = berechneKostenrisiko(p.gerichtskosten, p.parteientschaedigung, 0, unentgeltlich);
        expect(voll.gerichtskostenZuLasten, 'volles Obsiegen belastet dennoch mit Gerichtskosten').toEqual({ vonChf: 0, bisChf: 0 });
        expect(voll.nettoBelastung!.bisChf, 'volles Obsiegen erzeugt Netto-Belastung').toBe(0);
        expect(null_.nettoBelastung!.bisChf >= voll.nettoBelastung!.bisChf,
          'volles Unterliegen belastet weniger als volles Obsiegen').toBe(true);
        // Unentgeltliche Rechtspflege (Art. 118 ZPO): eigene Gerichtskosten
        // entfallen, die gegnerische Parteientschädigung bleibt (Abs. 3).
        if (unentgeltlich) expect(r.gerichtskostenZuLasten, 'UR befreit nicht von den eigenen Gerichtskosten').toEqual({ vonChf: 0, bisChf: 0 });
      }));
  });
});

// ─── PK-7 · Kostenvorschuss: Faktor ½ oder 1, nie mehr als die Kosten ───────
// Art. 98 Abs. 1/2 ZPO (Fassung seit 1.1.2025) bzw. Art. 62 BGG.
describe('prozesskosten — Kostenvorschuss (Art. 98 ZPO / Art. 62 BGG)', () => {
  it('faktor ∈ {0.5, 1}, voll ⟺ faktor 1, Vorschuss ≤ mutmassliche Gerichtskosten', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const p = berechneProzesskosten(e);
      const v = berechneKostenvorschuss(p.gerichtskosten, e.phase, e.instanz!, e.verfahren!);
      expect([0.5, 1].includes(v.faktor), `unbekannter Vorschuss-Faktor ${v.faktor}`).toBe(true);
      expect(v.voll, 'voll-Flag widerspricht dem Faktor').toBe(v.faktor === 1);
      expect(v.norm.length > 0, 'Vorschuss ohne Norm-Anker').toBe(true);
      const gk = untergrenze(p.gerichtskosten);
      if (v.spanne && gk !== null) {
        expect(v.spanne.vonChf <= v.spanne.bisChf, 'Vorschuss-Spanne invertiert').toBe(true);
        expect(v.spanne.vonChf <= gk + 0.5, `Vorschuss ${v.spanne.vonChf} über den mutmasslichen Gerichtskosten ${gk}`).toBe(true);
      }
    }));
  });
});

// ─── PK-8 · MwSt: nie Doppelzählung (Bug-Check 15.6.2026) ──────────────────
// Enthält der Tarif die MwSt bereits (Bundesgericht-Reglement, VS LTar), wird
// KEIN Aufschlag gerechnet. Sonst ist brutto ≥ netto.
describe('prozesskosten — MwSt auf die Parteientschädigung', () => {
  it('mwstInbegriffen ⇒ kein Aufschlag; sonst brutto ≥ netto', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const p = berechneProzesskosten(e);
      const m = berechneMwstParteientschaedigung(p.parteientschaedigung);
      expect(m.satzProzent > 0, 'MwSt-Satz nicht positiv').toBe(true);
      if (p.parteientschaedigung.quelle.mwstInbegriffen) {
        expect(m.betrag, `${e.kanton}: MwSt doppelt gerechnet (Tarif enthält sie bereits)`).toBeNull();
      }
      const netto = untergrenze(p.parteientschaedigung);
      if (m.bruttoSpanne && netto !== null) {
        expect(m.bruttoSpanne.vonChf >= netto - 0.5, `brutto ${m.bruttoSpanne.vonChf} unter netto ${netto}`).toBe(true);
        expect(m.bruttoSpanne.vonChf <= m.bruttoSpanne.bisChf, 'MwSt-Spanne invertiert').toBe(true);
      }
    }));
  });
});

// ─── PK-9 · Sicherheitsleistung: die Ausschlüsse des Art. 99 Abs. 3 ZPO ────
// Schlichtung (keine Parteientschädigung, Art. 113 I), summarisches Verfahren
// (lit. c) und DSG-Streitigkeiten (lit. d) schliessen die Kaution aus.
describe('prozesskosten — Sicherheitsleistung respektiert Art. 99 Abs. 3 ZPO', () => {
  it('ausgeschlossene Konstellationen liefern moeglich=false ohne Spanne', () => {
    fc.assert(fc.property(eingabeArb, (e) => {
      const p = berechneProzesskosten(e);
      const s = berechneSicherheitsleistung(p.parteientschaedigung, e.phase, e.verfahren!, e.materie, !!e.nichtVermoegensrechtlich);
      const mussAus = e.phase === 'schlichtung' || e.materie === 'datenschutz' || e.verfahren === 'summarisch';
      if (mussAus) {
        expect(s.moeglich, `${e.phase}/${e.materie}/${e.verfahren}: Kaution trotz Ausschluss möglich`).toBe(false);
        expect(s.spanne, 'Kautions-Spanne trotz Ausschluss beziffert').toBeNull();
        expect(s.ausschluss, 'Ausschluss ohne Begründung (§8)').toBeDefined();
      }
      expect(s.hinweise.length > 0, 'Sicherheitsleistung ohne Hinweise').toBe(true);
      if (s.spanne) expect(s.spanne.vonChf <= s.spanne.bisChf, 'Kautions-Spanne invertiert').toBe(true);
    }));
  });
});
