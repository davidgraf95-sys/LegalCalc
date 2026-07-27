// ─── Deterministische Mappings für die Rechtsprechungs-Pipeline (§2) ─────────
//
// Keine Heuristik im Produktpfad, keine LLM-Zuordnung: alle Tabellen sind
// DEKLARIERT oder aus einer deklarierten Quelle ABGELEITET. statutes[] sind
// Roh-Drittextraktion (NICHT verifiziert) → nur als «einschlägig genannt»
// werten, der Status bleibt 'maschinell'.
//
// ── W2·6-NKEY (Roadmap, Dekret David 27.7.2026) ──────────────────────────────
// Die Abkürzungs-Tabelle war eine HAND-Whitelist mit 26 Einträgen — sie kannte
// z.B. IPRG nicht, obwohl der Erlass im Register steht und BGE 152 III 137 ihn
// 68-mal nennt. Ein Erlass, der im Katalog geführt wird, muss in der Verzahnung
// auch auffindbar sein. Die Tabelle wird darum aus dem ERLASS_REGISTER
// ABGELEITET (§5: eine Quelle je Fachinhalt — das Register ist sie), mit zwei
// Kandidaten je Eintrag: der Anzeige-Abkürzung (`kuerzel`, z.B. 'SchKG',
// 'BVV 2') und dem dateisicheren `key` (z.B. 'SCHKG', 'BVV_2'), beide über
// `normalisiereAbk` normalisiert.
//
// Zwei Sicherungen halten die Ableitung fachlich ehrlich (§1):
//  • ABK_AUSSCHLUSS — Abkürzungen, die föderal UND kantonal existieren und pro
//    Zitat nicht sicher trennbar sind (heute: «StG»). Sie werden NIE gemappt;
//    lieber eine Lücke als eine falsche Bundesrechts-Zuordnung (§8).
//  • ABK_KOLLISIONEN — dieselbe normalisierte Abkürzung zeigte auf ZWEI
//    verschiedene Register-keys. Dann wird das Mapping BEIDSEITIG verworfen
//    (nie geraten) und die Abkürzung hier sichtbar gemacht: das Sichtbarkeits-
//    Tor (W2·6-NKEY Baustein c) und der Unit-Test der exakten Liste machen jede
//    NEUE Kollision laut, statt sie still zu schlucken (§6.7).

import { ERLASS_REGISTER, type Rechtsgebiet } from '../../src/lib/normtext/register';
import { extrahiereStatutRefs } from '../../src/lib/rechtsprechung/zitat-extraktion';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

/**
 * Abkürzung → Vergleichsform: gross, dann alles ausser [A-Z0-9ÄÖÜ] weg.
 * Ziffern werden BEWAHRT — sonst kollabierten 'BVV 2' und 'BVV 3' (zwei
 * verschiedene Erlasse) auf dasselbe Token 'BVV' und wären nicht mehr
 * unterscheidbar (§1). Umlaute bleiben stehen, damit 'BüG' → 'BÜG' auf den
 * Register-key 'BUEG' zeigt, ohne den Umlaut vorher zu verlieren.
 */
export function normalisiereAbk(abk: string): string {
  return String(abk).toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g, '');
}

/**
 * Föderal/kantonal mehrdeutige Abkürzungen (normalisiert) → Begründung. Sie
 * werden NIE auf einen Bundes-Register-key gemappt.
 *
 * «StG» = eidg. Stempelsteuergesetz (SR 641.10) ODER kantonales Steuergesetz
 * (StG/BE, StG/ZH, StG/SG …). Der Kantons-Suffix steht nur in der Regeste-
 * Erstnennung, nicht bei jeder Fliesstext-Nennung; kantonale Grundstückgewinn-/
 * Einkommenssteuer-Fälle (z.B. BGE 152 II 116, StHG-Kontext) tragen GAR keinen
 * Suffix — eine Suffix-Heuristik greift also zu kurz. Daher konservativ ganz
 * weglassen. Preis: die wenigen echten eidg. Stempelsteuer-Leitfälle (z.B.
 * BGE 151 II 884) fehlen bewusst, bis ein positiver Bund-Signal-Diskriminator
 * gebaut ist. Befund: Gegenprüfung W3 (Opus, 2.7.2026) — 5 kantonale Falsch-
 * Positive. Deckt sich mit OCLs Design: deren kuratierte Bund-Whitelist
 * `_SR_NUMBER_MAP` (mcp_server.py:3810) listet die unzweideutigen Bundesgesetze
 * (BV/OR/ZGB/StGB/… bis DBG) und lässt «StG»/StHG bewusst WEG.
 */
export const ABK_AUSSCHLUSS: ReadonlyMap<string, string> = new Map([
  ['STG', 'föderal/kantonal mehrdeutig: eidg. Stempelabgabengesetz (SR 641.10) '
    + 'ODER kantonales Steuergesetz (StG/BE, StG/ZH …). Der Kantons-Suffix fehlt '
    + 'in der Fliesstext-Nennung, eine Suffix-Heuristik greift zu kurz — '
    + 'Gegenprüfung W3 (Opus, 2.7.2026): 5 kantonale Falsch-Positive. Lieber '
    + 'eine Lücke als eine falsche Bundesrechts-Zuordnung (§1/§8).'],
]);

/**
 * Ableitung aus dem Register (§5). Je Eintrag zwei Kandidaten (kuerzel, key) →
 * derselbe Register-key. Zeigt eine Abkürzung auf ZWEI verschiedene keys, wird
 * sie beidseitig verworfen und als Kollision ausgewiesen (nie raten, §1).
 */
function baueAbkTabelle(): { tabelle: Map<string, string>; kollisionen: string[] } {
  const tabelle = new Map<string, string>();
  const kollidiert = new Set<string>();
  for (const e of ERLASS_REGISTER) {
    for (const kandidat of [normalisiereAbk(e.kuerzel), normalisiereAbk(e.key)]) {
      if (!kandidat) continue;
      const bisher = tabelle.get(kandidat);
      if (bisher === undefined) { tabelle.set(kandidat, e.key); continue; }
      if (bisher !== e.key) kollidiert.add(kandidat);
    }
  }
  for (const k of kollidiert) tabelle.delete(k);   // beide Seiten verwerfen
  return { tabelle, kollisionen: [...kollidiert].sort() };
}

const { tabelle: ABK_TABELLE, kollisionen: KOLLISIONEN } = baueAbkTabelle();

/**
 * Abkürzungen, die auf mehrere Register-keys zeigen und darum GAR NICHT gemappt
 * werden. Leer = sauber. Sichtbar statt still (§6.7) — der Unit-Test schreibt
 * die exakte Liste fest, damit ein neuer Register-Eintrag, der eine Abkürzung
 * doppelt belegt, rot wird statt Treffer zu verlieren.
 */
export const ABK_KOLLISIONEN: ReadonlyArray<string> = KOLLISIONEN;

/**
 * Register-keys, deren Abkürzung ausgeschlossen ist (heute: 'STG'). Für den
 * Bestand-Schutzfilter in schreibeKorpus: ALT-Snapshots tragen den Key noch in
 * `normKeys`, obwohl er nicht mehr gemappt wird.
 */
export const AUSGESCHLOSSENE_KEYS: ReadonlySet<string> = new Set(
  [...ABK_AUSSCHLUSS.keys()]
    .map((abk) => ABK_TABELLE.get(abk))
    .filter((k): k is string => !!k),
);

export function normKeyFuerAbk(abk: string): string | null {
  const k = normalisiereAbk(abk);
  if (ABK_AUSSCHLUSS.has(k)) return null;
  return ABK_TABELLE.get(k) ?? null;
}

/**
 * "Art. 32 Abs. 2 BGG" → ['BGG']; mehrere Nennungen dedupliziert.
 * Das Trailing-Token fängt einen angehängten einzelnen Ziffern-Block mit
 * («Art. 27 BVV 2» → 'BVV 2' → key 'BVV_2») — ohne ihn fiele die Nennung auf
 * 'BVV' zurück und wäre von 'BVV 3' nicht mehr unterscheidbar (§1).
 */
export function statutesZuNormKeys(statutes: string[]): string[] {
  const out = new Set<string>();
  for (const s of statutes ?? []) {
    const m = /([A-Za-zÄÖÜäöü]{2,}(?:\s+\d{1,2})?)\s*$/.exec(String(s).trim());
    if (m) { const k = normKeyFuerAbk(m[1]); if (k) out.add(k); }
  }
  return [...out];
}

/**
 * Deterministische Text-Assemblage eines Snapshots für die Zitat-Extraktion
 * (W2·6-NKEY Baustein d): Regeste (flach + alle Sprachfassungen inkl. der
 * mehrteiligen «Regeste a/b/c») und alle Abschnitts-Blöcke (Volltext UND
 * BGE-Auszug). KEINE weiteren Felder — kein Rubrum, keine Dispositiv-Orders,
 * keine Zitierung: dort stehen Parteien-/Verfahrensangaben, keine Norm-Zitate.
 * Rein (§2): gleiche Eingabe → gleicher String.
 */
export function fliesstextVon(snap: EntscheidSnapshot): string {
  const teile: string[] = [];
  const reg = snap.regeste;
  if (reg) {
    teile.push(reg.text);
    for (const f of reg.sprachfassungen ?? []) {
      teile.push(f.kopf);
      teile.push(...(f.absaetze ?? []));
      for (const w of f.weitereRegesten ?? []) {
        teile.push(w.kopf);
        teile.push(...(w.absaetze ?? []));
      }
    }
  }
  for (const a of [...(snap.abschnitte ?? []), ...(snap.auszugAbschnitte ?? [])]) {
    for (const b of a.bloecke ?? []) teile.push(b.text);
  }
  return teile.filter((t) => typeof t === 'string' && t.trim() !== '').join('\n');
}

/**
 * normKeys eines Snapshots: Vereinigung aus der Roh-Drittextraktion
 * (`zitierteNormen`, OCL statutes[]) UND den im FLIESSTEXT erkannten
 * Gesetzes-Zitaten (§1 — der Anlassfall BGE 152 III 137 nennt das IPRG 68-mal
 * im Text). Optionaler `hint` = bereits aufgelöster Register-key (Quellzweig
 * mit deklarierter Erlass-Bindung). Alphabetisch sortiert → build-pfad-
 * unabhängig stabil (§2).
 */
export function normKeysVonSnapshot(snap: EntscheidSnapshot, hint?: string | null): string[] {
  const out = new Set<string>(statutesZuNormKeys(snap.zitierteNormen ?? []));
  for (const ref of extrahiereStatutRefs(fliesstextVon(snap))) {
    const k = normKeyFuerAbk(ref.gesetz);
    if (k) out.add(k);
  }
  if (hint) out.add(hint);
  return [...out].sort();
}

/**
 * (Register-key, Artikel-Token)-Paare, die ein Snapshot zitiert — 'OR/41'-Form,
 * deduppt. Quelle sind die Roh-statutes UND der Fliesstext (Baustein d). Der
 * Ausschluss mehrdeutiger Kürzel wirkt bereits in `normKeyFuerAbk`.
 * EINE Stelle (§5): Live-Index (baueArtikelIndex) und Oracle-Tor
 * (check-rangliste-oracle) rechnen mit derselben Funktion, sonst driftet das
 * Tor von dem weg, was es prüfen soll.
 */
export function artikelSchluesselVonSnapshot(snap: EntscheidSnapshot): Set<string> {
  const out = new Set<string>();
  const text = (snap.zitierteNormen ?? []).join('\n') + '\n' + fliesstextVon(snap);
  for (const ref of extrahiereStatutRefs(text)) {
    const rk = normKeyFuerAbk(ref.gesetz);
    if (!rk) continue;
    out.add(`${rk}/${ref.artikel}`);
  }
  return out;
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
