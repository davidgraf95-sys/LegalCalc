// ─── Snapshot-Walker über public/rechtsprechung (geteilt, §5) ────────────────
//
// `public/rechtsprechung` enthält NICHT nur Entscheid-Snapshots. Daneben liegen
// die Projektions-Artefakte register.json, richter.json, norm-index.json,
// norm-index-erlasse.json und die 157 Schaufenster-Shards unter norm-index/.
//
// Bis 28.7.2026 trug jedes Nachpflege-Skript (remap-sachgebiet, rubrum-bereinigen,
// sachverhalt-strukturieren, renormalisiere-bestand + zwei Archiv-Skripte) eine
// eigene Kopie des Walkers, und alle schlossen nur `register.json` und
// `norm-index.json` NAMENTLICH aus. Eine Ausschlussliste ist genau so lange
// richtig, wie niemand ein neues Artefakt danebenlegt — und die Kette hat seither
// drei dazubekommen. GEMESSEN am Bestand (28.7.2026):
//
//     gesammelte Dateien            5252
//     davon ohne `eintraege`-Array   159   (richter.json + 157 Shards
//                                           + norm-index-erlasse.json)
//
// Auf diesen 159 warf das anschliessende `wrap.eintraege[0]` einen
// `TypeError: Cannot read properties of undefined (reading '0')` — der Lauf brach
// ab, statt die Fremddatei zu übergehen.
//
// Darum hier EIN Walker mit STRUKTURELLEM Guard statt Namensliste: eine Datei ist
// genau dann ein Snapshot, wenn ihr JSON ein `eintraege`-Array trägt. Neue
// Projektionen dürfen dazukommen, ohne dass irgendeine Stelle nachgepflegt werden
// muss — das ist der Punkt (§5, §6.7: eine Prüfung, die nur greift, wenn jemand an
// sie denkt, ist keine).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

export interface SnapshotDatei {
  /** Absoluter Pfad — zum Zurückschreiben derselben Datei. */
  datei: string;
  /** Der geparste Wrapper (trägt `erzeugt`, das beim Schreiben erhalten bleibt). */
  wrap: EntscheidSnapshotDatei;
  /** `wrap.eintraege[0]` — je Datei genau ein Entscheid (Repo-Invariante). */
  snap: EntscheidSnapshot;
}

/** Trägt das geparste JSON ein `eintraege`-Array? (Der Guard, §7: prüfen statt annehmen.) */
export function istSnapshotDatei(roh: unknown): roh is EntscheidSnapshotDatei {
  return typeof roh === 'object' && roh !== null
    && Array.isArray((roh as { eintraege?: unknown }).eintraege);
}

/** Alle .json unterhalb `dir`, alphabetisch sortiert (Determinismus, §2). */
export function alleJsonDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleJsonDateien(p));
    else if (name.endsWith('.json')) out.push(p);
  }
  return out;
}

/**
 * Lazy über alle ECHTEN Snapshot-Dateien unterhalb `dir` (Projektions-Artefakte
 * übersprungen, siehe Kopf). Generator und nicht Array, weil die Aufrufer je Datei
 * parsen/verwerfen: 5093 geparste Snapshots gleichzeitig im Speicher zu halten ist
 * kein Muster, das dieser Korpus verträgt.
 *
 * Dateien mit leerem `eintraege[]` werden ebenfalls übersprungen — dasselbe
 * `if (!snap) continue;`, das die Aufrufer bisher einzeln trugen.
 */
export function* alleSnapshots(dir: string): Generator<SnapshotDatei> {
  for (const datei of alleJsonDateien(dir)) {
    const roh: unknown = JSON.parse(readFileSync(datei, 'utf8'));
    if (!istSnapshotDatei(roh)) continue;
    const snap = roh.eintraege[0] as EntscheidSnapshot | undefined;
    if (!snap) continue;
    yield { datei, wrap: roh, snap };
  }
}
