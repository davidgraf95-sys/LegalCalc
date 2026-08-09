/**
 * W2·19-GLIEDERUNG/S7 — Artikel-Kontext im KontextPanel (Bau-Spec §5.2).
 *
 * Vier Beweislasten:
 *  (1) GATING. Die Gruppe erscheint NUR bei `typ === 'norm'` UND gesetzter
 *      `artikelKontext`-Prop. Der Entscheid-Leser rendert dieselbe Komponente
 *      mit `artikelZitate` — dass dort nichts leckt, ist im Bug-Check
 *      ausdrücklich als Risiko benannt worden und wird hier festgenagelt.
 *  (2) TRENNUNG VON `artikelZitate`. Die alte Prop bleibt semantisch, was sie
 *      war (Zitat-Liste eines Entscheids → `werkzeugeFuerZitate`); sie darf die
 *      Artikel-Gruppe weder auslösen noch unterdrücken.
 *  (3) §15.2-HÖHENFESTIGKEIT. Der Block trägt IMMER `lc-artikelkontext`, in
 *      jedem Füllzustand — voll, halb, ganz leer, ohne Leseposition. Ohne diesen
 *      Test könnte jemand die Leer-Zeile «wegoptimieren» und damit genau den
 *      Sprung beim Artikelwechsel einbauen, den die erweiterte E4-Spec misst.
 *  (4) §8-EHRLICHKEIT. Jede Rolle sagt entweder ihre Zahl oder, dass nichts
 *      erfasst ist — nie nichts.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { KontextPanel } from '../components/kontext/KontextPanel';
import { ausgehendeVerweise, leitentscheideAmArtikel, materialienAmArtikel } from '../pages/gesetz-leser/artikelKontext';
import type { ArtikelKontextAnsicht } from '../lib/kontext';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { StrukturMap } from '../lib/normtext/browse';

const VOLL: ArtikelKontextAnsicht = {
  label: 'Art. 41', token: '41',
  leitentscheide: 12, materialien: 3,
  revision: { iso: '2025-01-01', as: 'AS 2023 628' },
  verweise: [{ label: 'ArG', pfad: '/gesetze/bund/ARG' }, { label: 'SR 822.11', url: 'https://x' }],
  werkzeugGruppe: 'Art. 127–142',
};
const LEER: ArtikelKontextAnsicht = { label: '§ 7', token: '7', leitentscheide: 0, materialien: 0, revision: null, verweise: [] };
const OHNE_POSITION: ArtikelKontextAnsicht = { label: '', token: '', verweise: [] };

function panel(props: Parameters<typeof KontextPanel>[0]) {
  return renderToString(<MemoryRouter><KontextPanel {...props} /></MemoryRouter>);
}

const zaehle = (html: string, nadel: string) =>
  (html.match(new RegExp(nadel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;

describe('S7 — Gating: die Gruppe leckt nicht in fremde Reader', () => {
  it('Gesetz-Reader (typ=norm) mit Prop: Gruppe da', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: VOLL });
    expect(html).toContain('data-artikel-kontext');
    expect(html).toContain('Zu Art. 41');
  });

  it('Gesetz-Reader OHNE Prop: keine Gruppe (Bestandsverhalten unverändert)', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'] });
    expect(html).not.toContain('data-artikel-kontext');
  });

  it('Entscheid-Reader: auch mit versehentlich gesetzter Prop KEINE Gruppe', () => {
    // Der EntscheidLeser setzt sie nicht — dieses Tor greift, falls es doch je
    // jemand tut (Gürtel und Hosenträger: Aufrufstelle UND Komponente gaten).
    const html = panel({ typ: 'entscheid', normKeys: ['OR'], artikelZitate: ['Art. 41 OR'], artikelKontext: VOLL });
    expect(html).not.toContain('data-artikel-kontext');
    expect(html).not.toContain('Zu Art. 41');
  });

  it('Material-Reader: ebenfalls keine Gruppe', () => {
    const html = panel({ typ: 'material', normKeys: ['OR'], artikelKontext: VOLL });
    expect(html).not.toContain('data-artikel-kontext');
  });

  it('artikelZitate bleibt eine EIGENE, unberührte Prop', () => {
    // Sie löst die Artikel-Gruppe nicht aus …
    expect(panel({ typ: 'norm', normKeys: ['OR'], artikelZitate: ['Art. 41 OR'] }))
      .not.toContain('data-artikel-kontext');
    // … und unterdrückt sie nicht.
    expect(panel({ typ: 'norm', normKeys: ['OR'], artikelZitate: ['Art. 41 OR'], artikelKontext: VOLL }))
      .toContain('data-artikel-kontext');
  });
});

describe('S7 — §15.2: der Block ist in JEDEM Füllzustand höhenfest', () => {
  for (const [name, ktx] of [['voll', VOLL], ['leer', LEER], ['ohne Leseposition', OHNE_POSITION]] as const) {
    it(`${name}: trägt lc-artikelkontext`, () => {
      const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: ktx });
      expect(html).toContain('lc-artikelkontext');
    });
  }
});

// Die Zähler-Pflicht aus FAHRPLAN-VERZAHNUNG-UI §1.4 gilt für Gruppen, die eine
// MENGE auflösen. Der Artikel-Kontext ist keine — er zeigt vier feste Rollen.
// Damit e2e/verzahnung MM1 die Pflicht dort prüfen kann, wo sie gilt (und NUR
// dort), trägt jede Gruppe ihre Rolle im DOM. Diese Tests halten beide Enden
// fest: die Ausnahme ist deklariert, und der Default bleibt streng.
describe('S7 — Gruppen-Rolle: Zähler-Pflicht bleibt scharf, Ausnahme deklariert', () => {
  it('Der Artikel-Kontext deklariert sich als Wegweiser — genau einmal', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: VOLL });
    expect(zaehle(html, 'data-kontext-rolle="wegweiser"')).toBe(1);
  });

  it('Alle übrigen Gruppen bleiben Listen-Gruppen (Default streng)', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: VOLL });
    expect(zaehle(html, 'data-kontext-rolle="liste"')).toBeGreaterThanOrEqual(1);
  });

  it('Ohne Wegweiser trägt JEDE Gruppe die Listen-Rolle (kein stiller Schlupf)', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'] });
    expect(zaehle(html, 'data-kontext-rolle="wegweiser"')).toBe(0);
    expect(zaehle(html, 'data-kontext-rolle="liste"')).toBe(zaehle(html, '<h3'));
  });
});

describe('S7 — §8: jede Rolle sagt etwas, auch wenn sie nichts weiss', () => {
  it('Voller Artikel: alle vier Rollen mit Inhalt, Werkzeug-Sprung statt Zweitliste', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: VOLL });
    expect(html).toContain('12 Leitentscheide');
    expect(html).toContain('3 Materialien');
    expect(html).toContain('ArG');
    expect(html).toContain('01.01.2025');
    // Sprung zur bestehenden Werkzeug-Gruppe — KEINE zweite Werkzeugliste (§5).
    expect(html).toContain('#kontext-werkzeuge');
    expect(html).toContain('Art. 127–142');
  });

  it('Leerer Artikel: EIN ehrlicher Satz statt vier Verneinungen', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: LEER });
    expect(html).toContain('Kein artikelbezogener Kontext erfasst');
  });

  it('Ohne Leseposition: benannt, nicht verschwiegen', () => {
    const html = panel({ typ: 'norm', normKeys: ['OR'], artikelKontext: OHNE_POSITION });
    expect(html).toContain('Noch keine Leseposition erfasst');
    expect(html).toContain('Zur Leseposition');
  });

  it('Teilweise leer: die leeren Rollen sagen es, die vollen zeigen ihre Zahl', () => {
    const html = panel({
      typ: 'norm', normKeys: ['OR'],
      artikelKontext: { label: 'Art. 1', token: '1', leitentscheide: 2, materialien: 0, revision: undefined, verweise: [] },
    });
    expect(html).toContain('2 Leitentscheide');
    expect(html).toContain('kein Erlassverweis erfasst');
    expect(html).toContain('nicht erfasst');
    expect(html).toContain('keines zu diesem Artikel');
  });
});

describe('S7 — ausgehende Verweise (reine Ableitung)', () => {
  const eintrag = { artikel: '5', grundlage: 'Art. 40 ArG' } as unknown as NormSnapshot;
  const struktur: StrukturMap = {
    '5': {
      gliederung: [], marginalie: [],
      fussnoten: [
        { nr: '1', text: 'x', links: [{ label: 'SR 822.11', url: 'https://fedlex/eli/cc/1/de', rs: '822.11' }] },
        // Zweiter Treffer mit demselben Label → dedupliziert.
        { nr: '2', text: 'y', links: [{ label: 'SR 822.11', url: 'https://fedlex/eli/cc/1/de', rs: '822.11' }] },
        // Kantonaler intern-Verweis.
        { nr: '3', text: 'z', links: [{ label: 'BS 155.100', url: 'https://bs', intern: { ebene: 'kanton', key: 'BS-155.100' } }] },
      ],
    },
  };

  it('Grundlage zuerst, dann Fussnoten-Verweise, dedupliziert', () => {
    const v = ausgehendeVerweise(eintrag, struktur, '5');
    expect(v.map((x) => x.label)).toEqual(['Art. 40 ArG', 'SR 822.11', 'BS 155.100']);
  });

  it('Intern nur, wo wir den Erlass wirklich halten — sonst amtlicher Link (§8)', () => {
    const v = ausgehendeVerweise(eintrag, struktur, '5');
    const bs = v.find((x) => x.label === 'BS 155.100')!;
    expect(bs.pfad).toBe('/gesetze/kanton/BS-155.100');
    // Die Grundlage ist ein Textverweis ohne aufgelöstes Ziel: kein toter Pfad.
    expect(v[0].pfad).toBeUndefined();
    expect(v[0].url).toBeUndefined();
  });

  it('Kein Artikel-Eintrag / keine Struktur ⇒ leer, kein Wurf', () => {
    expect(ausgehendeVerweise(undefined, null, '5')).toEqual([]);
  });
});

describe('S7 — Zählungen aus den bereits geladenen Shards', () => {
  it('Leitentscheide je Artikel (Token kanonisiert)', () => {
    const shard = { erzeugt: '', erlass: 'OR', gewichtQuelle: 'alt' as const, proArtikel: { '41': [{}, {}] } };
    expect(leitentscheideAmArtikel(shard as never, '41')).toBe(2);
    expect(leitentscheideAmArtikel(shard as never, '42')).toBe(0);
    expect(leitentscheideAmArtikel(null, '41')).toBe(0);
  });

  it('Materialien je Artikel: je DOKUMENT eines, nicht je Kante', () => {
    const shard = {
      erlass: 'OR',
      kanten: [
        { dok: 'A', artikel: '41', fundstellen: [] },
        { dok: 'A', artikel: '41', fundstellen: [] },   // zweite Kante, gleiches Dokument
        { dok: 'B', artikel: '41', fundstellen: [] },
        { dok: 'C', artikel: '99', fundstellen: [] },
      ],
    };
    expect(materialienAmArtikel(shard as never, '41')).toBe(2);
    expect(materialienAmArtikel(shard as never, '99')).toBe(1);
    expect(materialienAmArtikel(null, '41')).toBe(0);
  });
});
