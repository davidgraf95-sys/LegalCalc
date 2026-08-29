import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { merkeTab } from '../lib/tabs';
import { labelAusMeta } from '../lib/verlaufLabel';
import { kanonisierePfad } from '../lib/normtext/erlassAdresse';

// Unsichtbarer Tracker in App.tsx: öffnet einen Reiter NUR für ein KONKRETES
// Inhalts-Item (Auftrag David) — ein bestimmter Rechner/Engine, ein bestimmtes
// Gesetz, eine bestimmte Vorlage oder ein konkreter Entscheid (zweite Pfadebene
// unter einer Inhalts-Rubrik). Übersichts-/Rubrik-Seiten (`/gesetze`, `/rechner`,
// `/rechtsprechung`, `/vorlagen`), die Startseite und Info-Seiten öffnen KEINEN
// Reiter — ein blosser Seitenleisten-Klick soll nicht jedes Mal einen Tab erzeugen.
// Reines localStorage-Schreiben (§3).
const INHALT_ITEM = /^\/(rechner|vorlagen|gesetze|rechtsprechung)\/.+/;

export function TabTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!INHALT_ITEM.test(pathname)) return;
    // pathname + ?search: der Instanz-Diskriminator ?r=<n> (dasselbe Gesetz
    // mehrfach offen, Auftrag David) gehört zur Reiter-Identität; merkeTab/
    // tabSchluessel ignorieren übrige Query-Parameter für die Dedup-Identität.
    // KANONISIERT (Gegenprüfung 29.8.2026, Mangel 2): dieser Effekt läuft VOR
    // dem Umzugs-Sprung im Leser — bei einer Alt-Adresse merkte er darum erst
    // `/gesetze/bund/CISG` und gleich danach `/gesetze/international/CISG`, also
    // zwei Reiter für EIN Gesetz, einer davon tot. Gemerkt wird die kanonische
    // Adresse; ein Alt-Link erzeugt damit denselben Reiter wie der neue.
    merkeTab(kanonisierePfad(pathname) + search, labelAusMeta(pathname) ?? undefined);
  }, [pathname, search]);
  return null;
}
