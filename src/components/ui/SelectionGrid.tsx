// ─── SelectionGrid: Auswahlkacheln (aria-pressed) – Darstellungsschicht (§3) ─
// Verhaltensneutrale Entdoppelung (5.6.2026): zuvor ~14× wortgleich in den
// Vorlagen-Wizards (Arbeitsvertrag, Mietvertrag, Vorsorgeauftrag,
// Patientenverfügung, Schlichtungsgesuch) und im Teuerungsrechner.
// Markup-Klassen sind EXAKT wie zuvor; die Fundstellen unterschieden sich nur
// im Grid-Container (Spaltenzahl → `className`) und darin, ob eine Kachel eine
// Unterzeile (`sub`) trägt. Keine Logik — reiner gesteuerter View.

// ─── D-3 (W2·19-DESIGN-KONSISTENZ, Runde 2, 31.8.2026) ──────────────────────
//
// Befund D-3 der Finder-Welle: vier Wizard-Stellen bauten dieselbe Sache — eine
// Reihe sich gegenseitig ausschliessender Auswahl-Knöpfe mit `aria-pressed` —
// als eigene PILLEN, an SelectionGrid vorbei, und signalisierten die Auswahl mit
// einer invertierten `bg-ink-900`-Füllung statt mit dem Auswahl-Signal des
// Hauses (`border-brass-500 bg-brass-100/60`). Zwei Auswahl-Grammatiken für
// eine Sache. Die Pillen sind darum eine VARIANTE dieses Bausteins geworden
// (additiv: die Kachel-Fundstellen sind unverändert), die Kopien sind gelöscht.
//
// Behalten bleibt die semantische Tönung der Patientenverfügungs-Entscheide
// («zustimmen» sage · «ablehnen» danger · «nur befristet» warn): dort trägt die
// Farbe BEDEUTUNG, nicht bloss den Auswahl-Zustand — sie wegzunehmen wäre ein
// Informationsverlust (§1/§8), kein Vereinheitlichen. Sie steht als deklarierter
// `ton` am Item; ohne `ton` gilt das Kanon-Signal.

export type SelectionTon = 'zustimmung' | 'ablehnung' | 'vorbehalt';

export type SelectionItem<T extends string> = {
  code: T;
  label: React.ReactNode;
  /** Optionale Unterzeile (text-xs). Fehlt sie, entfällt die Sub-Span.
      Nur `variant="kachel"` — eine Pille trägt keine zweite Zeile. */
  sub?: React.ReactNode;
  /** Semantische Tönung der AKTIVEN Pille (nur `variant="pille"`). */
  ton?: SelectionTon;
  /**
   * Nicht wählbar (B3-4/R3-α, 31.8.2026 — additiv).
   *
   * Der `ZustaendigkeitForm`-Rechtsweg trug eine handgezeichnete Kachel-Reihe
   * NUR deshalb, weil sie einen dritten Zustand kennt: Rechtswege, deren Engine
   * noch fehlt, stehen sichtbar (§8: die Lücke wird benannt, nicht verschwiegen)
   * und sind nicht anklickbar. Das Feld gehört an den Baustein, nicht in eine
   * dreizehnte Kopie. `titel` wird zum `title` des Knopfs — er sagt, WARUM.
   */
  disabled?: boolean;
  /** Zusatzauskunft am Knopf (`title`), z. B. der Grund einer Sperre. */
  titel?: string;
};

/** Aktiv-Klassen der Pille: Kanon-Signal, ausser das Item trägt Bedeutung. */
const TON_AKTIV: Record<SelectionTon, string> = {
  // A3-6 (R3-α, 31.8.2026): Zustands-Rolle statt Materialien-Kennfarbe
  // (wertidentisch: --ok-* zeigt auf --sage-*). «zustimmen» ist ein
  // Verdikt, kein Werkstoff — dieselbe Trennung wie bei danger/warn.
  zustimmung: 'bg-ok-bg border-ok-line text-ok-text',
  ablehnung: 'bg-danger-bg border-danger-line text-danger-700',
  vorbehalt: 'bg-warn-bg border-warn-500 text-warn-700',
};
const KANON_AKTIV = 'border-brass-500 bg-brass-100/60 text-ink-900';
const RUHE = 'border-line bg-surface hover:border-brass-400';
/** Gesperrte Kachel — sichtbar, aber nicht wählbar (§8, s. `disabled`). */
const GESPERRT = 'border-line bg-surface opacity-55 cursor-not-allowed';

/**
 * Trefferfläche der PILLE (A3-5, R3-α 31.8.2026).
 *
 * Die Pille misst gezeichnet 30 px hoch (`py-1.5` + `text-body-s`) — unter dem
 * AAA-Komfortmass 44 px (`--tap-ziel-komfort`) und, je nach Beschriftung, auch
 * unter den 24 px von WCAG 2.5.8, sobald das Label kurz ist («ja», «nein»).
 * Sie WÄCHST nicht: die Reihe ist bewusst kompakt, und eine 44-px-Pille wäre
 * eine andere Bauform. Statt dessen dieselbe Lösung wie bei `.lc-chip`
 * (index.css): ein unsichtbares `::after` hebt die TREFFERFLÄCHE auf das
 * Komfortmass, ohne die gezeichnete Höhe anzufassen.
 */
const PILLE_HITBOX =
  'relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 '
  + 'after:h-[var(--tap-ziel-komfort)] after:min-w-[var(--tap-ziel-komfort)] after:w-full after:content-[""]';

export function SelectionGrid<T extends string>({
  items, value, onSelect, className, variant = 'kachel', gruppenLabel,
}: {
  items: readonly SelectionItem<T>[];
  /** Aktueller Wert; darf breiter sein als die Item-Codes (z. B. ein
      «keine_angabe», das in keiner Kachel vorkommt → keine ist aktiv). */
  value: T | (string & {});
  onSelect: (code: T) => void;
  /** Container-Klassen (Grid-Spalten bzw. `flex flex-wrap`) – wie an der Fundstelle. */
  className: string;
  /** `kachel` (Default) = Auswahlkachel mit Unterzeile; `pille` = kompakte
      Chip-Reihe für kurze, sich ausschliessende Antworten. */
  variant?: 'kachel' | 'pille';
  /** Setzt `role="group"` + `aria-label` am Container (Pillen-Reihen tragen das). */
  gruppenLabel?: string;
}) {
  const pille = variant === 'pille';
  return (
    <div className={className}
      role={gruppenLabel ? 'group' : undefined} aria-label={gruppenLabel}>
      {items.map((it) => {
        const aktiv = value === it.code;
        const aktivKlasse = pille && it.ton ? TON_AKTIV[it.ton] : KANON_AKTIV;
        const ruhe = it.disabled ? GESPERRT : RUHE;
        return (
          <button
            key={it.code}
            type="button"
            disabled={it.disabled}
            title={it.titel}
            data-selection-pille={pille ? '' : undefined}
            onClick={() => !it.disabled && onSelect(it.code)}
            aria-pressed={aktiv}
            className={pille
              ? `${PILLE_HITBOX} px-3 py-1.5 rounded-full text-body-s font-medium border transition-colors ${
                aktiv ? aktivKlasse : `${ruhe} text-ink-600`}`
              : `text-left p-3 min-h-11 rounded-lg border transition-colors ${aktiv ? aktivKlasse : ruhe}`}
          >
            {pille ? it.label : (
              <>
                <span className="block text-body-s font-semibold text-ink-900">{it.label}</span>
                {/* ink-600, NICHT ink-500 (LM-176, Fahrplan B5 §6): die
                    Unterzeile sitzt in der GEWÄHLTEN Kachel auf `bg-brass-100`
                    — dort misst ink-500 4.37:1 (unter AA), ink-600 6.3:1. Die
                    Messung stammt von den Vorlagen-Kopien, die B3-4 hier
                    einzieht; sie darf beim Einziehen nicht verloren gehen. */}
                {/* LM-130 (W2·17-UI-BEFUNDE-B9, 4.9.2026) · DIE UNTERZEILE BRICHT,
                    SIE LÄUFT NICHT AUS DER KACHEL. Gemessen @390 auf
                    `/vorlagen/nda`, Block «Detailgrad» (`grid-cols-3`, Spalte
                    100 px): «vollständige Grundausstattung» brauchte 98 px in
                    einem 74 px breiten Kasten — 24 px Überlauf, der über den
                    Kartenrand und unter die Nachbarkachel lief (Screenshot-Beweis,
                    ein DOM-Wächter allein hätte ihn nicht gezeigt). Ursache ist
                    nicht das Raster, sondern das EINE unteilbare Kompositum:
                    «Grundausstattung» ist breiter als jede 100-px-Spalte.
                    Die Regel ist die des Hauses und wortgleich mit der des
                    Vorlagen-Titels (`vorlagen/wizard.tsx`): `hyphens-auto` trennt
                    an der Silbengrenze (mit Trennstrich, in Chromium headless wie
                    headed gemessen), `[overflow-wrap:anywhere]` fängt den
                    pathologischen Rest. Am Baustein, nicht an der Fundstelle —
                    dieselbe Kachel-Anatomie trägt alle Untertyp-Raster (§5). */}
                {it.sub !== undefined && <span className="block text-xs text-ink-600 [overflow-wrap:anywhere] hyphens-auto">{it.sub}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
