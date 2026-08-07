import { Link, useLocation } from 'react-router-dom';
import { ALLE_KARTEN, karte } from '../../lib/startseiteConfig';
import { istAktiv } from '../../lib/startseiteConfigTypen';

// ─── V6 · Vorlage → Rechner: die Gegenrichtung sichtbar machen ───────────────
//
// Vom Rechner führt seit der Konsolidierung ein sichtbarer Weg zur Vorlage
// (ThemenEinstieg unter der Werkzeug-Karte). Die GEGENRICHTUNG war nur Daten:
// `related` (startseiteConfigTypen) ist seit jeher modusübergreifend gepflegt —
// aber KEINE Fläche hat es je gerendert (Messung 7.8.2026: null Konsumenten
// ausser Tests und der Inventur). Wer im Verjährungsverzicht steht, sah den
// Verjährungsrechner nicht, obwohl die Kante längst deklariert war.
//
// Diese Zeile schliesst genau das — und zwar OHNE zweites Registry-Feld: die
// V6-Spec nennt ein neues `passendeRechner`, doch `related` trägt die Kante
// bereits. Ein zweites Feld wäre Doppelpflege derselben Aussage (§5); gebaut
// ist deshalb die Projektion «related ∩ modus=rechner», nicht eine neue Quelle.
//
// Reine Darstellung (§3): keine Rechtslogik, kein Normtext, keine Reihenfolge-
// Heuristik — die Reihenfolge ist die deklarierte Reihenfolge der Registry.
// §8: nur AKTIVE Karten mit href erscheinen; auf «In Vorbereitung» wird nicht
// verlinkt (ein toter Weg ist schlechter als kein Weg).

/** Rechner-Kanten einer Karte, in Registry-Reihenfolge. Reine Projektion. */
export function passendeRechner(karteId: string): { id: string; title: string; href: string }[] {
  const k = karte(karteId);
  if (!k) return [];
  return (k.related ?? [])
    .map((id) => ALLE_KARTEN.find((x) => x.id === id))
    .filter((x) => x != null && x.modus === 'rechner' && istAktiv(x.status) && !!x.href)
    .map((x) => ({ id: x!.id, title: x!.title, href: x!.href! }));
}

/**
 * Karten-Id zum aktuellen Pfad. Der Wizard-Rahmen kennt seine Karte nicht (er
 * bekommt Titel/Normen als fertige Props von ~50 Seiten); der Pfad ist der eine
 * Schlüssel, den alle teilen — `href` der Karte IST der Routenpfad (Tor
 * `check:inventur`: «href ausserhalb /rechner|/vorlagen (0)»). So braucht keine
 * der Seiten angefasst zu werden, und keine kann die Verdrahtung vergessen.
 */
export function karteIdFuerPfad(pfad: string): string | null {
  const ohneSlash = pfad.length > 1 && pfad.endsWith('/') ? pfad.slice(0, -1) : pfad;
  return ALLE_KARTEN.find((k) => k.href === ohneSlash)?.id ?? null;
}

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
