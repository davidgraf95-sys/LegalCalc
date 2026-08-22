// @vitest-environment node
// ─── Befund 6b (Cowork 21.8.2026): Weiterzug-Klammerzusatz-Hinweis ───────────
//
// 272 von 3'795 kantonalen Entscheiden (BS-Tranche) tragen einen amtlichen
// Klammerzusatz «(BGer <Az.> vom <Datum>)»: der Entscheid wurde ans
// Bundesgericht weitergezogen. `traegtWeiterzugHinweis` (PanelEntscheide.tsx)
// entscheidet, ob die GRUPPE (nicht die Zeile, Ä106) einen Erklär-Hinweis
// zeigt — reine Zeichenketten-Prüfung, keine Rechtslogik (§3), darum hier
// ohne Bau des vollen Panels getestet.
import { describe, it, expect } from 'vitest';
import { traegtWeiterzugHinweis, WEITERZUG_MUSTER } from '../pages/gesetz-leser/v3/PanelEntscheideKontext';
import type { Bezug } from '../lib/rechtsprechung/bezuege';

function bezug(regesteKurz: string | null): Bezug {
  return {
    key: 'bs_appellationsgericht_BEZ.2026.1',
    gewicht: null,
    zitierung: 'BEZ.2026.1',
    regesteKurz,
    datum: '2026-01-01',
    facetten: { quelltyp: 'rechtsprechung', ebene: 'kanton', kanton: 'BS', gericht: 'bs_appellationsgericht', status: 'kantonal' },
  };
}

describe('Befund 6b — Weiterzug-Klammerzusatz wird erkannt (PanelEntscheide)', () => {
  it('erkennt den amtlichen Zusatz «(BGer <Az.> vom <Datum>)» am Zeilenende', () => {
    expect(WEITERZUG_MUSTER.test('Grundstückverwertung (BGer Nr. 5A_543/2026 vom 17.06.2026)')).toBe(true);
    expect(WEITERZUG_MUSTER.test('Psychiatrische Begutachtung (BGer 7B_158/2026 vom 24. März 2026)')).toBe(true);
  });

  it('erkennt MEHRERE Klammerzusätze (mehrfacher Weiterzug) ebenso', () => {
    expect(WEITERZUG_MUSTER.test('Forderung (BGer 4A_620/2025 vom 14. Januar 2026) (BGer 4F_4/2026 vom 22. April 2026)')).toBe(true);
  });

  it('löst NICHT auf eine blosse «BGer»-Erwähnung ohne das volle Muster aus', () => {
    // Weder Klammer noch «vom» — reine Wörter, kein amtlicher Zusatz.
    expect(WEITERZUG_MUSTER.test('Vgl. dazu auch das BGer in einem früheren Fall.')).toBe(false);
    // Klammer, aber ohne «vom» — kein Datum, kein Weiterzug-Zusatz.
    expect(WEITERZUG_MUSTER.test('Mietstreit (BGer-Praxis uneinheitlich)')).toBe(false);
  });

  it('Gruppen-Hinweis erscheint, sobald EIN Eintrag der Gruppe das Muster trägt', () => {
    const liste = [bezug('Kündigung ohne Zusatz'), bezug('Forderung (BGer 4A_608/2025 vom 15. Januar 2026)')];
    expect(traegtWeiterzugHinweis(liste)).toBe(true);
  });

  it('KEIN Gruppen-Hinweis, wenn kein Eintrag der Gruppe das Muster trägt', () => {
    const liste = [bezug('Kündigung ohne Zusatz'), bezug(null), bezug('Erbteilung — reguläre Regeste')];
    expect(traegtWeiterzugHinweis(liste)).toBe(false);
  });

  it('leere Gruppe: kein Hinweis (kein Fehlschlag bei null/leerer Liste)', () => {
    expect(traegtWeiterzugHinweis([])).toBe(false);
  });
});
