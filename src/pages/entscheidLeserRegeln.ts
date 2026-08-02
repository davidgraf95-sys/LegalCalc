import { gruppiereErwaegungen } from '../lib/rechtsprechung/abschnitte';
import { SUCH_HIGHLIGHT } from './gesetz-leser/suchHighlight';
import type { EntscheidAbschnitt } from '../lib/rechtsprechung/typen';

// ─── Reine Regeln des Entscheid-Lesers (W2·17-UI-BEFUNDE-B2, Los E) ──────────
//
// Ausgelagert aus `EntscheidLeser.tsx`, damit die Adress-Regeln des Lesers ohne
// Browser prüfbar sind (§6: der Beweis gehört in den Test, nicht in die Zusage).
// Nichts davon ist Rechtslogik (§3) — es sind Adress- und Textsuch-Regeln der
// Darstellungsschicht; alle Funktionen sind rein und deterministisch (§2).

// ── LM-209 · Abschnitts-Hash ohne Verlaufsflut ──────────────────────────────
//
// Befund (Prod, 2.8.2026): die Reiter «Sachverhalt / Erwägungen / Dispositiv»
// waren schlichte `<a href="#abschnitt-…">`. Ein solcher Klick erzeugt
// BROWSERNATIV einen History-Eintrag — gemessen `history.length` 4→5→6→7 bei
// drei Reiter-Klicks; man war danach vier «Zurück» vom Gesetz entfernt, obwohl
// man die Seite nie verlassen hat.
//
// Der Fix schreibt denselben Hash per `replaceState` (Muster der bereits
// gebauten `?ansicht=`-Spiegelung, N0d·J5) und scrollt selbst. Der Hash BLEIBT
// damit in der Adresse (Teilbarkeit), der Verlauf bildet aber nur noch echte
// Ortswechsel ab.
//
// ABGRENZUNG (FAHRPLAN-UI-NAVIGATION §Z Ziff. 7): verworfen ist der laufende,
// SCROLL-getriebene Hash-Sync. Hier ändert ausschliesslich ein diskreter Klick
// die Adresse — kein Scroll-Ereignis schreibt je in die URL.

/** Adresse mit gesetztem Abschnitts-Hash; Pfad und Query bleiben unberührt. */
export function urlMitHash(href: string, anker: string): string {
  const u = new URL(href);
  u.hash = anker;
  return u.toString();
}

// ── LM-210 · Lesemodus in der Adresse ───────────────────────────────────────
//
// Befund (Prod, 2.8.2026): der Lesemodus war reiner lokaler State — weder URL
// noch localStorage noch sessionStorage trugen ihn. Eine Vollbild-Ansicht liess
// sich damit nicht weitergeben und überlebte kein Neuladen.
//
// Gebaut nach dem dokumentierten Präzedenzmuster N0d·J5 (`?ansicht=voll|auszug`
// wird per replaceState in die Adresse zurückgeschrieben und beim Laden gelesen).
// Wertform folgt der Bestands-Konvention für Ja/Nein-Achsen (`?leit=1`,
// EntscheidFilter): gesetzt = «1», ausgeschaltet = Parameter FEHLT — so trägt die
// Adresse nie ein totes «lese=0» mit.

/** Name der Lesemodus-Achse in der Adresse. */
export const LESE_PARAM = 'lese';
const LESE_AN = '1';

/** Lesemodus-Zustand aus dem rohen Query-Wert (alles ausser «1» = zu). */
export function leseAusParam(wert: string | null): boolean {
  return wert === LESE_AN;
}

/** Adresse mit gesetztem/entferntem Lesemodus-Flag; übrige Parameter und Hash
 *  bleiben unberührt (der Fassungs-Parameter `?ansicht=` überlebt das Öffnen). */
export function urlMitLese(href: string, offen: boolean): string {
  const u = new URL(href);
  if (offen) u.searchParams.set(LESE_PARAM, LESE_AN);
  else u.searchParams.delete(LESE_PARAM);
  return u.toString();
}

// ── LM-208 · Herkunfts-Norm im Entscheidtext auffindbar machen ───────────────
//
// Befund (Prod, 2.8.2026): der Weg `/gesetze/bund/OR#art-367` → Entscheid-Chip
// führt auf `…?norm=Art.%20367%20OR`, aber die Entscheidseite zeigte den
// Parameter nirgends — kein Herkunfts-Hinweis, keine Markierung im 23'233 Zeichen
// langen Urteil (`document.querySelectorAll('mark').length === 0`).
//
// NICHT hier gebaut (A17 ist Bestand, kein Doppelbau): der SPRUNG zur ersten
// Fundstelle. Der arbeitet über die aufgelöste Fedlex-URL (`ersteFundstelle`) und
// bleibt unberührt.
//
// ── Die Markierungs-Regel, deklariert (§2/§8) ───────────────────────────────
// Markiert und gezählt wird ausschliesslich die WÖRTLICHE Nennung des Zitats mit
// Wortgrenzen. «Art. 367 ff. OR» und «Art. 367 Abs. 2 OR» sind KEINE wörtliche
// Nennung von «Art. 367 OR» und werden NICHT markiert: welche Artikel ein «ff.»
// umfasst, ist eine juristische Schlussfolgerung, keine Textsuche — sie zu raten
// hiesse, eine Behauptung optisch als Fundstelle auszugeben (§1/§8). Genau dieser
// Fall ist der reproduzierte: der Referenz-Entscheid nennt «Art. 367 ff. OR» und
// bekommt deshalb ehrlich KEINE Markierung, sondern den Hinweis, dass die Norm
// im Erwägungstext nicht wörtlich steht.
//
// Gross-/Kleinschreibung zählt (anders als bei der Volltextsuche A35): Zitate
// sind Eigennamen — ein «or» im französischen Fliesstext ist kein «OR».

const REGEX_META = /[.*+?^${}()|[\]\\]/g;

/**
 * Suchmuster für die wörtliche Nennung eines Zitats. Whitespace im Zitat matcht
 * jede Whitespace-Folge (amtliche Texte tragen geschützte Leerzeichen und
 * Zeilenumbrüche mitten im Verweis). Wortgrenzen werden nur dort verlangt, wo das
 * Zitat selbst mit einem ASCII-Wortzeichen beginnt bzw. endet — sonst («§ 4 …»)
 * schlüge `\b` an einer Nicht-Wortstelle fehl und fände nichts.
 * Leeres Zitat ⇒ null (kein Muster, das auf alles passt).
 */
export function zitatMuster(zitat: string): RegExp | null {
  const roh = zitat.replace(/\s+/g, ' ').trim();
  if (!roh) return null;
  const teile = roh.split(' ').map((w) => w.replace(REGEX_META, '\\$&'));
  const vorn = /^[0-9A-Za-z_]/.test(roh) ? '\\b' : '';
  const hinten = /[0-9A-Za-z_]$/.test(roh) ? '\\b' : '';
  return new RegExp(`${vorn}${teile.join('\\s+')}${hinten}`, 'g');
}

/** Anzahl wörtlicher Nennungen des Zitats in einem Text. */
export function zaehleNennungen(text: string, zitat: string): number {
  const re = zitatMuster(zitat);
  return re ? (text.match(re) ?? []).length : 0;
}

/**
 * Anker aller Erwägungs-Blöcke, die das Zitat wörtlich nennen — in Dokument-
 * Reihenfolge, die Sprungziele des «nächste Fundstelle»-Knopfes. Gleicher
 * Wirkungsbereich und dieselbe Anker-Wahrheit wie `ersteFundstelle` (§5,
 * `gruppiereErwaegungen`); markenlose Blöcke tragen keinen Anker und fallen
 * darum heraus (ein Sprungziel, das es nicht gibt, wird nicht angeboten, §8).
 */
export function nennungsAnker(abschnitte: EntscheidAbschnitt[], zitat: string): string[] {
  const re = zitatMuster(zitat);
  if (!re) return [];
  const erw = abschnitte.find((a) => a.typ === 'erwaegung');
  if (!erw) return [];
  const ziele: string[] = [];
  for (const g of gruppiereErwaegungen(erw.bloecke)) {
    const eintraege: { text: string; anker: string }[] = [];
    if (g.kopf && g.kopfAnker) eintraege.push({ text: g.kopf.text, anker: g.kopfAnker });
    for (const s of g.subs) if (s.anker) eintraege.push({ text: s.block.text, anker: s.anker });
    for (const e of eintraege) {
      re.lastIndex = 0;
      if (re.test(e.text)) ziele.push(e.anker);
    }
  }
  return ziele;
}

// ── Optische Markierung im gerenderten Lesetext ─────────────────────────────
//
// Umsetzung wie A35 (`gesetz-leser/suchHighlight.ts`) über die CSS Custom
// Highlight API statt über `<mark>`-Wrapper: der Entscheidtext wird von
// EntscheidBody/NormText strukturiert gerendert (Norm-Autolinks, Kolumnentitel-
// Marker, Pin-Cite-Anker). Ein Wrapper müsste all das durchfädeln und die
// Darstellungswahrheit riskieren (§3/§6); die Highlight-API legt eine reine
// PAINT-Schicht darüber — kein Knoten wird erzeugt, verschoben oder verändert
// (CLS 0, §15). Fehlt die API (ältere Browser, SSR), degradiert es geräuschlos.
// Der Highlight-NAME ist derselbe wie bei A35, damit die eine `::highlight()`-
// Regel in index.css die eine Treffer-Optik bleibt (§5).

/** Ein Treffer im gerenderten Text: Textknoten + Offsets (noch keine Range). */
export interface Nennung { knoten: Node; start: number; ende: number }

/**
 * Sammelt die wörtlichen Nennungen im gerenderten Text unterhalb von `container`.
 * Reine Traversierung (TreeWalker + Offsets, keine Range) — dadurch auch ohne
 * Browser prüfbar. Treffer, die im Markup über mehrere Textknoten zerfallen,
 * werden bewusst NICHT zusammengesetzt: lieber eine Markierung weniger als eine
 * an falscher Stelle (§1).
 */
export function sammleNennungen(container: Element | null, zitat: string): Nennung[] {
  const re = container ? zitatMuster(zitat) : null;
  if (!container || !re) return [];
  const doc = container.ownerDocument;
  if (!doc?.createTreeWalker) return [];
  const treffer: Nennung[] = [];
  const walker = doc.createTreeWalker(container, 4 /* NodeFilter.SHOW_TEXT */);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue ?? '';
    if (text === '') continue;
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      treffer.push({ knoten: n, start: m.index, ende: m.index + m[0].length });
      if (m[0].length === 0) break;   // Sicherung gegen Endlos-Lauf
    }
  }
  return treffer;
}

// Die CSS Custom Highlight API ist (je nach TS-lib) nicht typisiert — darum über
// eine schmale, lokale Struktur an `globalThis` gelesen (wie in suchHighlight.ts).
type HighlightCtor = new (...ranges: Range[]) => object;
interface HighlightGlobals {
  Highlight?: HighlightCtor;
  CSS?: { highlights?: Map<string, object> };
}
function highlightApi(): { reg: Map<string, object>; Ctor: HighlightCtor } | null {
  const g = globalThis as unknown as HighlightGlobals;
  const reg = g.CSS?.highlights;
  const Ctor = g.Highlight;
  if (!reg || typeof Ctor !== 'function') return null;
  return { reg, Ctor };
}

/** Markiert die wörtlichen Nennungen; ohne Treffer bzw. ohne API wird gelöscht. */
export function maleNennungen(container: Element | null, zitat: string): number {
  const api = highlightApi();
  const treffer = sammleNennungen(container, zitat);
  if (!api) return treffer.length;
  if (treffer.length === 0) { api.reg.delete(SUCH_HIGHLIGHT); return 0; }
  const doc = container!.ownerDocument!;
  const ranges = treffer.map((t) => {
    const r = doc.createRange();
    r.setStart(t.knoten, t.start);
    r.setEnd(t.knoten, t.ende);
    return r;
  });
  api.reg.set(SUCH_HIGHLIGHT, new api.Ctor(...ranges));
  return ranges.length;
}

/** Nimmt die Markierung zurück (Verlassen der Seite, Wechsel in den Lesemodus). */
export function loescheNennungen(): void {
  highlightApi()?.reg.delete(SUCH_HIGHLIGHT);
}
