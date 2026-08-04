import { parseISO } from 'date-fns';
import { formatDatum } from '../../lib/datumsUtils';
import type { Einheit } from '../../lib/allgemeineFrist';

// ─── Beschriftungs-Tabellen des einfachen Fristenrechners ──────────────────
//
// Wörtlich aus `EinfacheFristForm.tsx` herausgelöst (W2·10-UI-NAV-Z1,
// §9-Bug-Check M-1). Grund ist NICHT Kosmetik: der ICS-Titel muss dieselben
// Wörter tragen wie das Formular (§5, EINE Quelle je Fachinhalt), und eine
// Nicht-Komponente darf in einer `.tsx`-Komponentendatei nicht mit exportiert
// werden (react-refresh/only-export-components — Fast Refresh bräche sonst).
// Beide Tabellen sind unverändert übernommen, Kommentare inklusive; keine
// Rechtslogik (§3), reine Beschriftung.

export type Ferien = 'keine' | 'zpo' | 'schkg' | 'vwvg' | 'bgg';

export const FERIEN_OPTIONEN: { code: Ferien; label: string; sub: string }[] = [
  // Bug-Check §9 (fachliche Lupe, MITTEL): Samstag-Verschiebung folgt dem
  // Fristengesetz (SR 173.110.3, eidg. Recht) — bei reinen Vertragsfristen
  // nicht zwingend; der Rechenweg nennt den Verschiebegrund.
  { code: 'keine', label: 'Keine Ferien', sub: 'Vertrags-/Gesetzesfrist (Art. 77/78 OR) – Verschiebung bei Sa/So/Feiertag (Sa nach Fristengesetz; bei reinen Vertragsfristen nicht zwingend – im Zweifel vorher handeln)' },
  { code: 'zpo', label: 'Gerichtsferien (ZPO)', sub: 'Stillstand nach Art. 145 ZPO – Annahme: ordentliches Verfahren, gesetzliche Frist' },
  // Bug-Check §9 (fachliche Lupe, MITTEL): präzise Art.-63-Kurzform —
  // dritter TAG NACH Ferienende, Sa/So/Feiertage nicht mitgezählt.
  { code: 'schkg', label: 'Betreibungsferien (SchKG)', sub: 'Art. 56/63 SchKG – Fristende in den Ferien → Verlängerung bis zum 3. Tag nach Ferienende (Sa/So/Feiertage zählen nicht)' },
  // Verwaltungs-/BGG-Stillstand (13.6.2026): gleiche drei Perioden wie die ZPO,
  // ABER nur für nach Tagen bestimmte Fristen (Wochen/Monate/Jahre stehen nicht
  // still) – die Engine legt das offen.
  { code: 'vwvg', label: 'Verwaltungs-Stillstand (VwVG)', sub: 'Art. 22a VwVG – Stillstand (Ostern ± 7 · 15.7.–15.8. · 18.12.–2.1.) nur für nach Tagen bestimmte Fristen; nicht bei vorsorglichen Massnahmen / öffentlichen Beschaffungen' },
  { code: 'bgg', label: 'BGG-Stillstand (Bundesgericht)', sub: 'Art. 46 BGG – Stillstand (gleiche drei Perioden) nur für nach Tagen bestimmte Fristen; Ausnahmen nach Abs. 2 (vorsorgliche Massnahmen, Wechselbetreibung, Stimmrecht …)' },
];

export const EINHEITEN: { code: Einheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'wochen', label: 'Wochen' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

/**
 * Kalender-Titel des Schnell-/Tagerechners (W2·10-UI-NAV-Z1, §9-Bug-Check M-1).
 *
 * WARUM nicht einfach «Fristende»: `icsExport.ts` bildet die UID als
 * `frist-<endtag>-<token(summary)>`. Ein KONSTANTER Titel macht die UID damit
 * allein vom Enddatum abhängig — zwei fachlich verschiedene Fristen mit
 * demselben Endtag (etwa dieselbe Dauer einmal ohne Ferien, einmal unter
 * ZPO-Gerichtsferien — beide enden am 11.6.2026) erhalten dieselbe UID, und der
 * Kalender überschreibt den ersten Eintrag beim Import des zweiten STUMM
 * (RFC 5545 §3.8.4.7 verlangt eindeutige UIDs). Das ist exakt die in
 * `icsExport.ts` dokumentierte Fehlerklasse M-1 vom 7.6.2026 — dort löste sie
 * das Aktenzeichen auf, das dieser Rechner nicht führt. Der Diskriminator kommt
 * deshalb aus der Eingabe selbst: Dauer, Einheit, Startdatum und Regime.
 *
 * §5: Einheiten- und Regime-Wort stammen aus DENSELBEN Tabellen, die auch das
 * Formular beschriften — keine zweite Wortquelle. §3: reine Beschriftung, kein
 * Rechenschritt. Rein und deterministisch (§2).
 */
export function icsTitelSchnellrechner(start: string, laenge: number, einheit: Einheit, ferien: Ferien): string {
  const einheitWort = EINHEITEN.find((e) => e.code === einheit)?.label ?? einheit;
  const regimeWort = FERIEN_OPTIONEN.find((o) => o.code === ferien)?.label ?? ferien;
  return `Fristende – ${laenge} ${einheitWort} ab ${formatDatum(parseISO(start))} · ${regimeWort}`;
}
