import { describe, it, expect } from 'vitest';
import {
  findeVorkommen, SUCH_HIGHLIGHT, SUCH_META,
  neueHighlightInstanz, setzeSuchHighlightRanges,
} from '../pages/gesetz-leser/suchHighlight';

// A35 (David 16.7.2026): Treffer-Highlight in der In-Gesetz-Suche. Hier die reine
// Offset-Findung (die DOM-/Highlight-API-Verdrahtung deckt e2e ab, Chromium).

describe('findeVorkommen — case-insensitive Teilstring-Offsets', () => {
  it('findet ein einzelnes Vorkommen', () => {
    expect(findeVorkommen('Ein Vertrag entsteht', 'Vertrag')).toEqual([[4, 11]]);
  });

  it('findet alle Vorkommen, case-insensitiv (David: «Vertrag» im OR)', () => {
    // «Vertrag» und «vertrag» (in «Vertragsschluss») beide getroffen.
    const text = 'Vertrag und Vertragsschluss';
    expect(findeVorkommen(text, 'vertrag')).toEqual([[0, 7], [12, 19]]);
  });

  it('überlappt nicht — Fortschritt nach jedem Treffer', () => {
    expect(findeVorkommen('aaaa', 'aa')).toEqual([[0, 2], [2, 4]]);
  });

  it('leerer Begriff ⇒ keine Treffer (kein Endlos-Fortschritt)', () => {
    expect(findeVorkommen('irgendetwas', '')).toEqual([]);
  });

  it('kein Treffer ⇒ leere Liste', () => {
    expect(findeVorkommen('Obligationenrecht', 'zzz')).toEqual([]);
  });

  it('exportiert den kanonischen Highlight-Namen (mit index.css gekoppelt)', () => {
    expect(SUCH_HIGHLIGHT).toBe('lc-such-treffer');
  });

  // Bug-Check §9 vom 4.8.2026 (B1): das Marker-Attribut, mit dem die
  // Trefferliste ihre eigenen Bedien-/Zähler-Zeilen aus dem Walker-Bereich
  // nimmt. Der Name ist ein VERTRAG zwischen suchHighlight.ts (Ausschluss) und
  // inhalt-volltext.tsx (Setzen) — driftet er, zählt der Zähler wieder sich
  // selbst mit. Die DOM-Wirkung deckt e2e/leser-r1-r2.e2e.ts ab (node-Env hier).
  it('exportiert das kanonische Meta-Marker-Attribut', () => {
    expect(SUCH_META).toBe('data-such-meta');
  });
});

// ═══ B1 (Bug-Check §9 zu W2·19-S8) — Beträge in beiden Schreibweisen ═════════
//
// Die Snapshots speichern Tausender mit LEERZEICHEN («16 800 Franken», AHVV
// Art. 6quater — im Korpus 46 Gruppen allein in der AHVV), die Lesespalte malt
// sie mit dem Schweizer APOSTROPH («16'800», gruppiereBetraege). Damit gab es
// drei Schreibweisen für dieselbe Zahl — die gespeicherte, die gemalte und die,
// die der Jurist tippt — und je nachdem, welche er wählte, zählte der Index 0
// und die Lesespalte malte n (die VERBOTENE Richtung des §4.4-Vertrags) oder
// umgekehrt: Treffer in der Liste, aber nichts leuchtet.
//
// Antwort: EINE Faltung, angewandt auf beide Seiten JEDES Vergleichs — auf den
// Heuhaufen wie auf den Begriff. Die Faltung spiegelt exakt die Gruppierungs-
// regel der Darstellung (`gruppiereTausender`): ein Trenner fällt genau dann,
// wenn links eine Ziffer steht und rechts eine Gruppe von GENAU drei Ziffern
// folgt, auf die keine weitere Ziffer folgt.
//
// ROT VOR DEM FIX: alle Fälle dieser Gruppe (die Offsets kamen leer zurück).
describe('findeVorkommen — Faltung der Tausender-Schreibweisen (B1)', () => {
  it('Apostroph im Text, blanke Ziffern in der Anfrage', () => {
    expect(findeVorkommen("Fr. 16'800 im Jahr", '16800')).toEqual([[4, 10]]);
  });

  it('Leerzeichen im Text, Apostroph in der Anfrage', () => {
    expect(findeVorkommen('16 800 Franken', "16'800")).toEqual([[0, 6]]);
  });

  it('Apostroph im Text, Leerzeichen in der Anfrage', () => {
    expect(findeVorkommen("Fr. 16'800", '16 800')).toEqual([[4, 10]]);
  });

  it('Ketten: 1\'234\'567 == 1 234 567 == 1234567', () => {
    expect(findeVorkommen("Betrag 1'234'567 CHF", '1234567')).toEqual([[7, 16]]);
    expect(findeVorkommen('Betrag 1 234 567 CHF', '1234567')).toEqual([[7, 16]]);
    expect(findeVorkommen('Betrag 1234567 CHF', "1'234'567")).toEqual([[7, 14]]);
  });

  it('der zurückgegebene Offset umfasst den Trenner — er zeigt auf den ROHEN Text', () => {
    // Der Bereich muss im Original liegen, sonst markierte das Highlight die
    // falschen Zeichen und der Ausschnitt zeigte Bruchstücke.
    const text = "Fr. 16'800 im Jahr";
    const [[a, b]] = findeVorkommen(text, '16800');
    expect(text.slice(a, b)).toBe("16'800");
  });

  it('NICHT gefaltet wird, was keine Tausender-Gruppe ist', () => {
    // Zwei getrennte Zahlen dürfen nicht zu einer verschmelzen — sonst fände
    // «12» plötzlich «Art. 1, 2»-artige Stellen (falsche Fundstellen, §8).
    expect(findeVorkommen('Art. 1 2 und 3', '12')).toEqual([]);
    // Rechte Gruppe hat vier Ziffern ⇒ kein Tausendertrenner.
    expect(findeVorkommen('1 2345', '12345')).toEqual([]);
    // Buchstaben dahinter ⇒ unberührt («10 Mio.»).
    expect(findeVorkommen('10 Mio.', '10mio.')).toEqual([]);
  });

  it('Text ohne Ziffern bleibt zeichengleich (kein Offset-Versatz)', () => {
    expect(findeVorkommen("Der Anwalt's Vertrag", 'vertrag')).toEqual([[13, 20]]);
  });
});

// ═══ QS-UI-HIGHLIGHT — EINE Registry-Position, mehrere Leser-Instanzen ════════
//
// ROADMAP-Schritt `QS-UI-HIGHLIGHT`, von FAHRPLAN-LESER-V3 Kap. 14 in Etappe H2
// absorbiert: «im Split-View löscht das Suchfeld eines Panes die Markierung des
// Nachbar-Panes».
//
// DER MECHANISMUS, gegen den hier geprüft wird. Die CSS Custom Highlight API
// kennt je NAMEN genau eine Menge, und `SUCH_HIGHLIGHT` ist ein Modul-Konstant-
// String. Jede Leser-Instanz schrieb bisher direkt auf diese eine Position:
// `reg.set(...)` beim Malen, `reg.delete(...)` beim Aufräumen. Im Split-View
// (zwei Gesetz-Panes, oder Gesetz + Entscheid) genügte darum das Leeren EINES
// Suchfelds, um die Markierung des Nachbarn mitzulöschen — der Nachbar hatte
// weiter einen Begriff im Feld, seine Fundstellen leuchteten aber nicht mehr.
//
// WARUM DIE ANTWORT NICHT «ein zweiter Highlight-Name» ist: `::highlight(name)`
// ist eine statische CSS-Regel (index.css). Ein pane-abhängiger Name verlangte
// je Pane eine eigene CSS-Regel — eine zweite Wahrheit über dieselbe Darstellung
// (§5) und ein Deckel auf der Pane-Zahl. Stattdessen bleibt es bei EINER
// Registry-Position und EINER CSS-Regel; buchgeführt werden die RANGES je
// Instanz, und geschrieben wird stets ihre Vereinigung. Wer seine Menge leert,
// nimmt genau seine Ranges heraus — die des Nachbarn bleiben stehen.
//
// Der Test läuft ohne Browser: die API wird über `globalThis` gelesen
// (`highlightApi()`), also genügen ein Doppel für `CSS.highlights` und für
// `Highlight`. Geprüft wird die BUCHFÜHRUNG, nicht das Malen — Letzteres deckt
// die e2e-Sonde `leser-v3-highlight-split` im echten Chromium ab.
describe('QS-UI-HIGHLIGHT — Instanz-Buchführung der Highlight-Registry', () => {
  interface Doppel {
    reg: Map<string, { ranges: unknown[] }>;
    /** Instanz erzeugen UND für den Abbau vormerken. */
    instanz: (name: string) => symbol;
    aufraeumen: () => void;
  }

  /**
   * Stellt `CSS.highlights` + `Highlight` an `globalThis` bereit.
   *
   * `aufraeumen` leert ausserdem jede in diesem Test erzeugte Instanz. Das ist
   * keine Test-Kosmetik, sondern spiegelt die Lebensdauer-Zusage des Moduls: die
   * Buchführung ist MODUL-Zustand und überlebt den einzelnen Leser, darum meldet
   * sich jede Instanz beim Unmount mit einer leeren Menge ab. Ohne dieselbe
   * Disziplin im Test schleppte der nächste Test die Ranges des vorigen mit —
   * genau daran ist dieser Block beim ersten Grün-Lauf aufgefallen (zwei
   * Fehlschläge, `['a9','b1','b1']` statt `['a9','b1']`).
   */
  function stelleApi(): Doppel {
    const g = globalThis as unknown as { CSS?: unknown; Highlight?: unknown };
    const vorherCss = g.CSS;
    const vorherHl = g.Highlight;
    const reg = new Map<string, { ranges: unknown[] }>();
    g.CSS = { highlights: reg };
    g.Highlight = class { ranges: unknown[]; constructor(...r: unknown[]) { this.ranges = r; } };
    const erzeugte: symbol[] = [];
    return {
      reg,
      instanz: (name) => { const i = neueHighlightInstanz(name); erzeugte.push(i); return i; },
      aufraeumen: () => {
        for (const i of erzeugte) setzeSuchHighlightRanges([], i);
        g.CSS = vorherCss;
        g.Highlight = vorherHl;
      },
    };
  }

  /** Range-Doppel: die Buchführung reicht sie nur durch, sie liest sie nie aus. */
  function ranges(...namen: string[]): Range[] {
    return namen.map((n) => ({ __name: n }) as unknown as Range);
  }

  it('DER DEFEKT: Pane A leert sein Feld — die Markierung von Pane B bleibt stehen', () => {
    const { reg, instanz, aufraeumen } = stelleApi();
    try {
      const paneA = instanz('pane-a');
      const paneB = instanz('pane-b');

      setzeSuchHighlightRanges(ranges('a1', 'a2'), paneA);
      setzeSuchHighlightRanges(ranges('b1'), paneB);
      // Beide Panes malen — EINE Registry-Position trägt die Vereinigung.
      expect(reg.get(SUCH_HIGHLIGHT)!.ranges).toHaveLength(3);

      // Pane A leert sein Suchfeld (leere Menge = der Aufräum-Pfad des Lesers).
      setzeSuchHighlightRanges([], paneA);

      // GENAU HIER stand der Defekt: vorher war die Position jetzt GELÖSCHT und
      // Pane B leuchtete nicht mehr, obwohl sein Feld unverändert gefüllt war.
      const nachher = reg.get(SUCH_HIGHLIGHT);
      expect(nachher, 'Pane B hat seine Markierung verloren').toBeDefined();
      expect(nachher!.ranges).toHaveLength(1);
      expect((nachher!.ranges[0] as { __name: string }).__name).toBe('b1');
    } finally { aufraeumen(); }
  });

  it('leeren beide Panes, verschwindet die Registry-Position ganz (kein Rest)', () => {
    const { reg, instanz, aufraeumen } = stelleApi();
    try {
      const paneA = instanz('pane-a');
      const paneB = instanz('pane-b');
      setzeSuchHighlightRanges(ranges('a1'), paneA);
      setzeSuchHighlightRanges(ranges('b1'), paneB);
      setzeSuchHighlightRanges([], paneA);
      setzeSuchHighlightRanges([], paneB);
      // `delete` statt einer leeren Menge: eine leere `Highlight`-Instanz in der
      // Registry stehen zu lassen wäre ein Zustand, den niemand sieht und der
      // beim nächsten Leser-Start als «da» gelesen würde (§8).
      expect(reg.has(SUCH_HIGHLIGHT)).toBe(false);
    } finally { aufraeumen(); }
  });

  it('eine Instanz ersetzt beim Neu-Setzen stets ihre EIGENE Menge, nie die fremde', () => {
    const { reg, instanz, aufraeumen } = stelleApi();
    try {
      const paneA = instanz('pane-a');
      const paneB = instanz('pane-b');
      setzeSuchHighlightRanges(ranges('a1', 'a2', 'a3'), paneA);
      setzeSuchHighlightRanges(ranges('b1'), paneB);
      // Pane A tippt weiter — neue, kleinere Trefferzahl.
      setzeSuchHighlightRanges(ranges('a9'), paneA);
      const namen = reg.get(SUCH_HIGHLIGHT)!.ranges.map((r) => (r as { __name: string }).__name);
      expect(namen.sort()).toEqual(['a9', 'b1']);
    } finally { aufraeumen(); }
  });

  it('ohne verfügbare API bleibt alles geräuschlos (SSR/alte Browser)', () => {
    // Kein Doppel gestellt: `highlightApi()` liefert null. Die Buchführung darf
    // dann weder werfen noch etwas anlegen — die Trefferliste bleibt voll
    // funktionsfähig, nur ohne Paint-Schicht (Modulkommentar oben).
    expect(() => setzeSuchHighlightRanges(ranges('x'), neueHighlightInstanz('solo'))).not.toThrow();
  });

  it('zwei Instanzen sind verschieden, auch bei gleichem Namen', () => {
    // Der Name ist reine Diagnose-Beschriftung; die Identität trägt das Symbol.
    // Sonst teilten sich zwei Gesetz-Panes wieder eine Buchungszeile.
    expect(neueHighlightInstanz('leser')).not.toBe(neueHighlightInstanz('leser'));
  });
});
