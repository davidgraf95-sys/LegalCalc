import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalisiereRegeste, kuerzeRegeste, bereinigeFliesstext } from '../lib/rechtsprechung/register';
import { filterEntscheide, nachDatum } from '../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import { sha256EntscheidBloecke } from '../../scripts/normtext/sha-entscheide';
import {
  citedRefZuId, mappeEntscheidOCL, extrahiereSachverhalt, markenPlausibel,
  teileDispositivInline, extrahiereRubrum, azaAusBgeKopf, bgeRoemischSachgebiet,
  type OclDecision,
} from '../../scripts/normtext/adapter-entscheide';
import { statutesZuNormKeys, abteilungZuSachgebiet, legalAreaZuSachgebiet, istMehrdeutigeOerAbteilung, normSignalSachgebiet, zweierLegalAreaSignal, zweierRohSteuerSignal, istGemischteDritteOerAbteilung, dritteOerSachgebiet, hatSozialversicherungsErlass, bgeBand } from '../../scripts/normtext/entscheide-mapping';

const FIX = join(process.cwd(), 'src', 'tests', 'fixtures');
const lade = (f: string) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));

describe('normalisiereRegeste', () => {
  it('wandelt <br> in Zeilenumbruch und strippt Markdown-Links', () => {
    expect(normalisiereRegeste('Regeste.<br>Art. 8 ZGB; vgl. [BGE 145 III 1](https://x/y).'))
      .toBe('Regeste.\nArt. 8 ZGB; vgl. BGE 145 III 1.');
  });
  it('kollabiert 3+ Leerzeilen und trimmt', () => {
    expect(normalisiereRegeste('A\n\n\n\nB\n')).toBe('A\n\nB');
  });
  it('entfernt die führende „Regeste"-Überschrift (sonst doppelt unter dem Label)', () => {
    expect(normalisiereRegeste('Regeste\n Art. 88 SchKG; Fristenstillstand.')).toBe('Art. 88 SchKG; Fristenstillstand.');
  });
  it('behält bei mehrteiliger Regeste den Teilbuchstaben („Regeste\\xa0a" → „a …")', () => {
    expect(normalisiereRegeste('Regeste a\n Art. 259 StGB; Aufforderung.')).toBe('a\n Art. 259 StGB; Aufforderung.');
  });
  it('tastet „Regeste." (Satzanfang mit Punkt) NICHT an', () => {
    expect(normalisiereRegeste('Regeste. Art. 8 ZGB.')).toBe('Regeste. Art. 8 ZGB.');
  });
  it('schneidet das OCL-Rechtsgebiet-Suffix " | X" ab', () => {
    expect(normalisiereRegeste('Unfallversicherung (Kausalzusammenhang) | Unfallversicherung'))
      .toBe('Unfallversicherung (Kausalzusammenhang)');
  });
});

describe('bereinigeFliesstext', () => {
  it('strippt Markdown-Links + Zitat-Zeilenumbrüche, erhält echte Absätze', () => {
    const roh = 'Endentscheid (\nArt. 90 BGG\n) vgl.\n[BGE 137 III 47\nE. 1.2.2](https://mcp.opencaselaw.ch/entscheid/x).\n\nZweiter Absatz.';
    expect(bereinigeFliesstext(roh)).toBe('Endentscheid (Art. 90 BGG) vgl. BGE 137 III 47 E. 1.2.2.\n\nZweiter Absatz.');
  });
  it('lässt sauberen Text unverändert', () => {
    expect(bereinigeFliesstext('Ein klarer Satz.')).toBe('Ein klarer Satz.');
  });
  it('heilt Silbentrennung am Umbruch, erhält Komposita-Bindestrich', () => {
    expect(bereinigeFliesstext('wer-\nden')).toBe('werden');
    expect(bereinigeFliesstext('Justiz-\nund Verwaltungsrecht')).toBe('Justiz- und Verwaltungsrecht');
  });
  it('entfernt freistehende <URL>-Autolinks', () => {
    expect(bereinigeFliesstext('Quelle <https://www.gr.ch/x>.')).toBe('Quelle.');
  });
});

describe('kuerzeRegeste', () => {
  it('kappt mit Ellipse', () => {
    const t = kuerzeRegeste('x'.repeat(300), 50);
    expect(t.length).toBe(50);
    expect(t.endsWith('…')).toBe(true);
  });

  // LM-168 (W2·17-UI-BEFUNDE B6, K-15): fachliche Erweiterung — der Schnitt darf
  // kein Wort zerreissen, wenn eine Wortgrenze nah genug vor `max` liegt.
  it('schneidet an der letzten Wortgrenze, nicht mitten im Wort', () => {
    const t = kuerzeRegeste('Die Beschwerde wird im Anwendungsbereich der Bestimmung abgewiesen, soweit darauf einzutreten ist', 50);
    expect(t.endsWith('…')).toBe(true);
    const ohneEllipse = t.slice(0, -1);
    expect(ohneEllipse.endsWith(' ')).toBe(false);
    // Der Rest muss ein vollständiges letztes Wort sein — kein abgeschnittenes
    // Fragment eines Wortes, das im Original an dieser Stelle weiterläuft.
    const letztesWort = ohneEllipse.split(' ').pop()!;
    expect('Die Beschwerde wird im Anwendungsbereich der Bestimmung abgewiesen, soweit darauf einzutreten ist')
      .toMatch(new RegExp(`\\b${letztesWort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
  });

  it('fällt bei einem einzelnen überlangen Token auf den harten Schnitt zurück (kein Rückschritt bis 0)', () => {
    const t = kuerzeRegeste('x'.repeat(300), 50);
    expect(t.length).toBe(50);
  });
});

describe('citedRefZuId', () => {
  it('mappt Docket-Aktenzeichen auf OCL-ID (Punkt + Slash)', () => {
    expect(citedRefZuId('4A_444/2022')).toBe('bger_4A_444_2022');
    expect(citedRefZuId('5A.33/2004')).toBe('bger_5A_33_2004');
  });
  it('gibt null für BGE/ATF-Refs (anderes Schema)', () => {
    expect(citedRefZuId('BGE 145 III 72')).toBeNull();
    expect(citedRefZuId('Quatsch')).toBeNull();
  });
});

describe('statutesZuNormKeys', () => {
  it('extrahiert das Gesetz aus der Norm-Nennung und mappt auf Register-key', () => {
    expect(statutesZuNormKeys(['Art. 32 Abs. 2 BGG', 'Art. 8 ZGB', 'Art. 41 OR'])).toEqual(['BGG', 'ZGB', 'OR']);
  });
  it('dedupliziert und ignoriert Unbekanntes', () => {
    expect(statutesZuNormKeys(['Art. 1 OR', 'Art. 2 OR', 'Art. 1 XYZ'])).toEqual(['OR']);
  });
});

describe('abteilung/legalArea → Sachgebiet (deklariert)', () => {
  it('Abteilungs-Präfix', () => {
    expect(abteilungZuSachgebiet('5A_1100/2025')).toBe('privat');
    expect(abteilungZuSachgebiet('6B_1/2024')).toBe('straf');
    // J3 (29.8.2026, fachliche Änderung deklariert): Default der II. öffentlich-
    // rechtlichen Abteilung ist 'oeffentlich' — Steuerfälle erkennt das Norm-
    // Signal (DBG/StHG/…) bzw. legal_area, nicht mehr die Abteilungs-Pauschale.
    expect(abteilungZuSachgebiet('2C_1/2024')).toBe('oeffentlich');
    // W2-TRENNUNG (29.8.2026, fachliche Änderung deklariert §6.3): 8C/9C sind die
    // vormals sozialrechtlichen Abteilungen — sie zeigen auf 'sozialversicherung',
    // nicht mehr auf den Doppel-Topf 'sozial-abgaben'. Für 9C ist das seit der
    // F1-Korrektur nur noch der DEFAULT nach der Steuerfrage (s.u.).
    expect(abteilungZuSachgebiet('9C_1/2024')).toBe('sozialversicherung');
    expect(abteilungZuSachgebiet('8C_1/2024')).toBe('sozialversicherung');
    // J3: BGFA als Norm-Signal → öffentlich (Anlassfall BGE 150 II 300), mit
    // Vorrang vor Steuergesetzen (BGE 151 II 873: BGFA + Steueramtshilfe).
    expect(normSignalSachgebiet(['BGFA'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['DBG', 'BGFA'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['DBG'])).toBe('steuern');
    // J3-Gegenprüfungs-Korrekturen (29.8.2026): legal_area zählt auf der 2er-
    // Abteilung nur noch für die Steuer/Abgabe-Frage (F1: 'civil' kippte
    // 2D-Beschaffungsfälle nach 'privat'); kantonale Steuergesetze signalisieren
    // über den Roh-String «StG»/«Steuergesetz» (F2: BGE 149 I 125).
    expect(zweierLegalAreaSignal('civil')).toBeNull();
    expect(zweierLegalAreaSignal('tax law')).toBe('steuern');
    // B2-Nachschärfung: Sozialversicherungs-legal_area zählt auf der 2er-
    // Abteilung NICHT (Art. 31/32 BgerR; Beleg BGE 151 II 726, FZA-Verbleiberecht).
    expect(zweierLegalAreaSignal('social_insurance')).toBeNull();
    expect(zweierRohSteuerSignal(['Art. 181 Abs. 2 STG'])).toBe('steuern');
    expect(zweierRohSteuerSignal(['Art. 14 STGB', 'Art. 1 VSTG'])).toBeNull();
  });
  it('legal_area-Fragmente', () => {
    expect(legalAreaZuSachgebiet('Civil law')).toBe('privat');
    expect(legalAreaZuSachgebiet('criminal')).toBe('straf');
    expect(legalAreaZuSachgebiet(null)).toBeNull();
  });

  // ── F1 (Gegenprüfung 29.8.2026): III. öffentlich-rechtliche Abteilung (9C) ──
  // Amtliche Grundlage, verifiziert am AKN-XML der Konsolidierung 2026-02-01
  // (SR 173.110.131): Art. 31 lit. a «Steuern und Abgaben» NEBEN lit. b–f
  // AHV/IV/EO/KV/berufliche Vorsorge. 9C ist damit eine GEMISCHTE Abteilung;
  // die frühere Pauschale «9C ⇒ sozialversicherung» war falsch.
  describe('9C: Steuern und Sozialversicherung in einer Abteilung', () => {
    it('erkennt die 9C als gemischte Abteilung, 8C aber nicht', () => {
      expect(istGemischteDritteOerAbteilung('9C_391/2023')).toBe(true);
      expect(istGemischteDritteOerAbteilung('8C_510/2026')).toBe(false);
      expect(istGemischteDritteOerAbteilung('2C_63/2023')).toBe(false);
    });

    it('BGE-Band schlägt das Abteilungs-Signal (amtliche Systematik der Sammlung)', () => {
      // Band II = Verwaltungs-/Abgaberecht ⇒ NIE 'sozialversicherung', auch
      // wenn ein Sozialversicherungs-Erlass mitzitiert ist. Anlassfall
      // BGE 150 II 20 (9C_391/2023): Regeste «Art. 32 Abs. 2 DBG, steuerliche
      // Behandlung des Erneuerungsfonds» — zitiert das BVG, ist Steuerrecht.
      expect(dritteOerSachgebiet({
        normKeys: ['BGG', 'BV', 'BVG', 'DBG', 'STHG', 'ZGB'],
        zitierteNormen: [], legalArea: 'tax', band: 'II',
      })).toBe('steuern');
      // Band II ohne jedes Steuer-Signal → 'oeffentlich' (Verwaltungsrecht),
      // nie 'sozialversicherung' (Anlassfall BGE 150 II 153, URG-Spruchgebühr).
      expect(dritteOerSachgebiet({
        normKeys: ['BGG', 'URG', 'URV', 'VWVG'],
        zitierteNormen: [], legalArea: null, band: 'II',
      })).toBe('oeffentlich');
      // Band V = Sozialrechts-Band ⇒ immer 'sozialversicherung'.
      expect(dritteOerSachgebiet({
        normKeys: ['AHVG', 'DBG'], zitierteNormen: [], legalArea: 'tax', band: 'V',
      })).toBe('sozialversicherung');
    });

    it('ohne Band-Signal: Steuer nur ohne mitzitierten Sozialversicherungs-Erlass', () => {
      // Reiner Steuerfall der 9C (bger, kein Sammlungs-Band).
      expect(dritteOerSachgebiet({
        normKeys: ['DBG', 'STHG'], zitierteNormen: [], legalArea: 'tax', band: null,
      })).toBe('steuern');
      // GEGENBEISPIEL, das den Guard trägt: die AHV-Beiträge Selbstständiger
      // werden nach Art. 23 AHVV aus der Steuermeldung abgeleitet — ein echter
      // AHV-Beitragsfall zitiert darum das DBG. Gemessen 29.8.2026: 16 der 69
      // 9C-Einträge mit Steuer-Signal tragen zusätzlich einen SV-Erlass.
      expect(dritteOerSachgebiet({
        normKeys: ['AHVG', 'AHVV', 'DBG', 'IVG'], zitierteNormen: [], legalArea: 'tax', band: null,
      })).toBe('sozialversicherung');
      // Ohne jedes Steuer-Signal bleibt es beim Abteilungs-Default.
      expect(dritteOerSachgebiet({
        normKeys: ['ATSG', 'KVG'], zitierteNormen: [], legalArea: null, band: null,
      })).toBe('sozialversicherung');
      // Roh-«StG» trägt auch auf der 9C (kantonale Steuergesetze ohne Register-Key).
      expect(dritteOerSachgebiet({
        normKeys: [], zitierteNormen: ['Art. 181 Abs. 2 STG'], legalArea: null, band: null,
      })).toBe('steuern');
    });

    it('SV-Erlass-Guard und Bandparser', () => {
      expect(hatSozialversicherungsErlass(['DBG', 'STHG'])).toBe(false);
      expect(hatSozialversicherungsErlass(['DBG', 'ahvg'])).toBe(true);
      expect(hatSozialversicherungsErlass(['ATSG'])).toBe(true);
      // Unterstrich-Normalisierung (Bug-Check B4): BGE-Keys tragen «150_II_20».
      expect(bgeBand('150 II 20')).toBe('II');
      expect(bgeBand('150_II_20')).toBe('II');
      expect(bgeBand('151 V 1')).toBe('V');
      expect(bgeBand('9C_391/2023')).toBeNull();
    });
  });
  // C2-1: Disambiguierung der mehrdeutigen II. öffentlich-rechtlichen Abteilung.
  it('2A/2C/2D sind mehrdeutig (Steuern UND Migration), eindeutige Abteilungen nicht', () => {
    expect(istMehrdeutigeOerAbteilung('2C_63/2023')).toBe(true);
    expect(istMehrdeutigeOerAbteilung('2A_1/2010')).toBe(true);
    expect(istMehrdeutigeOerAbteilung('2D_5/2024')).toBe(true);
    expect(istMehrdeutigeOerAbteilung('5A_1/2025')).toBe(false);
    expect(istMehrdeutigeOerAbteilung('6B_1/2024')).toBe(false);
  });
  it('Norm-Signal: Migration → öffentlich, Steuer → steuern, sonst null', () => {
    expect(normSignalSachgebiet(['AIG'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['DBG'])).toBe('steuern');
    expect(normSignalSachgebiet(['STHG'])).toBe('steuern');
    // W2-TRENNUNG (29.8.2026) — §7-ABWEICHUNG vom Auftragswortlaut, hier
    // festgenagelt: Sozialversicherungs-Erlasse sind BEWUSST KEIN Norm-Signal.
    // Diese Liste wirkt nur auf der II. öffentlich-rechtlichen Abteilung, und
    // dort ist Sozialversicherung nach Art. 30/34/35 BgerR keine Zuständigkeit;
    // ein AHVG-Signal stellte den Gegenprüfungs-Befund B2 wieder her (BGE 151 II
    // 726: AHVG nur als Altersmassstab im FZA-Verbleiberecht).
    expect(normSignalSachgebiet(['AHVG'])).toBeNull();
    expect(normSignalSachgebiet(['ATSG'])).toBeNull();
    expect(normSignalSachgebiet(['IVG', 'UVG', 'KVG', 'BVG', 'ELG', 'AVIG'])).toBeNull();
    expect(normSignalSachgebiet(['OR'])).toBeNull();
    expect(normSignalSachgebiet([])).toBeNull();
  });
  it('Norm-Signal folgt der DEKLARIERTEN Tabellenordnung, nicht der Eingabe-Reihenfolge (§2)', () => {
    // Befund 28.7.2026: iteriert wurde über die übergebenen Keys — mit der jetzt
    // breiten Tabelle kippte das Sachgebiet je nach Reihenfolge der statutes[].
    // Nachgestellt an genau diesem Gegenbeispiel: ['Art. 5 AsylG','Art. 12 DBG']
    // auf einem 2C-Fall lieferte 'oeffentlich', umgekehrt den Steuer-Topf.
    // Gleiche Eingabemenge → gleiches Ergebnis; Migration hat Vorrang vor Steuer.
    expect(normSignalSachgebiet(['ASYLG', 'DBG'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['DBG', 'ASYLG'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['MWSTG', 'AIG'])).toBe('oeffentlich');
    expect(normSignalSachgebiet(['VSTG', 'BEWG'])).toBe('oeffentlich');
    // Innerhalb einer Gebietsgruppe ist die Reihenfolge ohnehin ergebnisgleich.
    expect(normSignalSachgebiet(['MWSTG', 'DBG'])).toBe('steuern');
    expect(normSignalSachgebiet(['DBG', 'MWSTG'])).toBe('steuern');
    // Gross-/Kleinschreibung der Eingabe bleibt unerheblich.
    expect(normSignalSachgebiet(['dbg', 'asylg'])).toBe('oeffentlich');
  });
});

describe('sha256EntscheidBloecke', () => {
  it('ist deterministisch und reagiert auf Textänderung', () => {
    const a = [{ typ: 'erwaegung' as const, bloecke: [{ marke: 'E. 1', text: 'Hallo' }] }];
    const b = [{ typ: 'erwaegung' as const, bloecke: [{ marke: 'E. 1', text: 'Hallo!' }] }];
    expect(sha256EntscheidBloecke(a)).toBe(sha256EntscheidBloecke(a));
    expect(sha256EntscheidBloecke(a)).not.toBe(sha256EntscheidBloecke(b));
  });
});

describe('extrahiereSachverhalt', () => {
  it('schneidet den vollen Sachverhalt zwischen den amtlichen Markern', () => {
    const ft = 'Kopf\nSachverhalt:\nA. Der volle Sachverhalt mit sehr viel Inhalt, der weit über tausend Zeichen lang ist. '
      + 'x'.repeat(300) + '\nErwägungen:\n1. Zum Recht.';
    const r = extrahiereSachverhalt(ft, 'kurz …', 350)!;
    expect(r.text.startsWith('A. Der volle Sachverhalt')).toBe(true);
    expect(r.vollstaendig).toBe(true);
  });
  it('fällt auf Excerpt zurück (ohne Marker) und markiert unvollständig + strippt Ellipse', () => {
    const r = extrahiereSachverhalt('kein marker hier', 'Nur ein Auszug …', 4000)!;
    expect(r.vollstaendig).toBe(false);
    expect(r.text.endsWith('…')).toBe(false);
  });
});

describe('markenPlausibel', () => {
  it('akzeptiert saubere Sequenz', () => {
    expect(markenPlausibel([{ e_number: '1' }, { e_number: '2' }, { e_number: '2.1' }, { e_number: '3' }])).toBe(true);
  });
  // DEKLARIERTE fachliche Änderung (§6.3, 24.6.2026): der alte Sprung≥3-Guard
  // entwertete genuine amtliche Nummerierung (publizierte Sammlungs-Auszüge
  // starten legitim ab consid. N≥3 und haben echte Innenlücken). markenPlausibel
  // lebt jetzt in erwaegung-normalisieren.ts und prüft Monotonie + Jahr-Schwelle
  // statt der Start-bei-1/2-Annahme. Eine monoton steigende Folge 1→6→11 unter
  // 1900 ist daher jetzt plausibel (die Zahlen stehen real in e_number — keine
  // Fabrikation). Fehlmarken werden über Jahr-Schwelle/Monat/Monotonie gefangen
  // (siehe src/tests/erwaegung-normalisieren.test.ts).
  it('akzeptiert monotone Folge mit Lücken (1→6→11), verwirft Jahres-Marke', () => {
    expect(markenPlausibel([{ e_number: '1' }, { e_number: '6' }, { e_number: '11' }])).toBe(true);
    expect(markenPlausibel([{ e_number: '2024' }, { e_number: '2025' }])).toBe(false);
  });
  it('verwirft Block, der mit einem Monat beginnt (Jahreszahl-Fehlparse)', () => {
    expect(markenPlausibel([{ e_number: '1', text: 'Oktober 2000 erging der Entscheid.' }])).toBe(false);
  });
});

describe('mappeEntscheidOCL — #1 Zukunfts-Datum-Wächter', () => {
  const det = (datum: string) => ({
    decision_id: 'bge_test', court: 'bge', canton: 'CH', language: 'de',
    decision_date: datum, docket_number: '152 III 1',
    full_text: 'Sachverhalt:\n\nText.\n\nErwägungen:\n\nText.',
  });
  it('verwirft einen Entscheid, der NACH dem Abrufdatum datiert (unmögliches Quelldatum)', () => {
    expect(mappeEntscheidOCL(det('2026-06-26'), null, '2026-06-24')).toBeNull();
  });
  it('akzeptiert Datum == Abrufdatum und Vergangenheit', () => {
    expect(mappeEntscheidOCL(det('2026-06-24'), null, '2026-06-24')).not.toBeNull();
    expect(mappeEntscheidOCL(det('2025-01-10'), null, '2026-06-24')).not.toBeNull();
  });
});

describe('teileDispositivInline', () => {
  it('splittet einzeiligen Blob in aufsteigende Punkte', () => {
    const r = teileDispositivInline('1. Die Beschwerde wird abgewiesen. 2. Es werden keine Kosten erhoben. 3. Mitteilung.')!;
    expect(r.map((b) => b.marke)).toEqual(['1.', '2.', '3.']);
  });
  it('splittet NICHT an Datumsangaben (kein aufsteigender 1,2,3)', () => {
    expect(teileDispositivInline('Die Frist lief am 2. Mai 2023 ab und endete am 3. Juni 2023.')).toBeNull();
  });
});

describe('extrahiereRubrum', () => {
  it('extrahiert Besetzung/Parteien/Gegenstand/Vorinstanz aus full_text', () => {
    const ft = 'Besetzung Bundesrichter Bovey, Präsident, Gerichtsschreiber Zingg. '
      + 'Verfahrensbeteiligte A. Sàrl, Beschwerdeführerin, gegen Eidgenossenschaft, Beschwerdegegnerin. '
      + 'Gegenstand Konkurseröffnung, Beschwerde gegen das Urteil des Obergerichts Appenzell Ausserrhoden vom 7. Mai 2026. Sachverhalt: A. …';
    const r = extrahiereRubrum(ft)!;
    expect(r.besetzung).toContain('Bovey');
    expect(r.parteien).toContain('Beschwerdeführerin');
    expect(r.gegenstand).toContain('Konkurseröffnung');
    expect(r.vorinstanz).toContain('Obergericht');
  });
  it('gibt null ohne Rubrum-Marker', () => {
    expect(extrahiereRubrum('nur fliesstext ohne marker')).toBeNull();
  });
  it('entdoppelt Parteien-Block + strippt Klammer-Dossier-Nummern (P2)', () => {
    const ft = 'Besetzung Richter A. Verfahrensbeteiligte Gemeinde Grenchen, vertreten durch Anwalt Aebi, '
      + 'Staatskanzlei Solothurn, , Gemeinde Grenchen, vertreten durch Anwalt Aebi, Staatskanzlei Solothurn. '
      + 'Gegenstand Wahlbeschwerde (VWBES.2025.355; VWBES.2025.460). Sachverhalt: A.';
    const r = extrahiereRubrum(ft)!;
    expect((r.parteien!.match(/Staatskanzlei Solothurn/g) ?? []).length).toBe(1);
    expect(r.gegenstand).not.toMatch(/VWBES/);
  });
});

describe('mappeEntscheidOCL (echte Fixture)', () => {
  const det = lade('ocl-decision-5A_1100_2025.json');
  const str = lade('ocl-structure-5A_1100_2025.json');
  const snap = mappeEntscheidOCL(det, str, '2026-06-23')!;

  it('mappt Kernfelder korrekt', () => {
    expect(snap).toBeTruthy();
    expect(snap.id).toBe('bund/bger/5A_1100_2025');
    expect(snap.gericht).toBe('bger');
    expect(snap.kanton).toBe('CH');
    expect(snap.nummer).toBe('5A_1100/2025');
    expect(snap.sprache).toBe('fr');
    // Fachliche Änderung 26.6.2026 (§8): «Leitentscheid» ⟺ amtlicher BGE. Ein bger-
    // Urteil (auch mit marked_for_publication/Regeste) ist KEIN amtlicher BGE → routine.
    expect(snap.leitcharakter).toBe('routine');
    expect(snap.bestand).toBe('snapshot');
    expect(snap.kuratierung).toBe('maschinell');
  });
  it('baut Abschnitte aus der amtlichen Gliederung', () => {
    const typen = snap.abschnitte.map((a) => a.typ);
    expect(typen).toContain('erwaegung');
    expect(snap.abschnitte.flatMap((a) => a.bloecke).length).toBeGreaterThan(0);
  });
  it('sha passt zu den Abschnitten', () => {
    expect(snap.sha).toBe(sha256EntscheidBloecke(snap.abschnitte));
  });
  it('parst cited_decisions (JSON-String) tolerant', () => {
    expect(Array.isArray(snap.zitierteEntscheide)).toBe(true);
    expect(snap.zitierteEntscheide.length).toBeGreaterThan(0);
  });
  it('hat vollständige Provenienz (§7)', () => {
    expect(snap.quelleUrl).toMatch(/^https?:\/\//);
    expect(snap.fassungsToken).toBeTruthy();
    expect(snap.abgerufen).toBe('2026-06-23');
  });
});

describe('Leitentscheid-Klassifizierung (§8, 26.6.2026)', () => {
  const det = (over: Partial<OclDecision>): OclDecision => ({
    decision_id: 'x', court: 'bger', canton: 'CH', language: 'de',
    docket_number: '6B_9/2025', full_text: 'Sachverhalt: A. Test-Erwägung.', ...over,
  });
  it('bge-Court → leitentscheid, regesteAmtlich, bgeReferenz aus docket (Präfix gestrippt)', () => {
    const s = mappeEntscheidOCL(det({ court: 'bge', docket_number: 'BGE 152 IV 14', regeste: 'Regeste. Art. 1.', citation_string_de: 'BGE 152 IV 14' }), null, '2026-06-26')!;
    expect(s.leitcharakter).toBe('leitentscheid');
    expect(s.regesteAmtlich).toBe(true);
    expect(s.bgeReferenz).toBe('152 IV 14');
    expect(s.gerichtstyp).toBe('bundesgericht');
    expect(s.id).toBe('bund/bge/152_IV_14');
  });
  it('bger mit Regeste & marked_for_publication aber ohne BGE → routine (§8-Invariante)', () => {
    const s = mappeEntscheidOCL(det({ regeste: 'Maschinelle Zusammenfassung.', marked_for_publication: true }), null, '2026-06-26')!;
    expect(s.leitcharakter).toBe('routine');
    expect(s.bgeReferenz).toBeNull();
    expect(s.regesteAmtlich).toBe(false);
  });
});

describe('azaAusBgeKopf / bgeRoemischSachgebiet', () => {
  it('greift das eigene Az. vor «vom <Datum>», nicht ein zitiertes Präjudiz', () => {
    const ft = 'Urteilskopf 152 IV 14 i.S. der I. strafrechtlichen Abteilung 6B_924/2023 und andere '
      + 'vom 26. August 2025 Regeste a Art. 259 StGB. Erwägung: vgl. Urteil 6B_111/2020 vom 1. Januar 2021 E. 3.';
    expect(azaAusBgeKopf(ft)).toBe('6B_924/2023');
  });
  it('null ohne «vom <Datum>»-Signatur (kein vermuteter Volltext, §8)', () => {
    expect(azaAusBgeKopf('Regeste. Text ohne Aktenzeichen-Signatur.')).toBeNull();
  });
  it('römisches BGE-Band → Sachgebiet', () => {
    expect(bgeRoemischSachgebiet('152 IV 14')).toBe('straf');
    expect(bgeRoemischSachgebiet('152 III 7')).toBe('privat');
    expect(bgeRoemischSachgebiet('150 I 17')).toBe('oeffentlich');
    // W2-TRENNUNG (29.8.2026, deklariert §6.3): Band V der amtlichen Sammlung ist
    // das Sozialrechts-Band → 'sozialversicherung'.
    expect(bgeRoemischSachgebiet('152 V 1')).toBe('sozialversicherung');
  });
});

describe('filterEntscheide / nachDatum', () => {
  const liste = [
    { key: 'a', sachgebiet: 'privat', gericht: 'bger', kanton: 'CH', sprache: 'de', leitcharakter: 'leitentscheid', datum: '2025-01-01', nummer: '5A_1/2025', bgeReferenz: null, zitierung: 'BGer 5A_1/2025', regesteKurz: 'Mietrecht', normKeys: ['OR'] },
    { key: 'b', sachgebiet: 'straf', gericht: 'bger', kanton: 'CH', sprache: 'de', leitcharakter: 'routine', datum: '2026-01-01', nummer: '6B_2/2026', bgeReferenz: null, zitierung: 'BGer 6B_2/2026', regesteKurz: null, normKeys: ['STGB'] },
  ] as unknown as BrowseEntscheid[];

  it('filtert nach Sachgebiet', () => {
    expect(filterEntscheide(liste, { sachgebiet: 'straf' }).map((e) => e.key)).toEqual(['b']);
  });
  it('filtert nur Leitentscheide', () => {
    expect(filterEntscheide(liste, { nurLeitentscheide: true }).map((e) => e.key)).toEqual(['a']);
  });
  it('Volltext-Heuristik trifft Regeste/normKeys', () => {
    expect(filterEntscheide(liste, { q: 'miet' }).map((e) => e.key)).toEqual(['a']);
  });
  it('nachDatum sortiert neueste zuerst', () => {
    expect(nachDatum(liste).map((e) => e.key)).toEqual(['b', 'a']);
  });
});
