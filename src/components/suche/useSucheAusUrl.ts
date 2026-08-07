import { useCallback, useEffect, useState } from 'react';
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

// ── Reine Zustandslogik (§3, direkt unit-testbar) ───────────────────────────
//
// Das Feld und die Adresse schreiben BEIDE, darum braucht es eine Regel, wessen
// Änderung gerade gilt. Sie steht hier als reine Übergangsfunktion und nicht im
// Hook, damit sie ohne DOM durchgespielt werden kann (Muster: zustand.ts).

export interface Feldstand {
  /** Was im Eingabefeld steht — die Wahrheit über den Begriff. */
  wert: string;
  /** Zuletzt verarbeiteter Adress-Stand; die Kante, an der ein Wechsel auffällt. */
  gesehen: string;
  /**
   * Wert, den DIESER Hook zuletzt selbst in die Adresse geschrieben hat, solange
   * sein Echo noch aussteht — sonst null. Ohne die Merkung schlüge das eigene
   * (entprellte) Zurückschreiben als «fremde» Änderung ins Feld zurück und
   * überschriebe die inzwischen weitergetippten Zeichen.
   */
  selbstGeschrieben: string | null;
}

export function anfangsStand(urlQ: string): Feldstand {
  return { wert: urlQ, gesehen: urlQ, selbstGeschrieben: null };
}

/**
 * Adresse hat sich geändert → neuer Feldstand.
 *
 * Die Merkung `selbstGeschrieben` gilt für GENAU EIN Echo und verfällt, sobald
 * es eingetroffen ist. Das ist der Kern: bliebe sie stehen, würde jede spätere
 * fremde Adressänderung auf denselben Wert als eigenes Echo missdeutet — die
 * Zurück-Taste führte dann zwar auf die alte Adresse, das Feld behielte aber den
 * neuen Begriff, und der Spiegel schriebe die History-Position kurz darauf
 * wieder um (Gegenprüfungs-Befund 7.8.2026, Repro in useSucheAusUrl.test.ts).
 */
export function nachAdresse(stand: Feldstand, urlQ: string): Feldstand {
  if (urlQ === stand.gesehen) return stand;
  if (stand.selbstGeschrieben !== null && urlQ === stand.selbstGeschrieben) {
    // Eigenes Echo: Feld unverändert lassen, Merkung verbrauchen.
    return { ...stand, gesehen: urlQ, selbstGeschrieben: null };
  }
  // Fremde Änderung (Link, Header-Sprung, Zurück-Taste) gewinnt über das Feld.
  return { wert: urlQ, gesehen: urlQ, selbstGeschrieben: null };
}

/** Der Hook hat soeben selbst `?q=ziel` geschrieben — Echo ankündigen. */
export function nachEigenemSchreiben(stand: Feldstand, ziel: string): Feldstand {
  return { ...stand, selbstGeschrieben: ziel };
}

export function mitWert(stand: Feldstand, wert: string): Feldstand {
  return { ...stand, wert };
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
  const [stand, setStand] = useState<Feldstand>(() => anfangsStand(urlQ));

  // Adressänderung im RENDER verarbeiten (Repo-Muster «adjust state during
  // render»): kein Zwischenbild mit dem alten Wert. Die Bedingung wird durch
  // `gesehen` sicher falsch — kein Render-Loop.
  if (urlQ !== stand.gesehen) setStand((s) => nachAdresse(s, urlQ));

  useEffect(() => {
    if (!spiegeln) return;
    const ziel = stand.wert.trim();
    if (ziel === (params.get('q') ?? '')) return;
    const id = setTimeout(() => {
      setStand((s) => nachEigenemSchreiben(s, ziel));
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
  }, [stand.wert, spiegeln, verzoegerung, params, setParams]);

  const setWert = useCallback((wert: string) => setStand((s) => mitWert(s, wert)), []);

  return [stand.wert, setWert];
}
