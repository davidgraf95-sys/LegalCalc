import { type ReactNode } from 'react';
import type { CurrencyEintrag } from '../../../lib/normtext/browse';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import {
  datumCh, naechsteFassungSatz, nichtKonsolidiertSatz, standausweisSatz, zaehlWort,
} from '../../../lib/normtext/erlassKopfText';
import { MASSGEBLICH_HALBSATZ } from '../../../lib/benennung';
import { QuellLink } from '../../../components/ui/QuellLink';
import { kennungEtikett, titelOhneKlammerSuffix } from '../helpers';

// W2·5d G2b — EINE Leser-Kopf-Komponente für ALLE Grundarten (Kopf-Zusammen-
// führung, §3.3): Ersetzt die zwei früher duplizierten <header>-Blöcke (Snapshot
// vs. pdf-embed) durch EINE Quelle (§5). Reine Darstellung (§3).
//
// ─── W2·5m-LESER-V3 · S3 (Skizze Kap. 4e, Pos. 11 + 18) ──────────────────────
// Vorher standen hier bis zu NEUN gleich aussehende Mono-Chips mit Brass-Kante
// in einer einzigen umbrechenden Zeile — darunter drei grundverschiedene Dinge:
// externe Links, ein Knopf und reine Textangaben (Befund LM-045/046 und
// Ästhetik-Urteil Ä6). Der Kopf trennt sie jetzt nach ROLLE in vier Bänder:
//
//   1  Titel                 — was ist das (Serif, eine Farbe)
//   2  Fakten                — SR · Zahl der Bestimmungen
//   3  Stand + Status        — wie aktuell ist es, und was fehlt trotzdem
//   4  Aktionen              — wohin kann ich (ruhige Text-Links, keine Kästen)
//
// Die Chip-Optik ist damit weg; die Aktionen-Knöpfe kommen weiterhin als
// `aktionen`-Slot aus den Aufrufern und tragen dort `.lc-chip` — für DIESE Zeile
// wird die Chip-Anatomie in `.lc-kopf-aktionen` neutralisiert (index.css), damit
// der Slot-Vertrag unverändert bleibt und kein Aufrufer umgebaut werden muss.
// Das 44-px-Tap-Ziel der Chips bleibt dabei ausdrücklich erhalten (F2b/a11y).
export function ErlassLeserKopf({
  erlass, overline, artikelAnzahl, bestimmungsWort = 'Artikel', kennzahlen = null,
  aktionen, hinweis, currency, nichtKonsolidiert = false, nichtKonsolidiertSeit = null,
  kennung = null,
}: {
  erlass: BrowseErlass;
  /** ── Ä-(d) aus S3 (LESER-V3 H2b) · Kennung VOR dem Titel ──────────────────
   *  `null` (Vorgabe) = die S3-Zitierform «Volltitel (Kürzel)» bleibt Zeichen für
   *  Zeichen, wie sie ist — die Ist-Hülle setzt die Prop nicht und ist damit
   *  unverändert (FL-4).
   *
   *  Ein Wert = der Kopf stellt die Kennung VOR den Titel und lässt das
   *  Klammer-Suffix weg. Anlass (gemessen 17.8.2026 am LugÜ): bei sehr langen
   *  Staatsvertrags-Titeln stand das Kürzel am Ende einer dreizeiligen, 147 px
   *  hohen H1 — wer den Erlass wiedererkennen will, sucht genau diese vier
   *  Zeichen und findet sie zuletzt. Dieselbe Information, andere Reihenfolge,
   *  nichts doppelt.
   *
   *  WER entscheidet, steht NICHT hier: die Regel ist erlassabhängig und liegt
   *  darum in der Hülle (`v3/erlassAnsicht.titelKennung`, rein und unit-geprüft).
   *  Dieser Kopf ist geteilte Darstellung (§3) und darf keine Erlass-Weiche
   *  tragen — und er darf auch nicht aus `v3/` importieren (Abhängigkeitsrichtung
   *  Hülle → geteilte Schicht, nie umgekehrt). */
  kennung?: string | null;
  overline: ReactNode;
  /** Artikelzahl (Snapshot); null = keine Zählung (pdf-embed). */
  artikelAnzahl: number | null;
  /** Zähl-Substantiv (W2·5d G3a/⑥): «Artikel» bzw. «Paragraphen» für §-Kantone
   *  (bestimmungsEtikett='paragraf'). NUR sichtbares Label — der Anker bleibt
   *  überall art-<token> (K2/R8). Entwurf-Etikett (K6), darum kein Zitat-Label. */
  bestimmungsWort?: 'Artikel' | 'Paragraphen';
  /** S3 (Fahrplan Kap. 14, «Anhang-Dominanz»): Kennzahlen des Gliederungs-Modells
   *  — EINE Quelle für «wie viel davon ist Anhang» (§5, dieselbe Zahl wie in der
   *  Erlass-Übersicht). Fehlt sie, bleibt es beim `bestimmungsWort`: lieber das
   *  gewohnte Etikett als ein aus Nichts abgeleitetes (§8). */
  kennzahlen?: { artikelAnzahl: number; anhangArtikel: number } | null;
  /** Grundart-spezifische Aktionen (Herunterladen/Reiter/Options bzw. PDF-Download). */
  aktionen?: ReactNode;
  hinweis: string;
  /** P1-d: maschineller Fedlex-Currency-Beweis (Standausweis / künftige Fassung). */
  currency?: CurrencyEintrag;
  /** W2·19-GLIEDERUNG/S6 + S3: mindestens eine in Kraft getretene Änderung ist
   *  NICHT in den gezeigten Text konsolidiert. PROMOTION, kein Neubau: dieselbe
   *  Tatsache steht je Revisions-Zeile im KontextPanel
   *  (`RevisionBezug.nichtKonsolidiert`) — sie wird hier aggregiert an die Stelle
   *  gehoben, an der man sie VOR dem Lesen sieht (§5: eine Datenquelle, zwei
   *  Auflösungsgrade). `false` = keine Aussage, kein Banner (§8).
   *
   *  Nur BEREITS GELTENDE Änderungen zählen — der Stichtagsfilter sitzt beim
   *  Erzeuger (`fruehestesInKraft`, lib/normtext/revisionen.ts), nicht hier:
   *  die Darstellung entscheidet nicht, was gilt (§3). */
  nichtKonsolidiert?: boolean;
  /** S3/F5: ISO-Datum des FRÜHESTEN nicht konsolidierten Inkrafttretens — der
   *  Zeitbezug des Klartextsatzes («eine seit 01.07.2025 geltende Änderung»).
   *  `null` = Tatsache belegt, Datum nicht bekannt: dann nennt der Satz keines,
   *  statt eines zu erfinden (§8).
   *
   *  Bewusst eine ZWEITE Prop und nicht `boolean | string` in einer: die
   *  Übergangsform trug zwei Aussagen («gibt es das?» / «seit wann?») in einem
   *  Wert und zwang jeden Aufrufer, sie über die Wahrheitswertigkeit eines
   *  Strings zu koppeln. Sie stammte aus der Bau-Reihenfolge (das V3-Modell
   *  pinnte das Feld auf `boolean`, während die V3-Hülle in fremder Bauhand
   *  lag); mit dem Nachzug ist der Grund weg — und mit ihm die Union. */
  nichtKonsolidiertSeit?: string | null;
}) {
  // Fedlex hängt das Kürzel als Klammer-Suffix an den Volltitel («… (Strafpro-
  // zessordnung, StPO)»). Bis S3 stand hier «StPO — Schweizerische Strafprozess-
  // ordnung» in ZWEI Farben; Skizze 4e dreht das auf die gewohnte Zitierform
  // «Volltitel (Kürzel)» in EINER Farbe — zweifarbige Titel lasen sich wie zwei
  // Angaben, obwohl es eine ist (Ä6).
  // B1 (H2b-Nachzug): die Regex lebt jetzt EINMAL in `helpers` — dieselbe
  // Zeichenkette, über die `v3/erlassAnsicht` Länge und Gleichheit entscheidet
  // (§5: gemessen wird, was gedruckt wird). Verhalten hier unverändert.
  const titelOhneSuffix = titelOhneKlammerSuffix(erlass.titel);
  const kuerzel = erlass.kuerzel.trim();
  const titelRedundant = titelOhneSuffix.toLowerCase() === kuerzel.toLowerCase();
  // Ä-(d): mit `kennung` trägt der Titel das Klammer-Suffix nicht mehr — die
  // Kennung steht als eigenes, vorangestelltes Element in derselben H1 (sie
  // bleibt damit Teil des zugänglichen Namens der Überschrift, wird nur zuerst
  // gelesen). Ohne `kennung` bleibt die Zeile Zeichen für Zeichen die von S3.
  const titelZeile = !kuerzel || titelRedundant || kennung
    ? (titelOhneSuffix || kuerzel)
    : `${titelOhneSuffix} (${kuerzel})`;

  const wort = zaehlWort(bestimmungsWort, kennzahlen);
  // §8: bei GANZ aufgehobenem Erlass ist die Aufhebung DIE Aussage — weder ein
  // Standausweis noch eine Konsolidierungs-Warnung daneben (beide wären
  // irreführend), und kein «geltende Fassung»-Link (er führte auf die
  // aufgehobene Konsolidierung; der amtliche Link liegt ehrlich beschriftet im
  // Aufhebungs-Banner unten).
  const lebt = !erlass.aufgehoben;
  const warnung = lebt && nichtKonsolidiert ? nichtKonsolidiertSatz(nichtKonsolidiertSeit) : null;

  // Fakten- und Stand-Segmente werden als Liste gebaut und mit einem Mittepunkt
  // gefügt — so kann kein führender/doppelter Trenner entstehen, wenn ein Wert
  // fehlt (Kanton ohne SR, VD-Erlasse mit leerem `stand`, pdf-embed ohne Zählung).
  // Ä75 (18.8.2026): das Etikett «SR» steht nur am BUNDESERLASS. Über kantonalen
  // Nummern war es eine falsche Fundstellenangabe (BS-640.100 steht nicht in der
  // SR des Bundes) — die Weiche und der Grund, warum kein Kantons-Kürzel an seine
  // Stelle tritt, stehen bei `kennungText` in `../helpers`. Die Mono-Auszeichnung
  // `.num` bleibt an der ZAHL: sie gilt der Nummer, nicht dem Etikett
  // (Design-Grundlage Kap. 2.1 «auf SR-Nr./Aktenzeichen begrenzt»).
  const fakten = [
    erlass.sr
      ? <>{kennungEtikett(erlass) ? `${kennungEtikett(erlass)} ` : ''}<span className="num">{erlass.sr}</span></>
      : null,
    artikelAnzahl != null ? <><span className="num">{artikelAnzahl}</span> {wort}</> : null,
  ].filter(Boolean) as ReactNode[];

  // S2 · Ä-(b) «Die Stand-Zeile mischt Datumsformen» (Nachtrag S3, Ästhetik-
  // Gegenprüfung 16.8.2026): `Stand 01.04.2025` lief in der Mono-Auszeichnung
  // `.num`, das Datum im Standausweis daneben proportional — gleiche Grösse, zwei
  // Anmutungen in EINEM Satz. Aufgelöst zu EINER Auszeichnung, und zwar in
  // Richtung der Design-Grundlage Kap. 2.1: die Mono-Stimme ist dort ausdrücklich
  // «auf SR-Nr./Aktenzeichen begrenzt» — Daten gehören nicht dazu. Beide Daten
  // laufen jetzt in der Kopf-Stimme mit `tabular-nums` (Grundlage Kap. 2.3:
  // «tabular-nums für Beträge/Daten/Artikelnummern»); die Auszeichnung sitzt am
  // <p> der Zeile, damit sie AUCH den Standausweis trifft, der als reiner String
  // aus `erlassKopfText.ts` kommt. Damit bleibt der Risikopfad
  // `src/lib/normtext/**` unberührt (§5: derselbe String steht im prerenderten
  // SEO-Kopf; ihn in ein Fragment zu zerlegen hätte beide Seiten und den
  // Gegenprüfungs-Hash angefasst — dieselbe Falle, die S3 bei `ANHANG_DOMINANZ`
  // schon notiert hat). Die SR-Nummer in der Fakten-Zeile darüber behält `.num`:
  // sie IST der Fall, für den die Mono-Stimme reserviert ist.
  const stand = [
    erlass.stand ? <>Stand {datumCh(erlass.stand)}</> : null,
    // K-1: Ur-Inkrafttreten (Fedlex `dateEntryInForce`, build-time projiziert ⇒
    // CLS 0). Distinkt vom «Stand» (Konsolidierung) — nur Bund; Kanton trägt es
    // nicht (§8). «vom …» wird NICHT gedoppelt (steht im Ingress).
    erlass.inkraftSeit ? <>in Kraft seit {datumCh(erlass.inkraftSeit)}</> : null,
    // F5-Standausweis. Prerender-stabil (Sidecar zur Bauzeit erhoben, keine
    // Client-Datums-Logik). Wortlaut aus `erlassKopfText` — derselbe String
    // steht im prerenderten SEO-Kopf (§5, `seo-detail.ts`).
    currency?.geprueftAm && lebt ? standausweisSatz(currency.geprueftAm) : null,
    currency?.naechsteFassungAb
      ? <span className="text-warn-700">{naechsteFassungSatz(currency.naechsteFassungAb)}</span>
      : null,
  ].filter(Boolean) as ReactNode[];

  return (
    <header className="space-y-2 border-b border-line pb-5">
      <p className="lc-overline">{overline}</p>

      {/* Zwei-Stimmen-Regel (DESIGN-REGLEMENT §e): Serif trägt den zitierfähigen
          Quelltext einschliesslich Erlass-Kopf — bis S3 lief der Titel als
          einzige Stelle des Kopfs noch auf der Sans-Display-Stimme (h-Tag-Regel
          index.css). min-h-titel-2z (§15.2) reserviert unverändert die
          2-Zeilen-Höhe gegen den font-display-Swap (CLS 0); nur
          Platz-Reservierung — der volle Titel steht immer (§15/2). */}
      {/* ── Ä101 (Live-Ästhetik-Prüfung 18.8.2026) · KEINE SILBENTRENNUNG IM
          ERLASS-TITEL ────────────────────────────────────────────────────────
          GEMESSEN @1440 und @390: `hyphens-auto` trennte die Überschrift mitten
          im Namen — «Aner-kennung» (LugÜ), «Strafprozess-ordnung» (StPO). Der
          Titel ist der NAME des Erlasses und die grösste Type der Seite;
          Design-Grundlage Kap. 8 Nr. 7 verbietet die automatische Trennung
          ausdrücklich für Überschriften (der Browser trennt nach Wörterbuch,
          nicht nach Kompositum-Fuge, und in einer 32-px-Serif sieht man jeden
          Fehlgriff). `[overflow-wrap:anywhere]` BLEIBT: es fängt den
          pathologischen Fall — ein einzelnes Wort, das breiter ist als die
          Spalte — und bricht dann ohne Trennstrich, statt die Zeile zu sprengen.
          Zwei Regeln, zwei Aufgaben: keine Kosmetik-Trennung, aber auch kein
          Überlauf. */}
      <h1 className="font-serif text-h2 sm:text-h1 font-semibold text-ink-900 [overflow-wrap:anywhere] min-h-titel-2z">
        {/* Ä-(d): die Kennung als eigene, nicht umbrechende Marke VOR dem Titel.
            Kein zweites Element neben der H1 und kein `aria-label`-Ersatz — sie
            ist Teil desselben Namens und bleibt darum in der Überschrift; nur
            ihre Stelle wechselt. `whitespace-nowrap`, damit «LugÜ» nie über zwei
            Zeilen reisst; der Punkt-Trenner ist `aria-hidden`, weil er die
            Aussprache nur unterbrechen würde. */}
        {kennung && (
          <>
            <span data-kopf-kennung className="whitespace-nowrap">{kennung}</span>
            <span aria-hidden className="mx-2 font-normal text-ink-300">·</span>
          </>
        )}
        {titelZeile}
      </h1>

      {fakten.length > 0 && (
        <p className="text-xs text-ink-500">
          {fakten.map((f, i) => (
            <span key={i}>{i > 0 && <span className="text-ink-300" aria-hidden> · </span>}{f}</span>
          ))}
        </p>
      )}

      {/* §15.2 — WARUM STAND UND STATUS EINE HÖHENFESTE ZELLE TEILEN.
          Beide Zeilen wachsen NACH dem ersten Paint: der Standausweis kommt aus
          dem Currency-Sidecar, die Warnung aus dem Revisions-Sidecar. Der erste
          Bauversuch der Warnung (9.8.2026) setzte einen `lc-notice-warn`-Block
          ans Kopfende und wurde GEMESSEN rot — CLS 0.0227, Quelle laut
          layout-shift-`sources` das um 72 px nach unten gerutschte 2-Spalten-
          Grid (e2e/leser-kontext-e4 hält den Sidecar per Route bis NACH dem
          Start des CLS-Beobachters zurück, der Shift ist also reproduzierbar).
          Die Lehre daraus war «feste Zeile statt eigener Banner»; S3 behält sie
          und verallgemeinert sie: eine Zelle mit reservierter Höhe für BEIDE
          asynchronen Aussagen. Eine gemeinsame Zelle statt zwei Einzel-
          Reservierungen, weil sich die Zeilen den Platz teilen können — der
          Warnfall (lang, 5 von 227 Erlassen) trifft fast immer auf einen
          Standausweis, der auf derselben Breite kürzer ausfällt.
          Die Höhe ist GEMESSEN kalibriert (Tokens `kopf-stand*` in
          tailwind.config.js — dort stehen die vier Fenster-Werte samt Messfall),
          nicht geschätzt: schmal brechen dieselben Sätze über mehr Zeilen. */}
      <div className="min-h-kopf-stand sm:min-h-kopf-stand-sm md:min-h-kopf-stand-md space-y-1">
        {/* S2 · Ä-(b): `tabular-nums` an der ZEILE — eine Auszeichnung für beide
            Daten, auch für das im String steckende (s. Herleitung oben). */}
        {stand.length > 0 && (
          <p className="text-xs leading-snug tabular-nums text-ink-500">
            {stand.map((s, i) => (
              <span key={i}>{i > 0 && <span className="text-ink-300" aria-hidden> · </span>}{s}</span>
            ))}
          </p>
        )}
        {/* F5-Warnzeile: Klartext, nicht Tooltip. Der ganze Positions-11-Befund
            war, dass die Einschränkung nur dort stand, wo man sie erst NACH dem
            Lesen findet. «⚠» ist redundante Verstärkung des Wortes, nie
            alleiniger Bedeutungsträger (DESIGN-REGLEMENT B3) ⇒ aria-hidden.
            Ohne Warnung trägt die Zeile den unveränderten Grundhinweis — §8:
            «keine Warnung» heisst hier auch «noch nicht bekannt», also wird
            nichts Beruhigendes behauptet. */}
        <p className={`text-xs leading-snug ${warnung ? 'text-warn-700' : 'text-ink-500'}`}>
          {warnung
            ? <><span aria-hidden>⚠ </span>{warnung}</>
            : hinweis}
        </p>
      </div>

      {/* Aktionen-Zeile (Skizze 4e): Icon + Label als ruhige Text-Links, keine
          Chip-Kästen. Ist-Verhalten unverändert — dieselben URLs, dasselbe
          target/rel, derselbe `aktionen`-Slot in derselben Reihenfolge. */}
      {/* ── Ä110 (Live-Ästhetik-Prüfung 18.8.2026) · EIN ZIEL, EIN NAME ──────
          GEMESSEN hiess DERSELBE Fedlex-Link an drei Stellen dreierlei: hier
          «↗ geltende Fassung», am Artikel und am Sektionskopf «amtliche Fassung
          ↗», in der Übersichtsbox «geltende Fassung». Und die Zeile mischte die
          Schreibung: ein klein beginnendes Label neben zwei gross beginnenden
          («⧉ In neuem Reiter», «⬇ Amtliches PDF»).
          JETZT, nach dem Benennungs-Glossar (Design-Grundlage, Abschnitt
          «Benennung»): der Link heisst überall «Amtliche Fassung ↗» — der Pfeil
          HINTEN, weil er das Verlassen der Seite ankündigt und darum ans Ende
          der Beschriftung gehört, nicht davor. «geltende» fällt weg: es doppelt
          die Aussage der Stand-Zeile darüber und ist am aufgehobenen Erlass
          gerade falsch (dieser Zweig läuft dort ohnehin nicht — `lebt`).
          Alle Beschriftungen der Zeile beginnen jetzt gross; das ist die eine
          Schreibung, die Ä110 verlangt.
          B-1 (31.8.2026): der Wortlaut ist nicht mehr Literal, sondern kommt aus
          dem geteilten `QuellLink` — dasselbe Ziel hiess an vier Stellen
          viererlei, obwohl Ä110 seit dem 18.8. feststand. `.lc-chip` bleibt: die
          Zeile neutralisiert die Chip-Anatomie selbst (index.css,
          `.lc-kopf-aktionen`), der Slot-Vertrag ist unverändert. */}
      <div className="lc-kopf-aktionen flex flex-wrap items-center gap-x-5 gap-y-0.5 text-xs">
        {erlass.quelleUrl && lebt && (
          <QuellLink href={erlass.quelleUrl} className="lc-chip" />
        )}
        {aktionen}
      </div>

      {/* §8-Ehrlichkeit: GANZ aufgehobener Erlass (jolux:dateNoLongerInForce). Der
          Snapshot bleibt als historische Fassung lesbar, wird aber unmissverständlich
          als aufgehoben ausgewiesen — Status-Banner (Design-Token danger, §13, kein
          Ad-hoc-Rot) mit amtlichem Live-Link + Nachfolger-Link. */}
      {erlass.aufgehoben && (
        <div role="status" className="lc-notice-danger text-body-s leading-snug space-y-1.5">
          <p>
            <strong className="font-semibold">Aufgehoben per {datumCh(erlass.aufgehoben.seit)}.</strong>{' '}
            Dieser Erlass ist nicht mehr in Kraft. Der Text bleibt als historische Fassung
            (Stand {datumCh(erlass.stand)}) abrufbar — {MASSGEBLICH_HALBSATZ}.
          </p>
          {/* ── B-1/B-2 (31.8.2026) · DAS BANNER BRACH Ä110 ────────────────────
              GEMESSEN: beide Links dieses Banners trugen den Pfeil VORNE und
              begannen klein («↗ amtliche (aufgehobene) Fassung») — drei Zeilen
              unter dem Kopf-Link, der seit Ä110 «Amtliche Fassung ↗» heisst.
              Die Aussage «derselbe Link auf die aufgehobene Konsolidierung»
              steht jetzt im Baustein (`variante`), nicht in einem zweiten,
              handgeschriebenen Wortlaut. Der Nachfolge-Erlass ist KEIN
              «amtliche Fassung»-Link und behält darum seinen eigenen Namen —
              aber dieselbe Anatomie (Pfeil hinten, gross beginnend). */}
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {erlass.aufgehoben.nachfolger && (
              <QuellLink
                href={`https://www.fedlex.admin.ch/eli/${erlass.aufgehoben.nachfolger.eli}/de`}
                className="underline hover:no-underline"
              >
                Nachfolge-Erlass: SR <span className="num">{erlass.aufgehoben.nachfolger.sr}</span> (in Kraft seit {datumCh(erlass.aufgehoben.seit)})
              </QuellLink>
            )}
            {erlass.quelleUrl && (
              <QuellLink href={erlass.quelleUrl} variante="aufgehoben" className="underline hover:no-underline" />
            )}
          </p>
        </div>
      )}
    </header>
  );
}
