// scripts/datenhaltung/validierung.ts
// QS-VERWENDEN V6: Formprüfung an den beiden Datei-Grenzen, an denen ein
// committetes, aber nicht typsicher erzeugtes JSON-Dokument in die
// Datenhaltungs-Logik einfliesst — `daten-manifest.json` (Quell-Riegel in
// turso-sync.ts) und `public/normtext/register.json` (ladeRegister() in
// ingest.ts). Reine Eingangs-Kontrolle (§2: KEINE Engine/Rechenlogik hier) —
// fehlt ein Pflichtfeld oder stimmt der Typ nicht, meldet der Aufrufer Pfad +
// Befund und bricht mit Exit 1 ab, statt mit `undefined` weiterzurechnen
// (bisher: ungeprüfter `JSON.parse(...) as T`-Typ-Cast an beiden Stellen).
//
// Schema bewusst minimal: nur die Felder, die die beiden Aufrufer TATSÄCHLICH
// lesen, als `looseObject` (Rest der Datei bleibt unvalidiert durch, §6 —
// kein Verhaltenswechsel für ungenutzte Felder).
import * as v from 'valibot';

// ─── daten-manifest.json ─────────────────────────────────────────────────────
const TabellenManifestSchema = v.looseObject({
  zeilen: v.number(),
  sha: v.string(),
});
const DatenManifestSchema = v.record(v.string(), v.record(v.string(), TabellenManifestSchema));
export type DatenManifest = v.InferOutput<typeof DatenManifestSchema>;

/** Parst + validiert ein Dump-Manifest (`daten-manifest.json`). Bei Formfehler:
 *  Meldung mit `pfad` nach stderr, Prozess-Exit 1 (nie stiller Fallback). */
export function parseDatenManifest(roh: unknown, pfad: string): DatenManifest {
  const ergebnis = v.safeParse(DatenManifestSchema, roh);
  if (!ergebnis.success) {
    console.error(`${pfad}: ungültiges Manifest-Format —\n${v.summarize(ergebnis.issues)}`);
    process.exit(1);
  }
  return ergebnis.output;
}

// ─── public/normtext/register.json ───────────────────────────────────────────
const RegisterErlassSchema = v.looseObject({
  key: v.string(),
  ebene: v.string(),
  kanton: v.nullable(v.string()),
  sr: v.nullable(v.string()),
  titel: v.string(),
  rechtsgebiet: v.string(),
  status: v.string(),
});
const RegisterSchema = v.looseObject({
  erzeugt: v.string(),
  erlasse: v.array(RegisterErlassSchema),
});
export type Register = v.InferOutput<typeof RegisterSchema>;
export type RegisterErlass = v.InferOutput<typeof RegisterErlassSchema>;

/** Parst + validiert das Browse-Manifest (`public/normtext/register.json`).
 *  Bei Formfehler: Meldung mit `pfad` nach stderr, Prozess-Exit 1. */
export function parseRegister(roh: unknown, pfad: string): Register {
  const ergebnis = v.safeParse(RegisterSchema, roh);
  if (!ergebnis.success) {
    console.error(`${pfad}: ungültiges Register-Format —\n${v.summarize(ergebnis.issues)}`);
    process.exit(1);
  }
  return ergebnis.output;
}
