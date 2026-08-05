import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InternRefs } from '../../components/NormText';
import type { Sektion } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import {
  setzeSuchHighlight, sammleTrefferRanges, setzeSuchHighlightRanges, trefferProArtikel,
} from './suchHighlight';
import { loeseArtikelEingabe, pfadLabels } from './suchTreffer';

// ═══ ABSCHNITT · Such-Hervorhebung, Fundstellen-Navigation, Quickjump ════════
// (§6.6-Split, QS-TOK/T14) — aus GesetzLeserInhalt ausgelagert: A35 (Highlight),
// W2·10-UI-NAV/R1 (Fundstellen-Zähler + Vor/Zurück) und R2 (Quickjump «Art. N» +
// «Sie sind hier»). VERHALTENSNEUTRAL: Effekt-/Callback-Rümpfe und Dependency-
// Listen byte-identisch, Hook-Reihenfolge erhalten (ein kontiguer Block, an
// derselben Position gerufen). Keine Rechtsregel, kein Normtext (§3).

export function useSuchTreffer({ treffer, sucheTrim, sucheFeldLeer, sektionen, aktivIds, internRefs, aktArtikel, tokenByLabel }: {
  treffer: NormSnapshot[] | null;
  sucheTrim: string;
  sucheFeldLeer: boolean;
  sektionen: Sektion[];
  aktivIds: string[];
  internRefs: InternRefs | undefined;
  aktArtikel: string | null;
  tokenByLabel: Map<string, string>;
}) {
  // A35 (David 16.7.2026): Suchtreffer im Text markieren. Wenn die Trefferliste
  // steht, den Suchbegriff als reine Paint-Schicht (CSS Custom Highlight API,
  // suchHighlight.ts) über die gerenderten Artikel legen — keine DOM-Mutation,
  // kein Reflow (CLS 0), keine Berührung von Autolinks/Fussnoten/Zitat-Marken.
  // rAF: erst NACH dem Treffer-Render (Artikel im DOM); Cleanup löscht die
  // Highlight-Menge (Suche verlassen / Erlass wechseln). Ausser-Bestand-neutral,
  // da `treffer===null` (kein Suchmodus) sofort löscht.
  const trefferRef = useRef<HTMLDivElement | null>(null);
  // Handle auf den noch nicht gefeuerten Setz-rAF, damit ihn AUCH der Sofort-
  // Aufräumer unten abbestellen kann (React Compiler ist AUS, §15/4 → Ref).
  const highlightRaf = useRef<number | null>(null);
  // W2·10-UI-NAV/R1: gemessene Fundstellen — GESAMT (Zähler in der Treffer-
  // Leiste) und JE ARTIKEL (Zeile über dem Artikel). Beide kommen aus DERSELBEN
  // Range-Menge, die auch die Hervorhebung malt (§5) — sonst zeigte der Zähler
  // eine andere Zahl, als der Text Stellen leuchtet (§8). `null` = noch nicht
  // gemessen; die Anzeige lässt den Platz reserviert und schreibt nichts
  // Erfundenes hin (§15/2 CLS 0, §8).
  // `begriff` ist der Gültigkeits-Schlüssel: die Messung eines FRÜHEREN Begriffs
  // wird beim Render verworfen, statt sie im Effekt-Rumpf auf null zu setzen
  // (kein Kaskaden-Render) — und es kann nie eine Zahl zum falschen Begriff
  // stehenbleiben (§8).
  const [fundstellen, setFundstellen] = useState<{ begriff: string; gesamt: number; proArtikel: Map<string, number> } | null>(null);
  // Aktive Fundstelle der Vor/Zurück-Navigation (0-basiert; -1 = noch keine).
  // Ref + State: der Ref trägt den Wert für den nächsten Klick (ohne Closure-
  // Neuaufbau), der State treibt allein die Anzeige.
  const [trefferPos, setTrefferPos] = useState(-1);
  const trefferPosRef = useRef(-1);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!treffer) { setzeSuchHighlight(null, ''); return; }
    // EIN TreeWalker-Lauf für Malen + Zählen (§15/3: die Suche ist entprellt,
    // also läuft er einmal je Such-Ruhephase, nicht je Tastendruck).
    const messe = () => {
      const ranges = sammleTrefferRanges(trefferRef.current, sucheTrim);
      setzeSuchHighlightRanges(ranges);
      setFundstellen({ begriff: sucheTrim, gesamt: ranges.length, proArtikel: trefferProArtikel(ranges) });
      // Die Menge ist neu — eine alte Laufnummer zeigte sonst auf eine andere Stelle.
      trefferPosRef.current = -1;
      setTrefferPos(-1);
    };
    const planen = () => {
      if (highlightRaf.current !== null) window.cancelAnimationFrame(highlightRaf.current);
      highlightRaf.current = window.requestAnimationFrame(messe);
    };
    planen();
    // Re-Verifikation §9 vom 4.8.2026 (RV6): Schaltet der Nutzer die Ansicht
    // WÄHREND laufender Suche um (Fussnoten an/aus, Hist-Ansicht, …), ändert
    // sich, was überhaupt malbar ist — die gemeldete Zahl überzeichnete bis zum
    // nächsten Begriffs-Wechsel (gemeldet 111, anspringbar 80, Anzeige «80/111»).
    // Die Toggles sind BEWUSST reine CSS-/Attribut-Schalter am <html>
    // («KEIN Artikel-Re-Render», leserOptionen.ts) — sie in React-State zu
    // ziehen, würde genau diese §15-Zusage aufgeben (der OR-Reader reconciliert
    // sonst 1686 Artikel je Toggle). Darum hier ein MutationObserver, der NUR im
    // Suchmodus lebt und nur die Ansicht-Attribute beobachtet: er misst die EINE
    // Range-Menge neu, sobald sich die Malbarkeit ändert. Der Beobachter kostet
    // ausserhalb der Suche nichts (der Effekt steigt bei `!treffer` vorher aus),
    // und im Suchmodus steht nur die kurze Trefferliste im Walker-Bereich.
    const beob = new MutationObserver(planen);
    beob.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-fussnoten', 'data-histansicht', 'data-leitfaelle', 'data-linien', 'data-verweise'],
    });
    return () => {
      beob.disconnect();
      if (highlightRaf.current !== null) window.cancelAnimationFrame(highlightRaf.current);
      highlightRaf.current = null;
      setzeSuchHighlight(null, '');
    };
  }, [treffer, sucheTrim]);

  // R1 · Vor/Zurück-Sprungtasten zwischen den Fundstellen. Die Range-Menge wird
  // bei JEDEM Sprung frisch gesammelt (nicht aus einem Ref recycelt): Ranges sind
  // an konkrete Text-Knoten gebunden, und zwischen zwei Klicks kann der Reader
  // Teilbäume neu gerendert haben (Bezugs-/Historie-Shard läuft nach). Frisch
  // sammeln ist deterministisch und kostet nur die (kurze) Trefferliste.
  // Reines Scrollen + eine 2,4-s-Puls-Klasse am Ziel-Artikel — KEINE DOM-Mutation
  // am Wortlaut, kein Reflow (CLS 0, §15/2).
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
  const springeZuFundstelle = useCallback((delta: number) => {
    if (typeof window === 'undefined') return;
    const ranges = sammleTrefferRanges(trefferRef.current, sucheTrim);
    if (ranges.length === 0) return;
    const jetzt = trefferPosRef.current;
    // Noch keine aktive Fundstelle: «weiter» beginnt bei der ersten, «zurück»
    // bei der letzten (Basis 0 bzw. -1, dann modulo).
    const basis = jetzt < 0 ? (delta > 0 ? -1 : 0) : jetzt;
    const n = ((basis + delta) % ranges.length + ranges.length) % ranges.length;
    trefferPosRef.current = n;
    setTrefferPos(n);
    const start = ranges[n].startContainer;
    const el = (start.nodeType === 1 ? start as Element : start.parentElement) as HTMLElement | null;
    el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    const art = el?.closest('article[id^="art-"]') as HTMLElement | null;
    blinkAus();
    if (art) {
      art.classList.add('lc-ziel-blink');
      blink.current = { el: art, id: window.setTimeout(() => blinkAus(), 2400) };
    }
  }, [sucheTrim, blinkAus]);

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

  // A35-Sofort-Aufräumer (Befund 20.7.2026, Shard 3/3). Das Löschen der Highlight-
  // Registry hing bisher AUSSCHLIESSLICH am Effekt oben — und der läuft erst, wenn
  // `treffer` über den ENTPRELLTEN `sucheTrim` auf null kippt. Genau dieser Commit
  // ist der teuerste des Readers: die Trefferliste weicht dem vollständigen
  // Volltext-Baum (OR: 1686 Artikel-Knoten neu gemountet). Gemessen von der Leerung
  // des Feldes bis zum `CSS.highlights.delete`: ~2,4 s ohne Drossel, 9,8 s bei 4×,
  // 21,9 s bei 8× CPU-Drossel — auf dem 2-vCPU-Runner reisst das reihum das
  // 15-s-Prüfbudget des A35-Specs, und der Nutzer sieht die Markierung sekundenlang
  // weiterleuchten, obwohl das Suchfeld leer ist (§8: die Anzeige lügt über den
  // Zustand). Latenz-Kopplung, KEIN Leck: der Eintrag verschwand am Ende immer.
  //
  // Darum das Aufräumen vom teuren Commit ENTKOPPELN: es hängt am ROHEN Feldwert,
  // nicht am entprellten. Der Render, der `suche` leert, ist billig (die memoisierten
  // ArtikelLeser der noch stehenden Trefferliste steigen aus der Reconciliation aus),
  // also feuert dieser Effekt im nächsten Frame. Nur der boolesche Kipp-Punkt ist
  // Dependency — beim Tippen läuft KEIN zusätzlicher TreeWalker (§15/3, kein
  // Setz-Pfad hier). Wirkt für JEDEN Ausstieg aus dem Suchmodus (Feld leeren,
  // `springeZuArtikel`, Erlass-/Pane-Wechsel), unabhängig davon, welche Teilbäume
  // neu rendern. Der Effekt oben bleibt unverändert der einzige SETZENDE Pfad.
  // (T14: der Kommentar stand zuvor mehrere Blöcke über seinem Effekt — beim
  // §6.6-Split an ihn herangerückt, reine Kommentar-Umstellung.)
  useEffect(() => {
    if (typeof window === 'undefined' || !sucheFeldLeer) return;
    if (highlightRaf.current !== null) {
      window.cancelAnimationFrame(highlightRaf.current);
      highlightRaf.current = null;
    }
    setzeSuchHighlight(null, '');
  }, [sucheFeldLeer]);

  return { trefferRef, fundstellen, trefferPos, springeZuFundstelle, loeseArtikel, siePfad, siePfadArtikel };
}
