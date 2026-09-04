// scripts/analyse/fremdagenten-messung.ts — Jules-Messwerte automatisch ziehen
// (Fix 8, Abnahme QS-FREMDAGENTEN 4.9.2026, Skill `auftrag` Ziff. 4 Punkt 7).
//
// Bisher wurden Ticket→PR-Zeiten von Hand aus GitHub abgelesen und in
// `fahrplaene/FAHRPLAN-FREMDAGENTEN.md` §5 eingetragen — fehleranfällig und
// Handarbeit bei jedem neuen Pilot. Dieses Skript zieht dieselben Werte
// deterministisch aus `gh`.
//
// KEIN CHECK, KEIN CI-SCHRITT: reiner Netzdienst (GitHub API über `gh`),
// darum bewusst ohne «check» im Namen (sonst griffe die Prüflogik-Ausnahme,
// FAHRPLAN §2 Phase 2) und nicht in `.github/workflows/ci.yml` verdrahtet.
//
// Ablauf: `gh pr list --state merged --limit 200 --json
// number,headRefName,createdAt,mergedAt,body,title` liefert die gemergten
// PRs; Jules-Branches per Muster (identisch mit Skill `landung`
// §«Fremde PRs» und CI-Step «Fremd-PR-Tor», 4.9.2026): 19-stellige Task-ID
// irgendwo im Branch-Namen ODER Präfix `jules-`/`jules/`. Aus dem PR-Body
// wird die referenzierte Issue-Nummer gelesen (`Fixes #N` / `Closes #N` /
// nackte `#N`), `gh issue view N --json createdAt` liefert den
// Issue-Zeitpunkt, die Differenz zu `pr.createdAt` ist die Ticket→PR-Dauer
// in Minuten. Spalte «Nacharbeit» bleibt manuell (kein automatisch
// prüfbares Merkmal) — Hinweiszeile am Tabellenende.
//
// Aufruf: npx vite-node scripts/analyse/fremdagenten-messung.ts [--seit YYYY-MM-DD]
//   --seit filtert auf PRs, die an/nach diesem Datum gemergt wurden (UTC).
//
// Exit 0 immer bei technisch gelungenem Lauf (auch bei 0 Treffern) — dies ist
// ein Mess-, kein Prüfwerkzeug. Exit 1 bei Aufruffehler (z. B. `gh` fehlt)
// oder ungültigem `--seit`.

import { execFileSync } from 'node:child_process';

const JULES_MUSTER = /[0-9]{19}|^jules[-/]/;

type PrRoh = {
  number: number;
  headRefName: string;
  createdAt: string;
  mergedAt: string | null;
  body: string | null;
  title: string;
};

type Messwert = {
  pr: number;
  issue: number | null;
  branch: string;
  issueErstellt: string | null;
  prErstellt: string;
  dauerMin: number | null;
  titel: string;
};

function gh(args: string[]): string {
  return execFileSync('gh', args, {
    maxBuffer: 1024 * 1024 * 64,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

function issueNummerAusBody(body: string | null): number | null {
  if (!body) return null;
  const schluessel = body.match(/(?:fixes|closes|resolves)\s+#(\d+)/i);
  if (schluessel) return Number(schluessel[1]);
  const nackt = body.match(/#(\d+)/);
  return nackt ? Number(nackt[1]) : null;
}

function issueErstellt(nr: number): string | null {
  try {
    const roh = gh(['issue', 'view', String(nr), '--json', 'createdAt']);
    const daten = JSON.parse(roh) as { createdAt: string };
    return daten.createdAt;
  } catch {
    return null;
  }
}

function dauerMinuten(von: string, bis: string): number {
  return Math.round((new Date(bis).getTime() - new Date(von).getTime()) / 60000);
}

function median(werte: number[]): number | null {
  if (werte.length === 0) return null;
  const sortiert = [...werte].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 === 0
    ? Math.round((sortiert[mitte - 1] + sortiert[mitte]) / 2)
    : sortiert[mitte];
}

function main(): void {
  const argv = process.argv.slice(2);
  const seitIdx = argv.indexOf('--seit');
  let seit: Date | null = null;
  if (seitIdx !== -1) {
    const wert = argv[seitIdx + 1];
    seit = wert ? new Date(wert) : null;
    if (!wert || Number.isNaN(seit?.getTime())) {
      process.stderr.write(`fremdagenten-messung: ungültiges --seit "${wert ?? ''}" (Format YYYY-MM-DD)\n`);
      process.exit(1);
    }
  }

  let roh: PrRoh[];
  try {
    const ausgabe = gh([
      'pr', 'list', '--state', 'merged', '--limit', '200',
      '--json', 'number,headRefName,createdAt,mergedAt,body,title',
    ]);
    roh = JSON.parse(ausgabe) as PrRoh[];
  } catch (fehler) {
    process.stderr.write(`fremdagenten-messung: gh pr list fehlgeschlagen — ${String(fehler)}\n`);
    process.exit(1);
    return;
  }

  const julesPrs = roh
    .filter((pr) => JULES_MUSTER.test(pr.headRefName))
    .filter((pr) => !seit || !pr.mergedAt || new Date(pr.mergedAt) >= seit)
    .sort((a, b) => a.number - b.number);

  const messwerte: Messwert[] = julesPrs.map((pr) => {
    const issueNr = issueNummerAusBody(pr.body);
    const issueZeit = issueNr !== null ? issueErstellt(issueNr) : null;
    const dauer = issueZeit ? dauerMinuten(issueZeit, pr.createdAt) : null;
    return {
      pr: pr.number,
      issue: issueNr,
      branch: pr.headRefName,
      issueErstellt: issueZeit,
      prErstellt: pr.createdAt,
      dauerMin: dauer,
      titel: pr.title,
    };
  });

  if (messwerte.length === 0) {
    process.stdout.write('fremdagenten-messung: keine Jules-PRs gefunden (Muster: 19-stellige Task-ID oder Präfix jules-/jules/).\n');
    process.exit(0);
    return;
  }

  process.stdout.write('| PR | Issue | Branch | Issue erstellt | PR erstellt | Dauer (min) | Titel |\n');
  process.stdout.write('|---|---|---|---|---|---|---|\n');
  for (const m of messwerte) {
    process.stdout.write(
      `| #${m.pr} | ${m.issue !== null ? `#${m.issue}` : '?'} | ${m.branch} | ` +
      `${m.issueErstellt ?? '?'} | ${m.prErstellt} | ${m.dauerMin ?? '?'} | ${m.titel} |\n`
    );
  }

  const dauern = messwerte.map((m) => m.dauerMin).filter((d): d is number => d !== null);
  process.stdout.write(
    `\nn = ${messwerte.length} · Median-Dauer = ${median(dauern) ?? '?'} min ` +
    `(${dauern.length}/${messwerte.length} mit auflösbarer Issue-Referenz)\n`
  );
  process.stdout.write('Spalte «Nacharbeit» ist hier nicht enthalten — kein automatisch prüfbares Merkmal, von Hand ins Fahrplan-Register eintragen.\n');
}

main();
