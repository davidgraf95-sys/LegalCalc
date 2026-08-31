/**
 * scripts/normtext/check-zh-vollstaendigkeit.ts — «der ZH-Snapshot enthält, was
 * im amtlichen PDF steht».
 *
 * ANLASS (31.8.2026, Runde 1): Die adversariale Gegenprüfung der ZH-Kern-
 * Tranche fand fünf Klassen von stillem Textverlust, die kein bestehendes Tor
 * sehen konnte — abgeschnittene Bestimmungen (ein «§» im Fliesstext beendete
 * den Artikel), ersatzlos verschwundene aufgehobene §§ mit EINZEL-Kopf, aus
 * Fussnoten-Ziffern erfundene Absätze, verlorene lateinische §-Suffixe. Alle
 * Tore prüften bis dahin nur die INNERE Stimmigkeit des Artefakts (Struktur,
 * Parität, Manifest, Golden) oder die Erreichbarkeit der Quelle. Keines hielt
 * den Snapshot gegen das PDF.
 *
 * NACHTRAG (Runde 2): Die Formulierung «verschwundene aufgehobene §§» war zu
 * weit — der Code fing nur die Einzel-Köpfe. Die SAMMEL-Köpfe («§§ 66–69.»)
 * blieben unsichtbar, ebenso die Suffix-ABSÄTZE, die Gliederungstitel und jeder
 * verfälschte Zahlenwert. Prüfungen 4–7 schliessen genau diese Lücke; die
 * Aufzählung oben beschreibt jetzt, was der Code tatsächlich leistet.
 *
 * WAS DAS TOR PRÜFT — eine ZWEITE, unabhängige Lesung derselben PDF:
 *
 *   1. §-/Art.-MENGE EXAKT. Jeder Kopf, den die Zweitlesung im Textlayer
 *      findet, muss im Snapshot als Eintrag stehen — und umgekehrt. Ein
 *      fehlender Kopf ist ein verlorener eId, ein überzähliger eine Erfindung.
 *   2. lit.-DECKUNG. Die Zahl der Buchstaben-Positionen im Snapshot muss
 *      mindestens LIT_DECKUNG der Zweitlesung erreichen (Schwelle unten
 *      begründet).
 *   3. KEIN BLOCK ENDET AUF EINEM TRENNSTRICH. Ein Block, der auf «-» endet,
 *      ist ein mitten im Wort abgeschnittener Satz — harter Fehler, keine
 *      Toleranz. Diese Prüfung braucht kein PDF und läuft immer.
 *   4. §§-SAMMELKÖPFE. Jeder §, den eine «§§ A–B.»-Zeile nennt, muss im
 *      Snapshot vorkommen — als «Aufgehoben»-Platzhalter oder als Artikel.
 *   5. SUFFIX-ABSÄTZE. Jede hochgestellte Absatznummer mit lateinischem Suffix
 *      («2bis») muss im `absatz`-Feld ihres § stehen.
 *   6. KEIN GLIEDERUNGSTITEL IM NORMTEXT. «2. Kapitel: …» im Blocktext ist ein
 *      harter Fehler. Braucht kein PDF und läuft immer.
 *   7. WERTE-WÄCHTER. Jede Ziffernfolge im Snapshot (Blocktext, items UND
 *      mehrspaltig-Zellen) muss im PDF-Textlayer vorkommen. Fängt den
 *      verfälschten Tarifwert, den keine Struktur-Prüfung sieht.
 *
 * WARUM 4–7 (Befund B-4 der ZWEITEN Gegenprüfung, 31.8.2026 — COMMON MODE):
 * Die Prüfungen 1 und 2 waren TRÜGERISCH grün, weil die Zweitlesung dieselben
 * blinden Flecken trug wie der Produktions-Adapter. `KOPF_PARAGRAF` verlangte
 * ein einzelnes «§» und sah die Sammelköpfe nie; das Absatz-Muster /^\d+$/
 * kannte den lateinischen Suffix nicht und verglich die Absätze ohnehin nicht;
 * Gliederungstitel prüfte niemand; und eine Mutationsprobe zeigte, dass eine
 * verfälschte Tarifzahl in `mehrspaltig` unbemerkt durchging. Was beide Seiten
 * nicht lesen, fehlt beiden Seiten gleich — ein Tor, dessen Mängel die des
 * Geprüften spiegeln, ist keins (§6.7 lit. d).
 *
 * UNABHÄNGIGKEIT (§6.7 lit. d — ein Tor, das dieselbe Logik prüft, die es
 * absichern soll, ist keins): Die Zweitlesung teilt mit dem Produktions-Adapter
 * KEINE Zeile Code. Sie baut Zeilen mit einer groben y-Toleranz statt exakter
 * Rundung, verkettet stumpf mit Leerzeichen statt geometrisch, und erkennt die
 * Köpfe mit einem toleranten Muster, dem der Abstand egal ist. Zwei Modell-
 * entscheide teilt sie bewusst — die Body-Spalte (sonst zählte sie Randnoten
 * mit) und die Grenze zum Schlussapparat (sonst zählte sie die zweite,
 * kollidierende §-Zählung der Übergangsbestimmungen mit). Beide sind durch
 * Unit-Tests am Adapter abgedeckt, nicht durch dieses Tor.
 *
 * AUFRUF
 *   npm run check:zh-vollstaendigkeit             # alle ZH-Erlasse (Netz)
 *   npm run check:zh-vollstaendigkeit -- 175.2    # nur diese
 *   npm run check:zh-vollstaendigkeit -- --offline  # nur 3 + 6 (kein Netz)
 *
 * Netz-Disziplin: dieselbe Registry→OpenAttachment→PDF-Kette wie der Import,
 * seriell mit ~1 s Abstand, UA mit Kontaktadresse.
 *
 * §2: deterministisch (kein Date.now, kein Math.random).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { leseAttachmentUrl, loeseRedirect } from './adapter-zh-pdf.ts';
import { fetchMitWiederholung } from './netz-retry.ts';

const SNAPSHOT_DIR = 'public/normtext/kanton';
const UA = 'LexMetrik-Import/1.0 (kontakt: david.graf95@gmail.com)';
const ABSTAND_MS = 1100;

/**
 * Mindest-Deckung der lit.-Positionen (Snapshot / Zweitlesung).
 *
 * Warum nicht 100 %: die Zweitlesung zählt ZEILEN, die mit «x. » beginnen — eine
 * Über-Abschätzung. Eine umbrochene Fliesstext-Zeile kann zufällig so anfangen,
 * und eine Aufzählung, die der Adapter (korrekt) als Fortsetzung des laufenden
 * Absatzes führt, zählt hier trotzdem.
 *
 * Gemessen am geheilten Korpus (alle 24 ZH-Erlasse, 31.8.2026): 23 Erlasse
 * exakt 100 %, der schlechteste (ZH-631.1) 99.7 % — eine einzige Position von
 * 296. Die Schwelle 95 % liegt klar unter dem gemessenen Minimum und weit über
 * dem, was ein echter Verlust erzeugt: der Verdacht B-1 der Gegenprüfung
 * («lit. fehlen flächendeckend») hätte eine Deckung nahe 0 bedeutet.
 */
const LIT_DECKUNG = 0.95;

import { leseZweit, GLIEDERUNG_IM_TEXT } from './zh-zweitlesung.ts';

// ── Snapshot-Seite ───────────────────────────────────────────────────────────

interface Block {
  absatz?: unknown;
  text?: unknown;
  items?: Array<{ text?: unknown }>;
  mehrspaltig?: { zeilen?: unknown[][] };
}
interface Eintrag {
  artikel?: unknown;
  artikelLabel?: unknown;
  quelleUrl?: unknown;
  bloecke?: Block[];
}

/** Jede Zeichenkette, die im Snapshot Normtext trägt: Blocktext, lit.-items und
 *  die Zellen der mehrspaltigen Tarif-Tabellen. Die Tabellenzellen waren bisher
 *  von KEINER Prüfung erfasst — genau dort schlug die Mutationsprobe durch. */
function* snapshotTexte(eintraege: Eintrag[]): Generator<{ label: string; text: string }> {
  for (const e of eintraege) {
    const label = String(e.artikelLabel ?? e.artikel ?? '?');
    for (const b of e.bloecke ?? []) {
      if (typeof b.text === 'string') yield { label, text: b.text };
      for (const i of b.items ?? []) {
        if (typeof i.text === 'string') yield { label, text: i.text };
      }
      for (const zeile of b.mehrspaltig?.zeilen ?? []) {
        for (const zelle of zeile) {
          if (typeof zelle === 'string') yield { label: `${label} (Tabelle)`, text: zelle };
        }
      }
    }
  }
}

function ladeSnapshot(pfad: string): { eintraege: Eintrag[] } {
  return JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege: Eintrag[] };
}

/** Nur §-/Art.-Einträge; die Anhang-Ziffern (ZH-243) sind keine Paragraphen. */
function paragrafTokens(eintraege: Eintrag[]): string[] {
  return eintraege
    .map((e) => String(e.artikel ?? ''))
    .filter((t) => t !== '' && !t.includes('.') && !t.startsWith('anhang_'));
}

function litPositionen(eintraege: Eintrag[]): number {
  let n = 0;
  for (const e of eintraege) for (const b of e.bloecke ?? []) n += (b.items ?? []).length;
  return n;
}

/** Blöcke und items, deren Text auf einem Trennstrich endet = mitten im Wort
 *  abgeschnitten. Liefert die Fundstellen als «§ N» bzw. «§ N lit. x». */
function trennstrichEnden(eintraege: Eintrag[]): string[] {
  const treffer: string[] = [];
  const endetAufTrennstrich = (t: unknown): boolean =>
    typeof t === 'string' && /\p{L}-$/u.test(t.trim());
  for (const e of eintraege) {
    const label = String(e.artikelLabel ?? e.artikel ?? '?');
    for (const b of e.bloecke ?? []) {
      if (endetAufTrennstrich(b.text)) treffer.push(label);
      for (const i of b.items ?? []) {
        if (endetAufTrennstrich(i.text)) treffer.push(`${label} lit.`);
      }
    }
  }
  return treffer;
}

// ── Netz ─────────────────────────────────────────────────────────────────────

const schlaf = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function hole(url: string): Promise<Response> {
  await schlaf(ABSTAND_MS);
  return fetchMitWiederholung(url, { headers: { 'User-Agent': UA } });
}

async function holePdf(registryUrl: string): Promise<Uint8Array> {
  const reg = await hole(registryUrl);
  if (!reg.ok) throw new Error(`Registry HTTP ${reg.status}`);
  const attach = leseAttachmentUrl(await reg.text());
  if (!attach) throw new Error('kein OpenAttachment-Link');
  const red = await hole(attach);
  if (!red.ok) throw new Error(`OpenAttachment HTTP ${red.status}`);
  const pdfUrl = loeseRedirect(await red.text(), attach);
  if (!pdfUrl) throw new Error('kein window.location-Redirect');
  const res = await hole(pdfUrl);
  if (!res.ok) throw new Error(`PDF HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  // Content-Sonde: eine HTML-Hülle kommt mit HTTP 200 (Skill-Regel).
  if (!(bytes[0] === 0x25 && bytes[1] === 0x50)) throw new Error('keine PDF-Antwort');
  return bytes;
}

// ── Lauf ─────────────────────────────────────────────────────────────────────

const argumente = process.argv.slice(2);
const offline = argumente.includes('--offline');
const nurNummern = argumente.filter((a) => !a.startsWith('--'));

const dateien = readdirSync(SNAPSHOT_DIR)
  .filter((f) => f.startsWith('ZH-') && f.endsWith('.json'))
  .filter((f) => nurNummern.length === 0 || nurNummern.includes(f.slice(3, -5)))
  .sort();

if (dateien.length === 0) {
  console.error(`check:zh-vollstaendigkeit: keine Snapshots in ${SNAPSHOT_DIR}`);
  process.exit(1);
}

let fehler = 0;
console.log(
  `check:zh-vollstaendigkeit — ${dateien.length} Erlass(e)${offline ? ' (offline: nur Trennstrich- und Gliederungstitel-Prüfung)' : ''}`,
);

for (const datei of dateien) {
  const nr = datei.slice(3, -5);
  const { eintraege } = ladeSnapshot(join(SNAPSHOT_DIR, datei));
  const probleme: string[] = [];

  // 3. Trennstrich-Enden (immer, ohne Netz).
  const abgeschnitten = trennstrichEnden(eintraege);
  if (abgeschnitten.length > 0) {
    probleme.push(
      `${abgeschnitten.length} Block/item endet auf Trennstrich (abgeschnittener Satz): ${[...new Set(abgeschnitten)].slice(0, 6).join(', ')}`,
    );
  }

  // 6. Gliederungstitel im Normtext (immer, ohne Netz) — harter Fehler.
  const gliederungsLeck: string[] = [];
  for (const { label, text } of snapshotTexte(eintraege)) {
    if (GLIEDERUNG_IM_TEXT.test(text)) gliederungsLeck.push(label);
  }
  if (gliederungsLeck.length > 0) {
    probleme.push(
      `${gliederungsLeck.length} Block/item trägt einen Gliederungstitel im Normtext ` +
        `(«N. Kapitel:/Abschnitt:/Teil:/Titel:»): ${[...new Set(gliederungsLeck)].slice(0, 6).join(', ')}`,
    );
  }

  let zusatz = '';
  if (!offline) {
    const url = String(eintraege[0]?.quelleUrl ?? '');
    try {
      const zweit = await leseZweit(await holePdf(url));
      // 1. §-/Art.-Menge exakt.
      const imSnapshot = new Set(paragrafTokens(eintraege));
      // Die §§ aus einem Sammel-Aufhebungskopf gehören zur Soll-Menge, auch
      // wenn sie keine eigene Kopfzeile tragen (Härtung B-4: vorher waren sie
      // auf BEIDEN Seiten unsichtbar — die Mengengleichheit war trügerisch grün).
      const imPdf = new Set([...zweit.koepfe, ...zweit.sammelTokens]);
      // Innerhalb einer genannten Sammel-Spanne darf der Snapshot mehr führen,
      // als die (bewusst konservative) Zweitlesung auszählt: «§§ 117 a–117 m.»
      // nennt nur die Endpunkte, der Adapter füllt a…m auf. Ausserhalb jeder
      // Spanne bleibt jeder Zusatz-Eintrag ein Fehler.
      const inSpanne = (t: string): boolean => {
        const n = Number(t.split('_')[0]);
        return (
          Number.isFinite(n) && zweit.sammelSpannen.some((s) => n >= s.von && n <= s.bis)
        );
      };
      const fehlt = [...imPdf].filter((t) => !imSnapshot.has(t));
      const zuviel = [...imSnapshot].filter((t) => !imPdf.has(t) && !inSpanne(t));
      if (fehlt.length > 0) {
        probleme.push(`${fehlt.length} Kopf/Köpfe im PDF, aber NICHT im Snapshot: ${fehlt.slice(0, 10).join(', ')}`);
      }
      if (zuviel.length > 0) {
        probleme.push(`${zuviel.length} Eintrag/Einträge im Snapshot ohne Kopf im PDF: ${zuviel.slice(0, 10).join(', ')}`);
      }
      // 2. lit.-Deckung.
      const ist = litPositionen(eintraege);
      const soll = zweit.litZeilen;
      const deckung = soll === 0 ? 1 : ist / soll;
      if (deckung < LIT_DECKUNG) {
        probleme.push(
          `lit.-Deckung ${(deckung * 100).toFixed(0)} % (${ist} im Snapshot / ${soll} im PDF), Mindestwert ${(LIT_DECKUNG * 100).toFixed(0)} %`,
        );
      }
      // 4. §§-Sammelköpfe: jeder genannte § muss im Snapshot stehen.
      const alleTokens = new Set(eintraege.map((e) => String(e.artikel ?? '')));
      const sammelFehlt = zweit.sammelTokens.filter((t) => !alleTokens.has(t));
      if (sammelFehlt.length > 0) {
        probleme.push(
          `${sammelFehlt.length} § aus einem «§§ …»-Sammelkopf fehlt im Snapshot: ` +
            `${sammelFehlt.slice(0, 12).join(', ')}`,
        );
      }
      // 5. Suffix-Absätze je § gegen die absatz-Felder halten.
      const absatzImSnapshot = new Map<string, Set<string>>();
      for (const e of eintraege) {
        const t = String(e.artikel ?? '');
        const menge = absatzImSnapshot.get(t) ?? new Set<string>();
        for (const b of e.bloecke ?? []) {
          if (typeof b.absatz === 'string') menge.add(b.absatz);
        }
        absatzImSnapshot.set(t, menge);
      }
      const suffixFehlt: string[] = [];
      for (const [tok, nummern] of Object.entries(zweit.suffixAbsaetze)) {
        for (const nr of nummern) {
          if (!absatzImSnapshot.get(tok)?.has(nr)) suffixFehlt.push(`${tok}/${nr}`);
        }
      }
      if (suffixFehlt.length > 0) {
        probleme.push(
          `${suffixFehlt.length} Absatz mit lat. Suffix im PDF, aber nicht im Snapshot ` +
            `(§/Absatz): ${suffixFehlt.slice(0, 10).join(', ')}`,
        );
      }
      // 7. Werte-Wächter: keine Ziffernfolge im Snapshot, die das PDF nicht trägt.
      const erfunden: string[] = [];
      for (const { label, text } of snapshotTexte(eintraege)) {
        for (const z of text.match(/\d+/g) ?? []) {
          if (!zweit.zahlen.has(z)) erfunden.push(`${label}: «${z}»`);
        }
      }
      if (erfunden.length > 0) {
        probleme.push(
          `${erfunden.length} Zahl(en) im Snapshot ohne Entsprechung im PDF-Textlayer: ` +
            `${[...new Set(erfunden)].slice(0, 8).join(' · ')}`,
        );
      }
      const suffixGesamt = Object.values(zweit.suffixAbsaetze).reduce((n, l) => n + l.length, 0);
      zusatz =
        ` · ${imPdf.size} Köpfe · lit. ${ist}/${soll} (${(deckung * 100).toFixed(0)} %)` +
        ` · ${zweit.absatzKandidaten} Absatz-Hochzahlen (${suffixGesamt} mit lat. Suffix)` +
        ` · ${zweit.sammelTokens.length} §§ aus Sammelköpfen · ${zweit.zahlen.size} Zahlen im PDF`;
    } catch (e) {
      probleme.push(`Quelle nicht lesbar: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (probleme.length > 0) {
    fehler++;
    console.error(`  FEHLER ZH-${nr}`);
    for (const p of probleme) console.error(`      ${p}`);
  } else {
    console.log(`  ok    ZH-${nr.padEnd(9)} ${eintraege.length} Einträge${zusatz}`);
  }
}

console.log(`\ncheck:zh-vollstaendigkeit: ${dateien.length} Erlass(e), ${fehler} mit Befund.`);
if (fehler > 0) process.exit(1);
