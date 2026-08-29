import type { ReactNode } from 'react';

// Gemeinsamer Kopf der statischen/Sekundärseiten (Redesign E10): Overline +
// Ablesekante (scale-rule = Marken-Signet) + responsive H1, optional Intro und
// eine Zusatzzeile (z. B. Status-Badge). Löst die zuvor 4× von Hand nachgebauten
// Köpfe ab — die stille Drift (Kontakt hatte die scale-rule verloren, drei
// Schreibweisen fürs Label, ErrorBoundary fiel ganz heraus) verschwindet damit
// an EINER Stelle. Reine Darstellung (§3).
export function SeitenKopf({ overline, titel, intro, children }: {
  overline: string;
  titel: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="lc-overline">{overline}</p>
      <div className="scale-rule max-w-[280px]" aria-hidden />
      <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">{titel}</h1>
      {/* T1/L5 (Design-Qualitäts-Pass 29.8.2026, W2·11-DESIGN): der Lead lief bis
          hierher OHNE Lesespalte über die volle Inhaltsbreite. Gemessen @1440
          (Methode `e2e/leser-lesemass.e2e.ts`: Textlänge / Zeilenkästen):
          `/gesetze` 1072 px = 89.3 ch/Zeile · `/rechtsprechung` 89 ch ·
          `/suche` 105 ch — alle über der WCAG-2.2-Decke SC 1.4.8 (≤ 80 ch) und
          gegen DESIGN-REGLEMENT B2 («volle Fensterbreite für Fliesstext ist
          verboten»). Der NEBENtext unter dem Lead trug `max-w-reading` längst;
          der Lead selbst war die Lücke. EINE Stelle, ~29 Intro-Fundstellen. */}
      {intro && <p className="max-w-reading text-body-l text-ink-600 leading-relaxed">{intro}</p>}
      {children}
    </div>
  );
}
