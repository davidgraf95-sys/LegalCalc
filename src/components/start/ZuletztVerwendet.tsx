import { useState } from 'react';
import { Link } from 'react-router-dom';
import { holeZuletzt } from '../../lib/zuletztVerwendet';

// ─── «Zuletzt geöffnet» (Startseite, Modul-Teil der Titelblatt-Zeile) ───────
//
// Auto-getrackte Verweise auf die zuletzt besuchten Inhalts-Routen. Reine
// Darstellung (§3): liest die vom ZuletztTracker (App-Shell) geschriebene Liste
// SYNCHRON aus localStorage (kein async-Nachwachsen → kein Shift; §0/§15).
//
// W2·24-R3 (DEKLARIERTE Darstellungsänderung): aus dem waagrecht scrollenden
// Chip-Streifen unter dem Hero ist die TEXTZEILE des Referenzbildes geworden
// («Zuletzt geöffnet: Art. 257d OR · BGE 152 V 52 · Fristenrechner», Marke
// `.unter`). Damit entfällt die Scroll-Achse — und mit ihr die
// Scrollstand-Affordanz `lc-scrollrand-x` (LM-061), die genau diese Achse
// bewacht hat: eine umbrechende Textzeile verbirgt nichts, es gibt keinen
// Scrollstand mehr, über den sie Auskunft geben könnte (§17-Gegengewicht:
// gestrichen statt bewacht). Die Chips selbst sind nicht «verloren» — dieselben
// Ziele stehen als unterstrichene Verweise in derselben Reihenfolge.
//
// Erstbesuch/leer: KEIN Etikett über Leerraum (§8) — die Zeile bleibt stumm.
// SSR/Prerender hat kein localStorage → serverseitig leer; der Client liest beim
// Mount synchron nach. Die HÜLLE wird darum immer gerendert (auch leer) und
// trägt `suppressHydrationWarning`: so gibt es auf beiden Seiten dasselbe
// Element, und nur sein Inhalt darf abweichen.
export function ZuletztVerwendet() {
  const [eintraege] = useState(holeZuletzt); // lazy, synchron — kein Effect-Nachwachsen
  return (
    <span suppressHydrationWarning>
      {eintraege.length > 0 && (
        <>
          {' '}Zuletzt geöffnet:{' '}
          {eintraege.map((e, i) => (
            <span key={e.route}>
              {i > 0 && <span aria-hidden> · </span>}
              <Link to={e.route} className="hover:text-ink-900">{e.titel}</Link>
            </span>
          ))}
        </>
      )}
    </span>
  );
}
