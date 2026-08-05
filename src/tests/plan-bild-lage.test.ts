// src/tests/plan-bild-lage.test.ts — Laien-Block «Was gerade passiert» des
// Lagebilds (Schritt QS-PLAN-BILD-LAGE, Auftrag David 5.8.2026).
//
// Kein echter git-Aufruf: `bauPlaetze`/`letzteCommits` bekommen ihren
// Kommando-Runner injiziert, `wasGeradePassiert`/`flaechenKlartext` sind rein.
// Sonst prüfte der Test die Maschine, auf der er läuft, statt den Code.
import { bauPlaetze, letzteCommits } from '../../scripts/plan/bildDaten';
import { flaechenKlartext, wasGeradePassiert, type WasPassiert } from '../../scripts/plan/bildHtml';
import type { Laufe } from '../../scripts/plan/lage';

/** Runner-Attrappe: liefert je Kommando einen festen Text oder wirft. */
function runner(antworten: Record<string, string | Error>): Laufe {
  return (cmd, args) => {
    const schluessel = `${cmd} ${args[0]}`;
    const a = antworten[schluessel];
    if (a === undefined) throw new Error(`Attrappe kennt "${schluessel}" nicht`);
    if (a instanceof Error) throw a;
    return a;
  };
}

const PORCELAIN = [
  'worktree /Users/x/LexMetrik\nHEAD aaa\nbranch refs/heads/main',
  'worktree /Users/x/LexMetrik/.claude/worktrees/agent-abc\nHEAD bbb\nbranch refs/heads/feat/qs-plan-bild-lage',
  'worktree /Users/x/LexMetrik/.claude/worktrees/agent-def\nHEAD ccc\ndetached',
].join('\n\n');

const LOG = [
  '05.08.2026\tprozess(lehren): Session-Lehren verankert',
  '05.08.2026\tdocs(skills+fahrplan): §17-Nachzüge der QS-TOK-Session',
  '04.08.2026\tQS-TOK T14 Stufe 1: inhalt.tsx in Aspekt-Module gesplittet (#458)',
].join('\n');

function daten(p: Partial<WasPassiert> = {}): WasPassiert {
  return {
    imBau: [],
    bauplaetze: 0,
    gelandet: [],
    wartetAufDavid: [],
    methodeDatei: 'plan-bild-methode.html',
    ...p,
  };
}

describe('flaechenKlartext — Pfad → Alltagsbegriff', () => {
  it('übersetzt bekannte Flächen und streift den Glob-Teil ab', () => {
    expect(flaechenKlartext(['scripts/plan/**'])).toEqual(['Werkzeuge der Bau-Planung']);
    expect(flaechenKlartext(['src/pages'])).toEqual(['sichtbare Seiten der App']);
    expect(flaechenKlartext(['public/normtext/bund'])).toEqual(['gespeicherte Gesetzestexte']);
    expect(flaechenKlartext(['.claude/skills'])).toEqual(['Arbeitsregeln der KI-Sessions']);
    expect(flaechenKlartext(['vercel.json'])).toEqual(['die Auslieferung ins Internet']);
    expect(flaechenKlartext(['.github/workflows/ci.yml'])).toEqual(['die Prüfstrasse (automatische Kontrollen)']);
  });

  it('längster Präfix gewinnt — scripts/plan schlägt scripts', () => {
    expect(flaechenKlartext(['scripts/plan/bild.ts'])).toEqual(['Werkzeuge der Bau-Planung']);
    expect(flaechenKlartext(['scripts/prerender.ts'])).toEqual(['Hilfsprogramme hinter den Kulissen']);
    expect(flaechenKlartext(['public/rechtsprechung/register.json'])).toEqual(['gespeicherte Gerichtsentscheide']);
    expect(flaechenKlartext(['public/suche.json'])).toEqual(['ausgelieferte Dateien']);
  });

  it('unbekannter Pfad bleibt UNÜBERSETZT stehen (kein erfundener Oberbegriff)', () => {
    expect(flaechenKlartext(['tailwind.config.js'])).toEqual(['tailwind.config.js']);
    expect(flaechenKlartext(['scripts/plan/**', 'tailwind.config.js'])).toEqual([
      'Werkzeuge der Bau-Planung',
      'tailwind.config.js',
    ]);
  });

  it('nur an der Trennstelle — «scripts» deckt nicht «scriptsammlung»', () => {
    expect(flaechenKlartext(['scriptsammlung/x'])).toEqual(['scriptsammlung/x']);
    expect(flaechenKlartext(['ROADMAP.md'])).toEqual(['der Projektplan']);
    expect(flaechenKlartext(['ROADMAP-CHRONIK.md'])).toEqual(['der Projektplan']);
  });

  it('zwei Globs desselben Bereichs ergeben EINEN Eintrag', () => {
    expect(flaechenKlartext(['src/pages/**', 'src/pages/gesetze.tsx'])).toEqual(['sichtbare Seiten der App']);
  });

  it('leere Fläche ergibt leere Liste (der Block formuliert den Satz dazu)', () => {
    expect(flaechenKlartext([])).toEqual([]);
  });
});

describe('bauPlaetze', () => {
  it('zählt Bau-Plätze OHNE das Haupt-Repo', () => {
    expect(bauPlaetze(runner({ 'git worktree': PORCELAIN }))).toBe(2);
  });

  it('nur Haupt-Repo → 0', () => {
    expect(bauPlaetze(runner({ 'git worktree': PORCELAIN.split('\n\n')[0] }))).toBe(0);
  });

  it('Fehlerpfad: git wirft → null (= «nicht abfragbar», nicht «keine»)', () => {
    expect(bauPlaetze(runner({ 'git worktree': new Error('ENOENT') }))).toBeNull();
  });
});

describe('letzteCommits', () => {
  it('zerlegt Datum und Betreff an der Tabulator-Grenze', () => {
    expect(letzteCommits(5, runner({ 'git log': LOG }))).toEqual([
      { datum: '05.08.2026', betreff: 'prozess(lehren): Session-Lehren verankert' },
      { datum: '05.08.2026', betreff: 'docs(skills+fahrplan): §17-Nachzüge der QS-TOK-Session' },
      { datum: '04.08.2026', betreff: 'QS-TOK T14 Stufe 1: inhalt.tsx in Aspekt-Module gesplittet (#458)' },
    ]);
  });

  it('liest main, nicht HEAD — fertig ist, was gelandet ist', () => {
    const laufe = vi.fn(runner({ 'git log': LOG }));
    letzteCommits(5, laufe);
    expect(laufe.mock.calls[0][1]).toContain('main');
    expect(laufe.mock.calls[0][1]).toContain('-n5');
  });

  it('Fehlerpfad: git wirft (fehlt/Timeout/kein main) → null statt Absturz', () => {
    expect(() => letzteCommits(5, runner({ 'git log': new Error('ETIMEDOUT') }))).not.toThrow();
    expect(letzteCommits(5, runner({ 'git log': new Error('ETIMEDOUT') }))).toBeNull();
  });

  it('leere Ausgabe → null (kein leeres «nichts ist fertig geworden»)', () => {
    expect(letzteCommits(5, runner({ 'git log': '' }))).toBeNull();
  });
});

describe('wasGeradePassiert — Formatierung', () => {
  it('nennt je wip-Schritt Titel und übersetzte Fläche', () => {
    const html = wasGeradePassiert(
      daten({
        imBau: [
          { titel: 'Lagebild-Einstieg in Laiensprache', flaechen: ['scripts/plan'] },
          { titel: 'Token-Verbrauch minimieren', flaechen: [] },
        ],
      }),
    );
    expect(html).toContain('<b>Lagebild-Einstieg in Laiensprache</b>');
    expect(html).toContain('Betrifft: Werkzeuge der Bau-Planung');
    expect(html).toContain('Betrifft: das ganze Projekt — für dieses Arbeitspaket ist kein Bereich eingegrenzt.');
  });

  it('kein wip-Schritt → ehrlicher Satz statt leerer Liste', () => {
    expect(wasGeradePassiert(daten())).toContain('An keinem Arbeitspaket wird gerade gebaut.');
  });

  it('Bauplatz-Satz: keiner / einer / mehrere / nicht abfragbar', () => {
    expect(wasGeradePassiert(daten({ bauplaetze: 0 }))).toContain('Sonst keine parallelen Bauplätze');
    expect(wasGeradePassiert(daten({ bauplaetze: 1 }))).toContain('1 weiterer Bauplatz ist aktiv');
    expect(wasGeradePassiert(daten({ bauplaetze: 3 }))).toContain('3 weitere Bauplätze sind aktiv');
    expect(wasGeradePassiert(daten({ bauplaetze: null }))).toContain(
      'Wie viele Bauplätze gerade offen sind, lässt sich auf diesem Rechner nicht abfragen.',
    );
  });

  it('zeigt Commit-Betreffzeilen UNVERÄNDERT unter der Laien-Überschrift', () => {
    const html = wasGeradePassiert(daten({ gelandet: [{ datum: '04.08.2026', betreff: 'QS-TOK T14 Stufe 1: Split (#458)' }] }));
    expect(html).toContain('QS-TOK T14 Stufe 1: Split (#458)');
    expect(html).toContain('fertig am 04.08.2026');
    expect(html).toContain('Die letzten fünf gelandeten Arbeitspakete');
  });

  it('Fehlerpfad git → Hinweiszeile statt Leere oder Absturz', () => {
    const html = wasGeradePassiert(daten({ gelandet: null }));
    expect(html).toContain('lässt sich auf diesem Rechner gerade nicht abfragen (git nicht verfügbar)');
    expect(html).not.toContain('Noch nichts fertig geworden.');
  });

  it('David-Blocker mit Titel und Blocker-Name; leer → ehrlicher Satz', () => {
    const html = wasGeradePassiert(daten({ wartetAufDavid: [{ titel: 'Datenhaltung / VPS-Gate', blocker: 'vps-bestellung-david' }] }));
    expect(html).toContain('<b>Datenhaltung / VPS-Gate</b>');
    expect(html).toContain('wartet auf deine Entscheidung: vps-bestellung-david');
    expect(wasGeradePassiert(daten())).toContain('Nichts — im Moment hält kein Arbeitspaket auf deine Entscheidung.');
  });

  it('trägt den statischen Stand-Satz und den Glossar-Verweis', () => {
    const html = wasGeradePassiert(daten({ methodeDatei: 'plan-bild-methode.html' }));
    expect(html).toContain('Stand: beim letzten <span class="id">npm run plan:bild</span>-Lauf.');
    expect(html).toContain('<a href="plan-bild-methode.html">Arbeitsweise &amp; Glossar</a>');
  });

  it('escapt Fremdtext aus Titel und Betreff (HTML-Injektion)', () => {
    const html = wasGeradePassiert(
      daten({
        imBau: [{ titel: '<script>alert(1)</script>', flaechen: [] }],
        gelandet: [{ datum: '01.01.2026', betreff: 'fix: A & B <b>' }],
      }),
    );
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('fix: A &amp; B &lt;b&gt;');
  });

  it('bleibt bei gleichen Daten byte-gleich (Determinismus, §2)', () => {
    const d = daten({
      imBau: [{ titel: 'A', flaechen: ['src/lib/**'] }],
      bauplaetze: 2,
      gelandet: [{ datum: '05.08.2026', betreff: 'B' }],
      wartetAufDavid: [{ titel: 'C', blocker: 'entscheid-david' }],
    });
    expect(wasGeradePassiert(d)).toBe(wasGeradePassiert(d));
  });

  it('steht als eigene Sektion mit Sprungmarke #jetzt', () => {
    expect(wasGeradePassiert(daten()).startsWith('<section id="jetzt">')).toBe(true);
  });
});
