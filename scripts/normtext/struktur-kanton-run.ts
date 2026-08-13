/**
 * Runner: kantonale Struktur-Sidecars (Gliederung + Marginalien + Erlass-Kopf/
 * Ingress + Fussnoten) aus LexWork. Holt je LexWork-Kantonserlass das xhtml_tol
 * über die JSON-API und extrahiert Gliederung, Sachüberschriften, den Ingress
 * (mit verlinkten Rechtsgrundlagen) und die amtlichen Fussnoten. Nicht-LexWork-
 * Quellen (PDF/lexfind/zhlex) werden übersprungen (Reader fällt dort auf flache
 * Darstellung zurück).
 *
 * §2: --datum aus der Shell. Reine Präsentations-Anreicherung (§3) — Snapshots
 * unberührt. Ausgabe-Schema deckungsgleich mit dem Bund-Sidecar (struktur-run.ts).
 * Aufruf: npm run normtext:struktur-kanton -- --datum=$(date +%F)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import {
  extrahiereLexWorkSidecar,
  type LexArtikelStruktur,
  type LexErlassKopf,
  type LexFussnote,
} from './struktur-lexwork.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';
import { identitaetAusErlass } from './browse-manifest.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('struktur-kanton-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const KANTON_DIR = 'public/normtext/kanton';
const ZIEL = 'public/normtext/struktur/kanton';
mkdirSync(ZIEL, { recursive: true });

const LEXWORK = /\/app\/(de|fr|it)\/texts_of_law\//;

/**
 * W2·19B — zweite LexWork-Adressform. Ein Teil des Kantonsbestands wurde über den
 * PDF-Pfad der clex/LexWork-Familie aufgenommen; diese Snapshots tragen als
 * `quelleUrl` NICHT die `/app/…/texts_of_law/<sn>`-Leseadresse, sondern den
 * Datei-Endpunkt `…/api/<lang>/versions/<versionId>/pdf_file[_with_annexes]`.
 * Aus dieser Form allein lässt sich die Struktur-API nicht adressieren (der
 * Pfad führt die VERSIONS-Id, nicht die Systematiknummer = LexWork-`lawId`).
 *
 * Empirischer Befund 13.8.2026: Vier dieser Erlasse (LU-3870/SRL 258,
 * GR-3348/BR 210.370, FR-8428/RSF 261.16, VS-1413/178.104) liefern unter
 * `/api/<lang>/texts_of_law/<sn>` sehr wohl ein `xhtml_tol` — das PDF war also
 * nie die einzige verfügbare Struktur (Quell-Wahl-Regel: höchste verfügbare
 * Struktur). Die übrigen führen `structured_document_id: null` und sind
 * amtlich wirklich PDF-only; sie werden hier ehrlich übersprungen (§8), NICHT
 * mit einer erfundenen Gliederung gefüllt.
 */
const LEXWORK_PDF = /^https:\/\/[^/]+\/api\/(de|fr|it)\/versions\/(\d+)\/pdf_file/;

// Optionaler Kanton-Filter (z.B. --kanton=BS), um die Sidecars gezielt für einen
// Kanton (re-)zu erzeugen statt alle ~1200 Dateien neu zu fetchen.
const kantonArg = process.argv.find((a) => a.startsWith('--kanton='));
const nurKantone = kantonArg
  ? new Set(kantonArg.slice('--kanton='.length).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))
  : null;

/**
 * Erlass-genauer Filter (`--nur=LU-3870,GR-3348`). Schärfer als `--kanton=`, und
 * aus einem inhaltlichen Grund nötig: JEDE geschriebene Datei trägt das
 * `erzeugt`-Datum, ein Breitband-Lauf schriebe also auch dort ein neues Datum
 * hinein, wo sich am Inhalt nichts geändert hat. Diese reine Datums-Churn
 * verdeckt im Diff die echten Änderungen und macht das Manifest unruhig
 * (Ingest-Regel «content-hash change gate — reine Datums-Churn zurücksetzen»).
 */
const nurArg = process.argv.find((a) => a.startsWith('--nur='));
const nurKeys = nurArg
  ? new Set(nurArg.slice('--nur='.length).split(',').map((s) => s.trim()).filter(Boolean))
  : null;

// ── Verweis-Auflösung: amtlicher Link → interner Reader-Verweis, wo gehalten ──
// Kantonal: die von uns gehaltenen Snapshot-Keys (Dateinamen). Bund: SR → Key aus
// dem Register (nur im Volltext/PDF gehaltene Erlasse). Fehlt der Erlass, bleibt
// der amtliche Link der ehrliche Fallback (§8, David-Vorgabe A42).
const gehalteneKanton = new Set(
  readdirSync(KANTON_DIR).filter((x) => x.endsWith('.json') && x !== 'index.json').map((x) => x.replace(/\.json$/, '')),
);
const srZuKey = new Map<string, string>();
for (const r of ERLASS_REGISTER) {
  if (r.ebene === 'bund' && r.sr && (r.status === 'snapshot' || r.status === 'pdf-embed')) srZuKey.set(r.sr, r.key);
}

/** Host eines API-/Link-URLs (ohne Port). */
function host(url: string): string {
  return url.match(/^https?:\/\/([^/]+)/i)?.[1]?.toLowerCase() ?? '';
}

/** Löst einen amtlichen Verweis-URL auf einen internen Reader-Key auf — nur bei
 *  exakter Übereinstimmung (kantonal: gleicher Amts-Host wie der Erlass + gehaltene
 *  Systematiknummer; Bund: db.clex.ch/link/Bund/<SR> im Register). Sonst undefined. */
function loeseIntern(
  url: string,
  kanton: string,
  erlassHost: string,
): LexFussnote['links'][number]['intern'] {
  // Bund-Verweis über den clex-Linkdienst: db.clex.ch/link/Bund/<SR>/<lang>.
  const mBund = url.match(/db\.clex\.ch\/link\/Bund\/([0-9][0-9.]*)\/(?:de|fr|it)\b/i);
  if (mBund) { const key = srZuKey.get(mBund[1]); return key ? { ebene: 'bund', key } : undefined; }
  // Kantonaler Verweis auf demselben Amtsportal: <host>/data/<nr>/<lang>. Nur wenn
  // der Link-Host dem Erlass-Host entspricht (kein Kanton-übergreifendes Raten).
  const mData = url.match(/\/data\/([0-9][0-9.]*)\/(?:de|fr|it)\b/i);
  if (mData && host(url) === erlassHost) {
    const key = `${kanton}-${mData[1]}`;
    return gehalteneKanton.has(key) ? { ebene: 'kanton', key } : undefined;
  }
  return undefined;
}

/** Reichert alle Fussnoten-Links einer Liste in-place mit `intern` an. */
function verlinkeIntern(
  fussnoten: LexFussnote[] | undefined,
  kanton: string,
  erlassHost: string,
): void {
  for (const fn of fussnoten ?? []) {
    for (const l of fn.links) {
      const intern = loeseIntern(l.url, kanton, erlassHost);
      if (intern) l.intern = intern;
    }
  }
}

interface Aufgabe {
  key: string;
  kanton: string;
  api: string;
  tokens: Set<string>;
  /**
   * Nur bei der PDF-Adressform gesetzt: die Versions-Id aus der `quelleUrl`. Sie
   * ist das FASSUNGS-TOR — die Struktur-API antwortet immer mit der AKTUELLEN
   * Fassung, der Snapshot hängt aber an genau dieser Version. Stimmen beide nicht
   * überein, beschriebe das Sidecar eine andere Fassung als der Text, den es
   * gliedert (§5-Doppelwahrheit). Dann wird übersprungen, nicht geschrieben.
   */
  erwarteteVersion?: number;
}

/** Systematiknummer (LexWork-`lawId`) aus dem Snapshot-`erlass`-Feld: dort steht
 *  sie als Klammerzusatz ('Verordnung … (SRL 258)'). `identitaetAusErlass` ist
 *  dieselbe Zerlegung, aus der auch `register.json` seinen `sr` speist (§5 — eine
 *  Quelle, nicht zwei). Der Amts-Präfix ('SRL', 'BR', 'bGS', 'RSF') wird
 *  abgestreift; übrig bleibt die reine Nummer, die LexWork adressiert. Lässt sich
 *  keine plausible Nummer lesen, gibt die Funktion null — dann wird der Erlass
 *  übersprungen statt geraten (§7). */
export function lawIdAusErlass(erlass: string): string | null {
  const sr = identitaetAusErlass(erlass).sr;
  if (!sr) return null;
  const m = sr.trim().match(/^(?:[A-Za-zÀ-ÿ.]+\s+)?(\d[\d.]*)$/);
  return m ? m[1] : null;
}

const aufgaben: Aufgabe[] = [];
let nichtLexwork = 0;
let ohneLawId = 0;
for (const f of readdirSync(KANTON_DIR).filter((x) => x.endsWith('.json') && x !== 'index.json')) {
  const kanton = f.split('-')[0]?.toUpperCase() ?? '';
  if (nurKantone && !nurKantone.has(kanton)) continue;
  if (nurKeys && !nurKeys.has(f.replace(/\.json$/, ''))) continue;
  const datei = JSON.parse(readFileSync(join(KANTON_DIR, f), 'utf8')) as NormSnapshotDatei;
  const erstes = datei.eintraege?.[0];
  const url = erstes?.quelleUrl ?? '';
  const key = f.replace(/\.json$/, '');
  const tokens = new Set(datei.eintraege.map((e) => e.artikel));
  const mPdf = url.match(LEXWORK_PDF);
  if (LEXWORK.test(url)) {
    aufgaben.push({ key, kanton, api: url.replace('/app/', '/api/').replace(/#.*$/, ''), tokens });
  } else if (mPdf) {
    const lawId = lawIdAusErlass(erstes?.erlass ?? '');
    if (!lawId) { ohneLawId++; console.log(`  ohne lawId (übersprungen): ${key}`); continue; }
    const basis = url.slice(0, url.indexOf('/api/'));
    aufgaben.push({
      key, kanton,
      api: `${basis}/api/${mPdf[1]}/texts_of_law/${lawId}`,
      tokens,
      erwarteteVersion: Number(mPdf[2]),
    });
  } else {
    nichtLexwork++;
  }
}

async function hole(a: Aufgabe): Promise<'ok' | 'leer' | 'fehler' | 'fassung'> {
  try {
    const res = await fetch(a.api, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) return 'fehler';
    // Soft-404-Sonde (§7, scraping-Skill Fakt 3): die LexWork-Portale antworten
    // auf einen unbekannten Pfad mit HTTP 200 + Angular-Shell. Der Status allein
    // ist also kein Erfolgsbeweis — der Content-Type entscheidet.
    if (!/application\/json/i.test(res.headers.get('content-type') ?? '')) return 'fehler';
    const json = await res.json() as {
      text_of_law?: { selected_version?: { id?: number; xhtml_tol?: string | null } };
    };
    const sel = json.text_of_law?.selected_version;
    // Fassungs-Tor (siehe `erwarteteVersion`): lieber kein Sidecar als eines,
    // das eine andere Fassung gliedert als der Snapshot führt.
    if (a.erwarteteVersion !== undefined && sel?.id !== a.erwarteteVersion) return 'fassung';
    const xhtml = sel?.xhtml_tol;
    if (!xhtml) return 'leer';
    const { kopf, artikel } = extrahiereLexWorkSidecar(xhtml);
    const erlassHost = host(a.api);
    // Nur Tokens behalten, die der Snapshot auch führt (Konsistenz-Tor).
    const gefiltert: Record<string, LexArtikelStruktur> = {};
    for (const tok of Object.keys(artikel).sort()) {
      if (!a.tokens.has(tok)) continue;
      const st = artikel[tok];
      verlinkeIntern(st.fussnoten, a.kanton, erlassHost);
      gefiltert[tok] = st;
    }
    if (Object.keys(gefiltert).length === 0) return 'leer';
    // Kopf-Fussnoten (Ingress-Rechtsgrundlagen) ebenfalls intern auflösen.
    const kopfBereinigt: LexErlassKopf | null = kopf;
    if (kopfBereinigt) verlinkeIntern(kopfBereinigt.fussnoten, a.kanton, erlassHost);
    const doc = kopfBereinigt
      ? { erzeugt, kopf: kopfBereinigt, artikel: gefiltert }
      : { erzeugt, artikel: gefiltert };
    writeFileSync(`${ZIEL}/${a.key}.json`, JSON.stringify(doc, null, 1) + '\n', 'utf8');
    return 'ok';
  } catch {
    return 'fehler';
  }
}

// Begrenzte Parallelität (höflich gegenüber den Kantons-APIs).
const GRENZE = 6;
let ok = 0, leer = 0, fehler = 0, fassung = 0, i = 0;
async function worker() {
  while (i < aufgaben.length) {
    const a = aufgaben[i++];
    const r = await hole(a);
    if (r === 'ok') ok++;
    else if (r === 'leer') leer++;
    else if (r === 'fassung') { fassung++; console.log(`  Fassungs-Tor (übersprungen): ${a.key} — Snapshot hängt an Version ${a.erwarteteVersion}, Portal führt eine andere als aktuell (${a.api})`); }
    else { fehler++; console.log(`  fehler/leer: ${a.key} (${a.api})`); }
  }
}
await Promise.all(Array.from({ length: GRENZE }, () => worker()));

console.log(`Kanton-Struktur: ${ok} ok, ${leer} ohne XHTML, ${fassung} Fassungs-Tor, ${fehler} Fehler · ${nichtLexwork} Nicht-LexWork, ${ohneLawId} ohne lawId übersprungen → ${ZIEL}/`);
