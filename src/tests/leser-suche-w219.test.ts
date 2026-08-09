/**
 * W2·19-GLIEDERUNG · S8 — die zwei Mechanik-Regeln der erlass-lokalen Suche.
 *
 * Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §4.1 (Felder), §4.2
 * (Sortierung «ehrlich statt Reuse-Behauptung»), §4.3 (Ausschnitt/Badges),
 * §4.4 (findbar/malbar-Vertrag).
 *
 * WAS HIER GEPRÜFT WIRD und warum es hier und nicht in e2e steht: beide Regeln
 * sind reine Ableitungen aus Snapshot + Sidecar. Sie im Browser zu prüfen hiesse,
 * eine Datenfrage über den Umweg von Render, Scroll und Timing zu stellen —
 * genau die Bauart, die im Reader-Bestand die belegte Flake-Familie stellt
 * (§0/3). Der e2e-Teil prüft, was nur dort prüfbar ist: dass die gemalte Menge
 * die gezählte nie übersteigt.
 *
 * FIXTURE-REGEL (§8-Kasten der Spec, Lehre 9.8.2026): Erlasse werden über den
 * REGISTER-SCHLÜSSEL geladen (`BGFA`, `VWVG`), nie über einen von Hand gebauten
 * Dateipfad — macOS löst case-blind auf, der Linux-CI nicht.
 */
import { describe, it, expect } from 'vitest';
import { ladeNormFixture } from './fixtures/normtext-fixture';
import {
  baueLeserSuchIndex, sucheImErlass, zaehleTreffer, badgesFuer, fundstellenFolge,
  FELD_GEWICHT, AUSSCHNITT_MAX,
  type LeserSuchIndex,
} from '../pages/gesetz-leser/leserSuche';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { StrukturMap } from '../lib/normtext/browse';

function index(key: string, ebene: 'bund' | 'kanton' = 'bund'): LeserSuchIndex {
  const { eintraege, struktur } = ladeNormFixture(ebene, key);
  return baueLeserSuchIndex(key, eintraege, struktur);
}

// Ein handgebauter Mini-Erlass: er stellt jede Feldklasse GENAU EINMAL, damit
// die Sortierregel an einer Lage geprüft wird, die man vollständig überblickt.
// Die Referenz-Erlasse darunter belegen dieselben Regeln am echten Korpus.
function kunstErlass(): { eintraege: NormSnapshot[]; struktur: StrukturMap } {
  const basis = {
    ebene: 'bund' as const, quelle: 'X', erlass: 'X',
    stand: '2026-01-01', quelleUrl: 'https://example.invalid', abgerufen: '2026-01-01',
    fassungsToken: '20260101', sha: 'x',
  };
  const eintraege: NormSnapshot[] = [
    // nur Fliesstext (t) — einmal
    { ...basis, id: 'x/1', artikel: '1', artikelLabel: 'Art. 1', bloecke: [{ absatz: '1', text: 'Der Zaunkoenig ist geschuetzt.' }] },
    // nur Randtitel-Blatt (m) — einmal
    { ...basis, id: 'x/2', artikel: '2', artikelLabel: 'Art. 2', bloecke: [{ absatz: '1', text: 'Ohne Fundstelle.' }] },
    // nur Gliederungstitel (g) — DREIMAL, damit die Fundstellenzahl allein den
    // Feldrang nicht schlagen darf (Stufe 1 vor Stufe 2).
    { ...basis, id: 'x/3', artikel: '3', artikelLabel: 'Art. 3', bloecke: [{ absatz: '1', text: 'Ohne Fundstelle.' }] },
    // nur Fussnote (f) — einmal
    { ...basis, id: 'x/4', artikel: '4', artikelLabel: 'Art. 4', bloecke: [{ absatz: '1', text: 'Ohne Fundstelle.' }] },
    // nur Tabelle (tb) — einmal
    { ...basis, id: 'x/5', artikel: '5', artikelLabel: 'Art. 5',
      bloecke: [{ absatz: null, text: '', tabelle: [{ beschreibung: 'Zaunkoenig', betrag: '10' }] }] },
    // nachrangiger Randtitel (n) — einmal
    { ...basis, id: 'x/6', artikel: '6', artikelLabel: 'Art. 6', bloecke: [{ absatz: '1', text: 'Ohne Fundstelle.' }] },
  ];
  const struktur: StrukturMap = {
    '1': { gliederung: [], marginalie: [] },
    '2': { gliederung: [], marginalie: ['Zaunkoenig'] },
    '3': { gliederung: [{ ebene: 1, label: 'Zaunkoenig, Zaunkoenig und Zaunkoenig' }], marginalie: [] },
    '4': { gliederung: [], marginalie: [], fussnoten: [{ nr: '7', text: 'Fassung zum Zaunkoenig', links: [] }] },
    '5': { gliederung: [], marginalie: [] },
    // Der Treffer sitzt auf der NACHRANGIGEN Stufe (Index ≥ 1) — die oberste
    // Stufe ist `m`, jede weitere `n` (Generator-Semantik, such-index-generieren).
    '6': { gliederung: [], marginalie: ['Etwas anderes', 'A. Zaunkoenig'] },
  };
  return { eintraege, struktur };
}

describe('S8 §4.2 — erlass-lokale Sortierung (eigene Regel, KEIN rangiere()-Reuse)', () => {
  it('Feldgewicht t > m > n > g > tb > f schlägt die Fundstellenzahl', () => {
    const { eintraege, struktur } = kunstErlass();
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    // Art. 3 trifft DREIMAL, aber nur im Gliederungstitel (g) — es muss trotzdem
    // hinter den Einzeltreffern in t, m und n stehen.
    expect(treffer.map((t) => t.token)).toEqual(['1', '2', '6', '3', '5', '4']);
    expect(treffer.map((t) => t.topFeld)).toEqual(['t', 'm', 'n', 'g', 'tb', 'f']);
    expect(treffer.find((t) => t.token === '3')!.fundstellen).toBe(3);
  });

  it('bei gleichem Feld entscheidet die Fundstellenzahl, dann die Artikelreihenfolge', () => {
    const { eintraege, struktur } = kunstErlass();
    // Zwei zusätzliche reine Fliesstext-Artikel: einer mit zwei Fundstellen
    // (später im Dokument), einer mit einer (früher).
    eintraege.push(
      { ...eintraege[0], id: 'x/7', artikel: '7', artikelLabel: 'Art. 7', bloecke: [{ absatz: '1', text: 'Zaunkoenig und Zaunkoenig.' }] },
      { ...eintraege[0], id: 'x/8', artikel: '8', artikelLabel: 'Art. 8', bloecke: [{ absatz: '1', text: 'Zaunkoenig allein.' }] },
    );
    struktur['7'] = { gliederung: [], marginalie: [] };
    struktur['8'] = { gliederung: [], marginalie: [] };
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const t = treffer.filter((x) => x.topFeld === 't').map((x) => x.token);
    // Art. 7 (2 Fundstellen) vor Art. 1 und Art. 8 (je 1); unter diesen beiden
    // gewinnt die Dokument-Position.
    expect(t).toEqual(['7', '1', '8']);
  });

  it('Ergebnis ist deterministisch — zweimal gesucht ist zweimal dasselbe (§2)', () => {
    const ix = index('BGFA');
    const a = sucheImErlass(ix, 'Anwalt');
    const b = sucheImErlass(index('BGFA'), 'Anwalt');
    expect(a.map((x) => `${x.token}:${x.fundstellen}`)).toEqual(b.map((x) => `${x.token}:${x.fundstellen}`));
    expect(a.length).toBeGreaterThan(5);
  });

  it('die Feldordnung ist die des Generators, nicht neu erfunden', () => {
    expect(FELD_GEWICHT.t).toBeGreaterThan(FELD_GEWICHT.m);
    expect(FELD_GEWICHT.m).toBeGreaterThan(FELD_GEWICHT.n);
    expect(FELD_GEWICHT.n).toBeGreaterThan(FELD_GEWICHT.g);
    expect(FELD_GEWICHT.g).toBeGreaterThan(FELD_GEWICHT.tb);
    expect(FELD_GEWICHT.tb).toBeGreaterThan(FELD_GEWICHT.f);
  });
});

describe('S8 §4.4 — findbar/malbar: der Zähler ist datenseitig, die Badges sind ehrlich', () => {
  it('der Zähler summiert ALLE Felder — auch die, die nie gemalt werden', () => {
    const { eintraege, struktur } = kunstErlass();
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const { artikel, fundstellen } = zaehleTreffer(treffer);
    expect(artikel).toBe(6);
    // 1×t + 1×m + 1×n + 3×g + 1×tb + 1×f = 8 — die vier nie gemalten (n, 3×g)
    // sind mitgezählt, sonst wäre der Zähler von der Ansicht abhängig.
    expect(fundstellen).toBe(8);
  });

  it('nie malbare Felder sind als solche markiert (Gliederung, nachrangiger Randtitel, Bild-Alt)', () => {
    const { eintraege, struktur } = kunstErlass();
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const feldVon = (token: string) => treffer.find((t) => t.token === token)!.felder[0];
    expect(feldVon('3').malbar).toBe('nie');
    expect(feldVon('6').malbar).toBe('nie');
    expect(feldVon('1').malbar).toBe('immer');
    expect(feldVon('4').malbar).toBe('fussnoten');
  });

  it('jeder Nicht-Fliesstext-Treffer trägt einen Herkunfts-Badge, ein Fliesstext-Treffer keinen', () => {
    const { eintraege, struktur } = kunstErlass();
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const badges = (token: string) => badgesFuer(treffer.find((t) => t.token === token)!, false);
    expect(badges('1')).toEqual([]);
    expect(badges('2')).toEqual(['Randtitel']);
    expect(badges('3')).toEqual(['Überschrift']);
    expect(badges('4')).toEqual(['Fussnote']);
    expect(badges('5')).toEqual(['Tabelle']);
    expect(badges('6')).toEqual(['Randtitel']);
  });

  it('bei «Fussnoten aus» sagt der Badge es — die Ansicht wird nicht still umgeschaltet', () => {
    const { eintraege, struktur } = kunstErlass();
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const fn = treffer.find((t) => t.token === '4')!;
    expect(badgesFuer(fn, true)).toEqual(['Fussnote (ausgeblendet)']);
    // Der ZÄHLER bleibt davon unberührt — er ist datenseitig (§4.4 Ziff. 1).
    expect(fn.fundstellen).toBe(1);
  });

  it('am echten Erlass: Fussnoten- und Überschriften-Treffer sind findbar und benannt (BGFA)', () => {
    const treffer = sucheImErlass(index('BGFA'), 'Fassung');
    expect(treffer.length).toBeGreaterThan(0);
    const mitFussnote = treffer.filter((t) => t.felder.some((f) => f.quelle === 'Fussnote'));
    expect(mitFussnote.length, 'BGFA trägt Fussnoten-Treffer für «Fassung»').toBeGreaterThan(0);
    for (const t of mitFussnote) expect(badgesFuer(t, false)).toContain('Fussnote');
    // Und die alte Filterregel hätte davon KEINEN gefunden: sie las nur Label
    // und `bloecke[].text`/`items[].text`.
    const { eintraege } = ladeNormFixture('bund', 'BGFA');
    const alt = eintraege.filter((e) => e.artikelLabel.toLowerCase().includes('fassung')
      || e.bloecke.some((b) => b.text.toLowerCase().includes('fassung')
        || (b.items ?? []).some((it) => it.text.toLowerCase().includes('fassung'))));
    expect(treffer.length, 'die neue Suche findet mehr als die alte Filterregel').toBeGreaterThan(alt.length);
  });

  it('die Fundstellen-Folge deckt sich mit dem Zähler (↑↓-Navigation, §4.3)', () => {
    const treffer = sucheImErlass(index('BGFA'), 'Anwalt');
    const folge = fundstellenFolge(treffer);
    expect(folge.length).toBe(zaehleTreffer(treffer).fundstellen);
    // Die Ränge laufen je Artikel lückenlos von 0 hoch.
    const ersterToken = treffer[0].token;
    expect(folge.filter((f) => f.token === ersterToken).map((f) => f.rang))
      .toEqual([...Array(treffer[0].fundstellen).keys()]);
  });
});

describe('S8 §4.3 — Textausschnitt aus den Quell-Strings (Entscheid c)', () => {
  it('der Ausschnitt zeigt den Begriff in Original-Schreibweise und bleibt im Rahmen', () => {
    const treffer = sucheImErlass(index('BGFA'), 'anwalt');
    for (const t of treffer.slice(0, 12)) {
      const a = t.ausschnitt!;
      expect(a, `Ausschnitt fehlt bei ${t.token}`).not.toBeNull();
      expect(a.treffer.toLowerCase()).toBe('anwalt');
      // «…»-Marken zählen nicht zum Text; der Rahmen gilt für den Inhalt.
      const laenge = a.vor.replace(/^… /, '').length + a.treffer.length + a.nach.replace(/ …$/, '').length;
      expect(laenge, `Ausschnitt zu lang bei ${t.token}: ${laenge}`).toBeLessThanOrEqual(AUSSCHNITT_MAX);
    }
  });

  it('der Ausschnitt kommt aus dem stärksten getroffenen Feld, nicht aus dem ersten', () => {
    const { eintraege, struktur } = kunstErlass();
    // Art. 2 trifft im Randtitel (m, Segment 1) UND im Fliesstext (t, später).
    eintraege[1].bloecke = [{ absatz: '1', text: 'Auch hier steht Zaunkoenig im Wortlaut.' }];
    const treffer = sucheImErlass(baueLeserSuchIndex('X', eintraege, struktur), 'Zaunkoenig');
    const t = treffer.find((x) => x.token === '2')!;
    expect(t.ausschnitt!.quelle).toBe('Fliesstext');
    expect(t.topFeld).toBe('t');
  });

  it('Fussnoten-Ausschnitte sind markup-frei (§8: keine rohen spitzen Klammern)', () => {
    const ix = index('BGFA');
    for (const a of ix.artikel) {
      for (const s of a.segmente) expect(s.text, `Markup in ${a.token}`).not.toMatch(/<\/?[bi]>/i);
    }
  });
});

describe('S8 §4.1 — Feld-Records aus Snapshot + Sidecar, ohne Such-Index', () => {
  it('ein Erlass ohne Sidecar bleibt durchsuchbar (T10, 42 Kantons-Snapshots)', () => {
    const { eintraege } = ladeNormFixture('bund', 'BGFA');
    const ohne = baueLeserSuchIndex('BGFA', eintraege, null);
    const treffer = sucheImErlass(ohne, 'Anwalt');
    expect(treffer.length).toBeGreaterThan(0);
    // Ohne Sidecar gibt es keine Randtitel-, Gliederungs- und Fussnoten-Felder —
    // gefunden wird der Wortlaut, und die Liste sagt es über die Badges nicht
    // anders (§8: keine erfundenen Quellen).
    const quellen = new Set(treffer.flatMap((t) => t.felder.map((f) => f.quelle)));
    expect(quellen.has('Überschrift')).toBe(false);
    expect(quellen.has('Fussnote')).toBe(false);
    expect(quellen.has('Fliesstext')).toBe(true);
  });

  it('leerer Begriff liefert nichts (kein Voll-Lauf über den Erlass)', () => {
    expect(sucheImErlass(index('BGFA'), '')).toEqual([]);
    expect(sucheImErlass(index('BGFA'), '   ')).toEqual([]);
    expect(sucheImErlass(null, 'Anwalt')).toEqual([]);
  });

  it('flacher Erlass mit vielen Randtiteln: VwVG bleibt vollständig indiziert', () => {
    const ix = index('VWVG');
    expect(ix.artikel.length).toBe(93);
    const mitRandtitel = ix.artikel.filter((a) => a.randtitel !== null);
    expect(mitRandtitel.length, 'VwVG trägt 93/93 Randtitel (Spec §8, T3)').toBeGreaterThan(80);
    const treffer = sucheImErlass(ix, 'Beschwerde');
    expect(treffer.length).toBeGreaterThan(10);
    expect(treffer.every((t) => t.gruppe !== null || t.felder.length > 0)).toBe(true);
  });
});
