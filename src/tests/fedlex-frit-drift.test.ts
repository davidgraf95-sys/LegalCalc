import { describe, it, expect } from 'vitest';
import {
  vergleicheSprachfassungen,
  waehleKernErlasse,
  leseEids,
  istKernEid,
  holeXml,
  holeFassungen,
  KERN_ANZAHL,
  ANERKANNTE_DRIFT,
  type Fassungen,
  type DriftDeklaration,
} from '../../scripts/fedlex-frit-drift';
import { lesePinsVoll, type PinVoll } from '../../scripts/fedlex-pins';

// ─── Synthetische Mengen (kein Netz) ─────────────────────────────────────────
// Nachgebildet an der realen AKN-Form: Kern-eIds ohne «/», Unter-eIds mit «/».
const DE_EIDS = [
  'art_1',
  'art_1/para_1',
  'art_2',
  'art_2/para_1',
  'art_2/para_2',
  'art_219_a',
  'art_219_a/para_1',
  'annex_1',
];
const fassung = (eids: string[], lang: string): Fassungen[keyof Fassungen] => ({
  datei: `https://fedlex.data.admin.ch/filestore/…-${lang}-xml.xml`,
  eids,
});
const dreisprachig = (fr: string[], it: string[]): Fassungen => ({
  de: fassung(DE_EIDS, 'de'),
  fr: fassung(fr, 'fr'),
  it: fassung(it, 'it'),
});

describe('QS-FRIT-DRIFT · Kern-Vergleich (rein, ohne Netz)', () => {
  it('GRÜN: identische eId-Mengen ⇒ kein Rot, keine Differenz', () => {
    const b = vergleicheSprachfassungen('testerlass', dreisprachig(DE_EIDS, DE_EIDS));
    expect(b.rot).toBe(false);
    expect(b.differenzen).toEqual([]);
    expect(b.de.size).toBe(4); // art_1, art_2, art_219_a, annex_1
    expect([...b.fr]).toEqual([...b.de]);
    expect([...b.it]).toEqual([...b.de]);
  });

  it('ROT: FR fehlt ein Kern-eId ⇒ DRIFT mit Erlass, Sprache und fehlendem eId', () => {
    const fr = DE_EIDS.filter((e) => !e.startsWith('art_219_a'));
    const b = vergleicheSprachfassungen('testerlass', dreisprachig(fr, DE_EIDS));
    expect(b.rot).toBe(true);
    const drift = b.differenzen.find((d) => d.art === 'DRIFT');
    expect(drift?.text).toContain('testerlass');
    expect(drift?.text).toContain('[fr]');
    expect(drift?.text).toContain('art_219_a');
    expect(drift?.text).toContain('fehlt ggü. DE (1)');
    // Die IT-Fassung ist gleich ⇒ kein zweiter DRIFT-Befund.
    expect(b.differenzen.filter((d) => d.art === 'DRIFT')).toHaveLength(1);
  });

  it('ROT: IT hat einen überzähligen Kern-eId ⇒ DRIFT «überzählig»', () => {
    const b = vergleicheSprachfassungen(
      'testerlass',
      dreisprachig(DE_EIDS, [...DE_EIDS, 'art_220']),
    );
    expect(b.rot).toBe(true);
    const drift = b.differenzen.find((d) => d.art === 'DRIFT');
    expect(drift?.text).toContain('[it]');
    expect(drift?.text).toContain('überzählig ggü. DE (1): art_220');
  });

  it('ROT: doppelt vergebener Kern-eId in EINER Sprache (OR-Erstbefund-Mechanik)', () => {
    // FR trägt `art_220` zweimal — der reine Mengenvergleich würde das
    // schlucken, die Duplikat-Prüfung nicht.
    const b = vergleicheSprachfassungen(
      'or',
      {
        de: fassung(['art_219', 'art_219_a', 'art_220'], 'de'),
        fr: fassung(['art_219', 'art_219_a', 'art_220', 'art_220'], 'fr'),
        it: fassung(['art_219', 'art_219_a', 'art_220'], 'it'),
      },
      [], // ohne Deklarationen — die echte ANERKANNTE_DRIFT wird unten geprüft
    );
    expect(b.rot).toBe(true);
    const dup = b.differenzen.find((d) => d.art === 'DUPLIKAT');
    expect(dup?.text).toContain('or [fr]');
    expect(dup?.text).toContain('art_220');
  });

  it('ROT: fehlende Sprachfassung ist Rot, nicht stilles Grün', () => {
    const b = vergleicheSprachfassungen('testerlass', {
      de: fassung(DE_EIDS, 'de'),
      fr: fassung(DE_EIDS, 'fr'),
      // it fehlt ganz
    });
    expect(b.rot).toBe(true);
    expect(b.differenzen.find((d) => d.art === 'SPRACHE-FEHLT')?.text).toContain('IT-XML-Fassung');
    // Kein DRIFT-Befund gegen eine gar nicht vorhandene Fassung.
    expect(b.differenzen.filter((d) => d.art === 'DRIFT')).toHaveLength(0);
  });

  it('HINWEIS statt Rot: Absatz-Residue unterhalb der Artikel-Ebene', () => {
    // Realfall OR Art. 1033: DE zwei Absätze, FR/IT einer — amtlich so gewollt.
    const fr = DE_EIDS.filter((e) => e !== 'art_2/para_2');
    const b = vergleicheSprachfassungen('testerlass', dreisprachig(fr, DE_EIDS));
    expect(b.rot).toBe(false);
    const res = b.differenzen.find((d) => d.art === 'RESIDUE');
    expect(res?.text).toContain('1 fehlend / 0 überzählig unterhalb der Artikel-Ebene');
  });

  it('kürzt lange Differenzlisten auf 20 und zählt den Rest', () => {
    const viele = Array.from({ length: 25 }, (_, i) => `art_${i + 1}`);
    const b = vergleicheSprachfassungen('gross', {
      de: fassung(viele, 'de'),
      fr: fassung([], 'fr'),
      it: fassung(viele, 'it'),
    });
    const drift = b.differenzen.find((d) => d.art === 'DRIFT');
    expect(drift?.text).toContain('(+5 weitere)');
    expect(drift?.text).toContain('fehlt ggü. DE (25)');
  });

  it('istKernEid trennt Top-Knoten von Unterstruktur', () => {
    expect(istKernEid('art_219_a')).toBe(true);
    expect(istKernEid('annex_1')).toBe(true);
    expect(istKernEid('art_220/para_1')).toBe(false);
    expect(istKernEid('part_2/tit_6/chap_3/lvl_E')).toBe(false);
  });

  // Gegenprüfung 15.8.2026, Fund 3: die erste Fassung («kein /») warf 83 echte
  // OR-Artikel in die nie-rote Residue-Klasse.
  it('Artikel in Schlussbestimmungen sind Kern, obwohl ihr eId ein «/» trägt', () => {
    expect(istKernEid('disp_u2/art_1')).toBe(true); // real im OR, Korpus: disp_u2_art_1
    expect(istKernEid('disp_u1/art_141')).toBe(true); // real im PatG
    expect(istKernEid('chap_6/annex_2')).toBe(true);
    // Ein Absatz IN einem solchen Artikel bleibt Unterstruktur.
    expect(istKernEid('disp_u2/art_1/para_1')).toBe(false);
    expect(istKernEid('chap_6/lvl_u6')).toBe(false);
  });

  it('eine Drift in einem Schlussbestimmungs-Artikel ist rot, nicht Residue', () => {
    const de = ['art_1', 'disp_u2/art_1', 'disp_u2/art_2'];
    const b = vergleicheSprachfassungen(
      'testerlass',
      {
        de: fassung(de, 'de'),
        fr: fassung(['art_1', 'disp_u2/art_1'], 'fr'),
        it: fassung(de, 'it'),
      },
      [],
    );
    expect(b.rot).toBe(true);
    expect(b.differenzen.find((d) => d.art === 'DRIFT')?.text).toContain('disp_u2/art_2');
  });

  // Gegenprüfung 15.8.2026, Fund 6: drei leere Mengen sind formal «gleich».
  it('eine leere DE-Menge ist nie «gleich» (stilles Grün ausgeschlossen)', () => {
    const b = vergleicheSprachfassungen(
      'leer',
      { de: fassung([], 'de'), fr: fassung([], 'fr'), it: fassung([], 'it') },
      [],
    );
    expect(b.rot).toBe(true);
    expect(b.differenzen.find((d) => d.art === 'SPRACHE-FEHLT')?.text).toContain(
      'KEINEN einzigen Kern-eId',
    );
  });
});

// ─── Anerkannte Sprach-Drift (Muster G-AUFH) ─────────────────────────────────
describe('QS-FRIT-DRIFT · anerkannte Drift wird live gegen die Quelle geprüft', () => {
  const DEKL: DriftDeklaration[] = [
    {
      erlass: 'or',
      sprache: 'fr',
      fehlend: ['art_219'],
      ueberzaehlig: [],
      doppelt: ['art_221'],
      belegt: '2026-08-15',
      grund: 'Testfall',
    },
  ];
  // DE-Anker mit den beiden Artikeln, die FR verschiebt.
  const de = ['art_219', 'art_219_a', 'art_220', 'art_221'];

  it('deckungsgleich ⇒ ANERKANNT, kein Rot — aber sichtbar im Log', () => {
    const b = vergleicheSprachfassungen(
      'or',
      {
        de: fassung(de, 'de'),
        fr: fassung(['art_219_a', 'art_220', 'art_221', 'art_221'], 'fr'),
        it: fassung(de, 'it'),
      },
      DEKL,
    );
    expect(b.rot).toBe(false);
    const a = b.differenzen.find((d) => d.art === 'ANERKANNT');
    expect(a?.text).toContain('or [fr]');
    expect(a?.text).toContain('verifiziert 2026-08-15');
    // Kein DRIFT/DUPLIKAT-Rauschen daneben.
    expect(b.differenzen.filter((d) => d.art === 'DRIFT' || d.art === 'DUPLIKAT')).toHaveLength(0);
  });

  it('Fedlex hat behoben ⇒ ROT «Deklaration entfernen» (kein stiller Freibrief)', () => {
    const b = vergleicheSprachfassungen(
      'or',
      { de: fassung(de, 'de'), fr: fassung(de, 'fr'), it: fassung(de, 'it') },
      DEKL,
    );
    expect(b.rot).toBe(true);
    expect(b.differenzen.find((d) => d.art === 'DRIFT')?.text).toContain('Deklaration');
    expect(b.differenzen.find((d) => d.art === 'DRIFT')?.text).toContain('KEINE Abweichung mehr');
  });

  it('Drift GEWACHSEN ⇒ ROT (Deklaration deckt den neuen Fund nicht)', () => {
    const b = vergleicheSprachfassungen(
      'or',
      {
        de: fassung(de, 'de'),
        // zusätzlich fehlt art_220 — das deckt die Deklaration nicht ab
        fr: fassung(['art_219_a', 'art_221', 'art_221'], 'fr'),
        it: fassung(de, 'it'),
      },
      DEKL,
    );
    expect(b.rot).toBe(true);
    const d = b.differenzen.find((x) => x.art === 'DRIFT');
    expect(d?.text).toContain('Ist-Drift weicht von der Deklaration');
    expect(d?.text).toContain('art_220');
  });

  it('Duplikat in der ANKER-Sprache DE ist nie anerkennbar', () => {
    const b = vergleicheSprachfassungen(
      'or',
      {
        de: fassung([...de, 'art_220'], 'de'),
        fr: fassung(de, 'fr'),
        it: fassung(de, 'it'),
      },
      DEKL,
    );
    expect(b.rot).toBe(true);
    expect(b.differenzen.find((d) => d.art === 'DUPLIKAT')?.text).toContain('[de]');
    expect(b.differenzen.find((d) => d.art === 'DUPLIKAT')?.text).toContain('ANKER-Sprache');
  });

  // Gegenprüfung 15.8.2026, Randfall B: eine Deklaration ohne Inhalt wäre ein
  // Blanko-Freibrief für jede künftige Drift dieses Erlasses.
  it('leere Deklaration erteilt keinen Freibrief', () => {
    const leerDekl: DriftDeklaration[] = [
      {
        erlass: 'or',
        sprache: 'fr',
        fehlend: [],
        ueberzaehlig: [],
        doppelt: [],
        belegt: '2026-08-15',
        grund: 'Blanko — darf nichts decken',
      },
    ];
    // (a) Ohne Ist-Abweichung darf sie keine ANERKANNT-Zeile erzeugen: sonst
    //     stünde im Log eine «bekannte Drift», die es nicht gibt.
    const ohne = vergleicheSprachfassungen(
      'or',
      { de: fassung(de, 'de'), fr: fassung(de, 'fr'), it: fassung(de, 'it') },
      leerDekl,
    );
    expect(ohne.rot).toBe(false);
    expect(ohne.differenzen.find((d) => d.art === 'ANERKANNT')).toBeUndefined();
    // (b) Mit Ist-Abweichung bleibt sie rot — sie deckt nichts.
    const mit = vergleicheSprachfassungen(
      'or',
      { de: fassung(de, 'de'), fr: fassung(['art_219'], 'fr'), it: fassung(de, 'it') },
      leerDekl,
    );
    expect(mit.rot).toBe(true);
    expect(mit.differenzen.find((d) => d.art === 'ANERKANNT')).toBeUndefined();
  });

  it('auch bei ANERKANNT wird die Residue-Zeile weiter gemeldet (BewG-Lehre)', () => {
    const b = vergleicheSprachfassungen(
      'or',
      {
        de: fassung([...de, 'art_220/para_1'], 'de'),
        fr: fassung(['art_219_a', 'art_220', 'art_221', 'art_221'], 'fr'),
        it: fassung([...de, 'art_220/para_1'], 'it'),
      },
      DEKL,
    );
    expect(b.rot).toBe(false);
    expect(b.differenzen.find((d) => d.art === 'ANERKANNT')).toBeDefined();
    // Die Residue-Zeile hätte den wahren BewG-Mechanismus verraten.
    expect(b.differenzen.find((d) => d.art === 'RESIDUE')?.text).toContain('or [fr]');
  });

  it('der ausgelieferte Deklarations-Bestand ist wohlgeformt und datiert', () => {
    expect(ANERKANNTE_DRIFT.length).toBeGreaterThan(0);
    for (const d of ANERKANNTE_DRIFT) {
      expect(d.belegt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.grund.length).toBeGreaterThan(20);
      expect(['de', 'fr', 'it']).toContain(d.sprache);
      // Eine Deklaration ohne gedeckte Abweichung wäre sinnlos.
      expect(d.fehlend.length + d.ueberzaehlig.length + d.doppelt.length).toBeGreaterThan(0);
      // Die DE-Ankersprache wird nie anerkannt (s. Test oben).
      expect(d.sprache).not.toBe('de');
    }
  });
});

describe('QS-FRIT-DRIFT · eId-Extraktion aus AKN-XML', () => {
  it('liest die emittierten eIds in Dokumentreihenfolge, mit Duplikaten', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act><body>
    <article eId="art_219"><num>Art. 219</num></article>
    <article eId="art_219"><num>Art. 219a</num></article>
    <article eId="art_220"><num>Art. 220</num>
      <paragraph eId="art_220/para_1"><num>1</num></paragraph>
    </article>
  </body></act>
</akomaNtoso>`;
    expect(leseEids(xml)).toEqual(['art_219', 'art_219', 'art_220', 'art_220/para_1']);
  });
});

describe('QS-FRIT-DRIFT · Netz-Ausfall wird als Netz-Fall gemeldet, nie als Drift', () => {
  const antwort = (rumpf: string, ct: string, status = 200) =>
    new Response(rumpf, { status, headers: { 'content-type': ct } });

  it('Soft-404 (HTTP 200 + Angular-Shell) gilt als Fehler, nicht als leere Fassung', async () => {
    const shell = '<!DOCTYPE html><html><head><title>Casemates</title></head><body></body></html>';
    await expect(
      holeXml('https://fedlex.data.admin.ch/filestore/x.xml', async () =>
        antwort(shell, 'text/html'),
      ),
    ).rejects.toThrow(/Soft-404/);
  });

  // Gegenprüfung 15.8.2026, Probe D: eine Wartungsantwort mit korrektem
  // Content-Type kam durch und lieferte 0 eIds ⇒ «alles gleich».
  it('gültiges XML, das kein AKN-Dokument ist, wird abgelehnt', async () => {
    await expect(
      holeXml('https://fedlex.data.admin.ch/filestore/x.xml', async () =>
        antwort('<?xml version="1.0"?><error>maintenance</error>', 'application/xml'),
      ),
    ).rejects.toThrow(/kein AKN-Dokument/);
  });

  it('HTTP-Fehler schlägt durch (keine stille leere Menge)', async () => {
    await expect(
      holeXml('https://fedlex.data.admin.ch/filestore/x.xml', async () =>
        antwort('', 'application/xml', 503),
      ),
    ).rejects.toThrow(/HTTP 503/);
  });

  it('Netz-Ausfall mitten in den drei Fassungen bricht ab (statt DE/FR gegen nichts zu vergleichen)', async () => {
    let n = 0;
    const fetchImpl = (async () => {
      n++;
      if (n < 3) return antwort('<akomaNtoso><article eId="art_1"/></akomaNtoso>', 'application/xml');
      throw new Error('ECONNRESET');
    }) as typeof fetch;
    await expect(
      holeFassungen({ de: 'u/de', fr: 'u/fr', it: 'u/it' }, fetchImpl, 0),
    ).rejects.toThrow(/ECONNRESET/);
    expect(n).toBe(3);
  });
});

describe('QS-FRIT-DRIFT · Kern-Erlass-Auswahl (§5: abgeleitet, nicht gepflegt)', () => {
  const pin = (name: string, anker: number): PinVoll => ({
    name,
    eli: `cc/x/${name}`,
    kons: '2026-01-01',
    konsKompakt: '20260101',
    n: 0,
    anker: Array.from({ length: anker }, (_, i) => `art_${i}`),
    sr: '1',
  });

  it('sortiert nach Anker ↓, Gewicht ↓, Name ↑ und ist deterministisch', () => {
    const pins = [pin('c', 1), pin('a', 5), pin('b', 1), pin('d', 5)];
    const gewicht = (n: string) => (n === 'a' ? 10 : n === 'd' ? 99 : 0);
    const gewaehlt = waehleKernErlasse(pins, gewicht, 4).map((p) => p.name);
    expect(gewaehlt).toEqual(['d', 'a', 'b', 'c']);
    expect(waehleKernErlasse(pins, gewicht, 4).map((p) => p.name)).toEqual(gewaehlt);
  });

  it('liefert genau KERN_ANZAHL echte Pins aus dem Bestand (cache.sh, SSoT)', () => {
    const alle = lesePinsVoll();
    expect(alle.length).toBeGreaterThan(KERN_ANZAHL);
    const kern = waehleKernErlasse(alle, () => 0);
    expect(kern).toHaveLength(KERN_ANZAHL);
    // Die tragenden Erlasse müssen drin sein — sonst misst das Tor am Rand.
    for (const name of ['or', 'zgb', 'zpo', 'stgb', 'stpo', 'schkg', 'bgg', 'bv']) {
      expect(kern.map((p) => p.name)).toContain(name);
    }
  });
});
