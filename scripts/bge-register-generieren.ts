// ─── Rechtsprechungs-Register generieren (bibliothek/rechtsprechung/) ───────
//
// Erzeugt die geordnete Übersichtsliste (§11) aus dem Verifikations-Register
// (data/verifikation.ts, SSoT) + Code-Inventur: je Entscheid amtlicher Link
// (lib/bge.ts, Schema §7-verifiziert), Aussage, Fundorte im Code, Status.
// Meldet zudem LÜCKEN: zitierte Entscheide ohne Register-Eintrag.
//
// Aufruf: npx vite-node scripts/bge-register-generieren.ts > bibliothek/rechtsprechung/bge-register.md

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { VERIFIKATION } from '../src/data/verifikation';
import { rechtsprechungUrl, RECHTSPRECHUNG_IM_TEXT } from '../src/lib/bge';

const WURZEL = join(import.meta.dirname, '..');
const SRC = join(WURZEL, 'src');

// Alle ts/tsx-Dateien unter src/ (ohne Tests: Fundorte = produktiver Code)
function dateien(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'tests' ? [] : dateien(p);
    return /\.tsx?$/.test(name) ? [p] : [];
  });
}

// Zitat → normalisiert (ohne «BGer »-Präfix, für den Registry-Abgleich)
const normalisiere = (z: string) => z.replace(/^BGer\s+/, '').replace(/\s+/g, ' ').trim();

const fundorte = new Map<string, Set<string>>();
for (const datei of dateien(SRC)) {
  const text = readFileSync(datei, 'utf8');
  for (const m of text.matchAll(RECHTSPRECHUNG_IM_TEXT)) {
    const key = normalisiere(m[0]);
    if (!fundorte.has(key)) fundorte.set(key, new Set());
    fundorte.get(key)!.add(relative(WURZEL, datei));
  }
}

const registriert = new Map(
  Object.values(VERIFIKATION).map((e) => [normalisiere(e.aktenzeichen), e]),
);

const heute = process.env.STAND ?? new Date().toISOString().slice(0, 10);

// Das Datum der EMPIRISCHEN Link-Schema-Prüfung ist ein Faktum, kein «heute».
// Bis 3.8.2026 stand hier `heute` — jede Regeneration datierte damit eine
// Stichprobe um, die gar nicht neu gefahren wurde (§8: keine Behauptung ohne
// Beleg). Wer das Schema neu prüft, hebt diese Konstante von Hand.
const LINKSCHEMA_GEPRUEFT = '2026-06-10';
const zeilen: string[] = [];
const z = (s: string) => zeilen.push(s);

z(`# Rechtsprechungs-Register — alle zitierten Bundesgerichtsentscheide`);
z(``);
z(`Generiert: \`npx vite-node scripts/bge-register-generieren.ts\` · Stand ${heute}`);
z(``);
z(`**Quelle + Stand:** SSoT ist \`src/data/verifikation.ts\` (${Object.keys(VERIFIKATION).length} Einträge);`);
z(`Links deterministisch aus \`src/lib/bge.ts\`. **URL-Schemata empirisch verifiziert**`);
z(`(§7, WebFetch ${LINKSCHEMA_GEPRUEFT}): BGE → ATF-Permalink der amtlichen Sammlung (bger.ch, zeigt`);
z(`den Entscheid direkt; Stichprobe BGE 139 III 78); BGer-Urteile → Suchlink der`);
z(`amtlichen Urteilsdatenbank (Permalink bräuchte das Entscheiddatum; Stichproben`);
z(`5A_691/2023 und 4C.375/2000 je 1. Treffer).`);
z(``);
z(`**Regel (deterministisch):** \`BGE <Band> <Teil> <Seite>\` → \`atf://<Band>-<Teil>-<Seite>:de\``);
z(`auf der CLIR-Anzeige; \`<n><Code>[._]<Nr>/<Jahr>\` → AZA \`simple_query\`. Kein Treffer`);
z(`im Muster → bewusst KEIN Link (nie raten).`);
z(``);
z(`**Geltungsbereich/Pflege:** Anzeige-Verlinkung nur im Web (ErgebnisAnzeige);`);
z(`PDF/DOCX unverändert. Neue Zitate nur über das Verifikations-Register («kein`);
z(`Aktenzeichen im Code, das hier nicht registriert ist»).`);
z(``);
z(`**Abnahme-Status (drei Stufen, §8 — der echte Prüfungsstand):**`);
z(`Linkschema zweifach geprüft (Stichproben + Suite). Die Spalte Status zeigt:`);
z(``);
z(`- **zu verifizieren** — niemand hat den Entscheidtext gegen die Aussage gehalten.`);
z(`- **Quelle geprüft (…)** — eine Session hat den amtlichen Entscheidtext abgerufen`);
z(`  und belegt, DASS er die registrierte Aussage trägt (Fundstelle in Klammern,`);
z(`  \`quelleGeprueft\` im Register). Das ist die §7-Quellenprüfung, NICHT die Abnahme.`);
z(`- **verifiziert** — Davids fachliche Abnahme (\`verifiziert: true\`). Sie wird nie`);
z(`  automatisch gesetzt, auch nicht nach bestandener Quellenprüfung.`);
z(``);
z(`## Register (${registriert.size} Entscheide)`);
z(``);
z(`| Aktenzeichen | Aussage (Register) | Link | Fundorte (produktiver Code) | Status |`);
z(`|---|---|---|---|---|`);
for (const [key, e] of [...registriert.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'))) {
  const link = rechtsprechungUrl(e.aktenzeichen);
  const wo = [...(fundorte.get(key) ?? [])].sort().join(' · ') || '— (nur Register/Reserve)';
  const linkMd = link ? `[${link.direkt ? 'Entscheid' : 'Suche'}](${link.url})` : '—';
  const status = e.verifiziert
    ? 'verifiziert'
    : e.quelleGeprueft
      ? `Quelle geprüft (${e.quelleGeprueft.replace(/\|/g, '·')}) · fachliche Abnahme offen`
      : 'zu verifizieren';
  z(`| ${e.aktenzeichen} | ${e.aussage.replace(/\|/g, '·')} | ${linkMd} | ${wo} | ${status} |`);
}
z(``);

const luecken = [...fundorte.keys()].filter((k) => !registriert.has(k)).sort();
z(`## Lücken: im Code zitiert, aber NICHT im Verifikations-Register (${luecken.length})`);
z(``);
if (luecken.length === 0) {
  z(`Keine — jedes zitierte Aktenzeichen ist registriert.`);
} else {
  for (const k of luecken) {
    z(`- **${k}** — ${[...fundorte.get(k)!].sort().join(' · ')}`);
  }
  z(``);
  z(`→ Nachregistrieren in \`src/data/verifikation.ts\` (Aussage formulieren,`);
  z(`\`verifiziert: false\`), dann dieses Register neu generieren.`);
}
z(``);

console.log(zeilen.join('\n'));
