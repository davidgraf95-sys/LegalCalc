// ─── check:verweis-inventar — Verweis-Inventar des Normtext-Korpus (V-1) ─────
//
// Anlass: Auftrag David 31.8.2026 (Verweis-Schärfe), Fahrplan
// `fahrplaene/FAHRPLAN-VERWEIS-SCHAERFE.md` §1 · V-1. Bis hierher existierte
// KEINE Messung, wie viele Verweis-Stellen der Korpus trägt und wie sie
// aufgelöst werden — die einzigen Zahlen standen als Kommentar in
// `NormText.tsx` (F41: «199 Self-Links») und in einem datierten Messbericht
// (`bibliothek/normtext/verweis-inventar-messung-2026-08-31.md`). Kommentar-
// Zahlen altern still; dieses Tor ersetzt sie durch ein reproduzierbares,
// committetes Artefakt (`messwerte/verweis-inventar.json`).
//
// WAS GEMESSEN WIRD. Je Formklasse (= eine Stelle im Entscheidbaum, an der
// über Link/kein-Link entschieden wird): Zahl der Stellen, Zahl der Erlasse,
// der Entscheid (SELF / FREMD / TEXT) und die Zahl der Stellen mit explizitem
// SELBSTMARKER («dieses Gesetzes», «des vorliegenden Gesetzes» …). Dazu zwei
// Sonderlisten: tote Selbstziele (Selbstmarker-Verweis auf eine Bestimmung,
// die es im Erlass nicht gibt) und Zeit-Kanten-Stellen (Selbstmarker in
// Übergangs-/Altrecht-Kontext; nur Zählung, siehe V-5).
//
// ─── TRANSKRIPTION (§8-Offenlegung, bindend lesen) ──────────────────────────
//
// Die produktive Entscheidkette lebt in `restMitIntern`
// (`src/components/NormText.tsx`) und in `etabliertFremdgesetz`
// (`src/components/normtext/ArtikelBody.tsx`). Beide sind React-interne, NICHT
// exportierte Funktionen; V-1 darf keine der beiden Dateien anfassen. Das Tor
// arbeitet darum mit einer TRANSKRIPTION der Guards, nicht mit dem Original:
//
//   · Die ERKENNER sind die echten Produktions-Funktionen (importiert):
//     normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
//     artikelnPluralVerweise, chapeauZielFremdgesetz — keine zweite Regex-
//     Wahrheit über das, was ein Verweis IST (§5).
//   · Die GUARDS (ART_INTERN, PARAGRAF_INTERN, PARAGRAF_ANHANG,
//     PARAGRAF_FREMD_GROSS/-NAME, des/der-Guard, M12, normRef, kuerzelKanon,
//     etabliertFremdgesetz) sind hier als Zeichenketten transkribiert.
//   · Diese Zeichenketten sind zugleich (a) der Vergleichs-Massstab des
//     Wächters gegen den Quelltext UND (b) die Quelle der hier compilierten
//     RegExp (`re()` unten). Eine Transkription, die vom Original abweicht,
//     kann darum nicht still danebenliegen — sie reisst den Wächter.
//   · Zusätzlich hält das Artefakt den SHA-256 von `NormText.tsx`. Ändert
//     jemand die Datei (auch die Entscheid-REIHENFOLGE, die kein Literal-
//     Vergleich sieht), wird das Tor rot und verlangt eine bewusste
//     Regeneration der Basislinie.
//
// GRENZEN (§8, nicht wegglätten):
//   · Gemessen wird die Transkription, nicht das React-Rendering.
//   · Text-Umfang = `bloecke[].text` und `bloecke[].items[].text` aller
//     Snapshots. Präambel/Ingress (ErlassKopfBlock), Tabellen- und Bild-
//     Sonderpfade sind NICHT enthalten.
//   · Der Kontext ist der des Lesers (`useInternRefs`): tokenMap aus den
//     Snapshot-Artikeln, `paragrafDesigniert` aus GRUNDART_SEED,
//     `eigenesKuerzel` aus dem Register-Key. Der Chapeau-Kontext
//     (M6/M6-D, ArtikelBody) ist für Items nachgebildet.
//   · SELBSTMARKER ist ein EIGENER Inventar-Detektor (kein Produktions-Guard —
//     heute reagiert die Produktion auf Selbstmarker gar nicht; genau das ist
//     V-2). Er läuft nur an SINGULÄREN «Art. N»/«§ N»-Stellen, nicht an
//     Plural-Regionen.
//   · Zeit-Kante = Kontext-INDIZ (Randtitel «Übergangs…» bzw. Altrecht-Wendung
//     im Block), keine rechtliche Klassifikation.
//
// BASISLINIEN-MODELL (Vorbild `check:ui-normzitate`): das Artefakt ist
// committet; das Tor rechnet neu und vergleicht. Jede Abweichung ist ROT.
// Bewusste Änderungen (Korpus-Nachzug, Erkenner-Umbau, V-2/V-3) regenerieren
// das Artefakt IM SELBEN Commit:
//
//   npm run check:verweis-inventar -- --schreiben
//
// Determinismus (§2): keine Zeitstempel im Artefakt, stabile Sortierung
// (Klassen alphabetisch, Sonderlisten nach Fundstelle).
//
// Scheiterns-Fähigkeit (§6.7): ein Selbsttest jagt bei JEDEM Lauf sechs
// synthetische Texte durch dieselbe Pipeline und prüft die erwartete
// Klassenzuordnung; stimmt eine nicht, bricht das Tor sich selbst ab.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import {
  normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
  artikelnPluralVerweise, chapeauZielFremdgesetz,
} from '../src/lib/fedlex';
import { GRUNDART_SEED } from '../src/lib/normtext/grundart.generated';

const WURZEL = process.cwd();
const ARTEFAKT_PFAD = join(WURZEL, 'messwerte', 'verweis-inventar.json');
const NORMTEXT_PFAD = join(WURZEL, 'src', 'components', 'NormText.tsx');
const ARTIKELBODY_PFAD = join(WURZEL, 'src', 'components', 'normtext', 'ArtikelBody.tsx');
const REGISTER_PFAD = join(WURZEL, 'public', 'normtext', 'register.json');
const SNAPSHOT_WURZEL = join(WURZEL, 'public', 'normtext');

// ─── 1 · Transkribierte Guards (Wächter-Massstab UND Compile-Quelle) ────────
//
// Jede Zeichenkette steht ZEICHENGLEICH in der genannten Quelldatei. `datei`
// sagt, wo; `zweck` sagt, welcher Guard. Ein Eintrag mit `stringLiteral: true`
// ist im Quelltext ein JS-String-Literal (einfache Anführungszeichen), kein
// RegExp-Literal — sein Muster wird über `jsStringLiteral()` gewonnen.

interface GuardQuelle {
  zweck: string;
  datei: 'NormText.tsx' | 'ArtikelBody.tsx';
  literal: string;
  stringLiteral?: true;
}

const G = {
  ART_INTERN: {
    zweck: 'ART_INTERN — bare «Art./Artikel N»',
    datei: 'NormText.tsx',
    literal: String.raw`/\bArt(?:\.|ikel)\s+(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])/g`,
  },
  PARAGRAF_INTERN: {
    zweck: 'PARAGRAF_INTERN — «§ N» (F40)',
    datei: 'NormText.tsx',
    literal: String.raw`/§\s*(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])/g`,
  },
  PARAGRAF_ANHANG_1: {
    zweck: 'PARAGRAF_ANHANG Fragment 1/4',
    datei: 'NormText.tsx',
    literal: String.raw`'^(?:'`,
    stringLiteral: true as const,
  },
  PARAGRAF_ANHANG_2: {
    zweck: 'PARAGRAF_ANHANG Fragment 2/4 (Passus-Glieder)',
    datei: 'NormText.tsx',
    literal: String.raw`'\\s+(?:Abs(?:atz|ätze|\\.)|Buchstaben?|Bst\\.|lit\\.|Ziff(?:ern?|\\.)|Satz|Sätze)\\s*[0-9a-z]+(?:bis|ter)?'`,
    stringLiteral: true as const,
  },
  PARAGRAF_ANHANG_3: {
    zweck: 'PARAGRAF_ANHANG Fragment 3/4 (Aufzählung/Bereich)',
    datei: 'NormText.tsx',
    literal: String.raw`'|\\s*(?:bis|und|oder|sowie|,|–|—|-)\\s*(?:§+\\s*)?\\d+(?:[a-z])?(?:bis|ter)?(?![0-9a-z])'`,
    stringLiteral: true as const,
  },
  PARAGRAF_ANHANG_4: {
    zweck: 'PARAGRAF_ANHANG Fragment 4/4',
    datei: 'NormText.tsx',
    literal: String.raw`')+'`,
    stringLiteral: true as const,
  },
  PARAGRAF_FREMD_GROSS: {
    zweck: 'PARAGRAF_FREMD_GROSS — Grosswort am §-Zitat',
    datei: 'NormText.tsx',
    literal: String.raw`/^\s+[A-ZÄÖÜ]/`,
  },
  PARAGRAF_FREMD_NAME: {
    zweck: 'PARAGRAF_FREMD_NAME / des-der-Guard (identisches Literal, zwei Fundstellen)',
    datei: 'NormText.tsx',
    literal: String.raw`/^\s+(?:des|der|über|vom)\b/`,
  },
  M12: {
    zweck: 'M12 — Gesetzes-Kürzel nach bare «Art. N»',
    datei: 'NormText.tsx',
    literal: String.raw`/^\s+(?:[A-ZÄÖÜ]{2,}|[A-ZÄÖÜ][a-zäöü]*[A-ZÄÖÜ]\w*)/`,
  },
  NORM_REF: {
    zweck: 'normRef — Ref-Normalisierung für die tokenMap',
    datei: 'NormText.tsx',
    literal: String.raw`s.toLowerCase().replace(/[^a-z0-9]/g, '')`,
  },
  KUERZEL_KANON: {
    zweck: 'kuerzelKanon — Kürzel-Normalisierung (eigenes vs. fremdes Kürzel)',
    datei: 'NormText.tsx',
    literal: String.raw`s.toUpperCase().replace(/[^A-Z0-9]/g, '')`,
  },
  CHAPEAU_DOPPELPUNKT: {
    zweck: 'etabliertFremdgesetz — Doppelpunkt am Chapeau-Ende (M6)',
    datei: 'ArtikelBody.tsx',
    literal: String.raw`/:\s*$/`,
  },
  CHAPEAU_BESTIMMUNGEN: {
    zweck: 'etabliertFremdgesetz — «Bestimmungen des/der …» (M6)',
    datei: 'ArtikelBody.tsx',
    literal: String.raw`/\bBestimmungen\s+(?:des|der)\b/i`,
  },
  CHAPEAU_EIGEN: {
    zweck: 'etabliertFremdgesetz — Kanonisierung des eigenen Kürzels (M6)',
    datei: 'ArtikelBody.tsx',
    literal: String.raw`(eigenesKuerzel ?? '').toUpperCase().replace(/[^A-ZÄÖÜ]/g, '')`,
  },
  CHAPEAU_KUERZEL: {
    zweck: 'etabliertFremdgesetz — Kürzel-Kandidat im Chapeau (M6)',
    datei: 'ArtikelBody.tsx',
    literal: String.raw`/\b([A-ZÄÖÜ]{2,8})\b/g`,
  },
} satisfies Record<string, GuardQuelle>;

/** `/muster/flags` → RegExp. Nur für die RegExp-Literale oben. */
function re(literal: string): RegExp {
  const m = /^\/(.*)\/([a-z]*)$/s.exec(literal);
  if (!m) throw new Error(`Kein RegExp-Literal: ${literal}`);
  return new RegExp(m[1], m[2]);
}

/**
 * JS-String-Literal (einfache Anführungszeichen) → sein Wert. Mechanisch über
 * JSON.parse: die vier PARAGRAF_ANHANG-Fragmente enthalten kein `"`, darum ist
 * das Umsetzen der äusseren Quotes verlustfrei. So bleibt die transkribierte
 * Zeichenkette EIN Wert für Wächter und Compile.
 */
function jsStringLiteral(literal: string): string {
  return JSON.parse(`"${literal.slice(1, -1)}"`) as string;
}

const ART_INTERN = re(G.ART_INTERN.literal);
const PARAGRAF_INTERN = re(G.PARAGRAF_INTERN.literal);
const PARAGRAF_ANHANG = new RegExp(
  jsStringLiteral(G.PARAGRAF_ANHANG_1.literal)
  + jsStringLiteral(G.PARAGRAF_ANHANG_2.literal)
  + jsStringLiteral(G.PARAGRAF_ANHANG_3.literal)
  + jsStringLiteral(G.PARAGRAF_ANHANG_4.literal),
);
const PARAGRAF_FREMD_GROSS = re(G.PARAGRAF_FREMD_GROSS.literal);
const PARAGRAF_FREMD_NAME = re(G.PARAGRAF_FREMD_NAME.literal);
const DES_DER_GUARD = re(G.PARAGRAF_FREMD_NAME.literal); // identisches Literal
const M12 = re(G.M12.literal);

const normRef = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const kuerzelKanon = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Transkription von `etabliertFremdgesetz` (ArtikelBody.tsx, M6). */
function etabliertFremdgesetz(absatzText: string, eigenesKuerzel?: string): boolean {
  const t = absatzText.trim();
  if (!re(G.CHAPEAU_DOPPELPUNKT.literal).test(t)) return false;
  if (!re(G.CHAPEAU_BESTIMMUNGEN.literal).test(t)) return false;
  const eigen = (eigenesKuerzel ?? '').toUpperCase().replace(/[^A-ZÄÖÜ]/g, '');
  for (const m of t.matchAll(re(G.CHAPEAU_KUERZEL.literal) as RegExp & { global: true })) {
    if (m[1].toUpperCase() !== eigen) return true;
  }
  return false;
}

/** Glättung des Lese-Pfads (ArtikelBody `glaetteInterpunktion`) — verschiebt
 *  Offsets und muss darum VOR der Messung laufen, wie in der Produktion. */
const glaetteInterpunktion = (s: string): string => s.replace(/ +([.,])/g, '$1');

// ─── 2 · Eigener Inventar-Detektor: SELBSTMARKER ────────────────────────────
//
// KEIN Produktions-Guard (§8): heute reagiert die Produktion auf einen
// Selbstmarker nicht — genau das ist der Befund, den V-2 abräumt. Der Detektor
// liest den Text UNMITTELBAR nach dem Zitat (Passus-Schwanz überlesen) und
// verlangt eine explizite Selbst-Wendung.
const PASSUS_SCHWANZ = /^(?:\s*(?:Abs(?:atz|ätze|\.)|Buchstaben?|Bst\.|lit\.|Ziff(?:ern?|\.)|Satz|Sätze)\s*[0-9a-z]+(?:bis|ter|quater|quinquies|sexies)?)*/;
const SELBSTMARKER = new RegExp(
  '^\\s*(?:dieses|dieser|des\\s+vorliegenden|der\\s+vorliegenden)\\s+'
  + '(?:Gesetzes|Bundesgesetzes|Gesetzbuchs|Gesetzbuches|Dekrets|Dekretes|Beschlusses'
  + '|Reglements|Reglementes|Erlasses|Vertrags|Vertrages|Übereinkommens|Konkordats'
  + '|Verordnung|Vereinbarung|Verfassung|Ordnung|Satzung|Richtlinie)\\b',
);

function selbstmarkerNach(restNachZitat: string): boolean {
  return SELBSTMARKER.test(restNachZitat.replace(PASSUS_SCHWANZ, ''));
}

// Zeit-Kante (V-5, nur Zählung): Randtitel-Indiz bzw. Altrecht-Wendung im Block.
const ZEIT_TITEL = /Übergangs/i;
const ZEIT_ALTRECHT = /\b(?:bisherige[nmrs]?\s+Recht|frühere[nmrs]?\s+Recht|altrechtlich)/i;

// ─── 3 · Klassifizierer (Transkription von restMitIntern) ───────────────────

type Entscheid = 'SELF' | 'FREMD' | 'TEXT';

/** Die Formklassen — je eine Stelle im Entscheidbaum. */
const KLASSEN: Record<string, { entscheid: Entscheid; was: string }> = {
  'anker-fedlex': { entscheid: 'FREMD', was: 'Voll zitierter Bund-Anker «Art. N GESETZ» (NORM_IM_TEXT)' },
  'anker-kette': { entscheid: 'FREMD', was: 'Ketten-Glied, Kürzel aus dem Anker-Ende propagiert (i.V.m.)' },
  'art-chapeau-fremd': { entscheid: 'FREMD', was: 'bare «Art. N» unter Fremdgesetz-Chapeau → Zielgesetz (M6-D)' },
  'art-desder-guard': { entscheid: 'TEXT', was: '«Art. N des/der/über/vom …» ohne Klammer-Kürzel' },
  'art-f41': { entscheid: 'TEXT', was: 'bare «Art. N» im §-designierten Erlass — Self-Sperre (F41)' },
  'art-kein-token': { entscheid: 'TEXT', was: 'bare «Art. N» — Bestimmung existiert im Erlass nicht' },
  'art-m12-kuerzel': { entscheid: 'TEXT', was: '«Art. N KÜRZEL» (unbekanntes Kürzel) — Self unterdrückt (M12)' },
  'art-n2-fremdkuerzel': { entscheid: 'TEXT', was: '«Art. N … FEDLEX-Kürzel» (N2 Form A) — Self unterdrückt' },
  'art-self': { entscheid: 'SELF', was: 'bare «Art. N» → Sprung im eigenen Erlass' },
  'm6-chapeau-unterdrueckt': { entscheid: 'TEXT', was: 'Zitat in Items unter unauflösbarem Fremdgesetz-Chapeau (M6)' },
  'n2b-glied': { entscheid: 'FREMD', was: 'Glied der Form B «Artikel N … des <Name> (KÜRZEL)»' },
  'n2b-glied-text': { entscheid: 'TEXT', was: 'Form-B-Glied ohne Ziel-Token (heute strukturell 0 — NormText übergibt kein Prädikat)' },
  'paragraf-fremd-grosswort': { entscheid: 'TEXT', was: '«§ N <Grosswort>» — Fremd-Indiz, kein Link' },
  'paragraf-fremd-name': { entscheid: 'TEXT', was: '«§ N des/der/über/vom …» — Fremd-Indiz, kein Link' },
  'paragraf-kein-token': { entscheid: 'TEXT', was: '«§ N» — Bestimmung existiert im Erlass nicht' },
  'paragraf-self': { entscheid: 'SELF', was: '«§ N» → Sprung im eigenen Erlass (F40)' },
  'plural-glied-chapeau': { entscheid: 'FREMD', was: 'A10-Glied unter Fremdgesetz-Chapeau → Zielgesetz' },
  'plural-glied-f41': { entscheid: 'TEXT', was: 'A10-Glied im §-designierten Erlass — Self-Sperre (F41)' },
  'plural-glied-fremd': { entscheid: 'FREMD', was: 'A10-Glied mit aufgelöstem Fremdgesetz-Signal' },
  'plural-glied-kein-token': { entscheid: 'TEXT', was: 'A10-Glied — Bestimmung existiert im Erlass nicht' },
  'plural-glied-self': { entscheid: 'SELF', was: 'A10-Glied → Sprung im eigenen Erlass' },
  'plural-region-unterdrueckt': { entscheid: 'TEXT', was: 'A10-Region mit unauflösbarem Fremdnamen — ganz unterdrückt' },
};

interface Ctx {
  tokenMap: Map<string, string>;
  eigenesKuerzel: string;
  paragrafDesigniert: boolean;
  fremdKuerzel?: string;
}

interface Stelle {
  klasse: string;
  nummer: string | null;
  selbstmarker: boolean;
  /** Selbstmarker, aber die genannte Bestimmung gibt es im Erlass nicht. */
  totesZiel: boolean;
}

const stelle = (klasse: string, nummer: string | null, ctx: Ctx, selbstmarker = false): Stelle => ({
  klasse,
  nummer,
  selbstmarker,
  totesZiel:
    selbstmarker && !ctx.fremdKuerzel && ctx.tokenMap.size > 0 && nummer != null
    && !ctx.tokenMap.has(normRef(nummer)),
});

/** Transkription von `restMitIntern` — zählt statt zu rendern. */
function restStellen(s: string, ctx: Ctx): Stelle[] {
  if (!s) return [];
  const out: Stelle[] = [];
  const paragrafErlass = ctx.paragrafDesigniert;
  const pluralRegionen = artikelnPluralVerweise(s);
  const inPluralRegion = (idx: number) =>
    pluralRegionen.some((r) => idx >= r.oeffnerStart && idx < r.end);

  // Spans, die in der Produktion in `linkSpans` landen (und darum vom
  // `last`-Cursor verworfen werden können) — getrennt von den Text-Ausgängen,
  // die sofort feststehen.
  const linkSpans: { start: number; end: number; s: Stelle }[] = [];
  const textStellen: Stelle[] = [];

  for (const r of pluralRegionen) {
    if (r.unterdruecken) {
      for (const g of r.glieder) textStellen.push(stelle('plural-region-unterdrueckt', g.roh, ctx));
      continue;
    }
    const fremdEffektiv = r.fremd && kuerzelKanon(r.fremd) !== ctx.eigenesKuerzel ? r.fremd : null;
    for (const g of r.glieder) {
      if (fremdEffektiv) {
        linkSpans.push({ start: g.start, end: g.end, s: stelle('plural-glied-fremd', g.roh, ctx) });
      } else if (ctx.fremdKuerzel) {
        linkSpans.push({ start: g.start, end: g.end, s: stelle('plural-glied-chapeau', g.roh, ctx) });
      } else {
        if (paragrafErlass) { textStellen.push(stelle('plural-glied-f41', g.roh, ctx)); continue; }
        const token = ctx.tokenMap.get(normRef(g.roh));
        if (!token) { textStellen.push(stelle('plural-glied-kein-token', g.roh, ctx)); continue; }
        linkSpans.push({ start: g.start, end: g.end, s: stelle('plural-glied-self', g.roh, ctx) });
      }
    }
  }

  if (paragrafErlass) {
    for (const m of s.matchAll(PARAGRAF_INTERN)) {
      const start = m.index, end = start + m[0].length;
      if (inPluralRegion(start)) continue;
      const nach = s.slice(end);
      const sm = selbstmarkerNach(nach);
      const rest = nach.replace(PARAGRAF_ANHANG, '');
      // Produktion prüft beide Fremd-Signale in EINER Bedingung; hier getrennt
      // gezählt — der Entscheid (TEXT) ist in beiden Zweigen derselbe.
      if (PARAGRAF_FREMD_GROSS.test(rest)) { textStellen.push(stelle('paragraf-fremd-grosswort', m[1], ctx, sm)); continue; }
      if (PARAGRAF_FREMD_NAME.test(rest)) { textStellen.push(stelle('paragraf-fremd-name', m[1], ctx, sm)); continue; }
      const token = ctx.tokenMap.get(normRef(m[1]));
      if (!token) { textStellen.push(stelle('paragraf-kein-token', m[1], ctx, sm)); continue; }
      linkSpans.push({ start, end, s: stelle('paragraf-self', m[1], ctx, sm) });
    }
    linkSpans.sort((a, b) => a.start - b.start);
  }

  let last = 0;
  let pq = 0;
  const emitPluralBis = (pos: number) => {
    while (pq < linkSpans.length && linkSpans[pq].start < pos) {
      const sp = linkSpans[pq++];
      if (sp.start < last) continue; // von einer N2b-Region konsumiert
      out.push(sp.s);
      last = sp.end;
    }
  };

  for (const m of s.matchAll(ART_INTERN)) {
    if (m.index < last) continue;
    if (inPluralRegion(m.index)) continue;
    emitPluralBis(m.index);
    const start = m.index;
    const rest = s.slice(start + m[0].length);
    const sm = selbstmarkerNach(rest);
    const routing = fremdRoutingFormB(rest, m[1]);
    if (routing) {
      for (const g of routing.glieder) {
        out.push(stelle(g.linkbar ? 'n2b-glied' : 'n2b-glied-text', g.roh, ctx));
      }
      last = start + m[0].length + routing.regionEnd;
      continue;
    }
    if (DES_DER_GUARD.test(rest)) { out.push(stelle('art-desder-guard', m[1], ctx, sm)); continue; }
    const fremd = fremdgesetzNachArtikel(rest);
    if (fremd && kuerzelKanon(fremd) !== ctx.eigenesKuerzel) { out.push(stelle('art-n2-fremdkuerzel', m[1], ctx, sm)); continue; }
    if (M12.test(rest)) { out.push(stelle('art-m12-kuerzel', m[1], ctx, sm)); continue; }
    if (ctx.fremdKuerzel) {
      out.push(stelle('art-chapeau-fremd', m[1], ctx, sm));
      last = start + m[0].length;
      continue;
    }
    if (paragrafErlass) { out.push(stelle('art-f41', m[1], ctx, sm)); continue; }
    const token = ctx.tokenMap.get(normRef(m[1]));
    if (!token) { out.push(stelle('art-kein-token', m[1], ctx, sm)); continue; }
    out.push(stelle('art-self', m[1], ctx, sm));
    last = start + m[0].length;
  }
  emitPluralBis(s.length);
  return [...out, ...textStellen];
}

/**
 * Ein Fliesstext-Stück wie NormText es sieht: erst die voll zitierten Anker
 * (normVerweiseImText), dann die Zwischenstücke durch die Guard-Kette.
 * `ctx === null` = M6-Fall (Items unter unauflösbarem Fremdgesetz-Chapeau):
 * die Produktion übergibt dort KEIN `intern`, die Guard-Kette läuft also gar
 * nicht — die bare Zitate sind vor jedem Entscheid unterdrückt.
 */
function stellenImText(text: string, ctx: Ctx | null, paragrafFuerM6: boolean): Stelle[] {
  const out: Stelle[] = [];
  const leer: Ctx = { tokenMap: new Map(), eigenesKuerzel: '', paragrafDesigniert: false };
  const rest = (s: string) => {
    if (ctx) { out.push(...restStellen(s, ctx)); return; }
    for (const m of s.matchAll(ART_INTERN)) out.push(stelle('m6-chapeau-unterdrueckt', m[1], leer));
    if (paragrafFuerM6) {
      for (const m of s.matchAll(PARAGRAF_INTERN)) out.push(stelle('m6-chapeau-unterdrueckt', m[1], leer));
    }
  };
  const spans = normVerweiseImText(text);
  if (spans.length === 0) { rest(text); return out; }
  let zuletzt = 0;
  for (const s of spans) {
    if (s.start > zuletzt) rest(text.slice(zuletzt, s.start));
    out.push(stelle(s.propagiert ? 'anker-kette' : 'anker-fedlex', null, ctx ?? leer));
    zuletzt = s.end;
  }
  if (zuletzt < text.length) rest(text.slice(zuletzt));
  return out;
}

// ─── 4 · Korpus-Lauf ────────────────────────────────────────────────────────

interface RegisterErlass {
  key: string; ebene: string; kuerzel: string; status: string; datei: string | null;
}
interface SnapshotBlock { text: string; items?: { text: string }[] }
interface SnapshotEintrag { id: string; artikel: string; titel?: string; bloecke?: SnapshotBlock[] }

interface KlassenZeile {
  klasse: string; entscheid: Entscheid; stellen: number; erlasse: number;
  selbstmarker: number; was: string;
}
interface TotesZiel { erlass: string; fundstelle: string; bestimmung: string }
interface Artefakt {
  _zweck: string;
  _regenerieren: string;
  _quellen: { normTextSha256: string; guards: number };
  korpus: { erlasse: number; eintraege: number; texte: number };
  gesamt: { stellen: number; self: number; fremd: number; text: number; selbstmarker: number };
  klassen: KlassenZeile[];
  toteSelbstziele: TotesZiel[];
  zeitKanten: { stellen: number; erlasse: number; uebergangsTitel: number; altrechtBlock: number };
}

function sha256(pfad: string): string {
  return createHash('sha256').update(readFileSync(pfad)).digest('hex');
}

function berechne(): Artefakt {
  const register = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as { erlasse: RegisterErlass[] };
  const erlasse = register.erlasse
    .filter((e) => e.status === 'snapshot' && e.datei)
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  const stellenJeKlasse = new Map<string, number>();
  const selbstJeKlasse = new Map<string, number>();
  const erlasseJeKlasse = new Map<string, Set<string>>();
  const toteSelbstziele: TotesZiel[] = [];
  const zeitErlasse = new Set<string>();
  let zeitStellen = 0, zeitTitel = 0, zeitAltrecht = 0;
  let eintraegeGesamt = 0, texteGesamt = 0;

  for (const e of erlasse) {
    const datei = join(SNAPSHOT_WURZEL, e.datei!);
    if (!existsSync(datei)) continue;
    const snap = JSON.parse(readFileSync(datei, 'utf8')) as { eintraege: SnapshotEintrag[] };
    const tokenMap = new Map<string, string>();
    for (const x of snap.eintraege) tokenMap.set(normRef(x.artikel), x.artikel);
    const leser: Ctx = {
      tokenMap,
      // Produktion: kuerzelKanon(basisPfad.split('/').pop()) — das letzte
      // Pfadsegment IST der Register-Key (erlassPfad baut es so).
      eigenesKuerzel: kuerzelKanon(e.key),
      paragrafDesigniert: GRUNDART_SEED[e.key]?.bestimmungsEtikett === 'paragraf',
    };

    for (const eintrag of snap.eintraege) {
      eintraegeGesamt += 1;
      const titelZeit = ZEIT_TITEL.test(eintrag.titel ?? '');
      for (const b of eintrag.bloecke ?? []) {
        const blockZeit = ZEIT_ALTRECHT.test(b.text ?? '');
        const fremdKey = chapeauZielFremdgesetz(b.text ?? '', e.kuerzel);
        const fremdItems = etabliertFremdgesetz(b.text ?? '', e.kuerzel);
        const itemCtx: Ctx | null = fremdKey
          ? { tokenMap: new Map(), eigenesKuerzel: '', paragrafDesigniert: false, fremdKuerzel: fremdKey }
          : fremdItems ? null : leser;

        const texte: { text: string; ctx: Ctx | null }[] = [{ text: b.text ?? '', ctx: leser }];
        for (const it of b.items ?? []) texte.push({ text: it.text ?? '', ctx: itemCtx });

        for (const t of texte) {
          if (!t.text) continue;
          texteGesamt += 1;
          const stellen = stellenImText(
            glaetteInterpunktion(t.text), t.ctx, leser.paragrafDesigniert,
          );
          for (const st of stellen) {
            stellenJeKlasse.set(st.klasse, (stellenJeKlasse.get(st.klasse) ?? 0) + 1);
            if (!erlasseJeKlasse.has(st.klasse)) erlasseJeKlasse.set(st.klasse, new Set());
            erlasseJeKlasse.get(st.klasse)!.add(e.key);
            if (st.selbstmarker) {
              selbstJeKlasse.set(st.klasse, (selbstJeKlasse.get(st.klasse) ?? 0) + 1);
              if (titelZeit || blockZeit) {
                zeitStellen += 1;
                zeitErlasse.add(e.key);
                if (titelZeit) zeitTitel += 1;
                if (blockZeit) zeitAltrecht += 1;
              }
            }
            if (st.totesZiel && st.nummer) {
              toteSelbstziele.push({ erlass: e.key, fundstelle: eintrag.id, bestimmung: st.nummer });
            }
          }
        }
      }
    }
  }

  const klassen: KlassenZeile[] = Object.keys(KLASSEN).sort().map((k) => ({
    klasse: k,
    entscheid: KLASSEN[k].entscheid,
    stellen: stellenJeKlasse.get(k) ?? 0,
    erlasse: erlasseJeKlasse.get(k)?.size ?? 0,
    selbstmarker: selbstJeKlasse.get(k) ?? 0,
    was: KLASSEN[k].was,
  }));
  const summe = (f: (z: KlassenZeile) => boolean) =>
    klassen.filter(f).reduce((a, z) => a + z.stellen, 0);

  return {
    _zweck:
      'Verweis-Inventar des Normtext-Korpus (V-1, W2·20-VERWEIS-SCHAERFE). Basislinie: '
      + 'jede Abweichung Artefakt ↔ Neuberechnung ist ROT. Erzeugung und Grenzen: '
      + 'scripts/check-verweis-inventar.ts (Kopf).',
    _regenerieren: 'npm run check:verweis-inventar -- --schreiben',
    _quellen: { normTextSha256: sha256(NORMTEXT_PFAD), guards: Object.keys(G).length },
    korpus: { erlasse: erlasse.length, eintraege: eintraegeGesamt, texte: texteGesamt },
    gesamt: {
      stellen: klassen.reduce((a, z) => a + z.stellen, 0),
      self: summe((z) => z.entscheid === 'SELF'),
      fremd: summe((z) => z.entscheid === 'FREMD'),
      text: summe((z) => z.entscheid === 'TEXT'),
      selbstmarker: klassen.reduce((a, z) => a + z.selbstmarker, 0),
    },
    klassen,
    toteSelbstziele: toteSelbstziele.sort((a, b) =>
      `${a.fundstelle}|${a.bestimmung}` < `${b.fundstelle}|${b.bestimmung}` ? -1
        : `${a.fundstelle}|${a.bestimmung}` > `${b.fundstelle}|${b.bestimmung}` ? 1 : 0),
    zeitKanten: {
      stellen: zeitStellen, erlasse: zeitErlasse.size,
      uebergangsTitel: zeitTitel, altrechtBlock: zeitAltrecht,
    },
  };
}

// ─── 5 · Wächter: Transkription ↔ Quelltext ─────────────────────────────────

/**
 * Was der Wächter im Quelltext SUCHT. Bei einem RegExp-Literal ist das das
 * MUSTER ohne Schrägstriche und Flags, sonst das Literal selbst.
 *
 * Warum nicht das ganze `/…/g`: gemessen 31.8.2026 an einem
 * verhaltensneutralen Umbau in `NormText.tsx` — dasselbe Muster wurde in eine
 * Konstante gehoben und zweimal instanziiert (`const ART_MUSTER = String.raw…;
 * new RegExp(ART_MUSTER, 'g')`), damit `matchAll` und die flag-lose
 * Nummern-Entnahme sich keinen `lastIndex` teilen. Das Muster blieb dabei
 * zeichengleich, das LITERAL verschwand — der Wächter hätte einen Fehlalarm
 * geschlagen und, schlimmer, den Blick auf die ECHTE Änderung derselben Datei
 * verstellt. Ein Wächter, der bei jeder Umstellung schreit, wird abgeschaltet.
 *
 * Die Flags fallen bewusst aus dem Vergleich: sie sind hier gesetzt (das Tor
 * compiliert aus dem eigenen Literal), und ein verlorenes `g` an einem
 * `matchAll`-Muster ist in der Produktion ein sofortiger TypeError, keine
 * stille Abweichung. Jede Änderung am MUSTER schlägt weiterhin durch.
 */
function suchtext(g: GuardQuelle): string {
  const m = /^\/(.*)\/([a-z]*)$/s.exec(g.literal);
  return g.stringLiteral || !m ? g.literal : m[1];
}

function waechterGuards(): string[] {
  const quelle: Record<string, string> = {
    'NormText.tsx': readFileSync(NORMTEXT_PFAD, 'utf8'),
    'ArtikelBody.tsx': readFileSync(ARTIKELBODY_PFAD, 'utf8'),
  };
  const fehler: string[] = [];
  for (const [name, g] of Object.entries(G) as [string, GuardQuelle][]) {
    if (!quelle[g.datei].includes(suchtext(g))) {
      fehler.push(`${name} (${g.zweck}): Muster steht NICHT mehr zeichengleich in ${g.datei} → ${suchtext(g)}`);
    }
  }
  return fehler;
}

// ─── 6 · Selbsttest (§6.7) ──────────────────────────────────────────────────

function selbsttest(): void {
  const artErlass: Ctx = {
    tokenMap: new Map([['5', '5'], ['12', '12']]),
    eigenesKuerzel: 'AHVG', paragrafDesigniert: false,
  };
  const parErlass: Ctx = {
    tokenMap: new Map([['19', '19']]),
    eigenesKuerzel: 'BS162100', paragrafDesigniert: true,
  };
  const proben: [string, Ctx | null, string, boolean][] = [
    // Text, Kontext, erwartete Klasse der ERSTEN Stelle, erwarteter Selbstmarker
    ['Massgeblich ist Art. 336c OR für diesen Fall.', artErlass, 'anker-fedlex', false],
    ['Die Frist nach Art. 5 beginnt zu laufen.', artErlass, 'art-self', false],
    ['Die Frist nach Art. 99 dieses Gesetzes beginnt.', artErlass, 'art-kein-token', true],
    ['Es gilt Art. 7 des Bundesgesetzes über die Sache.', artErlass, 'art-desder-guard', false],
    ['Es gilt § 19 Personalgesetz sinngemäss.', parErlass, 'paragraf-fremd-grosswort', false],
    ['Es gilt Art. 5 sinngemäss.', parErlass, 'art-f41', false],
  ];
  for (const [text, ctx, sollKlasse, sollSelbst] of proben) {
    const st = stellenImText(text, ctx, false);
    if (st.length === 0 || st[0].klasse !== sollKlasse || st[0].selbstmarker !== sollSelbst) {
      console.error(
        `check:verweis-inventar ROT (Selbsttest §6.7): «${text}» ergab `
        + `${st.length === 0 ? '<keine Stelle>' : `${st[0].klasse}/selbstmarker=${st[0].selbstmarker}`}`
        + `, erwartet ${sollKlasse}/selbstmarker=${sollSelbst} — der Klassifizierer misst nicht, was er messen soll.`,
      );
      process.exit(1);
    }
  }
  // Totes Selbstziel muss als solches erkannt werden (Sonderliste 1).
  const tot = stellenImText('Die Frist nach Art. 99 dieses Gesetzes beginnt.', artErlass, false);
  if (!tot[0].totesZiel) {
    console.error('check:verweis-inventar ROT (Selbsttest §6.7): totes Selbstziel «Art. 99 dieses Gesetzes» nicht erkannt.');
    process.exit(1);
  }
}

// ─── 7 · Lauf ───────────────────────────────────────────────────────────────

const schreiben = process.argv.includes('--schreiben');

const guardFehler = waechterGuards();
if (guardFehler.length > 0) {
  console.error(
    'check:verweis-inventar ROT — die transkribierten Guards weichen vom Quelltext ab.\n'
    + 'Das Tor misst dann etwas anderes als die Produktion tut. Transkription in\n'
    + 'scripts/check-verweis-inventar.ts (Abschnitt 1) nachziehen UND Basislinie neu schreiben:',
  );
  for (const f of guardFehler) console.error(`  · ${f}`);
  process.exit(1);
}

selbsttest();

const ist = berechne();
const alsText = `${JSON.stringify(ist, null, 2)}\n`;

if (schreiben) {
  writeFileSync(ARTEFAKT_PFAD, alsText);
  console.log(
    `Basislinie geschrieben: ${ist.gesamt.stellen} Stellen · ${ist.klassen.length} Klassen · `
    + `${ist.toteSelbstziele.length} tote Selbstziele → ${relative(WURZEL, ARTEFAKT_PFAD)}`,
  );
  process.exit(0);
}

if (!existsSync(ARTEFAKT_PFAD)) {
  console.error(
    `check:verweis-inventar ROT — Basislinie fehlt (${relative(WURZEL, ARTEFAKT_PFAD)}).\n`
    + '  Erzeugen: npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

const soll = JSON.parse(readFileSync(ARTEFAKT_PFAD, 'utf8')) as Artefakt;

console.log(
  `check:verweis-inventar — ${ist.korpus.erlasse} Erlasse · ${ist.korpus.eintraege} Bestimmungen · `
  + `${ist.gesamt.stellen} Verweis-Stellen (SELF ${ist.gesamt.self} · FREMD ${ist.gesamt.fremd} · `
  + `TEXT ${ist.gesamt.text}) · Selbstmarker ${ist.gesamt.selbstmarker} · `
  + `tote Selbstziele ${ist.toteSelbstziele.length} · Zeit-Kanten ${ist.zeitKanten.stellen}`,
);

const abweichungen: string[] = [];
if (soll._quellen?.normTextSha256 !== ist._quellen.normTextSha256) {
  abweichungen.push(
    `NormText.tsx hat sich geändert (SHA-256 ${String(soll._quellen?.normTextSha256).slice(0, 12)} → `
    + `${ist._quellen.normTextSha256.slice(0, 12)}). ZUERST die Transkription (Abschnitt 1 + 3 dieses `
    + 'Skripts) gegen die NEUE Entscheidkette prüfen — ein zugefügter oder umgestellter Guard ändert '
    + 'die Auflösung, ohne ein Literal zu entfernen, und wäre für den Literal-Wächter unsichtbar. '
    + 'ERST danach die Basislinie neu schreiben; ein blosses Regenerieren macht das Tor grün über '
    + 'eine Messung, die die Produktion nicht mehr abbildet.',
  );
}
const zeileSoll = new Map((soll.klassen ?? []).map((z) => [z.klasse, z]));
for (const z of ist.klassen) {
  const s = zeileSoll.get(z.klasse);
  if (!s) { abweichungen.push(`Klasse «${z.klasse}» ist NEU (${z.stellen} Stellen).`); continue; }
  if (s.stellen !== z.stellen || s.erlasse !== z.erlasse || s.selbstmarker !== z.selbstmarker) {
    abweichungen.push(
      `${z.klasse}: Stellen ${s.stellen} → ${z.stellen} · Erlasse ${s.erlasse} → ${z.erlasse} · `
      + `Selbstmarker ${s.selbstmarker} → ${z.selbstmarker}`,
    );
  }
}
for (const z of soll.klassen ?? []) {
  if (!ist.klassen.some((k) => k.klasse === z.klasse)) abweichungen.push(`Klasse «${z.klasse}» ist WEGGEFALLEN.`);
}
for (const feld of ['erlasse', 'eintraege', 'texte'] as const) {
  if (soll.korpus?.[feld] !== ist.korpus[feld]) {
    abweichungen.push(`korpus.${feld}: ${soll.korpus?.[feld]} → ${ist.korpus[feld]}`);
  }
}
const schluessel = (t: TotesZiel) => `${t.fundstelle}|${t.bestimmung}`;
const sollTot = new Set((soll.toteSelbstziele ?? []).map(schluessel));
const istTot = new Set(ist.toteSelbstziele.map(schluessel));
for (const t of ist.toteSelbstziele) if (!sollTot.has(schluessel(t))) abweichungen.push(`Totes Selbstziel NEU: ${schluessel(t)}`);
for (const k of sollTot) if (!istTot.has(k)) abweichungen.push(`Totes Selbstziel BEHOBEN: ${k} (Basislinie nachziehen)`);
for (const feld of ['stellen', 'erlasse', 'uebergangsTitel', 'altrechtBlock'] as const) {
  if (soll.zeitKanten?.[feld] !== ist.zeitKanten[feld]) {
    abweichungen.push(`zeitKanten.${feld}: ${soll.zeitKanten?.[feld]} → ${ist.zeitKanten[feld]}`);
  }
}

if (abweichungen.length > 0) {
  console.error(`check:verweis-inventar ROT — ${abweichungen.length} Abweichung(en) gegen die Basislinie:`);
  for (const a of abweichungen) console.error(`  · ${a}`);
  console.error(
    '\n  Bewusste Änderung? Basislinie IM SELBEN Commit regenerieren:\n'
    + '    npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

console.log('check:verweis-inventar GRÜN — Inventar deckungsgleich mit der Basislinie.');
