// scripts/plan/dump.ts — vollständiger, stabil sortierter Dump aller Einheit-Felder.
//
// Fund R2-3 der QS-TOK-Endprüfung Runde 2 (31.7.2026): Die Verhaltensneutralität von
// ROADMAP-Umbauten wurde mit einem ad-hoc geschriebenen «einheiten-dump» belegt
// («einheiten-dump-Diff = GENAU 2 Zeilen»). Jener Dump führte das Feld `checkbox`
// NICHT — er war blind an genau der Stelle, an der die Regression steckte (B20:
// `checkbox "[ ]" → null`), und hat sie darum durchgewinkt. Ein Beweis-Instrument,
// das ein Feld nicht kennt, kann in diesem Feld nicht scheitern (§6.7).
//
// Darum: EIN benanntes Skript, das ALLE Felder der `Einheit` serialisiert — id,
// sämtliche Etikett-Felder, checkbox, sektion, pos —, damit «plan:dump-Diff» ein
// prüfbares Artefakt ist statt einer Ad-hoc-Zeile. Aufruf:
//   npm run plan:dump                 → Dump des Arbeitsstands
//   git stash && npm run plan:dump > a.txt && git stash pop && npm run plan:dump > b.txt && diff a.txt b.txt
//
// Ausgabe ist zeilenweise und pro Einheit EINE Zeile, damit `diff` genau die
// geänderten Einheiten zeigt. Die Reihenfolge ist die Dokumentreihenfolge (pos) —
// so bleibt der Diff auch bei Umsortierungen lesbar.
import { readFileSync } from 'node:fs';
import { parseRoadmap, type Einheit } from './parse';

export function dumpZeile(e: Einheit): string {
  const t = e.etikett;
  const felder = [
    `id=${e.id}`,
    `pos=${e.pos}`,
    `checkbox=${e.checkbox ?? '—'}`,
    `sektion=${e.sektion}`,
    `status=${t.status}`,
    `blocker=${t.blocker ?? '—'}`,
    `dep=[${t.dep.join(', ')}]`,
    `kollision=[${t.kollision.join(', ')}]`,
    `worktree=${t.worktree ? 'ja' : 'nein'}`,
    `26x=${t.asset26x ? 'ja' : 'nein'}`,
    `fahrplan=${t.fahrplan ?? '—'}`,
    `slot=${t.slot ?? '—'}`,
  ];
  return felder.join(' · ');
}

export function dump(md: string): string {
  const { einheiten, blockers, queue } = parseRoadmap(md);
  const zeilen = einheiten.map(dumpZeile);
  // Queue und Blocker-Register gehören zum steuernden Zustand und müssen im Diff
  // sichtbar sein — ein stillschweigend geänderter Queue-Kopf steuert sonst um,
  // ohne dass der Neutralitäts-Beweis es zeigt.
  zeilen.push(`@queue=[${queue.join(', ')}]`);
  for (const k of Object.keys(blockers).sort()) zeilen.push(`@blocker ${k}=${blockers[k]}`);
  return zeilen.join('\n') + '\n';
}

// CLI
if (!process.env.VITEST) {
  process.stdout.write(dump(readFileSync('ROADMAP.md', 'utf8')));
}
