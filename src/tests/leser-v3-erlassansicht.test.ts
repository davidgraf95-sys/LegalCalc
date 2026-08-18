import { describe, expect, it } from 'vitest';
import { brotkrume, ebeneAngabe, hatRuecksprung, overlineGebiet, uebersichtsZeile } from '../pages/gesetz-leser/v3/erlassAnsicht';
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
