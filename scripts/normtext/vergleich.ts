/**
 * Locale-unabhängiger Stringvergleich für die Normtext-/Rechtsprechungs-Build-
 * Kette (§2: gleiche Eingabe → gleiche Ausgabe, auf JEDER Maschine).
 *
 * WARUM NICHT `localeCompare`. Dessen Reihenfolge hängt an der ICU-Datenbank der
 * Laufzeit: ein Node ohne volles ICU (`small-icu`), eine andere Node-Version oder
 * ein anderes Default-Locale sortiert anders — insbesondere bei Ziffern gegen
 * Buchstaben, bei Umlauten und bei Gross-/Kleinschreibung. Für ein Artefakt, das
 * byte-gleich reproduzierbar sein muss (§6), und für eine Tor-Ausgabe, die man
 * zwischen lokalem Lauf und CI vergleicht, ist das genau die falsche Abhängigkeit:
 * die Sortierung würde zwischen zwei Umgebungen kippen, ohne dass sich an den
 * Daten etwas geändert hat.
 *
 * Diese Funktion vergleicht stattdessen nach UTF-16-Codepoint — die einzige
 * Ordnung, die auf jeder Laufzeit identisch ist. Sie ist nicht «schön» im Sinne
 * einer deutschen Duden-Sortierung (Ä landet hinter Z), und das ist in Ordnung:
 * sortiert werden Erlass-Kürzel und SR-Nummern, keine Fliesstexte für Leser.
 *
 * EINE Stelle (§5): der Generator (abk-aliase-generieren.ts) schreibt damit das
 * Alias-Artefakt, das Tor (check-normkeys-abdeckung.ts) sortiert damit seine
 * Ausgaben. Zwei Kopien derselben Regel wären zwei Regeln, sobald eine gepflegt
 * wird und die andere nicht.
 */
export function vergleiche(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
