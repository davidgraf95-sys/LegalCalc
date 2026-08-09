/**
 * W2·19-GLIEDERUNG · S9 — Artikel-Index (B2/B4), gliederungsModell.ts.
 *
 * Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §3.2 (B2-Zeile «Art. N —
 * Randtitel», Abschnitte als nicht klappbare Zwischenköpfe), §9-S9.
 *
 * ROT-BEWEIS (Auftrag «Rot-Beweis nur für die zwei zentralen neuen Verhalten»):
 * vor dieser Slice lieferte `baueGliederungsModell` gar kein `artikelIndex`-Feld
 * — jeder dieser Tests wäre mit einem TypeScript-Fehler ODER `undefined` an der
 * ersten Assertion gescheitert. Belegt durch denselben Referenz-Erlass-Satz wie
 * S3 (VwVG/NHG/VMWG/AR-145.312/OR/ZH-243, `ladeNormFixture`), damit die Zahlen
 * gegen den committeten Korpus stehen, nicht gegen erfundene Bäume (§7).
 */
import { describe, it, expect } from 'vitest';
import { baueGliederungsbaum } from '../lib/normtext/browse';
import { ladeNormFixture } from './fixtures/normtext-fixture';
import { kuratiereTocSektionen } from '../pages/gesetz-leser/berechnungen';
import { baueGliederungsModell } from '../pages/gesetz-leser/gliederungsModell';

function lade(ebene: 'bund' | 'kanton', key: string) {
  const { eintraege, struktur } = ladeNormFixture(ebene, key);
  const roh = baueGliederungsbaum(eintraege, struktur);
  const sektionen = kuratiereTocSektionen(roh.sektionen);
  return baueGliederungsModell({
    sektionen, ohneGliederung: roh.ohneGliederung, eintraege, struktur, startSichtbarGo: true,
  });
}

describe('S9 — Artikel-Index: B2 mit Abschnitten (VwVG, 5 Zwischenköpfe)', () => {
  const m = lade('bund', 'VWVG');

  it('Modus ist B2 (Vorbedingung, s. S3)', () => {
    expect(m.modus).toBe('b2-index');
  });

  it('genau 5 Gruppen — je EIN nicht klappbarer Zwischenkopf pro amtlichem Abschnitt', () => {
    expect(m.artikelIndex.length).toBe(5);
    for (const g of m.artikelIndex) expect(g.kopf).not.toBeNull();
  });

  it('alle 93 Artikel stehen als flache Zeilen — keine verloren, keine doppelt', () => {
    const alle = m.artikelIndex.flatMap((g) => g.zeilen);
    expect(alle.length).toBe(93);
    expect(new Set(alle.map((z) => z.token)).size).toBe(93);
  });

  it('jede Zeile trägt ein amtliches Art.-Etikett; die meisten zusätzlich einen Randtitel', () => {
    // §7-Präzisierung: «93/93 Randtitel» (S3, `marginalienDichte`) misst, ob
    // IRGENDEINE Marginalie vorliegt — nicht, ob daraus ein eigenständiges
    // `blatt` (Sachüberschrift) wird. Trägt die LETZTE Marginalien-Stufe einen
    // Aufzähler («1.»), wird sie selbst zum (ggf. einzelartikligen) Ast statt
    // zum Blatt (`randtitelKnoten`, darstellung.ts) — für DIESE eine Zeile
    // bleibt `randtitel` dann `null`, ohne dass ihr Etikett fehlt.
    const alle = m.artikelIndex.flatMap((g) => g.zeilen);
    for (const z of alle) expect(z.label).toMatch(/^Art\. \d+/);
    const mitRandtitel = alle.filter((z) => z.randtitel !== null).length;
    expect(mitRandtitel).toBeGreaterThan(alle.length * 0.8);
  });
});

describe('S9 — Artikel-Index: B2 ohne Abschnitte (NHG, VMWG — T4)', () => {
  it('NHG: alle 70 Artikel stehen — die eine geteilte Randtitel-Gruppe («Zweck») als Zwischenkopf, der Rest ungruppiert', () => {
    // Empirisch gegen den committeten Snapshot (§7): NHG ist NICHT komplett
    // sektionslos wie VMWG — Art. 1 trägt die geteilte Marginalie «Zweck» und
    // wird darum (wie jede geteilte Randtitel-Kette, §3.4) zum eigenen Ast;
    // die restlichen 69 Artikel bleiben frei (`ohneGliederung`).
    const m = lade('bund', 'NHG');
    expect(m.modus).toBe('b2-index');
    const alle = m.artikelIndex.flatMap((g) => g.zeilen);
    expect(alle.length).toBe(70);
    expect(new Set(alle.map((z) => z.token)).size).toBe(70);
    expect(m.artikelIndex.some((g) => g.kopf === null)).toBe(true);
  });

  it('VMWG: dieselbe Form (sektionen.length===0, S3-Beleg)', () => {
    const m = lade('bund', 'VMWG');
    expect(m.modus).toBe('b2-index');
    expect(m.artikelIndex.length).toBe(1);
    expect(m.artikelIndex[0].kopf).toBeNull();
    expect(m.artikelIndex[0].zeilen.length).toBeGreaterThan(0);
  });
});

describe('S9 — Artikel-Index: B4 Mini bekommt dieselbe Liste (sonst leere Fläche hinter ☰)', () => {
  it('AR-145.312: b4-mini UND ein nicht-leerer Index', () => {
    const m = lade('kanton', 'AR-145.312');
    expect(m.modus).toBe('b4-mini');
    expect(m.artikelIndex.length).toBeGreaterThan(0);
    const alle = m.artikelIndex.flatMap((g) => g.zeilen);
    expect(alle.length).toBe(m.kennzahlen.artikelAnzahl);
  });
});

describe('S9 — Artikel-Index bleibt LEER ausserhalb B2/B4 (§15: kein unnötiger Bau)', () => {
  it('OR (b1-kompakt): artikelIndex ist [], obwohl 1686 Artikel im Snapshot stehen', () => {
    const m = lade('bund', 'OR');
    expect(m.modus).toBe('b1-kompakt');
    expect(m.artikelIndex).toEqual([]);
  });

  it('ZH-243 (b3-leer, T10): artikelIndex ist [] — dieselbe Ehrlichkeit wie `knoten`', () => {
    const m = lade('kanton', 'ZH-243');
    expect(m.modus).toBe('b3-leer');
    expect(m.artikelIndex).toEqual([]);
  });
});
