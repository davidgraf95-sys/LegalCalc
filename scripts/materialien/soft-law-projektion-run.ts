// scripts/materialien/soft-law-projektion-run.ts
// Dünner CLI-Runner der Soft-Law-Projektion (§2.7). Getrennt vom reinen Modul
// soft-law-projektion.ts, damit dieses seiteneffektfrei importierbar bleibt
// (check:materialien + Tests) — vgl. Repo-Muster material-manifest / *-run.
//
// §2: --datum kommt aus der Shell (kein Date.now). Aufruf: npm run materialien -- --datum=$(date +%F)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  projiziereRegister,
  projiziereShards,
  baueKorpusInfo,
  ladeKantenAusDb,
  dbDokAusZustand,
  schreibeShardsUndBereinige,
  REGISTER_PFAD,
  SOFT_LAW_DB,
  type NormRefRow,
  type DokMeta,
} from './soft-law-projektion.ts';
import { ladeZustand } from './soft-law-zustand.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const datum = datumArg?.slice('--datum='.length);
if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
  console.error('soft-law-projektion: --datum=YYYY-MM-DD erforderlich (§2, kein Date.now).');
  process.exit(1);
}

// dbDocs IMMER aus dem committeten Zustands-Manifest (§0/B2) — nie aus der DB (keine Divergenz).
const dbDocs = dbDokAusZustand(ladeZustand());
let kanten: NormRefRow[] = [];
let dokMeta = new Map<string, DokMeta>();
if (existsSync(SOFT_LAW_DB)) {
  const db = new DatabaseSync(SOFT_LAW_DB);
  ({ kanten, dokMeta } = ladeKantenAusDb(db));
  db.close();
} else {
  console.log(`soft-law-projektion: ${SOFT_LAW_DB} fehlt — Kanten-Shards aus DB entfallen (register.json aus Zustands-Manifest, §8).`);
}

// (1) register.json (mit Trailing-Newline wie bisher)
const register = projiziereRegister(datum, dbDocs);
mkdirSync(dirname(REGISTER_PFAD), { recursive: true });
writeFileSync(REGISTER_PFAD, JSON.stringify(register, null, 2) + '\n', 'utf8');

// (2) Kanten-Shards + Orphan-Bereinigung — NUR mit Harvest-Kanten (J3-Lehre
// 29.8.2026, §17): eine fehlende oder hohle soft-law.db (nur Blob-Ingest,
// norm_referenzen leer — z.B. frischer Worktree oder nach datenhaltung:build)
// lieferte kanten=[] und die Orphan-Bereinigung LOESCHTE alle committeten
// Shards (33k Zeilen, Beinahe-Datenverlust). Gleiche Bedingung wie die
// `reprojektionsfaehig`-Wache in check-materialien.ts (Falsch-Rot 21.7.2026):
// ohne Kanten bleiben die committeten Shards unangetastet, protokolliert.
let dateien: ReturnType<typeof projiziereShards>['dateien'] = [];
let downgrades: ReturnType<typeof projiziereShards>['downgrades'] = [];
let nichtProjiziert: ReturnType<typeof projiziereShards>['nichtProjiziert'] = [];
let geschrieben = 0, entfernt = 0;
if (kanten.length > 0) {
  ({ dateien, downgrades, nichtProjiziert } = projiziereShards(datum, kanten, dokMeta, baueKorpusInfo()));
  ({ geschrieben, entfernt } = schreibeShardsUndBereinige(dateien));
} else {
  console.log('soft-law-projektion: keine Harvest-Kanten (DB fehlt oder hohl) — Shards bleiben unangetastet (kein Orphan-Loeschen).');
}
for (const d of downgrades) console.log(`  Downgrade: ${d.dok} · ${d.erlass} Art. ${d.artikel} → Erlass-Ebene (${d.grund})`);
for (const n of nichtProjiziert) console.log(`  nicht projiziert: ${n.dok} · ${n.erlass} (${n.grund})`);

console.log(
  `soft-law-projektion (--datum=${datum}): register.json ${register.materialien.length} Materialien ` +
    `(${register.materialien.length - dbDocs.length} kuratiert · ${dbDocs.length} DB); ` +
    `Shards ${dateien.length} Datei(en) [${geschrieben} geschrieben · ${entfernt} orphan] · ` +
    `${downgrades.length} Downgrades · ${nichtProjiziert.length} nicht projiziert.`,
);
