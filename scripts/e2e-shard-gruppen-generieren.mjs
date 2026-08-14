#!/usr/bin/env node
// ─── e2e-Shard-Gruppen generieren: Wurzel-Fix für den Merge-Konflikt-Hotspot ──
// (QS-E2E-SHARD-GEN, fahrplaene/FAHRPLAN-LERNPHASE-2026.md §3.5). Anlass:
// `e2e/shard-gruppen.json` war 5 von 6 Nachzieh-Konflikten der seriellen
// Landung vom 4.8.2026, weil jeder PR mit neuer Spec dieselbe Gruppen-Liste
// editierte. Fix: die Gruppen-Zuordnung wandert als Kopf-Annotation
// (`// @shard-gruppe: N`, erste Zeile jeder `e2e/*.e2e.ts`-Datei) in die
// Spec-Datei selbst — Git-Konflikte auf verschiedenen Specs treffen dann nie
// mehr dieselbe Zeile. `e2e/shard-gruppen.json` ist ab jetzt eine REINE
// Projektion dieser Annotationen (§5 Single Source of Truth: die Annotation
// ist die eine Quelle, die JSON nie von Hand editieren) und trägt
// `merge=regen` in .gitattributes — bei einem lokalen Merge-Konflikt gewinnt
// automatisch die eigene Seite, DANACH macht dieser Generator die Datei
// wieder korrekt (das CI-Tor `check:e2e-shards` erzwingt den Neulauf).
//
// GRUPPEN-MITGLIEDSCHAFT (fachlich relevant, was der Union-Wächter prüft):
// ausschliesslich aus den `@shard-gruppe`-Annotationen. Eine Spec ohne
// Annotation lässt dieses Skript mit Exit 1 rot laufen (Wächter-Funktion vor
// dem eigentlichen Union-Wächter `e2e-shard-gruppen.mjs --pruefen`).
//
// REIHENFOLGE innerhalb einer Gruppe (rein kosmetisch, betrifft keine
// Zuordnung): die bestehende Reihenfolge aus der aktuellen JSON bleibt
// STABIL erhalten (kein Neu-Sortieren bei jedem Lauf — das würde bei jedem
// PR unnötige Diff-Zeilen erzeugen); neue Dateien einer Gruppe werden
// alphabetisch ans Gruppen-Ende angehängt. Der Freitext-Kommentar
// `_kommentar` ist Hand-Narrativ (Mess-Historie) und wird unverändert aus der
// bestehenden Datei übernommen — dieser Generator schreibt ihn nie selbst.
//
// Verwendung:
//   node scripts/e2e-shard-gruppen-generieren.mjs           schreibt e2e/shard-gruppen.json
//   node scripts/e2e-shard-gruppen-generieren.mjs --check   nur prüfen, kein Schreiben (Exit 1 bei Drift)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..')
const E2E_DIR = join(WURZEL, 'e2e')
const GRUPPEN_JSON = join(WURZEL, 'e2e', 'shard-gruppen.json')

const ANNOTATION_RE = /^\/\/\s*@shard-gruppe:\s*(\d+)\s*$/

const DEFAULT_KOMMENTAR =
  'e2e-Shard-Balancing: Gruppen sind GENERIERT aus den `// @shard-gruppe:`-Kopf-' +
  'Annotationen in e2e/*.e2e.ts (npm run gen:e2e-shards, QS-E2E-SHARD-GEN). ' +
  'Diese Datei nie von Hand editieren — Neuzuordnung geschieht über die ' +
  'Annotation in der jeweiligen Spec-Datei, dann Generator neu laufen lassen. ' +
  'Union-Wächter: scripts/e2e-shard-gruppen.mjs --pruefen.'

/** Erste ~10 Zeilen einer Spec nach der Annotation absuchen. */
function annotationLesen(pfad) {
  const inhalt = readFileSync(pfad, 'utf8')
  const zeilen = inhalt.split('\n', 10)
  for (const z of zeilen) {
    const treffer = z.match(ANNOTATION_RE)
    if (treffer) return treffer[1]
  }
  return null
}

function alleSpecs() {
  return readdirSync(E2E_DIR)
    .filter((d) => d.endsWith('.e2e.ts'))
    .sort()
}

function altesJson() {
  if (!existsSync(GRUPPEN_JSON)) return null
  try {
    return JSON.parse(readFileSync(GRUPPEN_JSON, 'utf8'))
  } catch {
    return null
  }
}

function bauen() {
  const specs = alleSpecs()
  const gruppeVon = new Map()
  const fehlend = []

  for (const spec of specs) {
    const g = annotationLesen(join(E2E_DIR, spec))
    if (g === null) {
      fehlend.push(spec)
      continue
    }
    gruppeVon.set(spec, g)
  }

  if (fehlend.length) {
    console.error('✗ e2e-Shard-Generator ROT — Spec ohne `// @shard-gruppe: N`-Kopf-Annotation:')
    for (const f of fehlend) console.error(`   ${f}`)
    console.error('\n   Fix: Annotation als erste Zeile der Spec-Datei ergänzen, dann neu laufen lassen.')
    process.exit(1)
  }

  const alt = altesJson()
  const alteGruppen = alt?.gruppen ?? {}
  const gruppenNummern = [...new Set(gruppeVon.values())].sort((a, b) => Number(a) - Number(b))

  const gruppen = {}
  for (const g of gruppenNummern) {
    const bisherigeReihenfolge = Array.isArray(alteGruppen[g]) ? alteGruppen[g] : []
    const dieserGruppe = new Set([...gruppeVon.entries()].filter(([, v]) => v === g).map(([k]) => k))

    const erhalten = bisherigeReihenfolge.filter((f) => dieserGruppe.has(f))
    const neu = [...dieserGruppe].filter((f) => !bisherigeReihenfolge.includes(f)).sort()

    gruppen[g] = [...erhalten, ...neu]
  }

  const kommentar = typeof alt?._kommentar === 'string' ? alt._kommentar : DEFAULT_KOMMENTAR

  return { _kommentar: kommentar, gruppen }
}

function serialisieren(objekt) {
  return JSON.stringify(objekt, null, 1) + '\n'
}

function main() {
  const modus = process.argv[2]
  const neu = serialisieren(bauen())

  if (modus === '--check') {
    const jetzt = existsSync(GRUPPEN_JSON) ? readFileSync(GRUPPEN_JSON, 'utf8') : ''
    if (jetzt === neu) {
      console.log('✓ e2e/shard-gruppen.json ist aktuell (byte-gleich zur Generierung aus den Annotationen).')
      process.exit(0)
    }
    console.error('✗ e2e/shard-gruppen.json ist NICHT aktuell — Drift zur Generierung aus den Annotationen.')
    console.error('  Fix: npm run gen:e2e-shards')
    process.exit(1)
  }

  writeFileSync(GRUPPEN_JSON, neu)
  console.log(`✓ e2e/shard-gruppen.json generiert (${Object.keys(bauen().gruppen).length} Gruppen).`)
}

main()
