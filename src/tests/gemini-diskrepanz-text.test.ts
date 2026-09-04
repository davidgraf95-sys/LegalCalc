// src/tests/gemini-diskrepanz-text.test.ts — deterministische Klartext-Reduktion
// für den Gemini-Diskrepanz-Finder (scripts/analyse/gemini-diskrepanz-text.ts).
// Kein agy-Aufruf hier (extern, keine Testpflicht — Auftrag QS-FREMDAGENTEN/
// Phase 2) — nur die REDUKTION: Quelle (Fedlex-HTML) und Snapshot (NormSnapshot[])
// müssen bei gleicher Eingabe byte-gleich dieselbe Ausgabe liefern (Determinismus,
// §2), Absatzmarker stehen INLINE im Text (T2-Lehre, scratchpad t2-recall/
// ERGEBNIS.md), und der Fussnoten-Apparat der Quelle bleibt vom Artikeltext
// GETRENNT statt hineinvermischt zu werden.

import { describe, it, expect } from 'vitest';
import {
  reduziereQuelleHtml,
  reduziereSnapshot,
  formatiereArtikel,
} from '../../scripts/analyse/gemini-diskrepanz-text.ts';
import type { NormSnapshot } from '../lib/normtext/typen.ts';

const BEISPIEL_HTML = `<html><body><main><article id="art_5">
  <h6 class="heading"><a href="#art_5"><b>Art.&nbsp;5</b> Randtitel</a><sup><a href="#fn-x" id="fnbck-x">1</a></sup></h6>
  <div class="collapseable">
    <p class="absatz"><sup>1</sup>&nbsp;Einleitungssatz:</p>
    <dl>
      <dt>a.</dt><dd>erster Punkt<sup><a href="#fn-y" id="fnbck-y">2</a></sup>;</dd>
      <dt>b.</dt><dd>zweiter Punkt mit Unterliste:
        <dl><dt>1.</dt><dd>Unterpunkt eins,</dd><dt>2.</dt><dd>Unterpunkt zwei.</dd></dl>
      </dd>
    </dl>
    <p class="absatz"><sup>2</sup>&nbsp;Zweiter Absatz ohne Aufzählung.</p>
    <div class="footnotes">
      <p id="fn-x"><sup><a href="#fnbck-x">1</a></sup> Randtitel-Fussnote.</p>
      <p id="fn-y"><sup><a href="#fnbck-y">2</a></sup> Fussnote zu lit. a.</p>
    </div>
  </div>
</article></body></html>`;

function snapshotEintrag(overrides: Partial<NormSnapshot> = {}): NormSnapshot {
  return {
    id: 'bund/TEST/art_5',
    ebene: 'bund',
    quelle: 'TEST',
    erlass: 'TEST',
    artikel: '5',
    artikelLabel: 'Art. 5',
    bloecke: [
      { absatz: '1', text: 'Einleitungssatz:', items: [
        { marke: 'a', text: 'erster Punkt;' },
        { marke: 'b', text: 'zweiter Punkt mit Unterliste:' },
        { marke: '1', text: 'Unterpunkt eins,', tiefe: 1 },
        { marke: '2', text: 'Unterpunkt zwei.', tiefe: 1 },
      ] },
      { absatz: '2', text: 'Zweiter Absatz ohne Aufzählung.' },
    ],
    stand: '2026-01-01',
    quelleUrl: 'https://example.test/art_5',
    abgerufen: '2026-01-01',
    fassungsToken: '20260101',
    sha: 'x'.repeat(64),
    ...overrides,
  };
}

describe('reduziereQuelleHtml', () => {
  it('ist deterministisch: gleiche Eingabe -> gleiche Ausgabe', () => {
    const a = reduziereQuelleHtml(BEISPIEL_HTML);
    const b = reduziereQuelleHtml(BEISPIEL_HTML);
    expect(formatiereArtikel(a.get('5')!)).toBe(formatiereArtikel(b.get('5')!));
  });

  it('setzt Absatzmarker inline in den Text (keine separate Kodierung)', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).toContain('1 Einleitungssatz:');
    expect(art.text).toContain('2 Zweiter Absatz ohne Aufzählung.');
  });

  it('rendert verschachtelte Aufzählungen (dl/dt/dd) inkl. Unterlisten', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).toContain('a. erster Punkt;');
    expect(art.text).toContain('b. zweiter Punkt mit Unterliste:');
    expect(art.text).toContain('1. Unterpunkt eins,');
    expect(art.text).toContain('2. Unterpunkt zwei.');
  });

  it('entfernt Fussnoten-Referenzmarker aus dem Artikeltext (reines Verweis-Rauschen)', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).not.toMatch(/erster Punkt2;/);
  });

  it('hält den Fussnoten-Apparat GETRENNT vom Artikeltext', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).not.toContain('Randtitel-Fussnote');
    expect(art.text).not.toContain('Fussnote zu lit. a');
    expect(art.fussnoten).toContain('Randtitel-Fussnote');
    expect(art.fussnoten).toContain('Fussnote zu lit. a');
  });

  it('filtert nach Artikel-Spanne (von/bis)', () => {
    const nurAndere = reduziereQuelleHtml(BEISPIEL_HTML, 10, 20);
    expect(nurAndere.has('5')).toBe(false);
    const nurFuenf = reduziereQuelleHtml(BEISPIEL_HTML, 1, 5);
    expect(nurFuenf.has('5')).toBe(true);
  });
});

describe('reduziereSnapshot', () => {
  it('ist deterministisch: gleiche Eingabe -> gleiche Ausgabe', () => {
    const e = snapshotEintrag();
    const a = reduziereSnapshot([e]);
    const b = reduziereSnapshot([e]);
    expect(formatiereArtikel(a.get('5')!)).toBe(formatiereArtikel(b.get('5')!));
  });

  it('setzt Absatzmarker inline, wie bei der Quelle', () => {
    const map = reduziereSnapshot([snapshotEintrag()]);
    const art = map.get('5')!;
    expect(art.text).toContain('1 Einleitungssatz:');
    expect(art.text).toContain('2 Zweiter Absatz ohne Aufzählung.');
  });

  it('führt keinen separaten Fussnoten-Text (Snapshot-Schema kennt das Feld nicht)', () => {
    const map = reduziereSnapshot([snapshotEintrag()]);
    expect(map.get('5')!.fussnoten).toBe('');
  });
});

describe('Quelle und Snapshot erzeugen dasselbe Format', () => {
  it('Art. 5 aus Quelle und Snapshot sind textlich identisch (Positiv-Kontrolle ohne Abweichung)', () => {
    const quelle = reduziereQuelleHtml(BEISPIEL_HTML).get('5')!;
    const snap = reduziereSnapshot([snapshotEintrag()]).get('5')!;
    expect(quelle.text).toBe(snap.text);
  });

  it('deckt einen eingebauten drop auf (Snapshot fehlt lit. b)', () => {
    const luecke = snapshotEintrag({
      bloecke: [
        { absatz: '1', text: 'Einleitungssatz:', items: [{ marke: 'a', text: 'erster Punkt;' }] },
        { absatz: '2', text: 'Zweiter Absatz ohne Aufzählung.' },
      ],
    });
    const quelle = reduziereQuelleHtml(BEISPIEL_HTML).get('5')!;
    const snap = reduziereSnapshot([luecke]).get('5')!;
    expect(quelle.text).not.toBe(snap.text);
    expect(quelle.text).toContain('b. zweiter Punkt');
    expect(snap.text).not.toContain('zweiter Punkt');
  });
});
