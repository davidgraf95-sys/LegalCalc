// ─── Token-Schranke (DESIGN-REGLEMENT B2/D2/F7/E1, §13) ─────────────────────
// Macht die Token-Disziplin aus «Konvention» zu «erzwungen». Zwei Prüfungen:
//
//  1) TYPO (B2): keine Tailwind-Default-Grössen (text-sm/lg/xl…) und keine ROHEN
//     absoluten Arbitrary-Grössen (text-[12px] / text-[1.1rem]). Erlaubt: die
//     hauseigene Skala, token-/var-basierte Grössen text-[length:var(--…)] und
//     relative em/% (kontextrelativ).
//
//  2) FARBE (F7): jede genutzte Farb-Utility (bg-/text-/border-/ring-… einer
//     hauseigenen Farbfamilie) muss in tailwind.config.js existieren — sonst
//     generiert Tailwind die Klasse STILL nicht (No-op). Genau diese Bug-Klasse
//     (bg-brass-50 / border-brass-300) erscheint sonst gar nicht im UI (F6/F7).
//
//  3) DECKKRAFT (DESIGN-D0, Infrastruktur-Fund B4 vom 8.8.2026): dieselbe
//     No-op-Klasse eine Ebene tiefer. `bg-brass-100/70` & Co. erzeugten am
//     Stand vom 16.8.2026 KEINE CSS-Regel — Tailwind 3 kann den `/<alpha>`-
//     Modifier nur anwenden, wenn der Farbwert entweder parsebar (`#F1E8D6`)
//     oder eine Funktion/`<alpha-value>`-Vorlage ist. Reine `var(--token)`-
//     Werte sind beides nicht: `withAlphaValue()` liefert `undefined`, die
//     Deklaration entfällt, die Regel wird verworfen — die Fläche rendert
//     unsichtbar (belegt LM-156, unsichtbare Aktiv-Zeile der Gesetzes-
//     Gliederung, PR #472). Prüfung 2 fängt das NICHT: die Stufe existiert ja,
//     nur der Modifier verpufft. Der Wächter kompiliert darum die im Repo
//     tatsächlich verwendeten `/<alpha>`-Klassen mit echtem Tailwind und
//     verlangt (a) eine Regel und (b) einen anderen Deklarations-Rumpf als die
//     opake Schwesterklasse — sonst wäre eine Regel ohne Deckkraft-Wirkung
//     grün. Implementierungs-neutral: greift auch bei einer künftigen
//     Tailwind-4-/color-mix-Lösung.
//
// Lauf:  npm run check:design-tokens   (Teil von `npm run check` → gate voll).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import postcss, { type Declaration } from 'postcss';
import tailwindcss from 'tailwindcss';
import tw from '../tailwind.config.js';

const WURZEL = 'src';

// ── Typo-Regeln ──
const DEFAULT_GROESSE = /\btext-(sm|lg|[2-9]?xl)\b/;
const ROH_ABSOLUT = /text-\[[0-9.]+(?:px|rem)\]/;
// Inline-Style: rohe absolute fontSize (px/rem) umgeht die Typo-Skala wie eine
// Arbitrary-Grösse (B2). em/%/var()/calc()/clamp() bleiben erlaubt.
const INLINE_FONTSIZE_ABS = /fontSize:\s*['"][0-9.]+(?:px|rem)['"]/;

// ── Farb-Regel: gültige <familie>[-<stufe>] aus der Config ableiten ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const farben: Record<string, any> = (tw as any).theme?.extend?.colors ?? {};
const GUELTIG = new Set<string>();            // z. B. "brass-100", "line", "line-strong"
for (const [fam, val] of Object.entries(farben)) {
  if (val && typeof val === 'object') {
    for (const stufe of Object.keys(val)) GUELTIG.add(stufe === 'DEFAULT' ? fam : `${fam}-${stufe}`);
  } else {
    GUELTIG.add(fam);                          // skalare Familie (z. B. well)
  }
}
const FAMILIEN = Object.keys(farben).join('|');
// Utility-Präfixe, die eine Farbe tragen:
const PRAEFIX = 'bg|text|border|ring|from|via|to|divide|outline|fill|stroke|decoration|placeholder|caret|accent|ring-offset';
// Fängt <praefix>-<familie>[-<stufe>] (Stufe optional = DEFAULT); /<alpha> wird ignoriert.
const FARB_RE = new RegExp(`\\b(?:${PRAEFIX})-(${FAMILIEN})(?:-([a-z0-9.]+))?(?:/[0-9.]+)?\\b`, 'g');

// ── Verbot: Ad-hoc-Status-Farben aus der Tailwind-Default-Palette (§13 Pkt.1/F7) ──
// Diese Familien sind KEINE Haus-Tokens; Tailwind generiert sie per Default
// weiter (extend überschreibt die Default-Palette nicht). Haus-Familien
// (slate/ink/brass/sage/well/warn/danger …) bewusst NICHT gelistet — die prüft
// bereits FARB_RE oben.
const DEFAULT_PALETTE = 'red|green|blue|yellow|orange|purple|pink|gray|grey|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose';
const DEFAULT_FARB_RE = new RegExp(`\\b(?:${PRAEFIX})-(?:${DEFAULT_PALETTE})-[0-9]+(?:/[0-9.]+)?\\b`, 'g');
// ── Verbot: Arbitrary-Color Hex/rgb/hsl in Komponenten (§13 Pkt.1). var(--…) bleibt erlaubt (Token-Escape). ──
const ARBITRARY_FARB_RE = new RegExp(`\\b(?:${PRAEFIX})-\\[(?:#|rgb|hsl)[^\\]]*\\]`, 'g');
// ── Verbot: lc-overline mit ink-Dimm-Override (D-1.2, Befund 18 / E1-Schranke) ──
// lc-overline ist auf ink-600 kalibriert (≥4.5:1 auch auf getönten Flächen);
// text-ink-500/400/300 daneben degradiert die 11px-Overline unter AA (gemessen
// ink-500 4.05:1 auf sage-/warn-bg) — axe-e2e war trotz Verstoss grün, dieses
// Regex ist der einzige Wächter. brass-Pairings (text-brass-*) bleiben erlaubt.
// Beide Reihenfolgen, nur innerhalb DESSELBEN className-Strings (kein Treffer
// über Quote-Grenzen hinweg — verschachtelte eigenständige Spans sind aus Scope).
const OVERLINE_DIM_RE = /\blc-overline\b[^"'`]*\btext-ink-(?:500|400|300)\b|\btext-ink-(?:500|400|300)\b[^"'`]*\blc-overline\b/;
// ── Verbot: Reinweiss als Fläche (§13-Nachtrag d / Befund 41, Reinweiss-Invariante) ──
// Lese-/Arbeitsflächen tragen --paper*/--surface* (warmes Papier), nie #FFFFFF;
// --paper-raised deckt kleine erhabene Flächen ab. Kein bg-white/text-white/…-white
// (Tailwind-Keyword) und kein #fff/#ffffff im Inline-Style. Arbitrary-Hex-White
// (bg-[#fff]) fängt bereits ARBITRARY_FARB_RE. Dokumentierte Ausnahmen (@media
// print body #fff, text-paper auf ink-Buttons) leben in index.css, ausserhalb
// dieses Komponenten-Scopes. Heute 0 Treffer = billige Versicherung (F6/F7).
const WHITE_UTIL_RE = new RegExp(`\\b(?:${PRAEFIX})-white\\b`, 'g');
const INLINE_WHITE_RE = /(?:background|backgroundColor|color)\s*:\s*['"]#(?:fff|ffffff)['"]/i;
// ── Deckkraft-Suffix (Prüfung 3, D0): <praefix>-<farbe>/<alpha>. Bewusst OHNE
// Familien-Filter — auch die Tailwind-Keyword-Farben (bg-black/50) laufen mit,
// die Kompilation entscheidet. Nur Farb-Präfixe, damit w-1/2 & Co. nicht greifen.
const ALPHA_UTIL_RE = new RegExp(`\\b(?:${PRAEFIX})-[a-z]+(?:-[a-z0-9]+)*\\/[0-9.]+\\b`, 'g');

function dateien(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { out.push(...dateien(p)); continue; }
    if (/\.(ts|tsx)$/.test(e) && !/\.test\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

const fehler: string[] = [];
/** Fundstellen je Deckkraft-Klasse: "bg-brass-100/70" → ["src/…:42", …] */
const alphaFunde = new Map<string, string[]>();
for (const datei of dateien(WURZEL)) {
  const zeilen = readFileSync(datei, 'utf8').split('\n');
  zeilen.forEach((zeile, i) => {
    if (DEFAULT_GROESSE.test(zeile))
      fehler.push(`${datei}:${i + 1} — Tailwind-Default-Grösse (text-sm/lg/xl…). Stattdessen die Skala oder text-[length:var(--…)].`);
    if (ROH_ABSOLUT.test(zeile))
      fehler.push(`${datei}:${i + 1} — rohe Arbitrary-Grösse text-[…px|rem]. Wert als Token (--…) führen und text-[length:var(--…)] nutzen.`);
    if (INLINE_FONTSIZE_ABS.test(zeile))
      fehler.push(`${datei}:${i + 1} — rohe absolute fontSize im Inline-Style (px/rem). Wert als Token (--…) in index.css führen und fontSize: 'var(--…)' nutzen.`);
    let m: RegExpExecArray | null;
    FARB_RE.lastIndex = 0;
    while ((m = FARB_RE.exec(zeile)) !== null) {
      const token = m[2] ? `${m[1]}-${m[2]}` : m[1];     // familie-stufe bzw. familie (DEFAULT)
      if (!GUELTIG.has(token))
        fehler.push(`${datei}:${i + 1} — Farb-Utility «${m[0]}» → Stufe «${token}» fehlt in tailwind.config.js (stiller No-op, F7). Existierende Stufe nutzen oder Token ergänzen.`);
    }
    let dm: RegExpExecArray | null;
    DEFAULT_FARB_RE.lastIndex = 0;
    while ((dm = DEFAULT_FARB_RE.exec(zeile)) !== null)
      fehler.push(`${datei}:${i + 1} — Ad-hoc-Status-Farbe «${dm[0]}» aus der Tailwind-Default-Palette (verboten, §13 Pkt.1/F7). Haus-Token (brass/sage/slate/warn/danger …) statt red/green/blue/gray nutzen.`);
    let am: RegExpExecArray | null;
    ARBITRARY_FARB_RE.lastIndex = 0;
    while ((am = ARBITRARY_FARB_RE.exec(zeile)) !== null)
      fehler.push(`${datei}:${i + 1} — Arbitrary-Farbe «${am[0]}» (Hex/rgb/hsl in Komponente verboten, §13 Pkt.1). Wert als CSS-Variable führen und …-[var(--…)] nutzen.`);
    if (OVERLINE_DIM_RE.test(zeile))
      fehler.push(`${datei}:${i + 1} — lc-overline mit text-ink-500/400/300 gedimmt (AA-Fail bei 11px, D-1.2/E1). Override strippen — lc-overline trägt die kalibrierte ink-600-Basis.`);
    let wm: RegExpExecArray | null;
    WHITE_UTIL_RE.lastIndex = 0;
    while ((wm = WHITE_UTIL_RE.exec(zeile)) !== null)
      fehler.push(`${datei}:${i + 1} — Reinweiss-Utility «${wm[0]}» (§13-Nachtrag d / Reinweiss-Invariante). Warme Fläche/Tinte nutzen: bg-paper*/bg-surface* bzw. text-paper (nie #FFFFFF als Lesefläche).`);
    if (INLINE_WHITE_RE.test(zeile))
      fehler.push(`${datei}:${i + 1} — Reinweiss #fff im Inline-Style (§13-Nachtrag d / Reinweiss-Invariante). Token nutzen: var(--paper*)/var(--surface*) bzw. var(--paper) für Tinte auf Dunkel.`);
    let alm: RegExpExecArray | null;
    ALPHA_UTIL_RE.lastIndex = 0;
    while ((alm = ALPHA_UTIL_RE.exec(zeile)) !== null) {
      const liste = alphaFunde.get(alm[0]) ?? [];
      liste.push(`${datei}:${i + 1}`);
      alphaFunde.set(alm[0], liste);
    }
  });
}

// ── Prüfung 3: Deckkraft-Klassen gegen echtes Tailwind kompilieren ───────────
// Ein Lauf für alle Klassen (opak + Alpha) — Tailwind braucht dafür ~150 ms.
if (alphaFunde.size > 0) {
  const opak = (k: string) => k.slice(0, k.lastIndexOf('/'));
  const klassen = [...alphaFunde.keys()].flatMap((k) => [k, opak(k)]);
  const config = { ...(tw as Record<string, unknown>), content: [{ raw: klassen.join(' '), extension: 'html' }] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ergebnis = await postcss([tailwindcss(config as any)]).process('@tailwind utilities;', { from: undefined });
  // Selektor → Deklarations-Rumpf. `--tw-*-opacity` fliegt raus: Tailwind
  // emittiert die Zeile nur bei der opaken Variante und sie ist wirkungslos,
  // würde den Vergleich aber immer «unterschiedlich» machen.
  const rumpf = new Map<string, string>();
  ergebnis.root.walkRules((regel) => {
    const treffer = /^\.((?:[^\s.:>~+[\\]|\\.)+)/.exec(regel.selector);
    if (!treffer) return;
    const klasse = treffer[1].replace(/\\/g, '');
    const decls = regel.nodes
      .filter((n): n is Declaration => n.type === 'decl' && !/^--tw-[a-z-]+-opacity$/.test(n.prop))
      .map((n) => `${n.prop}:${n.value}`)
      .join(';');
    rumpf.set(klasse, (rumpf.get(klasse) ?? '') + decls);
  });
  for (const [klasse, orte] of alphaFunde) {
    const wo = `${orte[0]}${orte.length > 1 ? ` (+${orte.length - 1} weitere)` : ''}`;
    const mit = rumpf.get(klasse);
    if (mit === undefined || mit === '') {
      fehler.push(`${wo} — Deckkraft-Klasse «${klasse}» erzeugt KEINE CSS-Regel (stiller No-op, D0/F7). Farbwert in tailwind.config.js alpha-fähig machen (Funktion mit opacityValue bzw. <alpha-value>), nicht die Klasse entfernen.`);
      continue;
    }
    if (mit === rumpf.get(opak(klasse)))
      fehler.push(`${wo} — Deckkraft-Klasse «${klasse}» erzeugt zwar eine Regel, aber denselben Wert wie «${opak(klasse)}» — der /-Modifier bleibt wirkungslos (D0/F7).`);
  }
}

if (fehler.length > 0) {
  console.error(`Token-Schranke ROT — ${fehler.length} Verstoss/Verstösse (DESIGN-REGLEMENT B2/F7/§13):`);
  for (const f of fehler) console.error('  ' + f);
  process.exit(1);
}
console.log(`Token-Schranke ok — Typo-Skala sauber, alle Farb-Utilities in der Config (${GUELTIG.size} gültige Stufen), ${alphaFunde.size} Deckkraft-Klassen erzeugen eine wirksame Regel.`);
