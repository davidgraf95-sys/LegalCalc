import { formatiereDatum, grundartMeta, titelOhneKlammerSuffix, verifiziertesSachgebiet } from '../helpers';
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

// ═══ B8 (H2b-Nachzug) · DAS ZÄHL-SUBSTANTIV HAT EINEN NAMEN ═════════════════
//
// BEFUND (Architektur-Review 17.8.2026, Positionen 1 und 2): das Wort, mit dem
// ein Erlass seine Bestimmungen zählt, lag als NACKTES UNION-LITERAL an fünf
// Stellen in `v3/` (`SuchZone`, `LeserGliederung`, `LeserUebersicht`,
// `LeserTrefferListe`, dazu `parts/ErlassUebersicht`), die ABLEITUNG aus dem
// Grundart-Register stand doppelt (`LeserRahmenV3`, `inhalt-volltext`) und die
// Singular-Regel dreifach (`SuchZone`, `LeserTrefferListe` 2 ×). Sechs Orte, die
// dieselbe Sache wissen mussten — genau die Streuung, aus der Ä23 entstand
// («Artikel» hart kodiert an einem §-Erlass).
//
// Hier stehen jetzt: der TYP, die ABLEITUNG und die ZÄHLFORM. Bewacht von
// `src/tests/leser-v3-fundament.test.ts` («kein 'Paragraphen'-Literal in `v3/`
// ausser in dieser Datei»).
//
// AUSDRÜCKLICH NICHT MITGEZOGEN: `parts/ErlassUebersicht.tsx` und
// `parts/ErlassLeserKopf.tsx` behalten ihre eigenen Unions. Sie sind GETEILTE
// Bausteine, die auch die Ist-Hülle rendert; würden sie einen Typ aus `v3/`
// importieren, hinge die eingefrorene Hülle an der neuen (FL-4, und die
// Abhängigkeitsrichtung wäre umgekehrt). `inhalt-volltext.tsx` (V1) bleibt
// unberührt — die Doppelung dort ist notiert, nicht gefixt.

/** Zähl-Substantiv der Bestimmungen eines Erlasses. Nie ein Vorgabewert: ein
 *  stiller Rückfall auf «Artikel» wäre die Bund-Annahme, die die
 *  Erlass-Neutralität ausschliesst (Fundament-Auflage 2). */
export type BestimmungsWort = 'Artikel' | 'Paragraphen';

/**
 * Die EINE Ableitung: kantonale Erlasse mit §-Etikett zählen «Paragraphen».
 * Nimmt den Erlass-Key und fragt das Grundart-Register (SSoT, §5) selbst — so
 * kann kein Aufrufer die Ableitung «fast richtig» nachbauen.
 */
export function bestimmungsWort(erlassKey: string): BestimmungsWort {
  return grundartMeta(erlassKey).bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';
}

/**
 * Zählform des Bestimmungsworts. «Artikel» ist im Deutschen formgleich,
 * «Paragraphen» nicht — «1 Paragraphen» wäre ein Grammatikfehler an einer
 * Kernauskunft (§8). Stand vor dem Nachzug an drei Stellen; jetzt an einer.
 */
export function zaehlform(n: number, wort: BestimmungsWort): string {
  return n === 1 && wort === 'Paragraphen' ? 'Paragraph' : wort;
}

/**
 * «diesem Artikel» / «diesem Paragraphen» — die DATIV-Einzahl (H3-Nachzug C1).
 *
 * Eigene Ableitung und nicht `zaehlform(1, …)`: die Zählform liefert den
 * NOMINATIV («1 Paragraph»), im Dativ steht dieselbe Bestimmung als «diesem
 * Paragraphen» (schwache Deklination). Wer die Zählform hier zweitverwendete,
 * schrieb «zu diesem Paragraph» — ein Grammatikfehler an einer Kernauskunft,
 * genau die Klasse, gegen die `zaehlform` gebaut wurde (§8).
 *
 * ANLASS (Architektur-Review 17.8.2026, C1): «Artikel» stand hart im Code an
 * drei Stellen des Panels (`PANEL_REITER`-Titel, Bedien- und Bestands-Satz im
 * Reiter «Entscheide») — an BS-640.100 (§-Erlass) las man dort «zu diesem
 * Artikel». Dieselbe Fehlerklasse wie Ä23, nur eine Etappe später.
 */
export function bestimmungDativ(wort: BestimmungsWort): string {
  return wort === 'Paragraphen' ? 'diesem Paragraphen' : 'diesem Artikel';
}

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
 * ── B2 (H2b-Nachzug) · WORTGLEICH, NICHT «FÄNGT GLEICH AN» ──────────────────
 * H2b prüfte `startsWith` und begründete das mit dem SR-Zusatz «(LS 211.11)».
 * Der Zusatz war richtig erkannt, die Regel dafür zu weit: sie unterdrückt den
 * Volltitel auch dann, wenn er ÜBER das Kürzel hinaus etwas sagt. Gemessen
 * 17.8.2026 an drei Klassen von Fällen:
 *   · `kanton/BS-BeE 610.100` — Kürzel «Finanzreglement», Titel «Finanzreglement
 *     über das Rechnungswesen der Einwohnergemeinde Bettingen». Der Kopf zeigte
 *     nur «Finanzreglement», und `BS-154.125` trägt dasselbe Kürzel: zwei
 *     verschiedene Erlasse, ein ununterscheidbarer Kopf (§8).
 *   · `bund/ASYLG` — Kürzel «AsylG», Titel «Asylgesetz (AsylG)». «Asylgesetz»
 *     beginnt zufällig mit «asylg» ⇒ der Volltitel fiel weg, obwohl er das Wort
 *     ist, das man liest. Ebenso `BS-121.100` («BüRG» ⇒ «Bürgerrechtsgesetz»).
 *   · `kanton/ZH-211.11` — hier gilt die Unterdrückung weiter: nach Abzug des
 *     Klammer-Suffixes IST der Titel Zeichen für Zeichen das Kürzel.
 * NEUE REGEL: der Volltitel entfällt nur bei WORTGLEICHHEIT mit dem Kürzel,
 * gemessen an derselben Zeichenkette, die gedruckt wird (`titelOhneKlammerSuffix`
 * — §5, dieselbe Ableitung wie im Erlass-Kopf). Wirkung über den Korpus: 784 → 775
 * unterdrückte Volltitel, also 9 Erlasse bekommen ihre Auskunft zurück.
 *
 * KEIN `title`-ERSATZ: wo der Volltitel bleibt, steht er sichtbar. Ein Tooltip
 * ist keine Auskunft — er existiert für Maus-Nutzer und für niemanden sonst (§8).
 */
export function zeigeVolltitel(erlass: Pick<BrowseErlass, 'titel' | 'kuerzel'>): boolean {
  const kuerzel = erlass.kuerzel.trim().toLowerCase();
  if (!kuerzel) return true;
  return titelOhneKlammerSuffix(erlass.titel).toLowerCase() !== kuerzel;
}

/**
 * Ab welcher Titellänge (Zeichen) die Kennung VOR den Titel wandert.
 *
 * Kalibriert, nicht geraten: gemessen @1440 in der V3-Lesezelle (752 px, `text-h1`)
 * braucht der LugÜ-Titel mit 158 Zeichen drei Zeilen (147 px), der VMWG-Titel mit
 * 63 Zeichen eine (75 px). 80 Zeichen ist die Grenze, an der der Titel die zweite
 * Zeile verlässt — bis dahin bleibt die S3-Zitierform «Volltitel (Kürzel)»
 * unangetastet.
 *
 * B1: gemessen wird die ANGEZEIGTE Länge (`titelOhneKlammerSuffix`), nicht die
 * rohe — sonst gilt eine Schwelle, die an der Lesezelle kalibriert ist, für einen
 * String, der dort nie steht (s. `helpers.titelOhneKlammerSuffix`).
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
  // B1: DIESELBE Zeichenkette, die `parts/ErlassLeserKopf` als Titelzeile setzt.
  const angezeigt = titelOhneKlammerSuffix(erlass.titel);
  if (angezeigt.toLowerCase().startsWith(kuerzel.toLowerCase())) return null;
  return angezeigt.length > TITEL_LANG_ZEICHEN ? kuerzel : null;
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
