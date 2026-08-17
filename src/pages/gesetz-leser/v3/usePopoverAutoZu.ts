import { useEffect, useRef, type RefObject } from 'react';
import { useDialogFokus } from '../../../components/layout/useDialogFokus';

// ─── EIN Auto-Zu für alle aufziehbaren Flächen des Lesers V3 (H3) ────────────
//
// ANLASS (Vollzugsvermerk H1, «Folge-Etappen»): H1 hat die Aussenklick-, Esc- und
// Fokus-Rückgabe-Mechanik im `LeserAnsichtV3` als zwei lokale `useEffect`
// geschrieben. H3 bringt eine ZWEITE aufziehbare Fläche (das
// Rechtsprechungs-/Kontext-Panel). Zwei Kopien derselben Bedien-Zusage laufen
// beim ersten Nachjustieren auseinander — dann schliesst die eine Fläche auf
// Wischen und die andere nicht, ohne dass irgendwo steht, welche recht hat (§5).
//
// ── DREI MODI, WEIL ES DREI FLÄCHEN GIBT (deklariert, nicht abgeleitet) ──────
//
//   modus      Fläche                    Fokus-Falle  Aussenklick  Wisch-Geste
//   ─────────────────────────────────────────────────────────────────────────────
//   popover    «Ansicht ▾» im Kopf       ja           ja           ja
//   blatt      Panel als Sheet (S/H)     ja           ja           nein
//   spalte     Panel als Spalte (D)      NEIN         nein         nein
//
// Esc schliesst in ALLEN drei Modi und gibt den Fokus an den Öffner zurück —
// das ist die Zusage, die keine Fläche verhandeln darf (WCAG 2.1.2/2.4.3).
//
// WARUM `spalte` KEINE FOKUS-FALLE HAT: die angedockte Spalte auf D ist nicht
// modal — der Lesetext daneben bleibt bedienbar und lesbar. Eine Fokus-Falle
// versprächen wir dort eine Modalität, die es nicht gibt, und der Nutzer käme
// mit Tab nicht mehr aus dem Panel in den Text (§8: kein Versprechen, das die
// Fläche nicht hält). Fokus wird beim Öffnen trotzdem HINEIN gesetzt: sonst
// bliebe er auf dem Öffner und die eben aufgezogene Fläche wäre nur mit
// mehrfachem Tab erreichbar.
//
// WARUM `blatt` KEINE WISCH-GESTE HAT: das Sheet ist selbst ein Scroller. Die
// Wisch-Geste im Panel-Inhalt würde das Panel schliessen, das man gerade liest —
// genau die Falle, die LM-009 für den umgekehrten Fall beschreibt.
//
// LM-009 (aus `LeserAnsichtMenu`, wörtlich weitergetragen): geschlossen wird auf
// eine echte NUTZER-Geste (`wheel`/`touchmove`/`resize`), nie auf das generische
// `scroll`-Ereignis — ein Schalter verändert die Höhe des Fliesstexts, der
// Browser gleicht per Scroll-Anchoring aus und feuerte `scroll` ohne Geste; das
// eben geöffnete Panel schloss sich von selbst.

export type AutoZuModus = 'popover' | 'blatt' | 'spalte';

export function usePopoverAutoZu({ offen, schliesse, wrapRef, panelRef, modus }: {
  offen: boolean;
  /** Instabile Funktion erlaubt — sie wird über eine Ref gelesen. */
  schliesse: () => void;
  /** Umschliessender Bereich (Öffner UND Fläche). Ein `pointerdown` darin
   *  schliesst nicht. Ohne Ref entfällt die Aussenklick-Prüfung — dann trägt der
   *  Aufrufer sie selbst (das Blatt tut das über seine Überlagerung). */
  wrapRef?: RefObject<HTMLElement | null>;
  /** Die Fläche selbst; braucht `tabIndex={-1}`, damit der Fokus hineingesetzt
   *  werden kann, wenn sie kein fokussierbares Kind hat. */
  panelRef: RefObject<HTMLElement | null>;
  modus: AutoZuModus;
}): void {
  const schliesseRef = useRef(schliesse);
  useEffect(() => { schliesseRef.current = schliesse; }, [schliesse]);

  // Fokus-Falle + Esc + Fokus-Rückgabe aus der GETEILTEN Mechanik — dieselbe,
  // die das Ist-Menü und das Gliederungs-Blatt verwenden (§5). Für `spalte`
  // bewusst ausgeschaltet (Begründung im Kopf); dort übernimmt der Effekt unten.
  useDialogFokus(offen && modus !== 'spalte', panelRef, () => schliesseRef.current());

  // ── `spalte`: Esc + Fokus hinein + Fokus zurück, OHNE Falle ───────────────
  useEffect(() => {
    if (!offen || modus !== 'spalte') return;
    const vorher = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') schliesseRef.current();
    };
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('keydown', taste);
      // Nur zurückgeben, wenn der Fokus noch IM Panel steht: hat der Nutzer
      // inzwischen in den Lesetext geklickt, wäre ein Rücksprung auf den Öffner
      // ein Fokus-Diebstahl (die Spalte ist nicht modal).
      if (panelRef.current?.contains(document.activeElement)) vorher?.focus({ preventScroll: true });
    };
  }, [offen, modus, panelRef]);

  // ── Aussenklick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!offen || modus === 'spalte' || !wrapRef) return;
    const klick = (e: PointerEvent) => {
      const wurzel = wrapRef.current;
      if (wurzel && !wurzel.contains(e.target as Node)) schliesseRef.current();
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen, modus, wrapRef]);

  // ── Wisch-/Grössen-Geste (nur `popover`, Herleitung LM-009 im Kopf) ───────
  useEffect(() => {
    if (!offen || modus !== 'popover') return;
    const zu = () => schliesseRef.current();
    window.addEventListener('wheel', zu, { passive: true });
    window.addEventListener('touchmove', zu, { passive: true });
    window.addEventListener('resize', zu);
    return () => {
      window.removeEventListener('wheel', zu);
      window.removeEventListener('touchmove', zu);
      window.removeEventListener('resize', zu);
    };
  }, [offen, modus]);
}
