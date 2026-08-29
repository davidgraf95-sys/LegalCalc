// scripts/normtext/check-stand-zukunft.ts — «kein Stand liegt in der Zukunft».
//
// ANLASS (29.8.2026, Gegenprüfung zu PR #572, Befunde B1/B5): Der
// Fedlex-Frische-Lauf schrieb `TI-ti-181` mit `stand: 2027-01-01` — die geltende
// Fassung datiert vom 17.5.2024 (BU 2024, 131). Ursache war ein Stand-Leser, der
// das MAXIMUM aller «in vigore dal»-Daten der ganzen HTML-SEITE nahm und dabei
// den Ankündigungs-Abschnitt «PROSSIME VARIAZIONI» mitlas (BU 2026, 281, in
// Kraft ab 1.1.2027). Dieselbe Klasse stand vorbestehend auf `main`:
// `SZ-213.512` mit `stand: 2027-02-01`, dort aus der SRSZ-Fusszeile
// «SRSZ 1.2.2027», die der Kanton als Ausgabe-Marke der NÄCHSTEN Loseblatt-
// Nachführung druckt.
//
// WAS DAS TOR PRÜFT — eine einzige, quellenunabhängige Invariante:
//
//     Der Stand einer gespeicherten Fassung kann nicht NACH ihrem Abruf liegen.
//
// Ein Snapshot behauptet mit `stand`, welche Fassung sein Text wiedergibt. Liegt
// dieser Wert nach dem Abrufdatum, ist der Text nachweislich NICHT die Fassung,
// die er zu sein behauptet — er wurde vor deren Inkrafttreten geholt. Das ist
// keine Meinung über die Quelle, sondern ein Widerspruch im Artefakt selbst.
// Genau darum trägt das Tor über ALLE Profile (Fedlex, LexWork, HTM, PDF) und
// braucht keine Kenntnis der einzelnen Quell-Eigenheiten.
//
// REFERENZDATUM — kein Date.now (§2). Verglichen wird gegen das Datum, das der
// EINTRAG SELBST trägt (`abgerufen`), ersatzweise gegen das `erzeugt` seiner
// Datei. Damit ist das Verdikt deterministisch und reproduzierbar: derselbe
// Bestand ergibt in fünf Jahren dasselbe Ergebnis. Das ist strenger als die
// Wanduhr-Konvention der Currency-Tore (`scripts/verfall-pruefen.ts` liest
// `new Date()`), und zwar mit Absicht — ein wanduhr-abhängiges Tor färbt
// irgendwann fremde PRs rot, ohne dass sich ihr Diff geändert hätte (K7,
// 3.8.2026, Lauf 30764225649). Diese Prüfung hängt ausschliesslich am Diff.
//
// §6.7 lit. b — eine nicht getroffene Feststellung wird nie zur günstigen: ein
// Eintrag mit `stand`, aber ohne jedes Referenzdatum, ist ROT (unprüfbar), nicht
// still grün.
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Snapshot-Wurzeln mit `stand`-Feld (gemessen 29.8.2026: nur diese beiden —
 *  historie/revisionen/struktur/bilder/pdf tragen kein `stand`). Verzeichnisse
 *  statt Dateiliste, damit neue Erlasse ohne Pflegeschritt mitlaufen. */
const WURZELN = ['public/normtext/bund', 'public/normtext/kanton'];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface Eintrag {
  id?: unknown;
  stand?: unknown;
  abgerufen?: unknown;
  quelleUrl?: unknown;
}

function alleJson(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) alleJson(p, out);
    else if (name.endsWith('.json')) out.push(p);
  }
  return out;
}

interface Befund {
  datei: string;
  id: string;
  stand: string;
  referenz: string;
  art: 'zukunft' | 'unpruefbar' | 'unlesbar';
  quelleUrl: string;
}

const befunde: Befund[] = [];
let geprueft = 0;
let dateien = 0;

for (const wurzel of WURZELN) {
  for (const datei of alleJson(wurzel)) {
    let roh: unknown;
    try {
      roh = JSON.parse(readFileSync(datei, 'utf8'));
    } catch (e) {
      befunde.push({
        datei, id: '(ganze Datei)', stand: '', referenz: '', art: 'unlesbar', quelleUrl: '',
        });
      void e;
      continue;
    }
    const wrap = roh as { erzeugt?: unknown; eintraege?: unknown };
    if (!Array.isArray(wrap.eintraege)) continue; // Projektions-Artefakt, kein Snapshot
    dateien++;
    const erzeugt = typeof wrap.erzeugt === 'string' && ISO.test(wrap.erzeugt) ? wrap.erzeugt : '';
    for (const e of wrap.eintraege as Eintrag[]) {
      if (!e || typeof e.stand !== 'string' || e.stand === '') continue;
      geprueft++;
      const abgerufen = typeof e.abgerufen === 'string' && ISO.test(e.abgerufen) ? e.abgerufen : '';
      const referenz = abgerufen || erzeugt;
      const id = typeof e.id === 'string' ? e.id : '(ohne id)';
      const quelleUrl = typeof e.quelleUrl === 'string' ? e.quelleUrl : '';
      if (!referenz) {
        befunde.push({ datei, id, stand: e.stand, referenz: '', art: 'unpruefbar', quelleUrl });
        continue;
      }
      // ISO-Datumsstrings sind lexikographisch vergleichbar — kein Date-Parsing
      // (und damit keine Zeitzonen-Kante, §2).
      if (e.stand > referenz) {
        befunde.push({ datei, id, stand: e.stand, referenz, art: 'zukunft', quelleUrl });
      }
    }
  }
}

if (befunde.length === 0) {
  console.log(
    `Stand-Zukunft: ${geprueft} Snapshot-Einträge aus ${dateien} Dateien geprüft — ` +
    'kein Stand liegt nach seinem Abrufdatum.',
  );
  process.exit(0);
}

console.error(
  `check:stand-zukunft ROT — ${befunde.length} von ${geprueft} Snapshot-Einträgen ` +
  'behaupten eine Fassung, die es beim Abruf noch nicht gab.\n',
);

// Nach Datei gruppiert ausgeben (ein Erlass erzeugt sonst Hunderte gleicher Zeilen).
const proDatei = new Map<string, Befund[]>();
for (const b of befunde) {
  const liste = proDatei.get(b.datei) ?? [];
  liste.push(b);
  proDatei.set(b.datei, liste);
}
for (const [datei, liste] of [...proDatei.entries()].sort()) {
  const erst = liste[0];
  console.error(`  ${datei} — ${liste.length} Eintrag/Einträge, Art: ${erst.art}`);
  if (erst.art === 'unlesbar') {
    console.error('      Datei ist kein lesbares JSON.');
    continue;
  }
  console.error(
    erst.art === 'zukunft'
      ? `      z.B. ${erst.id}: stand=${erst.stand} > abgerufen/erzeugt=${erst.referenz}`
      : `      z.B. ${erst.id}: stand=${erst.stand}, aber KEIN Referenzdatum (abgerufen/erzeugt) — unprüfbar`,
  );
  if (erst.quelleUrl) console.error(`      Quelle: ${erst.quelleUrl}`);
}

console.error(
  '\n  Kein Hand-Edit am Snapshot (§5 — Snapshots sind Generator-Projektionen).\n' +
  '  Der Defekt sitzt im Stand-Leser der Quelle: er liest ein Datum, das nicht die\n' +
  '  geltende Fassung bezeichnet (Ankündigungs-Abschnitt, Ausgabe-Marke der nächsten\n' +
  '  Nachführung, künftige Konsolidierung). Wurzel dort beheben, dann neu generieren.',
);
process.exit(1);
