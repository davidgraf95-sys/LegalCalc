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
  // ── B6 (Klick-Test 18.8.2026) · EIN FEHLER, DER KEINER WAR ────────────────
  // BEFUND: an einem Kantonserlass meldete der Reiter «Änderungsverlauf konnte
  // nicht geladen werden» — ohne Netzfehler, bei intakter Verbindung, jedes Mal.
  //
  // URSACHE, gemessen 18.8.2026: `public/normtext/revisionen/` trägt 227
  // Sidecars, davon 0 kantonale (`ls | grep -c '^[A-Z][A-Z]-'`). Die
  // Revisionen liegen als EINE DATEI JE ERLASS; wo keine liegt, antwortet der
  // Server 404, und `ladeSidecar` (`lib/normtext/revisionen.ts`) bildet
  // `!res.ok` auf denselben `null`-Wert ab wie einen echten Fetch-Fehler. Für
  // rund 1200 Erlasse war die Fehlermeldung damit der NORMALZUSTAND — und eine
  // Fehlermeldung, die nichts meldet, ist die schlechteste Art zu schweigen (§8).
  //
  // Der Reiter «Materialien» hat das Problem nicht: er zieht EIN Manifest für
  // alle Erlasse. Dort heisst «Manifest da, Erlass nicht drin» = leere Liste =
  // «nicht erfasst», und `null` bleibt dem echten Fehler vorbehalten.
  //
  // WARUM HIER NUR DER WORTLAUT: die Unterscheidung 404 ↔ Netzfehler gehört an
  // die Wurzel, in `ladeSidecar` — und `src/lib/normtext/**` ist Risiko-Pfad
  // (`istRisikoPfad`, `scripts/gegenpruefung/kern.ts`), an dem V1 mithängt.
  // Dieser UI-Nachzug betritt ihn nicht; der Wurzel-Fix steht als eigener
  // Schritt im Fahrplan (§17 — hinterlegt, nicht umschifft).
  // SOLANGE behauptet der Satz keine Ursache, die wir nicht kennen: er nennt
  // BEIDE Möglichkeiten. Das ist die ehrliche Auskunft im Sinn von §8, nicht die
  // bequeme — «nicht erfasst» allein wäre im seltenen echten Fehlerfall genauso
  // falsch wie «konnte nicht geladen werden» im häufigen Normalfall.
  if (stand.wert === null) {
    return (
      <p data-v3-panel-reiter-inhalt="aenderungen" className="px-2.5 py-3 text-body-s text-ink-500">
        Kein Änderungsverlauf verfügbar — für diesen Erlass ist keiner erfasst,
        oder die Quelle war nicht erreichbar. Amtliche Quelle:{' '}
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
                  // C2 (H3-Nachzug): «anderer SR» war Bundes-Wortlaut an einer
                  // datengetriebenen Zeile — SR-Nummern führt nur das Bundesrecht,
                  // der Satz stand aber auch an Kantons-Erlassen. Die Auskunft
                  // bleibt dieselbe, ohne die Bund-Annahme (Erlass-Neutralität).
                  ? 'Änderung über einen Sammelerlass — nur das Datum ist erfasst.'
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
