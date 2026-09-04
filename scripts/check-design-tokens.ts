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
// Utility-Präfixe, die eine Farbe tragen. `shadow` ergänzt 5.9.2026 (D0-Nachzug,
// s. Prüfung 3): Tailwind 3 nimmt an `shadow-` eine FARBE entgegen — gemessen
// erzeugt `shadow-brass-500/40` die Deklaration `--tw-shadow-color: color-mix(…)`.
// Damit kann dort dieselbe stille No-op-Klasse entstehen wie an `bg-`, und die
// Aufzählung war schlicht unvollständig. Die Formen OHNE Farbe (`shadow-sm|md|lg`,
// `shadow-[var(--ring)]`) laufen weiter durch: FARB_RE verlangt hinter dem Präfix
// eine Haus-FAMILIE, und `sm`/`md`/`lg` sind keine; ARBITRARY_FARB_RE greift nur
// bei `#`/`rgb`/`hsl`, nicht bei `var(`.
const PRAEFIX = 'bg|text|border|ring|from|via|to|divide|outline|fill|stroke|decoration|placeholder|caret|accent|ring-offset|shadow';
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
// ACHTUNG (D0, 5.9.2026): der Token-Escape ist nur OHNE Deckkraft-Suffix
// gefahrlos. `…-[var(--token)]/60` erzeugt in Tailwind 3 keine CSS-Regel —
// diesen Fall prüft nicht diese Zeile, sondern Prüfung 3 (ALPHA_UTIL_RE).
const ARBITRARY_FARB_RE = new RegExp(`\\b(?:${PRAEFIX})-\\[(?:#|rgb|hsl)[^\\]]*\\]`, 'g');
// ── Verbot: eigene FARBE am Fokusring (E-1, Design-Konsistenz 31.8.2026) ────
// Der Fokusring hat GENAU EINE Rolle: `--focus` (src/index.css) — hell
// brass-700, dunkel brass-500, und die globale Regel `:focus-visible { outline:
// 2px solid var(--focus); outline-offset: 2px }` (index.css) trägt sie an JEDEM
// fokussierbaren Element. Gefunden wurden trotzdem 9 Komponenten, die daneben
// eine eigene Kette `focus-visible:outline focus-visible:outline-2
// focus-visible:outline-brass-600` setzten: dieselbe Zusage, zweiter Wert
// (§5) — im Dunkelmodus sichtbar falsch, weil brass-600 dort NICHT der
// Fokuston ist. Die bestehenden Tore griffen knapp daneben: `brass-600` steht
// in der Config (FARB_RE grün) und ist keine Default-Palette-Farbe
// (DEFAULT_FARB_RE grün). Darum diese Schranke (§17-Nachzug).
// ERLAUBT bleibt alles, was NICHT die Farbe setzt: `focus-visible:outline-none`
// (dokumentierte Eigenring-Fälle), Breiten (`outline-2`) und vor allem der
// Offset (`focus-visible:-outline-offset-2`) — Scroll-Container und Krümel in
// schmalen Kopfzeilen brauchen den Ring innenliegend, sonst clippt er.
// Fasst `focus:` und `focus-visible:` sowie `outline-`/`ring-` (inkl.
// `ring-offset-`-Farbe) und arbitrary `[…]`-Werte ausser `var(--focus)`.
const FOKUS_FAMILIEN = [...Object.keys(farben), ...DEFAULT_PALETTE.split('|')]
  .filter((f) => f !== 'focus')                       // die Rolle selbst bleibt erlaubt
  .join('|');
const FOKUS_FARB_RE = new RegExp(
  `\\bfocus(?:-visible)?:-?(?:outline|ring|ring-offset)-(?:${FOKUS_FAMILIEN})(?:-[a-z0-9.]+)?(?:/[0-9.]+)?\\b`, 'g');
const FOKUS_ARB_RE = /\bfocus(?:-visible)?:-?(?:outline|ring|ring-offset)-\[(?!var\(--focus\))[^\]]+\]/g;
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
// ── Verbot: Ad-hoc-Scrim (F2-1, Design-Konsistenz Runde 2, 31.8.2026) ───────
// Die abdunkelnde Fläche hinter einem Overlay hat DREI Rollen mit je EINER
// Deckung (`--scrim` 30 % Blatt/Menü · `--scrim-dialog` 40 % zentrierter Dialog ·
// `--scrim-voll` 50 % Vollflächen-Schublade, src/index.css) und trägt sie über
// `.lc-scrim*`. Gefunden wurden SIEBEN Fundstellen als Utility-Kette, davon DREI
// mit `bg-ink-900/<alpha>` — und das ist kein Geschmack, sondern ein Fehler:
// `--ink-900` flippt mit dem Thema (hell #201E16, dunkel #E9E7E2), ein
// `bg-ink-900/30` HELLT im Dunkelmodus also auf, statt abzudunkeln (gemessene
// Leuchtdichte im Lesefeld, `v3/LeserScrim.tsx`: hell 237.5 → 166.1, dunkel
// 32.7 → 23.0 nur mit der schwarzen Fassung). Die bestehenden Schranken griffen
// knapp daneben: `ink-900` steht in der Config (FARB_RE grün), ist keine
// Default-Palette-Farbe (DEFAULT_FARB_RE grün) und erzeugt eine wirksame
// Deckkraft-Regel (Prüfung 3 grün).
// GELTUNG eng: nur wo die Klassen-Kette WIRKLICH ein Scrim aufspannt, also
// zusammen mit `inset-0`. Ein gedimmtes Element im Fluss ist nicht gemeint.
// `bg-black/<alpha>` fällt mit darunter, obwohl die FARBE dort richtig ist: die
// Deckung stünde sonst wieder als freie Zahl im JSX — und ein Wächter, der die
// letzte verbliebene Fundstelle ausnimmt, ist keiner (§6.7). Darum ist mit F2-1
// auch `layout/Shell.tsx` (50 %) mitgezogen worden.
// KOMMENTARZEILEN BLEIBEN FREI: die Herleitungen im Haus nennen den Vorzustand
// beim Namen («Gebaut war ein Vollflächen-Scrim (`fixed inset-0 bg-ink-900/30`)
// …», LeserPanelZone:48) — ein datierter Beleg altert nicht und wird nicht
// nachgeführt (§2b). Dieselbe Trennung fährt `src/tests/design-r2c-bausteine.test.ts`.
// Die übrigen Prüfungen oben messen bewusst die ganze Zeile: dort geht es um
// Klassen, die im Bestand nicht als Beleg zitiert werden.
const SCRIM_RE = /\bbg-(?:black|ink-\d{3})\/[0-9.]+\b/;
const SCRIM_TRAEGER_RE = /\binset-0\b/;
const KOMMENTAR_ZEILE_RE = /^\s*(?:\/\/|\*|\/\*|\{\/\*)/;
// ── Deckkraft-Suffix (Prüfung 3, D0): <praefix>-<farbe>/<alpha>. Bewusst OHNE
// Familien-Filter — auch die Tailwind-Keyword-Farben (bg-black/50) laufen mit,
// die Kompilation entscheidet. Nur Farb-Präfixe, damit w-1/2 & Co. nicht greifen.
//
// BEIDE SEITEN DÜRFEN AUCH IN KLAMMERN STEHEN (D0-Wurzel-Fix 5.9.2026). Der
// Ausdruck verlangte hinter dem Präfix einen benannten Token (`[a-z]+…`) und
// hinter dem Schrägstrich eine nackte Zahl. Damit sah Prüfung 3 die
// ARBITRARY-Schreibweise nicht — und genau die ist im Haus ausdrücklich
// erlaubt: ARBITRARY_FARB_RE verbietet nur `#`/`rgb`/`hsl` und lässt
// `…-[var(--token)]` als «Token-Escape» stehen (2 Fundstellen im Bestand,
// `text-[var(--placeholder)]` und `shadow-[var(--ring)]`). Wer an eine davon
// ein `/60` hängt, schreibt den D0-Fehler in seiner reinsten Form:
//   GEMESSEN 5.9.2026 (`postcss([tailwindcss(config)])`, Repo-Config):
//     bg-paper-sunken/60           → background-color: color-mix(…)   REGEL
//     bg-[var(--paper-sunken)]/60  → —                                KEINE REGEL
//     text-[var(--brass-700)]/55   → —                                KEINE REGEL
//     border-[var(--line)]/60      → —                                KEINE REGEL
// Reproduziert am Wächter selbst: `bg-[var(--paper-sunken)]/60` in eine
// Komponente gepflanzt liess `check:design-tokens` GRÜN durchlaufen (Exit 0),
// obwohl die Klasse keine einzige CSS-Regel erzeugt. `alphaFaehig()` in
// tailwind.config.js kann daran nichts ändern: der Wert kommt gar nicht aus dem
// Farbbaum, sondern steht roh in der Klasse — der Fix gehört an den WÄCHTER,
// nicht an die Config.
// Die arbitrary ALPHA-Seite (`/[0.6]`) läuft aus demselben Grund mit: sie
// funktioniert heute, war aber unbewacht — fiele `alphaFaehig()` weg, ginge sie
// still mit unter. Kein Familien-Filter, keine Sonderregel: was wie eine
// Deckkraft-Klasse aussieht, wird kompiliert, und die Kompilation urteilt.
// Der abschliessende `\b` ist ENTFALLEN — er kann hinter `]` nicht greifen; die
// Zahl-Alternative ist stattdessen exakt gefasst (`60`, `0.6`, nie `60.`).
const ALPHA_FARBE = `(?:[a-z]+(?:-[a-z0-9]+)*|\\[[^\\]\\s]+\\])`;
const ALPHA_WERT = `(?:[0-9]+(?:\\.[0-9]+)?|\\[[^\\]\\s]+\\])`;
const ALPHA_UTIL_RE = new RegExp(`\\b(?:${PRAEFIX})-${ALPHA_FARBE}\\/${ALPHA_WERT}`, 'g');

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
    for (const re of [FOKUS_FARB_RE, FOKUS_ARB_RE]) {
      let fm: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((fm = re.exec(zeile)) !== null)
        fehler.push(`${datei}:${i + 1} — eigene Fokusring-Farbe «${fm[0]}» (E-1, §13 F3). Der Ring hat EINE Rolle (--focus) und kommt aus der globalen «:focus-visible»-Regel in src/index.css: Farb- und Breiten-Utilities ersatzlos streichen, nur einen wirklich nötigen Offset (focus-visible:-outline-offset-2) behalten.`);
    }
    if (OVERLINE_DIM_RE.test(zeile))
      fehler.push(`${datei}:${i + 1} — lc-overline mit text-ink-500/400/300 gedimmt (AA-Fail bei 11px, D-1.2/E1). Override strippen — lc-overline trägt die kalibrierte ink-600-Basis.`);
    let wm: RegExpExecArray | null;
    WHITE_UTIL_RE.lastIndex = 0;
    while ((wm = WHITE_UTIL_RE.exec(zeile)) !== null)
      fehler.push(`${datei}:${i + 1} — Reinweiss-Utility «${wm[0]}» (§13-Nachtrag d / Reinweiss-Invariante). Warme Fläche/Tinte nutzen: bg-paper*/bg-surface* bzw. text-paper (nie #FFFFFF als Lesefläche).`);
    if (INLINE_WHITE_RE.test(zeile))
      fehler.push(`${datei}:${i + 1} — Reinweiss #fff im Inline-Style (§13-Nachtrag d / Reinweiss-Invariante). Token nutzen: var(--paper*)/var(--surface*) bzw. var(--paper) für Tinte auf Dunkel.`);
    if (!KOMMENTAR_ZEILE_RE.test(zeile) && SCRIM_RE.test(zeile) && SCRIM_TRAEGER_RE.test(zeile)) {
      const sm = SCRIM_RE.exec(zeile);
      fehler.push(`${datei}:${i + 1} — Ad-hoc-Scrim «${sm?.[0]}» auf einer inset-0-Fläche (F2-1). Der Scrim hat drei Rollen mit je EINER Deckung: .lc-scrim (Blatt/Menü, 30 %), .lc-scrim-dialog (zentrierter Dialog, 40 %), .lc-scrim-voll (Vollflächen-Schublade, 50 %) — src/index.css. bg-ink-900/… ist zusätzlich falsch: --ink-900 flippt mit dem Thema und hellt im Dunkelmodus auf, statt abzudunkeln.`);
    }
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

// ── Prüfung 3b: `sage` ist die Materialien-Kennfarbe, nicht die ok-Rolle ─────
//
// GEMESSEN (Design-Konsistenz R3-α/A3-6, 31.8.2026): neun Flächen färbten einen
// ZUSTAND («Frist endet» · «Gültig» · «nicht verjährt» · «zustimmen» · «Summe
// stimmt») mit `sage-*` ein — der WERKSTOFF-Kennfarbe der Materialien. Die
// Zustands-Rolle `--ok-*` existiert seit F1 (§4b-B-i) und ist wertidentisch;
// genau deshalb fiel die Vermischung nie auf, und genau deshalb ist sie
// gefährlich: verschiebt sich eines der beiden Konzepte, verschieben sich
// stillschweigend beide (Befunde 7+37). `FristenKalender` mischte sogar BEIDE
// Familien in EINER Zelle (Füllung sage, Ring `--ok-solid`).
//
// REGEL: `sage-*`-Utilities und `var(--sage-*)` sind ausserhalb von
// `src/index.css` (wo die Rolle definiert wird) nur mit einer Begründung AM
// FUNDORT zulässig. Der Wächter zitiert sie wörtlich — verschwindet sie, fällt
// die Ausnahme mit ihr.
{
  /** Fundort-Ausnahmen: Datei → Satz, der dort stehen MUSS. */
  const SAGE_AUSNAHMEN: Record<string, string> = {
    // Bandfarben eines Diagramms, keine Status-Aussage: die sechs Werte sind
    // eine KATEGORIALE Reihe (Zinssatz-Abschnitte), in der sage neben brass,
    // slate und warn nur eine unterscheidbare Fläche ist.
    'src/components/VerzugszinsTimeline.tsx': 'A3-6-AUSNAHME (R3-α, 31.8.2026): kategoriale Bandfarbe, kein Zustand',
  };
  const SAGE_RE = /(?:^|[\s"'`:])(?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|shadow|accent|caret)-sage-[a-z0-9]+|var\(--sage-[a-z0-9-]+\)/;
  for (const datei of dateien(WURZEL)) {
    const roh = readFileSync(datei, 'utf8');
    const begruendung = SAGE_AUSNAHMEN[datei];
    if (begruendung !== undefined) {
      if (!roh.includes(begruendung))
        fehler.push(`${datei} — A3-6-Ausnahme ohne Begründung am Fundort: der Satz «${begruendung}» steht dort nicht (mehr). Entweder die Begründung zurückschreiben oder die Fläche auf die ok-Rolle ziehen.`);
      continue;
    }
    roh.split('\n').forEach((zeile, i) => {
      if (KOMMENTAR_ZEILE_RE.test(zeile)) return;   // Belege dürfen sage nennen (§2b)
      const sm = SAGE_RE.exec(zeile);
      if (sm)
        fehler.push(`${datei}:${i + 1} — «${sm[0].trim()}» färbt einen Zustand mit der Materialien-Kennfarbe «sage» (A3-6, §4b-B-i). Die Zustands-Rolle nutzen: bg-ok-solid / bg-ok-bg / text-ok-text / border-ok-line bzw. var(--ok-solid) — wertidentisch, aber semantisch getrennt.`);
    });
  }
}

// ── Prüfung 4: `theme-color` ist eine Projektion von --paper (E-3) ───────────
// Die Browser-Chrome-Farbe steht an ZWEI Stellen als Literal: statisch in
// `index.html` (die beiden media-Tags decken den Moment vor dem JS ab) und
// dynamisch in `src/components/thema.ts` (das media-lose Tag, das die Wahl
// gegen die Systemvorgabe abbildet). Beide MÜSSEN die Seitenfläche `--paper`
// aus `src/index.css` treffen — sonst sitzt neben der Papierfläche ein
// andersfarbiger Browser-Rahmen. Genau das war der Ist-Stand: hell stand
// überall `#F7F4EC`, `--paper` ist aber `#FCFAF6` (ΔE 2.23, sichtbarer
// Kantensprung auf iOS/Android).
// WARUM WÄCHTER STATT GENERATOR: `index.html` wird vor jedem JS geparst, kann
// also keine TS-Konstante konsumieren — das Literal MUSS dort stehen. Ein
// Generator schriebe es hinein und bräuchte dafür ein zweites Werkzeug plus
// npm-Skript; der Wächter macht dieselbe Zusage («eine Quelle, alles andere
// ist Projektion») ohne neue Erzeugungs-Maschinerie (§17-Gegengewicht).
{
  const css = readFileSync('src/index.css', 'utf8');
  /** Inhalt von `<selektor> { … }` (Klammer-Zählung, Idiom aus check-farbwelt.ts). */
  const block = (selektor: string): string => {
    const start = css.indexOf(selektor);
    if (start < 0) throw new Error(`check-design-tokens: Selektor «${selektor}» fehlt in src/index.css.`);
    let i = css.indexOf('{', start);
    const von = i + 1;
    for (let tiefe = 0; i < css.length; i++) {
      if (css[i] === '{') tiefe++;
      else if (css[i] === '}' && --tiefe === 0) return css.slice(von, i);
    }
    throw new Error(`check-design-tokens: Block «${selektor}» nicht geschlossen.`);
  };
  const paper = (selektor: string): string => {
    const t = /--paper\s*:\s*([^;]+);/.exec(block(selektor));
    if (!t) throw new Error(`check-design-tokens: «--paper» fehlt im Block «${selektor}».`);
    return t[1].trim().toUpperCase();
  };
  const SOLL = { hell: paper('  :root {'), dunkel: paper('  html.dark {') };

  const html = readFileSync('index.html', 'utf8');
  const metaRe = /<meta\s+name="theme-color"\s+content="([^"]+)"\s+media="\(prefers-color-scheme:\s*(light|dark)\)"/g;
  const gefunden = new Set<string>();
  let mm: RegExpExecArray | null;
  while ((mm = metaRe.exec(html)) !== null) {
    const rolle = mm[2] === 'light' ? 'hell' : 'dunkel';
    gefunden.add(rolle);
    if (mm[1].toUpperCase() !== SOLL[rolle])
      fehler.push(`index.html — theme-color (${mm[2]}) «${mm[1]}» ≠ --paper ${rolle} «${SOLL[rolle]}» aus src/index.css (E-3). Die Chrome-Farbe ist eine Projektion der Seitenfläche, nie ein eigener Wert (§5).`);
  }
  for (const rolle of ['hell', 'dunkel'] as const)
    if (!gefunden.has(rolle))
      fehler.push(`index.html — theme-color-Tag für «${rolle}» fehlt (E-3). Beide media-Varianten decken den Moment vor dem JS ab.`);

  const thema = readFileSync('src/components/thema.ts', 'utf8');
  const tm = /m\.content\s*=\s*dunkel\s*\?\s*'(#[0-9A-Fa-f]{3,8})'\s*:\s*'(#[0-9A-Fa-f]{3,8})'/.exec(thema);
  if (!tm)
    fehler.push('src/components/thema.ts — die theme-color-Zuweisung («m.content = dunkel ? … : …») ist nicht mehr auffindbar (E-3). Wächter und Fundstelle zusammen nachziehen, nicht den Wächter blenden.');
  else {
    if (tm[1].toUpperCase() !== SOLL.dunkel)
      fehler.push(`src/components/thema.ts — theme-color dunkel «${tm[1]}» ≠ --paper dunkel «${SOLL.dunkel}» aus src/index.css (E-3).`);
    if (tm[2].toUpperCase() !== SOLL.hell)
      fehler.push(`src/components/thema.ts — theme-color hell «${tm[2]}» ≠ --paper hell «${SOLL.hell}» aus src/index.css (E-3).`);
  }
}

if (fehler.length > 0) {
  console.error(`Token-Schranke ROT — ${fehler.length} Verstoss/Verstösse (DESIGN-REGLEMENT B2/F7/§13):`);
  for (const f of fehler) console.error('  ' + f);
  process.exit(1);
}
console.log(`Token-Schranke ok — Typo-Skala sauber, alle Farb-Utilities in der Config (${GUELTIG.size} gültige Stufen), ${alphaFunde.size} Deckkraft-Klassen erzeugen eine wirksame Regel.`);
