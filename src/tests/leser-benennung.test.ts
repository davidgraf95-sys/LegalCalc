import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// ═══ BENENNUNGS-GLOSSAR DES LESERS — der Wächter (Ä97–Ä122, 18.8.2026) ══════
//
// ANLASS, gemessen: die Live-Ästhetik- und Benennungs-Prüfung vom 18.8.2026
// (`docs/ux-audit-2026-07/reader/leser-v3-h4/aesthetik-live-2026-08-18.md`) hat
// den grössten Abzug NICHT an Layout oder Farbe vergeben, sondern an der
// BENENNUNGS-STREUUNG: dieselbe Sache hiess je nach Ort verschieden —
//   Menü          «Ansicht» · «Darstellung» · «Darstellungsoptionen»
//   Fedlex-Link   «geltende Fassung» · «amtliche Fassung ↗» · «amtlich ↗»
//   Split-Fläche  «Reiter» · «Fenster» · «Pane» · «Split-View»
//   Fassungszeile Schalter «Änderungsvermerke» ↔ Element «FASSUNG»
//   «Übersicht»   Steckbrief-Box UND Fussnav-Link auf /gesetze
// Das ist kein Schönheitsfehler: wer «Ansicht» sucht und «Darstellung» liest,
// hält es für ein zweites Menü — und ein Screenreader-Nutzer, dem der
// `aria-label` etwas anderes sagt als das Auge liest, spricht mit dem sehenden
// Nachbarn über verschiedene Flächen (§8).
//
// DIE EINE WAHRHEIT ist seit 18.8.2026 das Glossar in der Design-Grundlage
// (`docs/ux-audit-2026-07/reader/leser-v3-design-grundlage.md`, Abschnitt
// «Benennung»). Diese Datei ist sein Wächter: sie hält fest, dass die
// verworfenen Wörter nicht zurückkommen und das gewählte wirklich dasteht.
//
// ── WARUM EINE QUELLENSONDE UND KEIN e2e ────────────────────────────────────
// Der Befund war ein WORT-Befund, kein Verhaltens-Befund. Ein e2e prüfte je
// eine Breite, einen Erlass und einen Zustand; die Streuung lebt aber in
// Attributen, die nur in seltenen Lagen sichtbar werden (`title` beim Hovern,
// `aria-label` nur für den Screenreader, Platzhalter nur im leeren Feld). Eine
// Sonde über den Quelltext trifft sie alle zugleich und kostet Millisekunden.
// Muster: `leser-v3-fundament.test.ts` (DOM-frei, §2).
//
// ── GELTUNGSBEREICH: DIE V3-FLÄCHE ──────────────────────────────────────────
// Geprüft wird `src/pages/gesetz-leser/v3/**` plus die GETEILTEN Bausteine, die
// V3 sichtbar rendert (`parts/ErlassLeserKopf.tsx`, `parts/ArtikelLeser.tsx`,
// `parts/SektionKopf.tsx`, `parts/ErlassKopfBlock.tsx`).
// AUSDRÜCKLICH NICHT: die eingefrorene Ist-Hülle (`inhalt-*.tsx`,
// `LeserAnsichtMenu.tsx`, `parts/ErlassUebersicht.tsx`) und die App-Rahmen
// (`components/layout/**`, `components/NormPopover.tsx`). Beide tragen die
// alten Wörter weiter — das ist Absicht und nicht Nachlässigkeit: V1 bleibt bis
// H5 unangetastet (FL-4), die App-Hälfte von Ä112/Ä118 ist eine eigene
// Entscheidung über die ganze Anwendung. Sie stehen als S-Zeilen im Fahrplan.
// Wer den Bereich später ausweitet, ändert die Liste hier — und sieht sofort,
// wie viel noch offen ist.

const WURZEL = 'src/pages/gesetz-leser';
const V3_DIR = `${WURZEL}/v3`;

const GETEILTE_BAUSTEINE = [
  'parts/ErlassLeserKopf.tsx',
  'parts/ArtikelLeser.tsx',
  'parts/SektionKopf.tsx',
  'parts/ErlassKopfBlock.tsx',
];

const DATEIEN: string[] = [
  ...readdirSync(V3_DIR).filter((f) => /\.tsx?$/.test(f)).map((f) => path.join('v3', f)),
  ...GETEILTE_BAUSTEINE,
];

const LIES = (rel: string) => readFileSync(`${WURZEL}/${rel}`, 'utf8');

/**
 * Quelltext OHNE Kommentare. Zwingend: die Herleitungen ZITIEREN die verworfenen
 * Wörter («hier stand ‹geltende Fassung›») — genau das soll erhalten bleiben und
 * darf den Wächter nicht auslösen.
 *
 * WORTGLEICH mit `leser-v3-fundament.test.ts` (§5) — und das ist keine
 * Bequemlichkeit, sondern das Ergebnis eines FALSCH-GRÜNEN ERSTLAUFS:
 *
 * ── DER ERSTE FILTER WAR EIN TOR, DAS NICHT SCHEITERN KONNTE (§6.7) ─────────
 * Er trug eine zusätzliche, scheinbar präzisere Regel für JSX-Kommentare,
 * `\{\s*\/\*[\s\S]*?\*\/\s*\}`. `\s` schliesst den ZEILENUMBRUCH ein — und
 * damit fing der Ausdruck auch dort an, wo eine geschweifte Klammer am
 * Zeilenende steht und der nächste Nicht-Leerraum ein Doc-Kommentar ist. In
 * `v3/LeserAnsichtV3.tsx` ist das die Props-Signatur:
 *   export function LeserAnsichtV3({ … }: {
 *     /** `true` = Handy-Zuschnitt …
 * GEMESSEN 18.8.2026: EIN Treffer über 6466 Zeichen, Zeile 80 bis 187 — der
 * ganze Props-Block UND die Attribute des Öffner-Knopfs verschwanden aus dem
 * geprüften Text. Die Sonde meldete «kein ‹Darstellungsoptionen› mehr»,
 * während das Wort im `aria-label` stand: sie prüfte eine Datei, aus der sie
 * die geprüfte Stelle selbst herausgeschnitten hatte.
 * AUFGEFALLEN ist es nur, weil der Rot-Beweis geführt wurde (der künstlich
 * eingebaute Rückfall blieb grün) — genau der Zweck von §6.7.
 * JETZT: dieselben zwei Regeln wie im Fundament-Wächter, Zeilen- VOR
 * Blockkommentaren. Ein JSX-Kommentar hinterlässt dabei ein nacktes Klammerpaar;
 * für Zeichenketten-Sonden ist das folgenlos.
 */
function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

/** Alle Dateien als EIN Text — für Aussagen über die Fläche, nicht die Datei. */
const FLAECHE = DATEIEN.map((d) => ohneKommentare(LIES(d))).join('\n');

/** Wortgrenzen-Treffer statt Substring-Präsenz (CLAUDE.md §7). «Fassung» darf
 *  in «Fassungs-Zeitleiste» vorkommen; «Darstellung» soll auch
 *  «Darstellungsoptionen» fangen — darum je Eintrag ein eigenes Muster. */
function trefferIn(text: string, muster: RegExp): boolean {
  return new RegExp(muster.source, muster.flags.replace('g', '')).test(text);
}

// ── POSITIV-SONDE ZUERST (§6.7 b) ───────────────────────────────────────────
// Ein Wächter, der die leere Menge prüft, ist grün und wertlos.
describe('Positiv-Sonde: die geprüfte Fläche existiert und trägt Beschriftungen', () => {
  it('die Dateiliste ist gefüllt und enthält die bekannten Träger', () => {
    expect(DATEIEN.length).toBeGreaterThan(20);
    expect(DATEIEN).toContain('v3/LeserAnsichtV3.tsx');
    expect(DATEIEN).toContain('v3/SuchBereichWahl.tsx');
    expect(DATEIEN).toContain('parts/ErlassLeserKopf.tsx');
  });

  it('der kommentarfreie Text ist nicht leer — die Filterung frisst nicht alles', () => {
    expect(FLAECHE.length).toBeGreaterThan(20_000);
    // Eine Beschriftung, die es garantiert gibt: ohne sie hätte der Filter zu
    // viel entfernt und jede Verbots-Sonde wäre grundlos grün.
    expect(FLAECHE).toContain('Fussnoten');
  });

  it('die Herleitungen dürfen die verworfenen Wörter zitieren — Kommentare zählen nicht', () => {
    // Gegenprobe zum Filter: im ROHTEXT steht «geltende Fassung» (in der
    // Ä110-Herleitung), im gefilterten Text nicht mehr. Fällt der Filter aus,
    // wird dieser Fall rot, bevor die Verbote unten falsch anschlagen.
    const roh = LIES('parts/ErlassLeserKopf.tsx');
    expect(roh).toContain('geltende Fassung');
    expect(ohneKommentare(roh)).not.toContain('geltende Fassung');
  });
});

// ═══ DAS GLOSSAR ════════════════════════════════════════════════════════════
//
// Je Eintrag: die SACHE, das gewählte Wort (muss vorkommen) und die verworfenen
// Wörter (dürfen nicht vorkommen). `gewaehlt` ist die Positiv-Hälfte — ohne sie
// wäre jedes Verbot auch dann grün, wenn die Beschriftung ganz verschwände.

interface GlossarEintrag {
  sache: string;
  gewaehlt: RegExp;
  verworfen: { wort: RegExp; statt: string }[];
}

const GLOSSAR: GlossarEintrag[] = [
  {
    sache: 'Menü der Darstellungsschalter (Ä114)',
    gewaehlt: /aria-label="Ansicht"/,
    verworfen: [
      { wort: /"Darstellungsoptionen"/, statt: 'aria-label="Ansicht"' },
      { wort: />Darstellung</, statt: '>Ansicht<' },
      { wort: /title=\{?[`"']Darstellung:/, statt: 'title="Ansicht: …"' },
    ],
  },
  {
    sache: 'Fedlex-Link am Erlass/Artikel (Ä110)',
    gewaehlt: /Amtliche Fassung ↗/,
    // GETROFFEN WIRD DAS LINK-LABEL, NICHT DER SATZ (§7, Identität statt
    // Substring-Präsenz). Ein blosses /geltende Fassung/ war beim ersten Lauf
    // rot an `parts/ArtikelLeser.tsx:77` — dort steht «Entscheide beziehen sich
    // auf die im Entscheidzeitpunkt geltende Fassung», ein fachlich richtiger
    // Satz über Rechtsprechung und kein Link auf Fedlex. Ein Wächter, der
    // Sprache statt Beschriftung misst, zwingt zur Verstümmelung korrekter
    // Sätze — darum die Klammerung an Pfeil bzw. Element-/Label-Grenze.
    verworfen: [
      { wort: /(↗\s*geltende Fassung|geltende Fassung\s*↗|>\s*geltende Fassung\s*<|label: '[^']*geltende Fassung)/, statt: '«Amtliche Fassung ↗»' },
      { wort: /amtliche Fassung ↗/, statt: '«Amtliche Fassung ↗» (gross)' },
      { wort: />\s*amtlich ↗\s*</, statt: '«Fedlex ↗» — das Ziel benennen' },
    ],
  },
  {
    sache: 'Split-Fläche (Ä118) — «Reiter» bleibt dem Panel',
    gewaehlt: /In neuem Fenster/,
    verworfen: [{ wort: /In neuem Reiter/, statt: '«In neuem Fenster»' }],
  },
  {
    sache: 'Fassungs-Zeile ↔ ihr Schalter (Ä116)',
    gewaehlt: /label="Fassung"/,
    verworfen: [{ wort: /label="Änderungsvermerke"/, statt: 'label="Fassung"' }],
  },
  {
    sache: 'Suchbereich «Überschriften» (Ä120)',
    gewaehlt: /kurz: 'Überschriften'/,
    verworfen: [{ wort: /kurz: 'Titel'/, statt: "kurz: 'Überschriften'" }],
  },
  {
    sache: 'Fussnav auf /gesetze (Ä119) — «Übersicht» bleibt der Steckbrief-Box',
    gewaehlt: /Alle Gesetze/,
    verworfen: [{ wort: /className="shrink-0 text-ink-500 hover:text-brass-700">Übersicht</, statt: '«Alle Gesetze»' }],
  },
  {
    sache: 'Trefferzähler (Ä103)',
    gewaehlt: /Fundstelle <span className="num">/,
    verworfen: [{ wort: /\{anzeige\}<\/span>\//, statt: '«Fundstelle n von m»' }],
  },
  {
    sache: 'Kopf-Standausweis (Ä-Rest: kein englisches Jargonwort)',
    gewaehlt: /Kopie vom/,
    verworfen: [{ wort: /Snapshot —/, statt: '«Kopie vom … — massgeblich ist die amtliche Fassung»' }],
  },
];

describe('Benennungs-Glossar: je Sache EIN Wort über die ganze V3-Fläche', () => {
  for (const e of GLOSSAR) {
    it(`${e.sache}: das gewählte Wort steht da`, () => {
      expect(trefferIn(FLAECHE, e.gewaehlt),
        `Das Glossar-Wort für «${e.sache}» kommt in der V3-Fläche gar nicht vor — ` +
        'entweder ist die Beschriftung verschwunden oder der Wächter zeigt auf die falsche Stelle.',
      ).toBe(true);
    });

    for (const v of e.verworfen) {
      it(`${e.sache}: «${v.wort.source}» kommt nicht mehr vor`, () => {
        const treffer = DATEIEN.filter((d) => trefferIn(ohneKommentare(LIES(d)), v.wort));
        expect(treffer,
          `Verworfenes Wort in ${treffer.join(', ')} — das Glossar sagt: ${v.statt}. ` +
          'Steht es in einer Herleitung, gehört es in einen Kommentar (die zählen hier nicht).',
        ).toEqual([]);
      });
    }
  }
});

// ── Ä111/Ä112 · DIE ZUGÄNGLICHEN NAMEN SAGEN, WAS SIE TUN ───────────────────
describe('Ä111/Ä112: zwei Griffe derselben Glyphe, zwei verschiedene Namen', () => {
  it('der ☰ des Lesers nennt die Handlung, nicht nur die Sache', () => {
    const rahmen = ohneKommentare(LIES('v3/LeserRahmenV3.tsx'));
    expect(rahmen).toContain('aria-label="Gliederung öffnen"');
    // Rot zu bekommen: den Namen auf «Gliederung» zurücksetzen — dann heisst er
    // wieder wie der ☰ der App-Topbar zwei Zentimeter daneben.
    expect(/aria-label="Gliederung"/.test(rahmen)).toBe(false);
  });

  it('das Leser-Suchfeld nennt seinen Erlass — im Platzhalter UND im Namen', () => {
    const ansicht = ohneKommentare(LIES('v3/erlassAnsicht.ts'));
    // Beide Ausgaben teilen EINE Quelle (`suchOrt`), damit sie nicht
    // auseinanderlaufen; geprüft wird, dass beide Funktionen existieren und das
    // Kürzel entgegennehmen.
    expect(ansicht).toMatch(/export function suchPlatzhalter\([^)]*kuerzel/);
    expect(ansicht).toMatch(/export function suchFeldName\(kuerzel/);
    expect(ansicht).toContain('Im ${kuerzel.trim()} suchen');
    const feld = ohneKommentare(LIES('v3/SuchSprungFeld.tsx'));
    expect(feld).toContain('aria-label={ariaName}');
  });
});

// ── Ä117 · EIN GEDANKENSTRICH ───────────────────────────────────────────────
describe('Ä117: der Leser führt genau EIN Gedankenstrich-Zeichen', () => {
  it('kein « – » (Halbgeviert mit Spatien) in Beschriftungen der V3-Fläche', () => {
    const treffer = DATEIEN.filter((d) => ohneKommentare(LIES(d)).includes(' – '));
    expect(treffer,
      `Halbgeviertstrich mit Spatien in ${treffer.join(', ')} — der Leser schreibt «—». ` +
      'Der Halbgeviertstrich bleibt dem BIS-Strich vorbehalten, und der steht ohne Spatien («Art. 1–10»).',
    ).toEqual([]);
  });

  it('Positiv-Sonde: «—» kommt in der Fläche wirklich vor', () => {
    // Ohne sie wäre das Verbot oben auch dann grün, wenn gar kein
    // Gedankenstrich mehr gesetzt würde.
    expect(FLAECHE).toContain('—');
  });
});
