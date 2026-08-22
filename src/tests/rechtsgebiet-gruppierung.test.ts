import { describe, it, expect } from 'vitest';
import { gruppiereNachRechtsgebiet } from '../pages/gesetze-teile/rechtsgebiet-gruppierung';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

function be(p: Partial<BrowseErlass>): BrowseErlass {
  return {
    key: 'X', ebene: 'bund', kanton: null, kuerzel: 'X', titel: 'Titel', sr: null,
    rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
    datei: 'bund/X.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'u', fassungsToken: 't',
    pdfPfad: null,
    ...p,
  };
}

describe('gruppiereNachRechtsgebiet — J3 (SSoT-Achse, GEBIETE-Reihenfolge)', () => {
  it('gruppiert nach rechtsgebiet, in GEBIETE-Deklarationsreihenfolge (nicht Erlass-Reihenfolge)', () => {
    const g = gruppiereNachRechtsgebiet([
      be({ key: 'STGB', kuerzel: 'StGB', rechtsgebiet: 'straf', rang: 1 }),
      be({ key: 'OR', kuerzel: 'OR', rechtsgebiet: 'privat', rang: 2 }),
    ]);
    // privat (Index 0 in GEBIETE) kommt vor straf (Index 1), obwohl StGB
    // zuerst in der Eingabeliste steht.
    expect(g.map((x) => x.gebiet)).toEqual(['privat', 'straf']);
    expect(g.map((x) => x.label)).toEqual(['Privatrecht', 'Strafrecht']);
  });

  it('sortiert innerhalb eines Gebiets nach Rang, dann Kürzel (de-CH)', () => {
    const g = gruppiereNachRechtsgebiet([
      be({ key: 'ZGB', kuerzel: 'ZGB', rechtsgebiet: 'privat', rang: 5 }),
      be({ key: 'OR', kuerzel: 'OR', rechtsgebiet: 'privat', rang: 1 }),
    ]);
    expect(g[0].erlasse.map((e) => e.key)).toEqual(['OR', 'ZGB']);
  });

  it('leere Gebiete werden nicht gerendert (§8: keine leere Rubrik vortäuschen)', () => {
    const g = gruppiereNachRechtsgebiet([be({ key: 'OR', rechtsgebiet: 'privat' })]);
    expect(g).toHaveLength(1);
    expect(g[0].gebiet).toBe('privat');
  });

  it('vollständig: jeder Erlass landet in genau einer Gruppe', () => {
    const liste = [
      be({ key: 'OR', rechtsgebiet: 'privat' }),
      be({ key: 'STGB', rechtsgebiet: 'straf' }),
      be({ key: 'ZPO', rechtsgebiet: 'prozess' }),
    ];
    const g = gruppiereNachRechtsgebiet(liste);
    expect(g.reduce((n, x) => n + x.erlasse.length, 0)).toBe(liste.length);
  });

  // Gegenprüfungs-Hinweis 21.8.2026 (Code-Lupe J3): `GEBIETE.filter(map.has)`
  // droppt jeden Rechtsgebiet-Wert STILL, der nicht in GEBIETE deklariert ist —
  // und die `as Record`-Casts in register.ts hebeln den Compile-Schutz aus. Ein
  // künftiges 8. Union-Mitglied ohne GEBIETE-Eintrag verschwände stumm aus der
  // Übersicht (§8). Dieser Wächter macht den Fall laut: jeder Wert, der einem
  // Erlass zugewiesen werden kann, muss eine Rubrik bekommen.
  it('WÄCHTER: kein Rechtsgebiet-Wert fällt still aus der Übersicht', () => {
    const g = gruppiereNachRechtsgebiet([be({ rechtsgebiet: 'nicht-deklariert' as BrowseErlass['rechtsgebiet'] })]);
    expect(g.reduce((n, x) => n + x.erlasse.length, 0),
      'ein Erlass mit undeklariertem Rechtsgebiet verschwand still — GEBIETE nachziehen').toBe(1);
  });
});
