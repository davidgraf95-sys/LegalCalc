import { useMemo } from 'react';
import { labelMitBereich, randtitelKnoten } from '../../lib/normtext/darstellung';
import type { Sektion, StrukturMap } from '../../lib/normtext/browse';
import type { BrowseErlass, BrowseManifest } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { berechneSekPos, berechneSektionMeta } from './berechnungen';
import { passtAufSuche } from './helpers';

// ═══ ABSCHNITT · Abgeleitete Reader-Werte (§6.6-Split, QS-TOK/T14) ═══════════
// Reine useMemo-Ableitungen aus GesetzLeserInhalt — keine Effekte, kein Zustand,
// keine Rechtsregel (§3). VERHALTENSNEUTRAL: identische Rechenkerne, identische
// Dependency-Listen, identische Reihenfolge innerhalb jedes Hooks; die Hooks
// werden an EXAKT der Position gerufen, an der die Memos vorher inline standen.
//
// NICHT hier: der Gliederungsbaum (`baueGliederungsbaum`), das Linien-Profil
// (`linienProfil`) und `fussnotenAnzahl` bleiben in `inhalt.tsx` — `check:linien-
// kanon` (Teil B0) liest den `linienProfil(`-Aufruf im Quelltext von `inhalt.tsx`
// und würde den Aufbau-Default sonst als abgeklemmt melden.

// ─── Artikel-bezogene Ableitungen (Positionen, Bereichslabel, Randtitel) ─────
export function useArtikelAbleitungen({ sektionen, eintraege, struktur }: {
  sektionen: Sektion[];
  eintraege: NormSnapshot[] | null;
  struktur: StrukturMap | null;
}) {
  // Dokument-Position (Index des ersten enthaltenen Artikels) je Sektion — EINMAL
  // bottom-up berechnet, damit renderSektion die Kinder + direkten Artikel eines
  // Knotens in Dokument-Reihenfolge mischen kann, ohne pro Scroll-Render erneut den
  // Teilbaum zu durchlaufen (6b: Knoten tragen seit der Randtitel-Promotion oft
  // beides). Reine Darstellung (§3).
  const sekPos = useMemo(() => berechneSekPos(sektionen, eintraege), [sektionen, eintraege]);

  // Dokument-Position je Artikel-Token (für den Artikel-Bereich «Art. 1–10» in den
  // Sektionsüberschriften).
  const artIndex = useMemo(() => {
    const map = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => map.set(e.artikel, i));
    return map;
  }, [eintraege]);

  // Rank 4 (QS-PERF, §6.4): Sektions-Bereichslabel («Art. 1–10») + Artikelzahl
  // EINMAL bottom-up vorberechnen — statt 2× O(Subtree) je Sektion je Scroll-Render
  // (bisher rief renderSektion sekBereich(s) UND sammleArtikel(s).length je Knoten,
  // jeweils den Teilbaum sammelnd). Deps [sektionen, artIndex] → nur bei echtem
  // Gliederungs-/Index-Wechsel neu. Die Label-Logik ist byte-identisch zur früheren
  // sekBereich/sammleArtikel (golden/struktur-konsistenz grün). Reine Darstellung (§3).
  const sektionMeta = useMemo(() => berechneSektionMeta(sektionen, artIndex), [sektionen, artIndex]);

  // M13: Token → korrektes Anzeige-Label («Art. 3», «Art. 31–32») für den
  // Scroll-Spy-/Reiter-Kopf. Schlusstitel-Token («disp_u1_art_3») lassen sich
  // NICHT heuristisch aus dem Token ableiten — hier den echten artikelLabel des
  // Eintrags nehmen (Haupttext byte-gleich: dort ist es ohnehin «Art. <token>»).
  const artLabelByToken = useMemo(() => {
    const map = new Map<string, string>();
    (eintraege ?? []).forEach((e) => map.set(e.artikel, labelMitBereich(e.artikelLabel, e.artikel)));
    return map;
  }, [eintraege]);

  // Ueberschrift je Artikel im FLIESSTEXT: nur noch die artikel-EIGENE
  // Sachueberschrift (das Randtitel-Blatt). Die uebergeordneten, von mehreren
  // Artikeln geteilten Randtitel-Gruppierungen (A. ... -> II. ...) sind seit 6b
  // eigene, einklappbare Gliederungs-Knoten (baueGliederungsbaum) und erscheinen
  // als Sektions-Ueberschriften -- sie hier zusaetzlich je Artikel zu wiederholen,
  // waere die vom Auftrag gewarnte Doppel-Darstellung. Hat der Artikel keine eigene
  // Sachueberschrift (blatt = null, z. B. aufgehoben), faellt ArtikelLeser auf
  // e.titel zurueck. Form wie die Such-/Volltextsicht erwartet ({ teile, ab }); das
  // Blatt wird ueber margStufeStil(_, istBlatt=true) prominent gesetzt. Reine
  // Darstellung (Sektions-Knoten zur Laufzeit abgeleitet, Sidecars unberuehrt).
  const margAnzeige = useMemo(() => {
    const map = new Map<string, { teile: string[]; ab: number }>();
    for (const e of eintraege ?? []) {
      const { blatt } = randtitelKnoten(struktur?.[e.artikel]?.marginalie ?? []);
      map.set(e.artikel, { teile: blatt ? [blatt] : [], ab: 0 });
    }
    return map;
  }, [eintraege, struktur]);

  return { sekPos, artIndex, sektionMeta, artLabelByToken, margAnzeige };
}

// ─── R4 «Weiterlesen» + R8 Tastatur: «welcher Artikel ist gerade dran» ───────
export function useArtikelTokens({ artLabelByToken, eintraege, aktArtikel }: {
  artLabelByToken: Map<string, string>;
  eintraege: NormSnapshot[] | null;
  aktArtikel: string | null;
}) {
  // Beide brauchen dasselbe: «welcher Artikel ist gerade dran» als TOKEN. Der
  // Scroll-Spy meldet den aktiven Artikel als LABEL (`aktArtikel`, entprellt) —
  // das ist die Form, die Kopf und Reiter zeigen. Statt einen zweiten Beobachter
  // aufzusetzen (ein zweites «wo bin ich» wäre genau die zweite Wahrheit, die §5
  // verbietet — und ein zweiter Scroll-Listener, den §15 nicht hergibt), wird die
  // vorhandene Token→Label-Karte einmal umgedreht. Sie ist injektiv genug: die
  // Labels stammen aus `labelMitBereich(artikelLabel, token)` und sind je Erlass
  // eindeutig; bei einer Kollision gewinnt das erste Vorkommen in Dokument-
  // Reihenfolge, und ein nicht auflösbares Label liefert schlicht null (dann wird
  // nichts gemerkt und j/k starten am Anfang — nie ein geratener Artikel, §8).
  const tokenByLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const [tok, lab] of artLabelByToken) if (!m.has(lab)) m.set(lab, tok);
    return m;
  }, [artLabelByToken]);
  const aktivToken = aktArtikel ? tokenByLabel.get(aktArtikel) ?? null : null;
  // R8: Artikel-Tokens in Dokument-Reihenfolge — die Liste, auf der j/k einen
  // Schritt gehen. Aus `eintraege` (der Snapshot-Reihenfolge), nicht aus dem DOM:
  // unter `content-visibility:auto` ist die DOM-Abfrage von der Renderreihenfolge
  // abhängig, die Snapshot-Reihenfolge ist die des Gesetzes.
  const artTokens = useMemo(() => (eintraege ?? []).map((e) => e.artikel), [eintraege]);

  return { tokenByLabel, aktivToken, artTokens };
}

// ─── In-Gesetz-Trefferliste + Nachbar-Erlasse des Manifests ──────────────────
export function useTrefferUndNachbarn({ eintraege, sucheTrim, manifest, erlass }: {
  eintraege: NormSnapshot[] | null;
  sucheTrim: string;
  manifest: BrowseManifest | null;
  erlass: BrowseErlass | null;
}) {
  const treffer = useMemo(
    () => (eintraege && sucheTrim ? eintraege.filter((e) => passtAufSuche(e, sucheTrim)) : null),
    [eintraege, sucheTrim],
  );

  const { vorher, nachher } = useMemo(() => {
    if (!manifest || !erlass) return { vorher: null as BrowseErlass | null, nachher: null as BrowseErlass | null };
    const g = manifest.erlasse.filter((e) => e.ebene === erlass.ebene && e.status === 'snapshot');
    const i = g.findIndex((e) => e.key === erlass.key);
    return { vorher: i > 0 ? g[i - 1] : null, nachher: i >= 0 && i < g.length - 1 ? g[i + 1] : null };
  }, [manifest, erlass]);

  return { treffer, vorher, nachher };
}
