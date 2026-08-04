import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { urlMitHash } from '../lib/liveUrlSync';
import { urlMitHash as urlMitHashReExport } from '../pages/entscheidLeserRegeln';

// ─── W2·10-UI-NAV-URL — Adress-Modell des Gesetzes-Lesers (LM-202) ───────────
//
// David-Entscheid 3.8.2026, wörtlich:
//   «Die URL ändert sich NUR bei explizitem Klick auf einen Artikel-Anker bzw.
//    bei der Teilen-Aktion.»
//
// Die Verhaltens-Beweise (Scroll ⇒ Adresse unverändert, Anker-Klick ⇒ #art-N,
// Teilen ⇒ kopierte URL == Adresse, Verlaufslänge) sind nur im Browser messbar
// und stehen in `e2e/leser-adresse-lm202.e2e.ts`. Prüfbar sind hier die zwei
// Bedingungen, aus denen sie folgen:
//   (1) die reine Adress-Regel (Hash setzen, Pfad/Query unberührt), und
//   (2) die Verdrahtung — WER im Leser überhaupt in die Adresse schreiben darf.
//
// (2) ist eine Quellen-Sonde. Sie ist der einzige browserfreie Weg zu bemerken,
// dass jemand einen Scroll-getriebenen Adress-Sync wieder einzieht: ein solcher
// Sync müsste in einem der Scroll-Pfade `history.replaceState`/`pushState`
// aufrufen, und genau das ist unten verboten. Dasselbe Muster wie
// `entscheid-leser-adresse.test.ts` (LM-209).

const LIES = (p: string) => readFileSync(p, 'utf8');

const HOOKS = 'src/pages/gesetz-leser/inhalt-hooks.tsx';
const ANKER = 'src/pages/gesetz-leser/scrollAnker.ts';
const ARTIKEL = 'src/pages/gesetz-leser/parts/ArtikelLeser.tsx';
const INHALT = 'src/pages/gesetz-leser/inhalt.tsx';
// B4 (§9-Bug-Check 4.8.2026): `App.tsx` trägt den DRITTEN Scroll-Listener des
// Lesewegs (die Positions-Map der Scroll-Wiederherstellung) und stand zunächst
// nicht unter der Sonde — ein dort eingezogener Adress-Sync wäre unbemerkt
// geblieben. Jetzt mitbewacht.
const APP = 'src/App.tsx';

// Boolesche Sonden statt `toMatch` auf der ganzen Datei: ein Fehlschlag soll
// «erwartet true» melden und nicht 60 kB Quelltext ins Protokoll kippen.
const traegt = (heu: string, muster: RegExp) => muster.test(heu);

describe('urlMitHash — Anker in die Adresse (LM-202/LM-209, eine Quelle §5)', () => {
  it('setzt den Anker und lässt Pfad und Query unberührt', () => {
    expect(urlMitHash('https://x.ch/gesetze/bund/OR?r=2', 'art-257_d'))
      .toBe('https://x.ch/gesetze/bund/OR?r=2#art-257_d');
  });

  it('ersetzt einen bereits stehenden Anker (kein Anhängen)', () => {
    expect(urlMitHash('https://x.ch/gesetze/bund/OR#art-257_d', 'art-400'))
      .toBe('https://x.ch/gesetze/bund/OR#art-400');
  });

  it('ist idempotent — derselbe Anker erzeugt dieselbe Adresse', () => {
    const eins = urlMitHash('https://x.ch/gesetze/bund/OR', 'art-97');
    expect(urlMitHash(eins, 'art-97')).toBe(eins);
  });

  it('der Entscheid-Leser reicht GENAU dieselbe Funktion weiter (keine zweite Wahrheit)', () => {
    expect(urlMitHashReExport).toBe(urlMitHash);
  });
});

describe('Scroll-Pfade des Lesers schreiben nie in die Adresse (LM-202)', () => {
  // Die drei Stellen, an denen der Leser auf Scrollen reagiert: der Scroll-Spy
  // und die Anker-Erfassung (beide in inhalt-hooks.tsx) sowie die Anker-Registry
  // selbst. Sie dürfen ausschliesslich in flüchtige Ablagen schreiben — die
  // In-Memory-Registry (scrollAnker.ts) und den Reiter-Tracker (localStorage,
  // lib/tabs.ts) —, nie in History/Adresse.
  it('inhalt-hooks.tsx (Scroll-Spy + Anker-Erfassung) ruft keine History-API auf', () => {
    const quelle = LIES(HOOKS);
    expect(traegt(quelle, /history\.replaceState\(/), 'replaceState im Scroll-Pfad').toBe(false);
    expect(traegt(quelle, /history\.pushState\(/), 'pushState im Scroll-Pfad').toBe(false);
    // Positiv-Sonde (§6.7: ein Tor, das nicht scheitern kann, ist gefährlicher
    // als keines): die Scroll-Listener, um die es geht, existieren überhaupt.
    expect(traegt(quelle, /addEventListener\('scroll'/), 'kein Scroll-Listener mehr — Sonde greift ins Leere').toBe(true);
  });

  it('scrollAnker.ts hält den Leseort in einer In-Memory-Registry, nicht in der Adresse', () => {
    const quelle = LIES(ANKER);
    expect(traegt(quelle, /history\./), 'History-Zugriff in der Anker-Registry').toBe(false);
    expect(traegt(quelle, /const anker = new Map<string, ScrollAnker>\(\)/), 'Registry verloren').toBe(true);
  });

  it('der Scroll-Spy meldet den Artikel an den Reiter-Tracker, nicht an die Adresse', () => {
    const quelle = LIES(HOOKS);
    expect(traegt(quelle, /aktualisiereTabArtikel\(tabZiel\)/), 'Reiter-Meldung verloren').toBe(true);
    expect(traegt(quelle, /window\.location\.hash\s*=/), 'direkte Hash-Zuweisung im Scroll-Pfad').toBe(false);
  });

  it('App.tsx speichert die Scrollposition in einer Map — ohne die Adresse anzufassen (B4)', () => {
    const quelle = LIES(APP);
    // `history.scrollRestoration = 'manual'` ist erlaubt und nötig (A16) — das
    // ist eine Browser-EINSTELLUNG, kein Adress-Schreiben. Verboten sind die
    // beiden Schreib-APIs.
    expect(traegt(quelle, /history\.replaceState\(/), 'replaceState in App.tsx').toBe(false);
    expect(traegt(quelle, /history\.pushState\(/), 'pushState in App.tsx').toBe(false);
    // Positiv-Sonden (§6.7): der Scroll-Listener und die Map existieren.
    expect(traegt(quelle, /addEventListener\('scroll'/), 'kein Scroll-Listener in App.tsx').toBe(true);
    expect(traegt(quelle, /positionen\.current\.set\(/), 'Positions-Map verloren').toBe(true);
  });
});

describe('Die zwei erlaubten Adress-Schreiber (LM-202)', () => {
  it('(a) Anker-Klick: springeZuArtikel setzt #art-Token per replaceState', () => {
    const quelle = LIES(INHALT);
    expect(traegt(quelle, /window\.history\.replaceState\(null, '', ziel\)/), 'Anker-Klick schreibt nicht mehr').toBe(true);
    // replace, nicht push: der Sprung innerhalb desselben Dokuments ist kein
    // Ortswechsel und darf den Verlauf nicht fluten (LM-209-Ökonomie).
    expect(traegt(quelle, /window\.history\.pushState\(/), 'pushState im Leser').toBe(false);
  });

  it('(b) Teilen: der «Link»-Knopf zieht die Adresse mit — per replaceState', () => {
    const quelle = LIES(ARTIKEL);
    expect(traegt(quelle, /was === 'link' && !istSekundaer/), 'Teilen-Weiche fehlt').toBe(true);
    expect(traegt(quelle, /window\.history\.replaceState\(window\.history\.state, '', urlMitHash\(window\.location\.href, `art-\$\{e\.artikel\}`\)\)/),
      'Teilen schreibt die Adresse nicht').toBe(true);
    expect(traegt(quelle, /window\.history\.pushState\(/), 'pushState in der Teilen-Aktion').toBe(false);
  });

  it('(b1) die Teilen-Grenze heisst istSekundaer, nicht imPane — Split-View-Falle', () => {
    // B1 (§9-Bug-Check 4.8.2026): `Shell.tsx` montiert im Split-View AUCH das
    // primäre Pane mit `imPane: true` (Container-Query-Modus) — die Rolle
    // unterscheidet die beiden, nicht `imPane`. Eine `!imPane`-Weiche legt den
    // Teilen-Knopf im Split-View auf BEIDEN Seiten still, während
    // `springeZuArtikel` im primären Pane weiterschreibt: das LM-202-Symptom
    // überlebt genau dort. Diese Sonde zementierte in der ersten Fassung den
    // falschen Wächter — sie prüft jetzt die richtige Grenze.
    const quelle = LIES(ARTIKEL);
    expect(traegt(quelle, /const istSekundaer = rolle === 'sekundaer'/), 'Rolle wird nicht ausgewertet').toBe(true);
    expect(traegt(quelle, /was === 'link' && !imPane\b/), '`!imPane` als Teilen-Grenze zurück').toBe(false);
    // Gegenprobe an der Quelle der Rollen-Unterscheidung: Shell montiert das
    // primäre Pane tatsächlich mit imPane:true — sonst wäre diese Sonde leer.
    expect(traegt(LIES('src/components/layout/Shell.tsx'), /\{ imPane: true, rolle: 'primaer'/),
      'Shell montiert das primäre Pane nicht mehr mit imPane:true — Sonde greift ins Leere').toBe(true);
  });

  it('(b2) Permalink und Adresse werden mit DERSELBEN Funktion kodiert (§5)', () => {
    // B2 (§9-Bug-Check 4.8.2026): der Permalink war handgebaut
    // (`#art-${e.artikel}`), die Adresse lief über `urlMitHash`. Bei 54
    // Artikel-Token mit Leerzeichen/Halbgeviert liefen beide auseinander.
    const quelle = LIES(ARTIKEL);
    expect(traegt(quelle, /urlMitHash\(`\$\{window\.location\.origin\}\$\{basisPfad\}`, `art-\$\{e\.artikel\}`\)/),
      'Permalink wird nicht über urlMitHash kodiert').toBe(true);
  });

  it('die Kodierung deckt die real vorkommenden Sonderzeichen-Token', () => {
    // Belegte Ist-Token aus `public/normtext/kanton/` (Stand 4.8.2026):
    // BS-215.400 «22 a», AR-233.3 «36–42», BS-785.700 «10. 1».
    const basis = 'https://lexmetrik.ch/gesetze/kanton/BS-215.400';
    expect(urlMitHash(basis, 'art-22 a')).toBe(`${basis}#art-22%20a`);
    expect(urlMitHash(basis, 'art-36–42')).toBe(`${basis}#art-36%E2%80%9342`);
    expect(urlMitHash(basis, 'art-10. 1')).toBe(`${basis}#art-10.%201`);
    // Und der Normalfall bleibt unangetastet (keine Kodierung, wo keine nötig ist).
    expect(urlMitHash(basis, 'art-335_c')).toBe(`${basis}#art-335_c`);
  });

  it('der «Zitat»-Knopf lässt die Adresse in Ruhe — ein Zitat ist kein Ortswechsel', () => {
    const quelle = LIES(ARTIKEL);
    // Genau EIN History-Aufruf in der Datei, und der hängt an der 'link'-Weiche.
    expect((quelle.match(/window\.history\.replaceState\(/g) ?? []).length,
      'mehr als ein Adress-Schreiber im Artikel').toBe(1);
  });
});
