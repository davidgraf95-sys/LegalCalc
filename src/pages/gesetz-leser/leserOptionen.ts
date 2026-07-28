// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Persistente, rein visuelle Lese-Umschalter für den Gesetzes-Reader
// (FAHRPLAN-GESETZES-UX.md §3 + V2/A23): «Linien» (Gliederungs-Guide + Einzug),
// «Fussnoten» (Marker-Prominenz), «Verweise» (Link-Unterstreichung) und — seit
// V2·B-1 (David 10.7.2026, überstimmt «genau drei Toggles») — «Entscheide»
// (Leitfall-Zeilen ein/aus). Die Bedien-Oberfläche rendert `LeserAnsichtMenu.tsx`.
//
// Mechanik der vier Toggles = data-*-Attribute + CSS, KEIN React-State-Zweig im
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
// ist ein CSS-No-op (R6: Grundzustand byte-gleich). Linien: Default 'auto'. V2·A28
// (David 12.7.2026, Live-Verdikt «das mit den linien funktioniert überhaupt nicht»):
// der Auto-Guide ist KORPUSWEIT zurückgezogen — linienAufbau.ts liefert autoGuide=
// false für jeden Erlass, der Reader schreibt darum data-guide-auto="aus" an den
// `.lc-leser`-Root, und im Default 'auto' bleibt der vertikale Guide überall aus
// (Einzug bleibt). Das FEATURE bleibt: ein expliziter Klick «Linien AN» setzt
// data-linien="an" und zeigt den EINEN Guide auf `guideEbene` wieder (K11-Tri-State,
// übersteuert den Auto-Default global). Alle CSS-Regeln sind auf `.lc-leser` gescopt
// (index.css), damit sie NUR den Reader treffen.
//
// V2·B-2 (David 10.7.2026): der Leitfall-ZEITRAUM «alle · 20 · 10 · 5 J.» ist KEIN
// data-*-Toggle, sondern ein JS-konsumierter Filterwert — die Leitfall-Zeile
// (client-only, nicht prerendert) filtert `r.datum` VOR der Sichtbarkeits-Kappung.
// Er lebt im selben persistenten Store, wird aber über einen PRIMITIV-Selektor
// (`useLeitfallZeitraum`, nur der String) abonniert: so re-rendern die bis zu ~66
// Leitfall-Zeilen NUR bei echter Zeitraum-Änderung, nicht bei jedem anderen Toggle.

// W2·7-BEZUG/B4: die Facetten-Auswahl der Bezüge (Status-Klassen + Kantone) lebt
// im SELBEN persistenten Store — ein localStorage-Schlüssel, ein Hörer-Satz (§5),
// wie Zeitraum und Historie-Ansicht. Sie ist wie der Zeitraum JS-konsumiert (kein
// data-*-Attribut): welche Klassen gewählt sind, entscheidet, WELCHER Shard
// geladen und welche Kanten gerendert werden — das kann CSS nicht. Abonniert wird
// über Selektoren mit STABILER Referenz (nur bei echter Änderung ein Re-Render),
// darum werden die Arrays beim Setzen einmal neu gebaut und danach geteilt (§15).

import { useSyncExternalStore } from 'react';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { DEFAULT_KLASSEN, normalisiereKantone, normalisiereKlassen } from './bezugAuswahl';

export type OptFeld = 'linien' | 'fussnoten' | 'verweise' | 'leitfaelle';
// 'auto' nur für 'linien' sinnvoll (grundart-abhängiger Default, K11); Fussnoten/
// Verweise/Entscheide nutzen nur 'an'/'aus'. Die Union bleibt gemeinsam (ein Store).
export type OptWert = 'an' | 'aus' | 'auto';
export type LeserOptionen = Record<OptFeld, OptWert>;

/** V2·B-2: Zeitraum-Stufen für die Leitfall-Filterung («alle» = ungefiltert). */
export type LeitfallZeitraum = 'alle' | '20' | '10' | '5';

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
 * Bewusst KEIN `OptFeld`/`OptWert`: die Union der vier Toggles ist zweiwertig
 * ('an'|'aus', plus 'auto' für Linien). Ein drittes, semantisch anderes Wort in
 * dieselbe Union zu drücken machte jeden Toggle-Aufruf typunsicher (`setzeOption
 * ('fussnoten', 'chronologie')` wäre compilierbar und sinnlos). Der Wert lebt
 * darum wie `zeitraum` als eigenes Feld im SELBEN persistenten Store — ein
 * Store, ein localStorage-Schlüssel, ein Hörer-Satz (§5).
 */
export type HistAnsicht = 'aus' | 'fussnoten' | 'chronologie';

const KEY = 'lm.leser.optionen';
const FELDER: readonly OptFeld[] = ['linien', 'fussnoten', 'verweise', 'leitfaelle'];
const DEFAULT: LeserOptionen = { linien: 'auto', fussnoten: 'an', verweise: 'an', leitfaelle: 'an' };
const ZEITRAEUME: readonly LeitfallZeitraum[] = ['alle', '20', '10', '5'];
const DEFAULT_ZEITRAUM: LeitfallZeitraum = 'alle';
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
  zeitraum: LeitfallZeitraum;
  hist: HistAnsicht;
  bezugKlassen: readonly BezugStatus[];
  bezugKantone: readonly string[];
}

function lade(): GeladenerZustand {
  const grund = {
    opt: { ...DEFAULT }, zeitraum: DEFAULT_ZEITRAUM, hist: DEFAULT_HIST,
    bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
  };
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return grund;
    const o = JSON.parse(roh) as Partial<Record<OptFeld, unknown>>
      & { zeitraum?: unknown; hist?: unknown; bezugKlassen?: unknown; bezugKantone?: unknown };
    const opt: LeserOptionen = { ...DEFAULT };
    for (const f of FELDER) if (o[f] === 'an' || o[f] === 'aus' || o[f] === 'auto') opt[f] = o[f] as OptWert;
    const zeitraum = ZEITRAEUME.includes(o.zeitraum as LeitfallZeitraum)
      ? (o.zeitraum as LeitfallZeitraum)
      : DEFAULT_ZEITRAUM;
    const hist = HIST_ANSICHTEN.includes(o.hist as HistAnsicht) ? (o.hist as HistAnsicht) : DEFAULT_HIST;
    // Fehlt der Schlüssel GANZ (Bestands-Speicher vor B4), gilt der Default.
    // Steht dort ein leeres Array, ist das eine bewusste Nutzerwahl («alles
    // abgewählt») und bleibt erhalten — normalisiereKlassen setzt sie NICHT
    // still auf den Default zurück (§8, siehe bezugAuswahl.ts).
    const bezugKlassen = Array.isArray(o.bezugKlassen)
      ? normalisiereKlassen(o.bezugKlassen)
      : DEFAULT_BEZUG_KLASSEN;
    const bezugKantone = Array.isArray(o.bezugKantone) ? normalisiereKantone(o.bezugKantone) : KEINE_KANTONE;
    return { opt, zeitraum, hist, bezugKlassen, bezugKantone };
  } catch {
    // localStorage gesperrt (privater Modus) ODER kaputtes JSON → Default.
    return grund;
  }
}

// getSnapshot muss eine STABILE Referenz liefern (sonst warnt/looped React).
// `aktuell`/`aktuellZeitraum` werden nur bei echten Änderungen ersetzt.
const start = typeof window === 'undefined'
  ? {
      opt: { ...DEFAULT }, zeitraum: DEFAULT_ZEITRAUM, hist: DEFAULT_HIST,
      bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
    }
  : lade();
let aktuell: LeserOptionen = start.opt;
let aktuellZeitraum: LeitfallZeitraum = start.zeitraum;
let aktuellHist: HistAnsicht = start.hist;
let aktuellKlassen: readonly BezugStatus[] = start.bezugKlassen;
let aktuellKantone: readonly string[] = start.bezugKantone;

function speichere(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ...aktuell, zeitraum: aktuellZeitraum, hist: aktuellHist,
      bezugKlassen: aktuellKlassen, bezugKantone: aktuellKantone,
    }));
  } catch {
    /* Speicher gesperrt — die Wahl gilt dann nur für die Sitzung */
  }
}

/** Wendet die gespeicherten Toggle-Optionen VOR dem ersten Render an (Aufruf in
 *  main.tsx, analog `wendeThemaAn`). Setzt data-linien/-fussnoten/-verweise/
 *  -leitfaelle am <html>; Default 'an' ⇒ CSS-No-op ⇒ byte-gleiche heutige
 *  Darstellung. Der Zeitraum ist JS-konsumiert (kein data-*-Attribut). */
export function wendeLeserOptionenAn(): void {
  if (typeof document === 'undefined') return;
  const g = lade();
  aktuell = g.opt;
  aktuellZeitraum = g.zeitraum;
  aktuellHist = g.hist;
  // B4: JS-konsumiert (kein data-*-Attribut) — die Weiche «welcher Shard» und
  // die Gruppierung der Kanten sind React-Zustand, nicht CSS.
  aktuellKlassen = g.bezugKlassen;
  aktuellKantone = g.bezugKantone;
  const el = document.documentElement;
  for (const f of FELDER) el.setAttribute(`data-${f}`, aktuell[f]);
  // W2·5i: die Historie-Ansicht ist CSS-getrieben wie die vier Toggles → dasselbe
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

/** V2·B-2: Leitfall-Zeitraum setzen (JS-Filter, kein data-*-Attribut). Persistiert
 *  + benachrichtigt die Hörer; nur die Zeitraum-Abonnenten (Primitiv-Selektor) und
 *  die Leitfall-Zeilen rendern neu. */
export function setzeZeitraum(z: LeitfallZeitraum): void {
  if (z === aktuellZeitraum) return;
  aktuellZeitraum = z;
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
 * W2·7-BEZUG/B4: Facetten-Klassen der Bezüge setzen. Wie `setzeZeitraum` ein
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
// läuft über die `hoerer` (setzeOption/setzeZeitraum benachrichtigen direkt).
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

/** V2·B-2: Primitiv-Selektor auf den Leitfall-Zeitraum. `getSnapshot` gibt NUR den
 *  String zurück ⇒ obwohl jeder beliebige Toggle die Hörer benachrichtigt, re-rendert
 *  React die Abonnenten nur, wenn sich der String wirklich ändert (Object.is). So
 *  rendern die bis zu ~66 Leitfall-Zeilen NUR bei echter Zeitraum-Änderung neu
 *  (§15-Zusage — sonst wäre sie falsch). */
function getZeitraumSnapshot(): LeitfallZeitraum {
  return aktuellZeitraum;
}
function getZeitraumServerSnapshot(): LeitfallZeitraum {
  return DEFAULT_ZEITRAUM;
}
export function useLeitfallZeitraum(): LeitfallZeitraum {
  return useSyncExternalStore(abonniere, getZeitraumSnapshot, getZeitraumServerSnapshot);
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

function getKantoneSnapshot(): readonly string[] {
  return aktuellKantone;
}
function getKantoneServerSnapshot(): readonly string[] {
  return KEINE_KANTONE;
}
export function useBezugKantone(): readonly string[] {
  return useSyncExternalStore(abonniere, getKantoneSnapshot, getKantoneServerSnapshot);
}
