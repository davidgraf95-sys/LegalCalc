import { useState } from 'react';

/**
 * Ist das Treffer-Blatt am Suchfeld offen? (Ä76 — das Blatt selbst und die
 * Herleitung des Befunds stehen in `./LeserTrefferBlatt`.)
 *
 * Es öffnet sich SELBST, sobald eine Suche läuft — das ist der ganze Befund
 * Davids: wer sucht, will das Ergebnis sehen, nicht erst einen Knopf finden. Der
 * Nutzer kann es wegklicken, und dann bleibt es weg, bis er die Eingabe ÄNDERT
 * oder die Liste ausdrücklich zurückholt.
 *
 * KEIN EFFEKT, kein Zurücksetzen im Render-Nachlauf: gemerkt wird nicht «zu ja/
 * nein», sondern FÜR WELCHEN BEGRIFF weggeklickt wurde. Damit ergibt sich der
 * Zustand deterministisch aus Begriff + Merkwert (§2) — dasselbe Muster, mit dem
 * `LeserTrefferListe` ihren Aufklapp-Deckel beim Begriffswechsel verwirft
 * (`gemerkt.begriff === begriff`), und es umgeht die Kaskaden-Render-Falle
 * (`react-hooks/set-state-in-effect`).
 *
 * EIGENE DATEI, nicht bei der Komponente: `react-refresh/only-export-components`
 * lässt neben einer Komponente keinen zweiten Export zu (Lint-Fehler beim Bau
 * gesehen, 17.8.2026) — und die Trennung folgt ohnehin dem Haus-Muster
 * (`usePopoverAutoZu.ts`, `suchKuerzel.ts`, `kopfStufen.ts`).
 */
export function useTrefferBlatt(begriff: string) {
  const [zuFuer, setZuFuer] = useState<string | null>(null);
  return {
    /** Offen, solange für DIESEN Begriff nicht weggeklickt wurde. */
    offen: zuFuer !== begriff,
    /** ✕ am Blatt bzw. Esc darin — nimmt es weg, ohne die Suche zu verlieren. */
    schliesse: () => setZuFuer(begriff),
    /** «Treffer anzeigen →» in der Zähler-Zeile holt es zurück. */
    oeffne: () => setZuFuer(null),
  };
}
