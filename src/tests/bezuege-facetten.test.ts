import { describe, it, expect } from 'vitest';
import {
  DECKEL_JE_STATUS, STATUS_RANG, bezugStatusFuerEntscheid, facettenFuerEntscheid,
  facettenFuerMaterial, vergleicheStatus, zaehleFacetten,
} from '../lib/verzahnung/facetten';
import { extrahiereParagraphGruppen, extrahiereStatutRefs } from '../lib/rechtsprechung/zitat-extraktion';
import {
  SYSTEMATIK_PRAEFIX, amtlichesKuerzel, baueNummernDominanz, kantoneOhneResolver,
  kuerzelKonsistent, loeseKantonZitate, titelParagraphen,
} from '../../scripts/normtext/kanton-norm-resolver';
import { fremdDefinierteKeys } from '../../scripts/normtext/entscheide-mapping';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';
import { bezuegeFuerArtikel, filtereBezuege, trefferJeStatus } from '../lib/rechtsprechung/bezuege';
import type { BezugsShard } from '../lib/rechtsprechung/bezuege';

// W2·7-BEZUG B1–B3, Datenschicht. Getestet wird das, was fachlich falsch werden
// KANN: die Status-Achse (§8 — Leitentscheid nie stillschweigend gleichgestellt),
// die kantonale Auflösung samt beidseitigem Ambiguitäts-Ausschluss (§1) und die
// ehrliche Grundgesamtheit.

describe('B1 · Status-Achse trennt, was rechtlich verschieden ist (§8)', () => {
  const bge = { gericht: 'bge', gerichtstyp: 'bundesgericht', kanton: 'CH', leitcharakter: 'leitentscheid' };
  const bger = { gericht: 'bger', gerichtstyp: 'bundesgericht', kanton: 'CH', leitcharakter: 'routine' };
  const bvger = { gericht: 'bvger', gerichtstyp: 'bundesverwaltungsgericht', kanton: 'CH', leitcharakter: 'routine' };
  const bs = { gericht: 'bs_appellationsgericht', gerichtstyp: 'kantonal', kanton: 'BS', leitcharakter: 'routine' };

  it('unterscheidet BGE, übriges BGer-Urteil, eidg. Gericht und kantonalen Entscheid', () => {
    expect(bezugStatusFuerEntscheid(bge)).toBe('bge');
    expect(bezugStatusFuerEntscheid(bger)).toBe('bger');
    expect(bezugStatusFuerEntscheid(bvger)).toBe('eidg');
    expect(bezugStatusFuerEntscheid(bs)).toBe('kantonal');
  });

  it('«routine» allein sagt nichts — BGer-Urteil und BS-Entscheid tragen beide routine', () => {
    // Genau der Grund, warum es die Achse gibt: leitcharakter kollabiert die beiden.
    expect(bger.leitcharakter).toBe(bs.leitcharakter);
    expect(bezugStatusFuerEntscheid(bger)).not.toBe(bezugStatusFuerEntscheid(bs));
  });

  it('das GERICHT entscheidet vor dem leitcharakter — ein kantonaler «leitentscheid» wird nie BGE', () => {
    // Es gibt keine amtliche Sammlung des Bundes für kantonale Entscheide (§8).
    expect(bezugStatusFuerEntscheid({ ...bs, leitcharakter: 'leitentscheid' })).toBe('kantonal');
  });

  it('ebene ist Funktion des Kantons, nicht frei gesetzt', () => {
    expect(facettenFuerEntscheid(bge).ebene).toBe('bund');
    expect(facettenFuerEntscheid(bs).ebene).toBe('kanton');
    expect(facettenFuerEntscheid(bs).kanton).toBe('BS');
  });

  it('Rangordnung: amtlicher Leitentscheid vor allem, Materialien zuletzt', () => {
    expect(vergleicheStatus('bge', 'bger')).toBeLessThan(0);
    expect(vergleicheStatus('bger', 'eidg')).toBeLessThan(0);
    expect(vergleicheStatus('eidg', 'kantonal')).toBeLessThan(0);
    expect(vergleicheStatus('kantonal', 'material')).toBeLessThan(0);
  });
});

describe('B1 · die Schicht ist generisch, nicht nur so genannt (§5)', () => {
  it('Materialien-Kanten durchlaufen dieselben Facetten, denselben Deckel, dieselbe Ordnung', () => {
    const m = facettenFuerMaterial('seco');
    expect(m.quelltyp).toBe('materialien');
    expect(m.ebene).toBe('bund');
    expect(m.status).toBe('material');
    // Kein Sonderweg: der Status hat einen Deckel und einen Rang wie jeder andere.
    expect(DECKEL_JE_STATUS.material).toBeGreaterThan(0);
    expect(STATUS_RANG.material).toBeGreaterThan(STATUS_RANG.kantonal);
  });

  it('kantonale Materialien bekommen die kantonale Ebene, ohne zweites Modell', () => {
    expect(facettenFuerMaterial('bs_jd', 'BS').ebene).toBe('kanton');
  });

  it('zaehleFacetten liefert je Achse eine Bilanz mit Grundgesamtheit', () => {
    const b = zaehleFacetten([
      facettenFuerEntscheid({ gericht: 'bge', gerichtstyp: 'bundesgericht', kanton: 'CH', leitcharakter: 'leitentscheid' }),
      facettenFuerEntscheid({ gericht: 'bs_zivilgericht', gerichtstyp: 'kantonal', kanton: 'BS', leitcharakter: 'routine' }),
      facettenFuerMaterial('seco'),
    ]);
    expect(b.gesamt).toBe(3);
    expect(b.status).toEqual({ bge: 1, kantonal: 1, material: 1 });
    expect(b.ebene).toEqual({ bund: 2, kanton: 1 });
  });
});

describe('B2 · «§»-Tokenizer — dieselbe Grammatik wie «Art.», eigener Pfad', () => {
  it('liest Einzel-Zitat, Kette und Bereich', () => {
    expect(extrahiereParagraphGruppen('§ 93 Abs. 1 Ziff. 1 GOG')[0].artikel).toEqual(['93']);
    expect(extrahiereParagraphGruppen('§§ 88 Abs. 1 und 93 Abs. 1 Ziff. 1 des GOG')[0].artikel).toEqual(['88', '93']);
    expect(extrahiereParagraphGruppen('§ 63b Schulgesetz')[0].artikel).toEqual(['63b']);
  });

  it('erbt den Phantom-Ketten-Schutz: «§ 12 Abs. 1 und 2» ist EIN Artikel', () => {
    expect(extrahiereParagraphGruppen('§ 12 Abs. 1 und 2 VRPG')[0].artikel).toEqual(['12']);
  });

  it('`ende` zeigt hinter die Gruppe — dort sucht der Resolver den Erlass', () => {
    const t = '§ 30 des Gesetzes über die Verfassungs- und Verwaltungsrechtspflege';
    const g = extrahiereParagraphGruppen(t)[0];
    expect(t.slice(g.ende).startsWith(' des Gesetzes')).toBe(true);
  });

  it('KERN-SICHERUNG: der Bundes-Extraktor sieht «§» weiterhin NICHT', () => {
    // Sonst liefe «§ 12 StG» (kantonales Steuerrecht) über normKeyFuerAbk auf
    // einen Bundes-Register-key. Die Trennung der beiden Pfade IST die Sicherung.
    expect(extrahiereStatutRefs('§ 12 Abs. 2 EG ZGB')).toEqual([]);
    expect(extrahiereStatutRefs('§ 93 GOG')).toEqual([]);
  });
});

describe('B2 · kantonaler Resolver — Nummer schlägt Abkürzung', () => {
  const bestand = new Map([
    ['154.100', 'BS-154.100'],
    ['270.100', 'BS-270.100'],
    ['BeE 786.100', 'BS-BeE 786.100'],
  ]);

  it('löst über die amtliche Systematik-Nummer auf', () => {
    const b = loeseKantonZitate(
      '§ 93 Abs. 1 Ziff. 1 des Gerichtsorganisationsgesetzes (GOG, SG 154.100) ist anwendbar.',
      'BS', bestand,
    );
    expect(b.zitate).toEqual([{ erlass: 'BS-154.100', artikel: '93', kanal: 'nummer' }]);
  });

  it('bindet die Abkürzung dokumentlokal und löst Folge-Nennungen auf', () => {
    const b = loeseKantonZitate(
      'Nach § 93 des Gerichtsorganisationsgesetzes (GOG, SG 154.100). Ferner § 44 Abs. 2 GOG.',
      'BS', bestand,
    );
    expect(b.zitate).toContainEqual({ erlass: 'BS-154.100', artikel: '93', kanal: 'nummer' });
    expect(b.zitate).toContainEqual({ erlass: 'BS-154.100', artikel: '44', kanal: 'abkuerzung' });
  });

  it('Gemeinde-Teilsammlungen bleiben unterscheidbar (BeE 786.100 ≠ 786.100)', () => {
    const b = loeseKantonZitate('§ 5 der Abfallordnung (SG BeE 786.100)', 'BS', bestand);
    expect(b.zitate).toEqual([{ erlass: 'BS-BeE 786.100', artikel: '5', kanal: 'nummer' }]);
  });

  it('AMBIGUITÄTS-AUSSCHLUSS (a): kantonale Namensvetter des Bundesrechts werden NIE gebunden', () => {
    // «ZGB» ist ein Bundes-Register-key. Auch wenn ein BS-Entscheid es als
    // Kurzform eines kantonalen Erlasses einführt, darf die Bindung nicht
    // entstehen — lieber die Folge-Nennungen verlieren (§1/§8).
    const b = loeseKantonZitate(
      'Nach § 2 des Einführungsgesetzes (ZGB, SG 270.100). Ferner § 9 ZGB.',
      'BS', bestand,
    );
    expect(b.abkAusgeschlossen).toContain('ZGB');
    expect(b.zitate.some((z) => z.artikel === '9')).toBe(false);
  });

  it('AMBIGUITÄTS-AUSSCHLUSS (b): kein «§»-Zitat erzeugt je einen Bundes-Register-key', () => {
    const b = loeseKantonZitate('§ 12 StG und § 5 KV', 'BS', bestand);
    expect(b.zitate).toEqual([]);
    // strukturell: alle Erlass-keys tragen den Kantons-Präfix
    for (const z of b.zitate) expect(z.erlass.startsWith('BS-')).toBe(true);
  });

  it('eine geschlossene Klammer beendet das Zitat — der nächste Locator gehört nicht dazu', () => {
    // Belegte FP-Klasse (Korpus 28.7.2026): «§ 71 … GOG). Weder aus dem GOG noch
    // aus dem Organisationsreglement des Zivilgerichts (SG 154.170)».
    const b = loeseKantonZitate(
      '§ 71 Abs. 1 GOG). Weder aus dem GOG noch aus dem Verwaltungsrechtspflegegesetz (SG 270.100) folgt etwas.',
      'BS', bestand,
    );
    expect(b.zitate.some((z) => z.artikel === '71' && z.erlass === 'BS-270.100')).toBe(false);
  });

  it('ein Kürzel VOR der Klammer beendet das Zitat ebenfalls', () => {
    // Belegte FP-Klasse: «§ 19 Abs. 1 KESG mangels … nach dem Gesetz über die
    // Verfassungs- und Verwaltungsrechtspflege (VRPG, SG 270.100)».
    const b = loeseKantonZitate(
      '§ 19 Abs. 1 KESG mangels spezialgesetzlicher Regelung nach dem Verwaltungsrechtspflegegesetz (VRPG, SG 270.100)',
      'BS', bestand,
    );
    expect(b.zitate.some((z) => z.artikel === '19')).toBe(false);
  });

  it('Struktur-Marker sind keine Kürzel — legitime Ketten überleben', () => {
    const b = loeseKantonZitate(
      '§§ 88 Abs. 1 und 93 Abs. 1 Ziff. 1 des Gerichtsorganisationsgesetzes [GOG, SG 154.100]',
      'BS', bestand,
    );
    expect(b.zitate.map((z) => z.artikel).sort()).toEqual(['88', '93']);
  });

  it('unbekannte Nummer → Lücke, nie Rateversuch; die Nummer wird ausgewiesen', () => {
    const b = loeseKantonZitate('§ 4 des Gesetzes über X (SG 999.999)', 'BS', bestand);
    expect(b.zitate).toEqual([]);
    expect(b.nummerOhneBestand).toEqual(['999.999']);
  });

  it('Kanton ohne deklarierten Systematik-Präfix liefert nichts (benannte Lücke, §8)', () => {
    expect(loeseKantonZitate('§ 93 GOG (SG 154.100)', 'ZH', bestand).zitate).toEqual([]);
    expect(SYSTEMATIK_PRAEFIX.has('BS')).toBe(true);
    expect(kantoneOhneResolver(['CH', 'BS', 'ZH', 'AG'])).toEqual(['AG', 'ZH']);
  });

  it('ist rein: zweimal derselbe Aufruf, dasselbe Ergebnis (§2)', () => {
    const t = '§ 93 GOG (SG 154.100) und § 12 (SG 270.100)';
    expect(loeseKantonZitate(t, 'BS', bestand)).toEqual(loeseKantonZitate(t, 'BS', bestand));
  });
});

describe('B1-Riegel · das Dokument schlägt die Abkürzungs-Tabelle (Gegenprüfung R1)', () => {
  const snap = (text: string): EntscheidSnapshot => ({
    id: 'kanton/BS/x/T.1', gericht: 'bs_appellationsgericht', gerichtName: 'AG BS',
    gerichtstyp: 'kantonal', kanton: 'BS', abteilung: null, nummer: 'T.1', bgeReferenz: null,
    zitierung: 'T.1', datum: '2025-01-01', sprache: 'de', leitcharakter: 'routine',
    sachgebiet: 'oeffentlich', legalArea: null, rubrum: null, regeste: null, regesteAmtlich: false,
    abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: null, text }] }],
    dispositivOrders: [], zitierteNormen: [], normKeys: [], zitierteEntscheide: [],
    bestand: 'snapshot', kuratierung: 'maschinell', quelle: 'gerichte-bs',
    quelleUrl: 'https://example.invalid', abgerufen: '2025-01-01', fassungsToken: 'h', sha: 's',
  } as unknown as EntscheidSnapshot);

  it('ARM A — Titel-Definition ohne Überschneidung sperrt den Key (Fall BPR)', () => {
    // Wortlaut aus bs_appellationsgericht/VD.2025.5 (Anlassfall der Gegenprüfung).
    const t = 'Verordnung (EU) Nr. 528/2012 über die Bereitstellung auf dem Markt und die '
      + 'Verwendung von Biozidprodukten (Biozidprodukteverordnung, BPR). Art. 3 Abs. 1 lit. a BPR …';
    expect(fremdDefinierteKeys(snap(t)).has('BPR')).toBe(true);
  });

  it('ARM B — Titel VOR der Klammer, kantonales Sigel dahinter (Fall KAG)', () => {
    // Wortlaut aus be_verwaltungsgericht/2002024417 (eigene Stichprobe).
    const t = 'Gemäss Art. 42 des kantonalen Anwaltsgesetzes vom 28. März 2006 (KAG; BSG 168.11) bezahlt der Kanton …';
    expect(fremdDefinierteKeys(snap(t)).has('KAG')).toBe(true);
  });

  it('sperrt NICHT, wenn der genannte Titel zum Register-Erlass passt', () => {
    // Belegte Über-Sperr-Fälle: kantonales Sigel vor einer BUNDES-Nummer.
    expect(fremdDefinierteKeys(snap('Art. 75 des Ausländer- und Integrationsgesetzes (AIG, SG 142.20)')).has('AIG')).toBe(false);
    expect(fremdDefinierteKeys(snap('zu Art. 24 Verwaltungsverfahrensgesetz [VwVG, SG 172.021]')).has('VWVG')).toBe(false);
  });

  it('sperrt NICHT bei eidgenössischem Locator — der bestätigt die Zuordnung', () => {
    expect(fremdDefinierteKeys(snap('Bundesgesetz über die berufliche Vorsorge (BVG, SR 831.40)')).size).toBe(0);
  });

  it('ein blosses Zitat ist keine Definition', () => {
    expect(fremdDefinierteKeys(snap('(Art. 48 Abs. 1 BGG) und (vgl. Art. 279 Abs. 3 StPO)')).size).toBe(0);
  });
});

describe('B2-Riegel · Quell-Tippfehler in der Systematik-Nummer (Gegenprüfung R1)', () => {
  const bestand = new Map([['154.100', 'BS-154.100'], ['153.100', 'BS-153.100']]);

  it('Korpus-Mehrheit entscheidet; die Minderheits-Nummer wird nicht gebunden', () => {
    const korpus = [
      '§ 93 des Gerichtsorganisationsgesetzes (GOG, SG 154.100)',
      '§ 88 des Gerichtsorganisationsgesetzes (GOG, SG 154.100)',
      '§ 92 des Gerichtsorganisationsgesetzes (GOG, SG 153.100)',   // Tippfehler
    ];
    const dom = baueNummernDominanz(korpus, 'BS');
    expect(dom.get('GOG')).toBe('154.100');
    const b = loeseKantonZitate(korpus[2], 'BS', bestand, dom);
    expect(b.zitate).toEqual([]);
    expect(b.nummerMinderheit).toEqual(['GOG: 153.100 (Korpus-Mehrheit 154.100)']);
  });

  it('bei Gleichstand wird NICHT geraten — kein Eintrag, kein Riegel', () => {
    const dom = baueNummernDominanz([
      '§ 1 des Gesetzes (XYZ, SG 154.100)',
      '§ 2 des Gesetzes (XYZ, SG 153.100)',
    ], 'BS');
    expect(dom.has('XYZ')).toBe(false);
  });

  it('ohne Dominanz-Karte verhält sich der Resolver wie zuvor', () => {
    const b = loeseKantonZitate('§ 92 des Gerichtsorganisationsgesetzes (GOG, SG 153.100)', 'BS', bestand);
    expect(b.zitate).toEqual([{ erlass: 'BS-153.100', artikel: '92', kanal: 'nummer' }]);
  });
});

describe('B1/R2 · Erlass-Titel mit eigenem «§» (Gegenprüfung Runde 2)', () => {
  // Fuenf BS-Erlasse tragen ein FREMDES «§» im amtlichen Titel. Ohne Sonder-
  // behandlung bindet die Regel «letzte §-Gruppe vor dem Locator» das § DES
  // TITELS — und die richtige Kante geht verloren.
  const bestand = new Map([
    ['164.410', 'BS-164.410'], ['164.160', 'BS-164.160'], ['164.250', 'BS-164.250'],
    ['390.720', 'BS-390.720'], ['390.760', 'BS-390.760'],
  ]);
  const titel = new Map([
    ['164.410', 'Verordnung betreffend Zulagen gemäss § 15a Lohngesetz, Zulagenverordnung (164.410)'],
    ['164.160', 'Verordnung über die Beschleunigung des Stufenaufstiegs gemäss § 10 des Lohngesetzes (164.160)'],
    ['164.250', 'Verordnung über das Dienstaltersgeschenk gemäss § 23 Lohngesetz, Dienstaltersgeschenkverordnung (164.250)'],
    ['390.720', 'Vertrag betreffend die Kremation aufgrund von § 17 des Gesetzes betreffend die Bestattungen (390.720)'],
    ['390.760', 'Vertrag betreffend die Kremation gemäss § 1 der Vollziehungsverordnung (390.760)'],
  ]);

  it('titelParagraphen liest Nummer UND Folgewort aus dem amtlichen Titel', () => {
    expect(titelParagraphen(titel.get('164.410')!).get('15a')).toBe('lohngesetz');
    expect(titelParagraphen(titel.get('164.250')!).get('23')).toBe('lohngesetz');
    expect(titelParagraphen('Advokaturgesetz (291.100)').size).toBe(0);
  });

  it('ANLASSFALL VD.2021.145: § 15a wird NICHT gebunden, § 5 schon', () => {
    const t = 'Gemäss § 5 der Verordnung betreffend Zulagen gemäss § 15a Lohngesetz '
      + '(Zulagenverordnung, SG 164.410) haben Mitarbeiterinnen Anspruch.';
    const z = loeseKantonZitate(t, 'BS', bestand, undefined, titel);
    expect(z.zitate).toEqual([{ erlass: 'BS-164.410', artikel: '5', kanal: 'nummer' }]);
  });

  it('gilt für alle fuenf Titel-§-Erlasse', () => {
    const faelle: Array<[string, string, string, string]> = [
      ['164.410', '15a Lohngesetz', '5', 'BS-164.410'],
      ['164.160', '10 des Lohngesetzes', '3', 'BS-164.160'],
      ['164.250', '23 Lohngesetz', '4', 'BS-164.250'],
      ['390.720', '17 des Gesetzes', '2', 'BS-390.720'],
      ['390.760', '1 der Vollziehungsverordnung', '6', 'BS-390.760'],
    ];
    for (const [nr, titelPar, echt, key] of faelle) {
      const t = `Nach § ${echt} der Verordnung gemäss § ${titelPar} (Kurzform, SG ${nr}) gilt`;
      const z = loeseKantonZitate(t, 'BS', bestand, undefined, titel);
      expect(z.zitate.map((x) => x.artikel)).toEqual([echt]);
      expect(z.zitate[0].erlass).toBe(key);
    }
  });

  it('ein FREMDES § dazwischen bindet weiterhin NICHT (Schutz bleibt scharf)', () => {
    const t = 'Nach § 5 VRPG und § 99 Bundesgesetz (Zulagenverordnung, SG 164.410) folgt';
    const z = loeseKantonZitate(t, 'BS', bestand, undefined, titel);
    expect(z.zitate.some((x) => x.artikel === '5')).toBe(false);
  });
});

describe('B2/R2 · zweite Achse: amtliches Kürzel der Nummer', () => {
  const bestand = new Map([['730.110', 'BS-730.110'], ['291.100', 'BS-291.100']]);
  const titel = new Map([
    ['730.110', 'Bau- und Planungsverordnung, BPV (730.110)'],
    ['291.100', 'Advokaturgesetz (291.100)'],
  ]);

  it('amtlichesKuerzel liest nur echte Kürzel', () => {
    expect(amtlichesKuerzel('Bau- und Planungsverordnung, BPV (730.110)')).toBe('BPV');
    expect(amtlichesKuerzel('Verfassung des Kantons Basel-Stadt (111.100)')).toBeNull();
  });

  it('ANLASSFALL HBG: einzige Bindung, also keine Mehrheit — Kürzel-Achse greift', () => {
    const t = '§ 8 des Hochbaugesetzes (HBG, SG 730.110) sieht vor';
    const b = loeseKantonZitate(t, 'BS', bestand, undefined, titel);
    expect(b.zitate).toEqual([]);
    expect(b.nummerMinderheit).toEqual(['HBG: 730.110 (amtlich «BPV»)']);
  });

  it('schweigt, wo die Nummer kein eigenes Kürzel führt (sonst 361 Fehl-Sperren)', () => {
    expect(kuerzelKonsistent('KV', 'Verfassung des Kantons Basel-Stadt (111.100)')).toBe(true);
    const t = '§ 18 des Advokaturgesetzes (AdvG, SG 291.100) bestimmt';
    expect(loeseKantonZitate(t, 'BS', bestand, undefined, titel).zitate.length).toBe(1);
  });

  it('Teilwort und Umlaut-Faltung retten richtige Varianten', () => {
    expect(kuerzelKonsistent('VRPG BS', 'Gesetz, VRPG (270.100)')).toBe(true);
    expect(kuerzelKonsistent('aBüRG', 'Bürgerrechtsgesetz, BüRG (121.100)')).toBe(true);
    expect(kuerzelKonsistent('UeStG', 'Übertretungsstrafgesetz, ÜStG (253.100)')).toBe(true);
    expect(kuerzelKonsistent('JVG', 'Justizvollzugsverordnung, JVV (258.210)')).toBe(false);
  });
});

describe('B5/R2 · Gemeinde-Präfix ist Teil der Erlass-Identität', () => {
  const bestand = new Map([
    ['640.100', 'BS-640.100'],
    ['RiE 640.100', 'BS-RiE 640.100'],
  ]);

  it('TESTPIN: «StO RiE» kollabiert NICHT auf die kantonale Nummer', () => {
    const t = 'Nach der Steuerordnung Riehen [StO RiE, SG RiE 640.100] gilt § 22 StO RiE.';
    const z = loeseKantonZitate(t, 'BS', bestand);
    for (const x of z.zitate) expect(x.erlass).not.toBe('BS-640.100');
  });

  it('die Dominanz-Karte zählt die volle Nummer samt Präfix', () => {
    const dom = baueNummernDominanz(['(StO RiE, SG RiE 640.100)', '(StO RiE, SG RiE 640.100)'], 'BS');
    expect(dom.get('STORIE')).toBe('RiE 640.100');
  });
});

describe('B3 · gewicht ist in nicht messbaren Klassen null, nicht 0 (§8)', () => {
  it('der Typ lässt null zu, die Ladeschicht reicht es unverändert durch', () => {
    const s: BezugsShard = {
      erzeugt: '2026-07-28', erlass: 'OR', erlassEbene: 'bund',
      dokumente: {
        K: { zitierung: 'AGE BEZ.2020.1', regesteKurz: null, datum: '2020-01-01', facetten: { quelltyp: 'rechtsprechung', ebene: 'kanton', kanton: 'BS', gericht: 'bs_appellationsgericht', status: 'kantonal' } },
      },
      proArtikel: { '41': [{ key: 'K', gewicht: null }] },
      gesamtProArtikel: { '41': { kantonal: 5 } },
    };
    expect(bezuegeFuerArtikel(s, '41')[0].gewicht).toBeNull();
  });
});

describe('Ladeschicht · Auflösung, Filter und ehrliche Grundgesamtheit (§8)', () => {
  const shard: BezugsShard = {
    erzeugt: '2026-07-28', erlass: 'OR', erlassEbene: 'bund',
    dokumente: {
      A: { zitierung: 'BGE 1 I 1', regesteKurz: null, datum: '2020-01-01', facetten: { quelltyp: 'rechtsprechung', ebene: 'bund', kanton: 'CH', gericht: 'bge', status: 'bge' } },
      B: { zitierung: 'BGer 4A_1/2020', regesteKurz: null, datum: '2020-02-01', facetten: { quelltyp: 'rechtsprechung', ebene: 'bund', kanton: 'CH', gericht: 'bger', status: 'bger' } },
      C: { zitierung: 'AGE BEZ.2020.1', regesteKurz: null, datum: '2020-03-01', facetten: { quelltyp: 'rechtsprechung', ebene: 'kanton', kanton: 'BS', gericht: 'bs_appellationsgericht', status: 'kantonal' } },
    },
    proArtikel: { '41': [{ key: 'A', gewicht: 3 }, { key: 'B', gewicht: 0 }, { key: 'C', gewicht: 0 }] },
    gesamtProArtikel: { '41': { bge: 12, bger: 1, kantonal: 214 } },
  };

  it('löst Kanten gegen die Dokument-Tabelle auf', () => {
    expect(bezuegeFuerArtikel(shard, '41').map((b) => b.zitierung))
      .toEqual(['BGE 1 I 1', 'BGer 4A_1/2020', 'AGE BEZ.2020.1']);
  });

  it('überspringt einen Eintrag ohne Kopf, statt ihn halb zu rendern (§7)', () => {
    const kaputt = { ...shard, proArtikel: { '41': [{ key: 'FEHLT', gewicht: 0 }] } };
    expect(bezuegeFuerArtikel(kaputt, '41')).toEqual([]);
  });

  it('filtert je Achse; leere Auswahl schränkt nicht ein', () => {
    const alle = bezuegeFuerArtikel(shard, '41');
    expect(filtereBezuege(alle, {}).length).toBe(3);
    expect(filtereBezuege(alle, { status: new Set(['bge']) }).map((b) => b.key)).toEqual(['A']);
    expect(filtereBezuege(alle, { ebene: new Set(['kanton']) }).map((b) => b.key)).toEqual(['C']);
    expect(filtereBezuege(alle, { kanton: new Set(['BS']) }).map((b) => b.key)).toEqual(['C']);
  });

  it('weist je Status «gezeigt von gesamt» aus — nie nur das Gezeigte', () => {
    expect(trefferJeStatus(shard, '41')).toEqual([
      { status: 'bge', gezeigt: 1, gesamt: 12 },
      { status: 'bger', gezeigt: 1, gesamt: 1 },
      { status: 'kantonal', gezeigt: 1, gesamt: 214 },
    ]);
  });

  it('fehlende Grundgesamtheit wird gleichgesetzt, nie erfunden', () => {
    const ohne = { ...shard, gesamtProArtikel: {} };
    expect(trefferJeStatus(ohne, '41').every((t) => t.gesamt === t.gezeigt)).toBe(true);
  });
});
