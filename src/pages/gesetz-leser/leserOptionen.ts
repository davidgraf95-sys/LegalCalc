// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Persistente, rein visuelle Lese-Umschalter für den Gesetzes-Reader
// (FAHRPLAN-GESETZES-UX.md §3 + V2/A23): «Fussnoten» (Marker-Prominenz),
// «Verweise» (Link-Unterstreichung) und — seit V2·B-1 (David 10.7.2026,
// überstimmt «genau drei Toggles») — «Entscheide» (Leitfall-Zeilen ein/aus).
// Die Bedien-Oberfläche rendert `LeserAnsichtMenu.tsx`.
//
// LINIEN-RÜCKBAU V1 (16.8.2026, Entscheid David 13.8.2026 «ja linien ganz
// entfernen»): das frühere Feld `linien` (K11-Tri-State an/aus/auto) ist samt
// Schalter, `data-linien`-Attribut und CSS-Regeln ENTFALLEN — mit ihm der einzige
// Grund für den Wert 'auto'. Ein alt gespeichertes `"linien"` im localStorage wird
// beim Laden ignoriert (es steht nicht mehr in FELDER) und beim nächsten Schreiben
// abgeräumt; es kann nichts mehr einschalten. Herleitung:
// FAHRPLAN-GESETZESDARSTELLUNG-V2 §9.3.
//
// Mechanik der Toggles = data-*-Attribute + CSS, KEIN React-State-Zweig im
// Artikel-Baum (§15: das Toggeln rendert die Artikelliste NICHT neu). Vorbild ist
// die Theme-Mechanik (components/thema.ts): die Attribute werden IMPERATIV am
// <html> gesetzt — bewusst KEIN Inline-Script im index.html-Head, weil die CSP
// (vercel.json `script-src 'self'`) Inline-Scripte verbietet. Die Anwendung vor
// dem ersten Paint erledigt main.tsx via `wendeLeserOptionenAn()` (analog
// `wendeThemaAn`/`wendeSchriftskalaAn`), das aus dem gebündelten Modul-Script
// läuft (same-origin, CSP-konform) → kein Flackern, kein Hydration-Mismatch.
//
// Beim Umschalten schreibt `setzeOption` das Attribut direkt ans <html> und
// benachrichtigt die Hörer; nur die Switch-Buttons (useLeserOptionen) rendern
// neu — der Normtext bleibt unberührt (CSS greift auf das geänderte Attribut).
// Global (ein Attributsatz am <html>) ⇒ beide Reader-Instanzen (Einzelansicht
// UND jedes Split-View-Pane) folgen derselben Wahl ohne Re-Render.
//
// Fussnoten/Verweise/Entscheide: Default 'an' = heutige Darstellung → data-*="an"
// ist ein CSS-No-op (R6: Grundzustand byte-gleich). Alle CSS-Regeln sind auf
// `.lc-leser` gescopt (index.css), damit sie NUR den Reader treffen.
//
// W2·7-BEZUG/B5 (David 28.7.2026): die frühere Stufen-Wahl «alle · 20 · 10 · 5 J.»
// (V2·B-2) ist ENTFALLEN und durch einen VON-BIS-BEREICH ersetzt — Zeitstrahl mit
// Zieh-Auswahl plus zwei Datumsfeldern im Dropdown «Rechtsprechung ▾». Er lebt wie
// die Facetten als JS-konsumierter Filterwert im SELBEN persistenten Store und wird
// über PRIMITIV-Selektoren (`useBezugVon`/`useBezugBis`, je nur ein String)
// abonniert: so re-rendern die Abonnenten nur bei echter Bereichs-Änderung, nicht
// bei jedem anderen Toggle (§15). Zwei Strings statt eines Objekts, weil
// `getSnapshot` eine STABILE Referenz liefern muss — ein je Aufruf neu gebautes
// `{von, bis}` liesse React schleifen.
//
// EINMALIGE MIGRATION der Alt-Wahl: ein gespeichertes `zeitraum: '5'|'10'|'20'`
// wird zu `bezugVon = heute minus n Jahre` (`migriereZeitraum`, bezugZeit.ts),
// 'alle' zu offenen Enden. Sie greift nur, solange kein Bereich gespeichert ist,
// und wird sofort zurückgeschrieben — sonst wanderte der Grenzwert mit jedem
// Sitzungstag weiter, und der Filter zeigte jeden Tag etwas anderes an.

// W2·7-BEZUG/B4: die Facetten-Auswahl der Bezüge (Status-Klassen + Kantone) lebt
// im SELBEN persistenten Store — ein localStorage-Schlüssel, ein Hörer-Satz (§5),
// wie der Zeit-Bereich und die Historie-Ansicht. Sie ist ebenso JS-konsumiert (kein
// data-*-Attribut): welche Klassen gewählt sind, entscheidet, WELCHER Shard
// geladen und welche Kanten gerendert werden — das kann CSS nicht. Abonniert wird
// über Selektoren mit STABILER Referenz (nur bei echter Änderung ein Re-Render),
// darum werden die Arrays beim Setzen einmal neu gebaut und danach geteilt (§15).

import { useSyncExternalStore } from 'react';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { DEFAULT_KLASSEN, normalisiereKantone, normalisiereKlassen } from './bezugAuswahl';
import { migriereZeitraum, normalisiereBereich } from './bezugZeit';
import { heuteIso } from '../../lib/format';

export type OptFeld = 'fussnoten' | 'verweise' | 'leitfaelle';
export type OptWert = 'an' | 'aus';
export type LeserOptionen = Record<OptFeld, OptWert>;

/**
 * W2·5i-HIST-ANSICHT: DREIWERTIGE Darstellung der Änderungshistorie.
 *
 * · `fussnoten`   — Default = die heutige Darstellung (Apparat am Artikelfuss).
 *                   CSS-No-op, damit der Grundzustand byte-gleich bleibt (R6).
 * · `aus`         — die Änderungsvermerke werden gedämpft (Marker + Apparat-
 *                   Eintrag). NUR Klasse 'A'; V/G/Z/U und alle Fussnoten OHNE
 *                   Klasse bleiben sichtbar (H0-Auflage 1).
 * · `chronologie` — dieselben 'A'-Einträge, aber als chronologisch sortierte
 *                   Liste am Artikelfuss statt als Fussnoten-Apparat.
 *
 * Bewusst KEIN `OptFeld`/`OptWert`: die Union der Toggles ist zweiwertig
 * ('an'|'aus'). Ein drittes, semantisch anderes Wort in
 * dieselbe Union zu drücken machte jeden Toggle-Aufruf typunsicher (`setzeOption
 * ('fussnoten', 'chronologie')` wäre compilierbar und sinnlos). Der Wert lebt
 * darum wie der Zeit-Bereich als eigenes Feld im SELBEN persistenten Store — ein
 * Store, ein localStorage-Schlüssel, ein Hörer-Satz (§5).
 */
export type HistAnsicht = 'aus' | 'fussnoten' | 'chronologie';

const KEY = 'lm.leser.optionen';
const FELDER: readonly OptFeld[] = ['fussnoten', 'verweise', 'leitfaelle'];
const DEFAULT: LeserOptionen = { fussnoten: 'an', verweise: 'an', leitfaelle: 'an' };
const HIST_ANSICHTEN: readonly HistAnsicht[] = ['aus', 'fussnoten', 'chronologie'];
const DEFAULT_HIST: HistAnsicht = 'fussnoten';

// W2·7-BEZUG/B4: Grundzustand der Bezugs-Facetten = NUR Leitentscheide (§9 B4
// «Default konservativ»). Die geteilte Konstanten-Referenz macht den häufigen
// Fall referenz-stabil: solange niemand umschaltet, liefert `getKlassenSnapshot`
// IMMER dasselbe Array-Objekt ⇒ kein Re-Render der Abonnenten (Object.is, §15).
const DEFAULT_BEZUG_KLASSEN: readonly BezugStatus[] = [...DEFAULT_KLASSEN];
const KEINE_KANTONE: readonly string[] = [];

interface GeladenerZustand {
  opt: LeserOptionen;
  hist: HistAnsicht;
  bezugKlassen: readonly BezugStatus[];
  bezugKantone: readonly string[];
  bezugVon: string;
  bezugBis: string;
  /** Wurde die Alt-Stufen-Wahl gerade auf einen Bereich abgebildet? Dann muss
   *  der Aufrufer einmal zurückschreiben (sonst wandert der Grenzwert täglich). */
  migriert: boolean;
}

function lade(): GeladenerZustand {
  const grund = {
    opt: { ...DEFAULT }, hist: DEFAULT_HIST,
    bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
    bezugVon: '', bezugBis: '', migriert: false,
  };
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return grund;
    const o = JSON.parse(roh) as Partial<Record<OptFeld, unknown>>
      & { zeitraum?: unknown; hist?: unknown; bezugKlassen?: unknown; bezugKantone?: unknown;
          bezugVon?: unknown; bezugBis?: unknown };
    const opt: LeserOptionen = { ...DEFAULT };
    for (const f of FELDER) if (o[f] === 'an' || o[f] === 'aus') opt[f] = o[f] as OptWert;
    const hist = HIST_ANSICHTEN.includes(o.hist as HistAnsicht) ? (o.hist as HistAnsicht) : DEFAULT_HIST;
    // B5-Migration: steht schon EIN Bereichs-Feld im Speicher, ist der Bereich die
    // Wahrheit und `zeitraum` ein Überbleibsel, das beim nächsten Schreiben
    // wegfällt. Sonst wird die Alt-Stufe einmalig abgebildet (§8) — `heuteIso`
    // ist die einzige Uhr auf diesem Weg und sitzt genau hier an der Grenze (§2).
    const hatBereich = 'bezugVon' in o || 'bezugBis' in o;
    const bereich = hatBereich
      ? normalisiereBereich(o.bezugVon, o.bezugBis)
      : migriereZeitraum(o.zeitraum, heuteIso(new Date()));
    const migriert = !hatBereich && bereich.von !== '';
    // Fehlt der Schlüssel GANZ (Bestands-Speicher vor B4), gilt der Default.
    // Steht dort ein leeres Array, ist das eine bewusste Nutzerwahl («alles
    // abgewählt») und bleibt erhalten — normalisiereKlassen setzt sie NICHT
    // still auf den Default zurück (§8, siehe bezugAuswahl.ts).
    // MIGRATION (W2·7-BEZUG/B4, einmalig): der frühere Schalter «Entscheide»
    // ist entfallen (ersetzt durch das Dropdown «Rechtsprechung ▾»). Wer ihn auf
    // 'aus' gestellt hatte, wollte keine Entscheide am Artikel sehen — dieser
    // Wille wird übernommen, indem alle Facetten abgewählt starten, statt ihm
    // die Auflistung mit der neuen Voreinstellung wieder einzublenden (§8: eine
    // Umstellung darf eine getroffene Nutzerwahl nicht stillschweigend kippen).
    // Greift NUR, solange keine Facetten-Wahl gespeichert ist, also genau einmal.
    const bezugKlassen = Array.isArray(o.bezugKlassen)
      ? normalisiereKlassen(o.bezugKlassen)
      : (opt.leitfaelle === 'aus' ? [] : DEFAULT_BEZUG_KLASSEN);
    const bezugKantone = Array.isArray(o.bezugKantone) ? normalisiereKantone(o.bezugKantone) : KEINE_KANTONE;
    return { opt, hist, bezugKlassen, bezugKantone, bezugVon: bereich.von, bezugBis: bereich.bis, migriert };
  } catch {
    // localStorage gesperrt (privater Modus) ODER kaputtes JSON → Default.
    return grund;
  }
}

// getSnapshot muss eine STABILE Referenz liefern (sonst warnt/looped React).
// `aktuell`/`aktuellVon`/`aktuellBis` werden nur bei echten Änderungen ersetzt.
const start = typeof window === 'undefined'
  ? {
      opt: { ...DEFAULT }, hist: DEFAULT_HIST,
      bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
      bezugVon: '', bezugBis: '', migriert: false,
    }
  : lade();
let aktuell: LeserOptionen = start.opt;
let aktuellHist: HistAnsicht = start.hist;
let aktuellKlassen: readonly BezugStatus[] = start.bezugKlassen;
let aktuellKantone: readonly string[] = start.bezugKantone;
let aktuellVon: string = start.bezugVon;
let aktuellBis: string = start.bezugBis;

function speichere(): void {
  try {
    // `zeitraum` wird NICHT mitgeschrieben: das Feld ist mit B5 entfallen, und
    // ein weitergeschleppter Alt-Wert liesse die Migration bei jedem Laden neu
    // greifen. Ein einziges Schreiben räumt ihn ab.
    localStorage.setItem(KEY, JSON.stringify({
      ...aktuell, hist: aktuellHist,
      bezugKlassen: aktuellKlassen, bezugKantone: aktuellKantone,
      bezugVon: aktuellVon, bezugBis: aktuellBis,
    }));
  } catch {
    /* Speicher gesperrt — die Wahl gilt dann nur für die Sitzung */
  }
}

// Die Alt-Wahl SOFORT festschreiben. Ohne das bliebe `zeitraum` im Speicher und
// `migriereZeitraum` rechnete bei jedem Laden gegen ein neues «heute» — aus
// «letzte 5 Jahre» würde ein Grenzwert, der jeden Tag um einen Tag weiterrutscht.
// Genau einmal: nach dem Schreiben steht `bezugVon` da und `hatBereich` greift.
if (start.migriert) speichere();

/** Wendet die gespeicherten Toggle-Optionen VOR dem ersten Render an (Aufruf in
 *  main.tsx, analog `wendeThemaAn`). Setzt data-fussnoten/-verweise/-leitfaelle
 *  am <html>; Default 'an' ⇒ CSS-No-op ⇒ byte-gleiche heutige Darstellung. Der
 *  Zeit-Bereich ist JS-konsumiert (kein data-*-Attribut). */
export function wendeLeserOptionenAn(): void {
  if (typeof document === 'undefined') return;
  const g = lade();
  aktuell = g.opt;
  aktuellHist = g.hist;
  // B4: JS-konsumiert (kein data-*-Attribut) — die Weiche «welcher Shard» und
  // die Gruppierung der Kanten sind React-Zustand, nicht CSS.
  aktuellKlassen = g.bezugKlassen;
  aktuellKantone = g.bezugKantone;
  aktuellVon = g.bezugVon;
  aktuellBis = g.bezugBis;
  if (g.migriert) speichere();
  const el = document.documentElement;
  for (const f of FELDER) el.setAttribute(`data-${f}`, aktuell[f]);
  // W2·5i: die Historie-Ansicht ist CSS-getrieben wie die Toggles → dasselbe
  // Pre-Paint-Attribut am <html> (kein Flackern, kein Hydration-Mismatch). Der
  // Default 'fussnoten' emittiert KEINE CSS-Regel ⇒ Grundzustand byte-gleich (R6).
  el.setAttribute('data-histansicht', aktuellHist);
}

const hoerer = new Set<() => void>();

/** Umschalten eines Toggle-Feldes: localStorage schreiben, Attribut direkt ans
 *  <html> setzen (KEIN Artikel-Re-Render), Hörer (Switch-Buttons) benachrichtigen. */
export function setzeOption(feld: OptFeld, wert: OptWert): void {
  aktuell = { ...aktuell, [feld]: wert };
  speichere();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute(`data-${feld}`, wert);
  }
  hoerer.forEach((f) => f());
}

/**
 * W2·7-BEZUG/B5: Zeit-Bereich der Bezüge setzen (JS-Filter, kein data-*-Attribut).
 * Persistiert + benachrichtigt die Hörer; nur die Bereichs-Abonnenten
 * (Primitiv-Selektoren) und die Kanten-Auswahl rendern neu.
 *
 * Beide Enden werden GEMEINSAM gesetzt und normalisiert: eine Zieh-Auswahl am
 * Zeitstrahl ist EINE Geste, und zwei getrennte Setzer erzeugten zwischendurch
 * einen Zustand mit vertauschten Enden — sichtbar als kurz leere Auflistung.
 */
export function setzeBezugZeit(von: string, bis: string): void {
  const neu = normalisiereBereich(von, bis);
  if (neu.von === aktuellVon && neu.bis === aktuellBis) return;
  aktuellVon = neu.von;
  aktuellBis = neu.bis;
  speichere();
  hoerer.forEach((f) => f());
}

/** W2·5i: Historie-Ansicht setzen. Wie `setzeOption`: Attribut direkt ans <html>
 *  (KEIN Artikel-Re-Render — die Umschaltung ist rein CSS, die Chronologie-Liste
 *  liegt bereits im DOM), persistieren, Hörer benachrichtigen. Nur die drei
 *  Auswahl-Buttons rendern neu (Primitiv-Selektor `useHistAnsicht`). */
export function setzeHistAnsicht(h: HistAnsicht): void {
  if (h === aktuellHist) return;
  aktuellHist = h;
  speichere();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-histansicht', h);
  }
  hoerer.forEach((f) => f());
}

/**
 * W2·7-BEZUG/B4: Facetten-Klassen der Bezüge setzen. Wie `setzeBezugZeit` ein
 * JS-Filterwert (kein Attribut). Die Referenz-Gleichheit wird bewusst über den
 * INHALT geprüft und nicht über die Objekt-Identität: die Aufrufer bauen die
 * Menge aus `schalteKlasse` immer neu, ein naiver `===`-Vergleich liefe also
 * nie an und jeder Klick würde alle Abonnenten re-rendern — auch der Klick,
 * der nichts ändert (§15).
 */
export function setzeBezugKlassen(klassen: readonly BezugStatus[]): void {
  const neu = normalisiereKlassen(klassen);
  if (neu.length === aktuellKlassen.length && neu.every((k, i) => k === aktuellKlassen[i])) return;
  aktuellKlassen = neu;
  speichere();
  hoerer.forEach((f) => f());
}

/** B4: Kantons-Auswahl setzen (leer = keine Einschränkung). Siehe
 *  `setzeBezugKlassen` zur Inhalts- statt Identitäts-Prüfung. */
export function setzeBezugKantone(kantone: readonly string[]): void {
  const neu = normalisiereKantone(kantone);
  if (neu.length === aktuellKantone.length && neu.every((k, i) => k === aktuellKantone[i])) return;
  aktuellKantone = neu;
  speichere();
  hoerer.forEach((f) => f());
}

// Cross-Tab-Synchronisation: ein einziger Storage-Listener am Modul (nicht pro
// Abo, sonst entfernt das erste Unsubscribe ihn für alle). Gleiche-Tab-Sync
// läuft über die `hoerer` (setzeOption/setzeBezugZeit benachrichtigen direkt).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    wendeLeserOptionenAn();
    hoerer.forEach((f) => f());
  });
}

function abonniere(f: () => void): () => void {
  hoerer.add(f);
  return () => {
    hoerer.delete(f);
  };
}

function getSnapshot(): LeserOptionen {
  return aktuell;
}
function getServerSnapshot(): LeserOptionen {
  return DEFAULT;
}

/** React-Hook auf die aktuellen Toggle-Optionen (für die Switch-Buttons). */
export function useLeserOptionen(): LeserOptionen {
  return useSyncExternalStore(abonniere, getSnapshot, getServerSnapshot);
}

/**
 * W2·7-BEZUG/B5: Primitiv-Selektoren auf die beiden Bereichs-Enden.
 *
 * Bewusst ZWEI Hooks auf zwei Strings statt eines Hooks auf ein `{von, bis}`:
 * `getSnapshot` muss eine stabile Referenz liefern, ein je Aufruf frisch
 * gebautes Objekt liesse React schleifen. Strings vergleicht `Object.is`
 * wertweise — obwohl jeder beliebige Toggle die Hörer benachrichtigt, rendern
 * die Abonnenten nur bei echter Bereichs-Änderung neu (§15-Zusage). Wer beide
 * Enden als Objekt braucht, baut es im eigenen `useMemo` zusammen.
 */
function getVonSnapshot(): string {
  return aktuellVon;
}
function getBisSnapshot(): string {
  return aktuellBis;
}
function getLeerSnapshot(): string {
  return '';
}
export function useBezugVon(): string {
  return useSyncExternalStore(abonniere, getVonSnapshot, getLeerSnapshot);
}
export function useBezugBis(): string {
  return useSyncExternalStore(abonniere, getBisSnapshot, getLeerSnapshot);
}

/** W2·5i: Primitiv-Selektor auf die Historie-Ansicht — gibt NUR den String zurück,
 *  also re-rendern die Abonnenten nur bei echter Änderung (Object.is). Bewusst
 *  ausschliesslich vom Auswahl-Steuerelement abonniert: die Artikel-Darstellung
 *  folgt dem `data-histansicht`-Attribut per CSS, nicht per React-State (§15 —
 *  Umschalten rendert den Normtext nicht neu). */
function getHistSnapshot(): HistAnsicht {
  return aktuellHist;
}
function getHistServerSnapshot(): HistAnsicht {
  return DEFAULT_HIST;
}
export function useHistAnsicht(): HistAnsicht {
  return useSyncExternalStore(abonniere, getHistSnapshot, getHistServerSnapshot);
}

/**
 * W2·7-BEZUG/B4: Selektoren auf die Bezugs-Facetten.
 *
 * `getSnapshot` MUSS eine stabile Referenz liefern (sonst warnt React und
 * schleift). Die Arrays werden darum ausschliesslich in `setzeBezugKlassen`/
 * `setzeBezugKantone` ersetzt und dazwischen geteilt — im Grundzustand ist es
 * sogar dieselbe Modul-Konstante (`DEFAULT_BEZUG_KLASSEN`), sodass der
 * unveränderte Reader gar keinen Re-Render sieht.
 */
function getKlassenSnapshot(): readonly BezugStatus[] {
  return aktuellKlassen;
}
function getKlassenServerSnapshot(): readonly BezugStatus[] {
  return DEFAULT_BEZUG_KLASSEN;
}
export function useBezugKlassen(): readonly BezugStatus[] {
  return useSyncExternalStore(abonniere, getKlassenSnapshot, getKlassenServerSnapshot);
}

/**
 * Die Klassen NICHT-reaktiv lesen — für Entscheidungen INNERHALB eines Effekts.
 *
 * Warum das nötig ist (Befund 28.7.2026, an der Netzwerk-Sonde gemessen): der
 * Reader ist prerendert und wird hydriert. Während der Hydration liefert
 * `useSyncExternalStore` bewusst den SERVER-Snapshot, also den Default — auch
 * wenn im localStorage längst ein erweiterter Zustand steht und
 * `wendeLeserOptionenAn()` ihn vor dem ersten Render ins Modul geschrieben hat.
 * Ein Effekt, der in diesem Moment «bin ich erweitert?» am gerenderten Wert
 * fragt, bekommt «nein» und lädt den schlanken Shard — den er im erweiterten
 * Zustand gerade NICHT laden soll. Gemessen kamen dann beide Shards über die
 * Leitung, und die Zusage «an die Stelle, nie zusätzlich» war falsch.
 *
 * Der Modulwert kennt diese Verzögerung nicht: er steht seit `wendeLeserOptionenAn`
 * richtig. Für die RENDER-Ausgabe bleibt der Hook massgeblich (sonst entstünde
 * ein Hydration-Mismatch) — dieser Getter ist ausschliesslich für Effekte.
 */
export function holeBezugKlassen(): readonly BezugStatus[] {
  return aktuellKlassen;
}

function getKantoneSnapshot(): readonly string[] {
  return aktuellKantone;
}
function getKantoneServerSnapshot(): readonly string[] {
  return KEINE_KANTONE;
}
export function useBezugKantone(): readonly string[] {
  return useSyncExternalStore(abonniere, getKantoneSnapshot, getKantoneServerSnapshot);
}
