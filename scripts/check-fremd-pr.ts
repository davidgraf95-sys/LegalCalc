// scripts/check-fremd-pr.ts — Fremd-PR-Tor für Jules-Branches (T6, 3.9.2026).
//
// WARUM: T6 (Tabu-Probe) zeigte, dass `AGENTS.md` als Prosa-Zaun nicht hält
// (0 von 1 Ablehnungen) — Jules änderte auf Zuruf eine Assertion samt
// Produktionswert, statt den Test unverändert zu lassen. Der Schutz muss aus
// einem Tor kommen, nicht aus einem Text, den ein Agent lesen — oder
// überschreiben — kann (`fahrplaene/FAHRPLAN-FREMDAGENTEN.md` §2 Phase 1).
//
// ZUSTÄNDIGKEIT: Nur Branches im Jules-Muster (endet auf `-` + 19 Ziffern,
// z. B. `jules/relax-min-height-test-16624704437205943962`). Für jeden
// anderen Branch meldet das Skript «nicht zuständig» und Exit 0 — die
// Risikopfad-Prüfung selbst deckt bereits `check:merge-schutz` ab (nicht
// duplizieren, CLAUDE.md §5).
//
// ZWEI REGELN, BEIDE MÜSSEN GRÜN SEIN:
//   (1) Assertion-Diff (`scripts/analyse/test-assertion-diff.ts`) zwischen
//       der Basis und HEAD unter `src/tests/` muss Exit 0 liefern — Jules darf
//       Tests VERSCHIEBEN, nie ÄNDERN (Testnamen/describe/expect-Multimengen
//       identisch).
//   (2) Keine geänderte Datei ausserhalb `src/**` — Jules rührt nie CI-
//       Konfiguration, Skripte, Steuer-Doku, Fahrpläne, Bibliothek, `.claude/`,
//       Normtext-Snapshots oder Daten an.
//
// BASIS: merge-base(origin/main, HEAD) — nicht der aktuelle origin/main-Tip.
// Dieselbe Begründung wie in `check-merge-schutz.ts`: ein PR wird gegen den
// Stand geprüft, von dem er abgezweigt ist, nicht gegen einen main, der seither
// unabhängig weitergelaufen ist (sonst false positives durch main-Drift, die
// nichts mit dem Jules-Diff zu tun haben). Für den in Auftrag genannten
// Normalfall (Basis frisch, main hat sich seit dem Branch-Punkt nicht
// bewegt) ist das identisch mit einem literalen `origin/main`.
//
// BRANCH-ERKENNUNG: `GITHUB_HEAD_REF` (von GitHub Actions bei `pull_request`
// gesetzt) hat Vorrang; lokal (Rot-Beweis, Simulation) fällt das Skript auf
// `git rev-parse --abbrev-ref HEAD` zurück.
//
// EXIT 0: nicht zuständig (kein Jules-Branch) ODER beide Regeln grün.
// EXIT 1: mindestens eine Regel verletzt.
// EXIT 2: Basis nicht auflösbar (kein `git fetch origin` möglich/erfolgt) —
//         ein Tor ohne Referenz ist kein Tor (§6.7).
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

// ── Regel 1: Assertion-Diff ─────────────────────────────────────────────────
let assertionExit = 0;
let assertionAusgabe = '';
try {
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

// ── Regel 2: Dateigrenzen ────────────────────────────────────────────────────
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
