import { memo, useMemo } from 'react';
import { ErwaegungsRail } from '../components/rechtsprechung/ErwaegungsRail';
import { erwaegungsGliederung } from '../lib/rechtsprechung/abschnitte';
import { NormText } from '../components/NormText';
import {
  nennungsAnker, trefferInErwaegungen, zaehleTreffer,
} from './entscheidLeserRegeln';
import type { EntscheidAbschnitt } from '../lib/rechtsprechung/typen';

// ── V5 · Rechen-Anschluss des Erwägungs-Rails ───────────────────────────────
//
// Die drei Ableitungen (Gliederung · Suchtreffer · Normen-Fundstellen) leben
// HIER und nicht in `ErwaegungsRail`: sie sind Regeln des Lesers
// (`entscheidLeserRegeln`, `abschnitte`), und die Rail-Komponente soll ein
// reiner Renderer bleiben — dieselbe Arbeitsteilung wie Reader ↔ `BezuegeZeile`.
// Eigene `memo`-Grenze, damit ein Tastendruck im Suchfeld nicht den ganzen
// Leser (Kopf, Tabs, Fuss-Panel) neu rendert; die Ableitungen selbst hängen in
// `useMemo` (React Compiler ist AUS, §15.4).
// A-2 (31.8.2026): die `imPane`-Prop ist mit dem Rail selbst entfallen — er
// liest die Lage jetzt aus demselben Kontext wie sein Raster (`usePaneKlasse`).
export const ErwRail = memo(function ErwRail({ abschnitte, zitierteNormen, suche, onSuche, springe }: {
  abschnitte: EntscheidAbschnitt[];
  zitierteNormen: string[];
  suche: string;
  onSuche: (v: string) => void;
  springe: (anker: string) => void;
}) {
  const gliederung = useMemo(() => erwaegungsGliederung(abschnitte), [abschnitte]);
  const treffer = useMemo(() => trefferInErwaegungen(abschnitte, suche), [abschnitte, suche]);
  const trefferGesamt = useMemo(() => zaehleTreffer(abschnitte, suche), [abschnitte, suche]);
  // Angewandte Normen MIT wörtlicher Nennung in einer Erwägung. Ohne Fundstelle
  // KEIN Chip: ein Sprungziel, das es nicht gibt, wird nicht angeboten (§8) —
  // die Norm selbst bleibt im Fuss-Panel («Zitierte Normen») sichtbar.
  const normen = useMemo(() => {
    const out: { zitat: string; anker: string }[] = [];
    const gesehen = new Set<string>();
    for (const z of zitierteNormen) {
      if (gesehen.has(z)) continue;
      gesehen.add(z);
      const anker = nennungsAnker(abschnitte, z)[0];
      if (anker) out.push({ zitat: z, anker });
    }
    return out;
  }, [abschnitte, zitierteNormen]);
  return (
    <ErwaegungsRail gliederung={gliederung} treffer={treffer} trefferGesamt={trefferGesamt}
      normen={normen} suche={suche} onSuche={onSuche} springe={springe} />
  );
});

// Kleiner Hinweis, dass genannte Bundesnormen im Text verlinkt sind (NormText
// im Body) — über NormText, damit der Verweis selbst auch ein lebender Link ist.
export function NormTextHinweis() {
  return (
    <p className="text-micro text-ink-500">
      Im Text genannte Bundesnormen (z. B. <NormText text="Art. 8 ZGB" />) sind direkt mit der Gesetzessammlung verlinkt.
    </p>
  );
}
