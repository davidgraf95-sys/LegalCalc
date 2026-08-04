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
