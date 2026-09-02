// scripts/check-lizenzen.ts — Lizenz-Tor (QS-VERWENDEN V1).
//
// Prüft ALLE installierten Abhängigkeiten (prod UND dev, `npm ls --all
// --json --long`) gegen eine Allowlist permissiver Lizenzen. Copyleft
// (LGPL/GPL/AGPL/CPAL/SSPL), fehlende oder unbekannte Lizenzangaben
// (NOASSERTION) sind ROT — Verstösse gegen §URG-Leitbild («nur amtliche und
// urheberrechtsfreie Quellen») sollen nicht erst beim Vertrieb auffallen.
// MPL-2.0 (file-level Copyleft, in der Praxis bei Bibliotheken unkritisch)
// ist GELB — Warnung, kein Baustopp.
//
// SPDX-Ausdrücke: `OR` ist erlaubt, wenn EINE Alternative erlaubt ist; `AND`
// nur, wenn ALLE Teile erlaubt sind. Verschachtelte Klammern (mehr als eine
// Ebene) und `WITH`-Exceptions (z. B. `Apache-2.0 WITH LLVM-exception`)
// werden NICHT aufgelöst — bewusst kein Parser-Ausbau, sondern fail-closed:
// ein nicht auflösbarer Ausdruck landet als Ganzes in `klassifiziereLeaf`,
// matcht dort keinen Allowlist-Eintrag und ist damit ROT (gemessen 2.9.2026:
// `(MIT AND (BSD-3-Clause OR Apache-2.0))` → rot, `Apache-2.0 WITH
// LLVM-exception` → rot). Konservativ, nicht vollständig — für den Bestand
// bislang ausreichend, weil kein real vorkommender Ausdruck bisher fälschlich
// rot markiert wurde.
//
// Ausnahmen: `scripts/lizenzen-ausnahmen.json` (optional) — nur für Pakete,
// die HEUTE schon rot sind UND bereits in Betrieb sind (nie vorsorglich).
//
// Bug-Check-Nachzug PR #622 (2.9.2026), vier Befunde behoben:
//  (1) `npm ls` liefert bei ELSPROBLEMS (Exit 1, z. B. kaputter/unsynchron.
//      node_modules) trotzdem auswertbares JSON auf stdout — vorher liess
//      `execFileSync` das Tor mit einem uncaught TypeError sterben, statt
//      den Baum (mit Warnung) auszuwerten oder sauber rot zu melden. Rot
//      reproduziert: `mv node_modules/wrap-ansi /tmp/…` → `npm run
//      check:lizenzen` endete in `Error: Command failed: npm ls …` +
//      Stacktrace statt einer Tor-Meldung.
//  (2) Untergrenze `gesehen.size < 100` — «0 Pakete geprüft» darf nie grün
//      sein (Leerlauf-Grün-Falle).
//  (3) `dep.license` als Objekt (`{type: 'MIT'}`, altes npm-Format) liess
//      `.trim()` mit `TypeError: dep.license.trim is not a function`
//      abstürzen — reproduziert per `lizenzText({license:{type:'MIT'}})`.
//  (4) Übersprungene Knoten (`missing`/ohne `version`) werden gezählt und
//      in der Zusammenfassung ausgewiesen statt stillschweigend verworfen.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ALLOWLIST = new Set(
  [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    '0BSD',
    'CC0-1.0',
    'Unlicense',
    'Python-2.0',
    'BlueOak-1.0.0',
    'CC-BY-4.0',
    'CC-BY-3.0',
    'OFL-1.1',
    'Zlib',
  ].map((l) => l.toLowerCase()),
);
const WARN_LIZENZ = 'mpl-2.0';

/** Untergrenze gegen Leerlauf-Grün (§6.7) — «0 Pakete geprüft» ist nie ok. */
export const UNTERGRENZE_PAKETE = 100;

type Klasse = 'gruen' | 'warn' | 'rot';

/** `license`/`licenses[].type` sind laut npm-Doku Strings, real kommen aber
 *  auch Objektformen (`{type: 'MIT'}`, ältere npm-Generationen) vor. */
type LizenzWert = string | { type?: string } | null | undefined;

type NpmDep = {
  version?: string;
  license?: LizenzWert;
  licenses?: Array<{ type?: LizenzWert }>;
  missing?: boolean;
  dependencies?: Record<string, NpmDep>;
};

type NpmLsBaum = NpmDep & { name?: string; problems?: string[] };

type Ausnahme = { paket: string; grund: string; datum: string };

/** Klammern eine Ebene tief entfernen, wenn sie den ganzen Ausdruck umschliessen. */
export function entklammern(s: string): string {
  s = s.trim();
  if (s.startsWith('(') && s.endsWith(')')) {
    // Nur entfernen, wenn die öffnende Klammer zur schliessenden gehört
    // (kein "(A) OR (B)"-Fall, der hier fälschlich verschmelzen würde).
    let tiefe = 0;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === '(') tiefe++;
      else if (s[i] === ')') tiefe--;
      if (tiefe === 0) return s; // schliesst vor dem Ende → nicht umschliessend
    }
    return entklammern(s.slice(1, -1));
  }
  return s;
}

function klassifiziereLeaf(lizenz: string): Klasse {
  const l = entklammern(lizenz).trim().toLowerCase();
  if (ALLOWLIST.has(l)) return 'gruen';
  if (l === WARN_LIZENZ) return 'warn';
  return 'rot';
}

/** Schlimmste Klasse gewinnt (rot > warn > gruen). */
function schlimmer(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 0, warn: 1, rot: 2 };
  return rang[a] >= rang[b] ? a : b;
}
/** Beste Klasse gewinnt (gruen > warn > rot) — für OR. */
function besser(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 2, warn: 1, rot: 0 };
  return rang[a] >= rang[b] ? a : b;
}

/** SPDX-Ausdruck klassifizieren: AND = alle erlaubt, OR = eine Alternative reicht. */
export function klassifiziereAusdruck(ausdruck: string): Klasse {
  const s = entklammern(ausdruck);
  if (/ or /i.test(s)) {
    return s
      .split(/ or /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(besser);
  }
  if (/ and /i.test(s)) {
    return s
      .split(/ and /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(schlimmer);
  }
  return klassifiziereLeaf(s);
}

/** Einen einzelnen Lizenzwert (String ODER `{type}`-Objekt) sicher zu Text
 *  machen — nie `.trim()` auf einen Nicht-String aufrufen (Befund 3). */
function lizenzWertZuText(wert: LizenzWert): string {
  if (typeof wert === 'string') return wert.trim();
  if (wert && typeof wert === 'object' && typeof wert.type === 'string') {
    return wert.type.trim();
  }
  return '';
}

/** Lizenz-Rohtext aus `license` (neu) oder `licenses[]` (alt) extrahieren.
 *  Beide Felder können String ODER Objektform sein (Befund 3). */
export function lizenzText(dep: NpmDep): string {
  const direkt = lizenzWertZuText(dep.license);
  if (direkt) return direkt;
  if (dep.licenses && dep.licenses.length) {
    const typen = dep.licenses.map((l) => lizenzWertZuText(l?.type)).filter(Boolean);
    if (typen.length) return typen.join(' OR ');
  }
  return '';
}

type Fund = { key: string; lizenz: string; klasse: Klasse; pfad: string };

type Zaehler = { uebersprungen: number };

function baumDurchlaufen(
  knoten: NpmDep,
  name: string,
  vorfahren: string[],
  gesehen: Map<string, Fund>,
  zaehler: Zaehler,
): void {
  const eigenerPfad = [...vorfahren, name];
  for (const [kindName, kind] of Object.entries(knoten.dependencies ?? {})) {
    if (!kind || kind.missing || !kind.version) {
      zaehler.uebersprungen++; // unerfüllte peerDependency etc. (Befund 4)
      continue;
    }
    const key = `${kindName}@${kind.version}`;
    if (!gesehen.has(key)) {
      const lizenz = lizenzText(kind) || 'NOASSERTION';
      const klasse = klassifiziereAusdruck(lizenz);
      gesehen.set(key, { key, lizenz, klasse, pfad: [...eigenerPfad, kindName].join(' > ') });
    }
    baumDurchlaufen(kind, kindName, eigenerPfad, gesehen, zaehler);
  }
}

function ausnahmenLaden(): Map<string, Ausnahme> {
  const pfad = 'scripts/lizenzen-ausnahmen.json';
  const karte = new Map<string, Ausnahme>();
  if (!existsSync(pfad)) return karte;
  const liste = JSON.parse(readFileSync(pfad, 'utf8')) as Ausnahme[];
  for (const e of liste) karte.set(e.paket, e);
  return karte;
}

/** `stdout`-Text von `npm ls` parsen — `null` statt Wurf, wenn kein JSON. */
export function parseNpmLsJson(text: string): NpmLsBaum | null {
  try {
    return JSON.parse(text) as NpmLsBaum;
  } catch {
    return null;
  }
}

/** `npm ls --all --json --long` ausführen und auswerten (Befund 1).
 *  `npm ls` beendet sich mit Exit-Code 1 (ELSPROBLEMS), sobald der Baum
 *  irgendein Problem hat (fehlende peer-Deps, kaputtes node_modules …) —
 *  liefert dabei aber i. d. R. TROTZDEM vollständiges JSON auf stdout.
 *  `execFileSync` wirft in diesem Fall; ohne try/catch stirbt das ganze Tor
 *  mit einem uncaught TypeError-Dump statt einer lesbaren Tor-Meldung. */
function npmLsLesen(): { baum: NpmLsBaum; problems: string[] } {
  let roh: string;
  try {
    roh = execFileSync('npm', ['ls', '--all', '--json', '--long'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    // ELSPROBLEMS o.ä.: execFileSync wirft, aber e.stdout trägt oft noch das
    // vollständige JSON. Wenn parsebar: Baum trotzdem auswerten (Warnung
    // statt Absturz) — sonst sauber rot mit der echten npm-Fehlermeldung.
    const stdout = (e as { stdout?: unknown }).stdout;
    const baum = typeof stdout === 'string' ? parseNpmLsJson(stdout) : null;
    if (baum) {
      return { baum, problems: baum.problems ?? [] };
    }
    const meldung = (e as { message?: string }).message ?? String(e);
    console.error(
      `\nFEHLER: 'npm ls --all --json --long' lieferte weder Erfolg noch ` +
        `auswertbares JSON auf stdout (ELSPROBLEMS o.ä.).\n${meldung}\n` +
        `→ node_modules mit package-lock.json abgleichen (\`npm ci\`) und erneut versuchen.`,
    );
    return process.exit(1);
  }
  const baum = parseNpmLsJson(roh);
  if (!baum) {
    console.error(`\nFEHLER: 'npm ls --all --json --long' lieferte kein parsebares JSON.`);
    return process.exit(1);
  }
  return { baum, problems: baum.problems ?? [] };
}

function main(): void {
  const { baum, problems } = npmLsLesen();
  const gesehen = new Map<string, Fund>();
  const zaehler: Zaehler = { uebersprungen: 0 };
  baumDurchlaufen(baum, baum.name ?? 'lexmetrik', [], gesehen, zaehler);

  const ausnahmen = ausnahmenLaden();
  const gruen: Fund[] = [];
  const warn: Fund[] = [];
  const rot: Fund[] = [];
  const alsAusnahmeFreigegeben: Fund[] = [];

  for (const fund of gesehen.values()) {
    if (fund.klasse === 'gruen') gruen.push(fund);
    else if (fund.klasse === 'warn') warn.push(fund);
    else if (ausnahmen.has(fund.key)) alsAusnahmeFreigegeben.push(fund);
    else rot.push(fund);
  }

  console.log(`Lizenz-Tor: ${gesehen.size} Pakete geprüft (prod + dev, transitiv).`);
  if (problems.length) {
    console.log(`  Baum-Probleme (npm ls, Warnung — Baum trotzdem ausgewertet): ${problems.length}`);
    for (const p of problems) console.log(`    - ${p}`);
  }
  console.log(`  übersprungen (missing/ohne version, z. B. unerfüllte peerDeps): ${zaehler.uebersprungen}`);
  console.log(`  gruen (erlaubt):         ${gruen.length}`);
  console.log(`  gelb  (MPL-2.0, Warnung): ${warn.length}`);
  for (const f of warn) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);
  console.log(`  Ausnahme (rot, freigegeben): ${alsAusnahmeFreigegeben.length}`);
  for (const f of alsAusnahmeFreigegeben) {
    const a = ausnahmen.get(f.key)!;
    console.log(`    - ${f.key} [${f.lizenz}] — ${a.grund} (${a.datum})`);
  }
  console.log(`  ROT (Copyleft/NOASSERTION/unbekannt): ${rot.length}`);
  for (const f of rot) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);

  const fehler: string[] = [];
  if (rot.length > 0) {
    fehler.push(
      `${rot.length} Paket(e) mit nicht erlaubter Lizenz.\n` +
        `→ Bei bereits produktiv genutztem Paket: begründete Ausnahme in ` +
        `scripts/lizenzen-ausnahmen.json anlegen (Paket, Grund, Datum) und ` +
        `David informieren — nie automatisch.`,
    );
  }
  if (gesehen.size < UNTERGRENZE_PAKETE) {
    fehler.push(
      `nur ${gesehen.size} Paket(e) geprüft (Untergrenze ${UNTERGRENZE_PAKETE}) — ` +
        `ein leerer/kaputter Baum darf nie grün sein.`,
    );
  }

  if (fehler.length > 0) {
    console.error(`\nFEHLER:\n${fehler.map((f) => `- ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('\nok  Lizenz-Tor grün.');
}

if (!process.env.VITEST) main();
