// Fortsetzungs-Tiefe bei bild-unterbrochenen Aufzählungen (Befund 6 der
// Routing-Gegenprüfung 26.7.2026, PR #372). Amtlich verifiziert am gepinnten
// Stand (DBG SR 642.11, Konsolidierung 1.1.2026, PDF S. 17 · STHG SR 642.14,
// Konsolidierung 1.1.2025, PDF S. 6/7): die Fortsetzungs-Ziffern «2.» nach den
// Formelbildern stehen auf der Ziffern-Einrückungsebene (x=108 bei lit-x=90
// bzw. x=62 bei lit-x=45), gehören also unter lit. a bzw. lit. c (tiefe 1).
//
// Zwei Quellformen im gepinnten Fedlex-HTML:
//   Fall A — <dl><dl><dt>2.… : anonyme Unter-<dl> als DIREKTES <dl>-Kind
//            (Struktur-Signal vorhanden; der dt/dd-Scanner flachte sie ab).
//   Fall B — flaches <dl><dt>2.… direkt nach dem Bild-<p> (kein Struktur-
//            Signal; deterministische Fortsetzungsregel: Ziffern-Nachfolger
//            der unterbrochenen Unterliste, nur beim Anhängen an Bild-Blöcke).
import { describe, expect, it } from 'vitest';
import { parseArtikelInner } from '../../scripts/normtext/extrahiere-fedlex';

// Minimal-Fixtures, strukturtreu zum gepinnten DBG-/STHG-HTML (26.7.2026).
const FALL_A = `
<p class="absatz"><sup>3</sup>&nbsp;Einleitung wie folgt:</p>
<dl><dt>a. </dt><dd>Text zu a:<dl><dt>1. </dt><dd>Ist dieser Zinssatz grösser als null.</dd></dl></dd></dl>
<p class="bild"><img data-scaled-width="58" src="image/image1.png"></p>
<dl><dl><dt>2. </dt><dd>Ist dieser Zinssatz negativ oder null.</dd></dl><dt>b. </dt><dd>Text zu b.</dd></dl>
`;

const FALL_B = `
<p class="absatz"><sup>3</sup>&nbsp;Einleitung wie folgt:</p>
<dl><dt>c. </dt><dd>Text zu c:<dl><dt>1. </dt><dd>Ist diese Rendite grösser als null.</dd></dl></dd></dl>
<p class="bild"><img data-scaled-width="58" src="image/image2.png"></p>
<dl><dt>2. </dt><dd>Ist diese Rendite negativ oder null.</dd></dl>
`;

describe('Fall A — anonyme Unter-<dl> als direktes <dl>-Kind trägt Struktur-Tiefe', () => {
  it('DBG-22-Form: «2.» aus <dl><dl> erhält tiefe 1, lit. b bleibt Ebene 0', () => {
    const a = parseArtikelInner(FALL_A);
    expect(a.bloecke).toHaveLength(2); // Absatz (mit items) · Bild (mit Fortsetzungs-items)
    const [abs, bild] = [a.bloecke[0], a.bloecke[1]];
    expect(abs.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([
      ['a', 0],
      ['1', 1],
    ]);
    expect((bild as { bild?: unknown }).bild).toBeTruthy();
    expect(bild.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([
      ['2', 1],
      ['b', 0],
    ]);
  });
});

describe('Fall B — flache Fortsetzungs-<dl> nach Bild: Ziffern-Nachfolger erbt die Tiefe', () => {
  it('DBG-22-/STHG-7-Form: «2.» nach «1.» (tiefe 1) erhält tiefe 1', () => {
    const a = parseArtikelInner(FALL_B);
    const bild = a.bloecke[1];
    expect((bild as { bild?: unknown }).bild).toBeTruthy();
    expect(bild.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([['2', 1]]);
  });

  it('kein Erben ohne unterbrochene Unterliste (Vorgänger endet auf lit-Ebene)', () => {
    const html = `
<p class="absatz"><sup>1</sup>&nbsp;Einleitung:</p>
<dl><dt>a. </dt><dd>Text a.</dd><dt>b. </dt><dd>Text b.</dd></dl>
<p class="bild"><img src="image/image1.png"></p>
<dl><dt>2. </dt><dd>Eigenständige Ziffer.</dd></dl>
`;
    const a = parseArtikelInner(html);
    const bild = a.bloecke[1];
    expect(bild.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([['2', 0]]);
  });

  it('kein Erben bei Nicht-Nachfolger («3.» nach «1.»)', () => {
    const html = `
<p class="absatz"><sup>1</sup>&nbsp;Einleitung:</p>
<dl><dt>a. </dt><dd>Text a:<dl><dt>1. </dt><dd>Eins.</dd></dl></dd></dl>
<p class="bild"><img src="image/image1.png"></p>
<dl><dt>3. </dt><dd>Drei.</dd></dl>
`;
    const a = parseArtikelInner(html);
    const bild = a.bloecke[1];
    expect(bild.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([['3', 0]]);
  });

  it('kein Erben, wenn die Liste NICHT an einem Bild-Block hängt', () => {
    // Fortsetzungsregel ist eng auf die Bild-Unterbrechung begrenzt: eine <dl>
    // nach einem gewöhnlichen Absatz bleibt flach, auch wenn die Marken zufällig
    // fortlaufen (§1: keine breite Heuristik).
    const html = `
<p class="absatz"><sup>1</sup>&nbsp;Erster Absatz:</p>
<dl><dt>a. </dt><dd>Text a:<dl><dt>1. </dt><dd>Eins.</dd></dl></dd></dl>
<p class="absatz"><sup>2</sup>&nbsp;Zweiter Absatz:</p>
<dl><dt>2. </dt><dd>Zwei.</dd></dl>
`;
    const a = parseArtikelInner(html);
    const abs2 = a.bloecke[1];
    expect(abs2.absatz).toBe('2');
    expect(abs2.items?.map((it) => [it.marke, it.tiefe ?? 0])).toEqual([['2', 0]]);
  });
});
