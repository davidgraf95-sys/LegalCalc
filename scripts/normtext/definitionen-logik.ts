// ─── R6 Legaldefinitionen — die reine Regel-Schicht (§2: deterministisch) ────
//
// Diese Datei enthält AUSSCHLIESSLICH regelbasierte, deterministische Muster.
// Kein Score, keine Heuristik mit Schwellenwert, kein LLM (§2, Leitplanke des
// Auftrags). Gleiche Snapshots → gleiche Ausgabe, byte-genau.
//
// ── WAS DAS ARTEFAKT IST — UND WAS NICHT (§8) ───────────────────────────────
// Was als Legaldefinition GILT, ist ein juristisches Urteil. Diese Schicht
// erkennt SATZFORMEN, nicht Rechtsnatur. Jeder Eintrag trägt darum
// `status: 'entwurf'`; `verified`/«geprüft» wird hier NIE gesetzt (§7/§8,
// fachliche Abnahme bleibt bei David).
//
// ── DER MUSTER-KATALOG WURDE EMPIRISCH ERHOBEN, NICHT GERATEN ───────────────
// Erhebung 31.8.2026 über den GESAMTEN Korpus (56 113 Artikel-Einträge in
// 1 458 Snapshot-Dateien, Bund 227 + Kanton 1 231). Je Kandidat wurde die
// Trefferzahl gezählt und eine deterministische Präzisions-Stichprobe (jeder
// ⌊N/20⌋-te Treffer, bei kleiner Population Vollerhebung) von Hand als
// echt/unecht beurteilt. Aufgenommen wurde nur, was ≥ ~90 % erreichte:
//
//   AUFGENOMMEN                       roh    Stichprobe   Präzision
//   ------------------------------------------------------------------
//   als-gilt      «Als X gilt/gelten»  1469   2×20 (n=40)   40/40  100 %
//   legende-einleitung  Lead-in + «X:»  344   20 Blöcke     20/20  100 %
//   legende-marginalie  Marginalie+«X:»  22   Vollerhebung  22/22  100 %
//                                                    (nach Erstwort-Filter)
//   im-sinne      «X im Sinne dieses …»  47   20            20/20  100 %
//   guillemets    «X» ist/sind …          75   Vollerhebung  75/75  100 %
//   unter-versteht «Unter X versteht man» 13   Vollerhebung  13/13  100 %
//   bedeutet-begriff «bedeutet «X» Y»     12   Vollerhebung  12/12  100 %
//   kurzform      «(nachfolgend: X)»      87   20            20/20  100 %
//
//   VERWORFEN (dokumentiert, NICHT im Generator)      roh   Präzision
//   ------------------------------------------------------------------
//   «gilt als» NICHT invertiert                        675    4/20  20 %
//       Fast durchweg Fiktion/Rechtsfolge statt Begriffsklärung:
//       «gilt als nicht bestanden», «gelten als genehmigt», «gilt als
//       erbracht». Nur die INVERSION «Als X gilt …» stellt den definierten
//       Begriff nach vorn — deshalb ist sie aufgenommen und die Grundform
//       nicht.
//   «bezeichnet»                                       804    0/12   0 %
//       «bezeichnet» heisst im Erlasstext ERNENNEN/BESTIMMEN («Der
//       Regierungsrat bezeichnet einen Konkurskreis»), nicht «benennt».
//   «im Sinne dieses/dieser …» roh                     181    9/20  45 %
//       Überwiegend Rückverweis («Leistungsanspruch im Sinne dieses
//       Gesetzes»), nicht Definition. Nur die Stellung VOR ist/sind/…
//       (Regel `im-sinne`) trägt.
//   «bedeutet/bedeuten» freistehend                    145    6/20  30 %
//       Meist Lead-in (schon von `legende-einleitung` erfasst) oder
//       gewöhnliches Verb («würde eine Doppelbelastung bedeuten»).
//   Marginalie «Begriff(e)/Definition(en)» + «X ist/sind …»  51  44/51  86 %
//       UNTER der Schwelle. Benannte Fehlerklassen: Gleichstellungssätze
//       («Den übrigen juristischen Personen gleichgestellt sind …»),
//       Verweissätze («Die Dispensationsgründe sind in den §§ 20–23
//       genannt»), deontische Sätze («sind in das Budget aufzunehmen»),
//       Aufzählungs-Fortsetzungen. Die beiden STRUKTURELL markierten
//       Teilmengen dieser Klasse sind einzeln aufgenommen (`guillemets`,
//       `legende-marginalie`); der unmarkierte Rest bleibt draussen.
//   «Unter X ist/sind …» ohne «zu verstehen»            39    5/20  25 %
//       «Unter Vorbehalt von Artikel 26 ist …» dominiert.
//
//   FREMDSPRACHEN — nur gezählt, NICHT aufgenommen (Auftrag: Aufnahme erst
//   mit eigener Stichprobe). Gemessen 31.8.2026:
//       fr «est/sont réputé(e)(s)»      4   ·  fr «au sens de la présente»  4
//       it «ai sensi del/della presente» 0 (die 2 `ai sensi`-Treffer im
//          Korpus sind Verweise auf Bundesrecht, keine Definitionen)
//       it «si intende per» 0 · fr «on entend par» 0
//   Die 37 fr/it-Snapshots sind zu dünn für eine tragfähige Stichprobe; die
//   Regeln bleiben unimplementiert, statt sie ungemessen zu übernehmen (§7).
//
// ── EIN EINTRAG JE (STELLE, SATZ) ───────────────────────────────────────────
// Die Regeln stehen in FESTER Priorität (REGELN unten). Pro Satz gewinnt die
// erste, die feuert; danach wird der Satz nicht weiter untersucht. Das ist der
// Grund, warum «Unter X versteht man» nicht zusätzlich als `im-sinne` und
// «(nachfolgend: X)» nicht zusätzlich als etwas anderes erscheint.

import type { NormSnapshot } from '../../src/lib/normtext/typen';

// ─────────────────────────────────────────────────────────────────────────────
// Satzgrenzen
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tokens, nach denen ein Punkt KEINE Satzgrenze ist. Geschlossene Liste, nicht
 * erweiterbar zur Laufzeit — sonst wäre die Zerlegung nicht mehr reproduzierbar.
 * Ohne sie zerfiele «Art. 5 Abs. 2 lit. a» in vier «Sätze».
 */
const ABKUERZUNGEN = new Set([
  'Art', 'art', 'Abs', 'abs', 'lit', 'Lit', 'Ziff', 'ziff', 'Bst', 'bst',
  'Nr', 'nr', 'Nrn', 'Abschn', 'Kap', 'Rz', 'Anh', 'Pos', 'Tab', 'Abb',
  'bzw', 'vgl', 'ca', 'resp', 'evtl', 'inkl', 'exkl', 'max', 'min',
  'sog', 'insb', 'usw', 'etc', 'ggf', 'zit', 'gem', 'betr', 'einschl',
  'Fr', 'Mio', 'Mrd', 'S', 'f', 'ff', 'Jh', 'Dr', 'Prof', 'St', 'Bsp',
  // Einzelbuchstaben aus «z.B.», «d.h.», «i.d.R.», «u.a.», «e.V.»
  'z', 'B', 'd', 'h', 'i', 'e', 'u', 'a', 'R', 'v', 'o',
]);

/** Zeichen, mit denen ein neuer Satz beginnen darf (nach Punkt + Leerraum). */
const SATZANFANG = /[A-ZÄÖÜÉÈÀ«"„(§–]/;

/**
 * Obergrenze der Zitatlänge. Kein Qualitäts-Score, sondern eine Reissleine
 * gegen Extraktions-Unfälle: ein Block, dessen Satzgrenzen die Quelle nicht
 * hergibt, soll keine Bildschirmseite ins Artefakt schreiben. Sie ist HEUTE
 * inert — längstes Zitat im Bestand 689 Zeichen (Lauf 31.8.2026) — und darum
 * meldet der Generator bei jedem Lauf die maximale Zitatlänge: die Schranke
 * darf nicht still zu greifen beginnen (§6.7).
 */
export const ZITAT_MAX = 2000;

export interface Satz {
  /** Offset des ersten Zeichens im Quelltext (verbatim-Anker). */
  start: number;
  /** Offset NACH dem letzten Zeichen. */
  ende: number;
}

/**
 * Zerlegt `text` in Sätze. Ein `.!?` ist Grenze, wenn (a) Leerraum + ein
 * Satzanfangs-Zeichen folgt oder das Ende erreicht ist, (b) das Wort davor
 * keine Abkürzung ist und (c) davor keine Ziffer steht («1. Januar», «Art. 58»
 * — die Ziffer-Regel fängt auch Ordinalzahlen ohne Abkürzungswort).
 */
export function saetze(text: string): Satz[] {
  const out: Satz[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;
    const davor = text[i - 1];
    if (c === '.' && davor !== undefined && davor >= '0' && davor <= '9') continue;
    if (c === '.') {
      let j = i - 1;
      while (j >= 0 && /[\p{L}]/u.test(text[j])) j--;
      const wort = text.slice(j + 1, i);
      if (ABKUERZUNGEN.has(wort)) continue;
    }
    // Leerraum überspringen, dann prüfen: Satzanfang oder Textende?
    let k = i + 1;
    while (k < text.length && /\s/.test(text[k])) k++;
    if (k < text.length && !SATZANFANG.test(text[k])) continue;
    if (k === i + 1 && k < text.length) continue; // «Nr.5» — kein Leerraum, kein Satzende
    out.push({ start, ende: i + 1 });
    start = k;
  }
  if (start < text.length) out.push({ start, ende: text.length });
  return out.filter((s) => text.slice(s.start, s.ende).trim().length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Begriffs-Normalisierung (rein string-basiert, jede Stufe erhält die
// Substring-Eigenschaft gegenüber dem Zitat)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Erstwörter, die keinen definierten Begriff eröffnen können: Pronomen
 * (anaphorisch — «Als solche gelten insbesondere …» benennt keinen Term),
 * Präpositionen und Konjunktionen (Fallunterscheidung statt Begriff — «im
 * Fixzeitenmodell: …»), Kasus-Artikel ausserhalb des Nominativs.
 * Geschlossene Liste; sie ist der Filter, der `legende-marginalie` von 20/22
 * auf 22/22 und `als-gilt` von 1469 auf 1449 Treffer bringt.
 */
const STOPP_ERSTWORT = new Set([
  'solche', 'solcher', 'solches', 'solchen', 'solchem',
  'diese', 'dieser', 'dieses', 'diesen', 'diesem', 'dies',
  'derartige', 'derartiges', 'derartigen', 'jene', 'jener', 'jenes',
  'sie', 'er', 'es', 'ihm', 'ihn', 'ihr', 'ihnen', 'wer', 'was',
  'im', 'in', 'an', 'auf', 'bei', 'mit', 'unter', 'über', 'für', 'nach',
  'vor', 'zu', 'zur', 'zum', 'aus', 'von', 'durch', 'gegen', 'ohne',
  'den', 'dem', 'des',
  'sobald', 'wenn', 'soweit', 'falls', 'sofern', 'dabei', 'ferner',
  'also', 'hierbei', 'insbesondere', 'namentlich', 'ebenfalls', 'auch',
]);

/** Nachgestellte Qualifikatoren, die nicht zum Begriff gehören. */
const QUALIFIKATOR = [
  ' im Sinne ', ' im Sinn ', ' nach Artikel ', ' nach Art. ', ' nach Absatz ',
  ' nach Abs. ', ' nach Ziffer ', ' nach Ziff. ', ' nach diesem ', ' nach dieser ',
  ' nach den ', ' nach § ', ' nach §§ ', ' gemäss ', ' gemäß ', ' von Absatz ',
  ' von Artikel ', ' dieses Gesetzes', ' dieser Verordnung', ' dieses Erlasses',
];

/** Artikel/Determinative, die einer Dativ-Konstruktion vorangehen («Unter dem Ehegatten»). */
const DATIV_ARTIKEL = ['der ', 'dem ', 'den ', 'die ', 'das ', 'einem ', 'einer ', 'eine ', 'ein '];

function trimRand(s: string): string {
  return s.replace(/^[\s]+/, '').replace(/[\s,;:]+$/, '');
}

/** «X» / "X" / „X“ → X (die Anführung ist Quell-Markierung, nicht Teil des Begriffs). */
function ohneAnfuehrung(s: string): string {
  const m = /^[«"„](.+)[»"“]$/.exec(s);
  return m ? m[1].trim() : s;
}

function ohneQualifikator(s: string): string {
  let cut = s.length;
  for (const q of QUALIFIKATOR) {
    const i = s.indexOf(q);
    if (i >= 2 && i < cut) cut = i;
  }
  return cut < s.length ? s.slice(0, cut) : s;
}

function ohnePraefix(s: string, praefixe: string[]): string {
  for (const p of praefixe) {
    if (s.startsWith(p) && s.length > p.length + 1) return s.slice(p.length);
  }
  return s;
}

export interface BegriffOptionen {
  /** Nachgestellte «im Sinne …»/«nach Art. …»-Qualifikatoren abschneiden. */
  qualifikator?: boolean;
  /** Voranstehende Marker abschneiden (z.B. 'Als ', 'Unter '). */
  praefixe?: string[];
}

/**
 * Normalisiert einen roh gefangenen Begriff. Gibt `null` zurück, wenn er die
 * harten Bedingungen verletzt — der Eintrag entfällt dann ganz (§7: lieber
 * keine Zeile als eine falsche).
 */
export function begriffNormalisieren(roh: string, opt: BegriffOptionen = {}): string | null {
  let b = trimRand(roh);
  if (opt.praefixe) b = trimRand(ohnePraefix(b, opt.praefixe));
  if (opt.qualifikator) b = trimRand(ohneQualifikator(b));
  b = trimRand(ohneAnfuehrung(b));
  if (b.length < 2 || b.length > 90) return null;
  if (b.includes(':') || b.includes('\n')) return null;
  const erst = /^[\p{L}]+/u.exec(b)?.[0];
  if (!erst) return null;
  if (STOPP_ERSTWORT.has(erst.toLowerCase())) return null;
  return b;
}

// ─────────────────────────────────────────────────────────────────────────────
// Die Regeln
// ─────────────────────────────────────────────────────────────────────────────

export type MusterId =
  | 'als-gilt'
  | 'legende-einleitung'
  | 'legende-marginalie'
  | 'im-sinne'
  | 'guillemets'
  | 'unter-versteht'
  | 'bedeutet-begriff'
  | 'kurzform';

/** Ein Satz-Regel-Treffer: Begriff + Zitatanfang RELATIV zum Satzanfang. */
interface SatzTreffer {
  muster: MusterId;
  begriff: string;
  /** Offset im Satz, ab dem zitiert wird (die Regel darf vorne kürzen). */
  ab: number;
}

/**
 * Marginalien, die den Artikel als Begriffsartikel deklarieren. Der Randtitel
 * ist amtlich (LexWork `article_title`) — er wird gelesen, nicht geraten.
 */
// NICHT `(?:…)*` schachteln: eine Vorform mit `(?:[A-Z0-9IVX]+\.?\s*)*` liess den
// Generator im Lauf 31.8.2026 katastrophal backtracken (7 min 99 % CPU, kein
// Ergebnis). Der Gliederungs-Präfix ist ein EINZELNES Token mit Pflicht-Punkt
// («I.», «1.», «2quinquies.») — genau eine optionale Gruppe, kein Stern.
export const MARGINALIE_BEGRIFF =
  /^\s*(?:[A-Za-z0-9]{1,12}\.\s*)?(?:Begriff(?:e|s|sbestimmungen?|sdefinitionen?)?|Definition(?:en)?|Begriffsbestimmung(?:en)?|Terminologie|Taxibegriff)\b/i;

/** Einleitung einer Begriffs-Legende: «In diesem Gesetz gelten als:» u.ä. */
export const LEGENDE_EINLEITUNG =
  /^(?:\d\w*\s+)?(?:In (?:diesem|dieser|dem vorliegenden|der vorliegenden)|Im Sinne (?:dieses|dieser))\b.{0,120}?(?:gelten als|gilt als|bedeuten|bedeutet|sind|ist)\s*:\s*$/;

// Satz-Regeln in FESTER Prioritätsreihenfolge (siehe Kopf).
const RX_GUILLEMETS =
  /^[«"„](?<b>[^»"“]{2,80})[»"“](?:\s+(?:oder|und)\s+[«"„][^»"“]{2,80}[»"“])?\s+(?:ist|sind)\s/u;
const RX_BEDEUTET = /\bbedeutet\s+[«"„](?<b>[^»"“]{2,80})[»"“]\s+\p{L}/u;
const RX_ALS_GILT = /^[Aa]ls (?<b>[^.;:]{2,80}?) (?:gilt|gelten)\b/u;
const RX_IM_SINNE =
  /^(?<b>[^.;:]{2,80}?) im Sinne (?:dieses|dieser) \p{L}+ (?:ist|sind|bezeichnet|bedeutet|bedeuten|liegt vor)\b/u;
const RX_UNTER = /^Unter (?<b>[^.;:]{2,80}?) (?:versteht man|(?:ist|sind)(?: [^.;:]{0,60})? zu verstehen)\b/u;
const RX_KURZFORM =
  /\((?:nachfolgend|nachstehend|im Folgenden|hiernach)(?:\s+(?:zusammenfassend|zusammen))?\s*:?\s*(?:als\s+)?[«"„]?(?<b>[^»"“)]{2,80}?)[»"“]?(?:\s+(?:genannt|bezeichnet))?\)/u;

/**
 * Wendet die Satz-Regeln in fester Priorität auf EINEN Satz an.
 * `satz` ist der bereits zugeschnittene Satztext (verbatim aus der Quelle).
 *
 * Sonderfall `als-gilt`/`im-sinne`: die Inversion steht oft erst nach einem
 * Semikolon («… gekündigt werden; als Probezeit gilt der erste Monat»). Dort
 * beginnt das Zitat NACH dem Semikolon — es bleibt verbatim und wird nicht
 * länger als der Satz (Auftrag: «≤ Satzgrenze»).
 */
export function regelnAufSatz(satz: string): SatzTreffer | null {
  const g = RX_GUILLEMETS.exec(satz);
  if (g?.groups?.b) {
    const b = begriffNormalisieren(g.groups.b);
    if (b) return { muster: 'guillemets', begriff: b, ab: 0 };
  }
  const bd = RX_BEDEUTET.exec(satz);
  if (bd?.groups?.b) {
    const b = begriffNormalisieren(bd.groups.b);
    if (b) return { muster: 'bedeutet-begriff', begriff: b, ab: 0 };
  }
  // Semikolon-Segmente: das ganze Satz-Segment ist ein zulässiger Zitat-Anfang.
  for (const ab of segmentAnfaenge(satz)) {
    const seg = satz.slice(ab);
    const a = RX_ALS_GILT.exec(seg);
    if (a?.groups?.b) {
      const b = begriffNormalisieren(a.groups.b, { qualifikator: true });
      if (b) return { muster: 'als-gilt', begriff: b, ab };
    }
    // `unter-versteht` VOR `im-sinne`: «Unter der Beglaubigung im Sinne dieses
    // Übereinkommens ist … zu verstehen» erfüllt beide Formen. Die
    // Unter-Regel schneidet zusätzlich den Dativ-Artikel ab und liefert
    // «Beglaubigung» statt «der Beglaubigung» (Stichprobenbefund 31.8.2026).
    const u = RX_UNTER.exec(seg);
    if (u?.groups?.b) {
      const b = begriffNormalisieren(u.groups.b, { qualifikator: true, praefixe: DATIV_ARTIKEL });
      if (b) return { muster: 'unter-versteht', begriff: b, ab };
    }
    const s = RX_IM_SINNE.exec(seg);
    if (s?.groups?.b) {
      const b = begriffNormalisieren(s.groups.b, { qualifikator: true, praefixe: ['Als ', 'Unter ', 'Nicht als '] });
      if (b) return { muster: 'im-sinne', begriff: b, ab };
    }
  }
  const k = RX_KURZFORM.exec(satz);
  if (k?.groups?.b) {
    const b = begriffNormalisieren(k.groups.b);
    if (b) return { muster: 'kurzform', begriff: b, ab: 0 };
  }
  return null;
}

/** Satzanfang + jeder Anfang nach «; » (aufsteigend, deterministisch). */
function segmentAnfaenge(satz: string): number[] {
  const out = [0];
  for (let i = 0; i < satz.length - 1; i++) {
    if (satz[i] === ';' && /\s/.test(satz[i + 1])) {
      let k = i + 1;
      while (k < satz.length && /\s/.test(satz[k])) k++;
      if (k < satz.length) out.push(k);
    }
  }
  return out;
}

/** Legende-Item «Begriff: Definiens» → Begriff, sonst null. */
export function legendeBegriff(itemText: string): string | null {
  const i = itemText.indexOf(':');
  if (i < 2) return null;
  const kopf = itemText.slice(0, i);
  if (kopf.includes('.') || kopf.length > 90) return null;
  const rest = itemText.slice(i + 1).trim();
  if (rest.length < 5) return null; // reiner Gliederungskopf mit Unterpunkten
  return begriffNormalisieren(kopf);
}

// ─────────────────────────────────────────────────────────────────────────────
// Extraktion je Snapshot-Eintrag
// ─────────────────────────────────────────────────────────────────────────────

export interface DefinitionsEintrag {
  begriff: string;
  ebene: 'bund' | 'kanton';
  /** Nur bei ebene==='kanton': das Kantonskürzel. */
  kanton?: string;
  erlass: string;
  norm: {
    /** Snapshot-Schlüssel: 'bund/AHVG' bzw. 'kanton/BS-815.100'. */
    snapshot: string;
    /** Eintrags-id des Artikels ('bund/AHVG/art_5'). */
    id: string;
    /** Artikel-Token ('5', '335_b'). */
    artikel: string;
    artikelLabel: string;
    /**
     * Index des Blocks in `bloecke`. Der Absatz allein reicht NICHT als Anker:
     * mehrere Blöcke desselben Artikels tragen `absatz: null` (Kanton-Erlasse
     * ohne Absatz-Numerierung). Der Index ist eindeutig, das Tor findet damit
     * die Quellzeichenkette ohne Raten.
     */
    block: number;
    /** Absatz-Marke des Blocks oder null (menschlicher Anker, nicht Schlüssel). */
    absatz: string | null;
    /** Art der Fundstelle: der Absatztext oder ein Aufzählungspunkt. */
    stelle: 'text' | 'item';
    /**
     * Bei stelle==='item': Index in `bloecke[block].items`, sonst null.
     *
     * WARUM DER INDEX UND NICHT DIE MARKE. Die lit.-Marke ist im Korpus NICHT
     * eindeutig: HMG Art. 4 Abs. 1 trägt sechs Punkte mit der Marke 'a'
     * (asexies … werden von der Fedlex-Extraktion auf 'a' verkürzt), und
     * korpusweit haben 623 Blöcke doppelte Marken — die meisten davon
     * Spiegelstrich-Punkte ('–'). Die erste Fassung dieses Artefakts ankerte
     * auf `lit.<marke>`; das Tor wurde daran ROT (11 Einträge, HMG/DSG),
     * bevor irgendetwas gelandet ist. Der Index ist eindeutig.
     */
    item: number | null;
    /** Amtliche Marke des Punktes ('a', 'abis', '–') — Anzeige, nie Schlüssel. */
    marke: string | null;
  };
  zitat: string;
  muster: MusterId;
  /** §7: Norm + Link + Stand — die Provenienz reist mit dem Zitat. */
  stand: string;
  quelleUrl: string;
  /** IMMER 'entwurf'. Fachliche Abnahme durch David (§7/§8). */
  status: 'entwurf';
}

/** Eine Fundstelle: der Absatztext eines Blocks oder eines seiner lit./Ziff.-Items. */
export interface Fundstelle {
  block: number;
  absatz: string | null;
  stelle: 'text' | 'item';
  /** Index in `bloecke[block].items` (null beim Absatztext). */
  item: number | null;
  marke: string | null;
  text: string;
  /** Tiefe des Items (0 = direkte Liste des Absatzes); Blocktext = 0. */
  tiefe: number;
  /** Trägt der zugehörige Block eine Legende-Einleitung («… gelten als:»)? */
  legendeBlock: boolean;
}

/**
 * Alle Fundstellen eines Artikels in QUELL-REIHENFOLGE (Block → Blocktext →
 * Items). Diese Reihenfolge ist zugleich die Ausgabe-Reihenfolge des
 * Generators — daher deterministisch ohne nachträgliche Sortierung.
 */
export function fundstellen(snap: NormSnapshot): Fundstelle[] {
  const out: Fundstelle[] = [];
  (snap.bloecke ?? []).forEach((b, bi) => {
    const legendeBlock = LEGENDE_EINLEITUNG.test((b.text ?? '').trim());
    if (b.text) {
      out.push({
        block: bi, absatz: b.absatz, stelle: 'text', item: null, marke: null,
        text: b.text, tiefe: 0, legendeBlock,
      });
    }
    (b.items ?? []).forEach((it, ii) => {
      if (!it.text) return;
      out.push({
        block: bi, absatz: b.absatz, stelle: 'item', item: ii, marke: it.marke,
        text: it.text, tiefe: it.tiefe ?? 0, legendeBlock,
      });
    });
  });
  return out;
}

/**
 * Extrahiert alle Definitions-Einträge EINES Artikels, in Quell-Reihenfolge.
 * Reine Funktion — keine I/O, kein Datum, kein Zufall (§2).
 *
 * Je Fundstelle gilt: greift die Legende-Regel (Item «X: Definiens» in einem
 * Lead-in-Block oder einem Artikel mit Begriffs-Marginalie), so liefert dieses
 * Item GENAU diesen einen Eintrag und wird nicht zusätzlich satzweise
 * untersucht — der Legende-Kopf ist bereits der erste Satz.
 */
export function definitionenAusEintrag(snap: NormSnapshot, snapshotKey: string): DefinitionsEintrag[] {
  const out: DefinitionsEintrag[] = [];
  const margin = MARGINALIE_BEGRIFF.test(snap.titel ?? '');

  const basis = (
    begriff: string, f: Fundstelle, zitat: string, muster: MusterId,
  ): DefinitionsEintrag => ({
    begriff,
    ebene: snap.ebene,
    ...(snap.ebene === 'kanton' ? { kanton: snap.quelle } : {}),
    erlass: snap.erlass,
    norm: {
      snapshot: snapshotKey, id: snap.id, artikel: snap.artikel,
      artikelLabel: snap.artikelLabel, block: f.block, absatz: f.absatz,
      stelle: f.stelle, item: f.item, marke: f.marke,
    },
    zitat,
    muster,
    stand: snap.stand,
    quelleUrl: snap.quelleUrl,
    status: 'entwurf',
  });

  for (const f of fundstellen(snap)) {
    // ── (1) Legende-Item «Begriff: Definiens»
    if (f.stelle === 'item' && f.tiefe === 0 && (f.legendeBlock || margin)) {
      const begriff = legendeBegriff(f.text);
      if (begriff) {
        const s = saetze(f.text)[0];
        const zitat = f.text.slice(s.start, s.ende).trim();
        if (zitat.includes(begriff) && zitat.length <= ZITAT_MAX) {
          out.push(basis(begriff, f, zitat, f.legendeBlock ? 'legende-einleitung' : 'legende-marginalie'));
          continue;
        }
      }
    }
    // ── (2) Satz-Regeln, ein Eintrag je Satz
    for (const s of saetze(f.text)) {
      const satz = f.text.slice(s.start, s.ende);
      const t = regelnAufSatz(satz);
      if (!t) continue;
      const zitat = satz.slice(t.ab).trim();
      if (!zitat.includes(t.begriff)) continue;
      if (zitat.length > ZITAT_MAX) continue;
      out.push(basis(t.begriff, f, zitat, t.muster));
    }
  }

  return out;
}

