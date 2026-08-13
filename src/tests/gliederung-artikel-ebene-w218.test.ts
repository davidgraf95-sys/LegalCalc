/**
 * W2·18-FEHLERBUCH — die Artikel-Ebene der Gliederung (Auftrag David 13.8.2026).
 *
 * AUFTRAG, wörtlich: «Die Gliederung muss in JEDEM Erlass bis zum einzelnen
 * Artikel aufklappbar sein.» Einzige Ausnahme: Erlasse, deren Baum die
 * Artikel-Granularität schon erreicht (OR/ZGB über ihre Randtitel-Knoten) —
 * dort wird nichts gedoppelt, und der Baum darf sich nicht ändern.
 *
 * WARUM GEGEN DEN ECHTEN KORPUS (Muster: gliederung-modell-w219.test.ts): die
 * Regel entscheidet an Verhältnissen, die nur die committeten Snapshots kennen.
 * Ein erfundener Baum prüfte die eigene Fantasie.
 *
 * DIE TYPEN-BREITE IST PFLICHT, nicht Kür (Auftrag David 13.8.2026, Ziff. 2):
 * Staatsverträge (RBUE) und Kantonserlasse (BS-…) dürfen nach dem Umbau keine
 * kaputte oder leere Artikel-Ebene zeigen. Darum laufen die Kernfälle über
 * dieselbe Neuner-Liste wie S3 — OR · AIG · VwVG · NHG · RBUE · BS-211.100 ·
 * BS-730.110 · ZH-243 · SG-3849 —, ergänzt um ZGB (zweiter Ausnahmefall), ZPO
 * (der Anlassfall) und BV (b1-offen: Start-Sichtbarkeit).
 */
import { describe, it, expect } from 'vitest';
import { baueGliederungsbaum, type StrukturMap, type Sektion } from '../lib/normtext/browse';
import { ladeNormFixture } from './fixtures/normtext-fixture';
import type { NormSnapshot } from '../lib/normtext/typen';
import { kuratiereTocSektionen } from '../pages/gesetz-leser/berechnungen';
import { artikelSachtitel } from '../lib/normtext/darstellung';
import {
  baueGliederungsModell, flacheZeilen, zeileIstOffen, artikelRandtitel, istAnhangEintrag,
  ARTIKEL_EBENE_MAX_BLATT_DECKUNG, ID_ARTIKEL,
  type GliederungsModell, type GliederungsKnoten,
} from '../pages/gesetz-leser/gliederungsModell';

function lade(ebene: 'bund' | 'kanton', key: string, go = true): GliederungsModell & {
  eintraege: NormSnapshot[]; struktur: StrukturMap | null; sektionen: Sektion[];
} {
  const { eintraege, struktur } = ladeNormFixture(ebene, key);
  const roh = baueGliederungsbaum(eintraege, struktur);
  const sektionen = kuratiereTocSektionen(roh.sektionen);
  // `startSichtbarGo: true` = die Reader-Einstellung (inhalt.tsx) — nur so
  // prüft der Start-Zustands-Fall unten, was der Nutzer wirklich sieht.
  const modell = baueGliederungsModell({
    sektionen, ohneGliederung: roh.ohneGliederung, eintraege, struktur, startSichtbarGo: go,
  });
  return { ...modell, eintraege, struktur, sektionen };
}

const artikelZeilen = (m: { knoten: GliederungsKnoten[] }): GliederungsKnoten[] =>
  flacheZeilen(m.knoten).filter((k) => k.art === 'artikel');

/** Die Zeilen, die der Nutzer OHNE eigenes Zutun sieht (Klapp-Karte leer). */
const sichtbarBeimStart = (knoten: GliederungsKnoten[], tiefe: number): GliederungsKnoten[] =>
  knoten.flatMap((k) => [k, ...(zeileIstOffen(k, {}, tiefe) ? sichtbarBeimStart(k.kinder, tiefe) : [])]);

// ═══ 1 · Der Anlassfall und die Typen-Breite ════════════════════════════════
describe('W2·18 — jeder Artikel ist über die Gliederung erreichbar', () => {
  // Erlasse im Baum-Modus (B1), quer durch die Typen-Matrix: Bundesgesetz mit
  // Kapitel-Gliederung (ZPO/AIG), Staatsvertrag (RBUE), Kantonserlasse mit
  // Feingliederung (BS-730.110) und mit gemischten Knoten (BS-211.100).
  const baumFaelle = [
    ['bund', 'ZPO', 430], ['bund', 'AIG', 261], ['bund', 'RBUE', 49], ['bund', 'BV', 232],
    ['kanton', 'BS-730.110', 129],
  ] as const;

  for (const [ebene, key, anzahl] of baumFaelle) {
    it(`${key}: alle ${anzahl} Artikel haben eine eigene Zeile`, () => {
      const m = lade(ebene, key);
      expect(m.artikelEbene).toBe(true);
      expect(m.kennzahlen.artikelAnzahl).toBe(anzahl);
      // Jede Zeile, die genau EINEN Artikel deckt — die neuen Artikel-Zeilen
      // UND die Anhang-Einträge, die `baueAnhangAst` schon vorher je Eintrag
      // erzeugt hat (dort wäre eine zweite Zeile die verbotene Doppelung).
      const gedeckt = new Set(
        flacheZeilen(m.knoten)
          .filter((k) => k.art === 'artikel' || k.art === 'anhang')
          .flatMap((k) => k.tokens ?? []),
      );
      const fehlend = m.eintraege.filter((e) => !gedeckt.has(e.artikel));
      expect(fehlend.map((e) => e.artikelLabel), `${key}: kein Artikel ohne Zeile`).toEqual([]);
    });
  }

  it('ZPO (Anlassfall): Sachtitel stehen an der Zeile, wo das Sidecar einen führt', () => {
    const m = lade('bund', 'ZPO');
    const zeilen = artikelZeilen(m);
    expect(zeilen.length).toBe(430);
    const eins = zeilen.find((k) => k.ersterArtikel === '1');
    expect(eins?.label).toBe('Art. 1 — Gegenstand');
    expect(eins?.sachtitel).toBe('Gegenstand');
    // Übergangsbestimmung — sie ist kein Sonderfall, sondern eine Zeile wie jede
    // andere (Auftrag Ziff. 3 «Sonderstrukturen respektieren»).
    expect(zeilen.find((k) => k.ersterArtikel === '404')?.label)
      .toBe('Art. 404 — Weitergelten des bisherigen Rechts');
    // §8: wo das Sidecar KEINEN artikel-eigenen Sachtitel führt (ZPO Art. 257 —
    // dort trägt ihn der Abschnitts-Knoten), bleibt die Zeile bei der blossen
    // Nummer. Nichts wird aus dem Nachbarn geliehen.
    const ohne = zeilen.find((k) => k.ersterArtikel === '257');
    expect(ohne?.label).toBe('Art. 257');
    expect(ohne?.sachtitel).toBeUndefined();
    expect(zeilen.filter((k) => k.sachtitel).length).toBe(403);
  });

  it('§5: der Sachtitel der Baum-Zeile ist derselbe wie im flachen Artikel-Index', () => {
    // Zwei Modi, EINE Quelle (`artikelRandtitel`) — sonst zeigte derselbe
    // Artikel je nach Erlass-Typ zwei verschiedene Überschriften.
    const m = lade('bund', 'ZPO');
    for (const z of artikelZeilen(m).slice(0, 60)) {
      const e = m.eintraege.find((x) => x.artikel === z.ersterArtikel)!;
      expect(z.sachtitel ?? null).toBe(artikelRandtitel(e, m.struktur));
      expect(z.sachtitel ?? null).toBe(artikelSachtitel(m.struktur?.[e.artikel]?.marginalie ?? []));
    }
  });

  it('RBUE (Staatsvertrag): auch der Vorspann öffnet bis zum Artikel', () => {
    // T9: 47 von 49 Artikeln liegen ohne Gliederungs-Zuordnung vor dem ersten
    // Sidecar-Knoten. Die Sammelzeile «Ohne Abschnitt (Art. 1–38)» ist kein
    // Zugang zu Art. 23 — erst ihre Artikel-Kinder sind es.
    const m = lade('bund', 'RBUE');
    const vorspann = m.knoten.find((k) => k.art === 'vorspann');
    expect(vorspann).toBeDefined();
    expect(vorspann!.kinder.length).toBe(47);
    expect(vorspann!.kinder.every((k) => k.art === 'artikel')).toBe(true);
    expect(vorspann!.kinder[0].label).toBe('Art. 1');
  });

  it('AIG: die Anhang-Sektionen bekommen die Ebene, die Anhang-EINTRÄGE nicht doppelt', () => {
    const m = lade('bund', 'AIG');
    const anhangWurzel = m.knoten.find((k) => k.art === 'anhang');
    expect(anhangWurzel).toBeDefined();
    // Kein Anhang-Eintrag trägt eine zusätzliche Artikel-Kind-Zeile: seine
    // Zeile IST schon der Eintrag (§5).
    for (const k of flacheZeilen([anhangWurzel!]).filter((x) => x.art === 'anhang')) {
      expect(k.kinder.every((kk) => kk.art !== 'artikel')).toBe(true);
    }
    // Die Anhang-SEKTIONEN darunter haben ihre Artikel dagegen als Zeilen.
    const artikelImAnhang = flacheZeilen([anhangWurzel!]).filter((k) => k.art === 'artikel');
    expect(artikelImAnhang.length).toBeGreaterThan(0);
  });

  it('BS-211.100 (T8): Artikel-Zeilen stehen in Dokumentreihenfolge zwischen den Untersektionen', () => {
    const m = lade('kanton', 'BS-211.100');
    expect(m.artikelEbene).toBe(true);
    const pos = new Map(m.eintraege.map((e, i) => [e.artikel, i]));
    const ersteArt = (k: GliederungsKnoten): number => {
      const eigene = k.ersterArtikel !== undefined ? pos.get(k.ersterArtikel) ?? Infinity : Infinity;
      return Math.min(eigene, ...k.kinder.map(ersteArt));
    };
    const pruefe = (k: GliederungsKnoten): void => {
      // Nur die Stämme der amtlichen Gliederung: die Anhang-Wurzel sammelt
      // bewusst quer eingehängte Äste (Modell-Doku `umhaengPraefix`).
      if (k.art !== 'anhang') {
        const folge = k.kinder.filter((x) => x.art !== 'anhang').map(ersteArt).filter((n) => Number.isFinite(n));
        const sortiert = [...folge].sort((a, b) => a - b);
        expect(folge, `${k.id}: Kinder in Dokumentreihenfolge`).toEqual(sortiert);
      }
      k.kinder.forEach(pruefe);
    };
    m.knoten.forEach(pruefe);
  });

  it('aufgehobene Artikel behalten ihren Platzhalter in der Gliederung', () => {
    // §8: eine Lücke in der Artikel-Folge, die es im Erlass nicht gibt, wäre
    // eine Falschaussage. BS-211.100 führt 153 aufgehobene Bestimmungen.
    const m = lade('kanton', 'BS-211.100');
    const aufgehoben = artikelZeilen(m).filter((k) => k.aufgehoben);
    expect(aufgehoben.length).toBe(153);
    expect(aufgehoben.length).toBe(m.eintraege.filter((e) => e.aufgehoben === true && !istAnhangEintrag(e)
      && artikelZeilen(m).some((z) => z.ersterArtikel === e.artikel)).length);
  });

  it('BS-730.110: die Einzelkind-Verdichtung bleibt intakt, die Artikel hängen am Blatt', () => {
    const m = lade('kanton', 'BS-730.110');
    const verdichtet = flacheZeilen(m.knoten).filter((k) => k.labelKette.length > 1);
    // T7 ist der belegte NULLFALL der Verdichtung (s. gliederungsModell.ts) —
    // geprüft wird darum die Regel, nicht eine Zahl: eine verdichtete Zeile
    // trägt mehrere Ids, aber nie eine Artikel-Zeile als Ketten-Glied.
    for (const k of verdichtet) expect(k.ids.length).toBe(k.labelKette.length);
    expect(artikelZeilen(m).every((k) => k.ids.length === 1 && k.labelKette.length === 1)).toBe(true);
    expect(artikelZeilen(m).length).toBe(129);
  });

  it('Ids sind eindeutig (React-Key-Vertrag) und kollidieren nie mit sek-N', () => {
    for (const [ebene, key] of [['bund', 'ZPO'], ['bund', 'AIG'], ['kanton', 'BS-211.100']] as const) {
      const alle = flacheZeilen(lade(ebene, key).knoten);
      expect(new Set(alle.map((k) => k.id)).size, `${key}: doppelte Zeilen-Id`).toBe(alle.length);
      for (const k of alle.filter((x) => x.art === 'artikel')) expect(k.id.startsWith(`${ID_ARTIKEL}:`)).toBe(true);
    }
  });
});

// ═══ 2 · Die Ausnahme: OR/ZGB bleiben unangetastet ══════════════════════════
describe('W2·18 — artikel-granulare Bäume werden nicht gedoppelt', () => {
  for (const key of ['OR', 'ZGB'] as const) {
    it(`${key}: keine Artikel-Ebene, Baum unverändert`, () => {
      const m = lade('bund', key);
      expect(m.artikelEbene).toBe(false);
      expect(m.kennzahlen.artikelBlattDeckung).toBeGreaterThan(ARTIKEL_EBENE_MAX_BLATT_DECKUNG);
      // BEWEIS DER UNVERÄNDERTHEIT: `haengeArtikelZeilen` kann an einem Baum
      // genau zweierlei tun — Artikel-Zeilen einfügen und `startOffen: false`
      // setzen. Ist beides nirgends vorhanden, ist der Baum identisch mit dem
      // vor dem Umbau; ein eingefrorener Abzug (Snapshot) bewiese weniger und
      // müsste bei jedem Korpus-Nachzug nachgeführt werden.
      const alle = flacheZeilen(m.knoten);
      expect(alle.some((k) => k.art === 'artikel')).toBe(false);
      expect(alle.some((k) => k.startOffen === false)).toBe(false);
      expect(alle.some((k) => k.id.startsWith(`${ID_ARTIKEL}:`))).toBe(false);
    });
  }

  it('die Schwelle trennt die beiden Lager mit Abstand (§0-3: Verteilung, nicht Einzelwert)', () => {
    // Korpus-Sonde 13.8.2026: unterhalb endet die Verteilung bei 0.793, oberhalb
    // beginnt sie bei 0.800; OR/ZGB haben 12 bzw. 8 Prozentpunkte Luft. Die
    // Zahlen hier sind die Ränder dieser Lücke, gemessen an den Snapshots.
    expect(lade('bund', 'OR').kennzahlen.artikelBlattDeckung).toBeCloseTo(0.919, 2);
    expect(lade('bund', 'ZGB').kennzahlen.artikelBlattDeckung).toBeCloseTo(0.881, 2);
    for (const [ebene, key] of [['bund', 'ZPO'], ['bund', 'AIG'], ['kanton', 'BS-730.110']] as const) {
      expect(lade(ebene, key).kennzahlen.artikelBlattDeckung).toBeLessThan(0.2);
    }
  });
});

// ═══ 3 · Die anderen Modi: warum sie die Ebene nicht tragen ═════════════════
describe('W2·18 — Modi ohne Artikel-Ebene, jeder aus eigenem Grund', () => {
  for (const [ebene, key] of [['bund', 'VWVG'], ['bund', 'NHG']] as const) {
    it(`${key} (b2-index): die Artikel stehen flach im Index, nicht zweimal`, () => {
      const m = lade(ebene, key);
      expect(m.modus).toBe('b2-index');
      expect(m.artikelEbene).toBe(false);
      const imIndex = m.artikelIndex.flatMap((g) => g.zeilen.map((z) => z.token));
      const anhang = m.eintraege.filter(istAnhangEintrag).length;
      expect(imIndex.length).toBe(m.eintraege.length - anhang);
      expect(flacheZeilen(m.knoten).some((k) => k.art === 'artikel')).toBe(false);
    });
  }

  for (const key of ['ZH-243', 'SG-3849'] as const) {
    it(`${key} (b3-leer, kein Sidecar): kein Baum, also auch keine Artikel-Ebene`, () => {
      // OFFENER PUNKT, ehrlich benannt (§8) statt still übergangen: diese 68
      // Erlasse haben kein Struktur-Sidecar (T10). Der Zugang zum einzelnen
      // Artikel entsteht dort mit dem Sidecar-Nachzug (ROADMAP W2·19B-KORPUS),
      // nicht in der Darstellungsschicht — eine hier konstruierte Ersatz-
      // Gliederung wäre eine zweite Wahrheit über den Erlass (§5).
      const m = lade('kanton', key);
      expect(m.modus).toBe('b3-leer');
      expect(m.artikelEbene).toBe(false);
      expect(m.knoten).toEqual([]);
    });
  }
});

// ═══ 4 · Start-Zustand: Verfügbarkeit, nicht Sichtbarkeit ═══════════════════
describe('W2·18 — die Artikel-Ebene ist verfügbar, aber nie von selbst offen', () => {
  // Auftrag David 13.8.2026: «es geht um VERFÜGBARKEIT der Artikel-Ebene beim
  // Aufklappen, nicht um Start-Sichtbarkeit».
  it('BV (b1-offen, David-Go «sichtbar»): der Start zeigt weiter genau die Sektionszeilen', () => {
    const m = lade('bund', 'BV');
    expect(m.modus).toBe('b1-offen');
    expect(m.startOffeneTiefe).toBe(Number.POSITIVE_INFINITY);
    const sichtbar = sichtbarBeimStart(m.knoten, m.startOffeneTiefe);
    expect(sichtbar.some((k) => k.art === 'artikel')).toBe(false);
    // Ohne die `startOffen: false`-Klemme wären es 39 + 232 = 271 Zeilen.
    expect(sichtbar.length).toBe(m.kennzahlen.zeilenVoll);
    expect(m.kennzahlen.zeilenGesamt).toBe(39 + 232);
  });

  it('ZPO (b1-kompakt): der Start bleibt bei den obersten Knoten', () => {
    const m = lade('bund', 'ZPO');
    expect(m.startOffeneTiefe).toBe(0);
    expect(sichtbarBeimStart(m.knoten, m.startOffeneTiefe).some((k) => k.art === 'artikel')).toBe(false);
  });

  it('ein Klick auf die Kapitel-Zeile öffnet die Artikel (Klapp-Karte schlägt Modell)', () => {
    const m = lade('bund', 'ZPO');
    const traeger = flacheZeilen(m.knoten).find((k) => k.kinder.some((kk) => kk.art === 'artikel'))!;
    expect(zeileIstOffen(traeger, {}, m.startOffeneTiefe)).toBe(false);
    const auf = Object.fromEntries(traeger.ids.map((id) => [id, true]));
    expect(zeileIstOffen(traeger, auf, m.startOffeneTiefe)).toBe(true);
  });
});
