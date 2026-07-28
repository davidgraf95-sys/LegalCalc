// ─── B2: Kantonaler Norm-Resolver (W2·7-BEZUG) ──────────────────────────────
//
// Ein kantonaler Entscheid zitiert kantonales Recht mit «§», nicht mit «Art.»,
// und identifiziert den Erlass über die KANTONALE Systematik-Nummer, nicht über
// die Bundes-SR-Nummer. Dieser Resolver bindet beides zusammen:
//
//     «§ 93 Abs. 1 Ziff. 1 des Gerichtsorganisationsgesetzes (GOG, SG 154.100)»
//       └─ Artikel-Seite ─┘                                   └── Erlass-Seite ──┘
//              ↓                                                       ↓
//     extrahiereParagraphGruppen()                          BS-154.100 (Snapshot)
//
// ── DIE ENTWURFS-ENTSCHEIDUNG, auf der alles andere ruht (§1) ────────────────
// Die Erlass-Seite wird über die AMTLICHE NUMMER aufgelöst, nicht über eine
// Abkürzungs-Tabelle. Das ist kein Detail, sondern der Grund, warum die
// föderal/kantonale Verwechslung IN DIESEM MODUL nicht «gefiltert» werden muss:
// eine Zahl wie «SG 154.100» IST der Erlass, sie ist nicht mehrdeutig, und es
// gibt von ihr aus keinen Pfad zu einem Bundes-Register-key. Die Lehre aus
// W2·6-NKEY («StG» = eidg. Stempelabgaben ODER kantonales Steuergesetz,
// ABK_AUSSCHLUSS in entscheide-mapping.ts) trifft die Abkürzungs-Ebene — der
// Nummern-Kanal ist ihr von vornherein entzogen.
//
// ── REICHWEITE DIESER AUSSAGE, eng gefasst (Gegenprüfung Runde 1/B4) ────────
// Sie gilt für den «§»-KANAL, den dieses Modul bedient — und NUR für ihn.
// W2·7-BEZUG lässt kantonale Entscheide daneben auch BUNDESRECHTLICHE
// «Art.»-Zitate erzeugen (der grössere Teil der kantonalen Kanten). Die aktuelle
// Aufteilung nach Ziel-Ebene gibt `check:bezuege` bei jedem Lauf aus, Zeile
// «Kantonale Kanten nach Ziel» — der Verweis zeigte bis Runde 4 auf eine
// Ausgabe, die es nicht gab (§7). Dieser zweite Kanal läuft über `artikelSchluesselMitBefund` und
// damit sehr wohl über die Abkürzungs-Tabelle; für ihn ist die Verwechslung
// NICHT strukturell ausgeschlossen, sondern durch eine eigene Regel begrenzt
// (`fremdDefinierteKeys`, entscheide-mapping.ts — dort steht die Messung).
// Der frühere Wortlaut hier deckte diesen Kanal mit ab und behauptete damit
// mehr, als das Modul einlöst; der Anlassfall war eine EU-Verordnung, die als
// «BPR» auf ein Bundesgesetz gezogen wurde.
//
// ── ZWEITER KANAL: DOKUMENTLOKALE ABKÜRZUNGEN ───────────────────────────────
// Ein Entscheid führt den Erlass EINMAL vollständig ein und nennt ihn danach nur
// noch abgekürzt («§ 92 Abs. 1 Ziff. 4 GOG»). Ohne zweiten Kanal fielen diese
// Folge-Nennungen weg. Die Bindung gilt aber ausschliesslich INNERHALB DESSELBEN
// DOKUMENTS und nur für Abkürzungen, die derselbe Entscheid selbst an eine
// amtliche Nummer gebunden hat. Es entsteht KEINE globale kantonale
// Abkürzungs-Tabelle — genau die wäre die zweite Wahrheit (§5) und der Ort, an
// dem sich «StG»/«KV»/«BauG» föderal und kantonal wieder überlagern.
//
// ── AUSSCHLUSS BEIDSEITIG (Auftrag W2·7-BEZUG, Lehre W2·6-NKEY) ─────────────
//  (a) kantonal → Bund: eine dokumentlokale Abkürzung, die im Bundes-Register
//      auflösbar ist, wird NIE gebunden (`normKeyFuerAbk` ≠ null → verworfen).
//      Lieber die Folge-Nennungen dieses einen Erlasses verlieren, als «§ 12 KV»
//      an die Bundesverfassung zu hängen.
//  (b) Bund → kantonal: strukturell. Kantonale Erlass-keys ('BS-154.100')
//      entstehen nur hier und fliessen NIE in `normKeys`/`proNorm` (dort stehen
//      Register-keys des Bundes). Der Bundes-Extraktor sieht kein «§».
//  Beide Richtungen werden gezählt und ausgewiesen (`AufloesungsBefund`), nicht
//  still ausgeführt — eine Lücke, die niemand sieht, lässt sich nicht schliessen
//  (§6.7/§8).

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  extrahiereParagraphGruppen, INVALID_LAW_CODES,
} from '../../src/lib/rechtsprechung/zitat-extraktion';
import { normKeyFuerAbk, normalisiereAbk, titelUeberlappt } from './entscheide-mapping';

/**
 * Kantonale Systematik-Präfixe je Kanton — DEKLARIERT, nie geraten (§2/§7).
 *
 * Jede Zeile braucht (a) den amtlichen Namen der Sammlung und (b) einen Beleg im
 * committeten Korpus. Heute steht genau BS drin: das ist der Start-Bestand des
 * Auftrags (3765 Snapshots aus W2·6-BS), und für die übrigen fünf Kantone im
 * Korpus (AG/BE/GR/SG/ZH, zusammen 30 Entscheide) gibt es weder genug Belege für
 * eine FP-Analyse noch einen kantonalen Erlass-Bestand, gegen den aufzulösen wäre.
 *
 * Die fehlenden Kantone sind eine BENANNTE Lücke, keine stille: `kantoneOhneResolver`
 * weist sie aus, und das Tor check:bezuege druckt sie. Wer BE ergänzt, trägt hier
 * 'BSG' ein und legt den Beleg daneben — mehr braucht es nicht.
 *
 * ACHTUNG bei der Lesart von 'SG': das ist die «Systematische Gesetzessammlung
 * des Kantons Basel-Stadt», NICHT der Kanton St. Gallen. Weil der Präfix nur
 * innerhalb von BS-Entscheiden gegen den BS-Bestand aufgelöst wird, ist die
 * Namensgleichheit folgenlos — sie ist trotzdem hier vermerkt, weil sie beim
 * Lesen zuverlässig irritiert.
 */
export const SYSTEMATIK_PRAEFIX: ReadonlyMap<string, { praefix: string; sammlung: string; beleg: string }> =
  new Map([
    ['BS', {
      praefix: 'SG',
      sammlung: 'Systematische Gesetzessammlung des Kantons Basel-Stadt',
      beleg: 'bs_appellationsgericht/AK.2022.32: «§ 18 Abs. 2 des kantonalen '
        + 'Advokaturgesetzes (AdvG; SG 291.100)» — 8040 Locator-Vorkommen in '
        + '3552 der 3765 BS-Snapshots (Messung 28.7.2026).',
    }],
  ]);

/**
 * Gemeinde-Teilsammlungen, die BS der Nummer voranstellt («SG BeE 786.100» =
 * Bettingen, «SG RiE 786.100» = Riehen). Sie sind Teil der Erlass-IDENTITÄT: die
 * beiden Abfallordnungen tragen dieselbe Nummer 786.100 und sind verschiedene
 * Erlasse. Ohne den Präfix im Schlüssel kollabierten sie auf einen (§1).
 */
const GEMEINDE_PRAEFIX = '(?:BeE|RiE)';

/**
 * Ein kantonaler Erlass-Bestand: Systematik-Nummer → Snapshot-key.
 * Der key ist der Dateiname ohne '.json' in public/normtext/kanton (z.B.
 * 'BS-154.100', 'BS-BeE 786.100') und damit derselbe Schlüssel, den das
 * Browse-Register führt (§5 — abgeleitet, nicht zweitgepflegt).
 */
export type KantonBestand = ReadonlyMap<string, string>;

/**
 * Kantonalen Erlass-Bestand aus dem Snapshot-Verzeichnis ableiten.
 *
 * QUELLE IST DAS DATEISYSTEM, nicht public/normtext/register.json — bewusst:
 * register.json ist selbst ein Generator-Artefakt, und eine Abhängigkeit darauf
 * machte die Reihenfolge zweier Generatoren zur stillen Vorbedingung des
 * Ergebnisses. Der Dateiname trägt dieselbe Information (Kanton + Nummer) und
 * ist die Quelle, aus der register.json sie selbst zieht (§5). Das Tor
 * check:bezuege gleicht beide gegeneinander ab — dort, wo ein Abgleich hingehört.
 *
 * Deterministisch (§2): Ergebnis ist eine Map über sortierte Dateinamen.
 */
export function ladeKantonBestand(root: string, kanton: string): KantonBestand {
  const dir = join(root, 'public', 'normtext', 'kanton');
  const out = new Map<string, string>();
  let dateien: string[];
  try {
    dateien = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return out;   // kein kantonaler Normtext-Bestand → keine kantonalen Kanten
  }
  const praefix = `${kanton}-`;
  for (const datei of dateien) {
    if (!datei.startsWith(praefix)) continue;
    const key = datei.slice(0, -'.json'.length);
    const sr = key.slice(praefix.length);
    if (!sr) continue;
    // Erste Nennung gewinnt; Dopplungen kann es bei sortierten Dateinamen nicht
    // geben (der Dateiname IST der Schlüssel), die Prüfung ist Vorsorge.
    if (!out.has(sr)) out.set(sr, key);
  }
  return out;
}

/**
 * Amtlicher Erlass-String je Systematik-Nummer, aus DEMSELBEN Snapshot, aus dem
 * `ladeKantonBestand` die Nummer nimmt: `eintraege[0].erlass`, z.B.
 * «Bau- und Planungsverordnung, BPV (730.110)».
 *
 * QUELLE UND STAND (§7): der Snapshot selbst — committet, offline, mit
 * Abrufdatum und amtlicher Quelle-URL des Erlasses (public/normtext/kanton/
 * <key>.json, quelleUrl auf gesetzessammlung.bs.ch). KEIN Live-Fetch im
 * Generator-Pfad, kein zusätzliches Artefakt, keine zweite Wahrheit (§5): die
 * Angabe steht längst im Bestand, sie wurde bloss nie gelesen.
 */
export function ladeKantonTitel(root: string, kanton: string): Map<string, string> {
  const dir = join(root, 'public', 'normtext', 'kanton');
  const out = new Map<string, string>();
  let dateien: string[];
  try { dateien = readdirSync(dir).filter((f) => f.endsWith('.json')).sort(); } catch { return out; }
  const praefix = `${kanton}-`;
  for (const datei of dateien) {
    if (!datei.startsWith(praefix)) continue;
    const sr = datei.slice(praefix.length, -'.json'.length);
    if (!sr) continue;
    try {
      const j = JSON.parse(readFileSync(join(dir, datei), 'utf8')) as { eintraege?: Array<{ erlass?: unknown }> };
      const e = j.eintraege?.[0]?.erlass;
      if (typeof e === 'string' && e) out.set(sr, e);
    } catch { /* unlesbar → keine Angabe, kein Riegel */ }
  }
  return out;
}

/**
 * Amtliches Kürzel aus dem Erlass-String: letztes Komma-Segment vor der
 * Nummern-Klammer, sofern es wie eine Abkürzung aussieht (ein Wort, ≥2
 * Grossbuchstaben). «Bau- und Planungsverordnung, BPV (730.110)» → 'BPV';
 * «Verfassung des Kantons Basel-Stadt (111.100)» → null.
 */
export function amtlichesKuerzel(erlass: string): string | null {
  const ohne = erlass.replace(/\s*\((?:SG\s+)?[\d.]+\)\s*$/, '').trim();
  const seg = ohne.split(',').map((x) => x.trim());
  const letzt = seg[seg.length - 1] ?? '';
  if (!letzt || letzt.includes(' ')) return null;
  return (letzt.match(/[A-ZÄÖÜ]/g) ?? []).length >= 2 ? letzt : null;
}

/**
 * WIDERSPRICHT der im Dokument ausgeschriebene Erlass-Titel dem amtlichen Titel
 * der gebundenen Nummer?
 *
 * WIRKUNG, am echten Aufrufpunkt gemessen (28.7.2026, alle 3'765 BS-Snapshots)
 * und sauber zugeschrieben (Gegenprüfung Runde 4/D3):
 *  · DIESE ACHSE allein entfernt 2 Kanten und fügt keine hinzu — BS-730.110/§ 8
 *    und /§ 8b, beide die HBG-Fehlbindung. Sie feuert korpusweit 5-mal, jede
 *    Feuerung richtig.
 *  · Die Bilanz «3 weg, 1 dazu» (10'645 gegen 10'647) gehört dem GANZEN
 *    `titel`-Parameter, also zusätzlich der Titel-«§»-Mechanik: sie nimmt
 *    BS-164.410/§ 15a weg und bringt /§ 5 ein.
 * Kollateral in beiden Fällen: null. Die frühere Buchstaben-Achse verlor an
 * derselben Stelle 26 Kanten, davon 24 richtige.
 *
 * ZWEITE FASSUNG DIESER ACHSE (Gegenprüfung Runde 3/C1). Die erste verglich die
 * BUCHSTABEN der Kurzform mit dem amtlichen Kürzel — und war netto schädlich:
 * am echten Aufrufpunkt gemessen 26 verlorene gegen 1 gewonnene Kante, davon
 * nur 2 echte Treffer (die HBG-Fehlbindung). Die 24 zerstörten waren durchweg
 * RICHTIG: das Gericht schreibt den amtlichen Titel aus und trifft die Nummer,
 * nur die Buchstaben der Kurzform sind vertauscht —
 *   «§ 23 des Gerichtsgebührenreglements (GRR, SG 154.810)»  amtlich GGR  ×12
 *   «des Verwaltungsrechtspflegegesetzes (VPRG, SG 270.100)» amtlich VRPG ×6
 *   «der Verordnung zum Personalgesetz [PV, SG 162.110]»     amtlich VPG  ×2
 *   «Justizvollzugsverordnung, JW; SG 258.210»               amtlich JVV  ×2
 * Eine vertauschte Kurzform ist ein Schreibfehler AM KÜRZEL, kein Hinweis auf
 * den falschen Erlass. Der Titel daneben sagt jedes Mal, was gemeint ist.
 *
 * DARUM ENTSCHEIDET JETZT DER TITEL, nicht die Abkürzung: gesperrt wird nur,
 * wenn der genannte Titel mit dem amtlichen KEINE Wortüberschneidung hat.
 *   · «des Hochbaugesetzes (HBG, SG 730.110)» gegen «Bau- und
 *     Planungsverordnung, BPV» → keine Überschneidung → gesperrt (richtig).
 *   · «Bau- und Planungsverordnung (BPV, SG 730.110)» → «planungsverordnung»
 *     beidseits → bleibt (die Kollateral-Kante § 87 desselben Dokuments).
 * Die Prüfung ist dieselbe wie bei `fremdDefinierteKeys` — EINE Implementierung
 * (`titelUeberlappt`), zwei Aufrufer (§5).
 *
 * BEKANNTE RESTLÜCKE (§8): nennt das Dokument gar keinen Titel, sondern nur die
 * Kurzform — «(PG, SG 162.110)» —, gibt es nichts zu widersprechen, und die
 * Bindung passiert. Diese Klasse ist mit dem Titel-Verfahren nicht erreichbar;
 * sie wäre nur über eine kantonale Kürzel-Tabelle zu schliessen, und die
 * kostete nach obiger Messung mehr, als sie einbringt.
 */
/**
 * Die Titel-PHRASE unmittelbar vor einer Locator-Klammer: alles nach der
 * letzten Satz- oder Klammergrenze. «… (vgl. BGE 1 II 3) des
 * Gerichtsgebührenreglements » → « des Gerichtsgebührenreglements ».
 *
 * Warum die Phrase und nicht das ganze Fenster: 140 Zeichen Vorlauf enthalten
 * regelmässig einen anderen Erlass, und ein Widerspruch gegen den würde den
 * richtigen Treffer sperren. Der Titel, um den es geht, klebt an der Klammer.
 */
export function titelPhrase(davor: string): string {
  return (davor.split(/[.;:()[\]\n]/).pop() ?? '').trim();
}

export function titelWiderspricht(
  genannterTitel: string,
  amtlicherTitel: string | undefined,
  umfeld = '',
): boolean {
  if (!amtlicherTitel) return false;                       // keine Angabe → kein Riegel
  // RETTUNG BEI ALT-TITEL (Gegenprüfung Runde 4/D1). Sieben BS-Erlasse führen
  // heute einen Titel, der mit ihrem FRÜHEREN keine Wortüberschneidung hat —
  // 154.300 · 164.100 · 212.400 · 300.100 · 610.500 · 789.700 · 911.900. Zitiert
  // ein Entscheid den damaligen Titel, sieht die Achse einen Widerspruch, wo
  // keiner ist — Muster «des Gesetzes betreffend Einreihung und Entlöhnung …
  // (Lohngesetz, SG 164.100)»: der ausgeschriebene Titel ist der alte,
  // «Lohngesetz» der heutige, und die Bindung ist völlig richtig.
  //
  // WIE WEIT DER BELEG TRÄGT (§7, korrigiert in Runde 6/G2). Der zuvor hier
  // genannte Korpus-Fall VD.2024.65 belegt die Klasse NICHT — und zwar aus einem
  // anderen Grund, als hier zwischenzeitlich stand. Am echten Aufrufpunkt
  // gemessen ist `zwischenTitel` dort «Lohngesetz» (nicht «,»): die eckige
  // Klammer der Kurzform «(Lohngesetz [LG], SG 164.100)» begrenzt die Phrase auf
  // den HEUTIGEN Titel. Die Prüfung ist dort also nicht gegenstandslos — sie
  // greift, findet die Überschneidung und schweigt zu Recht.
  // Der korpusnahe STRUKTURBELEG ist VD.2021.146: «(Lohngesetz, SG 164.100)» in
  // Rundklammern ohne Kürzel — dort ergibt `titelWiderspricht` true, und ohne
  // die Rettung unten wäre eine richtige Bindung gesperrt.
  // Die Rettung bleibt damit Vorsorge gegen eine belegte STRUKTUR; Live-Wirkung
  // auf gelieferte Kanten heute: 0.
  // Nennt das Dokument das amtliche KÜRZEL der Nummer, ist die Zuordnung von
  // ihm selbst bestätigt — dann schweigt die Achse. «HBG … (SG 730.110)» wird
  // davon nicht gerettet: dort steht «HBG», das amtliche Kürzel ist «BPV».
  //
  // GEGENRICHTUNG, ausdrücklich in Kauf genommen (Gegenprüfung Runde 5/F1):
  // steht das RICHTIGE Kürzel neben einem WIDERSPRECHENDEN Titel, schweigt die
  // Achse ebenfalls — «des Hochbautengesetzes (BPV, SG 730.110)» ergibt false.
  // Das ist gewollt: Kürzel und Nummer stammen aus derselben amtlichen Angabe
  // und stützen sich gegenseitig, der ausgeschriebene Titel ist die Prosa des
  // Gerichts und die häufigere Fehlerquelle (Alt-Titel, Paraphrase, Tippfehler).
  // Wer hier umgekehrt entscheidet, holt sich die 24 Fehl-Sperren der Runde 3
  // zurück. Live-Wirkung dieser Richtung heute: 0 Kanten.
  const k = amtlichesKuerzel(amtlicherTitel);
  if (k && new RegExp(`(?:^|[^A-Za-zÄÖÜäöü0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-zÄÖÜäöü0-9])`).test(umfeld)) return false;
  // Nur das Textstück UNMITTELBAR vor der Klammer zählt: der Erlass-Titel hängt
  // an ihr. Alles jenseits der nächsten Satz-/Klammergrenze gehört zum
  // Vorsatz und sagt über den zitierten Erlass nichts.
  const anliegend = genannterTitel;
  // ABWESENHEIT IST KEIN WIDERSPRUCH (Gegenprüfung Runde 3/C1, zweite Messung).
  // Ohne diese Bedingung sperrte die Achse auch «(GOG, SG 154.100)»,
  // «(GGR, SG 154.810)», «(HoR, SG 291.400)» und «(StVO, SG 952.200)» — alle
  // RICHTIG, nur ohne ausgeschriebenen Titel in Reichweite. Widersprechen kann
  // nur, wer etwas sagt: verlangt wird ein Titel-WORT direkt vor der Klammer.
  if (!/(gesetz|verordnung|ordnung|reglement|vertrag|abkommen|beschluss|statut)e?s?\b/i.test(anliegend)) return false;
  return !titelUeberlappt(anliegend, amtlicherTitel);
}

/**
 * «§»-Tokens im amtlichen TITEL eines Erlasses, je mit dem folgenden Wort:
 * «Verordnung betreffend Zulagen gemäss § 15a Lohngesetz» → { '15a' → 'lohngesetz' }.
 *
 * WOZU (Gegenprüfung Runde 2/B1): fünf BS-Erlasse tragen ein FREMDES «§» im
 * eigenen amtlichen Titel. Damit kehrt sich der wichtigste Schutz des Resolvers
 * um — die Regel «nur die letzte §-Gruppe vor dem Locator bindet» zeigt dann auf
 * das § DES TITELS statt auf das Zitat des Gerichts. Belegt an VD.2021.145:
 * «Gemäss § 5 der Verordnung betreffend Zulagen gemäss § 15a Lohngesetz
 * (Zulagenverordnung, SG 164.410)» band § 15a an BS-164.410 — ein Paragraph, den
 * dieser Erlass gar nicht hat (er führt §§ 1–14) —, während die richtige Kante
 * § 5 verloren ging. Der ganze Shard bestand aus dieser einen Fehlbindung.
 *
 * Betroffen (Titel-Scan über alle BS-Erlasse): BS-164.160 (§ 10 Lohngesetz) ·
 * BS-164.250 (§ 23 Lohngesetz) · BS-164.410 (§ 15a Lohngesetz) · BS-390.720 und
 * BS-390.760 (§ 17 Bestattungsgesetz bzw. § 1 Begräbnis-/Vollziehungsverordnung).
 */
export function titelParagraphen(erlass: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of erlass.matchAll(/§{1,2}\s*(\d+[a-z]*)((?:\s+[A-Za-zÄÖÜäöü]{2,}){1,3})/g)) {
    out.set(m[1].toLowerCase(), folgeSignatur(m[2]));
  }
  return out;
}

/**
 * Signatur der auf ein «§» folgenden Wörter: bis zu drei, klein, einfach
 * getrennt. «des Lohngesetzes» → 'des lohngesetzes'.
 *
 * DREI WÖRTER STATT EINEM (Gegenprüfung Runde 3/C2b). Ein einzelnes Folgewort
 * genügt nicht: BS-390.720 trägt im Titel «§ 17 des Gesetzes …» und «§ 1 des
 * Gesetzes …» — die Signatur wäre zweimal bloss «des», und JEDES Fremdzitat der
 * Form «§ 1 des Gesetzes über X» träfe sie. Der Schutz gegen fremde § hätte
 * dann ein Loch von der Breite des Wortes «des».
 * BEKANNTE RESTLÜCKE (Gegenprüfung Runde 4/D2, §8): «des gesetzes über» und
 * «des gesetzes betreffend» sind selbst noch generisch genug, um mit der
 * häufigsten Zitierform zusammenzufallen — ein Fremdzitat «§ 1 des Gesetzes
 * über die Sozialhilfe …» trifft die Signatur von BS-390.720 und beendet das
 * Fenster dann NICHT. Eine Verlängerung um ein viertes Wort schliesst das nicht
 * allgemein (auch das vierte kann generisch sein) und verengt zugleich die
 * echten Titel-§-Treffer; die Klasse bleibt darum benannt statt halb behandelt.
 * Live-Wirkung heute: keine — für die betroffenen Erlasse existiert kein Shard.
 * Testpin hält das Ist-Verhalten fest.
 * Ein Füllwort-Verbot wäre der falsche Ausweg — BS-164.160 heisst amtlich
 * «… gemäss § 10 des Lohngesetzes», sein Titel-§ folgt also selbst auf «des»
 * (an genau diesem Fall ist die Füllwort-Fassung gescheitert). Drei Wörter
 * trennen beides: «des lohngesetzes» ≠ «des gesetzes über».
 */
function signaturPasst(erwartet: string, gesehen: string): boolean {
  return erwartet.startsWith(gesehen) || gesehen.startsWith(erwartet);
}

function folgeSignatur(roh: string): string {
  return roh.trim().toLowerCase().split(/\s+/).slice(0, 3).join(' ');
}

/**
 * Kantone, für die es zwar Entscheide, aber (noch) keinen deklarierten
 * Systematik-Präfix gibt. Benannte Lücke statt stiller (§8).
 */
export function kantoneOhneResolver(kantone: Iterable<string>): string[] {
  const raus = new Set<string>();
  for (const k of kantone) {
    if (k === 'CH') continue;
    if (!SYSTEMATIK_PRAEFIX.has(k)) raus.add(k);
  }
  return [...raus].sort();
}

/** Ein aufgelöstes kantonales Norm-Zitat. */
export interface KantonZitat {
  /** Erlass-key des kantonalen Snapshots ('BS-154.100'). */
  erlass: string;
  /** Artikel-Token in Shard-Form (klein, whitespace-frei): '93', '63b'. */
  artikel: string;
  /** Welcher Kanal die Erlass-Seite aufgelöst hat. */
  kanal: 'nummer' | 'abkuerzung';
}

/** Zähl-Befund eines Laufs — für die ehrliche Bilanz (§6.7/§8). */
export interface AufloesungsBefund {
  /** Aufgelöste (Erlass, Artikel)-Paare, dedupliziert. */
  zitate: KantonZitat[];
  /** §-Gruppen ohne auflösbare Erlass-Seite (Erlass nicht im Bestand o. kein Locator). */
  ohneErlass: number;
  /** Dokumentlokale Abkürzungen, die wegen Bundes-Namensvetter NICHT gebunden wurden. */
  abkAusgeschlossen: string[];
  /** Nummern-Locatoren, deren Erlass nicht im kantonalen Snapshot-Bestand steht. */
  nummerOhneBestand: string[];
  /** Als Quell-Tippfehler verworfen: der Korpus bindet die Abkürzung mehrheitlich anders. */
  nummerMinderheit: string[];
}

// ── Das Erlass-Fenster hinter einer §-Gruppe ────────────────────────────────
//
// Wie weit darf zwischen «§ N» und der Erlass-Nummer stehen? Am Korpus gemessen
// ist der Zwischenraum der ausgeschriebene GESETZESTITEL: «des Reglements über
// das Honorar und die Entschädigung der berufsmässigen Vertretung im
// Gerichtsverfahren» sind 96 Zeichen. 180 deckt die belegten Titel; ein
// grösseres Fenster kauft keine Treffer, sondern nur Risiko.
const FENSTER = 180;

/**
 * Zeichen, die das Fenster BEENDEN — jedes ein belegter Falsch-Positiv-Kanal,
 * kein vorsorglicher Zaun (FP-Analyse am BS-Korpus, 28.7.2026):
 *
 *  · `\n`  — Absatzgrenze.
 *  · `)`/`]` — die schliessende Klammer beendet das Zitat. BELEG:
 *            «§ 71 Abs. 1 Ziffer 1 lit. b GOG). Weder aus dem GOG noch aus dem
 *            Organisationsreglement des Zivilgerichts (SG 154.170)» — ohne diese
 *            Grenze hinge § 71 GOG am Organisationsreglement. Zwei weitere
 *            Belege derselben Form im Korpus.
 *
 * ── «§» IST HIER NICHT MEHR AUFGEFÜHRT (Gegenprüfung Runde 2/B1) ────────────
 * Es war der wichtigste Einzelschutz — «nur die letzte §-Gruppe vor dem Locator
 * bindet» — und genau darum die grösste Falle, sobald der amtliche TITEL eines
 * Erlasses selbst ein «§» trägt: dann ist die «letzte §-Gruppe» das § des
 * Titels. Der Schutz bleibt in voller Schärfe bestehen, wird aber nicht mehr
 * blind über das Zeichen ausgeübt, sondern nach der Frage, ob das «§» zum Titel
 * DIESES Erlasses gehört (Nummer und Folgewort wie im amtlichen Titel) oder zu
 * einem fremden Zitat. Der Code steht in `loeseKantonZitate`, die Erklärung
 * dort und bei `titelParagraphen`.
 */
const FENSTER_ENDE = /[\n)\]]/;

/**
 * Ein Erlass-Kürzel VOR der ersten öffnenden Klammer beendet das Zitat ebenfalls
 * — der Erlass ist damit schon genannt, ein späterer Locator gehört zu einem
 * anderen. BELEG: «§ 19 Abs. 1 KESG mangels spezialgesetzlicher Regelung nach
 * dem Gesetz über die Verfassungs- und Verwaltungsrechtspflege (VRPG, SG
 * 270.100)» — ohne diese Regel hinge § 19 KESG am VRPG (2 Belege im Korpus).
 *
 * «Kürzel» heisst hier: ein Token mit ≥2 Grossbuchstaben, das nicht in
 * `INVALID_LAW_CODES` steht. Die Blockliste wird WIEDERVERWENDET, nicht kopiert
 * (§5/§10): ohne sie zählten die Struktur-Marker «Abs.», «Ziff.», «Bst.» als
 * Kürzel und die Regel frässe genau die legitimen Ketten
 * («§§ 88 Abs. 1 und 93 Abs. 1 Ziff. 1 des Gerichtsorganisationsgesetzes [GOG,
 * SG 154.100]») — gemessen 932 statt 221 Verwürfe.
 */
function traegtKuerzelVorKlammer(fenster: string): boolean {
  const vorKlammer = fenster.split(/[([]/)[0];
  for (const tok of vorKlammer.match(/[A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9]{1,11}/g) ?? []) {
    if (INVALID_LAW_CODES.has(normalisiereAbk(tok))) continue;
    if ((tok.match(/[A-ZÄÖÜ]/g) ?? []).length >= 2) return true;
  }
  return false;
}

/** Locator im Fenster: «SG 154.100», «SG BeE 786.100». */
function locatorMuster(praefix: string): RegExp {
  return new RegExp(`\\b${praefix}\\s+(?:(${GEMEINDE_PRAEFIX})\\s+)?(\\d{3}\\.\\d{2,3})\\b`);
}

/**
 * Dokumentlokale Abkürzungs-Bindung: «(GOG, SG 154.100)», «[Honorarreglement,
 * HoR; SG 291.400]». Gefangen wird der Klammer-Inhalt VOR dem Locator; daraus
 * nimmt `kuerzelAusKlammer` den abschliessenden Kürzel-Lauf.
 *
 * GEMEINDE-PRÄFIX WIRD GEFANGEN (Gegenprüfung Runde 2/B5). Die Gruppe war
 * `(?:…)`, also nicht-fangend — der Aufrufer nahm dann `m[2]` als Nummer und
 * verlor «BeE»/«RiE». Folge: «[StO RiE, SG RiE 640.100]» band die Abkürzung an
 * die Nummer '640.100' statt an 'RiE 640.100', und «§ 22 StO RiE» landete
 * anschliessend auf dem KANTONALEN STEUERGESETZ. Im heutigen Korpus wirkungslos
 * (die zwei vorhandenen Gemeinde-Locatoren neutralisieren sich gegenseitig über
 * die Mehrdeutigkeits-Regel), aber scharf, sobald ein dritter dazukommt — und
 * eine Falle, die nur heute zufällig nicht zuschnappt, ist eine Falle (§6.7).
 * Der Locator-Pfad fing den Präfix von Anfang an; hier war die Symmetrie verletzt.
 */
function bindungsMuster(praefix: string): RegExp {
  return new RegExp(
    `[([]([^()\\[\\]\\n]{0,80}?)[;,]\\s*${praefix}\\s+(?:(${GEMEINDE_PRAEFIX})\\s+)?(\\d{3}\\.\\d{2,3})\\b`,
    'g',
  );
}

/** Volle Systematik-Nummer aus einem Bindungs-Treffer (mit Gemeinde-Präfix). */
function nummerAusBindung(m: RegExpMatchArray): string {
  return (m[2] ? `${m[2]} ` : '') + m[3];
}

/**
 * Abschliessender Kürzel-Lauf eines Klammer-Inhalts: «Honorarreglement, HoR» →
 * 'HoR', «EG StPO» → 'EG StPO'.
 *
 * MEHRTEILIG, nicht bloss das letzte Token (§1). Die kantonalen
 * Einführungserlasse heissen «EG StPO», «EG ZGB», «EG KVG» — nähme man nur das
 * letzte Token, entstünde die Abkürzung «StPO», und die ist der Bundes-Erlass.
 * Der Ausschluss (b) fängt das zwar ab, aber um den Preis, dass die kantonalen
 * Einführungsgesetze GAR nicht mehr auflösbar wären. Der volle Lauf «EG StPO»
 * ist eindeutig kantonal und kollidiert mit nichts.
 */
function kuerzelAusKlammer(inhalt: string): string | null {
  const tokens = inhalt.trim().split(/\s+/);
  const lauf: string[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i].replace(/[^A-Za-zÄÖÜäöü0-9]/g, '');
    if (!t || t.length < 2) break;
    if ((t.match(/[A-ZÄÖÜ]/g) ?? []).length < 2) break;
    lauf.unshift(t);
  }
  return lauf.length ? lauf.join(' ') : null;
}

/**
 * Kantonale Norm-Zitate EINES Dokuments auflösen. Rein und deterministisch (§2):
 * gleicher Text + gleicher Bestand → gleiche Ausgabe, in stabiler Ordnung.
 *
 * Ablauf, zwei Durchgänge über denselben Text:
 *  1. Bindungen sammeln (Klammer-Kürzel → amtliche Nummer → Erlass-key),
 *     Bundes-Namensvettern verworfen, dokumentintern mehrdeutige verworfen.
 *  2. §-Gruppen durchgehen; je Gruppe zuerst den Nummern-Kanal versuchen, sonst
 *     — und nur wenn die Abkürzung UNMITTELBAR hinter der Gruppe steht — den
 *     Abkürzungs-Kanal.
 *
 * Zwei Durchgänge, weil ein Entscheid den Erlass oft erst in der zweiten
 * Erwägung einführt und ihn in der ersten schon abgekürzt nennt. Ein
 * Ein-Durchgang-Verfahren machte das Ergebnis von der Lesereihenfolge abhängig
 * — genau die Build-Pfad-Abhängigkeit, die §2 ausschliesst.
 */
export function loeseKantonZitate(
  text: string,
  kanton: string,
  bestand: KantonBestand,
  /**
   * Korpus-dominante Bindung «normalisierte Abkürzung → Systematik-Nummer»
   * (W2·7-BEZUG, Gegenprüfung Runde 1/B2). Optional — ohne sie verhält sich die
   * Funktion wie zuvor.
   *
   * WOGEGEN SIE STEHT — gemessen, nicht vermutet. Die amtlichen Portaltexte
   * enthalten Tippfehler in der Systematik-Nummer, und ein Tippfehler kann eine
   * andere, EXISTIERENDE Nummer treffen. Belegte Fälle im BS-Korpus:
   *   · «Gerichtsorganisationsgesetzes (GOG, SG 153.100)» — amtlich 154.100;
   *     153.100 ist das Organisationsgesetz (Regierungsrat) und hat die
   *     zitierten §§ 88/92/93 gar nicht.
   *   · «(BPG, SG 730.110)» / «(HBG, SG 730.110)» — amtlich 730.100 (Bau- und
   *     Planungsgesetz); 730.110 ist die zugehörige VERORDNUNG.
   * Die Nummern-Identität ist nur so unbestechlich wie die Nummer selbst.
   *
   * DIE REGEL: bindet der Korpus dieselbe Abkürzung mehrheitlich an eine ANDERE
   * Nummer, wird die Minderheits-Nummer nicht gebunden. Kein geratener
   * Schwellenwert — «mehrheitlich» heisst strikt mehr Belege für die andere.
   * Der Verwurf wird ausgewiesen (`nummerMinderheit`), nie still ausgeführt (§6.7).
   */
  dominanz?: ReadonlyMap<string, string>,
  /**
   * Amtlicher Erlass-String je Systematik-Nummer (`ladeKantonTitel`). Speist
   * zwei Riegel der Gegenprüfung Runde 2: die Kürzel-Konsistenz (B2) und die
   * Titel-«§»-Erkennung (B1). Optional — fehlt sie, verhält sich der Resolver
   * wie zuvor, und beide Riegel schweigen.
   */
  titel?: ReadonlyMap<string, string>,
): AufloesungsBefund {
  const leer: AufloesungsBefund = {
    zitate: [], ohneErlass: 0, abkAusgeschlossen: [], nummerOhneBestand: [], nummerMinderheit: [],
  };
  const sys = SYSTEMATIK_PRAEFIX.get(kanton);
  if (!text || !sys || bestand.size === 0) return leer;

  const abkAusgeschlossen = new Set<string>();
  const nummerOhneBestand = new Set<string>();
  const nummerMinderheit = new Set<string>();

  // ── Durchgang 1: dokumentlokale Abkürzungen binden ────────────────────────
  const lokal = new Map<string, string>();     // normalisierte Abk → Erlass-key
  const mehrdeutig = new Set<string>();
  for (const m of text.matchAll(bindungsMuster(sys.praefix))) {
    const sr = nummerAusBindung(m);
    const key = bestand.get(sr);
    if (!key) { nummerOhneBestand.add(sr); continue; }
    const abk = kuerzelAusKlammer(m[1]);
    if (!abk) continue;
    const norm = normalisiereAbk(abk);
    if (INVALID_LAW_CODES.has(norm)) continue;
    // Tippfehler-Riegel, ACHSE 1 (Korpus-Mehrheit): der Korpus bindet diese
    // Abkürzung mehrheitlich an eine andere Nummer → diese Nummer hier NICHT
    // verwenden, weder für den Abkürzungs- noch für den Nummern-Kanal.
    const dom = dominanz?.get(norm);
    if (dom !== undefined && dom !== sr) {
      nummerMinderheit.add(`${abk}: ${sr} (Korpus-Mehrheit ${dom})`);
      continue;
    }
    // ACHSE 2 (ausgeschriebener Titel): greift dort, wo Achse 1 blind ist — wenn
    // die falsche Bindung die einzige ihrer Abkürzung ist und es folglich keine
    // Mehrheit gibt. Anlassfall «(HBG, SG 730.110)»; Begründung und Messung bei
    // `titelWiderspricht`. Geprüft wird der Text VOR der Klammer, dort steht der
    // ausgeschriebene Erlass-Titel.
    const davor = titelPhrase(text.slice(Math.max(0, (m.index ?? 0) - 140), m.index ?? 0));
    if (titelWiderspricht(davor, titel?.get(sr), m[0])) {
      nummerMinderheit.add(`${abk}: ${sr} (genannter Titel widerspricht «${titel!.get(sr)!.slice(0, 45)}»)`);
      continue;
    }
    // AUSSCHLUSS (a), beidseitig: was das Bundes-Register kennt, wird nie
    // kantonal gebunden — lieber die Folge-Nennungen verlieren (§1/§8).
    if (normKeyFuerAbk(abk)) { abkAusgeschlossen.add(abk); continue; }
    const bisher = lokal.get(norm);
    if (bisher !== undefined && bisher !== key) { mehrdeutig.add(norm); continue; }
    lokal.set(norm, key);
  }
  // Dokumentintern mehrdeutig (dieselbe Abkürzung, zwei Erlasse) → beidseitig
  // verwerfen, nie raten. Gleiche Regel wie ABK_KOLLISIONEN auf Bundesebene (§5).
  for (const n of mehrdeutig) lokal.delete(n);

  // ── Durchgang 2: §-Gruppen auflösen ───────────────────────────────────────
  const locator = locatorMuster(sys.praefix);
  const gesehen = new Set<string>();
  const zitate: KantonZitat[] = [];
  let ohneErlass = 0;

  for (const gruppe of extrahiereParagraphGruppen(text)) {
    const roh = text.slice(gruppe.ende, gruppe.ende + FENSTER);

    let erlass: string | null = null;
    let kanal: KantonZitat['kanal'] = 'nummer';

    // ── TITEL-«§»-BEHANDLUNG (Gegenprüfung Runde 2/B1) ──────────────────────
    // Das Fenster wird ZWEIMAL gelesen. Erst OHNE den «§»-Stopp, nur bis zur
    // Absatz-/Klammergrenze: so ist die Nummer überhaupt sichtbar, auch wenn
    // der amtliche Titel des Erlasses selbst ein «§» enthält. Erst mit der
    // Nummer in der Hand lässt sich entscheiden, ob ein dazwischenliegendes «§»
    // zum TITEL dieses Erlasses gehört (dann ist es kein fremdes Zitat und darf
    // das Fenster nicht beenden) oder zu einem anderen (dann schon).
    // Ohne diese Reihenfolge ist die Frage nicht beantwortbar — man müsste den
    // Erlass kennen, bevor man ihn gefunden hat.
    const weitStop = roh.search(FENSTER_ENDE);
    const weit = weitStop >= 0 ? roh.slice(0, weitStop) : roh;
    const lm = locator.exec(weit);
    if (lm && !traegtKuerzelVorKlammer(weit.slice(0, lm.index))) {
      const sr = (lm[1] ? `${lm[1]} ` : '') + lm[2];
      const titelPar = titelParagraphen(titel?.get(sr) ?? '');
      const zwischen = weit.slice(0, lm.index);
      // Jedes «§» zwischen Zitat und Locator muss sich als Titel-«§» dieses
      // Erlasses ausweisen — Nummer UND Folgewort wie im amtlichen Titel.
      // Sonst steht dort ein fremdes Zitat, und die Bindung gehört ihm.
      let fremdesParagraph = false;
      for (const p of zwischen.matchAll(/§{1,2}\s*(\d+[a-z]*)((?:\s+[A-Za-zÄÖÜäöü]{2,}){0,3})/g)) {
        const sig = folgeSignatur(p[2] ?? '');
        const erwartet = titelPar.get(p[1].toLowerCase());
        if (!sig || erwartet === undefined || !signaturPasst(erwartet, sig)) { fremdesParagraph = true; break; }
      }
      // Die zitierende Gruppe SELBST darf nicht das Titel-«§» sein: «§ 15a
      // Lohngesetz» IST der Titel von BS-164.410 und zitiert ihn nicht.
      //
      // MEHRGLIEDRIGE GRUPPEN EINGESCHLOSSEN (Gegenprüfung Runde 3/C2a): die
      // frühere Fassung verlangte `artikel.length === 1` und liess damit
      // «§§ 15a und 16 Lohngesetz … (SG 164.410)» beide Nummern binden — das
      // Titel-§ 15a wieder mit. Geprüft wird jetzt das ERSTE Glied, denn es
      // trägt die Titel-Stelle; ist es das Titel-«§», ist die ganze Gruppe
      // Titelbestandteil und keine Fundstelle. Heute ohne Live-Wirkung (keine
      // solche Stelle im Korpus) — aber eine Falle, die nur zufällig nicht
      // zuschnappt, ist eine Falle (§6.7).
      const eigeneSig = folgeSignatur((/^((?:\s+[A-Za-zÄÖÜäöü]{2,}){1,3})/.exec(roh)?.[1]) ?? '');
      const erwarteteSig = titelPar.get(gruppe.artikel[0]);
      const istTitelParagraph = !!eigeneSig && erwarteteSig !== undefined
        && signaturPasst(erwarteteSig, eigeneSig);

      if (!fremdesParagraph && !istTitelParagraph) {
        // DIESELBEN RIEGEL WIE IM ABKÜRZUNGS-KANAL, aber JE VORKOMMEN statt
        // dokumentweit (Gegenprüfung Runde 3/C1). Vorher sperrte eine einzige
        // Fehlbindung die Nummer für das GANZE Dokument — im Anlassfall
        // VD.2021.219 nahm die HBG-Fehlbindung die daneben völlig korrekte
        // Kante «§ 87 Abs. 1 Bau- und Planungsverordnung (BPV, SG 730.110)»
        // mit. Ein Riegel darf nur das treffen, was er belegt hat (§1).
        const abkImFenster = kuerzelAusKlammer(zwischen.replace(/^[^([]*[([]/, ''));
        const domF = abkImFenster ? dominanz?.get(normalisiereAbk(abkImFenster)) : undefined;
        // Im Nummern-Kanal endet `zwischen` MIT der öffnenden Klammer der
        // Kurzform («… des Hochbaugesetzes (HBG, »). Dieser Klammer-Anlauf wird
        // abgeschnitten, sonst bliebe als «Titel» bloss die Kurzform übrig und
        // der Widerspruch wäre unsichtbar.
        const zwischenTitel = titelPhrase(zwischen.replace(/[([][^([]*$/, ''));
        // Umfeld ist NUR die Bindungsklammer, nicht das ganze Fenster
        // (Gegenprüfung Runde 5/F1): die Rettung beruht darauf, dass Kürzel und
        // Nummer AUS DERSELBEN amtlichen Angabe stammen. Ein Kürzel, das
        // irgendwo sonst im Fenster steht, bestätigt diese Bindung nicht — es
        // stünde dort auch, wenn es zu einem anderen Erlass gehört.
        const bindungsKlammer = /[([][^([]*$/.exec(zwischen)?.[0] ?? '';
        if (titelWiderspricht(zwischenTitel, titel?.get(sr), bindungsKlammer)) {
          nummerMinderheit.add(`${sr} (genannter Titel widerspricht)`);
        } else if (domF !== undefined && domF !== sr) {
          nummerMinderheit.add(`${abkImFenster}: ${sr} (Korpus-Mehrheit ${domF})`);
        } else {
          const key = bestand.get(sr);
          if (key) erlass = key;
          else nummerOhneBestand.add(sr);
        }
      }
    }

    if (!erlass) {
      // Abkürzungs-Kanal: die Abkürzung muss UNMITTELBAR hinter der Gruppe
      // stehen («§ 92 Abs. 1 Ziff. 4 GOG»). Kein Fenster, keine Prosa dazwischen
      // — jede Lockerung hier wäre die Fehlerklasse, die FENSTER_ENDE für den
      // Nummern-Kanal gerade schliesst, nur ohne dessen Nummern-Identität.
      const am = /^\s+([A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9]{1,11}(?:\s+[A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9]{1,11})?)/.exec(roh);
      if (am) {
        const treffer = lokal.get(normalisiereAbk(am[1])) ?? lokal.get(normalisiereAbk(am[1].split(/\s+/)[0]));
        if (treffer) { erlass = treffer; kanal = 'abkuerzung'; }
      }
    }

    if (!erlass) { ohneErlass++; continue; }
    for (const artikel of gruppe.artikel) {
      const id = `${erlass}/${artikel}`;
      if (gesehen.has(id)) continue;
      gesehen.add(id);
      zitate.push({ erlass, artikel, kanal });
    }
  }

  return {
    zitate,
    ohneErlass,
    abkAusgeschlossen: [...abkAusgeschlossen].sort(),
    nummerOhneBestand: [...nummerOhneBestand].sort(),
    nummerMinderheit: [...nummerMinderheit].sort(),
  };
}

/**
 * Korpus-dominante Bindung Abkürzung → Systematik-Nummer, aus allen Texten EINES
 * Kantons. Deterministisch (§2): bei Gleichstand gewinnt NIEMAND (der Eintrag
 * entfällt), sonst hinge das Ergebnis an der Dokument-Reihenfolge — und ein
 * Riegel, der je nach Lesereihenfolge anders greift, ist kein Riegel.
 */
export function baueNummernDominanz(texte: Iterable<string>, kanton: string): Map<string, string> {
  const sys = SYSTEMATIK_PRAEFIX.get(kanton);
  const zaehler = new Map<string, Map<string, number>>();
  if (!sys) return new Map();
  for (const text of texte) {
    if (!text) continue;
    for (const m of text.matchAll(bindungsMuster(sys.praefix))) {
      const abk = kuerzelAusKlammer(m[1]);
      if (!abk) continue;
      const norm = normalisiereAbk(abk);
      if (INVALID_LAW_CODES.has(norm)) continue;
      const je = zaehler.get(norm) ?? (zaehler.set(norm, new Map()), zaehler.get(norm)!);
      // Volle Nummer INKLUSIVE Gemeinde-Präfix (B5): «RiE 640.100» ist ein
      // anderer Erlass als «640.100». Vor dem Fix zählte hier m[2] — nach dem
      // Fangen der Gemeinde-Gruppe wäre das der Präfix selbst gewesen.
      const nr = nummerAusBindung(m);
      je.set(nr, (je.get(nr) ?? 0) + 1);
    }
  }
  const out = new Map<string, string>();
  for (const norm of [...zaehler.keys()].sort()) {
    const je = zaehler.get(norm)!;
    let beste: string | null = null;
    let max = 0;
    let gleichstand = false;
    for (const sr of [...je.keys()].sort()) {
      const n = je.get(sr)!;
      if (n > max) { max = n; beste = sr; gleichstand = false; }
      else if (n === max) gleichstand = true;
    }
    if (beste && !gleichstand) out.set(norm, beste);
  }
  return out;
}
