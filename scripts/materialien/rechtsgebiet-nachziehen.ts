// ─── Rechtsgebiet der generierten Materialien-Register nachziehen (W2-TRENNUNG) ──
//
// ANLASS (29.8.2026, Entscheid David «ja trennen»): Der Doppel-Topf
// `'sozial-abgaben'` ist in `'steuern'` und `'sozialversicherung'` zerlegt.
// `botschaften.generated.ts` und `vernehmlassungen.generated.ts` tragen das
// Rechtsgebiet als ABGELEITETES Feld — ihre eigenen Generatoren setzen es aus
// dem Erlass-Register (`primaer?.rechtsgebiet`, botschaften-generieren.ts
// Z. 144 ff. / vernehmlassungen-generieren.ts Z. 136 ff.). Mit der Trennung
// ändert sich diese Ableitung, ohne dass sich an den Materialien selbst etwas
// ändert.
//
// WARUM NICHT EINFACH DIE GENERATOREN LAUFEN LASSEN: die ziehen ihre Grundmenge
// live aus dem Fedlex-Gesetzgebungs-Graphen. Ein Netzlauf brächte gleichzeitig
// neue/verschwundene Vorlagen und geänderte Fristen ins Diff — die Trennung
// wäre dann nicht mehr von der Fedlex-Tagesfrische zu unterscheiden (§6:
// Verhaltensneutralität ist zu BEWEISEN). Dieses Skript rechnet darum
// OFFLINE — mit der IDENTISCHEN Ableitungsregel, aber ohne Netz — und rührt
// ausschliesslich das Feld `rechtsgebiet` an. Alle übrigen Felder bleiben
// byte-gleich; die Netz-Wächter (`check-botschaften-netz.ts`,
// `check-vernehmlassungen-netz.ts`) bleiben unberührt zuständig.
//
// HARTE INVARIANTE (§1/§5): Regel und Quelle sind dieselben wie im Generator —
// primärer normKey = kleinster `rang` (Tiebreak `key`) über die Schnittmenge
// von `normKeys` und der Bund-Volltext-Grundmenge; sein `rechtsgebiet` wird
// geerbt. Kein Eintrag wird «von Hand» eingeordnet (§2, kein Raten).
//
//   vite-node scripts/materialien/rechtsgebiet-nachziehen.ts              (DRY-RUN)
//   vite-node scripts/materialien/rechtsgebiet-nachziehen.ts -- --schreiben
//
import { readFileSync, writeFileSync } from 'node:fs';
import { grundmenge } from './botschaften-generieren.ts';
import type { Rechtsgebiet } from '../../src/lib/normtext/register-typen';

const schreiben = process.argv.slice(2).includes('--schreiben');

const metaNachKey = new Map(grundmenge().map((m) => [m.key, m]));

/** Generator-Regel, wörtlich nachgebildet: kleinster rang, Tiebreak key. */
function abgeleitetesGebiet(normKeys: string[], fallback: Rechtsgebiet): Rechtsgebiet {
  const primaer = [...normKeys].sort()
    .map((k) => metaNachKey.get(k))
    .filter((m): m is NonNullable<typeof m> => !!m)
    .sort((a, b) => a.rang - b.rang || (a.key < b.key ? -1 : 1))[0];
  return primaer?.rechtsgebiet ?? fallback;
}

/** Ein serialisierter Eintrag je Zeile — `key`, `rechtsgebiet` und `normKeys`
 *  stehen als Literale darin (die Generatoren schreiben eine Zeile je Eintrag). */
const RE_KEY = /\bkey:\s*"([^"]+)"/;
const RE_GEB = /\brechtsgebiet:\s*"([^"]+)"/;
const RE_NKEYS = /\bnormKeys:\s*\[([^\]]*)\]/;

function nachziehen(pfad: string, fallback: Rechtsgebiet) {
  const zeilen = readFileSync(pfad, 'utf8').split('\n');
  const wechsel: Array<{ key: string; alt: string; neu: string }> = [];
  let geprueft = 0;

  const neu = zeilen.map((z) => {
    const mk = RE_KEY.exec(z); const mg = RE_GEB.exec(z);
    if (!mk || !mg) return z;
    geprueft++;
    const nk = RE_NKEYS.exec(z);
    const keys = nk ? [...nk[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    const ziel = abgeleitetesGebiet(keys, fallback);
    if (ziel === mg[1]) return z;
    wechsel.push({ key: mk[1], alt: mg[1], neu: ziel });
    return z.replace(RE_GEB, `rechtsgebiet: "${ziel}"`);
  });

  console.log(`[rg-nachzug] ${pfad}: ${geprueft} Einträge geprüft, ${wechsel.length} Wechsel`);
  const proPaar: Record<string, number> = {};
  for (const w of wechsel) { const k = `${w.alt} → ${w.neu}`; proPaar[k] = (proPaar[k] ?? 0) + 1; }
  for (const [k, n] of Object.entries(proPaar).sort()) console.log(`             ${k}: ${n}`);
  for (const w of wechsel.slice(0, 8)) console.log(`             z.B. ${w.key}: ${w.alt} → ${w.neu}`);
  if (schreiben) writeFileSync(pfad, neu.join('\n'), 'utf8');
  return wechsel.length;
}

let n = 0;
n += nachziehen('src/lib/materialien/botschaften.generated.ts', 'privat');
n += nachziehen('src/lib/materialien/vernehmlassungen.generated.ts', 'oeffentlich');
console.log(`[rg-nachzug] gesamt ${n} Wechsel — ${schreiben ? 'GESCHRIEBEN' : 'DRY-RUN, nichts geschrieben'}.`);
