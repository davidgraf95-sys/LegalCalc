import { useState, type ReactNode } from 'react';
import { KANTONE_KARTE } from '../data/kantoneKarte';

// Soft, gut unterscheidbare Füllfarbe je Kanton: Goldwinkel-Streuung über den
// Farbkreis → benachbarte Kantone bekommen verschiedene Farbtöne. Gedämpft
// (Pastell), damit es zum Papier-Look passt; Hover/aktiv vertiefen den Ton.
function farbe(i: number, zustand: 'basis' | 'hover' | 'aktiv'): string {
  const h = Math.round((i * 137.508) % 360);
  // Lightness aus Token (--karte-l-*): im Dunkelmodus gedämpft, sonst glühen
  // die Pastelle grell. Farbwinkel/Sättigung bleiben hier (reine Geometrie, §3).
  if (zustand === 'aktiv') return `hsl(${h} 58% var(--karte-l-aktiv))`;
  if (zustand === 'hover') return `hsl(${h} 50% var(--karte-l-hover))`;
  return `hsl(${h} 38% var(--karte-l-basis))`;
}

// Interaktive Schweiz-Karte: jeder Kanton ist ein klickbarer, farblich
// unterscheidbarer Pfad. Hover/Fokus heben hervor UND zeigen den Kantonsnamen
// in der Bildunterschrift; der aktive Kanton ist kräftig markiert. Kantone ohne
// Erlasse sind gedämpft und nicht wählbar. Reine Darstellung (§3).
export function SchweizKarte({ aktiv, onWaehle, nameFuer, verfuegbar, zusatzFuer, className }: {
  aktiv?: string | null;
  onWaehle: (kanton: string) => void;
  nameFuer?: (kanton: string) => string;
  verfuegbar?: (kanton: string) => boolean;
  /** Optionaler Zusatz in der Bildunterschrift des gezeigten Kantons (IA-2:
   *  Erfassungsgrad = Zahl + Zustands-Wort). Nur gerendert, wenn er einen Knoten
   *  liefert — die Karte bleibt sonst generisch (§3). */
  zusatzFuer?: (kanton: string) => ReactNode;
  className?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const codes = Object.keys(KANTONE_KARTE.paths);
  const idx = (k: string) => codes.indexOf(k);
  const name = (k: string) => (nameFuer ? nameFuer(k) : k);
  // Cowork-Befund 40 (18.8.2026): die Liste wurde FRÜHER hier nach
  // aktiv/hover sortiert (Kommentar unten war «Aktiven/gehoverten Kanton
  // zuletzt zeichnen»), damit sein Rand nicht von Nachbarn überdeckt wird.
  // Das reordnete aber die INTERAKTIVEN <path>-Elemente noch VOR dem Klick —
  // schon `onMouseEnter` (das jede reale Zeigergeste vor dem Klick auslöst)
  // löste den Re-Render/Reorder aus. Trifft der Mausklick dann denselben
  // Bildschirmpunkt, kann `mousedown`/`mouseup` durch die geänderte
  // Maler-Reihenfolge auf verschiedene Elemente fallen — der Browser liefert
  // dann GAR KEIN `click` an den Pfad (Ziel-Divergenz), und erst der ZWEITE
  // Klick (Reorder bereits stabil) traf. Reproduziert 18.8.2026 (echtes
  // Hover-dann-Klick-Gesten-Muster via Playwright: 1. Klick wirkungslos, 2.
  // Klick setzt `kt=`; ein Klick OHNE vorherige Zeigerbewegung traf sofort).
  // Fix: fixe Grund-Reihenfolge (keine Sortierung mehr) — der Hervorhebungs-
  // Rand kommt stattdessen über einen SEPARATEN, nicht-interaktiven Overlay-
  // Pfad ganz am Ende (unten), der nur zeichnet, nie einen Klick fängt.
  const eintraege = Object.entries(KANTONE_KARTE.paths);
  const gezeigt = hover ?? aktiv ?? null;
  const gezeigtPfad = gezeigt ? KANTONE_KARTE.paths[gezeigt] : undefined;
  const gezeigtIst = gezeigt !== null && aktiv === gezeigt;
  const gezeigtWaehlbar = gezeigt !== null && (verfuegbar ? verfuegbar(gezeigt) : true);
  return (
    <div className={className ?? 'w-full max-w-[40rem] mx-auto'}>
      {/* Bildunterschrift: zeigt, was unter dem Zeiger/Fokus liegt. */}
      <div className="mb-2 flex items-baseline gap-2 min-h-[1.5rem]" aria-live="polite">
        {gezeigt ? (
          <>
            <span className="text-body-s font-semibold text-ink-900">{name(gezeigt)}</span>
            <span aria-hidden className="num text-xs text-ink-500">{gezeigt}</span>
            {verfuegbar && !verfuegbar(gezeigt)
              ? <span className="text-xs text-ink-500">— keine Erlasse</span>
              : zusatzFuer?.(gezeigt)}
          </>
        ) : (
          <span className="text-xs text-ink-500">Kanton auf der Karte wählen</span>
        )}
      </div>
      <svg viewBox={KANTONE_KARTE.viewBox} role="group" aria-label="Karte der Schweizer Kantone — Kanton wählen"
        className="w-full h-auto">
        {eintraege.map(([k, d]) => {
          const ist = aktiv === k;
          const waehlbar = verfuegbar ? verfuegbar(k) : true;
          const ueber = hover === k;
          // Nicht-wählbare Kantone: sichtbares Linien-Token statt --paper-sunken
          // (das mit dem Hintergrund verschmolz) — als gedämpfte Landmasse erkennbar.
          const fill = !waehlbar ? 'var(--line-strong)'
            : ist ? farbe(idx(k), 'aktiv')
            : ueber ? farbe(idx(k), 'hover')
            : farbe(idx(k), 'basis');
          return (
            <path key={k} d={d}
              onClick={waehlbar ? () => onWaehle(k) : undefined}
              onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover((h) => (h === k ? null : h))}
              onFocus={() => setHover(k)} onBlur={() => setHover((h) => (h === k ? null : h))}
              onKeyDown={waehlbar ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWaehle(k); } } : undefined}
              tabIndex={waehlbar ? 0 : -1} role="button" aria-pressed={ist}
              aria-label={waehlbar ? name(k) : `${name(k)} — keine Erlasse`}
              style={{ fill, stroke: ist ? 'var(--brass-700)' : 'var(--paper)', strokeWidth: ist ? 1.6 : 0.8, opacity: waehlbar ? 1 : 0.8 }}
              className={`transition-[fill] ${waehlbar ? 'cursor-pointer' : 'cursor-default'}`}>
              <title>{name(k)}</title>
            </path>
          );
        })}
        {/* Nicht-interaktiver Overlay-Pfad: zeichnet den gerade hervorgehobenen
            Kanton (Hover/aktiv) EIN zweites Mal obenauf, damit sein Rand nicht
            von Nachbarn überdeckt wird — ohne dafür die interaktiven Pfade
            oben umzusortieren (Befund 40). `pointerEvents="none"`: fängt
            selbst nie einen Klick, auch nicht bei überlappenden Rand-Pixeln. */}
        {gezeigtPfad && (
          <path d={gezeigtPfad} aria-hidden pointerEvents="none"
            style={{
              fill: !gezeigtWaehlbar ? 'var(--line-strong)' : farbe(idx(gezeigt as string), gezeigtIst ? 'aktiv' : 'hover'),
              stroke: gezeigtIst ? 'var(--brass-700)' : 'var(--paper)',
              strokeWidth: gezeigtIst ? 1.6 : 0.8,
              opacity: gezeigtWaehlbar ? 1 : 0.8,
            }}
            className="transition-[fill]" />
        )}
      </svg>
    </div>
  );
}
