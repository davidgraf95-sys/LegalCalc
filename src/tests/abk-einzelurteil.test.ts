/**
 * Tests für das Einzel-SR-Urteilsmittel des abk-Tors (Regel 5, Nachtrag 31.8.2026).
 *
 * ANLASS: `check:fedlex-abk-netz` rot in zwei Monitor-Läufen (33339658668,
 * 33340145194) — SR 812.121.1 lieferte im Hauptlauf deterministisch keine Zeile, und
 * die Verlust-Gegenprobe fiel in ihren Regel-(4)-Pfad («kein Urteil», Exit 1),
 * obwohl der geltende Abstract cc/2011/362 mit `BetmKV`/`OCStup` am Endpoint steht.
 *
 * ZWEI EBENEN, damit das Tor nicht gegen die eigene Ladung prüft (§6.7):
 *  (A) EINHEIT — das clientseitige Currency-Fenster (`imCurrencyFenster`,
 *      `einzelZeilen`) gegen seine vier Fälle.
 *  (B) WIRKUNG — der ECHTE Prüf-Lauf (`main()` mit `--check`), Endpoint gemockt.
 *      Beide Richtungen: ohne verwertbares Einzel-Resultat bleibt dieselbe SR ROT
 *      im bestehenden «KEIN URTEIL»-Pfad (fail-closed unangetastet), mit
 *      verwertbarem Resultat wird sie grün entschieden. Ein Einzelurteil, das nur
 *      als Unit-Test existiert, bewiese nicht, dass es im Tor verdrahtet ist.
 */

import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { SparqlBinding } from '../../scripts/fedlex-sparql.ts';
import {
  imCurrencyFenster,
  einzelZeilen,
  type AliasZeile,
} from '../../scripts/normtext/abk-einzelurteil.ts';

/** Die SR, an der die Monitor-Läufe hingen — hier als simuliert gekappte SR. */
const GEKAPPT = '812.121.1';
const HEUTE = new Date().toISOString().slice(0, 10);
const CODE: Record<'de' | 'fr' | 'it', string> = { de: 'DEU', fr: 'FRA', it: 'ITA' };

/** Wirft statt zu beenden — ein Konflikt darf im Test die Suite nicht killen. */
const wirf = (m: string): never => { throw new Error(m); };

function binding(z: AliasZeile, von?: string, bis?: string): SparqlBinding {
  const b: SparqlBinding = {
    sr: { value: z.sr },
    sprache: { value: CODE[z.sprache] },
    abk: { value: z.abk },
    cc: { value: `https://fedlex.data.admin.ch/eli/cc/${z.sr}` },
  };
  if (von) b.von = { value: von };
  if (bis) b.bis = { value: bis };
  return b;
}

// ── (A) Currency-Fenster ────────────────────────────────────────────────────

describe('imCurrencyFenster — Regel-2-Semantik clientseitig', () => {
  it('in Kraft: von in der Vergangenheit, kein bis', () => {
    expect(imCurrencyFenster(['2011-05-25'], [], '2026-08-31')).toBe(true);
  });

  it('abgelöst: bis in der VERGANGENHEIT schliesst aus', () => {
    expect(imCurrencyFenster(['2011-05-25'], ['2020-01-01'], '2026-08-31')).toBe(false);
  });

  it('bis in der ZUKUNFT lässt durch (gilt am Stichtag noch)', () => {
    expect(imCurrencyFenster(['2011-05-25'], ['2999-01-01'], '2026-08-31')).toBe(true);
  });

  it('bis FEHLT ganz: unbefristet in Kraft', () => {
    expect(imCurrencyFenster(['1955-04-21'], [], '2026-08-31')).toBe(true);
  });

  it('von fehlt oder liegt in der Zukunft: kein Urteil, nicht «gilt» (fail-closed)', () => {
    expect(imCurrencyFenster([], [], '2026-08-31')).toBe(false);
    expect(imCurrencyFenster(['2027-01-01'], [], '2026-08-31')).toBe(false);
    expect(imCurrencyFenster(['kaputt'], [], '2026-08-31')).toBe(false);
  });

  it('von am Stichtag selbst zählt (<=, wie der SPARQL-FILTER)', () => {
    expect(imCurrencyFenster(['2026-08-31'], [], '2026-08-31')).toBe(true);
    expect(imCurrencyFenster(['2011-05-25'], ['2026-08-31'], '2026-08-31')).toBe(false);
  });

  it('MENGEN-Semantik: ein vergangenes bis unter mehreren schliesst den Abstract aus', () => {
    // Zeilenweise geprüft wäre die künftige Zeile «gültig» — genau der Fehler,
    // den die SPARQL-Fassung über FILTER NOT EXISTS ausschliesst.
    expect(imCurrencyFenster(['2011-05-25'], ['2999-01-01', '2020-01-01'], '2026-08-31')).toBe(false);
  });
});

describe('einzelZeilen — Fensterung der Einzelabfrage-Bindings', () => {
  const zeile: AliasZeile = { sr: GEKAPPT, sprache: 'de', abk: 'BetmKV' };

  it('nimmt die Zeile des geltenden Abstracts', () => {
    expect(einzelZeilen([binding(zeile, '2011-05-25')], GEKAPPT, HEUTE, wirf)).toEqual([zeile]);
  });

  it('verwirft den Schatten-Abstract (bis in der Vergangenheit)', () => {
    expect(einzelZeilen([binding(zeile, '1975-01-01', '2011-05-24')], GEKAPPT, HEUTE, wirf)).toEqual([]);
  });

  it('trennt zwei Abstracts derselben SR je cc', () => {
    const alt = { ...binding({ sr: GEKAPPT, sprache: 'de', abk: 'BetmV alt' }, '1975-01-01', '2011-05-24') };
    alt.cc = { value: 'https://fedlex.data.admin.ch/eli/cc/1975/alt' };
    const zeilen = einzelZeilen([alt, binding(zeile, '2011-05-25')], GEKAPPT, HEUTE, wirf);
    expect(zeilen).toEqual([zeile]);
  });

  it('Fremd-SR aus derselben Antwort zählen nicht', () => {
    const fremd = binding({ sr: '220', sprache: 'de', abk: 'OR' }, '1912-01-01');
    expect(einzelZeilen([fremd, binding(zeile, '2011-05-25')], GEKAPPT, HEUTE, wirf)).toEqual([zeile]);
  });

  it('zwei Kürzel je (sr, sprache) werden NICHT getiebreakt (§8)', () => {
    const zweit = binding({ sr: GEKAPPT, sprache: 'de', abk: 'OCStup-DE' }, '2011-05-25');
    zweit.cc = { value: 'https://fedlex.data.admin.ch/eli/cc/2011/zweit' };
    expect(() => einzelZeilen([binding(zeile, '2011-05-25'), zweit], GEKAPPT, HEUTE, wirf))
      .toThrow(/zwei .*amtliche Kürzel|NICHT automatisch entschieden/s);
  });
});

// ── (B) Wirkung: der echte --check-Lauf, Endpoint gemockt ───────────────────

/** Steuert, was die EINZELabfrage (ohne Datums-FILTER) für die gekappte SR liefert. */
const steuer = vi.hoisted(() => ({ einzel: [] as SparqlBinding[] }));

vi.mock('../../scripts/fedlex-sparql.ts', async (echt) => {
  const orig = await echt<typeof import('../../scripts/fedlex-sparql.ts')>();
  return { ...orig, sparqlSelect: async (q: string) => antwortAuf(q) };
});

/** Die committeten Alias-Zeilen — Prüfling UND Vorlage der simulierten Live-Antwort. */
function artefaktZeilen(): AliasZeile[] {
  const roh = readFileSync('src/lib/normtext/abk-aliase.generated.ts', 'utf8');
  const zeilen: AliasZeile[] = [];
  for (const z of roh.split('\n')) {
    const m = /^ {2}\{ sr: "([^"]+)", sprache: '(de|fr|it)', abk: ("(?:[^"\\]|\\.)*") \},$/.exec(z);
    if (m) zeilen.push({ sr: m[1], sprache: m[2] as 'de' | 'fr' | 'it', abk: JSON.parse(m[3]) as string });
  }
  return zeilen;
}
const ARTEFAKT = artefaktZeilen();

/**
 * Der gemockte Endpoint. Hauptlauf-Abfragen liefern das Artefakt zurück — MINUS
 * jeder Zeile der gekappten SR: exakt das Bild der zwei roten Monitor-Läufe
 * (HTTP 200, COUNT == Zeilenzahl, eine SR still weg). Einzelabfragen (erkennbar am
 * OPTIONAL statt Datums-FILTER) liefern, was der jeweilige Fall vorgibt.
 */
function antwortAuf(q: string): SparqlBinding[] {
  const srs = new Set([...q.matchAll(/"([0-9][0-9.]*)"\^\^/g)].map((m) => m[1]));
  const einzel = q.includes('OPTIONAL {');
  const zeilen = einzel
    ? steuer.einzel.filter((b) => srs.has(b.sr?.value ?? ''))
    : ARTEFAKT.filter((z) => srs.has(z.sr) && z.sr !== GEKAPPT).map((z) => binding(z));
  return q.includes('COUNT(*)') ? [{ n: { value: String(zeilen.length) } }] : zeilen;
}

class Beendet extends Error { constructor(public code: number) { super(`exit ${code}`); } }

const argvVorher = process.argv;
process.argv = ['node', 'abk-aliase-generieren.ts', '--check'];
const lauf = await import('../../scripts/normtext/abk-aliase-generieren.ts');
afterAll(() => { process.argv = argvVorher; });

/** Fährt `main()` einmal und gibt Exit-Code plus die volle Ausgabe zurück. */
async function pruefLauf(): Promise<{ code: number; text: string }> {
  const teile: string[] = [];
  const sammle = (...a: unknown[]): void => { teile.push(a.map(String).join(' ')); };
  const log = vi.spyOn(console, 'log').mockImplementation(sammle);
  const err = vi.spyOn(console, 'error').mockImplementation(sammle);
  const exit = vi.spyOn(process, 'exit').mockImplementation(((c?: number) => {
    throw new Beendet(c ?? 0);
  }) as never);
  let code = -1;
  try {
    await lauf.main();
  } catch (e) {
    if (!(e instanceof Beendet)) throw e;
    code = e.code;
  } finally {
    log.mockRestore();
    err.mockRestore();
    exit.mockRestore();
  }
  return { code, text: teile.join('\n') };
}

describe('check:fedlex-abk-netz — Einzelurteil im echten Prüf-Lauf', () => {
  beforeEach(() => { steuer.einzel = []; });

  it('ROT: ohne verwertbares Einzel-Resultat bleibt der KEIN-URTEIL-Pfad bestehen', async () => {
    const { code, text } = await pruefLauf();
    expect(text).toContain('Einzelabfrage ohne Datums-FILTER');
    expect(text).toContain(`Einzelabfrage SR ${GEKAPPT}: 0 Zeilen im Currency-Fenster (Anlauf 3/3)`);
    expect(text).toContain('KEIN URTEIL MÖGLICH für 1 SR');
    expect(text).toContain(`SR ${GEKAPPT}: Artefakt führt`);
    expect(text).not.toContain('per Einzelabfrage entschieden');
    expect(code).toBe(1);
  });

  it('ROT: Einzel-Resultat NUR aus abgelösten Abstracts entscheidet nichts (Fenster greift)', async () => {
    steuer.einzel = ARTEFAKT.filter((z) => z.sr === GEKAPPT)
      .map((z) => binding(z, '1975-01-01', '2011-05-24'));
    const { code, text } = await pruefLauf();
    expect(text).toContain('KEIN URTEIL MÖGLICH für 1 SR');
    expect(code).toBe(1);
  });

  it('GRÜN: dieselbe SR wird per Einzelabfrage entschieden', async () => {
    steuer.einzel = ARTEFAKT.filter((z) => z.sr === GEKAPPT).map((z) => binding(z, '2011-05-25'));
    const { code, text } = await pruefLauf();
    expect(text).toContain(`SR ${GEKAPPT}: Kappung im Hauptlauf, per Einzelabfrage entschieden`);
    expect(text).toContain("de 'BetmKV'");
    expect(text).toContain('OK — Artefakt deckungsgleich mit der Amtsquelle');
    expect(text).not.toContain('KEIN URTEIL MÖGLICH');
    expect(code).toBe(0);
  });

  it('GRÜN: bis in der Zukunft gilt am Stichtag noch', async () => {
    steuer.einzel = ARTEFAKT.filter((z) => z.sr === GEKAPPT)
      .map((z) => binding(z, '2011-05-25', '2999-01-01'));
    const { code } = await pruefLauf();
    expect(code).toBe(0);
  });

  it('DRIFT: weicht das Einzel-Resultat ab, läuft es durch die normale Drift-Behandlung', async () => {
    steuer.einzel = ARTEFAKT.filter((z) => z.sr === GEKAPPT)
      .map((z) => binding({ ...z, abk: `${z.abk}-NEU` }, '2011-05-25'));
    const { code, text } = await pruefLauf();
    expect(text).toContain('per Einzelabfrage entschieden');
    expect(text).toContain('DRIFT gegen die amtliche Quelle');
    expect(text).toContain(`SR ${GEKAPPT} / de: Artefakt 'BetmKV' → Fedlex 'BetmKV-NEU'`);
    expect(code).toBe(1);
  });
});
