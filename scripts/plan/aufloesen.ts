// scripts/plan/aufloesen.ts — resolve() nebenwirkungsfrei.
// Ausgelagert aus next.ts (24.7.2026), damit check.ts (Regel 8.4 prüft die Prosa
// gegen die echte plan:next-Ausgabe) resolve importieren kann, ohne dass der
// next-CLI-Block als Import-Nebenwirkung mitläuft (vite-node trägt den Skriptpfad
// nicht in argv — Entry-Erkennung dort ist unmöglich, gemessen 24.7.2026).
import { type Einheit } from './parse';

export interface Buckets {
  readyNow: string[];
  lanes: string[][];
  wartetDep: { id: string; offen: string[] }[];
  blockiert: { id: string; blocker: string }[];
  geparkt: string[];
  inArbeit: string[];
  wartet26xSlot: string[];
  slot26xBelegtVon: string | null;
  /** ready-Einheiten aus dem Querschnitt-Band: laufen begleitend, konkurrieren
   *  nie um den «obersten offenen Schritt» (ihre eigene Abschnitts-Überschrift
   *  sagt «kein Reihenfolge-Slot» — bis 24.7.2026 gewann trotzdem ein
   *  Querschnitt-Schritt die oberste Position, gegen zwei David-Dekrete). */
  begleitend: string[];
}

/** Präfix-Test statt Gleichheit: parse.ts schneidet den «— …»-Tail der Überschrift ab,
 *  aber Klammer-Zusätze wie «(läuft begleitend …)» bleiben Teil des Sektions-Strings. */
const QUERSCHNITT_PRAEFIX = 'Querschnitt-Band';

function kollBasis(p: string): string { return p.replace(/[*?{[].*$/, ''); }
function pfadUeberlappt(x: string, y: string): boolean {
  const a = kollBasis(x), b = kollBasis(y);
  if (a === '' || b === '' || a === b) return true;
  const [k, l] = a.length <= b.length ? [a, b] : [b, a];
  return l.startsWith(k) && (k.endsWith('/') || l[k.length] === '/');
}
function kollidiert(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return true;
  for (const x of a) for (const y of b) if (pfadUeberlappt(x, y)) return true;
  return false;
}

export function resolve(einheiten: Einheit[], queue: string[] = []): Buckets {
  // Dokumentreihenfolge = Bau-Reihenfolge. Vorher wurde lexikografisch nach ID
  // sortiert; damit waren alle ready-Einheiten gleichrangig und die Frage nach
  // dem «obersten offenen Schritt» (Ausführungs-Protokoll) nicht beantwortbar.
  const sortiert = [...einheiten].sort((a, b) => a.pos - b.pos);
  const done = new Set(sortiert.filter((e) => e.etikett.status === 'done').map((e) => e.id));
  const slot = sortiert.find((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  const slot26xBelegtVon = slot ? slot.id : null;
  // Der ausdrücklich etikettierte Slot-Inhaber (@meta `slot: inhaber`, von check.ts Regel 5b
  // auf höchstens EINEN erzwungen) hat Vorrang vor «erster ready-26×-Schritt in Dokument-
  // reihenfolge». Ohne diese Zeile meldete next.ts den Inhaber als «wartet auf 26×-Slot» —
  // also wartend auf den Slot, den er selbst hält — und liess statt seiner den erstbesten
  // anderen 26×-Schritt zu (Befund 20.7.2026 bei der Slot-Übergabe W2·6-DATA → W3·12).
  const inhaber26x = sortiert.find((e) => e.etikett.slot === 'inhaber')?.id ?? null;

  const readyNow: string[] = [];
  const wartetDep: { id: string; offen: string[] }[] = [];
  const blockiert: { id: string; blocker: string }[] = [];
  const geparkt: string[] = [];
  const inArbeit: string[] = [];
  const wartet26xSlot: string[] = [];
  const begleitend: string[] = [];
  let ready26xAdmitted = false;

  for (const e of sortiert) {
    const t = e.etikett;
    if (t.status === 'done') continue;
    if (t.status === 'wip') { inArbeit.push(e.id); continue; }
    if (t.status === 'parked') { geparkt.push(e.id); continue; }
    if (t.status === 'blocked') { blockiert.push({ id: e.id, blocker: t.blocker ?? '?' }); continue; }
    // status === 'ready'
    const offen = t.dep.filter((d) => !done.has(d));
    if (offen.length) { wartetDep.push({ id: e.id, offen }); continue; }
    // Querschnitt-Filter erst NACH dep: ein Querschnitt-Schritt mit offener
    // Voraussetzung gehört in wartetDep, nicht still in «begleitend»
    // (Verify-Befund 24.7.2026 — «begleitend» heisst «jetzt mitlaufbar»).
    // AUSNAHME (Entscheid David 8.8.2026, «Prozess geht grundsätzlich vor»):
    // Ein ausdrücklich in die @queue gestellter Querschnitt-Schritt steigt in
    // die Hauptreihenfolge auf — die @queue ist SSoT der Bau-Reihenfolge, und
    // ohne diese Ausnahme könnte sie Prozess-Schritten keinen Rang geben.
    if (e.sektion.startsWith(QUERSCHNITT_PRAEFIX) && !queue.includes(e.id)) { begleitend.push(e.id); continue; }
    if (t.asset26x && inhaber26x && e.id !== inhaber26x) { wartet26xSlot.push(e.id); continue; }
    if (t.asset26x && !inhaber26x && (slot26xBelegtVon || ready26xAdmitted)) { wartet26xSlot.push(e.id); continue; }
    if (t.asset26x) ready26xAdmitted = true;
    readyNow.push(e.id);
  }

  // @queue-Rang VOR der Lane-Bildung: gequeuete IDs führen in Queue-Reihenfolge,
  // alle übrigen behalten (stabiler Sort, Node ≥ 12) ihre pos-Ordnung dahinter.
  if (queue.length) {
    const qrang = new Map(queue.map((id, i) => [id, i]));
    readyNow.sort((a, b) => (qrang.get(a) ?? Infinity) - (qrang.get(b) ?? Infinity));
  }

  // Lanes: greedy lexikografisch. Konservativ: leere kollision = undeklariert =
  // kollidiert mit allem (eigene Lane); Globs/Verzeichnis-Präfixe zählen als Überlappung.
  const kollOf = new Map(sortiert.map((e) => [e.id, e.etikett.kollision]));
  const lanes: string[][] = [];
  for (const id of readyNow) {
    const meins = kollOf.get(id)!;
    let platziert = false;
    for (const lane of lanes) {
      if (!lane.some((other) => kollidiert(meins, kollOf.get(other)!))) { lane.push(id); platziert = true; break; }
    }
    if (!platziert) lanes.push([id]);
  }
  return { readyNow, lanes, wartetDep, blockiert, geparkt, inArbeit, wartet26xSlot, slot26xBelegtVon, begleitend };
}

