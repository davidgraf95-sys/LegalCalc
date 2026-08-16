// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ─── LESER-SCHRIFTSKALA (David-Anmerkung 16.8.2026, Punkt 4) ─────────────────
//
// Geprüft wird der VERTRAG des Stufen-Feldes im geteilten Leser-Store, nicht die
// Darstellung: Persistenz, Whitelist beim Laden, Round-Trip und das Attribut am
// <html>. Dass die Stufe wirklich NUR den Normtext vergrössert und Kopfzeile wie
// Seitenleiste stehen lässt, beweist die Browser-Spec
// `e2e/leser-v3-schriftskala.e2e.ts` — das kann ohne echtes CSS niemand messen.
//
// Kein jsdom im Projekt (vite.config.ts: environment 'node'), darum werden
// `localStorage`/`window`/`document` minimal nachgebaut. Der Store liest den
// Speicher beim MODUL-Laden (`const start = … lade()`), deshalb steht vor jedem
// Fall ein `vi.resetModules()` + frischer dynamischer Import — sonst prüfte man
// den Zustand des vorherigen Falls.
//
// ROT ZU BEKOMMEN (§6.7): in `leserOptionen.ts` die Whitelist-Prüfung durch
// `const schrift = o.schrift as LeserSchrift` ersetzen (Fall «unbekannter Wert»
// und «Zahl» werden rot), `schrift: aktuellSchrift` aus `speichere()` entfernen
// (Round-Trip rot), oder in `index.css` einen der drei rem-Werte ändern
// (Spiegel-Fall rot).

interface FakeEl { attrs: Record<string, string>; setAttribute(k: string, v: string): void }

function baueUmgebung(gespeichert: string | null): { el: FakeEl; speicher: Map<string, string> } {
  const speicher = new Map<string, string>();
  if (gespeichert !== null) speicher.set('lm.leser.optionen', gespeichert);
  const ls = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => { speicher.set(k, v); },
    removeItem: (k: string) => { speicher.delete(k); },
  };
  const el: FakeEl = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  vi.stubGlobal('localStorage', ls);
  vi.stubGlobal('window', { localStorage: ls, addEventListener: () => {} });
  vi.stubGlobal('document', { documentElement: el });
  return { el, speicher };
}

async function ladeStore(gespeichert: string | null) {
  vi.resetModules();
  const umgebung = baueUmgebung(gespeichert);
  const optionen = await import('../pages/gesetz-leser/leserOptionen');
  const schrift = await import('../pages/gesetz-leser/leserSchrift');
  return { ...umgebung, optionen, schrift };
}

beforeEach(() => { vi.unstubAllGlobals(); });

describe('Leser-Schriftskala — Persistenz und Migration', () => {
  it('fehlendes Feld ⇒ Vorgabestufe «normal» (Bestands-Speicher vor dieser Änderung)', async () => {
    // Genau der Speicher, den jeder heutige Nutzer hat: Toggles und Bezugs-
    // Felder, aber kein `schrift`. Er darf weder werfen noch eine Stufe erfinden.
    const alt = JSON.stringify({ fussnoten: 'aus', verweise: 'an', leitfaelle: 'an', hist: 'chronologie' });
    const { optionen, el } = await ladeStore(alt);
    optionen.wendeLeserOptionenAn();
    expect(el.attrs['data-leserschrift']).toBe('normal');
    // Die anderen Felder desselben Speichers bleiben unberührt — der neue
    // Schlüssel darf keinen Alt-Zustand überschreiben (§8).
    expect(el.attrs['data-fussnoten']).toBe('aus');
    expect(el.attrs['data-histansicht']).toBe('chronologie');
  });

  it('unbekannter Wert ⇒ Vorgabestufe (nicht durchgereicht)', async () => {
    // Der gefährliche Fall: ein Wort, das es NIE gab (Alt-Skala, fremder Tab,
    // manipulierter Speicher). Durchgereicht landete es als
    // `data-leserschrift="riesig"` am <html>, wo keine Regel greift — der Nutzer
    // sähe eine Stufe, die es nicht gibt, und der Regler stünde falsch.
    const { optionen, el } = await ladeStore(JSON.stringify({ schrift: 'riesig' }));
    optionen.wendeLeserOptionenAn();
    expect(el.attrs['data-leserschrift']).toBe('normal');
  });

  it('falscher Typ und kaputter Speicher ⇒ Vorgabestufe, kein Wurf', async () => {
    for (const roh of [JSON.stringify({ schrift: 1.25 }), JSON.stringify({ schrift: null }), '{kein json']) {
      const { optionen, el } = await ladeStore(roh);
      expect(() => optionen.wendeLeserOptionenAn()).not.toThrow();
      expect(el.attrs['data-leserschrift'], `Speicher: ${roh}`).toBe('normal');
    }
  });

  it('jede der vier Stufen wird gelesen und ans <html> geschrieben', async () => {
    for (const stufe of ['normal', 'mittel', 'gross', 'sehr-gross'] as const) {
      const { optionen, el } = await ladeStore(JSON.stringify({ schrift: stufe }));
      optionen.wendeLeserOptionenAn();
      expect(el.attrs['data-leserschrift']).toBe(stufe);
    }
  });

  it('Round-Trip: setzen ⇒ speichern ⇒ neu laden ergibt dieselbe Stufe', async () => {
    const a = await ladeStore(null);
    a.optionen.setzeLeserSchrift('gross');
    expect(a.el.attrs['data-leserschrift']).toBe('gross');
    const geschrieben = a.speicher.get('lm.leser.optionen');
    expect(geschrieben, 'nichts geschrieben').toBeTruthy();
    expect(JSON.parse(geschrieben!).schrift).toBe('gross');

    const b = await ladeStore(geschrieben!);
    b.optionen.wendeLeserOptionenAn();
    expect(b.el.attrs['data-leserschrift']).toBe('gross');
  });

  it('Setzen lässt die übrigen Store-Felder unangetastet (EIN Speicher, §5)', async () => {
    const vorher = JSON.stringify({ fussnoten: 'aus', verweise: 'aus', leitfaelle: 'an', hist: 'aus', bezugKantone: ['BS'] });
    const { optionen, speicher } = await ladeStore(vorher);
    optionen.setzeLeserSchrift('sehr-gross');
    const o = JSON.parse(speicher.get('lm.leser.optionen')!);
    expect(o.schrift).toBe('sehr-gross');
    expect(o.fussnoten).toBe('aus');
    expect(o.verweise).toBe('aus');
    expect(o.hist).toBe('aus');
    expect(o.bezugKantone).toEqual(['BS']);
  });

  it('dieselbe Stufe noch einmal setzen weckt die Hörer NICHT (§15)', async () => {
    const { optionen } = await ladeStore(JSON.stringify({ schrift: 'mittel' }));
    // `setzeLeserSchrift` steigt bei Gleichheit früh aus; ein Re-Render der
    // Regler-Knöpfe bei einem Klick, der nichts ändert, wäre der Anfang genau
    // der Rendering-Kaskade, die der Store vermeidet.
    const el = (globalThis as unknown as { document: { documentElement: FakeEl } }).document.documentElement;
    el.attrs['data-leserschrift'] = 'MARKE';
    optionen.setzeLeserSchrift('mittel');
    expect(el.attrs['data-leserschrift']).toBe('MARKE');
  });
});

describe('Leser-Schriftskala — Regler', () => {
  it('Anschläge: «normal» kann nicht kleiner, «sehr-gross» nicht grösser', async () => {
    const { schrift } = await ladeStore(null);
    expect(schrift.nachbarStufe('normal', -1)).toBe('normal');
    expect(schrift.nachbarStufe('sehr-gross', 1)).toBe('sehr-gross');
    expect(schrift.nachbarStufe('normal', 1)).toBe('mittel');
    expect(schrift.nachbarStufe('sehr-gross', -1)).toBe('gross');
  });

  it('Hoch und wieder runter landet exakt auf der Ausgangsstufe', async () => {
    const { schrift, optionen } = await ladeStore(null);
    for (const s of optionen.SCHRIFT_STUFEN) {
      expect(schrift.nachbarStufe(schrift.nachbarStufe(s, 1), -1)).toBe(s === 'sehr-gross' ? 'gross' : s);
    }
  });

  it('Anzeigewert: die Vorgabestufe zeigt 100 %, die Skala steigt streng monoton', async () => {
    const { schrift, optionen } = await ladeStore(null);
    expect(schrift.schriftProzent('normal')).toBe(100);
    const werte = optionen.SCHRIFT_STUFEN.map((s) => schrift.schriftProzent(s));
    expect(werte).toEqual([100, 111, 122, 133]);
    for (let i = 1; i < werte.length; i++) expect(werte[i]).toBeGreaterThan(werte[i - 1]);
  });
});

describe('Leser-Schriftskala — Treue-Grenze und §5-Spiegel', () => {
  it('die Vorgabestufe verändert die Normtext-Grösse NICHT (byte-gleich)', async () => {
    const { schrift } = await ladeStore(null);
    // 1.125 rem IST `text-body-l` aus tailwind.config.js — die heutige Grösse.
    expect(schrift.SCHRIFT_REM.normal).toBe(1.125);
  });

  it('«normal» ist aus dem CSS-Selektor ausgenommen ⇒ keine Regel im Grundzustand (R6)', () => {
    const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
    // Der Selektor MUSS die Vorgabestufe ausschliessen. Ohne das `:not()` würde
    // auch im Grundzustand eine font-size-Deklaration emittiert — rechnerisch
    // derselbe Wert, aber die Zusage «Vorgabestufe rührt den Normtext nicht an»
    // wäre nur noch behauptet statt konstruktiv erzwungen (§6).
    expect(css).toContain('html[data-leserschrift]:not([data-leserschrift="normal"]) .lc-leser .nt-art-cv .text-body-l');
    expect(css).not.toMatch(/html\[data-leserschrift="normal"\]\s*\{[^}]*--lm-leser-schrift/);
  });

  it('die rem-Werte in index.css und SCHRIFT_REM stimmen überein', async () => {
    const { schrift } = await ladeStore(null);
    const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
    for (const stufe of ['mittel', 'gross', 'sehr-gross'] as const) {
      const treffer = new RegExp(`html\\[data-leserschrift="${stufe}"\\][^{]*\\{[^}]*--lm-leser-schrift:\\s*([0-9.]+)rem`)
        .exec(css);
      expect(treffer, `keine CSS-Regel für Stufe «${stufe}»`).not.toBeNull();
      expect(Number(treffer![1]), `Stufe «${stufe}»: CSS und SCHRIFT_REM laufen auseinander`)
        .toBe(schrift.SCHRIFT_REM[stufe]);
    }
  });

  it('die Regel ist auf den Normtext gescopt — nicht auf <html> und nicht auf die Hülle', () => {
    const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
    // DER Befund vom 16.8.2026: der alte Regler setzte `font-size` am <html>,
    // worauf die Kopfzeile mitwuchs (gemessen 16 px → 20.8 px). Genau das darf
    // hier nicht zurückkommen: JEDE Regel dieser Skala, die eine Schriftgrösse
    // setzt, muss bis in die Artikel-Hülle `.nt-art-cv` hinein gescopt sein.
    // Ohne Vorkommen wäre der Fall stumm grün — darum wird auch gezählt.
    let gepruefte = 0;
    for (const [, selektor, koerper] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!selektor.includes('data-leserschrift')) continue;
      if (!/font-size/.test(koerper)) continue;
      gepruefte++;
      expect(selektor.trim(), 'Schriftskala setzt font-size ausserhalb des Normtext-Scopes')
        .toContain('.nt-art-cv');
    }
    expect(gepruefte, 'keine font-size-Regel der Schriftskala gefunden').toBe(1);
  });
});
