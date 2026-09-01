import { useRef, type ReactNode } from 'react';
import { tafelId, tafelReiterId } from './tafelReiterIds';

// ─── TafelReiter: Unterstrich-Reiter an der OBERKANTE einer Tafel (§3) ───────
//
// DIE ZWEITE DEKLARIERTE UMSCHALTER-FORM DES HAUSES (R4-2, 31.8.2026).
// `ui/Tabs` ist die erste: eine Segmented-Control, ein gerahmtes Kästchen, das
// IM Fluss steht («welche Verfahrensphase?», «welche Ansicht?»). Diese hier ist
// die andere Grammatik: Reiter, die an der Kante einer Fläche sitzen und deren
// INHALT austauschen — der aktive trägt einen Strich in Messing, die Leiste
// selbst ist die Linie, auf der sie stehen (`border-b` + `-mb-px` am Knopf).
// Zwei Formen, weil sie zwei verschiedene Dinge sagen; nicht mehr als zwei,
// weil jede weitere nur noch dasselbe anders sagte (§1/§5/§10).
//
// WOHER SIE KOMMT. Wortlaut und Verhalten sind der Leiste des Leser-Panels
// (`pages/gesetz-leser/v3/LeserPanel.tsx`, H3/H4-II) unverändert entnommen —
// sie hatte die Grammatik als einzige Fläche vollständig gebaut, samt der
// gemessenen Zusagen, die hier mitwandern:
//   · APG-Tastatur (←/→/Home/End, roving tabindex) — `role="tab"` VERSPRICHT
//     Pfeiltasten; eine Leiste ohne sie lügt (§8). Der Fokus folgt der Auswahl
//     («automatic activation»), sonst zeigte die Leiste einen anderen Reiter
//     als den, auf dem der Fokus steht: zwei Wahrheiten in einer Leiste.
//   · `lc-scrollrand-x` (LM-063-Klasse, B8): gemessen 31.8.2026 @1440 waren im
//     Panel 35 px Scrollweg ohne Scrollbalken (`scrollbar-width:none`) — der
//     vierte Reiter stand angeschnitten und NICHTS sagte es. Der Deckel-Ton
//     folgt der Fläche, auf der die Leiste sitzt (darum `grund`).
//   · `aria-controls` auf die Tafel und die dazu passende Id-Grammatik
//     (`tafelReiterId`/`tafelId`) — EINE Ableitung für beide Enden der
//     Verdrahtung, damit Reiter und Tafel nie auseinanderlaufen (§5).
//
// WER JETZT DARÜBER LÄUFT. Das Leser-Panel selbst und der Startseiten-
// Schnellrechner. Letzterer war der Anlass (R4-2): seine Reiter versprachen
// `role="tab"`, lieferten aber weder Tastatur noch `tabindex` noch eine
// `role="tabpanel"`-Tafel — dieselbe ARIA-Lüge, die das Panel bewusst vermied.
// Er ist damit nicht «angeglichen», sondern abgelöst: die Kopie ist gelöscht.

export type TafelReiterItem<T extends string> = {
  code: T;
  label: ReactNode;
  /** Zusatzauskunft am Reiter (`title`) — nie einzige Trägerin einer Tatsache. */
  titel?: string;
};

/** Deckel-Ton der Scrollrand-Affordanz = Farbe der Fläche, die er abdeckt. */
const GRUND: Record<'raised' | 'surface', string> = {
  raised: 'lc-scrollrand-grund-raised',
  surface: 'lc-scrollrand-grund-surface',
};

const KNOPF = '-mb-px whitespace-nowrap rounded-t-md border-b-2 text-body-s transition-colors';
const AKTIV = 'border-brass-500 font-medium text-ink-900';
const INAKTIV = 'border-transparent text-ink-500 hover:text-brass-700';

export function TafelReiter<T extends string>({
  items, value, onChange, ariaLabel, idPraefix, grund = 'raised', breit = false, datenName,
}: {
  items: readonly TafelReiterItem<T>[];
  value: T;
  onChange: (code: T) => void;
  ariaLabel: string;
  /** Namensraum der Id-Paare (`<praefix>-tab-…` ↔ `<praefix>-tafel-…`). */
  idPraefix: string;
  /** Fläche unter der Leiste — bestimmt den Deckel-Ton des Scrollrands. */
  grund?: 'raised' | 'surface';
  /**
   * Die Leiste füllt die Oberkante einer KARTE statt die eines dichten Panels.
   *
   * Eine Gestalt, kein Satz freier Regler: die Reiter teilen sich die Breite
   * gleichmässig (`flex-1`) und tragen die grössere Polsterung der Karte. So
   * kam die Schnellrechner-Leiste (drei Reiter über die volle Kartenbreite)
   * unter den Baustein, ohne dass ihre Proportion verlorenging — derselbe Weg,
   * den `ui/Tabs` mit `groesse="zweizeilig"` gegangen ist: der EINE Baustein
   * bekommt die fehlende Variante, statt dass die Kopie stehen bleibt (§5/§10).
   */
  breit?: boolean;
  /**
   * Name eines `data-*`-Attributs, das jeder Reiter mit seinem Code trägt.
   *
   * Das Leser-Panel hängt seine e2e-Zusagen an `data-v3-panel-reiter` (vier
   * Dateien unter `e2e/leser-v3-panel-*`). Der Haken gehört der Fläche, nicht
   * dem Baustein — darum benennt ihn der Aufrufer.
   */
  datenName?: string;
}) {
  const leisteRef = useRef<HTMLDivElement>(null);

  function taste(e: React.KeyboardEvent<HTMLDivElement>): void {
    const i = items.findIndex((r) => r.code === value);
    const letzte = items.length - 1;
    const ziel = e.key === 'ArrowRight' ? (i === letzte ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? letzte : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? letzte
      : -1;
    if (ziel < 0) return;
    e.preventDefault();
    const neu = items[ziel];
    if (!neu) return;
    onChange(neu.code);
    // Der Fokus folgt der Auswahl (APG «Tabs with automatic activation»). Die
    // Kinder der Leiste SIND die Reiter, in genau dieser Reihenfolge — darum
    // reicht der Index, und der Baustein braucht keinen Selektor auf ein
    // Attribut, das nur eine der Flächen setzt.
    (leisteRef.current?.children[ziel] as HTMLElement | undefined)?.focus();
  }

  return (
    <div ref={leisteRef} role="tablist" aria-label={ariaLabel} onKeyDown={taste}
      className={`lc-scrollrand-x ${GRUND[grund]} flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden border-b border-line ${breit ? 'px-3 pt-3' : 'px-1.5 pt-1.5'} [scrollbar-width:none]`}>
      {items.map((r) => {
        const aktiv = r.code === value;
        const daten = datenName ? ({ [datenName]: r.code } as Record<string, string>) : undefined;
        return (
          <button key={r.code} type="button" role="tab" id={tafelReiterId(idPraefix, r.code)}
            {...daten}
            aria-selected={aktiv} aria-controls={tafelId(idPraefix, r.code)}
            tabIndex={aktiv ? 0 : -1} title={r.titel}
            onClick={() => onChange(r.code)}
            className={`${KNOPF} ${breit ? 'flex-1 px-3 py-2.5' : 'shrink-0 px-2 py-1'} ${aktiv ? AKTIV : INAKTIV}`}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
