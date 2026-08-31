// scripts/datenhaltung/suche-kern.test.ts
// W2·13-KANTONE K-3 / F35: der Artikel-Treffer der Edge-Suche trägt die EBENE des
// Erlasses (und kantonal sein Kürzel) bis an die Netzgrenze.
//
// WARUM EIGENE DATEI (nicht suche.test.ts): die dortigen Tests bauen im
// `beforeAll` beide HOT-DBs aus den echten Quellen (Budget 95 s, s. Kopf jener
// Datei). Die Zeilen-Formung ist eine REINE Funktion — sie braucht keine DB, und
// ein Beweis, der 95 s wartet, wird im Alltag nicht gefahren. Hier laufen darum
// nur die importfreien Bausteine gegen handgeschriebene Roh-Zeilen.
import { describe, expect, it } from 'vitest';
import { formeArtikelTreffer, SQL_ARTIKEL_TREFFER, type ArtikelRohzeile } from './suche-kern';

const BLOECKE = JSON.stringify([{ text: 'Der Anwalt hat Anspruch auf ein Honorar.' }]);

function zeile(ueber: Partial<ArtikelRohzeile> = {}): ArtikelRohzeile {
  return {
    erlass_key: 'OR',
    art_id: 'art_330_a',
    artikel: '330_a',
    artikel_label: 'Art. 330a',
    quelle_url: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_330_a',
    bloecke_json: BLOECKE,
    abkuerzung: 'OR',
    ebene: 'bund',
    kanton: null,
    ...ueber,
  };
}

describe('formeArtikelTreffer: Ebene + Kanton in der Fundstelle (F35)', () => {
  it('Kanton-Zeile → ebene «kanton» und das Kantonskürzel', () => {
    const t = formeArtikelTreffer(
      zeile({
        erlass_key: 'AG-291.150',
        art_id: 'art_1',
        artikel: '1',
        artikel_label: '§ 1',
        abkuerzung: 'AnwT',
        quelle_url: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/291.150',
        ebene: 'kanton',
        kanton: 'AG',
      }),
      'honorar',
    );
    expect(t.fundstelle.ebene).toBe('kanton');
    expect(t.fundstelle.kanton).toBe('AG');
    // Die bestehenden Fundstellen-Felder bleiben, was sie waren.
    expect(t.fundstelle.erlass).toBe('AG-291.150');
    expect(t.fundstelle.artikel).toBe('1');
  });

  it('Bund-Zeile → ebene «bund», KEIN kanton-Feld (kein leeres Kürzel im Draht)', () => {
    const t = formeArtikelTreffer(zeile(), 'honorar');
    expect(t.fundstelle.ebene).toBe('bund');
    expect('kanton' in t.fundstelle).toBe(false);
  });

  it('Alt-Zeile ohne ebene/kanton → Fundstelle wie bisher (kein undefined im JSON)', () => {
    // Ein Aufrufer, der die neuen Spalten nicht selektiert (oder eine gecachte
    // Alt-Antwort), darf keine Scheinauskunft erzeugen: dann steht schlicht
    // nichts da, und der Client fällt auf sein Alt-Verhalten zurück (§8).
    const alt = zeile() as Partial<ArtikelRohzeile>;
    delete alt.ebene;
    delete alt.kanton;
    const t = formeArtikelTreffer(alt as ArtikelRohzeile, 'honorar');
    expect('ebene' in t.fundstelle).toBe(false);
    expect('kanton' in t.fundstelle).toBe(false);
    expect(JSON.parse(JSON.stringify(t.fundstelle))).toEqual({
      erlass: 'OR',
      artikel: '330_a',
      quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_330_a',
    });
  });

  it('ADDITIV: die Top-Level-Form des Treffers ist unverändert (Alt-Clients)', () => {
    const t = formeArtikelTreffer(zeile({ ebene: 'kanton', kanton: 'AG' }), 'honorar');
    expect(Object.keys(t).sort()).toEqual(['fundstelle', 'id', 'snippet', 'titel']);
    // Kein Volltext-Leck durch die neuen Spalten.
    expect(JSON.stringify(t)).not.toMatch(/"bloecke"|"bloecke_json"|"volltext"/);
  });
});

describe('SQL_ARTIKEL_TREFFER liefert die Spalten, aus denen die Fundstelle gebaut wird', () => {
  it('selektiert e.ebene und e.kanton (sonst wäre das DTO-Feld immer leer)', () => {
    // Identitäts-Treffer mit Wortgrenze (§7), nicht blosse Substring-Präsenz:
    // «ebene» steckt auch in «erlass_key» nicht, aber «kanton» in «kanton_x»
    // sehr wohl — der Alias muss exakt so heissen.
    expect(SQL_ARTIKEL_TREFFER).toMatch(/\be\.ebene\s+AS\s+ebene\b/);
    expect(SQL_ARTIKEL_TREFFER).toMatch(/\be\.kanton\s+AS\s+kanton\b/);
  });
});
