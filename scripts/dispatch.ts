// scripts/dispatch.ts — druckt den §0-Pflichtblock für Sub-Agenten-Aufträge.
//
// WARUM: Das Dispatch-Template hatte 6 Verweise im Repo, alle rein
// dokumentarisch — null Aufrufe in Code, Skripten, Hooks oder package.json.
// Ein Template, das man abtippen muss, wird nicht abgetippt. Dieser Generator
// macht es zu einem Kommando.
//
// Der Block wird AUS dem Template gelesen, nicht hier dupliziert (§5): so kann
// er nicht auseinanderlaufen. `check:dispatch-klausel` beweist, dass er da ist.
import { readFileSync } from 'node:fs';

export const TEMPLATE = 'docs/token-oekonomie/dispatch-template.md';

/** Liest den §0-Block aus dem einzigen ```text-Fence unterhalb der §0-Überschrift. */
export function pflichtKlausel(md: string): string {
  const ab = md.indexOf('## 0 · Pflicht-Klausel');
  if (ab < 0) throw new Error(`§0-Abschnitt fehlt in ${TEMPLATE}`);
  const start = md.indexOf('```text', ab);
  if (start < 0) throw new Error(`§0-Codeblock (\`\`\`text) fehlt in ${TEMPLATE}`);
  const von = md.indexOf('\n', start) + 1;
  const bis = md.indexOf('```', von);
  if (bis < 0) throw new Error(`§0-Codeblock nicht geschlossen in ${TEMPLATE}`);
  const block = md.slice(von, bis).trimEnd();
  if (!/^§0 PFLICHT-KLAUSEL/.test(block)) {
    throw new Error(`§0-Codeblock beginnt nicht mit der Klausel-Kopfzeile`);
  }
  return block;
}

/**
 * Modell-PALETTE — die EINZIGE Stelle im Repo, an der konkrete Modellnamen
 * für das Dispatch-Routing stehen (§5). Doku und Agent-Typen sprechen in
 * semantischen STUFEN; ändert sich die Modellfamilie, wird nur diese Tabelle
 * angepasst und `npm run dispatch:agents` neu gefahren (Tor: check:dispatch-
 * klausel Ebene C). Stufen-Semantik:
 *   spitze — stärkstes verfügbares Modell (Gegenprüfung Risikopfad, härtester Bau)
 *   stark  — Standard-Bau und Risikopfad-Bau (Minimum für beide)
 *   mittel — Recherche, Synthese, eng umrissener nicht-riskanter Bau
 *   klein  — deterministische Mechanik
 * Belegung Stand 4.8.2026 (Claude-5-Familie; Entscheid David 4.8.2026:
 * Gegenprüfung darf auf fable, nicht-riskanter Bau darf auf sonnet).
 */
export const PALETTE_STAND = '2026-08-04';
export const PALETTE: Record<'spitze' | 'stark' | 'mittel' | 'klein', string> = {
  spitze: 'fable',
  stark: 'opus',
  mittel: 'sonnet',
  klein: 'haiku',
};

/** Auftragsklassen-Zusatz: was diese Klasse ÜBER die Pflicht-Klausel hinaus braucht. */
export const KLASSEN: Record<string, string> = {
  bau: 'TABU: kein Merge, kein Deploy, keine Änderung an .claude/ oder CLAUDE.md.\nRÜCKGABE: geänderte Dateien (absolute Pfade) · Tor-Ergebnisse mit Exit-Code · offene Punkte.',
  pruefung: 'TABU: nichts ändern — nur lesen, messen, berichten.\nRÜCKGABE: Befund je Fundstelle (Datei:Zeile) · Beleg · Schweregrad · was du NICHT prüfen konntest.',
  recherche: 'TABU: kein Code, keine Repo-Änderung.\nRÜCKGABE: je Fakt Quelle + Stand + Link; ungedeckte Fragen ausdrücklich als offen markieren.',
  daten: 'RISIKOPFAD: Gegenprüfung ist Pflicht (Skill »gegenpruefung«), Merge ist gesperrt (check:merge-schutz).\nMANIFEST: Nach jedem Generator-Lauf `npm run datenhaltung:manifest` mitregenerieren — F2b-Vorfall 4.8.2026: #425 landete mit Manifest-Drift, #430 musste heilen.\nRÜCKGABE: Stichprobe n≥10 mit Identitätsbeleg gegen die Amtsquelle + Trefferquote.',
  mechanisch: 'NUR deterministische, per Byte-Diff oder Test maschinell prüfbare Transformation. Verschachtelte Steuer-Strukturen (@meta-Blöcke, Checkbox-Hierarchien) sind KEINE Mechanik — abbrechen und melden statt raten (Vorfall 4.8.2026). Verschiebe-Aufträge nur mit isolation: worktree; Cut und Paste im SELBEN Commit.\nRÜCKGABE: Pfade + Zeilen-/Byte-Delta + Prüfweg (Diff/Test), nichts Weiteres.',
  synthese: 'Steuer-Doku: dieser Text lenkt Folge-Sessions. Ehrlich, mit Provenienz (Datum, Anlass, Beleg); Pointer auf den Platte-Zustand statt Detailspeicher; keine Erfolgs-Prosa ohne prüfbares Artefakt.\nRÜCKGABE: der Text selbst + betroffene Pfade.',
};

/**
 * Reine Text-Erzeugung (testbar, ohne Prozess-Seiteneffekte).
 * @throws wenn die Klasse unbekannt ist — der Aufrufer entscheidet über den Exit.
 */
export function dispatchText(klasse: string, md: string): string {
  if (!(klasse in KLASSEN)) {
    throw new Error(`Unbekannte Auftragsklasse '${klasse}'. Bekannt: ${Object.keys(KLASSEN).join(' | ')}`);
  }
  return `${pflichtKlausel(md)}\n\n${KLASSEN[klasse]}`;
}

/** Marker, an dem Hook und Tor den eingebauten §0-Block wiedererkennen. */
export const KLAUSEL_MARKER = '§0 PFLICHT-KLAUSEL';

export function templateLesen(): string {
  return readFileSync(TEMPLATE, 'utf8');
}
