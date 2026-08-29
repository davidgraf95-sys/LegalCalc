// ─── Tor: Erlass-Adresse (Cowork-Befund 45, Entscheid David 29.8.2026) ──────
//
// Bewacht drei Zusagen des Umzugs «Staatsverträge unter eigener Adresse»:
//
//   A  Die Adress-Ableitung ist EINE (§5) — kein zweiter Pfad-Formatierer im
//      Produktivcode. Das ist die Sonde gegen den Rückfall: der Befund entstand
//      NICHT dadurch, dass jemand die Regel falsch schrieb, sondern dadurch,
//      dass zwanzig Stellen sie je selbst schrieben und sieben davon `bund`
//      fest verdrahteten.
//   B  Die Annahme hinter `datenEbeneVonRoute` gilt: jeder Erlass mit
//      Routen-Ebene 'international' hat Daten-Ebene 'bund'. Käme je ein
//      kantonaler Staatsvertrag ins Register, wird DIESE Zeile rot, statt dass
//      der Leser still ein 404-Sidecar lädt und ohne Gliederung dasteht.
//   C  Die Weiterleitung der Alt-Adresse ist beidseitig richtig: Alt → Neu
//      springt, Neu und alles Übrige springen NICHT (eine Weiterleitung, die
//      auch auf der Zieladresse feuert, ist eine Endlosschleife).

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  datenEbeneVonRoute,
  erlassAltPfad,
  erlassPfad,
  erlassPfadVonKey,
  routenEbene,
  routenEbeneVonKey,
} from '../lib/normtext/erlassAdresse';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { umzugsZiel } from '../pages/gesetz-leser/adressUmzug';

const SRC = resolve(fileURLToPath(import.meta.url), '..', '..');

// ── A · Eine Ableitung ──────────────────────────────────────────────────────

/** Zeilen- und Blockkommentare entfernen, damit Herleitungs-PROSA (die die
 *  Alt-Form zwangsläufig zitiert) nicht als Verstoss zählt. Strings bleiben
 *  stehen — genau sie sollen gefunden werden. */
function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function dateien(ordner: string, treffer: string[] = []): string[] {
  for (const n of readdirSync(ordner)) {
    const p = join(ordner, n);
    if (statSync(p).isDirectory()) {
      if (n === 'tests' || n === 'fixtures') continue;
      dateien(p, treffer);
    } else if (/\.tsx?$/.test(n)) {
      treffer.push(p);
    }
  }
  return treffer;
}

// Die eine erlaubte Stelle. Alles andere ruft sie.
const QUELLE = 'lib/normtext/erlassAdresse.ts';

describe('§5 — die Erlass-Adresse hat EINE Quelle', () => {
  it('kein zweiter Pfad-Formatierer im Produktivcode', () => {
    // Ein Template-Literal `/gesetze/${…}` oder ein festes `/gesetze/bund/`
    // im Code (nicht im Kommentar) ist ein selbstgebauter Erlass-Pfad.
    const muster = /`\/gesetze\/\$\{|['"`]\/gesetze\/(bund|kanton|international)\//;
    const sünder: string[] = [];
    for (const p of dateien(SRC)) {
      const rel = relative(SRC, p).replaceAll('\\', '/');
      if (rel === QUELLE) continue;
      if (muster.test(ohneKommentare(readFileSync(p, 'utf8')))) sünder.push(rel);
    }
    expect(sünder, `bauen die Erlass-Adresse selbst statt über ${QUELLE}`).toEqual([]);
  });
});

// ── B · Routen-Ebene vs. Daten-Ebene ────────────────────────────────────────

describe('Routen-Ebene und Daten-Ebene', () => {
  const international = ERLASS_REGISTER.filter((e) => e.rechtsgebiet === 'international');

  it('das Register führt überhaupt Staatsverträge (sonst prüft alles darunter nichts)', () => {
    expect(international.length).toBeGreaterThan(30);
  });

  it('jeder Staatsvertrag trägt die Daten-Ebene bund — die Annahme von datenEbeneVonRoute', () => {
    const abweichend = international.filter((e) => e.ebene !== 'bund').map((e) => `${e.key} (${e.ebene})`);
    expect(
      abweichend,
      'Staatsvertrag mit anderer Daten-Ebene: datenEbeneVonRoute() lädt für ihn die falsche Datei',
    ).toEqual([]);
  });

  it('routenEbene: international schlägt die Ebene, sonst gilt die Ebene', () => {
    expect(routenEbene({ ebene: 'bund', rechtsgebiet: 'international' })).toBe('international');
    expect(routenEbene({ ebene: 'bund', rechtsgebiet: 'privat' })).toBe('bund');
    expect(routenEbene({ ebene: 'kanton', rechtsgebiet: 'privat' })).toBe('kanton');
  });

  it('datenEbeneVonRoute übersetzt nur die Adress-Ebene international', () => {
    expect(datenEbeneVonRoute('international')).toBe('bund');
    expect(datenEbeneVonRoute('bund')).toBe('bund');
    expect(datenEbeneVonRoute('kanton')).toBe('kanton');
  });

  it('erlassPfad setzt Staatsverträge unter /gesetze/international/', () => {
    expect(erlassPfad({ ebene: 'bund', rechtsgebiet: 'international', key: 'CISG' }))
      .toBe('/gesetze/international/CISG');
    expect(erlassPfad({ ebene: 'bund', rechtsgebiet: 'privat', key: 'OR' })).toBe('/gesetze/bund/OR');
  });

  it('die Schlüssel-Variante kommt ohne Erlass-Objekt zum selben Ergebnis', () => {
    for (const e of ERLASS_REGISTER) {
      expect(erlassPfadVonKey(e.key, e.ebene), `Schlüssel-Variante weicht ab für ${e.key}`)
        .toBe(erlassPfad(e));
    }
  });

  it('routenEbeneVonKey belässt unbekannte Schlüssel bei der übergebenen Ebene', () => {
    expect(routenEbeneVonKey('GIBTSNICHT', 'bund')).toBe('bund');
    expect(routenEbeneVonKey('GIBTSNICHT', 'kanton')).toBe('kanton');
  });
});

// ── C · Weiterleitung der Alt-Adresse ───────────────────────────────────────

describe('Umzug der Alt-Adresse', () => {
  it('erlassAltPfad nennt die Alt-Form nur für Umgezogene', () => {
    expect(erlassAltPfad({ ebene: 'bund', rechtsgebiet: 'international', key: 'CISG' }))
      .toBe('/gesetze/bund/CISG');
    expect(erlassAltPfad({ ebene: 'bund', rechtsgebiet: 'privat', key: 'OR' })).toBeNull();
  });

  it('umzugsZiel führt die Alt-Adresse auf die kanonische', () => {
    expect(umzugsZiel('bund', 'CISG')).toBe('/gesetze/international/CISG');
    expect(umzugsZiel('bund', 'EMRK')).toBe('/gesetze/international/EMRK');
  });

  it('umzugsZiel feuert NICHT auf der Zieladresse (keine Schleife)', () => {
    expect(umzugsZiel('international', 'CISG')).toBeNull();
  });

  it('umzugsZiel lässt Nicht-Umgezogene und Unbekannte in Ruhe', () => {
    expect(umzugsZiel('bund', 'OR')).toBeNull();
    expect(umzugsZiel('kanton', 'BS-BeE 786.100')).toBeNull();
    expect(umzugsZiel('bund', 'GIBTSNICHT')).toBeNull();
    expect(umzugsZiel('bund', '')).toBeNull();
  });

  it('jeder Staatsvertrag hat genau EINE Alt-Adresse, die auf seine neue führt', () => {
    for (const e of ERLASS_REGISTER.filter((x) => x.rechtsgebiet === 'international')) {
      expect(umzugsZiel('bund', e.key), `Alt-Adresse von ${e.key} leitet nicht`).toBe(erlassPfad(e));
    }
  });
});
