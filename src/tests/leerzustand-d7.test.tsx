/**
 * W2·19-DESIGN-KONSISTENZ · B1/BAU-3 — Befund D-7: EIN Leerzustand statt dreier.
 *
 * Bewacht werden die drei Dinge, die still zurückfallen können:
 *   (1) FORM — der Baustein rendert den Kanon (nackter Absatz `text-body-s
 *       text-ink-500`, 12:2 gegen die `lc-notice`-Box), und der Weiterweg ist ein
 *       echtes Bedienelement, kein Prosa-Hinweis.
 *   (2) WEITERWEG-PFLICHT — wo ein Filter/eine Suche leerläuft, steht ein Ausweg
 *       (C1 «nie eine Sackgasse»). Der Typ erzwingt es beim Aufruf; dieser Test
 *       hält die Aufrufstellen zusätzlich fest, damit ein späteres Umflaggen auf
 *       `art="bestand"` (das den Weiterweg optional macht) nicht unbemerkt durch
 *       den Review geht.
 *   (3) AUSSAGESATZ, NIE FRAGE (§8) — die Sonde liest die echten Aufrufstellen
 *       im Quelltext. Das ist der Punkt, an dem «Filter zurücksetzen?» entstanden
 *       ist; ein Unit-Test am Baustein allein hätte ihn nie gesehen.
 *
 * §6.7 (Tor muss scheitern können) — beide Sonden einmal rot gesehen:
 *   · (3) mit dem Ist-Stand VOR dem Bau: «Kein Material gefunden. Filter
 *     zurücksetzen?» in Materialien.tsx.
 *   · (2)/(4) mit versuchsweise entferntem `weiterweg`-Prop bzw. wieder
 *     eingesetzter `lc-notice`-Box in Rechtsprechung.tsx.
 *
 * Reine Darstellung (§3).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Leerzustand } from '../components/ui/Leerzustand';

/** Quelltext ohne Kommentare — die Sonden prüfen den ausführbaren Teil. Die
 *  Begründungen am Fundort benennen den Vorzustand ausdrücklich («hier stand
 *  ‹Filter zurücksetzen?›»); läse die Sonde den Rohtext, zwänge sie dazu, genau
 *  diese Belege zu löschen (§2b: Belege altern nicht, sie werden nicht
 *  nachgeführt). Beim ersten Lauf ist sie an genau dieser Stelle rot geworden. */
const lies = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((z) => !/^\s*(\/\/|\*)/.test(z)).join('\n');

/** Die Aufrufstellen, die D-7 zusammengeführt hat. */
const KONSUMENTEN = [
  '../pages/Rechtsprechung.tsx',
  '../pages/Materialien.tsx',
  '../pages/Gesetze.tsx',
] as const;

/** Alle `<Leerzustand …/>`-Aufrufe einer Datei als Rohtext. */
function aufrufe(quelle: string): string[] {
  return quelle.match(/<Leerzustand\b[\s\S]*?\/>/g) ?? [];
}

describe('D-7 (1) — Form: der Baustein rendert den Kanon', () => {
  it('Bestands-Leere: nackter Absatz, kein Kasten, kein Knopf', () => {
    const out = renderToStaticMarkup(<Leerzustand art="bestand" text="Kein Erlass gefunden." />);
    expect(out).toContain('text-body-s text-ink-500');
    expect(out).toContain('Kein Erlass gefunden.');
    expect(out).not.toContain('lc-notice');
    expect(out).not.toContain('<button');
  });

  it('Filter-Leere: derselbe Absatz PLUS ein echter Knopf mit der Aktions-Grammatik', () => {
    const out = renderToStaticMarkup(
      <Leerzustand art="filter" text="Kein Entscheid gefunden."
        weiterweg={{ text: 'Filter zurücksetzen', onKlick: () => {} }} />,
    );
    expect(out).toContain('text-body-s text-ink-500');
    expect(out).toContain('<button type="button"');
    expect(out).toContain('text-brass-700');
    expect(out).toContain('Filter zurücksetzen');
    // Der Ausweg ist ein Bedienelement, kein Satzteil: die Beschriftung trägt
    // kein Fragezeichen und keinen Schlusspunkt.
    expect(out).not.toContain('zurücksetzen?');
  });

  it('die beiden Nutzungen sind im Markup unterscheidbar (Sonde/Deep-Link-Debug)', () => {
    expect(renderToStaticMarkup(<Leerzustand art="bestand" text="Nichts." />))
      .toContain('data-leerzustand="bestand"');
    expect(renderToStaticMarkup(
      <Leerzustand art="filter" text="Nichts." weiterweg={{ text: 'x', onKlick: () => {} }} />,
    )).toContain('data-leerzustand="filter"');
  });
});

describe('D-7 (2) — Aufrufstellen: Aussagesatz und Weiterweg-Pflicht', () => {
  it('jede Aufrufstelle nennt einen Aussagesatz — nie eine Frage (§8)', () => {
    const gefunden: string[] = [];
    for (const datei of KONSUMENTEN) {
      for (const a of aufrufe(lies(datei))) {
        const m = a.match(/text=(?:"([^"]*)"|\{`([^`]*)`\})/);
        expect(m, `text-Prop fehlt in ${datei}: ${a}`).not.toBeNull();
        const text = (m![1] ?? m![2]).trim();
        gefunden.push(text);
        expect(text, `${datei}: «${text}»`).not.toMatch(/\?\s*$/);
        expect(text, `${datei}: «${text}»`).toMatch(/\.\s*$/);
      }
    }
    // Negativ-Kontrolle: die Schleife hat überhaupt Aufrufe gesehen. Ohne das
    // wäre der Test grün, sobald jemand den Baustein wieder ausbaut (§6.7).
    expect(gefunden.length).toBeGreaterThanOrEqual(5);
  });

  it('jede Filter-Leere trägt einen Weiterweg, jede Bestands-Leere keinen erfundenen', () => {
    let filterFaelle = 0;
    for (const datei of KONSUMENTEN) {
      for (const a of aufrufe(lies(datei))) {
        if (a.includes('art="filter"')) {
          filterFaelle += 1;
          expect(a, `${datei}: Filter-Leerzustand ohne Weiterweg`).toContain('weiterweg=');
        } else {
          expect(a).toContain('art="bestand"');
        }
      }
    }
    expect(filterFaelle).toBeGreaterThanOrEqual(3);
  });

  it('die alten Bauformen sind weg, nicht bloss danebengestellt (§5/§10)', () => {
    expect(lies('../pages/Materialien.tsx')).not.toContain('Filter zurücksetzen?');
    expect(lies('../pages/Rechtsprechung.tsx'))
      .not.toContain('Kein Entscheid gefunden. Filter anpassen oder zurücksetzen.');
    for (const datei of KONSUMENTEN) {
      expect(lies(datei), `${datei}: Leerzustand als roher Absatz`)
        .not.toMatch(/<p className="text-body-s text-ink-500">Kein /);
    }
  });
});
