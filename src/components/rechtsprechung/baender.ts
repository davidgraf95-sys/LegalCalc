import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';

// ─── W2·10-UI-NAV/J1 · Band-/Jahr-Gruppierung für die Sprungleiste ───────────
//
// Fahrplan J1: «Jahr/Band-Sprungleiste (152/151/150 … — Juristen denken in
// Bänden)». Reine Projektion bestehender Manifest-Felder (§3) — keine
// Rechtslogik, keine Sortierung, keine Datenänderung. Wohnt bei den anderen
// reinen Darstellungs-Helfern dieser Rubrik (`format.ts`, `richterAuswahl.ts`).
//
// GRUPPIERUNGSSCHLÜSSEL IST DAS JAHR, nicht der Band — mit Absicht:
//   · Das Jahr steht auf JEDEM Eintrag (`datum`), der BGE-Band nur auf den
//     amtlich publizierten (`bgeReferenz`). Eine Leiste über `bgeReferenz`
//     liesse alle kantonalen Entscheide ohne Sprungziel — bei 3'765 BS-Einträgen
//     wäre das der grössere Teil der Liste.
//   · Band und Jahr korrelieren, sind aber nicht dasselbe. Statt beides zu
//     vermischen, trägt eine Jahres-Gruppe den Band ALS ZUSATZ, sobald ihre
//     BGE-Einträge eindeutig EINEN Band nennen («2026 · BGE 152»). Ist die
//     Gruppe uneindeutig oder ohne BGE, steht schlicht das Jahr (§8: nichts
//     behaupten, was die Daten nicht hergeben).
//
// `datumUnbekannt`-Einträge (BS §3.3/§7.2) behalten ihr Jahr: unbekannt ist der
// TAG, nicht das Jahr — `datumAnzeige` zeigt sie folgerichtig als «2024, o. D.».

/** Jahr eines Eintrags als Gruppenschlüssel (ISO «YYYY-…» → «YYYY»). */
export function jahrVon(e: BrowseEntscheid): string {
  return /^(\d{4})/.exec(e.datum)?.[1] ?? e.datum;
}

/** BGE-Band einer Referenz («152 IV 14» → «152»); null, wenn keine BGE-Referenz. */
export function bandVon(e: BrowseEntscheid): string | null {
  if (!e.bgeReferenz) return null;
  return /^(\d+)/.exec(e.bgeReferenz.trim())?.[1] ?? null;
}

export interface BandGruppe {
  /** Gruppenschlüssel = Jahr (auch der Anker-Wert im DOM). */
  jahr: string;
  /** Chip-Beschriftung: «2026» oder «2026 · BGE 152». */
  label: string;
  /** Zahl der Einträge dieser Gruppe (Verweis-Einträge zählen nicht mit). */
  count: number;
  /** Index des ERSTEN Eintrags der Gruppe in der übergebenen Liste — das
   *  Sprungziel muss geladen sein, bevor dorthin gescrollt werden kann. */
  ersterIndex: number;
}

/**
 * Gruppen in der REIHENFOLGE DER LISTE bilden (nicht neu sortieren): die Leiste
 * spiegelt die sichtbare Ordnung, egal welcher Sortierung der Nutzer folgt.
 * Springt die Liste zwischen Jahren hin und her (z. B. Sortierung «Relevanz»),
 * entstünden Doppelgruppen — dann trägt die Leiste keine verlässliche Ordnung
 * und der Aufrufer blendet sie aus (`istChronologisch`).
 */
export function zaehleBaender(liste: BrowseEntscheid[]): BandGruppe[] {
  const gruppen: BandGruppe[] = [];
  // Band-Kandidaten je Jahr sammeln, um am Schluss auf Eindeutigkeit zu prüfen.
  const baender = new Map<string, Set<string>>();
  liste.forEach((e, i) => {
    const jahr = jahrVon(e);
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.jahr === jahr) {
      if (!e.verweis) letzte.count += 1;
    } else {
      gruppen.push({ jahr, label: jahr, count: e.verweis ? 0 : 1, ersterIndex: i });
    }
    const band = bandVon(e);
    if (band) {
      const menge = baender.get(jahr) ?? new Set<string>();
      menge.add(band);
      baender.set(jahr, menge);
    }
  });
  for (const g of gruppen) {
    const menge = baender.get(g.jahr);
    // Band nur anschreiben, wenn er für dieses Jahr EINDEUTIG ist (§8).
    if (menge && menge.size === 1) g.label = `${g.jahr} · BGE ${[...menge][0]}`;
  }
  return gruppen;
}

/**
 * true, wenn die Jahres-Gruppen streng monoton laufen — jedes Jahr also genau
 * EINMAL vorkommt. Nur dann ist eine Sprungleiste ehrlich: sonst gäbe es zu
 * einem Chip mehrere Fundstellen und der Sprung landete willkürlich in der
 * ersten. Die Leiste erscheint darum ausschliesslich bei chronologischer Sicht.
 */
export function istChronologisch(gruppen: BandGruppe[]): boolean {
  return new Set(gruppen.map((g) => g.jahr)).size === gruppen.length;
}
