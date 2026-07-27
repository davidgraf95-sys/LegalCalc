import { describe, it, expect } from 'vitest';
import { berechneFnPositionen, richteMarkerAus } from '../../scripts/normtext/fussnoten-offsets';
import { parseArtikelInner } from '../../scripts/normtext/extrahiere-fedlex';
import { extrahiereFussnoten } from '../../scripts/normtext/fussnoten-extrahiere';

// FN-5/M14 Wort-Position-Check: Offsets werden NUR emittiert, wenn die
// Platzhalter-Ausrichtung zeichengenau gegen den unveränderten Parse beweisbar
// ist. Der Check muss auch SCHEITERN können (§6.7 — Negativ-Fälle unten).

const A = '\uE000';
const B = '\uE001';

/** Fixture-Helfer: Artikel-Body → Referenz-Parse + Positionen. */
function pos(inner: string) {
  const ref = parseArtikelInner(inner);
  return { ref, map: berechneFnPositionen(inner, { bloecke: ref.bloecke }) };
}

describe('richteMarkerAus (Zwei-Zeiger-Ausrichtung)', () => {
  it('Marker direkt am Wort (kein Leerraum)', () => {
    const m = richteMarkerAus(`Der Vertrag${A}fn-10${B} ist geschlossen.`, 'Der Vertrag ist geschlossen.');
    expect(m).toEqual([{ id: 'fn-10', o: 'Der Vertrag'.length }]);
  });
  it('Marker beidseitig in Leerraum → klebt am Wort davor', () => {
    const m = richteMarkerAus(`wort ${A}fn-1${B} mehr`, 'wort mehr');
    expect(m).toEqual([{ id: 'fn-1', o: 4 }]);
  });
  it('Marker vor Satzzeichen (Referenz ohne Leerzeichen, Fallback-Pfad)', () => {
    const m = richteMarkerAus(`wort ${A}fn-2${B}.`, 'wort.');
    expect(m).toEqual([{ id: 'fn-2', o: 4 }]);
  });
  it('Marker am Textende', () => {
    const m = richteMarkerAus(`wort${A}fn-3${B}`, 'wort');
    expect(m).toEqual([{ id: 'fn-3', o: 4 }]);
  });
  it('zwei Marker im selben Text', () => {
    const m = richteMarkerAus(`a${A}fn-1${B} und b${A}fn-2${B}.`, 'a und b.');
    expect(m).toEqual([
      { id: 'fn-1', o: 1 },
      { id: 'fn-2', o: 7 },
    ]);
  });
  it('SCHEITERT bei abweichender Referenz (kein geratener Offset, §1)', () => {
    expect(richteMarkerAus(`Der Vertrag${A}fn-10${B} ist geschlossen.`, 'Der Vertrag ist gekündigt.')).toBeNull();
    expect(richteMarkerAus(`kurz${A}fn-1${B}`, 'kurz und länger')).toBeNull();
  });
});

describe('berechneFnPositionen (Platzhalter-Parse gegen Referenz-Parse)', () => {
  it('Standard-Absatz: Offset an der Wortstelle, Absatznummer unberührt', () => {
    const inner =
      '<p class="absatz"><sup>1</sup> Der Vertrag<sup><a href="#fn-10" id="fnbck-10">4</a></sup> ist geschlossen.</p>';
    const { ref, map } = pos(inner);
    expect(ref.bloecke).toHaveLength(1);
    expect(ref.bloecke[0].absatz).toBe('1');
    const p = map.get('fn-10');
    expect(p).toBeDefined();
    expect(p!.b).toBe(0);
    expect(p!.it).toBeUndefined();
    expect(ref.bloecke[0].text.slice(0, p!.o)).toBe('Der Vertrag');
    expect(p!.l).toBe(ref.bloecke[0].text.length);
  });
  it('Marker im lit-Item-Text: it-Index + Offset', () => {
    const inner =
      '<p class="absatz"><sup>1</sup> Es gilt:</p>' +
      '<dl><dt>a.</dt><dd>die erste<sup><a href="#fn-20">7</a></sup> Regel;</dd>' +
      '<dt>b.</dt><dd>die zweite Regel.</dd></dl>';
    const { ref, map } = pos(inner);
    const p = map.get('fn-20');
    expect(p).toBeDefined();
    expect(p!.b).toBe(0);
    expect(p!.it).toBe(0);
    const itemText = ref.bloecke[0].items![0].text;
    expect(itemText.slice(0, p!.o)).toBe('die erste');
    expect(p!.l).toBe(itemText.length);
  });
  it('Marker in der <dt>-Marke: KEIN Offset (Fallback Item-Ende), Struktur intakt', () => {
    const inner =
      '<p class="absatz"><sup>1</sup> Es gilt:</p>' +
      '<dl><dt>a.<sup><a href="#fn-30">9</a></sup></dt><dd>die Regel.</dd></dl>';
    const { ref, map } = pos(inner);
    expect(map.get('fn-30')).toBeUndefined();
    expect(ref.bloecke[0].items![0].marke).toBe('a');
  });
  it('Artikel ohne Marker → leere Map', () => {
    const { map } = pos('<p class="absatz"><sup>1</sup> Nur Text.</p>');
    expect(map.size).toBe(0);
  });
  it('SCHEITERN sichtbar: manipulierte Referenz-Blöcke → keine Offsets (§6.7)', () => {
    const inner =
      '<p class="absatz"><sup>1</sup> Der Vertrag<sup><a href="#fn-10">4</a></sup> ist geschlossen.</p>';
    const ref = parseArtikelInner(inner);
    const sabotiert = [{ ...ref.bloecke[0], text: 'Ein anderer Wortlaut steht hier.' }];
    expect(berechneFnPositionen(inner, { bloecke: sabotiert }).size).toBe(0);
  });
});

describe('extrahiereFussnoten trägt pos (Sidecar-Integration)', () => {
  it('pos landet an der Fussnote; absatz-/item-Zuordnung unverändert', () => {
    const html =
      '<article id="art_1"><h6>Art. 1</h6>' +
      '<p class="absatz"><sup>1</sup> Der Vertrag<sup><a href="#fn-10" id="fnbck-10">4</a></sup> ist geschlossen.</p>' +
      '<div class="footnotes"><p id="fn-10"><sup><a href="#fnbck-10">4</a></sup> Fassung gemäss Ziff. I.</p></div>' +
      '</article>';
    const perArt = extrahiereFussnoten(html);
    const fn = perArt['1']?.[0];
    expect(fn).toBeDefined();
    expect(fn!.nr).toBe('4');
    expect(fn!.absatz).toBe('1');
    expect(fn!.pos).toBeDefined();
    expect(fn!.pos!.b).toBe(0);
    expect(fn!.pos!.o).toBe('Der Vertrag'.length);
  });
});
