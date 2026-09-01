import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePaneKlasse } from '../layout/PaneKontext';
import type { Kanton } from '../../types/legal';
import { EinfacheFristForm } from '../forms/EinfacheFristForm';
import { FristenKalender, type FristMarkierung } from './FristenKalender';
import { ProzesskostenForm } from '../forms/ProzesskostenForm';
import { GebvKostenForm } from '../forms/GebvKostenForm';
import { NotariatGrundbuchForm } from '../forms/NotariatGrundbuchForm';
import { ZustaendigkeitForm } from '../forms/ZustaendigkeitForm';
import { getStandardKanton } from '../../lib/einstellungen';
import { Tabs } from '../ui/Tabs';
import { TafelReiter } from '../ui/TafelReiter';
import { tafelId, tafelReiterId } from '../ui/tafelReiterIds';

// ─── Schnellrechner der Startseite (Startseite V2) ──────────────────────────
//
// Hostet die ECHTEN Rechner-Formulare der App (§5/§10 — keine Duplikation, keine
// eigene Rechtslogik §1/§3): Fristen = allgemeiner Fristenrechner (Ferien/Ver-
// fahren + Kanton), Gebühren = Prozess/Betreibung/Notariat per Auswahl,
// Zuständigkeit = Zivilprozess-Zuständigkeit. Jeder Tab verweist zusätzlich
// ausführlich auf den jeweiligen Voll-Rechner mit dem ganzen Funktionsumfang.
//
// ── R4-1/R4-2 (31.8.2026): BEIDE Umschalter dieser Karte waren Handkopien ───
// Die Reiterleiste oben trug `role="tablist"`/`role="tab"` OHNE Tastatur, ohne
// `tabindex` und ohne `role="tabpanel"` — ein ARIA-Versprechen ohne Verhalten
// (§8), gemessen und reproduziert vom R4-Finder. Sie läuft jetzt über
// `ui/TafelReiter`, die eingelöste Fassung derselben Grammatik aus dem
// Leser-Panel; damit hat die Karte echte Pfeil-/Home/End-Navigation und eine
// benannte Tafel. Die Gebührenart darunter war eine Segmented-Control-Kopie und
// borgte sich für den aktiven Zustand die CHIP-Farbe (`bg-brass-100
// text-brass-800` = das `.lc-chip-selected`-Paar); sie läuft jetzt über
// `ui/Tabs` und trägt dessen Aktiv-Füllung. Beide Kopien sind gelöscht, nicht
// angeglichen (§5/§10) — die Optik der Karte ändert sich dabei sichtbar, und
// zwar zum Kanon hin. Wächter: `src/tests/design-r4-umschalter.test.ts`.

type Tab = 'fristen' | 'gebuehren' | 'zustaendigkeit';

/** Namensraum der Reiter-/Tafel-Id-Paare dieser Karte. */
const TAFEL = 'schnellrechner';

const TABS: { code: Tab; label: string }[] = [
  { code: 'fristen', label: 'Fristen' },
  { code: 'gebuehren', label: 'Gebühren' },
  { code: 'zustaendigkeit', label: 'Zuständigkeit' },
];

// Gebühren-Unterauswahl als Segment-Buttons (ein Klick statt Select-Aufklappen,
// Auftrag David «weniger Klicks bis zum Resultat»). Der Grundstückkauf läuft
// SCHLANK (NotariatGrundbuchForm minimal: Kanton + Kaufpreis + Steuer); der
// volle Notariats-/Grundbuchrechner ist verlinkt («auf richtigen verweisen»).
type GebuehrenArt = 'prozess' | 'betreibung' | 'grundstueck';
const GEBUEHREN: { code: GebuehrenArt; label: string; href: string; rechner: string; was: string }[] = [
  { code: 'prozess', label: 'Prozess', href: '/rechner/prozesskosten', rechner: 'Prozesskostenrechner', was: 'Modifikatoren, Vorschuss, Kostenrisiko, Rechenweg' },
  { code: 'betreibung', label: 'Betreibung', href: '/rechner/betreibungskosten', rechner: 'Betreibungskostenrechner', was: 'alle Gebührenarten, Rechenweg' },
  { code: 'grundstueck', label: 'Grundstück', href: '/rechner/notariat-grundbuch', rechner: 'Notariats-/Grundbuchrechner', was: 'Grundpfand, Handänderungssteuer, interkantonaler Vergleich, PDF' },
];

// Ausführlicher Verweis auf den jeweiligen Voll-Rechner (Auftrag David).
function VollRechnerHinweis({ href, name, was }: { href: string; name: string; was: string }) {
  return (
    <p className="text-body-s text-ink-500 mt-1">
      Mehr Optionen ({was}) im{' '}
      <Link to={href} className="font-medium text-brass-700 hover:text-brass-600 no-underline">{name} →</Link>
    </p>
  );
}

function GebuehrenTab() {
  const [art, setArt] = useState<GebuehrenArt>('prozess');
  const aktiv = GEBUEHREN.find((g) => g.code === art)!;
  return (
    <div className="space-y-4">
      {/* Ein Klick wählt die Gebührenart (weniger Klicks bis zum Resultat,
          Auftrag David). Die Auswahl schaltet ein Formular UM — das ist die
          Segmented-Control-Aussage, also `ui/Tabs` (R4-1). `mode="pressed"`
          und nicht `tab`: eine `role=tab`-Leiste ohne `tabpanel` wäre wieder
          ein halbes Versprechen (§8); hier steht kein benanntes Fach darunter,
          sondern schlicht das gewählte Formular. */}
      <Tabs items={GEBUEHREN} value={art} onChange={setArt} mode="pressed" groesse="s" ariaLabel="Gebührenart" />
      {art === 'prozess' && <ProzesskostenForm minimal />}
      {art === 'betreibung' && <GebvKostenForm minimal />}
      {art === 'grundstueck' && <NotariatGrundbuchForm minimal />}
      <VollRechnerHinweis href={aktiv.href} name={aktiv.rechner} was={aktiv.was} />
    </div>
  );
}

export function Schnellrechner() {
  // Split-View B-1: im Pane reagiert das 2-Spalten-Layout auf die PANE-Breite
  // (@3xl/pane) statt auf den Viewport; ausserhalb byte-gleich (lg:).
  const pk = usePaneKlasse();
  const [tab, setTab] = useState<Tab>('fristen');
  // #7: das Formular meldet sein Ergebnis hoch; der Kalender (rechts) ist reine
  // Visualisierung davon — keine doppelten Eingaben mehr.
  const [fristErgebnis, setFristErgebnis] = useState<{ markierung: FristMarkierung; kanton: Kanton } | null>(null);
  return (
    <div className="lc-card overflow-hidden">
      {/* «live hergeleitet»-Badge entfernt (Auftrag David 25.6.2026): redundant zum
          Live-Hinweis im Ergebnisblock des Formulars — ein Live-Indikator genügt. */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line">
        <span className="lc-overline">Schnell rechnen</span>
      </div>
      {/* `grund="surface"`, weil die Leiste auf der Kartenfläche sitzt
          (`.lc-card` = `bg-surface`): der Scrollrand-Deckel muss die Farbe der
          Fläche haben, die er abdeckt. `breit`, weil die drei Reiter wie bisher
          die Kartenbreite teilen. */}
      <TafelReiter items={TABS} value={tab} onChange={setTab} ariaLabel="Schnellrechner"
        idPraefix={TAFEL} grund="surface" breit />
      <div className="p-5" role="tabpanel" id={tafelId(TAFEL, tab)} aria-labelledby={tafelReiterId(TAFEL, tab)}>
        {tab === 'fristen' && (
          <div className="space-y-4">
            {/* Zwei Hälften: links rechnen (Eingabe), rechts der Kalender als reine
                Visualisierung DESSELBEN Ergebnisses (#7 — keine doppelten Eingaben). */}
            <div className={pk('grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start', 'grid gap-5 @3xl/pane:grid-cols-[18rem_minmax(0,1fr)] @3xl/pane:items-start')}>
              <div className="space-y-2">
                <EinfacheFristForm minimal onErgebnis={setFristErgebnis} />
              </div>
              <div className={pk('space-y-2 lg:border-l lg:border-line lg:pl-5', 'space-y-2 @3xl/pane:border-l @3xl/pane:border-line @3xl/pane:pl-5')}>
                <span className="lc-overline">Kalender-Ansicht</span>
                <FristenKalender markierung={fristErgebnis?.markierung ?? null} kanton={fristErgebnis?.kanton ?? getStandardKanton()} />
              </div>
            </div>
            <VollRechnerHinweis href="/rechner/tagerechner" name="Fristenrechner" was="Rückwärts, Zwischenfrist, ZPO/SchKG-Verfeinerung" />
          </div>
        )}
        {tab === 'gebuehren' && <GebuehrenTab />}
        {tab === 'zustaendigkeit' && (
          <div className="space-y-4">
            <ZustaendigkeitForm minimal />
            <VollRechnerHinweis href="/rechner/zustaendigkeit" name="Zuständigkeitsrechner" was="örtliche Zuständigkeit, Weichen, Rechenweg" />
          </div>
        )}
      </div>
    </div>
  );
}
