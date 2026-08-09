// ═══ W2·19-GLIEDERUNG · S3 — Gliederungs-Modell (pure Ableitung) ═════════════
//
// Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §3 (Modell-Modul, Modus-
// Kette, Zeilen-Anatomie, Sonderknoten), §8 (Erlass-Typen-Matrix), §9-S3.
//
// WAS DIESES MODUL IST. Eine reine, UI-freie Ableitung aus dem bereits geladenen
// Baum (`baueGliederungsbaum`) und den bereits geladenen Snapshot-/Sidecar-Daten.
// Kein React, kein DOM, kein `Date.now()`, kein Netz — gleiche Eingabe, gleiche
// Ausgabe (§2). Es liegt in `src/pages/`, weil es DARSTELLUNG ableitet und keine
// Rechtslogik trägt (§3): es entscheidet, WIE eine Gliederung gezeigt wird, nie
// WAS rechtlich gilt. Es schreibt nichts nach `src/lib/normtext/` und liest von
// dort nur Typen.
//
// WARUM EIGENE DATEI. `inhalt-hooks.tsx` hat bei 698 Zeilen nur ~100 Zeilen Luft
// bis zum 800-Zeilen-Schlankheits-Tor (`check:schlankheit`), und das Modell ist
// als reine Funktion ohne Hooks unit-testbar — genau das verlangt §3.2 der Spec
// («Reine Funktion, unit-getestet gegen die Referenz-Erlasse»).
//
// WARUM EIN MODUS-SYSTEM UND KEIN «BAUM MIT SONDERFÄLLEN». Ein Drittel des
// Korpus hat keine amtliche Gliederung, 42 Kantons-Snapshots haben gar kein
// Sidecar. Leere und Teilerfassung sind damit benannte Normalfälle (§8), keine
// Bugs — und der Modus sagt der Oberfläche ehrlich, welchen der vier Fälle sie
// vor sich hat (§8 Ehrlichkeit).
//
// KNOTEN-IDENTITÄT: die bestehende `Sektion.id` (`sek-N`) bleibt der EINZIGE
// Schlüssel. `browse.ts:303` vergibt sie deterministisch in Baumbau-Reihenfolge,
// kollisionsfrei ohne Label und ohne eId; die Zuklapp-Buchhaltung, `data-sektion-id`
// und der Scroll-Spy hängen bereits daran. Der in allen drei Vor-Konzepten
// vorgeschlagene Ordinalpfad ist bewusst GESTRICHEN — er wäre eine
// §5-Doppelwahrheit ohne Konsumenten. Labels taugen nicht als Schlüssel
// (SORTG-Labelkollision), eIds fehlen kantonal vollständig.

import type { Sektion, StrukturMap } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { berechneSektionMeta, istAnhangToken } from './berechnungen';

// ─── Schwellen der Modus-Kette (§3.2) ───────────────────────────────────────
// Alle fünf Zahlen stehen hier und nur hier; die Kette unten liest sie, die
// Unit-Tests prüfen die Referenz-Erlasse GEGEN sie (nicht gegen Kopien).
/** B4 Mini: bis zu so vielen Artikeln lohnt keine Leiste. */
export const MINI_MAX_ARTIKEL = 9;
/** B3 Leer: unter dieser Randtitel-Dichte trägt auch ein Artikel-Index nicht. */
export const LEER_MAX_DICHTE = 0.2;
/** B2 Artikel-Index: ab dieser Randtitel-Dichte ist «Art. N — Randtitel» tragfähig. */
export const INDEX_MIN_DICHTE = 0.6;
/** B2: so wenige AMTLICHE Knoten sind keine Gliederung mehr (VwVG: 5). */
export const INDEX_MAX_AMTLICHE_KNOTEN = 6;
/** B2: erst ab dieser Artikelzahl ist ein Index überhaupt ein Thema. */
export const INDEX_MIN_ARTIKEL = 30;
/** B1: bis zu so vielen Baumzeilen darf der Baum ganz offen starten. */
export const OFFEN_MAX_ZEILEN = 40;
/** Anhang-Ast startet aufgeklappt, sobald er den Erlass dominiert (ZH-243: 88 %). */
export const ANHANG_DOMINANZ = 0.5;

/** Synthetische Knoten-Ids — bewusst KEIN `sek-`-Präfix (Kollision ausgeschlossen). */
export const ID_VORSPANN = 'gm-vorspann';
export const ID_NACHSPANN = 'gm-nachspann';
export const ID_ANHANG = 'gm-anhang';
/**
 * Mittelgruppe (Bug-Check 9.8.2026, B2) — freie Artikel ZWISCHEN zwei
 * Baumknoten. Präfix + laufender Roh-Index des vorangehenden Stamm-Knotens,
 * damit mehrere Lücken im selben Erlass kollisionsfrei bleiben.
 */
export const ID_MITTE = 'gm-mitte';

export type GliederungsModus = 'b4-mini' | 'b3-leer' | 'b2-index' | 'b1-offen' | 'b1-kompakt';

export interface GliederungsKennzahlen {
  /** Artikel im Snapshot (inkl. Anhang-Einträge — es ist die Snapshot-Länge). */
  artikelAnzahl: number;
  /** Struktur-Sidecar vorhanden? `false` = die 42 Kantons-Snapshots ohne Sidecar (T10). */
  hatSidecar: boolean;
  /**
   * Baumzeilen bei Vollausklapp, OHNE die synthetischen Knoten (Vorspann/
   * Nachspann/Anhang-Wurzel) — das ist die Grösse, an der die Modus-Kette
   * entscheidet. Bewusst so geschnitten: die Spec verankert «AIG = 52 Zeilen»
   * (§3.2/§8), und AIG hat genau 52 Sektions-Knoten. Zählte man die
   * Anhang-Wurzel mit, verschöbe sich diese Referenz ohne fachlichen Grund.
   */
  zeilenVoll: number;
  /** Alle Zeilen inkl. der synthetischen Knoten — das, was wirklich gerendert wird. */
  zeilenGesamt: number;
  /** Knoten der AMTLICHEN Gliederung (ohne randtitel-promotete). VwVG 5, OR 171, ZGB 134. */
  amtlicheKnoten: number;
  /** Alle Knoten des Rohbaums (vor der Einzelkind-Verdichtung). */
  knotenGesamt: number;
  /** Anteil der Artikel mit Randtitel/Marginalie, 0…1 (§3.2 «Marginalien-Dichte»). */
  marginalienDichte: number;
  /** Anteil der Anhang-Einträge an allen Artikeln, 0…1 (ZH-243 0.88, SG-3849 0.97). */
  anhangAnteil: number;
  /** Artikel ohne Gliederungs-Zuordnung VOR dem ersten Baumartikel (T9: RBUE 47). */
  vorspannArtikel: number;
  /** Dieselben, aber NACH dem letzten Baumartikel (im Referenzbestand 0). */
  nachspannArtikel: number;
  /** Anhang-Einträge insgesamt. */
  anhangArtikel: number;
}

export interface GliederungsKnoten {
  /** Sektions-Id (`sek-N`) bzw. eine der synthetischen Ids. Der EINZIGE Schlüssel. */
  id: string;
  art: 'sektion' | 'vorspann' | 'nachspann' | 'mitte' | 'anhang';
  /**
   * Alle Sektions-Ids, die diese EINE Zeile trägt — bei verdichteten
   * Einzelkind-Ketten mehr als eine (`[sek-7, sek-8, sek-9]`). Der Scroll-Spy
   * liefert einen Pfad aus Roh-Ids; eine Zeile ist aktiv, wenn der Pfad
   * IRGENDEINE ihrer Ids enthält. Ohne dieses Feld verlöre die verdichtete
   * Zeile ihre Aktiv-Erkennung.
   */
  ids: string[];
  /** Die verdichteten Einzel-Labels in Reihenfolge (`['§ 3', 'I.', '1.']`). */
  labelKette: string[];
  /** Anzeige-Label; bei Verdichtung `'§ 3 › I. › 1.'`. */
  label: string;
  /** Ebene der äussersten Sektion (aus dem Sidecar; synthetische Knoten: 0). */
  ebene: number;
  /** Renderer-Tiefe dieser ZEILE (verdichtete Stufen zählen als eine). */
  tiefe: number;
  /** true, wenn die äusserste Stufe randtitel-promotet ist (ruhige Serif-Stimme). */
  randtitel: boolean;
  /** Fedlex-Container-eId, wo vorhanden — reines Zusatzfeld, NIE Schlüssel, NIE Anker. */
  eId?: string;
  kinder: GliederungsKnoten[];
  /** Artikel im ganzen Teilbaum (inkl. der direkt am Knoten hängenden). */
  artikelAnzahl: number;
  /** Direkt am Knoten hängende Artikel (T8 gemischter Knoten: > 0 trotz Kindern). */
  eigeneArtikel: number;
  /** T8: Knoten ist Ordner UND Sprungziel zugleich. */
  gemischt: boolean;
  /** «Art. 1–40» — aus `berechneSektionMeta`, also aus den amtlichen `artikelLabel`. */
  bereich?: string;
  /** Token des ersten Artikels im Teilbaum (Sprungziel, Anker `art-<token>`). */
  ersterArtikel?: string;
  /** Alle Artikel des Teilbaums tragen `aufgehoben` — im Baum sichtbar zu machen. */
  aufgehoben: boolean;
  /** Reiner Anhang-Teilbaum (kein «Bereich»-Badge, gehört unter die Anhang-Wurzel). */
  anhang: boolean;
  /** Ausnahme-Vorgabe gegen die Tiefen-Regel (nur die dominante Anhang-Wurzel setzt sie). */
  startOffen?: boolean;
  /**
   * Artikel-Tokens, die DIESE Zeile unmittelbar deckt — nur an synthetischen
   * Zeilen (Vorspann/Nachspann/Anhang). Sektionszeilen brauchen es nicht: für
   * sie liefert `pfadZu` den Pfad aus dem Rohbaum.
   *
   * W2·19-GLIEDERUNG/S5: ohne dieses Feld kann der Scroll-Spy den Zustand «vor
   * dem ersten Knoten» (Spec §3.4) nicht melden. Beim RBUE liegen 47 von 49
   * Artikeln im Vorspann; `pfadZu` findet für sie nichts, die Leiste blieb
   * unmarkiert, während der Leser mitten im Text stand. Die Zuordnung gehört
   * ins Modell und nicht in den Hook — sonst entstünde eine zweite Wahrheit
   * darüber, welcher Artikel zu welcher Zeile gehört (§5).
   */
  tokens?: string[];
}

export interface GliederungsModell {
  modus: GliederungsModus;
  /** Der fertige Zeilenbaum. In `b3-leer` bewusst leer (die Leere IST das Ergebnis). */
  knoten: GliederungsKnoten[];
  /**
   * Bis zu welcher Tiefe Zeilen ohne Zutun offen starten (Zeilen mit
   * `tiefe < startOffeneTiefe`). 0 = alles zu (Entscheid David 5.8.2026);
   * `Infinity` = alles offen. Einzelne Knoten dürfen mit `startOffen` abweichen.
   */
  startOffeneTiefe: number;
  /** B4: die Leiste startet eingeklappt, die Lesespalte bekommt die volle Breite. */
  leisteStartetZu: boolean;
  /**
   * Rohpfad→Modellpfad, EINE Übersetzungsstelle (§5). Roh-Sektions-Id → Präfix
   * der synthetischen Zeilen, unter die ihr Ast im Modell umgehängt wurde
   * (heute ausschliesslich `['gm-anhang']`).
   *
   * WOZU: der Scroll-Spy bestimmt den aktiven Pfad über den ROHBAUM
   * (`pfadZu`) — er kennt das Modell nicht und soll es auch nicht nachbauen.
   * Ein reiner Anhang-Ast ist im Rohbaum Top-Level, im Modell aber Kind der
   * Wurzel «Anhänge». Ohne Übersetzung sucht die Marken-Suche den Roh-Id auf
   * der obersten Modell-Ebene, findet nichts und gibt auf: keine
   * Positionsmarke, kein `aria-current`, kein Mitscroll (Bug-Check 9.8.2026,
   * B4 — belegt an AIG/ASYLG/KKV, korpusweit 136 Erlasse mit Anhang-Ast).
   * Leer, solange nichts umgehängt wurde.
   */
  umhaengPraefix: Record<string, string[]>;
  kennzahlen: GliederungsKennzahlen;
}

/**
 * Übersetzt einen Rohpfad (Sektions-Ids aus `pfadZu`) in den Modellpfad, indem
 * das Umhäng-Präfix vorangestellt wird. Rein, deterministisch, ohne Kopie der
 * Umhäng-Regel — die lebt allein in `baueGliederungsModell` (§5).
 */
export function uebersetzeRohPfad(umhaengPraefix: Record<string, string[]>, roh: string[]): string[] {
  if (roh.length === 0) return roh;
  const praefix = umhaengPraefix[roh[0]];
  return praefix === undefined ? roh : [...praefix, ...roh];
}

// ─── Randtitel-Dichte ────────────────────────────────────────────────────────
/**
 * Trägt der Artikel einen Randtitel? Zwei Quellen, weil die beiden Korpora ihn
 * an verschiedenen Orten führen (empirisch geprüft, nicht angenommen):
 *  · BUND — im Struktur-Sidecar als `marginalie`-Kette (OR 99 %, VwVG 100 %,
 *    NHG 100 %); das Snapshot-Feld `titel` ist dort durchgehend leer.
 *  · KANTON — im Snapshot als `titel` (LexWork `article_title`; BS-211.100 22 %,
 *    BS-640.100 29 %); dort deckt sich der Sidecar-Wert exakt mit `titel`.
 * Die Spec nennt für VwVG «93/93 Randtitel» und für NHG «70/70» — beide Zahlen
 * ergeben sich NUR aus der Sidecar-Marginalie, nicht aus `titel`. Wer hier nur
 * `titel` läse, bekäme für den ganzen Bund 0 % und schöbe VwVG/NHG fälschlich
 * aus B2 heraus.
 */
export function hatRandtitel(e: NormSnapshot, struktur: StrukturMap | null): boolean {
  if ((struktur?.[e.artikel]?.marginalie ?? []).length > 0) return true;
  return (e.titel ?? '').trim().length > 0;
}

// ─── Anhang-Erkennung ────────────────────────────────────────────────────────
/**
 * Anhang-Eintrag? Drei Signale, in dieser Reihenfolge:
 *  1. Bund-Token-Namensraum (`annex_`/`lvl_`/`decl_`/`scope_`) — die bestehende,
 *     tor-geprüfte `istAnhangToken` aus `berechnungen.ts` (keine zweite Wahrheit).
 *  2. Kanton-Token `anhang_N` (ZH-243).
 *  3. Das amtliche `artikelLabel` beginnt mit dem Wort «Anhang» — Identitäts-
 *     Treffer mit Wortgrenze, kein Substring (§7). Das ist das ehrlichste der
 *     drei Signale: der Adapter hat «Anhang Ziff. 1.1.2.1» selbst geschrieben,
 *     wir raten nichts aus der Token-FORM. Genau daran hängen die beiden
 *     Zahlen, die die Spec nennt: ZH-243 132/150 = 88 %, SG-3849 590/607 = 97 %.
 * Die Erkennung steuert ausschliesslich die DARSTELLUNG (eigener Ast, Start-
 * Zustand) — sie klassifiziert nie rechtlich (§1/§3).
 */
export function istAnhangEintrag(e: NormSnapshot): boolean {
  if (istAnhangToken(e.artikel)) return true;
  if (/^anhang[_.]/i.test(e.artikel)) return true;
  return /^Anhang\b/.test(e.artikelLabel ?? '');
}

// ─── Rohbaum-Kennzahlen ──────────────────────────────────────────────────────
interface RohMass { knoten: number; amtlich: number }
function messeRohbaum(sektionen: Sektion[]): RohMass {
  let knoten = 0, amtlich = 0;
  const gehe = (s: Sektion): void => {
    knoten++;
    if (s.randtitel !== true) amtlich++;
    s.kinder.forEach(gehe);
  };
  sektionen.forEach(gehe);
  return { knoten, amtlich };
}

// ─── Aufbau des Zeilenbaums ──────────────────────────────────────────────────
type SekMeta = ReturnType<typeof berechneSektionMeta>;

interface Bauhilfe {
  artPos: Map<string, number>;
  meta: SekMeta;
}

/** Alle Artikel eines Teilbaums in Dokumentreihenfolge (bottom-up, einmalig). */
function sammleArtikel(s: Sektion, aus: NormSnapshot[] = []): NormSnapshot[] {
  for (const a of s.artikel) aus.push(a);
  for (const k of s.kinder) sammleArtikel(k, aus);
  return aus;
}

/**
 * Einzelkind-Verdichtung (§3.3): eine Stufe, die GENAU EIN Kind und KEINE
 * eigenen Artikel hat, trägt keine eigene Information — sie wird mit ihrem Kind
 * zu EINER Zeile «§ 3 › I. › 1.» verschmolzen. Die Bedingung «keine eigenen
 * Artikel» ist nicht verhandelbar: hätte die Stufe eigene Artikel, verschwänden
 * sie beim Verschmelzen aus dem Zählwert des Kindes (T8-Falle, stummer Verlust).
 *
 * EMPIRISCHE KORREKTUR ZUR SPEC (§7 — abweichend umsetzen und offenlegen): die
 * Spec nennt BS-730.110 als Referenzfall der Verdichtung. Gemessen am
 * committeten Snapshot hat BS-730.110 KEINE einzige Einzelkind-Stufe (151
 * Knoten, alle mit ≥ 2 Kindern oder eigenen Artikeln). Wo die Verdichtung
 * wirklich greift: ZGB (3), BS-211.100 (4), BS-640.100 (2) — je Kette genau
 * EINE Stufe, im ganzen Referenzbestand keine längere. Die Unit-Tests prüfen
 * darum die Fälle, in denen die Regel feuert, UND BS-730.110 als belegten
 * Nullfall.
 */
function verdichte(s: Sektion): { kette: Sektion[]; blatt: Sektion } {
  const kette: Sektion[] = [s];
  let blatt = s;
  while (blatt.kinder.length === 1 && blatt.artikel.length === 0) {
    blatt = blatt.kinder[0];
    kette.push(blatt);
  }
  return { kette, blatt };
}

function baueSektionsKnoten(s: Sektion, tiefe: number, hilfe: Bauhilfe): GliederungsKnoten {
  const { kette, blatt } = verdichte(s);
  const arts = sammleArtikel(blatt);
  const meta = hilfe.meta.get(blatt.id);
  const erster = arts.reduce<NormSnapshot | null>(
    (best, a) => (best === null || (hilfe.artPos.get(a.artikel) ?? 0) < (hilfe.artPos.get(best.artikel) ?? 0) ? a : best),
    null,
  );
  const labelKette = kette.map((k) => k.label);
  return {
    id: kette[0].id,
    art: 'sektion',
    ids: kette.map((k) => k.id),
    labelKette,
    label: labelKette.join(' › '),
    ebene: kette[0].ebene,
    tiefe,
    randtitel: kette[0].randtitel === true,
    eId: kette.find((k) => k.eId)?.eId,
    kinder: blatt.kinder.map((k) => baueSektionsKnoten(k, tiefe + 1, hilfe)),
    artikelAnzahl: arts.length,
    eigeneArtikel: blatt.artikel.length,
    gemischt: blatt.artikel.length > 0 && blatt.kinder.length > 0,
    bereich: meta?.bereich,
    ersterArtikel: erster?.artikel,
    aufgehoben: arts.length > 0 && arts.every((a) => a.aufgehoben === true),
    anhang: meta?.anhang === true,
  };
}

/** Synthetischer Knoten (Vorspann/Nachspann/Anhang-Blatt) über einer Artikelliste. */
function baueSynth(
  id: string,
  art: GliederungsKnoten['art'],
  label: string,
  arts: NormSnapshot[],
  tiefe: number,
  kinder: GliederungsKnoten[] = [],
): GliederungsKnoten {
  const eigen = arts.length;
  const gesamt = eigen + kinder.reduce((n, k) => n + k.artikelAnzahl, 0);
  // Bereich aus den amtlichen Etiketten der EIGENEN Artikel (§3.3: nie geraten —
  // `artikelLabel` trägt «Art. N» bzw. «§ N» bereits so, wie das Register es
  // vorgibt). Der Zweitteil wird um das Etikett gekürzt: «Art. 1–47».
  const bereich = eigen === 0
    ? undefined
    : eigen === 1
      ? arts[0].artikelLabel
      : `${arts[0].artikelLabel}–${arts[eigen - 1].artikelLabel.replace(/^(Art\.|§)\s*/, '')}`;
  return {
    id,
    art,
    ids: [id],
    labelKette: [label],
    label,
    ebene: 0,
    tiefe,
    randtitel: false,
    kinder,
    tokens: arts.map((a) => a.artikel),
    artikelAnzahl: gesamt,
    eigeneArtikel: eigen,
    gemischt: eigen > 0 && kinder.length > 0,
    bereich,
    ersterArtikel: arts[0]?.artikel ?? kinder[0]?.ersterArtikel,
    aufgehoben: gesamt > 0 && arts.every((a) => a.aufgehoben === true) && kinder.every((k) => k.aufgehoben),
    anhang: art === 'anhang',
  };
}

/**
 * Anhang-Ziffernhierarchie aus den Tokens (§3.4). Beide Dialekte:
 *   · Bund `annex_1_2`  → Stufen ['annex_1', 'annex_1_2']
 *   · Kanton `1.1.2.1`  → Stufen ['1', '1.1', '1.1.2', '1.1.2.1']
 *   · Kanton `anhang_7` → eine Stufe
 * Zwischenstufen, die selbst KEIN Artikel sind, entstehen nicht — es wird nur
 * dort geschachtelt, wo ein Eltern-Token wirklich existiert (§7: nichts
 * fabrizieren). Alles andere hängt flach unter der Anhang-Wurzel.
 */
function elternToken(token: string): string | null {
  if (token.includes('.')) {
    const i = token.lastIndexOf('.');
    return i > 0 ? token.slice(0, i) : null;
  }
  const i = token.lastIndexOf('_');
  return i > 0 ? token.slice(0, i) : null;
}

function baueAnhangAst(arts: NormSnapshot[], dominant: boolean): GliederungsKnoten | null {
  if (arts.length === 0) return null;
  const vorhanden = new Set(arts.map((a) => a.artikel));
  const knoten = new Map<string, GliederungsKnoten>();
  const wurzelKinder: GliederungsKnoten[] = [];
  for (const a of arts) {
    const k = baueSynth(`${ID_ANHANG}:${a.artikel}`, 'anhang', a.artikelLabel, [a], 0);
    knoten.set(a.artikel, k);
  }
  for (const a of arts) {
    const k = knoten.get(a.artikel)!;
    let p = elternToken(a.artikel);
    while (p !== null && !vorhanden.has(p)) p = elternToken(p);
    const eltern = p !== null ? knoten.get(p) : undefined;
    if (eltern && eltern !== k) eltern.kinder.push(k);
    else wurzelKinder.push(k);
  }
  // Tiefen und Teilbaum-Summen nachziehen (die Zuordnung stand erst jetzt fest).
  const setze = (k: GliederungsKnoten, tiefe: number): number => {
    k.tiefe = tiefe;
    k.artikelAnzahl = k.eigeneArtikel + k.kinder.reduce((n, kk) => n + setze(kk, tiefe + 1), 0);
    k.gemischt = k.eigeneArtikel > 0 && k.kinder.length > 0;
    return k.artikelAnzahl;
  };
  const wurzel = baueSynth(ID_ANHANG, 'anhang', 'Anhänge', [], 0, wurzelKinder);
  wurzelKinder.forEach((k) => setze(k, 1));
  wurzel.artikelAnzahl = wurzelKinder.reduce((n, k) => n + k.artikelAnzahl, 0);
  wurzel.ersterArtikel = arts[0].artikel;
  wurzel.aufgehoben = arts.every((a) => a.aufgehoben === true);
  // §3.4: bei Anhang-Dominanz startet der Ast aufgeklappt (ZH-243: 88 % des Texts).
  if (dominant) wurzel.startOffen = true;
  return wurzel;
}

function zaehleZeilen(knoten: GliederungsKnoten[]): number {
  return knoten.reduce((n, k) => n + 1 + zaehleZeilen(k.kinder), 0);
}

// ─── Modus-Kette (§3.2) ──────────────────────────────────────────────────────
/**
 * Geordnete Bedingungskette — die ERSTE zutreffende gewinnt. Sie entscheidet an
 * der ZEILENZAHL, nie an der Tiefe: AIG ist nur zwei Ebenen tief, aber 52 Zeilen
 * lang und gehört darum in «B1 kompakt», nicht in «B1 offen».
 *
 * | # | Modus         | Bedingung                                                          |
 * |---|---------------|--------------------------------------------------------------------|
 * | 1 | B4 Mini       | artikelAnzahl ≤ 9                                                    |
 * | 2 | B3 Leer       | kein Sidecar ODER (keine Sektionen UND Randtitel-Dichte < 20 %)      |
 * | 3 | B2 Index      | keine Sektionen ODER (< 6 amtliche Knoten bei ≥ 30 Art. UND ≥ 60 %)  |
 * | 4 | B1 offen      | Vollausklapp ≤ 40 Zeilen                                             |
 * | 5 | B1 kompakt    | sonst                                                                |
 *
 * «Knoten» in Zeile 3 sind die AMTLICHEN Knoten (ohne randtitel-promotete) —
 * gemessen und gegen die Spec-Zahlen belegt: VwVG 5, OR 171, ZGB 134.
 */
export function waehleModus(k: GliederungsKennzahlen, hatSektionen: boolean): GliederungsModus {
  if (k.artikelAnzahl <= MINI_MAX_ARTIKEL) return 'b4-mini';
  if (!k.hatSidecar || (!hatSektionen && k.marginalienDichte < LEER_MAX_DICHTE)) return 'b3-leer';
  if (!hatSektionen
    || (k.amtlicheKnoten < INDEX_MAX_AMTLICHE_KNOTEN
      && k.artikelAnzahl >= INDEX_MIN_ARTIKEL
      && k.marginalienDichte >= INDEX_MIN_DICHTE)) return 'b2-index';
  return k.zeilenVoll <= OFFEN_MAX_ZEILEN ? 'b1-offen' : 'b1-kompakt';
}

export interface ModellEingabe {
  /** Ausgabe von `baueGliederungsbaum` — bereits kuratiert (`kuratiereTocSektionen`). */
  sektionen: Sektion[];
  /** Ausgabe von `baueGliederungsbaum` — Artikel ohne Gliederungs-Zuordnung. */
  ohneGliederung: NormSnapshot[];
  /** Der volle Snapshot in Dokumentreihenfolge. */
  eintraege: NormSnapshot[];
  /** Struktur-Sidecar oder `null` (= keines vorhanden, T10). */
  struktur: StrukturMap | null;
  /**
   * §11 Frage 1 / §3.2 «Achtung Konflikt mit Davids 5.8.-Entscheid ‹alles zu›»:
   * B1 offen startet erst dann wirklich sichtbar, wenn dieser Schalter gesetzt
   * ist. Default `false` = der 5.8.-Entscheid gilt unverändert, B1 offen
   * verhält sich wie B1 kompakt. Der Modus selbst bleibt in BEIDEN Fällen
   * `b1-offen` — er beschreibt, was der Erlass IST; der Schalter beschreibt nur,
   * was die Leiste beim Öffnen TUT. So bleibt das Modell auch nach dem Go
   * dieselbe Wahrheit (§8).
   */
  startSichtbarGo?: boolean;
}

/**
 * Das Modell eines Erlasses. Rein, deterministisch, ohne Seiteneffekte (§2).
 */
export function baueGliederungsModell(ein: ModellEingabe): GliederungsModell {
  const { sektionen, ohneGliederung, eintraege, struktur } = ein;
  const artPos = new Map<string, number>();
  eintraege.forEach((e, i) => artPos.set(e.artikel, i));
  const hilfe: Bauhilfe = { artPos, meta: berechneSektionMeta(sektionen, artPos) };
  const roh = messeRohbaum(sektionen);

  // 1 · Zeilenbaum aus den echten Sektionen (mit Verdichtung, Zählwerten, T8).
  const sektionsKnoten = sektionen.map((s) => baueSektionsKnoten(s, 0, hilfe));

  // 2 · Sonderknoten. Die Artikel OHNE Gliederungs-Zuordnung sind kein Rest,
  //     sondern in 18 Erlassen der Haupttext (T9 RBUE: 96 % des Texts läge sonst
  //     unerreichbar). Sie zerfallen in drei ehrliche Gruppen:
  //       · Anhang-Einträge      → eigener Ast «Anhänge» am Baumende
  //       · davor liegende Rest-Artikel → «Ohne Abschnitt (Art. 1–47)» ganz oben
  //       · dahinter liegende          → derselbe Knoten am Ende
  //     Getrennt statt zusammengefasst, damit das Bereichs-Label nie eine Spanne
  //     behauptet, die es nicht gibt (§8).
  const anhangAlle = eintraege.filter(istAnhangEintrag);
  const ersteBaumPos = sektionsKnoten.length > 0
    ? Math.min(...sektionen.flatMap((s) => sammleArtikel(s).map((a) => artPos.get(a.artikel) ?? Infinity)))
    : Infinity;
  const letzteBaumPos = sektionsKnoten.length > 0
    ? Math.max(...sektionen.flatMap((s) => sammleArtikel(s).map((a) => artPos.get(a.artikel) ?? -1)))
    : -1;
  const freieArtikel = ohneGliederung.filter((e) => !istAnhangEintrag(e));
  const vorspann = freieArtikel.filter((e) => (artPos.get(e.artikel) ?? 0) < ersteBaumPos);
  const nachspann = freieArtikel.filter((e) => (artPos.get(e.artikel) ?? 0) > letzteBaumPos);
  // B2 (Bug-Check 9.8.2026): freie Artikel liegen nicht nur VOR und NACH dem
  // Baum, sondern auch MITTENDRIN — und die fielen bis hierher aus BEIDEN Filtern
  // und damit aus dem Modell. Belegt am committeten Korpus: BS-569.500 5 von 10
  // Artikeln, ZG-641.1 2 von 14, KKV 1 von 211; in allen drei Fällen wird die
  // Leiste gerendert, die Artikel waren über sie schlicht unerreichbar. Zweit-
  // wirkung: `findeSynthPfad` lieferte für sie `null`, der Scroll-Spy stieg
  // stumm aus und die Positionsmarke behauptete weiter den zuletzt bekannten
  // Standort — eine Falschaussage (§8), nicht nur eine Lücke.
  const mittelfrei = freieArtikel.filter((e) => {
    const p = artPos.get(e.artikel) ?? 0;
    return p > ersteBaumPos && p < letzteBaumPos;
  });
  const anhangFrei = ohneGliederung.filter(istAnhangEintrag);

  // 3 · Reine Anhang-Teilbäume wandern ans Ende unter die Anhang-Wurzel
  //     (ChemRRV/AIG: die Anhänge stehen dort IM Sidecar-Baum).
  const anhangAeste = sektionsKnoten.filter((k) => k.anhang);
  // B4: die EINE Übersetzungstabelle Rohpfad→Modellpfad (Herleitung am Feld
  // `umhaengPraefix`). Alle Ids der umgehängten Zeile — auch die inneren Stufen
  // einer verdichteten Kette — zeigen auf dieselbe neue Elternzeile.
  const umhaengPraefix: Record<string, string[]> = {};
  for (const ast of anhangAeste) for (const id of ast.ids) umhaengPraefix[id] = [ID_ANHANG];

  // B2: Zuordnung der Mittelgruppen. Massgeblich ist allein die Dokument-
  // reihenfolge: eine Gruppe hängt hinter dem letzten Stamm-Knoten, der VOR ihr
  // endet. Nichts wird geraten und nichts einer Sektion zugeschlagen, zu der der
  // Artikel amtlich nicht gehört (§8) — die Gruppe ist ein eigener, ehrlich
  // benannter Knoten «Ohne Abschnitt», genau wie Vor- und Nachspann.
  const letztePosJeWurzel = sektionen.map((s) =>
    sammleArtikel(s).reduce((m, a) => Math.max(m, artPos.get(a.artikel) ?? -1), -1));
  const mittelTopf = new Map<number, NormSnapshot[]>();
  for (const a of mittelfrei) {
    const p = artPos.get(a.artikel) ?? 0;
    let idx = -1;
    for (let i = 0; i < sektionsKnoten.length; i++) {
      if (sektionsKnoten[i].anhang) continue;
      if (letztePosJeWurzel[i] < p) idx = i;
    }
    if (idx < 0) continue; // vor jedem Stamm-Knoten ⇒ deckt bereits der Vorspann
    const topf = mittelTopf.get(idx);
    if (topf) topf.push(a); else mittelTopf.set(idx, [a]);
  }

  const anhangAnteil = eintraege.length > 0 ? anhangAlle.length / eintraege.length : 0;
  const dominant = anhangAnteil > ANHANG_DOMINANZ;
  let anhangWurzel: GliederungsKnoten | null = null;
  if (anhangFrei.length > 0 || anhangAeste.length > 0) {
    anhangWurzel = baueAnhangAst(anhangFrei, dominant);
    if (anhangWurzel === null) {
      anhangWurzel = baueSynth(ID_ANHANG, 'anhang', 'Anhänge', [], 0, []);
      if (dominant) anhangWurzel.startOffen = true;
    }
    for (const ast of anhangAeste) anhangWurzel.kinder.push(ast);
    const setzeTiefe = (k: GliederungsKnoten, t: number): void => {
      k.tiefe = t;
      k.kinder.forEach((kk) => setzeTiefe(kk, t + 1));
    };
    anhangWurzel.kinder.forEach((k) => setzeTiefe(k, 1));
    anhangWurzel.artikelAnzahl = anhangWurzel.kinder.reduce((n, k) => n + k.artikelAnzahl, 0);
    anhangWurzel.aufgehoben = anhangWurzel.artikelAnzahl > 0
      && anhangWurzel.kinder.every((k) => k.aufgehoben);
    // B7 (Bug-Check 9.8.2026): die Wurzel «Anhänge» ist ein Sprungziel wie jede
    // andere Zeile — ihr Knopf ruft `onSprungArtikel(k.ersterArtikel)`. Wo der
    // Anhang vollständig IM Sidecar-Baum steht (AIG, ASYLG, KKV …), gibt es
    // keine freien Anhang-Artikel, aus denen `baueSynth` den Wert hätte ziehen
    // können: der Knopf blieb feedbacklos. Der erste Artikel des ersten Kindes
    // ist die Dokumentreihenfolge, nichts Geratenes.
    anhangWurzel.ersterArtikel ??= anhangWurzel.kinder.find((k) => k.ersterArtikel)?.ersterArtikel;
  }

  // Der Vorspann-Knoten hängt daran, dass es ÜBERHAUPT einen Baum gibt — nicht
  // daran, dass ein STAMM übrig bleibt. RBUE ist genau dieser Fall: sein einziger
  // Sidecar-Knoten ist ein reiner Anhang-Knoten, der Stamm also leer. Wäre die
  // Bedingung an `stammKnoten` geknüpft, fielen die 47 Vorspann-Artikel (96 % des
  // Texts) ersatzlos aus der Leiste — genau der Verlust, den T9 verhindern soll.
  // Ohne Sektionen greift ohnehin B2/B3, dort wird `knoten` gar nicht gezeigt.
  const hatBaum = sektionen.length > 0;
  const knoten: GliederungsKnoten[] = [];
  if (vorspann.length > 0 && hatBaum) {
    knoten.push(baueSynth(ID_VORSPANN, 'vorspann', 'Ohne Abschnitt', vorspann, 0));
  }
  // Stamm-Knoten in Dokumentreihenfolge; jede Mittelgruppe steht direkt hinter
  // dem Knoten, nach dem sie im Text folgt (B2, Herleitung bei `mittelfrei`).
  sektionsKnoten.forEach((k, i) => {
    if (k.anhang) return; // reiner Anhang-Ast: hängt unten unter «Anhänge»
    knoten.push(k);
    const topf = mittelTopf.get(i);
    if (topf) knoten.push(baueSynth(`${ID_MITTE}:${i}`, 'mitte', 'Ohne Abschnitt', topf, 0));
  });
  if (nachspann.length > 0 && hatBaum) {
    knoten.push(baueSynth(ID_NACHSPANN, 'nachspann', 'Ohne Abschnitt', nachspann, 0));
  }
  if (anhangWurzel) knoten.push(anhangWurzel);

  const kennzahlen: GliederungsKennzahlen = {
    artikelAnzahl: eintraege.length,
    hatSidecar: struktur !== null,
    zeilenVoll: zaehleZeilen(sektionsKnoten),
    zeilenGesamt: zaehleZeilen(knoten),
    amtlicheKnoten: roh.amtlich,
    knotenGesamt: roh.knoten,
    marginalienDichte: eintraege.length > 0
      ? eintraege.filter((e) => hatRandtitel(e, struktur)).length / eintraege.length
      : 0,
    anhangAnteil,
    vorspannArtikel: vorspann.length,
    nachspannArtikel: nachspann.length,
    anhangArtikel: anhangAlle.length,
  };

  const modus = waehleModus(kennzahlen, sektionen.length > 0);
  const startOffeneTiefe = modus === 'b2-index' ? Number.POSITIVE_INFINITY
    : modus === 'b1-offen' && ein.startSichtbarGo === true ? Number.POSITIVE_INFINITY
      : 0;

  return {
    modus,
    // B3 ist die ehrliche Leere: kein Baum, keine Ersatz-Konstruktion (§8).
    knoten: modus === 'b3-leer' ? [] : knoten,
    startOffeneTiefe,
    leisteStartetZu: modus === 'b4-mini',
    umhaengPraefix,
    kennzahlen,
  };
}

/**
 * Ist die Zeile aufgeklappt? Eine explizite Angabe (Klick oder Scroll-Spy) für
 * IRGENDEINE ihrer Ids gewinnt gegen den Modus-Default; liegt keine vor,
 * entscheidet die Ausnahme des Knotens (Anhang-Dominanz) bzw. die Start-Tiefe.
 */
export function zeileIstOffen(k: GliederungsKnoten, offen: Record<string, boolean>, startOffeneTiefe: number): boolean {
  const zustaende = k.ids.map((id) => offen[id]).filter((v): v is boolean => v !== undefined);
  if (zustaende.length > 0) return zustaende.some(Boolean);
  return k.startOffen ?? k.tiefe < startOffeneTiefe;
}

/**
 * F5: welche EINE Zeile trägt die Positionsmarke?
 *
 * Die Spec sagt «der tiefste aktive Knoten». Das genügt als Regel nicht ganz,
 * denn der Nutzer darf einen Ast, in dem er gerade liest, von Hand zuklappen
 * (`manuellZuRef` — der Spy reisst ihn dann bewusst NICHT wieder auf). Läge die
 * Marke stur am tiefsten Knoten, verschwände sie in diesem Fall aus der
 * sichtbaren Leiste: der Leser stünde ohne Standort da, und der Selektor
 * `[data-toc] [data-toc-aktiv]` (a9-Sprungziel, a33-Ruhe-Messung) fände nichts
 * Bedienbares mehr. Darum: der tiefste aktive Knoten, der noch SICHTBAR ist —
 * man steigt den Aktiv-Pfad hinab, solange die Äste offen sind. Bei ganz
 * geöffnetem Pfad ist das exakt der tiefste Knoten (der Normalfall), sonst der
 * letzte sichtbare Vorfahre. In beiden Fällen genau EINE Marke.
 */
export function findeMarke(
  knoten: GliederungsKnoten[], aktivPfad: string[], offen: Record<string, boolean>, startOffeneTiefe: number,
): string | null {
  if (aktivPfad.length === 0) return null;
  let marke: string | null = null;
  let liste = knoten;
  for (;;) {
    const treffer = liste.find((k) => k.ids.some((id) => aktivPfad.includes(id)));
    if (!treffer) return marke;
    marke = treffer.id;
    if (treffer.kinder.length === 0 || !zeileIstOffen(treffer, offen, startOffeneTiefe)) return marke;
    liste = treffer.kinder;
  }
}


/** Alle Zeilen des Modells in Renderreihenfolge (Testhilfe und Zählwerk). */
export function flacheZeilen(knoten: GliederungsKnoten[]): GliederungsKnoten[] {
  return knoten.flatMap((k) => [k, ...flacheZeilen(k.kinder)]);
}

/**
 * Pfad (Wurzel → Zeile) zu der SYNTHETISCHEN Zeile, die diesen Artikel deckt —
 * oder `null`, wenn der Artikel in der amtlichen Gliederung liegt (dann ist
 * `pfadZu` über den Rohbaum zuständig, §5: eine Quelle je Frage).
 *
 * W2·19-GLIEDERUNG/S5, Spec §3.4 «Scroll-Spy kennt den Zustand ‹vor dem ersten
 * Knoten› und markiert ihn». Ohne diese Auflösung liest man beim RBUE 47 von 49
 * Artikeln, ohne dass die Leiste irgendetwas markiert.
 */
export function findeSynthPfad(knoten: GliederungsKnoten[], token: string): string[] | null {
  for (const k of knoten) {
    if (k.art !== 'sektion') {
      if (k.tokens?.includes(token)) return [k.id];
      const tiefer = findeSynthPfad(k.kinder, token);
      if (tiefer) return [k.id, ...tiefer];
    }
  }
  return null;
}
