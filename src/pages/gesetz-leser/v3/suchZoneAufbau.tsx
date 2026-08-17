import type { ReactNode } from 'react';
import { SuchZone } from './SuchZone';
import { LeserTrefferBlatt } from './LeserTrefferBlatt';
import type { BestimmungsWort } from './erlassAnsicht';

// ═══ DER AUFBAU DER KLEBENDEN SUCH-ZONE (Integration der vier Nachzüge, 17.8.) ══
//
// ANLASS DER AUSLAGERUNG — eine WECHSELWIRKUNG, kein einzelner Zufluss: die
// Fundament-Sonde `src/tests/leser-v3-fundament.test.ts` verlangt, dass der
// Adapter `leserV3Modell.ts` der grösste Baustein von `v3/` bleibt (Auflage 1).
// Zwei parallel gebaute Zweige haben diese Ordnung zusammen gekippt, keiner
// allein: `fix/leser-v3-david-17-8` liess den Rahmen von 399 auf 416 Zeilen
// wachsen (Ä76, das Treffer-Blatt am Feld), `feat/leser-v3-krume` liess den
// Adapter von 419 auf 416 schrumpfen (A-2). Auf beiden Zweigen war die Sonde
// grün; erst zusammen entstand der Gleichstand, und den entscheidet die
// Sortierung alphabetisch gegen den Rahmen. Ausgelagert ist darum genau die
// NAHT, an der die beiden Zuflüsse sich trafen.
//
// §3/§6: KEINE Verhaltensänderung. Dies ist eine reine Funktion, die dieselben
// Elemente zusammensetzt wie zuvor der Rahmen — kein Komponenten-Rand, also
// auch keine neue Zustands-Grenze: `useTrefferBlatt` bleibt im Rahmen und
// behält seinen Zustand über jeden Lagewechsel hinweg. Muster wie `FruehAnsicht`
// aus `../inhalt-ansichten`, das ebenfalls als Funktion gerufen wird.

/** Der Offen-Zustand des Treffer-Blattes, wie ihn `./useTrefferBlatt` führt. */
export interface TrefferBlattZustand {
  offen: boolean;
  oeffne: () => void;
  schliesse: () => void;
}

/**
 * Baut die klebende Such-Zone des Kopf-Blocks — oder gibt `undefined` zurück,
 * wo die Gliederung als Spalte steht und den klebenden Block selbst trägt.
 */
export function suchZoneAufbau(a: {
  /** Ä19: Trägt der Kopf-Block das Feld? (Nur ohne Gliederungs-Spalte.) */
  klebt: boolean;
  /** ≥ 1024 px im eigenen Pane — entscheidet Blatt am Feld vs. Bottom-Sheet. */
  istXl: boolean;
  sucheAktiv: boolean;
  /** A2: Blatt offen ⇒ das Feld steht dort, die Zone gibt es her (§5/K2). */
  blattOffen: boolean;
  suchFeld: ReactNode;
  /** DASSELBE Bauteil wie in der Spalte, dieselbe Registry (§5) — die Weiche
   *  Baum/Treffer sitzt weiterhin nur in `LeserGliederung`. */
  liste: ReactNode;
  bestimmungen: number;
  fundstellen: number;
  bestimmungsWort: BestimmungsWort;
  trefferBlatt: TrefferBlattZustand;
  /** Der Weg zur Liste unterhalb von `istXl`: das Bottom-Sheet aufziehen. */
  onSheet: () => void;
}): ReactNode | undefined {
  if (!a.klebt) return undefined;
  // Ä76: Fehlt die Spalte, ist aber Platz neben dem Text (Desktop mit
  // eingeklappter Gliederung), liegt die Trefferliste als Blatt AM FELD; darunter
  // (Handy · schmales Pane) bleibt das Bottom-Sheet der Weg. Herleitung und die
  // Messung, die «Spalte aufziehen» ausschloss: `./LeserTrefferBlatt`.
  const blattAmFeld = a.istXl && a.sucheAktiv;
  return (
    <SuchZone suchFeld={a.blattOffen ? undefined : a.suchFeld} sucheAktiv={a.sucheAktiv}
      bestimmungen={a.bestimmungen} fundstellen={a.fundstellen}
      bestimmungsWort={a.bestimmungsWort}
      // Die eine Geste «zeig mir die Treffer»: Blatt am Feld @≥1024 px, sonst Sheet.
      onListe={() => { if (a.istXl) a.trefferBlatt.oeffne(); else a.onSheet(); }}
      blatt={blattAmFeld && a.trefferBlatt.offen
        ? <LeserTrefferBlatt onSchliessen={a.trefferBlatt.schliesse} liste={a.liste} />
        : undefined} />
  );
}
