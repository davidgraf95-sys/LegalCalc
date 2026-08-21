// @vitest-environment node
// ─── W2·5: Herkunft eines Artikel-Treffers ist ehrlich ───────────────────────
//
// Seit der Kanton im selben Volltext-Index liegt wie der Bund, entscheidet allein
// die Treffer-Projektion darüber, ob ein Nutzer kantonales Recht als solches
// erkennt. Fällt sie auf den Bund-Zweig zurück, zeigt LexMetrik einen aargauischen
// Anwaltstarif als «§ 1 Anwaltstarif» mit /gesetze/bund/…-Link — er läse sich wie
// Bundesrecht und der Link wäre tot. Genau das sichert diese Datei ab (§8/D1).
//
// Kleiner synthetischer Index statt des echten Korpus: geprüft wird die
// PROJEKTION (Label · Marke · href), nicht der Recall — dafür genügen zwei
// Einträge, und der Test bleibt schnell und deterministisch (§2).
import { describe, it, expect } from 'vitest';
import * as flex from 'flexsearch';
import { baueSuchFn } from '../../lib/suche/artikelVolltext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

const leer = { m: '', n: '', g: '', tb: '', f: '' };
const EINTRAEGE = [
  { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '253', l: 'Art. 253', t: 'durch den mietvertrag verpflichtet sich der vermieter', ...leer },
  { k: 'AG-291.150', ku: 'Anwaltstarif (SAR 291.150)', eb: 'kanton' as const, kt: 'AG', a: '1', l: '§ 1', t: 'dieses dekret regelt die entschädigung des anwaltes', ...leer },
];

const suche = baueSuchFn(EINTRAEGE as never, FlexSearch);

describe('Artikel-Treffer — kantonale Herkunft ist erkennbar (W2·5)', () => {
  const kantonal = () => suche('dekret', 10).find((t) => t.href.includes('AG-291.150'));

  it('kantonaler Treffer verlinkt auf die KANTONS-Route, nicht auf /gesetze/bund', () => {
    const t = kantonal();
    expect(t).toBeDefined();
    expect(t!.href).toBe('/gesetze/kanton/AG-291.150#art-1');
    expect(t!.href).not.toContain('/gesetze/bund/');
  });

  it('kantonaler Treffer nennt seinen Kanton im Label', () => {
    expect(kantonal()!.label).toContain('AG');
  });

  it('die Kanton-Marke trägt das Kürzel und ist NICHT als redundant ausgeblendet', () => {
    const marke = kantonal()!.marke;
    expect(marke?.text).toBe('AG');
    // `redundant: true` blendet die Marke auf Mobile aus (SuchResultate.tsx:
    // max-sm:hidden). Für «Gesetzestext» ist das richtig — es wiederholt nur den
    // Gruppentitel. Das Kantonskürzel trägt dagegen Information: wäre es
    // redundant, verlöre ein Handy-Nutzer die Herkunftsangabe komplett.
    expect(marke?.redundant).toBeFalsy();
  });

  it('Bund-Treffer bleibt unverändert (Route bund, Marke «Gesetzestext»)', () => {
    const t = suche('mietvertrag', 10).find((x) => x.href.includes('/OR#'));
    expect(t).toBeDefined();
    expect(t!.href).toBe('/gesetze/bund/OR#art-253');
    expect(t!.label).toBe('Art. 253 OR');
    expect(t!.marke?.text).toBe('Gesetzestext');
  });
});

// ─── Befund 29 (Cowork 21.8.2026): «OR 257d» matchte Teilzeichenketten ──────
//
// FlexSearch verknüpfte eine Mehrwort-Anfrage bei `suggest:true` faktisch NICHT
// per UND: «OR 257d» traf jeden Artikel, dessen Marginalie/Kürzel ein Wort mit
// dem Präfix «or» führt (Ordnung, Organisation, …) — der zweite Term «257d»
// wurde von diesen zahlreichen Treffern aus dem Kandidaten-Pool verdrängt, bevor
// er je einzeln zum Zug kam. Fix: `trifftWortgrenze` + UND-Filter in
// `artikelVolltext.ts` (`suche()`).
const BEFUND29_EINTRAEGE = [
  // Trifft BEIDE Terme: «or» über das Kürzel «OR», «257d» über das Label.
  { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '257_d', l: 'Art. 257d',
    t: 'ist der mieter mit der zahlung im rückstand', m: '', n: '', g: '', tb: '', f: '' },
  // Trifft NUR «or» (Kürzel beginnt mit «Or») — «257d» kommt nirgends vor.
  { k: 'ORDNUNG', ku: 'Ordnungsbussenverordnung', eb: 'bund' as const, kt: '', a: '1', l: '§ 1',
    t: 'ordnungswidrigkeiten werden mit busse bestraft', m: '', n: '', g: '', tb: '', f: '' },
  // Trifft NUR «257d» (im Label) — «or» kommt nirgends als Wortanfang vor.
  { k: 'ZGB', ku: 'ZGB', eb: 'bund' as const, kt: '', a: '257_d', l: '§ 257d',
    t: 'diese bestimmung regelt einen anderen sachverhalt', m: '', n: '', g: '', tb: '', f: '' },
  // «or» kommt nur MITTEN im Wort vor («vorschrift») — nie an einer Wortgrenze.
  { k: 'VORTEST', ku: 'Vorschriftensammlung', eb: 'bund' as const, kt: '', a: '9', l: '§ 9',
    t: 'diese vorschrift gilt subsidiär', m: '', n: '', g: '', tb: '', f: '' },
];
const sucheBefund29 = baueSuchFn(BEFUND29_EINTRAEGE as never, FlexSearch);

describe('Befund 29 — Gesetzestext-Suche verknüpft Terme per UND (Cowork 21.8.2026)', () => {
  it('UND-Verknüpfung: «or 257d» liefert nur den Treffer, der BEIDE Terme trägt', () => {
    const treffer = sucheBefund29('or 257d', 10);
    expect(treffer.map((t) => t.id)).toContain('art:OR:257_d');
    expect(treffer.map((t) => t.id)).not.toContain('art:ORDNUNG:1'); // nur «or»
    expect(treffer.map((t) => t.id)).not.toContain('art:ZGB:257_d'); // nur «257d»
  });

  it('Wortgrenze: der kurze Term «or» trifft nicht mitten im Wort («vorschrift»)', () => {
    // Einzelterm (kein UND-Filter) — «or» darf «Ordnung» treffen, nicht «vorschrift».
    const treffer = sucheBefund29('or', 10);
    expect(treffer.map((t) => t.id)).toContain('art:ORDNUNG:1');
    expect(treffer.map((t) => t.id)).not.toContain('art:VORTEST:9');
  });

  it('längere Terme bleiben Teilwort-Suche (unverändert, kein UND-Regression)', () => {
    // «vorschrift» als eigener, längerer Term trifft weiterhin ganz normal —
    // die UND-Verschärfung betrifft nur die Kombination mehrerer Terme, nicht
    // die Teilwort-Suche eines einzelnen längeren Terms.
    const treffer = sucheBefund29('vorschrift', 10);
    expect(treffer.map((t) => t.id)).toContain('art:VORTEST:9');
  });
});

// ─── Umlaut-Befund (Gegenprüfung 21.8.2026): UND-Filter gegen roh-lowercase
// Haystack ───────────────────────────────────────────────────────────────
//
// `sucherTerme`/`tokens()` normalisiert die getippten Terme über
// `normalisiereBegriff` (NFKD, diakritika-bereinigt: «Kündigung» → «kundigung»).
// `haystack()` in artikelVolltext.ts durchlief bis zu diesem Fix nur
// `.toLowerCase()` — der Haystack behielt «kündigung» mit Umlaut. Darum traf
// `trifftWortgrenze` bei JEDER Mehrwort-Query mit Umlaut auf 0 Kandidaten
// (`'kündigung'.indexOf('kundigung') === -1`), obwohl ein Einzelterm («Kündigung»
// allein) weiterhin traf — der UND-Filter griff nur ab zwei signifikanten Termen.
const UMLAUT_EINTRAEGE = [
  { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '271', l: 'Art. 271',
    t: 'regelt die miete und die fristlose kündigung des mietverhältnisses aus wichtigen gründen',
    m: '', n: '', g: '', tb: '', f: '' },
];
const sucheUmlaut = baueSuchFn(UMLAUT_EINTRAEGE as never, FlexSearch);

describe('Umlaut-Befund — UND-Filter normalisiert den Haystack wie die Terme (Gegenprüfung 21.8.2026)', () => {
  it('«fristlose Kündigung» (2 Terme, Umlaut) findet den Artikel', () => {
    const treffer = sucheUmlaut('fristlose Kündigung', 10);
    expect(treffer.map((t) => t.id)).toContain('art:OR:271');
  });

  it('«Kündigung Miete» (2 Terme, umgekehrte Reihenfolge) findet denselben Artikel', () => {
    const treffer = sucheUmlaut('Kündigung Miete', 10);
    expect(treffer.map((t) => t.id)).toContain('art:OR:271');
  });
});

// ─── Befund B2 (Gegenprüfung 21.8.2026): UND-Filter tötet den Synonym-Recall ─
//
// `expandiereSuchbegriff('vaterschaftsurlaub')` liefert u. a. «urlaub»/«geburt»
// (s. src/tests/suchVokabular.test.ts). Ein Artikel, der das Kompositum
// «vaterschaftsurlaub» selbst nie im Wortlaut führt, aber «urlaub»/«geburt»
// enthält, kommt über die Synonym-Ausweitung in den Recall-Pool — der UND-Filter
// verlangte bislang trotzdem den LITERALEN Term und filterte ihn wieder heraus,
// sobald ein zweiter Term («lohn») dazukam.
const B2_EINTRAEGE = [
  // Trifft «vaterschaftsurlaub» NUR über die Synonyme «urlaub»/«geburt», «lohn» literal.
  { k: 'EOG', ku: 'EOG', eb: 'bund' as const, kt: '', a: '16i', l: 'Art. 16i',
    t: 'die entschädigung während des urlaubs nach der geburt eines kindes entspricht dem lohn',
    m: '', n: '', g: '', tb: '', f: '' },
  // Trifft NUR «lohn» — weder «vaterschaftsurlaub» literal noch dessen Synonyme
  // («urlaub», «geburt», …) kommen im Text vor.
  { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '322', l: 'Art. 322',
    t: 'der arbeitgeber zahlt dem arbeitnehmer den vereinbarten lohn pünktlich aus',
    m: '', n: '', g: '', tb: '', f: '' },
];
const sucheB2 = baueSuchFn(B2_EINTRAEGE as never, FlexSearch);

describe('Befund B2 — UND-Filter lässt Synonym-Treffer durch (Gegenprüfung 21.8.2026)', () => {
  it('«vaterschaftsurlaub lohn»: Kompositum+Zweitwort findet den Synonym-Kandidaten (EOG 16i)', () => {
    const treffer = sucheB2('vaterschaftsurlaub lohn', 10);
    expect(treffer.map((t) => t.id)).toContain('art:EOG:16i');
  });

  it('ein Kandidat, der auch via Synonym KEINEN der Terme trägt, bleibt gefiltert (OR 322)', () => {
    const treffer = sucheB2('vaterschaftsurlaub lohn', 10);
    expect(treffer.map((t) => t.id)).not.toContain('art:OR:322');
  });
});
