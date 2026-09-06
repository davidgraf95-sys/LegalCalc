import { Link } from 'react-router-dom';
import { SAMMLUNG_TITEL, SAMMLUNG_BESTAND } from '../../lib/seo';
import { UniversalSuche } from './UniversalSuche';
import { useHeute } from './Begruessung';
import { ZuletztVerwendet } from './ZuletztVerwendet';
import { StartZeile } from './Satzspiegel';

// ─── Titelblatt-Zeile der Startseite (W2·24-DESIGN-IDENTITAET R3) ───────────
//
// Die erste Zeile des Satzspiegels: links Titel der Seite + Wochentag + Datum,
// rechts Begrüssung, die EINE Suche und die Verweiszeile. Kein Kasten, kein
// Brass-Wash, keine Fläche — die frühere `bg-brass-100 rounded-2xl`-Karte ist
// GESTRICHEN (Fahrplan §5: Kanten statt Kissen, Registerfarben als einzige
// Farbe). Reine Darstellung (§3).
//
// SPRACH-DIÄT (Fahrplan §6 (h)): die Value-Proposition-H1 «Schweizer Recht an
// einem Ort» und die Subline «… miteinander verzahnt …» sind weg. An ihrer
// Stelle steht der Titelblatt-Begriff «Sammlung» und eine AUFZÄHLUNG dessen,
// was drin ist — eine Bezeichnung, kein Nutzenversprechen (§8).
//
// A-1-AUSNAHME (R3-α, 31.8.2026), in W2·24-R3 fortgeschrieben: kein `SeitenTitel`.
// Der Baustein trägt die Seiten-Titelgrösse (`text-h2 sm:text-h1`) und die
// Pane-Kaskade; die Startseite hat mit dem Satzspiegel gar keine Titelzeile
// dieser Art mehr — ihr Titel steht als kleines Titelblatt-Wort in der
// MARGINALIE, wo im Referenzbild die Ausgabe-Angaben stehen. Eine `<h1>` bleibt
// es trotzdem (genau eine je Seite, sichtbar — `e2e/a11y.e2e.ts` prüft
// `h1` auf Sichtbarkeit, eine `sr-only`-H1 wäre dort rot).

// Beispiel-Verweise (§3 #1): FESTE Links, deterministisch — kein Zufall, keine
// «beliebten Suchen». Je einer aus den vier Beständen: eine Norm, ein
// Bundesgerichtsentscheid, ein Rechner, eine Vorlage. Alle Ziele sind gegen den
// committeten Korpus geprüft (5.9.2026):
//   · OR Art. 336c  → public/normtext/bund/OR.json, Eintrag `artikel: "336_c"`,
//     Leser-Anker `#art-336_c` (ArtikelLeser.tsx: id={`art-${e.artikel}`}).
//   · BGE 152 V 52  → public/rechtsprechung/register.json, key `bge_152_V_52`.
//   · /rechner/tagerechner · /vorlagen/arbeitsvertrag → verfügbare Katalog-Karten.
const BEISPIELE: { label: string; ziel: string }[] = [
  { label: 'Art. 336c OR', ziel: '/gesetze/bund/OR#art-336_c' },
  { label: 'BGE 152 V 52', ziel: '/rechtsprechung/bge_152_V_52' },
  { label: 'Frist berechnen', ziel: '/rechner/tagerechner' },
  { label: 'Arbeitsvertrag', ziel: '/vorlagen/arbeitsvertrag' },
];

export function Hero() {
  const { gruss, wochentag, datum } = useHeute();
  return (
    <StartZeile
      reg="titel"
      ohneVorlauf
      rand={(
        <>
          <h1 className="font-sans font-medium text-body-s text-ink-900">{SAMMLUNG_TITEL}</h1>
          <span suppressHydrationWarning className="mt-1 block text-ink-500">{wochentag}</span>
          <span suppressHydrationWarning className="block num">{datum}</span>
        </>
      )}
    >
      <p suppressHydrationWarning className="font-serif italic text-h3 text-ink-900">{gruss}</p>
      <UniversalSuche />
      {/* DREI ZEILEN STATT EINER (David-Befund D2 / Prüfbefund R3-F5, 6.9.2026):
          Bestand, Beispiele und «Zuletzt geöffnet» standen in EINEM Absatz und
          liefen ineinander («… Vorlagen. Beispiele: … Arbeitsvertrag Zuletzt
          geöffnet: …») — drei Aussagen verschiedener Art (Scope · feste
          Einstiege · eigener Verlauf) ohne Fuge dazwischen. Jetzt trägt jede
          ihre eigene Zeile; die Reihenfolge bleibt.
          Die Verweise sind UNTERSTRICHEN (R3-F1): §5 dieses Fahrplans schreibt
          «Links unterstrichen», und im Dunkel war die Farbunterscheidung allein
          mit 2.72:1 unter der 3:1-Schranke (axe `link-in-text-block`). */}
      <p className="mt-2.5 font-sans text-xs leading-relaxed text-ink-500">{SAMMLUNG_BESTAND}</p>
      <p className="mt-1 font-sans text-xs leading-relaxed text-ink-500">
        Beispiele:{' '}
        {BEISPIELE.map((b, i) => (
          <span key={b.ziel}>
            {i > 0 && <span aria-hidden> · </span>}
            <Link to={b.ziel} className="underline hover:text-reg-g">{b.label}</Link>
          </span>
        ))}
      </p>
      <ZuletztVerwendet />
    </StartZeile>
  );
}
