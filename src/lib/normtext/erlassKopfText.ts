// ═══ Wortlaut des Erlass-Kopfs (W2·5m-LESER-V3 · Etappe S3, Entscheid F5) ═════
//
// EINE Quelle für die Sätze, mit denen ein Erlass seinen Fassungs- und
// Konsolidierungs-Stand ausweist (§5). Sie stehen an ZWEI Orten, die sich nie
// widersprechen dürfen:
//   · `src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx` — was der Nutzer liest,
//   · `src/lib/seo-detail.ts` (`erlassVolltextHtml`) — was die Suchmaschine liest.
// Vor S3 waren das zwei handgeschriebene Template-Strings. Sie waren bereits
// auseinandergelaufen: die UI schrieb «geltend geprüft am 14.08.2026», der
// prerenderte Kopf «geltend geprüft am 2026-08-14» — derselbe Sachverhalt in
// zwei Formen. Darum liegt hier auch die Datumsform (`datumCh`), nicht nur der
// Satzbau; sonst ist die Einheit nach dem nächsten Bau wieder weg.
//
// Warum `lib/normtext/` und nicht `pages/gesetz-leser/`: `seo-detail.ts` liegt in
// der Bibliotheks-Schicht und darf nicht auf die Seiten-Schicht zeigen (§3).
//
// REINER TEXT, KEIN RECHENPFAD (§2/§3). Hier wird nichts entschieden — weder ob
// eine Änderung konsolidiert ist (das tut der Generator
// `scripts/normtext/revisionen-generieren.ts` über `dateEntryInForce > korpusStand`)
// noch wann geprüft wurde (`public/normtext/currency.json`, erhoben von
// `scripts/fedlex-wiedervorlage-generieren.ts`). Kein `Date.now()`, keine
// Datums-Arithmetik, keine Heuristik.
//
// ─── F5 im Klartext (Entscheid David 16.8.2026, Fahrplan Kap. 9) ─────────────
// Der alte Ausweis «geltend geprüft am TT.MM.JJJJ (maschinell)» war für sich
// wahr, las sich aber wie «alles aktuell». Geprüft wurde aber nur, ob unser
// gepinnter Text der aktuellen FEDLEX-KONSOLIDIERUNG entspricht — nicht, ob
// Fedlex seinerseits alle in Kraft getretenen Änderungen eingearbeitet hat.
// Genau diese Lücke ist der Positions-11-Befund. Neu benennt der Ausweis den
// Prüfgegenstand («gegen Fedlex-Konsolidierung»), und die Warnzeile benennt,
// was trotzdem fehlt. §7/§8 bleiben gewahrt: «(maschinell)» bleibt tragend,
// kein «gegengeprüft/verifiziert»-Wortfeld, und massgeblich ist stets die
// amtliche Fassung.

/** ISO-Datum `YYYY-MM-DD` → Schweizer Anzeigeform `TT.MM.JJJJ`; sonst unverändert. */
export function datumCh(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/**
 * Standausweis (F5): «gegen Fedlex-Konsolidierung geprüft am TT.MM.JJJJ (maschinell)».
 *
 * Ersetzt den bis 16.8.2026 gültigen Wortlaut «geltend geprüft am … (maschinell)».
 * Das Datum ist der letzte maschinelle Abgleich gegen den amtlichen
 * Fedlex-Konsolidierungsgraphen (`dateApplicability`), NICHT ein Zusicherungs-
 * datum: was die Prüfung nicht abdeckt, sagt `nichtKonsolidiertSatz()`.
 */
export function standausweisSatz(geprueftAmIso: string): string {
  return `gegen Fedlex-Konsolidierung geprüft am ${datumCh(geprueftAmIso)} (maschinell)`;
}

/**
 * Angekündigte, noch nicht geltende Konsolidierung: «nächste Fassung ab TT.MM.JJJJ».
 * Echter Fassungsvorbehalt (Farb-Rolle `warn`, DESIGN-REGLEMENT-NORMTEXT §Farb-
 * Wörterbuch) — unverändert gegenüber P1-d, nur nicht mehr doppelt geschrieben.
 */
export function naechsteFassungSatz(abIso: string): string {
  return `nächste Fassung ab ${datumCh(abIso)}`;
}

/**
 * Klartext-Warnung (F5), NUR wenn mindestens eine in Kraft getretene Änderung
 * nicht in den gezeigten Text eingearbeitet ist:
 *
 *   «Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text
 *    eingearbeitet — massgeblich ist die amtliche Fassung.»
 *
 * `seitIso` = frühestes Inkrafttreten unter den nicht konsolidierten Revisionen.
 * `null` = das Datum ist (noch) nicht bekannt — dann fällt der Zeitbezug weg,
 * statt eines zu erfinden (§8). Das Zeichen «⚠» gehört NICHT in diesen String:
 * es ist redundante Verstärkung und wird im UI `aria-hidden` davorgesetzt
 * (DESIGN-REGLEMENT B3 — nie alleiniger Bedeutungsträger).
 */
export function nichtKonsolidiertSatz(seitIso: string | null): string {
  const seit = seitIso ? ` seit ${datumCh(seitIso)}` : '';
  return `Fedlex hat eine${seit} geltende Änderung noch nicht in den Text eingearbeitet`
    + ' — massgeblich ist die amtliche Fassung.';
}

/**
 * Browser-Reiter-Titel eines Erlasses: «OR (Obligationenrecht) — LexMetrik».
 * Der Kurztitel ist der Klammer-Inhalt am Ende des Volltitels (LEGES-Konvention),
 * sonst der Titel selbst.
 *
 * REDUNDANZ-WEICHE (Fehlerbuch, auf Prod reproduziert 29.8.2026): Wo das
 * Klammer-Suffix GENAU das Kürzel ist — typisch bei Staatsverträgen, «Konvention
 * zum Schutze der Menschenrechte und Grundfreiheiten (EMRK)» —, stand im Reiter
 * «EMRK (EMRK) — LexMetrik». Die Klammer trägt dort keine Information mehr, also
 * entfällt sie, statt sie zu wiederholen. Es ist dieselbe Regel, die
 * `titelRedundant` in `pages/gesetz-leser/parts/ErlassLeserKopf.tsx` auf die H1
 * anwendet (case- und trim-unempfindlich) — der Reiter war der einzige
 * Ausspielungsort, der sie nicht zog. Alle nicht-redundanten Titel bleiben
 * Zeichen für Zeichen die von vorher.
 */
export function tabTitel(kuerzel: string, titel: string): string {
  const kurz = titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? titel;
  const redundant = kurz.trim().toLowerCase() === kuerzel.trim().toLowerCase();
  return redundant ? `${kuerzel} — LexMetrik` : `${kuerzel} (${kurz}) — LexMetrik`;
}

/**
 * Anteil Anhang-Einträge, ab dem die Fakten-Zeile nicht mehr «Artikel» zählt.
 * Fahrplan Kap. 14, Wording-Punkt «Anhang-Dominanz»: «N Artikel» ist falsch, wo
 * der Snapshot fast nur aus Anhang-Einträgen besteht (typisch bei Tarif- und
 * Verzeichnis-Erlassen). 0.9 = Ermessens-Schwelle für ein ANZEIGE-Etikett, kein
 * Rechtsbegriff — sie verändert keine Zahl, nur ihr Substantiv.
 */
export const ANHANG_DOMINANZ = 0.9;

/** Zähl-Substantiv einer Snapshot-Menge, siehe `ANHANG_DOMINANZ`. */
export function zaehlWort(
  basis: 'Artikel' | 'Paragraphen',
  kennzahlen?: { artikelAnzahl: number; anhangArtikel: number } | null,
): 'Artikel' | 'Paragraphen' | 'Einträge' {
  if (!kennzahlen || kennzahlen.artikelAnzahl <= 0) return basis;
  return kennzahlen.anhangArtikel / kennzahlen.artikelAnzahl >= ANHANG_DOMINANZ ? 'Einträge' : basis;
}
