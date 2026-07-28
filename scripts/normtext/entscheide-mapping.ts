// ─── Deterministische Mappings für die Rechtsprechungs-Pipeline (§2) ─────────
//
// Keine Heuristik im Produktpfad, keine LLM-Zuordnung: alle Tabellen sind
// DEKLARIERT. statutes[] sind Roh-Drittextraktion (NICHT verifiziert) → nur als
// «einschlägig genannt» werten, der Status bleibt 'maschinell'.

import { ERLASS_REGISTER, type Rechtsgebiet } from '../../src/lib/normtext/register';
import { FEDLEX_ABK } from './fedlex-abk.generated';

// ─── Abkürzung → Register-key: ABGELEITET, nicht gepflegt (W2·6-NKEY, §5) ─────
//
// BEFUND 21.7.2026 (Anlassfall bge_148_II_475 ohne KG-Verzahnung): Die frühere
// Hand-Whitelist `ABK_REGISTER` (26 Einträge) mappte von 9 912 Norm-Zitat-
// Nennungen über 5 093 Entscheide nur 43 % auf `normKeys` — der Rest wurde STILL
// verworfen (§6.7 dem Geist nach). Zwei Ursachen: (a) knapp 100 Erlasse sind
// längst im Korpus und fehlten bloss in der Tabelle (IPRG, KVG, RPG, MWSTG, SVG,
// VwVG, USG, KG …); (b) rund 40 % der Nennungen sind FR/IT-Kürzel, die die
// Tabelle gar nicht kannte (CST→BV, CP→StGB, LTF→BGG, CO→OR, LP/LEF→SchKG …).
//
// Statt die Tabelle zu erweitern, wird sie jetzt ABGELEITET — aus zwei Quellen:
//   1. `ERLASS_REGISTER` (src/lib/normtext/register.ts, SSoT der Erlass-Identität):
//      der Register-key IST die deutsche Abkürzung, dazu das Anzeige-Kürzel.
//      Jeder künftige Erlass wird damit automatisch verzahnbar — Ende der
//      «BGFA-Fix»-Fehlerklasse (ein Erlass im Korpus, aber nicht in der Tabelle).
//   2. `FEDLEX_ABK` (generiert, scripts/normtext/fedlex-abk.generated.ts): die
//      AMTLICHEN DE/FR/IT-Kürzel je SR-Nummer aus den Fedlex-Metadaten (§7) —
//      kein Hand-Erraten von Sprachpaaren.
// Es gibt bewusst KEINE Fuzzy-/Präfix-Suche: nur exakte Token-Identität (§2).
//
// KOLLISIONSREGEL (§1 Korrektheit vor Abdeckung): Beansprucht ein Token ZWEI
// verschiedene Register-keys, wird es NICHT gemappt (und ist über
// `ABK_KOLLISIONEN` sichtbar). So bleibt «StG» ≠ «StGB» getrennt, und «BVV»
// (BVV 2 oder BVV 3?) bzw. «ArGV» (1–5) bleiben ehrlich unzugeordnet statt
// willkürlich auf eine der Fassungen zu zeigen.

/**
 * Token-Normalform einer Abkürzung: gross, ohne Trenner. Ziffern bleiben ERHALTEN
 * («BVV 2» → 'BVV2', «ArGV 1» → 'ARGV1') — sonst kollabierten die numerierten
 * Verordnungsfassungen zu einem Token und wären nicht mehr unterscheidbar.
 * Ein kantonaler Suffix bleibt Teil des Tokens («StG/BE» → 'STGBE'), trifft also
 * nie einen Bundes-key — genau die gewollte Wirkung (§1).
 */
export function normAbk(roh: string): string {
  return String(roh).toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g, '');
}

/**
 * Deklarierte Ausschlussliste: Tokens, die NIE auf Bundesrecht mappen dürfen,
 * auch wenn eine der Quellen sie anbietet. Jede Zeile mit Grund (§8).
 */
const ABK_AUSSCHLUSS: ReadonlyMap<string, string> = new Map([
  // Kantonale Namensvetter mit identischem Kürzel. Ein kantonales «KV» (Kantons-
  // verfassung) oder «BauG» (Baugesetz) darf nie als Bundesrecht gelesen werden;
  // beide sind heute gar keine Bund-Register-keys — der Eintrag ist die VORSORGE
  // für den Tag, an dem ein Bundeserlass mit diesem Kürzel dazukommt.
  ['KV', 'kantonale Kantonsverfassungen führen dasselbe Kürzel (§1)'],
  ['BAUG', 'kantonale Baugesetze führen dasselbe Kürzel (§1)'],
  ['PG', 'kantonale Personalgesetze führen dasselbe Kürzel (§1)'],
  ['VRP', 'kantonale Verwaltungsrechtspflegegesetze (VRP/VRPG) — kein Bundeserlass (§1)'],
  ['VRPG', 'kantonale Verwaltungsrechtspflegegesetze — kein Bundeserlass (§1)'],
]);

type AbkQuelle = 'register-key' | 'register-kuerzel' | 'fedlex-de' | 'fedlex-fr' | 'fedlex-it';

/**
 * Baut den Abkürzungs-Index aus Register + Fedlex-Aliasen. Rein und
 * deterministisch (§2): gleiche Eingabe-Datenlage → gleicher Index; die Reihen-
 * folge der Quellen ist fest und beeinflusst nur die ausgewiesene `quelle`,
 * nie das Ergebnis (bei Uneinigkeit greift die Kollisionsregel).
 */
function baueAbkIndex(): {
  index: Map<string, string>;
  quelle: Map<string, AbkQuelle>;
  kollisionen: Map<string, string[]>;
} {
  // SR-Nummer → Register-keys (eine SR kann im Register mehrfach vorkommen).
  const keysProSr = new Map<string, string[]>();
  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    (keysProSr.get(e.sr) ?? (keysProSr.set(e.sr, []), keysProSr.get(e.sr)!)).push(e.key);
  }

  // Token → { Register-key → erste (stärkste) Quelle }
  const anspruch = new Map<string, Map<string, AbkQuelle>>();
  const belege = (token: string, key: string, q: AbkQuelle): void => {
    if (!token) return;
    const m = anspruch.get(token) ?? (anspruch.set(token, new Map()), anspruch.get(token)!);
    if (!m.has(key)) m.set(key, q);
  };

  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund') continue;
    belege(normAbk(e.key), e.key, 'register-key');
    belege(normAbk(e.kuerzel), e.key, 'register-kuerzel');
  }
  for (const z of FEDLEX_ABK) {
    const keys = keysProSr.get(z.sr);
    // Eine SR mit MEHREREN Register-keys ist für den Alias-Join nicht eindeutig
    // (welcher Eintrag ist gemeint?) → übersprungen statt geraten (§1).
    if (!keys || keys.length !== 1) continue;
    const key = keys[0];
    if (z.de) belege(normAbk(z.de), key, 'fedlex-de');
    if (z.fr) belege(normAbk(z.fr), key, 'fedlex-fr');
    if (z.it) belege(normAbk(z.it), key, 'fedlex-it');
  }

  const index = new Map<string, string>();
  const quelle = new Map<string, AbkQuelle>();
  const kollisionen = new Map<string, string[]>();
  for (const token of [...anspruch.keys()].sort()) {
    if (ABK_AUSSCHLUSS.has(token)) continue;
    const m = anspruch.get(token)!;
    const keys = [...m.keys()].sort();
    if (keys.length > 1) { kollisionen.set(token, keys); continue; }
    index.set(token, keys[0]);
    quelle.set(token, m.get(keys[0])!);
  }
  return { index, quelle, kollisionen };
}

const ABK = baueAbkIndex();

/** Tokens, die zwei Erlasse beanspruchen und darum bewusst NICHT mappen (§1). */
export const ABK_KOLLISIONEN: ReadonlyMap<string, readonly string[]> = ABK.kollisionen;
/** Herkunft je Token (Diagnose für das Sichtbarkeits-Tor `check:normkeys`). */
export const ABK_QUELLE: ReadonlyMap<string, AbkQuelle> = ABK.quelle;
/** Gesamtzahl gemappter Tokens (Diagnose). */
export const ABK_TOKENS: ReadonlyMap<string, string> = ABK.index;

export function normKeyFuerAbk(abk: string): string | null {
  return ABK.index.get(normAbk(abk)) ?? null;
}

/** "Art. 32 Abs. 2 BGG" → ['BGG']; mehrere Nennungen dedupliziert. */
export function statutesZuNormKeys(statutes: string[]): string[] {
  const out = new Set<string>();
  for (const s of statutes ?? []) {
    const m = /([A-Za-zÄÖÜäöü]{2,})\s*$/.exec(String(s).trim());
    if (m) { const k = normKeyFuerAbk(m[1]); if (k) out.add(k); }
  }
  return [...out];
}

// legal_area (OCL) → Sachgebiet-Achse der Gesetze.
const LEGAL_AREA: Array<[string, Rechtsgebiet]> = [
  ['civil', 'privat'], ['zivil', 'privat'], ['private', 'privat'],
  ['criminal', 'straf'], ['straf', 'straf'], ['penal', 'straf'],
  ['debt', 'schkg'], ['betreibung', 'schkg'], ['insolvenc', 'schkg'],
  ['tax', 'sozial-abgaben'], ['steuer', 'sozial-abgaben'], ['social', 'sozial-abgaben'], ['sozial', 'sozial-abgaben'],
  ['procedure', 'prozess'], ['prozess', 'prozess'],
  ['public', 'oeffentlich'], ['administrativ', 'oeffentlich'], ['oeffentlich', 'oeffentlich'],
];
export function legalAreaZuSachgebiet(area: string | null | undefined): Rechtsgebiet | null {
  if (!area) return null;
  const k = String(area).toLowerCase();
  for (const [frag, geb] of LEGAL_AREA) if (k.includes(frag)) return geb;
  return null;
}

// Abteilungs-Konvention des Bundesgerichts (Aktenzeichen-Präfix) → Sachgebiet.
// Deklariert nach amtlicher Geschäftsverteilung (deterministisch, kein Raten).
const ABTEILUNG: Record<string, Rechtsgebiet> = {
  '4A': 'privat', '4C': 'privat', '5A': 'privat', '5C': 'privat', '5D': 'privat',
  '6B': 'straf', '6S': 'straf',
  '1B': 'prozess', '7B': 'prozess',
  '1C': 'oeffentlich', '1P': 'oeffentlich', '1E': 'oeffentlich',
  '2C': 'sozial-abgaben', '2A': 'sozial-abgaben', '2D': 'sozial-abgaben',
  '8C': 'sozial-abgaben', '9C': 'sozial-abgaben',
};
export function abteilungZuSachgebiet(docket: string): Rechtsgebiet | null {
  const m = /^(\d[A-Z])/.exec(String(docket).trim());
  return m ? (ABTEILUNG[m[1]] ?? null) : null;
}

// Mehrdeutige BGer-Abteilungen: Die II. öffentlich-rechtliche Abteilung (2A/2C/2D)
// führt SOWOHL Steuer- ALS AUCH Ausländer-/Migrationssachen — der pauschale
// Abteilungs-Default «sozial-abgaben» ist für sie zu grob (C2-1). Für sie wird
// vorrangig das eindeutige Norm-Signal ausgewertet.
const ZWEIER_OER_ABTEILUNG = new Set(['2A', '2C', '2D']);
export function istMehrdeutigeOerAbteilung(docket: string): boolean {
  const m = /^(\d[A-Z])/.exec(String(docket).trim());
  return m ? ZWEIER_OER_ABTEILUNG.has(m[1]) : false;
}

// Eindeutiges Sachgebiets-Signal aus den zitierten Normen (Register-keys):
// Migrations-/Ausländerrecht → öffentlich; Steuerrecht → sozial-abgaben.
// Kein Treffer → null (der Aufrufer fällt dann auf legal_area / Abteilung zurück).
const NORM_SIGNAL: Record<string, Rechtsgebiet> = {
  AIG: 'oeffentlich', ASYLG: 'oeffentlich', BEWG: 'oeffentlich',
  DBG: 'sozial-abgaben', STHG: 'sozial-abgaben', MWSTG: 'sozial-abgaben',
  STG: 'sozial-abgaben', VSTG: 'sozial-abgaben',
};
export function normSignalSachgebiet(normKeys: Iterable<string>): Rechtsgebiet | null {
  for (const k of normKeys) {
    const g = NORM_SIGNAL[String(k).toUpperCase()];
    if (g) return g;
  }
  return null;
}

import type { Gerichtstyp } from '../../src/lib/rechtsprechung/typen';
export function gerichtstypFuerCourt(court: string): Gerichtstyp {
  switch (court) {
    case 'bge': return 'bundesgericht';   // amtliche Sammlung (BGE) = Bundesgericht
    case 'bger': return 'bundesgericht';
    case 'bvger': return 'bundesverwaltungsgericht';
    case 'bstger': return 'bundesstrafgericht';
    case 'bpatger': return 'bundespatentgericht';
    default: return 'kantonal';
  }
}

// Lesbare Gerichts-Anzeigenamen (Audit P0): roher OCL-Court-Code → Bezeichnung.
// Explizit für die erfassten Gerichte; sonst Suffix-Ableitung. Status 'maschinell'.
const GERICHT_ANZEIGE: Record<string, string> = {
  zh_obergericht: 'Obergericht ZH',
  zh_verwaltungsgericht: 'Verwaltungsgericht ZH',
  be_verwaltungsgericht: 'Verwaltungsgericht BE',
  be_zivilstraf: 'Obergericht BE',
  ag_gerichte: 'Obergericht AG',
  sg_gerichte: 'Verwaltungs-/Versicherungsgericht SG',
  gr_gerichte: 'Kantonsgericht GR',
  // BS-Tranche (§3.1): Kopf-Instanz «Aufsichtskommission …» (Anwaltsaufsicht, BGFA).
  bs_aufsichtskommission: 'Aufsichtskommission über die Anwältinnen und Anwälte BS',
};
const SUFFIX_NAME: Record<string, string> = {
  obergericht: 'Obergericht', verwaltungsgericht: 'Verwaltungsgericht',
  versicherungsgericht: 'Versicherungsgericht', sozialversicherungsgericht: 'Sozialversicherungsgericht',
  appellationsgericht: 'Appellationsgericht', kantonsgericht: 'Kantonsgericht',
  handelsgericht: 'Handelsgericht', strafgericht: 'Strafgericht', zivilgericht: 'Zivilgericht',
  kassationsgericht: 'Kassationsgericht',
};
export function gerichtAnzeigename(court: string, canton: string, courtName?: string | null): string {
  if (canton === 'CH') return courtName || 'Bundesgericht';
  if (GERICHT_ANZEIGE[court]) return GERICHT_ANZEIGE[court];
  const parts = String(court).split('_');
  const kt = (parts[0] || '').toUpperCase();
  const name = SUFFIX_NAME[parts.slice(1).join('_')] || 'Kantonales Gericht';
  return `${name} ${kt}`.trim();
}

// Kantonale Aktenzeichen-Präfixe → Sachgebiet (best-effort, deklariert, 'maschinell').
const KANT_PRAEFIX: Array<[RegExp, Rechtsgebiet]> = [
  [/^(EL|IV|UV|ALV|EO|AHV|BV|KV|FZ)\b/i, 'sozial-abgaben'],
  [/^(ZR|ZB|ZK|ZG|PS|PQ|PC|PD|PF|RE|RU|NP|LB|LC|LF|RB|HG)\b/i, 'privat'],
  [/^(SB|SK|UE|UH|US|BK|SU)\b/i, 'straf'],
  [/^(WBE|VB|VWBE)\b/i, 'oeffentlich'],
  // BS-Geschäftsarten (BS-Tranche §3.4) — jede Zeile an ≥3 echten Portal-Titeln
  // verifiziert (Inventar 19.7.2026; bei Kleinst-Beständen MV/SG/K5/KR an ALLEN
  // existierenden Dokumenten + Kopf-Instanz); unsichere Präfixe (DGZ/BO)
  // bewusst weggelassen (ehrlich Default statt geraten):
  //  AL Arbeitslosenversicherung · AH AHV · MV Militärversicherung · SG Schieds-
  //  gericht Sozialversicherung (KVG-Tarif) — Sozialversicherung.
  [/^(AL|AH|MV|SG)\b/i, 'sozial-abgaben'],
  //  BES Beschwerde Strafsachen · HB Haftsachen · DGS Dreiergericht Strafsachen ·
  //  ZS Strafsachen (Landesverweisung/Verkehrsregeln/erkennungsdienstlich).
  [/^(BES|HB|DGS|ZS)\b/i, 'straf'],
  //  BEZ Beschwerde Zivilsachen · KE Kindes-/Erwachsenenschutz · ZV Versicherungs-
  //  gericht VVG (privatrechtliche Zusatzversicherung) · K5 Zivilgericht Kammer 5
  //  (Bauhandwerkerpfandrecht/Arbeitsvertrag) · KR Kindesrückführung (HKÜ).
  [/^(BEZ|KE|ZV|K5|KR)\b/i, 'privat'],
  //  VD Verwaltungsrekurse · AUS Ausschaffungs-/Vorbereitungshaft · VG Verfassungs-
  //  gericht · AK Anwaltsaufsicht (Disziplinarrecht BGFA) · DGV Dreiergericht Verwaltung.
  [/^(VD|AUS|VG|AK|DGV)\b/i, 'oeffentlich'],
];
export function kantonalSachgebiet(docket: string): Rechtsgebiet | null {
  const d = String(docket).trim();
  for (const [re, g] of KANT_PRAEFIX) if (re.test(d)) return g;
  return null;
}

/** ISO 'YYYY-MM-DD' → 'DD.MM.YYYY' für Zitierungen. */
export function fmtDatumDe(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso);
}
