import { Link } from 'react-router-dom';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { usePaneKlasse } from '../layout/PaneKontext';
import { StartZeile, StartFuss } from './Satzspiegel';

// ─── Amtliche Materialien nach Behörde (W2·24-R3) ───────────────────────────
//
// Ersetzt die Materialien-Kachel der Landkarte. Herausgeber-Ordnung und
// Sprungziele bleiben der Materialien-Übersicht überlassen (`BEHOERDEN` mit
// `rang`, Anker `/materialien#b-<id>`) — sie stehen hier nicht ein zweites Mal,
// sondern kommen buildseitig aus dem Zähler-Generat (§5/§15).
//
// §8 · WORTLAUT: «erfasst», nie «im Volltext» — alle Materialien sind
// bibliografische Verweise mit Live-Link auf die amtliche Fassung
// (nur-live-link, E6a·M5). Behörden ohne Eintrag erscheinen gar nicht; eine
// 0-Zeile würde einen Bestand behaupten, den es nicht gibt.
// Reine Darstellung (§3).

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

export function MaterialienListe() {
  const pk = usePaneKlasse();
  return (
    <StartZeile reg="m" ueber="Behörden"
      rand={<>{nf(z.materialien)} amtliche<br />Materialien erfasst</>}
      titel="Amtliche Materialien nach Behörde">
      <div className={`grid gap-x-6 font-sans text-body-s ${pk(
        'sm:grid-cols-2 lg:grid-cols-3', '@lg/pane:grid-cols-2 @3xl/pane:grid-cols-3',
      )}`}>
        {z.materialienBehoerden.map((b) => (
          <Link key={b.id} to={`/materialien#b-${b.id}`} title={b.name}
            className="flex items-baseline justify-between gap-2 border-t border-rule-soft py-1 no-underline hover:text-reg-m">
            <span>{b.kuerzel}</span>
            <span aria-hidden className="num text-ink-500">{b.anzahl}</span>
            <span className="sr-only">{b.name}, {nf(b.anzahl)} erfasst</span>
          </Link>
        ))}
        <Link to="/materialien"
          className="flex items-baseline justify-between gap-2 border-t border-rule-soft py-1 no-underline hover:text-reg-m">
          Alle Behörden <span aria-hidden className="text-ink-500">→</span>
        </Link>
      </div>
      <StartFuss>
        Bibliografische Verweise mit Link zur amtlichen Fassung — massgeblich bleibt die
        Quelle. Fachlich abgenommen ist der Bestand noch nicht.
      </StartFuss>
    </StartZeile>
  );
}
