import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// ─── `?q=` als geteilte Suchbegriff-Achse der Browse-Seiten (UI-NAV S1) ──────
//
// Ein Suchbegriff, den man im Header eintippt, soll beim Sprung «alle N →» nicht
// verloren gehen: die Zielseite liest ihn aus der Adresse und füllt ihr eigenes
// Filterfeld damit vor. Umgekehrt (`spiegeln: true`) schreibt die Seite den
// getippten Begriff ENTPRELLT zurück in die Adresse — dann ist eine Recherche
// teilbar und übersteht das Neuladen (Rechtsprechung: zusammen mit `?rg=` & Co.).
//
// Reine Darstellungs-/Navigationsschicht (§3): kein Fachwissen, keine Rechtslogik.
//
// Warum nicht einfach `useState(() => …location.search…)` wie bisher auf
// /gesetze: der Lazy-Init greift NUR beim Mount. Steht man bereits auf /gesetze
// und springt aus dem Header-Dropdown nach `/gesetze?q=…`, mountet die Seite
// nicht neu — die Query käme nie im Feld an (genau der S1-Prüfpunkt «alle 408 →
// liefert die 408, gefiltert»). Darum wird die Adresse laufend beobachtet.
//
// Prerender/SSR: ohne Query liefert `useSearchParams` einen leeren Wert — die
// prerenderten Seiten bleiben byte-gleich.

/** Entprellung des Rückschreibens. Kurz genug, dass ein Teilen-Klick direkt nach
 *  dem Tippen den Begriff schon trägt; lang genug, dass nicht jede Taste eine
 *  History-Ersetzung auslöst. */
const SPIEGEL_MS = 300;

export interface SucheAusUrlOptionen {
  /** true: getippter Begriff wird entprellt nach `?q=` zurückgeschrieben. */
  spiegeln?: boolean;
  verzoegerung?: number;
}

/**
 * Suchbegriff-Feldzustand, an `?q=` gekoppelt.
 *
 * Rückgabe wie `useState`: [Wert, Setzer]. Der Setzer ist die Wahrheit für das
 * Feld — die Adresse folgt ihm (bei `spiegeln`), nicht umgekehrt. Eine FREMDE
 * Adressänderung (Link, Zurück-Taste, Header-Sprung) wird dagegen übernommen.
 */
export function useSucheAusUrl(
  { spiegeln = false, verzoegerung = SPIEGEL_MS }: SucheAusUrlOptionen = {},
): [string, (wert: string) => void] {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get('q') ?? '';
  const [wert, setWert] = useState(urlQ);

  // Zuletzt SELBST geschriebener Wert. Ohne diese Merkung schlüge das eigene
  // (entprellte) Zurückschreiben als «fremde» Adressänderung zurück ins Feld und
  // überschriebe die inzwischen weitergetippten Zeichen. Bewusst State und keine
  // Ref: der Abgleich unten läuft in der RENDER-Phase, und eine Ref darf dort
  // nicht gelesen werden (react-hooks/refs). Beide Setzer stehen im selben
  // Effekt und werden gebatcht — der Vergleich sieht nie einen halben Stand.
  const [selbstGeschrieben, setSelbstGeschrieben] = useState<string | null>(null);

  // Fremde Adressänderung übernehmen — Render-Phasen-Abgleich statt Effekt
  // (Repo-Muster «adjust state during render»): kein Zwischenbild mit dem alten
  // Wert.
  const [gesehen, setGesehen] = useState(urlQ);
  if (urlQ !== gesehen) {
    setGesehen(urlQ);
    if (urlQ !== selbstGeschrieben) setWert(urlQ);
  }

  useEffect(() => {
    if (!spiegeln) return;
    const ziel = wert.trim();
    if (ziel === (params.get('q') ?? '')) return;
    const id = setTimeout(() => {
      setSelbstGeschrieben(ziel);
      // Funktionale Form: baut auf dem AKTUELLEN Stand der Adresse auf, nicht auf
      // dem beim Tippen eingefangenen `params`. Sonst nähme ein gleichzeitiger
      // Facetten-Klick (eigener Schreibvorgang) den anderen zurück — dieselbe
      // Falle, die in zustand.ts/wendeAchsenAn dokumentiert ist.
      setParams((vorher) => {
        const p = new URLSearchParams(vorher);
        if (ziel) p.set('q', ziel); else p.delete('q');
        return p;
      }, { replace: true });
    }, verzoegerung);
    return () => clearTimeout(id);
  }, [wert, spiegeln, verzoegerung, params, setParams]);

  return [wert, setWert];
}
