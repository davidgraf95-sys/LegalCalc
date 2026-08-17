import { useRef, type ReactNode } from 'react';
import type { BestimmungsWort } from './erlassAnsicht';
import { PANEL_REITER, reiterTitel, type PanelReiter } from './panelModell';

// ─── Das Panel selbst: EIN Ort, DREI Reiter (FAHRPLAN-LESER-V3 Kap. 4d, H3) ───
//
// WAS DAS ERSETZT: das `KontextPanel` (765 Z.) mit sechs bedingten Sektionen, die
// je nach Datenlage erschienen und verschwanden — Pos. 17 «Kontext-Panel
// überladen». Drei benannte Reiter sind vorhersagbar: der Nutzer weiss, WO er
// nachsieht, bevor er weiss, ob dort etwas steht.
//
// Diese Datei ist nur die HÜLLE: Kopf, Reiter-Leiste, Scroller, Fuss. Was in
// einem Reiter steht, wissen `PanelEntscheide` / `PanelAenderungen` /
// `PanelMaterialien` — und nur die. Wer einen vierten Reiter braucht, ergänzt
// `PANEL_REITER` und übergibt einen weiteren Eintrag in `inhalt`.
//
// ── ECHTE REITER, ALSO ECHTE PFEILTASTEN (W3C ARIA APG «Tabs») ──────────────
// Anders als bei den Dropdowns des Lesers (dort «ehrliche Disclosure», KEIN
// role=menu) ist `role="tablist"` hier die richtige Rolle — und sie verspricht
// Pfeiltasten-Navigation. Das Versprechen wird eingelöst (←/→/Home/End unten),
// sonst wäre es genau die Lüge, die die Dropdown-Entscheidung vermeidet (§8).
// Roving tabindex: nur der aktive Reiter ist in der Tab-Folge; ein Tab-Schritt
// führt von der Leiste in den Inhalt, nicht durch drei Knöpfe.
//
// ── DER FUSS IST LEER UND HAT EINEN NAMEN ───────────────────────────────────
// «Zitat-Export-Platz reservieren (nicht bauen)» (H3-Auftrag): der Fuss nimmt
// `fuss` entgegen und rendert OHNE Inhalt kein Element — kein Rahmen, keine
// Höhe, kein CLS. Reservierter Platz heisst hier ein benannter Anschluss, keine
// leere Fläche (dieselbe Regel wie bei den H1-Slots des Rahmens).

export function LeserPanel({
  panelId, titelId, artikelLabel, bestimmungsWort, reiter, setReiter, inhalt, onSchliessen,
  fuss, panelRef, kopfExtra,
}: {
  panelId: string;
  /** Id der Überschrift — der Aufrufer setzt sie als `aria-labelledby` an die
   *  Fläche (Spalte: `role="region"`, Blatt: `role="dialog"`). */
  titelId: string;
  /** Auf welchen Artikel bezieht sich der Reiter «Entscheide»? `null`, solange
   *  der Scroll-Spy keine Leseposition kennt — dann steht dort nichts statt
   *  eines erfundenen «Art. 1» (§8). */
  artikelLabel: string | null;
  /** C1 (H3-Nachzug): Zähl-Substantiv des Erlasses — der Reiter-Titel sagt «zu
   *  diesem Artikel» bzw. «zu diesem Paragraphen». Kommt aus der EINEN Ableitung
   *  (`./erlassAnsicht`), wird hier nie abgeleitet (§5). */
  bestimmungsWort: BestimmungsWort;
  reiter: PanelReiter;
  setReiter: (r: PanelReiter) => void;
  inhalt: Readonly<Record<PanelReiter, ReactNode>>;
  onSchliessen: () => void;
  fuss?: ReactNode;
  panelRef: React.RefObject<HTMLDivElement | null>;
  /** Griffleiste des Blatt-Modus (Wisch-Griff) — im Spalten-Modus ungesetzt. */
  kopfExtra?: ReactNode;
}) {
  const leisteRef = useRef<HTMLDivElement>(null);

  function taste(e: React.KeyboardEvent<HTMLDivElement>): void {
    const i = PANEL_REITER.findIndex((r) => r.id === reiter);
    const letzte = PANEL_REITER.length - 1;
    const ziel = e.key === 'ArrowRight' ? (i === letzte ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? letzte : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? letzte
      : -1;
    if (ziel < 0) return;
    e.preventDefault();
    const neu = PANEL_REITER[ziel];
    if (!neu) return;
    setReiter(neu.id);
    // Der Fokus folgt der Auswahl (APG «Tabs with automatic activation»):
    // sonst zeigte die Leiste einen anderen Reiter an als den, auf dem der
    // Fokus steht — zwei Wahrheiten in einer Leiste.
    leisteRef.current?.querySelector<HTMLElement>(`[data-v3-panel-reiter="${neu.id}"]`)?.focus();
  }

  return (
    // `rounded-xl` mit vollem Rahmen: die Zone gibt dem rechts angeschlagenen
    // Blatt eine Polsterung (`p-2`), es steht dort also frei im Bild; das unten
    // angeschlagene füllt die Breite und stösst an die Kante, wo die untere
    // Rundung unsichtbar bleibt. EINE Kantenregel für beide Gestalten statt zwei
    // Sonderfälle — die Gestalt entscheidet die Zone, nicht diese Datei (§3).
    <div ref={panelRef} tabIndex={-1} id={panelId} data-v3-panel
      className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-paper-raised shadow-lg">
      {kopfExtra}
      {/* ── Kopf: WAS ist das, WORAUF bezieht es sich, WEG damit ─────────────── */}
      <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-line px-2.5 py-1.5">
        <p id={titelId} className="lc-overline min-w-0 truncate">
          Rechtsprechung &amp; Kontext
          {artikelLabel && <span className="num ml-1 font-normal normal-case text-ink-600">· {artikelLabel}</span>}
        </p>
        <button type="button" onClick={onSchliessen} data-v3-panel-zu
          aria-label="Rechtsprechung und Kontext schliessen"
          title="Rechtsprechung und Kontext schliessen"
          className="-mr-1 shrink-0 rounded-md px-1.5 py-0.5 text-ink-500 hover:text-brass-700">
          <span aria-hidden className="text-base leading-none">✕</span>
        </button>
      </div>

      {/* ── Reiter-Leiste ─────────────────────────────────────────────────────── */}
      <div ref={leisteRef} role="tablist" aria-label="Kontext-Reiter" onKeyDown={taste}
        className="flex shrink-0 gap-1 border-b border-line px-1.5 pt-1.5">
        {PANEL_REITER.map((r) => {
          const aktiv = r.id === reiter;
          return (
            <button key={r.id} type="button" role="tab" id={`${panelId}-tab-${r.id}`}
              data-v3-panel-reiter={r.id}
              aria-selected={aktiv} aria-controls={`${panelId}-tafel-${r.id}`}
              tabIndex={aktiv ? 0 : -1} title={reiterTitel(r.id, bestimmungsWort)}
              onClick={() => setReiter(r.id)}
              className={`-mb-px rounded-t-md border-b-2 px-2 py-1 text-body-s transition-colors ${
                aktiv ? 'border-brass-500 font-medium text-ink-900' : 'border-transparent text-ink-500 hover:text-brass-700'
              }`}>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── Der EINE Scroller des Panels ──────────────────────────────────────
          `overscroll-contain`: Wischen im Panel zieht nicht die Seite dahinter
          mit (dieselbe Zusage wie im Gliederungs-Blatt). Nur die AKTIVE Tafel
          ist im DOM — drei gemountete Tafeln hätten alle drei Ladepfade
          gleichzeitig angestossen und damit das Nachladen ausgehebelt. */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin]">
        <div role="tabpanel" id={`${panelId}-tafel-${reiter}`} aria-labelledby={`${panelId}-tab-${reiter}`}>
          {inhalt[reiter]}
        </div>
      </div>

      {fuss && <div className="shrink-0 border-t border-line px-2.5 py-1.5">{fuss}</div>}
    </div>
  );
}
