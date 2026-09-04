/**
 * W2·19-DESIGN-KONSISTENZ — Runde 5 (5.9.2026).
 *
 * Bewacht die drei Kanons dieser Runde:
 *   R5-A · EIN App-Sweep — kein Wächter baut die Verzeichnis-Wanderung nach.
 *   R5-B · EINE Ziffernsatz-Deklaration (`.num` / `.lc-ziffern`), keine rohe
 *          `fontVariantNumeric`-Zeile in der App.
 *   R5-D · EINE neutrale Hover-Fläche (`.lc-hover-flaeche`), nicht drei
 *          Stärken derselben Aussage.
 *
 * QUELLTEXT-SONDE, kein Render-Test: bewacht wird «diese Form kommt in der App
 * genau einmal vor» — am Quelltext messbar, am DOM einer einzelnen Seite nicht
 * (gleiche Bauart wie `design-r3b-chrome.test.ts`).
 *
 * ROT-BEWEIS (§6.7): jeder Fall trägt eine NEGATIV-KONTROLLE mit dem Wortlaut,
 * wie er VOR dieser Runde im Repo stand. Läuft die Kontrolle grün, prüft der
 * Ausdruck nichts und der Fall ist wertlos.
 *
 * EIGENE AUSNAHME: diese Datei steht in ihrer eigenen Sweep-Liste, weil ihre
 * Negativ-Kontrolle die verbotene Form zwangsläufig ZITIERT (§2b/§6.7) — ein
 * Wächter, der seinen eigenen Rot-Beweis als Verstoss liest, zwänge zum Löschen
 * genau des Belegs, der ihn beweisbar macht.
 *
 * LEHRE AUS R4-D, hier angewandt: ein Wächter hängt an der SACHE, nicht an
 * einem Variablennamen. R5-A sucht deshalb nicht «heisst die Funktion
 * alleTsx», sondern «wandert diese Datei selbst durch src und überspringt
 * dabei den tests-Ordner» — das ist die Signatur eines App-Sweeps, gleich wie
 * seine Helfer heissen.
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { APP_WURZEL, alleQuellen, rel, ohneKommentare, liesRoh, pruefeAusnahmen } from './appDateien';

const CSS = liesRoh(join(APP_WURZEL, 'index.css'));
const TEST_ORDNER = join(APP_WURZEL, 'tests');

// ─── R5-A · EIN App-Sweep ───────────────────────────────────────────────────

/**
 * Die Signatur eines eigenen App-Sweeps: die Datei ruft selbst `readdirSync`
 * UND kennt den Ordnernamen, den nur ein src-Sweep überspringen muss.
 *
 * An der SACHE, nicht am Namen: `alleTsx`, `alleQuellen`, `dateien`,
 * `darstellungsDateien` — vier Namen für dasselbe standen im Repo. Der
 * Ausdruck fragt nach keinem davon.
 */
const EIGENER_SWEEP = (quelle: string): boolean =>
  /\breaddirSync\s*\(/.test(quelle) && /===\s*'tests'/.test(quelle);

/**
 * Die zwei Sonden, die ihren Sweep behalten — beide, weil sie eine ANDERE
 * Frage stellen, nicht weil sie älter sind. Die Begründung steht am Fundort
 * und wird hier wörtlich zitiert: verschwindet sie dort, fällt die Ausnahme.
 */
const SWEEP_AUSNAHMEN = [
  {
    datei: 'tests/appDateien.ts',
    begruendung: '§5: die Verzeichnis-Wanderung liegt genau einmal hier statt viermal kopiert.',
  },
  {
    datei: 'tests/listen-editor-r2f.test.tsx',
    begruendung: 'dieser Sweep\n *  fegt bewusst NUR HANDGESCHRIEBENES',
  },
  {
    datei: 'tests/design-r5-konsistenz.test.ts',
    begruendung: 'der seinen eigenen Rot-Beweis als Verstoss liest',
  },
  {
    datei: 'tests/erlass-adresse.test.ts',
    begruendung: 'sucht nach ADRESSEN, also nach Zeichenketten mit `//` darin',
  },
] as const;

describe('R5-A · die App wird von EINEM Sweep gefegt', () => {
  it('kein Wächter baut die Verzeichnis-Wanderung ein zweites Mal nach', () => {
    const erlaubt = pruefeAusnahmen(SWEEP_AUSNAHMEN);
    const eigene: string[] = [];
    for (const name of readdirSync(TEST_ORDNER)) {
      if (!/\.tsx?$/.test(name)) continue;
      const pfad = `tests/${name}`;
      if (erlaubt.has(pfad)) continue;
      if (EIGENER_SWEEP(liesRoh(join(TEST_ORDNER, name)))) eigene.push(pfad);
    }
    expect(
      eigene,
      'Diese Sonden wandern selbst durch src/. Der Baustein heisst `appDateien.ts` '
      + '(`alleTsx`/`alleQuellen`/`rel`/`ohneKommentare`) — eine zweite Wanderung ist ab '
      + 'ihrer ersten Abweichung ein zweiter, stiller Wächter (§5/§17).',
    ).toEqual([]);
  });

  it('ROT-BEWEIS: der Ausdruck erkennt die Form, die vor R5-A hier stand', () => {
    // Wortlaut aus design-r3b-chrome.test.ts, Stand vor dieser Runde.
    const vorher = [
      "import { readFileSync, readdirSync, statSync } from 'node:fs';",
      'function alleTsx(dir = WURZEL, treffer: string[] = []): string[] {',
      '  for (const name of readdirSync(dir)) {',
      "    if (name === 'tests' || name === 'fixtures') continue;",
      '  }',
    ].join('\n');
    expect(EIGENER_SWEEP(vorher), 'die Vorher-Form muss auffallen').toBe(true);
    // Negativ-Kontrolle: die migrierte Form fällt NICHT auf.
    expect(EIGENER_SWEEP(liesRoh(join(TEST_ORDNER, 'design-r3b-chrome.test.ts')))).toBe(false);
  });

  it('die drei migrierten Sonden hängen wirklich am Baustein', () => {
    for (const n of ['design-r3b-chrome.test.ts', 'design-r2c-bausteine.test.ts', 'design-r2d-mobil-zustaende.test.ts']) {
      expect(liesRoh(join(TEST_ORDNER, n)), `${n}: importiert appDateien`)
        .toMatch(/from '\.\/appDateien'/);
    }
  });
});

// ─── R5-B · EINE Ziffernsatz-Deklaration ────────────────────────────────────

const ZIFFERN_AUSNAHMEN = [
  {
    datei: 'components/vorlagen/vorschauStil.ts',
    begruendung: 'VORSCHAU ist ein\n  // GESCHLOSSENES Stil-Objekt',
  },
] as const;

describe('R5-B · der Ziffernsatz hat EINE Deklaration', () => {
  it('index.css führt die Rolle ohne Familie und die Rolle mit Familie getrennt', () => {
    expect(CSS, '`.lc-ziffern` ist die Rolle ohne Monospace-Familie')
      .toContain('.num, .lc-ziffern { font-variant-numeric: lining-nums tabular-nums; }');
    expect(CSS, '`.num` bleibt Rolle + Familie')
      .toContain('.num { font-family: var(--font-mono), ui-monospace, monospace; }');
  });

  it('keine App-Datei schreibt den Ziffernsatz noch roh hin', () => {
    const erlaubt = pruefeAusnahmen(ZIFFERN_AUSNAHMEN);
    const funde = alleQuellen()
      .filter((p) => !erlaubt.has(rel(p)))
      .filter((p) => /fontVariantNumeric|font-variant-numeric/.test(ohneKommentare(liesRoh(p))))
      .map(rel);
    expect(
      funde,
      'Der Ziffernsatz gehört in `.num` (mit Mono) oder `.lc-ziffern` (ohne) — eine rohe '
      + '`fontVariantNumeric`-Zeile ist dieselbe Wahrheit ein zweites Mal (§5/F9).',
    ).toEqual([]);
  });

  it('ROT-BEWEIS: der Ausdruck erkennt die Zeile, die in ErgebnisAnzeige stand', () => {
    const vorher = "<p className={`font-display`} style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>";
    expect(/fontVariantNumeric|font-variant-numeric/.test(ohneKommentare(vorher))).toBe(true);
    // Negativ-Kontrolle: ein Kommentar, der die Alt-Form ZITIERT, ist kein Verstoss.
    expect(/fontVariantNumeric/.test(ohneKommentare('// vorher: fontVariantNumeric roh\nconst x = 1;'))).toBe(false);
  });
});

// ─── R5-D · EINE neutrale Hover-Fläche ──────────────────────────────────────

/** Jede Utility, die eine neutrale Fläche beim Überfahren eintönt. */
const HOVER_FLAECHE = /hover:bg-(?:paper-sunken|paper-raised|paper|well|surface)(?:\/\d+)?/g;

describe('R5-D · die anklickbare Zeile tönt sich über EINEN Baustein ein', () => {
  it('index.css führt die Klasse, und sie hängt an der Rolle `--well`', () => {
    expect(CSS, '`.lc-hover-flaeche` existiert').toContain('.lc-hover-flaeche:hover');
    expect(CSS, 'sie nimmt die Rolle, nicht den Rohwert')
      .toContain('.lc-hover-flaeche:hover { background-color: var(--well); }');
  });

  it('keine App-Datei mischt eine eigene Stärke dazu', () => {
    const funde = alleQuellen().flatMap((p) => {
      const t = ohneKommentare(liesRoh(p)).match(HOVER_FLAECHE);
      return t ? t.map((m) => `${rel(p)}: ${m}`) : [];
    });
    expect(
      funde,
      'DESIGN-REGLEMENT §G-j: Interaktions-Zustände laufen über EINE Regel, getragen von einer '
      + 'Rolle. Drei Alpha-Stärken derselben Fläche (voll / 60 % / 70 %) sind drei Regeln — '
      + '`.lc-hover-flaeche` ist die eine.',
    ).toEqual([]);
  });

  it('ROT-BEWEIS: der Ausdruck erkennt alle drei Stärken, die vor R5-D im Repo standen', () => {
    const vorher = [
      'className="rounded px-2 hover:bg-paper-sunken"',
      'className="flex gap-2 hover:bg-paper-sunken/60"',
      'className="w-full hover:bg-paper-sunken/70"',
    ].join('\n');
    expect(vorher.match(HOVER_FLAECHE), 'alle drei müssen auffallen').toEqual([
      'hover:bg-paper-sunken', 'hover:bg-paper-sunken/60', 'hover:bg-paper-sunken/70',
    ]);
    // Negativ-Kontrolle: die migrierte Form fällt nicht auf.
    expect('className="rounded px-2 lc-hover-flaeche"'.match(HOVER_FLAECHE)).toBeNull();
  });
});
