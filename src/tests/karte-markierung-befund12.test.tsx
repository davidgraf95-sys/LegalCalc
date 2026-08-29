import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SchweizKarte } from '../components/SchweizKarte';
import { markierungen } from '../components/schweizKarteMarkierung';

// ── Fehlerbuch-Befund 12 (Prüfung 29.8.2026) ─────────────────────────────────
// Die Karte zeichnete den hervorgehobenen Kanton über EINEN Overlay-Pfad, gespeist
// aus `hover ?? aktiv`. Hover verdrängte damit die Auswahl: Wer den Zeiger über
// einen NACHBARN des gewählten Kantons führte, verlor dessen Markierung — und
// bekam sie erst beim Verlassen zurück.
//
// ROT-BEWEIS (§6.7): Ersetzt man in markierungen() die Rückgabe durch die alte
// Regel
//     const gezeigt = hover ?? aktiv ?? null
//     return { aktiv: gezeigt === aktiv ? gezeigt : null, hover: gezeigt === aktiv ? null : gezeigt }
// fällt der erste Fall («Hover über einem Nachbarn») sofort: aktiv wird null.
// Verifiziert 29.8.2026 — 1 von 4 Fällen rot.
//
// Reine Darstellungs-Prüfung (§3): markierungen() entscheidet nur, WELCHE Ringe
// gezeichnet werden; Farbe und Strichstärke liegen in index.css.
describe('SchweizKarte — Markierung überlebt Hover über Nachbarn (Befund 12)', () => {
  it('Hover über einem NACHBARN lässt den Ring des aktiven Kantons stehen', () => {
    expect(markierungen('ZH', 'BE')).toEqual({ aktiv: 'ZH', hover: 'BE' });
  });

  it('Hover auf dem aktiven Kanton selbst zeichnet nur den starken Ring', () => {
    expect(markierungen('ZH', 'ZH')).toEqual({ aktiv: 'ZH', hover: null });
  });

  it('ohne Auswahl markiert allein der Hover', () => {
    expect(markierungen(null, 'BE')).toEqual({ aktiv: null, hover: 'BE' });
  });

  it('ohne Auswahl und ohne Hover wird nichts markiert', () => {
    expect(markierungen(undefined, null)).toEqual({ aktiv: null, hover: null });
  });
});

describe('SchweizKarte — Aussage hängt nie nur an der Farbe (F1/§11.6.8)', () => {
  const grad = (k: string) =>
    k === 'ZH' ? ({ stufe: 'auswahl', text: '42 Erlasse · Auswahl' } as const) : null;
  const html = renderToString(
    <SchweizKarte onWaehle={() => {}} nameFuer={(k) => (k === 'ZH' ? 'Zürich' : k)} gradFuer={grad} />,
  );

  it('trägt Zahl und Zustands-Wort im Tooltip', () => {
    expect(html).toContain('<title>Zürich — 42 Erlasse · Auswahl</title>');
  });

  // Das aria-label bleibt der reine Name: es ist der NAME des Bedienelements,
  // und die Kantons-Walks adressieren die Fläche exakt darüber
  // (e2e gesetze-ia-v2-walks.e2e.ts:203, `{ name: 'Zürich', exact: true }`).
  // Zahl und Zustands-Wort erreichen die Tastatur über die aria-live-
  // Bildunterschrift, die onFocus denselben Zustand bekommt wie onMouseEnter.
  it('lässt das aria-label der Fläche der reine Kantonsname sein', () => {
    expect(html).toContain('aria-label="Zürich"');
  });

  it('nennt Kantone ohne erfasste Erlasse ehrlich beim Namen', () => {
    expect(html).toContain('<title>BE — keine Erlasse</title>');
  });

  it('zeigt die Legende mit allen vier Stufen als Text', () => {
    for (const wort of ['vollständig', 'Auswahl', 'dünn', 'keine Erlasse']) {
      expect(html).toContain(wort);
    }
  });

  it('füllt Kantone ohne Erfassungsgrad mit dem Schraffur-Muster', () => {
    expect(html).toContain('id="karte-leer-schraffur"');
    expect(html).toContain('url(#karte-leer-schraffur)');
  });

  it('bindet die Füllung an die Erfassungs-Tokens, nicht an Ad-hoc-Farben (§13/B3)', () => {
    expect(html).toContain('var(--karte-auswahl)');
    expect(html).not.toMatch(/fill:\s*hsl\(/);
  });
});
