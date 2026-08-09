import { Link } from 'react-router-dom';
import type { ArtikelKontextAnsicht } from '../../lib/kontext';
import { revisionDetailText } from '../../lib/verzahnung/artikel-revisionen';

// ─── S7 · Artikel-Kontext «Zu Art. X» (W2·19-GLIEDERUNG, Bau-Spec §5.2) ──────
//
// Der WEGWEISER zur Leseposition im Gesetzes-Leser: vier Rollen — Praxis,
// ausgehende Verweise, letzte Textänderung, Werkzeuge. Reiner Renderer (§3): die
// Ansicht baut der Leser (`src/pages/gesetz-leser/artikelKontext.ts`), hier wird
// nur gezeigt. Das DETAIL bleibt, wo es schon steht (Artikelfuss, Werkzeug-
// Gruppe weiter unten im Panel) — diese Zeilen springen dorthin, statt dieselbe
// Liste ein zweites Mal zu führen (§5 SSoT).
//
// Eigene Datei, weil `KontextPanel.tsx` mit diesem Block über die
// 800-Zeilen-Schwelle des §6.6-Tors `check:schlankheit` lief.
//
// §15.2 — die tragende Regel dieser Datei: KEINE bedingte Zeilenzahl. Der
// Inhalt wechselt beim SCROLLEN, also ohne Nutzer-Input, also CLS-pflichtig.
// Jede Rolle sagt darum entweder ihre Zahl oder ehrlich, dass nichts erfasst
// ist (§8). Sind ALLE vier leer — der Normalfall bei den ~88 % Kantonserlassen
// ohne Verzahnung —, steht EIN Satz statt vier Verneinungen; die Höhe hält
// dann `lc-artikelkontext` am Eltern-Element, nicht die Zeilenzahl.
// Beweis: e2e/leser-kontext-e4.e2e.ts, Prüfschritt «S7» (Höhe konstant über
// vier gelesene Artikel + CLS 0 im Kontextfenster).

export function ArtikelKontextZeilen({ k }: { k: ArtikelKontextAnsicht }) {
  const praxis: string[] = [];
  if (k.leitentscheide) praxis.push(`${k.leitentscheide} Leitentscheid${k.leitentscheide === 1 ? '' : 'e'}`);
  if (k.materialien) praxis.push(`${k.materialien} Material${k.materialien === 1 ? '' : 'ien'}`);
  const alleLeer = praxis.length === 0 && k.verweise.length === 0 && !k.revision && !k.werkzeugGruppe;
  if (alleLeer) {
    return <p className="truncate">Kein artikelbezogener Kontext erfasst.</p>;
  }
  return (
    <>
      {/* Praxis — die ZAHL hier, die Liste am Artikelfuss (§5). Der Sprung ist
          ein Knopf, kein Anker: im sekundären Split-View-Pane darf er die
          Adresse nicht anfassen (LM-202-Grenze `istSekundaer`), und genau das
          leistet der durchgereichte `springeZuArtikel` des eigenen Panes. */}
      <p className="truncate">
        <span className="text-ink-500">Praxis: </span>
        {praxis.length === 0 ? 'keine erfasst' : (
          k.onSprung
            ? <button type="button" onClick={k.onSprung} className="text-brass-700 hover:underline">{praxis.join(' · ')} →</button>
            : praxis.join(' · ')
        )}
      </p>
      {/* Ausgehende Verweise — laut Jury-Richter «jurist» der wertvollste
          Einzel-Handgriff: von der Verordnungsbestimmung ins Trägergesetz, von
          der Fussnote in den zitierten Erlass. Intern verlinkt NUR, wo wir den
          Erlass wirklich halten; sonst der amtliche Link (§8, kein toter Pfad). */}
      <p className="truncate" title={k.verweise.map((v) => v.label).join(' · ')}>
        <span className="text-ink-500">Verweist auf: </span>
        {k.verweise.length === 0 ? 'kein Erlassverweis erfasst' : k.verweise.map((v, i) => (
          <span key={v.label}>
            {i > 0 && <span aria-hidden className="text-ink-300"> · </span>}
            {v.pfad
              ? <Link to={v.pfad} className="text-brass-700 hover:underline">{v.label}</Link>
              : v.url
                ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">{v.label} ↗</a>
                : v.label}
          </span>
        ))}
      </p>
      {/* Letzte Textänderung. Drei unterscheidbare Zustände (§8): belegt ·
          Urfassung (`null`) · gar nicht erfasst (`undefined`, Shard fehlt oder
          lädt). Der Wortlaut kommt aus `revisionDetailText` (§5, dieselbe Formel
          wie das «revidiert»-Badge); das führende «in Kraft seit» entfällt, weil
          das Rollen-Label es schon sagt. */}
      <p className="truncate">
        <span className="text-ink-500">Letzte Änderung: </span>
        {k.revision
          ? revisionDetailText(k.revision).replace(/^in Kraft seit /, '')
          : k.revision === null ? 'keine belegt (Urfassung)' : 'nicht erfasst'}
      </p>
      {/* Werkzeuge: SPRUNG zur bestehenden Gruppe weiter unten im selben Panel
          (Promotion), nie eine zweite Werkzeugliste — die eine Liste bleibt die
          eine (§5). Es rendert stets genau EIN Panel (a32), der Anker ist also
          eindeutig. */}
      <p className="truncate">
        <span className="text-ink-500">Werkzeuge: </span>
        {k.werkzeugGruppe
          ? <a href="#kontext-werkzeuge" className="text-brass-700 hover:underline">Rechner/Vorlagen zu {k.werkzeugGruppe} ↓</a>
          : 'keines zu diesem Artikel'}
      </p>
    </>
  );
}
