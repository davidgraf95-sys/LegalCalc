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
// Aufruf: npm run fremdagenten:messung -- [--seit YYYY-MM-DD]
//   --seit filtert auf PRs, die an/nach diesem Datum gemergt wurden (UTC).
//   Der npm-Alias setzt FREMDAGENTEN_CLI=1 — das ist Pflicht (s. Fussnote der
//   Datei zu `main()`): ein blosser `npx vite-node …` OHNE diese Variable
//   führt seit QS-FREMDAGENTEN (4.9.2026) NICHTS aus und meldet Exit 0 ohne
//   Ausgabe, weil derselbe Aufruf-Weg auch der Bibliotheks-Import von
//   `erhebeJules()` durch `scripts/plan/selbstopt-erheben.ts` ist.
//
// Exit 0 immer bei technisch gelungenem Lauf (auch bei 0 Treffern) — dies ist
// ein Mess-, kein Prüfwerkzeug. Exit 1 bei Aufruffehler (z. B. `gh` fehlt)
// oder ungültigem `--seit`.
//
// --kontingent (Auftrag QS-FREMDAGENTEN «Kontingent-Alarm», 4.9.2026):
// eigener Modus, misst NICHT gemergte PRs, sondern ob eines der beiden
// Fremd-Werkzeuge GERADE an seiner Grenze hängt (Fahrplan §4 «Limite
// erkennen», §5 «Kontingent-Ereignisse»):
//   (a) Jules — `gh issue list --label jules --state all --limit 100 --json
//       number,createdAt,comments,state`, Ausschnitt letzte 24 h: Anzahl,
//       Annahmequote («Jules is on it»), laufende Sessions (on it, aber kein
//       «Ready for a review! A PR …») gegen die unbelegte 15er-Parallel-
//       grenze, und ein Alarm je Issue, das seit > 10 min ohne Annahme ist
//       (deutet auf einen Tages-/Parallel-Stopp oder ein App-Problem hin).
//   (b) Antigravity — ein trivialer `agy`-Ping, klassiert über die geteilte
//       Musterprüfung in `agy-status.ts`.
// Exit 0 = beides unauffällig, Exit 3 = Kontingent-Alarm (Jules-Stopp-
// Verdacht ODER agy gesperrt), Exit 2 = Werkzeugfehler (z. B. `gh` schlägt
// fehl). Diese drei Ausgänge sind bewusst unterscheidbar (§14.7: ein
// Erfolgsbericht ohne prüfbaren Exit-Code gilt als nicht erfolgt).

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { klassiereAgyFehler, KONTINGENT_MELDUNG } from './agy-status.ts';
// Der Typ ist EINMAL definiert, und zwar dort, wo das Schema der Zeitreihe
// lebt (§5). Diese Datei erzeugt Werte dieses Typs, sie definiert ihn nicht —
// eine zweite Deklaration hier war bis 4.9.2026 genau der Riss, an dem die
// beiden Fassungen auseinanderlaufen konnten. Reiner Typ-Import: zur Laufzeit
// bleibt er weg, es entsteht also keine Modul-Abhängigkeit.
import type { JulesMessung } from '../plan/selbstoptKern.ts';

const JULES_MUSTER = /[0-9]{19}|^jules[-/]/;
/**
 * Label, mit dem eine Werkzeug-PROBE gekennzeichnet ist (im Repo gesetzt auf
 * PR #642, PR #638, Issue #640). Eine Probe prüft die Prüfstrasse, nicht den
 * Bau: sie ist weder eine Landung noch eine Ablehnung und gehört darum weder
 * in den Zähler noch in den Nenner der Landungsquote.
 */
const PROBE_LABEL = 'probe';
const ON_IT_MUSTER = /on it/i;
const READY_MUSTER = /ready for a review/i;
const AGY = join(process.env.HOME ?? '', '.local/bin/agy');

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

type IssueRoh = {
  number: number;
  createdAt: string;
  state: string;
  comments: { body: string; createdAt: string }[];
};

export type PrRohMitStatus = PrRoh & {
  state: string;
  closedAt: string | null;
  /** `gh pr list --json labels`; bei älteren gh-Ausgaben abwesend — nie annehmen, dass die Liste da ist. */
  labels?: { name: string }[];
};

/** Ergebnis von `klassierePrs` — drei disjunkte Töpfe über demselben Fenster. */
export interface PrKlassierung {
  /** Jules-PRs, im Fenster gemergt, ohne Proben. */
  gemergt: PrRohMitStatus[];
  /** Jules-PRs, im Fenster ohne Merge geschlossen, ohne Proben — das sind die Ablehnungen. */
  geschlossen: PrRohMitStatus[];
  /** Jules-PRs mit Label `probe`, egal ob gemergt oder geschlossen. */
  proben: PrRohMitStatus[];
}

/**
 * Klassiert die rohe `gh`-PR-Liste in gemergt / geschlossen / Proben —
 * **reine Funktion**, kein Netz, keine Wanduhr (Bezugszeitpunkt wird
 * hereingegeben). Genau deshalb ausgelagert: `erhebeJules()` selbst ist wegen
 * seines `gh`-Aufrufs nicht prüfbar, diese Entscheidung hier ist es
 * vollständig (`src/tests/plan-fremdagenten.test.ts`).
 *
 * ANLASS (4.9.2026). PR #642 (`jules/relax-min-height-test-…`) trug das Label
 * `probe` — er war ein Test des Erstfilters, kein abgelehnter Bau. Gezählt als
 * Ablehnung drückte er die Landungsquote unter die Rückbau-Schwelle und liess
 * `retro:17` den Rückbau von Jules vorschlagen. Proben fallen darum aus beiden
 * Quoten-Seiten heraus und werden getrennt ausgewiesen, statt zu verschwinden.
 */
export function klassierePrs(prs: PrRohMitStatus[], jetzt: Date): PrKlassierung {
  const grenze = new Date(jetzt.getTime() - JULES_FENSTER_TAGE * 24 * 3_600_000);
  const imFenster = (d: string | null) => d !== null && new Date(d) >= grenze;
  const istProbe = (pr: PrRohMitStatus) => (pr.labels ?? []).some((l) => l.name === PROBE_LABEL);

  const out: PrKlassierung = { gemergt: [], geschlossen: [], proben: [] };
  for (const pr of prs) {
    if (!JULES_MUSTER.test(pr.headRefName)) continue;
    const gemergt = pr.state === 'MERGED' && imFenster(pr.mergedAt);
    const geschlossen = pr.state === 'CLOSED' && imFenster(pr.closedAt);
    if (!gemergt && !geschlossen) continue;
    if (istProbe(pr)) out.proben.push(pr);
    else if (gemergt) out.gemergt.push(pr);
    else out.geschlossen.push(pr);
  }
  return out;
}

/** Fenster der Stufe-1-Erhebung (Fahrplan §3 «Phase 1 … Anteil PRs ohne Nacharbeit»). */
export const JULES_FENSTER_TAGE = 7;

/**
 * Stufe-1-Erhebung der Jules-Kennzahlen (QS-FREMDAGENTEN,
 * `scripts/plan/selbstopt-erheben.ts`). EIGENE Funktion statt eines Umbaus
 * von `main()`/`kontingentModus()`: jene bleiben unverändert (CLI-Vertrag),
 * diese hier ist das, was Stufe 1 braucht — dieselben Bausteine
 * (`klassierePrs`, `issueNummerAusBody`, `issueErstellt`, `dauerMinuten`,
 * `median`, `holeJulesKontingentDaten`), keine zweite Filter-/Dauer-Logik.
 *
 * Die Klassierung selbst steht in `klassierePrs()` — reine Funktion, damit
 * die Entscheidung «Landung / Ablehnung / Probe» ohne `gh` prüfbar ist.
 *
 * Degradiert auf `null`, NIE werfend (§8) — Stufe 1 vermerkt den Ausfall
 * selbst in `ausfaelle` und macht die Erhebung dafür nicht rot. Scheitert nur
 * einer der beiden `gh`-Aufrufe (PR-Liste oder Issue-Liste), gilt die GANZE
 * Jules-Messung als nicht erhoben — eine Hälfte des Schemas mit erfundenen
 * 0/false zu füllen wäre schlimmer als ehrliches `null`.
 */
export function erhebeJules(jetzt: Date = new Date()): JulesMessung | null {
  let prRoh: PrRohMitStatus[];
  try {
    const ausgabe = gh([
      'pr', 'list', '--state', 'all', '--limit', '200',
      '--json', 'number,headRefName,createdAt,mergedAt,closedAt,state,body,title,labels',
    ]);
    prRoh = JSON.parse(ausgabe) as PrRohMitStatus[];
  } catch {
    return null;
  }

  const { gemergt: gemergte7d, geschlossen: geschlossen7d, proben } = klassierePrs(prRoh, jetzt);
  const dauern = gemergte7d
    .map((pr) => {
      const issueNr = issueNummerAusBody(pr.body);
      const issueZeit = issueNr !== null ? issueErstellt(issueNr) : null;
      return issueZeit ? dauerMinuten(issueZeit, pr.createdAt) : null;
    })
    .filter((d): d is number => d !== null);

  let kontingent: JulesKontingentDaten;
  try {
    kontingent = holeJulesKontingentDaten(jetzt);
  } catch {
    return null;
  }

  return {
    prs_gemerged_7d: gemergte7d.length,
    prs_geschlossen_7d: geschlossen7d.length,
    proben_7d: proben.length,
    // Aufsteigend sortiert: die Liste geht in einen Vergleich über Snapshots
    // hinweg ein, und eine Reihenfolge, die an der gh-Ausgabe hängt, machte
    // gleiche Messungen ungleich (§2).
    prs_geschlossen_nummern: geschlossen7d.map((pr) => pr.number).sort((a, b) => a - b),
    median_dauer_min: median(dauern),
    tickets_24h: kontingent.heutigeCount,
    alarm: kontingent.alarme.length > 0,
  };
}

interface Teilbefund {
  text: string;
  alarm: boolean;
}

interface JulesKontingentDaten {
  heutigeCount: number;
  angenommenCount: number;
  laufendCount: number;
  alarme: string[];
}

/**
 * Zieht die rohen Jules-Kontingent-Zahlen (Issues der letzten 24 h, Annahme-
 * und Alarm-Signale). EIN `gh`-Aufruf, WIRFT bei Fehlschlag — die beiden
 * Aufrufer (`kontingentJules` für die CLI, `erhebeJules` für Stufe 1)
 * entscheiden je selbst, wie sie einen Fehlschlag behandeln (§5: eine
 * Definition der Jules-Kontingent-Logik, nicht zwei).
 */
function holeJulesKontingentDaten(jetzt: Date): JulesKontingentDaten {
  const roh = gh([
    'issue', 'list', '--label', 'jules', '--state', 'all', '--limit', '100',
    '--json', 'number,createdAt,comments,state',
  ]);
  const issues = JSON.parse(roh) as IssueRoh[];

  const seit24h = new Date(jetzt.getTime() - 24 * 60 * 60 * 1000);
  const heutige = issues.filter((i) => new Date(i.createdAt) >= seit24h);
  const angenommen = heutige.filter((i) => i.comments.some((c) => ON_IT_MUSTER.test(c.body)));
  const fertig = new Set(
    angenommen.filter((i) => i.comments.some((c) => READY_MUSTER.test(c.body))).map((i) => i.number),
  );
  const laufend = angenommen.filter((i) => !fertig.has(i.number));

  const alarme: string[] = [];
  for (const i of heutige) {
    const hatOnIt = i.comments.some((c) => ON_IT_MUSTER.test(c.body));
    if (!hatOnIt) {
      const minuten = Math.round((jetzt.getTime() - new Date(i.createdAt).getTime()) / 60000);
      if (minuten > 10) {
        alarme.push(`möglicher Limit-Stopp oder App-Problem: Issue #${i.number} seit ${minuten} min ohne Annahme`);
      }
    }
  }

  return { heutigeCount: heutige.length, angenommenCount: angenommen.length, laufendCount: laufend.length, alarme };
}

/** Jules-Teil von --kontingent. Bricht mit Exit 2 ab, wenn `gh` selbst scheitert (Werkzeugfehler, nicht Kontingent). */
function kontingentJules(jetzt: Date): Teilbefund {
  let daten: JulesKontingentDaten;
  try {
    daten = holeJulesKontingentDaten(jetzt);
  } catch (fehler) {
    process.stderr.write(`fremdagenten-messung --kontingent: gh issue list fehlgeschlagen — ${String(fehler)}\n`);
    process.exit(2);
  }

  const zeilen = [
    `Jules: heute angelegt ${daten.heutigeCount}/100 · davon angenommen (on it) ${daten.angenommenCount} · ` +
      `laufend (on it, aber kein Ready) ${daten.laufendCount}/15`,
    ...daten.alarme.map((a) => `ALARM: ${a}`),
  ];
  return { text: zeilen.join('\n'), alarm: daten.alarme.length > 0 };
}

/** Antigravity-Teil von --kontingent: ein trivialer Ping, klassiert über agy-status.ts. */
function kontingentAgy(): Teilbefund {
  if (!existsSync(AGY)) {
    return { text: 'Antigravity: nicht installiert', alarm: false };
  }
  let stdout: string;
  try {
    stdout = execFileSync(
      AGY,
      [
        '-p', 'Antworte nur mit PONG.',
        '--model', 'gemini-3.8-flash-low',
        '--output-format', 'json',
        '--print-timeout', '60s',
        '--sandbox',
      ],
      { timeout: 90_000, killSignal: 'SIGKILL', maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' },
    );
  } catch (err) {
    const fehler = err as Error & { killed?: boolean; signal?: string | null; stderr?: string | Buffer };
    if (fehler.killed || fehler.signal === 'SIGKILL') {
      return { text: 'Antigravity: unklar (Timeout)', alarm: false };
    }
    const stderrText = fehler.stderr ? String(fehler.stderr) : '';
    const klass = klassiereAgyFehler(`${fehler.message} ${stderrText}`);
    return klass.art === 'kontingent'
      ? { text: `Antigravity: ${KONTINGENT_MELDUNG} — ${klass.text}`, alarm: true }
      : { text: `Antigravity: agy-Fehler: ${klass.text}`, alarm: false };
  }

  let envelope: { status: string; response?: string; usage?: { total_tokens: number } };
  try {
    envelope = JSON.parse(stdout);
  } catch {
    const klass = klassiereAgyFehler(stdout);
    return klass.art === 'kontingent'
      ? { text: `Antigravity: ${KONTINGENT_MELDUNG} — ${klass.text}`, alarm: true }
      : { text: `Antigravity: agy-Fehler: ${klass.text}`, alarm: false };
  }
  if (envelope.status !== 'SUCCESS') {
    const klass = klassiereAgyFehler(`${envelope.status} ${envelope.response ?? ''}`);
    return klass.art === 'kontingent'
      ? { text: `Antigravity: ${KONTINGENT_MELDUNG} — ${klass.text}`, alarm: true }
      : { text: `Antigravity: agy-Fehler: ${klass.text}`, alarm: false };
  }
  return {
    text: `Antigravity: agy ok (gemini-3.8-flash-low, ${envelope.usage?.total_tokens ?? '?'} Tokens)`,
    alarm: false,
  };
}

function kontingentModus(): void {
  const jetzt = new Date();
  const jules = kontingentJules(jetzt);
  const agy = kontingentAgy();
  process.stdout.write('=== Kontingent-Status (fremdagenten-messung --kontingent) ===\n');
  process.stdout.write(jules.text + '\n');
  process.stdout.write(agy.text + '\n');
  if (jules.alarm || agy.alarm) {
    process.stderr.write('KONTINGENT-ALARM: siehe Zeilen oben — keine neuen Jules-Tickets, Fahrplan §5 protokollieren.\n');
    process.exitCode = 3;
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes('--kontingent')) {
    kontingentModus();
    return;
  }
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

// Nur bei direktem CLI-Aufruf ausführen — seit QS-FREMDAGENTEN (4.9.2026)
// importiert `scripts/plan/selbstopt-erheben.ts` `erhebeJules()` aus DIESER
// Datei, und ein blosser Import darf `main()` (gh-Aufrufe, `process.exit`)
// nicht auslösen. `process.env.VITEST` allein reicht nicht mehr — es
// unterscheidet Test von Nicht-Test, aber nicht mehr direkten CLI-Lauf von
// Bibliotheks-Import IM BAU (beides ohne VITEST). Ein Pfadvergleich über
// `process.argv[1]` funktioniert unter `vite-node` nachweislich nicht — es
// zeigt auf den vite-node-Binary-Pfad, nicht auf dieses Skript (identischer
// Befund wie in `scripts/check-schlankheit.ts` dokumentiert) — darum die
// explizite Markierung durch den npm-Alias selbst.
if (!process.env.VITEST && process.env.FREMDAGENTEN_CLI === '1') {
  main();
}
