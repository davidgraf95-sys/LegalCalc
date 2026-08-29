// ─── Adresse eines Erlasses: DIE eine Ableitung (§5) ────────────────────────
//
// Cowork-Befund 45 (18.8.2026) / Entscheid David 29.8.2026 («ja, mit
// Redirects»): Staatsverträge lagen unter `/gesetze/bund/<key>`. Sie tragen im
// Register `ebene: 'bund'` — richtig, denn ein ratifizierter Staatsvertrag IST
// Landesrecht und steht in der SR (0.xxx); die Snapshot-Dateien liegen darum
// unter `public/normtext/bund/`. Für den Leser ist «Bund» in der Adresse
// gleichwohl die falsche Auskunft: die Brotkrume sagt seit Cowork-Befund 14
// «International» (erlassAnsicht.ebeneAngabe), die Reiter-Herkunft ebenso
// (tabGruppen.herkunftVon) — nur die URL widersprach beiden.
//
// Deshalb ZWEI Ebenen-Begriffe, sauber getrennt:
//
//   DATEN-Ebene  (`BrowseErlass.ebene`, 'bund' | 'kanton')
//       Wo der Snapshot liegt: `/normtext/<datenEbene>/<key>.json`,
//       `/normtext/struktur/<datenEbene>/<key>.json`. Unverändert.
//
//   ROUTEN-Ebene (`routenEbene()`, 'bund' | 'kanton' | 'international')
//       Was in der Adresse steht: `/gesetze/<routenEbene>/<key>`.
//
// Vor diesem Modul erzeugten rund zwanzig Stellen den Pfad je selbst per
// Template-Literal, drei davon mit fest verdrahtetem `bund`. Genau das ist der
// Grund, warum die Falschadresse so lange überlebte. Ab hier gilt: WER EINEN
// ERLASS-PFAD BAUT, RUFT `erlassPfad()`. Ein zweiter Pfad-Formatierer ist ein
// §5-Verstoss und wird vom Tor `src/tests/erlass-adresse.test.ts` gemeldet.

import { ERLASS_REGISTER } from './register';
import type { BrowseErlass } from './browse-typen';

/** Ebene, wie sie in der ADRESSE steht — nicht die Daten-Ebene des Registers. */
export type RoutenEbene = 'bund' | 'kanton' | 'international';

// GESTRICHEN (Gegenprüfung 29.8.2026, Mangel 6): hier standen `ROUTEN_EBENEN`
// und `istRoutenEbene` — beide ohne einen einzigen Aufrufer, während
// `RouteSwitch.tsx:88` die Liste von Hand führt. Ein Modul, das «EINE Ableitung»
// verspricht und die Hilfsmittel dafür ungenutzt mitliefert, ist keine Quelle,
// sondern Beiwerk (§17 Rückbau). Die Liste in RouteSwitch bleibt, wo sie ist:
// sie beantwortet eine ROUTEN-Frage («kenne ich dieses Segment?») und darf den
// Start-Bundle nicht um das Register vergrössern.

/**
 * Routen-Ebene eines Erlasses. «International» (Staatsvertrag) schlägt die
 * Daten-Ebene — dieselbe Vorrang-Regel, die `tabGruppen.herkunftVon` und
 * `erlassAnsicht.ebeneAngabe` schon anwenden; beide leiten jetzt von hier ab,
 * damit es die Regel nur einmal gibt.
 */
export function routenEbene(e: Pick<BrowseErlass, 'ebene' | 'rechtsgebiet'>): RoutenEbene {
  if (e.rechtsgebiet === 'international') return 'international';
  return e.ebene;
}

/**
 * Daten-Ebene zu einer Routen-Ebene: wo die Snapshot-/Struktur-Dateien liegen.
 *
 * 'international' ist eine reine Adress-Ebene ohne eigenes Datenverzeichnis —
 * die Staatsverträge liegen unter `bund`. Dass diese Zuordnung stimmt, ist
 * KEINE Annahme, sondern bewacht: `erlass-adresse.test.ts` prüft gegen das
 * gebaute Register, dass jeder Erlass mit Routen-Ebene 'international' die
 * Daten-Ebene 'bund' trägt. Käme je ein kantonaler Staatsvertrag hinzu, wird
 * das Tor rot, statt dass hier still die falsche Datei geladen wird.
 */
export function datenEbeneVonRoute(routen: string): string {
  return routen === 'international' ? 'bund' : routen;
}

/** Adresse eines Erlasses: `/gesetze/<routenEbene>/<key>`.
 *
 *  `encodeURIComponent` lässt A-Za-z0-9 und `_ . - ! ~ * ' ( )` unberührt;
 *  Bund-Keys (UPPERCASE/_/Ziffern) bleiben identisch, kantonale Keys mit
 *  Sonderzeichen werden prozentkodiert — Pfad == sitemap-loc == canonical ==
 *  Dateiname-Basis, durchgehend eine Form. */
export function erlassPfad(e: Pick<BrowseErlass, 'ebene' | 'rechtsgebiet' | 'key'>): string {
  return `/gesetze/${routenEbene(e)}/${encodeURIComponent(e.key)}`;
}

/**
 * Adresse aus einem bereits bekannten ROUTEN-SEGMENT und Schlüssel — für den
 * Leser-Rahmen, der die Route vollzieht und den Erlass evtl. noch nicht
 * aufgelöst hat.
 *
 * DER PARAMETER HEISST NICHT `ebene`, UND DAS IST DER PUNKT (Gegenprüfung
 * 29.8.2026, Mangel 4 · zweiter Durchgang). Befund 45 konnte entstehen, weil
 * das Segment in der Adresse und das Feld im Register denselben Namen tragen:
 * `ebene`. Wer `erlassPfadRoh(e.ebene, e.key)` schreibt, ruft brav die eine
 * Quelle und verdrahtet trotzdem die Daten-Ebene in die Adresse — der Fehler
 * sieht dann aus wie seine eigene Lösung.
 *
 * Seit hier `routenSegment` steht, trägt keine legitime Aufrufstelle mehr
 * etwas namens `ebene` herein; die Sonde in `erlass-adresse.test.ts` kann
 * deshalb den blossen Bezeichner `ebene` an dieser Stelle verbieten, ohne
 * richtige Aufrufe zu treffen.
 */
export function erlassPfadRoh(routenSegment: string, key: string): string {
  return `/gesetze/${routenSegment}/${encodeURIComponent(key)}`;
}

/** Alt-Adresse desselben Erlasses (vor Befund 45), die dauerhaft weiterleitet.
 *  null, wenn der Erlass nie umgezogen ist (Bund-/Kantonserlasse). */
export function erlassAltPfad(e: Pick<BrowseErlass, 'ebene' | 'rechtsgebiet' | 'key'>): string | null {
  if (routenEbene(e) !== 'international') return null;
  return `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
}

// ─── Adresse, wenn nur der Schlüssel bekannt ist ────────────────────────────
//
// Etliche Link-Erzeuger kennen keinen `BrowseErlass`, sondern nur den Key aus
// einem Verweis (Vorlagen-NormChip, Entscheid-Verzahnung, Volltext-Treffer der
// Suche). Vor Befund 45 schrieben sie darum `/gesetze/bund/<key>` FEST hin —
// für einen Staatsvertrag doppelt falsch, denn die Adresse war weder kanonisch
// noch als Alt-Form gedacht. Das Register beantwortet die Frage synchron und
// deterministisch (§2), also fragen sie es jetzt.
const EBENE_JE_KEY: ReadonlyMap<string, RoutenEbene> = new Map(
  ERLASS_REGISTER.map((e) => [e.key, routenEbene(e)] as const),
);

/**
 * Routen-Ebene allein aus dem Schlüssel.
 *
 * DAS REGISTER ENTSCHEIDET, nicht der Aufrufer. `fallback` gilt NUR für
 * Schlüssel, die das Register nicht kennt — dort gibt es nichts zu entscheiden,
 * und eine ehrliche Fehlseite ist besser als ein geratener Sprung.
 *
 * Dass hier das Register gewinnt und nicht die übergebene Ebene, ist ein
 * Nachzug aus der Gegenprüfung (29.8.2026, Mangel 1): vorher war der Parameter
 * der Fallback FÜR ALLE Keys, und damit lieferte `/gesetze/international/OR`
 * eine vollständige, funktionierende OR-Seite — mit der Brotkrume «Bund». Also
 * exakt Befund 45, nur spiegelverkehrt: eine zweite Adresse, deren URL der
 * angezeigten Ebene widerspricht (§5/§8). Registerautoritativ gilt das für
 * jeden BUNDES-Erlass (ERLASS_REGISTER, 238 Keys): genau EINE Adresse, jede
 * andere leitet dorthin. Kantons-Keys (1231) fallen auf das URL-Segment
 * zurück — /gesetze/<beliebig>/AG-291.150 rendert (VORBESTEHENDE Klasse,
 * Gegenprüfung 29.8.2026 Befund 1; Wurzel-Posten: FAHRPLAN-UI-NAVIGATION §7).
 */
export function routenEbeneVonKey(key: string, fallback = 'bund'): string {
  return EBENE_JE_KEY.get(key) ?? fallback;
}

/** Adresse allein aus dem Schlüssel — siehe `routenEbeneVonKey`. */
export function erlassPfadVonKey(key: string, fallback = 'bund'): string {
  return erlassPfadRoh(routenEbeneVonKey(key, fallback), key);
}

// ─── Gespeicherte Adressen nachziehen ───────────────────────────────────────
//
// Nachzug aus der Gegenprüfung (29.8.2026, Mängel 2 und 3): Reiter
// (`lib/tabs`) und Split-Panes (`layout/usePaneLayout`) speichern PFADE. Ein
// vor dem Umzug gemerkter Reiter, ein versendeter Alt-Link, ein geteilter
// `?p=`-Layout-Link — sie alle tragen die Alt-Adresse in den gespeicherten
// Zustand. Der Client-Sprung im Leser kommt dafür zu spät: der Reiter ist
// bereits geschrieben, wenn der Leser überhaupt rendert, und es entstand ein
// toter Zweitreiter neben dem echten.
//
// Darum kanonisiert JEDE Stelle, die einen Pfad SPEICHERT, ihn vorher hier.
// Damit bleibt die Weiterleitung, was der Entscheid wollte — eine Brücke für
// Alt-Bestand — statt zum Dauerzustand zu werden.

/** Zerlegt `/gesetze/<ebene>/<key>` (Rest = Query/Anker); null, wenn der Pfad
 *  keine Erlass-Adresse ist. */
function zerlegeErlassPfad(pfad: string): { ebene: string; key: string; rest: string } | null {
  const m = /^\/gesetze\/([^/?#]+)\/([^?#]+)(.*)$/.exec(pfad);
  if (!m) return null;
  let key: string;
  try { key = decodeURIComponent(m[2]); } catch { return null; }
  return { ebene: m[1], key, rest: m[3] };
}

/**
 * Kanonische Form einer Erlass-Adresse; alles andere bleibt unverändert.
 * Query und Anker überleben — der Instanz-Diskriminator `?r=<n>` gehört zur
 * Reiter-Identität, und `#art-…` ist die Fundstelle.
 */
export function kanonisierePfad(pfad: string): string {
  const t = zerlegeErlassPfad(pfad);
  if (!t) return pfad;
  const kanonisch = routenEbeneVonKey(t.key, t.ebene);
  if (kanonisch === t.ebene) return pfad;
  return erlassPfadRoh(kanonisch, t.key) + t.rest;
}
