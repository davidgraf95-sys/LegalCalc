// ─── Bestands-Regen: Doppel-Topf in zwei Rechtsgebiete trennen (W2-TRENNUNG) ──
//
// ANLASS (29.8.2026, Entscheid David «ja trennen»; Vorlage FAHRPLAN-UI-
// NAVIGATION §Y Ziff. 0 / Q-J3-3): Das Sachgebiet `'sozial-abgaben'`
// («Steuern, Sozialversicherung & Abgaben») ist zerlegt in `'steuern'` und
// `'sozialversicherung'`. Die Klassierungs-Tabellen (entscheide-mapping.ts,
// adapter-entscheide.ts) sind bereits umgestellt; dieses Skript zieht den
// BESTAND nach — sonst trüge der Korpus einen Wert, den der Typ nicht mehr
// kennt und keine Facette mehr anzeigt.
//
// SCOPE (bewusst eng, Muster remap-sachgebiet-j3.ts): AUSSCHLIESSLICH
// Snapshots, deren `sachgebiet` heute `'sozial-abgaben'` ist. Alles Übrige
// bleibt byte-gleich — kein Entscheid ausserhalb des Alt-Topfs wird auch nur
// angefasst. Das ist der ganze Unterschied zu einer Neu-Klassierung: hier
// wird NICHT neu entschieden, welchem Gebiet ein Entscheid angehört, sondern
// nur, welche HÄLFTE des zerlegten Topfs ihn schon vorher trug.
//
// DIE REGELN (deterministisch, §2 — jede mit ihrer amtlichen Grundlage):
//
//   R1  Bund, Abteilung 8C/9C → sozialversicherung
//       Die sozialrechtlichen Abteilungen des Bundesgerichts (Art. 34/35
//       BgerR, SR 173.110.131). Sie führen nie Steuersachen.
//   R2  Bund, Abteilung 2A/2C/2D → die J3-Signalkette, deren Steuer-Ausgänge
//       jetzt 'steuern' heissen (NORM_SIGNAL DBG/StHG/MWStG/StG/VStG ??
//       Roh-«StG»/«Steuergesetz» ?? auf Steuerbegriffe gefilterte legal_area).
//       Ein Eintrag dieser Abteilung steht nur dann im Alt-Topf, wenn genau
//       eines dieser STEUER-Signale gegriffen hat — Sozialversicherung ist
//       auf der 2er-Abteilung keine Zuständigkeit (Art. 30 BgerR).
//   R3  BGE Band V → sozialversicherung (Sozialrechts-Band der amtlichen
//       Sammlung; Steuersachen stehen in Band I/II).
//   R4  BGE Band I/II mit 2er-aza → wie R2. BGE mit 8C/9C-aza → wie R1.
//   R5  Kantonal, Aktenzeichen-Präfix → `kantonalSachgebiet` (die beiden
//       Sozialversicherungs-Zeilen zeigen jetzt auf 'sozialversicherung':
//       EL/IV/UV/ALV/EO/AHV/BV/KV/FZ und BS AL/AH/MV/SG).
//   R6  Rest → `legalAreaZuSachgebiet` (tax/steuer → steuern; social/sozial →
//       sozialversicherung). Kein Treffer → im Bericht als UNGELÖST gemeldet
//       und UNVERÄNDERT gelassen; lieber ein sichtbarer Rest als eine
//       geratene Zuordnung (§8).
//
// KEINE redaktionelle Einzelfall-Zuordnung (Fachkuration wäre §7-pflichtig).
// HARTE INVARIANTEN (§1): nur `sachgebiet` ändert sich; sha und alle übrigen
// Felder bleiben byte-gleich, Anzahl vorher == nachher.
//
//   vite-node scripts/normtext/remap-sachgebiet-trennung.ts               (DRY-RUN)
//   vite-node scripts/normtext/remap-sachgebiet-trennung.ts -- --schreiben
//
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  istMehrdeutigeOerAbteilung, normSignalSachgebiet, abteilungZuSachgebiet,
  zweierLegalAreaSignal, zweierRohSteuerSignal, kantonalSachgebiet,
  legalAreaZuSachgebiet, bgeBand,
} from './entscheide-mapping';
import { schreibeKorpus } from './entscheide-schreiben';
import { alleSnapshots } from './snapshot-walker';
import type { Rechtsgebiet } from '../../src/lib/normtext/register';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const schreiben = process.argv.slice(2).includes('--schreiben');

/** Der abgelöste Wert. Als String, weil `Rechtsgebiet` ihn nicht mehr kennt —
 *  genau das ist der Grund für diesen Lauf. */
const ALT = 'sozial-abgaben';

// `bgeBand` lebt seit dem F1-Fix (29.8.2026) als EINE Quelle in
// entscheide-mapping.ts (§5) — hier lag bis dahin eine Kopie.

/** R2: die J3-Kette der 2er-Abteilung, ohne den Abteilungs-Default (der ist
 *  'oeffentlich' und kann hier nicht greifen — der Eintrag steht ja im
 *  Alt-Topf, also HAT ein Steuer-Signal gegriffen). Signal-Quelle sind die
 *  vollen `normKeys` plus die Roh-Strings, exakt wie beim J3-Regen (Q-J3-1). */
function zweierSteuerSignal(snap: EntscheidSnapshot): Rechtsgebiet | null {
  return (
    normSignalSachgebiet(snap.normKeys ?? [])
    ?? zweierRohSteuerSignal(snap.zitierteNormen ?? [])
    ?? zweierLegalAreaSignal(snap.legalArea ?? null)
  );
}

/** Welche Hälfte des zerlegten Topfs trug diesen Entscheid? `null` = ungelöst. */
function haelfte(snap: EntscheidSnapshot): { ziel: Rechtsgebiet | null; regel: string } {
  const docket = String(snap.nummer ?? '');
  const istBge = snap.gericht === 'bge';

  if (snap.kanton === 'CH' && !istBge) {
    const abt = abteilungZuSachgebiet(docket);
    if (abt === 'sozialversicherung') return { ziel: abt, regel: 'R1 Abteilung 8C/9C' };
    if (istMehrdeutigeOerAbteilung(docket)) {
      const s = zweierSteuerSignal(snap);
      if (s) return { ziel: s, regel: 'R2 2er-Steuersignal' };
    }
  } else if (istBge) {
    if (bgeBand(snap.nummer) === 'V') return { ziel: 'sozialversicherung', regel: 'R3 BGE Band V' };
    const aza = snap.azaUrteil?.aktenzeichen ?? '';
    if (abteilungZuSachgebiet(aza) === 'sozialversicherung') {
      return { ziel: 'sozialversicherung', regel: 'R4 BGE mit 8C/9C-aza' };
    }
    if (istMehrdeutigeOerAbteilung(aza)) {
      const s = zweierSteuerSignal(snap);
      if (s) return { ziel: s, regel: 'R4 BGE mit 2er-aza, Steuersignal' };
    }
  } else {
    const k = kantonalSachgebiet(docket);
    if (k === 'sozialversicherung' || k === 'steuern') return { ziel: k, regel: 'R5 kantonaler Präfix' };
  }

  const la = legalAreaZuSachgebiet(snap.legalArea ?? null);
  if (la === 'sozialversicherung' || la === 'steuern') return { ziel: la, regel: 'R6 legal_area' };
  return { ziel: null, regel: 'UNGELÖST' };
}

function main() {
  const snaps: EntscheidSnapshot[] = [];
  const wechsel: Array<{ nr: string; gericht: string; kanton: string; neu: Rechtsgebiet; regel: string }> = [];
  const ungeloest: string[] = [];
  let imTopf = 0;

  for (const { snap } of alleSnapshots(PUB)) {
    if ((snap.sachgebiet as string) !== ALT) { snaps.push(snap); continue; }
    imTopf++;
    const { ziel, regel } = haelfte(snap);
    if (!ziel) {
      ungeloest.push(`${snap.gericht} ${snap.nummer} [${snap.kanton}] legalArea=${snap.legalArea ?? '-'}`);
      snaps.push(snap);
      continue;
    }
    wechsel.push({ nr: snap.nummer, gericht: snap.gericht, kanton: snap.kanton, neu: ziel, regel });
    snaps.push({ ...snap, sachgebiet: ziel });
  }

  // Determinismus (§2): Schreib-Reihenfolge nach id stabilisieren.
  snaps.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  console.log(`[trennung] ${snaps.length} Snapshots, davon im Alt-Topf: ${imTopf} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
  console.log(`[trennung] Wechsel: ${wechsel.length} · ungelöst: ${ungeloest.length}`);
  const proRegel: Record<string, number> = {};
  for (const w of wechsel) { const k = `${w.regel} ⇒ ${w.neu}`; proRegel[k] = (proRegel[k] ?? 0) + 1; }
  for (const [k, n] of Object.entries(proRegel).sort()) console.log(`           ${String(n).padStart(5)}  ${k}`);
  const proZiel: Record<string, number> = {};
  for (const w of wechsel) proZiel[w.neu] = (proZiel[w.neu] ?? 0) + 1;
  console.log('[trennung] Ziel-Verteilung:', JSON.stringify(proZiel));
  if (ungeloest.length) {
    console.log('[trennung] UNGELÖST (unverändert gelassen, §8):');
    for (const u of ungeloest.slice(0, 40)) console.log(`           ${u}`);
  }

  if (schreiben) {
    const datum = (JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt as string)
      ?? new Date().toISOString().slice(0, 10);
    const res = schreibeKorpus(snaps, datum, ROOT);
    console.log(`[trennung] geschrieben: ${res.anzahl} Entscheide, ${res.normBuckets} Norm-Buckets.`);
  } else {
    console.log('[trennung] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
  }
}

try { main(); } catch (e) { console.error(e); process.exit(1); }
