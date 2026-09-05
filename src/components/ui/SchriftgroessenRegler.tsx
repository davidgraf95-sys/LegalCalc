import type { ButtonHTMLAttributes } from 'react';

// ─── EIN Knopf-Paar für «Schrift verkleinern/vergrössern» (C1, 5.9.2026) ─────
//
// W2·19-DESIGN-KONSISTENZ Runde 6-C. GEMESSEN: zwei Schriftgrössen-Regler
// (`components/layout/Topbar.tsx` — globale Wurzel-rem, WCAG 1.4.4 — und
// `pages/gesetz-leser/v3/LeserAnsichtV3.tsx` — nur Normtext) sahen trotz
// gleicher Aufgabe verschieden aus:
//   · Zahlenschrift: Topbar `.lc-ziffern` (Rolle ohne Familie, App-Kanon —
//     siehe `.num, .lc-ziffern` in index.css und die R6-B-Nachzüge an
//     `Datum.tsx`/`LeserKopfGeruest.tsx`), der Leser-Regler `.num` (erzwingt
//     Mono) — eine begründungslose Ausnahme vom Kanon.
//   · Knopf-Schnitt: Topbar `rounded-lg` Pille mit `rounded-md`-Knöpfen und
//     Text-Hover; der Leser-Regler `rounded-md` ohne Pillen-Fläche und
//     `.lc-hover-flaeche` (Flächen-Hover).
// Dieser Baustein trägt nur das KNOPF-PAAR samt Prozent-Anzeige — der
// `role="group"`-Rahmen und das sichtbare Scope-Wort («Ganze Seite» /
// «Nur Gesetzestext») bleiben am Aufrufer, weil ihre Typografie zu Recht dem
// jeweiligen Umfeld folgt (Topbar-Leiste vs. Ansicht-Panel-Zeile, siehe
// `LeserAnsichtV3.tsx` Zeile ~401 — dieselbe `text-body-s text-ink-700`
// dort für eine Nachbar-Zeile). Funktion unverändert: beide Aufrufer bringen
// weiterhin ihre eigenen Labels, Titel und Datenattribute mit.
//
// §3: reine Darstellung — der Baustein weiss nichts über den Skala-Store.

export interface SchriftReglerWerte {
  prozent: number;
  kannGroesser: boolean;
  kannKleiner: boolean;
  groesser: () => void;
  kleiner: () => void;
}

type KnopfExtra = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'disabled' | 'aria-label' | 'title' | 'className' | 'children'>
  & Record<`data-${string}`, string>;

export function SchriftgroessenRegler({
  schrift, kleinerLabel, groesserLabel, kleinerTitle, groesserTitle, kleinerAttrs, groesserAttrs,
}: {
  schrift: SchriftReglerWerte;
  /** `aria-label` des Verkleinern-Knopfs — sagt, WAS kleiner wird (§8). */
  kleinerLabel: string;
  groesserLabel: string;
  kleinerTitle: string;
  groesserTitle: string;
  /** Zusätzliche Attribute des Aufrufers (z. B. `data-v3-schrift`). */
  kleinerAttrs?: KnopfExtra;
  groesserAttrs?: KnopfExtra;
}) {
  const knopf = 'rounded-md px-2.5 py-1 text-body-s font-medium text-ink-600 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40';
  return (
    <span className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
      <button
        type="button"
        aria-label={kleinerLabel}
        title={kleinerTitle}
        disabled={!schrift.kannKleiner}
        onClick={schrift.kleiner}
        className={knopf}
        {...kleinerAttrs}
      >
        A<span aria-hidden>−</span>
      </button>
      {/* Live-Wertansage des aktuellen Prozentwerts (WCAG 4.1.3); `.lc-ziffern`
          ist die App-Rolle für tabellarische Ziffern ohne erzwungene Familie
          (§5) — w-12 hält die Breite stabil (Token, keine px). */}
      <span aria-live="polite" className="w-12 select-none text-center text-micro lc-ziffern text-ink-500">{schrift.prozent} %</span>
      <button
        type="button"
        aria-label={groesserLabel}
        title={groesserTitle}
        disabled={!schrift.kannGroesser}
        onClick={schrift.groesser}
        className={knopf}
        {...groesserAttrs}
      >
        A<span aria-hidden>+</span>
      </button>
    </span>
  );
}
