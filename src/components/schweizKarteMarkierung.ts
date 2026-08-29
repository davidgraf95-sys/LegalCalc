// Markierungs-Entscheidung der Schweiz-Karte, aus SchweizKarte.tsx heraus-
// gezogen — die Komponenten-Datei darf nur Komponenten exportieren (react-
// refresh/only-export-components; Muster wie fehlermeldung.ts / thema.ts).

/**
 * Welche Kantone einen Markierungs-Ring bekommen — die tragende Entscheidung aus
 * Fehlerbuch-Befund 12 (Prüfung 29.8.2026), als reine Funktion, damit sie prüfbar
 * ist (§6.7: ein Fix, der nicht rot gezeigt werden kann, ist keiner).
 *
 * ALT war `gezeigt = hover ?? aktiv`: EIN Overlay-Pfad, und Hover VERDRÄNGTE die
 * Auswahl. Wer den Zeiger über einen NACHBARN des gewählten Kantons führte,
 * verlor dessen Markierung und bekam sie erst beim Verlassen zurück.
 *
 * NEU sind es zwei unabhängige Ringe. `hover === aktiv` liefert nur den starken,
 * damit derselbe Kanton nicht doppelt umrandet wird.
 */
export function markierungen(aktiv: string | null | undefined, hover: string | null): {
  aktiv: string | null; hover: string | null;
} {
  return { aktiv: aktiv ?? null, hover: hover && hover !== aktiv ? hover : null };
}
