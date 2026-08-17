import type { UebersichtsAngaben } from './uebersichtAngaben';

// ─── Übersichtsbox der Seitenleiste (FAHRPLAN-LESER-V3 Kap. 4b, Pos. 10) ─────
//
// Die Skizze schreibt sie als ZUGEKLAPPTE Zeile:
//
//   ▸ Übersicht  (SR 312.0 · 480 Art.)                  scrollt MIT weg
//
// Der Kern ist das «▸». Fedlex zeigt drei aufgeklappte Kästen über dem Baum;
// wer im Gesetz liest, sucht dort aber die Gliederung, nicht die Metadaten. Die
// Zusammenfassung in der Zeile beantwortet die Fragen, die man beim Ankommen
// wirklich hat; alles Weitere ist EINEN Klick entfernt und nichts ist versteckt
// (§8 — die Angaben bleiben im DOM und für Ctrl+F/Screenreader erreichbar,
// `<details>` blendet nur visuell aus).
//
// Warum natives `<details>/<summary>` und kein eigener Disclosure: Tastatur,
// `aria-expanded`, Screenreader-Ansage und der Zustand kommen vom Browser —
// eine nachgebaute Variante wäre mehr Code für weniger Verlässlichkeit
// (Design-Grundlage Kap. 1, «Familiarity»). Es gibt hier auch keinen Zustand zu
// persistieren: die Box ist eine Ankunfts-Auskunft, kein Arbeitsbereich.
//
// CLS (§15/2): geschlossen hat die Box eine feste Zeilenhöhe; das Aufklappen
// ist eine NUTZER-Geste unterhalb des klebenden Baum-Kopfes — es verschiebt
// nichts, was gerade gelesen wird — und die Box liegt im Aside, nicht im
// Lesekörper (zur Warn-Zelle s. u.).
//
// ═══ NEUFASSUNG 17.8.2026 · David: «sehr unästhetisch, insbesondere wenn es
//     aufgeklappt ist — mach das schöner und orientiere dich an Fedlex» ═══════
//
// GEMESSEN am Ist (D 1440, hell, aufgeklappt, fünf Erlassarten — Bilder in
// docs/ux-audit-2026-07/reader/leser-v3-uebersicht/vorher/, Zahlen aus mass.mjs):
//
//  (1) Die Ruhezeile lief komplett in der MONO-Stimme (`Geist Mono Variable`,
//      11 px) und brauchte darum an ALLEN FÜNF Erlassen DREI Zeilen. Die
//      Design-Grundlage begrenzt Mono ausdrücklich «auf SR-Nr./Aktenzeichen»
//      (Kap. 2.1) — genau der Befund, den S2 (Ä-(b)) für die Stand-Zeile des
//      Erlass-Kopfs schon behoben hatte; die Box hatte den Nachzug nie bekommen.
//  (2) Vier Zeilen der aufgeklappten Liste waren `truncate` — gebaut für die
//      BREITE Zone C der Ist-Hülle, nicht für eine 18-rem-Leiste. Gemessener
//      Textverlust: StPO «Art:» 282 px, BS-640.100 «Art:» 284 px, LugÜ 98 px,
//      VMWG 66 px, «Stand:» durchgehend 57 px. Erreichbar war der Rest nur im
//      `title` — und ein Tooltip ist keine Auskunft (§8).
//  (3) Im Inneren stand ein ZWEITES Etikett «Erlass-Übersicht» (Kapitälchen +
//      Brass + eigene Linie) unter einer Box, die schon «Übersicht» heisst —
//      zwei Überschriften und zwei waagrechte Linien in 20 px Abstand.
//  (4) Der Halbsatz «massgeblich ist die amtliche Fassung» stand an der StPO
//      ZWEIMAL (Warnung + Grundhinweis) — der H2b-Nachzug (B5) hatte den
//      zweiten WARN-Satz entfernt, den Grundhinweis darunter aber stehen lassen.
//  (5) ZWEI Disclosure-Ebenen: in der aufgeklappten Box lag ein weiteres
//      `<details>` «Mehr zu diesem Erlass» — und dessen `summary` trug zwei
//      Glyphen (eigenes «›» plus das App-weite `::after`, der Ä40-Befund an der
//      inneren Klappe). Dahinter versteckt: die vier §8-Sätze über die Grenzen
//      unserer eigenen Erfassung. Ein Ehrlichkeits-Hinweis hinter zwei Klicks
//      ist keiner.
//  (6) Vier Label-Breiten (21 · 36 · 46 · 38 px) und Doppelpunkte statt einer
//      Wertspalte: jede Zeile begann an einer anderen Stelle — kein Rhythmus,
//      und damit das Gegenteil von Fedlex' «Allgemeine Informationen».
//
// GEBAUT wird darum (Herleitung der Auswahl: `./uebersichtAngaben.ts`):
// EINE Sans-Stimme, eine Label-Spalte fester Breite, Werte darunter
// linksbündig ausgerichtet und UMBRECHEND statt gekappt, `tabular-nums` an den
// Datums-/Zahlenwerten, EINE Haarlinie über und EINE unter der Liste statt
// Kasten und Zwischenüberschrift, alle Abstände auf dem 4-px-Raster, EINE
// Klappe.
//
// ZWEI BEWUSSTE ABWEICHUNGEN, beide begründet statt übergangen:
//  · GRÖSSE. Der Auftrag nennt «Sans 13 px». Die Haus-Skala hat für die Leiste
//    keine 13er-Stufe: `body-s` (14 px) IST die Rolle, die die Design-Grundlage
//    Kap. 2.2 der Seitenleiste zuweist (dort `leser-chrome` genannt — und die
//    tailwind.config sagt ausdrücklich, dass ein zweiter Name für denselben Wert
//    die zweite Wahrheit wäre, die §5 verbietet). `leser-rand` misst zwar 13 px,
//    ist aber die MARGINALIEN-Rolle des Lesekörpers; sie hier zu borgen hiesse,
//    einem Token eine zweite Bedeutung zu geben. Also `body-s` für Liste und
//    Ruhezeile, `xs` (12 px) für Links und §8-Feinschrift.
//  · AUSRICHTUNG. Fedlex richtet seine Werte RECHTS aus (Karte ~200 px breit).
//    Hier nicht: nach der Label-Spalte bleiben rund 184 px, und ein umbrechender
//    Wert («Die Bundesversammlung der Schweizerischen Eidgenossenschaft») liefe
//    rechtsbündig mit ausgefranstem linken Rand — in einer schmalen Spalte
//    schlechter lesbar als linksbündig.

// ═══ ZWEI GESTALTEN, EIN INHALT (H4-Vorbereitung II, 17./18.8.2026) ══════════
//
// BEFUND (Integrations-Fund 17.8., hier @1440 reproduziert): die Box lebt in der
// Seitenleiste. Klappt man die Gliederung ein — die Geste, mit der man BREITE für
// den Text gewinnt —, ist der Steckbrief nicht mehr im DOM: gemessen 1 → 0
// `[data-v3-uebersicht]`. Damit ist er weder sichtbar noch per Ctrl+F oder
// Screenreader erreichbar, obwohl §8 an dieser Box ausdrücklich zusagt, dass die
// Angaben im DOM BLEIBEN und `<details>` nur visuell ausblendet.
//
// GEBAUT ist darum eine ZWEITE GESTALT derselben Angaben — kein zweiter
// Steckbrief. Beide Gestalten bekommen dasselbe `UebersichtsAngaben`-Objekt aus
// derselben reinen Funktion (`./uebersichtAngaben.ts`, §5); was sich
// unterscheidet, ist ausschliesslich die Verpackung:
//
//   UebersichtBox   — Klappe in der Seitenleiste. Die Zone hat dort keinen
//                     Namen ausser dieser Zeile, also trägt sie das «▸ Übersicht»
//                     und die Ruhezeile als Zusammenfassung.
//   UebersichtTafel — offener Block im Panel-Reiter «Steckbrief». Der Reiter
//                     benennt die Zone bereits; eine Klappe mit eigenem Etikett
//                     wäre genau die Doppelnennung, die Ä10 abgeräumt hat, und
//                     eine Klappe wäre zudem ein DRITTER Bedienschritt in einem
//                     Ziel, das mit zweien erreichbar sein soll.
//
// Die Warn-Zelle und die Label/Wert-Liste sind darum eigene Bauteile: sie stehen
// in beiden Gestalten Zeichen für Zeichen gleich, und das ist keine Bequemlichkeit,
// sondern die Bedingung dafür, dass die Ä28-Zusage «die Warnung steht genau
// einmal» überhaupt prüfbar bleibt — es gibt nur EINEN Wortlaut und nur EINE
// Stelle, die ihn setzt.

// ── Warn-Zelle ──────────────────────────────────────────────────────────────
// Sie steht AUSSERHALB des Klapp-Inhalts und wird nie weggeklappt: eine Warnung,
// die man erst aufklappen muss, ist keine (Design-Grundlage Kap. 6 — Zeichen UND
// Wort, nie Farbe allein). Der Wortlaut ist der des Erlass-Kopfs
// (`nichtKonsolidiertSatz`, S3/F5) — bis hierher trug die Box einen ZWEITEN,
// eigenen Wortlaut für denselben Sachverhalt (§5).
//
// §15.2 — KEINE Höhen-Reservierung, und das ist eine Entscheidung, keine Lücke:
// die Box liegt im Aside, nicht im Lesekörper; die CLS-Sonde
// `e2e/leser-v3-kontext-cls` misst ausdrücklich die Lesespalte, und ein
// Nachwachsen hier verschiebt nur den Gliederungsbaum darunter. Eine Reserve wäre
// trotzdem sauberer — sie bräuchte aber die vier Fenster-Messwerte, die der Kopf
// mit `kopf-stand*` hat; ein einzelner geratener Wert wäre schlechter als keiner.
// Als Ä73 vermerkt, nicht stillschweigend weggelassen.
function UebersichtWarnung({ warnung, vorbehalt }: Pick<UebersichtsAngaben, 'warnung' | 'vorbehalt'>) {
  if (!warnung && !vorbehalt) return null;
  return (
    <div data-v3-uebersicht-warnung className="space-y-1 pb-1.5 pl-4 pt-0.5">
      {warnung && (
        <p className="flex items-start gap-1 text-xs leading-snug text-warn-700">
          <span aria-hidden className="shrink-0">⚠</span>
          <span>{warnung}</span>
        </p>
      )}
      {vorbehalt && (
        <p className="flex items-start gap-1 text-xs leading-snug text-warn-700">
          <span aria-hidden className="shrink-0">⚠</span>
          <span>{vorbehalt}</span>
        </p>
      )}
    </div>
  );
}

function UebersichtInhalt({ zeilen, links, hinweise, className }:
Pick<UebersichtsAngaben, 'zeilen' | 'links' | 'hinweise'> & { className: string }) {
  return (
    // `data-v3-uebersicht-inhalt` statt einer Klassen-Kette als Testanker:
    // die Reihenfolge «Warnung VOR den Kindern» ist eine Zusage über die
    // Struktur und darf nicht an Utility-Klassen hängen, die eine
    // Gestaltungsänderung mitnimmt (dieselbe Lehre wie der `data-fn-ref`-Fix
    // in H2: ein Wächter darf ein Element nicht über sein Aussehen suchen).
    <div data-v3-uebersicht-inhalt className={className}>
      {/* Die Label/Wert-Liste. `<dl>` und nicht `<table>`: es sind
          Begriff/Wert-Paare, keine Matrix — und ein Screenreader liest «Art →
          Bundesgesetz» statt Zellkoordinaten. Das Raster steht in index.css
          (`.lc-v3-steckbrief`), damit die Spaltenbreite EINMAL definiert ist
          und nicht an jeder Zeile klebt. */}
      {zeilen.length > 0 && (
        <dl data-v3-uebersicht-liste>
          {zeilen.map((z) => (
            <div key={z.id} data-v3-uebersicht-zeile-id={z.id}>
              <dt>{z.label}</dt>
              {/* Kein `truncate`: der Wert bricht um. Das war der schwerste
                  Ist-Befund (bis 284 px stiller Textverlust je Zeile). */}
              <dd className={z.ziffern ? 'tabular-nums' : undefined}>{z.wert}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Amtliche Ziele. Skizze 4e trennt Fakten und Aktionen — darum eine
          eigene Zeile unter der Liste, in derselben leisen Textlink-Form wie
          die Aktionen-Zeile des Erlass-Kopfs (`lc-chip`), nicht als Wert in
          der Wertspalte. */}
      {links.length > 0 && (
        <p data-v3-uebersicht-quellen className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs">
          {links.map((l) => (
            <a key={l.id} data-v3-uebersicht-link={l.id} href={l.href}
              target="_blank" rel="noopener noreferrer"
              className="text-brass-700 hover:underline">
              <span aria-hidden>{l.zeichen}</span> {l.label}
            </a>
          ))}
        </p>
      )}

      {/* §8-Block: was die Anzeige über ihre EIGENEN Grenzen weiss. Bis Ä72
          lag er hinter einer zweiten Klappe «Mehr zu diesem Erlass»; jetzt
          steht er da, sobald die Box offen ist. Leer = nichts zu vermelden,
          dann entfällt der Block — «keine Einschränkungen» wäre eine Aussage,
          die wir nicht belegen können. */}
      {hinweise.length > 0 && (
        <ul data-v3-uebersicht-hinweise className="mt-2 space-y-1 pt-1 text-xs leading-snug text-ink-500">
          {hinweise.map((h) => <li key={h}>{h}</li>)}
        </ul>
      )}
    </div>
  );
}

/**
 * Der Steckbrief als OFFENER Block — die Gestalt für den Panel-Reiter.
 *
 * Kein `<details>`, kein «▸», keine eigene Überschrift: der Reiter benennt die
 * Zone. Die Ruhezeile bleibt trotzdem, weil sie die zwei Angaben trägt, die man
 * beim Ankommen zuerst sucht (SR-Nummer und Umfang) — hier aber als erste
 * LISTEN-nahe Zeile statt als Klapp-Zusammenfassung.
 */
export function UebersichtTafel({ angaben }: { angaben: UebersichtsAngaben }) {
  const { ruhe, zeilen, links, warnung, vorbehalt, hinweise } = angaben;
  return (
    <div data-v3-steckbrief-tafel className="px-2.5 py-2">
      {ruhe && (
        <p className="tabular-nums pb-1 text-body-s leading-snug text-ink-600 [overflow-wrap:anywhere]">{ruhe}</p>
      )}
      <UebersichtWarnung warnung={warnung} vorbehalt={vorbehalt} />
      <UebersichtInhalt zeilen={zeilen} links={links} hinweise={hinweise}
        className="lc-v3-steckbrief text-body-s leading-snug" />
    </div>
  );
}

export function UebersichtBox({ angaben }: { angaben: UebersichtsAngaben }) {
  const { ruhe, zeilen, links, warnung, vorbehalt, hinweise } = angaben;
  return (
    // ── Ä5 (H2b) · WEISSRAUM, DANN LINIE — KEIN KASTEN ────────────────────────
    // Bis H2 war die Box ein gerahmter, getönter Kasten (`border border-line
    // bg-paper-sunken`) und damit die einzige Fläche der Leiste, die aussah wie
    // ein Bauteil. Design-Grundlage Kap. 8 Nr. 1 verbietet genau das: «Keine
    // Rahmen/Boxen um jedes Element — Trennung über Weissraum, dann Linie». Und
    // der Kasten trug einen DRITTEN Farbton unter den klebenden Sockel (Sheet
    // `paper-raised` · Sockel `paper` · Box `paper-sunken`) — gestapelte Töne,
    // die beim Scrollen als wandernder Streifen sichtbar wurden.
    // Unverändert gültig; Ä70 ändert daran nichts, es entfernt nur die ZWEITE
    // Linie, die im Inneren noch stand.
    <details data-v3-uebersicht className="group">
      <summary
        data-v3-uebersicht-zeile
        className="flex cursor-pointer list-none items-baseline gap-1.5 rounded-sm py-1 text-body-s leading-snug text-ink-600 transition-colors hover:text-brass-700 [&::-webkit-details-marker]:hidden">
        {/* Ä5 · das hängende «·» zwischen Etikett und Werten ist weg: die
            Zusammenfassung fügt ihre Teile SELBST mit «·», ein vierter Trenner
            derselben Zeichenform hing beim Umbruch allein am Zeilenende. Der
            Weissraum trennt zuverlässiger als ein Zeichen, das umbrechen kann. */}
        <span aria-hidden className="shrink-0 text-ink-400 transition-transform group-open:rotate-90">▸</span>
        <span className="min-w-0">
          <span className="font-medium text-ink-700">Übersicht</span>{' '}
          {/* Ä70 · Sans mit `tabular-nums` statt der Mono-Stimme. Die
              SR-Nummer bleibt der Fall, für den Mono reserviert ist (Kap. 2.1)
              — aber sie steht hier in EINER Zeile mit Zähl-Substantiven, und
              zwei Schriftstimmen in einer Zeile waren der sichtbare Teil des
              Befunds. Dieselbe Auflösungsrichtung wie S2/Ä-(b) am Kopf. */}
          <span className="tabular-nums [overflow-wrap:anywhere]">{ruhe}</span>
        </span>
      </summary>

      {/* Die Warn-Zelle steht AUSSERHALB des Klapp-Inhalts und wird nie
          weggeklappt — Herleitung am Bauteil. */}
      <UebersichtWarnung warnung={warnung} vorbehalt={vorbehalt} />

      <UebersichtInhalt zeilen={zeilen} links={links} hinweise={hinweise}
        className="lc-v3-steckbrief mt-1 pl-4 text-body-s leading-snug" />
    </details>
  );
}
