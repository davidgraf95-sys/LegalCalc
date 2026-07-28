/**
 * gen:abk-aliase — amtliche DE/FR/IT-Abkürzungen der Register-Erlasse als
 * generiertes Alias-Artefakt (W2·6-NKEY Baustein b).
 *
 * ANLASS. Die normKeys-Zuordnung kennt bisher nur die DEUTSCHE Anzeige-
 * Abkürzung aus dem ERLASS_REGISTER. Ein Bundesgerichtsentscheid in der
 * Amtssprache Französisch zitiert aber «art. 42 LTF», nicht «Art. 42 BGG» —
 * dasselbe Bundesgesetz, ein anderes amtliches Kürzel. Das Sichtbarkeits-Tor
 * check:normkeys hat diese Lücke gemessen: 34 FR/IT-Amtskürzel über der
 * Schwelle von 20 Snapshots, alle desselben Bundesrechts (LTF/CST/COST, CP/CPP/
 * CPC/CC/CO, LP/LEF, CEDH/CEDU …). Sie sind keine Register-Lücke, sondern eine
 * fehlende Alias-Ebene.
 *
 * QUELLE (§7, amtlich): Fedlex-SPARQL-Endpoint, Prädikat `jolux:titleShort` am
 * sprachlichen Ausdruck (`jolux:isRealizedBy`) des Konsolidierungs-Abstracts.
 * Das ist die amtliche Kurzbezeichnung des Erlasses je Amtssprache — nicht
 * geraten, nicht übersetzt, nicht aus Modellwissen.
 *
 * ── Die vier Regeln, ohne die das Artefakt falsch wird ───────────────────────
 *
 * (1) DATENTYP-IRI AN DER NOTATION IST PFLICHT. `?e skos:notation "220"` trifft
 *     ohne den Typ-IRI auch die Notationstypen `id` und `id-amt` — also fremde
 *     Erlasse mit derselben Zeichenkette. Nur
 *     `"220"^^<…/vocabulary/notation-type/id-systematique>` ist die SR-Nummer.
 *
 * (2) CURRENCY-FENSTER GEGEN SCHATTEN-ABSTRACTS. Zu einer SR-Nummer hängen
 *     historische Konsolidierungs-Abstracts abgelöster Erlasse (SR 173.110
 *     trägt BGG *und* OG; SR 101 trägt BV *und* BV 1874). Ohne Fenster liefert
 *     dieselbe (sr, sprache) zwei verschiedene Kürzel. Fenster =
 *     `dateEntryInForce <= Stichtag` UND kein `dateNoLongerInForce <= Stichtag`.
 *     Empirisch (27.7.2026, 227 SR): mit Fenster 0 Konfliktgruppen.
 *
 * (3) TRIM + LEERSTRING-VERWURF. Der Endpoint liefert 42 Zeilen mit führendem
 *     Leerzeichen (z.B. ' LRD') und 761 Zeilen mit leerem `titleShort`. Beides
 *     wird in der Abfrage bereinigt und in TS ein zweites Mal geprüft (billig,
 *     und es hält das Artefakt sauber, falls der Endpoint sich ändert).
 *
 * (4) STILLE TEILERGEBNISSE — DER GEFÄHRLICHSTE BEFUND. Der Endpoint antwortet
 *     gelegentlich (≈2 von 20 Läufen) mit HTTP 200 und FEHLENDEN Zeilen. Ein
 *     Generator ohne Gegenprobe schriebe dann ein stillschweigend
 *     unvollständiges Artefakt — und niemand bemerkte die fehlenden Kürzel
 *     (§6.7). Darum je Batch ZUERST eine COUNT(*)-Abfrage über dieselbe
 *     DISTINCT-Projektion, dann die Zeilen; bei Abweichung bis zu vier
 *     Wiederholungen, danach ABBRUCH ohne Schreiben. Zusätzlich global: sinkt
 *     die Zeilenzahl unter die des committeten Artefakts, bricht der Generator
 *     ab (Regressions-Tor, §6.7) — ein Netz-Ausfall darf Bestand nicht löschen.
 *
 * KONFLIKTE WERDEN NICHT GERATEN (§8). Trägt eine (sr, sprache) trotz Fenster
 * zwei verschiedene Kürzel, bricht der Generator mit Fehler ab statt still zu
 * tiebreaken. Ein automatisch gewähltes Kürzel wäre eine zweite Wahrheit.
 *
 * Aufruf: npm run gen:abk-aliase -- --datum=YYYY-MM-DD
 *   Der Stichtag ist PFLICHT (§2): er geht in das Currency-Fenster ein, ist im
 *   Datei-Kopf dokumentiert und macht den Lauf reproduzierbar. Kein Date.now().
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register';
import { sparqlSelect, type SparqlBinding } from '../fedlex-sparql';
import { vergleiche } from './vergleich';

/**
 * Ziel-Artefakt, aufgelöst RELATIV ZU DIESER DATEI — nicht zum cwd (Härtung
 * Linse 2, 28.7.2026).
 *
 * Vorher stand hier der cwd-relative Pfad 'src/lib/normtext/…'. Bei einem Lauf
 * ausserhalb des Repo-Roots (Worktree-Unterordner, CI-Schritt mit anderem
 * working-directory, `vite-node` aus scripts/) zeigte er ins Leere. Die Folge
 * war nicht etwa ein Fehler, sondern etwas Schlimmeres: `existsSync` lieferte
 * false, `bestandZeilen()` gab 0 zurück, und weil das Regressions-Tor nur bei
 * `alt > 0` greift, war es STILL ABGESCHALTET — genau die Konstellation aus
 * §6.7 (ein Tor, das nicht scheitern kann). Geschrieben worden wäre dann auch
 * noch an den falschen Ort.
 *
 * `import.meta.url` ist unabhängig vom cwd; von scripts/normtext/ sind es zwei
 * Ebenen zum Repo-Root.
 */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ZIEL = resolve(WURZEL, 'src/lib/normtext/abk-aliase.generated.ts');

/** VALUES-Batchgrösse. Verifiziert an 227 SR in 6 Batches (27.7.2026). */
const BATCH = 40;
/** Wiederholungen je Batch, wenn COUNT ≠ Zeilenzahl (stille Teilergebnisse). */
const VERSUCHE = 5;

/** Datentyp-IRI der SR-Nummer. OHNE ihn treffen auch `id`/`id-amt` (Regel 1). */
const NOTATION_TYP = 'https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique';

const SPRACHE: Record<string, 'de' | 'fr' | 'it'> = { DEU: 'de', FRA: 'fr', ITA: 'it' };

export interface AliasZeile { sr: string; sprache: 'de' | 'fr' | 'it'; abk: string }

// ── Argument ────────────────────────────────────────────────────────────────
const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const STICHTAG = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(STICHTAG)) {
  console.error('--datum=YYYY-MM-DD ist Pflicht (§2: reproduzierbarer Stand, kein Date.now()).');
  process.exit(1);
}

// ── SR-Liste aus dem Register (§5: das Register ist die eine Quelle) ─────────
//
// ALLE Bund-Einträge mit sr-Feld — Volltext-Snapshots, pdf-embed (EMRK 0.101,
// NYÜ 0.277.12) und nur-live-link-Stubs gleichermassen; auch Staatsverträge
// (SR 0.*). KANTONALE Einträge bleiben aussen vor: ihr `sr` ist eine kantonale
// Systematiknummer, keine SR-Nummer — «161.12» aus dem Kanton BE würde am
// Bundes-Endpoint einen fremden Erlass treffen (§1).
function srListe(): string[] {
  const srs = new Set<string>();
  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    if (!/^[0-9][0-9.]*$/.test(e.sr)) {
      console.error(`SR-Nummer '${e.sr}' (key ${e.key}) hat unerwartete Form — Abbruch.`);
      process.exit(1);
    }
    srs.add(e.sr);
  }
  return [...srs].sort(vergleiche);
}

// ── Abfrage ─────────────────────────────────────────────────────────────────

const PREFIXE = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;

/**
 * Gemeinsamer Rumpf von Zähl- und Zeilen-Abfrage. Beide MÜSSEN denselben Rumpf
 * benutzen — eine COUNT-Abfrage über eine andere Projektion zählte etwas
 * anderes als sie absichern soll (§6.7, dieselbe Falle wie eine zweite
 * Zerlegung im Tor).
 */
function rumpf(srs: string[]): string {
  const vals = srs.map((s) => `"${s}"^^<${NOTATION_TYP}>`).join(' ');
  return `{
  VALUES ?sr { ${vals} }
  ?e skos:notation ?sr .
  ?cc a jolux:ConsolidationAbstract ; jolux:classifiedByTaxonomyEntry ?e ; jolux:dateEntryInForce ?von .
  FILTER(?von <= "${STICHTAG}"^^xsd:date)
  FILTER NOT EXISTS { ?cc jolux:dateNoLongerInForce ?bis . FILTER(?bis <= "${STICHTAG}"^^xsd:date) }
  ?cc jolux:isRealizedBy ?ex .
  ?ex jolux:language ?lu ; jolux:titleShort ?roh .
  BIND(REPLACE(REPLACE(str(?roh), "^\\\\s+", ""), "\\\\s+$", "") AS ?abk)
  FILTER(?abk != "")
  BIND(REPLACE(str(?lu), "^.*/", "") AS ?sprache)
  FILTER(?sprache IN ("DEU", "FRA", "ITA"))
}`;
}

const PROJEKTION = 'SELECT DISTINCT ?sr ?sprache ?abk ?cc WHERE';

function zeilenAbfrage(srs: string[]): string {
  return `${PREFIXE}\n${PROJEKTION} ${rumpf(srs)} ORDER BY ?sr ?sprache ?abk`;
}

function zaehlAbfrage(srs: string[]): string {
  return `${PREFIXE}\nSELECT (COUNT(*) AS ?n) WHERE { ${PROJEKTION} ${rumpf(srs)} }`;
}

/**
 * Ein Batch mit COUNT-Gegenprobe (Regel 4). Gibt die Bindings zurück, sobald
 * Zeilenzahl == COUNT; sonst Abbruch nach `VERSUCHE` Anläufen — lieber gar kein
 * Artefakt als ein stillschweigend unvollständiges.
 *
 * BEIDE SEITEN WERDEN WIEDERHOLT (Härtung Linse 2, 28.7.2026). Vorher wurde der
 * COUNT genau EINMAL geholt und danach nur die Zeilen-Abfrage wiederholt. Das
 * unterstellt, dass ausgerechnet die COUNT-Antwort nie vom Teilergebnis-Fehler
 * betroffen ist — wofür es keinen Grund gibt: derselbe Endpoint, dasselbe
 * Verhalten (Regel 4 nennt ≈2 von 20 Läufen). War der ERSTE COUNT der
 * verstümmelte, verglich der Generator vier weitere Male gegen eine zu kleine
 * Sollzahl; im ungünstigsten Fall stimmte ein ebenfalls verstümmeltes
 * Zeilen-Ergebnis mit ihr überein und das «Tor» bestätigte ein Teilergebnis.
 * Ein Vergleich, dessen Referenz denselben Fehler haben kann wie der Prüfling,
 * prüft nichts (§6.7). Darum je Anlauf ein FRISCHES Paar (COUNT + Zeilen); nur
 * ein Paar aus demselben Anlauf zählt als Übereinstimmung.
 */
async function batchMitZaehltor(srs: string[], nr: number): Promise<SparqlBinding[]> {
  const gesehen: string[] = [];
  for (let versuch = 1; versuch <= VERSUCHE; versuch += 1) {
    const zaehl = await sparqlSelect(zaehlAbfrage(srs));
    const soll = Number(zaehl[0]?.n?.value ?? 'NaN');
    if (!Number.isFinite(soll)) {
      console.error(`Batch ${nr}: COUNT-Abfrage lieferte keinen Wert — Abbruch.`);
      process.exit(1);
    }
    const zeilen = await sparqlSelect(zeilenAbfrage(srs));
    if (zeilen.length === soll) {
      const hinweis = versuch > 1 ? ` (nach ${versuch} Anläufen)` : '';
      console.log(`  Batch ${nr}: ${srs.length} SR → ${zeilen.length}/${soll} Zeilen${hinweis}`);
      return zeilen;
    }
    gesehen.push(`${versuch}: ${zeilen.length}/${soll}`);
    console.log(`  Batch ${nr}: Teilergebnis ${zeilen.length}/${soll} (Zeilen/COUNT) — Anlauf ${versuch + 1}`);
  }
  console.error(
    `Batch ${nr}: Zeilen- und COUNT-Abfrage stimmen nach ${VERSUCHE} Anläufen mit je frisch `
    + `geholtem Paar nicht überein [${gesehen.join(', ')}]. Schwankt auch die Sollzahl, liefert `
    + 'der Endpoint auf BEIDEN Abfragen Teilergebnisse. Kein Artefakt geschrieben — später '
    + 'erneut fahren.',
  );
  process.exit(1);
}

// ── Bestehendes Artefakt (Regressions-Tor) ──────────────────────────────────

/**
 * Zeilenzahl des committeten Artefakts; 0 NUR, wenn es nachweislich noch nicht
 * existiert (Erstlauf).
 *
 * Jeder andere Grund, den Bestand nicht lesen zu können — Leserechte, defekte
 * Datei, unerwartetes Format —, führt zum ABBRUCH statt zur stillen 0 (Härtung
 * Linse 2). Eine 0 schaltet das Regressions-Tor unten ab (`alt > 0`); ein
 * Generator, der wegen eines Lesefehlers plötzlich jede Zeilenzahl akzeptiert,
 * ist gefährlicher als einer, der gar nicht läuft (§6.7). Existiert die Datei
 * und enthält sie KEINE Alias-Zeile, ist das ebenfalls kein Erstlauf, sondern
 * ein kaputtes Artefakt — auch das bricht ab.
 */
function bestandZeilen(): number {
  if (!existsSync(ZIEL)) {
    console.log(`  Erstlauf: ${ZIEL} existiert noch nicht — Regressions-Tor greift ab dem nächsten Lauf.`);
    return 0;
  }
  let inhalt: string;
  try {
    inhalt = readFileSync(ZIEL, 'utf8');
  } catch (e) {
    console.error(
      `Bestand ${ZIEL} existiert, ist aber nicht lesbar (${String(e)}) — Abbruch. `
      + 'Ohne gelesenen Bestand wäre das Zeilen-Regressions-Tor still abgeschaltet (§6.7).',
    );
    process.exit(1);
  }
  const n = (inhalt.match(/^ {2}\{ sr: /gm) ?? []).length;
  if (n === 0) {
    console.error(
      `Bestand ${ZIEL} existiert, enthält aber KEINE Alias-Zeile im erwarteten Format — `
      + 'Abbruch. Entweder ist die Datei beschädigt oder das Zeilen-Format hat sich '
      + 'geändert; in beiden Fällen misst das Regressions-Tor nichts mehr (§6.7).',
    );
    process.exit(1);
  }
  return n;
}

// ── Hauptlauf ───────────────────────────────────────────────────────────────

const srs = srListe();
console.log(`\n── gen:abk-aliase — Stand ${STICHTAG}, ${srs.length} SR-Nummern aus dem Register ──`);

const roh: SparqlBinding[] = [];
for (let i = 0; i < srs.length; i += BATCH) {
  roh.push(...await batchMitZaehltor(srs.slice(i, i + BATCH), i / BATCH + 1));
}

// ── Filter + Konflikt-Prüfung ───────────────────────────────────────────────
const jeSrSprache = new Map<string, Map<string, Set<string>>>();   // sr → sprache → {abk}
const ccVon = new Map<string, Set<string>>();                       // "sr|sprache|abk" → {cc}
let verworfenLeer = 0;

for (const b of roh) {
  const sr = b.sr?.value ?? '';
  const sp = SPRACHE[b.sprache?.value ?? ''];
  const abk = (b.abk?.value ?? '').trim();          // Trim ein zweites Mal (Regel 3)
  if (!sr || !sp) continue;
  if (abk === '') { verworfenLeer += 1; continue; }
  let proSprache = jeSrSprache.get(sr);
  if (!proSprache) { proSprache = new Map(); jeSrSprache.set(sr, proSprache); }
  let menge = proSprache.get(sp);
  if (!menge) { menge = new Set(); proSprache.set(sp, menge); }
  menge.add(abk);
  const schl = `${sr}|${sp}|${abk}`;
  const ccs = ccVon.get(schl) ?? new Set<string>();
  ccs.add(b.cc?.value ?? '');
  ccVon.set(schl, ccs);
}

const konflikte: string[] = [];
for (const [sr, proSprache] of jeSrSprache) {
  for (const [sp, menge] of proSprache) {
    if (menge.size <= 1) continue;
    const detail = [...menge].sort(vergleiche)
      .map((a) => `${a} [${[...(ccVon.get(`${sr}|${sp}|${a}`) ?? [])].sort(vergleiche).join(', ')}]`)
      .join(' vs. ');
    konflikte.push(`SR ${sr} / ${sp}: ${detail}`);
  }
}
if (konflikte.length > 0) {
  console.error(
    `\n${konflikte.length} Konflikt(e) je (sr, sprache) — zwei amtliche Kürzel trotz `
    + 'Currency-Fenster. NICHT automatisch entschieden (§8); Ursache prüfen '
    + '(Schatten-Abstract? Erlass-Ablösung am Stichtag?):',
  );
  for (const k of konflikte.sort(vergleiche)) console.error(`  • ${k}`);
  process.exit(1);
}

// ── Zeilen bauen, deterministisch sortiert (sr, sprache, abk) ───────────────
const RANG: Record<'de' | 'fr' | 'it', number> = { de: 0, fr: 1, it: 2 };
const zeilen: AliasZeile[] = [];
for (const [sr, proSprache] of jeSrSprache) {
  for (const [sprache, menge] of proSprache) {
    for (const abk of menge) zeilen.push({ sr, sprache, abk });
  }
}
zeilen.sort((a, b) => vergleiche(a.sr, b.sr)
  || RANG[a.sprache] - RANG[b.sprache]
  || vergleiche(a.abk, b.abk));

// ── Regressions-Tor: weniger Zeilen als committet ⇒ Abbruch (§6.7) ──────────
const alt = bestandZeilen();
if (alt > 0 && zeilen.length < alt) {
  console.error(
    `\nREGRESSION: ${zeilen.length} Zeilen neu gegen ${alt} committete. Ein Lauf, der `
    + 'Bestand verliert, wird nicht geschrieben — Endpoint-Ausfall oder Register-Änderung '
    + `prüfen (${ZIEL}).`,
  );
  process.exit(1);
}

// ── Schreiben ───────────────────────────────────────────────────────────────
const proSprache = { de: 0, fr: 0, it: 0 };
for (const z of zeilen) proSprache[z.sprache] += 1;
const ohneAlias = srs.filter((sr) => !jeSrSprache.has(sr));

const kopf = `// AUTO-GENERIERT von scripts/normtext/abk-aliase-generieren.ts — NICHT von Hand editieren.
// Amtliche Kurzbezeichnungen (DE/FR/IT) der Bund-Erlasse des ERLASS_REGISTER.
// Quelle: Fedlex-SPARQL, jolux:titleShort am sprachlichen Ausdruck des geltenden
// Konsolidierungs-Abstracts (Currency-Fenster gegen Schatten-Abstracts), §7.
// Stand: ${STICHTAG} — Abdeckung ${jeSrSprache.size}/${srs.length} SR (de ${proSprache.de} · fr ${proSprache.fr} · it ${proSprache.it}).
// Regenerieren: npm run gen:abk-aliase -- --datum=$(date +%F)
// Wirkung: scripts/normtext/entscheide-mapping.ts löst jede Zeile über sr → Register-key
// auf und nimmt die Abkürzung als zusätzlichen Kandidaten in die normKeys-Tabelle;
// Abdeckung und Kollisionen misst das Tor check:normkeys.
// NICHT aus src/ importieren (Bundle §15) — reine Build-Zeit-Quelle der Pipeline.

export const ABK_ALIASE: ReadonlyArray<{ sr: string; sprache: 'de' | 'fr' | 'it'; abk: string }> = [
`;
const leib = zeilen
  .map((z) => `  { sr: ${JSON.stringify(z.sr)}, sprache: '${z.sprache}', abk: ${JSON.stringify(z.abk)} },`)
  .join('\n');
writeFileSync(ZIEL, `${kopf}${leib}\n];\n`, 'utf8');

console.log(`\n  Zeilen:      ${zeilen.length} (de ${proSprache.de} · fr ${proSprache.fr} · it ${proSprache.it})`);
console.log(`  SR mit Alias: ${jeSrSprache.size}/${srs.length}`);
if (verworfenLeer > 0) console.log(`  verworfen (leeres titleShort): ${verworfenLeer}`);
if (ohneAlias.length > 0) {
  console.log(`  OHNE Alias (${ohneAlias.length}) — kein titleShort in der geltenden Fassung:`);
  console.log(`    ${ohneAlias.join(', ')}`);
}
console.log(`  geschrieben: ${ZIEL}${alt > 0 ? ` (vorher ${alt} Zeilen)` : ''}\n`);
