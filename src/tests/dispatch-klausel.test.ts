import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  pflichtKlausel, dispatchText, templateLesen, KLASSEN, VARIANTE, varianteVon,
  type Klauselvariante,
} from '../../scripts/dispatch';
import { agentDatei } from '../../scripts/dispatch-agents';

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
  const hook = readFileSync('scripts/hooks-vorschlag-dispatch-schutz.py', 'utf8');

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
