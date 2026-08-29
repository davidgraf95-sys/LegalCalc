// ─── Dauerhafte Weiterleitung umgezogener Erlass-Adressen ───────────────────
//
// Cowork-Befund 45 (18.8.2026), Entscheid David 29.8.2026: Staatsverträge sind
// von `/gesetze/bund/<key>` nach `/gesetze/international/<key>` umgezogen. Der
// Entscheid lautete ausdrücklich «ja, MIT Weiterleitungen» — jede versendete,
// gebookmarkte oder von einer Suchmaschine indexierte Alt-Adresse muss weiter
// ankommen, und zwar am richtigen Artikel.
//
// DREI Schichten, weil keine allein reicht:
//
//   1. Prerender-Stub (scripts/prerender.ts): die Alt-URL bleibt eine echte
//      Datei mit `<link rel="canonical">` auf die neue Adresse. Crawler und
//      Direkt-Aufrufe bekommen kein 404 und lernen die Kanonik.
//   2. Diese Ableitung, vollzogen im Leser: der Client landet auf der neuen
//      Adresse, inklusive `#art-…`-Anker und Query — bei Direkt-Aufruf ebenso
//      wie bei interner Navigation, die den Server nie fragt.
//   3. Die Link-Erzeuger selbst (lib/normtext/erlassAdresse.ts): sie bauen die
//      Alt-Form gar nicht erst, damit die Weiterleitung nur noch Alt-Bestand
//      bedient und kein Dauerzustand wird.
//
// KEIN vercel.json-Redirect: der wäre der sauberste 301, liesse sich aber nur
// als Liste von 37 handgepflegten Schlüsseln schreiben — eine zweite Wahrheit
// neben dem Register (§5), die beim 38. Staatsvertrag still falsch wird.
// vercel.json kann nicht aus dem Register erzeugt werden, weil Vercel die Datei
// VOR dem Build liest.

import { erlassPfadRoh, routenEbeneVonKey } from '../../lib/normtext/erlassAdresse';

/**
 * Zieladresse, wenn die aufgerufene Adresse veraltet ist — sonst null.
 *
 * Rein und deterministisch (§2): entscheidet allein aus Routen-Ebene und
 * Schlüssel, ohne Netz und ohne Manifest. Ein unbekannter Schlüssel liefert
 * null — die Fehlseite des Lesers bleibt dann zuständig, statt dass hier auf
 * eine geratene Adresse gesprungen wird.
 */
export function umzugsZiel(routenSegment: string, schluessel: string): string | null {
  if (!schluessel) return null;
  const kanonisch = routenEbeneVonKey(schluessel, routenSegment);
  if (kanonisch === routenSegment) return null;
  return erlassPfadRoh(kanonisch, schluessel);
}
