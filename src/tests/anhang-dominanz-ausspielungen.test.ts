import { describe, expect, it } from 'vitest';
import { ruheZeile } from '../pages/gesetz-leser/v3/uebersichtAngaben';
import { zaehlWort } from '../lib/normtext/erlassKopfText';

// W2·18-FEHLERBUCH — «Übersicht 607 Artikel» an SG-3849.
//
// BEFUND (auf Prod reproduziert 29.8.2026, /gesetze/kanton/SG-3849): Von den 607
// Einträgen des Snapshots sind 590 (97 %) Anhang-Einträge — «607 Artikel»
// behauptet einen Erlass, den es so nicht gibt.
//
// Die Regel dagegen existierte längst: `zaehlWort`/`ANHANG_DOMINANZ` (Fahrplan
// Kap. 14). Sie lief aber nur an EINEM der DREI Orte, an denen dieselbe Zahl
// ausgespielt wird — im Erlass-Kopf. Die Erlass-Übersicht und die Ruhezeile der
// Seitenleisten-Box hatten je einen eigenen, ungeregelten Formatierer. Genau das
// ist der §5-Fall: eine Zahl, drei Substantiv-Entscheide.
//
// Dieser Test hält die Ruhezeile an der gemeinsamen Regel fest. Rot zu bekommen:
// in `ruheZeile` den `zaehlWort`-Aufruf durch `bestimmungsWort` ersetzen.

const SG_3849 = { artikelAnzahl: 607, anhangArtikel: 590 };

describe('Ruhezeile folgt derselben Anhang-Dominanz-Regel wie der Kopf (§5)', () => {
  it('SG-3849: 590/607 im Anhang ⇒ «Einträge», nicht «Artikel»', () => {
    expect(ruheZeile({ ebene: 'kanton', sr: 'sGS 371.1' }, 607, 'Artikel', SG_3849))
      .toBe('sGS 371.1 · 607 Einträge');
  });

  it('dasselbe Wort, das der Erlass-Kopf über zaehlWort wählt — kein zweiter Entscheid', () => {
    const wortDerRuhezeile = ruheZeile({ ebene: 'bund', sr: '' }, 607, 'Artikel', SG_3849);
    expect(wortDerRuhezeile).toContain(zaehlWort('Artikel', SG_3849));
  });

  it('ohne Anhang-Dominanz bleibt das Basis-Wort stehen (OR: 1686 Artikel)', () => {
    expect(ruheZeile({ ebene: 'bund', sr: '220' }, 1686, 'Artikel', { artikelAnzahl: 1686, anhangArtikel: 3 }))
      .toBe('SR 220 · 1686 Artikel');
  });

  it('§-Erlasse behalten «Paragraphen», solange der Anhang nicht dominiert', () => {
    expect(ruheZeile({ ebene: 'kanton', sr: '211.11' }, 23, 'Paragraphen', { artikelAnzahl: 23, anhangArtikel: 0 }))
      .toContain('23 Paragraphen');
  });
});

describe('Alt-Aufrufer ohne Kennzahlen bleiben zeichengleich', () => {
  // Der vierte Parameter ist optional; alle bestehenden Aufrufe (u. a. die
  // Sonden in leser-v3-uebersicht.test.ts) übergeben ihn nicht. Fiele die
  // Rückfall-Ebene weg, wäre das eine stille Verhaltensänderung an jedem
  // Erlass, für den noch keine Gliederungs-Kennzahlen geladen sind.
  it('kein viertes Argument ⇒ Basis-Wort, wie vor der Änderung', () => {
    expect(ruheZeile({ ebene: 'bund', sr: '312.0' }, 480, 'Artikel')).toBe('SR 312.0 · 480 Artikel');
  });

  it('kennzahlen null ⇒ ebenfalls Basis-Wort', () => {
    expect(ruheZeile({ ebene: 'bund', sr: '312.0' }, 480, 'Artikel', null)).toBe('SR 312.0 · 480 Artikel');
  });

  it('artikelAnzahl 0 ⇒ keine Division, Basis-Wort', () => {
    expect(ruheZeile({ ebene: 'bund', sr: '312.0' }, 0, 'Artikel', { artikelAnzahl: 0, anhangArtikel: 0 }))
      .toBe('SR 312.0 · 0 Artikel');
  });
});
