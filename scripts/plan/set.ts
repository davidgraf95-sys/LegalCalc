// scripts/plan/set.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEtikett, serializeEtikett } from './etikett';

const FELDER = new Set(['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x', 'fahrplan', 'slot']);
const CHECKBOX_FUER: Record<string, string> = { done: '[x]', wip: '[~]' };
// Alle in ROADMAP.md vorkommenden Checkbox-Marken — Spiegel von CHECKBOX_STATUS in
// scripts/plan/check.ts. `d`/`D` ist der Legenden-Status «geparkt/zurückgestellt».
const CHECKBOX_RE = /^\s*-\s*\[[ xX~dD]\]/;
const CHECKBOX_ERSATZ_RE = /(-\s*)\[[ xX~dD]\]/;

export function setField(md: string, id: string, feld: string, wert: string): string {
  if (!FELDER.has(feld)) throw new Error(`Unbekanntes Feld "${feld}"`);
  const zeilen = md.split('\n');
  const idx = zeilen.findIndex((z) => z.includes('<!-- @meta') && parseEtikett(z).id === id);
  if (idx < 0) throw new Error(`Schritt-id "${id}" nicht gefunden`);

  // Zeile normalisieren (kanonische Feld-Reihenfolge), dann das eine Feld ersetzen.
  const indent = zeilen[idx].match(/^([ \t]*(?:>[ \t]*)*)/)![1];
  const normalisiert = serializeEtikett(parseEtikett(zeilen[idx]), indent);
  const ersetzt = normalisiert.replace(new RegExp(`(\\b${feld}): .*?(?= ·| -->)`), (_m, g1) => `${g1}: ${wert}`);
  const neu = parseEtikett(ersetzt); // validiert den neuen Wert (wirft bei ungültig)
  zeilen[idx] = serializeEtikett(neu, indent);

  if (feld === 'status') {
    // Fund 27 der QS-TOK-Endprüfung (31.7.2026): Die Zeichenklasse kannte nur
    // `[ ]`, `[x]`, `[~]` — der Legenden-Status `[d]`/`[D]` («geparkt/zurück-
    // gestellt», check.ts CHECKBOX_STATUS) fehlte. `plan:set <geparkt> status=ready`
    // setzte darum das @meta, liess die Checkbox aber auf `[d]` stehen und machte
    // `check:plan` — Pflichtglied von `npm run gate` — beim Entparken rot.
    const cb = CHECKBOX_FUER[neu.status] ?? '[ ]';
    for (let j = idx - 1; j >= 0; j--) {
      if (zeilen[j].trim() === '') continue;
      if (CHECKBOX_RE.test(zeilen[j])) zeilen[j] = zeilen[j].replace(CHECKBOX_ERSATZ_RE, `$1${cb}`);
      break;
    }
    // Zweiter Halbsatz desselben Funds: `ready` mit gesetztem `blocker` ist nach
    // check.ts Regel 3 ein Problem. Wer entparkt, hat den Blocker aufgelöst — der
    // Eintrag im @blockers-Register bleibt als Beleg stehen, die Bindung fällt.
    if (neu.status === 'ready' && neu.blocker) {
      zeilen[idx] = serializeEtikett({ ...neu, blocker: null }, indent);
      console.error(`Hinweis: blocker "${neu.blocker}" bei ${id} mit entfernt (status ready duldet keinen blocker).`);
    }
  }
  return zeilen.join('\n');
}

// CLI: vite-node scripts/plan/set.ts -- <id> <feld>=<wert>
if (!process.env.VITEST) {
  const arg = process.argv.slice(2);
  const id = arg[0];
  const [feld, wert] = (arg[1] ?? '').split('=');
  if (!id || !feld || wert === undefined) {
    console.error('Aufruf: npm run plan:set -- <id> <feld>=<wert>');
    process.exit(2);
  }
  const out = setField(readFileSync('ROADMAP.md', 'utf8'), id, feld, wert);
  writeFileSync('ROADMAP.md', out);
  console.log(`gesetzt: ${id} ${feld}=${wert}`);
}
