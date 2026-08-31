/**
 * check:kanton-abk-netz — Live-Sample-Wächter des Rohfeld-Sidecars (R8.3,
 * GP2-Empfehlung zu F8, 1.9.2026).
 *
 * WARUM EIN NETZ-WÄCHTER. Das Alias-Artefakt ist eine ZWEITE Ableitung
 * (Sidecar → register.abkRoh → Artefakt); die Offline-Tore beweisen nur die
 * Kettenglieder untereinander, nie gegen die Amtsquelle — einen F8-artigen
 * Drift (amtliches abbreviation-Feld geändert/geleert, Sidecar behauptet den
 * alten Wert) kann strukturell nur ein Live-Abgleich sehen. Darum hier:
 * n=20 deterministisch ROTIERENDE Stichprobe pro Lauf (Wochen-Cron
 * normen-monitor via check:netz) — über die Läufe wandert das Fenster durch
 * den ganzen belegten Bestand.
 *
 * GEPRÜFT WERDEN NUR EINTRÄGE MIT BEHAUPTUNG: abk ≠ '' (Sidecar behauptet ein
 * Kürzel) oder herkunft 'api' (Sidecar behauptet amtlich belegte Leere).
 * rueckrechnung-Einträge mit abk='' behaupten NICHTS («offline unbelegt») —
 * sie prüft erst der volle Roh-Neuzug (Fahrplan §5-R8, G2); sie hier rot zu
 * schalten hiesse, ein bekanntes Offen als Störung zu alarmieren (§8).
 *
 * ROT bei jedem Identitäts-Mismatch abbreviation(live) ≟ abk(Sidecar) —
 * byte-genau, keine Normalisierung (§7 Identitätstreffer, nie Substring).
 * Fix bei Rot: `npm run gen:kanton-abk-roh -- --netz-ambig --datum=…` bzw.
 * Snapshot-Neuzug des Erlasses, Diff bewusst abnehmen.
 *
 * §2: die Rotation ist eine reine Funktion von (datum, keys); das Datum kommt
 * im Runner aus der Uhr (wie inkrafttreten-generieren.ts), nie in der Logik.
 * Rot-Beweis per Stub: src/tests/kanton-abk-netz.test.ts.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pLimit from 'p-limit';
import { vergleiche } from './vergleich';
import { ladeAbkRoh, lexworkAusUrl, type AbkRohMap } from './kanton-abk-roh.ts';


const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASIS = resolve(WURZEL, 'public/normtext');
export const STICHPROBE_N = 20;
const FETCH_CONCURRENCY = 4;

/** Ein prüfbarer Kandidat: Sidecar-Behauptung + auflösbare LexWork-Quelle. */
export interface NetzKandidat {
  key: string;
  /** Behauptetes Rohfeld (auch '' — dann behauptet 'api' amtliche Leere). */
  abk: string;
  host: string;
  lang: 'de' | 'fr';
  lawId: string;
}

/**
 * Kandidaten mit Behauptung, deterministisch sortiert. quelleUrl-Auflösung:
 * api-Einträge tragen die API-URL selbst; rueckrechnung-Einträge werden über
 * die register.json-quelleUrl (App-URL) aufgelöst. Nicht auflösbare Kandidaten
 * (fremde Pipeline, kein LexWork-Muster) fallen sichtbar raus (Rückgabe 2).
 */
export function baueKandidaten(
  sidecar: AbkRohMap,
  registerQuelleUrls: Map<string, string>,
): { kandidaten: NetzKandidat[]; unaufloesbar: string[] } {
  const kandidaten: NetzKandidat[] = [];
  const unaufloesbar: string[] = [];
  for (const key of Object.keys(sidecar).sort(vergleiche)) {
    const e = sidecar[key];
    if (e.abk === '' && e.herkunft !== 'api') continue; // keine Behauptung
    const url = e.quelleUrl?.replace('/api/', '/app/') ?? registerQuelleUrls.get(key) ?? '';
    const b = lexworkAusUrl(url);
    if (!b) {
      unaufloesbar.push(key);
      continue;
    }
    kandidaten.push({ key, abk: e.abk, ...b });
  }
  return { kandidaten, unaufloesbar };
}

/** Tages-Index (UTC-Tage seit Epoche) eines ISO-Datums — rein. */
export function tagesIndex(datum: string): number {
  return Math.floor(Date.parse(`${datum}T00:00:00Z`) / 86_400_000);
}

/**
 * Deterministisch rotierende Stichprobe: pro Tag verschiebt sich das Fenster
 * um n Positionen (mit Umbruch) — gleiche (datum, kandidaten) ⇒ gleiche
 * Auswahl (§2), über die Cron-Läufe wandert sie durch den ganzen Bestand.
 */
export function rotierendeStichprobe<T>(kandidaten: T[], datum: string, n = STICHPROBE_N): T[] {
  if (kandidaten.length <= n) return [...kandidaten];
  const start = (tagesIndex(datum) * n) % kandidaten.length;
  return Array.from({ length: n }, (_, i) => kandidaten[(start + i) % kandidaten.length]);
}

export interface NetzBefund {
  key: string;
  erwartet: string;
  live: string;
  quelle: string;
}

/**
 * Der Kern-Abgleich — hole injizierbar (Rot-Beweis per Stub, §6.7).
 * Fetch-Fehler sind eigene Befunde (kein stilles Grün bei totem Endpoint, §8).
 */
export async function pruefeStichprobe(
  probe: NetzKandidat[],
  hole: (host: string, lang: 'de' | 'fr', lawId: string) => Promise<{ meta: { abkuerzung: string } }>,
): Promise<{ mismatches: NetzBefund[]; fetchFehler: string[] }> {
  const limit = pLimit(FETCH_CONCURRENCY);
  const mismatches: NetzBefund[] = [];
  const fetchFehler: string[] = [];
  await Promise.all(probe.map((k) => limit(async () => {
    try {
      const erg = await hole(k.host, k.lang, k.lawId);
      if (erg.meta.abkuerzung !== k.abk) {
        mismatches.push({
          key: k.key,
          erwartet: k.abk,
          live: erg.meta.abkuerzung,
          quelle: `https://${k.host}/api/${k.lang}/texts_of_law/${k.lawId}`,
        });
      }
    } catch (e) {
      fetchFehler.push(`${k.key}: ${e instanceof Error ? e.message : String(e)}`);
    }
  })));
  mismatches.sort((a, b) => vergleiche(a.key, b.key));
  return { mismatches, fetchFehler };
}

async function main(): Promise<void> {
  // Datum aus der Uhr — Runner-Ebene, nicht Logik (§2; Muster
  // inkrafttreten-generieren.ts); --datum= übersteuerbar für Reproduktion.
  const arg = process.argv.find((a) => a.startsWith('--datum='));
  const datum = arg ? arg.slice('--datum='.length) : new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    console.error('check:kanton-abk-netz: --datum=YYYY-MM-DD fehlerhaft.');
    process.exit(1);
  }

  const sidecar = ladeAbkRoh(BASIS);
  if (Object.keys(sidecar).length === 0) {
    console.error('check:kanton-abk-netz: Sidecar fehlt/leer — erst `npm run gen:kanton-abk-roh` (§6.7).');
    process.exit(1);
  }
  const register = JSON.parse(readFileSync(resolve(BASIS, 'register.json'), 'utf8')) as {
    erlasse: Array<{ key: string; ebene: string; quelleUrl: string }>;
  };
  const urls = new Map(register.erlasse.filter((e) => e.ebene === 'kanton').map((e) => [e.key, e.quelleUrl]));

  const { kandidaten } = baueKandidaten(sidecar, urls);
  if (kandidaten.length === 0) {
    console.error('check:kanton-abk-netz: 0 prüfbare Kandidaten — Quell-Defekt, kein Ergebnis (§6.7).');
    process.exit(1);
  }
  const probe = rotierendeStichprobe(kandidaten, datum);
  const { holeLexWork } = await import('./adapter-lexwork.ts');
  const { mismatches, fetchFehler } = await pruefeStichprobe(probe, holeLexWork);

  if (fetchFehler.length > 0) {
    console.error(`check:kanton-abk-netz ROT — ${fetchFehler.length} Abruf-Fehler:\n  ${fetchFehler.join('\n  ')}`);
    process.exit(1);
  }
  if (mismatches.length > 0) {
    console.error(`check:kanton-abk-netz ROT — ${mismatches.length}/${probe.length} Rohfeld-Drift(s) gegen die Amtsquelle:`);
    for (const m of mismatches) {
      console.error(`  ${m.key}: Sidecar ${JSON.stringify(m.erwartet)} ≠ live ${JSON.stringify(m.live)} (${m.quelle})`);
    }
    console.error('Fix: `npm run gen:kanton-abk-roh -- --netz-ambig --datum=…` bzw. Snapshot-Neuzug, Diff bewusst abnehmen.');
    process.exit(1);
  }
  console.log(
    `check:kanton-abk-netz GRÜN — ${probe.length}/${kandidaten.length} rotierende Stichprobe (Fenster ${datum}) `
    + 'byte-gleich mit dem amtlichen abbreviation-Feld.',
  );
}

if (!process.env.VITEST) await main();
