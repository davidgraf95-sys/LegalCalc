import { useRef, type RefObject } from 'react';

// ─── EIN Feld für Suchen UND Springen (FAHRPLAN-LESER-V3 Kap. 4b, Pos. 4) ────
//
// Der Ist-Leser hat ZWEI Eingaben für dieselbe Absicht «bring mich zu einer
// Stelle»: das In-Gesetz-Suchfeld im Kopf und den Quickjump «Art. N» im
// Gliederungs-Sheet (K2). V3 hat eines. Die Weiche ist der EINGABEWERT, nicht
// ein Umschalter:
//
//   «429» / «Art. 429» / «art429»  ⇒ auflösbar ⇒ Enter SPRINGT zum Artikel
//   alles andere                   ⇒ die bestehende In-Gesetz-Suche läuft
//
// Aufgelöst wird mit `loeseArtikelEingabe` (suchTreffer.ts) — derselben reinen
// Funktion, die der Ist-Quickjump benutzt (§5, keine zweite Erkennungsregel).
// Der Sprung selbst geht über `springeZuArtikel` des Rahmens und erbt damit den
// Sticky-Offset (`.nt-anker` → `--nt-stick`), den der Kopf setzt (Risiko R1).
//
// TASTATUR (Kap. 4h): `Esc` leert das Feld und schliesst die Trefferliste,
// SPRINGT ABER NICHT — die Scrollposition bleibt exakt stehen (Pos. 14,
// «recover from mistakes»). Darum ruft der Esc-Zweig ausdrücklich nichts als
// `setSuche('')`: jeder Sprung-Aufruf, auch ein «zurück an den Anfang», wäre
// eine Bewegung, die niemand angefordert hat. `stopPropagation` hält den
// Tastendruck zudem beim Feld — ein Esc, das die Trefferliste leert, soll nicht
// zusätzlich das Sheet schliessen, in dem das Feld steht.
//
// `⌘K`/`Ctrl+K` und `/` liegen NICHT hier, sondern im Rahmen
// (`./suchKuerzel`): das Feld ist bei zugeklappter Spalte gar nicht im DOM, ein
// Kürzel darin wäre dann still wirkungslos (Bug-Check B1, 16.8.2026).

export function SuchSprungFeld({
  wert, setzeWert, loeseArtikel, onSprung, feldRef, onVor, onZurueck, hatTreffer = false,
}: {
  wert: string;
  setzeWert: (v: string) => void;
  /** «Art. 429» → Token, sonst `null`. Fehlt sie (Snapshot noch nicht da),
   *  bleibt das Feld eine reine Suche — nie ein totes Sprung-Versprechen (§8). */
  loeseArtikel?: (eingabe: string) => string | null;
  onSprung: (token: string) => void;
  /** Damit der Rahmen den Fokus setzen kann (Fläche öffnet → Feld fokussieren). */
  feldRef?: RefObject<HTMLInputElement | null>;
  /** H2 · ↓ bzw. ↑ im Feld: nächste/vorherige Fundstelle (Kap. 4h). */
  onVor?: () => void;
  onZurueck?: () => void;
  /** Gibt es überhaupt Fundstellen? Ohne sie tun ↑↓ und Enter nichts — und das
   *  Feld verspricht sie dann auch nicht (§8). */
  hatTreffer?: boolean;
}) {
  const eigenerRef = useRef<HTMLInputElement>(null);
  const ref = feldRef ?? eigenerRef;

  const token = loeseArtikel && wert.trim() !== '' ? loeseArtikel(wert) : null;

  return (
    <div data-v3-suchsprung className="space-y-1">
      <div className="relative">
        <input
          ref={ref}
          type="search"
          value={wert}
          onChange={(e) => setzeWert(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              // Kein Sprung, kein Scroll — nur leeren (Pos. 14). Und nicht
              // weiterreichen: im Sheet läge sonst «Feld leeren» und «Sheet
              // schliessen» auf demselben Tastendruck.
              e.preventDefault();
              e.stopPropagation();
              setzeWert('');
              return;
            }
            // ↑↓ wechseln die Fundstelle (Kap. 4h). Sie liegen auf dem FELD und
            // nicht auf der Liste, weil die Hand beim Tippen dort ist — genau
            // dieselbe Erwartung, die jede Browser-Suchleiste bedient.
            // `preventDefault` ist Pflicht: sonst setzt der Browser zusätzlich
            // die Schreibmarke an den Feldanfang bzw. das Feldende.
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && hatTreffer) {
              e.preventDefault();
              if (e.key === 'ArrowDown') onVor?.();
              else onZurueck?.();
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              // Vorrang hat der ARTIKEL-Sprung: wer «Art. 429» tippt, meint
              // genau diesen Artikel und keine Fundstelle darin. Sonst rückt
              // Enter auf die nächste Fundstelle vor — die Taste tut damit
              // immer das, was das Feld gerade anbietet, und nie nichts.
              if (token) onSprung(token);
              else if (hatTreffer) onVor?.();
            }
          }}
          placeholder="Suchen oder «Art. 429» …"
          aria-label="Im Gesetz suchen oder zu einem Artikel springen"
          aria-describedby={token ? 'v3-sprung-hinweis' : undefined}
          // `pr-16` bzw. `pr-8`: Platz für ✕ und ⌘K, damit lange Eingaben nicht
          // unter den Bedienzeichen verschwinden.
          className={`lc-input h-8 w-full min-w-0 py-0 pl-2.5 text-body-s ${wert !== '' ? 'pr-16 sm:pr-20' : 'pr-8 sm:pr-10'}`}
        />
        {/* ✕ — sichtbar und mit Namen, statt sich auf das native Kreuz von
            `type="search"` zu verlassen: das erscheint je nach Browser gar
            nicht, trägt keinen zugänglichen Namen und ist kein 44-px-Ziel.
            WICHTIG (Pos. 14): der Knopf leert NUR. Kein Sprung, kein Scroll,
            kein Fokusverlust — der Fokus bleibt im Feld, damit die nächste
            Eingabe ohne Umweg beginnt. */}
        {wert !== '' && (
          <button type="button" data-v3-such-leeren
            onClick={() => { setzeWert(''); ref.current?.focus(); }}
            aria-label="Suche leeren"
            title="Suche leeren (Esc)"
            className="absolute right-6 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-paper-sunken/70 hover:text-brass-700 sm:right-8">
            <span aria-hidden className="text-body-s leading-none">✕</span>
          </button>
        )}
        {/* Das Kürzel steht sichtbar am Feld — ein Kürzel, das man kennen muss,
            ist keines (Design-Grundlage Kap. 8: sichtbar im Ruhezustand). Auf
            Touch-Breiten ausgeblendet, dort gibt es keine Tastatur.
            `ink-500`, NICHT `ink-400`: `ink-400` ist ein Deko-Token (~3.1:1 auf
            der Feldfläche) und trägt hier sichtbaren Text — axe meldete
            `color-contrast`, serious. Dieselbe Klasse wie W3.6 (25.6.2026) und
            der Menü-Befund vom 26.7.2026; `aria-hidden` hilft nicht, das Zeichen
            ist ja zu sehen. */}
        <kbd aria-hidden className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none text-micro text-ink-500 sm:block">⌘K</kbd>
      </div>
      {token && (
        <button type="button" id="v3-sprung-hinweis" data-v3-sprung-hinweis
          onClick={() => onSprung(token)}
          className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-body-s text-brass-700 transition-colors hover:bg-brass-100/50">
          <span aria-hidden>→</span>
          <span>Zu <span className="num font-medium">{wert.trim()}</span> springen</span>
          <kbd aria-hidden className="ml-auto hidden text-micro text-ink-500 sm:block">↵</kbd>
        </button>
      )}
    </div>
  );
}
