import type { ReactNode } from 'react';

// ─── Seitenleiste V3 — feste Reihenfolge, nur der Baum klebt (Kap. 4b) ──────
//
//   ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)        scrollt MIT weg
//   [ Suchen oder «Art. 429» …                    ⌘K ]  scrollt MIT weg
//   Gliederung        [alles auf/zu]   [↑ Anfang]       ◀ ab hier sticky
//    1. Teil … / 1. Titel …
//
// DREI ENTSCHEIDE, DIE HIER MARKUP WERDEN:
//  ① EINE Übersichtsbox statt drei (Fedlex hat drei) — und sie klebt NICHT.
//    Wer im Gesetz liest, braucht SR-Nummer und Stand einmal beim Ankommen,
//    nicht dauerhaft; der Platz gehört dem Baum.
//  ② Ein Feld für Suche und Sprung, ÜBER dem Baum (Kap. 4b, Pos. 4).
//  ③ Der Baum klebt ab seiner eigenen Kopfzeile — mit «alles auf/zu» als
//    sichtbarem Knopf und OHNE Tastenkürzel: ein globales Auf/Zu ist im
//    W3C-ARIA-APG kein Baum-Standard, ein erfundenes Kürzel wäre eine
//    Behauptung von Vertrautheit, die es nicht gibt (Kap. 4b, Pos. 16).
//
// Die Leiste ist reine Anordnung (§3): Übersicht, Feld und Baum kommen als
// fertige Elemente herein. Sie kennt weder Erlass noch Suchzustand — dadurch
// ist sie in der Spalte (D/S) und im Bottom-Sheet (H) dasselbe Bauteil.

export function LeserSeitenleiste({
  uebersicht, suchFeld, baum, baumTitel = 'Gliederung', onAlleAuf, onAlleZu, onAnfang, alleOffen,
}: {
  /** Übersichtsbox (Kap. 4b ①). `null` = noch nicht ladbar ⇒ Zeile entfällt. */
  uebersicht?: ReactNode;
  /** Such-/Sprungfeld. `undefined` NUR im Bottom-Sheet: dessen eigene Anatomie
   *  trägt das Feld bereits zuoberst (§5 — nie zwei Eingaben für dieselbe
   *  Absicht, genau der Fehler K2, den Pos. 4 behebt). */
  suchFeld?: ReactNode;
  /** Gliederungsbaum ODER — solange gesucht wird — die Trefferliste (Kap. 4b). */
  baum: ReactNode;
  /** Überschrift über dem klebenden Block; wechselt mit dem Inhalt. */
  baumTitel?: string;
  onAlleAuf: () => void;
  onAlleZu: () => void;
  /** «↑ Anfang» — genau EIN Knopf pro Seite (Pos. 15), mit Text-Label. */
  onAnfang: () => void;
  /** Steuert nur die Beschriftung des einen Knopfes (auf/zu), kein Zustand. */
  alleOffen: boolean;
}) {
  return (
    <div data-v3-leiste className="flex h-full min-h-0 flex-col">
      {/* Der ganze Block scrollt in EINEM Scroller; sticky wirkt darin. */}
      <div data-v3-leiste-scroller className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
        {uebersicht && (
          <div data-v3-leiste-uebersicht className="mb-3">{uebersicht}</div>
        )}
        {suchFeld && <div data-v3-leiste-feld className="mb-3">{suchFeld}</div>}
        {/* Ab hier klebt es. `bg-paper` ist Pflicht: ohne opake Fläche liefe der
            Baum beim Scrollen sichtbar unter der Kopfzeile durch. */}
        <div data-v3-leiste-baumkopf className="sticky top-0 z-10 -mt-0.5 bg-paper pb-2 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="lc-overline">{baumTitel}</h2>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" data-v3-alle
                onClick={alleOffen ? onAlleZu : onAlleAuf}
                aria-expanded={alleOffen}
                title={alleOffen ? 'Alle Gliederungsstufen zuklappen' : 'Alle Gliederungsstufen aufklappen'}
                className="lc-leiste-griff gap-1 px-1.5 text-micro">
                <span aria-hidden>{alleOffen ? '⌃' : '⌄'}</span>
                <span>{alleOffen ? 'alles zu' : 'alles auf'}</span>
              </button>
              <button type="button" data-v3-anfang onClick={onAnfang}
                title="Zum Anfang des Erlasses"
                className="lc-leiste-griff gap-1 px-1.5 text-micro">
                <span aria-hidden>↑</span><span>Anfang</span>
              </button>
            </div>
          </div>
        </div>
        <div data-v3-leiste-baum>{baum}</div>
      </div>
    </div>
  );
}
