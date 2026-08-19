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
//
// SEIT H4 (Flip, David-Ja 17.8.2026) ist der Grundzustand `'v3'` — diese Datei
// ist davon UNBERÜHRT geblieben: sie fragt die Regel und rendert, was diese
// sagt. Genau darum ist der Flip eine Ein-Datei-Änderung (FL-2). Der Rückweg
// `?leser=v1` läuft durch denselben Aufruf.

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const { search } = useLocation();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  const { modus, speichern } = leserFlagAuswerten(search, leserFlagLesen());

  // SYNCHRON, nicht im `useEffect` (Bug-Check B2, 16.8.2026). `Pane.tsx:126`
  // schickt BEIDE Split-Panes durch denselben `RouteSwitch` — und damit durch
  // diese Fassade. Lief der Vollzug im Effekt, wertete das zweite Pane sein
  // Flag noch VOR dem Effekt des ersten aus, las `null` und rendert V1 neben
  // V3; FL-1 verspricht genau das Gegenteil («ein Flag schaltet beide»). Der
  // Aufruf ist gegen die Aussenwelt idempotent (siehe `leserFlagSchreiben`) und
  // berührt keinen React-Zustand — er darf darum im Render-Rumpf stehen.
  leserFlagSchreiben(speichern);

  const Huelle = modus === 'v3' ? GesetzLeserV3 : GesetzLeserInhalt;
  return <Huelle key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
