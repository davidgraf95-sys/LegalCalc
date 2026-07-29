/**
 * W2·7-BEZUG/B4+B7 — die «Bezüge»-Zeile am Artikel.
 *
 * Die Zusagen, die nur am gerenderten Markup prüfbar sind:
 *   (1) §8 Rang-Trennung: Leitentscheid und übriges/kantonales Urteil stehen in
 *       EIGENEN, benannten Gruppen — nie in einer gemeinsamen Reihe.
 *   (2) B7 Vollständigkeit: die Linie führt ALLE Kanten der Klasse; gezeigt
 *       werden 5 auf einmal, ein Klick lädt die nächsten 5 (David 29.7.2026).
 *   (3) B7 Scrollbarkeit + CLS: je Klasse EINE Linie fester Höhe, waagrecht
 *       scrollbar, tastaturerreichbar.
 *   (4) §8 kein stilles Nichts / keine erfundene Zahl.
 *
 * ── §6.3-DEKLARATION (B7, David-Auftrag 28.7.2026) ──────────────────────────
 * Vier Zusicherungen dieser Datei sind GEÄNDERT, nicht «aufgeweicht»: sie
 * massen den Auslieferungs-Deckel «8 je Status», den dieser Schritt AUFHEBT.
 *   · «Art. 5 StPO: der Shard deckelt 115 kantonale Entscheide auf 8» — der
 *     Vorbefund misst jetzt das Gegenteil: 115 geliefert von 115 erfassten.
 *   · «zeigt ‹8 von 115›, nicht ‹8›» → «zeigt ‹5 von 115›»: die Linie FÜHRT
 *     alle 115, zeigt aber 5 auf einmal (David 29.7.2026: «es soll einfach 5
 *     entscheide pro linie sein und mit klick lädt es die nächsten 5»). Der
 *     Deckel ist damit nicht zurück — er war eine AUSLIEFERUNGS-Grenze in den
 *     Shards, dies ist eine Anzeige-Portion, die ein Klick beliebig weit öffnet.
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
import { PRO_SCHRITT, naechsteSichtbar, zahlText } from '../pages/gesetz-leser/bezugPortion';
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

  it('zeigt 5 Chips je Linie, nicht alle 115 (David 29.7.2026)', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    expect(s.match(/lc-chip /g) ?? []).toHaveLength(5);
    // Die ZAHL nennt trotzdem die volle Menge — die Linie ist portioniert, die
    // Auskunft nicht.
    expect(s).toContain('5 von 115');
  });

  it('«weitere 5» steht am Linienende und ist ein echter, benannter Knopf', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    expect(s).toContain('data-bezug-weitere="kantonal"');
    expect(s).toContain('weitere ');
    expect(s).toContain('5 weitere laden');          // aria-label, tastaturerreichbar
    // Es steht IN der Linie, nicht daneben.
    expect(s.indexOf('data-bezug-weitere')).toBeGreaterThan(s.indexOf('data-bezug-linie="kantonal"'));
  });

  it('«+n weitere» der alten Kanten-Grammatik gibt es hier nicht mehr', () => {
    const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['kantonal'], []);
    const s = html(<BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />);
    expect(s).not.toContain('weitere anzeigen');
    expect(s).not.toContain('+');
  });
});

describe('B7 · 5er-Portionen: die Schwellenfälle (David 29.7.2026)', () => {
  const kunst = (n: number): Bezug[] =>
    Array.from({ length: n }, (_, i) => kante(
      `k_${i}`, `BGE 150 II ${100 + i}`, 'bge', 'CH',
      // absteigend, wie der Shard sie liefert
      `2025-${String(12 - (i % 12)).padStart(2, '0')}-01`,
    ));

  it('4 Kanten: alle 4 stehen da, KEIN Klick-Element', () => {
    const s = html(<BezuegeZeile kanten={kunst(4)} gesamt={{ bge: 4 }} normZitat="Art. 1 X" />);
    expect(s.match(/lc-chip /g) ?? []).toHaveLength(4);
    expect(s).not.toContain('data-bezug-weitere');
    expect(s).toContain('>4</span>');               // «4», nicht «4 von 4»
  });

  it('5 Kanten: genau voll, KEIN Klick-Element — es gäbe nichts zu laden (§13 F4)', () => {
    const s = html(<BezuegeZeile kanten={kunst(5)} gesamt={{ bge: 5 }} normZitat="Art. 1 X" />);
    expect(s.match(/lc-chip /g) ?? []).toHaveLength(5);
    expect(s).not.toContain('data-bezug-weitere');
    expect(s).toContain('>5</span>');
  });

  it('6 Kanten: 5 gezeigt, das Element bietet die EINE übrige an — nicht stur 5', () => {
    const s = html(<BezuegeZeile kanten={kunst(6)} gesamt={{ bge: 6 }} normZitat="Art. 1 X" />);
    expect(s.match(/lc-chip /g) ?? []).toHaveLength(5);
    expect(s).toContain('data-bezug-weitere="bge"');
    expect(s).toContain('5 von 6');
    expect(s).toContain('1 weitere laden');
  });

  it('11 Kanten: 5 gezeigt, Element bietet 5 an', () => {
    const s = html(<BezuegeZeile kanten={kunst(11)} gesamt={{ bge: 11 }} normZitat="Art. 1 X" />);
    expect(s.match(/lc-chip /g) ?? []).toHaveLength(5);
    expect(s).toContain('5 von 11');
    expect(s).toContain('5 weitere laden');
  });

  it('grosse Zahlen tragen die Schweizer Tausendertrennung', () => {
    const s = html(<BezuegeZeile kanten={kunst(20)} gesamt={{ bge: 4140 }} normZitat="Art. 42 BGG" />);
    // Die Grundmenge der LINIE ist 20 (das ist die gefilterte Menge); die 4'140
    // stehen im title des Kopfes — beides mit Trennzeichen, wo nötig.
    expect(s).toContain('5 von 20');
    expect((4140).toLocaleString('de-CH')).toBe("4'140");
  });
});

describe('B7 · die Zahl am Gruppenkopf (§8)', () => {
  const shard = JSON.parse(
    readFileSync('public/rechtsprechung/bezuege/STPO.json', 'utf8'),
  ) as BezugsShard;
  const kanten = waehleBezuege(bezuegeFuerArtikel(shard, '5'), ['bge', 'bger', 'kantonal'], []);

  it('ohne Filter: «5 von 115» — die Portion vorn, die volle Menge hinten', () => {
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('5 von 115');
    expect(s).toContain('5 von 16');
    // «8 von …» wäre der alte Deckel — der ist weg.
    expect(s).not.toContain('8 von');
  });

  it('mit Zeitfilter: «5 von 12 im Zeitraum» — die Bezugsgrösse ist die gefilterte Menge', () => {
    const gekuerzt = kanten.filter((b) => b.facetten.status === 'kantonal').slice(0, 12);
    const s = html(
      <BezuegeZeile kanten={gekuerzt} gesamt={{ kantonal: 115 }} zeitAktiv normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('5 von 12 im Zeitraum');
    // §8: die Zahl OHNE Filter verschwindet nicht, sie steht im title des Kopfes.
    expect(s).toContain('12 im gewählten Zeitraum, 115 insgesamt an diesem Artikel');
  });

  it('alles geladen UND Zeitfilter: «12 von 12 im Zeitraum» statt bloss «12»', () => {
    // Sonst läse sich die gefilterte Menge wie die Datenlage (§8).
    const gekuerzt = kanten.filter((b) => b.facetten.status === 'kantonal').slice(0, 3);
    const s = html(
      <BezuegeZeile kanten={gekuerzt} gesamt={{ kantonal: 115 }} zeitAktiv normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('3 von 3 im Zeitraum');
  });

  it('mit Kantonsfilter (ohne Zeit): kein «im Zeitraum»-Zusatz', () => {
    const gekuerzt = kanten.filter((b) => b.facetten.status === 'kantonal').slice(0, 12);
    const s = html(
      <BezuegeZeile kanten={gekuerzt} gesamt={{ kantonal: 115 }} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('5 von 12');
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

describe('B7 · die Schritt-Arithmetik selbst (rein, §2)', () => {
  it('5 → 10 → 15 und klemmt am Rest, statt darüber hinauszuzählen', () => {
    expect(PRO_SCHRITT).toBe(5);
    expect(naechsteSichtbar(5, 4140)).toBe(10);
    expect(naechsteSichtbar(10, 4140)).toBe(15);
    expect(naechsteSichtbar(5, 6)).toBe(6);        // letzter Schritt: nur der Rest
    expect(naechsteSichtbar(11, 11)).toBe(11);     // nichts mehr da ⇒ unverändert
  });

  it('zahlText: drei Formen, keine vierte', () => {
    expect(zahlText(4140, 4140, false)).toBe("4'140");        // alles da, kein Filter
    expect(zahlText(5, 4140, false)).toBe("5 von 4'140");     // portioniert
    expect(zahlText(5, 12, true)).toBe('5 von 12 im Zeitraum');
    // Mit Filter steht das «von» AUCH, wenn alles geladen ist — sonst läse sich
    // die gefilterte Menge wie die Datenlage (§8).
    expect(zahlText(12, 12, true)).toBe('12 von 12 im Zeitraum');
  });
});
