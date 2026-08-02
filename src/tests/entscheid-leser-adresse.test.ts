import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { urlMitHash } from '../pages/entscheidLeserRegeln';

// ─── W2·17-UI-BEFUNDE-B2 / Los E — Adress-Zustand des Entscheid-Lesers ───────
//
// LM-209: jeder Klick auf einen Abschnittsreiter erzeugte einen Verlaufseintrag
// (Prod-Messung 2.8.2026: `history.length` 4 → 5 → 6 → 7 bei drei Klicks).
// Ursache war kein Zustands-Konzept, sondern die gewählte Implementierung:
// schlichte `<a href="#abschnitt-…">` pushen browsernativ.
//
// Die History-Zählung selbst ist nur im Browser messbar (e2e/Chromium). Prüfbar
// sind hier die zwei Bedingungen, aus denen sie folgt:
//   (1) die reine Adress-Regel (Hash setzen, Query/Pfad unberührt), und
//   (2) die Verdrahtung im Leser — Klick-Handler statt nacktem Anker, und
//       `replaceState` statt `pushState`.
// (2) ist eine Quellen-Sonde: sie ist der einzige browserfreie Weg, den
// Rückfall auf den nackten Anker zu bemerken — und sie war vor dem Fix rot.

const LESER = 'src/pages/EntscheidLeser.tsx';
const quelle = readFileSync(LESER, 'utf8');

/** Rumpf der Reiter-Komponente (bis zur nächsten Top-Level-Funktion). */
function sprungNavigationBlock(): string {
  const ab = quelle.indexOf('function SprungNavigation');
  expect(ab, 'SprungNavigation muss im Leser existieren').toBeGreaterThan(-1);
  const bis = quelle.indexOf('\nfunction ', ab + 1);
  return quelle.slice(ab, bis > ab ? bis : quelle.length);
}

describe('urlMitHash — Abschnitts-Hash in der Adresse (LM-209)', () => {
  it('setzt den Hash und lässt Pfad und Query unberührt', () => {
    expect(urlMitHash('https://x.ch/rechtsprechung/abc?norm=Art.%20367%20OR', 'abschnitt-erwaegung'))
      .toBe('https://x.ch/rechtsprechung/abc?norm=Art.%20367%20OR#abschnitt-erwaegung');
  });

  it('ersetzt einen bereits stehenden Hash (kein Anhängen)', () => {
    expect(urlMitHash('https://x.ch/rechtsprechung/abc#abschnitt-sachverhalt', 'abschnitt-dispositiv'))
      .toBe('https://x.ch/rechtsprechung/abc#abschnitt-dispositiv');
  });

  it('ist idempotent — derselbe Anker erzeugt dieselbe Adresse', () => {
    const eins = urlMitHash('https://x.ch/rechtsprechung/abc', 'e-2-3');
    expect(urlMitHash(eins, 'e-2-3')).toBe(eins);
  });
});

describe('Verdrahtung im Leser (LM-209)', () => {
  it('die Abschnitts-Reiter tragen einen Klick-Handler — kein nackter Anker mehr', () => {
    expect(sprungNavigationBlock()).toMatch(/onClick=/);
  });

  it('sie behalten ihren href (Teilbarkeit: Mittelklick, Kontextmenü, Kopieren)', () => {
    expect(sprungNavigationBlock()).toMatch(/href=\{`#\$\{z\.anker\}`\}/);
  });

  it('der Leser schreibt die Adresse ausschliesslich per replaceState', () => {
    expect(quelle).toMatch(/history\.replaceState\(/);
    expect(quelle).not.toMatch(/history\.pushState\(/);
  });
});
