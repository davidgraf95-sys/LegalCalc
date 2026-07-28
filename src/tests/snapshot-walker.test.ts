import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { alleSnapshots, alleJsonDateien, istSnapshotDatei } from '../../scripts/normtext/snapshot-walker';

// ─────────────────────────────────────────────────────────────────────────────
// W2·6-NKEY Linse 4 — der Walker über public/rechtsprechung (§5).
//
// Vier Nachpflege-Skripte trugen je eine Kopie mit NAMENTLICHER Ausschlussliste
// ('register.json', 'norm-index.json'). Am Bestand vom 28.7.2026 sammelten sie
// dadurch 159 Fremd-Dateien mit (richter.json + 157 Shards + norm-index-erlasse.json),
// auf denen das nachfolgende `wrap.eintraege[0]` einen TypeError warf.
// Der Guard ist deshalb STRUKTURELL: Snapshot ⇔ das JSON trägt ein eintraege-Array.
// Dieser Test baut ein Miniatur-public/rechtsprechung mit genau diesen Nachbarn.
// ─────────────────────────────────────────────────────────────────────────────

let root: string;
let PUB: string;

const snapDatei = (id: string) => ({
  erzeugt: '2026-07-28',
  eintraege: [{ id, gericht: 'bge', nummer: id, datum: '2026-01-01' }],
});

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'lexm-walker-'));
  PUB = join(root, 'rechtsprechung');
  mkdirSync(join(PUB, 'bund', 'bge'), { recursive: true });
  mkdirSync(join(PUB, 'norm-index'), { recursive: true });

  // Echte Snapshots (verschachtelt, wie im Bestand).
  writeFileSync(join(PUB, 'bund', 'bge', '150_III_1.json'), JSON.stringify(snapDatei('bund/bge/150_III_1')));
  writeFileSync(join(PUB, 'bund', 'bge', '150_III_2.json'), JSON.stringify(snapDatei('bund/bge/150_III_2')));

  // Die Nachbarn, die KEINE Snapshots sind:
  writeFileSync(join(PUB, 'register.json'), JSON.stringify({ erzeugt: 'x', entscheide: [] }));       // war namentlich ausgeschlossen
  writeFileSync(join(PUB, 'norm-index.json'), JSON.stringify({ erzeugt: 'x', proNorm: {} }));        // war namentlich ausgeschlossen
  writeFileSync(join(PUB, 'richter.json'), JSON.stringify({ erzeugt: 'x', richter: {} }));           // war es NICHT
  writeFileSync(join(PUB, 'norm-index-erlasse.json'), JSON.stringify({ erzeugt: 'x', proNorm: {} })); // war es NICHT
  writeFileSync(join(PUB, 'norm-index', 'OR.json'), JSON.stringify({ erzeugt: 'x', erlass: 'OR', gewichtQuelle: 'alt', proArtikel: {} })); // war es NICHT

  // Randfälle: leeres eintraege[] und ein Nicht-Objekt an der Wurzel.
  writeFileSync(join(PUB, 'bund', 'leer.json'), JSON.stringify({ erzeugt: 'x', eintraege: [] }));
  writeFileSync(join(PUB, 'bund', 'array.json'), JSON.stringify([1, 2, 3]));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('alleSnapshots — struktureller Guard statt Namensliste', () => {
  it('liefert NUR echte Snapshots; alle Projektions-Artefakte fallen raus', () => {
    expect([...alleSnapshots(PUB)].map((x) => x.snap.id)).toEqual([
      'bund/bge/150_III_1', 'bund/bge/150_III_2',
    ]);
  });

  it('kein Wurf auf richter.json / Shards / norm-index-erlasse.json (der Bestandsfehler)', () => {
    // Vor dem Fix: TypeError «Cannot read properties of undefined (reading '0')».
    expect(() => [...alleSnapshots(PUB)]).not.toThrow();
  });

  it('leeres eintraege[] wird übersprungen (das frühere `if (!snap) continue`)', () => {
    expect([...alleSnapshots(PUB)].some((x) => x.datei.endsWith('leer.json'))).toBe(false);
  });

  it('reicht Pfad UND Wrapper durch — die Aufrufer schreiben dieselbe Datei zurück', () => {
    const erste = [...alleSnapshots(PUB)][0];
    expect(erste.datei.endsWith(join('bund', 'bge', '150_III_1.json'))).toBe(true);
    expect(erste.wrap.erzeugt).toBe('2026-07-28');
    expect(erste.wrap.eintraege[0]).toBe(erste.snap);
  });

  it('sortiert und damit deterministisch (§2) — zwei Läufe, gleiche Folge', () => {
    const a = [...alleSnapshots(PUB)].map((x) => x.snap.id);
    const b = [...alleSnapshots(PUB)].map((x) => x.snap.id);
    expect(a).toEqual(b);
    expect(a).toEqual([...a].sort());
  });

  it('LAZY: der Generator parst nicht das ganze Verzeichnis auf einmal', () => {
    // 5093 geparste Snapshots gleichzeitig im Speicher zu halten ist der Grund für
    // den Generator — der erste Wert muss da sein, ohne dass der Rest gelesen wurde.
    const it0 = alleSnapshots(PUB);
    expect(it0.next().value?.snap.id).toBe('bund/bge/150_III_1');
    it0.return?.(undefined as never);
  });

  it('ein NEUES Projektions-Artefakt braucht keine Nachpflege (der eigentliche Punkt)', () => {
    writeFileSync(join(PUB, 'ganz-neue-projektion.json'), JSON.stringify({ erzeugt: 'x', irgendwas: [] }));
    expect([...alleSnapshots(PUB)].map((x) => x.snap.id)).toEqual([
      'bund/bge/150_III_1', 'bund/bge/150_III_2',
    ]);
  });
});

describe('Bausteine des Walkers', () => {
  it('alleJsonDateien sammelt rekursiv ALLE .json (ungefiltert)', () => {
    expect(alleJsonDateien(PUB).length).toBe(9);
  });

  it('istSnapshotDatei: nur Objekt mit eintraege-Array', () => {
    expect(istSnapshotDatei({ eintraege: [] })).toBe(true);
    expect(istSnapshotDatei({ eintraege: {} })).toBe(false);
    expect(istSnapshotDatei({ richter: {} })).toBe(false);
    expect(istSnapshotDatei(null)).toBe(false);
    expect(istSnapshotDatei([1, 2])).toBe(false);
    expect(istSnapshotDatei('eintraege')).toBe(false);
  });
});
