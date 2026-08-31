/**
 * ZH-PDF-Adapter — Norm-Volltext aus den Text-PDF der Zürcher
 * Gesetzessammlung (zhlex), für die Norm-Vorschau-Popover. Browserlos:
 * fetch + pdfjs-Text-Extraktion zur BUILD-ZEIT (kein Headless-Browser).
 *
 * Mechanik (empirisch verifiziert §7, Spike 16.6.2026):
 *
 * 1. Registry-Seite zh.ch/.../zhlex-ls/erlass-…html verlinkt die PDF über
 *    einen OpenAttachment-Link auf notes.zh.ch:
 *      <a … href="https://www.notes.zh.ch/appl/zhlex_r.nsf/OpenAttachment?Open
 *         &docid=<ID>&file=<datei>.pdf">
 * 2. Dieser OpenAttachment-Link liefert KEIN PDF, sondern einen ~153-Byte-
 *    HTML-JS-Redirect:
 *      <script>window.location="/appl/zhlex_r.nsf/WebView/<ID>/$File/<datei>.pdf"</script>
 *    Dem window.location (relativ zu notes.zh.ch) folgen → echtes Text-PDF
 *    (Acrobat Distiller, application/pdf).
 * 3. Das PDF ist ein Text-PDF (kein Scan). §-Marker im extrahierten Text:
 *    «§ N.» (mit Punkt). Absätze als hochgestellte Ziffern (1, 2, 3);
 *    lit.-Punkte «a.»/«b.»; eingebettete Gebühren-Tabellen (Streitwert/Gebühr).
 *
 * PDF-Layout (Spiegelrand-Buch, §7):
 *   - Body-Spalte wechselt je Seitenparität (ungerade x∈[54,329], gerade
 *     x∈[88,363]). Body-Schrift h≈9.2pt.
 *   - Marginalie (Sachtitel/Randnote) steht im AUSSEN-Rand: gerade Seiten
 *     links (x≈28), ungerade Seiten rechts (x≈337), Schrift h≈7.5pt → wird
 *     als redaktionell verworfen (NICHT Normtext).
 *   - ACHTUNG: Gebühren-TABELLEN haben dieselbe Schrifthöhe (7.5pt) wie die
 *     Marginalie — sie liegen aber in der Body-Spalte und werden darum über
 *     die x-Position (innerhalb der Body-Spalte) als Inhalt behalten.
 *   - Absatz-/Fussnoten-Hochstellung h≈5.7pt: eine führende Ziffer am
 *     Zeilenanfang = Absatznummer; eine Ziffer mitten/am Ende eines Worts =
 *     Fussnoten-Verweis → verworfen.
 *   - Kopf-/Fusszeilen-Bänder (y>520 oben, y<60 unten): Erlasstitel + LS-Nr.,
 *     «1. 1. 15 - 87», Seitenzahlen → verworfen.
 *   - Silbentrennung am Zeilenende («Gebüh-\nren» → «Gebühren»): zusammengefügt.
 *
 * Drift-Token (§7 d): es gibt kein version_uid. `quelleHash` = sha256 der
 * ROHEN PDF-Bytes (Fix-Runde 3 — vorher der Hash der Extraktion, der jede
 * Quell-Änderung in einem verworfenen Teil überspringt; Begründung im
 * Feld-Kommentar bei ZhErgebnis.meta). `extraktHash` daneben trennt
 * «neu gesetzt» von «Wortlaut geändert».
 *
 * `stand` = **Publikationsdatum der geltenden Nachtragsfassung aus dem
 * Registry-HTML** (`<dt>Publikationsdatum</dt>`, s. leseZhPublikationsdatum).
 * Fallback-Kette danach: UR-Inkrafttreten aus dem Registry-URL-Slug
 * (leseZhStandAusUrl), dann der Loseblatt-Nachtragsmarker aus dem PDF-Fussband
 * («1. 1. 15 - 87», leseZhStand). Der Fussband-Marker ist NICHT die Regel — er
 * kann dem Publikationsdatum vorauslaufen (Fehlerklasse `check:stand-zukunft`).
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). Die reine Parser-
 * Funktion extrahiereZhParagraphen() arbeitet ohne Netz/FS (testbar gegen
 * eine Fixture echten extrahierten ZH-Texts); holeZhPdf() ist die Netz-Hülle.
 */

import { createHash } from 'node:crypto';
import { typisiereSpalten, type Spalte } from './mehrspaltige-tabelle.ts';
import { fetchMitWiederholung } from './netz-retry.ts';
import { fuegeZeilen } from './zh-text.ts';
import {
  extrahiereZhStreitwertStaffel,
  extrahiereZhNotariatsTarif,
} from './zh-tarif-geometrie.ts';
import {
  SAMMEL_MARKER,
  SAMMEL_ZEILE,
  expandiereSammelbereich,
} from './zh-sammelkopf.ts';
import {
  holeZhQuelle,
  modusAusUmgebung,
  type CacheModus,
} from './zh-pdf-cache.ts';

// Bestehende Aufrufer (Tests, Werkzeuge) importieren die Tarif-Geometrie
// weiterhin über diesen Adapter — der Umzug bleibt für sie unsichtbar.
export {
  extrahiereZhStreitwertStaffel,
  extrahiereZhNotariatsTarif,
} from './zh-tarif-geometrie.ts';
export { SAMMEL_MARKER, expandiereSammelbereich } from './zh-sammelkopf.ts';
export { fuegeZeilen } from './zh-text.ts';
// (segmentiereAnhangZiffern wird für ZH NICHT mehr genutzt — der Anhang wird
//  spaltenbewusst über extrahiereZhAnhangSpalten gelesen; generischer
//  Segmentierer bleibt für SG/LU im adapter-pdf.)

// Kanton-Nachzug aufs kanonische `spalten`-Modell (G3b Schritt 2, Klasse B,
// 5.7.2026): die x-koordinaten-rekonstruierten Streitwert-Staffeln (ZH-215.3 §4,
// ZH-211.11 §3+§4) werden — wie die ·/—-Klasse-A-Tabellen in reichereMehrspaltig —
// beim Emittieren typisiert (T-B1/T-B4). Werte (zeilen) bleiben BYTE-GLEICH; nur
// die Spalten-Typ-Metadaten kommen hinzu. So produziert ein frischer Generatorlauf
// dasselbe kanonische Modell wie der committete Snapshot (kein Legacy-Regress).
function zuKanonisch(t: { kopf: string[]; zeilen: string[][] }): {
  spalten: Spalte[];
  zeilen: string[][];
} {
  return { spalten: typisiereSpalten(t.kopf, t.zeilen), zeilen: t.zeilen };
}

// ─────────────────────────────────────────────────────────────────────────────
// Typen
// ─────────────────────────────────────────────────────────────────────────────

export interface ZhBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  /** Stufe 2: Mehrspalten-Tabelle (Streitwert/Grundgebühr/Zuschlag u.ä.).
   *  Kanton-Nachzug (G3b Schritt 2): kanonisches `spalten`-Modell (typisiert);
   *  `kopf` bleibt für Abwärtskompat, ist aber im ZH-Pfad ersetzt (zuKanonisch). */
  mehrspaltig?: { spalten?: Spalte[]; kopf?: string[]; zeilen: string[][] };
  /**
   * VERWEIS-Spalte einer Tarif-Zeile als EIGENES Feld (A2, Fix-Runde 3).
   *
   * VORHER hängte der Adapter den Verweis als Fliesstext an den Wortlaut —
   * «… (vgl. Ziff. 2.2.1, 2.2.2)». Dieser Zusatz steht so in KEINEM amtlichen
   * PDF; er war eine Synthese des Generators, also ein erfundenes Zitat (§7:
   * massgeblich ist die amtliche Fassung — ein Snapshot darf nichts enthalten,
   * was die Quelle nicht trägt). 32 Einträge in ZH-243 waren betroffen.
   * Zusätzlich kollabierten dabei ZWEI verschiedene Quell-Spalten
   * («Grundbuchgebühren siehe Ziff.:», S. 5–7, und «Beurkundungsgebühren siehe
   * Ziff.:», S. 8–14) auf denselben Wortlaut — die Unterscheidung ging verloren.
   *
   * JETZT: `etikett` ist der am Spaltenkopf GELESENE Titel (nie gesetzt),
   * `ziffern` sind die Zellen-Werte. Der Zitattext bleibt quellrein.
   */
  verweis?: { etikett: string; ziffern: string };
}

export interface ZhArtikel {
  bloecke: ZhBlock[];
}

export interface ZhErgebnis {
  meta: {
    titel: string;
    stand: string;
    /**
     * Drift-Token (§7 d) — seit Fix-Runde 3 der sha256 der ROHEN PDF-Bytes.
     *
     * VORHER hashte dieses Feld die EXTRAKTION (alle Artikel + items). Das ist
     * strukturell blind: ändert die amtliche Quelle etwas in einem Teil, den
     * der Adapter bewusst verwirft (Übergangs-/Schlussapparat, PBG-Anhang,
     * Fussnoten-Apparat — bei ZH-700.1 immerhin 11 % der Textzeilen), bleibt
     * der Hash gleich und die Drift-Prüfung schweigt. Ein Token, der genau die
     * Lücke nicht sieht, die der Lücken-Index ausweist, ist keiner.
     *
     * Der Byte-Hash sieht JEDE Quell-Änderung. Preis: er reagiert auch auf
     * eine reine Neu-Erzeugung des PDF ohne Textänderung — dann meldet der
     * Drift-Check eine Drift, `extraktHash` zeigt aber unverändert, und die
     * Neu-Erzeugung des Snapshots ist byte-gleich. Das ist die richtige
     * Richtung: lieber ein erklärbares Rauschen als ein blinder Fleck (§8).
     */
    quelleHash: string;
    /**
     * sha256 der EXTRAHIERTEN Artikel (der frühere `quelleHash`). Bleibt als
     * zweite Stufe erhalten: der Drift-Check unterscheidet damit «Quelle neu
     * gesetzt, Wortlaut gleich» von «Wortlaut geändert». NICHT im Snapshot
     * gespeichert (das verlangte eine Schema-Änderung in
     * `scripts/datenhaltung/**` — fremder Bau-Strang).
     */
    extraktHash: string;
    /** Provenienz des Cache-Eintrags (O1): woher die Bytes kamen. */
    quellBytes: number;
  };
  artikel: Record<string, ZhArtikel>; // token → Artikel
  /** Einheitliches Label je token: «§ N» (ZH ist ein «§»-Erlass). */
  labels: Record<string, string>;
  /**
   * §8-Auslassungen dieses Erlasses in Klartext (Bug B-6, Gegenprüfung Runde 2):
   * bewusst nicht erfasste Erlassteile (Übergangs-/Schlussapparat, Anhang mit
   * Altfassungen) und nicht lückenlos expandierbare Sammel-Aufhebungsbereiche.
   * Der Generator schreibt sie nach `public/normtext/kanton-luecken.json`, damit
   * die Auslassung im Artefakt sichtbar ist statt nur im Code-Kommentar.
   */
  hinweise: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF-Text-Extraktion (pdfjs, BUILD-time, NUR in scripts/)
// ─────────────────────────────────────────────────────────────────────────────

/** Ein extrahiertes Text-Fragment mit Koordinaten (für die Layout-Analyse). */
interface PdfStueck {
  x: number;
  y: number;
  h: number;
  s: string;
  /** Fragment-Breite (pt) — für die Spalten-Lücken-Erkennung. */
  w: number;
  /** pdfjs-Schriftkennung (`fontName`, dokument-lokal wie «g_d10_f2»). Trägt
   *  den Gliederungstitel-Diskriminator, s. TITEL_MARKER. Optional, damit die
   *  bestehenden Geometrie-Unit-Tests ohne Schrift-Angabe gültig bleiben. */
  f?: string;
}

// ── Geometrie-Schwellen (empirisch erhoben, Fix-Runde 31.8.2026) ─────────────
// Messgrundlage: Roh-Stücke aller 24 ZH-PDF (pdfjs, y∈[60,530], h<11), Lücke =
// x(nächstes) − (x+width)(voriges) innerhalb EINER Textzeile.
//
// WORT_LUECKE_PT — ab wann eine Fragment-Lücke ein echtes Leerzeichen ist.
// Gemessene Verteilung (Body-Schrift h≈9.18, nach Hochstellungs-Zuordnung):
//   −0.7 … +0.4  Silbentrennstrich, direkt anschliessende Interpunktion  (kein Space)
//    1.3 … 20    jede Lücke ist ein echtes Leerzeichen («Art.»|«1», «§»|«73»,
//                «400»|«000» = schmaler Tausenderabstand, lit.-Marke|Text,
//                Blocksatz-Spatien, Tabellenspalten)
// Zwischen 0.4 und 1.3 liegt im ganzen Bestand KEIN Body-Fragmentpaar → 0.8 pt
// trennt beide Klassen mit Sicherheitsabstand nach beiden Seiten.
//
// VORHER (Bug B-4, Gegenprüfung 31.8.2026): nur Lücken > 18 pt bekamen ein
// Leerzeichen. Alles darunter klebte zusammen — «§34», «Abs.1», «Art.68»,
// «ZPOvor», und über die entfernte Fussnoten-Hochzahl hinweg «BGFAnicht»,
// «Kantonsverfassungund». Eingefügt wird weiterhin NUR Whitespace, nie ein
// Zeichen geändert/entfernt/umgestellt (§1).
const WORT_LUECKE_PT = 0.8;

/** Grenzhöhe (pt): darunter ist ein Stück hochgestellt (Absatzzahl, Fussnoten-
 *  Verweis, lat. Suffix «bis»/«ter»). Body ist h≈9.18, Hochstellung h≈5.70. */
const HOCH_MAX_H = 7.0;

/** Grenzhöhe (pt) der Fussnoten-DEFINITIONS-Ziffer am Seitenfuss. Gemessene
 *  Höhen im Gesamtbestand: 4.32/4.62/4.92/5.04 (Fussnoten-Apparat, Grundschrift
 *  7.98) gegen 5.70 (Body-Hochstellung, Grundschrift 9.18) — die beiden Klassen
 *  berühren sich nicht; 5.2 pt trennt sie. */
const APPARAT_ZIFFER_MAX_H = 5.2;

/** Maximaler y-Abstand (pt) zwischen einer Hochstellung und ihrer Trägerzeile.
 *  Gemessen: durchgängig 2.76 pt (Hochstellung liegt über der Grundlinie);
 *  der Zeilenabstand beträgt ≈10.2 pt, eine Verwechslung ist ausgeschlossen. */
const HOCH_TRAEGER_ABSTAND = 5;

/**
 * Einzug (pt) der KOPF-Spalte gegenüber der Body-Spalte (Fix-Runde 2,
 * 31.8.2026). Die Zürcher Loseblattsammlung setzt jeden Bestimmungs-Kopf mit
 * hängendem Einzug: die Kopfzeile beginnt 14.2 pt rechts vom linken Body-Rand,
 * jede Fliesstext-Zeile bündig bei 0.
 *
 * Gemessen an allen 24 ZH-PDF: 2376 Kopfzeilen, p05 = med = p95 = 14.2. Die
 * §§-Zeilen, die KEINE Köpfe sind (Querverweise am Zeilenanfang, umbrochene
 * Sätze), liegen bei 0 / 19.3 / 19.9 / 34 — die beiden Klassen berühren sich
 * nicht, ±2 pt Toleranz trennt sie mit Sicherheitsabstand.
 */
const KOPF_EINZUG_PT = 14.2;
const KOPF_EINZUG_TOLERANZ_PT = 2;

/** Eine hochgestellte Absatznummer: Ziffer, optional mit unmittelbar
 *  angehängtem lateinischem Suffix («2bis», «1ter»). Ein alleinstehender
 *  Suffix ist KEINE Absatznummer (er gehört zum §-Kopf, s. Zuordnung unten). */
const ABSATZ_HOCHZAHL = /^\d+(?:bis|ter|quater|quinquies)?$/;


/** Eine zusammengefügte Textzeile (eine y-Position einer Seite). */
export interface ZhTextZeile {
  /** Führende Absatznummer (hochgestellte Ziffer am Zeilenanfang) oder null. */
  absatz: string | null;
  /** Der bereinigte Zeilentext (Fussnoten-Hochzahlen entfernt). */
  text: string;
  /** Sammel-Aufhebungskopf («§§ 66–69.») — Kopf-Einzug + reine §-Nennungsliste
   *  (Bug B-2, Gegenprüfung Runde 2). Nur hier gesetzt, nie geraten. */
  sammelkopf?: true;
  /** Die Zeile ist VOLLSTÄNDIG in der Titel-Schrift des Dokuments gesetzt
   *  (kein einziges Body-Schrift-Fragment) — der Diskriminator für die
   *  arabisch nummerierten Gliederungstitel, s. TITEL_MARKER / GLIEDERUNG_ARABISCH. */
  titelschrift?: true;
}

/** Ergebnis der PDF-Layout-Extraktion: Body-Zeilen + der verworfene Kopf-/
 *  Fussband-Text (für die Stand-Erkennung «1. 1. 15 - 87»). */
export interface ZhExtrakt {
  zeilen: ZhTextZeile[];
  /** Roh-Text aus den Kopf-/Fussbändern (y>520 / y<60), zeilenfrei verkettet. */
  randText: string;
}

/**
 * Extrahiert die strukturierten Body-Textzeilen aus den PDF-Bytes (pdfjs).
 * Verwirft Marginalie (Sachtitel im Aussenrand), Kopf-/Fusszeilen-Bänder und
 * Fussnoten-Hochzahlen; erkennt Absatz-Hochzahlen am Zeilenanfang.
 *
 * Reine Layout-Logik bis auf den pdfjs-Aufruf; die Textzeilen werden danach
 * von extrahiereZhParagraphen() in §-Artikel zerlegt (testbar via serialisiere…).
 */
export async function extrahiereZhTextZeilen(
  bytes: Uint8Array,
): Promise<ZhExtrakt> {
  // pdfjs legacy/node-Build: NUR hier (scripts/) importiert — kein src/-Import,
  // damit der Client-Bundle unberührt bleibt.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true })
    .promise;

  const zeilen: ZhTextZeile[] = [];
  const randStuecke: string[] = [];
  const seitenStuecke: PdfStueck[][] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();

    // Roh-Stücke mit Koordinaten sammeln (Kopf-/Fussband y>520 / y<60 raus,
    // aber den Rand-Text für die Stand-Erkennung separat sammeln).
    const stuecke: PdfStueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number; fontName?: string };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const h = item.height ?? 9;
      // Kopf-/Fussband: laufender Erlasstitel + LS-Nr. liegen bei y≈539 (oben)
      // bzw. y≈51 (unten, «1. 1. 15 - 87» + Seitenzahl). Der oberste Body-
      // Absatz-Hochzahl-Marker kann bis y≈521 reichen — darum y>530 als
      // Kopf-Schwelle (nicht 520), sonst geht die Absatznummer der ersten
      // Body-Zeile verloren.
      if (y < 60 || y > 530) {
        randStuecke.push(item.str);
        continue; // Kopf-/Fussband
      }
      if (h >= 11) continue; // Erlasstitel (Kopf)
      stuecke.push({
        x,
        y,
        h,
        s: item.str,
        w: (item as { width?: number }).width ?? 0,
        f: item.fontName,
      });
    }
    seitenStuecke.push(stuecke);
  }

  // Body-Schrift EINMAL je Dokument bestimmen, nicht je Seite: eine Seite kann
  // (Titelseite, Gliederungs-Übersicht) fast nur Überschriften tragen, und dann
  // gewönne dort die Titel-Schrift die Mehrheit (§1: der Diskriminator darf
  // nicht seitenweise kippen).
  const bodySchrift = bestimmeBodySchrift(seitenStuecke.flat());
  for (const stuecke of seitenStuecke) {
    zeilen.push(...montiereZhSeite(stuecke, bodySchrift));
  }

  return { zeilen, randText: randStuecke.join(' ') };
}

/**
 * Die BODY-Schrift des Dokuments: die pdfjs-Schriftkennung mit den meisten
 * Zeichen in Body-Höhe (h ≥ 8.7).
 *
 * WARUM ZEICHEN und nicht Fragmente: ein Fragment kann ein Buchstabe oder ein
 * halber Satz sein; die Zeichenzahl gewichtet den Fliesstext richtig gegen die
 * kurzen Überschriften. Gemessen an allen 24 ZH-PDF ist der Abstand zwischen
 * Sieger und Zweitem durchweg mehr als eine Zehnerpotenz.
 *
 * Liefert undefined, wenn keine Schriftkennungen vorliegen (Unit-Tests mit
 * synthetischen Stücken) — dann bleibt die Titelschrift-Erkennung AUS und der
 * Adapter verhält sich wie vor Fix-Runde 3.
 */
export function bestimmeBodySchrift(stuecke: PdfStueck[]): string | undefined {
  const zaehler = new Map<string, number>();
  for (const st of stuecke) {
    if (st.h < 8.7 || st.f === undefined) continue;
    zaehler.set(st.f, (zaehler.get(st.f) ?? 0) + st.s.length);
  }
  if (zaehler.size === 0) return undefined;
  return [...zaehler.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

/**
 * Montiert die Textzeilen EINER PDF-Seite aus ihren Roh-Stücken (rein,
 * §2 — kein pdfjs, kein Netz, kein FS). Ausgelagert, damit die drei riskanten
 * Geometrie-Entscheide gegen echte Koordinaten testbar sind: Marginalien-
 * Abgrenzung, Fussnoten-Apparat-Kante und Hochstellungs-Zuordnung.
 *
 * Erwartet die Stücke einer Seite OHNE Kopf-/Fussband (y ausserhalb 60…530)
 * und ohne Erlasstitel (h ≥ 11) — beides filtert extrahiereZhTextZeilen vorab.
 */
export function montiereZhSeite(
  stuecke: PdfStueck[],
  bodySchrift?: string,
): ZhTextZeile[] {
  const zeilen: ZhTextZeile[] = [];
  if (stuecke.length === 0) return zeilen;

  // ── FUSSNOTEN-APPARAT am Seitenfuss abschneiden (Bug B-6, 31.8.2026) ─────
  // Der Loseblatt-Änderungsapparat («Fassung gemäss G vom …», «Text siehe
  // OS 48, 204.», «Vgl. auch Art. 6–9 …») steht als geschlossener Block am
  // unteren Seitenrand und ist KEIN Normtext. Die frühere Erkennung lief über
  // eine Liste von Eröffnungs-Wendungen und liess jede Fortsetzungszeile und
  // jede unbekannte Wendung durch — bei ZH-851.1 § 55 landeten so 13
  // Pseudo-Absätze (¶11–¶23) mit OS-Zitaten im letzten §, korpusweit 43 Blöcke
  // in 15 Erlassen (Gegenprüfung 31.8.2026).
  //
  // Geometrisch statt lexikalisch: Eine Fussnoten-DEFINITION besteht aus einer
  // kleinen hochgestellten Ziffer und — auf derselben Höhe — Text in
  // FUSSNOTEN-Grundschrift (h ≈ 7.98) statt Body-Grundschrift (h ≈ 9.18). Der
  // Apparat beginnt bei der obersten solchen Zeile; alles darunter fällt weg.
  // Er steht immer unter dem Body, nie darüber, und Tarif-Tabellen tragen keine
  // führende Hochzahl — sie bleiben unberührt.
  //
  // NICHT an der Ziffernhöhe allein: die beiden Höhenklassen berühren sich doch.
  // Gemessen: Fussnoten-Ziffern 4.32/4.62/4.92, Body-Hochstellungen 5.70 — aber
  // ZH-211.1 S. 24 setzt die Absatzzahl von § 105 Abs. 2 mit h = 5.04. Eine
  // Schwelle bei 5.2 hätte dort ab halber Seite gekappt und § 105 Abs. 2 samt
  // § 106 verschluckt (in dieser Fix-Runde erzeugt und vom neuen Tor
  // check:zh-vollstaendigkeit gefangen, 31.8.2026). Massgeblich ist darum die
  // Grundschrift der zugehörigen TEXTzeile, nicht die Ziffer.
  //
  // WICHTIG — erst NACH dem Marginalien-Filter: auch eine Randnote trägt
  // Fussnoten-Verweise in Apparat-Schriftgrösse (ZH-175.2 S. 1: «Grundsatz⁵²»
  // bei y=442). Vor dem Filter gemessen, hätte diese Randnoten-Ziffer die
  // Schnittkante auf halbe Seitenhöhe gehoben und den halben Erlass gekappt
  // (in dieser Fix-Runde selbst erzeugt und gemessen, 31.8.2026).

  // Body-Spalte dieser Seite aus den Body-Stücken (h≈9.2) bestimmen.
  const bodyXs = stuecke.filter((s) => s.h >= 8.7).map((s) => s.x);
  if (bodyXs.length === 0) return zeilen;
  const bodyMinX = Math.min(...bodyXs);
  // Body-Textblock ist ~242pt breit; Marginalie liegt im Aussenrand:
  //   links  (gerade Seiten): x < bodyMinX − 3
  //   rechts (ungerade Seiten): x > bodyMinX + 250
  // Gebühren-Tabellen (gleiche Schrifthöhe wie Marginalie!) liegen IN der
  // Body-Spalte und bleiben darum erhalten.
  const istMarginalie = (st: PdfStueck): boolean =>
    st.h <= 7.7 && (st.x < bodyMinX - 3 || st.x > bodyMinX + 250);

  const inhaltStuecke = stuecke.filter((st) => !istMarginalie(st));

  // Nach y gruppieren (eine Textzeile). y auf ganze Punkte runden.
  const nachY = new Map<number, PdfStueck[]>();
  for (const st of inhaltStuecke) {
    const key = Math.round(st.y);
    let liste = nachY.get(key);
    if (!liste) {
      liste = [];
      nachY.set(key, liste);
    }
    liste.push(st);
  }

  // Zeilen von oben nach unten (y absteigend), je Zeile nach x sortiert.
  let yKeys = [...nachY.keys()].sort((a, b) => b - a);

  // Apparat-Kante: oberste Gruppe, die NUR aus kleinen Hochzahlen besteht und
  // deren Trägerzeile in Fussnoten-Grundschrift gesetzt ist (h ≤ 8.5).
  const nurKleineHochzahlen = (g: PdfStueck[]): boolean =>
    g.length > 0 &&
    g.every((s) => s.h <= APPARAT_ZIFFER_MAX_H && /^[\s,\d]+$/.test(s.s));
  let apparatKante = -Infinity;
  for (let i = 0; i < yKeys.length - 1; i++) {
    if (!nurKleineHochzahlen(nachY.get(yKeys[i])!)) continue;
    const traeger = nachY.get(yKeys[i + 1])!;
    if (yKeys[i] - yKeys[i + 1] > HOCH_TRAEGER_ABSTAND) continue;
    if (traeger.every((s) => s.h <= 8.5)) {
      apparatKante = yKeys[i];
      break;
    }
  }
  if (apparatKante > -Infinity) {
    for (const key of yKeys) if (key <= apparatKante) nachY.delete(key);
    yKeys = yKeys.filter((k) => k > apparatKante);
  }
  for (const key of yKeys) nachY.get(key)!.sort((a, b) => a.x - b.x);

  // ── HOCHSTELLUNGEN IHRER TRÄGERZEILE ZUORDNEN (Bugs B-2/B-4 + lat. Suffix)
  // pdfjs liefert eine Hochstellung mit EIGENER Grundlinie (2.76 pt über der
  // Trägerzeile) — sie landet darum in einer eigenen y-Gruppe und wirkte
  // bisher wie eine eigene Textzeile. Drei Folgen, alle am Bestand belegt:
  //   B-2  Ein Fussnoten-Verweis am Zeilenende («… 11. Juni 2002³.») stand als
  //        einziges Stück seiner Gruppe an Position 0 und wurde als
  //        ABSATZNUMMER gelesen. Bei ZH-212.812 § 4 riss das den Absatz 2
  //        mitten im Wort auf («Entschädigungsver-» | «ordnung …») und
  //        erfand die Absätze 3 und 4.
  //   B-4  Über die entfernte Hochstellung hinweg fehlte die x-Lücke, aus der
  //        das Leerzeichen abgeleitet wird → «Kantonsverfassungund», «BGFAnicht».
  //   NEU  Der lateinische Suffix eines Paragraphen ist ebenfalls hochgestellt
  //        («§ 183^bis»). Er stand auf eigener Zeile, der Kopf las sich als
  //        blosses «§ 183» und kollidierte mit dem echten § 183 → §§ 174bis,
  //        183bis, 183ter, 183quater gingen im EG ZGB vollständig verloren
  //        (Fund dieser Fix-Runde, 31.8.2026 — in der Gegenprüfung nicht
  //        aufgeführt).
  //
  // Regel (rein geometrisch, §1/§2): Trägerzeile einer Hochstellung ist die
  // nächste Body-Zeile darunter (Δy ≤ 5 pt). Liegt die Hochstellung LINKS vom
  // Textbeginn dieser Zeile, ist sie deren Absatznummer und bleibt — wie
  // bisher — als eigene Marker-Zeile stehen (die «¹»-Recovery in
  // extrahiereAlleZhParagraphen hängt daran). Andernfalls gehört sie mitten in
  // die Trägerzeile und wird dort eingereiht: Fussnoten-Ziffern fallen dann
  // an ihrer richtigen Stelle weg (statt eine Absatznummer zu erfinden), lat.
  // Suffixe fügen sich in den §-Kopf ein, und die Wort-Lücke stimmt wieder.
  //
  // Textbeginn = x des ersten Body-Stücks, wobei ein vorangehender Marken-
  // kopf («§»/«§§»/«Art.» + Nummer) übersprungen wird: die Absatznummer des
  // ersten Absatzes steht ZWISCHEN Kopf und Text («§ 5.  ¹Die Gebühr …»).
  const MARKE_STUECK = /^(?:§+|Art\.)$/;
  const MARKE_NUMMER = /^\d+[a-z]?(?:bis|ter|quater|quinquies)?\.?$/;
  const textBeginnX = (gruppe: PdfStueck[]): number => {
    const body = gruppe.filter((s) => s.h >= HOCH_MAX_H);
    let i = 0;
    if (i < body.length && MARKE_STUECK.test(body[i].s.trim())) {
      i++;
      if (i < body.length && MARKE_NUMMER.test(body[i].s.trim())) i++;
      // Der Schlusspunkt des Kopfs kann ein eigenes Fragment sein, wenn
      // zwischen Nummer und Punkt ein hochgestellter Suffix steht
      // («§ | 183 | ᵇⁱˢ | .», ZH-230). Er gehört noch zum Kopf.
      if (i < body.length && body[i].s.trim() === '.') i++;
    }
    return i < body.length ? body[i].x : Number.POSITIVE_INFINITY;
  };
  const hatBody = (gruppe: PdfStueck[]): boolean =>
    gruppe.some((s) => s.h >= HOCH_MAX_H);

  for (const key of yKeys) {
    const gruppe = nachY.get(key)!;
    if (hatBody(gruppe)) continue; // reine Body-Zeile: nichts zuzuordnen
    // Trägerzeile: die NÄCHSTE Zeile darunter, sofern Δy ≤ 5 pt und Body.
    const unten = yKeys.find((k) => k < key);
    if (unten === undefined || key - unten > HOCH_TRAEGER_ABSTAND) continue;
    const traeger = nachY.get(unten)!;
    if (!hatBody(traeger)) continue;
    const grenze = textBeginnX(traeger);
    for (let i = gruppe.length - 1; i >= 0; i--) {
      // Nur eine ZIFFER — allein oder mit unmittelbar angehängtem lat. Suffix —
      // kann eine Absatznummer sein. Ein ALLEINSTEHENDER Suffix («bis»/«ter»/
      // «quater») gehört IMMER in die Trägerzeile: sonst zerfällt «§ 183ᵇⁱˢ.»
      // in einen falschen Kopf «§ 183» und eine Geisterzeile «bis» (ZH-230:
      // §§ 174bis/183bis/183ter/183quater).
      //
      // SUFFIX-ABSÄTZE (Bug B-1, Gegenprüfung Runde 2, 31.8.2026): «2bis» kommt
      // aus pdfjs als EIN Fragment (gemessen: ZH-101 Art. 104, ZH-631.1 § 7
      // «1bis»+«1ter», §§ 30/35/47 «2bis» — durchweg x = 68.0, h = 5.70, eigene
      // y-Gruppe). Das alte Muster /^\d+$/ verwarf es als Nicht-Ziffer und
      // schob es in die Trägerzeile; die Absatznummer landete als nackter Text
      // im Vorgänger-Absatz («… Staatsstrassen aus. 2bis Der Kanton sorgt …»)
      // und der Absatz 2bis existierte im Korpus nicht (0 Blöcke mit lat.
      // Suffix im ganzen ZH-Bestand).
      const istZiffer = ABSATZ_HOCHZAHL.test(gruppe[i].s.trim());
      if (istZiffer && gruppe[i].x < grenze) continue; // führend = Absatznummer
      traeger.push(gruppe[i]);
      gruppe.splice(i, 1);
    }
    traeger.sort((a, b) => a.x - b.x);
  }

  for (const yKey of yKeys) {
    const stueckeDerZeile = nachY.get(yKey)!;
    if (stueckeDerZeile.length === 0) continue;

    let absatz: string | null = null;
    let text = '';
    // Rechter Rand des zuletzt GESEHENEN Fragments — auch eines verworfenen
    // (Fussnoten-Hochzahl). Nur so bleibt die Wort-Lücke über die entfernte
    // Hochzahl hinweg messbar (B-4).
    let vorEndeX: number | null = null;
    for (let k = 0; k < stueckeDerZeile.length; k++) {
      const st = stueckeDerZeile[k];
      const istHoch = st.h < HOCH_MAX_H;
      if (istHoch) {
        // Führende Hochzahl am Zeilenanfang = Absatznummer (mit lat. Suffix,
        // s. ABSATZ_HOCHZAHL / Bug B-1).
        if (k === 0 && ABSATZ_HOCHZAHL.test(st.s.trim())) {
          absatz = st.s.trim();
          vorEndeX = st.x + st.w;
          continue;
        }
        // Sonstige Hochzahl (Fussnoten-Verweis, auch «1, 2») → verwerfen,
        // ihre Breite aber als Lücke stehen lassen.
        if (/^[\s,\d]+$/.test(st.s)) {
          vorEndeX = st.x + st.w;
          continue;
        }
      }
      // Wort-Lücke: liegt das nächste Fragment messbar rechts vom Ende des
      // vorigen, stand dort im Satz ein Leerzeichen (Schwelle WORT_LUECKE_PT,
      // empirisch am Gesamtbestand belegt). Nur Whitespace, kein Zeichen
      // geändert (§1).
      // Vor anschliessender Interpunktion steht im deutschen Satz nie ein
      // Leerzeichen. Die Lücke stammt dort aus der entfernten Hochzahl, deren
      // von pdfjs gemeldete Breite die tatsächliche Laufweite leicht
      // unterschätzt («… Art. 12 BV¹² .» statt «… Art. 12 BV.»).
      const schliessend = /^[.,;:!?)\]]/.test(st.s);
      if (!schliessend && vorEndeX !== null && st.x - vorEndeX >= WORT_LUECKE_PT) {
        text += ' ';
      }
      text += st.s;
      vorEndeX = st.x + st.w;
    }
    const bereinigt = text.replace(/\s+/g, ' ').trim();
    // FUSSNOTEN-DEFINITIONEN aussondern (Bug 22.6.2026 «mis-assigned ZH
    // footnotes»): die Quellen-/Änderungs-Fussnoten am Seitenfuss («OS 64, 280»,
    // «ABl 2008, 1188», «SR 210», «LS 242», «Eingefügt durch B vom …», «Fassung
    // gemäss B vom …», «In/Kraft seit …», «Begründung siehe …») stehen in der
    // KLEINEREN Fussnoten-Schrift (h≈8.0; Body ist h≈9.18) und sind KEIN
    // Normtext. Ohne Filter hängt der §-Parser sie an den letzten § (bei ZH-243
    // § 17 = Schlussbestimmung, da KEIN § 18 folgt) → unlesbarer Blob, und bei
    // ZH-215.3 entstand daraus sogar ein Schein-«§ 25». Signatur (§1: NUR
    // Fussnoten-Definitionen, nie Body): alle Zeilen-Stücke in Fussnoten-Höhe
    // (h≤8.5) UND der Text beginnt mit einem Fussnoten-Definitions-Marker. So
    // bleiben die Tarif-/Streitwert-Tabellen (Zahlen, «Gebühr», «bis») unberührt.
    const istFussnotenSchrift =
      stueckeDerZeile.length > 0 &&
      stueckeDerZeile.every((st) => st.h <= 8.5);
    const istFussnotenDefinition =
      istFussnotenSchrift &&
      // Opener-Marker einer Fussnoten-Definition …
      (/^(?:OS \d|ABl \d|SR \d|LS \d|Eingefügt durch|Fassung gemäss|Aufgehoben durch|In Kraft seit|Kraft seit|Begründung siehe|Inkrafttreten:|\d+\. \w+ \d{4})/.test(
        bereinigt,
      ) ||
        // … oder eine Fussnoten-FORTSETZUNGSZEILE (Umbruch von «… In Kraft /
        // seit 1. Januar 2024.»): «seit …» bzw. «Kraft seit …» / reines
        // Datumsfragment «1. Januar 2017 (ABl …).». NUR in Fussnoten-Höhe
        // (h≤8.5) → Body-Sätze mit «seit» (h≈9.18) bleiben unberührt (§1).
        /^(?:seit \d|Kraft seit|\d+\. (?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \d{4})/.test(
          bereinigt,
        ));
    if (istFussnotenDefinition) {
      // Eine Fussnoten-Fortsetzungszeile trägt oft eine (fälschlich als Absatz
      // gelesene) führende Hochzahl (die Fussnoten-Nummer). Diese Zeile wird
      // komplett verworfen — der Absatz-Marker darf NICHT als leerer §-Block
      // überleben (sonst Schein-Absätze «¶14»/«¶15» in § 17).
      continue;
    }
    // Reine Leer-/Absatz-Marker-Zeile: trotzdem behalten, falls Absatz gesetzt
    // (die Absatznummer steht oft auf eigener y-Zeile vor dem Text).
    if (bereinigt === '' && absatz === null) continue;
    // SAMMEL-AUFHEBUNGSKOPF (Bug B-2): «§§ 66–69.» im Kopf-Einzug. Die
    // geometrische Aussage wird hier festgehalten, weil sie im serialisierten
    // Text verloren ginge — und ohne sie ist der Kopf nicht vom Satzende
    // «Vorbehalten bleiben §§ 23–23 b und 35 b.» (ZH-331) zu unterscheiden.
    const erstesBody = stueckeDerZeile.find((st) => st.h >= HOCH_MAX_H);
    const imKopfEinzug =
      erstesBody !== undefined &&
      Math.abs(erstesBody.x - bodyMinX - KOPF_EINZUG_PT) <= KOPF_EINZUG_TOLERANZ_PT;
    // TITELSCHRIFT (Fix-Runde 3, Befund GP3a-1): trägt die Zeile in Body-Höhe
    // KEIN einziges Fragment in der Body-Schrift, ist sie eine Überschrift.
    // Die Aussage ist typografisch, nicht lexikalisch — und sie geht im
    // serialisierten Text verloren, darum wird sie hier festgehalten
    // (gleiches Muster wie `sammelkopf`).
    const bodyDerZeile = stueckeDerZeile.filter((st) => st.h >= HOCH_MAX_H);
    const nurTitelschrift =
      bodySchrift !== undefined &&
      bodyDerZeile.length > 0 &&
      bodyDerZeile.every((st) => st.f !== undefined && st.f !== bodySchrift);
    if (imKopfEinzug && SAMMEL_ZEILE.test(bereinigt)) {
      zeilen.push({ absatz, text: bereinigt, sammelkopf: true });
      continue;
    }
    if (nurTitelschrift) {
      zeilen.push({ absatz, text: bereinigt, titelschrift: true });
      continue;
    }
    zeilen.push({ absatz, text: bereinigt });
  }
  return zeilen;
}

/**
 * Serialisiert Body-Textzeilen in einen einzigen, zeilengetrennten Text mit
 * eingebetteten Absatz-Markern «¶N» am Zeilenanfang. Diese Form ist die
 * testbare «extrahierte PDF-Textbasis», die extrahiereZhParagraphen() parst —
 * so kann der Parser ohne pdfjs/Netz gegen eine Fixture getestet werden.
 *
 * Sammel-Aufhebungsköpfe tragen zusätzlich den SAMMEL_MARKER (die geometrische
 * Kopf-Einzug-Aussage, die im reinen Text nicht mehr ablesbar wäre).
 */
export function serialisiereZhZeilen(zeilen: ZhTextZeile[]): string {
  return zeilen
    .map((z) => {
      const kern = z.absatz !== null ? `¶${z.absatz} ${z.text}` : z.text;
      const mitSammel = z.sammelkopf ? `${SAMMEL_MARKER}${kern}` : kern;
      return z.titelschrift ? `${TITEL_MARKER}${mitSammel}` : mitSammel;
    })
    .join('\n');
}

/**
 * Marker für «diese Zeile steht vollständig in der Titel-Schrift» (Fix-Runde 3).
 *
 * WOZU: Die Zürcher Sammlung setzt ihre Gliederungs-Überschriften in einem
 * eigenen Schriftschnitt. Für die BUCHSTABEN- und die ZÄHLENDE Form («A.
 * Allgemein», «2. Kapitel: …») genügte bisher das Textmuster. Die dritte Form —
 * arabische Zahl OHNE Gliederungswort und OHNE Doppelpunkt («1.
 * Sonderbauvorschriften», «2. Aufgaben») — ist vom Wortlaut her NICHT von einer
 * echten Aufzählungszeile («2. die Schulpflege,») zu unterscheiden. Ein reines
 * Textmuster hier hiesse, Normtext zu löschen (§1).
 *
 * DIE MESSUNG (alle 24 ZH-PDF, 31.8.2026, Fix-Runde 3):
 *   · 504 Zeilen der Form «N. Text» im Bestand.
 *   · Davon 34 in reiner Titel-Schrift — ausnahmslos Überschriften
 *     (ZH-131.1 «1. Allgemeines» · ZH-170.4 «1. Im Allgemeinen» ·
 *      ZH-215.1 «1. Organisation»/«2. Aufgaben» · ZH-242 «2. Notar» ·
 *      ZH-700.1 «1. Sonderbauvorschriften»/«2. Gestaltungspläne» …).
 *   · Die übrigen 470 tragen mindestens ein Body-Schrift-Fragment und sind
 *     ausnahmslos Aufzählungszeilen oder Fliesstext («2. die Schulpflege,»,
 *     «5. für die Anfechtung des Kindesverhältnisses …»).
 *   · GEGENPROBE gegen die bereits bewährten Formen: alle 524 Zeilen, die
 *     GLIEDERUNG oder GLIEDERUNG_ZAEHLEND treffen, stehen ebenfalls in reiner
 *     Titel-Schrift — 0 Ausreisser. Das Kriterium reproduziert also den
 *     verifizierten Bestand exakt und erweitert ihn nur.
 *
 * Der EINZUG trennt die beiden Klassen NICHT: beide stehen teils bei dx = 0,
 * teils bei dx = 14.2 (dem Kopf-Einzug). Darum die Schrift, nicht die Position.
 */
export const TITEL_MARKER = '⟦TITEL⟧';

// ─────────────────────────────────────────────────────────────────────────────
// Reiner Parser: extrahierte Textbasis → §-Artikel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * §-Kopf — NUR am Zeilenanfang (Bug B-3, Gegenprüfung 31.8.2026).
 *
 * Vorher war das Muster UNVERANKERT und traf jeden Quer­verweis mitten im Satz
 * («… richtet sich nach § 7.», «Vorbehalten bleibt § 181.»). Der laufende § galt
 * damit als beendet, `speichere()` verwarf den bereits gesehenen Token («erster
 * Treffer gewinnt») und der Rest der Bestimmung fiel ersatzlos weg — messbar an
 * 26 Stellen im ZH-Bestand, u. a. ZH-212.812 § 8 («… rich-» statt «… richtet
 * sich nach § 7.») und ZH-215.3 § 11 Abs. 3/4.
 *
 * Der Kopf steht in den ZH-PDF ausnahmslos am Zeilenanfang (gemessen: 2334 von
 * 2360 Treffern; die restlichen 26 sind genau die Querverweise). Ein voran-
 * gestellter Absatzmarker «¶N» ist zugelassen, weil serialisiereZhZeilen() ihn
 * dort einfügt.
 *
 * Getrennte Gruppen für Zahl · Buchstaben-Suffix · lat. Suffix: die Zürcher
 * Loseblattsammlung SETZT den Buchstaben-Suffix mit Leerzeichen («§ 4 a.»,
 * «§§ 64 a und 64 b» — am Druckbild verifiziert 31.8.2026), der lateinische
 * Suffix dagegen hochgestellt und ohne Abstand («§ 183bis.»).
 *
 * «§§ …» (Bereichs-/Sammelüberschrift wie «§§ 137bis–144.») ist KEIN Kopf.
 */
const PARAGRAF_KOPF =
  /^(?:¶\d+(?:bis|ter|quater|quinquies)?\s+)?§(?!§)\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?\s*\./;

/**
 * Artikel-Kopf am Zeilenanfang: «Art. 1 Der Kanton …» (E2-H1, 31.8.2026).
 * Die Kantonsverfassung (LS 101) zählt in Artikeln, nicht in Paragraphen — der
 * Adapter kannte nur den §-Marker und lieferte darum 0 Artikel für die KV.
 * Kein Punkt nach der Nummer (anders als beim §-Kopf); die Abgrenzung gegen
 * einen Quer­verweis leistet die Zeilenanker-Disziplin plus die Marker-Wahl je
 * Erlass (siehe erkenneMarker) — in einem «§»-Erlass feuert dieses Muster nie.
 */
const ARTIKEL_KOPF =
  /^(?:¶\d+(?:bis|ter|quater|quinquies)?\s+)?Art\.\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?(?=\s|$)/;

/**
 * ZIFFERN-Marke einer Aufzählung am Zeilenanfang: «5. für die Anfechtung …»,
 * «1.» (aufgehobene Ziffer, nackt), «1.–3.» (aufgehobener Bereich).
 *
 * ANLASS (GP3b, Fix-Runde 3): drei Aufzählungen im Bestand standen als PROSA im
 * Blocktext statt als `items` — ZH-230 § 34 Abs. 1 («… zuständige Behörde: 1.
 * 2. 3. 4. 5. für die Anfechtung …»), § 43 und § 248. Der Block-Sammler kannte
 * nur die BUCHSTABEN-Marke; Ziffern-Aufzählungen flossen als Fliesstext durch.
 * §7-Build-Regel 2 verlangt aber «lit. UND Ziff. als items je Absatz».
 *
 * §1-SICHERUNG gegen Fehltreffer — drei Wächter, alle am Bestand erhoben:
 *  (a) SEQUENZ. Eine Ziffern-Marke wird nur akzeptiert, wenn sie die Folge
 *      fortsetzt (erste Marke muss «1.» sein, danach je +1; ein aufgehobener
 *      Bereich «1.–3.» setzt die Folge auf 3). Das erledigt die häufigste Falle:
 *      eine umbrochene Fliesstext-Zeile, die mit einer Zahl beginnt —
 *      «65. Altersjahres hat keine besonderen Leistungen zur Folge.»
 *      (ZH-171.1), «23. Juni 1831 werden aufgehoben.» (ZH-175.2).
 *  (b) DATUM. «17. Dezember 1976 über die politischen Rechte …» wäre als
 *      Ziffer 17 zwar ohnehin folgenwidrig, aber ein Monatsname nach der Zahl
 *      schliesst die Marke unabhängig davon aus.
 *  (c) TITEL-SCHRIFT. Arabisch nummerierte ÜBERSCHRIFTEN («2. Aufgaben»)
 *      erreichen den Block-Sammler gar nicht mehr — sie werden eine Stufe
 *      früher an der Titel-Schrift erkannt und verworfen (s. TITEL_MARKER).
 */
const ZIFFER_MARKE = /^(\d+)\.(?:\s*(\S.*))?$/;
/** Aufgehobener Ziffern-BEREICH als eigene Zeile: «1.–3.», «12.–14.». */
const ZIFFER_BEREICH = /^(\d+)\.\s*[–—−-]\s*(\d+)\.$/;
/** Monatsname direkt nach der Zahl = Datum, keine Aufzählungsmarke. */
const MONAT_NACH_ZAHL =
  /^(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/;

/** lit.-Marke am Zeilenanfang: «a. …» / «a.…» (ZH nutzt lit. mit Punkt; in der
 *  PDF-Extraktion steht oft KEIN Leerzeichen zwischen «a.» und dem Punkttext,
 *  weil der Punkt-Buchstabe und der Text getrennte Fragmente am gleichen y sind).
 *  EIN Kleinbuchstabe + Punkt am Zeilenanfang (lit.-Punkte stehen in der PDF auf
 *  EIGENER Zeile). Der Folgetext beginnt teils klein («a.im Zivilprozess»). */
const LIT_MARKE = /^([a-z])\.\s*(\S.*)$/;

/** Gliederungs-/Abschnitts-Überschrift (NICHT Normtext): «A. Allgemein»,
 *  «B. Schlichtungsverfahren», «C. Zivilprozess» — Grossbuchstabe + Punkt +
 *  Titel, ohne § und ohne Absatztext. Wird zwischen Artikeln verworfen.
 *  Der lat. Suffix («Abis. Eherecht», ZH-230) gehört dazu: er ist hochgestellt
 *  gesetzt und wird seit der Hochstellungs-Zuordnung an den Buchstaben gefügt. */
const GLIEDERUNG =
  /^(?:[A-Z](?:bis|ter|quater|quinquies)?|[IVXL]+)\.\s+[A-ZÄÖÜ]/;

/**
 * Gliederungs-Überschrift der ZÄHLENDEN Form (Bug B-3, Gegenprüfung Runde 2,
 * 31.8.2026): «2. Kapitel: Grundrechte», «1. Abschnitt: Stimmberechtigte»,
 * «Erster Abschnitt: …», «Dritter Teil: Steuerstrafrecht». Sie steht auf einer
 * eigenen Zeile im Body-Satz (h = 9.18, kein Kopf-Einzug) und war darum vom
 * Schriftbild NICHT von Fliesstext zu trennen — sie klebte am Vorgänger-Block
 * (gemessen: 103 Blöcke in 10 Erlassen).
 *
 * Massgeblich ist die am Bestand erhobene Form (alle 24 PDF ausgezählt):
 * Zeilenanfang + Zähler (Ziffer / römisch / ausgeschriebenes Ordinale) +
 * Gliederungswort + DOPPELPUNKT. Der Doppelpunkt trennt die Überschriften
 * sauber von den Fliesstext-Treffern, die dieselben Wörter tragen — «(2. Teil,
 * 5. Titel ZPO, …)», «1. und 2. Abschnitt) finden ergänzend Anwendung.» —
 * keiner davon setzt ihn (empirisch: 0 Fehltreffer im Gesamtbestand).
 *
 * Die BUCHSTABEN-Form («A. Allgemein», «III. Bezirksrat») fängt weiterhin
 * GLIEDERUNG; sie war nie undicht.
 */
const GLIEDERUNG_ZAEHLEND =
  /^(?:\d+|[IVXLC]+|(?:Ers|Zwei|Drit|Vier|Fünf|Sechs|Sieb|Sieben|Ach|Neun|Zehn|Elf|Zwölf)ter)\.?\s+(?:Kapitel|Abschnitt|Unterabschnitt|Teil|Titel|Abteilung):/;

/**
 * Gliederungs-Überschrift der ARABISCH NUMMERIERTEN, wortlosen Form (Befund
 * GP3a-1 der dritten Gegenprüfung, 31.8.2026): «1. Sonderbauvorschriften»,
 * «2. Aufgaben», «3. Budgetkredit» — Zahl, Punkt, Sachtitel, KEIN
 * Gliederungswort und KEIN Doppelpunkt.
 *
 * §1-KRITISCH: Dieses Muster trifft WORTGLEICH auch jede echte
 * Aufzählungszeile («2. die Schulpflege,», «5. für die Anfechtung des
 * Kindesverhältnisses …»). Es darf DESHALB NIE allein entscheiden — nur
 * zusammen mit dem TITEL_MARKER, der die typografische Tatsache trägt
 * (Zeile vollständig in der Titel-Schrift). Zwei Unit-Tests halten beide
 * Richtungen fest: Überschrift mit Marker wird verworfen, Aufzählungszeile
 * ohne Marker bleibt — auch bei identischem Wortlaut.
 *
 * Der lateinische Suffix ist zugelassen («1bis. Ergänzende Ordnung»), damit die
 * Form dieselbe Suffix-Reichweite hat wie GLIEDERUNG.
 */
const GLIEDERUNG_ARABISCH =
  /^\d+(?:bis|ter|quater|quinquies)?\.\s*\S/;

/**
 * Wie viele FORTSETZUNGS-Zeilen eine Überschrift höchstens haben darf.
 *
 * Gemessen an allen 24 ZH-PDF: die längsten Gliederungs-Überschriften brechen
 * auf ZWEI Zeilen um (ZH-700.1 § 165 «5. Der Bau der Erschliessungsanlagen,
 * Ausstattungen | und Ausrüstungen; Rechtsverhältnisse»); drei kommen nicht
 * vor. Der Deckel begrenzt den Schaden, falls je eine ganze Tarif-Tabelle in
 * der Titel-Schrift auf eine Überschrift folgt (ZH-211.11 § 4 ist vollständig
 * in Titel-Schrift gesetzt!) — dann fielen ohne Deckel Tabellenzeilen weg (§1).
 */
const TITEL_KETTE_MAX = 2;

/**
 * Grenze zum Erlass-Schluss­apparat (Bug B-6, zweiter Teil, 31.8.2026).
 *
 * Nach dem letzten § folgen in den ZH-PDF die Übergangs-/Schlussbestimmungen
 * der Änderungserlasse und — bei ZH-700.1 — ein Anhang, der ältere Fassungen
 * einzelner §§ nachdruckt. Beide führen eigene, bei 1 neu beginnende §-Zählungen
 * und kollidieren dadurch mit dem Haupttext (ZH-700.1: 34 doppelte §-Nummern,
 * ZH-631.1: 4). Bisher fielen sie über «erster Treffer gewinnt» still weg — und
 * der Übergangs-Text hing als Pseudo-Absatz am letzten § (ZH-851.1 § 55).
 *
 * Ab dieser Grenze wird nichts mehr aufgenommen. Die Übergangsbestimmungen sind
 * damit im Snapshot NICHT enthalten (§8: ausgewiesene Lücke statt falscher
 * Zuordnung); ihre Aufnahme als eigener Eintragstyp ist ZH-4d-Stoff.
 */
const SCHLUSSAPPARAT = /^(?:Übergangs|Schluss)bestimmung(?:en)?\b/;

/** ANHANG-Titel am Zeilenanfang — nur die echte Überschrift, nicht jedes Wort
 *  «Anhang». Zulässig: «Anhang», «Anhang 1», «Anhang: Gebührentarif (§ 1)».
 *  NICHT: «Anhang I zum Abkommen …», «Anhang K Anlage 1 …» (umbrochene
 *  Fliesstext-Zeile in ZH-851.1 § 5e lit. c — sie kappte mit der alten Fassung
 *  `^Anhang(:|\b)` den halben Erlass; in der Fix-Runde 2 selbst erzeugt und
 *  gemessen, 31.8.2026). */
const ANHANG_TITEL = /^Anhang(?:\s*\d*)?(?::|$)/;

/** Absatz-Marker «¶N» am Zeilenanfang (von serialisiereZhZeilen gesetzt; der
 *  Resttext ist optional — die Absatznummer steht oft auf der eigenen Zeile).
 *  Lat. Suffixe vollständig (Bug B-1): «¶2bis», «¶1ter» — das alte Muster kannte
 *  nur bis/ter, die Hochstellungs-Zuordnung liefert aber alle vier Stufen. */
const ABSATZ_MARKER = /^¶(\d+(?:bis|ter|quater|quinquies)?)\s*(.*)$/;


/** Token aus den drei Kopf-Gruppen (Zahl · Buchstabe · lat. Suffix):
 *  «§ 4 a.»→'4_a', «§ 183bis.»→'183_bis', «Art. 12»→'12'
 *  (kongruent parsePassus/HTM-Adapter). */
function normalisiereZhKopf(kopf: RegExpMatchArray): string {
  return [kopf[1], kopf[2], kopf[3]]
    .filter(Boolean)
    .map((t) => t.toLowerCase())
    .join('_');
}

// ENTFERNT 31.8.2026 — `entglueZhTarif()` (§17-Gegengewicht).
//
// Die Funktion trennte nachträglich zusammengelaufene Tarif-Fragmente
// («bis1000», «Fr.1000», «20%des», «)(in») und enthielt dafür u. a. die Regel
// «Kleinbuchstabe direkt vor Grossbuchstabe → Leerzeichen». Beides war eine
// Reparatur an der falschen Stelle: die Klebung entstand oben in der
// Zeilenmontage, weil ein Leerzeichen erst ab 18 pt Fragmentlücke gesetzt wurde.
//
// Seit die Lücke geometrisch ausgewertet wird (WORT_LUECKE_PT), tritt KEINE der
// sechs Klebe-Formen im Bestand noch auf — gemessen an allen 24 ZH-Erlassen:
// «bis|über» + Ziffer 0×, «Fr.|Mio.|zuzügl.» + Ziffer 0×, «%» + Buchstabe 0×,
// «)(» 0×, «St PO»/«Sch KG» 0×. Die camelCase-Regel dagegen war schädlich
// geworden: sie zerschnitt 60+ amtliche Abkürzungen in 13 Erlassen — «StGB» →
// «St GB», «JStPO» → «JSt PO», «SchKG» → «Sch KG», «PartG» → «Part G»,
// «BehiG» → «Behi G», «§§ 137bis–144» → «§§ 137 bis–144». Ein Wächter, der
// nichts mehr fangen kann und dabei den Wortlaut verändert, wird gestrichen,
// nicht gepflegt (§1 vor Bequemlichkeit).

/** Zerlegt eine Absatznummer «2» / «1bis» / «2ter» in (Zahl, lat. Suffix-Rang),
 *  damit baueBloecke die Sequenz validieren kann. Suffix-Rang: ''=0, bis=1,
 *  ter=2, quater=3, quinquies=4 (so folgt «1bis» auf «1», «1ter» auf «1bis»). */
const ABSATZ_NUMMER = /^(\d+)(bis|ter|quater|quinquies)?$/;
const SUFFIX_RANG: Record<string, number> = {
  '': 0,
  bis: 1,
  ter: 2,
  quater: 3,
  quinquies: 4,
};

/** Block-Sammler: Absätze + lit.-items eines Artikels aus seinen Zeilen.
 *
 *  Absatz-Nummerierung nach VALIDIERTER SEQUENZ (Fix 22.6.2026, Bund-Qualität):
 *  ein ¶-Marker wird nur dann als echte Absatznummer akzeptiert, wenn er die
 *  erwartete monotone Folge fortsetzt (1→2→3…, lat. Suffixe «1bis»→«1ter» am
 *  selben Grund-Index zulässig). Ein Marker, der die Folge bricht (z. B. «¶10»
 *  wo «¶1» erwartet, «¶5» wo «¶2» erwartet), ist KEINE Absatznummer, sondern ein
 *  Fussnoten-Verweis (hochgestellte Verweis-Ziffer mitten im Absatz). Er wird
 *  verworfen: ein leerer Verweis-Marker entfällt ganz, ein Marker mit Resttext
 *  (Wort-Fragment einer umbrochenen Zeile) fliesst als Fortsetzung in den
 *  laufenden Absatz — so entstehen weder leere noch Fragment-Blöcke und keine
 *  «komischen Randziffern» (§1: nur die irrtümlich als Absatz gelesene Ziffer
 *  entfernt, kein Normtext erfunden/verworfen). */
function baueBloecke(zeilen: string[]): ZhBlock[] {
  const bloecke: ZhBlock[] = [];
  let aktiv: ZhBlock | null = null;
  // Puffer für Fortsetzungs-Zeilen (zur Silbentrennung pro logischem Stück).
  let textPuffer: string[] = [];
  let itemPuffer: string[] = [];
  let aktivItem: { marke: string } | null = null;
  // Erwartete nächste Absatz-Grundzahl (für die Sequenz-Validierung). Solange
  // noch kein nummerierter Absatz akzeptiert wurde, ist die erste gültige Nummer
  // 1 (oder ein impliziter, markerloser Absatz 1). zuletztNummer/-Suffix halten
  // den zuletzt akzeptierten Absatz, um lat. Suffixe (1→1bis→1ter) zu erlauben.
  let zuletztNummer = 0;
  let zuletztSuffix = -1; // -1 = noch kein nummerierter Absatz
  /** Zuletzt akzeptierte Aufzählungs-ZIFFER im laufenden § (0 = keine). */
  let zuletztZiffer = 0;

  const flushText = (): void => {
    if (textPuffer.length > 0 && aktiv) {
      const t = fuegeZeilen(textPuffer);
      aktiv.text = aktiv.text ? `${aktiv.text} ${t}` : t;
    }
    textPuffer = [];
  };
  const flushItem = (): void => {
    if (aktivItem && aktiv) {
      const t = fuegeZeilen(itemPuffer);
      // Eine Ziffer OHNE jeden Text ist eine AUFGEHOBENE Ziffer — die Zürcher
      // Sammlung druckt sie als nackte Nummer, der Wortlaut steht in der
      // amtlichen Fussnote («Aufgehoben durch …»). Gleiche Schreibweise wie beim
      // nackten §-Kopf und beim Sammel-Aufhebungskopf, damit die Zählung im
      // Lese-View lückenlos bleibt statt als «1. 2. 3. 4. 5.»-Prosa zu erscheinen.
      (aktiv.items ??= []).push({
        marke: aktivItem.marke,
        text: t === '' ? 'Aufgehoben' : t,
      });
    }
    itemPuffer = [];
    aktivItem = null;
  };
  const neuerBlock = (absatz: string | null): void => {
    flushText();
    flushItem();
    aktiv = { absatz, text: '' };
    bloecke.push(aktiv);
  };
  // Accessor: liefert den laufenden Block mit seinem deklarierten Union-Typ
  // (innerhalb der Schleife verengt TS `aktiv` über die Closure-Mutationen
  // hinweg auf `null`; der Closure-Zugriff umgeht diese fehlerhafte Verengung).
  const aktuellerBlock = (): ZhBlock | null => aktiv;

  for (const zeile of zeilen) {
    const absM = zeile.match(ABSATZ_MARKER);
    if (absM) {
      const rest = absM[2].trim();
      const num = absM[1].match(ABSATZ_NUMMER);
      // Sequenz-Validierung: akzeptiere die Nummer nur, wenn sie die erwartete
      // monotone Folge fortsetzt. Gültig ist (a) die nächste Grundzahl
      // (zuletztNummer+1, Suffix-Rang 0) oder (b) eine lat. Suffix-Steigerung am
      // SELBEN Grund-Index (1→1bis→1ter). Alles andere bricht die Folge.
      let gueltig = false;
      if (num) {
        const n = Number(num[1]);
        const rang = SUFFIX_RANG[num[2] ?? ''] ?? 0;
        // Backfill «¶1»: Steht noch kein nummerierter Absatz, der erste Absatz
        // begann aber implizit (markerlos, absatz=null) mit echtem Text, und der
        // nun kommende Marker würde gültig auf eine implizite «1» folgen
        // («2» als nächste Grundzahl, oder «1bis» als Suffix der «1»), so ist der
        // erste Absatz die Nr. 1 — rückwirkend benummern (Bund-Konvention
        // 1,2,3…). So bleibt nie ein «[null,'2',…]» übrig, auch wenn die
        // «¹»-Recovery (Part A) den Erst-Marker einmal nicht greift.
        const folgtAufImplizit1 =
          (n === 2 && rang === 0) || (n === 1 && rang === 1);
        const ersterBlock = aktuellerBlock();
        if (
          zuletztSuffix === -1 &&
          folgtAufImplizit1 &&
          ersterBlock !== null &&
          ersterBlock.absatz === null &&
          (textPuffer.length > 0 ||
            ersterBlock.text !== '' ||
            (ersterBlock.items?.length ?? 0) > 0)
        ) {
          // Ersten (impliziten) Absatz als Nr. 1 setzen, dann den Marker prüfen.
          flushText();
          flushItem();
          ersterBlock.absatz = '1';
          zuletztNummer = 1;
          zuletztSuffix = 0;
        }
        if (n === zuletztNummer + 1 && rang === 0) {
          gueltig = true;
        } else if (n === zuletztNummer && rang === zuletztSuffix + 1) {
          gueltig = true;
        }
      }
      if (gueltig && num) {
        // Echter Absatz. Sein Resttext startet den Block.
        neuerBlock(absM[1]);
        zuletztNummer = Number(num[1]);
        zuletztSuffix = SUFFIX_RANG[num[2] ?? ''] ?? 0;
        if (rest) textPuffer.push(rest);
      } else {
        // Folge-brechende «Absatznummer» = Fussnoten-Verweis (keine echte
        // Absatznummer). Marker verwerfen; ein etwaiger Resttext (Wort-Fragment
        // einer umbrochenen Zeile) fliesst als Fortsetzung in den laufenden
        // Absatz/Item (§1: kein Normtext verloren, keine Geister-Blöcke).
        if (rest) {
          if (aktivItem) {
            itemPuffer.push(rest);
          } else {
            if (!aktiv) neuerBlock(null);
            textPuffer.push(rest);
          }
        }
      }
      continue;
    }

    const litM = zeile.match(LIT_MARKE);
    if (litM) {
      flushText();
      flushItem();
      if (!aktiv) neuerBlock(null);
      aktivItem = { marke: litM[1].toLowerCase() };
      itemPuffer = [litM[2].trim()];
      continue;
    }

    // ZIFFERN-Aufzählung (s. ZIFFER_MARKE): nur mit Sequenz- und Datums-Wächter.
    const berM = zeile.match(ZIFFER_BEREICH);
    const zifM = berM ? null : zeile.match(ZIFFER_MARKE);
    if (berM || zifM) {
      const von = Number(berM ? berM[1] : zifM![1]);
      const bis = berM ? Number(berM[2]) : von;
      const rest = berM ? '' : (zifM![2] ?? '').trim();
      // Eine Aufzählung läuft in der Zürcher Sammlung ÜBER DIE ABSATZGRENZE
      // hinweg weiter (ZH-230 § 44: Abs. 1 trägt Ziff. 1–8, Abs. 2 setzt bei
      // Ziff. 9 fort). Die Folge zählt darum je §, nicht je Absatz; «1.» eröffnet
      // daneben immer eine neue Aufzählung.
      const folgt =
        (von === zuletztZiffer + 1 || von === 1) && bis >= von && bis - von <= 50;
      const istDatum = MONAT_NACH_ZAHL.test(rest);
      if (folgt && !istDatum) {
        flushText();
        flushItem();
        if (!aktiv) neuerBlock(null);
        // Ein aufgehobener BEREICH «1.–3.» wird zu je einem Platzhalter-item
        // (nie zu einem einzigen «1.–3.»-Eintrag): so bleibt die Ziffernfolge
        // im Lese-View lückenlos, und jede Ziffer bleibt einzeln adressierbar.
        for (let n = von; n < bis; n++) {
          (aktiv!.items ??= []).push({ marke: String(n), text: 'Aufgehoben' });
        }
        aktivItem = { marke: String(bis) };
        itemPuffer = rest ? [rest] : [];
        zuletztZiffer = bis;
        continue;
      }
    }

    // Fortsetzungszeile.
    if (aktivItem) {
      itemPuffer.push(zeile);
    } else {
      if (!aktiv) neuerBlock(null);
      textPuffer.push(zeile);
    }
  }
  flushText();
  flushItem();

  // Leere Blöcke (nur Marker ohne Text/items) verwerfen.
  return bloecke.filter((b) => b.text !== '' || (b.items && b.items.length > 0));
}

/**
 * Reiner Parser: zerlegt die serialisierte PDF-Textbasis in §-Artikel.
 * §-Erkennung: «§ N.» als Artikelgrenze; folgende Zeilen (mit ¶-Absatzmarkern
 * und lit.-Punkten) gehören zum Artikel bis zum nächsten «§ N.».
 *
 * Liefert NUR den angeforderten token-Artikel ({bloecke}) oder null.
 */
export function extrahiereZhParagraphen(
  text: string,
  token: string,
): ZhArtikel | null {
  const alle = extrahiereAlleZhParagraphen(text);
  return alle[token] ?? null;
}

/** Zählweise eines Erlasses: «§ N.» (Regelfall) oder «Art. N» (Kantons-
 *  verfassung LS 101). Wird je Dokument aus der Textbasis erhoben, nie geraten. */
export type ZhMarker = 'paragraf' | 'artikel';

/**
 * Bestimmt die Zählweise eines Erlasses aus seiner Textbasis (E2-H1).
 * Massstab ist die MENGE der zeilenanfangs-verankerten Köpfe: ein «§»-Erlass
 * enthält vereinzelt Zeilen, die mit einem «Art. …»-Quer­verweis auf Bundesrecht
 * beginnen (1–5 im Bestand), aber Dutzende bis Hunderte §-Köpfe; die
 * Kantonsverfassung enthält 147 «Art.»-Köpfe und keinen einzigen §-Kopf.
 * Gleichstand (auch 0:0) → 'paragraf' (unveränderter Bestandsweg).
 */
export function erkenneZhMarker(text: string): ZhMarker {
  let par = 0;
  let art = 0;
  for (const rohZeile of text.split('\n')) {
    // Marker abstreifen: ein Kopf kann in der Titel-Schrift stehen (LS 101
    // «Art. 35»). Ohne das Abstreifen zählte die Zählweisen-Erhebung ihn nicht
    // mit — und bei der Kantonsverfassung kippte die Marker-Wahl.
    const zeile = rohZeile.startsWith(TITEL_MARKER)
      ? rohZeile.slice(TITEL_MARKER.length)
      : rohZeile;
    if (PARAGRAF_KOPF.test(zeile)) par++;
    else if (ARTIKEL_KOPF.test(zeile)) art++;
  }
  return art > par ? 'artikel' : 'paragraf';
}

/** Wie extrahiereZhParagraphen, aber ALLE Artikel (token → Artikel). Kern für
 *  holeZhPdf (Vollabdeckung §7) und den quelleHash.
 *
 *  `protokoll` (optional) nimmt die §8-Sichtbarkeitsmeldungen auf: bewusst nicht
 *  erfasste Erlassteile (Schlussapparat/Anhang) und nicht lückenlos
 *  expandierbare Sammel-Aufhebungsbereiche. Ohne den Parameter verhält sich die
 *  Funktion unverändert. */
export function extrahiereAlleZhParagraphen(
  text: string,
  marker: ZhMarker = erkenneZhMarker(text),
  protokoll?: string[],
): Record<string, ZhArtikel> {
  const zeilen = text.split('\n');
  const artikel: Record<string, ZhArtikel> = {};
  const KOPF_MUSTER = marker === 'artikel' ? ARTIKEL_KOPF : PARAGRAF_KOPF;

  let aktivToken: string | null = null;
  let aktivZeilen: string[] = [];
  // Ab dem Schluss­apparat (Übergangs-/Schlussbestimmungen, Anhang) wird nichts
  // mehr aufgenommen — dort beginnt eine zweite, kollidierende §-Zählung.
  let imSchlussapparat = false;
  // Tokens, die NUR aus einem Sammel-Aufhebungskopf stammen. Ein späterer echter
  // Kopf desselben Tokens darf den Platzhalter ersetzen — sonst würde die
  // Wiedereröffnungs-Sperre echten Normtext verschlucken (§1).
  const ausSammelkopf = new Set<string>();
  // Wo die Erfassung endet (§8-Auslassung, Bug B-6). Fix-Runde 3 (A4): ALLE
  // Schnitte werden erfasst, nicht nur der erste. ZH-700.1 hat zwei — die
  // Übergangsbestimmungen ab S. 86 UND den Anhang ab S. 93, der ältere
  // Fassungen einzelner §§ nachdruckt. Bis hierher deklarierte der Index nur
  // den ersten und verschwieg damit ausgerechnet den grösseren Teil.
  const schnitte: Array<{ grund: string; ab: string; abIndex: number }> = [];
  /** Zähler der laufenden (mehrzeiligen) arabischen Gliederungs-Überschrift:
   *  0 = keine, 1 = Kopfzeile gesehen, 2… = Fortsetzungszeilen. */
  let titelKette = 0;
  const melde = (zeile: string): void => {
    if (protokoll && !protokoll.includes(zeile)) protokoll.push(zeile);
  };

  const speichere = (): void => {
    if (aktivToken === null) return;
    const token = aktivToken;
    if (token in artikel) return; // Wiedereröffnung ausgeschlossen (s.u.)
    const bloecke = baueBloecke(aktivZeilen);
    if (bloecke.length > 0) {
      artikel[token] = { bloecke };
      return;
    }
    // AUFGEHOBENE BESTIMMUNG (Bug B-5, 31.8.2026): Die Zürcher Sammlung druckt
    // eine aufgehobene Bestimmung als nackten Kopf OHNE jeden Text; die
    // zugehörige amtliche Fussnote lautet «Aufgehoben durch …» (verifiziert am
    // Druckbild: ZH-230 § 28 → Fussnote 50, ZH-175.2 § 18 → Fussnote 32).
    // Bisher fiel der Kopf mangels Blöcken ersatzlos weg — 53 eIds im ZH-Korpus,
    // und die Nummerierung wirkte lückenhaft. Jetzt bleibt der Token mit dem
    // Platzhalter «Aufgehoben» erhalten (gleiche Schreibweise wie im Bund-Korpus
    // aus Fedlex). Der Platzhalter wird NUR gesetzt, wenn die ganze §-Region
    // keine einzige Textzeile trug — nie über vorhandenen Text hinweg.
    artikel[token] = { bloecke: [{ absatz: null, text: 'Aufgehoben' }] };
  };

  let zeilenIndex = -1;
  for (const rohMitMarker of zeilen) {
    zeilenIndex++;
    // TITELSCHRIFT-Marker abstreifen, BEVOR irgendein Muster greift (er stünde
    // sonst vor dem «§» und keiner der Köpfe würde mehr erkannt).
    const istTitelschrift = rohMitMarker.startsWith(TITEL_MARKER);
    const rohZeile = istTitelschrift
      ? rohMitMarker.slice(TITEL_MARKER.length)
      : rohMitMarker;
    const zeile = rohZeile.replace(/\s+$/g, '');
    // Arabisch nummerierte Gliederungs-Überschrift: NUR mit der typografischen
    // Bestätigung (s. GLIEDERUNG_ARABISCH / TITEL_MARKER). Die Prüfung steht
    // hier oben, weil die Überschrift auch MITTEN in einer lit.-Aufzählung
    // stehen kann (ZH-131.1 § 102 lit. b, ZH-215.1 § 21 lit. e) — dort hängt
    // sie sonst an den laufenden item-Text, nicht an den Blocktext.
    const istArabischerTitel =
      istTitelschrift && aktivToken !== null && GLIEDERUNG_ARABISCH.test(zeile.trim());
    // FORTSETZUNGSZEILE einer solchen Überschrift: Die längeren Titel brechen um
    // («5. Der Bau der Erschliessungsanlagen, Ausstattungen | und Ausrüstungen;
    // Rechtsverhältnisse», ZH-700.1 § 165; «2. Abstände von Territorialgrenzen,
    // Wald und von durch | Baulinien gesicherten Anlagen», § 260). Die zweite
    // Zeile trägt keine Nummer mehr, steht aber in derselben Titel-Schrift und
    // direkt darunter. Ohne diese Kette blieb der halbe Titel im Normtext.
    // BEWUSST ENG: nur unmittelbar nach einer VERWORFENEN arabischen
    // Überschrift, und nie über einen §-Kopf hinweg (§1). Die Fortsetzungen der
    // Buchstaben-/zählenden Gliederung sind ein anderer, älterer Befund (B-8,
    // Marginalien-Ebene) und bleiben unberührt.
    const istTitelFortsetzung =
      istTitelschrift &&
      titelKette > 0 &&
      titelKette <= TITEL_KETTE_MAX &&
      aktivToken !== null &&
      !PARAGRAF_KOPF.test(zeile.trim()) &&
      !ARTIKEL_KOPF.test(zeile.trim()) &&
      !SCHLUSSAPPARAT.test(zeile.trim()) &&
      !ANHANG_TITEL.test(zeile.trim());
    if (istArabischerTitel) {
      titelKette = 1;
      continue;
    }
    if (istTitelFortsetzung) {
      titelKette++;
      continue;
    }
    titelKette = 0;
    if (SCHLUSSAPPARAT.test(zeile.trim())) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      schnitte.push({
        grund: 'Übergangs-/Schlussbestimmungen',
        ab: zeile.trim().slice(0, 70),
        abIndex: zeilenIndex,
      });
      imSchlussapparat = true;
      continue;
    }
    // Auch INNERHALB des bereits abgeschnittenen Teils wird weiter nach
    // Abschnitts-Marken gesucht (A4): sonst bliebe der zweite Schnitt eines
    // Erlasses unsichtbar, obwohl er der grössere ist.
    if (imSchlussapparat) {
      if (ANHANG_TITEL.test(zeile.trim())) {
        schnitte.push({ grund: 'Anhang', ab: zeile.trim().slice(0, 70), abIndex: zeilenIndex });
      }
      continue;
    }
    // ANHANG-GRENZE (Bug 22.6.2026): der «Anhang: Gebührentarif» (ZH-243) ist
    // eine eigene Tarif-TABELLE und wird SPALTENBEWUSST über
    // extrahiereZhAnhangSpalten erfasst — NICHT vom generischen §-Parser. Da auf
    // den letzten § (§ 17, Schlussbestimmung) KEIN weiterer §-Kopf folgt, würde
    // der Parser sonst den GANZEN Anhang an § 17 hängen (3740-Zeichen-Blob).
    // Beim «Anhang»-Titel wird der laufende § abgeschlossen und die Akkumulation
    // gestoppt (Rest der Textbasis = Tabelle, gehört nicht in einen §).
    if (ANHANG_TITEL.test(zeile.trim())) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      schnitte.push({ grund: 'Anhang', ab: zeile.trim().slice(0, 70), abIndex: zeilenIndex });
      imSchlussapparat = true;
      continue;
    }
    // SAMMEL-AUFHEBUNGSKOPF «§§ 66–69.» (Bug B-2, Gegenprüfung Runde 2).
    //
    // Vorher fiel die Zeile durch jedes Muster: PARAGRAF_KOPF schliesst «§§»
    // ausdrücklich aus, also war sie gewöhnlicher Text und klebte am
    // Vorgänger-§ (26 kontaminierte Blöcke im Bestand, 6 davon NUR aus
    // Fremdmaterial). Die genannten §§ fehlten ersatzlos — allein in ZH-230
    // u. a. 58–63, 66–69, 73–116, 117 a–117 m, 137bis–167, 253–255.
    //
    // Jetzt: laufenden § schliessen, Bereich expandieren, je genannten § einen
    // «Aufgehoben»-Platzhalter mit eigenem Token emittieren — dieselbe
    // Schreibweise wie beim nackten Einzel-Kopf (dort am Druckbild gegen die
    // Fussnote «Aufgehoben durch …» verifiziert).
    const sammel = zeile.trim().startsWith(SAMMEL_MARKER)
      ? zeile.trim().slice(SAMMEL_MARKER.length).trim()
      : null;
    if (sammel !== null) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      const liste = sammel.replace(/^§§\s*/, '').replace(/\s*\.$/, '');
      const { tokens, exakt } = expandiereSammelbereich(liste);
      if (tokens.length === 0) {
        melde(`Sammel-Aufhebungskopf «${sammel}» nicht lesbar — §§ NICHT im Snapshot.`);
        continue;
      }
      if (!exakt) {
        melde(
          `Sammel-Aufhebungskopf «${sammel}»: Bereich nicht lückenlos ableitbar — ` +
            `erfasst sind ${tokens.join(', ')}; dazwischen liegende §§ mit ` +
            `Buchstaben-/lat. Suffix können fehlen (nicht geraten, §8).`,
        );
      }
      for (const t of tokens) {
        if (t in artikel) continue;
        artikel[t] = { bloecke: [{ absatz: null, text: 'Aufgehoben' }] };
        ausSammelkopf.add(t);
      }
      continue;
    }
    // Kopf am Zeilenanfang? (Marker-Muster je Erlass, s. erkenneZhMarker.)
    const kopf = zeile.match(KOPF_MUSTER);
    if (kopf) {
      // VERLORENE «¹»-Recovery (Bug 22.6.2026): die hochgestellte Absatznummer
      // «1» des ERSTEN Absatzes steht in den ZH-PDF auf einer EIGENEN Zeile
      // DIREKT VOR der «§ N.»-Kopfzeile (pdfjs liest sie als «¶1» kurz oberhalb
      // der Überschrift) — sie gehört also zum NEUEN §, nicht zum vorigen. Steht
      // als letzte Zeile des laufenden § ein NACKTER ¶-Marker (nur Nummer, kein
      // Text), so ist das genau dieser verirrte Erst-Absatz-Marker: aus dem
      // alten § entfernen und dem neuen § voranstellen. (Ein nackter ¶-Marker
      // kann nie das LETZTE des vorigen § sein — sein Absatztext stünde sonst
      // zwischen ihm und dem §-Kopf, nicht danach.) §1: nur Zuordnung der
      // bereits extrahierten Nummer korrigiert, kein Zeichen erfunden.
      //
      // KEINE WIEDERERÖFFNUNG (Bug B-3, zweiter Teil): Ein bereits gespeicherter
      // Token darf nie ein zweites Mal einen Artikel eröffnen. Vorher verwarf
      // `speichere()` den zweiten Treffer still und beendete trotzdem den
      // laufenden §; damit ging Normtext verloren, ohne dass irgendetwas rot
      // wurde. Jetzt gilt die Zeile in diesem Fall als gewöhnlicher Text und
      // fliesst in den laufenden § — kein Zeichen geht verloren.
      const kandidat = normalisiereZhKopf(kopf);
      // Ein Token, das bisher NUR als Sammelkopf-Platzhalter existiert, wird von
      // einem echten Kopf überschrieben: sonst schluckte die Wiedereröffnungs-
      // Sperre den Normtext dieses § (§1). Umgekehrt bleibt ein echter Artikel
      // gegen jede Wiedereröffnung geschützt.
      if (kandidat in artikel && ausSammelkopf.has(kandidat)) {
        delete artikel[kandidat];
        ausSammelkopf.delete(kandidat);
        melde(
          `§ ${kandidat.replace(/_/g, '')} stand in einem Sammel-Aufhebungskopf UND trägt ` +
            `eigenen Text — der Platzhalter wurde durch den Wortlaut ersetzt.`,
        );
      }
      if (kandidat in artikel) {
        if (aktivToken !== null) aktivZeilen.push(zeile.trim());
        continue;
      }
      // Ein Absatzmarker, der auf der Kopfzeile selbst steht, gehört zum ersten
      // Absatz des NEUEN § und darf beim Abschneiden des Kopfs nicht verloren
      // gehen (Regelfall ist die eigene Marker-Zeile, s. Recovery unten).
      const kopfMarker = kopf[0].match(/^¶(\d+(?:bis|ter|quater|quinquies)?)/);
      let verirrterMarker: string | null = kopfMarker ? `¶${kopfMarker[1]}` : null;
      while (aktivZeilen.length > 0 && aktivZeilen[aktivZeilen.length - 1] === '') {
        aktivZeilen.pop();
      }
      const letzte = aktivZeilen[aktivZeilen.length - 1];
      if (letzte !== undefined && verirrterMarker === null) {
        const m = letzte.match(ABSATZ_MARKER);
        if (m && m[2].trim() === '') {
          verirrterMarker = `¶${m[1]}`;
          aktivZeilen.pop();
        }
      }
      // Alles vor dem § ist Marginalie-Rest/Müll → verwerfen; alles nach «§ N.»
      // ist der Beginn des ersten Absatzes.
      speichere();
      aktivToken = kandidat;
      aktivZeilen = [];
      // Den verirrten Erst-Absatz-Marker dem neuen § voranstellen, BEVOR der
      // Resttext der Kopfzeile als (markerlose) Folgezeile dazukommt — so wird
      // «¶1» dem ersten Absatz korrekt zugewiesen (baueBloecke nimmt den Resttext
      // als dessen Text auf).
      if (verirrterMarker !== null) aktivZeilen.push(verirrterMarker);
      const nachKopf = zeile.slice(zeile.indexOf(kopf[0]) + kopf[0].length).trim();
      // Der erste Absatz hat oft keine ¶-Nummer (impliziter Absatz 1) ODER die
      // ¶1-Marke steht auf der eigenen Folgezeile. Den Resttext als erste Zeile
      // ohne Marker aufnehmen.
      if (nachKopf) aktivZeilen.push(nachKopf);
      continue;
    }
    if (aktivToken === null) continue; // vor dem ersten §: Präambel → ignorieren
    // Gliederungs-Überschriften («B. Schlichtungsverfahren», «2. Kapitel:
    // Grundrechte») sind kein Normtext (Bug B-3 für die zählende Form).
    if (GLIEDERUNG.test(zeile.trim())) continue;
    if (GLIEDERUNG_ZAEHLEND.test(zeile.trim())) continue;
    aktivZeilen.push(zeile.trim());
  }
  speichere();

  // Je ABSCHNITTSART eine Protokoll-Zeile (nicht je Überschrift): ein Erlass
  // trägt oft ein halbes Dutzend «Übergangsbestimmung zur Änderung vom …»-Köpfe
  // hintereinander — das ist EINE Auslassung, nicht sechs. Aufeinanderfolgende
  // Schnitte gleicher Art werden darum zusammengefasst; der Wechsel der Art
  // (Übergangsapparat → Anhang) beginnt eine neue Zeile.
  const gruppen: Array<{ grund: string; ab: string; anzahl: number }> = [];
  for (let i = 0; i < schnitte.length; i++) {
    const s = schnitte[i];
    const bis = schnitte[i + 1]?.abIndex ?? zeilen.length;
    const anzahl = Math.max(bis - s.abIndex, 0);
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.grund === s.grund) letzte.anzahl += anzahl;
    else gruppen.push({ grund: s.grund, ab: s.ab, anzahl });
  }
  for (const s of gruppen) {
    const anzahl = s.anzahl;
    const anteil = Math.round((anzahl / Math.max(zeilen.length, 1)) * 100);
    const grundText =
      s.grund === 'Anhang'
        ? 'Grund: der Anhang führt eine eigene, mit dem Haupttext kollidierende Zählung.'
        : 'Grund: die Änderungserlasse führen eine eigene, bei 1 neu beginnende §-Zählung.';
    melde(
      `${s.grund} ab «${s.ab}» vom §-Parser NICHT erfasst — ` +
        `${anzahl} von ${zeilen.length} Textzeilen (${anteil} %). ` +
        `${grundText} Massgeblich ist die amtliche Fassung.`,
    );
  }

  return artikel;
}

// ─────────────────────────────────────────────────────────────────────────────
// quelleHash (Drift-Token)
// ─────────────────────────────────────────────────────────────────────────────

/** sha256 des normalisierten Volltexts ALLER extrahierten Artikel (stabil
 *  sortiert nach token). Dient als fassungsToken (§7 d). */
export function berechneZhQuelleHash(
  artikel: Record<string, ZhArtikel>,
): string {
  const teile: string[] = [];
  for (const token of Object.keys(artikel).sort()) {
    teile.push(`#${token}`);
    for (const b of artikel[token].bloecke) {
      const items = (b.items ?? [])
        .map((i) => `${i.marke}\t${i.text}`)
        .join('\n');
      const vTeil = b.verweis ? `${b.verweis.etikett}\t${b.verweis.ziffern}` : '';
      const mTeil = b.mehrspaltig
        ? [(b.mehrspaltig.kopf ?? []).join('\t'), ...b.mehrspaltig.zeilen.map((z) => z.join('\t'))].join('\n')
        : '';
      teile.push(
        [
          `${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}`,
          vTeil,
          mTeil,
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
  }
  return createHash('sha256').update(teile.join('\n'), 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Stand aus dem PDF-Kopf-Marker
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Liest das In-Kraft-Datum aus dem PDF-Kopf-Marker «1. 1. 15 - 87»
 * (= 1.1.2015, Nachtrag 87) → ISO «2015-01-01». Der Marker steht im Fussband
 * jeder Seite; wir bekommen ihn separat (er wird beim Zeilen-Extrakt verworfen)
 * und parsen ihn aus dem Roh-Text. Liefert '' wenn nicht gefunden.
 */
export function leseZhStand(kopfText: string): string {
  // Form «D. M. YY - NN» (Tag. Monat. zweistelliges Jahr - Nachtrag).
  const m = kopfText.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{2})\s*-\s*\d+/);
  if (!m) return '';
  const tag = m[1].padStart(2, '0');
  const monat = m[2].padStart(2, '0');
  // Zweistelliges Jahr → 20YY (ZH-Erlasse alle nach 2000).
  const jahr = `20${m[3]}`;
  return `${jahr}-${monat}-${tag}`;
}

/**
 * Liest das In-Kraft-Datum aus dem zhlex-Registry-URL-Slug. Die Registry-URL
 * trägt zwei Datum-Tripel: das ERSTE ist das Beschluss-/Erlassdatum, das ZWEITE
 * das Inkrafttreten. Beispiel:
 *   …/erlass-211_11-2010_09_08-2011_01_01-087.html
 *                    ^Beschluss   ^Inkraft (= stand)
 * → ISO «2011-01-01». Das ist das massgebliche In-Kraft-Datum (§7/§8), NICHT der
 * Loseblatt-Nachtrag-Druckstand «1. 1. 15 - 87» aus dem PDF-Fussband (leseZhStand,
 * nur noch Fallback). Liefert '' wenn das Muster nicht matcht (defensiv).
 */
export function leseZhStandAusUrl(registryUrl: string): string {
  const m = registryUrl.match(
    /erlass-[^-]+-\d{4}_\d{2}_\d{2}-(\d{4})_(\d{2})_(\d{2})-/,
  );
  if (!m) return '';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/**
 * Liest das **Publikationsdatum** der geltenden Nachtragsfassung aus dem
 * zhlex-Registry-HTML → ISO. Das ist der `stand` (Befund E2-H4, 31.8.2026).
 *
 * WARUM NICHT DAS URL-DATUM: der zweite Datums-Tripel im Slug ist das
 * UR-Inkrafttreten des Erlasses. Für das VRG (LS 175.2) ist das der 1.5.1960 —
 * als «Stand» einer Fassung, die den Rechtszustand von 2026 wiedergibt, ist das
 * falsch und irreführend (§8).
 *
 * WARUM NICHT DER PDF-FUSSBAND-MARKER («1. 10. 26 - 134»): das ist die
 * Ausgabe-Marke der Loseblatt-Nachführung, die dem Publikationsdatum
 * vorauslaufen kann — genau die Fehlerklasse, die `check:stand-zukunft` am
 * SZ-Fall («SRSZ 1.2.2027») festgehalten hat.
 *
 * MESSUNG (alle 24 ZH-Erlasse, offline aus dem Roh-PDF-Cache, Fix-Runde 3):
 * Der Fussband-Marker weicht in **11 von 24** Erlassen vom Publikationsdatum ab
 * (ZH-101 · 170.4 · 177.10 · 211.11 · 211.15 · 230 · 323.1 · 331 · 631.1 ·
 * 631.11 · 700.1); grösste Abweichung ZH-211.11 (Marke 1.1.2015,
 * Publikationsdatum 1.1.2011), typischer Fall ZH-700.1 (Marke 1.10.2026,
 * Publikationsdatum 1.8.2026). Das URL-Datum (UR-Inkrafttreten) weicht in
 * **22 von 24** ab — es ist als «Stand» praktisch immer falsch und nur
 * Notnagel. *(Korrektur: der Kommentar nannte bis zur Fix-Runde 3 «7 von 24» —
 * eine Fehlzählung derselben Session, keine gealterte Angabe; die Reihenfolge
 * der Fallback-Kette war und ist davon unberührt.)*
 *
 * BELEG, dass das Publikationsdatum der Fassungsbeginn ist: die Historie
 * derselben Registry-Seite nennt für die Vorgängerfassung «in Kraft bis
 * <dasselbe Datum>» (geprüft an allen 24 Erlassen, 31.8.2026 — z. B. LS 175.2:
 * «Nachtragsnummer 133 (aktuell) · 129 (in Kraft bis 01.07.2026)» und
 * «Publikationsdatum 01.07.2026»).
 *
 * Markup (server-gerendert, kein JS nötig):
 *   <dt>Publikationsdatum</dt>\n<dd>01.07.2026</dd>
 * Liefert '' wenn das Feld fehlt — dann greift die Fallback-Kette in holeZhPdf.
 */
export function leseZhPublikationsdatum(registryHtml: string): string {
  const m = registryHtml.match(
    /<dt>\s*Publikationsdatum\s*<\/dt>\s*<dd>\s*(\d{2})\.(\d{2})\.(\d{4})\s*<\/dd>/,
  );
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Netz-Hülle: Registry-HTML → Redirect → PDF → Extraktion
// ─────────────────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (LexMetrik Normtext-Snapshot)';

// ── ZH-4b · Netz-Härtung (§17-Wurzelfix, 31.8.2026) ──────────────────────────
// Vorher: drei NACKTE `fetch` je Erlass ohne Timeout/Wiederholung. Bei 3
// Erlassen nie aufgefallen; ab ~20 Erlassen schlägt ein transienter Ausfall
// still zu (der Erlass fehlt kommentarlos im Korpus — Befund Dossier §7).
//
// Zwei Massnahmen, beide HIER (nicht global), damit FETCH_CONCURRENCY für die
// übrigen Kantons-Routen unangetastet bleibt:
//   1. `fetchMitWiederholung` (netz-retry.ts): Timeout je Versuch + Backoff bei
//      Netz-Wurf/429/5xx. 4xx bleibt hart (löst sich nicht von selbst).
//   2. Globale SERIELLE Drossel auf ~1 Request/Sekunde gegen zh.ch/notes.zh.ch.
//      Das Dossier hat nur seriell ~1 req/s gemessen (§5) — über Parallel-
//      Massenlast sagt die Messung nichts. Die Drossel gilt prozessweit, also
//      auch wenn der Aufrufer die Erlasse über pLimit(4) parallel anstösst:
//      die Erlass-Schleife darf parallel laufen, die Requests tun es nicht.
const ZH_MIN_ABSTAND_MS = 1000;
let zhKette: Promise<unknown> = Promise.resolve();
let zhLetzterStart = 0;

const schlafe = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Ein Request gegen die ZH-Hosts: seriell eingereiht, auf ~1 req/s gedrosselt,
 * mit Timeout + Wiederholung. Wirft nach erschöpften Versuchen (kein stiller
 * Verlust — der Aufrufer meldet den Erlass als Fehl-Erlass).
 */
async function zhFetch(url: string): Promise<Response> {
  const anDerReihe = zhKette.then(async () => {
    const wartezeit = ZH_MIN_ABSTAND_MS - (Date.now() - zhLetzterStart);
    if (wartezeit > 0) await schlafe(wartezeit);
    zhLetzterStart = Date.now();
  });
  // Kette fortschreiben, BEVOR gewartet wird: der nächste Aufrufer hängt sich
  // hinter diesen Platz (Reihenfolge = Aufrufreihenfolge, kein Gedränge).
  zhKette = anDerReihe;
  await anDerReihe;
  return fetchMitWiederholung(
    url,
    { headers: { 'User-Agent': UA } },
    {
      beiWiederholung: (versuch, grund, warteMs) =>
        console.warn(`  ZH-Netz: Wiederholung ${versuch} für ${url} (${grund}) — warte ${warteMs} ms`),
    },
  );
}

/** Extrahiert die OpenAttachment-PDF-URL aus dem Registry-HTML (notes.zh.ch). */
export function leseAttachmentUrl(registryHtml: string): string | null {
  const m = registryHtml.match(
    /href="(https?:\/\/[^"]*notes\.zh\.ch[^"]*OpenAttachment[^"]*)"/i,
  );
  return m ? m[1].replace(/&amp;/g, '&') : null;
}

/** Löst den 153-Byte-JS-Redirect (window.location="…") gegen die notes.zh.ch-
 *  Basis auf → absolute PDF-URL. Liefert null, wenn kein window.location. */
export function loeseRedirect(redirectHtml: string, basisUrl: string): string | null {
  const m = redirectHtml.match(/window\.location\s*=\s*["']([^"']+)["']/i);
  if (!m) return null;
  return new URL(m[1], basisUrl).toString();
}

/**
 * Holt einen ZH-Erlass als Volltext: Registry-HTML → OpenAttachment → JS-
 * Redirect → PDF-Bytes → pdfjs-Extraktion → §-Parser. meta trägt
 * titel/stand/quelleHash; `tokens` filtert die Rückgabe (nur zitierte Artikel),
 * der quelleHash deckt aber den GANZEN extrahierten Volltext ab.
 */
/** Token-Präfix für die NACKTEN Anhang-Ziffern (1–14): die Sektions-Gruppenköpfe
 *  (1–4) und die Sektion-C-Posten (5–14) tragen eigenständigen Tarif-Wortlaut,
 *  ihre nackte Zahl kollidiert aber mit den §§ 1–17. Sie bekommen darum den
 *  Token «anhang_N» (im Lese-View «Anhang Ziff. N»), damit sie weder die §§
 *  überschreiben noch verloren gehen. parsePassus löst NUR mehrstufige Anhang-
 *  Ziffern («Anhang Ziff. N.N») als Token auf — die nackten Posten sind also
 *  ohnehin kein Zitatziel; «anhang_N» ist reine Sicht-/Vollabdeckungs-Adresse. */
const ANHANG_NACKT_PREFIX = 'anhang_';

/**
 * Spaltenbewusste Extraktion des ZH-NotGebV-Anhang-Tarifs (Auftrag David
 * 17.6.2026; x-Geometrie-Neufassung 22.6.2026). Liest die Anhang-Region (alles
 * ab dem «Anhang»-Titel) und delegiert an die reine, gegen die Fixture getestete
 * `extrahiereZhNotariatsTarif` (4-Spalten-x-Geometrie, §1). Jede Tarif-Zeile wird
 * zu einem je-Ziffer-Snapshot-Eintrag: hierarchische Ziffern (1.1.1, 2.3.3 …)
 * behalten ihren gepunkteten, zitat-auflösbaren Token; nackte Posten (1–14)
 * erhalten «anhang_N» (Kollisions-Schutz gegen die §§). Verweise stehen als
 * «(vgl. Ziff. …)» am Zeilenende. Kein 3740-Zeichen-Blob mehr; der frühere
 * Spaltenkopf-Leak («Ansatz/Fr. Beurkundungsgebühren siehe Ziff.:») ist über die
 * h≥8.7-Schwelle ausgeschlossen.
 */
async function extrahiereZhAnhangSpalten(
  bytes: Uint8Array,
): Promise<Record<string, ZhArtikel>> {
  const stuecke = await extrahiereZhAnhangStuecke(bytes);
  const tarif = extrahiereZhNotariatsTarif(stuecke);
  if (!tarif) return {};

  const eintraege: Record<string, ZhArtikel> = {};
  for (const [ziffer, beschreibung, verweis] of tarif.zeilen) {
    if (!beschreibung && !verweis) continue;
    // Nackte Top-Level-Posten (kein Punkt) → «anhang_N» (Kollisions-Schutz §§).
    const token = ziffer.includes('.') ? ziffer : `${ANHANG_NACKT_PREFIX}${ziffer}`;
    if (token in eintraege) continue; // erster Treffer gewinnt
    const block: ZhBlock = { absatz: null, text: beschreibung };
    if (verweis) {
      // Etikett quellgetreu vom Spaltenkopf; fehlt es (Seite ohne Kopfzeile),
      // bleibt das Feld weg statt geraten zu werden (§8).
      const etikett = tarif.verweisEtiketten[ziffer];
      if (etikett !== undefined) block.verweis = { etikett, ziffern: verweis };
    }
    eintraege[token] = { bloecke: [block] };
  }
  return eintraege;
}

/**
 * Extrahiert die rohen PDF-Stücke {x,y,h,s,p} der ZH-NotGebV-Anhang-Region
 * (alles ab der Seite mit dem «Anhang: Gebührentarif»-Titel) — Eingabe für
 * `extrahiereZhNotariatsTarif`. Vor dem Anhang-Titel (= der §§-Teil) wird NICHTS
 * aufgenommen, damit die §-Region (inkl. Fussnoten-Definitionen) nicht in die
 * Tarif-Extraktion gerät. Kopf-/Fussband (y<60 / y>530) und Erlasstitel (h≥11)
 * raus. Leeres Array, wenn kein «Anhang»-Titel gefunden (defensiv, §1).
 */
async function extrahiereZhAnhangStuecke(
  bytes: Uint8Array,
): Promise<Array<{ x: number; y: number; h: number; s: string; p: number }>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  type S = { x: number; y: number; h: number; s: string; p: number };
  const alle: S[] = [];
  // Anhang-Startseite: die Seite mit dem Titel «Anhang: Gebührentarif» (h≈10.7).
  let anhangSeite = Number.MAX_SAFE_INTEGER;
  const seiten: S[][] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    const stueckeSeite: S[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = item.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      if (/^Anhang(:|\b)/.test(item.str.trim()) && anhangSeite === Number.MAX_SAFE_INTEGER) {
        anhangSeite = p;
      }
      stueckeSeite.push({ x: item.transform[4], y, h, s: item.str, p });
    }
    seiten[p] = stueckeSeite;
  }
  if (anhangSeite === Number.MAX_SAFE_INTEGER) return [];
  for (let p = anhangSeite; p < seiten.length; p++) {
    if (seiten[p]) alle.push(...seiten[p]);
  }
  return alle;
}

/**
 * Extrahiert die rohen PDF-Stücke {x,y,h,s,p} einer §-Region aus dem ZH-PDF-
 * Byte-Array. Die Region wird durch startMarker (inkl.) und endMarker (exkl.)
 * zeilenweise aus den pdfjs-Stücken begrenzt.
 *
 * Intern-Privat: nur für holeZhPdf. Kein Export (Testbarkeit liegt auf der
 * reinen Funktion extrahiereZhStreitwertStaffel gegen die Fixture, §2).
 */
async function extrahiereZhParStuecke(
  bytes: Uint8Array,
  startMarker: RegExp,
  endMarker: RegExp,
): Promise<Array<{ x: number; y: number; h: number; s: string; p: number; w?: number }>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  type S = { x: number; y: number; h: number; s: string; p: number; w?: number };
  const alle: S[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number; width?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = item.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      // `w` (Fragment-Breite) trägt die Spaltenrand-Trennung in
      // zh-tarif-geometrie.ts (Bug B-5) — ohne sie bleibt jedes Fragment ganz.
      alle.push({ x: item.transform[4], y, h, s: item.str, p, w: item.width });
    }
  }

  // Zeilen (p, y-absteigend) bilden
  const byPY = new Map<string, S[]>();
  for (const s of alle) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) { l = []; byPY.set(key, l); }
    l.push(s);
  }
  const rows = [...byPY.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });

  // Startmarker und Endmarker in Zeilen suchen
  let parStart = -1;
  let parEnd = rows.length;
  for (let i = 0; i < rows.length; i++) {
    const text = rows[i][1].map((s) => s.s).join('');
    if (parStart < 0 && startMarker.test(text)) {
      parStart = i;
    } else if (parStart >= 0 && endMarker.test(text)) {
      parEnd = i;
      break;
    }
  }

  if (parStart < 0) return [];

  // Stücke der Region sammeln
  const parStuecke: S[] = [];
  for (let i = parStart; i < parEnd; i++) {
    for (const s of rows[i][1]) {
      parStuecke.push(s);
    }
  }
  return parStuecke;
}

export async function holeZhPdf(
  registryUrl: string,
  modus: CacheModus = modusAusUmgebung('auto'),
): Promise<ZhErgebnis> {
  // 1.–3. Registry-HTML → OpenAttachment → JS-Redirect → PDF-Bytes, über den
  // Roh-PDF-Cache (O1, Skill-Prinzip «store raw as golden»). Im Modus 'auto'
  // berührt ein Cache-Treffer kein Netz; 'netz' erzwingt den Abruf (Drift-
  // Check), 'offline' verbietet ihn (CI/Tor ohne Netz).
  const quelle = await holeZhQuelle(
    registryUrl,
    { hole: zhFetch, leseAttachmentUrl, loeseRedirect },
    modus,
  );
  const regHtml = quelle.registryHtml;
  const bytes = quelle.bytes;

  // 4. Extraktion + Parsing. bytes für JEDEN pdfjs-Lauf kopieren (getDocument
  // detacht den Puffer → zweiter Lauf auf demselben Array würfe DataCloneError).
  // Spalten-Lücken-Erkennung AKTIV (Probe ZH-243 20.6.2026 validiert: nur
  // Leerzeichen an Spaltengrenzen, Wortlaut beweisbar identisch). Materialisiert
  // sich erst beim nächsten `npm run normtext` (Rollout) in die ZH-Snapshots.
  const { zeilen, randText } = await extrahiereZhTextZeilen(bytes.slice());
  const textbasis = serialisiereZhZeilen(zeilen);
  // Zählweise («§ N.» oder «Art. N») einmal je Erlass aus der Textbasis erheben
  // und für Parser UND Label verwenden (E2-H1) — nie erraten, nie verdrahten.
  const marker = erkenneZhMarker(textbasis);
  const hinweise: string[] = [];
  const artikel = extrahiereAlleZhParagraphen(textbasis, marker, hinweise);

  // Anhang-Tarif SPALTENBEWUSST erfassen (Auftrag David 17.6.2026): der ZH-
  // NotGebV-Anhang ist eine 4-Spalten-Tabelle (Ziffer | Beschreibung | Ansatz |
  // Verweise). Der generische Zeilen-Serialisierer verschränkt die Verweis-Spalte
  // in die Beschreibung («Begrün-2.2.1, 2.2.2, dung») — spaltenbewusst getrennt
  // bleibt der Wortlaut intakt + lesbar. Nur für ZH (eigene Spalten-x-Geometrie);
  // SG/LU-Anhänge nutzen weiter den generischen Segmentierer.
  const anhang = await extrahiereZhAnhangSpalten(bytes.slice());
  for (const [ziff, e] of Object.entries(anhang)) {
    if (!(ziff in artikel)) artikel[ziff] = e;
  }
  // §8-EHRLICHKEIT (A4, Fix-Runde 3): Der §-Parser meldet den Anhang als
  // Auslassung — für ZH-243 stimmt das NICHT, dort erfasst ihn der
  // spaltenbewusste Tarif-Zweig vollständig (150 Einträge). Ein Lücken-Index,
  // der eine erfasste Fläche als Lücke ausweist, ist so falsch wie einer, der
  // eine echte Lücke verschweigt. Die Zeile wird darum ersetzt, nicht ergänzt.
  if (Object.keys(anhang).length > 0) {
    for (let i = 0; i < hinweise.length; i++) {
      if (!hinweise[i].startsWith('Anhang ab ')) continue;
      const ab = hinweise[i].match(/^Anhang ab «([^»]*)»/)?.[1] ?? '';
      hinweise[i] =
        `Anhang ab «${ab}» ist als eigene Tarif-Einträge erfasst ` +
        `(${Object.keys(anhang).length} Ziffern, spaltenbewusst gelesen) — der ` +
        `§-Parser lässt ihn aus, damit die Anhang-Zählung nicht mit den §§ kollidiert.`;
    }
  }

  // ── Streitwert-Staffel spaltenbewusst (Stufe-2 Mehrspalten) ─────────────────
  // ZH-215.3 § 4 (AnwGebV): 3-spaltige Tabelle (Streitwert | Grundgebühr | Zuschlag).
  // ZH-211.11 § 3 (GebV OG): 2-spaltige Tabelle (Streitwert | Gebühr), h=7.98 pt.
  // ZH-211.11 § 4 (GebV OG): 3-spaltige Tabelle (Streitwert | Grundgebühr | Zuschlag).
  // Der generische Zeilen-Serialisierer verschmilzt die Spalten (z. B. «bis10000»,
  // «5000250»). Wir lesen die §-Region x-bewusst und setzen bei Erfolg mehrspaltig.
  // extrahiereZhStreitwertStaffel erkennt die Tabellenform automatisch am Kopf.

  // ZH-211.11 § 3: 2-spaltig (Streitwert | Gebühr)
  // NUR für ZH-211.11 (GebV OG): § 3 Abs. 1 enthält eine 2-spaltige Tarif-Tabelle.
  // Andere Erlasse (ZH-215.3, ZH-243) haben in § 3 keine Tarif-Staffel-Tabelle.
  const istZh21111 = /erlass-211_11/i.test(registryUrl);
  if (istZh21111 && '3' in artikel && artikel['3'].bloecke.length > 0) {
    const par3Stuecke = await extrahiereZhParStuecke(bytes.slice(), /§\s*3\./, /§\s*4\./);
    const staffel3 = extrahiereZhStreitwertStaffel(par3Stuecke);
    if (staffel3 !== null) {
      const block0 = artikel['3'].bloecke[0];
      artikel['3'].bloecke[0] = {
        ...block0,
        text: staffel3.einleitung,
        mehrspaltig: zuKanonisch(staffel3),
      };
    }
  }

  // ZH-215.3 § 4 + ZH-211.11 § 4: 3-spaltig (Streitwert | Grundgebühr | Zuschlag)
  if ('4' in artikel && artikel['4'].bloecke.length > 0) {
    const par4Stuecke = await extrahiereZhParStuecke(bytes.slice(), /§\s*4\./, /§\s*5\./);
    const staffel = extrahiereZhStreitwertStaffel(par4Stuecke);
    if (staffel !== null) {
      const block0 = artikel['4'].bloecke[0];
      artikel['4'].bloecke[0] = {
        ...block0,
        text: staffel.einleitung,
        mehrspaltig: zuKanonisch(staffel),
      };
    }
  }

  // Stand = Publikationsdatum der geltenden Nachtragsfassung (Befund E2-H4).
  const stand =
    leseZhPublikationsdatum(regHtml) ||
    leseZhStandAusUrl(registryUrl) ||
    leseZhStand(randText) ||
    '';
  // Titel: erste Body-Zeile.
  const titel = zeilen.length > 0 ? zeilen[0].text : '';

  // Drift-Token = Hash der QUELL-Bytes (C2/§7 d); der Extraktions-Hash bleibt
  // als zweite Stufe daneben stehen (s. ZhErgebnis.meta).
  const extraktHash = berechneZhQuelleHash(artikel);
  const quelleHash = quelle.sidecar.bytesSha256;

  // Vollabdeckung (§7): ALLE Artikel zurückgeben. Label «Anhang Ziff. N.N.N» für
  // die gepunkteten Anhang-Ziffern (kongruent zu parsePassus, das «Anhang Ziff. …»
  // auf genau diesen Token auflöst); «Anhang Ziff. N» für die nackten Anhang-Posten
  // (Token «anhang_N», Kollisions-Schutz gegen die §§); sonst «§ N» (Paragraphen,
  // inkl. lat. Suffix «8a» aus «8_a»).
  const labels: Record<string, string> = {};
  const marke = marker === 'artikel' ? 'Art. ' : '§ ';
  for (const token of Object.keys(artikel)) {
    if (token.startsWith(ANHANG_NACKT_PREFIX)) {
      labels[token] = `Anhang Ziff. ${token.slice(ANHANG_NACKT_PREFIX.length)}`;
    } else if (token.includes('.')) {
      labels[token] = `Anhang Ziff. ${token}`;
    } else {
      labels[token] = `${marke}${token.replace(/_/g, '')}`;
    }
  }
  return {
    meta: { titel, stand, quelleHash, extraktHash, quellBytes: bytes.length },
    artikel,
    labels,
    hinweise,
  };
}
