import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LeserKopf } from '../pages/gesetz-leser/v3/LeserKopf';
import { LeserSeitenleiste } from '../pages/gesetz-leser/v3/LeserSeitenleiste';
import { UebersichtBox } from '../pages/gesetz-leser/v3/UebersichtBox';
import { SuchSprungFeld } from '../pages/gesetz-leser/v3/SuchSprungFeld';
import type { KopfStufe } from '../pages/gesetz-leser/v3/kopfStufen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ─── Vertrags-Tests für die reinen V3-Bauteile (Auflage David 16.8.2026) ────
//
// Testtechnik wie im Repo üblich (Node-Env, KEIN jsdom/Testing-Library — beide
// sind hier nicht installiert, `npx vitest run` bricht sonst mit einem
// Auflösungsfehler ab, geprüft 16.8.2026): `renderToString` für die
// Markup-Zusicherungen (Reihenfolge, An-/Abwesenheit von Elementen), exakt das
// Muster aus `NormPopover.test.tsx` / `gesetz-leser-uebersicht-s6.test.tsx`.
//
// AUSNAHME `SuchSprungFeld` — Enter/Escape: die Entscheidlogik steckt (anders
// als bei `NormPopover`s `istSchliessTaste`) NICHT in einer exportierten
// reinen Funktion, sondern inline im `onKeyDown`-Prop des `<input>`. Ohne
// jsdom lässt sich kein echtes Tastatur-Ereignis auslösen. Statt die Logik im
// Test NACHZUBAUEN (das prüfte nur die Kopie, nie das Original — genau das
// Gegenteil von §6.7), wird der ECHTE, im Render gebundene `onKeyDown`-Callback
// abgegriffen: `react/jsx-(dev-)runtime` wird transparent umhüllt (Pass-
// Through, keine Verhaltensänderung), und jeder Aufruf mit `type === 'input'`
// wird mitgeschnitten. Der eingefangene Callback ist exakt die Closure, die
// die Komponente gebaut hat — der Test ruft sie direkt mit einem
// Mock-Event `{ key, preventDefault }` auf, wie es `istSchliessTaste(...)` in
// `NormPopover.test.tsx` mit Klartext-Objekten vormacht.

const eingefangeneInputs: Record<string, unknown>[] = [];

vi.mock('react/jsx-runtime', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const wrap = (fn: (...a: unknown[]) => unknown) => (type: unknown, props: unknown, ...rest: unknown[]) => {
    if (type === 'input') eingefangeneInputs.push(props as Record<string, unknown>);
    return fn(type, props, ...rest);
  };
  return { ...mod, jsx: wrap(mod.jsx as never), jsxs: wrap(mod.jsxs as never) };
});
vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const wrap = (fn: (...a: unknown[]) => unknown) => (type: unknown, props: unknown, ...rest: unknown[]) => {
    if (type === 'input') eingefangeneInputs.push(props as Record<string, unknown>);
    return fn(type, props, ...rest);
  };
  return { ...mod, jsxDEV: wrap(mod.jsxDEV as never) };
});

beforeEach(() => { eingefangeneInputs.length = 0; });

// ═══ LeserKopf ═══════════════════════════════════════════════════════════

const ERLASS: BrowseErlass = {
  key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', sr: '220',
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'bund/OR.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'https://x', fassungsToken: 'x',
  pdfPfad: null,
};

function renderKopf(props: Partial<Parameters<typeof LeserKopf>[0]> & { stufe: KopfStufe }) {
  return renderToString(
    <MemoryRouter>
      <LeserKopf erlass={ERLASS} aktArtikel="Art. 429" fussnotenAnzahl={3} {...props} />
    </MemoryRouter>,
  );
}

describe('LeserKopf — Kürzel, laufender Artikel, Ansicht-Öffner sind IMMER da', () => {
  it.each<KopfStufe>(['voll', 'kompakt', 'mini'])('Stufe "%s": alle drei Kernelemente stehen', (stufe) => {
    const html = renderKopf({ stufe });
    expect(html).toContain('data-v3-kopf-kuerzel');
    expect(html).toContain('OR');
    expect(html).toContain('data-v3-kopf-artikel');
    expect(html).toContain('Art. 429');
    expect(html).toContain('data-v3-ansicht');
  });
});

describe('LeserKopf — «Gesetze» und der Volltitel fallen unter 900 px', () => {
  it('Stufe "voll": Gesetze-Krume UND Volltitel sind da', () => {
    const html = renderKopf({ stufe: 'voll' });
    expect(html).toContain('>Gesetze<');
    expect(html).toContain('Obligationenrecht');
  });

  it('Stufe "kompakt": beides ist weg', () => {
    const html = renderKopf({ stufe: 'kompakt' });
    expect(html).not.toContain('>Gesetze<');
    expect(html).not.toContain('Obligationenrecht');
  });

  it('Stufe "mini": beides bleibt weg', () => {
    const html = renderKopf({ stufe: 'mini' });
    expect(html).not.toContain('>Gesetze<');
    expect(html).not.toContain('Obligationenrecht');
  });
});

describe('LeserKopf — panelOeffner-Slot', () => {
  it('gesetzt: der Slot rendert seinen Inhalt', () => {
    const html = renderKopf({ stufe: 'voll', panelOeffner: <span data-panel-marker>PANEL</span> });
    expect(html).toContain('data-panel-marker');
    expect(html).toContain('PANEL');
  });

  it('NICHT gesetzt: kein leerer Kasten an seiner Stelle — die Griffe-Zeile geht direkt in den Ansicht-Öffner über', () => {
    const html = renderKopf({ stufe: 'voll' });
    expect(html).not.toContain('data-panel-marker');
    // Direkter Übergang von der Griffe-Leiste zum LeserAnsichtV3-Wrapper (kein
    // Zwischen-Element): das ist die konkrete Markup-Signatur von "nichts".
    expect(html).toMatch(/gap-1 sm:gap-1\.5"><div class="relative inline-flex">/);
  });
});

// ═══ LeserSeitenleiste ═══════════════════════════════════════════════════

function renderLeiste(props: Partial<Parameters<typeof LeserSeitenleiste>[0]> = {}) {
  return renderToString(
    <LeserSeitenleiste
      baum={<div data-marker-baum>BAUM</div>}
      onAlleAuf={() => {}} onAlleZu={() => {}} onAnfang={() => {}} alleOffen={false}
      {...props}
    />,
  );
}

describe('LeserSeitenleiste — feste Dokument-Reihenfolge', () => {
  it('Übersicht → Feld → Baumkopf → Baum → Extra', () => {
    const html = renderLeiste({
      uebersicht: <div data-marker-u>U</div>,
      suchFeld: <div data-marker-f>F</div>,
      extra: <div data-marker-e>E</div>,
    });
    const iU = html.indexOf('data-marker-u');
    const iF = html.indexOf('data-marker-f');
    const iBaumkopf = html.indexOf('data-v3-leiste-baumkopf');
    const iB = html.indexOf('data-marker-baum');
    const iE = html.indexOf('data-marker-e');
    expect([iU, iF, iBaumkopf, iB, iE].every((i) => i >= 0)).toBe(true);
    expect(iU).toBeLessThan(iF);
    expect(iF).toBeLessThan(iBaumkopf);
    expect(iBaumkopf).toBeLessThan(iB);
    expect(iB).toBeLessThan(iE);
  });

  it('suchFeld={undefined} (Sheet-Fall): [data-v3-leiste-feld] fehlt GANZ', () => {
    const html = renderLeiste({ uebersicht: <div data-marker-u>U</div>, suchFeld: undefined });
    expect(html).not.toContain('data-v3-leiste-feld');
  });

  it('extra ungesetzt: kein data-v3-leiste-extra im Markup', () => {
    const html = renderLeiste({});
    expect(html).not.toContain('data-v3-leiste-extra');
  });

  it('extra gesetzt: erscheint (Gegenprobe zur vorigen Zeile)', () => {
    const html = renderLeiste({ extra: <div data-marker-e>E</div> });
    expect(html).toContain('data-v3-leiste-extra');
    expect(html).toContain('data-marker-e');
  });
});

// ═══ UebersichtBox ═══════════════════════════════════════════════════════

describe('UebersichtBox — zu im Grundzustand, Zusammenfassung bleibt im DOM', () => {
  it('<details> trägt KEIN `open`-Attribut', () => {
    const html = renderToString(
      <UebersichtBox zusammenfassung="SR 210 · 480 Artikel · Stand 01.01.2026">
        <div>Inhalt</div>
      </UebersichtBox>,
    );
    expect(html).toContain('data-v3-uebersicht');
    expect(/<details[^>]*\bopen\b[^>]*>/i.test(html)).toBe(false);
  });

  it('die Zusammenfassung steht im DOM (Ctrl+F/Screenreader, §8) — trotz zugeklappt', () => {
    const html = renderToString(
      <UebersichtBox zusammenfassung="SR 210 · 480 Artikel · Stand 01.01.2026">
        <div>Inhalt</div>
      </UebersichtBox>,
    );
    expect(html).toContain('SR 210 · 480 Artikel · Stand 01.01.2026');
    expect(html).toContain('data-v3-uebersicht-zeile');
  });

  it('die Warnung steht VOR dem zugeklappten Kinder-Block, nicht darin verschachtelt', () => {
    const html = renderToString(
      <UebersichtBox zusammenfassung="…" warnung={<span data-marker-warnung>nicht konsolidiert</span>}>
        <div>Inhalt</div>
      </UebersichtBox>,
    );
    const iWarnung = html.indexOf('data-marker-warnung');
    // Der Kinder-Wrapper trägt die feste Klasse `border-t border-line px-2 py-2`
    // (Quelle: UebersichtBox.tsx) — die Warnung muss VOR dessen Öffnungstag
    // stehen, sonst wäre sie IN den Kindern verschachtelt statt eine eigene
    // Zeile davor.
    const iKinderWrapper = html.indexOf('class="border-t border-line px-2 py-2"');
    expect(iWarnung).toBeGreaterThan(-1);
    expect(iKinderWrapper).toBeGreaterThan(-1);
    expect(iWarnung).toBeLessThan(iKinderWrapper);
  });

  it('ohne warnung-Prop: keine Warn-Zeile im Markup', () => {
    const html = renderToString(
      <UebersichtBox zusammenfassung="…"><div>Inhalt</div></UebersichtBox>,
    );
    expect(html).not.toContain('data-marker-warnung');
  });
});

// ═══ SuchSprungFeld ══════════════════════════════════════════════════════

describe('SuchSprungFeld — Sprung-Hinweis folgt der Auflösbarkeit', () => {
  it('auflösbare Eingabe: der Sprung-Hinweis erscheint', () => {
    const html = renderToString(
      <SuchSprungFeld wert="429" setzeWert={() => {}} onSprung={() => {}} loeseArtikel={() => '429_tok'} />,
    );
    expect(html).toContain('data-v3-sprung-hinweis');
    expect(html).toContain('429');
  });

  it('NICHT auflösbare Eingabe: KEIN Sprung-Hinweis', () => {
    const html = renderToString(
      <SuchSprungFeld wert="Kündigung" setzeWert={() => {}} onSprung={() => {}} loeseArtikel={() => null} />,
    );
    expect(html).not.toContain('data-v3-sprung-hinweis');
  });

  it('fehlt `loeseArtikel` (Snapshot noch nicht da): KEIN Sprung-Hinweis — reine Suche (§8)', () => {
    const html = renderToString(
      <SuchSprungFeld wert="429" setzeWert={() => {}} onSprung={() => {}} />,
    );
    expect(html).not.toContain('data-v3-sprung-hinweis');
  });
});

describe('SuchSprungFeld — Enter springt, Escape leert und springt NICHT', () => {
  it('Enter bei auflösbarem Token ruft onSprung(token) auf', () => {
    const onSprung = vi.fn();
    const setzeWert = vi.fn();
    renderToString(
      <SuchSprungFeld wert="429" setzeWert={setzeWert} onSprung={onSprung} loeseArtikel={() => '429_tok'} />,
    );
    expect(eingefangeneInputs.length).toBe(1);
    const onKeyDown = eingefangeneInputs[0].onKeyDown as (e: { key: string; preventDefault: () => void }) => void;
    expect(typeof onKeyDown).toBe('function');
    onKeyDown({ key: 'Enter', preventDefault: () => {} });
    expect(onSprung).toHaveBeenCalledExactlyOnceWith('429_tok');
    expect(setzeWert).not.toHaveBeenCalled();
  });

  it('Escape ruft NUR setzeWert(\'\') — kein Sprung, auch wenn ein Token vorliegt', () => {
    const onSprung = vi.fn();
    const setzeWert = vi.fn();
    renderToString(
      <SuchSprungFeld wert="429" setzeWert={setzeWert} onSprung={onSprung} loeseArtikel={() => '429_tok'} />,
    );
    // `stopPropagation` gehoert seit dem B1-Nachzug dazu: im Sheet laegen sonst
    // «Feld leeren» und «Sheet schliessen» auf demselben Tastendruck.
    const onKeyDown = eingefangeneInputs[0].onKeyDown as (e: { key: string; preventDefault: () => void; stopPropagation: () => void }) => void;
    let gestoppt = false;
    onKeyDown({ key: 'Escape', preventDefault: () => {}, stopPropagation: () => { gestoppt = true; } });
    expect(gestoppt, 'Escape wird weitergereicht — das Sheet schliesst mit').toBe(true);
    expect(setzeWert).toHaveBeenCalledExactlyOnceWith('');
    expect(onSprung).not.toHaveBeenCalled();
  });

  it('Enter OHNE auflösbaren Token ruft nichts auf (kein Token, kein Sprung)', () => {
    const onSprung = vi.fn();
    const setzeWert = vi.fn();
    renderToString(
      <SuchSprungFeld wert="Kündigung" setzeWert={setzeWert} onSprung={onSprung} loeseArtikel={() => null} />,
    );
    const onKeyDown = eingefangeneInputs[0].onKeyDown as (e: { key: string; preventDefault: () => void }) => void;
    onKeyDown({ key: 'Enter', preventDefault: () => {} });
    expect(onSprung).not.toHaveBeenCalled();
    expect(setzeWert).not.toHaveBeenCalled();
  });
});
