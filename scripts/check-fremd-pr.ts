// scripts/check-fremd-pr.ts — Fremd-PR-Tor für Jules-Branches (T6 3.9.2026:
// AGENTS.md hielt als Prosa-Zaun nicht, 0/1 Ablehnungen — Schutz muss aus
// Tor/Review kommen). Details: fahrplaene/FAHRPLAN-FREMDAGENTEN.md §2 Ph.1.
// Nur Branches im Jules-Muster (endet `-`+19 Ziffern) sind zuständig, sonst
// Exit 0 "nicht zuständig" (Risikopfade deckt check:merge-schutz bereits ab).
// Regel 1: Assertion-Diff (scripts/analyse/test-assertion-diff.ts) unter
// src/tests/ gegen merge-base(origin/main,HEAD) muss Exit 0 sein — Jules darf
// Tests verschieben, nie ändern. Regel 2: keine geänderte Datei ausserhalb
// src/**. Branch aus GITHUB_HEAD_REF (CI) oder HEAD (lokaler Rot-Beweis).
// Exit 0 nicht zuständig/grün · Exit 1 Regelverstoss · Exit 2 Basis fehlt.
import { execFileSync } from 'node:child_process';

const JULES_MUSTER = /-\d{19}$/;
const BASIS_REF = process.env.FREMD_PR_BASIS ?? 'origin/main';

function git(args: string[]): string {
  return execFileSync('git', args, {
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 64 * 1024 * 1024,
  }).toString('utf8');
}

function raus(code: number, text: string): never {
  console.log(text);
  process.exit(code);
}

function aktuellerBranch(): string {
  const env = process.env.GITHUB_HEAD_REF;
  if (env && env.trim().length > 0) return env.trim();
  return git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
}

const branch = aktuellerBranch();

if (!JULES_MUSTER.test(branch)) {
  raus(0, `check:fremd-pr — nicht zuständig (Branch "${branch}" ` +
    `passt nicht auf das Jules-Muster \`*-<19 Ziffern>\`). Exit 0.`);
}

let basis: string;
try {
  basis = git(['merge-base', BASIS_REF, 'HEAD']).trim();
} catch {
  raus(2, `check:fremd-pr ROT — Referenz '${BASIS_REF}' nicht auflösbar ` +
    `(Branch "${branch}" ist ein Jules-Kandidat). Erst 'git fetch origin', ` +
    `dann erneut. (Kein stiller Skip: ein Tor ohne Referenz ist kein Tor.)`);
}

const befunde: string[] = [];

// Regel 1: Assertion-Diff
let assertionExit: number;
let assertionAusgabe: string;
try {
  assertionExit = 0;
  assertionAusgabe = execFileSync(
    'npx',
    ['vite-node', 'scripts/analyse/test-assertion-diff.ts', basis, 'HEAD', 'src/tests/'],
    { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
  ).toString('utf8');
} catch (fehler) {
  const e = fehler as { status?: number; stdout?: Buffer; stderr?: Buffer };
  assertionExit = e.status ?? 1;
  assertionAusgabe = `${e.stdout?.toString('utf8') ?? ''}${e.stderr?.toString('utf8') ?? ''}`;
}

if (assertionExit === 2) {
  raus(2, `check:fremd-pr ROT — test-assertion-diff.ts konnte seine Referenz ` +
    `nicht bilden (Basis ${basis.slice(0, 8)}). Ausgabe:\n${assertionAusgabe}`);
}
if (assertionExit !== 0) {
  befunde.push(
    `Assertion-Diff (Regel 1): Testnamen/describe/expect-Multimengen unter ` +
    `\`src/tests/\` weichen zwischen Basis (${basis.slice(0, 8)}) und HEAD ab ` +
    `— Jules darf Tests verschieben, nie ändern (AGENTS.md §3).\n${assertionAusgabe}`,
  );
}

// Regel 2: Dateigrenzen
const geaendert = git(['diff', '--name-only', `${basis}..HEAD`])
  .split('\n')
  .map((z) => z.trim())
  .filter(Boolean);

const ausserhalb = geaendert.filter((p) => !p.startsWith('src/'));

if (ausserhalb.length > 0) {
  const liste = ausserhalb.map((p) => `    ${p}`).join('\n');
  befunde.push(
    `Dateigrenzen (Regel 2): ${ausserhalb.length} Datei(en) ausserhalb \`src/**\` ` +
    `geändert — Jules-Branches dürfen nur unter \`src/**\` schreiben:\n${liste}`,
  );
}

if (befunde.length > 0) {
  raus(1, `check:fremd-pr ROT — Branch "${branch}" (Jules-Muster) verletzt ` +
    `${befunde.length} Regel(n) gegen Basis ${basis.slice(0, 8)}:\n\n` +
    befunde.join('\n\n'));
}

raus(0, `check:fremd-pr grün — Branch "${branch}" (Jules-Muster) hält ` +
  `Assertion-Diff und Dateigrenzen gegen Basis ${basis.slice(0, 8)} ` +
  `(${geaendert.length} Datei(en) geändert, alle unter src/**).`);
