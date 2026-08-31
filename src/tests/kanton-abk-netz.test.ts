// ─── R8.3: Live-Sample-Wächter check:kanton-abk-netz — Rot-Beweis per Stub ───
//
// Das Register ist eine zweite Ableitung; ein Offline-Tor kann F8-artigen
// Drift gegen die Amtsquelle strukturell nie sehen (GP2-Empfehlung). Diese
// Tests beweisen: (1) der Wächter SCHLÄGT AN, wenn das live gelesene
// abbreviation-Feld vom Sidecar-Wert abweicht (Stub statt Netz, §6.7 einmal
// rot gezeigt), (2) die Rotation ist deterministisch und wandert, (3) Fetch-
// Fehler werden nie zu stillem Grün (§8).
import { describe, expect, it } from 'vitest';
import {
  baueKandidaten,
  pruefeStichprobe,
  rotierendeStichprobe,
  tagesIndex,
  type NetzKandidat,
} from '../../scripts/normtext/check-kanton-abk-netz';
import type { AbkRohMap } from '../../scripts/normtext/kanton-abk-roh';

const SIDECAR: AbkRohMap = {
  'AR-920.14': { abk: 'TZV', herkunft: 'api', stand: '2026-09-01', quelleUrl: 'https://ar.clex.ch/api/de/texts_of_law/920.14' },
  'BS-291.100': { abk: '', herkunft: 'api', stand: '2026-09-01', quelleUrl: 'https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/291.100' },
  'BE-161.12': { abk: 'VKD', herkunft: 'rueckrechnung', stand: '2026-06-23' },
  'AR-122.1': { abk: '', herkunft: 'rueckrechnung', stand: '2026-06-23' }, // keine Behauptung → nie Kandidat
};
const URLS = new Map([['BE-161.12', 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12']]);

describe('baueKandidaten: nur Einträge mit Behauptung, Quelle auflösbar', () => {
  it('api (auch leer) und rueckrechnung≠leer sind Kandidaten; rueckrechnung-leer nicht', () => {
    const { kandidaten, unaufloesbar } = baueKandidaten(SIDECAR, URLS);
    expect(kandidaten.map((k) => k.key)).toEqual(['AR-920.14', 'BE-161.12', 'BS-291.100']);
    expect(unaufloesbar).toEqual([]);
    expect(kandidaten.find((k) => k.key === 'BE-161.12')).toMatchObject({ host: 'www.belex.sites.be.ch', lang: 'de', lawId: '161.12' });
  });

  it('nicht auflösbare Quellen fallen SICHTBAR raus, nie still', () => {
    const { kandidaten, unaufloesbar } = baueKandidaten(
      { 'ZH-x': { abk: 'XG', herkunft: 'rueckrechnung', stand: '2026-06-23' } },
      new Map([['ZH-x', 'https://www.zh.ch/irgendwo']]),
    );
    expect(kandidaten).toEqual([]);
    expect(unaufloesbar).toEqual(['ZH-x']);
  });
});

describe('rotierendeStichprobe: deterministisch, wandernd, vollständig', () => {
  const keys = Array.from({ length: 103 }, (_, i) => `K-${String(i).padStart(3, '0')}`);

  it('gleiches Datum ⇒ identische Auswahl (§2)', () => {
    expect(rotierendeStichprobe(keys, '2026-09-01')).toEqual(rotierendeStichprobe(keys, '2026-09-01'));
    expect(rotierendeStichprobe(keys, '2026-09-01', 5)).toHaveLength(5);
  });

  it('Folgetag ⇒ Fenster um n verschoben (Rotation, mit Umbruch)', () => {
    const heute = rotierendeStichprobe(keys, '2026-09-01', 5);
    const morgen = rotierendeStichprobe(keys, '2026-09-02', 5);
    expect(tagesIndex('2026-09-02')).toBe(tagesIndex('2026-09-01') + 1);
    expect(morgen).not.toEqual(heute);
    const start = (tagesIndex('2026-09-01') * 5) % keys.length;
    expect(heute[0]).toBe(keys[start]);
  });

  it('kleiner Bestand ⇒ Vollprüfung statt Fenster', () => {
    expect(rotierendeStichprobe(['a', 'b'], '2026-09-01', 20)).toEqual(['a', 'b']);
  });
});

describe('pruefeStichprobe: Rot-Beweis per Stub (§6.7)', () => {
  const probe: NetzKandidat[] = [
    { key: 'AR-920.14', abk: 'TZV', host: 'ar.clex.ch', lang: 'de', lawId: '920.14' },
    { key: 'BS-291.100', abk: '', host: 'www.gesetzessammlung.bs.ch', lang: 'de', lawId: '291.100' },
  ];

  it('ROT: live abweichendes abbreviation-Feld wird als Drift gemeldet', async () => {
    // Stub: die Quelle liefert für AR-920.14 nicht mehr «TZV», und für den
    // amtlich-leeren BS-291.100 plötzlich einen Wert — beides muss anschlagen.
    const { mismatches, fetchFehler } = await pruefeStichprobe(probe, async (_h, _l, lawId) => (
      { meta: { abkuerzung: lawId === '920.14' ? 'TZV neu' : 'Advokaturgesetz' } }
    ));
    expect(fetchFehler).toEqual([]);
    expect(mismatches).toEqual([
      { key: 'AR-920.14', erwartet: 'TZV', live: 'TZV neu', quelle: 'https://ar.clex.ch/api/de/texts_of_law/920.14' },
      { key: 'BS-291.100', erwartet: '', live: 'Advokaturgesetz', quelle: 'https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/291.100' },
    ]);
  });

  it('GRÜN nur bei byte-genauer Identität (keine Normalisierung)', async () => {
    const { mismatches } = await pruefeStichprobe(probe, async (_h, _l, lawId) => (
      { meta: { abkuerzung: lawId === '920.14' ? 'TZV' : '' } }
    ));
    expect(mismatches).toEqual([]);
    // Substring/Case genügt NICHT:
    const { mismatches: m2 } = await pruefeStichprobe(
      [probe[0]],
      async () => ({ meta: { abkuerzung: 'tzv' } }),
    );
    expect(m2).toHaveLength(1);
  });

  it('Fetch-Fehler wird gemeldet, nie stilles Grün (§8, Soft-404-Klasse)', async () => {
    const { mismatches, fetchFehler } = await pruefeStichprobe([probe[0]], async () => {
      throw new Error('Content-Type "text/html" statt application/json');
    });
    expect(mismatches).toEqual([]);
    expect(fetchFehler).toHaveLength(1);
    expect(fetchFehler[0]).toContain('AR-920.14');
  });
});
