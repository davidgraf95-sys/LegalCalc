// ─── R8: Kanton-Kürzel-Aliase — Regelwerk + Gefahren-Klassen (31.8.2026) ─────
//
// Bewacht den Generator scripts/normtext/kanton-abk-aliase-generieren.ts und
// das committete Artefakt. Die zwei GEFAHREN-KLASSEN aus der R8-Diagnose:
//   1 «Bundes-Kürzel-Leck»: ein Klammer-Akronym am Ende eines titelartigen
//     Werts bezeichnet das referenzierte BUNDESrecht (AR-760.12 «… zur
//     schweizerischen Automobilkonzessionsverordnung (AKV)») — es darf NIE als
//     kantonales Alias auftauchen.
//   2 «Die Bürgschaft»: ein Bundes-Titel-Fragment als Klammer-Zusatz einer
//     Titel-Abschrift (AR-222.31) — ebenfalls nie ein Alias.
// Jede Prüfung wurde beim Bau einmal ROT gezeigt (Mutations-Probe, s. Bericht).
import { describe, expect, it } from 'vitest';
import {
  aliasAusKandidat,
  baueAliase,
  bundKollisionen,
  MAX_LAENGE,
} from '../../scripts/normtext/kanton-abk-aliase-generieren';
import { KANTON_ABK_ALIASE } from '../lib/normtext/kanton-abk-aliase.generated';
import { ERLASS_REGISTER } from '../lib/normtext/register';

// Echte Register-Kandidaten aus register.json — dieselbe Quelle wie der Generator.
import registerJson from '../../public/normtext/register.json';
interface RegErlass { key: string; ebene: string; kanton?: string | null; kuerzel: string; titel: string }
const ERLASSE = (registerJson as { erlasse: RegErlass[] }).erlasse;
const kantonErlasse = ERLASSE.filter((e) => e.ebene === 'kanton');

describe('aliasAusKandidat: die fünf Regeln (je mit echtem Beleg-Fall)', () => {
  it('R1 Titel-Kopie: kuerzel === titel → kein Alias', () => {
    const e = kantonErlasse.find((x) => x.kuerzel === x.titel);
    expect(e, 'Beleg-Klasse existiert im Register').toBeDefined();
    expect(aliasAusKandidat(e!.kuerzel, e!.titel)).toEqual({ abk: null, grund: 'titel-kopie' });
  });

  it('R1 läuft VOR R2: Titel-Kopie MIT Semikolon bleibt draussen (SG-2935)', () => {
    const e = kantonErlasse.find((x) => x.key === 'SG-2935');
    if (e) {
      expect(e.kuerzel).toBe(e.titel); // Vorbedingung der Klasse
      expect(aliasAusKandidat(e.kuerzel, e.titel)).toEqual({ abk: null, grund: 'titel-kopie' });
    }
    // synthetischer Kern der Klasse, unabhängig vom Registerbestand:
    expect(aliasAusKandidat('Langer Titel; Kzl', 'Langer Titel; Kzl'))
      .toEqual({ abk: null, grund: 'titel-kopie' });
  });

  it('R2 Semikolon-Split: «Langform; Kürzel» → Kürzel-Hälfte (AR-852.6 BeFiG)', () => {
    expect(aliasAusKandidat('Behindertenfinanzierungsgesetz; BeFiG', 'Gesetz über …'))
      .toEqual({ abk: 'BeFiG' });
  });

  it('R3 zu lang: Kurztitel über 30 Zeichen sind kein Kürzel', () => {
    expect(aliasAusKandidat('Vorläufige Verordnung zum Mietrecht', 'Vorläufige Verordnung zum Mietrecht (bGS 222.11)'))
      .toEqual({ abk: null, grund: 'zu-lang' });
    // Das längste echte Mehrwort-Kürzel des Bestands bleibt DRIN:
    expect(aliasAusKandidat('Abfallvereinbarung BS - BL', 'Vereinbarung …')).toEqual({ abk: 'Abfallvereinbarung BS - BL' });
    expect('Abfallvereinbarung BS - BL'.length).toBeLessThanOrEqual(MAX_LAENGE);
  });

  it('R4 Kleinwörter: Titelsyntax raus, EIN Kleinwort («EG zum ZGB») bleibt', () => {
    expect(aliasAusKandidat('Dekret über den Notariatstarif', 'Dekret …, x'))
      .toEqual({ abk: null, grund: 'kleinwoerter' });
    expect(aliasAusKandidat('EG zum ZGB', 'Einführungsgesetz …')).toEqual({ abk: 'EG zum ZGB' });
    expect(aliasAusKandidat('kant. BBV', 'Kantonale Berufsbildungsverordnung')).toEqual({ abk: 'kant. BBV' });
  });

  it('R5 zu kurz: leer/Einzelzeichen ist kein Alias', () => {
    expect(aliasAusKandidat('', 'Titel')).toEqual({ abk: null, grund: 'zu-kurz' });
    expect(aliasAusKandidat('X', 'Titel')).toEqual({ abk: null, grund: 'zu-kurz' });
  });
});

describe('Gefahren-Klasse 1: Bundes-Kürzel-Leck (Klammer-Akronym)', () => {
  it('AR-760.12: «AKV» (Bundes-VO) wird NICHT als kantonales Alias extrahiert', () => {
    const e = kantonErlasse.find((x) => x.key === 'AR-760.12');
    expect(e, 'Beleg-Erlass im Register').toBeDefined();
    expect(e!.kuerzel).toMatch(/\(AKV\)\s*$/); // die Falle ist real, kein Konstrukt
    const r = aliasAusKandidat(e!.kuerzel, e!.titel);
    expect(r.abk).toBeNull(); // titelartig → raus, KEINE Klammer-Extraktion
  });

  it('im Artefakt steht kein nacktes «AKV» und kein Klammer-Extrakt', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.abk === 'AKV')).toBeUndefined();
    // Kein Alias ist ein reines Klammer-Fragment seines Register-Kandidaten:
    const jeKey = new Map(kantonErlasse.map((e) => [e.key, e.kuerzel]));
    for (const z of KANTON_ABK_ALIASE) {
      const kandidat = jeKey.get(z.key) ?? '';
      const klammer = /\(([^)]+)\)\s*$/.exec(kandidat)?.[1]?.trim();
      if (klammer && klammer !== kandidat) {
        expect(z.abk, `${z.key}: Klammer-Fragment als Alias`).not.toBe(klammer);
      }
    }
  });

  it('Ebenen-Trennung: das Artefakt trägt AUSSCHLIESSLICH Kanton-Keys', () => {
    const bundKeys = new Set(ERLASS_REGISTER.filter((e) => e.ebene === 'bund').map((e) => e.key));
    const kantonKeys = new Set(kantonErlasse.map((e) => e.key));
    for (const z of KANTON_ABK_ALIASE) {
      expect(bundKeys.has(z.key), `${z.key} ist ein Bund-Key`).toBe(false);
      expect(kantonKeys.has(z.key), `${z.key} fehlt im Kanton-Register`).toBe(true);
    }
  });

  it('Bund↔Kanton-Kollisionen werden GEMELDET, nicht unterdrückt (StG-Fall)', () => {
    const bundRaum = new Map<string, string[]>([['STG', ['StG (SR 641.10, de)']]]);
    const koll = bundKollisionen([...KANTON_ABK_ALIASE], bundRaum);
    const stg = koll.find((k) => k.abk === 'StG');
    expect(stg, 'kantonales StG existiert und kollidiert legitim').toBeDefined();
    expect(stg!.kantonKeys.length).toBeGreaterThanOrEqual(2);
    // … und die kantonalen StG-Zeilen bleiben trotz Kollision im Artefakt:
    expect(KANTON_ABK_ALIASE.filter((z) => z.abk === 'StG').length).toBe(stg!.kantonKeys.length);
  });
});

describe('Gefahren-Klasse 2: «Die Bürgschaft» (Bundes-Titel-Fragment)', () => {
  it('AR-222.31: der Titel-Wert samt «(Die Bürgschaft)» wird ausgeschlossen', () => {
    const e = kantonErlasse.find((x) => x.key === 'AR-222.31');
    expect(e, 'Beleg-Erlass im Register').toBeDefined();
    expect(e!.kuerzel).toContain('(Die Bürgschaft)'); // die Falle ist real
    expect(aliasAusKandidat(e!.kuerzel, e!.titel).abk).toBeNull();
  });

  it('«Die Bürgschaft» ist in keinem Alias enthalten', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.abk.includes('Bürgschaft') && z.abk.includes('Die')))
      .toBeUndefined();
  });
});

describe('Artefakt-Invarianten (Drift + Determinismus)', () => {
  it('Artefakt == frische Ableitung aus register.json (Drift-Tor in-process)', () => {
    const { zeilen } = baueAliase(ERLASSE);
    expect(KANTON_ABK_ALIASE.length).toBe(zeilen.length);
    expect([...KANTON_ABK_ALIASE]).toEqual(zeilen);
  });

  it('deterministisch sortiert (abk, key) und je Key höchstens EIN Alias', () => {
    const keys = new Set<string>();
    for (const z of KANTON_ABK_ALIASE) {
      expect(keys.has(z.key), `Key ${z.key} doppelt`).toBe(false);
      keys.add(z.key);
    }
  });

  it('jeder Alias ist im amtlichen erlass-String seines Snapshots belegt (Wortpräsenz)', () => {
    // Der register.json-kuerzel ist die Projektion des Snapshot-erlass-Strings;
    // jedes Alias muss darin wörtlich vorkommen — nichts ist erfunden (§7).
    const jeKey = new Map(kantonErlasse.map((e) => [e.key, e.kuerzel]));
    for (const z of KANTON_ABK_ALIASE) {
      expect(jeKey.get(z.key) ?? '', `${z.key}: Alias nicht im Register-Wert`).toContain(z.abk);
    }
  });
});
