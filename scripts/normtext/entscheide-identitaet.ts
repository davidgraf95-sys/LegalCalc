// ─── Identität eines Entscheids: Korpus-key und Zitat-Normalform (§5) ───────
//
// Drei Funktionen, die BEIDE Rechenwege der Verzahnung brauchen — der Schreiber
// (entscheide-schreiben.ts) und der generische Bezugs-Bau (bezuege-bauen.ts).
//
// HERAUSGEZOGEN (W2·7-BEZUG), nicht neu geschrieben: sie standen im Schreiber.
// Der Rechner darf den Schreiber nicht importieren (Zyklus, check:zyklen), also
// blieben nur zwei Wege — eine Kopie oder ein gemeinsames Modul. Eine Kopie
// wäre hier besonders teuer: weicht sie ab, bekommen zwei Entscheide
// verschiedene keys und der Zitier-Graph zerfällt lautlos in zwei Hälften. §5 ist
// an dieser Stelle keine Stilfrage.
//
// entscheide-schreiben.ts re-exportiert `keyVon` und `kanonZitat` unverändert;
// die Bestands-Aufrufer (check-besetzung, check-rangliste-oracle, Tests) merken
// vom Umzug nichts.

import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

export function keyVon(snap: EntscheidSnapshot): { key: string; datei: string } {
  const docketSafe = snap.id.split('/').pop()!;
  return { key: `${snap.gericht}_${docketSafe}`, datei: `${snap.id}.json` };
}

/**
 * Kanonisches Zitat-Token für den Zitier-Abgleich (Entscheid ↔ Entscheid), §2.
 * Vereinheitlicht BEIDE Seiten (Selbst-Identität eines Snapshots UND ein rohes
 * `zitierteEntscheide`-Element) auf dieselbe Normalform, damit «BGE 150 I 17»,
 * «150 I 17» und die aza-Nennung «1C_641/2022» sicher zusammenfinden:
 *   • BGE  → 'BGE:<band>:<abt>:<seite>'   (Präfix BGE/ATF/DTF optional)
 *   • aza  → 'AZA:<abt>:<nr>:<jahr>'      ('1C_641/2022', '1P.179/1994', '5A 33/2004')
 * Kein Treffer → null (nicht abgleichbar).
 */
export function kanonZitat(roh: string): string | null {
  const t = String(roh).trim().toUpperCase();
  // Abteilung inkl. optionalem Suffix der historischen Abteilungen «Ia»/«Va»
  // ([AB]?, weil t bereits gross ist) — konsistent zu zitat-extraktion.ts; beide
  // Abgleich-Seiten laufen durch kanonZitat, also intern eindeutig (Bug-Check W3).
  const bge = /(?:BGE|ATF|DTF)?\s*(\d{1,3})\s+([IVX]{1,4}[AB]?)\s+(\d{1,4})\b/.exec(t);
  if (bge) return `BGE:${bge[1]}:${bge[2]}:${bge[3]}`;
  const aza = /\b(\d[A-Z])[._ ](\d{1,6})[/_](\d{4})\b/.exec(t);
  if (aza) return `AZA:${aza[1]}:${aza[2]}:${aza[3]}`;
  return null;
}

/** Zitat-Token, unter denen ein Snapshot von ANDEREN Entscheiden genannt werden kann. */
export function selbstTokens(snap: EntscheidSnapshot): string[] {
  const out = new Set<string>();
  for (const roh of [snap.bgeReferenz, snap.nummer, snap.azaUrteil?.aktenzeichen]) {
    if (!roh) continue;
    const t = kanonZitat(roh);
    if (t) out.add(t);
  }
  return [...out];
}
