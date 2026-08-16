import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// ─── Architektur-Zusagen des V3-Fundaments (Auftrag David 16.8.2026, H1) ────
//
// Diese Datei rechnet die Zusagen aus dem Fundament-Umbau NACH, statt sie zu
// glauben: welche V3-Datei welche Nachbardatei berühren darf, wo `imPane` und
// `erlass.ebene` gelesen werden dürfen, wie gross eine Datei werden darf. Alle
// Sonden sind QUELLENSONDEN (§2, DOM-frei) — sie lesen den Quelltext, nicht das
// Laufzeitverhalten, nach dem Muster von `leser-v3-adresse.test.ts`.
//
// Rot zu bekommen: irgendeine V3-Datei ausser `leserV3Modell.ts` importiert
// eine der sechs `inhalt-*`-Nahtdateien; irgendeine Datei importiert die
// Ist-Hülle; `imPane`/`istSekundaer` taucht ausserhalb der drei Wurzel-Dateien
// im CODE auf; `.ebene`/`.rechtsgebiet` wird ausserhalb `erlassAnsicht.ts`
// gelesen; eine Datei überschreitet 400 Zeilen.

const V3_DIR = 'src/pages/gesetz-leser/v3';
const LIES = (name: string) => readFileSync(`${V3_DIR}/${name}`, 'utf8');
const traegt = (heu: string, muster: RegExp) => muster.test(heu);

/** Quelltext OHNE Kommentare — Zeilen- VOR Blockkommentaren entfernen, sonst
 *  frisst ein `layout/**`-artiges Muster in Prosa den halben Code (Lehre aus
 *  `leser-v3-adresse.test.ts`, reproduziert 16.8.2026 beim ersten Lauf dort). */
function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

// Positiv-Sonde zuerst (§6.7 b): das Verzeichnis existiert und trägt Dateien —
// sonst prüften alle Schleifen unten die leere Menge und wären grundlos grün.
const ALLE_DATEIEN = readdirSync(V3_DIR).filter((f) => /\.tsx?$/.test(f));

describe('Positiv-Sonde: v3/ enthält überhaupt Dateien', () => {
  it('mindestens die bekannten Bausteine sind da', () => {
    expect(ALLE_DATEIEN.length).toBeGreaterThan(5);
    expect(ALLE_DATEIEN).toContain('leserV3Modell.ts');
    expect(ALLE_DATEIEN).toContain('erlassAnsicht.ts');
  });
});

describe('Eine Naht: die sechs geteilten inhalt-*-Module', () => {
  const NAHT_MODULE = [
    'inhalt-hooks', 'inhalt-zustand', 'inhalt-ableitungen',
    'inhalt-sprung', 'inhalt-weiterlesen', 'inhalt-suchtreffer',
  ];
  const RAHMEN = 'leserV3Modell.ts';

  it('der Adapter importiert tatsächlich aus der Naht (sonst prüfte das Verbot unten nichts)', () => {
    const quelle = LIES(RAHMEN);
    const treffer = NAHT_MODULE.filter((m) => traegt(quelle, new RegExp(`from '\\.\\./${m}'`)));
    expect(treffer.length, 'leserV3Modell.ts importiert aus KEINEM der sechs Module').toBeGreaterThan(0);
  });

  it('KEINE andere V3-Datei importiert aus einem der sechs Module', () => {
    for (const datei of ALLE_DATEIEN) {
      if (datei === RAHMEN) continue;
      const quelle = ohneKommentare(LIES(datei));
      for (const modul of NAHT_MODULE) {
        expect(traegt(quelle, new RegExp(`from '\\.\\./${modul}'`)), `${datei} importiert '../${modul}'`).toBe(false);
      }
    }
  });

  // Deklarierte, kommentierte Ausnahme (Auftrag): `LeserRahmenV3.tsx` darf
  // ZUSÄTZLICH `../inhalt-ansichten` importieren — ein SIEBTES Modul, nicht Teil
  // der obigen sechs. Damit eine NEUE Ausnahme rot wird, ist der Kreis der
  // erlaubten Importeure hier auf genau eine Datei geschlossen.
  it('`../inhalt-ansichten`: NUR LeserRahmenV3.tsx — die deklarierte Ausnahme', () => {
    const AUSNAHME = 'LeserRahmenV3.tsx';
    expect(traegt(LIES(AUSNAHME), /from '\.\.\/inhalt-ansichten'/),
      'die dokumentierte Ausnahme importiert das Modul gar nicht (mehr) — Kommentar ist stale').toBe(true);
    for (const datei of ALLE_DATEIEN) {
      if (datei === AUSNAHME) continue;
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /from '\.\.\/inhalt-ansichten'/), `${datei} importiert '../inhalt-ansichten' — neue, undeklarierte Ausnahme`).toBe(false);
    }
  });
});

describe('Keine Ist-Hülle: die alten Bausteine sind aus v3/ nicht erreichbar', () => {
  // Reihenfolge der Muster bewusst so, dass '../inhalt' NICHT versehentlich
  // '../inhalt-hooks' o.ä. mitfängt: der String-Vergleich verlangt die
  // schliessende Anführung direkt nach 'inhalt'.
  const VERBOTEN: [string, RegExp][] = [
    ['../inhalt (Ist-Orchestrierung)', /from '\.\.\/inhalt'/],
    ['../inhalt-volltext', /from '\.\.\/inhalt-volltext'/],
    ['LeserMenuPaar', /\bLeserMenuPaar\b/],
    ['LeserAnsichtMenu', /\bLeserAnsichtMenu\b/],
    ['LeserRechtsprechungMenu', /\bLeserRechtsprechungMenu\b/],
    ['../parts/InGesetzSuche', /\bInGesetzSuche\b/],
    ['../parts/ArtikelSprungFeld', /\bArtikelSprungFeld\b/],
    ['KontextPanel', /\bKontextPanel\b/],
  ];

  it('keine V3-Datei berührt die Ist-Hülle (Code, nicht Kommentare)', () => {
    for (const datei of ALLE_DATEIEN) {
      const quelle = ohneKommentare(LIES(datei));
      for (const [name, muster] of VERBOTEN) {
        expect(traegt(quelle, muster), `${datei} berührt die Ist-Hülle (${name})`).toBe(false);
      }
    }
  });
});

describe('Keine Pane-Verzweigung ausserhalb der Wurzel (imPane/istSekundaer)', () => {
  const WURZELN = ['leserV3Modell.ts', 'LeserV3Kontext.ts', 'LeserRahmenV3.tsx'];

  it('die drei Wurzel-Dateien lesen tatsächlich imPane bzw. istSekundaer (sonst prüfte das Verbot nichts)', () => {
    for (const datei of WURZELN) {
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /\b(imPane|istSekundaer)\b/), `${datei} enthält weder imPane noch istSekundaer im Code`).toBe(true);
    }
  });

  it('ALLE übrigen V3-Dateien enthalten `imPane`/`istSekundaer` NUR in Kommentaren, nie im Code', () => {
    for (const datei of ALLE_DATEIEN) {
      if (WURZELN.includes(datei)) continue;
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /\bimPane\b/), `${datei} verzweigt im Code auf imPane`).toBe(false);
      expect(traegt(quelle, /\bistSekundaer\b/), `${datei} verzweigt im Code auf istSekundaer`).toBe(false);
    }
  });
});

describe('Kein `if (bund)`: erlass.ebene / erlass.rechtsgebiet nur in erlassAnsicht.ts', () => {
  const QUELLE_DER_WAHRHEIT = 'erlassAnsicht.ts';
  // GEMELDET UND BEHOBEN (16.8.2026): Diese Sonde fand beim ersten Lauf eine
  // echte Verletzung — die «Vorher/Nachher»-Navigation in LeserLesespalte.tsx
  // las `vorher.ebene`/`nachher.ebene`, um den Pfad des Nachbar-Erlasses zu
  // bauen. Kein `if (bund)`-Fork (der Wert steuerte keine Verzweigung, nur eine
  // URL-Interpolation), aber ein Lesezugriff ausserhalb der einen erlaubten
  // Stelle — und damit genau der Ort, an dem man es vergisst, wenn die Route je
  // Ebene einmal anders aussieht. Statt die Zusage aufzuweichen, ist die
  // Ableitung nach `erlassAnsicht.ts` gezogen worden (`erlassPfad`). Die Sonde
  // duldet seither KEINE Ausnahme mehr.

  it('erlassAnsicht.ts liest tatsächlich .ebene und .rechtsgebiet (sonst prüfte das Verbot nichts)', () => {
    const quelle = ohneKommentare(LIES(QUELLE_DER_WAHRHEIT));
    expect(traegt(quelle, /\.ebene\b/)).toBe(true);
    expect(traegt(quelle, /\.rechtsgebiet\b/)).toBe(true);
  });

  it('.rechtsgebiet wird in KEINER anderen V3-Datei gelesen', () => {
    for (const datei of ALLE_DATEIEN) {
      if (datei === QUELLE_DER_WAHRHEIT) continue;
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /\.rechtsgebiet\b/), `${datei} liest .rechtsgebiet`).toBe(false);
    }
  });

  it('.ebene wird in KEINER anderen V3-Datei gelesen — ohne Ausnahme', () => {
    for (const datei of ALLE_DATEIEN) {
      if (datei === QUELLE_DER_WAHRHEIT) continue;
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /\.ebene\b/), `${datei} liest .ebene — Ableitung gehört nach erlassAnsicht.ts`).toBe(false);
    }
  });

  it('die Adress-Ableitung liegt bei der einen Quelle (erlassPfad)', () => {
    // Positiv-Sonde zum Verbot oben: die Funktion, in die der Zugriff gewandert
    // ist, existiert wirklich — sonst gewönne das Verbot gegen eine Lücke.
    expect(traegt(ohneKommentare(LIES(QUELLE_DER_WAHRHEIT)), /export function erlassPfad\(/),
      'erlassPfad fehlt — die Nachbar-Links hätten keine erlaubte Quelle').toBe(true);
    expect(traegt(ohneKommentare(LIES('LeserLesespalte.tsx')), /erlassPfad\(/),
      'die Lesespalte benutzt die Ableitung nicht').toBe(true);
  });
});

describe('Dateigrösse: v3/ bleibt schlank', () => {
  // Harte Obergrenze 400 Zeilen (Auflage «≤ ~250 Zeilen» ist das ZIEL, kein
  // hartes Tor). Als Konstante mit Kommentar geführt, damit ein Wachsen der
  // Grenze selbst auffällt, statt sich in einer Zahl mitten im Test zu
  // verstecken (§6.7: ein Tor, das nicht scheitern kann, ist gefährlicher als
  // keines — wird die Grenze stillschweigend hochgesetzt, ist DAS der Diff).
  const MAX_ZEILEN = 400;

  it(`keine Datei in v3/ überschreitet ${MAX_ZEILEN} Zeilen`, () => {
    for (const datei of ALLE_DATEIEN) {
      const zeilen = LIES(datei).split('\n').length;
      expect(zeilen, `${datei} hat ${zeilen} Zeilen — über der Grenze ${MAX_ZEILEN}`).toBeLessThanOrEqual(MAX_ZEILEN);
    }
  });

  it('der begründet grösste Baustein ist der Adapter leserV3Modell.ts (Fundament-Auflage 1)', () => {
    const zeilen: Record<string, number> = {};
    for (const datei of ALLE_DATEIEN) zeilen[datei] = LIES(datei).split('\n').length;
    const groesste = Object.entries(zeilen).sort((a, b) => b[1] - a[1])[0];
    expect(groesste[0]).toBe('leserV3Modell.ts');
  });
});
