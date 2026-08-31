// ─── Eingabe-Bausteine der Rechner/Vorlagen (Design-Konsistenz R2-E) ────────
//
// Drei Wächter und drei Vertrags-Belege zu den Befunden F1-1 (natives
// `type="date"`), F1-6 («(optional)» im Label statt der `optional`-Prop) und
// F1-10 (drei Kopier-Knopf-Bauformen).
//
// F1-1 ist KEINE Geschmacksfrage: `<input type="date">` rendert in der Locale
// des BROWSERS. Auf einem us-englischen Profil steht dort MM/DD/YYYY — und
// genau diese Felder tragen das fristauslösende Ereignis, das Datum des
// GV-Beschlusses (6-Monats-Verfall, Art. 650 Abs. 3 OR) oder den Stichtag
// einer Sperrfrist. Das Haus-`DatumsFeld` schreibt TT.MM.JJJJ fest und hält
// den WERT unverändert bei ISO (yyyy-MM-dd) — Engines und Vorlagen-Schemas
// sehen also exakt dasselbe wie vorher (§3: reine Darstellung).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { DatumsFeld } from '../components/DatumsFeld';
import { BetragsFeld } from '../components/BetragsFeld';
import { Field, KopierButton } from '../components/vorlagen/ui';
import { alleQuellen, alleTsx, liesOhneKommentare, pruefeAusnahmen, rel } from './appDateien';

// ─── R3-α-WURZEL (31.8.2026, §17/§6.7) ──────────────────────────────────────
//
// Hier stand `R2E_FLAECHEN` — eine Liste von 22 Dateien mit der ausdrücklichen
// Erlaubnis zu wachsen. Genau das ist die Bauart, die B3 als Vakuum-Lücke
// ausgewiesen hat: eine Liste, die wachsen DARF, wächst nur, wenn jemand
// hinschaut. Gemessen am 31.8.2026 stand ausserhalb der Liste ein «(CHF,
// optional)» im Label (`ErbteilungForm`) und zwei rohe `type="date"`
// (`EntscheidFilter`, `BezugZeitWahl`) — der Wächter war grün.
//
// Die Sonden fegen jetzt die App. Ausgenommen bleibt nur, was seine Begründung
// AM FUNDORT trägt; `pruefeAusnahmen` liest sie dort wörtlich nach.

const quelle = (p: string) => readFileSync(p, 'utf8');

describe('R2-E/F1-1 — kein natives type="date" in der App (App-weit)', () => {
  /**
   * Die zwei Filter-Flächen, die nativ bleiben. Der Unterschied ist nicht
   * Geschmack, sondern der Grund des Wächters: F1-1 schützt Felder, die ein
   * FRISTAUSLÖSENDES Ereignis tragen (dort ist MM/DD/YYYY ein Rechtsfehler).
   * Ein Korpus-/Zeitachsen-FILTER trägt keinen Wert in eine Engine; er blendet
   * eine Liste ein und aus, und das Haus-Feld brächte in die 28-px-Filterzeile
   * ein Kalender-Popover samt `pr-11`-Reserve mit.
   */
  const AUSNAHMEN = [
    { datei: 'components/rechtsprechung/EntscheidFilter.tsx', begruendung: 'R2-E/F1-1-AUSNAHME (R3-α, 31.8.2026): Filter, kein fristauslösendes Feld' },
    { datei: 'components/verzahnung/BezugZeitWahl.tsx', begruendung: 'R2-E/F1-1-AUSNAHME (R3-α, 31.8.2026): Filter, kein fristauslösendes Feld' },
  ] as const;

  it('jede Ausnahme trägt ihre Begründung am Fundort', () => {
    expect(() => pruefeAusnahmen(AUSNAHMEN)).not.toThrow();
  });

  it('sonst benutzt jede Fläche DatumsFeld statt <input type="date">', () => {
    const erlaubt = pruefeAusnahmen(AUSNAHMEN);
    const funde = alleTsx()
      .filter((d) => !erlaubt.has(rel(d)))
      .filter((d) => /type=["']date["']/.test(liesOhneKommentare(d)))
      .map(rel);
    expect(
      funde,
      '<input type="date"> rendert in der Browser-Locale (US: MM/DD/YYYY) — '
      + 'stattdessen <DatumsFeld value={iso} onChange={…} /> (Wert bleibt ISO)',
    ).toEqual([]);
  });
});

describe('R2-E/F1-6 — «optional» steht in der Prop, nicht im Label-Text (App-weit)', () => {
  it('kein «(optional)» in einem Field-Label', () => {
    const funde: string[] = [];
    for (const d of alleTsx()) {
      const labels = [...liesOhneKommentare(d).matchAll(/<Field\s+label=(\{`[^`]*`\}|"[^"]*")/g)]
        .map((m) => m[1])
        .filter((l) => /optional/i.test(l));
      for (const l of labels) funde.push(`${rel(d)} · ${l}`);
    }
    expect(
      funde,
      '«optional» gehört in die Field-Prop (rendert « · optional»), nicht in den Label-Text',
    ).toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die Vorher-Form', () => {
    const vorher = '<Field label="Nachlass (CHF, optional)"';
    expect(/<Field\s+label=("[^"]*")/.exec(vorher)![1]).toMatch(/optional/i);
  });
});

describe('R2-E/F1-10 — «Kopiert ✓» rendert nur der geteilte KopierButton (App-weit)', () => {
  // KEINE Ausnahme mehr (R3-α, 31.8.2026): die frühere Liste `NOCH_EIGEN`
  // führte `src/pages/Kontakt.tsx` «mit Ablaufdatum». Ein Ablaufdatum, das
  // niemand einlöst, ist eine Dauerausnahme — die Fläche ist statt dessen
  // EINGEZOGEN (KopierButton mit `className="lc-btn-outline"`, Beschriftung
  // und Quittung unverändert). §17-Gegengewicht: einziehen schlägt bewachen.
  it('kein zweiter Renderer der Erfolgs-Beschriftung (App-weit, ausnahmslos)', () => {
    const fremde = alleQuellen()
      .filter((d) => rel(d) !== 'components/vorlagen/ui.tsx')
      .filter((d) => liesOhneKommentare(d).includes('Kopiert ✓'))
      .map(rel);
    expect(
      fremde,
      'Erfolgs-Beschriftung «Kopiert ✓» nur im KopierButton (src/components/vorlagen/ui.tsx)',
    ).toEqual([]);
  });
});

// ─── R3-α/B3-9 · EINE Kopier-Verweildauer ───────────────────────────────────
//
// GEMESSEN (Finder-Bericht B3, 31.8.2026): dieselbe Rückmeldung — «Kopiert ✓»,
// dann zurück in den Ruhezustand — lief mit DREI Verweildauern: 1500 ms
// (GerichtszitatForm, Dokumentmappe, ArtikelLeser), 1600 ms (useKopieren,
// LinkTeilenButton), 2000 ms (useWizardState, Kontakt, EntscheidLeser). Die
// Zahl ist eine Design-Entscheidung («wie lange bleibt eine Quittung stehen»)
// und stand achtmal da. Kanon ist die Zahl des geteilten Hooks (1600 ms); sie
// liegt seit R3-α als `KOPIER_DAUER_MS` genau einmal in `useKopieren.ts`.
describe('R3-α/B3-9 — die Kopier-Quittung steht überall gleich lang', () => {
  it('kein Rücksetz-Timer einer Kopier-Quittung trägt eine eigene Zahl', () => {
    const funde: string[] = [];
    for (const d of alleQuellen()) {
      if (rel(d) === 'components/useKopieren.ts') continue; // die eine Definition
      for (const m of liesOhneKommentare(d).matchAll(/setKopiert\([^)]*\)\s*,\s*([^)]+)\)/g)) {
        if (!/KOPIER_DAUER_MS/.test(m[1])) funde.push(`${rel(d)} · ${m[1].trim()}`);
      }
    }
    expect(funde, 'Verweildauer als eigene Zahl statt KOPIER_DAUER_MS (useKopieren.ts)').toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die drei Vorher-Formen', () => {
    for (const vorher of [
      'setTimeout(() => setKopiert(false), 1500);',
      'kopierTimer.current = setTimeout(() => setKopiert(false), 2000);',
      'window.setTimeout(() => setKopiert(\'\'), 1500);',
    ]) {
      const m = [...vorher.matchAll(/setKopiert\([^)]*\)\s*,\s*([^)]+)\)/g)];
      expect(m.length, vorher).toBe(1);
      expect(/KOPIER_DAUER_MS/.test(m[0][1]), vorher).toBe(false);
    }
  });

  it('die Zahl ist genau einmal definiert', () => {
    const definitionen = alleQuellen()
      .filter((d) => /export const KOPIER_DAUER_MS/.test(quelle(d)))
      .map(rel);
    expect(definitionen).toEqual(['components/useKopieren.ts']);
  });
});

describe('R2-E — der Wert-Vertrag der Bausteine bleibt unverändert', () => {
  it('DatumsFeld: ISO rein, TT.MM.JJJJ auf dem Schirm (F1-1)', () => {
    const html = renderToString(<DatumsFeld value="2026-06-01" onChange={() => {}} />);
    expect(html, 'die Anzeige ist schweizerisch').toContain('value="01.06.2026"');
    expect(html, 'kein natives Datumsfeld mehr').not.toContain('type="date"');
    expect(html, 'das Eingabemuster steht im Feld').toContain('placeholder="TT.MM.JJJJ"');
  });

  it('BetragsFeld: Rohwert rein, Schweizer Gruppierung auf dem Schirm (F1-7)', () => {
    // Der Rohwert-Vertrag ist der Punkt: das Schema bekommt weiterhin die
    // nackte Zahl, `fmtCHF`/`zahl` normalisieren Apostrophe ohnehin.
    expect(renderToString(<BetragsFeld value="100000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
    expect(renderToString(<BetragsFeld value="100'000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
  });

  it('Field verknüpft auch das zusammengesetzte DatumsFeld mit seinem Label (F1-2)', () => {
    const html = renderToString(
      <Field label="Zugang Kündigung"><DatumsFeld value="2026-06-01" onChange={() => {}} /></Field>,
    );
    const labelId = html.match(/id="([^"]+)-label"/)?.[1];
    expect(labelId, 'das Label trägt eine id').toBeTruthy();
    expect(html, 'das innere Eingabefeld zeigt darauf').toContain(`aria-labelledby="${labelId}-label"`);
  });

  it('Field: «optional» rendert als Nachsatz am Label (F1-6)', () => {
    const html = renderToString(<Field label="Zustellart" optional><input /></Field>);
    expect(html).toContain('· optional');
  });

  it('KopierButton: Gegenstand im Label, Kanon-Optik (F1-10)', () => {
    const html = renderToString(<KopierButton text="x" gegenstand="Ergebnis" />);
    expect(html, 'der Knopf sagt, WAS kopiert wird').toContain('Ergebnis kopieren');
    expect(html, 'Kanon-Optik lc-btn-outline lc-btn-sm').toContain('class="lc-btn-outline lc-btn-sm"');
  });
});
