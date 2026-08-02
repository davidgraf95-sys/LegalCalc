import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { planeLiveSync, LIVE_SYNC_DEBOUNCE_MS } from '../lib/liveUrlSync';

// ─── LM-205: Live-URL-Sync des Rechenzustands ───────────────────────────────
// planeLiveSync ist die reine Entscheidungs-/Timer-Funktion hinter dem
// debounced replaceState in LinkTeilenButton (keine React-/Router-Abhängigkeit
// nötig — testbar ohne DOM/Renderer, konsistent mit der übrigen Testsuite
// dieses Repos, die auf reine Logikfunktionen statt Komponenten-Interaktion
// setzt). Simuliert einen React-Render-Zyklus: jeder Aufruf entspricht einem
// `useEffect`-Lauf, dessen zurückgegebene Aufräumfunktion — wie bei React —
// vor dem nächsten Aufruf ausgeführt wird.

describe('planeLiveSync (LinkTeilenButton) — LM-205 Live-URL-Sync', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('schreibt nicht, wenn der kodierte Query bereits der aktuellen Adresse entspricht', () => {
    const schreiben = vi.fn();
    const aufraeumen = planeLiveSync('?a=1', '?a=1', schreiben);
    expect(aufraeumen).toBeUndefined();
    vi.advanceTimersByTime(LIVE_SYNC_DEBOUNCE_MS + 100);
    expect(schreiben).not.toHaveBeenCalled();
  });

  it('schreibt nach der Verzögerung, wenn sich der Query von der Adresse unterscheidet', () => {
    const schreiben = vi.fn();
    planeLiveSync('?a=1', '', schreiben);
    vi.advanceTimersByTime(LIVE_SYNC_DEBOUNCE_MS - 1);
    expect(schreiben).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(schreiben).toHaveBeenCalledTimes(1);
  });

  it('Debounce: eine erneute Eingabe vor Ablauf verwirft den alten Timer (kein Zwischen-Schreiben)', () => {
    const schreiben = vi.fn();
    // 1. „Render“ nach einer Eingabe
    const aufraeumen1 = planeLiveSync('?a=1', '', schreiben);
    vi.advanceTimersByTime(200); // noch nicht abgelaufen (Default 400 ms)
    // React würde vor dem nächsten Effect-Lauf zuerst die Cleanup-Funktion
    // des vorigen Laufs ausführen — genau das simulieren wir hier.
    aufraeumen1?.();
    // 2. „Render“ nach einer weiteren Eingabe, wieder ab 0 verzögert
    planeLiveSync('?a=2', '', schreiben);
    vi.advanceTimersByTime(200);
    expect(schreiben).not.toHaveBeenCalled(); // der erste Timer wurde gelöscht, bevor er feuerte
    vi.advanceTimersByTime(200);
    expect(schreiben).toHaveBeenCalledTimes(1); // nur der letzte Stand wird geschrieben
  });

  it('Aufräumfunktion (z. B. Unmount) verhindert das Schreiben endgültig', () => {
    const schreiben = vi.fn();
    const aufraeumen = planeLiveSync('?a=1', '', schreiben);
    aufraeumen?.();
    vi.advanceTimersByTime(LIVE_SYNC_DEBOUNCE_MS + 1000);
    expect(schreiben).not.toHaveBeenCalled();
  });

  it('respektiert eine explizite Verzögerung statt des Defaults', () => {
    const schreiben = vi.fn();
    planeLiveSync('?a=1', '', schreiben, 50);
    vi.advanceTimersByTime(49);
    expect(schreiben).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(schreiben).toHaveBeenCalledTimes(1);
  });

  it('Default-Verzögerung liegt im vorgegebenen Fenster (300–500 ms)', () => {
    expect(LIVE_SYNC_DEBOUNCE_MS).toBeGreaterThanOrEqual(300);
    expect(LIVE_SYNC_DEBOUNCE_MS).toBeLessThanOrEqual(500);
  });
});
