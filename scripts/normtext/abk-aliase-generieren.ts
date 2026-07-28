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
 * ── Die fünf Regeln, ohne die das Artefakt falsch wird ──────────────────────
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
 * (5) EIN-ELEMENT-BATCHES SIND VERBOTEN — der Endpoint liefert dann DETERMINISTISCH
 *     0 Zeilen, und der COUNT stimmt zu (Befund 28.7.2026, hier gemessen). Isoliert
 *     bis auf die Stufe: `VALUES ?sr { <EIN Wert> }` + `FILTER(?von <=
 *     "…"^^xsd:date)` ⇒ aus 25 Treffern werden 0; mit einem ZWEITEN, ebenfalls
 *     treffenden Wert bleiben alle 149. Belegt an SR 0.142.30 und SR 0.101 (je
 *     5 Läufe, immer 0/0 Zeilen/COUNT; zusammen 4/4). Ein zweiter, NICHT
 *     existierender Wert hilft nicht (["0.142.30", "999.999.999"] ⇒ 0): nach dem
 *     Notations-Join bleibt wieder nur eine Zeile.
 *
 *     Das ist die gefährlichste Sorte Fehler, weil das COUNT-Tor aus Regel 4 ihn
 *     NICHT sehen kann — beide Abfragen sind gleich falsch (§6.7). Zwei Riegel:
 *     `batchListe()` erzeugt niemals einen Batch mit weniger als zwei SR (ein
 *     Rest von 1 wandert in den vorherigen Batch), und die Verlust-Gegenprobe im
 *     Prüf-Modus führt KANARIENVÖGEL mit, deren Ausbleiben den Lauf abbricht.
 *     Wirksam wird der erste Riegel, sobald die Registergrösse ≡ 1 (mod 40) ist —
 *     heute 230 SR, also 6 Batches à 40/40/40/40/40/30; bei 241 SR hätte der
 *     letzte Batch EINE Nummer, und deren Kürzel wären lautlos verschwunden.
 *
 * KONFLIKTE WERDEN NICHT GERATEN (§8). Trägt eine (sr, sprache) trotz Fenster
 * zwei verschiedene Kürzel, bricht der Generator mit Fehler ab statt still zu
 * tiebreaken. Ein automatisch gewähltes Kürzel wäre eine zweite Wahrheit.
 *
 * Aufruf: npm run gen:abk-aliase -- --datum=YYYY-MM-DD
 *   Der Stichtag ist PFLICHT (§2): er geht in das Currency-Fenster ein, ist im
 *   Datei-Kopf dokumentiert und macht den Lauf reproduzierbar. Kein Date.now().
 *
 * ── DRIFT-TOR: npm run check:fedlex-abk-netz  (= dieses Skript mit --check) ──
 *
 * ANLASS (28.7.2026). Das Artefakt trug bis hierher KEINE Drift-Erkennung. Damit
 * fehlte ihm das vierte Merkmal der Zitat-Ausnahme (§7 lit. d): ändert Fedlex
 * eine amtliche Kurzbezeichnung, wird ein Erlass abgelöst oder kommt ein Kürzel
 * hinzu, blieb die committete Abschrift still falsch — eine zweite Wahrheit (§5),
 * die niemand meldet. `--check` schliesst genau diese Lücke: dieselbe Abfrage,
 * dieselben fünf Regeln, aber statt zu schreiben wird VERGLICHEN.
 *
 * WARUM ALS MODUS UND NICHT ALS ZWEITES SKRIPT (§5): Prüfling und Prüfer müssen
 * dieselbe SPARQL-Kette benutzen. Ein Parallel-Skript mit eigener Abfrage prüfte
 * am Ende die Übereinstimmung zweier Abfragen und nicht die des Artefakts mit der
 * Amtsquelle — und driftete unbemerkt vom Generator weg (§6.7).
 *
 * DREI EIGENSCHAFTEN, DIE DAS TOR TRAGEN:
 *  (a) Ein STILL PARTIELLES ODER LEERES SPARQL-Resultat kann nie grün werden.
 *      Erstens greift auch im Prüf-Modus je Batch das COUNT-Tor mit frischem
 *      Paar (Regel 4). Zweitens ist jede fehlende Zeile per Konstruktion ROT:
 *      der Vergleich ist mengengleich in BEIDE Richtungen, ein Teilergebnis
 *      erscheint also als «weggefallen» und nicht als «kein Drift». Drittens
 *      bricht ein Resultat von 0 Zeilen sofort ab, statt 597 Weggefallene zu
 *      melden — die ehrlichere Diagnose (Endpoint, nicht Recht). Und weil ein
 *      Verlust-Befund und ein gekapptes Resultat gleich AUSSEHEN, wird jeder
 *      Verlust vor der Meldung gezielt nachgefragt (`verlustGegenprobe`): so
 *      behauptet das Tor nie eine Rechtsänderung, die es nicht gesehen hat.
 *  (b) Ein NETZFEHLER ist ein eigener Fehlerpfad, nie grün: die einzige I/O-
 *      Strecke (der Batch-Abruf) liegt in einem try/catch, das über
 *      `netzAbbruch()` Ursache UND Nicht-Aussage ausspricht und mit 1 endet.
 *      Belegt am 28.7.2026 gegen einen unerreichbaren Host («fetch failed») und
 *      gegen eine falsche Endpoint-Adresse («antwortet 405»).
 *  (c) Der Stichtag ist im Prüf-Modus OPTIONAL und dann der heutige Tag (UTC).
 *      Das ist bewusst: ein Drift-Tor, das gegen den EINGEFRORENEN Stichtag des
 *      Artefakts prüfte, könnte die wichtigste Drift-Art gar nicht sehen — eine
 *      Konsolidierung, die NACH dem Artefakt-Stand in Kraft trat. Wanduhr steckt
 *      damit nur im Prüf-Pfad (Frage: «gilt das heute noch?»), nie im
 *      Schreib-Pfad und nie in der Rechenlogik (§2).
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

// ── Argumente ───────────────────────────────────────────────────────────────
/** `--check`: nicht schreiben, sondern gegen die Amtsquelle vergleichen (Drift-Tor). */
const NUR_PRUEFEN = process.argv.includes('--check');
const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const STICHTAG = datumArg
  ? datumArg.slice('--datum='.length)
  // Prüf-Modus ohne --datum: heute (UTC). Begründung (c) im Datei-Kopf.
  : (NUR_PRUEFEN ? new Date().toISOString().slice(0, 10) : '');
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
 * Batch-Aufteilung, die NIE einen Ein-Element-Batch erzeugt (Regel 5).
 *
 * Ein Rest von genau einer SR-Nummer wird dem vorherigen Batch angehängt (41
 * statt 40+1). Warum nicht «dann halt ein Batch mit 1»: der Endpoint liefert dazu
 * deterministisch 0 Zeilen MIT passendem COUNT — die Kürzel dieser SR wären
 * lautlos weg, im Prüf-Modus als «weggefallen» fehlinterpretiert. Bei einer
 * einzigen SR-Nummer insgesamt gibt es keinen vorherigen Batch; dann bricht der
 * Lauf ab, statt ein Ergebnis zu liefern, dem nicht zu trauen ist.
 */
function batchListe(srs: string[]): string[][] {
  if (srs.length === 1) {
    console.error(
      'Nur EINE SR-Nummer im Register: der Endpoint liefert zu einem Ein-Element-VALUES '
      + 'deterministisch 0 Zeilen mit passendem COUNT (Regel 5) — kein vertrauenswürdiges '
      + 'Ergebnis möglich, Abbruch.',
    );
    process.exit(1);
  }
  const batches: string[][] = [];
  for (let i = 0; i < srs.length; i += BATCH) batches.push(srs.slice(i, i + BATCH));
  const letzter = batches[batches.length - 1];
  if (batches.length > 1 && letzter.length < 2) {
    batches[batches.length - 2].push(...letzter);
    batches.pop();
  }
  return batches;
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
async function batchMitZaehltor(srs: string[], nr: number | string): Promise<SparqlBinding[]> {
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

/** Eine Artefakt-Zeile, exakt so wie `schreibeArtefakt()` sie rendert. */
const ZEILEN_MUSTER = /^ {2}\{ sr: "([^"]+)", sprache: '(de|fr|it)', abk: ("(?:[^"\\]|\\.)*") \},$/;

/**
 * Die committeten Alias-Zeilen — die PRÜFLING-Seite des Drift-Tors.
 *
 * Anders als `bestandZeilen()` ist ein FEHLENDES Artefakt hier kein Erstlauf,
 * sondern rot: ohne committete Seite gibt es nichts zu vergleichen, und ein Tor,
 * das ohne Prüfling grün meldet, ist genau das Tor aus §6.7. Ebenso rot ist eine
 * Zeile, die das Muster nicht trifft: dann hat entweder eine Hand-Edition das
 * Artefakt verändert (verboten) oder das Render-Format des Generators hat sich
 * geändert, ohne dass der Parser mitgezogen wurde — in beiden Fällen verglich
 * das Tor sonst gegen eine Teilmenge und schwiege über den Rest.
 */
function bestandLesen(): AliasZeile[] {
  if (!existsSync(ZIEL)) {
    console.error(
      `PRÜFUNG UNMÖGLICH: ${ZIEL} existiert nicht. Ohne committetes Artefakt gibt es keinen `
      + 'Prüfling — erst `npm run gen:abk-aliase -- --datum=$(date +%F)` fahren.',
    );
    process.exit(1);
  }
  const inhalt = readFileSync(ZIEL, 'utf8');
  const kandidaten = inhalt.split('\n').filter((z) => z.startsWith('  { sr: '));
  const zeilen: AliasZeile[] = [];
  for (const z of kandidaten) {
    const m = ZEILEN_MUSTER.exec(z);
    if (!m) {
      console.error(
        `Artefakt-Zeile trifft das erwartete Format NICHT: ${z}\n`
        + `  → ${ZIEL} von Hand editiert oder Render-Format geändert. Abbruch statt Teilvergleich (§6.7).`,
      );
      process.exit(1);
    }
    zeilen.push({ sr: m[1], sprache: m[2] as 'de' | 'fr' | 'it', abk: JSON.parse(m[3]) as string });
  }
  if (zeilen.length === 0) {
    console.error(`Artefakt ${ZIEL} enthält KEINE Alias-Zeile — Abbruch (kaputtes Artefakt, §6.7).`);
    process.exit(1);
  }
  return zeilen;
}

// ── Drift-Vergleich (nur --check) ───────────────────────────────────────────

/**
 * HINWEIS, KEIN TOR: deutsche Anzeige-Abkürzung im ERLASS_REGISTER ≠ amtliches
 * `titleShort` derselben SR-Nummer.
 *
 * Warum sichtbar: eine solche Divergenz ist eine offene FACHLICHE Frage (§7/§8) —
 * das Register führt die im Schrifttum gebräuchliche Anzeigeform, Fedlex die
 * amtliche Kurzbezeichnung; welche im UI stehen soll, entscheidet nicht ein
 * Build-Schritt. Belegter Fall (28.7.2026): SR 0.142.30 — Register «GFK»
 * (Genfer Flüchtlingskonvention), Fedlex «FK».
 *
 * Warum trotzdem kein Tor: rot machen hiesse, eine Antwort zu erzwingen, die nur
 * David geben kann; still lassen hiesse, sie zu vergessen. Darum ausgewiesen mit
 * Verweis auf die Aktenlage — Entscheid offen in
 * bibliothek/recherche/fedlex-abkuerzungen-titleshort.md.
 */
function divergenzHinweis(live: AliasZeile[]): void {
  const amtlichDe = new Map<string, string>();
  for (const z of live) if (z.sprache === 'de') amtlichDe.set(z.sr, z.abk);
  // Vergleich auf Buchstaben/Ziffern reduziert: «BVV 2» vs «BVV2» oder «Cst.» vs
  // «CST» sind Schreibvarianten desselben Kürzels und keine Divergenz.
  const kern = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g, '');
  const zeilen: string[] = [];
  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    const amtlich = amtlichDe.get(e.sr);
    if (!amtlich || kern(e.kuerzel) === kern(amtlich)) continue;
    zeilen.push(`SR ${e.sr} (key ${e.key}): Register '${e.kuerzel}' ≠ Fedlex '${amtlich}'`);
  }
  if (zeilen.length === 0) return;
  console.log(
    `\n  HINWEIS (kein Tor) — ${zeilen.length} DE-Divergenz(en) Register ↔ amtliches titleShort. `
    + 'Anzeigeform ist ein fachlicher Entscheid (§7/§8), kein Build-Fakt; Aktenlage in '
    + 'bibliothek/recherche/fedlex-abkuerzungen-titleshort.md:',
  );
  for (const z of zeilen.sort(vergleiche)) console.log(`    · ${z}`);
}

/**
 * Vergleicht die LIVE geholten Zeilen mengengleich mit dem committeten Artefakt
 * und endet selbst — grün nur bei Deckungsgleichheit.
 *
 * Der Vergleich läuft in BEIDE Richtungen über das Tripel (sr, sprache, abk).
 * Das ist nicht Kosmetik, sondern das zweite Count-Tor: eine still gekappte
 * SPARQL-Antwort erscheint dann zwingend als «weggefallen» und kann nicht als
 * «kein Drift» durchgehen. Ein Vergleich nur in Richtung live→Artefakt («ist
 * alles Geholte bekannt?») wäre bei jedem Teilergebnis grün — genau der
 * Fehlklassifikator aus §6.7.
 */
/**
 * GEGENPROBE GEGEN DAS STILLE TEILERGEBNIS (§0 Ziff. 3 sinngemäss: ein Fehlbestand
 * ist ein VERDACHT, keine Ursache).
 *
 * Ein «weggefallenes» Kürzel und ein still gekapptes SPARQL-Resultat sehen im
 * Vergleich IDENTISCH aus. Der Endpoint liefert nachweislich bei ≈2 von 20 Läufen
 * HTTP 200 mit fehlenden Zeilen (Regel 4 oben, Befund der #397-Session). Das
 * Batch-COUNT-Tor fängt den Normalfall; es fängt NICHT den Fall, in dem COUNT und
 * Zeilen gleichermassen gekappt sind. Ein Tor, das dann «die amtliche Abkürzung
 * ist weggefallen» meldet, behauptet eine Rechtsänderung, die es nicht gesehen hat.
 *
 * Darum wird jeder Verlust-Befund gezielt nachgefragt: nur die betroffenen
 * SR-Nummern, in einem eigenen Batch mit eigenem COUNT-Tor. Tauchen die Kürzel
 * dabei doch auf, war es ein Teilergebnis — dann bleibt der Lauf rot, aber mit der
 * RICHTIGEN Diagnose (Endpoint, nicht Recht) und ohne Aufforderung zum Regenerieren.
 *
 * KANARIENVÖGEL SIND PFLICHT (Regel 5, gelernt an genau dieser Stelle): eine
 * Nachfrage über wenige SR-Nummern läuft in dieselbe Falle, in der der Endpoint zu
 * einem Ein-Element-VALUES deterministisch 0 Zeilen mit passendem COUNT liefert.
 * Die erste Fassung dieser Gegenprobe fragte genau eine SR nach, bekam 0 Zeilen und
 * «bestätigte» den Verlust — ein Prüfer, der IMMER bestätigt, prüft nichts (§6.7).
 * Darum reisen drei Zeilen mit, die im Live-Ergebnis nachweislich vorhanden sind:
 * fehlen sie in der Nachfrage, ist die Nachfrage selbst kaputt und der Lauf bricht
 * ab, statt ein Urteil zu fällen.
 */
async function verlustGegenprobe(betroffen: string[], kanarien: AliasZeile[]): Promise<Set<string>> {
  const srs = [...new Set([...betroffen, ...kanarien.map((z) => z.sr)])].sort(vergleiche);
  let roh: SparqlBinding[];
  try {
    roh = await batchMitZaehltor(srs, `Gegenprobe (${betroffen.length} SR + ${kanarien.length} Kanarienvögel)`);
  } catch (e) {
    netzAbbruch(e);
  }
  const tripel = new Set<string>();
  for (const b of roh) {
    const sr = b.sr?.value ?? '';
    const sp = SPRACHE[b.sprache?.value ?? ''];
    const abk = (b.abk?.value ?? '').trim();
    if (!sr || !sp || abk === '') continue;
    tripel.add(`${sr}|${sp}|${abk}`);
  }
  const stumm = kanarien.filter((z) => !tripel.has(`${z.sr}|${z.sprache}|${z.abk}`));
  if (stumm.length > 0) {
    console.error(
      `\nGEGENPROBE NICHT AUSSAGEKRÄFTIG: ${stumm.length} von ${kanarien.length} Kanarienvögeln `
      + 'fehlen in der Nachfrage, obwohl der Hauptlauf sie geliefert hat — die Nachfrage-Abfrage '
      + 'selbst ist unzuverlässig (Regel 5: Ein-Element-Falle, Endpoint-Plan). Kein Drift-Urteil:',
    );
    for (const z of stumm) console.error(`    • SR ${z.sr} / ${z.sprache}: '${z.abk}' erwartet, nicht geliefert`);
    process.exit(1);
  }
  return tripel;
}

async function pruefeDrift(live: AliasZeile[], srAnzahl: number, srMitAlias: number): Promise<never> {
  // Null-Resultat: das ist ein Endpoint-Befund, keine Rechtsänderung. Ohne diesen
  // Riegel meldete das Tor 597 «weggefallene» Kürzel und behauptete damit etwas
  // über das Recht, was in Wahrheit eine Aussage über die Leitung ist (§8).
  if (live.length === 0) {
    console.error(
      '\nENDPOINT LIEFERTE 0 ZEILEN bei nicht-leerem Register — das ist ein Quellen-, kein '
      + 'Rechts-Befund. Kein Drift-Urteil (§8): Abfrage/Endpoint prüfen und erneut fahren.',
    );
    process.exit(1);
  }

  divergenzHinweis(live);

  const bestand = bestandLesen();
  const tripel = (z: AliasZeile): string => `${z.sr}|${z.sprache}|${z.abk}`;
  const paar = (z: AliasZeile): string => `${z.sr}|${z.sprache}`;

  const liveTripel = new Set(live.map(tripel));
  const bestandTripel = new Set(bestand.map(tripel));
  const livePaare = new Map<string, string[]>();
  const bestandPaare = new Map<string, string[]>();
  for (const z of live) livePaare.set(paar(z), [...(livePaare.get(paar(z)) ?? []), z.abk].sort(vergleiche));
  for (const z of bestand) bestandPaare.set(paar(z), [...(bestandPaare.get(paar(z)) ?? []), z.abk].sort(vergleiche));

  const geaendert: string[] = [];
  const neu: string[] = [];
  const weggefallen: string[] = [];

  for (const [p, liveAbk] of livePaare) {
    const bestandAbk = bestandPaare.get(p);
    const [sr, sprache] = p.split('|');
    if (!bestandAbk) {
      neu.push(`SR ${sr} / ${sprache}: Fedlex führt '${liveAbk.join("', '")}' — im Artefakt fehlt die Zeile`);
    } else if (liveAbk.join(' ') !== bestandAbk.join(' ')) {
      geaendert.push(`SR ${sr} / ${sprache}: Artefakt '${bestandAbk.join("', '")}' → Fedlex '${liveAbk.join("', '")}'`);
    }
  }
  const verloren: AliasZeile[] = [];
  for (const [p, bestandAbk] of bestandPaare) {
    if (livePaare.has(p)) continue;
    const [sr, sprache] = p.split('|');
    for (const abk of bestandAbk) verloren.push({ sr, sprache: sprache as 'de' | 'fr' | 'it', abk });
    weggefallen.push(
      `SR ${sr} / ${sprache}: Artefakt führt '${bestandAbk.join("', '")}', Fedlex führt am ${STICHTAG} `
      + 'KEIN Kürzel mehr (aufgehoben, abgelöst oder titleShort entfernt)',
    );
  }

  console.log(`\n  Live:     ${live.length} Zeilen (${srMitAlias}/${srAnzahl} SR mit Alias)`);
  console.log(`  Artefakt: ${bestand.length} Zeilen (${ZIEL})`);

  const summe = geaendert.length + neu.length + weggefallen.length;
  if (summe === 0) {
    console.log(
      `  OK — Artefakt deckungsgleich mit der Amtsquelle (Stand ${STICHTAG}), `
      + `${liveTripel.size} Tripel beidseitig, ${bestandTripel.size} committet.\n`,
    );
    process.exit(0);
  }

  // Verlust-Befund ⇒ gezielte Gegenprobe, BEVOR er als Rechtsänderung gemeldet wird.
  let gegenprobe = '';
  if (verloren.length > 0) {
    const betroffen = [...new Set(verloren.map((z) => z.sr))].sort(vergleiche);
    // Kanarienvögel: Live-Zeilen fremder SR — sie MÜSSEN in der Nachfrage wieder
    // erscheinen, sonst ist die Nachfrage selbst kaputt (Regel 5).
    const kanarien = live.filter((z) => !betroffen.includes(z.sr)).slice(0, 3);
    console.log(
      `\n  ${verloren.length} Verlust-Befund(e) über ${betroffen.length} SR — Gegenprobe gegen `
      + `stille Teilergebnisse, betroffene SR + ${kanarien.length} Kanarienvögel:`,
    );
    const nach = await verlustGegenprobe(betroffen, kanarien);
    const widerspruch = verloren.filter((z) => nach.has(`${z.sr}|${z.sprache}|${z.abk}`));
    if (widerspruch.length > 0) {
      console.error(
        `\nSTILLES TEILERGEBNIS statt Drift: die Gegenprobe LIEFERT ${widerspruch.length} der `
        + `${verloren.length} angeblich weggefallenen Kürzel doch — der erste Abruf war gekappt, `
        + 'obwohl COUNT und Zeilen übereinstimmten. Betroffen:',
      );
      for (const z of widerspruch.sort((a, b) => vergleiche(a.sr, b.sr) || vergleiche(a.abk, b.abk))) {
        console.error(`    • SR ${z.sr} / ${z.sprache}: '${z.abk}' — in der Gegenprobe vorhanden`);
      }
      console.error(
        '\n  → KEIN Drift-Urteil und NICHT regenerieren: das Artefakt ist unverdächtig, der '
        + 'Endpoint war unvollständig (§8). Lauf später wiederholen; bleibt der Befund bei '
        + 'mehreren Läufen bestehen, ist es echte Drift.\n',
      );
      process.exit(1);
    }
    gegenprobe = ` · Verlust in der Gegenprobe bestätigt (${betroffen.length} SR erneut abgefragt)`;
  }

  console.error(
    `\nDRIFT gegen die amtliche Quelle: ${geaendert.length} geändert · ${neu.length} neu · `
    + `${weggefallen.length} weggefallen (Stichtag ${STICHTAG}, Fedlex-SPARQL jolux:titleShort)`
    + `${gegenprobe}.`,
  );
  const block = (titel: string, zeilen: string[]): void => {
    if (zeilen.length === 0) return;
    console.error(`\n  ${titel} (${zeilen.length}):`);
    for (const z of zeilen.sort(vergleiche)) console.error(`    • ${z}`);
  };
  block('GEÄNDERTE amtliche Abkürzung', geaendert);
  block('NEUE amtliche Abkürzung', neu);
  block('WEGGEFALLENE amtliche Abkürzung', weggefallen);
  console.error(
    '\n  → Artefakt neu erzeugen (`npm run gen:abk-aliase -- --datum=$(date +%F)`), Diff '
    + 'BEWUSST abnehmen (§7: die amtliche Fassung ist massgeblich, nicht das Artefakt), '
    + 'danach `npm run check:normkeys` — eine geänderte Abkürzung kann Zuordnungen '
    + 'verschieben oder neue Kollisionen erzeugen.\n',
  );
  process.exit(1);
}

// ── Hauptlauf ───────────────────────────────────────────────────────────────

const srs = srListe();
const modus = NUR_PRUEFEN ? 'check:fedlex-abk-netz (Drift-Prüfung, schreibt nicht)' : 'gen:abk-aliase';
console.log(`\n── ${modus} — Stand ${STICHTAG}, ${srs.length} SR-Nummern aus dem Register ──`);

/**
 * Netzfehler sind ein EIGENER, ehrlicher Fehlerpfad — nie grün und nie stumm
 * (§8). Ohne diesen Riegel entschied die Laufzeit, was ein nicht erreichbarer
 * Endpoint bedeutet; ein Prüf-Modus, der bei DNS-Fehler oder HTTP 500 mit
 * unklarem Stack endet, wird im Cron-Log leicht als «rot wegen Infrastruktur,
 * schon gut» weggelesen. Darum wird hier ausgesprochen, was der Lauf NICHT
 * aussagt: er ist keine Entlastung des Artefakts.
 */
function netzAbbruch(e: unknown): never {
  console.error(
    `\nNETZFEHLER gegen die Amtsquelle: ${e instanceof Error ? e.message : String(e)}\n`
    + '  → Der Lauf hat NICHTS festgestellt: kein Drift-Freispruch und '
    + `${NUR_PRUEFEN ? 'keine Abnahme' : 'kein geschriebenes Artefakt'}. `
    + 'Ein unerreichbarer Endpoint darf nie grün werden (§6.7/§8) — später erneut fahren.',
  );
  process.exit(1);
}

const roh: SparqlBinding[] = [];
try {
  const batches = batchListe(srs);
  for (let i = 0; i < batches.length; i += 1) {
    roh.push(...await batchMitZaehltor(batches[i], i + 1));
  }
} catch (e) {
  netzAbbruch(e);
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

// ── Prüf-Modus: vergleichen statt schreiben; endet in pruefeDrift ───────────
//
// Der Prüf-Modus verzweigt ERST HIER, nach Abfrage, COUNT-Tor, Trim/Leerstring-
// Verwurf und Konflikt-Prüfung: er sieht damit genau dieselben Zeilen, die ein
// Schreib-Lauf schreiben würde. Jede frühere Verzweigung hätte einen zweiten,
// nur ähnlichen Pfad geschaffen — und ein Prüfer, der etwas anderes berechnet
// als der Generator, prüft den Generator nicht (§5/§6.7).
if (NUR_PRUEFEN) await pruefeDrift(zeilen, srs.length, jeSrSprache.size);

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
