import { memo, useCallback, useId, useRef, useState, lazy, Suspense } from 'react';
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
//
// ── DER PORTAL-FALLSTRICK, belegt (§9-Bug-Check 4.8.2026, B1) ───────────────
// Der Kasten hängt im DOM an <body>, im REACT-Baum aber unter dieser Zelle.
// React leitet Ereignisse dem REACT-Baum entlang weiter — jedes `keydown`,
// `focus` und `blur` aus dem Kasten läuft also durch die Handler HIER vorbei,
// obwohl `zelle.contains(ziel)` im DOM false ist. Daraus entstanden zwei
// Fehler, beide reproduziert (Chip fokussieren → ↓ → Esc):
//   (1) `onFocus` feuerte, sobald der Fokus IN den Kasten wanderte, und setzte
//       die Tastatur-Merkung zurück — der Fokus-Rückweg war damit tot Code.
//   (2) Der Esc-Zweig der Zelle lief vor dem `onClose`-Pfad des Kastens und
//       schloss OHNE Fokus-Rückgabe: `document.activeElement` war danach
//       `BODY` (WCAG 2.4.3 gebrochen — die Tastatur stand am Seitenanfang).
// Gegenmittel: (a) die Tastatur-Merkung liegt in einem `ref`, den kein Re-Render
// und kein durchgereichtes Fokus-Ereignis überschreibt; (b) Fokus-Ereignisse AUS
// dem Kasten werden an beiden Enden (`onFocus`/`onBlur`) über die DOM-Zugehörig-
// keit ausgesiebt; (c) es gibt genau EINEN Schliess-Pfad mit Fokus-Rückgabe, den
// Esc UND `onClose` gemeinsam benutzen.
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
  // Der Kasten selbst — für die DOM-Zugehörigkeitsprüfung der durchgereichten
  // Fokus-Ereignisse (er hängt an <body>, nicht in dieser Zelle).
  const kasten = useRef<HTMLDivElement>(null);
  const uhr = useRef<number | undefined>(undefined);
  // Tastatur-Merkung als REF: sie überlebt jedes Re-Render und wird von keinem
  // durchgereichten Fokus-Ereignis überschrieben (B1 (1)).
  const perTastatur = useRef(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [autoFokus, setAutoFokus] = useState(false);
  const kastenId = useId();
  const hatVorschau = !!kurztext && kurztext.trim() !== '';

  const stoppUhr = () => {
    if (uhr.current !== undefined) { window.clearTimeout(uhr.current); uhr.current = undefined; }
  };
  const oeffne = useCallback((mitTastatur: boolean) => {
    stoppUhr();
    const el = zelle.current?.firstElementChild ?? zelle.current;
    if (!el) return;
    if (mitTastatur) { perTastatur.current = true; setAutoFokus(true); }
    setRect(el.getBoundingClientRect());
  }, []);
  /**
   * DER EINE Schliess-Pfad. `fokusZurueck` = die Schliessung ist eine bewusste
   * Tastatur-Geste (Esc) — dann muss der Fokus zurück auf den Chip, sonst fällt
   * er auf `<body>` (B1 (2), WCAG 2.4.3). Beim Weg-Zeigen (`pointerleave`) oder
   * Weg-Tabben gibt es nichts zurückzugeben: dort steht der Fokus längst woanders.
   */
  const schliesse = useCallback((fokusZurueck: boolean) => {
    stoppUhr();
    setRect(null);
    setAutoFokus(false);
    if (fokusZurueck && perTastatur.current) zelle.current?.querySelector('a')?.focus();
    perTastatur.current = false;
  }, []);
  /** Liegt der Knoten im portalierten Kasten? (Fokus-Aussiebung, siehe Kopf.) */
  const imKasten = (n: Node | null | undefined) => !!n && !!kasten.current?.contains(n);

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
        uhr.current = window.setTimeout(() => schliesse(false), SCHLIESSEN_MS);
      }}
      onFocus={(e) => {
        // Fokus IM Kasten ist kein neuer Öffnungsgrund — er würde nur die
        // Tastatur-Merkung und das Anker-Rechteck neu setzen (B1 (1)).
        if (imKasten(e.target)) return;
        oeffne(false);
      }}
      onBlur={(e) => {
        const ziel = e.relatedTarget as Node | null;
        if (e.currentTarget.contains(ziel) || imKasten(ziel)) return;
        schliesse(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); oeffne(true); }
        // Esc läuft durch DENSELBEN Pfad wie `onClose` — inklusive Fokus-Rückgabe.
        else if (e.key === 'Escape' && rect) { e.preventDefault(); schliesse(true); }
      }}
    >
      <KantenChip to={ziel} label={zitierung} kategorie="entscheid"
        leitentscheid={leitentscheid} revidiert={revidiert} titel={titel ?? zitierung}
        // B2: der Chip sagt, dass er etwas aufgeklappt hat und was. `aria-controls`
        // NUR im offenen Zustand — eine Referenz auf einen nicht existierenden
        // Knoten ist ein a11y-Fehler, keine Auskunft.
        ariaExpanded={rect ? true : false}
        ariaControls={rect ? kastenId : undefined} />
      {kannOeffnen && !istOffen(ziel) && (
        <SplitKnopf zitierung={zitierung} onClick={() => oeffneDaneben(ziel)} />
      )}
      {rect && (
        <Suspense fallback={null}>
          <RegestePopover ankerRect={rect} hostRef={zelle} kastenRef={kasten} kastenId={kastenId}
            zitierung={zitierung} kurztext={kurztext!}
            ziel={ziel} statusLabel={statusLabel} autoFokus={autoFokus}
            onClose={() => schliesse(true)} />
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
