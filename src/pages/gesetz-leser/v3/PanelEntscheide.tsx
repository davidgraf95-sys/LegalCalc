import { Link } from 'react-router-dom';
import { BezugFacettenWahl } from '../../../components/verzahnung/BezugFacettenWahl';
import { BezugZeitWahl } from '../../../components/verzahnung/BezugZeitWahl';
import { datumAnzeige } from '../../../components/rechtsprechung/format';
import { STATUS_LABEL, type BezugStatus } from '../../../lib/verzahnung/facetten';
import type { Bezug, KlassenZahlen } from '../../../lib/rechtsprechung/bezuege';
import { KLASSE_KURZ } from '../bezugAuswahl';
import type { Histogramm, Zeitbereich } from '../bezugZeit';
import { gruppiereKanten } from './panelModell';
import { PanelSachgebiet } from './PanelSachgebiet';

// ─── Reiter «Entscheide» (FAHRPLAN-LESER-V3 Kap. 4d, H3) ─────────────────────
//
// WAS HIER AN DIE STELLE VON WAS TRITT: bis H2 stand unter JEDEM Artikel eine
// `BezuegeZeile` — je Instanz eine waagrecht scrollbare Chip-Linie (277 Z.,
// Pos. 12: «verlässt den Lesekörper»). In V3 steht der Lesetext allein, und die
// Entscheide stehen hier: an EINEM Ort, mit ihren Filtern daneben, als LISTE
// statt als Scroll-Linie.
//
// ── NACHWEISDATENBANK, NICHT VOLLTEXTSAMMLUNG (Leitsatz H3, Kap. 14) ────────
// Vorbild dejure.org (David 16.8.2026): die Zeile nennt Instanz · Datum ·
// Zitierung · Regeste-Kurzzeile und VERLINKT auf den Entscheid; sie hält keinen
// Volltext vor. Das ist für ein kleines Projekt der einzig tragfähige Weg und
// lizenzrechtlich der saubere (Blocker `§4-lizenz`).
//
// ── WARUM EINE LISTE UND KEINE CHIP-LINIE ───────────────────────────────────
// Die Linie war die richtige Form für einen Artikelfuss: sie durfte den Text
// nicht nach unten schieben, also wuchs sie nach rechts. Im Panel ist die
// senkrechte Achse frei — dort ist eine Liste ohne verstecktes Scrollen die
// ehrlichere Form (Design-Grundlage Kap. 8: «Hover/Scroll verbirgt nie
// Funktion»). Die Regeste-Kurzzeile, die in der Linie nur als Tooltip lebte,
// steht hier sichtbar.
//
// ── GRUPPIERT NACH INSTANZ, WIE AM ARTIKELFUSS ──────────────────────────────
// `facetten.ts`: «Wer die drei in EINE Liste kippt und nur nach Datum sortiert,
// behauptet stillschweigend Gleichrang.» Die Gruppierung ist darum dieselbe
// (`gruppiereKanten`, `STATUS_RANG`) — sie ist eine fachliche Aussage über
// Rangordnung, keine Layout-Vorliebe (§1).
//
// ── DIE FILTER STEHEN, WO IHR ERGEBNIS STEHT (Kap. 4d) ──────────────────────
// `BezugFacettenWahl` und `BezugZeitWahl` sind UNVERÄNDERT dieselben
// vollständig gesteuerten Komponenten, die in der Ist-Hülle im Dropdown
// «Rechtsprechung ▾» hängen. H3 verschiebt ihren MOUNT-PUNKT — genau das, was
// ihr Dateikopf seit B4 verspricht («B5 mountet dieselbe Datei im Header»). Kein
// Umbau, keine Kopie, ein Zustand (§5).

/** Eine Fundstelle: Zitierung · Datum · Regeste-Kurzzeile, verlinkt auf den
 *  Entscheid. `?norm=` trägt die Fundstellen-Absicht — das Ziel springt zur
 *  ersten Erwägung, die diese Norm zitiert (dieselbe Zusage wie am Artikelfuss). */
function Fundstelle({ b, normZitat }: { b: Bezug; normZitat: string }) {
  return (
    <li data-v3-panel-entscheid={b.key} className="border-t border-line/60 py-1.5 first:border-t-0">
      <Link to={`/rechtsprechung/${encodeURIComponent(b.key)}?norm=${encodeURIComponent(normZitat)}`}
        className="group block no-underline">
        <span className="flex items-baseline gap-2">
          <span className="num shrink-0 text-body-s font-medium text-brass-700 group-hover:underline">{b.zitierung}</span>
          <span className="num shrink-0 text-micro text-ink-500">{datumAnzeige(b.datum)}</span>
          {/* ★ nur beim Leitentscheid, und nur als EIN Zusatz (Dichte-Regel) */}
          {b.facetten.status === 'bge' && (
            <span aria-hidden title="Amtlich publizierter Leitentscheid" className="shrink-0 text-micro text-brass-700">★</span>
          )}
        </span>
        {b.regesteKurz && (
          <span className="mt-0.5 block text-micro leading-snug text-ink-600">{b.regesteKurz}</span>
        )}
      </Link>
    </li>
  );
}

export function PanelEntscheide({
  kanten, normZitat, artikelLabel, geladen, klassen, kantone, kantoneVerfuegbar, klassenImErlass,
  histogramm, bereich, onKlassen, onKantone, onBereich,
}: {
  /** Kanten des GELESENEN Artikels nach Facetten-Filter; `undefined` = keine. */
  kanten?: readonly Bezug[];
  normZitat: string;
  artikelLabel: string | null;
  /** Ist ein Shard ausgewertet? Trennt «lädt noch» von «nichts erfasst» (§8). */
  geladen: boolean;
  klassen: readonly BezugStatus[];
  kantone: readonly string[];
  kantoneVerfuegbar: readonly string[];
  klassenImErlass: Partial<Record<BezugStatus, KlassenZahlen>>;
  histogramm: Histogramm;
  bereich: Zeitbereich;
  onKlassen: (neu: BezugStatus[]) => void;
  onKantone: (neu: string[]) => void;
  onBereich: (von: string, bis: string) => void;
}) {
  const gruppen = gruppiereKanten(kanten ?? []);

  return (
    <div data-v3-panel-reiter-inhalt="entscheide">
      {/* ── Filterzeile: Instanz · Kanton · Zeit · (Sachgebiet) ──────────────── */}
      <div data-v3-panel-filter className="border-b border-line pb-1.5">
        <BezugFacettenWahl klassen={klassen} kantone={kantone} kantoneVerfuegbar={kantoneVerfuegbar}
          klassenImErlass={klassenImErlass} onKlassen={onKlassen} onKantone={onKantone} />
        <BezugZeitWahl bereich={bereich} histogramm={histogramm} onBereich={onBereich} />
        {/* Vierter Filter — heute ohne Daten und darum ohne Element (Kap. 14).
            Die Datenlogik bleibt `W2·7-VZUI-SACHGEBIET` (Risikopfad). */}
        <PanelSachgebiet gebiete={[]} gewaehlt={[]} onGebiete={() => {}} />
      </div>

      {/* ── Fundstellen des gelesenen Artikels ────────────────────────────────
          §8, DREI ZUSTÄNDE, DREI SÄTZE — nie derselbe für zwei Lagen:
           · Facetten alle aus  → «Keine Instanz eingeschaltet» (Bedien-Zustand)
           · lädt              → «wird geladen» (Wissens-Zustand)
           · geladen und leer  → «keine erfasst» (Bestands-Zustand)
          Ein gemeinsames «keine Entscheide» hätte den Bedien- und den
          Bestands-Zustand vermischt: der Nutzer läse eine Aussage über den
          Korpus, wo eine über seinen eigenen Schalter stünde. */}
      {klassen.length === 0 ? (
        <p className="px-2.5 py-3 text-body-s text-ink-500">
          Keine Instanz eingeschaltet — oben zuschalten, dann erscheinen die Entscheide zu diesem Artikel.
        </p>
      ) : !geladen ? (
        <p className="px-2.5 py-3 text-body-s text-ink-500">Entscheide werden geladen …</p>
      ) : gruppen.length === 0 ? (
        <p className="px-2.5 py-3 text-body-s text-ink-500">
          {artikelLabel
            ? `Zu ${artikelLabel} ist kein Entscheid der eingeschalteten Instanzen erfasst.`
            : 'Zu diesem Erlass ist kein Entscheid der eingeschalteten Instanzen erfasst.'}
        </p>
      ) : (
        <div className="px-2.5 py-1">
          {gruppen.map(([status, liste]) => (
            <section key={status} data-v3-panel-gruppe={status} className="pt-2 first:pt-1">
              <p className="lc-overline" title={`${STATUS_LABEL[status]} — ${liste.length} Fundstelle(n) an ${artikelLabel ?? 'diesem Artikel'}`}>
                {KLASSE_KURZ[status]}
                <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">{liste.length}</span>
              </p>
              {/* KEINE Portionierung, kein «weitere 5»: die Liste im Panel darf
                  senkrecht wachsen, das Panel scrollt ohnehin. Die Kappung am
                  Artikelfuss war eine Folge der festen Zeilenhöhe (CLS), nicht
                  eine Aussage über die Daten — sie mitzuschleppen hiesse, eine
                  Einschränkung ohne ihren Grund zu übernehmen. */}
              <ul className="mt-0.5">
                {liste.map((b) => <Fundstelle key={b.key} b={b} normZitat={normZitat} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
