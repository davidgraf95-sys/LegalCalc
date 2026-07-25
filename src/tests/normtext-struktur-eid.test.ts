import { describe, it, expect } from 'vitest';
import { extrahiereStruktur } from '../../scripts/normtext/struktur-extrahiere.ts';

// EID-1 (W2·5d §12, FAHRPLAN-GESETZES-UX.md): Fedlex-Container tragen kumulative
// AKN-Pfad-eIds als <section id="part_1/tit_1">. Der Extraktor schneidet sie
// ADDITIV ins Sidecar (`gliederung[i].eId`) mit — reine Outbound-Daten, bei jeder
// Regeneration neu erzeugt, NIE eigene Anker (§12.1/§12.4, K2/R8). Bestehende
// Felder (ebene/label/marginalie) bleiben byte-gleich.
//
// Fixture-Manier = reales Fedlex-Muster (verifiziert 24.7.2026 an /tmp/zgb.html,
// korpusweit 17'307 Sektionen): jede <section id="…"> wird UNMITTELBAR von ihrem
// Heading gefolgt (hN.heading für Gliederungsstufen, div.heading für Randtitel).
describe('extrahiereStruktur — Container-eIds im Sidecar (EID-1)', () => {
  const html =
    '<section id="part_1"><h1 class="heading" role="heading" aria-level="1">'
    + '<a href="#part_1">Erster Teil: Allgemeine Bestimmungen</a></h1><div class="collapseable">'
    + '<section id="part_1/tit_1"><h2 class="heading" role="heading" aria-level="2">'
    + '<a href="#part_1/tit_1">Erster Titel: Die Entstehung der Obligationen</a></h2><div class="collapseable">'
    + '<section id="part_1/tit_1/lvl_A"><div class="heading" role="heading" aria-level="3">'
    + '<a href="#part_1/tit_1/lvl_A">A. Abschluss des Vertrages</a></div><div class="collapseable">'
    + '<article id="art_1"><h6 class="heading"><a href="#art_1"><b>Art. 1</b></a></h6>'
    + '<div class="collapseable"><p class="absatz ">Text.</p></div></article>'
    + '</div></section></div></section></div></section>';

  it('trägt je Gliederungs-Ebene die Container-eId der umschliessenden <section>', () => {
    const s = extrahiereStruktur(html)['1'];
    expect(s.gliederung).toEqual([
      { ebene: 1, label: 'Erster Teil: Allgemeine Bestimmungen', eId: 'part_1' },
      { ebene: 2, label: 'Erster Titel: Die Entstehung der Obligationen', eId: 'part_1/tit_1' },
    ]);
  });

  it('lässt bestehende Felder unverändert (marginalie ohne eId, Labels byte-gleich)', () => {
    const s = extrahiereStruktur(html)['1'];
    expect(s.marginalie).toEqual(['A. Abschluss des Vertrages']);
  });

  it('setzt KEINE eId, wenn das Heading nicht von einer <section> umschlossen ist', () => {
    // Alt-Fixture-Manier (bestehende Tests): div.heading/hN ohne section-Wrapper.
    const ohneSektion =
      '<h2 class="heading"><a href="#x">Zweiter Titel</a></h2><div class="collapseable">'
      + '<article id="art_2"><h6 class="heading"><a href="#art_2"><b>Art. 2</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div>';
    const s = extrahiereStruktur(ohneSektion)['2'];
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Zweiter Titel' }]);
    expect('eId' in s.gliederung[0]).toBe(false);
  });

  it('verwirft eine pending-eId, wenn zwischen <section> und Heading ein anderes Tag liegt (NHG-h7-Manier)', () => {
    // NHG-Befund (24.7.2026): <section id="lvl_u1/chap_1"><h7 class="heading">…
    // h7 ist vom TAG-Regex unsichtbar; das nächste gematchte Tag ist ein
    // Nicht-Heading-div → die eId darf NICHT auf das nächste Heading leaken.
    const leak =
      '<section id="lvl_u1/chap_1"><h7 class="heading"><a href="#lvl_u1/chap_1">1. Abschnitt</a></h7>'
      + '<div class="footnotes"><p>fn</p></div>'
      + '<h2 class="heading"><a href="#y">Fremder Titel</a></h2><div class="collapseable">'
      + '<article id="art_3"><h6 class="heading"><a href="#art_3"><b>Art. 3</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div></section>';
    const s = extrahiereStruktur(leak)['3'];
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Fremder Titel' }]);
  });

  it('schneidet Schlusstitel-Container-eIds mit (disp-Schema)', () => {
    const disp =
      '<section id="disp_u1/chap_1"><h2 class="heading"><a href="#disp_u1/chap_1">Erster Abschnitt</a></h2>'
      + '<div class="collapseable"><article id="disp_u1/art_1"><h6 class="heading">'
      + '<a href="#disp_u1/art_1"><b>Art. 1</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div></section>';
    const s = extrahiereStruktur(disp)['disp_u1_art_1'];
    expect(s).toBeDefined();
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Erster Abschnitt', eId: 'disp_u1/chap_1' }]);
  });
});
