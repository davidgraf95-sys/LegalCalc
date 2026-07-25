// scripts/analyse/hist-h0.ts — W2·5i-HIST-ANSICHT, zwingende Vorstufe H0 (V2 §7.3).
//
// MESSUNG, kein Produktiv-Code: klassifiziert korpusweit alle Fussnoten der
// Struktur-Sidecars (public/normtext/struktur/{bund,kanton}) deterministisch in
//   AENDERUNG  — reine Fassungshistorie/Revisionsprosa (in der Ansicht
//                «Änderungshistorie: aus» ausblendbar),
//   VERWEIS    — echter Verweis/Substanz (bleibt IMMER sichtbar),
//   GRAUZONE   — beides zugleich (Revisionsvermerk MIT Leser-Redirect wie
//                «Siehe auch die SchlB…», «Heute: …», Aufhebung mit Nachfolger)
//                → bleibt IMMER sichtbar,
//   UNKLAR     — keine Regel greift → konservativ: bleibt IMMER sichtbar.
// Sicherheits-Asymmetrie (§15-Funktions-Treue): Der einzige gefährliche Fehler
// ist Substanz→AENDERUNG (würde beim Ausblenden Information verlieren). Die
// Gegenrichtung (Revisionsprosa bleibt sichtbar) kostet nur Lesekomfort.
//
// Aufrufe:
//   npx vite-node scripts/analyse/hist-h0.ts                  → Korpus-Statistik
//   npx vite-node scripts/analyse/hist-h0.ts -- --sample      → geseedete,
//     nach Klassifikator-Klasse stratifizierte Stichprobe als JSON auf stdout
//     (für die Hand-Labelung; Seed fix → byte-stabil, §2).
//   npx vite-node scripts/analyse/hist-h0.ts -- --unklar N    → N UNKLAR-Beispiele
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type Fussnote = { nr: string; text: string; absatz: string | null; item: string | null };
type Fall = {
  teil: 'bund' | 'kanton';
  erlass: string;
  ort: string; // Artikel-Key oder 'kopf'
  nr: string;
  text: string; // Tags gestrippt, whitespace-normalisiert
};

const WURZEL = 'public/normtext/struktur';

function strippe(html: string): string {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function ladeKorpus(): Fall[] {
  const faelle: Fall[] = [];
  for (const teil of ['bund', 'kanton'] as const) {
    for (const datei of readdirSync(join(WURZEL, teil)).sort()) {
      if (!datei.endsWith('.json')) continue;
      const d = JSON.parse(readFileSync(join(WURZEL, teil, datei), 'utf8'));
      const erlass = datei.replace(/\.json$/, '');
      const sammle = (ort: string, fns: Fussnote[] | undefined) => {
        for (const fn of fns ?? []) {
          faelle.push({ teil, erlass, ort, nr: fn.nr, text: strippe(fn.text) });
        }
      };
      sammle('kopf', d.kopf?.fussnoten);
      for (const [art, v] of Object.entries<{ fussnoten?: Fussnote[] }>(d.artikel ?? {}))
        sammle(art, v.fussnoten);
    }
  }
  return faelle;
}

// ─── Regeln (empirisch aus den Anfangs-Mustern des Korpus erhoben, 25.7.2026) ──

// Reine Revisionsprosa am Fussnoten-ANFANG.
const REV_START = new RegExp(
  '^(' +
    [
      'Fassung gemäss',
      'Fassung des\\b',
      'Eingefügt durch',
      'Aufgehoben durch',
      'Aufgehoben gemäss',
      'Ausdruck gemäss',
      'Bereinigt gemäss',
      'Nummerierung gemäss',
      'Bezeichnung gemäss',
      'Ursprünglich\\b',
      '(Erster|Zweiter|Dritter|Vierter|Fünfter|Letzter) (Satz|Absatz|Halbsatz)\\b',
      'Satz (eingefügt|aufgehoben|gemäss)',
      'Die Bezeichnung\\b',
      'Die Paarform\\b',
      'Umbenennung von',
      'Softwarebedingte',
      'Die Berichtigung\\b',
      'Berichtigt von der',
      'Die Referendumsfrist',
      'Angenommen in der Volksabstimmung',
      'Wirksam seit',
      'Publiziert am',
      'BRB vom',
      'In Kraft (seit|getreten)',
      'Die Änderung(en)?\\b',
      'Strafdrohungen neu umschrieben',
      'Der Verweis wurde in Anwendung',
      'Gegenstandslos\\b',
      'Betrifft nur\\b',
      'Abkürzung eingefügt durch',
      'Die Initiative wurde',
      '.{0,40}\\bin Kraft gesetzt',
      '.{0,60}\\b(in Wirksamkeit erklärt|unbenützt abgelaufen)',
      '.{0,80}\\b(angenommen|genehmigt|zugestimmt)(\\b|\\.)',
      '.{0,40}\\bin der Fassung des\\b',
    ].join('|') +
    ')',
  'i',
);

// Leser-Redirect INNERHALB einer Revisions-Fussnote → Grauzone.
const REDIRECT = /\b(siehe|vgl\.|heute|massgebend|anwendbar)\b/i;

// Substanz-/Verweis-ANFANG (SR-Nummern, kantonale Register, Abkürzungs-
// Auflösungen, EU-Rechtsakte, Provisions-Verweise, Dokument-Links).
const VW_START = new RegExp(
  '^(' +
    [
      'SR \\d',
      '(bGS|SG|SAR|BGS|LS|GS|sGS|SRL|SHR|SGS|NG|RB|BR|CSC|SRSZ|GDB|RiE|BaB|BeE) [\\d.]',
      '(aGS|GS) [IVX]',
      'SG RiE',
      'KV\\b',
      'BV\\b',
      'Vgl\\.',
      'Siehe\\b(?! heute)',
      'Verordnung \\((EG|EWG|EU)\\)',
      'Richtlinie\\b',
      '(§|Art\\.) ?\\d',
      'Mit Übergangsbestimmung',
      'vgl\\.',
    ].join('|') +
    ')',
);
// Verweis-Signale IRGENDWO im Text (greifen nur, wenn kein REV-Marker vorliegt):
// eingeklammerte SR-/Register-Nummer (Abkürzungs-Auflösung, Erlass-Nennung) oder
// Bezugs-URL («abrufbar/einsehbar unter», «bezogen werden»).
const VW_SIGNAL =
  /\((?:[A-ZÄÖÜ][A-Za-zÄÖÜäöü]{1,11}; )?(SR|bGS|SG|SAR|BGS|LS|sGS|SRL|BR|RB|SGS|GDB|SRSZ|CSC|NG|BSG|RSB|RiE|BaB|BeE)\s?[\d.]+|\b(abrufbar|einsehbar) unter\b|\bbezogen werden\b/;

// Reine Publikations-Zitate (AS-/BBl-/Abl-Ketten, «[AS …]»-Fassungsketten) —
// eigene Berichts-Klasse: weder Redirect noch Revisionsprosa im engeren Sinn;
// für die UI-Frage konservativ IMMER sichtbar zu halten.
const ZITAT_START =
  /^\[?(AS|BS|BBl|Abl\.?|AGS|OS|GS|nGS|SRL Nr|RRB)\s?[\d ]/;

// Grauzonen-ANFÄNGE: historisch motiviert, tragen aber geltende Information.
const GRAU_START = new RegExp(
  '^(' +
    [
      'Heute:',
      'Siehe heute',
      'umbenannt in',
      // Wert-Provenienz: «Betrag/Höchstbetrag/Ansätze gemäss Änd. vom …» — Historie
      // UND geltende Herkunftsangabe des Werts zugleich.
      '[A-ZÄÖÜ][a-zäöü]*([Bb]etrag|[Bb]eträge|[Aa]nsätze)\\w* gemäss',
      '(Betrag|Beträge|Ansätze) gemäss',
    ].join('|') +
    ')',
);
// Aufhebung MIT Nachfolger-Redirect («Dieses Gesetz ist aufgehoben. Massgebend ist jetzt …»).
const GRAU_AUFHEBUNG = /aufgehoben.*(massgebend|siehe|heute|ersetzt durch)/i;

export type Klasse = 'AENDERUNG' | 'VERWEIS' | 'GRAUZONE' | 'ZITAT' | 'UNKLAR';

export function klassifiziere(text: string): Klasse {
  if (GRAU_START.test(text)) return 'GRAUZONE';
  if (REV_START.test(text)) {
    if (REDIRECT.test(text) || GRAU_AUFHEBUNG.test(text)) return 'GRAUZONE';
    return 'AENDERUNG';
  }
  if (GRAU_AUFHEBUNG.test(text)) return 'GRAUZONE';
  if (VW_START.test(text)) return 'VERWEIS';
  if (ZITAT_START.test(text)) return 'ZITAT';
  if (VW_SIGNAL.test(text)) return 'VERWEIS';
  return 'UNKLAR';
}

// ─── deterministischer PRNG (mulberry32, fixer Seed — §2, reproduzierbar) ─────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ziehe<T>(arr: T[], n: number, rnd: () => number): T[] {
  const kopie = [...arr];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie.slice(0, n);
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const faelle = ladeKorpus();
  const klassen = faelle.map((f) => ({ ...f, klasse: klassifiziere(f.text) }));

  if (args[0] === '--sample') {
    // Stratifiziert nach Klassifikator-Klasse: je Klasse 60 Fälle (Seed 20260725).
    // Präzision je Klasse direkt messbar; Korpus-Hochrechnung über Strata-Grössen.
    const rnd = mulberry32(20260725);
    const sample: Array<{ id: string; klassifikator: Klasse; text: string; label: null }> = [];
    for (const k of ['AENDERUNG', 'VERWEIS', 'GRAUZONE', 'ZITAT', 'UNKLAR'] as Klasse[]) {
      const pool = klassen.filter((f) => f.klasse === k);
      for (const f of ziehe(pool, Math.min(60, pool.length), rnd)) {
        sample.push({
          id: `${f.teil}/${f.erlass}/${f.ort}/fn${f.nr}`,
          klassifikator: k,
          text: f.text,
          label: null,
        });
      }
    }
    console.log(JSON.stringify(sample, null, 1));
    return;
  }

  if (args[0] === '--unklar') {
    const n = Number(args[1] ?? 40);
    const rnd = mulberry32(20260725);
    for (const f of ziehe(klassen.filter((f) => f.klasse === 'UNKLAR'), n, rnd)) {
      console.log(`- ${f.teil}/${f.erlass}/${f.ort} :: ${f.text.slice(0, 180)}`);
    }
    return;
  }

  const zaehle = (menge: typeof klassen) => {
    const c: Record<string, number> = { AENDERUNG: 0, VERWEIS: 0, GRAUZONE: 0, ZITAT: 0, UNKLAR: 0 };
    for (const f of menge) c[f.klasse]++;
    return c;
  };
  const gesamt = zaehle(klassen);
  const summe = klassen.length;
  console.log(`Fussnoten gesamt: ${summe}`);
  for (const [teil, menge] of [
    ['gesamt', klassen],
    ['bund', klassen.filter((f) => f.teil === 'bund')],
    ['kanton', klassen.filter((f) => f.teil === 'kanton')],
  ] as const) {
    const c = zaehle(menge as typeof klassen);
    const n = (menge as typeof klassen).length;
    console.log(
      `${teil.padEnd(7)} n=${String(n).padStart(6)}  ` +
        (['AENDERUNG', 'VERWEIS', 'GRAUZONE', 'ZITAT', 'UNKLAR'] as const)
          .map((k) => `${k} ${String(c[k]).padStart(6)} (${((100 * c[k]) / n).toFixed(1)}%)`)
          .join(' · '),
    );
  }
  // Sichtbarkeits-Bilanz für die geplante Ansicht «Änderungshistorie: aus»:
  const ausblendbar = gesamt.AENDERUNG;
  console.log(
    `\nAnsicht «aus» würde ausblenden: ${ausblendbar}/${summe} (${((100 * ausblendbar) / summe).toFixed(1)}%) — ` +
      `sichtbar bleiben VERWEIS+GRAUZONE+UNKLAR = ${summe - ausblendbar}`,
  );
}

main();
