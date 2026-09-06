import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { merkeBesuch } from '../lib/zuletztVerwendet';

// «Zuletzt geöffnet» — Overflow-Invariante @390 px.
//
// DEKLARIERTE ANPASSUNG (W2·24-DESIGN-IDENTITAET R3, 6.9.2026, §6.3): der
// waagrecht scrollende Chip-Streifen unter dem Hero ist die TEXTZEILE des
// Referenzbildes geworden («Zuletzt geöffnet: Art. 257d OR · …», Marke
// `.unter` in `abnahme/design-identitaet/vorschlag-freigegeben.html`). Die
// Invariante, um die es hier geht, ist DIESELBE und wird weiter geprüft: die
// Zeile darf die Seite auf 390 px nicht aufblasen. Nur ist der Weg dorthin ein
// anderer — nicht mehr «scrollt in sich», sondern «bricht um»; die tragenden
// Klassen des Scroll-Streifens (overflow-x-auto/min-w-0/flex-nowrap/w-max)
// gibt es darum nicht mehr, und ein Wächter, der sie verlangt, prüfte eine
// Form, die die Seite nicht mehr hat (§6.7).
//
// jsdom/SSR kennt kein Layout — geprüft wird darum, was am Markup messbar ist:
// der Vollkollaps bei leerem Speicher (kein Etikett über Leerraum, §8), die
// Verweise selbst, und dass keine Scroll-Achse mehr aufgemacht wird.
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

const render = () =>
  renderToString(
    <MemoryRouter>
      <ZuletztVerwendet />
    </MemoryRouter>,
  );

describe('ZuletztVerwendet — Textzeile statt Chip-Streifen', () => {
  it('leerer Speicher → kein Etikett, kein Verweis (§8)', () => {
    const html = render();
    expect(html).not.toContain('Zuletzt geöffnet');
    expect(html).not.toContain('<a ');
  });

  it('gefüllt: Etikett + je ein Verweis, ohne waagrechte Scroll-Achse', () => {
    // Mehr Einträge mit langen Titeln als in 390 px passen — die Zeile bricht
    // um, statt die Seite zu weiten.
    for (let i = 0; i < 6; i++) {
      merkeBesuch({ route: `/rechner/langer-titel-nummer-${i}`, titel: `Sehr langer Rechnername Nummer ${i}` });
    }
    const html = render();

    expect(html).toContain('Zuletzt geöffnet');
    const verweise = html.match(/<a /g) ?? [];
    expect(verweise.length, 'ein Verweis je Eintrag').toBe(6);
    for (let i = 0; i < 6; i++) {
      expect(html).toContain(`/rechner/langer-titel-nummer-${i}`);
    }

    // Keine Scroll-Achse mehr: weder der Container-Trick (overflow-x-auto +
    // min-w-0 + w-max) noch die 1-Zeilen-Kappung (flex-nowrap/whitespace-nowrap)
    // stehen noch da — sonst wäre die alte Form nur umbenannt.
    for (const klasse of ['overflow-x-auto', 'flex-nowrap', 'w-max', 'whitespace-nowrap', 'lc-scrollrand-x', 'lc-chip']) {
      expect(html, `${klasse} gehört zum Streifen, nicht zur Zeile`).not.toContain(klasse);
    }
  });
});
