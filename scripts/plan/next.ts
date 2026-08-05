// scripts/plan/next.ts — CLI über der nebenwirkungsfreien Auflösung (aufloesen.ts).
import { readFileSync } from 'node:fs';
import { parseRoadmap } from './parse';
import { resolve } from './aufloesen';
import { lageBlock } from './lage';
export { resolve, type Buckets } from './aufloesen';

// CLI
if (!process.env.VITEST) {
  const { einheiten, queue } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
  const b = resolve(einheiten, queue);
  const z = (s: string) => console.log(s);
  z(`▶ OBERSTER offener Schritt: ${b.readyNow[0] ?? '—'}`);
  z(`▶ JETZT baubar (ready-now): ${b.readyNow.join(', ') || '—'}`);
  z(`  Parallel-Lanes: ${b.lanes.map((l) => `[${l.join(' + ')}]`).join('  ') || '—'}`);
  if (b.begleitend.length) z(`🔄 begleitend (Querschnitt-Band, kein Reihenfolge-Slot): ${b.begleitend.join(', ')}`);
  if (b.wartetDep.length) z(`⏳ wartet auf dep: ${b.wartetDep.map((x) => `${x.id}→${x.offen.join(',')}`).join(' · ')}`);
  if (b.wartetFachzeit.length) z(`👤 wartet auf Davids Fachzeit: ${b.wartetFachzeit.join(', ')}`);
  if (b.blockiert.length) z(`⛔ blockiert: ${b.blockiert.map((x) => `${x.id}(${x.blocker})`).join(', ')}`);
  if (b.geparkt.length) z(`🅿️  geparkt: ${b.geparkt.join(', ')}`);
  if (b.inArbeit.length) z(`🔨 in Arbeit (wip): ${b.inArbeit.join(', ')}`);
  if (b.wartet26xSlot.length) z(`⏸️  wartet auf 26×-Slot: ${b.wartet26xSlot.join(', ')}`);
  if (b.slot26xBelegtVon) z(`📦 26×-Slot belegt von: ${b.slot26xBelegtVon}`);
  // Lage-Block ANGEHÄNGT (nie dazwischen): zieht man ihn ab, ist die Ausgabe
  // oben byte-identisch zum Stand vor QS-PLAN-REVIEW/4a.
  for (const zeile of lageBlock(einheiten, b.inArbeit, { prs: process.argv.includes('--prs') })) z(zeile);
}
