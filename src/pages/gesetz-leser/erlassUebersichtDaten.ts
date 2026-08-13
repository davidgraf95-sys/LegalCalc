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
// ZWEITE KORREKTUR (W2·19B-KORPUS, 13.8.2026 — der Prüfauftrag selbst): Die
// Annahme «teilerfasst/lückenhaft» ist WIDERLEGT. Gegen die amtliche Quelle
// geprüft (gesetzessammlung.sg.ch, Portal-API `texts_of_law/821.5` und das
// amtliche PDF der Version 3849, Stand 1. Januar 2026):
//   · SG-3849 ist der Gebührentarif für die Kantons- und Gemeindeverwaltung
//     (GebT, sGS 821.5) — NICHT die GB-GebV (sGS 914.5), die das `erlass`-Feld
//     des Snapshots fälschlich mitnennt (eigener Mangel, siehe Rückgabe).
//   · Der GebT führt AMTLICH KEINE EIGENEN ARTIKEL. Sein Textkörper ist
//     durchgehend nach Gebühren-Nummern (10.01 … 70.11) gegliedert. Es fehlt
//     also nichts «zwischen Art. 2 und Art. 7» — es gibt gar keine Artikel.
//   · Alle 17 als «Art. N» geführten Einträge (2, 7, 11, 12, 13, 15, 19, 43,
//     51, 71, 80, 82, 84, 381, 505, 544, 1032) sind FEHLEXTRAKTIONEN: der
//     PDF-Pfad hat Verweise auf FREMDE Erlasse (Art. 381/505/544 ZGB,
//     Art. 1032 OR, kantonale Verordnungen) als eigene Artikel-Köpfe gelesen.
//     Stichprobe 17/17, auf zwei unabhängigen Wegen geprüft (Portal-API und
//     PDF-Volltext).
// Der Befund-Satz sagt darum jetzt die richtige Sache: nicht «da fehlt etwas»,
// sondern «was hier als Artikel steht, gehört nicht hierher».
//
// AUFLÖSUNG: der Eintrag verschwindet, sobald der PDF-Pfad die Ziffern-Tarife
// richtig liest (eigene Erkennungsregel «Nr. XX.YY am Zeilenanfang» statt des
// generischen «Art. N»-Musters) und der Snapshot ohne die 17 Phantom-Artikel
// neu erzeugt ist — sein natürlicher Ort ist danach der Generator, nicht die
// Darstellungsschicht. Bis dahin bleibt er stehen, weil die UI sonst 17
// erfundene Artikel unwidersprochen als amtlich ausgäbe (§8).
export interface TeilerfassungsBeleg {
  /** Der §8-Satz, den die UI zeigt. Beschreibt den MESSBAREN Befund, kein Urteil. */
  befund: string;
  /** Prüfdatum des Befunds (ISO) — er gilt für den Snapshot dieses Standes. */
  geprueftAm: string;
}

export const TEILERFASSUNG_BELEGE: Readonly<Record<string, TeilerfassungsBeleg>> = Object.freeze({
  'SG-3849': {
    befund: 'Fehlerhaft erfasst: dieser Gebührentarif ist amtlich durchgehend nach Gebühren-Nummern gegliedert und kennt gar keine eigenen Artikel. Die 17 hier als «Art.» geführten Einträge sind irrtümlich übernommene Verweise auf andere Erlasse; die Gebühren-Nummern selbst sind vollständig. Massgeblich ist die amtliche Fassung.',
    geprueftAm: '2026-08-13',
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
