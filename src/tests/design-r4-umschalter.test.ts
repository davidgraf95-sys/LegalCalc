/**
 * W2·19-DESIGN-KONSISTENZ — Runde 4 (31.8.2026): EINE Umschalter-Familie,
 * ZWEI deklarierte Reiter-Formen.
 *
 * DER BEFUND (R4-Finder). Die App zeichnete Umschalter an sechs Stellen von
 * Hand, obwohl `ui/Tabs` seit dem 5.6.2026 genau dafür da ist und neun
 * Konsumenten trägt:
 *   R4-1 · `EntscheidFilter` «Ansicht» · `wizard` «Ausgabe-Stil» ·
 *          `KantonAuswahl` «Ansicht» + «Sortierung» · `LiveSuche` «Sortierung» ·
 *          `Schnellrechner` «Gebührenart» (die zusätzlich die CHIP-Farbe
 *          `bg-brass-100 text-brass-800` = das `.lc-chip-selected`-Paar borgte —
 *          Chip-Farbe gehört an Chips, nicht an Segmente).
 *   R4-2 · `Schnellrechner` «Fristen/Gebühren/Zuständigkeit» versprach
 *          `role="tab"` OHNE Tastatur, ohne `tabindex`, ohne `tabpanel`:
 *          ein ARIA-Versprechen ohne Verhalten (§8). Die eingelöste Form
 *          derselben Grammatik stand schon im Repo — die Unterstrich-Reiter an
 *          der Panel-Oberkante (`LeserPanel`, APG-Tastatur + `lc-scrollrand-x`).
 *          Sie ist jetzt der Baustein `ui/TafelReiter`, und beide Flächen
 *          laufen darüber.
 *
 * DIE WURZEL, NICHT DIE SECHS STELLEN (§17). Diese Sonde fegt die APP, nicht
 * eine Datei-Liste (Vakuum-Tor, §6.7 — dieselbe Lehre wie in `appDateien.ts`):
 *   A · `role="tablist"` darf nur in den beiden Bausteinen stehen.
 *   B · eine `role="group"`-Fläche, die ihre Knöpfe in EINE gerahmte Box
 *       schweisst (`border border-line` + `flex` am Container), ist die
 *       Segmented-Control-Handkopie — sie gehört nach `ui/Tabs`.
 * Ausnahmen tragen ihre Begründung AM FUNDORT und werden hier wörtlich zitiert
 * (`pruefeAusnahmen`): eine Ausnahme, die man nur im Test sieht, ist unsichtbar.
 *
 * ROT-BEWEIS (§6.7) — gefahren am 31.8.2026 gegen den Stand VOR dem Bau,
 * wörtliche Ausgabe:
 *   A: ["components/start/Schnellrechner.tsx", "pages/gesetz-leser/v3/LeserPanel.tsx"]
 *      (im Schnellrechner ZWEI Leisten in einer Datei)
 *   B: EntscheidFilter · LiveSuche · wizard · KantonAuswahl
 * Der erste Lauf von B meldete eine FÜNFTE Box (`LesemodusOverlay`) — zu
 * Unrecht, und das hat den Ausdruck geschärft statt eine Ausnahme erzeugt
 * (s. `hatAuswahlZustand`). `LiveSuche` stand umgekehrt in keinem Befund und
 * kam erst durch diesen Sweep ans Licht: genau dafür fegt er die App.
 * Jede Sonde trägt zusätzlich eine NEGATIV-KONTROLLE mit dem damaligen
 * Wortlaut: läuft sie grün, prüft der Ausdruck nichts (§2b — die Zitate werden
 * nie «nachgeführt», sie belegen einen Zustand mit Datum).
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TafelReiter } from '../components/ui/TafelReiter';
import { tafelId, tafelReiterId } from '../components/ui/tafelReiterIds';
import {
  APP_WURZEL, alleTsx, ohneKommentare, pruefeAusnahmen, rel, type Ausnahme,
} from './appDateien';

const lies = (r: string): string => readFileSync(join(APP_WURZEL, r), 'utf8');
const liesOhne = (r: string): string => ohneKommentare(lies(r));

/** Die ZWEI deklarierten Formen — und nur sie dürfen die Rollen zeichnen. */
const BAUSTEINE = ['components/ui/Tabs.tsx', 'components/ui/TafelReiter.tsx'];

/** Jedes JSX-Öffnungs-Tag einzeln (Attribute dürfen über Zeilen laufen). */
function oeffnungsTags(quelle: string): string[] {
  return quelle.match(/<[a-zA-Z][^>]*>/g) ?? [];
}

// ─── A · `role="tablist"` lebt in den Bausteinen ────────────────────────────

const TABLIST_AUSNAHMEN: readonly Ausnahme[] = [
  {
    datei: 'components/vorlagen/Dokumentmappe.tsx',
    begruendung: '(`lc-chip`), umbrechend statt scrollend',
  },
];

describe('R4-2 · `role="tablist"` nur in `ui/Tabs` und `ui/TafelReiter`', () => {
  it('keine Fläche zeichnet eine eigene Reiter-Leiste', () => {
    const erlaubt = new Set([...BAUSTEINE, ...pruefeAusnahmen(TABLIST_AUSNAHMEN)]);
    const funde = alleTsx()
      .filter((p) => ohneKommentare(readFileSync(p, 'utf8')).includes('role="tablist"'))
      .map(rel)
      .filter((r) => !erlaubt.has(r));
    expect(funde).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Sweep sieht die Rolle im Markup, nicht im Kommentar', () => {
    // Wortlaut aus Schnellrechner.tsx vor dem Fix (Stand 31.8.2026, Z. 94).
    const vorher = '<div role="tablist" aria-label="Schnellrechner" className="flex gap-1 px-3 pt-3">';
    expect(ohneKommentare(vorher)).toContain('role="tablist"');
    expect(ohneKommentare('// hier stand `role="tablist"`\nconst x = 1;')).not.toContain('role="tablist"');
  });

  it('die beiden Konsumenten der Tafel-Oberkante rendern den Baustein', () => {
    for (const r of ['pages/gesetz-leser/v3/LeserPanel.tsx', 'components/start/Schnellrechner.tsx']) {
      expect(lies(r).includes('<TafelReiter'), `${r}: rendert <TafelReiter`).toBe(true);
    }
  });

  it('der Baustein löst das ARIA-Versprechen ein (Tastatur + Tafel-Verdrahtung)', () => {
    const b = liesOhne('components/ui/TafelReiter.tsx');
    for (const zusage of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      expect(b.includes(zusage), `APG-Tastatur: ${zusage}`).toBe(true);
    }
    expect(b.includes('tabIndex={aktiv ? 0 : -1}'), 'roving tabindex').toBe(true);
    expect(b.includes('aria-controls={tafelId('), 'Reiter zeigt auf seine Tafel').toBe(true);
  });

  it('R4-2: der Schnellrechner hat jetzt eine ECHTE Tafel (der Kern des Befunds)', () => {
    const q = liesOhne('components/start/Schnellrechner.tsx');
    expect(q.includes('role="tabpanel"'), 'die Tafel existiert').toBe(true);
    expect(q.includes('tafelId('), 'sie trägt die Id ihres Reiters').toBe(true);
    expect(q.includes('aria-labelledby={tafelReiterId('), 'und ist von ihm benannt').toBe(true);
    // Die Handkopie ist WEG, nicht angeglichen (§5/§10).
    expect(q.includes('role="tab"'), 'kein eigener role=tab mehr').toBe(false);
  });

  it('GERENDERT: die Verdrahtung stimmt, nicht nur ihr Quelltext', () => {
    const markup = renderToStaticMarkup(createElement(TafelReiter<'a' | 'b'>, {
      items: [{ code: 'a', label: 'A' }, { code: 'b', label: 'B' }],
      value: 'a', onChange: () => {}, ariaLabel: 'Probe', idPraefix: 'probe',
      datenName: 'data-probe-reiter',
    }));
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Probe"');
    // Der Reiter zeigt auf SEINE Tafel, und die Id-Grammatik ist die geteilte.
    expect(markup).toContain(`id="${tafelReiterId('probe', 'a')}"`);
    expect(markup).toContain(`aria-controls="${tafelId('probe', 'a')}"`);
    // Roving tabindex: genau EIN tabbarer Reiter.
    expect((markup.match(/tabindex="0"/g) ?? []).length).toBe(1);
    expect((markup.match(/tabindex="-1"/g) ?? []).length).toBe(1);
    // Der Haken der Fläche liegt am Knopf, nicht im Baustein verdrahtet.
    expect(markup).toContain('data-probe-reiter="a"');
  });

  it('GERENDERT: `breit` füllt die Kartenkante, ohne eine zweite Form zu erfinden', () => {
    const eng = renderToStaticMarkup(createElement(TafelReiter<'a'>, {
      items: [{ code: 'a', label: 'A' }], value: 'a', onChange: () => {},
      ariaLabel: 'P', idPraefix: 'p',
    }));
    const breit = renderToStaticMarkup(createElement(TafelReiter<'a'>, {
      items: [{ code: 'a', label: 'A' }], value: 'a', onChange: () => {},
      ariaLabel: 'P', idPraefix: 'p', grund: 'surface', breit: true,
    }));
    // Gleiche Grammatik (Unterstrich in Messing), andere Proportion.
    for (const m of [eng, breit]) expect(m).toContain('border-brass-500');
    expect(eng).toContain('shrink-0 px-2 py-1');
    expect(breit).toContain('flex-1 px-3 py-2.5');
    // Der Deckel-Ton folgt der Fläche darunter, nicht dem Zufall.
    expect(eng).toContain('lc-scrollrand-grund-raised');
    expect(breit).toContain('lc-scrollrand-grund-surface');
  });

  it('NEGATIV-KONTROLLE: die Vorher-Form hatte tab ohne tabpanel', () => {
    // Wortlaut aus Schnellrechner.tsx vor dem Fix (Stand 31.8.2026, Z. 94–106).
    const vorher = `<div role="tablist" aria-label="Schnellrechner" className="flex gap-1 px-3 pt-3">
        <button type="button" role="tab" aria-selected={an} onClick={() => setTab(t.id)}>`;
    expect(vorher).toContain('role="tab"');
    expect(vorher).not.toContain('role="tabpanel"');
    expect(vorher).not.toContain('tabIndex');
  });
});

// ─── B · die geschweisste Segment-Box gehört nach `ui/Tabs` ─────────────────

/** Container-Signatur der Handkopie: `role="group"` + Rahmen + Flex-Reihe. */
function istSegmentBox(tag: string): boolean {
  return tag.includes('role="group"') && tag.includes('border border-line') && tag.includes('flex');
}

/**
 * Zweite Bedingung: die Gruppe hält einen AUSGEWÄHLTEN Zustand (`aria-pressed`).
 *
 * Der erste Lauf dieser Sonde (31.8.2026) fand fünf Boxen — eine davon zu Recht
 * nicht: die A−/A+-Stufung im `LesemodusOverlay` trägt dieselbe geschweisste
 * Box, ist aber gar kein Umschalter, sondern ein Schrittpaar (zwei BEFEHLE, kein
 * gewählter Wert). Sie in `ui/Tabs` zu zwingen wäre die Abstraktion, vor der §1
 * warnt. Die Unterscheidung steht darum im Ausdruck und nicht in einer
 * Ausnahmeliste: ein Umschalter sagt, WELCHE Option gilt.
 */
const hatAuswahlZustand = (quelle: string): boolean => quelle.includes('aria-pressed');

const SEGMENT_AUSNAHMEN: readonly Ausnahme[] = [];

describe('R4-1 · Segmented-Controls kommen aus `ui/Tabs`', () => {
  it('keine Fläche schweisst ihre Knöpfe noch selbst in eine Box', () => {
    const erlaubt = new Set([...BAUSTEINE, ...pruefeAusnahmen(SEGMENT_AUSNAHMEN)]);
    const funde: string[] = [];
    for (const p of alleTsx()) {
      if (erlaubt.has(rel(p))) continue;
      const quelle = ohneKommentare(readFileSync(p, 'utf8'));
      if (!hatAuswahlZustand(quelle)) continue;
      for (const tag of oeffnungsTags(quelle)) {
        if (istSegmentBox(tag)) funde.push(`${rel(p)} · ${tag.replace(/\s+/g, ' ').slice(0, 90)}`);
      }
    }
    expect(funde).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: die Signatur trifft alle vier Vorher-Formen', () => {
    // Wortlaute vor dem Fix (Stand 31.8.2026).
    const vorher = [
      // EntscheidFilter.tsx Z. 189
      '<div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line" role="group" aria-label="Ansicht">',
      // vorlagen/wizard.tsx Z. 403
      '<div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line text-xs" role="group" aria-label="Ausgabe-Stil">',
      // gesetze-teile/KantonAuswahl.tsx Z. 121
      '<div role="group" aria-label="Ansicht" className="inline-flex rounded-md border border-line bg-paper-sunken/50 p-0.5 text-body-s">',
      // rechtsprechung/LiveSuche.tsx Z. 109
      '<div className="inline-flex items-stretch overflow-hidden rounded border border-line" role="group" aria-label="Sortierung">',
    ];
    for (const v of vorher) expect(istSegmentBox(v), v.slice(0, 60)).toBe(true);
  });

  it('NEGATIV-KONTROLLE: die Signatur trifft KEINE Chip-Reihe (sie ist keine Box)', () => {
    // Chips tragen den Rahmen am Knopf, nicht am Container — der bleibt frei.
    const chipZeile = '<div role="group" aria-label="Sachgebiete der Entscheide" className="lc-chip-zeile flex flex-wrap items-center gap-x-2 gap-y-1.5">';
    expect(istSegmentBox(chipZeile)).toBe(false);
  });

  it('NEGATIV-KONTROLLE: das Schrittpaar A−/A+ ist eine Box, aber kein Umschalter', () => {
    // Wortlaut aus LesemodusOverlay.tsx (Stand 31.8.2026, Z. 148) — die Box-
    // Signatur trifft, der Auswahl-Zustand fehlt. Genau so soll es sein.
    const stufung = '<span className="inline-flex items-stretch overflow-hidden rounded border border-line" role="group" aria-label="Grösse nur des Entscheidtexts">';
    expect(istSegmentBox(stufung)).toBe(true);
    expect(hatAuswahlZustand(liesOhne('components/rechtsprechung/LesemodusOverlay.tsx'))).toBe(false);
  });

  it('die sechs Konsumenten rendern den Baustein — und keiner mehr die Kopie', () => {
    const konsumenten = [
      'components/rechtsprechung/EntscheidFilter.tsx',
      'components/rechtsprechung/LiveSuche.tsx',
      'components/vorlagen/wizard.tsx',
      'pages/gesetze-teile/KantonAuswahl.tsx',
      'components/start/Schnellrechner.tsx',
    ];
    for (const r of konsumenten) {
      expect(lies(r).includes('<Tabs'), `${r}: rendert <Tabs`).toBe(true);
    }
    // KantonAuswahl trug ZWEI Kopien (Ansicht + Sortierung).
    expect((lies('pages/gesetze-teile/KantonAuswahl.tsx').match(/<Tabs/g) ?? []).length).toBe(2);
  });

  it('R4-1: die geborgte Chip-Farbe ist aus den migrierten Segmenten verschwunden', () => {
    // `bg-brass-100 text-brass-800` ist das Farbpaar von `.lc-chip-selected`
    // (index.css). Ein Segment, das es borgt, behauptet Chip zu sein.
    for (const r of [
      'components/start/Schnellrechner.tsx',
      'components/rechtsprechung/EntscheidFilter.tsx',
      'components/vorlagen/wizard.tsx',
      'pages/gesetze-teile/KantonAuswahl.tsx',
    ]) {
      expect(liesOhne(r).includes('bg-brass-100 text-brass-800'), `${r}: keine Chip-Füllung mehr`).toBe(false);
    }
  });

  it('NEGATIV-KONTROLLE: das Farbpaar ist wirklich das der Chips', () => {
    const css = readFileSync(join(APP_WURZEL, 'index.css'), 'utf8');
    const block = /\.lc-chip-selected \{([\s\S]*?)\}/.exec(css)?.[1] ?? '';
    expect(block, '.lc-chip-selected existiert').not.toBe('');
    expect(block).toContain('brass-100');
    expect(block).toContain('brass-800');
    // Wortlaut aus Schnellrechner.tsx vor dem Fix (Stand 31.8.2026, Z. 64).
    expect("an ? 'bg-brass-100 text-brass-800' : 'text-ink-600 hover:text-ink-900'")
      .toContain('bg-brass-100 text-brass-800');
  });
});
