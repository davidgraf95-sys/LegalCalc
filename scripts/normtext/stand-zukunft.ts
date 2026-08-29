// scripts/normtext/stand-zukunft.ts — die Stand-Invariante an EINER Stelle (§5).
//
// «Der Stand einer gespeicherten Fassung kann nicht NACH ihrem Abruf liegen.»
//
// Diese eine Zeile Fachregel wird an drei Orten gebraucht und darf darum nur
// einmal geschrieben stehen:
//   * `adapter-htm.ts`  — beim Lesen des TI/NE/GE-Stands aus der HTML-Quelle,
//   * `adapter-pdf.ts`  — beim Lesen des SZ/TI/VD/JU/OrdoLex-Stands aus dem PDF,
//   * `check-stand-zukunft.ts` — als Tor über den committeten Bestand.
//
// ANLASS (29.8.2026, Gegenprüfung PR #572, B1/B5). Amtliche Quellen datieren
// KÜNFTIGE Fassungen sichtbar mit, und zwar in zwei verschiedenen Bauformen:
//   * TI (m3.ti.ch) hängt der Erlass-Seite einen Abschnitt «PROSSIME VARIAZIONI»
//     an — «Variazione in vigore dal 01.01.2027» (BU 2026, 281). Ein Stand-Leser,
//     der das Maximum aller In-Kraft-Daten der Seite nimmt, greift ihn.
//   * SZ (sz.ch) druckt in die Fusszeile die Ausgabe-Marke der NÄCHSTEN
//     Loseblatt-Nachführung — «SRSZ 1.2.2027» auf einem Blatt, dessen letzte
//     Änderung am 1.7.2026 in Kraft trat.
// Die erste Bauform ist Seiten-Beiwerk und wird strukturell weggeschnitten; die
// zweite steht im amtlichen Dokument selbst und ist NUR über diese Invariante
// erreichbar. Beide Wege sind nötig, keiner ersetzt den anderen.

/**
 * Gibt `iso` zurück, wenn es nicht nach `referenz` liegt — sonst den leeren
 * String, damit der Aufrufer weiterhin nach einem gültigen Stand suchen kann.
 *
 * Vergleich lexikographisch auf ISO-Strings: kein `Date`-Parsing, keine
 * Zeitzonen-Kante, kein `Date.now` (§2). Fehlt die Referenz, wird NICHT
 * gefiltert — eine nicht getroffene Feststellung darf das Verhalten nicht still
 * ändern (§6.7 lit. b); den ungeprüften Fall fängt das Tor.
 */
export function ohneZukunft(iso: string, referenz: string): string {
  if (!iso || !referenz) return iso;
  return iso > referenz ? '' : iso;
}

/**
 * Aus mehreren Kandidaten das jüngste Datum, das nicht nach `referenz` liegt.
 * Leer, wenn alle Kandidaten in der Zukunft liegen (oder keine da sind).
 */
export function juengstesNichtZukunft(kandidaten: readonly string[], referenz: string): string {
  const gueltig = kandidaten
    .filter((d) => d !== '' && (!referenz || d <= referenz))
    .sort();
  return gueltig.length > 0 ? gueltig[gueltig.length - 1] : '';
}
