// ─── Leser-Options-Store (W2·5d G2a) — Darstellungs-Toggles, KEINE Rechtslogik (§3) ─
//
// Persistente, rein visuelle Lese-Umschalter für den Gesetzes-Reader
// (FAHRPLAN-GESETZES-UX.md §3 + V2/A23): «Fussnoten» (Marker-Prominenz),
// «Änderungsvermerke» (Historie-Darstellung) und — seit V2·B-1 (David 10.7.2026,
// überstimmt «genau drei Toggles») — «Entscheide»/«Rechtsprechung im Text»
// (`leitfaelle`). Die Bedien-Oberfläche rendern `LeserAnsichtMenu.tsx` (V1) und
// `v3/LeserAnsichtV3.tsx` (V3) — beide auf DIESEM Store (§5).
//
// ─── OPTIONEN-RÜCKBAU S1 (FAHRPLAN-LESER-V3 Kap. 4f, Entscheide David F1/F2
// «ja», 16.8.2026) ───────────────────────────────────────────────────────────
// Der Store trägt jetzt DREI zweiwertige Felder (8 statt 24 Kombinationen):
//
//  · `verweise` ist ERSATZLOS ENTFALLEN (F2). Er wirkte allein auf die gepunktete
//    Unterstreichung der Verweis-Links BEI :hover (`index.css`, Regel entfernt);
//    Farbe, Klickbarkeit, Anker und Ctrl+F waren nie betroffen und bleiben es
//    nicht. Ein alt gespeichertes `"verweise"` steht nicht mehr in FELDER, wird
//    beim Laden also ignoriert und beim nächsten Schreiben abgeräumt.
//  · `histansicht` ist von DREI Werten ('aus' | 'fussnoten' | 'chronologie') auf
//    ZWEI ('an' | 'aus') zurückgebaut (F1) und lebt seither als gewöhnliches
//    Toggle-Feld in `FELDER` — die frühere Sonderbehandlung (eigener Setter,
//    eigener Selektor, eigene Attribut-Zeile, eigenes Vokabular) ist damit weg.
//    Der «Chronologie»-Modus entfällt; dieselben Vermerke stehen im Apparat.
//    Alt gespeicherte Werte bildet `migriereOptFelder` ab (unten).
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
// Alle drei Felder: Default 'an' = heutige Darstellung → data-*="an" ist ein
// CSS-No-op (R6: Grundzustand byte-gleich). Alle CSS-Regeln sind auf
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

/**
 * Die drei zweiwertigen Lese-Schalter (S1, Kap. 4f):
 *
 * · `fussnoten`    — amtlicher Fussnoten-Apparat + Marker (A1: «aus» = verschwinden).
 * · `histansicht`  — Änderungsvermerke: Marker, Apparat-Zeile und «Fassung»-Zeile
 *                    der Klasse 'A'. «aus» blendet AUSSCHLIESSLICH `kl:'A'` aus;
 *                    V/G/Z/U und jede Fussnote OHNE Klasse bleiben sichtbar
 *                    (H0-Auflage 1, `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`).
 * · `leitfaelle`   — Rechtsprechungs-Hinweise im Lesetext.
 *
 * `histansicht` war bis S1 ein dreiwertiges Sonderfeld (`HistAnsicht`) mit
 * eigenem Setter und eigenem Selektor. Der Grund dafür war der dritte Wert
 * 'chronologie' — eine zweiwertige Option in derselben Union zu führen war
 * typunsicher. Mit F1 («Chronologie» entfällt) ist die Union zweiwertig, und die
 * Sonderbehandlung fällt mit ihr: ein Feld, ein Setter, ein Attribut-Satz (§5).
 */
export type OptFeld = 'fussnoten' | 'histansicht' | 'leitfaelle';
export type OptWert = 'an' | 'aus';
export type LeserOptionen = Record<OptFeld, OptWert>;

/**
 * LESER-SCHRIFTSKALA (David-Anmerkung 16.8.2026, Punkt 4: «Schriftgrössen-Regler
 * wirkt auf die ganze Seite»).
 *
 * VIER Stufen für die Grösse des NORMTEXTS im Leser — und nur dort. Der globale
 * App-Regler (`components/layout/useSchriftskala.ts`, Schlüssel
 * `lexmetrik-schriftskala`) setzt `font-size` am `<html>` und skaliert damit
 * jedes rem-Token der ganzen Anwendung: Kopfzeile, Seitenleiste, Topbar. Das ist
 * als globale Barrierefreiheits-Einstellung richtig und bleibt unangetastet —
 * als «Schriftgrösse» IM Lesewerkzeug war es der gemeldete Fehler.
 *
 * Der Wert lebt als eigenes Feld im SELBEN persistenten Store: ein
 * localStorage-Schlüssel, ein Hörer-Satz (§5), geteilt von V1 und V3 — kein
 * zweiter Schriftgrössen-Speicher. Eigenes Feld und kein `OptFeld`, weil er
 * VIERwertig ist (die Toggle-Union ist zweiwertig).
 *
 * Bewusst NAMEN statt Zahlen: die Stufe ist eine Nutzerwahl, keine Rechengrösse.
 * Ein gespeicherter Faktor müsste bei jeder Änderung der Skala neu gesnappt
 * werden (so wie `stufeIndex` es global tun muss); ein Name bleibt gültig, und
 * die Whitelist-Prüfung beim Laden ist derselbe Einzeiler wie bei den Toggles.
 *
 * `normal` = die heutige Normtext-Grösse (`text-body-l` = 1.125rem). Es emittiert
 * KEINE CSS-Regel (index.css) ⇒ die Vorgabestufe ist byte-gleich zum Ist-Stand
 * (R6/§6) und der Pixelvergleich der V3-Paritätsspecs bleibt gültig.
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
 * REIN und deterministisch (§2): kein Speicher, kein DOM, keine Uhr. Genau
 * deshalb steht sie hier als eigene, exportierte Funktion und nicht als Zweig in
 * `lade()` — der Fall, der wehtut, ist ein Bestands-Speicher, und der ist im
 * Browser nicht mehr nachstellbar, sobald er einmal überschrieben wurde
 * (`src/tests/leser-optionen-migration.test.ts`).
 *
 * Drei Regeln, jede mit einer Begründung aus §8 (keine Nutzerwahl still kippen):
 *
 *  1. `histansicht: 'an'|'aus'` — schon migrierter Speicher, gilt unverändert.
 *  2. Sonst der Alt-Schlüssel `hist`: 'aus' → 'aus'; 'fussnoten' UND
 *     'chronologie' → 'an'. Beide Alt-Werte bedeuteten «die Vermerke sind da»,
 *     nur in zwei Darstellungen — wer «Chronologie» gewählt hatte, wollte die
 *     Vermerke SEHEN. Sie auf 'aus' abzubilden hiesse, ihm amtliche Substanz
 *     wegzunehmen, die er ausdrücklich bestellt hat.
 *  3. Alles andere (fehlend, `undefined`, Zahl, Wort aus keinem Vokabular,
 *     manipulierter Speicher) fällt auf den Default. Ein unbekannter Wert darf
 *     NIE durchrutschen: er landete sonst als `data-histansicht="…"` am <html>,
 *     wo keine Regel greift — der Nutzer sähe eine Stellung, die es nicht gibt,
 *     und der Schalter stünde falsch (gleiche Sicherung wie bei der Schriftskala).
 *
 * Der ebenfalls entfallene Schlüssel `verweise` wird NICHT gelesen: er steht
 * nicht in FELDER, kann also nichts mehr einschalten, und `speichere()` räumt ihn
 * beim nächsten Schreiben ab (dieselbe Mechanik wie `linien` und `zeitraum`).
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
/**
 * Ä27 (S1-Nachzug, 17.8.2026): Hinweis-Unterzeile am Schalter
 * «Änderungsvermerke», eingeblendet NUR bei «Fussnoten: aus».
 *
 * Befund des Ästhetik-Prüfers: das Menü ist flach, die Abhängigkeit unsichtbar.
 * Steht «Fussnoten» auf `aus`, zeigt «Änderungsvermerke» weiter «✓ an», sichtbar
 * sind aber weder Marker noch Apparat — nur die «Fassung»-Zeile, die dem
 * Fussnoten-Schalter nicht folgt. Der Schalter sagt damit die Wahrheit über den
 * Store und die Unwahrheit über den Bildschirm (§8).
 *
 * Der Text steht als EINE Konstante hier, weil ihn V1 (`LeserAnsichtMenu`) und
 * V3 (`v3/LeserAnsichtV3`) beide zeigen und gleich zeigen müssen (§5) — zwei
 * Literale wären zwei Wahrheiten, die auseinanderlaufen (Präzedenz: die
 * Label-Schwellen des Menü-Paars, B6).
 */
export const HINWEIS_VERMERKE_OHNE_FUSSNOTEN =
  'Marker und Apparat sind mit den Fussnoten ausgeblendet';

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
    // `zeitraum` wird NICHT mitgeschrieben: das Feld ist mit B5 entfallen, und
    // ein weitergeschleppter Alt-Wert liesse die Migration bei jedem Laden neu
    // greifen. Ein einziges Schreiben räumt ihn ab. Gleiches gilt seit S1 für
    // `hist` (dreiwertig) und `verweise` — beide stehen nicht mehr im Objekt.
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
