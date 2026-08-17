// ─── «Ansicht»-Dropdown im Reader-Kopf (W2·5d U-KOPF/A4) — UI zu leserOptionen.ts ─
//
// David 5.7.2026 (A4): «der kopf … soll funktionaler ausgestaltet werden. also
// die darstellungsoptionen (fussnoten linien verweise) sollen im kopf sein mit
// drop down menu.» Die frühere G2a-Chip-Leiste entfällt und geht in EIN «Ansicht»-
// Dropdown im aktionen-Slot des ErlassLeserKopf auf (§3.1: keine Wucherung).
// Seit dem Linien-Rückbau V1 (16.8.2026) sind es zwei Switches; «Linien» ist
// ersatzlos entfallen.
//
// OPTIONEN-RÜCKBAU S1 (Kap. 4f, David F1/F2 «ja»): «Verweise» ist ERSATZLOS
// entfallen (er wirkte auf die gepunktete Unterstreichung der Verweis-Links —
// KORREKTUR S1-Nachzug 17.8.2026: hier stand «bei :hover», und das war falsch;
// die Linie ist dauerhaft, `NormText.tsx:38` setzt `underline` unbedingt und
// tauscht bei Hover nur die Farbe. Messung: StGB Art. 66a, 100 solche Links,
// `text-decoration-line: underline` im Ruhezustand. Ob die Linie im Ruhezustand
// stehen soll, ist die offene Design-Frage Ä25 — s. Fahrplan Kap. 7), und
// die frühere DREIWERTIGE `HistAnsichtWahl` («aus · Fussnoten · Chronologie») ist
// ein gewöhnlicher Switch «Änderungsvermerke» — dieselbe Bedienung wie in V3, ein
// Store-Feld, ein Muster. Bleiben zwei Switches: Fussnoten · Änderungsvermerke.
//
// Der Änderungsvermerke-Switch steht UNBEDINGT da (früher nur bei «Fussnoten an»,
// §13 F4). Seit S1 hängt an ihm auch die «Fassung»-Zeile am Artikelfuss, die NICHT
// zum Fussnoten-Apparat gehört und `data-fussnoten` nicht folgt — bei «Fussnoten
// aus» wirkt er also weiter, und ein wirksames Steuerelement wegzunehmen wäre
// seinerseits der F4-Fehler (nur spiegelbildlich).
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
  HINWEIS_VERMERKE_OHNE_FUSSNOTEN, setzeOption, useLeserOptionen, type OptFeld,
} from './leserOptionen';

function OptSwitch({ feld, an, label, titel, ariaLabel, zusatz, hinweis }: {
  feld: OptFeld;
  an: boolean;
  label: string;
  titel: string;
  /** Expliziter Accessible-Name (überschreibt den Text — z. B. «Fussnoten (12)»). */
  ariaLabel?: string;
  /** Kleines Zusatz-Signal rechts vom Label (z. B. der Fussnoten-Zähler N). */
  zusatz?: ReactNode;
  /** Ä27: erklärende Zeile UNTER dem Schalter — sagt, warum die Stellung «an»
   *  gerade nichts zeigt. Sie ist DESCRIPTION, nicht Name (`aria-describedby`).
   *
   *  Gelernt beim Bau (17.8.2026): zuerst stand der Satz im `aria-label`, also im
   *  Accessible-NAME. Damit hiess der Schalter «Änderungsvermerke — Marker und
   *  Apparat sind mit den Fussnoten ausgeblendet» — und enthielt das Wort
   *  «Fussnoten», den Namen des NACHBAR-Schalters. Zwei bestehende Specs wurden
   *  sofort rot («strict mode violation: … resolved to 2 elements»), und genau
   *  dieselbe Doppeldeutigkeit träfe eine Nutzerin, die per Namen navigiert. Ein
   *  Name benennt das Steuerelement; eine Begründung ist eine Beschreibung. */
  hinweis?: string;
}) {
  const hinweisId = useId();
  return (
    <div>
    <button
      type="button"
      role="switch"
      aria-checked={an}
      aria-label={ariaLabel}
      aria-describedby={hinweis ? hinweisId : undefined}
      title={hinweis ? `${titel}. ${hinweis}` : titel}
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
    {/* AUSSERHALB des Knopfes: läge die Zeile darin, zöge die Namensberechnung
        ihren Text in den Accessible-Name (s. `hinweis` oben) — sie mit
        `aria-hidden` davor zu schützen hätte sie zugleich vor dem Screenreader
        versteckt, also genau vor der Nutzerin, für die sie gedacht ist. Als
        Geschwister ist sie sichtbar UND vorlesbar, und sie ist kein Klickziel
        (ein Hinweis soll nicht schalten). `ink-500` statt `ink-400`: dieselbe
        AA-Auflage wie beim «aus»-Wort (§13/F2). */}
    {hinweis && (
      <p id={hinweisId} className="px-2.5 pb-1 text-micro leading-snug text-ink-500">{hinweis}</p>
    )}
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
export function LeserAnsichtMenu({ fussnotenAnzahl = null, hatAenderungsvermerke = true }: {
  fussnotenAnzahl?: number | null;
  /** S1-Nachzug B3 (§8): trägt DIESER Erlass Änderungsvermerke? `false` ⇒ der
   *  Schalter «Änderungsvermerke» wird gar nicht gerendert, weil er hier nichts
   *  ein- oder ausblenden könnte. Default `true` = anbieten (konservativ, s.
   *  `bieteAenderungsvermerkeSchalter` in `./berechnungen`). */
  hatAenderungsvermerke?: boolean;
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
        title="Darstellung: Fussnoten · Änderungsvermerke"
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
          {/* S1 (Kap. 4f, F1): der Änderungsvermerke-Schalter sitzt UNTER dem
              Fussnoten-Schalter, weil er ihn verfeinert — im OR sind ~83 % der
              Fussnoten Änderungsvermerke, hier trennt man sie von den echten
              Verweisen. «aus» blendet AUSSCHLIESSLICH `kl:'A'` aus (H0-Auflage 1,
              `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`): echte Verweise
              (V), Grauzone (G), Publikationsnachweise (Z), Unklares (U) UND jede
              Fussnote ohne Klasse (alle Kanton-Sidecars) bleiben sichtbar. Die
              Sicherheitsrichtung ist einseitig — nie amtliche Substanz verstecken
              (§1/§8). Zur unbedingten Sichtbarkeit s. Datei-Kopf. */}
          {/* S1-NACHZUG B3 (§8): nur, wenn der Erlass Vermerke TRÄGT. Auf
              Kantonserlassen und Staatsverträgen ohne klassifizierte Historie
              (gemessen: `[data-historie-zeile]` = 0 auf ZH-211.11, BS-640.100,
              LugÜ) blieb dem Schalter nur eine Layout-Raffung von 40 px je
              Artikel — die faktischen Änderungs-Fussnoten ohne Klasse bleiben
              dort sichtbar (H0-Auflage 1, gewollt). Die Beschriftung versprach
              also mehr, als sie hielt. Die Bedingung kommt aus dem DATENMODELL,
              nicht aus der Herkunft — kein `if (kanton)`; Herleitung und
              Korpus-Messung bei `zaehleAenderungsvermerke` in `./berechnungen`. */}
          {hatAenderungsvermerke && (
            <OptSwitch
              feld="histansicht"
              an={opt.histansicht === 'an'}
              label="Änderungsvermerke"
              titel="Änderungsvermerke ein- oder ausblenden — echte Verweise, Grauzone und Publikationsnachweise bleiben sichtbar"
              // Ä27: bei «Fussnoten: aus» steht hier «✓ an», sichtbar ist aber nur
              // die «Fassung»-Zeile — Marker und Apparat hängen am Fussnoten-
              // Schalter. Im flachen Menü ist diese Abhängigkeit sonst unerkennbar.
              hinweis={opt.fussnoten === 'aus' ? HINWEIS_VERMERKE_OHNE_FUSSNOTEN : undefined}
            />
          )}
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
