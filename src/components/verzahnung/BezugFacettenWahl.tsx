// ─── B4: Facetten-STEUERUNG der Bezüge — eigenständig und umziehbar ─────────
//
// W2·7-BEZUG/B4. Die Bedien-Oberfläche der Bezugs-Facetten: Instanz-Klassen und
// (innerhalb der kantonalen Klasse) Kantone.
//
// ── WARUM DAS EINE EIGENE DATEI IST UND KEIN TEIL DES «ANSICHT ▾» ───────────
// Präzisierung David 28.7.2026: B5 baut ein EIGENES Header-Dropdown für die
// Ansichtsauswahl (Facetten + Zeitstrahl + Von-Bis-Datum); die Entscheide selbst
// bleiben unter den Artikeln. Damit dieser Umzug später NUR ein Verschieben des
// Mount-Punkts ist und kein Umbau, ist diese Komponente:
//   · VOLLSTÄNDIG GESTEUERT — sie liest keinen Store und schreibt in keinen; sie
//     bekommt den Zustand als Props und meldet Änderungen über `onKlassen`/
//     `onKantone`. Wer sie mountet, entscheidet, woher der Zustand kommt.
//   · OHNE KENNTNIS IHRER UMGEBUNG — kein Bezug auf Kopfzeile, Menü, Panel oder
//     Reader. Sie rendert einen Streifen und sonst nichts.
// Heute mountet sie `LeserAnsichtMenu` (die vorhandene Persistenz- und
// Pre-Paint-Mechanik liegt dort). B5 mountet dieselbe Datei im Header.
//
// STRIKT GETRENNT von der ANZEIGE-Schicht: die Kantenliste am Artikelfuss
// (`gesetz-leser/parts/BezuegeZeile.tsx`) weiss nichts von dieser Steuerung und
// umgekehrt. Sie berühren sich nur über den Zustand, den der Mount-Punkt hält.
//
// A11y wie die übrigen Streifen im Ansicht-Menü: `role="group"` +
// `aria-pressed`, KEIN `role=radiogroup`/`menu` — die versprächen eine
// Pfeiltasten-Bedienung, die es nicht gibt (Ehrlichkeits-Lehre des Dropdowns).

import { BEDIENBARE_KLASSEN, KLASSE_SCHALTER, istErweitert, schalteKlasse, schalteKanton } from '../../pages/gesetz-leser/bezugAuswahl';
import { STATUS_LABEL, type BezugStatus } from '../../lib/verzahnung/facetten';

/** Gemeinsame Schalter-Optik der Streifen (identisch zu ZeitraumWahl/HistAnsichtWahl). */
const KNOPF = 'rounded px-1.5 py-0.5 text-xs transition-colors';
const AKTIV = 'bg-brass-100/60 font-medium text-ink-900';
const RUHIG = 'text-ink-500 hover:bg-brass-100/40';

export function BezugFacettenWahl({ klassen, kantone, kantoneVerfuegbar, onKlassen, onKantone }: {
  /** Gewählte Instanz-Klassen (leer = nichts gewählt, siehe bezugAuswahl.ts). */
  klassen: readonly BezugStatus[];
  /** Gewählte Kantone; leer = keine Einschränkung. */
  kantone: readonly string[];
  /** Kantone, zu denen der GELADENE Erlass wirklich Kanten hat. Aus den Daten,
   *  nicht aus einer Kantonstabelle: ein Schalter für einen Kanton ohne Kante
   *  fände garantiert nichts (§13 F4) und behauptete, dort gäbe es Praxis, die
   *  wir bloss ausblenden (§8). Leer ⇒ kein Kanton-Streifen. */
  kantoneVerfuegbar: readonly string[];
  onKlassen: (neu: BezugStatus[]) => void;
  onKantone: (neu: string[]) => void;
}) {
  const erweitert = istErweitert(klassen);
  const alleKantone = kantone.length === 0;

  return (
    <>
      <div role="group" aria-label="Instanzen der Bezüge" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
        <span className="lc-overline mr-1">Instanzen</span>
        {BEDIENBARE_KLASSEN.map((k) => {
          const aktiv = klassen.includes(k);
          return (
            <button key={k} type="button" aria-pressed={aktiv} aria-label={STATUS_LABEL[k]}
              data-bezug-klasse={k} title={STATUS_LABEL[k]}
              onClick={() => onKlassen(schalteKlasse(klassen, k))}
              className={`${KNOPF} ${aktiv ? AKTIV : RUHIG}`}>
              {KLASSE_SCHALTER[k]}
            </button>
          );
        })}
      </div>

      {/* Kantons-Feinschnitt nur, wenn die kantonale Klasse überhaupt AN ist —
          sonst wirkungslos (§13 F4, gleiches Muster wie ZeitraumWahl). */}
      {klassen.includes('kantonal') && kantoneVerfuegbar.length > 0 && (
        <div role="group" aria-label="Kantone der kantonalen Entscheide" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
          <span className="lc-overline mr-1">Kantone</span>
          <button type="button" aria-pressed={alleKantone} onClick={() => onKantone([])}
            title="Kantonale Entscheide aus allen erfassten Kantonen zeigen"
            className={`${KNOPF} ${alleKantone ? AKTIV : RUHIG}`}>
            alle
          </button>
          {kantoneVerfuegbar.map((k) => {
            const aktiv = kantone.includes(k);
            return (
              <button key={k} type="button" aria-pressed={aktiv} data-bezug-kanton={k}
                title={`Nur kantonale Entscheide aus ${k} zeigen`}
                onClick={() => onKantone(schalteKanton(kantone, k))}
                className={`num ${KNOPF} ${aktiv ? AKTIV : RUHIG}`}>
                {k}
              </button>
            );
          })}
        </div>
      )}

      {/* §8: was der Grundzustand kostet und was das Zuschalten bedeutet, steht
          da — nicht als Kleingedrucktes anderswo. */}
      <p className="px-2.5 pb-1 pt-1 text-micro leading-snug text-ink-500">
        {erweitert
          ? 'Zugeschaltete Instanzen stehen am Artikel als eigene, benannte Gruppe — nie unter die Leitentscheide gemischt. Die Zahl nennt die gezeigten und die insgesamt erfassten Entscheide.'
          : 'Grundeinstellung: nur amtlich publizierte Leitentscheide. Weitere Instanzen laden zusätzliche Daten nach.'}
      </p>
    </>
  );
}
