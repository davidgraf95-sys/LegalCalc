// ─── «Rechtsprechung ▾» — eigenes Dropdown der Leser-Werkzeugleiste (W2·7-BEZUG/B4) ─
//
// Vorgabe David 28.7.2026: die Auswahl, WELCHE Rechtsprechung am Artikel steht,
// bekommt ein EIGENES Dropdown in der Leser-Werkzeugleiste («Gesetze › Bund ›
// ZGB · Art. 212 ZGB · Im Gesetz suchen … · Ansicht ▾ · Stand …»), analog zum
// bestehenden «Ansicht ▾» — nicht als weiterer Streifen IN «Ansicht» und nicht
// nur in der Artikel-Sektion.
//
// ── ARBEITSTEILUNG DER BEIDEN DROPDOWNS ────────────────────────────────────
// «Ansicht ▾»          — WIE der Gesetzestext dargestellt wird (Linien,
//                        Fussnoten, Verweise, Entscheide-Zeile an/aus).
// «Rechtsprechung ▾»   — WELCHE Entscheide die Zeile zeigt (Instanzen, Kantone;
//                        künftig B5: Zeitstrahl + Von-Bis-Datum).
// Die Trennung ist die Frage, die der Nutzer stellt — «wie sieht es aus?» gegen
// «was steht drin?» —, nicht die Technik dahinter.
//
// ── ANDOCKPUNKT B5 (nicht bauen, nur freihalten) ───────────────────────────
// Der Panel-Inhalt ist eine Folge benannter Abschnitte. B5 ergänzt seinen
// Zeitstrahl + die Von-Bis-Datumseingabe als WEITEREN Abschnitt an der unten
// markierten Stelle — ohne die Facetten-Steuerung, die Artikel-Fuss-Darstellung
// oder dieses Gerüst umzubauen. Die Steuerung selbst
// (`components/verzahnung/BezugFacettenWahl.tsx`) ist vollständig gesteuert und
// kennt weder dieses Menü noch die Werkzeugleiste.
//
// Bedien-/A11y-Mechanik ist bewusst die BAUGLEICHE wie in `LeserAnsichtMenu`
// (ehrliche Disclosure, KEIN role=menu — ein Menü verspräche eine
// Pfeiltasten-Bedienung, die es nicht gibt; `useDialogFokus` für Fokus-Falle,
// Escape und Fokus-Rückgabe; pointerdown-ausserhalb schliesst). Zwei Dropdowns
// nebeneinander, die sich verschieden bedienen liessen, wären die schlechtere
// Wucherung als ein Stück doppelte Mechanik (§5 gilt dem Fachinhalt, nicht der
// Bedien-Konvention).

import { useEffect, useId, useRef, useState } from 'react';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { BezugFacettenWahl } from '../../components/verzahnung/BezugFacettenWahl';
import {
  setzeBezugKlassen, setzeBezugKantone, useBezugKlassen, useBezugKantone, useLeserOptionen,
} from './leserOptionen';
import { istErweitert } from './bezugAuswahl';

export function LeserRechtsprechungMenu({ kantoneVerfuegbar = [] }: {
  /** Kantone, zu denen DIESER Erlass Kanten hat (aus dem geladenen Bezugs-Shard).
   *  Leer ⇒ kein Kanton-Streifen (nichts zu filtern, §13 F4). */
  kantoneVerfuegbar?: string[];
}) {
  const opt = useLeserOptionen();
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useDialogFokus(offen, panelRef, () => setOffen(false));

  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen]);

  // Der Auslöser trägt ein dezentes Signal, wenn die Auswahl vom Grundzustand
  // abweicht — sonst müsste man das Menü öffnen, um zu sehen, dass ein Filter
  // wirkt (§8: kein unsichtbar wirkender Filter). Ein Punkt, kein Zähler: die
  // Werkzeugleiste soll nicht voller werden als nötig.
  const abweichend = istErweitert(klassen);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-controls={panelId}
        aria-label="Rechtsprechung"
        data-rechtsprechung-menu
        className="lc-chip inline-flex items-center gap-1 hover:text-brass-700"
        title="Welche Entscheide unter den Artikeln stehen: Instanzen und Kantone"
      >
        <span aria-hidden>§</span>
        {/* Das Wort erst ab lg. Gemessen 28.7.2026: bei 774 px drängte die
            ausgeschriebene Beschriftung den Breadcrumb auf «Ge… › B… › S…»
            zusammen — die Werkzeugleiste soll nicht voller werden als nötig
            (Vorgabe David). Der Accessible-Name bleibt über `aria-label`
            erhalten, das Dropdown ist also in JEDER Breite benannt. */}
        <span className="hidden lg:inline">Rechtsprechung</span>
        {abweichend && <span aria-hidden className="lc-punkt lc-punkt-entscheid" />}
        <span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Auswahl der Rechtsprechung"
          className="absolute right-0 top-full z-40 mt-1.5 flex w-[15rem] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
        >
          <p className="lc-overline px-2.5 pb-1 pt-0.5">Entscheide am Artikel</p>

          {opt.leitfaelle === 'an' ? (
            <BezugFacettenWahl
              klassen={klassen}
              kantone={kantone}
              kantoneVerfuegbar={kantoneVerfuegbar}
              onKlassen={setzeBezugKlassen}
              onKantone={setzeBezugKantone}
            />
          ) : (
            // Kein totes Steuerelement (§13 F4): ist die Entscheide-Zeile im
            // «Ansicht»-Dropdown ganz abgeschaltet, wirkt hier nichts. Das wird
            // gesagt, statt Schalter zu zeigen, die nichts tun.
            <p className="px-2.5 pb-1 pt-1 text-micro leading-snug text-ink-500">
              Die Entscheide-Zeile ist unter «Ansicht ▾ › Entscheide» ausgeschaltet — es wird gerade keine Rechtsprechung am Artikel gezeigt.
            </p>
          )}

          {/* ── ANDOCKPUNKT B5 (David 28.7.2026) ────────────────────────────
              Hier ergänzt B5 den Zeitstrahl und die Von-Bis-Datumseingabe als
              weiteren benannten Abschnitt. Bewusst NUR dieser Kommentar — kein
              Platzhalter-Markup und kein toter Zweig (§0/1e); ein reservierter
              Leerraum wäre zudem sichtbar, ohne etwas zu können (§15.2). */}
        </div>
      )}
    </div>
  );
}
