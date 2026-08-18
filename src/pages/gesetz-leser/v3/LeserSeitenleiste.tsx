import { useCallback, type ReactNode } from 'react';

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
  uebersicht, suchFeld, baum, baumTitel, onAlleAuf, onAlleZu, onAnfang, alleOffen,
  baumKnoepfe = true,
}: {
  /** Übersichtsbox (Kap. 4b ①). `null` = noch nicht ladbar ⇒ Zeile entfällt. */
  uebersicht?: ReactNode;
  /** Such-/Sprungfeld. `undefined` NUR im Bottom-Sheet: dessen eigene Anatomie
   *  trägt das Feld bereits zuoberst (§5 — nie zwei Eingaben für dieselbe
   *  Absicht, genau der Fehler K2, den Pos. 4 behebt). */
  suchFeld?: ReactNode;
  /** Gliederungsbaum ODER — solange gesucht wird — die Trefferliste (Kap. 4b). */
  baum: ReactNode;
  /** Überschrift über dem klebenden Block; wechselt mit dem Inhalt.
   *
   *  Ä10 (H2b): `undefined` = KEINE eigene Überschrift. Gebraucht dort, wo der
   *  Behälter die Zone schon benennt — im Bottom-Sheet stand «Gliederung»
   *  zweimal übereinander (Sheet-Kopf + dieses `h2`, gemessen 17.8.2026: zwei
   *  Textknoten mit identischem Inhalt in einem 390-px-Blatt). Die Leiste
   *  behauptet damit keine Zonen-Benennung mehr, die ihr Behälter besser kennt —
   *  und bleibt ohne `imSheet`-Verzweigung (§3: sie kennt ihren Behälter nicht). */
  baumTitel?: string;
  onAlleAuf: () => void;
  onAlleZu: () => void;
  /** «↑ Anfang» — genau EIN Knopf pro Seite (Pos. 15), mit Text-Label. */
  onAnfang: () => void;
  /** Steuert nur die Beschriftung des einen Knopfes (auf/zu), kein Zustand. */
  alleOffen: boolean;
  // C4 (H3-Nachzug): der Slot `extra` («zusätzliche Blöcke unter dem Baum») ist
  // gestrichen. Gedacht war er als Anschluss für die Kontext-Reiter — die stehen
  // seit H3 im Panel, und der Slot hatte über drei Etappen keinen Aufrufer (§17,
  // Herleitung im Rahmen).
  /** Ä32 (H2b-Nachzug): Steht in Zone B wirklich der GLIEDERUNGSBAUM? Nur dann
   *  hat «alles auf/zu» ein Ziel. `false` setzt der Aufrufer, während die
   *  Trefferliste an seinem Platz liegt — Herleitung unten am Markup. */
  baumKnoepfe?: boolean;
}) {
  // ── W-1 · Zone A publiziert ihre Höhe als `--toc-deckel` (Befund 16.8.2026) ─
  // Die Trefferliste klebt mit `top: var(--toc-deckel, 0px)`
  // (`LeserTrefferListe.tsx`) — das ist aus V1 geerbt und dort richtig, weil
  // dort `inhalt-volltext.tsx` die Marke setzt. In V3 setzte sie NIEMAND: der
  // Rückfallwert 0px griff, und damit klebten Trefferlisten-Kopf UND Zone A
  // beide bei `top: 0`. Gemessen: `elementFromPoint` auf der Mitte des
  // Suchfelds traf `SuchBereichWahl` — die Facetten-Leiste legte sich beim
  // Scrollen über das Feld, mit dem man sucht.
  //
  // Wörtlich dieselbe Mechanik wie V1 (§5 — eine Bedeutung, ein Muster): Zone A
  // misst sich selbst und legt die Höhe auf den `[data-toc]`-Scroller. Reine
  // Darstellungs-Geometrie, kein State ⇒ kein Re-Render (§15). Der `ResizeObserver`
  // ist nötig, weil Zone A ihre Höhe ändert, sobald das Suchfeld erscheint oder
  // die Kopfzeile umbricht — ein einmaliges Messen wäre beim ersten Tippen falsch.
  const zoneARef = useCallback((el: HTMLDivElement | null) => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ziel = el.closest('[data-toc]') as HTMLElement | null;
    if (!ziel) return;
    const setze = () => ziel.style.setProperty('--toc-deckel', `${Math.round(el.getBoundingClientRect().height)}px`);
    setze();
    const ro = new ResizeObserver(setze);
    ro.observe(el);
    // Kein Cleanup-Rückgabewert: ein Callback-Ref darf keinen liefern. Der
    // Observer stirbt mit dem Element; beim Unmount ruft React den Callback
    // ohnehin mit `null`, worauf hier nichts Neues entsteht.
  }, []);

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
        {/* Ab hier klebt es. `bg-paper` ist Pflicht: ohne opake Fläche liefe der
            Baum beim Scrollen sichtbar unter der Kopfzeile durch. */}
        {/* `data-toc-zone-a`: derselbe geteilte Anschluss — der Mitscroll-Nudge
            misst daran, wie viele oberste Pixel des Scrollers dieser klebende
            Sockel verdeckt. Ohne die Marke schöbe er die aktive Zeile exakt
            darunter und meldete «sichtbar», was niemand sieht. */}
        {/* ── H2 · DAS FELD KLEBT MIT (David 16.8.2026) ─────────────────────
            «Das Suchfeld muss immer zugreifbar sein, auch wenn ich in der
            Gliederung scrolle.» Bis hierher stand das Feld ÜBER dem klebenden
            Block und scrollte mit der Übersichtsbox weg — wer tief im Baum der
            StPO stand und suchen wollte, musste erst die Leiste hochscrollen.
            Reihenfolge im klebenden Block, in dieser Folge (Präzisierung David
            16.8.): 1. Such-/Sprungfeld ganz oben · 2. Gliederungs-Kopfzeile ·
            3. der scrollbare Baum. Die Übersichtsbox bleibt darüber und scrollt
            weiterhin weg — sie ist Ankunfts-Information, kein Werkzeug. */}
        {/* ── Ä5 (H2b) · DER SOCKEL TRÄGT DIE FLÄCHE SEINES BEHÄLTERS ──────────
            Bis H2 stand hier fest `bg-paper`. In der Spalte ist das richtig, im
            Bottom-Sheet nicht: das Sheet liegt auf `paper-raised`, der Sockel
            malte darauf ein `paper`-Rechteck (gemessen 17.8.2026: rgb(255,254,252)
            gegen rgb(252,250,246)) — eine sichtbare, wandernde Kante, sobald man
            in der Leiste scrollt. Gestapelte Töne sind ausdrücklich verboten
            (Design-Grundlage Kap. 5).
            `.lc-leiste-sockel` liest `--leser-leiste-flaeche` und fällt auf
            `--paper` zurück; den Wert setzt der BEHÄLTER (der Rahmen am
            Sheet-Träger). Damit bleibt die Leiste ohne Behälter-Verzweigung (§3)
            und es gibt weiterhin genau EINE opake Fläche über dem Baum. */}
        <div ref={zoneARef} data-toc-zone-a data-v3-leiste-baumkopf className="lc-leiste-sockel sticky top-0 z-10 -mt-0.5 space-y-2 pb-2 pt-0.5">
          {suchFeld && <div data-v3-leiste-feld>{suchFeld}</div>}
          {/* ── Ä32 (H2b-Nachzug) · «ALLES AUF» GEHÖRT DEM BAUM ────────────────
              BEFUND (Ästhetik-Prüfung 17.8.2026, `lugue-H-hell-suche-liste`): im
              Treffer-Blatt hing die Knopfgruppe «⌄ alles auf   ↑ Anfang»
              etikettlos rechts — Ä10 hatte die Überschrift der Leiste dort
              entfernt (der Blatt-Kopf benennt die Zone), und übrig blieben zwei
              Knöpfe ohne Bezug. Der eigentliche Fehler steckt dahinter: «alle
              Gliederungsstufen aufklappen» klappt einen Baum auf, der während
              einer Suche gar nicht steht — an seinem Platz liegt die
              Trefferliste, die ihre Artikel EINZELN aufklappt. Ein Knopf, der
              etwas anderes tut als er sagt, ist schlimmer als keiner (§8).
              JETZT: der Auf/Zu-Knopf erscheint nur, wenn der Baum gezeigt wird
              (`baumTitel` ist genau dann gesetzt bzw. der Behälter benennt ihn —
              der Aufrufer sagt es über `baumKnoepfe`). «↑ Anfang» bleibt in
              beiden Zuständen: es bezieht sich auf den ERLASS, nicht auf den
              Baum, und ist «genau EIN Knopf pro Seite» (Pos. 15). */}
          <div className={`flex items-center gap-2 ${baumTitel ? 'justify-between' : 'justify-end'}`}>
            {baumTitel && <h2 className="lc-overline">{baumTitel}</h2>}
            <div className="flex shrink-0 items-center gap-1">
              {baumKnoepfe && (
                <button type="button" data-v3-alle
                  onClick={alleOffen ? onAlleZu : onAlleAuf}
                  aria-expanded={alleOffen}
                  title={alleOffen ? 'Alle Gliederungsstufen zuklappen' : 'Alle Gliederungsstufen aufklappen'}
                  className="lc-leiste-griff gap-1 px-1.5 text-micro">
                  <span aria-hidden>{alleOffen ? '⌃' : '⌄'}</span>
                  <span>{alleOffen ? 'alles zu' : 'alles auf'}</span>
                </button>
              )}
              <button type="button" data-v3-anfang onClick={onAnfang}
                title="Zum Anfang des Erlasses"
                className="lc-leiste-griff gap-1 px-1.5 text-micro">
                <span aria-hidden>↑</span><span>Anfang</span>
              </button>
            </div>
          </div>
        </div>
        {/* `data-toc-baum` ist — wie `data-toc` darüber — KEIN Testhaken,
            sondern ein geteilter Anschluss: die Taste «t» (`parts/LeserTastatur`)
            setzt den Fokus auf das erste Ziel im BAUM. Ohne die Marke suchte sie
            im ganzen Scroller und traf seit H2b den Quell-Link im Steckbrief,
            der hier zuoberst steht (Klick-Test B7, 18.8.2026). */}
        <div data-v3-leiste-baum data-toc-baum>{baum}</div>
      </div>
    </div>
  );
}
