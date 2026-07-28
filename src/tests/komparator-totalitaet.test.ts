import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  vergleicheEntscheidRefs, vergleicheLeitfaelle, schreibeKorpus,
} from '../../scripts/normtext/entscheide-schreiben';
import type { EntscheidRef, LeitfallRef, NormEntscheidIndex } from '../lib/rechtsprechung/norm-index';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

// ─────────────────────────────────────────────────────────────────────────────
// W2·6-NKEY Linse 4 — Totalität der Rechtsprechungs-Ordnungen (§2).
//
// Der proNorm-Komparator trug einen Datums-Term `(a.datum < b.datum ? 1 : -1)`.
// Bei Datums-Gleichstand ist das für BEIDE Richtungen −1: `cmp(x,y) === cmp(y,x)`.
// Zwei Folgen davon, beide hier festgenagelt:
//   1. der key-Tiebreaker dahinter war TOTER CODE (die `||`-Kette bricht bei −1 ab);
//   2. das Ergebnis hing an der Eingabefolge — genau die Build-Pfad-Abhängigkeit,
//      die der Tiebreaker ausschliessen sollte.
// Diese Tests scheitern gegen die alte Form (verifiziert vor dem Fix) und gelten
// für BEIDE Ordnungen — `vergleicheLeitfaelle` trug die richtige Form schon und
// wird hier mitgeprüft, damit sie es bleibt.
// ─────────────────────────────────────────────────────────────────────────────

function ref(o: Partial<EntscheidRef> & Pick<EntscheidRef, 'key'>): EntscheidRef {
  return {
    zitierung: o.key, regesteKurz: null, datum: '2026-01-01',
    leitcharakter: 'routine', gericht: 'bge', kanton: 'CH', ...o,
  };
}
const lf = (o: Partial<LeitfallRef> & Pick<LeitfallRef, 'key'>): LeitfallRef =>
  ({ ...ref(o), gewicht: 0, ...o });

/** Alle geordneten Paare einer Menge (inkl. x mit sich selbst). */
function paare<T>(xs: T[]): [T, T][] {
  return xs.flatMap((a) => xs.map((b) => [a, b] as [T, T]));
}

/** Vorzeichen — nur darauf kommt es einem Komparator-Kontrakt an. */
const sgn = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);
/** Antisymmetrie als Summe: sgn(cmp(a,b)) + sgn(cmp(b,a)) muss 0 sein (auch bei ±0). */
const antisym = <T>(cmp: (x: T, y: T) => number, a: T, b: T): number => sgn(cmp(a, b)) + sgn(cmp(b, a));

// Bewusst durchmischtes Feld: jede Merkmalskombination kommt mehrfach vor, damit
// Gleichstände in JEDER Stufe der Kette auftreten (nicht nur in der letzten).
const REFS: EntscheidRef[] = [
  ref({ key: 'bge_150_III_1', datum: '2026-01-01', leitcharakter: 'leitentscheid' }),
  ref({ key: 'bge_150_III_2', datum: '2026-01-01', leitcharakter: 'leitentscheid' }),
  ref({ key: 'bge_150_III_3', datum: '2026-01-01', leitcharakter: 'routine' }),
  ref({ key: 'bger_1C_1_2026', datum: '2026-01-01', leitcharakter: 'routine' }),
  ref({ key: 'bger_1C_2_2026', datum: '2025-06-30', leitcharakter: 'routine' }),
  ref({ key: 'bger_1C_3_2026', datum: '2025-06-30', leitcharakter: 'leitentscheid' }),
];

describe('vergleicheEntscheidRefs — Komparator-Kontrakt (proNorm, Erlass-Ebene)', () => {
  it('Antisymmetrie: cmp(a,b) === -cmp(b,a) für ALLE Paare', () => {
    const verstoesse = paare(REFS)
      .filter(([a, b]) => antisym(vergleicheEntscheidRefs, a, b) !== 0)
      .map(([a, b]) => `${a.key}/${b.key}`);
    expect(verstoesse).toEqual([]);
  });

  it('Reflexivität: cmp(a,a) === 0 (die alte Form lieferte hier −1)', () => {
    for (const a of REFS) expect(vergleicheEntscheidRefs(a, a)).toBe(0);
  });

  it('Transitivität: a≤b und b≤c ⇒ a≤c', () => {
    const verstoesse: string[] = [];
    for (const a of REFS) for (const b of REFS) for (const c of REFS) {
      if (vergleicheEntscheidRefs(a, b) <= 0 && vergleicheEntscheidRefs(b, c) <= 0
        && vergleicheEntscheidRefs(a, c) > 0) verstoesse.push(`${a.key}→${b.key}→${c.key}`);
    }
    expect(verstoesse).toEqual([]);
  });

  it('Datums-Gleichstand: der key-Tiebreaker ENTSCHEIDET (war toter Code)', () => {
    const x = ref({ key: 'bge_A', datum: '2026-01-01' });
    const y = ref({ key: 'bge_B', datum: '2026-01-01' });
    expect(vergleicheEntscheidRefs(x, y)).toBeLessThan(0);   // 'bge_A' < 'bge_B'
    expect(vergleicheEntscheidRefs(y, x)).toBeGreaterThan(0);
  });

  it('Leitentscheid vor Routine, dann Datum absteigend (Fachordnung unverändert)', () => {
    const alt = ref({ key: 'a', datum: '2020-01-01', leitcharakter: 'leitentscheid' });
    const neuRoutine = ref({ key: 'b', datum: '2026-01-01', leitcharakter: 'routine' });
    expect(vergleicheEntscheidRefs(alt, neuRoutine)).toBeLessThan(0);
    const neu = ref({ key: 'c', datum: '2026-01-01', leitcharakter: 'routine' });
    const aelter = ref({ key: 'd', datum: '2025-01-01', leitcharakter: 'routine' });
    expect(vergleicheEntscheidRefs(neu, aelter)).toBeLessThan(0);
  });

  it('EINGABEFOLGE-UNABHÄNGIG: jede Permutation ergibt dieselbe Reihenfolge', () => {
    const soll = [...REFS].sort(vergleicheEntscheidRefs).map((r) => r.key);
    // Vorwärts, rückwärts und eine deterministisch rotierte Folge.
    for (const eingabe of [REFS, [...REFS].reverse(), [...REFS.slice(3), ...REFS.slice(0, 3)]]) {
      expect([...eingabe].sort(vergleicheEntscheidRefs).map((r) => r.key)).toEqual(soll);
    }
  });

  it('auch jenseits der V8-Insertion-Sort-Schwelle (>10 Elemente, alle gleichauf)', () => {
    // Unter 11 Elementen sortiert V8 per Insertion-Sort; darüber greift TimSort mit
    // Merge-Läufen. Ein kaputter Komparator zeigt sich in beiden Regimen anders —
    // dieser Fall deckt das grosse ab (proNorm-Buckets fassen bis zu 12 Refs).
    const viele = Array.from({ length: 20 }, (_, i) =>
      ref({ key: `bge_${String(i).padStart(2, '0')}`, datum: '2026-01-01' }));
    const vor = [...viele].sort(vergleicheEntscheidRefs).map((r) => r.key);
    const rueck = [...viele].reverse().sort(vergleicheEntscheidRefs).map((r) => r.key);
    expect(vor).toEqual(rueck);
    expect(vor).toEqual([...vor].sort());   // key aufsteigend, weil alles andere gleich
  });
});

describe('vergleicheLeitfaelle — dieselben Kontrakt-Bedingungen (Artikel-Ebene)', () => {
  const LFS: LeitfallRef[] = [
    lf({ key: 'bge_1', gewicht: 3, datum: '2026-01-01', leitcharakter: 'leitentscheid' }),
    lf({ key: 'bge_2', gewicht: 3, datum: '2026-01-01', leitcharakter: 'leitentscheid' }),
    lf({ key: 'bge_3', gewicht: 3, datum: '2026-01-01', leitcharakter: 'routine' }),
    lf({ key: 'bge_4', gewicht: 0, datum: '2026-01-01', leitcharakter: 'routine' }),
    lf({ key: 'bge_5', gewicht: 0, datum: '2024-12-31', leitcharakter: 'routine' }),
  ];

  it('Antisymmetrie + Reflexivität über alle Paare', () => {
    for (const [a, b] of paare(LFS)) {
      expect(antisym(vergleicheLeitfaelle, a, b)).toBe(0);
    }
    for (const a of LFS) expect(vergleicheLeitfaelle(a, a)).toBe(0);
  });

  it('Gleichstand bis zum Schluss ⇒ key entscheidet, Eingabefolge nicht', () => {
    const soll = [...LFS].sort(vergleicheLeitfaelle).map((r) => r.key);
    expect([...LFS].reverse().sort(vergleicheLeitfaelle).map((r) => r.key)).toEqual(soll);
    expect(vergleicheLeitfaelle(LFS[0], LFS[1])).toBeLessThan(0);   // bge_1 vor bge_2
  });
});

// ── Build-Pfad-Unabhängigkeit am ECHTEN Schreibpfad, nicht nur am Komparator ──
//
// Der Komparator-Kontrakt oben ist notwendig, aber nicht hinreichend: entscheidend
// ist, dass `schreibeKorpus` bei VERTAUSCHTER Eingabefolge byte-gleiche Artefakte
// erzeugt. Genau das war der Anspruch, den dieser Branch für norm-index.json erhoben
// hat — hier wird er geprüft statt behauptet (§6).
describe('schreibeKorpus — vertauschte Eingabe ⇒ byte-gleiche Index-Artefakte', () => {
  function snap(id: string, datum: string, over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
    return {
      id: `bund/bge/${id}`, gericht: 'bge', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
      kanton: 'CH', abteilung: null, nummer: id.replace(/_/g, ' '), bgeReferenz: id.replace(/_/g, ' '),
      zitierung: `BGE ${id.replace(/_/g, ' ')}`, datum, sprache: 'de', leitcharakter: 'routine',
      sachgebiet: 'privat', legalArea: null, rubrum: null, regeste: null, regesteAmtlich: true,
      abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: null, text: 'x' }] }],
      dispositivOrders: [], zitierteNormen: ['Art. 41 OR'], normKeys: ['OR'], zitierteEntscheide: [],
      bestand: 'snapshot', kuratierung: 'maschinell', quelle: 'opencaselaw',
      quelleUrl: 'https://www.bger.ch', abgerufen: '2026-01-01', fassungsToken: 'h', sha: 's',
      ...over,
    };
  }

  // ALLE mit demselben Datum und demselben leitcharakter: der Gleichstand, an dem
  // der alte Komparator die Eingabefolge durchschlagen liess.
  const gleichstand = [
    snap('150_III_1', '2026-01-01'),
    snap('150_III_2', '2026-01-01'),
    snap('150_III_3', '2026-01-01'),
    snap('150_III_4', '2026-01-01'),
  ];

  function schreibeUndLies(auswahl: EntscheidSnapshot[]): { erlass: string; monolith: NormEntscheidIndex } {
    const root = mkdtempSync(join(tmpdir(), 'lexm-ordnung-'));
    mkdirSync(join(root, 'src', 'lib', 'rechtsprechung'), { recursive: true });
    try {
      schreibeKorpus(auswahl, '2026-07-28', root);
      const pub = join(root, 'public', 'rechtsprechung');
      return {
        erlass: readFileSync(join(pub, 'norm-index-erlasse.json'), 'utf8'),
        monolith: JSON.parse(readFileSync(join(pub, 'norm-index.json'), 'utf8')) as NormEntscheidIndex,
      };
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  it('norm-index-erlasse.json ist BYTE-gleich bei umgekehrter Eingabe', () => {
    const vor = schreibeUndLies(gleichstand);
    const rueck = schreibeUndLies([...gleichstand].reverse());
    expect(rueck.erlass).toBe(vor.erlass);
  });

  it('proNorm-Reihenfolge folgt dem key, nicht der Eingabe', () => {
    const { monolith } = schreibeUndLies([...gleichstand].reverse());
    expect(monolith.proNorm.OR.map((r) => r.key)).toEqual([
      'bge_150_III_1', 'bge_150_III_2', 'bge_150_III_3', 'bge_150_III_4',
    ]);
  });
});
