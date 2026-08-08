/**
 * W2·19-GLIEDERUNG — Bug-Check 9.8.2026, die Befunde B2 / B3 / B4 / B7.
 *
 * Vier Fälle, die es vor dieser Runde NICHT gab und die genau das prüfen, was
 * die Gegenprüfung am gebauten Stand gefunden hat. Jeder Fall ist gegen den
 * Stand VOR seinem Fix rot gesehen worden (§6.7) — der jeweilige Rot-Beweis
 * steht im Commit-Body.
 *
 * Warum gegen die ECHTEN Snapshots (Muster: gliederung-modell-w219.test.ts):
 * alle vier Befunde sind Kanten des Korpus, nicht der Fantasie. B2 tritt nur
 * auf, wo ein Erlass MITTEN im Baum Artikel ohne Gliederung hat (BS-569.500,
 * ZG-641.1, KKV); B4/B7 nur, wo der Anhang vollständig im Sidecar-Baum steht
 * (AIG, ASYLG, KKV). Erfundene Bäume prüften hier nur die eigene Annahme.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { baueGliederungsbaum, type StrukturMap, type Sektion } from '../lib/normtext/browse';
import type { NormSnapshot } from '../lib/normtext/typen';
import { kuratiereTocSektionen } from '../pages/gesetz-leser/berechnungen';
import { pfadZu } from '../pages/gesetz-leser/helpers';
import { klappZeile } from '../pages/gesetz-leser/tocAutoZuklappen';
import {
  baueGliederungsModell, findeSynthPfad, findeMarke, zeileIstOffen, uebersetzeRohPfad, flacheZeilen,
  ID_ANHANG, ID_MITTE,
  type GliederungsModell, type GliederungsKnoten,
} from '../pages/gesetz-leser/gliederungsModell';

function lade(ebene: 'bund' | 'kanton', key: string): GliederungsModell & {
  eintraege: NormSnapshot[]; sektionen: Sektion[];
} {
  const eintraege = (JSON.parse(readFileSync(`public/normtext/${ebene}/${key}.json`, 'utf8')) as {
    eintraege: NormSnapshot[];
  }).eintraege;
  const strPfad = `public/normtext/struktur/${ebene}/${key}.json`;
  const struktur: StrukturMap | null = existsSync(strPfad)
    ? (JSON.parse(readFileSync(strPfad, 'utf8')) as { artikel: StrukturMap }).artikel
    : null;
  const roh = baueGliederungsbaum(eintraege, struktur);
  const sektionen = kuratiereTocSektionen(roh.sektionen);
  const modell = baueGliederungsModell({
    sektionen, ohneGliederung: roh.ohneGliederung, eintraege, struktur, startSichtbarGo: true,
  });
  return { ...modell, eintraege, sektionen };
}

/** Findet die Leiste diesen Artikel überhaupt? Genau die beiden Wege, die der
 *  Scroll-Spy geht: Rohbaum-Pfad (amtliche Gliederung) oder synthetische Zeile. */
function erreichbar(m: GliederungsModell & { sektionen: Sektion[] }, token: string): boolean {
  const roh = pfadZu(m.sektionen, (s) => s.artikel.some((a) => a.artikel === token));
  if (roh && roh.length > 0) return true;
  return findeSynthPfad(m.knoten, token) !== null;
}

// ═══ B2 · Freie Artikel ZWISCHEN Baumknoten ══════════════════════════════════
describe('B2 — Mittelgruppen: kein Artikel fällt stumm aus dem Modell', () => {
  // Die drei belegten Fälle mit ihrer gemessenen Lücke VOR dem Fix. Die Zahlen
  // stehen hier, damit ein künftiger Korpus-Zugang mit derselben Kante nicht
  // stillschweigend durchrutscht.
  const faelle: Array<[ 'bund' | 'kanton', string, number ]> = [
    ['kanton', 'BS-569.500', 5],  // 5 von 10 Artikeln
    ['kanton', 'ZG-641.1', 2],    // 2 von 14
    ['bund', 'KKV', 1],           // 1 von 211
  ];
  for (const [ebene, key, luecke] of faelle) {
    it(`${key}: alle Artikel erreichbar (vor dem Fix fehlten ${luecke})`, () => {
      const m = lade(ebene, key);
      const verloren = m.eintraege.filter((e) => !erreichbar(m, e.artikel)).map((e) => e.artikel);
      expect(verloren, `unerreichbar über die Leiste: ${verloren.join(', ')}`).toEqual([]);
    });
  }

  it('BS-569.500: die Lücken stehen als eigene «Ohne Abschnitt»-Zeilen im Baum, nicht in einer fremden Sektion', () => {
    const m = lade('kanton', 'BS-569.500');
    const mitte = m.knoten.filter((k) => k.art === 'mitte');
    expect(mitte.length).toBeGreaterThan(0);
    // §8: die Gruppe behauptet keine Zugehörigkeit zu einer amtlichen Sektion —
    // sie ist eine eigene Zeile mit eigenem Bereichs-Etikett.
    for (const k of mitte) {
      expect(k.id.startsWith(`${ID_MITTE}:`)).toBe(true);
      expect(k.label).toBe('Ohne Abschnitt');
      expect(k.tokens?.length ?? 0).toBeGreaterThan(0);
      expect(k.bereich).toBeTruthy();
    }
    // Und sie stehen in Dokumentreihenfolge zwischen den Sektionen, nicht am Ende.
    const stellen = m.knoten.map((k) => k.art);
    expect(stellen.indexOf('mitte')).toBeGreaterThan(stellen.indexOf('sektion'));
    expect(stellen.lastIndexOf('mitte')).toBeLessThan(stellen.length - 1);
  });

  it('die Mittelgruppe ändert die Modus-Kette nicht (zeilenVoll zählt nur Sektionen)', () => {
    // Sonst verschöbe ein reiner Darstellungs-Zugewinn die Schwelle «B1 offen ≤
    // 40 Zeilen» und damit den Startzustand fremder Erlasse (§6 Verhaltensneutralität).
    const m = lade('kanton', 'BS-569.500');
    expect(m.modus).toBe('b1-offen');
    expect(m.kennzahlen.zeilenVoll).toBeLessThan(m.kennzahlen.zeilenGesamt);
  });
});

// ═══ B4 · Positionsmarke im Anhang (Rohpfad→Modellpfad) ══════════════════════
describe('B4 — Marke findet den umgehängten Anhang-Ast', () => {
  const faelle: Array<[ 'bund' | 'kanton', string ]> = [
    ['bund', 'AIG'], ['bund', 'ASYLG'], ['bund', 'KKV'],
  ];
  for (const [ebene, key] of faelle) {
    it(`${key}: jeder Anhang-Artikel mit Rohpfad trägt genau EINE Marke`, () => {
      const m = lade(ebene, key);
      const ohneMarke: string[] = [];
      for (const e of m.eintraege) {
        const roh = pfadZu(m.sektionen, (s) => s.artikel.some((a) => a.artikel === e.artikel));
        if (!roh || roh.length === 0) continue;
        const ids = uebersetzeRohPfad(m.umhaengPraefix, roh);
        // Der Aktiv-Pfad klappt seinen Ast auf (Auto-Akkordeon) — genau so misst
        // auch der Reader, sonst prüfte der Fall einen Zustand, den es nie gibt.
        const offen = Object.fromEntries(ids.map((id) => [id, true]));
        if (findeMarke(m.knoten, ids, offen, m.startOffeneTiefe) === null) ohneMarke.push(e.artikel);
      }
      expect(ohneMarke, `ohne Positionsmarke: ${ohneMarke.join(', ')}`).toEqual([]);
    });
  }

  it('AIG: die Übersetzung setzt das Präfix «Anhänge» vor den Rohpfad', () => {
    const m = lade('bund', 'AIG');
    const roh = pfadZu(m.sektionen, (s) => s.artikel.some((a) => a.artikel === 'annex_1'));
    expect(roh).not.toBeNull();
    const ids = uebersetzeRohPfad(m.umhaengPraefix, roh!);
    expect(ids[0]).toBe(ID_ANHANG);
    expect(ids.slice(1)).toEqual(roh);
    // Ein Pfad, der NICHT umgehängt wurde, bleibt unberührt (keine Blind-Präfixe).
    const rohStamm = pfadZu(m.sektionen, (s) => s.artikel.some((a) => a.artikel === '1'));
    expect(uebersetzeRohPfad(m.umhaengPraefix, rohStamm ?? [])).toEqual(rohStamm);
    expect(uebersetzeRohPfad(m.umhaengPraefix, [])).toEqual([]);
  });
});

// ═══ B7 · Anhang-Wurzel ist ein bedienbares Sprungziel ═══════════════════════
describe('B7 — «Anhänge» hat ein Sprungziel', () => {
  for (const [ebene, key] of [['bund', 'AIG'], ['bund', 'ASYLG'], ['bund', 'KKV']] as const) {
    it(`${key}: die Anhang-Wurzel trägt ersterArtikel`, () => {
      const m = lade(ebene, key);
      const wurzel = m.knoten.find((k) => k.id === ID_ANHANG);
      expect(wurzel, 'keine Anhang-Wurzel im Modell').toBeTruthy();
      expect(wurzel!.ersterArtikel, 'Knopf ohne Sprungziel = toter Klick').toBeTruthy();
      // Und es ist wirklich ein Artikel des Anhangs, nicht irgendein Token.
      expect(m.eintraege.some((e) => e.artikel === wurzel!.ersterArtikel)).toBe(true);
    });
  }
});

// ═══ B3 · Verdichtete Zeile: EIN Zielwert statt n Einzel-Flips ═══════════════
describe('B3 — die verdichtete Zeile lässt sich wieder schliessen', () => {
  /** Eine echte verdichtete Zeile MIT Kindern aus dem Korpus — der Fall, in dem
   *  der Chevron überhaupt erscheint. */
  function verdichteteZeileMitKindern(m: GliederungsModell): GliederungsKnoten {
    const treffer = flacheZeilen(m.knoten)
      .find((k) => k.ids.length > 1 && k.kinder.length > 0);
    expect(treffer, 'kein verdichteter Knoten mit Kindern im Referenz-Erlass').toBeTruthy();
    return treffer!;
  }

  it('ZGB: Sprung öffnet die Zeile halb — der nächste Chevron-Klick schliesst sie trotzdem', () => {
    const m = lade('bund', 'ZGB');
    const k = verdichteteZeileMitKindern(m);
    // 1 · Der Sektions-Sprung hinterliess bis zum Fix genau diesen Zustand: nur
    //     die ÄUSSERSTE Id offen (pfadZu kennt die inneren Stufen nicht).
    const nachSprung: Record<string, boolean> = { [k.ids[0]]: true };
    expect(zeileIstOffen(k, nachSprung, m.startOffeneTiefe)).toBe(true);
    // 2 · Ein Chevron-Klick muss die Zeile schliessen. Mit n Einzel-Flips kippte
    //     die äussere Id auf `false` und die inneren auf `true` — `.some(Boolean)`
    //     blieb wahr, der Ast war sitzungsfest offen (genau der Rot-Fall).
    const nachKlick = klappZeile(nachSprung, k.ids, true);
    expect(zeileIstOffen(k, nachKlick, m.startOffeneTiefe)).toBe(false);
    for (const id of k.ids) expect(nachKlick[id]).toBe(false);
  });

  it('ein zweiter Klick öffnet sie wieder — alle Stufen gemeinsam', () => {
    const m = lade('bund', 'ZGB');
    const k = verdichteteZeileMitKindern(m);
    const zu = klappZeile({}, k.ids, true);
    const auf = klappZeile(zu, k.ids, zeileIstOffen(k, zu, m.startOffeneTiefe));
    expect(zeileIstOffen(k, auf, m.startOffeneTiefe)).toBe(true);
    for (const id of k.ids) expect(auf[id]).toBe(true);
  });

  it('eine Zeile ohne Eintrag in der Klapp-Karte richtet sich nach ihrem sichtbaren Zustand', () => {
    // B1-offen-Erlasse starten sichtbar (Entscheid David 8.8.2026). Ohne den
    // mitgegebenen `istOffen` läse ein Toggle aus der leeren Karte «zu» und
    // öffnete eine bereits offene Zeile ein zweites Mal — der erste Klick täte
    // dann nichts.
    const m = lade('bund', 'ChemRRV'); // b1-offen, Anhang-Wurzel mit startOffen
    const k = flacheZeilen(m.knoten).find((x) => x.kinder.length > 0);
    expect(k, 'kein Knoten mit Kindern im Referenz-Erlass').toBeTruthy();
    const sichtbar = zeileIstOffen(k!, {}, m.startOffeneTiefe);
    const nachKlick = klappZeile({}, k!.ids, sichtbar);
    expect(zeileIstOffen(k!, nachKlick, m.startOffeneTiefe)).toBe(!sichtbar);
  });
});
