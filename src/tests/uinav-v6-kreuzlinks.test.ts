import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN } from '../lib/startseiteConfig';
import { passendeRechner, karteIdFuerPfad } from '../components/vorlagen/PassendeRechner';

// ─── W2·10-UI-NAV · V6 · Vorlage↔Rechner-Kreuzlinks (symmetrisch) ───────────
//
// Die Spec nennt ein neues Registry-Feld `passendeRechner`. Gebaut ist statt
// dessen die Projektion über das BESTEHENDE `related` (§5, s. Komponenten-Kopf).
// Diese Fälle nageln beides fest: die Mindest-Kanten der Spec sind da, und sie
// sind in BEIDE Richtungen da — eine Einbahn ist der Fehler, den V6 behebt.

/** Von der Spec verlangte Mindest-Paare (Vorlage ↔ Rechner). */
const MINDEST_PAARE: [string, string][] = [
  ['verjaehrungsverzicht', 'verjaehrung'],
  ['mahnung', 'verzugszins'],
  ['klage-vereinfacht', 'streitwert'],
  ['klage-vereinfacht', 'prozesskosten'],
  ['klage-ordentlich', 'streitwert'],
  ['klage-ordentlich', 'prozesskosten'],
];

const rel = (id: string) => ALLE_KARTEN.find((k) => k.id === id)?.related ?? [];

describe('V6 — Mindest-Kreuzlinks, symmetrisch', () => {
  MINDEST_PAARE.forEach(([vorlage, rechner]) => {
    it(`${vorlage} ↔ ${rechner} ist in beide Richtungen verdrahtet`, () => {
      expect(rel(vorlage), `${vorlage} → ${rechner}`).toContain(rechner);
      expect(rel(rechner), `${rechner} → ${vorlage}`).toContain(vorlage);
    });
  });
});

describe('V6 — Projektion auf die Rechner-Kanten', () => {
  it('liefert für den Verjährungsverzicht den Verjährungsrechner', () => {
    expect(passendeRechner('verjaehrungsverzicht').map((r) => r.id)).toContain('verjaehrung');
  });

  it('liefert nur Rechner — nie Vorlagen (die Gegenrichtung hat ihre eigene Fläche)', () => {
    ['klage-ordentlich', 'mahnung', 'verjaehrungsverzicht'].forEach((id) => {
      passendeRechner(id).forEach((r) => {
        expect(ALLE_KARTEN.find((k) => k.id === r.id)?.modus).toBe('rechner');
      });
    });
  });

  it('§8: verlinkt nie auf «In Vorbereitung» (kein toter Weg)', () => {
    ALLE_KARTEN.forEach((k) => {
      passendeRechner(k.id).forEach((r) => {
        const ziel = ALLE_KARTEN.find((x) => x.id === r.id);
        expect(ziel?.status, `${k.id} → ${r.id}`).not.toBe('geplant');
        expect(r.href).toMatch(/^\/(rechner|vorlagen)\//);
      });
    });
  });

  it('unbekannte Karte → leere Liste (kein Wurf)', () => {
    expect(passendeRechner('gibt-es-nicht')).toEqual([]);
  });
});

describe('V6 — Karten-Auflösung über den Routenpfad', () => {
  it('findet die Karte zum Vorlagen-Pfad, auch mit Schluss-Slash', () => {
    expect(karteIdFuerPfad('/vorlagen/klage-ordentlich')).toBe('klage-ordentlich');
    expect(karteIdFuerPfad('/vorlagen/klage-ordentlich/')).toBe('klage-ordentlich');
  });

  it('fremder Pfad → null (die Zeile erscheint dann gar nicht)', () => {
    expect(karteIdFuerPfad('/gesetze/bund/OR')).toBeNull();
  });
});
