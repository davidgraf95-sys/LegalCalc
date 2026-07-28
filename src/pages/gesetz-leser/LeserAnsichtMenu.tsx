// ─── «Ansicht»-Dropdown im Reader-Kopf (W2·5d U-KOPF/A4) — UI zu leserOptionen.ts ─
//
// David 5.7.2026 (A4): «der kopf … soll funktionaler ausgestaltet werden. also
// die darstellungsoptionen (fussnoten linien verweise) sollen im kopf sein mit
// drop down menu.» Die frühere G2a-Chip-Leiste entfällt und geht in EIN «Ansicht»-
// Dropdown im aktionen-Slot des ErlassLeserKopf auf. Es enthält genau die drei
// Switches Linien/Fussnoten/Verweise (§3.1: keine Wucherung).
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
  setzeOption, setzeZeitraum, setzeHistAnsicht, useLeserOptionen, useLeitfallZeitraum, useHistAnsicht,
  setzeBezugKlassen, setzeBezugKantone, useBezugKlassen, useBezugKantone,
  type OptFeld, type LeitfallZeitraum, type HistAnsicht,
} from './leserOptionen';
import {
  BEDIENBARE_KLASSEN, KLASSE_SCHALTER, istErweitert, schalteKlasse, schalteKanton,
} from './bezugAuswahl';
import { STATUS_LABEL } from '../../lib/verzahnung/facetten';

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

/** V2·B-2: Zeitraum-Wahl für die Leitfälle («alle · 20 · 10 · 5 J.»). Kein `role=
 *  menu`/`radiogroup` (die versprächen Pfeiltasten-Bedienung, die es nicht gibt —
 *  dieselbe Ehrlichkeits-Lehre wie das Dropdown selbst): eine `role="group"` mit
 *  einzeln Tab-fokussierbaren Buttons, jeder trägt `aria-pressed` für den aktiven
 *  Stand. Umschalten setzt den JS-Filterwert (setzeZeitraum) — kein Normtext-Re-
 *  Render, nur die Leitfall-Zeilen (Primitiv-Selektor). */
function ZeitraumWahl() {
  const zeitraum = useLeitfallZeitraum();
  const stufen: readonly [LeitfallZeitraum, string][] = [
    ['alle', 'alle'], ['20', '20 J.'], ['10', '10 J.'], ['5', '5 J.'],
  ];
  return (
    <div role="group" aria-label="Zeitraum der Entscheide" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Zeitraum</span>
      {stufen.map(([wert, label]) => {
        const aktiv = zeitraum === wert;
        return (
          <button
            key={wert}
            type="button"
            aria-pressed={aktiv}
            onClick={() => setzeZeitraum(wert)}
            title={wert === 'alle' ? 'Alle Entscheide zeigen' : `Nur Entscheide der letzten ${wert} Jahre`}
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

/**
 * W2·7-BEZUG/B4: Facetten-Wahl der Bezüge — «welche Instanzen zeigen?».
 *
 * Bedienmuster = `ZeitraumWahl` (role="group" + `aria-pressed`, KEIN
 * `role=radiogroup`/`menu` — die versprächen eine Pfeiltasten-Bedienung, die es
 * nicht gibt; dieselbe Ehrlichkeits-Lehre wie beim Dropdown selbst). Anders als
 * die Zeitraum-Wahl ist es eine MEHRFACH-Auswahl: jeder Schalter steht für sich.
 *
 * ── DER GRUNDZUSTAND IST «NUR BGE», UND DAS IST DIE TEURE ZUSAGE (§8/§15) ───
 * Die drei zuschaltbaren Klassen kosten einen deutlich grösseren Shard (bis
 * 717 KB / 65 KB gzip an der StPO). Darum sind sie AUS, bis jemand sie will —
 * und der Hinweistext sagt das, statt es zu verschweigen. Umgekehrt gilt: was
 * hier zugeschaltet wird, erscheint am Artikel als EIGENE, benannte Gruppe.
 * Ein kantonaler Entscheid wird nie unter die Leitentscheide gemischt (§8 —
 * die stillschweigende Gleichstellung, die `facetten.ts` ausdrücklich verbietet).
 *
 * Das ausgeschriebene `STATUS_LABEL` (facetten.ts) trägt Tooltip UND
 * Accessible-Name; sichtbar steht die Kurzform, weil das Panel 13 rem breit ist.
 */
function BezugKlassenWahl() {
  const klassen = useBezugKlassen();
  return (
    <div role="group" aria-label="Instanzen der Bezüge" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Instanzen</span>
      {BEDIENBARE_KLASSEN.map((k) => {
        const aktiv = klassen.includes(k);
        return (
          <button
            key={k}
            type="button"
            aria-pressed={aktiv}
            aria-label={STATUS_LABEL[k]}
            data-bezug-klasse={k}
            onClick={() => setzeBezugKlassen(schalteKlasse(klassen, k))}
            title={STATUS_LABEL[k]}
            className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
              aktiv ? 'bg-brass-100/60 font-medium text-ink-900' : 'text-ink-500 hover:bg-brass-100/40'
            }`}
          >
            {KLASSE_SCHALTER[k]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * B4: Kantons-Feinschnitt INNERHALB der kantonalen Klasse.
 *
 * Die Liste kommt aus dem geladenen Shard (`kantoneVerfuegbar`), nicht aus einer
 * Kantonstabelle: ein Schalter für einen Kanton, zu dem DIESER Erlass keine
 * Kante hat, fände garantiert nichts (totes Steuerelement, §13 F4) und behauptete
 * zugleich, dort gäbe es Praxis, die wir bloss ausblenden (§8). Umgekehrt ist die
 * angezeigte Liste damit eine ehrliche Aussage über die Abdeckung: was hier steht,
 * ist das, was der Korpus für diesen Erlass hergibt.
 *
 * Sichtbar nur, wenn die kantonale Klasse überhaupt AN ist — sonst wirkungslos
 * (gleiches Muster wie ZeitraumWahl unter «Entscheide», §13 F4). Keine Auswahl
 * = alle Kantone (Konvention der Datenschicht: leere Achse = keine Einschränkung).
 */
function BezugKantonWahl({ verfuegbar }: { verfuegbar: string[] }) {
  const kantone = useBezugKantone();
  if (verfuegbar.length === 0) return null;
  const alle = kantone.length === 0;
  return (
    <div role="group" aria-label="Kantone der kantonalen Entscheide" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
      <span className="lc-overline mr-1">Kantone</span>
      <button
        type="button"
        aria-pressed={alle}
        onClick={() => setzeBezugKantone([])}
        title="Kantonale Entscheide aus allen erfassten Kantonen zeigen"
        className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
          alle ? 'bg-brass-100/60 font-medium text-ink-900' : 'text-ink-500 hover:bg-brass-100/40'
        }`}
      >
        alle
      </button>
      {verfuegbar.map((k) => {
        const aktiv = kantone.includes(k);
        return (
          <button
            key={k}
            type="button"
            aria-pressed={aktiv}
            data-bezug-kanton={k}
            onClick={() => setzeBezugKantone(schalteKanton(kantone, k))}
            title={`Nur kantonale Entscheide aus ${k} zeigen`}
            className={`num rounded px-1.5 py-0.5 text-xs transition-colors ${
              aktiv ? 'bg-brass-100/60 font-medium text-ink-900' : 'text-ink-500 hover:bg-brass-100/40'
            }`}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

/**
 * W2·5i-HIST-ANSICHT: dreiwertige Wahl «Änderungshistorie: aus · als Fussnoten ·
 * als Chronologie». Bedienmuster = `ZeitraumWahl` (role="group" + `aria-pressed`,
 * KEIN `role=radiogroup` — das verspräche eine Pfeiltasten-Bedienung, die es hier
 * nicht gibt; dieselbe Ehrlichkeits-Lehre wie beim Dropdown selbst).
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

/** Das «Ansicht»-Dropdown. `zeigeLinien` blendet den Linien-Schalter aus, wo es
 *  keine Gliederungs-Sektion mit Guide gibt (flache Artikelliste) — er wäre sonst
 *  wirkungslos (§2.2④). `linienAutoAn` = ob im AUFBAU-abhängigen Default-Zustand
 *  ('auto', U-LINIEN/A8) der Guide für DIESEN Erlass sichtbar ist, damit der
 *  Schalter den EFFEKTIVEN Zustand ehrlich zeigt (§8).
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
export function LeserAnsichtMenu({ zeigeLinien, linienAutoAn = false, fussnotenAnzahl = null, kantoneVerfuegbar = [] }: {
  zeigeLinien: boolean; linienAutoAn?: boolean; fussnotenAnzahl?: number | null;
  /** W2·7-BEZUG/B4: Kantone, zu denen DIESER Erlass Kanten hat (aus dem geladenen
   *  Bezugs-Shard). Leer, solange nicht erweitert/geladen ⇒ kein Kanton-Streifen. */
  kantoneVerfuegbar?: string[];
}) {
  const opt = useLeserOptionen();
  const bezugKlassen = useBezugKlassen();
  const bezugErweitert = istErweitert(bezugKlassen);
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

  // Effektiver Linien-Zustand: expliziter Nutzer-Wunsch schlägt den Aufbau-Default;
  // im Default 'auto' folgt er dem Aufbau (linienAutoAn).
  const linienEffektivAn = opt.linien === 'an' || (opt.linien === 'auto' && linienAutoAn);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-controls={panelId}
        aria-label="Ansicht"
        className="lc-chip inline-flex items-center gap-1 hover:text-brass-700"
        title="Darstellung: Linien, Fussnoten (mit Änderungshistorie), Verweise, Entscheide (mit Zeitraum)"
      >
        {/* Enger Platz in der Sticky-Positionsleiste (@390): Label nur ≥sm, sonst
            reines Icon (Accessible-Name bleibt über aria-label «Ansicht» erhalten). */}
        <span aria-hidden>◧</span><span className="hidden sm:inline">Ansicht</span>
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
          {zeigeLinien && (
            <OptSwitch
              feld="linien"
              an={linienEffektivAn}
              label="Linien"
              titel="Gliederungslinien und Einzug ein- oder ausblenden"
            />
          )}
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
              Muster wie ZeitraumWahl unter «Entscheide»). */}
          {opt.fussnoten === 'an' && <HistAnsichtWahl />}
          <OptSwitch
            feld="verweise"
            an={opt.verweise === 'an'}
            label="Verweise"
            titel="Verweis-Links unterstreichen oder schlicht darstellen (der Link bleibt aktiv)"
          />
          {/* V2·B-1 (David 10.7.2026): 4. Schalter «Entscheide» — blendet die
              verlinkten BGE-Leitfall-Zeilen ein/aus (rein CSS via data-leitfaelle,
              Default AN). B-2: darunter der Zeitraum-Filter, nur wenn Entscheide AN
              (sonst wirkungslos → keine toten Steuerelemente, §13 F4). */}
          <OptSwitch
            feld="leitfaelle"
            an={opt.leitfaelle === 'an'}
            label="Entscheide"
            titel="Verlinkte Bundesgerichts-Leitfälle unter den Artikeln ein- oder ausblenden"
          />
          {opt.leitfaelle === 'an' && <ZeitraumWahl />}
          {/* W2·7-BEZUG/B4: Instanz- und Kantons-Facetten sitzen UNTER dem
              «Entscheide»-Schalter, weil sie ihn verfeinern — er blendet die
              ganze Zeile aus, sie entscheiden, was in ihr steht. Bei
              «Entscheide aus» wirkungslos → nicht gerendert (§13 F4, gleiches
              Muster wie ZeitraumWahl und HistAnsichtWahl). */}
          {opt.leitfaelle === 'an' && <BezugKlassenWahl />}
          {opt.leitfaelle === 'an' && bezugKlassen.includes('kantonal') && (
            <BezugKantonWahl verfuegbar={kantoneVerfuegbar} />
          )}
          {opt.leitfaelle === 'an' && (
            <p className="px-2.5 pb-1 pt-1 text-micro leading-snug text-ink-500">
              {bezugErweitert
                ? 'Zugeschaltete Instanzen werden am Artikel als eigene, benannte Gruppe gezeigt — nie unter die Leitentscheide gemischt. Die Zahl nennt die gezeigten und die insgesamt erfassten Entscheide.'
                : 'Grundeinstellung: nur amtlich publizierte Leitentscheide. Weitere Instanzen laden zusätzliche Daten nach.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
