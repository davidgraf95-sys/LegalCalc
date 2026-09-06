import { pfadTeil } from './verlaufLabel';

// ─── Offene In-App-Reiter (Tab-Streifen, Auftrag David) ─────────────────────
//
// SSoT des localStorage-Keys 'lexmetrik-tabs' (§5). Reines Speicher-Werkzeug,
// KEINE Rechtslogik (§3): die Liste der zugleich offenen Reiter (Engines,
// Gesetze, Vorlagen, Entscheide), damit man ohne Browser-Tab zwischen mehreren
// hin- und herwechseln kann. Gespeichert wird NUR der Navigationspfad (+ optio-
// nales Anzeige-Label), NIE Formularinhalte (Berufsgeheimnis; das v1 erhält die
// Reiter-LISTE über Reloads, nicht den flüchtigen Formular-State — bewusste
// Grenze, navigationsbasiert). Reihenfolge = Array-Position, NEUE Reiter HINTEN
// angehängt (stabil, anders als der neueste-vorn-Ring in verlauf.ts) — kein
// Zeitstempel, also kein Date.now() in src/lib (§2 Determinismus).

export interface TabEintrag {
  path: string;
  label?: string;
  /** ── W2·24 R2-NACHZUG (F5) · DER GEWÄHLTE ANKER, GETRENNT VOM GELESENEN ───
   *  `path` trägt die LESESTELLUNG: der Scroll-Spy des Lesers schiebt dort
   *  laufend `#art-…` hinein (`aktualisiereTabArtikel`), damit ein Neustart an
   *  derselben Stelle aufsetzt (§5a Ziff. 6) und die Reiter-Liste die Position
   *  zeigt. GEMESSEN 6.9.2026 (Preview 4335, `/gesetze/bund/ZGB`): nach 1500 px
   *  Scrollen stand im Reiter `…/ZGB#art-3`, in der ADRESSE weiter `…/ZGB` —
   *  dieselbe Adresse trug damit zwei Beschriftungen («ZGB» kalt, «Art. 3 ZGB»
   *  nach dem Scrollen), obwohl niemand einen Artikel gewählt hatte (Befund F5).
   *  `wahl` hält darum den Anker, den die ADRESSE trug (Deep-Link, Trefferklick,
   *  Sprungziel) — daraus, und NUR daraus, wird die Beschriftung gebaut
   *  (§5a Ziff. 2 «Art. 336c OR»). Ohne Hash in der Adresse bleibt der zuletzt
   *  gewählte Anker stehen; er wird nie aus der Lesestellung nachgezogen. */
  wahl?: string;
  /** ── D19 (David 6.9.2026: «mit plus einen neuen reiter erzeugen können») ──
   *  Markiert den EINEN Browser-artigen «+»-Reiter: Pfad `/`, aber — anders
   *  als die sonst reiterlose Startseite (D7-Abweichung unten) — ein
   *  ausdrücklich angelegtes, noch UNGEFÜLLTES Dokument. `neuerLeererReiter`
   *  legt höchstens einen gleichzeitig an; die erste Navigation/Suche
   *  ERSETZT ihn (§5a Ziff. 3, über `ersetzeTab`) mit einem frischen Eintrag
   *  OHNE dieses Feld — er ist dann kein leerer Reiter mehr, ganz ohne
   *  Sonderfall an der Ersetzungsstelle. */
  leer?: boolean;
}

// ─── D7 (David 6.9.2026: «achte darauf dass der reiter bei gesetz mitzählt») ─
//
// PFLICHTFALL (e) aus dem Befund: «Übersicht /gesetze: Reiter? — Regel
// festlegen». Die bis hierher geltende Regel war «Übersichten erzeugen KEINEN
// Reiter» (`components/TabTracker.tsx`, Kommentar seit der Einführung). Sie
// hatte einen guten Grund — ein Seitenleisten-Klick sollte nicht jedes Mal
// einen Reiter anlegen —, aber dieser Grund ist mit §5a Ziff. 3 entfallen: seit
// dem R2-Nachzug ERSETZT eine Navigation den aktiven Reiter, sie häuft nicht
// mehr an. Was damals Wildwuchs erzeugt hätte, erzeugt heute genau einen
// Reiter, der weiterwandert.
//
// NEUE REGEL, in einem Satz: Die fünf BEREICHS-Übersichten sind Reiter wie
// jedes andere Dokument — «Gesetze», «Rechtsprechung», «Materialien»,
// «Rechner», «Vorlagen»; sie zählen in «N offen» und in Alt+Ziffer mit.
//
// ABWEICHUNG, ausdrücklich offengelegt (§7): Die STARTSEITE «/» erzeugt
// weiterhin KEINEN Reiter. Sie ist kein Bestandteil der Sammlung, sondern ihr
// Titelblatt: über die Marke von jeder Route aus einen Klick entfernt, ohne
// eigenen Zustand, und ein Reiter «Sammlung» neben den fünf Bereichen wäre der
// einzige, den man nie schliessen wollte. Eine Kurzform trägt sie trotzdem
// (unten) — sie kann als Reiter EXISTIEREN, wenn jemand sie ausdrücklich
// daneben öffnet (Pane, Ctrl-Klick, Prüfbefund R3-F7); nur angelegt wird sie
// nicht von selbst. Ebenso unverändert ohne Reiter: Meta- und Infoseiten
// (/ueber, /methodik, /einstellungen …).
export const BEREICHS_UEBERSICHTEN = [
  '/gesetze', '/rechtsprechung', '/materialien', '/rechner', '/vorlagen',
] as const;

/** Trägt dieser Pfad einen eigenen Reiter? EIN Ort für die Regel (§5) —
 *  gelesen von `components/TabTracker.tsx`. `path` darf ?query/#hash tragen. */
export function istReiterPfad(path: string): boolean {
  const p = path.split('#')[0].split('?')[0];
  return /^\/(rechner|vorlagen|gesetze|rechtsprechung)\/.+/.test(p)
    || (BEREICHS_UEBERSICHTEN as readonly string[]).includes(p);
}

// ─── R3-F7 (Prüfbefund 6.9.2026) · KURZFORM STATT SEO-TITEL ─────────────────
//
// GEMESSEN: der Reiter für «/» trug `SITE_TITEL` («Schweizer Recht an einem
// Ort: …»), weil `labelAusMeta` die SEO-Metadaten der Route zurückgibt — für
// ein Browser-artiges Reiterband die falsche Zeichenkette (§5a Ziff. 2 verlangt
// die kanonische KURZFORM, «Art. 336c OR», «BGE 152 V 52»). Dieselbe Falle
// trifft jede Übersichts-Route, die mit D7 jetzt ein Reiter werden kann.
// Darum eine kleine, geschlossene Tabelle genau für die Routen OHNE eigenes
// Inhalts-Objekt; alles andere holt seine Kurzform weiterhin aus dem Manifest
// (`Reiterleiste.kurzform`). Der volle Titel bleibt im `title` des Reiters.
const KURZFORM: Record<string, string> = {
  '/': 'Sammlung',
  '/gesetze': 'Gesetze',
  '/rechtsprechung': 'Rechtsprechung',
  '/materialien': 'Materialien',
  '/rechner': 'Rechner',
  '/vorlagen': 'Vorlagen',
};

/** Kanonische Kurzform einer Übersichts-/Startseiten-Route — oder null, wenn
 *  die Beschriftung aus dem Inhalt selbst kommt (Erlass, Entscheid, Vorlage). */
export function reiterKurzform(path: string): string | null {
  return KURZFORM[path.split('#')[0].split('?')[0]] ?? null;
}

const KEY = 'lexmetrik-tabs';
const MAX = 50;

/** Identität eines Reiters: pathname + optionaler Instanz-Diskriminator `?r=<n>`.
 *  Erlaubt DASSELBE Gesetz mehrfach offen (Auftrag David): zwei Reiter mit
 *  gleichem Pfad, aber verschiedenem `?r` sind verschiedene Reiter. Andere
 *  Query-Parameter (z.B. ?preset=) und der #Artikel-Anker gehören NICHT zur
 *  Identität — eine Engine mit ?preset=a/b bleibt EIN Reiter, der Artikel ändert
 *  nur Label/Scrollziel. */
export function tabSchluessel(path: string): string {
  const vorHash = path.split('#')[0];
  const [pfad, qs] = vorHash.split('?');
  const r = new URLSearchParams(qs ?? '').get('r');
  return r ? `${pfad}?r=${r}` : pfad;
}
/** Event, mit dem Schreiber (TabTracker, Schliess-Buttons) die Leser
 *  (useTabs → ReiterUebersicht/TabPanel) im selben Browser-Tab synchron halten. */
export const TABS_EVENT = 'lexmetrik:tabs';

export function ladeTabs(): TabEintrag[] {
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is TabEintrag =>
        e && typeof e.path === 'string' &&
        (e.label === undefined || typeof e.label === 'string') &&
        (e.wahl === undefined || typeof e.wahl === 'string') &&
        (e.leer === undefined || typeof e.leer === 'boolean'))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function schreibe(tabs: TabEintrag[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(tabs)); } catch { /* privater Modus — Reiter sind Komfort */ }
  try { window.dispatchEvent(new Event(TABS_EVENT)); } catch { /* SSR/kein window */ }
}

/** Anker der ADRESSE («#art-…») oder undefined. Quelle des `wahl`-Feldes. */
function hashVon(path: string): string | undefined {
  const i = path.indexOf('#');
  return i === -1 ? undefined : path.slice(i);
}

/** Eintrag aus einer Adresse bauen — mit `alt` als Vorzustand desselben Reiters
 *  (Label, Lesestellung und gewählter Anker überleben ein hash-/labelloses
 *  Update). EINE Stelle für diese Regel: `merkeTab` und `ersetzeTab` bauen
 *  denselben Eintrag, sonst driften «anhängen» und «ersetzen» auseinander. */
function eintragAus(path: string, label?: string, alt?: TabEintrag): TabEintrag {
  // Ein Update OHNE Artikel-Anker (z.B. vom TabTracker mit pathname+?r) darf den
  // vom Reader gepflegten Anker NICHT löschen — sonst verlöre die zweite Instanz
  // ihr Live-Label «Kürzel – Art. X» (Auftrag David).
  const neuPath = (!path.includes('#') && alt?.path.includes('#'))
    ? `${path}#${alt.path.split('#')[1]}`
    : path;
  const neuLabel = label ?? alt?.label;
  const neuWahl = hashVon(path) ?? alt?.wahl;
  return {
    path: neuPath,
    ...(neuLabel ? { label: neuLabel } : {}),
    ...(neuWahl ? { wahl: neuWahl } : {}),
  };
}

const gleich = (a: TabEintrag, b: TabEintrag): boolean =>
  a.path === b.path && a.label === b.label && a.wahl === b.wahl;

/** Öffnet/aktualisiert einen Reiter und hängt einen NEUEN hinten an (gekappt auf
 *  die jüngsten MAX). Dublette (per `tabSchluessel`) behält ihre Position
 *  (stabile Reihenfolge) und übernimmt nur ein neu aufgelöstes Label.
 *
 *  ── Seit dem R2-Nachzug ist das der Weg für einen AUSDRÜCKLICH neuen Reiter
 *  (Mittelklick, Ctrl/⌘-Klick, ⌘/Ctrl+Enter in der Suche, «zweite Instanz»).
 *  Die gewöhnliche Navigation geht über `ersetzeTab` (§5a Ziff. 3). */
export function merkeTab(path: string, label?: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx !== -1) {
    const alt = bisher[idx];
    const neu = eintragAus(path, label, alt);
    // nur schreiben, wenn sich etwas ändert (idempotent gegen Mehrfach-Aufruf)
    if (gleich(alt, neu)) return;
    const naechste = [...bisher];
    naechste[idx] = neu;
    schreibe(naechste);
    return;
  }
  schreibe([...bisher, eintragAus(path, label)].slice(-MAX));
}

/** ── §5a Ziff. 3 · EINE NAVIGATION ERSETZT DEN AKTIVEN REITER ───────────────
 *
 *  Wie im Browser: wer einem Link folgt, bekommt KEINEN neuen Reiter, sondern
 *  denselben Reiter mit neuem Inhalt («kein Reiter-Wildwuchs», David 6.9.2026).
 *  Drei Fälle, in dieser Reihenfolge — die Reihenfolge ist die ganze Regel:
 *
 *  1. **Das Ziel ist schon offen** → nur aktualisieren (`merkeTab`-Semantik).
 *     Der Wechsel auf einen bestehenden Reiter darf den vorher aktiven NICHT
 *     wegwerfen; sonst kostete jeder Klick in der Arbeitsleiste einen Reiter.
 *  2. **Der aktive Reiter existiert** → er wird an SEINER Position ersetzt
 *     (Reihenfolge bleibt stabil, der Reiter «wandert» nicht ans Ende).
 *  3. **Kein aktiver Reiter** (Kaltstart, Start-/Übersichtsseite als Herkunft)
 *     → anhängen wie bisher.
 *
 *  `altPath` ist die Adresse, aus der die Navigation kam; `null` heisst «es gab
 *  keinen». Rein deterministisch (§2), kein Zeitstempel, kein DOM. */
export function ersetzeTab(altPath: string | null | undefined, neuPath: string, label?: string): void {
  const teilNeu = tabSchluessel(neuPath);
  const bisher = ladeTabs();
  if (bisher.some((t) => tabSchluessel(t.path) === teilNeu)) { merkeTab(neuPath, label); return; }
  const idxAlt = altPath ? bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(altPath)) : -1;
  if (idxAlt === -1) { merkeTab(neuPath, label); return; }
  const naechste = [...bisher];
  // KEIN `alt`-Vorzustand: der Reiter zeigt jetzt ein ANDERES Dokument — Label,
  // Lesestellung und gewählter Anker des alten gehören nicht dorthin.
  naechste[idxAlt] = eintragAus(neuPath, label);
  schreibe(naechste);
}

/** #12: Reiter umsortieren — verschiebt den gezogenen Reiter (vonPath) an die
 *  Position des Ziel-Reiters (nachPath). Identifikation über `tabSchluessel`
 *  (stabile Reiter-Identität); deterministisch, kein Zeitstempel.
 *
 *  ── D15/D16 (David 6.9.2026) · WOHIN GENAU, SAGT DER ZEIGER ────────────────
 *  «per drag and drop soll man register verschieben können … analog browser».
 *  Im Browser entscheidet die ZEIGERPOSITION über dem Ziel, ob der Reiter davor
 *  oder dahinter einrastet — darum der dritte Parameter. Er ist optional, und
 *  sein Default reproduziert die frühere, richtungsabhängige Regel BIT-GLEICH:
 *  wer nach links zieht, landet vor dem Ziel; wer nach rechts zieht, dahinter.
 *  Genau davon leben die ▲/▼-Knöpfe der Reiter-Liste (`layout/TabPanel.tsx`),
 *  die kein Zeiger-X haben — sie bleiben unangetastet (§6.3).
 *
 *  Der Zielindex wird NACH dem Herausnehmen neu bestimmt: sonst verschiebt der
 *  entnommene Reiter das Ziel um eins, und «davor» landete dahinter. */
export function ordneTabsUm(vonPath: string, nachPath: string, davor?: boolean): void {
  const bisher = ladeTabs();
  const von = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(vonPath));
  const nach = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(nachPath));
  if (von === -1 || nach === -1 || von === nach) return;
  const seite = davor ?? von > nach;
  const naechste = [...bisher];
  const [bewegt] = naechste.splice(von, 1);
  const nachNeu = naechste.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(nachPath));
  naechste.splice(seite ? nachNeu : nachNeu + 1, 0, bewegt);
  schreibe(naechste);
}

export function schliesseTab(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const naechste = bisher.filter((t) => tabSchluessel(t.path) !== teil);
  if (naechste.length !== bisher.length) schreibe(naechste);
}

export function leereTabs(): void {
  schreibe([]);
}

/** Pfad für eine NEUE Instanz desselben Erlasses/Items (Auftrag David: dasselbe
 *  Gesetz mehrfach offen). Hängt den nächsten freien `?r=<n>` an den aktuellen
 *  Pfad (Artikel-Anker bleibt erhalten). Die erste Instanz trägt kein `?r`
 *  (implizit r=1), die nächste `?r=2` usw. */
export function naechsteInstanz(path: string): string {
  const pfad = pfadTeil(path);
  const hash = path.includes('#') ? `#${path.split('#')[1]}` : '';
  const rs = ladeTabs()
    .filter((t) => pfadTeil(t.path) === pfad)
    .map((t) => Number(new URLSearchParams(t.path.split('#')[0].split('?')[1] ?? '').get('r')) || 1);
  const next = (rs.length ? Math.max(...rs) : 0) + 1;
  return `${pfad}?r=${next}${hash}`;
}

/** Aktualisiert NUR den Artikel-Anker (#) eines bereits offenen Reiters mit
 *  dieser Identität — die LESESTELLUNG (Neustart, Reiter-Liste, Auftrag David).
 *  Legt KEINEN neuen Reiter an und ändert die Reihenfolge nicht.
 *  Rührt `wahl` NICHT an: die Beschriftung folgt der Adresse, nicht dem
 *  Scroll-Spy (F5, Herleitung an `TabEintrag.wahl`). */
export function aktualisiereTabArtikel(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx === -1 || bisher[idx].path === path) return;
  const naechste = [...bisher];
  naechste[idx] = { ...bisher[idx], path };
  schreibe(naechste);
}

// ─── D19 (David 6.9.2026: «in der tab zeile oben soll man mit plus einen
//     neuen reiter erzeugen können») · DER LEERE REITER ────────────────────
//
// Ein Browser-«+»: legt einen NEUEN, leeren Reiter an, der bis zur ersten
// Navigation/Suche die Startseite zeigt (§5a Ziff. 3 «Navigation ersetzt den
// aktiven Reiter» übernimmt das Füllen unverändert — `TabTracker.tsx` muss nur
// wissen, dass der leere Reiter der AKTIVE ist, s. dort). Höchstens EIN
// leerer Reiter gleichzeitig: ein zweiter Klick auf «+» aktiviert den
// bestehenden, statt einen zweiten anzulegen — sonst häufen sich leere Reiter
// an, genau der «Reiter-Wildwuchs», den §5a Ziff. 3 verhindern sollte.
//
// Kanonische Anzeige-Bezeichnung, EIN Ort (§5): `Reiterleiste.kurzform` und
// `TabPanel.zeile` lesen von hier statt den String je einmal zu tragen.
export const NEUER_REITER_NAME = 'Neuer Reiter';

/** Legt den einen leeren Reiter an (Pfad `/`, `leer: true`) — oder tut nichts,
 *  wenn schon einer existiert. Der Aufrufer navigiert danach auf `/`; das
 *  Navigieren dorthin ist so oder so richtig, ob neu angelegt oder schon da. */
export function neuerLeererReiter(): void {
  const bisher = ladeTabs();
  if (bisher.some((t) => t.leer)) return;
  schreibe([...bisher, { path: '/', leer: true }].slice(-MAX));
}

/** true, wenn GENAU der leere Reiter (s.o.) gerade existiert. `TabTracker`
 *  braucht das: Pfad `/` erzeugt sonst KEINEN Reiter (D7-Abweichung oben) und
 *  würde ohne diese Ausnahme übersprungen — die nächste Navigation ersetzte
 *  dann nicht ihn, sondern den davor aktiven Reiter (oder häufte an). */
export function hatLeerenReiter(): boolean {
  return ladeTabs().some((t) => t.leer === true);
}
