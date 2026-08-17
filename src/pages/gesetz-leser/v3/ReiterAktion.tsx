import { useNavigate } from 'react-router-dom';
import { naechsteInstanz, merkeTab } from '../../../lib/tabs';

// ─── «⧉ In neuem Reiter» — Aktion des Erlass-Kopfs ──────────────────────────
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
      title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
  );
}
