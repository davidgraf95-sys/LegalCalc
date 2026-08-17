import { datumAnzeige } from '../../../components/rechtsprechung/format';
import { revisionTitel, type RevisionAnsicht } from '../../../lib/normtext/revisionen';
import type { Geladen } from './panelKontextLaden';

// ─── Reiter «Änderungen» (H3) ────────────────────────────────────────────────
//
// Die Änderungserlasse dieses Erlasses, neu → alt, jeder mit Live-Link auf die
// amtliche Fassung. Reine Projektion des Revisions-Sidecars (§3) — dieselbe
// Quelle und dieselbe Reihenfolge, die das Ist-Kontext-Panel zeigt (§5), nur
// ohne dessen fünf weiteren Gruppen.
//
// ── ZWEI ARTEN, EIN UNTERSCHIED, DER GESAGT WERDEN MUSS (§8) ────────────────
// `art: 'sammelerlass-marker'` heisst: die Änderung kam über einen Sammelerlass
// einer ANDEREN SR-Nummer und ist nur als DATUM bekannt — es gibt keinen Titel
// und keine eigene AS-Fundstelle. Diese Zeilen werden darum als solche
// beschriftet, statt einen fehlenden Titel als leere Zeile zu zeigen.
//
// `nichtKonsolidiert` heisst: in Kraft, aber im gepinnten Normtext noch nicht
// eingearbeitet. Der S3-Befund gilt auch hier — der Marker umfasst KÜNFTIGE
// Änderungen; darum steht hier nur, was das Sidecar sagt («noch nicht im Text»),
// ohne die Behauptung, es gelte bereits.
//
// KEIN «MAX_REVISIONEN» wie im Ist-Panel: das Panel scrollt. Eine Kappung auf
// zehn wäre eine stille Aussage über den Bestand (§8) — im Ist-Panel war sie die
// Folge der begrenzten Lesespalten-Höhe, nicht der Daten.

export function PanelAenderungen({ stand, quelleUrl }: {
  stand: Geladen<RevisionAnsicht>;
  /** Amtliche Basis-URL des Erlasses — der ehrliche Ausweg im Fehlerfall (§8). */
  quelleUrl: string;
}) {
  if (!stand.fertig) {
    return <p data-v3-panel-reiter-inhalt="aenderungen" className="px-2.5 py-3 text-body-s text-ink-500">Änderungen werden geladen …</p>;
  }
  if (stand.wert === null) {
    return (
      <p data-v3-panel-reiter-inhalt="aenderungen" className="px-2.5 py-3 text-body-s text-ink-500">
        Änderungsverlauf konnte nicht geladen werden. Amtliche Quelle:{' '}
        <a href={quelleUrl} rel="nofollow noopener noreferrer" target="_blank" className="text-brass-700">geltende Fassung ↗</a>
      </p>
    );
  }
  const { revisionen, reichweite } = stand.wert;
  if (revisionen.length === 0) {
    return (
      <p data-v3-panel-reiter-inhalt="aenderungen" className="px-2.5 py-3 text-body-s text-ink-500">
        Für diesen Erlass ist keine Änderung erfasst.
      </p>
    );
  }
  return (
    <div data-v3-panel-reiter-inhalt="aenderungen" className="px-2.5 py-1">
      {reichweite && <p className="pb-1 text-micro text-ink-500">{reichweite}</p>}
      <ul>
        {revisionen.map((r) => {
          const titel = revisionTitel(r, 'de');
          const marker = r.art === 'sammelerlass-marker';
          return (
            <li key={r.ocUri ?? `${r.art}:${r.dateEntryInForce}`} data-v3-panel-aenderung
              className="border-t border-line/60 py-1.5 first:border-t-0">
              <span className="flex items-baseline gap-2">
                <span className="num shrink-0 text-body-s font-medium text-ink-800">{datumAnzeige(r.dateEntryInForce)}</span>
                {r.roFundstelle && <span className="num shrink-0 text-micro text-ink-500">{r.roFundstelle}</span>}
                {r.nichtKonsolidiert && (
                  <span className="shrink-0 text-micro text-ink-500" title="In Kraft, im gepinnten Normtext aber noch nicht eingearbeitet">
                    noch nicht im Text
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-micro leading-snug text-ink-600">
                {marker
                  ? 'Änderung über einen Sammelerlass anderer SR — nur das Datum ist erfasst.'
                  : titel ?? 'Änderungserlass (ohne erfassten Titel).'}
                {' '}
                <a href={r.quelleUrl} rel="nofollow noopener noreferrer" target="_blank" className="whitespace-nowrap text-brass-700">amtlich ↗</a>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
