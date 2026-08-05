// scripts/plan/etikett.ts
export type Status = 'ready' | 'wip' | 'blocked' | 'done' | 'parked';
export const STATUS_WERTE: readonly Status[] = ['ready', 'wip', 'blocked', 'done', 'parked'];

/**
 * Geschätzter Bau-Umfang eines Schritts (Auftrag David 5.8.2026: «nicht zu grosse
 * oder kleine nehmen»). Bedeutung der drei Werte: Fahrplan-§ «Etikett — Feld
 * `groesse`» in `fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md`.
 *
 * Die Angabe ist eine **Heuristik und Steuerhilfe, nie ein Tor-Kriterium** — kein
 * `check:*` leitet aus ihr ein Verdikt ab, und ein Schritt ohne Feld ist zulässig
 * (er zeigt im Lagebild «Grösse ungeschätzt», statt dass der Renderer rät).
 */
export type Groesse = 'S' | 'M' | 'L';
export const GROESSE_WERTE: readonly Groesse[] = ['S', 'M', 'L'];
export function istGroesse(v: string | null): v is Groesse {
  return v !== null && (GROESSE_WERTE as readonly string[]).includes(v);
}

export interface Etikett {
  id: string;
  status: Status;
  statusAgent: string | null;
  of: boolean;
  blocker: string | null;
  dep: string[];
  kollision: string[];
  /** Harte Reihenfolge auf geteilten Dateien (§12) — «X muss VOR mir landen». */
  seqHart: string[];
  /** Weiche Reihenfolge-Empfehlung auf geteilten Dateien. */
  seqWeich: string[];
  worktree: boolean;
  asset26x: boolean;
  /**
   * Geschätzte Bau-Grösse, **roh** wie in der ROADMAP notiert; `null` = Feld fehlt.
   *
   * Bewusst `string | null` statt `Groesse | null`: `parseEtikett` wirft hier NICHT
   * bei unbekanntem Vokabular, anders als bei `status` und `slot`. Grund ist die
   * Rolle des Felds — es steuert nichts, es ist eine Lese-Hilfe. Ein Tippfehler
   * (`groesse: XL`) darf darum nicht die ganze Plan-Werkzeugkette lahmlegen
   * (`plan:next`, `plan:set`, `plan:bild` parsen alle dieselbe Zeile); er gehört als
   * EINE benannte Meldung ins Tor. Die Vokabular-Prüfung macht deshalb `check.ts`
   * Regel 12, und wer den Wert typisiert braucht, filtert mit `istGroesse()`.
   */
  groesse: string | null;
  fahrplan: string | null;
  slot?: 'inhaber' | null;
}

function ja(v: string): boolean {
  if (v === 'ja') return true;
  if (v === 'nein') return false;
  throw new Error(`@meta: erwartet ja/nein, bekam "${v}"`);
}
function liste(v: string): string[] {
  const innen = v.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  return innen === '' ? [] : innen.split(',').map((s) => s.trim()).filter(Boolean);
}
function nullbar(v: string): string | null {
  return v === 'null' ? null : v;
}

export function parseEtikett(line: string): Etikett {
  const m = line.match(/<!--\s*@meta\s+(.*?)\s*-->/);
  if (!m) throw new Error(`Keine @meta-Zeile: ${line}`);
  const feld: Record<string, string> = {};
  for (const teil of m[1].split(' · ')) {
    const i = teil.indexOf(': ');
    if (i < 0) throw new Error(`@meta: Feld ohne ': ' → "${teil}"`);
    feld[teil.slice(0, i).trim()] = teil.slice(i + 2).trim();
  }
  const sm = (feld.status ?? '').match(/^(\w+)(?:\((.*)\))?$/);
  if (!sm) throw new Error(`@meta: Status unlesbar "${feld.status}"`);
  const status = sm[1] as Status;
  if (!STATUS_WERTE.includes(status)) throw new Error(`@meta: ungültiger Status "${status}"`);
  const noetig = ['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x'];
  for (const k of noetig) if (!(k in feld)) throw new Error(`@meta: Feld "${k}" fehlt`);
  const slotRaw = 'slot' in feld ? feld.slot : null;
  if (slotRaw !== null && slotRaw !== 'inhaber') throw new Error(`@meta: slot nur "inhaber", bekam "${slotRaw}"`);
  return {
    id: feld.id,
    status,
    statusAgent: sm[2] || null,
    of: ja(feld.of),
    blocker: nullbar(feld.blocker),
    dep: liste(feld.dep),
    kollision: liste(feld.kollision),
    // Fund R2-16 (31.7.2026): `seq-hart`/`seq-weich` standen seit jeher in der
    // ROADMAP, waren dem Etikett-Typ aber unbekannt — serializeEtikett verwarf sie
    // beim Neu-Serialisieren, `plan:set` löschte sie also still mit. `seq-hart`
    // steuert die Kollisionsreihenfolge auf geteilten Dateien; sein Verlust kann
    // zwei Sessions auf dieselbe Datei laufen lassen (§12).
    seqHart: 'seq-hart' in feld ? liste(feld['seq-hart']) : [],
    seqWeich: 'seq-weich' in feld ? liste(feld['seq-weich']) : [],
    worktree: ja(feld.worktree),
    asset26x: ja(feld['26x']),
    groesse: 'groesse' in feld ? nullbar(feld.groesse) : null,
    fahrplan: 'fahrplan' in feld ? nullbar(feld.fahrplan) : null,
    slot: slotRaw as 'inhaber' | null,
  };
}

export function serializeEtikett(e: Etikett, indent: string): string {
  const st = e.statusAgent ? `${e.status}(${e.statusAgent})` : e.status;
  const teile = [
    `id: ${e.id}`,
    `status: ${st}`,
    `of: ${e.of ? 'ja' : 'nein'}`,
    `blocker: ${e.blocker ?? 'null'}`,
    `dep: [${e.dep.join(', ')}]`,
    `kollision: [${e.kollision.join(', ')}]`,
  ];
  // Position wie im Bestand: nach `kollision`, vor `worktree` — sonst ist der
  // Round-Trip nicht byte-gleich und jeder plan:set-Aufruf erzeugt Diff-Rauschen.
  if (e.seqHart.length) teile.push(`seq-hart: [${e.seqHart.join(', ')}]`);
  if (e.seqWeich.length) teile.push(`seq-weich: [${e.seqWeich.join(', ')}]`);
  teile.push(
    `worktree: ${e.worktree ? 'ja' : 'nein'}`,
    `26x: ${e.asset26x ? 'ja' : 'nein'}`,
  );
  // Position wie im Bestand der ROADMAP: nach `26x`, vor `fahrplan`. Wie bei
  // `seq-hart` gilt — falsche Position heisst nicht-byte-gleicher Round-Trip und
  // damit Diff-Rauschen bei jedem `plan:set`-Aufruf.
  if (e.groesse) teile.push(`groesse: ${e.groesse}`);
  if (e.fahrplan) teile.push(`fahrplan: ${e.fahrplan}`);
  if (e.slot) teile.push(`slot: ${e.slot}`);
  return `${indent}<!-- @meta ${teile.join(' · ')} -->`;
}
