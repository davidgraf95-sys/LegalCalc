/**
 * gen:kanton-abk-aliase — kantonale Erlass-Kürzel als generiertes Such-Alias-
 * Artefakt (R8 «Abkürzungen als Such-Aliase, kanton-generisch», 31.8.2026).
 *
 * ANLASS. Die Artikel-Suche findet kantonale Erlasse über Titelwörter, aber
 * nicht zuverlässig über ihr amtliches Kürzel: der Edge-/DB-Weg (fts_artikel)
 * trug bis R8 GAR KEIN Erlass-Kürzel-Feld («GOG» fand am Edge nur Artikel, die
 * das Wort zufällig im Text führen), und der statische Client-Weg hing am
 * ungefilterten Voll-String `NormSnapshot.erlass` («Titel, Kürzel (Nr)»), der
 * für Titel-Kopien mehr Rauschen als Signal trägt. Dieses Artefakt ist die EINE
 * Alias-Quelle der Kanton-Ebene (§5) — Konsumenten: scripts/such-index-
 * generieren.ts (Feld `kz` je Kanton-Eintrag) und scripts/datenhaltung/fts.ts
 * (FTS-Spalte `kuerzel`).
 *
 * QUELLE (§7, seit R8.3 Wurzel-Fix F8, 1.9.2026): das ROHE Registerfeld
 * `abkRoh` der Kanton-Einträge in public/normtext/register.json — die
 * Projektion des Sidecars public/normtext/kanton-abk-roh.json (Mechanik und
 * Herkunfts-Klassen api/rueckrechnung: Kopf von kanton-abk-roh.ts). Das Feld
 * trägt das `abbreviation`-Feld der kantonalen Erlasssammlungs-APIs VERBATIM
 * und darf leer sein; FEHLT es, führt die Quelle kein amtliches Kürzel —
 * dann KEIN Alias (fail-closed, gezählt als 'kein-amtliches-kuerzel').
 * VOR R8.3 las der Generator das `kuerzel`-Feld, das browse-manifest per
 * Last-Comma-Split aus «Titel, Kürzel (Nr)» ZURÜCKRIET — bei abbreviation=''
 * (kein Komma) lieferte der No-Comma-Zweig kuerzel=Titel ⇒ 142 Titel-Aliase
 * (GP2-Befund F8, Live-Belege BS-291.100 «Advokaturgesetz», BS-410.100
 * «Schulgesetz», AR-421.10 «Archivgesetz», alle amtlich abbreviation='').
 * KEIN Wert dieses Artefakts wird erfunden oder umgeformt — die Regeln unten
 * entscheiden nur, OB ein Wert als Such-Alias taugt, nie WIE er lautet
 * (einzige artefakt-seitige Umformung: der dokumentierte Semikolon-Split R2,
 * der einen TEIL des amtlichen Werts wählt; upstream existiert daneben der
 * Last-Comma-Split von identitaetAusErlass — er speist seit R8.3 nur noch die
 * ANZEIGE-Felder kuerzel/titel, nie mehr dieses Artefakt). PRÜFBAR: kein Alias
 * trägt eine Klammer, jeder Alias steht wörtlich im Register-abkRoh seines
 * Keys (src/tests/kanton-abk-aliase.test.ts, Artefakt-Invarianten).
 *
 * Hinweis PDF-Pipeline (GP-Befund F1/F2, 31.8.2026, weiterhin gültig):
 * PDF-Einträge haben kein API-abbreviation; ihr Register-kuerzel ist der
 * REPO-KURATIERTE Zitat-Name (Beleg: SG-2808 «Gerichtskostenverordnung (GKV)»,
 * amtlich abbreviation="" laut gesetzessammlung.sg.ch/api/de/texts_of_law/941.12).
 * Seit R8.3 sind sie strukturell draussen: ohne API-Wert kein abkRoh. R6
 * (Klammer) bleibt als Wächter auf dem Rohwert bestehen.
 *
 * WARUM NICHT DERSELBE GENERATOR WIE DER BUND (Querschnitt-Frage des Auftrags,
 * geprüft und verneint): abk-aliase-generieren.ts ist eine NETZ-Pipeline gegen
 * den Fedlex-SPARQL-Endpoint (jolux:titleShort je Amtssprache, Currency-Fenster,
 * COUNT-Tore gegen stille Teilergebnisse — fünf Regeln, die es nur wegen des
 * Endpoints gibt). Die Kanton-Quelle liegt dagegen OFFLINE im committeten
 * Register, kennt keine Sprach-Dimension und keine SR-Nummern. Ein gemeinsamer
 * Generator müsste beide Welten über Schalter trennen und teilte am Ende nichts
 * als den Dateikopf — zwei Pipelines wären es trotzdem (§1 vor Code-Sparsamkeit).
 * Geteilt wird stattdessen das MUSTER (generiertes, sortiertes, nie von Hand
 * editiertes Artefakt mit --check-Drift-Modus) und `vergleiche()`.
 *
 * ── Die Ausschluss-Regeln (dokumentiert, deterministisch, je mit Beleg) ──────
 *
 * R1 — GESTORBEN mit dem Wurzel-Fix F8 (R8.3, Rückbau §17-Gegengewicht).
 *    R1 («kuerzel === titel ⇒ Titel-Kopie») war ein Flicken auf dem
 *    zurückgeratenen kuerzel-Feld und hatte eine belegte Lücke: der
 *    No-Comma-Zweig liefert kuerzel ≠ titel (Titel ohne vs. mit «(Nr)»),
 *    142 Titel-Aliase rutschten durch (GP2-F8). Seit der Quelle abkRoh ist
 *    die Sorge strukturell erledigt: leeres abbreviation ⇒ leeres/fehlendes
 *    Rohfeld ⇒ kein Alias ('kein-amtliches-kuerzel'). Nummern R2–R7 bleiben
 *    stabil (Bestandsverweise, wie CLAUDE.md-§-Politik).
 *
 * R2 SEPARATOR-SPLIT «Langform; Kürzel» (AR-Konvention, Semikolon) bzw.
 *    «Langform, Kürzel» (BS/BE-Konvention, Komma — live belegt 1.9.2026 am
 *    ROHEN abbreviation-Feld: BS-154.100 «Gerichtsorganisationsgesetz, GOG»,
 *    BE-168.811 «Parteikostenverordnung, PKV»). Das abbreviation-Feld dieser
 *    Kantone trägt beide Formen in EINEM Wert; Alias ist der Teil nach dem
 *    letzten Separator — die Kürzel-Hälfte DESSELBEN amtlichen Werts, keine
 *    Erfindung. Der Komma-Tail ist zusätzlich fragment-bewacht
 *    (istKuerzelFragment, T2/S2), damit ein Titel-Binnenkomma nie ein
 *    Satzfragment zum Alias macht.
 *
 * R3 ZU LANG (> 30 Zeichen). Ein Wert dieser Länge ist ein Kurztitel oder eine
 *    Titel-Abschrift («Vorläufige Verordnung zum Mietrecht», «COVID-19
 *    Start-up-Bürgschaftsverordnung 2»); seine Wörter stehen ohnehin im
 *    indexierten Titel — als Alias fügte er nichts hinzu und kippte Titelwörter
 *    in ein gewichtetes Suchfeld. Grenze empirisch: das längste echte
 *    Mehrwort-Kürzel des Bestands ist «Abfallvereinbarung BS - BL» (26).
 *
 * R4 KLEINWÖRTER (≥ 2 kleingeschriebene Wörter). Titelsyntax («Dekret über den
 *    Notariatstarif», «Gesetz über das Gastgewerbe») statt Kürzel. EIN
 *    Kleinwort bleibt erlaubt — echte Kürzel wie «EG zum ZGB», «V zum KVG»,
 *    «kant. BBV» tragen genau eines.
 *
 * R5 ZU KURZ (< 2 Zeichen). Leer/Einzelzeichen ist kein zitierfähiges Kürzel.
 *
 * R6 KLAMMER (R8.2, GP-Befund F1/F2 31.8.2026 — 2 Einträge, Stand 31.8.2026).
 *    Ein Wert mit «(» oder «)» ist kein zitierfähiges Kürzel, sondern ein
 *    Titel mit Klammer-Zusatz — und die Klammer ist zugleich die offline
 *    entscheidbare Spur der PDF-Pipeline-Herkunft (handgepflegter Zitat-Name
 *    statt API-abbreviation, s. QUELLE oben): fail-closed raus. Trifft heute
 *    exakt SG-2808 und SZ-173.111; die belegten Aliase bleiben (Test).
 *
 * R7 KANTONSKÜRZEL (R8.2, GP-Befund F5 31.8.2026 — 1 Eintrag, Stand 31.8.2026).
 *    Ein Alias, der (case-insensitiv, geschlossene 26er-Liste) EXAKT einem
 *    Kantonskürzel entspricht, wird ausgeschlossen. Beleg: AR-955.21 trägt
 *    amtlich das Kürzel «TG» (Tourismusgesetz AR) — amtlich belegt, aber als
 *    SUCH-Alias irreführend: die Query «TG» meint die Kantonsabkürzung Thurgau,
 *    und die Edge-Einwort-Stufung (suche-kern.ts hauptSpalten) höbe die
 *    AR-Tourismus-Artikel auf Stufe 0. Der Erlass bleibt über seine Titelwörter
 *    auffindbar; nur der Kürzel-Boost entfällt.
 *
 * R6/R7 laufen bewusst NACH R2–R5: ihre Statistik zählt damit exakt die
 * Kandidaten, die sonst ALIAS GEWORDEN wären (prüfbare «trifft exakt N»-
 * Aussage im Test) — die Ausschlussmenge selbst ist von der Reihenfolge
 * unabhängig.
 *
 * KEINE KLAMMER-AKRONYM-EXTRAKTION (Gefahren-Klasse 1, «Bundes-Kürzel-Leck»).
 * Ein Klammer-Akronym am Ende eines titelartigen Werts bezeichnet oft das
 * REFERENZIERTE Bundesrecht, nicht den kantonalen Erlass: AR-760.12
 * «Einführungsverordnung zur schweizerischen Automobilkonzessionsverordnung
 * (AKV)» — «AKV» ist das Kürzel der Bundes-Verordnung; als Alias der kantonalen
 * EV wäre es ein stummer Ebenen-Leck («AKV» spränge auf AR statt auf den Bund).
 * Unterscheidbar von Fällen wie VD «Tarif des notaires (TNo)» ist das offline
 * nicht — darum wird GAR NICHT extrahiert (fail-closed, §7 «nie erfinden»);
 * der TNo-Verlust ist dokumentiert und klein gegen das Leck-Risiko.
 *
 * GEFAHREN-KLASSE 2 («Die Bürgschaft»). AR-222.31 trägt als kuerzel den vollen
 * Verordnungstitel «Verordnung zum Bundesgesetz … des Obligationenrechts
 * (Die Bürgschaft)» — ein Bundes-TITEL-Fragment als Klammer-Zusatz. R3 schliesst
 * den Wert aus; die unterlassene Klammer-Extraktion verhindert zusätzlich, dass
 * «Die Bürgschaft» je als kantonales Alias auftauchte (es ist der Titel des
 * XX. OR-Titels, Bundesrecht).
 *
 * EBENEN-TRENNUNG (Gefahren-Klasse 1, konstruktiv). Das Artefakt trägt
 * AUSSCHLIESSLICH Kanton-Einträge (`ebene === 'kanton'`); ein Bund-Key im
 * Artefakt ist ein Abbruchfehler, kein Datenfall. Kollisionen mit Bund-Kürzeln
 * («StG» kantonal in AI/BS/NW/OW/SG/TG vs. Bundes-StG Stempelabgaben) sind
 * LEGITIM — Kürzel ist Alias, nie Schlüssel; beide bleiben je in ihrer Ebene.
 * Der Lauf weist sie als Bund↔Kanton-Kollisionsreport aus (--report schreibt
 * bibliothek/register/kanton-abk-kollisionen-<datum>.md).
 *
 * Aufruf:
 *   npm run gen:kanton-abk-aliase                 schreibt das Artefakt
 *   npm run check:kanton-abk-aliase               Drift-Tor: Artefakt UND jüngster
 *                                                 Kollisionsreport byte-gleich zur
 *                                                 frischen Ableitung (schreibt nie)
 *   … gen … -- --report --datum=YYYY-MM-DD        zusätzlich Kollisionsreport
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vergleiche } from './vergleich';
import { aliasAusRoh, type AusschlussGrund } from './kanton-abk-regeln.ts';

// Regel-Kern und Konstanten leben seit R8.3 im reinen Modul kanton-abk-regeln.ts
// (seiteneffektfrei importierbar); hier re-exportiert für Bestands-Importe.
export { aliasAusRoh, MAX_LAENGE, KANTONSKUERZEL, type AusschlussGrund } from './kanton-abk-regeln.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUELLE = resolve(WURZEL, 'public/normtext/register.json');
const ZIEL = resolve(WURZEL, 'src/lib/normtext/kanton-abk-aliase.generated.ts');

export interface KantonAliasZeile {
  /** Amtlich belegtes Kürzel (verbatim aus dem abbreviation-Feld, ggf. R2-Tail). */
  abk: string;
  kanton: string;
  key: string;
}

interface RegisterErlass {
  key: string;
  ebene: string;
  kanton?: string | null;
  kuerzel: string;
  titel: string;
  /** ROHES amtliches Kürzel (Projektion des kanton-abk-roh-Sidecars); fehlt,
   *  wenn die Quelle keines führt oder es (noch) nicht belegt ist. */
  abkRoh?: string;
}

/** Register lesen — hart scheiternd, nie still leer (§6.7). */
function leseRegister(): RegisterErlass[] {
  if (!existsSync(QUELLE)) {
    console.error(`Quelle fehlt: ${QUELLE} — erst das Browse-Manifest generieren.`);
    process.exit(1);
  }
  const roh = JSON.parse(readFileSync(QUELLE, 'utf8')) as { erlasse?: RegisterErlass[] };
  if (!Array.isArray(roh.erlasse) || roh.erlasse.length === 0) {
    console.error(`Quelle ${QUELLE} trägt kein erlasse-Array — Abbruch statt leerem Artefakt (§6.7).`);
    process.exit(1);
  }
  return roh.erlasse;
}

/**
 * Ableitung über das ganze Register — deterministisch sortiert (abk, key).
 * Exportiert für Tests (Ebenen-Trennung, Statistik-Invarianten).
 */
export function baueAliase(erlasse: RegisterErlass[]): {
  zeilen: KantonAliasZeile[];
  ausgeschlossen: Map<AusschlussGrund, number>;
} {
  const zeilen: KantonAliasZeile[] = [];
  const ausgeschlossen = new Map<AusschlussGrund, number>();
  for (const e of erlasse) {
    if (e.ebene !== 'kanton') continue; // Ebenen-Trennung: NUR Kanton (s. Kopf)
    const kanton = (e.kanton ?? '').trim();
    if (!kanton) {
      // Ein Kanton-Eintrag ohne Kanton wäre eine stille Herkunfts-Lüge (§8).
      throw new Error(`Kanton-Eintrag ohne kanton-Feld: ${e.key}`);
    }
    const r = aliasAusRoh(e.abkRoh ?? '');
    if (r.abk === null) {
      ausgeschlossen.set(r.grund, (ausgeschlossen.get(r.grund) ?? 0) + 1);
      continue;
    }
    zeilen.push({ abk: r.abk, kanton, key: e.key });
  }
  zeilen.sort((a, b) => vergleiche(a.abk, b.abk) || vergleiche(a.key, b.key));
  return { zeilen, ausgeschlossen };
}

/** Präfix jeder Datenzeile — der --check-Parser hängt exakt daran (§6.7). */
export const DATENZEILE_PRAEFIX = '  { abk: ';

function artefakt(zeilen: KantonAliasZeile[], ausgeschlossen: Map<AusschlussGrund, number>): string {
  const kantone = new Set(zeilen.map((z) => z.kanton));
  const statistik = [...ausgeschlossen.entries()]
    .sort((a, b) => vergleiche(a[0], b[0]))
    .map(([g, n]) => `${g} ${n}`)
    .join(' · ');
  const kopf = `// AUTO-GENERIERT von scripts/normtext/kanton-abk-aliase-generieren.ts — NICHT von Hand editieren.
// Amtlich belegte Kürzel der Kanton-Erlasse (abbreviation-Feld der kantonalen
// Erlasssammlungs-APIs, roh im Sidecar kanton-abk-roh.json, projiziert als
// abkRoh über public/normtext/register.json — R8.3 Wurzel-Fix F8).
// Ausschluss-Regeln R2–R7 + Klammer-Verzicht: Kopf des Generators (§7, nie erfinden).
// ${zeilen.length} Aliase über ${kantone.size} Kantone · ausgeschlossen: ${statistik || 'keine'}.
// Kürzel ist ALIAS, nie Schlüssel: dasselbe abk darf auf mehrere Erlasse zeigen
// (kantonsübergreifend wie innerhalb eines Kantons); Bund↔Kanton-Kollisionen sind
// legitim und im Report bibliothek/register/kanton-abk-kollisionen-*.md dokumentiert.
// Regenerieren: npm run gen:kanton-abk-aliase · Drift: npm run check:kanton-abk-aliase
// NICHT aus src/ importieren (Bundle §15) — Build-Zeit-Quelle für such-index-generieren.ts
// (Feld kz) und scripts/datenhaltung/fts.ts (FTS-Spalte kuerzel).

export const KANTON_ABK_ALIASE: ReadonlyArray<{ abk: string; kanton: string; key: string }> = [
`;
  const leib = zeilen
    .map((z) => `${DATENZEILE_PRAEFIX}${JSON.stringify(z.abk)}, kanton: ${JSON.stringify(z.kanton)}, key: ${JSON.stringify(z.key)} },`)
    .join('\n');
  return `${kopf}${leib}\n];\n`;
}

// ── Kollisionsreport Bund↔Kanton (Gefahren-Klasse 1, dokumentierend) ─────────

/** Normalisierung wie src/lib/suche/normQuery.ts norm(): A–Z0–9, Diakritika weg. */
function normKuerzel(s: string): string {
  return s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '');
}

export function bundKollisionen(
  zeilen: KantonAliasZeile[],
  bundKuerzel: ReadonlyMap<string, string[]>,
): Array<{ abk: string; bund: string[]; kantonKeys: string[] }> {
  const jeAbk = new Map<string, KantonAliasZeile[]>();
  for (const z of zeilen) {
    const n = normKuerzel(z.abk);
    jeAbk.set(n, [...(jeAbk.get(n) ?? []), z]);
  }
  const raus: Array<{ abk: string; bund: string[]; kantonKeys: string[] }> = [];
  for (const [n, kz] of jeAbk) {
    const bund = bundKuerzel.get(n);
    if (!bund) continue;
    raus.push({
      abk: kz[0].abk,
      bund: [...new Set(bund)].sort(vergleiche),
      kantonKeys: kz.map((z) => z.key).sort(vergleiche),
    });
  }
  return raus.sort((a, b) => vergleiche(a.abk, b.abk));
}

/** Bund-Kürzelraum: Register-Kürzel + Routen-Keys + amtliche DE/FR/IT-Aliase. */
async function bundKuerzelRaum(erlasse: RegisterErlass[]): Promise<Map<string, string[]>> {
  const raum = new Map<string, string[]>();
  const merke = (roh: string, label: string): void => {
    const n = normKuerzel(roh);
    if (!n) return;
    raum.set(n, [...(raum.get(n) ?? []), label]);
  };
  for (const e of erlasse) {
    if (e.ebene !== 'bund') continue;
    merke(e.kuerzel, `${e.kuerzel} (${e.key})`);
    merke(e.key, `${e.kuerzel} (${e.key})`);
  }
  const { ABK_ALIASE } = await import('../../src/lib/normtext/abk-aliase.generated');
  for (const a of ABK_ALIASE) merke(a.abk, `${a.abk} (SR ${a.sr}, ${a.sprache})`);
  return raum;
}

const REPORT_DIR = 'bibliothek/register';
const REPORT_RE = /^kanton-abk-kollisionen-(\d{4}-\d{2}-\d{2})\.md$/;

/** Der Report-INHALT — EINE Quelle für gen --report UND das --check-Tor (§5/§6.7):
 *  ein von Hand editierter oder veralteter Report läuft im Drift-Tor rot auf,
 *  statt unbewacht zu driften (GP-Befund F6, 31.8.2026). */
export function reportInhalt(
  datum: string,
  zeilen: KantonAliasZeile[],
  kollisionen: Array<{ abk: string; bund: string[]; kantonKeys: string[] }>,
): string {
  const mehrfach = new Map<string, KantonAliasZeile[]>();
  for (const z of zeilen) mehrfach.set(z.abk, [...(mehrfach.get(z.abk) ?? []), z]);
  const kollintern = [...mehrfach.entries()].filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length || vergleiche(a[0], b[0]));
  const md = `# Kanton-Kürzel-Aliase — Kollisionsreport (Stand ${datum})

Generiert von \`scripts/normtext/kanton-abk-aliase-generieren.ts --report\` —
nicht von Hand editieren, bei Neuerzeugung ersetzt der Lauf diese Datei.

**Grundsatz:** Ein Kürzel ist ALIAS, nie Schlüssel. Kollisionen sind legitim und
werden hier dokumentiert, nicht aufgelöst — jede Ebene behält ihre Treffer
(Ebenen-Trennung: das Artefakt trägt nur Kanton-Keys; Bund-Kürzel bleiben im
Bund-Weg, s. Generator-Kopf «Gefahren-Klasse 1»).

## Bund↔Kanton (${kollisionen.length} Kürzel)

| Kürzel (kantonal) | Bund-Seite | Kanton-Erlasse |
|---|---|---|
${kollisionen.map((k) => `| ${k.abk} | ${k.bund.join(' · ')} | ${k.kantonKeys.join(' · ')} |`).join('\n')}

## Kanton↔Kanton (${kollintern.length} Kürzel mehrfach vergeben)

| Kürzel | Erlasse |
|---|---|
${kollintern.map(([abk, v]) => `| ${abk} | ${v.map((z) => z.key).join(' · ')} |`).join('\n')}
`;
  return md;
}

function schreibeReport(
  datum: string,
  zeilen: KantonAliasZeile[],
  kollisionen: Array<{ abk: string; bund: string[]; kantonKeys: string[] }>,
): string {
  const pfad = resolve(WURZEL, `${REPORT_DIR}/kanton-abk-kollisionen-${datum}.md`);
  writeFileSync(pfad, reportInhalt(datum, zeilen, kollisionen), 'utf8');
  return pfad;
}

/** F6-Tor: der JÜNGSTE committete Report muss byte-gleich der frischen Ableitung
 *  sein (Datum aus dem Dateinamen — Belege altern nicht, sie werden ersetzt oder
 *  laufen rot). Fehlt jeder Report, ist das Artefakt unbelegt dokumentiert → rot. */
async function pruefeReportDrift(zeilen: KantonAliasZeile[], erlasse: RegisterErlass[]): Promise<void> {
  const dateien = readdirSync(resolve(WURZEL, REPORT_DIR))
    .filter((n) => REPORT_RE.test(n))
    .sort();
  if (dateien.length === 0) {
    console.error(
      `check:kanton-abk-aliase: KEIN Kollisionsreport unter ${REPORT_DIR}/kanton-abk-kollisionen-*.md — `
      + '`npm run gen:kanton-abk-aliase -- --report --datum=YYYY-MM-DD` fahren (§6.7: unbewachte Doku zählt nicht).',
    );
    process.exit(1);
  }
  const juengste = dateien[dateien.length - 1];
  const datum = REPORT_RE.exec(juengste)![1];
  const pfad = resolve(WURZEL, REPORT_DIR, juengste);
  const soll = reportInhalt(datum, zeilen, bundKollisionen(zeilen, await bundKuerzelRaum(erlasse)));
  if (readFileSync(pfad, 'utf8') !== soll) {
    console.error(
      `check:kanton-abk-aliase: Kollisionsreport ${juengste} DRIFTET gegenüber der frischen Ableitung `
      + '(von Hand editiert oder veraltet) — `npm run gen:kanton-abk-aliase -- --report --datum='
      + `${datum}\` ausführen und den Diff bewusst abnehmen.`,
    );
    process.exit(1);
  }
  console.log(`check:kanton-abk-aliase: Kollisionsreport ${juengste} synchron (generierte Quelle, F6-Tor).`);
}

// ── Drift-Tor (--check): Artefakt gegen frische Ableitung, byte-genau ────────

function pruefeDrift(neu: string): void {
  if (!existsSync(ZIEL)) {
    console.error(`PRÜFUNG UNMÖGLICH: ${ZIEL} fehlt — erst \`npm run gen:kanton-abk-aliase\` fahren.`);
    process.exit(1);
  }
  const alt = readFileSync(ZIEL, 'utf8');
  if (alt !== neu) {
    console.error(
      'check:kanton-abk-aliase: Artefakt VERALTET gegenüber public/normtext/register.json '
      + '(oder von Hand editiert) — `npm run gen:kanton-abk-aliase` ausführen und Diff bewusst abnehmen.',
    );
    process.exit(1);
  }
  const n = (alt.match(/^ {2}\{ abk: /gm) ?? []).length;
  if (n === 0) {
    console.error(`check:kanton-abk-aliase: Artefakt ohne eine einzige Datenzeile — kaputt (§6.7).`);
    process.exit(1);
  }
  console.log(`check:kanton-abk-aliase: Artefakt synchron mit dem Register (${n} Aliase).`);
}

export async function main(): Promise<void> {
  const nurPruefen = process.argv.includes('--check');
  const mitReport = process.argv.includes('--report');
  const erlasse = leseRegister();
  const { zeilen, ausgeschlossen } = baueAliase(erlasse);

  // Ebenen-Riegel (§6.7-fähig: der Test zwingt ihn einmal rot): kein Bund-Key.
  const bundKeys = new Set(erlasse.filter((e) => e.ebene === 'bund').map((e) => e.key));
  const leck = zeilen.filter((z) => bundKeys.has(z.key));
  if (leck.length > 0) {
    console.error(`EBENEN-LECK: ${leck.length} Bund-Key(s) im Kanton-Artefakt (${leck[0].key}) — Abbruch.`);
    process.exit(1);
  }
  if (zeilen.length === 0) {
    console.error('0 Aliase abgeleitet — das ist bei 1231 Kanton-Erlassen ein Quell-Defekt, kein Ergebnis (§6.7).');
    process.exit(1);
  }

  const inhalt = artefakt(zeilen, ausgeschlossen);
  if (nurPruefen) {
    pruefeDrift(inhalt);
    await pruefeReportDrift(zeilen, erlasse); // F6-Tor: Report ist Teil des Artefakts
    process.exit(0);
  }

  writeFileSync(ZIEL, inhalt, 'utf8');
  const stat = [...ausgeschlossen.entries()].map(([g, n]) => `${g} ${n}`).join(' · ');
  console.log(`gen:kanton-abk-aliase: ${zeilen.length} Aliase → ${ZIEL}`);
  console.log(`  ausgeschlossen: ${stat || 'keine'}`);

  if (mitReport) {
    const datumArg = process.argv.find((a) => a.startsWith('--datum='));
    if (!datumArg) {
      console.error('--report braucht --datum=YYYY-MM-DD (§2: reproduzierbarer Stand).');
      process.exit(1);
    }
    const datum = datumArg.slice('--datum='.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
      console.error('--datum=YYYY-MM-DD ist fehlerhaft.');
      process.exit(1);
    }
    const kollisionen = bundKollisionen(zeilen, await bundKuerzelRaum(erlasse));
    const pfad = schreibeReport(datum, zeilen, kollisionen);
    console.log(`  Kollisionsreport (${kollisionen.length} Bund↔Kanton): ${pfad}`);
  }
}

if (!process.env.VITEST) await main();
