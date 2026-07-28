// ─── Tor: Bezugs-Schicht (W2·7-BEZUG, B1–B3) ────────────────────────────────
//
// Prüft die neuen Artefakte public/rechtsprechung/bezuege/*.json gegen die drei
// Dinge, die sie tragen müssen:
//
//  T1 · PROJEKTIONS-GLEICHHEIT (§5/§6). Aus den Bundesgerichts-Kanten eines
//       Bezugs-Shards muss sich die bestehende Artikel-Ebene (norm-index.json
//       proNormArtikel) ZEICHENGLEICH nachrechnen lassen. Das ist der Beweis,
//       dass es EINEN Rechenweg gibt und nicht zwei, die zufällig ähnlich
//       aussehen.
//
//       WAS «PROJEKTION» HIER GENAU HEISST — die erste Fassung dieses Tors hat
//       es falsch gefasst und ist beim ersten Lauf an 78 Artikeln rot geworden;
//       die Zahl war richtig, die erwartete Gleichheit falsch. Die beiden
//       Artefakte DECKELN VERSCHIEDEN, und zwar mit Absicht:
//         · norm-index: EIN Topf «Bundesgericht», Deckel 8. Ein unpubliziertes
//           Urteil steht darin nur, wenn es sich gegen acht BGE durchsetzt —
//           praktisch nie (Ist: 61 von 11'491 Kanten).
//         · bezuege: Deckel 8 JE STATUS. Genau das ist B3: die übrigen
//           BGer-Urteile bekommen einen eigenen Platz, statt hinter den BGE zu
//           verschwinden (Ist: 272 bger-Kanten statt 61).
//       Die richtige Invariante ist darum nicht «gleiche Liste», sondern:
//       bge- und bger-Kanten des Shards zusammengeworfen, nach der BESTANDS-
//       Ordnung sortiert und auf 8 gekappt == norm-index. Das ist beweisbar
//       hinreichend: die Bestands-Ordnung ist total, also ist die Reihenfolge
//       innerhalb jeder Status-Klasse eine Teilfolge der gemeinsamen — die
//       gemeinsamen Top-8 können daher nie einen Eintrag enthalten, der in
//       seiner eigenen Klasse hinter Platz 8 läge und im Shard fehlt.
//  T2 · REFERENZIELLE INTEGRITÄT (§7). Jeder Dokument-key existiert im
//       Entscheid-Manifest; jeder kantonale Erlass-key hat einen Normtext-
//       Snapshot. Ein Chip, der ins Leere zeigt, ist schlimmer als kein Chip.
//  T3 · FACETTEN-VOLLSTÄNDIGKEIT + DECKEL (§8). Jede Kante trägt alle fünf
//       Facetten, `status` ist konsistent mit `ebene`/`kanton`, kein Deckel ist
//       überschritten, und `gesamtProArtikel` ist NIE kleiner als das, was im
//       Shard steht — eine Grundgesamtheit unter der Anzeige wäre eine Zahl, die
//       ihre eigene Liste dementiert.
//
// Dazu ein Grössen-Deckel je Shard (§15) und die ehrliche Facetten-Bilanz im
// Protokoll (§8: Zahlen mit Grundgesamtheit, nicht bloss «grün»).
//
// ── §6.7-SABOTAGE-PROBE (28.7.2026) ─────────────────────────────────────────
// Jede der vier Prüfungen wurde einmal ROT gesehen; hier steht der WÖRTLICHE
// Befund des Laufs, nicht eine Beschreibung davon (§7):
//  · T1 — erste Kante an STGB/1 aus dem Shard entfernt:
//    «T1 STGB/1: Bundesgerichts-Projektion weicht ab — norm-index
//     [bge_147_IV_274, bge_148_IV_329, …] vs. bezuege [bge_148_IV_329, …]»
//  · T2 — erfundener Dokument-key in BS-154.100:
//    «BS-154.100/3: Dokument-key 'bs_x_Y.2020.1' nicht im Entscheid-Manifest (§7).»
//  · T3 — OR/41 auf 11 bge-Kanten aufgebläht, Grundgesamtheit auf 1 gesetzt:
//    «OR/41: Deckel bge überschritten (11 > 8).» +
//    «OR/41: Grundgesamtheit bge=1 kleiner als das Gezeigte (11).»
//    (T1 wurde im selben Lauf ebenfalls rot — die Prüfungen überschneiden sich,
//     das ist gewollt: eine aufgeblähte Klasse verschiebt auch die Projektion.)
//  · Grössen-Deckel — SHARD_BUDGET_KB testweise auf 100: 12 Shards rot
//    (STPO 711, STGB 539, ZPO 432, ZGB 385, OR 367, BV 316, BGG 292, ATSG 223,
//     SCHKG 171, AIG 139, IVG 137, DBG 103 KB).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { NormEntscheidIndex } from '../../src/lib/rechtsprechung/norm-index';
import { normArtikelToken } from '../../src/lib/rechtsprechung/norm-index';
import type { BezugsShard } from './bezuege-bauen';
import {
  DECKEL_JE_STATUS, STATUS_RANG, bezugStatusFuerEntscheid,
  type BezugStatus,
} from '../../src/lib/verzahnung/facetten';
import { SYSTEMATIK_PRAEFIX } from './kanton-norm-resolver';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const BEZ = join(PUB, 'bezuege');

/**
 * Grössen-Deckel je Bezugs-Shard (§15). Ist 28.7.2026: grösster Shard STPO
 * 712 KB (64.9 KB gzip), dahinter STGB 540, ZPO 436, ZGB 388, OR 368.
 * 1024 KB = grösster Ist-Wert + ~44 % Reserve, fliessend nachzuziehen wie die
 * übrigen Korpus-Deckel (Freigabe-Logik David 26.6.2026) — er bremst Unfälle,
 * limitiert nicht künstlich.
 *
 * Der Wert ist bewusst DERSELBE wie `SHARD_BUDGET_KB` in check-entscheide.ts,
 * obwohl die Datei mehr Klassen trägt: sie ist durch die ausgelagerten
 * Dokument-Köpfe kompakter serialisiert, und beide Shards liegen auf demselben
 * Lade-Pfad (einer je geöffnetem Erlass). Zwei verschiedene Deckel für dieselbe
 * Lade-Situation wären eine Behauptung über einen Unterschied, den es nicht gibt.
 */
const SHARD_BUDGET_KB = 1024;

/**
 * Deckel der Bestands-Artikel-Ebene. NACHGEBILDET statt importiert: der Wert
 * lebt als Modul-Konstante in entscheide-schreiben.ts, und den Schreiber zu
 * importieren zöge die halbe Pipeline (Besetzungs-Kanonisierung, ECLI, fs) in
 * ein Lese-Tor. Dass beide übereinstimmen, prüft das Tor selbst: stünde hier
 * eine andere Zahl, wäre T1 sofort rot — das ist die schärfere Sicherung als
 * ein geteilter Import (§6.7).
 */
const LEITFAELLE_PRO_ARTIKEL = 8;

/** Bundesgerichts-Kante in der Form, die die Bestands-Ordnung braucht. */
interface BgKante { key: string; gewicht: number; datum: string; leit: boolean }

/**
 * Die Bestands-Ordnung (`vergleicheLeitfaelle`), nachgebildet wie der Deckel und
 * aus demselben Grund: gewicht ↓, Leitentscheid vor Routine, Datum ↓, key als
 * totaler Tiebreaker. Eine Abweichung macht T1 rot statt still.
 */
function bestandsOrdnung(a: BgKante, b: BgKante): number {
  return b.gewicht - a.gewicht
    || (a.leit ? 0 : 1) - (b.leit ? 0 : 1)
    || (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0)
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

const fehler: string[] = [];
const warn: string[] = [];

/**
 * Artikel-Tokens EINES kantonalen Erlass-Snapshots, in Shard-Normalform.
 *
 * Gelesen wird das Feld `artikel` der Einträge, und zwar UNVERÄNDERT durch
 * `normArtikelToken` — dieselbe Normalisierung, mit der die Shard-Tokens
 * gebildet werden (§5). Kein eigener Zerleger.
 *
 * DASS DAS SO SEIN MUSS, ist gemessen und nicht überlegt: die erste Fassung
 * zerlegte den Wert mit einem eigenen Regex und schnitt dabei die
 * Buchstaben-Artikel ab — der Snapshot führt sie als `'30_b'`, `'7_a'`,
 * `'30 l'`, der Regex machte daraus `'30'` bzw. `'7'`. Das Ergebnis waren 51
 * Hinweise, von denen 47 nur besagten, dass das Prüfwerkzeug seine eigene
 * Schreibweise nicht kennt. Ein Abgleich, der die häufigste Form seiner
 * Vergleichsseite nicht lesen kann, misst nicht den Bestand, sondern sich
 * selbst (§6.7) — und eine Hinweisliste, die zu 92 % aus Eigenrauschen besteht,
 * wird nach dem zweiten Lauf nicht mehr gelesen.
 */
function artikelTokensVonErlass(pfad: string): Set<string> {
  const out = new Set<string>();
  try {
    const roh = JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege?: Array<{ artikel?: unknown }> };
    for (const e of roh.eintraege ?? []) {
      if (typeof e?.artikel === 'string' && e.artikel) out.add(normArtikelToken(e.artikel));
    }
  } catch { return new Set(); }
  return out;
}

function main(): void {
  if (!existsSync(BEZ)) {
    console.error('[check:bezuege] public/rechtsprechung/bezuege fehlt — Korpus nicht gebaut (npm run entscheide -- --remap).');
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')) as EntscheidManifest;
  const index = JSON.parse(readFileSync(join(PUB, 'norm-index.json'), 'utf8')) as NormEntscheidIndex;

  // Manifest-Nachschlag: key → Facetten-Quelle (für die Status-Gegenrechnung).
  const doks = new Map(manifest.entscheide.map((e) => [e.key, e]));

  // Kantonaler Normtext-Bestand (Erlass-keys), aus den Snapshot-Dateinamen.
  const kantonKeys = new Set<string>();
  const kantonDir = join(ROOT, 'public', 'normtext', 'kanton');
  if (existsSync(kantonDir)) {
    for (const f of readdirSync(kantonDir)) {
      if (f.endsWith('.json')) kantonKeys.add(f.slice(0, -'.json'.length));
    }
  }

  const dateien = readdirSync(BEZ).filter((f) => f.endsWith('.json')).sort();
  if (!dateien.length) fehler.push('bezuege/ ist leer — kein einziger Shard geschrieben.');

  // Facetten-Bilanz über ALLE Shards (nach Deckel = das, was ausgeliefert wird).
  const kantenJeStatus: Record<string, number> = {};
  const kantenJeEbene: Record<string, number> = {};
  const kantenJeKanton: Record<string, number> = {};
  const kantenJeQuelltyp: Record<string, number> = {};
  let shardsBund = 0, shardsKanton = 0, artikelBuckets = 0, kantenGesamt = 0;
  // Kantonale Kanten nach ZIEL-Ebene (Gegenprüfung Runde 4/D4): ein kantonaler
  // Entscheid kann an einem Bundes- ODER an einem Kantonserlass hängen. Der
  // Modulkopf des Resolvers verwies auf genau diese Aufteilung — es gab sie nur
  // nicht. Eine Zahl, auf die verwiesen wird, muss auch ausgegeben werden (§7).
  let kantonalAnBund = 0, kantonalAnKanton = 0;

  // T1: Bundesgerichts-Kanten einsammeln (ungekappt-je-Status), später projizieren.
  const projektion = new Map<string, BgKante[]>();   // 'ERLASS/artikel' → Kanten

  for (const datei of dateien) {
    const pfad = join(BEZ, datei);
    const kb = statSync(pfad).size / 1024;
    if (kb > SHARD_BUDGET_KB) {
      fehler.push(`${datei}: ${kb.toFixed(0)} KB über dem Shard-Budget (${SHARD_BUDGET_KB} KB, §15).`);
    }
    const shard = JSON.parse(readFileSync(pfad, 'utf8')) as BezugsShard;
    const erlass = datei.slice(0, -'.json'.length);
    if (shard.erlass !== erlass) fehler.push(`${datei}: erlass-Feld '${shard.erlass}' ≠ Dateiname '${erlass}'.`);

    if (shard.erlassEbene === 'kanton') {
      shardsKanton++;
      if (!kantonKeys.has(erlass)) {
        fehler.push(`${datei}: kantonaler Erlass-key ohne Normtext-Snapshot (public/normtext/kanton/${erlass}.json fehlt) — der Bezug zeigte ins Leere (§7).`);
      }
    } else {
      shardsBund++;
    }

    for (const [token, eintraege] of Object.entries(shard.proArtikel ?? {})) {
      artikelBuckets++;
      const zaehler: Partial<Record<BezugStatus, number>> = {};
      let letzterRang = -1;
      const bgProjektion: BgKante[] = [];
      for (const e of eintraege) {
        kantenGesamt++;
        const kopf = shard.dokumente?.[e.key];
        if (!kopf) {
          fehler.push(`${erlass}/${token}: Kanten-key '${e.key}' ohne Dokument-Kopf im Shard.`);
          continue;
        }
        const f = kopf.facetten;
        // T3a: Facetten vollständig.
        if (!f || !f.quelltyp || !f.ebene || !f.kanton || !f.gericht || !f.status) {
          fehler.push(`${erlass}/${token}/${e.key}: unvollständige Facetten — jede Kante trägt alle fünf (§8).`);
          continue;
        }
        // T3b: Status konsistent mit dem Manifest (nicht bloss mit sich selbst).
        const dok = doks.get(e.key);
        if (!dok) {
          fehler.push(`${erlass}/${token}: Dokument-key '${e.key}' nicht im Entscheid-Manifest (§7).`);
        } else {
          const soll = bezugStatusFuerEntscheid(dok);
          if (soll !== f.status) {
            fehler.push(`${erlass}/${token}/${e.key}: status '${f.status}', aus dem Manifest folgt '${soll}'.`);
          }
          if (dok.kanton !== f.kanton) {
            fehler.push(`${erlass}/${token}/${e.key}: kanton '${f.kanton}' ≠ Manifest '${dok.kanton}'.`);
          }
        }
        // T3c: ebene ist Funktion des Kantons — nie unabhängig gesetzt.
        const sollEbene = f.kanton === 'CH' ? 'bund' : 'kanton';
        if (f.ebene !== sollEbene) {
          fehler.push(`${erlass}/${token}/${e.key}: ebene '${f.ebene}', aus kanton '${f.kanton}' folgt '${sollEbene}'.`);
        }
        // T3d: Anzeige-Ordnung — Status-Klassen nie verschränkt.
        const rang = STATUS_RANG[f.status];
        if (rang < letzterRang) {
          fehler.push(`${erlass}/${token}: Status-Klassen verschränkt ('${f.status}' nach Rang ${letzterRang}) — die Klassentrennung wäre damit weg (§8).`);
        }
        letzterRang = rang;

        // T5 — gewicht darf in nicht messbaren Klassen NICHT als Zahl erscheinen
        // (Gegenprüfung Runde 2, Tor-Auflage). Der Zitier-Graph erkennt nur
        // BGE-Fundstellen und Bundesgerichts-Aktenzeichen; für kantonale und
        // eidgenössische Entscheide ist die In-degree strukturell nicht messbar
        // und wird als `null` ausgeliefert. Fiele das je auf 0 zurück, sähe die
        // Zahl wie ein Messergebnis aus und niemand würde es bemerken — genau
        // die stille Rückfall-Klasse, gegen die §6.7 steht.
        const messbar = f.status === 'bge' || f.status === 'bger';
        if (messbar && typeof e.gewicht !== 'number') {
          fehler.push(`${erlass}/${token}/${e.key}: gewicht ist in der Klasse '${f.status}' messbar, aber nicht gesetzt.`);
        }
        if (!messbar && e.gewicht !== null) {
          fehler.push(`${erlass}/${token}/${e.key}: gewicht=${JSON.stringify(e.gewicht)} in der Klasse '${f.status}', wo es NICHT messbar ist — muss null sein (§8).`);
        }

        zaehler[f.status] = (zaehler[f.status] ?? 0) + 1;
        kantenJeStatus[f.status] = (kantenJeStatus[f.status] ?? 0) + 1;
        kantenJeEbene[f.ebene] = (kantenJeEbene[f.ebene] ?? 0) + 1;
        kantenJeKanton[f.kanton] = (kantenJeKanton[f.kanton] ?? 0) + 1;
        kantenJeQuelltyp[f.quelltyp] = (kantenJeQuelltyp[f.quelltyp] ?? 0) + 1;
        if (f.status === 'kantonal') {
          if (shard.erlassEbene === 'bund') kantonalAnBund++; else kantonalAnKanton++;
        }
        if (f.status === 'bge' || f.status === 'bger') {
          bgProjektion.push({ key: e.key, gewicht: e.gewicht, datum: kopf.datum, leit: f.status === 'bge' });
        }
      }

      // T3e: Deckel je Status.
      for (const [st, n] of Object.entries(zaehler) as Array<[BezugStatus, number]>) {
        if (n > DECKEL_JE_STATUS[st]) {
          fehler.push(`${erlass}/${token}: Deckel ${st} überschritten (${n} > ${DECKEL_JE_STATUS[st]}).`);
        }
      }
      // T3f: Grundgesamtheit nie kleiner als das Gezeigte (§8).
      const gesamt = shard.gesamtProArtikel?.[token] ?? {};
      for (const [st, n] of Object.entries(zaehler) as Array<[BezugStatus, number]>) {
        const g = gesamt[st];
        if (g === undefined) {
          fehler.push(`${erlass}/${token}: Grundgesamtheit für '${st}' fehlt — ein gedeckelter Block ohne «von N» liest sich als Vollliste (§8).`);
        } else if (g < n) {
          fehler.push(`${erlass}/${token}: Grundgesamtheit ${st}=${g} kleiner als das Gezeigte (${n}).`);
        }
      }

      if (bgProjektion.length) projektion.set(`${erlass}/${token}`, bgProjektion);
    }
  }

  // ── T1: Projektions-Gleichheit gegen proNormArtikel ────────────────────────
  const bestand = index.proNormArtikel ?? {};
  const bestandKeys = Object.keys(bestand);
  for (const ak of bestandKeys) {
    const soll = bestand[ak].map((r) => r.key);
    const kanten = projektion.get(ak);
    if (!kanten) {
      fehler.push(`T1 ${ak}: im norm-index vorhanden, in den Bezugs-Shards ohne Bundesgerichts-Kante.`);
      continue;
    }
    const ist = [...kanten].sort(bestandsOrdnung).slice(0, LEITFAELLE_PRO_ARTIKEL).map((k) => k.key);
    if (soll.length !== ist.length || soll.some((k, i) => k !== ist[i])) {
      fehler.push(`T1 ${ak}: Bundesgerichts-Projektion weicht ab — norm-index [${soll.join(', ')}] vs. bezuege [${ist.join(', ')}].`);
    }
  }
  for (const ak of projektion.keys()) {
    if (!(ak in bestand)) {
      fehler.push(`T1 ${ak}: Bundesgerichts-Kante in den Bezugs-Shards, aber nicht im norm-index.`);
    }
  }

  // ── Bilanz ins Protokoll: Zahlen mit Grundgesamtheit (§8) ──────────────────
  const zeile = (o: Record<string, number>): string =>
    Object.keys(o).sort().map((k) => `${k} ${o[k]}`).join(' · ') || '–';
  console.log(`check:bezuege — ${dateien.length} Shards (Bund ${shardsBund}, Kanton ${shardsKanton}), ${artikelBuckets} Artikel-Buckets, ${kantenGesamt} ausgelieferte Kanten.`);
  console.log(`  Kanten je Status:   ${zeile(kantenJeStatus)}`);
  console.log(`  Kanten je Ebene:    ${zeile(kantenJeEbene)}`);
  console.log(`  Kanten je Quelltyp: ${zeile(kantenJeQuelltyp)}`);
  console.log(`  Kanten je Kanton:   ${zeile(kantenJeKanton)}`);
  console.log(`  Kantonale Kanten nach Ziel: Bundes-Erlass ${kantonalAnBund} · Kantons-Erlass ${kantonalAnKanton}`);
  console.log(`  Grundgesamtheit der Extraktion: ${manifest.entscheide.filter((e) => !e.verweis).length} Snapshots im Manifest; `
    + `T1-Projektion gegen ${bestandKeys.length} norm-index-Artikel geprüft.`);
  console.log(`  Kantonale Resolver: ${[...SYSTEMATIK_PRAEFIX.keys()].sort().join(', ') || '–'} `
    + `(Kantone ohne deklarierten Systematik-Präfix haben keine kantonalen Erlass-Kanten — benannte Lücke, §8).`);

  // ── T4: Artikel-Existenz-Abgleich, kantonale Erlasse (HINWEIS, nicht rot) ──
  //
  // Zeigt eine kantonale Kante auf einen §, den der gebundene Erlass gar nicht
  // hat, stimmt die Bindung nicht — so sind die Quell-Tippfehler in der
  // Systematik-Nummer überhaupt gefunden worden (Gegenprüfung Runde 1/B2).
  //
  // WARUM HINWEIS UND NICHT ROT: die Klasse hat ZWEI legitime Ursachen, und
  // keine davon ist ein Defekt dieser Pipeline (§7/§8).
  //  (a) ZEITLICH — ein Entscheid von 2019 zitiert die damals geltende Fassung;
  //      der seither aufgehobene § steht im heutigen Snapshot nicht mehr
  //      (BS-154.100 § 56a/§ 82a, BS-253.100 § 35).
  //  (b) QUELL-ZITIERFEHLER DES GERICHTS — der Entscheid nennt einen §, den der
  //      richtig gebundene Erlass nie geführt hat (BS-291.400 § 31, BS-861.540
  //      § 3a). Der Fehler steht im amtlichen Text; ihn stillschweigend zu
  //      korrigieren hiesse, die Quelle zu überschreiben.
  // Rot wäre hier ein Tor, das die falsche Frage stellt; sichtbar muss die Zahl
  // trotzdem sein (§6.7).
  let existenzGeprueft = 0, bundOhneBestand = 0, bundNurKantonal = 0;
  for (const datei of dateien) {
    const shard = JSON.parse(readFileSync(join(BEZ, datei), 'utf8')) as BezugsShard;
    const kantonal = shard.erlassEbene === 'kanton';
    // SPIEGELBILDLICH AUCH FÜR BUNDES-SHARDS (Gegenprüfung Runde 5/F3). Der
    // Abgleich lief nur kantonal — dabei entsteht dieselbe Klasse auf der
    // Bundesseite, und ein Teil davon liefert dieser PR NEU aus (kantonale
    // Entscheide an Bundesartikeln). Ein Abgleich, der nur eine Hälfte seiner
    // Fläche ansieht, misst nicht den Bestand, sondern seine eigene Reichweite.
    const snapPfad = kantonal
      ? join(ROOT, 'public', 'normtext', 'kanton', `${shard.erlass}.json`)
      : join(ROOT, 'public', 'normtext', 'bund', `${shard.erlass}.json`);
    if (!existsSync(snapPfad)) continue;   // T2 meldet fehlende kantonale Snapshots rot
    const vorhanden = artikelTokensVonErlass(snapPfad);
    if (!vorhanden.size) continue;         // Snapshot ohne lesbare Artikel — nichts zu sagen
    existenzGeprueft++;
    for (const token of Object.keys(shard.proArtikel)) {
      if (vorhanden.has(token)) continue;
      const kanten = shard.proArtikel[token] ?? [];
      if (kantonal) {
        warn.push(`${shard.erlass}: § ${token} kommt im Normtext-Snapshot nicht vor `
          + `(${kanten.length} Kante(n)) — Alt-Fassung ODER Zitierfehler der Quelle.`);
      } else {
        bundOhneBestand++;
        // Trennen, was DIESER PR neu ausliefert: Buckets, die ausschliesslich
        // aus kantonalen Kanten bestehen, gab es vorher nicht (§8 — die eigene
        // Zutat nicht im Bestandsrauschen verstecken).
        const nurKantonal = kanten.length > 0
          && kanten.every((e) => shard.dokumente?.[e.key]?.facetten.status === 'kantonal');
        if (nurKantonal) {
          bundNurKantonal++;
          warn.push(`${shard.erlass}: Art. ${token} kommt im Bundes-Snapshot nicht vor `
            + `(${kanten.length} Kante(n), ausschliesslich kantonal) — Zitierfehler der Quelle, `
            + `Kommentar-Apparat ODER Alt-Fassung.`);
        }
      }
    }
  }
  console.log(`  Artikel-Existenz-Abgleich: ${existenzGeprueft} Erlass-Shards (kantonal UND Bund) gegen ihren Normtext-Snapshot geprüft.`);
  console.log(`    Bundes-Shards: ${bundOhneBestand} Artikel-Buckets ohne Entsprechung im Snapshot, `
    + `davon ${bundNurKantonal} ausschliesslich aus kantonalen Kanten (von dieser Bau-Einheit neu geliefert).`);
  console.log('    (UNTERE SCHRANKE, §8: der Abgleich sieht nur Bindungen auf §§, die es im heutigen '
    + 'Snapshot NICHT gibt. Eine Fehlbindung auf einen §, den der falsche Erlass zufällig auch führt, '
    + 'bleibt unsichtbar — so war «HBG → BS-730.110 § 8» nur über § 8b auffällig.)');

  if (warn.length) {
    console.log(`\ncheck:bezuege — ${warn.length} Hinweis(e), kein Fehler:`);
    for (const w of warn.slice(0, 25)) console.log(`  · ${w}`);
    if (warn.length > 25) console.log(`  … und ${warn.length - 25} weitere.`);
  }
  if (fehler.length) {
    console.error(`\ncheck:bezuege ROT — ${fehler.length} Verstoss/Verstösse:`);
    for (const f of fehler.slice(0, 40)) console.error(`  · ${f}`);
    if (fehler.length > 40) console.error(`  … und ${fehler.length - 40} weitere.`);
    process.exit(1);
  }
  console.log('\ncheck:bezuege GRÜN — Projektion gleich, Referenzen aufgelöst, Facetten vollständig, Deckel eingehalten.');
}

main();
