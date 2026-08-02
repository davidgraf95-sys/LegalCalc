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
import type { BezugsBilanz, KlassenZahlen } from '../../lib/rechtsprechung/bezuege';
import { ZeichenLegende } from './ZeichenLegende';

/** Gemeinsame Schalter-Optik der Streifen (identisch zu ZeitraumWahl/HistAnsichtWahl). */
const KNOPF = 'rounded px-1.5 py-0.5 text-xs transition-colors';
const AKTIV = 'bg-brass-100/60 font-medium text-ink-900';
const RUHIG = 'text-ink-500 hover:bg-brass-100/40';
/** Klasse ohne eine einzige Kante in DIESEM Erlass — bedienbar, aber sichtbar leer. */
const LEER = 'text-ink-400 opacity-60 hover:bg-brass-100/30';

/**
 * Der Titel eines Instanz-Schalters — die ganze Auskunft in einem Satz (B7/c, §8).
 *
 * ── DER BEFUND, DEN DAS BEHEBT ─────────────────────────────────────────────
 * David 28.7.2026 zum Schalter «Eidg.»: «das scheint keine funktion zu haben?»
 * Diagnose (reproduziert, siehe `klassenImShard` in bezuege.ts): das Prädikat
 * ist korrekt verdrahtet — die Klasse hat an fast jedem Artikel schlicht keine
 * Fundstelle. Korpusweit 164 von 75'365, an 93 von 6'217 Artikeln, in 18 von 311
 * Erlassen; an Art. 41 OR null. Es war also KEIN Bug, sondern eine
 * Bestandslage, die die Bedienfläche verschwiegen hat.
 *
 * ── ZWEI ZAHLEN, ZWEI WÖRTER (Gegenprüfung Runde 1/I1) ─────────────────────
 * Der Schalter zeigt die ENTSCHEIDE (verschiedene Dokumente), weil das die Zahl
 * ist, die man liest, wenn «Entscheide» dasteht. Die FUNDSTELLEN (Kanten) sind
 * fast immer mehr — ein BGE kann zwanzig Artikel desselben Erlasses auslegen —
 * und stehen im Titel daneben. Beides mit seinem eigenen Wort zu benennen ist
 * die Alternative dazu, eine der beiden Zahlen falsch zu beschriften: die erste
 * Fassung zeigte 10'559 «Entscheide» am BGG-bge-Schalter, während der ganze
 * Korpus 1'259 BGE führt (§8).
 *
 * NICHT DEAKTIVIERT, nur gedämpft: ein `disabled`-Schalter liesse sich nicht
 * mehr fokussieren, verschwände für Screenreader-Nutzer aus der Bedienreihe und
 * machte die 0 damit unlesbar. Wer eine leere Klasse zuschaltet, sieht am
 * Artikel dasselbe wie vorher — das ist kein Schaden, sondern die Bestätigung
 * der Auskunft.
 */
function schalterTitel(k: BezugStatus, z: KlassenZahlen | undefined, bilanz: BezugsBilanz | null): string {
  const name = STATUS_LABEL[k];
  if (!z) return name;
  if (z.dokumente > 0) {
    return `${name} — ${z.dokumente} Entscheid(e) in diesem Erlass, `
      + `${z.kanten} Fundstelle(n) an seinen Artikeln`;
  }
  const korpus = bilanz?.kantenJeStatus[k];
  const artikel = bilanz?.artikelJeStatus[k];
  if (korpus === undefined) return `${name} — keine Entscheide dieser Instanz in diesem Erlass`;
  return `${name} — keine in diesem Erlass. Korpusweit ${korpus} Fundstelle(n) an ${artikel ?? 0} von `
    + `${bilanz?.artikelGesamt ?? 0} Artikeln: diese Instanz trägt selten.`;
}

export function BezugFacettenWahl({ klassen, kantone, kantoneVerfuegbar, klassenImErlass, bilanz = null, onKlassen, onKantone }: {
  /** Gewählte Instanz-Klassen (leer = nichts gewählt, siehe bezugAuswahl.ts). */
  klassen: readonly BezugStatus[];
  /** Gewählte Kantone; leer = keine Einschränkung. */
  kantone: readonly string[];
  /** Kantone, zu denen der GELADENE Erlass wirklich Kanten hat. Aus den Daten,
   *  nicht aus einer Kantonstabelle: ein Schalter für einen Kanton ohne Kante
   *  fände garantiert nichts (§13 F4) und behauptete, dort gäbe es Praxis, die
   *  wir bloss ausblenden (§8). Leer ⇒ kein Kanton-Streifen. */
  kantoneVerfuegbar: readonly string[];
  /** B7/c: Entscheide UND Fundstellen je Klasse in DIESEM Erlass. Leeres Objekt
   *  = Shard noch nicht geladen ⇒ es steht gar keine Zahl da, statt einer
   *  erfundenen 0. */
  klassenImErlass?: Partial<Record<BezugStatus, KlassenZahlen>>;
  /** B7/c: korpusweite Bilanz für die Erklärung leerer Klassen. Optional —
   *  fehlt sie, entfällt nur der Zusatzsatz, nie die Zahl des Erlasses. */
  bilanz?: BezugsBilanz | null;
  onKlassen: (neu: BezugStatus[]) => void;
  onKantone: (neu: string[]) => void;
}) {
  const erweitert = istErweitert(klassen);
  const alleKantone = kantone.length === 0;
  // Solange kein Shard geladen ist, ist das Objekt leer und JEDE Klasse
  // `undefined` — dann steht keine Zahl da. Eine 0 zu zeigen, weil man noch
  // nichts weiss, wäre eine Behauptung über den Bestand (§8).
  const gezaehlt = klassenImErlass && Object.keys(klassenImErlass).length > 0;

  return (
    <>
      <div role="group" aria-label="Instanzen der Bezüge" className="flex flex-wrap items-center gap-1 px-2.5 pt-1.5 pb-0.5">
        <span className="lc-overline mr-1">Instanzen</span>
        {BEDIENBARE_KLASSEN.map((k) => {
          const aktiv = klassen.includes(k);
          const z = gezaehlt ? (klassenImErlass?.[k] ?? { dokumente: 0, kanten: 0 }) : undefined;
          const n = z?.dokumente;
          const titel = schalterTitel(k, z, bilanz);
          return (
            <button key={k} type="button" aria-pressed={aktiv} aria-label={titel}
              data-bezug-klasse={k} data-bezug-klasse-zahl={n} title={titel}
              onClick={() => onKlassen(schalteKlasse(klassen, k))}
              className={`${KNOPF} ${aktiv ? AKTIV : n === 0 ? LEER : RUHIG}`}>
              {KLASSE_SCHALTER[k]}
              {n !== undefined && (
                <span className="num tabular-nums ml-1 text-micro font-normal text-ink-500">{n}</span>
              )}
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
          ? 'Jede zugeschaltete Instanz steht am Artikel als eigene Linie — nie unter die Leitentscheide gemischt, chronologisch vom neusten zum ältesten; gezeigt werden fünf, ein Klick lädt die nächsten fünf. Die Zahl am Schalter nennt die verschiedenen Entscheide dieser Instanz im ganzen Erlass; ein Entscheid kann an mehreren Artikeln stehen.'
          : 'Grundeinstellung: nur amtlich publizierte Leitentscheide. Weitere Instanzen laden zusätzliche Daten nach; die Zahl am Schalter sagt vorher, wie viele verschiedene Entscheide dieser Erlass davon führt.'}
      </p>

      {/* LM-050-Nachzug (W2·17-UI-BEFUNDE-B1, David-Entscheid 2.8.2026 «mach es
          still»): die Zeichenerklärung für ★/↻/⧉ stand bis hierher JE
          Bezüge-Linie am Artikel — auf /gesetze/bund/OR dadurch ~376×. Sie
          erklärt Chips, die es nur zu sehen gibt, wenn hier eine Instanz
          zugeschaltet ist — darum EIN Ort statt vieler: am Ende genau der
          Steuerung, die diese Chips überhaupt erst zuschaltet. Die Komponente
          selbst bleibt unverändert (Toggletip-Muster, Begründung dort); nur
          der Mount-Punkt hat sich verschoben. */}
      <div className="px-2.5 pb-1">
        <ZeichenLegende />
      </div>
    </>
  );
}
