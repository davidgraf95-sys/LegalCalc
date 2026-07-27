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
//
// H1-NACHTRAG 26.7.2026 (W2·5i): die REGELN leben nicht mehr hier, sondern in
// `scripts/normtext/fussnoten-klassifikation.ts` — sie sind in die Generator-
// Schicht gehoben (H0-Auflage 3: Klassifikation EINMAL build-seitig als Sidecar-
// Feld `kl`) und werden von dort importiert (§5: eine Quelle). Dieses Werkzeug
// bleibt die MESSUNG darüber. Folge für die Reproduktion des H0-Berichts: die
// Zahlen verschieben sich um exakt die 13 Fussnoten, die H0-Auflage 2 aus
// AENDERUNG herausroutet (AENDERUNG 25'367 → 25'354, Kanton 674 → 661, Bund
// unverändert 24'693) — Belegrechnung im Kopf des Regel-Moduls.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { klassifiziere, type Klasse } from '../normtext/fussnoten-klassifikation.ts';

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

// ─── Regeln: SSoT in scripts/normtext/fussnoten-klassifikation.ts (§5) ────────
// Die Regel-Regexe (REV_START/REDIRECT/VW_START/VW_SIGNAL/ZITAT_START/GRAU_*)
// und `klassifiziere()` sind dorthin gehoben — inkl. der H0-Auflage-2-Riegel.
// Hier bleibt NUR die Messung. Ein Regel-Duplikat wäre eine zweite Wahrheit (§5)
// und würde Messung und Produktiv-Klassifikation auseinanderlaufen lassen.

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
