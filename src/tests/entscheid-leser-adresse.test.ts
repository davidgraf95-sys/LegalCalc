import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LESE_PARAM, leseAusParam, urlMitHash, urlMitLese } from '../pages/entscheidLeserRegeln';

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

// ─── LM-210 — der Lesemodus stand nirgends: weder in der Adresse noch in einem
// Speicher (Prod-Messung 2.8.2026: URL, `history.length`, localStorage und
// sessionStorage blieben beim Öffnen unverändert; nach `location.reload()` war
// die normale Ansicht zurück). Gebaut nach dem `?ansicht=`-Präzedenzmuster.

describe('urlMitLese / leseAusParam — Lesemodus in der Adresse (LM-210)', () => {
  it('folgt der Bestands-Konvention für Ja/Nein-Achsen («leit=1»)', () => {
    expect(LESE_PARAM).toBe('lese');
    expect(urlMitLese('https://x.ch/rechtsprechung/abc', true)).toBe('https://x.ch/rechtsprechung/abc?lese=1');
  });

  it('geschlossen ⇒ der Parameter FEHLT (kein totes «lese=0» in der Adresse)', () => {
    expect(urlMitLese('https://x.ch/rechtsprechung/abc?lese=1', false)).toBe('https://x.ch/rechtsprechung/abc');
  });

  it('lässt den Fassungs-Parameter und den Hash unberührt', () => {
    expect(urlMitLese('https://x.ch/rechtsprechung/abc?ansicht=auszug#e-2', true))
      .toBe('https://x.ch/rechtsprechung/abc?ansicht=auszug&lese=1#e-2');
    expect(urlMitLese('https://x.ch/rechtsprechung/abc?ansicht=auszug&lese=1#e-2', false))
      .toBe('https://x.ch/rechtsprechung/abc?ansicht=auszug#e-2');
  });

  it('ist idempotent in beide Richtungen', () => {
    const auf = urlMitLese('https://x.ch/a?norm=Art.+8+ZGB', true);
    expect(urlMitLese(auf, true)).toBe(auf);
    const zu = urlMitLese(auf, false);
    expect(urlMitLese(zu, false)).toBe(zu);
  });

  it('liest den Zustand beim Laden zurück — nur «1» öffnet', () => {
    expect(leseAusParam('1')).toBe(true);
    expect(leseAusParam(null)).toBe(false);
    expect(leseAusParam('0')).toBe(false);
    expect(leseAusParam('true')).toBe(false);
  });

  it('Rundlauf: geöffnet → Adresse → daraus wieder geöffnet (reload-fest)', () => {
    const href = urlMitLese('https://x.ch/rechtsprechung/abc?ansicht=voll', true);
    expect(leseAusParam(new URL(href).searchParams.get(LESE_PARAM))).toBe(true);
  });
});

// Boolesche Sonden statt `toMatch` auf der ganzen Datei: ein Fehlschlag soll
// «erwartet true» melden und nicht 30 kB Quelltext ins Protokoll kippen.
const traegt = (heu: string, muster: RegExp) => muster.test(heu);

describe('Verdrahtung im Leser (LM-209/LM-210)', () => {
  it('die Abschnitts-Reiter tragen einen Klick-Handler — kein nackter Anker mehr', () => {
    expect(traegt(sprungNavigationBlock(), /onClick=/), 'SprungNavigation ohne onClick').toBe(true);
  });

  it('sie behalten ihren href (Teilbarkeit: Mittelklick, Kontextmenü, Kopieren)', () => {
    expect(traegt(sprungNavigationBlock(), /href=\{`#\$\{z\.anker\}`\}/), 'href verloren').toBe(true);
  });

  it('der Leser schreibt die Adresse ausschliesslich per replaceState', () => {
    expect(traegt(quelle, /history\.replaceState\(/), 'kein replaceState').toBe(true);
    expect(traegt(quelle, /history\.pushState\(/), 'pushState im Leser').toBe(false);
  });

  it('der Lesemodus startet aus dem Adress-Parameter, nicht hart auf «zu» (LM-210)', () => {
    expect(traegt(quelle, /useState\(\(\) => leseAusParam\(leseParam\)\)/), 'Start-Zustand nicht aus ?lese=').toBe(true);
    expect(traegt(quelle, /urlMitLese\(window\.location\.href/), 'keine Rückspiegelung in die Adresse').toBe(true);
  });
});
