// scripts/plan/selbstopt-erheben.ts — Zeitreihen-Sammler `npm run selbstopt:erheben`
// (Roadmap-Schritt `QS-SELBSTOPT`, Stufe 1 «erst messen»).
//
// ZWECK. Der Bau soll sich an Messwerten verbessern statt an Eindrücken. Dieser
// Sammler hängt je Aufruf EINEN Snapshot an `messwerte/selbstopt-zeitreihe.json`:
// wie oft Tore rot waren, wie oft CI scheiterte oder wiederholt wurde, wie viel
// kurzfristig nachgebessert wurde, wie viele Tests wackelten, und wie viele
// datierte Belege die Fehlerklassen des Lehren-Registers tragen.
//
// DREI BAUREGELN — dieselben wie in `scripts/plan/lage.ts`:
//
//  * **Nie hart scheitern, immer degradieren (§8).** `gh` kann fehlen, ohne Netz
//    hängen, nicht authentisiert sein; der Playwright-Report existiert lokal
//    meist gar nicht. Jeder Ausfall wird zu `null` im betreffenden Feld PLUS
//    einem Eintrag in `ausfaelle` — nie zu einer 0, die «gemessen und nichts
//    gefunden» behauptet, und nie zu einem Abbruch, der die übrigen Felder
//    mitreisst.
//  * **Alles Rechnen liegt in `selbstoptKern.ts`.** Hier steht nur Beschaffung:
//    git, gh, Dateien lesen, JSON schreiben. Was hier steht, ist im Test nicht
//    prüfbar; was drüben steht, ist es vollständig.
//  * **Keine Schätzung, kein Modell, keine Heuristik als Urteil (§2).** Die
//    Rework-Zahl IST eine Heuristik — aber eine Beobachtungsgrösse, kein
//    Tor-Kriterium (Spec). Kein Feld dieser Datei entscheidet je über Grün/Rot.
//
// AUFRUF:  npm run selbstopt:erheben
//          npm run selbstopt:erheben -- --trocken   (nur anzeigen, nichts schreiben)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  EREIGNIS_DATEI,
  GENERIERT_MARKE,
  LEERES_AGGREGAT,
  REWORK_FENSTER_TAGE,
  REWORK_NACHFASS_STUNDEN,
  SCHEMA_VERSION,
  ZEITREIHE_DATEI,
  addiereAggregat,
  aggregiereTore,
  ciKennzahl,
  istHandschrift,
  letzterSnapshot,
  parseEreignisseMitRest,
  parseFKlassen,
  pruefeZeitreihe,
  quoteText,
  reworkKennzahl,
  zaehleFlakySpecs,
  type CiLauf,
  type RwCommit,
  type Snapshot,
  type Zeitreihe,
} from './selbstoptKern';

/** Wie viele abgeschlossene CI-Läufe in die Quote eingehen (Spec: «letzten ~50»). */
const CI_FENSTER = 50;
/** Der Workflow, dessen Gesundheit gemessen wird. */
const CI_WORKFLOW = 'ci.yml';
/** Playwright-Report (CI-Artefakt, lokal gitignoriert und meist abwesend). */
const FLAKY_REPORT = 'playwright-report.json';
/** Quelle der Fehlerklassen — die Tabelle bleibt die Wahrheit, wir projizieren (§5). */
const LEHREN_REGISTER = '.claude/skills/lehren/SKILL.md';

const TIMEOUT_MS = 60_000;

/** Kommando ausführen; `null` statt Wurf — der Aufrufer vermerkt den Ausfall. */
function sh(cmd: string, args: string[]): string | null {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: TIMEOUT_MS,
    });
  } catch {
    return null;
  }
}

function lies(pfad: string): string | null {
  return existsSync(pfad) ? readFileSync(pfad, 'utf8') : null;
}

// ───────────────────────────────── Beschaffung ─────────────────────────────────

/**
 * Commits für die Rework-Zahl. Geholt wird das Beurteilungs-Fenster PLUS die
 * Nachfass-Frist als Vorlauf (Begründung in `reworkKennzahl`); der Trenner
 * `\x01` steht vor jedem Commit-Kopf, weil Dateinamen alles enthalten dürfen,
 * nur kein Steuerzeichen.
 */
function holeCommits(): RwCommit[] | null {
  const tage = REWORK_FENSTER_TAGE + Math.ceil(REWORK_NACHFASS_STUNDEN / 24);
  const roh = sh('git', [
    'log',
    `--since=${tage}.days.ago`,
    '--no-merges',
    '--name-only',
    '--pretty=format:%x01%H%x09%aI%x09%aE',
  ]);
  if (roh === null) return null;
  const commits: RwCommit[] = [];
  for (const block of roh.split('\u0001')) {
    if (!block.trim()) continue;
    const [kopf, ...zeilen] = block.split('\n');
    const [sha, ts, autor] = kopf.split('\t');
    if (!sha || !ts) continue;
    commits.push({ sha, ts, autor: autor ?? '', dateien: zeilen.map((z) => z.trim()).filter(Boolean) });
  }
  return commits;
}

/** Abgeschlossene CI-Läufe über `gh` (native GitHub-API, kein Fremddienst). */
function holeCiLaeufe(): CiLauf[] | null {
  const roh = sh('gh', [
    'run', 'list',
    '--workflow', CI_WORKFLOW,
    '--limit', String(CI_FENSTER),
    '--json', 'attempt,conclusion,status',
  ]);
  if (roh === null) return null;
  try {
    const daten = JSON.parse(roh) as CiLauf[];
    return Array.isArray(daten) ? daten : null;
  } catch {
    return null;
  }
}

// ───────────────────────────────── Erhebung ─────────────────────────────────

export function erhebe(): { zeitreihe: Zeitreihe; snapshot: Snapshot } {
  const ausfaelle: string[] = [];

  // (0) Bisherige Zeitreihe. Ist sie defekt, wird sie NICHT stillschweigend
  //     ersetzt: eine kaputte Messreihe zu überschreiben hiesse, den einzigen
  //     Beleg für ihren Defekt zu vernichten.
  const vorhanden = lies(ZEITREIHE_DATEI);
  const beanstandet = pruefeZeitreihe(vorhanden);
  if (beanstandet.length) {
    throw new Error(
      `Bestehende Zeitreihe ist nicht schema-valide — erst reparieren (dieselben Befunde meldet \`npm run check:plan\`):\n  - ` +
        beanstandet.join('\n  - '),
    );
  }
  const zeitreihe: Zeitreihe = vorhanden
    ? (JSON.parse(vorhanden) as Zeitreihe)
    : { _generiert: GENERIERT_MARKE, schema: SCHEMA_VERSION, snapshots: [] };
  const vorig = letzterSnapshot(zeitreihe);

  // (1) HEAD-Commit.
  const headRoh = sh('git', ['rev-parse', 'HEAD']);
  const headCommit = headRoh?.trim() ?? '';
  if (!headCommit) ausfaelle.push('git rev-parse HEAD');

  // (2) Tor-Rot-Ereignisse seit dem letzten Snapshot + kumuliert.
  const logRoh = lies(EREIGNIS_DATEI);
  if (logRoh === null) ausfaelle.push(`${EREIGNIS_DATEI} (noch kein Tor-Lauf protokolliert)`);
  const { ereignisse, verworfen } = parseEreignisseMitRest(logRoh ?? '');
  if (verworfen > 0) ausfaelle.push(`${EREIGNIS_DATEI}: ${verworfen} unlesbare Zeile(n) übersprungen`);
  const seitLetztem = aggregiereTore(ereignisse, vorig?.erhobenAm ?? null);
  const kumuliert = addiereAggregat(vorig?.torRot.kumuliert ?? LEERES_AGGREGAT, seitLetztem);

  // (3) CI-Kennzahlen.
  const ciRoh = holeCiLaeufe();
  if (ciRoh === null) ausfaelle.push(`gh run list --workflow ${CI_WORKFLOW}`);
  const ci = ciRoh === null ? null : ciKennzahl(ciRoh);

  // (4) Rework — zwei Sichten, Begründung bei `istHandschrift`.
  const commits = holeCommits();
  if (commits === null) ausfaelle.push('git log (Rework-Fenster)');
  const jetzt = Date.now();
  const rework =
    commits === null
      ? null
      : {
          alle: reworkKennzahl(commits, jetzt),
          handschrift: reworkKennzahl(commits, jetzt, REWORK_FENSTER_TAGE, REWORK_NACHFASS_STUNDEN, istHandschrift),
        };

  // (5) Flaky.
  const reportRoh = lies(FLAKY_REPORT);
  if (reportRoh === null) ausfaelle.push(`${FLAKY_REPORT} (CI-Artefakt, lokal nicht vorhanden)`);
  let flaky: { specs: number } | null = null;
  if (reportRoh !== null) {
    try {
      flaky = { specs: zaehleFlakySpecs(JSON.parse(reportRoh)) };
    } catch {
      ausfaelle.push(`${FLAKY_REPORT} (nicht lesbar)`);
    }
  }

  // (6) Fehlerklassen.
  const registerRoh = lies(LEHREN_REGISTER);
  if (registerRoh === null) ausfaelle.push(LEHREN_REGISTER);
  const fKlassen = registerRoh === null ? {} : parseFKlassen(registerRoh);

  const snapshot: Snapshot = {
    erhobenAm: new Date().toISOString(),
    headCommit,
    torRot: { seitLetztem, kumuliert },
    ci,
    rework,
    flaky,
    fKlassen,
    ausfaelle,
  };

  return { zeitreihe: { ...zeitreihe, snapshots: [...zeitreihe.snapshots, snapshot] }, snapshot };
}

/** Zeitreihe schreiben (Ordner anlegen, abschliessender Zeilenumbruch). */
export function schreibe(z: Zeitreihe, pfad: string = ZEITREIHE_DATEI): void {
  const ordner = dirname(pfad);
  if (ordner && !existsSync(ordner)) mkdirSync(ordner, { recursive: true });
  writeFileSync(pfad, `${JSON.stringify(z, null, 2)}\n`);
}

// ─────────────────────────────────── CLI ───────────────────────────────────

if (!process.env.VITEST) {
  const trocken = process.argv.includes('--trocken');
  let ergebnis: { zeitreihe: Zeitreihe; snapshot: Snapshot };
  try {
    ergebnis = erhebe();
  } catch (e) {
    console.error(`selbstopt:erheben ROT — ${(e as Error).message}`);
    process.exit(1);
  }
  const { zeitreihe, snapshot } = ergebnis;

  if (!trocken) schreibe(zeitreihe);

  const s = snapshot;
  console.log(`selbstopt:erheben — Snapshot ${zeitreihe.snapshots.length} (${s.erhobenAm}, HEAD ${s.headCommit.slice(0, 9) || '—'})`);
  console.log(
    `  Tore seit letztem Snapshot: ${s.torRot.seitLetztem.rot} rot von ${s.torRot.seitLetztem.gesamt} Läufen ` +
      `(kumuliert ${s.torRot.kumuliert.rot}/${s.torRot.kumuliert.gesamt})`,
  );
  console.log(
    s.ci
      ? `  CI (${CI_WORKFLOW}, ${s.ci.laeufe} Läufe): Failure-Rate ${quoteText(s.ci.failureRate)} · Rerun-Rate ${quoteText(s.ci.rerunRate)}`
      : '  CI: — (nicht erhoben)',
  );
  console.log(
    s.rework
      ? `  Rework (${s.rework.handschrift.fensterTage} Tage / ${s.rework.handschrift.nachfassStunden} h): ` +
        `Quelltext ${quoteText(s.rework.handschrift.anteil)} von ${s.rework.handschrift.commits} Commits · ` +
        `alle Dateien ${quoteText(s.rework.alle.anteil)} von ${s.rework.alle.commits} (enthält Korpus-Regenerierung)`
      : '  Rework: — (nicht erhoben)',
  );
  console.log(`  Flaky-Specs: ${s.flaky ? s.flaky.specs : '— (nicht erhoben)'}`);
  console.log(
    `  Fehlerklassen — datierte Rückfälle über den Ur-Vorfall hinaus: ` +
      `${Object.entries(s.fKlassen).map(([k, v]) => `${k}=${v}`).join(' · ') || '—'}`,
  );
  if (s.ausfaelle.length) console.log(`  ⚠️  nicht erhoben: ${s.ausfaelle.join(' · ')} (kein Fehler des Sammlers)`);
  console.log(trocken ? `  (--trocken: ${ZEITREIHE_DATEI} NICHT geschrieben)` : `  → ${ZEITREIHE_DATEI}`);
}
