// ─── J3-Daten-Regen: Sachgebiet des BESTEHENDEN Korpus neu mappen (W2·10-UI-NAV-J3) ──
//
// Re-Mappt NUR das `sachgebiet` betroffener Snapshots mit der reparierten reinen
// Logik (entscheide-mapping.ts, Stand 29.8.2026: Abteilungs-Default 2A/2C/2D →
// 'oeffentlich' statt 'sozial-abgaben'; NORM_SIGNAL um BGFA→oeffentlich ergänzt)
// und schreibt den Korpus KONSISTENT über schreibeKorpus (Snapshots + register.json
// + norm-index + erfasste-keys). Kein Re-Fetch, keine Neuauswahl.
//
// SCOPE (bewusst eng, Muster scripts/archiv/remap-sachgebiet.ts — alles Übrige
// wurde von unveränderter Logik erzeugt und bleibt unangetastet):
//   a) Bund/bger mit Aktenzeichen der II. öffentlich-rechtlichen Abteilung
//      (2A/2C/2D): Kette Norm-Signal ?? Roh-StG-Signal ?? legal_area (gefiltert
//      auf sozial-abgaben) ?? Abteilungs-Default 'oeffentlich' — gleiche Regeln
//      wie mappeEntscheidOCL (Eingabe-Divergenz: siehe zweierSachgebiet unten).
//   b) Amtliche BGE (court 'bge') der BÄNDE I und II, deren unterliegendes
//      aza-Urteil (snap.azaUrteil.aktenzeichen) zur 2er-Abteilung gehört: gleiche
//      Kette. Bände III/IV/V bleiben unangetastet (Sammlungs-Systematik eindeutig:
//      Zivil/Straf/Sozialversicherung; die aza-basierte Klassierung ist dort
//      korrekt und teils FEINER als das Band, z.B. 'prozess' für 7B in Band IV).
//
// Quirk (deklariert, Q-J3-1, präzisiert nach Gegenprüfung 29.8.2026): Offline
// liegt vom aza-Urteil nur das Aktenzeichen vor; Signal-Quellen sind darum die
// Felder des (BGE-)Snapshots SELBST — die vollen `normKeys` (das persistierte
// `zitierteNormen` ist auf 8 Einträge GEKAPPT und taugt nur noch fürs
// Roh-StG-Signal) und `legalArea`. Deterministisch (§2), ohne Netz
// reproduzierbar; der Live-Import nutzt die Felder des gemappten Records.
//
// HARTE INVARIANTEN (§1): nur `sachgebiet` ändert sich; Erwägungs-/Inhalts-sha
// und alle übrigen Felder bleiben byte-gleich. Anzahl vorher == nachher.
//
//   vite-node scripts/normtext/remap-sachgebiet-j3.ts               (DRY-RUN)
//   vite-node scripts/normtext/remap-sachgebiet-j3.ts -- --schreiben
//
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  istMehrdeutigeOerAbteilung, normSignalSachgebiet, abteilungZuSachgebiet,
  zweierLegalAreaSignal, zweierRohSteuerSignal, bgeBand,
} from './entscheide-mapping';
import { schreibeKorpus } from './entscheide-schreiben';
import { alleSnapshots } from './snapshot-walker';
import type { Rechtsgebiet } from '../../src/lib/normtext/register';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');

const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');

// `bgeBand` lebt seit dem F1-Fix (29.8.2026) als EINE Quelle in
// entscheide-mapping.ts (§5) — hier lag bis dahin eine Kopie.

/** Reparierte 2er-Abteilungs-Kette — gleiche REGELN wie mappeEntscheidOCL (C2-1 +
 *  J3 + Gegenprüfungs-Korrekturen F1–F3, 29.8.2026). DEKLARIERTE Eingabe-Divergenz
 *  zum Live-Pfad: Signal-Quelle sind hier die vollen `normKeys` des Snapshots
 *  (statutes + Fliesstext, W2·6-NKEY) — NICHT `zitierteNormen`, denn dieses Feld
 *  ist im Snapshot auf 8 alphabetisch sortierte Einträge gekappt und verlor
 *  Steuer-Signale (Gegenprüfungs-Befund F3: MWSTG-/VStG-Fälle kippten nach
 *  'oeffentlich'). Das Roh-StG-Signal liest zusätzlich die (gekappten)
 *  Roh-Strings — mehr liegt offline nicht vor (Q-J3-1). */
function zweierSachgebiet(normKeys: string[], zitierteNormen: string[], legalArea: string | null): Rechtsgebiet {
  return (
    normSignalSachgebiet(normKeys)
    ?? zweierRohSteuerSignal(zitierteNormen)
    ?? zweierLegalAreaSignal(legalArea)
    ?? abteilungZuSachgebiet('2C_0/0000')  // Abteilungs-Default ('oeffentlich', Art. 30/31 BgerR)
    ?? 'oeffentlich'
  );
}

function main() {
  const snaps: EntscheidSnapshot[] = [];
  const wechsel: Array<{ nr: string; gericht: string; alt: Rechtsgebiet; neu: Rechtsgebiet }> = [];
  let geprueft = 0;

  for (const { snap } of alleSnapshots(PUB)) {
    let neu: Rechtsgebiet = snap.sachgebiet;

    const istBund = snap.kanton === 'CH';
    const istBge = snap.gericht === 'bge';
    if (istBund && !istBge && istMehrdeutigeOerAbteilung(snap.nummer)) {
      geprueft++;
      neu = zweierSachgebiet(snap.normKeys ?? [], snap.zitierteNormen ?? [], snap.legalArea ?? null);
    } else if (istBge) {
      const band = bgeBand(snap.nummer);
      const aza = snap.azaUrteil?.aktenzeichen ?? '';
      if ((band === 'I' || band === 'II') && istMehrdeutigeOerAbteilung(aza)) {
        geprueft++;
        neu = zweierSachgebiet(snap.normKeys ?? [], snap.zitierteNormen ?? [], snap.legalArea ?? null);
      }
    }

    if (neu !== snap.sachgebiet) {
      wechsel.push({ nr: snap.nummer, gericht: snap.gericht, alt: snap.sachgebiet, neu });
    }
    snaps.push(neu === snap.sachgebiet ? snap : { ...snap, sachgebiet: neu });
  }

  // Determinismus (§2): Schreib-Reihenfolge nach id stabilisieren.
  snaps.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const datum = (JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt as string)
    ?? new Date().toISOString().slice(0, 10);

  console.log(`[remap-j3] ${snaps.length} Snapshots, davon im Scope geprüft: ${geprueft} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
  console.log(`[remap-j3] Sachgebiet-Wechsel: ${wechsel.length}`);
  const proGeb: Record<string, number> = {};
  for (const w of wechsel) { const k = `${w.alt} → ${w.neu}`; proGeb[k] = (proGeb[k] ?? 0) + 1; }
  for (const [k, n] of Object.entries(proGeb).sort()) console.log(`           ${k}: ${n}`);
  console.log('[remap-j3] Beispiele:');
  for (const w of wechsel.slice(0, 30)) console.log(`           ${w.gericht} ${w.nr}: ${w.alt} → ${w.neu}`);

  if (schreiben) {
    const res = schreibeKorpus(snaps, datum, ROOT);
    console.log(`[remap-j3] geschrieben: ${res.anzahl} Entscheide, ${res.normBuckets} Norm-Buckets.`);
  } else {
    console.log('[remap-j3] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
  }
}

try { main(); } catch (e) { console.error(e); process.exit(1); }
