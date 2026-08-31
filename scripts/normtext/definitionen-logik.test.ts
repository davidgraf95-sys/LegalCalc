// ─── R6.2 · Belegfall-Tests zu den GP-Befunden vom 31.8.2026 ─────────────────
//
// Jeder Satz hier ist WÖRTLICH aus dem Korpus (public/normtext/**, Stand des
// Laufs 31.8.2026) — keine konstruierten Beispiele, §7. Die Fälle sind die
// Belegfälle der Gegenprüfung (B1: invertierte Fiktionen raus, B2: Rollen-
// nomen raus, B4: Legende-Köpfe mit Unterliste rein) plus die Positiv-
// Gegenproben, die beweisen, dass die Guards NICHT überfeuern.
//
// Rot-Beweis: diese Datei war vor dem R6.2-Fix ROT (B1/B2: als-gilt-Treffer
// statt null; B4: keine Einträge) — Lauf dokumentiert im R6.2-Bericht.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { NormSnapshot } from '../../src/lib/normtext/typen';
import { definitionenAusEintrag, istPartizip2, regelnAufSatz } from './definitionen-logik';

// ─── B1 — invertierte Fiktionen feuern NICHT mehr als `als-gilt` ─────────────

const B1_FIKTIONEN: Array<[string, string]> = [
  ['bund/OR/art_395', 'Als angenommen gilt ein nicht sofort abgelehnter Auftrag, wenn er sich auf die Besorgung solcher Geschäfte bezieht, die der Beauftragte kraft obrigkeitlicher Bestellung oder gewerbsmässig betreibt oder zu deren Besorgung er sich öffentlich empfohlen hat.'],
  ['bund/FIDLEV/art_2', 'Als nicht in der Schweiz erbracht gelten:'],
  ['kanton/BS/291.900/art_9', 'Als nicht bestanden gilt das Anwaltsexamen ebenfalls bei Rückzug der Bewerbung nach Beginn der Prüfungen.'],
  ['bund/AVIV/art_51_a', 'Als bestandene Karenztage gelten nur Ausfalltage, für die der Arbeitnehmer im Arbeitsverhältnis stand und vom Arbeitgeber eine mindestens der Kurzarbeitsentschädigung entsprechende Vergütung erhalten hat.'],
  ['kanton/BS/153.270/art_17', 'Als nicht fertig gestellt gilt eine Aufzeichnung insbesondere, wenn:'],
  ['kanton/BS/772.140/art_4', 'Als nicht einbringbar gilt eine Forderung dann, wenn auch die Stromlieferanten ihre Forderungen für den Stromverkauf abschreiben.'],
  ['kanton/AR/412.01/art_15', 'Als entschuldigt gelten Absenzen wegen Krankheit, Unfall, Arztbesuch, familiärer Ereignisse oder zwecks Teilnahme an einer berufswahl- oder talentorientierten Veranstaltung und dergleichen.'],
  ['bund/CHEMRRV/annex_1_7', 'Als erteilte Bewilligung im Sinne von Absatz 1 gilt eine Bewilligung, die gestützt auf Ziffer 2.2 Absatz 1 dieses Anhangs in der Fassung vom 1. Juli 2015 erteilt wurde.'],
];

describe('B1 — invertierte Fiktionen in als-gilt (GP 31.8.2026)', () => {
  it.each(B1_FIKTIONEN)('%s liefert keinen als-gilt-Eintrag', (_id, satz) => {
    const t = regelnAufSatz(satz);
    expect(t?.muster === 'als-gilt' ? t : null).toBeNull();
  });
});

// ─── Positiv-Gegenproben — die «Als Fahrnis gelten …»-Klasse bleibt drin ─────
// Bewusst so gewählt, dass jeder Guard einzeln NICHT überfeuert:
//  · attributives Partizip vor Substantiv bleibt (StPO 111, AHVG 5)
//  · «gilt nur» OHNE Partizip-Erstwort bleibt (USG 7)
//  · prädikatives Adjektiv ohne Partizip bleibt (ATSG 9)
//  · Adjektiv + Substantiv bleibt (AsylG 3)

const POSITIV: Array<[string, string, string]> = [
  ['bund/AHVG/art_5', 'massgebender Lohn', 'Als massgebender Lohn gilt jedes Entgelt für in unselbständiger Stellung auf bestimmte oder unbestimmte Zeit geleistete Arbeit.'],
  ['bund/STPO/art_111', 'beschuldigte Person', 'Als beschuldigte Person gilt die Person, die in einer Strafanzeige, einem Strafantrag oder von einer Strafbehörde in einer Verfahrenshandlung einer Straftat verdächtigt, beschuldigt oder angeklagt wird.'],
  ['bund/ASYLG/art_3', 'ernsthafte Nachteile', 'Als ernsthafte Nachteile gelten namentlich die Gefährdung des Leibes, des Lebens oder der Freiheit sowie Massnahmen, die einen unerträglichen psychischen Druck bewirken.'],
  ['bund/USG/art_7', 'Boden', 'Als Boden gilt nur die oberste, unversiegelte Erdschicht, in der Pflanzen wachsen können.'],
  ['bund/ATSG/art_9', 'hilflos', 'Als hilflos gilt eine Person, die wegen der Beeinträchtigung der Gesundheit für alltägliche Lebensverrichtungen dauernd der Hilfe Dritter oder der persönlichen Überwachung bedarf.'],
];

describe('Positiv-Gegenproben — echte Definitionen bleiben als-gilt', () => {
  it.each(POSITIV)('%s → «%s»', (_id, begriff, satz) => {
    const t = regelnAufSatz(satz);
    expect(t?.muster).toBe('als-gilt');
    expect(t?.begriff).toBe(begriff);
  });
});

// ─── B2 — funktionale Rollennomen als Erstwort feuern nicht ──────────────────

const B2_ROLLEN: Array<[string, string]> = [
  ['bund/UVV/art_22 (Grundlage)', 'Als Grundlage für die Bemessung der Taggelder gilt der letzte vor dem Unfall bezogene Lohn, einschliesslich noch nicht ausbezahlter Lohnbestandteile, auf die ein Rechtsanspruch besteht.'],
  ['bund/DBG/art_61_a (Beginn)', 'Als Beginn der Steuerpflicht gelten die Verlegung von Vermögenswerten, Betrieben, Teilbetrieben oder Funktionen aus dem Ausland in einen inländischen Geschäftsbetrieb oder in eine inländische Betriebsstätte, das Ende einer Steuerbefreiung nach Artikel 56 sowie die Verlegung des Sitzes oder der tatsächlichen Verwaltung in die Schweiz.'],
  ['kanton/BS/BeE 411.500/art_15 (Stichtag)', 'Als Stichtag gilt der 1. September des betreffenden Jahres.'],
];

describe('B2 — Rollennomen-Erstwort (GP 31.8.2026)', () => {
  it.each(B2_ROLLEN)('%s liefert keinen als-gilt-Eintrag', (_id, satz) => {
    const t = regelnAufSatz(satz);
    expect(t?.muster === 'als-gilt' ? t : null).toBeNull();
  });

  it('Gegenprobe: «Steuerperiode» ist Begriff, kein Rollennomen', () => {
    const t = regelnAufSatz('Als Steuerperiode gilt das Kalenderjahr.');
    expect(t?.muster).toBe('als-gilt');
    expect(t?.begriff).toBe('Steuerperiode');
  });
});

// ─── istPartizip2 — die endliche morphologische Regel ────────────────────────

describe('istPartizip2 (morphologische Regel, dokumentiert im Katalog-Kopf)', () => {
  it.each(['angenommen', 'entschuldigt', 'unentschuldigt', 'bestandene', 'erteilte', 'anerkannt', 'qualifiziert', 'abgelaufen', 'verkürzt', 'gebunden'])('%s → Partizip II', (w) => {
    expect(istPartizip2(w)).toBe(true);
  });
  it.each(['massgebender', 'entsprechenden', 'hilflos', 'persistent', 'fachgerecht', 'lebend', 'Boden', 'nicht', 'wichtige'])('%s → kein Partizip II', (w) => {
    expect(istPartizip2(w)).toBe(false);
  });
});

// ─── B4 — Legende-Kopf mit Unterliste wird aufgenommen ───────────────────────

/** Minimal-Fixture nach dem Muster DSG Art. 5 (Kopf-Item + tiefe-1-Kinder). */
const FIXTURE: NormSnapshot = {
  id: 'bund/TESTG/art_1',
  ebene: 'bund',
  quelle: 'TESTG',
  erlass: 'TESTG',
  artikel: '1',
  artikelLabel: 'Art. 1',
  stand: '2026-01-01',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/0000/de',
  abgerufen: '2026-08-31',
  bloecke: [{
    absatz: '1',
    text: 'In diesem Gesetz bedeuten:',
    items: [
      { marke: 'a', text: 'Probedaten: alle Angaben zur Probe;' },
      { marke: 'b', text: 'besonders heikle Probedaten:' },
      { marke: '1', text: 'Daten über die Farbe,', tiefe: 1 },
      { marke: '2', text: 'Daten über die Form;', tiefe: 1 },
      { marke: 'c', text: 'Prüfen: jeder Umgang mit Probedaten.' },
    ],
  }],
} as unknown as NormSnapshot;

describe('B4 — Legende-Kopf mit Unterlisten-Zitat (GP 31.8.2026)', () => {
  it('nimmt den Kopf mit wörtlichem Kopf+Kinder-Zitat auf', () => {
    const eintraege = definitionenAusEintrag(FIXTURE, 'bund/TESTG');
    const kopf = eintraege.find((e) => e.begriff === 'besonders heikle Probedaten');
    expect(kopf).toBeDefined();
    expect(kopf?.muster).toBe('legende-einleitung');
    expect(kopf?.norm.item).toBe(1);
    expect(kopf?.zitat).toBe('besonders heikle Probedaten:\nDaten über die Farbe,\nDaten über die Form;');
  });

  it('lässt die normalen Legende-Items unverändert', () => {
    const eintraege = definitionenAusEintrag(FIXTURE, 'bund/TESTG');
    expect(eintraege.map((e) => e.begriff)).toEqual(['Probedaten', 'besonders heikle Probedaten', 'Prüfen']);
  });

  it('Kopf OHNE Unterpunkte bleibt draussen (reiner Gliederungskopf)', () => {
    const ohneKinder = {
      ...FIXTURE,
      bloecke: [{
        absatz: '1',
        text: 'In diesem Gesetz bedeuten:',
        items: [{ marke: 'a', text: 'leerer Kopf:' }],
      }],
    } as unknown as NormSnapshot;
    expect(definitionenAusEintrag(ohneKinder, 'bund/TESTG')).toEqual([]);
  });
});

// ─── B4 — Regression: die 8 GP-Belegfälle stehen im Artefakt ─────────────────

const B4_ARTEFAKT: Array<[string, string]> = [
  ['bund/DSG/art_5', 'besonders schützenswerte Personendaten'],
  ['bund/FAV/art_2', 'Schnittstelle'],
  ['bund/FIDLEG/art_3', 'Finanzinstrumente'],
  ['bund/FINFRAG/art_2', 'Finanzmarktinfrastruktur'],
  ['bund/MWSTG/art_3', 'Lieferung'],
  ['bund/MWSTG/art_3', 'eng verbundene Personen'],
  ['bund/VVEA/art_3', 'Siedlungsabfälle'],
  ['bund/VVEA/art_3', 'Quecksilberabfälle'],
];

describe('B4 — Regression gegen public/normtext/definitionen.json', () => {
  const datei = JSON.parse(readFileSync('public/normtext/definitionen.json', 'utf8')) as {
    eintraege: Array<{ begriff: string; zitat: string; norm: { id: string } }>;
  };
  it.each(B4_ARTEFAKT)('%s trägt «%s»', (id, begriff) => {
    const e = datei.eintraege.find((x) => x.norm.id === id && x.begriff === begriff);
    expect(e).toBeDefined();
    expect(e?.zitat.startsWith(`${begriff}:`)).toBe(true);
    expect(e?.zitat).toContain('\n');
  });
});
