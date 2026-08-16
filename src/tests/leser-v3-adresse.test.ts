import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// ─── Adress-Modell der V3-Hülle (LM-202, Fortschreibung) ────────────────────
//
// David-Entscheid 3.8.2026, wörtlich: «Die URL ändert sich NUR bei explizitem
// Klick auf einen Artikel-Anker bzw. bei der Teilen-Aktion.»
//
// `src/tests/leser-adresse-lm202.test.ts` bewacht dafür die Ist-Hülle: eine
// Liste von Dateien, die NICHT in die Adresse schreiben dürfen, und zwei
// Dateien, die es als einzige dürfen. Mit der V3-Hülle kommt ein zweiter
// Sprung-Pfad hinzu (`v3/LeserRahmenV3.tsx`, `springeZuArtikel`) — und damit
// eine Datei, die von jener Sonde nicht erfasst ist. Ohne diesen Test hier
// könnte in V3 ein scroll-getriebener Adress-Sync einziehen, ohne dass etwas
// rot wird: genau die Lücke, die dort schon zweimal geschlossen werden musste
// (B4 für `App.tsx`, Gegenprüfungs-Befund 1 für die T14-Split-Module).
//
// Die bestehende Sonde bleibt UNANGETASTET (§6.3) — dies ist eine zusätzliche
// Datei mit demselben Muster, keine Lockerung.

const LIES = (p: string) => readFileSync(p, 'utf8');
const traegt = (heu: string, muster: RegExp) => muster.test(heu);

/** Quelltext OHNE Kommentare. Nötig für die Abwesenheits-Sonden weiter unten:
 *  die Dateien BEGRÜNDEN in Prosa, warum sie kein `imPane` verzweigen — eine
 *  Sonde über den Rohtext fände genau diese Begründung und wäre rot, obwohl der
 *  Code richtig ist (reproduziert 16.8.2026 beim ersten Lauf dieser Datei).
 *  Ein Test, der die eigene Dokumentation als Verstoss liest, misst nichts. */
function ohneKommentare(quelle: string): string {
  return quelle
    // Zeilen-Kommentare ZUERST — und das ist keine Geschmacksfrage: eine
    // Prosa-Zeile wie «… `src/components/layout/**` …» enthält die Zeichenfolge
    // `/*`. Läuft der Block-Entferner vorher, paart er dieses `/*` mit dem
    // nächsten echten `*/` (hier 16 700 Zeichen später) und frisst den halben
    // Code — inklusive der Positiv-Sonde, die dann grundlos rot wird
    // (reproduziert 16.8.2026). `[^:]` vor dem `//` schützt URLs («https://»).
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

// Der Adress-Schreiber ist mit dem Fundament-Umbau (16.8.2026) vom Rahmen in
// den Daten-Adapter gewandert — dorthin, wo auch der Scroll-Spy und die
// Sprung-Mechanik hängen. Die Sonde zieht mit; ihre Aussage ist unverändert.
const RAHMEN = 'src/pages/gesetz-leser/v3/leserV3Modell.ts';
// Die übrigen V3-Dateien sind reine Darstellung (§3) und dürfen die Adresse
// GAR NICHT anfassen. `readFileSync` wirft, wenn eine umbenannt wird — die
// Sonde wird dann rot und nicht still grün (§6.7 b).
const V3_REIN = [
  'src/pages/gesetz-leser/v3/LeserRahmenV3.tsx',
  'src/pages/gesetz-leser/v3/LeserLesespalte.tsx',
  'src/pages/gesetz-leser/v3/LeserGliederung.tsx',
  'src/pages/gesetz-leser/v3/erlassAnsicht.ts',
  'src/pages/gesetz-leser/v3/LeserKopf.tsx',
  'src/pages/gesetz-leser/v3/LeserSeitenleiste.tsx',
  'src/pages/gesetz-leser/v3/SuchSprungFeld.tsx',
  'src/pages/gesetz-leser/v3/suchKuerzel.ts',
  'src/pages/gesetz-leser/v3/LeserAnsichtV3.tsx',
  'src/pages/gesetz-leser/v3/UebersichtBox.tsx',
  'src/pages/gesetz-leser/v3/kopfStufen.ts',
  'src/pages/gesetz-leser/v3/v3Optionen.ts',
];

describe('V3-Hülle: der EINE erlaubte Adress-Schreiber (LM-202)', () => {
  it('der Artikel-Sprung setzt #art-Token per replaceState — und nur er', () => {
    const quelle = LIES(RAHMEN);
    // Positiv-Sonde: der Schreiber existiert überhaupt (sonst gewönne das
    // Verbot unten gegen eine leere Datei, §6.7).
    expect(traegt(quelle, /window\.history\.replaceState\(null, '', ziel\)/),
      'Anker-Klick schreibt die Adresse nicht mehr').toBe(true);
    // replace, nicht push: ein Sprung im selben Dokument ist kein Ortswechsel
    // und darf den Verlauf nicht fluten (LM-209-Ökonomie).
    expect(traegt(quelle, /window\.history\.pushState\(/), 'pushState in der V3-Hülle').toBe(false);
    expect(traegt(quelle, /window\.location\.hash\s*=/), 'direkte Hash-Zuweisung in der V3-Hülle').toBe(false);
  });

  it('der Schreiber ist auf das PRIMÄRE Pane begrenzt (istSekundaer, nicht imPane)', () => {
    // B1-Falle: `Shell.tsx` montiert im Split-View AUCH das primäre Pane mit
    // `imPane: true`. Eine `!imPane`-Weiche legte die Adress-Pflege des
    // primären Panes still; die Rolle unterscheidet die beiden.
    const quelle = LIES(RAHMEN);
    expect(traegt(quelle, /if \(!istSekundaer\) \{\n\s*const ziel = /),
      'Adress-Weiche hängt nicht mehr an istSekundaer').toBe(true);
  });

  it('die übrigen V3-Bausteine fassen die Adresse überhaupt nicht an', () => {
    for (const datei of V3_REIN) {
      const quelle = ohneKommentare(LIES(datei));
      expect(traegt(quelle, /history\.replaceState\(/), `replaceState in ${datei}`).toBe(false);
      expect(traegt(quelle, /history\.pushState\(/), `pushState in ${datei}`).toBe(false);
      expect(traegt(quelle, /window\.location\.hash\s*=/), `Hash-Zuweisung in ${datei}`).toBe(false);
    }
  });

  it('die V3-Hülle hört auf keinen Scroll — der Spy bleibt die eine Quelle', () => {
    // Der Scroll-Spy lebt in `inhalt-hooks.tsx` und wird von V3 IMPORTIERT
    // (§5). Ein eigener Scroll-Listener im Rahmen wäre eine zweite Beobachtung
    // desselben Vorgangs — und der Ort, an dem ein Adress-Sync üblicherweise
    // wieder einzieht.
    const quelle = ohneKommentare(LIES(RAHMEN));
    expect(traegt(quelle, /addEventListener\('scroll'/), 'eigener Scroll-Listener in der V3-Hülle').toBe(false);
    expect(traegt(quelle, /useLeserSprungSpy\(/), 'V3 benutzt den geteilten Scroll-Spy nicht mehr').toBe(true);
  });
});

describe('V3-Hülle: der Kern bleibt unangetastet (Treue-Grenze, Kap. 1.3)', () => {
  it('die Hülle rendert den Kern, sie ersetzt ihn nicht', () => {
    // Positiv: der Lesekörper kommt aus `ArtikelLeser` — nicht aus einer
    // eigenen V3-Fassung. Fiele diese Zeile, wäre der Pixelvergleich PX die
    // einzige verbleibende Wache, und der misst erst im Browser.
    const spalte = LIES('src/pages/gesetz-leser/v3/LeserLesespalte.tsx');
    expect(traegt(spalte, /<ArtikelLeser key=\{e\.id\}/), 'V3 rendert den Kern nicht mehr').toBe(true);
    expect(traegt(spalte, /id="lc-lesespalte" className="mx-auto w-full max-w-normtext"/),
      'Lesespalte weicht von der Ist-Geometrie ab (A37-Lesemass)').toBe(true);
  });

  it('die Kopfzeile trägt keine `imPane`-Verzweigung (Kap. 10, Paritäts-Grund)', () => {
    // Die Zusicherung «in beiden Panes derselbe Kopf» ist nur so viel wert wie
    // die Abwesenheit einer Pane-Weiche in der Kopf-Datei. Der e2e-Test
    // `leser-kopf-paritaet` misst das Ergebnis; diese Sonde die Ursache.
    const kopf = ohneKommentare(LIES('src/pages/gesetz-leser/v3/LeserKopf.tsx'));
    expect(traegt(kopf, /\bimPane\b/), 'imPane-Verzweigung in LeserKopf.tsx').toBe(false);
    expect(traegt(kopf, /\bistXl\b/), 'Viewport-Weiche in LeserKopf.tsx').toBe(false);
  });
});
