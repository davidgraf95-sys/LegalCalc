// ─── Gemeinsame Arbitraries für die Engine-Property-Tests (QS-CODE-PROP) ─────
//
// Kein Rechtsinhalt, reine Test-Infrastruktur (§3-Minimalismus: EIN Ort für
// Seed, Kantons- und Datums-Generator statt zwölf Kopien). Die Invarianten
// selbst leben in den `*.property.test.ts` je Engine — hier steht nur, WORAUS
// generiert wird.
//
// §2: fester Seed → jeder Lauf reproduziert exakt dieselben Fälle. Wird eine
// Property real rot, ist das ein Rechen-BEFUND (§1) und kein Grund, die
// Property abzuschwächen.
import fc from 'fast-check';
import { format } from 'date-fns';
import type { Kanton } from '../types/legal';

export const PROPERTY_SEED = 20260815;

export const KANTONE_ALLE: readonly Kanton[] = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL',
  'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO',
  'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
];

export const kantonArb = fc.constantFrom(...KANTONE_ALLE);

/**
 * Kalendertag als Date im echten Nutzungsfenster. Bewusst KEINE Unsinns-Daten
 * (Jahr 0, Invalid Date): geprüft werden soll die Rechtslogik, nicht der
 * Fehlerpfad der Eingabe-Validierung.
 */
export function datumArb(vonJahr = 2015, bisJahr = 2035): fc.Arbitrary<Date> {
  return fc.date({
    min: new Date(vonJahr, 0, 1, 12, 0, 0),
    max: new Date(bisJahr, 11, 31, 12, 0, 0),
    noInvalidDate: true,
  }).map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Derselbe Tag als ISO-Kalendertag (yyyy-MM-dd) — Eingabeformat der Engines. */
export function isoDatumArb(vonJahr = 2015, bisJahr = 2035): fc.Arbitrary<string> {
  return datumArb(vonJahr, bisJahr).map((d) => format(d, 'yyyy-MM-dd'));
}

/** CHF-Betrag ≥ 0, endlich, rappengenau — die reale Eingabedomäne der Tarife. */
export function chfArb(max = 10_000_000): fc.Arbitrary<number> {
  return fc.integer({ min: 0, max: max * 100 }).map((rappen) => rappen / 100);
}
