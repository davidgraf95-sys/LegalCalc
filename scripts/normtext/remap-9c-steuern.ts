// ─── Bestands-Regen: Steuersachen der III. öffentlich-rechtlichen Abteilung ───
//
// ANLASS (29.8.2026, Gegenprüfung der W2-Trennung, Befund F1): Die Zeile
// `'9C': 'sozialversicherung'` in `entscheide-mapping.ts` war eine Pauschale.
// Nach Art. 31 BgerR (SR 173.110.131, Fassung 2026-02-01) führt die III.
// öffentlich-rechtliche Abteilung — Aktenzeichen-Präfix 9C — «a. Steuern und
// Abgaben» NEBEN AHV/IV/EO/KV/beruflicher Vorsorge. Sie ist damit eine
// GEMISCHTE Abteilung wie die 2er, und ihr Default durfte nie ohne vorherige
// Steuer-Prüfung greifen. Die Klassierung ist mit demselben Commit korrigiert
// (`dritteOerSachgebiet`); dieses Skript zieht den BESTAND nach.
//
// SCOPE (bewusst eng, Muster remap-sachgebiet-trennung.ts): AUSSCHLIESSLICH
// Snapshots, deren massgebliche Abteilung 9C ist — bei bger das Aktenzeichen
// selbst, bei BGE das aza-Aktenzeichen des unterliegenden Urteils. Jeder andere
// Entscheid bleibt byte-gleich; 8C wird nicht angefasst.
//
// DIE REGEL ist NICHT hier kodiert, sondern die eine produktive Funktion
// `dritteOerSachgebiet` (§5) — dieses Skript wendet sie nur auf den Bestand an.
// Kurzfassung ihrer Stufen:
//   · BGE Band V  → sozialversicherung (Sozialrechts-Band der Sammlung)
//   · BGE Band II → Steuer-Signal ? steuern : oeffentlich  (Abgabe-/Verwaltungs-
//     recht-Band; NIE sozialversicherung — der amtliche Band schlägt das
//     Abteilungs-Signal)
//   · sonst → Steuer-Signal NUR, wenn kein Sozialversicherungs-Erlass
//     mitzitiert ist (Art.-23-AHVV-Fälle), sonst sozialversicherung
//
// KEINE redaktionelle Einzelfall-Zuordnung (Fachkuration wäre §7-pflichtig).
// HARTE INVARIANTEN (§1): nur `sachgebiet` ändert sich; sha und alle übrigen
// Felder bleiben byte-gleich, Anzahl vorher == nachher.
//
//   vite-node scripts/normtext/remap-9c-steuern.ts               (DRY-RUN)
//   vite-node scripts/normtext/remap-9c-steuern.ts -- --schreiben
//
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  istGemischteDritteOerAbteilung, dritteOerSachgebiet, bgeBand,
} from './entscheide-mapping';
import { schreibeKorpus } from './entscheide-schreiben';
import { alleSnapshots } from './snapshot-walker';
import type { Rechtsgebiet } from '../../src/lib/normtext/register';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const schreiben = process.argv.slice(2).includes('--schreiben');

/** Das für die Abteilungsfrage massgebliche Aktenzeichen: beim BGE das aza-Az.
 *  des unterliegenden Urteils, sonst die eigene Geschäftsnummer. */
function massgeblichesAz(snap: EntscheidSnapshot): string {
  return snap.gericht === 'bge'
    ? String(snap.azaUrteil?.aktenzeichen ?? '')
    : String(snap.nummer ?? '');
}

function neuesSachgebiet(snap: EntscheidSnapshot): Rechtsgebiet {
  return dritteOerSachgebiet({
    normKeys: snap.normKeys ?? [],
    zitierteNormen: snap.zitierteNormen ?? [],
    legalArea: snap.legalArea ?? null,
    band: snap.gericht === 'bge' ? bgeBand(String(snap.nummer ?? '')) : null,
  });
}

function main() {
  const snaps: EntscheidSnapshot[] = [];
  const wechsel: Array<{ nr: string; gericht: string; alt: string; neu: Rechtsgebiet; band: string | null }> = [];
  let imScope = 0;

  for (const { snap } of alleSnapshots(PUB)) {
    if (!istGemischteDritteOerAbteilung(massgeblichesAz(snap))) { snaps.push(snap); continue; }
    imScope++;
    const neu = neuesSachgebiet(snap);
    if (neu === snap.sachgebiet) { snaps.push(snap); continue; }
    wechsel.push({
      nr: snap.nummer, gericht: snap.gericht, alt: String(snap.sachgebiet), neu,
      band: snap.gericht === 'bge' ? bgeBand(String(snap.nummer ?? '')) : null,
    });
    snaps.push({ ...snap, sachgebiet: neu });
  }

  // Determinismus (§2): Schreib-Reihenfolge nach id stabilisieren.
  snaps.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  console.log(`[9c] ${snaps.length} Snapshots, davon Abteilung 9C: ${imScope} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
  console.log(`[9c] Wechsel: ${wechsel.length}`);
  const proUebergang: Record<string, number> = {};
  for (const w of wechsel) {
    const k = `${w.alt} → ${w.neu}${w.band ? ` (BGE Band ${w.band})` : ' (bger)'}`;
    proUebergang[k] = (proUebergang[k] ?? 0) + 1;
  }
  for (const [k, n] of Object.entries(proUebergang).sort()) console.log(`     ${String(n).padStart(5)}  ${k}`);
  for (const w of wechsel) console.log(`     ${w.gericht} ${w.nr}: ${w.alt} → ${w.neu}`);

  if (schreiben) {
    const datum = (JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt as string)
      ?? new Date().toISOString().slice(0, 10);
    const res = schreibeKorpus(snaps, datum, ROOT);
    console.log(`[9c] geschrieben: ${res.anzahl} Entscheide, ${res.normBuckets} Norm-Buckets.`);
  } else {
    console.log('[9c] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
  }
}

try { main(); } catch (e) { console.error(e); process.exit(1); }
