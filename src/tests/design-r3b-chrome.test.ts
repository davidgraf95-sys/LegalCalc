/**
 * W2·19-DESIGN-KONSISTENZ — Runde 3, Paket β (31.8.2026).
 *
 * Bewacht die vier Kanons dieses Pakets:
 *   B3-1/B3-2 · EIN Gruppenkopf, jetzt auch in seiner DICHTEN Gestalt
 *               (Panels, Kontext-Gruppen, Wizard-Sektionen, Sperrtage-Zähler).
 *   A3-1      · EIN Schliess-✕ (`ui/SchliessKnopf`) samt Komfort-Trefferfläche.
 *   A3-2      · EINE Schwebefläche (`.lc-schwebeflaeche`) für alles, was über
 *               dem Inhalt steht.
 *   A3-3      · EINE Treffer-Zeile — die Live-Suche war die dritte Bauform.
 *
 * QUELLTEXT-SONDE, kein Render-Test: bewacht wird «diese Form kommt in der App
 * genau einmal vor». Das ist am Quelltext messbar, am DOM einer einzelnen Seite
 * nicht (gleiche Bauart wie `design-gruppenkopf-karten-c.test.ts`).
 *
 * ROT-BEWEIS (§6.7): jeder Fall trägt eine NEGATIV-KONTROLLE — derselbe
 * Ausdruck, angewandt auf den Wortlaut, wie er vor diesem Paket im Repo stand.
 * Läuft die Kontrolle grün, prüft der Ausdruck nichts und der Fall ist wertlos.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = join(__dirname, '..');
const CSS = readFileSync(join(WURZEL, 'index.css'), 'utf8');

function lies(rel: string): string {
  return readFileSync(join(WURZEL, rel), 'utf8');
}

/** Alle .tsx unter src/, ohne Tests und Fixtures. */
function alleTsx(dir = WURZEL, treffer: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'tests' || name === 'fixtures') continue;
      alleTsx(p, treffer);
    } else if (name.endsWith('.tsx')) {
      treffer.push(p);
    }
  }
  return treffer;
}

/** Kommentare weg: sie ZITIEREN die alten Formen legitim (Herleitung, §7) —
 *  verboten ist die Form im gerenderten Markup. */
function ohneKommentare(quelle: string): string {
  return quelle.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const rel = (p: string) => p.slice(WURZEL.length + 1);

// ─── B3-1/B3-2 · der dichte Gruppenkopf ─────────────────────────────────────

/**
 * Das dichte Rezept: Overline-Kopf, Zähler unmittelbar am Titel.
 *
 * ── R4-B (5.9.2026) · zweimal zu eng gefasst, beides behoben ───────────────
 * (1) Der Ausdruck verlangte `className="lc-overline"` — die Klasse ALLEIN in
 *     ihren Anführungszeichen. Jeder Kopf, der daneben noch Layout trug
 *     (`className="lc-overline shrink-0 whitespace-nowrap …"`), lief durch.
 * (2) Geprüft wurde eine Vierer-LISTE statt der App. Das ist die Vakuum-Falle,
 *     die R3-α für vier andere Wächter aufgelöst hat (`tests/appDateien.ts`) —
 *     hier stand sie noch.
 * GEMESSEN am 5.9.2026: beides zusammen verdeckte die achte Kopie,
 * `pages/gesetz-leser/parts/BezuegeZeile.tsx` Z. 154–157 («KANTONAL 13»).
 * Der Sweep unten wird ohne deren Migration rot — das ist der Rot-Beweis
 * (§6.7) dieses Pakets.
 */
const DICHT_REZEPT = /className="[^"]*\blc-overline\b[^"]*"[^>]*>[\s\S]{0,80}?<span className="num tabular-nums ml-1 font-normal normal-case/;

describe('B3-1/B3-2 · dichte Gruppenköpfe laufen über `ui/GruppenKopf`', () => {
  const migriert = [
    'pages/gesetz-leser/v3/PanelAnwendung.tsx',
    'pages/gesetz-leser/v3/PanelMaterialien.tsx',
    'pages/gesetz-leser/v3/PanelEntscheide.tsx',
    'components/kontext/KontextGruppe.tsx',
    // R4-B: vom App-weiten Sweep gefunden, nicht von der Liste.
    'pages/gesetz-leser/parts/BezuegeZeile.tsx',
  ];

  it('KEINE Fläche der App zeichnet das dichte Rezept noch selbst', () => {
    const rueckfaelle = alleTsx()
      .filter((p) => DICHT_REZEPT.test(ohneKommentare(readFileSync(p, 'utf8'))))
      .map(rel);
    expect(rueckfaelle).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die Vorher-Form', () => {
    // Wortlaut aus PanelAnwendung.tsx vor dem Fix (Stand 31.8.2026, Z. 127–129).
    const vorher = `
          <p className="lc-overline">Behörden-Praxis
            <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">{ressourcen.length}</span>
          </p>`;
    expect(DICHT_REZEPT.test(vorher)).toBe(true);
  });

  it('alle vier rendern stattdessen den Baustein', () => {
    for (const r of migriert) {
      expect(lies(r), `${r}: konsumiert ui/GruppenKopf`).toContain('<GruppenKopf');
    }
  });

  it('der Baustein trägt beide Gestalten — und der Zähler bleibt die nackte Zahl', () => {
    const b = lies('components/ui/GruppenKopf.tsx');
    expect(b, '`dicht` als Prop, nicht als zweiter Baustein').toMatch(/dicht\?: boolean/);
    expect(b, '`als="p"` für Köpfe ohne Outline-Wirkung').toMatch(/als\?: 'h' \| 'p'/);
    expect(b, 'Marke links ODER rechts').toMatch(/markeStellung\?: 'links' \| 'rechts'/);
    // C-2 bleibt: keine Klammern, kein Mittelpunkt, keine tote Utility (der
    // Dateikopf ZITIERT die Vorher-Form — geprüft wird das Markup).
    expect(ohneKommentare(b)).not.toContain('tabular-nums');
  });

  it('B3-2: die beiden breiten Kopien sind weg (Wizard-Sektion, Sperrtage-Zähler)', () => {
    // Die Haarlinie ist die Signatur des breiten Rezepts. Geprüft werden hier
    // NUR die beiden Dateien dieses Pakets — der App-weite Sweep über alle
    // Gruppenkopf-Flächen gehört zur Wurzel-Verschärfung des Parallel-Pakets.
    for (const r of ['components/vorlagen/ui.tsx', 'components/SperrtageZaehler.tsx']) {
      expect(ohneKommentare(lies(r)), `${r}: keine eigene Haarlinie mehr`)
        .not.toContain('flex-1 h-px bg-line');
      expect(lies(r), `${r}: konsumiert ui/GruppenKopf`).toContain('GruppenKopf');
    }
  });

  it('NEGATIV-KONTROLLE: die Haarlinien-Signatur trifft die Vorher-Form', () => {
    // Wortlaut aus vorlagen/ui.tsx vor dem Fix (Stand 31.8.2026, Z. 167–174).
    const vorher = `
    <div className="flex items-center gap-3">
      <p className="lc-overline text-brass-700">{children}</p>
      <span aria-hidden className="flex-1 h-px bg-line" />
    </div>`;
    expect(vorher).toContain('flex-1 h-px bg-line');
  });
});

// ─── A3-1 · EIN Schliess-✕ ──────────────────────────────────────────────────

/**
 * Wer das ✕ ausserhalb des Bausteins zeichnen darf — und WARUM. Drei Klassen:
 *   (a) BESCHRIFTETE Griffe: das ✕ steht dort neben einem Wort, ist also nicht
 *       der Knopf, sondern sein Vorzeichen.
 *   (b) ANDERE HANDLUNG: «leeren» und «verwerfen» sind kein «schliessen» —
 *       gleiche Glyphe, andere Aussage (§8); sie zusammenzuziehen wäre die
 *       Abstraktion, vor der §1 warnt.
 *   (c) OFFENER REST, ausdrücklich als solcher ausgewiesen statt weggeglättet.
 */
const X_AUSNAHMEN: Record<string, string> = {
  'components/ui/SchliessKnopf.tsx': 'der Baustein selbst',
  'components/rechtsprechung/LesemodusOverlay.tsx': '(a) beschrifteter Chip «✕ schliessen»',
  'pages/gesetz-leser/v3/LeserTrefferBlatt.tsx': '(a) beschrifteter Griff «✕ ausblenden»',
  'components/start/UniversalSuche.tsx': '(b) «Suche leeren» — leert das Feld, schliesst nichts',
  'pages/Suche.tsx': '(b) «Suche leeren»',
  'pages/gesetz-leser/v3/SuchSprungFeld.tsx': '(b) «Suche leeren (Esc)»',
  'pages/gesetz-leser/parts/WeiterlesenChip.tsx': '(b) «Angebot verwerfen» — verwirft, schliesst nicht',
};

describe('A3-1 · das Schliess-✕ kommt aus EINEM Baustein', () => {
  it('keine weitere Fläche zeichnet das Glyph noch selbst', () => {
    const funde = alleTsx()
      .filter((p) => ohneKommentare(readFileSync(p, 'utf8')).includes('✕'))
      .map(rel)
      .filter((r) => !(r in X_AUSNAHMEN));
    expect(funde).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Sweep sieht das Glyph im Markup, nicht im Kommentar', () => {
    const vorher = `<button aria-label="Navigation schliessen"><span aria-hidden>✕</span></button>`;
    expect(ohneKommentare(vorher)).toContain('✕');
    expect(ohneKommentare('/* die Leiste endet mit ✕ */\nconst x = 1;')).not.toContain('✕');
  });

  it('die sieben Konsumenten rendern den Baustein', () => {
    const konsumenten = [
      'components/layout/Shell.tsx',
      'components/layout/HeaderSuche.tsx',
      'components/layout/InhaltsKopf.tsx',
      'components/layout/TabPanel.tsx',
      'components/NormPopover.tsx',
      'components/ui/SheetRahmen.tsx',
      'pages/gesetz-leser/v3/LeserPanel.tsx',
      // Achte Fundstelle, im Bau dazugekommen: die zeichengleiche Kopie der
      // NormPopover-Kopfzeile in `vorlagen/NormChip.tsx` (§5).
      'components/vorlagen/NormChip.tsx',
      // R4-A (5.9.2026): die als «(c) OFFEN (R3-γ)» ausgewiesene neunte Fläche
      // ist eingesammelt — der Klassen-String der Pane-Titelleiste ist in BOX
      // (`GRIFF_BOX`) und Hover-Fläche (`GRIFF_FLAECHE`) geteilt, das ✕ holt
      // seinen Ton als `ton="destruktiv"` aus dem Baustein.
      'components/layout/PaneKopf.tsx',
    ];
    for (const r of konsumenten) {
      expect(lies(r), `${r}: rendert <SchliessKnopf`).toContain('<SchliessKnopf');
    }
  });

  it('genau drei Töne, und der destruktive ist DEKLARIERT (nicht eine Farb-Utility)', () => {
    const b = lies('components/ui/SchliessKnopf.tsx');
    expect(b).toContain("ruhig: 'text-ink-500 hover:text-brass-700'");
    expect(b).toContain("destruktiv: 'text-ink-500 hover:text-danger-700'");
    expect(b).toContain("geerbt: ''");
    expect(lies('components/layout/TabPanel.tsx'), 'Reiter schliessen = destruktiv')
      .toContain('ton="destruktiv"');
    // Die Farbe darf nicht wieder als lose Utility neben dem Baustein stehen.
    expect(ohneKommentare(lies('components/layout/TabPanel.tsx')))
      .not.toContain('hover:text-danger-700');
    // R4-A: dieselbe Regel für die Pane-Titelleiste — dort stand der Ton als
    // Anhängsel an einem Klassen-String, der bereits `hover:text-brass-700`
    // trug. GEMESSEN am Preview (5.9.2026): beide Utilities auf EINEM Knopf,
    // gemalt wurde `rgb(122,47,35)` (danger-700) — allein wegen der Sortierung
    // im Stylesheet. Kein Knopf der App trägt zwei Hover-Töne gleichzeitig.
    const pk = ohneKommentare(lies('components/layout/PaneKopf.tsx'));
    expect(pk, 'Pane-✕ = destruktiv, deklariert').toContain('ton="destruktiv"');
    expect(pk, 'kein loser danger-Ton neben dem Baustein').not.toContain('hover:text-danger-700');
    const doppelHover = (quelle: string): string[] =>
      (quelle.match(/class[nN]ame=\{?[`"'][^`"']*[`"']/g) ?? [])
        .filter((m) => m.includes('hover:text-brass-700') && m.includes('hover:text-danger-700'));
    // NEGATIV-KONTROLLE (§6.7): der Ausdruck sieht die Vorher-Form. Wortlaut aus
    // PaneKopf.tsx Z. 159 im Stand vom 31.8.2026 — `knopf` trug den Brass-Ton,
    // der Fundort hängte den Danger-Ton an; Tailwind mischt beide in EINE
    // Klassenliste. Der Beleg wird NIE nachgeführt (§2b).
    const vorherPaneX = 'className={`${knopf} hover:text-danger-700`}';
    const knopfString = 'className="inline-flex h-7 w-7 text-ink-500 hover:text-brass-700 hover:text-danger-700"';
    expect(vorherPaneX).toContain('hover:text-danger-700');
    expect(doppelHover(knopfString)).toHaveLength(1);
    for (const r of alleTsx()) {
      const funde = doppelHover(ohneKommentare(readFileSync(r, 'utf8')));
      expect(funde, `${rel(r)}: zwei Hover-Töne in EINEM Klassen-String`).toEqual([]);
    }
  });

  it('die Trefferfläche wächst per ::after auf das Komfort-Token (F9: kein roher Wert)', () => {
    const block = /\.lc-schliessknopf-komfort::after \{([\s\S]*?)\}/.exec(CSS)?.[1] ?? '';
    expect(block, '.lc-schliessknopf-komfort::after existiert').not.toBe('');
    expect(block, 'Komfortmass aus dem Token').toContain('min-width: var(--tap-ziel-komfort)');
    expect(block, 'Komfortmass aus dem Token').toContain('min-height: var(--tap-ziel-komfort)');
    const basis = /\.lc-schliessknopf \{([\s\S]*?)\}/.exec(CSS)?.[1] ?? '';
    expect(basis, 'sichtbare Untergrenze aus dem Token').toContain('var(--tap-ziel)');
    expect(basis, 'die Pseudo-Fläche braucht einen Positionsanker').toContain('relative');
  });

  it('die Komfort-Fläche ist an, ausser in den drei begründeten dichten Zeilen', () => {
    // Das Pseudo-Element liegt ÜBER dem Nachbarn und nähme ihm die Klicks —
    // wer es abschaltet, tut das sichtbar und mit Grund am Fundort. Ein
    // stiller vierter Ausstieg wird hier rot.
    //
    // R4-A (5.9.2026): die Pane-Titelleiste ist die dritte solche Zeile —
    // ⠿ ◂ ▸ ⇱ ⧉ ✕ stehen dort in einer 36 px hohen Leiste unmittelbar
    // nebeneinander; 44 px um das ✕ lägen über ⧉ und ▸. Der Test hat die
    // Ausnahme beim Bau selbst gefunden (rot, bevor sie deklariert war).
    const dicht = [
      'components/layout/TabPanel.tsx',
      'components/layout/InhaltsKopf.tsx',
      'components/layout/PaneKopf.tsx',
    ];
    const funde = alleTsx()
      .filter((p) => ohneKommentare(readFileSync(p, 'utf8')).includes('komfort={false}'))
      .map(rel);
    expect(funde.sort()).toEqual([...dicht].sort());
    for (const r of dicht) {
      expect(lies(r), `${r}: die Ausnahme ist am Fundort begründet`)
        .toMatch(/komfort=\{false\}|`komfort=\{false\}`/);
    }
  });
});

// ─── R4-C · `.num` UND `tabular-nums` sind kein Paar, sondern ein Konflikt ──

/**
 * GEMESSEN am Preview (5.9.2026, Chromium 1440×900, `getComputedStyle`):
 *
 *   `<span class="num">`                → font-variant-numeric: lining-nums tabular-nums
 *   `<span class="num tabular-nums">`   → font-variant-numeric: tabular-nums
 *
 * Die Utility ist also NICHT bloss tot (so stand es in der R3-γ-Liste), sie ist
 * SCHÄDLICH: `.num` lebt in `@layer components`, `tabular-nums` in
 * `@layer utilities` — die spätere Schicht gewinnt und ersetzt die ganze
 * Deklaration, `lining-nums` fällt dabei weg. Genau das, was der Kommentar an
 * `.num` (index.css) als «ausdrücklich Versal- UND Tabellenziffern» verlangt,
 * schaltete das vermeintlich redundante Wort ab.
 *
 * Betroffen waren 16 Fundstellen in 11 Dateien; Ziffern derselben Rolle liefen
 * dadurch in zwei Rendering-Modi — der Kernbefund dieses Fahrplans.
 *
 * `tabular-nums` OHNE `.num` bleibt zulässig und unberührt: dort trägt die
 * Utility die Textstimme (`ui/Datum`, Stand-Zeilen, Treffer-Zähler) und hat
 * keinen Konflikt-Partner.
 */
describe('R4-C · keine Klassenliste trägt `.num` und `tabular-nums` zugleich', () => {
  const konflikt = (quelle: string): string[] =>
    (quelle.match(/class[nN]ame=\{?[`"][^`"]*[`"]/g) ?? [])
      .filter((t) => /\bnum\b/.test(t.replace(/tabular-nums/g, '')) && t.includes('tabular-nums'));

  it('NEGATIV-KONTROLLE: die Sonde sieht die Vorher-Form, und nur sie', () => {
    // Wortlaut aus `verzahnung/BezugZeitWahl.tsx` Z. 212 im Stand vom
    // 31.8.2026 — Beleg, nie nachgeführt (§2b).
    expect(konflikt('<span className="num tabular-nums">{jahr}</span>')).toHaveLength(1);
    // Die zwei erlaubten Nachbarschaften bleiben grün:
    expect(konflikt('<span className="num text-ink-500">{n}</span>')).toEqual([]);
    expect(konflikt('<p className="text-xs tabular-nums">{stand}</p>')).toEqual([]);
  });

  it('App-weit keine Fundstelle mehr', () => {
    for (const p of alleTsx()) {
      const funde = konflikt(ohneKommentare(readFileSync(p, 'utf8')));
      expect(funde, `${rel(p)}: \`tabular-nums\` neben \`.num\` nimmt \`lining-nums\` weg`).toEqual([]);
    }
  });
});

// ─── A3-2 · EINE Schwebefläche ──────────────────────────────────────────────

/**
 * `shadow-lg` ist die Signatur einer schwebenden Fläche. Wer sie trägt, trägt
 * `.lc-schwebeflaeche` — ausser die Fläche ist gar keine RECHTECKIGE Tafel:
 */
const SCHWEBE_AUSNAHMEN: Record<string, string> = {
  'components/ui/SchwebeMeldung.tsx': 'Pille (rounded-full, ohne Rahmen) — andere Gestalt',
  'components/ui/SheetRahmen.tsx': 'Bottom-Sheet: an die Kante gebaut (rounded-t-xl, border-t)',
  'components/layout/Shell.tsx': 'Navigations-Schublade: volle Höhe, border-r, ohne Radius',
  'components/vorlagen/wizard.tsx': 'runder Aktionsknopf (FAB), keine Fläche',
};

describe('A3-2 · schwebende Flächen teilen EINE Anatomie', () => {
  it('die Klasse führt alle vier Glieder der gemessenen Kette', () => {
    const block = /\.lc-schwebeflaeche \{([\s\S]*?)\}/.exec(CSS)?.[1] ?? '';
    for (const glied of ['bg-paper-raised', 'border', 'border-line', 'rounded-lg', 'shadow-lg']) {
      expect(block, `.lc-schwebeflaeche führt ${glied}`).toContain(glied);
    }
  });

  it('keine Fläche baut die Kette noch selbst', () => {
    const funde: string[] = [];
    for (const p of alleTsx()) {
      if (rel(p) in SCHWEBE_AUSNAHMEN) continue;
      for (const zeile of ohneKommentare(readFileSync(p, 'utf8')).split('\n')) {
        if (zeile.includes('shadow-lg') && !zeile.includes('lc-schwebeflaeche')) {
          funde.push(`${rel(p)} · ${zeile.trim().slice(0, 80)}`);
        }
      }
    }
    expect(funde).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Sweep findet die Vorher-Form', () => {
    // Wortlaut aus LeserTrefferBlatt.tsx vor dem Fix (Stand 31.8.2026, Z. 102).
    const vorher = 'className="absolute left-0 top-full z-30 flex max-h-[50dvh] w-72 max-w-full flex-col rounded-lg border border-line bg-paper shadow-lg">';
    expect(vorher.includes('shadow-lg') && !vorher.includes('lc-schwebeflaeche')).toBe(true);
  });

  it('die acht Konsumenten tragen die Klasse — samt der beiden Fixes', () => {
    const konsumenten = [
      'components/SprachUmschalter.tsx',
      'components/DatumsFeld.tsx',
      'components/layout/VerlaufUebersicht.tsx',
      'components/layout/ReiterUebersicht.tsx',
      'pages/gesetz-leser/v3/LeserAnsichtV3.tsx',
      'pages/gesetz-leser/v3/LeserPanel.tsx',
      'pages/gesetz-leser/v3/LeserTrefferBlatt.tsx',
      'components/normtext/ArtikelBody.tsx',
    ];
    for (const r of konsumenten) {
      expect(lies(r), `${r}: trägt .lc-schwebeflaeche`).toContain('lc-schwebeflaeche');
    }
    // Die zwei Fixes: keine schwebende Fläche steht mehr in der GRUNDfarbe der
    // Seite — ein Schatten über `--paper` behauptet eine Ebene, die die Fläche
    // dementiert.
    for (const r of ['pages/gesetz-leser/v3/LeserTrefferBlatt.tsx', 'components/normtext/ArtikelBody.tsx']) {
      expect(ohneKommentare(lies(r)), `${r}: nicht mehr bg-paper`).not.toMatch(/bg-paper[^-]/);
    }
  });
});

// ─── A3-3 · EINE Treffer-Zeile ──────────────────────────────────────────────

describe('A3-3 · die Live-Suche konsumiert `ui/TrefferZeile`', () => {
  it('Baustein und gemeinsamer Rahmen statt lokaler Kopie', () => {
    const q = lies('components/rechtsprechung/LiveSuche.tsx');
    expect(q, 'rendert den Baustein').toContain('<TrefferZeile');
    expect(q, 'teilt die Flex-Geometrie/den Gruppen-Namen').toContain('TREFFER_ZEILE_RAHMEN');
    expect(ohneKommentare(q), 'keine eigene Zeilen-Geometrie mehr')
      .not.toContain('group flex items-stretch gap-3');
  });

  it('NUR der Baustein definiert eine Treffer-Zeile — auch ohne `export`', () => {
    // Der Sweep aus Runde 2 (`design-r2c-bausteine.test.ts`) prüfte auf
    // `export function TrefferZeile(` und ging an der Live-Suche vorbei, weil
    // deren Kopie modul-lokal war. Vakuum-Lücke geschlossen (§6.7).
    const funde = alleTsx()
      .filter((p) => /function TrefferZeile\(/.test(readFileSync(p, 'utf8')))
      .map(rel);
    expect(funde).toEqual(['components/ui/TrefferZeile.tsx']);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die modul-lokale Kopie', () => {
    expect(/function TrefferZeile\(/.test('function TrefferZeile({ t }: { t: LiveTreffer }) {')).toBe(true);
  });

  it('die zwei additiven Slots stehen im Baustein, nicht in der Fläche', () => {
    const b = lies('components/ui/TrefferZeile.tsx');
    expect(b, 'Herkunfts-Zeile als Slot').toContain('meta?: ReactNode');
    expect(b, '«führt hinaus» als Pfeil-Wert').toContain("pfeil?: '→' | '↵' | '↗' | null");
  });
});
