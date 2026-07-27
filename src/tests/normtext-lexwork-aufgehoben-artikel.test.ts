/**
 * G-AUFH-ART (W2·5j, BS-132.100-Audit 27.7.2026) — ARTIKEL-genauer
 * Aufgehoben-Marker im LexWork-Adapter.
 *
 * BEFUND: 951 Kantons-Artikel (946 BS, 5 GL) liegen als leere Snapshots vor
 * (ein Block, text: '', ohne jedes Signal am Eintrag) — der Reader kann NICHT
 * unterscheiden, ob ein Artikel amtlich aufgehoben ist oder ob die Extraktion
 * schlicht nichts gefunden hat. Diese Tests verankern die amtliche Erkennungs-
 * regel: `aufgehoben: true` NUR wenn das Artikel-Segment nach vollständiger
 * Extraktion (paragraph/enumeration_item/enumeration_tabular/paragraph_post)
 * buchstäblich KEINEN Block liefert — unabhängig davon, ob der amtliche
 * Randtitel die Ellipse '…' trägt (§ 51/§ 55, Art. 3/4/8–11) oder einen ECHTEN
 * Sachtitel behält (§ 76a/§ 76b) — beide Varianten sind empirisch belegt
 * gleichwertige Aufhebungs-Fälle (s. Fixture-Doku).
 *
 * VOR diesem Fix (rot): `extrahiereAlleLexWorkArtikel(...).artikel[token]` trug
 * KEIN `aufgehoben`-Feld — das Feld existierte nicht im Typ.
 */
import { describe, expect, it } from 'vitest';
import { extrahiereAlleLexWorkArtikel } from '../../scripts/normtext/adapter-lexwork';
import {
  LEXWORK_BS_132100_S50_S55_XHTML,
  LEXWORK_BS_132100_S76_RANGE_XHTML,
  LEXWORK_GL_IIIC1_ART1_4_XHTML,
  LEXWORK_GL_IIIC1_ART8_11_XHTML,
} from './fixtures/lexwork-aufgehoben-artikel';

describe('G-AUFH-ART — BS 132.100 §§ 50/51/55 (Ellipsen-Titel-Variante)', () => {
  const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_132100_S50_S55_XHTML);

  it('§ 50 (Body vorhanden) trägt KEINEN Aufgehoben-Marker', () => {
    expect(artikel['50'].aufgehoben).toBeUndefined();
    expect(artikel['50'].bloecke.length).toBeGreaterThan(0);
    expect(artikel['50'].bloecke[0].text).not.toBe('');
  });

  it('§ 51 (article_title="…", kein Body) trägt `aufgehoben: true`', () => {
    expect(artikel['51'].aufgehoben).toBe(true);
    expect(artikel['51'].titel).toBeUndefined();
  });

  it('§ 55 (dasselbe Muster) trägt ebenfalls `aufgehoben: true`', () => {
    expect(artikel['55'].aufgehoben).toBe(true);
  });
});

describe('G-AUFH-ART — BS 132.100 §§ 76/76a/76b/76c (echter-Randtitel-Variante)', () => {
  const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_132100_S76_RANGE_XHTML);

  it('§ 76 (Body vorhanden, VOR der abrogation_ellip-Sektion) trägt KEINEN Marker', () => {
    expect(artikel['76'].aufgehoben).toBeUndefined();
  });

  it('§ 76a trägt `aufgehoben: true` UND behält seinen echten Randtitel', () => {
    expect(artikel['76_a'].aufgehoben).toBe(true);
    expect(artikel['76_a'].titel).toBe('Zeitpunkt der Wahlvorschläge');
  });

  it('§ 76b ebenso: Marker UND echter Randtitel bleiben nebeneinander bestehen', () => {
    expect(artikel['76_b'].aufgehoben).toBe(true);
    expect(artikel['76_b'].titel).toBe('Relatives Mehr');
  });

  it('§ 76c (Body vorhanden, GLEICHE Sektion wie 76a/76b) trägt KEINEN Marker — die Section-Markierung allein genügt nicht, nur die eigene Body-Leere entscheidet', () => {
    expect(artikel['76_c'].aufgehoben).toBeUndefined();
    expect(artikel['76_c'].bloecke.length).toBeGreaterThan(0);
  });
});

describe('G-AUFH-ART — GL III-C.1 (zweiter LexWork-Host, Kreuzprobe)', () => {
  it('Art. 1/2 (Body vorhanden) tragen keinen Marker; Art. 3/4 (Ellipse) schon', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_GL_IIIC1_ART1_4_XHTML);
    expect(artikel['1'].aufgehoben).toBeUndefined();
    expect(artikel['2'].aufgehoben).toBeUndefined();
    expect(artikel['3'].aufgehoben).toBe(true);
    expect(artikel['4'].aufgehoben).toBe(true);
  });

  it('Art. 8–11 (Mehrfach-Bereichs-Token, ein einzelner Platzhalter-Eintrag) trägt den Marker', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_GL_IIIC1_ART8_11_XHTML);
    const key = Object.keys(artikel).find((k) => k.includes('8') && k.includes('11'));
    expect(key).toBeDefined();
    expect(artikel[key!].aufgehoben).toBe(true);
  });
});
