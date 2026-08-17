import type { ReactNode } from 'react';

// ─── Übersichtsbox der Seitenleiste (FAHRPLAN-LESER-V3 Kap. 4b, Pos. 10) ─────
//
// Die Skizze schreibt sie als ZUGEKLAPPTE Zeile:
//
//   ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)        scrollt MIT weg
//
// Der Kern ist das «▸». Fedlex zeigt drei aufgeklappte Kästen über dem Baum;
// wer im Gesetz liest, sucht dort aber die Gliederung, nicht die Metadaten. Die
// Zusammenfassung in der Zeile («SR · Umfang · Stand») beantwortet die drei
// Fragen, die man beim Ankommen wirklich hat; alles Weitere ist EINEN Klick
// entfernt und nichts ist versteckt (§8 — die Angaben bleiben im DOM und für
// Ctrl+F/Screenreader erreichbar, `<details>` blendet nur visuell aus).
//
// Warum natives `<details>/<summary>` und kein eigener Disclosure: Tastatur,
// `aria-expanded`, Screenreader-Ansage und der Zustand kommen vom Browser —
// eine nachgebaute Variante wäre mehr Code für weniger Verlässlichkeit
// (Design-Grundlage Kap. 1, «Familiarity»). Es gibt hier auch keinen Zustand zu
// persistieren: die Box ist eine Ankunfts-Auskunft, kein Arbeitsbereich.
//
// CLS (§15/2): geschlossen hat die Box eine feste Zeilenhöhe; das Aufklappen
// ist eine NUTZER-Geste unterhalb des klebenden Baum-Kopfes — es verschiebt
// nichts, was gerade gelesen wird.

export function UebersichtBox({ zusammenfassung, warnung, children }: {
  /** Die eine Zeile im Ruhezustand: «SR 312.0 · 480 Artikel · Stand 01.04.2025». */
  zusammenfassung: string;
  /** Klartext-Warnung «nicht konsolidiert», falls zutreffend — sie steht mit
   *  Icon UND Wort in der geschlossenen Zeile (Design-Grundlage Kap. 6: nie
   *  Farbe allein, nie ein Icon ohne Label) und wird darum nie weggeklappt. */
  warnung?: ReactNode;
  children: ReactNode;
}) {
  return (
    // ── Ä5 (H2b) · WEISSRAUM, DANN LINIE — KEIN KASTEN ────────────────────────
    // Bis H2 war die Box ein gerahmter, getönter Kasten (`border border-line
    // bg-paper-sunken`, gemessen 1 px rundum auf `paper-sunken`) und damit die
    // einzige Fläche der Leiste, die aussah wie ein Bauteil. Design-Grundlage
    // Kap. 8 Nr. 1 verbietet genau das: «Keine Rahmen/Boxen um jedes Element —
    // Trennung über Weissraum, dann Linie». Und der Kasten war zugleich die
    // Wurzel des zweiten Ä5-Befunds: er trug einen DRITTEN Farbton unter den
    // klebenden Sockel (Sheet `paper-raised` · Sockel `paper` · Box
    // `paper-sunken`, alle drei gemessen 17.8.2026) — gestapelte Töne, die beim
    // Scrollen als wandernder Streifen sichtbar werden.
    // Jetzt: keine Fläche, kein Rahmen. Die Zugehörigkeit trägt der Weissraum,
    // die AUFGEKLAPPTE Box grenzt sich mit EINER Linie ab (`group-open`) — die
    // war vorher als `border-t` im Inneren schon da und wird nur noch sichtbar,
    // wenn es etwas abzugrenzen gibt.
    <details data-v3-uebersicht className="group">
      <summary
        data-v3-uebersicht-zeile
        className="flex cursor-pointer list-none items-start gap-1.5 rounded-sm py-1 text-micro leading-snug text-ink-600 transition-colors hover:text-brass-700 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="mt-px shrink-0 transition-transform group-open:rotate-90">▸</span>
        {/* Ä5 · das hängende «·» ist weg. Es stand zwischen «Übersicht» und einer
            Zusammenfassung, die ihre Teile SELBST mit «·» fügt — ein vierter
            Trenner derselben Zeichenform, der beim Umbruch als einzelnes Zeichen
            am Zeilenende hing. Der Weissraum trennt Etikett und Werte
            zuverlässiger als ein Zeichen, das umbrechen kann (Kap. 8 Nr. 8:
            keine Dekoration ohne Funktion). */}
        <span className="min-w-0">
          <span className="font-medium text-ink-700">Übersicht</span>{' '}
          <span className="num [overflow-wrap:anywhere]">{zusammenfassung}</span>
        </span>
      </summary>
      {warnung && <div data-v3-uebersicht-warnung className="pb-1.5 pl-4">{warnung}</div>}
      {/* `data-v3-uebersicht-inhalt` statt einer Klassen-Kette als Testanker: die
          Reihenfolge «Warnung VOR den Kindern» ist eine Zusage über die Struktur
          und darf nicht an Utility-Klassen hängen, die eine Gestaltungsänderung
          mitnimmt (dieselbe Lehre wie der `data-fn-ref`-Fix in H2: eine Regel darf
          ein Element nicht über sein Aussehen suchen). */}
      <div data-v3-uebersicht-inhalt className="mt-1 border-t border-line pl-4 pt-2">{children}</div>
    </details>
  );
}
