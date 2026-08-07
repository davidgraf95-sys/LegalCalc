// scripts/gegenpruefung-ok.ts
//
// Baustein c — Quittier-Helfer `npm run gegenpruefung:ok` (kein Hand-Hashing).
// Berechnet den aktuellen Risiko-Diff-Hash über DIESELBE Kernfunktion wie das
// Tor (eine Quelle der Wahrheit), übernimmt Verdikt + Quelle-Pin + Datum,
// schreibt bibliothek/.gegenpruefung-pending (gitignored) und hängt einen
// Eintrag ans Register bibliothek/register/gegenpruefung-register.md.
//
// Aufruf (vom Skill »gegenpruefung« bei Verdikt bestanden):
//   npm run gegenpruefung:ok -- --verdikt=bestanden \
//     --engine="OR.json" --quelle="fedlex or 20260701" --notiz="15/15 Werte nachgerechnet"
//
// --verdikt  Default «bestanden» (Tor akzeptiert nur «bestanden»).
// --engine   frei, Default = die geänderten Risiko-Dateien.
// --quelle   Quelle-Pin, Form «fedlex <name> <YYYYMMDD>» (für den WARN-Burn-down).
// --notiz    Beleg/Notiz fürs Register.
//
// ZWEITER EINGANG seit 8.8.2026 (QS-GP-BEREICH):
//   npm run gegenpruefung:ok -- --bereich                 (= origin/main..HEAD)
//   npm run gegenpruefung:ok -- --bereich=<A>..<B>
//   npm run gegenpruefung:ok -- --bereich <A>..<B>
// quittiert den COMMITTETEN Bereich statt des Working Tree. Anlass: nach dem
// Commit ist `git status` sauber, und dieses Werkzeug antwortete «nichts zu
// quittieren» (Exit 1) — viermal binnen fünf Tagen musste der Hash darum von
// HAND gerechnet werden (Register 3.8.2026 ×3, 7.8.2026 ×1).
//
// Das Hash-Schema ist UNVERÄNDERT (kern.ts) — der Hand-Hash-Weg bleibt darum
// als Rückfall gültig und die bestehenden Register-Zeilen bleiben nachrechenbar.
// Die Pending-Datei trägt jetzt eine LISTE mit je einem Eintrag pro Eingang:
// wer erst den Baum und dann den Bereich quittiert, verliert die erste Quittung
// nicht (beide Eingänge des Tors brauchen ihre eigene).

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { risikoDiffHash, risikoBereichHash, type DiffErgebnis } from './gegenpruefung/kern';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = resolve(ROOT, 'bibliothek/.gegenpruefung-pending');
const REGISTER = resolve(ROOT, 'bibliothek/register/gegenpruefung-register.md');

function arg(name: string): string | undefined {
  const pre = `--${name}=`;
  const treffer = process.argv.find((a) => a.startsWith(pre));
  return treffer?.slice(pre.length);
}

/**
 * Flag mit optionalem Wert: `--bereich`, `--bereich=X`, `--bereich X`.
 * Rückgabe: undefined = nicht gesetzt · '' = gesetzt ohne Wert (Default-Bereich).
 * Die Leerzeichen-Form ist mitgedacht, weil die Spec sie so schreibt
 * (`--bereich <A>..<B>`) — ein still ignoriertes Argument wäre hier fatal:
 * das Werkzeug quittierte dann klaglos den FALSCHEN Diff.
 */
function flagMitWert(name: string): string | undefined {
  const i = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  const a = process.argv[i];
  if (a.includes('=')) return a.slice(a.indexOf('=') + 1);
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : '';
}

function heute(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Markdown-Tabellenzelle: Pipes/Zeilenumbrüche entschärfen. */
function zelle(s: string): string {
  return s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim() || '—';
}

const bereichArg = flagMitWert('bereich');
const modus: 'baum' | 'bereich' = bereichArg === undefined ? 'baum' : 'bereich';

let r: DiffErgebnis;
try {
  r = modus === 'bereich' ? risikoBereichHash({ bereich: bereichArg }) : risikoDiffHash();
} catch (e) {
  console.error(`gegenpruefung:ok: ${(e as Error).message}`);
  process.exit(1);
}
if (!r.kontext) {
  console.error(
    r.grund === 'keine-basis'
      ? `gegenpruefung:ok: Bereichs-Basis «${r.bereich}» nicht auflösbar — erst 'git fetch origin'.`
      : 'gegenpruefung:ok: kein Git/HEAD (oder CI) — nichts zu quittieren.',
  );
  process.exit(1);
}
if (r.hash === null) {
  console.error(
    modus === 'bereich'
      ? `gegenpruefung:ok: keine Risiko-Datei im committeten Bereich ${r.bereich} — nichts zu quittieren.`
      : 'gegenpruefung:ok: keine Risiko-Datei im Working-Tree geändert — nichts zu quittieren. ' +
        'Schon committet? Dann  npm run gegenpruefung:ok -- --bereich  (QS-GP-BEREICH).',
  );
  process.exit(1);
}

const verdikt = arg('verdikt') ?? 'bestanden';
const engine = arg('engine') ?? r.dateien.join(', ');
const quelle = arg('quelle') ?? '';
const notiz = arg('notiz') ?? '';
const datum = heute();

// (1) Pending-Türsteher schreiben (vom Tor gelesen) — LISTE, ein Eintrag je Eingang.
//     Die Quittung des anderen Eingangs bleibt erhalten; sie löst sich weiterhin
//     von selbst auf, sobald ihr Hash nicht mehr zum Diff passt.
type PendingEintrag = {
  hash: string;
  verdikt: string;
  quellePin: string;
  datum: string;
  dateien: string[];
  modus: 'baum' | 'bereich';
  bereich?: string;
};
function bestandLesen(): PendingEintrag[] {
  if (!existsSync(PENDING)) return [];
  try {
    const j = JSON.parse(readFileSync(PENDING, 'utf8')) as
      | { eintraege?: PendingEintrag[] }
      | PendingEintrag;
    if (j && typeof j === 'object' && Array.isArray((j as { eintraege?: PendingEintrag[] }).eintraege)) {
      return (j as { eintraege: PendingEintrag[] }).eintraege;
    }
    // Alt-Form (ein Objekt, vor 8.8.2026) = Working-Tree-Quittung.
    const alt = j as PendingEintrag;
    return alt?.hash ? [{ ...alt, modus: alt.modus ?? 'baum' }] : [];
  } catch {
    return []; // korrupt = kein Bestand, wird überschrieben
  }
}
const neu: PendingEintrag = {
  hash: r.hash,
  verdikt,
  quellePin: quelle,
  datum,
  dateien: r.dateien,
  modus,
  ...(modus === 'bereich' ? { bereich: r.bereich } : {}),
};
const eintraege = [...bestandLesen().filter((e) => (e.modus ?? 'baum') !== modus), neu];
writeFileSync(PENDING, JSON.stringify({ eintraege }, null, 2) + '\n', 'utf8');

// (2) Register-Zeile anhängen (dauerhafter Historien-Vermerk).
if (!existsSync(REGISTER)) {
  console.error(`gegenpruefung:ok: Register fehlt (${REGISTER}).`);
  process.exit(1);
}
const engineZelle = modus === 'bereich' ? `${engine} (committeter Bereich ${r.bereich})` : engine;
const zeile = `| ${datum} | ${zelle(engineZelle)} | ${r.hash} | ${zelle(verdikt)} | ${zelle(quelle)} | ${zelle(notiz)} |\n`;
// Sicherstellen, dass die Tabelle auf einer neuen Zeile beginnt.
const bestand = readFileSync(REGISTER, 'utf8');
appendFileSync(REGISTER, (bestand.endsWith('\n') ? '' : '\n') + zeile, 'utf8');

console.log(
  `gegenpruefung:ok — quittiert (${modus === 'bereich' ? `committeter Bereich ${r.bereich}` : 'Working Tree'}): ` +
    `Verdikt «${verdikt}», Hash ${r.hash.slice(0, 12)}…, ${r.dateien.length} Datei(en).`,
);
console.log(`  Pending: ${PENDING} (${eintraege.length} Eintrag/Einträge)`);
console.log(`  Register-Zeile angehängt (${datum} · ${engineZelle}).`);
if (modus === 'bereich') {
  console.log(
    '  Hinweis: check:merge-schutz (CI) verlangt zusätzlich einen «Gegenpruefung:»-Trailer\n' +
      '  im Commit und die committete Register-Zeile — andere Beweisform, gleiche Menge.',
  );
}
if (verdikt !== 'bestanden') {
  console.log('  Hinweis: Das Tor akzeptiert nur Verdikt «bestanden» als grün.');
}
