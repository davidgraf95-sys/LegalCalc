// ═══ W2·19-GLIEDERUNG · S8 — Erlass-lokale Suche (pure Ableitung) ════════════
//
// Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §4 (4.1 Datenweg, 4.2
// Ranking, 4.3 Trefferliste, 4.4 findbar/malbar-Vertrag, 4.5 Highlighting),
// §9-S8. Davids Entscheid (c) vom 8.8.2026: Trefferliste MIT Textausschnitten in
// der Seitenleiste, die Lesespalte bleibt vollständig und springt.
//
// WAS DIESES MODUL IST. Eine reine, UI-freie Ableitung aus dem bereits geladenen
// Snapshot + Struktur-Sidecar. Kein React, kein DOM, kein Netz, kein
// `Date.now()` — gleiche Eingabe, gleiche Ausgabe (§2). Es liegt in
// `src/pages/`, weil es DARSTELLUNG ableitet (welche Artikel eine Trefferliste
// zeigt und in welcher Reihenfolge) und keine Rechtslogik trägt (§3).
//
// WARUM REIN LOKAL UND NICHT ÜBER DEN SUCH-INDEX (Spec §4.1). `public/such-
// index/artikel.json` ist 48.1 MB roh; das Perf-Tor misst gzip ≈ 9.96 MB gegen
// ein Budget von 10'400 KB (`scripts/check-perf-budget.ts:152`). Ihn für die
// In-Gesetz-Suche zu laden hiesse, für einen erlass-lokalen Handgriff den
// ganzen Korpus zu ziehen. Alles, was hier gebraucht wird, liegt bereits im
// Speicher: der Snapshot (Wortlaut, Label, Tabellen, `grundlage`) und das
// Sidecar (Marginalien, Gliederungspfad, Fussnoten).
//
// WAS DAMIT NEU FINDBAR WIRD. Die alte Filterregel (`passtAufSuche`, helpers)
// las AUSSCHLIESSLICH `artikelLabel` und `bloecke[].text`/`items[].text`. Vier
// Feldklassen waren damit unsichtbar, obwohl sie im Reader gerendert werden
// oder amtlicher Inhalt sind: Randtitel/Marginalien, Gliederungstitel,
// Tabellen + Bild-Alt + `grundlage`, Fussnoten. Genau sie kommen hier dazu.
//
// ─── §7-ABWEICHUNG VON DER SPEC, offengelegt statt still umgesetzt ───────────
// Spec §4.2 schreibt: «`sucherTerme()`-Normalisierung und `findeVorkommen()`
// werden wiederverwendet — keine zweite Tokenisierung (§5)». `findeVorkommen`
// wird wiederverwendet; `sucherTerme()` (src/lib/suche/artikelRanking.ts:103)
// wird BEWUSST NICHT benutzt. Grund, empirisch am Code geprüft: `sucherTerme`
// ist der Tokenizer des GLOBALEN Index — er wirft Terme unter zwei Zeichen weg
// und expandiert die Query um Vokabular-SYNONYME. Die In-Gesetz-Suche ist eine
// akzenttreue TEILSTRING-Suche, die ab dem ersten Zeichen greift, und genau
// diese Menge malt die Hervorhebung (`suchHighlight.ts`). Beide Semantiken zu
// mischen hiesse: der Zähler meldet Artikel, in denen der getippte Begriff
// buchstäblich nicht vorkommt (Synonym-Recall), und die Markierung malt dort
// nichts — die Anzeige löge über den Zustand (§8), und «EINE Treffer-Semantik»
// (§5) wäre gebrochen. Die zweite Tokenisierung, die §5 verbietet, entsteht
// hier auch nicht: es gibt gar keine — es wird ausschliesslich `findeVorkommen`
// gezählt.

import { findeVorkommen } from './suchHighlight';
import { ohneMarkup } from './helpers';
import { artikelSachtitel, randtitelKnoten } from '../../lib/normtext/darstellung';
import type { StrukturMap } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';

// ─── Felder in Index-Semantik (Spec §4.1) ───────────────────────────────────
/**
 * Die sechs Feldklassen des Generators (`scripts/such-index-generieren.ts`):
 * `t` Fliesstext+Items · `m` primäre Marginalie · `n` nachrangige Marginalie ·
 * `g` Gliederungspfad · `tb` Tabellen+Bild-Alt+`grundlage` · `f` Fussnoten.
 * Die Namen sind bewusst identisch — sie sind die semantische Brücke zum
 * Generator, der die Gewichtung `t > m > n > g > tb > f` konfiguriert.
 */
export type SuchFeld = 't' | 'm' | 'n' | 'g' | 'tb' | 'f';

/**
 * Feldgewicht in der Reihenfolge `t > m > n > g > tb > f` (Spec §4.2).
 *
 * SEMANTISCHE QUELLE ist die FlexSearch-Konfiguration von
 * `scripts/such-index-generieren.ts:145–233` — dort und nur dort lebt die
 * Gewichtung für den globalen Index. Sie wird hier NICHT importiert (das Script
 * läuft im Build, nicht im Browser), sondern als dieselbe Ordnung nachgebildet;
 * die Zahlen sind reine Ordnungsränge ohne eigene Bedeutung.
 *
 * WARUM NICHT `rangiere()` AUS `artikelRanking.ts` (Spec §4.2, [W:jurist]):
 * `rangiere` sortiert korpusweit — Kernerlass-Rang, Ebene (Bund vor Kanton),
 * dann Artikelnummer. Erlass-lokal sind Kernerlass und Ebene für ALLE
 * Kandidaten gleich; übrig bliebe «topischer Treffer, dann Artikelnummer». Die
 * Feldgewichtung, wegen der man `rangiere` überhaupt nähme, steckt gar nicht
 * darin. Eine eigene, hier vollständig sichtbare Ordnung ist damit nicht
 * Duplizierung, sondern die ehrliche Fassung.
 */
export const FELD_GEWICHT: Record<SuchFeld, number> = { t: 6, m: 5, n: 4, g: 3, tb: 2, f: 1 };

/**
 * Herkunft einer Fundstelle — feiner als das Feld, weil das Feld `tb` drei
 * verschiedene Dinge bündelt (Tabelle, Bild-Alt, Grundlage) und der Badge dem
 * Leser sagen soll, WARUM der Artikel trifft (Spec §4.3/§8). Das Feld steuert
 * die Sortierung, die Quelle den Badge.
 */
export type SuchQuelle =
  | 'Fliesstext' | 'Bestimmung' | 'Randtitel' | 'Überschrift'
  | 'Tabelle' | 'Bild' | 'Grundlage' | 'Fussnote';

/**
 * Wird dieser Textbaustein im Artikel der LESESPALTE gerendert — also: kann die
 * Fundstelle überhaupt gemalt werden (Spec §4.4)?
 *
 *  · `immer`     — der Baustein steht im `<article id="art-…">` und ist sichtbar.
 *  · `nie`       — er ist amtlicher Inhalt, erscheint aber nicht im Artikel
 *                  (Gliederungspfad: er steht als Sektionskopf ÜBER den
 *                  Artikeln; Bild-Alt: es ist ein Attribut, kein Textknoten;
 *                  nachrangige Randtitel: sie sind seit 6b eigene
 *                  Gliederungsknoten und werden am Artikel nicht wiederholt).
 *  · `fussnoten` — sichtbar, solange der Fussnoten-Schalter AN ist
 *                  (`html[data-fussnoten="aus"]` ⇒ `display:none`, index.css).
 *
 * Das ist die Zähl-Wahrheit aus Spec §4.4: der Zähler ist datenseitig und
 * unabhängig von Ansicht-Schaltern; die DOM-Hervorhebung malt nur, was malbar
 * ist. «Gemalte ≤ gezählte» ist damit KONSTRUKTIV wahr, nicht behauptet.
 */
export type Malbarkeit = 'immer' | 'nie' | 'fussnoten';

interface Segment {
  feld: SuchFeld;
  quelle: SuchQuelle;
  malbar: Malbarkeit;
  text: string;
}

/** Ein durchsuchbarer Artikel-Record. */
export interface SuchArtikel {
  token: string;
  /** Amtliches Label («Art. 12», «§ 4», «Anhang 1»). */
  label: string;
  /** Dokument-Position (Index im Snapshot) — der letzte Tie-Break der Sortierung. */
  pos: number;
  /** Sachüberschrift für die Trefferzeile; `null`, wenn der Artikel keine trägt (§8). */
  randtitel: string | null;
  /** Oberster Gliederungstitel — Zwischenkopf der Trefferliste (Spec §4.3). */
  gruppe: string | null;
  segmente: Segment[];
}

export interface LeserSuchIndex {
  /** Erlass-Schlüssel — die Cache-Identität (Spec §4.1, EIN Eintrag je Pane). */
  key: string;
  artikel: SuchArtikel[];
}

// ─── Index-Aufbau ────────────────────────────────────────────────────────────

/** Nicht-leerer, markup-freier Text — leere Bausteine kosten sonst Schleifenzeit. */
function schiebe(ziel: Segment[], feld: SuchFeld, quelle: SuchQuelle, malbar: Malbarkeit, roh: string | undefined | null): void {
  if (!roh) return;
  // Fussnoten-Texte tragen amtliche Auszeichnung («SR <b>281.1</b>», G15) —
  // ungestrippt fände eine Suche nach «b» die Tags statt des Wortlauts, und der
  // Ausschnitt zeigte rohe spitze Klammern (§8). `ohneMarkup` ist dieselbe
  // Regel, die auch der `title`-Pfad der Fussnoten benutzt (§5).
  const text = ohneMarkup(roh).trim();
  if (text === '') return;
  ziel.push({ feld, quelle, malbar, text });
}

/**
 * Baut die Feld-Records eines Erlasses. Rein und deterministisch (§2); die
 * Reihenfolge der Segmente je Artikel folgt der DOKUMENT-Reihenfolge des
 * gerenderten Artikels (Randtitel → Label → Grundlage → Wortlaut → Tabellen →
 * Fussnoten), damit die n-te datenseitige Fundstelle eines Artikels im
 * Regelfall auch die n-te gemalte ist (Spec §4.5, Sprung-Zuordnung).
 *
 * KOSTEN, weil sie in §15 zählen: der Aufbau läuft EINMAL je Erlass und Pane,
 * beim ERSTEN Tastendruck (lazy, s. `inhalt-suchtreffer.tsx`) — nicht beim
 * Laden des Erlasses. Er kopiert keine Strings, sondern hält Referenzen auf die
 * ohnehin geladenen Snapshot-/Sidecar-Felder; nur markup-tragende Fussnoten
 * erzeugen eine gestrippte Kopie.
 */
export function baueLeserSuchIndex(
  key: string,
  eintraege: readonly NormSnapshot[],
  struktur: StrukturMap | null,
): LeserSuchIndex {
  const artikel: SuchArtikel[] = eintraege.map((e, pos) => {
    const st = struktur?.[e.artikel];
    const marginalie = st?.marginalie ?? [];
    // `blatt` ist die artikel-EIGENE Sachüberschrift NUR dann, wenn die unterste
    // Stufe keinen Gliederungs-Aufzähler trägt — und genau dieses Blatt rendert
    // die Lesespalte am Artikel (`margAnzeige`, inhalt-ableitungen). Es
    // entscheidet hier deshalb die MALBARKEIT, nicht die Feldklasse.
    const { blatt } = randtitelKnoten(marginalie);
    // N1: fehlt eine Sidecar-Marginalie, trägt der Snapshot den amtlichen
    // Randtitel selbst (`titel`, LexWork article_title) — dieselbe Zwei-Quellen-
    // Regel wie `hatRandtitel` im Gliederungs-Modell (§5). Für die ANZEIGE der
    // Trefferzeile zählt die reine Sachüberschrift (Aufzähler abgestreift),
    // sonst hiesse die halbe VwVG-Trefferliste «1.» und «II.».
    const sachtitel = artikelSachtitel(marginalie) ?? (e.titel?.trim() || null);
    const gliederung = st?.gliederung ?? [];

    const segmente: Segment[] = [];
    // 1 · Randtitel-Kette. Die Feldklassen folgen der Generator-Semantik
    //     (`scripts/such-index-generieren.ts:219–221`): `m` = die OBERSTE
    //     Marginalie-Stufe (Hauptthema), `n` = alle nachrangigen. Nicht dem
    //     Blatt/Ahnen-Schnitt der Darstellung — dieser Schnitt entscheidet nur,
    //     ob die Stufe am Artikel überhaupt gemalt wird (§5: EINE Semantik je
    //     Frage, nicht eine Semantik für beide Fragen).
    marginalie.forEach((stufe, i) => {
      schiebe(segmente, i === 0 ? 'm' : 'n', 'Randtitel',
        blatt !== null && stufe === blatt ? 'immer' : 'nie', stufe);
    });
    // Kantons-Snapshots ohne Sidecar-Marginalie: `titel` ist der amtliche
    // Randtitel und wird am Artikel gerendert (ArtikelLeser-Fallback).
    if (marginalie.length === 0) schiebe(segmente, 'm', 'Randtitel', 'immer', e.titel);
    // 2 · Die Bestimmungs-Bezeichnung selbst. Sie steht im Artikelkopf und war
    //     schon in der alten Filterregel durchsuchbar («Art. 41»); sie zählt
    //     zum Feld `g`, weil sie eine Überschrift ist und kein Wortlaut.
    schiebe(segmente, 'g', 'Bestimmung', 'immer', e.artikelLabel);
    // 3 · Gliederungspfad: amtlich, aber am Artikel nie wiederholt.
    for (const g of gliederung) schiebe(segmente, 'g', 'Überschrift', 'nie', g.label);
    // 4 · Delegationsnorm-Grundlage (G23) — dezente Zeile unter dem Randtitel.
    schiebe(segmente, 'tb', 'Grundlage', 'immer', e.grundlage);
    // 5 · Wortlaut + Aufzählungspunkte, dann Tabellen und Bild-Alt desselben
    //     Blocks (so bleibt die Dokument-Reihenfolge erhalten).
    for (const b of e.bloecke) {
      // Absatz- und lit./Ziff.-MARKEN zählen zum Fliesstext: sie sind amtlicher
      // Bestandteil der Bestimmung («Abs. 2», «lit. a») und werden als hängende
      // Marke gerendert. Ohne sie zählte eine Ziffern-Suche weniger, als die
      // Lesespalte malt — der §4.4-Vertrag «gemalte ≤ gezählte» wäre für
      // genau diese Suchen gebrochen (am BGFA vor dieser Zeile gemessen:
      // «2» → 164 gezählt gegen 184 gemalt).
      schiebe(segmente, 't', 'Fliesstext', 'immer', b.absatz);
      schiebe(segmente, 't', 'Fliesstext', 'immer', b.text);
      for (const it of b.items ?? []) {
        schiebe(segmente, 't', 'Fliesstext', 'immer', it.marke);
        schiebe(segmente, 't', 'Fliesstext', 'immer', it.text);
      }
      for (const z of b.tabelle ?? []) {
        schiebe(segmente, 'tb', 'Tabelle', 'immer', z.beschreibung);
        schiebe(segmente, 'tb', 'Tabelle', 'immer', z.betrag);
      }
      const ms = b.mehrspaltig;
      if (ms) {
        for (const sp of ms.spalten ?? []) schiebe(segmente, 'tb', 'Tabelle', 'immer', sp.titel);
        for (const k of ms.kopf ?? []) schiebe(segmente, 'tb', 'Tabelle', 'immer', k);
        for (const zeile of ms.zeilen) for (const z of zeile) schiebe(segmente, 'tb', 'Tabelle', 'immer', z);
      }
      // Bild-/Kachel-Blöcke: der Alt-Text ist amtlicher Inhalt (Formeln,
      // Signaltafeln) und damit findbar — malbar ist er NIE, weil er als
      // Attribut und nicht als Textknoten im DOM steht. Genau dafür gibt es
      // den Badge (§8): der Leser sieht, warum der Artikel trifft, obwohl im
      // Wortlaut nichts leuchtet.
      const bb = b as NormSnapshot['bloecke'][number] & {
        bild?: { alt?: string };
        bildKacheln?: Array<{ bild?: { alt?: string }; nummer?: string; name?: string }>;
      };
      schiebe(segmente, 'tb', 'Bild', 'nie', bb.bild?.alt);
      for (const k of bb.bildKacheln ?? []) {
        schiebe(segmente, 'tb', 'Bild', 'nie', k.bild?.alt);
        schiebe(segmente, 'tb', 'Bild', 'nie', k.name);
      }
    }
    // 6 · Fussnoten-Apparat. Die NUMMER gehört mit in den Baustein: sie wird
    //     als `num`-Span vor dem Text gerendert, also ist sie gemalt — stünde
    //     sie nicht im Index, könnte die Markierung mehr zeigen als der Zähler
    //     zählt (§4.4).
    for (const f of st?.fussnoten ?? []) {
      schiebe(segmente, 'f', 'Fussnote', 'fussnoten', f.nr ? `${f.nr} ${f.text}` : f.text);
    }

    return {
      token: e.artikel,
      label: e.artikelLabel,
      pos,
      randtitel: sachtitel,
      gruppe: gliederung.length > 0 ? gliederung[0].label : null,
      segmente,
    };
  });

  return { key, artikel };
}

// ─── Treffer ─────────────────────────────────────────────────────────────────

export interface TrefferFeld {
  feld: SuchFeld;
  quelle: SuchQuelle;
  malbar: Malbarkeit;
  anzahl: number;
}

export interface Ausschnitt {
  /** Text vor der Fundstelle (ggf. mit führendem «…»). */
  vor: string;
  /** Der Begriff, wie er im amtlichen Text steht (Original-Schreibweise). */
  treffer: string;
  /** Text nach der Fundstelle (ggf. mit «…»). */
  nach: string;
  quelle: SuchQuelle;
}

export interface LeserTreffer {
  token: string;
  label: string;
  randtitel: string | null;
  gruppe: string | null;
  pos: number;
  /** DATENSEITIGE Fundstellen über ALLE Felder — die eine Wahrheit (§4.4 Ziff. 1). */
  fundstellen: number;
  /** Höchstes getroffenes Feldgewicht (erstes Sortierkriterium, §4.2). */
  topFeld: SuchFeld;
  /** Getroffene Felder in Feldgewicht-Reihenfolge, je mit Anzahl und Malbarkeit. */
  felder: TrefferFeld[];
  /** Textausschnitt um die erste Fundstelle (Entscheid c). `null` nie im Normalfall. */
  ausschnitt: Ausschnitt | null;
}

/** Ausschnitt-Länge (Spec §4.3: «Snippet ≤ 120 Zeichen um die erste Fundstelle»). */
export const AUSSCHNITT_MAX = 120;

function baueAusschnitt(text: string, von: number, bis: number, quelle: SuchQuelle): Ausschnitt {
  const treffer = text.slice(von, bis);
  const rest = Math.max(0, AUSSCHNITT_MAX - treffer.length);
  // Etwa ein Drittel des Kontexts vor, zwei Drittel nach der Fundstelle: was
  // NACH dem Begriff steht, trägt die Aussage meist weiter.
  const vorLaenge = Math.floor(rest / 3);
  const nachLaenge = rest - vorLaenge;
  const abVor = Math.max(0, von - vorLaenge);
  const bisNach = Math.min(text.length, bis + nachLaenge);
  return {
    vor: (abVor > 0 ? '… ' : '') + text.slice(abVor, von),
    treffer,
    nach: text.slice(bis, bisNach) + (bisNach < text.length ? ' …' : ''),
    quelle,
  };
}

/**
 * Erlass-lokale Suche über alle Felder.
 *
 * SORTIERUNG (Spec §4.2), vollständig hier und nirgends sonst:
 *  1. höchstes getroffenes Feldgewicht, `t > m > n > g > tb > f`
 *  2. Fundstellenzahl absteigend
 *  3. Artikelreihenfolge (Dokument-Position) aufsteigend
 * Alle drei Stufen sind total und deterministisch — bei gleicher Eingabe kommt
 * dieselbe Liste heraus (§2). Stufe 3 ist strikt (Position ist eindeutig), es
 * gibt also keinen Rest-Tie-Break, der von der Engine-Sortierstabilität abhinge.
 */
export function sucheImErlass(index: LeserSuchIndex | null, begriff: string): LeserTreffer[] {
  const b = begriff.trim();
  if (!index || b === '') return [];

  const treffer: LeserTreffer[] = [];
  for (const a of index.artikel) {
    // Feld → (Quelle → Anzahl). Zwei Ebenen, weil `tb` mehrere Quellen bündelt
    // und der Badge die Quelle nennt, die Sortierung aber das Feld braucht.
    const proQuelle = new Map<string, TrefferFeld>();
    let gesamt = 0;
    let ausschnitt: Ausschnitt | null = null;
    let ausschnittGewicht = -1;

    for (const seg of a.segmente) {
      const stellen = findeVorkommen(seg.text, b);
      if (stellen.length === 0) continue;
      gesamt += stellen.length;
      const schluessel = `${seg.feld}|${seg.quelle}`;
      const vorhanden = proQuelle.get(schluessel);
      if (vorhanden) vorhanden.anzahl += stellen.length;
      else proQuelle.set(schluessel, { feld: seg.feld, quelle: seg.quelle, malbar: seg.malbar, anzahl: stellen.length });
      // Der Ausschnitt kommt aus dem STÄRKSTEN getroffenen Feld, nicht aus dem
      // ersten: sonst zeigte ein Artikel, der im Wortlaut zwanzigmal trifft,
      // seinen Gliederungstitel als Beleg. Bei Gleichstand gewinnt das frühere
      // Segment (Dokument-Reihenfolge).
      if (FELD_GEWICHT[seg.feld] > ausschnittGewicht) {
        ausschnittGewicht = FELD_GEWICHT[seg.feld];
        ausschnitt = baueAusschnitt(seg.text, stellen[0][0], stellen[0][1], seg.quelle);
      }
    }
    if (gesamt === 0) continue;

    const felder = [...proQuelle.values()].sort((x, y) => FELD_GEWICHT[y.feld] - FELD_GEWICHT[x.feld]);
    treffer.push({
      token: a.token, label: a.label, randtitel: a.randtitel, gruppe: a.gruppe, pos: a.pos,
      fundstellen: gesamt, topFeld: felder[0].feld, felder, ausschnitt,
    });
  }

  treffer.sort((x, y) =>
    FELD_GEWICHT[y.topFeld] - FELD_GEWICHT[x.topFeld]
    || y.fundstellen - x.fundstellen
    || x.pos - y.pos);
  return treffer;
}

/** Datenseitiger Kopf-Zähler «N Artikel · M Fundstellen» (§4.4 Ziff. 1). */
export function zaehleTreffer(treffer: readonly LeserTreffer[]): { artikel: number; fundstellen: number } {
  let fundstellen = 0;
  for (const t of treffer) fundstellen += t.fundstellen;
  return { artikel: treffer.length, fundstellen };
}

/**
 * Herkunfts-Badges eines Treffers (Spec §4.3/§4.4 Ziff. 2).
 *
 * Gezeigt werden NUR Nicht-Fliesstext-Quellen — bei einem Fliesstext-Treffer
 * ist der Ausschnitt selbst die Erklärung. Eine Fussnoten-Quelle trägt bei
 * ausgeschaltetem Fussnoten-Apparat den Zusatz «(ausgeblendet)»: der Leser
 * sieht, dass der Sprung ihn zwar zum Artikel bringt, die Stelle aber in der
 * aktuellen Ansicht nicht leuchtet — statt dass die Ansicht beim Sprung still
 * umgeschaltet würde (§8).
 */
export function badgesFuer(t: LeserTreffer, fussnotenAus: boolean): string[] {
  const out: string[] = [];
  for (const f of t.felder) {
    if (f.quelle === 'Fliesstext') continue;
    const text = f.malbar === 'fussnoten' && fussnotenAus ? `${f.quelle} (ausgeblendet)` : f.quelle;
    if (!out.includes(text)) out.push(text);
  }
  return out;
}

/**
 * Flache Fundstellen-Folge über alle Treffer, in Listen-Reihenfolge — die
 * Grundlage der ↑↓-Navigation (Spec §4.3 «Position x/M»).
 *
 * Jeder Eintrag nennt den Artikel und den 0-basierten Rang der Fundstelle
 * INNERHALB dieses Artikels. Der Sprung nutzt beides: den Token, um zum Artikel
 * zu scrollen, und den Rang, um innerhalb des Artikels die entsprechende
 * gemalte Stelle anzusteuern, wenn es sie gibt. Gibt es sie nicht (Fundstelle
 * in einem nicht malbaren Feld, §4.4), bleibt es beim Artikel — nie wird ein
 * Sprung an eine erfundene Stelle behauptet (§8).
 */
export function fundstellenFolge(treffer: readonly LeserTreffer[]): Array<{ token: string; rang: number }> {
  const out: Array<{ token: string; rang: number }> = [];
  for (const t of treffer) for (let i = 0; i < t.fundstellen; i++) out.push({ token: t.token, rang: i });
  return out;
}
