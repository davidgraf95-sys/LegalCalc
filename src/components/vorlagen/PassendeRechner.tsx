import { Link, useLocation } from 'react-router-dom';
import { passendeRechner, karteIdFuerPfad } from './passendeRechnerDaten';

// V6 · Die Fläche zur Verdrahtung — Herleitung und Begründung stehen im
// Kopf von `passendeRechnerDaten.ts` (dort liegen auch die reinen Helfer;
// diese Datei darf nur Komponenten exportieren, react-refresh).

export function PassendeRechner() {
  const { pathname } = useLocation();
  const id = karteIdFuerPfad(pathname);
  const rechner = id ? passendeRechner(id) : [];
  if (rechner.length === 0) return null;
  return (
    <p className="text-body-s text-ink-600">
      <span className="font-medium text-ink-900">Zuerst rechnen:</span>{' '}
      {rechner.map((r, i) => (
        <span key={r.id}>
          {i > 0 && ' · '}
          <Link to={r.href} className="text-brass-700 hover:text-brass-600 no-underline">{r.title} →</Link>
        </span>
      ))}
    </p>
  );
}
