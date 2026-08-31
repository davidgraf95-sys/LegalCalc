/**
 * gen:kanton-abk-roh — Runner für das Rohfeld-Sidecar
 * public/normtext/kanton-abk-roh.json (R8.3 Wurzel-Fix F8; Mechanik: Kopf von
 * kanton-abk-roh.ts).
 *
 * Modi:
 *   npm run gen:kanton-abk-roh
 *       Offline: je Kanton-Snapshot einen Eintrag. Bestehende 'api'-Einträge
 *       bleiben unangetastet (amtlich belegt schlägt Rückrechnung); alles
 *       andere wird frisch rückgerechnet (Beweise a+b eingebaut, fail-closed).
 *       Schlüssel ohne Snapshot werden entfernt (Sidecar folgt dem Korpus).
 *
 *   npm run gen:kanton-abk-roh -- --netz-ambig --datum=YYYY-MM-DD
 *       GEZIELTE Disambiguierung (KEIN Massen-Neuzug — der volle Roh-Neuzug
 *       aller Erlasse ist Fahrplan §5-R8/G2): holt das abbreviation-Feld NUR
 *       für Einträge, deren Rückrechnung leer ist UND deren heutiger
 *       Register-kuerzel die Alias-Filter passieren würde — exakt die Klasse,
 *       in der offline Titel-Kopie (F8) und echtes Allein-Kürzel (TZV/ABRG)
 *       ununterscheidbar sind. Ergebnis wird als herkunft 'api' mit
 *       quelleUrl + stand gespeichert (auch abk='' — ehrlich leer).
 *       Soft-404-Schutz: holeLexWork (Content-Type-Wächter, LexWorkShellError).
 *
 *   npm run check:kanton-abk-roh   (-- --check)
 *       Drift-Tor: (1) jeder Kanton-Snapshot hat einen Eintrag, kein Waise;
 *       (2) 'rueckrechnung'-Einträge == frische Rückrechnung (Beweise laufen
 *       mit); (3) Datei byte-gleich der deterministischen Serialisierung;
 *       (4) 'api'-Einträge tragen quelleUrl + stand. Schreibt nie.
 *
 * §2: --datum aus der Shell; §7: api-Werte verbatim mit Quelle+Stand.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pLimit from 'p-limit';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import {
  ladeAbkRoh, serialisiereAbkRoh, rekonstruiereAbkRoh, lexworkAusUrl,
  ABK_ROH_DATEINAME, type AbkRohMap, type AbkRohEintrag,
} from './kanton-abk-roh.ts';
import { aliasAusRoh } from './kanton-abk-regeln.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASIS = resolve(WURZEL, 'public/normtext');
const KANTON_DIR = resolve(BASIS, 'kanton');
const SIDECAR = resolve(BASIS, ABK_ROH_DATEINAME);
const FETCH_CONCURRENCY = 4; // höflich gegen Amtsserver (wie normtext-snapshot.ts)

interface SnapshotKopf {
  stamm: string;
  erlass: string;
  abgerufen: string;
  quelleUrl: string;
}

/** Kopfdaten aller Kanton-Snapshots (eintraege[0] trägt erlass/abgerufen/URL). */
export function leseSnapshotKoepfe(dir: string): SnapshotKopf[] {
  const koepfe: SnapshotKopf[] = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.json') && n !== 'index.json').sort()) {
    let d: NormSnapshotDatei;
    try {
      d = JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as NormSnapshotDatei;
    } catch {
      continue;
    }
    const e = d.eintraege?.[0];
    if (!e?.erlass) continue;
    koepfe.push({
      stamm: f.replace(/\.json$/, ''),
      erlass: e.erlass,
      abgerufen: e.abgerufen ?? '',
      quelleUrl: (e.quelleUrl ?? '').split('#')[0],
    });
  }
  return koepfe;
}

function baueOffline(koepfe: SnapshotKopf[], bestehend: AbkRohMap): {
  map: AbkRohMap;
  bilanz: Map<string, number>;
} {
  const map: AbkRohMap = {};
  const bilanz = new Map<string, number>();
  const zaehle = (k: string): void => { bilanz.set(k, (bilanz.get(k) ?? 0) + 1); };
  for (const k of koepfe) {
    const alt = bestehend[k.stamm];
    if (alt?.herkunft === 'api') {
      map[k.stamm] = alt; // amtlich belegt schlägt Rückrechnung, nie umgekehrt
      zaehle('api-bewahrt');
      continue;
    }
    const r = rekonstruiereAbkRoh(k.erlass);
    map[k.stamm] = { abk: r.abk, herkunft: 'rueckrechnung', stand: k.abgerufen };
    zaehle(r.klasse);
  }
  return { map, bilanz };
}

/** Kandidaten der Mehrdeutigkeitsklasse: Rückrechnung leer, aber der heutige
 *  Register-kuerzel passierte die Alias-Filter (= genau die F8-Risikomenge). */
export function ambigeKandidaten(koepfe: SnapshotKopf[], map: AbkRohMap): SnapshotKopf[] {
  const register = JSON.parse(readFileSync(resolve(BASIS, 'register.json'), 'utf8')) as {
    erlasse: Array<{ key: string; ebene: string; kuerzel: string }>;
  };
  const kuerzelJeKey = new Map(
    register.erlasse.filter((e) => e.ebene === 'kanton').map((e) => [e.key, e.kuerzel]),
  );
  return koepfe.filter((k) => {
    if (map[k.stamm]?.herkunft === 'api') return false;
    if (map[k.stamm]?.abk) return false;
    const kandidat = kuerzelJeKey.get(k.stamm);
    return !!kandidat && aliasAusRoh(kandidat).abk !== null;
  });
}

async function netzAmbig(kandidaten: SnapshotKopf[], map: AbkRohMap, datum: string): Promise<void> {
  const { holeLexWork } = await import('./adapter-lexwork.ts');
  const limit = pLimit(FETCH_CONCURRENCY);
  const fehler: string[] = [];
  await Promise.all(kandidaten.map((k) => limit(async () => {
    const bausteine = lexworkAusUrl(k.quelleUrl);
    if (!bausteine) {
      fehler.push(`${k.stamm}: quelleUrl kein LexWork-Muster (${k.quelleUrl})`);
      return;
    }
    try {
      const erg = await holeLexWork(bausteine.host, bausteine.lang, bausteine.lawId);
      const eintrag: AbkRohEintrag = {
        abk: erg.meta.abkuerzung, // verbatim tol.abbreviation ?? ''
        herkunft: 'api',
        stand: datum,
        quelleUrl: `https://${bausteine.host}/api/${bausteine.lang}/texts_of_law/${bausteine.lawId}`,
      };
      map[k.stamm] = eintrag;
    } catch (e) {
      fehler.push(`${k.stamm}: ${e instanceof Error ? e.message : String(e)}`);
    }
  })));
  if (fehler.length > 0) {
    // §8: kein stilles Teilergebnis — Fehler benennen; der Lauf bricht ab,
    // damit kein halb-disambiguiertes Sidecar committet wird.
    console.error(`--netz-ambig: ${fehler.length} Abruf-Fehler:\n  ${fehler.join('\n  ')}`);
    process.exit(1);
  }
}

function pruefe(koepfe: SnapshotKopf[], neuSerialisiert: string): void {
  if (!existsSync(SIDECAR)) {
    console.error(`check:kanton-abk-roh: ${SIDECAR} fehlt — erst \`npm run gen:kanton-abk-roh\`.`);
    process.exit(1);
  }
  const roh = readFileSync(SIDECAR, 'utf8');
  const map = ladeAbkRoh(BASIS);
  const stamm = new Set(koepfe.map((k) => k.stamm));
  const waisen = Object.keys(map).filter((k) => !stamm.has(k));
  const fehlend = koepfe.filter((k) => !map[k.stamm]).map((k) => k.stamm);
  const kaputteApi = Object.entries(map)
    .filter(([, e]) => e.herkunft === 'api' && (!e.quelleUrl || !e.stand))
    .map(([k]) => k);
  const probleme: string[] = [];
  if (fehlend.length) probleme.push(`${fehlend.length} Snapshot(s) ohne Rohfeld-Eintrag (${fehlend[0]} …)`);
  if (waisen.length) probleme.push(`${waisen.length} Eintrag/Einträge ohne Snapshot (${waisen[0]} …)`);
  if (kaputteApi.length) probleme.push(`${kaputteApi.length} api-Eintrag/Einträge ohne quelleUrl/stand (${kaputteApi[0]} …)`);
  if (roh !== neuSerialisiert) probleme.push('Datei driftet gegenüber frischer Ableitung (Rückrechnung/Serialisierung) — `npm run gen:kanton-abk-roh` fahren und Diff bewusst abnehmen');
  if (probleme.length > 0) {
    console.error(`check:kanton-abk-roh ROT:\n  ${probleme.join('\n  ')}`);
    process.exit(1);
  }
  const api = Object.values(map).filter((e) => e.herkunft === 'api').length;
  const belegt = Object.values(map).filter((e) => e.abk !== '').length;
  console.log(`check:kanton-abk-roh: ${Object.keys(map).length} Einträge synchron (${belegt} mit Kürzel, ${api} api-belegt).`);
}

export async function main(): Promise<void> {
  const nurPruefen = process.argv.includes('--check');
  const mitNetz = process.argv.includes('--netz-ambig');
  const koepfe = leseSnapshotKoepfe(KANTON_DIR);
  if (koepfe.length === 0) {
    console.error('0 Kanton-Snapshots gefunden — Quell-Defekt, kein Ergebnis (§6.7).');
    process.exit(1);
  }
  const bestehend = ladeAbkRoh(BASIS);
  const { map, bilanz } = baueOffline(koepfe, bestehend);

  if (nurPruefen) {
    pruefe(koepfe, serialisiereAbkRoh(map));
    process.exit(0);
  }

  if (mitNetz) {
    const datumArg = process.argv.find((a) => a.startsWith('--datum='));
    const datum = datumArg?.slice('--datum='.length) ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
      console.error('--netz-ambig braucht --datum=YYYY-MM-DD (§2).');
      process.exit(1);
    }
    const kandidaten = ambigeKandidaten(koepfe, map);
    console.log(`--netz-ambig: ${kandidaten.length} Kandidaten der Mehrdeutigkeitsklasse …`);
    await netzAmbig(kandidaten, map, datum);
    const leer = kandidaten.filter((k) => map[k.stamm].abk === '').length;
    console.log(`  amtlich beantwortet: ${kandidaten.length - leer} mit Kürzel, ${leer} ehrlich leer.`);
  }

  writeFileSync(SIDECAR, serialisiereAbkRoh(map), 'utf8');
  const stat = [...bilanz.entries()].sort().map(([k, n]) => `${k} ${n}`).join(' · ');
  const belegt = Object.values(map).filter((e) => e.abk !== '').length;
  console.log(`gen:kanton-abk-roh: ${Object.keys(map).length} Einträge (${belegt} mit Kürzel) → ${SIDECAR}`);
  console.log(`  Klassen: ${stat}`);
}

if (!process.env.VITEST) await main();
