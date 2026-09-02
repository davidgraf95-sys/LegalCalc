// scripts/feed-generieren.ts
// QS-VERWENDEN V5: CLI-Läufer — liest Register + Manifest, schreibt
// public/feed/erlasse.xml. Die reine Bau-Funktion (Filter/Sortierung/XML)
// steht in scripts/feed-xml.ts (dort getestet, s. feed-generieren.test.ts).
//
// `daten-manifest.json` ist die COMMITTETE, vom Tor `check:datenhaltung` gegen
// den Ingest verifizierte Zusicherung, dass genau der aktuelle Registerstand
// tatsächlich in den Ziel-Tabellen angekommen ist (E1, s. scripts/datenhaltung/
// turso-sync.ts Quell-Riegel). Dieser Läufer bricht ab, wenn die Datei fehlt —
// sonst bewiese der Feed einen Registerstand, den niemand gegen die Daten
// geprüft hat. Sein INHALT (Tabellen-shas) fliesst NICHT in die Ausgabe ein:
// jeder Erlass trägt im Register bereits sein eigenes `stand`-Datum, ein
// zweiter Tabellen-Hash wäre eine redundante zweite Uhr (§5).
//
//   npm run gen:feed   erzeugt/überschreibt public/feed/erlasse.xml
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baueFeedXml } from './feed-xml.ts';
import type { BrowseManifest } from '../src/lib/normtext/browse-typen.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTER_PFAD = resolve(wurzel, 'public/normtext/register.json');
const MANIFEST_PFAD = resolve(wurzel, 'daten-manifest.json');
const ZIEL = resolve(wurzel, 'public/feed/erlasse.xml');

if (!existsSync(MANIFEST_PFAD)) {
  console.error(
    `gen:feed: ${MANIFEST_PFAD} fehlt — zuerst \`npm run datenhaltung:build\` fahren ` +
      '(der Feed bezeugt sonst einen Registerstand, den niemand gegen die Daten geprüft hat).',
  );
  process.exit(1);
}

const register = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as BrowseManifest;
let xml: string;
try {
  xml = baueFeedXml(register.erlasse);
} catch (err) {
  console.error(`gen:feed: ${(err as Error).message}`);
  process.exit(1);
}
writeFileSync(ZIEL, xml, 'utf8');
console.log(`gen:feed: ${ZIEL} geschrieben (${xml.match(/<entry>/g)?.length ?? 0} Einträge).`);
