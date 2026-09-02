// ─── Fedlex · Achse 5: Verweis-Spannen im Fliesstext ───
//
// Die SPANNEN-Schicht über dem Parser (Achse 4): sie sagt, WELCHE Textstellen
// als Verweis verlinkt werden — die von NORM_IM_TEXT gefundenen Anker, die per
// «i.V.m.»-Kette propagierten bare Glieder (Ketten-Regel) und die BLOSSEN
// Erlass-Verweise ohne Artikelnummer (Z1). Gerichtete Kette ohne Zyklus:
// tabelle ← url ← erkennung ← parser ← spannen.
//
// WARUM EIGENES MODUL (§6.6, 2.9.2026): mit dem Z1-Block riss `parser.ts` die
// 800-Zeilen-Schwelle (815 Z.). Geschnitten wurde entlang der bestehenden
// Achsen-Fuge, nicht quer durch eine Regel: `parser.ts` hält die ZITATFORMEN
// (was ein Verweis IST — Regex-Grammatik, Form B, Plural-Regionen), dieses
// Modul die SPANNEN-BILDUNG (welche Stelle den Link bekommt). Die
// Zitat-Bausteine kommen als Import aus dem Parser — keine zweite Wahrheit
// über die Zitier-Grammatik (§5).

import { type FedlexGesetz } from './tabelle';
import {
  erkenneFedlexGesetz,
  erkenneGenitivGesetz,
  erkenneTitelGesetz,
  fedlexLinkFuerArtikel,
  GENITIV_NAMEN_ESC,
  TITEL_FRAGMENTE_ESC,
} from './erkennung';
import { datumPasst } from './positivliste';
import {
  artikelnPluralVerweise,
  DATUM_IN_EINHEIT,
  DATUM_NACH_NAME,
  KLAMMER_NACH_NAME,
  N2_ARTNR,
  N2_DATUM,
  N2_KONN,
  N2_PASSUS,
  N2_WERT,
  NORM_IM_TEXT,
  NORM_NAMEN,
  NORM_NAMEN_ESC,
  TITEL_FORTSETZUNG,
} from './parser';

// ─── Ketten-Verweise: «Art. A i.V.m. Art. B GESETZ» ──────────────────────────
//
// PROBLEM (Referenz BGE 151 III 377, Auftrag David 3.7.2026): In einer
// Verweis-Kette trägt nur das LETZTE Glied das Gesetzeskürzel («Art. 684 i.V.m.
// Art. 679 ZGB»). NORM_IM_TEXT findet nur dieses letzte, voll zitierte Glied;
// die vorangehenden bare «Art. N» blieben unverlinkt, obwohl sie DASSELBE
// Gesetz meinen (juristische Drafting-Konvention: das Kürzel am Ketten-Ende gilt
// für alle Glieder).
//
// FIX: Das Kürzel des Ketten-Endes wird auf die vorangehenden bare Glieder
// PROPAGIERT und jedes Glied einzeln verlinkt. §1-Vorsicht (lieber ein Glied
// unverlinkt als falsch verlinkt):
//   · Propagiert wird NUR über echte Ketten-Konnektoren (i.V.m. / in Verbindung
//     mit / und / sowie / Komma) und nur auf BARE «Art. N»-Glieder OHNE eigenes
//     Kürzel. Trägt ein Glied ein EIGENES Kürzel («Art. 5 OR und Art. 6 ZGB»),
//     ist es ein separates Zitat und wird NICHT umgehängt.
//   · Die Kette bricht an allem, was kein Konnektor+Glied ist: Semikolon,
//     BGE-/Urteil-Zitate, Satzgrenzen, Präpositionen («der Verordnung»),
//     fremdes Kürzel dazwischen.
//   · «f./ff.» und Abs./lit./Ziff.-Zusätze brechen die Kette NICHT (Teil des
//     Glieds).
// Die Anzeige bleibt zeichenidentisch (§1): das Glied zeigt genau seinen
// Quelltext, nur das AUFLÖSUNGS-Ziel erhält das propagierte Kürzel.

/** Ein aufgelöster Norm-Verweis im Fliesstext (Anker ODER propagiertes Ketten-Glied). */
export interface NormVerweisSpan {
  /** Start-Offset im Quelltext. */
  start: number;
  /** End-Offset im Quelltext (exklusiv). */
  end: number;
  /** Anzeigetext = exakter Quelltext-Ausschnitt (zeichenidentisch, §1). */
  anzeige: string;
  /** Auflösbarer Verweis-Text (mit Kürzel), z. B. 'Art. 684 ZGB' — Ziel der Auflösung. */
  artikel: string;
  /** true = Kürzel aus dem Ketten-Ende propagiert (nicht im Quelltext des Glieds). */
  propagiert: boolean;
  /** Z1 (W2·22): true = BLOSSER Erlass-Verweis OHNE Artikelnummer. `artikel`
   *  trägt dann nur das FEDLEX-Kürzel und löst auf die Erlass-Seite ohne Anker
   *  auf; `anzeige` ist der Erlassname aus dem Quelltext. Eigenes Feld, nicht
   *  aus `anzeige !== artikel` abgeleitet: Renderer UND Mess-Tor sollen die
   *  Form am Namen erkennen, nicht an einer Zeichenketten-Nebenwirkung. */
  erlass?: boolean;
}

// Ketten-Glied (bare «Art. N [Abs./lit./Ziff./Satz …] [f./ff.]») OHNE Kürzel.
const KETTE_ART = 'Art\\.\\s*\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?';
const KETTE_PASSUS =
  '(?:\\s+(?:Abs\\.|lit\\.|Bst\\.|Ziff\\.|Ziffer|Satz)\\s*(?:\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?|[a-z]))*';
const KETTE_FOLGE = '(?:\\s+ff?\\.)?';
const KETTE_GLIED = `${KETTE_ART}${KETTE_PASSUS}${KETTE_FOLGE}`;
// Ketten-Konnektoren (NICHT Semikolon — der bricht die Kette bewusst).
const KETTE_KONNEKTOR = '(?:i\\.\\s?V\\.\\s?m\\.|in Verbindung mit|und|sowie|,)';
// Ein bare Glied UNMITTELBAR vor dem Anker: «GLIED <KONNEKTOR>» am Text-Ende.
const GLIED_VOR_KONNEKTOR = new RegExp(`(${KETTE_GLIED})\\s*(?:${KETTE_KONNEKTOR})\\s*$`);

/**
 * Alle auflösbaren Bund-Norm-Verweise eines Fliesstexts — die von NORM_IM_TEXT
 * gefundenen voll zitierten Anker PLUS die per Ketten-Regel propagierten bare
 * Glieder. Reine, deterministische Funktion (§2): EINE Wahrheit der Ketten-Regel
 * für Renderer (NormText) und Fundstellen-Suche (Rechtsprechung).
 *
 * Die zurückgegebenen Spans sind nach `start` sortiert und überschneidungsfrei.
 * Für Nicht-Ketten-Text ist die Anker-Menge identisch zu `matchAll(NORM_IM_TEXT)`
 * (gleicher Filter `fedlexLinkFuerArtikel != null`) — additiv, kein Verhalt-Bruch.
 */
export function normVerweiseImText(text: string, eigenesKuerzel?: string): NormVerweisSpan[] {
  const spans: NormVerweisSpan[] = [];
  for (const m of text.matchAll(NORM_IM_TEXT)) {
    const roh = m[0];
    // Nur verlinken, was der eine Resolver wirklich auflöst (kein toter Link, §8).
    if (fedlexLinkFuerArtikel(roh) == null) continue;
    const start = m.index;
    spans.push({ start, end: start + roh.length, anzeige: roh, artikel: roh, propagiert: false });
    // Kürzel des Anker-Endes → auf vorangehende bare Glieder propagieren.
    const kuerzel = erkenneFedlexGesetz(roh);
    if (!kuerzel) continue;
    let grenze = start;
    for (;;) {
      const mm = GLIED_VOR_KONNEKTOR.exec(text.slice(0, grenze));
      if (!mm) break;
      const gliedStart = mm.index;
      const gliedText = mm[1];
      // Synthese: Glied-Text + propagiertes Kürzel = auflösbarer Verweis. Die
      // Anzeige bleibt der reine Glied-Text (zeichenidentisch, §1).
      spans.push({
        start: gliedStart,
        end: gliedStart + gliedText.length,
        anzeige: gliedText,
        artikel: `${gliedText} ${kuerzel}`,
        propagiert: true,
      });
      grenze = gliedStart;
    }
  }
  // Z1 (W2·22): BLOSSE Erlass-Verweise ohne Artikelnummer — rein ADDITIV. Ein
  // Artikel-Anker (oder ein propagiertes Ketten-Glied) hat IMMER Vorrang: er
  // nennt die konkrete Bestimmung, die Erlass-Spanne nur den Erlass. Diese
  // Vorrang-Prüfung steht VOR der allgemeinen Bereinigung unten, weil dort der
  // frühere Start gewinnt — hier gewinnt der Artikel, gleich wo er beginnt (§1).
  const artikelSpans = [...spans];
  for (const e of erlassVerweiseImText(text, eigenesKuerzel)) {
    if (artikelSpans.some((a) => e.start < a.end && a.start < e.end)) continue;
    spans.push(e);
  }
  // Sortieren + defensiv überschneidungsfrei halten (Anker/Glieder aus mehreren
  // matchAll-Runden). Bei einer (theoretischen) Überschneidung gewinnt der frühere
  // Span; überlappende werden verworfen — nie doppelt oder verschachtelt verlinken.
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const rein: NormVerweisSpan[] = [];
  let letztesEnde = -1;
  for (const s of spans) {
    if (s.start < letztesEnde) continue;
    rein.push(s);
    letztesEnde = s.end;
  }
  return rein;
}

// ─── Z1 (W2·22-VERWEIS-FEDLEX): Erlass-Verweis OHNE Artikelnummer ────────────
//
// LÜCKE (amtlich belegt, Abgleich gegen die jolux:Citation-Kanten des OR in
// Fedlex, Stand 2026-01-01): Bis hierher verlinkte der Erkenner einen
// Bundeserlass NUR, wenn eine Artikelnummer davorstand — «Art. N KÜRZEL»
// (NORM_IM_TEXT) oder «Artikel N … des <Erlassname>» (Form B / Plural-Region).
// Der BLOSSE Erlass-Verweis blieb Text, obwohl die Positivliste den Namen
// kennt. Gemessene Beispiele, wörtlich aus public/normtext/bund/OR.json:
//   · art_328_b «… die Bestimmungen des Datenschutzgesetzes vom 25. September 2020.»
//   · art_193   «… richten sich nach der ZPO.»
//   · art_97    «… des Bundesgesetzes vom 11. April 1889 über Schuldbetreibung
//                und Konkurs sowie der Zivilprozessordnung vom 19. Dezember 2008 (ZPO)»
//   · art_622   «… im Sinne des Bucheffektengesetzes vom 3. Oktober 2008 (BEG)»
//
// ZIEL ist die ERLASS-Ebene, nicht ein Artikel: `artikel` trägt bloss das
// FEDLEX-Kürzel, und `fedlexLinkFuerArtikel` liefert dafür die Erlass-URL ohne
// Anker (dieselbe Ableitung wie beim SchlT-Fall, §5). Der Renderer zeigt
// unverändert den Quelltext (`anzeige`), verlinkt also zeichenidentisch.
//
// DREI ERKENNUNGS-FORMEN, jede mit eigener Eindeutigkeits-Bedingung (§1: kein
// Link ist besser als ein falscher). Die Regeln sind STRENGER als bei Form B,
// weil hier keine Artikelnummer das Zitat als Norm-Verweis ausweist:
//   (a) AMTLICHER VOLLTITEL «Bundesgesetzes [vom D. Monat JJJJ] über …» —
//       Kopfwort + kuratiertes Titel-Fragment (positivliste.ts). NUR der Kopf
//       `Bundesgesetzes` (titelGeltung 'alle'): ein Kanton erlässt kein
//       Bundesgesetz. Der Kopf `Verordnung` ist generisch und bleibt hier
//       AUSSEN vor — ohne Artikelnummer fehlt jedes zweite Signal.
//   (b) KURZTITEL-GENITIV aus der Positivliste («des Bucheffektengesetzes»).
//       Ebenenübergreifend eindeutige Namen (geltung 'alle') lösen direkt auf;
//       Namen mit geltung 'bund' (ein gleichnamiger kantonaler Erlass ist
//       belegt — Falschlink BE-154.21 «Datenschutzgesetz») NUR MIT
//       bestätigendem Erlassdatum im Text. Das Datum identifiziert den Erlass
//       auch ohne Ebenen-Kontext: das kantonale Datenschutzgesetz trägt ein
//       anderes (BE: 19. Februar 1986). Darum braucht diese Funktion — anders
//       als fremdRoutingFormB — keinen `ebene`-Parameter; sie ist in Bund- und
//       Kantonserlassen gleich streng.
//   (c) ALLEINSTEHENDES KÜRZEL aus KUERZEL_TOKENS («nach der ZPO») NUR hinter
//       einem Kontext-Wort der Verweisungssprache (Z1_KONTEXT). Ein nacktes
//       Kürzel im Fliesstext bleibt Text — «OR» ist auch ein gewöhnliches
//       Zeichenpaar, und ohne Kontext ist es kein Verweis.
//
// VIER NACHPRÜFUNGEN, wörtlich dieselben wie in fremdRoutingFormB (§5):
//   · Erlassdatum (`datumPasst`): ein zitiertes Datum, das nicht zum Ziel
//     passt, meint einen anderen — meist aufgehobenen — Erlass ⇒ kein Link.
//   · Klammer-Kürzel hinter dem Namen: nennt es ein anderes/unbekanntes
//     Gesetz, ist der Name nicht das gefundene Bundesgesetz ⇒ kein Link.
//   · Titel-Fortsetzung (Präfix-Bindung, Fix-Runde 1 zu W2·20): folgt hinter
//     dem Fragment ein weiteres Titelwort und bestätigt kein Datum den Erlass,
//     ist ein LÄNGERER Titel gemeint (BPRAS statt BPR) ⇒ kein Link.
//   · Selbstmarker: «dieses Gesetzes», «des vorliegenden Gesetzes» tragen
//     keinen Erlassnamen und stehen darum in keiner der drei Tabellen — sie
//     können hier gar nicht auflösen (Negativ-Test hält das fest).
//
// ABGRENZUNG zu Form B und Plural-Region (die Artikel-Pfade bleiben zuständig,
// sonst entstünde ein zweiter Link auf dieselbe Stelle ODER — schlimmer — die
// Erlass-Spanne schnitte die «Artikel N …»-Einheit auseinander und der bare
// Artikel fiele auf den Self-Linker zurück, §1):
//   · RÜCKWÄRTS-GUARD Z1_VOR_ARTIKEL — steht unmittelbar vor der Nennung ein
//     Artikel-/Paragrafen-Zitat (mit Aufzählung, Passus-Kette, «f./ff.» und
//     optionaler Präposition), ist Form B zuständig ⇒ keine Erlass-Spanne.
//     Aus DENSELBEN Bausteinen gebaut wie FREMD_FORM_B (N2_ARTNR/N2_KONN/
//     N2_PASSUS/N2_WERT), also dessen Spiegelbild, nicht eine zweite Wahrheit.
//   · PLURAL-GUARD — Nennungen innerhalb einer `artikelnPluralVerweise`-Region
//     gehören dieser Region (A10). Die Regionen werden nur berechnet, wenn es
//     überhaupt einen Kandidaten gibt (§15: kein zweiter Voll-Scan pro Text).

/** Kontext-Wörter der Verweisungssprache vor einem ALLEINSTEHENDEN Kürzel. */
const Z1_KONTEXT = '(?:'
  + '(?:Bestimmungen|Bestimmung|Vorschriften|Vorschrift|Regelungen|Regelung)\\s+(?:des|der)'
  + '|(?:nach|gemäss|gemäß)\\s+(?:dem|der|des|den)'
  + '|im\\s+Sinne\\s+(?:des|der)'
  + '|nach\\s+Massgabe\\s+(?:des|der)'
  + '|in\\s+Anwendung\\s+(?:des|der)'
  + ')';
// 1 = Kopfwort · 2 = Titel-Fragment · 3 = Kurztitel-Genitiv · 4 = blosses Kürzel.
// Der Abschluss-Lookahead trennt Kürzel und Namen sauber vom Wortinneren
// («BEGleitschreiben», «OR-konform») — Identität mit Wortgrenze (§7/§0.2).
const Z1_ERLASS = new RegExp(
  '(?:'
    + '\\b(Bundesgesetzes)(?:\\s+vom\\s+' + N2_DATUM + ')?\\s+(' + TITEL_FRAGMENTE_ESC.join('|') + ')'
    + '|\\b(' + GENITIV_NAMEN_ESC.join('|') + ')'
    + '|' + Z1_KONTEXT + '\\s+(' + NORM_NAMEN_ESC.join('|') + ')'
  + ')(?![-0-9A-Za-zÀ-ÿ­])',
  'g',
);
// Spiegelbild der FREMD_FORM_B-Grammatik, rückwärts gelesen: «Art./Artikel/§ N
// [, M und K] [Passus W …] [f./ff.] [des|der|…]» unmittelbar vor der Nennung.
const Z1_VOR_ARTIKEL = new RegExp(
  '(?:Art\\.|Artikeln?|§§?)\\s*' + N2_ARTNR
    + '(?:\\s*' + N2_KONN + '\\s*' + N2_ARTNR + ')*'
    + '(?:\\s+' + N2_PASSUS + '\\s+' + N2_WERT + '(?:\\s*' + N2_KONN + '\\s*' + N2_WERT + ')*)*'
    + '(?:\\s+ff?\\.)?'
    + '(?:\\s+(?:des|der|dem|den|über|vom))?\\s*$',
);
/** Rückschau-Fenster des Guards: ein Artikel-Zitat mit Aufzählung und
 *  Passus-Kette bleibt weit darunter; die Grenze hält den Scan linear (§15). */
const Z1_RUECKSCHAU = 240;

/**
 * Ist der Klammer-Inhalt WIRKLICH das Kürzel des genannten Erlasses?
 *
 * `erkenneFedlexGesetz` akzeptiert jedes Zitat, das AUF ein Kürzel endet — ein
 * führendes Wort stört dort nicht («Art. 5 StGB»). Hinter einem Erlassnamen ist
 * genau das aber ein anderes Signal: «(EG StPO)», «(EG zum ZGB)» nennen das
 * kantonale EINFÜHRUNGSGESETZ, nicht den Bundeserlass — der äussere Name ist
 * dort bloss das Ende eines längeren kantonalen Titels («des Gesetzes über die
 * Einführung der Schweizerischen Strafprozessordnung»). Belegte Falschlinks der
 * Rot-Runde: BS-154.125 §5, BS-154.980 §1, BS-258.210 §4, BS-510.100 §31,
 * BS-212.400 §27, AI-640.000 Art. 179, AR-143.1 Art. 64, AR-741.1 Art. 33,
 * BE-215.326.2 Art. 22 (9 Stellen).
 *
 * Zulässig ist darum nur: (a) der amtliche Appositiv «Titel, KÜRZEL» /
 * «Titel; KÜRZEL» bzw. das nackte Kürzel — der Teil hinter dem letzten Komma
 * muss EIN Eintrag der Kürzelliste sein (Mehrwort-Kürzel «GebV SchKG»
 * eingeschlossen, §5: dieselbe Liste wie der Fliesstext-Scan); (b) ein
 * ARTIKEL-Zitat desselben Erlasses («(Art. 620 ff. OR)», «(Art. 79 Abs. 2 und
 * 80 VVG)») — die Klammer verweist dann auf Bestimmungen des GEFUNDENEN
 * Erlasses und bestätigt ihn; jene Artikel verlinkt NORM_IM_TEXT ohnehin
 * einzeln (6 Stellen, alle geprüft).
 */
function klammerIstKuerzel(inhalt: string): boolean {
  const rest = (inhalt.split(/[,;]/).pop() ?? '').trim();
  // `\s` statt `\b`: hinter «Art.» steht kein Wortzeichen, eine Wortgrenze
  // gibt es dort also nicht — mit `\b` wäre der Artikel-Zweig tot gewesen.
  return /^Art(?:\.|ikel)\s/.test(rest) || NORM_NAMEN.includes(rest);
}

/** Identitäts-Normalisierung eines Kürzels für den SELF-Vergleich. Bewusst
 *  eigenständig neben `kuerzelKanon` (NormText.tsx): dort fallen Umlaute weg
 *  ([^A-Z0-9]), womit «BüV» zu «BV» würde — zwei verschiedene Erlasse. Für den
 *  Self-Ausschluss eines ERLASS-Verweises wäre das ein still verlorener,
 *  richtiger Link (gemessen: bund/BUEV/art_5 → BV). Hier bleiben Umlaute
 *  darum erhalten, wie in `KANON` (erkennung.ts); Trennzeichen fallen weg,
 *  damit Register-Schlüssel («FINFRAV_FINMA») und FEDLEX-Key («FinfraV-FINMA»)
 *  denselben Erlass bezeichnen. §1: lieber ein Duplikat als eine Abstraktion,
 *  die zwei verschiedene Identitäts-Begriffe stillschweigend gleichsetzt. */
const Z1_IDENT = (s: string): string => s.toUpperCase().replace(/[^A-ZÄÖÜ0-9]/g, '');

/**
 * Alle BLOSSEN Erlass-Verweise eines Fliesstexts (Z1) — Verweise auf einen
 * Bundeserlass OHNE Artikelnummer. Rein und deterministisch (§2), Spannen nach
 * `start` sortiert und überschneidungsfrei. `artikel` ist das FEDLEX-Kürzel
 * (Auflösung auf die Erlass-Seite), `anzeige` der unveränderte Quelltext.
 *
 * @param eigenesKuerzel Register-Schlüssel des GELESENEN Erlasses (letztes
 *        Segment des Lese-Basispfads). Nennt der Text diesen Erlass selbst
 *        («Die Bundesverfassung kann jederzeit … revidiert werden» in der BV),
 *        ist es kein Fremdverweis — ein Chip führte den Leser aus der geltenden
 *        Fassung heraus nach Fedlex, ohne etwas hinzuzufügen. Gemessen
 *        2.9.2026 über den ganzen Korpus: 26 Stellen, alle in der BV. Ohne
 *        Argument (Rechner-/Vorlagentexte, Rechtsprechung) gibt es keinen
 *        gelesenen Erlass — dort ist jeder Verweis fremd.
 */
export function erlassVerweiseImText(text: string, eigenesKuerzel?: string): NormVerweisSpan[] {
  const spans: NormVerweisSpan[] = [];
  let pluralRegionen: ReturnType<typeof artikelnPluralVerweise> | null = null;
  for (const m of text.matchAll(Z1_ERLASS)) {
    const end = m.index + m[0].length;
    // Form (c): verlinkt wird NUR das Kürzel, nicht das Kontext-Wort davor.
    const start = m[4] ? end - m[4].length : m.index;
    // Abgrenzung 1: unmittelbar vorangehendes Artikel-/Paragrafen-Zitat.
    if (Z1_VOR_ARTIKEL.test(text.slice(Math.max(0, m.index - Z1_RUECKSCHAU), m.index))) continue;
    // Abgrenzung 2: Plural-Region (A10) — sie bringt ihre eigenen Glieder mit.
    pluralRegionen ??= artikelnPluralVerweise(text);
    if (pluralRegionen.some((r) => start < r.end && r.oeffnerStart < end)) continue;
    // Auflösung je Form + Eindeutigkeits-Bedingung.
    let gesetz: FedlexGesetz | null;
    let nurMitDatum = false;
    if (m[1]) {
      gesetz = erkenneTitelGesetz(m[1], m[2], 'kanton'); // nur Geltung 'alle'
    } else if (m[3]) {
      const eindeutig = erkenneGenitivGesetz(m[3], 'kanton'); // nur Geltung 'alle'
      gesetz = eindeutig ?? erkenneGenitivGesetz(m[3], 'bund');
      nurMitDatum = !eindeutig && gesetz != null;
    } else {
      gesetz = erkenneFedlexGesetz(m[4]);
    }
    if (!gesetz) continue;
    const nach = text.slice(end);
    const klammer = KLAMMER_NACH_NAME.exec(nach);
    if (klammer) {
      if (erkenneFedlexGesetz(klammer[1]) !== gesetz) continue; // fremde/unbekannte Klammer
      if (!klammerIstKuerzel(klammer[1])) continue;             // Klammer nennt einen ANDEREN Erlass
    }
    // Das Erlassdatum steht an DREI Stellen der Zitier-Konvention: im Titel
    // («Bundesgesetzes vom D über …»), direkt hinter dem Namen («des DSG vom D»)
    // ODER hinter dem Klammer-Kürzel («des Bundesgesetzes über den Datenschutz
    // (DSG) vom 19. Juni 1992»). Die dritte Stelle fehlte zuerst — belegter
    // Falschlink der Rot-Runde: BS-215.700 §8 und BS-952.820 §6 zitieren das
    // AUFGEHOBENE aDSG von 1992 und landeten auf dem DSG von 2020 (§1).
    const datum = DATUM_IN_EINHEIT.exec(m[0])?.[1]
      ?? DATUM_NACH_NAME.exec(nach)?.[1]
      ?? (klammer ? DATUM_NACH_NAME.exec(nach.slice(klammer[0].length))?.[1] : null)
      ?? null;
    if (!datumPasst(gesetz, datum)) continue;      // Zeit-Kante (V-5)
    if (nurMitDatum && !datum) continue;           // gleichnamiger Kantonserlass möglich
    if (m[1] && !datum && TITEL_FORTSETZUNG.test(nach)) continue;        // Präfix-Bindung
    if (eigenesKuerzel && Z1_IDENT(gesetz) === Z1_IDENT(eigenesKuerzel)) continue; // Self
    spans.push({ start, end, anzeige: text.slice(start, end), artikel: gesetz, propagiert: false, erlass: true });
  }
  return spans;
}
