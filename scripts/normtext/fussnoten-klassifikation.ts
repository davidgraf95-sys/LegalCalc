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
 * (24'693 AENDERUNG) ist von Auflage 2 nicht betroffen. Korpus-Delta gegenüber
 * dem H0-Bericht: AENDERUNG 25'367 → 25'354 (Kanton 674 → 661).
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
