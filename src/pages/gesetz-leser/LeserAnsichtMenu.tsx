// ─── «Ansicht»-Dropdown im Reader-Kopf (W2·5d U-KOPF/A4) — UI zu leserOptionen.ts ─
//
// David 5.7.2026 (A4): «der kopf … soll funktionaler ausgestaltet werden. also
// die darstellungsoptionen (fussnoten linien verweise) sollen im kopf sein mit
// drop down menu.» Die frühere G2a-Chip-Leiste entfällt und geht in EIN «Ansicht»-
// Dropdown im aktionen-Slot des ErlassLeserKopf auf (§3.1: keine Wucherung).
// Seit dem Linien-Rückbau V1 (16.8.2026) sind es zwei Switches — «Fussnoten»
// (mit Änderungshistorie-Wahl) und «Verweise»; «Linien» ist ersatzlos entfallen.
//
// A11y (ehrliche Disclosure, NICHT role=menu): Switches sind Formular-Steuerelemente,
// kein Menü — ein role=menu verspräche eine Pfeiltasten-Bedienung, die es nicht
// gibt (dieselbe Lehre wie SprachUmschalter). Der Trigger trägt aria-expanded +
// aria-controls; das Panel ist eine role="group" mit aria-label. Fokus-Falle,
// Escape-Schliessen und Fokus-Rückgabe an den Auslöser übernimmt `useDialogFokus`
// (ARIA-Dialog-Muster); ein zusätzlicher pointerdown-Ausserhalb-Handler schliesst
// beim Klick daneben. Persistenz-/Pre-Paint-Mechanik (localStorage, data-* am
// <html>) bleibt unverändert DARUNTER (leserOptionen.ts) — das Dropdown ist reine
// Bedien-Oberfläche, Umschalten rendert nur die Switches neu, nie den Normtext (§15).

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import {
  setzeOption, setzeHistAnsicht, useLeserOptionen, useHistAnsicht,
  type OptFeld, type HistAnsicht,
} from './leserOptionen';

function OptSwitch({ feld, an, label, titel, ariaLabel, zusatz }: {
  feld: OptFeld;
  an: boolean;
  label: string;
  titel: string;
  /** Expliziter Accessible-Name (überschreibt den Text — z. B. «Fussnoten (12)»). */
  ariaLabel?: string;
  /** Kleines Zusatz-Signal rechts vom Label (z. B. der Fussnoten-Zähler N). */
  zusatz?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      aria-label={ariaLabel}
      title={titel}
      onClick={() => setzeOption(feld, an ? 'aus' : 'an')}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-body-s transition-colors hover:bg-brass-100/40 ${
        an ? 'text-ink-900' : 'text-ink-600'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">{label}{zusatz}</span>
      <span
        aria-hidden
        // WCAG-AA (§13/F2), LATENTER Befund, gefunden 26.7.2026 durch den ersten
        // axe-Scan des GEÖFFNETEN Panels (hist-ansicht-w25i.e2e.ts — die bestehende
        // a11y-Stichprobe scannt den Reader mit geschlossenem Menü, darum blieb es
        // unentdeckt): `ink-400` ist ein Deko-Token (~3.2–3.6:1) und trug hier den
        // AUS-Zustand «○ aus» — axe: color-contrast, serious. `ink-500` (≥4.8:1 hell /
        // ≥5.2:1 dunkel) hebt ihn auf AA, ohne die Dämpfungs-Absicht aufzugeben.
        // Gleiche Korrektur wie W3.6 (25.6.) und die Fussnoten-Nummer (18.7.) —
        // dritter Fall derselben Klasse an derselben Farbstufe.
        className={`shrink-0 inline-flex items-center gap-1 text-xs ${an ? 'text-brass-700' : 'text-ink-500'}`}
      >
        {an ? '✓' : '○'} {an ? 'an' : 'aus'}
      </span>
    </button>
  );
}

/**
 * W2·5i-HIST-ANSICHT: dreiwertige Wahl «Änderungshistorie: aus · als Fussnoten ·
 * als Chronologie». Bedienmuster wie die übrigen Streifen (role="group" +
 * `aria-pressed`, KEIN `role=radiogroup` — das verspräche eine Pfeiltasten-
 * Bedienung, die es hier nicht gibt; dieselbe Ehrlichkeits-Lehre wie beim
 * Dropdown selbst).
 *
 * Was «aus» ausblendet, ist bewusst ENG (H0-Auflage 1, `bibliothek/normen/
 * hist-ansicht-h0-trennbarkeit.md`): NUR die build-seitig als Änderungsvermerk
 * klassifizierten Fussnoten (`kl:'A'`). Echte Verweise, die Grauzone, reine
 * Publikationsnachweise, Unklares UND jede Fussnote ohne Klasse (alle Kanton-
 * Sidecars) bleiben in JEDER Ansicht sichtbar — die Sicherheitsrichtung ist
 * einseitig: nie amtliche Substanz verstecken (§1/§8).
 */
function HistAnsichtWahl() {
  const hist = useHistAnsicht();
  const stufen: readonly [HistAnsicht, string, string][] = [
    ['aus', 'aus', 'Änderungsvermerke ausblenden — echte Verweise, Grauzone und Publikationsnachweise bleiben sichtbar'],
    ['fussnoten', 'Fussnoten', 'Änderungsvermerke wie bisher im Fussnoten-Apparat am Artikelfuss (Grundeinstellung)'],
    ['chronologie', 'Chronologie', 'Änderungsvermerke stattdessen als zeitlich sortierte Liste am Artikelfuss'],
  ];
  return (
    <div role="group" aria-label="Darstellung der Änderungshistorie" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Änderungshistorie</span>
      {stufen.map(([wert, label, titel]) => {
        const aktiv = hist === wert;
        return (
          <button
            key={wert}
            type="button"
            aria-pressed={aktiv}
            data-hist-wahl={wert}
            onClick={() => setzeHistAnsicht(wert)}
            title={titel}
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              aktiv ? 'bg-brass-100/60 font-medium text-ink-900' : 'text-ink-500 hover:bg-brass-100/40'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Das «Ansicht»-Dropdown.
 *
 *  LINIEN-RÜCKBAU V1 (16.8.2026, Entscheid David 13.8.2026): der frühere Schalter
 *  «Linien» (K11-Tri-State an/aus/auto) ist ERSATZLOS entfallen — mit ihm die
 *  Props `zeigeLinien`/`linienAutoAn`. Die Gliederungslinie im Lesetext gibt es
 *  nicht mehr; Struktur trägt Typo + Einzug, Übersicht die Seitenleiste
 *  (FAHRPLAN-GESETZESDARSTELLUNG-V2 §9.3).
 *
 *  A26 (David 11.7.2026): das Dropdown lebt in der IMMER sichtbaren Positions-/
 *  Kontextleiste (Inhalts-Kopf `Gesetze › Bund › ZPO … Stand … ✕`), damit die
 *  Darstellungsoptionen jederzeit erreichbar sind, während man im Gesetz ist —
 *  nicht nur oben im weggescrollten Erlass-Kopf. Der frühere separate Fussnoten-
 *  Chip (V2·K-2) ist als EINTRAG in dieses Menü gewandert (`fussnotenAnzahl` =
 *  Zähler N am «Fussnoten»-Schalter). `fussnotenAnzahl===null` ⇒ Sidecar noch
 *  nicht geladen ⇒ Zähler erscheint erst danach; da er in einem geschlossenen,
 *  absolut positionierten Panel steckt, wächst im sichtbaren Kopf keine Zahl nach
 *  (CLS 0). */
export function LeserAnsichtMenu({ fussnotenAnzahl = null }: {
  fussnotenAnzahl?: number | null;
}) {
  const opt = useLeserOptionen();
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Fokus-Falle + Escape + Fokus-Rückgabe an den Auslöser (ARIA-Dialog-Muster).
  useDialogFokus(offen, panelRef, () => setOffen(false));

  // Klick ausserhalb (Trigger + Panel) schliesst.
  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen]);

  // LM-009 (§8 B7): Scrollen und Fenstergrössenänderung schliessen ebenfalls.
  // Der Trigger sitzt in der KLEBENDEN Positionsleiste (§4 B3/K-01) — beim
  // Scrollen im Gesetzestext blieb das Panel bisher an der Leiste kleben statt
  // zu schliessen und lag mitten im Fliesstext.
  //
  // NICHT das generische `scroll`-Event (Regression, gefunden über die
  // A9-CPU-Throttle-Probe `leser-kopf-a9.e2e.ts`, Nullprobe §0 Ziff. 3 gegen
  // den Stand vor diesem Commit: dort grün, hier rot ⇒ eigene Ursache): ein
  // Fussnoten-Toggle verändert die Höhe des Fliesstexts UNTER dem
  // sichtbaren Ausschnitt, der Browser gleicht das per naitver Scroll-
  // Anchoring aus — das feuert ein `scroll`-Ereignis OHNE jede Nutzer-Geste
  // und schloss das eben erst geöffnete Menü, noch bevor der Switch-Klick
  // ausgewertet war. `wheel`/`touchmove` sind dagegen NUR bei einer echten
  // Scroll-GESTE der Nutzerin da (Maus/Trackpad bzw. Touch) — Scroll-Anchoring
  // trifft sie nicht, weil es kein Eingabe-Ereignis auslöst.
  useEffect(() => {
    if (!offen) return;
    const schliesse = () => setOffen(false);
    window.addEventListener('wheel', schliesse, { passive: true });
    window.addEventListener('touchmove', schliesse, { passive: true });
    window.addEventListener('resize', schliesse);
    return () => {
      window.removeEventListener('wheel', schliesse);
      window.removeEventListener('touchmove', schliesse);
      window.removeEventListener('resize', schliesse);
    };
  }, [offen]);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-controls={panelId}
        aria-label="Ansicht"
        data-ansicht-menu
        className="lc-leiste-griff lc-leiste-griff-fest gap-0.5 px-1 sm:gap-1 sm:px-1.5"
        title="Darstellung: Fussnoten (mit Änderungshistorie), Verweise"
      >
        {/* Enger Platz in der Sticky-Positionsleiste (@390): Label nur ≥lg, sonst
            reines Icon (Accessible-Name bleibt über aria-label «Ansicht» erhalten).
            B6: die Schwelle war hier sm, beim Schwester-Menü «Rechtsprechung» lg —
            zwischen 640 und 1024 px stand also EIN Wort neben EINEM Icon, und die
            beiden lasen sich nicht als Paar. Gemessen 28.7.2026 bei 768 px: mit
            BEIDEN Wörtern blieben der Ortsangabe noch 152 px (nötig ~200) — die
            Krumen fingen wieder an zu truncaten. Also beide auf lg. */}
        <span aria-hidden>◧</span><span className="hidden lg:inline">Ansicht</span>
        <span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Darstellungsoptionen"
          className="absolute right-0 top-full z-40 mt-1.5 flex w-[13rem] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
        >
          <p className="lc-overline px-2.5 pb-1 pt-0.5">Darstellung</p>
          {/* A26 (David 11.7.2026): der frühere separate Fussnoten-Chip ist hier als
              Eintrag aufgegangen — der Zähler N (Sidecar) sitzt als dezentes Signal
              rechts vom Label; der Schalter bleibt derselbe `fussnoten`-Toggle. Kein
              Sprung-zum-Apparat mehr (das Menü ist jetzt DAUERHAFT erreichbar, also
              kann der Klick von überall im Erlass kommen — ein Sprung an den ersten
              Marker wäre desorientierend; Ein-/Ausblenden geschieht an Ort). */}
          <OptSwitch
            feld="fussnoten"
            an={opt.fussnoten === 'an'}
            label="Fussnoten"
            ariaLabel={fussnotenAnzahl != null && fussnotenAnzahl > 0 ? `Fussnoten (${fussnotenAnzahl})` : undefined}
            zusatz={fussnotenAnzahl != null && fussnotenAnzahl > 0
              ? <span aria-hidden className="num tabular-nums rounded bg-brass-100/60 px-1 text-micro font-medium text-ink-600">{fussnotenAnzahl}</span>
              : undefined}
            titel="Fussnoten ein- oder ausblenden — AUS lässt Marker und Apparat verschwinden (der Normtext bleibt durchsuchbar)"
          />
          {/* W2·5i-HIST-ANSICHT (§14-Intake David 20.7.2026): die dreiwertige
              Historie-Wahl sitzt UNTER dem Fussnoten-Schalter, weil sie ihn
              verfeinert — im OR sind ~83 % der Fussnoten Änderungsvermerke, hier
              trennt man sie von den echten Verweisen. Nur sichtbar, wenn Fussnoten
              überhaupt AN sind: bei «Fussnoten aus» ist der ganze Apparat weg, die
              Wahl also wirkungslos → kein totes Steuerelement (§13 F4, gleiches
              Muster wie der Kanton-Streifen unter «Instanzen»). */}
          {opt.fussnoten === 'an' && <HistAnsichtWahl />}
          <OptSwitch
            feld="verweise"
            an={opt.verweise === 'an'}
            label="Verweise"
            titel="Verweis-Links unterstreichen oder schlicht darstellen (der Link bleibt aktiv)"
          />
          {/* W2·7-BEZUG/B4 (Vorgabe David 28.7.2026): der frühere 4. Schalter
              «Entscheide» ist ENTFALLEN. Er blendete die Kanten-Zeile per CSS
              aus und steuerte damit dieselbe Sache wie das Dropdown
              «Rechtsprechung ▾» — zwei konkurrierende Steuerungen für eine
              Frage, das Gegenteil der Minimalismus-Vorgabe. Wer keine
              Entscheide will, wählt dort die Facetten ab; dann steht unter dem
              Artikel nichts UND es wird nichts geladen (der CSS-Weg versteckte
              nur, geladen wurde trotzdem). Die Migration eines gespeicherten
              «Entscheide aus» erledigt `leserOptionen.ts` einmalig.

              W2·7-BEZUG/B5 (David 28.7.2026): die hier zuletzt verbliebene
              Zeitraum-Wahl «alle · 20 · 10 · 5 J.» ist EBENFALLS ENTFALLEN.
              Ihre einzige Verbraucherin war die seit B4 vom Reader nicht mehr
              bediente `LeitfallZeile` — sie stand also sichtbar da und wirkte
              auf nichts (§13 F4). An ihre Stelle tritt der Zeitstrahl mit
              Von-Bis-Datum im Dropdown «Rechtsprechung ▾», wo er zur Frage
              «welche Entscheide?» gehört und auf ALLE Instanzen wirkt statt nur
              auf die BGE-Zeile. Eine gespeicherte Alt-Stufe bildet
              `leserOptionen.ts` einmalig auf ein Von-Datum ab. */}
          {/* W2·7-BEZUG/B4: die Facetten-Auswahl (Instanzen, Kantone) sass
              kurzzeitig hier und lebt seit der Vorgabe David 28.7.2026 in einem
              EIGENEN Dropdown «Rechtsprechung ▾» derselben Werkzeugleiste
              (`LeserRechtsprechungMenu.tsx`). Trennung der Fragen: dieses Menü
              beantwortet «wie sieht der Gesetzestext aus?», jenes «welche
              Entscheide stehen darunter?». Der Schalter «Entscheide» bleibt
              hier, weil er die ZEILE ein- und ausblendet — eine
              Darstellungsfrage. */}
        </div>
      )}
    </div>
  );
}
