// src/tests/steuerwerkzeuge.test.ts — die vier Nicht-Plan-Steuerwerkzeuge. scripts/fahrplan-slice · scripts/dispatch(-agents) · scripts/testtreue-kern · scripts/ci/diff-klassieren.
// Zusammengelegt 31.8.2026 (QS-EFFIZIENZ, Ent-Regulierung Runde 2 Batch B; Beleg:
// bibliothek/betrieb/testapparat-fang-historie-2026-08-31.md §3 Kandidat 1). Die
// Fälle stehen WÖRTLICH unter dem Banner ihrer Herkunftsdatei; gestrichen wurde
// nur ein wörtliches Rumpf-Duplikat (ROADMAP-CHRONIK.md, 31.8.2026).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  type CommitInfo,
  findeVerstoesse,
  istRefactorCommit,
  istTestDatei,
} from '../../scripts/testtreue-kern';
import {
  CODE_FERNE_MUSTER,
  klassifiziereDateien,
  klassifiziereDiff,
  WERKZEUG_TROTZ_MD_MUSTER,
} from '../../scripts/ci/diff-klassieren';
import {
  dispatchText,
  KLASSEN,
  type Klauselvariante,
  pflichtKlausel,
  templateLesen,
  VARIANTE,
  varianteVon,
} from '../../scripts/dispatch';
import { agentDatei } from '../../scripts/dispatch-agents';
import { aufloesenDatei, headings, normKey, slice } from '../../scripts/fahrplan-slice';

// ─── aus src/tests/fahrplanSlice.test.ts ───────────────────────────────────────

// QS-TOK / FAHRPLAN-TOKEN-OEKONOMIE.md §3 T3: der Slicer druckt Kopf + §0 + Ziel-§§
// + IMMER das vollständige ##/###-Inventar (ToC), byte-treu, deterministisch. Test
// gegen Fixtures BEIDER Nummerierungs-Stile (`## §N` und `## N ·` / `### N.M`) —
// nicht gegen die echten (parallel bearbeiteten) FAHRPLAN-Dateien.

// Stil A: `## §N` (wie FAHRPLAN-TOKEN-OEKONOMIE.md).
const STIL_A = `# FAHRPLAN — Titel

> Kopf-Blockquote mit Leitplanke.

## §0 Regeln
Quer-Lektion R.

## §1 Erstes
Inhalt eins.

## §10 Zehntes
Inhalt zehn.
`;

// Stil B: `## N ·` + `### N.M` (wie FAHRPLAN-GESETZES-UX.md).
const STIL_B = `# FAHRPLAN Gesetzes-UX

Intro-Absatz.

## 0 · Kritik
Quer-Kritik.

## 10 · Anmerkungs-Welle
Rahmen.

### 10.7 · Ausführungsvermerke
Detail 10.7.

### 10.8 · Nachzug
Detail 10.8.

## 11 · Danach
Rest.
`;

describe('normKey', () => {
  it('strippt führendes § und Whitespace', () => {
    expect(normKey('§10')).toBe('10');
    expect(normKey('  3 ')).toBe('3');
    expect(normKey('10.7')).toBe('10.7');
  });
});

describe('headings', () => {
  it('erkennt ## und ### mit Token (ohne §)', () => {
    const hs = headings(STIL_A);
    expect(hs.map((h) => h.token)).toEqual(['0', '1', '10']);
    const hb = headings(STIL_B);
    expect(hb.map((h) => `${h.level}:${h.token}`)).toEqual([
      '2:0',
      '2:10',
      '3:10.7',
      '3:10.8',
      '2:11',
    ]);
  });

  it('§1 kollidiert nicht mit §10 (Wort-Token, kein Präfix)', () => {
    const r = slice(STIL_A, ['1']);
    expect(r.gefunden).toEqual(['1']);
    expect(r.text).toContain('Inhalt eins.');
    expect(r.text).not.toContain('Inhalt zehn.');
  });
});

describe('slice', () => {
  it('liefert Kopf + §0 + Ziel-§ + vollständiges ToC (Stil A)', () => {
    const r = slice(STIL_A, ['10'], 'FAHRPLAN-X.md');
    // Kopf + §0 immer dabei
    expect(r.text).toContain('Kopf-Blockquote mit Leitplanke.');
    expect(r.text).toContain('Quer-Lektion R.');
    // Ziel-§
    expect(r.text).toContain('Inhalt zehn.');
    // Nicht angefragtes §1 bleibt draussen (ausser im ToC)
    expect(r.text).not.toContain('Inhalt eins.');
    // Vollständiges Inventar im ToC
    expect(r.text).toContain('## Inhalt — vollständiges ##/###-Inventar');
    expect(r.text).toContain('- ## §1 Erstes');
    expect(r.text).toContain('- ## §10 Zehntes');
    // Ganzdatei-Rückfall vermerkt
    expect(r.text).toContain('Ganzdatei bei Unklarheit');
  });

  it('Stil B: ## 10 zieht seine ### 10.7/10.8-Unterabschnitte mit, stoppt bei ## 11', () => {
    const r = slice(STIL_B, ['10']);
    expect(r.text).toContain('Quer-Kritik.'); // §0 immer dabei
    expect(r.text).toContain('Rahmen.');
    expect(r.text).toContain('Detail 10.7.');
    expect(r.text).toContain('Detail 10.8.');
    expect(r.text).not.toContain('Rest.'); // ## 11 nicht enthalten
  });

  it('Stil B: gezielter Unter-§ 10.7 schneidet nur bis 10.8', () => {
    const r = slice(STIL_B, ['10.7']);
    expect(r.text).toContain('Detail 10.7.');
    expect(r.text).not.toContain('Detail 10.8.');
  });

  it('meldet fehlende §§ (und der Rest bleibt gültig)', () => {
    const r = slice(STIL_A, ['1', '99']);
    expect(r.gefunden).toEqual(['1']);
    expect(r.fehlend).toEqual(['99']);
    expect(r.text).toContain('Nicht gefunden: 99');
  });

  it('Slice ist deutlich kleiner als die Ganzdatei bei grossen §§', () => {
    // Grosse Datei simulieren: §2 ist riesig, wir wollen nur §1.
    const gross =
      '# T\n\n## §0 R\nr\n\n## §1 klein\nx\n\n## §2 gross\n' + 'y'.repeat(50_000) + '\n';
    const r = slice(gross, ['1']);
    expect(r.text.length).toBeLessThan(gross.length / 2);
    expect(r.text).not.toContain('y'.repeat(50_000));
  });

  it('mehrere §§ in Dokumentreihenfolge, byte-treuer Sektionsinhalt', () => {
    const r = slice(STIL_A, ['10', '1']);
    const i1 = r.text.indexOf('Inhalt eins.');
    const i10 = r.text.indexOf('Inhalt zehn.');
    expect(i1).toBeGreaterThan(-1);
    expect(i10).toBeGreaterThan(-1);
    expect(i1).toBeLessThan(i10); // Reihenfolge = Dokument, nicht Argument
    // Byte-treu: die Original-Überschrift steht wörtlich im Slice.
    expect(r.text).toContain('## §1 Erstes');
  });
});

// ---------------------------------------------------------------------------
// Fix-Runde 1 nach der Endprüfung der QS-TOK-Aufräumwelle (31.7.2026).
// Die bestehenden Fälle oben bleiben unverändert — die neuen Fälle stehen hier.
// ---------------------------------------------------------------------------

// Fund 26: Mehrwort-§-Zeiger lieferten STILL die falsche Sektion. Reproduziert am
// echten Bestand: `npm run fahrplan -- fahrplaene/FAHRPLAN-SPLIT-VIEW.md §STRANG B`
// druckte «## STRANG A — Inhaltsbreite-Umschalter (✅ FERTIG …)», die Kopfzeile
// behauptete «Enthalten: Kopf + §0 + §STRANG», die Warnung nannte nur «Nicht
// gefunden: B». Gleiches bei `§Paket 3` → «## Paket 1». Ursache: die CLI splittet
// an Leerzeichen und `hs.find(x => x.token === k)` nimmt den ERSTEN Token-Treffer.
const MEHRDEUTIG = `# FAHRPLAN Split-View

Kopf.

## §0 Zweck
Quer-Regel.

## STRANG A — Umschalter
Inhalt Strang A.

## STRANG B — Split-View
Inhalt Strang B.

## Paket 1 — Currency
Inhalt Paket eins.

## Paket 3 — Vernehmlassungen
Inhalt Paket drei.
`;

describe('slice — mehrdeutige und mehrteilige §-Zeiger (Fund 26)', () => {
  it('mehrdeutiges Ein-Wort-Token liefert ALLE Treffer statt still den ersten', () => {
    const r = slice(MEHRDEUTIG, ['STRANG']);
    expect(r.text).toContain('Inhalt Strang A.');
    expect(r.text).toContain('Inhalt Strang B.');
  });

  it('mehrdeutiges Token wird in der Kopfzeile sichtbar gemeldet', () => {
    const r = slice(MEHRDEUTIG, ['STRANG']);
    expect(r.mehrdeutig).toEqual([{ key: 'STRANG', treffer: ['STRANG A — Umschalter', 'STRANG B — Split-View'] }]);
    expect(r.text).toContain('mehrdeutig');
  });

  it('mehrteiliger Zeiger «STRANG B» trifft genau die gemeinte Sektion', () => {
    const r = slice(MEHRDEUTIG, ['§STRANG B']);
    expect(r.gefunden).toEqual(['STRANG B']);
    expect(r.text).toContain('Inhalt Strang B.');
    expect(r.text).not.toContain('Inhalt Strang A.');
  });

  it('mehrteiliger Zeiger «Paket 3» trifft Paket 3, nicht Paket 1', () => {
    const r = slice(MEHRDEUTIG, ['§Paket 3']);
    expect(r.text).toContain('Inhalt Paket drei.');
    expect(r.text).not.toContain('Inhalt Paket eins.');
  });

  it('eindeutiges Token bleibt unverändert eindeutig (keine Mehrdeutigkeits-Meldung)', () => {
    const r = slice(MEHRDEUTIG, ['0']);
    expect(r.mehrdeutig).toEqual([]);
    expect(r.text).not.toContain('mehrdeutig');
  });
});

// Fund 4/5: Vier Skills nennen Fahrpläne weiterhin ohne Ordner. Wer den dort
// genannten Namen 1:1 in den Slicer gibt, läuft in ENOENT (reproduziert:
// `npm run fahrplan -- FAHRPLAN-PERFORMANCE.md 1` → Exit 2). Der Slicer soll
// einen baren Namen selbst auflösen, statt die Session in die Sackgasse zu schicken.
describe('aufloesenDatei — Fallback für bare Dateinamen (Fund 4/5)', () => {
  it('bare Name → fahrplaene/<name>, wenn es dort liegt', () => {
    const da = (p: string) => p === 'fahrplaene/FAHRPLAN-PERFORMANCE.md';
    expect(aufloesenDatei('FAHRPLAN-PERFORMANCE.md', da)).toBe('fahrplaene/FAHRPLAN-PERFORMANCE.md');
  });

  it('bare Name → archiv/<name>, wenn er nur dort liegt', () => {
    const da = (p: string) => p === 'archiv/FAHRPLAN-DESIGN.md';
    expect(aufloesenDatei('FAHRPLAN-DESIGN.md', da)).toBe('archiv/FAHRPLAN-DESIGN.md');
  });

  it('liegt der Name in BEIDEN Ordnern, gewinnt fahrplaene/ (aktive Fassung zuerst)', () => {
    const da = (p: string) => p === 'fahrplaene/FAHRPLAN-X.md' || p === 'archiv/FAHRPLAN-X.md';
    expect(aufloesenDatei('FAHRPLAN-X.md', da)).toBe('fahrplaene/FAHRPLAN-X.md');
  });

  it('liegt der Name im Arbeitsverzeichnis, bleibt er unverändert (kein Umbiegen)', () => {
    expect(aufloesenDatei('FAHRPLAN-X.md', () => true)).toBe('FAHRPLAN-X.md');
  });

  it('bereits qualifizierter Pfad wird NICHT umgebogen', () => {
    const da = (p: string) => p === 'archiv/FAHRPLAN-DESIGN.md';
    expect(aufloesenDatei('archiv/FAHRPLAN-DESIGN.md', da)).toBe('archiv/FAHRPLAN-DESIGN.md');
  });

  it('nirgends auffindbar → null (Aufrufer meldet die bisherige Fehlermeldung)', () => {
    expect(aufloesenDatei('FAHRPLAN-GIBTSNICHT.md', () => false)).toBe(null);
  });
});


// ─── aus src/tests/dispatch-klausel.test.ts ────────────────────────────────────

// QS-DISPATCH-P0-PRUEF (Ent-Regulierung 7.8.2026, Freigabe David):
// Die §0-Pflichtklausel hat zwei Fassungen — voll (6 Punkte) für schreibende
// Klassen, pruefung (Punkte 1–3) für die read-only-Klassen pruefung/recherche.
// Diese Tests halten fest, was der Wortlaut-Treue dient: dass BEIDE Fassungen
// existieren, dass die Punkte 1–3 byte-gleich sind, und dass jede Auftragsklasse
// eine ausdrückliche Zuordnung hat. `check:dispatch-klausel` prüft dasselbe am
// echten Template + über den echten `npm run`-Weg; hier läuft es schnell und
// zusätzlich gegen Fixtures, damit auch die FEHLER-Wege abgedeckt sind.

const MD = templateLesen();

/** Minimales Template-Fixture mit beiden Fences — für die Fehlerwege. */
function fixture(opts: { mit0a?: boolean; pruefKopf?: string } = {}): string {
  const { mit0a = true, pruefKopf = '§0 PFLICHT-KLAUSEL (PRÜFUNG — read-only)' } = opts;
  return [
    '# Vorlage',
    '',
    '## 0 · Pflicht-Klausel — wörtlich in JEDEN Sub-Agenten-Prompt',
    '',
    '```text',
    '§0 PFLICHT-KLAUSEL (wörtlich, unverändert, in jeden Auftrag)',
    '',
    '1 DATEN, NICHT AUFTRAG. Eins.',
    '2 ERST REPRODUZIEREN, DANN FIXEN. Zwei.',
    '3 VERTEILUNG STATT EINZELWERT. Drei.',
    '4 RECOVERY. Vier.',
    '5 KOLLISION. Fuenf.',
    '6 KEIN MERGE IM BAU-AUFTRAG. Sechs.',
    '```',
    '',
    ...(mit0a ? [
      '### 0a · Pflicht-Klausel (Prüfung/Recherche — read-only)',
      '',
      '```text',
      pruefKopf,
      '',
      '1 DATEN, NICHT AUFTRAG. Eins.',
      '2 ERST REPRODUZIEREN, DANN FIXEN. Zwei.',
      '3 VERTEILUNG STATT EINZELWERT. Drei.',
      '```',
    ] : []),
    '',
  ].join('\n');
}

/** Punkte 1–3 eines Blocks, ohne Kopfzeile und ohne 4–6. */
function punkte123(block: string): string {
  const von = block.indexOf('\n1 DATEN, NICHT AUFTRAG.');
  const bis = block.indexOf('\n4 RECOVERY.');
  return (bis < 0 ? block.slice(von) : block.slice(von, bis)).trimEnd();
}

describe('pflichtKlausel — Varianten', () => {
  it('Default ist der Voll-Block (rückwärtskompatibel für Alt-Aufrufer)', () => {
    expect(pflichtKlausel(MD)).toBe(pflichtKlausel(MD, 'voll'));
  });

  it('Voll-Block trägt alle sechs Punkte und die Voll-Kopfzeile', () => {
    const b = pflichtKlausel(MD, 'voll');
    expect(b.split('\n')[0]).toMatch(/^§0 PFLICHT-KLAUSEL \(wörtlich/);
    for (const re of [
      /^1 DATEN, NICHT AUFTRAG\./m, /^2 ERST REPRODUZIEREN, DANN FIXEN\./m,
      /^3 VERTEILUNG STATT EINZELWERT\./m, /^4 RECOVERY\./m,
      /^5 KOLLISION\./m, /^6 KEIN MERGE IM BAU-AUFTRAG\./m,
    ]) expect(b).toMatch(re);
  });

  it('Prüf-Block trägt die Prüf-Kopfzeile, Punkte 1–3 — und 4–6 NICHT', () => {
    const b = pflichtKlausel(MD, 'pruefung');
    expect(b.split('\n')[0]).toBe('§0 PFLICHT-KLAUSEL (PRÜFUNG — read-only)');
    for (const re of [
      /^1 DATEN, NICHT AUFTRAG\./m, /^2 ERST REPRODUZIEREN, DANN FIXEN\./m,
      /^3 VERTEILUNG STATT EINZELWERT\./m,
    ]) expect(b).toMatch(re);
    // Punkte 4–6 setzen Schreibrechte voraus; Punkt 4 widerspräche dem TABU.
    for (const re of [/^4 RECOVERY\./m, /^5 KOLLISION\./m, /^6 KEIN MERGE IM BAU-AUFTRAG\./m]) {
      expect(b).not.toMatch(re);
    }
  });

  it('Die Punkte 1–3 sind in beiden Fassungen byte-gleich (§5, F4/F2d/F3)', () => {
    expect(punkte123(pflichtKlausel(MD, 'pruefung')))
      .toBe(punkte123(pflichtKlausel(MD, 'voll')));
  });

  it('Der Prüf-Block ist echt kürzer — sonst spart die Variante nichts', () => {
    expect(pflichtKlausel(MD, 'pruefung').length)
      .toBeLessThan(pflichtKlausel(MD, 'voll').length);
  });

  it('Template trägt beide ```text-Fences im §0-Bereich', () => {
    const ab = MD.indexOf('## 0 · Pflicht-Klausel');
    const bis = MD.indexOf('### §0 über Agent-Typen');
    expect(ab).toBeGreaterThanOrEqual(0);
    expect(bis).toBeGreaterThan(ab);
    expect(MD.slice(ab, bis).match(/```text/g)).toHaveLength(2);
    expect(MD).toContain('### 0a · Pflicht-Klausel');
  });
});

describe('pflichtKlausel — Fehlerwege (das Tor darf nicht blind werden)', () => {
  it('fehlender 0a-Abschnitt wirft, statt still den Voll-Block zu liefern', () => {
    expect(() => pflichtKlausel(fixture({ mit0a: false }), 'pruefung'))
      .toThrow(/0a · Pflicht-Klausel/);
  });

  it('falsche Kopfzeile im Prüf-Fence wirft (Fence-Verwechslung)', () => {
    const md = fixture({ pruefKopf: '§0 PFLICHT-KLAUSEL (wörtlich, unverändert, in jeden Auftrag)' });
    expect(() => pflichtKlausel(md, 'pruefung')).toThrow(/Kopfzeile/);
  });

  it('intaktes Fixture liefert beide Varianten', () => {
    const md = fixture();
    expect(pflichtKlausel(md, 'voll')).toMatch(/^§0 PFLICHT-KLAUSEL \(wörtlich/);
    expect(pflichtKlausel(md, 'pruefung')).toMatch(/^§0 PFLICHT-KLAUSEL \(PRÜFUNG/);
  });
});

describe('VARIANTE — Zuordnung Klasse → Fassung', () => {
  it('deckt JEDE Auftragsklasse aus KLASSEN ab', () => {
    const ohne = Object.keys(KLASSEN).filter((k) => !(k in VARIANTE));
    expect(ohne).toEqual([]);
  });

  it('kennt keine Klasse, die es in KLASSEN nicht gibt', () => {
    const verwaist = Object.keys(VARIANTE).filter((k) => !(k in KLASSEN));
    expect(verwaist).toEqual([]);
  });

  it('vergibt nur gültige Fassungen', () => {
    const gueltig: Klauselvariante[] = ['voll', 'pruefung'];
    for (const [k, v] of Object.entries(VARIANTE)) {
      expect(gueltig, `Klasse ${k}`).toContain(v);
    }
  });

  it('genau die read-only-Klassen tragen die Prüf-Fassung', () => {
    const pruef = Object.keys(KLASSEN).filter((k) => varianteVon(k) === 'pruefung');
    expect(pruef.sort()).toEqual(['pruefung', 'recherche']);
  });

  it('varianteVon fällt bei unbekannter Klasse fail-safe auf voll', () => {
    expect(varianteVon('gibtsnicht')).toBe('voll');
  });
});

// Befund B3 der Gegenprüfung 7.8.2026: Die Soll-Liste lebte NUR im Test. Eine
// Herabstufung (daten → pruefung) samt Regeneration war in sich konsistent —
// Tabelle, Wrapper, Generator, Projektion — und ging grün durchs Tor. Sie steht
// seither auch in check-dispatch-klausel.ts. Befund B1: der Hook-Vorschlag
// erkennt einen echten Prüf-Dispatch am read-only-TABU der Klasse, zitiert
// wörtlich aus KLASSEN. Beide Kopplungen werden hier festgehalten.
describe('Kopplungen ausserhalb dieses Moduls (B1/B3)', () => {
  const tor = readFileSync('scripts/check-dispatch-klausel.ts', 'utf8');
  // Seit der Anwendung des Vorschlags (QS-EFFIZIENZ Pkt. 2, 14.8.2026) lebt
  // der Hook am aktiven Ort; die Vorschlagsdatei ist gelöscht (§5).
  const hook = readFileSync('.claude/hooks/dispatch-schutz.py', 'utf8');

  it('das Tor führt dieselbe Soll-Liste read-only wie dieser Test', () => {
    expect(tor).toContain("const READONLY_SOLL = ['pruefung', 'recherche'] as const");
  });

  it('der Hook zitiert das read-only-TABU beider Klassen wörtlich aus KLASSEN', () => {
    for (const klasse of ['pruefung', 'recherche']) {
      const tabuZeile = KLASSEN[klasse].split('\n')[0];
      expect(tabuZeile, klasse).toMatch(/^TABU: /);
      // Der Hook trägt einen Präfix dieser Zeile — lang genug, um die Klasse
      // zu identifizieren, kurz genug, um Satzende-Kosmetik zu überleben.
      const praefix = tabuZeile.slice(0, 20);
      expect(hook, `${klasse}: «${praefix}…»`).toContain(praefix);
    }
  });

  it('der Hook verlangt bei der Prüf-Kopfzeile ein zweites Merkmal', () => {
    // Ohne das käme ein Bau-Auftrag, der die Kopfzeile nur ZITIERT, mit drei
    // Punkten durch (gemessene Proben b/g der Gegenprüfung: exit 0 statt 2).
    expect(hook).toContain('PRUEF_TABU');
    expect(hook).toContain('ist_pruefung = kopf_da and tabu_da');
  });
});

describe('dispatchText — die Variante kommt am Auftrag an', () => {
  it.each(Object.keys(KLASSEN))('Klasse %s trägt die richtige Kopfzeile', (klasse) => {
    const text = dispatchText(klasse, MD);
    const erwartet = varianteVon(klasse) === 'pruefung'
      ? /^§0 PFLICHT-KLAUSEL \(PRÜFUNG/
      : /^§0 PFLICHT-KLAUSEL \(wörtlich/;
    expect(text.split('\n')[0]).toMatch(erwartet);
    expect(text).toContain(KLASSEN[klasse]);
  });

  it('read-only-Klassen bekommen die Punkte 4–6 nicht', () => {
    for (const klasse of ['pruefung', 'recherche']) {
      const text = dispatchText(klasse, MD);
      expect(text, klasse).not.toMatch(/^4 RECOVERY\./m);
      expect(text, klasse).not.toMatch(/^5 KOLLISION\./m);
      expect(text, klasse).not.toMatch(/^6 KEIN MERGE IM BAU-AUFTRAG\./m);
    }
  });

  it('schreibende Klassen behalten alle sechs Punkte', () => {
    for (const klasse of ['bau', 'daten', 'mechanisch', 'synthese']) {
      const text = dispatchText(klasse, MD);
      expect(text, klasse).toMatch(/^4 RECOVERY\./m);
      expect(text, klasse).toMatch(/^5 KOLLISION\./m);
      expect(text, klasse).toMatch(/^6 KEIN MERGE IM BAU-AUFTRAG\./m);
    }
  });
});

describe('agentDatei — die Agent-Typen erben dieselbe Variante', () => {
  it.each(Object.keys(KLASSEN))('lex-%s trägt die Fassung seiner Klasse', (klasse) => {
    const datei = agentDatei(klasse, MD);
    const erwartet = varianteVon(klasse) === 'pruefung'
      ? '§0 PFLICHT-KLAUSEL (PRÜFUNG — read-only)'
      : '§0 PFLICHT-KLAUSEL (wörtlich, unverändert, in jeden Auftrag)';
    expect(datei).toContain(erwartet);
  });

  it('lex-pruefung und lex-recherche tragen keine Schreib-Punkte', () => {
    for (const klasse of ['pruefung', 'recherche']) {
      expect(agentDatei(klasse, MD), klasse).not.toMatch(/^4 RECOVERY\./m);
    }
  });
});


// ─── aus src/tests/check-testtreue.test.ts ─────────────────────────────────────
// src/tests/check-testtreue.test.ts — §6.3-Diff-Tor: der reine Kern, ohne git
// (QS-AUDIT-VERWEISE 8.8.2026). Der Rot-Fall hier ist der §6.7-Beweis, dass
// das Tor scheitern kann; der Live-Rot-Lauf ist im Bau-Protokoll dokumentiert.

const commit = (betreff: string, dateien: string[]): CommitInfo => ({ sha: 'deadbeef00', betreff, dateien });

describe('check:testtreue — §6.3 (Tests bleiben bei Refactorings unangetastet)', () => {
  it('ROT: als refactor deklarierter Commit ändert eine Test-Datei', () => {
    const v = findeVerstoesse([
      commit('refactor(engine): verjaehrung entdoppelt', ['src/lib/verjaehrung/engine.ts', 'src/tests/verjaehrung.test.ts']),
    ]);
    expect(v).toHaveLength(1);
    expect(v[0].testDateien).toEqual(['src/tests/verjaehrung.test.ts']);
  });

  it('ROT auch bei Scope-losem refactor: und bei e2e-Dateien', () => {
    expect(findeVerstoesse([commit('refactor: split', ['e2e/a11y.e2e.ts'])])).toHaveLength(1);
    expect(findeVerstoesse([commit('refactor!: breaking split', ['src/lib/x.test.ts'])])).toHaveLength(1);
  });

  it('GRÜN: refactor ohne Test-Berührung', () => {
    expect(findeVerstoesse([commit('refactor(ui): karten entdoppelt', ['src/components/Card.tsx'])])).toHaveLength(0);
  });

  it('GRÜN: fachlicher Commit darf Tests ändern — genau das verlangt §6.3 (eigener, deklarierter Schritt)', () => {
    expect(findeVerstoesse([
      commit('fix(verjaehrung): Stichtagsregel korrigiert', ['src/lib/verjaehrung/engine.ts', 'src/tests/verjaehrung.test.ts']),
      commit('test(plan): Regressionstest ergänzt', ['src/tests/plan-lage.test.ts']),
    ])).toHaveLength(0);
  });

  it('erkennt refactor-Deklarationen präzise (kein Treffer auf «feat: refactor vorbereiten»)', () => {
    expect(istRefactorCommit('refactor(plan-bild): …')).toBe(true);
    expect(istRefactorCommit('feat: refactor vorbereiten')).toBe(false);
    expect(istRefactorCommit('docs(refactoring): Skill ergänzt')).toBe(false);
  });

  it('Präfix-Grenzfälle: refactor!: , refactor(scope): und Gross-/Kleinschreibung — Ist-Verhalten eingefroren (Regelaudit 14.8.2026)', () => {
    // Scope + Breaking-Marker, beide bereits oben über findeVerstoesse indirekt geprüft —
    // hier explizit auf der reinen Klassifikator-Funktion, unabhängig von Testdatei-Erkennung.
    expect(istRefactorCommit('refactor(scope): x')).toBe(true);
    expect(istRefactorCommit('refactor!: x')).toBe(true);
    expect(istRefactorCommit('refactor(scope)!: x')).toBe(true);
    // Regex trägt das /i-Flag: Gross-/Kleinschreibung ist heute EGAL — das ist der
    // Ist-Zustand, nicht die Soll-Vorgabe; dieser Test hält ihn fest, ändert ihn nicht.
    expect(istRefactorCommit('Refactor: x')).toBe(true);
    expect(istRefactorCommit('REFACTOR(scope): x')).toBe(true);
    // Ohne Trenner nach dem Wort ist es kein Treffer (kein Conventional-Commit-Typ).
    expect(istRefactorCommit('refactoring: x')).toBe(false);
    expect(istRefactorCommit('refactor x')).toBe(false);
  });

  it('klassifiziert Test-Dateien wie §6.3 sie meint', () => {
    expect(istTestDatei('src/tests/plan-check.test.ts')).toBe(true);
    expect(istTestDatei('e2e/verzahnung.e2e.ts')).toBe(true);
    expect(istTestDatei('src/lib/foo.test.tsx')).toBe(true);
    expect(istTestDatei('src/lib/verjaehrung/engine.ts')).toBe(false);
    expect(istTestDatei('scripts/check-testtreue.ts')).toBe(false);
  });
});


// ─── aus src/tests/ci-diff-klassieren.test.ts ──────────────────────────────────
// src/tests/ci-diff-klassieren.test.ts

// §6.7-Beweis: die vier Testfälle aus dem Auftrag (QS-PLAN-EINFACH, 14.8.2026,
// Punkt 3), gegen die volle Drei-Klassen-Entscheidung (Modell des PR-Zweigs).
describe('klassifiziereDiff — Auftrags-Testmatrix', () => {
  it('[nur ROADMAP.md] → doku', () => {
    expect(klassifiziereDiff(['ROADMAP.md'])).toBe('doku');
  });

  it('[scripts/plan/x.ts] → code-fern', () => {
    expect(klassifiziereDiff(['scripts/plan/x.ts'])).toBe('code-fern');
  });

  it('[src/App.tsx] → code', () => {
    expect(klassifiziereDiff(['src/App.tsx'])).toBe('code');
  });

  it('[scripts/plan/x.ts + src/App.tsx] → code (eine app-nahe Datei genügt)', () => {
    expect(klassifiziereDiff(['scripts/plan/x.ts', 'src/App.tsx'])).toBe('code');
  });

  // Anlass PR #619 (2.9.2026): .claude/agents/lex-bau.md wurde von Hand
  // geändert, der reine-.md-Kurzschluss stufte den Diff als `doku` ein, der
  // Tore-Job (u. a. check:dispatch-klausel) lief nicht (§6.7).
  it('[.claude/agents/lex-bau.md] → code-fern (nicht doku — Tore-Job muss laufen)', () => {
    expect(klassifiziereDiff(['.claude/agents/lex-bau.md'])).toBe('code-fern');
  });

  it('[.claude/agents/lex-bau.md + lex-daten.md] → code-fern (nicht doku)', () => {
    expect(klassifiziereDiff(['.claude/agents/lex-bau.md', '.claude/agents/lex-daten.md'])).toBe(
      'code-fern',
    );
  });

  it('[docs/token-oekonomie/dispatch-template.md] → code-fern (nicht doku)', () => {
    expect(klassifiziereDiff(['docs/token-oekonomie/dispatch-template.md'])).toBe('code-fern');
  });

  it('[.claude/agents/lex-bau.md + ROADMAP.md] → code-fern (gemischt mit echter Doku bleibt code-fern)', () => {
    expect(klassifiziereDiff(['.claude/agents/lex-bau.md', 'ROADMAP.md'])).toBe('code-fern');
  });
});

describe('klassifiziereDateien — die einzelnen code-fernen Flächen', () => {
  it('scripts/cowork/** ist code-fern', () => {
    expect(klassifiziereDateien(['scripts/cowork/y.ts'])).toBe('code-fern');
  });

  it('.claude/** ist code-fern', () => {
    expect(klassifiziereDateien(['.claude/agents/foo.md'])).toBe('code-fern');
  });

  it('docs/** ist code-fern', () => {
    expect(klassifiziereDateien(['docs/anleitung.md'])).toBe('code-fern');
  });

  it('bibliothek/** ist code-fern', () => {
    expect(klassifiziereDateien(['bibliothek/register/x.md'])).toBe('code-fern');
  });

  it('messwerte/** ist code-fern', () => {
    expect(klassifiziereDateien(['messwerte/lauf.json'])).toBe('code-fern');
  });

  it('archiv/** ist code-fern', () => {
    expect(klassifiziereDateien(['archiv/FAHRPLAN-ALT.md'])).toBe('code-fern');
  });

  it('mehrere code-ferne Dateien zusammen bleiben code-fern', () => {
    expect(klassifiziereDateien(['scripts/plan/x.ts', 'docs/y.md', 'ROADMAP.md'])).toBe('code-fern');
  });

  // KONSERVATIV: jede andere Fläche kippt auf `code` — auch scripts/** ausserhalb
  // von plan/cowork, e2e/** und package.json (Auftrag: "konservativ").
  it('package.json ist code (keine Ausnahme)', () => {
    expect(klassifiziereDateien(['package.json'])).toBe('code');
  });

  it('e2e/** ist code (keine Ausnahme)', () => {
    expect(klassifiziereDateien(['e2e/foo.e2e.ts'])).toBe('code');
  });

  it('scripts/** ausserhalb plan/cowork ist code', () => {
    expect(klassifiziereDateien(['scripts/logik-sweep.ts'])).toBe('code');
  });

  it('scripts/plan/x.ts + scripts/logik-sweep.ts → code (ein Ausreisser genügt)', () => {
    expect(klassifiziereDateien(['scripts/plan/x.ts', 'scripts/logik-sweep.ts'])).toBe('code');
  });
});

// ─── Bash↔TS-Parität: CODE_FERN_RE/WERKZEUG_TROTZ_MD_RE ────────────────────────
// Bug-Check PR #626 (2.9.2026): ci.yml pflegt die beiden Klassierungsmuster als
// Bash-ERE-Literale (Zeile ~178/184) PARALLEL zu den TS-Regex-Arrays in
// diff-klassieren.ts (CODE_FERNE_MUSTER/WERKZEUG_TROTZ_MD_MUSTER) — ohne
// diesen Test kann eine Seite driften, ohne dass ein Tor es je bemerkt (§6.7).

describe('Bash↔TS-Parität — CODE_FERN_RE/WERKZEUG_TROTZ_MD_RE (Bug-Check #626)', () => {
  const ciYml = readFileSync('.github/workflows/ci.yml', 'utf8');

  function bashMuster(name: string): string {
    const treffer = ciYml.match(new RegExp(`^\\s*${name}='\\((.+)\\)'$`, 'm'));
    if (!treffer) throw new Error(`${name} nicht in ci.yml gefunden`);
    return treffer[1];
  }

  // `.source` einer JS-Regex-Literal escaped den Delimiter "/" syntaktisch
  // immer als "\/" — reiner JS-Literal-Zwang, keine Bash-Konvention. Für den
  // String-Vergleich mit der unescaped Bash-ERE wird das auf "/" normalisiert;
  // semantisch sind "\/" und "/" in grep -E identisch.
  function tsMuster(muster: readonly RegExp[]): string {
    return muster
      .map((r) => r.source)
      .join('|')
      .replace(/\\\//g, '/');
  }

  it('CODE_FERN_RE (ci.yml) == CODE_FERNE_MUSTER (diff-klassieren.ts)', () => {
    expect(bashMuster('CODE_FERN_RE')).toBe(tsMuster(CODE_FERNE_MUSTER));
  });

  it('WERKZEUG_TROTZ_MD_RE (ci.yml) == WERKZEUG_TROTZ_MD_MUSTER (diff-klassieren.ts)', () => {
    expect(bashMuster('WERKZEUG_TROTZ_MD_RE')).toBe(tsMuster(WERKZEUG_TROTZ_MD_MUSTER));
  });
});
