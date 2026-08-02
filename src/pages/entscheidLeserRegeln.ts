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

// ── LM-210 · Lesemodus in der Adresse ───────────────────────────────────────
//
// Befund (Prod, 2.8.2026): der Lesemodus war reiner lokaler State — weder URL
// noch localStorage noch sessionStorage trugen ihn. Eine Vollbild-Ansicht liess
// sich damit nicht weitergeben und überlebte kein Neuladen.
//
// Gebaut nach dem dokumentierten Präzedenzmuster N0d·J5 (`?ansicht=voll|auszug`
// wird per replaceState in die Adresse zurückgeschrieben und beim Laden gelesen).
// Wertform folgt der Bestands-Konvention für Ja/Nein-Achsen (`?leit=1`,
// EntscheidFilter): gesetzt = «1», ausgeschaltet = Parameter FEHLT — so trägt die
// Adresse nie ein totes «lese=0» mit.

/** Name der Lesemodus-Achse in der Adresse. */
export const LESE_PARAM = 'lese';
const LESE_AN = '1';

/** Lesemodus-Zustand aus dem rohen Query-Wert (alles ausser «1» = zu). */
export function leseAusParam(wert: string | null): boolean {
  return wert === LESE_AN;
}

/** Adresse mit gesetztem/entferntem Lesemodus-Flag; übrige Parameter und Hash
 *  bleiben unberührt (der Fassungs-Parameter `?ansicht=` überlebt das Öffnen). */
export function urlMitLese(href: string, offen: boolean): string {
  const u = new URL(href);
  if (offen) u.searchParams.set(LESE_PARAM, LESE_AN);
  else u.searchParams.delete(LESE_PARAM);
  return u.toString();
}
