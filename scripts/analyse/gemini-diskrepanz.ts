// scripts/analyse/gemini-diskrepanz.ts — Gemini-Diskrepanz-Finder für die
// Korpus-Werkstatt (FAHRPLAN-FREMDAGENTEN §2 Phase 2, §4, §5).
//
// SICHTWERKZEUG, KEIN TOR: vergleicht amtlichen Fedlex-Text gegen unseren
// Normtext-Snapshot mit einem zweiten Modell (Gemini via `agy`) und listet
// mögliche Abweichungen. Exit 0 bei technisch gelungenem Lauf, unabhängig vom
// Fundinhalt — kein CI-Schritt, keine Landungs-Voraussetzung (Fahrplan §2
// Phase 2 «Ablage»).
//
// §14.7 VERTRAUENSGRENZE: die agy/Gemini-Ausgabe ist eine VERDACHTSLISTE,
// NIE ein Beleg (Gemini hat nachweislich Taten behauptet, die nicht
// stattfanden — Fahrplan §4). Jeder gemeldete Fund gehört von einem Menschen
// oder einer Gegenprüfungs-Session gegen die amtliche Quelle geprüft, bevor er
// "Befund" heisst.
//
// Aufruf:
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/DBG
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/OR --artikel 220-230 --laeufe 2
//   npx vite-node scripts/analyse/gemini-diskrepanz.ts bund/DBG --out /pfad/bericht.md
//
// Voraussetzung: der Fedlex-Filestore-Cache muss bereits gepinnt vorliegen
// (`bash scripts/fedlex-cache.sh` — NICHT von hier aus live geladen, s.u.).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import {
  formatiereArtikel,
  reduziereQuelleHtml,
  reduziereSnapshot,
  type ArtikelKlartext,
} from './gemini-diskrepanz-text.ts';

const GRUPPEN_BUDGET_ZEICHEN = 200_000;
const AGY = join(process.env.HOME ?? '', '.local/bin/agy');
const MODELL = 'gemini-3.1-pro-high';
const PRINT_TIMEOUT_S = 300;
// >= print-timeout(300s) + 30s ist die Fahrplan-§4-UNTERGRENZE. Beobachtung
// Pilotlauf 4.9.2026 (VZV, grosse Gruppe): der agy-Prozess lief >400s, OHNE
// dass execFileSync ihn beim vorherigen 340s-Wert sichtbar per SIGTERM beendet
// hätte (manuell abgebrochen, nicht abschliessend geklärt ob/wann Node
// eingegriffen hätte) — Timeout grosszügiger gesetzt UND killSignal auf
// SIGKILL gehärtet (SIGTERM kann von einem Prozess ignoriert/verzögert
// werden), damit ein hängender Lauf zuverlässig endet statt den ganzen
// Skript-Durchlauf zu blockieren.
const CHILD_TIMEOUT_MS = 600_000;

interface Abweichung {
  artikel: string;
  absatz: string;
  quelle: string;
  snapshot: string;
  klasse: string;
}

interface AgyLauf {
  status: string;
  modell: string;
  abweichungen: Abweichung[];
  dauerS: number;
  tokens: number;
}

function parseArgs(argv: string[]) {
  const ziel = argv[0];
  if (!ziel || !ziel.includes('/')) {
    throw new Error('Aufruf: gemini-diskrepanz.ts <ebene/erlass, z.B. bund/DBG> [--artikel N-M] [--laeufe N] [--out pfad]');
  }
  const [ebene, erlass] = ziel.split('/');
  let artikelVon: number | undefined;
  let artikelBis: number | undefined;
  let laeufe = 2;
  let out: string | undefined;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--artikel') {
      const spanne = argv[++i] ?? '';
      const [von, bis] = spanne.split('-').map((s) => parseInt(s, 10));
      if (!Number.isNaN(von)) artikelVon = von;
      if (!Number.isNaN(bis)) artikelBis = bis;
    } else if (argv[i] === '--laeufe') {
      {
        const wert = parseInt(argv[++i] ?? '2', 10);
        laeufe = Number.isNaN(wert) ? 2 : wert; // explizite 0 bleibt 0 (nicht auf 2 zurückfallen)
      }
    } else if (argv[i] === '--out') {
      out = argv[++i];
    }
  }
  return { ebene, erlass, artikelVon, artikelBis, laeufe, out };
}

/** Liest den Pin-Eintrag `name|eli|kons|n|anker|sr` aus scripts/fedlex-cache.sh — liest nur, ändert den Risikopfad nicht. */
function ladePin(name: string): { eli: string; kons: string; n: string; sr?: string } | null {
  const skript = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const zeile = skript
    .split('\n')
    .find((z) => new RegExp(`"${name}\\|`).test(z.trim()));
  if (!zeile) return null;
  const inhalt = zeile.trim().replace(/^"/, '').replace(/",?$/, '');
  const [, eli, kons, n, , sr] = inhalt.split('|');
  return { eli, kons, n, sr };
}

function ladeQuelle(erlassName: string): string {
  const name = erlassName.toLowerCase();
  const pin = ladePin(name);
  if (!pin) {
    throw new Error(
      `Kein Fedlex-Pin für "${name}" in scripts/fedlex-cache.sh gefunden — Abbruch (kein Live-Laden ohne Pin).`,
    );
  }
  const cacheDatei = `/tmp/${name}.html`;
  if (!existsSync(cacheDatei)) {
    throw new Error(
      `Cache fehlt: ${cacheDatei}. Pin vorhanden (kons=${pin.kons}, n=${pin.n}, sr=${pin.sr ?? '—'}) ` +
        `— führe zuerst 'bash scripts/fedlex-cache.sh' aus (dieses Skript lädt NICHT live).`,
    );
  }
  return readFileSync(cacheDatei, 'utf8');
}

function ladeSnapshot(ebene: string, erlassName: string): NormSnapshotDatei {
  const pfad = `public/normtext/${ebene}/${erlassName.toUpperCase()}.json`;
  if (!existsSync(pfad)) {
    throw new Error(`Snapshot fehlt: ${pfad}`);
  }
  return JSON.parse(readFileSync(pfad, 'utf8')) as NormSnapshotDatei;
}

interface Gruppe {
  artikel: string[];
  prompt: string;
  zeichen: number;
}

function bildeGruppen(
  quelle: Map<string, ArtikelKlartext>,
  snapshot: Map<string, ArtikelKlartext>,
): Gruppe[] {
  const schluessel = [...new Set([...quelle.keys(), ...snapshot.keys()])].sort(
    (a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b),
  );
  const gruppen: Gruppe[] = [];
  let aktuell: string[] = [];
  let aktuellQuelle: string[] = [];
  let aktuellSnapshot: string[] = [];
  let zeichen = 0;

  const flush = () => {
    if (!aktuell.length) return;
    const prompt = bauePrompt(aktuellQuelle.join('\n\n'), aktuellSnapshot.join('\n\n'));
    gruppen.push({ artikel: aktuell, prompt, zeichen });
    aktuell = [];
    aktuellQuelle = [];
    aktuellSnapshot = [];
    zeichen = 0;
  };

  for (const k of schluessel) {
    const q = quelle.get(k);
    const s = snapshot.get(k);
    const qText = q ? `=== Art. ${k} (Quelle) ===\n${formatiereArtikel(q)}` : `=== Art. ${k} (Quelle) ===\n[kein Fedlex-Artikel gefunden]`;
    const sText = s ? `=== Art. ${k} (Snapshot) ===\n${formatiereArtikel(s)}` : `=== Art. ${k} (Snapshot) ===\n[kein Snapshot-Eintrag]`;
    const zusatz = qText.length + sText.length;
    if (zeichen + zusatz > GRUPPEN_BUDGET_ZEICHEN && aktuell.length) flush();
    aktuell.push(k);
    aktuellQuelle.push(qText);
    aktuellSnapshot.push(sText);
    zeichen += zusatz;
  }
  flush();
  return gruppen;
}

function bauePrompt(quelle: string, snapshot: string): string {
  return `Rolle: Du bist ein reines Abgleich-Werkzeug. Du machst KEINE Rechtsauslegung
und KEINE Bewertung, ob eine Abweichung rechtlich relevant ist. Du vergleichst
ausschliesslich den Wortlaut zweier Texte (QUELLE = amtliche Fassung,
SNAPSHOT = zu prüfende Kopie) und listest JEDE textliche Abweichung auf:
fehlender Text (drop), zusätzlicher/fremder Text der in der Quelle nicht als
sichtbarer Normtext vorkommt (leak), verlorene/falsche lateinische Ordinal-
Suffixe wie bis/ter (bister), Tabellen-Struktur-Abweichungen (tabelle),
Zahlenabweichungen (zahl) oder sonstige Textabweichungen (sonst). Der
Fussnoten-Apparat der Quelle ist separat markiert ("--- Fussnoten (Quelle) ---")
— fehlt er im Snapshot komplett, ist das KEIN Fund (der Snapshot führt keinen
separaten Fussnoten-Text; nur inhaltliche Abweichungen IM Artikeltext zählen).

Gib AUSSCHLIESSLICH ein JSON-Objekt zurück, keine Erklärung, kein Markdown,
nach exakt diesem Schema:
{"modell": string, "abweichungen": [{"artikel": string, "absatz": string, "quelle": string, "snapshot": string, "klasse": "drop|leak|tabelle|bister|zahl|sonst"}]}

Wenn keine Abweichung gefunden wird: {"modell": string, "abweichungen": []}

=== QUELLE (amtliche Fassung, je Artikel) ===
${quelle}

=== SNAPSHOT (zu prüfende Kopie, je Artikel) ===
${snapshot}
`;
}

function rufeAgyAuf(prompt: string, tempDir: string, label: string): AgyLauf {
  // Temp-Datei als Provenienz/Debug-Artefakt (Fahrplan-Vorgabe); die Übergabe an
  // agy selbst läuft per argv (execFileSync ohne Shell — kein `$(cat …)`-Quoting-
  // Risiko bei bis zu ~200k Zeichen Prompt-Länge, s. Gruppen-Budget oben).
  const promptDatei = join(tempDir, `${label}.txt`);
  writeFileSync(promptDatei, prompt, 'utf8');
  let stdout: string;
  try {
    stdout = execFileSync(
      AGY,
      [
        '-p',
        prompt,
        '--model',
        MODELL,
        '--effort',
        'high',
        '--output-format',
        'json',
        '--print-timeout',
        `${PRINT_TIMEOUT_S}s`,
        '--sandbox',
      ],
      { timeout: CHILD_TIMEOUT_MS, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
    );
  } catch (err) {
    process.stderr.write(`agy-Aufruf fehlgeschlagen (${label}): ${(err as Error).message}\n`);
    return {
      status: 'ERROR',
      modell: '',
      abweichungen: [],
      dauerS: 0,
      tokens: 0,
    };
  }
  let envelope: { status: string; response: string; duration_seconds: number; usage?: { total_tokens: number } };
  try {
    envelope = JSON.parse(stdout);
  } catch {
    return { status: 'PARSE_FEHLER', modell: '', abweichungen: [], dauerS: 0, tokens: 0 };
  }
  if (envelope.status !== 'SUCCESS') {
    return { status: envelope.status, modell: '', abweichungen: [], dauerS: envelope.duration_seconds ?? 0, tokens: envelope.usage?.total_tokens ?? 0 };
  }
  let payload: { modell: string; abweichungen: Abweichung[] };
  try {
    payload = JSON.parse(envelope.response);
  } catch {
    return { status: 'ANTWORT_KEIN_JSON', modell: '', abweichungen: [], dauerS: envelope.duration_seconds, tokens: envelope.usage?.total_tokens ?? 0 };
  }
  return {
    status: 'SUCCESS',
    modell: payload.modell ?? '',
    abweichungen: payload.abweichungen ?? [],
    dauerS: envelope.duration_seconds,
    tokens: envelope.usage?.total_tokens ?? 0,
  };
}

/** Konsens: ein Fund zählt nur, wenn er in ALLEN Läufen vorkommt (gleicher Artikel + Klasse + überlappender Text). */
function ueberlappt(a: string, b: string): boolean {
  const an = a.trim().toLowerCase();
  const bn = b.trim().toLowerCase();
  if (!an && !bn) return true;
  if (!an || !bn) return false;
  return an.includes(bn) || bn.includes(an) || an.slice(0, 40) === bn.slice(0, 40);
}

function konsens(laeufe: AgyLauf[]): Abweichung[] {
  if (!laeufe.length || laeufe.some((l) => l.status !== 'SUCCESS')) return [];
  const [erster, ...rest] = laeufe;
  return erster.abweichungen.filter((f) =>
    rest.every((lauf) =>
      lauf.abweichungen.some(
        (g) => g.artikel === f.artikel && g.klasse === f.klasse && (ueberlappt(g.quelle, f.quelle) || ueberlappt(g.snapshot, f.snapshot)),
      ),
    ),
  );
}

async function main() {
  const { ebene, erlass, artikelVon, artikelBis, laeufe, out } = parseArgs(process.argv.slice(2));
  if (ebene !== 'bund') {
    throw new Error(`Ebene "${ebene}" nicht unterstützt (Pilot nur "bund" — Fedlex-Cache-Pins sind bundesrechtlich).`);
  }

  const html = ladeQuelle(erlass);
  const snapshotDatei = ladeSnapshot(ebene, erlass);

  const quelleMap = reduziereQuelleHtml(html, artikelVon, artikelBis);
  const eintraegeGefiltert = snapshotDatei.eintraege.filter((e) => {
    // Scope V1: nur Artikel (Fedlex `<article id="art_N">`), keine Anhänge
    // (Fedlex `<section id="annex_N">` — andere Struktur, h1/Tabellen, hier
    // NICHT geparst). Snapshot-Artikelschlüssel für echte Artikel beginnen
    // IMMER mit einer Ziffer ("1", "5a", "329d", "5bis"); Anhang-Schlüssel wie
    // "annex_1" beginnen mit einem Buchstaben — ohne diesen Filter meldet
    // JEDER Anhang systematisch "kein Fedlex-Artikel gefunden" (Scheinfund,
    // T2-Lehre: keine Harness-Artefakte einstreuen). Beobachtet 4.9.2026 am
    // AMBV-Pilotlauf.
    if (!/^\d/.test(e.artikel)) return false;
    if (artikelVon === undefined && artikelBis === undefined) return true;
    const n = parseInt(e.artikel.replace(/[^0-9].*$/, ''), 10);
    if (Number.isNaN(n)) return true;
    return (artikelVon === undefined || n >= artikelVon) && (artikelBis === undefined || n <= artikelBis);
  });
  const snapshotMap = reduziereSnapshot(eintraegeGefiltert);

  const gruppen = bildeGruppen(quelleMap, snapshotMap);
  const tempDir = mkdtempSync(join(tmpdir(), 'diskrepanz-'));

  const alleFunde: Array<Abweichung & { gruppe: number }> = [];
  let gesamtTokens = 0;
  let gesamtDauer = 0;
  let modellWarnung = false;
  const statusJeGruppe: string[] = [];

  for (let gi = 0; gi < gruppen.length; gi++) {
    const g = gruppen[gi];
    const laeufeErg: AgyLauf[] = [];
    for (let li = 0; li < laeufe; li++) {
      const lauf = rufeAgyAuf(g.prompt, tempDir, `gruppe${gi}-lauf${li}`);
      laeufeErg.push(lauf);
      gesamtTokens += lauf.tokens;
      gesamtDauer += lauf.dauerS;
      if (lauf.status === 'SUCCESS' && !/gemini/i.test(lauf.modell)) modellWarnung = true;
    }
    statusJeGruppe.push(laeufeErg.map((l) => l.status).join('/'));
    const gefunden = konsens(laeufeErg);
    for (const f of gefunden) alleFunde.push({ ...f, gruppe: gi });
  }

  const zeilen: string[] = [];
  zeilen.push(`# Gemini-Diskrepanz-Finder — ${ebene}/${erlass.toUpperCase()}`);
  zeilen.push('');
  zeilen.push('SICHTWERKZEUG — Verdachtsliste, kein Beleg (§14.7). Jeder Fund gehört gegen die amtliche Fassung geprüft.');
  zeilen.push('');
  zeilen.push(`Gruppen: ${gruppen.length} · Läufe je Gruppe: ${laeufe} · Modell: ${MODELL} · Status je Gruppe: ${statusJeGruppe.join(', ')}`);
  zeilen.push(`Tokens gesamt: ${gesamtTokens} · Dauer gesamt: ${gesamtDauer.toFixed(1)} s`);
  if (modellWarnung) zeilen.push('WARNUNG: mindestens ein Lauf meldete ein Modell ohne "Gemini" im Selbstangabe-Feld — möglicher stiller Fallback (Fahrplan §4).');
  zeilen.push('');
  if (!alleFunde.length) {
    zeilen.push('Keine übereinstimmenden Funde (Konsens über alle Läufe).');
  } else {
    zeilen.push('| Artikel | Absatz | Klasse | Quelle sagt | Snapshot sagt |');
    zeilen.push('|---|---|---|---|---|');
    for (const f of alleFunde) {
      const trim = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200);
      zeilen.push(`| ${f.artikel} | ${f.absatz} | ${f.klasse} | ${trim(f.quelle)} | ${trim(f.snapshot)} |`);
    }
  }
  const bericht = zeilen.join('\n') + '\n';

  process.stdout.write(bericht);

  const zielpfad = out ?? join(tempDir, `bericht-${erlass.toLowerCase()}.md`);
  writeFileSync(zielpfad, bericht, 'utf8');
  process.stderr.write(`\nBericht geschrieben: ${zielpfad}\n`);
}

main().catch((err) => {
  // Abbruch VOR/OHNE agy-Lauf (fehlender Pin/Cache, falsche Ebene, Argumentfehler):
  // das ist kein "technisch gelungener Lauf" — Exit 1, damit ein Abbruch nicht
  // wie ein leerer Befund aussieht. Ein agy-Lauf, der selbst fehlschlägt, wird
  // dagegen INNERHALB main() aufgefangen (Status im Bericht) und endet mit
  // Exit 0 (Sichtwerkzeug, kein Tor — Fahrplan §2 Phase 2 "Ablage").
  process.stderr.write(`FEHLER: ${(err as Error).message}\n`);
  process.exitCode = 1;
});
