import { memo, useCallback, useRef, useState, lazy, Suspense } from 'react';
import { KantenChip } from './KantenChip';
import { usePaneSteuerung } from '../layout/usePaneLayout';
import type { ArtikelRevision } from '../../lib/verzahnung/artikel-revisionen';

// ─── V3 · EINE Kanten-Zelle: Chip + ⧉ + Kurztext-Vorschau (W2·10-UI-NAV) ─────
//
// Die Leitfall-Zeile (V1a) und die Bezüge-Linien (B4/B7) rendern seit jeher
// dieselbe Zelle — `<KantenChip>` plus den ⧉-Knopf unter Pane-Gating — als zwei
// wortgleiche Kopien. Diese Komponente ist genau diese Zelle, EINMAL (§5): so
// kann die V3-Vorschau nicht an einer der beiden Stellen fehlen oder anders
// aussehen. Reine Darstellung (§3), keine Datenschicht, kein Fetch.
//
// ── WARUM DER ⧉ AM CHIP BLEIBT (deklarierte Abweichung, §14.7) ──────────────
// Die V3-Spec hält fest, der ⧉ je Chip bleibe verworfen und die Split-Aktion
// lebe im Popover. Der ⧉ ist hier aber KEIN Neubau, sondern Bestand seit dem
// Split-View-Schnitt — und er ist die von `e2e/split-view-a34.e2e.ts` gemessene
// Einstiegsgeste («nebeneinander öffnen» am Artikel). Ihn im Zuge eines
// Darstellungs-Schnitts zu entfernen, hiesse einen bestehenden Test anzupassen;
// das ist nach §6.3 eine fachliche Änderung und gehört in einen eigenen,
// deklarierten Schritt. Er bleibt darum, und er trägt zugleich den Tastatur-Weg
// zur Split-Aktion (der portalierte Popover-Knopf ist nur über ↓ erreichbar).
//
// ── LADEKOSTEN (§15) ───────────────────────────────────────────────────────
// Das Popover wird `lazy` geladen: es erscheint frühestens nach einer bewussten
// Geste (Hover mit Verzögerung / Fokus / ↓) — sein Code gehört nicht in den
// Erst-Chunk einer Seite mit hunderten Artikeln.
const RegestePopover = lazy(() => import('./RegestePopover').then((m) => ({ default: m.RegestePopover })));

// Hover-Verzögerung: erst nach ruhendem Zeiger. Ohne sie feuerte jedes
// Vorbeifahren über eine 5-Chip-Linie fünf Popover-Mounts (Zeiger-Rauschen).
const OEFFNEN_MS = 450;
// Nachlauf beim Verlassen: der Zeiger muss vom Chip in den Kasten wandern
// können (WCAG 1.4.13 «hoverable»), ohne dass er unterwegs zuklappt.
const SCHLIESSEN_MS = 180;

export const KanteMitVorschau = memo(function KanteMitVorschau({
  ziel, zitierung, kurztext, leitentscheid = false, revidiert, titel, statusLabel, className = '',
}: {
  /** Interner Reader-Pfad (trägt bereits `?norm=`). */
  ziel: string;
  zitierung: string;
  /** Bestandstext aus dem Shard; null/leer ⇒ keine Vorschau (§8: nichts erfinden). */
  kurztext?: string | null;
  leitentscheid?: boolean;
  revidiert?: ArtikelRevision | null;
  titel?: string;
  statusLabel?: string;
  /** Zusatzklassen der Zelle (die Bezüge-Linie braucht `shrink-0`). */
  className?: string;
}) {
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  const zelle = useRef<HTMLSpanElement>(null);
  const uhr = useRef<number | undefined>(undefined);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tastatur, setTastatur] = useState(false);
  const hatVorschau = !!kurztext && kurztext.trim() !== '';

  const stoppUhr = () => {
    if (uhr.current !== undefined) { window.clearTimeout(uhr.current); uhr.current = undefined; }
  };
  const oeffne = useCallback((perTastatur: boolean) => {
    stoppUhr();
    const el = zelle.current?.firstElementChild ?? zelle.current;
    if (!el) return;
    setTastatur(perTastatur);
    setRect(el.getBoundingClientRect());
  }, []);
  const schliesse = useCallback(() => { stoppUhr(); setRect(null); setTastatur(false); }, []);

  if (!hatVorschau) {
    return <Zelle ref={zelle} className={className} {...{ ziel, zitierung, leitentscheid, revidiert, titel, kannOeffnen, istOffen, oeffneDaneben }} />;
  }
  return (
    <span
      className={`inline-flex items-center ${className}`}
      ref={zelle}
      onPointerEnter={(e) => {
        // Nur echte Zeiger (Maus/Stift) öffnen per Hover. Auf Touch ist «hover»
        // ein Synthese-Ereignis DES TAPS — dort bleibt es beim Klick (die Zelle
        // navigiert), sonst öffnete sich der Kasten genau im Moment der
        // Navigation und flackerte über den Seitenwechsel.
        if (e.pointerType === 'touch') return;
        stoppUhr();
        uhr.current = window.setTimeout(() => oeffne(false), OEFFNEN_MS);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'touch') return;
        stoppUhr();
        uhr.current = window.setTimeout(schliesse, SCHLIESSEN_MS);
      }}
      onFocus={() => oeffne(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schliesse(); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); oeffne(true); }
        else if (e.key === 'Escape' && rect) { e.preventDefault(); schliesse(); }
      }}
    >
      <KantenChip to={ziel} label={zitierung} kategorie="entscheid"
        leitentscheid={leitentscheid} revidiert={revidiert} titel={titel ?? zitierung} />
      {kannOeffnen && !istOffen(ziel) && (
        <SplitKnopf zitierung={zitierung} onClick={() => oeffneDaneben(ziel)} />
      )}
      {rect && (
        <Suspense fallback={null}>
          <RegestePopover ankerRect={rect} zitierung={zitierung} kurztext={kurztext!}
            ziel={ziel} statusLabel={statusLabel} autoFokus={tastatur}
            onClose={() => { schliesse(); if (tastatur) zelle.current?.querySelector('a')?.focus(); }} />
        </Suspense>
      )}
    </span>
  );
});

// ── Die beiden Bausteine der Zelle, damit der vorschaulose Zweig byte-gleich
//    dasselbe Markup rendert wie bisher (kein zweiter Chip-Aufbau, §5). ───────

function SplitKnopf({ zitierung, onClick }: { zitierung: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      title={`${zitierung} nebeneinander öffnen`} aria-label={`${zitierung} nebeneinander öffnen`}
      className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
      <span aria-hidden className="text-base leading-none">⧉</span>
    </button>
  );
}

function Zelle({ ref, className, ziel, zitierung, leitentscheid, revidiert, titel, kannOeffnen, istOffen, oeffneDaneben }: {
  ref: React.Ref<HTMLSpanElement>;
  className: string;
  ziel: string;
  zitierung: string;
  leitentscheid: boolean;
  revidiert?: ArtikelRevision | null;
  titel?: string;
  kannOeffnen: boolean;
  istOffen: (pfad: string) => boolean;
  oeffneDaneben: (pfad: string) => void;
}) {
  return (
    <span className={`inline-flex items-center ${className}`} ref={ref}>
      <KantenChip to={ziel} label={zitierung} kategorie="entscheid"
        leitentscheid={leitentscheid} revidiert={revidiert} titel={titel ?? zitierung} />
      {kannOeffnen && !istOffen(ziel) && (
        <SplitKnopf zitierung={zitierung} onClick={() => oeffneDaneben(ziel)} />
      )}
    </span>
  );
}
