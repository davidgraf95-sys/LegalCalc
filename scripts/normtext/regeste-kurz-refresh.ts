// ─── Manifest-regesteKurz neu berechnen (chirurgisch, offline) ────────────────
//
// register.json/norm-index.json tragen vorberechnete `regesteKurz`-Strings, die
// mit der alten Glättung erzeugt wurden (u.a. mit führender „Regeste"-Überschrift).
// Dieses Script liest je Eintrag den Snapshot, rechnet regesteKurz neu über die
// (korrigierte) SSoT kuerzeRegeste(normalisiereRegeste(text)) und schreibt NUR die
// beiden Manifest-Dateien zurück — Snapshots/sha/Provenienz bleiben unberührt.
//
// Flags:  --schreiben (sonst dry-run)
//   vite-node scripts/normtext/regeste-kurz-refresh.ts -- [--schreiben]
//
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { kuerzeRegeste, normalisiereRegeste } from '../../src/lib/rechtsprechung/register';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const PUB = join(process.cwd(), 'public', 'rechtsprechung');
const schreiben = process.argv.slice(2).includes('--schreiben');

/** regesteKurz eines Entscheids aus seinem Snapshot (oder null). */
function frischKurz(datei: string | undefined, key: string): string | null {
  // datei ist im Manifest relativ zu public/rechtsprechung; norm-index kennt nur key.
  const pfad = datei ? join(PUB, datei) : join(PUB, `${key.split('_')[0]}`, 'bge', `${key.split('_').slice(1).join('_')}.json`);
  if (!existsSync(pfad)) return null;
  const snap = (JSON.parse(readFileSync(pfad, 'utf8')) as EntscheidSnapshotDatei).eintraege[0];
  return snap?.regeste ? kuerzeRegeste(normalisiereRegeste(snap.regeste.text)) : null;
}

let geaendert = 0;

// 1) register.json — datei je Eintrag bekannt.
const regPfad = join(PUB, 'register.json');
const reg = JSON.parse(readFileSync(regPfad, 'utf8')) as EntscheidManifest;
const dateiVonKey = new Map<string, string>();
for (const e of reg.entscheide) {
  if (e.datei) dateiVonKey.set(e.key, e.datei);
  const neu = frischKurz(e.datei ?? undefined, e.key);
  if (neu !== e.regesteKurz) { e.regesteKurz = neu; geaendert++; }
}

// 2) norm-index.json — regesteKurz je (norm → entscheid) über key auflösen.
const niPfad = join(PUB, 'norm-index.json');
const ni = JSON.parse(readFileSync(niPfad, 'utf8')) as { erzeugt: string; proNorm: Record<string, { key: string; regesteKurz: string | null }[]> };
for (const refs of Object.values(ni.proNorm)) {
  for (const r of refs) {
    const neu = frischKurz(dateiVonKey.get(r.key), r.key);
    if (neu !== r.regesteKurz) { r.regesteKurz = neu; geaendert++; }
  }
}

console.log(`[regeste-kurz] ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'} — aktualisierte regesteKurz-Felder: ${geaendert}`);
if (schreiben) {
  writeFileSync(regPfad, JSON.stringify(reg, null, 2) + '\n', 'utf8');
  writeFileSync(niPfad, JSON.stringify(ni, null, 2) + '\n', 'utf8');
  // Die schlanke Laufzeit-Projektion der Erlass-Ebene muss MITGEHEN (W2·6-NKEY §5):
  // `rechtsprechungFuerErlass()` liest norm-index-erlasse.json, nicht den Monolithen —
  // ein Refresh nur am Monolithen liesse die UI auf dem Altstand servieren.
  // check:entscheide prüft die Byte-Gleichheit und würde das sonst rot melden.
  writeFileSync(
    join(PUB, 'norm-index-erlasse.json'),
    JSON.stringify({ erzeugt: ni.erzeugt, proNorm: ni.proNorm }, null, 2) + '\n',
    'utf8',
  );
  console.log('[regeste-kurz] register.json + norm-index.json + norm-index-erlasse.json geschrieben.');
} else {
  console.log('[regeste-kurz] DRY-RUN — mit --schreiben anwenden.');
}
