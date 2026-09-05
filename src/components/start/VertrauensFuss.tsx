import { VERTRAUENS_SATZ, STATUS_SATZ } from '../../lib/seo';

// ─── Vertrauens-Fuss der Startseite (Startseite V4, Modul #7) ───────────────
//
// Bündelt die früher verstreuten Vertrauens-Aussagen an EINER Stelle (§3): der
// gescopte Anti-KI-/Rechenweg-Satz + der ehrliche Status-Satz (beide SSoT
// seo.ts, §6) und daneben der Pflicht-§8-Hinweis «keine Rechtsberatung». Reine
// Darstellung (§3); kein Absolutum, kein «geprüft»-Siegel, keine Badge (§9/1).
//
// V4: KOMPAKTER, nicht kürzer — beide Sätze und der `lc-notice`-Hinweis bleiben
// WÖRTLICH stehen (§8: Ehrlichkeitstexte werden nie gestrafft), sie stehen ab
// `md` nur nebeneinander statt untereinander. Das spart auf dem Desktop rund
// eine halbe Bildschirmhöhe am Seitenfuss.
export function VertrauensFuss() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <div className="max-w-reading space-y-2">
        <p className="text-body-s text-ink-700 leading-relaxed">{VERTRAUENS_SATZ}</p>
        <p className="text-body-s text-ink-600 leading-relaxed">{STATUS_SATZ}</p>
      </div>
      <section className="lc-notice max-w-reading">
        <p className="lc-overline mb-1">Rechtlicher Hinweis</p>
        <p className="text-body-s text-ink-600">
          Alle Rechner liefern automatisierte Orientierungsberechnungen und keine Rechtsberatung. Massgeblich
          sind Gesetz, GAV, Vertrag und der konkrete Sachverhalt. Für die Wahrung einer Frist im Einzelfall ist
          allein die nutzende Person verantwortlich.
        </p>
      </section>
    </div>
  );
}
