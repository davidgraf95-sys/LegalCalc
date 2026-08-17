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
// ── ZWEI MODI, WEIL ES ZWEI FLÄCHEN GIBT (deklariert, nicht abgeleitet) ──────
//
//   modus      Fläche                    Fokus-Falle  Aussenklick  Wisch-Geste
//   ─────────────────────────────────────────────────────────────────────────────
//   popover    «Ansicht ▾» im Kopf       ja           ja           ja
//   blatt      Panel als Sheet           ja           ja           nein
//
// Esc schliesst in BEIDEN Modi und gibt den Fokus an den Öffner zurück — das ist
// die Zusage, die keine Fläche verhandeln darf (WCAG 2.1.2/2.4.3).
//
// EIN DRITTER MODUS `spalte` (nicht modal, kein Fokus-Fang) war für das
// angedockte Panel auf D gebaut und ist mit ihm gestrichen: der Seitenrahmen ist
// auf 70 rem gedeckelt, die Spalte damit auf keiner Breite erreichbar (Rechnung
// im Rahmen). Ein Modus ohne Aufrufer ist toter Code (§17) — er kommt zurück,
// wenn die Spalte kommt, und dann mit einem echten Konsumenten.
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

export type AutoZuModus = 'popover' | 'blatt';

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
  // die das Ist-Menü und das Gliederungs-Blatt verwenden (§5).
  useDialogFokus(offen, panelRef, () => schliesseRef.current());

  // ── Aussenklick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!offen || !wrapRef) return;
    const klick = (e: PointerEvent) => {
      const wurzel = wrapRef.current;
      if (wurzel && !wurzel.contains(e.target as Node)) schliesseRef.current();
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen, wrapRef]);

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
