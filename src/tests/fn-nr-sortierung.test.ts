import { describe, expect, it } from 'vitest';
import { fnNrSortKey } from '../pages/gesetz-leser/berechnungen';

// `fnNrSortKey` ordnet den regulären Fussnoten-Apparat eines Artikels
// (ArtikelLeser.tsx): numerisch, dann Buchstaben-Suffix («95a» nach «95», vor
// «100»). Unparsbares landet am Ende, statt die Reihung zu sprengen.
//
// HERKUNFT (S1, 17.8.2026): Diese Zusicherungen standen bis S1 in
// `src/tests/hist-chronologie.test.ts` — Zeichen für Zeichen dieselben. Jene
// Datei prüfte in der Hauptsache `baueChronologie`, und die ist mit dem
// Optionen-Rückbau entfallen (David F1 «ja»: der dritte Historie-Modus
// «Chronologie» wird gestrichen). Der Sortierschlüssel ist NICHT entfallen — er
// bedient weiter den Apparat — und behält darum seine Deckung; nur der Dateiname
// stimmt jetzt wieder mit dem Prüfgegenstand überein.

describe('fnNrSortKey', () => {
  it('trennt Zahl und Buchstaben-Suffix; unparsbar ans Ende', () => {
    expect(fnNrSortKey('95')).toEqual([95, '']);
    expect(fnNrSortKey('95a')).toEqual([95, 'a']);
    expect(fnNrSortKey(' 12 ')).toEqual([12, '']);
    expect(fnNrSortKey('')[0]).toBe(Number.POSITIVE_INFINITY);
    expect(fnNrSortKey(undefined)[0]).toBe(Number.POSITIVE_INFINITY);
  });
});
