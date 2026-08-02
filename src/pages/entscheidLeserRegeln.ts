// ─── Reine Regeln des Entscheid-Lesers (W2·17-UI-BEFUNDE-B2, Los E) ──────────
//
// Ausgelagert aus `EntscheidLeser.tsx`, damit die Adress-Regeln des Lesers ohne
// Browser prüfbar sind (§6: der Beweis gehört in den Test, nicht in die Zusage).
// Nichts davon ist Rechtslogik (§3) — es sind Adress- und Textsuch-Regeln der
// Darstellungsschicht; alle Funktionen sind rein und deterministisch (§2).

// ── LM-209 · Abschnitts-Hash ohne Verlaufsflut ──────────────────────────────
//
// Befund (Prod, 2.8.2026): die Reiter «Sachverhalt / Erwägungen / Dispositiv»
// waren schlichte `<a href="#abschnitt-…">`. Ein solcher Klick erzeugt
// BROWSERNATIV einen History-Eintrag — gemessen `history.length` 4→5→6→7 bei
// drei Reiter-Klicks; man war danach vier «Zurück» vom Gesetz entfernt, obwohl
// man die Seite nie verlassen hat.
//
// Der Fix schreibt denselben Hash per `replaceState` (Muster der bereits
// gebauten `?ansicht=`-Spiegelung, N0d·J5) und scrollt selbst. Der Hash BLEIBT
// damit in der Adresse (Teilbarkeit), der Verlauf bildet aber nur noch echte
// Ortswechsel ab.
//
// ABGRENZUNG (FAHRPLAN-UI-NAVIGATION §Z Ziff. 7): verworfen ist der laufende,
// SCROLL-getriebene Hash-Sync. Hier ändert ausschliesslich ein diskreter Klick
// die Adresse — kein Scroll-Ereignis schreibt je in die URL.

/** Adresse mit gesetztem Abschnitts-Hash; Pfad und Query bleiben unberührt. */
export function urlMitHash(href: string, anker: string): string {
  const u = new URL(href);
  u.hash = anker;
  return u.toString();
}
