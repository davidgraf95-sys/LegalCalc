import { Link } from 'react-router-dom';
import { erlassPfadVonKey } from '../../lib/normtext/erlassAdresse';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';

// ─── Direktzugriff-Chips auf die Kern-Bundescodes (Startseite V4, §3 #8a) ────
//
// Die Bund-Zeile des Gesetze-Blocks. Reine Darstellung (§3); die Keys
// referenzieren bestehende Einträge der Sammlung — geprüft gegen
// public/normtext/register.json (5.9.2026: alle zehn `status: snapshot`).
// V4 ergänzt VwVG und BGG (Verwaltungs- und Bundesgerichtsverfahren, die beiden
// Regimes, die der Fristenrechner daneben anbietet) und beziffert den Link auf
// die Vollsicht — die Zahl kommt aus dem generierten Zähler (kein
// Register-Import in den Startseiten-Chunk, §15).
//
// §8-SCOPE am Zähler: «im Volltext» bleibt am Wort, wie schon an der früheren
// Gesetze-Kachel (E6a·M5). `gesetzeBundVolltext` zählt nur `status: snapshot`,
// also echten Volltext — die Zahl darf nicht scope-los als «Erlasse» erscheinen.
const TOP_ERLASSE: { kuerzel: string; key: string }[] = [
  { kuerzel: 'OR', key: 'OR' },
  { kuerzel: 'ZGB', key: 'ZGB' },
  { kuerzel: 'BV', key: 'BV' },
  { kuerzel: 'StGB', key: 'STGB' },
  { kuerzel: 'ZPO', key: 'ZPO' },
  { kuerzel: 'StPO', key: 'STPO' },
  { kuerzel: 'SchKG', key: 'SCHKG' },
  { kuerzel: 'DBG', key: 'DBG' },
  { kuerzel: 'VwVG', key: 'VWVG' },
  { kuerzel: 'BGG', key: 'BGG' },
];

export function GesetzeChips() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span aria-hidden className="lc-overline mr-1">Bund</span>
      {TOP_ERLASSE.map((e) => (
        <Link key={e.key} to={erlassPfadVonKey(e.key)}
          className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
          {e.kuerzel}
        </Link>
      ))}
      <Link to="/gesetze?ebene=bund"
        className="lc-chip no-underline font-medium text-brass-700 hover:border-brass-400">
        {STARTSEITE_ZAEHLER.gesetzeBundVolltext.toLocaleString('de-CH')} Bundeserlasse im Volltext →
      </Link>
    </div>
  );
}
