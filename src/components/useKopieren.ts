import { useEffect, useRef, useState } from 'react';

// ─── Kopier-Hook (FAHRPLAN-BEGRUENDUNGS-ABSATZ B2-1) ────────────────────────
// Geteilte Copy-to-Clipboard-Mechanik: «Kopiert ✓» erst NACH erfolgreichem
// Schreiben. Eine abgewiesene Clipboard-Berechtigung (Promise-Rejection) oder
// eine fehlende API darf keinen Erfolg vortäuschen (Review-Befund 6.6.2026).

/**
 * Wie lange die Kopier-Quittung stehen bleibt — EINE Zahl für die ganze App.
 *
 * GEMESSEN (Design-Konsistenz R3-α/B3-9, 31.8.2026): dieselbe Rückmeldung lief
 * mit DREI Verweildauern — 1500 ms (GerichtszitatForm, Dokumentmappe,
 * ArtikelLeser), 1600 ms (dieser Hook, LinkTeilenButton), 2000 ms
 * (useWizardState, Kontakt, EntscheidLeser). Wie lange eine Quittung steht, ist
 * eine Design-Entscheidung und keine lokale Geschmacksfrage; sie stand achtmal
 * da und lief dreifach auseinander (§5).
 *
 * KANON ist der Wert des geteilten Hooks (1600 ms) — die verbreitetste Zahl und
 * zugleich die einzige, die schon eine gemeinsame Heimat hatte. Sie wird
 * EXPORTIERT (nicht nur intern verwendet), damit auch die Flächen mit eigenem
 * Kopier-Zustand — `Dokumentmappe`/`useWizardState` halten ihren Timer wegen
 * des Unmount-Aufräumens selbst, `ArtikelLeser` unterscheidet zwei Ziele —
 * dieselbe Zahl LESEN statt sie zu wiederholen.
 */
export const KOPIER_DAUER_MS = 1600;

export function useKopieren(text: string, dauerMs = KOPIER_DAUER_MS): { kopiert: boolean; kopieren: () => void } {
  const [kopiert, setKopiert] = useState(false);
  // Rücksetz-Timer als Handle halten: ohne das feuerte er nach dem Unmount ins
  // Leere, und ein zweiter Klick liess zwei Timer gleichzeitig laufen (der
  // ältere setzte die frische Quittung vorzeitig zurück). Dieselbe
  // Vorsichtsmassnahme, die `Dokumentmappe`/`useWizardState` von Hand treffen —
  // sie gehört in den geteilten Hook, sonst ist der Hook die schlechtere
  // Variante seiner eigenen Kopien (§5/§10, R3-α 31.8.2026).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const kopieren = () => {
    try {
      navigator.clipboard.writeText(text).then(() => {
        setKopiert(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setKopiert(false), dauerMs);
      }).catch(() => { /* Berechtigung verweigert/unsicherer Kontext */ });
    } catch { /* Clipboard-API nicht vorhanden */ }
  };
  return { kopiert, kopieren };
}
