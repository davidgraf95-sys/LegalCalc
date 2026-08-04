// ─── W2·10-UI-NAV/R1 · Kopfleiste der In-Gesetz-Trefferliste ───────────────────
//
// Fahrplan R1 verlangt zur bestehenden A35-Hervorhebung zwei Dinge, die bisher
// fehlten: die **Trefferzahl** (Artikel UND Fundstellen) und **Vor/Zurück-
// Sprungtasten** zwischen den Fundstellen. Diese Komponente ist der reine
// Renderer dafür (§3) — sie rechnet nichts, sie zeigt, was der Reader misst.
//
// §15/2 CLS 0: die Leiste hat eine feste Zeilenhöhe (h-9) und existiert ab dem
// ERSTEN Treffer-Render. Die Fundstellen-Zahl wird erst nach dem Render am DOM
// gemessen (der TreeWalker braucht die gerenderten Artikel) — sie wächst darum
// in einen bereits reservierten, min-breiten Slot ein, nicht in die Zeile.
// §8: solange nicht gemessen ist, steht dort nichts Erfundenes, sondern «…».
//
// Bedienbarkeit (A9-DoD): die zwei Sprungtasten sind 44×44 px Tap-Ziele
// (`h-11 w-11` = 2.75rem), tastaturerreichbar (echte <button>), tragen
// aria-label + title, und die Positionsanzeige ist eine aria-live-Region, damit
// Screenreader den Sprung «3 von 47» mitbekommen.

export function TrefferLeiste({
  begriff, artikelAnzahl, fundstellen, position, onZurueck, onVor,
}: {
  /** Gesuchter Begriff (bereits getrimmt) — nur zur Anzeige. */
  begriff: string;
  /** Zahl der Artikel in der Trefferliste (aus den Daten, synchron). */
  artikelAnzahl: number;
  /** Gemessene Fundstellen im gerenderten Text; null = noch nicht gemessen. */
  fundstellen: number | null;
  /** 0-basierte aktive Fundstelle; -1 = noch keine angesprungen. */
  position: number;
  onZurueck: () => void;
  onVor: () => void;
}) {
  const hatSprung = (fundstellen ?? 0) > 0;
  const anzeige = position < 0 ? '–' : String(position + 1);
  return (
    <div data-treffer-leiste
      className="flex h-9 items-center justify-between gap-3 text-body-s text-ink-500">
      <p className="min-w-0 truncate">
        <span className="num">{artikelAnzahl}</span> Treffer für «{begriff}»
        {/* Fundstellen-Slot: feste Mindestbreite ⇒ die gemessene Zahl schiebt
            den Satz nicht auseinander (§15/2). */}
        <span className="ml-2 inline-block min-w-[6.5rem] text-micro text-ink-400">
          {fundstellen === null
            ? <span aria-hidden>…</span>
            : <><span className="num">{fundstellen}</span>{fundstellen === 1 ? ' Fundstelle' : ' Fundstellen'}</>}
        </span>
      </p>
      {hatSprung && (
        <div className="flex shrink-0 items-center gap-1">
          <span data-treffer-position role="status" aria-live="polite"
            className="text-micro tabular-nums text-ink-500">
            <span className="num">{anzeige}</span>/<span className="num">{fundstellen}</span>
          </span>
          <button type="button" onClick={onZurueck} data-treffer-zurueck
            aria-label="Vorherige Fundstelle" title="Vorherige Fundstelle"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 hover:bg-paper-sunken/60 hover:text-brass-700 transition-colors">
            <span aria-hidden className="text-base leading-none">↑</span>
          </button>
          <button type="button" onClick={onVor} data-treffer-vor
            aria-label="Nächste Fundstelle" title="Nächste Fundstelle"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 hover:bg-paper-sunken/60 hover:text-brass-700 transition-colors">
            <span aria-hidden className="text-base leading-none">↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
