// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ─── LESER-TYPOGRAFIE: die Grösse ist ein TOKEN, nie ein roher Wert ──────────
//
// W2·5m-LESER-V3 · S2 (Pos. 19), Entscheid David 17.8.2026 am Bildbogen
// (`docs/ux-audit-2026-07/reader/leser-v3-s2/bogen.html`): F3 = V2 «amtsnah
// kompakt», Fussnotenmarke hochgestellt. Der Leser-Fliesstext läuft seither auf
// der Stufe `leser-text` (1.0625 rem / lh 1.55) statt auf `text-body-l` plus einem
// rohen `leading-[1.65]`-Override.
//
// WAS DIESER WÄCHTER HÄLT — und warum er nicht schon durch `check:design-tokens`
// gedeckt ist: das Tor verbietet rohe Grössen-Literale wie `text-[19px]`. Es sagt
// aber nichts darüber, ob eine Stufe hinterher durch ein ARBITRARY LEADING wieder
// aufgebrochen wird (`leading-[1.65]` ist eine Zeilenhöhe, keine Grösse) und
// nichts darüber, ob die Stufen-Werte selbst noch stimmen. Genau diese zwei Lücken
// deckt er ab. Die Design-Grundlage Kap. 8 Nr. 4 verlangt ausdrücklich «kein fixer
// Leading-Wert über alle Grössen» — der Zeilenabstand gehört zur Stufe.
//
// ROT ZU BEKOMMEN (§6.7, beide Fälle einmal gezeigt): in `ArtikelLeser.tsx`
// `text-leser-text` durch `text-body-l leading-[1.65]` ersetzen (Fall 2 rot), oder
// in `tailwind.config.js` einen der drei Stufen-Werte verstellen (Fall 1 rot).

function lies(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
}

/** Die Dateien, die den Leser-WORTLAUT setzen (Fliesstext, Ingress, Apparat). */
const WORTLAUT_DATEIEN = [
  '../pages/gesetz-leser/parts/ArtikelLeser.tsx',
  '../pages/gesetz-leser/parts/ErlassKopfBlock.tsx',
  '../pages/gesetz-leser/parts/SektionKopf.tsx',
  '../pages/gesetz-leser/helpers.tsx',
  '../components/normtext/ArtikelBody.tsx',
  '../components/normtext/ArtikelBody.zitier.tsx',
] as const;

// Der EINE zugelassene Arbitrary-Wert, und zwar als Token-Escape, nicht als Wert:
// `text-[length:var(--hochgestellt)]` reicht die CSS-Variable `--hochgestellt` (index.css)
// durch, weil Tailwind für em-relative Grössen keine Stufe anbieten kann — die
// Fussnotenmarke MUSS em-relativ bleiben, damit sie dem Fliesstext und dem
// Schriftgrössen-Regler folgt statt sich zu entkoppeln. Ein Token bleibt es, weil
// der WERT genau einmal definiert ist (index.css), nicht an sechs Klassen.
const TOKEN_ESCAPE = /text-\[length:var\(--hochgestellt\)\]/g;

describe('S2 · Leser-Typografie-Tokens', () => {
  it('die drei Leser-Stufen stehen mit den Werten des Entscheids in tailwind.config.js', () => {
    const cfg = lies('../../tailwind.config.js');
    // V2-Spalte des Fahrplans Kap. 8, mit der EINEN Abweichung beim Marker
    // (hochgestellt statt in Klammern — die betrifft `--hochgestellt`, nicht diese Stufen).
    const erwartet: Array<[string, string, string]> = [
      ['leser-text', '1.0625rem', '1.55'],   // Fliesstext 17 px
      ['leser-rand', '0.8125rem', '1.35'],   // Marginalie/Randtitel 13 px, Sans
      // Fussnoten-Apparat 11 px. ZEILENHÖHE 1.3 → 1.45 NACHGEFÜHRT (T3,
      // Design-Qualitäts-Pass 29.8.2026): deklarierte fachliche Änderung
      // (§6.3), kein aufgeweichter Wächter — die Prüfung bleibt exakt gleich
      // streng und bindet weiterhin an EINEN festgelegten Wert; nur der Wert
      // selbst ist entschieden worden. Herleitung samt Messung steht am Token
      // in `tailwind.config.js`. Die GRÖSSE (0.6875 rem, Entscheid David
      // 17.8.2026 am Bildbogen) ist unverändert gebunden.
      ['leser-fn', '0.6875rem', '1.45'],
    ];
    for (const [name, groesse, lh] of erwartet) {
      const treffer = new RegExp(`'${name}':\\s*\\['([0-9.]+rem)',\\s*\\{\\s*lineHeight:\\s*'([0-9.]+)'`).exec(cfg);
      expect(treffer, `Stufe «${name}» fehlt in tailwind.config.js`).not.toBeNull();
      expect(treffer![1], `Stufe «${name}»: Grösse abgewichen`).toBe(groesse);
      expect(treffer![2], `Stufe «${name}»: Zeilenhöhe abgewichen`).toBe(lh);
    }
  });

  it('kein rohes text-[…] oder leading-[…] im Leser-Wortlaut (nur der --hochgestellt-Escape)', () => {
    // WICHTIG: Kommentare zuerst raus. Sonst hält der Wächter die eigene
    // Herleitung für einen Verstoss — die Kommentare oben ZITIEREN `leading-[1.65]`
    // als das, was abgelöst wurde, und das muss zitierbar bleiben.
    const funde: string[] = [];
    for (const datei of WORTLAUT_DATEIEN) {
      const code = lies(datei)
        .replace(/\/\*[\s\S]*?\*\//g, '')     // Blockkommentare (auch JSX-{/* … */})
        .replace(/^\s*\/\/.*$/gm, '')          // Zeilenkommentare
        .replace(TOKEN_ESCAPE, '');            // der zugelassene Token-Escape
      for (const m of code.matchAll(/\b(?:text|leading)-\[[^\]]+\]/g)) {
        funde.push(`${datei.replace('../', 'src/')}: ${m[0]}`);
      }
    }
    expect(funde, `rohe Grössen-/Leading-Overrides im Leser-Wortlaut:\n${funde.join('\n')}`)
      .toEqual([]);
  });

  it('der Fliesstext trägt die Stufe — und keinen zweiten Zeilenabstand daneben', () => {
    const code = lies('../pages/gesetz-leser/parts/ArtikelLeser.tsx');
    // Die `className`-Zuweisung an den ArtikelBody ist die eine Stelle, an der die
    // Fliesstext-Stufe gesetzt wird. Sie muss `text-leser-text` tragen; ein
    // `leading-`-Zusatz daneben (auch ein Token wie `leading-relaxed`) würde die
    // Zeilenhöhe der Stufe wieder überschreiben.
    const zeile = code.split('\n').find((l) => l.includes('text-leser-text') && l.includes('font-serif'));
    expect(zeile, 'Fliesstext-Klasse mit `font-serif text-leser-text` nicht gefunden').toBeTruthy();
    expect(zeile!, 'Fliesstext trägt neben der Stufe einen eigenen Zeilenabstand')
      .not.toMatch(/\bleading-/);
  });

  it('keine Leader-Klasse steht auf DEMSELBEN Element wie eine Leser-Stufe', () => {
    // DER BEFUND, der diesen Fall erzwungen hat (S2, 17.8.2026): der arbitrary-Wächter
    // oben prüft nur `leading-[…]`. Ein Tailwind-LEADING-TOKEN (`leading-relaxed`,
    // `leading-snug`) schlägt die Zeilenhöhe der Stufe aber genauso — und tat es:
    // `ArtikelBody` setzte `leading-relaxed` (1.625) unbedingt auf den Block-Wrapper,
    // die Absätze liefen also auf 1.625 statt auf den 1.55 des Entscheids. Aufgefallen
    // ist es nur, weil der WCAG-Fall in `e2e/leser-lesemass.e2e.ts` GRÜN blieb, als die
    // Stufe versuchsweise auf lh 1.4 gesetzt wurde — ein Wert, der durchschlagen müsste.
    // Welche Deklaration gewinnt, entscheidet dabei die Reihenfolge im generierten
    // Stylesheet, nicht die Reihenfolge im `class`-Attribut: so ein Paar ist immer eine
    // Wette, nie eine Zusage.
    const funde: string[] = [];
    for (const datei of WORTLAUT_DATEIEN) {
      const code = lies(datei)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      // Nur echte Klassen-Zeichenketten, kein Prosa-Text: die Zeile muss beides
      // tragen — eine `text-leser-*`-Stufe UND eine `leading-`-Klasse.
      for (const zeile of code.split('\n')) {
        if (!/text-leser-(text|rand|fn)\b/.test(zeile)) continue;
        const leader = /\bleading-[a-z0-9[\]./-]+/.exec(zeile);
        if (leader) funde.push(`${datei.replace('../', 'src/')}: ${leader[0]}`);
      }
    }
    expect(funde, `Zeilenhöhe wird neben der Stufe ein zweites Mal gesetzt:\n${funde.join('\n')}`)
      .toEqual([]);
  });

  it('--hochgestellt ist genau EINMAL definiert (§5) und em-relativ', () => {
    const css = lies('../index.css');
    const defs = [...css.matchAll(/--hochgestellt\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(defs, 'Fussnotenmarke ist nicht genau einmal definiert (§5)').toHaveLength(1);
    // em-relativ, nicht rein absolut: die Marke muss dem Fliesstext UND dem
    // Schriftgrössen-Regler folgen. Ein reiner px/rem-Wert entkoppelte sie.
    //
    // T5 (29.8.2026) NACHGEFÜHRT: der Wert ist seither `max(.72em,.6875rem)` —
    // em-Anteil führend, darunter ein Lesbarkeits-Boden (Herleitung am Token in
    // `index.css`). Die frühere Fassung prüfte `/em$/`; das band nicht die
    // Eigenschaft, sondern die SCHREIBWEISE (und «.6875rem» endet ebenfalls auf
    // «em» — der Wächter hätte einen reinen rem-Wert durchgelassen, solange er
    // am Ende steht). Die Prüfung ist damit nicht gelockert, sondern schärfer:
    // ein em-Term MUSS vorkommen, und ein rein absoluter Wert fällt jetzt
    // wirklich durch. Rot gesehen: `--hochgestellt:.6875rem;` scheitert an der
    // ersten Zusicherung, `--hochgestellt:12px;` an beiden.
    expect(defs[0], 'Fussnotenmarke braucht einen em-relativen Anteil, sonst folgt sie dem Regler nicht')
      .toMatch(/[0-9]em\b/);
    expect(defs[0], 'Fussnotenmarke darf nicht rein absolut (px/rem) gesetzt sein')
      .not.toMatch(/^[0-9.]+(px|rem)$/);
  });
});
