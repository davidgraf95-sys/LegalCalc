// ─── Fedlex · Achse 3: Gesetzes-Erkennung ───
//
// Teil der Achsen-Aufteilung von src/lib/fedlex.ts (QS-CODE-SPLITS): dort steht
// nur noch die Fassade, die alles Bisherige unveraendert re-exportiert. Gerichtete
// Kette ohne Zyklus: tabelle ← url ← erkennung ← parser.

import { FEDLEX, type FedlexGesetz } from './tabelle';
import { fedlexUrl } from './url';

// Mehrwort-Gesetzesnamen → Registry-Key. Nötig, weil der generische Matcher
// nur das LETZTE Token vergleicht: «Art. 16 GebV SchKG» endete sonst auf
// «SchKG» und verlinkte Art. 16 der HAUPT-SchKG (SR 281.1) statt der
// Gebührenverordnung (SR 281.35) — Code-Review-Befund #1, 7.6.2026.
// Aliase werden VOR dem Token-Match geprüft.
const MEHRWORT_ALIAS: ReadonlyArray<[string, FedlexGesetz]> = [
  ['GebV SchKG', 'GebVSchKG'],
];

// Erkennt das Gesetz eines Normverweis-Texts ('Art. 16 GebV SchKG' → 'GebVSchKG').
// Aliase werden VOR dem generischen Token-Match geprüft (Mehrwort-Namen, deren
// letztes Token sonst ein anderes Gesetz träfe). Unbekanntes Gesetz → null.
// Reiner Helfer (§5): einzige Quelle der Gesetz-Erkennung; von
// fedlexLinkFuerArtikel UND vom Norm-Snapshot-Resolver (normtext/bundRef)
// wiederverwendet — die Matching-Logik wird nicht dupliziert.
export function erkenneFedlexGesetz(text: string): FedlexGesetz | null {
  const bereinigt = text.trim();
  const alias = MEHRWORT_ALIAS.find(([name]) => bereinigt.endsWith(name));
  return alias?.[1]
    ?? (Object.keys(FEDLEX) as FedlexGesetz[]).find((g) => new RegExp(`(^|\\s)${g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).test(bereinigt))
    ?? null;
}

// ─── Kuratierte Genitiv-Namen → Fedlex-Kürzel (A10/A11, David 5.7.2026) ──────
//
// Präambeln/Ingresse UND Fliesstext nennen Fremdgesetze oft mit AUSGESCHRIEBENEM
// Namen OHNE Klammer-Kürzel («gestützt auf Artikel 130 der Bundesverfassung»;
// «nach den Artikeln 4 und 5 des Strafgesetzbuches»). N2b erkennt nur die
// «(KÜRZEL)»-Form; diese DETERMINISTISCHE, kuratierte Genitiv-Map ergänzt die
// ausgeschriebene Kurztitel-Form. §1-Grenze: NUR eindeutige amtliche Kurztitel-
// Genitive — generische Wendungen («des Bundesgesetzes über …», «der Verordnung»)
// bleiben bewusst OHNE Eintrag (⇒ Link-Unterdrückung, nie ein geratenes Ziel).
// Jeder Eintrag ist gegen den amtlichen Kurztitel des Ziel-Erlasses (struktur-
// Sidecar `kopf.titel`) belegt (Verifikation 2026-07-10, §7).
const GENITIV_GESETZ: ReadonlyArray<readonly [string, FedlexGesetz]> = [
  ['Bundesverfassung', 'BV'],
  ['Strafgesetzbuches', 'StGB'], ['Strafgesetzbuchs', 'StGB'],
  ['Militärstrafgesetzes', 'MStG'],
  ['Zivilgesetzbuches', 'ZGB'], ['Zivilgesetzbuchs', 'ZGB'],
  ['Obligationenrechts', 'OR'],
  ['Strafprozessordnung', 'StPO'],
  ['Zivilprozessordnung', 'ZPO'],
  ['Bundesgerichtsgesetzes', 'BGG'],
  ['Verwaltungsgerichtsgesetzes', 'VGG'],
  ['Umweltschutzgesetzes', 'USG'],
  ['Gewässerschutzgesetzes', 'GSCHG'],
  ['Asylgesetzes', 'ASYLG'],
  ['Strassenverkehrsgesetzes', 'SVG'],
  ['Arbeitsgesetzes', 'ArG'],
  ['Datenschutzgesetzes', 'DSG'],
  ['Berufsbildungsgesetzes', 'BBG'],
  ['Versicherungsvertragsgesetzes', 'VVG'],
  ['Freizügigkeitsgesetzes', 'FZG'],
  ['Lebensmittelgesetzes', 'LMG'],
  ['Fusionsgesetzes', 'FusG'],
  ['Bundespersonalgesetzes', 'BPG'],
  ['Unfallversicherungsgesetzes', 'UVG'],
  ['Mehrwertsteuergesetzes', 'MWSTG'],
  ['Kartellgesetzes', 'KG'],
];
const GENITIV_BY_NAME = new Map<string, FedlexGesetz>(GENITIV_GESETZ);
// Für die Regex-Alternation: längste zuerst (kein Präfix frisst einen längeren
// Namen), escaped. Fedlex-HTML trägt in langen Wörtern SOFT HYPHENS (U+00AD,
// z. B. «Zivilgesetz­bu­ches») — zwischen den Buchstaben wird darum
// optional ­ toleriert (reine Anzeige-Trennstelle, kein Inhalt).
export const GENITIV_NAMEN_ESC = [...GENITIV_GESETZ]
  .map(([n]) => n)
  .sort((a, b) => b.length - a.length)
  .map((n) => n.split('').map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('­?'));

/** Kuratierter ausgeschriebener Genitiv-Name → Fedlex-Kürzel (exakter Treffer;
 *  Soft-Hyphens U+00AD werden vor dem Lookup entfernt — reine Trennstellen). */
export function erkenneGenitivGesetz(name: string): FedlexGesetz | null {
  return GENITIV_BY_NAME.get(name.replace(/­/g, '').trim()) ?? null;
}

// ─── M6-D (W2·5b): Zielgesetz eines Fremdgesetz-Chapeaus deterministisch ──────
//
// Ein Chapeau erklärt die Bestimmungen eines FREMDEN Gesetzes für anwendbar
// («… gelten … die folgenden Bestimmungen des … (BVG) über:»); die nachfolgenden
// Aufzählungs-Items zitieren dann BLOSSE Fremd-Artikel («… (Art. 52)»), die auf
// JENES Gesetz zeigen — nicht auf den eigenen Erlass (ZGB 89a Abs. 6/7 → BVG).
// Liefert das eindeutige Fremdgesetz, damit die Render-Schicht die Items dorthin
// auflöst. §1-Grenze (lieber KEIN Ziel als ein falsches) — DREI kumulative Tore
// (gegen die quell-belegten Gegenprüfungs-Befunde kalibriert, Korpus-Test):
//   (a) ADJAZENZ (Befund 2): das Ziel ist das UNMITTELBARE Objekt von «Bestimmungen
//       des/der» — erstes Wort-Token ODER «(…KÜRZEL)»-Appositiv des direkt
//       folgenden Gesetznamens. Ein Kürzel in einem Qualifikator («… vom ATSG …»)
//       zählt NICHT (FAMZG 25 «Bestimmungen der AHV-Gesetzgebung … vom ATSG» ⇒ null).
//   (b) EINDEUTIGKEIT (§1): genau EIN Register-Gesetz im Objekt («des OR und des
//       StGB» ⇒ mehrdeutig ⇒ null).
//   (c) KATALOG-SIGNAL (Befund 3): das Objekt endet auf ein Provision-Listen-Signal
//       («über:», «… Anwendung:», «… (nicht) anwendbar:», «… folgenden:»), NICHT auf
//       einen Bedingungssatz (BS-510.100 §54 «… verwertet werden, wenn:» ⇒ null).
// Kürzel-Erkennung mit Wortgrenze je FEDLEX-Key (Identitäts-Treffer, §7/§0.2) — die
// negative Nachschau trennt Teilkürzel (StG in StGB) sauber.
const KANON = (s: string): string => s.toUpperCase().replace(/[^A-ZÄÖÜ0-9]/g, '');

function adjazentesFremdgesetz(objekt: string): FedlexGesetz | null {
  const first = objekt.match(/^\s*([A-Za-zÀ-ÿ][0-9A-Za-zÀ-ÿ.­-]*)/);
  if (first) {
    const g = erkenneFedlexGesetz(first[1]) ?? erkenneGenitivGesetz(first[1]);
    if (g) return g;
  }
  const paren = objekt.match(/\(([^)]*)\)/);
  if (paren) {
    const g = erkenneFedlexGesetz(paren[1]);
    if (g) return g;
  }
  return null;
}

export function chapeauZielFremdgesetz(chapeau: string, eigenesKuerzel?: string): FedlexGesetz | null {
  const t = chapeau.trim();
  if (!/:\s*$/.test(t)) return null; // kein Aufzählungs-Chapeau
  // Objekt = alles NACH dem LETZTEN «Bestimmungen des/der».
  const m = t.match(/^[\s\S]*\bBestimmungen\s+(?:des|der)\s+([\s\S]*)$/);
  if (!m) return null;
  const objekt = m[1];
  const eigen = KANON(eigenesKuerzel ?? '');

  // (a) Adjazenz.
  const ziel = adjazentesFremdgesetz(objekt);
  if (!ziel || KANON(ziel) === eigen) return null;

  // (b) Eindeutigkeit: genau EIN Register-Gesetz (bare Kürzel + ausgeschriebener
  //     Genitiv) im Objekt, und das ist das adjazente Ziel.
  const gesetze = new Set<FedlexGesetz>();
  for (const g of Object.keys(FEDLEX) as FedlexGesetz[]) {
    if (KANON(g) === eigen) continue;
    const esc = g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?:^|[^0-9A-Za-zÀ-ÿ])${esc}(?![0-9A-Za-zÀ-ÿ])`).test(objekt)) gesetze.add(g);
  }
  for (const [name, g] of GENITIV_GESETZ) {
    if (KANON(g) === eigen) continue;
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(?:^|[^A-Za-zÀ-ÿ])${esc}(?![A-Za-zÀ-ÿ])`).test(objekt)) gesetze.add(g);
  }
  if (/(?:^|[^0-9A-Za-zÀ-ÿ])GebV\s+SchKG(?![0-9A-Za-zÀ-ÿ])/.test(objekt)) {
    gesetze.delete('SchKG');
    gesetze.add('GebVSchKG');
  }
  if (gesetze.size !== 1 || !gesetze.has(ziel)) return null;

  // (c) Katalog-Signal (kein Bedingungssatz).
  const ohneKolon = objekt.replace(/\s*:\s*$/, '');
  if (!/(?:über|Anwendung|anwendbar|folgende[nrs]?|genannten|aufgeführten|nachstehenden)\s*$/i.test(ohneKolon)) return null;

  return ziel;
}

// Direktlink aus einem Normverweis-Text, z. B. 'Art. 335c Abs. 1 OR' →
// OR-Basis + #art_335_c. Absatz-/Ziffer-Angaben ändern den Anker nicht;
// massgeblich ist der führende Artikel.
//
// Fallback (Normentreue, nie auf geratene Anker verlinken):
// - Schlusstitel (SchlT): eigener Nummernkreis, Anker nicht deterministisch →
//   Gesetzes-Seite ohne Anker.
// - Unbekanntes Gesetz → null (kein Link).
export function fedlexLinkFuerArtikel(text: string): string | null {
  const gesetz = erkenneFedlexGesetz(text);
  if (!gesetz) return null;
  if (/\bSchlT\b/.test(text)) return FEDLEX[gesetz];
  // Bug-Check 10.6.2026 (NIEDRIG): Buchstabe UND lat. Suffix kombinierbar
  // (329gbis/663bbis/697hbis) — vorher matchte der Extraktor solche Artikel
  // gar nicht und lieferte die Gesetzes-URL ohne Anker.
  const m = text.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?)\b/);
  return m ? fedlexUrl(gesetz, m[1]) : FEDLEX[gesetz];
}
