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
};

/** Aktiv-Klassen der Pille: Kanon-Signal, ausser das Item trägt Bedeutung. */
const TON_AKTIV: Record<SelectionTon, string> = {
  zustimmung: 'bg-sage-bg border-sage-line text-sage-700',
  ablehnung: 'bg-danger-bg border-danger-line text-danger-700',
  vorbehalt: 'bg-warn-bg border-warn-500 text-warn-700',
};
const KANON_AKTIV = 'border-brass-500 bg-brass-100/60 text-ink-900';
const RUHE = 'border-line bg-surface hover:border-brass-400';

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
        return (
          <button
            key={it.code}
            type="button"
            onClick={() => onSelect(it.code)}
            aria-pressed={aktiv}
            className={pille
              ? `px-3 py-1.5 rounded-full text-body-s font-medium border transition-colors ${
                aktiv ? aktivKlasse : `${RUHE} text-ink-600`}`
              : `text-left p-3 min-h-11 rounded-lg border transition-colors ${aktiv ? aktivKlasse : RUHE}`}
          >
            {pille ? it.label : (
              <>
                <span className="block text-body-s font-semibold text-ink-900">{it.label}</span>
                {it.sub !== undefined && <span className="block text-xs text-ink-500">{it.sub}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
