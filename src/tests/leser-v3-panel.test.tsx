import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PANEL_REITER, gruppiereKanten, normZitat, oeffnerLabel, oeffnerName, shardGeladen, trefferZahl,
  zaehlerAttribut,
} from '../pages/gesetz-leser/v3/panelModell';
import { PANEL_DOCK_PX, kopfElemente, panelAlsSpalte } from '../pages/gesetz-leser/v3/kopfStufen';
import { PanelSachgebiet } from '../pages/gesetz-leser/v3/PanelSachgebiet';
import { belegung } from '../pages/gesetz-leser/parts/leserTastaturBelegung';
import type { Bezug } from '../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../lib/verzahnung/facetten';

// ─── Die rechnenden Zusagen des H3-Panels, ohne Browser (§3/§6) ──────────────
//
// Was hier steht, steht hier, weil es eine AUSSAGE ist und keine Optik: was am
// Öffner geschrieben wird, in welcher Reihenfolge die Reiter stehen, wie die
// Kanten gruppiert werden, ab welcher Breite das Panel andockt und wann der
// vierte Filter gar nicht existiert. Der Rest (Klick, Fokus, Layout) gehört in
// die vier e2e-Specs.

function kante(key: string, status: BezugStatus, datum = '2022-03-14'): Bezug {
  return {
    key,
    zitierung: key.toUpperCase(),
    regesteKurz: null,
    datum,
    gewicht: null,
    facetten: { status, ebene: status === 'kantonal' ? 'kanton' : 'bund', kanton: status === 'kantonal' ? 'BS' : 'CH', gericht: 'bger', quelltyp: 'entscheid' },
  } as unknown as Bezug;
}

describe('oeffnerLabel — §8: keine Zahl, die wir nicht haben', () => {
  it('unbekannt (null) ⇒ kein Zähler, nur das Wort', () => {
    expect(oeffnerLabel(null)).toBe('Rechtsprechung');
  });

  it('gewusste 0 ⇒ ebenfalls KEIN Zähler (kein leerer Zähler bei Kantonserlassen)', () => {
    expect(oeffnerLabel(0)).toBe('Rechtsprechung');
  });

  it('Singular und Plural sind getrennt — «1 Entscheide» wäre ein Grammatikfehler im Produkt', () => {
    expect(oeffnerLabel(1)).toBe('1 Entscheid');
    expect(oeffnerLabel(14)).toBe('14 Entscheide');
  });
});

describe('oeffnerName — der Accessible-Name sagt, WORAUF sich die Zahl bezieht', () => {
  it('nennt den Artikel, wenn eine Leseposition bekannt ist', () => {
    expect(oeffnerName(14, 'Art. 429')).toContain('zu Art. 429');
    expect(oeffnerName(14, 'Art. 429')).toContain('14 Entscheide');
  });

  it('ohne Leseposition kein erfundener Artikel', () => {
    expect(oeffnerName(null, null)).toBe('Rechtsprechung und Kontext öffnen');
  });

  it('die gewusste 0 wird ausgesprochen, obwohl der Zähler sie verschweigt', () => {
    // Sichtbar wäre «0 Entscheide» ein leerer Zähler; VORGELESEN ist die Auskunft
    // «keine Entscheide erfasst» genau die, die der Nutzer braucht (§8).
    expect(oeffnerName(0, 'Art. 5')).toContain('keine Entscheide erfasst');
  });
});

describe('zaehlerAttribut — das Attribut sagt dasselbe wie das Label', () => {
  // BEFUND beim ersten Lauf von `leser-v3-panel-facetten` (d), 17.8.2026: am
  // Kantonserlass stand sichtbar «Rechtsprechung», im Attribut aber «0» — zwei
  // Aussagen an einem Knopf. Die Sonde hält die Deckung fest.
  it('unbekannt und gewusste 0 ⇒ gar kein Attribut', () => {
    expect(zaehlerAttribut(null)).toBeUndefined();
    expect(zaehlerAttribut(0)).toBeUndefined();
  });

  it('jede Zahl, die das Label zeigt, steht auch im Attribut', () => {
    expect(zaehlerAttribut(1)).toBe(1);
    expect(zaehlerAttribut(14)).toBe(14);
  });

  it('Label und Attribut sind über den ganzen Wertebereich deckungsgleich', () => {
    for (const n of [null, 0, 1, 2, 99]) {
      const hatZahl = oeffnerLabel(n) !== 'Rechtsprechung';
      expect(zaehlerAttribut(n) !== undefined, `n = ${n}`).toBe(hatZahl);
    }
  });
});

describe('normZitat — zeichengleich mit dem Kurz-Zitat des Kerns', () => {
  it('Label + Kürzel, in dieser Reihenfolge, mit einem Leerzeichen', () => {
    expect(normZitat('Art. 429', 'StPO')).toBe('Art. 429 StPO');
  });

  it('Bereichs-Label bleibt unangetastet (der Kern liefert es fertig)', () => {
    expect(normZitat('Art. 226a–226d', 'ZGB')).toBe('Art. 226a–226d ZGB');
  });

  it('ohne Leseposition steht das Kürzel allein — nie ein erfundener Artikel', () => {
    expect(normZitat(null, 'StPO')).toBe('StPO');
  });
});

describe('gruppiereKanten — Rangordnung strukturell, nie nach Zähler', () => {
  it('ordnet die Klassen nach STATUS_RANG, unabhängig von der Eingabe-Folge', () => {
    const gruppen = gruppiereKanten([kante('a', 'kantonal'), kante('b', 'bge'), kante('c', 'bger')]);
    expect(gruppen.map(([s]) => s)).toEqual(['bge', 'bger', 'kantonal']);
  });

  it('erhält INNERHALB der Klasse die Shard-Ordnung (keine zweite Sortier-Wahrheit)', () => {
    const gruppen = gruppiereKanten([kante('neu', 'bge', '2024-01-01'), kante('alt', 'bge', '1990-01-01')]);
    expect(gruppen[0]?.[1].map((b) => b.key)).toEqual(['neu', 'alt']);
  });

  it('Klassen ohne Treffer erscheinen gar nicht (kein leerer Gruppenkopf)', () => {
    expect(gruppiereKanten([kante('a', 'bge')]).map(([s]) => s)).toEqual(['bge']);
    expect(gruppiereKanten([])).toEqual([]);
  });
});

describe('trefferZahl / shardGeladen — «lädt noch» ist nicht «leer»', () => {
  const leer = () => undefined;
  it('ohne geladenen Shard: null, nicht 0', () => {
    expect(shardGeladen({})).toBe(false);
    expect(trefferZahl(leer, false, '429')).toBeNull();
  });

  it('mit geladenem Shard und ohne Kante am Artikel: gewusste 0', () => {
    expect(shardGeladen({ bge: { dokumente: 3, kanten: 5 } })).toBe(true);
    expect(trefferZahl(leer, true, '429')).toBe(0);
  });

  it('ohne Leseposition bleibt es null — die Zahl gilt einem Artikel', () => {
    expect(trefferZahl(() => ({ kanten: [kante('a', 'bge')] }), true, null)).toBeNull();
  });

  it('zählt die GEFILTERTEN Kanten des Artikels', () => {
    expect(trefferZahl(() => ({ kanten: [kante('a', 'bge'), kante('b', 'bger')] }), true, '429')).toBe(2);
  });
});

describe('PANEL_REITER — eine Quelle für Ordnung und Beschriftung', () => {
  it('genau drei, in der Reihenfolge der Fragen am Artikel', () => {
    expect(PANEL_REITER.map((r) => r.id)).toEqual(['entscheide', 'aenderungen', 'materialien']);
  });

  it('jeder Reiter trägt Label UND erklärenden Titel (kein nackter Kurzname)', () => {
    for (const r of PANEL_REITER) {
      expect(r.label.length, r.id).toBeGreaterThan(2);
      expect(r.titel.length, r.id).toBeGreaterThan(10);
    }
  });
});

describe('Ä11 / PANEL_DOCK_PX — wo der Öffner steht und ab wann das Panel andockt', () => {
  it('auf `mini` trägt die Kopfzeile keinen Zähler (≤ 4 Elemente)', () => {
    expect(kopfElemente('mini').panel).toBe(false);
    expect(kopfElemente('kompakt').panel).toBe(true);
    expect(kopfElemente('voll').panel).toBe(true);
  });

  it('die Andock-Schwelle ist die gerechnete Summe der drei Spuren', () => {
    // 18 rem Gliederung + 2 rem + 40 rem Lesemass + 2 rem + 22 rem = 84 rem.
    expect(PANEL_DOCK_PX).toBe(84 * 16);
    expect(panelAlsSpalte(PANEL_DOCK_PX)).toBe(true);
    expect(panelAlsSpalte(PANEL_DOCK_PX - 1)).toBe(false);
    expect(panelAlsSpalte(1280)).toBe(false);
  });
});

describe('PanelSachgebiet — vorgesehen, aber ohne Daten kein Steuerelement', () => {
  it('leere Gebietsliste ⇒ NICHTS im DOM (§13 F4)', () => {
    expect(renderToStaticMarkup(<PanelSachgebiet gebiete={[]} gewaehlt={[]} onGebiete={() => {}} />)).toBe('');
  });

  it('mit Daten ⇒ der Streifen steht fertig da (Positiv-Sonde: der Anschluss trägt)', () => {
    const html = renderToStaticMarkup(
      <PanelSachgebiet gebiete={['Strafrecht', 'Zivilrecht']} gewaehlt={['Strafrecht']} onGebiete={() => {}} />,
    );
    expect(html).toContain('data-v3-panel-sachgebiet');
    expect((html.match(/data-v3-panel-gebiet=/g) ?? []).length).toBe(2);
    // Der gewählte Schalter meldet sich als gedrückt — sonst wäre der Zustand
    // nur eingefärbt und für Screenreader unsichtbar.
    expect(html).toMatch(/aria-pressed="true"[^>]*data-v3-panel-gebiet="Strafrecht"|data-v3-panel-gebiet="Strafrecht"[^>]*aria-pressed="true"/);
  });
});

describe('Tastatur-Belegung — die Hilfe zeigt nur, was auch wirkt', () => {
  it('ohne Panel steht «r» NICHT in der Hilfe (Ist-Hülle)', () => {
    expect(belegung(false).map((b) => b.taste)).not.toContain('r');
  });

  it('mit Panel steht «r» drin, mit seiner Wirkung', () => {
    const r = belegung(true).find((b) => b.taste === 'r');
    expect(r?.wirkung).toMatch(/Rechtsprechung/);
  });

  it('die bestehenden Tasten bleiben unverändert und in ihrer Reihenfolge', () => {
    expect(belegung(false).map((b) => b.taste)).toEqual(['j', 'k', 't', '?', 'Esc']);
    expect(belegung(true).map((b) => b.taste)).toEqual(['j', 'k', 't', 'r', '?', 'Esc']);
  });
});
