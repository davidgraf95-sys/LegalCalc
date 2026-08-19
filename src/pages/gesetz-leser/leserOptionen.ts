// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Persistente, rein visuelle Lese-Umschalter des Gesetzes-Readers. Drei
// zweiwertige Felder (`fussnoten` · `histansicht` · `leitfaelle`) plus drei
// JS-konsumierte Filterwerte (Schriftstufe, Bezugs-Facetten, Bezugs-Zeitraum) in
// EINEM localStorage-Schlüssel und EINEM Hörer-Satz (§5). Bedien-Oberfläche:
// `LeserAnsichtMenu.tsx` (V1) und `v3/LeserAnsichtV3.tsx` (V3), beide auf DIESEM
// Store. Chronik der gestrichenen Felder (`verweise`, `linien`, `zeitraum`,
// dreiwertiges `hist`) steht im Vollzugsvermerk S1, FAHRPLAN-LESER-V3 Kap. 7 —
// hier nur, was beim Ändern des Codes noch gebraucht wird:
//
// TOGGLES = data-*-Attribut am <html> + CSS, KEIN React-State im Artikel-Baum.
// Umschalten rendert nur die Switch-Buttons neu, nie die Artikelliste (§15); ein
// Attributsatz am <html> heisst, dass Einzelansicht und jedes Split-Pane
// derselben Wahl folgen. Gesetzt wird IMPERATIV (Vorbild `components/thema.ts`),
// nicht per Inline-Script im Head — die CSP (`vercel.json script-src 'self'`)
// verbietet das; `main.tsx` ruft `wendeLeserOptionenAn()` vor dem ersten Paint
// aus dem gebündelten Modul ⇒ kein Flackern, kein Hydration-Mismatch. Default
// 'an' emittiert KEINE CSS-Regel (R6: Grundzustand byte-gleich), alle Regeln
// sind auf `.lc-leser` gescopt (index.css) ⇒ nur der Reader ist betroffen.
//
// FILTERWERTE (Facetten, Kantone, Von-Bis) sind JS-konsumiert, kein Attribut:
// sie entscheiden, WELCHER Shard geladen wird — das kann CSS nicht. Sie werden
// über Primitiv-/Referenz-stabile Selektoren abonniert, damit ein fremder Toggle
// sie nicht re-rendern lässt (§15). `getSnapshot` MUSS eine stabile Referenz
// liefern: darum zwei Strings statt eines `{von, bis}`-Objekts und Arrays, die
// nur im Setter ersetzt werden — ein je Aufruf neu gebauter Wert liesse React
// schleifen.
//
// GESTRICHENE SCHLÜSSEL im Bestands-Speicher (`verweise`, `linien`, `zeitraum`,
// `hist`) stehen nicht in FELDER und werden beim Laden ignoriert; `speichere()`
// räumt sie beim nächsten Schreiben ab. `hist` wird als EINZIGER noch GELESEN —
// `migriereOptFelder` bildet ihn ab (unten). Bei `zeitraum` ist das Abräumen
// nicht Kosmetik: bliebe er stehen, rechnete die Migration bei jedem Laden gegen
// ein neues «heute», und «letzte 5 Jahre» rutschte täglich weiter.
//
// Ä25 (S1-Nachzug 17.8.2026, §7): der gestrichene Schalter `verweise` wirkte auf
// eine DAUERHAFTE gepunktete Unterstreichung, nicht — wie hier und an vier
// weiteren Stellen behauptet — auf eine Hover-Zierde (`NormText.tsx:38` setzt
// `underline` unbedingt). Offene Design-Frage, Fahrplan Kap. 7 «Offen aus S1».

import { useSyncExternalStore } from 'react';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { DEFAULT_KLASSEN, normalisiereKantone, normalisiereKlassen } from './bezugAuswahl';
import { migriereZeitraum, normalisiereBereich } from './bezugZeit';
import { heuteIso } from '../../lib/format';

/**
 * Die drei zweiwertigen Lese-Schalter:
 *
 * · `fussnoten`    — amtlicher Apparat + Marker (A1: «aus» = verschwinden).
 * · `histansicht`  — Änderungsvermerke. «aus» blendet AUSSCHLIESSLICH `kl:'A'`
 *                    aus; V/G/Z/U und jede Fussnote OHNE Klasse bleiben sichtbar
 *                    (H0-Auflage 1, `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`
 *                    Ziff. 7.4 — dort auch die drei Träger der CSS-Regel).
 * · `leitfaelle`   — Rechtsprechungs-Hinweise im Lesetext.
 */
export type OptFeld = 'fussnoten' | 'histansicht' | 'leitfaelle';
export type OptWert = 'an' | 'aus';
export type LeserOptionen = Record<OptFeld, OptWert>;

/**
 * LESER-SCHRIFTSKALA (David 16.8.2026, Punkt 4) — vier Stufen NUR für den
 * Normtext. Der globale App-Regler (`components/layout/useSchriftskala.ts`)
 * skaliert per `font-size` am <html> die ganze Anwendung mit; genau das war der
 * gemeldete Fehler, er bleibt aber als Barrierefreiheits-Einstellung unangetastet.
 *
 * Eigenes Feld statt `OptFeld`, weil VIERwertig. NAMEN statt Zahlen: ein
 * gespeicherter Faktor müsste bei jeder Skalen-Änderung neu gesnappt werden, ein
 * Name bleibt gültig. `normal` emittiert KEINE CSS-Regel (index.css) ⇒ die
 * Vorgabestufe ist byte-gleich zum Ist-Stand (R6/§6), der Pixelvergleich der
 * V3-Paritätsspecs bleibt gültig.
 */
export type LeserSchrift = 'normal' | 'mittel' | 'gross' | 'sehr-gross';

const KEY = 'lm.leser.optionen';
const FELDER: readonly OptFeld[] = ['fussnoten', 'histansicht', 'leitfaelle'];
const DEFAULT: LeserOptionen = { fussnoten: 'an', histansicht: 'an', leitfaelle: 'an' };

/** Alt-Schlüssel des dreiwertigen Historie-Felds (vor S1). */
const ALT_HIST_KEY = 'hist';
/** Alt-Werte, die «Änderungsvermerke sichtbar» BEDEUTETEN (beide Darstellungen). */
const ALT_HIST_AN: readonly string[] = ['fussnoten', 'chronologie'];

/**
 * S1-MIGRATION — gespeicherte Optionen → die drei zweiwertigen Felder.
 *
 * REIN und deterministisch (§2): kein Speicher, kein DOM, keine Uhr — und darum
 * eigene exportierte Funktion statt Zweig in `lade()`. Der Fall, der wehtut, ist
 * ein Bestands-Speicher, und der ist im Browser nicht mehr nachstellbar, sobald
 * er einmal überschrieben wurde (`src/tests/leser-optionen-migration.test.ts`).
 *
 * Drei Regeln, jede aus §8 «keine Nutzerwahl still kippen»:
 *  1. `histansicht: 'an'|'aus'` — schon migriert, gilt unverändert.
 *  2. Sonst Alt-Schlüssel `hist`: 'aus' → 'aus'; 'fussnoten' UND 'chronologie'
 *     → 'an'. Beide Alt-Werte bedeuteten «die Vermerke sind da», nur in zwei
 *     Darstellungen — sie auf 'aus' abzubilden nähme dem Nutzer Substanz weg,
 *     die er ausdrücklich bestellt hatte.
 *  3. Alles andere fällt auf den Default. Ein unbekannter Wert darf NIE
 *     durchrutschen: er landete als `data-histansicht="…"` am <html>, wo keine
 *     Regel greift — der Schalter stünde dann falsch zu einer Stellung, die es
 *     nicht gibt (gleiche Sicherung wie bei der Schriftskala).
 */
export function migriereOptFelder(roh: Readonly<Record<string, unknown>>): LeserOptionen {
  const opt: LeserOptionen = { ...DEFAULT };
  for (const f of FELDER) if (roh[f] === 'an' || roh[f] === 'aus') opt[f] = roh[f] as OptWert;
  if (roh.histansicht !== 'an' && roh.histansicht !== 'aus') {
    const alt = roh[ALT_HIST_KEY];
    opt.histansicht = alt === 'aus'
      ? 'aus'
      : (typeof alt === 'string' && ALT_HIST_AN.includes(alt) ? 'an' : DEFAULT.histansicht);
  }
  return opt;
}
// ── Ä27 IST GESTRICHEN (Ä69, Entscheid David 17.8.2026) ──────────────────────
// `HINWEIS_VERMERKE_OHNE_FUSSNOTEN` («Marker und Apparat sind mit den Fussnoten
// ausgeblendet») stand als Hinweiszeile am Schalter «Änderungsvermerke», sobald
// «Fussnoten: aus» war. Er erklärte eine KREUZ-ABHÄNGIGKEIT: der Schalter zeigte
// «✓ an», sichtbar war aber nur die «Fassung»-Zeile, weil Marker und Apparat der
// A-Klasse am Fussnoten-Schalter hingen.
//
// Mit der Entkopplung (Ä68, index.css) gibt es diese Abhängigkeit nicht mehr.
// «Änderungsvermerke: an» heisst jetzt in JEDER Stellung des Fussnoten-Schalters
// dasselbe und ist immer vollständig eingelöst — die Fassungs-Zeile ist die
// ganze Fläche des Schalters, und sie ist dann da. Der Satz beschreibt seit der
// Entkopplung die Wirkung des ANDEREN Schalters und legt am Vermerke-Schalter
// eine Teil-Unwirksamkeit nahe, die es nicht gibt (§8, jetzt umgekehrt).
// §17-Rückbau: gestrichen statt umformuliert — eine Hinweiszeile ohne erklärte
// Abhängigkeit hat keinen Anlass mehr. Beide Menüs (V1 `LeserAnsichtMenu`, V3
// `LeserAnsichtV3`) verlieren sie gemeinsam; sie war ausdrücklich EINE Konstante,
// damit beide Hüllen denselben Satz zeigen (§5) — also fällt sie auch in beiden.

/** Aufsteigend — die Reihenfolge IST die Regler-Achse (`leserSchrift.ts`). */
export const SCHRIFT_STUFEN: readonly LeserSchrift[] = ['normal', 'mittel', 'gross', 'sehr-gross'];
const DEFAULT_SCHRIFT: LeserSchrift = 'normal';

// W2·7-BEZUG/B4: Grundzustand der Bezugs-Facetten = NUR Leitentscheide (§9 B4
// «Default konservativ»). Die geteilte Konstanten-Referenz macht den häufigen
// Fall referenz-stabil: solange niemand umschaltet, liefert `getKlassenSnapshot`
// IMMER dasselbe Array-Objekt ⇒ kein Re-Render der Abonnenten (Object.is, §15).
const DEFAULT_BEZUG_KLASSEN: readonly BezugStatus[] = [...DEFAULT_KLASSEN];
const KEINE_KANTONE: readonly string[] = [];

interface GeladenerZustand {
  opt: LeserOptionen;
  schrift: LeserSchrift;
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
    opt: { ...DEFAULT }, schrift: DEFAULT_SCHRIFT,
    bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
    bezugVon: '', bezugBis: '', migriert: false,
  };
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return grund;
    const o = JSON.parse(roh) as Record<string, unknown>
      & { zeitraum?: unknown; schrift?: unknown; bezugKlassen?: unknown;
          bezugKantone?: unknown; bezugVon?: unknown; bezugBis?: unknown };
    // S1: Whitelist-Prüfung UND Alt-Wert-Abbildung in einer reinen Funktion.
    const opt = migriereOptFelder(o);
    // Schrift-Stufe: dieselbe Whitelist-Prüfung wie oben — was nicht im
    // Vokabular steht (fehlend, `undefined`, Zahl, Alt-Wort, manipulierter
    // Speicher), fällt auf die Vorgabestufe. Ein unbekannter Wert darf NIE
    // durchrutschen: er landete sonst als `data-leserschrift="…"` am <html>,
    // wo keine Regel greift — der Nutzer sähe eine Stufe, die es nicht gibt.
    const schrift = SCHRIFT_STUFEN.includes(o.schrift as LeserSchrift)
      ? (o.schrift as LeserSchrift) : DEFAULT_SCHRIFT;
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
    return { opt, schrift, bezugKlassen, bezugKantone, bezugVon: bereich.von, bezugBis: bereich.bis, migriert };
  } catch {
    // localStorage gesperrt (privater Modus) ODER kaputtes JSON → Default.
    return grund;
  }
}

// getSnapshot muss eine STABILE Referenz liefern (sonst warnt/looped React).
// `aktuell`/`aktuellVon`/`aktuellBis` werden nur bei echten Änderungen ersetzt.
const start = typeof window === 'undefined'
  ? {
      opt: { ...DEFAULT }, schrift: DEFAULT_SCHRIFT,
      bezugKlassen: DEFAULT_BEZUG_KLASSEN, bezugKantone: KEINE_KANTONE,
      bezugVon: '', bezugBis: '', migriert: false,
    }
  : lade();
let aktuell: LeserOptionen = start.opt;
let aktuellSchrift: LeserSchrift = start.schrift;
let aktuellKlassen: readonly BezugStatus[] = start.bezugKlassen;
let aktuellKantone: readonly string[] = start.bezugKantone;
let aktuellVon: string = start.bezugVon;
let aktuellBis: string = start.bezugBis;

function speichere(): void {
  try {
    // Die gestrichenen Schlüssel (`zeitraum`, `hist`, `verweise`, `linien`)
    // stehen bewusst NICHT im Objekt — Begründung im Datei-Kopf.
    localStorage.setItem(KEY, JSON.stringify({
      ...aktuell, schrift: aktuellSchrift,
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
 *  main.tsx, analog `wendeThemaAn`). Setzt data-fussnoten/-histansicht/-leitfaelle
 *  am <html>; Default 'an' ⇒ CSS-No-op ⇒ byte-gleiche heutige Darstellung. Der
 *  Zeit-Bereich ist JS-konsumiert (kein data-*-Attribut). */
export function wendeLeserOptionenAn(): void {
  if (typeof document === 'undefined') return;
  const g = lade();
  aktuell = g.opt;
  aktuellSchrift = g.schrift;
  // B4: JS-konsumiert (kein data-*-Attribut) — die Weiche «welcher Shard» und
  // die Gruppierung der Kanten sind React-Zustand, nicht CSS.
  aktuellKlassen = g.bezugKlassen;
  aktuellKantone = g.bezugKantone;
  aktuellVon = g.bezugVon;
  aktuellBis = g.bezugBis;
  if (g.migriert) speichere();
  const el = document.documentElement;
  // S1: `histansicht` läuft in DIESER Schleife mit (kein Sonderweg mehr) — der
  // Attributname folgt dem Feldnamen, also bleibt `data-histansicht` wie bisher
  // die eine CSS-Weiche. Default 'an' emittiert KEINE Regel ⇒ byte-gleich (R6).
  for (const f of FELDER) el.setAttribute(`data-${f}`, aktuell[f]);
  // Leser-Schriftskala: CSS-getrieben wie die Toggles, also dasselbe
  // Pre-Paint-Attribut am <html>. Das ATTRIBUT steht global, die WIRKUNG nicht:
  // die einzige Regel, die es auswertet, ist auf `.lc-leser .nt-art-cv` gescopt
  // (index.css) — Kopfzeile, Seitenleiste und der Rest der App bleiben unberührt.
  // Genau darin unterscheidet es sich vom globalen `font-size`-Steller am <html>.
  // Die Vorgabestufe 'normal' emittiert KEINE Regel ⇒ Grundzustand byte-gleich (R6).
  el.setAttribute('data-leserschrift', aktuellSchrift);
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

/** Leser-Schriftskala setzen. Mechanik wie `setzeOption`: Attribut direkt
 *  ans <html>, persistieren, Hörer benachrichtigen — KEIN Artikel-Re-Render, die
 *  Umschaltung ist reines CSS (§15). Ein unbekannter Wert kann hier nicht
 *  eintreten (Typ), und `lade()` fängt ihn beim nächsten Start ab. */
export function setzeLeserSchrift(s: LeserSchrift): void {
  if (s === aktuellSchrift) return;
  aktuellSchrift = s;
  speichere();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-leserschrift', s);
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

/** B5: Primitiv-Selektoren auf die beiden Bereichs-Enden. ZWEI Hooks auf zwei
 *  Strings statt einer auf `{von, bis}` — Begründung (stabile Referenz) im
 *  Datei-Kopf. Wer beide Enden als Objekt braucht, baut es im eigenen `useMemo`. */
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

/** Primitiv-Selektor auf die Leser-Schriftstufe — nur ein String, also rendern
 *  die Abonnenten (die drei Regler-Elemente) bei fremden Toggles nicht neu
 *  (Object.is, §15). Der Normtext folgt dem `data-leserschrift`-Attribut per
 *  CSS und wird beim Umschalten NICHT neu gerendert. */
function getSchriftSnapshot(): LeserSchrift {
  return aktuellSchrift;
}
function getSchriftServerSnapshot(): LeserSchrift {
  return DEFAULT_SCHRIFT;
}
export function useLeserSchriftStufe(): LeserSchrift {
  return useSyncExternalStore(abonniere, getSchriftSnapshot, getSchriftServerSnapshot);
}

/** B4: Selektoren auf die Bezugs-Facetten. Die Arrays werden ausschliesslich in
 *  den Settern ersetzt und dazwischen geteilt; im Grundzustand ist es dieselbe
 *  Modul-Konstante (`DEFAULT_BEZUG_KLASSEN`), sodass der unveränderte Reader gar
 *  keinen Re-Render sieht. */
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
