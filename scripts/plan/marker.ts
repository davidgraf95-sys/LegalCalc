// scripts/plan/marker.ts — obersterMarkerId() nebenwirkungsfrei.
// Ausgelagert aus check.ts (§17-Wurzel-Fix 5.8.2026), aus demselben Grund, der
// resolve() am 24.7.2026 in aufloesen.ts ausgelagert hat: check.ts trägt einen
// eigenen CLI-Block, der nur an `process.env.VITEST` erkennt, ob er laufen darf
// — vite-node trägt den Skriptpfad nicht in argv, Entry-Erkennung ist darum
// unmöglich (gemessen 24.7.2026, aufloesen.ts). set.ts importierte die Funktion
// zunächst direkt aus check.ts; das lud den CLI-Block als Nebenwirkung mit,
// las cwd-relativ ein FREMDES ROADMAP.md, druckte dessen Regel-11-Befunde und
// beendete den `plan:set`-Prozess vorzeitig mit `process.exit(1)` — gemessen
// beim Beleg-Testlauf dieses Fixes (5.8.2026, Scratch-ROADMAP ohne fahrplaene/).
// Reiner Funktions-Import darf NIE eine ganze Pipeline mitstarten.
export function obersterMarkerId(md: string): string | null {
  const obersterZeile = md.split(/\r?\n/).find((z) => z.includes('⬆ OBERSTER OFFENER SCHRITT'));
  if (!obersterZeile) return null;
  const nachMarker = obersterZeile.slice(obersterZeile.indexOf('⬆ OBERSTER OFFENER SCHRITT'));
  return nachMarker.match(/`([^`]+)`/)?.[1] ?? null;
}
