/**
 * W2·5m-LESER-V3 · Etappe S3 — Erlass-Kopf + Standausweis-Wortlaut (Entscheid F5).
 *
 * Was hier bewiesen wird — die vier Zusagen der Etappe, die ohne Test still
 * zurückfallen könnten:
 *
 *  (1) §5-EINHEIT: der interaktive Erlass-Kopf und der PRERENDERTE SEO-Kopf
 *      tragen BUCHSTÄBLICH denselben Standausweis-String. Das ist der Kern von
 *      Pos. 11: bis 16.8.2026 waren es zwei handgeschriebene Templates, die im
 *      Datumsformat schon auseinandergelaufen waren (UI «14.08.2026»,
 *      Prerender «2026-08-14»). Ein Test, der nur beide Seiten je gegen einen
 *      Literal prüft, hätte das NICHT gefangen — deshalb wird hier der eine
 *      String im anderen Dokument gesucht.
 *  (2) F5-WORTLAUT: «gegen Fedlex-Konsolidierung geprüft am …» statt «geltend
 *      geprüft am …»; «(maschinell)» bleibt tragend, kein Verifikations-Wortfeld
 *      (§7/§8).
 *  (3) WARNUNG GENAU DANN: nur bei nicht konsolidierter Änderung, nie bei
 *      aufgehobenem Erlass, mit korrektem FRÜHESTEM Datum — und ohne Datum,
 *      wenn keines belegt ist (§8: nichts erfinden).
 *  (4) ANHANG-DOMINANZ: «Einträge» statt «Artikel», wo der Snapshot fast nur
 *      Anhang ist (Fahrplan Kap. 14).
 *
 * Reine Funktionen + SSR-Render, kein Browser: die Zusagen hängen an Wortlaut
 * und Datenpfad, nicht an Layout (das misst e2e/leser-kopf-*).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import { erlassVolltextHtml } from '../lib/seo-detail';
import {
  ANHANG_DOMINANZ, datumCh, naechsteFassungSatz, nichtKonsolidiertSatz,
  standausweisSatz, zaehlWort,
} from '../lib/normtext/erlassKopfText';
import { fruehestesInKraft, nichtKonsolidierteInkrafttreten } from '../lib/normtext/revisionen';
import { formatiereDatum } from '../pages/gesetz-leser/helpers';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { CurrencyEintrag } from '../lib/normtext/browse';
import type { NormSnapshotDatei } from '../lib/normtext/typen';
import type { RevisionBezug } from '../lib/normtext/revisionen';

const PUB = join(process.cwd(), 'public');
const erlasse: BrowseErlass[] = JSON.parse(
  readFileSync(join(PUB, 'normtext/register.json'), 'utf8'),
).erlasse;
const or = erlasse.find((e) => e.key === 'OR')!;

const GEPRUEFT = '2026-08-14';
const currency: CurrencyEintrag = { geprueftAm: GEPRUEFT };

function kopf(props: Partial<Parameters<typeof ErlassLeserKopf>[0]> = {}) {
  return renderToString(
    <ErlassLeserKopf
      erlass={or} overline="Bund" artikelAnzahl={2038}
      hinweis="Snapshot — massgeblich ist die amtliche Fassung"
      currency={currency} {...props}
    />,
  );
}

// ─── (1) + (2) Der Wortlaut steht EINMAL und an beiden Orten gleich ──────────
describe('S3/F5 — Standausweis: eine Quelle, zwei Orte', () => {
  it('UI-Kopf und prerenderter SEO-Kopf tragen denselben String', () => {
    const datei: NormSnapshotDatei = JSON.parse(readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'));
    const seo = erlassVolltextHtml(or, datei, currency);
    const ui = kopf();
    const satz = standausweisSatz(GEPRUEFT);

    expect(satz).toBe('gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)');
    expect(ui).toContain(satz);
    expect(seo).toContain(satz);
  });

  it('der alte Wortlaut «geltend geprüft am …» ist an beiden Orten weg (F5)', () => {
    const datei: NormSnapshotDatei = JSON.parse(readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'));
    expect(kopf()).not.toContain('geltend geprüft');
    expect(erlassVolltextHtml(or, datei, currency)).not.toContain('geltend geprüft');
  });

  it('«(maschinell)» bleibt tragend, kein Verifikations-Wortfeld (§7/§8)', () => {
    expect(standausweisSatz(GEPRUEFT)).toContain('(maschinell)');
    expect(standausweisSatz(GEPRUEFT)).not.toMatch(/verifiziert|gegengeprüft|garantiert|aktuell\b/);
  });

  it('auch die künftige Fassung kommt aus derselben Quelle', () => {
    const datei: NormSnapshotDatei = JSON.parse(readFileSync(join(PUB, 'normtext', or.datei!), 'utf8'));
    const c: CurrencyEintrag = { geprueftAm: GEPRUEFT, naechsteFassungAb: '2026-10-01' };
    const satz = naechsteFassungSatz('2026-10-01');
    expect(satz).toBe('nächste Fassung ab 01.10.2026');
    expect(kopf({ currency: c })).toContain(satz);
    expect(erlassVolltextHtml(or, datei, c)).toContain(satz);
  });

  it('die Datumsform ist dieselbe Funktion wie im Reader (kein zweiter Formatierer)', () => {
    // §5-Wächter: `formatiereDatum` ist seit S3 nur noch die Fassade von `datumCh`.
    // Fällt jemand auf eine eigene Implementierung zurück, laufen UI und
    // Prerender wieder auseinander — genau der Ausgangsdefekt.
    expect(formatiereDatum).toBe(datumCh);
    expect(datumCh('2026-08-14')).toBe('14.08.2026');
    // Kein ISO-Datum ⇒ unverändert durchreichen (§8: nichts umdeuten).
    expect(datumCh('unbekannt')).toBe('unbekannt');
    expect(datumCh('2026-08')).toBe('2026-08');
  });
});

// ─── (3) Die Warnung erscheint genau dann, wenn sie zutrifft ─────────────────
describe('S3/F5 — Klartext-Warnung «noch nicht eingearbeitet»', () => {
  it('mit Datum: der von F5 vorgegebene Satz', () => {
    expect(nichtKonsolidiertSatz('2025-07-01')).toBe(
      'Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text'
      + ' eingearbeitet — massgeblich ist die amtliche Fassung.',
    );
    const html = kopf({ nichtKonsolidiert: true, nichtKonsolidiertSeit: '2025-07-01' });
    expect(html).toContain(nichtKonsolidiertSatz('2025-07-01'));
    // ⚠ ist redundante Verstärkung, nie alleiniger Träger (§13/B3).
    expect(html).toContain('aria-hidden');
    expect(html).toContain('⚠');
  });

  it('ohne Datum: derselbe Satz ohne Zeitbezug, kein erfundenes Datum (§8)', () => {
    expect(nichtKonsolidiertSatz(null)).toBe(
      'Fedlex hat eine geltende Änderung noch nicht in den Text'
      + ' eingearbeitet — massgeblich ist die amtliche Fassung.',
    );
    expect(nichtKonsolidiertSatz(null)).not.toMatch(/\d/);
  });

  it('Tatsache ohne Datum: Warnung steht, Satz nennt kein Datum (§8)', () => {
    // Beweist, dass die zwei Props unabhängig wirken — vor dem S3-Nachzug
    // hingen sie in EINEM `boolean | string` und konnten das nicht.
    const html = kopf({ nichtKonsolidiert: true });
    expect(html).toContain(nichtKonsolidiertSatz(null));
    // Auf dem SATZ prüfen, nicht auf dem Dokument: «seit» steht als Substring
    // auch in der Stand-Zeile («in Kraft seit 01.01.1912») — Identität statt
    // Substring-Präsenz (§7). Der Satz selbst darf kein Datum tragen.
    expect(nichtKonsolidiertSatz(null)).not.toContain('seit');
    expect(html).not.toMatch(/Fedlex hat eine seit/);
  });

  it('Datum ohne Tatsache: keine Warnung (das Datum allein behauptet nichts)', () => {
    const html = kopf({ nichtKonsolidiertSeit: '2025-07-01' });
    expect(html).not.toContain('noch nicht in den Text eingearbeitet');
  });

  it('ohne nichtKonsolidiert: kein Warnsatz, sondern der Grundhinweis', () => {
    const html = kopf();
    expect(html).not.toContain('noch nicht in den Text eingearbeitet');
    expect(html).toContain('Snapshot — massgeblich ist die amtliche Fassung');
  });

  it('aufgehobener Erlass: weder Warnung noch Standausweis (die Aufhebung ist die Aussage)', () => {
    const html = kopf({
      erlass: { ...or, aufgehoben: { seit: '2026-03-01' } },
      nichtKonsolidiert: true, nichtKonsolidiertSeit: '2025-07-01',
    });
    expect(html).toContain('lc-notice-danger');
    expect(html).not.toContain('noch nicht in den Text eingearbeitet');
    expect(html).not.toContain('Fedlex-Konsolidierung geprüft');
  });

  it('gesammelt werden nur markierte Revisionen mit brauchbarem ISO-Datum', () => {
    const rev = (d: string, offen?: boolean): RevisionBezug => ({
      art: 'aenderung', dateEntryInForce: d, quelleUrl: 'https://x',
      ...(offen ? { nichtKonsolidiert: true } : {}),
    });
    // Reihenfolge bewusst unsortiert; konsolidierte Einträge zählen nicht mit.
    expect(nichtKonsolidierteInkrafttreten([
      rev('2026-01-01', true), rev('2020-01-01'), rev('2025-07-01', true),
    ])).toEqual(['2025-07-01', '2026-01-01']);
    expect(nichtKonsolidierteInkrafttreten([rev('2020-01-01')])).toEqual([]);
    expect(nichtKonsolidierteInkrafttreten([])).toEqual([]);
    expect(nichtKonsolidierteInkrafttreten(undefined)).toEqual([]);
    // Marker gesetzt, Datum unbrauchbar ⇒ kein Zeitbezug (§8).
    expect(nichtKonsolidierteInkrafttreten([rev('', true)])).toEqual([]);
  });

  // ── §7-KORREKTUR beim Bau (16.8.2026) ────────────────────────────────────
  // Der erste S3-Bau warnte bei JEDER markierten Revision. Ein e2e-Fehlschlag
  // auf OR hat das aufgedeckt: OR trug den Marker für eine Änderung, die erst
  // am 01.10.2026 in Kraft tritt. Gemessen über alle 227 Sidecars: 66 Erlasse
  // mit Marker, davon 4 mit einer bereits geltenden Änderung, spätester Marker
  // 2034-01-01. «seit 01.01.2034 geltend» wäre eine falsche Tatsachenbehauptung.
  // Diese Fälle nageln den Stichtagsfilter fest, damit er nicht wieder wegfällt.
  it('§7/§8: eine erst KÜNFTIG in Kraft tretende Änderung erzeugt keine Warnung', () => {
    const stichtag = '2026-08-14';
    expect(fruehestesInKraft(['2026-10-01'], stichtag)).toBeNull();
    expect(fruehestesInKraft(['2034-01-01'], stichtag)).toBeNull();
    // Gemischt: das früheste BEREITS GELTENDE zählt, nicht das absolut früheste.
    expect(fruehestesInKraft(['2025-07-01', '2026-10-01'], stichtag)).toBe('2025-07-01');
    // Genau am Stichtag gilt sie (≤, nicht <).
    expect(fruehestesInKraft([stichtag], stichtag)).toBe(stichtag);
  });

  it('§8: ohne Stichtag keine Aussage — «gilt bereits» wäre unbelegt', () => {
    expect(fruehestesInKraft(['2020-01-01'], null)).toBeNull();
    expect(fruehestesInKraft(['2020-01-01'], undefined)).toBeNull();
    expect(fruehestesInKraft(['2020-01-01'], '')).toBeNull();
  });

  it('§2: rein — gleiche Eingabe, gleiche Ausgabe, kein Uhrzeit-Einfluss', () => {
    const eingabe = ['2020-01-01', '2030-01-01'];
    const a = fruehestesInKraft(eingabe, '2026-08-14');
    const b = fruehestesInKraft(eingabe, '2026-08-14');
    expect(a).toBe(b);
    expect(a).toBe('2020-01-01');
    // Die Eingabe wird nicht mutiert (der Aufrufer hält sie im React-State).
    expect(eingabe).toEqual(['2020-01-01', '2030-01-01']);
  });
});

// ─── (4) Anhang-Dominanz: «Einträge» statt «Artikel» ────────────────────────
describe('S3 — Zählwort bei Anhang-Dominanz (Fahrplan Kap. 14)', () => {
  it('ab der Schwelle heisst die Zahl «Einträge»', () => {
    expect(zaehlWort('Artikel', { artikelAnzahl: 100, anhangArtikel: 90 })).toBe('Einträge');
    expect(zaehlWort('Paragraphen', { artikelAnzahl: 100, anhangArtikel: 100 })).toBe('Einträge');
    expect(ANHANG_DOMINANZ).toBe(0.9);
  });

  it('darunter bleibt das gewohnte Etikett — auch das kantonale', () => {
    expect(zaehlWort('Artikel', { artikelAnzahl: 100, anhangArtikel: 89 })).toBe('Artikel');
    expect(zaehlWort('Paragraphen', { artikelAnzahl: 100, anhangArtikel: 0 })).toBe('Paragraphen');
  });

  it('ohne Kennzahlen wird nichts abgeleitet (§8)', () => {
    expect(zaehlWort('Artikel', null)).toBe('Artikel');
    expect(zaehlWort('Artikel', undefined)).toBe('Artikel');
    // Kein Division-durch-Null-Etikett bei leerem Snapshot.
    expect(zaehlWort('Artikel', { artikelAnzahl: 0, anhangArtikel: 0 })).toBe('Artikel');
  });

  it('der Kopf zeigt das abgeleitete Wort in der Fakten-Zeile', () => {
    expect(kopf({ artikelAnzahl: 10, kennzahlen: { artikelAnzahl: 10, anhangArtikel: 10 } }))
      .toContain('Einträge');
    expect(kopf({ artikelAnzahl: 10, kennzahlen: { artikelAnzahl: 10, anhangArtikel: 1 } }))
      .toContain('Artikel');
  });
});

// ─── Kantons-Probe: derselbe Kopf muss ohne Bund-Felder tragen ──────────────
describe('S3 — Kantons-Probe (Bund-Fokus, «bricht nicht»)', () => {
  const kantonal = erlasse.find((e) => e.ebene === 'kanton' && e.status === 'snapshot')!;

  it('Kantonserlass ohne Currency: kein Standausweis, kein leeres Versprechen (§8)', () => {
    const html = renderToString(
      <ErlassLeserKopf erlass={kantonal} overline="Kanton" artikelAnzahl={12}
        bestimmungsWort="Paragraphen" hinweis="Snapshot — massgeblich ist die amtliche Fassung" />,
    );
    expect(html).not.toContain('Fedlex-Konsolidierung geprüft');
    expect(html).not.toContain('geprüft am');
    // Der Kopf steht trotzdem vollständig: Titel, Zählwort, Grundhinweis.
    expect(html).toContain('Paragraphen');
    expect(html).toContain('Snapshot — massgeblich ist die amtliche Fassung');
    expect(html).toContain('min-h-kopf-stand sm:min-h-kopf-stand-sm md:min-h-kopf-stand-md');
  });

  // ── Ä75 (Orchestrator-Entscheid 18.8.2026, David hat Stopp-Recht) ─────────
  // «SR» heisst Systematische Rechtssammlung DES BUNDES. Der Kopf setzte es vor
  // JEDE Nummer — gemessen an BS-640.100 und ZH-211.11 stand dort «SR 640.100»
  // bzw. «SR 211.11». Das ist eine falsche Fundstellenangabe, keine
  // Beschriftungs-Ungenauigkeit; die Nummer steht darum nackt, bis die kantonale
  // Sammlungs-Sigle im Datenmodell steht (Herleitung: `helpers.kennungEtikett`).
  // ROT ZU BEKOMMEN (§6.7): `kennungEtikett` fest auf `'SR'` ⇒ (a) rot; auf
  // `null` ⇒ (b) rot. Beides so gemessen.
  it('Ä75 (a) der Kantons-Kopf trägt kein «SR» — die Nummer steht nackt', () => {
    const mitNummer: BrowseErlass = { ...kantonal, sr: '640.100' };
    const html = renderToString(
      <ErlassLeserKopf erlass={mitNummer} overline="Kanton" artikelAnzahl={12}
        bestimmungsWort="Paragraphen" hinweis="H" />,
    );
    expect(html).toContain('640.100');
    expect(html).not.toContain('SR 640.100');
    expect(html).not.toMatch(/SR\s*<span class="num">/);
  });

  it('Ä75 (b) der Bundes-Kopf trägt es weiterhin', () => {
    const bund = erlasse.find((e) => e.ebene === 'bund' && e.sr)!;
    const html = renderToString(
      <ErlassLeserKopf erlass={bund} overline="Bund" artikelAnzahl={12} hinweis="H" />,
    );
    expect(html).toMatch(/SR\s*<span class="num">/);
  });

  it('Kantonserlass ohne SR und ohne Inkrafttreten erzeugt keine leeren Trenner', () => {
    const ohne: BrowseErlass = { ...kantonal, sr: null, inkraftSeit: undefined, stand: '2026-01-01' };
    const html = renderToString(
      <ErlassLeserKopf erlass={ohne} overline="Kanton" artikelAnzahl={null} hinweis="H" />,
    );
    expect(html).not.toContain('· ·');
    expect(html).not.toContain('>· <');
    expect(html).toContain('01.01.2026');
  });
});
