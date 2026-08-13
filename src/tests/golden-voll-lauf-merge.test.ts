/**
 * Golden-Merge des VOLL-Laufs (scripts/normtext/golden-kanton-merge.ts,
 * `mischeGoldenVollLauf`).
 *
 * BELEGTER SCHADEN, den diese Tests einsperren — und zwar ZWEIMAL derselbe:
 *
 *   27.7.2026 (PR #383, Runde 2): ein Voll-Lauf mit partiellem Kantons-Korpus
 *     liess `golden/normtext-snapshot.json` von 55'763 auf 32'639 Einträge
 *     schrumpfen (−23'473 Kantons-Knoten). Reaktion damals: das TOR
 *     `check:golden-normtext` wurde gebaut (scripts/check-golden-normtext.ts) —
 *     die URSACHE im Generator blieb offen.
 *   10.8.2026 (Commit b84ee8302, Fedlex-Frische-Automatik): derselbe Mechanismus,
 *     fast dieselbe Zahl — 56'113 → 32'640, −23'473 Knoten. Betroffen waren AR
 *     (6398 → 453) und BS (17688 → 160): 1116 Erlass-Präfixe verloren ihre
 *     komplette Drift-Basis (§7 lit. d), während ihre Snapshot-Dateien
 *     unverändert auf der Platte lagen. Kein einziger Golden-sha änderte sich
 *     und kein einziger Schlüssel kam hinzu — der Lauf hat also nichts
 *     Neues erkannt, sondern nur gelöscht.
 *
 * MECHANISMUS. `normtext-snapshot.ts` schrieb den Golden-Index am Ende des
 * Voll-Laufs PAUSCHAL aus `goldenIndex` (dem in DIESEM Lauf erzeugten Index).
 * Fällt eine Quelle aus — LexWork-Token fehlt, PDF-Cache leer, Netzfehler —,
 * produziert die Route 0 Knoten; die zugehörige Snapshot-DATEI bleibt aber
 * liegen (sie wird nur bei Erfolg überschrieben). Ergebnis: Datei ohne
 * Drift-Basis, still.
 *
 * Für Teilläufe (--nur=kanton, --nur=zh, --nur=bund) war die Erlass-Granularität
 * seit PR #390 gelöst; der VOLL-Lauf — ausgerechnet der Pfad, den die
 * Fedlex-Frische-Automatik fährt (.github/workflows/fedlex-frische.yml, Schritt
 * «Regenerierung») — hatte die Sicherung nie.
 *
 * Die Tests fahren KEIN Netz und lesen keine Artefakte: sie füttern den reinen
 * Merge mit einem simulierten Lauf-Index und einer injizierten Datei-Sonde.
 */
import { describe, it, expect } from 'vitest';
import { mischeGoldenVollLauf } from '../../scripts/normtext/golden-kanton-merge.ts';

// ── Bestand in der echten Schlüssel-Form ────────────────────────────────────
// bund/<KEY>/<eId> (3 Segmente) und kanton/<KT>/<lawIdSafe>/<anker> (4 Segmente)
// — die einzigen beiden Formen im Ist-Bestand (gemessen 13.8.2026: 25'404 bund,
// 7236 kanton, 0 Fremdformate).
const BESTAND: Record<string, string> = {
  'bund/OR/art_1': 'sha-or-1',
  'bund/OR/art_2': 'sha-or-2',
  'bund/ZGB/art_1': 'sha-zgb-1',
  'kanton/AR/1203/art_1': 'sha-ar-1203-1',
  'kanton/AR/1203/art_2': 'sha-ar-1203-2',
  'kanton/AR/111.1/art_1': 'sha-ar-111-1',
  'kanton/BS/154.810/art_1': 'sha-bs-154-1',
  'kanton/BS/211.110/art_1': 'sha-bs-211-1',
};

/**
 * Lauf-Index des Schadenslaufs vom 10.8.2026, im Kleinen: die Bund-Phase lief
 * durch, die Kantons-Routen fielen bis auf EINEN Erlass aus.
 */
const FRISCH_TEILAUSFALL: Record<string, string> = {
  'bund/OR/art_1': 'sha-or-1',
  'bund/OR/art_2': 'sha-or-2',
  'bund/ZGB/art_1': 'sha-zgb-1',
  'kanton/BS/154.810/art_1': 'sha-bs-154-1',
};

/** Alle Snapshot-Dateien liegen auf der Platte (der Normalfall). */
const ALLE_DA = (): boolean => true;

/**
 * ALT-Logik, wörtlich wie sie bis zu diesem Fix in normtext-snapshot.ts stand
 * (Zeilen 1525-1531): der Lauf-Index WIRD der neue Bestand. Referenz, die den
 * Defekt festnagelt — NICHT die Implementierung unter Test.
 */
function schreibePauschal(
  _bestand: Record<string, string>,
  frisch: Record<string, string>,
): Record<string, string> {
  return { ...frisch };
}

describe('mischeGoldenVollLauf — der b84ee8302-Schaden (10.8.2026)', () => {
  it('Routen-Ausfall im Voll-Lauf LÄSST den Altbestand der nicht gelieferten Erlasse stehen', () => {
    const { gemischt } = mischeGoldenVollLauf(BESTAND, FRISCH_TEILAUSFALL, ALLE_DA);

    // Der Kern: AR-1203, AR-111.1 und BS-211.110 lieferten in diesem Lauf keinen
    // Knoten. Ihre Dateien liegen unverändert auf der Platte — ihre Drift-Basis
    // muss es auch (§7 lit. d, §8 kein stiller Verlust).
    expect(gemischt['kanton/AR/1203/art_1']).toBe('sha-ar-1203-1');
    expect(gemischt['kanton/AR/1203/art_2']).toBe('sha-ar-1203-2');
    expect(gemischt['kanton/AR/111.1/art_1']).toBe('sha-ar-111-1');
    expect(gemischt['kanton/BS/211.110/art_1']).toBe('sha-bs-211-1');

    // Der tatsächlich gefahrene Erlass steht mit dem frischen Stand da.
    expect(gemischt['kanton/BS/154.810/art_1']).toBe('sha-bs-154-1');

    // Kein Schlüssel geht verloren.
    expect(Object.keys(gemischt).sort()).toEqual(Object.keys(BESTAND).sort());
  });

  it('ALT-Logik verlor genau diese Schlüssel — der Defekt ist hier festgenagelt', () => {
    const alt = schreibePauschal(BESTAND, FRISCH_TEILAUSFALL);
    const neu = mischeGoldenVollLauf(BESTAND, FRISCH_TEILAUSFALL, ALLE_DA).gemischt;

    const verlorenAlt = Object.keys(BESTAND).filter((k) => !(k in alt));
    expect(verlorenAlt).toEqual([
      'kanton/AR/1203/art_1',
      'kanton/AR/1203/art_2',
      'kanton/AR/111.1/art_1',
      'kanton/BS/211.110/art_1',
    ]);

    const verlorenNeu = Object.keys(BESTAND).filter((k) => !(k in neu));
    expect(verlorenNeu).toEqual([]);
  });

  it('meldet bewahrte und ersetzte Erlass-Präfixe (§8-Sichtbarkeit)', () => {
    const merge = mischeGoldenVollLauf(BESTAND, FRISCH_TEILAUSFALL, ALLE_DA);
    expect(merge.bewahrt).toEqual(['kanton/AR/111.1', 'kanton/AR/1203', 'kanton/BS/211.110']);
    expect(merge.ersetzt).toEqual(['bund/OR', 'bund/ZGB', 'kanton/BS/154.810']);
    expect(merge.verworfen).toEqual([]);
  });
});

describe('mischeGoldenVollLauf — Verhaltensneutralität des gesunden Voll-Laufs', () => {
  it('Voll-Lauf ohne Ausfall → IDENTISCH zur ALT-Logik (pauschales Schreiben)', () => {
    // Jeder Erlass liefert frische Knoten: dann ist Merge == pauschal.
    const frisch: Record<string, string> = {};
    for (const k of Object.keys(BESTAND)) frisch[k] = `NEU-${BESTAND[k]}`;

    const alt = schreibePauschal(BESTAND, frisch);
    const neu = mischeGoldenVollLauf(BESTAND, frisch, ALLE_DA).gemischt;
    expect(neu).toEqual(alt);
    // …und zwar mit dem frischen Stand, nicht mit dem Altbestand.
    expect(neu['kanton/AR/1203/art_1']).toBe('NEU-sha-ar-1203-1');
  });

  it('weggefallener Artikel innerhalb eines gefahrenen Erlasses wird weiterhin purgiert', () => {
    // Anker-Rename / Anhang-Reorg: der Alt-Schlüssel MUSS weg, sonst verwaist er
    // (check:golden-normtext (b)).
    const frisch = { 'kanton/AR/1203/art_1': 'NEU-ar-1203-1' };
    const neu = mischeGoldenVollLauf(BESTAND, frisch, ALLE_DA).gemischt;
    expect(neu['kanton/AR/1203/art_1']).toBe('NEU-ar-1203-1');
    expect('kanton/AR/1203/art_2' in neu).toBe(false);
    // Nicht gefahrene Erlasse bleiben unangetastet.
    expect(neu['kanton/AR/111.1/art_1']).toBe('sha-ar-111-1');
  });

  it('GELÖSCHTER Erlass (Snapshot-Datei fort) wird NICHT bewahrt — sonst verwaist der Index', () => {
    // Die Gegenprobe zur Bewahrung: ein Erlass, der aus dem Korpus entfernt
    // wurde, liefert ebenfalls 0 frische Knoten. Ihn zu bewahren erzeugte
    // Waisen (check:golden-normtext (b), §5 zweite Wahrheit). Unterschieden
    // wird an der Datei — dem einzigen Zeugen, der beide Fälle trennt.
    const dateiFehlt = (pfad: string): boolean =>
      pfad !== 'public/normtext/kanton/AR-1203.json';

    const merge = mischeGoldenVollLauf(BESTAND, FRISCH_TEILAUSFALL, dateiFehlt);
    expect('kanton/AR/1203/art_1' in merge.gemischt).toBe(false);
    expect('kanton/AR/1203/art_2' in merge.gemischt).toBe(false);
    expect(merge.verworfen).toEqual(['kanton/AR/1203']);
    // Die übrigen ausgefallenen Erlasse bleiben bewahrt.
    expect(merge.gemischt['kanton/AR/111.1/art_1']).toBe('sha-ar-111-1');
    expect(merge.bewahrt).toEqual(['kanton/AR/111.1', 'kanton/BS/211.110']);
  });

  it('TOTALAUSFALL der Kantons-Phasen → kein einziger kantonaler Schlüssel geht verloren', () => {
    // Der reale 10.8.-Fall in Reinform: nur die Bund-Phase lieferte.
    const nurBund = {
      'bund/OR/art_1': 'sha-or-1',
      'bund/OR/art_2': 'sha-or-2',
      'bund/ZGB/art_1': 'sha-zgb-1',
    };
    const merge = mischeGoldenVollLauf(BESTAND, nurBund, ALLE_DA);
    expect(merge.gemischt).toEqual(BESTAND);
    expect(merge.bewahrt).toEqual([
      'kanton/AR/111.1',
      'kanton/AR/1203',
      'kanton/BS/154.810',
      'kanton/BS/211.110',
    ]);
  });

  it('leerer Lauf-Index → Bestand bleibt vollständig (nie ein leerer Golden-Index)', () => {
    const merge = mischeGoldenVollLauf(BESTAND, {}, ALLE_DA);
    expect(merge.gemischt).toEqual(BESTAND);
    expect(merge.ersetzt).toEqual([]);
  });
});

describe('mischeGoldenVollLauf — Datei-Zuordnung der Erlass-Präfixe', () => {
  it('fragt die Datei-Sonde mit dem korrekten Snapshot-Pfad je Präfix', () => {
    const gefragt: string[] = [];
    const sonde = (pfad: string): boolean => {
      gefragt.push(pfad);
      return true;
    };
    mischeGoldenVollLauf(BESTAND, FRISCH_TEILAUSFALL, sonde);
    // Nur die AUSGEFALLENEN Präfixe müssen geprüft werden (die gefahrenen sind
    // per Definition da) — und zwar unter ihrem echten Projektionspfad.
    expect([...new Set(gefragt)].sort()).toEqual([
      'public/normtext/kanton/AR-111.1.json',
      'public/normtext/kanton/AR-1203.json',
      'public/normtext/kanton/BS-211.110.json',
    ]);
  });

  it('Bund-Präfix → public/normtext/bund/<KEY>.json', () => {
    const gefragt: string[] = [];
    const sonde = (pfad: string): boolean => {
      gefragt.push(pfad);
      return true;
    };
    // ZGB liefert nichts → seine Datei muss geprüft werden.
    mischeGoldenVollLauf(BESTAND, { 'bund/OR/art_1': 'x' }, sonde);
    expect(gefragt).toContain('public/normtext/bund/ZGB.json');
  });
});
