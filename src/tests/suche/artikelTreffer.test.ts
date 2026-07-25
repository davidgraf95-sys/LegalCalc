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
