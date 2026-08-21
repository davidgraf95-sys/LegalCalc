/**
 * Der Fussnoten-Toggle (`html[data-fussnoten="aus"]`) — hüllenneutrale
 * CSS-Regel (`.lc-leser`-Scope, kein React-Zweig im Artikel-Baum).
 *
 * ANLASS (Treuebruch 16.8.2026, gemessen, PR #539 / Stand 5e90082e3): Die Regel
 * suchte den Fussnoten-MARKER über seinen ACCESSIBLE NAME
 * (`button[aria-label^="Fussnote"]`) und traf damit in V3 auch den SCHALTER im
 * Ansicht-Menü («Fussnoten (283)») — er blendete sich selbst aus. Der Fix
 * verengte den Selektor damals auf `#lc-lesespalte`. Gemessen an der damaligen
 * Ist-Hülle (BGBM, localhost-Preview, inzwischen mit H5 gelöscht): 4 von 29
 * Marker-Buttons lagen AUSSERHALB `#lc-lesespalte` (Erlasskopf/Ingress) — die
 * Verengung schaltete dort still ab und verletzte die damalige Zusage FL-4
 * (ohne Flag bitgleich).
 *
 * WURZEL-FIX: Der Marker trägt eine eigene Kennung `data-fn-ref`
 * (`src/components/normtext/ArtikelBody.tsx`); die CSS-Regel greift darüber und
 * gar nicht mehr über Text. Der Schalter trägt die Kennung nicht.
 *
 * Dieses Tor hält den Mechanismus fest, der ursprünglich bis zur CI unbemerkt
 * blieb — es ist billiger als ein zweites e2e.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
const artikelBody = readFileSync(
  fileURLToPath(new URL('../components/normtext/ArtikelBody.tsx', import.meta.url)),
  'utf8',
);

/** Die Selektor-Liste des `data-fussnoten="aus"`-Blocks (bis zur öffnenden `{`). */
function toggleSelektoren(): string[] {
  const start = css.indexOf('html[data-fussnoten="aus"]');
  expect(start, 'Regelblock html[data-fussnoten="aus"] fehlt in src/index.css').toBeGreaterThan(-1);
  const ende = css.indexOf('{', start);
  expect(ende).toBeGreaterThan(start);
  return css
    .slice(start, ende)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

describe('Fussnoten-Toggle schaltet hüllenneutral (V1 = V3)', () => {
  it('kein Selektor sucht den Marker über seinen accessible name (aria-label)', () => {
    const ueberText = toggleSelektoren().filter((s) => s.includes('aria-label'));
    expect(
      ueberText,
      'CSS darf Elemente nicht über ihren Text suchen — sonst trifft die Regel den Schalter mit',
    ).toEqual([]);
  });

  it('kein Selektor ist auf einen hüllen-spezifischen Wrapper gescopt', () => {
    // `.lc-leser` ist der einzige Wurzelknoten, den BEIDE Hüllen tragen.
    // `#lc-lesespalte` gibt es zwar in beiden, aber Erlasskopf/Ingress liegen
    // ausserhalb davon — ein Scope darauf verliert Marker (gemessen: 4/29 BGBM).
    const engeScopes = toggleSelektoren().filter((s) => s.includes('#lc-lesespalte'));
    expect(
      engeScopes,
      'Erlasskopf/Ingress liegen ausserhalb #lc-lesespalte — dort schaltet der Toggle sonst nicht',
    ).toEqual([]);
  });

  it('jeder Selektor ist auf .lc-leser gescopt (nur der Gesetzes-Reader, nie das Norm-Popover)', () => {
    for (const s of toggleSelektoren()) {
      expect(s, `Selektor ohne .lc-leser-Scope: ${s}`).toContain('.lc-leser ');
    }
  });

  it('die Marker-Kennung data-fn-ref wird von der Regel benutzt UND vom Marker gesetzt', () => {
    expect(toggleSelektoren().some((s) => s.includes('[data-fn-ref]'))).toBe(true);
    // Zeigt die Regel ins Leere, schaltet der Toggle gar nichts mehr.
    expect(artikelBody, 'ArtikelBody setzt data-fn-ref nicht mehr').toMatch(/data-fn-ref\b/);
  });

  it('der Ansicht-Schalter trägt die Marker-Kennung nicht (sonst blendet er sich selbst aus)', () => {
    // `LeserAnsichtMenu.tsx` (Ist-Hülle) gelöscht 21.8.2026 (H5) — nur noch
    // der eine verbliebene Ansicht-Schalter wird geprüft.
    for (const datei of ['../pages/gesetz-leser/v3/LeserAnsichtV3.tsx']) {
      const quelle = readFileSync(fileURLToPath(new URL(datei, import.meta.url)), 'utf8');
      expect(quelle, `${datei} trägt data-fn-ref — der Schalter blendet sich selbst aus`).not.toMatch(
        /data-fn-ref\b/,
      );
    }
  });
});
