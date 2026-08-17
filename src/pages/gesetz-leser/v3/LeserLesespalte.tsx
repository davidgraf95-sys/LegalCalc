import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Sektion } from '../../../lib/normtext/browse';
import { verifizierLinkSektion } from '../../../lib/normtext/verifikationslink';
import { ArtikelLeser, SektionKopf } from '../parts';
import { istAnhangToken } from '../berechnungen';
import { erlassPfad } from './erlassAnsicht';
import type { LeserV3Modell } from './leserV3Modell';

// ─── Die Lesespalte (FAHRPLAN-LESER-V3 Kap. 1.3 «Kern-Grenze») ──────────────
//
// HIER STEHT DER TEIL, DER SICH NICHT ÄNDERN DARF. Markup, Klassen und
// Reihenfolge sind byte-gleich aus der Ist-Hülle übernommen
// (`inhalt-volltext.tsx` / `inhalt.tsx`) — die `#lc-lesespalte`-Identität, das
// Lesemass `max-w-normtext mx-auto` (A37), die Einzug-Skala, die
// `data-normtext-linie`-Marke und die Sortierung von Kindern und direkten
// Artikeln nach Dokumentposition (6b/T8).
//
// Der Grund ist keine Vorsicht, sondern ein Tor: der Pixelvergleich PX (Kap. 7)
// misst genau diese Region gegen V1. **Wer hier eine Klasse „aufräumt", bricht
// die Treue-Grenze**, und zwar auf eine Weise, die DOM-Tests durchlassen
// (Abstände, Einzüge, Zeilenumbrüche). Die Typografie des Normtexts ist Etappe
// **S2** und wird dort einmalig und deklariert neu gesetzt — nicht hier.
//
// Eigene Datei, weil der Rahmen sonst Layout UND Lesekörper trüge: zwei
// Verantwortungen, von denen genau eine eingefroren ist. So sieht man der
// Dateiliste an, welche das ist.

export function LeserLesespalte({ m, trefferListe, beiwerkSlot }: {
  m: LeserV3Modell;
  /** Trefferliste für den Rand-Fall ohne Leiste (sonst steht sie dort). */
  trefferListe?: ReactNode;
  /** S2 — Beiwerk-Zone am Fuss des Lesetexts (Fassung · Entscheid-Zähler ·
   *  Fussnoten), Pos. 13. Der Rahmen reicht sie durch; in H1 ist sie NICHT
   *  gesetzt und rendert dann gar kein Element — kein leerer Kasten, kein CLS
   *  (§15), und der Pixelvergleich PX bleibt byte-gleich. Der Slot steht hier
   *  statt nur im Rahmen-Interface, damit S2 einen echten Anschluss vorfindet
   *  und nicht erst die Naht bauen muss (Architektur-Review A2, 16.8.2026). */
  beiwerkSlot?: ReactNode;
}) {
  const { erlass, eintraege, struktur, sektionen, ohneGliederung, basisPfad, vorher, nachher } = m;
  // Refs einzeln herausgezogen: die Lint-Regel `react-hooks/refs` erkennt einen
  // Ref am Namen, und `refs.leseRef` ist für sie ein Member-Zugriff im Render.
  const { leseRef, sekRef } = m.refs;
  if (!erlass || !eintraege) return null;

  const fn = (tok: string) => struktur?.[tok]?.fussnoten;
  const istOffen = (id: string, defOpen: boolean) => m.offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) =>
    m.setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRef.current.set(id, el); else sekRef.current.delete(id);
  };

  // ── H3 · POS. 12 · KEIN `bezuege` MEHR AM ARTIKEL ─────────────────────────
  // Bis H2 stand hier `bezuege={m.bezuegeFuer(e.artikel)}` und der Kern rendete
  // darunter die `BezuegeZeile` — je Instanz eine waagrecht scrollbare Chip-Linie
  // (277 Z.). Genau die ist Pos. 12 («12 Entscheide im Fliesstext»): sie verlässt
  // den Lesekörper. In V3 stehen die Entscheide im Panel (Kap. 4d).
  //
  // DER PROP-VERTRAG DES KERNS GENÜGT — KEINE KERN-ÄNDERUNG. `ArtikelLeser`
  // rendert bei ungesetztem `bezuege` die `LeitfallZeile`, und die kehrt ohne
  // `leitfaelle` mit `null` zurück: unter dem Artikel steht nichts. Die Prop
  // WEGZULASSEN ist damit der ganze Umbau. `revision` und `historie` bleiben —
  // sie sind Fassungs-Auskunft, nicht Rechtsprechung.
  //
  // UND KEIN ZÄHLER HIER (Entscheid H3, im Vollzugsvermerk begründet): ein
  // Zähler je Artikel bräuchte die Trefferzahl beim ersten Paint. Die kommt aus
  // dem Bezugs-Shard, und der wird seit H3 erst beim Öffnen des Panels geladen —
  // die Zahl erschiene also erst nach dem Öffnen, und zwar an JEDEM Artikel
  // gleichzeitig. Das wäre ein Layout-Sprung über das ganze Dokument, ausgelöst
  // vom Öffnen des Panels: exakt das, was `leser-v3-kontext-cls` verbietet. Der
  // Zähler je Artikel gehört in die höhenfeste Beiwerk-Zone von **S2** — dort ist
  // der Platz reserviert, bevor die Zahl kommt.
  const artikel = (e: (typeof eintraege)[number]) => (
    <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)}
      intern={m.internRefs} marg={m.margAnzeige.get(e.artikel)?.teile} margBasis={m.margAnzeige.get(e.artikel)?.ab}
      revision={m.revisionFuer(e.artikel)} historie={m.historieFuer(e.artikel)}
      istAnhang={istAnhangToken(e.artikel)} />
  );

  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number, randTiefe = 0): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    const kinderRandTiefe = s.randtitel ? randTiefe + 1 : 0;
    // Kinder UND direkte Artikel in EINER nach Dokumentposition sortierten
    // Liste: ein Knoten kann seit 6b beides tragen.
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: m.sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1, kinderRandTiefe) })),
          ...s.artikel.map((e) => ({ pos: m.artIndex.get(e.artikel) ?? 0, el: artikel(e) })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    // Einzug-Skala V2·L-1: Tiefe 1–5 je eine Stufe (20 px), mobil ~0.75rem —
    // die Verschachtelung flüstert auch @390 weiter. CLS 0, weil padding.
    const eingerueckt = tiefe > 0 && tiefe <= 5;
    return (
      <section key={s.id} data-normtext-linie className={`space-y-3 ${eingerueckt ? 'pl-einzug-mobil sm:pl-einzug' : ''}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)}
          bereich={m.sektionMeta.get(s.id)?.bereich} bereichEinzel={m.sektionMeta.get(s.id)?.einzel ?? false}
          amtlichUrl={verifizierLinkSektion(erlass, s.eId) ?? undefined}
          randTiefe={randTiefe} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
      </section>
    );
  };

  return (
    // ── Ä2 · SATZSPIEGEL V3 = 40 rem (Entscheid 16.8.2026, Design-Grundlage
    // Kap. 3) ──────────────────────────────────────────────────────────────
    // Bis hierher stand `max-w-normtext` (42 rem), byte-gleich aus der
    // Ist-Hülle. Gemessen blieben davon in V3 aber nur 556–616 px @1280 übrig,
    // weil die 18-rem-Seitenleiste vorher Breite nimmt: der Lesetext war
    // schmaler als sein eigenes Mass und schwankte mit dem Klapp-Zustand.
    // `max-w-reading` (40 rem) ist ein BESTEHENDES Haus-Token, kein Ad-hoc-Wert.
    //
    // DEKLARIERTE ÄNDERUNG AN DER PX-REGION: der Textkörper wird schmaler, die
    // V3-Baseline ist einmalig neu gesetzt. Zulässig, weil PX seit dem
    // Entscheid vom 16.8. bei GLEICHER Artikelbreite misst
    // (`e2e/px-textkoerper.e2e.ts`) — es beweist den Text-KERN, nicht den
    // Satzspiegel. Ohne diese Trennung risse jede Layout-Entscheidung das
    // Treue-Tor mit, und genau daran wäre es unbrauchbar geworden.
    <div ref={leseRef} id="lc-lesespalte" className="mx-auto w-full max-w-reading">
      {trefferListe && <div className="mb-8 border-b border-line pb-4">{trefferListe}</div>}
      <div className="space-y-2">
        {ohneGliederung.length > 0 && (
          <div className="space-y-5 mb-6">{ohneGliederung.map(artikel)}</div>
        )}
        {sektionen.map((s) => renderSektion(s, true, 0))}
      </div>

      {beiwerkSlot}

      <nav className="mt-12 border-t border-line pt-5 flex justify-between gap-4 text-body-s" aria-label="Weitere Erlasse">
        {vorher ? <Link to={erlassPfad(vorher)} className="text-brass-700 hover:underline">‹ {vorher.kuerzel}</Link> : <span />}
        <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">Übersicht</Link>
        {nachher ? <Link to={erlassPfad(nachher)} className="text-brass-700 hover:underline text-right">{nachher.kuerzel} ›</Link> : <span />}
      </nav>
    </div>
  );
}
