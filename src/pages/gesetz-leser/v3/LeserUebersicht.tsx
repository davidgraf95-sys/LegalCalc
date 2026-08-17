import { grundartMeta } from '../helpers';
import { ErlassUebersicht } from '../parts/ErlassUebersicht';
import { UebersichtBox } from './UebersichtBox';
import { uebersichtsZeile } from './erlassAnsicht';
import type { LeserV3Modell } from './leserV3Modell';

// ─── Zone A der Seitenleiste: die EINE Übersichtsbox (Kap. 4b ①, Pos. 10) ────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H2b, §6.6): der Rahmen ist die Datei, die
// man liest, um die HÜLLE zu verstehen — «wo steht was». Die Zusammenstellung der
// Übersicht ist dagegen ein Bauteil mit einer eigenen Frage («was muss man beim
// Ankommen über diesen Erlass wissen»), und sie war der grösste zusammenhängende
// Block darin, der keine Layout-Entscheidung trifft. Verhaltensneutral verschoben
// (§6): identische Props, identisches Markup.
//
// §3: reine Anordnung. Die Zahlen und der Warn-Zustand kommen aus dem Modell,
// die Erlass-Ableitung aus `./erlassAnsicht` — hier wird nichts gerechnet und
// nichts entschieden ausser der Reihenfolge.

export function LeserUebersicht({ m, bestimmungsWort }: {
  m: LeserV3Modell;
  /** Zähl-Substantiv aus dem Grundart-Register (§5, EINE Ableitung im Rahmen). */
  bestimmungsWort: 'Artikel' | 'Paragraphen';
}) {
  const { erlass, eintraege } = m;
  if (!erlass || !eintraege) return null;
  const meta = grundartMeta(erlass.key);
  return (
    <UebersichtBox zusammenfassung={uebersichtsZeile(erlass, eintraege.length, bestimmungsWort)}
      // Die Warnung «nicht konsolidiert» steht mit Zeichen UND Wort in der
      // geschlossenen Zeile und wird nie weggeklappt (Design-Grundlage Kap. 6:
      // nie Farbe allein, nie ein Icon ohne Label).
      warnung={m.nichtKonsolidiert
        ? (
          <p className="flex items-start gap-1 text-micro leading-snug text-warn-700">
            <span aria-hidden className="shrink-0">⚠</span>
            <span>Eine in Kraft getretene Änderung ist noch nicht eingearbeitet — massgeblich ist die amtliche Fassung.</span>
          </p>
        )
        : undefined}>
      <ErlassUebersicht erlass={erlass} kopf={m.kopf} currency={m.currency?.[erlass.key]}
        erlassTyp={meta.erlassTyp} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
        bestimmungsEtikettStatus={meta.bestimmungsEtikettStatus}
        gliederungsTiefe={m.gliederungsTiefe} kennzahlen={m.gliederung.kennzahlen}
        kantonSys={m.kantonSys} kantonErlassAnzahl={m.kantonErlassAnzahl}
        nichtKonsolidiert={m.nichtKonsolidiert} />
    </UebersichtBox>
  );
}
