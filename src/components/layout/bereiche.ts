import { NAVIGATION } from '../../lib/navigation';

// ─── Die fünf Bereiche der Sammlung + ihre Registerfarbe (W2·24 R2) ─────────
//
// EIN Ort für die Frage «welchem Register gehört dieser Pfad?» (§5). Konsumenten:
// die Bereichs-Reiter der Titelblatt-Zeile (`Topbar`), der Registerfarben-Strich
// der Arbeitsleiste (`Reiterleiste`), die Aktiv-Marke der Seitenleiste
// (`Sidebar`). Vor R2 färbte jede dieser Stellen mit `brass-*`, also mit der
// GLEICHEN Farbe für alles — die Registerfarbe ist die erste Unterscheidung,
// und sie darf nicht dreimal verschieden hergeleitet werden.
//
// Reine Darstellung (§3), deterministisch (§2): Ableitung aus dem Pfad-Präfix,
// Beschriftung und Ziel aus der Navigations-SSoT `lib/navigation.ts` — kein
// zweitgepflegter Bereichs-Katalog.

/** Die vier Registerfarben aus `index.css` (R1). «Werkzeuge» trägt Rechner UND
 *  Vorlagen — das Referenzbild kennt vier Register, nicht fünf. */
export type Register = 'g' | 'r' | 'm' | 'w';

/** CSS-Variable der Registerfarbe. Tailwind kennt sie als `reg-g|r|m|w`
 *  (tailwind.config.js `colors.reg`); wo eine Inline-Farbe nötig ist (SVG,
 *  `borderBottomColor`), ist DIESE Funktion die Quelle. */
export const registerVar = (r: Register): string => `var(--reg-${r})`;

export interface Bereich {
  /** Beschriftung = der Abschnitts-Titel der Navigations-SSoT. */
  label: string;
  /** Ziel = das Abschnitts-Ziel der Navigations-SSoT. */
  ziel: string;
  /** Pfad-Präfix, unter dem alles zu diesem Bereich gehört. */
  praefix: string;
  register: Register;
}

/** Register je Navigations-Abschnitt. Die Titel stammen aus `NAVIGATION`
 *  (SSoT) — steht dort ein Abschnitt ohne Eintrag hier, fehlt er in den
 *  Bereichs-Reitern, statt still in einer falschen Farbe zu erscheinen. */
const REGISTER_JE_TITEL: Record<string, Register> = {
  Gesetze: 'g',
  Rechtsprechung: 'r',
  Materialien: 'm',
  Rechner: 'w',
  Vorlagen: 'w',
};

/** Die Bereichs-Reiter der Titelblatt-Zeile, in der Ordnung der Navigation. */
export const BEREICHE: Bereich[] = NAVIGATION.flatMap((a) => {
  if (!a.titel || !a.ziel) return [];
  const register = REGISTER_JE_TITEL[a.titel];
  if (!register) return [];
  return [{ label: a.titel, ziel: a.ziel, praefix: a.ziel, register }];
});

/** Bereich eines Pfades — oder null (Start, Meta-Seiten, Unbekanntes). */
export function bereichVonPfad(pfad: string): Bereich | null {
  const p = pfad.split('?')[0].split('#')[0];
  for (const b of BEREICHE) {
    if (p === b.praefix || p.startsWith(`${b.praefix}/`)) return b;
  }
  return null;
}

/** Registerfarbe eines Pfades — null, wo keine Zuordnung besteht (dann trägt
 *  die Marke die Tinte, nie eine geratene Farbe). */
export function registerVonPfad(pfad: string): Register | null {
  return bereichVonPfad(pfad)?.register ?? null;
}

/** Tailwind-Klasse für den Registerfarben-Strich (Unterkante/Randmarke). */
export const REG_RAND: Record<Register, string> = {
  g: 'border-reg-g', r: 'border-reg-r', m: 'border-reg-m', w: 'border-reg-w',
};
/** Tailwind-Klasse für die Registerfarben-Fläche (2-px-Marke, nie unter Text). */
export const REG_FLAECHE: Record<Register, string> = {
  g: 'bg-reg-g', r: 'bg-reg-r', m: 'bg-reg-m', w: 'bg-reg-w',
};
