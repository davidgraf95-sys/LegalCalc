// ─── B5: Zeit-Achse der Bezüge — Bereich, Histogramm, Migration ─────────────
//
// W2·7-BEZUG/B5. Deckt `pages/gesetz-leser/bezugZeit.ts` und das Zeit-Prädikat
// in `bezugAuswahl.ts` ab.
//
// §6.3-DEKLARATION (deklarierte fachliche Änderung, kein Refactoring):
// Diese Datei TRITT AN DIE STELLE von `leitfall-filter.test.ts`. Jener Test mass
// die Stufen-Wahl «alle · 20 · 10 · 5 J.» (`filtereLeitfaelleNachZeitraum`,
// `zeitraumLabel`) — eine Steuerung, die David am 28.7.2026 ausdrücklich ersetzt
// hat («zeitstrahl und datumseingabe anstatt 5 jahre 10 jahre usw.») und deren
// einzige Verbraucherin, die `LeitfallZeile`, seit B4 vom Reader nicht mehr
// bedient wird. Der Test wurde also nicht angepasst, weil er störte, sondern
// gelöscht, weil sein Prüfgegenstand entfallen ist. Was an ihm SACHLICH war,
// lebt hier weiter und wird strenger geprüft:
//   · Q1-Sicherheit des Bandjahr-Vergleichs  → «Bandjahr wird jahr-genau …»
//   · unlesbares Datum wird konservativ behalten → «ohne verwertbares Datum …»
//   · die Grenzjahr-Arithmetik der Stufen     → `migriereZeitraum`, jetzt als
//     einmalige Migration statt als laufender Filter.

import { describe, it, expect } from 'vitest';
import {
  OFFENER_BEREICH, baueJahresHistogramm, bereichAusJahren, bereichLabel,
  imBereich, istBereichOffen, jahrImBereich, migriereZeitraum,
  normalisiereBereich, normalisiereDatum,
} from '../pages/gesetz-leser/bezugZeit';
import { bauePraedikate, waehleBezuege, type WaehlbareKante } from '../pages/gesetz-leser/bezugAuswahl';

describe('Bereich: Normalisierung', () => {
  it('nimmt nur strenges ISO an, alles andere wird zum offenen Ende', () => {
    expect(normalisiereDatum('2020-06-15')).toBe('2020-06-15');
    expect(normalisiereDatum('2020-6-15')).toBe('');
    expect(normalisiereDatum('2020')).toBe('');
    expect(normalisiereDatum('15.06.2020')).toBe('');
    expect(normalisiereDatum(undefined)).toBe('');
    expect(normalisiereDatum(20200615)).toBe('');
  });

  it('tauscht verdrehte Enden, statt einen leeren Bereich zu erzeugen', () => {
    expect(normalisiereBereich('2024-01-01', '2020-01-01'))
      .toEqual({ von: '2020-01-01', bis: '2024-01-01' });
  });

  it('beide Enden leer ⇒ der geteilte offene Bereich (referenz-stabil, §15)', () => {
    expect(normalisiereBereich('', '')).toBe(OFFENER_BEREICH);
    expect(normalisiereBereich('quatsch', null)).toBe(OFFENER_BEREICH);
    expect(istBereichOffen(OFFENER_BEREICH)).toBe(true);
  });

  it('ein einzelnes offenes Ende bleibt offen (kein stiller Grenzwert)', () => {
    expect(normalisiereBereich('2020-01-01', '')).toEqual({ von: '2020-01-01', bis: '' });
    expect(normalisiereBereich('', '2020-01-01')).toEqual({ von: '', bis: '2020-01-01' });
  });
});

describe('imBereich: Q1-sicherer Datumsvergleich', () => {
  const b = { von: '2020-06-15', bis: '2024-03-31' };

  it('tagesgenaue Daten werden tagesgenau verglichen (Ränder inklusiv)', () => {
    expect(imBereich('2020-06-15', 'tag', b)).toBe(true);
    expect(imBereich('2024-03-31', 'tag', b)).toBe(true);
    expect(imBereich('2020-06-14', 'tag', b)).toBe(false);
    expect(imBereich('2024-04-01', 'tag', b)).toBe(false);
  });

  it('Bandjahr wird jahr-genau verglichen — NIE tagesgenau (Q1-Auflage)', () => {
    // Der BGE-Band 2020 liegt tagesgenau (2020-01-01) VOR dem Bereichsbeginn
    // 15.06.2020 — jahr-genau gehört er hinein, denn der Entscheid kann aus der
    // zweiten Jahreshälfte stammen. Genau dieser Fall ist die Auflage.
    expect(imBereich('2020-01-01', 'bandjahr', b)).toBe(true);
    expect(imBereich('2020-01-01', 'tag', b)).toBe(false);   // Gegenprobe
    expect(imBereich('2024-01-01', 'bandjahr', b)).toBe(true);
    expect(imBereich('2019-01-01', 'bandjahr', b)).toBe(false);
    expect(imBereich('2025-01-01', 'bandjahr', b)).toBe(false);
  });

  it('ohne verwertbares Datum wird KONSERVATIV behalten (§8)', () => {
    expect(imBereich('n/a', 'unbekannt', b)).toBe(true);
  });

  it('offener Bereich lässt alles durch — auch Unlesbares', () => {
    expect(imBereich('1899-01-01', 'tag', OFFENER_BEREICH)).toBe(true);
  });

  it('einseitig offener Bereich prüft nur die gesetzte Seite', () => {
    expect(imBereich('1900-01-01', 'tag', { von: '', bis: '2020-01-01' })).toBe(true);
    expect(imBereich('2030-01-01', 'tag', { von: '', bis: '2020-01-01' })).toBe(false);
    expect(imBereich('2030-01-01', 'tag', { von: '2020-01-01', bis: '' })).toBe(true);
  });
});

describe('Histogramm', () => {
  it('SUMMEN-IDENTITÄT: Balken + ohneJahr = Zahl der Kanten', () => {
    const daten = ['2020-05-01', '2020-11-02', '2022-01-01', 'n/a', '', '2018-07-07'];
    const h = baueJahresHistogramm(daten);
    const summe = h.balken.reduce((s, b) => s + b.anzahl, 0);
    expect(summe + h.ohneJahr).toBe(daten.length);
    expect(h.ohneJahr).toBe(2);
  });

  it('ist LÜCKENLOS von min bis max — leere Jahre stehen mit 0 drin', () => {
    const h = baueJahresHistogramm(['2018-01-01', '2021-01-01']);
    expect(h.balken.map((b) => b.jahr)).toEqual([2018, 2019, 2020, 2021]);
    expect(h.balken.map((b) => b.anzahl)).toEqual([1, 0, 0, 1]);
  });

  it('ohne lesbares Jahr gibt es KEINE Balken (keine erfundene Achse)', () => {
    const h = baueJahresHistogramm(['n/a', 'n/a']);
    expect(h.balken).toEqual([]);
    expect(h.ohneJahr).toBe(2);
  });

  it('leere Eingabe ⇒ leeres Histogramm', () => {
    expect(baueJahresHistogramm([])).toEqual({ balken: [], ohneJahr: 0 });
  });
});

describe('Zieh-Auswahl: Jahre → Bereich', () => {
  it('umfasst die ganzen Randjahre (bis = 31.12., nicht 1.1. des Folgejahrs)', () => {
    expect(bereichAusJahren(2019, 2022)).toEqual({ von: '2019-01-01', bis: '2022-12-31' });
  });

  it('funktioniert in beide Zieh-Richtungen', () => {
    expect(bereichAusJahren(2022, 2019)).toEqual(bereichAusJahren(2019, 2022));
  });

  it('ein einzelner Balken = genau dieses Jahr', () => {
    const b = bereichAusJahren(2021, 2021);
    expect(imBereich('2021-01-01', 'bandjahr', b)).toBe(true);
    expect(imBereich('2021-12-31', 'tag', b)).toBe(true);
    expect(imBereich('2022-01-01', 'bandjahr', b)).toBe(false);
  });

  it('jahrImBereich färbt angeschnittene Randjahre mit ein', () => {
    const b = { von: '2020-06-15', bis: '2022-02-01' };
    expect(jahrImBereich(2020, b)).toBe(true);
    expect(jahrImBereich(2022, b)).toBe(true);
    expect(jahrImBereich(2019, b)).toBe(false);
    expect(jahrImBereich(2023, b)).toBe(false);
    expect(jahrImBereich(1900, OFFENER_BEREICH)).toBe(true);
  });
});

describe('bereichLabel', () => {
  it('offener Bereich ⇒ null (kein «alle»-Lärm)', () => {
    expect(bereichLabel(OFFENER_BEREICH)).toBeNull();
  });
  it('nennt beide Enden, einzeln oder als Spanne — Schweizer Datumsform', () => {
    expect(bereichLabel({ von: '2020-06-15', bis: '' })).toBe('ab 15.06.2020');
    expect(bereichLabel({ von: '', bis: '2024-03-31' })).toBe('bis 31.03.2024');
    // Ä117 (18.8.2026): BIS-Strich OHNE Spatien. Mit Spatien stand der
    // Halbgeviertstrich in der Rolle des Gedankenstrichs, für den der Leser
    // «—» führt — die Spanne schreibt sich wie «Art. 1–10» (Benennungs-Glossar).
    expect(bereichLabel({ von: '2020-06-15', bis: '2024-03-31' })).toBe('15.06.2020–31.03.2024');
  });
});

describe('migriereZeitraum: einmalige Abbildung der Alt-Stufen (§9 B5 Ziff. 3)', () => {
  const HEUTE = '2026-07-28';

  it('«5»/«10»/«20» werden zu «heute minus n Jahre», bis bleibt offen', () => {
    expect(migriereZeitraum('5', HEUTE)).toEqual({ von: '2021-07-28', bis: '' });
    expect(migriereZeitraum('10', HEUTE)).toEqual({ von: '2016-07-28', bis: '' });
    expect(migriereZeitraum('20', HEUTE)).toEqual({ von: '2006-07-28', bis: '' });
  });

  it('«alle» und alles Unbekannte ⇒ offener Bereich', () => {
    expect(migriereZeitraum('alle', HEUTE)).toBe(OFFENER_BEREICH);
    expect(migriereZeitraum(undefined, HEUTE)).toBe(OFFENER_BEREICH);
    expect(migriereZeitraum('7', HEUTE)).toBe(OFFENER_BEREICH);
    expect(migriereZeitraum(5, HEUTE)).toBe(OFFENER_BEREICH); // Zahl ≠ String
  });

  it('kaputtes «heute» kippt nicht in ein Fantasie-Datum', () => {
    expect(migriereZeitraum('5', 'irgendwas')).toBe(OFFENER_BEREICH);
  });

  it('29. Februar wird auf den 28. gezogen, wenn das Zieljahr keins ist', () => {
    // 2028 ist Schaltjahr, 2023 nicht — «2023-02-29» wäre kein Datum und fiele
    // in `normalisiereDatum` auf '' zurück: aus «letzte 5 Jahre» würde «alle».
    expect(migriereZeitraum('5', '2028-02-29')).toEqual({ von: '2023-02-28', bis: '' });
    // 2024 IST ein Schaltjahr ⇒ der 29. bleibt stehen.
    expect(migriereZeitraum('20', '2044-02-29')).toEqual({ von: '2024-02-29', bis: '' });
  });

  it('das Ergebnis übersteht die Normalisierung unverändert (gültiges ISO)', () => {
    const m = migriereZeitraum('5', '2028-02-29');
    expect(normalisiereBereich(m.von, m.bis)).toEqual(m);
  });

  it('bildet dieselbe Menge ab, die die Stufe zuletzt zeigte (§8)', () => {
    // Alt: «5 J.» hielt ab Grenzjahr 2021 (jahr-genau, inklusiv). Neu: ab
    // 28.07.2021 — der Bandjahr-Platzhalter 2021-01-01 bleibt dank Q1 drin.
    const b = migriereZeitraum('5', HEUTE);
    expect(imBereich('2021-01-01', 'bandjahr', b)).toBe(true);
    expect(imBereich('2020-01-01', 'bandjahr', b)).toBe(false);
    expect(imBereich('2026-01-05', 'tag', b)).toBe(true);
  });
});

describe('Zeit-Prädikat in der Kanten-Auswahl (bezugAuswahl.ts)', () => {
  function kante(key: string, datum: string | undefined, gericht: string): WaehlbareKante & { key: string } {
    return { key, datum, facetten: { status: 'bge', kanton: 'CH', gericht } };
  }
  const alle = [
    kante('tag_2024', '2024-05-01', 'bger'),
    kante('band_2020', '2020-01-01', 'bge'),
    kante('tag_2020_frueh', '2020-02-01', 'bger'),
    kante('ohne', undefined, 'bger'),
  ];

  it('der OFFENE Bereich fügt GAR KEIN Prädikat hinzu (Grundzustand unberührt)', () => {
    expect(bauePraedikate(['bge'], [])).toHaveLength(1);
    expect(bauePraedikate(['bge'], [], OFFENER_BEREICH)).toHaveLength(1);
    expect(bauePraedikate(['bge'], [], { von: '2020-01-01', bis: '' })).toHaveLength(2);
  });

  it('schneidet tagesgenau, hält Bandjahr jahr-genau und Datumslose immer', () => {
    const r = waehleBezuege(alle, ['bge'], [], { von: '2020-06-01', bis: '' });
    // band_2020 bleibt (Bandjahr 2020 ≥ Jahr 2020), tag_2020_frueh fällt raus.
    expect(r.map((k) => k.key)).toEqual(['tag_2024', 'band_2020', 'ohne']);
  });

  it('wirkt UND-verknüpft mit den übrigen Achsen, nicht an ihnen vorbei', () => {
    const gemischt = [
      { key: 'bge_alt', datum: '2010-05-05', facetten: { status: 'bge' as const, kanton: 'CH', gericht: 'bger' } },
      { key: 'kant_neu', datum: '2024-05-05', facetten: { status: 'kantonal' as const, kanton: 'BS', gericht: 'bs' } },
      { key: 'kant_alt', datum: '2010-05-05', facetten: { status: 'kantonal' as const, kanton: 'BS', gericht: 'bs' } },
    ];
    const r = waehleBezuege(gemischt, ['kantonal'], ['BS'], { von: '2020-01-01', bis: '' });
    expect(r.map((k) => k.key)).toEqual(['kant_neu']);
  });

  it('ohne Gericht gilt das Datum als tagesgenau (die Daten decken nichts anderes)', () => {
    const ohneGericht = [{ key: 'x', datum: '2020-01-01', facetten: { status: 'bge' as const, kanton: 'CH' } }];
    expect(waehleBezuege(ohneGericht, ['bge'], [], { von: '2020-06-01', bis: '' })).toHaveLength(0);
  });

  it('keine Klasse gewählt ⇒ leer, unabhängig vom Zeitraum', () => {
    expect(waehleBezuege(alle, [], [], OFFENER_BEREICH)).toEqual([]);
  });
});
