import { describe, expect, it } from 'vitest';
import {
  bestimmungsWort, titelKennung, zaehlform, zeigeVolltitel,
} from '../pages/gesetz-leser/v3/erlassAnsicht';
import { titelOhneKlammerSuffix } from '../pages/gesetz-leser/helpers';
import { wahlAusSpeicher } from '../components/layout/useSeitenleiste';
import {
  artikelFundstellen, sucheImErlass, AUSSCHNITT_MAX, type LeserSuchIndex,
} from '../pages/gesetz-leser/leserSuche';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ═══ H2b-NACHZUG · die reinen Regeln der drei Prüfer-Befunde ════════════════
//
// Diese Datei prüft, was ohne Browser prüfbar ist: A1 (Seitenleisten-Wahl),
// B1 (welche Länge über die Kennung entscheidet), B2 (wann der Volltitel
// entfällt), B8 (eine Ableitung, eine Zählform) und Ä29 (Wortgrenze im
// Ausschnitt). Alles DOM-frei (§2), Node-Env wie im Repo üblich.
//
// ROT ZU BEKOMMEN — je Block am Fall notiert.

// ── A1 · «noch nicht gewählt» vs. Wahl, über den Schlüsselwechsel hinweg ─────
// ROT: in `useSeitenleiste.wahlAusSpeicher` den Alt-Zweig auf `alt === '0'`
// erweitern (dann zählt der Mount-Schrieb des Alt-Stands wieder als Wahl) oder
// den v2-Zweig entfernen.
describe('A1 · die Seitenleisten-Wahl über den Schlüsselwechsel (Tri-State)', () => {
  it('ohne beide Schlüssel gibt es keine Wahl — der Bereich entscheidet', () => {
    expect(wahlAusSpeicher(null, null)).toBe(null);
  });

  it('der neue Schlüssel gewinnt in beiden Richtungen', () => {
    expect(wahlAusSpeicher('1', null)).toBe(true);
    expect(wahlAusSpeicher('0', null)).toBe(false);
    // …und schlägt jeden Alt-Wert, auch einen widersprechenden.
    expect(wahlAusSpeicher('0', '1')).toBe(false);
    expect(wahlAusSpeicher('1', '0')).toBe(true);
  });

  it('Alt-Wert «1» zählt als Wahl — eingeklappt war NIE die Vorgabe', () => {
    expect(wahlAusSpeicher(null, '1')).toBe(true);
  });

  it('Alt-Wert «0» zählt NICHT als Wahl — das schrieb der Alt-Stand bei jedem Mount', () => {
    // DAS ist der Befund A1: H2b las diese «0» als «Nutzer will offen», womit die
    // Vorgabe «im Leser eingeklappt» nur in fabrikneuen Profilen griff.
    expect(wahlAusSpeicher(null, '0')).toBe(null);
  });

  it('unbekannte Werte sind keine Wahl', () => {
    for (const v of ['', 'ja', '2', 'true']) {
      expect(wahlAusSpeicher(null, v), `Alt-Wert «${v}»`).toBe(null);
      expect(wahlAusSpeicher(v, null), `v2-Wert «${v}»`).toBe(null);
    }
  });
});

// ── B1 · gemessen wird, was gedruckt wird ────────────────────────────────────
// ROT: in `erlassAnsicht.titelKennung` `titelOhneKlammerSuffix(erlass.titel)`
// wieder durch `erlass.titel.trim()` ersetzen — dann bekommt MSchG die Kennung.
describe('B1 · die Kennung folgt der ANGEZEIGTEN Titellänge', () => {
  const e = (titel: string, kuerzel: string): Pick<BrowseErlass, 'titel' | 'kuerzel'> =>
    ({ titel, kuerzel } as Pick<BrowseErlass, 'titel' | 'kuerzel'>);

  // Amtliche Wortlaute aus `public/normtext/register.json` (Stand 17.8.2026).
  const MSCHG_TITEL = 'Bundesgesetz über den Schutz von Marken und Herkunftsangaben (Markenschutzgesetz, MSchG)';
  const LUGUE_TITEL = 'Übereinkommen über die gerichtliche Zuständigkeit und die Anerkennung und '
    + 'Vollstreckung von Entscheidungen in Zivil- und Handelssachen (Lugano-Übereinkommen, LugÜ)';

  it('das Klammer-Suffix fällt, aber nur am Ende', () => {
    expect(titelOhneKlammerSuffix(MSCHG_TITEL))
      .toBe('Bundesgesetz über den Schutz von Marken und Herkunftsangaben');
    // Klammern MITTEN im Titel bleiben — sonst verlöre «Verordnung (EU) …» ihren Sinn.
    expect(titelOhneKlammerSuffix('Verordnung (EU) 2016/679 über den Datenschutz'))
      .toBe('Verordnung (EU) 2016/679 über den Datenschutz');
  });

  it('MSchG: angezeigt 60 Zeichen ⇒ KEINE vorangestellte Kennung (roh wären es 87)', () => {
    expect(titelOhneKlammerSuffix(MSCHG_TITEL).length).toBeLessThanOrEqual(80);
    expect(MSCHG_TITEL.length).toBeGreaterThan(80);
    expect(titelKennung(e(MSCHG_TITEL, 'MSchG'))).toBe(null);
  });

  it('LugÜ: auch angezeigt weit über 80 Zeichen ⇒ Kennung bleibt vorangestellt', () => {
    expect(titelOhneKlammerSuffix(LUGUE_TITEL).length).toBeGreaterThan(80);
    expect(titelKennung(e(LUGUE_TITEL, 'LugÜ'))).toBe('LugÜ');
  });

  it('ohne Kürzel gibt es keine Kennung, und ein Titel, der mit dem Kürzel beginnt, bekommt keine', () => {
    expect(titelKennung(e(LUGUE_TITEL, '   '))).toBe(null);
    expect(titelKennung(e(`Finanzreglement ${'x'.repeat(90)}`, 'Finanzreglement'))).toBe(null);
  });
});

// ── B2 · WORTGLEICH, nicht «fängt gleich an» ─────────────────────────────────
// ROT: in `erlassAnsicht.zeigeVolltitel` auf `startsWith` zurückstellen — dann
// verlieren BS-BeE 610.100 und AsylG ihren Volltitel wieder.
describe('B2 · der Volltitel entfällt nur bei Wortgleichheit mit dem Kürzel', () => {
  const e = (titel: string, kuerzel: string): Pick<BrowseErlass, 'titel' | 'kuerzel'> =>
    ({ titel, kuerzel } as Pick<BrowseErlass, 'titel' | 'kuerzel'>);

  it('ZH-211.11: Titel = Kürzel + SR-Suffix ⇒ Volltitel entfällt (Ä21 bleibt erledigt)', () => {
    expect(zeigeVolltitel(e(
      'Gebührenverordnung des Obergerichts (GebV OG) (LS 211.11)',
      'Gebührenverordnung des Obergerichts (GebV OG)',
    ))).toBe(false);
  });

  it('BS-BeE 610.100: der Titel sagt mehr als das Kürzel ⇒ Volltitel BLEIBT', () => {
    // Der Befund: zwei BS-Erlasse tragen das Kürzel «Finanzreglement». Ohne
    // Volltitel sind ihre Köpfe nicht zu unterscheiden (§8).
    expect(zeigeVolltitel(e(
      'Finanzreglement über das Rechnungswesen der Einwohnergemeinde Bettingen',
      'Finanzreglement',
    ))).toBe(true);
    expect(zeigeVolltitel(e(
      'Reglement über das Finanz- und Rechnungswesen, das Inkasso- und das '
      + 'Nachzahlungsverfahren der Gerichte',
      'Finanzreglement',
    ))).toBe(true);
  });

  it('AsylG: «Asylgesetz» beginnt zufällig mit «AsylG» ⇒ Volltitel BLEIBT', () => {
    expect(zeigeVolltitel(e('Asylgesetz (AsylG)', 'AsylG'))).toBe(true);
    expect(zeigeVolltitel(e('Bürgerrechtsgesetz', 'BüRG'))).toBe(true);
  });

  it('Bund/Verordnung/Staatsvertrag unberührt, leeres Kürzel zeigt immer', () => {
    expect(zeigeVolltitel(e('Schweizerische Strafprozessordnung (Strafprozessordnung, StPO)', 'StPO'))).toBe(true);
    expect(zeigeVolltitel(e('Irgendein Titel', '  '))).toBe(true);
  });

  it('reine Kürzel-Titel mit Nummer-Suffix bleiben unterdrückt (kein Rückschritt)', () => {
    expect(zeigeVolltitel(e('ABRG (621.12)', 'ABRG'))).toBe(false);
    expect(zeigeVolltitel(e('Anwaltsgesetz (145.52)', 'Anwaltsgesetz'))).toBe(false);
  });
});

// ── B8 · eine Ableitung, eine Zählform ──────────────────────────────────────
// ROT: `bestimmungsWort` auf einen festen Rückgabewert 'Artikel' setzen.
describe('B8 · Bestimmungswort und Zählform kommen aus EINER Quelle', () => {
  it('kantonaler §-Erlass zählt Paragraphen, Bundeserlass Artikel', () => {
    expect(bestimmungsWort('ZH-211.11')).toBe('Paragraphen');
    expect(bestimmungsWort('STPO')).toBe('Artikel');
    // Unbekannter Key ⇒ «Artikel», wie das Register-Verhalten es vorgibt.
    expect(bestimmungsWort('gibt-es-nicht')).toBe('Artikel');
  });

  it('die Einzahl ist grammatisch richtig, die Mehrzahl unverändert', () => {
    expect(zaehlform(1, 'Paragraphen')).toBe('Paragraph');
    expect(zaehlform(2, 'Paragraphen')).toBe('Paragraphen');
    expect(zaehlform(0, 'Paragraphen')).toBe('Paragraphen');
    expect(zaehlform(1, 'Artikel')).toBe('Artikel');
    expect(zaehlform(9, 'Artikel')).toBe('Artikel');
  });
});

// ── Ä29 · Kontext-Ausschnitte schneiden an der Wortgrenze ───────────────────
// ROT: in `leserSuche.baueAusschnitt` `wortAnfangAb`/`wortEndeBis` durch die
// rohen `Math.max`/`Math.min`-Werte ersetzen — dann beginnt der StPO-Ausschnitt
// unten wieder mitten im Wort.
describe('Ä29 · der Ausschnitt beginnt und endet an einer Wortgrenze', () => {
  // Ein Text, der den Befund erzeugt: der Begriff steht so weit hinten, dass das
  // Kontext-Fenster (ein Drittel von 120 − Trefferlänge ≈ 37 Zeichen) mitten in
  // ein Wort fällt.
  const LANG = 'Die zuständige Behörde erhebt für ihre Verfügungen und Entscheide '
    + 'eine Spruchgebühr und Schreibgebühren nach Massgabe der Verordnung, soweit das '
    + 'Gesetz nichts anderes bestimmt und die Kosten nicht dem Bund zufallen.';

  function index(text: string): LeserSuchIndex {
    return {
      key: 'TEST',
      artikel: [{
        token: 'art-1', label: 'Art. 1', pos: 0, randtitel: null, gruppe: null,
        segmente: [{ feld: 't', quelle: 'Fliesstext', malbar: 'immer', text }],
      }],
    };
  }

  function ausschnittFuer(text: string, begriff: string) {
    return sucheImErlass(index(text), begriff)[0]?.ausschnitt ?? null;
  }

  it('«vor» beginnt nicht mit einem Wortrest', () => {
    const a = ausschnittFuer(LANG, 'Verordnung');
    expect(a, 'kein Ausschnitt gebaut — die Sonde prüfte nichts').not.toBe(null);
    // Der Ausschnitt ist gekürzt (die Ellipse steht davor) …
    expect(a!.vor.startsWith('… ')).toBe(true);
    // … und das erste echte Zeichen danach beginnt ein Wort: davor steht im
    // Quelltext ein Leerraum.
    const rest = a!.vor.slice(2);
    const idx = LANG.indexOf(rest);
    expect(idx, 'der «vor»-Teil steht nicht so im Quelltext').toBeGreaterThan(0);
    expect(/\s/.test(LANG[idx - 1]), `«${rest.slice(0, 24)}…» beginnt mitten im Wort`).toBe(true);
  });

  it('«nach» endet nicht mit einem Wortrest', () => {
    const a = ausschnittFuer(LANG, 'Behörde');
    expect(a).not.toBe(null);
    expect(a!.nach.endsWith(' …'), 'der Ausschnitt ist gar nicht gekürzt — Fall untauglich').toBe(true);
    const rest = a!.nach.slice(0, -2);
    const idx = LANG.indexOf(rest);
    expect(idx).toBeGreaterThan(-1);
    const grenze = LANG[idx + rest.length];
    expect(/\s/.test(grenze), `«…${rest.slice(-24)}» endet mitten im Wort`).toBe(true);
  });

  it('der Ausschnitt bleibt innerhalb des Längenbudgets und trägt den Treffer voll', () => {
    const a = ausschnittFuer(LANG, 'Spruchgebühr');
    expect(a!.treffer).toBe('Spruchgebühr');
    expect(a!.vor.length + a!.treffer.length + a!.nach.length).toBeLessThanOrEqual(AUSSCHNITT_MAX + 4);
  });

  it('ein Text OHNE Leerraum bekommt weiterhin einen Ausschnitt (harter Schnitt bleibt erlaubt)', () => {
    const ohneLeerraum = `${'a'.repeat(200)}Zielwort${'b'.repeat(200)}`;
    const a = ausschnittFuer(ohneLeerraum, 'Zielwort');
    expect(a, 'kein Ausschnitt — die Wortgrenzen-Regel hat ihn verschluckt').not.toBe(null);
    expect(a!.treffer).toBe('Zielwort');
    expect(a!.vor.length, 'der Kontext ist ganz weggefallen').toBeGreaterThan(4);
  });

  it('auch die Fundstellen-Zeilen der aufgeklappten Liste folgen der Regel', () => {
    // `artikelFundstellen` baut die Ausschnitte über DIESELBE Funktion — das ist
    // der Vertrag, den `leser-suche-w219.test.ts` festhält. Hier wird geprüft,
    // dass die Wortgrenze auch auf diesem Weg wirkt und nicht nur im Listenkopf.
    const stellen = artikelFundstellen(index(LANG), 'art-1', 'Verordnung');
    expect(stellen.length, 'keine Fundstelle gefunden').toBeGreaterThan(0);
    const vor = stellen[0].ausschnitt.vor;
    expect(vor.startsWith('… '), 'nicht gekürzt — Fall untauglich').toBe(true);
    const rest = vor.slice(2);
    const i = LANG.indexOf(rest);
    expect(i).toBeGreaterThan(0);
    expect(/\s/.test(LANG[i - 1]), `«${rest.slice(0, 24)}…» beginnt mitten im Wort`).toBe(true);
  });
});
