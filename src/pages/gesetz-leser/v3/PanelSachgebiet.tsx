// ─── Vierter Filter «Sachgebiet» — BAULICH VORGESEHEN, ohne Datenlogik ───────
//
// Fahrplan Kap. 14, Zeile `W2·7-VZUI-SACHGEBIET`: «V3 sieht im Panel den vierten
// Filter Sachgebiet baulich vor (Platz, Reiter-Layout, Filterzeile). Die
// Datenlogik bleibt ausdrücklich W2·7-VZUI-SACHGEBIET — Risikopfad mit
// Gegenprüfung, nicht Teil von V3.»
//
// WAS «VORGESEHEN» HIER HEISST: der Streifen existiert als Komponente mit
// fertigem Vertrag und fertiger Optik, und die Filterzeile des Panels ruft ihn
// auf. Er rendert heute NICHTS, weil es keine Sachgebiet-Daten gibt — kein
// deaktivierter Schalter, kein «(bald)», keine reservierte Fläche. Ein leeres
// Steuerelement wäre eine Bedienfläche, die garantiert nichts findet (§13 F4),
// und zugleich die stille Behauptung, es gäbe hier eine Achse, die wir bloss
// gerade ausblenden (§8).
//
// DER TAG, AN DEM DIE DATEN KOMMEN, ist damit ein einzeiliger Anschluss: der
// Aufrufer reicht `gebiete` herein. Nichts an dieser Datei muss dafür anders
// werden — genau das ist der Unterschied zwischen einem vorgesehenen Platz und
// einem TODO-Kommentar.
//
// PRÜFBAR IN BEIDE RICHTUNGEN (§6.7): `src/tests/leser-v3-panel.test.tsx` ruft
// ihn einmal mit leerer und einmal mit gefüllter Liste — die Sonde wird rot,
// wenn er leer doch etwas rendert ODER gefüllt nichts.

/** Gemeinsame Schalter-Optik der Streifen — wörtlich wie `BezugFacettenWahl`,
 *  damit der vierte Filter sich vom ersten nicht unterscheidet (§13). */
const KNOPF = 'rounded px-1.5 py-0.5 text-xs transition-colors';
const AKTIV = 'bg-brass-100/60 font-medium text-ink-900';
const RUHIG = 'text-ink-500 hover:bg-brass-100/40';

export function PanelSachgebiet({ gebiete, gewaehlt, onGebiete }: {
  /** Sachgebiete, zu denen DIESER Erlass wirklich Entscheide führt. Leer ⇒ der
   *  Streifen entfällt vollständig (siehe Kopf). */
  gebiete: readonly string[];
  gewaehlt: readonly string[];
  onGebiete: (neu: string[]) => void;
}) {
  if (gebiete.length === 0) return null;
  const alle = gewaehlt.length === 0;
  return (
    <div role="group" aria-label="Sachgebiete der Entscheide" data-v3-panel-sachgebiet
      className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Sachgebiet</span>
      <button type="button" aria-pressed={alle} onClick={() => onGebiete([])}
        title="Entscheide aus allen erfassten Sachgebieten zeigen"
        className={`${KNOPF} ${alle ? AKTIV : RUHIG}`}>alle</button>
      {gebiete.map((g) => (
        <button key={g} type="button" aria-pressed={gewaehlt.includes(g)} data-v3-panel-gebiet={g}
          title={`Nur Entscheide aus dem Sachgebiet ${g} zeigen`}
          onClick={() => onGebiete(gewaehlt.includes(g) ? gewaehlt.filter((x) => x !== g) : [...gewaehlt, g])}
          className={`${KNOPF} ${gewaehlt.includes(g) ? AKTIV : RUHIG}`}>{g}</button>
      ))}
    </div>
  );
}
