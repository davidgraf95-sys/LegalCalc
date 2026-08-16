/**
 * W2·5d-EID3 Teil (b) — «Gliederungstiefe aus der eId-Pfadlänge»
 * (FAHRPLAN-GESETZES-UX §12.2, EID-3(b)).
 *
 * Gegenstand: `strukturTiefe()` speist sich primär aus dem kumulativen
 * Fedlex-Container-eId-Pfad (`gliederung[].eId`, seit EID-1 im Sidecar), nicht mehr
 * allein aus der Sidecar-Rekursionstiefe (einer hN-Ableitung).
 *
 * Drei Achsen, die der Umbau nicht brechen darf:
 *   1. eId-Pfad HEBT die Tiefe, wo Fedlex einen Container ohne hN-Überschrift führt
 *      (belegter Realfall SVG: `tit_3/lvl_u1/chap_2/lvl_I` = 4 bei 3 Sidecar-Stufen).
 *   2. eId-LOSE Knoten behalten ihre Tiefe über den Positions-Fallback — sonst
 *      verlören die 13 eId-losen Bundeserlasse UND alle 1189 Kantons-Sidecars ihre
 *      Tiefen-Kennzahl (Kantone stehen nicht in Fedlex, bekommen also nie eine eId).
 *   3. Der flache `annex`-Wert (W2·5d-ANNEX) ist ein Segment und darf nichts kippen.
 *
 * LINIEN-RÜCKBAU V1 (16.8.2026, Entscheid David 13.8.2026): die vierte, frühere
 * Achse — «`guideEbene` bleibt an die GERENDERTEN Stufen gebunden» — ist mit der
 * Gliederungslinie ersatzlos entfallen; ebenso die A28-Mitprüfung `autoGuide ===
 * false`. Es gibt keinen Guide mehr, dessen Sitz oder Auto-Default zu sichern wäre
 * (FAHRPLAN-GESETZESDARSTELLUNG-V2 §9.3). Übrig bleibt die Tiefen-Kennzahl, die
 * die Erlass-Übersicht anzeigt — die Achsen 1–3 gelten unverändert weiter.
 */
import { describe, it, expect } from 'vitest';
import { strukturTiefe, eIdPfadTiefe } from '../pages/gesetz-leser/strukturTiefe';
import type { StrukturMap } from '../lib/normtext/browse';

type Stufe = { ebene: number; label: string; eId?: string };
const map = (eintraege: Record<string, Stufe[]>): StrukturMap =>
  Object.fromEntries(
    Object.entries(eintraege).map(([k, g]) => [k, { gliederung: g, marginalie: [] }]),
  ) as StrukturMap;

describe('eIdPfadTiefe — Segmentzahl des kumulativen Fedlex-Pfads', () => {
  it('zählt die Segmente eines echten Container-Pfads', () => {
    expect(eIdPfadTiefe('book_2/part_2/tit_7/chap_4/lvl_D')).toBe(5);
    expect(eIdPfadTiefe('tit_3/lvl_u1/chap_2/lvl_I')).toBe(4);
    expect(eIdPfadTiefe('tit_1')).toBe(1);
  });

  it('behandelt den flachen `annex`-Wert als EIN Segment (W2·5d-ANNEX)', () => {
    expect(eIdPfadTiefe('annex')).toBe(1);
  });

  it('gibt 0 zurück, wo keine eId vorliegt — «keine Aussage», nicht «Tiefe 0»', () => {
    expect(eIdPfadTiefe(undefined)).toBe(0);
    expect(eIdPfadTiefe('')).toBe(0);
  });

  it('verwirft leere Segmente statt sie mitzuzählen', () => {
    expect(eIdPfadTiefe('/tit_1//chap_2/')).toBe(2);
  });
});

describe('strukturTiefe — eId-primär mit Positions-Fallback', () => {
  it('HEBT die Tiefe, wo der eId-Pfad länger ist als die hN-Ableitung (Realfall SVG)', () => {
    // Nachgebildet aus public/normtext/struktur/bund/SVG.json (Art. 29): Fedlex
    // führt `tit_3/lvl_u1` als div.heading(aria-level=2), unsere Extraktion macht
    // daraus keine gliederung-Stufe — der kumulative Pfad der Kindstufe trägt sie.
    expect(strukturTiefe(map({
      '29': [
        { ebene: 1, label: 'III. Titel: Verkehrsregeln', eId: 'tit_3' },
        { ebene: 2, label: '2. Abschnitt: Regeln für den Fahrverkehr', eId: 'tit_3/lvl_u1/chap_2' },
        { ebene: 3, label: 'I. Allgemeine Fahrregeln', eId: 'tit_3/lvl_u1/chap_2/lvl_I' },
      ],
    }))).toBe(4); // hN-Ableitung wäre 3
  });

  it('hält die Tiefe bei eId-LOSEN Knoten über den Positions-Fallback (Kantone)', () => {
    // Kantonale Erlasse tragen NIE eine Fedlex-eId. Ohne Fallback fiele die Tiefe
    // auf 0 und der Erlass zeigte in der Übersicht eine falsche «flache» Struktur.
    expect(strukturTiefe(map({
      '1': [
        { ebene: 1, label: 'I. Allgemeine Bestimmungen' },
        { ebene: 2, label: 'A. Geltungsbereich' },
      ],
    }))).toBe(2);
  });

  it('senkt die Tiefe NIE unter die gerenderten Stufen (eId nur als Anhebung)', () => {
    // Konstruierter Gegenfall: eine kürzere eId auf tiefer Position darf die aus
    // der Position folgende Tiefe nicht kappen.
    expect(strukturTiefe(map({
      '1': [
        { ebene: 1, label: 'Erster Teil', eId: 'part_1' },
        { ebene: 2, label: 'Anhänge', eId: 'annex' },
      ],
    }))).toBe(2);
  });

  it('lässt den reinen Anhang-Knoten flach (annex = ein Segment auf Position 0)', () => {
    expect(strukturTiefe(map({ annex_1: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }] }))).toBe(1);
  });

  it('mischt eId-behaftete und eId-lose Knoten desselben Erlasses konservativ', () => {
    // 13 Bundeserlasse haben gar keine eId; nach EID-1/ANNEX können Anhang- und
    // Hauptpfad unterschiedlich bestückt sein. Massgeblich ist das Maximum.
    expect(strukturTiefe(map({
      '1': [{ ebene: 1, label: 'Erster Titel' }],
      '2': [
        { ebene: 1, label: 'Zweiter Titel', eId: 'tit_2' },
        { ebene: 2, label: 'Erster Abschnitt', eId: 'tit_2/lvl_u3/chap_1' },
      ],
      annex_1: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }],
    }))).toBe(3);
  });

  it('hebt die Tiefe auch bei EINER gerenderten Stufe mit tiefem eId-Pfad', () => {
    // Die Kennzahl folgt der AMTLICHEN Verschachtelung, nicht unserer Render-Tiefe.
    expect(strukturTiefe(map({
      '1': [{ ebene: 1, label: 'Kapitel', eId: 'part_1/lvl_u1/chap_1' }],
    }))).toBe(3);
  });

  it('bleibt bei fehlender/leerer Gliederung flach', () => {
    expect(strukturTiefe(null)).toBe(0);
    expect(strukturTiefe(undefined)).toBe(0);
    expect(strukturTiefe(map({ '1': [] }))).toBe(0);
  });
});
