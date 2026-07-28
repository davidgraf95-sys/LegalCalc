// ─── Generator: amtliche DE/FR/IT-Kurzbezeichnungen je SR-Nummer (Fedlex) ─────
//
// Baustein b von W2·6-NKEY. Die Rechtsprechung zitiert Bundeserlasse in DREI
// Amtssprachen («art. 89 LTF» = «Art. 89 BGG», «art. 41 CO» = «Art. 41 OR»).
// Damit die Verzahnung Entscheid↔Norm auch im FR/IT-Korpus greift, braucht das
// Mapping die AMTLICHEN Sprach-Kürzel — und zwar aus der amtlichen Quelle, nicht
// von Hand geraten (§7): Fedlex führt sie als `jolux:titleShort` je Expression
// (Sprache) der `ConsolidationAbstract` einer SR-Nummer.
//
// Erzeugt `fedlex-abk.generated.ts` (reine Daten: SR → {de, fr, it} verbatim).
// Die Zuordnung SR → Register-key macht der KONSUMENT (entscheide-mapping.ts) —
// so bleibt das Artefakt eine treue Abschrift der Amtsquelle und die Ableitung
// an EINER Stelle (§5).
//
// ── Fallen, die hier bewusst adressiert sind (Skill scraping-swiss-official-sources) ──
//  (1) Die Fedlex-ELI-Seite ist eine JS-SPA — alles läuft über SPARQL, nie über
//      curl auf die Erlass-Seite.
//  (2) `skos:notation` ist ein TYPISIERTES Literal → `FILTER(STR(?n) = …)`, sonst
//      null Zeilen.
//  (3) Eine SR-Nummer kann MEHRERE ConsolidationAbstracts tragen — die aufgehobene
//      Vorgänger-Ordnung behält ihre Nummer. SR 173.110 liefert ohne Filter sowohl
//      «OG» (Bundesrechtspflegegesetz, aufgehoben 2007) als auch «BGG». Darum
//      `dateNoLongerInForce <= heute` ausschliessen (Applicability-Fenster). Bleiben
//      danach ZWEI verschiedene deutsche Kürzel für eine SR, ist die Nummer
//      mehrdeutig → sie wird NICHT ausgeliefert (§1 lieber Lücke als Fehlzuordnung).
//  (4) SPARQL-Resultate können still partiell sein → COUNT-Gate: eine zweite
//      Abfrage zählt dieselbe Musterlage; Zeilenzahl ≠ Count ⇒ Abbruch. Zusätzlich
//      wird jede angefragte SR-Nummer ohne Treffer explizit ausgewiesen.
//  (5) VALUES-Batching statt UNION (die bekannte «nur ~700 statt alle»-Falle).
//
//   npm run gen:fedlex-abk                  → Artefakt schreiben
//   npm run check:fedlex-abk-netz           → Drift gegen die Amtsquelle prüfen
//
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sparqlBatch, sparqlSelect, FEDLEX_SPARQL } from '../fedlex-sparql';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register';

const ROOT = process.cwd();
const ZIEL = join(ROOT, 'scripts', 'normtext', 'fedlex-abk.generated.ts');

const args = process.argv.slice(2);
const nurPruefen = args.includes('--check');
const datumArg = args.find((a) => a.startsWith('--datum='))?.split('=')[1] ?? null;
const heute = datumArg ?? new Date().toISOString().slice(0, 10);

const LANG = {
  de: 'http://publications.europa.eu/resource/authority/language/DEU',
  fr: 'http://publications.europa.eu/resource/authority/language/FRA',
  it: 'http://publications.europa.eu/resource/authority/language/ITA',
} as const;
type Sprachkuerzel = keyof typeof LANG;
const LANG_ZU_KUERZEL = new Map<string, Sprachkuerzel>(
  (Object.entries(LANG) as Array<[Sprachkuerzel, string]>).map(([k, uri]) => [uri, k]),
);

/** Musterlage der Abfrage — EINE Quelle für Daten- und COUNT-Abfrage (§5). */
function wo(valuesInline: string): string {
  return `
  VALUES ?nn { ${valuesInline} }
  ?abstract a jolux:ConsolidationAbstract ; jolux:classifiedByTaxonomyEntry ?tax .
  ?tax skos:notation ?n . FILTER(STR(?n) = ?nn)
  FILTER NOT EXISTS { ?abstract jolux:dateNoLongerInForce ?dnl . FILTER(?dnl <= "${heute}"^^xsd:date) }
  ?abstract jolux:isRealizedBy ?expr . ?expr jolux:language ?lang ; jolux:titleShort ?short .
  FILTER(?lang IN (<${LANG.de}>, <${LANG.fr}>, <${LANG.it}>))`;
}
const PREFIXE = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;

function datenQuery(valuesInline: string): string {
  return `${PREFIXE}
SELECT DISTINCT ?nn ?lang ?short WHERE {${wo(valuesInline)}
} ORDER BY ?nn ?lang ?short`;
}
function countQuery(valuesInline: string): string {
  return `${PREFIXE}
SELECT (COUNT(*) AS ?c) WHERE { SELECT DISTINCT ?nn ?lang ?short WHERE {${wo(valuesInline)}
} }`;
}

export interface AbkZeile { sr: string; de: string | null; fr: string | null; it: string | null }

const BATCH = 40;

async function hole(srListe: string[]): Promise<{ zeilen: AbkZeile[]; mehrdeutig: string[]; ohneTreffer: string[] }> {
  const werte = srListe.map((s) => JSON.stringify(s));
  const bindings = await sparqlBatch(werte, datenQuery, { batchGroesse: BATCH });

  // (4) COUNT-Gate: dieselbe Musterlage unabhängig gezählt. Ein still gekapptes
  // Resultat fällt hier auf, statt als «vollständig» durchzugehen.
  let sollSumme = 0;
  for (let i = 0; i < werte.length; i += BATCH) {
    const teil = werte.slice(i, i + BATCH);
    const b = await sparqlSelect(countQuery(teil.join(' ')));
    sollSumme += Number(b[0]?.c?.value ?? '0');
  }
  if (bindings.length !== sollSumme) {
    throw new Error(
      `COUNT-Gate ROT: ${bindings.length} Zeilen geliefert, ${sollSumme} gezählt — `
      + 'SPARQL-Resultat still partiell (§7, Abbruch statt Teilmenge).',
    );
  }

  // SR → Sprache → Menge der Kürzel (Mehrfach = mehrdeutig, siehe Falle (3)).
  const proSr = new Map<string, Map<Sprachkuerzel, Set<string>>>();
  for (const b of bindings) {
    const sr = b.nn?.value;
    const lang = LANG_ZU_KUERZEL.get(b.lang?.value ?? '');
    const short = (b.short?.value ?? '').trim();
    if (!sr || !lang || !short) continue;
    const proLang = proSr.get(sr) ?? (proSr.set(sr, new Map()), proSr.get(sr)!);
    (proLang.get(lang) ?? (proLang.set(lang, new Set()), proLang.get(lang)!)).add(short);
  }

  const zeilen: AbkZeile[] = [];
  const mehrdeutig: string[] = [];
  for (const sr of srListe) {
    const proLang = proSr.get(sr);
    if (!proLang) continue;
    const uneindeutig = [...proLang.entries()].filter(([, s]) => s.size > 1);
    if (uneindeutig.length) {
      mehrdeutig.push(`${sr}: ${uneindeutig.map(([l, s]) => `${l}={${[...s].sort().join('|')}}`).join(' ')}`);
      continue;   // §1: lieber keine Zuordnung als eine falsche
    }
    const eins = (l: Sprachkuerzel): string | null => {
      const s = proLang.get(l);
      return s && s.size === 1 ? [...s][0] : null;
    };
    zeilen.push({ sr, de: eins('de'), fr: eins('fr'), it: eins('it') });
  }
  const ohneTreffer = srListe.filter((sr) => !proSr.has(sr));
  return { zeilen, mehrdeutig, ohneTreffer };
}

function esc(s: string | null): string {
  return s === null ? 'null' : JSON.stringify(s);
}

function rendere(zeilen: AbkZeile[], stand: string): string {
  const kopf = [
    '// AUTO-GENERIERT von scripts/normtext/fedlex-abk-generieren.ts — NICHT von Hand editieren.',
    '//',
    '// Amtliche Kurzbezeichnungen (`jolux:titleShort`) je SR-Nummer und Amtssprache,',
    '// verbatim aus den Fedlex-Metadaten (§7: Quelle + Abruf-Stand, kein Hand-Erraten).',
    `// Quelle : ${FEDLEX_SPARQL} (SPARQL, jolux-Ontologie)`,
    `// Stand  : ${stand} (Abrufdatum; Applicability-Fenster: aufgehobene Erlasse mit`,
    '//          dateNoLongerInForce <= Abrufdatum sind ausgeschlossen)',
    '// Live   : https://www.fedlex.admin.ch/de/cc/internal-law/<SR-Zweig> (geltende Fassung)',
    '// Regen  : npm run gen:fedlex-abk   ·   Drift-Tor: npm run check:fedlex-abk-netz',
    '//',
    '// Reine Daten (§3): die Zuordnung SR → Register-key macht scripts/normtext/',
    '// entscheide-mapping.ts. `null` = Fedlex führt für diese Sprache kein Kürzel.',
    '',
    'export interface FedlexAbk {',
    '  /** SR-Nummer (Systematische Rechtssammlung), z.B. "173.110". */',
    '  sr: string;',
    '  /** Amtliches deutsches Kürzel, verbatim («BVV 2», «GebV SchKG»). */',
    '  de: string | null;',
    '  /** Amtliches französisches Kürzel, verbatim («LTF», «Cst.»). */',
    '  fr: string | null;',
    '  /** Amtliches italienisches Kürzel, verbatim («LTF», «Cost.»). */',
    '  it: string | null;',
    '}',
    '',
    `export const FEDLEX_ABK_STAND = ${JSON.stringify(stand)};`,
    '',
    'export const FEDLEX_ABK: readonly FedlexAbk[] = [',
  ];
  const leib = zeilen.map((z) => `  { sr: ${esc(z.sr)}, de: ${esc(z.de)}, fr: ${esc(z.fr)}, it: ${esc(z.it)} },`);
  return [...kopf, ...leib, '];', ''].join('\n');
}

async function main(): Promise<void> {
  // SR-Nummern aus dem Register (SSoT §5) — sortiert, dedupliziert, deterministisch.
  const srListe = [...new Set(
    ERLASS_REGISTER.filter((e) => e.ebene === 'bund' && e.sr).map((e) => e.sr as string),
  )].sort();
  const ohneSr = ERLASS_REGISTER.filter((e) => e.ebene === 'bund' && !e.sr).map((e) => e.key);

  console.log(`[fedlex-abk] ${srListe.length} SR-Nummern aus dem Register (ohne SR: ${ohneSr.length}${ohneSr.length ? ` — ${ohneSr.join(', ')}` : ''})`);
  const { zeilen, mehrdeutig, ohneTreffer } = await hole(srListe);
  console.log(`[fedlex-abk] ${zeilen.length} SR mit amtlichem Kürzel · ${mehrdeutig.length} mehrdeutig (verworfen) · ${ohneTreffer.length} ohne Treffer`);
  for (const m of mehrdeutig) console.log(`             MEHRDEUTIG ${m}`);
  if (ohneTreffer.length) console.log(`             OHNE TREFFER: ${ohneTreffer.join(', ')}`);

  // §7-Kontrollblick: weicht das amtliche deutsche Kürzel vom Register-Kürzel ab,
  // ist entweder das Register veraltet oder die SR falsch gepinnt → ausweisen
  // (kein Abbruch: der Register-Kürzel ist die deklarierte Anzeigeform, Entscheid David).
  const regProSr = new Map<string, string[]>();
  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    (regProSr.get(e.sr) ?? (regProSr.set(e.sr, []), regProSr.get(e.sr)!)).push(e.kuerzel);
  }
  const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g, '');
  const divergenzen: string[] = [];
  for (const z of zeilen) {
    if (!z.de) continue;
    const reg = regProSr.get(z.sr) ?? [];
    if (reg.length && !reg.some((k) => norm(k) === norm(z.de!))) {
      divergenzen.push(`${z.sr}: Register '${reg.join('/')}' ≠ Fedlex '${z.de}'`);
    }
  }
  console.log(`[fedlex-abk] DE-Divergenzen Register↔Fedlex: ${divergenzen.length}`);
  for (const d of divergenzen) console.log(`             ${d}`);

  const neu = rendere(zeilen, heute);
  if (nurPruefen) {
    const alt = readFileSync(ZIEL, 'utf8');
    // Der Abruf-Stand im Kopf ändert sich naturgemäss bei jedem Lauf — verglichen
    // wird der DATENTEIL (alles ab der Artefakt-Zeile), nicht das Abrufdatum.
    const daten = (s: string) => s.slice(s.indexOf('export const FEDLEX_ABK:'));
    if (daten(alt) !== daten(neu)) {
      console.error('[fedlex-abk] ROT — Amtsquelle weicht vom committeten Artefakt ab. `npm run gen:fedlex-abk` fahren und den Diff bewusst abnehmen.');
      process.exit(1);
    }
    console.log('[fedlex-abk] OK — Artefakt deckungsgleich mit der Amtsquelle.');
    return;
  }
  writeFileSync(ZIEL, neu, 'utf8');
  console.log(`[fedlex-abk] geschrieben: ${ZIEL}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
