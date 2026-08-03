import { Navigate, useLocation } from 'react-router-dom';
import { INTERNATIONAL_SAEULE, internationalAnkerAbbildung } from '../lib/navigation';

// ─── Link-Erbe der aufgelösten Alias-Seite /international (IA-6 Stufe 2) ────
//
// FAHRPLAN-GESETZES-UX §11.4 Ziff. 3 / §11.8 Y-C (David-Go 3.8.2026): Die
// Rubrik «International» lebt kanonisch in der Säule ?ebene=international;
// /international ist keine zweite Seite mehr (§5 — eine Wahrheit), sondern
// nur noch Link-Erbe.
//
// ZWEI Schichten, weil eine allein nicht reicht:
//   1. Server (vercel.json → 308 permanent): fängt Direkt-Aufrufe, Bookmarks,
//      Fremdlinks und Crawler. Der Fragment-Teil (#anker) erreicht den Server
//      NIE — Browser hängen ihn beim Folgen selbst an die Ziel-URL an (die
//      Location trägt keinen eigenen Hash, darum bleibt der ursprüngliche
//      erhalten). Weil die Ziel-Anker dieselben ids tragen, ist genau das die
//      gewünschte Abbildung.
//   2. Dieser Client-Redirect: interne Navigationen (react-router <Link>)
//      sprechen den Server gar nicht erst an — ein reiner vercel-Redirect
//      liefe für sie ins Leere. Hier wird der Hash zusätzlich EXPLIZIT
//      abgebildet (navigation.ts), statt sich auf Browser-Verhalten zu
//      verlassen.
//
// `replace`: der Alias hinterlässt keinen History-Eintrag — «Zurück» führt
// dorthin, wo der Nutzer herkam, nicht in den Redirect zurück.

export function InternationalRedirect() {
  const { hash } = useLocation();
  const zielAnker = internationalAnkerAbbildung(hash);
  const [pathname, search] = INTERNATIONAL_SAEULE.split('?');
  return <Navigate replace to={{ pathname, search: `?${search}`, hash: zielAnker ? `#${zielAnker}` : '' }} />;
}
