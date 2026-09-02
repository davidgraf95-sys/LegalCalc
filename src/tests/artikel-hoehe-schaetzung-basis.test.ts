import { describe, it, expect } from 'vitest';
import { schaetzeArtikelHoehe, A2_HOEHE_FALLBACK } from '../pages/gesetz-leser/berechnungen';
import type { NormSnapshot } from '../lib/normtext/typen';

// W2·5d U-POSITION/A2: die per-Artikel-Höhenschätzung speist die inhalts-
// proportionale content-visibility-Platzhalterhöhe (Scrollbalken-Proportionalität).
// Deterministisch (§2) + monoton (mehr Inhalt ⇒ nie kleiner) — DAS ist die für
// einen proportionalen Balken nötige Eigenschaft; Pixel-Genauigkeit ist nicht Ziel.
//
// Aufgeteilt (2 Dateien): Basisfälle hier, Wachstumsfälle in
// artikel-hoehe-schaetzung-wachstum.test.ts.

function art(bloecke: NormSnapshot['bloecke'], titel?: string): NormSnapshot {
  return {
    id: 'bund/OR/art_x', ebene: 'bund', quelle: 'OR', erlass: 'OR',
    artikel: 'x', artikelLabel: 'Art. x', titel,
    bloecke, stand: '2024-01-01', quelleUrl: 'https://example', abgerufen: '2024-01-01',
  } as NormSnapshot;
}

describe('schaetzeArtikelHoehe (A2) — Basis', () => {
  it('ist deterministisch (gleiche Eingabe ⇒ gleiche Ausgabe)', () => {
    const e = art([{ absatz: '1', text: 'Ein Absatz mit etwas Text.' }]);
    expect(schaetzeArtikelHoehe(e)).toBe(schaetzeArtikelHoehe(e));
  });

  it('respektiert eine sinnvolle Mindesthöhe', () => {
    expect(schaetzeArtikelHoehe(art([]))).toBeGreaterThanOrEqual(120);
    // Aufgehobener Einzeiler bleibt klein — deutlich unter dem alten Flach-Default.
    expect(schaetzeArtikelHoehe(art([{ absatz: null, text: '…' }]))).toBeLessThanOrEqual(A2_HOEHE_FALLBACK);
  });
});
