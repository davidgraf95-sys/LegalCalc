import { describe, it, expect } from 'vitest';
import { extrahiereStruktur } from '../../scripts/normtext/struktur-extrahiere.ts';

// Artikel-eigene h6-Überschrift („Art. N <Sachtitel>") wie bei BV/ZPO/StPO usw.,
// wo der Randtitel IM Artikel-h6 steht (statt als separater div.heading wie OR/ZGB).
// Fedlex setzt die Nummer in <b>/<i>, Fussnoten in <sup>; der Rest ist der Sachtitel.
function artikel(id: string, h6Inner: string): string {
  return `<article id="${id}"><h6 class="heading">${h6Inner}</h6>`
    + `<div class="collapseable"><p class="absatz ">Text.</p></div></article>`;
}

describe('extrahiereStruktur — Artikel-h6-Sachtitel (BV-Manier)', () => {
  it('zieht den Sachtitel aus „Art. N <Titel>"', () => {
    const html = artikel('art_5', '<a href="#art_5"><b>Art. 5</b><b></b> <b></b>Grundsätze rechtsstaatlichen Handelns</a>');
    expect(extrahiereStruktur(html)['5'].marginalie).toEqual(['Grundsätze rechtsstaatlichen Handelns']);
  });

  it('behandelt Nummern-Suffix <i> und Fussnoten-<sup> korrekt', () => {
    const html = artikel('art_5_a', '<a href="#art_5_a"><b>Art. 5</b><i>a</i></a><sup><a href="#fn-x" id="fnbck-x">2</a></sup><a href="#art_5_a"> Subsidiarität</a>');
    expect(extrahiereStruktur(html)['5_a'].marginalie).toEqual(['Subsidiarität']);
  });

  it('lässt kombinierte Artikel ohne Sachtitel leer („Art. 370 und 371")', () => {
    const html = artikel('art_370_371', '<a href="#art_370_371"><b>Art. 370</b> und <b>371</b></a><sup><a href="#fn-y" id="fnbck-y">586</a></sup>');
    expect(extrahiereStruktur(html)['370_371'].marginalie).toEqual([]);
  });

  it('behält Enumerator-Titel („b. Bei- und Austritt")', () => {
    const html = artikel('art_94', '<a href="#art_94"><b>Art. 94</b> <b> </b>b. Bei- und Austritt, Wechsel der Franchise</a>');
    expect(extrahiereStruktur(html)['94'].marginalie).toEqual(['b. Bei- und Austritt, Wechsel der Franchise']);
  });

  it('liefert keinen Sachtitel bei reiner Nummer („Art. 3", OR-Manier)', () => {
    const html = artikel('art_3', '<a href="#art_3"><b>Art. 3</b></a>');
    expect(extrahiereStruktur(html)['3'].marginalie).toEqual([]);
  });

  // M12 (W2·5b): Fedlex trennt Wörter im h6-Sachtitel mit whitespace-tragenden
  // Leer-Tags «<b> </b>»/«<i> </i>». Wurden diese MIT Inhalt entfernt, verklebten
  // die Wörter («derÖffentlichkeit»). Der Fix ersetzt sie durch ein Leerzeichen.
  it('behält das Trenn-Leerzeichen aus «<b> </b>» (STPO Art. 74)', () => {
    const html = artikel('art_74', '<a href="#art_74"><b>Art. 74</b> Orientierung der<b> </b>Öffentlichkeit</a>');
    expect(extrahiereStruktur(html)['74'].marginalie).toEqual(['Orientierung der Öffentlichkeit']);
  });

  it('behält das Trenn-Leerzeichen aus «<i> </i>» (AHVV-Manier)', () => {
    const html = artikel('art_52', '<a href="#art_52"><b>Art. 52</b><i></i> <i></i>Für das<i> </i>Schliessen von Beitragslücken</a>');
    expect(extrahiereStruktur(html)['52'].marginalie).toEqual(['Für das Schliessen von Beitragslücken']);
  });

  // M12 (W2·5b) Gegenprüfungs-Fix: <b>/<i> tragen NICHT nur die Artikelnummer,
  // sondern auch ECHTEN Titeltext (kursive Begriffe, Binnen-Buchstabe). Diese
  // dürfen NICHT (auch nicht durch ein Leerzeichen) entfernt werden.
  it('behält einen Binnen-Buchstaben aus «<i>» ohne Leerzeichen (MG «Cyberspezialistinnen»)', () => {
    const html = artikel('art_48c', '<a href="#art_48c"><b>Art. 48c</b> Aus- und Weiterbildung von Cyber<i>s</i>pezialistinnen</a>');
    expect(extrahiereStruktur(html)['48c'].marginalie).toEqual(['Aus- und Weiterbildung von Cyberspezialistinnen']);
  });

  it('behält eine kursive Phrase aus «<i>» (GwV-FINMA «(Insurance Wrapper)»)', () => {
    const html = artikel('art_65a', '<a href="#art_65a"><b>Art. 65a</b> Lebensversicherung mit separater Kontoführung (<i>Insurance Wrapper</i>)</a>');
    expect(extrahiereStruktur(html)['65a'].marginalie).toEqual(['Lebensversicherung mit separater Kontoführung (Insurance Wrapper)']);
  });

  it('strippt das Bereichs-Suffix «<i>a–</i>» nach Ziffer (Nummer, kein Titeltext)', () => {
    const html = artikel('art_226a', '<a href="#art_226a"><b>Art. 226</b><i>a–</i><b>226d</b> Abzahlungsvertrag</a>');
    expect(extrahiereStruktur(html)['226a'].marginalie).toEqual(['Abzahlungsvertrag']);
  });

  it('strippt das Buchstaben-Suffix «<i>a</i>» nach Ziffer, behält aber Binnen-Buchstaben', () => {
    // Kollision: «86a»-Suffix (nach Ziffer → weg) vs. «Cybers» (nach Buchstabe → bleibt).
    const html = artikel('art_86a', '<a href="#art_86a"><b>Art. 86</b><i>a</i> Cyber<i>s</i>chutz</a>');
    expect(extrahiereStruktur(html)['86a'].marginalie).toEqual(['Cyberschutz']);
  });
});

// M12 (W2·5b): Fedlex setzt in mehrzeiligen Randtiteln/Gliederungs-Überschriften
// `<br>` als Zeilenumbruch. reinText() strippte Tags ersatzlos → die Wörter über
// den Zeilennähten verklebten («Beginn der Wirkungeneines unter…»). Der Fix wandelt
// `<br>`-Varianten VOR dem Tag-Strip in ein Leerzeichen (Muster wie kopf-extrahiere).
describe('extrahiereStruktur — <br>-Zeilennähte im Randtitel (M12)', () => {
  // Marginalie über einen div.heading (OR/ZGB-Manier): der div.heading «besitzt»
  // die folgende collapseable mit dem Artikel.
  function margArtikel(margInner: string, id: string): string {
    return `<div class="heading">${margInner}</div>`
      + `<div class="collapseable"><article id="${id}"><h6 class="heading">`
      + `<a href="#${id}"><b>Art. 10</b></a></h6>`
      + `<div class="collapseable"><p class="absatz ">Text.</p></div></article></div>`;
  }

  it('fügt an jeder <br>-Naht ein Leerzeichen ein (OR Art. 10 III.)', () => {
    const html = margArtikel(
      '<a href="#art_10">III.  Beginn der Wirkungen<br>eines unter<br>Abwesenden<br>geschlossenen Vertrages</a>',
      'art_10',
    );
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual([
      'III. Beginn der Wirkungen eines unter Abwesenden geschlossenen Vertrages',
    ]);
  });

  it('behandelt <br/>- und <br />-Varianten identisch (case-insensitiv)', () => {
    const html = margArtikel(
      '<a href="#art_10">A. Titel<BR/>Teil zwei<br />Teil drei</a>',
      'art_10',
    );
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['A. Titel Teil zwei Teil drei']);
  });

  // M12 (W2·5b) Gegenprüfungs-Fix: «-<br>» ist KEIN Wort-Umbruch, sondern ein
  // Trennstrich. Pauschal «<br>»→Leerzeichen zerriss Silbentrennungen
  // («Adoptions-<br>urlaub» → «Adoptions- urlaub»). Kontext entscheidet.
  it('fügt eine Silbentrennung zusammen und entfernt den Trennstrich (OR «Adoptionsurlaub»)', () => {
    const html = margArtikel('<a href="#art_10">Adoptions-<br>urlaub</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Adoptionsurlaub']);
  });

  it('behält das hängende Divis vor einer Konjunktion (KoV «Protokoll- und …»)', () => {
    const html = margArtikel('<a href="#art_10">Protokoll-<br>und Vollzug</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Protokoll- und Vollzug']);
  });

  it('behält den Bindestrich bei Kompositum-Umbruch vor Grossbuchstabe', () => {
    const html = margArtikel('<a href="#art_10">Bau-<br>Nebenbetrieb</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Bau-Nebenbetrieb']);
  });

  it('behält das hängende Divis vor einer Präposition (OR «Inhaber- in Namenaktien»)', () => {
    // Quelle: «Inhaber- <br>in Namenaktien» — «in» ist Präposition, KEINE Silbentrennung.
    const html = margArtikel('<a href="#art_10">Umwandlung von Inhaber- <br>in Namenaktien</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Umwandlung von Inhaber- in Namenaktien']);
  });

  it('fügt einen literalen Quell-Trennstrich ohne <br> zusammen (VStV «Kassenobligationen»)', () => {
    const html = margArtikel('<a href="#art_10">2. Kassenobli- gationen u.dgl.</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['2. Kassenobligationen u.dgl.']);
  });

  it('lässt eine hängende Divis-Liste vor Grossbuchstabe unberührt («Hilfs- Neben- und …»)', () => {
    const html = margArtikel('<a href="#art_10">Hilfs- Neben- und gemischte Betriebe</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Hilfs- Neben- und gemischte Betriebe']);
  });
});

// HAENGEND-Härtung (R3-Nebenbefund 24.7.2026, FAHRPLAN-GESETZESDARSTELLUNG-BUND
// §M12-Folge): Eine in HAENGEND FEHLENDE Konjunktion/Präposition erzeugt einen
// still kleingeschriebenen Fehl-Merge («Straf- wie …» → «Strafwie …»), den keine
// Tor-Klasse sieht (nach dem Merge existiert weder ein «- <klein>»-Rest noch eine
// klein-GROSS-Naht). Korpusweit heute 0 Treffer (R2/R3-verifiziert) — reine
// Zukunfts-Robustheit für neue Erlasse. Liste bleibt synchron mit check-verklebung.
describe('extrahiereStruktur — HAENGEND-Härtung (wie/samt/je/pro/per/statt/trotz/ab/wider/als/noch/nebst)', () => {
  function margArtikel(margInner: string, id: string): string {
    return `<div class="heading">${margInner}</div>`
      + `<div class="collapseable"><article id="${id}"><h6 class="heading">`
      + `<a href="#${id}"><b>Art. 10</b></a></h6>`
      + `<div class="collapseable"><p class="absatz ">Text.</p></div></article></div>`;
  }
  const faelle: Array<[string, string]> = [
    ['Straf-<br>wie Massnahmenvollzug', 'Straf- wie Massnahmenvollzug'],
    ['Grundstück-<br>samt Zubehör', 'Grundstück- samt Zubehör'],
    ['Pauschale-<br>je Einheit', 'Pauschale- je Einheit'],
    ['Gebühr-<br>pro Verrichtung', 'Gebühr- pro Verrichtung'],
    ['Entschädigung-<br>per Saldo', 'Entschädigung- per Saldo'],
    ['Miet-<br>statt Kaufzins', 'Miet- statt Kaufzins'],
    ['Handeln-<br>trotz Verbots', 'Handeln- trotz Verbots'],
    ['Auf-<br>ab Inkrafttreten', 'Auf- ab Inkrafttreten'],
    ['Für-<br>wider den Entscheid', 'Für- wider den Entscheid'],
    ['sowohl Straf-<br>als auch Massnahmenvollzug', 'sowohl Straf- als auch Massnahmenvollzug'],
    ['weder Straf-<br>noch Massnahmenvollzug', 'weder Straf- noch Massnahmenvollzug'],
    ['Grundstück-<br>nebst Zubehör', 'Grundstück- nebst Zubehör'],
  ];
  for (const [roh, soll] of faelle) {
    it(`behält das hängende Divis: «${soll}»`, () => {
      const html = margArtikel(`<a href="#art_10">${roh}</a>`, 'art_10');
      expect(extrahiereStruktur(html)['10'].marginalie).toEqual([soll]);
    });
  }
  it('literaler Trennstrich: «X- wie» bleibt ebenfalls hängend (Regel c synchron)', () => {
    const html = margArtikel('<a href="#art_10">Straf- wie Massnahmenvollzug</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Straf- wie Massnahmenvollzug']);
  });
  // «gen» bewusst NICHT gelistet (Prüfer-Kalibrierung): häufigste deutsche End-Silbe
  // (Korpus-Beleg «Motorwa- gen», SSV), ~kein Titel-Nutzen als Präposition. Ein
  // «Wa-<br>gen»-Silbenriss MUSS weiterhin zusammengefügt werden.
  it('fügt «gen» als echte End-Silbe weiter zusammen (bewusste Nicht-Listung)', () => {
    const html = margArtikel('<a href="#art_10">Motorwa-<br>gen und Motorräder</a>', 'art_10');
    expect(extrahiereStruktur(html)['10'].marginalie).toEqual(['Motorwagen und Motorräder']);
  });
});
