import { Fragment } from 'react';
import { START_MODULE } from '../lib/startseiteModule';
import { usePaneKlasse } from '../components/layout/PaneKontext';

// ─── Startseite — das Inhaltsverzeichnis der Sammlung ───────────────────────
//
// W2·24-DESIGN-IDENTITAET R3 (Referenzbild `abnahme/design-identitaet/
// vorschlag-freigegeben.html`, Seite «Startseite»): die Seite trägt NUR noch den
// Satzspiegel — zwei Spalten, 150 px Marginalie plus 36 px Rinne. Jedes Modul
// aus der Registry (`lib/startseiteModule.tsx`) liefert genau ZWEI Grid-Kinder
// (Marginalie + Inhalt) über den Baustein `start/Satzspiegel`; Titel,
// Leerzustand und Höhen-Reservierung liegen dort, wo die Daten sind — im Modul
// (§4). Reine Darstellung (§3).
//
// SPLIT-VIEW (FAHRPLAN §6 (c), gemessen): 150 px + 36 px brechen unter ~52 rem
// Spaltenbreite, also in jedem geteilten 1440er-Fenster. Die Schwelle ist darum
// `@3xl/pane` (48 rem) im Pane und `lg` im Vollfenster; darunter steht die
// Marginalie als Zeile über ihrem Inhalt. `usePaneKlasse` wählt den Zweig — im
// Pane darf keine Viewport-Media-Query entscheiden (A-2-Wurzel, Pane.tsx).
//
// A11y (§8): genau EINE <h1> (Titelblatt-Wort in der Marginalie der ersten
// Zeile, `start/Hero`), je betitelter Zeile eine <h2> mit
// `<section aria-labelledby>` an der INHALTS-Zelle — keine Heading-Sprünge.
export function Startseite() {
  const pk = usePaneKlasse();
  return (
    <div className={`grid grid-cols-1 gap-x-9 ${pk(
      'lg:grid-cols-[150px_minmax(0,1fr)]', '@3xl/pane:grid-cols-[150px_minmax(0,1fr)]',
    )}`}>
      {START_MODULE.map((modul) => {
        const Komponente = modul.Komponente;
        return <Fragment key={modul.id}><Komponente /></Fragment>;
      })}
    </div>
  );
}
