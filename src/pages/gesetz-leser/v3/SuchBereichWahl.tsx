import type { SuchBereich } from '../leserSuche';

// ─── Suchbereich — vier Werte, EINE Zeile (Kap. 4b, Pos. 5) ─────────────────
//
// «Wo soll gesucht werden?» ist im Gesetz eine echte Frage: wer «Kosten» in der
// StPO sucht, will je nach Absicht die Bestimmungen ÜBER Kosten (Randtitel und
// Gliederung) oder jede Stelle, an der das Wort im Wortlaut steht. Ohne diese
// Wahl liefert der Fliesstext den Titeltreffer unter Hunderten begraben.
//
// SEGMENT STATT DROPDOWN: vier Werte, alle gleich wichtig, ständig im Zugriff —
// ein Dropdown versteckte den Zustand hinter einem Klick, und der Zustand ist
// hier die halbe Aussage der Trefferliste (§8). Vier kurze Wörter passen auch in
// die 15-rem-Leiste; die Prüfung darauf ist `leser-v3-suchbereich`.
//
// `radiogroup` statt einer Knopfreihe: genau EIN Wert ist gewählt, und die
// W3C-ARIA-APG kennt dafür das Radio-Muster mit Pfeiltasten-Navigation. Eine
// Reihe aus `<button aria-pressed>` wäre eine Mehrfachwahl-Zusage, die hier
// falsch ist.

/** Beschriftungen — kurz, weil sie nebeneinander in einer schmalen Spalte stehen. */
const LABEL: Record<SuchBereich, { kurz: string; lang: string }> = {
  alles: { kurz: 'Alles', lang: 'Im ganzen Erlass suchen' },
  titel: { kurz: 'Titel', lang: 'Nur in Randtiteln und Gliederungstiteln suchen' },
  text: { kurz: 'Text', lang: 'Nur im Wortlaut suchen (mit Tabellen)' },
  fussnoten: { kurz: 'Fussnoten', lang: 'Nur im Fussnoten-Apparat suchen' },
};

const REIHE: SuchBereich[] = ['alles', 'titel', 'text', 'fussnoten'];

export function SuchBereichWahl({
  wert, setzeWert,
}: {
  wert: SuchBereich;
  setzeWert: (b: SuchBereich) => void;
}) {
  return (
    <div data-v3-suchbereich role="radiogroup" aria-label="Suchbereich"
      className="flex flex-wrap items-center gap-0.5 rounded-md bg-paper-sunken/50 p-0.5">
      {REIHE.map((b) => {
        const aktiv = wert === b;
        return (
          <button key={b} type="button" role="radio" aria-checked={aktiv}
            data-v3-bereich={b} data-v3-bereich-aktiv={aktiv ? '1' : undefined}
            title={LABEL[b].lang}
            onClick={() => setzeWert(b)}
            // `min-h-8` statt der 44 px der Sprung-Knöpfe: dies ist ein
            // Filter-Segment in einer Werkzeugzeile, kein Sprungziel im
            // Lesefluss — dieselbe Einordnung wie «alles auf/zu» daneben, das
            // ebenfalls auf Leisten-Höhe sitzt (`lc-leiste-griff`).
            className={`min-h-8 flex-1 rounded px-1.5 py-1 text-micro transition-colors ${
              aktiv
                ? 'bg-paper font-medium text-ink-800 shadow-sm'
                : 'text-ink-600 hover:bg-paper/60 hover:text-brass-700'
            }`}>
            {LABEL[b].kurz}
          </button>
        );
      })}
    </div>
  );
}
