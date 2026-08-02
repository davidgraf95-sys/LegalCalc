import { describe, it, expect } from 'vitest';
import { assemble, erfuellt } from '../lib/vorlagen/engine';
import type { VorlageSchema } from '../lib/vorlagen/engine';
import {
  TESTAMENT_DEFAULTS, TESTAMENT_SCHEMA, testamentZusammenstellen, pruefeGates,
  type TestamentAntworten,
} from '../lib/vorlagen/testament';

// ─── Engine (generisch) ──────────────────────────────────────────────────────

const MINI: VorlageSchema = {
  id: 'mini', version: '1', titel: 'Mini', disclaimer: 'D',
  bausteine: [
    { id: 'a', text: 'Hallo {{name}}.', begruendung: 'immer' },
    { id: 'b', text: 'Nur wenn x.', includeIf: { feld: 'x', eq: true }, nummeriert: true, begruendung: 'x gewählt' },
    { id: 'c', text: '– {{item.t}}', wiederholeUeber: 'liste', includeIf: { feld: 'liste', nichtLeer: true }, begruendung: 'liste' },
    { id: 'd', text: 'Datum: {{datum}}.', nummeriert: true, begruendung: 'immer', norm: 'Art. 1 OR' },
  ],
};

describe('Vorlagen-Engine', () => {
  it('ist deterministisch: gleiche Antworten ⇒ identisches Dokument', () => {
    const a = { name: 'Anna', x: true, liste: [{ t: 'eins' }, { t: 'zwei' }], datum: '2026-06-04' };
    const r1 = JSON.stringify(assemble(MINI, a));
    const r2 = JSON.stringify(assemble(MINI, a));
    expect(r1).toBe(r2);
  });

  it('wertet includeIf-Bedingungen aus (eq/in/nichtLeer/and/or/not)', () => {
    expect(erfuellt({ feld: 'x', eq: 1 }, { x: 1 })).toBe(true);
    expect(erfuellt({ feld: 'x', in: [1, 2] }, { x: 2 })).toBe(true);
    expect(erfuellt({ feld: 'l', nichtLeer: true }, { l: [] })).toBe(false);
    expect(erfuellt({ feld: 's', nichtLeer: true }, { s: '  ' })).toBe(false);
    expect(erfuellt({ and: [{ feld: 'x', eq: 1 }, { not: { feld: 'y', eq: 2 } }] }, { x: 1, y: 3 })).toBe(true);
    expect(erfuellt({ or: [{ feld: 'x', eq: 9 }, { feld: 'y', eq: 2 }] }, { x: 1, y: 2 })).toBe(true);
  });

  it('interpoliert Platzhalter, formatiert ISO-Daten, lässt Lücken sichtbar', () => {
    const r = assemble(MINI, { name: 'Anna', datum: '2026-06-04' });
    expect(r.dokument.absaetze[0].text).toBe('Hallo Anna.');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('04.06.2026');
    const leer = assemble(MINI, {});
    expect(leer.dokument.absaetze[0].text).toBe('Hallo ________.');
  });

  it('wiederholt Listen-Bausteine je Eintrag und nummeriert fortlaufend', () => {
    const r = assemble(MINI, { x: true, liste: [{ t: 'eins' }, { t: 'zwei' }] });
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'c')!.text).toBe('– eins\n– zwei');
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'b')!.text).toMatch(/^1\. /);
    expect(r.dokument.absaetze.find((a) => a.bausteinId === 'd')!.text).toMatch(/^2\. /);
  });

  it('führt das Bausteinprotokoll mit Auslöser und Norm', () => {
    const r = assemble(MINI, { x: true });
    expect(r.aufgenommen).toEqual(['a', 'b', 'd']);
    expect(r.protokoll.find((p) => p.bausteinId === 'b')!.begruendung).toBe('x gewählt');
    expect(r.protokoll.find((p) => p.bausteinId === 'd')!.norm).toBe('Art. 1 OR');
  });
});

// ─── Testament-Schema ────────────────────────────────────────────────────────

const basis = (over: Partial<TestamentAntworten>): TestamentAntworten => ({
  ...TESTAMENT_DEFAULTS,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1990-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  datumErrichtung: '2026-06-04',
  ...over,
});

describe('Vorlage Eigenhändiges Testament', () => {
  it('Minimalfall: Identifikation, Widerruf und Schlussformel', () => {
    const r = testamentZusammenstellen(basis({}));
    expect(r.aufgenommen).toEqual(['C01_titel', 'C02_widerruf', 'C12_schlussformel']);
    expect(r.dokument.absaetze[0].text).toContain('Anna Muster');
    expect(r.dokument.absaetze[0].text).toContain('12.04.1990');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('den 04.06.2026');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('eigenhändige Unterschrift');
  });

  it('Erben mit Quote und Ersatz erzeugen C03/C03b/C05', () => {
    const r = testamentZusammenstellen(basis({
      erben: [
        { name: 'Ben Muster', angaben: 'geb. 01.01.2015', quoteProzent: 60, ersatz: 'Clara Muster' },
        { name: 'Dora Beispiel', angaben: 'geb. 02.02.1980', quoteProzent: 40 },
      ],
    }));
    expect(r.aufgenommen).toContain('C03_erbeinsetzung');
    const liste = r.dokument.absaetze.find((x) => x.bausteinId === 'C03b_erbenliste')!.text;
    expect(liste).toContain('Ben Muster');
    expect(liste).toContain('60 %');
    expect(liste).toContain('Dora Beispiel');
    const ersatz = r.dokument.absaetze.find((x) => x.bausteinId === 'C05_ersatz_erben')!.text;
    expect(ersatz).toContain('Clara Muster');
    expect(ersatz).not.toContain('Dora'); // nur Erben MIT Ersatz
  });

  it('Vermächtnis und Willensvollstreckung nur bei Erfassung', () => {
    const ohne = testamentZusammenstellen(basis({}));
    expect(ohne.aufgenommen).not.toContain('C04_vermaechtnis');
    expect(ohne.aufgenommen).not.toContain('C09_willensvollstrecker');
    const mit = testamentZusammenstellen(basis({
      vermaechtnisse: [{ empfaenger: 'Verein X', gegenstand: 'CHF 5’000' }],
      willensvollstrecker: 'RA Lic. iur. Y',
      willensvollstreckerErsatz: 'Notariat Z',
    }));
    expect(mit.aufgenommen).toEqual(expect.arrayContaining(['C04_vermaechtnis', 'C04b_vermaechtnisliste', 'C09_willensvollstrecker', 'C09b_wv_ersatz']));
  });

  it('Widerruf abwählbar (C02 entfällt)', () => {
    const r = testamentZusammenstellen(basis({ widerruf: false }));
    expect(r.aufgenommen).not.toContain('C02_widerruf');
  });

  it('Nummerierung läuft über die aufgenommenen Bausteine', () => {
    const r = testamentZusammenstellen(basis({
      erben: [{ name: 'B', angaben: 'g', quoteProzent: 100 }],
      willensvollstrecker: 'W',
    }));
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C02_widerruf')!.text).toMatch(/^1\. /);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C03_erbeinsetzung')!.text).toMatch(/^2\. /);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'C09_willensvollstrecker')!.text).toMatch(/^3\. /);
  });

  it('jeder Baustein trägt Begründung und Norm (Bausteinprotokoll vollständig)', () => {
    TESTAMENT_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });

  it('GATE-1: Minderjährigkeit blockiert (Art. 467 ZGB)', () => {
    const g = pruefeGates(basis({ geburtsdatum: '2010-01-01' }));
    expect(g.blocker.some((b) => b.includes('467'))).toBe(true);
  });

  it('GATE-3: fehlendes Errichtungsdatum blockiert', () => {
    const g = pruefeGates(basis({ datumErrichtung: '' }));
    expect(g.blocker.some((b) => b.includes('505'))).toBe(true);
  });

  it('GATE-6: Quotensumme ≠ 100 % warnt (kein Block)', () => {
    const g = pruefeGates(basis({ erben: [{ name: 'B', angaben: 'g', quoteProzent: 80 }] }));
    expect(g.blocker).toEqual([]);
    expect(g.warnungen.some((w) => w.includes('80'))).toBe(true);
  });

  it('Art. 472: hängige Scheidung mit qualifiziertem Verfahren warnt', () => {
    const g = pruefeGates(basis({ zivilstand: 'verheiratet', scheidungHaengig: true, scheidungTyp: 'getrennt_min_2_jahre' }));
    expect(g.warnungen.some((w) => w.includes('472'))).toBe(true);
  });
});

describe('Vorlagen-Engine – Nummerierung (Bug-Check)', () => {
  it('leere Wiederholungsliste erzeugt keine Nummerierungs-Lücke', () => {
    const schema: VorlageSchema = {
      id: 's', version: '1', titel: 'T', disclaimer: 'D',
      bausteine: [
        { id: 'a', text: 'A', nummeriert: true, begruendung: 'x' },
        { id: 'b', text: '– {{item.t}}', nummeriert: true, wiederholeUeber: 'leer', begruendung: 'x' },
        { id: 'c', text: 'C', nummeriert: true, begruendung: 'x' },
      ],
    };
    const r = assemble(schema, { leer: [] });
    expect(r.dokument.absaetze.map((x) => x.text)).toEqual(['1. A', '2. C']);
  });
});

// ─── Patientenverfügung ──────────────────────────────────────────────────────

import {
  PV_DEFAULTS, PV_DEFAULT_MASSNAHMEN, PV_SCHEMA, pvZusammenstellen, pruefePvGates, zielDefaults,
  type PvAntworten,
} from '../lib/vorlagen/patientenverfuegung';

const pv = (over: Partial<PvAntworten>): PvAntworten => ({
  ...PV_DEFAULTS,
  vorname: 'Anna', name: 'Muster', geburtsdatum: '1990-04-12', wohnort: 'Musterweg 1, 4051 Basel',
  massnahmen: { ...PV_DEFAULT_MASSNAHMEN, ...(over.massnahmen ?? {}) },
  ...over,
});

describe('Vorlage Patientenverfügung', () => {
  it('Minimalfall: Identifikation, Palliativ-Baustein (immer), Ersetzen, Schlussformel', () => {
    const r = pvZusammenstellen(pv({}));
    expect(r.aufgenommen).toEqual(['P01_identifikation', 'P06_palliativ', 'P11_ersetzt', 'P12_schluss']);
    expect(r.dokument.absaetze[0].text).toContain('Anna Muster');
    const schluss = r.dokument.absaetze.at(-1)!.text;
    expect(schluss).toContain('Datum (von Hand einzusetzen)');
    expect(schluss).toContain('eigenhändige Unterschrift');
  });

  it('Situationen, Ziel und entschiedene Massnahmen erscheinen; «keine Angabe» nicht', () => {
    const r = pvZusammenstellen(pv({
      situationen: ['terminal', 'komaWachkoma'],
      ziel: 'palliativ',
      massnahmen: { ...PV_DEFAULT_MASSNAHMEN, cpr: 'ablehnen', antibiotika: 'nur_befristet' },
    }));
    expect(r.aufgenommen).toEqual(expect.arrayContaining(['P03_situationen', 'P04_ziel', 'P05_massnahmen']));
    const liste = r.dokument.absaetze.find((x) => x.bausteinId === 'P05b_massnahmenliste')!.text;
    expect(liste).toContain('Wiederbelebung');
    expect(liste).toContain('Ich lehne ab');
    expect(liste).toContain('nur befristet, als therapeutischer Versuch'.slice(4, 20)); // Teilstring
    expect(liste).not.toContain('Dialyse');
  });

  it('Vertretungsperson zieht Schweigepflicht-Entbindung automatisch nach (R5); Ersatz/Weisungen bedingt', () => {
    const ohne = pvZusammenstellen(pv({}));
    expect(ohne.aufgenommen).not.toContain('P08_schweigepflicht');
    const mit = pvZusammenstellen(pv({ vertretungName: 'Ben Muster', vertretungWeisungen: 'Keine Heroik.', ersatzName: 'Clara' }));
    expect(mit.aufgenommen).toEqual(expect.arrayContaining(['P07_vertretung', 'P07b_weisungen', 'P07c_ersatz', 'P08_schweigepflicht']));
  });

  it('Organspende: Zustimmung mit vorbereitenden Massnahmen / Ablehnung', () => {
    const ja = pvZusammenstellen(pv({ organspende: 'ja', organspendeVorbereitend: true }));
    expect(ja.dokument.absaetze.find((x) => x.bausteinId === 'P10_organspende')!.text).toContain('vorbereitenden medizinischen Massnahmen');
    const nein = pvZusammenstellen(pv({ organspende: 'nein' }));
    expect(nein.dokument.absaetze.find((x) => x.bausteinId === 'P10_organspende')!.text).toContain('lehne');
  });

  it('R6: Sterbehilfe-Anordnung im Freitext blockiert hart (Art. 114/115 StGB)', () => {
    const g = pruefePvGates(pv({ einstellungLeben: 'Ich wünsche aktive Sterbehilfe durch meinen Arzt.' }));
    expect(g.blocker.length).toBe(1);
    expect(g.blocker[0]).toContain('114');
    expect(pruefePvGates(pv({ vertretungWeisungen: 'Bitte Suizidhilfe organisieren', vertretungName: 'B' })).blocker.length).toBe(1);
    expect(pruefePvGates(pv({ einstellungLeben: 'Leidenslinderung ist mir wichtig.' })).blocker).toEqual([]);
  });

  it('R2: Widerspruch maximale Lebenserhaltung ↔ Ablehnung CPR/Beatmung warnt', () => {
    const g = pruefePvGates(pv({ ziel: 'maximal', massnahmen: { ...PV_DEFAULT_MASSNAHMEN, cpr: 'ablehnen' } }));
    expect(g.warnungen.some((w) => w.includes('Widerspruch'))).toBe(true);
  });

  it('R1: Palliativ-Ziel setzt Defaults nur für offene Massnahmen', () => {
    const m = zielDefaults('palliativ', { ...PV_DEFAULT_MASSNAHMEN, cpr: 'zustimmen' });
    expect(m.cpr).toBe('zustimmen');       // getroffener Entscheid bleibt
    expect(m.beatmung).toBe('ablehnen');   // offen → Default
    expect(m.dialyse).toBe('ablehnen');
    expect(m.antibiotika).toBe('keine_angabe'); // nicht Teil der R1-Defaults
  });

  it('R3/R7: Kaskaden-Hinweis ohne Vertretung; Hinweis bei psychischer Störung', () => {
    const g = pruefePvGates(pv({ psychischeStoerungKontext: true }));
    expect(g.hinweise.some((h) => h.includes('378'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('433'))).toBe(true);
  });

  it('jeder Baustein trägt Begründung und Norm', () => {
    PV_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });
});

// ─── Vorsorgeauftrag ─────────────────────────────────────────────────────────

import {
  VA_DEFAULTS, VA_SCHEMA, vaZusammenstellen, pruefeVaGates,
  type VaAntworten,
} from '../lib/vorlagen/vorsorgeauftrag';
import { NOTARIATE, NOTARIAT_SYSTEM_LABEL } from '../lib/notariate';
import { berechneBeurkundung } from '../lib/beurkundung';
import { KANTONE } from '../lib/kantone';

const va = (over: Partial<VaAntworten>): VaAntworten => ({
  ...VA_DEFAULTS,
  volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true,
  vorname: 'Anna', nachname: 'Muster', geburtsdatum: '1960-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  beauftragte: [{ name: 'Ben Muster', typ: 'natuerlich', angaben: 'geb. 01.01.1985', bereiche: ['personensorge', 'vermoegenssorge', 'rechtsverkehr'] }],
  module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: ['behoerden'] },
  datum: '2026-06-04',
  ...over,
  ...(over.module ? { module: { ...{ personensorge: [], vermoegenssorge: [], rechtsverkehr: [] }, ...over.module } } : {}),
});

describe('Vorlage Vorsorgeauftrag', () => {
  it('Grundfall: Identifikation, Beauftragte, drei Bereichs-Module, eigenhändige Schlussformel', () => {
    const r = vaZusammenstellen(va({}));
    expect(r.aufgenommen).toEqual(expect.arrayContaining([
      'V01_identifikation', 'V02_beauftragte', 'V04_personensorge', 'V05_vermoegenssorge',
      'V06_rechtsverkehr', 'V13_ersetzt', 'V14_schluss_eigenhaendig',
    ]));
    expect(r.aufgenommen).not.toContain('V14_schluss_beurkundung');
    // Fachänderung B7: der Grundfall trägt keinen Ort – die Schlusszeile beginnt
    // deshalb direkt mit dem Datum (früher: «den 04.06.2026» mit hängendem «den»).
    expect(r.dokument.absaetze.at(-1)!.text.startsWith('04.06.2026')).toBe(true);
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'V02b_beauftragteliste')!.text)
      .toContain('Personensorge, Vermögenssorge, Vertretung im Rechtsverkehr');
  });

  it('formMode beurkundet: Beurkundungs-Schluss statt Unterschriftszeile', () => {
    const r = vaZusammenstellen(va({ formMode: 'oeffentlich_beurkundet', datum: '' }));
    expect(r.aufgenommen).toContain('V14_schluss_beurkundung');
    expect(r.aufgenommen).not.toContain('V14_schluss_eigenhaendig');
    expect(r.dokument.absaetze.at(-1)!.text).toContain('Urkundsperson');
  });

  it('Liegenschaften-Modul erzwingt die Grundstück-Sondervollmacht (Art. 396 Abs. 3 OR)', () => {
    const ohne = vaZusammenstellen(va({}));
    expect(ohne.aufgenommen).not.toContain('V07_grundstueck');
    const mit = vaZusammenstellen(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    expect(mit.aufgenommen).toContain('V07_grundstueck');
    // W2·8/B4 (Befund V-3): Der Hinweis benennt neu den Wortlaut-Befund —
    // Art. 396 Abs. 3 OR deckt veräussern/belasten, der Erwerb bedarf keiner
    // besonderen Ermächtigung; Brücke ist Art. 365 Abs. 1 ZGB.
    expect(mit.protokoll.find((p) => p.bausteinId === 'V07_grundstueck')!.hinweis)
      .toContain('Art. 365 Abs. 1 ZGB');
  });

  it('Bereichs-Module erscheinen nur, wenn der Bereich auch übertragen ist', () => {
    const r = vaZusammenstellen(va({
      beauftragte: [{ name: 'Ben', typ: 'natuerlich', angaben: 'x', bereiche: ['vermoegenssorge'] }],
      module: { personensorge: ['wohnsituation'], vermoegenssorge: ['verwaltung'], rechtsverkehr: [] },
    }));
    expect(r.aufgenommen).toContain('V05_vermoegenssorge');
    expect(r.aufgenommen).not.toContain('V04_personensorge'); // Module gewählt, Bereich aber nicht übertragen
  });

  it('Entschädigungs-Varianten erzeugen die passende Klausel', () => {
    const pausch = vaZusammenstellen(va({ entschaedigung: 'pauschale', entschaedigungBetrag: 5000 }));
    expect(pausch.dokument.absaetze.find((x) => x.bausteinId === 'V11_entschaedigung')!.text).toContain('CHF 5000 pro Jahr');
    const keine = vaZusammenstellen(va({ entschaedigung: 'keine_angabe' }));
    expect(keine.aufgenommen).not.toContain('V11_entschaedigung');
  });

  it('Eligibility-Gate blockiert ohne Handlungsfähigkeits-Bestätigung (Art. 13 ZGB)', () => {
    const g = pruefeVaGates(va({ urteilsfaehigBestaetigt: false }));
    expect(g.blocker.some((b) => b.includes('Handlungsfähigkeit'))).toBe(true);
  });

  // W2·8/B4 (Befunde V-1/V-2): Die juristische Person ist für die
  // Personensorge KEIN Blocker mehr – Art. 360 Abs. 1 ZGB erlaubt sie
  // ausdrücklich. Medizin-Fall = Warnung (Lehre + Validierungsrisiko),
  // sonst = Hinweis.
  const jpMedizin = (h: string) => h.includes('medizinischen Massnahmen') && h.includes('Art. 370 Abs. 2 ZGB');
  const jpPersonensorge = (h: string) => h.includes('auch für die Personensorge zulässig');

  it('medizinische Vertretung durch juristische Person: Warnung, kein Blocker (Art. 360 Abs. 1 ZGB)', () => {
    const g = pruefeVaGates(va({
      beauftragte: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.warnungen.some(jpMedizin)).toBe(true);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Person für die Personensorge ohne Medizin-Modul: Hinweis, kein Blocker', () => {
    const g = pruefeVaGates(va({
      beauftragte: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['wohnsituation'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(true);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.blocker).toEqual([]);
  });

  it('natürliche Person: weder Warnung noch Hinweis zur juristischen Person', () => {
    const g = pruefeVaGates(va({ module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] } }));
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
  });

  it('eigenhändige Form ohne Datum warnt (Art. 361 Abs. 2 ZGB), mit Datum nicht', () => {
    const ohne = pruefeVaGates(va({ datum: '' }));
    expect(ohne.warnungen.some((w) => w.includes('Ohne Datum ist der eigenhändige Vorsorgeauftrag ungültig'))).toBe(true);
    const mit = pruefeVaGates(va({}));
    expect(mit.warnungen.some((w) => w.includes('Ohne Datum'))).toBe(false);
    // Beurkundete Form: Ort/Datum entstehen erst vor der Urkundsperson
    const notariell = pruefeVaGates(va({ formMode: 'oeffentlich_beurkundet', datum: '' }));
    expect(notariell.warnungen.some((w) => w.includes('Ohne Datum'))).toBe(false);
  });

  it('Interessenkollisions-Hinweis, sobald ein Bereich übertragen ist (Art. 365 Abs. 2/3 ZGB)', () => {
    const g = pruefeVaGates(va({}));
    expect(g.hinweise.some((h) => h.includes('Art. 365 Abs. 3 ZGB') && h.includes('Art. 365 Abs. 2 ZGB'))).toBe(true);
    // Er ersetzt keinen bestehenden Hinweis
    expect(g.hinweise.some((h) => h.includes('Validierung'))).toBe(true);
    const ohneBereich = pruefeVaGates(va({ beauftragte: [] }));
    expect(ohneBereich.hinweise.some((h) => h.includes('Art. 365 Abs. 3 ZGB'))).toBe(false);
  });

  it('ohne beauftragte Person blockiert; KESB-Validierungs-Hinweis immer', () => {
    const g = pruefeVaGates(va({ beauftragte: [] }));
    expect(g.blocker.some((b) => b.includes('360'))).toBe(true);
    expect(g.hinweise.some((h) => h.includes('363'))).toBe(true);
  });

  it('jeder Baustein trägt Begründung und Norm', () => {
    VA_SCHEMA.bausteine.forEach((b) => {
      expect(b.begruendung.length, b.id).toBeGreaterThan(5);
      expect(b.norm, b.id).toBeTruthy();
    });
  });

  // ── W2·8 / F2: Einzel- ↔ Kollektivvertretung ───────────────────────────────

  const zweiBeauftragte = [
    { name: 'Ben Muster', typ: 'natuerlich' as const, angaben: 'geb. 01.01.1985', bereiche: ['personensorge' as const] },
    { name: 'Cara Muster', typ: 'natuerlich' as const, angaben: 'geb. 02.02.1987', bereiche: ['vermoegenssorge' as const] },
  ];

  it('zwei Beauftragte + Kollektivvertretung: V02d aufgenommen, V02c nicht', () => {
    const r = vaZusammenstellen(va({ beauftragte: zweiBeauftragte, vertretung: 'gemeinsam' }));
    expect(r.aufgenommen).toContain('V02d_gemeinsam');
    expect(r.aufgenommen).not.toContain('V02c_einzeln');
    expect(r.dokument.absaetze.find((x) => x.bausteinId === 'V02d_gemeinsam')!.text).toContain('nur gemeinsam');
  });

  it('zwei Beauftragte + Einzelvertretung (Default): V02c aufgenommen, V02d nicht', () => {
    const r = vaZusammenstellen(va({ beauftragte: zweiBeauftragte }));
    expect(r.aufgenommen).toContain('V02c_einzeln');
    expect(r.aufgenommen).not.toContain('V02d_gemeinsam');
    expect(r.protokoll.find((p) => p.bausteinId === 'V02c_einzeln')!.hinweis).toContain('nicht ausdrücklich');
  });

  it('nur eine beauftragte Person: keine Vertretungsklausel – unabhängig von der Wahl', () => {
    const einzeln = vaZusammenstellen(va({}));
    expect(einzeln.aufgenommen).not.toContain('V02c_einzeln');
    expect(einzeln.aufgenommen).not.toContain('V02d_gemeinsam');
    const gemeinsam = vaZusammenstellen(va({ vertretung: 'gemeinsam' }));
    expect(gemeinsam.aufgenommen).not.toContain('V02c_einzeln');
    expect(gemeinsam.aufgenommen).not.toContain('V02d_gemeinsam');
  });

  // ── W2·8 / F1: Ersatzpersonen strukturell wie Hauptbeauftragte ─────────────

  it('juristische Ersatzperson für die Personensorge: Hinweis wie bei der Hauptbeauftragten, kein Blocker', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(true);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Ersatzperson für die Personensorge + Medizin-Modul: Warnung (Ersatz ist mit erfasst)', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['personensorge'] }],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    }));
    expect(g.warnungen.some(jpMedizin)).toBe(true);
    expect(g.blocker).toEqual([]);
  });

  it('juristische Ersatzperson nur für die Vermögenssorge: keine Meldung zur juristischen Person', () => {
    const g = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel', bereiche: ['vermoegenssorge'] }],
    }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
  });

  it('juristische Ersatzperson ohne Bereichs-Wahl: Meldung, wenn Personensorge übertragen ist (implizit alle)', () => {
    const mitPersonensorge = pruefeVaGates(va({
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel' }],
    }));
    expect(mitPersonensorge.hinweise.some(jpPersonensorge)).toBe(true);
    // Gegenprobe: ohne übertragene Personensorge greift die Prüfung nicht
    const ohnePersonensorge = pruefeVaGates(va({
      beauftragte: [{ name: 'Ben', typ: 'natuerlich', angaben: 'x', bereiche: ['vermoegenssorge'] }],
      ersatzpersonen: [{ name: 'Treuhand AG', typ: 'juristisch', angaben: 'Basel' }],
    }));
    expect(ohnePersonensorge.hinweise.some(jpPersonensorge)).toBe(false);
  });

  it('fehlendes typ-Feld (Alt-Stand) wird wie «natuerlich» gelesen – keine Meldung aus dem Speicher', () => {
    const alt = { name: 'D', angaben: 'geb. 1992' } as unknown as VaAntworten['ersatzpersonen'][number];
    const g = pruefeVaGates(va({ ersatzpersonen: [alt] }));
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    expect(g.warnungen.some(jpMedizin)).toBe(false);
  });

  it('ersatzText: explizite Bereiche erscheinen im Satz, ohne Bereiche bleibt er unverändert', () => {
    const mit = vaZusammenstellen(va({
      ersatzpersonen: [{ name: 'D', typ: 'natuerlich', angaben: 'geb. 1992', bereiche: ['personensorge', 'vermoegenssorge'] }],
    }));
    const textMit = mit.dokument.absaetze.find((x) => x.bausteinId === 'V03_ersatz')!.text;
    expect(textMit).toContain('1. D (geb. 1992) für die Personensorge, die Vermögenssorge');
    const ohne = vaZusammenstellen(va({
      ersatzpersonen: [{ name: 'D', typ: 'natuerlich', angaben: 'geb. 1992' }],
    }));
    expect(ohne.dokument.absaetze.find((x) => x.bausteinId === 'V03_ersatz')!.text).toContain('1. D (geb. 1992).');
  });

  // ── W2·8 / B5: Gate-Hinweise normtreu (Restbefund aus B3/B4) ───────────────

  it('Liegenschaften-Hinweis nennt die Auftragsrecht-Brücke statt «umstritten» (Befund V-3)', () => {
    const g = pruefeVaGates(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    const h = g.hinweise.find((x) => x.startsWith('Liegenschaften gewählt:'));
    expect(h).toBeDefined();
    expect(h).toContain('Art. 396 Abs. 3 OR i.V.m. Art. 365 Abs. 1 ZGB');
    expect(h).toContain('der Erwerb bedarf keiner solchen');
    // Die frühere, den Rechtsstand verzeichnende Formulierung ist weg.
    expect(h).not.toContain('umstritten');
    // Deckungsgleich mit dem Baustein-Hinweis der Urkunde (§5: eine Aussage).
    const r = vaZusammenstellen(va({ module: { personensorge: [], vermoegenssorge: ['liegenschaften'], rechtsverkehr: [] } }));
    expect(r.protokoll.find((p) => p.bausteinId === 'V07_grundstueck')!.hinweis).toContain('Art. 365 Abs. 1 ZGB');
  });

  // W2·8 / Gegenprüfung B5 (Fachänderung, deklariert): Der Hinweis behauptete
  // die KESB-Festsetzung UNBEDINGT. Art. 366 Abs. 1 ZGB knüpft sie an zwei
  // alternative Voraussetzungen (Umfang der Aufgaben ODER üblicherweise
  // entgeltliche Leistungen) — die frühere Assertion auf «Art. 366 Abs. 1 und 2
  // ZGB» hätte den zu kategorischen Satz durchgelassen und wird ersetzt.
  it('Entschädigungs-Hinweis nennt die beiden Voraussetzungen von Art. 366 Abs. 1 ZGB (Befund B5)', () => {
    const g = pruefeVaGates(va({ entschaedigung: 'keine_angabe' }));
    const h = g.hinweise.find((x) => x.startsWith('Ohne Entschädigungsregelung'));
    expect(h).toBeDefined();
    expect(h).toContain('wenn dies nach dem Umfang der Aufgaben gerechtfertigt erscheint');
    expect(h).toContain('die Leistungen üblicherweise entgeltlich sind');
    expect(h).toContain('(Art. 366 Abs. 1 ZGB)');
    // Kostentragung bleibt belegt (Abs. 2), aber als eigener Anker.
    expect(h).toContain('zulasten der auftraggebenden Person (Abs. 2)');
    // Die unbedingte Fassung ist weg.
    expect(h).not.toContain('legt die KESB bei der Validierung eine angemessene Entschädigung fest (');
    // Bei getroffener Regelung entfällt der Hinweis (Art. 366 greift nur ohne Anordnung).
    const mit = pruefeVaGates(va({ entschaedigung: 'unentgeltlich' }));
    expect(mit.hinweise.some((x) => x.startsWith('Ohne Entschädigungsregelung'))).toBe(false);
  });

  // ── W2·8 / Gegenprüfung: Befunde B2, B6, B7 ────────────────────────────────

  // B2: Die JP-Prüfung wertete Beauftragte, die im Dokument gar nie erscheinen.
  // Dokumentliste (vaZusammenstellen) und Ersatzpersonen filtern seit je auf
  // `name.trim()`; die Gate-Prüfung der Hauptbeauftragten tat es nicht — eine
  // Zeile «+ Beauftragte Person hinzufügen» mit Typ «juristisch» erzeugte damit
  // eine Warnung über eine Person, die nirgends steht.
  it('B2: Beauftragte ohne Namen lösen keine Meldung zur juristischen Person aus', () => {
    const mitLeerzeile = {
      beauftragte: [
        { name: 'Ben Muster', typ: 'natuerlich' as const, angaben: 'geb. 01.01.1985', bereiche: ['personensorge' as const] },
        { name: '   ', typ: 'juristisch' as const, angaben: '', bereiche: ['personensorge' as const] },
      ],
      module: { personensorge: ['medizin'], vermoegenssorge: [], rechtsverkehr: [] },
    };
    const g = pruefeVaGates(va(mitLeerzeile));
    expect(g.warnungen.some(jpMedizin)).toBe(false);
    expect(g.hinweise.some(jpPersonensorge)).toBe(false);
    // Der Beleg der Asymmetrie: die namenlose Zeile steht in keinem Absatz.
    const r = vaZusammenstellen(va(mitLeerzeile));
    expect(r.dokument.absaetze.filter((x) => x.bausteinId === 'V02b_beauftragteliste')).toHaveLength(1);
    // Gegenprobe: mit Namen greift die Warnung weiterhin.
    const mitName = pruefeVaGates(va({
      ...mitLeerzeile,
      beauftragte: [mitLeerzeile.beauftragte[0], { ...mitLeerzeile.beauftragte[1], name: 'Treuhand AG' }],
    }));
    expect(mitName.warnungen.some(jpMedizin)).toBe(true);
  });

  // B6: Anker-Präzision. V02c/V02d regeln die ART der Aufgabenerfüllung
  // (Art. 360 Abs. 2 ZGB — Umschreibung der Aufgaben und Weisungen), nicht die
  // Übertragung selbst (Abs. 1); konsistent mit V04b/V05b/V06b. V13_ersetzt
  // trägt beide Absätze: Abs. 1 den Widerruf in Errichtungsform, Abs. 3 die
  // Rechtsfolge «tritt an die Stelle des früheren».
  it('B6: Norm-Anker von V02c/V02d (Art. 360 Abs. 2) und V13_ersetzt (Art. 362 Abs. 1 und 3)', () => {
    const norm = (id: string) => VA_SCHEMA.bausteine.find((b) => b.id === id)!.norm;
    expect(norm('V02c_einzeln')).toBe('Art. 360 Abs. 2 ZGB');
    expect(norm('V02d_gemeinsam')).toBe('Art. 360 Abs. 2 ZGB');
    expect(norm('V13_ersetzt')).toBe('Art. 362 Abs. 1 und 3 ZGB');
    // Gegenprobe: die Übertragungs-Bausteine bleiben bei Abs. 1.
    expect(norm('V02_beauftragte')).toBe('Art. 360 Abs. 1 ZGB');
    expect(norm('V04_personensorge')).toBe('Art. 360 Abs. 1 ZGB');
  });

  // B7: Ohne Ort rendert die Schlusszeile kein hängendes «den».
  it('B7: ortDatumZeile — ohne Ort nur das Datum, mit Ort «Ort, den Datum»', () => {
    const zeile = (over: Partial<VaAntworten>) =>
      vaZusammenstellen(va(over)).dokument.absaetze
        .find((x) => x.bausteinId === 'V14_schluss_eigenhaendig')!.text.split('\n')[0];
    expect(zeile({ ort: undefined })).toBe('04.06.2026');
    expect(zeile({ ort: '   ' })).toBe('04.06.2026');
    expect(zeile({ ort: 'Basel' })).toBe('Basel, den 04.06.2026');
    // Fehlt auch das Datum, bleibt der Ausfüll-Strich – ohne «den».
    expect(zeile({ ort: undefined, datum: '' })).toBe('________');
    expect(zeile({ ort: 'Basel', datum: '' })).toBe('Basel, den ________');
  });

  // ── W2·8 / B5: SSoT-Verdrahtung Beurkundung (Befund F6) ────────────────────
  //
  // Die Vorlagen-Engine führt keinen eigenen Kantons-Katalog mehr. Der Beleg
  // dafür ist kein Text-Vergleich, sondern die Deckungsgleichheit der beiden
  // Stammdaten-Quellen, aus denen die UI den Hinweis speist: für jeden Kanton
  // muss ein Notariats-Eintrag existieren und die Beurkundungs-Engine ein
  // Ergebnis liefern (ok mit Norm+Stand ODER ehrliches «offen», nie leer).
  it('Beurkundungs-Hinweis speist sich aus den Stammdaten – für alle 26 Kantone auflösbar', () => {
    KANTONE.forEach((k) => {
      const n = NOTARIATE[k];
      expect(n?.stelle, k).toBeTruthy();
      expect(NOTARIAT_SYSTEM_LABEL[n.system], k).toBeTruthy();
      const r = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: k });
      if (r.status === 'ok') {
        expect(r.posten, k).not.toBeNull();
        expect(r.posten!.quelle.erlassName, k).toBeTruthy();
        expect(r.posten!.quelle.artikel, k).toBeTruthy();
        expect(r.posten!.quelle.stand, k).toBeTruthy();
      } else {
        expect(r.posten, k).toBeNull();
        expect(r.hinweise.length, k).toBeGreaterThan(0);
      }
    });
  });

  it('die drei belegten Abweichungen des gestrichenen Katalogs sind aufgelöst (TG/BE/SG)', () => {
    // TG: der alte Katalog behauptete «gemischtes System» – Stammdatum ist Amtsnotariat.
    expect(NOTARIATE.TG.system).toBe('amtsnotariat');
    // BE: alter Richtwert «ab ca. CHF 500» – der Tarif nennt ein Minimum von CHF 300.
    const be = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: 'BE' });
    expect(be.status).toBe('ok');
    expect(be.posten!.quelle.erlassNr).toBe('BSG 169.81');
    expect(be.posten!.ergebnis.deterministisch ? '' : be.posten!.ergebnis.hinweis).toContain('300');
    // SG: alter Richtwert «ca. CHF 400» – der Tarif nennt den Rahmen 110–1100.
    const sg = berechneBeurkundung({ geschaeftsart: 'vorsorgeauftrag', kanton: 'SG' });
    expect(sg.status).toBe('ok');
    expect(sg.posten!.ergebnis.deterministisch).toBe(false);
    expect(sg.posten!.ergebnis.deterministisch ? undefined : sg.posten!.ergebnis.vonChf).toBe(110);
    expect(sg.posten!.ergebnis.deterministisch ? undefined : sg.posten!.ergebnis.bisChf).toBe(1100);
  });
});

// ─── DOCX-Renderer (Teil II «Ausgabe & Export») ──────────────────────────────

import { docxAbsaetze } from '../lib/vorlagen/vorlagenDocx';
import { BANNER_UNTERSCHREIBEN } from '../lib/vorlagen/vorlagenPdf';

describe('Vorlagen-DOCX (eine Quelle, mehrere Renderer)', () => {
  it('deterministisch und inhaltsgleich mit dem Dokumentmodell (inkl. Banner)', () => {
    const e = pvZusammenstellen(pv({ situationen: ['terminal'], ziel: 'palliativ' }));
    const a1 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    const a2 = docxAbsaetze(e, BANNER_UNTERSCHREIBEN);
    expect(JSON.stringify(a1)).toBe(JSON.stringify(a2));
    // Formhinweis sichtbar im Kopf
    expect(a1[0]).toEqual({ typ: 'banner-titel', text: BANNER_UNTERSCHREIBEN.titel });
    // Jeder Modell-Absatz erscheint im DOCX (identischer Inhalt)
    const texte = a1.map((x) => x.text).join('\n');
    e.dokument.absaetze.forEach((abs) => {
      abs.text.split('\n').forEach((zeile) => expect(texte).toContain(zeile));
      if (abs.ueberschrift) expect(texte).toContain(abs.ueberschrift);
    });
    expect(texte).toContain(e.dokument.titel);
    expect(texte).toContain(e.dokument.disclaimer);
    expect(texte).toContain(`Bausteine v${e.dokument.version}`);
  });
});

// ── Formatvorlagen-Renderer (Review-Zusatztests 5.6.2026) ───────────────────

describe('Formatvorlagen (DOCX-Absatzmodell)', () => {
  it('eingabe: kein Dokumenttitel – der fette Betreff trägt ihn; Rollen durchgereicht', async () => {
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const r = sgZusammenstellen({
      ...SG_DEFAULTS,
      streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'Forderung', datum: '2026-06-05',
    });
    expect(r.dokument.format).toBe('eingabe');
    const liste = docxAbsaetze(r);
    expect(liste.some((x) => x.typ === 'titel')).toBe(false);
    expect(liste.some((x) => x.typ === 'absatz' && x.rolle === 'betreff')).toBe(true);
    expect(liste.some((x) => x.typ === 'absatz' && x.rolle === 'datumzeile')).toBe(true);
    // langes Datumsformat in der Datumszeile
    expect(liste.find((x) => x.typ === 'absatz' && x.rolle === 'datumzeile')?.text).toContain('5. Juni 2026');
  });

  it('verfuegung: Dokumenttitel vorhanden (Gegenprobe)', () => {
    const r = pvZusammenstellen(pv({}));
    expect(r.dokument.format).toBe('verfuegung');
    expect(docxAbsaetze(r).some((x) => x.typ === 'titel')).toBe(true);
  });
});

// ── Audit-Regressionen 5.6.2026 ─────────────────────────────────────────────

describe('Audit-Fixes Vorlagen', () => {
  it('H1: Vorlagen-PDF-Text verdreht KEINE Datums-Muster im Freitext (Betreibungsnummer bleibt)', async () => {
    const { vorlagenPdfText } = await import('../lib/vorlagen/vorlagenPdf');
    expect(vorlagenPdfText('Betreibung Nr. 2025-12-31 des Betreibungsamts')).toContain('2025-12-31');
    expect(vorlagenPdfText('Forderung Nr. 2024-13-99')).toContain('2024-13-99');
  });

  it('M2: PV-R6 erkennt normalisierte Umgehungen (Doppel-Leerzeichen, Bindestrich, Zeilenumbruch, getrennt)', () => {
    const f = (text: string) => pruefePvGates({ ...PV_DEFAULTS, einstellungLeben: text }).blocker.length > 0;
    expect(f('Ich wünsche aktive  Sterbehilfe')).toBe(true);
    expect(f('aktive-sterbehilfe')).toBe(true);
    expect(f('aktive\nSterbehilfe')).toBe(true);
    expect(f('Kontakt zu einer Sterbehilfe Organisation')).toBe(true);
    expect(f('Ich wünsche palliative Begleitung')).toBe(false);
  });

  it('M1: Testament warnt bei Einzelquoten ausserhalb 0–100 % auch wenn die Summe 100 ergibt', async () => {
    const { pruefeGates, TESTAMENT_DEFAULTS } = await import('../lib/vorlagen/testament');
    const r = pruefeGates({
      ...TESTAMENT_DEFAULTS,
      vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X 1',
      ortErrichtung: 'Basel', datumErrichtung: '2026-06-05',
      erben: [
        { name: 'E1', angaben: '', quoteProzent: -50 },
        { name: 'E2', angaben: '', quoteProzent: 150 },
      ],
    });
    expect(r.warnungen.join()).toMatch(/ungültig/);
  });
});

// ── Formatvorlagen-SSoT + AusgabeArt (Grundlagen-Berichte 5.6.2026) ─────────

describe('Formatvorlagen (AusgabeArt-Matrix)', () => {
  it('Matrix hart kodiert: abschrift ohne DOCX; entwurf mit Wasserzeichen; Eingabe mit Korrekturrand', async () => {
    const { AUSGABE_REGELN, FORMAT_TYPOGRAFIE } = await import('../lib/vorlagen/formatvorlagen');
    expect(AUSGABE_REGELN.abschrift.docxErlaubt).toBe(false);
    expect(AUSGABE_REGELN.entwurf.wasserzeichen).toBe('ENTWURF');
    expect(AUSGABE_REGELN.fertig.docxErlaubt).toBe(true);
    expect(FORMAT_TYPOGRAFIE.eingabe.randRechts).toBeGreaterThan(FORMAT_TYPOGRAFIE.eingabe.randLinks);
    expect(FORMAT_TYPOGRAFIE.eingabe.docx.randRechtsTwips).toBeGreaterThan(FORMAT_TYPOGRAFIE.eingabe.docx.randLinksTwips);
  });

  it('ausgabeArt je Schema: Testament=abschrift; PV=fertig; VA eigenhändig=abschrift / beurkundet=ENTWURF', async () => {
    const { TESTAMENT_SCHEMA } = await import('../lib/vorlagen/testament');
    expect(TESTAMENT_SCHEMA.ausgabeArt).toBe('abschrift');
    expect(pvZusammenstellen(pv({})).dokument.ausgabeArt).toBe('fertig');
    const { vaZusammenstellen, VA_DEFAULTS } = await import('../lib/vorlagen/vorsorgeauftrag');
    expect(vaZusammenstellen({ ...VA_DEFAULTS, formMode: 'eigenhaendig' }).dokument.ausgabeArt).toBe('abschrift');
    expect(vaZusammenstellen({ ...VA_DEFAULTS, formMode: 'oeffentlich_beurkundet' }).dokument.ausgabeArt).toBe('entwurf');
  });

  it('DOCX-Sperre für Abschreibe-Mustertexte greift hart (Form-Gate-Matrix)', async () => {
    const { vorlagenDocxErzeugen } = await import('../lib/vorlagen/vorlagenDocx');
    const { testamentZusammenstellen, TESTAMENT_DEFAULTS } = await import('../lib/vorlagen/testament');
    const t = testamentZusammenstellen({ ...TESTAMENT_DEFAULTS, vorname: 'A', nachname: 'B' });
    await expect(vorlagenDocxErzeugen(t, { dateiName: 'x.docx' })).rejects.toThrow(/gesperrt/);
  });

  it('Eingabe-Anatomie: Anrede, Schlussformel und Doppel-Vermerk im Schlichtungsgesuch (Usanz-Bausteine)', async () => {
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const r = sgZusammenstellen({
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'Forderung', datum: '2026-06-05',
    });
    const rollen = r.dokument.absaetze.map((x) => x.rolle);
    expect(rollen).toContain('anrede');
    expect(rollen).toContain('schlussformel');
    const texte = r.dokument.absaetze.map((x) => x.text).join('\n');
    expect(texte).toMatch(/Sehr geehrte Damen und Herren/);
    expect(texte).toMatch(/Hiermit stelle ich folgende/);
    expect(texte).toMatch(/im Doppel/);
    // Reihenfolge: Anrede VOR den Rechtsbegehren, Schlussformel VOR der Unterschrift
    const ids = r.dokument.absaetze.map((x) => x.bausteinId);
    expect(ids.indexOf('anrede')).toBeLessThan(ids.findIndex((i) => i === 'rechtsbegehren'));
    expect(ids.indexOf('schlussformel')).toBeLessThan(ids.indexOf('unterschrift'));
  });
});

describe('Vorschau ≙ Output (werkgetreuer Renderer, 5.6.2026)', () => {
  it('Vorschau interpretiert dieselben MUSTER wie PDF/DOCX (SSoT) – Anatomie-Stichproben', async () => {
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    const { VorschauPanel } = await import('../components/vorlagen/wizard');
    const { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const sg = sgZusammenstellen({
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ typ: 'juristisch', firma: 'X GmbH', sitzStrasse: 'S 2', sitzPlz: '4051', sitzOrt: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'F', datum: '2026-06-15', ort: 'Basel',
    });
    const html = renderToString(React.createElement(VorschauPanel, { ergebnis: sg }));
    // Darstellung deklariert angepasst (18.6.2026, Variante A «Dokument-Handwerk»):
    // Vorschau liest die Masse/Stile aus der SSoT (vorschauStil.ts), nicht mehr aus
    // hartkodierten Tailwind-Klassen. Geprüft bleibt die ANATOMIE-Interpretation
    // (dieselben MUSTER wie PDF/DOCX), jetzt am neuen Schriftbild.
    expect(html).toContain('klagende Partei');                       // Parteirolle als Overline
    expect(html).not.toContain('— klagende Partei —');               // Em-Striche nur im Assemble-Text, nicht in der Anzeige
    expect(html).toMatch(/text-transform:uppercase[^>]*>klagende Partei</); // ruhige Versal-Overline
    expect(html).toMatch(/>gegen</);                                 // «gegen» vorhanden
    expect(html).toContain('display:grid');                          // hängender Einzug (Begehren-Grid)
    expect(html).toContain('border-bottom:1px solid var(--ink-600)'); // gezeichnete Unterschriftslinie
    expect(html).toContain('font-variant-numeric:tabular-nums');     // tabellarische Ziffern (Variante A)
    expect(html).not.toContain('___________');                       // kein Roh-Unterstrich
    expect(html).not.toMatch(/text-align:center[^>]*>Schlichtungsgesuch/); // kein Doppeltitel (Eingabe trägt Titel im Betreff)
  });
});

describe('Behörden-Grundgerüst für Eingaben (5.6.2026)', () => {
  it('Registry: jede hinterlegte Adresse ist VOLLSTÄNDIG (Strasse mit Hausnummer, PLZ+Ort, Quelle, Stand)', async () => {
    const { BEHOERDEN } = await import('../lib/vorlagen/behoerden');
    for (const [art, kantone] of Object.entries(BEHOERDEN)) {
      for (const [kanton, b] of Object.entries(kantone)) {
        expect(b!.name, `${art}/${kanton}`).toBeTruthy();
        expect(b!.strasse, `${art}/${kanton} Strasse`).toMatch(/\d/);      // Hausnummer!
        expect(b!.plzOrt, `${art}/${kanton} PLZ`).toMatch(/^\d{4} .+/);
        expect(b!.quelle, `${art}/${kanton} Quelle`).toBeTruthy();
        expect(b!.stand, `${art}/${kanton} Stand`).toMatch(/\d{4}/);
      }
    }
  });

  it('SG: BS löst die amtliche Volladresse auf (Bäumleingasse 5); anderer Kanton ohne Handadresse blockiert', async () => {
    const { sgZusammenstellen, sgMaengel, SG_DEFAULTS, SG_PERSON_NATUERLICH } = await import('../lib/vorlagen/schlichtungsgesuchBs');
    const basis = {
      ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung' as const, baselForumBestaetigt: true,
      klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
      beklagte: [{ ...SG_PERSON_NATUERLICH, vorname: 'C', name: 'D', strasse: 'S 2', plz: '4052', ort: 'Basel' }],
      geld: { betrag: '1000' }, streitgegenstand: 'F', datum: '2026-06-15', ort: 'Basel',
    };
    const t = sgZusammenstellen(basis).dokument.absaetze.map((x) => x.text).join('\n');
    expect(t).toContain('Bäumleingasse 5');
    expect(t).toContain('4001 Basel');
    expect(t).not.toContain('Postfach 964');
    // anderer Kanton: Mangel bis zur Auflösung; mit Hand- ODER aufgelöster Adresse nutzbar
    // (deklarierte Änderung 5.6.2026 — kantonsübergreifender Ausbau)
    expect(sgMaengel({ ...basis, gerichtsKanton: 'ZH' }).map((x) => x.text).join()).toMatch(/bestimmen/);
    const mitAufloesung = { ...basis, gerichtsKanton: 'ZH' as const, behoerdeAufgeloest: { zeilen: ['Friedensrichteramt Adliswil', 'Zürichstrasse 10', '8134 Adliswil'] } };
    expect(sgMaengel(mitAufloesung)).toEqual([]);
    expect(sgZusammenstellen(mitAufloesung).dokument.absaetze.map((x) => x.text).join('\n')).toContain('Zürichstrasse 10');
    const mitHand = { ...basis, gerichtsKanton: 'ZH' as const, behoerdeManuellAktiv: true, behoerdeManuell: { name: 'Friedensrichteramt Zürich, Kreise 1+2', strasse: 'Wengistrasse 30', plzOrt: '8004 Zürich' } };
    expect(sgMaengel(mitHand).map((x) => x.text).join()).not.toMatch(/bestimmen/);
    expect(sgZusammenstellen(mitHand).dokument.absaetze.map((x) => x.text).join('\n')).toContain('Wengistrasse 30');
    // unvollständige Handadresse blockiert
    expect(sgMaengel({ ...mitHand, behoerdeManuell: { name: 'X', strasse: '', plzOrt: '' } }).map((x) => x.text).join()).toMatch(/vollständig erfassen/);
  });
});
