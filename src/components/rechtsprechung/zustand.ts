// ─── Zustands-Weiche der Rechtsprechungs-Übersicht ──────────────────────────
//
// EINE Regel, ausnahmslos angewandt (LM-200/203/206, Dach-Befund LM-204):
//
//   INHALT — alles, was die TREFFERMENGE bestimmt: Sachgebiet, Norm, Richter:in,
//     Gemeinwesen (Ebene/Kanton), Instanz, Sprache, Gericht, Zeitraum, «nur
//     Leitentscheide». Gehört in die URL. Nur dort ist eine gefilterte Liste
//     teilbar, als Lesezeichen ablegbar und nach dem Neuladen wieder dieselbe.
//
//   DARSTELLUNG — alles, was DIESELBE Menge nur anders zeigt: Liste/Karten,
//     Sortierreihenfolge, Klappe «Erweiterte Filter». Gehört in localStorage:
//     geräte-persönliche Gewohnheit, kein Bestandteil dessen, was man verschickt.
//     Ein geteilter Link soll beim Empfänger dessen Ansichts-Gewohnheit behalten
//     und trotzdem exakt dieselben Entscheide zeigen.
//
// Warum die Weiche überhaupt nötig war: vor diesem Schritt lagen vier Bedien-
// elemente derselben Seite auf drei Arten (URL / localStorage / gar nichts) —
// Gemeinwesen, Instanz und Sprache filterten sichtbar, standen aber nirgends,
// und ein Neuladen stellte still nur einen Ausschnitt wieder her (§8).
//
// SCHREIBWEISE: durchgängig `replace`, kein History-Push. Das ist der Bestand,
// nicht eine neue Wahl — am 2.8.2026 an der Produktion gemessen: auch `?rg=`
// erzeugte nie einen Verlaufseintrag (`history.length` konstant). «Zurück» ist
// damit der Weg von der Seite WEG, nicht durch die eigene Filterhistorie. Der
// Befund LM-203 verlangte Gleichbehandlung der Filter — die stellt dieser
// Schritt her, indem er die Asymmetrie beseitigt, nicht indem er die
// History-Politik wechselt (ein Push je Filterklick flutet den Rückweg).
//
// EINZIGE VERBLEIBENDE LÜCKE: der Suchbegriff `q` bleibt lokal. Er ist als
// eigener, noch offener Schritt geführt (FAHRPLAN-UI-NAVIGATION §2/S1,
// debounced `replaceState`) und wird hier bewusst nicht vorweggenommen —
// jede Tastatureingabe in die URL zu schreiben ist ein anderes Problem als
// ein Facetten-Klick und braucht die dort geplante Entprellung.
//
// Reine Darstellungsschicht (§3): keine Rechtslogik, kein React — deterministisch
// (§2) und darum direkt unit-testbar (src/tests/rechtsprechung-zustand.test.ts).

import type { EntscheidFilterWerte, SortModus } from '../../lib/rechtsprechung/browse';
import { INSTANZ_ORDNUNG } from '../../lib/rechtsprechung/browse';
import type { Rechtsgebiet } from '../../lib/normtext/register';

// ── INHALT: die URL-Achsen ──────────────────────────────────────────────────

export type UrlAchse =
  | 'rg' | 'norm' | 'richter' | 'ebene' | 'kanton'
  | 'instanz' | 'sprache' | 'gericht' | 'von' | 'bis' | 'leit';

/**
 * Feld in `EntscheidFilterWerte` → Name der URL-Achse. Die einzige Stelle, an
 * der diese Zuordnung gepflegt wird (§5); Lesen (`leseFilterAusUrl`) und
 * Schreiben (`achsenDiff`) leiten sich beide daraus ab, können also nicht
 * auseinanderlaufen.
 *
 * RÜCKWÄRTSKOMPATIBEL: `rg`, `norm` und `richter` behalten Namen und Bedeutung —
 * bestehende geteilte Links und Deep-Links aus dem Gesetzes-Leser (`?norm=`)
 * bleiben gültig.
 */
export const URL_ACHSEN = {
  sachgebiet: 'rg',
  norm: 'norm',
  richter: 'richter',
  ebene: 'ebene',
  kanton: 'kanton',
  gerichtstyp: 'instanz',
  sprache: 'sprache',
  gericht: 'gericht',
  datumVon: 'von',
  datumBis: 'bis',
  nurLeitentscheide: 'leit',
} as const satisfies Partial<Record<keyof EntscheidFilterWerte, UrlAchse>>;

type UrlFeld = keyof typeof URL_ACHSEN;

const URL_FELDER = Object.keys(URL_ACHSEN) as UrlFeld[];

/** Wahrheitswert-Achse: nur `1` ist gesetzt, alles andere fehlt (kürzeste ehrliche Form). */
const AN = '1';

/**
 * Geschlossene Wertemengen prüfen statt blind casten. Ein von Hand verbogener
 * Parameter würde sonst als aktiver, aber nirgends sichtbarer Filter wirken —
 * eine unsichtbar filternde Seite ist ein §8-Verstoss. Offene Mengen (Kanton,
 * Gericht, Sprache, Sachgebiet, Norm, Richter-Slug) stammen aus den Daten und
 * prüfen sich selbst: ein unbekannter Wert trifft nichts und zeigt das ehrlich.
 */
type Ebene = NonNullable<EntscheidFilterWerte['ebene']>;
/** Zugleich Vollständigkeitsgarantie: wächst die Union in browse.ts, bricht hier der Typcheck. */
const EBENEN: Record<Ebene, 1> = { bund: 1, kanton: 1 };

function leseEbene(v: string | null): Ebene | null {
  return v && Object.prototype.hasOwnProperty.call(EBENEN, v) ? (v as Ebene) : null;
}

function leseInstanz(v: string | null) {
  const treffer = INSTANZ_ORDNUNG.find((i) => i.typ === v);
  return treffer ? treffer.typ : null;
}

/** Leerstring wie «nicht gesetzt» behandeln (`?kanton=` filtert nicht). */
function text(v: string | null): string | null {
  return v && v.length > 0 ? v : null;
}

/**
 * URL → Filterwerte. Vollständige Umkehrung von `achsenDiff`: was die Adresse
 * benennt, ist exakt das, was die Seite filtert (LM-206). Deterministisch.
 */
export function leseFilterAusUrl(params: URLSearchParams): EntscheidFilterWerte {
  return {
    sachgebiet: (text(params.get('rg')) as Rechtsgebiet | null),
    norm: text(params.get('norm')),
    richter: text(params.get('richter')),
    ebene: leseEbene(params.get('ebene')),
    kanton: text(params.get('kanton')),
    gerichtstyp: leseInstanz(params.get('instanz')),
    sprache: text(params.get('sprache')),
    gericht: text(params.get('gericht')),
    datumVon: text(params.get('von')),
    datumBis: text(params.get('bis')),
    nurLeitentscheide: params.get('leit') === AN,
  };
}

/** Ein Feld in seine URL-Form. `null` heisst: Achse entfernen. */
function kodiere(feld: UrlFeld, w: EntscheidFilterWerte): string | null {
  if (feld === 'nurLeitentscheide') return w.nurLeitentscheide ? AN : null;
  const v = w[feld];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/**
 * Die GEÄNDERTEN Achsen zwischen dem gewünschten Zustand und der aktuellen
 * Adresse — bewusst nur die Differenz, damit unbeteiligte Parameter (und die
 * Reihenfolge der übrigen) unangetastet bleiben.
 */
export function achsenDiff(
  werte: EntscheidFilterWerte,
  params: URLSearchParams,
): Partial<Record<UrlAchse, string | null>> {
  const achsen: Partial<Record<UrlAchse, string | null>> = {};
  for (const feld of URL_FELDER) {
    const achse: UrlAchse = URL_ACHSEN[feld];
    const neu = kodiere(feld, werte);
    if (neu !== text(params.get(achse))) achsen[achse] = neu;
  }
  return achsen;
}

/**
 * Mehrere URL-Achsen in EINEM Schreibvorgang anwenden. Zwei getrennte Schreib-
 * vorgänge im selben Handler bauen beide auf demselben — im laufenden Render
 * bereits VERALTETEN — `params` auf; der zweite stellt die Löschung des ersten
 * wieder her. Bis zur Richter-Achse gab es nie zwei gleichzeitige Achsen, darum
 * war der Fehler latent; «zurücksetzen» (norm + richter zusammen) hat ihn real
 * gemacht: `?norm=` kam zurück (empirisch 20.7.2026). Mit der vollen Facetten-
 * Fläche in der URL ist der gemeinsame Schreibvorgang zwingend, nicht bloss
 * vorsichtig: «zurücksetzen» löscht jetzt bis zu zehn Achsen auf einmal.
 */
export function wendeAchsenAn(
  params: URLSearchParams,
  achsen: Partial<Record<UrlAchse, string | null>>,
): URLSearchParams {
  const p = new URLSearchParams(params);
  for (const [k, v] of Object.entries(achsen)) {
    if (v) p.set(k, v); else p.delete(k);
  }
  return p;
}

/** Der NICHT in der URL geführte Rest der Filterwerte (heute: der Suchbegriff). */
export function lokaleWerte(w: EntscheidFilterWerte): EntscheidFilterWerte {
  const rest: EntscheidFilterWerte = { ...w };
  for (const feld of URL_FELDER) delete rest[feld];
  return rest;
}

// ── DARSTELLUNG: localStorage ───────────────────────────────────────────────
//
// Alle drei Ansichts-Zustände derselben Seite liegen am selben Ort und unter
// demselben Präfix. Vor diesem Schritt überlebte nur die Dichte ein Neuladen,
// Sortierung und Klappe nicht — dieselbe stille Teil-Wiederherstellung wie bei
// den Filtern, nur eine Klasse tiefer (LM-206).

export type Dichte = 'liste' | 'karten';

export const DICHTE_KEY = 'rsp:dichte';
export const SORT_KEY = 'rsp:sort';
export const KLAPPE_KEY = 'rsp:filter-offen';

/**
 * Beschriftung der Sortier-Modi — hier, weil derselbe Satz Werte auch die
 * Gültigkeitsprüfung beim Lesen trägt (§5: ein Vokabular, eine Stelle). Der
 * `Record<SortModus, string>` ist zugleich die Vollständigkeitsgarantie: ein
 * neuer Modus in `browse.ts` bricht hier den Typcheck, statt still zu fehlen.
 */
export const SORT_LABEL: Record<SortModus, string> = {
  relevanz: 'Leitentscheide zuerst',
  neu: 'Neueste zuerst',
  alt: 'Älteste zuerst',
  gericht: 'Bund → Kantone',
};

/** localStorage fehlt beim Prerender — dann gilt still der Default (§2: kein Raten). */
function lies(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

function schreib(key: string, wert: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, wert);
}

export function leseDichte(): Dichte {
  return lies(DICHTE_KEY) === 'karten' ? 'karten' : 'liste';
}

export function schreibeDichte(d: Dichte): void {
  schreib(DICHTE_KEY, d);
}

export function leseSort(): SortModus {
  const v = lies(SORT_KEY);
  return v && Object.prototype.hasOwnProperty.call(SORT_LABEL, v) ? (v as SortModus) : 'relevanz';
}

export function schreibeSort(s: SortModus): void {
  schreib(SORT_KEY, s);
}

/** Klappe «Erweiterte Filter»: zu, solange nichts anderes gespeichert ist. */
export function leseKlappe(): boolean {
  return lies(KLAPPE_KEY) === AN;
}

export function schreibeKlappe(offen: boolean): void {
  schreib(KLAPPE_KEY, offen ? AN : '0');
}
