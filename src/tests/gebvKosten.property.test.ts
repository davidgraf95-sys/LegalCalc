// ─── Property-Tests: gebvKosten + schkgZustaendigkeit (GebV SchKG) ───────────
//
// Invarianten-Katalog: bibliothek/register/property-invarianten-2026-08-15.md
// KEINE Engine-Änderung; eine real rote Property ist ein BEFUND (§1).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  berechneBetreibungskosten, gebuehrPfaendung, gebuehrVerwertungRoh,
  gebuehrEinzahlung, rahmenEntscheidSummarsache, type GebvEingabe,
} from '../lib/gebvKosten';
import { gebuehrZahlungsbefehl, bestimmeSchkgZustaendigkeit, type SchkgAnliegen, type SchkgSchuldnerTyp, type SchkgPfand } from '../lib/schkgZustaendigkeit';
import { PROPERTY_SEED, chfArb } from './propertyArb';

fc.configureGlobal({ seed: PROPERTY_SEED, numRuns: 1000 });

const rappengenau = (x: number): boolean => Math.round(x * 100) / 100 === x;
const forderungArb = chfArb(5_000_000);

// ─── GB-1 · Determinismus (§2) ───────────────────────────────────────────────
describe('gebvKosten — Determinismus (§2)', () => {
  it('alle Gebühren-Funktionen liefern zweimal dasselbe', () => {
    fc.assert(fc.property(forderungArb, (x) => {
      expect(gebuehrZahlungsbefehl(x)).toEqual(gebuehrZahlungsbefehl(x));
      expect(gebuehrPfaendung(x)).toBe(gebuehrPfaendung(x));
      expect(gebuehrVerwertungRoh(x)).toBe(gebuehrVerwertungRoh(x));
      expect(gebuehrEinzahlung(x)).toBe(gebuehrEinzahlung(x));
      expect(rahmenEntscheidSummarsache(x)).toEqual(rahmenEntscheidSummarsache(x));
    }));
  });
});

// ─── GB-2 · Staffeln steigen mit der Bemessungsgrösse ───────────────────────
// Art. 16/20/30/19 GebV SchKG sind aufsteigende Staffeln bzw. Promillesätze:
// eine höhere Forderung darf nie eine KLEINERE Gebühr ergeben. Genau an den
// Bandgrenzen (100/500/1 000/10 000/100 000/1 000 000) sitzt der klassische
// Off-by-one — dort generiert fast-check dicht.
describe('gebvKosten — Gebühren-Staffeln sind monoton (nie fallend)', () => {
  const staffeln: [string, (x: number) => number][] = [
    ['Zahlungsbefehl (Art. 16)', (x) => gebuehrZahlungsbefehl(x).gebuehrCHF],
    ['Pfändung (Art. 20)', gebuehrPfaendung],
    ['Verwertung (Art. 30)', gebuehrVerwertungRoh],
    ['Einzahlung (Art. 19)', gebuehrEinzahlung],
  ];
  const grenzen = [100, 500, 1_000, 10_000, 100_000, 1_000_000];

  it('f(hoch) ≥ f(tief) für jede Staffel', () => {
    fc.assert(fc.property(forderungArb, forderungArb, fc.constantFrom(...staffeln), (a, b, [name, f]) => {
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      expect(f(hi) >= f(lo) - 1e-9, `${name}: f(${hi}) = ${f(hi)} < f(${lo}) = ${f(lo)}`).toBe(true);
    }));
  });

  it('an jeder Bandgrenze gilt f(g) ≤ f(g + 0.01) (erschöpfend)', () => {
    for (const [name, f] of staffeln) {
      for (const g of grenzen) {
        expect(f(g) <= f(g + 0.01) + 1e-9, `${name}: an der Grenze ${g} sinkt die Gebühr (${f(g)} → ${f(g + 0.01)})`).toBe(true);
      }
    }
  });
});

// ─── GB-3 · Grenzen: endlich, ≥ 0, rappengenau, gedeckelt ──────────────────
// Art. 19 Abs. 1 GebV SchKG deckelt die Einzahlungsgebühr bei CHF 500. Ein
// sub-Rappen-Rest wäre determinismus-brechend (Anzeige ≠ Weiterrechnung).
describe('gebvKosten — Beträge endlich, nie negativ, rappengenau, gedeckelt', () => {
  it('jede Einzelgebühr erfüllt die Grenzen', () => {
    fc.assert(fc.property(forderungArb, (x) => {
      for (const [name, v] of [
        ['Zahlungsbefehl', gebuehrZahlungsbefehl(x).gebuehrCHF],
        ['Pfändung', gebuehrPfaendung(x)],
        ['Verwertung', gebuehrVerwertungRoh(x)],
        ['Einzahlung', gebuehrEinzahlung(x)],
      ] as const) {
        expect(Number.isFinite(v) && v >= 0, `${name}: ${v} nicht endlich/≥ 0 bei ${x}`).toBe(true);
        expect(rappengenau(v), `${name}: ${v} ist nicht rappengenau bei ${x}`).toBe(true);
      }
      expect(gebuehrEinzahlung(x) <= 500, `Einzahlung ${gebuehrEinzahlung(x)} über dem Deckel CHF 500 (Art. 19 Abs. 1)`).toBe(true);
      expect(gebuehrZahlungsbefehl(x).band.length > 0, 'Zahlungsbefehl ohne Band-Bezeichnung').toBe(true);
    }));
  });
});

// ─── GB-4 · Rahmengebühr Art. 48: nie invertiert, nie Punktwert ────────────
// §2-Schnitt: Ermessens-Rahmen werden NIE zu einem Punktwert verdichtet; eine
// Spanne mit von > bis wäre in der UI sinnlos.
describe('gebvKosten — Entscheid-Rahmen (Art. 48) bleibt eine gültige Spanne', () => {
  it('0 < vonCHF < bisCHF, beide rappengenau', () => {
    fc.assert(fc.property(forderungArb, (x) => {
      const r = rahmenEntscheidSummarsache(x);
      expect(r.vonCHF > 0 && r.bisCHF > 0, `Rahmen ${r.vonCHF}–${r.bisCHF} nicht positiv`).toBe(true);
      expect(r.vonCHF < r.bisCHF, `Rahmen invertiert/entartet: ${r.vonCHF} ≥ ${r.bisCHF} bei ${x}`).toBe(true);
      expect(rappengenau(r.vonCHF) && rappengenau(r.bisCHF), 'Rahmengrenze nicht rappengenau').toBe(true);
    }));
  });
});

// ─── GB-5 · Verwertung: die Kappungen des Art. 30 halten ───────────────────
// Abs. 3: die Gebühr ist nie höher als der Erlös. Abs. 4 (kein Erwerber):
// halbe Gebühr, höchstens CHF 1 000.
describe('gebvKosten — Verwertungsgebühr respektiert Art. 30 Abs. 3/4', () => {
  it('mit Erwerber ≤ Erlös; ohne Erwerber ≤ CHF 1 000 und ≤ halbe Rohgebühr', () => {
    fc.assert(fc.property(forderungArb, chfArb(2_000_000), fc.boolean(), (forderungCHF, betragCHF, keinErwerber) => {
      const r = berechneBetreibungskosten({ forderungCHF, verwertung: { betragCHF, keinErwerber } });
      const g = r.totalPunktwerteCHF;
      if (keinErwerber) {
        expect(g <= 1_000 + 1e-9, `kein Erwerber: ${g} über dem Deckel CHF 1 000 (Art. 30 Abs. 4)`).toBe(true);
        // Rundungs-Kohärenz: der ausgewiesene Wert weicht höchstens um einen
        // halben Rappen von der ungerundeten Halbierung ab (Hauskonvention
        // round2, dokumentiert im Engine-Kopf).
        expect(g <= gebuehrVerwertungRoh(betragCHF) / 2 + 0.005 + 1e-9,
          `kein Erwerber: ${g} > halbe Rohgebühr ${gebuehrVerwertungRoh(betragCHF) / 2} (mehr als ein halber Rappen)`).toBe(true);
      } else {
        expect(g <= betragCHF + 1e-9, `Gebühr ${g} übersteigt den Erlös ${betragCHF} (Art. 30 Abs. 3)`).toBe(true);
      }
      expect(rappengenau(g), `Total ${g} nicht rappengenau`).toBe(true);
    }));
  });
});

// ─── GB-6 · Gesamtkosten: additiv, nie negativ, Rahmen getrennt ────────────
// §2-Schnitt (Dossier §C): Punktwerte werden addiert, die RAHMENgebühr des
// Art. 48 bleibt eine getrennte Bandbreite und fliesst NIE in die Summe ein.
describe('gebvKosten — Punktwerte und Ermessens-Rahmen bleiben getrennt (§2)', () => {
  it('Total ≥ 0 und die Entscheid-Rahmengebühr erhöht das Total nicht', () => {
    fc.assert(fc.property(forderungArb, forderungArb, (forderungCHF, streitwertCHF) => {
      const basis: GebvEingabe = { forderungCHF, zahlungsbefehl: {} };
      const ohne = berechneBetreibungskosten(basis);
      const mit = berechneBetreibungskosten({ ...basis, entscheidSummarsache: { streitwertCHF } });
      expect(ohne.totalPunktwerteCHF >= 0, `negatives Total ${ohne.totalPunktwerteCHF}`).toBe(true);
      expect(mit.totalPunktwerteCHF, 'Ermessens-Rahmen (Art. 48) floss als Punktwert in die Summe').toBe(ohne.totalPunktwerteCHF);
      expect(mit.bandbreite, 'Entscheid-Rahmen fehlt in der Ausgabe').toEqual(rahmenEntscheidSummarsache(streitwertCHF));
      expect(ohne.bandbreite, 'Bandbreite ohne Entscheid-Gesuch gesetzt').toBeUndefined();
    }));
  });

  it('Zahlungsbefehls-Total steigt mit der Forderung', () => {
    fc.assert(fc.property(forderungArb, forderungArb, (a, b) => {
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      const f = (x: number) => berechneBetreibungskosten({ forderungCHF: x, zahlungsbefehl: {} }).totalPunktwerteCHF;
      expect(f(hi) >= f(lo), `Total bei ${hi} (${f(hi)}) < Total bei ${lo} (${f(lo)})`).toBe(true);
    }));
  });
});

// ─── GB-7 · Betreibungsort-Regimes kollabieren nicht (§4) ──────────────────
// Art. 51 Abs. 2 SchKG: Bei GRUNDPFAND ist der Ort des Grundstücks ZWINGEND —
// der Arrest-Wahlort (Art. 52 Satz 1) steht dann gar nicht zur Wahl.
// Art. 52 Satz 2 SchKG: Für Konkursandrohung/-eröffnung gilt der Arrest-
// Wahlort ebenfalls nie. Ein Kollaps beider Regimes böte einen Ort an, an dem
// die Betreibung nichtig wäre.
describe('schkgZustaendigkeit — Arrest-Wahlort bleibt gesperrt, wo die Norm ihn ausschliesst (§4)', () => {
  const anliegenArb = fc.constantFrom<SchkgAnliegen>(
    'betreibung_einleiten', 'rechtsoeffnung', 'aberkennungsklage', 'anerkennungsklage',
    'rueckforderung', 'feststellung', 'widerspruch', 'kollokation', 'arrest',
    'konkursbegehren', 'beschwerde_amt');
  const schuldnerArb = fc.constantFrom<SchkgSchuldnerTyp>(
    'natuerlich_wohnsitz', 'natuerlich_ohne_wohnsitz', 'jur_person_hr',
    'jur_person_nicht_hr', 'erbschaft', 'stockwerkeigentuemer', 'ausland_niederlassung');
  const pfandArb = fc.constantFrom<SchkgPfand>('kein', 'faustpfand', 'grundpfand');

  it('Grundpfand und Konkursbegehren bieten den Arrest-Wahlort nie an', () => {
    fc.assert(fc.property(anliegenArb, schuldnerArb, pfandArb, fc.boolean(), forderungArb,
      (anliegen, schuldnerTyp, pfand, arrestGelegt, forderungCHF) => {
        const r = bestimmeSchkgZustaendigkeit({ anliegen, schuldnerTyp, pfand, arrestGelegt, forderungCHF });
        const wahlort = r.betreibungsort.text.includes('Ort des Arrestgegenstands');
        if (pfand === 'grundpfand' || anliegen === 'konkursbegehren') {
          expect(wahlort, `${anliegen}/${pfand}: Arrest-Wahlort angeboten (Art. 51 Abs. 2 / 52 Satz 2 SchKG)`).toBe(false);
        }
        if (pfand === 'grundpfand') {
          expect(r.betreibungsort.normen.some((n) => n.artikel.includes('Art. 51 Abs. 2')),
            'Grundpfand ohne Art.-51-Abs.-2-Anker').toBe(true);
        }
        // Struktur-Vollständigkeit: jede Konstellation nennt Ort, Forum und Eingabe.
        expect(r.betreibungsort.text.length > 0 && r.forum.stelle.length > 0 && r.eingabe.art.length > 0,
          `${anliegen}/${schuldnerTyp}: unvollständiges Ergebnis`).toBe(true);
        expect(r.betreibungsort.normen.length > 0, 'Betreibungsort ohne Norm-Anker').toBe(true);
      }));
  });

  it('Determinismus (§2) und Gebühren-Kopplung an die Forderung', () => {
    fc.assert(fc.property(schuldnerArb, forderungArb, (schuldnerTyp, forderungCHF) => {
      const e = { anliegen: 'betreibung_einleiten' as const, schuldnerTyp, forderungCHF };
      expect(bestimmeSchkgZustaendigkeit(e)).toEqual(bestimmeSchkgZustaendigkeit(e));
      // §5 Single Source of Truth: die Art.-16-Staffel wird wiederverwendet,
      // nicht ein zweites Mal gepflegt.
      expect(bestimmeSchkgZustaendigkeit(e).kostenZahlungsbefehl,
        'Zahlungsbefehl-Gebühr weicht von der Art.-16-Staffel ab').toEqual(gebuehrZahlungsbefehl(forderungCHF));
    }));
  });
});
