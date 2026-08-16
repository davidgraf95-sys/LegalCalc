import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { istSuchKuerzel } from '../pages/gesetz-leser/v3/suchKuerzel';

// ─── ⌘K / «/» im V3-Leser · Vorrang vor der Header-Suche (Bug-Check B1) ──────
//
// Der Befund vom 16.8.2026: `SuchSprungFeld` und `components/layout/
// HeaderSuche.tsx` hörten beide auf `window`-keydown. Der Header öffnete sein
// Dropdown synchron, V3 holte den Fokus per `requestAnimationFrame` — beide
// reagierten, das Dropdown stand offen über der Lesefläche. Und in der Lage
// «≥1024 px, Gliederungsspalte zugeklappt» war das V3-Feld gar nicht im DOM,
// ⌘K tat dort also NUR das Falsche.
//
// Zwei Sonden, weil zwei verschiedene Aussagen zu beweisen sind:
//  ① die ENTSCHEIDUNG (welcher Tastendruck gehört dem Leser) — reine Funktion,
//     an jeder Kombination prüfbar;
//  ② die MECHANIK der Vorrangregel (Capture + preventDefault hier, Rückzug
//     dort) — sie lebt in zwei Dateien und ist nur als Paar wahr. Quellensonde,
//     weil Vitest hier ohne DOM läuft (`environment: 'node'`); das Verhalten im
//     echten Browser prüft `e2e/leser-v3-suche-sprung.e2e.ts` (d).

describe('istSuchKuerzel — welcher Tastendruck gehört dem Leser', () => {
  it('⌘K und Ctrl+K gehören ihm — auch aus einem Eingabefeld heraus', () => {
    expect(istSuchKuerzel({ key: 'k', metaKey: true })).toBe(true);
    expect(istSuchKuerzel({ key: 'k', ctrlKey: true })).toBe(true);
    expect(istSuchKuerzel({ key: 'K', metaKey: true })).toBe(true);
    expect(istSuchKuerzel({ key: 'k', ctrlKey: true, target: { tagName: 'INPUT' } as unknown as EventTarget })).toBe(true);
  });

  it('«/» gehört ihm nur ausserhalb einer Eingabe — sonst ist es ein Zeichen', () => {
    expect(istSuchKuerzel({ key: '/' })).toBe(true);
    expect(istSuchKuerzel({ key: '/', target: null })).toBe(true);
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) {
      expect(istSuchKuerzel({ key: '/', target: { tagName: tag } as unknown as EventTarget }),
        `«/» in <${tag}> darf kein Kürzel sein`).toBe(false);
    }
    expect(istSuchKuerzel({
      key: '/', target: { tagName: 'DIV', isContentEditable: true } as unknown as EventTarget,
    }), '«/» in contenteditable darf kein Kürzel sein').toBe(false);
  });

  it('Alt-Kombinationen und alles Übrige gehören ihm NICHT', () => {
    expect(istSuchKuerzel({ key: 'k', metaKey: true, altKey: true })).toBe(false);
    expect(istSuchKuerzel({ key: '/', altKey: true })).toBe(false);
    expect(istSuchKuerzel({ key: 'k' })).toBe(false);
    expect(istSuchKuerzel({ key: 'j' })).toBe(false);
    expect(istSuchKuerzel({ key: 'Escape' })).toBe(false);
  });
});

describe('Die Vorrangregel lebt in zwei Dateien und ist nur als Paar wahr', () => {
  const KUERZEL = readFileSync('src/pages/gesetz-leser/v3/suchKuerzel.ts', 'utf8');
  const HEADER = readFileSync('src/components/layout/HeaderSuche.tsx', 'utf8');
  const FELD = readFileSync('src/pages/gesetz-leser/v3/SuchSprungFeld.tsx', 'utf8');
  const RAHMEN = readFileSync('src/pages/gesetz-leser/v3/LeserRahmenV3.tsx', 'utf8');

  it('V3 beansprucht die Taste in der CAPTURE-Phase und ruft dort preventDefault', () => {
    expect(KUERZEL).toContain("window.addEventListener('keydown', taste, { capture: true })");
    expect(KUERZEL).toContain("window.removeEventListener('keydown', taste, { capture: true })");
    // preventDefault VOR onKuerzel — sonst hinge der Vorrang daran, dass das
    // Öffnen der Fläche nicht wirft.
    const iPd = KUERZEL.indexOf('e.preventDefault()');
    const iCb = KUERZEL.indexOf('onKuerzel()');
    expect(iPd, 'preventDefault fehlt').toBeGreaterThan(-1);
    expect(iCb, 'onKuerzel wird nicht gerufen').toBeGreaterThan(-1);
    expect(iPd, 'preventDefault steht NACH onKuerzel').toBeLessThan(iCb);
  });

  it('die Header-Suche zieht sich bei bereits beanspruchtem Tastendruck zurück', () => {
    expect(HEADER, 'HeaderSuche prüft `defaultPrevented` nicht mehr — der Vorrang ist tot')
      .toContain('if (e.defaultPrevented) return;');
  });

  it('das Kürzel hängt NICHT mehr am Feld — es muss auch ohne Feld im DOM greifen', () => {
    expect(/addEventListener\('keydown'/.test(FELD),
      'SuchSprungFeld registriert wieder einen eigenen keydown-Listener').toBe(false);
    expect(RAHMEN, 'der Rahmen ruft das Kürzel-Hook nicht').toContain('useSuchSprungKuerzel(');
  });

  it('das Kürzel öffnet zuerst die Fläche: @≥1024 px die Spalte, darunter das Sheet', () => {
    // Der eigentliche B1-Nachzug: bei `tocOffen=false` gab es @xl kein Feld zu
    // fokussieren. Beide Zweige müssen im Rahmen stehen.
    expect(RAHMEN).toContain('if (umgebung.istXl) m.setTocOffen(true);');
    expect(RAHMEN).toContain('else m.setTocAuf(true);');
  });
});
