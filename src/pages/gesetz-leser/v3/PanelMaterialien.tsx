import { datumAnzeige } from '../../../components/rechtsprechung/format';
import { VERNEHMLASSUNG_STATUS_LABEL } from '../../../lib/materialien/vernehmlassungen';
import type { Geladen, MaterialStand } from './panelKontextLaden';

// ─── Reiter «Materialien» (H3) ───────────────────────────────────────────────
//
// Zwei Abschnitte, beide amtlich und beide verlinkt:
//   Entstehung   — Botschaften des Bundesrates (Fedlex), neu → alt
//   In Arbeit    — Vernehmlassungen mit Verfahrens-Zustand
//
// ZWEI ABSCHNITTE, NICHT EINE LISTE: eine Botschaft ist ein abgeschlossenes
// Dokument zur Entstehung, eine Vernehmlassung ein laufendes Verfahren. In eine
// Liste gemischt läse man beides als denselben Rang — derselbe Grund, aus dem die
// Entscheide nach Instanz gruppiert bleiben (§8).
//
// SOFT LAW BLEIBT DRAUSSEN: das Ist-Kontext-Panel führt zusätzlich
// Behörden-Ressourcen («kontextSoftLaw») und «passende Werkzeuge». Beides ist
// kein MATERIAL zur Entstehung des Erlasses, sondern eine dritte und vierte
// Sache — sie in diesen Reiter zu kippen wäre die Rückkehr zu den sechs
// bedingten Sektionen, die Kap. 4d gerade auflöst. Offener Punkt im
// Vollzugsvermerk, nicht stillschweigend weggelassen.

export function PanelMaterialien({ stand, quelleUrl }: {
  stand: Geladen<MaterialStand>;
  quelleUrl: string;
}) {
  if (!stand.fertig) {
    return <p data-v3-panel-reiter-inhalt="materialien" className="px-2.5 py-3 text-body-s text-ink-500">Materialien werden geladen …</p>;
  }
  const { botschaften, vernehmlassungen } = stand.wert ?? { botschaften: null, vernehmlassungen: null };
  // BEIDE null = Manifest unerreichbar (Fetch-Fehler), nicht «nichts erfasst» (§8).
  if (botschaften === null && vernehmlassungen === null) {
    return (
      <p data-v3-panel-reiter-inhalt="materialien" className="px-2.5 py-3 text-body-s text-ink-500">
        Materialien konnten nicht geladen werden. Amtliche Quelle:{' '}
        <a href={quelleUrl} rel="nofollow noopener noreferrer" target="_blank" className="text-brass-700">Amtliche Fassung ↗</a>
      </p>
    );
  }
  const hatBotschaften = (botschaften?.length ?? 0) > 0;
  const hatVernehmlassungen = (vernehmlassungen?.length ?? 0) > 0;
  if (!hatBotschaften && !hatVernehmlassungen) {
    return (
      <p data-v3-panel-reiter-inhalt="materialien" className="px-2.5 py-3 text-body-s text-ink-500">
        Zu diesem Erlass ist kein amtliches Material erfasst.
      </p>
    );
  }
  return (
    <div data-v3-panel-reiter-inhalt="materialien" className="px-2.5 py-1">
      {hatBotschaften && (
        <section data-v3-panel-material="botschaften" className="pt-1">
          <p className="lc-overline">Entstehung
            <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">{botschaften?.length}</span>
          </p>
          <ul className="mt-0.5">
            {botschaften?.map((b) => (
              <li key={b.key} className="border-t border-line/60 py-1.5 first:border-t-0">
                <span className="flex items-baseline gap-2">
                  <span className="num shrink-0 text-body-s font-medium text-ink-800">{b.nummer ?? 'Botschaft'}</span>
                  <span className="num shrink-0 text-micro text-ink-500">{datumAnzeige(b.stand)}</span>
                </span>
                <span className="mt-0.5 block text-micro leading-snug text-ink-600">
                  {b.titel}{' '}
                  {/* Ä121 (18.8.2026): der Link nannte kein Ziel und stand in
                      derselben Zeile neben «Curia Vista ↗», das seines nennt.
                      Ein Adjektiv ist keine Ortsangabe (§8) — der Link führt in
                      die amtliche Sammlung, also heisst er «Fedlex ↗».
                      BELEGT (gezählt 18.8.2026 in `public/materialien/register.json`):
                      alle 405 Botschaften und alle 824 Vernehmlassungen liegen auf
                      fedlex.admin.ch; die Behörden-Ressourcen mit anderen Hosts
                      (SECO, ESTV, EDÖB) stehen ausdrücklich NICHT in diesem Reiter
                      («Soft Law bleibt draussen», Dateikopf). Der Name ist damit
                      keine Annahme, sondern der gezählte Bestand. */}
                  <a href={b.quelleUrl} rel="nofollow noopener noreferrer" target="_blank" className="whitespace-nowrap text-brass-700">Fedlex ↗</a>
                  {b.parlamentUrl && (
                    <>{' · '}<a href={b.parlamentUrl} rel="nofollow noopener noreferrer" target="_blank" className="whitespace-nowrap text-brass-700">Curia Vista ↗</a></>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {hatVernehmlassungen && (
        <section data-v3-panel-material="vernehmlassungen" className="pt-2">
          <p className="lc-overline">In Arbeit
            <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">{vernehmlassungen?.length}</span>
          </p>
          <ul className="mt-0.5">
            {vernehmlassungen?.map((v) => (
              <li key={v.key} className="border-t border-line/60 py-1.5 first:border-t-0">
                <span className="flex items-baseline gap-2">
                  <span className="shrink-0 text-body-s font-medium text-ink-800">{VERNEHMLASSUNG_STATUS_LABEL[v.status]}</span>
                  {/* Frist nur, wenn sie das Sidecar trägt — bei «in Vorbereitung»
                      und «geplant» fehlt sie, und ein Platzhalter wäre eine
                      erfundene Angabe (§8). */}
                  {v.fristEnde && <span className="num shrink-0 text-micro text-ink-500">bis {datumAnzeige(v.fristEnde)}</span>}
                </span>
                <span className="mt-0.5 block text-micro leading-snug text-ink-600">
                  {v.titel}{' '}
                  {/* Ä121: dasselbe Ziel, derselbe Name (Herleitung oben). */}
                  <a href={v.quelleUrl} rel="nofollow noopener noreferrer" target="_blank" className="whitespace-nowrap text-brass-700">Fedlex ↗</a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
