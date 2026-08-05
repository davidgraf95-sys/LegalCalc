// scripts/plan/lage.ts — Lage-Block für `plan:next`.
//
// Zweck (Bauplan-Review 4.8.2026, Umsetzungs-Ziff. 4a in
// fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md): Jede startende Session soll sehen,
// WAS gerade im Bau ist, ohne dass dafür ein SessionStart-Hook nötig wäre — der
// wäre git-zustandsabhängig und zerstörte den Prompt-Cache (Entscheid QS-TOK/T19).
// `plan:next` ist laut CLAUDE.md ohnehin der Pflicht-Einstieg jeder Session.
//
// Drei Bauregeln dieser Datei:
//
//  * **Nie crashen, immer degradieren (§8).** git/gh können fehlen, hängen oder
//    ohne Netz scheitern. Jeder Ausfall wird eingesammelt und als EINE
//    Hinweiszeile gezeigt — der Rest der Ausgabe bleibt stehen.
//  * **Netzfrei per Default.** `gh pr list` läuft nur mit `--prs`.
//  * **Nichts Bestehendes verschieben.** Der Block wird an die vorhandene
//    `plan:next`-Ausgabe angehängt; zieht man die neuen Zeilen ab, ist sie
//    byte-identisch zu vorher.
//
// Warum eigener Kommando-Runner statt `sh()` aus bildDaten.ts: (a) dieser Block
// braucht ein hartes Timeout (`gh` ohne Netz hängt sonst am Pflicht-Einstieg),
// das `sh()` nicht kennt; (b) `plan:next` bliebe sonst nicht mehr importfrei
// gegenüber dem `src/lib/startseiteConfig`-Graphen, den bildDaten mitzieht —
// ein Defekt dort dürfte den Pflicht-Einstieg nicht mitreissen. Geteilt wird
// hier nur fachneutrale Infrastruktur, keine Plan-Wahrheit (§4/§5): die
// Schritt-Daten kommen unverändert aus parse.ts/aufloesen.ts.

import { execFileSync } from 'node:child_process';
import { type Einheit } from './parse';

/** Ein `wip`-Schritt mit den von ihm belegten Flächen (`kollision:`-Globs). */
export interface WipFlaeche {
  id: string;
  kollision: string[];
}

/** Ein Bau-Platz aus `git worktree list --porcelain`. */
export interface BauPlatz {
  /** Letztes Pfadsegment — so heisst der Platz im Alltag. */
  name: string;
  /** Ausgecheckter Branch, `null` bei detached HEAD. */
  branch: string | null;
  /** Erster Eintrag der Porcelain-Ausgabe = das Haupt-Repo, kein Bau-Platz. */
  haupt: boolean;
}

export interface PrKurz {
  number: number;
  headRefName: string;
  titel: string;
}

/** Rohdaten des Lage-Blocks. `null` heisst «Quelle ausgefallen», nie «leer». */
export interface LageRoh {
  wip: WipFlaeche[];
  worktrees: BauPlatz[] | null;
  branches: string[] | null;
  prs: PrKurz[] | null;
  /** War `--prs` gesetzt? Trennt «nicht gefragt» von «gefragt, ausgefallen». */
  prsGewuenscht: boolean;
  /** Namen der ausgefallenen Quellen, für die eine Hinweiszeile. */
  ausfaelle: string[];
}

/** Kommando-Ausführung; wirft bei Fehler, Timeout oder fehlendem Programm. */
export type Laufe = (cmd: string, args: string[]) => string;

const TIMEOUT_MS = 5000;

export const laufeEcht: Laufe = (cmd, args) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: TIMEOUT_MS });

/**
 * Schritt-ID → Namensbestandteil für Branches und Worktrees.
 *
 * Namenskonvention seit 5.8.2026 (Dispatch-§0 Ziff. 5, Skill `auftrag` Ziff. 2):
 * Branch bzw. Worktree trägt den Slug seines Schritts. Deckungsgleich mit der
 * Slug-Bildung der wip-Verstoss-Sonde in bildSeiten.ts; die Rand-Trimmung ist
 * zusätzlich, greift bei den bestehenden IDs aber nie (keine ID beginnt oder
 * endet mit einem Nicht-Alphanumerischen).
 */
export function slug(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Ordnet einem Branch-/Worktree-/PR-Namen einen Schritt zu — `null`, wenn
 * keiner passt («ohne Schritt-Bezug»; genau das ist das Signal für
 * unangemeldeten Bau).
 *
 * Der LÄNGSTE passende Slug gewinnt, bei Gleichstand der lexikografisch
 * kleinere: sonst entschiede die Reihenfolge der ROADMAP darüber, ob
 * `feat/qs-code-turso` als `QS-CODE` oder `QS-CODE-TURSO` gilt.
 */
export function schrittFuerNamen(name: string, ids: string[]): string | null {
  const n = name.toLowerCase();
  let treffer: string | null = null;
  let laenge = -1;
  for (const id of ids) {
    const s = slug(id);
    if (!s || !n.includes(s)) continue;
    if (s.length > laenge || (s.length === laenge && treffer !== null && id < treffer)) {
      treffer = id;
      laenge = s.length;
    }
  }
  return treffer;
}

/** `git worktree list --porcelain` → Bau-Plätze. Erster Block ist das Haupt-Repo. */
export function parseWorktrees(porcelain: string): BauPlatz[] {
  return porcelain
    .split('\n\n')
    .map((block) => ({ pfad: block.match(/^worktree (.+)$/m)?.[1] ?? '', block }))
    .filter((x) => x.pfad !== '')
    .map(({ pfad, block }, lfd) => ({
      name: pfad.split('/').filter(Boolean).pop() ?? pfad,
      branch: block.match(/^branch refs\/heads\/(.+)$/m)?.[1] ?? null,
      haupt: lfd === 0,
    }));
}

/** wip-Schritte des Resolvers mit ihren Flächen anreichern. */
export function wipFlaechen(einheiten: Einheit[], inArbeit: string[]): WipFlaeche[] {
  return inArbeit.map((id) => ({
    id,
    kollision: einheiten.find((e) => e.id === id)?.etikett.kollision ?? [],
  }));
}

/** Erhebt die Lage. Kein Wurf nach aussen — Ausfälle landen in `ausfaelle`. */
export function sammleLage(
  wip: WipFlaeche[],
  opt: { prs: boolean; laufe?: Laufe } = { prs: false },
): LageRoh {
  const laufe = opt.laufe ?? laufeEcht;
  const ausfaelle: string[] = [];

  let worktrees: BauPlatz[] | null = null;
  try {
    worktrees = parseWorktrees(laufe('git', ['worktree', 'list', '--porcelain']));
  } catch {
    ausfaelle.push('git worktree list');
  }

  let branches: string[] | null = null;
  try {
    branches = laufe('git', ['branch', '--format=%(refname:short)']).split('\n').map((b) => b.trim()).filter(Boolean);
  } catch {
    ausfaelle.push('git branch');
  }

  let prs: PrKurz[] | null = null;
  if (opt.prs) {
    try {
      const roh = laufe('gh', ['pr', 'list', '--state', 'open', '--json', 'number,headRefName,title', '--limit', '30']);
      prs = (JSON.parse(roh) as { number: number; headRefName: string; title: string }[])
        .map((p) => ({ number: p.number, headRefName: p.headRefName, titel: p.title }));
    } catch {
      prs = null;
      ausfaelle.push('gh pr list');
    }
  }

  return { wip, worktrees, branches, prs, prsGewuenscht: opt.prs, ausfaelle };
}

const TRENNER = ' · ';

function bezug(name: string, ids: string[]): string {
  const id = schrittFuerNamen(name, ids);
  return id ? `${name} → ${id}` : `${name} → ohne Schritt-Bezug`;
}

/**
 * Formatiert den Lage-Block. Reine Funktion über `LageRoh` — deshalb im Test
 * ohne git/gh prüfbar.
 */
export function lageZeilen(roh: LageRoh, ids: string[]): string[] {
  const z: string[] = ['', '── Lage: was gerade im Bau ist (Sichtbarkeit für Parallel-Sessions) ──'];

  if (roh.wip.length === 0) {
    z.push('🔨 belegte Flächen (wip): — (kein Schritt auf wip)');
  } else {
    z.push('🔨 belegte Flächen (wip):');
    for (const w of roh.wip) {
      const flaechen = w.kollision.length ? w.kollision.join(', ') : 'keine kollision: deklariert → gilt als GESAMTE Fläche';
      z.push(`   ${w.id} → ${flaechen}`);
    }
  }

  // Worktrees: das Haupt-Repo ist kein Bau-Platz. Zugeordnet wird über
  // Platzname UND Branch — der Platz heisst bei Agenten-Worktrees «agent-<hash>»,
  // den Schritt-Slug trägt dann der ausgecheckte Branch.
  const plaetze = (roh.worktrees ?? []).filter((w) => !w.haupt);
  if (roh.worktrees === null) {
    z.push('🌳 Worktrees: — (nicht abfragbar)');
  } else if (plaetze.length === 0) {
    z.push('🌳 Worktrees: — (nur das Haupt-Repo)');
  } else {
    z.push(
      `🌳 Worktrees: ${plaetze
        .map((w) => `${bezug(`${w.name}${w.branch ? ` [${w.branch}]` : ' [detached]'}`, ids)}`)
        .join(TRENNER)}`,
    );
  }

  // Branches, die schon als Worktree-Zeile stehen, hier nicht doppeln.
  const inWorktree = new Set(plaetze.map((w) => w.branch).filter((b): b is string => b !== null));
  const uebrig = (roh.branches ?? []).filter((b) => b !== 'main' && !inWorktree.has(b));
  if (roh.branches === null) {
    z.push('🌿 Branches: — (nicht abfragbar)');
  } else if (uebrig.length === 0) {
    z.push('🌿 weitere Branches (ohne Worktree): —');
  } else {
    z.push(`🌿 weitere Branches (ohne Worktree): ${uebrig.map((b) => bezug(b, ids)).join(TRENNER)}`);
  }

  if (!roh.prsGewuenscht) {
    z.push('🔀 offene PRs: nicht abgefragt (netzfrei per Default — mit `--prs` anfordern)');
  } else if (roh.prs === null) {
    z.push('🔀 offene PRs: — (nicht abfragbar)');
  } else if (roh.prs.length === 0) {
    z.push('🔀 offene PRs: — (keine)');
  } else {
    z.push('🔀 offene PRs:');
    for (const p of roh.prs) z.push(`   #${p.number} ${bezug(p.headRefName, ids)} — ${p.titel}`);
  }

  if (roh.ausfaelle.length) {
    z.push(`⚠️  Lage unvollständig — nicht abfragbar: ${roh.ausfaelle.join(TRENNER)} (kein Fehler des Plans)`);
  }
  return z;
}

/** Ein Aufruf für die CLI: erheben und formatieren. */
export function lageBlock(
  einheiten: Einheit[],
  inArbeit: string[],
  opt: { prs: boolean; laufe?: Laufe },
): string[] {
  const roh = sammleLage(wipFlaechen(einheiten, inArbeit), opt);
  return lageZeilen(roh, einheiten.map((e) => e.id));
}
