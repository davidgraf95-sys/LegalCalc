/**
 * check:schlankheit — Zeilen-Wächter gegen Churn-Regrowth (§6.6 mechanisiert).
 *
 * ANLASS (belegt): `src/pages/gesetz-leser/inhalt.tsx` wuchs nach dem
 * §6.6-Split vom 24.7.2026 (781 Z.) binnen 12 Tagen auf 1090 Z. (+40 %)
 * zurück — niemand merkte es, bis eine Session zufällig nachmass. Die
 * §6.6-Schwelle (~800 Z., Skill `refactoring` → «Datei-Schlankheit») existierte
 * bis hierhin nur als Prosa-Regel ohne mechanischen Wächter: CLAUDE.md §6.7
 * («ein Tor, das nicht scheitern kann, ist gefährlicher als keines») traf
 * exakt zu — es gab hier gar kein Tor.
 *
 * WAS GEMESSEN WIRD. Zeilenzahlen (`wc -l`-Äquivalent: Anzahl `\n`) aller
 * `*.ts`/`*.tsx` unter `src/` und `scripts/`, MIT drei Ausschlüssen:
 *
 *   1. `*.generated.ts` / `*.generated.tsx` — regenerierbare Projektionen
 *      (Banner + eigenes `npm run gen:*`/`check:*` decken deren Drift ab,
 *      §5). Ihre Zeilenzahl ist eine Funktion der Quelldaten, kein
 *      Wartbarkeits-Signal.
 *   2. Jedes Muster aus `.gitattributes`, das `linguist-generated` trägt
 *      (z. B. `src/lib/pdf/fonts/fontData.ts`) — dieselbe Begründung,
 *      generisch statt hartkodiert: was GitHub schon als generiert einklappt,
 *      soll dieses Tor nicht als Handschrift werten.
 *   3. `src/tests/fixtures/**` — Test-Fixtures sind oft grosse, wörtlich
 *      übernommene Beispieldaten (Snapshot-Inputs), kein editierter Code.
 *      Stand heute (5.8.2026) ist keine Fixture > 800 Z. (grösste 595 Z.,
 *      `lexwork-bs-audit.ts`) — der Ausschluss ist trotzdem generell gesetzt,
 *      damit ein künftiger grosser Fixture-Import nicht unnötig rot wird;
 *      *.test.ts-Dateien SELBST (nicht unter fixtures/) werden weiter
 *      gemessen — sie sind Handschrift wie jeder andere Code.
 *
 * BESTAND WIRD GRANDFATHERED (`scripts/schlankheit-bestand.json`). Am
 * Einführungstag lagen 18 Dateien bereits über 800 Z. (u. a. die
 * Fedlex-Adapter unter `scripts/normtext/`, die Snapshot-Pipeline). Diese
 * rückwirkend alle zu zwingen wäre eine andere, deutlich grössere Bau-Einheit
 * (§4-Verschmelzung wäre für einige davon vermutlich der richtige Weg) — das
 * Tor soll NEUEN Zuwachs fangen, nicht historische Schuld auf einen Schlag
 * einfordern.
 *
 * ROT wird das Tor nur, wenn:
 *   (a) eine NEUE Datei > 800 Z. auftaucht (nicht in der Baseline), oder
 *   (b) eine Bestands-Datei ihre Baseline-Zahl um > 10 % überschreitet
 *       (die Fehlerklasse aus dem Anlass: 781 → 1090 Z. ist +39.6 %, hätte
 *       dieses Tor schon bei ~859 Z. gestoppt).
 * Eine Bestands-Datei, die unter 800 Z. fällt, ist KEIN Rot — nur ein
 * Hinweis («kann aus der Baseline entfernt werden»). Das Tor schreibt die
 * Baseline nie von sich aus (Determinismus, §2): dafür gibt es das explizite
 * `--update`-Flag (`npm run schlankheit:update`), das die Baseline bewusst
 * NEU aus dem aktuellen Bestand schreibt — Muster wie `npm run golden`
 * (schreiben ist ein eigener, deklarierter Schritt, nie ein Nebeneffekt des
 * Lesens).
 *
 * Lauf: `npm run check:schlankheit` (reines fs+Zeilenzählen, kein Build,
 * keine Netz-Zugriffe — Laufzeit < 1 s). Seit e24b97b80 Teil von
 * `check:seriell` (package.json) und damit von `npm run check`/`npm run gate`
 * — BEWUSST NICHT CI-Required: ein begründeter Allowlist-Eintrag in
 * `scripts/check-tor-paritaet.ts` hält es lokal-warnend, damit ein
 * Bestands-Regrowth fremde PRs nicht blockiert (Eskalationsweg dort:
 * `npm run schlankheit:update` mit Commit-Begründung).
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const WURZEL = process.cwd();
const SCHWELLE = 800;
const TOLERANZ = 0.10; // §6.6: > 10 % über der Baseline-Zahl ist Rot.
const BASELINE_PFAD = join(WURZEL, 'scripts', 'schlankheit-bestand.json');
const SCAN_WURZELN = ['src', 'scripts'];

// ─── Ausschlüsse ────────────────────────────────────────────────────────────

const REGEX_SONDERZEICHEN = new Set(['.', '+', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']);

/**
 * Wandelt ein `.gitattributes`-Glob (nur die hier vorkommenden Formen: `*.ext`,
 * `pfad/**‌/*.ext`, `pfad/datei.ext`) in einen Regex, der auf POSIX-Pfade
 * relativ zur Repo-Wurzel passt. Zeichenweise aufgebaut (kein
 * escape-dann-Platzhalter-Zwischenschritt über String-Ersetzung), damit keine
 * Zwischenform nötig ist, die Regex-Metazeichen mit Steuerzeichen verwechseln
 * könnte.
 *
 * ANKER (Review-Befund 2, 5.8.2026): git matcht ein Muster OHNE `/` auf JEDER
 * Pfadebene (wie `.gitignore` — effektiv `**‌/muster`), ein Muster MIT `/` nur
 * relativ zum Verzeichnis der `.gitattributes` (hier die Repo-Wurzel, also ab
 * Pfadanfang). Reproduziert: `massendaten.ts linguist-generated` schloss
 * `src/lib/massendaten.ts` vorher NICHT aus, weil `^massendaten\.ts$` nur auf
 * der Wurzel selbst gematcht hätte. Slash-lose Muster ankern jetzt an
 * `(^|/)` statt `^` — das deckt zugleich Review-Befund 6 mit ab: ein
 * slash-loses `*.generated.ts` matcht damit automatisch auch in
 * Unterordnern (`[^/]*\.generated\.ts` hinter `(^|/)`).
 *
 * `?` (Review-Befund 6): git-Glob-Semantik ist «genau ein Zeichen, kein `/`»
 * — als `[^/]` übersetzt, NICHT als literales `?` stehen gelassen (ein
 * rohes `?` im Regex ist ein Quantor auf dem VORHERGEHENDEN Atom, nicht
 * «ein beliebiges Zeichen»; als erstes Zeichen eines Musters wäre es sogar
 * eine ungültige Regex).
 *
 * `**` (Review-Befund 6, bewusste Teil-Abdeckung): wird als `.*` übersetzt —
 * eine Übersetzung, die auch über Verzeichnisgrenzen hinweg matcht und damit
 * ein Superset von gits «null oder mehr Verzeichnisebenen» ist. Für den
 * Ausschluss-Zweck hier (§5: was gematcht wird, FLIEGT aus der Zeilenmessung
 * raus) ist ein zu weites Match das sichere Risiko — es kann höchstens eine
 * Datei zu Unrecht ausschliessen, nie eine Churn-Regrowth-Datei unentdeckt
 * durchlassen. Heute nutzt `.gitattributes` kein `**` ohne Slash und keine
 * mehrfachen `**` in einem Muster; diese Fälle sind NICHT gegen echtes
 * git-Verhalten verifiziert, nur gegen die hier vorkommenden Formen.
 */
export function globZuRegex(glob: string): RegExp {
  let regex = '';
  for (let i = 0; i < glob.length; i++) {
    const zeichen = glob[i];
    if (zeichen === '*' && glob[i + 1] === '*') {
      regex += '.*';
      i += 1; // zweites '*' des Paars wurde mitverbraucht
    } else if (zeichen === '*') {
      regex += '[^/]*';
    } else if (zeichen === '?') {
      regex += '[^/]';
    } else if (REGEX_SONDERZEICHEN.has(zeichen)) {
      regex += '\\' + zeichen;
    } else {
      regex += zeichen;
    }
  }
  const anker = glob.includes('/') ? '^' : '(^|/)';
  return new RegExp(anker + regex + '$');
}

/**
 * Reine Parse-Funktion (fs-frei, testbar): liest `linguist-generated`-Muster
 * aus dem TEXT-Inhalt einer `.gitattributes`-Datei (§5-Projektion: was GitHub
 * schon als generiert einklappt, ist kein Handschrift-Signal).
 *
 * ATTRIBUT-FORM (Review-Befund 3, 5.8.2026): git akzeptiert sowohl das nackte
 * Token `linguist-generated` (implizit `=true`) als auch die explizite Form
 * `linguist-generated=true`. `linguist-generated=false` ist eine bewusste
 * Nicht-Setzung (z. B. um ein geerbtes Attribut aus einem übergeordneten
 * Muster wieder abzuschalten) und zählt NICHT als gesetzt.
 */
export function generiertMusterAusGitattributes(inhalt: string): RegExp[] {
  const muster: RegExp[] = [];
  for (const zeile of inhalt.split('\n')) {
    const getrimmt = zeile.trim();
    if (!getrimmt || getrimmt.startsWith('#')) continue;
    const teile = getrimmt.split(/\s+/);
    const [glob, ...attribute] = teile;
    const generiertAttr = attribute.find((a) => a === 'linguist-generated' || a.startsWith('linguist-generated='));
    if (!generiertAttr) continue;
    const wert = generiertAttr.includes('=') ? generiertAttr.slice(generiertAttr.indexOf('=') + 1) : 'true';
    if (wert === 'true') muster.push(globZuRegex(glob));
  }
  return muster;
}

/** Liest die `linguist-generated`-Muster aus der committeten `.gitattributes`. */
function leseGeneriertMuster(): RegExp[] {
  const pfad = join(WURZEL, '.gitattributes');
  if (!existsSync(pfad)) return [];
  return generiertMusterAusGitattributes(readFileSync(pfad, 'utf8'));
}

function istAusgeschlossen(relPfad: string, generiertMuster: RegExp[]): boolean {
  if (/\.generated\.tsx?$/.test(relPfad)) return true;
  // Review-Befund 5 (5.8.2026): relPfad ist bereits auf '/' normalisiert
  // (sammleDateien: `.split(sep).join('/')`) — der Vergleich MUSS also
  // ebenfalls '/' verwenden, nicht das OS-`sep` (auf POSIX identisch, auf
  // Windows wäre `sep` `\\` und der Vergleich hätte still nie gegriffen).
  if (relPfad.startsWith('src/tests/fixtures/')) return true;
  return generiertMuster.some((m) => m.test(relPfad));
}

// ─── Sammeln ────────────────────────────────────────────────────────────────

/**
 * Review-Befund 4 (5.8.2026, §6.7-Klasse): der `readdirSync`-Fehlschlag wurde
 * bisher UNTERSCHIEDSLOS geschluckt — sowohl für eine fehlende Scan-WURZEL
 * (`src/` oder `scripts/` existiert nicht, z. B. falsches `cwd`) als auch für
 * eine tiefer liegende, harmlose Race/Berechtigungs-Lücke. Im ersten Fall
 * lieferte das Tor still «0 Datei(en) geprüft» mit Exit 0 — ein Tor, das bei
 * kaputter Konfiguration grün meldet, ist gefährlicher als keines. Die
 * Scan-WURZEL wird jetzt VOR dem Rekursions-Einstieg geprüft und wirft hart;
 * der `try/catch` in `gehen()` bleibt NUR für tiefere Ebenen (dort ist ein
 * stiller Rückzug vertretbar: das schlimmste Ergebnis ist eine übersehene
 * Unterdatei, nicht ein leerer Gesamt-Scan).
 */
function sammleDateien(startVerzeichnis: string, generiertMuster: RegExp[]): string[] {
  const wurzelPfad = join(WURZEL, startVerzeichnis);
  if (!existsSync(wurzelPfad)) {
    throw new Error(
      `Scan-Wurzel fehlt: '${startVerzeichnis}/' (erwartet unter ${wurzelPfad}) — ` +
      `check:schlankheit muss VOR jedem Zeilen-Urteil wissen, dass es wirklich gescannt hat.`);
  }
  const treffer: string[] = [];
  const gehen = (verz: string): void => {
    let eintraege: string[];
    try {
      eintraege = readdirSync(verz);
    } catch {
      return;
    }
    for (const eintrag of eintraege) {
      if (eintrag === 'node_modules' || eintrag === 'dist' || eintrag.startsWith('.')) continue;
      const voll = join(verz, eintrag);
      const stat = statSync(voll);
      if (stat.isDirectory()) {
        gehen(voll);
      } else if (/\.tsx?$/.test(eintrag)) {
        const relPfad = relative(WURZEL, voll).split(sep).join('/');
        if (!istAusgeschlossen(relPfad, generiertMuster)) treffer.push(relPfad);
      }
    }
  };
  gehen(wurzelPfad);
  return treffer;
}

/** Zeilenzahl wie `wc -l`: Anzahl `\n`. Eine Datei ohne abschliessenden
 *  Zeilenumbruch zählt ihre letzte (unvollständige) Zeile bewusst NICHT —
 *  identisch zu `wc -l`, das Mass, gegen das die Schwelle 800 kalibriert ist. */
function zeilenzahl(pfad: string): number {
  const inhalt = readFileSync(pfad, 'utf8');
  let n = 0;
  for (const zeichen of inhalt) if (zeichen === '\n') n++;
  return n;
}

function messeBestand(): Map<string, number> {
  const generiertMuster = leseGeneriertMuster();
  const bestand = new Map<string, number>();
  for (const wurzel of SCAN_WURZELN) {
    for (const relPfad of sammleDateien(wurzel, generiertMuster)) {
      bestand.set(relPfad, zeilenzahl(join(WURZEL, relPfad)));
    }
  }
  return bestand;
}

// ─── Kernlogik (rein, testbar ohne fs) ─────────────────────────────────────

export interface SchlankheitBefund {
  rot: string[];
  hinweise: string[];
}

/**
 * Reine Prüf-Funktion: nimmt den GEMESSENEN Bestand (Pfad → Zeilenzahl) und
 * die eingecheckte Baseline (Pfad → Zeilenzahl am Baseline-Tag) entgegen.
 *
 *   - neue Datei > `schwelle` Zeilen, nicht in `baseline`            → rot
 *   - Baseline-Datei, deren aktuelle Zeilenzahl > baseline×(1+toleranz) → rot
 *   - Baseline-Datei jetzt < `schwelle` Zeilen                        → Hinweis
 *   - Baseline-Datei ohne aktuelle Entsprechung (gelöscht)            → Hinweis
 *   - alles andere (stabil, unter Schwelle, unter Toleranz)           → grün
 */
export function pruefeSchlankheit(
  aktuell: ReadonlyMap<string, number>,
  baseline: Readonly<Record<string, number>>,
  schwelle = SCHWELLE,
  toleranz = TOLERANZ,
): SchlankheitBefund {
  const rot: string[] = [];
  const hinweise: string[] = [];

  for (const [pfad, zeilen] of aktuell) {
    const baselineZeilen = baseline[pfad];
    if (baselineZeilen === undefined) {
      if (zeilen > schwelle) {
        rot.push(
          `${pfad}: NEU über der Schwelle — ${zeilen} Z. (Schwelle ${schwelle}). ` +
          `Entweder splitten (§6.6) oder bewusst in die Baseline aufnehmen (\`npm run schlankheit:update\`, ` +
          `mit Begründung im Commit).`);
      }
      continue;
    }
    const maxErlaubt = Math.floor(baselineZeilen * (1 + toleranz));
    if (zeilen > maxErlaubt) {
      const prozent = ((zeilen / baselineZeilen - 1) * 100).toFixed(1);
      rot.push(
        `${pfad}: ${zeilen} Z. — ${prozent}% über der Baseline (${baselineZeilen} Z., ` +
        `erlaubt bis ${maxErlaubt}). Churn-Regrowth (§6.6) — splitten statt Baseline stillschweigend mitwachsen lassen.`);
    } else if (zeilen < schwelle) {
      hinweise.push(`${pfad}: jetzt ${zeilen} Z. (< ${schwelle}) — kann aus der Baseline entfernt werden (\`npm run schlankheit:update\`).`);
    }
  }

  for (const pfad of Object.keys(baseline)) {
    if (!aktuell.has(pfad)) {
      hinweise.push(`${pfad}: Baseline-Eintrag ohne Datei mehr — gelöscht/verschoben? (\`npm run schlankheit:update\` räumt auf.)`);
    }
  }

  return { rot, hinweise };
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function ladeBaseline(): Record<string, number> {
  if (!existsSync(BASELINE_PFAD)) return {};
  return JSON.parse(readFileSync(BASELINE_PFAD, 'utf8')) as Record<string, number>;
}

function schreibeBaseline(bestand: ReadonlyMap<string, number>): void {
  const neu: Record<string, number> = {};
  for (const [pfad, zeilen] of bestand) {
    if (zeilen > SCHWELLE) neu[pfad] = zeilen;
  }
  const sortiert = Object.fromEntries(Object.entries(neu).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE_PFAD, JSON.stringify(sortiert, null, 2) + '\n', 'utf8');
}

function main(): void {
  const update = process.argv.includes('--update');

  let bestand: Map<string, number>;
  try {
    bestand = messeBestand();
  } catch (fehler) {
    console.error(`check:schlankheit ROT — ${(fehler as Error).message}`);
    process.exit(1);
  }

  // Review-Befund 4, zweiter Teil: Plausibilitäts-Guard zusätzlich zum
  // harten Wurzel-Fehler oben — falls beide Scan-Wurzeln existieren, aber aus
  // irgendeinem anderen Grund (z. B. ein künftiger Ausschluss-Bug, der ALLES
  // matcht) kein einziger Treffer zustande kommt, ist «0 Dateien geprüft»
  // ebenso kein plausibler Repo-Zustand wie eine fehlende Wurzel.
  if (bestand.size === 0) {
    console.error(
      'check:schlankheit ROT — 0 Dateien geprüft. Kein plausibler Repo-Zustand ' +
      '(§6.7: ein Tor, das bei leerem Scan still grün meldet, ist gefährlicher als keines). ' +
      'Scan-Wurzeln (src/, scripts/) und Ausschluss-Muster prüfen.');
    process.exit(1);
  }

  if (update) {
    const vorher = ladeBaseline();
    schreibeBaseline(bestand);
    const nachher = ladeBaseline();
    const hinzu = Object.keys(nachher).filter((p) => !(p in vorher));
    const weg = Object.keys(vorher).filter((p) => !(p in nachher));
    const geaendert = Object.keys(nachher).filter((p) => p in vorher && vorher[p] !== nachher[p]);
    console.log(`schlankheit:update — Baseline neu geschrieben (${Object.keys(nachher).length} Einträge).`);
    if (hinzu.length) console.log(`  + neu:      ${hinzu.join(', ')}`);
    if (weg.length) console.log(`  − entfernt: ${weg.join(', ')}`);
    for (const p of geaendert) console.log(`  ~ ${p}: ${vorher[p]} → ${nachher[p]} Z.`);
    if (!hinzu.length && !weg.length && !geaendert.length) console.log('  (keine Änderung gegenüber der bestehenden Baseline)');
    return;
  }

  const baseline = ladeBaseline();
  const { rot, hinweise } = pruefeSchlankheit(bestand, baseline);

  if (rot.length) {
    console.error(`check:schlankheit ROT — ${rot.length} Datei(en) über der §6.6-Schwelle:`);
    for (const z of rot) console.error(`  ✗ ${z}`);
    if (hinweise.length) {
      console.error(`\n  ${hinweise.length} weitere Hinweise (kein Rot):`);
      for (const h of hinweise) console.error(`  · ${h}`);
    }
    process.exit(1);
  }

  console.log(
    `check:schlankheit GRÜN — ${bestand.size} Datei(en) geprüft, ${Object.keys(baseline).length} ` +
    `Bestands-Einträge, keine Neuzugänge/Überschreitungen über der §6.6-Schwelle (${SCHWELLE} Z., Toleranz ${Math.round(TOLERANZ * 100)}%).`);
  if (hinweise.length) {
    console.log(`  ${hinweise.length} Hinweis(e) (kein Rot):`);
    for (const h of hinweise) console.log(`  · ${h}`);
  }
}

// Nur bei direktem CLI-Aufruf ausführen, NICHT beim Import durch den
// Vitest-Test (der importiert `pruefeSchlankheit` aus diesem Modul; ohne diese
// Weiche liefe bei jedem Testlauf zusätzlich ein echter fs-Scan inkl.
// möglichem `process.exit(1)`, der die Testsuite selbst abschiessen würde).
// `process.argv[1]` zeigt unter `vite-node` auf den vite-node-Binary-Pfad, nicht
// auf dieses Skript (geprüft) — darum die von Vitest selbst gesetzte
// Umgebungsvariable als verlässlicher Marker, kein Pfadvergleich.
if (!process.env.VITEST) main();
