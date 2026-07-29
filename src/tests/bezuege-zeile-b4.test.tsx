/**
 * W2·7-BEZUG/B4+B7 — die «Bezüge»-Zeile am Artikel.
 *
 * Die Zusagen, die nur am gerenderten Markup prüfbar sind:
 *   (1) §8 Rang-Trennung: Leitentscheid und übriges/kantonales Urteil stehen in
 *       EIGENEN, benannten Gruppen — nie in einer gemeinsamen Reihe.
 *   (2) B7 Vollständigkeit: die Linie zeigt ALLE Kanten der Klasse, und die Zahl
 *       am Gruppenkopf ist die Vollzahl aus `gesamtProArtikel` — kein «8 von N».
 *   (3) B7 Scrollbarkeit + CLS: je Klasse EINE Linie fester Höhe, waagrecht
 *       scrollbar, tastaturerreichbar.
 *   (4) §8 kein stilles Nichts / keine erfundene Zahl.
 *
 * ── §6.3-DEKLARATION (B7, David-Auftrag 28.7.2026) ──────────────────────────
 * Vier Zusicherungen dieser Datei sind GEÄNDERT, nicht «aufgeweicht»: sie
 * massen den Auslieferungs-Deckel «8 je Status», den dieser Schritt AUFHEBT.
 *   · «Art. 5 StPO: der Shard deckelt 115 kantonale Entscheide auf 8» — der
 *     Vorbefund misst jetzt das Gegenteil: 115 geliefert von 115 erfassten.
 *   · «zeigt ‹8 von 115›, nicht ‹8›» → «zeigt ‹115›, nicht ‹8 von 115›»: seit
 *     die Linie alles zeigt, wäre «115 von 115» Lärm ohne Erkenntnis, und ein
 *     «8 von 115» wäre schlicht falsch.
 *   · «die ehrliche Zahl sitzt am Gruppenkopf» — bleibt, mit den neuen Zahlen.
 *   · Der Fall «Zahl MIT Grundgesamtheit» ist nicht verschwunden, sondern hat
 *     eine andere Ursache: den Zeit-/Kantonsfilter. Er ist unten eigens geprüft
 *     («12 von 30 im Zeitraum»), damit die §8-Zusage nicht mit dem Deckel
 *     verlorengeht.
 * Eine fachliche Änderung, deklariert und begründet — kein stilles Nachziehen.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { BezuegeZeile } from '../pages/gesetz-leser/parts/BezuegeZeile';
import { bezuegeFuerArtikel, type Bezug, type BezugsShard } from '../lib/rechtsprechung/bezuege';
import { waehleBezuege } from '../pages/gesetz-leser/bezugAuswahl';
import type { BezugStatus } from '../lib/verzahnung/facetten';

function kante(key: string, zitierung: string, status: BezugStatus, kanton: string, datum = '2020-01-01'): Bezug {
  return {
    key, zitierung, regesteKurz: null, datum, gewicht: null,
    facetten: {
      quelltyp: 'rechtsprechung', ebene: kanton === 'CH' ? 'bund' : 'kanton',
      kanton, gericht: status, status,
    },
  };
}

const html = (el: React.ReactElement) => renderToString(<MemoryRouter>{el}</MemoryRouter>);

describe('B4 · Rang-Trennung im Markup (§8)', () => {
  const kanten = [
    kante('bge_1', 'BGE 148 IV 22', 'bge', 'CH'),
    kante('bger_1', '6B_1/2020', 'bger', 'CH'),
    kante('bs_1', 'BES.2024.15', 'kantonal', 'BS'),
  ];

  it('rendert je Status-Klasse eine eigene, markierte Gruppe', () => {
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} normZitat="Art. 5 StPO" />);
    expect(s).toContain('data-bezug-gruppe="bge"');
    expect(s).toContain('data-bezug-gruppe="bger"');
    expect(s).toContain('data-bezug-gruppe="kantonal"');
  });

  it('hält die deklarierte Rang-Ordnung ein: BGE vor BGer vor kantonal (§2)', () => {
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} normZitat="Art. 5 StPO" />);
    expect(s.indexOf('data-bezug-gruppe="bge"')).toBeLessThan(s.indexOf('data-bezug-gruppe="bger"'));
    expect(s.indexOf('data-bezug-gruppe="bger"')).toBeLessThan(s.indexOf('data-bezug-gruppe="kantonal"'));
  });

  it('★ trägt NUR der amtlich publizierte Leitentscheid — genau einmal', () => {
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} normZitat="Art. 5 StPO" />);
    expect(s.match(/★/g)).toHaveLength(1);
  });

  it('bleibt vom bestehenden «Entscheide»-Schalter erfasst (data-leitfall-zeile)', () => {
    // Sonst hätte das Zuschalten einer Facette einen Schalter still ausgehebelt.
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} normZitat="Art. 5 StPO" />);
    expect(s).toContain('data-leitfall-zeile');
  });
});

describe('B7 · je Instanz EINE scrollbare Linie, alle Entscheide (David 28.7.2026)', () => {
  const shard = JSON.parse(
    readFileSync('public/rechtsprechung/bezuege/STPO.json', 'utf8'),
  ) as BezugsShard;

  it('VORBEFUND: der Shard liefert an Art. 5 StPO ALLE 115 kantonalen Kanten', () => {
    // Ohne diesen Vorbefund wäre der Render-Test unten wertlos. Bis B6 stand hier
    // «deckelt 115 auf 8» — genau das ist die Änderung (§6.3-Deklaration oben).
    expect(shard.gesamtProArtikel['5']).toMatchObject({ bge: 16, bger: 2, kantonal: 115 });
    expect(bezuegeFuerArtikel(shard, '5').filter((b) => b.facetten.status === 'kantonal')).toHaveLength(115);
  });

  it('VORBEFUND: die Kanten stehen chronologisch neu → alt', () => {
    const kantonal = bezuegeFuerArtikel(shard, '5').filter((b) => b.facetten.status === 'kantonal');
    const daten = kantonal.map((b) => b.datum);
    expect(daten).toEqual([...daten].sort().reverse());
  });

  it('je Klasse GENAU EINE Linie, waagrecht scrollbar und tastaturerreichbar', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['bge', 'bger', 'kantonal'], []);
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />,
    );
    for (const k of ['bge', 'bger', 'kantonal']) {
      expect(s.match(new RegExp(`data-bezug-linie="${k}"`, 'g'))).toHaveLength(1);
    }
    expect(s).toContain('overflow-x-auto');
    expect(s).toContain('lc-bezug-linie');
    expect(s).toContain('tabindex="0"');            // WCAG 2.1.1: ohne Maus erreichbar
    expect(s).toContain('waagrecht scrollbare Liste');
  });

  it('CLS 0: die Linie hat eine feste Höhe und wächst nur nach rechts', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    // `h-7` = feste Höhe, `overflow-y-hidden` = kein Umbruch nach unten. Ohne
    // beides schöbe jedes Nachladen den Artikeltext darunter weg.
    expect(s).toContain('h-7');
    expect(s).toContain('overflow-y-hidden');
    expect(s).not.toContain('flex-wrap');
  });

  it('rendert nicht alle 115 Chips sofort — Lazy-Anhängen beim Scrollen (§15)', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    const chips = s.match(/lc-chip /g) ?? [];
    expect(chips.length).toBeLessThan(kanten.length);
    expect(chips.length).toBeGreaterThan(0);
    // Die ZAHL nennt trotzdem alle — die Linie ist gestückelt, die Auskunft nicht.
    expect(s).toContain('115');
  });

  it('«+n weitere» gibt es nicht mehr — der Rest ist erscrollbar, nicht versteckt', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    expect(s).not.toContain('weitere');
  });
});

describe('B7 · die Zahl am Gruppenkopf (§8)', () => {
  const shard = JSON.parse(
    readFileSync('public/rechtsprechung/bezuege/STPO.json', 'utf8'),
  ) as BezugsShard;
  const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['bge', 'bger', 'kantonal'], []);

  it('ohne Filter: die schlichte Vollzahl — «115», nie «8 von 115» und nie «115 von 115»', () => {
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('>115</span>');
    expect(s).not.toContain('von 115');
    expect(s).not.toContain('von 16');
  });

  it('mit Zeitfilter: «12 von 30 im Zeitraum» — die Bezugsgrösse schrumpft nicht mit', () => {
    // Die verkürzte Menge simuliert, was der Zeit-Filter liefert; `gesamt` bleibt
    // die Zahl OHNE Filter (so reicht `bezuegeLaden` sie durch).
    const gekuerzt = kanten.filter((b) => b.facetten.status === 'kantonal').slice(0, 12);
    const s = html(
      <BezuegeZeile kanten={gekuerzt} gesamt={{ kantonal: 30 }} zeitAktiv normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('12 von 30 im Zeitraum');
  });

  it('mit Kantonsfilter (ohne Zeit): «12 von 30» ohne den Zeitraum-Zusatz', () => {
    const gekuerzt = kanten.filter((b) => b.facetten.status === 'kantonal').slice(0, 12);
    const s = html(
      <BezuegeZeile kanten={gekuerzt} gesamt={{ kantonal: 30 }} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('12 von 30');
    expect(s).not.toContain('im Zeitraum');
  });

  it('rendert `gewicht` nirgends als Zahl — «nicht messbar» wird nie zu 0 (§8)', () => {
    const kantonal = bezuegeFuerArtikel(shard, '5').filter((b) => b.facetten.status === 'kantonal');
    // Vorbefund: kantonale Kanten tragen gewicht:null (der Zitier-Graph erkennt
    // ihre Geschäftsnummern nicht).
    expect(kantonal.every((b) => b.gewicht === null)).toBe(true);
    const s = html(<BezuegeZeile kanten={kantonal} gesamt={{ kantonal: 115 }} normZitat="Art. 5 StPO" />);
    expect(s).not.toContain('>0<');
    expect(s).not.toContain('null');
  });
});

describe('B4 · nur Auflistung, wenn aktiviert (Vorgabe David 28.7.2026)', () => {
  const shard = JSON.parse(
    readFileSync('public/rechtsprechung/bezuege/STPO.json', 'utf8'),
  ) as BezugsShard;
  const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['bge', 'bger', 'kantonal'], []);

  it('aktivierte Facetten ⇒ die Auflistung steht DIREKT da, ohne Zwischenzustand', () => {
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('lc-chip');
    expect(s).toContain('data-bezug-gruppe="bge"');
    // Kein Aufklapp-Schalter und keine Zusammenfassungs-Zeile mehr.
    expect(s).not.toContain('data-bezuege-schalter');
    expect(s).not.toContain('aria-expanded');
  });

  it('keine Kante ⇒ NICHTS: null Pixel Verzahnungs-UI unter dem Artikel', () => {
    // Gilt auch für «alle Facetten abgewählt» — der Aufrufer liefert dann eine
    // leere Menge. Kein Hinweis, keine Overline, kein Platzhalter.
    const s = html(<BezuegeZeile kanten={[]} gesamt={{}} normZitat="Art. 5 StPO" />);
    expect(s).not.toContain('data-bezuege-zeile');
    expect(s).not.toContain('BEZÜGE');
    expect(s).not.toContain('Bezüge');
  });

  it('leere Klassen erscheinen gar nicht — kein «Eidg. Gerichte 0» als Rauschen', () => {
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />,
    );
    expect(s).not.toContain('Eidg. Gerichte');
  });
});
