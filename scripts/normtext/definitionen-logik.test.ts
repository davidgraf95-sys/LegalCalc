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

// ═══ R6.3 · Belegfall-Tests zu den GP-Befunden Runde 2 vom 31.8.2026 ═════════
// Sätze wörtlich aus dem Korpus (§7). Rot-Beweis: vor dem R6.3-Fix rot,
// Lauf dokumentiert im R6.3-Bericht.

// ─── F1 — Doppelpunkt-Kopf erhält die Aufzählung als Definiens ───────────────

/** Minimal-Fixture nach dem Muster AIG Art. 42 Abs. 2 (Blocktext-Kopf + Items). */
const F1_FIXTURE: NormSnapshot = {
  id: 'bund/TESTG/art_2',
  ebene: 'bund',
  quelle: 'TESTG',
  erlass: 'TESTG',
  artikel: '2',
  artikelLabel: 'Art. 2',
  stand: '2026-01-01',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/0000/de',
  abgerufen: '2026-08-31',
  bloecke: [{
    absatz: '2',
    text: 'Als Familienangehörige gelten:',
    items: [
      { marke: 'a', text: 'der Ehegatte und die Verwandten in absteigender Linie, die jünger als 21 Jahre alt sind;' },
      { marke: 'b', text: 'die eigenen Verwandten und die Verwandten des Ehegatten in aufsteigender Linie, denen Unterhalt gewährt wird.' },
    ],
  }],
} as unknown as NormSnapshot;

describe('F1 — als-gilt-Kopf auf «:» trägt die Block-Aufzählung als Definiens (GP R2)', () => {
  it('baut das Zitat als Kopf + Items, U+000A-verbunden', () => {
    const eintraege = definitionenAusEintrag(F1_FIXTURE, 'bund/TESTG');
    expect(eintraege).toHaveLength(1);
    expect(eintraege[0].begriff).toBe('Familienangehörige');
    expect(eintraege[0].zitat).toBe(
      'Als Familienangehörige gelten:\n'
      + 'der Ehegatte und die Verwandten in absteigender Linie, die jünger als 21 Jahre alt sind;\n'
      + 'die eigenen Verwandten und die Verwandten des Ehegatten in aufsteigender Linie, denen Unterhalt gewährt wird.',
    );
  });

  it('verwirft den Doppelpunkt-Kopf OHNE Aufzählung am Block (BOEB-Anh.-3-Klasse)', () => {
    const ohneItems = {
      ...F1_FIXTURE,
      bloecke: [{
        absatz: null,
        text: 'Als Dienstleistungen im Staatsvertragsbereich gelten die nachfolgend aufgeführten Leistungen:',
        items: [],
      }],
    } as unknown as NormSnapshot;
    expect(definitionenAusEintrag(ohneItems, 'bund/TESTG')).toEqual([]);
  });
});

// ─── F2 — Rollennomen: Plural, Komposita und der Stamm «Periode» ─────────────

const F2_ROLLEN: Array<[string, string]> = [
  ['kanton/BS/424.510/art_3 (Stichtage, Plural)', 'Als Stichtage für die Rechnungstellung gelten der 31. August und der 31. Januar.'],
  ['bund/EOV/art_21 (Zahlungsnachweise, Kompositum+Plural)', 'Als Zahlungsnachweise gelten die kasseninternen Belege, Verrechnungsausweise der Postfinance oder Belastungsanzeigen der Bank.'],
  ['kanton/BS/164.250/art_8 (Berechnungsbasis, Kompositum)', 'Als Berechnungsbasis gilt der Ferienlohn gemäss § 21a Lohngesetz im Zeitpunkt der Fälligkeit des Dienstaltersgeschenks.'],
  ['bund/KVV/art_96 Abs. 2 (Periode — Gleichbehandlung mit Abs. 3 «Zeitpunkt»)', 'Als Periode für die Feststellung, ob Leistungen in Anspruch genommen worden sind, gilt das Kalenderjahr.'],
];

describe('F2 — Rollennomen morphologisch (GP R2 31.8.2026)', () => {
  it.each(F2_ROLLEN)('%s liefert keinen als-gilt-Eintrag', (_id, satz) => {
    const t = regelnAufSatz(satz);
    expect(t?.muster === 'als-gilt' ? t : null).toBeNull();
  });

  it('Gegenprobe KVV 96 Abs. 3: «Zeitpunkt» bleibt draussen (bestehende Regel)', () => {
    expect(regelnAufSatz('Als Zeitpunkt der Inanspruchnahme einer Leistung gilt das Behandlungsdatum.')).toBeNull();
  });

  it('Gegenprobe: lexikalisierte Komposita der Exakt-Stämme bleiben Begriffe', () => {
    // Dokumentierter R6.2-Entscheid (Bibliothek §GP-Korrektur): Steuerperiode,
    // Baubeginn sind eigenständige Termini — die Stämme «Periode»/«Beginn»
    // wirken darum nur exakt, nie als Suffix.
    expect(regelnAufSatz('Als Steuerperiode gilt das Kalenderjahr.')?.begriff).toBe('Steuerperiode');
    expect(regelnAufSatz('Als Baubeginn gilt der Abbruchbeginn.')?.begriff).toBe('Baubeginn');
  });
});

// ─── F3 — Begriff mit finitem Verb ist ein Satzfragment, kein Terminus ───────

describe('F3 — Fragment-Begriff mit finitem Verb (GP R2 31.8.2026)', () => {
  it('BS 427.950 §16 Abs. 4 («können») liefert keinen Eintrag', () => {
    expect(regelnAufSatz('Als Leistungsnachweise können auch solche gelten, die ausserhalb des Bildungsgangs erworben wurden und von der Bildungsgangleitung anerkannt werden.')).toBeNull();
  });

  it('AVIV 8 («sind» im Relativsatz) geht dokumentiert mit raus', () => {
    expect(regelnAufSatz('Als Berufe, in denen häufig wechselnde oder befristete Anstellungen üblich sind, gelten insbesondere:')).toBeNull();
  });
});

// ─── F4 — Partizip-I-Restfiktion «gilt auch» ─────────────────────────────────

describe('F4 — Partizip-I-Erweiterungsfiktion (GP R2 31.8.2026)', () => {
  it('StPO 428 «Als unterliegend gilt auch …» liefert keinen Eintrag', () => {
    expect(regelnAufSatz('Als unterliegend gilt auch die Partei, auf deren Rechtsmittel nicht eingetreten wird oder die das Rechtsmittel zurückzieht.')).toBeNull();
  });

  it.each([
    ['bund/PARLG/art_22', 'rechtsetzend', 'Als rechtsetzend gelten Bestimmungen, die in unmittelbar verbindlicher und generell-abstrakter Weise Pflichten auferlegen, Rechte verleihen oder Zuständigkeiten festlegen.'],
    ['bund/FIDLEG/art_5', 'vermögend', 'Als vermögend im Sinne von Absatz 1 gilt, wer glaubhaft erklärt, dass sie oder er:'],
  ])('Gegenprobe %s: echte Adjektiv-Definition «%s» bleibt', (_id, begriff, satz) => {
    const t = regelnAufSatz(satz);
    expect(t?.muster).toBe('als-gilt');
    expect(t?.begriff).toBe(begriff);
  });

  it('Gegenprobe SchKG 286: «gelten auch» mit Substantiv-Begriff bleibt', () => {
    const t = regelnAufSatz('Als nahestehende Personen gelten auch Gesellschaften eines Konzerns.');
    expect(t?.begriff).toBe('nahestehende Personen');
  });
});
