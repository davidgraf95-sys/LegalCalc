// Golden-Merge für kantonale Teilläufe des Normtext-Generators (§5, §8).
//
// EINE Quelle für die Frage «welche bestehenden Golden-Schlüssel darf ein
// Teillauf verwerfen?». Vorher stand die Regel inline in
// scripts/normtext-snapshot.ts (--nur=kanton, --nur=zh) und war darum nicht
// isoliert testbar — genau die Stelle, an der der AR-1203-Verlust entstand
// (Commit 7a14fa06). Seiteneffektfreies Modul: normtext-snapshot.ts startet beim
// Import main(), kann also nicht aus einem Unit-Test importiert werden (dieselbe
// Begründung wie bei normtext/lawid-safe.ts).

/** Schlüssel-Aufbau der kantonalen Golden-Einträge: kanton/<KT>/<lawIdSafe>/<anker>. */
const SEGMENTE_KANTON = 4;

/**
 * Erlass-Präfix eines kantonalen Golden-Schlüssels — `kanton/<KT>/<lawIdSafe>`,
 * also genau die Granularität EINER Snapshot-Datei
 * (public/normtext/kanton/<KT>-<lawIdSafe>.json).
 *
 * Gibt `null` für alles, was kein kantonaler Artikel-Schlüssel ist (bund/*,
 * Fremdformat) — solche Schlüssel sind für einen Kantons-Teillauf nie ersetzbar.
 */
export function erlassPraefix(key: string): string | null {
  const teile = key.split('/');
  if (teile[0] !== 'kanton' || teile.length < SEGMENTE_KANTON) return null;
  return teile.slice(0, 3).join('/');
}

export interface GoldenKantonMerge {
  /** Der neue Golden-Bestand (unsortiert; der Aufrufer sortiert wie bisher). */
  gemischt: Record<string, string>;
  /** Erlass-Präfixe der Ziel-Kantone, deren Altbestand ersetzt wurde. */
  ersetzt: string[];
  /** Erlass-Präfixe der Ziel-Kantone OHNE frische Einträge — Altbestand bewahrt. */
  bewahrt: string[];
  /** Ziel-Kantone, die im Lauf KEINEN einzigen frischen Eintrag lieferten. */
  fehlgeschlageneKantone: string[];
}

/**
 * Mischt den bestehenden Golden-Index mit dem frischen Lauf-Index eines
 * Kantons-Teillaufs.
 *
 * @param bestand  committeter Golden-Index (golden/normtext-snapshot.json)
 * @param frisch   Lauf-Index: nur die in DIESEM Lauf erzeugten Snapshot-Knoten
 * @param kantone  Ziel-Kantone des Teillaufs (--kanton=…)
 */
export function mischeGoldenKanton(
  bestand: Record<string, string>,
  frisch: Record<string, string>,
  kantone: ReadonlySet<string>,
): GoldenKantonMerge {
  // §8 (kein stiller Datenverlust). Ersetzbarkeit wird je ERLASS bestimmt, nicht
  // je Kanton: verworfen wird nur der Altbestand jener Snapshot-Dateien, die
  // DIESER Lauf tatsächlich neu erzeugt hat.
  //
  // WARUM NICHT je Kanton (der Defekt, Commit 7a14fa06): ein Kanton wird über
  // MEHRERE Routen erschlossen — AR z. B. über LexWork UND die PDF-Route
  // (olexAt). `--discovery` fährt aber nur die LexWork-Phase
  // (normtext-snapshot.ts ~995-1001). Kantons-Granularität verwarf deshalb auch
  // die Golden-Schlüssel der PDF-Routen-Erlasse, obwohl deren Snapshot-Dateien
  // unangetastet auf der Platte blieben: 59 Schlüssel von
  // public/normtext/kanton/AR-1203.json verloren, Drift-Basis weg (§7 lit. d),
  // ohne dass ein Tor es sah (heute sieht es check:golden-normtext).
  //
  // WARUM AUS DEM LAUF-INDEX ABGELEITET und nicht aus den Flags: die Frage
  // «welche Routen liefen?» müsste bei jedem neuen Teillauf-Schalter erneut
  // richtig beantwortet werden. Der Lauf-Index sagt es selbst — er enthält genau
  // die neu erzeugten Knoten. Ein Erlass, der in diesem Lauf 0 Knoten lieferte
  // (nicht gefahren, Fetch-Fehler, Extraktion leer), behält seinen Altbestand.
  //
  // Die INNER-Erlass-Purge bleibt erhalten: bei einem ersetzten Erlass fallen
  // weggefallene Artikel-Schlüssel (Anker-Rename, Anhang-Reorg) weiterhin weg,
  // sonst verwaisen sie (check:golden-normtext (b)).
  const frischePraefixe = new Set<string>();
  for (const k of Object.keys(frisch)) {
    const p = erlassPraefix(k);
    if (p !== null) frischePraefixe.add(p);
  }
  const istErsetzbar = (key: string): boolean => {
    const p = erlassPraefix(key);
    return p !== null && kantone.has(p.split('/')[1]) && frischePraefixe.has(p);
  };

  const gemischt: Record<string, string> = {};
  for (const k of Object.keys(bestand)) if (!istErsetzbar(k)) gemischt[k] = bestand[k];
  for (const k of Object.keys(frisch)) gemischt[k] = frisch[k];

  const erfolgKantone = new Set(Object.keys(frisch).map((k) => k.split('/')[1]));
  const zielPraefixe = new Set<string>();
  for (const k of Object.keys(bestand)) {
    const p = erlassPraefix(k);
    if (p !== null && kantone.has(p.split('/')[1])) zielPraefixe.add(p);
  }

  return {
    gemischt,
    ersetzt: [...zielPraefixe].filter((p) => frischePraefixe.has(p)).sort(),
    bewahrt: [...zielPraefixe].filter((p) => !frischePraefixe.has(p)).sort(),
    fehlgeschlageneKantone: [...kantone].filter((k) => !erfolgKantone.has(k)).sort(),
  };
}
