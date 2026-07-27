/**
 * G-AUFH-ART (W2·5j, 27.7.2026) — Reader zeigt Artikel mit dem amtlich
 * verifizierten `aufgehoben`-Feld (NormSnapshot.aufgehoben) sichtbar als
 * aufgehoben, unabhängig von der bisherigen Text-Heuristik
 * (`artikelGanzAufgehoben`, darstellung.ts).
 *
 * BEFUND (Auftrag): BS-132.100 §51 lag bis zum Adapter-Fix (adapter-lexwork.ts,
 * PR feat/kanton-aufgehoben-marker) als leerer Snapshot ohne jedes Signal vor —
 * der Reader zeigte zwar bereits (über die ältere Text-Heuristik) eine dezente
 * «· aufgehoben»-Markierung, aber OHNE amtliche Grundlage: dieselbe Heuristik
 * hätte JEDEN Extraktions-Leerlauf (Bug) genauso stumm als «aufgehoben»
 * ausgegeben. Diese Tests verankern, dass die Anzeige jetzt am VERIFIZIERTEN
 * Feld hängt, nicht (nur) am Text-Zufall.
 *
 * Der zweite Block beweist das «rot davor»: OHNE die Verdrahtung
 * (artikelGanzAufgehoben(e.bloecke, e.aufgehoben) in ArtikelLeser.tsx) hätte
 * ein Artikel mit `aufgehoben: true`, aber (hypothetisch) nicht-leerem
 * Wortlaut, KEINE Markierung gezeigt — reale BS/GL-Daten erzeugen diesen Fall
 * heute nicht (der Adapter setzt das Feld nur bei leerem Body), aber die
 * Lesesicht darf sich nicht auf diesen Zufall verlassen (§7).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelLeser } from '../pages/gesetz-leser/parts';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

const erlass: BrowseErlass = {
  key: 'BS-132.100', ebene: 'kanton', kanton: 'BS', kuerzel: '132.100',
  titel: 'Gesetz über Wahlen und Abstimmungen, Wahlgesetz (132.100)',
  sr: null, rechtsgebiet: 'oeffentlich', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'kanton/BS-132.100.json', artikelAnzahl: 101, stand: '2023-08-01',
  quelleUrl: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/132.100',
  fassungsToken: '7a3c76b5313d33f1918b2aeef9c4060d', pdfPfad: null,
};

// 1:1 aus dem regenerierten public/normtext/kanton/BS-132.100.json (§51).
const s51: NormSnapshot = {
  id: 'kanton/BS/132.100/art_51', ebene: 'kanton', quelle: 'BS',
  erlass: 'Gesetz über Wahlen und Abstimmungen, Wahlgesetz (132.100)',
  artikel: '51', artikelLabel: '§ 51',
  aufgehoben: true,
  bloecke: [{ absatz: null, text: '' }],
  stand: '2023-08-01',
  quelleUrl: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/132.100',
  abgerufen: '2026-07-27', fassungsToken: '7a3c76b5313d33f1918b2aeef9c4060d',
  sha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};

// 1:1 §76a: aufgehoben UND ein echter Randtitel gleichzeitig.
const s76a: NormSnapshot = {
  id: 'kanton/BS/132.100/art_76_a', ebene: 'kanton', quelle: 'BS',
  erlass: 'Gesetz über Wahlen und Abstimmungen, Wahlgesetz (132.100)',
  artikel: '76_a', artikelLabel: '§ 76a',
  titel: 'Zeitpunkt der Wahlvorschläge',
  aufgehoben: true,
  bloecke: [{ absatz: null, text: '' }],
  stand: '2023-08-01',
  quelleUrl: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/132.100',
  abgerufen: '2026-07-27', fassungsToken: '7a3c76b5313d33f1918b2aeef9c4060d',
  sha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};

const render = (e: NormSnapshot) =>
  renderToString(<ArtikelLeser e={e} erlass={erlass} basisPfad="/gesetze/kanton/bs/132.100" />);

describe('G-AUFH-ART — BS-132.100 §51/§76a: sichtbarer Aufgehoben-Vermerk', () => {
  it('§51 (aufgehoben, kein Titel): Status «· aufgehoben» sichtbar, Chevron unterdrückt', () => {
    const out = render(s51);
    expect(out).toContain('· aufgehoben');
    expect(out).not.toContain('▾');
  });

  it('§76a (aufgehoben UND echter Randtitel): Randtitel bleibt, Status «· aufgehoben» zusätzlich sichtbar', () => {
    const out = render(s76a);
    expect(out).toContain('Zeitpunkt der Wahlvorschläge');
    expect(out).toContain('· aufgehoben');
  });
});

// Der eigentliche Rot-Beweis (§6.7): ein Artikel, dessen Wortlaut FÜR SICH
// GENOMMEN lebend aussieht, aber dessen `aufgehoben`-Feld amtlich true ist.
// Ohne die Verdrahtung in ArtikelLeser.tsx (artikelGanzAufgehoben(e.bloecke,
// e.aufgehoben)) bliebe dieser Artikel FÄLSCHLICH offen/unmarkiert — die reine
// Text-Heuristik sieht hier «lebenden» Wortlaut und würde nie kollabieren.
const hypothetischMarkiert: NormSnapshot = {
  ...s51,
  id: 'kanton/BS/132.100/art_51_hyp',
  artikel: '51_hyp',
  bloecke: [{ absatz: null, text: 'Dieser Wortlaut sähe für die Text-Heuristik lebend aus.' }],
};

describe('G-AUFH-ART — das Feld schlägt die Text-Heuristik (Rot-Beweis)', () => {
  it('aufgehoben:true kollabiert AUCH einen scheinbar lebenden Wortlaut', () => {
    const out = render(hypothetischMarkiert);
    expect(out).toContain('· aufgehoben');
    expect(out).not.toContain('▾');
  });
});
