// ─── Zuständigkeit — gemeinsame Grundlagen beider ZPO-Engines ────────────────
//
// Geteilt von `erstinstanz.ts` (bestimmeZustaendigkeit) und `rechtsmittel.ts`
// (bestimmeRechtsmittel): Schwellenwerte, Eingabe-Typen und die Eingabe-
// Validierung — samt der unverändert mitgewanderten NORMBASIS-Dokumentation
// der ZPO-Schwellen unten. KEINE Subsumtion liegt hier: die zwei Engines sind
// materiell verschiedene Prüfungen und bleiben getrennt (CLAUDE.md §4).

// ─── Zuständigkeits-Engine (ZPO) — Bundesrechtsschicht ──────────────────────
//
// Reine, deterministische Engine: Streitsache + Streitwert + Konstellation →
// Verfahrensart, Schlichtungspflicht/-behörde, Entscheidkompetenz, örtlicher
// Gerichtsstand. KEIN Date.now(), keine Heuristik (CLAUDE.md §1/§2).
//
// NORMBASIS — empirisch gegen das Fedlex-Filestore-HTML SR 272 ZPO verifiziert
// (Konsolidierung 20260701, in Kraft; Revision «Verbesserung der Praxis-
// tauglichkeit und der Rechtsdurchsetzung» per 1.1.2025; abgerufen 5.6.2026,
// §7-Nachverifikation 2.7.2026 auf die 20260701-Konsolidierung: alle hier
// tragenden Schwellen/Anker unverändert — die Re-Pin-Änderungen betreffen nur
// art_260a/b [Besitzesschutz, AS 2026 16] und eine art_314-Fussnote, keine
// Engine-Werte; so auch gepinnt in scripts/fedlex-cache.sh).
// Vollständige Herleitung: ZUSTAENDIGKEIT-AUFTRAG.md §3/§4.
//   · Verfahrensart        Art. 243 (vereinfacht bis 30'000 / streitwertunab-
//                          hängig bei Miete-Schutzmaterie & GlG), 248 (summ.)
//   · Schlichtung          Art. 197 (Grundsatz), 198 (Ausnahmen),
//                          199 (Verzicht ab 100'000 / einseitig / Abs. 3 neu),
//                          200 (paritätische Behörde Miete & GlG)
//   · Entscheidkompetenz   Art. 212 (Entscheid bis 2'000), 210 (Entscheid-
//                          vorschlag: GlG, Miete-Schutz, übrige bis 10'000 —
//                          Revision 2025: vorher 5'000)
//   · örtlich              Art. 10 (Grundsatz Wohnsitz/Sitz), 32 (Konsum),
//                          33 (Miete unbewegl. Sache), 34 (Arbeit),
//                          35 (Verzichtsverbot teilzwingend), 9 (zwingend)
//   · sachlich/funktionell Art. 4 (kant. Recht!), 6 (Handelsgericht),
//                          8 (direkte Klage oberes Gericht) — als WEICHE
//
// PHASE 1 = nur Bundesrecht. Welches KONKRETE kantonale Gericht zuständig ist
// (Art. 4), löst die Kantonsschicht (Phase 2, zustaendigkeitKantone.ts) auf;
// hier wird sie als offene Stelle + Warnung ausgewiesen. Ermessensfragen
// (Handelsgericht, GSV) sind offengelegte WEICHEN, nie stille Subsumtion (§8).
// Alle Norm-Pills verified:false bis zur fachlichen Abnahme (§13).
//
// AUSBAU (Anordnung David 5.6.2026, «komplett überarbeiten» auf Basis
// bibliothek/normen/zpo-zustaendigkeit-regelwerk.md — Wortlaute am Cache
// verifiziert): neue Streitsachen delikt (Art. 36–38) · persoenlichkeit
// (Art. 20; Gewaltschutz-Unterfall: Art. 28b/28c ZGB → 198 lit. abis,
// 243 Abs. 2 lit. b, 114 lit. f) · gesellschaft (Art. 40 Abs. 1) ·
// ip_wettbewerb (Art. 5 — einzige kantonale Instanz, 199 Abs. 3, 243
// Abs. 3); Vertrags-Forum Art. 31 (charakteristische Leistung ≠ Erfüllungs-
// ort OR 74); AVG-Verleiher-Forum Art. 34 Abs. 2; Prorogations-/Einlassungs-
// Weiche (Art. 17/18) je Bindungsgrad; IPRG/LugÜ-Weiche (Art. 2);
// perpetuatio fori (Art. 64 Abs. 1 lit. b) und Art.-63-Rettung als Hinweise.
// Alle BESTEHENDEN Eingabe-Kombinationen liefern unverändert dieselben
// Ergebnisse (Erweiterung über neue Felder/Streitsachen; Tests unberührt).

export const ZPO_SCHWELLEN = {
  VEREINFACHT: 30_000,        // Art. 243 Abs. 1 ZPO (bis und mit)
  ENTSCHEIDVORSCHLAG: 10_000, // Art. 210 Abs. 1 lit. c ZPO (Revision 2025: vorher 5'000)
  ENTSCHEID_AUF_ANTRAG: 2_000,// Art. 212 Abs. 1 ZPO
  VERZICHT_GEMEINSAM: 100_000,// Art. 199 Abs. 1 ZPO
  HANDELSGERICHT_MIN: 30_000, // Art. 6 Abs. 2 lit. b ZPO
  DIREKTKLAGE_MIN: 100_000,   // Art. 8 Abs. 1 ZPO
  // Art. 6 Abs. 4 lit. c Ziff. 2 ZPO (eingefügt per 1.1.2025) — bewusst
  // eigene Konstante neben DIREKTKLAGE_MIN: gleicher Betrag, aber rechtlich
  // verschiedene Schwellen (§1 — keine Fusion zweier Rechtsregeln).
  HG_INTERNATIONAL_MIN: 100_000,
} as const;

// Rechtsweg-Rubriken (oberste Ebene der UI, Entscheid David 5.6.2026):
// Zivil ist implementiert; SchKG/Straf/Verwaltung sind eigene künftige
// Engines (§4 — KEINE Fusion in diese ZPO-Engine).
export type Rechtsweg = 'zivil' | 'schkg' | 'straf' | 'verwaltung';

export type Streitsache =
  | 'geldforderung' | 'miete_wohn_geschaeft' | 'arbeit' | 'scheidung' | 'erbrecht'
  // Ausbau 5.6.2026 (Regelwerk):
  | 'delikt'           // unerlaubte Handlung, Art. 36–38 ZPO
  | 'persoenlichkeit'  // Persönlichkeit/Datenschutz/Gegendarstellung, Art. 20 ZPO
  | 'gesellschaft'     // gesellschaftsrechtliche Verantwortlichkeit, Art. 40 Abs. 1 ZPO
  | 'ip_wettbewerb';   // Art. 5 ZPO: IP/Kartell/Firma/UWG — einzige kantonale Instanz

// Miete-Unterfall steuert die «Schutzmaterie» (Hinterlegung, Missbrauchs-/
// Kündigungsschutz, Erstreckung) → vereinfachtes Verfahren & Entscheidvorschlag
// STREITWERTUNABHÄNGIG (Art. 243 Abs. 2 lit. c, Art. 210 Abs. 1 lit. b ZPO).
export type MieteUnterfall =
  | 'kuendigungsschutz' | 'erstreckung' | 'mietzins_anfechtung' | 'hinterlegung' | 'sonstige';

/** Delikts-Unterfall (Art. 36–38 ZPO): steuert Spezialforen. */
export type DeliktUnterfall = 'allgemein' | 'verkehrsunfall' | 'ungerechtfertigte_massnahme';

/** Persönlichkeits-Unterfall (Art. 20 ZPO; Gewaltschutz = Art. 28b/28c ZGB). */
export type PersoenlichkeitUnterfall = 'verletzung' | 'gegendarstellung' | 'datenschutz' | 'gewaltschutz';

/** Art.-5-Materie (Wortlaut-genau, Stufe-2-Doppelcheck 6.6.2026):
 *  lit. a–c, e, g–i UNBEDINGT einzige Instanz; lit. d (UWG) über 30 000 ODER
 *  wenn der BUND sein Klagerecht ausübt (streitwertunabhängig!); lit. f
 *  (Klagen gegen den Bund) NUR über 30 000 — keine Klagerecht-Alternative. */
export type IpUnterfall = 'ip_kartell_firma' | 'uwg' | 'klage_gegen_bund';

export interface ZustaendigkeitInput {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;          // false = nicht vermögensrechtlich (Streitwert irrelevant)
  streitwertCHF: number | null;          // Pflicht, wenn vermoegensrechtlich
  mieteUnterfall?: MieteUnterfall;       // nur bei miete_wohn_geschaeft
  glgBetroffen?: boolean;                // Gleichstellungsgesetz (Art. 200/210/243)
  konsumentenvertrag?: boolean;          // nur bei geldforderung (Art. 32)
  klaegeristGeschuetzt?: boolean;        // geschützte Partei (Konsument/Mieter/AN) ist Klägerin
  geschaeftlicheTaetigkeit?: boolean;    // Art. 6 Abs. 2 lit. a (Handelsgericht-Weiche)
  beklagteImHR?: boolean;                // Art. 6 Abs. 2 lit. c
  klaegerImHR?: boolean;                 // Art. 6 Abs. 2 lit. c
  beklagteAuslandOderUnbekannt?: boolean;// Art. 199 Abs. 2 lit. a/b; löst zudem die IPRG-Weiche aus (Art. 2)
  widerklageOderGerichtlicheFrist?: boolean; // Art. 198 lit. g/h (Schlichtung entfällt)
  // Ausbau 5.6.2026 (alle optional — Default erhält das bisherige Verhalten):
  ausVertrag?: boolean;                  // geldforderung: Forderung aus Vertrag → Art. 31 (charakteristische Leistung)
  deliktUnterfall?: DeliktUnterfall;     // nur bei delikt
  persoenlichkeitUnterfall?: PersoenlichkeitUnterfall; // nur bei persoenlichkeit
  ipUnterfall?: IpUnterfall;            // nur bei ip_wettbewerb (Default: unbedingte lit.)
  /** Art. 5 Abs. 1 lit. d Alt. 2: der Bund übt sein UWG-Klagerecht aus —
   *  dann einzige Instanz UNABHÄNGIG vom Streitwert (nur bei 'uwg'). */
  bundKlagerecht?: boolean;
  avgVerleih?: boolean;                  // arbeit: Personalverleih/-vermittlung → Zusatzforum Art. 34 Abs. 2
  gerichtsstandsvereinbarung?: boolean;  // Parteien haben eine GSV (Art. 17) — Wirksamkeit je Bindungsgrad
  // Rechtsmittel-Umbau 6.6.2026 (Auftrag David; Grundlage bgg-beschwerde-engine.md
  // + ZPO-Wortlaute am Cache — alle optional, Default erhält das bisherige Verhalten):
  rmObjekt?: RmObjekt;                   // Default 'endentscheid'
  rmVerfahren?: RmVerfahren;             // Default 'ordentlich_vereinfacht'
  rmVorinstanz?: RmVorinstanz;           // Default 'erstinstanz'
  /** Art. 314 Abs. 2 ZPO (Rev. 1.1.2025): familienrechtliche Summarsachen nach
   *  Art. 271/276/302/305 — Berufungsfrist 30 statt 10 Tage. */
  rmFamilienSummarsache?: boolean;
}

// ─── Rechtsmittel-Eingaben (Umbau 6.6.2026) ─────────────────────────────────

/** Anfechtungsobjekt (Art. 308 Abs. 1 / Art. 319 ZPO, Wortlaut-verifiziert). */
export type RmObjekt = 'endentscheid' | 'zwischenentscheid' | 'vorsorgliche_massnahme' | 'prozessleitende_verfuegung';
/** Verfahrensart der VORINSTANZ — steuert Fristlänge und Stillstand. */
export type RmVerfahren = 'ordentlich_vereinfacht' | 'summarisch';
/** Vorinstanz-Typ — Handelsgericht/Direktklage gehen direkt ans BGer (Art. 75 Abs. 2 lit. b/c BGG). */
export type RmVorinstanz = 'erstinstanz' | 'handelsgericht' | 'direktklage_oberes_gericht';

export const ungueltig = (sw: number | null) => sw !== null && (!Number.isFinite(sw) || sw < 0);
