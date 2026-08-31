// ─── R8: Kanton-Kürzel-Aliase — Regelwerk + Gefahren-Klassen ─────────────────
//
// Bewacht den Generator scripts/normtext/kanton-abk-aliase-generieren.ts und
// das committete Artefakt. Seit R8.3 (Wurzel-Fix F8, 1.9.2026) ist die Quelle
// das ROHE Registerfeld `abkRoh` (Projektion des Sidecars kanton-abk-roh.json)
// — R1 (Titel-Kopie) ist gestorben, die frühere Lücke (No-Comma-Zweig ⇒ 43
// live-belegte Titel-Aliase) ist strukturell zu. Die zwei GEFAHREN-KLASSEN der
// R8-Diagnose bleiben bewacht:
//   1 «Bundes-Kürzel-Leck»: ein Klammer-Akronym am Ende eines titelartigen
//     Werts bezeichnet das referenzierte BUNDESrecht (AR-760.12 «… (AKV)») —
//     es darf NIE als kantonales Alias auftauchen.
//   2 «Die Bürgschaft»: ein Bundes-Titel-Fragment als Klammer-Zusatz einer
//     Titel-Abschrift (AR-222.31) — ebenfalls nie ein Alias.
// Jede neue Prüfung wurde beim Bau einmal ROT gezeigt (Mutations-Probe).
import { describe, expect, it } from 'vitest';
import { baueAliase, bundKollisionen } from '../../scripts/normtext/kanton-abk-aliase-generieren';
import { aliasAusRoh, MAX_LAENGE } from '../../scripts/normtext/kanton-abk-regeln';
import { KANTON_ABK_ALIASE } from '../lib/normtext/kanton-abk-aliase.generated';
import { ERLASS_REGISTER } from '../lib/normtext/register';

// Echte Register-Kandidaten aus register.json — dieselbe Quelle wie der Generator.
import registerJson from '../../public/normtext/register.json';
// Das Rohfeld-Sidecar — für die F8-Fixtures (api-belegte Leerwerte).
import abkRohJson from '../../public/normtext/kanton-abk-roh.json';
interface RegErlass { key: string; ebene: string; kanton?: string | null; kuerzel: string; titel: string; abkRoh?: string }
const ERLASSE = (registerJson as { erlasse: RegErlass[] }).erlasse;
const kantonErlasse = ERLASSE.filter((e) => e.ebene === 'kanton');
const ABK_ROH = abkRohJson as Record<string, { abk: string; herkunft: string; stand: string; quelleUrl?: string }>;

describe('aliasAusRoh: die Regeln R2–R7 (je mit amtlich belegtem Fall)', () => {
  it('leeres/fehlendes Rohfeld → kein Alias (F8-Kern)', () => {
    expect(aliasAusRoh('')).toEqual({ abk: null, grund: 'kein-amtliches-kuerzel' });
    expect(aliasAusRoh('   ')).toEqual({ abk: null, grund: 'kein-amtliches-kuerzel' });
  });

  it('R2 Semikolon: «Langform; Kürzel» → Kürzel-Hälfte (AR-852.6, api-belegt)', () => {
    expect(aliasAusRoh('Behindertenfinanzierungsgesetz; BeFiG')).toEqual({ abk: 'BeFiG' });
  });

  it('R2 Komma (BS/BE-Konvention, live 1.9.2026): «Kurztitel, Kürzel» → Kürzel-Hälfte', () => {
    // Verbatim-Rohwerte der APIs (quelleUrl im Sidecar):
    expect(aliasAusRoh('Gerichtsorganisationsgesetz, GOG')).toEqual({ abk: 'GOG' });           // BS-154.100
    expect(aliasAusRoh('Parteikostenverordnung, PKV')).toEqual({ abk: 'PKV' });                // BE-168.811
    expect(aliasAusRoh('Kinder- und Jugendkommissionsverordnung , KJKV')).toEqual({ abk: 'KJKV' }); // BS-415.150 (Doppel-Space amtlich)
  });

  it('R2 Komma ist fragment-bewacht: Titel-Binnenkomma wird kein Satzfragment-Alias', () => {
    // Tail «Basel-Landschaft und Aargau» ist ein Fragment (T2/S2) → kein Split,
    // Vollwert fällt an R3 (zu lang) — fail-closed statt Fragment-Alias.
    const r = aliasAusRoh('Vereinbarung zwischen Basel-Stadt, Basel-Landschaft und Aargau');
    expect(r.abk).toBeNull();
  });

  it('R3 zu lang: Kurztitel über 30 Zeichen sind kein Kürzel', () => {
    expect(aliasAusRoh('Vorläufige Verordnung zum Mietrecht'))
      .toEqual({ abk: null, grund: 'zu-lang' });
    // Das längste echte Mehrwort-Kürzel des Bestands bleibt DRIN:
    expect(aliasAusRoh('Abfallvereinbarung BS - BL')).toEqual({ abk: 'Abfallvereinbarung BS - BL' });
    expect('Abfallvereinbarung BS - BL'.length).toBeLessThanOrEqual(MAX_LAENGE);
  });

  it('R4 Kleinwörter: Titelsyntax raus, EIN Kleinwort («EG zum ZGB») bleibt', () => {
    expect(aliasAusRoh('Dekret über den Notariatstarif'))
      .toEqual({ abk: null, grund: 'kleinwoerter' });
    expect(aliasAusRoh('EG zum ZGB')).toEqual({ abk: 'EG zum ZGB' });
    expect(aliasAusRoh('kant. BBV')).toEqual({ abk: 'kant. BBV' });
  });

  it('R5 zu kurz: Einzelzeichen ist kein Alias', () => {
    expect(aliasAusRoh('X')).toEqual({ abk: null, grund: 'zu-kurz' });
  });

  it('R6 Klammer: ein Wert mit Klammer ist kein zitierfähiges Kürzel (GP F1/F2)', () => {
    expect(aliasAusRoh('Gerichtskostenverordnung (GKV)')).toEqual({ abk: null, grund: 'klammer' });
    expect(aliasAusRoh('Gebührenordnung (GebO)')).toEqual({ abk: null, grund: 'klammer' });
  });

  it('R7 Kantonskürzel: «TG» kapert die Kantonssuche → raus (GP F5)', () => {
    expect(aliasAusRoh('TG')).toEqual({ abk: null, grund: 'kantonskuerzel' });
    expect(aliasAusRoh('TV')).toEqual({ abk: 'TV' });
    expect(aliasAusRoh('AnwT')).toEqual({ abk: 'AnwT' });
  });
});

// ─── F8-Fixtures (GP2, live belegt 1.9.2026): amtlich abbreviation='' ────────
// Acht Erlasse, deren abbreviation-Feld die API LEER liefert (Sidecar-Eintrag
// herkunft 'api', quelleUrl https://<host>/api/de/texts_of_law/<nr>, Stand
// 2026-09-01). Sie waren vor R8.3 Titel-Aliase («Advokaturgesetz» usw.) und
// dürfen NIE wieder Alias werden. Läuft ein künftiger Roh-Neuzug (G2) auf einen
// geänderten amtlichen Wert, wird dieser Fixture-Satz BEWUSST nachgeführt —
// nie still (Belege altern nicht, F8-Skill-Lehre).
const F8_FIXTURES = [
  'BS-291.100', // Advokaturgesetz
  'BS-410.100', // Schulgesetz
  'AR-421.10',  // Archivgesetz
  'SH-211.433', // (einziger SH-Fall)
  'BS-786.100', // Abfallverordnung
  'BS-154.112', //
  'AR-145.31',  // Justizgesetz
  'AR-151.11',  // Gemeindegesetz
];

describe('F8-Fixtures: live-belegte Leerwerte werden NIE wieder Alias', () => {
  it('Sidecar führt sie api-belegt LEER; Register trägt kein abkRoh', () => {
    for (const key of F8_FIXTURES) {
      const s = ABK_ROH[key];
      expect(s, `${key} fehlt im Sidecar`).toBeDefined();
      expect(s.abk, `${key}: amtlich leer (Stand ${s.stand})`).toBe('');
      expect(s.herkunft, `${key}: api-belegt`).toBe('api');
      const e = kantonErlasse.find((x) => x.key === key);
      expect(e?.abkRoh, `${key}: register.abkRoh muss fehlen`).toBeUndefined();
    }
  });

  it('keiner der acht steht im Artefakt', () => {
    for (const key of F8_FIXTURES) {
      expect(KANTON_ABK_ALIASE.find((z) => z.key === key), `${key} darf kein Alias tragen`).toBeUndefined();
    }
  });

  it('Titel-Wörter der drei GP-Livebelege zeigen nie auf deren Keys', () => {
    // NICHT pauschal «Wort existiert nirgends»: BS-153.600 trägt «Archivgesetz»
    // amtlich IM abbreviation-Feld (Kurztitel-Konvention, Split-belegt) — das
    // ist legitim. Verboten ist nur der F8-Weg: Titel-Alias auf einem Key,
    // dessen abbreviation leer ist.
    for (const [abk, key] of [['Advokaturgesetz', 'BS-291.100'], ['Schulgesetz', 'BS-410.100'], ['Archivgesetz', 'AR-421.10']] as const) {
      expect(KANTON_ABK_ALIASE.find((z) => z.abk === abk && z.key === key)).toBeUndefined();
    }
  });
});

describe('belegte echte Kürzel BLEIBEN (GP-Gegenbelege)', () => {
  it.each([
    ['EG zum KVG', 'AR-833.14'],
    ['TZV', 'AR-920.14'],
    ['ABRG', 'AR-621.12'],
    ['GebT ZGB', 'GL-III%20B_7_1'],
    ['GOG', 'BS-154.100'],   // aus Roh «Gerichtsorganisationsgesetz, GOG» (R2 Komma)
    ['BeFiG', 'AR-852.6'],   // aus Roh «Behindertenfinanzierungsgesetz; BeFiG» (R2 Semikolon)
  ])('%s (%s) steht im Artefakt', (abk, key) => {
    expect(KANTON_ABK_ALIASE.find((z) => z.abk === abk && z.key === key)).toBeDefined();
  });

  it('Kürzel-Korrektur BS-292.110: live «Notariatsverordnung, NotV» ⇒ Alias NotV, nie mehr NoVo', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.key === 'BS-292.110')?.abk).toBe('NotV');
    expect(KANTON_ABK_ALIASE.find((z) => z.abk === 'NoVo')).toBeUndefined();
  });
});

describe('Gefahren-Klasse 1: Bundes-Kürzel-Leck (Klammer-Akronym)', () => {
  it('AR-760.12: «AKV» (Bundes-VO) ist kein kantonales Alias; kein Alias trägt eine Klammer', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.abk === 'AKV')).toBeUndefined();
    expect(KANTON_ABK_ALIASE.find((z) => z.key === 'AR-760.12')).toBeUndefined();
    for (const z of KANTON_ABK_ALIASE) {
      expect(z.abk.includes('(') || z.abk.includes(')'), `${z.key}: Klammer im Alias`).toBe(false);
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
    expect(KANTON_ABK_ALIASE.filter((z) => z.abk === 'StG').length).toBe(stg!.kantonKeys.length);
  });
});

describe('Gefahren-Klasse 2: «Die Bürgschaft» (Bundes-Titel-Fragment)', () => {
  it('AR-222.31 trägt kein Alias; «Die Bürgschaft» ist in keinem Alias enthalten', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.key === 'AR-222.31')).toBeUndefined();
    expect(KANTON_ABK_ALIASE.find((z) => z.abk.includes('Bürgschaft') && z.abk.includes('Die')))
      .toBeUndefined();
  });
});

// R8.2 (GP F5): die 26 Kantonskürzel — bewusst lokale Kopie (wie
// src/lib/permalink.ts), damit der Test die Generator-Konstante GEGENprüft
// statt sie zu importieren (kein Selbstbeweis).
const KANTONSKUERZEL_26 = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);

describe('R6/R7 auf dem Bestand: PDF-Pipeline-Namen und Kantonskürzel bleiben draussen', () => {
  it('SG-2808/SZ-173.111 (handgepflegte Zitat-Namen, kein API-abbreviation) tragen kein Alias', () => {
    for (const key of ['SG-2808', 'SZ-173.111']) {
      expect(KANTON_ABK_ALIASE.find((z) => z.key === key), key).toBeUndefined();
    }
  });

  it('AR-955.21 («TG») trägt kein Alias; kein Alias entspricht einem der 26 Kürzel', () => {
    expect(KANTON_ABK_ALIASE.find((z) => z.key === 'AR-955.21')).toBeUndefined();
    for (const z of KANTON_ABK_ALIASE) {
      expect(KANTONSKUERZEL_26.has(z.abk.toUpperCase()), `${z.key}: «${z.abk}» ist ein Kantonskürzel`).toBe(false);
    }
  });
});

describe('Artefakt-Invarianten (Drift + Determinismus + §7-Provenienz)', () => {
  it('Artefakt == frische Ableitung aus register.json (Drift-Tor in-process)', () => {
    const { zeilen } = baueAliase(ERLASSE);
    expect(KANTON_ABK_ALIASE.length).toBe(zeilen.length);
    expect([...KANTON_ABK_ALIASE]).toEqual(zeilen);
  });

  it('deterministisch sortiert und je Key höchstens EIN Alias', () => {
    const keys = new Set<string>();
    for (const z of KANTON_ABK_ALIASE) {
      expect(keys.has(z.key), `Key ${z.key} doppelt`).toBe(false);
      keys.add(z.key);
    }
  });

  it('jeder Alias steht wörtlich im ROHEN amtlichen Wert seines Keys (§7, nichts erfunden)', () => {
    const jeKey = new Map(kantonErlasse.map((e) => [e.key, e.abkRoh ?? '']));
    for (const z of KANTON_ABK_ALIASE) {
      const roh = jeKey.get(z.key) ?? '';
      expect(roh, `${z.key}: Alias ohne Register-abkRoh`).not.toBe('');
      expect(roh, `${z.key}: Alias nicht im Rohwert`).toContain(z.abk);
    }
  });

  it('register.abkRoh ist exakt die Nicht-Leer-Projektion des Sidecars (§5)', () => {
    for (const e of kantonErlasse) {
      const s = ABK_ROH[e.key];
      expect(s, `${e.key} fehlt im Sidecar`).toBeDefined();
      if (s.abk === '') expect(e.abkRoh, `${e.key}: leer ⇒ kein Feld`).toBeUndefined();
      else expect(e.abkRoh, `${e.key}: Projektion driftet`).toBe(s.abk);
    }
  });
});
