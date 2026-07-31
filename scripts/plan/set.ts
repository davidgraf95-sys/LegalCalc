// scripts/plan/set.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEtikett, serializeEtikett } from './etikett';
import { bindeCheckbox, checkboxAus, CHECKBOX_STATUS } from './parse';

const FELDER = new Set(['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'seq-hart', 'seq-weich', 'worktree', '26x', 'fahrplan', 'slot']);
// Marke, die ein Statuswechsel setzt, WENN die bestehende nicht schon passt.
// `parked`/`blocked` ergänzt 31.7.2026 (Fund R2-9/R2-15): vorher griff dort der
// Fallback `'[ ]'` und löschte die Legendenmarke `[d]` still.
const CHECKBOX_FUER: Record<string, string> = { done: '[x]', wip: '[~]', parked: '[d]', blocked: '[d]' };
const CHECKBOX_ERSATZ_RE = /([-*+][ \t]*)\[[ xX~dD]\]/;

export function setField(md: string, id: string, feld: string, wert: string): string {
  if (!FELDER.has(feld)) throw new Error(`Unbekanntes Feld "${feld}"`);
  const zeilen = md.split('\n');
  const idx = zeilen.findIndex((z) => z.includes('<!-- @meta') && parseEtikett(z).id === id);
  if (idx < 0) throw new Error(`Schritt-id "${id}" nicht gefunden`);

  // Zeile normalisieren (kanonische Feld-Reihenfolge), dann das eine Feld ersetzen.
  const indent = zeilen[idx].match(/^([ \t]*(?:>[ \t]*)*)/)![1];
  const normalisiert = serializeEtikett(parseEtikett(zeilen[idx]), indent);
  let ersetzt = normalisiert.replace(new RegExp(`(\\b${feld}): .*?(?= ·| -->)`), (_m, g1) => `${g1}: ${wert}`);
  // Fehlt ein OPTIONALES Feld (`fahrplan`, `slot`, `seq-hart`, `seq-weich`), trifft
  // die Regex nichts — bis 31.7.2026 blieb die Zeile dann unverändert, und die CLI
  // meldete trotzdem «gesetzt: …». Ein Werkzeug, das seinen Nicht-Erfolg als Erfolg
  // meldet, ist dieselbe Fehlerklasse wie die Funde dieser Runde. Darum anhängen:
  // parseEtikett liest reihenfolge-unabhängig, serializeEtikett stellt die
  // kanonische Position her.
  if (ersetzt === normalisiert) ersetzt = normalisiert.replace(/ -->$/, ` · ${feld}: ${wert} -->`);
  const neu = parseEtikett(ersetzt); // validiert den neuen Wert (wirft bei ungültig)
  zeilen[idx] = serializeEtikett(neu, indent);

  if (feld === 'status') {
    // Fund 27 der QS-TOK-Endprüfung (31.7.2026): Die Zeichenklasse kannte nur
    // `[ ]`, `[x]`, `[~]` — der Legenden-Status `[d]`/`[D]` («geparkt/zurück-
    // gestellt», CHECKBOX_STATUS) fehlte. `plan:set <geparkt> status=ready`
    // setzte darum das @meta, liess die Checkbox aber auf `[d]` stehen und machte
    // `check:plan` — Pflichtglied von `npm run gate` — beim Entparken rot.
    //
    // Fund R2-1/R2-10 (Runde 2): Die Suche nach der Checkbox teilt sich jetzt die
    // EINE Implementierung mit parse.ts (`bindeCheckbox`) — die frühere Kopie hier
    // brach wie parse.ts an der ersten nicht-leeren Zeile ab und liess die Checkbox
    // bei B20/W2·5g-ZEIT unangetastet. Zwei Kopien derselben Nachbarschafts-Regel
    // wären zwei Wahrheiten (§5); auseinanderlaufen können sie nur still.
    //
    // Fund R2-9/R2-15 (Runde 2): Der Nachzug greift NUR, wenn die bestehende Marke
    // nicht schon zum neuen Status passt. `[d]` + parked/blocked bleibt damit
    // `[d]` (bzw. `[D]`), `[ ]` + parked bleibt `[ ]` — vorher überschrieb der
    // Fallback beides mit `[ ]` und löschte die Legendenmarke unwiederbringlich.
    const { zeile: cbIdx } = bindeCheckbox(zeilen, idx);
    if (cbIdx !== null) {
      const bestehend = checkboxAus(zeilen[cbIdx])!;
      if (!CHECKBOX_STATUS[bestehend].includes(neu.status)) {
        const cb = CHECKBOX_FUER[neu.status] ?? '[ ]';
        zeilen[cbIdx] = zeilen[cbIdx].replace(CHECKBOX_ERSATZ_RE, `$1${cb}`);
      }
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
