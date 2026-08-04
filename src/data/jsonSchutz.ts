// ─── Strukturelle Guards für JSON-Importe (QS-CODE-AUSSENKANTEN) ────────────
//
// Anlass (Code-Inventur 4.8.2026): 9 `as unknown as`-Blindcasts an den lazy
// geladenen JSON-Verzeichnissen in src/data — driftete die Generator-Struktur
// (plz-generieren.ts, zh-strassen-generieren.ts, …), schwieg der Compiler und
// die Auflösung fiel STILL auf null zurück (§8-Verstoss: Lücke ohne Ausweis).
//
// Muster: Jedes Datenmodul deklariert einen `JsonPruefer` (Wurzelform + Form
// eines Eintrags) und lädt über `pruefeJson` — das prüft die Wurzel und eine
// deterministische Stichprobe der Einträge zur LADEZEIT (billig, fängt
// Struktur-Drift, da die Generatoren homogene Einträge schreiben). Die VOLLE
// Prüfung aller Einträge fährt `pruefeJsonVoll` in
// src/tests/datenAussenkanten.test.ts — Drift bricht damit die CI, nicht erst
// den Nutzer-Lookup. Reine Strukturprüfung, keine Fachlogik (§3).

export interface JsonPruefer {
  /** Anzeigename der Quelle in der Fehlermeldung, z. B. 'plz/plzVerzeichnis.json'. */
  quelle: string;
  /** Befund zur Wurzelform — null = in Ordnung, sonst Beschreibung des Defekts. */
  wurzel(wert: unknown): string | null;
  /** Befund zu EINEM Eintrag (Schlüssel + Wert der Wurzel-Record). */
  eintrag?(schluessel: string, wert: unknown): string | null;
}

const STICHPROBE = 25;

export function istRecord(w: unknown): w is Record<string, unknown> {
  return typeof w === 'object' && w !== null && !Array.isArray(w);
}

function pruefe(wert: unknown, p: JsonPruefer, alleEintraege: boolean): void {
  const wurzelBefund = p.wurzel(wert);
  if (wurzelBefund !== null) {
    throw new Error(`jsonSchutz ${p.quelle}: ${wurzelBefund}`);
  }
  if (p.eintrag && istRecord(wert)) {
    const schluessel = Object.keys(wert);
    const zuPruefen = alleEintraege ? schluessel : schluessel.slice(0, STICHPROBE);
    for (const k of zuPruefen) {
      const befund = p.eintrag(k, wert[k]);
      if (befund !== null) {
        throw new Error(`jsonSchutz ${p.quelle} · Eintrag «${k}»: ${befund}`);
      }
    }
  }
}

/** Ladezeit-Guard: Wurzel + Stichprobe. Wirft mit benannter Quelle statt
 *  still falsch zu typisieren. */
export function pruefeJson<T>(wert: unknown, p: JsonPruefer): T {
  pruefe(wert, p, false);
  return wert as T;
}

/** Vollprüfung ALLER Einträge — für die CI-Testbatterie. */
export function pruefeJsonVoll<T>(wert: unknown, p: JsonPruefer): T {
  pruefe(wert, p, true);
  return wert as T;
}
