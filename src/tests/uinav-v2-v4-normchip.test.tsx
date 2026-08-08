import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NormChip } from '../components/vorlagen/NormChip';
import { readerHrefFuerRef } from '../components/vorlagen/chipZiel';
import { LocaleProvider } from '../components/locale';
import { HOVER_OEFFNEN_MS, HOVER_SCHLIESSEN_MS, istHoverZeiger } from '../components/hoverVorschau';
import { bundSnapshotRef } from '../lib/normtext/bundRef';

// ─── W2·10-UI-NAV · V2 (Hover-Vorschau) + V4 (interner Chip-href) ───────────
//
// Test-Technik wie im Repo üblich: node-Env ohne jsdom. Die DOM-Gesten selbst
// (Zeiger, Cmd-Klick) sind darum NICHT hier, sondern in
// `e2e/uinav-v2-v4-normchip.e2e.ts`; hier liegen die reinen Entscheidungen, die
// den Gesten zugrunde liegen — und der SSR-Beweis, dass der Erst-Render den
// internen Pfad trägt (die Cmd-Klick-Wirkung entsteht genau aus diesem href,
// nicht aus JavaScript).

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);

describe('V4 — readerHrefFuerRef (reine Adressierung)', () => {
  it('baut den Bund-Reader-Pfad mit Artikel-Anker (art_-Präfix fällt weg)', () => {
    expect(readerHrefFuerRef({ quelle: 'OR', token: 'art_335_c' })).toBe('/gesetze/bund/OR#art-335_c');
    expect(readerHrefFuerRef({ quelle: 'STGB', token: 'art_321' })).toBe('/gesetze/bund/STGB#art-321');
  });

  it('kodiert den Erlass-Schlüssel (kein roher Pfad-Einschub)', () => {
    expect(readerHrefFuerRef({ quelle: 'A/B', token: 'art_1' })).toBe('/gesetze/bund/A%2FB#art-1');
  });

  it('Prüfpunkt der Spec: «Art. 321 StGB» löst auf den eigenen Reader auf', () => {
    // Der Spec-Prüfpunkt lautet: Cmd-Klick auf «Art. 321 StGB» (zitiert in
    // BGE 152 I 65) landet intern. Genau diese Kette wird hier belegt —
    // Zitat → Snapshot-Bezug → interner Pfad.
    const ref = bundSnapshotRef('Art. 321 StGB');
    expect(ref).not.toBeNull();
    expect(readerHrefFuerRef(ref!)).toBe('/gesetze/bund/STGB#art-321');
  });
});

describe('V4 — SSR: interner href, Fallback bleibt', () => {
  it('mit Snapshot: interner Pfad, kein target/rel (SPA-Navigation)', () => {
    const out = ssr(<NormChip artikel="Art. 321 StGB" />);
    expect(out).toContain('href="/gesetze/bund/STGB#art-321"');
    expect(out).not.toContain('target="_blank"');
    expect(out).not.toContain('noopener');
  });

  it('ohne Snapshot: Fedlex-<a> mit target/rel unverändert (progressive enhancement)', () => {
    const out = ssr(<NormChip artikel="Art. 5 LugÜ" hrefOverride="https://www.fedlex.admin.ch/eli/cc/2010/583/de#art_5" />);
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/href="[^"]*fedlex[^"]*"/);
  });

  it('unbekanntes Gesetz ohne URL: reiner span-Chip wie bisher', () => {
    const out = ssr(<NormChip artikel="Art. 8 ZZG" />);
    expect(out).toContain('lc-chip');
    expect(out).not.toContain('<a');
  });
});

describe('V2 — Hover-Anatomie (eine Wahrheit für alle Vorschau-Chips)', () => {
  it('Touch öffnet NIE per Hover (dort bleibt es beim Klick)', () => {
    expect(istHoverZeiger('touch')).toBe(false);
  });

  it('Maus und Stift öffnen per Hover', () => {
    expect(istHoverZeiger('mouse')).toBe(true);
    expect(istHoverZeiger('pen')).toBe(true);
  });

  it('Öffnen erst nach ruhendem Zeiger — Spec «~500 ms», nicht sofort', () => {
    expect(HOVER_OEFFNEN_MS).toBeGreaterThanOrEqual(300);
    expect(HOVER_OEFFNEN_MS).toBeLessThanOrEqual(600);
  });

  it('Schliess-Nachlauf ist kürzer als die Öffnungs-Verzögerung, aber > 0 (WCAG 1.4.13)', () => {
    expect(HOVER_SCHLIESSEN_MS).toBeGreaterThan(0);
    expect(HOVER_SCHLIESSEN_MS).toBeLessThan(HOVER_OEFFNEN_MS);
  });

  it('SSR: der Hover-Weg fügt dem Erst-Render nichts hinzu (kein Popover, §15 lazy)', () => {
    const out = ssr(<NormChip artikel="Art. 321 StGB" />);
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('Norm-Vorschau');
  });
});
