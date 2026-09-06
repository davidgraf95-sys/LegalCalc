import { useId, type ReactNode } from 'react';
import { usePaneKlasse } from '../layout/PaneKontext';

// ─── Satzspiegel der Startseite (W2·24-DESIGN-IDENTITAET R3) ────────────────
//
// Der Rahmen, in dem jedes Startseiten-Modul steht: links eine 150-px-Marginalie
// (Registerfarben-Strich · Bereich · Zahl mit Scope), rechts der Inhalt. Das ist
// die Form des Referenzbildes `abnahme/design-identitaet/vorschlag-freigegeben.html`
// («Startseite»), nicht eine neue Erfindung — und sie ersetzt die Kachel-Optik
// der Startseite V4 (RubrikKachel/lc-tile auf «/» entfällt, Fahrplan §6 R3).
//
// BAUREGEL AUS DER INVENTUR (FAHRPLAN §6 (c), gemessen): eine Marginalienspalte
// (150 px + 36 px Rinne) bricht unter ~52 rem Spaltenbreite — also in JEDEM
// geteilten 1440er-Fenster. Die zwei Spalten gehen darum erst ab `@3xl/pane`
// (48 rem) im Pane bzw. ab `lg` im Vollfenster auf; darunter fällt die
// Marginalie als vorangestellte ZEILE über den Inhalt (Referenzbild
// `@media (max-width:820px)`). Damit ergeben zwei Panes nebeneinander weiter
// Sinn — die Split-View-Mechanik selbst ist nicht berührt (§3).
//
// A11y: die INHALTS-Zelle ist die `<section aria-labelledby>`, nicht der ganze
// Zeilen-Fragment — ein `display:contents`-Wrapper um beide Zellen wäre die
// Alternative gewesen und nimmt Landmarks in älteren Engines aus dem
// Barrierefreiheits-Baum. Die Marginalie ist Meta (Bereich, Zahl, Datum) und
// steht darum ausserhalb der Region.
// Reine Darstellung (§3).

/** Die vier Register der Sammlung (index.css `--reg-*`, R1). */
export type Register = 'g' | 'r' | 'm' | 'w';

// Hover und Zähler-Akzent stehen als LITERALE Utility-Klassen am Fundort
// (`hover:text-reg-g`, `text-reg-r`, …) und nicht als Abbildung hier: Tailwind
// sieht nur ganze Klassennamen im Quelltext, eine Tabelle mit zusammengesetzten
// Namen wäre zwar erlaubt, aber nur, solange sie vollständige Literale enthält —
// und ein zweiter Ort für dieselbe Farbwahl ist genau die Streuung, die §5
// meidet. Der Strich unten braucht die Tabelle, weil er als PROP kommt.

/** Randstrich der Marginalie — die einzige Farbfläche der Startseite. */
const STRICH: Record<Register, string> = {
  g: 'bg-reg-g', r: 'bg-reg-r', m: 'bg-reg-m', w: 'bg-reg-w',
};

export function StartZeile({ reg, ueber, rand, titel, kopfZusatz, children }: {
  /** Registerfarbe der Domäne; ohne = kein Strich (Titelblatt-Zeile). */
  reg?: Register;
  /** Kleine Zeile über der Randangabe (Bereich bzw. Wochentag). */
  ueber?: ReactNode;
  /** Die Randangabe selbst — Zahl MIT Scope oder Datum. */
  rand?: ReactNode;
  /** Sektionstitel; ohne Titel bleibt die Zelle ein <div> (kein leerer Landmark). */
  titel?: string;
  /** Rechts neben dem Titel (z. B. «Alle Entscheide →»). */
  kopfZusatz?: ReactNode;
  children: ReactNode;
}) {
  const pk = usePaneKlasse();
  const titelId = useId();
  const randKlasse = pk(
    'pt-6 pb-1 lg:pt-[1.9rem] lg:pb-6 lg:text-right lg:border-b lg:border-rule-soft',
    'pt-6 pb-1 @3xl/pane:pt-[1.9rem] @3xl/pane:pb-6 @3xl/pane:text-right @3xl/pane:border-b @3xl/pane:border-rule-soft',
  );
  const inhaltKlasse = pk(
    'min-w-0 pt-2 pb-6 lg:pt-6 lg:pb-7 border-b border-rule-soft',
    'min-w-0 pt-2 pb-6 @3xl/pane:pt-6 @3xl/pane:pb-7 border-b border-rule-soft',
  );
  const strichKlasse = pk(
    'block h-[3px] w-9 lg:w-full mb-2',
    'block h-[3px] w-9 @3xl/pane:w-full mb-2',
  );
  const kopf = titel && (
    <div className="mb-3.5 flex items-baseline justify-between gap-3">
      <h2 id={titelId} className="font-sans font-medium text-body-s text-ink-900">{titel}</h2>
      {kopfZusatz}
    </div>
  );
  return (
    <>
      <div className={`font-sans text-xs leading-snug text-ink-600 ${randKlasse}`}>
        {reg && <span aria-hidden className={`${strichKlasse} ${STRICH[reg]}`} />}
        {ueber && <span className="block text-ink-500">{ueber}</span>}
        {rand}
      </div>
      {titel
        ? <section aria-labelledby={titelId} className={inhaltKlasse}>{kopf}{children}</section>
        : <div className={inhaltKlasse}>{children}</div>}
    </>
  );
}

/** Fuss-Zeile einer Zeile: Scope, Grenze, Verweis — nie ein Nutzenversprechen (§8). */
export function StartFuss({ children }: { children: ReactNode }) {
  return <p className="mt-3 max-w-reading font-sans text-xs leading-relaxed text-ink-500">{children}</p>;
}
