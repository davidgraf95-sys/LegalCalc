// scripts/check-tor-paritaet.ts — CI/lokal-Tor-Parität (F2b).
//
// BEFUND 20.7.2026: `check:seriell` verkettet 34 Tore, `ci.yml` ruft davon 7.
// 27 Tore laufen also NUR lokal. Lokal grün ist damit keine Aussage über CI —
// und CI kann strukturell nie melden, dass ein Tor fehlt. Genau diese Blindheit
// ist die Fehlerklasse «schweigendes Tor» eine Ebene höher.
//
// Dieses Tor friert die Lücke ein: jedes Tor, das nicht in CI läuft, braucht
// einen begründeten Allowlist-Eintrag. Ein NEU hinzugefügtes Tor ohne CI-Lauf
// und ohne Eintrag macht dieses Tor rot. Die Lücke kann nur kleiner werden.
//
// NACHTRAG 20.7.2026 (adversariale Prüfung): Das Tor stand SELBST auf seiner
// Allowlist — mit dem Grund «dieses Tor selbst — prüft die Liste, steht nicht
// in ihr». Der Satz war sachlich falsch (es steht sehr wohl in `check:seriell`,
// sonst bräuchte es keinen Eintrag) und die Wirkung war rekursiv F2b: der
// Melder unsichtbarer Tore war selbst unsichtbar. Ein PR, der ein Tor ohne
// CI-Verdrahtung hinzufügt und lokal kein `npm run gate` fährt, blieb
// unbemerkt. Das Tor läuft jetzt in ci.yml und steht auf keiner Liste mehr.
// Ebenso entfielen check:besetzung/entscheide/bs-entscheide, deren
// DB-Begründung nachweislich falsch war (sie lesen committete Projektionen).
//
// SCHÄRFUNG 15.8.2026 (QS-AUTOMATIK-PARITAET, Fahrplan §3.5 lit. a) — Anlass
// #425: 226 Normtext-Snapshots ohne `daten-manifest.json`-Nachzug passierten das
// PR-CI GRÜN. Regel (1) zählte `check:datenhaltung` als «gedeckt», weil es in
// `turso-sync.yml` lief — einem POST-merge-Wächter. Ein Wächter kann keinen
// Merge verhindern: er meldet erst, wenn der Schaden auf `main` steht (damals
// rot um 21:52, Serving-Sync danach still). «Läuft in irgendeinem Workflow» war
// darum die falsche Frage. Ab hier gilt:
//
//   PR-DECKUNG  = der Workflow hat einen `pull_request`-Trigger (heute nur
//                 ci.yml). NUR sie befreit vom Allowlist-Zwang, denn nur sie
//                 steht VOR dem Merge.
//   WÄCHTER-DECKUNG = schedule/push-Workflows. Sie ist ein Nachweis, keine
//                 Schranke — und begründet höchstens einen ALLOWLIST-Eintrag
//                 mit dem Wächter als benanntem Ersatz-Arbiter (Regel 3 bindet
//                 den Workflow-Verweis bereits maschinell).
//
// SCHÄRFUNG 5.9.2026 (QS-EFFIZIENZ, Beleg #712): Bisher prüfte dieses Tor nur
// eine Richtung (seriell → CI). Beleg: `check:testtreue` lief in ci.yml, aber
// NICHT in `check:seriell`/`scripts/gate.sh` — lokal grün sagte nichts über
// CI. Ab hier gilt zusätzlich die GEGENRICHTUNG: jedes `check:*`-Tor, das
// ci.yml (PR-Pfad) aufruft, muss auch LOKAL laufen — in `check:seriell` ODER
// in `scripts/gate.sh` (dessen `run "<name>" …`-Zeilen, `voll`-Modus zählt;
// gebunden über den npm-Alias ODER, wo gate.sh das Skript direkt statt über
// den Alias aufruft (zh-vollstaendigkeit/zh-randtitel), über den Skript-Pfad
// aus package.json). Fehlt beides, ist das Tor ROT — Eskalation: Tor lokal
// verdrahten oder mit ehrlichem Grund in `ALLOWLIST_NUR_CI` eintragen.
import { readFileSync, readdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};

/** Tore aus der `check:seriell`-Kette, in Reihenfolge. */
function seriellTore(): string[] {
  const kette = pkg.scripts['check:seriell'];
  if (!kette) throw new Error('check:seriell fehlt in package.json — Kette umbenannt?');
  return [...kette.matchAll(/npm run (check:[a-z0-9:-]+)/g)].map((m) => m[1]);
}

/**
 * Direkte Schlüssel des `on:`-Blocks eines Workflows — also die Ereignisse, auf
 * die er reagiert. Beide YAML-Formen: Block (`on:` + eingerückte Kinder) und
 * inline (`on: [push, pull_request]` / `on: push`).
 *
 * `null` heisst «kein `on:`-Block gefunden». Das wird vom Aufrufer als ROT
 * behandelt, nie als «also kein PR-Trigger» (§6.7 lit. b: eine nicht getroffene
 * Feststellung darf nie stillschweigend zur günstigen Feststellung werden —
 * sonst verschwände die PR-Deckung eines Workflows durch einen Tippfehler in
 * seinem eigenen Kopf, und die Sonde meldete Ruhe).
 */
function ereignisse(inhalt: string): Set<string> | null {
  const zeilen = inhalt.split('\n');
  const start = zeilen.findIndex((z) => /^["']?on["']?\s*:/.test(z));
  if (start === -1) return null;

  const rest = zeilen[start].replace(/^["']?on["']?\s*:/, '').replace(/#.*$/, '').trim();
  if (rest) {
    // Inline-Form: `on: push` oder `on: [push, pull_request]`.
    return new Set(rest.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean));
  }

  // Block-Form: alle Kinder auf der GERINGSTEN Einrücktiefe des Blocks. Tiefere
  // Zeilen sind Unterschlüssel (`branches:`, `- cron:`) und keine Ereignisse.
  const block: string[] = [];
  for (const z of zeilen.slice(start + 1)) {
    if (/^\S/.test(z)) break;                 // Spalte 0 ⇒ nächster Top-Level-Schlüssel
    if (!z.trim() || /^\s*#/.test(z)) continue; // Leerzeile / Kommentarzeile
    block.push(z);
  }
  if (!block.length) return new Set();
  const tiefe = Math.min(...block.map((z) => z.length - z.trimStart().length));
  const namen = new Set<string>();
  for (const z of block) {
    if (z.length - z.trimStart().length !== tiefe) continue;
    const m = /^\s*([a-z_]+)\s*:/.exec(z);
    if (m) namen.add(m[1]);
  }
  return namen;
}

/**
 * Tore, die `scripts/gate.sh` im `voll`-Modus tatsächlich AUSFÜHRT (nicht nur
 * in einem Kommentar erwähnt) — zwei Bindungsformen:
 *   (a) der npm-Alias steht wörtlich da: `npm run check:<name>` (z. B.
 *       `run "testtreue" npm run check:testtreue`).
 *   (b) gate.sh ruft das zugrundeliegende Skript DIREKT auf, ohne den Alias zu
 *       nennen (Beleg: `check:zh-vollstaendigkeit`/`check:zh-randtitel` laufen
 *       dort als `npx vite-node scripts/normtext/check-zh-…ts -- --artefakt`).
 *       Gebunden über den Skript-PFAD aus package.json — dieselbe Artefakt-
 *       statt-Namens-Bindung wie Regel (3) unten.
 * Kommentarzeilen (`#…`) zählen nie als Ausführung — sonst meldete eine
 * Kopf-Doku über ein Tor bereits dessen Deckung (dieselbe Falle wie in
 * `ereignisse()`/`ciTore()` oben).
 */
function gateShAbgedeckt(): Set<string> {
  const inhalt = readFileSync('scripts/gate.sh', 'utf8')
    .split('\n')
    .filter((z) => !/^\s*#/.test(z))
    .join('\n');
  const abgedeckt = new Set<string>();
  for (const m of inhalt.matchAll(/npm run (check:[a-z0-9:-]+)/g)) abgedeckt.add(m[1]);
  for (const [name, cmd] of Object.entries(pkg.scripts)) {
    if (!name.startsWith('check:') || abgedeckt.has(name)) continue;
    const pfad = /(scripts\/\S+\.(?:ts|tsx|mjs|sh))\b/.exec(cmd)?.[1];
    if (pfad && inhalt.includes(pfad)) abgedeckt.add(name);
  }
  return abgedeckt;
}

/** Zeilennummern (1-basiert) in ci.yml, an denen `npm run <tor>` vorkommt —
 *  die «Fundstelle» für die Fehlermeldung von Regel (4). */
function ciYmlFundstellen(tor: string): number[] {
  const zeilen = readFileSync('.github/workflows/ci.yml', 'utf8').split('\n');
  const treffer: number[] = [];
  const muster = new RegExp(`npm run ${tor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  zeilen.forEach((z, i) => { if (muster.test(z)) treffer.push(i + 1); });
  return treffer;
}

type Deckung = { pr: string[]; waechter: string[] };

/**
 * Tore, die ein Workflow unter .github/workflows/ aufruft — getrennt nach
 * PR-Deckung (Workflow mit `pull_request`-Trigger, steht VOR dem Merge) und
 * Wächter-Deckung (schedule/push, steht DANACH). Siehe Kopf-Kommentar.
 */
function ciTore(): { deckung: Map<string, Deckung>; ohneOn: string[] } {
  const deckung = new Map<string, Deckung>();
  const ohneOn: string[] = [];
  const dir = '.github/workflows';
  for (const datei of readdirSync(dir)) {
    if (!/\.ya?ml$/.test(datei)) continue;
    const inhalt = readFileSync(`${dir}/${datei}`, 'utf8');
    const ev = ereignisse(inhalt);
    if (ev === null) ohneOn.push(datei);
    const istPr = ev !== null && (ev.has('pull_request') || ev.has('pull_request_target'));
    // Nur echte `run:`-Zeilen zählen — ein Tor, das bloss im Kommentar erwähnt
    // wird, läuft nicht (und hat genau diesen Irrtum schon einmal erzeugt).
    for (const zeile of inhalt.split('\n')) {
      const ohneKommentar = zeile.replace(/^\s*#.*$/, '');
      for (const m of ohneKommentar.matchAll(/npm run (check:[a-z0-9:-]+)/g)) {
        const d = deckung.get(m[1]) ?? { pr: [], waechter: [] };
        const liste = istPr ? d.pr : d.waechter;
        if (!liste.includes(datei)) liste.push(datei);
        deckung.set(m[1], d);
      }
    }
  }
  return { deckung, ohneOn };
}

/**
 * Begründete Ausnahmen: Tore, die bewusst NICHT in CI laufen.
 * Jeder Eintrag braucht einen Grund — «historisch gewachsen» ist keiner.
 * Wer ein Tor hier einträgt, erklärt damit, dass sein Nicht-Laufen in CI
 * ein bewusster Entscheid ist und nicht ein Versehen.
 */
const ALLOWLIST: Record<string, string> = {
  // check:entscheide / check:bs-entscheide / check:besetzung standen hier bis
  // 20.7.2026 mit «braucht rechtsprechung.db (488 MB)». Das war sachlich falsch:
  // sie lesen die committeten Projektionen unter public/rechtsprechung/
  // (ladeBestandSnapshots), nicht die DB — gemessen je ~1 s grün unter CI=1.
  // Alle drei laufen jetzt in ci.yml. Der Eintrag entfiel damit ersatzlos.
  //
  // 18 weitere Einträge (design-tokens, farbwelt, seo-index, verfall-ui,
  // zaehler, tabellen, invarianten, p-klassen, bilder, vollstaendigkeit,
  // artikel-revisionen, historie, grundart, linien-kanon, revisionen, pdf,
  // pdf-quellen, zyklen) entfielen am 21.7.2026 mit der R1-Verdrahtung dieser
  // Tore in ci.yml (Tor-Wirksamkeits-Audit #318: 17 von 20 Delegations-
  // Begründungen hielten der Sabotage-Probe nicht stand).
  // Eingetragen 15.8.2026 mit der Schärfung (QS-AUTOMATIK-PARITAET lit. b).
  // Bis dahin galt es als «gedeckt», weil es in zwei schedule-Workflows läuft —
  // genau die Gleichsetzung, die #425 durchliess. Es ist aber das EINZIGE der
  // fünf nur-wächter-gedeckten Tore, das bewusst nicht in den PR-Pfad gehört:
  // sein Ergebnis hängt an der Wanduhr, nicht am Diff (K7, 3.8.2026, Beleg
  // Lauf 30764225649 — ein abgelaufener Registertermin färbte ALLE offenen PRs
  // rot). Die anderen vier sind am 15.8.2026 in ci.yml verdrahtet.
  'check:verfall':
    'wanduhr-abhängig statt diff-abhängig — ein ablaufender Registertermin färbt sonst alle offenen PRs rot (K7, Lauf 30764225649). Ersatz-Arbiter: normen-monitor.yml (wöchentlich, mit Vorlauf-Warnung) und fedlex-frische.yml (vor jedem Reparatur-PR); zusätzlich lokal in check:seriell vor jedem Deploy',
  'check:materialien': 'braucht daten/*.db für die Byte-Reprojektion (CI-Zweig prüft committete Shards)',
  'check:gegenpruefung': 'liest den Working Tree, der in CI sauber ist; protokolliert unter CI=1 ausdrücklich SKIP (§6 Ziff. 7 lit. b) — Arbiter für den committeten Bereich ist check:merge-schutz in ci.yml',
  'check:schlankheit': 'lokal-warnend im gate, nicht Required — Zeilen-Wächter mit Baseline; ein Required-Rot bei Bestands-Regrowth würde fremde PRs blockieren, Eskalationsweg ist schlankheit:update mit Commit-Begründung',
  'check:feed': 'neu (Gegenprüfung QS-VERWENDEN V5/V6, 2.9.2026, H-2) — ci.yml war für diesen Bau-Auftrag TABU (baut eine andere Einheit, parallele PRs); Verdrahtung in den PR-Pfad ist ein eigener, nachgelagerter Schritt (Folge-PR verdrahtet check:feed im Tore-Job von ci.yml, analog check:datenhaltung). Bis dahin lokal in check:seriell/gate vor jedem Deploy.',
};

/**
 * GEGENRICHTUNG (SCHÄRFUNG 5.9.2026, s. Kopf): Tore, die ci.yml im PR-Pfad
 * aufruft, aber die bewusst NICHT lokal (in `check:seriell`/`gate.sh`) laufen.
 * Jeder Eintrag braucht einen wahren, kurzen Grund — sonst gehört das Tor
 * lieber lokal verdrahtet.
 */
const ALLOWLIST_NUR_CI: Record<string, string> = {
  'check:merge-schutz':
    'vergleicht den GANZEN Feature-Branch (origin/main..HEAD) auf Gegenprüfungs-Verdikt + Register-Wachstum — während eines laufenden Risikopfad-Baus (vor Abschluss der Gegenprüfung) wäre es bei jedem WIP-Commit zwangsläufig rot. Das lokale Pendant ist die Gegenprüfung selbst (Skill `gegenpruefung`, dokumentiert per `gegenpruefung:ok`), nicht dieses Tor. Arbiter bleibt ci.yml (PR-Pfad).',
  'check:perf-budget':
    'braucht `dist/assets/` (Build-Artefakt aus `npm run build`) — kein Gate-Schritt baut vor jedem Lauf. Lokal bei Bedarf: `npm run build && npm run check:perf-budget`.',
  'check:perf-lighthouse':
    'braucht `dist/` (Build-Artefakt) und eine echte Chrome/Lighthouse-Messung über mehrere Läufe für den Median (mehrere Minuten) — ungeeignet für einen Gate-Lauf bei jedem WIP-Commit. Arbiter bleibt ci.yml (Job Perf, PR-Pfad).',
};

const seriell = seriellTore();
const { deckung, ohneOn } = ciTore();
const prGedeckt = (t: string): string[] => deckung.get(t)?.pr ?? [];
const waechterGedeckt = (t: string): string[] => deckung.get(t)?.waechter ?? [];
const gateSh = gateShAbgedeckt();
// Jedes check:*-Tor, das mindestens ein PR-getriggerter Workflow aufruft —
// heute nur ci.yml (s. Kopf). Das ist die Grundmenge für die Gegenrichtung.
const alleCiPrTore = [...deckung.entries()].filter(([, d]) => d.pr.length > 0).map(([t]) => t).sort();
const lokalGedeckt = (t: string): boolean => seriell.includes(t) || gateSh.has(t);
const fehler: string[] = [];

// (0) Ein Workflow ohne lesbaren `on:`-Block kann nicht als PR-Deckung gewertet
//     werden — und das wird gesagt, nicht angenommen (§6.7 lit. b).
for (const datei of ohneOn) {
  fehler.push(
    `  ${datei}: kein lesbarer 'on:'-Block — die Sonde kann PR- nicht von ` +
    `Wächter-Deckung unterscheiden.\n` +
    `      → Trigger-Kopf reparieren; bis dahin ist jede Deckung durch diesen Workflow ungeklärt.`);
}

// (1) Jedes serielle Tor läuft im PR-PFAD ODER steht begründet auf der Allowlist.
//     Wächter-Deckung allein genügt NICHT (Schärfung 15.8.2026, s. Kopf).
for (const t of seriell) {
  if (prGedeckt(t).length || t in ALLOWLIST) continue;
  const w = waechterGedeckt(t);
  fehler.push(
    w.length
      ? `  ${t}: NUR wächter-gedeckt (${w.join(', ')}) — kein Workflow mit pull_request-Trigger fährt es.\n` +
        `      Ein post-merge-Wächter meldet, er verhindert keinen Merge (#425).\n` +
        `      → entweder in .github/workflows/ci.yml (Tore-Job) verdrahten,\n` +
        `      → oder in ALLOWLIST von scripts/check-tor-paritaet.ts eintragen, mit dem\n` +
        `        Wächter als benanntem Ersatz-Arbiter (Regel 3 bindet den Verweis maschinell).`
      : `  ${t}: läuft in KEINEM Workflow und steht nicht auf der Allowlist.\n` +
        `      → entweder in .github/workflows/ci.yml verdrahten,\n` +
        `      → oder in ALLOWLIST von scripts/check-tor-paritaet.ts mit GRUND eintragen.`);
}

// (2) Verrottete Allowlist: ein Eintrag, dessen Tor inzwischen im PR-Pfad läuft
//     oder der gar kein serielles Tor (mehr) ist, ist tote Regel und wird
//     gemeldet. Wächter-Deckung macht einen Eintrag NICHT überholt — sie ist
//     genau der Zustand, den er begründet.
for (const [t, grund] of Object.entries(ALLOWLIST)) {
  if (!seriell.includes(t)) {
    fehler.push(`  ${t}: steht auf der Allowlist, ist aber nicht (mehr) in check:seriell — Eintrag streichen.`);
  } else if (prGedeckt(t).length) {
    fehler.push(
      `  ${t}: läuft inzwischen im PR-Pfad (${prGedeckt(t).join(', ')}), Allowlist-Eintrag ist überholt — streichen.\n` +
      `      (alter Grund: ${grund})`);
  }
}

// (3) Nennt ein Grund einen Workflow als Ersatz-Arbiter, muss dieser Workflow
//     existieren. Neun Eintraege tragen dieselbe Sammelbegruendung
//     «Drift-Arbiter ist fedlex-frische.yml» — als Prosa ist das nicht
//     ueberpruefbar und war genau der Einwand der adversarialen Pruefung
//     (20.7.2026). Statt neun Mal denselben Satz umzuformulieren, wird die
//     Behauptung MASCHINELL gebunden: verschwindet der genannte Workflow,
//     wird der Verweis rot statt still falsch zu werden.
const vorhandeneWorkflows = new Set(readdirSync('.github/workflows'));
for (const [t, grund] of Object.entries(ALLOWLIST)) {
  for (const m of grund.matchAll(/([a-z0-9-]+\.ya?ml)/g)) {
    if (!vorhandeneWorkflows.has(m[1])) {
      fehler.push(
        `  ${t}: Grund nennt '${m[1]}' als Ersatz-Arbiter, aber ` +
        `.github/workflows/${m[1]} existiert nicht.\n` +
        `      → Der Verweis ist tot: entweder Tor in CI verdrahten oder Grund korrigieren.`);
    }
  }
}

// (4) GEGENRICHTUNG (SCHÄRFUNG 5.9.2026): jedes Tor, das ci.yml im PR-Pfad
//     aufruft, läuft auch LOKAL (check:seriell ODER gate.sh) oder steht
//     begründet auf ALLOWLIST_NUR_CI. Beleg #712: check:testtreue lief in
//     ci.yml, aber nirgends lokal — lokal grün war keine Aussage über CI.
for (const t of alleCiPrTore) {
  if (lokalGedeckt(t) || t in ALLOWLIST_NUR_CI) continue;
  const zeilen = ciYmlFundstellen(t).join(', ') || '?';
  fehler.push(
    `  ${t}: läuft in ci.yml (Zeile ${zeilen}), aber in KEINER lokalen Kette ` +
    `(check:seriell/gate.sh) — lokal grün sagt nichts über CI (Beleg #712).\n` +
    `      → in check:seriell oder gate.sh verdrahten, oder mit GRUND in ` +
    `ALLOWLIST_NUR_CI (scripts/check-tor-paritaet.ts) eintragen.`);
}

// (5) Verrottete ALLOWLIST_NUR_CI: ein Eintrag, dessen Tor inzwischen doch
//     lokal läuft oder ci.yml gar nicht mehr aufruft, ist tote Regel.
for (const [t, grund] of Object.entries(ALLOWLIST_NUR_CI)) {
  if (!alleCiPrTore.includes(t)) {
    fehler.push(`  ${t}: steht auf ALLOWLIST_NUR_CI, ruft aber keinen PR-Workflow (ci.yml) mehr auf — Eintrag streichen.`);
  } else if (lokalGedeckt(t)) {
    fehler.push(
      `  ${t}: läuft inzwischen lokal (check:seriell/gate.sh) — ALLOWLIST_NUR_CI-Eintrag ist überholt, streichen.\n` +
      `      (alter Grund: ${grund})`);
  }
}

const imPrPfad = seriell.filter((t) => prGedeckt(t).length);
const nurWaechter = seriell.filter((t) => !prGedeckt(t).length && waechterGedeckt(t).length);
const nurCi = alleCiPrTore.filter((t) => !lokalGedeckt(t) && t in ALLOWLIST_NUR_CI);

if (fehler.length) {
  console.log(`check:tor-paritaet ROT — ${fehler.length} Abweichung(en):\n${fehler.join('\n')}`);
  process.exit(1);
}

console.log(
  `check:tor-paritaet OK — ${seriell.length} Tore in check:seriell: ` +
  `${imPrPfad.length} laufen im PR-Pfad (vor dem Merge), ` +
  `${seriell.length - imPrPfad.length} begründet auf der Allowlist ` +
  `(davon ${nurWaechter.length} mit Wächter als Ersatz-Arbiter). ` +
  `Kein Tor nur wächter-gedeckt ohne Eintrag. ` +
  `Gegenrichtung: ${alleCiPrTore.length} Tore ruft ci.yml im PR-Pfad auf, ` +
  `${alleCiPrTore.length - nurCi.length} davon laufen auch lokal ` +
  `(check:seriell/gate.sh), ${nurCi.length} begründet auf ALLOWLIST_NUR_CI. ` +
  `Kein Tor nur-CI ohne Eintrag.`);
