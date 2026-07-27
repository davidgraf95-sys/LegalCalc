/**
 * G-AUFH-ART Runde 2 (Gegenprüfung 27.7.2026, Verdikt WIDERLEGT gegen Runde 1) —
 * die Runde-1-Regel («kein Body-Block») stempelte mindestens 34 GELTENDE
 * Artikel fälschlich als aufgehoben. Diese Tests verankern die verschärfte
 * Regel: amtliches SIGNAL (AGS-Kopf-Stern ODER eigene Abrogations-Ellipse) UND
 * kein echter Norminhalt UND kein Container-/Anhang-Ausschluss.
 *
 * ROT VOR RUNDE 2 (mit der Runde-1-Regel `bloecke.length === 0`):
 *   - BS-212.410 §34 blieb UNMARKIERT (Falsch-Negativ: bloecke.length === 1).
 *   - BS-786.310 Ziffer 2.1/2.1.1/2.1.2 wurden ALLE markiert (2.1 fälschlich).
 * Siehe je Testfall die eingebettete Rot-Beweis-Erwartung.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
import { extrahiereAlleLexWorkArtikel, holeLexWork } from '../../scripts/normtext/adapter-lexwork';
import {
  LEXWORK_BS_212410_S34_XHTML,
  LEXWORK_BS_786310_ZIFFER_2_1_XHTML,
  LEXWORK_BS_685340_S46_XHTML,
  LEXWORK_KONSTRUIERT_CONTAINER_MIT_STERN_XHTML,
  LEXWORK_KONSTRUIERT_ANNEX_MIT_STERN_XHTML,
} from './fixtures/lexwork-aufgehoben-runde2';

describe('G-AUFH-ART Runde 2 — Falsch-Negativ behoben: eigene Abrogations-Ellipse ohne Kopf-Stern', () => {
  it('BS-212.410 §34 (kein Stern, Body = «…») trägt jetzt `aufgehoben: true`', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_212410_S34_XHTML);
    expect(artikel['34'].aufgehoben).toBe(true);
    // Kontrollprobe: die Runde-1-Regel hätte hier NICHT gegriffen (bloecke.length === 1).
    expect(artikel['34'].bloecke.length).toBe(1);
  });

  it('§35 (echter Wortlaut, unmittelbar danach) bleibt unmarkiert', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_212410_S34_XHTML);
    expect(artikel['35'].aufgehoben).toBeUndefined();
  });
});

describe('G-AUFH-ART Runde 2 — Fehlklasse 1 behoben: Container-Ziffern ohne eigenen Wortlaut', () => {
  it('BS-786.310 Ziffer 2.1 (Container, kein Stern, kein Body) bleibt UNMARKIERT', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_786310_ZIFFER_2_1_XHTML);
    expect(artikel['2.1'].aufgehoben).toBeUndefined();
  });

  it('die Kinder 2.1.1/2.1.2 (echter Wortlaut) bleiben ebenfalls unmarkiert', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_786310_ZIFFER_2_1_XHTML);
    expect(artikel['2.1.1'].aufgehoben).toBeUndefined();
    expect(artikel['2.1.2'].aufgehoben).toBeUndefined();
  });

  it('KONSTRUIERT: ein Container MIT eigenem Stern wird durch den Ausschluss zurückgenommen (Ausschluss ist load-bearing)', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_KONSTRUIERT_CONTAINER_MIT_STERN_XHTML);
    // Ohne den Container-Ausschluss würde die Kern-Regel (Stern + kein Body)
    // hier fälschlich zuschlagen — der Test beweist, dass der Ausschluss greift.
    expect(artikel['9.1'].aufgehoben).toBeUndefined();
    expect(artikel['9.1.1'].aufgehoben).toBeUndefined();
  });
});

describe('G-AUFH-ART Runde 2 — Fehlklasse 2 behoben: Anhang-Verweis statt Aufhebung', () => {
  it('BS-685.340 §46 (kein Stern, Inhalt im Anhang) bleibt bereits über die Kern-Regel unmarkiert', () => {
    const { artikel } = extrahiereAlleLexWorkArtikel(LEXWORK_BS_685340_S46_XHTML);
    expect(artikel['46'].aufgehoben).toBeUndefined();
  });

  it('KONSTRUIERT (holeLexWork, gemocktes fetch): §50 MIT Stern + annex_documents (abrogated:false) wird durch den Anhang-Ausschluss zurückgenommen', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        text_of_law: {
          title: 'Anhang-Testgesetz',
          abbreviation: '',
          enactment: '2020-01-01',
          version_uid: 'anhang-test',
          current_version: { structured_document_id: 1, version_dates_str: 'in Kraft seit: 01.01.2020' },
          selected_version: {
            structured_document_id: 1,
            xhtml_tol: LEXWORK_KONSTRUIERT_ANNEX_MIT_STERN_XHTML,
            annex_documents: [{ title: 'Tarif zu § 50', abrogated: false }],
          },
        },
      }),
    }) as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);
    const r = await holeLexWork('test.example', 'de', 'anhang-test');
    expect(r.artikel['50'].aufgehoben).toBeUndefined();
  });
});
