import { useNavigate } from 'react-router-dom';
import { naechsteInstanz, merkeTab } from '../../../lib/tabs';

// ─── «⧉ In neuem Fenster» — Aktion des Erlass-Kopfs ─────────────────────────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H2b, §6.6): der Rahmen soll sagen, WO
// etwas steht, nicht was beim Klick auf einen einzelnen Knopf geschieht. Die
// Aktion ist in sich geschlossen (Ziel bilden · Reiter merken · navigieren ·
// flüchtige Bestätigung anstossen) und hat mit dem Layout nichts zu tun.
// Verhaltensneutral verschoben (§6): identische Aufrufe, identische Reihenfolge,
// dieselbe Timer-Ref des Modells — der Toast selbst bleibt im Rahmen, weil nur
// dort der `display:contents`-Träger steht, der seinen Margin abfängt.
//
// §3: keine Rechtslogik. `naechsteInstanz`/`merkeTab` sind die geteilte
// Reiter-Buchführung (`lib/tabs`), unverändert benutzt.
//
// ── Ä118 (Live-Ästhetik-Prüfung 18.8.2026) · EIN FEATURE, EIN WORT ───────────
//
// GEMESSEN am Accessible-Name-Inventar hiess DIESELBE Sache — die zweite
// Lesefläche neben der ersten — an fünf Stellen anders: «In neuem Reiter»
// (hier), «Alle geöffneten Reiter»/«Reiter & Split-View» (Topbar),
// «Hauptfenster schliessen»/«zum Hauptfenster machen» (Griffleiste),
// «Pane-Breite anpassen» (Trenner), «Layout-Link kopieren» (Menü). Und
// «Reiter» bezeichnete zugleich die REITER DES PANELS («Entscheide ·
// Änderungen · Materialien») — dasselbe Wort für zwei verschiedene Sachen in
// derselben Ansicht.
//
// DER GLOSSAR-ENTSCHEID (Design-Grundlage Kap. 9): die Split-Sache heisst
// **Fenster**, «Reiter» bleibt dem Panel. Grund: «Reiter» ist im Browser
// besetzt — ein Knopf «In neuem Reiter» weckt die Erwartung eines
// BROWSER-Tabs, und was hier entsteht, ist eine zweite Fläche IN derselben
// Seite. «Fenster» beschreibt, was man sieht, und passt zu «Hauptfenster»,
// das die Griffleiste ohnehin schon sagt.
//
// GEÄNDERT WIRD HIER NUR DIE LESER-EIGENE STELLE. Topbar und Pane-Griffleiste
// (`components/layout/**`) tragen die ganze App und sind in diesem Nachzug
// TABU; ihr Nachzug steht als S-Zeile im Fahrplan (Ä118, App-Hälfte). Die
// Buchführung darunter heisst weiter `merkeTab`/`lib/tabs` — ein
// Datei-/Symbol-Umbenennen ist H5, nicht Sache einer Beschriftungs-Säuberung.

export function ReiterAktion({ kuerzel, onGeoeffnet }: {
  /** Etikett des Reiters — was im Reiter-Menü stehen soll. */
  kuerzel: string;
  /** Bestätigung anstossen (Toast an, Timer im Modell zurücksetzen). */
  onGeoeffnet: () => void;
}) {
  const navigate = useNavigate();
  return (
    <button type="button"
      onClick={() => {
        const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
        merkeTab(ziel, kuerzel);
        navigate(ziel);
        onGeoeffnet();
      }}
      className="lc-chip hover:text-brass-700"
      title="Diesen Erlass zusätzlich in einem zweiten Fenster öffnen">⧉ In neuem Fenster</button>
  );
}
