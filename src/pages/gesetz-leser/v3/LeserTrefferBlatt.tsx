import type { ReactNode } from 'react';

// ═══ Ä76 (David-Befund 17.8.2026 abends) · DIE TREFFER STEHEN AM FELD ════════
//
// BEFUND, wörtlich: «wenn die gliederung ausgeblendet ist funktioniert suche
// nicht mehr resp. resultat ist versteckt. andere lösung finden.»
//
// GEMESSEN am Prod-Stand (afc008c19), StPO/V3, Gliederung per «‹ Gliederung
// ausblenden» zugeklappt, Suchbegriff «Entschädigung» — @1440 UND @1024:
//
//   Suchfeld:        1 (in der Kopf-Zone, Ä19 hält)
//   Zähler-Zeile:    «50 Artikel · 88 Fundstellen  Treffer anzeigen →», sichtbar
//   Trefferliste:    im DOM, `isVisible() === true` — aber als Rechteck
//                    y = 755, HÖHE 3596 px, INLINE über dem Lesetext
//
// Die Suche lief also, und die Liste war formal «sichtbar» — nur stand sie
// unterhalb der Falz (Viewport 900) und schob den gesamten Gesetzestext um 3,6
// Bildschirmhöhen nach unten. Wer suchte, sah: nichts ändert sich, und der Text,
// den er las, ist weg. Genau Davids Satz.
//
// WOHER: `LeserRahmenV3` gab die Liste als `trefferListe` in die Lesespalte —
// gedacht (so der Kommentar dort) für den Rand-Fall «kein Leiste-Inhalt, aber
// breit genug». Die Bedingung lautete aber `sucheAktiv && !zweiSpalten && istXl`,
// und `!zweiSpalten` ist bei ZUGEKLAPPTER Spalte wahr. Der Zweig traf damit
// einen Fall, für den er nie gedacht war — ein Kommentar, der etwas Engeres
// behauptet als sein Code (§7).
// KORREKTUR (Bug-Check 17.8.2026, Nachzug): hier stand «Er ist auf `!hatLeiste`
// verengt» — das war der ZWISCHENSTAND. Gebaut wurde die Verengung nicht,
// sondern die STREICHUNG: `hatLeiste` ist `eintraege.length > 0`, der
// angekündigte Rand-Fall «kein Leiste-Inhalt, aber breit genug» ist damit
// unerreichbar, und ein Zweig, den keine Eingabe erreicht, wird gestrichen statt
// bewacht (§17). Der Prop `trefferListe` existiert nicht mehr.
//
// ── WARUM EIN BLATT UND NICHT «SPALTE AUTOMATISCH AUFZIEHEN» ─────────────────
// Die zweite angebotene Lösung wäre gewesen: bei laufender Suche die Spalte
// aufklappen, bei Esc/✕ wieder zu. Sie ist an der MESSUNG gescheitert, nicht am
// Geschmack. Das Grid wechselt dabei `2.25rem` → `18rem` in der linken Spur, und
// die Lesespalte ist im rechten Feld zentriert (`mx-auto max-w-reading`):
//
//   @1440  Lesetext x = 434 → 560   (+126 px seitwärts)
//   @1024  Lesetext x = 226 → …     (Spur nimmt 15.75 rem, dieselbe Richtung)
//
// Der gelesene Text wäre also beim TIPPEN um mehr als hundert Pixel gewandert
// und bei Esc zurück — zweimal pro Suche. Genau diese Bewegung hat David am
// 16.8.2026 am Einklappen gerügt («sprang um 175 px … Sprung ohne Gewinn»), und
// der Rahmen führt sie seither ausdrücklich als Grund, warum das Grid STEHEN
// bleibt. Eine Suche darf den Satzspiegel nicht verschieben.
//
// GEWÄHLT ist darum das Blatt AM FELD: es liegt ausserhalb des Flusses
// (`absolute`), verschiebt also nichts — Lesetext-Position vor und nach dem
// Öffnen bitgleich —, und es steht dort, wo die Hand schon ist. Ä19 in seiner
// eigenen Fassung ist damit erfüllt: schmal (18 rem = die Breite der
// Gliederungs-Spalte, für die es einsteht), höchstens halbe Fensterhöhe, KEIN
// Vollflächen-Scrim, und der Lesetext bleibt links und rechts daneben sichtbar.
// Es verdeckt einen Rand des Satzspiegels — das ist der Preis eines Overlays und
// der Grund, warum es dismissbar ist; die Alternative («Blatt verdeckt das Pane
// vollständig») war der Ä19-Befund selbst.
//
// KEIN MODALER DIALOG. Kein Fokusfang, kein Scrim, `role="region"`: der Leser
// soll während offener Liste weiterlesen, scrollen und im Feld tippen können.
// Das Bottom-Sheet (`LeserLeisteSheet`) bleibt der modale Weg für < xl — dort
// gibt es keinen Platz neben dem Blatt, hier gibt es ihn.
//
// §3: reine Anordnung. Das Blatt kennt weder Erlass noch Suchmaschine; die Liste
// kommt fertig herein und ist DASSELBE Bauteil wie in der Spalte
// (`LeserGliederung` → `LeserTrefferListe`, eine Registry, §5) — kein zweiter
// Trefferbaustein, keine zweite Wahrheit.

// Der Offen-Zustand liegt in `./useTrefferBlatt` — `react-refresh/only-export-
// components` lässt neben einer Komponente keinen zweiten Export zu (Lint-Fehler
// beim Bau gesehen), und die Trennung folgt ohnehin dem Haus-Muster.

export function LeserTrefferBlatt({ liste, onSchliessen }: {
  /** Die Trefferliste — DASSELBE Bauteil wie in der Spalte (§5). */
  liste: ReactNode;
  onSchliessen: () => void;
}) {
  return (
    // `absolute` + `top-full`: hängt unter der Such-Zone, ohne Platz zu nehmen —
    // deshalb verschiebt das Öffnen den Lesetext um exakt 0 px, und deshalb
    // bleiben die Höhen-Konstanten der Zone (`SUCH_H_RUHE`/`SUCH_H_AKTIV`, B9)
    // samt dem daraus gerechneten Sprung-Offset `--nt-stick` unberührt.
    // `w-72` = 18 rem, die Breite der Gliederungs-Spalte, für die es einsteht;
    // `max-w-full` fängt schmale Panes. `max-h-[50dvh]` ist die Ä19-Zusage
    // «verdeckt den Text nicht» in Zahlen — dvh, nicht vh, damit die
    // Handy-Adressleiste sie nicht überzieht.
    // `bg-paper` (nicht `paper-raised`): der klebende Kopf der Trefferliste trägt
    // `bg-paper` fest, ein `paper-raised`-Blatt darunter gäbe die wandernde
    // Tonkante, die Ä5 am Leisten-Sockel schon einmal gekostet hat.
    <div data-v3-treffer-blatt role="region" aria-label="Treffer"
      onKeyDown={(e) => {
        // Esc IM Blatt nimmt das Blatt, nicht die Eingabe. Steht der Fokus im
        // Feld, greift dieser Zweig nicht — dort gilt Pos. 14 (Esc leert, springt
        // nicht), und das Leeren beendet die Suche und damit auch das Blatt.
        // KEIN Sprung, kein Scroll: die Leseposition bleibt in beiden Wegen
        // exakt stehen.
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        onSchliessen();
      }}
      /* A3-2 (R3-β): Anatomie aus `.lc-schwebeflaeche`. FIX dabei: das Blatt
         stand auf `--paper`, also in der Grundfarbe der Seite — der Schatten
         behauptete eine Ebene, die die Fläche dementierte. */
      className="lc-schwebeflaeche absolute left-0 top-full z-dropdown flex max-h-[50dvh] w-72 max-w-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-2 py-1">
        <h2 className="lc-overline">Treffer</h2>
        {/* Der Weg heraus ist BENANNT, nicht zu erraten — und er nimmt nur das
            Blatt: die Suche, der Begriff und die Leseposition bleiben, die
            Zähler-Zeile am Feld führt mit «Treffer anzeigen →» zurück (§8). */}
        <button type="button" data-v3-treffer-blatt-zu onClick={onSchliessen}
          title="Treffer ausblenden (Esc)" className="lc-leiste-griff gap-1 px-1.5 text-micro">
          <span aria-hidden>✕</span><span>ausblenden</span>
        </button>
      </div>
      {/* Eigener Scroller. KEIN `data-toc`: diese Marke ist der Anschluss des
          GETEILTEN Scroll-Spys (`inhalt-hooks.tsx` sucht sie, um die aktive
          Baumzeile mitzuführen) — sie hier ein zweites Mal zu setzen gäbe zwei
          Kandidaten für eine Mechanik, die genau einen erwartet. Gebraucht wird
          sie auch nicht: im Blatt steht die Trefferliste, kein Baum, und ihr
          klebender Kopf rechnet mit `var(--toc-deckel, 0px)` — der Rückfall 0 px
          ist hier der richtige Wert, weil über ihm nichts mehr klebt. */}
      <div data-v3-treffer-blatt-scroller
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-1 [scrollbar-width:thin]">
        {liste}
      </div>
    </div>
  );
}
