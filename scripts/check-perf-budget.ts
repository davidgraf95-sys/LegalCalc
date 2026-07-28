// scripts/check-perf-budget.ts — Performance-Budget-Tor (QS-PERF, CLAUDE.md §15).
//
// Operationalisiert die Garantie «nicht merklich langsamer»: sichert die durch
// den vendor-react-Split (FAHRPLAN-PERFORMANCE Rank 5) erreichte Bundle-Topologie
// gegen Regression und schützt automatisiert vor der Doppel-React-Instanz, die
// der §9-Bug-Check sonst von Hand prüfen müsste.
//
// Bewusst Chrome-frei und deterministisch (CI-tauglich). Es liest ein bereits
// gebautes `dist/` — wie der e2e-Lauf gehört es in den DEPLOY-Pfad (nach
// `npm run build`), NICHT in den schnellen `gate` (der nicht baut). Die
// Lighthouse-Metrik-Schranken (CLS/LCP/TBT auf /gesetze/bund/OR unter 4× CPU)
// bleiben der manuelle Mess-Schritt im Deploy-Ritual (deploy-check), bis ein
// CI-Chrome verdrahtet ist.
//
// Budgets als gzip-Bytes (Auslieferungsgröße). Headroom bewusst eng genug, dass
// ein Zurückrutschen von react-dom/react-router in den Entry rot wird.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist', 'assets');

// gzip-Budgets. Stand 30.6.2026: entry 30 KB, vendor-react 73 KB.
const ENTRY_MAX = 60 * 1024;          // ~2× Headroom; fängt react-dom-Rückfall in den Entry
const VENDOR_REACT_MAX = 90 * 1024;   // react/-dom/-router(+scheduler) zusammen

const gz = (p: string): number => gzipSync(readFileSync(p)).length;
const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;

if (!existsSync(DIST)) {
  console.error('check:perf-budget — dist/assets/ fehlt. Zuerst `npm run build` (das Tor prüft das gebaute Bundle).');
  process.exit(1);
}

const files = readdirSync(DIST);
const entry = files.filter((f) => /^index-.*\.js$/.test(f));
const vendor = files.filter((f) => /^vendor-react-.*\.js$/.test(f));
const fehler: string[] = [];

console.log('check:perf-budget — Bundle-Topologie & -Budget:');

// 1) Genau EIN Entry-Chunk und EIN vendor-react-Chunk (stabile Cache-Topologie).
if (entry.length !== 1) fehler.push(`Entry-Chunk: erwartet genau 1 (index-*.js), gefunden ${entry.length}.`);
if (vendor.length !== 1) {
  fehler.push(`vendor-react-Chunk: erwartet genau 1 (vendor-react-*.js), gefunden ${vendor.length} — `
    + 'die React-Familie muss nach Rank 5 in EINEM stabil benannten Chunk liegen (vite.config manualChunks).');
}

// 2) gzip-Budgets.
if (entry.length === 1) {
  const g = gz(join(DIST, entry[0]));
  console.log(`  entry         ${entry[0]}  gzip ${kb(g)}  (Budget ${kb(ENTRY_MAX)})`);
  if (g > ENTRY_MAX) {
    fehler.push(`Entry-Chunk ${kb(g)} > Budget ${kb(ENTRY_MAX)} — meist react-dom/react-router zurück im Entry `
      + '(manualChunks-Regex prüfen) oder eine schwere, nicht lazy geladene Abhängigkeit.');
  }
}
if (vendor.length === 1) {
  const g = gz(join(DIST, vendor[0]));
  console.log(`  vendor-react  ${vendor[0]}  gzip ${kb(g)}  (Budget ${kb(VENDOR_REACT_MAX)})`);
  if (g > VENDOR_REACT_MAX) fehler.push(`vendor-react ${kb(g)} > Budget ${kb(VENDOR_REACT_MAX)}.`);
}

// 3) Doppel-React-Schutz: die react-dom-Client-Implementierung darf NUR im
//    vendor-react-Chunk liegen, nie zusätzlich im Entry (sonst zwei React-
//    Instanzen → «Invalid hook call»). Marker sind react-dom-interne Symbole.
if (entry.length === 1) {
  const src = readFileSync(join(DIST, entry[0]), 'utf8');
  if (/listenToAllSupportedEvents|onCommitFiberRoot/.test(src)) {
    fehler.push('react-dom-Implementierung im Entry-Chunk gefunden — Doppel-Instanz-Risiko '
      + '(manualChunks greift nicht; der Entry darf react-dom nur IMPORTIEREN, nicht enthalten).');
  }
}

// 4) DATEN-Nutzlast auf dem kritischen Pfad (Befund Gegenprüfung 20.7.2026).
//    Das Tor prüfte ausschliesslich dist/assets/*.js und fasste public/**/*.json
//    nie an — der grösste Einzelposten von /rechtsprechung lag damit vollständig
//    ausserhalb des Budgets. «check:perf-budget grün» war für den Datenzuwachs
//    des Richter-Fundaments (+118 KB gzip auf register.json) eine leere
//    Zusicherung. register.json lädt zudem NICHT nur auf /rechtsprechung: die
//    Shell zieht es für jeden Inhaltspfad (Breadcrumb-Label), also faktisch auf
//    jeder Gesetzes-Leserseite. Ohne Schranke wächst die Achse mit jedem weiteren
//    Kanton unbemerkt weiter (§15).
//    W2·5 (25.7.2026): der Artikel-Suchindex kommt dazu — der mit Abstand
//    grösste Einzelposten. Er liegt NICHT auf dem kritischen Pfad (lazy, lädt erst
//    beim ersten Tastendruck in der Suche), gehört aber trotzdem unter eine
//    Schranke, weil der kantonale Korpus mit 1 231 Erlassen erklärtermassen
//    unvollständig ist und weiter wächst.
//
//    Herleitung der Schranke (gemessen 25.7.2026, nicht gegriffen):
//      · heute        9 667 KB gzip (54 444 Artikel: Bund 25 389 + Kanton 29 055)
//      · davon Kanton ~4 399 KB für 1 231 Erlasse  ⇒  ~3.6 KB gzip je Erlass
//      · Budget      10 400 KB  ⇒  ~733 KB Luft  ⇒  ~200 weitere Kanton-Erlasse
//    Der eigentliche Schmerz ist nicht die Leitung, sondern der CLIENTSEITIGE
//    Indexaufbau: er skaliert mit der Artikelzahl und lag bei dieser Grösse
//    bereits bei ~6.1 s (node) bzw. 5.3 s bis zur ersten Trefferanzeige im
//    Browser — auf dem ~3.9× langsameren CI-Runner reichte das, um die
//    Browser-Smoke-Suite reissen zu lassen. Die Schranke soll also anschlagen,
//    BEVOR jemand das merkt: ~200 Erlasse (gut ein weiterer mittlerer Kanton)
//    passen durch, ein Massenimport nicht. Wer sie anhebt, hebt bewusst auch die
//    Wartezeit bis zum ersten Treffer an — dann gehört die Staffelung
//    (artikelVolltext.ts, `baue()`) mit überdacht, nicht bloss die Zahl.
//
//    W2·6-NKEY (28.7.2026): der Eintrag `norm-index.json` wandert auf
//    `norm-index-erlasse.json`. Das ist KEINE Deckel-Anhebung, sondern ein
//    Wechsel des gemessenen Objekts — und der Grund gehört hierher, weil die
//    naheliegende Lesart («Budget wurde stillschweigend weicher») falsch wäre:
//      · Der normKeys-Backfill (Dekret W2·6-NKEY: erst vollständig erkennen,
//        dann kuratieren) hob die Erlass-Buckets von 25 auf 157 und die
//        Artikel-Buckets von 355 auf 4473. norm-index.json wuchs dadurch von
//        204 auf 731 KB gzip — gegen diese 260-KB-Schranke.
//      · Auf dem Nutzerpfad (kontextEntscheide → Verweis-Popover) braucht aber
//        nur die ERLASS-Ebene geladen zu werden. Sie liegt seit W2·6-NKEY als
//        eigene Projektion vor (schreibeKorpus schreibt beide aus derselben
//        Quelle, Byte-Gleichheit prüft check:entscheide) und misst 93 KB gzip.
//        `rechtsprechungFuerErlass()` zieht nur noch diese Datei.
//      · Der Monolith trägt zusätzlich die Artikel-Ebene und ist damit reines
//        Build-/Prüf-Artefakt: zur Laufzeit bedienen ihn nur noch Tests und die
//        server-seitige Gegenprüfung (`rechtsprechungFuerArtikel`), die UI nimmt
//        die 157 Shards. Seine Grösse deckelt `NORM_INDEX_BUDGET_MB` in
//        scripts/normtext/check-entscheide.ts (Datei auf der Platte), die je
//        Leserseite geladene Menge der dortige Per-Shard-Deckel.
//      · Schranke = Ist 93 KB + ~30 % Reserve, gerundet. Sie bremst genau das,
//        was hier zählt: ein Weiterwachsen der Erlass-Ebene auf dem kritischen
//        Pfad. §15-Logikverlust-Bewertung: keiner — identische Daten, identische
//        Rückgabe von rechtsprechungFuerErlass(), nur weniger Bytes.
//    Wer `ladeNormIndex()` (Gesamt-JSON) wieder in eine Komponente holt, bringt
//    den Monolithen auf den kritischen Pfad zurück und muss ihn hier wieder
//    eintragen — der Kommentar an `ladeNormIndex` sagt dasselbe.
const DATEN_BUDGET: readonly (readonly [string, number])[] = [
  ['public/rechtsprechung/register.json', 780 * 1024],
  ['public/rechtsprechung/richter.json', 24 * 1024],
  ['public/rechtsprechung/norm-index-erlasse.json', 120 * 1024],
  ['public/such-index/artikel.json', 10_400 * 1024],
];
// GEMESSEN WIRD DIE AUSGELIEFERTE KOPIE in dist/ — mit public/ nur als Rückfall.
// Grund (CI-Befund 25.7.2026): `public/such-index/artikel.json` ist gitignored und
// entsteht erst im Build-Schritt. Der Perf-Budget-Job lädt das gebaute `dist/`
// herunter, hat aber kein `public/` mit Index — das Tor lief darum rot mit
// «fehlt — Budget nicht prüfbar», obwohl die Datei existierte. `vite build`
// kopiert public/ nach dist/, also liegt dort BEIDES. dist/ ist ohnehin das
// richtigere Mass: es ist die Datei, die der Nutzer wirklich bekommt.
const daten = (rel: string): string | null => {
  const inDist = join(process.cwd(), 'dist', rel.replace(/^public\//, ''));
  if (existsSync(inDist)) return inDist;
  const inPublic = join(process.cwd(), rel);
  return existsSync(inPublic) ? inPublic : null;
};
console.log('check:perf-budget — Daten-Nutzlast (gzip):');
for (const [rel, max] of DATEN_BUDGET) {
  const p = daten(rel);
  if (!p) { fehler.push(`${rel} fehlt (weder in dist/ noch in public/) — Budget nicht prüfbar.`); continue; }
  const g = gz(p);
  console.log(`  ${rel.replace('public/', '')}  gzip ${kb(g)}  (Budget ${kb(max)})`);
  if (g > max) {
    fehler.push(`${rel} ${kb(g)} > Budget ${kb(max)} — Daten-Nutzlast auf dem kritischen Pfad. `
      + 'Entweder die Projektion verschlanken (Felder/Rollen auslagern) oder das Budget bewusst anheben.');
  }
}

if (fehler.length) {
  console.error('\ncheck:perf-budget ROT:');
  for (const f of fehler) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('check:perf-budget GRÜN — Bundle-Budget eingehalten, Single-React-Topologie stabil.');
