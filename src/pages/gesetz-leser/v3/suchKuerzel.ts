import { useEffect, type RefObject } from 'react';

// ─── ⌘K / «/» im V3-Leser · Vorrang vor der Header-Suche (Bug-Check B1) ──────
//
// GEFUNDEN 16.8.2026 (Bug-Check zu H1): `SuchSprungFeld` und
// `components/layout/HeaderSuche.tsx` hörten BEIDE auf `window`-keydown. Der
// Header öffnete sein Dropdown synchron, V3 holte den Fokus einen Frame später
// per `requestAnimationFrame` — Ergebnis: das Dropdown der globalen Suche stand
// offen über der Lesefläche, während der Cursor im Leser-Feld blinkte. Zwei
// Empfänger für EINE Absicht (§5, derselbe Fehlertyp wie K2).
//
// DIE VORRANGREGEL, in einem Satz: Im V3-Leser gewinnt das Such-/Sprungfeld.
// Technisch: dieser Listener hängt in der CAPTURE-Phase am `window` und ruft
// dort `preventDefault()`; `HeaderSuche` prüft am Kopf seines Handlers
// `event.defaultPrevented` und schweigt dann. Capture am `window` läuft vor
// jeder Bubble-Registrierung desselben Fensters — die Reihenfolge hängt also
// nicht daran, welche Komponente zuerst montiert wurde.
//
// WARUM EIGENES MODUL UND NICHT IM FELD: das Feld ist nicht immer im DOM. Ab
// 1024 px mit ZUGEKLAPPTER Gliederungsspalte (`tocOffen=false`) rendert der
// Rahmen weder Spalte noch Sheet — mit dem Listener im Feld tat ⌘K in genau
// dieser Lage gar nichts. Das Kürzel ist eine Zusage des RAHMENS, nicht des
// Feldes: es muss die Fläche erst öffnen und dann fokussieren. Eigene Datei
// statt Export neben der Komponente, weil `react-refresh/only-export-components`
// (Tor `lint`) in einer Komponenten-Datei keinen zweiten Export duldet.

/** Tippt der Nutzer gerade in ein Feld? Dann ist «/» ein Zeichen, kein Kürzel.
 *  ⌘K/Ctrl-K greift auch dort — es ist der Einstieg von überall. */
function inEingabe(ziel: EventTarget | null): boolean {
  const el = ziel as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const t = el.tagName.toLowerCase();
  return t === 'input' || t === 'textarea' || t === 'select' || el.isContentEditable === true;
}

/** Die ENTSCHEIDUNG, getrennt vom Vollzug: beansprucht der V3-Leser diesen
 *  Tastendruck? Rein und DOM-frei, damit die Vorrangregel an jeder Kombination
 *  prüfbar ist statt nur an den zweien, die ein e2e zufällig drückt (§2, §6.7).
 *  Nimmt bewusst ein Struktur-Literal und kein `KeyboardEvent` — Vitest läuft
 *  hier in `environment: 'node'`. */
export function istSuchKuerzel(e: {
  key: string; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean; target?: EventTarget | null;
}): boolean {
  if (e.altKey) return false;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') return true;
  return e.key === '/' && !e.metaKey && !e.ctrlKey && !inEingabe(e.target ?? null);
}

export function useSuchSprungKuerzel({ feldRef, onKuerzel }: {
  /** Ziel des Fokus. Darf beim Tastendruck noch `null` sein — siehe unten. */
  feldRef: RefObject<HTMLInputElement | null>;
  /** Läuft VOR dem Fokus: öffnet die Fläche, in der das Feld steht (Spalte
   *  @≥1024 px bzw. Bottom-Sheet darunter). */
  onKuerzel: () => void;
}) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (!istSuchKuerzel(e)) return;
      // Muss VOR `onKuerzel` stehen: die Vorrangregel gilt auch dann, wenn das
      // Öffnen der Fläche wirft oder nichts zu tun hat.
      e.preventDefault();
      onKuerzel();
      // Nach dem Öffnen existiert das Feld erst nach dem React-Commit —
      // der Fokus wird darum nachgereicht statt sofort versucht.
      requestAnimationFrame(() => feldRef.current?.focus());
    };
    window.addEventListener('keydown', taste, { capture: true });
    return () => window.removeEventListener('keydown', taste, { capture: true });
  }, [onKuerzel, feldRef]);
}
