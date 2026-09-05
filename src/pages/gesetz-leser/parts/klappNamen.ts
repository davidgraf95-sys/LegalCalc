// ═══ Eindeutige Klapp-Namen für den Gliederungsbaum ═══════════════════════
//
// QS-UI-Nachzug zu PR #683/#685 (fahrplaene/FAHRPLAN-UI-QUALITAET.md §2.4).
// Der Chevron-Knopf jeder klappbaren Zeile trägt seit PR #685 einen
// KONSTANTEN, an SICH eindeutigen Namen («Titel» auf- und zuklappen statt
// Auf-/Einklappen) — das löst die WECHSELNDE Doppel-Aussage (§0-Beispiel dort),
// aber NICHT den Fall, dass zwei VERSCHIEDENE Zeilen denselben Titel tragen:
// belegt an GEBV_HREG, wo die synthetische Anhang-Wurzel und die amtliche
// Anhang-Sektion beide «Anhänge» heissen (WCAG 4.1.2 gleicher Name, 2.4.6
// Zweck aus dem Namen nicht unterscheidbar).
//
// Reine Ableitung aus dem bereits vorhandenen Modell-Baum (§3: Darstellung,
// keine neue Fach-Entscheidung) — nur WAS sich schon aus `GliederungsKnoten[]`
// ergibt (Titel, Eltern-Titel), nichts Neues wird erfunden.

import type { GliederungsKnoten } from '../gliederungsModell';

/** Voller Anzeigetext einer Zeile: Titel plus, wenn zutreffend, das
 *  Aufgehoben-Signal — dieselbe Definition wie `title`/`aria-label` der
 *  Sprung-Zeile in SektionBaumTOC.tsx (§5: eine Stelle, kein Zweitrechner). */
export function vollText(k: GliederungsKnoten): string {
  return [k.label, k.aufgehoben ? 'aufgehoben' : ''].filter(Boolean).join(' — ');
}

/**
 * Kontext-Zusatz je Zeilen-Id, NUR für Zeilen mit Chevron (`kinder.length > 0`)
 * — nur ein Chevron trägt «… auf- und zuklappen», nur dort kann ein
 * gleichnamiger zweiter Knopf entstehen. Gesetzt wird ein Eintrag NUR, wenn
 * derselbe Titel im Baum mehr als einmal als Chevron-Zeile vorkommt; sonst
 * bleibt der Name unverändert (Auftrag: «sonst unverändert»).
 *
 * DISAMBIGUIERUNG: der nächste ELTERN-Titel, der vom eigenen abweicht — «eine
 * Chevron-Zeile namens X (Y)» dort, wo Y der nächste andersnamige Vorfahre ist.
 * DEGENERIERTER FALL (GEBV_HREG): trägt auch die gesamte Vorfahren-Kette
 * denselben Titel — hier eine synthetische Anhang-Wurzel, die genau EINE
 * amtliche Anhang-Sektion NAMENS «Anhänge» umschliesst —, gäbe es keinen
 * unterscheidenden Eltern-Titel; ein erfundener Kontext wäre eine zweite,
 * ungeprüfte Aussage über den Baum (§8). Der Fallback ist darum ein
 * Vorkommen-Zähler («1. Vorkommen» / «2. Vorkommen») statt eines geratenen
 * Orts. Offene Frage an die Abnahme: ob dieser Fallback-Wortlaut taugt, oder
 * ob der eigentliche Fund (Wurzel und Kind heissen fachlich identisch) ins
 * Modell gehört (`gliederungsModell.ts`, ausserhalb dieser Whitelist).
 */
export function berechneKlappKontext(wurzeln: GliederungsKnoten[]): Map<string, string> {
  interface ChevronEintrag { id: string; titel: string; ahnenTitel: string[] }
  const eintraege: ChevronEintrag[] = [];

  const sammle = (k: GliederungsKnoten, ahnenTitel: string[]): void => {
    const titel = vollText(k);
    if (k.kinder.length > 0) eintraege.push({ id: k.id, titel, ahnenTitel });
    const naechsteAhnen = [titel, ...ahnenTitel];
    for (const kind of k.kinder) sammle(kind, naechsteAhnen);
  };
  for (const w of wurzeln) sammle(w, []);

  const gruppen = new Map<string, ChevronEintrag[]>();
  for (const e of eintraege) {
    const liste = gruppen.get(e.titel);
    if (liste) liste.push(e); else gruppen.set(e.titel, [e]);
  }

  const kontext = new Map<string, string>();
  for (const liste of gruppen.values()) {
    if (liste.length < 2) continue; // eindeutig — Auftrag: «sonst unverändert»
    liste.forEach((e, i) => {
      const abweichenderAhn = e.ahnenTitel.find((a) => a !== e.titel);
      kontext.set(e.id, abweichenderAhn ?? `${i + 1}. Vorkommen`);
    });
  }
  return kontext;
}
