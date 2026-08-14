import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// QS-HOOKS-AUSBAU (14.8.2026): Absicherung der zwei neuen Claude-Code-Hooks
// .claude/hooks/subagent-wache.py (SubagentStop, §14.7 durchsetzen) und
// .claude/hooks/abschluss-wache.py (SessionEnd/--start, §17-Nachlass über die
// Session-Grenze). Die Hooks laufen als eigenständige Python-Prozesse; hier
// werden sie per execFileSync mit synthetischem stdin-JSON gefahren und
// Exit-Code/stdout/stderr geprüft — nach dem Muster von dispatch-klausel.test.ts
// (Fixtures statt Live-Dispatch, weil ein echter Sub-Agenten-Lauf hier nicht
// verfügbar ist).
//
// WICHTIG (Isolation): CLAUDE_PROJECT_DIR zeigt für jeden Testlauf auf ein
// frisches tmp-Verzeichnis, damit die Merkdatei .subagent-wache-gemahnt und
// .session-nachlass.json NIE im echten Repo landen. Aufräumen nach jedem Test.

const SUBAGENT_WACHE = join(process.cwd(), '.claude/hooks/subagent-wache.py');
const ABSCHLUSS_WACHE = join(process.cwd(), '.claude/hooks/abschluss-wache.py');

let tmpDirs: string[] = [];

function neuesTmpDir(): string {
  const d = mkdtempSync(join(tmpdir(), 'hooks-wache-'));
  tmpDirs.push(d);
  return d;
}

afterEach(() => {
  for (const d of tmpDirs) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      // Aufräumfehler ignorieren — tmp-Verzeichnis, kein Produktivstand.
    }
  }
  tmpDirs = [];
});

interface Lauf {
  status: number;
  stdout: string;
  stderr: string;
}

/** Führt einen der Hooks als Python-Prozess aus; Exit-Code wird nie geworfen. */
function laufe(skript: string, projektDir: string, stdinJson: string, args: string[] = []): Lauf {
  try {
    const stdout = execFileSync('python3', [skript, ...args], {
      input: stdinJson,
      env: { ...process.env, CLAUDE_PROJECT_DIR: projektDir },
      encoding: 'utf8',
    });
    return { status: 0, stdout, stderr: '' };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { status: err.status ?? -1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

describe('subagent-wache.py — SubagentStop-Hook (§14.7)', () => {
  function bericht(agentType: string, agentId: string, message: string): string {
    return JSON.stringify({
      hook_event_name: 'SubagentStop',
      agent_id: agentId,
      agent_type: agentType,
      last_assistant_message: message,
    });
  }

  it('(a) Erfolg ohne Artefakt bei lex-bau → exit 2, stderr trägt §14.7', () => {
    const dir = neuesTmpDir();
    const r = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-bau', 'agent-a', 'Erledigt, alles grün.'),
    );
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('§14.7');
  });

  it('(b) dieselbe agent_id ein zweites Mal → exit 0 (Einmal-Mahnung)', () => {
    const dir = neuesTmpDir();
    const erster = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-bau', 'agent-b', 'Erledigt, alles grün.'),
    );
    expect(erster.status).toBe(2); // Vorbedingung: erste Mahnung greift wie in (a)

    const zweiter = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-bau', 'agent-b', 'Erledigt, alles grün.'),
    );
    expect(zweiter.status).toBe(0);
  });

  it('(c) Erfolg MIT Commit-SHA → exit 0', () => {
    const dir = neuesTmpDir();
    const r = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-bau', 'agent-c', 'Erledigt. Commit-SHA: a1b2c3d4e5f6.'),
    );
    expect(r.status).toBe(0);
  });

  it('(d) agent_type lex-recherche (read-only) → exit 0', () => {
    const dir = neuesTmpDir();
    const r = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-recherche', 'agent-d', 'Erledigt, alles grün.'),
    );
    expect(r.status).toBe(0);
  });

  it('(e) Bericht mit «blockiert» → exit 0', () => {
    const dir = neuesTmpDir();
    const r = laufe(
      SUBAGENT_WACHE,
      dir,
      bericht('lex-bau', 'agent-e', 'Blockiert: Norm-Anker liess sich nicht verifizieren.'),
    );
    expect(r.status).toBe(0);
  });

  it('(f) kaputtes JSON auf stdin → exit 0', () => {
    const dir = neuesTmpDir();
    const r = laufe(SUBAGENT_WACHE, dir, '{ das ist kein JSON');
    expect(r.status).toBe(0);
  });
});

describe('abschluss-wache.py — SessionEnd/--start-Hook (§17)', () => {
  it('(g) --start ohne Nachlass-Datei → exit 0, kein stdout', () => {
    const dir = neuesTmpDir();
    const r = laufe(ABSCHLUSS_WACHE, dir, '', ['--start']);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  it('(h) --start mit vorhandenem Nachlass → druckt NACHLASS-WACHE und löscht die Datei; zweiter Lauf still', () => {
    const dir = neuesTmpDir();
    const nachlassPfad = join(dir, '.session-nachlass.json');
    writeFileSync(
      nachlassPfad,
      JSON.stringify({
        end_reason: 'clear',
        branch: 'x',
        uncommitted: ['M a'],
        unpushed: [],
        wip: ['QS-X'],
      }),
    );

    const erster = laufe(ABSCHLUSS_WACHE, dir, '', ['--start']);
    expect(erster.status).toBe(0);
    expect(erster.stdout).toContain('NACHLASS-WACHE');
    expect(existsSync(nachlassPfad)).toBe(false);

    const zweiter = laufe(ABSCHLUSS_WACHE, dir, '', ['--start']);
    expect(zweiter.status).toBe(0);
    expect(zweiter.stdout).toBe('');
  });

  it('SessionEnd-Default-Modus misst gegen ein Mini-git-Repo und schreibt den Nachlass (nie gegen das echte Repo)', () => {
    const dir = neuesTmpDir();
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: dir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });

    writeFileSync(
      join(dir, 'ROADMAP.md'),
      '# Roadmap\n\n<!-- @meta id: QS-TEST · status: wip -->\n',
    );
    execFileSync('git', ['add', 'ROADMAP.md'], { cwd: dir });
    execFileSync('git', ['commit', '-q', '-m', 'init'], { cwd: dir });

    // Uncommittete Änderung, damit auch der git-Zweig des Nachlasses greift.
    writeFileSync(join(dir, 'unstaged.txt'), 'x\n');

    const r = laufe(ABSCHLUSS_WACHE, dir, JSON.stringify({ end_reason: 'other' }));
    expect(r.status).toBe(0);

    const nachlassPfad = join(dir, '.session-nachlass.json');
    expect(existsSync(nachlassPfad)).toBe(true);
    const nachlass = JSON.parse(readFileSync(nachlassPfad, 'utf8'));
    expect(nachlass.wip).toContain('QS-TEST');
    expect(nachlass.uncommitted.length).toBeGreaterThan(0);
  });
});
