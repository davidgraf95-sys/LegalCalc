import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PANEL_REITER, gruppiereKanten, normZitat, oeffnerLabel, oeffnerName, panelBezug, reiterTitel,
  trefferZahl, zaehlerAttribut,
} from '../pages/gesetz-leser/v3/panelModell';
import { kopfElemente, panelForm } from '../pages/gesetz-leser/v3/kopfStufen';
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

describe('panelBezug — ohne Leseposition gilt der erste Artikel, benannt', () => {
  const erster = { artikelLabel: 'Art. 1', artikel: '1' };

  it('mit Leseposition gewinnt sie', () => {
    expect(panelBezug('Art. 429', '429', erster)).toEqual({ label: 'Art. 429', token: '429' });
  });

  it('ohne Leseposition der ERSTE Artikel — und sein Label wird mitgegeben (§8)', () => {
    // Der Befund @390: ohne diesen Fallback stand «kein Entscheid erfasst» an
    // einem Erlass mit 1443 Verknüpfungen.
    expect(panelBezug(null, null, erster)).toEqual({ label: 'Art. 1', token: '1' });
  });

  it('Bereichs-Artikel bekommen das Kern-Label (Halbgeviert), nicht das Rohlabel', () => {
    expect(panelBezug(null, null, { artikelLabel: 'Art. 226a226d', artikel: '226_a_226_d' }))
      .toEqual({ label: 'Art. 226a–226d', token: '226_a_226_d' });
  });

  it('ohne Artikel überhaupt (leerer Erlass) bleibt beides null', () => {
    expect(panelBezug(null, null, undefined)).toEqual({ label: null, token: null });
  });

  it('halbe Leseposition zählt nicht als Leseposition', () => {
    // Label ohne Token (oder umgekehrt) käme nur aus einem Zwischenzustand; darauf
    // eine Kanten-Abfrage zu bauen ergäbe eine Zahl ohne Bezug.
    expect(panelBezug('Art. 429', null, erster).token).toBe('1');
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

describe('trefferZahl — «lädt noch» ist nicht «leer»', () => {
  const leer = () => undefined;
  // A1 (H3-Nachzug): das «geladen»-Argument kommt aus `useBezuege().geladen`, nicht
  // mehr aus einem Klassen-Zähler. `shardGeladen` ist mit dem Befund gestrichen —
  // die Funktion KONNTE einen Erlass ohne Shard nicht von einem ladenden trennen
  // (Herleitung in `panelModell.trefferZahl` und `bezuegeLaden.geladen`).
  it('vor dem Lade-Ende: null, nicht 0', () => {
    expect(trefferZahl(leer, false, '429')).toBeNull();
  });

  it('nach dem Lade-Ende und ohne Kante am Artikel: gewusste 0', () => {
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
      expect(reiterTitel(r.id, 'Artikel').length, r.id).toBeGreaterThan(10);
    }
  });

  // C1 (H3-Nachzug): der Titel des Entscheid-Reiters trug «zu diesem Artikel» als
  // Literal — an einem §-Erlass (BS-640.100) schlicht falsch (Ä23-Klasse).
  it('der Entscheid-Reiter nennt die Bestimmung des ERLASSES, nicht «Artikel»', () => {
    expect(reiterTitel('entscheide', 'Artikel')).toBe('Gerichtsentscheide zu diesem Artikel');
    expect(reiterTitel('entscheide', 'Paragraphen')).toBe('Gerichtsentscheide zu diesem Paragraphen');
  });

  it('die beiden ERLASS-weiten Reiter hängen nicht am Zähl-Substantiv', () => {
    for (const wort of ['Artikel', 'Paragraphen'] as const) {
      expect(reiterTitel('aenderungen', wort)).toBe('Änderungserlasse dieses Erlasses');
      expect(reiterTitel('materialien', wort)).toContain('zu diesem Erlass');
    }
  });
});

// §6.3-DEKLARATION (H4-II, 17./18.8.2026): dieser Fall hiess «auf `mini` trägt
// die Kopfzeile keinen Zähler» und prüfte `panel === false`. Das war die
// Ä11-Antwort von H3 — und genau sie hat den NM-2-Blocker des Kontaktbogens H4
// erzeugt: @390 stand im Ruhezustand KEIN Öffner in der Kopfzeile, der Weg zu
// den Entscheiden kostete zwei Taps statt einem. Der Zähler fällt seither nicht
// mehr, er SCHRUMPFT ('voll' | 'kompakt'), und das Element-Budget hält, weil
// dafür das ✕ weicht (`kopfStufen.zeigeSchliessKreuz`, dort die Messreihe).
// Die Ä11-Sorge ist unverändert geprüft, nur schärfer gefasst: nicht «kein
// Zähler», sondern «kein fünftes Element» — die Zahl im Browser misst
// `e2e/leser-v3-h4-kopfwege` (a2).
describe('Ä11/H4-II — welche Gestalt der Öffner je Stufe hat', () => {
  it('auf `mini` schrumpft der Zähler zum Chip, statt zu verschwinden', () => {
    expect(kopfElemente('mini').panel).toBe('kompakt');
    expect(kopfElemente('kompakt').panel).toBe('voll');
    expect(kopfElemente('voll').panel).toBe('voll');
  });
});

describe('panelForm — welche Kante das Blatt nimmt', () => {
  it('nur auf der breitesten Stufe UND mit ganzer Seite: rechts angeschlagen (Skizze D)', () => {
    expect(panelForm('voll', true)).toBe('rechts');
  });

  it('jede geteilte Fläche bekommt das Bottom-Sheet — «nie drei vertikale Flächen»', () => {
    expect(panelForm('voll', false)).toBe('unten');
    expect(panelForm('kompakt', false)).toBe('unten');
  });

  it('auf schmalen Stufen unten, auch wenn die Seite ganz zur Verfügung steht (Daumenzone)', () => {
    expect(panelForm('kompakt', true)).toBe('unten');
    expect(panelForm('mini', true)).toBe('unten');
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
