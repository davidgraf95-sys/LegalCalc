// IA-4 · Scope-Chip lokale Suche (FAHRPLAN-GESETZES-UX §11.5, O5-Rest):
// reine Scope-Helfer für das lokale Browse-Filterfeld der Gesetzes-Übersicht.
//   – Default-Scope = aktive Ebene (Säule bzw. gewählter Kanton, N6-Muster);
//     EIN Klick («auf alle Ebenen erweitern») weitet auf alle Ebenen.
//   – KEIN dritter Suchpfad (O5/A5): die Helfer ändern nur den SCOPE des
//     bestehenden Filters (Basis-Menge), sie bauen keine neue Suche und
//     keinen neuen Index (K10 — alles rechnet auf dem geladenen Manifest).
//   – Ehrliches Label (§8): der Text sagt exakt, WAS durchsucht wird.
import { describe, it, expect } from 'vitest';
import {
  loeseFilterScope, scopeLabel, scopeBasis, type FilterScope,
} from '../pages/gesetze-teile/filter-scope';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// Minimaler Erlass-Bauer (nur die scope-relevanten Felder variieren).
function erlass(teil: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'X', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'X',
    sr: null, rechtsgebiet: 'privat', sprache: 'de', rang: 0,
    status: 'snapshot', datei: 'bund/X.json', artikelAnzahl: 1,
    stand: '2026-01-01', quelleUrl: 'https://example.org', fassungsToken: '',
    pdfPfad: null,
    ...teil,
  } as BrowseErlass;
}

// Repräsentative Mini-Menge: Bund, International (ebene 'bund' +
// rechtsgebiet 'international' — dieselbe Säulen-Logik wie Gesetze.tsx),
// zwei Kantone.
const OR = erlass({ key: 'OR', kuerzel: 'OR', titel: 'Obligationenrecht' });
const EMRK = erlass({ key: 'EMRK', kuerzel: 'EMRK', titel: 'EMRK', rechtsgebiet: 'international' });
const BS1 = erlass({ key: 'bs-1', ebene: 'kanton', kanton: 'BS', titel: 'Anwaltsgesetz BS' });
const ZH1 = erlass({ key: 'zh-1', ebene: 'kanton', kanton: 'ZH', titel: 'Notariatsgebührenverordnung' });
const ALLE = [OR, EMRK, BS1, ZH1];

describe('loeseFilterScope — Default-Scope = aktive Ebene, Chip weitet (§11.5 IA-4)', () => {
  it('Landeplatz (keine Säule gewählt): alle Ebenen', () => {
    expect(loeseFilterScope(null, null, false)).toEqual({ art: 'alle' });
  });

  it('Säule Bund: Scope Bund', () => {
    expect(loeseFilterScope('bund', null, false)).toEqual({ art: 'saeule', saeule: 'bund' });
  });

  it('Säule International: Scope International', () => {
    expect(loeseFilterScope('international', null, false)).toEqual({ art: 'saeule', saeule: 'international' });
  });

  it('Säule Kantone ohne gewählten Kanton (Stufe A): Scope alle Kantone', () => {
    expect(loeseFilterScope('kanton', null, false)).toEqual({ art: 'saeule', saeule: 'kanton' });
  });

  it('gewählter Kanton (?kt=BS, Stufe B): Scope Kanton BS (N6-Default bleibt)', () => {
    expect(loeseFilterScope('kanton', 'BS', false)).toEqual({ art: 'kanton', kanton: 'BS' });
  });

  it('Chip gedrückt (alleEbenen): weitet JEDEN engen Scope auf alle Ebenen', () => {
    expect(loeseFilterScope('bund', null, true)).toEqual({ art: 'alle' });
    expect(loeseFilterScope('kanton', 'BS', true)).toEqual({ art: 'alle' });
    expect(loeseFilterScope('international', null, true)).toEqual({ art: 'alle' });
  });
});

describe('scopeLabel — ehrlicher Klartext je Scope (§8)', () => {
  const name = (k: string) => (k === 'BS' ? 'Basel-Stadt' : k);

  it('alle Ebenen', () => {
    expect(scopeLabel({ art: 'alle' }, name)).toBe('Filtert: alle Ebenen (Bund, Kantone, International)');
  });

  it('je Säule', () => {
    expect(scopeLabel({ art: 'saeule', saeule: 'bund' }, name)).toBe('Filtert: Bund');
    expect(scopeLabel({ art: 'saeule', saeule: 'kanton' }, name)).toBe('Filtert: Kantone');
    expect(scopeLabel({ art: 'saeule', saeule: 'international' }, name)).toBe('Filtert: International');
  });

  it('gewählter Kanton: voller Name, Fallback Code', () => {
    expect(scopeLabel({ art: 'kanton', kanton: 'BS' }, name)).toBe('Filtert: Kanton Basel-Stadt');
    expect(scopeLabel({ art: 'kanton', kanton: 'XX' }, name)).toBe('Filtert: Kanton XX');
  });
});

describe('scopeBasis — Basis-Menge je Scope (kein neuer Index, K10)', () => {
  it('alle: identische Menge (kein Verlust, keine Kopie-Logik)', () => {
    expect(scopeBasis(ALLE, { art: 'alle' })).toEqual(ALLE);
  });

  it('Bund: nur echte Bundeserlasse — International ausgeschlossen (Säulen-Logik)', () => {
    expect(scopeBasis(ALLE, { art: 'saeule', saeule: 'bund' })).toEqual([OR]);
  });

  it('Kantone (Stufe A): alle kantonalen Erlasse', () => {
    expect(scopeBasis(ALLE, { art: 'saeule', saeule: 'kanton' })).toEqual([BS1, ZH1]);
  });

  it('International: nur die International-Säule', () => {
    expect(scopeBasis(ALLE, { art: 'saeule', saeule: 'international' })).toEqual([EMRK]);
  });

  it('Kanton BS: nur BS', () => {
    expect(scopeBasis(ALLE, { art: 'kanton', kanton: 'BS' })).toEqual([BS1]);
  });

  it('Vollständigkeit: Bund ∪ Kantone ∪ International = alle (nichts fällt still weg)', () => {
    const union = [
      ...scopeBasis(ALLE, { art: 'saeule', saeule: 'bund' }),
      ...scopeBasis(ALLE, { art: 'saeule', saeule: 'kanton' }),
      ...scopeBasis(ALLE, { art: 'saeule', saeule: 'international' }),
    ];
    expect(new Set(union.map((e) => e.key))).toEqual(new Set(ALLE.map((e) => e.key)));
    expect(union).toHaveLength(ALLE.length);
  });
});

// Typ-Anker: FilterScope bleibt eine geschlossene Union (Erweiterungen sind
// bewusste Spec-Änderungen an §11.5, nie ad hoc).
const _typProbe: FilterScope[] = [
  { art: 'alle' },
  { art: 'saeule', saeule: 'bund' },
  { art: 'kanton', kanton: 'ZH' },
];
void _typProbe;
