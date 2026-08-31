/**
 * kanton-abk-roh — das ROHE amtliche Abkürzungsfeld der Kanton-Erlasse als
 * eigenes, nie lügendes Registerfeld (R8.3 Wurzel-Fix, GP2-Befund F8, 1.9.2026).
 *
 * PROBLEM (F8). Die Pipeline verlor die Information «abbreviation ist LEER»:
 * adapter-lexwork.ts liest `tol.abbreviation` roh, normtext-snapshot.ts backt
 * sie verlustbehaftet in den String «Titel, Kürzel (Nr)» (erlassBezeichnung),
 * browse-manifest.ts rät sie per Last-Comma-Split zurück (identitaetAusErlass).
 * Bei abbreviation='' entsteht «Titel (Nr)» ohne Komma → der No-Comma-Zweig
 * liefert kuerzel=Titel → 142 Titel-Aliase im Such-Artefakt (Live-Belege
 * BS-291.100 «Advokaturgesetz», BS-410.100 «Schulgesetz», AR-421.10
 * «Archivgesetz», alle amtlich abbreviation='').
 *
 * WURZEL-FIX (§5, eine Quelle). Sidecar public/normtext/kanton-abk-roh.json:
 * Snapshot-Stamm → { abk, herkunft, stand[, quelleUrl] }. Das Feld darf leer
 * sein ('' = die Quelle führt KEIN amtliches Kürzel) und LÜGT nie:
 *
 *   herkunft 'api'           — abk ist das verbatim gelesene `tol.abbreviation`
 *                              der kantonalen Erlasssammlungs-API (LexWork),
 *                              mit quelleUrl + stand (Abrufdatum) belegt.
 *                              Schreiber: der Snapshot-Generator bei jedem
 *                              Netz-Lauf (normtext-snapshot.ts) und der
 *                              gezielte --netz-ambig-Lauf des Runners.
 *   herkunft 'rueckrechnung' — offline aus dem komponierten Snapshot-String
 *                              rekonstruiert (s. u.), stand = Abrufdatum des
 *                              Snapshots. Übergangszustand bis zum vollen
 *                              Roh-Neuzug (Fahrplan §5-R8, G2-Lauf); wird von
 *                              'api' überschrieben, nie umgekehrt.
 *
 * RÜCKRECHNUNG (exakt, verlustfrei, fail-closed). erlassBezeichnung komponiert
 * genau zwei Formen: «T, A (Nr)» (A nicht leer, A ≠ T) und «T (Nr)» (sonst).
 * identitaetAusErlass akzeptiert den Last-Comma-Split nur bei kürzel-typischem
 * Tail (istKuerzelFragment). Das Rohfeld wird NUR übernommen, wo der Split
 * akzeptiert wurde (kuerzel ≠ titel und titel ≠ Vollstring); No-Comma- und
 * Fragment-Fälle werden LEER — dort ist offline nicht unterscheidbar, ob die
 * Quelle abbreviation='' lieferte (Titel-Kopie, F8) oder title=='' und die
 * abbreviation allein steht (echte Kürzel wie AR «TZV»/«ABRG»: Snapshot-String
 * «TZV (920.14)»). Diese Mehrdeutigkeitsklasse löst NUR ein API-Abruf
 * (--netz-ambig bzw. G2). Zwei BEWEISE pro Eintrag, beide hart (§6.7):
 *   (a) Round-Trip: erlassBezeichnung(titel, abk, nr) reproduziert den
 *       Snapshot-String byte-gleich;
 *   (b) Eindeutigkeit: unter der Komponier-Grammatik + Annahme-Regel existiert
 *       höchstens EINE akzeptierte nicht-leere Dekomposition (kein zweites
 *       Komma, dessen Tail ebenfalls als Kürzel durchginge) — sonst fail-closed
 *       LEER und im Lauf ausgewiesen.
 *
 * §2: rein/deterministisch, kein Date.now() in der Logik.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { identitaetAusErlass, istKuerzelFragment } from './browse-manifest.ts';
import { erlassBezeichnung } from './erlass-bezeichnung.ts';
import { vergleiche } from './vergleich';

export type AbkRohHerkunft = 'api' | 'rueckrechnung';

export interface AbkRohEintrag {
  /** Verbatim-Wert des abbreviation-Felds ('' = Quelle führt kein Kürzel). */
  abk: string;
  herkunft: AbkRohHerkunft;
  /** Abrufdatum (api) bzw. Abrufdatum des rückgerechneten Snapshots (§7a). */
  stand: string;
  /** Amtliche Quelle des Werts — nur bei herkunft 'api' (§7b). */
  quelleUrl?: string;
}

export type AbkRohMap = Record<string, AbkRohEintrag>;

export const ABK_ROH_DATEINAME = 'kanton-abk-roh.json';

/** Sidecar lesen — fehlend/defekt ⇒ {} (Konsument entscheidet fail-open/closed). */
export function ladeAbkRoh(basis: string): AbkRohMap {
  try {
    return JSON.parse(readFileSync(join(basis, ABK_ROH_DATEINAME), 'utf8')) as AbkRohMap;
  } catch {
    return {};
  }
}

/** Deterministische Serialisierung: Schlüssel sortiert, 2-Space, Trailing-NL. */
export function serialisiereAbkRoh(map: AbkRohMap): string {
  const sortiert: AbkRohMap = {};
  for (const k of Object.keys(map).sort(vergleiche)) sortiert[k] = map[k];
  return JSON.stringify(sortiert, null, 2) + '\n';
}

/** LexWork-Bausteine aus einer Snapshot-/API-URL
 *  ('https://host/{app|api}/de/texts_of_law/id'). Rein; null = kein LexWork. */
export function lexworkAusUrl(url: string): { host: string; lang: 'de' | 'fr'; lawId: string } | null {
  const m = url.match(/^https:\/\/([^/]+)\/(?:app|api)\/(de|fr)\/texts_of_law\/(.+)$/);
  return m ? { host: m[1], lang: m[2] as 'de' | 'fr', lawId: decodeURIComponent(m[3]) } : null;
}

export interface Rueckrechnung {
  /** Rekonstruiertes Rohfeld ('' = No-Comma/Fragment/mehrdeutig → fail-closed). */
  abk: string;
  /** Warum ggf. leer — für Bilanz und Tests. */
  klasse: 'split' | 'no-comma' | 'fragment' | 'mehrdeutig' | 'kein-roundtrip';
}

/** Titel-ohne-Nr aus dem komponierten String (Gegenstück zur Klammer-Regel
 *  von identitaetAusErlass — dieselbe Regex, §5). */
function ohneNr(erlass: string): string {
  return erlass.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Beweis (b): zählt die unter Komponier-Grammatik + Annahme-Regel gültigen
 * nicht-leeren Dekompositionen (t, a) des Snapshot-Strings. Gültig heisst:
 * t und a nicht leer, a ≠ t, Tail kürzel-typisch (¬istKuerzelFragment) und
 * erlassBezeichnung(t, a, nr) byte-gleich dem Original.
 */
export function zaehleDekompositionen(erlass: string): number {
  const s = erlass.trim();
  const klammer = s.match(/\(([^)]*)\)\s*$/);
  const nr = klammer ? klammer[1].trim() : '';
  const vor = ohneNr(s);
  let n = 0;
  for (let i = 0; i < vor.length; i++) {
    if (vor[i] !== ',') continue;
    const t = vor.slice(0, i).trim();
    const a = vor.slice(i + 1).trim();
    if (!t || !a || a === t || istKuerzelFragment(a)) continue;
    if (erlassBezeichnung(t, a, nr) === s) n++;
  }
  return n;
}

/**
 * Die Rückrechnung EINES Snapshot-Strings — rein, mit eingebauten Beweisen:
 * scheitert Round-Trip oder Eindeutigkeit, wird fail-closed '' geliefert und
 * die Klasse benannt (nie ein geratener Wert, §7).
 */
export function rekonstruiereAbkRoh(erlass: string): Rueckrechnung {
  const s = erlass.trim();
  const { kuerzel, titel, sr } = identitaetAusErlass(s);
  const nr = sr ?? '';
  // No-Comma-Zweig: titel === Vollstring; Fragment-Zweig: kuerzel === titel.
  if (kuerzel === titel) return { abk: '', klasse: 'fragment' };
  if (titel === s) return { abk: '', klasse: 'no-comma' };
  // Split akzeptiert → Beweis (a): Round-Trip byte-gleich.
  if (erlassBezeichnung(titel, kuerzel, nr) !== s) return { abk: '', klasse: 'kein-roundtrip' };
  // Beweis (b): genau EINE akzeptierte Dekomposition.
  if (zaehleDekompositionen(s) !== 1) return { abk: '', klasse: 'mehrdeutig' };
  return { abk: kuerzel, klasse: 'split' };
}
