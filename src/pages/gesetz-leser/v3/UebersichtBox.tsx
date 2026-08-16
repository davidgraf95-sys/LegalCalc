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
    <details data-v3-uebersicht className="group rounded-md border border-line bg-paper-sunken">
      <summary
        data-v3-uebersicht-zeile
        className="flex cursor-pointer list-none items-start gap-1.5 rounded-md px-2 py-1.5 text-micro leading-snug text-ink-600 transition-colors hover:text-brass-700 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="mt-px shrink-0 transition-transform group-open:rotate-90">▸</span>
        <span className="min-w-0">
          <span className="font-medium text-ink-700">Übersicht</span>
          <span aria-hidden className="mx-1 text-ink-300">·</span>
          <span className="num [overflow-wrap:anywhere]">{zusammenfassung}</span>
        </span>
      </summary>
      {warnung && <div className="px-2 pb-1.5">{warnung}</div>}
      <div className="border-t border-line px-2 py-2">{children}</div>
    </details>
  );
}
