// ─── Modul-Registry der Startseite (FAHRPLAN-STARTSEITE §2/§3) ──────────────
//
// Reine Darstellungs-Deklaration (§3): welche Module in welcher Reihenfolge die
// Startseite komponiert. Katalog bleibt startseiteConfig.ts, Rubriken bleiben
// navigation.ts (§5). OHNE `sichtbar()` — SSR-Determinismus ist nicht
// garantierbar (Council-Auflage 3); Leerzustände gehören INS Modul (jedes Modul
// rendert selbst nichts, wenn es nichts anzuzeigen hat).
//
// W2·24-DESIGN-IDENTITAET R3 (6.9.2026, DEKLARIERTE fachliche Änderung, kein
// Refactoring): die Startseite ist das INHALTSVERZEICHNIS der Sammlung
// geworden (Referenzbild `abnahme/design-identitaet/vorschlag-freigegeben.html`,
// Seite «Startseite»). Drei Folgen für dieses Registry:
//
//  1. Jedes Modul rendert seine eigene SATZSPIEGEL-ZEILE (`start/Satzspiegel`
//     `StartZeile`): links die Marginalie (Registerfarben-Strich · Bereich ·
//     Zahl mit Scope), rechts Titel und Inhalt. Titel und Höhen-Reservierung
//     liegen damit vollständig IM Modul — die Seite trägt nur noch das Raster.
//     Der frühere `titel`/`minHoeheKlasse`-Vertrag entfällt ersatzlos; er hätte
//     die Marginalie nicht ausdrücken können und wäre neben ihr eine zweite,
//     halbe Wahrheit gewesen (§5).
//  2. «Zuletzt verwendet» ist kein eigenes Modul mehr, sondern die
//     Verweiszeile der Titelblatt-Zeile (Referenzbild `.unter`) — eine eigene
//     Zeile hätte im Satzspiegel bei leerem Speicher eine leere Marginalie
//     hinterlassen.
//  3. Die Landkarte aus Rubrik-Kacheln (`RubrikKacheln`) ist GESTRICHEN: die
//     vier Bereiche stehen als Reiter in der Titelblatt-Zeile (R2), ihre
//     Bestände als Listen hier. `GesetzeBlock`/`GesetzeChips` sind in
//     `SystematikListe` + `KantoneRaster` aufgegangen, `NewsHeader` in
//     `EntscheideListe`.

import type React from 'react';
import { Hero } from '../components/start/Hero';
import { SystematikListe } from '../components/start/SystematikListe';
import { KantoneRaster } from '../components/start/KantoneRaster';
import { EntscheideListe } from '../components/start/EntscheideListe';
import { MaterialienListe } from '../components/start/MaterialienListe';
import { Werkzeuge } from '../components/start/Werkzeuge';
import { VertrauensFuss } from '../components/start/VertrauensFuss';

type StartModulId =
  | 'hero' | 'bundesrecht' | 'kantone' | 'rechtsprechung' | 'materialien' | 'werkzeuge' | 'schluss';

export interface StartModul {
  id: StartModulId;
  /** MUSS beim Prerender synchron rendern (prerender.ts verbietet Suspense-Reste) — KEINE Lazy-Loader im Registry */
  Komponente: React.ComponentType;
}

// Reihenfolge = das Inhaltsverzeichnis der Sammlung: Titelblatt → Gesetze
// (Bund, Kantone) → Rechtsprechung → Materialien → Werkzeuge → Schluss. Sie
// folgt der Register-Ordnung der Navigation (Nachschlagen vor Rechnen), nicht
// einer Vermutung über Beliebtheit.
export const START_MODULE: readonly StartModul[] = [
  { id: 'hero', Komponente: Hero },
  { id: 'bundesrecht', Komponente: SystematikListe },
  { id: 'kantone', Komponente: KantoneRaster },
  { id: 'rechtsprechung', Komponente: EntscheideListe },
  { id: 'materialien', Komponente: MaterialienListe },
  { id: 'werkzeuge', Komponente: Werkzeuge },
  { id: 'schluss', Komponente: VertrauensFuss },
];
