/**
 * W2·5d-EID3 Teil (b) — «Linien-Tiefe aus der eId-Pfadlänge» (FAHRPLAN-GESETZES-UX
 * §12.2, EID-3(b)).
 *
 * Gegenstand: `linienProfil().strukturTiefe` speist sich primär aus dem kumulativen
 * Fedlex-Container-eId-Pfad (`gliederung[].eId`, seit EID-1 im Sidecar), nicht mehr
 * allein aus der Sidecar-Rekursionstiefe (einer hN-Ableitung).
 *
 * Vier Achsen, die der Umbau nicht brechen darf:
 *   1. eId-Pfad HEBT die Tiefe, wo Fedlex einen Container ohne hN-Überschrift führt
 *      (belegter Realfall SVG: `tit_3/lvl_u1/chap_2/lvl_I` = 4 bei 3 Sidecar-Stufen).
 *   2. eId-LOSE Knoten behalten ihre Tiefe über den Positions-Fallback — sonst
 *      verlören die 13 eId-losen Bundeserlasse UND alle 1189 Kantons-Sidecars ihre
 *      Linien (Kantone stehen nicht in Fedlex, bekommen also nie eine eId).
 *   3. Der flache `annex`-Wert (W2·5d-ANNEX) ist ein Segment und darf nichts kippen.
 *   4. `guideEbene` bleibt an die GERENDERTEN Stufen gebunden — ein geerbtes
 *      Extra-Segment darf den Guide nie auf eine nicht gerenderte Ebene schieben
 *      (sonst zeigt der Nutzer-Schalter «Linien AN» keinen Guide mehr).
 *
 * A28/L-3 bleibt unangetastet: `autoGuide` ist in JEDEM Fall false (David-Verdikt
 * 12.7.2026, am 3.8.2026 erneut bestätigt) — hier mitgeprüft, nicht mitgebaut.
 */
import { describe, it, expect } from 'vitest';
import { linienProfil, eIdPfadTiefe } from '../pages/gesetz-leser/linienAufbau';
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

describe('linienProfil.strukturTiefe — eId-primär mit Positions-Fallback', () => {
  it('HEBT die Tiefe, wo der eId-Pfad länger ist als die hN-Ableitung (Realfall SVG)', () => {
    // Nachgebildet aus public/normtext/struktur/bund/SVG.json (Art. 29): Fedlex
    // führt `tit_3/lvl_u1` als div.heading(aria-level=2), unsere Extraktion macht
    // daraus keine gliederung-Stufe — der kumulative Pfad der Kindstufe trägt sie.
    const p = linienProfil(map({
      '29': [
        { ebene: 1, label: 'III. Titel: Verkehrsregeln', eId: 'tit_3' },
        { ebene: 2, label: '2. Abschnitt: Regeln für den Fahrverkehr', eId: 'tit_3/lvl_u1/chap_2' },
        { ebene: 3, label: 'I. Allgemeine Fahrregeln', eId: 'tit_3/lvl_u1/chap_2/lvl_I' },
      ],
    }));
    expect(p.strukturTiefe).toBe(4); // hN-Ableitung wäre 3
    expect(p.guideEbene).toBe(1);    // Render-Index UNVERÄNDERT
    expect(p.autoGuide).toBe(false);
  });

  it('hält die Tiefe bei eId-LOSEN Knoten über den Positions-Fallback (Kantone)', () => {
    // Kantonale Erlasse tragen NIE eine Fedlex-eId. Ohne Fallback fiele die Tiefe
    // auf 0 und der Erlass verlöre Guide und Schalter.
    const p = linienProfil(map({
      '1': [
        { ebene: 1, label: 'I. Allgemeine Bestimmungen' },
        { ebene: 2, label: 'A. Geltungsbereich' },
      ],
    }));
    expect(p.strukturTiefe).toBe(2);
    expect(p.guideEbene).toBe(1);
    expect(p.autoGuide).toBe(false);
  });

  it('senkt die Tiefe NIE unter die gerenderten Stufen (eId nur als Anhebung)', () => {
    // Konstruierter Gegenfall: eine kürzere eId auf tiefer Position darf die aus
    // der Position folgende Tiefe nicht kappen.
    const p = linienProfil(map({
      '1': [
        { ebene: 1, label: 'Erster Teil', eId: 'part_1' },
        { ebene: 2, label: 'Anhänge', eId: 'annex' },
      ],
    }));
    expect(p.strukturTiefe).toBe(2);
    expect(p.guideEbene).toBe(1);
  });

  it('lässt den reinen Anhang-Knoten flach (annex = ein Segment auf Position 0)', () => {
    const p = linienProfil(map({ annex_1: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }] }));
    expect(p.strukturTiefe).toBe(1);
    expect(p.guideEbene).toBe(0); // eine Ebene ⇒ Guide sitzt auf der äussersten
    expect(p.autoGuide).toBe(false);
  });

  it('mischt eId-behaftete und eId-lose Knoten desselben Erlasses konservativ', () => {
    // 13 Bundeserlasse haben gar keine eId; nach EID-1/ANNEX können Anhang- und
    // Hauptpfad unterschiedlich bestückt sein. Massgeblich ist das Maximum.
    const p = linienProfil(map({
      '1': [{ ebene: 1, label: 'Erster Titel' }],
      '2': [
        { ebene: 1, label: 'Zweiter Titel', eId: 'tit_2' },
        { ebene: 2, label: 'Erster Abschnitt', eId: 'tit_2/lvl_u3/chap_1' },
      ],
      annex_1: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }],
    }));
    expect(p.strukturTiefe).toBe(3);
    expect(p.guideEbene).toBe(1);
  });

  it('bleibt bei fehlender/leerer Gliederung flach (kein Guide möglich)', () => {
    expect(linienProfil(null)).toEqual({ strukturTiefe: 0, guideEbene: null, dichteAmGuide: 0, autoGuide: false });
    expect(linienProfil(map({ '1': [] }))).toEqual({ strukturTiefe: 0, guideEbene: null, dichteAmGuide: 0, autoGuide: false });
  });
});

describe('linienProfil — Guide-Verdrahtung unberührt (A28/L-3-Stand bindend)', () => {
  it('setzt guideEbene aus den GERENDERTEN Stufen, nicht aus der eId-Tiefe', () => {
    // Eine einzige gerenderte Stufe mit tiefem eId-Pfad: guideEbene MUSS 0 bleiben.
    // Käme sie aus strukturTiefe, spränge sie auf 1 — eine Ebene, die der Reader
    // nicht rendert; «Linien AN» zeigte dann gar keinen Guide mehr.
    const p = linienProfil(map({
      '1': [{ ebene: 1, label: 'Kapitel', eId: 'part_1/lvl_u1/chap_1' }],
    }));
    expect(p.strukturTiefe).toBe(3);
    expect(p.guideEbene).toBe(0);
  });

  it('lässt autoGuide korpusweit false — auch bei tiefer eId-Struktur', () => {
    const p = linienProfil(map({
      '1': [
        { ebene: 1, label: 'Erstes Buch', eId: 'book_1' },
        { ebene: 2, label: 'Erster Teil', eId: 'book_1/part_1' },
        { ebene: 3, label: 'Erster Titel', eId: 'book_1/part_1/tit_1' },
        { ebene: 4, label: 'Erster Abschnitt', eId: 'book_1/part_1/tit_1/chap_1' },
      ],
      '2': [
        { ebene: 1, label: 'Erstes Buch', eId: 'book_1' },
        { ebene: 2, label: 'Erster Teil', eId: 'book_1/part_1' },
        { ebene: 3, label: 'Erster Titel', eId: 'book_1/part_1/tit_1' },
        { ebene: 4, label: 'Erster Abschnitt', eId: 'book_1/part_1/tit_1/chap_1' },
      ],
    }));
    expect(p.autoGuide).toBe(false);
    expect(p.dichteAmGuide).toBe(2); // Dichte weiterhin aus den Label-Präfixen
  });
});
