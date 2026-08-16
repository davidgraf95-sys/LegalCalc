/**
 * W2·19-GLIEDERUNG · S9 — «☰-Knopf und Kontext-Zugang existieren künftig auch
 * bei sektionen.length === 0» (Bau-Spec §7, behebt Schwachstelle 8).
 *
 * ROT-BEWEIS: vor dieser Slice blendete `sektionen.length > 0` in
 * `inhalt-volltext.tsx` die GANZE Leiste aus (TOC-Spalte, mobiler ☰-Knopf,
 * Zone C) — jede Assertion unten wäre am unveränderten Code gescheitert (die
 * gesuchten Marker standen schlicht nicht im Markup). Ein Erlass OHNE
 * amtliche Gliederung (T4, 486 Erlasse: NHG, VMWG, …) ist genau der Fall, den
 * B2/B3 überhaupt erst behandeln — betrifft also den GRÖSSTEN Teil des
 * Korpus, nicht einen Rand.
 *
 * Baut auf demselben SSR-Render-Muster wie `gesetz-leser-uebersicht-s6.test.tsx`
 * (`LeserVolltextInhalt` direkt, ohne Netz/Fetch).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { LeserVolltextInhalt } from '../pages/gesetz-leser/inhalt-volltext';
import { grundartMeta } from '../pages/gesetz-leser/helpers';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

const erlass: BrowseErlass = {
  key: 'NHG', ebene: 'bund', kanton: null, kuerzel: 'NHG', titel: 'Natur- und Heimatschutzgesetz', sr: '451',
  rechtsgebiet: 'oeffentlich', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'bund/NHG.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'https://x', fassungsToken: '20260101',
  pdfPfad: null,
};
const eintrag: NormSnapshot = {
  id: 'bund/NHG/art_1', ebene: 'bund', quelle: 'NHG', erlass: 'NHG', artikel: '1', artikelLabel: 'Art. 1',
  bloecke: [{ absatz: '1', text: 'Der Bund erfüllt seine Aufgabe.' }],
  stand: '2026-01-01', quelleUrl: 'https://x', abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'x',
};

function render({ istXl, tocOffen, imPane = false }: { istXl: boolean; tocOffen: boolean; imPane?: boolean }) {
  const noop = () => {};
  return renderToString(
    <MemoryRouter>
      <LeserVolltextInhalt
        erlass={erlass} eintraege={[eintrag]} struktur={null} kopf={null} currency={null}
        vorher={null} nachher={null}
        // Der Kern des Rot-Beweises: KEINE Sektionen — T4-Ehrlichkeit (B2/B3).
        sektionen={[]} ohneGliederung={[eintrag]}
        gliederungsTiefe={0} fussnotenAnzahl={0} meta={grundartMeta('NHG')}
        internRefs={undefined} margAnzeige={new Map()} kantonSys={{}}
        basisPfad="/gesetze/bund/NHG" renderSektion={() => null}
        imPane={imPane} istXl={istXl} overlayWurzel={null}
        treffer={[]} suche="" sucheDebounced="" setSuche={noop}
        tocBaumEl={<p>Für diesen Erlass ist keine Gliederung erfasst.</p>}
        tocOffen={tocOffen} tocAuf={false}
        setTocOffen={noop} setTocAuf={noop} springeZuArtikel={noop}
        loeseArtikel={(x) => (x === '1' ? '1' : null)}
        leitfaelleFuer={() => undefined} revisionFuer={() => undefined} historieFuer={() => undefined}
        reiterToast={false} setReiterToast={noop} reiterToastTimerRef={{ current: null }}
        tocDrawerRef={{ current: null }} leseRef={{ current: null }}
        navigate={noop as NavigateFunction}
      />
    </MemoryRouter>,
  );
}

describe('S9 — Leiste bei sektionen.length===0 (T4: kein amtlicher Baum)', () => {
  it('Desktop (istXl, tocOffen): die 2-Spalten-TOC-Aside rendert trotzdem', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).toContain('data-toc="true"');
    expect(html).toContain('role="navigation"');
    expect(html).toContain('Für diesen Erlass ist keine Gliederung erfasst');
  });

  it('Desktop: Zone C (Erlass-Übersicht + Kontext-Panel) steht IM Fluss der Spalte', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).toContain('data-toc-uebersicht');
    expect(html).toContain('data-erlass-uebersicht');
    expect(html).toContain('data-toc-kontext');
  });

  it('Desktop, eingeklappt: der ☰-Wiedereinblender im Pane-Kopf erscheint', () => {
    // `imPane=true` + istXl + `!tocOffen` ist der einzige Pfad, in dem
    // LeserVolltextInhalt SELBST einen ☰-Knopf rendert (die Einzelansicht
    // trägt ihn über den globalen Inhalts-Kopf, inhalt-hooks.tsx — dort deckt
    // ihn kein SSR-Render dieser Komponente ab, siehe zweiten Test unten).
    const html = render({ istXl: true, tocOffen: false, imPane: true });
    expect(html).toContain('Gliederung einblenden');
  });

  it('Schmales Pane (nicht istXl): der mobile ☰-Umschalter erscheint', () => {
    const html = render({ istXl: false, tocOffen: true, imPane: true });
    expect(html).toContain('title="Gliederung"');
  });
});
