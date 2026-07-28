// ─── Backfill: normKeys des BESTEHENDEN Korpus nachziehen (W2·6-NKEY) ─────────
//
// Die `normKeys` jedes Snapshots wurden beim Import mit der damaligen Hand-
// Whitelist gebildet (26 Abkürzungen, 43 % Abdeckung). Nach der Register-
// Ableitung + den amtlichen Fedlex-Aliasen mappen dieselben Roh-Zitate auf
// deutlich mehr Erlasse — der Bestand muss die Logik nachziehen, sonst wirkt die
// Verbesserung nur für künftige Importe.
//
// QUELLE DER NACHZIEHUNG ist ausschliesslich das bereits gespeicherte
// `zitierteNormen` (OCL `statutes[]`, Roh-Drittextraktion) — kein Re-Fetch, kein
// Netz, kein LLM. Damit ist der Lauf deterministisch und beliebig oft
// wiederholbar (§2): zweimal gefahren, byte-gleiches Ergebnis.
//
// HARTE INVARIANTEN (§1/§6):
//  · MONOTON: `normKeys` wird nur ERGÄNZT, nie gekürzt. Ein Alt-Key kann aus
//    einem `normKeyHint` des Imports stammen (nicht aus `statutes[]`) — ihn
//    wegzuwerfen hiesse, eine bewusste Zuordnung stillschweigend zu löschen.
//  · REIHENFOLGE-TREU: Bestands-Keys behalten ihre Position, Neues wird in
//    Ableitungs-Reihenfolge angehängt. So bleibt ein Snapshot ohne neue Keys
//    byte-gleich (§6) und der Lauf ist idempotent.
//  · Alle übrigen Felder unberührt; der Inhalts-`sha` hängt nur am Abschnitts-
//    text und bleibt damit gleich (wird zusätzlich geprüft).
//  · Anzahl Entscheide vorher == nachher.
//
// Der Korpus wird KONSISTENT über `schreibeKorpus` neu geschrieben (Snapshots +
// register.json + norm-index.json + Shards + erfasste-keys) — eine Stelle, kein
// Duplikat (§5). Die Eingabe-Reihenfolge kommt aus `ladeBestandSnapshots`
// (Register-Reihenfolge), damit der stabil sortierte Manifest unverändert
// reproduziert wird.
//
//   npm run backfill:normkeys                → DRY-RUN (Report)
//   npm run backfill:normkeys -- --schreiben  → anwenden
//
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ladeBestandSnapshots, schreibeKorpus } from './entscheide-schreiben';
import { statutesZuNormKeys } from './entscheide-mapping';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');

const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const datumArg = args.find((a) => a.startsWith('--datum='))?.split('=')[1] ?? null;

/** Monotone, reihenfolge-treue Vereinigung: Bestand zuerst, Neues angehängt. */
function vereinige(alt: readonly string[], neu: readonly string[]): string[] {
  const out = [...alt];
  const gesehen = new Set(alt);
  for (const k of neu) if (!gesehen.has(k)) { gesehen.add(k); out.push(k); }
  return out;
}

function main(): void {
  const snaps = ladeBestandSnapshots(ROOT);
  if (!snaps.length) throw new Error('Kein Bestand gefunden — public/rechtsprechung/register.json fehlt?');

  const neu: EntscheidSnapshot[] = [];
  let veraendert = 0;
  let keysVorher = 0;
  let keysNachher = 0;
  const zugewachsen = new Map<string, number>();   // Register-key → Entscheide, die ihn neu tragen
  const beispiele: string[] = [];

  for (const snap of snaps) {
    const alt = snap.normKeys ?? [];
    const abgeleitet = statutesZuNormKeys(snap.zitierteNormen ?? []);
    const vereint = vereinige(alt, abgeleitet);
    keysVorher += alt.length;
    keysNachher += vereint.length;

    // §1: nur Zuwachs — ein Verlust wäre ein Fehler, kein Backfill.
    if (vereint.length < alt.length) throw new Error(`${snap.id}: normKeys geschrumpft (${alt.length} → ${vereint.length}) — Abbruch.`);
    for (const k of alt) if (!vereint.includes(k)) throw new Error(`${snap.id}: Alt-Key '${k}' verloren — Abbruch (§1).`);

    if (vereint.length !== alt.length) {
      veraendert++;
      for (const k of vereint.slice(alt.length)) zugewachsen.set(k, (zugewachsen.get(k) ?? 0) + 1);
      if (beispiele.length < 25) beispiele.push(`${snap.id}: [${alt.join(', ')}] + [${vereint.slice(alt.length).join(', ')}]`);
    }

    // sha ist reine Funktion der Abschnitte — er darf sich hier NIE ändern.
    const shaErwartet = sha256EntscheidBloecke(snap.abschnitte);
    if (snap.sha !== shaErwartet) throw new Error(`${snap.id}: sha-Drift schon VOR dem Backfill (${snap.sha} ≠ ${shaErwartet}) — Bestand reparieren, nicht überschreiben.`);

    neu.push({ ...snap, normKeys: vereint });
  }

  if (neu.length !== snaps.length) throw new Error('Entscheid-Anzahl verändert — Abbruch.');

  const datum = datumArg
    ?? (JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt as string);

  console.log(`[backfill-normkeys] ${snaps.length} Entscheide — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'} (erzeugt=${datum})`);
  console.log(`[backfill-normkeys] normKeys total: ${keysVorher} → ${keysNachher} (+${keysNachher - keysVorher})`);
  console.log(`[backfill-normkeys] Entscheide mit Zuwachs: ${veraendert}`);
  console.log(`[backfill-normkeys] neu verzahnte Erlasse: ${zugewachsen.size}`);
  for (const [k, n] of [...zugewachsen].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    console.log(`                    ${String(n).padStart(5)}  ${k}`);
  }
  console.log('[backfill-normkeys] Beispiele:');
  for (const b of beispiele) console.log(`                    ${b}`);

  if (!schreiben) {
    console.log('[backfill-normkeys] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
    return;
  }
  const res = schreibeKorpus(neu, datum, ROOT);
  console.log(`[backfill-normkeys] geschrieben: ${res.anzahl} Manifest-Einträge · ${res.normBuckets} Erlass-Buckets · ${res.artikelBuckets} Artikel-Buckets · ${res.shards} Shards.`);
}

try { main(); } catch (e) { console.error(e); process.exit(1); }
