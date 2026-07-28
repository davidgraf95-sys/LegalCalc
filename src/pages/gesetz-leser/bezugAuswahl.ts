// ─── B4: Facetten-Auswahl der Bezüge am Artikel — reine Darstellungslogik ─────
//
// W2·7-BEZUG/B4 (FAHRPLAN-VERZAHNUNG-UI §9). Die Datenschicht (B1,
// `lib/rechtsprechung/bezuege.ts` + `lib/verzahnung/facetten.ts`) kennt
// bewusst KEINE Voreinstellung — «welche Facetten voreingestellt sind und wie
// sie bedient werden, entscheidet die Filter-UI (B4) und nicht diese Datei».
// Genau das steht hier: Default, Normalisierung, Abbildung auf `FacettenAuswahl`
// und die kurzen Anzeige-Labels. Rein und deterministisch (§2), kein JSX, kein
// Zustand — der Zustand lebt im Leser-Options-Store (`leserOptionen.ts`).
//
// ── WARUM DER DEFAULT NUR `bge` KENNT (§8, konservativ) ─────────────────────
// Der heutige Reader zeigt am Artikel die BGE-Leitfälle aus dem schlanken
// `norm-index/<Erlass>.json`. Der Bezugs-Shard ist dessen OBERMENGE (siehe
// Abgrenzungs-Kommentar in `bezuege.ts`) und mit 717 KB am grössten Erlass
// deutlich schwerer. Ein Default, der ihn mitlädt, machte JEDEN Leser teurer,
// um eine Kante zu zeigen, nach der niemand gefragt hat. Darum:
//   · Grundzustand = genau `{bge}` ⇒ heutiger Pfad, heutiger Shard, heutige
//     Darstellung — byte-gleich, kein zusätzlicher Fetch (§6, §15).
//   · Sobald der Nutzer eine weitere Klasse zuschaltet, tritt der Bezugs-Shard
//     AN DIE STELLE des schlanken (nie zusätzlich, §5) und die Zeile rendert
//     nach Status-Klassen gruppiert.
// `istErweitert` ist die eine Stelle, die diese Weiche stellt.
//
// ── WARUM ES KEINEN EIGENEN «EBENE»-SCHALTER GIBT (§5) ──────────────────────
// `BezugsFacetten.ebene` ist aus `status` ableitbar: bge/bger/eidg sind
// Bundesebene, `kantonal` ist Kantonsebene. Ein zweiter Schalter für dieselbe
// Unterscheidung wäre ein Steuerelement, das entweder nichts tut oder dem
// Status-Schalter widerspricht — beides schlechter als einer. Die vier
// Status-Klassen SIND die Instanz-/Ebenen-Achse; die Kanton-Achse verfeinert
// die kantonale Klasse. `FacettenAuswahl.ebene` bleibt in der Datenschicht
// bestehen (andere Konsumenten dürfen sie nutzen), die Leser-UI setzt sie nicht.

import type { BezugStatus } from '../../lib/verzahnung/facetten';
import { STATUS_RANG } from '../../lib/verzahnung/facetten';
import type { FacettenAuswahl } from '../../lib/rechtsprechung/bezuege';

/**
 * Die im Gesetz-Leser bedienbaren Klassen, in Anzeige-Reihenfolge (§2:
 * deklariert, nie aus Zählern abgeleitet).
 *
 * `material` fehlt BEWUSST: der Bezugs-Korpus trägt heute ausschliesslich
 * `quelltyp:'rechtsprechung'` (verifiziert 28.7.2026 über alle 311 Shards —
 * 9922 Dokumente, davon 0 Materialien). Ein Schalter für eine Klasse, die es
 * im Bestand nicht gibt, wäre ein totes Steuerelement (§13 F4) und zugleich
 * eine Bestandsbehauptung, die die Daten nicht decken (§8). Er kommt mit
 * W2·6a-MAT — die Datenschicht (`facettenFuerMaterial`) trägt ihn bereits.
 */
export const BEDIENBARE_KLASSEN: readonly BezugStatus[] = ['bge', 'bger', 'eidg', 'kantonal'];

/**
 * Grundeinstellung: NUR Leitentscheide (§9 B4 «Default konservativ»). Alles
 * Weitere ist zuschaltbar, nichts wird ungefragt dazugeladen.
 */
export const DEFAULT_KLASSEN: readonly BezugStatus[] = ['bge'];

/**
 * Kurzlabel für die Chip-Gruppen und Schalter.
 *
 * Bewusst NEBEN `STATUS_LABEL` (facetten.ts) statt an dessen Stelle: das
 * dortige Label ist der ausgeschriebene FACHNAME («Eidg. Gericht
 * (BVGer/BStGer/BPatGer)») und bleibt die massgebliche Bezeichnung — es speist
 * hier jeden `title`/`aria-label`. Diese Tabelle liefert nur die gekürzte
 * Sichtform für enge Chip-Reihen. Ein Test hält beide Tabellen vollständig
 * (jede bedienbare Klasse hat beides), damit sie nicht auseinanderlaufen.
 */
export const KLASSE_KURZ: Readonly<Record<BezugStatus, string>> = {
  bge: 'Leitentscheide',
  bger: 'Bundesgericht, übrige',
  eidg: 'Eidg. Gerichte',
  kantonal: 'Kantonal',
  material: 'Materialien',
};

/** Noch kürzer — für den Schalter-Streifen im engen «Ansicht ▾»-Panel. */
export const KLASSE_SCHALTER: Readonly<Record<BezugStatus, string>> = {
  bge: 'BGE',
  bger: 'BGer',
  eidg: 'Eidg.',
  kantonal: 'Kantonal',
  material: 'Mat.',
};

/**
 * Ist die Auswahl vom Grundzustand abgewichen? Nur dann tritt der (deutlich
 * grössere) Bezugs-Shard an die Stelle des schlanken Leitfall-Shards.
 *
 * «Abgewichen» heisst: die Menge ist nicht GENAU `{bge}`. Auch das ABWÄHLEN
 * von `bge` zählt dazu — wer nur kantonale Entscheide sehen will, braucht den
 * Bezugs-Shard genauso wie wer alles sehen will. Rein (§2).
 */
export function istErweitert(klassen: readonly BezugStatus[]): boolean {
  return !(klassen.length === 1 && klassen[0] === 'bge');
}

/**
 * Auswahl normalisieren: unbekannte Werte fallen weg, Doppelte fallen weg,
 * die Reihenfolge folgt dem deklarierten `STATUS_RANG` (§2 — die Anzeige darf
 * nie von der Klick-Reihenfolge des Nutzers abhängen).
 *
 * Die LEERE Menge bleibt erlaubt und wird NICHT stillschweigend auf den
 * Default zurückgesetzt: «alles abgewählt» ist eine legitime Nutzerabsicht,
 * und die Zeile weist sie sichtbar aus («n ausgeblendet · alle zeigen») statt
 * kommentarlos zu verschwinden (§8, gleiches Muster wie der Zeitraum-Filter).
 */
export function normalisiereKlassen(roh: readonly unknown[]): BezugStatus[] {
  const erlaubt = new Set<string>(BEDIENBARE_KLASSEN);
  const aus = new Set<BezugStatus>();
  for (const w of roh) if (typeof w === 'string' && erlaubt.has(w)) aus.add(w as BezugStatus);
  return [...aus].sort((a, b) => STATUS_RANG[a] - STATUS_RANG[b]);
}

/** Kantons-Auswahl normalisieren: ISO-Kürzel (2 Grossbuchstaben), dedupliziert,
 *  alphabetisch. Leer = KEINE Einschränkung (Konvention der Datenschicht:
 *  «Leere/fehlende Achse = keine Einschränkung», siehe `FacettenAuswahl`). */
export function normalisiereKantone(roh: readonly unknown[]): string[] {
  const aus = new Set<string>();
  for (const w of roh) if (typeof w === 'string' && /^[A-Z]{2}$/.test(w)) aus.add(w);
  return [...aus].sort();
}

/**
 * Die UI-Auswahl auf die `FacettenAuswahl` der Datenschicht abbilden.
 *
 * Die Kanton-Achse wird NUR gesetzt, wenn die kantonale Klasse überhaupt
 * gewählt ist. Sonst würde sie die Bundes-Klassen mitfiltern: ein
 * Bundesgerichtsentscheid trägt `kanton:'CH'`, stünde also in keiner
 * Kantons-Auswahl und verschwände, sobald jemand «nur BS» wählt — der Filter
 * für die kantonale Praxis hätte die bundesgerichtliche gelöscht. Der
 * Kantons-Schnitt gehört fachlich INNERHALB der kantonalen Klasse (§1).
 */
export function zuFacettenAuswahl(
  klassen: readonly BezugStatus[],
  kantone: readonly string[],
): FacettenAuswahl {
  const auswahl: FacettenAuswahl = { status: new Set(klassen) };
  if (kantone.length > 0 && klassen.includes('kantonal')) {
    // 'CH' immer mitführen: die Bundes-Klassen tragen es und dürfen an dieser
    // Achse nicht hängenbleiben (siehe Kopf-Kommentar).
    return { ...auswahl, kanton: new Set([...kantone, 'CH']) };
  }
  return auswahl;
}

/**
 * Eine Klasse an-/abschalten. Rein — gibt die neue, normalisierte Menge zurück
 * (der Store persistiert sie, diese Funktion kennt keinen Zustand).
 */
export function schalteKlasse(
  klassen: readonly BezugStatus[],
  klasse: BezugStatus,
): BezugStatus[] {
  const drin = klassen.includes(klasse);
  return normalisiereKlassen(drin ? klassen.filter((k) => k !== klasse) : [...klassen, klasse]);
}

/** Einen Kanton an-/abschalten. Rein (siehe `schalteKlasse`). */
export function schalteKanton(kantone: readonly string[], kanton: string): string[] {
  const drin = kantone.includes(kanton);
  return normalisiereKantone(drin ? kantone.filter((k) => k !== kanton) : [...kantone, kanton]);
}
