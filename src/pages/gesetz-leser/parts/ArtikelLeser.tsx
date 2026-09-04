import { useState, memo } from 'react';
import { ArtikelBody, FnRef } from '../../../components/normtext/ArtikelBody';
import { WJ } from '../../../components/normtext/wortverbinder';
import { type InternRefs } from '../../../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, artikelGanzAufgehoben } from '../../../lib/normtext/darstellung';
import type { Fussnote } from '../../../lib/normtext/browse';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../../../lib/fedlex';
import { NEUER_TAB } from '../../../lib/benennung';
import { KOPIER_DAUER_MS } from '../../../components/useKopieren';
import { NormChip } from '../../../components/vorlagen/NormChip';
import { KanteMitVorschau } from '../../../components/verzahnung/KanteMitVorschau';
import { MehrKante } from '../../../components/verzahnung/MehrKante';
import type { LeitfallRef } from '../../../lib/rechtsprechung/norm-index';
import {
  klassifiziereFassungsBezug, entscheidDatum, type ArtikelRevision,
} from '../../../lib/verzahnung/artikel-revisionen';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../../lib/normtext/typen';
import { verifizierLinkArtikel } from '../../../lib/normtext/verifikationslink';
import type { ArtikelHistorie } from '../../../lib/normtext/historie-laden';
import { ArtikelHistorieZeile } from './ArtikelHistorie';
import { margStufeStil, fnTextMitLinks, baueZitat, margLabel } from '../helpers';
import { SUCH_META } from '../suchHighlight';
import { zitatMitAusweis, heuteIso } from '../../../lib/format';
import { schaetzeArtikelHoehe, fnNrSortKey } from '../berechnungen';
import { BezuegeZeile } from './BezuegeZeile';
import type { ArtikelBezuege } from '../bezuegeLaden';
import { urlMitHash } from '../../../lib/liveUrlSync';
import { usePaneKontext } from '../../../components/layout/PaneKontext';

// Schaufenster-Chips: nur die zentralen Leitfälle direkt zeigen (Reihenfolge =
// `gewicht` aus dem Shard), Rest hinter «+n weitere». V2·B-2 (David 10.7.2026,
// «auch mehr als fünf»): Kappung von 5 auf 10 angehoben; below-fold, kein
// Normtext-Re-Render (§15). Bewusst klein, kein Panel.
const LEITFAELLE_SICHTBAR = 10;

// «Leitfälle zu diesem Artikel» (FAHRPLAN-DATENHALTUNG §11.2, Weiche B): Chip-Zeile
// analog «Verweise». V1a-Endzustand (CI-Befund W2·7-VZUI, 3 Iterationen): die Zeile
// ist ein REINER Renderer — die Daten kommen als Prop vom Reader, der den erlass-
// lokalen Shard GENAU EINMAL idle lädt (inhalt.tsx). Vorher fetchte jede der ~1000
// Zeilen grosser Erlasse selbst (idle-Herde: >13 s Long-Tasks im 20×-Throttle,
// ★ nach ~15 s; ein Sichtbarkeits-Ansatz je Zeile scheiterte am Hydrations-Drift).
// Ein Fetch + ein setState auf Reader-Ebene: kein Herden-Jam, kein Race — memo
// re-rendert nur Artikel, deren `leitfaelle`-Prop wirklich wechselt (§15.4).
//
// Chips = geteilter KantenChip (Dichte-Regel: ★-Glyph als EIN Zusatz, aria-label
// aus dem StatusBadge-Vokabular), «+n weitere» = MehrKante. `normZitat`
// («Art. 957 OR») wandert als ?norm= an den Entscheid-Link — der EntscheidLeser
// springt zur ERSTEN Erwägung, die den Artikel zitiert (Auftrag David 3.7.2026;
// keine Fundstelle ableitbar → ehrlicher Seitenanfang, §8).
const LeitfallZeile = memo(function LeitfallZeile({ refs, normZitat, revision }: {
  /** Leitfälle dieses Artikels aus dem erlass-lokalen Shard (Reader lädt einmal). */
  refs?: LeitfallRef[];
  /** Voll zitierfähige Norm («Art. 957 OR») für den Fundstellen-Sprung im Ziel. */
  normZitat: string;
  /** Revision r(a) dieses Artikels (§V1c): undefined = unbekannt (⇒ still),
   *  null = Urfassung (⇒ still), Objekt = letzte Textänderung. Ein Leitfall,
   *  dessen Entscheiddatum VOR r(a) liegt, legt eine ältere Fassung aus → ↻-Glyph. */
  revision?: ArtikelRevision | null;
}) {
  const [alleAuf, setAlleAuf] = useState(false);

  // Wie die «Verweise»-Zeile: ohne Treffer GAR KEINE Zeile (kein reservierter
  // Leerraum, §15.2 — die grosse Mehrheit der Artikel hat keine Leitfälle; eine
  // Reservierung zöge in fast jeden Artikel Weissraum ein). Die Zeilen wachsen
  // mit dem EINEN Shard-Resolve am Artikel-Fuss ein (below-fold); der
  // prerenderte Normtext (LCP/Ctrl+F) bleibt unberührt (§15.1/3).
  if (!refs || refs.length === 0) return null;

  // W2·7-BEZUG/B5: die frühere Zeitraum-Kappung («alle · 20 · 10 · 5 J.») ist HIER
  // ENTFALLEN. Sie war die einzige Verbraucherin der abgelösten Stufen-Wahl; der
  // Zeit-Bereich wirkt seit B5 eine Schicht früher, nämlich in der Kanten-Auswahl
  // (`waehleBezuege`), und damit auf ALLE Instanzen statt nur auf die BGE-Zeile.
  // Diese Zeile filtert deshalb gar nicht mehr — sie rendert, was sie bekommt.
  const sichtbar = alleAuf ? refs : refs.slice(0, LEITFAELLE_SICHTBAR);
  const rest = refs.length - sichtbar.length;
  return (
    <div data-leitfall-zeile className="mt-4 flex flex-wrap items-center gap-2">
      <span className="lc-overline mr-1" title="Maschinell aus den zitierten Normen zugeordnet — keine redaktionelle Präjudizienauswahl. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung."><span className="lc-punkt lc-punkt-entscheid" aria-hidden />Leitfälle</span>
      {sichtbar.map((r) => {
        // ?norm= trägt die Fundstellen-Absicht: das Ziel springt zur ersten
        // Erwägung, die diese Norm zitiert (Auflösung im EntscheidLeser, §5).
        const ziel = `/rechtsprechung/${encodeURIComponent(r.key)}?norm=${encodeURIComponent(normZitat)}`;
        // §V1c: hat sich die Norm SEIT diesem Entscheid revidiert? Q1-sicher über
        // die Entscheid-Präzision (BGE-Bandjahr-Platzhalter ⇒ strikter Jahresvergleich).
        const revidiert = klassifiziereFassungsBezug(entscheidDatum(r.datum, r.gericht), revision) === 'revidiert'
          ? (revision ?? null) : null;
        return (
          <KanteMitVorschau key={r.key} ziel={ziel} zitierung={r.zitierung}
            kurztext={r.regesteKurz}
            leitentscheid={r.leitcharakter === 'leitentscheid'}
            revidiert={revidiert}
            titel={r.regesteKurz ?? r.zitierung} />
        );
      })}
      <MehrKante rest={rest} offen={alleAuf} onOeffne={() => setAlleAuf(true)} />
      {/* Weiche-B-Erweiterungspunkt (§10(6)): der Massen-Anteil «+n weitere (online)»
          aus der Edge-Query kommt HIER dazu, sobald E2 live ist — heute nur der
          geshardete Schaufenster-Anteil, kein Edge-Fetch. NICHT bauen. */}
    </div>
  );
});

// Ein Artikel im Lesefluss (Richtung A): zweispaltig wie die amtliche Druckfassung —
// links «Art. N» als ruhiger Anker mit den Randtiteln darunter (rechtsbündig, nur die
// gegenüber dem Vorartikel GEÄNDERTEN Stufen, `marg`), rechts der Serif-
// Bestimmungstext. Ersetzt den früheren fliegenden Standort-Tracker. Reine Darstellung.
export const ArtikelLeser = memo(function ArtikelLeser({ e, erlass, basisPfad, fussnoten, intern, marg, margBasis, imTreffer, onSpringe, leitfaelle, bezuege, revision, historie, istAnhang = false }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; intern?: InternRefs;
  marg?: string[];
  /** G-HIST-UI: Fassungshistorie dieses Artikels aus dem erlass-lokalen Shard
   *  (Reader lädt ihn einmal idle). undefined = kein Eintrag ⇒ kein Badge (§8). */
  historie?: ArtikelHistorie;
  /** W2·5d G3b (③/⑤): der Eintrag ist ein Anhang (`annex_*`) bzw. Staatsvertrags-
   *  Protokoll (`lvl_*`) — als eigenständig erkennbarer, klar abgesetzter Block
   *  rendern (Struktur-Trenner statt Artikel-Trenner, «Anhang N»/«Protokoll N» als
   *  Struktur-Überschrift statt Artikelnummer). Reine Darstellung (§3); Prosa
   *  byte-gleich, nur Markup/Klassen. Delimitation über Typo + Struktur-Trenner
   *  (Linien-Kanon «Ruhe durch Reduktion» — keine Farb-/Box-Sprache). */
  istAnhang?: boolean;
  /** Leitfälle dieses Artikels (V1a-Form, flache BGE-Chip-Reihe).
   *
   *  W2·7-BEZUG/B4: DER READER SETZT DIESE PROP NICHT MEHR. Seit der Vorgabe
   *  David 28.7.2026 speist sich der Artikelfuss ausschliesslich aus `bezuege`
   *  (facettierte Auflistung; der Bezugs-Shard ist die Obermenge des schlanken
   *  Leitfall-Shards). Die Prop und `LeitfallZeile` bleiben als unveränderte
   *  Darstellungsform bestehen — sie werden weiterhin direkt konsumiert (u. a.
   *  vom Farbwörterbuch-Test) und sind kein toter Zweig, sondern ein nicht mehr
   *  vom Reader bedienter Eingang. */
  leitfaelle?: LeitfallRef[];
  /** W2·7-BEZUG/B4: facettierte Bezüge dieses Artikels, sobald der Nutzer die
   *  Facetten erweitert hat. Gesetzt ⇒ die `BezuegeZeile` tritt AN DIE STELLE
   *  der `LeitfallZeile` (der Bezugs-Shard ist deren Obermenge, §5 — nie beide
   *  nebeneinander, das wären zwei Wahrheiten am selben Artikel). */
  bezuege?: ArtikelBezuege;
  /** Revision r(a) dieses Artikels (§V1c) — an die LeitfallZeile durchgereicht. */
  revision?: ArtikelRevision | null;
  // Absolute Tiefe der ERSTEN gezeigten Randtitel-Stufe (Delta-Offset). Damit
  // wird die Stufe einheitlich je absoluter Tiefe formatiert, auch wenn nur
  // die geänderten Stufen gezeigt werden. 0 (Default) = volle Kette (Suchsicht).
  margBasis?: number;
  // Treffer-Modus (Auftrag David): Klick auf die Artikelnummer springt in den
  // VOLLTEXT zu diesem Artikel und löscht die Suche, statt nur innerhalb der
  // Trefferliste zu ankern.
  imTreffer?: boolean; onSpringe?: (token: string) => void;
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  // LM-202: der Teilen-Knopf schreibt die Adresse — im SEKUNDÄREN Pane nicht
  // (Herleitung unten bei `kopiere`; massgeblich ist die Rolle, nicht `imPane`).
  // Ohne montierten Provider liefert der Kontext `rolle: 'primaer'` ⇒
  // Einzelansicht/Prerender unverändert.
  const { rolle } = usePaneKontext();
  const istSekundaer = rolle === 'sekundaer';
  const label = labelMitBereich(e.artikelLabel, e.artikel);
  // KURZ-Zitat («Art. 957 OR») — Fundstellen-Signal für den Entscheid-Sprung
  // (LeitfallZeile `normZitat` → ?norm=). MUSS knapp bleiben, sonst matcht der
  // EntscheidLeser die zitierende Erwägung nicht mehr.
  const zitat = `${label} ${erlass.kuerzel}`;
  // VOLL-Zitat (W2·5d G2b) für die Kopier-Aktion: Fundstelle + SR + Stand (§7 a–d).
  const zitatVoll = baueZitat(erlass, label);
  // EID-2 (W2·5d §12): Verifizier-Deep-Link «amtliche Fassung an genau dieser
  // Stelle» — die per-Artikel-ELI-URL des Snapshots (quelleUrl#art_…), validiert
  // im Builder (§5-SSoT; Kanton/aufgehoben/Synthese-Suffix ⇒ null = KEIN Link, §8).
  const amtlich = verifizierLinkArtikel(e, erlass);
  // Vollständig aufgehobener Artikel → dezent + standardmässig eingeklappt
  // (Auftrag David: «nicht so präsent», aufklappbar über den ▾/▸-Toggle).
  // G-AUFH-ART: e.aufgehoben (amtlich verifiziertes Adapter-Signal) hat Vorrang
  // vor der Text-Heuristik, falls gesetzt (s. artikelGanzAufgehoben-Doku).
  const ganzAufgehoben = artikelGanzAufgehoben(e.bloecke, e.aufgehoben);
  // Fussnoten am Fuss: amtliche Sidecar-Fussnoten bevorzugen; fehlen sie, die
  // aus dem Wortlaut-Block abgetrennte Änderungshistorie (Extraktions-Artefakt)
  // hier zeigen — einheitlich EINE Quelle, keine Doppelung.
  const fussAnzeigeRoh: Fussnote[] = fussnoten && fussnoten.length > 0
    ? fussnoten
    : e.bloecke
        .map((b) => trenneAenderungshistorie(b.text).historie)
        .filter((h): h is string => !!h)
        .map((text): Fussnote => ({ nr: '', text, links: [] }));
  // A43 (David 16.7.): Fussnoten in Fedlex-ANZEIGE-Reihenfolge = laufende Nummer
  // (Fedlex nummeriert global nach Dokumentposition). Das Sidecar liefert bewusst
  // [artikel-eigene, …Section-heading] (load-bearing für den Revisions-Extrakt,
  // §3) — die Section-heading-Fussnote (z. B. SchKG 56 fn 95 am Randtitel «III.
  // Geschlossene Zeiten …», steht ÜBER dem Artikel) hat aber eine KLEINERE Nummer
  // und gehört im Apparat VOR die artikel-eigenen. Darum hier für die DARSTELLUNG
  // stabil nach numerischer Nr (+ Buchstaben-Suffix «95a») sortieren; leere/nicht-
  // parsbare Nr behalten stabil ihre Lage. Reine Darstellung — Sidecar/Daten unberührt.
  // W2·5i: der Nummern-Sortierschlüssel steht als `fnNrSortKey` in ./berechnungen
  // (identische Implementierung, dort auch von der Chronologie-Reihung genutzt) —
  // die frühere lokale Kopie ist entfallen, damit die Anzeige-Ordnung der
  // Fussnoten nicht an zwei Stellen definiert ist (§5).
  const fussAnzeige: Fussnote[] = [...fussAnzeigeRoh].sort((a, b) => {
    const ka = fnNrSortKey(a.nr), kb = fnNrSortKey(b.nr);
    return ka[0] - kb[0] || ka[1].localeCompare(kb[1]);
  });
  const [artOffen, setArtOffen] = useState(!ganzAufgehoben); // einzelner Artikel ein-/ausklappbar; aufgehoben → zu
  // Fussnoten dem Absatz zuordnen, den sie betreffen: trägt der Absatz einen
  // Normverweis auf denselben Erlass (eli/cc-Basis), auf den die Fussnote
  // verlinkt (z. B. «SR 311.0» = StGB), gehört die Fussnote zu diesem Absatz →
  // Marker am Absatzende. Sonst (z. B. «Fassung gemäss …») an der Artikelnummer.
  // Fussnote → Block: die Absatznummer kommt direkt aus der Extraktion
  // (fn.absatz = Absatz, in dem der Marker im Fedlex-HTML steht). Marker auf dem
  // Artikelkopf/der Marginalie tragen absatz=null → Artikelebene. Schlüssel =
  // Block-Index (mehrere absatzlose Blöcke kollidieren nicht).
  const fnProAbsatz: Record<number, string[]> = {};
  const fnProItem: Record<string, string[]> = {}; // Schlüssel «<blockIndex>|<marke>»
  const fnArtikelEbene: string[] = [];
  // G11: Marker für section-heading-Fussnoten je Überschrift-Label — landen NICHT
  // mehr anonym auf Artikelebene, sondern an der passenden Randtitel-/Sektions-Zeile.
  const fnProSektion: Record<string, string[]> = {};
  // FN-5/M14: wortgenau positionierbare Marker (Sidecar-`pos`) je Block bzw.
  // Item (Schlüssel «<blockIndex>|<itemIndex>»). NUR wenn der Drift-Riegel hält
  // (pos.l === aktuelle Textlänge, Offset im Bereich) — sonst fällt der Marker
  // auf die bisherigen Block-Ende-Pfade zurück (§1: nie eine geratene Position).
  const fnInlineAbsatz: Record<number, Array<{ nr: string; o: number }>> = {};
  const fnInlineItem: Record<string, Array<{ nr: string; o: number }>> = {};
  // W2·5i-HIST-ANSICHT: Fussnoten-Nr → build-seitige Klasse (`kl`). EINE Abbildung
  // für alle Marker-Pfade (ArtikelBody-Prop) und den Apparat hier. Fehlt `kl`
  // (Kanton-Sidecars, Extraktions-Fallback aus dem Wortlaut-Block), bleibt der
  // Eintrag leer → kein data-fn-klasse → in JEDER Ansicht sichtbar (§8).
  const fnKlasse: Record<string, string> = {};
  for (const f of fussAnzeige) if (f.nr && f.kl) fnKlasse[f.nr] = f.kl;
  // S1 (Optionen-Rückbau, David F1 «ja»): die frühere Chronologie-Reihung dieses
  // Artikels ist ENTFALLEN — mit dem dritten Historie-Modus fällt die zweite
  // Darstellung derselben Vermerke weg. Die Vermerke selbst sind unberührt: sie
  // stehen im Fussnoten-Apparat unten, mit Nummer, Wortlaut und AS/BBl-Link.
  for (const f of fussAnzeige) {
    if (!f.nr) continue;
    if (f.sektion) { (fnProSektion[f.sektion] ??= []).push(f.nr); continue; }
    const p = f.pos;
    if (p != null && p.b >= 0 && p.b < e.bloecke.length) {
      const blk = e.bloecke[p.b];
      // B1-Riegel (Gegenprüfungs-Befund 26.7.): eine pos darf nur inline
      // routen, wenn ArtikelBody für die Zielstelle wirklich einen Marker-Slot
      // rendert — sonst wird der Marker ersatzlos verschluckt. Spiegelbildlich
      // zu ArtikelBody, seit PR #372 (Bild-Blöcke rendern ihre items über die
      // geteilte itemListe) nach Slot getrennt:
      // - titel-Block (`titel !== undefined`; Gegenprüfung R2: `== null`
      //   liesse `titel: null` durch): rendert weder Text noch items → JEDE
      //   pos verwerfen, Legacy-Fallback unten.
      // - Bild-/Kachel-Block: Item-Slot existiert (itemListe), Text-<p>
      //   weiterhin nicht → Item-pos inline erlaubt (DBG 22 fn57, STHG 7
      //   fn27: <dl> am Formelbild), Absatz-pos verwerfen.
      // - Prosa-Block: beide Slots wie bisher.
      const bb = blk as { bild?: unknown; bildKacheln?: unknown[]; titel?: unknown };
      const istTitel = bb.titel !== undefined;
      const istBild = Boolean(bb.bild) || Boolean(bb.bildKacheln && bb.bildKacheln.length > 0);
      const itemSlotDa = !istTitel;
      const textSlotDa = !istTitel && !istBild;
      if (p.it != null && !itemSlotDa) {
        // pos verwerfen → Legacy-Routing unten (Marker am sichtbaren Block).
      } else if (p.it == null && !textSlotDa) {
        // pos verwerfen → Legacy-Routing unten (Marker am sichtbaren Block).
      } else if (p.it != null) {
        const its = blk.items ?? [];
        const zt = p.it >= 0 && p.it < its.length ? its[p.it].text : null;
        if (zt != null && p.l === zt.length && p.o >= 0 && p.o <= zt.length) {
          (fnInlineItem[`${p.b}|${p.it}`] ??= []).push({ nr: f.nr, o: p.o });
          continue;
        }
      } else if (blk.text && p.l === blk.text.length && p.o >= 0 && p.o <= blk.text.length) {
        (fnInlineAbsatz[p.b] ??= []).push({ nr: f.nr, o: p.o });
        continue;
      }
    }
    let idx = f.absatz != null ? e.bloecke.findIndex((b) => b.absatz === f.absatz) : -1;
    // A31a: Marker in einem absatzlosen Fliesstext-Absatz (fn 667 in ZGB 798a) → am
    // Ende SEINES Blocks (0-basierter Index vom Extraktor) statt auf der Artikelebene.
    // Defensiv: Index im Bereich UND Zielblock wirklich absatzlos (gegen Sidecar-Drift).
    if (idx < 0 && f.absatzIndex != null && f.absatzIndex >= 0 && f.absatzIndex < e.bloecke.length
        && e.bloecke[f.absatzIndex].absatz == null) idx = f.absatzIndex;
    if (f.item && idx < 0) idx = e.bloecke.findIndex((b) => (b.items ?? []).some((it) => it.marke === f.item));
    if (idx >= 0 && f.item && (e.bloecke[idx].items ?? []).some((it) => it.marke === f.item)) {
      (fnProItem[`${idx}|${f.item}`] ??= []).push(f.nr); // Fussnote am lit/Ziff-Item
    } else if (idx >= 0) {
      (fnProAbsatz[idx] ??= []).push(f.nr); // am Absatz
    } else fnArtikelEbene.push(f.nr); // am Artikel
  }
  // Marker nur, wenn der Artikel offen ist (Ziel <p id=fn-…> lebt im artOffen-Block):
  // sonst öffnete der sichtbare Marker am eingeklappten Artikel ein leeres Popover
  // (toter Bedienpfad — typisch bei aufgehobenen Artikeln, Default eingeklappt).
  // W2·5d G2b (Fussnoten-Unifizierung): der Marker rendert jetzt IMMER (nur an
  // `artOffen` gebunden, nicht mehr am alten `fussnotenAuf`-React-Schalter) —
  // amtliche Substanz bleibt im DOM (R9/§8, Ctrl+F/Print/Screenreader). Die
  // Prominenz steuert allein der data-fussnoten-CSS-Toggle (index.css): «AUS»
  // DÄMPFT, versteckt nie. So gibt es EINE Fussnoten-Bedienung statt zweier.
  // A31 (David 16.7.2026): der Fussnoten-Marker klebt auf Fedlex DIREKT an der
  // Artikelnummer (kein Abstand). Darum KEIN `ml-0.5` mehr und der Marker sitzt im
  // selben Inline-Kontext wie das «Art. N»-Label (unten in whitespace-nowrap
  // gewickelt), nicht als eigenes flex-Kind mit gap-x-2.
  // W2·5i: `data-fn-klasse` sitzt am PER-NR-Wrapper, nicht (nur) am FnRef — sonst
  // bliebe beim Ausblenden eines A-Markers dessen Trenn-Komma stehen. Der Wrapper
  // trägt Komma UND Marker, verschwindet also als Ganzes.
  const fnMarker = artOffen && fnArtikelEbene.length > 0
    ? <span data-fn-marker>{fnArtikelEbene.map((nr, i) => (
        <span key={nr} data-fn-klasse={fnKlasse[nr]}>{i > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
      ))}</span>
    : null;
  // VERWEISE: im Artikel genannte, auflösbare (Bund-)Normverweise als Chips am
  // Fuss sammeln (Davids Referenz). Dedupliziert; nur was fedlexLinkFuerArtikel
  // wirklich auflöst (nie ein toter Link, §8). Inline-Links bleiben (17.6).
  const verweise: string[] = (() => {
    const seen = new Set<string>(); const out: string[] = [];
    for (const b of e.bloecke) {
      for (const t of [b.text, ...(b.items?.map((it) => it.text) ?? [])]) {
        for (const m of t.matchAll(NORM_IM_TEXT)) {
          const roh = m[0].trim();
          if (fedlexLinkFuerArtikel(roh) == null) continue;
          const key = roh.replace(/\s+/g, ' ');
          if (!seen.has(key)) { seen.add(key); out.push(roh); }
        }
      }
    }
    return out;
  })();
  const kopiere = (was: 'zitat' | 'link') => {
    // §5 — der Permalink wird mit DERSELBEN Funktion kodiert, die unten die
    // Adresse schreibt (`urlMitHash`). Vorher stand hier ein handgebauter
    // String, und die beiden gerieten bei 54 Artikel-Token auseinander: Tokens
    // mit Leerzeichen oder Halbgeviert («22 a» in BS-215.400, «36–42» in
    // AR-233.3, «10. 1» in BS-785.700) liefen als Kopie roh («#art-22 a»), als
    // Adresse prozent-kodiert («#art-22%20a») aus dem Haus. Kopie ≠ Adresse ist
    // genau das, was LM-202 abstellt — und ein Leerzeichen im Permalink bricht
    // zusätzlich die Auto-Verlinkung in Mail- und Chat-Programmen.
    // `origin` nur im Browser; `kopiere` läuft ausschliesslich aus einem
    // onClick, der Zweig ohne `window` ist reine Absicherung (kein URL-Wurf).
    const permalink = typeof window !== 'undefined'
      ? urlMitHash(`${window.location.origin}${basisPfad}`, `art-${e.artikel}`)
      : `${basisPfad}#art-${e.artikel}`;
    // B-6 (QS-BASIS): die Zitat-Kopie trägt jetzt den Stand-Ausweis (§7 a–d) —
    // `zitatVoll` (baueZitat) liefert bereits «… (Stand …)» = die Fassung, der
    // Baustein ergänzt Abrufdatum + Permalink (kein doppeltes Standdatum, §5).
    // W2·10-UI-NAV/R3: zusätzlich der amtliche Deep-Link (`amtlich`, EID-2) —
    // derselbe Wert, den der «amtliche Fassung ↗»-Knopf daneben ansteuert (§5,
    // EINE Quelle: `verifizierLinkArtikel`). Er stand bisher nur ALS KLICK im
    // UI; wer das Zitat kopierte, verlor genau den Nachweis, der es überprüfbar
    // macht. `?? undefined`: liefert der Validator null (Kanton, aufgehoben,
    // Synthese-Suffix), bleibt die Zeile ohne amtliche Quelle statt mit einer
    // geratenen (§8).
    const text = was === 'zitat'
      ? zitatMitAusweis(zitatVoll, {
          abruf: heuteIso(new Date()), permalink, amtlich: amtlich ?? undefined,
        })
      : permalink;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), KOPIER_DAUER_MS);
    });
    // ── LM-202 (W2·10-UI-NAV-URL, David-Entscheid 3.8.2026) ──────────────────
    // «Die URL ändert sich NUR bei explizitem Klick auf einen Artikel-Anker bzw.
    // bei der Teilen-Aktion.» Der «Link»-Knopf IST die Teilen-Aktion — er legte
    // den Permalink bisher in die Zwischenablage, während die Adressleiste auf
    // dem zuletzt angesprungenen Anker stehen blieb. Wer den Link teilte und
    // danach die Adresse las, sah zwei verschiedene Fundstellen (genau die
    // LM-202-Beobachtung). Darum: der Teilen-Klick setzt den Anker auch in die
    // Adresse — per `replaceState`, damit das Kopieren keinen «Zurück»-Schritt
    // erzeugt (Verlaufs-Ökonomie wie LM-209).
    //
    // NUR beim «Link»-Knopf, nicht beim «Zitat»-Knopf: das Zitat wandert in
    // einen Schriftsatz, es ist kein Ortswechsel.
    //
    // Und nur, wenn dieser Teilbaum die ADRESSIERTE Seite ist. Die Grenze heisst
    // darum `!istSekundaer`, NICHT `!imPane` — die beiden fallen im Split-View
    // auseinander: `Shell.tsx` montiert auch das PRIMÄRE Pane mit
    // `imPane: true` (Container-Query-Modus), nur die Rolle unterscheidet die
    // beiden. Mit `!imPane` schwieg der Teilen-Knopf im Split-View auf BEIDEN
    // Seiten, während `springeZuArtikel` (inhalt.tsx) im primären Pane sehr wohl
    // schrieb — das LM-202-Symptom (Kopie ≠ Adresse) überlebte dort also genau
    // in der Ansicht, für die es gebaut wurde. `springeZuArtikel` zieht die
    // Grenze seit je über `istSekundaer`; hier gilt dieselbe (§5, EINE Grenze).
    // Sekundäres Pane bleibt aussen vor: es ist nicht die adressierte Seite und
    // darf die Haupt-URL nie umschreiben (Konvention auch von `wechsleTab`).
    //
    // `?r=`-Instanz-Diskriminator: die Adresse behält ihn (er ist die Reiter-
    // Identität), der KOPIERTE Link trägt ihn bewusst nicht — er ist rein lokal
    // und hätte beim Empfänger keine Bedeutung. Ohne offene Zweitinstanz sind
    // beide zeichengleich.
    if (was === 'link' && !istSekundaer && typeof window !== 'undefined' && window.history) {
      window.history.replaceState(window.history.state, '', urlMitHash(window.location.href, `art-${e.artikel}`));
    }
  };
  // Aufhebungsnotiz (G16/#3): die amtliche «Aufgehoben durch … (AS …)»-Notiz eines
  // voll aufgehobenen Artikels liegt als artikel-Ebene-Fussnote im Snapshot
  // (absatz/item = null). M2 (David 29.6.2026) / G2b: sie ist eine Fussnote und liegt
  // wie jede Fussnote IMMER im DOM (data-fn-apparat, per data-fussnoten-CSS dämpfbar,
  // R9); die Statuszeile «· aufgehoben» (Artikelzustand) bleibt davon unberührt
  // immer sichtbar. Wortlaut nie erfunden (§1).
  const aufhebungNotiz: Fussnote[] = ganzAufgehoben
    ? fussAnzeige.filter((f) => f.absatz == null && f.item == null)
    : [];
  // W2·5d G3b (③/⑤): Anhang/Protokoll tragen einen kräftigeren Struktur-Trenner
  // (rule-struktur statt rule-artikel) + mehr Weissraum — so hebt sich jeder
  // Anhang-Block klar vom Normtext und vom Vor-Anhang ab (Linien-Kanon-Rolle
  // «Struktur-Trenner», wie oberste Sektionen/Ingress). Reine Darstellung (§3).
  return (
    <article id={`art-${e.artikel}`} data-normtext-linie data-anhang={istAnhang ? '' : undefined}
      // W2·5d U-POSITION/A2: inhalts-proportionale content-visibility-Platzhalter-
      // höhe (überschreibt den flachen 320px-Default der .nt-art-cv-Klasse) → der
      // Scrollbalken wird proportional. `content-visibility:auto` (Klasse) bleibt;
      // reiner Platzhalter-Schätzwert, kein DOM-/Inhalts-Eingriff (§15/1).
      style={{ containIntrinsicSize: `auto ${schaetzeArtikelHoehe(e)}px` }}
      // ─── W2·19-GLIEDERUNG / F1: Hover-Spotlight ERSATZLOS entfernt ──────────
      // WAR: `transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80
      //       has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]`
      // (Commit 820db9dc1, 18.6.2026 — «andere Artikel dimmen», Davids Wunsch).
      //
      // WARUM WEG (Messung, bibliothek/betrieb/gliederung-perf-diagnose-2026-08-08.md):
      // die Kette hing an JEDEM der 1686 <article> des OR. Jedes Hover-Kippen beim
      // Scrollen startete 1686 gleichzeitige Opazitäts-Transitionen (4 Ereignisse je
      // Element) — gemessen 142 208 Transition-Ereignisse je 60-Schritt-Scroll,
      // React-Root-Dispatcher 284 499 Aufrufe/7 s. Anteil an der Blockierzeit ~78 %
      // (U1); die verbleibenden ~20 % (U2) sind die `:has()`-Invalidierung über die
      // ganze Lesespalte, die mit der Kette ebenfalls entfällt. Belegte Wirkung:
      // Frame-Median 33.3 → 16.7 ms (30 → 60 fps) @1×, TBT @4× 8845–9003 ms →
      // Boden 283–297 ms (Maus-am-Rand-Referenzmessung).
      //
      // ERSATZLOS auf Entscheid David 8.8.2026 abends: «der Dimm-Effekt kann auch weg
      // — Gliederung ist wichtiger». Damit entfällt auch der im Dossier aufgeschobene
      // Scrim-Ersatz (F1b); es wird KEIN anderes Mittel eingesetzt.
      //
      // WAS BLEIBT: `group` (der Aktions-Slot der Kopfzeile hängt mit
      // `group-hover:opacity-100` daran, s. u.), `relative z-0` (unveränderte
      // Stapelordnung des Ruhezustands — nur der Hover-Sprung auf z-[5] fällt weg).
      // §15-Logikverlust: keiner — reine Darstellung (§3), Normtext, Anker, Ctrl+F,
      // Druck und Golden-Ausgaben sind unberührt.
      className={`nt-art-cv group relative z-0 nt-anker border-t ${istAnhang ? 'border-rule-struktur pt-9 mt-9' : 'border-rule-artikel pt-7 mt-7'} first:border-t-0 first:mt-0 first:pt-0`}>
      {/* Fedlex-Stil (Auftrag David): «Art. N» + Randtitel/Sachüberschrift stehen
          IMMER OBERHALB des Absatztextes (keine seitliche Randspalte mehr), damit
          der Normtext die volle Lesespaltenbreite bekommt. Reine Darstellung (§3). */}
      <div>
        {/* Kopfzeile des Artikels: «Art. N» als Anker, darunter die Randtitel
            (linksbündig, Sachüberschrift zuunterst) — über dem Fliesstext. */}
        <div className="mb-1.5">
          {/* Fedlex-Reihenfolge (Auftrag David 26.6.2026): Gliederungs-/Randtitel
              stehen ÜBER der Artikelnummer (nicht darunter) — und bleiben auch bei
              eingeklapptem/aufgehobenem Artikel sichtbar (Fedlex-treu). Die unterste
              Stufe (Sachüberschrift) zuunterst, font-medium. Reine Darstellung (§3).
              N1 (BS-Audit 23.6.2026): amtlicher Randtitel (article_title) nur, wenn
              KEINE feinere struktur-Marginalie (marg) vorliegt. */}
          {marg && marg.length > 0 ? (
            <div className="mb-1 space-y-0.5 font-serif leading-snug">
              {marg.map((m, i) => (
                <div key={i} className={margStufeStil((margBasis ?? 0) + i, i === marg.length - 1)}>
                  {/* A30: bis/ter-Suffix des Enumerators hochgestellt (margLabel). */}
                  {margLabel(m)}
                  {/* G11: section-heading-Fussnoten-Marker an der passenden Randtitel-
                      Zeile (blatt im Volltext, ganze Kette in der Suchsicht). G2b:
                      immer (an artOffen gebunden), Prominenz via data-fussnoten-CSS.
                      A31: Wort-Verbinder (U+2060) klebt den Marker DIREKT an die
                      Marginalie (kein Abstand, kein Umbruch auf eine eigene Zeile). */}
                  {artOffen && fnProSektion[m]?.map((nr, j) => (
                    <span key={nr} data-fn-marker data-fn-klasse={fnKlasse[nr]}>{WJ}{j > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
                  ))}
                </div>
              ))}
            </div>
          ) : e.titel ? (
            /* S2 · Ä7: derselbe Stil wie das Randtitel-BLATT in `margStufeStil`
               (dort steht die Herleitung) — es ist dieselbe Rolle, nur aus der
               anderen Quelle (`article_title` statt `marg`). Beide müssen gleich
               aussehen, sonst wechselt die Sachüberschrift zwischen Artikeln ihre
               Stimme (§5). */
            <div className="mb-1 font-sans text-leser-rand font-semibold text-ink-800">
              {e.titel}
            </div>
          ) : null}
          {/* Artikelnummer-Zeile: «Art. N» als Anker; Zitat/Link rechtsbündig INLINE
              (ml-auto) statt als eigene Zeile darunter — schliesst den Abstand zum
              ersten Absatz (Auftrag David 26.6.2026, P8). */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {/* M9: aufgehobener Artikel trägt kein Klapp-Chevron (nichts zu entfalten —
                der Wortlaut ist «…»), aber EINEN gleich breiten w-4-Platzhalter wie der
                Chevron-Knopf der aktiven Artikel → die «Art. N» fluchten bündig auf
                EINER Ebene (Art. 349–358 ZGB bündig zu Art. 348). Beide inline-flex
                w-4 justify-center, damit die Glyphe nicht die Spaltenbreite verschiebt. */}
            {ganzAufgehoben
              ? <span className="inline-flex w-4 shrink-0" aria-hidden />
              : <button type="button" onClick={() => setArtOffen((v) => !v)} aria-expanded={artOffen}
                  // WCAG 4.1.2 · konstanter, den Artikel BENENNENDER Name
                  // (QS-UI Folgeschritt, 5.9.2026; in Teilpass (e) noch
                  // zurückgestellt, weil er Test-Zeilen berührt).
                  // Vorher: `artOffen ? 'Artikel einklappen' : 'Artikel
                  // ausklappen'`. Gemessen an /gesetze/bund/GEBV_HREG: ZWÖLF
                  // Knöpfe mit wortgleichem Namen «Artikel einklappen» auf EINER
                  // Seite (auf dem OR 1598 bei derselben Erhebung über alle
                  // aria-expanded-Knöpfe der Artikel) — in der Knopf-Liste eines
                  // Screenreaders ununterscheidbar; dazu wechselte der Name beim
                  // Klick, worauf Sprachsteuerung ins Leere zielt. Jetzt trägt
                  // der Name den Artikel, den er klappt, den Zustand trägt
                  // allein `aria-expanded` — dasselbe Muster wie beim Zwilling
                  // `SektionBaumTOC.tsx` (dort steht die ausführliche
                  // Herleitung). Bewacht von `ARIA_ZUSTANDSNAME`
                  // (eslint.config.js); die Ausnahme aus Teilpass (e) ist
                  // ersatzlos weg, das Tor ist hier wieder scharf.
                  aria-label={`«${label}» auf- und zuklappen`}
                  // F3/C5 (29.8.2026): ink-300 → ink-500 — einzige Affordanz
                  // des Klapp-Knopfes, gemessen 2.28:1 hell / 2.34:1 dunkel
                  // gegen `--paper`, unter der F2-Schwelle 3:1 für Nicht-Text.
                  // Herleitung ausführlich am Zwilling in `SektionBaumTOC.tsx`.
                  className="inline-flex w-4 shrink-0 justify-center text-micro text-ink-500 hover:text-brass-700">{artOffen ? '▾' : '▸'}</button>}
            {/* Anhang/Protokoll (③/⑤): «Anhang N»/«Protokoll N …» als Struktur-
                Überschrift (font-display, Titel-Grösse) statt als Artikelnummer
                (num/bold) — es ist ein Block-Titel, keine zitierbare Bestimmung. */}
            {/* A31: «Art. N» + Fussnoten-Marker als EIN Inline-/flex-Kind (whitespace-
                nowrap) — der Marker klebt direkt an der Nummer (kein gap-x-2, kein
                Umbruch auf eine eigene Zeile), genau wie auf Fedlex. */}
            <span className="whitespace-nowrap">
            {imTreffer && onSpringe ? (
              <button type="button" onClick={() => onSpringe(e.artikel)}
                title="Im Volltext zu diesem Artikel springen"
                className={istAnhang
                  ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 text-left'
                  : `num text-base font-bold tracking-wide hover:text-brass-700 text-left ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</button>
            ) : (
              <a href={`#art-${e.artikel}`} className={istAnhang
                ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 no-underline'
                : `num text-base font-bold tracking-wide hover:text-brass-700 no-underline ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</a>
            )}{fnMarker}
            </span>
            {/* aufgehoben gedämpft, aber ink-500 (WCAG 4.5:1 hell+dunkel) statt
                ink-400 (3.2–3.6:1) — essentieller Link-Text, kein incidental. */}
            {ganzAufgehoben && <span {...{ [SUCH_META]: '' }} className="text-xs italic text-ink-500">· aufgehoben</span>}
            {artOffen && (
              // W2·19-GLIEDERUNG/S8 (Bau-Spec §4.4): `data-such-meta` — die
              // Aktions-Zeile ist BEDIENUNG, kein Gesetzestext. Ohne die Marke
              // malte die Suche nach «Zitat» oder «Link» in JEDEM Artikel eine
              // Fundstelle, die der datenseitige Zähler zu Recht nicht kennt
              // (gemessen am BGFA: 0 gezählt gegen 39 gemalt) — und weil die
              // Zeile bis zum Hover `opacity-0` trägt, wären es 39 UNSICHTBARE
              // Markierungen. Genau der Fall, für den SUCH_META gebaut wurde
              // (Bug-Check §9 vom 4.8.2026, B1).
              <span {...{ [SUCH_META]: '' }}
                className="ml-auto flex shrink-0 gap-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-500 hover:text-brass-700" aria-label={`Zitat kopieren: ${zitatVoll}`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
                <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-500 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
                {/* EID-2: Outbound zur amtlichen Fassung AN DIESER STELLE (ELI-Form,
                    target/rel wie die bestehenden amtlichen Links, §12.4). Stil =
                    dieselbe dezente Aktions-Stimme wie Zitat/Link daneben (§13). */}
                {amtlich && (
                  <a href={amtlich} target="_blank" rel="noopener noreferrer"
                    className="text-micro text-ink-500 hover:text-brass-700 no-underline whitespace-nowrap"
                    aria-label={`Amtliche Fassung von ${zitat} auf Fedlex öffnen ${NEUER_TAB}`}
                    // Ä110 (18.8.2026): EINE Schreibung für EIN Ziel — der
                    // sichtbare Text folgt dem `aria-label` und dem `title`
                    // darüber, die schon immer «Amtliche Fassung» sagten.
                    title="Amtliche Fassung an genau dieser Stelle (Fedlex)">Amtliche Fassung ↗</a>
                )}
              </span>
            )}
            {/* Amtliche Aufhebungsnotiz (eigene Zeile, dezent eingerückt) — M2: erst
                auf Klick (hinter dem Fussnoten-Schalter), wie jede andere Fussnote.
                Die Statuszeile «· aufgehoben» oben bleibt unabhängig immer sichtbar. */}
            {ganzAufgehoben && aufhebungNotiz.length > 0 && (
              /* S2: `text-leser-fn` wie der Haupt-Apparat am Artikelfuss. Beide tragen
                 `data-fn-apparat`, sind also dieselbe Rolle — bis S2 lief dieser hier
                 auf `text-xs` (12 px) und der andere auf 11 px, zwei Grössen für eine
                 Sache (§5). Der eigene `leading-snug` fällt mit: die Zeilenhöhe kommt
                 aus der Stufe. */
              /* T3 (29.8.2026): dieselbe Feinschrift-Spalte wie der Haupt-Apparat
                 am Artikelfuss — es ist dieselbe Rolle (§5). */
              <span data-fn-apparat className="basis-full pl-6 max-w-kleintext text-leser-fn text-ink-500">
                {aufhebungNotiz.map((fn, i) => (
                  <span key={i}>{i > 0 && '; '}{fnTextMitLinks(fn)}</span>
                ))}
              </span>
            )}
          </div>
          {/* G23 (M8): Delegationsnorm-Grundlage «(Art. N ArG)» — Fedlex zeigt sie
              dezent unter der Überschrift; amtlicher Inhalt (§2), bisher verworfen.
              Immer sichtbar (auch eingeklappt), wie der Randtitel. */}
          {e.grundlage && (
            <div className="mt-0.5 text-xs italic leading-snug text-ink-500">{e.grundlage}</div>
          )}
        </div>
        {/* Rechte Lesespalte: grosse Serifenschrift, hängende Messing-Absatznummern.
            overflow-x-clip + min-w-0: bei geteiltem/schmalem Bildschirm darf der
            Artikel-Block (hängender Absatz-Einzug pl-9/-indent-9) NICHT über die
            Spalte hinausragen → sonst wurde Text rechts abgeschnitten (Befund David
            25.6.2026). Der Wortumbruch im Absatz (overflow-wrap:anywhere) bleibt. */}
        {artOffen && (
        <div className="max-w-normtext min-w-0 overflow-x-clip">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel, fassung: erlass.stand, permalinkBasis: `${basisPfad}#art-${e.artikel}` }}
            fnProAbsatz={fnProAbsatz} fnProItem={fnProItem}
            fnInlineAbsatz={fnInlineAbsatz} fnInlineItem={fnInlineItem}
            fnKlasse={fnKlasse}
            intern={intern}
            /* S2 (Pos. 19, F3 = V2 «amtsnah kompakt», David 17.8.2026 am Bildbogen):
               `text-leser-text` (17 px / lh 1.55) ERSETZT das Paar
               `text-body-l leading-[1.65]`. Der rohe Arbitrary-Override fällt damit
               weg — die Zeilenhöhe gehört zur Stufe (Design-Grundlage Kap. 8 Nr. 4:
               «kein fixer Leading-Wert über alle Grössen»); Wächter
               `src/tests/leser-typo-tokens.test.ts`. WCAG 1.4.8 gemessen @1440:
               lh 1.55 ≥ 1.5 und ≤ 80 ch (Lesemass `max-w-normtext` 42 rem
               unverändert).

               EINE ZAHL, EINE MESSUNG (Nachzug 17.8.2026, Arch-Prüfer 9): hier stand
               «53–58 ch», im Fahrplan «73 / 71 / 61 ch» — zwei Zahlen für dieselbe
               Sache. Massgeblich ist die Methode des Tors (`e2e/leser-lesemass.e2e.ts`:
               längster mehrzeiliger Fliesstext-Absatz, Textlänge / Zeilenkisten).
               Damit @1440 gemessen: ZGB 68 · OR 71 · StPO 73 · VMWG 74 · StGB 77 ch.
               Die 80-ch-Decke der WCAG hält überall; die engere HAUSdecke von 75 ch
               nicht mehr überall (StGB 77) — Notiz an der Schwelle im Tor und als
               offener Punkt im Vollzugsvermerk S2. */
            className="space-y-3.5 font-serif text-leser-text text-ink-800" />
          {/* ═══ BEIWERK-ZONE (S2 · Pos. 13, Fahrplan Kap. 4c / Grundlage Kap. 3) ═══
              EIN benannter Ort für alles, was unter dem Wortlaut steht: Verweis-Chips ·
              Rechtsprechung (ab H3 der leise Zähler «⚖ n Entscheide →») · Fassungs-
              Zeile · Fussnoten-Apparat. Vorher lagen die vier Blöcke unverbunden
              nebeneinander, jeder mit eigenem Abstand und der Historie-Slot mit einer
              EIGENEN Reservierung — es gab keine Zone, die man reservieren, messen oder
              per CSS greifen konnte. `data-beiwerk` ist der Vertrag (ein
              Daten-Attribut, kein Utility-Klassenname — Lehre aus der
              `.text-body-l`-Kopplung der Schriftskala, index.css).

              KEINE eigene Reservierung an der Zone, und das ist gemessen, nicht
              gespart: das einzige spät eintreffende, heute unreservierte Element ist
              die Rechtsprechungs-Zeile, und ihre Reservierung ist bewusst verworfen
              (§15.2 — sie zöge Weissraum in fast jeden Artikel; gemessen 17.8.2026
              @1440 tragen 326/480 Artikel der StPO und 376/1686 des OR eine solche
              Zeile). Die Reservierung sitzt darum weiterhin an dem Element, das der
              Schalter «Änderungsvermerke» mit ausblendet (`[data-hist-slot]`, S1) —
              eine Reservierung, die den Schalter überlebt, wäre die Phantom-Lücke,
              gegen die S1 sie überhaupt an den Slot gehängt hat.

              ABWEICHUNG ZUM ABNAHME-KRITERIUM DER ETAPPE, offengelegt (§7): «Das
              Umschalten aller drei Schalter erzeugt an keinem Artikel einen
              Layout-Sprung» ist mit dem David-Entscheid **A1 vom 5.7.2026** («AUS» =
              verschwinden statt dämpfen) nicht erfüllbar. Gemessen 17.8.2026 @1440
              trägt der Fussnoten-Apparat je Artikel 27–187 px; ihn höhenfest zu
              reservieren hiesse, bei «Fussnoten: aus» ein bis zu 187 px hohes leeres
              Loch stehen zu lassen — genau das Dämpfen, das A1 verboten hat. Eine
              feste Mindesthöhe kann nur Elemente auffangen, die KLEINER als der Boden
              sind. Erfüllt und gemessen ist deshalb die Zusage, die zählt: der
              Lade-Sprung (CLS) bleibt bei 0.004–0.016; das Umschalten ist
              klick-getrieben, liegt binnen 500 ms nach der Eingabe und ist damit per
              Definition kein unerwarteter Sprung. Zahlen im Vollzugsvermerk S2. */}
          <div data-beiwerk>
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David). */}
          {/* S8: Verweis-Chips sind Wegweiser, kein Wortlaut — `data-such-meta`,
              damit die Suche nach «Verweise» oder einer Chip-Beschriftung nicht
              eine Fundstelle malt, die es im Gesetzestext nicht gibt (§4.4). */}
          {verweise.length > 0 && (
            <div {...{ [SUCH_META]: '' }} className="mt-4 flex flex-wrap items-center gap-2">
              <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* LEITFÄLLE (§11.2): Bundesgerichtsentscheide zu genau diesem Artikel, lazy
              aus dem erlass-lokalen Shard. Verdrahtet das bisher tote proNormArtikel-
              Modell (norm-index.ts) sichtbar — vom Artikel direkt zur Rechtsprechung.

              W2·7-BEZUG/B4: der Reader liefert `bezuege` — die nach Instanz
              gruppierte Auflistung aus dem Bezugs-Shard. Sie tritt AN DIE STELLE
              der V1a-Zeile (Obermenge, §5): nie beide, sonst stünden dieselben
              BGE zweimal am Artikel. Ist keine Facette aktiv, ist `bezuege`
              undefined UND `leitfaelle` ungesetzt ⇒ unter dem Artikel steht
              nichts (Vorgabe David 28.7.2026). */}
          {/* S8: die Rechtsprechungs-Zeile am Artikelfuss ist Referenzschicht,
              kein Normtext (§4.4) — sie zählt nicht zu den Fundstellen und
              wird darum auch nicht markiert. */}
          <div {...{ [SUCH_META]: '' }}>
            {bezuege
              ? <BezuegeZeile kanten={bezuege.kanten} gesamt={bezuege.gesamt}
                  zeitAktiv={bezuege.zeitAktiv} kantonAktiv={bezuege.kantonAktiv}
                  normZitat={zitat} revision={revision} />
              : <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />}
          </div>
          {/* G-HIST-UI: «Gilt seit»-Badge + aufklappbare Fassungs-Timeline dieses
              Artikels (aus dem erlass-lokalen Historie-Shard, idle geladen). Am
              Artikel-Fuss wie Verweise/Leitfälle. §15.2: der Slot steht ab dem
              ERSTEN Render und reserviert die eine Chip-Zeile (`min-h-beiwerk`,
              Token — gemessen exakt 24 px, deterministisch über alle Artikel), damit
              der idle-Shard-Resolve reservierten Platz FÜLLT statt sichtbare Artikel
              zu schieben (Messung 20.7.: sonst CLS 0.0227 statt 0.0002 unter 6×). Der
              Aussenabstand sitzt hier am Slot, nicht in der Zeile — sonst fallen
              reservierte und gefüllte Höhe auseinander. */}
          {/* S8: «Gilt seit»-Badge und Fassungs-Timeline sind abgeleitete
              Metadaten, kein Wortlaut (§4.4) — `data-such-meta`.

              S1 (Kap. 4f, Befund K4): der Slot trägt `data-hist-slot`, damit der
              Schalter «Änderungsvermerke» ihn MIT ausblenden kann. Bis S1 hing die
              «Fassung»-Zeile an gar keinem Schalter — bei «Änderungsvermerke aus»
              blieb die Fassungshistorie als einzige Historie-Spur im Lesetext
              stehen. Ausgeblendet wird der SLOT, nicht nur die Zeile darin: sonst
              bliebe seine reservierte Höhe (`mt-4 min-h-beiwerk` = 16+24 px) als
              Phantom-Lücke unter jedem Artikel zurück, und «aus» hätte doch eine
              Spur hinterlassen. Der Inhalt bleibt im DOM (A1-Mechanik, David
              5.7.2026: `display:none`, nie gelöscht) und «an» stellt ihn
              vollständig wieder her.

              S2 · Ä26 (Phantom-Lücke, Ästhetik-Prüfer 17.8.2026): die Reservierung
              stand bisher unter JEDEM Artikel JEDES Erlasses — auch dort, wo nie eine
              Fassungs-Zeile eintreffen kann (auf BS-640.100 sind das 292 von 292).
              Sie folgt jetzt dem Datenmodell, und zwar ARTIKELWEISE.

              DIE FRAGE, die die Reservierung stellen MUSS: «kann in DIESEM Slot je
              eine Fassungs-Zeile eintreffen?» Sie ist am Datenmodell exakt
              beantwortbar, weil der Erzeuger sie selbst so stellt:
              `scripts/normtext/historie-generieren.ts` baut die Shard-Einträge
              AUSSCHLIESSLICH aus den gespeicherten Fussnoten des jeweiligen Artikels
              (`artikel[<token>].fussnoten` → `baueArtikelHistorie`). Ein Artikel ohne
              Fussnote kann darum keinen Eintrag bekommen — das ist eine
              GENERATOR-INVARIANTE, keine Korpus-Zufälligkeit. Empirisch gegengeprüft
              (17.8.2026, alle 209 Shards gegen alle Struktur-Sidecars): 24 511
              Artikel, 13 093 mit Historie-Eintrag, davon **0** ohne Fussnote.

              KEINE EBENEN-WEICHE. Ein früherer S2-Zwischenstand hing die Reserve an
              `erlass.ebene === 'bund'`. Das traf den Korpus von heute (209 Shards,
              alle Bund — der Generator liest nur `struktur/bund`), war aber ein
              ERLASS-SONDERPFAD in einer Komponente, die erlass-neutral rendern soll:
              die Eigenschaft heisst «kann eine Fassungs-Zeile tragen», nicht «ist
              Bundesrecht». Genau diesen Fehler hat S1-B3 an derselben Mechanik schon
              einmal vermieden (`zaehleAenderungsvermerke`, berechnungen.ts: «das
              entscheidet das DATENMODELL, nicht die Herkunft»); wäre `ebene`
              stehengeblieben, hätte der Tag, an dem der Generator Kantonsrecht
              aufnimmt, eine stille Phantom-Lücke erzeugt statt eines Testfehlers.

              WARUM ARTIKELWEISE UND NICHT ERLASSWEISE: die Shard-Existenz (404 vs.
              Treffer) ist erst NACH dem idle-Fetch bekannt — also genau dann, wenn
              die Zeile schon eintrifft. Eine Reserve, die auf diese Antwort wartet,
              käme zu spät und müsste bei 404 wieder einfallen (ein Sprung nach oben,
              den es heute nicht gibt). Die Fussnoten dagegen kommen mit dem
              Struktur-Sidecar, aus dem auch der Apparat direkt darunter rendert
              (`fussAnzeige`, s. u.) — Reserve und Apparat erscheinen im SELBEN Paint,
              der spätere Shard-Resolve füllt nur noch. Die Reserve ist damit
              MONOTON: sie verschwindet nie wieder.

              `historie` steht als zweite Bedingung im ODER, obwohl die Invariante ihn
              überflüssig macht: träfe je ein Eintrag ohne Fussnote ein, bekäme der
              Slot trotzdem seinen Boden. Die Regel kann so nur überreservieren, nie
              einen Sprung durchlassen (§1 — lieber die Prüfung verdoppeln).

              WIRKUNG, gemessen (17.8.2026): korpusweit reservieren 17 547 statt
              25 403 Artikel (−31 %); auf BS-640.100 fallen 278 von 292 Slots weg
              (95 %), auf dem OR 1092 von 1686, auf der StPO 346 von 480.
              REST-ÜBERRESERVIERUNG, benannt statt versteckt: 4454 Artikel tragen
              Fussnoten, aber keinen Eintrag (25 % der reservierenden) — darunter die
              14 Fussnoten-Artikel von BS-640.100, für die es heute gar keinen Shard
              geben kann. Das enger zu ziehen bräuchte ein Shard-Manifest im
              Prerender-Pfad (eigener Schritt, Datenhaltung). VERWORFEN als engere
              Regel: «Artikel trägt eine `kl:'A'`-Fussnote» reserviert nur 13 046,
              verfehlt aber 182 Artikel MIT Eintrag (u. a. ZGB Art. 159, 181, 451) —
              unsound, das wären 182 echte Sprünge.

              Der Token heisst seit S2 `min-h-beiwerk` (Wert unverändert 1.5 rem = die
              gemessenen 24 px der einen Chip-Zeile): er reserviert den Boden der
              Beiwerk-Zone, nicht «eine Historie-Zeile». */}
          <div {...{ [SUCH_META]: '' }} data-hist-slot
            className={fussAnzeige.length > 0 || historie ? 'mt-4 min-h-beiwerk' : undefined}>
            <ArtikelHistorieZeile historie={historie} artikel={e.artikel} />
          </div>
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar). W2·5d G2b:
              der Apparat liegt IMMER im DOM (Ctrl+F/Print/Screenreader, R9/§8);
              der data-fussnoten-CSS-Toggle dämpft ihn bei «AUS» (data-fn-apparat),
              versteckt ihn nie. Marker + Apparat = EINE Bedienung (Options-Leiste). */}
          {fussAnzeige.length > 0 && (
            <div data-fn-apparat className="mt-3 border-t border-rule-artikel pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} data-fn-klasse={fn.kl}
                  /* S2 (V2-Spalte «Fussnoten-Body 0.6875 rem / lh 1.3»): `text-leser-fn`
                     ersetzt `text-xs leading-normal` (12 px / 1.5). Fahrplan Kap. 8
                     nennt als Ist-Zustand `text-micro` 0.6875/1.2 — am Code gemessen
                     war es `text-xs`; die Spalte gilt, der Ist-Vermerk war falsch (§7).

                     T3 (Design-Qualitäts-Pass 29.8.2026): der Apparat lief auf der
                     VOLLEN Lesespalte — gemessen @1440 am OR 640 px Kasten, längster
                     Eintrag 108 ch/Zeile (5.88 px/ch), Einzelzeilen bis 128 ch. Auf
                     11 px ist das keine lesbare Spalte mehr. `max-w-kleintext`
                     (26 rem, Herleitung am Token in `tailwind.config.js`) setzt die
                     Feinschrift auf ihr eigenes Mass; der Trenner darüber bleibt
                     bewusst über die volle Spalte (Linien-Kanon §4b: der
                     Artikel-Trenner trennt die SPALTE, nicht den Textblock). */
                  className="nt-anker max-w-kleintext text-leser-fn text-ink-500 target:bg-brass-100">
                  {/* WCAG-AA (§13): Fussnoten-Nummer ist semantischer Text (kein aria-hidden).
                      LM-153 (W2·17-UI-BEFUNDE-B4): die Marke im Fliesstext (FnRef,
                      ArtikelBody.tsx) ist hochgestellt UND brass-700; der Apparat-Eintrag
                      stand bisher als ink-500-Zahl auf der Grundlinie — andere Auszeichnung,
                      dieselbe Referenz. Baseline/Grösse bleiben (eine Liste aus hochgestellten
                      Mini-Ziffern wäre unlesbar), aber die FARBE wird auf dieselbe brass-700-
                      Familie gehoben — der Leser verbindet Marke↔Eintrag über die Farbe, wie
                      im Fliesstext. brass-700 ist bereits an der Marke selbst AA-geprüft
                      (kleinere Schrift, `--hochgestellt`) und trägt hier bei 11px erst recht
                      (S2: der Apparat läuft auf `text-leser-fn`). */}
                  {fn.nr && <span className="num mr-1 text-brass-700">{fn.nr}</span>}
                  {fnTextMitLinks(fn)}
                </p>
              ))}
            </div>
          )}
          </div>{/* /data-beiwerk */}
        </div>
        )}
      </div>
    </article>
  );
});
