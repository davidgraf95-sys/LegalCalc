/**
 * Fixture-Zugriff auf die Normtext-Snapshots — mit ZEICHENGENAUER Schlüssel-Prüfung.
 *
 * ANLASS (CI-Rot 9.8.2026, PR #478, Job 93172104780): Vier Modell-Fälle luden
 * `public/normtext/bund/VwVG.json` und `.../ChemRRV.json`. Getrackt sind die
 * Dateien aber als `VWVG.json` und `CHEMRRV.json` — `VwVG`/`ChemRRV` ist das
 * KÜRZEL des Erlasses, nicht sein Schlüssel (Register: `key: 'VWVG'`,
 * `kuerzel: 'VwVG'`). Beides steht in der Bau-Spec nebeneinander, und aus der
 * Prosa ist die Kürzel-Schreibweise in den Code gewandert.
 *
 * WARUM DAS LOKAL NIE AUFFIEL: macOS legt das Repo auf einem
 * case-insensitiven Dateisystem ab — `readFileSync('…/VwVG.json')` findet dort
 * `VWVG.json` klaglos. Der Linux-CI ist case-sensitiv und meldet ENOENT. Die
 * Fälle waren also nicht «flaky», sondern auf jeder Maschine deterministisch:
 * lokal grün, im CI rot. Ein `existsSync`-Wächter hätte daran nichts geändert —
 * er ist lokal genauso blind wie das Lesen selbst.
 *
 * WURZEL-FIX: Der Schlüssel wird gegen `public/normtext/register.json`
 * aufgelöst, und zwar zeichengenau. Das Register ist die eine Wahrheit über den
 * Korpus (§5) und trägt zu jedem Erlass den Dateipfad; es kennt 1469 Einträge,
 * also auch jeden Kantons-Erlass. Ein Tippfehler oder eine Kürzel/Schlüssel-
 * Verwechslung wird damit AUF JEDER Maschine rot, mit einer Meldung, die den
 * richtigen Schlüssel nennt — die Fehlerklasse «lokal grün, CI rot» kann für
 * Fixtures nicht wiederkehren.
 *
 * Grenze, ehrlich benannt (§8): geprüft wird die Schlüssel-Identität gegen das
 * Register, nicht der git-Tracking-Status. Eine Datei, die im Register steht
 * und trotzdem nicht committet wäre, fiele hier nicht auf — dafür ist
 * `check:vollstaendigkeit` zuständig, nicht ein Test-Helfer.
 */
import { readFileSync } from 'node:fs';
import type { StrukturMap } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';

interface RegisterEintrag { key: string; kuerzel?: string; ebene: string; datei?: string }

let registerCache: Map<string, RegisterEintrag> | null = null;

function register(): Map<string, RegisterEintrag> {
  if (registerCache) return registerCache;
  const roh = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as
    { erlasse?: RegisterEintrag[] } | RegisterEintrag[];
  const liste = Array.isArray(roh) ? roh : (roh.erlasse ?? []);
  registerCache = new Map(liste.map((e) => [e.key, e]));
  return registerCache;
}

/**
 * Löst einen Erlass-Schlüssel auf und wirft mit klarer Meldung, wenn er so
 * nicht existiert. Bei einer reinen Schreibweisen-Abweichung nennt die Meldung
 * den richtigen Schlüssel — das ist der Fall, der den CI gekostet hat.
 */
export function pruefeErlassSchluessel(key: string): RegisterEintrag {
  const eintrag = register().get(key);
  if (eintrag) return eintrag;
  const treffer = [...register().values()].find(
    (e) => e.key.toLowerCase() === key.toLowerCase() || e.kuerzel === key,
  );
  if (treffer) {
    throw new Error(
      `Fixture «${key}» gibt es nicht — gemeint ist der Schlüssel «${treffer.key}»`
      + (treffer.kuerzel ? ` (Kürzel «${treffer.kuerzel}»)` : '')
      + '. Schlüssel und Kürzel sind zwei verschiedene Felder, und die Schreibweise muss'
      + ' zeichengenau stimmen: macOS findet die Datei case-insensitiv, der Linux-CI nicht.',
    );
  }
  throw new Error(
    `Fixture «${key}» steht nicht im Normtext-Register — als Fixture taugen nur Erlasse,`
    + ' die im Repo geführt sind (public/normtext/register.json).',
  );
}

/**
 * Snapshot + Struktur-Sidecar eines Referenz-Erlasses. Ein fehlendes Sidecar ist
 * ein benannter Normalfall (T10: 42 Kantons-Snapshots haben keines) und liefert
 * `null`; ein fehlender oder falsch geschriebener SCHLÜSSEL wirft.
 */
export function ladeNormFixture(ebene: 'bund' | 'kanton', key: string): {
  eintraege: NormSnapshot[]; struktur: StrukturMap | null;
} {
  pruefeErlassSchluessel(key);
  const eintraege = (JSON.parse(readFileSync(`public/normtext/${ebene}/${key}.json`, 'utf8')) as {
    eintraege: NormSnapshot[];
  }).eintraege;
  let struktur: StrukturMap | null;
  try {
    struktur = (JSON.parse(readFileSync(`public/normtext/struktur/${ebene}/${key}.json`, 'utf8')) as {
      artikel: StrukturMap;
    }).artikel;
  } catch {
    struktur = null; // kein Sidecar — T10, kein Fehler
  }
  return { eintraege, struktur };
}
