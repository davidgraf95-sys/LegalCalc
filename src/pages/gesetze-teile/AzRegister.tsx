// IA-3 · A–Z-/Kürzel-Register (FAHRPLAN-GESETZES-UX §11.5, Muster M6
// gesetze-im-internet): Browse-Zwilling zum Norm-Sprung auf dem neutralen
// G4-Landeplatz /gesetze. Buchstaben-Leiste + Titel/Kürzel-Filter, title-only
// auf dem BEREITS client-geladenen register.json-Manifest — KEIN zweiter
// Suchindex (K10), KEIN dritter Suchpfad (A5/§Z1: die Sprung-Karte bleibt CTA
// auf die HeaderSuche; dieses Feld filtert nur die Register-Liste).
//
// Perf (§15/R-PERF-5): Lazy-je-Buchstabe — es rendert IMMER nur die gewählte
// Buchstaben-Klasse (grösste: V mit ~589 Titeln), nie alle 1469. CLS 0 durch
// RESERVIERTEN Platz (§15.2, CI-Befund PR #347): die Ergebnisliste lebt in einem
// Scroll-Container mit KONSTANTER Höhe — Klassen-/Filter-Wechsel ändern nur den
// Inhalt, nie die Aussengeometrie (Footer/Umfeld stehen still, egal wie spät der
// Commit auf langsamer Hardware landet; die 500-ms-Input-Gnade trägt dort nicht).
// BEWUSST kein content-visibility auf den Zeilen: dessen Platzhalter-Schätzung
// (contain-intrinsic-size) wurde asynchron auf die echte Zeilenhöhe korrigiert —
// genau die input-freien LI-Shifts, die das CLS-Tor in CI rot machten (Quellen-
// Attribution 25.7.2026: prev 44px → cur 29/50px). Ein einziger synchroner
// Layout-Pass je Commit ist hier billiger und shift-frei.
//
// Mobil kollabiert (§3.1 «keine Wucherung», §11.5-DoD): auf schmalen Viewports
// startet die Sektion zugeklappt (Disclosure-Button, aria-expanded).
// Reine Darstellung (§3) — die Einsortierungs-Regeln leben testbar in
// az-register.ts.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { istLesbar, type BrowseErlass } from '../../lib/normtext/browse-typen';
import { AZ_KLASSEN, gruppiereAZ, filterTitelKuerzel, ebeneLabel } from './az-register';

function AzZeile({ e }: { e: BrowseErlass }) {
  const basePath = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  // Kürzel dezent daneben, wenn es echten Mehrwert trägt (nicht schon im Titel —
  // kantonale «kuerzel» sind oft der ganze Titel, vgl. SysZeile).
  const zeigeKuerzel = e.kuerzel && e.kuerzel !== e.titel && !e.titel.includes(e.kuerzel);
  const inhalt = (
    <>
      <span className="min-w-0 break-words text-ink-700 group-hover/az:text-brass-700 transition-colors">
        {e.titel}
        {zeigeKuerzel && <span className="ml-2 text-xs text-ink-500">{e.kuerzel}</span>}
      </span>
      <span className="shrink-0 flex items-baseline gap-2 text-xs text-ink-500">
        <span>{ebeneLabel(e)}</span>
        {/* 'nur-live-link' führt ehrlich nach aussen (§8) — wie ErlassZeile. */}
        {!istLesbar(e) && <span aria-hidden className="text-brass-700">↗</span>}
      </span>
    </>
  );
  const cls = 'group/az grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 rounded px-2 py-1 text-body-s no-underline hover:bg-brass-100/30 transition-colors';
  return istLesbar(e)
    ? <Link to={basePath} className={cls}>{inhalt}</Link>
    : <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>;
}

export function AzRegister({ erlasse }: { erlasse: BrowseErlass[] }) {
  // Mobil kollabiert: Erstzustand folgt dem Viewport (sm-Grenze wie das übrige
  // Layout) und FOLGT dem Breakpoint weiter (Rotation/Fenster-Resize), bis der
  // Nutzer selbst togglet — dann gewinnt seine Wahl. Nur clientseitig gerendert
  // (erlasse-gated) — kein SSR-Mismatch; render-then-replace bleibt (§15.5).
  const [offen, setOffen] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 640px)').matches);
  const manuell = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const auf = () => { if (!manuell.current) setOffen(mq.matches); };
    mq.addEventListener('change', auf);
    return () => mq.removeEventListener('change', auf);
  }, []);
  const [buchstabe, setBuchstabe] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const gruppen = useMemo(() => gruppiereAZ(erlasse), [erlasse]);
  const treffer = useMemo(() => filterTitelKuerzel(erlasse, filter), [erlasse, filter]);
  const filtert = filter.trim().length > 0;
  // Sichtbare Liste: Filter gewinnt; sonst die gewählte Buchstaben-Klasse
  // (Lazy-je-Buchstabe — nie alle 1469 auf einmal).
  const liste = filtert ? treffer : buchstabe ? gruppen.get(buchstabe) ?? [] : null;

  return (
    <section aria-labelledby="az-register-kopf" className="lc-card p-5 space-y-4">
      <h2 id="az-register-kopf" className="m-0">
        <button
          type="button"
          aria-expanded={offen}
          aria-controls="az-register-panel"
          onClick={() => { manuell.current = true; setOffen((o) => !o); }}
          className="group flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 text-left"
        >
          <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight group-hover:text-brass-700 transition-colors">
            A–Z-Register
          </span>
          {/* Kein «Bund/Kantone/International» im Button-Namen: die Wörter
              kollidierten (strict mode) mit den Accessible Names der drei
              Einstiegskacheln — die Ebenen-Erklärung steht unten im Panel. */}
          <span className="text-body-s text-ink-500">
            <span className="num">{erlasse.length.toLocaleString('de-CH')}</span> Erlasse nach Titel
          </span>
          <span aria-hidden className={`ml-auto text-ink-500 transition-transform ${offen ? 'rotate-90' : ''}`}>›</span>
        </button>
      </h2>

      {offen && (
        <div id="az-register-panel" className="space-y-4">
          {/* Titel/Kürzel-Filter — filtert NUR dieses Register (kein dritter
              Suchpfad, A5); der Artikel-Sprung bleibt in der HeaderSuche. */}
          <input
            type="search"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); if (e.target.value.trim()) setBuchstabe(null); }}
            placeholder="Im Register filtern — Titel oder Kürzel …"
            aria-label="A–Z-Register filtern (Titel oder Kürzel)"
            className="lc-input h-11 w-full max-w-sm py-0 text-body-s"
          />

          {/* Buchstaben-Leiste: Navigation, tastatur-bedienbar (native Buttons,
              Fokus über globales :focus-visible); leere Klassen deaktiviert,
              aria-label trägt die Anzahl (nie nur Farbe/Zustand, §11.6.8). */}
          <nav aria-label="Erlasse nach Anfangsbuchstaben">
            <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
              {AZ_KLASSEN.map((k) => {
                const n = gruppen.get(k)?.length ?? 0;
                const aktiv = !filtert && buchstabe === k;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      disabled={n === 0}
                      aria-pressed={aktiv}
                      aria-label={`${k} — ${n === 0 ? 'keine Erlasse' : `${n} ${n === 1 ? 'Erlass' : 'Erlasse'}`}`}
                      onClick={() => { setBuchstabe((b) => (b === k ? null : k)); setFilter(''); }}
                      className={`num min-w-9 rounded px-1.5 py-1 text-body-s font-medium transition-colors ${
                        aktiv
                          ? 'bg-brass-100 text-brass-800'
                          : n === 0
                            ? 'cursor-default text-ink-300'
                            : 'text-ink-700 hover:bg-paper-sunken hover:text-brass-700'
                      }`}
                    >
                      {k}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* §15.2 (CI-Befund PR #347): Status-Zeile mit FESTER Höhe + Liste in
              einem Scroll-Container mit KONSTANTER Höhe — jeder Klassen-/Filter-
              Wechsel ändert nur den Inhalt, nie die Aussengeometrie. So gibt es
              strukturell keinen input-freien Shift, auch wenn ein Commit auf
              langsamer Hardware erst nach der 500-ms-Input-Gnade landet. */}
          <div className="space-y-2">
            {/* Der innere span ist je Status-Text ein FRISCHER Knoten (key):
                Chrome zählt das Umschreiben eines bestehenden Text-Knotens als
                layout-shift (Quellen-Attribution 25.7.: «#text …»», 0.0013,
                auf langsamer Hardware input-frei) — ein neu eingefügter Knoten
                in einer fix hohen Zeile (h-5) shiftet dagegen strukturell nie. */}
            <p aria-live="polite" className="h-5 truncate text-xs text-ink-500">
              <span key={liste ? (filtert ? `f:${filter.trim()}:${liste.length}` : `b:${buchstabe}:${liste.length}`) : 'leer'}>
                {liste
                  ? (filtert
                    ? <><span className="num">{liste.length}</span> Treffer im Register für «{filter.trim()}»</>
                    : <><span className="num">{liste.length}</span> Titel unter «{buchstabe}»</>)
                  : <>Buchstaben wählen oder filtern — alle Ebenen (Bund, Kantone, International), jeder Titel führt in den Volltext.</>}
              </span>
            </p>
            {/* Scrollbare Region: tastatur-erreichbar (tabIndex, axe
                scrollable-region-focusable) und benannt. Die Höhe ist ein
                Skalen-Wert (h-96) und bleibt in JEDEM Zustand gleich. */}
            <div
              role="region"
              aria-label="Register-Liste"
              tabIndex={0}
              className="h-96 overflow-y-auto overscroll-contain rounded border border-line/70 p-2"
            >
              {liste && liste.length > 0 ? (
                <ul
                  /* Remount je Sicht (CI-Befund PR #347, Rest-Shift): OHNE den
                     key reusen React-Keys (e.key) LI-Knoten über den Sichten-
                     Wechsel (Klasse ↔ Filter) hinweg — überlebende Knoten
                     WANDERN dann im Scroll-Container (layout-shift), und auf
                     langsamer Hardware landet der Commit nach der 500-ms-
                     Input-Gnade. Frische Knoten je Sicht shiften nie. */
                  key={filtert ? `f:${filter.trim()}` : `b:${buchstabe}`}
                  className="m-0 list-none space-y-0.5 p-0"
                >
                  {liste.map((e) => <li key={e.key}><AzZeile e={e} /></li>)}
                </ul>
              ) : (
                <p className="px-2 py-1 text-body-s text-ink-500">
                  {liste ? 'Kein Titel im Register gefunden.' : 'Noch nichts gewählt — die Liste erscheint hier.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
