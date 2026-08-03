import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { usePaneSteuerung } from '../layout/usePaneLayout';

// ─── V3 · Regeste-Popover am KantenChip (W2·10-UI-NAV) ───────────────────────
//
// «Norm lesen → Leitfall kurz prüfen → weiterlesen» ohne Kontextwechsel: der
// Chip zeigt heute nur die Zitierung; die Kurzzeile des Entscheids liegt als
// `title` im DOM und ist damit auf dem Desktop erst nach ~1 s Systemtooltip und
// ohne jede Aktion sichtbar. Dieses Popover macht denselben, BEREITS GELADENEN
// Bestandstext (Shard-Feld `regesteKurz`) lesbar und hängt die zwei Wege daran,
// die man danach gehen will: «Öffnen» und «Daneben öffnen».
//
// ── KEINE NEUE DATENQUELLE (§5) ────────────────────────────────────────────
// Der Text kommt aus dem Kanten-/Leitfall-Shard, den der Reader ohnehin einmal
// je Erlass lädt. Kein Fetch je Chip, kein zweiter Index, keine Rechtslogik (§3).
//
// ── EHRLICHE BESCHRIFTUNG (§8) ─────────────────────────────────────────────
// `regesteKurz` ist NICHT durchweg eine amtliche Regeste: die Feldregel
// (`manifestRegesteKurz`, entscheide-schreiben.ts) füllt es aus der geglätteten
// amtlichen Regeste ODER — für die BS-Tranche — aus dem amtlichen Betreff des
// Portals. Der Shard führt das unterscheidende Flag (`regesteVorhanden`) NICHT
// mit. Darum heisst der Block hier «Kurztext» und nicht «Regeste»: ein Betreff
// als Regeste zu etikettieren wäre genau der Etikettenschwindel, den §8
// verbietet. Was er ist, sagt der Titel des Kopfes vollständig.
//
// ── POSITION: PORTAL + fixed (§15.2) ───────────────────────────────────────
// Die Kanten-Linie (`.lc-bezug-linie`) ist ein `overflow-x:auto`-Container mit
// `overflow-y:hidden` — ein inline positioniertes Popover würde dort in BEIDEN
// Achsen beschnitten. Es hängt darum per Portal an <body> und wird `fixed` am
// gemessenen Chip-Rechteck ausgerichtet: kein Knoten im Lesefluss, keine
// Layout-Verschiebung, CLS 0 by construction. Scrollen/Resize SCHLIESSEN das
// Popover, statt es nachzuführen — Nachführen hiesse Rect-Messung je Frame
// (Layout-Thrash unter Drossel, §15).

/** Sicherheitsabstand zum Viewport-Rand und zum Chip (px, Design-Konstanten). */
const RAND = 8;
const ABSTAND = 6;
const BREITE = 320;

interface Lage { links: number; oben: number; obenAusgerichtet: boolean }

function berechneLage(rect: DOMRect, hoehe: number, vw: number, vh: number): Lage {
  const breite = Math.min(BREITE, vw - 2 * RAND);
  const links = Math.max(RAND, Math.min(rect.left, vw - breite - RAND));
  const platzUnten = vh - rect.bottom - ABSTAND - RAND;
  // Unter den Chip, solange es passt; sonst darüber (klassische Flip-Regel).
  const nachOben = platzUnten < hoehe && rect.top - ABSTAND - RAND > platzUnten;
  return {
    links,
    oben: nachOben ? Math.max(RAND, rect.top - ABSTAND - hoehe) : rect.bottom + ABSTAND,
    obenAusgerichtet: !nachOben,
  };
}

export function RegestePopover({ ankerRect, zitierung, kurztext, ziel, statusLabel, autoFokus = false, onClose }: {
  /** Gemessenes Rechteck des auslösenden Chips (Viewport-Koordinaten). */
  ankerRect: DOMRect;
  zitierung: string;
  /** Bestandstext aus dem Shard (Regeste-Auszug bzw. amtlicher Betreff). */
  kurztext: string;
  /** Interner Reader-Pfad des Entscheids (trägt bereits `?norm=`). */
  ziel: string;
  /** Rang-Klartext der Kante («Leitentscheid (BGE)» …) — §8-Einordnung. */
  statusLabel?: string;
  /** Tastatur-Einstieg (↓ am Chip): Fokus auf die erste Aktion setzen. */
  autoFokus?: boolean;
  onClose: () => void;
}) {
  const kasten = useRef<HTMLDivElement>(null);
  const erstesZiel = useRef<HTMLAnchorElement>(null);
  const [lage, setLage] = useState<Lage | null>(null);
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();

  // Lage EINMAL nach dem Mount messen (echte Höhe des Kastens), danach nie mehr:
  // das Popover lebt nur, solange Zeiger/Fokus stehen — es muss nichts verfolgen.
  useLayoutEffect(() => {
    const h = kasten.current?.offsetHeight ?? 0;
    setLage(berechneLage(ankerRect, h, window.innerWidth, window.innerHeight));
  }, [ankerRect]);

  // Tastatur-Einstieg: ↓ am Chip öffnet UND setzt den Fokus in die erste Aktion.
  // Ohne das wäre der portalierte Kasten für eine Tastatur-Bedienung unerreichbar
  // (er hängt am Ende von <body>, nicht in der Tab-Folge des Chips). Der Rückweg
  // ist Esc (schliesst; der Fokus fällt zurück auf den Chip, den der Aufrufer hält).
  useEffect(() => { if (autoFokus) erstesZiel.current?.focus(); }, [autoFokus]);

  // Scroll/Resize schliessen (siehe Kopf); Esc schliesst ebenfalls.
  // `focusin`: wandert der Fokus AUS dem Kasten hinaus, ist der Kasten fertig.
  // Ohne das bliebe ein per Tastatur betretenes Popover stehen, nachdem der
  // Fokus weitergetabbt ist — es hängt am <body> und nicht in der Zelle, deren
  // `onBlur` sonst schliesst.
  useEffect(() => {
    const zu = () => onClose();
    const taste = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const fokus = (e: FocusEvent) => {
      const ziel = e.target as Node | null;
      if (ziel && kasten.current?.contains(ziel)) return;
      onClose();
    };
    window.addEventListener('scroll', zu, true);
    window.addEventListener('resize', zu);
    window.addEventListener('keydown', taste);
    document.addEventListener('focusin', fokus);
    return () => {
      window.removeEventListener('scroll', zu, true);
      window.removeEventListener('resize', zu);
      window.removeEventListener('keydown', taste);
      document.removeEventListener('focusin', fokus);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={kasten}
      data-regeste-popover
      role="dialog"
      aria-label={`Kurztext zu ${zitierung}`}
      // `visibility:hidden` im ersten Frame: der Kasten muss gerendert sein, damit
      // seine Höhe messbar ist — sichtbar wird er erst an der berechneten Stelle
      // (kein Aufblitzen oben links).
      style={{
        position: 'fixed',
        left: lage ? `${lage.links}px` : '0px',
        top: lage ? `${lage.oben}px` : '0px',
        width: `min(${BREITE}px, calc(100vw - ${2 * RAND}px))`,
        visibility: lage ? 'visible' : 'hidden',
        zIndex: 45,
      }}
      className="lc-card p-3 text-left"
    >
      <p className="lc-overline text-ink-500" title="Amtliche Regeste bzw. amtlicher Betreff der Quelle — gekürzt übernommen, nie umformuliert. Massgeblich ist der Entscheid selbst.">
        Kurztext
        {statusLabel && <span className="ml-1 font-normal normal-case text-ink-500">· {statusLabel}</span>}
      </p>
      <p className="num mt-0.5 text-body-s font-semibold text-ink-900">{zitierung}</p>
      {/* Der Bestandstext selbst — Serif wie jeder amtliche Wortlaut im Haus,
          gedeckelte Höhe mit eigenem Scroll, damit lange Regesten das Popover
          nicht über den Bildschirm wachsen lassen. */}
      <p className="mt-1.5 max-h-40 overflow-y-auto font-serif text-body-s leading-snug text-ink-800">
        {kurztext}
      </p>
      {/* Aktionen (V3): «Öffnen» + «Daneben öffnen». Die Split-Aktion lebt hier —
          sie ist im Popover eine benannte Zeile statt eines wortlosen Glyphs.
          `min-h-6` = 24 px Tap-Ziel (WCAG 2.5.8). */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2">
        <Link ref={erstesZiel} to={ziel} onClick={onClose}
          className="inline-flex min-h-6 items-center text-xs text-brass-700 hover:underline">
          Öffnen ›
        </Link>
        {kannOeffnen && !istOffen(ziel) && (
          <button type="button" onClick={() => { oeffneDaneben(ziel); onClose(); }}
            title={`${zitierung} nebeneinander öffnen`}
            className="inline-flex min-h-6 items-center gap-1 text-xs text-ink-600 hover:text-brass-700">
            <span aria-hidden className="text-base leading-none">⧉</span> Daneben öffnen
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
