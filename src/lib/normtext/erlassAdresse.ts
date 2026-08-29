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

/** Die drei Routen-Ebenen, die `/gesetze/:ebene[/:key]` kennt. */
export const ROUTEN_EBENEN: readonly RoutenEbene[] = ['bund', 'kanton', 'international'];

export function istRoutenEbene(x: string): x is RoutenEbene {
  return (ROUTEN_EBENEN as readonly string[]).includes(x);
}

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

/** Adresse aus bereits bekannter Routen-Ebene und Schlüssel (Leser-Rahmen, der
 *  die Route vollzieht und den Erlass evtl. noch nicht aufgelöst hat). */
export function erlassPfadRoh(routen: string, key: string): string {
  return `/gesetze/${routen}/${encodeURIComponent(key)}`;
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
const INTERNATIONAL_KEYS: ReadonlySet<string> = new Set(
  ERLASS_REGISTER.filter((e) => e.rechtsgebiet === 'international').map((e) => e.key),
);

/** Routen-Ebene allein aus dem Schlüssel. `datenEbene` ist die Ebene, die der
 *  Aufrufer ohne Register annehmen würde (fast immer 'bund') — sie gilt, wenn
 *  der Key kein Staatsvertrag ist oder gar nicht im Register steht. */
export function routenEbeneVonKey(key: string, datenEbene = 'bund'): string {
  return INTERNATIONAL_KEYS.has(key) ? 'international' : datenEbene;
}

/** Adresse allein aus dem Schlüssel — siehe `routenEbeneVonKey`. */
export function erlassPfadVonKey(key: string, datenEbene = 'bund'): string {
  return erlassPfadRoh(routenEbeneVonKey(key, datenEbene), key);
}
