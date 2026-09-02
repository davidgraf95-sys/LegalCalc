// ─── Z5 (W2·22-VERWEIS-FEDLEX): AUSGESCHRIEBENE Artikelverweise «Artikel N …
//     KÜRZEL» ────────────────────────────────────────────────────────────────
//
// Belegte Lücke (Klasse A des Zitatgraph-Berichts `messwerte/
// zitatgraph-warnungen.md`, erzeugt aus den amtlichen jolux:Citation-Kanten von
// Fedlex): 824 vergleichbare Kanten, bei denen der Normtext das Ziel-Kürzel
// AUSGESCHRIEBEN nennt («Artikel 29 Absatz 1 ATSG»), LexMetrik es über
// `fremdgesetzNachArtikel` (N2 Form A) auch ERKENNT — und den Link bis hierher
// bloss UNTERDRÜCKT statt ihn zu setzen (Kontrakt bis W2·22: «lieber kein Link
// als ein falscher», David-Entscheid 28.6.2026). Z5 hebt genau diese Klasse.
//
// Alle neun Positiv-Belege sind WÖRTLICH aus den committeten Snapshots
// (`public/normtext/bund/<Kürzel>.json`, Stand 2026-01-01, quelleUrl
// fedlex.admin.ch) entnommen — nichts aus dem Gedächtnis zitiert (§7).

import { describe, it, expect } from 'vitest';
import { ausgeschriebeneVerweiseImText, normVerweiseImText } from './spannen';

/** Kurzform: (anzeige, auflösbares Ziel) je erkannter Spanne. */
const treffer = (t: string, eigenes?: string) =>
  ausgeschriebeneVerweiseImText(t, eigenes).map((s) => [s.anzeige, s.artikel] as const);

// ─── Positiv: die neun amtlich belegten Korpus-Stellen ───────────────────────

describe('ausgeschriebeneVerweiseImText — belegte Korpus-Stellen (Klasse A)', () => {
  it('IVG art_10: «nach Artikel 29 Absatz 1 ATSG» → ATSG art_29', () => {
    const t = 'Der Anspruch auf Integrationsmassnahmen zur Vorbereitung auf die berufliche Eingliederung sowie auf Massnahmen beruflicher Art entsteht frühestens im Zeitpunkt der Geltendmachung des Leistungsanspruchs nach Artikel 29 Absatz 1 ATSG.';
    expect(treffer(t, 'IVG')).toEqual([['Artikel 29', 'Art. 29 ATSG']]);
  });

  it('AIG art_68a: «Artikel 66a oder 66abis StGB oder Artikel 49a oder 49abis MStG» → je ein Glied', () => {
    const t = 'eine Landesverweisung nach Artikel 66a oder 66abis StGB oder Artikel 49a oder 49abis MStG bei Vollzugsanordnung;';
    expect(treffer(t, 'AIG')).toEqual([
      ['Artikel 66a', 'Art. 66a StGB'],
      ['66abis', 'Art. 66abis StGB'],
      ['Artikel 49a', 'Art. 49a MStG'],
      ['49abis', 'Art. 49abis MStG'],
    ]);
  });

  it('VZV art_106: «nach Artikel 221 Absätze 3 und 4 VTS» → VTS art_221 (Absätze nur Anzeige)', () => {
    const t = 'Mit dem Entzug des Fahrzeugausweises sind immer auch die Kontrollschilder zu entziehen. Bei Wechselschildern können die Schilder für ein Fahrzeug belassen werden. Die Sicherstellung von Fahrzeugen richtet sich nach Artikel 221 Absätze 3 und 4 VTS.';
    expect(treffer(t, 'VZV')).toEqual([['Artikel 221', 'Art. 221 VTS']]);
  });

  it('AVIG art_79: «Artikel 242 SchKG gilt sinngemäss» → SchKG art_242', () => {
    const t = 'Der Zahlungsverkehr einer privaten Arbeitslosenkasse muss über Bank- oder Postkonten abgewickelt werden, die ausschliesslich für diesen Zweck verwendet werden dürfen. Im Konkurs des Trägers fallen die Guthaben auf diesen Konten nicht in die Konkursmasse. Artikel 242 SchKG gilt sinngemäss.';
    expect(treffer(t, 'AVIG')).toEqual([['Artikel 242', 'Art. 242 SchKG']]);
  });

  it('BankV art_65: «nach Artikel 124a ERV» → ERV art_124a', () => {
    const t = 'Eine nach Artikel 124a ERV international tätige systemrelevante Bank muss ihre Sanier- und Liquidierbarkeit im In- und Ausland aufrechterhalten.';
    expect(treffer(t, 'BankV')).toEqual([['Artikel 124a', 'Art. 124a ERV']]);
  });

  it('AsylG art_98: «nach Artikel 16 DSG» → DSG art_16', () => {
    const t = 'Das SEM und die Beschwerdebehörden dürfen zum Vollzug dieses Gesetzes den mit entsprechenden Aufgaben betrauten ausländischen Behörden und internationalen Organisationen Personendaten bekannt geben, sofern die Voraussetzungen nach Artikel 16 DSG erfüllt sind.';
    expect(treffer(t, 'AsylG')).toEqual([['Artikel 16', 'Art. 16 DSG']]);
  });

  it('IVG art_66a: «in Artikel 1a Absatz 1 Buchstabe c UVG» → UVG art_1a', () => {
    const t = 'Die Invalidenversicherung stellt der Schweizerischen Unfallversicherungsanstalt die Personendaten, die zur Risikoanalyse der Unfälle von in Artikel 1a Absatz 1 Buchstabe c UVG bezeichneten Personen erforderlich sind, anonymisiert zur Verfügung.';
    expect(treffer(t, 'IVG')).toEqual([['Artikel 1a', 'Art. 1a UVG']]);
  });

  it('KVG art_79a: «Das Rückgriffsrecht nach Artikel 72 ATSG» → ATSG art_72', () => {
    const t = 'Das Rückgriffsrecht nach Artikel 72 ATSG gilt sinngemäss:';
    expect(treffer(t, 'KVG')).toEqual([['Artikel 72', 'Art. 72 ATSG']]);
  });

  it('KVV art_31: «nach Artikel 39 KVG» → KVG art_39; «Artikel 51 dieser Verordnung» bleibt Text', () => {
    const t = 'Das BAG veröffentlicht die Ergebnisse der weitergebenen Daten zu den Spitälern und anderen Einrichtungen nach Artikel 39 KVG sowie zu den Organisationen der Krankenpflege und Hilfe zu Hause nach Artikel 51 dieser Verordnung auf Stufe der einzelnen Einrichtung mit deren Namen und Standort.';
    expect(treffer(t, 'KVV')).toEqual([['Artikel 39', 'Art. 39 KVG']]);
  });
});

// ─── Negativ: wo Z5 bewusst NICHT verlinkt (§1) ──────────────────────────────

describe('ausgeschriebeneVerweiseImText — Negativfälle (§1: kein Link statt falscher)', () => {
  it('N1 «Artikel 5 dieses Gesetzes» — Selbstmarker, kein Erlassname', () => {
    expect(treffer('Vorbehalten bleibt Artikel 5 dieses Gesetzes.')).toEqual([]);
  });

  it('N2 «Artikel 3 der Verordnung» — generischer Name ohne Kürzel', () => {
    expect(treffer('Es gilt Artikel 3 der Verordnung über die Sache.')).toEqual([]);
  });

  it('N3 «Artikel» ohne Zahl', () => {
    expect(treffer('Die Artikel gelten sinngemäss.')).toEqual([]);
  });

  it('N4 AIG art_31: «Artikel 68 des vorliegenden Gesetzes» bleibt Text, die vier Glieder werden geroutet', () => {
    const t = 'Staatenlose Personen nach den Absätzen 1 und 2 sowie staatenlose Personen, die mit einer rechtskräftigen Landesverweisung nach Artikel 66a oder 66abis StGB oder Artikel 49a oder 49abis MStG oder mit einer rechtskräftigen Ausweisung nach Artikel 68 des vorliegenden Gesetzes belegt sind, können in der ganzen Schweiz eine Erwerbstätigkeit ausüben. Artikel 61 AsylG gilt sinngemäss.';
    expect(treffer(t, 'AIG')).toEqual([
      ['Artikel 66a', 'Art. 66a StGB'],
      ['66abis', 'Art. 66abis StGB'],
      ['Artikel 49a', 'Art. 49a MStG'],
      ['49abis', 'Art. 49abis MStG'],
      // Ziel-Kürzel ist der FEDLEX-KEY («ASYLG»), nicht die amtliche
      // Schreibweise des Quelltexts («AsylG») — dieselbe Synthese wie in
      // `fremdRoutingFormB`; angezeigt wird ohnehin nur `anzeige`.
      ['Artikel 61', 'Art. 61 ASYLG'],
    ]);
  });

  it('N5 VZV art_116: «Artikel 108 dieser Verordnung» bleibt Text (Self-Wendung)', () => {
    const t = 'Für das Verfahren gilt Artikel 108 dieser Verordnung sowie Artikel 221 Absätze 3 und 4 VTS.';
    expect(treffer(t, 'VZV')).toEqual([['Artikel 221', 'Art. 221 VTS']]);
  });

  it('N6 IVG art_11a: «Artikel 29septies AHVG» — Suffix ausserhalb der geteilten Nummern-Grammatik', () => {
    const t = 'der Familienangehörigen, für die ihnen ein Anspruch auf Anrechnung einer Betreuungsgutschrift nach Artikel 29septies AHVG zusteht.';
    expect(treffer(t, 'IVG')).toEqual([]);
  });

  it('N7 Self-Ausschluss: «Artikel 39 KVG» im KVG selbst', () => {
    expect(treffer('Einrichtungen nach Artikel 39 KVG sind zugelassen.', 'KVG')).toEqual([]);
  });

  it('N8 Form B bleibt zuständig: «Artikel 66a oder 66abis des Strafgesetzbuchs (StGB)»', () => {
    expect(treffer('Landesverweisung nach Artikel 66a oder 66abis des Strafgesetzbuchs (StGB) betroffen', 'AIG')).toEqual([]);
  });

  it('N9 Plural-Region (A10) bleibt zuständig: «die Artikel 32 und 33 ATSG»', () => {
    expect(treffer('Es gelten die Artikel 32 und 33 ATSG sinngemäss.', 'IVG')).toEqual([]);
  });

  it('N10 Zeit-Kante: «Artikel 5 DSG vom 19. Juni 1992» meint das aufgehobene aDSG', () => {
    expect(treffer('Es gilt Artikel 5 DSG vom 19. Juni 1992 sinngemäss.')).toEqual([]);
  });

  it('N11 unbekanntes Kürzel: «Artikel 2 und 3 BGSA»', () => {
    expect(treffer('im vereinfachten Verfahren nach Artikel 2 und 3 BGSA haben die Arbeitgeber')).toEqual([]);
  });

  it('N12 Wortgrenze: «Artikel 5 ORganisation» ist kein OR-Verweis', () => {
    expect(treffer('Massgeblich ist Artikel 5 ORganisation und Aufbau.')).toEqual([]);
  });
});

// ─── Einhängung in die Spannen-Kette ────────────────────────────────────────

describe('normVerweiseImText — Z5 additiv eingehängt', () => {
  it('liefert die ausgeschriebene Spanne mit `ausgeschrieben`-Marke', () => {
    const s = normVerweiseImText('Der Anspruch entsteht nach Artikel 29 Absatz 1 ATSG.', 'IVG');
    expect(s).toEqual([{
      start: 27, end: 37, anzeige: 'Artikel 29', artikel: 'Art. 29 ATSG',
      propagiert: false, ausgeschrieben: true,
    }]);
  });

  it('der voll zitierte Anker (NORM_IM_TEXT) behält den Vorrang — keine doppelte Spanne', () => {
    const s = normVerweiseImText('Der Anspruch entsteht nach Art. 29 Abs. 1 ATSG.', 'IVG');
    expect(s.map((x) => [x.anzeige, x.artikel])).toEqual([['Art. 29 Abs. 1 ATSG', 'Art. 29 Abs. 1 ATSG']]);
  });

  it('Ketten-Propagierung bleibt unberührt', () => {
    const s = normVerweiseImText('Art. 684 i.V.m. Art. 679 ZGB');
    expect(s.map((x) => [x.anzeige, x.artikel])).toEqual([
      ['Art. 684', 'Art. 684 ZGB'],
      ['Art. 679 ZGB', 'Art. 679 ZGB'],
    ]);
  });
});
