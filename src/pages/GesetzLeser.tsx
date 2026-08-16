import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { GesetzLeserInhalt } from './gesetz-leser/inhalt';
import { GesetzLeserV3 } from './gesetz-leser/GesetzLeserV3';

// ═══ ABSCHNITT · Fassade = EINZIGER Schaltpunkt V1/V3 (FL-1…FL-3, FL-6) ═════
//
// Warum hier und nirgends sonst: `RouteSwitch.tsx:116` bindet `/gesetze/:ebene/
// :key` an diese Fassade, und `Pane.tsx:126` schickt BEIDE Split-Panes durch
// denselben `RouteSwitch`. Ein Flag an dieser einen Stelle schaltet damit
// Einzelansicht und beide Panes gemeinsam (FL-1). Eine Nebenroute
// `/gesetze-v3/…` wäre falsch: `basisPfad`, Teilen-Funktion und TOC-Anker
// zeigen auf `/gesetze/…` und liefen ins Leere (FL-2).
//
// R10 «Das Flag leckt»: Grundzustand ist AUS. Ohne ausdrückliche Anforderung
// sieht jeder Besucher exakt den Ist-Stand. Bewiesen durch den Vitest
// `src/tests/leser-v3-flag.test.ts` gegen `leserFlagAuswerten`.

/** localStorage-Schlüssel des Hüllen-Flags. Zuwachs auf Zeit — Entfernung ist
 *  Abnahmezeile von H5, nicht Nacharbeit (FL-7). NICHT verwandt mit
 *  `lm.leser.optionen`: die Leser-Optionen sind GETEILT, nicht dupliziert
 *  (FL-6, §5) — dieser Schlüssel steht ausschliesslich für die Hüllen-Wahl. */
export const LESER_V3_KEY = 'lm.leser.v3';

export type LeserModus = 'v1' | 'v3';

export interface LeserFlagWirkung {
  /** Welche Hülle rendert JETZT — sofort, ohne auf den Speicher-Effekt zu warten. */
  modus: LeserModus;
  /** Was der Speicher danach tragen soll. `null` = unverändert lassen. */
  speichern: 'setzen' | 'loeschen' | null;
}

/**
 * Reine Flag-Auswertung (§2, DOM-frei testbar).
 *
 * `?leser=v3` schaltet an UND merkt sich das; `?leser=v1` schaltet aus UND
 * löscht die Merkung. Ohne Parameter entscheidet allein der Speicher — und
 * dessen Abwesenheit heisst V1 (Grundzustand AUS, R10).
 *
 * @param suche       Query-String der aktuellen Location (`?leser=v3`).
 * @param gespeichert Rohwert von `localStorage[LESER_V3_KEY]` bzw. `null`.
 */
export function leserFlagAuswerten(suche: string, gespeichert: string | null): LeserFlagWirkung {
  const wunsch = new URLSearchParams(suche).get('leser');
  if (wunsch === 'v3') return { modus: 'v3', speichern: 'setzen' };
  if (wunsch === 'v1') return { modus: 'v1', speichern: 'loeschen' };
  return { modus: gespeichert === '1' ? 'v3' : 'v1', speichern: null };
}

/** localStorage kann werfen (Privat-Modus, deaktivierte Speicherung) und im
 *  Prerender-Prozess ganz fehlen. Beides bedeutet: kein Flag ⇒ V1. */
function flagLesen(): string | null {
  try {
    return localStorage.getItem(LESER_V3_KEY);
  } catch {
    return null;
  }
}

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const { search } = useLocation();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  const { modus, speichern } = leserFlagAuswerten(search, flagLesen());

  useEffect(() => {
    try {
      if (speichern === 'setzen') localStorage.setItem(LESER_V3_KEY, '1');
      else if (speichern === 'loeschen') localStorage.removeItem(LESER_V3_KEY);
    } catch {
      // Kein Speicher verfügbar: das Flag bleibt flüchtig, die aktuelle
      // Ansicht stimmt trotzdem — `modus` kam aus dem Query-Parameter.
    }
  }, [speichern]);

  const Huelle = modus === 'v3' ? GesetzLeserV3 : GesetzLeserInhalt;
  return <Huelle key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
