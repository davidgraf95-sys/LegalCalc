// ─── Deterministische Mappings für die Rechtsprechungs-Pipeline (§2) ─────────
//
// Keine Heuristik im Produktpfad, keine LLM-Zuordnung: alle Tabellen sind
// DEKLARIERT oder aus einer deklarierten Quelle ABGELEITET.
//
// QUELLE der Norm-Zuordnung (Stand W2·6-NKEY a+d, ehrlich benannt — §8):
// `statutes[]` (Roh-Drittextraktion OCL, NICHT verifiziert) ∪ deterministische
// FLIESSTEXT-Erkennung (`extrahiereStatutRefs` über Regeste + alle Abschnitts-
// Blöcke). Beide Zweige sind maschinell → der Status bleibt 'maschinell', nie
// als geprüftes Präjudiz verkauft (§7/§8).
//
// Die Fliesstext-Erkennung ist bewusst VOLLSTÄNDIG und damit auch beiläufig:
// erfasst wird jede Nennung im Urteilstext, einschliesslich rein prozessualer
// Standard-Zitate — das BGG erscheint dadurch in rund 85 % der Snapshots, ohne
// dass der Entscheid in der Sache etwas zum BGG sagt. Das ist der ausdrückliche
// Dekret-Stand (David, 27.7.2026): erst vollständig erkennen, dann über Ranking
// und Deckel kuratieren (LEITFAELLE_PRO_ARTIKEL, proNorm-Top-12) — nie durch
// stilles Verwerfen an der Extraktion, weil ein verworfenes Zitat nirgends mehr
// sichtbar ist und die Lücke niemand bemerkt (§8/§6.7).
//
// ── ZWEI EBENEN, ZWEI SEMANTIKEN (Gegenprüfung R2/B1, 28.7.2026) ─────────────
// Der voranstehende Absatz gilt unverändert für die ERLASS-Ebene
// (`normKeysVonSnapshot`): dort heisst ein Treffer «dieser Entscheid NENNT den
// Erlass», Vollständigkeit ist der Zweck, Beiläufigkeit der Preis.
//
// Die ARTIKEL-Ebene (`artikelSchluesselVonSnapshot`) sagt etwas anderes. Sie
// trägt in der UI die Überschrift «Bundesgerichtsentscheide zu Art. X» — ein
// Versprechen über den Inhalt. Dort gilt seit R2 eine KORROBORATIONS-REGEL:
// statutes ODER Regeste ODER ≥2 Nennungen im übrigen Fliesstext. Anlass war ein
// Literatur-Phantom (BGE 150 IV 10 unter MSTG/171c, Artikel nur im Buchtitel
// eines Kommentars genannt). Die Regel steht vollständig samt Messung an
// `artikelSchluesselMitBefund`.
//
// Die Divergenz ist gewollt und wird hier benannt, damit sie niemand später als
// Inkonsistenz «aufräumt»: Vollständigkeit auf der Erlass-Ebene und Präzision
// auf der Artikel-Ebene sind zwei verschiedene Aussagen; eine gemeinsame Regel
// müsste eine davon aufgeben (§1). Eine Nennung unterhalb der Artikel-Schwelle
// geht darum NICHT verloren — sie bleibt auf der Erlass-Ebene sichtbar, und die
// Zahl der verworfenen Singletons weist der `--remap`-Lauf aus (§6.7).
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
// ── W2·6-NKEY Baustein b: die Alias-Ebene ────────────────────────────────────
// Die Register-Ableitung kennt nur das DEUTSCHE Anzeige-Kürzel. Ein Entscheid
// in französischer Amtssprache zitiert aber «art. 42 LTF» statt «Art. 42 BGG»,
// ein italienischer «art. 41 CO» statt «Art. 41 OR» — dasselbe Bundesgesetz,
// ein anderes amtliches Kürzel, und ohne Zuordnung verschwand das Zitat
// lautlos. Das Sichtbarkeits-Tor (Baustein c) hat die Lücke beziffert: 34
// FR/IT-Amtskürzel über der Schwelle, 76.8 % gemappte Nennungen.
// Dagegen steht `ABK_ALIASE` (src/lib/normtext/abk-aliase.generated.ts) —
// amtliche Kurzbezeichnungen je Amtssprache aus Fedlex (jolux:titleShort,
// Currency-Fenster), über die SR-Nummer an den Register-key gebunden. Nach dem
// Einzug: 93.6 % gemappte Nennungen, Rot-Liste 46 → 12 (Messung 28.7.2026);
// nach der Linse-2-Härtung 93.7 % bei 11 Einträgen, gleicher Korpus.
// Die Aliase sind KEINE zweite Wahrheit (§5): der Erlass-Bestand bleibt das
// Register, das Artefakt trägt nur dessen fremdsprachige Namen.
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

import { ABK_ALIASE } from '../../src/lib/normtext/abk-aliase.generated';
import { ERLASS_REGISTER, type Rechtsgebiet } from '../../src/lib/normtext/register';
import {
  extrahiereStatutRefs, extrahiereStatutRefsMitAnzahl, INVALID_LAW_CODES,
} from '../../src/lib/rechtsprechung/zitat-extraktion';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

/**
 * Abkürzung → Vergleichsform: gross, dann alles ausser [A-Z0-9ÄÖÜ] weg.
 * Ziffern werden BEWAHRT — sonst kollabierten 'BVV 2' und 'BVV 3' (zwei
 * verschiedene Erlasse) auf dasselbe Token 'BVV' und wären nicht mehr
 * unterscheidbar (§1). Umlaute bleiben stehen, damit 'BüG' → 'BÜG' auf den
 * Register-key 'BUEG' zeigt, ohne den Umlaut vorher zu verlieren.
 *
 * REICHWEITE der Ziffern-Bewahrung, ehrlich (§8): sie wirkt im statutes-Pfad
 * (`statutesZuNormKeys` liest das Trailing-Token samt Ziffernblock) — NICHT im
 * Fliesstext-Pfad. `extrahiereStatutRefs` matcht `GESETZ_CODE` ohne Leerzeichen
 * und trifft daher nur die zusammengeschriebene Form: 'Art. 27 BVV2' → 'BVV2',
 * 'Art. 27 BVV 2' → gesetz 'BVV' → `normKeyFuerAbk('BVV')` = null (empirisch
 * geprüft 28.7.2026). Betroffen sind die getrennt geschriebenen Ziffern-Kürzel
 * BVV 2/BVV 3, ArGV 1–5 und AsylV 1–3. Der Extraktor wird dafür bewusst NICHT
 * geändert: seine Falsch-Positiv-Abstimmung ist kampferprobt, und ein
 * gelockerter Ziffern-Anhang zöge Randnummern/Jahreszahlen als Erlass-Suffix
 * herein (§1: lieber eine benannte Lücke als ein falscher Treffer). Die Lücke
 * ist gedeckt, solange die Nennung auch in `statutes[]` steht; ungemappte
 * 'BVV'-Token weist das Sichtbarkeits-Tor (Baustein c) aus, statt sie still zu
 * schlucken (§6.7).
 *
 * ZWEITE STRUKTURELLE GRENZE — AKZENTUIERTE KÜRZEL (Linse 2, 28.7.2026). Der
 * Fliesstext-Extraktor kennt nur `[A-Z0-9]` plus die drei deutschen Umlaute als
 * END-Buchstaben (`GESETZ_CODE`). Ein amtliches Kürzel mit Akzent — «LPMéd»
 * (SR 811.11), «OMéd» (SR 812.212.21), «LFORêts», «OJéN» — ist damit im
 * Fliesstext-Pfad BEWUSST NICHT erfassbar. Bis zur Linse 2 wurde es nicht etwa
 * verworfen, sondern TRUNKIERT: «LPMéd» lieferte das Token 'LPM' — das amtliche
 * fr/it-Kürzel des MARKENSCHUTZGESETZES (SR 232.11) — und damit einen falschen
 * Norm-Key (16 Nennungen in 5 BGE, empirisch belegt). Seither endet der Match
 * gar nicht mehr: kein Token statt eines falschen (§1 — eine benannte Lücke ist
 * einer stillen Fehlzuordnung immer vorzuziehen).
 *
 * FOLGE FÜR DIE ALIAS-EBENE: ein Alias, dessen normalisierte Form der Extraktor
 * strukturell nie erzeugen kann (Akzent oder Leerzeichen in der amtlichen
 * Abkürzung — 'LPMéd' → 'LPMD', 'BVV 2' → 'BVV2'), ist im Fliesstext-Pfad ein
 * TOTER, aber HARMLOSER Eintrag: er kann nichts falsch zuordnen, weil ihn nie
 * jemand nachschlägt. Im statutes-Pfad bleibt er wirksam (`abkVonStatut` liest
 * das Roh-Token samt Akzent). Tot heisst darum «wirkungslos in einem der beiden
 * Zweige», nicht «zu entfernen». Damit die Liste nicht still wächst, weist das
 * Tor check:normkeys sie informativ aus (kein Rot — es ist kein Fehler, sondern
 * eine Eigenschaft der Extraktion, §8).
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
 * Register-keys, deren Abkürzung ausgeschlossen ist (heute: 'STG'). Für den
 * Bestand-Schutzfilter in schreibeKorpus: ALT-Snapshots tragen den Key noch in
 * `normKeys`, obwohl er nicht mehr gemappt wird.
 *
 * Abgeleitet DIREKT aus dem ERLASS_REGISTER, nicht über `ABK_TABELLE` (Härtung
 * 28.7.2026): die Tabelle VERWIRFT kollidierte Abkürzungen beidseitig. Käme je
 * ein zweiter Register-Eintrag mit normalisiert 'STG' dazu, verschwände der
 * Eintrag aus der Tabelle — `ABK_TABELLE.get('STG')` wäre `undefined`, die
 * Menge LEER und der Bestand-Schutzfilter still entwaffnet (nachgestellt: genau
 * dieser Fall liefert `[]`). Ein Schutz, der sich durch eine Kollision selbst
 * abschaltet, ist ein Tor, das nicht scheitern kann (§6.7). Darum wird über die
 * Register-Einträge gescannt — kollisionsunabhängig, und ein kollidierender
 * Zweit-Erlass landet zusätzlich in der Menge statt sie zu leeren.
 *
 * STEHT VOR der Tabellen-Ableitung (28.7.2026, Baustein b), weil die Alias-Ebene
 * sie braucht: ein fremdsprachiges Kürzel darf einen ausgeschlossenen Erlass
 * nicht durch die Hintertür wieder hereinholen (siehe baueAbkTabelle).
 */
export const AUSGESCHLOSSENE_KEYS: ReadonlySet<string> = new Set(
  ERLASS_REGISTER
    .filter((e) => ABK_AUSSCHLUSS.has(normalisiereAbk(e.kuerzel))
                || ABK_AUSSCHLUSS.has(normalisiereAbk(e.key)))
    .map((e) => e.key)
    .sort(),
);

/**
 * SR-Nummer → Register-key, für die Auflösung der Fedlex-Aliase (Baustein b).
 *
 * NUR Bund-Einträge. Bei kantonalen Einträgen trägt `sr` die KANTONALE
 * Systematiknummer ('161.12' in BE), die einer Bundes-SR-Nummer zufällig
 * gleichen kann — eine Auflösung darüber zeigte auf einen völlig anderen
 * Erlass (§1). Zeigt eine SR-Nummer auf ZWEI Register-keys, wird sie beidseitig
 * verworfen (nie raten); die betroffenen Aliase erscheinen dann in
 * ABK_ALIAS_NOTIZEN, statt still zu verschwinden (§6.7).
 */
function baueSrIndex(): { srKey: Map<string, string>; mehrdeutig: Set<string> } {
  const srKey = new Map<string, string>();
  const mehrdeutig = new Set<string>();
  for (const e of ERLASS_REGISTER) {
    if (e.ebene !== 'bund' || !e.sr) continue;
    const bisher = srKey.get(e.sr);
    if (bisher === undefined) { srKey.set(e.sr, e.key); continue; }
    if (bisher !== e.key) mehrdeutig.add(e.sr);
  }
  for (const sr of mehrdeutig) srKey.delete(sr);
  return { srKey, mehrdeutig };
}

/**
 * Ableitung aus dem Register (§5) UND den amtlichen Fedlex-Kürzeln.
 *
 * Zwei Kandidaten-Quellen, EINE Tabelle und EINE Kollisionsregel:
 *  (1) Register — je Eintrag die Anzeige-Abkürzung (`kuerzel`) und der
 *      dateisichere `key`, beide → derselbe Register-key.
 *  (2) ABK_ALIASE (generiert aus Fedlex, W2·6-NKEY b) — die amtliche
 *      Kurzbezeichnung je Amtssprache, über die SR-Nummer auf den Register-key
 *      aufgelöst: 'LTF'/'CO'/'CPC'/'LP'/'CEDH' → BGG/OR/ZPO/SCHKG/EMRK. Ohne
 *      diese Ebene verschwand jedes Zitat eines französisch- oder italienisch-
 *      sprachigen Entscheids lautlos, obwohl es dasselbe Bundesrecht meint.
 *
 * Zeigt eine normalisierte Abkürzung auf ZWEI verschiedene keys, wird sie
 * beidseitig verworfen und als Kollision ausgewiesen (nie raten, §1) — für
 * Aliase gilt exakt dieselbe Regel wie für die Register-Kandidaten. Ein Alias
 * ist kein besseres Wissen als das Register; er ist dieselbe Art Kandidat.
 *
 * ABK_AUSSCHLUSS wirkt auf BEIDE Quellen, und für Aliase auf der KEY-Ebene:
 * ein Alias, dessen Erlass ausgeschlossen ist, wird gar nicht erst aufgenommen.
 * Der Anlassfall ist SR 641.10 (eidg. Stempelabgabengesetz): das deutsche «StG»
 * ist föderal/kantonal mehrdeutig und darum ausgeschlossen — die amtlichen
 * Kürzel «LT» (fr) und «LTB» (it) sind es NICHT und würden denselben Key 'STG'
 * über die Hintertür in den Korpus tragen. Das wäre eine fachliche Entscheidung
 * («altrechtlich/kantonal ausgeschlossene Erlasse doch wieder zulassen»), und
 * die trifft kein Build-Schritt nebenbei (§7/§8). Zwei Wirkungen wären sonst
 * widersprüchlich: `normKeysVonSnapshot` erzeugte den Key, der Schreibpfad
 * (schreibeKorpus, AUSGESCHLOSSENE_KEYS) verwürfe ihn beim Index wieder — ein
 * halber Zustand, der niemandem hilft. Die verworfenen Aliase stehen in
 * ABK_ALIAS_AUSGESCHLOSSEN, damit die Lücke benannt bleibt statt still zu sein.
 */
function baueAbkTabelle(): {
  tabelle: Map<string, string>; kollisionen: string[]; notizen: string[]; ausgeschlossen: string[];
} {
  const tabelle = new Map<string, string>();
  const kollidiert = new Set<string>();
  const notizen: string[] = [];
  const ausgeschlossen: string[] = [];
  const setze = (kandidat: string, key: string): void => {
    if (!kandidat) return;
    const bisher = tabelle.get(kandidat);
    if (bisher === undefined) { tabelle.set(kandidat, key); return; }
    if (bisher !== key) kollidiert.add(kandidat);
  };

  for (const e of ERLASS_REGISTER) {
    setze(normalisiereAbk(e.kuerzel), e.key);
    setze(normalisiereAbk(e.key), e.key);
  }

  const { srKey, mehrdeutig } = baueSrIndex();
  for (const a of ABK_ALIASE) {
    const key = srKey.get(a.sr);
    if (key === undefined) {
      notizen.push(
        `${a.abk} (SR ${a.sr}, ${a.sprache}) — `
        + (mehrdeutig.has(a.sr)
          ? 'SR im ERLASS_REGISTER mehrdeutig (zwei keys): Alias verworfen'
          : 'SR nicht (mehr) im ERLASS_REGISTER: Alias verworfen'),
      );
      continue;
    }
    if (AUSGESCHLOSSENE_KEYS.has(key) || ABK_AUSSCHLUSS.has(normalisiereAbk(a.abk))) {
      ausgeschlossen.push(`${a.abk} (SR ${a.sr}, ${a.sprache}) → ${key}`);
      continue;
    }
    setze(normalisiereAbk(a.abk), key);
  }

  for (const k of kollidiert) tabelle.delete(k);   // beide Seiten verwerfen
  return {
    tabelle,
    kollisionen: [...kollidiert].sort(),
    notizen: notizen.sort(),
    ausgeschlossen: ausgeschlossen.sort(),
  };
}

const {
  tabelle: ABK_TABELLE,
  kollisionen: KOLLISIONEN,
  notizen: ALIAS_NOTIZEN,
  ausgeschlossen: ALIAS_AUSGESCHLOSSEN,
} = baueAbkTabelle();

/**
 * Aliase des generierten Artefakts, die sich NICHT auf einen Register-key
 * auflösen liessen (SR fehlt oder ist mehrdeutig). Leer = Artefakt und Register
 * sind synchron.
 *
 * Sichtbar statt still (§6.7): ein Erlass, der aus dem Register verschwindet
 * oder eine SR-Nummer doppelt belegt, macht seine Aliase wirkungslos — ohne
 * diese Liste bemerkte das niemand, weil ein wirkungsloses Alias sich genau wie
 * ein nie erzeugtes verhält. Das Tor check:normkeys weist sie aus.
 */
export const ABK_ALIAS_NOTIZEN: ReadonlyArray<string> = ALIAS_NOTIZEN;

/**
 * Aliase, die auf einen AUSGESCHLOSSENEN Erlass zeigen und darum nicht in die
 * Tabelle kommen (heute: 'StG'/'LT'/'LTB' → 'STG', SR 641.10). KEIN Fehler,
 * sondern die bewusst fortgeführte Lücke aus ABK_AUSSCHLUSS — aber sie wird
 * ausgewiesen, weil eine Lücke, die niemand sieht, sich nicht schliessen lässt.
 *
 * OFFENE FACHFRAGE (§7, Entscheid David): «LT»/«LTB» sind im Korpus belegt
 * ausschliesslich eidgenössisch (bund/bge/151_II_545, 151_II_884, 149_II_462 —
 * Stempelabgaben-Leitfälle) und wären damit genau der «positive Bund-Signal-
 * Diskriminator», den der ABK_AUSSCHLUSS-Kommentar als Bedingung nennt. Sie
 * freizugeben ist eine fachliche Entscheidung über den Umgang mit dem
 * mehrdeutigen «StG», nicht eine Folge der Alias-Ernte — darum hier vorgemerkt
 * statt nebenbei umgesetzt.
 */
export const ABK_ALIAS_AUSGESCHLOSSEN: ReadonlyArray<string> = ALIAS_AUSGESCHLOSSEN;

/**
 * Abkürzungen, die auf mehrere Register-keys zeigen und darum GAR NICHT gemappt
 * werden. Leer = sauber. Sichtbar statt still (§6.7) — der Unit-Test schreibt
 * die exakte Liste fest, damit ein neuer Register-Eintrag, der eine Abkürzung
 * doppelt belegt, rot wird statt Treffer zu verlieren.
 */
export const ABK_KOLLISIONEN: ReadonlyArray<string> = KOLLISIONEN;

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
    const abk = abkVonStatut(s);
    if (!abk) continue;
    const k = normKeyFuerAbk(abk);
    if (k) out.add(k);
  }
  return [...out];
}

/**
 * Trailing-Token einer Roh-statutes-Zeile, VOR der Normalisierung:
 * "Art. 32 Abs. 2 BGG" → 'BGG', "Art. 27 BVV 2" → 'BVV 2'. Kein Treffer → null.
 *
 * EIGENE exportierte Funktion, weil zwei Aufrufer dieselbe Zerlegung brauchen
 * (§5): `statutesZuNormKeys` (Produktpfad) und das Sichtbarkeits-Tor
 * `check:normkeys` (scripts/normtext/check-normkeys-abdeckung.ts). Eine Kopie
 * des Regex im Tor hiesse: das Tor misst eine ANDERE Zerlegung als die, die im
 * Korpus wirkt — es meldete dann Lücken, die es nicht gibt, und übersähe die
 * echten. Genau das soll ein Tor nicht können (§6.7).
 *
 * DIESELBE SPERRE WIE IM FLIESSTEXT-PFAD (Linse 2, 28.7.2026). Der Fliesstext-
 * Extraktor verwirft Kandidaten aus `INVALID_LAW_CODES` — Artikel, Präpositionen
 * und Konjunktionen DE/FR/IT, Struktur-Marker, Währungscodes. Der statutes-Pfad
 * kannte diese Sperre NICHT und war damit die offene Flanke derselben
 * Fehlerklasse: eine Roh-Zeile, die auf ein solches Wort endet, lieferte das
 * Wort als Erlass-Kandidaten. Belegt am konstruierten Fall «Art. 5 de la» →
 * Token 'la' → 'LA' — seit der Alias-Ernte (Baustein b) das amtliche fr-Kürzel
 * des LUFTFAHRTGESETZES (SR 748.0) → `statutesZuNormKeys` gab ['LFG'] zurück.
 * Im heutigen Korpus feuert der Kanal (noch) nicht: die 6 vorkommenden
 * INVALID-Token (BGE 51, NR 4, SI 3, FR 3, NE 1, ART 1 — die drei letzten
 * Kantons-Suffixe aus «KV/FR», «LAQ/SI», «KV/NE») mappen alle auf nichts. Das
 * ist kein Grund, die Sperre wegzulassen, sondern der Grund, sie JETZT zu
 * setzen: jede neue Alias-Ernte kann ein weiteres dieser Wörter zu einem
 * gültigen Kürzel machen, ohne dass irgendwo etwas rot wird (§5 — eine Sperre,
 * die nur einer von zwei Pfaden kennt, ist keine Sperre).
 *
 * Wirkung auf das Tor: die Token verschwinden aus der Zählung, statt als
 * «ungemappt» geführt zu werden — richtig, denn sie sind gar keine Kandidaten.
 * Der frühere IGNORE-Eintrag 'BGE' in check-normkeys-abdeckung.ts ist damit
 * gegenstandslos geworden und wurde dort gestrichen (die Begründung steht in
 * dessen Kopf).
 */
export function abkVonStatut(statut: string): string | null {
  const m = /([A-Za-zÄÖÜäöü]{2,}(?:\s+\d{1,2})?)\s*$/.exec(String(statut).trim());
  if (!m) return null;
  if (INVALID_LAW_CODES.has(normalisiereAbk(m[1]))) return null;
  return m[1];
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
  return zusammen([...regesteTeile(snap), ...blockTeile(snap.abschnitte), ...blockTeile(snap.auszugAbschnitte)]);
}

/** Gemeinsame Endstufe aller Text-Assemblagen: leere Teile weg, mit `\n` fügen. */
function zusammen(teile: readonly (string | undefined)[]): string {
  return teile.filter((t) => typeof t === 'string' && t.trim() !== '').join('\n');
}

/** Regeste-Anteil (flach + alle Sprachfassungen inkl. «Regeste a/b/c»), in Reihenfolge. */
function regesteTeile(snap: EntscheidSnapshot): string[] {
  const teile: string[] = [];
  const reg = snap.regeste;
  if (!reg) return teile;
  teile.push(reg.text);
  for (const f of reg.sprachfassungen ?? []) {
    teile.push(f.kopf);
    teile.push(...(f.absaetze ?? []));
    for (const w of f.weitereRegesten ?? []) {
      teile.push(w.kopf);
      teile.push(...(w.absaetze ?? []));
    }
  }
  return teile;
}

/** Block-Texte einer Abschnittsfolge, in Reihenfolge. */
function blockTeile(abschnitte: EntscheidSnapshot['abschnitte'] | undefined): string[] {
  const teile: string[] = [];
  for (const a of abschnitte ?? []) for (const b of a.bloecke ?? []) teile.push(b.text);
  return teile;
}

/**
 * NUR die Regeste eines Snapshots — der amtliche LEITSATZ. Eine dort genannte Norm
 * ist per Definition die Norm, um die es im Entscheid geht; sie braucht keine
 * weitere Korroboration (Regel (ii) in `artikelSchluesselVonSnapshot`).
 */
export function regesteTextVon(snap: EntscheidSnapshot): string {
  return zusammen(regesteTeile(snap));
}

/**
 * normKeys eines Snapshots: Vereinigung aus der Roh-Drittextraktion
 * (`zitierteNormen`, OCL statutes[]) UND den im FLIESSTEXT erkannten
 * Gesetzes-Zitaten (§1 — der Anlassfall BGE 152 III 137 nennt das IPRG 68-mal
 * im Text). Optionaler `hint` = bereits aufgelöster Register-key (Quellzweig
 * mit deklarierter Erlass-Bindung). Alphabetisch sortiert → build-pfad-
 * unabhängig stabil (§2).
 *
 * Der `hint` unterliegt demselben Ausschluss wie die beiden Text-Zweige
 * (Härtung 28.7.2026): der Ausschluss mehrdeutiger Kürzel ist TOTAL, sonst
 * käme 'STG' über den Quellzweig doch noch in `normKeys` und die föderal/
 * kantonale Mehrdeutigkeit stünde wieder im Korpus (§1/§8).
 */
export function normKeysVonSnapshot(snap: EntscheidSnapshot, hint?: string | null): string[] {
  const out = new Set<string>(statutesZuNormKeys(snap.zitierteNormen ?? []));
  for (const ref of extrahiereStatutRefs(fliesstextVon(snap))) {
    const k = normKeyFuerAbk(ref.gesetz);
    if (k) out.add(k);
  }
  if (hint && !AUSGESCHLOSSENE_KEYS.has(hint)) out.add(hint);
  return [...out].sort();
}

/**
 * Re-Map-Regel für den BESTEHENDEN Korpus (`--remap`): neu berechnete Keys
 * VEREINIGT mit den Alt-Keys, die die Neuberechnung nicht reproduziert —
 * abzüglich der AUSGESCHLOSSENE_KEYS. Sortiert (§2).
 *
 * Warum bewahren statt neu setzen (Befund 28.7.2026): bis zur Adapter-Härtung
 * persistierte der BGE-Merge nur die basis-`zitierteNormen`; die statutes des
 * unterliegenden aza-Urteils flossen in die `normKeys`, wurden selbst aber nie
 * gespeichert. Solche Alt-Keys sind legitime Roh-Signale ohne Beleg IM
 * Snapshot (bge_152_I_61 trägt 'ZPO', ohne dass 'ZPO'/'CPC' in zitierteNormen
 * oder Fliesstext vorkommt) — ein Re-Map, der sie entfernt, ist stiller
 * Datenverlust (§8), keine Neuberechnung. Ausgenommen bleiben die
 * ausgeschlossenen Keys: die SOLLEN aus dem Bestand verschwinden.
 *
 * Idempotent: das Ergebnis des ersten Laufs ist Fixpunkt des zweiten, weil die
 * bewahrten Keys beim nächsten Lauf wieder als «nur alt» erkannt werden.
 * Rückgabe zusätzlich `nurAlt` — der Aufrufer weist die Zahl aus, statt die
 * Bewahrung still geschehen zu lassen (§6.7).
 *
 * `nurAlt` ist DEDUPLIZIERT und sortiert (Linse 2, 28.7.2026). Vorher wurde die
 * Alt-Liste nur gefiltert: ein Bestands-Snapshot mit doppeltem Eintrag
 * (`['ZPO','ZPO']`) meldete «2 bewahrte Keys», obwohl genau EINER bewahrt wurde
 * — `keys` entdoppelt ja über das Set. Die ausgewiesene Zahl wich damit von der
 * tatsächlichen Wirkung ab, und eine Kennzahl, die grösser ist als das, was sie
 * misst, macht einen Backfill-Lauf harmloser oder dramatischer aussehen als er
 * war (§8). Sortiert, weil die Ausgabe sonst an der Reihenfolge des Bestands
 * hinge (§2).
 */
export function remapNormKeys(alt: readonly string[], berechnet: readonly string[]): {
  keys: string[]; nurAlt: string[];
} {
  const neu = new Set(berechnet);
  const nurAlt = [...new Set(
    (alt ?? []).filter((k) => !neu.has(k) && !AUSGESCHLOSSENE_KEYS.has(k)),
  )].sort();
  return { keys: [...new Set([...neu, ...nurAlt])].sort(), nurAlt };
}

/**
 * Sperre gegen die EINWEG-RATSCHE (Linse 3, 28.7.2026).
 *
 * `remapNormKeys` allein kann nicht unterscheiden, ob ein nicht reproduzierter
 * Alt-Key ein legitimes Roh-Signal ist (nicht persistierte aza-statutes) oder
 * eine Fehlzuordnung, die ein Korrektheits-Fix soeben entlarvt hat. Bewahrt es
 * pauschal, schreibt der nächste `--remap` die korrigierten Keys wieder zurück
 * und der Fix ist am Artefakt wirkungslos — das ist kein hypothetischer Fall:
 * wäre der W2·6-NKEY-Backfill VOR dem Trunkierungs-Fix gelaufen, hätte er die
 * fünf falschen MSCHG-Keys als «alt-erhalten» konserviert.
 *
 * Die Unterscheidung ist fachlich, nicht maschinell (§1). Diese Funktion trifft
 * sie darum nicht, sie erzwingt nur, dass sie GETROFFEN wurde: bewahrt werden
 * darf, was der Aufrufer deklariert hat; alles andere kommt als Befund zurück
 * und lässt den Lauf abbrechen (fail-closed, §6.7). Rein, sortiert (§2).
 */
export function undeklarierteAltKeys(
  bewahrt: ReadonlyMap<string, readonly string[]>,
  deklariert: ReadonlyMap<string, readonly string[]>,
): string[] {
  const raus: string[] = [];
  for (const [id, keys] of bewahrt) {
    const erwartet = deklariert.get(id) ?? [];
    const fremd = [...new Set(keys.filter((k) => !erwartet.includes(k)))].sort();
    if (fremd.length) raus.push(`${id}: ${fremd.join(', ')}`);
  }
  return raus.sort();
}

/**
 * KORROBORATIONS-REGEL der ARTIKEL-Ebene (Gegenprüfung R2/B1, Entscheid
 * Orchestrator 28.7.2026 — §1 Präzision vor Abdeckung, aber NUR hier).
 *
 * ── Der Befund ───────────────────────────────────────────────────────────────
 * Die UI-Überschrift der Artikel-Ebene lautet «Bundesgerichtsentscheide zu
 * Art. X». Das ist ein Versprechen über den INHALT des Entscheids, nicht über
 * das Vorkommen einer Zeichenfolge. Die vollständige Fliesstext-Erkennung
 * (Baustein d) hält es nicht: BGE 150 IV 10 stand unter MSTG/171c, obwohl
 * «171c» im ganzen Entscheid AUSSCHLIESSLICH im Literaturnachweis vorkommt
 * («MARCEL ALEXANDER NIGGLI, Rassendiskriminierung, Ein Kommentar zu
 * Art. 261bis StGB und Art. 171c MStG, 2a ed. 2007») — das Gericht wendet
 * Art. 171c MStG nirgends an. Ein Literatur-Phantom im Artikel-Index ist keine
 * Lücke, sondern eine falsche Auskunft (§8).
 *
 * ── Die Regel (deterministisch, §2) ──────────────────────────────────────────
 * Ein (Erlass, Artikel)-Paar kommt in den Index, wenn EINE der drei Bedingungen
 * trägt:
 *   (i)  es steht in `zitierteNormen` (statutes-Pfad) — eine Dritt-Extraktion,
 *        die nur ANGEWANDTE Normen ausweist, nie den Literaturapparat;
 *   (ii) es steht in der REGESTE (amtlicher Leitsatz, alle Sprachfassungen) —
 *        dort steht per Definition die tragende Norm;
 *   (iii) sonst: mindestens ZWEI Vorkommen im übrigen Fliesstext. Ein
 *        Literaturnachweis nennt den Artikel im Buchtitel EINMAL; eine
 *        angewandte Norm wird aufgeworfen, subsumiert und im Ergebnis erneut
 *        genannt.
 *
 * ── Zwei bewusste Abweichungen vom Wortlaut des Auftrags, beide gemessen ─────
 * (A) GEZÄHLT WIRD DER ARTIKEL-SCHLÜSSEL, NICHT DIE NORMALFORM. Die Normalform
 *     trennt nach Absatz (ART.6.ABS.1.EMRK ≠ ART.6.ABS.3.EMRK). Ein Entscheid,
 *     der «Art. 6 Abs. 1 EMRK» und «Art. 6 Abs. 3 lit. d EMRK» je einmal
 *     erörtert, hat sich zweimal mit Art. 6 EMRK befasst — die Zähleinheit muss
 *     die Einheit des Index sein, sonst misst die Regel etwas anderes als sie
 *     entscheidet. Gemessen am Korpus: Normalform-Zählung verwürfe zusätzlich
 *     2'383 (Snapshot, Artikel)-Paare, darunter EMRK/6 aus BGE 149 I 343 — einen
 *     der drei in der Gegenprüfung als ECHT bestätigten Fälle.
 * (B) VOLLTEXT UND BGE-AUSZUG WERDEN NICHT ADDIERT, SONDERN MAXIMIERT. Bei 1'248
 *     der 5'093 Snapshots trägt `abschnitte` das vollständige Urteil UND
 *     `auszugAbschnitte` den amtlichen Sammlungs-Auszug — zwei Darstellungen
 *     DESSELBEN Textes. Eine Addition verdoppelt jede Nennung und macht die
 *     Schwelle wirkungslos: genau das Literatur-Phantom MSTG/171c steht in
 *     beiden Fassungen je einmal und käme summiert auf 2 (nachgestellt). Der
 *     Auszug ist kein zweiter Beleg, sondern derselbe — darum das Maximum.
 *
 * ── Reichweite: NUR die Artikel-Ebene ────────────────────────────────────────
 * `normKeysVonSnapshot` (ERLASS-Ebene) bleibt UNVERÄNDERT. Die beiden Ebenen
 * haben verschiedene Semantik, und das ist Absicht, nicht Nachlässigkeit:
 *   • Erlass-Ebene = «dieser Entscheid NENNT den Erlass» — bewusst vollständig
 *     und beiläufig (Dekret David 27.7.2026, Modul-Kopf oben); das BGG steht in
 *     rund 85 % der Snapshots, ohne dass es um das BGG ginge. Sie speist
 *     Verzahnung und Abdeckungs-Messung, wo Vollständigkeit der Zweck ist.
 *   • Artikel-Ebene = «dieser Entscheid SAGT etwas zu Art. X» — sie speist eine
 *     kuratierte Leitfall-Liste mit einer inhaltlichen Überschrift.
 * Eine Nennung, die die Artikel-Schwelle nicht nimmt, verschwindet deshalb nicht
 * aus dem Korpus; sie bleibt auf der Erlass-Ebene sichtbar. Wer beide Ebenen
 * gleichschaltete, müsste eine der beiden Aussagen aufgeben (§1).
 *
 * ── WAS DIE REGEL KOSTET, GEMESSEN UND UNGEGLÄTTET (§8) ──────────────────────
 * Wirkung am committeten Korpus (5'093 Snapshots, 28.7.2026):
 *   (Snapshot, Artikel)-Paare  65'003 → 24'589  (−40'414, −62 %)
 *   Artikel-Buckets (distinct)  5'436 →  4'103  (−1'333)
 * Verteilung der Verwerfung nach Erlass: BGG 37.7 % · StPO 18.5 % · StGB 6.3 % ·
 * ZPO 5.9 % · ATSG 5.4 % · BV 4.5 % — also überwiegend die prozessualen
 * Standard-Zitate, die der Modul-Kopf als «beiläufig» beschreibt. Median 7
 * verworfene Paare je Snapshot, p90 14, max 56.
 *
 * ZWEI STICHPROBEN, klassifiziert am Text — und sie sagen NICHT dasselbe:
 *  • Die 10 ALPHABETISCH ERSTEN verworfenen Paare: 9 Katalog (Eintretens-,
 *    Kognitions-, Kosten- und Rechtsmittelbelehrungs-Formeln), 1 Literatur
 *    (BGE 146 III 106, ZGB/517 — genannt nur in «KÜNZLE, Berner Kommentar, 2011,
 *    N. 508/509 zu Art. 517-518 ZGB»), 0 echt angewendet. Diese Stichprobe stützt
 *    die Regel — sie stammt aber aus nur ZWEI Entscheiden und trifft deren
 *    Eintretens-Erwägung; sie ist ein Klumpen, kein Querschnitt.
 *  • Die 10 GLEICHVERTEILT gezogenen (jedes n/10-te Paar der sortierten Liste):
 *    5 Katalog, 5 ECHT ANGEWENDET — darunter ATSG/17 («sind die in Art. 17 ATSG
 *    verankerten revisionsrechtlichen Grundsätze sinngemäss anwendbar»),
 *    OR/30 (Subsumtion der Furchterregung), ZPO/138 (Zustellfiktion, tragend für
 *    die Fristberechnung), EMRK/6 (Grundlage des Replikrechts, BGE 148 III 161).
 *
 * DARAUS FOLGT EHRLICH: die Schwelle trifft die Literatur-Phantome, aber sie
 * trifft sie nicht ALLEIN. Auf dem verworfenen Teil liegt im Querschnitt eine
 * Fehlerrate in der Grössenordnung von 50 % — eine einmal, aber tragend
 * erörterte Norm ist von einer einmal beiläufig genannten durch blosses ZÄHLEN
 * nicht unterscheidbar. Belegt an einem der drei Fälle, die die Gegenprüfung
 * ausdrücklich als «echt» bestätigt hatte: EMRK/6 in BGE 149 I 343 (das Gericht
 * verneint dort die Anwendbarkeit von Art. 6 Ziff. 1 EMRK auf Steuerverfahren
 * und weist die darauf gestützten Rügen ab — eine Sachaussage) steht genau
 * EINMAL im Text und fällt darum durch. Das ist kein Umsetzungsfehler, sondern
 * die Grenze jeder Häufigkeits-Regel; es steht hier, damit die nächste Runde
 * über die richtige Frage entscheidet — nicht über die Schwelle, sondern über
 * ein Kontext-Signal (Literatur-Klammer statt Erwägungstext). Dieser Ausbau ist
 * bewusst NICHT Teil dieses Schritts.
 */
export function artikelSchluesselMitBefund(snap: EntscheidSnapshot): {
  schluessel: Set<string>; verworfen: string[];
} {
  const schluessel = new Set<string>();
  const schl = (gesetz: string, artikel: string): string | null => {
    const rk = normKeyFuerAbk(gesetz);
    return rk ? `${rk}/${artikel}` : null;
  };

  // (i) + (ii): unbedingt zählende Zweige.
  for (const t of [(snap.zitierteNormen ?? []).join('\n'), regesteTextVon(snap)]) {
    for (const ref of extrahiereStatutRefs(t)) {
      const k = schl(ref.gesetz, ref.artikel);
      if (k) schluessel.add(k);
    }
  }

  // (iii): übriger Fliesstext — Vorkommen je Artikel-Schlüssel, Volltext und
  // BGE-Auszug getrennt gezählt und MAXIMIERT (siehe Abweichung (B)).
  const zaehlung = new Map<string, number>();
  for (const teil of [blockTeile(snap.abschnitte), blockTeile(snap.auszugAbschnitte)]) {
    const proTeil = new Map<string, number>();
    for (const ref of extrahiereStatutRefsMitAnzahl(zusammen(teil))) {
      const k = schl(ref.gesetz, ref.artikel);
      if (k) proTeil.set(k, (proTeil.get(k) ?? 0) + ref.anzahl);
    }
    for (const [k, n] of proTeil) zaehlung.set(k, Math.max(zaehlung.get(k) ?? 0, n));
  }

  const verworfen: string[] = [];
  for (const [k, n] of zaehlung) {
    if (schluessel.has(k)) continue;
    if (n >= KORROBORATIONS_SCHWELLE) schluessel.add(k);
    else verworfen.push(k);
  }
  return { schluessel, verworfen: verworfen.sort() };
}

/**
 * Wie oft ein Artikel im übrigen Fliesstext genannt sein muss, wenn ihn weder
 * `zitierteNormen` noch die Regeste tragen. 2 = «einmal ist ein Literaturzitat,
 * zweimal ist eine Erörterung». Als Konstante, damit die Schwelle EINE Stelle
 * hat und im Test benannt werden kann (§5).
 */
export const KORROBORATIONS_SCHWELLE = 2;

/**
 * (Register-key, Artikel-Token)-Paare, die ein Snapshot zitiert — 'OR/41'-Form,
 * deduppt, nach der Korroborations-Regel (siehe `artikelSchluesselMitBefund`).
 * EINE Stelle (§5): Live-Index (baueArtikelIndex) und Oracle-Tor
 * (check-rangliste-oracle) rechnen mit derselben Funktion, sonst driftet das
 * Tor von dem weg, was es prüfen soll.
 */
export function artikelSchluesselVonSnapshot(snap: EntscheidSnapshot): Set<string> {
  return artikelSchluesselMitBefund(snap).schluessel;
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
// DEKLARIERTE Priorität: die Reihenfolge dieser Liste entscheidet, welches
// Signal gewinnt, wenn ein Entscheid mehrere trägt — Migrationsrecht (AIG,
// AsylG, BewG) vor Steuerrecht (DBG, StHG, MWSTG, StG, VStG).
//
// Früher wurde über die ÜBERGEBENEN Keys iteriert; das Ergebnis hing damit an
// der Reihenfolge der statutes[] und kippte je Entscheid: ['Art. 5 AsylG',
// 'Art. 12 DBG'] auf einem 2C-Fall lieferte 'oeffentlich', die umgekehrte
// Nennung derselben zwei Normen 'sozial-abgaben' (empirisch nachgestellt
// 28.7.2026). Gleiche Eingabemenge → gleiches Sachgebiet ist §2; die Priorität
// gehört in die Tabelle, nicht in die Laune der Drittextraktion.
const NORM_SIGNAL: ReadonlyArray<readonly [string, Rechtsgebiet]> = [
  ['AIG', 'oeffentlich'], ['ASYLG', 'oeffentlich'], ['BEWG', 'oeffentlich'],
  ['DBG', 'sozial-abgaben'], ['STHG', 'sozial-abgaben'], ['MWSTG', 'sozial-abgaben'],
  ['STG', 'sozial-abgaben'], ['VSTG', 'sozial-abgaben'],
];
export function normSignalSachgebiet(normKeys: Iterable<string>): Rechtsgebiet | null {
  const vorhanden = new Set<string>();
  for (const k of normKeys) vorhanden.add(String(k).toUpperCase());
  for (const [key, geb] of NORM_SIGNAL) if (vorhanden.has(key)) return geb;
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
