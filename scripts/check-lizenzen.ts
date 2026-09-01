// scripts/check-lizenzen.ts — Lizenz-Tor (QS-VERWENDEN V1).
//
// Prüft ALLE installierten Abhängigkeiten (prod UND dev, `npm ls --all
// --json --long`) gegen eine Allowlist permissiver Lizenzen. Copyleft
// (LGPL/GPL/AGPL/CPAL/SSPL), fehlende oder unbekannte Lizenzangaben
// (NOASSERTION) sind ROT — Verstösse gegen §URG-Leitbild («nur amtliche und
// urheberrechtsfreie Quellen») sollen nicht erst beim Vertrieb auffallen.
// MPL-2.0 (file-level Copyleft, in der Praxis bei Bibliotheken unkritisch)
// ist GELB — Warnung, kein Baustopp.
//
// SPDX-Ausdrücke: `OR` ist erlaubt, wenn EINE Alternative erlaubt ist; `AND`
// nur, wenn ALLE Teile erlaubt sind. Verschachtelte Klammern werden nur eine
// Ebene tief aufgelöst — reicht für alle real vorkommenden Ausdrücke im
// Bestand (verifiziert 2.9.2026: keine Doppel-Klammerung im Baum).
//
// Ausnahmen: `scripts/lizenzen-ausnahmen.json` (optional) — nur für Pakete,
// die HEUTE schon rot sind UND bereits in Betrieb sind (nie vorsorglich).
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ALLOWLIST = new Set(
  [
    'MIT',
    'Apache-2.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'ISC',
    '0BSD',
    'CC0-1.0',
    'Unlicense',
    'Python-2.0',
    'BlueOak-1.0.0',
    'CC-BY-4.0',
    'CC-BY-3.0',
    'OFL-1.1',
    'Zlib',
  ].map((l) => l.toLowerCase()),
);
const WARN_LIZENZ = 'mpl-2.0';

type Klasse = 'gruen' | 'warn' | 'rot';

type NpmDep = {
  version?: string;
  license?: string;
  licenses?: Array<{ type?: string }>;
  missing?: boolean;
  dependencies?: Record<string, NpmDep>;
};

type Ausnahme = { paket: string; grund: string; datum: string };

/** Klammern eine Ebene tief entfernen, wenn sie den ganzen Ausdruck umschliessen. */
function entklammern(s: string): string {
  s = s.trim();
  if (s.startsWith('(') && s.endsWith(')')) {
    // Nur entfernen, wenn die öffnende Klammer zur schliessenden gehört
    // (kein "(A) OR (B)"-Fall, der hier fälschlich verschmelzen würde).
    let tiefe = 0;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === '(') tiefe++;
      else if (s[i] === ')') tiefe--;
      if (tiefe === 0) return s; // schliesst vor dem Ende → nicht umschliessend
    }
    return entklammern(s.slice(1, -1));
  }
  return s;
}

function klassifiziereLeaf(lizenz: string): Klasse {
  const l = entklammern(lizenz).trim().toLowerCase();
  if (ALLOWLIST.has(l)) return 'gruen';
  if (l === WARN_LIZENZ) return 'warn';
  return 'rot';
}

/** Schlimmste Klasse gewinnt (rot > warn > gruen). */
function schlimmer(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 0, warn: 1, rot: 2 };
  return rang[a] >= rang[b] ? a : b;
}
/** Beste Klasse gewinnt (gruen > warn > rot) — für OR. */
function besser(a: Klasse, b: Klasse): Klasse {
  const rang: Record<Klasse, number> = { gruen: 2, warn: 1, rot: 0 };
  return rang[a] >= rang[b] ? a : b;
}

/** SPDX-Ausdruck klassifizieren: AND = alle erlaubt, OR = eine Alternative reicht. */
function klassifiziereAusdruck(ausdruck: string): Klasse {
  const s = entklammern(ausdruck);
  if (/ or /i.test(s)) {
    return s
      .split(/ or /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(besser);
  }
  if (/ and /i.test(s)) {
    return s
      .split(/ and /i)
      .map((teil) => klassifiziereAusdruck(teil))
      .reduce(schlimmer);
  }
  return klassifiziereLeaf(s);
}

/** Lizenz-Rohtext aus `license` (neu) oder `licenses[]` (alt) extrahieren. */
function lizenzText(dep: NpmDep): string {
  if (dep.license && dep.license.trim()) return dep.license.trim();
  if (dep.licenses && dep.licenses.length) {
    const typen = dep.licenses.map((l) => l.type).filter(Boolean) as string[];
    if (typen.length) return typen.join(' OR ');
  }
  return '';
}

type Fund = { key: string; lizenz: string; klasse: Klasse; pfad: string };

function baumDurchlaufen(
  knoten: NpmDep,
  name: string,
  vorfahren: string[],
  gesehen: Map<string, Fund>,
): void {
  const eigenerPfad = [...vorfahren, name];
  for (const [kindName, kind] of Object.entries(knoten.dependencies ?? {})) {
    if (!kind || kind.missing || !kind.version) continue; // unerfüllte peerDependency etc.
    const key = `${kindName}@${kind.version}`;
    if (!gesehen.has(key)) {
      const lizenz = lizenzText(kind) || 'NOASSERTION';
      const klasse = klassifiziereAusdruck(lizenz);
      gesehen.set(key, { key, lizenz, klasse, pfad: [...eigenerPfad, kindName].join(' > ') });
    }
    baumDurchlaufen(kind, kindName, eigenerPfad, gesehen);
  }
}

function ausnahmenLaden(): Map<string, Ausnahme> {
  const pfad = 'scripts/lizenzen-ausnahmen.json';
  const karte = new Map<string, Ausnahme>();
  if (!existsSync(pfad)) return karte;
  const liste = JSON.parse(readFileSync(pfad, 'utf8')) as Ausnahme[];
  for (const e of liste) karte.set(e.paket, e);
  return karte;
}

function main(): void {
  const roh = execFileSync('npm', ['ls', '--all', '--json', '--long'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const baum = JSON.parse(roh) as NpmDep & { name?: string };
  const gesehen = new Map<string, Fund>();
  baumDurchlaufen(baum, baum.name ?? 'lexmetrik', [], gesehen);

  const ausnahmen = ausnahmenLaden();
  const gruen: Fund[] = [];
  const warn: Fund[] = [];
  const rot: Fund[] = [];
  const alsAusnahmeFreigegeben: Fund[] = [];

  for (const fund of gesehen.values()) {
    if (fund.klasse === 'gruen') gruen.push(fund);
    else if (fund.klasse === 'warn') warn.push(fund);
    else if (ausnahmen.has(fund.key)) alsAusnahmeFreigegeben.push(fund);
    else rot.push(fund);
  }

  console.log(`Lizenz-Tor: ${gesehen.size} Pakete geprüft (prod + dev, transitiv).`);
  console.log(`  gruen (erlaubt):         ${gruen.length}`);
  console.log(`  gelb  (MPL-2.0, Warnung): ${warn.length}`);
  for (const f of warn) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);
  console.log(`  Ausnahme (rot, freigegeben): ${alsAusnahmeFreigegeben.length}`);
  for (const f of alsAusnahmeFreigegeben) {
    const a = ausnahmen.get(f.key)!;
    console.log(`    - ${f.key} [${f.lizenz}] — ${a.grund} (${a.datum})`);
  }
  console.log(`  ROT (Copyleft/NOASSERTION/unbekannt): ${rot.length}`);
  for (const f of rot) console.log(`    - ${f.key} [${f.lizenz}] via ${f.pfad}`);

  if (rot.length > 0) {
    console.error(
      `\nFEHLER: ${rot.length} Paket(e) mit nicht erlaubter Lizenz.\n` +
        `→ Bei bereits produktiv genutztem Paket: begründete Ausnahme in ` +
        `scripts/lizenzen-ausnahmen.json anlegen (Paket, Grund, Datum) und ` +
        `David informieren — nie automatisch.`,
    );
    process.exit(1);
  }
  console.log('\nok  Lizenz-Tor grün.');
}

main();
