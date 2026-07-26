/**
 * Fussnoten-Klassifikation (W2·5i-HIST-ANSICHT / H1) — die EINE Quelle der Regeln.
 *
 * Ordnet jede amtliche Fussnote deterministisch (§2: gleiche Eingabe → gleiche
 * Ausgabe, kein LLM, keine Laufzeit-Heuristik) einer von fünf Klassen zu. Die
 * Klasse wird EINMAL build-seitig berechnet und als kompaktes Sidecar-Feld `kl`
 * mitgeführt (H0-Auflage 3, §15.3: kein Client-Regex-Lauf über 37'849 Fussnoten).
 *
 * Herkunft: die Regeln sind aus dem H0-Messwerkzeug `scripts/analyse/hist-h0.ts`
 * hierher GEHOBEN (nicht kopiert — hist-h0.ts importiert sie jetzt von hier, §5).
 * Empirische Grundlage: `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`
 * (Messung 25.7.2026, 37'849 Fussnoten korpusweit, Hand-Labelung n=300 +
 * Vollscan aller 25'367 AENDERUNG-Fälle).
 *
 * ─── Sicherheits-Asymmetrie (die einzige Metrik, die §1/§15 berührt) ──────────
 * Der EINZIGE gefährliche Fehler ist Substanz → AENDERUNG: nur AENDERUNG ist in
 * der Leseansicht «Änderungshistorie: aus» ausblendbar (H0-Auflage 1), also würde
 * dort echte amtliche Information verschwinden. Die Gegenrichtung (Revisionsprosa
 * bleibt sichtbar) kostet nur Lesekomfort. Darum ist im Zweifel NIE 'A' zu
 * vergeben — 'U' (UNKLAR) ist der konservative Ausgang und bleibt immer sichtbar.
 *
 * ─── H0-Auflage 2 (bindend, vor dem H1-Merge) ────────────────────────────────
 * Die zwei im Vollscan gefundenen echten Substanz-Fehler und die BS-Familie
 * «… werden hier nicht abgedruckt» sind explizit AUS 'A' herausgeroutet
 * (SUBSTANZ_VERWEIS / VOLLSTAENDIGKEIT unten). Wirkung, am Bestand gemessen
 * (26.7.2026): 13 Fussnoten verlassen AENDERUNG — 12× «nicht abgedruckt»
 * + 1× «unter dem Vorbehalt» (BS-780.100 § 29), ALLE kantonal; die Bund-Fläche
 * ist von Auflage 2 nicht betroffen.
 *
 * ─── Adversariale Gegenprüfung 26.7.2026: Befunde B1/B3 (bindend) ────────────
 * Der unabhängige Durchgang fand zwei Familien, die als 'A' (= ausblendbar)
 * eingeordnet waren, obwohl sie GELTENDE Information tragen:
 *   B1 · Geltungs-ENDdaten / laufende Befristungen  → BEFRISTUNG, 61 Bund-Fälle
 *   B3 · operative Anordnung «Laut Ziff. …»          → OPERATIVE_ANORDNUNG, 1 Fall
 * Beide → GRAUZONE (Revisionsvermerk MIT geltender Information). Begründung,
 * Formen-Inventar und die §2-Falle (kein Datumsvergleich!) stehen unten an den
 * Regeln. Wirkung auf den Bund, GEMESSEN am Differ-Lauf (nicht geschätzt):
 * 62 Fussnoten wechseln A → G, AENDERUNG 24'693 → 24'631, GRAUZONE 292 → 354.
 *
 * ─── Korpus-Stand nach allen Nachträgen (Bund, 31'786 Fussnoten) ─────────────
 *   A 24'631 (77.5 %) · V 5'759 (18.1 %) · G 354 (1.1 %) · Z 632 (2.0 %) · U 410 (1.3 %)
 */

/** Die fünf Klassen in Langform (Berichts-/Testsprache). */
export type Klasse = 'AENDERUNG' | 'VERWEIS' | 'GRAUZONE' | 'ZITAT' | 'UNKLAR';

/** Kompakte Sidecar-Kodierung (ein Zeichen je Fussnote — 37'849 Felder korpusweit). */
export type KlasseKurz = 'A' | 'V' | 'G' | 'Z' | 'U';

/** Lang → kurz. Einzige Stelle der Abbildung (§5). */
export const KURZ: Readonly<Record<Klasse, KlasseKurz>> = {
  AENDERUNG: 'A', VERWEIS: 'V', GRAUZONE: 'G', ZITAT: 'Z', UNKLAR: 'U',
};

// ─── Regeln (empirisch aus den Anfangs-Mustern des Korpus erhoben, 25.7.2026) ──

// Reine Revisionsprosa am Fussnoten-ANFANG.
const REV_START = new RegExp(
  '^(' +
    [
      'Fassung gemäss',
      'Fassung des\\b',
      'Eingefügt durch',
      'Aufgehoben durch',
      'Aufgehoben gemäss',
      'Ausdruck gemäss',
      'Bereinigt gemäss',
      'Nummerierung gemäss',
      'Bezeichnung gemäss',
      'Ursprünglich\\b',
      '(Erster|Zweiter|Dritter|Vierter|Fünfter|Letzter) (Satz|Absatz|Halbsatz)\\b',
      'Satz (eingefügt|aufgehoben|gemäss)',
      'Die Bezeichnung\\b',
      'Die Paarform\\b',
      'Umbenennung von',
      'Softwarebedingte',
      'Die Berichtigung\\b',
      'Berichtigt von der',
      'Die Referendumsfrist',
      'Angenommen in der Volksabstimmung',
      'Wirksam seit',
      'Publiziert am',
      'BRB vom',
      'In Kraft (seit|getreten)',
      'Die Änderung(en)?\\b',
      'Strafdrohungen neu umschrieben',
      'Der Verweis wurde in Anwendung',
      'Gegenstandslos\\b',
      'Betrifft nur\\b',
      'Abkürzung eingefügt durch',
      'Die Initiative wurde',
      '.{0,40}\\bin Kraft gesetzt',
      '.{0,60}\\b(in Wirksamkeit erklärt|unbenützt abgelaufen)',
      '.{0,80}\\b(angenommen|genehmigt|zugestimmt)(\\b|\\.)',
      '.{0,40}\\bin der Fassung des\\b',
    ].join('|') +
    ')',
  'i',
);

// Leser-Redirect INNERHALB einer Revisions-Fussnote → Grauzone.
const REDIRECT = /\b(siehe|vgl\.|heute|massgebend|anwendbar)\b/i;

// Substanz-/Verweis-ANFANG (SR-Nummern, kantonale Register, Abkürzungs-
// Auflösungen, EU-Rechtsakte, Provisions-Verweise, Dokument-Links).
const VW_START = new RegExp(
  '^(' +
    [
      'SR \\d',
      '(bGS|SG|SAR|BGS|LS|GS|sGS|SRL|SHR|SGS|NG|RB|BR|CSC|SRSZ|GDB|RiE|BaB|BeE) [\\d.]',
      '(aGS|GS) [IVX]',
      'SG RiE',
      'KV\\b',
      'BV\\b',
      'Vgl\\.',
      'Siehe\\b(?! heute)',
      'Verordnung \\((EG|EWG|EU)\\)',
      'Richtlinie\\b',
      '(§|Art\\.) ?\\d',
      'Mit Übergangsbestimmung',
      'vgl\\.',
    ].join('|') +
    ')',
);
// Verweis-Signale IRGENDWO im Text (greifen nur, wenn kein REV-Marker vorliegt):
// eingeklammerte SR-/Register-Nummer (Abkürzungs-Auflösung, Erlass-Nennung) oder
// Bezugs-URL («abrufbar/einsehbar unter», «bezogen werden»).
const VW_SIGNAL =
  /\((?:[A-ZÄÖÜ][A-Za-zÄÖÜäöü]{1,11}; )?(SR|bGS|SG|SAR|BGS|LS|sGS|SRL|BR|RB|SGS|GDB|SRSZ|CSC|NG|BSG|RSB|RiE|BaB|BeE)\s?[\d.]+|\b(abrufbar|einsehbar) unter\b|\bbezogen werden\b/;

// Reine Publikations-Zitate (AS-/BBl-/Abl-Ketten, «[AS …]»-Fassungsketten) —
// eigene Klasse: weder Redirect noch Revisionsprosa im engeren Sinn; für die UI
// konservativ IMMER sichtbar (H0-Auflage 5, Empfehlung «Provenienz sichtbar
// lassen»; der finale ZITAT-Entscheid liegt bei David).
const ZITAT_START =
  /^\[?(AS|BS|BBl|Abl\.?|AGS|OS|GS|nGS|SRL Nr|RRB)\s?[\d ]/;

// Grauzonen-ANFÄNGE: historisch motiviert, tragen aber geltende Information.
const GRAU_START = new RegExp(
  '^(' +
    [
      'Heute:',
      'Siehe heute',
      'umbenannt in',
      // Wert-Provenienz: «Betrag/Höchstbetrag/Ansätze gemäss Änd. vom …» — Historie
      // UND geltende Herkunftsangabe des Werts zugleich.
      '[A-ZÄÖÜ][a-zäöü]*([Bb]etrag|[Bb]eträge|[Aa]nsätze)\\w* gemäss',
      '(Betrag|Beträge|Ansätze) gemäss',
    ].join('|') +
    ')',
);
// Aufhebung MIT Nachfolger-Redirect («Dieses Gesetz ist aufgehoben. Massgebend ist jetzt …»).
const GRAU_AUFHEBUNG = /aufgehoben.*(massgebend|siehe|heute|ersetzt durch)/i;

// ─── H0-Auflage 2: die belegten Substanz-Fehlgriffe explizit aus 'A' holen ─────
//
// (a) SUBSTANZ_VERWEIS — die Fussnote trägt MATERIELLE Information bzw. eine
//     Bezugsquelle, auch wenn sie mit Revisionsprosa beginnt. Beide Signale sind
//     Einzelbefunde aus dem korpusweiten Vollscan über alle 25'367 AENDERUNG-Fälle:
//       · «unter dem Vorbehalt» — BS-780.100 § 29: der Bundesrat genehmigte die
//         Bestimmung nur unter einem AUSLEGUNGS-Vorbehalt. Das ist geltende
//         materielle Auslegungsvorgabe, keine Revisionsprosa. Bewusst die LANGE
//         Form mit Artikel: «unter Vorbehalt des unbenützten Ablaufs der
//         Referendumsfrist» (AR-822.41 § 28) ist reine Historie und darf NICHT
//         mitgefangen werden.
//       · «eingesehen werden» — BS-953.900 § 93: Bezugsquelle eines nicht
//         abgedruckten Erlassteils («kann bei der Direktion der BVB eingesehen
//         werden»). Das ist der einzige Weg des Lesers zum Text → Substanz.
// (b) VOLLSTAENDIGKEIT — die BS-Familie «… werden hier nicht abgedruckt»:
//     redaktioneller Vollständigkeits-Hinweis. Formal ein Revisionsvermerk, aber
//     er sagt dem Leser, dass an dieser Stelle Text FEHLT. §8-Ehrlichkeit ⇒ in
//     jeder Ansicht sichtbar; Klasse GRAUZONE (Revisionsvermerk MIT Leser-Hinweis)
//     trifft die Sache genauer als VERWEIS.
//
// Beide Gruppen sind NICHT-A und damit in jeder Ansicht sichtbar — das ist die
// Wirkung, die Auflage 2 verlangt.
const SUBSTANZ_VERWEIS = /\bunter dem Vorbehalt\b|\beingesehen werden\b/i;
const VOLLSTAENDIGKEIT = /\bnicht abgedruckt\b/i;

// ─── Gegenprüfungs-Befund B1 (26.7.2026): BEFRISTUNGEN sind vorwärts gerichtet ─
//
// Befund der adversarialen Gegenprüfung: 62 Bund-Fussnoten tragen ein Geltungs-
// ENDdatum («in Kraft vom 18. März 2023 bis zum 31. Dez. 2027», KVG 37 fn 116/117;
// «Art. 95a Abs. 1 Bst. a gilt bis 31. Dez. 2027», ASYLG 95a fn 300; VTS 95 fn 438).
// Das ist keine abgeschlossene Revisionsprosa, sondern eine **laufende Befristung**:
// materiell erheblich und in die Zukunft weisend. In der Ansicht «aus» darf sie
// nicht verschwinden (§1/§8) ⇒ GRAUZONE (Revisionsvermerk MIT geltender
// Information), NICHT VERWEIS.
//
// §2-KRITISCH — warum NICHT nach «heute» unterschieden wird: die Versuchung ist,
// nur NOCH LAUFENDE Befristungen (Enddatum ≥ heute) zu schützen und abgelaufene
// weiter als 'A' zu behandeln. Das wäre ein `Date.now()` in der Klassifikations-
// logik: dieselbe Fussnote fiele je nach Build-Tag in eine andere Klasse, das
// Sidecar wäre nicht mehr reproduzierbar und der Differ-Beweis wertlos.
// **ALLE Befristungs-Vermerke — auch längst abgelaufene — werden zu GRAUZONE.**
// Determinismus vor Feinheit; der Preis ist, dass ~35 historische Befristungen
// sichtbar bleiben (Lesekomfort, kein Treue-Problem).
//
// Formen-Inventar am Bestand erhoben (26.7.2026), NICHT geraten:
//   · «in Kraft vom <Datum> bis (zum) <Datum>»  — 58× der häufigste Fall
//   · «in Kraft bis zum <Datum>»                — EPV 93 fn 34
//   · «gilt/gelten bis <Datum>»                 — ASYLG 95a fn 300
//   · «befristet bis», «Bis zum Inkrafttreten … : Art. N» (ZGB 89a fn 136)
// Das Fenster hinter «in Kraft vom» MUSS Punkte zulassen (deutsche Datums-
// abkürzungen «1. Jan. 2025»); ein `[^.]`-Fenster matchte 0 von 58 Fällen.
// Bewusst NICHT aufgenommen: ein blosses «bis zum» (fängt reine Historie wie
// KVV 136 fn 518) und «verlängert bis» (die 5 Treffer — FZA 10 — sind bereits
// 'U' und damit ohnehin sichtbar; die Regel gewänne nichts und würde nur breiter).
const BEFRISTUNG = new RegExp(
  [
    '\\b(gilt|gelten|gültig) bis\\b',
    '\\bin Kraft vom\\b.{0,60}?\\bbis\\b',
    '\\bin Kraft bis\\b',
    '\\bbefristet bis\\b',
    '\\bbis zum Inkrafttreten\\b',
  ].join('|'),
  'i',
);

// ─── Gegenprüfungs-Befund B3 (26.7.2026): operative Anordnung in «Laut Ziff. …» ─
//
// AVIV 51a fn 168: «… Laut Ziff. II kann die Karenzfrist von zwei Wochen nach
// Abs. 4 bereits vor dem Inkrafttreten dieser Änd. zu laufen beginnen, sofern die
// Kurzarbeit vorangemeldet worden ist.» Das ist eine **operative Fristenlauf-Regel**
// im Fussnotengewand — Substanz, kein Änderungsvermerk. «Laut Ziff.» führt im
// Bestand ausschliesslich solche Anordnungen ein (1 Treffer, einzeln geprüft).
const OPERATIVE_ANORDNUNG = /\bLaut Ziff\./i;

/** HTML-Tags weg, Whitespace normalisiert — die Regeln arbeiten auf Klartext.
 *  Identisch zum `strippe()` der H0-Messung (dieselbe Eingabe-Normalisierung,
 *  sonst wären die Korpuszahlen des Berichts nicht reproduzierbar). */
export function strippeFnText(html: string): string {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Klassifiziert einen bereits GESTRIPPTEN Fussnotentext.
 *
 * Reihenfolge ist load-bearing: die Auflage-2-Riegel stehen VOR dem
 * Revisionsprosa-Test, sonst gewinnt `REV_START` («Die Änderungen …») und der
 * Fall landete wieder in 'A'.
 */
export function klassifiziere(text: string): Klasse {
  // H0-Auflage 2 zuerst — Substanz schlägt Revisionsprosa (§1).
  if (SUBSTANZ_VERWEIS.test(text)) return 'VERWEIS';
  if (VOLLSTAENDIGKEIT.test(text)) return 'GRAUZONE';
  // Gegenprüfungs-Befunde B1/B3: vorwärts gerichtete Befristung bzw. operative
  // Anordnung. Ebenfalls VOR dem Revisionsprosa-Test — die betroffenen Fussnoten
  // beginnen fast alle mit «Eingefügt durch …»/«Fassung gemäss …» und landeten
  // sonst in 'A' (= ausblendbar), obwohl sie geltende Information tragen.
  if (BEFRISTUNG.test(text)) return 'GRAUZONE';
  if (OPERATIVE_ANORDNUNG.test(text)) return 'GRAUZONE';
  if (GRAU_START.test(text)) return 'GRAUZONE';
  if (REV_START.test(text)) {
    if (REDIRECT.test(text) || GRAU_AUFHEBUNG.test(text)) return 'GRAUZONE';
    return 'AENDERUNG';
  }
  if (GRAU_AUFHEBUNG.test(text)) return 'GRAUZONE';
  if (VW_START.test(text)) return 'VERWEIS';
  if (ZITAT_START.test(text)) return 'ZITAT';
  if (VW_SIGNAL.test(text)) return 'VERWEIS';
  return 'UNKLAR';
}

/**
 * Generator-Einstieg: ROHER Fussnotentext (mit `<b>/<i>`, wie im Sidecar) →
 * kompakte Klasse. Leerer Text ⇒ 'U' (nichts zu klassifizieren ⇒ sichtbar).
 */
export function klassifiziereFussnote(rohText: string): KlasseKurz {
  const t = strippeFnText(rohText);
  if (!t) return 'U';
  return KURZ[klassifiziere(t)];
}
