import { formatiereDatum, verifiziertesSachgebiet } from '../helpers';
import { GEBIET_LABEL } from '../../../lib/normtext/register';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { KantonSystematik } from '../../../lib/normtext/systematik';

// ─── Erlass → Anzeige-Angaben (FAHRPLAN-LESER-V3, Fundament-Auflage 2) ──────
//
// «Der Rahmen funktioniert für Bund, Kanton und Staatsvertrag identisch —
//  Erlass-spezifisches kommt aus dem Datenmodell, nie aus `if (bund)`.»
//  (Auftrag David 16.8.2026)
//
// Genau dafür gibt es diese Datei. Die drei Ebenen des Korpus (Bund · Kanton ·
// international) unterscheiden sich in **Beschriftungen und Zielen**, nicht im
// Aufbau: eine Brotkrume hat immer drei Stufen, ein Erlass hat immer eine
// Ebene-Angabe, eine Übersichtszeile nennt immer Umfang und Stand. Was daran
// je Ebene anders ist, wird HIER einmal abgeleitet und wandert als fertiger
// Wert in die Komponenten. Keine Komponente der V3-Hülle fragt `erlass.ebene`
// oder `erlass.rechtsgebiet` ab — die Sonde `leser-v3-adresse.test.ts` hält das
// fest, die Fälle prüft `leser-v3-erlassansicht.test.ts`.
//
// Warum das mehr ist als Kosmetik: eine vierte Ebene (etwa Gemeinderecht) oder
// eine vierte Darstellung braucht dann genau **einen** neuen Zweig an genau
// einer Stelle — statt sechs verstreuter Ternäre, von denen man einen vergisst.
// Genau dieser vergessene Zweig war der N13-Befund (BS-Audit 23.6.2026): die
// Reader-Overline zeigte für JEDEN kantonalen Erlass stur «Öffentliches Recht».
//
// Rein und deterministisch (§2): kein DOM, kein Speicher, keine Uhr.

/** Die Ebene-Stufe der Brotkrume: Beschriftung + Ziel der gefilterten Übersicht. */
export interface EbeneAngabe {
  label: string;
  to: string;
}

export function ebeneAngabe(
  erlass: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'>,
): EbeneAngabe {
  if (erlass.rechtsgebiet === 'international') {
    return { label: 'International', to: '/gesetze?ebene=international' };
  }
  if (erlass.ebene === 'bund') {
    return { label: 'Bund', to: '/gesetze' };
  }
  const kt = erlass.kanton ?? '';
  return { label: `Kanton ${kt}`, to: `/gesetze?ebene=kanton&kt=${encodeURIComponent(kt)}` };
}

/**
 * Sachgebiet für die Overline des Erlass-Kopfs. Bund trägt das
 * Rechtsgebiet-Etikett, Kantone das **verifizierte** Sachgebiet aus der
 * amtlichen Systematik — und wo keines vorliegt, gar keines (§8: der neutrale
 * Fallback «Bereich N» ist keine Auskunft, sondern eine Behauptung).
 */
export function overlineGebiet(
  erlass: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'sr'>,
  kantonSys: Record<string, KantonSystematik>,
): string | null {
  if (erlass.ebene === 'bund') return GEBIET_LABEL[erlass.rechtsgebiet] ?? null;
  return verifiziertesSachgebiet(erlass, kantonSys)?.top ?? null;
}

/**
 * Die eine Zeile der zugeklappten Übersichtsbox: «SR 312.0 · 480 Artikel ·
 * Stand 01.04.2025». Fehlende Angaben entfallen ERSATZLOS — ein Kantons-Erlass
 * ohne SR-Nummer bekommt keinen leeren Platzhalter (§8), und ein Erlass ohne
 * Stand behauptet keinen.
 *
 * `bestimmungsWort` kommt aus dem Grundart-Register (SSoT, §5): kantonale
 * Erlasse zählen «Paragraphen», nicht «Artikel».
 */
export function uebersichtsZeile(
  erlass: Pick<BrowseErlass, 'sr' | 'stand'>,
  anzahl: number,
  bestimmungsWort: string,
): string {
  return [
    erlass.sr ? `SR ${erlass.sr}` : null,
    `${anzahl} ${bestimmungsWort}`,
    erlass.stand ? `Stand ${formatiereDatum(erlass.stand)}` : null,
  ].filter(Boolean).join(' · ');
}

/**
 * Adresse eines Erlasses: `/gesetze/<ebene>/<key>`. Auch das ist eine
 * Erlass-spezifische Ableitung und gehört darum hierher — gefunden von der
 * Vertrags-Sonde `leser-v3-fundament.test.ts` (16.8.2026), die den Zugriff auf
 * `.ebene` in `LeserLesespalte.tsx` (Nachbar-Erlass-Links) als Verstoss gegen
 * die Zusage oben meldete. Kein `if (bund)`, aber ein Lesezugriff ausserhalb
 * der einen erlaubten Stelle: würde die Route je Ebene anders aussehen, wäre
 * er der Ort, an dem man es vergisst. Statt die Zusage aufzuweichen, ist die
 * Ableitung hergezogen.
 */
export function erlassPfad(erlass: Pick<BrowseErlass, 'ebene' | 'key'>): string {
  return `/gesetze/${erlass.ebene}/${encodeURIComponent(erlass.key)}`;
}

/**
 * Ä20 (H2b) — Platzhalter des Such-/Sprungfelds, aus dem Erlass abgeleitet.
 *
 * BEFUND (gemessen 17.8.2026): der Platzhalter lautete fest «Suchen oder
 * «Art. 429» …» — auch an einem §-Erlass, wo es keinen «Art. 429» gibt und der
 * Leser sonst durchweg «§» liest (ZH-211.11). Ein Platzhalter, der ein
 * Sprungziel nennt, das dieser Erlass nicht kennt, ist ein totes Versprechen
 * (§8) und eine Bund-Annahme im erlassneutralen Rahmen.
 *
 * `beispiel` ist das ETIKETT einer echten Bestimmung DIESES Erlasses (die
 * erste) — nicht ein aus dem Bestimmungswort gebasteltes Muster: das Etikett
 * kommt aus demselben Datenmodell, das der Sprung auflöst, und ist damit
 * garantiert eingebbar. Fehlt es (Snapshot noch nicht da), verspricht das Feld
 * keinen Sprung, sondern nennt nur die Suche.
 */
export function suchPlatzhalter(beispiel: string | null): string {
  return beispiel ? `Suchen oder «${beispiel}» …` : 'Im Gesetz suchen …';
}

/**
 * Ä21 (H2b) — trägt der Volltitel neben dem Kürzel noch eine eigene Auskunft?
 *
 * BEFUND (gemessen 17.8.2026 an ZH-211.11): dort IST das Register-Kürzel der
 * volle Name («Gebührenverordnung des Obergerichts (GebV OG)»), und der Titel
 * setzt nur noch die Fundstelle dahinter («… (LS 211.11)»). Die V3-Ortsangabe
 * schrieb beides nebeneinander, die App-Krume darüber ein drittes Mal — derselbe
 * Name dreimal in zwei Zentimetern.
 *
 * Regel: beginnt der Titel mit dem Kürzel, sagt er nichts Neues und entfällt.
 * Sonst bleibt er (StPO, VMWG, LugÜ und jeder Bundeserlass sind unberührt).
 * Bewusst `startsWith` und nicht Gleichheit: der Zusatz «(LS 211.11)» ist die
 * SR-Angabe, die die Übersichtsbox ohnehin führt (§5).
 */
export function zeigeVolltitel(erlass: Pick<BrowseErlass, 'titel' | 'kuerzel'>): boolean {
  const kuerzel = erlass.kuerzel.trim().toLowerCase();
  if (!kuerzel) return true;
  return !erlass.titel.trim().toLowerCase().startsWith(kuerzel);
}

/**
 * Ab welcher Titellänge (Zeichen) die Kennung VOR den Titel wandert.
 *
 * Kalibriert, nicht geraten: gemessen @1440 in der V3-Lesezelle (752 px, `text-h1`)
 * braucht der LugÜ-Titel mit 158 Zeichen drei Zeilen (147 px), der VMWG-Titel mit
 * 63 Zeichen eine (75 px). 80 Zeichen ist die Grenze, an der der Titel die zweite
 * Zeile verlässt — bis dahin bleibt die S3-Zitierform «Volltitel (Kürzel)»
 * unangetastet.
 */
export const TITEL_LANG_ZEICHEN = 80;

/**
 * Ä-(d) aus S3 (H2b) — die KENNUNG eines Erlasses, wenn sie vor den Titel gehört.
 *
 * BEFUND (gemessen 17.8.2026): bei Staatsverträgen mit sehr langem Volltitel
 * stand das Kürzel am Ende einer dreizeiligen H1 — «… in Zivil- und
 * Handelssachen (LugÜ)». Wer den Erlass wiedererkennen will, sucht genau diese
 * vier Zeichen und findet sie zuletzt.
 *
 * `null` = die gewohnte Zitierform «Volltitel (Kürzel)» bleibt (S3-Entscheid Ä6,
 * der ausdrücklich EINE Angabe in EINER Farbe wollte). Ein Wert = der Kopf setzt
 * die Kennung voran und lässt das Klammer-Suffix weg — dieselbe Information,
 * andere Reihenfolge, nichts doppelt.
 *
 * Zwei Ausschlüsse, beide aus dem Datenmodell und nicht aus `if (staatsvertrag)`:
 * ohne Kürzel gibt es keine Kennung, und wo der Titel mit dem Kürzel BEGINNT
 * (ZH-Fall, s. `zeigeVolltitel`), wäre die Voranstellung eine Dopplung.
 */
export function titelKennung(erlass: Pick<BrowseErlass, 'titel' | 'kuerzel'>): string | null {
  const kuerzel = erlass.kuerzel.trim();
  if (!kuerzel) return null;
  const titel = erlass.titel.trim();
  if (titel.toLowerCase().startsWith(kuerzel.toLowerCase())) return null;
  return titel.length > TITEL_LANG_ZEICHEN ? kuerzel : null;
}

/** Brotkrume für die App-Leiste: Gesetze › Ebene › Kürzel. */
export function brotkrume(
  erlass: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet' | 'kuerzel'>,
): { label: string; to?: string }[] {
  const e = ebeneAngabe(erlass);
  return [
    { label: 'Gesetze', to: '/gesetze' },
    { label: e.label, to: e.to },
    { label: erlass.kuerzel },
  ];
}
