import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { planeLiveSync } from '../lib/liveUrlSync';
import { useKopieren } from './useKopieren';

// ─── «Link teilen»-Button — geteilter Baustein (FAHRPLAN-PRAXIS 1.3) ────────
// Schreibt den kodierten Fall in die URL (replace, keine History-Flut) und
// kopiert den vollständigen Link in die Zwischenablage. Der Query-String
// kommt aus lib/permalink.ts (deterministisch, kein Tracking, rein lokal).
//
// LM-205 (3.8.2026): der Rechenzustand steht jetzt schon LIVE in der Adresse,
// ohne dass dieser Knopf gedrückt werden muss — debounced replaceState bei
// jeder Eingabe-Änderung, GENAU derselbe Serializer wie der Klick (§5, eine
// Kodierung; Debounce-Logik in lib/liveUrlSync.ts). «Link teilen» bleibt
// bestehen: der Klick schreibt zusätzlich sofort (unabhängig vom Debounce)
// und kopiert die aktuelle Adresse in die Zwischenablage. Weiterhin kein
// History-Push (nur replace) und kein localStorage — der Rechenzustand lebt
// ausschliesslich in der (flüchtigen) Adressleiste. Das ist mit «Werkzeuge
// bleiben zustandslos» (ROADMAP.md Z. 68) vereinbar: gemeint ist dort das
// Fehlen von Server-/Storage-Persistenz, nicht die Adresse.

export function LinkTeilenButton({ query }: {
  /** Liefert den aktuellen Query-String («?a=…» oder ''), z. B. () => permalinkKodieren(SPEC, form). */
  query: () => string;
}) {
  const navigate = useNavigate();
  const { pathname, hash, search } = useLocation();
  const { kopiert, kopieren } = useKopieren();
  const q = query();

  // Live-Sync: q ändert sich mit jeder Eingabe (query() ist ein neuer
  // Funktionsabschluss über den aktuellen Formular-State bei jedem Render);
  // planeLiveSync debounct über die Effect-Cleanup-Kette selbst — jede
  // Änderung löscht den Timer der vorigen und setzt einen neuen (≈400 ms).
  useEffect(
    () => planeLiveSync(q, search, () => navigate({ search: q, hash }, { replace: true })),
    [q, search, hash, navigate],
  );

  const teilen = () => {
    // Hash MITFÜHREN (Ultra-Review HOCH-1, 7.6.2026): Bei den Cluster-
    // Rechnern transportiert er die Tab-/Rechtsweg-Weiche (#kuendigung,
    // #schkg, #straf) — ohne ihn landete der Empfänger auf dem falschen
    // Teilrechner und sah die geteilten Parameter nie.
    navigate({ search: q, hash }, { replace: true });
    // R4-D (5.9.2026): hier stand `void writeText(…)` gefolgt von einem
    // SOFORTIGEN `setKopiert(true)` — die einzige der fünf Kopier-Flächen, die
    // den Erfolg nicht abwartete. Bei verweigerter Berechtigung meldete der
    // Knopf «Link kopiert ✓» über eine unveränderte Zwischenablage (§8). Der
    // geteilte Hook quittiert erst nach dem Schreiben; den Link kennt er erst
    // beim Klick, darum als Argument (nicht an der Hook-Zeile).
    kopieren(`${location.origin}${pathname}${q}${hash}`);
  };
  return (
    <button type="button" className="lc-btn-ghost lc-btn-sm" onClick={teilen}>
      {kopiert ? 'Link kopiert ✓' : 'Link teilen'}
    </button>
  );
}
