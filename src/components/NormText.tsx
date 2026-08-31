import { Fragment } from 'react';
import {
  normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
  artikelnPluralVerweise,
} from '../lib/fedlex';
import { NormChip } from './vorlagen/NormChip';
import { RechtsprechungText } from './RechtsprechungLink';

// ─── Inline-Norm-Auto-Linker (Auftrag David 17.6.2026) ─────────────────────
//
// «Jede genannte Norm soll verlinkt sein.» Bis hierher öffnete das Norm-Popover
// nur an STRUKTURIERTEN Chip-Stellen; Artikel, die im FLIESSTEXT genannt werden
// (Begründungen, Hinweise, Tarif-`hinweis`, Gates-/Ergebnis-Warnungen), waren
// reiner Text. NormText schliesst das: es findet jeden Bund-Normverweis
// («Art. N … GESETZ») im übergebenen Text und macht ihn zum Popover-Trigger —
// der restliche Text bleibt zeichenidentisch (§1: nur Darstellung).
//
// UNIVERSELLER Inline-Verweis-Linker: Normen UND Rechtsprechung. Single source:
//  - NORM_IM_TEXT (fedlex.ts) findet die Norm-Verweise (Gesetz-Namen dort
//    gepflegt), NormChip (ui.tsx) trägt die GESAMTE Popover-Logik (Laden/
//    Overlay/A11y) — NormText dupliziert davon nichts, übergibt nur Inline-Stil.
//  - Die ZWISCHENSTÜCKE (alles, was kein Norm-Verweis ist) laufen durch
//    RechtsprechungText, sodass darin enthaltene BGE/BGer-Zitate ebenfalls
//    verlinkt werden. So genügt EINE Komponente an jeder Fliesstext-Stelle für
//    beide Verweis-Arten (ersetzt das frühere blosse <RechtsprechungText>).
//
// Auflösbarkeit: nur Norm-Treffer, die fedlexLinkFuerArtikel auflöst (Bund),
// werden verlinkt. Nicht auflösbare Nennungen (z. B. kantonale «§ 4», unbekannte
// Gesetze) bleiben Text — NIE ein toter Link (§8). Kantonale Inline-Auflösung
// läuft separat über den Erlass-/Kanton-Kontext der Quelle, nicht hier.
//
// SSR/Prerender: NormChip rendert serverseitig nur den <a> (Popover erst im
// Browser); der erzeugte Text ist zeichenidentisch zum heutigen plain {text}
// (nur zusätzliche <a>-Hüllen), Golden/PDF-Pfade nutzen NormText nicht.

// ─── Ä25/Ä61 · VERWEIS-AUSZEICHNUNG IM FLIESSTEXT ───────────────────────────
// Dezenter Inline-Stil (gepunktete Unterstreichung) — fügt sich in den
// Fliesstext ein, anders als der Pillen-Chip an strukturierten Stellen.
//
// STAND 17.8.2026: die Linie bleibt im RUHEZUSTAND. S2 hatte sie versuchsweise
// auf «Linie erst bei hover/focus-visible» umgestellt (Design-Grundlage Kap. 8);
// der S2-Nachzug hat das ZURÜCKGENOMMEN, und die Design-Frage geht als Entscheid
// an David (Fahrplan Kap. 7, Ä-Tabelle Ä25). Drei gemessene Gründe:
//
//  1. REICHWEITE. Diese Klasse ist die Verweis-Auszeichnung der GANZEN Site,
//     nicht des Lesers: NormText steht in Tarif-Hinweisen, Gates-/Ergebnis-
//     Warnungen und Vorlagen-Texten (~20 prerenderte Rechner-/Vorlagen-Seiten).
//     Eine Leser-Typografie-Etappe darf sie nicht mitziehen.
//  2. WCAG G183. Ohne Linie unterscheidet den Verweis nur noch die FARBE; G183
//     verlangt dafür ≥ 3 : 1 gegen den umgebenden Text. Gemessen am gebauten
//     S2-Stand (chromium, 17.8.2026): 1.00 : 1 auf `/rechner/verjaehrung`
//     (Link und Fliesstext tragen dort dieselbe Farbe), 1.06 : 1 auf den
//     übrigen Rechner-Seiten, 2.14 : 1 im Leser. Die Schwelle ist damit an
//     jeder gemessenen Stelle verfehlt, im Ruhezustand blieb faktisch KEIN
//     nichtfarbliches Signal ausser dem Schriftgewicht.
//  3. AXE-AUSNAHME. `link-in-text-block` ist eine ausdrückliche Ausnahme mit
//     David-Entscheid (`docs/ux-audit-2026-07/BERICHT.md` B-2); ihre Reichweite
//     eigenmächtig auszuweiten ist kein Nachzug.
//
// Warum ein FARB-Token die Frage nicht löst (S2-Rechnung, hier aufbewahrt, weil
// sie in Davids Entscheid eingeht): ein Verweis-Token müsste ZWEI Schranken
// zugleich halten — ≥ 3 : 1 gegen den Fliesstext (G183) UND ≥ 4.5 : 1 gegen den
// Grund (AA für Linktext, SC 1.4.3). In relativer Leuchtdichte L (WCAG-2.x-
// Formel, gerechnet 17.8.2026 aus den Ist-Tokens):
//
//   DUNKEL — Fliesstext #DCD9D2 (L 0.6949) auf Grund #16150F (L 0.0074):
//     3 : 1 gegen den Text verlangt   L ≤ 0.1983
//     4.5 : 1 über dem Grund verlangt L ≥ 0.2084
//     ⇒ das Intervall ist LEER — es gibt keinen solchen Farbwert.
//   HELL — Fliesstext #2B2924 (L 0.0223) auf Grund #FCFAF6 (L 0.9346):
//     heller als der Text: L ∈ [0.1668, 0.1738] ⇒ existiert als ~ein einziger
//     Ton, nützt aber nichts, solange die dunkle Seite leer ist.
//
// §5 (Ä25-Nebenfund, BEHALTEN): der String stand zeichengleich in
// `NormText.tsx` UND `KantonNormText.tsx`. Er ist EINE exportierte Konstante —
// sonst laufen Bund- und Kanton-Verweise beim nächsten Eingriff auseinander. Der
// farbfreie Teil steht getrennt, weil der kantonale §-Trigger dieselbe Linie,
// aber eine andere Hover-Farbe braucht. Jede FARB-Utility bleibt LITERAL in der
// Datei, die sie verwendet — Tailwind liest seine Klassen aus dem Quelltext,
// eine zur Laufzeit zusammengesetzte Farbklasse wäre ein stiller No-op (die
// Bug-Klasse, die `check:design-tokens` Prüfung 2/3 verfolgt).
export const VERWEIS_RUHE = 'underline decoration-dotted underline-offset-2';
export const VERWEIS_INLINE_CLASS = `${VERWEIS_RUHE} hover:text-brass-700`;
const INLINE_CLASS = VERWEIS_INLINE_CLASS;

// ─── Interne Querverweise (Lesesicht, Deep-Research-Befund 7) ───────────────
// In der Gesetzes-Lesesicht sind BARE Artikelverweise («nach Artikel 6a»,
// «gemäss Art. 12») gemeint = Artikel DESSELBEN Erlasses (Drafting-Konvention;
// Fremdgesetze tragen das Kürzel und werden bereits von NORM_IM_TEXT erfasst).
// Solche bare Verweise werden zu Sprung-Links im Reader. Nur aktiv, wenn der
// Reader `intern` übergibt → andere NormText-Aufrufer (golden/PDF, Tarif-Hinweise)
// bleiben unverändert.
export interface InternRefs {
  /** normalisierter Ref («6a») → Artikel-Token des Erlasses («6_a»). */
  tokenMap: Map<string, string>;
  basisPfad: string;
  springeZu: (token: string) => void;
  /** M6-D (W2·5b): Ist gesetzt, zeigen BARE «Art. N»-Verweise NICHT auf den
   *  eigenen Erlass (Self-Sprung), sondern auf DIESES Fremdgesetz-Kürzel — via
   *  NormChip (In-Reader-Popover, wenn im Korpus, sonst Fedlex-Deep-Link). Genutzt
   *  von ArtikelBody für Items unter einem Fremdgesetz-Chapeau, dessen Zielgesetz
   *  deterministisch feststeht (chapeauZielFremdgesetz). Der Self-Pfad (tokenMap)
   *  wird dann übersprungen — es gibt in einem Fremdgesetz-Chapeau kein «eigenes»
   *  Sprungziel (§1: lieber der Fremd-Verweis als ein falscher Self-Link). */
  fremdKuerzel?: string;
  /** F41/F40 (W2·13-KANTONE, 31.8.2026): Der gelesene Erlass zählt seine
   *  Bestimmungen mit «§» (Register-Weiche `bestimmungsEtikett === 'paragraf'`,
   *  abgeleitet in `useInternRefs`). Zwei Folgen, beide nur hier:
   *
   *  F41 — bare «Art. N» wird NICHT mehr self-verlinkt. In einem §-designierten
   *  Erlass heisst die eigene Bestimmung «§ N»; ein bare «Art. N» darin meint
   *  praktisch immer ein ANDERES Gesetz (fast durchwegs Bundesrecht, meist in
   *  der Form «Art. 18 Abs. 2 des Bundesgesetzes …», die keine der Bund-Weichen
   *  fängt). Der Self-Sprung wäre dann ein plausibel-falscher Link. Gemessen
   *  31.8.2026 mit den echten Guards: 199 solcher Self-Links in 82 der 775
   *  §-designierten Erlasse. UNTERDRÜCKT wird nur — es wird NICHT ersatzweise
   *  auf Bundesrecht verlinkt: die Drafting-Konvention ist ein Indiz, kein
   *  Beweis, und kein Link ist besser als ein falscher (§1/§8).
   *
   *  F40 — «§ N» wird self-verlinkt (siehe PARAGRAF_INTERN unten).
   *
   *  Ungesetzt (Bund, Art.-designierte Kantone, Fremdgesetz-Chapeau) ⇒ beides
   *  aus, Rendering byte-identisch zum Stand davor. */
  paragrafDesigniert?: boolean;
}
const normRef = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// «Art. N» / «Artikel N» (+ Buchstabe UND/ODER lat. Suffix als SEPARATE Gruppen,
// damit «329gbis»/«10bis» VOLLSTÄNDIG erfasst werden — nicht «329g»/«10b»; analog
// fedlex.ts). `(?![0-9a-z])` verhindert das `\d+`/Suffix-Backtracking, das sonst
// «Art. 20 des OR» auf «Art. 2» und «Art. 119bis …» auf «Art. 119b» verkürzte.
// Der frühere `(?!\s+(?:des|der|über|vom))`-Lookahead ist ENTFERNT (N2b, 4.7.2026):
// er blockierte das MATCHING von «Artikel 63 des Obligationenrechts (OR)» und
// verhinderte damit das Fremdgesetz-Routing der ausgeschriebenen Form. Die
// Fremd-/Verordnungs-Unterdrückung (bare «des/der …» ohne Klammer-Kürzel) läuft
// jetzt im Schleifenkörper NACH der N2b-Routing-Prüfung (identisches Ergebnis für
// die bare-«des»-Fälle, aber die «(KÜRZEL)»-Form wird nicht mehr verschluckt).
const ART_INTERN = /\bArt(?:\.|ikel)\s+(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])/g;

// ─── F40 · «§ N»-Selbstverweise in §-designierten Erlassen ───────────────────
// Vorbild ist `RE_PARAGRAF` (KantonNormText.tsx), aber mit der Zerlegung von
// ART_INTERN: die NUMMER ist eine eigene Gruppe (für die tokenMap), Buchstabe
// und lat. Suffix sind SEPARATE Alternativen, und `(?![0-9a-z])` schliesst ab.
// RE_PARAGRAF schreibt `\d+[a-z]?(?:bis|ter)?` ohne Grenze und zerlegt «§ 12bis»
// in «§ 12b» + «is» — dort bloss eine ungenaue Popover-Markierung, hier ein Link
// auf den FALSCHEN Paragraphen (§1). Verlinkt wird — wie beim Art.-Pfad — nur
// «§ N»; ein nachfolgender Passus bleibt Text.
const PARAGRAF_INTERN =
  /§\s*(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])/g;
// Was zu DEMSELBEN Zitat gehört und darum überlesen werden muss, bevor das
// Fremd-Signal geprüft wird: Passus-Glieder («Abs. 2», «Absatz 2 Buchstabe a»)
// und Aufzählungen/Bereiche («§ 19 bis 21», «§ 4 und 5»). Ohne diesen Schritt
// stünde bei «§ 19 bis 21 der Verordnung über …» nach dem Treffer « bis 21 …»,
// keine Fremd-Weiche griffe, und der fremde Verordnungs-§ bekäme einen Link auf
// den eigenen Erlass (echte Fundstelle, SO-615.11 § 50).
const PARAGRAF_ANHANG = new RegExp(
  '^(?:'
  + '\\s+(?:Abs(?:atz|ätze|\\.)|Buchstaben?|Bst\\.|lit\\.|Ziff(?:ern?|\\.)|Satz|Sätze)\\s*[0-9a-z]+(?:bis|ter)?'
  + '|\\s*(?:bis|und|oder|sowie|,|–|—|-)\\s*(?:§+\\s*)?\\d+(?:[a-z])?(?:bis|ter)?(?![0-9a-z])'
  + ')+',
);
// Fremd-Signal NACH dem Zitat. Zwei Formen, beide führen zu reinem TEXT: ein
// «StG» in BS ist nicht das «StG» in ZH, und ohne verifizierte Kantons-
// Auflösung ist jeder Link geraten (§1 — F42 ist nicht gebaut).
//
// (a) Ein GROSS beginnendes Wort direkt am Zitat. Der Art.-Pfad prüft hier auf
//     ein Kürzel-Muster (M12: zwei Grossbuchstaben); kantonal genügt das NICHT.
//     Kantone hängen den AUSGESCHRIEBENEN Erlassnamen an, und der trägt genau
//     EINEN Grossbuchstaben: «§ 8 Abs. 3 Integrationsgesetz», «§ 24
//     Schullaufbahnverordnung», «§ 15 Abs. 1 lit. g Bestattungsgesetz».
//     GEMESSEN 31.8.2026 über alle 775 §-Erlasse: 122 der sonst erzeugten 3389
//     Self-Links tragen ein solches Grosswort, und die Stichprobe daraus ist
//     ganz überwiegend FREMD (Integrations-, Publikations-, Lohn-, Personal-,
//     Heilmittel- … -gesetz/-verordnung). Einen Satz-ANFANG trifft die Regel
//     nicht — dort steht die Interpunktion vor dem Leerzeichen. Der Preis sind
//     die wenigen Fälle, in denen das Grosswort ein gewöhnliches Substantiv ist
//     («§§ 13–18 Pauschalgebühren festlegen»); bewusst bezahlt — kein Link ist
//     besser als ein falscher.
// (b) Der ausgeschriebene Erlassname in Präpositionsform, klein beginnend
//     («§§ 19 bis 21 der Verordnung über …») — wie die bare-«des/der»-Weiche
//     des Art.-Pfads.
const PARAGRAF_FREMD_GROSS = /^\s+[A-ZÄÖÜ]/;
const PARAGRAF_FREMD_NAME = /^\s+(?:des|der|über|vom)\b/;

function restMitIntern(s: string, key: string, intern?: InternRefs): React.ReactNode {
  if (!intern || !s) return s ? <RechtsprechungText key={key} text={s} /> : null;
  // N2 (Bündel N): Kürzel DIESES Erlasses (aus dem Lese-Basispfad, «…/bund/AHVV»
  // → «AHVV») — nennt ein Verweis exakt das eigene Kürzel, ist es ein echter
  // Self-Verweis und bleibt verlinkt; ein FREMDES Kürzel unterdrückt den Link.
  // Normalisiert (nur A–Z0–9): der Register-Schlüssel trägt «_» (FINFRAV_FINMA),
  // der FEDLEX-Key «-» (FinfraV-FINMA) — ohne Normalisierung würde ein Gesetz mit
  // getrenntem Kürzel den eigenen Self-Verweis fälschlich unterdrücken (QS-GP-Fund
  // 1.7.: FinfraV-FINMA art_50a, betrifft alle 6 getrennt-benannten Kind-Erlasse).
  const kuerzelKanon = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const eigenesKuerzel = kuerzelKanon(intern.basisPfad.split('/').pop() ?? '');
  // A10 (Plural-Linker, David 5.7.2026): «in den Artikeln 31 …, 35 … und 45 …» —
  // jedes Glied EINZELN verlinken. Die Regionen werden VOR dem Singular-Lauf
  // erhoben; ART_INTERN-Treffer, die in eine Region fallen (der Öffner «die
  // Artikel 22» enthält ein Singular-Match), werden übersprungen. Auflösung je
  // Glied: fremd (Gesetz-Signal am Ende, inkl. Genitiv-Map) → NormChip aufs
  // Fremdgesetz; eigenes Kürzel oder kein Signal → Self-Sprung über die tokenMap
  // (nur existierende Token, §8); unterdrückte Regionen bleiben reiner Text (§1).
  // §-designierter Erlass? Schaltet BEIDE Kantons-Regeln (Herleitung an
  // `InternRefs.paragrafDesigniert`): F41 sperrt den bare-«Art. N»-Self-Sprung
  // (Singular wie Plural-Glied), F40 öffnet den «§ N»-Self-Sprung. Die
  // FREMD-Pfade (N2b-Routing, Fremdgesetz-Chapeau) bleiben unberührt — sie
  // zeigen ohnehin nie auf den eigenen Erlass.
  const paragrafErlass = intern.paragrafDesigniert === true;
  const pluralRegionen = artikelnPluralVerweise(s);
  const inPluralRegion = (idx: number) =>
    pluralRegionen.some((r) => idx >= r.oeffnerStart && idx < r.end);
  const out: React.ReactNode[] = [];
  let last = 0;
  // Verlinkbare Spans (Singular + Plural-Glieder) einsammeln, dann in Text-
  // Reihenfolge mit Zwischenstücken emittieren.
  const linkSpans: { start: number; end: number; node: React.ReactNode }[] = [];
  for (const r of pluralRegionen) {
    if (r.unterdruecken) continue;
    // Fremd-Ziel = eigener Erlass ⇒ Self-Pfad (wie N2: eigenes Kürzel ist kein
    // Fremdgesetz — der In-Reader-Sprung ist die etablierte Self-Darstellung).
    const fremdEffektiv = r.fremd && kuerzelKanon(r.fremd) !== eigenesKuerzel ? r.fremd : null;
    for (const g of r.glieder) {
      const gk = `${key}-p${g.start}`;
      if (fremdEffektiv) {
        linkSpans.push({
          start: g.start, end: g.end,
          node: <NormChip key={gk} artikel={`Art. ${g.roh} ${fremdEffektiv}`} anzeige={g.roh} linkClass={INLINE_CLASS} zielIntern={false} />,
        });
      } else if (intern.fremdKuerzel) {
        // M6-D: bare Plural-Glied im Fremdgesetz-Chapeau → aufs Zielgesetz (NormChip).
        linkSpans.push({
          start: g.start, end: g.end,
          node: <NormChip key={gk} artikel={`Art. ${g.roh} ${intern.fremdKuerzel}`} anzeige={g.roh} linkClass={INLINE_CLASS} zielIntern={false} />,
        });
      } else {
        if (paragrafErlass) continue; // F41
        const token = intern.tokenMap.get(normRef(g.roh));
        if (!token) continue; // kein Artikel dieses Erlasses → Text belassen (§8)
        linkSpans.push({
          start: g.start, end: g.end,
          node: (
            <a key={gk} href={`${intern.basisPfad}#art-${token}`}
              onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
              className={INLINE_CLASS}>{g.roh}</a>
          ),
        });
      }
    }
  }
  // F40: «§ N»-Selbstverweise. NUR in §-designierten Erlassen — dort ist «§ N»
  // die eigene Bestimmung (Drafting-Konvention des Kantons), und die tokenMap
  // trägt genau deren Token. Sie reisen im SELBEN Span-Kanal wie die
  // Plural-Glieder (unten in Text-Reihenfolge emittiert), damit es nur EINE
  // Zusammensetz-Maschinerie gibt.
  if (paragrafErlass) {
    for (const m of s.matchAll(PARAGRAF_INTERN)) {
      const start = m.index, end = start + m[0].length;
      if (inPluralRegion(start)) continue; // gehört zu einer «die Artikel …»-Region
      // Erst den Rest DESSELBEN Zitats überlesen (Passus, Aufzählung), dann das
      // Fremd-Signal prüfen ⇒ bei Treffer reiner Text (§1: kein geratener Link).
      const rest = s.slice(end).replace(PARAGRAF_ANHANG, '');
      if (PARAGRAF_FREMD_GROSS.test(rest) || PARAGRAF_FREMD_NAME.test(rest)) continue;
      const token = intern.tokenMap.get(normRef(m[1]));
      if (!token) continue; // keine solche Bestimmung in diesem Erlass → Text (§8)
      linkSpans.push({
        start, end,
        node: (
          <a key={`${key}-s${start}`} href={`${intern.basisPfad}#art-${token}`}
            onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
            className={INLINE_CLASS}>{m[0]}</a>
        ),
      });
    }
    // Die Plural-Glieder kamen in Text-Reihenfolge, die §-Treffer angehängt —
    // der Cursor unten setzt Sortierung voraus. Überlappungen sind nach
    // `inPluralRegion` keine mehr zu erwarten; `emitPluralBis` verwirft sie
    // ohnehin (`sp.start < last`).
    linkSpans.sort((a, b) => a.start - b.start);
  }
  // Plural-Glieder-Spans in Text-Reihenfolge VOR der jeweils nächsten Singular-
  // Emission ausgeben (ein Cursor über linkSpans; Spans in schon konsumierten
  // N2b-Regionen werden verworfen).
  let pq = 0;
  const emitPluralBis = (pos: number) => {
    while (pq < linkSpans.length && linkSpans[pq].start < pos) {
      const sp = linkSpans[pq++];
      if (sp.start < last) continue; // von einer N2b-Region konsumiert
      if (sp.start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, sp.start)} />);
      out.push(sp.node);
      last = sp.end;
    }
  };
  for (const m of s.matchAll(ART_INTERN)) {
    // Von einer bereits verbrauchten Fremd-Region übersprungen (N2b konsumiert die
    // ganze «Artikel N … (KÜRZEL)»-Einheit; ein späterer Treffer darin entfällt).
    if (m.index < last) continue;
    // In einer Plural-Region (A10): die Glieder-Spans oben decken sie ab.
    if (inPluralRegion(m.index)) continue;
    emitPluralBis(m.index);
    const start = m.index;
    const rest = s.slice(start + m[0].length);
    // N2b (Bug David 4.7.2026): AUSGESCHRIEBENES Fremdgesetz mit Klammer-Kürzel
    // («Artikel 66a oder 66abis des Strafgesetzbuchs (StGB) …»). Jede genannte
    // Nummer — die erste UND jedes Aufzählungs-Glied — wird EINZELN auf das
    // Fremdgesetz geroutet (NormChip: In-Reader-Popover, wenn der Erlass im Korpus
    // ist, sonst Fedlex-Deep-Link; unbekanntes Kürzel → reiner Text). Das
    // deterministische Signal ist das «(KÜRZEL)» in der Klammer (§1, kein Raten).
    // Kein Prädikat hier → optimistische Verlinkung (etablierte Fremdverweis-
    // Darstellung, wie NORM_IM_TEXT-Treffer); die Existenz gegen den Ziel-Erlass
    // prüft das Popover beim Öffnen. Läuft VOR der Self-Link-Logik, damit «Artikel
    // 49a … (MStG)» nie fälschlich auf den eigenen Erlass (AIG art_49_a) zeigt.
    const routing = fremdRoutingFormB(rest, m[1]);
    if (routing) {
      if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
      let cur = 0; // Cursor im rest-Text
      for (const g of routing.glieder) {
        const anzeige = g.erst ? m[0] : g.roh;
        const gk = g.erst ? `${key}-f${start}` : `${key}-f${start}-${g.start}`;
        if (!g.erst && g.start > cur) out.push(<RechtsprechungText key={`${key}-rg${start}-${cur}`} text={rest.slice(cur, g.start)} />);
        out.push(g.linkbar
          ? <NormChip key={gk} artikel={g.artikel} anzeige={anzeige} linkClass={INLINE_CLASS} zielIntern={false} />
          : <RechtsprechungText key={`${gk}-t`} text={anzeige} />);
        if (!g.erst) cur = g.end;
      }
      if (cur < routing.regionEnd) out.push(<RechtsprechungText key={`${key}-rt${start}`} text={rest.slice(cur, routing.regionEnd)} />);
      last = start + m[0].length + routing.regionEnd;
      continue;
    }
    // Bare «Art. N des/der/über/vom …» OHNE Klammer-Kürzel (N2b traf nicht): ein
    // benannter Fremderlass oder eine «des vorliegenden …»-Wendung — NIE ein Self-
    // Sprung (§1). Ersetzt den früheren ART_INTERN-Lookahead an Ort und Stelle,
    // aber ERST nach der N2b-Routing-Prüfung (sonst würde «Artikel 63 des OR (…)»
    // fälschlich unterdrückt statt geroutet). Fedlex-Kürzel-Fälle fängt zusätzlich
    // die N2-Prüfung unten; dieser Check deckt auch Nicht-FEDLEX-Namen («der
    // Verordnung») ab, die tokenMap sonst fälschlich self-verlinken würde.
    if (/^\s+(?:des|der|über|vom)\b/.test(rest)) continue;
    // N2 (Form A, ABGEKÜRZTE Kürzel-Form): Nennt der Verweis ein ANDERES
    // Bundesgesetz («Artikel 1a Absatz 1 Buchstabe c AHVG» in der AHVV → AHVG),
    // zeigt «Artikel N» auf JENES Gesetz; der interne Self-Link wäre falsch (§1) →
    // unterdrücken. Deterministisch aus der FEDLEX-Kürzelliste (§5). Ergänzt die
    // alte Sofort-Kürzel-Regel unten (die auch Nicht-FEDLEX-Kürzel fängt), fängt
    // aber die ausgeschriebene Passus-Form. (Aktives Routing der bare-Kürzel-Form
    // bleibt bewusst zurückgestellt — der Kontrakt hier ist Unterdrückung.)
    const fremd = fremdgesetzNachArtikel(rest);
    if (fremd && kuerzelKanon(fremd) !== eigenesKuerzel) continue;
    // M12 (§1/§6): Folgt dem bare «Art./Artikel N» ein Gesetzes-KÜRZEL (≥2 Gross-
    // buchstaben, z.B. «Artikel 64 BGG», «Art. 5 VwVG»), ist es ein Verweis auf
    // ein ANDERES Gesetz (in Verordnungen meist das Trägergesetz) — NICHT auf
    // diesen Erlass. Der interne Self-Sprunglink wäre dann falsch (empirisch
    // BGerR: «Artikel N BGG» zeigte auf BGerR art_N statt BGG). NORM_IM_TEXT
    // erfasst die ausgeschriebene «Artikel»-Form (noch) nicht; bis das verifizierte
    // Trägergesetz-Routing als eigene Datenaufgabe steht, wird der falsche Self-
    // Link UNTERDRÜCKT (lieber kein Link als ein plausibel-falscher, §1/§6,
    // David-Entscheid 28.6.). «Absatz/Buchstabe/Ziffer» (EIN Grossbuchstabe)
    // bleiben unberührt → echte Self-Verweise («Artikel 6 Absatz 2») weiter verlinkt.
    if (/^\s+(?:[A-ZÄÖÜ]{2,}|[A-ZÄÖÜ][a-zäöü]*[A-ZÄÖÜ]\w*)/.test(rest)) continue;
    // M6-D: Fremdgesetz-Chapeau → bare «Art. N» zeigt aufs Zielgesetz (nicht Self).
    // NormChip trägt die Auflösung (Korpus-Popover / Fedlex-Fallback / Text bei
    // unbekanntem Ziel) — dieselbe Kette wie ein voll zitierter Fremdverweis (§5).
    if (intern.fremdKuerzel) {
      if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
      out.push(<NormChip key={`${key}-x${start}`} artikel={`Art. ${m[1]} ${intern.fremdKuerzel}`} anzeige={m[0]} linkClass={INLINE_CLASS} zielIntern={false} />);
      last = start + m[0].length;
      continue;
    }
    // F41: §-designierter Erlass ⇒ kein bare-«Art. N»-Self-Sprung. Steht NACH
    // allen Fremd-Weichen, damit ein echtes Fremd-Routing (N2b, Chapeau) davon
    // unberührt bleibt — gesperrt ist nur der Sprung auf den EIGENEN Erlass.
    if (paragrafErlass) continue;
    const token = intern.tokenMap.get(normRef(m[1]));
    if (!token) continue; // kein Artikel dieses Erlasses → als Text belassen
    if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
    out.push(
      <a key={`${key}-a${start}`} href={`${intern.basisPfad}#art-${token}`}
        onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
        className={INLINE_CLASS}>{m[0]}</a>,
    );
    last = start + m[0].length;
  }
  emitPluralBis(s.length);
  if (last === 0) return <RechtsprechungText key={key} text={s} />;
  if (last < s.length) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last)} />);
  // key-tragendes Fragment: restMitIntern-Ergebnisse landen in NormTexts `teile`-
  // Array (siehe unten); ein bare <>…</> dort löst die React-key-Warnung aus.
  return <Fragment key={key}>{out}</Fragment>;
}

/** Fliesstext mit verlinkten Norm- UND Rechtsprechungs-Verweisen — Text bleibt
 *  zeichenidentisch (nur Anker-Hüllen kommen hinzu). `intern` (nur Lesesicht)
 *  macht bare Artikelverweise auf denselben Erlass zu Sprung-Links. */
export function NormText({ text, intern }: { text: string; intern?: InternRefs }) {
  // EINE Wahrheit der Verweis-/Ketten-Regel: normVerweiseImText (fedlex.ts)
  // liefert die voll zitierten Anker UND die per «i.V.m.»-Kette propagierten
  // bare Glieder. Für Nicht-Ketten-Text ist die Anker-Menge identisch zum
  // früheren matchAll(NORM_IM_TEXT)-Lauf (additiv, §6).
  const spans = normVerweiseImText(text);
  // Kein Norm-Treffer → ganzer Text durch die Rest-Pipeline (ohne intern reiner
  // Pass-Through durch RechtsprechungText, zeichenidentisch wie bisher).
  if (spans.length === 0) return intern ? <>{restMitIntern(text, 'r0', intern)}</> : <RechtsprechungText text={text} />;
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const s of spans) {
    if (s.start > zuletzt) teile.push(restMitIntern(text.slice(zuletzt, s.start), `r${zuletzt}`, intern));
    // Anker: anzeige === artikel → `anzeige` weglassen (SSR-byte-identisch zum
    // früheren <NormChip artikel={roh}>). Propagiertes Glied: Anzeige = reiner
    // Glied-Text (zeichenidentisch, §1), Auflösung über das synthetisierte Ziel.
    teile.push(
      <NormChip key={`${s.start}-${s.artikel}`} artikel={s.artikel}
        anzeige={s.propagiert ? s.anzeige : undefined} linkClass={INLINE_CLASS} zielIntern={false} />,
    );
    zuletzt = s.end;
  }
  if (zuletzt < text.length) teile.push(restMitIntern(text.slice(zuletzt), `r${zuletzt}`, intern));
  return <>{teile}</>;
}
