import { Link } from 'react-router-dom';
import { INTERNATIONAL_SAEULE } from '../../lib/navigation';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { StartZeile, StartFuss } from './Satzspiegel';

// ─── Systematische Ordnung des Bundesrechts (W2·24-R3) ──────────────────────
//
// Ersetzt die Chip-Wolke «Bund» (GesetzeChips) durch die ORDNUNG, nach der die
// Gesetzes-Übersicht gliedert: dieselben Kategorien, dieselben Anker
// (`/gesetze?ebene=bund#sys-<id>`), dieselben Titel — die eine Anzeige-Ordnung
// bleibt `lib/normtext/systematik.ts` (§5). Sie wird hier NICHT importiert:
// Ordnung, Titel, Beispiel-Kürzel und Zahl kommen buildseitig aus dem
// generierten Zähler (`gen:zaehler`, Drift-Tor `check:zaehler`) — so bleibt der
// Startseiten-Chunk ohne Register- und ohne Systematik-Import (§15,
// `check:perf-budget`).
//
// §8 · DIE ZAHLEN SIND GEMESSEN, NICHT ILLUSTRIERT. Das Referenzbild
// (`vorschlag-freigegeben.html`) trägt an dieser Stelle ausdrücklich
// Beispielwerte und sagt es in seiner Fussnote. Ausgeliefert wird so etwas nie:
// gezählt ist je Kategorie der ERFASSTE VOLLTEXT (status `snapshot`), ein
// gelisteter Erlass ohne Snapshot zählt nicht mit. Die Summe der Zeilen ergibt
// darum genau `gesetzeBundVolltext` — die Fusszeile sagt den Scope dazu.
// Reine Darstellung (§3).

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

function Zeile({ nr, titel, kuerzel, anzahl, ziel }: {
  nr?: string; titel: string; kuerzel: string[]; anzahl: number; ziel: string;
}) {
  return (
    <Link to={ziel}
      className="group grid grid-cols-[1.4rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 border-t border-rule-soft py-1.5 no-underline">
      <span aria-hidden className="num font-sans font-medium text-xs text-ink-500">{nr ?? ''}</span>
      <span className="font-serif text-ink-900 group-hover:text-reg-g group-hover:underline">
        {titel}
        <small className="mt-0.5 block font-sans text-xs leading-snug text-ink-500">{kuerzel.join(' · ')}</small>
      </span>
      <span className="num font-sans text-xs text-reg-g">{anzahl}</span>
    </Link>
  );
}

export function SystematikListe() {
  return (
    <StartZeile reg="g" ueber="Bundesrecht"
      rand={<>{nf(z.gesetzeBundVolltext)} Erlasse<br />im Volltext</>}
      titel="Systematische Ordnung">
      {/* Zwei Spalten erst, wenn beide Spalten eine Zeile tragen können — im
          schmalen Pane und auf dem Telefon bleibt es eine Liste. */}
      <div className="grid gap-x-9 sm:grid-cols-2">
        {z.bundSystematik.map((k) => (
          <Zeile key={k.id} nr={k.nr} titel={k.titel} kuerzel={k.kuerzel} anzahl={k.anzahl}
            ziel={`/gesetze?ebene=bund#sys-${k.id}`} />
        ))}
        {/* «International» ist seit IA-6 Stufe 2 eine eigene Säule, keine
            Systematik-Kategorie — sie führt darum die kanonische Ziel-Adresse
            (nie den Alt-Alias /international).
            ORDNUNGSZIFFER (Prüfbefund R3-F9, 6.9.2026): die Zeile stand als
            einzige ohne Zahl und riss die Zahlenspalte auf. Die Zahl ist «0»,
            EINSTELLIG und mit Bedacht: «01»…«05» sind LexMetriks eigene
            funktionale Ordnung (`lib/normtext/systematik.ts`), zu der das
            internationale Recht gerade nicht gehört — eine «06» würde dort eine
            Kategorie behaupten, die es nicht gibt (§5). «0» ist dagegen die
            AMTLICHE Gruppenziffer: die Systematische Rechtssammlung führt das
            internationale Recht als Gruppe 0 (SR 0.1 … 0.9,
            fedlex.admin.ch/de/cc, abgerufen 6.9.2026). Die eine Stelle weniger
            sagt zugleich, dass sie aus einer anderen Ordnung stammt. */}
        <Zeile nr="0" titel="Internationales Recht"
          kuerzel={z.internationalKuerzel} anzahl={z.gesetzeInternationalVolltext}
          ziel={INTERNATIONAL_SAEULE} />
      </div>
      <StartFuss>
        Die Ordnung ist die der Gesetzes-Übersicht. Die Zahl je Zeile ist der bei uns
        erfasste Volltext, nicht der Umfang der Systematischen Rechtssammlung des Bundes.
      </StartFuss>
    </StartZeile>
  );
}
