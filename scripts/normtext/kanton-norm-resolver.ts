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
// «Art.»-Zitate erzeugen (der grössere Teil: 10'040 der 12'316 kantonalen
// Kanten). Dieser zweite Kanal läuft über `artikelSchluesselMitBefund` und
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

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  extrahiereParagraphGruppen, INVALID_LAW_CODES,
} from '../../src/lib/rechtsprechung/zitat-extraktion';
import { normKeyFuerAbk, normalisiereAbk } from './entscheide-mapping';

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
 * Zeichen, die das Fenster BEENDEN — jedes davon ist ein belegter Falsch-Positiv-
 * Kanal, kein vorsorglicher Zaun (FP-Analyse am BS-Korpus, 28.7.2026):
 *
 *  · `§`   — zwischen zwei §-Zitaten steht nie EIN Erlass. Wirkung: nur die
 *            LETZTE §-Gruppe vor einem Locator kann ihn binden. Das ist der
 *            wichtigste Einzelschutz der ganzen Regel.
 *  · `\n`  — Absatzgrenze.
 *  · `)`/`]` — die schliessende Klammer beendet das Zitat. BELEG:
 *            «§ 71 Abs. 1 Ziffer 1 lit. b GOG). Weder aus dem GOG noch aus dem
 *            Organisationsreglement des Zivilgerichts (SG 154.170)» — ohne diese
 *            Grenze hinge § 71 GOG am Organisationsreglement. Zwei weitere
 *            Belege derselben Form im Korpus.
 */
const FENSTER_ENDE = /[§\n)\]]/;

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
 */
function bindungsMuster(praefix: string): RegExp {
  return new RegExp(
    `[([]([^()\\[\\]\\n]{0,80}?)[;,]\\s*${praefix}\\s+(?:${GEMEINDE_PRAEFIX}\\s+)?(\\d{3}\\.\\d{2,3})\\b`,
    'g',
  );
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
  const tippfehlerNummern = new Set<string>();
  for (const m of text.matchAll(bindungsMuster(sys.praefix))) {
    const sr = m[2];
    const key = bestand.get(sr);
    if (!key) { nummerOhneBestand.add(sr); continue; }
    const abk = kuerzelAusKlammer(m[1]);
    if (!abk) continue;
    const norm = normalisiereAbk(abk);
    if (INVALID_LAW_CODES.has(norm)) continue;
    // Tippfehler-Riegel: der Korpus bindet diese Abkürzung mehrheitlich an eine
    // andere Nummer → diese Nummer hier NICHT verwenden, weder für die
    // Abkürzungs- noch für den Nummern-Kanal desselben Zitats.
    const dom = dominanz?.get(norm);
    if (dom !== undefined && dom !== sr) {
      nummerMinderheit.add(`${abk}: ${sr} (Korpus-Mehrheit ${dom})`);
      tippfehlerNummern.add(sr);
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
    const stop = roh.search(FENSTER_ENDE);
    const fenster = stop >= 0 ? roh.slice(0, stop) : roh;

    let erlass: string | null = null;
    let kanal: KantonZitat['kanal'] = 'nummer';

    const lm = locator.exec(fenster);
    if (lm && !traegtKuerzelVorKlammer(fenster.slice(0, lm.index))) {
      const sr = (lm[1] ? `${lm[1]} ` : '') + lm[2];
      // Als Tippfehler erkannte Nummern wirken auch hier: sonst käme dieselbe
      // Fehlbindung über den Nummern-Kanal zurück, die Durchgang 1 gerade
      // verworfen hat (§5 — eine Regel, beide Kanäle).
      if (tippfehlerNummern.has(sr)) { /* verworfen, in nummerMinderheit ausgewiesen */ }
      else {
        const key = bestand.get(sr);
        if (key) erlass = key;
        else nummerOhneBestand.add(sr);
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
      je.set(m[2], (je.get(m[2]) ?? 0) + 1);
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
