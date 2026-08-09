import type { ErlassKopf } from '../../lib/normtext/browse';

// ═══ ABSCHNITT · Daten und reine Ableitungen der Erlass-Übersicht ════════════
// (W2·19-GLIEDERUNG/S6, Bau-Spec §5.1)
//
// Eigene Datei, weil `parts/ErlassUebersicht.tsx` sonst neben der Komponente
// auch Konstanten und Funktionen exportierte — das bricht Fast Refresh
// (eslint `react-refresh/only-export-components`). Hier lebt alles, was OHNE
// React auskommt und einzeln unit-testbar ist; die Komponente konsumiert es.
// Reine Darstellungs-Vorstufe (§3): kein Rechtsinhalt, keine Heuristik.

// ─── §8-Ehrlichkeit: belegte Teilerfassung einzelner Erlasse ─────────────────
//
// Entscheid David 8.8.2026 (Bau-Spec §11 Ziff. 2, Wortlaut des angenommenen
// Vorschlags: «Option A — sofort ehrlicher §8-Hinweis ‹Auswahl, nicht
// vollständig› in der Erlass-Übersicht (kein Korpus-Eingriff) + separater
// Korpus-Prüfauftrag»). Die neue Seitenleiste macht die Lücke erstmals
// sichtbar; bis der Korpus geprüft ist, sagt die UI sie an, statt sie zu
// verschweigen.
//
// FORM nach dem Vorbild `ENUMERATIONS_BELEGE` (src/lib/normtext/erfassungsgrad.ts):
// ein EMPIRISCH BELEGTER Fakt mit Prüfdatum — kein `if (key === …)`-Codepfad,
// keine Heuristik (§2/§8). Die amtliche Quelle-URL steht bewusst NICHT hier,
// sie kommt zur Laufzeit aus `erlass.quelleUrl`: keine zweite Quell-Wahrheit
// (§5), nichts Erfundenes (§7).
//
// PROVENIENZ des einen Eintrags (gemessen am committeten Snapshot
// `public/normtext/kanton/SG-3849.json`, 607 Einträge, 9.8.2026): nur 17 der
// 607 Einträge tragen überhaupt eine Erlass-Artikelnummer, und deren Folge ist
// grob lückenhaft — 2, 7, 11, 12, 13, 15, 19, 43, 51, 71, 80, 82, 84, 381, 505,
// 544, 1032. Art. 1 fehlt, ebenso alles dazwischen; die übrigen 590 Einträge
// sind Anhang-Ziffern.
//
// KORREKTUR gegenüber der ersten Fassung dieses Eintrags (§7 in Aktion): sie
// behauptete «erfasst sind die Artikel 2 und 7» — das war eine zu enge Sonde
// (Token-Filter statt Label-Filter), und der Test hat sie sofort rot gemacht.
// Der Wortlaut nennt darum die MESSBARE Eigenschaft «lückenhaft» statt einer
// Liste, die beim nächsten Korpus-Lauf falsch wäre.
//
// AUFLÖSUNG: der Eintrag verschwindet, sobald der Korpus-Prüfauftrag (Bau-Spec
// §11 Ziff. 2, Roadmap-Nachtrag in S10) den Erlass vollständig erfasst hat —
// sein natürlicher Ort ist danach der Generator, nicht die Darstellungsschicht.
export interface TeilerfassungsBeleg {
  /** Der §8-Satz, den die UI zeigt. Beschreibt den MESSBAREN Befund, kein Urteil. */
  befund: string;
  /** Prüfdatum des Befunds (ISO) — er gilt für den Snapshot dieses Standes. */
  geprueftAm: string;
}

export const TEILERFASSUNG_BELEGE: Readonly<Record<string, TeilerfassungsBeleg>> = Object.freeze({
  'SG-3849': {
    befund: 'Auswahl, nicht vollständig: die erfasste Artikel-Folge beginnt nicht bei Art. 1 und ist lückenhaft; der weitaus grösste Teil der Einträge sind Anhang-Ziffern. Was hier fehlt, steht in der amtlichen Fassung.',
    geprueftAm: '2026-08-09',
  },
});

/** Ein Erlass-Snapshot ist belegt teilerfasst (§8) — sonst `undefined`. */
export function teilerfassung(erlassKey: string): TeilerfassungsBeleg | undefined {
  return TEILERFASSUNG_BELEGE[erlassKey];
}

// ─── Reine Ableitungen aus dem Erlass-Kopf / Register ────────────────────────

/**
 * Das amtliche Datum ohne den nachgestellten Stand-Zusatz. Die Sidecar-Zeile
 * lautet «vom 10. Dezember 1907 (Stand am 1. Juli 2026)» — der Stand steht in
 * der Zeile direkt darunter mit seinem maschinellen Wert, hier wäre er eine
 * Dopplung. Der amtliche Wortlaut selbst bleibt unangetastet (§7): geschnitten
 * wird ausschliesslich diese eine, formelhafte Klammer am Ende; der volle
 * String bleibt über `title` erreichbar (§8, kein stiller Verlust).
 */
export function nurErlassdatum(erlassdatum: string): string {
  return erlassdatum.replace(/\s*\(Stand am [^)]*\)\s*$/, '').trim();
}

/** Das erlassgebende Organ aus der amtlichen Präambel (ohne Schluss-Komma). */
export function erlassOrgan(kopf: ErlassKopf | null): string | null {
  const zeile = kopf?.praeambel?.find((z) => z.rolle === 'autor')?.text?.trim();
  if (!zeile) return null;
  return zeile.replace(/[,;]\s*$/, '');
}

/**
 * Fedlex-Fassungs-Token sind achtstellige Konsolidierungs-Daten («20260101»)
 * und als solche lesbar; kantonale Snapshots führen an derselben Stelle einen
 * SHA-256-Drift-Hash. Beide sind Provenienz (§7d), aber nur das Datum gehört in
 * die einzeilige Kurzform — der Hash steht ausgeschrieben im «Mehr»-Block.
 */
export function istDatumsToken(token: string): boolean {
  return /^\d{8}$/.test(token);
}
