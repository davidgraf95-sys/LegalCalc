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
 * EINE Stelle (§5) FÜR DIE HIER ANGESCHLOSSENEN PFADE: der Generator
 * (abk-aliase-generieren.ts) schreibt damit das Alias-Artefakt, das Tor
 * (check-normkeys-abdeckung.ts) sortiert damit seine Ausgaben, der Korpus-Writer
 * (entscheide-schreiben.ts) die proNorm-Schlüsselfolge des norm-index. Zwei
 * Kopien derselben Regel wären zwei Regeln, sobald eine gepflegt wird und die
 * andere nicht.
 *
 * BEKANNTE OFFENE STELLE (Linse 3, 28.7.2026): «eine Stelle» gilt NICHT für die
 * ganze Build-Kette. `scripts/normtext/browse-manifest.ts` sortiert das
 * Browse-Manifest weiterhin mit `localeCompare` (in seiner eigenen, lokalen
 * `vergleiche`-Funktion). Das ist hier bewusst NICHT mit angefasst: es ist eine
 * fremde Artefakt-Kette (Normtext-Browse, nicht Rechtsprechung), eine Umstellung
 * änderte deren Golden-Ausgabe und gehört damit in einen eigenen, deklarierten
 * Schritt mit Golden-Beweis (§6.3) — nicht als Nebeneffekt hier hinein. Benannt
 * statt verschwiegen, damit der Satz oben nicht mehr verspricht, als er hält (§8).
 */
export function vergleiche(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
