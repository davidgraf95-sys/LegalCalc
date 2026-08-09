import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InternRefs } from '../../components/NormText';
import type { Sektion, StrukturMap } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import {
  setzeSuchHighlight, sammleTrefferRanges, setzeSuchHighlightRanges,
} from './suchHighlight';
import { loeseArtikelEingabe, pfadLabels } from './suchTreffer';
import { baueLeserSuchIndex, sucheImErlass, zaehleTreffer, fundstellenFolge } from './leserSuche';

// ═══ ABSCHNITT · In-Gesetz-Suche: Treffer, Hervorhebung, Quickjump ═══════════
//
// Ursprung: §6.6-Split (QS-TOK/T14) — A35 (Highlight), W2·10-UI-NAV/R1
// (Fundstellen-Zähler + Vor/Zurück) und R2 (Quickjump «Art. N» + «Sie sind
// hier»). Keine Rechtsregel, kein Normtext (§3).
//
// ─── W2·19-GLIEDERUNG/S8 · was sich hier ändert und warum ────────────────────
// Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §4; Entscheid David (c)
// vom 8.8.2026: die Trefferliste zieht mit Textausschnitten in die Seitenleiste,
// die Lesespalte bleibt VOLLSTÄNDIG und springt.
//
// 1 · TREFFER KOMMEN AUS DEN DATEN, nicht mehr aus einer Filterzeile. Bis S8
//     war die Trefferliste `eintraege.filter(passtAufSuche)` — eine Regel, die
//     nur `artikelLabel` und `bloecke[].text`/`items[].text` las. `leserSuche.ts`
//     durchsucht alle sechs Feldklassen und liefert Reihenfolge, Zahlen,
//     Ausschnitte und Herkunft fertig; hier wird nichts nachgerechnet (§5).
//
// 2 · DER TREEWALKER LÄUFT NIE MEHR ÜBER DAS GANZE DOKUMENT (§4.5, Bericht 2).
//     Er sammelte bisher die Ranges der ganzen Trefferliste in einem Zug. Da die
//     Lesespalte jetzt vollständig bleibt, wäre das beim OR ein Lauf über 1686
//     Artikel — je Such-Ruhephase. Stattdessen treibt ein IntersectionObserver:
//     gemalt wird artikelweise, für Artikel im (grosszügig gefassten) Sichtband
//     und für das Sprungziel. Was nie im Blick war, kostet nichts.
//
// 3 · DER ZÄHLER IST DATENSEITIG (§4.4 Ziff. 1). Der alte Vertrag «gemeldete
//     Zahl == DOM-sichtbare Fundstellen» ist mit Feldern, die nie gemalt werden
//     (Gliederungspfad, Bild-Alt) oder per CSS-Toggle unsichtbar sind,
//     strukturell unhaltbar. Neu gilt: der Kopf-Zähler zählt den ERLASS, die
//     Hervorhebung malt den SICHTBAREN DOM, und «gemalte ≤ gezählte» ist
//     konstruktiv wahr — jeder malbare Baustein steht auch im Index
//     (`leserSuche.ts`, `Malbarkeit`). Die Ehrlichkeitslücke wird nicht
//     versteckt, sondern benannt: jeder Nicht-Fliesstext-Treffer trägt einen
//     Herkunfts-Badge, bei ausgeschaltetem Apparat mit dem Zusatz
//     «(ausgeblendet)» (§8) — statt dass der Sprung die Ansicht still umschaltet.

export function useSuchTreffer({
  erlassKey, eintraege, struktur, sucheTrim, sucheFeldLeer, sektionen, aktivIds,
  internRefs, aktArtikel, tokenByLabel,
}: {
  /** Erlass-Schlüssel = Cache-Identität des Index (§4.1: EIN Eintrag je Pane). */
  erlassKey: string | null;
  eintraege: NormSnapshot[] | null;
  struktur: StrukturMap | null;
  sucheTrim: string;
  sucheFeldLeer: boolean;
  sektionen: Sektion[];
  aktivIds: string[];
  internRefs: InternRefs | undefined;
  aktArtikel: string | null;
  tokenByLabel: Map<string, string>;
}) {
  // Wurzel der Lesespalte — der Bereich, in dem Artikel gemalt werden. Bis S8
  // zeigte dieser Ref auf den (gefilterten) Trefferblock; seit die Lesespalte
  // vollständig bleibt, ist es die Lesespalte selbst.
  const leseRef = useRef<HTMLDivElement | null>(null);

  // ─── Ansicht-Schalter beobachten ───────────────────────────────────────────
  // Die Toggles sind BEWUSST reine CSS-/Attribut-Schalter am <html>
  // («KEIN Artikel-Re-Render», leserOptionen.ts) — sie in React-State zu ziehen
  // würde genau diese §15-Zusage aufgeben (der OR-Reader reconciliert sonst
  // 1686 Artikel je Toggle). Ein MutationObserver liest sie darum ab, statt sie
  // zu besitzen. Er treibt zwei Dinge: die Badge-Ehrlichkeit (`fussnotenAus`)
  // und ein Neu-Sammeln der gemalten Ranges (`ansichtTick`), weil sich mit
  // jedem Toggle ändert, was überhaupt malbar ist (RV6, 4.8.2026).
  const [fussnotenAus, setFussnotenAus] = useState(false);
  const [ansichtTick, setAnsichtTick] = useState(0);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const lies = () => setFussnotenAus(document.documentElement.dataset.fussnoten === 'aus');
    lies();
    const beob = new MutationObserver(() => { lies(); setAnsichtTick((n) => n + 1); });
    beob.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-fussnoten', 'data-histansicht', 'data-leitfaelle', 'data-linien', 'data-verweise'],
    });
    return () => beob.disconnect();
  }, []);

  // ─── Index + Treffer (§4.1/§4.2) ───────────────────────────────────────────
  const sucheAktiv = sucheTrim !== '';
  // CACHE-GRENZE (§4.1, [W:jurist]): `useMemo` hält je Pane GENAU EINEN Index.
  // Er entsteht LAZY — erst wenn wirklich gesucht wird, nicht beim Laden des
  // Erlasses — und wird beim Erlasswechsel wie beim Pane-Unmount mit dem Memo
  // freigegeben. Split-View OR+ZGB hält damit höchstens zwei Sätze, nie mehr.
  // Kosten, gemessen (Node, ungedrosselt): OR 1686 Artikel → 15 993 Segmente,
  // Aufbau 3.7 ms, Suche 2.2 ms; ZGB 4.8/1.1 ms. Ein Neuaufbau nach dem
  // Verlassen der Suche ist damit billiger als eine Ref-Buchhaltung, die den
  // Index über den Erlasswechsel hinweg am Leben hielte.
  const index = useMemo(
    () => (sucheAktiv && erlassKey && eintraege ? baueLeserSuchIndex(erlassKey, eintraege, struktur) : null),
    [sucheAktiv, erlassKey, eintraege, struktur],
  );
  const treffer = useMemo(() => sucheImErlass(index, sucheTrim), [index, sucheTrim]);
  const { artikel: artikelAnzahl, fundstellen } = useMemo(() => zaehleTreffer(treffer), [treffer]);
  const folge = useMemo(() => fundstellenFolge(treffer), [treffer]);

  // ─── Artikelweise Hervorhebung, IntersectionObserver-getrieben (§4.5) ──────
  // Die Ranges werden je Artikel gehalten und zur EINEN Highlight-Menge
  // vereinigt. `sammleTrefferRanges` bleibt die einzige Treffer-Semantik des
  // DOM (§5): dieselbe Funktion malt, dieselbe Funktion misst den Sprung.
  const rangesRef = useRef<Map<string, Range[]>>(new Map());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wurzel = leseRef.current;
    rangesRef.current = new Map();
    if (!sucheAktiv || !wurzel || typeof IntersectionObserver === 'undefined') {
      setzeSuchHighlight(null, '');
      return;
    }
    const male = () => {
      const alle: Range[] = [];
      for (const rs of rangesRef.current.values()) alle.push(...rs);
      setzeSuchHighlightRanges(alle);
    };
    const beob = new IntersectionObserver((eintraegeIo) => {
      let geaendert = false;
      for (const e of eintraegeIo) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) {
          rangesRef.current.set(el.id, sammleTrefferRanges(el, sucheTrim));
          geaendert = true;
        } else if (rangesRef.current.delete(el.id)) {
          geaendert = true;
        }
      }
      if (geaendert) male();
    }, {
      // Vorlauf über das Sichtband hinaus: wer scrollt, sieht die Markierung
      // bereits stehen, statt sie einlaufen zu sehen. Rein visuell — es wird
      // kein Knoten erzeugt oder bewegt (CLS 0, §15/2).
      rootMargin: '300px 0px',
    });
    for (const art of wurzel.querySelectorAll('article[id^="art-"]')) beob.observe(art);
    return () => {
      beob.disconnect();
      rangesRef.current = new Map();
      setzeSuchHighlight(null, '');
    };
    // `ansichtTick`: ein Ansicht-Toggle ändert die MALBARKEIT (Fussnoten-Apparat
    // display:none) — die Ranges müssen dann neu entstehen (RV6).
  }, [sucheAktiv, sucheTrim, ansichtTick, eintraege]);

  // ─── ↑↓-Navigation über die Fundstellen (§4.3) ─────────────────────────────
  // Position = 0-basierter Rang in der FLACHEN, datenseitigen Fundstellen-Folge.
  // Der Sprung führt zum Artikel und — wo die Fundstelle malbar ist — zur
  // entsprechenden Stelle darin. Ist sie es nicht (Gliederungspfad, Bild-Alt,
  // ausgeblendeter Apparat), bleibt es beim Artikel; der Badge in der Liste hat
  // vorher gesagt, warum (§8). Nie wird ein Sprung an eine erfundene Stelle
  // behauptet.
  // `begriff` ist der Gültigkeits-Schlüssel des Navigations-Zustands: die
  // Laufnummer eines FRÜHEREN Begriffs wird beim Render verworfen, statt sie in
  // einem Effekt zurückzusetzen (kein Kaskaden-Render, react-hooks/set-state-
  // in-effect). Damit kann nie eine Position zum falschen Begriff stehenbleiben
  // (§8) — dasselbe Muster, mit dem bis S8 die gemessene Fundstellenzahl
  // gültig gehalten wurde.
  const [nav, setNav] = useState<{ begriff: string; pos: number; token: string | null }>(
    { begriff: '', pos: -1, token: null });
  const gueltig = nav.begriff === sucheTrim;
  const trefferPos = gueltig ? nav.pos : -1;
  const aktivToken = gueltig ? nav.token : null;

  // Puls am Ziel-Artikel: Element UND Timer-Handle zusammen halten (Bug-Check §9
  // vom 4.8.2026, B6a). Beim Unmount wird der Timer abbestellt, sonst liefe der
  // Callback nach dem Erlass-/Pane-Wechsel gegen ein abgehängtes Element. Das
  // Element muss mitgeführt werden, weil ein schneller Folge-Klick den alten
  // Timer verwirft — ohne diese Referenz bliebe die Puls-Klasse am vorherigen
  // Artikel für immer stehen.
  const blink = useRef<{ el: HTMLElement; id: number } | null>(null);
  const blinkAus = useCallback(() => {
    const b = blink.current;
    if (!b) return;
    window.clearTimeout(b.id);
    b.el.classList.remove('lc-ziel-blink');
    blink.current = null;
  }, []);
  useEffect(() => blinkAus, [blinkAus]);

  /** Scrollt zur n-ten Fundstelle der Folge und markiert ihren Artikel. */
  const zeigeFundstelle = useCallback((n: number) => {
    const eintrag = folge[n];
    if (!eintrag || typeof window === 'undefined') return;
    const wurzel = leseRef.current;
    const id = `art-${eintrag.token}`;
    // CSS.escape: ein Artikel-Token mit Sonderzeichen (belegt: «22 a», «36–42»)
    // darf den Selektor nicht sprengen — dieselbe Vorsicht wie `findeArt`.
    const art = (wurzel ?? document).querySelector<HTMLElement>(
      `#${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id}`);
    if (!art) return;
    setNav({ begriff: sucheTrim, pos: n, token: eintrag.token });
    // Frisch sammeln (nicht aus `rangesRef` recyceln): Ranges hängen an
    // konkreten Text-Knoten, und zwischen zwei Klicks kann der Reader Teilbäume
    // neu gerendert haben (Bezugs-/Historie-Shard läuft nach). Der Lauf kostet
    // genau EINEN Artikel.
    //
    // `ranges[rang]` ist die Zuordnung datenseitige Fundstelle → gemalte
    // Stelle. Sie geht auf, solange alle Fundstellen des Artikels malbar sind
    // (der Regelfall: Wortlaut-Treffer) — die Segment-Reihenfolge des Index
    // folgt bewusst der Dokument-Reihenfolge. Ist die Fundstelle NICHT malbar
    // (Gliederungspfad, Bild-Alt, ausgeblendeter Apparat), gibt es keinen
    // Range: dann bleibt es beim Artikel, statt eine Stelle zu behaupten (§8).
    const ranges = sammleTrefferRanges(art, sucheTrim);
    const start = ranges[eintrag.rang]?.startContainer;
    const el = (start
      ? (start.nodeType === 1 ? start as Element : start.parentElement) as HTMLElement | null
      : art);
    el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    blinkAus();
    art.classList.add('lc-ziel-blink');
    blink.current = { el: art, id: window.setTimeout(() => blinkAus(), 2400) };
  }, [blinkAus, folge, sucheTrim]);

  const springeZuFundstelle = useCallback((delta: number) => {
    const len = folge.length;
    if (len === 0) return;
    // Noch keine aktive Fundstelle: «weiter» beginnt bei der ersten, «zurück»
    // bei der letzten (Basis 0 bzw. -1, dann modulo).
    const basis = trefferPos < 0 ? (delta > 0 ? -1 : 0) : trefferPos;
    zeigeFundstelle(((basis + delta) % len + len) % len);
  }, [folge, trefferPos, zeigeFundstelle]);

  /** Klick auf einen Treffer-Eintrag: zur ERSTEN Fundstelle dieses Artikels. */
  const springeZuTreffer = useCallback((token: string) => {
    const n = folge.findIndex((f) => f.token === token);
    if (n >= 0) zeigeFundstelle(n);
  }, [folge, zeigeFundstelle]);

  // ═══ ABSCHNITT · R2 · Quickjump «Art. N» + «Sie sind hier» ═══════════════════
  // Quickjump: KEIN Index, KEIN Server — die Eingabe wird gegen die bereits
  // geladene Token-Map des Erlasses aufgelöst (dieselbe, die Querverweise im
  // Wortlaut auflöst, §5). Kein Treffer ⇒ null, und das Feld sagt es (§8).
  const loeseArtikel = useCallback(
    (eingabe: string) => (internRefs ? loeseArtikelEingabe(eingabe, internRefs.tokenMap) : null),
    [internRefs],
  );
  // «Sie sind hier»: reine Projektion des SCHON vorhandenen Scroll-Spy-Zustands
  // (aktivIds) auf die Gliederungs-Labels — keine zusätzliche Beobachtung (§15).
  const siePfad = useMemo(() => pfadLabels(sektionen, aktivIds), [sektionen, aktivIds]);
  // Fremdfund-Fix aus dem §9-Bug-Check (B5, echter main-Defekt seit #429): hier
  // wurde ein LABEL in der TOKEN-Map nachgeschlagen (`artLabelByToken` ist
  // token→label, `inhalt-hooks.tsx` setzt in `aktArtikel` aber bereits das
  // fertige Label). Der Lookup ging darum IMMER ins Leere, `siePfadArtikel` war
  // dauerhaft null und die Artikel-Angabe in «Sie sind hier» fehlte still — der
  // Gliederungspfad allein füllte die Zeile, also fiel es nicht auf.
  // `aktArtikel` IST das Anzeige-Label; die Umkehrkarte dient nur noch als
  // Echtheitsprüfung: benannt wird ausschliesslich ein Label, das auf einen
  // realen Artikel dieses Erlasses auflöst (§8).
  const siePfadArtikel = aktArtikel && tokenByLabel.has(aktArtikel) ? aktArtikel : null;

  // A35-Sofort-Aufräumer (Befund 20.7.2026, Shard 3/3). Das Löschen der
  // Highlight-Registry hing ursprünglich AUSSCHLIESSLICH am Effekt oben — und
  // der läuft erst, wenn `sucheTrim` über den ENTPRELLTEN Wert kippt. Bis S8 war
  // genau dieser Commit der teuerste des Readers (der volle Volltext-Baum kam
  // zurück: OR 1686 Artikel neu gemountet), gemessen ~2,4 s ohne Drossel bis
  // 21,9 s bei 8× — und der Nutzer sah die Markierung sekundenlang
  // weiterleuchten, obwohl das Suchfeld leer war (§8: die Anzeige lügt über den
  // Zustand). Seit S8 fällt dieser Remount weg (die Lesespalte bleibt stehen),
  // die Entprellung bleibt aber: das Aufräumen hängt darum weiterhin am ROHEN
  // Feldwert, nicht am entprellten — es ist der billige und sofort wirksame
  // Pfad, und er deckt JEDEN Ausstieg aus dem Suchmodus ab (Feld leeren,
  // Erlass-/Pane-Wechsel). Der Effekt oben bleibt der einzige SETZENDE Pfad.
  useEffect(() => {
    if (typeof window === 'undefined' || !sucheFeldLeer) return;
    setzeSuchHighlight(null, '');
  }, [sucheFeldLeer]);

  return {
    leseRef, treffer, artikelAnzahl, fundstellen, fussnotenAus,
    trefferPos, aktivToken, springeZuFundstelle, springeZuTreffer,
    loeseArtikel, siePfad, siePfadArtikel,
  };
}
