import { Fragment } from 'react';
import { SUCH_META } from '../suchHighlight';
import { badgesFuer, type LeserTreffer } from '../leserSuche';

// ═══ Trefferliste der In-Gesetz-Suche (Zone B) ═══════════════════════════════
//
// W2·19-GLIEDERUNG · S8. Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md
// §4.3 (Anatomie), §4.4 (findbar/malbar-Vertrag), Entscheid David (c) 8.8.2026:
// «Suche = Trefferliste in der Seitenleiste mit Textausschnitten, Lesespalte
// bleibt vollständig und springt».
//
// WAS SICH GEGENÜBER DEM BESTAND ÄNDERT. Bis S8 filterte die LESESPALTE: der
// Volltext verschwand, an seiner Stelle standen die Treffer-Artikel. Damit war
// der amtliche Text im Suchmodus unvollständig — man konnte nicht weiterlesen,
// und jeder Sprung zu einem Artikel musste erst die Suche verlassen. Jetzt
// bleibt die Lesespalte vollständig; diese Liste ist das Verzeichnis daneben.
//
// SIE RECHNET NICHTS. Zahlen, Reihenfolge, Ausschnitte und Badges kommen
// fertig aus `leserSuche.ts` (rein, unit-getestet) — hier lebt nur Darstellung
// (§3). Insbesondere ist der Zähler DATENSEITIG (§4.4 Ziff. 1): er zählt, was
// im Erlass steht, nicht was der DOM gerade malt. Deshalb ändert er sich auch
// nicht, wenn der Leser Fussnoten aus- oder einblendet — stattdessen sagt der
// Badge «(ausgeblendet)», statt die Ansicht still umzuschalten (§8).
//
// `data-such-meta` an der Wurzel (SUCH_META): diese Liste ist BEDIENUNG, kein
// Gesetzestext. Der Highlight-Walker überspringt solche Teilbäume vollständig —
// sonst zählte ein Begriff seine eigenen Ausschnitte mit (Bug-Check §9 vom
// 4.8.2026, B1: gemeldet 425, beim Sprung 681).

export interface TrefferListeProps {
  treffer: LeserTreffer[];
  /** Gesuchter Begriff (getrimmt) — nur zur Anzeige. */
  begriff: string;
  /** Datenseitige Gesamtzahl der Fundstellen (§4.4 Ziff. 1). */
  fundstellen: number;
  /** `html[data-fussnoten="aus"]` — steuert allein die BADGE-Ehrlichkeit. */
  fussnotenAus: boolean;
  /** 0-basierte laufende Fundstelle der ↑↓-Navigation; -1 = noch keine. */
  position: number;
  /** Artikel-Token der laufenden Fundstelle (markiert die Zeile). */
  aktivToken: string | null;
  onZurueck: () => void;
  onVor: () => void;
  onSprung: (token: string) => void;
}

/** Ausschnitt mit hervorgehobenem Begriff — aus den QUELL-Strings, nie aus dem
 *  DOM (Spec §4.3): deterministisch, kein TreeWalker-Volllauf. */
function Ausschnitt({ t }: { t: LeserTreffer }) {
  const a = t.ausschnitt;
  if (!a) return null;
  return (
    <p className="lc-such-ausschnitt mt-0.5 text-micro leading-snug text-ink-600">
      {a.vor}<mark>{a.treffer}</mark>{a.nach}
    </p>
  );
}

export function TrefferListe({
  treffer, begriff, fundstellen, fussnotenAus, position, aktivToken, onZurueck, onVor, onSprung,
}: TrefferListeProps) {
  const hatSprung = fundstellen > 0;
  const anzeige = position < 0 ? '–' : String(position + 1);
  // Zwischenkopf des Top-Kapitels (§4.3), EINMAL vorberechnet statt im Render
  // mitgeschleppt. Er erscheint bei JEDEM Wechsel der Gruppe — die Liste ist
  // nach Feldgewicht sortiert (§4.2), nicht nach Dokument-Reihenfolge, ein
  // Kapitel kann darum mehrfach auftauchen. Das ist die ehrliche Darstellung
  // der Rangfolge; die Alternative (einmalige Kapitelblöcke) hiesse, die
  // Sortierung stillschweigend umzustellen.
  const zeilen = treffer.map((t, i) => ({
    t, kopf: t.gruppe !== null && t.gruppe !== (treffer[i - 1]?.gruppe ?? null) ? t.gruppe : null,
  }));

  return (
    <div {...{ [SUCH_META]: '' }} data-treffer-liste className="pb-2">
      {/* ── Listenkopf (§4.3) — Funktions-Nachfolger der früheren `TrefferLeiste`
          am Kopf der gefilterten Lesespalte. Die `data-treffer-*`-Attribute
          wandern unverändert mit, damit die Bedienung dieselbe bleibt und die
          e2e-Sonden auf denselben Sachverhalt zeigen.
          §15.2 CLS 0: feste Zeilenhöhe, ab dem ersten Render vorhanden; der
          Zähler ist datenseitig und steht sofort — es wächst nichts nach. */}
      <div data-treffer-leiste
        className="sticky top-0 z-10 flex min-h-9 items-center justify-between gap-2 bg-paper pb-1 pt-0.5 text-body-s text-ink-500">
        <p className="min-w-0 truncate">
          <span className="num">{treffer.length}</span> Artikel
          <span aria-hidden className="mx-1 text-ink-300">·</span>
          <span className="num">{fundstellen}</span>
          {fundstellen === 1 ? ' Fundstelle' : ' Fundstellen'}
        </p>
        {hatSprung && (
          <div className="flex shrink-0 items-center gap-0.5">
            <span data-treffer-position role="status" aria-live="polite"
              className="text-micro tabular-nums text-ink-500">
              <span className="num">{anzeige}</span>/<span className="num">{fundstellen}</span>
            </span>
            {/* A9-DoD: 44×44-px-Tap-Ziele, echte <button> (Tastatur), aria-label. */}
            <button type="button" onClick={onZurueck} data-treffer-zurueck
              aria-label="Vorherige Fundstelle" title="Vorherige Fundstelle"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700">
              <span aria-hidden className="text-base leading-none">↑</span>
            </button>
            <button type="button" onClick={onVor} data-treffer-vor
              aria-label="Nächste Fundstelle" title="Nächste Fundstelle"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700">
              <span aria-hidden className="text-base leading-none">↓</span>
            </button>
          </div>
        )}
      </div>

      {treffer.length === 0 && (
        // §8: ehrliche Leerzeile statt eines leeren Kastens.
        <p className="px-1 py-2 text-body-s text-ink-500">Kein Artikel gefunden für «{begriff}».</p>
      )}

      <ul className="space-y-0.5">
        {zeilen.map(({ t, kopf }) => {
          const badges = badgesFuer(t, fussnotenAus);
          const aktiv = aktivToken === t.token;
          return (
            <Fragment key={t.token}>
              {kopf !== null && (
                <li aria-hidden className="lc-overline px-1 pb-0.5 pt-3 text-ink-500">
                  <span className="line-clamp-1" title={kopf}>{kopf}</span>
                </li>
              )}
              <li data-treffer-artikel={t.token} data-fundstellen-zahl={t.fundstellen}>
                <button type="button" onClick={() => onSprung(t.token)}
                  data-treffer-aktiv={aktiv ? '1' : undefined}
                  aria-current={aktiv ? 'location' : undefined}
                  className={`w-full rounded px-1.5 py-1.5 text-left transition-colors ${aktiv ? 'bg-paper-sunken/70' : 'hover:bg-paper-sunken/60'}`}>
                  <span className="flex items-baseline gap-2">
                    <span className="num shrink-0 text-body-s font-semibold text-ink-800">{t.label}</span>
                    {t.randtitel && (
                      <span className="min-w-0 flex-1 truncate font-serif text-xs text-ink-600" title={t.randtitel}>{t.randtitel}</span>
                    )}
                    <span className="ml-auto shrink-0 text-micro tabular-nums text-ink-500">{t.fundstellen}</span>
                  </span>
                  <Ausschnitt t={t} />
                  {badges.length > 0 && (
                    // Herkunfts-Badge (§4.3/§4.4 Ziff. 2): SICHTBARER Text, nie
                    // nur `title` — der Leser sieht, warum der Artikel trifft,
                    // auch wenn im Wortlaut nichts leuchtet.
                    <span className="mt-1 flex flex-wrap gap-1">
                      {badges.map((b) => (
                        <span key={b} data-treffer-badge
                          className="rounded border border-line px-1 text-micro leading-4 text-ink-500">{b}</span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}
