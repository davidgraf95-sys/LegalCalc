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
  kanonisierePfad,
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
      if (n === 'tests' || n === 'fixtures' || n === 'node_modules') continue;
      dateien(p, treffer);
    } else if (/\.tsx?$/.test(n)) {
      treffer.push(p);
    }
  }
  return treffer;
}

// Die eine erlaubte Stelle. Alles andere ruft sie.
const QUELLE = 'src/lib/normtext/erlassAdresse.ts';

// ── Die verbotenen Formen ───────────────────────────────────────────────────
//
// GESCHÄRFT NACH DER GEGENPRÜFUNG (29.8.2026, Mangel 4). Die erste Fassung sah
// nur `src/` und verlangte ein Anführungszeichen unmittelbar vor dem Pfad. Sie
// liess damit drei reale Rückfälle durch, darunter den, der zählt:
//
//     erlassPfadRoh(e.ebene, e.key)     ← Befund 45, exakt reproduziert
//
// Diese Zeile ruft brav die eine Quelle und verdrahtet trotzdem die DATEN-Ebene
// in die Adresse — die Sonde muss also nicht nur fragen, WER den Pfad baut,
// sondern WOMIT. Ebenfalls ergänzt: String-Verkettung und Pfade mit einem
// Präfix davor (`${SITE_URL}/gesetze/bund/${…}`).
//
// NICHT verboten ist eine VOLLSTÄNDIG feste Adresse wie `/gesetze/bund/OR`:
// die steht in Messskripten (`perf/lighthouse-budget.ts`, `messung-cwv.ts`) als
// fester Messpunkt, nicht als Ableitung. Verboten ist erst der Moment, in dem
// ein Schlüssel oder eine Ebene VARIABEL in den Pfad wandert.
const VERBOTEN: { name: string; re: RegExp }[] = [
  { name: 'Template mit variabler Ebene', re: /`[^`]*\/gesetze\/\$\{/ },
  { name: 'Template mit variablem Schlüssel', re: /`[^`]*\/gesetze\/(bund|kanton|international)\/\$\{/ },
  { name: 'String-Verkettung', re: /['"]\/gesetze\/?['"]\s*\+/ },
  { name: 'Daten-Ebene in die Adresse gereicht', re: /erlassPfadRoh\(\s*[A-Za-z_$][\w$.]*\.ebene\b/ },
];

describe('§5 — die Erlass-Adresse hat EINE Quelle', () => {
  it('kein zweiter Pfad-Formatierer in src/ und scripts/', () => {
    const wurzeln = [SRC, join(SRC, '..', 'scripts')];
    const sünder: string[] = [];
    for (const wurzel of wurzeln) {
      for (const p of dateien(wurzel)) {
        const rel = relative(join(SRC, '..'), p).replaceAll('\\', '/');
        if (rel === QUELLE) continue;
        const code = ohneKommentare(readFileSync(p, 'utf8'));
        for (const { name, re } of VERBOTEN) if (re.test(code)) sünder.push(`${rel} — ${name}`);
      }
    }
    expect(sünder, `bauen die Erlass-Adresse selbst statt über ${QUELLE}`).toEqual([]);
  });

  it('die Sonde fängt jede der belegten Rückfall-Formen (Selbsttest)', () => {
    // Ohne diesen Fall wäre die Sonde eine Behauptung: sie kann grün sein, WEIL
    // sie nichts sieht. Hier steht, was sie sehen MUSS — die vier Formen, die
    // die Gegenprüfung als real durchgelassen belegt hat.
    const rückfälle = [
      'const a = `/gesetze/${e.ebene}/${e.key}`;',
      'const b = `/gesetze/bund/${key}`;',
      "const c = '/gesetze/' + e.ebene + '/' + encodeURIComponent(e.key);",
      'const d = `${SITE_URL}/gesetze/bund/${e.key}`;',
      'const f = erlassPfadRoh(e.ebene, e.key);',
    ];
    for (const zeile of rückfälle) {
      expect(VERBOTEN.some(({ re }) => re.test(zeile)), `nicht gefangen: ${zeile}`).toBe(true);
    }
    // Gegenprobe: das Erlaubte darf NICHT anschlagen, sonst ist die Sonde ein
    // Hindernis statt eines Wächters.
    const erlaubt = [
      "{ pfad: '/gesetze/bund/OR', label: 'fester Messpunkt' },",
      'const g = erlassPfad(e);',
      'const h = erlassPfadVonKey(e.key, e.ebene);',
      'const i = erlassPfadRoh(routenEbene, schluessel);',
    ];
    for (const zeile of erlaubt) {
      expect(VERBOTEN.some(({ re }) => re.test(zeile)), `falsch gefangen: ${zeile}`).toBe(false);
    }
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

  it('das REGISTER entscheidet, nicht der Aufrufer (Gegenprüfung, Mangel 1)', () => {
    // Vorher war der zweite Parameter der Fallback für ALLE Keys — damit gab es
    // für jeden Bundeserlass eine zweite, voll funktionierende Adresse unter
    // /gesetze/international/, deren Brotkrume «Bund» sagte. Befund 45 im
    // Spiegelbild. Ein bekannter Schlüssel hat genau EINE Adresse.
    expect(routenEbeneVonKey('OR', 'international')).toBe('bund');
    expect(routenEbeneVonKey('OR', 'kanton')).toBe('bund');
    expect(routenEbeneVonKey('CISG', 'bund')).toBe('international');
    expect(routenEbeneVonKey('CISG', 'kanton')).toBe('international');
  });

  it('jeder Register-Erlass hat GENAU EINE Adresse — jede andere Ebene leitet', () => {
    for (const e of ERLASS_REGISTER) {
      for (const falsch of ['bund', 'kanton', 'international']) {
        if (falsch === routenEbene(e)) continue;
        expect(umzugsZiel(falsch, e.key), `${falsch}/${e.key} bleibt als Zweitadresse stehen`)
          .toBe(erlassPfad(e));
      }
    }
  });
});

// ── Gespeicherte Adressen (Reiter, Panes) ───────────────────────────────────

describe('kanonisierePfad — gespeicherte Alt-Adressen ziehen nach', () => {
  it('zieht die Erlass-Adresse nach und lässt Query und Anker stehen', () => {
    expect(kanonisierePfad('/gesetze/bund/CISG')).toBe('/gesetze/international/CISG');
    expect(kanonisierePfad('/gesetze/bund/CISG#art-35')).toBe('/gesetze/international/CISG#art-35');
    expect(kanonisierePfad('/gesetze/bund/CISG?r=2#art-35')).toBe('/gesetze/international/CISG?r=2#art-35');
  });

  it('lässt kanonische und fremde Pfade unverändert (byte-gleich)', () => {
    for (const p of [
      '/gesetze/international/CISG',
      '/gesetze/bund/OR#art-257_d',
      '/gesetze/kanton/BS-BeE%20786.100',
      '/rechtsprechung/bge-150-III-1',
      '/rechner/verjaehrung',
      '/',
      '',
    ]) {
      expect(kanonisierePfad(p), `unnötig verändert: ${p}`).toBe(p);
    }
  });

  it('ist idempotent — zweimal angewandt ändert nichts mehr', () => {
    const einmal = kanonisierePfad('/gesetze/bund/CISG#art-35');
    expect(kanonisierePfad(einmal)).toBe(einmal);
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
