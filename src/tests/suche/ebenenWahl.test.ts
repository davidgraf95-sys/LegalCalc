// @vitest-environment node
// ─── QS-BASIS (d) K3: Ebenen-Wahl des Generators — VORBEREITET, NICHT SCHARF ──
//
// `SUCHE_INDEX_EBENEN` erlaubt es, den statischen Suchindex ohne eine Ebene zu
// bauen (Kanton = 4.26 MiB gzip = 45.2 % des Index, Messung K0). Der Schalter ist
// gebaut, aber DEFAULT AUS — die Scharfschaltung ist ein §8-Entscheid über die
// eigene Vollständigkeit und gehört David (Begründung am Schalter selbst).
//
// Dieser Test hält beide Hälften fest:
//   1. AUS  → Verhalten byte-gleich wie ohne den Schalter (sonst wäre die
//             «Vorbereitung» schon eine Änderung).
//   2. AN   → der Index trägt die Ebene wirklich nicht MEHR, und der Client meldet
//             sie über `fehlendeEbenen` als fehlend. Ohne die zweite Hälfte wäre der
//             Schalter eine stille Auskunftslücke: eine leere kantonale Trefferliste
//             ist vom «es gibt keine kantonale Bestimmung» nicht zu unterscheiden.
import { describe, it, expect } from 'vitest';
import * as flex from 'flexsearch';
import { EBENEN, gewaehlteEbenen } from '../../../scripts/such-index-generieren';
import { baueSucher } from '../../lib/suche/artikelVolltext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

describe('K3 Ebenen-Wahl: Default AUS ist wirkungslos', () => {
  it('ohne Variable → alle Ebenen, identisch zur Konstante', () => {
    expect(gewaehlteEbenen(undefined)).toEqual(EBENEN);
    expect(gewaehlteEbenen('')).toEqual(EBENEN);
    expect(gewaehlteEbenen('   ')).toEqual(EBENEN);
  });

  it('alle Ebenen ausdrücklich genannt → dasselbe wie Default', () => {
    expect(gewaehlteEbenen('bund,kanton')).toEqual(EBENEN);
    // Nenn-Reihenfolge ändert die Eintrags-Reihenfolge NICHT (§2 stabil).
    expect(gewaehlteEbenen('kanton,bund')).toEqual(EBENEN);
  });
});

describe('K3 Ebenen-Wahl: AN lässt die Ebene wirklich weg', () => {
  it('«bund» wählt nur den Bund', () => {
    expect(gewaehlteEbenen('bund')).toEqual(['bund']);
  });

  it('Trennzeichen Komma und Leerraum sind gleichwertig', () => {
    expect(gewaehlteEbenen('bund kanton')).toEqual(EBENEN);
  });

  it('Tippfehler wird LAUT, nicht still zum halben Index', () => {
    // Der Fehlmodus aus PR #313: ein halber Index, der nie rot wurde. Eine
    // unbekannte Ebene muss den Lauf abbrechen, nicht stillschweigend wegfallen.
    expect(() => gewaehlteEbenen('bnud')).toThrow(/unbekannte Ebene/);
    expect(() => gewaehlteEbenen('bund,kantonn')).toThrow(/kantonn/);
    expect(() => gewaehlteEbenen(',,')).toThrow(/keine gültige Ebene/);
  });
});

describe('K3 Ebenen-Ehrlichkeit im Client: weggelassene Ebene wird als fehlend gemeldet', () => {
  const leer = { m: '', n: '', g: '', tb: '', f: '' };
  const NUR_BUND = [
    { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '253', l: 'Art. 253', t: 'miete des vermieters', ...leer },
  ];
  const BEIDE = [
    ...NUR_BUND,
    { k: 'AI-640.000', ku: 'StG (GS 640.000)', eb: 'kanton' as const, kt: 'AI', a: '116', l: 'Art. 116', t: 'handänderungssteuer', ...leer },
  ];

  it('Index OHNE kantonale Einträge → «kanton» gilt NICHT als bereit', () => {
    const s = baueSucher(NUR_BUND as never, FlexSearch);
    s.ergaenze('bund');
    s.ergaenze('kanton'); // liefert nichts — darf darum nicht eingehängt werden
    expect(s.bereiteEbenen()).toEqual(['bund']);
    // Genau daraus baut artikelVolltext.baue() `fehlendeEbenen`:
    const fehlend = EBENEN.filter((eb) => !s.bereiteEbenen().includes(eb));
    expect(fehlend).toEqual(['kanton']);
  });

  it('auch gestaffelt: eine leere Ebene rückt nicht als «bereit» nach', async () => {
    const s = baueSucher(NUR_BUND as never, FlexSearch);
    s.ergaenze('bund');
    await s.ergaenzeGestaffelt('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund']);
  });

  it('VERHALTENSNEUTRAL für den heutigen Voll-Index: beide Ebenen bleiben bereit', () => {
    // Die Regel darf den Normalfall nicht anfassen — sonst wäre aus der
    // K3-Vorbereitung eine Verhaltensänderung geworden.
    const s = baueSucher(BEIDE as never, FlexSearch);
    s.ergaenze('bund');
    s.ergaenze('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund', 'kanton']);
    expect(EBENEN.filter((eb) => !s.bereiteEbenen().includes(eb))).toEqual([]);
  });
});
