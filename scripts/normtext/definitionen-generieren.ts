// ─── R6 · Generator `public/normtext/definitionen.json` ──────────────────────
//
//   npm run gen:definitionen -- --datum=$(date +%F)
//   npm run gen:definitionen -- --bericht        (nur messen, nichts schreiben)
//
// Liest ALLE Snapshots unter public/normtext/bund und public/normtext/kanton
// (kanton-generisch, FAHRPLAN-KANTONE §5.1 «gilt für alle»: keine Kantonsliste,
// keine Sonderpfade — ein neuer Kanton wird ohne Codeänderung mitgenommen) und
// projiziert sie mit den Regeln aus `definitionen-logik.ts`.
//
// SCHREIBT KEINE SNAPSHOTS. Diese Runde liest den Korpus nur; golden/
// normtext-snapshot.json und golden/lexmetrik-golden.json bleiben unberührt.
//
// DETERMINISMUS (§2): kein Date.now, kein Zufall, keine Nebenläufigkeit. Das
// einzige Datum kommt aus `--datum`; im Vergleichs-Modus (`--vergleich`) wird
// das `erzeugt` der committeten Datei übernommen, damit der Byte-Vergleich die
// Regeln prüft und nicht den Kalender.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshot, NormSnapshotDatei } from '../../src/lib/normtext/typen';
import { definitionenAusEintrag, ZITAT_MAX, type DefinitionsEintrag, type MusterId } from './definitionen-logik';

export const ZIEL = 'public/normtext/definitionen.json';
const EBENEN: Array<{ ebene: 'bund' | 'kanton'; dir: string }> = [
  { ebene: 'bund', dir: 'public/normtext/bund' },
  { ebene: 'kanton', dir: 'public/normtext/kanton' },
];

export interface DefinitionenDatei {
  erzeugt: string;
  /** Zähler je Muster — sichtbare Verteilung statt blosser Gesamtzahl (§8). */
  proMuster: Record<string, number>;
  proEbene: Record<string, number>;
  eintraege: DefinitionsEintrag[];
}

/** `AHVG.json` → `bund/AHVG`, `BS-815.100.json` → `kanton/BS-815.100`. */
function snapshotKey(ebene: string, datei: string): string {
  return `${ebene}/${datei.replace(/\.json$/, '')}`;
}

/**
 * Alle Snapshot-Dateien einer Ebene, alphabetisch. `index.json` ist das
 * Kanton-Manifest, kein Erlass — derselbe Ausschluss wie im Suchindex und im
 * Datenhaltungs-Ingest. Der STRUKTURELLE Guard (`eintraege`-Array) fängt jede
 * künftige Nebendatei mit, ohne dass hier jemand nachpflegen muss (§6.7).
 */
function snapshots(dir: string): Array<{ datei: string; eintraege: NormSnapshot[] }> {
  const out: Array<{ datei: string; eintraege: NormSnapshot[] }> = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json') || name === 'index.json') continue;
    const roh: unknown = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    if (typeof roh !== 'object' || roh === null) continue;
    const eintraege = (roh as Partial<NormSnapshotDatei>).eintraege;
    if (!Array.isArray(eintraege)) continue;
    out.push({ datei: name, eintraege: eintraege as NormSnapshot[] });
  }
  return out;
}

export interface Lauf {
  eintraege: DefinitionsEintrag[];
  proMuster: Record<MusterId, number>;
  proEbene: Record<string, number>;
  proKanton: Record<string, number>;
  artikelGelesen: number;
  dateienGelesen: number;
}

/** Der eine Rechenweg. Generator UND Tor rufen dieselbe Funktion (§5). */
export function baueDefinitionen(): Lauf {
  const eintraege: DefinitionsEintrag[] = [];
  let artikelGelesen = 0;
  let dateienGelesen = 0;
  for (const { ebene, dir } of EBENEN) {
    for (const { datei, eintraege: snaps } of snapshots(dir)) {
      dateienGelesen++;
      const key = snapshotKey(ebene, datei);
      for (const snap of snaps) {
        artikelGelesen++;
        eintraege.push(...definitionenAusEintrag(snap, key));
      }
    }
  }
  const proMuster = {} as Record<MusterId, number>;
  const proEbene: Record<string, number> = {};
  const proKanton: Record<string, number> = {};
  for (const e of eintraege) {
    proMuster[e.muster] = (proMuster[e.muster] ?? 0) + 1;
    proEbene[e.ebene] = (proEbene[e.ebene] ?? 0) + 1;
    if (e.kanton) proKanton[e.kanton] = (proKanton[e.kanton] ?? 0) + 1;
  }
  return { eintraege, proMuster, proEbene, proKanton, artikelGelesen, dateienGelesen };
}

/** Serialisierung — 1-Space-Einrückung wie die übrigen Normtext-Artefakte. */
export function serialisiere(lauf: Lauf, erzeugt: string): string {
  const datei: DefinitionenDatei = {
    erzeugt,
    proMuster: Object.fromEntries(Object.entries(lauf.proMuster).sort(([a], [b]) => (a < b ? -1 : 1))),
    proEbene: Object.fromEntries(Object.entries(lauf.proEbene).sort(([a], [b]) => (a < b ? -1 : 1))),
    eintraege: lauf.eintraege,
  };
  return `${JSON.stringify(datei, null, 1)}\n`;
}

/** `erzeugt` der committeten Datei — Anker für den Byte-Vergleich ohne Kalender. */
export function committetesErzeugt(): string | null {
  if (!existsSync(ZIEL)) return null;
  const roh = JSON.parse(readFileSync(ZIEL, 'utf8')) as Partial<DefinitionenDatei>;
  return typeof roh.erzeugt === 'string' ? roh.erzeugt : null;
}

export function main(): void {
  const argv = process.argv.slice(2);
  const datumArg = argv.find((a) => a.startsWith('--datum='))?.slice('--datum='.length);
  const nurBericht = argv.includes('--bericht');

  const lauf = baueDefinitionen();
  const musterZeilen = Object.entries(lauf.proMuster)
    .sort(([, a], [, b]) => b - a)
    .map(([m, n]) => `    ${m.padEnd(20)} ${String(n).padStart(5)}`);
  const kantone = Object.entries(lauf.proKanton).sort(([a], [b]) => (a < b ? -1 : 1));

  console.log(`gen:definitionen — gelesen: ${lauf.dateienGelesen} Snapshot-Dateien, ${lauf.artikelGelesen} Artikel`);
  console.log(`  Einträge: ${lauf.eintraege.length} (Bund ${lauf.proEbene.bund ?? 0} · Kanton ${lauf.proEbene.kanton ?? 0} in ${kantone.length} Kantonen)`);
  console.log('  je Muster:');
  for (const z of musterZeilen) console.log(z);
  console.log(`  je Kanton: ${kantone.map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  const laengstes = lauf.eintraege.reduce((m, e) => Math.max(m, e.zitat.length), 0);
  console.log(`  längstes Zitat: ${laengstes} Zeichen (Schranke ZITAT_MAX ${ZITAT_MAX} — greift sie, fehlen Einträge)`);

  if (nurBericht) return;
  if (!datumArg || !/^\d{4}-\d{2}-\d{2}$/.test(datumArg)) {
    console.error('\ngen:definitionen: --datum=YYYY-MM-DD ist Pflicht (§2 — kein Date.now in der Erzeugung).');
    console.error('  Aufruf:  npm run gen:definitionen -- --datum=$(date +%F)');
    process.exit(1);
  }
  writeFileSync(ZIEL, serialisiere(lauf, datumArg), 'utf8');
  console.log(`  geschrieben: ${ZIEL} (erzeugt ${datumArg})`);
}

// KEIN Top-Level-Aufruf hier. Das Tor `check-definitionen.ts` importiert
// `baueDefinitionen`/`serialisiere` aus dieser Datei (§5: ein Rechenweg) — ein
// Seiteneffekt beim Import schriebe das Artefakt beim Tor-Lauf neu, und das Tor
// könnte per Konstruktion nicht mehr rot werden (§6.7).
//
// Eine Eintritts-Erkennung über `process.argv` funktioniert hier NICHT: vite-node
// entfernt den Skriptpfad aus argv (gemessen 31.8.2026 —
// `["node","…/.bin/vite-node","--datum=…"]`), der Generator lief daraufhin
// schweigend gar nicht. Darum das Repo-Muster: dünner Runner daneben
// (`definitionen-generieren-run.ts`), wie revisionen-generieren(-run).
