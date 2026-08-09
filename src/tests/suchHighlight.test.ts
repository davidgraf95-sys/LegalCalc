import { describe, it, expect } from 'vitest';
import { findeVorkommen, SUCH_HIGHLIGHT, SUCH_META } from '../pages/gesetz-leser/suchHighlight';

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
