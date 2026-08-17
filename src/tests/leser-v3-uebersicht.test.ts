import { describe, expect, it } from 'vitest';
import {
  ruheZeile, uebersichtsAngaben, type UebersichtsEingabe,
} from '../pages/gesetz-leser/v3/uebersichtAngaben';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ─── Ä70 · Erlass-Neutralität der Übersichtsbox (David 17.8.2026) ────────────
//
// «Der Rahmen funktioniert für Bund, Kanton und Staatsvertrag identisch —
//  Erlass-spezifisches kommt aus dem Datenmodell, nie aus `if (bund)`.»
//  (Fundament-Auflage 2, Auftrag David 16.8.2026)
//
// Diese Datei prüft die AUSWAHL der Angaben, nicht ihr Aussehen. Sie ist der
// Grund, warum die Auswahl überhaupt aus der Komponente herausgezogen wurde:
// vier von fünf Ist-Befunden waren Gestaltung, aber der fünfte war eine
// LEERE ZUSAGE («Stand:» ohne Wert, «SR —» am Kantonserlass) — und die lässt
// sich nur an den Daten prüfen, nicht am Bild.
//
// Die fünf Fälle sind die Probe aus Fahrplan Kap. 7: ein Bundesgesetz (mit
// Warnung), eine Verordnung, ein Staatsvertrag und zwei Kantonserlasse mit
// §-Etikett. Unterschiede dürfen NUR aus dem Datenmodell stammen.

function erlassBauen(p: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'PROBE', ebene: 'bund', kanton: null, kuerzel: 'PROBE', titel: 'Probe-Erlass',
    sr: '999.9', rechtsgebiet: 'privat', sprache: 'de', rang: 1, status: 'snapshot',
    datei: 'bund/PROBE.json', artikelAnzahl: 10, stand: '2026-01-01',
    quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/probe/de',
    fassungsToken: '20260101', pdfPfad: null, pdfUrl: null, pdfStand: null,
    inkraftSeit: null,
    ...p,
  } as BrowseErlass;
}

function eingabe(p: Partial<UebersichtsEingabe> & { erlass: BrowseErlass }): UebersichtsEingabe {
  return {
    kopf: null, currency: undefined, erlassTyp: undefined, anzahl: 10,
    bestimmungsWort: 'Artikel', bestimmungsEtikettStatus: undefined,
    gliederungsTiefe: 0, kennzahlen: null, kantonSys: {}, kantonErlassAnzahl: null,
    nichtKonsolidiert: false, nichtKonsolidiertSeit: null,
    ...p,
  };
}

const labels = (a: ReturnType<typeof uebersichtsAngaben>) => a.zeilen.map((z) => z.label);

describe('ruheZeile — die eine Zeile im Ruhezustand', () => {
  it('Bund mit SR: «SR 312.0 · 480 Artikel»', () => {
    expect(ruheZeile({ sr: '312.0' }, 480, 'Artikel')).toBe('SR 312.0 · 480 Artikel');
  });

  it('§-Erlass zählt Paragraphen, nicht Artikel (Ä23)', () => {
    expect(ruheZeile({ sr: '211.11' }, 23, 'Paragraphen')).toBe('SR 211.11 · 23 Paragraphen');
  });

  it('ohne SR-Nummer entfällt das Glied ERSATZLOS — kein «SR —» (§8)', () => {
    // 12 von 1469 Erlassen tragen keine SR-Nummer (gezählt 17.8.2026).
    const z = ruheZeile({ sr: '' }, 42, 'Artikel');
    expect(z).toBe('42 Artikel');
    expect(z).not.toContain('SR');
  });

  it('ohne Snapshot (nur-live-link/pdf-embed) keine erfundene Null', () => {
    const z = ruheZeile({ sr: '101' }, null, 'Artikel');
    expect(z).toBe('SR 101');
    expect(z).not.toContain('0 Artikel');
  });

  it('der Stand steht NICHT mehr in der Ruhezeile (Ä70)', () => {
    // Ist-Befund: mit «Stand …» lief die Zeile an allen fünf Probe-Erlassen
    // über DREI Zeilen. Der Stand steht weiterhin in der Liste und im
    // Erlass-Kopf — er verschwindet nicht, er sprengt nur die Ruhezeile nicht.
    expect(ruheZeile({ sr: '312.0' }, 480, 'Artikel')).not.toMatch(/Stand/);
  });
});

describe('uebersichtsAngaben — je Erlassart dieselben Regeln, andere Werte', () => {
  it('(a) Bund/Bundesgesetz mit Warnung: Art, Datum, Stand, In Kraft seit, Quelle', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({
        key: 'STPO', kuerzel: 'StPO', sr: '312.0', stand: '2025-04-01',
        inkraftSeit: '2011-01-01', rechtsgebiet: 'straf',
        pdfUrl: 'https://fedlex.data.admin.ch/probe.pdf',
      }),
      kopf: { erlassdatum: 'vom 5. Oktober 2007 (Stand am 1. April 2025)', praeambel: [
        { rolle: 'autor', text: 'Die Bundesversammlung der Schweizerischen Eidgenossenschaft,' },
      ] } as UebersichtsEingabe['kopf'],
      erlassTyp: 'gesetz', anzahl: 480, gliederungsTiefe: 3,
      nichtKonsolidiert: true, nichtKonsolidiertSeit: '2025-07-01',
    }));

    expect(a.ruhe).toBe('SR 312.0 · 480 Artikel');
    expect(labels(a)).toEqual(['Art', 'Erlassgeber', 'Erlassdatum', 'Stand', 'In Kraft seit', 'Gliederung']);
    // Die formelhafte Stand-Klammer ist weg — der Stand steht eine Zeile
    // tiefer mit seinem maschinellen Wert (§5, sonst zweimal dasselbe Datum).
    expect(a.zeilen.find((z) => z.id === 'datum')?.wert).toBe('vom 5. Oktober 2007');
    expect(a.zeilen.find((z) => z.id === 'organ')?.wert)
      .toBe('Die Bundesversammlung der Schweizerischen Eidgenossenschaft');
    expect(a.zeilen.find((z) => z.id === 'stand')?.wert).toBe('01.04.2025');
    // Der Wortlaut ist der des Erlass-Kopfs (S3/F5), nicht ein zweiter eigener.
    expect(a.warnung).toBe('Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht'
      + ' in den Text eingearbeitet — massgeblich ist die amtliche Fassung.');
    // «⚠» steckt NICHT im String (DESIGN-REGLEMENT B3).
    expect(a.warnung).not.toContain('⚠');
    expect(a.links.map((l) => l.id)).toEqual(['quelle', 'pdf']);
    expect(a.links[0].label).toBe('geltende Fassung');
  });

  it('(b) Verordnung: dieselben Zeilen, anderer Art-Wert — kein `if (verordnung)`', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({ key: 'VMWG', kuerzel: 'VMWG', sr: '221.213.11', stand: '2025-10-01' }),
      kopf: { erlassdatum: 'vom 9. Mai 1990', praeambel: [
        { rolle: 'autor', text: 'Der Schweizerische Bundesrat,' },
      ] } as UebersichtsEingabe['kopf'],
      erlassTyp: 'verordnung', anzahl: 49, gliederungsTiefe: 2,
    }));
    expect(a.zeilen.find((z) => z.id === 'art')?.wert).toBe('Verordnung');
    expect(a.zeilen.find((z) => z.id === 'organ')?.wert).toBe('Der Schweizerische Bundesrat');
    expect(a.warnung).toBeNull();
  });

  it('(c) Staatsvertrag: Art «Staatsvertrag», keine leere Zeile trotz fehlendem Inkrafttreten', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({
        key: 'LUGUE', kuerzel: 'LugÜ', sr: '0.275.12', stand: '2016-04-08',
        rechtsgebiet: 'international', inkraftSeit: undefined,
      }),
      erlassTyp: 'staatsvertrag', anzahl: 91,
    }));
    expect(a.zeilen.find((z) => z.id === 'art')?.wert).toBe('Staatsvertrag');
    expect(labels(a)).not.toContain('In Kraft seit');
    // Ohne Sidecar-Kopf gibt es weder Erlassgeber noch Erlassdatum — und dann
    // auch KEINE leere Zeile (§8).
    expect(labels(a)).not.toContain('Erlassgeber');
    expect(labels(a)).not.toContain('Erlassdatum');
  });

  it('(d) Kanton mit §-Etikett: «Kanton BS · Gesetz», Erfassungsgrad als §8-Hinweis', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({
        key: 'BS-640.100', kuerzel: 'BS-640.100', sr: '640.100', ebene: 'kanton',
        kanton: 'BS', stand: '2026-01-01', rechtsgebiet: 'oeffentlich',
      }),
      erlassTyp: 'gesetz', anzahl: 292, bestimmungsWort: 'Paragraphen',
      kantonErlassAnzahl: 859, gliederungsTiefe: 5,
    }));
    expect(a.ruhe).toBe('SR 640.100 · 292 Paragraphen');
    expect(a.zeilen.find((z) => z.id === 'art')?.wert).toBe('Kanton BS · Gesetz');
    expect(a.hinweise.some((h) => h.startsWith('Kanton BS:'))).toBe(true);
  });

  it('(e) Kanton mit Etikett-Entwurf: der §8-Satz nennt das eigene Zähl-Wort (K6/Ä23)', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({
        key: 'ZH-211.11', kuerzel: 'GebV OG', sr: '211.11', ebene: 'kanton',
        kanton: 'ZH', stand: '2026-01-01',
      }),
      erlassTyp: 'verordnung', anzahl: 23, bestimmungsWort: 'Paragraphen',
      bestimmungsEtikettStatus: 'entwurf',
    }));
    expect(a.zeilen.find((z) => z.id === 'art')?.wert).toBe('Kanton ZH · Verordnung');
    expect(a.hinweise.some((h) => h.includes('«Paragraphen»'))).toBe(true);
    expect(a.hinweise.some((h) => h.includes('«Artikel»'))).toBe(false);
  });
});

describe('uebersichtsAngaben — die Grenzen, die §8 verlangt', () => {
  it('kein Wert, keine Zeile: `stand: ""` erzeugt kein leeres «Stand» (B8)', () => {
    // Zwei VD-Erlasse tragen `stand: ""` (gezählt 17.8.2026, register.json).
    const a = uebersichtsAngaben(eingabe({ erlass: erlassBauen({ stand: '' }) }));
    expect(labels(a)).not.toContain('Stand');
    // Und keine Zeile trägt je einen leeren Wert.
    expect(a.zeilen.every((z) => z.wert.trim().length > 0)).toBe(true);
  });

  it('aufgehobener Erlass: keine Konsolidierungs-Warnung, ehrlich beschrifteter Link (B3/B5)', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({ aufgehoben: { seit: '2020-01-01' } }),
      nichtKonsolidiert: true, nichtKonsolidiertSeit: '2019-01-01',
      currency: { naechsteFassungAb: '2027-01-01' } as UebersichtsEingabe['currency'],
    }));
    // Bei einem aufgehobenen Erlass IST die Aufhebung die Aussage — eine offene
    // Konsolidierung daneben wäre irreführend.
    expect(a.warnung).toBeNull();
    expect(a.vorbehalt).toBeNull();
    expect(a.zeilen.find((z) => z.id === 'aufgehoben')?.wert).toBe('01.01.2020');
    expect(a.links[0].label).toBe('amtliche (aufgehobene) Fassung');
  });

  it('angekündigte Fassung: eigener Satz, nicht in die Warnung gemischt', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({}),
      currency: { naechsteFassungAb: '2027-01-01' } as UebersichtsEingabe['currency'],
    }));
    expect(a.vorbehalt).toBe('nächste Fassung ab 01.01.2027');
    expect(a.warnung).toBeNull();
  });

  it('ohne amtliche Quelle: gar kein Link statt eines toten (§8/F4)', () => {
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({ quelleUrl: '', pdfUrl: undefined }),
    }));
    expect(a.links).toEqual([]);
  });

  it('die Fassungs-Kennung steht nirgends mehr (Ä71)', () => {
    // Datumsform = derselbe Wert wie der Stand in anderer Notation («Stand
    // 01.04.2025 · Fassung 20250401», §5); Hash-Form trifft 1231 von 1469
    // Erlassen und ist Maschinen-Provenienz. §7 Bst. d ist durch die
    // Drift-ERKENNUNG erfüllt, nicht durch das Abdrucken des Hashes.
    const a = uebersichtsAngaben(eingabe({
      erlass: erlassBauen({ fassungsToken: 'a3f9c0deadbeef' }),
    }));
    expect(a.zeilen.some((z) => z.wert.includes('a3f9c0'))).toBe(false);
    expect(labels(a)).not.toContain('Fassungs-Kennung');
  });

  it('der Grundhinweis «Massgeblich ist stets …» steht nicht mehr in der Box (Ä70)', () => {
    // Er stand an der StPO drei Zeilen unter einer Warnung, die denselben
    // Halbsatz trägt (gemessen: 2 Vorkommen). Im Erlass-Kopf steht er weiter.
    const a = uebersichtsAngaben(eingabe({ erlass: erlassBauen({}) }));
    const alles = [...a.zeilen.map((z) => z.wert), ...a.hinweise, a.warnung ?? ''].join(' ');
    expect(alles).not.toMatch(/Massgeblich ist stets/i);
  });
});
