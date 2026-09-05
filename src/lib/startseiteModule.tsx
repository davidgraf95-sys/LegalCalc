// ─── Modul-Registry der Startseite (Startseite V4, FAHRPLAN §2/§3) ──────────
//
// Reine Darstellungs-Deklaration (§3): welche Module in welcher Reihenfolge die
// Startseite komponiert. Katalog bleibt startseiteConfig.ts, Rubriken bleiben
// navigation.ts (§5). OHNE `sichtbar()` — SSR-Determinismus ist nicht
// garantierbar (Council-Auflage 3); Leerzustände gehören INS Modul (jedes Modul
// rendert selbst nichts, wenn es nichts anzuzeigen hat).
//
// Bewusste FUNDAMENT-Vorleistung auf den «Startseiten-Modul-Rahmen»
// (FAHRPLAN-FUNDAMENT-UMBAU), kein Selbstzweck — NICHT weiter abstrahieren
// (keine Sichtbarkeits-/Layout-Logik ins Registry ziehen).
//
// V4 (W2·23-STARTSEITE-V4, 5.9.2026) ändert AUSSCHLIESSLICH diese Liste, nicht
// den Rahmen: «Zuletzt verwendet» rückt direkt unter den Hero (Wiederkehrer
// zuerst), «Gesetze — Bund und Kantone» kommt als eigene Schwerpunkt-Sektion
// dazu, der Tab-Kasten «Schnellrechner» weicht der schlanken Sektion
// «Werkzeuge», und die Landkarte heisst «Weitere Bereiche», weil Gesetze
// eine Zeile höher stehen.

import type React from 'react';
import { Hero } from '../components/start/Hero';
import { GesetzeBlock } from '../components/start/GesetzeBlock';
import { Werkzeuge } from '../components/start/Werkzeuge';
import { RubrikKacheln } from '../components/start/RubrikKacheln';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { NewsHeader } from '../components/start/NewsHeader';
import { VertrauensFuss } from '../components/start/VertrauensFuss';

type StartModulId =
  | 'hero' | 'zuletzt' | 'gesetze' | 'werkzeuge' | 'rubriken' | 'news' | 'vertrauen';

export interface StartModul {
  id: StartModulId;
  /** Sektionstitel (Seclabel/H2); undefined = ohne Rubriktrenner (Hero) */
  titel?: string;
  /** MUSS beim Prerender synchron rendern (prerender.ts verbietet Suspense-Reste) — KEINE Lazy-Loader im Registry */
  Komponente: React.ComponentType;
  /** benanntes CLS-Token für async-/localStorage-Module */
  minHoeheKlasse?: string;
}

// Reihenfolge = §2 (Hero → Zuletzt → Gesetze → Werkzeuge → Weitere Bereiche →
// Jüngste Entscheide → Vertrauen).
export const START_MODULE: readonly StartModul[] = [
  // Hero: kein Rubriktrenner (self-verwaltend, eigene H1) — trägt Begrüssung,
  // Value Proposition, die EINE Suche und die Beispiel-Chips.
  { id: 'hero', Komponente: Hero },
  // Zuletzt trägt bewusst KEIN `titel`/`minHoeheKlasse`: Sektionstitel («Zuletzt
  // verwendet»), Höhen-Reservierung UND Vollkollaps bei leerem Speicher liegen INS
  // Modul verlagert (S4, Council «nie Titel über Leerraum», wie NewsHeader in S3).
  // V4: steht direkt unter dem Hero — wer wiederkommt, sieht sein Zeug zuerst.
  { id: 'zuletzt', Komponente: ZuletztVerwendet },
  // Der Schwerpunkt (Auftrag David 5.9.2026): Bund · Kantone · International.
  { id: 'gesetze', titel: 'Gesetze — Bund und Kantone', Komponente: GesetzeBlock },
  { id: 'werkzeuge', titel: 'Werkzeuge', Komponente: Werkzeuge },
  { id: 'rubriken', titel: 'Weitere Bereiche', Komponente: RubrikKacheln },
  // News ebenso selbst-verwaltend (S3-Fix Leerzustand-Doppelpfad, §3 #6) — titellos.
  { id: 'news', Komponente: NewsHeader },
  // Vertrauens-Fuss: kein Rubriktrenner, kein async-Zustand → titellos, statisch.
  { id: 'vertrauen', Komponente: VertrauensFuss },
];
