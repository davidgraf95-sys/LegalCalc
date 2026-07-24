/**
 * check:verklebung — Tor gegen die Wort-Verklebungs-Klasse in Struktur-Titeln.
 *
 * DEFEKT-KLASSE (M12 / W2·5b): Fedlex bricht mehrzeilige Randtitel/Gliederungs-
 * Überschriften mit `<br>` um («Beginn der Wirkungen<br>eines unter<br>Abwesenden
 * <br>geschlossenen Vertrages»). Der Bund-Struktur-Extraktor (struktur-extrahiere.ts,
 * reinText) strippte Tags ERSATZLOS → die Wörter über der Zeilennaht verklebten
 * («… unterAbwesendengeschlossenen …»). Dieser Wächter scannt ALLE committeten
 * Struktur-Sidecars (Bund + Kanton) auf solche Nähte, damit der Defekt nie wieder
 * still verschifft wird (§6.7, §8).
 *
 * DREI DEFEKT-KLASSEN (B/C nach Gegenprüfung 24.7. ergänzt):
 *   A klein-GROSS  — Wortnaht ohne Leerzeichen («unterAbwesenden»).
 *   B Divis-Riss   — zerrissene Silbentrennung «X- y» (ausser hängendes Divis vor
 *                    Konjunktion «Hin- und Rückweg»); fing die Regression, die ein
 *                    pauschales <br>→Leerzeichen erzeugte («Adoptions- urlaub»).
 *   C Leer-Klammer — leeres Klammerpaar «( )» aus verlorenem Titeltext, wenn
 *                    kursiver Inhalt mit-gestrippt wurde («(Insurance Wrapper)» → «( )»).
 *
 * OFFLINE: liest nur die Artefakte unter public/normtext/struktur/**. Kein Netz,
 * kein /tmp-Cache. Fehlt/leert das Verzeichnis → LAUT rot (nie still grün, §6.7c).
 *
 * ── Heuristik ──────────────────────────────────────────────────────────────
 * Geprüft werden je Artikel die Gliederungs-Labels und die Marginalien (Randtitel).
 * NICHT der Erlass-Kopf/die Präambel (Fliesstext, kommt aus kopf-extrahiere.ts, das
 * die `<br>`→Leerzeichen-Wandlung bereits macht).
 *
 * Naht = klein-GROSS INNERHALB eines Tokens (`\p{Ll}\p{Lu}`, task-Vorgabe). Ein
 * roher `\p{Ll}\p{Lu}`-Scan meldet aber massenhaft ECHTE Akronyme mit («BankG»,
 * «StPO», «GwG», «SchKG», «IVöB»). Darum die ACRONYM-Binnenmuster-Ausnahme
 * (task-Auflage «Akronym-Binnenmuster bedenken»): eine Naht zählt nur, wenn der
 * Grossbuchstabe ein KLEINGESCHRIEBENES WORT ERÖFFNET, d.h. ihm ≥2 Kleinbuchstaben
 * folgen (`\p{Ll}\p{Lu}\p{Ll}{2}`). In «BankG»/«StPO»/«GwG» steht der Grossbuchstabe
 * am Token-Ende oder in einem Grossbuchstaben-Cluster — er eröffnet kein Wort und
 * fällt strukturell heraus, OHNE je in einer Ausnahme-Liste stehen zu müssen. Eine
 * verklebte zweite Wort-Hälfte («…Abwesenden», «…Vernichtung») hat dagegen immer
 * ≥2 Folge-Kleinbuchstaben → wird erfasst. So bleibt die Ausnahme-Liste KLEIN.
 *
 * GRENZE (ehrlich, §8): rein klein-klein verklebte Nähte («Wirkungeneines») sind
 * mit KEINER klein-GROSS-Heuristik ohne Wörterbuch erkennbar und werden hier NICHT
 * erfasst; die Regeneration (Leerzeichen-Fix) korrigiert sie dennoch mit. Der Wächter
 * belegt die Klasse über ihre klein-GROSS-Mitglieder (OR: «unterAbwesenden»).
 *
 * ── Ausnahme-Liste (am regenerierten Korpus kalibriert, 24.7.2026) ───────────
 * Nach dem Bund-Fix bleiben genau diese belegten, LEGITIMEN Token-Muster (kein
 * Verklebungs-Defekt) — jedes mit Fundstelle:
 *   (1) e-Präfix-Digitalbegriffe  `^\(?e\p{Lu}\p{Ll}`  (Schweizer «e-*»-Konvention):
 *       «eKonto»/«eKontos» (kant., z.B. AR), «eHealth»/«eHealth-Pilotprojekte»,
 *       «eGovernment», «eSteuern», «eBauverfahren», «eSchKG-Verbund» (Bund SchKG).
 *       Sicher: kein deutsches Wort ist der Einzelbuchstabe «e» → maskiert nie eine
 *       echte Verklebung (die begänne mit «und»/«der»/… , nie mit lone «e»).
 *   (2) Eigennamen/Gremien (exakt, randzeichen-getrimmt): «ComCom» (Bund FMG,
 *       Kommunikationskommission), «RailCom» (Bund EBG, Schiedskommission Eisenbahn),
 *       «EuroAirport» (kant. BS-510.900), «AGStDel» (kant. BS-169.200, Abkürzung im
 *       Erlass).
 *
 * ── Quelltreue-Falschpositive (Kanton, upstream-Tippfehler, NICHT unser Defekt) ──
 * Zwei Kanton-Titel tragen einen Grossbuchstaben «I» statt Kleinbuchstaben «l»
 * MITTEN im Wort — «AmtspfIichtverletzung» (AR-311) und «ZeitIiche» (AR-527.2). Der
 * Kanton-Pfad (struktur-lexwork.ts) ersetzt Tags durch Leerzeichen und kann ein «I»
 * NICHT einführen → der Grossbuchstabe steht so in der amtlichen LexWork-Quelle und
 * wird §7-treu gespiegelt. Das ist KEINE `<br>`-Verklebung, sondern ein Falschpositiv
 * der Heuristik auf einem quelltreuen Quelle-Tippfehler; darum hier gesondert
 * geführt (nicht «legitimes Muster») und separat zu verfolgen (out-of-scope M12).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = 'public/normtext/struktur';
const BEREICHE = ['bund', 'kanton'] as const;

// Naht: Kleinbuchstabe → Grossbuchstabe, der ein Wort eröffnet (≥2 Folge-Klein-
// buchstaben). Der `u`-Flag macht \p{Ll}/\p{Lu} unicode-korrekt (ä/ö/ü/à…).
const NAHT = /\p{Ll}\p{Lu}\p{Ll}{2}/u;

// (1) e-Präfix-Digitalbegriffe (randzeichen-tolerant am Token-Anfang).
const E_PRAEFIX = /^[(«"']*e\p{Lu}\p{Ll}/u;
// (2) Eigennamen/Gremien — Vergleich nach Randzeichen-Trim.
const EIGENNAMEN = new Set(['ComCom', 'RailCom', 'EuroAirport', 'AGStDel']);
// Quelltreue-Falschpositive (Kanton-Quelle-Tippfehler «I» statt «l»), separat geführt.
const QUELLE_FALSCHPOSITIV = new Set(['AmtspfIichtverletzung', 'ZeitIiche']);

// Konjunktionen/Präpositionen, vor denen ein hängendes Divis LEGITIM ist
// («Hin- und Rückweg», «Inhaber- in Namenaktien», «Geschäfts- ins Privatvermögen»).
// MUSS synchron zu HAENGEND in struktur-extrahiere.ts bleiben. Ein «Wort- <klein>»
// vor irgendetwas ANDEREM ist eine zerrissene Silbentrennung (Regression 24.7.).
// HAENGEND-Härtung 24.7.2026 (R3-Nebenbefund + Prüfer-Kalibrierung): wie/samt/je/
// pro/per/statt/anstatt/trotz/ab/wider/als/noch/nebst ergänzt; «gen» bewusst NICHT
// (häufigste End-Silbe, Korpus-Beleg «Motorwa- gen»). Synchron zum Extraktor —
// Begründung/Trade-off dort am HAENGEND-Kommentar.
const HAENGEND = /^(?:und|oder|bzw\.?|sowie|resp\.?|bis|beziehungsweise|respektive|wie|samt|je|pro|per|statt|anstatt|trotz|ab|wider|als|noch|nebst|in|ins|im|zu|zum|zur|an|ans|am|auf|aus|bei|beim|mit|von|vom|vor|über|unter|nach|um|ums|für|gegen|durch|ohne)$/i;
// Klasse B: «X- y» (Buchstabe, Divis, Leerzeichen, KLEINgeschriebenes Folgewort).
// Nur Kleinbuchstabe (Grossbuchstabe = Kompositum, kein Silbenriss); Buchstabe vor
// dem Divis (kein freistehender Gedankenstrich «A - b»). g1=Zeichen vor Divis, g2=Wort.
const DIVIS_RISS = /([^\s<])-\s+([a-zà-öø-ÿ][a-zà-öø-ÿ]*)/gu;
// Klasse C: leeres Klammerpaar «( )»/«()» — Inhalts-Verlust («(Insurance Wrapper)» → «( )»).
const LEER_KLAMMER = /\(\s*\)/;

/** Führende/abschliessende Nicht-Buchstaben entfernen («(AGStDel)»→«AGStDel»,
 *  «eGovernment-»→«eGovernment»); token-interne Zeichen (Bindestrich) bleiben. */
function trimRand(token: string): string {
  return token.replace(/^[^\p{L}]+/u, '').replace(/[^\p{L}]+$/u, '');
}

function istAusnahme(token: string): boolean {
  const t = trimRand(token);
  return E_PRAEFIX.test(token) || EIGENNAMEN.has(t) || QUELLE_FALSCHPOSITIV.has(t);
}

interface StrukturArtikel { marginalie?: string[]; gliederung?: { label?: string }[] }
interface StrukturDatei { artikel?: Record<string, StrukturArtikel> }

/** Alle geprüften Titel eines Sidecars: Gliederungs-Labels + Marginalien. */
function* titel(doc: StrukturDatei): Generator<string> {
  for (const a of Object.values(doc.artikel ?? {})) {
    for (const g of a.gliederung ?? []) if (g.label) yield g.label;
    for (const m of a.marginalie ?? []) if (m) yield m;
  }
}

interface Befund { datei: string; klasse: string; fund: string; titel: string }

/** Zerrissene Silbentrennung «X- y» (ausser hängendes Divis vor Konjunktion/Präposition). */
function divisRiss(t: string): string | null {
  for (const m of t.matchAll(DIVIS_RISS)) {
    if (!HAENGEND.test(m[2])) return `${m[1]}- ${m[2]}`;
  }
  return null;
}

function main(): void {
  console.log('\n── Tor: Verklebung (klein-GROSS-Nähte in Struktur-Titeln) ─────────────────');

  const befunde: Befund[] = [];
  let geprueft = 0;
  let dateien = 0;

  for (const bereich of BEREICHE) {
    const dir = join(WURZEL, bereich);
    if (!existsSync(dir)) {
      console.error(`  FEHLER: Struktur-Verzeichnis fehlt (${dir}) — Voraussetzung nicht erfüllt.`);
      process.exit(1); // §6.7c: laut rot, nie still grün.
    }
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    if (files.length === 0) {
      console.error(`  FEHLER: keine Struktur-Sidecars in ${dir} — Voraussetzung nicht erfüllt.`);
      process.exit(1);
    }
    for (const f of files) {
      dateien++;
      const doc = JSON.parse(readFileSync(join(dir, f), 'utf8')) as StrukturDatei;
      for (const t of titel(doc)) {
        geprueft++;
        const d = `${bereich}/${f}`;
        // Klasse A: klein-GROSS-Verklebung (Wortnaht ohne Leerzeichen).
        for (const token of t.split(/\s+/)) {
          if (NAHT.test(token) && !istAusnahme(token)) {
            befunde.push({ datei: d, klasse: 'A klein-GROSS', fund: token, titel: t });
          }
        }
        // Klasse B: zerrissene Silbentrennung «X- y».
        const riss = divisRiss(t);
        if (riss) befunde.push({ datei: d, klasse: 'B Divis-Riss', fund: riss, titel: t });
        // Klasse C: leeres Klammerpaar (Inhalts-Verlust).
        if (LEER_KLAMMER.test(t)) befunde.push({ datei: d, klasse: 'C Leer-Klammer', fund: '( )', titel: t });
      }
    }
  }

  if (befunde.length === 0) {
    console.log(`  ok: ${dateien} Sidecars, ${geprueft} Titel — keine Wort-Verklebung (Klassen A/B/C).`);
    process.exit(0);
  }

  console.error(`  FEHLER: ${befunde.length} defekte Titel (A=klein-GROSS · B=Divis-Riss · C=Leer-Klammer):`);
  for (const b of befunde.slice(0, 40)) {
    console.error(`    [${b.klasse}] ${b.datei}: «${b.fund}»  in  «${b.titel}»`);
  }
  if (befunde.length > 40) console.error(`    … und ${befunde.length - 40} weitere.`);
  console.error('\n  → Bund: `npm run normtext:struktur -- --datum=<F>` neu bauen (kontextabhängiger Naht-Fix).');
  console.error('  → Neues legitimes Muster? Ausnahme-Liste im Skript-Kopf mit Fundstelle ergänzen.');
  process.exit(1);
}

main();
