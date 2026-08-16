import { type ReactNode } from 'react';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { CurrencyEintrag, ErlassKopf } from '../../../lib/normtext/browse';
import type { ErlassTyp } from '../../../lib/normtext/register';
import { erfassungsgrad, STUFE_WORT } from '../../../lib/normtext/erfassungsgrad';
import type { KantonSystematik } from '../../../lib/normtext/systematik';
import type { GliederungsKennzahlen } from '../gliederungsModell';
import { formatiereDatum, kopfOverline, verifiziertesSachgebiet } from '../helpers';
import {
  teilerfassung, nurErlassdatum, erlassOrgan, istDatumsToken,
} from '../erlassUebersichtDaten';

// ═══ ABSCHNITT · Erlass-Übersicht (W2·19-GLIEDERUNG/S6, Bau-Spec §5.1) ════════
//
// Der SOCKEL der Zone C: «Was ist das für ein Erlass, wie aktuell ist er, woher
// kommt er?» — für alle 1469 Erlasse aus bereits geladenen Daten konstruierbar,
// ohne einen einzigen zusätzlichen Fetch. Reine Darstellung (§3): sie rechnet
// nichts, sie projiziert Register-, Sidecar- und Modell-Werte, die der Reader
// ohnehin hält.
//
// KEINE zweite `KontextPanel`-Wurzel und KEINE zweite `id="kontext-titel"`
// (a32 «genau EIN Panel» bleibt grün) — die Übersicht ist eine eigenständige
// `<section>` OBERHALB des Panels, mit eigener Überschrift.
//
// §15.2 CLS 0 — die tragende Bauentscheidung dieser Datei: JEDE Kurzform-Zeile
// steht ab dem ersten Render da und ist EINZEILIG (`truncate`). Ihre Höhe hängt
// damit nicht am Textinhalt; ein später eintreffender Wert (der Erlass-Kopf aus
// dem Struktur-Sidecar) füllt eine Zeile, die bereits die richtige Höhe hat,
// statt eine neue in den Fluss zu schieben. Der volle Wortlaut bleibt über
// `title` erreichbar — nie stiller Verlust (§8). Die einzige mehrzeilige Zeile
// (Konsolidierungs-Hinweis) trägt eine feste Zwei-Zeilen-Reservierung.
//
// Die Daten und reinen Ableitungen liegen daneben in `../erlassUebersichtDaten`
// — eine Komponenten-Datei, die zusätzlich Konstanten exportiert, bricht Fast
// Refresh (eslint `react-refresh/only-export-components`).

// ─── Bausteine ──────────────────────────────────────────────────────────────

/** Einzeilige Übersichts-Zeile: feste Höhe, voller Wortlaut im `title` (§15.2/§8). */
function Zeile({ label, title, children }: { label: string; title?: string; children: ReactNode }) {
  return (
    <p className="truncate text-micro leading-snug text-ink-600" title={title}>
      <span className="text-ink-500">{label} </span>{children}
    </p>
  );
}

const PUNKT = <span className="text-ink-300" aria-hidden> · </span>;

export function ErlassUebersicht({
  erlass, kopf, currency, erlassTyp, artikelAnzahl, bestimmungsWort = 'Artikel',
  bestimmungsEtikettStatus, gliederungsTiefe = 0, kennzahlen = null,
  kantonSys = {}, kantonErlassAnzahl = null, nichtKonsolidiert = false,
}: {
  erlass: BrowseErlass;
  /** Erlass-Kopf aus dem Struktur-Sidecar; `null` = noch nicht geladen / keiner (§8). */
  kopf: ErlassKopf | null;
  currency?: CurrencyEintrag;
  erlassTyp?: ErlassTyp;
  /** Gezählte Artikel des Snapshots — dieselbe Zahl wie im Erlass-Kopf (§5).
   *  W2·19-GLIEDERUNG/S9: `null` = KEIN Snapshot geladen (T11 nur-live-link/
   *  pdf-embed — dort gibt es keine `eintraege`, nicht «0 Artikel»). Die
   *  «Umfang»-Zeile entfällt dann ersatzlos statt eine falsche Null zu zeigen
   *  (§8: nichts behaupten, was wir nicht wissen). */
  artikelAnzahl: number | null;
  bestimmungsWort?: 'Artikel' | 'Paragraphen';
  /** K6: kantonale Etiketten sind teils Entwurf — bleibt sichtbar (§8). */
  bestimmungsEtikettStatus?: 'entwurf';
  /** `strukturTiefe()` — die amtliche Gliederungs-Verschachtelung. */
  gliederungsTiefe?: number;
  /** Kennzahlen des Gliederungs-Modells (S3) — EINE Quelle für «hat Anhang» (§5). */
  kennzahlen?: GliederungsKennzahlen | null;
  kantonSys?: Record<string, KantonSystematik>;
  /** In LexMetrik erfasste Erlass-Zahl DIESES Kantons (Browse-Manifest gezählt). */
  kantonErlassAnzahl?: number | null;
  /** Mindestens eine in Kraft getretene Änderung ist nicht in den Text konsolidiert. */
  nichtKonsolidiert?: boolean;
}) {
  const organ = erlassOrgan(kopf);
  const datum = kopf?.erlassdatum ? nurErlassdatum(kopf.erlassdatum) : null;
  const artZeile = [kopfOverline(erlass, erlassTyp, null), organ, datum].filter(Boolean) as string[];

  // B3 (Bug-Check 9.8.2026, live auf /gesetze/bund/BMV): bei einem GANZ
  // aufgehobenen Erlass stand «In Kraft getretene Änderung …» direkt neben dem
  // Aufhebungs-Banner — zwei Aussagen, die einander widersprechen. Bei einem
  // aufgehobenen Erlass IST die Aufhebung die Aussage; eine offene Konsolidierung
  // daneben ist bestenfalls irreführend (§8). Der Erlass-Kopf zog diese Grenze
  // schon, die Übersicht nicht — jetzt beide.
  const zeigeKonsWarnung = nichtKonsolidiert && !erlass.aufgehoben;

  const hatAnhang = (kennzahlen?.anhangArtikel ?? 0) > 0;
  const beleg = teilerfassung(erlass.key);
  const grad = erlass.kanton && kantonErlassAnzahl != null
    ? erfassungsgrad(erlass.kanton, kantonErlassAnzahl) : null;
  // B9 (Bug-Check 9.8.2026): der Brotkrümel baute die Sachgebiets-Auflösung neu
  // und zeigte dabei die neutralen PLATZHALTER der Systematik («Bereich SAR») —
  // also eine Aussage, wo wir keine haben (§8). Die Reader-Overline derselben
  // Seite filterte sie längst korrekt weg; die Regel lebt jetzt EINMAL in
  // `verifiziertesSachgebiet` (helpers) und wird hier wie dort konsumiert (§5).
  const gebiet = verifiziertesSachgebiet(erlass, kantonSys);
  const gebietPfad = gebiet ? [gebiet.top, gebiet.sub].filter(Boolean).join(' › ') : '';

  // §8-Block: alles, was die Anzeige über ihre eigenen Grenzen weiss. Leer =
  // nichts zu vermelden (dann entfällt der Block, statt «keine Einschränkungen»
  // zu behaupten — das wäre eine Aussage, die wir nicht belegen können).
  const ehrlichkeit: ReactNode[] = [];
  if (grad) {
    ehrlichkeit.push(
      <li key="erfassungsgrad">
        Kanton {grad.kanton}: {STUFE_WORT[grad.stufe]}, <span className="num">{grad.n}</span> Erlasse erfasst
      </li>,
    );
  }
  if (bestimmungsEtikettStatus === 'entwurf') {
    ehrlichkeit.push(
      <li key="etikett">Zähl-Etikett «{bestimmungsWort}» noch nicht amtlich verifiziert (Entwurf).</li>,
    );
  }
  if (kennzahlen && !kennzahlen.hatSidecar) {
    ehrlichkeit.push(
      <li key="sidecar">Für diesen Erlass ist keine amtliche Gliederung erfasst — die Leiste listet die Artikel.</li>,
    );
  }
  const hatMehr = ehrlichkeit.length > 0 || gebietPfad !== '' || !!erlass.inkraftSeit
    || (!!erlass.fassungsToken && !istDatumsToken(erlass.fassungsToken));

  return (
    <section data-erlass-uebersicht aria-labelledby="erlass-uebersicht-titel" className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h2 id="erlass-uebersicht-titel" className="lc-overline text-brass-700">Erlass-Übersicht</h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      {/* Konsolidierungs-Zeile. §15.2: sie steht IMMER und hat eine feste
          Zwei-Zeilen-Höhe (`min-h-uebersicht-hinweis` + `line-clamp-2`,
          index.css) — der Warn-Fall trifft damit auf eine Zeile, die bereits
          die richtige Höhe hat, und schiebt nichts in den Fluss. Ohne diese
          Reservierung wäre der Hinweis ein Lade-Shift: der Revisions-Sidecar
          kommt asynchron, und e2e/leser-kontext-e4 hält ihn bis NACH dem Start
          des CLS-Beobachters zurück. §8: im Normalfall sagt die Zeile die
          Wahrheit, die immer gilt, statt leer zu bleiben. */}
      <p className={`lc-uebersicht-hinweis text-micro leading-snug ${zeigeKonsWarnung ? 'text-warn-700' : 'text-ink-500'}`}>
        {zeigeKonsWarnung
          ? <><span aria-hidden>⚠ </span>In Kraft getretene Änderung noch nicht im gezeigten Text.</>
          : 'Massgeblich ist stets die amtliche Fassung.'}
      </p>

      {/* §8-Teilerfassung (Entscheid David 8.8.2026, Bau-Spec §11 Ziff. 2:
          «sofort ehrlicher §8-Hinweis in der Erlass-Übersicht»). Bewusst NICHT
          im «Mehr»-Block: ein Hinweis, für den man erst klicken muss, ist
          keiner. Der Beleg ist SYNCHRON aus dem Erlass-Key abgeleitet und steht
          darum ab dem ersten Paint — er kann keinen Lade-Shift erzeugen (§15.2),
          anders als alles, was auf einen Sidecar wartet. */}
      {beleg && (
        <p role="status" className="lc-notice-warn text-micro leading-snug">
          {beleg.befund} <span className="text-ink-500">(geprüft {formatiereDatum(beleg.geprueftAm)})</span>
        </p>
      )}

      <Zeile label="Art:" title={kopf?.erlassdatum ?? undefined}>
        {artZeile.map((t, i) => <span key={t}>{i > 0 && PUNKT}{t}</span>)}
      </Zeile>

      {/* B8 (Bug-Check 9.8.2026): zwei VD-Erlasse tragen `stand: ""` — die Zeile
          zeigte dann «Stand:» ohne Wert, also ein leeres Versprechen (§8). Der
          Erlass-Kopf guardet dasselbe Feld längst; hier fehlte es. */}
      <Zeile label="Stand:">
        {erlass.stand
          ? <span className="num">{formatiereDatum(erlass.stand)}</span>
          : <span className="text-ink-500">nicht erfasst</span>}
        {erlass.fassungsToken && istDatumsToken(erlass.fassungsToken) && (
          <>{PUNKT}Fassung <span className="num">{erlass.fassungsToken}</span></>
        )}
        {currency?.geprueftAm && !erlass.aufgehoben && (
          <>{PUNKT}geprüft <span className="num">{formatiereDatum(currency.geprueftAm)}</span></>
        )}
        {currency?.naechsteFassungAb && (
          <>{PUNKT}<span className="text-warn-700">nächste Fassung ab <span className="num">{formatiereDatum(currency.naechsteFassungAb)}</span></span></>
        )}
      </Zeile>

      {artikelAnzahl !== null && (
        <Zeile label="Umfang:">
          <span className="num">{artikelAnzahl}</span> {bestimmungsWort}
          {gliederungsTiefe > 0 && (
            <>{PUNKT}<span className="num">{gliederungsTiefe}</span> Gliederungsebene{gliederungsTiefe === 1 ? '' : 'n'}</>
          )}
          {hatAnhang && <>{PUNKT}Anhang</>}
        </Zeile>
      )}

      {/* Quelle: die breiteste Provenienz-Zeile (§7 b/c) — der Live-Link auf die
          geltende Fassung und, wo vorhanden, das amtliche PDF der gepinnten
          Fassung. Bei GANZ aufgehobenem Erlass entfällt der «geltende
          Fassung»-Link (er führte auf die aufgehobene Konsolidierung) — dieselbe
          §8-Regel wie im Erlass-Kopf. */}
      <p className="truncate text-micro leading-snug">
        <span className="text-ink-500">Quelle: </span>
        {erlass.quelleUrl && !erlass.aufgehoben && (
          <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">↗ geltende Fassung</a>
        )}
        {erlass.quelleUrl && erlass.aufgehoben && (
          <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">↗ amtliche (aufgehobene) Fassung</a>
        )}
        {erlass.pdfUrl && (
          <>{erlass.quelleUrl && PUNKT}
            <a href={erlass.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">↗ amtliches PDF</a>
          </>
        )}
        {!erlass.quelleUrl && !erlass.pdfUrl && <span className="text-ink-500">keine amtliche Quelle hinterlegt</span>}
      </p>

      {/* «Mehr»: Einordnung + der §8-Ehrlichkeitsblock. `<details>` statt eines
          React-Schalters — tastaturfest, ohne Zustand, und das Aufklappen ist
          eine Nutzer-Aktion (`hadRecentInput` ⇒ CLS-frei, §15.2). Entfällt
          ersatzlos, wenn es nichts Zusätzliches zu sagen gibt (§13/F4: kein
          totes Steuerelement). */}
      {hatMehr && (
        <details className="group">
          <summary className="cursor-pointer list-none text-micro text-ink-500 hover:text-brass-700 [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
            Mehr zu diesem Erlass
          </summary>
          <ul className="mt-1.5 flex flex-col gap-1 border-l border-line pl-3 text-micro leading-snug text-ink-600">
            {gebietPfad && <li>Sachgebiet: {gebietPfad}</li>}
            {erlass.inkraftSeit && (
              <li>In Kraft seit <span className="num">{formatiereDatum(erlass.inkraftSeit)}</span></li>
            )}
            {erlass.fassungsToken && !istDatumsToken(erlass.fassungsToken) && (
              <li className="truncate" title={erlass.fassungsToken}>
                Fassungs-Kennung: <span className="num">{erlass.fassungsToken}</span>
              </li>
            )}
            {ehrlichkeit}
          </ul>
        </details>
      )}
    </section>
  );
}
