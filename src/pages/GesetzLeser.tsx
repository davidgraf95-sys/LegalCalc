import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { GesetzLeserInhalt } from './gesetz-leser/inhalt';
import { GesetzLeserV3 } from './gesetz-leser/GesetzLeserV3';
import { leserFlagAuswerten, leserFlagLesen, leserFlagSchreiben } from './gesetz-leser/leserFlag';

// ═══ ABSCHNITT · Fassade = EINZIGER Schaltpunkt V1/V3 (FL-1, FL-2) ══════════
//
// Warum hier und nirgends sonst: `RouteSwitch.tsx:116` bindet `/gesetze/:ebene/
// :key` an diese Fassade, und `Pane.tsx:126` schickt BEIDE Split-Panes durch
// denselben `RouteSwitch`. Ein Flag an dieser einen Stelle schaltet damit
// Einzelansicht und beide Panes gemeinsam (FL-1, e2e-Beleg in
// `e2e/leser-v3-flag.e2e.ts`). Eine Nebenroute `/gesetze-v3/…` wäre falsch:
// `basisPfad`, Teilen-Funktion und TOC-Anker zeigen auf `/gesetze/…` und liefen
// ins Leere (FL-2).
//
// Die REGEL selbst steht in `./gesetz-leser/leserFlag` — sie muss DOM-frei
// prüfbar sein, und Komponenten-Dateien dürfen nichts anderes exportieren
// (react-refresh). Hier bleibt nur der Vollzug.

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const { search } = useLocation();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  const { modus, speichern } = leserFlagAuswerten(search, leserFlagLesen());

  useEffect(() => { leserFlagSchreiben(speichern); }, [speichern]);

  const Huelle = modus === 'v3' ? GesetzLeserV3 : GesetzLeserInhalt;
  return <Huelle key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
