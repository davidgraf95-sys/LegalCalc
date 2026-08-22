import type { ZuletztEintrag } from '../../lib/zuletztVerwendet';
import { suchOptionId } from './suchOptionId';
import type { FlacherTreffer } from './trefferAuswahl';

// ─── Nicht-Komponenten-Teil von SucheLeerzustand.tsx ────────────────────────
//
// Ausgelagert (react-refresh/only-export-components) — dieselbe Datei mischte
// Konstante/Helfer und die Komponente selbst, was Fast Refresh bricht. Muster
// wie `InhaltsKopfKontext.ts` neben `InhaltsKopf.tsx`: Verhalten byte-gleich,
// nur der Ort wechselt.
//
// Kuratierte Einstiege = stabile Übersichts-Routen (reine Navigation, keine
// Rechtswerte, §13): der schnelle Sprung in die vier Korpus-Rubriken + Rechner.

export const EINSTIEGE: ReadonlyArray<{ route: string; label: string }> = [
  { route: '/gesetze', label: 'Gesetze' },
  { route: '/rechtsprechung', label: 'Rechtsprechung' },
  { route: '/materialien', label: 'Materialien' },
  { route: '/rechner', label: 'Rechner' },
  { route: '/vorlagen', label: 'Vorlagen' },
];

// Cowork-Befund 38 (21.8.2026): der Leerzustand rendere früher jede Zeile als
// echten `<Link>` — ein Tastatur-Nutzer, der per Tab ins Suchfeld gelangt,
// musste danach bis zu 9× Tab drücken (5 Verlauf- + 5 Einstieg-Zeilen), bis der
// Fokus das Suchfeld-Widget verliess (WCAG 2.1.2 nahe Tastaturfalle — erst Escape
// löste zuverlässig). Fix: dasselbe Listbox/Options-Muster wie SuchResultate.tsx
// (role=option, Pfeiltasten + Enter über die STEUERNDE Eingabe, Tab verlässt das
// Feld sofort). `leerOptionen` liefert die dazu passende flache Options-Liste —
// dieselben generischen Helfer (aktivePosition/naechsterKey/…, trefferAuswahl.ts)
// wie die Trefferliste, nur mit eigenem Gruppen-Namensraum («verlauf»/«einstieg»).
export function leerOptionen(verlauf: ZuletztEintrag[], listboxId: string): FlacherTreffer[] {
  return [
    ...verlauf.map((e) => ({ oid: suchOptionId(listboxId, 'verlauf', e.route), href: e.route })),
    ...EINSTIEGE.map((e) => ({ oid: suchOptionId(listboxId, 'einstieg', e.route), href: e.route })),
  ];
}
