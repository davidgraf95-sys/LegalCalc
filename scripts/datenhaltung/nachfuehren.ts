// scripts/datenhaltung/nachfuehren.ts
// QS-BASIS (d) K5 — die EINE Kette nach einem Korpus-Import.
//
// DAS PROBLEM, das dieses Script löst. Nach einem Import (Kanton zumal) sind vier
// Schritte nötig, und sie stehen bisher nur in Köpfen und Commit-Messages:
//   1. daten/*.db neu bauen           (datenhaltung:build)
//   2. Manifest mitziehen             (datenhaltung:manifest)
//   3. HOT-Replika nachziehen         (datenhaltung:turso-sync)
//   4. Frische der Replika prüfen     (check:turso-frische)
// Wird Schritt 3 vergessen, liefert die Edge-Suche weiter den ALTEN Korpus, während
// die prerenderten Seiten und der statische Index bereits den neuen zeigen. Der
// Nutzer sieht dann einen Erlass, den die Suche nicht kennt — und nichts wird rot.
//
// SEIT K1/K2 WIEGT DAS SCHWERER. Vorher war der Edge-Weg ein Zusatz zum statischen
// Index; seit der Recall- und Ranking-Parität ist er der gleichwertige Weg für die
// 30 709 kantonalen Artikel. Eine veraltete Replika ist damit keine Verzögerung
// mehr, sondern eine falsche Auskunft.
//
// EHRLICHES ÜBERSPRINGEN (§8). Ohne Turso-Token laufen die Schritte 1+2 normal, 3+4
// werden ÜBERSPRUNGEN — aber laut und mit Nennung dessen, was offen bleibt. Das
// Script endet dann trotzdem mit 0: CI und jede Maschine ohne Token sollen die
// Kette fahren können. «Nicht geprüft» wird ausgesprochen, nie als «in Ordnung»
// verkleidet — dieselbe Linie, die check:turso-frische schon zieht.
//
//   npm run datenhaltung:nachfuehren            volle Kette
//   npm run datenhaltung:nachfuehren -- --pruefen   nur prüfen, nichts schreiben
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const TOKEN_DATEI = 'daten/turso-token.txt';

/** Token wie in turso-sync.ts/check-turso-frische.ts: Env ODER lokale Datei. */
function hatToken(): boolean {
  if ((process.env.TURSO_AUTH_TOKEN ?? '').trim()) return true;
  return existsSync(TOKEN_DATEI) && readFileSync(TOKEN_DATEI, 'utf8').trim().length > 0;
}

const nurPruefen = process.argv.includes('--pruefen');

interface Schritt {
  name: string;
  skript: string;
  /** Schreibt dieser Schritt? (Im --pruefen-Lauf übersprungen.) */
  schreibt: boolean;
  /** Braucht dieser Schritt den Turso-Token? */
  braucht: 'token' | null;
}

const KETTE: Schritt[] = [
  { name: 'DB-Artefakte bauen', skript: 'datenhaltung:build', schreibt: true, braucht: null },
  { name: 'Manifest mitziehen', skript: 'datenhaltung:manifest', schreibt: true, braucht: null },
  { name: 'HOT-Replika nachziehen', skript: 'datenhaltung:turso-sync', schreibt: true, braucht: 'token' },
  { name: 'Frische der Replika prüfen', skript: 'check:turso-frische', schreibt: false, braucht: 'token' },
];

function lauf(skript: string): number {
  // `npm run` statt direktem vite-node: die Skript-Definition bleibt an EINER Stelle
  // (package.json), sonst driften Aufrufweg und Kette auseinander (§5).
  const r = spawnSync('npm', ['run', skript], { stdio: 'inherit', shell: false });
  return r.status ?? 1;
}

const token = hatToken();
const uebersprungen: string[] = [];

console.log(
  `datenhaltung:nachfuehren — ${KETTE.length}er-Kette${nurPruefen ? ' (NUR PRÜFEN)' : ''}, ` +
    `Turso-Token ${token ? 'vorhanden' : 'FEHLT'}.`,
);

for (const [i, s] of KETTE.entries()) {
  const nr = `[${i + 1}/${KETTE.length}]`;
  if (s.braucht === 'token' && !token) {
    uebersprungen.push(`${s.skript} (${s.name})`);
    console.log(`${nr} ${s.name} — ÜBERSPRUNGEN (kein TURSO_AUTH_TOKEN).`);
    continue;
  }
  if (nurPruefen && s.schreibt) {
    uebersprungen.push(`${s.skript} (${s.name}, schreibend)`);
    console.log(`${nr} ${s.name} — ÜBERSPRUNGEN (--pruefen).`);
    continue;
  }
  console.log(`${nr} ${s.name} — npm run ${s.skript}`);
  const code = lauf(s.skript);
  if (code !== 0) {
    // ABBRUCH statt Weiterlaufen: ein Sync auf eine halb gebaute DB stellt einen
    // falschen Index live. Die Kette ist eine Reihenfolge, keine Wunschliste.
    console.error(
      `\ndatenhaltung:nachfuehren ROT: «${s.skript}» endete mit ${code}. ` +
        'Kette abgebrochen — die folgenden Schritte liefen NICHT.',
    );
    process.exit(code);
  }
}

if (uebersprungen.length === 0) {
  console.log('\ndatenhaltung:nachfuehren grün: Kette vollständig durchlaufen, Replika geprüft.');
  process.exit(0);
}

// Der Kern von K5: was NICHT lief, steht am Ende ausgeschrieben — mit dem Befehl,
// der es nachholt. Eine Kette, die stillschweigend die Hälfte auslässt, wäre
// schlimmer als gar keine: sie erzeugt das Gefühl, fertig zu sein.
console.log('\ndatenhaltung:nachfuehren: Kette TEILWEISE gelaufen. Offen geblieben:');
for (const u of uebersprungen) console.log(`  · ${u}`);
if (!token) {
  console.log(
    '\nDie HOT-Replika ist damit NICHT nachgezogen. Solange das offen ist, kann die\n' +
      'Edge-Suche einen älteren Korpus liefern als die ausgelieferten Seiten — seit der\n' +
      'Recall-/Ranking-Parität (QS-BASIS (d) K1/K2) betrifft das die kantonalen Artikel\n' +
      'in vollem Umfang.\n\n' +
      'Nachholen auf einer Maschine MIT Token:\n' +
      `  export TURSO_AUTH_TOKEN=…   (oder ${TOKEN_DATEI} anlegen)\n` +
      '  npm run datenhaltung:nachfuehren\n' +
      'Oder den Workflow «Turso-Serving-Sync» per workflow_dispatch anstossen.',
  );
}
process.exit(0);
