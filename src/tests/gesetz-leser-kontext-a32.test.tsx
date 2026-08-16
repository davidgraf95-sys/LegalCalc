/**
 * E4/A32 (David 16.7.2026, FAHRPLAN-GESETZES-UX §10.10) — Kontextfenster-Position.
 *
 * Befund: das KontextPanel sass am Gesetzes-ENDE der Lesespalte (schwer
 * auffindbar). Soll: in der 2-Spalten-Ansicht (istXl, Desktop/xl UND breites
 * Split-View-Pane) unterhalb der GLIEDERUNG in der TOC-Spalte
 * (`[data-toc-kontext]`, nach `[data-toc]`); die Gliederung bleibt primär.
 * Mobil/schmales Pane (kein TOC-Spalten-Layout) und bei eingeklappter
 * Gliederungsspalte bleibt der ehrlich sichtbare Platz das LESEENDE (nie im
 * Drawer versteckt). Es rendert IMMER genau EIN Panel (id="kontext-titel").
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { LeserVolltextInhalt } from '../pages/gesetz-leser/inhalt-volltext';
import { grundartMeta } from '../pages/gesetz-leser/helpers';
import type { Sektion } from '../lib/normtext/browse';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

const erlass: BrowseErlass = {
  key: 'ZGB', ebene: 'bund', kanton: null, kuerzel: 'ZGB', titel: 'Zivilgesetzbuch', sr: '210',
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'bund/ZGB.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'https://x', fassungsToken: '20260101',
  pdfPfad: null,
};
const eintrag: NormSnapshot = {
  id: 'bund/ZGB/art_1', ebene: 'bund', quelle: 'ZGB', erlass: 'ZGB', artikel: '1', artikelLabel: 'Art. 1',
  bloecke: [{ absatz: '1', text: 'Das Gesetz findet auf alle Rechtsfragen Anwendung.' }],
  stand: '2026-01-01', quelleUrl: 'https://x', abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'x',
};
const sektion: Sektion = { id: 'sek-0', ebene: 1, label: 'Erster Titel', kinder: [], artikel: [eintrag] };

function render({ istXl, tocOffen, imPane = false }: { istXl: boolean; tocOffen: boolean; imPane?: boolean }) {
  const noop = () => {};
  return renderToString(
    <MemoryRouter>
      <LeserVolltextInhalt
        erlass={erlass} eintraege={[eintrag]} struktur={null} kopf={null} currency={null}
        vorher={null} nachher={null} sektionen={[sektion]} ohneGliederung={[]}
        gliederungsTiefe={1} fussnotenAnzahl={0} meta={grundartMeta('ZGB')}
        internRefs={undefined} margAnzeige={new Map()} kantonSys={{}}
        basisPfad="/gesetze/bund/ZGB" renderSektion={() => null}
        imPane={imPane} istXl={istXl} overlayWurzel={null}
        treffer={[]} suche="" sucheDebounced="" setSuche={noop}
        tocBaumEl={<span>BAUM</span>} tocOffen={tocOffen} tocAuf={false}
        setTocOffen={noop} setTocAuf={noop} springeZuArtikel={noop}
        leitfaelleFuer={() => undefined} revisionFuer={() => undefined} historieFuer={() => undefined}
        reiterToast={false} setReiterToast={noop} reiterToastTimerRef={{ current: null }}
        tocDrawerRef={{ current: null }} leseRef={{ current: null }}
        navigate={noop as NavigateFunction}
      />
    </MemoryRouter>,
  );
}

const anzahlPanels = (html: string) => (html.match(/id="kontext-titel"/g) ?? []).length;

describe('A32 — Kontextfenster unterhalb der Gliederung (TOC-Spalte)', () => {
  it('2-Spalten (istXl + Gliederung offen): Panel in der TOC-Spalte, NACH dem Gliederungsbaum', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).toContain('data-toc-kontext');
    // Unterhalb der Gliederung: der Panel-Block folgt dem [data-toc]-Baum.
    expect(html.indexOf('data-toc-kontext')).toBeGreaterThan(html.indexOf('data-toc'));
    // Genau EIN Panel (nicht zusätzlich am Leseende).
    expect(anzahlPanels(html)).toBe(1);
  });

  it('Breites Split-View-Pane (imPane + istXl): derselbe TOC-Spalten-Platz', () => {
    const html = render({ istXl: true, tocOffen: true, imPane: true });
    expect(html).toContain('data-toc-kontext');
    expect(anzahlPanels(html)).toBe(1);
  });

  it('Mobil/schmal (kein istXl): Panel bleibt ehrlich sichtbar am LESEENDE, nie im Drawer', () => {
    const html = render({ istXl: false, tocOffen: true });
    expect(html).not.toContain('data-toc-kontext');
    expect(anzahlPanels(html)).toBe(1);
  });

  it('Gliederungsspalte eingeklappt (tocOffen=false): Rückfall ans Leseende, kein verstecktes Panel', () => {
    const html = render({ istXl: true, tocOffen: false });
    expect(html).not.toContain('data-toc-kontext');
    expect(anzahlPanels(html)).toBe(1);
  });
});

// ── E4-Korrektur (David-Feedback 25.7.2026): «also das kontextfenster soll
// gliederung nicht abschneiden. sie soll einfach unten an der gliederung
// stehen. aktuell schneidet es gliederung ab.» — Der frühere feste 33vh-Slot
// war ein GESCHWISTER des [data-toc]-Scrollers und klemmte dessen Sichtfenster
// ein (empirisch ZGB@1440: Gliederungs-Fenster 444px statt ~740px). Neu steht
// das Panel IM FLUSS INNERHALB des [data-toc]-Scrollers, unterhalb des Baums:
// die Gliederung behält ihr volles Sichtfenster, das Panel erreicht man, indem
// man die Gliederung zu Ende scrollt («einfach unten an der gliederung»). ──────
function tocInhalt(html: string): string {
  // Balancierter <div>-Scan: liefert den INNENinhalt des [data-toc]-Containers.
  const marke = html.indexOf('data-toc="true"');
  if (marke < 0) return '';
  const start = html.lastIndexOf('<div', marke);
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let tiefe = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    tiefe += m[0] === '</div>' ? -1 : 1;
    if (tiefe === 0) return html.slice(start, m.index);
  }
  return '';
}

describe('E4-Korrektur — Panel im Fluss INNERHALB des Gliederungs-Scrollers', () => {
  it('2-Spalten: [data-toc-kontext] liegt IM [data-toc]-Container (Fluss unter dem Baum)', () => {
    const html = render({ istXl: true, tocOffen: true });
    const inhalt = tocInhalt(html);
    expect(inhalt).toContain('BAUM');             // der Gliederungsbaum …
    expect(inhalt).toContain('data-toc-kontext'); // … und das Panel im selben Scroller
    // Panel NACH dem Baum (unten an der Gliederung, nie davor).
    expect(inhalt.indexOf('data-toc-kontext')).toBeGreaterThan(inhalt.indexOf('BAUM'));
  });

  it('Kein fester Höhen-Slot mehr: h-toc-kontext ist verschwunden (Gliederung nicht abgeschnitten)', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).not.toContain('h-toc-kontext');
  });
});
