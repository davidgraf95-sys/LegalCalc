import { Link } from 'react-router-dom';
import { HERO_TITEL, HERO_SUBLINE } from '../../lib/seo';
import { UniversalSuche } from './UniversalSuche';
import { Begruessung } from './Begruessung';

// ─── Hero der Startseite (Startseite V4, Modul #1) ──────────────────────────
//
// Die eine warme Fläche der Seite (Brass-Wash) trägt vier Dinge in dieser
// Reihenfolge: Begrüssung + Datum (§4) · H1 + Subline aus seo.ts (§5) · die EINE
// Suche · vier Beispiel-Chips als Beleg, was «verzahnt» konkret heisst.
// Reine Darstellung (§3): keine Deko-SVG, kein Stagger-Reveal (LCP), keine
// tickende Uhr.
//
// DOKUMENTIERTER EIN-KLASSEN-FALLBACK (aus V3 unverändert übernommen): bei
// Kontrast-Bruch (Messprotokoll abnahme/startseite-v3/KONTRAST-PROTOKOLL.md)
// oder Davids Veto genügt es, hier auf `bg-surface` zurückzustellen — kein
// weiterer Umbau nötig.
const HERO_FLAECHE = 'bg-brass-100'; // Fallback: 'bg-surface' (Ein-Klassen-Rückstellung)

// Beispiel-Chips (§3 #1): FESTE Links, deterministisch — kein Zufall, keine
// «beliebten Suchen». Je einer aus den vier Beständen, die der Hero verspricht:
// eine Norm, ein Bundesgerichtsentscheid, ein Rechner, eine Vorlage. Alle Ziele
// sind gegen den committeten Korpus geprüft (5.9.2026):
//   · OR Art. 336c  → public/normtext/bund/OR.json, Eintrag `artikel: "336_c"`,
//     Leser-Anker `#art-336_c` (ArtikelLeser.tsx: id={`art-${e.artikel}`}).
//   · BGE 152 V 52  → public/rechtsprechung/register.json, key `bge_152_V_52`
//     (Leitentscheid, bestand snapshot).
//   · /rechner/tagerechner · /vorlagen/arbeitsvertrag → verfügbare Katalog-Karten.
const BEISPIELE: { label: string; ziel: string }[] = [
  { label: 'Art. 336c OR', ziel: '/gesetze/bund/OR#art-336_c' },
  { label: 'BGE 152 V 52', ziel: '/rechtsprechung/bge_152_V_52' },
  { label: 'Frist berechnen', ziel: '/rechner/tagerechner' },
  { label: 'Arbeitsvertrag', ziel: '/vorlagen/arbeitsvertrag' },
];

export function Hero() {
  return (
    <div className={`${HERO_FLAECHE} rounded-2xl border border-line p-6 sm:p-8`}>
      <Begruessung />
      {/* A-1-AUSNAHME (R3-α, 31.8.2026): kein `SeitenTitel`.
          Der Baustein trägt die SEITEN-Titelgrösse (`text-h2 sm:text-h1`). Der
          Hero ist die eine Fläche, die eine Stufe DARÜBER liegt
          (`text-h1 sm:text-display`) — das ist die Startseiten-Anmutung, nicht
          eine zweite Titel-Anatomie. Er erscheint zudem nie in einem Pane
          (Startseite ist immer die Vollansicht), womit die Pane-Kaskade, die
          `SeitenTitel` mitbringt, hier keinen Fall hat. */}
      <h1 className="mt-2 font-display font-semibold text-ink-900 text-h1 sm:text-display leading-tight">
        {HERO_TITEL}
      </h1>
      <p className="mt-3 text-body-l text-ink-700 max-w-reading">
        {HERO_SUBLINE}
      </p>
      <div className="mt-5">
        <UniversalSuche />
        {/* Such-Hinweis auf ink-600 statt ink-500 (§8-Ausweich, wie die Overline):
            11px-Kleintext auf dem Brass-Wash misst mit ink-500 nur 4.23:1 (axe
            serious) — ink-600 hebt es auf 6.28:1 (hell) / 6.80:1 (dunkel). */}
        <p className="mt-2 text-micro text-ink-600">
          Durchsucht Gesetze, Rechtsprechung, Materialien, Rechner und Vorlagen
        </p>
      </div>
      {/* Chips umbrechen (kein Scroll-Streifen, §2-Mobil): auf 390 px stehen sie
          in zwei Zeilen, es fällt keiner weg. */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span aria-hidden className="lc-overline text-ink-600 mr-1">Beispiele</span>
        {BEISPIELE.map((b) => (
          <Link key={b.ziel} to={b.ziel}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
            {b.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
