// ─── Hook-Deckung der MCP-Kanäle (QS-EFFIZIENZ 15.8.2026) ────────────────────
//
// ANLASS (Werkzeug-Analyse Befund 3): `tor-schutz.py` und `lese-schutz.py`
// hingen allein an den Matchern `Bash`/`Read`. Die Desktop-Commander-Werkzeuge
// erzielen dieselbe Wirkung unter anderem Namen und mit anderen Feldnamen —
// `start_process` (command) · `interact_with_process` (input) · `read_file`
// (path/length) · `read_multiple_files` (paths). Ohne Deckung fährt jedes
// Tor-Kommando durch eine Pipe und jeder Katastrophen-Read ungebremst durch.
//
// ZWEITER, TEURERER BEFUND — die Matcher-SYNTAX (§6.7): Claude Code
// (Bundle 2.1.220, Funktion `BFy`) behandelt einen Matcher, der nur aus
// `[A-Za-z0-9_|]` besteht, als LITERAL-Liste mit exakter Gleichheit — nicht als
// Regex. `deploy_to_vercel` ist aber nie gleich `mcp__<server>__deploy_to_vercel`.
// Der am 14.8.2026 gebaute `deploy-schutz`-Matcher konnte darum NIE feuern: ein
// Tor, das nicht scheitern kann. Erst ein Matcher mit Regex-Metazeichen nimmt
// den Regex-Zweig. Dieser Test friert beides ein — die Matcher-FORM und den
// Rot-Beweis der Adapter.
import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SETTINGS = JSON.parse(
  readFileSync(resolve(WURZEL, '.claude/settings.json'), 'utf8'),
) as { hooks: { PreToolUse: { matcher?: string; hooks: { command: string }[] }[] } };

/** Ruft einen Hook so auf, wie Claude Code ihn füttert: Tool-JSON auf stdin. */
function hook(skript: string, eingabe: unknown): number {
  const p = spawnSync('python3', [resolve(WURZEL, '.claude/hooks', skript)], {
    input: JSON.stringify(eingabe),
    cwd: WURZEL,
    encoding: 'utf8',
  });
  return p.status ?? -1;
}

describe('Matcher-Form für MCP-Werkzeuge', () => {
  // Nachbau des Literal-Zweigs aus BFy(): nur diese Zeichen → keine Regex.
  const NUR_LITERAL = /^[a-zA-Z0-9_|]+$/;

  it('kein PreToolUse-Matcher nennt ein MCP-Werkzeug in Literal-Form', () => {
    const kaputt = SETTINGS.hooks.PreToolUse.filter(
      (e) => e.matcher && NUR_LITERAL.test(e.matcher) && e.matcher.includes('_'),
    ).map((e) => e.matcher);
    // Unterstrich = MCP-Namenskonvention (`start_process`); die eingebauten
    // Werkzeuge heissen `Bash`, `Read`, `Task|Agent` — die bleiben literal.
    expect(kaputt).toEqual([]);
  });

  it('jeder MCP-Matcher ist auf `^mcp__…$` verankert', () => {
    const mcp = SETTINGS.hooks.PreToolUse.map((e) => e.matcher).filter(
      (m): m is string => !!m && m.includes('mcp__'),
    );
    expect(mcp.length).toBeGreaterThan(0);
    for (const m of mcp) expect(m.startsWith('^mcp__') && m.endsWith('$')).toBe(true);
  });

  it('die drei Schutz-Hooks sind an MCP-Kanäle verdrahtet', () => {
    const verdrahtet = (skript: string) =>
      SETTINGS.hooks.PreToolUse.some(
        (e) => e.matcher?.includes('mcp__') && e.hooks.some((h) => h.command.includes(skript)),
      );
    expect(verdrahtet('tor-schutz.py')).toBe(true);
    expect(verdrahtet('lese-schutz.py')).toBe(true);
    expect(verdrahtet('deploy-schutz.py')).toBe(true);
  });
});

describe('tor-schutz: MCP-Shell-Kanäle', () => {
  const dc = (tool: string, tool_input: unknown) => ({
    tool_name: `mcp__Desktop_Commander__${tool}`,
    tool_input,
  });

  it('blockt ein Tor-Kommando durch eine Pipe (start_process)', () => {
    expect(hook('tor-schutz.py', dc('start_process', { command: 'npm run lint | tail -5' }))).toBe(2);
  });

  it('blockt ein Tor-Kommando durch eine Pipe (interact_with_process, Feld `input`)', () => {
    expect(hook('tor-schutz.py', dc('interact_with_process', { pid: 1, input: 'npx tsc -b | head' }))).toBe(2);
  });

  it('blockt `git commit --amend` über den MCP-Kanal', () => {
    expect(hook('tor-schutz.py', dc('start_process', { command: 'git commit --amend -m x' }))).toBe(2);
  });

  it('lässt harmlose Kommandos durch', () => {
    expect(hook('tor-schutz.py', dc('start_process', { command: 'ls -la src' }))).toBe(0);
    expect(hook('tor-schutz.py', dc('interact_with_process', { pid: 1, input: 'print(df.head())' }))).toBe(0);
  });

  it('bleibt für Bash unverändert', () => {
    expect(hook('tor-schutz.py', { tool_name: 'Bash', tool_input: { command: 'npm run lint | tail' } })).toBe(2);
    expect(hook('tor-schutz.py', { tool_name: 'Bash', tool_input: { command: 'ls -la' } })).toBe(0);
  });
});

describe('lese-schutz: MCP-Lese- und Shell-Kanäle', () => {
  const dc = (tool: string, tool_input: unknown) => ({
    tool_name: `mcp__Desktop_Commander__${tool}`,
    tool_input,
  });
  const RIESE = 'public/materialien/register.json'; // ~1.9 MB, real im Repo

  it('blockt eine nie-direkt-zu-lesende Datei (read_file, Feld `path`)', () => {
    expect(hook('lese-schutz.py', dc('read_file', { path: 'golden/x.json' }))).toBe(2);
  });

  it('blockt den ungebremsten Riesen-Read und lässt den gebundenen durch', () => {
    expect(hook('lese-schutz.py', dc('read_file', { path: RIESE }))).toBe(2);
    expect(hook('lese-schutz.py', dc('read_file', { path: RIESE, offset: 0, length: 40 }))).toBe(0);
  });

  it('prüft jeden Pfad eines Bündels (read_multiple_files, Feld `paths`)', () => {
    expect(hook('lese-schutz.py', dc('read_multiple_files', { paths: ['package.json', 'golden/x.json'] }))).toBe(2);
    expect(hook('lese-schutz.py', dc('read_multiple_files', { paths: ['package.json'] }))).toBe(0);
  });

  it('blockt `cat` auf eine Werkzeug-Datei auch über die MCP-Shell', () => {
    expect(hook('lese-schutz.py', dc('start_process', { command: 'cat package-lock.json' }))).toBe(2);
    expect(hook('lese-schutz.py', dc('interact_with_process', { pid: 1, input: 'cat golden/a.json' }))).toBe(2);
    expect(hook('lese-schutz.py', dc('start_process', { command: 'wc -l package-lock.json' }))).toBe(0);
  });

  it('bleibt für Read und Bash unverändert', () => {
    expect(hook('lese-schutz.py', { tool_name: 'Read', tool_input: { file_path: 'golden/x.json' } })).toBe(2);
    expect(hook('lese-schutz.py', { tool_name: 'Read', tool_input: { file_path: RIESE } })).toBe(2);
    expect(hook('lese-schutz.py', { tool_name: 'Read', tool_input: { file_path: RIESE, limit: 20 } })).toBe(0);
    expect(hook('lese-schutz.py', { tool_name: 'Bash', tool_input: { command: 'cat golden/a.json' } })).toBe(2);
    expect(hook('lese-schutz.py', { tool_name: 'Bash', tool_input: { command: 'ls -la' } })).toBe(0);
  });

  it('fasst fremde Werkzeuge mit ähnlichem Namen nicht an', () => {
    // Google-Drive `read_file_content` o. Ä. — anderer Kanal, anderes Feld.
    const fremd = { tool_name: 'mcp__drive__read_file_content', tool_input: { file_id: 'golden/x.json' } };
    expect(hook('lese-schutz.py', fremd)).toBe(0);
  });
});
