// ─── Lese-Brücke «Änderungen / Revisionen» (Amtliche Sammlung, Paket 5, W2·6-REV) ──
//
// Projiziert die generierte Revisions-Timeline eines Erlasses aus dem lazy geladenen
// Sidecar public/normtext/revisionen/<KEY>.json auf die Norm. Reine Ladeschicht (§3) —
// kein Inhalt erzeugt, keine Rechtslogik. Schwester zur Entstehungsgeschichte
// (materialien/botschaften.ts): Botschaft = Genese-Absicht, AS-Erlass = tatsächliche
// Änderung. Der Botschafts-Verweis wird NICHT hier aufgelöst (kein zweiter Fetch),
// sondern im KontextPanel gegen die ohnehin geladenen Botschaften gemappt (botschaftKey).
//
// §15: der Sidecar wird erst bei Bedarf (Reader offen) geladen; nie im App-Bundle.
// Übergangslösung bis E1 (dann Projektion aus erlass_fassungen) — siehe Generator.

/** Ein Timeline-Eintrag in Anzeige-Form (Feld-Teilmenge des Sidecars). */
export interface RevisionBezug {
  /** 'aenderung' = realer AS/oc-Änderungserlass · 'sammelerlass-marker' = Änderung über
   *  einen Sammelerlass anderer SR (nur als Datum bekannt, §8). */
  art: 'aenderung' | 'sammelerlass-marker';
  dateEntryInForce: string;
  ocUri?: string;
  roFundstelle?: string;
  titelDe?: string;
  titelFr?: string;
  titelIt?: string;
  /** Paket-2-Botschafts-Key (nur bei belegtem Match) → im UI zum «Botschaft ansehen»-Link. */
  botschaftKey?: string;
  /** In Kraft, aber noch nicht in den geltenden (gepinnten) Normtext konsolidiert (§8). */
  nichtKonsolidiert?: boolean;
  /** Fedlex-Live-Link auf den AS-Text bzw. die amtliche Sammlung (§7c). */
  quelleUrl: string;
}

interface RevisionSidecar {
  erlassKey: string;
  sr: string;
  abgerufen: string;
  reichweite: string;
  revisionen: RevisionBezug[];
}

// Sidecar-Cache je Erlass-Key: laufende Promise (ein Fetch je Key/Session).
// `undefined` = Ladefehler (Fetch-Fehler ≠ leer, §8) — im UI unterscheidbar von «keine».
const cache = new Map<string, Promise<RevisionSidecar | null>>();

function ladeSidecar(key: string): Promise<RevisionSidecar | null> {
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/normtext/revisionen/${encodeURIComponent(key)}.json`);
        if (!res.ok) return null;
        const s = (await res.json()) as RevisionSidecar;
        return Array.isArray(s.revisionen) ? s : null;
      } catch {
        return null;
      }
    })();
    cache.set(key, p);
  }
  return p;
}

/** Zusammengeführte Timeline (Datum absteigend), Reichweiten-Hinweis. */
export interface RevisionAnsicht {
  revisionen: RevisionBezug[];
  reichweite: string | null;
}

/**
 * Revisions-Timeline zu EINER oder mehreren Normen (lazy). Mehrere normKeys werden über
 * die ocUri (bzw. das Datum bei Markern) dedupliziert und nach Datum absteigend gemischt.
 * `null` = ALLE Sidecars konnten nicht geladen werden (Fetch-Fehler, §8) → ehrlicher
 * Fehlerzustand; leeres `revisionen` = keine erfasste Änderung (Verordnung o. Ä.).
 */
export async function revisionenFuerNorm(normKeys: readonly string[]): Promise<RevisionAnsicht | null> {
  const sidecars = await Promise.all(normKeys.map(ladeSidecar));
  if (sidecars.every((s) => s === null)) return null;

  const seen = new Set<string>();
  const out: RevisionBezug[] = [];
  let reichweite: string | null = null;
  for (const s of sidecars) {
    if (!s) continue;
    reichweite ??= s.reichweite;
    for (const r of s.revisionen) {
      const id = r.ocUri ?? `${r.art}:${r.dateEntryInForce}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(r);
    }
  }
  out.sort((a, b) =>
    a.dateEntryInForce < b.dateEntryInForce ? 1
    : a.dateEntryInForce > b.dateEntryInForce ? -1
    : a.art < b.art ? -1 : a.art > b.art ? 1
    : (a.ocUri ?? '') < (b.ocUri ?? '') ? -1 : (a.ocUri ?? '') > (b.ocUri ?? '') ? 1 : 0);
  return { revisionen: out, reichweite };
}

/**
 * W2·5m-LESER-V3/S3 (F5): frühestes Inkrafttreten unter den NICHT konsolidierten
 * Revisionen — das Datum, das der Erlass-Kopf im Klartextsatz «Fedlex hat eine
 * seit TT.MM.JJJJ geltende Änderung noch nicht in den Text eingearbeitet» nennt.
 *
 * `null` = keine nicht konsolidierte Änderung. Rein und deterministisch (§2):
 * ISO-Daten sortieren lexikografisch = chronologisch, kein `Date.now()`, und
 * hier wird NICHT abgeleitet, ob etwas konsolidiert ist — das entscheidet allein
 * der Generator (`scripts/normtext/revisionen-generieren.ts`,
 * `dateEntryInForce > korpusStand`); sein Marker wird nur ausgewertet.
 *
 * §8: Ist der Marker gesetzt, das Datum aber kein ISO-Datum, liefert die Funktion
 * `null` — der Satz nennt dann schlicht kein Datum, statt eines zu erfinden. Die
 * TATSACHE bleibt davon unberührt sichtbar (sie hängt am Marker, nicht am Datum).
 */
export function fruehestesNichtKonsolidiert(
  revisionen: readonly RevisionBezug[] | undefined,
): string | null {
  const daten = (revisionen ?? [])
    .filter((r) => r.nichtKonsolidiert && /^\d{4}-\d{2}-\d{2}$/.test(r.dateEntryInForce))
    .map((r) => r.dateEntryInForce)
    .sort();
  return daten[0] ?? null;
}

/** Locale-Titel eines Eintrags (DE Fallback). Rein. */
export function revisionTitel(r: RevisionBezug, locale: 'de' | 'fr' | 'it'): string | undefined {
  return (locale === 'fr' && r.titelFr) || (locale === 'it' && r.titelIt) || r.titelDe;
}
