// src/tests/plan-bild-lage.test.ts — Laien-Block «Was gerade passiert» des
// Lagebilds (Schritt QS-PLAN-BILD-LAGE, Auftrag David 5.8.2026).
//
// Kein echter git-Aufruf: `bauPlaetze`/`letzteCommits` bekommen ihren
// Kommando-Runner injiziert, `wasGeradePassiert`/`flaechenKlartext` sind rein.
// Sonst prüfte der Test die Maschine, auf der er läuft, statt den Code.
import { bauPlaetze, davidFragen, letzteCommits, schrittInfoAusRoadmap, type SchrittInfo } from '../../scripts/plan/bildDaten';
import type { Etikett } from '../../scripts/plan/etikett';
import type { Einheit } from '../../scripts/plan/parse';
import {
  BEREICH_ERKLAERUNG,
  UEBRIGE_TECHNIK,
  WIRKUNGSBEREICHE,
  flaechenKlartext,
  schrittLabel,
  wasGeradePassiert,
  wirkungsbereiche,
  type WasPassiert,
} from '../../scripts/plan/bildHtml';
import { bauPrompt, methodeSeite } from '../../scripts/plan/bildSeiten';
import { readFileSync } from 'node:fs';
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
    weitereBlockierte: 0,
    methodeDatei: 'plan-bild-methode.html',
    stand: '5. Aug. 2026, 16:30',
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
          { titel: 'Lagebild-Einstieg in Laiensprache', id: 'QS-PLAN-BILD-LAGE', flaechen: ['scripts/plan'] },
          { titel: 'Token-Verbrauch minimieren', id: 'QS-TOK', flaechen: [] },
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
    const html = wasGeradePassiert(daten({ wartetAufDavid: [{ titel: 'Datenhaltung / VPS-Gate', id: 'QS-DATA', blocker: 'vps-bestellung-david', flaechen: [] }] }));
    expect(html).toContain('<b>Datenhaltung / VPS-Gate</b>');
    expect(html).toContain('wartet auf deine Entscheidung: vps-bestellung-david');
    expect(wasGeradePassiert(daten())).toContain('Nichts — im Moment hält kein Arbeitspaket auf deine Entscheidung.');
  });

  it('zählt Blockierte OHNE «david» im Namen mit, statt sie zu verschweigen', () => {
    expect(wasGeradePassiert(daten({ weitereBlockierte: 0 }))).not.toContain('auf eine Klärung');
    expect(wasGeradePassiert(daten({ weitereBlockierte: 1 }))).toContain('Dazu wartet 1 weiteres Arbeitspaket auf eine Klärung');
    expect(wasGeradePassiert(daten({ weitereBlockierte: 2 }))).toContain('Dazu warten 2 weitere Arbeitspakete auf eine Klärung');
  });

  it('übersetzt CLAUDE.md — im Bestand belegte Fläche', () => {
    expect(flaechenKlartext(['CLAUDE.md'])).toEqual(['die Grundregeln des Projekts']);
  });

  it('trägt die Stand-Zeile oben sichtbar und den Glossar-Verweis', () => {
    const html = wasGeradePassiert(daten({ methodeDatei: 'plan-bild-methode.html', stand: '5. Aug. 2026, 16:30' }));
    // Prominent oben: eigene Zeile in .lage, VOR der ersten Unterüberschrift.
    expect(html).toContain('<p class="lage"><b>Stand: 5. Aug. 2026, 16:30</b></p>');
    expect(html.indexOf('Stand: 5. Aug. 2026')).toBeLessThan(html.indexOf('<h3>Gerade im Bau</h3>'));
    expect(html).toContain('Diese Angaben stammen vom letzten <span class="id">npm run plan:bild</span>-Lauf (5. Aug. 2026, 16:30).');
    expect(html).toContain('<a href="plan-bild-methode.html">Arbeitsweise &amp; Glossar</a>');
  });

  it('zeigt Titel zuerst, Kürzel in Klammern dahinter — nie ID-first', () => {
    const html = wasGeradePassiert(
      daten({ imBau: [{ titel: 'Lagebild-Einstieg in Laiensprache', id: 'QS-PLAN-BILD-LAGE', flaechen: [] }] }),
    );
    expect(html).toContain('<b>Lagebild-Einstieg in Laiensprache</b> <span class="id">(QS-PLAN-BILD-LAGE)</span>');
    expect(html.indexOf('Lagebild-Einstieg')).toBeLessThan(html.indexOf('QS-PLAN-BILD-LAGE'));
  });

  it('setzt Wirkungsbereich-Badges an «Gerade im Bau» und «Wartet auf David»', () => {
    const html = wasGeradePassiert(
      daten({
        imBau: [{ titel: 'A', id: 'QS-A', flaechen: ['src/pages/**'] }],
        wartetAufDavid: [{ titel: 'B', id: 'QS-B', blocker: 'entscheid-david', flaechen: ['.github'] }],
      }),
    );
    // Farbcodierung je Bereich seit 8.8.2026 (Auftrag David «visuell klarer»).
    expect(html).toContain('<span class="chip bz bz-ui" title="Wirkungsbereich">Benutzeroberfläche</span>');
    expect(html).toContain('<span class="chip bz bz-ausl" title="Wirkungsbereich">Auslieferung &amp; Prüfstrasse</span>');
  });

  it('escapt Fremdtext aus Titel und Betreff (HTML-Injektion)', () => {
    const html = wasGeradePassiert(
      daten({
        imBau: [{ titel: '<script>alert(1)</script>', id: 'QS-X', flaechen: [] }],
        gelandet: [{ datum: '01.01.2026', betreff: 'fix: A & B <b>' }],
      }),
    );
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('fix: A &amp; B &lt;b&gt;');
  });

  it('bleibt bei gleichen Daten byte-gleich (Determinismus, §2)', () => {
    const d = daten({
      imBau: [{ titel: 'A', id: 'QS-A', flaechen: ['src/lib/**'] }],
      bauplaetze: 2,
      gelandet: [{ datum: '05.08.2026', betreff: 'B' }],
      wartetAufDavid: [{ titel: 'C', id: 'QS-C', blocker: 'entscheid-david', flaechen: ['.github'] }],
    });
    expect(wasGeradePassiert(d)).toBe(wasGeradePassiert(d));
  });

  it('steht als eigene Sektion mit Sprungmarke #jetzt', () => {
    expect(wasGeradePassiert(daten()).startsWith('<section id="jetzt">')).toBe(true);
  });
});

describe('wirkungsbereiche — Kategorien aus den kollision:-Globs', () => {
  it('je Kategorie ein belegter Fall', () => {
    expect(wirkungsbereiche(['src/pages/**'])).toEqual(['Benutzeroberfläche']);
    expect(wirkungsbereiche(['src/lib/verjaehrung'])).toEqual(['Rechtslogik & Berechnungen']);
    expect(wirkungsbereiche(['public/normtext/bund'])).toEqual(['Gesetzes- & Urteilsdaten']);
    expect(wirkungsbereiche(['scripts/datenhaltung/check-turso-frische.ts'])).toEqual(['Datenhaltung']);
    expect(wirkungsbereiche(['.github/workflows/ci.yml'])).toEqual(['Auslieferung & Prüfstrasse']);
    expect(wirkungsbereiche(['scripts/plan'])).toEqual(['KI-Arbeitsprozesse']);
  });

  it('src/lib/normtext zählt zu den DATEN, jedes andere src/lib zur Rechtslogik', () => {
    expect(wirkungsbereiche(['src/lib/normtext/laden.ts'])).toEqual(['Gesetzes- & Urteilsdaten']);
    expect(wirkungsbereiche(['src/lib/rechtsprechung/besetzung'])).toEqual(['Gesetzes- & Urteilsdaten']);
    expect(wirkungsbereiche(['src/lib/tarif'])).toEqual(['Rechtslogik & Berechnungen']);
  });

  it('scripts allein sagt nichts — die Unterordner entscheiden', () => {
    expect(wirkungsbereiche(['scripts/fedlex-cache.sh'])).toEqual(['Gesetzes- & Urteilsdaten']);
    expect(wirkungsbereiche(['scripts/check-tor-paritaet.ts'])).toEqual(['Auslieferung & Prüfstrasse']);
    expect(wirkungsbereiche(['scripts/prerender.ts'])).toEqual([UEBRIGE_TECHNIK]);
  });

  it('Mehrfach-Zuordnung in KANONISCHER Reihenfolge, nicht in Glob-Reihenfolge', () => {
    expect(wirkungsbereiche(['.claude', 'src/pages', '.github'])).toEqual([
      'Benutzeroberfläche',
      'Auslieferung & Prüfstrasse',
      'KI-Arbeitsprozesse',
    ]);
  });

  it('nicht zuordenbarer Pfad → «Übrige Technik», immer zuletzt', () => {
    expect(wirkungsbereiche(['irgendwas/neues'])).toEqual([UEBRIGE_TECHNIK]);
    expect(wirkungsbereiche(['irgendwas/neues', 'src/pages'])).toEqual(['Benutzeroberfläche', UEBRIGE_TECHNIK]);
  });

  it('ohne Globs bleibt die Liste leer — «nichts deklariert» ≠ «nicht zuordenbar»', () => {
    expect(wirkungsbereiche([])).toEqual([]);
  });

  it('dieselbe Kategorie doppelt ergibt EINEN Eintrag', () => {
    expect(wirkungsbereiche(['src/pages/**', 'src/components/x.tsx', 'src/index.css'])).toEqual(['Benutzeroberfläche']);
  });

  it('jede der sechs Kategorien trägt einen Laien-Satz, dazu die Auffangkategorie', () => {
    const erklaert = BEREICH_ERKLAERUNG.map(([name]) => name);
    for (const b of WIRKUNGSBEREICHE) expect(erklaert).toContain(b);
    expect(erklaert).toContain(UEBRIGE_TECHNIK);
    for (const [, satz] of BEREICH_ERKLAERUNG) expect(satz.length).toBeGreaterThan(40);
  });
});

describe('schrittLabel — Titel zuerst, Kürzel in Klammern', () => {
  it('fett und mager, beide mit Klammer-Kürzel dahinter', () => {
    expect(schrittLabel('Kantone in der Breite', 'W2·13-KANTONE')).toBe(
      '<b>Kantone in der Breite</b> <span class="id">(W2·13-KANTONE)</span>',
    );
    expect(schrittLabel('Kantone in der Breite', 'W2·13-KANTONE', false)).toBe(
      'Kantone in der Breite <span class="id">(W2·13-KANTONE)</span>',
    );
  });

  it('escapt Titel und Kürzel', () => {
    expect(schrittLabel('A & B', '<x>')).toContain('A &amp; B');
    expect(schrittLabel('A & B', '<x>')).toContain('(&lt;x&gt;)');
  });
});

describe('davidFragen — @david-fragen-Block statt hartkodierter Liste (§5, 8.8.2026)', () => {
  it('liest Frage und Quelle aus dem Block', () => {
    const md = ['<!-- @david-fragen', 'f1: Frage eins? · quelle: Quelle A', 'f2: Frage zwei? · quelle: Quelle B', '-->'].join('\n');
    expect(davidFragen(md)).toEqual([
      { frage: 'Frage eins?', quelle: 'Quelle A' },
      { frage: 'Frage zwei?', quelle: 'Quelle B' },
    ]);
  });
  it('ohne Block: leere Liste (keine Erfindung)', () => {
    expect(davidFragen('# Plan ohne Fragen')).toEqual([]);
  });
  it('Zeilen ohne quelle-Feld werden nicht halb geraten, sondern ausgelassen', () => {
    const md = ['<!-- @david-fragen', 'kaputt: Frage ohne Quelle', '-->'].join('\n');
    expect(davidFragen(md)).toEqual([]);
  });
});

describe('schrittInfoAusRoadmap — Klartext-Titel aus der ROADMAP-Zeile', () => {
  const MD = [
    '- [ ] **`QS-BEISPIEL` · Ein sprechender Titel für Laien** *(Anlass: Test)* — Prosa dazu.',
    '  <!-- @meta id: QS-BEISPIEL · status: ready · blocker: null · dep: [] · kollision: [scripts/plan] · worktree: ja · 26x: nein -->',
  ].join('\n');

  it('nimmt den Fettdruck-Titel und streift die vorangestellte ID ab', () => {
    expect(schrittInfoAusRoadmap(MD).get('QS-BEISPIEL')?.titel).toBe('Ein sprechender Titel für Laien');
  });

  it('Titel ohne ID-Präfix bleibt unverändert', () => {
    const md = [
      '- **Geräte-Last / Performance** *(QS-PERF)*.',
      '  <!-- @meta id: QS-PERF · status: ready · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    expect(schrittInfoAusRoadmap(md).get('QS-PERF')?.titel).toBe('Geräte-Last / Performance');
  });
});

describe('methodeSeite — Legenden für Sessions und Laien', () => {
  const html = methodeSeite({ indexPfad: 'tmp/plan-bild.html', watch: null, stand: '5. Aug. 2026, 16:30' });

  // Fachliche Änderung, deklariert (§6.3): Die Legende nannte «TOK
  // Token-Sparen» und «PLAN Bau-Planung» als Themen-Beispiele. Beide Etiketten
  // existieren seit der Etiketten-Konsolidierung (QS-PLAN-EINFACH 14.8.2026,
  // Fusion 15.8.2026) nicht mehr als offene Schritte — QS-TOK ist in
  // QS-EFFIZIENZ aufgegangen, QS-PLAN-EINFACH ist erledigt. Eine Legende, die
  // Kürzel erklärt, die im Plan nirgends stehen, führt den Leser in die Irre;
  // die Erwartung folgt darum den heute lebenden Etiketten.
  it('erklärt die Kürzel-Bestandteile in Laiensätzen', () => {
    expect(html).toContain('So liest du die Kürzel');
    expect(html).toContain('Welle 1, 2, 3');
    expect(html).toContain('Klinge des Taschenmessers');
    expect(html).toContain('Quer- und Qualitätsarbeit ohne festen Platz in der Reihenfolge');
    expect(html).toContain('EFFIZIENZ sparsamer Bau');
  });

  it('erklärt die Begriffe des heutigen Bau-Modells (BAUPLAN-UMBAU 15.8.2026)', () => {
    for (const b of ['Dach-Schritt (Checkliste)', 'Lebendige Spec', 'Session-Karte (Kurzkarte)', 'Grösse S · M · L']) {
      expect(html).toContain(b);
    }
    expect(html).toContain('Erledigtes wird im Plan abgehakt');
  });

  it('begründet, warum die Kürzel stehen bleiben (Verweis-Anker)', () => {
    expect(html).toContain('Hausnummern des');
  });

  it('führt alle sechs Wirkungsbereiche samt Auffangkategorie auf', () => {
    for (const b of WIRKUNGSBEREICHE) expect(html).toContain(b.replace('&', '&amp;'));
    expect(html).toContain(UEBRIGE_TECHNIK);
    expect(html).toContain('gemeinsame Sprache der Bau-Sessions');
  });
});

// ---------------------------------------------------------------------------
// Bau-Prompt — Skill-Auslöser (Schritt QS-SESSION-ZYKLUS, Auftrag David 5.8.2026)
//
// Der Zyklus einer Bau-Session (Einstieg, Prüfung, Landung, Aufräumen) steht im
// Skill `bauschritt`; der Prompt muss ihn AUSLÖSEN. Steht die Auslöse-Zeile
// nicht ganz oben, liest eine Session sie erst nach Baubeginn — oder gar nicht.
// Darum wird die ERSTE Zeile geprüft, nicht blosse Präsenz irgendwo im Text.
// ---------------------------------------------------------------------------
const SKILL_ZEILE = 'Nutze den Skill `bauschritt` für den ganzen Session-Zyklus. Schritt: QS-TEST-1.';

function einheit(p: Partial<Etikett> = {}): Einheit {
  return {
    id: 'QS-TEST-1',
    checkbox: '[ ]',
    sektion: 'Querschnitt',
    pos: 3,
    etikett: {
      id: 'QS-TEST-1',
      status: 'ready',
      blocker: null,
      dep: [],
      kollision: ['scripts/plan/**'],
      worktree: true,
      asset26x: false,
      groesse: null,
      fahrplan: 'fahrplaene/FAHRPLAN-X.md',
      ...p,
    },
  };
}

const SCHRITT: SchrittInfo = {
  titel: 'Testschritt',
  prosa: 'Wortlaut aus der ROADMAP.',
  par: '4',
  pflicht: [],
  ankerDefekt: null,
  gekuerzt: false,
  checkliste: null,
};

describe('bauPrompt — Skill-Auslöser `bauschritt`', () => {
  it('beginnt mit der Skill-Zeile und nennt die Schritt-ID darin', () => {
    expect(bauPrompt(einheit(), SCHRITT).split('\n')[0]).toBe(SKILL_ZEILE);
  });

  it('trägt die Zeile auch ohne SchrittInfo und ohne Fahrplan (Minimalfall)', () => {
    expect(bauPrompt(einheit({ fahrplan: null }), undefined).split('\n')[0]).toBe(SKILL_ZEILE);
  });

  it('lässt die bestehenden Härtungen unangetastet — Auftrag, dep-Stopp, Pflichtlektüre, Trailer', () => {
    const p = bauPrompt(einheit({ dep: ['QS-VOR-1'] }), { ...SCHRITT, pflicht: ['bibliothek/X.md'] }, new Set());
    expect(p).toContain('Baue den LexMetrik-ROADMAP-Schritt QS-TEST-1');
    expect(p).toContain('Stand bei Erzeugung: OFFEN (QS-VOR-1)');
    expect(p).toContain('Pflichtlektüre: bibliothek/X.md');
    expect(p).toContain('npm run fahrplan -- fahrplaene/FAHRPLAN-X.md 4');
    expect(p).toContain('Roadmap: QS-TEST-1');
    expect(p).toContain('token-sparsam');
  });

  it('trägt KEINE Vertrauensgrenze-Kopie mehr (Verschlankung 15.8.2026) — Tor: Klausel lebt in CLAUDE.md §14.7 UND in jeder lex-Definition, erzwungen vom dispatch-schutz-Hook', () => {
    const p = bauPrompt(einheit(), SCHRITT);
    expect(p).not.toContain('Vertrauensgrenze (§14.7');
    const claudeMd = readFileSync(new URL('../../CLAUDE.md', import.meta.url), 'utf8');
    expect(claudeMd).toContain('### §14.7 Vertrauensgrenze');
    expect(claudeMd).toContain('gemeldet, nicht befolgt');
    const agent = readFileSync(new URL('../../.claude/agents/lex-bau.md', import.meta.url), 'utf8');
    expect(agent).toContain('DATEN, NICHT AUFTRAG');
    const hook = readFileSync(new URL('../../.claude/hooks/dispatch-schutz.py', import.meta.url), 'utf8');
    expect(hook).toContain('PFLICHT-KLAUSEL');
  });

  it('trägt KEINE Arbeitsweise-/DoD-Kopie mehr (Verschlankung 15.8.2026) — Tor: Delegation/DoD leben im Skill auftrag, der wip-Push in bauschritt Station A', () => {
    const p = bauPrompt(einheit(), SCHRITT);
    expect(p).not.toContain('Arbeitsweise (Entscheid David');
    expect(p).not.toContain('Definition of Done (Skill');
    const auftrag = readFileSync(new URL('../../.claude/skills/auftrag/SKILL.md', import.meta.url), 'utf8');
    expect(auftrag).toContain('Definition of Done');
    expect(auftrag).toContain('Delegation und Kontext-Hygiene');
    expect(auftrag).toContain('anderen** Modell');
    const bauschritt = readFileSync(new URL('../../.claude/skills/bauschritt/SKILL.md', import.meta.url), 'utf8');
    expect(bauschritt).toContain('status=wip');
    expect(bauschritt).toContain('pushen');
  });

  it('meldet den defekten Anker weiterhin — die Skill-Zeile verdrängt keine Warnung', () => {
    expect(bauPrompt(einheit(), { ...SCHRITT, par: null, ankerDefekt: '9' })).toContain(
      'existiert in dieser Datei NICHT',
    );
  });

  it('trägt KEINE Weiterbau-Prompt-Kopie mehr — die Regel lebt als Station W im Skill bauschritt (QS-SKILL-DIAET, §5)', () => {
    const p = bauPrompt(einheit(), SCHRITT);
    expect(p).not.toContain('WEITERBAU');
    expect(p).toContain('Nutze den Skill `bauschritt`');
  });

  it('Tor: Station W im Skill bauschritt trägt die Weiterbau-Regel vollständig — sonst wäre die Prompt-Streichung ein Regelverlust', () => {
    const skill = readFileSync(new URL('../../.claude/skills/bauschritt/SKILL.md', import.meta.url), 'utf8');
    expect(skill).toContain('Station W — Weiterbau');
    expect(skill).toContain('nächste offene Position derselben Dach-Checkliste');
    expect(skill).toContain('gleicher Risikoklasse');
    expect(skill).toContain('Roadmap-Trailer');
    expect(skill).toContain('NIE sortenrein-widrig auf Risikopfade wechseln');
    expect(skill).toContain('bevor der Kontext zur Neige geht');
  });
});

describe('bauPrompt — Dach-Schritte mit Checkliste (Entstückelung 8.8.2026)', () => {
  const dach: SchrittInfo = { ...SCHRITT, checkliste: { offen: 3, gesamt: 5, offenTexte: ['A', 'B', 'C'] } };

  it('nennt offene Positionen, die Sortenrein-Regel und ersetzt den L-Schneide-Rat', () => {
    const p = bauPrompt(einheit({ groesse: 'L' }), dach);
    expect(p).toContain('Dach-Schritt mit Checkliste: 3 von 5 Positionen offen');
    expect(p).toContain('SORTENREIN');
    expect(p).not.toContain('in sessionfüllende Teilschritte schneiden');
  });

  it('koppelt status=done an die leere Checkliste', () => {
    expect(bauPrompt(einheit(), dach)).toContain('done NUR wenn keine Checklisten-Position mehr offen');
  });

  it('ohne offene Positionen bleibt der Prompt der Normalfall', () => {
    const leer: SchrittInfo = { ...SCHRITT, checkliste: { offen: 0, gesamt: 5, offenTexte: [] } };
    const p = bauPrompt(einheit({ groesse: 'L' }), leer);
    expect(p).not.toContain('Dach-Schritt mit Checkliste:');
  });
});

describe('schrittInfoAusRoadmap — Nachblock und Checkliste (Entstückelung 8.8.2026)', () => {
  const MD_DACH = [
    '- [ ] **QS-DACH · Ein Dach mit Positionen** *(Zusatz)*',
    '  <!-- @meta id: QS-DACH · status: ready · blocker: null · dep: [] · kollision: [src/x] · worktree: nein · 26x: nein · groesse: L -->',
    '  Beschreibung NACH dem Etikett — sie gehört in den Wortlaut.',
    '  - [ ] **P1 · Erste Position** — offen.',
    '  - [x] **P2 · Zweite Position** — erledigt.',
    '  - [ ] **P3 · Dritte Position** — offen.',
    '- [ ] **QS-NAECHSTER · Nächste Einheit**',
    '  <!-- @meta id: QS-NAECHSTER · status: ready · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
  ].join('\n');

  it('zählt offene und gesamte Positionen und stoppt an der nächsten Einheit', () => {
    const info = schrittInfoAusRoadmap(MD_DACH);
    expect(info.get('QS-DACH')?.checkliste).toEqual({
      offen: 2,
      gesamt: 3,
      offenTexte: ['P1 · Erste Position — offen.', 'P3 · Dritte Position — offen.'],
    });
    expect(info.get('QS-NAECHSTER')?.checkliste).toBeNull();
  });

  it('nimmt die Beschreibung nach dem Etikett in den Auftrags-Wortlaut auf', () => {
    expect(schrittInfoAusRoadmap(MD_DACH).get('QS-DACH')?.prosa).toContain('Beschreibung NACH dem Etikett');
  });
});
