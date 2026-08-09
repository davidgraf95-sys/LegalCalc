/**
 * W2·19-GLIEDERUNG/S6 — Erlass-Übersicht (Bau-Spec §5.1, Zone C).
 *
 * Was hier bewiesen wird:
 *  (1) PLATZ: genau EINE Übersicht, in der 2-Spalten-Ansicht im Fluss des
 *      [data-toc]-Scrollers zwischen Baum und Kontext-Panel, sonst am Leseende
 *      über dem Panel. Die a32-Invariante «genau EIN Panel» (id="kontext-titel")
 *      bleibt unberührt — die Übersicht ist KEINE zweite Panel-Wurzel.
 *  (2) §15.2-CLS-RESERVIERUNG: die Konsolidierungs-Zeile steht in BEIDEN
 *      Zuständen (Warnung / Normalfall) und trägt die feste Zwei-Zeilen-Klasse.
 *      Ohne diesen Test könnte jemand den Normalfall «wegoptimieren» und damit
 *      den Lade-Shift wieder einbauen, den e2e/leser-kontext-e4 misst.
 *  (3) PROMOTION: `nichtKonsolidiert` erscheint zusätzlich als Warn-Block im
 *      Erlass-Kopf (Bau-Spec §5.1 Zeile 1) — und NICHT bei aufgehobenem Erlass.
 *  (4) §8-BELEG: der Teilerfassungs-Befund zu SG-3849 (Entscheid David 8.8.2026,
 *      Bau-Spec §11 Ziff. 2) wird gegen den committeten Snapshot GEMESSEN, damit
 *      er nicht still veralten kann. Snapshot-Zugriff ausschliesslich über
 *      `ladeNormFixture` mit dem REGISTER-Schlüssel (Lehre PR #478: macOS löst
 *      case-blind auf, der Linux-CI nicht).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { LeserVolltextInhalt } from '../pages/gesetz-leser/inhalt-volltext';
import { grundartMeta } from '../pages/gesetz-leser/helpers';
import {
  nurErlassdatum, erlassOrgan, istDatumsToken, teilerfassung, TEILERFASSUNG_BELEGE,
} from '../pages/gesetz-leser/erlassUebersichtDaten';
import { ErlassUebersicht } from '../pages/gesetz-leser/parts/ErlassUebersicht';
import { ladeNormFixture } from './fixtures/normtext-fixture';
import type { LinienProfil } from '../pages/gesetz-leser/linienAufbau';
import type { Sektion, ErlassKopf } from '../lib/normtext/browse';
import type { KantonSystematik } from '../lib/normtext/systematik';
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
const linien: LinienProfil = { strukturTiefe: 1, guideEbene: 1, dichteAmGuide: 1, autoGuide: true };
const kopf: ErlassKopf = {
  srNummer: '210', titel: 'Schweizerisches Zivilgesetzbuch',
  erlassdatum: 'vom 10. Dezember 1907 (Stand am 1. Juli 2026)',
  praeambel: [{ rolle: 'autor', text: 'Die Bundesversammlung der Schweizerischen Eidgenossenschaft,' }],
};

function render({ istXl, tocOffen, nichtKonsolidiert = false, aufgehoben = false }: {
  istXl: boolean; tocOffen: boolean; nichtKonsolidiert?: boolean; aufgehoben?: boolean;
}) {
  const noop = () => {};
  const e: BrowseErlass = aufgehoben ? { ...erlass, aufgehoben: { seit: '2026-01-01' } } : erlass;
  return renderToString(
    <MemoryRouter>
      <LeserVolltextInhalt
        erlass={e} eintraege={[eintrag]} struktur={null} kopf={kopf} currency={null}
        vorher={null} nachher={null} sektionen={[sektion]} ohneGliederung={[]}
        linien={linien} fussnotenAnzahl={0} meta={grundartMeta('ZGB')}
        internRefs={undefined} margAnzeige={new Map()} kantonSys={{}}
        basisPfad="/gesetze/bund/ZGB" renderSektion={() => null}
        imPane={false} istXl={istXl} overlayWurzel={null}
        treffer={[]} suche="" sucheDebounced="" setSuche={noop}
        tocBaumEl={<span>BAUM</span>} tocOffen={tocOffen} tocAuf={false}
        setTocOffen={noop} setTocAuf={noop} springeZuArtikel={noop}
        leitfaelleFuer={() => undefined} revisionFuer={() => undefined} historieFuer={() => undefined}
        reiterToast={false} setReiterToast={noop} reiterToastTimerRef={{ current: null }}
        tocDrawerRef={{ current: null }} leseRef={{ current: null }}
        navigate={noop as NavigateFunction}
        nichtKonsolidiert={nichtKonsolidiert}
      />
    </MemoryRouter>,
  );
}

const zaehle = (html: string, nadel: string) => (html.match(new RegExp(nadel, 'g')) ?? []).length;

describe('S6 — Platz der Erlass-Übersicht (Zone C)', () => {
  it('2-Spalten: genau EINE Übersicht, im [data-toc]-Fluss zwischen Baum und Panel', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(zaehle(html, 'data-erlass-uebersicht')).toBe(1);
    expect(html).toContain('data-toc-uebersicht');
    // Reihenfolge im Scroller: Baum → Übersicht → Kontext-Panel.
    expect(html.indexOf('data-toc-uebersicht')).toBeGreaterThan(html.indexOf('BAUM'));
    expect(html.indexOf('data-toc-kontext')).toBeGreaterThan(html.indexOf('data-toc-uebersicht'));
  });

  it('a32 bleibt unberührt: die Übersicht ist KEINE zweite Panel-Wurzel', () => {
    for (const fall of [{ istXl: true, tocOffen: true }, { istXl: false, tocOffen: true }]) {
      const html = render(fall);
      expect(zaehle(html, 'id="kontext-titel"')).toBe(1);
      expect(zaehle(html, 'data-erlass-uebersicht')).toBe(1);
    }
  });

  it('Mobil/eingeklappt: Übersicht am Leseende, kein Leisten-Slot', () => {
    for (const fall of [{ istXl: false, tocOffen: true }, { istXl: true, tocOffen: false }]) {
      const html = render(fall);
      expect(html).not.toContain('data-toc-uebersicht');
      expect(zaehle(html, 'data-erlass-uebersicht')).toBe(1);
      // «über dem Panel» (Bau-Spec §5.1): die Übersicht steht vor dem Panel.
      expect(html.indexOf('data-erlass-uebersicht')).toBeLessThan(html.indexOf('id="kontext-titel"'));
    }
  });
});

describe('S6 — §15.2: die Konsolidierungs-Zeile ist höhenfest reserviert', () => {
  it('Normalfall: Zeile steht mit der stets gültigen Aussage', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).toContain('lc-uebersicht-hinweis');
    expect(html).toContain('Massgeblich ist stets die amtliche Fassung');
    expect(html).not.toContain('noch nicht im gezeigten Text');
  });

  it('Warn-Fall: dieselbe Zeile, anderer Inhalt — kein zusätzliches Element', () => {
    const html = render({ istXl: true, tocOffen: true, nichtKonsolidiert: true });
    expect(zaehle(html, 'lc-uebersicht-hinweis')).toBe(1);
    expect(html).toContain('noch nicht im gezeigten Text');
    expect(html).not.toContain('Massgeblich ist stets die amtliche Fassung');
  });
});

// ── Promotion in den Erlass-Kopf ────────────────────────────────────────────
// Der Kopf-Hinweis ist KEIN zusätzliches Element, sondern der umgeschaltete
// Inhalt der ohnehin vorhandenen Hinweis-Zeile — genau deshalb kann er keinen
// Lade-Shift erzeugen (Messbeleg 9.8.2026: der erste Bauversuch mit eigenem
// `lc-notice-warn`-Block ergab in e2e/leser-kontext-e4 CLS 0.0227, Quelle das
// um 72 px verschobene 2-Spalten-Grid). Diese Tests nageln genau das fest:
// EINE Zeile, zwei Zustände, kein zweites Element.
describe('S6 — Promotion in den Erlass-Kopf (höhenfest, §15.2)', () => {
  const HINWEIS = 'Snapshot — massgeblich ist die amtliche Fassung';
  const WARN = '⚠ Änderung in Kraft, noch nicht konsolidiert';

  it('nichtKonsolidiert=true: die Hinweis-Zeile trägt die Warnung statt des Normalsatzes', () => {
    const html = render({ istXl: true, tocOffen: true, nichtKonsolidiert: true });
    expect(html).toContain(WARN);
    expect(html).not.toContain(HINWEIS);
    // Kein zusätzlicher Block — der wäre der gemessene CLS-Verursacher.
    expect(html).not.toContain('lc-notice-warn');
  });

  it('Beide Fassungen sind praktisch gleich lang — der Umbruch kann nicht kippen', () => {
    // Die Höhen-Invarianz hängt daran, dass die Metazeile nicht neu umbricht.
    // Ein künftiger, längerer Warntext soll hier auffallen, nicht erst im e2e.
    expect(Math.abs(WARN.length - HINWEIS.length)).toBeLessThanOrEqual(4);
    expect(WARN.length).toBeLessThanOrEqual(50);
  });

  it('nichtKonsolidiert=false: unveränderter Normalsatz (§8 — nichts behaupten)', () => {
    const html = render({ istXl: true, tocOffen: true });
    expect(html).toContain(HINWEIS);
    expect(html).not.toContain(WARN);
  });

  it('Aufgehobener Erlass: keine Konsolidierungs-Warnung (die Aufhebung ist die Aussage)', () => {
    const html = render({ istXl: true, tocOffen: true, nichtKonsolidiert: true, aufgehoben: true });
    expect(html).toContain('lc-notice-danger');
    expect(html).toContain(HINWEIS);
    expect(html).not.toContain(WARN);
  });

  // B3 (Bug-Check 9.8.2026, live auf /gesetze/bund/BMV): der Kopf zog die
  // Grenze, die ÜBERSICHT nicht — dort stand «In Kraft getretene Änderung …»
  // direkt neben dem Aufhebungs-Banner. Zwei Aussagen, die einander
  // widersprechen; der eigene S6-Test hatte die Absicht wörtlich dokumentiert,
  // ohne sie an dieser Stelle zu prüfen.
  it('B3: auch die ÜBERSICHT schweigt zur Konsolidierung, wenn der Erlass aufgehoben ist', () => {
    const html = render({ istXl: true, tocOffen: true, nichtKonsolidiert: true, aufgehoben: true });
    expect(html).not.toContain('noch nicht im gezeigten Text');
    // Die Zeile bleibt trotzdem stehen (Höhen-Reservierung, §15.2) …
    expect(zaehle(html, 'lc-uebersicht-hinweis')).toBe(1);
    // … mit der Aussage, die auch für einen aufgehobenen Erlass gilt.
    expect(html).toContain('Massgeblich ist stets die amtliche Fassung');
  });
});

// ── Bug-Check 9.8.2026 · B8/B9 ─────────────────────────────────────────────
describe('S6/Bug-Check — B8: kein leeres Stand-Versprechen', () => {
  it('Ohne erfassten Stand steht «nicht erfasst» statt «Stand:» ins Leere', () => {
    const html = renderToString(
      <MemoryRouter>
        <ErlassUebersicht erlass={{ ...erlass, stand: '' }} kopf={null} artikelAnzahl={3} />
      </MemoryRouter>,
    );
    expect(html).toContain('Stand:');
    expect(html).toContain('nicht erfasst');
  });

  it('Mit Stand bleibt der Wert unverändert', () => {
    const html = renderToString(
      <MemoryRouter>
        <ErlassUebersicht erlass={erlass} kopf={null} artikelAnzahl={3} />
      </MemoryRouter>,
    );
    expect(html).toContain('01.01.2026');
  });
});

describe('S6/Bug-Check — B9: Systematik-Platzhalter ist keine Aussage (§8)', () => {
  const kantonal = { ...erlass, ebene: 'kanton' as const, kanton: 'AG', sr: 'SAR 152.110' };
  const uebersicht = (kantonSys: Record<string, KantonSystematik>, e = kantonal) => renderToString(
    <MemoryRouter>
      <ErlassUebersicht erlass={e} kopf={null} artikelAnzahl={3} kantonSys={kantonSys} />
    </MemoryRouter>,
  );

  it('«Bereich SAR» erscheint NICHT — die Overline derselben Seite filtert ihn auch', () => {
    // Leere Systematik ⇒ die Auflösung fällt auf den neutralen Platzhalter
    // zurück. Vorher stand er als Sachgebiet im Mehr-Block (~80 Kantonserlasse).
    const html = uebersicht({ AG: { roots: [], index: {} } });
    expect(html).not.toContain('Bereich SAR');
    expect(html).not.toContain('Sachgebiet:');
  });

  it('Ein VERIFIZIERTES Sachgebiet erscheint weiterhin — der Filter schneidet nicht zu viel', () => {
    const html = uebersicht(
      { AG: { roots: [{ nummer: '6', name: 'Finanzrecht', kinder: [{ nummer: '64', name: 'Steuern' }] }], index: { '640100': ['6', '64'] } } },
      { ...kantonal, sr: '640.100' },
    );
    // (SSR setzt zwischen statischem Text und Interpolation einen Kommentar-
            //  Marker — darum die zwei Teile statt der zusammengesetzten Zeile.)
    expect(html).toContain('Sachgebiet:');
    expect(html).toContain('Finanzrecht › Steuern');
  });
});

describe('S6 — reine Ableitungen', () => {
  it('nurErlassdatum schneidet ausschliesslich den Stand-Zusatz', () => {
    expect(nurErlassdatum('vom 10. Dezember 1907 (Stand am 1. Juli 2026)')).toBe('vom 10. Dezember 1907');
    expect(nurErlassdatum('vom 30. März 1911')).toBe('vom 30. März 1911');
    // Keine gierige Klammer-Jagd: eine Klammer MITTEN im Datum bleibt stehen.
    expect(nurErlassdatum('vom 1. Januar 2000 (AS 2000 1)')).toBe('vom 1. Januar 2000 (AS 2000 1)');
  });

  it('erlassOrgan liest die autor-Zeile ohne Schluss-Komma', () => {
    expect(erlassOrgan(kopf)).toBe('Die Bundesversammlung der Schweizerischen Eidgenossenschaft');
    expect(erlassOrgan(null)).toBeNull();
    expect(erlassOrgan({ praeambel: [{ rolle: 'ingress', text: 'gestützt auf …' }] })).toBeNull();
  });

  it('istDatumsToken trennt Fedlex-Konsolidierungsdatum vom kantonalen Drift-Hash', () => {
    expect(istDatumsToken('20260101')).toBe(true);
    expect(istDatumsToken('9d33cd9629e68f3f15966a7506601829703209cbaa714bae04cdd7f62bd28e88')).toBe(false);
    expect(istDatumsToken('')).toBe(false);
  });
});

describe('S6 — §8-Teilerfassungs-Beleg (Entscheid David 8.8.2026, Bau-Spec §11 Ziff. 2)', () => {
  it('SG-3849 trägt den Hinweis «Auswahl, nicht vollständig»', () => {
    const beleg = teilerfassung('SG-3849');
    expect(beleg).toBeDefined();
    expect(beleg!.befund).toContain('Auswahl, nicht vollständig');
  });

  it('Der Befund stimmt mit dem committeten Snapshot überein — er kann nicht still veralten', () => {
    // Register-Schlüssel, nie Kürzel (Fixture-Regel, Bau-Spec §8-Kasten).
    const { eintraege } = ladeNormFixture('kanton', 'SG-3849');
    const nummern = eintraege
      .filter((e) => !/^Anhang/i.test(e.artikelLabel))
      .map((e) => Number.parseInt(e.artikel, 10))
      .filter((n) => Number.isFinite(n));
    // (a) Die Folge beginnt NICHT bei Art. 1.
    expect(nummern[0]).toBeGreaterThan(1);
    // (b) Sie ist lückenhaft — es fehlen Artikel zwischen den erfassten.
    const luecken = nummern.some((n, i) => i > 0 && n - nummern[i - 1] > 1);
    expect(luecken, 'Artikel-Folge ohne Lücken — Beleg überholt?').toBe(true);
    // (c) Anhang-Übergewicht: der Erlass-Text ist die Minderheit der Einträge.
    expect(nummern.length * 10).toBeLessThan(eintraege.length);
  });

  it('Kein anderer Erlass trägt (noch) einen Beleg — die Liste bleibt bewusst kurz', () => {
    expect(Object.keys(TEILERFASSUNG_BELEGE)).toEqual(['SG-3849']);
  });

  it('Der Hinweis steht OHNE Klick da (nicht hinter «Mehr»)', () => {
    const html = renderToString(
      <MemoryRouter>
        <ErlassUebersicht
          erlass={{ ...erlass, key: 'SG-3849', ebene: 'kanton', kanton: 'SG' }}
          kopf={null} artikelAnzahl={607} />
      </MemoryRouter>,
    );
    const vorDetails = html.slice(0, html.indexOf('<details'));
    expect(vorDetails).toContain('Auswahl, nicht vollständig');
  });
});
