import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import {
  nennungsAnker, sammleNennungen, zaehleNennungen, zitatMuster,
} from '../pages/entscheidLeserRegeln';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

// ─── W2·17-UI-BEFUNDE-B2 / Los E — LM-208: Herkunft und Fundstelle ──────────
//
// Befund (Prod, 2.8.2026): `/gesetze/bund/OR#art-367` → Entscheid-Chip landet auf
// `…/UV.2023.8?norm=Art.%20367%20OR`; die Entscheidseite zeigte weder, über welche
// Norm man gekommen war, noch eine Markierung im Text (`mark`-Elemente: 0).
//
// Diese Datei sichert die REGEL, nach der markiert wird — und zwar an genau dem
// reproduzierten Entscheid: er nennt «Art. 367 ff. OR», NICHT «Art. 367 OR». Die
// Markierung darf daraus keine Fundstelle machen (das «ff.» aufzulösen wäre eine
// juristische Schlussfolgerung, §1/§8) — sie bleibt ehrlich leer.

function ladeSnapshot(pfad: string): EntscheidSnapshot {
  const roh = readFileSync(join('public/rechtsprechung', pfad), 'utf8');
  return JSON.parse(roh).eintraege[0] as EntscheidSnapshot;
}

describe('zitatMuster — wörtliche Nennung, Wortgrenzen (LM-208)', () => {
  it('findet die schlichte Nennung', () => {
    expect(zaehleNennungen('vgl. Art. 367 OR und weiter', 'Art. 367 OR')).toBe(1);
  });

  it('«Art. 367 ff. OR» ist KEINE Nennung von «Art. 367 OR» (kein Raten des ff.)', () => {
    expect(zaehleNennungen('(vgl. Art. 367 ff. OR)', 'Art. 367 OR')).toBe(0);
  });

  it('«Art. 367 Abs. 2 OR» ebenso wenig — nur die exakte Nennung zählt', () => {
    expect(zaehleNennungen('nach Art. 367 Abs. 2 OR', 'Art. 367 OR')).toBe(0);
  });

  it('Wortgrenze hinten: «Art. 8 ZGB» trifft nicht in «Art. 8 ZGBX»', () => {
    expect(zaehleNennungen('Art. 8 ZGBX', 'Art. 8 ZGB')).toBe(0);
    expect(zaehleNennungen('Art. 8 ZGB.', 'Art. 8 ZGB')).toBe(1);
  });

  it('Wortgrenze vorn: kein Treffer mitten im Wort', () => {
    expect(zaehleNennungen('XArt. 8 ZGB', 'Art. 8 ZGB')).toBe(0);
  });

  it('Artikel-Präfix trifft nicht in die längere Nummer («Art. 36 OR» ≠ «Art. 367 OR»)', () => {
    expect(zaehleNennungen('Art. 367 OR', 'Art. 36 OR')).toBe(0);
  });

  it('geschütztes Leerzeichen und Zeilenumbruch im Text zählen als Leerzeichen', () => {
    expect(zaehleNennungen('Art. 367 OR', 'Art. 367 OR')).toBe(1);
    expect(zaehleNennungen('Art. 367\nOR', 'Art. 367 OR')).toBe(1);
  });

  it('Gross-/Kleinschreibung zählt (Zitate sind Eigennamen)', () => {
    expect(zaehleNennungen('art. 367 or', 'Art. 367 OR')).toBe(0);
  });

  it('Sonderzeichen im Zitat werden nicht als Regex gelesen', () => {
    expect(zitatMuster('Art. 3 (a) X')?.source).toContain('\\(a\\)');
    expect(zaehleNennungen('Art. 3 (a) X', 'Art. 3 (a) X')).toBe(1);
  });

  it('leeres Zitat ⇒ kein Muster (nichts markiert alles)', () => {
    expect(zitatMuster('   ')).toBeNull();
    expect(zaehleNennungen('irgendein Text', '')).toBe(0);
  });

  it('zählt mehrfache Nennungen', () => {
    expect(zaehleNennungen('Art. 8 ZGB … erneut Art. 8 ZGB', 'Art. 8 ZGB')).toBe(2);
  });
});

describe('nennungsAnker — Sprungziele in den Erwägungen (LM-208)', () => {
  it('Referenz BGE 151 III 377: «Art. 679 ZGB» ⇒ das Ziel des A17-Sprungs', () => {
    const snap = ladeSnapshot('bund/bge/151_III_377.json');
    // Dieselbe Erwägung, die `ersteFundstelle` anspringt (§5: eine Anker-Wahrheit).
    expect(nennungsAnker(snap.abschnitte, 'Art. 679 ZGB')).toEqual(['e-2-3-1']);
  });

  it('Sprungziele sind BLÖCKE, nicht Vorkommen — «Art. 684 ZGB» steht zweimal in E. 2.4', () => {
    const snap = ladeSnapshot('bund/bge/151_III_377.json');
    const erw = snap.abschnitte.find((a) => a.typ === 'erwaegung')!;
    const inBlock = erw.bloecke.filter((b) => zaehleNennungen(b.text, 'Art. 684 ZGB') > 0);
    expect(inBlock.length).toBe(1);
    expect(zaehleNennungen(inBlock[0].text, 'Art. 684 ZGB')).toBe(2);
    // Ein Block = ein Sprungziel; zweimal an dieselbe Stelle zu springen wäre keine
    // Navigation. Die Markierung im Text zeigt beide Vorkommen.
    expect(nennungsAnker(snap.abschnitte, 'Art. 684 ZGB')).toEqual(['e-2-4']);
  });

  it('mehrere Blöcke ⇒ mehrere Ziele in Dokument-Reihenfolge («Art. 75 ZGB»)', () => {
    const snap = ladeSnapshot('bund/bge/151_III_377.json');
    expect(nennungsAnker(snap.abschnitte, 'Art. 75 ZGB')).toEqual(['e-1', 'e-2-3-2']);
  });

  it('nicht genannte Norm ⇒ kein Sprungziel (kein toter Anker)', () => {
    const snap = ladeSnapshot('bund/bge/151_III_377.json');
    expect(nennungsAnker(snap.abschnitte, 'Art. 99 XYZ')).toEqual([]);
  });

  it('reproduzierter Fall UV.2023.8 · «Art. 367 OR»: der Text sagt «ff.» ⇒ 0 Fundstellen', () => {
    const snap = ladeSnapshot('kanton/BS/bs_sozialversicherungsgericht/UV.2023.8.json');
    const volltext = snap.abschnitte.flatMap((a) => a.bloecke).map((b) => b.text).join('\n');
    // Reproduktion des Befunds am Datenbestand: die Norm STEHT im Text — aber als «ff.».
    expect(volltext).toContain('Art. 367 ff. OR');
    expect(nennungsAnker(snap.abschnitte, 'Art. 367 OR')).toEqual([]);
  });
});

describe('sammleNennungen — Markierung im gerenderten Text (LM-208)', () => {
  // Markup wie es EntscheidBody/NormText erzeugen: die auflösbare Norm steckt in
  // einem eigenen <a> (NormChip), der Rest ist Fliesstext.
  const bau = (html: string) =>
    parseHTML(`<html><body><article id="k">${html}</article></body></html>`).document.getElementById('k');

  it('markiert die Nennung im Norm-Link', () => {
    const k = bau('<p>Massgeblich ist <a>Art. 8 ZGB</a> für die Beweislast.</p>');
    const t = sammleNennungen(k, 'Art. 8 ZGB');
    expect(t.length).toBe(1);
    expect(t[0].knoten.nodeValue?.slice(t[0].start, t[0].ende)).toBe('Art. 8 ZGB');
  });

  it('markiert auch die Nennung im reinen Fliesstext', () => {
    const k = bau('<p>Nach Art. 8 ZGB trägt die Beweislast, wer …</p>');
    expect(sammleNennungen(k, 'Art. 8 ZGB').length).toBe(1);
  });

  it('reproduzierter Fall: «(vgl. Art. 367 ff. OR)» bleibt unmarkiert', () => {
    const k = bau('<p>… Voraussetzung wäre (vgl. <a>Art. 367 ff. OR</a>). Eine fehlende …</p>');
    expect(sammleNennungen(k, 'Art. 367 OR')).toEqual([]);
  });

  it('über Knoten zerrissene Nennungen werden nicht zusammengesetzt (§1)', () => {
    const k = bau('<p>Art. 8 <em>ZGB</em></p>');
    expect(sammleNennungen(k, 'Art. 8 ZGB')).toEqual([]);
  });

  it('ohne Container / ohne Zitat: keine Treffer', () => {
    expect(sammleNennungen(null, 'Art. 8 ZGB')).toEqual([]);
    expect(sammleNennungen(bau('<p>Art. 8 ZGB</p>'), '')).toEqual([]);
  });
});

describe('Verdrahtung im Leser (LM-208)', () => {
  const quelle = readFileSync('src/pages/EntscheidLeser.tsx', 'utf8');
  const traegt = (muster: RegExp) => muster.test(quelle);

  it('zeigt einen sichtbaren Herkunfts-Hinweis, wenn ?norm= gesetzt ist', () => {
    expect(traegt(/Aufgerufen über/), 'kein Herkunfts-Hinweis im Kopf').toBe(true);
  });

  it('markiert die Fundstellen im Lesetext (maleNennungen verdrahtet)', () => {
    expect(traegt(/maleNennungen\(/), 'keine Markierung verdrahtet').toBe(true);
    expect(traegt(/loescheNennungen\(/), 'Markierung wird nie zurückgenommen').toBe(true);
  });

  it('bietet den Sprung zur nächsten Fundstelle über nennungsAnker an', () => {
    expect(traegt(/nennungsAnker\(/), 'kein Fundstellen-Sprung').toBe(true);
  });
});
