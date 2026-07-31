// scripts/plan/parse.ts
import { parseEtikett, type Etikett } from './etikett';

export type Checkbox = '[ ]' | '[x]' | '[~]' | '[d]' | null;
export interface Einheit {
  id: string;
  etikett: Etikett;
  checkbox: Checkbox;
  sektion: string;
  /** 0-basierte Position in der ROADMAP-Dokumentreihenfolge = die Bau-Reihenfolge.
   *  Ohne dieses Feld sortiert next.ts lexikografisch und macht damit alle
   *  ready-Einheiten gleichrangig — «oberster offener Schritt» wird unbeantwortbar. */
  pos: number;
}

/** Erlaubte Kombinationen Checkbox × Status — die EINE Quelle (§5). check.ts
 *  Regel 2 prüft damit die Kopplung, set.ts entscheidet damit, ob der
 *  Checkbox-Nachzug überhaupt greifen muss. Lag bis 31.7.2026 nur in check.ts;
 *  set.ts führte mit CHECKBOX_FUER eine zweite, unvollständige Wahrheit
 *  (Fund R2-9/R2-15: der Legenden-Marker `[d]` ging beim Setzen still verloren). */
export const CHECKBOX_STATUS: Record<string, string[]> = {
  '[x]': ['done'],
  '[~]': ['wip'],
  '[ ]': ['ready', 'blocked', 'parked'],
  '[d]': ['parked', 'blocked'], // Legenden-Status «geparkt/zurückgestellt» — nie auf ready/wip/done
};

/** Listen-Bullet (auch im Blockquote), mit oder ohne Checkbox. */
export const BULLET_RE = /^[ \t]*(?:>[ \t]*)*[-*+][ \t]/;
/** Listen-Bullet MIT Checkbox — die Zeichenklasse spiegelt CHECKBOX_STATUS. */
export const CHECKBOX_RE = /^[ \t]*(?:>[ \t]*)*[-*+][ \t]*\[([ xX~Dd])\]/;

export function checkboxAus(zeile: string): Checkbox {
  const m = zeile.match(CHECKBOX_RE);
  return m ? (`[${m[1].toLowerCase()}]` as Checkbox) : null;
}

/** Einrückung einer Bullet-Zeile in Zeichen (Blockquote-Präfix zählt mit). */
export function bulletEinzug(zeile: string): number {
  return zeile.match(/^[ \t]*(?:>[ \t]*)*/)![0].length;
}

/**
 * Bindet die Checkbox-Zeile an ein @meta.
 *
 * Fund R2-1/R2-10 der QS-TOK-Endprüfung (31.7.2026, KRITISCH): Die frühere Regel
 * las die Checkbox aus der «nächsten nicht-leeren Zeile DARÜBER» und brach dort
 * ab. Steht zwischen Bullet und @meta auch nur EINE Prosa-Zeile — im Bestand bei
 * `W2·17-UI-BEFUNDE-B20` (5 Zeilen) und `W2·5g-ZEIT` (1 Zeile) —, blieb
 * `checkbox = null`. Da check.ts Regel 2 nur `if (e.checkbox && …)` prüft und
 * set.ts dieselbe Annahme spiegelte, schrieb `plan:set … status=done` das @meta,
 * liess die menschenlesbare Liste auf «offen» stehen, und KEIN Tor sah es (§6.7).
 *
 * Neue Regel: rückwärts bis zur ERSTEN Listen-Bullet-Zeile; deren Checkbox bindet
 * (trägt sie keine, bindet nichts — die Bullet gehört dann zu einer Liste ohne
 * Checkboxen, etwa dem Querschnitt-Band). Die «erste Bullet gewinnt»-Klausel ist
 * der Schutz gegen die Gegenrichtung: sonst bände ein checkbox-loser
 * Querschnitt-Eintrag an die Checkbox der darüberliegenden Nachbarliste.
 * Abbruch zusätzlich an Überschrift, Kommentar-Grenze (`<!--`/`-->`, damit auch
 * an einem fremden @meta) und an einer doppelten Leerzeile.
 */
export function bindeCheckbox(zeilen: string[], metaIdx: number): { checkbox: Checkbox; zeile: number | null } {
  let leerFolge = 0;
  for (let j = metaIdx - 1; j >= 0; j--) {
    const z = zeilen[j];
    if (z.trim() === '') {
      if (++leerFolge >= 2) break;
      continue;
    }
    leerFolge = 0;
    if (/^[ \t]*(?:>[ \t]*)*#{1,6}[ \t]/.test(z)) break; // Überschrift
    if (z.includes('<!--') || z.includes('-->')) break; // fremdes @meta / Kommentar-Grenze
    if (BULLET_RE.test(z)) {
      const cb = checkboxAus(z);
      return cb ? { checkbox: cb, zeile: j } : { checkbox: null, zeile: null };
    }
  }
  return { checkbox: null, zeile: null };
}

export function parseRoadmap(md: string): { einheiten: Einheit[]; blockers: Record<string, string>; queue: string[] } {
  const zeilen = md.split(/\r?\n/);
  const einheiten: Einheit[] = [];
  const blockers: Record<string, string> = {};
  /** `<!-- @queue: A, B, C -->` — die EINE maschinenlesbare Prioritäts-Quelle.
   *  Ohne sie behaupten Prosa-Dekrete eine Reihenfolge, die next.ts (pos-Sort)
   *  nie sieht — Befund 24.7.2026: vier gestapelte Dekrete, plan:next meldete
   *  einen Querschnitt-Schritt als «obersten». Integrität erzwingt check.ts Regel 8. */
  let queue: string[] = [];
  let sektion = '';
  let imBlockers = false;

  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    if (z.startsWith('## ')) {
      // Sektion = Überschriftstext ohne Marker/Emoji und ohne Tail (— … / *(…)*)
      sektion = z.replace(/^##+\s+/, '').replace(/^[⚡🚀▶■\s]+/u, '').replace(/\s+—.*$/, '').replace(/\s+\*.*$/, '').trim();
    }
    const qm = z.match(/<!--\s*@queue:\s*(.*?)\s*-->/);
    if (qm) {
      queue = qm[1].split(',').map((s) => s.trim()).filter(Boolean);
      continue;
    }
    if (z.trim().startsWith('<!-- @blockers')) {
      imBlockers = !z.includes('-->');
      if (!imBlockers) {
        const innen = z.replace(/.*<!--\s*@blockers/, '').replace(/-->.*/, '');
        for (const teil of innen.split(/[;\n]/)) {
          const bm = teil.match(/^\s*([^:]+):\s*(.+)$/);
          if (bm) blockers[bm[1].trim()] = bm[2].trim();
        }
      }
      continue;
    }
    if (imBlockers) {
      if (z.trim().startsWith('-->')) { imBlockers = false; continue; }
      const bm = z.match(/^\s*([^:]+):\s*(.*)$/);
      if (bm) blockers[bm[1].trim()] = bm[2].trim();
      continue;
    }
    if (z.includes('<!-- @meta')) {
      const etikett = parseEtikett(z);
      const { checkbox } = bindeCheckbox(zeilen, i);
      einheiten.push({ id: etikett.id, etikett, checkbox, sektion, pos: einheiten.length });
    }
  }
  return { einheiten, blockers, queue };
}
