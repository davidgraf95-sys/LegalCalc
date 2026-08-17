import { useCallback, useEffect, useState } from 'react';

// ─── Seitenleisten-Layout (einklappbar + breitenverstellbar, persistent) ─────
//
// Reiner UI-Zustand der Darstellungsschicht (§3 — KEINE Rechtslogik): Breite und
// Eingeklappt-Status der Desktop-Seitenleiste, gespiegelt in localStorage, damit
// die Wahl über Sitzungen/Reloads erhalten bleibt (Auftrag David: Seitenleiste
// während des Gebrauchs ein-/ausklappbar + verstellbar).
//
// SSR/Prerender-sicher: Initialwerte über typeof-window-Guard (Default = offen,
// Standardbreite). Die App ersetzt beim Mount (createRoot render-then-replace),
// hydratisiert also nicht — der erste Client-Render darf direkt aus localStorage
// lesen, ohne Mismatch-Klasse.

const BREITE_KEY = 'lexmetrik-seitenleiste-breite';
const EIN_KEY = 'lexmetrik-seitenleiste-eingeklappt';

/** Grenzen der ziehbaren Breite (px). Standard entspricht dem früheren `w-64`. */
export const BREITE_MIN = 208;
export const BREITE_MAX = 460;
const BREITE_STD = 256;
/** Schrittweite der Tastatur-Verstellung (Pfeiltasten auf dem Ziehgriff). */
export const BREITE_SCHRITT = 16;

function klemme(b: number): number {
  return Math.min(BREITE_MAX, Math.max(BREITE_MIN, Math.round(b)));
}

function ladeBreite(): number {
  if (typeof window === 'undefined') return BREITE_STD;
  const v = Number(window.localStorage.getItem(BREITE_KEY));
  return Number.isFinite(v) && v >= BREITE_MIN && v <= BREITE_MAX ? v : BREITE_STD;
}

// ── Ä1c (LESER-V3 H2b) · «noch nicht gewählt» ist ein eigener Zustand ────────
//
// BEFUND (Ästhetik-Review H1, gemessen 17.8.2026): im Gesetz-Leser stand die
// 256 px breite App-Seitenleiste offen und nahm dem Lesetext ein Sechstel der
// Fensterbreite — obwohl der Leser seine eigene Hauptnavigation (die Gliederung)
// gleich daneben trägt. Verlangt ist: im Leser eingeklappt STARTEN, die
// Nutzerwahl aber respektieren.
//
// Das ging vorher konstruktiv nicht. Der Schreib-Effekt legte bei JEDEM Mount
// `'0'` ab, also auch dann, wenn niemand etwas gewählt hatte — nach dem ersten
// Seitenaufruf war «offen, weil Vorgabe» von «offen, weil gewählt» nicht mehr zu
// unterscheiden, und ein Vorgabewert je Bereich hätte die Wahl überschrieben.
//
// NEU: `null` = keine Wahl. Geschrieben wird nur, was der Nutzer selbst
// umschaltet. Der Vorgabewert kommt vom Aufrufer und darf sich mit dem Bereich
// ändern; sobald einmal umgeschaltet wurde, gewinnt die Wahl überall und für
// immer. Weiterhin reiner UI-Zustand (§3) und Prerender-sicher.
function ladeEingeklappt(): boolean | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(EIN_KEY);
  return v === '1' ? true : v === '0' ? false : null;
}

export interface SeitenleisteLayout {
  breite: number;
  setBreite: (b: number) => void;
  eingeklappt: boolean;
  umschalten: () => void;
}

export function useSeitenleiste({ vorgabeEingeklappt = false }: {
  /** Vorgabe, solange der Nutzer NICHT selbst umgeschaltet hat. Darf sich mit
   *  dem Bereich ändern (im Gesetz-Leser `true`, sonst `false`). */
  vorgabeEingeklappt?: boolean;
} = {}): SeitenleisteLayout {
  const [breite, setBreiteRoh] = useState(ladeBreite);
  const [wahl, setWahl] = useState<boolean | null>(ladeEingeklappt);

  const setBreite = useCallback((b: number) => setBreiteRoh(klemme(b)), []);
  // Umschalten heisst: ab jetzt gibt es eine Wahl. Sie bezieht sich auf das, was
  // gerade zu sehen ist — darum kippt sie den WIRKSAMEN Zustand, nicht die
  // gespeicherte `null`.
  const umschalten = useCallback(
    () => setWahl((w) => !(w ?? vorgabeEingeklappt)),
    [vorgabeEingeklappt],
  );

  useEffect(() => {
    try { window.localStorage.setItem(BREITE_KEY, String(breite)); } catch { /* Speicher gesperrt — Zustand bleibt nur für die Sitzung */ }
  }, [breite]);
  useEffect(() => {
    // NUR eine echte Wahl wird abgelegt. Ohne Wahl bleibt der Schlüssel
    // ungeschrieben — genau daran erkennt der nächste Aufruf, dass er den
    // Vorgabewert seines Bereichs nehmen darf.
    if (wahl === null) return;
    try { window.localStorage.setItem(EIN_KEY, wahl ? '1' : '0'); } catch { /* s. o. */ }
  }, [wahl]);

  return { breite, setBreite, eingeklappt: wahl ?? vorgabeEingeklappt, umschalten };
}
