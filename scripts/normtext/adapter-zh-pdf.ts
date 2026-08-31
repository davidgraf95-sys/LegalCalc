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
 * Drift-Token (§7 d): es gibt kein version_uid. quelleHash = sha256 der
 * normalisierten extrahierten PDF-Textbasis (alle Artikel + items, stabil
 * sortiert) dient als fassungsToken; `stand` aus dem PDF-Kopf-Marker
 * («1. 1. 15 - 87» → In-Kraft 1.1.2015) bzw. Registry. Re-fetch +
 * quelleHash-Vergleich erkennt jede inhaltliche Änderung der Quelle.
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). Die reine Parser-
 * Funktion extrahiereZhParagraphen() arbeitet ohne Netz/FS (testbar gegen
 * eine Fixture echten extrahierten ZH-Texts); holeZhPdf() ist die Netz-Hülle.
 */

import { createHash } from 'node:crypto';
import { typisiereSpalten, type Spalte } from './mehrspaltige-tabelle.ts';
import { fetchMitWiederholung } from './netz-retry.ts';
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
}

export interface ZhArtikel {
  bloecke: ZhBlock[];
}

export interface ZhErgebnis {
  meta: {
    titel: string;
    stand: string;
    quelleHash: string;
  };
  artikel: Record<string, ZhArtikel>; // token → Artikel
  /** Einheitliches Label je token: «§ N» (ZH ist ein «§»-Erlass). */
  labels: Record<string, string>;
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

/** Eine zusammengefügte Textzeile (eine y-Position einer Seite). */
export interface ZhTextZeile {
  /** Führende Absatznummer (hochgestellte Ziffer am Zeilenanfang) oder null. */
  absatz: string | null;
  /** Der bereinigte Zeilentext (Fussnoten-Hochzahlen entfernt). */
  text: string;
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

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();

    // Roh-Stücke mit Koordinaten sammeln (Kopf-/Fussband y>520 / y<60 raus,
    // aber den Rand-Text für die Stand-Erkennung separat sammeln).
    const stuecke: PdfStueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
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
      stuecke.push({ x, y, h, s: item.str, w: (item as { width?: number }).width ?? 0 });
    }
    zeilen.push(...montiereZhSeite(stuecke));
  }

  return { zeilen, randText: randStuecke.join(' ') };
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
export function montiereZhSeite(stuecke: PdfStueck[]): ZhTextZeile[] {
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
  // Geometrisch statt lexikalisch: Der Apparat wird von seinen Fussnoten-
  // ZIFFERN eingeleitet, die in einer eigenen, kleineren Schriftgrösse gesetzt
  // sind (h ≤ 5.2 gegen h = 5.70 der Body-Hochstellungen — die Höhenklassen
  // berühren sich im ganzen Bestand nicht). Alles auf oder unterhalb der
  // OBERSTEN solchen Ziffer gehört zum Apparat. Der Apparat steht immer unter
  // dem Body, nie darüber; Tarif-Tabellen (h 7.50/7.98) liegen oberhalb und
  // bleiben unberührt.
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
  const apparatYs = inhaltStuecke
    .filter((s) => s.h <= APPARAT_ZIFFER_MAX_H)
    .map((s) => s.y);
  const apparatY = apparatYs.length > 0 ? Math.max(...apparatYs) : -Infinity;

  // Nach y gruppieren (eine Textzeile). y auf ganze Punkte runden.
  const nachY = new Map<number, PdfStueck[]>();
  for (const st of inhaltStuecke) {
    if (st.y <= apparatY + 0.01) continue; // Fussnoten-Apparat
    const key = Math.round(st.y);
    let liste = nachY.get(key);
    if (!liste) {
      liste = [];
      nachY.set(key, liste);
    }
    liste.push(st);
  }

  // Zeilen von oben nach unten (y absteigend), je Zeile nach x sortiert.
  const yKeys = [...nachY.keys()].sort((a, b) => b - a);
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
      // Nur eine reine ZIFFER kann eine Absatznummer sein. Ein hochgestellter
      // lat. Suffix («bis»/«ter»/«quater») gehört IMMER in die Trägerzeile —
      // sonst zerfällt «§ 183ᵇⁱˢ.» in einen falschen Kopf «§ 183» und eine
      // Geisterzeile «bis» (ZH-230: §§ 174bis/183bis/183ter/183quater).
      const istZiffer = /^\s*\d+\s*$/.test(gruppe[i].s);
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
        // Führende Hochzahl am Zeilenanfang = Absatznummer.
        if (k === 0 && /^\s*\d+\s*$/.test(st.s)) {
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
    zeilen.push({ absatz, text: bereinigt });
  }
  return zeilen;
}

/**
 * Serialisiert Body-Textzeilen in einen einzigen, zeilengetrennten Text mit
 * eingebetteten Absatz-Markern «¶N» am Zeilenanfang. Diese Form ist die
 * testbare «extrahierte PDF-Textbasis», die extrahiereZhParagraphen() parst —
 * so kann der Parser ohne pdfjs/Netz gegen eine Fixture getestet werden.
 */
export function serialisiereZhZeilen(zeilen: ZhTextZeile[]): string {
  return zeilen
    .map((z) => (z.absatz !== null ? `¶${z.absatz} ${z.text}` : z.text))
    .join('\n');
}

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

/** Absatz-Marker «¶N» am Zeilenanfang (von serialisiereZhZeilen gesetzt; der
 *  Resttext ist optional — die Absatznummer steht oft auf der eigenen Zeile). */
const ABSATZ_MARKER = /^¶(\d+(?:bis|ter)?)\s*(.*)$/;

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

/** Silbentrennung am Zeilenende zusammenfügen: «…wer-» + «den.» → «…werden.».
 *  Nur wenn die Zeile auf «-» endet und die nächste mit Kleinbuchstabe beginnt
 *  (echte Worttrennung; ein «-» vor Grossbuchstabe/Ziffer bleibt erhalten). */
function fuegeZeilen(roh: string[]): string {
  let out = '';
  for (let i = 0; i < roh.length; i++) {
    const zeile = roh[i];
    const naechste = roh[i + 1] ?? '';
    if (/[a-zäöüé]-$/.test(zeile) && /^[a-zäöüé]/.test(naechste)) {
      // Trennstrich entfernen, nächste Zeile direkt anhängen (ohne Leerzeichen).
      out += zeile.slice(0, -1);
    } else {
      out += zeile + (i < roh.length - 1 ? ' ' : '');
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

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
      (aktiv.items ??= []).push({ marke: aktivItem.marke, text: t });
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
  for (const zeile of text.split('\n')) {
    if (PARAGRAF_KOPF.test(zeile)) par++;
    else if (ARTIKEL_KOPF.test(zeile)) art++;
  }
  return art > par ? 'artikel' : 'paragraf';
}

/** Wie extrahiereZhParagraphen, aber ALLE Artikel (token → Artikel). Kern für
 *  holeZhPdf (Vollabdeckung §7) und den quelleHash. */
export function extrahiereAlleZhParagraphen(
  text: string,
  marker: ZhMarker = erkenneZhMarker(text),
): Record<string, ZhArtikel> {
  const zeilen = text.split('\n');
  const artikel: Record<string, ZhArtikel> = {};
  const KOPF_MUSTER = marker === 'artikel' ? ARTIKEL_KOPF : PARAGRAF_KOPF;

  let aktivToken: string | null = null;
  let aktivZeilen: string[] = [];
  // Ab dem Schluss­apparat (Übergangs-/Schlussbestimmungen, Anhang) wird nichts
  // mehr aufgenommen — dort beginnt eine zweite, kollidierende §-Zählung.
  let imSchlussapparat = false;

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

  for (const rohZeile of zeilen) {
    const zeile = rohZeile.replace(/\s+$/g, '');
    if (SCHLUSSAPPARAT.test(zeile.trim())) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      imSchlussapparat = true;
      continue;
    }
    if (imSchlussapparat) continue;
    // ANHANG-GRENZE (Bug 22.6.2026): der «Anhang: Gebührentarif» (ZH-243) ist
    // eine eigene Tarif-TABELLE und wird SPALTENBEWUSST über
    // extrahiereZhAnhangSpalten erfasst — NICHT vom generischen §-Parser. Da auf
    // den letzten § (§ 17, Schlussbestimmung) KEIN weiterer §-Kopf folgt, würde
    // der Parser sonst den GANZEN Anhang an § 17 hängen (3740-Zeichen-Blob).
    // Beim «Anhang»-Titel wird der laufende § abgeschlossen und die Akkumulation
    // gestoppt (Rest der Textbasis = Tabelle, gehört nicht in einen §).
    // ANHANG-TITEL — nur die echte Anhang-Überschrift, nicht jedes Wort
    // «Anhang» am Zeilenanfang. Zulässig: «Anhang», «Anhang 1», «Anhang:
    // Gebührentarif (§ 1)». NICHT: «Anhang I zum Abkommen …», «Anhang K Anlage
    // 1 …» (umbrochene Fliesstext-Zeile in ZH-851.1 § 5e lit. c — sie kappte
    // mit der alten Fassung `^Anhang(:|\b)` den halben Erlass; in dieser
    // Fix-Runde selbst erzeugt und gemessen, 31.8.2026).
    if (/^Anhang(?:\s*\d*)?(?::|$)/.test(zeile.trim())) {
      speichere();
      aktivToken = null;
      aktivZeilen = [];
      imSchlussapparat = true;
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
    // Gliederungs-Überschriften («B. Schlichtungsverfahren») sind kein Normtext.
    if (GLIEDERUNG.test(zeile.trim())) continue;
    aktivZeilen.push(zeile.trim());
  }
  speichere();

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
      const mTeil = b.mehrspaltig
        ? [(b.mehrspaltig.kopf ?? []).join('\t'), ...b.mehrspaltig.zeilen.map((z) => z.join('\t'))].join('\n')
        : '';
      teile.push(
        [
          `${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}`,
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
 * SZ-Fall («SRSZ 1.2.2027») festgehalten hat. Gemessen weichen die beiden
 * Werte in 7 von 24 ZH-Erlassen voneinander ab (z. B. ZH-700.1: Marke
 * 1.10.2026, Publikationsdatum 1.8.2026).
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
// x-koordinatenbasierte Streitwert-Staffel-Extraktion (ZH-215.3 § 4, ZH-211.11 § 3 + § 4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert eine Streitwert-Staffel-Tabelle aus den rohen PDF-Stücken {x,y,h,s,p}
 * einer §-Region. Unterstützt zwei Tabellenformen, automatisch erkannt am Kopf:
 *
 * 3-Spalten-Form (ZH-215.3 § 4, ZH-211.11 § 4, h≈7.50 pt):
 *   Kopf «Streitwert | Grundgebühr» → kopf: ['Streitwert','Grundgebühr','Zuschlag']
 *   threshold1 = x von «Grundgebühr» (≈169 pt); threshold2 = threshold1+47 (≈216 pt).
 *   «zuzügl.»-Token in col2 wird an den Anfang von col3 verschoben (deterministisch).
 *
 * 2-Spalten-Form (ZH-211.11 § 3, h≈7.98 pt):
 *   Kopf «Streitwert | Gebühr» → kopf: ['Streitwert','Gebühr']
 *   threshold1 = x von «Gebühr» (≈203 pt); kein threshold2.
 *   Datenzeilen 2-spaltig: [Streitwert, Gebühr].
 *
 * Erkennungslogik (§1: nur aus x-Geometrie, kein Ziffern-Raten):
 *   - TABLE_MAX_H = 8.5 pt: erfasst beide Tabellenschrift-Höhen (7.50 und 7.98).
 *   - Kopfzeile = erste y-Gruppe mit «Streitwert»-Stück.
 *   - «Grundgebühr» in derselben Kopfzeile → 3-Spalten-Form;
 *     «Gebühr» ohne «Grundgebühr» → 2-Spalten-Form.
 *   - Keine Heuristik/Ziffern-Raten — nur Stück-x als Spalten-Zuordnung.
 *
 * Guard: keine Kopfzeile oder < 2 Datenzeilen → null (mehrdeutige Geometrie).
 * §1: Stücke werden nie intern aufgespalten; §2: kein Date.now/Math.random.
 * §3: reine Extraktion, kein UI-Code.
 */
export function extrahiereZhStreitwertStaffel(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
): { kopf: string[]; zeilen: string[][]; einleitung: string } | null {
  if (stuecke.length === 0) return null;

  // ── Schritt 1: Tabellenschrift filtern
  // TABLE_MAX_H = 8.5 pt: erfasst ZH-211.11 § 3 (h=7.98) + ZH-211.11/215.3 § 4 (h=7.50).
  // Body-Text (h≈9.18) und Absatz-Hochzahlen (h≈5.70) werden ausgeschlossen.
  // Marginalien (x≤60, h≤7.7) ausschliessen (liegen bei x≈28 im Aussenrand).
  const TABLE_MAX_H = 8.5; // Tabellenschrift bis 7.98; Body-Text 9.18
  const TABLE_MIN_H = 6.5; // Absatz-Hochzahlen h≈5.7: NICHT Tabellenspalten
  const MARG_X_MAX = 60;   // Marginalien-Stücke liegen bei x≈28

  const tabStuecke = stuecke.filter(
    (s) => s.h >= TABLE_MIN_H && s.h <= TABLE_MAX_H && s.x > MARG_X_MAX,
  );

  if (tabStuecke.length === 0) return null;

  // ── Schritt 2: Zeilen (p, y-absteigend) bilden
  const byPY = new Map<string, Array<{ x: number; s: string }>>();
  for (const s of tabStuecke) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push({ x: s.x, s: s.s });
  }

  const zeilen = [...byPY.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });

  // ── Schritt 3: Kopfzeile finden + Tabellenform erkennen
  // Erste Zeile mit «Streitwert»-Stück = Kopfzeile.
  // threshold1 = x der zweiten Kopfspalte («Grundgebühr» oder «Gebühr»).
  // threshold2 = threshold1 + 47 (Grundgebühr|Zuschlag-Grenze, empirisch).
  //
  // 3-Spalten-Form: «Grundgebühr» im Kopf → dreiSpalten = true (sicher).
  // Sonst («Gebühr» im Kopf): dreiSpalten = true, WENN in den Datenzeilen nach
  // dem Kopf tatsächlich Stücke bei x ≥ threshold2 vorhanden sind (ZH-215.3 § 4
  // hat «Gebühr» als Kopf, aber Zuschlag-Stücke bei x≈216); SONST 2-Spalten-Form
  // (ZH-211.11 § 3 hat «Gebühr» + keine Stücke rechts von threshold2≈250).
  // §1: nur x-Koordinaten, kein Ziffern-Raten; mehrdeutige Geometrie → null.
  let kopfIdx = -1;
  let threshold1 = 0;
  let dreiSpalten = false;
  for (let i = 0; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    const streitwertSt = stueckeRow.find((s) => s.s.trim() === 'Streitwert');
    if (!streitwertSt) continue;
    // «Grundgebühr» im Kopf → sicher 3-Spalten
    const grundgebuehrSt = stueckeRow.find((s) => s.s.trim() === 'Grundgebühr');
    // «Gebühr» im Kopf → erst Daten prüfen
    const gebuehrSt = stueckeRow.find((s) => s.s.trim() === 'Gebühr');
    if (grundgebuehrSt) {
      kopfIdx = i;
      threshold1 = grundgebuehrSt.x; // x von «Grundgebühr» → Grenze Streitwert|Grundgebühr
      dreiSpalten = true;
      break;
    }
    if (gebuehrSt) {
      kopfIdx = i;
      threshold1 = gebuehrSt.x; // x von «Gebühr» → vorläufige Grenze Streitwert|Gebühr
      // dreiSpalten wird nach dem Daten-Prüfschritt gesetzt (s.u.)
      break;
    }
  }

  if (kopfIdx < 0 || threshold1 === 0) return null;

  // threshold2 = Grundgebühr|Zuschlag-Grenze (empirisch: threshold1 + 47 pt).
  // Zuschlag-Stücke (ZH-215.3 § 4) starten empirisch bei x ≈ 215 (threshold1≈168+47).
  const threshold2 = threshold1 + 47;

  // Daten-Prüfschritt: Falls Kopf nur «Gebühr» (kein «Grundgebühr») → prüfen ob
  // in den Datenzeilen nach dem Kopf Stücke bei x ≥ threshold2 vorhanden (Zuschlag).
  if (!dreiSpalten) {
    for (let i = kopfIdx + 1; i < zeilen.length; i++) {
      const [, stueckeRow] = zeilen[i];
      if (stueckeRow.some((s) => s.s.includes('(in Franken)'))) continue;
      if (stueckeRow.some((s) => s.x >= threshold2)) {
        dreiSpalten = true;
        break;
      }
    }
  }

  // ── Schritt 4: Datenzeilen extrahieren
  // «(in Franken)»-Unterzeile und leere Zeilen überspringen.
  const datenZeilen: string[][] = [];
  for (let i = kopfIdx + 1; i < zeilen.length; i++) {
    const [, stueckeRow] = zeilen[i];
    if (stueckeRow.some((s) => s.s.includes('(in Franken)'))) continue;
    if (stueckeRow.length === 0) continue;

    const sorted = [...stueckeRow].sort((a, b) => a.x - b.x);

    if (dreiSpalten) {
      // 3-Spalten-Form: Streitwert | Grundgebühr | Zuschlag
      const col1: string[] = [];
      const col2: string[] = [];
      const col3: string[] = [];
      for (const st of sorted) {
        if (st.x < threshold1) {
          col1.push(st.s);
        } else if (st.x < threshold2) {
          col2.push(st.s);
        } else {
          col3.push(st.s);
        }
      }

      let c1 = col1.join(' ').replace(/\s+/g, ' ').trim();
      let c2 = col2.join(' ').replace(/\s+/g, ' ').trim();
      let c3 = col3.join(' ').replace(/\s+/g, ' ').trim();

      // Post-Prozess §1-sicher: «über 10 Mio. 106» — «106» (x knapp < threshold1)
      // fälschlich in col1 → an den Anfang von col2 verschieben (kein Ziffern-Raten,
      // nur Fragment-Verschiebung).
      const mioSplit = c1.match(/^(.*\bMio\.)\s+(\d[\d\s]*)$/);
      if (mioSplit) {
        c1 = mioSplit[1].trim();
        const wanderFragment = mioSplit[2].trim();
        c2 = c2 ? `${wanderFragment} ${c2}` : wanderFragment;
      }

      // Post-Prozess: «zuzügl.» am Ende von col2 → Anfang von col3 verschieben.
      if (c2.endsWith(' zuzügl.') || c2 === 'zuzügl.') {
        const stripped = c2.endsWith(' zuzügl.')
          ? c2.slice(0, -' zuzügl.'.length).trim()
          : '';
        c2 = stripped;
        c3 = c3 ? `zuzügl. ${c3}` : 'zuzügl.';
      } else if (c2.includes(' zuzügl.')) {
        const idx = c2.lastIndexOf(' zuzügl.');
        const stripped = c2.slice(0, idx).trim();
        const rest = c2.slice(idx + 1).trim();
        c2 = stripped;
        c3 = rest + (c3 ? ` ${c3}` : '');
      }

      if (!c1 && !c2 && !c3) continue;
      datenZeilen.push([c1, c2, c3]);
    } else {
      // 2-Spalten-Form: Streitwert | Gebühr
      const col1: string[] = [];
      const col2: string[] = [];
      for (const st of sorted) {
        if (st.x < threshold1) {
          col1.push(st.s);
        } else {
          col2.push(st.s);
        }
      }

      const c1 = col1.join(' ').replace(/\s+/g, ' ').trim();
      const c2 = col2.join(' ').replace(/\s+/g, ' ').trim();

      if (!c1 && !c2) continue;
      datenZeilen.push([c1, c2]);
    }
  }

  // Guard: ≥ 2 Datenzeilen erforderlich (§1: mehrdeutige Geometrie → null)
  if (datenZeilen.length < 2) return null;

  // ── Schritt 5: EINLEITUNGSSATZ vor der Tabelle (Befund E1, 31.8.2026)
  // Vorher setzte holeZhPdf den Blocktext dieser Absätze hart auf '' — der
  // Einleitungssatz («Bei vermögensrechtlichen Streitigkeiten beträgt die
  // Gebühr für das Schlichtungsverfahren:») verschwand mit dem Flachtext der
  // Tabelle. Er steht in BODY-Schrift (h ≥ 8.7) oberhalb der Kopfzeile und wird
  // hier aus derselben Region gelesen, ohne die Tabellenwerte zu berühren.
  const [kopfP, kopfY] = zeilen[kopfIdx][0].split('_').map(Number);
  const einleitung = leseVortext(stuecke, kopfP, kopfY);

  // Einheitenzeile «(in Franken)» gehört zum Spaltenkopf, nicht zu den Werten.
  const einheit = tabStuecke.some((s2) => s2.s.includes('(in Franken)'))
    ? ' (in Franken)'
    : '';
  const titel = dreiSpalten
    ? ['Streitwert', 'Grundgebühr', 'Zuschlag']
    : ['Streitwert', 'Gebühr'];
  return {
    kopf: titel.map((t, i) => (i < 2 ? `${t}${einheit}` : t)),
    zeilen: datenZeilen,
    einleitung,
  };
}

/**
 * Body-Text einer §-Region OBERHALB der Tabellenkopfzeile (p/y), als ein Satz
 * zusammengefügt. Rein (§2). Der §-Kopf selbst («§ 3.») wird abgeschnitten —
 * er ist Adresse, nicht Normtext.
 */
function leseVortext(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
  kopfP: number,
  kopfY: number,
): string {
  const nachZeile = new Map<string, Array<{ x: number; w: number; s: string }>>();
  for (const st of stuecke) {
    if (st.h < 8.7) continue; // nur Body-Schrift
    const y = Math.round(st.y);
    if (st.p > kopfP || (st.p === kopfP && y <= kopfY)) continue;
    const key = `${st.p}_${y}`;
    let liste = nachZeile.get(key);
    if (!liste) {
      liste = [];
      nachZeile.set(key, liste);
    }
    liste.push({ x: st.x, w: 0, s: st.s });
  }
  const sortiert = [...nachZeile.entries()].sort((a, b) => {
    const [pa, ya] = a[0].split('_').map(Number);
    const [pb, yb] = b[0].split('_').map(Number);
    return pa - pb || yb - ya;
  });
  const roh = sortiert.map(([, liste]) =>
    liste
      .sort((a, b) => a.x - b.x)
      .map((t) => t.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      // Der Silbentrennstrich am Zeilenende ist ein eigenes PDF-Fragment. In
      // der §-Region steht keine Fragmentbreite zur Verfügung, darum wird hier
      // pauschal mit Leerzeichen verbunden — der Trennstrich muss danach wieder
      // ans Wort («Grund -» → «Grund-»), sonst fügt fuegeZeilen die Silben
      // nicht zusammen («Grund - gebühr»).
      .replace(/(\p{L}) -$/u, '$1-'),
  );
  const text = fuegeZeilen(roh);
  return text.replace(/^§+\s*\d+\s*[a-z]?\s*(?:bis|ter|quater|quinquies)?\s*\.\s*/, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// x-koordinatenbasierte NotGebV-Anhang-Tarif-Extraktion (ZH-243 «Anhang: Gebührentarif»)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrahiert den gesamten ZH-NotGebV-Anhang-Gebührentarif (ZH-243, «Anhang:
 * Gebührentarif (§ 1)», PDF-Seiten 5–22) x-koordinatenbasiert aus den rohen
 * PDF-Stücken {x,y,h,s,p} der Anhang-Region (alles ab dem «Anhang»-Titel).
 *
 * Spaltenmodell (empirisch verifiziert, Geometrie-Spike 22.6.2026 — §7):
 * Der Anhang ist eine 4-Spalten-Tabelle im Spiegelrand-Buch, deren x-Lage je
 * Seitenparität wechselt (Bundsteg):
 *   - UNGERADE Seiten: Ziffer x≈54 · Beschreibung x≈82 (Unter-«–» x≈91)
 *                      · Ansatz/Fr. x≈252 · «siehe Ziff.» (Verweis) x≈289–295
 *   - GERADE Seiten:   Ziffer x≈88 · Beschreibung x≈116 (Unter-«–» x≈125)
 *                      · Ansatz/Fr. x≈286 · «siehe Ziff.» (Verweis) x≈329
 * Die Schwellen werden RELATIV zur Beschreibungsspalte (descX, linkester
 * Nicht-Ziffer-Cluster der Seite) bestimmt — robust gegen den Bundsteg:
 *   descX+170 ≈ Ansatzspalte · descX+207…213 ≈ Verweisspalte.
 *
 * §1 (Wortlaut-Treue): der Ansatz (0,75‰, «mindestens 50», Rahmen «100–1500»)
 * bleibt INLINE in Lese-Reihenfolge in der Beschreibung — bei mehrzeiligen
 * hierarchischen Einträgen (Unter-«–»-Bänder) steht so jeder Betrag direkt bei
 * seinem Tatbestand (eine flache Betrags-Spalte würde Betrag und Phrase
 * trennen → unlesbar/irreführend). Nur die Verweis-Spalte («siehe Ziff.»,
 * Querverweis-Ziffern wie «2.2.1, 2.2.2,») wird separiert und als
 * «(vgl. Ziff. …)» ans Zeilenende gestellt. Silbentrennung an Zeilengrenzen
 * («Begrün-»+«dung» → «Begründung») wird zusammengefügt (ausser vor
 * Konjunktionen wie «oder/und» = echte Hängestrich-Komposita). Kein Zeichen
 * geändert/erfunden — nur Spalten getrennt, Trennstriche gefügt (§1/§3).
 *
 * Schrift-Trennung (§1): Tarif-/Tatbestand-Stücke sind h≈9.18 (Body). Die
 * Spaltenköpfe «Ansatz/Fr.»/«Grundbuchgebühren siehe Ziff.:» (h≈8.2) und die
 * Fussnoten-Definitionen (h≈8.0) werden über h ≥ 8.7 ausgeschlossen — sie
 * dürfen NIE in eine Tarif-Zelle geraten (Bug 22.6.2026: die Köpfe klebten
 * früher als «… 50 Ansatz/Fr. Beurkundungsgebühren siehe Ziff.:» in den Text).
 *
 * Rückgabe: `{ kopf, zeilen }` — eine N-Spalten-Tabelle des GANZEN Anhangs.
 * Jede Zeile = [Ziffer, Beschreibung (mit Inline-Ansätzen), «siehe Ziff.»].
 * Die hierarchischen Ziffern (2.3.3, 2.3.5.1) bleiben als Strings in Spalte 0.
 * Guard (§1): null, wenn die Geometrie keine Ziffer-Spalte hergibt (mehrdeutig
 * → kein geratenes Resultat). `holeZhPdf` zerlegt die Zeilen anschliessend in
 * die je-Ziffer-Snapshot-Einträge (Token-adressierbar für die Zitat-Auflösung).
 *
 * §2 rein/deterministisch (kein Date.now/Math.random); §3 keine UI.
 */
export function extrahiereZhNotariatsTarif(
  stuecke: Array<{ x: number; y: number; h: number; s: string; p: number }>,
): { kopf: string[]; zeilen: string[][] } | null {
  if (stuecke.length === 0) return null;

  // Nur Body-/Tarif-Schrift (h≈9.18). Köpfe (h≈8.2) + Fussnoten (h≈8.0) raus.
  const content = stuecke.filter((s) => s.h >= 8.7);
  if (content.length === 0) return null;

  // Nach (Seite, y) zu Tabellenzeilen gruppieren, von oben nach unten lesen.
  type S = { x: number; y: number; h: number; s: string; p: number };
  const byPY = new Map<string, S[]>();
  for (const s of content) {
    const key = `${s.p}_${Math.round(s.y)}`;
    let l = byPY.get(key);
    if (!l) {
      l = [];
      byPY.set(key, l);
    }
    l.push(s);
  }
  const rows = [...byPY.entries()]
    .map(([key, ss]) => {
      const [p, y] = key.split('_').map(Number);
      return { p, y, ss: ss.sort((a, b) => a.x - b.x) };
    })
    .sort((a, b) => a.p - b.p || b.y - a.y);

  // Ziffer-Token am Zeilenanfang in der Ziffer-Spalte. Zwei Formen:
  //   - hierarchisch «N.N…» (1.1.1, 2.3.3, 5.2) — Sektion A/B + 5.x;
  //   - nackt «N» / «NN» (1, 2, …, 14) — Sektions-Gruppenköpfe (1–4: «Beurkundungs-
  //     gebühren», die Halbgebühr-Regel) UND die Sektion-C-Posten (5–14: «Auszüge»,
  //     «Schriftliche Auskunft» …). Beide tragen eigenen Tarif-Wortlaut und sind je
  //     eine Tabellenzeile — nur so endet 5.2 NICHT als Riesen-Blob, der 6–14 mit-
  //     verschluckt. Die x-Lage (Ziffer-Spalte) trennt Kopf von einer nackten
  //     Betrags-Zahl (die in der Ansatz-/Body-Spalte rechts liegt).
  // Verweis-Ziffern (2.2.1 …) matchen das Muster auch, liegen aber rechts
  // (Verweisspalte) → über die x-Schwelle (descX-3) ausgeschlossen.
  const KOPF = /^(\d+(?:\.\d+)*)\s*(.*)$/; // Token (hierarchisch ODER nackt) + Resttext
  const REF = /^\d+\.\d+[\d.,\s]*$/; // reine Verweis-Ziffernkette «2.2.1, 2.2.2,»
  const KONJ = /^(oder|und|bzw|sowie|beziehungsweise)\b/i;
  // Ein Ziffer-Kopf-Stück: «N.N…» (mit/ohne Resttext) ODER nackt «N»/«NN» (1–2
  // Stellen, kein Komma/Punkt → keine Betrags-/Verweis-Zahl).
  const istZifferKopfStueck = (s: string): boolean => {
    const t = s.trim();
    return /^\d+(?:\.\d+)+(?:\s|$)/.test(t) || /^\d{1,2}(?:\s|$)/.test(t);
  };

  // Spalten-x je Seite: tokX = linkester Ziffer-Cluster; descX = linkester
  // Nicht-Ziffer-Cluster rechts davon (Beschreibungsspalte). Relativ dazu die
  // Verweisspalte (descX+195) — der Ansatz bleibt INLINE in der Beschreibung.
  const tokX = new Map<number, number>();
  for (const r of rows) {
    const f = r.ss[0];
    if (istZifferKopfStueck(f.s)) {
      const c = tokX.get(r.p);
      if (c === undefined || f.x < c) tokX.set(r.p, f.x);
    }
  }
  const descX = new Map<number, number>();
  for (const r of rows) {
    for (const s of r.ss) {
      if (s.x > (tokX.get(r.p) ?? 0) + 12) {
        const c = descX.get(r.p);
        if (c === undefined || s.x < c) descX.set(r.p, s.x);
      }
    }
  }

  type E = { token: string; lines: Array<{ main: string; ref: string }> };
  const eintraege: E[] = [];
  let cur: E | null = null;

  // Eine Tabellenzeile in (Beschreibung+Ansatz inline | Verweis) zerlegen.
  const baueZeile = (pieces: S[], dX: number): { main: string; ref: string } => {
    const bVer = dX + 195; // Schwelle Beschreibung/Ansatz (inline) → Verweisspalte
    const main = pieces
      .filter((s) => s.x < bVer)
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const ref = pieces
      .filter((s) => s.x >= bVer && REF.test(s.s.trim()))
      .map((s) => s.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { main, ref };
  };

  for (const r of rows) {
    const dX = descX.get(r.p) ?? 82;
    const first = r.ss[0];
    const firstIstZiffer = first.x < dX - 3 && istZifferKopfStueck(first.s);
    if (firstIstZiffer) {
      const m = first.s.trim().match(KOPF)!;
      // Erster Treffer eines Tokens gewinnt (defensiv gegen Wiederholungen).
      if (eintraege.some((e) => e.token === m[1])) {
        cur = eintraege.find((e) => e.token === m[1])!;
        continue;
      }
      cur = { token: m[1], lines: [] };
      eintraege.push(cur);
      const ln = baueZeile(r.ss.slice(1), dX);
      const main = `${m[2] ? `${m[2]} ` : ''}${ln.main}`.replace(/\s+/g, ' ').trim();
      cur.lines.push({ main, ref: ln.ref });
      continue;
    }
    if (!cur) continue; // vor dem ersten Ziffer-Kopf (Abschnitts-Titel «A.») → ignorieren
    // Fortsetzungszeile: alles ab der Beschreibungsspalte (Abschnitts-Letter
    // «A./B./C.» und nackte Top-Level-Zahlen in der Ziffer-Spalte überspringen).
    const body = r.ss.filter((s) => s.x >= dX - 3);
    if (body.length === 0) continue;
    cur.lines.push(baueZeile(body, dX));
  }

  // Guard (§1): keine Ziffer-Einträge erkannt → mehrdeutige Geometrie → null.
  if (eintraege.length === 0) return null;

  // Zeilen je Eintrag zusammenfügen: Silbentrennung an Zeilengrenzen (nicht vor
  // Konjunktionen); Verweise gesammelt als «(vgl. Ziff. …)»-Suffix.
  const zeilen: string[][] = [];
  for (const e of eintraege) {
    let desc = '';
    for (const ln of e.lines) {
      const t = ln.main;
      if (!t) continue;
      if (/\p{L}-$/u.test(desc) && /^\p{Ll}/u.test(t) && !KONJ.test(t)) {
        desc = desc.slice(0, -1) + t;
      } else {
        desc = desc ? `${desc} ${t}` : t;
      }
    }
    desc = desc.replace(/\s+/g, ' ').trim();
    const refs = e.lines
      .map((l) => l.ref)
      .filter(Boolean)
      .join(' ')
      .replace(/[,\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!desc && !refs) continue;
    zeilen.push([e.token, desc, refs]);
  }

  if (zeilen.length === 0) return null;
  return { kopf: ['Ziffer', 'Beschreibung', 'siehe Ziff.'], zeilen };
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
    const text = beschreibung + (verweis ? ` (vgl. Ziff. ${verweis})` : '');
    if (!text) continue;
    // Nackte Top-Level-Posten (kein Punkt) → «anhang_N» (Kollisions-Schutz §§).
    const token = ziffer.includes('.') ? ziffer : `${ANHANG_NACKT_PREFIX}${ziffer}`;
    if (token in eintraege) continue; // erster Treffer gewinnt
    eintraege[token] = { bloecke: [{ absatz: null, text }] };
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
): Promise<Array<{ x: number; y: number; h: number; s: string; p: number }>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  type S = { x: number; y: number; h: number; s: string; p: number };
  const alle: S[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = item.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      alle.push({ x: item.transform[4], y, h, s: item.str, p });
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
): Promise<ZhErgebnis> {
  // 1. Registry-HTML.
  const regRes = await zhFetch(registryUrl);
  if (!regRes.ok) throw new Error(`ZH-Registry ${registryUrl}: HTTP ${regRes.status}`);
  const regHtml = await regRes.text();

  const attachUrl = leseAttachmentUrl(regHtml);
  if (!attachUrl) {
    throw new Error(`ZH ${registryUrl}: kein OpenAttachment-Link gefunden`);
  }

  // 2. OpenAttachment → JS-Redirect.
  const redirRes = await zhFetch(attachUrl);
  if (!redirRes.ok) throw new Error(`ZH-Attachment ${attachUrl}: HTTP ${redirRes.status}`);
  const redirHtml = await redirRes.text();
  const pdfUrl = loeseRedirect(redirHtml, attachUrl);
  if (!pdfUrl) {
    throw new Error(`ZH ${attachUrl}: kein window.location-Redirect gefunden`);
  }

  // 3. PDF-Bytes.
  const pdfRes = await zhFetch(pdfUrl);
  if (!pdfRes.ok) throw new Error(`ZH-PDF ${pdfUrl}: HTTP ${pdfRes.status}`);
  const ct = pdfRes.headers.get('content-type') ?? '';
  const bytes = new Uint8Array(await pdfRes.arrayBuffer());
  if (!ct.includes('pdf') && !(bytes[0] === 0x25 && bytes[1] === 0x50)) {
    throw new Error(`ZH-PDF ${pdfUrl}: keine PDF-Antwort (content-type ${ct})`);
  }

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
  const artikel = extrahiereAlleZhParagraphen(textbasis, marker);

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

  const quelleHash = berechneZhQuelleHash(artikel);

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
  return { meta: { titel, stand, quelleHash }, artikel, labels };
}
