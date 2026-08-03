// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setzeRuecksprung, leseRuecksprung, abonniereRuecksprung,
  ermittleLesePosition, springeZurueck,
} from '../pages/gesetz-leser/scrollAnker';

// W2·10-UI-NAV/R5: die Registry hinter dem Rücksprung-Chip. Die DOM-Anteile
// (ermittleLesePosition-Scan, Landung, Chip-Verhalten) beweist die e2e-Spec
// `leser-ruecksprung-r5-r7.e2e.ts` — hier steht der Vertrag, der OHNE DOM gilt:
// Abo-Mechanik und das Verhalten im SSR/Prerender (kein `document`).

describe('Rücksprung-Registry (R5)', () => {
  beforeEach(() => { setzeRuecksprung(null); });

  it('setzen und lesen: der zuletzt gesetzte Wert gilt', () => {
    expect(leseRuecksprung()).toBeNull();
    setzeRuecksprung({ token: '335_c', label: 'Art. 335c' });
    expect(leseRuecksprung()).toEqual({ token: '335_c', label: 'Art. 335c' });
    setzeRuecksprung(null);
    expect(leseRuecksprung()).toBeNull();
  });

  it('Abo wird bei JEDER Änderung geweckt — auch beim Löschen', () => {
    const gesehen: (ReturnType<typeof leseRuecksprung>)[] = [];
    const ab = abonniereRuecksprung((r) => gesehen.push(r));
    setzeRuecksprung({ token: '7', label: 'Art. 7' });
    setzeRuecksprung(null);
    ab();
    // Nach der Abmeldung darf nichts mehr ankommen (sonst hielte ein
    // unmontierter Chip die Registry am Leben).
    setzeRuecksprung({ token: '9', label: 'Art. 9' });
    expect(gesehen).toEqual([{ token: '7', label: 'Art. 7' }, null]);
  });

  it('mehrere Hörer bekommen dieselbe Meldung; einer meldet sich ab, der andere bleibt', () => {
    const a = vi.fn(); const b = vi.fn();
    const abA = abonniereRuecksprung(a);
    const abB = abonniereRuecksprung(b);
    setzeRuecksprung({ token: '1', label: 'Art. 1' });
    abA();
    setzeRuecksprung({ token: '2', label: 'Art. 2' });
    abB();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(2);
  });
});

describe('SSR/Prerender-Sicherheit (§3: die Logik läuft auch ohne Fenster)', () => {
  it('ermittleLesePosition ohne document ⇒ null statt Absturz', () => {
    expect(typeof document).toBe('undefined'); // Beweis, dass die Annahme trägt
    expect(ermittleLesePosition()).toBeNull();
  });

  it('springeZurueck ohne document ⇒ false, und die Registry bleibt unberührt', () => {
    setzeRuecksprung({ token: '5', label: 'Art. 5' });
    expect(springeZurueck({ token: '5', label: 'Art. 5' })).toBe(false);
    expect(leseRuecksprung()).toEqual({ token: '5', label: 'Art. 5' });
    setzeRuecksprung(null);
  });
});
