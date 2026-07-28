/**
 * W2·7-BEZUG/B4 — die «Bezüge»-Zeile am Artikel.
 *
 * Drei Zusagen, die nur am gerenderten Markup prüfbar sind:
 *   (1) §8 Rang-Trennung: Leitentscheid und übriges/kantonales Urteil stehen in
 *       EIGENEN, benannten Gruppen — nie in einer gemeinsamen Reihe.
 *   (2) §8 ehrliche Grundgesamtheit: «8 von 115», nicht «8» — und die Zahl
 *       stammt aus `gesamtProArtikel` des Shards, nicht aus der gezeigten Liste.
 *   (3) §8 kein stilles Nichts: nimmt der Filter alles weg, weist die Zeile die
 *       ausgeblendete Menge aus, statt zu verschwinden.
 *
 * Der Beleg zu (2) läuft gegen den ECHTEN Shard (`public/rechtsprechung/
 * bezuege/STPO.json`), nicht gegen eine Attrappe: eine Attrappe könnte nur
 * beweisen, dass die Komponente zwei übergebene Zahlen nebeneinander schreibt.
 * Prüfenswert ist, dass die gezeigte Zahl zur AUSGELIEFERTEN Grundgesamtheit
 * passt — Art. 5 StPO ist der Fall mit dem grössten Abstand (8 gezeigte von 115
 * erfassten kantonalen Entscheiden).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { BezuegeZeile } from '../pages/gesetz-leser/parts/BezuegeZeile';
import { bezuegeFuerArtikel, type Bezug, type BezugsShard } from '../lib/rechtsprechung/bezuege';
import { waehleBezuege } from '../pages/gesetz-leser/bezugAuswahl';
import type { BezugStatus } from '../lib/verzahnung/facetten';

function kante(key: string, zitierung: string, status: BezugStatus, kanton: string): Bezug {
  return {
    key, zitierung, regesteKurz: null, datum: '2020-01-01', gewicht: null,
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
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} ausgeblendet={0} normZitat="Art. 5 StPO" />);
    expect(s).toContain('data-bezug-gruppe="bge"');
    expect(s).toContain('data-bezug-gruppe="bger"');
    expect(s).toContain('data-bezug-gruppe="kantonal"');
  });

  it('hält die deklarierte Rang-Ordnung ein: BGE vor BGer vor kantonal (§2)', () => {
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} ausgeblendet={0} normZitat="Art. 5 StPO" />);
    expect(s.indexOf('data-bezug-gruppe="bge"')).toBeLessThan(s.indexOf('data-bezug-gruppe="bger"'));
    expect(s.indexOf('data-bezug-gruppe="bger"')).toBeLessThan(s.indexOf('data-bezug-gruppe="kantonal"'));
  });

  it('★ trägt NUR der amtlich publizierte Leitentscheid — genau einmal', () => {
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} ausgeblendet={0} normZitat="Art. 5 StPO" />);
    expect(s.match(/★/g)).toHaveLength(1);
  });

  it('bleibt vom bestehenden «Entscheide»-Schalter erfasst (data-leitfall-zeile)', () => {
    // Sonst hätte das Zuschalten einer Facette einen Schalter still ausgehebelt.
    const s = html(<BezuegeZeile kanten={kanten} gesamt={{}} ausgeblendet={0} normZitat="Art. 5 StPO" />);
    expect(s).toContain('data-leitfall-zeile');
  });
});

describe('B4 · ehrliche Grundgesamtheit gegen den ausgelieferten Shard (§8)', () => {
  const shard = JSON.parse(
    readFileSync('public/rechtsprechung/bezuege/STPO.json', 'utf8'),
  ) as BezugsShard;

  it('Art. 5 StPO: der Shard deckelt 115 kantonale Entscheide auf 8', () => {
    // Ohne diesen Vorbefund wäre der Render-Test unten wertlos — er prüfte dann
    // nur, dass zwei gleiche Zahlen gleich sind.
    expect(shard.gesamtProArtikel['5']).toMatchObject({ bge: 16, kantonal: 115 });
    expect(bezuegeFuerArtikel(shard, '5').filter((b) => b.facetten.status === 'kantonal')).toHaveLength(8);
  });

  it('zeigt «8 von 115», nicht «8» — und «2» ohne Zusatz, wo nichts gedeckelt wurde', () => {
    const alle = bezuegeFuerArtikel(shard, '5');
    const kanten = waehleBezuege(alle, ['bge', 'bger', 'kantonal'], []);
    const s = html(
      <BezuegeZeile kanten={kanten} gesamt={shard.gesamtProArtikel['5']}
        ausgeblendet={alle.length - kanten.length} normZitat="Art. 5 StPO" />,
    );
    expect(s).toContain('8 von 115');   // kantonal: gedeckelt ⇒ Grundgesamtheit dazu
    expect(s).toContain('8 von 16');    // bge: ebenfalls gedeckelt
    // bger hat 2 von 2 — «2 von 2» wäre Lärm ohne Erkenntnis, also nur «2».
    expect(s).not.toContain('2 von 2');
  });

  it('rendert `gewicht` nirgends als Zahl — «nicht messbar» wird nie zu 0 (§8)', () => {
    const kantonal = bezuegeFuerArtikel(shard, '5').filter((b) => b.facetten.status === 'kantonal');
    // Vorbefund: kantonale Kanten tragen gewicht:null (der Zitier-Graph erkennt
    // ihre Geschäftsnummern nicht).
    expect(kantonal.every((b) => b.gewicht === null)).toBe(true);
    const s = html(<BezuegeZeile kanten={kantonal} gesamt={{ kantonal: 115 }} ausgeblendet={0} normZitat="Art. 5 StPO" />);
    expect(s).not.toContain('>0<');
    expect(s).not.toContain('null');
  });
});

describe('B4 · kein stilles Nichts (§8)', () => {
  it('filtert der Nutzer alles weg, weist die Zeile die ausgeblendete Menge aus', () => {
    const s = html(<BezuegeZeile kanten={[]} gesamt={{}} ausgeblendet={12} normZitat="Art. 5 StPO" />);
    expect(s).toContain('12');
    expect(s).toContain('ausgeblendet');
    expect(s).toContain('Leitentscheide zeigen');
  });

  it('ohne Kanten UND ohne Ausgeblendetes: gar keine Zeile (§15.2, kein Leerraum)', () => {
    expect(html(<BezuegeZeile kanten={[]} gesamt={{}} ausgeblendet={0} normZitat="Art. 5 StPO" />))
      .not.toContain('data-bezuege-zeile');
  });

  it('§7-Wortfeld: kein «geprüft»/«verifiziert» in der gerenderten Zeile', () => {
    const s = html(
      <BezuegeZeile kanten={[kante('bs_1', 'BES.2024.15', 'kantonal', 'BS')]}
        gesamt={{ kantonal: 115 }} ausgeblendet={3} normZitat="Art. 5 StPO" />,
    );
    expect(s).not.toMatch(/gepr(ü|&#x[0-9a-f]+;|ue)ft|verifiziert|gegengepr/i);
  });
});
