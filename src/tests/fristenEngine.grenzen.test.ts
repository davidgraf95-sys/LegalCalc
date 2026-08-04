import { describe, it, expect } from 'vitest';
import { parseISO, format } from 'date-fns';
import {
  nthWerktagNach,
  fristendeTage,
  fristendeKalender,
  normalisiereEnde,
  OHNE_STILLSTAND,
  type Stillstand,
} from '../lib/fristenEngine';
import { stillstandsperioden, stillstandsperiodeFuer } from '../data/zpoFeiertage';
import { betreibungsferien, betreibungsperiodeFuer } from '../data/schkgFeiertage';
import { berechneBggVwvgFrist } from '../lib/bggVwvgFristen';

// ─── Grenzwert-Batterie für die geteilte Fristen-Infrastruktur ──────────────
//
// QS-CODE-FRISTENKERN (Code-Inventur 4.8.2026): fristenEngine.ts trägt die
// Datums-Arithmetik von fünf Rechtsgebiets-Engines, hatte aber nur 6 direkte
// Testfälle. Diese Batterie ist reiner ZUBAU (§6.3 — bestehende Tests bleiben
// unangetastet) und deckt die Grenzbereiche ab: Monatsenden, Feiertags-
// Kaskaden, Stillstands-Überschneidungen, Jahreswechsel, Minimalfristen.
// Jeder Erwartungswert ist von Hand aus dem Kalender hergeleitet; der
// Norm-Anker steht am Fall.

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

// ZPO-Strategie (Art. 145/146 ZPO: Gerichtsferien ruhen; wie zpoFristen.ts).
const ZPO: Stillstand = {
  periodeFuer: stillstandsperiodeFuer,
  perioden: stillstandsperioden,
  ruhenZaehlung: true,
  endregel: 'ruhen_weiter',
};

// SchKG-Strategie (Art. 56/63 SchKG: Betreibungsferien hemmen nicht; wie
// fristenEngine.test.ts).
const SCHKG: Stillstand = {
  periodeFuer: betreibungsperiodeFuer,
  perioden: betreibungsferien,
  ruhenZaehlung: false,
  endregel: 'verlaengerung_3wt',
};

// ─── A · Monatsend-Klemmung (gleichbezeichneter Tag, Art. 142 Abs. 2 ZPO) ───
// Fehlt der gleichbezeichnete Tag im Zielmonat, endet die Frist am letzten
// Tag des Monats (Art. 142 Abs. 2 Satz 2 ZPO).

describe('Fristen-Engine – Monatsend-Klemmung (Art. 142 Abs. 2 ZPO)', () => {
  it('31.1. + 1 Monat → 28.2. (Gemeinjahr)', () => {
    const r = fristendeKalender(parseISO('2025-01-31'), 'monate', 1, OHNE_STILLSTAND, false);
    expect(iso(r.ende)).toBe('2025-02-28'); // Fr, bleibt
    expect(iso(normalisiereEnde(r.ende, 'ZH', OHNE_STILLSTAND).tag)).toBe('2025-02-28');
  });

  it('31.1. + 1 Monat → 29.2. (Schaltjahr)', () => {
    const r = fristendeKalender(parseISO('2024-01-31'), 'monate', 1, OHNE_STILLSTAND, false);
    expect(iso(r.ende)).toBe('2024-02-29'); // Do
  });

  it('30.1. + 1 Monat klemmt ebenfalls auf den 28.2.', () => {
    const r = fristendeKalender(parseISO('2025-01-30'), 'monate', 1, OHNE_STILLSTAND, false);
    expect(iso(r.ende)).toBe('2025-02-28');
  });

  it('Jahresfrist ab Schalttag: 29.2.2024 + 1 Jahr → 28.2.2025', () => {
    const r = fristendeKalender(parseISO('2024-02-29'), 'jahre', 1, OHNE_STILLSTAND, false);
    expect(iso(r.ende)).toBe('2025-02-28');
  });

  it('31.8. + 1 Monat → 30.9. (30-Tage-Monat)', () => {
    const r = fristendeKalender(parseISO('2025-08-31'), 'monate', 1, OHNE_STILLSTAND, false);
    expect(iso(r.ende)).toBe('2025-09-30'); // Di, bleibt
  });
});

// ─── B · Feiertags-Kaskaden am Fristende (Art. 142 Abs. 3 ZPO) ──────────────

describe('Fristen-Engine – Feiertags-Kaskaden (Art. 142 Abs. 3 ZPO)', () => {
  it('Weihnachtskaskade: 25.12. (Do) → Stephanstag → Sa → So → Mo 29.12.', () => {
    // 2025: 25.12. Do (Feiertag alle), 26.12. Fr (Stephanstag ZH), 27./28. Wochenende.
    const { tag, verschoben } = normalisiereEnde(parseISO('2025-12-25'), 'ZH', OHNE_STILLSTAND);
    expect(verschoben).toBe(true);
    expect(iso(tag)).toBe('2025-12-29');
  });

  it('kantonale Divergenz: 1.5.2026 (Fr) ist in ZH Feiertag, in BE Werktag', () => {
    // Tag der Arbeit gilt in ZH, nicht in BE (BJ-Liste) → ZH kaskadiert übers
    // Wochenende auf Mo 4.5., BE bleibt am 1.5.
    expect(iso(normalisiereEnde(parseISO('2026-05-01'), 'ZH', OHNE_STILLSTAND).tag)).toBe('2026-05-04');
    expect(iso(normalisiereEnde(parseISO('2026-05-01'), 'BE', OHNE_STILLSTAND).tag)).toBe('2026-05-01');
  });

  it('Auffahrt 2026 (14.5., Do) verschiebt nur um einen Tag auf Fr 15.5.', () => {
    // Ostern 2026 = 5.4.; Auffahrt = Ostern + 39 (bundesweit).
    expect(iso(normalisiereEnde(parseISO('2026-05-14'), 'ZH', OHNE_STILLSTAND).tag)).toBe('2026-05-15');
  });

  it('nthWerktagNach über die Weihnachts-Feiertagskette — kantonsabhängig', () => {
    // Ab Mi 24.12.2025 in ZH: 25.12. (Weihnachten) und 26.12. (Stephanstag)
    // Feiertage, 27./28. Wochenende → 29., 30., 31.12. In GE gilt der
    // Stephanstag NICHT (BJ-Liste: GE ausgenommen) — der 26.12. zählt dort
    // als Werktag → schon der 30.12. ist der dritte.
    expect(iso(nthWerktagNach(parseISO('2025-12-24'), 3, 'ZH'))).toBe('2025-12-31');
    expect(iso(nthWerktagNach(parseISO('2025-12-24'), 3, 'GE'))).toBe('2025-12-30');
  });

  it('nthWerktagNach über den GE-Jahreswechsel (31.12. Restauration, 1.1. Neujahr)', () => {
    // Ab Mo 29.12.2025: ZH zählt 30. und 31.12.; in GE ist der 31.12.
    // Feiertag (Restauration de la République) und der 1.1. Neujahr, der 2.1.
    // aber KEIN Berchtoldstag → GE landet auf Fr 2.1.2026.
    expect(iso(nthWerktagNach(parseISO('2025-12-29'), 2, 'ZH'))).toBe('2025-12-31');
    expect(iso(nthWerktagNach(parseISO('2025-12-29'), 2, 'GE'))).toBe('2026-01-02');
  });
});

// ─── C · ZPO-Stillstand: Ruhen, Überschneidungen, Kaskaden (Art. 145/146) ───

describe('Fristen-Engine – ZPO-Stillstand (Art. 145/146 ZPO)', () => {
  it('Tagesfrist ruht über die Sommerferien (Art. 145 Abs. 1 lit. b)', () => {
    // 10 Tage ab 10.7.2025: 11.–14.7. (4 Tage), 15.7.–15.8. still,
    // 16.–21.8. (6 Tage) → Ende Do 21.8.2025.
    const r = fristendeTage(parseISO('2025-07-10'), 10, ZPO);
    expect(iso(r.diesAQuo)).toBe('2025-07-11');
    expect(iso(r.ende)).toBe('2025-08-21');
  });

  it('Ereignis IM Stillstand → dies a quo am Periodenende (Art. 146 Abs. 1)', () => {
    // Zustellung 20.7.2025 (in den Sommerferien): Monatsfrist läuft ab 15.8.
    const r = fristendeKalender(parseISO('2025-07-20'), 'monate', 1, ZPO, false);
    expect(iso(r.diesAQuo)).toBe('2025-08-15');
    expect(iso(r.ende)).toBe('2025-09-15'); // Mo, bleibt
    expect(r.verlaengerungTage).toBe(0); // keine Periode zwischen ref und Ende
  });

  it('Monatsfrist über die Sommerferien: kumulative Verlängerung +32 Tage', () => {
    // 10.7.2025 + 1 Monat = 10.8.; Sommerperiode (15.7.–15.8., 32 Tage) liegt
    // dazwischen → Ende 11.9.2025 (Do).
    const r = fristendeKalender(parseISO('2025-07-10'), 'monate', 1, ZPO, false);
    expect(r.verlaengerungTage).toBe(32);
    expect(iso(r.ende)).toBe('2025-09-11');
  });

  it('Jahreswechsel: Weihnachtsperiode verlängert um 16 Tage ins Folgejahr', () => {
    // 10.12.2025 + 1 Monat = 10.1.2026; Periode 18.12.–2.1. (16 Tage)
    // → Ende Mo 26.1.2026, keine weitere Verschiebung.
    const r = fristendeKalender(parseISO('2025-12-10'), 'monate', 1, ZPO, false);
    expect(r.verlaengerungTage).toBe(16);
    expect(iso(r.ende)).toBe('2026-01-26');
    expect(normalisiereEnde(r.ende, 'ZH', ZPO).verschoben).toBe(false);
  });

  it('Doppel-Kaskade: Verlängerung wächst in die NÄCHSTE Stillstandsperiode', () => {
    // 1.12.2025 + 4 Monate = 1.4.2026. Weihnachten (+16) schiebt das Ende auf
    // den 17.4.; damit rückt die Osterperiode 2026 (29.3.–12.4., 15 Tage) in
    // den Lauf und verlängert erneut → rohes Ende Sa 2.5.2026, +31 Tage total,
    // Werktagsverschiebung auf Mo 4.5.2026.
    const r = fristendeKalender(parseISO('2025-12-01'), 'monate', 4, ZPO, false);
    expect(r.verlaengerungTage).toBe(31);
    expect(iso(r.ende)).toBe('2026-05-02');
    const n = normalisiereEnde(r.ende, 'ZH', ZPO);
    expect(n.verschoben).toBe(true);
    expect(iso(n.tag)).toBe('2026-05-04');
  });

  it('Ende in der Weihnachtsperiode → Tag nach Periodenende, dann Werktag', () => {
    // 20.12.2025 liegt im Stillstand (bis 2.1.2026) → 3.1. (Sa) → Mo 5.1.2026.
    const { tag, verschoben } = normalisiereEnde(parseISO('2025-12-20'), 'ZH', ZPO);
    expect(verschoben).toBe(true);
    expect(iso(tag)).toBe('2026-01-05');
  });
});

// ─── D · SchKG: Art.-63-Kaskaden über den Jahreswechsel ─────────────────────

describe('Fristen-Engine – SchKG-Kaskaden (Art. 63 SchKG)', () => {
  it('Ende in den Weihnachts-Betreibungsferien → 3. Werktag überspringt Berchtoldstag', () => {
    // Ferien 18.12.2025–1.1.2026; ab 1.1.: 2.1. Berchtoldstag ZH, 3./4.1.
    // Wochenende → Werktage Mo 5.1., Di 6.1., Mi 7.1.2026.
    const { tag, verschoben } = normalisiereEnde(parseISO('2025-12-20'), 'ZH', SCHKG);
    expect(verschoben).toBe(true);
    expect(iso(tag)).toBe('2026-01-07');
  });

  it('Werktagsverschiebung führt IN die Ferien → Art. 63 greift nach (M-1)', () => {
    // Sa 13.7.2024 liegt VOR den Sommer-Betreibungsferien (15.–31.7.); der
    // nächste Werktag Mo 15.7. fällt hinein → 3. Werktag nach 31.7. (Mi):
    // 1.8. Feiertag, 2.8. (1), Sa/So, 5.8. (2), 6.8. (3).
    const { tag, verschoben } = normalisiereEnde(parseISO('2024-07-13'), 'ZH', SCHKG);
    expect(verschoben).toBe(true);
    expect(iso(tag)).toBe('2024-08-06');
  });
});

// ─── E · Minimal- und Modus-Grenzen ─────────────────────────────────────────

describe('Fristen-Engine – Minimalfristen und Modus-Grenzen', () => {
  it('Eintagesfrist: Beginn am Folgetag = Ende (Art. 142 Abs. 1 ZPO)', () => {
    const r = fristendeTage(parseISO('2025-09-03'), 1, OHNE_STILLSTAND);
    expect(iso(r.diesAQuo)).toBe('2025-09-04');
    expect(iso(r.ende)).toBe('2025-09-04');
  });

  it('Eintagesfrist unmittelbar vor dem Stillstand: erster zählbare Tag ist der 16.8.', () => {
    // Ereignis 14.7.2025: Folgetag 15.7. eröffnet die Sommerferien → der
    // erste gezählte Tag (Sa 16.8.) ist zugleich das Ende; Werktagsverschiebung
    // auf Mo 18.8.2025.
    const r = fristendeTage(parseISO('2025-07-14'), 1, ZPO);
    expect(iso(r.ende)).toBe('2025-08-16');
    expect(iso(normalisiereEnde(r.ende, 'ZH', ZPO).tag)).toBe('2025-08-18');
  });

  it('nthWerktagNach mit n=0 liefert den Ausgangstag unverändert', () => {
    expect(iso(nthWerktagNach(parseISO('2025-09-05'), 0, 'ZH'))).toBe('2025-09-05');
  });

  it('Wochenfrist: BGer-Modus (gleichbezeichneter Tag) vs. Mindermeinung (+1 Tag)', () => {
    // Ereignis Mi 3.9.2025, 2 Wochen: BGer-Modus endet Mi 17.9., der
    // Mindermeinungs-Modus (Beginn am Folgetag) Do 18.9.
    expect(iso(fristendeKalender(parseISO('2025-09-03'), 'wochen', 2, OHNE_STILLSTAND, false).ende)).toBe('2025-09-17');
    expect(iso(fristendeKalender(parseISO('2025-09-03'), 'wochen', 2, OHNE_STILLSTAND, true).ende)).toBe('2025-09-18');
  });
});

// ─── F · Mini-Batterie bggVwvgFristen (Kompositions-Schicht) ────────────────
// Der VwVG-/BGG-Stillstand gilt NUR für nach Tagen bestimmte Fristen
// (Art. 22a Abs. 1 VwVG / Art. 46 Abs. 1 BGG) — anders als die ZPO.

describe('bggVwvgFristen – Geltungsbereichs-Schranke und Ruhen', () => {
  it('Monatsfrist steht NICHT still (Art. 46 Abs. 1 BGG e contrario)', () => {
    // 10.7.2025 + 1 Monat = So 10.8. mitten in der Ferienzeit → nur
    // Werktagsverschiebung auf Mo 11.8.2025, kein Ruhen.
    const r = berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2025-07-10', einheit: 'monate', laenge: 1, kanton: 'ZH' });
    expect(r.stillstandAktiv).toBe(false);
    expect(r.diesAdQuemISO).toBe('2025-08-11');
  });

  it('Tagesfrist ruht über den Sommerstillstand (Art. 22a Abs. 1 VwVG)', () => {
    // Identische Mechanik wie ZPO-Fall C1: Ende Do 21.8.2025.
    const r = berechneBggVwvgFrist({ regime: 'vwvg', ereignis: '2025-07-10', einheit: 'tage', laenge: 10, kanton: 'ZH' });
    expect(r.stillstandAktiv).toBe(true);
    expect(r.diesAdQuemISO).toBe('2025-08-21');
  });

  it('30-Tage-Beschwerdefrist über den Jahreswechsel (Art. 46 Abs. 1 lit. c BGG)', () => {
    // Eröffnung Mo 1.12.2025: 2.–17.12. = 16 Tage, 18.12.–2.1. still,
    // 3.1.–16.1. = 14 Tage → Ende Fr 16.1.2026.
    const r = berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2025-12-01', einheit: 'tage', laenge: 30, kanton: 'ZH' });
    expect(r.diesAdQuemISO).toBe('2026-01-16');
  });

  it('Fristlänge 0 oder negativ wird abgewiesen', () => {
    expect(() => berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2025-12-01', einheit: 'tage', laenge: 0, kanton: 'ZH' })).toThrow();
    expect(() => berechneBggVwvgFrist({ regime: 'vwvg', ereignis: '2025-12-01', einheit: 'tage', laenge: -5, kanton: 'ZH' })).toThrow();
  });
});
