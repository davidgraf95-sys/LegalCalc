// ─── FacettenGruppe: EINE Facetten-Achse (Runde 2, 31.8.2026) ───────────────
//
// W2·19-DESIGN-KONSISTENZ · Runde 2, Paket C. Die Chip-OPTIK war in Welle B1
// (D-1) bereits vereinheitlicht — beide Achsen tragen seither `.lc-chip` /
// `.lc-chip-selected`. Geblieben war die zweite ANATOMIE: `/rechtsprechung`
// hatte die Achse als lokale `FacettenGruppe` in `EntscheidFilter.tsx`,
// `/suche` baute dieselbe Reihe (Gruppen-Rolle · Overline · Chip mit Zahl ·
// a11y-Name «<Achse>: <Wert> (<n>)») noch einmal von Hand. Beide sind auf
// DIESEN Baustein gezogen, die Kopien sind gelöscht (§5/§10).
//
// Sichtbare Folge auf `/suche`: die Reihe trägt jetzt — wie auf
// `/rechtsprechung` — ihr Achsen-Etikett («INHALTSTYP») vor den Chips. Die
// zugänglichen Namen bleiben Zeichen für Zeichen dieselben (e2e
// `suche-seite.e2e.ts`, `rechtsprechung*.e2e.ts` prüfen sie).
//
// Reglement: R15 «Trefferzahl je Facette» (gegen Null-Treffer-Klicks), LM-040/
// F2/F4 (Auswahl ohne Farbvergleich erkennbar: `.lc-chip-selected` setzt ✓),
// LM-044/N1 (Chip-Grammatik: <button> = geschlossener Hairline-Rahmen).
// Reine Anzeige (§3) — Zählen und Filtern bleiben beim Aufrufer.

import { zahlGruppiert } from '../typografie';

export type FacettenOption = {
  id: string;
  text: string;
  /** Ausgeschriebene a11y-/Tooltip-Bezeichnung, falls `text` eine Abkürzung ist. */
  voll?: string;
  n: number;
  aktiv: boolean;
  waehle: () => void;
};

export function FacettenGruppe({ label, gruppenLabel, optionen }: {
  /** Name der Achse: sichtbares Etikett UND Präfix der Chip-a11y-Namen. */
  label: string;
  /** aria-label der Gruppe, falls es ausführlicher sein soll als `label`. */
  gruppenLabel?: string;
  optionen: FacettenOption[];
}) {
  return (
    <div role="group" aria-label={gruppenLabel ?? label}
      className="lc-chip-zeile flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {/* LM-185 (W2·17-UI-BEFUNDE/B18): das Achsen-Etikett steht in einer festen
          Spalte, nicht mehr inline in seiner natürlichen Breite. Gemessen
          @1440 auf /rechtsprechung (Preview von origin/main, 5.9.2026):
          «GEMEINWESEN» 87 px, «INSTANZ»/«SPRACHE» je 55 px — die drei Chip-
          Reihen begannen darum bei x=655 bzw. x=623 und lasen sich nicht als
          gleichrangige Gruppen. `sm:w-28` (7 rem = 112 px) trägt das längste
          heute vorkommende Etikett; die Reihen starten auf EINER Linie.
          Unter `sm` nimmt das Etikett die volle Zeile (`w-full`): dort brachen
          die Chips ohnehin unter das Etikett, jetzt tun sie es als Block mit
          einer gemeinsamen linken Kante statt zufällig. Reine Darstellung (§3);
          Text, Reihenfolge und a11y-Namen unverändert. */}
      <span aria-hidden className="lc-overline w-full shrink-0 sm:w-28">{label}</span>
      {optionen.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.aktiv} onClick={o.waehle}
          aria-label={`${label}: ${o.voll ?? o.text} (${o.n})`} title={o.voll}
          className={`lc-chip ${o.aktiv ? 'lc-chip-selected' : ''}`}>
          {/* LM-051: Beschriftung und Zahl brauchen einen Trenner im TEXTKNOTEN,
              nicht nur den optischen Abstand (ml-1.5) — sonst liest/kopiert man
              «BS3765». Das explizite Leerzeichen steht als eigener Textknoten
              zwischen den beiden Flex-Items: es fällt mit dem vorangehenden
              Label zu EINEM anonymen Flex-Item zusammen und wird dort als
              Zeilenend-Leerraum entfernt — textContent «BS 3765», Darstellung
              unverändert. Die aria-labels («Gemeinwesen: BS (3765)») bleiben
              wie sie sind; sie waren nie das Problem.
              ink-600 (nicht ink-500): 12px-Ziffer auf --well ≥4.5:1 (R4/WCAG
              1.4.3, Werte nicht runden — ink-500 lag bei 4.47:1). Aktiv erbt
              brass-700. */}
          {o.text}{' '}<span className={`num ml-1.5 ${o.aktiv ? '' : 'text-ink-600'}`}>{zahlGruppiert(o.n)}</span>
        </button>
      ))}
    </div>
  );
}
