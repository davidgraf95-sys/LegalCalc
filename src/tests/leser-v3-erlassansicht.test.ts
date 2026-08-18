import { describe, expect, it } from 'vitest';
import {
  brotkrume, ebeneAngabe, hatRuecksprung, overlineGebiet, suchFeldName, suchPlatzhalter,
  uebersichtsZeile,
} from '../pages/gesetz-leser/v3/erlassAnsicht';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { KantonSystematik } from '../lib/normtext/systematik';

// ─── Vertrags-Tests für erlassAnsicht.ts (Auflage David 16.8.2026) ──────────
//
// «Der Rahmen funktioniert für Bund, Kanton und Staatsvertrag identisch —
//  Erlass-spezifisches kommt aus dem Datenmodell, nie aus `if (bund)`.» Diese
// Datei prüft genau die vier Ableitungen, aus denen diese Zusage besteht:
// `ebeneAngabe`, `uebersichtsZeile`, `overlineGebiet`, `brotkrume`. DOM-frei
// (§2) — reine Funktionen auf einem `Pick<BrowseErlass, …>`.
//
// Rot zu bekommen: in `ebeneAngabe` den `rechtsgebiet === 'international'`-
// Vorrang entfernen, in `uebersichtsZeile` `.filter(Boolean)` weglassen, oder
// in `overlineGebiet` den Kanton-Zweig auf einen Platzhalter statt `null`
// umstellen.

describe('ebeneAngabe — die drei Ebenen des Korpus', () => {
  it('Bund: Label «Bund», Ziel die ungefilterte Übersicht', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'> = {
      ebene: 'bund', kanton: null, rechtsgebiet: 'privat',
    };
    expect(ebeneAngabe(e)).toEqual({ label: 'Bund', to: '/gesetze' });
  });

  it('Kanton BS: Label «Kanton BS», Ziel mit Ebene- und Kantonsfilter', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'> = {
      ebene: 'kanton', kanton: 'BS', rechtsgebiet: 'oeffentlich',
    };
    expect(ebeneAngabe(e)).toEqual({ label: 'Kanton BS', to: '/gesetze?ebene=kanton&kt=BS' });
  });

  it('International: Label «International», eigenes Ziel — UNABHÄNGIG von ebene', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'> = {
      ebene: 'bund', kanton: null, rechtsgebiet: 'international',
    };
    expect(ebeneAngabe(e)).toEqual({ label: 'International', to: '/gesetze?ebene=international' });
  });

  it('rechtsgebiet: "international" schlägt ebene — auch wenn ebene "kanton" wäre', () => {
    // Diese Konstellation kommt im Korpus real nicht vor (Staatsverträge stehen
    // auf Bundesebene), aber der VORRANG ist die Zusage, nicht die Plausibilität
    // der Eingabe — die Funktion prüft rechtsgebiet zuerst, ebene nie parallel.
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'> = {
      ebene: 'kanton', kanton: 'ZH', rechtsgebiet: 'international',
    };
    expect(ebeneAngabe(e)).toEqual({ label: 'International', to: '/gesetze?ebene=international' });
  });

  it('ein Kanton mit Sonderzeichen wird URL-kodiert', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'> = {
      ebene: 'kanton', kanton: 'A&B', rechtsgebiet: 'oeffentlich',
    };
    const a = ebeneAngabe(e);
    expect(a.to).toBe('/gesetze?ebene=kanton&kt=A%26B');
    // Der rohe Kantonswert darf in der QUERY nicht unkodiert auftauchen —
    // sonst bräche das & den Query-String in zwei Parameter.
    expect(a.to).not.toContain('kt=A&B');
  });
});

describe('uebersichtsZeile — fehlende Angaben entfallen ERSATZLOS', () => {
  it('SR und Stand vorhanden: alle drei Teile, durch " · " getrennt', () => {
    const zeile = uebersichtsZeile({ sr: '210', stand: '2026-01-01' }, 480, 'Artikel');
    expect(zeile).toBe('SR 210 · 480 Artikel · Stand 01.01.2026');
  });

  it('SR fehlt: kein "SR undefined", kein leeres Trennzeichen am Anfang', () => {
    const zeile = uebersichtsZeile({ sr: null, stand: '2026-01-01' }, 480, 'Artikel');
    expect(zeile).toBe('480 Artikel · Stand 01.01.2026');
    expect(zeile).not.toContain('SR undefined');
    expect(zeile.startsWith(' ·')).toBe(false);
  });

  it('Stand fehlt: kein leeres Trennzeichen am Ende', () => {
    const zeile = uebersichtsZeile({ sr: '210', stand: '' }, 480, 'Artikel');
    expect(zeile).toBe('SR 210 · 480 Artikel');
    expect(zeile.endsWith('·')).toBe(false);
  });

  it('beides fehlt: nur die Umfang-Angabe, kein Trennzeichen überhaupt', () => {
    const zeile = uebersichtsZeile({ sr: null, stand: '' }, 480, 'Paragraphen');
    expect(zeile).toBe('480 Paragraphen');
    expect(zeile).not.toContain('·');
  });

  it('bestimmungsWort wird durchgereicht (kantonale Erlasse zählen Paragraphen)', () => {
    const zeile = uebersichtsZeile({ sr: null, stand: '' }, 12, 'Paragraphen');
    expect(zeile).toContain('12 Paragraphen');
    expect(zeile).not.toContain('Artikel');
  });
});

describe('overlineGebiet — Bund zeigt das Rechtsgebiet, Kanton nur Verifiziertes', () => {
  it('Bund: liefert das Rechtsgebiet-Etikett', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'sr'> = {
      ebene: 'bund', kanton: null, rechtsgebiet: 'privat', sr: '210',
    };
    const label = overlineGebiet(e, {});
    expect(label).not.toBeNull();
    expect(typeof label).toBe('string');
  });

  it('Kanton OHNE verifizierte Systematik: null — nie ein Platzhalter (§8)', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'sr'> = {
      ebene: 'kanton', kanton: 'AG', rechtsgebiet: 'oeffentlich', sr: 'SAR 152.110',
    };
    // Leere Systematik-Map ⇒ kein Eintrag für 'AG' ⇒ verifiziertesSachgebiet
    // liefert null ⇒ overlineGebiet liefert null, NIE "Bereich AG" o.ä.
    expect(overlineGebiet(e, {})).toBeNull();
  });

  it('Kanton MIT verifizierter Systematik: das aufgelöste Top-Sachgebiet', () => {
    const kantonSys: Record<string, KantonSystematik> = {
      AG: {
        roots: [{ nummer: '6', name: 'Finanzrecht', kinder: [{ nummer: '64', name: 'Steuern' }] }],
        index: { '640100': ['6', '64'] },
      },
    };
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'sr'> = {
      ebene: 'kanton', kanton: 'AG', rechtsgebiet: 'oeffentlich', sr: '640.100',
    };
    expect(overlineGebiet(e, kantonSys)).toBe('Finanzrecht');
  });
});

describe('brotkrume — genau drei Stufen, die letzte ohne `to`', () => {
  it('Bund: Gesetze › Bund › Kürzel', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'kuerzel'> = {
      ebene: 'bund', kanton: null, rechtsgebiet: 'privat', kuerzel: 'OR',
    };
    const b = brotkrume(e);
    expect(b).toHaveLength(3);
    expect(b[0]).toEqual({ label: 'Gesetze', to: '/gesetze' });
    expect(b[1]).toEqual({ label: 'Bund', to: '/gesetze' });
    expect(b[2]).toEqual({ label: 'OR' });
  });

  it('die letzte Stufe trägt KEIN `to` — sie ist die aktuelle Seite, nicht klickbar', () => {
    const e: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'kuerzel'> = {
      ebene: 'kanton', kanton: 'BS', rechtsgebiet: 'oeffentlich', kuerzel: 'GebT',
    };
    const b = brotkrume(e);
    expect(b).toHaveLength(3);
    expect(b[2].to).toBeUndefined();
    expect('to' in b[2]).toBe(false);
    // Die ersten beiden Stufen SIND klickbar.
    expect(b[0].to).toBeDefined();
    expect(b[1].to).toBeDefined();
  });
});

// ═══ Ä87/Ä91 (H4-Nachzug 18.8.2026) · DIE ZUSAGE UNTER DEM GESTRICHENEN ✕ ════
//
// Das Kopf-✕ «Gesetz schliessen» ist weg (Messreihe und Herleitung im Kopf von
// `v3/kopfStufen.ts`). Es DARF weg, weil sein Ziel `/gesetze` in derselben Zeile
// als beschriftetes Wort steht — als volle Kette oder als Rücksprung
// «‹ Gesetze». Diese Zusage ruht auf einer einzigen Eigenschaft der Krume, und
// die wird hier geprüft statt angenommen: nähme jemand der ersten Stufe ihr
// `to`, stünde die V3-Kopfzeile ohne jeden Weg nach oben da — still, und auf
// jeder Breite.
//
// Rot zu bekommen (§6.7, gefahren 18.8.2026): in `brotkrume` beim ersten
// Eintrag `to: '/gesetze'` weglassen.
describe('hatRuecksprung — die Kopfzeile hat auf jeder Ebene einen Weg nach oben', () => {
  const FAELLE: [string, Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'kuerzel'>][] = [
    ['Bund', { ebene: 'bund', kanton: null, rechtsgebiet: 'privat', kuerzel: 'StPO' }],
    ['Kanton BS', { ebene: 'kanton', kanton: 'BS', rechtsgebiet: 'oeffentlich', kuerzel: 'GebT' }],
    ['Staatsvertrag', { ebene: 'bund', kanton: null, rechtsgebiet: 'international', kuerzel: 'LugÜ' }],
  ];
  it.each(FAELLE)('%s: erste Krumen-Stufe trägt ein Ziel', (_name, e) => {
    expect(hatRuecksprung(e)).toBe(true);
    // Und zwar DASSELBE Ziel, das das ✕ hatte — sonst wäre die Streichung ein
    // Verlust und keine Entdopplung (§5).
    expect(brotkrume(e)[0]?.to).toBe('/gesetze');
  });
});

// ═══ Ä126 (Bug-Check P1-1 / Architektur P3-2, 18.8.2026) · DAS SUCHFELD ══════
//
// GEMESSEN am Live-Stand nach der Säuberung: an ZH-211.11 lautete der
// Platzhalter «Im Gebührenverordnung des Obergerichts (GebV OG) suchen oder
// «§ 1» …» — 465 px in einem 280 px breiten Feld (@390), also über die halbe
// Auskunft abgeschnitten, und dazu grammatisch falsch («die Verordnung»).
//
// ZWEI FEHLER, EINE URSACHE: Ä112 hatte den Erlass in den SICHTBAREN Platzhalter
// gesetzt und dabei zwei Eigenschaften des Registerfelds `kuerzel` übersehen —
// es ist NICHT längenbeschränkt (753 der 1469 Werte sind länger als 20 Zeichen,
// der längste 521) und es hat ein beliebiges Genus, das der feste Artikel «Im»
// nicht treffen kann (StPO/ZPO/BV sind Feminina).
//
// DIE TRENNUNG, die beides löst: der sichtbare Platzhalter trägt gar keine
// Daten mehr («Im Erlass suchen oder «§ 1» …» — konstante Länge, das
// Sprung-Beispiel bleibt erlassgerecht aus Ä20); der Erlass wandert in den
// ZUGÄNGLICHEN NAMEN, wo Pixel nicht zählen, und steht dort als Apposition zu
// «Erlass» — damit regiert der Artikel das Substantiv und nie das Kürzel, in
// jedem Genus. Über der Längenschwelle entfällt das Kürzel auch dort: was
// länger ist als 20 Zeichen, ist im Register kein Kürzel mehr, sondern ein
// Volltitel, und der ist gesprochen Lärm statt Orientierung.
//
// PROXY UND SEINE KALIBRIERUNG (die Sonde ist DOM-frei, §2): gemessen wird die
// ZEICHENZAHL. Der Faktor stammt aus genau jener Live-Messung — 68 Zeichen
// ≙ 465 px bei `text-body-s`, also ~6,84 px/Zeichen; das nutzbare Innenmass des
// Felds @390 sind 280 px abzüglich Polsterung und Lupe ≈ 256 px ⇒ 37 Zeichen.
// Ein Proxy ist kein Pixelmass; er fängt die Fehlerklasse, die hier auftrat
// (eine unbegrenzte DATENlänge im Platzhalter), und er kann scheitern (§6.7 —
// rot gefahren 18.8.2026 gegen den Vorzustand: 68 > 37).
const PLATZHALTER_MAX_ZEICHEN = 37;

describe('Ä126 · Such-Platzhalter und Feldname: erlassneutral, genusfrei, längenfest', () => {
  /** Der ECHTE Registerwert von ZH-211.11 — der Fall aus der Live-Messung. */
  const VOLLTITEL = 'Gebührenverordnung des Obergerichts (GebV OG)';

  it('der Platzhalter wächst nicht mit dem Kürzel', () => {
    // ROT-BEWEIS 18.8.2026: mit der Ä112-Signatur — `suchPlatzhalter(beispiel,
    // VOLLTITEL)`, wie sie `LeserRahmenV3` aufrief — stand hier «Im
    // Gebührenverordnung des Obergerichts (GebV OG) suchen oder «§ 1» …»,
    // 68 statt ≤ 37 Zeichen. Dass das Kürzel gar nicht mehr HINEINGEREICHT
    // werden kann, hält die Quellensonde in `leser-benennung.test.ts` fest;
    // hier steht die Wirkung.
    for (const beispiel of ['§ 1', 'Art. 1', null]) {
      expect(suchPlatzhalter(beispiel).length,
        `Platzhalter «${suchPlatzhalter(beispiel)}» überschreitet das Feld @390`,
      ).toBeLessThanOrEqual(PLATZHALTER_MAX_ZEICHEN);
    }
  });

  it('das Sprung-Beispiel bleibt erlassgerecht (Ä20 unangetastet)', () => {
    expect(suchPlatzhalter('§ 1')).toContain('«§ 1»');
    expect(suchPlatzhalter('Art. 1')).toContain('«Art. 1»');
    // Ohne Etikett verspricht das Feld keinen Sprung (§8).
    expect(suchPlatzhalter(null)).not.toContain('«');
  });

  it('der zugängliche Name nennt ein wirkliches Kürzel — und sonst nichts', () => {
    expect(suchFeldName('StPO')).toBe('Im Erlass StPO suchen oder zu einer Bestimmung springen');
    const ohne = 'Im Erlass suchen oder zu einer Bestimmung springen';
    expect(suchFeldName(VOLLTITEL)).toBe(ohne);
    expect(suchFeldName(undefined)).toBe(ohne);
    expect(suchFeldName('   ')).toBe(ohne);
  });

  it('der Artikel regiert «Erlass», nie das Kürzel — in jedem Genus', () => {
    for (const k of ['StPO', 'ZPO', 'BV', 'OR', 'GebV OG', VOLLTITEL, '']) {
      expect(suchFeldName(k), `Genus-Falle bei «${k}»`).toMatch(/^Im Erlass\b/);
    }
  });
});
