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
//        dann kuratieren) hob die Erlass-Buckets von 25 auf 156 und die
//        Artikel-Buckets von 355 auf 4452. norm-index.json wuchs dadurch von
//        204 auf 724 KB gzip — gegen diese 260-KB-Schranke.
//        (Zahlen am Landungsstand nachgemessen; die Erstfassung dieses
//        Kommentars trug 157/4473/731 — den Stand VOR dem Rückbau der
//        Häufigkeits-Schwelle aus Gegenprüfungs-Runde R3.)
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
//
//    UND DIE ANDERE HÄLFTE DERSELBEN MESSUNG (28.7.2026, Linse 4 — gehört hierher,
//    weil das Obige sonst wie eine reine Entlastungsgeschichte liest): DERSELBE
//    normKeys-Backfill hat `register.json` um ~27.5 KB gzip auf 756.9 KB gehoben,
//    gegen die 780-KB-Schranke — 97 % Deckel-Ausnutzung. Ursache ist dieselbe
//    Vollständigkeit: `normKeys` steht je Entscheid IM Browse-Register, und der
//    Backfill füllte es von 21.9 % auf 99.9 % der 5093 Entscheide.
//    Der BREITESTE Pfad trägt die Abdeckung also mit, und er hat dafür am wenigsten
//    Luft: register.json lädt jede Rechtsprechungs-Seite, nicht nur ein Popover.
//    Bewusst NICHT hier gelöst — eine Schranke anzuheben, weil man an sie stösst,
//    ist keine Massnahme, sondern deren Gegenteil (§8). Die Verschlankung
//    (normKeys aus dem Browse-Register in eine eigene Projektion, wie es
//    richter.json für die Spruchkörper-Slugs schon vormacht) ist als Folgearbeit
//    benannt; bis dahin gilt: wer register.json weiter belädt, reisst das Tor.
const DATEN_BUDGET: readonly (readonly [string, number])[] = [
  ['public/rechtsprechung/register.json', 780 * 1024],
  ['public/rechtsprechung/richter.json', 24 * 1024],
  ['public/rechtsprechung/norm-index-erlasse.json', 120 * 1024],
  ['public/such-index/artikel.json', 10_400 * 1024],
  // ── W2·7-BEZUG: die drei grössten Bezugs-Shards ───────────────────────────
  //
  // Ein Nutzer lädt immer genau EINEN Shard (den seines Erlasses), nie die
  // Summe — die richtige Schranke ist darum der Grösste, nicht das Verzeichnis.
  //
  // DREI Einträge, nicht zwei (Gegenprüfung Runde 1/I3): die erste Fassung
  // nannte StPO den «grössten Normalfall» und liess BV ungedeckelt — obwohl BV
  // mit 123.3 KB gzip GRÖSSER ist als StPO mit 102.0. Der Satz widersprach der
  // Tabelle, die zwei Zeilen darunter stand, und das Loch, das er begründete,
  // war das grösste der drei. Jetzt steht jede der drei Grössenordnungen unter
  // eigener Schranke: BGG als Ausreisser, BV und StPO als das, was ein grosser
  // Erlass normalerweise kostet.
  //
  // B7 (David-Auftrag 28.7.2026) hat den Auslieferungs-Deckel «8 je Status»
  // aufgehoben: statt 24'173 stehen 75'365 Kanten in den Shards, weil jetzt
  // JEDE Kante eines Artikels ausgeliefert wird. Die Budgets werden deshalb
  // angehoben — nicht, weil man an sie gestossen ist, sondern weil sie für eine
  // Datenmenge bemessen waren, die es so nicht mehr gibt (§8: das ist der
  // Unterschied zwischen einer Massnahme und ihrem Gegenteil).
  //
  // GEMESSEN 29.7.2026 (`gzip -6 -c … | wc -c`, Bytes/1024), nach der
  // kompakteren Serialisierung (`serialisiereShard`, bezuege-bauen.ts). Die
  // Vorher-Werte sind aus `git show origin/main:<pfad>` durch dieselbe Pipe
  // gemessen, nicht erinnert (Gegenprüfung Runde 1/I2 — dort stand für BGG
  // «25.1», eine Zahl, die sich bei keiner gzip-Stufe reproduzieren liess):
  //   BGG   307'390 B = 300.2 KB   (vorher  45'136 B = 44.1 KB) — Faktor 6.8
  //   BV    126'210 B = 123.3 KB   (vorher  47'952 B = 46.8 KB) — Faktor 2.6
  //   StPO  104'483 B = 102.0 KB   (vorher  65'137 B = 63.6 KB) — Faktor 1.6
  //   StGB   79'663 B =  77.8 KB   (vorher  57'644 B = 56.3 KB)
  // BGG ist der Ausreisser, weil Art. 42 BGG allein 4'140 Kanten trägt: ihn
  // zitiert praktisch jedes Bundesgerichtsurteil zur Beschwerdebegründung.
  //
  // WARUM 300 KB gzip TRAGBAR SIND (§15, Logikverlust-Bewertung: KEINER — es
  // wird nichts weggelassen, nur mehr geliefert): der Shard liegt NICHT auf dem
  // kritischen Pfad. Er wird nur geladen, wenn überhaupt eine Instanz-Facette
  // aktiv ist (`bezuegeLaden.ts`), dann im Leerlauf und AN DER STELLE des
  // schlanken norm-index-Shards, nie zusätzlich. Sind alle Facetten aus, kostet
  // er null Byte. Was er kostet, kostet er dem, der die Vollliste verlangt hat.
  //
  // Budgets = Ist + ~28 %. Ein weiterer grosser Kantonskorpus SOLL das Tor rot
  // machen und eine Entscheidung erzwingen (Kanten je Artikel seitenweise
  // nachladen? Köpfe weiter auslagern?), statt unbemerkt durchzurutschen.
  ['public/rechtsprechung/bezuege/BGG.json', 384 * 1024],
  ['public/rechtsprechung/bezuege/BV.json', 160 * 1024],
  ['public/rechtsprechung/bezuege/STPO.json', 132 * 1024],
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
