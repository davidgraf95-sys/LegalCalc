import { datumCh } from '../../lib/normtext/erlassKopfText';

// Kleine, geteilte Anzeige-Helfer für Karte und Zeile (reine Darstellung, §3).

/**
 * ISO 'YYYY-MM-DD' → 'DD.MM.YYYY' (de-CH); unverändert, wenn kein ISO-Datum.
 *
 * B-3 (31.8.2026): stand hier als eigene, byte-gleiche Kopie von `datumCh`
 * (dieselbe Regex, dieselbe Rückgabe) — eine von fünf. Jetzt ein RE-EXPORT der
 * einen Quelle, unter dem hier gewohnten Namen, damit kein Aufrufer wandern
 * muss (dasselbe Muster wie `pages/gesetz-leser/helpers.tsx`, §6.1 kleinster
 * Eingriff). Die Quelle liegt in `lib/normtext/`, weil derselbe String in den
 * prerenderten SEO-Kopf muss und die Bibliotheks-Schicht nicht auf die
 * Darstellung zeigen darf (§3 — Herleitung im Kopf von `erlassKopfText.ts`).
 */
export const formatiereDatum = datumCh;

/**
 * Datums-Zelle für Karte/Zeile: ein Platzhalterdatum (datumUnbekannt, BS §7.2)
 * NIE als echtes Datum zeigen (§8) — stattdessen «JJJJ, o. D.» (Jahr aus der
 * Geschäftsnummer, ohne Datum); Tooltip via DATUM_UNBEKANNT_TITEL.
 */
export function datumAnzeige(iso: string, datumUnbekannt?: boolean): string {
  return datumUnbekannt ? `${iso.slice(0, 4)}, o. D.` : formatiereDatum(iso);
}

/** Ehrlicher Tooltip zur «o. D.»-Zelle (§8). */
export const DATUM_UNBEKANNT_TITEL =
  'Entscheiddatum nicht publiziert — Jahr aus der Geschäftsnummer';

/** Kanton-Anzeige: 'CH' → 'Bund', sonst das Kürzel. */
export function kantonLabel(kanton: string): string {
  return kanton === 'CH' ? 'Bund' : kanton;
}

const SPRACH_NAME: Record<string, string> = {
  de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch',
};

/**
 * Ehrlicher Tooltip für das Sprach-Badge nicht-deutscher Entscheide (§8, O-4):
 * BGer/eidg. Entscheide sind EINSPRACHIGE amtliche Originale — es gibt keine
 * deutsche Übersetzung. Das Badge nennt die Sprache, der Titel macht die
 * Einsprachigkeit explizit, damit niemand eine fehlende Übersetzung erwartet.
 */
export function spracheBadgeTitel(sprache: string): string {
  const name = SPRACH_NAME[sprache] ?? sprache.toUpperCase();
  return `${name}sprachiges amtliches Original — einsprachig, keine deutsche Übersetzung`;
}
