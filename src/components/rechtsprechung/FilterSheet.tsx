import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDialogFokus } from '../layout/useDialogFokus';

// ─── W2·10-UI-NAV/J2 · Mobil-Filter als Bottom-Sheet ─────────────────────────
//
// Fahrplan J2: «Filterblock hinter kompaktem ‹Filter (3)›-Button/Bottom-Sheet,
// Intro auf eine Zeile — Treffer ‹above the fold›».
//
// Vorher stand die ganze Steuerleiste (Suchfeld + drei Facetten-Leisten +
// Spruchkörper-Feld + Klappe «Erweiterte Filter») auf 390 px ÜBER der
// Trefferliste. Wer die Rubrik mobil öffnete, sah Bedienelemente, keine
// Entscheide. Jetzt trägt Mobil eine EINZEILIGE Leiste (Auslöser mit Zahl), die
// Facetten wohnen im Sheet; ab `lg` steht der Block unverändert inline.
//
// Aufbau und Optik folgen bewusst dem bestehenden GliederungSheet des Readers
// (§5/§10 — ein Sheet-Muster im Haus, nicht zwei): von unten angeschlagen,
// Griffleiste + Titel + ✕ (44 px Tap-Ziel) zuoberst, Inhalt darunter als
// einziger Scroller mit `overscroll-contain`.
//
// A11Y-EHRLICHKEIT (Lehre B2 der V-Runde: role/aria ehrlich):
// Dieses Sheet fängt den Fokus, schliesst auf Escape, gibt den Fokus an den
// Auslöser zurück (useDialogFokus) und legt den Hintergrund still — es IST
// modal und sagt das auch (`role="dialog"`, `aria-modal="true"`). Wäre eines
// dieser Merkmale nicht da, stünde das Attribut hier nicht.
//
// §15/2 CLS 0: das Sheet ist `fixed`, also aus dem Fluss genommen — es
// verschiebt nichts. Der Auslöser darüber hat eine feste Zeilenhöhe.

export function FilterSheet({ anzahl, children }: {
  /** Zahl der aktiven Filter — steht in der Beschriftung und als Badge. */
  anzahl: number;
  /** Der Filterblock. Wird mobil im Sheet, ab `lg` inline gerendert. */
  children: ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  useDialogFokus(offen, sheetRef, () => setOffen(false));

  // Viewport-Stand schon im ERSTEN Client-Render lesen (lazy Initializer), nicht
  // erst per useEffect — sonst rendert der Client zuerst die Mobil-Fassung und
  // flippt danach auf die Desktop-Fassung, was die ganze Ergebnis-Spalte
  // reflowt (belegte CLS-Klasse, s. gesetz-leser/inhalt-zustand.tsx §15.5).
  const [istBreit, setIstBreit] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const upd = () => {
      setIstBreit(mq.matches);
      // Wird der Viewport breit, während das Sheet offen ist, gehört der Block
      // wieder inline — ein offener Dialog über der Desktop-Fassung ist ein
      // Zustand, den niemand angefordert hat. Die Rücknahme läuft HIER, im
      // Callback der Medien-Abfrage (echte Aussenwelt-Subskription), nicht in
      // einem eigenen Effekt: dort wäre sie eine Kaskaden-Renderung
      // (react-hooks/set-state-in-effect).
      if (mq.matches) setOffen(false);
    };
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  // Hintergrund still legen, solange das Sheet offen ist (Teil des modalen
  // Versprechens oben — ohne das dürfte `aria-modal` nicht dastehen).
  // `!istBreit` gehört in die Bedingung, nicht nur `offen`: sonst überlebte die
  // Sperre einen Wechsel auf Desktop-Breite, bei dem das Sheet gar nicht mehr
  // gerendert wird — die Seite liesse sich dann nicht mehr scrollen, ohne dass
  // ein schliessbares Element zu sehen wäre.
  useEffect(() => {
    if (!offen || istBreit) return;
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = vorher; };
  }, [offen, istBreit]);

  if (istBreit) return <>{children}</>;

  return (
    <>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOffen(true)}
          aria-expanded={offen} aria-haspopup="dialog"
          className="lc-chip inline-flex h-11 items-center gap-2 hover:border-brass-400 hover:text-brass-700">
          {/* Trichter — reine Dekoration, die Beschriftung trägt die Bedeutung. */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          Filter
          {anzahl > 0 && <span className="num lc-badge lc-badge-ok">{anzahl}</span>}
        </button>
      </div>

      {offen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink-900/30" onClick={() => setOffen(false)} aria-hidden />
          <div ref={sheetRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Filter"
            data-filter-sheet
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl border-t border-line bg-paper-raised shadow-lg"
            style={{ top: 'calc(4rem + 2.25rem)', maxHeight: 'calc(100dvh - 4rem - 2.25rem)' }}>
            <div className="shrink-0 border-b border-line">
              <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between px-4 py-1.5">
                <p className="lc-overline">Filter</p>
                <button type="button" onClick={() => setOffen(false)} aria-label="Filter schliessen"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-500 hover:text-brass-700">
                  <span aria-hidden className="text-base leading-none">✕</span>
                </button>
              </div>
            </div>
            {/* Einziger Scroller des Sheets. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin]">
              {children}
            </div>
            <div className="shrink-0 border-t border-line px-4 py-2">
              <button type="button" onClick={() => setOffen(false)}
                className="lc-chip h-11 w-full justify-center font-medium text-brass-700 hover:border-brass-400">
                Treffer anzeigen
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
