/**
 * scripts/normtext/check-zh-vollstaendigkeit.ts — «der ZH-Snapshot enthält, was
 * im amtlichen PDF steht».
 *
 * ANLASS (31.8.2026): Die adversariale Gegenprüfung der ZH-Kern-Tranche fand
 * fünf Klassen von stillem Textverlust, die kein bestehendes Tor sehen konnte —
 * abgeschnittene Bestimmungen (ein «§» im Fliesstext beendete den Artikel),
 * ersatzlos verschwundene aufgehobene §§, aus Fussnoten-Ziffern erfundene
 * Absätze, verlorene lateinische Suffixe. Alle Tore prüften bis dahin nur die
 * INNERE Stimmigkeit des Artefakts (Struktur, Parität, Manifest, Golden) oder
 * die Erreichbarkeit der Quelle. Keines hielt den Snapshot gegen das PDF.
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
 *   npm run check:zh-vollstaendigkeit -- --offline  # nur Prüfung 3 (kein Netz)
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

import { leseZweit } from './zh-zweitlesung.ts';

// ── Snapshot-Seite ───────────────────────────────────────────────────────────

interface Block {
  text?: unknown;
  items?: Array<{ text?: unknown }>;
}
interface Eintrag {
  artikel?: unknown;
  artikelLabel?: unknown;
  quelleUrl?: unknown;
  bloecke?: Block[];
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
  `check:zh-vollstaendigkeit — ${dateien.length} Erlass(e)${offline ? ' (offline: nur Trennstrich-Prüfung)' : ''}`,
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

  let zusatz = '';
  if (!offline) {
    const url = String(eintraege[0]?.quelleUrl ?? '');
    try {
      const zweit = await leseZweit(await holePdf(url));
      // 1. §-/Art.-Menge exakt.
      const imSnapshot = new Set(paragrafTokens(eintraege));
      const imPdf = new Set(zweit.koepfe);
      const fehlt = [...imPdf].filter((t) => !imSnapshot.has(t));
      const zuviel = [...imSnapshot].filter((t) => !imPdf.has(t));
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
      zusatz =
        ` · ${imPdf.size} Köpfe · lit. ${ist}/${soll} (${(deckung * 100).toFixed(0)} %)` +
        ` · ${zweit.absatzKandidaten} Absatz-Hochzahlen`;
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
