import { type ReactNode } from 'react';
import type { CurrencyEintrag } from '../../../lib/normtext/browse';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import {
  datumCh, naechsteFassungSatz, nichtKonsolidiertSatz, standausweisSatz, zaehlWort,
} from '../../../lib/normtext/erlassKopfText';

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
  aktionen, hinweis, currency, nichtKonsolidiert = false,
}: {
  erlass: BrowseErlass;
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
   *  Auflösungsgrade).
   *
   *  S3 hat den Typ von `boolean` auf `boolean | string` GEWEITET, weil F5 einen
   *  Zeitbezug verlangt («eine seit 01.07.2025 geltende Änderung»): der String
   *  ist das ISO-Datum des FRÜHESTEN nicht konsolidierten Inkrafttretens, `true`
   *  heisst «Tatsache belegt, Datum nicht bekannt» (dann nennt der Satz keines,
   *  statt eines zu erfinden — §8). Die Weitung statt einer zweiten Prop hält den
   *  Datenpfad frei von Durchreich-Änderungen in fremder Bauhand (V3-Hülle).
   *  Default `false` = keine Aussage, kein Banner (§8). */
  nichtKonsolidiert?: boolean | string;
}) {
  // Fedlex hängt das Kürzel als Klammer-Suffix an den Volltitel («… (Strafpro-
  // zessordnung, StPO)»). Bis S3 stand hier «StPO — Schweizerische Strafprozess-
  // ordnung» in ZWEI Farben; Skizze 4e dreht das auf die gewohnte Zitierform
  // «Volltitel (Kürzel)» in EINER Farbe — zweifarbige Titel lasen sich wie zwei
  // Angaben, obwohl es eine ist (Ä6).
  const titelOhneSuffix = erlass.titel.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const kuerzel = erlass.kuerzel.trim();
  const titelRedundant = titelOhneSuffix.toLowerCase() === kuerzel.toLowerCase();
  const titelZeile = !kuerzel || titelRedundant
    ? (titelOhneSuffix || kuerzel)
    : `${titelOhneSuffix} (${kuerzel})`;

  const wort = zaehlWort(bestimmungsWort, kennzahlen);
  // §8: bei GANZ aufgehobenem Erlass ist die Aufhebung DIE Aussage — weder ein
  // Standausweis noch eine Konsolidierungs-Warnung daneben (beide wären
  // irreführend), und kein «geltende Fassung»-Link (er führte auf die
  // aufgehobene Konsolidierung; der amtliche Link liegt ehrlich beschriftet im
  // Aufhebungs-Banner unten).
  const lebt = !erlass.aufgehoben;
  const warnung = lebt && nichtKonsolidiert
    ? nichtKonsolidiertSatz(typeof nichtKonsolidiert === 'string' ? nichtKonsolidiert : null)
    : null;

  // Fakten- und Stand-Segmente werden als Liste gebaut und mit einem Mittepunkt
  // gefügt — so kann kein führender/doppelter Trenner entstehen, wenn ein Wert
  // fehlt (Kanton ohne SR, VD-Erlasse mit leerem `stand`, pdf-embed ohne Zählung).
  const fakten = [
    erlass.sr ? <>SR <span className="num">{erlass.sr}</span></> : null,
    artikelAnzahl != null ? <><span className="num">{artikelAnzahl}</span> {wort}</> : null,
  ].filter(Boolean) as ReactNode[];

  const stand = [
    erlass.stand ? <>Stand <span className="num">{datumCh(erlass.stand)}</span></> : null,
    // K-1: Ur-Inkrafttreten (Fedlex `dateEntryInForce`, build-time projiziert ⇒
    // CLS 0). Distinkt vom «Stand» (Konsolidierung) — nur Bund; Kanton trägt es
    // nicht (§8). «vom …» wird NICHT gedoppelt (steht im Ingress).
    erlass.inkraftSeit ? <>in Kraft seit <span className="num">{datumCh(erlass.inkraftSeit)}</span></> : null,
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
      <h1 className="font-serif text-h2 sm:text-h1 font-semibold text-ink-900 [overflow-wrap:anywhere] hyphens-auto min-h-titel-2z">
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
          Die Höhe ist gemessen kalibriert (Token `min-h-kopf-stand`,
          tailwind.config.js), nicht geschätzt; unterhalb `sm` braucht es mehr
          Zeilen, weil dieselben Sätze schmaler umbrechen. */}
      <div className="min-h-kopf-stand sm:min-h-kopf-stand-sm space-y-1">
        {stand.length > 0 && (
          <p className="text-xs leading-snug text-ink-500">
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
      <div className="lc-kopf-aktionen flex flex-wrap items-center gap-x-5 gap-y-0.5 text-xs">
        {erlass.quelleUrl && lebt && (
          <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip">↗ geltende Fassung</a>
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
            (Stand {datumCh(erlass.stand)}) abrufbar — massgeblich ist die amtliche Quelle.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {erlass.aufgehoben.nachfolger && (
              <a
                href={`https://www.fedlex.admin.ch/eli/${erlass.aufgehoben.nachfolger.eli}/de`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                ↗ Nachfolge-Erlass: SR <span className="num">{erlass.aufgehoben.nachfolger.sr}</span> (in Kraft seit {datumCh(erlass.aufgehoben.seit)})
              </a>
            )}
            {erlass.quelleUrl && (
              <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                ↗ amtliche (aufgehobene) Fassung
              </a>
            )}
          </p>
        </div>
      )}
    </header>
  );
}
