import { grundartMeta } from '../helpers';
import { ErlassUebersicht } from '../parts/ErlassUebersicht';
import { UebersichtBox } from './UebersichtBox';
import { uebersichtsZeile, type BestimmungsWort } from './erlassAnsicht';
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
  /** Zähl-Substantiv aus dem Grundart-Register (§5, EINE Ableitung im Rahmen).
   *  B8: der Typ kommt aus `./erlassAnsicht`. */
  bestimmungsWort: BestimmungsWort;
}) {
  const { erlass, eintraege } = m;
  if (!erlass || !eintraege) return null;
  const meta = grundartMeta(erlass.key);
  // ── B5 (H2b-Nachzug) · EINE QUELLE, EINMAL ZEIGEN ──────────────────────────
  // Gemessen 17.8.2026 (StPO @1440, Box aufgeklappt): die Warnung stand ZWEIMAL
  // in derselben Box — «⚠ Eine in Kraft getretene Änderung ist noch nicht
  // eingearbeitet — massgeblich ist die amtliche Fassung.» (diese Datei) und
  // «⚠ In Kraft getretene Änderung noch nicht im gezeigten Text.» (`ErlassUebersicht`).
  // Derselbe Sachverhalt, zwei Wortlaute, zwei Zentimeter Abstand (Grundlage
  // Kap. 1 Nr. 3, §5). ZWEITER BEFUND derselben Wurzel: hier fehlte die Grenze,
  // die Erlass-Kopf UND Erlass-Übersicht beide ziehen — bei einem GANZ
  // aufgehobenen Erlass ist die Aufhebung die Aussage, eine offene Konsolidierung
  // daneben ist irreführend (§8).
  const zeigeWarnung = m.nichtKonsolidiert && !erlass.aufgehoben;
  return (
    <UebersichtBox zusammenfassung={uebersichtsZeile(erlass, eintraege.length, bestimmungsWort)}
      // Die Warnung «nicht konsolidiert» steht mit Zeichen UND Wort in der
      // geschlossenen Zeile und wird nie weggeklappt (Design-Grundlage Kap. 6:
      // nie Farbe allein, nie ein Icon ohne Label). Sie ist damit die
      // ausführlichere der beiden und die, die IMMER sichtbar ist — darum bleibt
      // sie, und die kürzere im aufgeklappten Inhalt entfällt (s. u.).
      warnung={zeigeWarnung
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
        // B5: `nichtKonsolidiert` wird hier BEWUSST nicht durchgereicht. Der
        // geteilte Baustein würde daraus seine eigene Warnzeile bauen — und die
        // Box trägt sie oben schon, ausführlicher und auch im zugeklappten
        // Zustand. Das ist keine unterdrückte Auskunft: die Zeile des Bausteins
        // steht weiterhin da und sagt im Normalfall «Massgeblich ist stets die
        // amtliche Fassung», ihre reservierte Höhe bleibt unverändert (§15.2), und
        // im Erlass-Kopf über der Lesespalte steht sie ohnehin — die V3-Hülle
        // entscheidet damit, WO die eine Quelle erscheint, nicht OB.
      />
    </UebersichtBox>
  );
}
