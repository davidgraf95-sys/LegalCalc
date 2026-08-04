import { describe, it, expect } from 'vitest';
import { pruefeJson, pruefeJsonVoll, istRecord } from '../data/jsonSchutz';
import { PLZ_VERZEICHNIS_PRUEFER } from '../data/plz/plzAufloesung';
import { STRASSEN_VERZEICHNIS_PRUEFER, STRASSEN_NUMMERN_PRUEFER } from '../data/plz/strassenAufloesung';
import { SCHLICHTUNG_AEMTER_PRUEFER } from '../data/schlichtung/amtAufloesung';
import {
  ZH_FRIEDENSRICHTER_PRUEFER,
  ZH_STRASSEN_PRUEFER,
  zhGemeindeEintragBefund,
  zhStrasseEintragBefund,
  zhNummernEintragBefund,
} from '../data/schlichtung/zhAmt';
import { BETREIBUNG_KARTEN_PRUEFER } from '../data/betreibung/amtAufloesung';
import plzVerzeichnis from '../data/plz/plzVerzeichnis.json';
import strassenVerzeichnis from '../data/plz/strassenVerzeichnis.json';
import strassenNummern from '../data/plz/strassenNummern.json';
import schlichtungAemter from '../data/schlichtung/aemterKantone.json';
import zhFriedensrichter from '../data/schlichtung/zhFriedensrichter.json';
import zhStrassen from '../data/schlichtung/zhStrassen.json';
import betreibungAemter from '../data/betreibung/aemterKantone.json';

// ─── Voll-Validierung der JSON-Aussenkanten (QS-CODE-AUSSENKANTEN) ──────────
//
// Die Ladezeit-Guards in src/data prüfen Wurzel + Stichprobe; HIER wird jedes
// Generator-Artefakt VOLLSTÄNDIG gegen seinen Prüfer gefahren. Driftet ein
// Generator (plz-generieren.ts, ch-strassen-generieren.ts, zh-*-generieren.ts)
// in der Struktur, wird die CI rot — statt dass ein Nutzer-Lookup still null
// liefert (§8). Die Negativfälle zeigen die Scheiterns-Fähigkeit der Prüfer
// dauerhaft (§6.7): ein Prüfer, der das Falschbeispiel schluckt, bricht hier.

describe('Daten-Aussenkanten – Vollprüfung der Generator-Artefakte', () => {
  it('plzVerzeichnis.json: alle PLZ-Einträge sind [Gemeinde, Kanton, Anteil]-Tripel', () => {
    expect(() => pruefeJsonVoll(plzVerzeichnis, PLZ_VERZEICHNIS_PRUEFER)).not.toThrow();
  });

  it('strassenVerzeichnis.json + strassenNummern.json: Strukturform hält voll', () => {
    expect(() => pruefeJsonVoll(strassenVerzeichnis, STRASSEN_VERZEICHNIS_PRUEFER)).not.toThrow();
    expect(() => pruefeJsonVoll(strassenNummern, STRASSEN_NUMMERN_PRUEFER)).not.toThrow();
  });

  it('schlichtung/aemterKantone.json: alle Register voll strukturkonform', () => {
    expect(() => pruefeJsonVoll(schlichtungAemter, SCHLICHTUNG_AEMTER_PRUEFER)).not.toThrow();
  });

  it('betreibung/aemterKantone.json: alle Karten voll strukturkonform', () => {
    expect(() => pruefeJsonVoll(betreibungAemter, BETREIBUNG_KARTEN_PRUEFER)).not.toThrow();
  });

  it('zhFriedensrichter.json: Wurzel, alle Gemeinden und PLZ-Kreise strukturkonform', () => {
    expect(() => pruefeJsonVoll(zhFriedensrichter, ZH_FRIEDENSRICHTER_PRUEFER)).not.toThrow();
    const d = zhFriedensrichter as unknown as Record<string, unknown>;
    const gemeinden = d.gemeinden as Record<string, unknown>;
    for (const [g, amt] of Object.entries(gemeinden)) {
      const befund = zhGemeindeEintragBefund(amt);
      if (befund) throw new Error(`Gemeinde «${g}»: ${befund}`);
    }
    const plzKreise = d.zuerichPlzKreise as Record<string, unknown>;
    for (const [plz, liste] of Object.entries(plzKreise)) {
      const ok = Array.isArray(liste) && liste.every((p) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' && typeof p[1] === 'number');
      if (!ok) throw new Error(`zuerichPlzKreise «${plz}» ist keine [Kreis, Anteil]-Paarliste`);
    }
  });

  it('zhStrassen.json: alle Strassen- und Nummern-Einträge strukturkonform', () => {
    expect(() => pruefeJsonVoll(zhStrassen, ZH_STRASSEN_PRUEFER)).not.toThrow();
    const d = zhStrassen as unknown as { strassen: Record<string, unknown>; nummern: Record<string, unknown> };
    for (const [s, kreise] of Object.entries(d.strassen)) {
      const befund = zhStrasseEintragBefund(kreise);
      if (befund) throw new Error(`Strasse «${s}»: ${befund}`);
    }
    for (const [s, nummern] of Object.entries(d.nummern)) {
      const befund = zhNummernEintragBefund(nummern);
      if (befund) throw new Error(`Nummern «${s}»: ${befund}`);
    }
  });
});

describe('Daten-Aussenkanten – Scheiterns-Fähigkeit der Prüfer (§6.7)', () => {
  it('istRecord unterscheidet Objekt, Array und Primitiv', () => {
    expect(istRecord({})).toBe(true);
    expect(istRecord([])).toBe(false);
    expect(istRecord('x')).toBe(false);
    expect(istRecord(null)).toBe(false);
  });

  it('PLZ-Prüfer weist kaputte Tripel ab', () => {
    expect(() => pruefeJson({ '8000': [['Zürich', 'ZH']] }, PLZ_VERZEICHNIS_PRUEFER)).toThrow(/Tripel/);
    expect(() => pruefeJson({ '8000': 'Zürich' }, PLZ_VERZEICHNIS_PRUEFER)).toThrow(/Array/);
    expect(() => pruefeJson([], PLZ_VERZEICHNIS_PRUEFER)).toThrow(/Wurzel/);
  });

  it('Schlichtungs-Prüfer weist Ämter ohne Adresse und kaputte Indizes ab', () => {
    expect(() => pruefeJson({ ZH: { aemter: [{ name: 'X' }], gemeinden: {} } }, SCHLICHTUNG_AEMTER_PRUEFER)).toThrow(/plzOrt|Form/);
    expect(() => pruefeJson({ ZH: { aemter: [], gemeinden: { A: 'nein' } } }, SCHLICHTUNG_AEMTER_PRUEFER)).toThrow(/Index/);
  });

  it('Betreibungs-Prüfer weist kaputte stadtKreise ab', () => {
    expect(() => pruefeJson({ ZH: { gemeinden: {}, stadtKreise: { Zürich: ['1'] } } }, BETREIBUNG_KARTEN_PRUEFER)).toThrow(/stadtKreise/);
  });

  it('ZH-Prüfer weisen fehlende Wurzelfelder ab', () => {
    expect(() => pruefeJson({ gemeinden: {} }, ZH_FRIEDENSRICHTER_PRUEFER)).toThrow(/zuerichKreise/);
    expect(() => pruefeJson({ strassen: {} }, ZH_STRASSEN_PRUEFER)).toThrow(/nummern/);
    expect(zhGemeindeEintragBefund({ name: 'X' })).toMatch(/Form/);
    expect(zhStrasseEintragBefund([1])).toMatch(/Kreis/);
    expect(zhNummernEintragBefund({ '1': 2 })).toMatch(/Hausnummer/);
  });

  it('Strassen-Prüfer weisen kaputte Paare und Nicht-Zahlen ab', () => {
    expect(() => pruefeJson({ '4132': { g: [['Muttenz']], s: {} } }, STRASSEN_VERZEICHNIS_PRUEFER)).toThrow(/Paaren/);
    expect(() => pruefeJson({ '4132|x': { y: 'z' } }, STRASSEN_NUMMERN_PRUEFER)).toThrow(/Index/);
  });
});
