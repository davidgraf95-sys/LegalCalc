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
    // `flex-1 min-h-0` statt `h-full`: der Vorfahre (die klebende Spalte) hat eine
    // `max-height`, KEINE feste Höhe — und `height:100%` löst gegen eine
    // Maximalhöhe nicht auf (CSS-Spec). Die Folge war ein Scroller, der auf die
    // volle Inhaltshöhe wuchs und darum nichts zu scrollen hatte: der Überschuss
    // wurde stumm abgeschnitten (belegt am OR @1440×900, scrollHeight ===
    // clientHeight === 1082 bei 712 px Spaltenhöhe). Dieselbe Flex-Anatomie wie
    // die Ist-Spalte (`inhalt-volltext.tsx`, `flex-1 min-h-0` im `[data-toc]`).
    <div data-v3-leiste className="flex min-h-0 flex-1 flex-col">
      {/* Der ganze Block scrollt in EINEM Scroller; sticky wirkt darin.
          `data-toc` ist KEIN Testhaken, sondern der Anschluss an die GETEILTE
          Mechanik: der Scroll-Spy in `inhalt-hooks.tsx` sucht `[data-toc]`, um
          die aktive Baumzeile mitzuführen (P9b/A33) und um den
          Nutzer-Interaktions-Guard anzuhängen. Ohne die Marke lief beides in V3
          ins Leere — die Gliederung wäre beim Lesen still stehen geblieben. */}
      <div data-toc data-v3-leiste-scroller className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
        {uebersicht && (
          <div data-v3-leiste-uebersicht className="mb-3">{uebersicht}</div>
        )}
        {suchFeld && <div data-v3-leiste-feld className="mb-3">{suchFeld}</div>}
        {/* Ab hier klebt es. `bg-paper` ist Pflicht: ohne opake Fläche liefe der
            Baum beim Scrollen sichtbar unter der Kopfzeile durch. */}
        {/* `data-toc-zone-a`: derselbe geteilte Anschluss — der Mitscroll-Nudge
            misst daran, wie viele oberste Pixel des Scrollers dieser klebende
            Sockel verdeckt. Ohne die Marke schöbe er die aktive Zeile exakt
            darunter und meldete «sichtbar», was niemand sieht. */}
        <div data-toc-zone-a data-v3-leiste-baumkopf className="sticky top-0 z-10 -mt-0.5 bg-paper pb-2 pt-0.5">
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
