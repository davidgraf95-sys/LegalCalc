// ─── Manifest-regesteKurz neu berechnen (chirurgisch, offline) ────────────────
//
// register.json / norm-index.json / norm-index-erlasse.json / die 157 Schaufenster-
// Shards tragen ALLE dasselbe vorberechnete `regesteKurz` je Entscheid. Dieses
// Script liest je Eintrag den Snapshot, rechnet regesteKurz neu über die SSoT
// kuerzeRegeste(normalisiereRegeste(text)) und schreibt NUR diese Projektionen
// zurück — Snapshots/sha/Provenienz bleiben unberührt.
//
// VOLLSTÄNDIGKEIT IST DER PUNKT (§5, korrigiert 28.7.2026, W2·6-NKEY Linse 4).
// Bis dahin aktualisierte das Script `register.json` und die ERLASS-Ebene
// `proNorm` — und spiegelte proNorm anschliessend nach norm-index-erlasse.json.
// Nicht angefasst blieben:
//   · `proNormArtikel` im selben norm-index.json, und
//   · die 157 Shards unter norm-index/, aus denen der ArtikelLeser liest.
// Ein Refresh konnte damit WIDERSPRÜCHLICHE regesteKurz-Stände in EINEM Artefakt
// erzeugen: die Erlass-Liste eines Entscheids frisch, seine Artikel-Leitfall-Zeile
// alt — dieselbe Datei, dieselbe Sitzung, zwei Aussagen. Genau die zweite Wahrheit,
// die §5 verbietet; check:entscheide fing sie nicht, weil dieses Feld dort nur
// zwischen Shard und Monolith verglichen wird (beide wären gleich alt geblieben).
//
// Die SHARDS werden bewusst IN PLACE fortgeschrieben und nicht über `baueShards`
// neu erzeugt: ein Shard kann `gewichtQuelle:'e4'` tragen (V1b-Massen-Rangliste,
// backe-rangliste-shards.ts). Ein Neubau setzte ihn stumm auf 'alt' zurück und
// verwürfe die gebackenen Gewichte — ein Regesten-Refresh darf die Rangfolge
// nicht anfassen (§1: eine Frist/Quote/Reihenfolge zu verändern ist kein Refresh).
// Serialisierung über `serialisiere` aus entscheide-schreiben — dieselbe Funktion,
// die schreibeKorpus benutzt, sonst wäre der Byte-Beweis in check:entscheide nicht
// führbar (§5).
//
// Flags:  --schreiben (sonst dry-run)
//   vite-node scripts/normtext/regeste-kurz-refresh.ts -- [--schreiben]
//
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serialisiere, manifestRegesteKurz } from './entscheide-schreiben';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { NormEntscheidIndex, LeitfallShard } from '../../src/lib/rechtsprechung/norm-index';
import type { EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const PUB = join(process.cwd(), 'public', 'rechtsprechung');
const SHARD_DIR = join(PUB, 'norm-index');
const schreiben = process.argv.slice(2).includes('--schreiben');

/**
 * regesteKurz eines Entscheids aus seinem Snapshot (oder null) — über EXAKT die
 * Regel, mit der `schreibeKorpus` das Feld erzeugt (`manifestRegesteKurz`, §5).
 *
 * Hier stand bis 28.7.2026 eine EIGENE, kürzere Formel ohne den BS-Betreff-Zweig.
 * Gemessen am Bestand: ein `--schreiben`-Lauf hätte die Kurzzeile bei ALLEN 3765
 * BS-Entscheiden auf null gesetzt (sie haben keine Regeste, sondern den amtlichen
 * Betreff) — 3765 stumm geleerte Karten, ausgelöst von einem «Refresh».
 * Deshalb: keine zweite Formel, sondern der Aufruf der einen.
 */
function frischKurz(datei: string | undefined, key: string): string | null {
  // datei ist im Manifest relativ zu public/rechtsprechung; norm-index kennt nur key.
  const pfad = datei ? join(PUB, datei) : join(PUB, `${key.split('_')[0]}`, 'bge', `${key.split('_').slice(1).join('_')}.json`);
  if (!existsSync(pfad)) return null;
  const snap = (JSON.parse(readFileSync(pfad, 'utf8')) as EntscheidSnapshotDatei).eintraege[0];
  return snap ? manifestRegesteKurz(snap) : null;
}

const dateiVonKey = new Map<string, string>();
/** Gecacht je key — ein Snapshot wird von register + proNorm + proNormArtikel + Shard referenziert. */
const kurzCache = new Map<string, string | null>();
function kurzFuer(key: string): string | null {
  let v = kurzCache.get(key);
  if (v === undefined) { v = frischKurz(dateiVonKey.get(key), key); kurzCache.set(key, v); }
  return v;
}

/** regesteKurz einer Ref-Liste nachziehen; gibt die Zahl der Änderungen zurück. */
function ziehNach(refs: { key: string; regesteKurz: string | null }[]): number {
  let n = 0;
  for (const r of refs) {
    const neu = kurzFuer(r.key);
    if (neu !== r.regesteKurz) { r.regesteKurz = neu; n++; }
  }
  return n;
}

// 1) register.json — datei je Eintrag bekannt, füllt dateiVonKey für alle weiteren Ebenen.
const regPfad = join(PUB, 'register.json');
const reg = JSON.parse(readFileSync(regPfad, 'utf8')) as EntscheidManifest;
for (const e of reg.entscheide) if (e.datei) dateiVonKey.set(e.key, e.datei);
const nReg = ziehNach(reg.entscheide);

// 2) norm-index.json — BEIDE Ebenen: Erlass (proNorm) UND Artikel (proNormArtikel).
const niPfad = join(PUB, 'norm-index.json');
const ni = JSON.parse(readFileSync(niPfad, 'utf8')) as NormEntscheidIndex;
let nErlass = 0;
for (const refs of Object.values(ni.proNorm)) nErlass += ziehNach(refs);
let nArtikel = 0;
for (const refs of Object.values(ni.proNormArtikel ?? {})) nArtikel += ziehNach(refs);

// 3) Schaufenster-Shards — dieselbe Artikel-Ebene, erlass-lokal projiziert.
const shardDateien = existsSync(SHARD_DIR)
  ? readdirSync(SHARD_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];
const shards = shardDateien.map((f) => ({
  f, shard: JSON.parse(readFileSync(join(SHARD_DIR, f), 'utf8')) as LeitfallShard,
}));
let nShards = 0; let shardsBeruehrt = 0;
for (const { shard } of shards) {
  let n = 0;
  for (const refs of Object.values(shard.proArtikel)) n += ziehNach(refs);
  if (n) shardsBeruehrt++;
  nShards += n;
}

const gesamt = nReg + nErlass + nArtikel + nShards;
console.log(`[regeste-kurz] ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'} — aktualisierte regesteKurz-Felder: ${gesamt}`);
console.log(`[regeste-kurz]   register.json      : ${nReg}`);
console.log(`[regeste-kurz]   proNorm            : ${nErlass}`);
console.log(`[regeste-kurz]   proNormArtikel     : ${nArtikel}`);
console.log(`[regeste-kurz]   Shards             : ${nShards} (in ${shardsBeruehrt}/${shards.length} Dateien)`);

if (schreiben) {
  writeFileSync(regPfad, serialisiere(reg), 'utf8');
  writeFileSync(niPfad, serialisiere(ni), 'utf8');
  // Die schlanke Laufzeit-Projektion der Erlass-Ebene muss MITGEHEN (W2·6-NKEY §5):
  // `rechtsprechungFuerErlass()` liest norm-index-erlasse.json, nicht den Monolithen —
  // ein Refresh nur am Monolithen liesse die UI auf dem Altstand servieren.
  // check:entscheide prüft die Byte-Gleichheit und würde das sonst rot melden.
  writeFileSync(
    join(PUB, 'norm-index-erlasse.json'),
    serialisiere({ erzeugt: ni.erzeugt, proNorm: ni.proNorm }),
    'utf8',
  );
  for (const { f, shard } of shards) writeFileSync(join(SHARD_DIR, f), serialisiere(shard), 'utf8');
  console.log(`[regeste-kurz] register.json + norm-index.json + norm-index-erlasse.json + ${shards.length} Shards geschrieben.`);
} else {
  console.log('[regeste-kurz] DRY-RUN — mit --schreiben anwenden.');
}
