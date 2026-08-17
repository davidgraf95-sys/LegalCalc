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

/**
 * A3 (H2b-Nachzug) — WELCHES PANE beansprucht den Tastendruck?
 *
 * BEFUND, gemessen 17.8.2026 im Split @1600 (BGFA | BGBM, `?leser=v3`): seit Ä19
 * hat JEDES Pane ein Suchfeld, also läuft dieser Hook zweimal und hängt zwei
 * `window`-Listener in derselben Capture-Phase. Beide beanspruchten den
 * Tastendruck, beide reichten Fokus nach — der zuletzt registrierte gewann.
 * Gemessen: Fokus im primären Pane, ⌘K ⇒ Fokus landete im SEKUNDÄREN Feld
 * (`imPrimaer:false, imSekundaer:true`), und ebenso, wenn er schon sekundär war.
 * Das Kürzel bediente damit nie das Pane, in dem der Leser arbeitet.
 *
 * REGEL: der Tastendruck gehört dem Pane, in dem `document.activeElement` steht.
 * Steht der Fokus in KEINEM Pane (Body, Topbar, Krume), gewinnt das primäre —
 * das ist die Fläche, die der Leser sieht, wenn er noch nichts gewählt hat.
 * Rein DOM-lesend, ohne Zustand: die Entscheidung fällt beim Tastendruck, nicht
 * beim Registrieren (sonst wäre sie beim Pane-Wechsel veraltet).
 */
function tastendruckGehoertMir(imSekundaerenPane: boolean): boolean {
  if (typeof document === 'undefined') return !imSekundaerenPane;
  const ziel = document.activeElement as Element | null;
  const fokusPane = ziel?.closest?.('[data-pane]')?.getAttribute('data-pane') ?? null;
  // Kein Pane unter dem Fokus ⇒ Fallback primär (auch in der Einzelansicht, wo
  // es überhaupt kein `[data-pane]` gibt: dort ist `imSekundaerenPane` false).
  return (fokusPane === 'sekundaer') === imSekundaerenPane;
}

export function useSuchSprungKuerzel({ feldRef, onKuerzel, imSekundaerenPane = false }: {
  /** Ziel des Fokus. Darf beim Tastendruck noch `null` sein — siehe unten. */
  feldRef: RefObject<HTMLInputElement | null>;
  /** Läuft VOR dem Fokus: öffnet die Fläche, in der das Feld steht.
   *
   *  §17-RÜCKBAU (H2b-Nachzug): SEIT Ä19/A2 braucht es das nicht mehr — das Feld
   *  ist in JEDER Lage im DOM (Spalte · klebende Kopf-Zone · offenes Blatt), und
   *  `e2e/leser-v3-suche-sprung.e2e.ts` (e) verlangt ausdrücklich, dass ⌘K die
   *  Gliederungsspalte NICHT aufzieht. Der Rahmen setzt die Prop darum nicht
   *  mehr; sie bleibt als Erweiterungspunkt für eine Fläche, die es heute nicht
   *  gibt — ein Aufrufer, der sein Feld erst bauen muss, hätte hier den Ort. */
  onKuerzel?: () => void;
  /** A3 — Rolle des Panes, in dem dieser Leser steckt. Vorgabe `false` deckt die
   *  Einzelansicht und das primäre Pane; nur der sekundäre Leser setzt `true`. */
  imSekundaerenPane?: boolean;
}) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (!istSuchKuerzel(e)) return;
      // A3: erst die Zuständigkeit, dann alles andere — ein fremdes Pane darf
      // weder `preventDefault` rufen noch Fokus ziehen.
      if (!tastendruckGehoertMir(imSekundaerenPane)) return;
      // Muss VOR `onKuerzel` stehen: die Vorrangregel gilt auch dann, wenn das
      // Öffnen der Fläche wirft oder nichts zu tun hat.
      e.preventDefault();
      onKuerzel?.();
      // Nach dem Öffnen existiert das Feld erst nach dem React-Commit —
      // der Fokus wird darum nachgereicht statt sofort versucht.
      requestAnimationFrame(() => feldRef.current?.focus());
    };
    window.addEventListener('keydown', taste, { capture: true });
    return () => window.removeEventListener('keydown', taste, { capture: true });
  }, [onKuerzel, feldRef, imSekundaerenPane]);
}
