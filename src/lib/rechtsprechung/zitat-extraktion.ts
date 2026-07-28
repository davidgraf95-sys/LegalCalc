// ─── Zitat-Extraktion aus Urteils-Fliesstext (rein, deterministisch, §2) ─────
//
// Portierung der OpenCaseLaw-Referenz-Extraktion (`reference_extraction.py`) nach
// TypeScript. Erkennt in Schweizer Entscheidtext:
//   • Gesetzes-Zitate  — «Art. 34 Abs. 2 BV», «art. 8 al. 2 CEDH», «Art. 52bis OR»
//   • Entscheid-Zitate — BGE («BGE 147 I 268») und Aktenzeichen («4A_123/2020»)
//
// Anders als die bisherige `statutesZuNormKeys`-Logik (die nur die Gesetzes-
// Abkürzung behält) bewahrt diese Portierung das VOLLE Artikel-/Absatz-Token
// (`34`, `8a`, `52bis`) treu — die getestete Grundlage für die per-Artikel-
// Leitentscheide (W3). Reine Funktionen: kein I/O, kein `Date.now()`.
//
// Die Regex-Bausteine spiegeln das Python-Original 1:1 (dort `re.VERBOSE`, hier
// ohne Verbose zusammengesetzt). Python-`re.IGNORECASE` → JS-Flag `i`; benannte
// Gruppen `(?P<name>…)` → `(?<name>…)`; der Lookahead `(?![a-z])` funktioniert in
// modernem V8. Der Filter (`INVALID_LAW_CODES` + Gross-/Länge-Regeln) verkörpert
// jahrelang getunte Falsch-Positiv-Vermeidung und wird VERBATIM übernommen.
//
// ── Muster-Ausbau F2 (Roadmap W2·7-VZUI, 16.7.2026) ──────────────────────────
// Die Erwägungs-/Bereichs-/Ketten-/Umlaut-Muster sind angelehnt an den Zitat-
// Normalizer des Omnilex-AI-Starter-Repos (`src/omnilex/citations/normalizer.py`,
// Lizenz **Apache-2.0**) — übernommen wurden NUR die Regex-Formen (BGE-Pinpoint
// `E.`/`Erw.`/`consid.` dezimal/slash/range, Absatz-Marker DE/FR/IT), NICHT das
// dort naive `if abbrev in raw`-Substring-Matching (Fehlmatch-anfällig). Recherche
// + Lizenz-/FP-Analyse: `bibliothek/werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md`.
// Jede F2-Ergänzung ist adversarial FP-geprüft und mit dem in dieser Datei
// verankerten Filter (`INVALID_LAW_CODES`, Gross-/Umlaut-/Bereichs-Monotonie-Regeln)
// gegen konstruierte Fehltreffer abgesichert (Tests: `src/tests/zitat-extraktion.test.ts`).
//
// ── F2-Nachtrag (nachgeholte Doppel-Prüfung, 16.7.2026) ──────────────────────
// Vier durch Netz-Abbruch in der Refute-Phase stumm verworfene Kandidaten
// nachgeholt: (1) «ATF …» frz. + (2) «DTF …» ital. BGE-Sigel → beide auf den
// «BGE …»-Kanon normalisiert (Verzahnungs-Dedup der Sprach-Zwillinge, sonst
// stiller Verlust im FR/IT-Korpus; Miner-These 2 empirisch bestätigt) inkl. des
// vorher verlorenen «consid.»-Pinpoints; (4) «lett.» ital. lettera als Sub-Marker
// (vorher [] — «let» frass 3 von 4 Zeichen). (3) «ch.» frz. chiffre war bereits
// über SUB_MARKER erfasst → als geprüft-verworfen dokumentiert.
//
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ BEKANNTE EXTRAKTIONS-LÜCKEN — gesammelt (Gegenprüfung R3, 28.7.2026)      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
//
// WARUM SIE HIER STEHEN. Sie standen vorher verstreut an den Konstanten, die sie
// betreffen — jede für sich richtig verortet, zusammen aber unsichtbar: niemand
// konnte sagen, WIE VIEL dieser Extraktor nicht sieht. Eine Lücke, die man nur
// findet, wenn man ohnehin schon an der richtigen Zeile steht, ist keine
// ausgewiesene Lücke (§8). Alle Zahlen sind am committeten Entscheid-Korpus
// gemessen (5'093 Snapshots, 28.7.2026), nicht geschätzt (§7).
//
// GEMEINSAMER NENNER ALLER ACHT: sie kosten AUSSCHLIESSLICH Treffer, keiner von
// ihnen erzeugt einen falschen. Das ist die bewusste Richtung (§1) — eine Lücke
// weist ein Tor aus, eine Fehlzuordnung niemand.
//
// L1 · VERBUND-FORM «Buchstabe + Ordinal» («Art. 66abis StGB») → GAR KEIN Treffer.
//      GTR Rz. 309 kennt sie amtlich («der bestehende Artikel 65a wird zum
//      Artikel 65abis»). Sie passt in keinen Zweig von ARTIKEL_TOKEN: «66a»
//      scheitert am Lookahead `(?![a-z])`, «66bis» am führenden «a».
//      KORPUS: 517 Nennungen (art. 66abis, 34abis, 41cbis, 314abis, 16cbis,
//      712ibis, 80dbis …). TEST-PIN: «Art. 66abis StGB» → [].
//      EIGENER SCHRITT, weil die belegte Schreibung mit Leerzeichen («art. 34a
//      bis») eine eigene adversariale FP-Analyse gegen das Bereichswort «bis»
//      braucht und die Verbund-Form die Sortier-/Anzeige-Ordnung des
//      Artikel-Index ändert.
//
// L2 · PARAGRAPHENZEICHEN «§» ist in `extrahiereStatutRefs` kein Artikel-Marker
//      und bleibt es. ARTIKEL_MARKER kennt nur «Art.»/«Artikel»; «§ 12 Abs. 2
//      EG ZGB» ergibt dort weiterhin [].
//      KORPUS: 26'311 «§»-Zeichen in 4'141 Snapshots; als Zitat-Form
//      («§ N [Abs./lit. …] <CODE>») 19'320 Vorkommen in 3'869 Snapshots.
//      EINORDNUNG, damit die Zahl nicht grösser wirkt als die Wirkung: «§» ist
//      die KANTONALE Zählweise (BS, ZH, AG, SO …), und das ERLASS_REGISTER führt
//      Bundesrecht. Der weit überwiegende Teil dieser Nennungen fände auch bei
//      erkanntem Marker keinen BUNDES-Register-key.
//      TEILWEISE GESCHLOSSEN (W2·7-BEZUG/B2, 28.7.2026) — auf einem EIGENEN Pfad:
//      `extrahiereParagraphGruppen` (unten) liest die Artikel-Seite von
//      «§»-Zitaten, die Erlass-Seite löst der kantonale Resolver über die
//      amtliche Systematik-Nummer auf. Dass `extrahiereStatutRefs` unverändert
//      bleibt, ist die eigentliche Sicherung: es gibt keinen Weg von einem
//      «§»-Zitat zu einem Bundes-Register-key (Begründung bei PARAGRAPH_PATTERN).
//
// L3 · EINBUCHSTABIGER FOLGE-MARKER ZUSAMMENGESCHRIEBEN («Art. 205f. LIFD») →
//      bewusst KEIN Treffer. FOLGE_MARKER_EIN verlangt Punkt UND Leerzeichen,
//      weil sonst «art. 205f LIFD» (echter Buchstaben-Artikel 205f) als
//      «Art. 205 f.» gelesen würde — ein ANDERER Artikel. Eine falsche
//      Artikel-Zuordnung ist schlimmer als eine Lücke (§1). TEST-PIN vorhanden:
//      «Art. 205f. LIFD» → [], «art. 205f LIFD» → ART.205f.LIFD.
//
// L4 · KETTE MIT CODE-WECHSEL — Nicht-End-Glieder gehen verloren.
//      «les art. 30 Cst. et 6 CEDH» → NUR ART.30.CST; «6 CEDH» fällt weg, weil
//      STATUTE_QUELLE genau EINEN Code am Ende der Liste kennt und der erste
//      Match bei «Cst.» endet. AMTLICH BELEGT: BGE 149 I 343.
//      KORPUS (Proxy-Muster «art. N <CODE> et M …»): 226 Vorkommen in 91
//      Snapshots. TEST-PIN unten.
//
// L5 · WIEDERHOLTES «Art.» MIT EINEM SCHLUSS-CODE — nur das letzte Glied zählt.
//      «art. 8 par. 1, art. 11 et art. 20 par. 3 CEDH» → NUR ART.20.ABS.3.CEDH.
//      Grund: KETTEN_GLIED setzt hinter dem Konnektor ein ARTIKEL_GLIED voraus,
//      das mit einer ZIFFER beginnt — ein wiederholtes «art.» bricht die Kette,
//      und der /g-Scan startet neu erst beim letzten Glied.
//      KORPUS (Proxy-Muster «art. N …, art. M …»): 4'397 Vorkommen in 1'242
//      Snapshots — die grösste der acht Lücken. TEST-PIN unten.
//
// L6 · BEREICHS-ENDPUNKTE WERDEN NICHT INDEXIERT — DEKLARIERTE START-ARTIKEL-
//      REGEL, keine Panne: «Art. 75 bis 77 AIG» erzeugt AIG/75, und `artikelBis`
//      ('77') dient allein der treuen ANZEIGE. Art. 76 bekommt keinen Eintrag.
//      Das ist so gewollt: die Zwischenglieder eines Bereichs sind nicht
//      einzeln zitiert, und sie zu materialisieren hiesse, dem Gericht Aussagen
//      über Artikel zuzuschreiben, die es nicht genannt hat (§8).
//      KORPUS: 689 Bereichs-Zitate mit erkanntem Endpunkt (1'439 Roh-Nennungen)
//      in 543 Snapshots; allein «Art. 7x bis NN AIG» 179 Vorkommen.
//      TEST-PIN unten.
//
// L7 · QUELL-KAPPUNG `zitierteNormen` (OCL statutes[]) — betrifft nicht diesen
//      Extraktor, sondern den zweiten Zweig der Norm-Zuordnung: die Roh-Liste
//      ist bei 8 Einträgen hart gekappt und alphabetisch sortiert.
//      KORPUS: 1'085 Snapshots mit exakt 8 Einträgen (alle 1'085 sortiert),
//      3'766 ohne jeden Eintrag. Volle Fassung samt Folgerung: Kommentar an
//      `statutesZuNormKeys` in scripts/normtext/entscheide-mapping.ts.
//
// L8 · «lit. a.» MIT SATZPUNKT bricht den Match. «Art. 138 Abs. 3 lit. a. ZPO»
//      → [] (ohne den Punkt hinter dem Sub-Token: ART.138.ABS.3.ZPO). Ursache
//      ist der Token-Abschluss `(?![A-Za-z0-9])` hinter SUB_TOKEN — er lässt den
//      Punkt zu, aber der danach folgende Code steht dann hinter einem Trenner,
//      den ARTIKEL_GLIED nicht mehr überbrückt.
//      KORPUS: 49 Vorkommen in 33 Snapshots (Fund an SB.2024.90). TEST-PIN unten.
//      Der Fix wäre klein, ist aber eine Grammatik-Änderung und gehört darum in
//      denselben eigenen Schritt wie L1/L2/L4/L5 — Risikoklassen-Trennung.

/** Gesetzes-Zitat mit bewahrtem Artikel-/Absatz-Token. */
export interface StatutRef {
  /** Roh-Treffer (getrimmt), z.B. 'Art. 34 Abs. 2 BV'. */
  raw: string;
  /** Gesetzes-Abkürzung (grossgeschrieben), z.B. 'BV'. */
  gesetz: string;
  /** Artikel-Token, whitespace-frei und klein — BEWAHRT: '34', '8a', '52bis'. */
  artikel: string;
  /**
   * Bereichs-Endpunkt (F2-V10, «Art. 641-654a ZGB» → '654a'); sonst null. Fliesst
   * NICHT in `normalisiert`/den Norm-Key ein (der bleibt der Start-Artikel) —
   * nur zur treuen Anzeige des Bereichs (Monotonie-gesichert: `bis` ≥ `artikel`).
   */
  artikelBis: string | null;
  /** Absatz-Token (falls genannt), z.B. '2'; sonst null. */
  absatz: string | null;
  /** Normalform, z.B. 'ART.34.ABS.2.BV' bzw. 'ART.8.EMRK'. */
  normalisiert: string;
}

// ── Regex-Bausteine (Python-Marker-Konstanten) ──────────────────────────────
const ARTIKEL_MARKER = '(?:Art\\.?|Artikel)';
// Absatz-Marker DE/FR/IT. Reihenfolge-kritisch am Ende: «para» MUSS vor «par»
// stehen (Gegenprüfung R1/B2, 28.7.2026) — sonst greift bei «para 3» zuerst das
// kürzere «par», der Rest-Buchstabe «a» steht dem Absatz-Token im Weg und der
// Absatz fällt weg. Dieselbe Fehlerklasse wie «lett»/«let» bei SUB_MARKER (Z. 72–76).
//
// «par.» (frz. «paragraphe») war bis dahin nicht erfasst — der STANDARD-Marker in
// Staatsvertrags-Zitaten. Ohne ihn fiel nicht bloss der Absatz weg, sondern das
// GANZE Zitat: «art. 6 par. 1 CEDH» → law-Kandidat «par» → nGross 0 → verworfen.
// Amtlich belegt: BGE 149 I 343, 149 II 74, 148 V 225 («art. 6 par. 1 CEDH»).
// FP-Analyse am committeten Korpus: «par» ist auch frz. Präposition, greift hier
// aber nur ZWISCHEN Artikel- und Absatz-Token, d.h. es braucht ein folgendes
// ZIFFERN-Token UND danach einen Gesetzes-Code. Gemessen über alle Snapshots
// («art. N par. N X»): der Schwanz X ist entweder ein echtes Staatsvertrags-
// Kürzel (CEDH 339×, CL/CLug, CDI, CV, TCE, ALCP, CBE, MAC, PAII) oder ein
// Kleinwort (de, du, et, sous, point, annexe, let, convention) — Kleinwörter
// haben nGross 0 und werden vom bestehenden Filter verworfen. Kein neuer FP.
// «PAR» steht bereits in INVALID_LAW_CODES (frz. Präposition) → als law-Kandidat
// weiterhin blockiert; die Symmetrie ist damit schon hergestellt.
const ABSATZ_MARKER =
  '(?:Abs\\.?|Absatz|al\\.?|alin(?:ea)?\\.?|cpv\\.?|co\\.?|para\\.?|par\\.?)';
// Lateinische Ordnungszahl-Zusätze eingeschobener Artikel (GTR Rz. 309:
// «Art. 262bis», «Art. 262ter», «Art. 262quater» usw. — Gesetzestechnische
// Richtlinien des Bundes, Stand 16.5.2019, hrsg. Schweizerische Bundeskanzlei).
//
// SERIEN-UMFANG (Gegenprüfung R1/B1, 28.7.2026). Die Reihe endete vorher bei
// «sexies» und riss damit echte Leitnormen aus dem Artikel-Index — und zwar nicht
// nur den Ordinal-Artikel selbst, sondern das ganze Zitat, weil das unverstandene
// Ordinalwort als law-Kandidat gelesen wird (nGross 0 → Treffer verworfen).
// Amtlich belegt: BGE 150 IV 273 («Art. 49, 179 septies und 180 StGB» → auch 49
// und 180 gingen verloren) und BGE 150 IV 86 («Art. 25 und 322 septies Abs. 2
// StGB»); Art. 179septies und Art. 322septies StGB sind geltendes Recht.
//
// Aufgenommen ist GENAU die am committeten Korpus (Normtext + Rechtsprechung,
// 28.7.2026) BELEGTE Reihe — Belegzahlen als Vorkommen des Wortes:
//   bis 22'674 · ter 3'367 · quater 737 · sexies 575 · quinquies 510 ·
//   septies 467 · octies 141 · novies 47 · decies 24 · undecies 4 · duodecies 1
// dazu «nonies» als belegte Variantenschreibung zu «novies» (nur kantonal, SO
// 614.11 §115nonies ff.; der Bund schreibt «novies», so STGB/IVV).
//
// NICHT aufgenommen: terdecies, quaterdecies, quindecies, sexdecies, vicies u.ä.
// Die GTR schliesst die Reihe mit «usw.» und nennt KEIN Endglied; am Korpus haben
// diese Formen null Belege. Sie hier zu führen wäre eine Behauptung ohne Quelle
// (§7). Die Erweiterung ist ein Einzeiler an dieser Stelle, sobald ein Beleg da ist.
//
// ZWEI SICHERUNGEN für genau diese künftige Erweiterung:
//  (a) Absteigend nach Länge sortiert. Wo ein Glied Präfix eines anderen ist
//      (ter ⊂ terdecies, quater ⊂ quaterdecies), müsste sonst das kürzere zuerst
//      greifen und den Rest («decies») als law-Kandidat zurücklassen — der
//      bekannte lett/let-Mechanismus. Im aktuellen Satz gibt es keine solche
//      Präfix-Paarung; die Ordnung ist Vorsorge, keine Notwendigkeit.
//  (b) Abschluss-Lookahead `(?![a-z])` hinter dem Suffix. Er macht (a) überhaupt
//      erst unschädlich-redundant: ein Teiltreffer («ter» in «terdecies») wird
//      dadurch verworfen statt halb konsumiert. Kosten am Korpus GEMESSEN: die
//      Form «<Ordinal><Code>» ohne Trenner («179septiesCP») kommt in 5'093
//      Snapshots 0-mal vor — der Lookahead verwirft also keinen echten Treffer.
//      (Unter dem `i`-Flag deckt `[a-z]` auch Grossbuchstaben ab; das ist hier
//      gewollt und dank der 0-Messung folgenlos.)
const ORDINAL_SUFFIX =
  '(?:quinquies|duodecies|undecies|septies|quater|decies|nonies|novies|octies|sexies|bis|ter)';
// Artikel-/Absatz-Token: Zahl + optional (Ordinal-Suffix ODER einzelner
// Buchstabe, der nicht von einem weiteren Buchstaben gefolgt ist).
//
// BEKANNTE LÜCKE L1 — die amtliche Verbund-Form «Buchstabe + Numerale»
// («Art. 66abis StGB», GTR Rz. 309) passt in keinen der beiden Zweige und ergibt
// GAR keinen Treffer. Umfang, Beleg und der Grund, warum sie einen eigenen
// Schritt braucht: Lücken-Block im Modul-Kopf, L1.
//
// ── ORDINAL «bis» ⊥ BEREICHSWORT «bis» (Gegenprüfung R2/B2, 28.7.2026) ────────
// Beide Bedeutungen stehen im selben Textfenster hinter derselben Artikelnummer:
//   «Art. 179 bis StGB»          → ORDINAL (Art. 179bis StGB, geltendes Recht;
//                                  die getrennte Schreibung ist amtlich belegt)
//   «Art. 179 bis 179novies StGB» → BEREICH (Art. 179–179novies)
// DETERMINISTISCHE ENTSCHEIDUNGSREGEL (§2), hier und in ARTIKEL_BEREICH identisch
// verankert: **«bis» ist Bereichswort genau dann, wenn ihm eine ZIFFER folgt;
// sonst Ordinal.** Umgesetzt als negativer Lookahead `(?!\s*\d)` — und zwar NUR
// am GETRENNT geschriebenen Ordinal-Zweig. Der angehängte Zweig («179bis») ist
// nie mehrdeutig und behält darum keinen Lookahead: sonst kippte «Art. 12bis 3 CP»
// vom Treffer in den Totalverlust (Rest-Token «bis» wird law-Kandidat, nGross 0).
// Die Regel ist bewusst syntaktisch, nicht semantisch: kein Nachschlagen, ob der
// Zielartikel existiert (das wäre eine zweite Wahrheit neben dem Register, §5).
const ARTIKEL_TOKEN =
  `\\d+(?:${ORDINAL_SUFFIX}(?![a-z])` +
  `|\\s+${ORDINAL_SUFFIX}(?![a-z])(?!\\s*\\d)` +
  `|[a-z](?![a-z]))?`;
const ABSATZ_TOKEN = ARTIKEL_TOKEN;
// Qualifikatoren zwischen Absatz und Gesetzes-Code: «und folgende».
//
// ZWEI KLASSEN (Gegenprüfung R2/B2, 28.7.2026), weil sie verschiedene Risiken
// tragen. Vorher kannte die Liste nur `ff|ss|segg` — die dt. Einzahl «f.», die
// frz. «s.» und die ital. «seg.» fehlten. Das kostete nicht bloss den Zusatz,
// sondern das GANZE Zitat: das unverstandene Rest-Token wird law-Kandidat,
// nGross 0 → Treffer verworfen. Reproduziert: 'Art. 133 f. StGB' → [],
// 'art. 34 s. CL' → []. Amtlich belegt: BGE 146 II 111 zitiert «Art. 50 f. DBG»
// (Direkte Bundessteuer) — DBG/50 fehlte im Artikel-Index vollständig.
//
//  (a) MEHRBUCHSTABIG (ff/segg/seg/ss) — wie bisher mit optionalem Punkt und
//      optionalem Leerzeichen davor («Art. 133ff. StGB» bleibt gültig). «segg»
//      steht VOR «seg», sonst bliebe bei «segg.» ein «g» stehen (lett/let-Klasse).
//  (b) EINBUCHSTABIG (f/s) — nur mit PFLICHT-PUNKT **und** PFLICHT-LEERZEICHEN.
//      Der Punkt hält «s» vom Satz-Marker-Terrain fern (SUB_MARKER kennt «S» für
//      «Satz»); das Leerzeichen hält «f» von den echten Buchstaben-Artikeln fern:
//      «art. 205f LIFD» MUSS weiterhin LIFD/205f ergeben. Die daraus folgende
//      bewusste Lücke bei «Art. 205f. LIFD» steht als L3 im Lücken-Block oben.
const FOLGE_MARKER = '(?:ff|segg|seg|ss)\\.?';
const FOLGE_MARKER_EIN = '[fs]\\.';
// Untergliederungs-Marker. F2-V3: «Nr» (Staatsvertrags-Standard «Art. 34 Nr. 3
// LugÜ») VOR «n» in der Alternation, damit «Nr» ganz konsumiert wird statt «n»+«r»
// — sonst greift «Nr» als law-Kandidat und der Erlass fällt weg (belegt 150_III_423).
// F2-Nachtrag (lett): «lett» (it «lettera») und «litt» (fr «littera») MÜSSEN VOR den
// kürzeren «let»/«lit» stehen — sonst frisst «let» nur 3 der 4 Zeichen von «lett»,
// der Rest-Buchstabe «t» wird als SUB_TOKEN gelesen und das Glied kippt (der law
// wird «lett», nGross 0 → verworfen). Empirisch: extrahiereStatutRefs(
// 'art. 89 cpv. 1 lett. b LTF') = [] vor, = 1 Treffer (LTF) nach dem Fix.
const SUB_MARKER = '(?:Ziff(?:er)?|Nr|litt|lit|Bst|Buchst|S|Satz|ch|lett|let|n)';
const SUB_TOKEN = '(?:\\d+|[a-z])';
// Gesetzes-Code: Grossbuchstaben-Kürzel. F2-V5: Umlaut NUR als optionaler END-
// Buchstabe (Konvention «LugÜ»/«EPÜ»/«SDÜ»/«VeÜ»/«NYÜ»), NIE in der Innenklasse —
// sonst gingen gross geschriebene Umlaut-Wörter (ÖFFENTLICH/KÜNDIGUNG/VERGÜTUNG)
// als Code durch (Umlaut initial/medial). ASCII-`\b` würde ohne u-Flag mitten im
// Kürzel («Lug|Ü») eine Grenze ziehen → Endanker `CODE_ENDE` statt `\b`.
const GESETZ_CODE = '[A-Z][A-Z0-9]{1,11}[ÄÖÜ]?(?:/[A-Z0-9]{2,6})?';
// Wortgrenze hinter dem Code — wie `\b`, aber diakritika-bewusst.
//
// TRUNKIERUNGS-FIX (Linse 2, 28.7.2026 — §1-Fehlzuordnung, nicht bloss ein
// verlorener Treffer): Die frühere Klasse `[A-Za-z0-9ÄÖÜ_]` kannte nur die drei
// deutschen Umlaute. Jeder AKZENTUIERTE Kleinbuchstabe galt damit als
// Wortgrenze — der Code-Teil vor dem Akzent wurde abgeschnitten und als
// vollständiges Kürzel gelesen. Das ist gefährlicher als ein Nicht-Treffer,
// weil das Fragment ein ANDERES, echtes Kürzel sein kann:
//   «art. 40 let. c LPMéd» (Medizinalberufegesetz, SR 811.11) → Token 'LPM'
//   — und 'LPM' ist das amtliche fr/it-Kürzel des MARKENSCHUTZGESETZES
//   (SR 232.11) → Norm-Key MSCHG/40. Empirisch am committeten Korpus:
//   16 Nennungen in 5 BGE (151_I_19, 150_IV_255, 149_II_109, 148_II_465,
//   148_I_1) plus «OMéd» → 'OM' → VAM in 151_II_323; ohne Fehlzuordnung, aber
//   gleicher Mechanismus: LFORêts, RFORêts, CPCRév, ARRêté, LDét, ARéf, DURée.
// Der Lookahead deckt darum den Latin-1-Supplement- und Latin-Extended-A/B-
// Bereich `À-ɏ` ab (die Umlaute ÄÖÜ liegen darin und sind damit
// weiterhin erfasst). Folge: «LPMéd» erzeugt GAR KEIN Token statt eines
// falschen — statt einer stillen Falschzuordnung steht dort jetzt eine Lücke
// (§1/§8).
//
// WAS DIESE LÜCKE IST — und was sie NICHT ist (Linse 3, 28.7.2026). Hier stand
// vorher, das Sichtbarkeits-Tor check:normkeys «weise sie aus». Das war zu
// grosszügig: die Rot-Liste des Tors zählt TOKEN, die der Extraktor gebildet
// hat. Was er gar nicht erst tokenisiert, taucht dort weder als ungemappt noch
// im Nenner der Abdeckungs-Quote auf — die Nennung fällt aus der MESSUNG, sie
// fällt nicht in die Rot-Liste. Die Quote wird von dieser Lücke also nicht
// schlechter, sondern blind. Ausgewiesen wird sie darum an der einzigen Stelle,
// die sie sehen kann: der informativen Unerreichbar-Ausgabe von
// check-normkeys-abdeckung.ts, die je unerreichbarer Alias-Form die
// Korpus-Häufigkeit mitzählt (Stand 28.7.2026: 34 Formen, 265 Artikel-Zitate in
// 207 Snapshots, die dem Nenner fehlen).
//
// Die Änderung ist bewusst einseitig: die Wortgrenze wird nur STRENGER, kein
// Muster wird durchlässiger. Dass daraus kein neuer Falsch-Positiver folgt, ist
// allerdings nicht allein aus der Strenge zu schliessen — ein Treffer, der
// wegfällt, gibt seinen Textbereich für den /g-Scan wieder frei, und ein dort
// verdeckter Folgetreffer könnte theoretisch neu erscheinen. GEMESSEN am
// committeten Korpus (5'093 Snapshots, 28.7.2026, alte gegen neue Wortgrenze):
// 0 gewonnene Refs, 0 gewonnene normKeys, 0 gewonnene Artikel-Schlüssel — 35
// Refs fielen weg, darunter die 5 MSCHG-Fehlzuordnungen (13 Artikel-Schlüssel).
// Die Aussage ist damit empirisch belegt, nicht bloss plausibel.
// (Die Range enthält nebenbei × und ÷; beide folgen nie auf ein Erlass-Kürzel,
// und auch dort wäre die Wirkung nur «verwirft mehr».)
const CODE_ENDE = '(?![A-Za-z0-9_\\u00C0-\\u024F])';

// Ein einzelnes Artikel-Glied: Zahl/Bereich (F2-V10) + optional Abs./ff. + bis zu
// drei verkettete Sub-Marker (F2-V2: «lit. b Ziff. 5»).
//
// BEREICHS-TRENNER (Gegenprüfung R2/B2, 28.7.2026): neben den Strichen (–/-) auch
// die WORT-Formen «bis» (dt.) und «à» (frz.). Ohne sie war «Art. 14 bis 16 ELG» /
// «art. 90 à 98 LTF» nicht bloss ohne Bereichs-Endpunkt, sondern ein TOTALVERLUST
// (reproduziert: beide → []), weil das Bereichswort als law-Kandidat gelesen wird.
// Beidseitiges Pflicht-Leerzeichen: «bis» ohne Trenner ist immer das Ordinal
// («179bis»), und ein ziffern-geklebtes «à» gibt es nicht. Die Auflösung der
// Kollision mit dem Ordinal steht bei ARTIKEL_TOKEN (Ziffer-Lookahead) — beide
// Stellen tragen dieselbe Regel, darum EINE Konstante (§5).
// Ital. «a» ist NICHT aufgenommen: einbuchstabig, homograph zur Präposition und
// am Korpus ohne belegten Bereichs-Fall — test-gepinnte Lücke, keine Vermutung (§7).
const BEREICHS_TRENNER = '(?:\\s*[–-]\\s*|\\s+(?:bis|à)\\s+)';
const ARTIKEL_BEREICH = `${ARTIKEL_TOKEN}(?:${BEREICHS_TRENNER}${ARTIKEL_TOKEN})?`;
const ARTIKEL_GLIED =
  `${ARTIKEL_BEREICH}` +
  `(?:\\s*${ABSATZ_MARKER}\\s*${ABSATZ_TOKEN})?` +
  `(?:\\s*${FOLGE_MARKER}|\\s+${FOLGE_MARKER_EIN})?` +
  // Sub-Marker: der Token-Abschluss `(?![A-Za-z0-9])` (Pendant zum alten Pflicht-
  // `\s+`) verhindert, dass ein Marker-Buchstabe in den Code frisst — z.B. dass
  // «S» (Satz) das «St» von «StGB» konsumiert und nur «GB» als law übrig bleibt.
  `(?:\\s*(?:${SUB_MARKER})\\.?\\s*${SUB_TOKEN}(?![A-Za-z0-9])){0,3}`;
// Konnektor-Kette für Mehrfach-Zitate mit gemeinsamem Code (F2-V6/V8:
// «Art. 95 und 96 BGG», «Art. 39 ff., 82 ff. und 90 ff. ATSG»). Wort-Konnektoren
// nur mit beidseitigem Whitespace (it «e» damit zwingend ziffern-geankert, keine
// Kollision mit Artikel-Suffix «17e»); Komma/& mit optionalem Whitespace. Jedes
// Kettenglied beginnt mit einer Ziffer (ARTIKEL_GLIED → `\d`).
const KETTEN_GLIED = `(?:\\s*[,&]\\s*|\\s+(?:und|et|sowie|bzw\\.?|e)\\s+)${ARTIKEL_GLIED}`;

/**
 * Gesetzes-Zitat-Muster. Struktur (mit `i`-Flag → auch klein geschriebene
 * Treffer, die der nachgelagerte Filter aussortiert):
 *   \b Art. <liste: glied (konnektor glied)*> <law> CODE_ENDE
 * Die einzelnen Glieder der `liste` werden in `extrahiereStatutRefs` per
 * `KETTEN_TRENNER`/`GLIED_KOPF` in je einen StatutRef mit gemeinsamem Code zerlegt.
 */
const STATUTE_QUELLE =
  `\\b${ARTIKEL_MARKER}\\s*` +
  `(?<liste>${ARTIKEL_GLIED}(?:${KETTEN_GLIED})*)` +
  `\\s*(?<law>${GESETZ_CODE})` +
  CODE_ENDE;
const STATUTE_PATTERN = new RegExp(STATUTE_QUELLE, 'gi');

// Trennt eine `liste` an den Konnektoren; spiegelt KETTEN_GLIED (ohne Capture-
// Gruppen → sauberes String.split).
const KETTEN_TRENNER = /\s*[,&]\s*|\s+(?:und|et|sowie|bzw\.?|e)\s+/i;
// Kopf eines Glieds: Start-Artikel (+ optionaler Bereich, + optionaler Absatz).
// Sub-Marker/ff. werden bewusst NICHT gefangen (fliessen nie in den Norm-Key).
const GLIED_KOPF = new RegExp(
  `^\\s*(?<article>${ARTIKEL_TOKEN})(?:${BEREICHS_TRENNER}(?<articleBis>${ARTIKEL_TOKEN}))?` +
    `(?:\\s*${ABSATZ_MARKER}\\s*(?<paragraph>${ABSATZ_TOKEN}))?`,
  'i',
);

// F2-Fix (Phantom-Ketten, 17.7.2026) — Absatz-/Ziffer-Aufzählung ≠ Artikel-
// Aufzählung. Die Ketten-Zerlegung unterschied bislang NICHT zwischen einer
// Artikel-Aufzählung («Art. 95 und 96 BGG» = zwei Artikel) und einer Absatz-/
// Ziffer-Aufzählung («Art. 100 Abs. 1 und 2 BGG» = NUR Art. 100 — «2» ist Abs. 2,
// kein Artikel). Ein nacktes Fortsetzungsglied («… und 2»), das SELBST keinen
// eigenen Absatz-Marker trägt und einem Glied MIT Absatz-/Sub-Marker folgt, setzt
// dessen Absatz-/Ziffer-Aufzählung fort und darf NICHT als eigener Artikel gelesen
// werden — sonst entstehen Phantom-Norm-Keys (ART.2.BGG), die im Verzahnungs-Index
// falsche Pro-Artikel-Verknüpfungen stiften. Reine Artikel-Aufzählungen tragen im
// Vorglied keinen Absatz-/Sub-Marker und bleiben unberührt.
//
// Zwei bewusste Asymmetrien (Gegenprüfung 17.7.):
//  1) Der «hat-Vorglied-Marker?»-Prüfer erfasst Absatz ODER Sub, KLAMMERT aber den
//     FOLGE_MARKER (ff/ss/segg) AUS — «Art. 39 ss. et 45 CO» ist eine Artikel-, keine
//     Absatz-Kette. Kritisch: der Sub-Prüfer verlangt zwischen Marker und Token einen
//     echten Trenner (`.` oder Whitespace), sonst frässe der Ein-Buchstaben-Marker «S»
//     (Satz) case-insensitiv das «ss» von FOLGE (39 s|s) und kippte «45» fälschlich.
//  2) Die Ausnahme «Fortsetzung ist doch ein eigener Artikel» greift NUR bei einem
//     eigenen ABSATZ-Marker der Fortsetzung («… und 106 Abs. 2 BGG» = Art. 106). Ein
//     blosser Sub-Marker der Fortsetzung («… und 3 lit. c EMRK») zählt NICHT — er ist
//     Unter-Gliederung, kein neuer Artikel; sonst bliebe das Phantom ART.3.EMRK.
//  3) WORTANFANG-PFLICHT `\b` vor beiden Markern (Gegenprüfung R2/B2, 28.7.2026).
//     Ein Marker ist ein WORT, kein Buchstabe irgendwo in einem Wort. Ohne den
//     Anker wurde das neue Bereichswort «bis» zum Opfer genau der Falle, die
//     Asymmetrie 1 für «ss» beschreibt: in «Art. 3 bis 5 und 7 OR» las der
//     Sub-Prüfer das «s» von «bi|s» als Satz-Marker («s» + Whitespace + «5»),
//     hielt das Glied für eine offene Ziffern-Aufzählung und verwarf das
//     Kettenglied «7» — der Bereich wurde erkannt, der Folgeartikel ging
//     verloren (empirisch: → nur OR/3, ohne OR/7). `\b` ist eine reine
//     Verschärfung: alle echten Marker stehen nach Whitespace oder am Anfang.
const GLIED_ABSATZ_MARKER = new RegExp(`\\b${ABSATZ_MARKER}\\s*${ABSATZ_TOKEN}`, 'i');
// Sub-Marker MIT Pflicht-Trenner (`.`/Whitespace) — schliesst die FOLGE-«ss»-Falle.
const GLIED_SUB_MARKER = new RegExp(
  `\\b(?:${SUB_MARKER})(?:\\.\\s*|\\s+)${SUB_TOKEN}(?![A-Za-z0-9])`,
  'i',
);
/** Trägt ein Glied einen eigenen Absatz-Marker? (Signal «eigener Artikel»). */
function gliedTraegtAbsatz(stueck: string): boolean {
  return GLIED_ABSATZ_MARKER.test(stueck);
}
/** Trägt ein Glied einen Absatz- ODER Sub-Marker? (Signal «Aufzählung offen»). */
function gliedTraegtUnterMarker(stueck: string): boolean {
  return GLIED_ABSATZ_MARKER.test(stueck) || GLIED_SUB_MARKER.test(stueck);
}

// Abteilung: römische Zahl I–VI (nie höher → kein L/C/D/M) plus optionaler
// Kleinbuchstabe für die historischen Abteilungen «Ia»/«Ib»/«Va» (Bug-Check E2/E3).
// F2-V1: optionaler Erwägungs-/Konsiderations-Pinpoint hinter dem `\b`-gesicherten
// Kopf (DE «E.»/«Erw.», FR «consid.»/«cons.»); Token deckt dezimal (1.2.2), Slash
// (1b/gg), Bereich (2-4) und röm. Präfix (II.3). Der `\b` nach der Seite schliesst
// die 5-Stellen-Trunkierung und den No-Space-Teilkopf (Basis-Parität).
const ERW_MARKER = '(?:E\\.|Erw\\.|consid\\.|cons\\.)';
const ERW_TOKEN = '(?:[IVX]+\\.)?\\d+[a-z]?(?:\\.\\d+[a-z]?)*(?:/[a-z]+|-\\d+[a-z]?)?';
// F2-Nachtrag (ATF/DTF): Die frz. («ATF») und ital. («DTF») Sigel bezeichnen
// DENSELBEN Bundesgerichts-Leitentscheid wie das dt. «BGE» — «ATF 147 III 121»
// ≡ «DTF 147 III 121» ≡ «BGE 147 III 121». Alle drei werden auf den KANONISCHEN
// «BGE …»-Kopf normalisiert, sonst bekämen die Sprach-Zwillinge verschiedene
// Schlüssel und die Entscheid↔Entscheid-Verzahnung im FR/IT-Korpus ginge still
// verloren (Miner-These 2, empirisch belegt). Der frz./ital. Erwägungs-Pinpoint
// «consid.» ist bereits in ERW_MARKER — er ging für ATF/DTF vorher komplett
// verloren, weil der Kopf nur über den Blank-Docket-Fallback (ohne Pinpoint)
// erfasst wurde. `ATF`/`DTF` sind — wie `BGE` — nur in der exakten
// «Sigel Band röm Seite»-Form treffbar → praktisch FP-frei.
const BGE_PATTERN = new RegExp(
  `\\b(?:BGE|ATF|DTF)\\s+(?<vol>\\d{1,3})\\s+(?<div>[IVX]{1,4}[ab]?)\\s+(?<page>\\d{1,4})\\b` +
    `(?:\\s+${ERW_MARKER}\\s*(?<erw>${ERW_TOKEN}))?`,
  'gi',
);

// ECLI-Zitat (F2-V7), inkl. EU-Gerichtshof «ECLI:EU:C:2019:134». Das literale
// `ECLI:`-Präfix (+ 4-Segment-Kette) ist hochspezifisch → praktisch FP-frei; der
// Schwanz endet nie auf Satzzeichen (kein gieriger End-Punkt). CH-ECLI-Schwanz
// «SK.2025.57» bleibt erhalten; die separate Erfassung des Docket-Schwanzes wird
// per Span-Überlappung in `extrahiereEntscheidRefs` unterdrückt (keine Doppelung).
const ECLI_PATTERN = /\bECLI:[A-Z]{2}:[A-Z]+:\d{4}:[A-Z0-9]+(?:[._][A-Z0-9]+)*/gi;

// SR-/RS-Fundstellen-Locator (F2-V9): «SR 830.11», fr/it «RS 173.110». Gross-
// geschrieben (kein `i`-Flag → kein Prosa-«sr/rs»); `\d{3}`-Pflichtkern schliesst
// Daten/Beträge/Seiten <100 aus; negativer Lookbehind gegen die parlamentarische
// Klasse «AB/BO JJJJ SR …» (Ständerat, keine Systematik-Nummer).
const SR_PATTERN = /(?<!AB \d{4} )(?<!BO \d{4} )\b(?:SR|RS)\s+\d{3}(?:\.\d+){0,3}\b/g;

// Aktenzeichen-Muster (Reihenfolge wie im Python-Original; ohne IGNORECASE).
const DOCKET_PATTERNS: RegExp[] = [
  // 1A.122/2005, 2C_37/2016, D-7414/2015
  /\b[A-Z0-9]{1,4}[._-]\d{1,6}[/_]\d{4}\b/g,
  // VB.2018.00411, RR.2012.25
  /\b[A-Z]{1,6}\.\d{4}\.\d{1,6}\b/g,
  // 151 I 62 / 120 Ia 31 — BGE-interne Nennung ohne explizites «BGE»
  /\b\d{1,3}\s+[IVX]{1,4}[ab]?\s+\d{1,4}\b/g,
];

/** Abteilung normalisieren: römischer Teil gross, Suffix-Buchstabe klein («Ia», «Va»). */
function normAbteilung(div: string): string {
  const m = /^([ivx]+)([ab]?)$/i.exec(div);
  if (!m) return div.toUpperCase();
  return m[1].toUpperCase() + m[2].toLowerCase();
}

/**
 * Kurze Codes mit nur einem Grossbuchstaben, die trotz Filter GÜLTIGE Gesetzes-
 * Abkürzungen sind (Bug-Check Z1): «Cost.» = italienische Bundesverfassung.
 */
const GUELTIGE_AUSNAHMEN: ReadonlySet<string> = new Set(['COST']);

/**
 * Blockliste: Tokens, die dem Gesetzes-Code-Muster ähneln, aber keine Gesetzes-
 * Abkürzung sind (Struktur-Marker, Artikel/Präpositionen/Konjunktionen DE/FR/IT,
 * Ordinalwörter, gängige Nicht-Gesetzes-Abkürzungen). VERBATIM aus dem Python-
 * Original (`_INVALID_LAW_CODES`) — jahrelang getunte Falsch-Positiv-Vermeidung.
 */
export const INVALID_LAW_CODES: ReadonlySet<string> = new Set([
  // ── Struktur-Marker ──
  'AL', 'ABS', 'ABSATZ', 'ALIN', 'ALINEA', 'CPV', 'PARA',
  // Ordinal-Zusätze als eigenständige Tokens (Symmetrie zu ORDINAL_SUFFIX): steht
  // ein Ordinalwort ausnahmsweise ALLEIN hinter der Artikelnummer — getrennt
  // geschrieben und ohne folgendes Kürzel, oder nach einem Backtrack —, wird es
  // sonst selbst zum law-Kandidaten. Die Liste muss darum jedes Glied von
  // ORDINAL_SUFFIX führen; fehlt eines, entsteht ein Phantom-Erlass wie
  // «ART.179.SEPTIES» (Gegenprüfung R1/B1, 28.7.2026).
  'BIS', 'TER', 'QUATER', 'QUINQUIES', 'SEXIES',
  'SEPTIES', 'OCTIES', 'NOVIES', 'NONIES', 'DECIES', 'UNDECIES', 'DUODECIES',
  // Folge-Marker als eigenständige Tokens (Symmetrie zu FOLGE_MARKER, wie bei den
  // Ordinalen): 'SEG' ist mit der ital. Einzahl «seg.» dazugekommen (R2/B2).
  // Die EINBUCHSTABIGEN 'F'/'S' brauchen keinen Eintrag — GESETZ_CODE verlangt
  // mindestens zwei Zeichen, ein Ein-Buchstaben-Token wird nie law-Kandidat.
  'FF', 'SS', 'SEGG', 'SEG', 'ZIFF', 'ZIFFER', 'LIT', 'BST', 'BUCHST', 'SATZ',
  // ── Deutsch: Artikel, Präpositionen, Konjunktionen ──
  'AB', 'AM', 'AN', 'AUS', 'BEI', 'BZW', 'DA', 'DAS', 'DEM', 'DEN',
  'DER', 'DES', 'DIE', 'DIES', 'DURCH', 'EIN', 'EINE', 'EINEM',
  'EINEN', 'EINER', 'EINES', 'ER', 'ES', 'GEGEN', 'HA', 'IM', 'IN',
  'IST', 'JE', 'MIT', 'NACH', 'NEBEN', 'NICHT', 'NOCH', 'NUR',
  'ODER', 'OHNE', 'SICH', 'SIE', 'SIND', 'SOWIE', 'UM', 'UND',
  'UNTER', 'VOM', 'VON', 'VOR', 'WAR', 'WIE', 'WIRD', 'ZU',
  'ZUM', 'ZUR', 'ZWISCHEN',
  // ── Französisch: Artikel, Präpositionen, Konjunktionen ──
  'AU', 'AUX', 'AVEC', 'CE', 'CES', 'CETTE', 'COMME', 'DANS',
  'DE', 'DU', 'EN', 'EST', 'ET', 'IL', 'LA', 'LE', 'LES',
  'MAIS', 'OU', 'PAR', 'PEUT', 'POUR', 'QUE', 'QUI', 'SE',
  'SONT', 'SUR', 'UN', 'UNE',
  // ── Italienisch: Artikel, Präpositionen ──
  'CHE', 'CON', 'CUI', 'DAL', 'DEI', 'DEL', 'DELL', 'DELLA',
  'DELLE', 'DELLO', 'DI', 'FRA', 'GLI', 'NEL', 'NELL', 'NELLA',
  'NON', 'PER', 'SUL', 'TRA', 'UNA', 'UNO',
  // ── Ordinal- / Strukturwörter ──
  'ART', 'CUM', 'DRITTER', 'ERSTER', 'LETT', 'LET', 'LETTRE',
  'LITT', 'NAPR', 'PHR', 'PRIMA', 'RZ', 'SECONDA', 'ZWEITER',
  // F2: «NR» (Untergliederungs-Marker «Nummer», nie eine Gesetzes-Abkürzung) und
  // «BGE» (Entscheid-, keine Norm-Referenz) — beide sonst als law-Kandidat greifbar,
  // wenn kein echter Code folgt (F2-V2/V3). Die BGE-Erfassung selbst bleibt über
  // BGE_PATTERN/extrahiereEntscheidRefs unberührt (verhaltensneutral dort).
  'NR', 'BGE',
  // ── Gängige Abkürzungen, die keine Gesetzes-Codes sind ──
  'AD', 'AGB', 'BI', 'CH', 'NE', 'NI', 'NO', 'OF', 'QU', 'RE', 'SI',
  // F2-V8: Währungs-/Betrags-Codes — schliesst den einzigen belegten FP-Kanal der
  // Ketten-Zitate («Art. 41 und 500 EUR» → law=EUR) ohne Verlust echter Treffer.
  'CHF', 'EUR', 'USD', 'GBP', 'FR', 'FRS', 'SFR',
]);

/** Normalisiert ein Gesetzes-Zitat zu 'ART.<art>[.ABS.<abs>].<CODE>'. */
export function normalisiereStatut(
  artikel: string,
  absatz: string | null,
  gesetz: string,
): string {
  if (absatz) {
    return `ART.${artikel}.ABS.${absatz.toLowerCase()}.${gesetz.toUpperCase()}`;
  }
  return `ART.${artikel}.${gesetz.toUpperCase()}`;
}

/**
 * Normalisiert ein Aktenzeichen: BGE-artige Nennungen («151 I 62») behalten die
 * Leerzeichen und werden nur gross geschrieben; sonst werden Trenner (`-`, `.`,
 * `/`) zu `_` vereinheitlicht und Mehrfach-`_` kollabiert.
 */
export function normalisiereDocket(text: string): string {
  const compact = text.trim().replace(/\s+/g, ' ');
  const bge = /^(\d{1,3})\s+([IVX]{1,4}[ab]?)\s+(\d{1,4})$/i.exec(compact);
  if (bge) {
    return `${bge[1]} ${normAbteilung(bge[2])} ${bge[3]}`;
  }
  return compact
    .toUpperCase()
    .replace(/[-./]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '');
}

/**
 * Zählt Grossbuchstaben — Pendant zu Pythons `c.isupper()`, F2-V5-erweitert um die
 * Umlaute Ä/Ö/Ü, sonst bliebe «LugÜ» (nur ASCII-`L` → nGross 1, Länge 4>3) fälschlich
 * verworfen.
 */
function anzahlGross(s: string): number {
  return (s.match(/[A-ZÄÖÜ]/g) ?? []).length;
}

/** Numerischer Teil eines Artikel-Tokens («654a» → 654) für die Bereichs-Monotonie. */
function artikelNummer(token: string): number {
  const m = /^\d+/.exec(token);
  return m ? parseInt(m[0], 10) : NaN;
}

/** StatutRef samt Zahl der Roh-Vorkommen derselben Normalform im Text. */
export interface StatutRefZahl extends StatutRef {
  /** Wie oft die Normalform im Text vorkam (≥ 1). */
  anzahl: number;
}

/**
 * Wie `extrahiereStatutRefs`, aber mit der Zahl der Roh-Vorkommen je Normalform.
 *
 * WARUM ES DIESE VARIANTE GIBT (Gegenprüfung R2/B1, 28.7.2026): die Dedup-Ausgabe
 * beantwortet die Frage «kommt die Norm vor?», nicht «wie oft?». Die Korroborations-
 * Regel des Artikel-Index (`artikelSchluesselVonSnapshot`) braucht aber genau das
 * zweite, um eine einmalige Nennung im LITERATUR-Apparat von einer angewandten
 * Norm zu unterscheiden. Zählen heisst hier: wie oft ein Ketten-Glied dieselbe
 * Normalform erzeugt hat — dieselbe Zerlegung, dieselbe Reihenfolge, EINE
 * Implementierung (§5). `extrahiereStatutRefs` ist die Projektion davon und bleibt
 * verhaltensgleich (gleiche Objekte, gleiche Reihenfolge, `anzahl` weggelassen).
 */
/**
 * EIN Glied einer Artikel-Liste, roh zerlegt — ohne Erlass-Bindung.
 *
 * HERAUSGEZOGEN (W2·7-BEZUG/B2, §5): die Zerlegung stand inline in
 * `extrahiereStatutRefsMitAnzahl` und ist damit für den zweiten Aufrufer
 * (`extrahiereParagraphGruppen`, kantonale «§»-Zitate) nicht erreichbar gewesen.
 * Eine Kopie hiesse: die kantonale Ebene liest Ketten, Bereiche und den
 * Phantom-Ketten-Schutz nach ANDEREN Regeln als die Bundes-Ebene — genau die
 * Art stiller Divergenz, gegen die §5 steht. Verhaltensneutral: identischer
 * Code, nur verschoben (Beweis = unveränderte Tests + byte-gleiche Artefakte).
 */
interface ArtikelGlied {
  artikel: string;
  artikelBis: string | null;
  absatz: string | null;
}

/**
 * Artikel-Liste («95 und 96», «100 Abs. 1 und 2», «641-654a») in Glieder
 * zerlegen. Trägt den Phantom-Ketten-Schutz (F2-Fix) und die Bereichs-Monotonie
 * (F2-V10) — Begründungen an den jeweiligen Zeilen. Rein (§2).
 */
function zerlegeArtikelListe(liste: string): ArtikelGlied[] {
  const out: ArtikelGlied[] = [];
  // F2-Fix: `vorgliedTraegtMarker` merkt, ob das jeweils zuletzt als Artikel
  // gelesene (oder übersprungene) Glied einen Abs./Sub-Marker trug — nur dann wird
  // ein nacktes Folgeglied als Absatz-/Ziffer-Fortsetzung verworfen.
  let vorgliedTraegtMarker = false;
  const stuecke = (liste ?? '').split(KETTEN_TRENNER);
  for (let i = 0; i < stuecke.length; i++) {
    const stueck = stuecke[i];
    const km = GLIED_KOPF.exec(stueck);
    if (!km?.groups) continue;
    const kg = km.groups;
    const artikel = (kg.article ?? '').toLowerCase().replace(/\s+/g, '');
    if (!artikel) continue;
    // Phantom-Ketten-Schutz: ein Fortsetzungsglied nach einem markierten Vorglied
    // gehört zur Absatz-/Ziffer-Aufzählung (kein eigener Artikel) → verwerfen,
    // AUSSER es trägt einen eigenen Absatz-Marker («… und 106 Abs. 2» = Art. 106).
    // Ein blosser Sub-Marker der Fortsetzung rettet sie NICHT (Unter-Gliederung).
    if (i > 0 && vorgliedTraegtMarker && !gliedTraegtAbsatz(stueck)) continue;
    // Für das nächste Glied merken, ob DIESES einen Abs.-/Sub-Marker trug (nur
    // dann ist die Aufzählung «offen» — «Abs. 1, 2 und 3» verwirft auch 2 u. 3).
    vorgliedTraegtMarker = gliedTraegtUnterMarker(stueck);
    const absatz = kg.paragraph ? kg.paragraph.toLowerCase().replace(/\s+/g, '') : null;
    // Bereichs-Endpunkt (F2-V10) nur bei Monotonie bewahren: ein Rechtsartikel-
    // Bereich steigt nie ab → verwirft die FR-Binnen-Bindestrich-Falle
    // («art. 227-23 CP»/«Art. 6-1 EMRK», absteigend gelesen). `bis` fliesst NIE
    // in den Norm-Key (nur Start-Artikel), nur zur treuen Anzeige.
    let artikelBis = kg.articleBis ? kg.articleBis.toLowerCase().replace(/\s+/g, '') : null;
    if (artikelBis && !(artikelNummer(artikelBis) >= artikelNummer(artikel))) artikelBis = null;
    out.push({ artikel, artikelBis, absatz });
  }
  return out;
}

export function extrahiereStatutRefsMitAnzahl(text: string): StatutRefZahl[] {
  if (!text) return [];

  const refs: StatutRefZahl[] = [];
  const gesehen = new Map<string, StatutRefZahl>();

  for (const match of text.matchAll(STATUTE_PATTERN)) {
    const g = match.groups!;
    const raw = match[0].trim();
    const lawRaw = g.law;

    // Der Treffer muss wie eine juristische Abkürzung aussehen, nicht wie ein
    // gewöhnliches Wort. Klein geschriebene Wörter (der, des, in) und lange
    // Titlecase-Wörter (Oder, Della) fallen raus. Kurzes Titlecase (Cst, Abs)
    // bleibt — die Blockliste fängt die Falsch-Positiven darunter.
    const nGross = anzahlGross(lawRaw);
    if (nGross === 0) continue;
    if (nGross === 1 && lawRaw.length > 3 && !GUELTIGE_AUSNAHMEN.has(lawRaw.toUpperCase())) continue;

    const gesetz = lawRaw.toUpperCase();
    if (INVALID_LAW_CODES.has(gesetz)) continue;

    // Trefferliste in einzelne Artikel-Glieder zerlegen (F2-V6/V8: Mehrfach-Zitat
    // mit gemeinsamem Code) — jedes Glied trägt dieselbe Gesetzes-Abkürzung.
    for (const { artikel, artikelBis, absatz } of zerlegeArtikelListe(g.liste ?? '')) {
      const normalisiert = normalisiereStatut(artikel, absatz, gesetz);
      const bisher = gesehen.get(normalisiert);
      if (bisher) { bisher.anzahl += 1; continue; }
      const ref: StatutRefZahl = { raw, gesetz, artikel, artikelBis, absatz, normalisiert, anzahl: 1 };
      gesehen.set(normalisiert, ref);
      refs.push(ref);
    }
  }
  return refs;
}

// ─── Paragraphen-Zitate «§ N» (kantonale Zählweise, W2·7-BEZUG/B2) ───────────
//
// SCHLIESST LÜCKE L2 (Modul-Kopf) — aber NUR HALB, und das mit Absicht.
//
// L2 hielt fest: «§» ist kein Artikel-Marker, und die Lücke werde «erst mit dem
// kantonalen Erlass-Bestand fachlich relevant — dann als eigener Schritt mit
// eigener FP-Analyse». Dieser Schritt ist es. Die andere Hälfte bleibt offen und
// zwar bewusst: `extrahiereStatutRefs` bleibt UNVERÄNDERT und kennt weiterhin
// kein «§». Grund ist §1, nicht Bequemlichkeit — «§ 12 StG» ist KANTONALES
// Steuerrecht; würde der bestehende Extraktor das «§» mitlesen, liefe die
// Nennung durch `normKeyFuerAbk` und landete auf einem BUNDES-Register-key. Die
// beiden Zählweisen dürfen sich darum nicht denselben Auflösungspfad teilen.
//
// WAS DIESE FUNKTION TUT: sie liefert nur die ARTIKEL-SEITE eines §-Zitats plus
// die Textstelle, an der die Gruppe endet. WELCHER Erlass gemeint ist, entscheidet
// der kantonale Resolver (scripts/normtext/kanton-norm-resolver.ts) über die
// amtliche Systematik-Nummer im selben Zitat — nicht über eine Abkürzungs-Tabelle.
// So ist die föderal/kantonale Verwechslung nicht «gefiltert», sondern
// STRUKTURELL ausgeschlossen: es gibt gar keinen Weg von hier zu einem
// Bundes-Register-key.
//
// Die Grammatik der Artikel-Liste ist DIESELBE wie bei «Art.» (`ARTIKEL_GLIED` +
// `KETTEN_GLIED` + `zerlegeArtikelListe`, §5) — Ketten («§§ 88 Abs. 1 und 93»),
// Bereiche, Absätze und der Phantom-Ketten-Schutz gelten unverändert.

/** Eine zusammenhängende «§»-Zitatgruppe mit ihren Artikel-Tokens. */
export interface ParagraphGruppe {
  /** Roh-Treffer, z.B. '§§ 88 Abs. 1 und 93 Abs. 1 Ziff. 1'. */
  raw: string;
  /** Artikel-Tokens der Gruppe in Reihenfolge, dedupliziert ('88', '93'). */
  artikel: string[];
  /** Index im Eingabetext unmittelbar NACH der Gruppe (Start des Erlass-Fensters). */
  ende: number;
}

// «§» und «§§» (Mehrzahl bei Ketten). Kein `\b` davor: «§» ist kein Wortzeichen,
// eine Wortgrenze wäre dort nie erfüllt bzw. immer — je nach Vorzeichen.
const PARAGRAPH_PATTERN = new RegExp(
  `§{1,2}\\s*(?<liste>${ARTIKEL_GLIED}(?:${KETTEN_GLIED})*)`,
  'g',
);

/**
 * «§»-Zitatgruppen eines Textes, in Textreihenfolge. Rein und deterministisch (§2):
 * kein Zustand über Aufrufe hinweg (`matchAll` setzt `lastIndex` selbst zurück).
 */
export function extrahiereParagraphGruppen(text: string): ParagraphGruppe[] {
  if (!text) return [];
  const out: ParagraphGruppe[] = [];
  for (const match of text.matchAll(PARAGRAPH_PATTERN)) {
    const glieder = zerlegeArtikelListe(match.groups?.liste ?? '');
    if (!glieder.length) continue;
    const artikel: string[] = [];
    for (const g of glieder) if (!artikel.includes(g.artikel)) artikel.push(g.artikel);
    out.push({
      raw: match[0].trim(),
      artikel,
      ende: (match.index ?? 0) + match[0].length,
    });
  }
  return out;
}

/**
 * Extrahiert Gesetzes-Zitate aus Fliesstext (mit bewahrtem Artikel-Token).
 * Dedupliziert über die Normalform; Reihenfolge = erstes Vorkommen.
 */
export function extrahiereStatutRefs(text: string): StatutRef[] {
  return extrahiereStatutRefsMitAnzahl(text).map(
    ({ raw, gesetz, artikel, artikelBis, absatz, normalisiert }) =>
      ({ raw, gesetz, artikel, artikelBis, absatz, normalisiert }),
  );
}

/**
 * Extrahiert Entscheid-Zitate (BGE + Aktenzeichen) als normalisierte Strings.
 * Ein gemeinsames `gesehen`-Set dedupliziert; die BGE-interne Bare-Nennung
 * («151 I 62») wird gegen ein direkt vorangehendes «BGE» entdoppelt.
 */
export function extrahiereEntscheidRefs(text: string): string[] {
  if (!text) return [];

  const refs: string[] = [];
  const gesehen = new Set<string>();

  // ECLI zuerst (F2-V7) — Spannen merken, damit der Docket-Schwanz (CH-ECLI
  // «SK.2025.57») nicht zusätzlich als eigenes Aktenzeichen doppelt erfasst wird.
  const ecliSpans: Array<readonly [number, number]> = [];
  for (const match of text.matchAll(ECLI_PATTERN)) {
    const start = match.index ?? 0;
    ecliSpans.push([start, start + match[0].length]);
    const normalisiert = match[0].toUpperCase();
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }
  const inEcli = (start: number): boolean => ecliSpans.some(([s, e]) => start >= s && start < e);

  // BGE-Zitate, z.B. «BGE 147 I 268»; F2-V1 hängt den Erwägungs-Pinpoint an
  // («BGE 137 I 305 E. 3.2»). Der Pinpoint fragmentiert nur diese Funktion — die
  // Entscheid↔Entscheid-Verzahnung läuft über `kanonZitat` (Kopf-only), unberührt.
  for (const match of text.matchAll(BGE_PATTERN)) {
    const g = match.groups!;
    const kopf = `BGE ${g.vol} ${normAbteilung(g.div)} ${g.page}`;
    const normalisiert = g.erw ? `${kopf} E. ${g.erw}` : kopf;
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }

  const bareMuster = DOCKET_PATTERNS[DOCKET_PATTERNS.length - 1];
  for (const pattern of DOCKET_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      if (inEcli(start)) continue; // Teil eines bereits erfassten ECLI
      const raw = match[0].trim();
      if (pattern === bareMuster) {
        // Doppelzählung von BGE-Refs als Aktenzeichen vermeiden. F2-Nachtrag:
        // auch die frz./ital. Sigel «ATF»/«DTF» unterdrücken — deren Zahl-Schwanz
        // «147 III 121» wird sonst zusätzlich als bare Aktenzeichen erfasst und
        // bekäme den prefix-losen Schlüssel zurück, den der ATF/DTF-Fix gerade
        // auf den «BGE …»-Kanon hebt (sonst Doppel-Schlüssel statt Dedup).
        const prefix = text.slice(Math.max(0, start - 8), start);
        if (/\b(?:BGE|ATF|DTF)\s*$/i.test(prefix)) continue;
      }
      const normalisiert = normalisiereDocket(raw);
      if (!normalisiert || gesehen.has(normalisiert)) continue;
      gesehen.add(normalisiert);
      refs.push(normalisiert);
    }
  }
  return refs;
}

/**
 * Extrahiert SR-/RS-Fundstellen-Locatoren (F2-V9), z.B. «SR 830.11», fr/it
 * «RS 173.110» — eine Referenz auf einen Erlass über seine Nummer der
 * Systematischen Rechtssammlung (weder Artikel-Zitat noch Entscheid). Rein und
 * deterministisch; dedupliziert über die normalisierte Form.
 */
export function extrahiereFundstellenRefs(text: string): string[] {
  if (!text) return [];
  const refs: string[] = [];
  const gesehen = new Set<string>();
  for (const match of text.matchAll(SR_PATTERN)) {
    const normalisiert = match[0].trim().replace(/\s+/g, ' ');
    if (gesehen.has(normalisiert)) continue;
    gesehen.add(normalisiert);
    refs.push(normalisiert);
  }
  return refs;
}
