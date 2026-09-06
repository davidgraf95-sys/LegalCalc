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

// ─── R3-F8 (Prüfbefund 6.9.2026) · DIE SAMMLUNG IST AUCH EIN REITER ─────────
//
// Auf «/» trug das Titelblatt keine Aktivmarke: die fünf Bereichs-Reiter
// beschreiben allesamt Unterbereiche, und die Startseite gehört zu keinem.
// Das Referenzbild (`abnahme/design-identitaet/vorschlag-freigegeben.html`)
// markiert dort «Sammlung» — der Kopf sagt also auf JEDER Route, wo man ist.
//
// BEWUSST NICHT IN `BEREICHE`: dessen Einträge tragen ein Pfad-PRÄFIX, und das
// Präfix «/» würde in `bereichVonPfad` auf jeden Pfad passen und die vier
// Registerfarben überschreiben. Die Startseite ist auch kein Register, sondern
// das Titelblatt — sie trägt darum die Tinte (`--rule`) als Aktivmarke, keine
// Registerfarbe.
export const START_REITER = { label: 'Sammlung', ziel: '/' } as const;

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

// ─── R2-NACHZUG (Befunde F2/F9, 6.9.2026) · die Farbe darf ANFASSBAR sein ────
//
// Bis hierher trug die Registerfarbe nur den AKTIVEN Zustand: der Hover-Strich
// der Bereichs-Reiter war `rule-soft`, die Hover-Marke der Seitenleisten-Blätter
// ebenso, und der aktive Reiter der Arbeitsleiste unterschied sich um vier
// Helligkeitseinheiten (`paper-raised` 255 gegen `paper` 251). David 6.9.2026:
// «nicht trist» — die Registerfarben sollen an Reitern, beim Hover und an den
// Gruppenköpfen SICHTBAR sein. Die vier Tabellen unten sind je EIN Ort dafür
// (§5); Tailwind braucht die Klassennamen literal, darum Tabellen statt
// Zeichenkettenbau.
//
// Kontrast: alle vier Werte sind NICHT-TEXT-Flächen (2-px-Striche, 10-%-Tönung)
// — sie tragen keine Information allein (Position/Beschriftung tun das) und
// unterliegen darum nicht 1.4.3. Der Text darauf bleibt `ink-*` auf Papier.

/** Hover-Strich in der Registerfarbe des ZIELS (Bereichs-Reiter der
 *  Titelblatt-Zeile). Abgesetzt vom aktiven Zustand durch die Deckkraft. */
export const REG_RAND_HOVER: Record<Register, string> = {
  g: 'hover:border-reg-g/40', r: 'hover:border-reg-r/40',
  m: 'hover:border-reg-m/40', w: 'hover:border-reg-w/40',
};
/** Hover-Marke eines Seitenleisten-Blattes (Gruppe `blatt`). */
export const REG_HOVER_FLAECHE_BLATT: Record<Register, string> = {
  g: 'group-hover/blatt:bg-reg-g', r: 'group-hover/blatt:bg-reg-r',
  m: 'group-hover/blatt:bg-reg-m', w: 'group-hover/blatt:bg-reg-w',
};
/** Hover-Strich eines inaktiven Reiters der Arbeitsleiste (Gruppe `reiter`). */
export const REG_HOVER_FLAECHE_REITER: Record<Register, string> = {
  g: 'group-hover/reiter:bg-reg-g', r: 'group-hover/reiter:bg-reg-r',
  m: 'group-hover/reiter:bg-reg-m', w: 'group-hover/reiter:bg-reg-w',
};
/** Leichte Tönung der Fläche in der Registerfarbe — der aktive Reiter. */
export const REG_TON: Record<Register, string> = {
  g: 'bg-reg-g/10', r: 'bg-reg-r/10', m: 'bg-reg-m/10', w: 'bg-reg-w/10',
};
