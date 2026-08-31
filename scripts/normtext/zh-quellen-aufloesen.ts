/**
 * ZH-4a · Auflöse-Werkzeug für die deklarative ZH-Quellenliste (`zh-quellen.ts`).
 *
 *   npx vite-node scripts/normtext/zh-quellen-aufloesen.ts            # Liste prüfen
 *   npx vite-node scripts/normtext/zh-quellen-aufloesen.ts 550.1 700.1 # Nummern auflösen
 *
 * Ohne Argumente prüft es die eingetragenen Erlasse gegen die amtliche Quelle
 * (Titel + Registry-URL der geltenden Fassung) und meldet jede Abweichung mit
 * Exit 1 — so wird eine still veraltete Registry-URL (neue Nachtragsnummer)
 * sichtbar, statt erst im Lauf als 404 aufzuschlagen. Mit Argumenten löst es
 * beliebige LS-Ordnungsnummern auf und druckt fertige `ZH_QUELLEN`-Einträge.
 *
 * §5: DIESES Werkzeug erzeugt die Einträge in `zh-quellen.ts` — die Liste wird
 * nie von Hand geraten. §2: keine Rechenlogik, reines Erhebungs-/Prüfwerkzeug.
 *
 * Netz-Disziplin (Dossier §5): ~1 req/s seriell gegen zh.ch, UA mit Kontakt,
 * AEM-Komponenten-ID zur Laufzeit aufgelöst, HTTP-204-Leerbody abgefangen.
 */

import { ZH_QUELLEN, type ZhQuelle } from './zh-quellen.ts';
import { fetchMitWiederholung } from './netz-retry.ts';

const UA = 'LexMetrik-Import/1.0 (kontakt: david.graf95@gmail.com)';
const BASIS = 'https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung';
const ABSTAND_MS = 1100;

const schlaf = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function hole(url: string): Promise<Response> {
  await schlaf(ABSTAND_MS);
  return fetchMitWiederholung(url, { headers: { 'User-Agent': UA } });
}

/** AEM-Komponenten-ID aus der server-gerenderten Suchseite (nie verdrahten). */
async function komponentenId(): Promise<string> {
  const res = await hole(`${BASIS}.html`);
  if (!res.ok) throw new Error(`Suchseite: HTTP ${res.status}`);
  const html = await res.text();
  const ids = [...new Set([...html.matchAll(/lawcollectionsearch_(\d+)/g)].map((m) => m[1]))];
  if (ids.length !== 1) {
    throw new Error(`Erwartet genau eine lawcollectionsearch-Komponenten-ID, gefunden: ${ids.join(', ') || 'keine'}`);
  }
  return ids[0];
}

interface Satz {
  link: string;
  referenceNumber: string;
  enactmentTitle: string;
  withdrawalDate?: string;
}

/** Geltende Fassung zu einer Ordnungsnummer; null = kein eindeutiger Treffer. */
async function loese(id: string, nr: string): Promise<ZhQuelle | null> {
  const url =
    `${BASIS}/_jcr_content/main/lawcollectionsearch_${id}.zhweb-zhlex-ls.zhweb-cache.json` +
    `?referenceNumber=${encodeURIComponent(nr)}&includeRepealedEnactments=false`;
  const res = await hole(url);
  // Falle: 0 Treffer → HTTP 204 mit LEEREM Body (kein JSON).
  if (res.status === 204) return null;
  const txt = await res.text();
  if (!res.ok || txt.trim().length === 0) return null;
  const json = JSON.parse(txt) as { data?: Satz[]; moreSearchResultsThanAllowed?: boolean };
  if (json.moreSearchResultsThanAllowed) {
    throw new Error(`${nr}: Endpunkt meldet Kappung (>150) — Abfrage verfeinern`);
  }
  const exakt = (json.data ?? []).filter((s) => s.referenceNumber === nr && !s.withdrawalDate);
  if (exakt.length !== 1) return null;
  const s = exakt[0];
  // Der Endpunkt hängt bei einigen Erlassen ein bis zwei Leerzeichen an
  // («Gemeindegesetz (GG) »). Das ist Transport-Artefakt, nicht Titelbestandteil
  // — hier EINMAL getrimmt, damit Liste und Prüfung dieselbe Normalisierung
  // sehen. (Ohne das meldete die Prüfung 4 von 20 Erlassen dauerhaft als
  // Abweichung, obwohl nur das Leerzeichen differierte — Befund 31.8.2026.)
  const titel = s.enactmentTitle.trim();
  const klammer = titel.match(/\(([^()]+)\)\s*$/);
  return {
    nr,
    titel,
    kuerzel: klammer ? klammer[1] : '',
    registryUrl: new URL(s.link, 'https://www.zh.ch').toString(),
  };
}

const argumente = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const id = await komponentenId();
console.log(`AEM-Komponenten-ID (Laufzeit aufgelöst): ${id}`);

if (argumente.length > 0) {
  for (const nr of argumente) {
    const q = await loese(id, nr);
    if (!q) {
      console.log(`  { /* ${nr}: KEIN eindeutiger geltender Treffer — von Hand klären */ },`);
      continue;
    }
    console.log(
      `  {\n    nr: '${q.nr}',\n    titel: ${JSON.stringify(q.titel)},\n` +
        `    kuerzel: '${q.kuerzel}',\n    registryUrl: \`\${BASIS}${q.registryUrl.split('/zhlex-ls/')[1]}\`,\n  },`,
    );
  }
} else {
  let abweichungen = 0;
  for (const soll of ZH_QUELLEN) {
    const ist = await loese(id, soll.nr);
    if (!ist) {
      console.error(`  FEHLER ${soll.nr}: kein eindeutiger geltender Treffer am JSON-Endpunkt`);
      abweichungen++;
      continue;
    }
    const probleme: string[] = [];
    if (ist.registryUrl !== soll.registryUrl) probleme.push(`URL ist "${ist.registryUrl}"`);
    if (ist.titel !== soll.titel) probleme.push(`Titel ist "${ist.titel}"`);
    if (probleme.length > 0) {
      console.error(`  FEHLER ${soll.nr} (${soll.kuerzel || '—'}): ${probleme.join(' · ')}`);
      abweichungen++;
    } else {
      console.log(`  ok ${soll.nr.padEnd(8)} ${soll.kuerzel || '—'}`);
    }
  }
  console.log(`\nzh-quellen: ${ZH_QUELLEN.length} Erlasse geprüft, ${abweichungen} Abweichung(en).`);
  if (abweichungen > 0) process.exit(1);
}
