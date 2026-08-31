// @vitest-environment node
// ─── R8-GATE: Kanton-Kürzel als Such-Aliase im Client-Weg (31.8.2026) ────────
//
// Gegen den ECHTEN Korpus (baueIndex + FlexSearch = Produktions-Pipeline
// baueSuchFn). Vier Zusicherungen:
//   1 «GOG» liefert die Artikel des GOG selbst (BS-154.100) zuoberst — nicht
//     nur fremde Reglemente, deren Marginalien «GOG» zitieren (Nullprobe
//     31.8.2026: vor R8 waren die Top 8 ausschliesslich BS-154.110/150/250).
//   2 Kollisionsfall «StG»: BEIDE Ebenen erscheinen — Bundes-StG (SR 641.10)
//     UND kantonale Steuergesetze; keine Ebene verdrängt die andere ganz.
//   3 Ebenen-Trennung: kein Bund-Eintrag im Suchindex trägt ein Kanton-Alias
//     (kz), und die Kürzel-Stufe zieht bei Bund NUR über dessen eigenes ku.
//   4 Negativfall «Die Bürgschaft»: das Bundes-Titel-Fragment aus AR-222.31
//     ist kein Alias — die Treffer bleiben die OR-Bürgschaftsartikel des Bundes.
// Jede Prüfung wurde beim Bau einmal ROT gezeigt (Mutations-Probe, Bericht).
import { describe, it, expect, beforeAll } from 'vitest';
import * as flex from 'flexsearch';
import { baueIndex } from '../../../scripts/such-index-generieren';
import { baueSuchFn } from '../../lib/suche/artikelVolltext';
import { rangiere, type RankEintrag } from '../../lib/suche/artikelRanking';
import type { SuchTreffer } from '../../lib/universalSuche';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

interface Eintrag extends RankEintrag { kz: string; kt: string }

let eintraege: Eintrag[];
let suche: (q: string, limit?: number) => SuchTreffer[];

// Grosszügiges Hook-Budget wie im Ranking-Gate: der FlexSearch-Aufbau über
// ~54 000 Artikel ist der teure Teil, die Suchen danach sind schnell.
beforeAll(() => {
  const idx = baueIndex();
  eintraege = idx.eintraege as unknown as Eintrag[];
  suche = baueSuchFn(idx.eintraege as never, FlexSearch);
}, 180000);

const keyVonHref = (href: string): string => href.split('/').pop()!.split('#')[0];

describe('R8-Tor 1: Kürzel-Query trifft den Kanton-Erlass selbst', () => {
  it('«GOG» → Artikel des BS-Gerichtsorganisationsgesetzes zuoberst', () => {
    const treffer = suche('GOG', 10);
    expect(treffer.length).toBeGreaterThan(0);
    // Der erste Treffer IST ein GOG-Artikel, nicht bloss eine Fremdnennung …
    expect(keyVonHref(treffer[0].href)).toBe('BS-154.100');
    // … und der Erlass dominiert die Spitze (mind. 5 der Top 10).
    const eigene = treffer.filter((t) => keyVonHref(t.href) === 'BS-154.100');
    expect(eigene.length).toBeGreaterThanOrEqual(5);
  });

  it('Kleinschreibung «gog» wirkt identisch (norm() faltet)', () => {
    expect(keyVonHref(suche('gog', 3)[0].href)).toBe('BS-154.100');
  });

  it('Semikolon-Alias «BeFiG» (AR-852.6, R2-Split) trifft den Erlass', () => {
    expect(keyVonHref(suche('BeFiG', 3)[0].href)).toBe('AR-852.6');
  });
});

describe('R8-Tor 2: Kollisionsfall «StG» — beide Ebenen, keine verdrängt', () => {
  it('Bundes-StG UND kantonale Steuergesetze erscheinen', () => {
    // Volle Trefferliste (100): das Bundes-StG trägt allein 55 Artikel; die
    // kantonalen Ziele MÜSSEN dahinter erscheinen, nicht verschwinden.
    const keys = new Set(suche('StG', 100).map((t) => keyVonHref(t.href)));
    expect(keys.has('STG'), 'Bundes-StG (SR 641.10) fehlt').toBe(true);
    const kantonStG = ['AI-640.000', 'BS-640.100', 'NW-521.1', 'OW-641.4', 'SG-811.1', 'TG-640.1'];
    expect(
      kantonStG.some((k) => keys.has(k)),
      'kein einziges kantonales StG unter den Treffern',
    ).toBe(true);
  });

  it('Bund steht bei gleicher Stufe vor Kanton (bestehende EBENEN_RANG-Ordnung)', () => {
    const keys = suche('StG', 100).map((t) => keyVonHref(t.href));
    const bundIdx = keys.indexOf('STG');
    const kantonIdx = keys.findIndex((k) => /^(AI|BS|NW|OW|SG|TG)-/.test(k));
    expect(bundIdx).toBeGreaterThanOrEqual(0);
    expect(kantonIdx).toBeGreaterThanOrEqual(0);
    expect(bundIdx).toBeLessThan(kantonIdx);
  });
});

describe('R8-Tor 3: Ebenen-Trennung im Index und in der Rangschicht', () => {
  it('kein Bund-Eintrag trägt ein Kanton-Alias (kz)', () => {
    for (const e of eintraege) {
      if (e.eb === 'bund') expect(e.kz, `Bund-Eintrag ${e.k} trägt kz`).toBe('');
    }
  });

  it('jeder Kanton-Eintrag mit kz gehört zu einem Kanton (kt gesetzt)', () => {
    for (const e of eintraege) {
      if (e.kz !== '') {
        expect(e.eb).toBe('kanton');
        expect(e.kt).not.toBe('');
      }
    }
  });

  it('eine Bundes-Kürzel-Query hebt keinen Kanton-Eintrag über sein kz', () => {
    // rangiere() direkt: ein Kanton-Eintrag OHNE Alias (kz='') darf über die
    // Kürzel-Stufe nie Stufe 0 erreichen, auch wenn sein ku-Voll-String die
    // Query als Wort enthält — Kanton-ku ist bewusst kein Kürzel-Träger.
    const kanton: RankEintrag = {
      k: 'XX-1', ku: 'Gesetz über X, StGB-Vollzug (XX 1)', kz: '', a: '99',
      l: '§ 99', m: '', n: '', g: '', t: 'stgb', eb: 'kanton',
    };
    const bund: RankEintrag = {
      k: 'STGB', ku: 'StGB', a: '1', l: 'Art. 1', m: '', n: '', g: '', t: 'x', eb: 'bund',
    };
    // Eingabe-Reihenfolge Kanton VOR Bund: bliebe der Kanton-Eintrag Stufe 2
    // und der Bund-Eintrag würde Stufe 0, dreht rangiere die Ordnung.
    const r = rangiere([kanton, bund], 'StGB', 2);
    expect(r[0].k).toBe('STGB');
  });
});

describe('R8-Tor 4: Negativfälle der zwei Gefahren-Klassen', () => {
  it('kein Index-Eintrag trägt «AKV» oder «Die Bürgschaft» als kz', () => {
    for (const e of eintraege) {
      expect(e.kz).not.toBe('AKV');
      expect(e.kz.includes('Bürgschaft') && e.kz.includes('Die')).toBe(false);
    }
  });

  it('«Die Bürgschaft» liefert weiterhin die OR-Artikel des Bundes zuoberst', () => {
    const treffer = suche('Die Bürgschaft', 8);
    expect(treffer[0].href).toContain('/gesetze/bund/OR#art-492');
    // … und keinen Treffer der kantonalen Verordnung AR-222.31 in den Top 8.
    expect(treffer.some((t) => keyVonHref(t.href) === 'AR-222.31')).toBe(false);
  });
});
