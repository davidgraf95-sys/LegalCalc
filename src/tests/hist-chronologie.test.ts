import { describe, it, expect } from 'vitest';
import { baueChronologie, fnNrSortKey } from '../pages/gesetz-leser/berechnungen';
import { extrahiereFussnotenRevision } from '../lib/verzahnung/revisionen-extrakt';

// W2·5i-HIST-ANSICHT — Reihung der Ansicht «Änderungshistorie: als Chronologie».
//
// Zwei Dinge sind hier zu sichern:
//  (1) Die Ordnung ist TOTAL und deterministisch (§2) — nie entscheidet die
//      Eingabe-Reihenfolge, sonst hinge die Darstellung an der Sidecar-Sortierung.
//  (2) Die Chronologie enthält AUSSCHLIESSLICH Klasse 'A' (H0-Auflage 1). Alles
//      andere bleibt im regulären Apparat; keine Fussnote steht je NUR hier.

const datum = (text: string) => extrahiereFussnotenRevision(text)?.iso ?? null;

/** Verkürzte Fixtures im amtlichen Wortlaut-Muster. */
const fn = (nr: string, kl: string | undefined, iso: string | null, extra = '') => ({
  nr,
  kl,
  text: iso
    ? `Fassung gemäss Ziff. I des BG, in Kraft seit ${iso} (AS 2000 1).${extra}`
    : `BRB vom 17. Juni 1996.${extra}`,
});

/** ISO → «1. Jan. 2017»-Form, wie sie amtlich im Fussnotentext steht. */
const amtlich = (nr: string, kl: string | undefined, tag: string) => ({
  nr, kl, text: `Fassung gemäss Ziff. I des BG, in Kraft seit ${tag} (AS 2000 1).`,
});

describe('baueChronologie — Reihenfolge', () => {
  it('sortiert aufsteigend nach Datum, unabhängig von der Eingabe-Reihenfolge', () => {
    const liste = [
      amtlich('25', 'A', '1. Jan. 2021'),
      amtlich('26', 'A', '1. Jan. 2021'),
      amtlich('27', 'A', '1. Juli 2006'),
      amtlich('28', 'A', '1. Jan. 2007'),
    ];
    // = der echte BGBM-Fall (Art. 9): Apparat-Reihenfolge 25,26,27,28 → Chronologie
    // 27 (2006) · 28 (2007) · 25/26 (2021). Also eine ECHTE Umsortierung.
    expect(baueChronologie(liste, datum).map((c) => c.fn.nr)).toEqual(['27', '28', '25', '26']);
    // Rückwärts eingegeben ⇒ identisches Ergebnis (die Ordnung hängt nicht am Input).
    expect(baueChronologie([...liste].reverse(), datum).map((c) => c.fn.nr)).toEqual(['27', '28', '25', '26']);
  });

  it('UNDATIERTE stehen immer am Ende — nie zwischen datierten', () => {
    const liste = [
      fn('30', 'A', null),                 // «BRB vom 17. Juni 1996.» (BGBM Art. 12)
      amtlich('12', 'A', '1. Juli 2006'),
      fn('31', 'A', null),
      amtlich('17', 'A', '1. Jan. 2021'),
    ];
    const nrs = baueChronologie(liste, datum).map((c) => c.fn.nr);
    expect(nrs).toEqual(['12', '17', '30', '31']);
    // Und die Undatierten tragen iso=null (das UI schreibt dort «ohne Datum», §8).
    expect(baueChronologie(liste, datum).slice(2).map((c) => c.iso)).toEqual([null, null]);
  });

  it('bei gleichem Datum entscheidet die Fussnoten-Nummer (numerisch, dann Suffix)', () => {
    const liste = [
      amtlich('95b', 'A', '1. Jan. 2020'),
      amtlich('100', 'A', '1. Jan. 2020'),
      amtlich('95', 'A', '1. Jan. 2020'),
      amtlich('95a', 'A', '1. Jan. 2020'),
      amtlich('9', 'A', '1. Jan. 2020'),
    ];
    expect(baueChronologie(liste, datum).map((c) => c.fn.nr)).toEqual(['9', '95', '95a', '95b', '100']);
  });

  it('ist stabil gegen wiederholte Anwendung (idempotent, §2)', () => {
    const liste = [
      amtlich('26', 'A', '1. Jan. 2021'), fn('30', 'A', null), amtlich('27', 'A', '1. Juli 2006'),
    ];
    const einmal = baueChronologie(liste, datum);
    const zweimal = baueChronologie(einmal.map((c) => c.fn), datum);
    expect(zweimal.map((c) => c.fn.nr)).toEqual(einmal.map((c) => c.fn.nr));
  });
});

describe('baueChronologie — nur Klasse A (H0-Auflage 1)', () => {
  it('nimmt V/G/Z/U und Klassenlose NICHT auf', () => {
    const liste = [
      { nr: '12', kl: 'A', text: 'Aufgehoben durch Ziff. I, mit Wirkung seit 1. Juli 2006 (AS 2006 1).' },
      { nr: '13', kl: 'V', text: 'SR 0.142.112.681' },
      { nr: '15', kl: 'Z', text: 'BBl 2017 2175' },
      { nr: '16', kl: 'G', text: 'Heute: Bundesamt für Justiz.' },
      { nr: '18', kl: 'U', text: 'Der Ausdruck bezeichnet die zuständige Stelle.' },
      // Kanton-Sidecars tragen KEIN kl → gehören nie in die Chronologie, bleiben
      // aber im Apparat sichtbar (das ist die konservative Richtung).
      { nr: '19', kl: undefined, text: 'Fassung gemäss § 3, in Kraft seit 1. Jan. 2010.' },
    ];
    expect(baueChronologie(liste, datum).map((c) => c.fn.nr)).toEqual(['12']);
  });

  it('ohne A-Fussnote ist die Chronologie leer (⇒ das UI rendert keinen Block)', () => {
    expect(baueChronologie([{ nr: '13', kl: 'V', text: 'SR 311.0' }], datum)).toEqual([]);
  });
});

describe('§6.7 — die Reihung kann scheitern', () => {
  it('würde eine unsortierte «Durchreiche» auffallen lassen', () => {
    const liste = [amtlich('26', 'A', '1. Jan. 2021'), amtlich('27', 'A', '1. Juli 2006')];
    const durchreiche = liste.map((f) => f.nr);          // = Eingabe-Reihenfolge
    expect(durchreiche).toEqual(['26', '27']);
    expect(baueChronologie(liste, datum).map((c) => c.fn.nr)).toEqual(['27', '26']);
    expect(baueChronologie(liste, datum).map((c) => c.fn.nr)).not.toEqual(durchreiche);
  });
  it('würde einen Datums-Extraktor auffallen lassen, der immer null liefert', () => {
    // Lieferte `datumVon` pauschal null, stünde ALLES als «ohne Datum» am Ende und
    // die Chronologie wäre keine — genau das prüft die erste Zusicherung mit.
    const liste = [amtlich('26', 'A', '1. Jan. 2021'), amtlich('27', 'A', '1. Juli 2006')];
    expect(baueChronologie(liste, datum).map((c) => c.iso)).toEqual(['2006-07-01', '2021-01-01']);
    expect(baueChronologie(liste, () => null).map((c) => c.iso)).toEqual([null, null]);
  });
});

describe('fnNrSortKey', () => {
  it('trennt Zahl und Buchstaben-Suffix; unparsbar ans Ende', () => {
    expect(fnNrSortKey('95')).toEqual([95, '']);
    expect(fnNrSortKey('95a')).toEqual([95, 'a']);
    expect(fnNrSortKey(' 12 ')).toEqual([12, '']);
    expect(fnNrSortKey('')[0]).toBe(Number.POSITIVE_INFINITY);
    expect(fnNrSortKey(undefined)[0]).toBe(Number.POSITIVE_INFINITY);
  });
});
