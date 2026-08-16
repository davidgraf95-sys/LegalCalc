import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// QS-AUTOMATIK (16.8.2026) — Tor über den Vercel-`ignoreCommand`.
//
// ANLASS (belegt, kein Vorsorge-Tor): seit PR #519 war JEDES Prod-Deployment auf
// main CANCELED — sieben gemergte PRs (#520, #512, #521, #524, #529, #523, #530)
// gingen nie live. Ursache im Vercel-Build-Log des Merge-Commits 1d571c6ed:
// `git rev-parse --verify <voller 40-Hex-SHA>` liefert Exit 0 AUCH DANN, wenn das
// Objekt gar nicht vorhanden ist (Vercel klont shallow, VERCEL_GIT_PREVIOUS_SHA
// liegt regelmässig ausserhalb der Tiefe). Das nachfolgende `git diff` starb mit
// «fatal: bad object», grep sah keine Zeile, und das führende `!` drehte das zu
// Exit 0 = «Build überspringen».
//
// FEHLERKLASSE: ein Tor, das bei UNSICHERHEIT «skip» statt «bauen» sagt. Die
// Regel lautet darum seit 16.8.2026: nur überspringen, wenn alles sicher ist —
// jede Unsicherheit (kein SHA, kein Objekt, Diff-Fehler, leerer Diff) ⇒ bauen.
//
// Der Test fährt den ECHTEN String aus vercel.json (nicht abgetippt) gegen ein
// wegwerfbares git-Repo. Reine Betriebs-Prüfung, kein Rechts-/Rechen-/Norm-Pfad.

const WURZEL = new URL('../../', import.meta.url).pathname;
const IGNORE_COMMAND: string = JSON.parse(
  readFileSync(join(WURZEL, 'vercel.json'), 'utf8'),
).ignoreCommand;

/** Nicht existierender, wohlgeformter 40-Hex-SHA — genau die Live-Bedingung. */
const FEHLENDER_SHA = 'ffffffffffffffffffffffffffffffffffffffff';

let repo: string;
let dokuPrev = '';
let codePrev = '';
let kopf = '';

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
}

function commit(nachricht: string): void {
  git('add', '-A');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--quiet', '-m', nachricht);
}

/** Fährt den ignoreCommand wie Vercel: Exit 0 = Build überspringen, Exit 1 = bauen. */
function fahre(ref: string, previousSha: string, kommando = IGNORE_COMMAND): number {
  const r = spawnSync('bash', ['-c', kommando], {
    cwd: repo,
    env: { ...process.env, VERCEL_GIT_COMMIT_REF: ref, VERCEL_GIT_PREVIOUS_SHA: previousSha },
    encoding: 'utf8',
  });
  return r.status ?? 1;
}

const SKIP = 0;
const BAUEN = 1;

beforeAll(() => {
  repo = mkdtempSync(join(tmpdir(), 'lexmetrik-ignorecmd-'));
  git('init', '--quiet', '-b', 'main');
  writeFileSync(join(repo, 'vite.config.ts'), '// start\n');
  writeFileSync(join(repo, 'ROADMAP.md'), 'start\n');
  commit('start');
  // Code-Commit zuerst, Doku-Commit zuletzt: der ignoreCommand vergleicht immer
  // gegen HEAD, darum muss der Doku-Fall der JÜNGSTE sein (sonst zieht er den
  // Code-Commit mit in den Diff — genau das hat der erste Testlauf gefangen).
  appendFileSync(join(repo, 'vite.config.ts'), '// mehr\n');
  commit('code');
  // Doku-only-Commit: eine .md-Datei und ein Pfad aus der Skip-Liste.
  appendFileSync(join(repo, 'ROADMAP.md'), 'mehr\n');
  mkdirSync(join(repo, 'docs/betrieb'), { recursive: true });
  writeFileSync(join(repo, 'docs/betrieb/notiz.md'), 'x\n');
  commit('doku');
  dokuPrev = git('rev-parse', 'HEAD~1'); // Diff gegen HEAD = nur .md/docs
  codePrev = git('rev-parse', 'HEAD~2'); // Diff gegen HEAD = enthält vite.config.ts
  kopf = git('rev-parse', 'HEAD');
});

afterAll(() => {
  if (repo) rmSync(repo, { recursive: true, force: true });
});

describe('vercel.json ignoreCommand — «bei Unsicherheit bauen»', () => {
  it('Mechanismus des Ausfalls: rev-parse --verify sagt bei FEHLENDEM Objekt Exit 0', () => {
    // Das ist die Falle, die sieben Deployments verschluckt hat — hier festgenagelt,
    // damit niemand versehentlich wieder auf rev-parse --verify zurückbaut.
    const revParse = spawnSync('git', ['rev-parse', '--verify', FEHLENDER_SHA], { cwd: repo });
    expect(revParse.status).toBe(0);
    // cat-file -e prüft dagegen die tatsächliche Objekt-Existenz.
    const catFile = spawnSync('git', ['cat-file', '-e', `${FEHLENDER_SHA}^{commit}`], { cwd: repo });
    expect(catFile.status).not.toBe(0);
  });

  it('(a→b) PREVIOUS_SHA nicht im Klon (shallow) ⇒ BAUEN, nicht überspringen', () => {
    expect(fahre('main', FEHLENDER_SHA)).toBe(BAUEN);
  });

  it('(c) nur Doku-Diff ⇒ überspringen', () => {
    expect(fahre('main', dokuPrev)).toBe(SKIP);
  });

  it('(d) Code-Diff ⇒ bauen', () => {
    expect(fahre('main', codePrev)).toBe(BAUEN);
  });

  it('Branch ≠ main ⇒ überspringen (Preview-Deploys unberührt)', () => {
    expect(fahre('feat/beliebig', codePrev)).toBe(SKIP);
  });

  it('PREVIOUS_SHA leer (erster Deploy) ⇒ bauen', () => {
    expect(fahre('main', '')).toBe(BAUEN);
  });

  it('leerer Diff (Redeploy desselben Commits) ⇒ bauen', () => {
    expect(fahre('main', kopf)).toBe(BAUEN);
  });

  it('Rot-Beweis §6.7: der ALTE Command fällt bei genau diesen Eingaben durch', () => {
    const alt =
      '[ "$VERCEL_GIT_COMMIT_REF" != "main" ] && exit 0; B=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}; ' +
      'git rev-parse --verify "$B" >/dev/null 2>&1 || exit 1; ' +
      "! git diff --name-only \"$B\" HEAD | grep -qvE '\\.md$|^(bibliothek|archiv|docs|\\.claude)/'";
    // Fehlendes Objekt: der alte Command überspringt (= der Live-Ausfall) …
    expect(fahre('main', FEHLENDER_SHA, alt)).toBe(SKIP);
    // … und auch der Redeploy mit leerem Diff wurde still verschluckt.
    expect(fahre('main', kopf, alt)).toBe(SKIP);
    // Der neue Command baut in beiden Fällen — das Tor kann also scheitern.
    expect(fahre('main', FEHLENDER_SHA)).toBe(BAUEN);
    expect(fahre('main', kopf)).toBe(BAUEN);
  });
});
