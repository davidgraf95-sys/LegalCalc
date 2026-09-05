import { useState } from 'react';
import { waehleBegruessung } from '../../lib/begruessungen';

// ─── Begrüssungszeile des Hero (W2·23-STARTSEITE-V4 §4) ─────────────────────
//
// Eine Zeile über der H1: ein zur Tageszeit passender Gruss und daneben das
// Datum. Reine Darstellung (§3) — kein Rechtswert, keine Rechenlogik, KEINE
// tickende Uhr (die frühere Sekunden-Uhr bleibt gestrichen).
//
// ZUFALL, bewusst UND an der richtigen Schicht: der Gruss wird bei JEDEM
// Seitenaufruf neu aus dem Pool gezogen (Auftrag David 5.9.2026 «verschiedene
// Begrüssungen … etwas persönlicher»). Die Zufallsquelle `Math.random` steht
// HIER, in der Darstellungsschicht — `src/lib/**` sperrt sie mechanisch (§2,
// eslint no-restricted-properties), und das zu Recht: die Pool-Datei bleibt so
// rein und im Test deterministisch prüfbar. CLAUDE.md §2 ist nicht berührt: die
// Regel bindet die ENGINES (gleiche Eingabe → gleiche Frist, gleicher Betrag);
// diese Zeile trägt keinen Rechtswert und geht in keine Berechnung ein.
//
// PRERENDER: Gruss UND Datum divergieren zwischen Build und Client (der Build
// backt einen Gruss und den Build-Tag, der Client zieht neu). Genau wie die
// frühere Datums-Overline trägt die Zeile darum ehrlich `suppressHydration-
// Warning`. Ein min-height braucht sie nicht: die Zeilenzahl ist bei JEDEM
// Gruss dieselbe — die Pool-Datei hält jeden Eintrag unter GRUSS_MAX_ZEICHEN
// (30), womit der Gruss auch auf 390 px einzeilig bleibt und das Datum dort
// IMMER auf die zweite Zeile umbricht (§15: kein Layout-Sprung, weil die
// Umbruchstelle nicht vom gezogenen Gruss abhängt).

// Datum «Samstag, 5. September 2026» — deterministisch ohne Locale-Abhängigkeit
// (SSR-stabil, keine Intl-Überraschungen zwischen Node und Browser).
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function heuteLang(d: Date): string {
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

export function Begruessung() {
  // Beides EINMAL beim Mount (lazy init) aus DERSELBEN Uhrzeit — sonst könnte
  // ein Aufruf um 09:59:59.9 einen Morgen-Gruss neben einem Datum zeigen, das
  // eine Millisekunde später gelesen wurde.
  const [{ gruss, datum }] = useState(() => {
    const jetzt = new Date();
    return { gruss: waehleBegruessung(jetzt.getHours(), Math.random), datum: heuteLang(jetzt) };
  });
  return (
    <p suppressHydrationWarning className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      <span className="font-display text-body-l text-ink-800">{gruss}</span>
      {/* Overline-/Datumston auf ink-600 (§8-Ausweich «dunklere Tinte»): auf dem
          Brass-Wash misst ink-500 nur 4.23:1 — ink-600 hebt es auf 6.28:1 (hell)
          bzw. 6.80:1 (dunkel). Messprotokoll: abnahme/startseite-v3/
          KONTRAST-PROTOKOLL.md, Zeile (c). */}
      <span className="text-body-s text-ink-600">{datum}</span>
    </p>
  );
}
