import { memo, type ReactNode } from 'react';
import type { Sektion } from '../../../lib/normtext/browse';
import { romanFrei, margLabel } from '../helpers';
import { merkeRuecksprungVonDom } from '../scrollAnker';

// Entscheid David 5.8.2026 (Chat, «gliederung … standardmässig zugeklappt und erst
// auf klicken öffnen»): ALLE Gliederungs-Ebenen starten zu — STANDARD_OFFEN_TIEFE 0.
// Das ersetzt den Wert 2 vom 18.7.2026 (§15.2-CLS-Fix: oberste Ebenen offen, damit
// der Scroll-Spy keine Mehr-Ebenen-Pfade un-input-zugerechnet aufklappt, auf
// 2-vCPU-CI ~0.06–0.09 CLS). Der Konflikt ist BEWUSST entschieden: Davids
// UI-Entscheid gilt; die Spy-Nachführung (K, David 26.6.) bleibt unverändert, und
// das Perf-Budget-Tor misst den CLS nach — wird es rot, ist die Feinarbeit
// (Spy-Aufklappen nur input-zugerechnet) der nächste Schritt, nicht die Rücknahme
// dieses Entscheids. Manuelles Zu-/Aufklappen (tocBaum) überschreibt den Default.
const STANDARD_OFFEN_TIEFE = 0;

// ─── LM-155 · Tiefenführung der Gliederung (W2·17-UI-BEFUNDE, B4-N1) ─────────
//
// BEFUND (nachgemessen am gebauten Stand, /gesetze/bund/OR @1440, 8.8.2026):
// die sieben Baum-Ebenen lagen bei x = 328 · 337.6 · 347.2 · 356.8 · 366.4 ·
// 376 · 385.6 — ein konstanter Versatz von 9.6 px (`tiefe * 0.6rem`) und
// SONST NICHTS: alle sieben Ebenen trugen dieselbe Tinte (ink-600), dasselbe
// Gewicht (400) und dieselbe Schriftfamilie; nur Ebene 0 hatte eine eigene
// Grösse. Über die sieben Ebenen gab es also GENAU ZWEI unterscheidbare
// Signaturen. Ebene 1 gegen Ebene 4: 28.8 px Versatz in einer 256-px-Spalte,
// in der lange Labels ohnehin umbrechen — die Verschachtelung war praktisch
// nicht ablesbar (Befund LM-155, Cowork-Durchgang 29.7.2026).
//
// WARUM NICHT DER ALTE WEG (Entscheid A28, David 12.7.2026). Der frühere
// Versuch, dem Leser Struktur zu zeigen, zeichnete eine vertikale Guide-LINIE
// in den Normtext-Körper und schaltete sie von sich aus an. Davids Verdikt:
// «das mit den linien funktioniert überhaupt nicht» / «also ist überhaupt
// nicht fördernd für die übersicht» (FAHRPLAN-GESETZES-UX §10.9). Drei Gründe
// stecken darin, und dieser Neubau vermeidet alle drei:
//   (a) FALSCHER ORT — der Guide legte Chrome IN den amtlichen Text. Hier
//       bleibt der Fliesstext unangetastet; die Tiefenführung lebt allein in
//       der Gliederungsspalte, wo Struktur ohnehin das Thema ist.
//   (b) FALSCHES MASS — EINE Linie auf EINER Ebene sagt über die Tiefe nichts;
//       sie markiert eine Grenze, statt eine Ordnung zu zeigen. Hier trägt
//       jede Ebene ihre eigene Stimme.
//   (c) AUFGEDRÄNGT — der Auto-Default schaltete sich selbst ein. Hier gibt es
//       nichts zu schalten: die Gliederung ist ein Verzeichnis, sie DARF
//       gegliedert aussehen. Der `data-linien`-Nutzerschalter und der
//       korpusweit ausgeschaltete Auto-Guide (linienAufbau.ts) bleiben
//       unberührt — A28 wird nicht angetastet, nur nicht wiederholt.
// Und ausdrücklich: KEINE Linie, kein Guide, kein «Gleisbett» im Baum. Die
// A28-Alternativen-Skizze stellt genau die hier benutzten Mittel voran —
// Typo-Hierarchie (#1, «ROI-Kandidat»), Rhythmus (#4, «niedrigstes Risiko»),
// TOC als eigene Struktur-Spalte (#3).
//
// DIE DREI MITTEL:
//  1. EINE SPRACHE FÜR BEIDE SPALTEN (§5). Der Fliesstext unterscheidet die
//     Ebenen längst — amtliche Teil/Titel/Abschnitt in der Display-Stimme
//     (h2/h3/body-l, gestuftes Gewicht), randtitel-promotete Feingliederung
//     («A.» / «I.» / «1.» / «a.») ruhig in der Serif-Stimme (SektionKopf.tsx,
//     `s.randtitel ? 'font-serif …'`). Der Baum sprach diese Sprache bisher
//     NICHT. Er spricht sie jetzt: derselbe Schnitt entlang derselben
//     fachlichen Grenze. Der Gewinn ist die Wiedererkennung — was in der
//     Spalte serif und ruhig ist, ist es im Text auch.
//  2. BEDEUTUNGSGETRAGENE SCHRITTWEITE statt Pixel-Krümel. Der Schritt zu
//     einer amtlichen Gliederungsstufe ist mit 0.875 rem (14 px) fast doppelt
//     so gross wie bisher; der Schritt zu einer Marginalien-Feinstufe bleibt
//     mit 0.625 rem (10 px) bewusst kleiner. Das ist keine willkürliche
//     Zweitskala, sondern dieselbe Unterscheidung wie in Mittel 1: eine
//     amtliche Ebene ist ein echter Fachschnitt, eine Randtitel-Ebene eine
//     Feinordnung, deren Tiefe zusätzlich schon ihr eigenes Enumerator-
//     Alphabet trägt (A. → I. → 1. → a.). Der Nebeneffekt ist praktisch: die
//     Struktur-Schritte werden deutlich, ohne dass die 16-rem-Spalte bei
//     sieben Ebenen leer läuft. `EINZUG_MAX` deckelt tiefere Bäume, damit
//     die Textbreite nie unter ~9 rem fällt (Gegenstück zum `tiefe <= 5`-
//     Deckel der Lesespalte, inhalt.tsx).
//  3. RHYTHMUS. Ein aufgeklappter Ast war eine Textwüste mit 2 px Grundtakt.
//     Die obersten Knoten bekommen einen Vorlauf (12 px / 6 px), der die
//     lange Liste in Blöcke fasst — Weissraum statt Markierung (A28-Skizze
//     #4). Statisch, also keine Eigenbewegung: A33 «Ruhige Gliederung» bleibt
//     gewahrt, der Baum zappelt nicht.
//
// CLS/§15.2: alle drei Mittel sind ZUSTANDS-UNABHÄNGIG — sie hängen an
// `tiefe`/`randtitel`, nie am Scroll-Spy. Die Aktiv-Auszeichnung bleibt
// unverändert höhenneutral (Tinte + `bg-brass-100`, nie Fettschnitt); dass
// die Ebenen-Stimmen ein Gewicht setzen, ändert daran nichts, weil sich
// dieses Gewicht während des Lesens nie ändert (Wurzel des a9-CLS-Rests war
// der WECHSEL, nicht der Schnitt). Reine Darstellung (§3), nur
// Bestands-Tokens (§13/B2/F7): keine neue Grösse (weiterhin nur body-s/xs —
// LM-156 rügt Grössen-Wildwuchs in derselben Spalte), keine neue Farbe.

/** Einzug-Schritt zu einer amtlichen Gliederungsstufe (Teil/Titel/Abschnitt). */
const SCHRITT_AMTLICH = 0.875;
/** Einzug-Schritt zu einer randtitel-promoteten Feinstufe («A.»/«I.»/«1.»/«a.»). */
const SCHRITT_RANDTITEL = 0.625;
/** Deckel des kumulierten Einzugs (rem) — hält die Restbreite der 16-rem-Spalte
 *  auch bei sehr tiefen Bäumen über ~9 rem. */
const EINZUG_MAX = 5;

/**
 * Stimme einer Baum-Ebene: `form` (Grösse/Gewicht/Schriftfamilie) und `tinte`
 * getrennt, weil die Aktiv-Zeile die Tinte überschreibt und zwei gleichrangige
 * Tinten-Utilities in EINEM className sonst quellordnungs-abhängig gewinnen
 * würden (nicht deterministisch, §2). `pre` hebt den Enumerator-
 * Vorsatz («Erster Titel:») nur dort, wo die Ebene selbst nicht schon hebt —
 * eine zweite Emphase auf einer bereits kräftigen Zeile verrauscht sie.
 * Tinten enden bei ink-800: ink-900 bleibt der Aktiv-Zeile vorbehalten, damit
 * «aktiv» auf JEDER Ebene eine Anhebung ist und nie ein Gleichstand.
 */
function ebenenStimme(randtitel: boolean, tiefe: number): { form: string; tinte: string; pre: string } {
  // Marginalien-Feingliederung: Serif-Stimme wie im Fliesstext, ruhig.
  if (randtitel) return { form: 'text-xs font-serif font-normal', tinte: 'text-ink-500', pre: 'font-medium' };
  if (tiefe === 0) return { form: 'text-body-s font-semibold', tinte: 'text-ink-800', pre: '' };
  if (tiefe === 1) return { form: 'text-xs font-semibold', tinte: 'text-ink-700', pre: '' };
  if (tiefe === 2) return { form: 'text-xs font-medium', tinte: 'text-ink-700', pre: '' };
  return { form: 'text-xs font-normal', tinte: 'text-ink-600', pre: 'font-medium' };
}

/** Kumulierter Einzug des KINDES — der Schritt richtet sich nach der Art der
 *  Ebene, die man betritt (amtlich vs. randtitel-promotet), nicht nach der
 *  Zählung. Deterministisch, gedeckelt. */
function kindEinzug(einzug: number, kind: Sektion): number {
  return Math.min(EINZUG_MAX, einzug + (kind.randtitel ? SCHRITT_RANDTITEL : SCHRITT_AMTLICH));
}

// TOC-Gliederungsbaum: jede Stufe einklappbar (geteilter Zustand mit dem
// Fliesstext); Dreieck klappt, Label springt.
// Rank 4 (QS-PERF, §15/4): React.memo (Default-Komparator) — der Baum re-rendert
// sonst bei JEDER Scroll-Spy-Aktualisierung des Parents (setAktArtikel etc.) mit,
// obwohl nur aktivPfad/offen ihn betreffen. Props sind referenzstabil: sektionen
// (useMemo), offen=tocBaum (State), onToggle/onSprung (useCallback) → memo bricht
// nur bei echtem aktivPfad-/offen-Wechsel ab. Reine Laufzeit, kein Output (§6.4).
export const SektionBaumTOC = memo(function SektionBaumTOC({ sektionen, aktivPfad, offen, onToggle, onSprung }: {
  sektionen: Sektion[]; aktivPfad: string[]; offen: Record<string, boolean>; // aktivPfad = Sektions-IDs
  onToggle: (id: string) => void; onSprung: (id: string) => void;
}) {
  // Akkordeon: Standard zu. Aufgeklappt wird durch Klick (Chevron/Sprung) ODER
  // automatisch durch den Scroll-Spy (K): der aktive Zweig klappt beim Scrollen
  // auf und beim Verlassen wieder zu. Manuell (Klick) geöffnete Zweige bleiben
  // offen (autoOffenRef im Reader steuert das). Markierung über `aktivPfad`.
  const zeile = (s: Sektion, tiefe: number, einzug: number, erster: boolean): ReactNode => {
    const auf = offen[s.id] ?? tiefe < STANDARD_OFFEN_TIEFE;
    const { pre, rest } = romanFrei(s.label);
    const aktiv = aktivPfad.includes(s.id);
    const hatKinder = s.kinder.length > 0;
    // LM-155 Mittel 1: Ebenen-Stimme (Form/Tinte getrennt, s. ebenenStimme).
    const stimme = ebenenStimme(s.randtitel === true, tiefe);
    // LM-155 Mittel 3: Rhythmus — die obersten Knoten bekommen einen Vorlauf,
    // der den aufgeklappten Ast in Blöcke fasst. Der jeweils ERSTE Knoten einer
    // Liste bleibt bündig (kein Vorlauf gegen die Kopfzeile bzw. gegen den
    // Elternknoten). Statisches margin: kein Layout-Shift zur Laufzeit (§15.2).
    const takt = erster ? '' : tiefe === 0 ? 'mt-3' : tiefe === 1 && !s.randtitel ? 'mt-1.5' : '';
    return (
      // data-sektion-id: erlaubt dem Reader (inhalt.tsx) beim Auto-Zuklappen zu
      // prüfen, ob dieser Ast im Sichtfenster des [data-toc]-Containers liegt —
      // sichtbare Äste werden NICHT zugeklappt (§15.2, kein On-Screen-Reflow).
      <li key={s.id} data-sektion-id={s.id}>
        {/* LM-155 Mittel 2: der Einzug kommt KUMULIERT aus der Rekursion
            (kindEinzug), nicht mehr aus `tiefe * 0.6rem` — nur so kann der
            Schritt von der Art der betretenen Ebene abhängen. */}
        <div className={`flex items-start ${takt}`} style={{ paddingLeft: `${einzug}rem` }}>
          {/* LM-147 (W2·17-UI-BEFUNDE-B4): `aria-expanded` fehlte am Klappknopf — ein
              Screenreader kündigte weder den Zustand noch dessen Wechsel an
              (`aria-label` allein sagt nur die NÄCHSTE Aktion, nicht den IST-Zustand,
              WAI-ARIA-Disclosure-Muster). Rein deklarativ (`auf`, bereits vorhanden),
              kein Verhaltens-/Render-Einfluss. */}
          {hatKinder
            ? <button type="button" onClick={() => onToggle(s.id)} aria-expanded={auf} aria-label={auf ? 'Einklappen' : 'Aufklappen'} className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-micro w-4">{auf ? '▾' : '▸'}</button>
            : <span className="shrink-0 w-4" aria-hidden />}
          {/* W2·10-UI-NAV/R5: die verlassene Leseposition VOR dem Sprung vormerken.
              Der TOC-Sprung erzeugt bewusst keinen History-Eintrag (LM-202) — ohne
              diese Notiz gäbe es keinen Rückweg. Reine Lese-Operation auf dem DOM,
              kein State, kein Re-Render: `onSprung` bleibt unverändert der
              autoritative Sprung-Handler, hier hängt nur die Notiz davor. */}
          <button type="button" onClick={() => { merkeRuecksprungVonDom(); onSprung(s.id); }} data-toc-aktiv={aktiv ? '1' : undefined} aria-current={aktiv ? 'true' : undefined}
            // AKTIV-AUSZEICHNUNG HÖHENNEUTRAL (Wurzel des a9-CLS-Rests 0.001726…).
            // Die Aktiv-Zeile trug zusätzlich `font-medium` — und der Fettschnitt
            // ist keine reine Farbänderung: bei 256 px Spaltenbreite bricht er
            // lange Labels um. Gemessen an derselben Zeile («1. Titel: Allgemeine
            // Bestimmungen»): 42.5 px fett gegen 23.25 px normal, also 19.25 px
            // Sprung. Wandert die Markierung beim Lesen weiter, schiebt das die
            // ganze Gliederung darunter; fällt die Spy-Korrektur dabei aus dem
            // 500-ms-`hadRecentInput`-Fenster (gemessen: Klick + 552 ms), zählt
            // der Shift als unerwarteter CLS (§15.2).
            // Ersetzt durch zwei Signale, die die Zeilenhöhe nicht anfassen:
            // Tinte (ink-600 → ink-900) und Fläche (bg-brass-100). Das ist
            // dieselbe Aktiv-Sprache wie im SprachUmschalter — bestehende Tokens,
            // kein neuer Farb-Rohwert (§13/F7). Semantischer Träger bleibt
            // unverändert `aria-current`, die Marker-Sprache `data-toc-aktiv`.
            // LM-156 (W2·17-UI-BEFUNDE-B4): `bg-brass-100/70` (Opazitäts-Modifikator
            // auf einer `var(--brass-100)`-Custom-Property) erzeugt bei diesem
            // Tailwind-Stand KEINE Utility-Regel — geprüft im kompilierten CSS
            // (`dist/assets/*.css`): nur das nackte `bg-brass-100` existiert, die
            // `/70`-Variante fehlt vollständig. Die «Fläche» war dadurch bislang
            // UNSICHTBAR (0 % statt 70 % Deckkraft) — die aktive Zeile trug in
            // Wirklichkeit nur die Tinten-Änderung, der zweite der beiden im
            // Kommentar oben versprochenen Signale griff nicht. Fix hier: das
            // bereits VORHANDENE, tor-geprüfte Vollfarb-Token `bg-brass-100` (wie
            // `.lc-badge-massgeblich`/`.lc-chip-selected`, index.css) — keine neue
            // Farbe, nur der funktionierende statt der stillschweigend leer
            // laufenden Opazitäts-Variante. Die generelle Opazitäts-Modifikator-
            // Lücke (jedes `text-*/NN`/`bg-*/NN` auf `var(--x)`-Farben) ist eine
            // Tailwind-Config-Frage (`tailwind.config.js`, ausserhalb src/ und
            // damit ausserhalb dieses Auftrags) — als Nebenfund gemeldet, nicht
            // hier gelöst.
            // LM-155: `stimme.form` (Grösse/Gewicht/Schrift) steht IMMER,
            // `stimme.tinte` nur im Ruhezustand — die Aktiv-Tinte ink-900 darf
            // nicht mit einer gleichrangigen Tinten-Utility im selben className
            // um die Quellordnung streiten (§2, s. ebenenStimme).
            className={`flex-1 text-left rounded px-1.5 py-0.5 leading-snug transition-colors ${stimme.form} ${aktiv ? 'text-ink-900 bg-brass-100' : `${stimme.tinte} hover:text-ink-900 hover:bg-paper-sunken/60`}`}>
            {pre ? <><span className={stimme.pre}>{pre}:</span> {margLabel(rest)}</> : margLabel(s.label)}
          </button>
        </div>
        {/* Auf-/Zuklappen via grid-rows (0fr↔1fr) — Kinder bleiben gemountet.
            §15.2: KEINE Höhen-ANIMATION (früher `transition-[grid-template-rows]
            duration-300`). Eine animierte Höhenänderung reflowt Frame für Frame die
            Geschwister-Zeilen = fortlaufender Layout-Shift; läuft der Auf-/Zuklapp
            durch den Scroll-Spy (kein Input) oder unter CPU-Last über das 500-ms-
            Input-Fenster hinaus, zählt jeder Frame als unerwarteter CLS (leser-kopf-a9).
            Sofortiges Umschalten = EIN input-zugerechneter Reflow (flushSync im
            Reader), CLS-frei. Reine Darstellung (§3); der Baum bleibt vollständig. */}
        {/* `invisible` (visibility:hidden) am ZUGEKLAPPTEN Ast — QS-E2E-STABIL, 7.8.2026.
            Die grid-rows-Technik klappt nur die HÖHE auf 0 und klemmt den Rest per
            overflow-hidden ab. Die Kind-Knöpfe blieben dabei vollwertige, bedienbare
            Bedienelemente: eigene Bounding-Box, in der Tab-Reihenfolge, im
            Accessibility-Baum. Auf /gesetze/bund/BV gemessen (Default zugeklappt seit
            5.8.): 39 Sprung-Knöpfe, davon 30 unsichtbar — und ALLE 39 fokussierbar.
            Ein Tastatur- oder Screenreader-Nutzer lief also durch 30 Bedienelemente,
            die für das Auge nicht existieren; das Panel behauptete Bedienbarkeit, die
            es nicht gab (§8). visibility:hidden nimmt sie aus Hit-Testing, Fokus-
            Reihenfolge und a11y-Baum.
            Bewusst NICHT display:none: visibility:hidden lässt die Geometrie
            unangetastet, also bleiben die Rect-Messungen des Scroll-Spy
            (inhalt-hooks.tsx, «sichtbare Äste werden nicht zugeklappt») Bit für Bit
            dieselben — die Zustandsführung ändert sich nicht (§6). Kinder bleiben
            gemountet wie bisher, die Höhe ist unverändert 0, also kein CLS-Effekt
            (§15.2 unberührt).
            Zweitwirkung, deretwegen der Befund überhaupt auffiel: ein Playwright-
            Klick auf so einen Knopf konnte NIE landen (die Box lag hinter einem
            anderen Knopf) und lief in Endlos-Retry bis zum 270-s-Budget — vier Tests
            à drei Versuche = 1 h 2 min Shard 2/8 am 7.8.2026. */}
        {hatKinder && (
          <div className={`grid ${auf ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] invisible'}`}>
            <div className="overflow-hidden min-h-0">
              <ul className="space-y-0.5 mt-0.5">{s.kinder.map((k, i) => zeile(k, tiefe + 1, kindEinzug(einzug, k), i === 0))}</ul>
            </div>
          </div>
        )}
      </li>
    );
  };
  return <ul className="space-y-0.5">{sektionen.map((s, i) => zeile(s, 0, 0, i === 0))}</ul>;
});
