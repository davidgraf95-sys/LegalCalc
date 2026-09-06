import { Link } from 'react-router-dom';
import { SAMMLUNG_TITEL } from '../../lib/seo';
import { usePaneKlasse } from '../layout/PaneKontext';
import { UniversalSuche } from './UniversalSuche';
import { useHeute } from './Begruessung';

// ─── Erste Ebene des Pults: Begrüssung und die EINE Suche (W2·24-R10) ───────
//
// Referenzbild `abnahme/design-identitaet/pult-freigegeben.html`, Marke `.such`:
// Begrüssung kursiv in Literata mit kleinem Datum daneben, darunter das Label
// «Suchen», die Lupe und die Serifen-Eingabe über einem Unterstrich, zuunterst
// die Scope-Zeile. Kein Kasten, keine Fläche.
//
// R10-NACHZUG (David 6.9.2026, D14 wörtlich: «begrüssung prominenter und suche
// kleiner»): die GEWICHTUNG dreht sich um. Bis hierhin trug die Suchzeile die
// grössere Stufe (bis `text-h1`) und der Gruss nur `text-h3` — genau umgekehrt
// zu dem, was am Bild auffiel. Jetzt ist der GRUSS die grosse Zeile
// (`text-h2 lg:text-h1`, ~24 px @390 / 32 px @1440, wie zuvor die Suchzeile)
// und die Suchzeile eine Stufe darunter (`UniversalSuche.tsx`, ~18 px @390 /
// 22 px @1440). Reihenfolge Begrüssung → Suche → Bereiche bleibt (unverändert
// hier und in `pages/Startseite.tsx`), ebenso Lupe/Label/`role=search`/`?q=`/
// die Beispiel-Links — reine Grössen-Umkehr, keine Funktion angefasst (§3).
//
// Aus `start/Hero` hervorgegangen (R3), mit zwei Rückbauten (§17-Gegengewicht):
//   · KEINE MARGINALIE mehr. Titel, Wochentag und Datum standen links in einer
//     150-px-Spalte; das Pult hat keine solche Spalte, und die Angaben stehen
//     jetzt in der Zeile, in der man sie liest.
//   · DIE BESTANDS-AUFZÄHLUNG IST WEG (`SAMMLUNG_BESTAND`, «Gesetze, Entscheide,
//     Materialien, Rechner, Vorlagen.»). Genau diese fünf stehen seit R10 als
//     BEREICHE mit ihren gemessenen Zahlen unmittelbar darunter — der Satz war
//     dieselbe Auskunft ein zweites Mal und gehört zu dem, was David am
//     6.9.2026 als «zu viel text» gesehen hat. Die Konstante selbst bleibt: der
//     Seitenfuss (`layout/Footer`) trägt sie unverändert auf jeder Seite.
//
// A-1-AUSNAHME (R3-α, 31.8.2026), fortgeschrieben: kein `SeitenTitel`. Der
// Baustein trägt die Seiten-Titelgrösse (`text-h2 sm:text-h1`) und die
// Pane-Kaskade; das Pult hat keine Titelzeile dieser Art — sein Titel ist das
// kleine Titelblatt-Wort über der Begrüssung. Eine <h1> bleibt es trotzdem
// (genau eine je Seite, SICHTBAR — `e2e/a11y.e2e.ts` prüft `h1` auf
// Sichtbarkeit, eine `sr-only`-H1 wäre dort rot).
// GRÖSSE ≠ RANG (R10-NACHZUG, D14): seit der Gewichtsdrehung ist der Gruss
// (ein <p>) optisch grösser als diese <h1> — das ist zulässig, weil die
// Heading-Ordnung SEMANTISCH bleibt (genau eine, sichtbare H1; der Gruss
// erzeugt keine zweite Überschrift und keinen Sprung in der Heading-Liste,
// `e2e/a11y.e2e.ts` misst `heading-order` am Baum, nicht an Schriftgrössen).
// Optische Grösse ist ein Darstellungsmittel (§3), Heading-Rang ein
// Struktur-Merkmal — beides läuft hier bewusst auseinander.
//
// Beispiel-Verweise (§3 #1): FESTE Links, deterministisch — kein Zufall, keine
// «beliebten Suchen». Je einer aus den vier Beständen: eine Norm, ein
// Bundesgerichtsentscheid, ein Rechner, eine Vorlage. Alle Ziele sind gegen den
// committeten Korpus geprüft (5.9.2026, unverändert übernommen):
//   · OR Art. 336c  → public/normtext/bund/OR.json, Eintrag `artikel: "336_c"`,
//     Leser-Anker `#art-336_c` (ArtikelLeser.tsx: id={`art-${e.artikel}`}).
//   · BGE 152 V 52  → public/rechtsprechung/register.json, key `bge_152_V_52`.
//   · /rechner/tagerechner · /vorlagen/arbeitsvertrag → verfügbare Katalog-Karten.
// Reine Darstellung (§3).
const BEISPIELE: { label: string; ziel: string }[] = [
  { label: 'Art. 336c OR', ziel: '/gesetze/bund/OR#art-336_c' },
  { label: 'BGE 152 V 52', ziel: '/rechtsprechung/bge_152_V_52' },
  { label: 'Frist berechnen', ziel: '/rechner/tagerechner' },
  { label: 'Arbeitsvertrag', ziel: '/vorlagen/arbeitsvertrag' },
];

export function SuchBlock() {
  const { gruss, wochentag, datum } = useHeute();
  const pk = usePaneKlasse();
  // Breiten-Deckel wie im Referenzbild (`.such{max-width:860px}`): die grosse
  // Serifen-Zeile soll nicht über die ganze Seite laufen — ein Suchfeld von
  // 1'080 px liest sich als Bahn, nicht als Feld. Kein Token dafür im Haus
  // (`max-w-reading` 40 rem ist der LESE-Deckel und hier zu eng).
  return (
    <div className="max-w-[54rem]">
      <h1 className="font-sans text-xs text-ink-500">{SAMMLUNG_TITEL}</h1>
      {/* Gruss und Datum kommen aus EINER Uhrzeit (`useHeute`); beide weichen
          zwischen Build und Client ab (der Build backt einen Gruss und den
          Build-Tag) und tragen darum ehrlich `suppressHydrationWarning`.
          GRÖSSE (R10-NACHZUG, D14): `text-h2 lg:text-h1` — ~24 px @390 (h2,
          25.6 px), ~32 px @1440 (h1, 32 px). Vorher trug diese Zeile `text-h3`
          fest und die Suchzeile darunter die grosse Stufe; David 6.9.2026:
          «begrüssung prominenter und suche kleiner» dreht das um. Pane-fähig
          wie `UniversalSuche` (`pk`) — ohne Pane bleibt die Kette bei EINEM
          Wechsel (`lg`), weil hier (anders als beim Suchfeld) keine dritte
          Stufe gebraucht wird; im Pane misst `@3xl/pane` denselben Wechsel an
          der Pane-Breite statt am Viewport (B-1, `PaneKontext.ts`). */}
      <p className={`mt-0.5 flex flex-wrap items-baseline gap-x-3 font-serif italic text-ink-900 ${pk('text-h2 lg:text-h1', 'text-h2 @3xl/pane:text-h1')}`}>
        <span suppressHydrationWarning>{gruss}</span>
        <span suppressHydrationWarning className="num font-sans not-italic text-xs text-ink-500">
          {wochentag}, {datum}
        </span>
      </p>
      <UniversalSuche />
      <p className="mt-2 font-sans text-xs leading-relaxed text-ink-500">
        Die Taste / springt hierher. Beispiele:{' '}
        {BEISPIELE.map((b, i) => (
          <span key={b.ziel}>
            {i > 0 && <span aria-hidden> · </span>}
            <Link to={b.ziel} className="underline hover:text-reg-g">{b.label}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
