import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { SeitenTitel } from '../components/ui/SeitenTitel';
import { PaneProvider } from '../components/layout/PaneKontext';

// ─── A-1 (W2·19-DESIGN-KONSISTENZ, 31.8.2026) · EIN SEITENTITEL ─────────────
//
// Die H1 der Seite war an vier Stellen von Hand nachgebaut und trug überall die
// VIEWPORT-Kaskade `text-h2 sm:text-h1`. Im Split-View ist der Viewport die
// falsche Zahl (Herleitung in `components/ui/SeitenTitel.tsx` und in
// `pages/gesetz-leser/v3/kopfStufen.ts` Z. 17/18).
//
// ROT ZU BEKOMMEN (§6.7, am 31.8.2026 vor dem Bau gesehen):
//  · den `usePaneKlasse`-Aufruf in `SeitenTitel` durch die feste Viewport-Kette
//    ersetzen → «im Pane container-basiert» fällt;
//  · in einer der vier Konsumenten-Dateien die H1 wieder von Hand schreiben →
//    die Quellensonde unten fällt (sie war vor dem Bau in ALLEN vier rot).

const KEIN_PANE = { imPane: false as const, rolle: 'primaer' as const, wurzel: null, overlayWurzel: null };
const IM_PANE = { imPane: true as const, rolle: 'sekundaer' as const, wurzel: null, overlayWurzel: null };

describe('A-1 — SeitenTitel: EINE Grössen-Kaskade, kontextabhängig gemessen', () => {
  it('ausserhalb eines Panes: zeichengleich zum Vorzustand (Prerender unberührt)', () => {
    const html = renderToString(<SeitenTitel>Streitwert</SeitenTitel>);
    expect(html).toContain('class="text-h2 sm:text-h1 font-display font-semibold text-ink-900"');
  });

  it('im Pane: die Kaskade misst die PANE-Breite, nicht den Viewport', () => {
    const html = renderToString(
      <PaneProvider value={IM_PANE}><SeitenTitel>Streitwert</SeitenTitel></PaneProvider>,
    );
    expect(html).toContain('@xl/pane:text-h1');
    expect(html, 'der Viewport-Zweig steht im Pane noch da').not.toContain('sm:text-h1');
  });

  it('Zwei-Stimmen-Regel (§e): `serif` ersetzt die Display-Stimme, nichts sonst', () => {
    const html = renderToString(
      <PaneProvider value={KEIN_PANE}>
        <SeitenTitel stimme="serif" className="min-h-titel-2z">OR</SeitenTitel>
      </PaneProvider>,
    );
    expect(html).toContain('class="text-h2 sm:text-h1 font-serif font-semibold text-ink-900 min-h-titel-2z"');
    expect(html).not.toContain('font-display');
  });

  it('POSITIV-SONDE: es ist eine <h1> — sonst prüfte alles oben nur eine Klassenzeile', () => {
    expect(renderToString(<SeitenTitel>X</SeitenTitel>)).toMatch(/^<h1 /);
  });
});

// Die vier Flächen, die den Titel bis 31.8.2026 je einzeln nachbauten. Der
// `EntscheidLeser` fehlt hier bewusst: er zieht im Paket BAU-4 nach und ist bis
// dahin der ausgewiesene Rest (Fahrplan §3, Befund A-2/A-5/B-5).
const KONSUMENTEN = [
  'src/components/layout/SeitenKopf.tsx',
  'src/components/layout/RechnerKopf.tsx',
  'src/components/vorlagen/wizard.tsx',
  'src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx',
];

describe('A-1 — keine zweite Titel-Anatomie mehr (§5/§10)', () => {
  it('POSITIV-SONDE: alle vier Konsumenten beziehen den Baustein', () => {
    for (const datei of KONSUMENTEN) {
      expect(readFileSync(datei, 'utf8'), `${datei} importiert SeitenTitel nicht`)
        .toMatch(/import \{ SeitenTitel \} from/);
    }
  });

  it('keiner baut die H1-Kaskade noch von Hand nach', () => {
    for (const datei of KONSUMENTEN) {
      const quelle = readFileSync(datei, 'utf8');
      expect(/<h1[^>]*text-h2/.test(quelle), `${datei} trägt wieder eine handgebaute H1`).toBe(false);
    }
  });
});
