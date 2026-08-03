import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INTERNATIONAL_ALIAS,
  INTERNATIONAL_SAEULE,
  INTERNATIONAL_RUBRIKEN,
  internationalAnkerAbbildung,
  saeulenZiel,
} from '../lib/navigation';
import { INTERNATIONAL_RUBRIK_IDS } from '../lib/normtext/international-rubriken';
import { prerenderRouten } from '../lib/seo';

// ─── IA-6 Stufe 2 · /international → Säule (FAHRPLAN-GESETZES-UX §11.8 Y-C) ──
//
// Deterministische Tore für den echten Redirect (David-Go 3.8.2026). Geprüft
// wird, was ein e2e gegen `vite preview` NICHT sehen kann (die vercel-Ebene)
// und was sonst nur eine Annahme wäre (dass die Ziel-Anker wirklich existieren).

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as {
  redirects?: { source: string; destination: string; permanent?: boolean }[];
};
const REDIRECTS = vercel.redirects ?? [];

describe('IA-6 Stufe 2 · Anker-Abbildung (5/5)', () => {
  it('führt genau die 5 Sach-Anker der Spec (§11.4 Ziff. 3)', () => {
    expect(INTERNATIONAL_RUBRIKEN.map((r) => r.anker)).toEqual([
      'menschenrechte', 'privat-zivil', 'rechtshilfe', 'schweiz-eu', 'eu-verordnungen',
    ]);
  });

  it('bildet jeden der 5 Alt-Anker auf einen Anker ab, den die Säule WIRKLICH rendert', () => {
    for (const r of INTERNATIONAL_RUBRIKEN) {
      const ziel = internationalAnkerAbbildung(`#${r.anker}`);
      expect(ziel, `Anker ${r.anker} verliert sein Ziel`).toBe(r.zielAnker);
      // Gegen die real gerenderten <section id=…> der Säule (§7, nicht vertrauen).
      expect(INTERNATIONAL_RUBRIK_IDS, `Ziel-Anker ${ziel} existiert auf der Säule nicht`).toContain(ziel);
    }
  });

  it('reicht auch prozentkodierte Hashes durch und lässt Unbekanntes fallen (kein toter Anker)', () => {
    expect(internationalAnkerAbbildung('#schweiz%2Deu')).toBe('schweiz-eu');
    expect(internationalAnkerAbbildung('#gibt-es-nicht')).toBe('');
    expect(internationalAnkerAbbildung('')).toBe('');
    expect(internationalAnkerAbbildung('#')).toBe('');
  });

  it('Sidebar-Ziele zeigen auf die Säule, nicht mehr auf den Alias (R-SCOPE-4)', () => {
    for (const r of INTERNATIONAL_RUBRIKEN) {
      expect(saeulenZiel(r.zielAnker)).toBe(`${INTERNATIONAL_SAEULE}#${r.zielAnker}`);
      expect(saeulenZiel(r.zielAnker).startsWith(INTERNATIONAL_ALIAS)).toBe(false);
    }
    expect(saeulenZiel('')).toBe(INTERNATIONAL_SAEULE);
  });
});

describe('IA-6 Stufe 2 · Server-Redirect (vercel.json)', () => {
  it('/international antwortet permanent (308) auf die kanonische Säule', () => {
    const r = REDIRECTS.find((x) => x.source === INTERNATIONAL_ALIAS);
    expect(r, 'kein vercel-Redirect für /international').toBeTruthy();
    expect(r!.destination).toBe(INTERNATIONAL_SAEULE);
    expect(r!.permanent).toBe(true);
  });

  it('/suche ist KEINE Redirect-Quelle (§11.7 — S5 bleibt unangetastet)', () => {
    expect(REDIRECTS.map((r) => r.source)).not.toContain('/suche');
  });
});

describe('IA-6 Stufe 2 · Canonical-/Redirect-Kette', () => {
  // Wurzel-Fix statt Einzelfall (§17): keine Redirect-Quelle darf zugleich
  // prerendert und damit gesitemappt sein — sonst führt die Sitemap URLs, die
  // mit 308 antworten, und das Canonical der Quelle wäre eine zweite Wahrheit.
  it('keine Redirect-Quelle ist zugleich Prerender-/Sitemap-Route', () => {
    const routen = prerenderRouten();
    for (const r of REDIRECTS) {
      expect(routen, `${r.source} ist Redirect-Quelle UND Prerender-Route`).not.toContain(r.source);
    }
  });

  it('kein Redirect-Ziel ist selbst wieder Redirect-Quelle (keine Kette, keine Schleife)', () => {
    const quellen = new Set(REDIRECTS.map((r) => r.source));
    for (const r of REDIRECTS) {
      expect(quellen, `${r.destination} ist Ziel UND Quelle`).not.toContain(r.destination.split('?')[0]);
    }
  });

  it('die Ziel-Säule wird von einer prerenderten Route getragen (/gesetze)', () => {
    expect(prerenderRouten()).toContain(INTERNATIONAL_SAEULE.split('?')[0]);
  });
});
