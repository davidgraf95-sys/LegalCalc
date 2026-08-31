import { NAVIGATION } from '../../lib/navigation';
import { Icon } from '../Icon';
import { RubrikKachel } from '../ui/RubrikKachel';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { GesetzeChips } from './GesetzeChips';

// ─── Rubrik-Kacheln der Startseite (Startseite V3, Modul #4) ────────────────
//
// Fünf Link-Kacheln als vollständige Landkarte der Sammlung, iteriert über die
// EINE Navigations-SSoT (navigation.ts::NAVIGATION ohne «Start») — gleiche
// Ordnung wie die Sidebar (I1). Reine Darstellung (§3): je Kachel ein
// monolineares Icon (≤20 px), Titel, EIN konkreter Nutzen-Satz und — nur wo
// substanziell — ein gescopter Zähler. Die Zahlen kommen aus der buildseitig
// generierten Mini-Datei (startseiteZaehler.generated.ts, Tor check:zaehler) —
// KEIN Register-Import in den Startseiten-Chunk, kein Client-Fetch.
//
// Wortlaut-Regeln (§6): konkreter Nutzen, kein «geprüft», keine Floskeln; Zähler
// nur mit Scope. Gesetze/Entscheide zählen echten Volltext; Materialien sind
// bibliografische Verweise → «erfasst», nie «Volltext» (§8, E6a·M5).

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

// Anzeige je Rubrik, verschlüsselt über das Navigations-Ziel (die EINE Ordnung).
// C-5 (31.8.2026): der Zähler steht nicht mehr als eine Zeichenkette in der
// Fusszeile, sondern als Zahl + Einheit im Kanon-Kopf der Kachel
// (`ui/RubrikKachel`). Der WORTLAUT ist unverändert — er wandert nur in die
// Einheit: «227 Erlasse im Volltext» liest sich weiterhin als ein Satz.
const RUBRIK: Record<string, { icon: string; nutzen: string; zahl?: string; einheit?: string }> = {
  '/gesetze': {
    icon: 'scale',
    nutzen: 'Bundes- und Kantonserlasse im Volltext, geltende Fassung mit Stand und Link zur amtlichen Quelle.',
    zahl: nf(z.gesetzeVolltext), einheit: 'Erlasse im Volltext',
  },
  '/rechtsprechung': {
    icon: 'court',
    nutzen: 'Bundesgerichts- und weitere Gerichtsentscheide, nach Sachgebiet erschlossen und mit den Normen verzahnt.',
    zahl: nf(z.rechtsprechungVolltext), einheit: 'Entscheide im Volltext',
  },
  '/materialien': {
    icon: 'clipboard',
    nutzen: 'Kreisschreiben, Leitfäden und Wegleitungen der Bundesbehörden, je mit Link zur amtlichen Fassung.',
    // Zähler «erfasste» (§8, nie «Volltext» — alle sind nur-live-link/Verweis; E6a·M5, §0/B10a).
    zahl: nf(z.materialien), einheit: 'amtliche Materialien erfasst',
  },
  '/rechner': {
    icon: 'calculator',
    nutzen: 'Fristen, Kosten und Zuständigkeiten nach festen Regeln, mit offengelegtem Rechenweg.',
    zahl: nf(z.rechner), einheit: 'Rechner',
  },
  '/vorlagen': {
    icon: 'document',
    nutzen: 'Verträge und Eingaben aus Bausteinen mit Normbezug, als Word und PDF.',
    zahl: nf(z.vorlagen), einheit: 'Vorlagen',
  },
};

export function RubrikKacheln() {
  // Landkarte = dieselben Rubriken wie die Sidebar, ohne «Start» (titel === null).
  const rubriken = NAVIGATION.filter((a) => a.titel !== null && a.ziel && RUBRIK[a.ziel]);
  return (
    <div className="space-y-4">
      {/* Mobil grid-cols-1 zwingend (bekannte Overflow-Falle @390); Desktop fünf
          Spalten als eine Reihe (die volle Landkarte auf einen Blick). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rubriken.map((a) => {
          const r = RUBRIK[a.ziel!];
          return (
            /* C-5 (31.8.2026): Anatomie und Hover-Kette liegen jetzt in
               `ui/RubrikKachel` — dieselbe Kachel wie der /gesetze-Einstieg.
               Die C-3-Herleitung (Hover über die Farbstufe, §G-j, zentral an
               `.lc-card`) gilt dort weiter; sie greift hier nun automatisch,
               weil die Kachel `lc-card` ist und nicht mehr `lc-tile`. */
            <RubrikKachel key={a.ziel} ziel={a.ziel!} titel={a.titel}
              icon={<Icon name={r.icon} className="w-5 h-5" />}
              zahl={r.zahl} einheit={r.einheit} nutzen={r.nutzen} />
          );
        })}
      </div>
      <GesetzeChips />
    </div>
  );
}
