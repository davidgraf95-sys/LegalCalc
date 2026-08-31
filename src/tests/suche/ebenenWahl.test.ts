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
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as flex from 'flexsearch';
import { EBENEN, baueIndex, gewaehlteEbenen } from '../../../scripts/such-index-generieren';
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

// ─── F3 (Gegenprüfung 31.8.2026): der BYTE-Beweis, den der Kommentar behauptete ──────
//
// Der K3-Kommentar in such-index-generieren.ts berief sich auf einen Byte-Gleichheits-
// Beweis in `src/tests/suchIndex.test.ts` — zweifach falsch: die Datei enthielt keinen
// solchen Beweis, und die K3-Tests standen ohnehin hier. Damit stützte sich die
// Aussage «Default AUS ist wirkungslos» auf gar nichts Ausführbares. Ein behaupteter
// Beweis ist schlimmer als kein Beweis: er beendet das Nachfragen (§8).
//
// Die Tests darüber prüfen nur, welche EBENEN-LISTE herauskommt. Das ist die Absicht,
// nicht die Wirkung. Hier steht die Wirkung: der VOLLE Index, byte-für-byte.
describe('F3 Byte-Beweis: Flag AUS lässt artikel.json unverändert', () => {
  // ~0,5 s für den vollen Index über alle 54 446 Artikel (gemessen 31.8.2026) —
  // billig genug, um bei jedem Lauf mitzufahren, statt nur behauptet zu werden.
  const voll = JSON.stringify(baueIndex());
  const sha = (s: string) => createHash('sha256').update(s).digest('hex');

  it('Default-Lauf ist byte-gleich mit dem ausgelieferten public/such-index/artikel.json', () => {
    // DAS ist die Referenz, um die es geht: das committete Artefakt, das der Nutzer
    // wirklich lädt. Ein Vergleich `baueIndex()` gegen `baueIndex(EBENEN)` wäre
    // zirkulär — beide Seiten gingen durch denselben Schalter.
    const datei = readFileSync('public/such-index/artikel.json', 'utf8');
    expect(sha(voll), `sha256 Lauf ${sha(voll).slice(0, 16)}… vs. Datei ${sha(datei).slice(0, 16)}…`).toBe(sha(datei));
    expect(voll.length).toBe(datei.length);
  });

  it('der Schalter FILTERT nur — er verändert keinen einzigen Eintrag', () => {
    // Die zweite Hälfte des Beweises. «Byte-gleich bei AUS» allein schlösse nicht aus,
    // dass der Schalter bei AN nebenher etwas anderes am Eintrag ändert. Geprüft wird
    // darum: die Bund-Einträge des gefilterten Laufs sind Zeichen für Zeichen und in
    // derselben Reihenfolge die Bund-Einträge des vollen Laufs.
    const nurBund = baueIndex(['bund']);
    const bundAusVoll = baueIndex().eintraege.filter((e) => e.eb === 'bund');
    expect(nurBund.eintraege.length).toBe(bundAusVoll.length);
    expect(sha(JSON.stringify(nurBund.eintraege))).toBe(sha(JSON.stringify(bundAusVoll)));
    // …und die weggelassene Ebene ist im Artefakt SICHTBAR abwesend, nicht bloss leer.
    expect(nurBund.ebenen).toEqual(['bund']);
    expect(nurBund.eintraege.some((e) => e.eb === 'kanton')).toBe(false);
  });

  it('zwei Läufe sind byte-gleich (§2 Determinismus, kein Date/Netz/Zufall)', () => {
    expect(sha(JSON.stringify(baueIndex()))).toBe(sha(voll));
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
