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
