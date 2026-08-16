import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import { LeserAnsichtV3 } from './LeserAnsichtV3';
import { ebeneAngabe } from './erlassAnsicht';
import { kopfElemente, type KopfStufe } from './kopfStufen';

// ─── Die EINE Kopfzeile des Lesers V3 (FAHRPLAN-LESER-V3 Kap. 4a, H1) ────────
//
//   D  │ Gesetze › StPO      Art. 429                    Ansicht ▾   ✕ │
//   S  │ StPO   Art. 429                        Ansicht ▾ ✕│
//   H  │ StPO · Art. 429   ☰   ···  ✕│
//
// EIN VERTRAG FÜR DREI BREITEN — und das ist die eigentliche Zusicherung von
// H1: dieselbe Komponente, derselbe Baum, dieselben Bedienelemente in der
// Einzelansicht, im primären UND im sekundären Pane. Die Datei enthält darum
// KEINE einzige `imPane`-Verzweigung (Kap. 10, Ziel «Kopf-/Layout-
// Verzweigungen 21 → 0»); was sich unterscheidet, ist ausschliesslich die
// gemessene BREITE, und die kommt als `stufe` aus einer Quelle
// (`./kopfStufen`, ResizeObserver am Rahmen). Bewiesen von
// `e2e/leser-kopf-paritaet.e2e.ts`.
//
// Was hier bewusst NICHT steht (Kap. 4a):
//  · kein Suchfeld — es lebt in der Seitenleiste (Kap. 4b, `SuchSprungFeld`),
//  · kein Menü «Rechtsprechung ▾» — die Facetten ziehen in H3 ins Panel,
//  · kein Chip «Stand …» — die eine Stand-Wahrheit steht im Erlass-Kopf
//    (Kap. 4e); die App-Leiste darüber führt ihn unverändert weiter.
//
// ✕ SCHLIESST DAS GESETZ, nicht die Anwendung: die App-Leiste (Einzelansicht
// `InhaltsKopf`, Split-View `PaneKopf`) trägt bereits ein ✕ mit App-Bedeutung
// («zur Startseite» bzw. «Pane schliessen»). Ein zweites ✕ mit derselben
// Bedeutung wäre eine Dopplung; ein ✕ ohne Bedeutung wäre schlimmer. Dieses
// hier führt zur Gesetzes-Übersicht — in einem Pane pane-lokal, weil jedes
// Pane seinen eigenen Navigator hat. Der Accessible-Name sagt es aus (§8).

export function LeserKopf({ erlass, aktArtikel, fussnotenAnzahl, stufe, gliederungKnopf, panelOeffner }: {
  erlass: BrowseErlass;
  /** Laufender Artikel aus dem bestehenden Scroll-Spy («Art. 429»). */
  aktArtikel: string | null;
  fussnotenAnzahl: number | null;
  stufe: KopfStufe;
  /** ☰-Öffner der Gliederung — der Rahmen baut ihn, wenn die Seitenleiste
   *  gerade NICHT als Spalte steht. `undefined` = die Gliederung ist sichtbar,
   *  ein Öffner wäre ein Knopf ohne Wirkung. */
  gliederungKnopf?: ReactNode;
  /** H3 — Öffner des Rechtsprechungs-Panels («⚖ 14 Entscheide →»). Leer
   *  gelassen kostet er nichts: kein Platzhalter, keine reservierte Fläche. */
  panelOeffner?: ReactNode;
}) {
  const navigate = useNavigate();
  const el = kopfElemente(stufe);
  // Ebene-Beschriftung aus dem Datenmodell, nicht aus `if (bund)` — die eine
  // Ableitung steht in `./erlassAnsicht` (Fundament-Auflage 2).
  const ebene = ebeneAngabe(erlass);

  return (
    // `sticky top` aus `--leser-v3-kopf-top`: der Rahmen legt den Wert EINMAL
    // aus (Einzelansicht = unter Topbar + App-Leiste, Pane = 0, weil PaneKopf
    // ausserhalb des Pane-Scrollers liegt). Dieselbe Variable speist
    // `--nt-stick`, also den Sprung-Offset — eine Quelle für «wie hoch klebt
    // es» (Risiko R1). Höhe aus `--leser-v3-kopf-h` (ebenfalls Rahmen).
    <div
      data-v3-kopf
      className="sticky z-[17] -mx-1 mb-4 border-b border-line bg-paper px-1"
      style={{ top: 'var(--leser-v3-kopf-top)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3" style={{ height: 'var(--leser-v3-kopf-h)' }}>
        {/* ── Ortsangabe: EINE schrumpfende Zone (Krume + laufender Artikel) ── */}
        <nav aria-label="Ort im Gesetz" data-v3-kopf-ort
          className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden whitespace-nowrap text-xs text-ink-500">
          {el.sektion && (
            <>
              <Link to="/gesetze" className="shrink-0 truncate no-underline hover:text-brass-700">Gesetze</Link>
              <span aria-hidden className="shrink-0 text-ink-300">›</span>
            </>
          )}
          <span data-v3-kopf-kuerzel className="shrink-0 font-medium text-ink-800">{erlass.kuerzel}</span>
          {el.volltitel && (
            <span className="min-w-0 truncate text-ink-500" title={`${erlass.titel} · ${ebene.label}`}>{erlass.titel}</span>
          )}
          {/* Der laufende Artikel fällt NIE (Kap. 4a) — darum `shrink-0`: beim
              Engerwerden gibt der Volltitel nach, nie die genauere Angabe.
              Auf der Mini-Stufe steht er als «StPO · Art. N» direkt hinter dem
              Kürzel, wie es die Skizze zeigt. */}
          {aktArtikel && (
            <span data-v3-kopf-artikel className="num shrink-0 text-micro font-medium text-ink-700">
              <span aria-hidden className="mr-1 text-ink-300">·</span>{aktArtikel}
            </span>
          )}
        </nav>

        {/* ── Griffe: ☰ (nur wenn nötig) · Ansicht · ✕ ────────────────────────
            Design-Grundlage Kap. 6: «Kopfzeile im Ruhezustand ≤ 4 Elemente,
            davon ≤ 2 reine Icons». Ort + Ansicht + ✕ = 3; ☰ tritt nur hinzu,
            wenn die Gliederung nicht ohnehin sichtbar ist. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {panelOeffner}
          {gliederungKnopf}
          <LeserAnsichtV3 kompakt={stufe === 'mini'} fussnotenAnzahl={fussnotenAnzahl} />
          <button type="button" onClick={() => navigate('/gesetze')}
            aria-label="Gesetz schliessen (zur Gesetzesübersicht)"
            title="Gesetz schliessen (zur Gesetzesübersicht)"
            data-v3-kopf-schliessen
            className="lc-leiste-griff">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
