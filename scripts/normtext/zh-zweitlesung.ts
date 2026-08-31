/**
 * scripts/normtext/zh-zweitlesung.ts — UNABHÄNGIGE zweite Lesung eines
 * ZH-Erlass-PDF, Messgrundlage für das Tor `check:zh-vollstaendigkeit`.
 *
 * Sie teilt mit dem Produktions-Adapter (`adapter-zh-pdf.ts`) KEINE Zeile Code
 * (§6.7 lit. d — ein Tor, das die Logik benutzt, die es absichern soll, ist
 * keins): Zeilen entstehen hier über eine grobe y-Toleranz statt exakter
 * Rundung, Fragmente werden stumpf mit Leerzeichen verkettet statt geometrisch,
 * und die Köpfe erkennt ein Muster, dem der Abstand egal ist.
 *
 * Zwei Modellentscheide teilt sie bewusst und dokumentiert:
 *   · Body-Spalte — ohne sie zählte sie Randnoten («b. Ausserhalb hängiger
 *     Verfahren») als lit.-Positionen mit.
 *   · Grenze zum Schluss­apparat — ohne sie zählte sie die zweite, bei 1 neu
 *     beginnende §-Zählung der Übergangsbestimmungen mit (ZH-700.1: 34
 *     doppelte Nummern).
 * Beide sind durch Unit-Tests am Adapter gedeckt, nicht durch dieses Tor.
 *
 * §2: rein und deterministisch bis auf den pdfjs-Aufruf (kein Netz, kein FS).
 */

// ── Zweitlesung: PDF-Textlayer → Zeilen ──────────────────────────────────────

interface Stueck {
  x: number;
  y: number;
  h: number;
  s: string;
}

/** Grobe y-Toleranz (pt): alles innerhalb davon ist EINE Zeile. Hochstellungen
 *  (2.76 pt über der Grundlinie) fallen damit in ihre Zeile, ohne dass das Tor
 *  etwas über Hochstellungen wissen müsste. Der Zeilenabstand ist ≈10.2 pt. */
const ZEILE_TOLERANZ = 4;

/** Obergrenze der Fussnoten-Ziffer. NICHT als alleiniges Merkmal brauchbar:
 *  die Klassen berühren sich (Fussnoten-Ziffern 4.32/4.62/4.92, aber ZH-211.1
 *  S. 24 setzt eine echte Absatzzahl mit 5.04). Massgeblich ist zusätzlich die
 *  Grundschrift der Trägerzeile (Fussnote ≈ 7.98 gegen Body ≈ 9.18). */
const APPARAT_H = 5.2;
/** Grösste Grundschrift, die noch Fussnoten-/Kleinsatz ist. */
const KLEINSATZ_H = 8.5;

const KOPF_PARAGRAF =
  /^§\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?\s*\./;
const KOPF_ARTIKEL =
  /^Art\.\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?(?=\s|$)/;
const LIT_ZEILE = /^[a-z]\.\s/;
const SCHLUSSAPPARAT = /^(?:Übergangs|Schluss)bestimmung(?:en)?\b/;
const ANHANG_TITEL = /^Anhang(?:\s*\d*)?(?::|$)/;

export interface Zweitlesung {
  /** Kopf-Token in Reihenfolge des Auftretens, dedupliziert. */
  koepfe: string[];
  /** Zahl der Zeilen, die mit einer lit.-Marke beginnen. */
  litZeilen: number;
  /** Zahl der hochgestellten reinen Ziffern links vom Zeilentext. */
  absatzKandidaten: number;
}

function token(m: RegExpMatchArray): string {
  return [m[1], m[2], m[3]].filter(Boolean).map((t) => t.toLowerCase()).join('_');
}

/**
 * Zweitlesung eines ZH-PDF (exportiert, damit sie gegen echte Bytes getestet
 * werden kann, ohne den Netzpfad zu fahren).
 */
export async function leseZweit(bytes: Uint8Array): Promise<Zweitlesung> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;

  const parKoepfe: string[] = [];
  const artKoepfe: string[] = [];
  let litZeilen = 0;
  let absatzKandidaten = 0;
  let imSchluss = false;

  for (let p = 1; p <= doc.numPages && !imSchluss; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    const roh: Stueck[] = [];
    for (const it of inhalt.items) {
      const item = it as { str: string; transform: number[]; height?: number };
      if (!item.str || !item.str.replace(/\s/g, '')) continue;
      const y = item.transform[5];
      const h = item.height ?? 9;
      if (y < 60 || y > 530 || h >= 11) continue;
      roh.push({ x: item.transform[4], y, h, s: item.str });
    }
    const bodyX = roh.filter((s) => s.h >= 8.7).map((s) => s.x);
    if (bodyX.length === 0) continue;
    const links = Math.min(...bodyX);
    // Body-Spalte: die Randnoten liegen im Aussenrand, links davon oder weit
    // rechts. Ohne diesen Schnitt zählte das Tor Randnoten wie «b. Ausserhalb
    // hängiger Verfahren» als lit.-Positionen mit.
    const spalte = roh.filter((s) => s.x >= links - 6 && s.x <= links + 260);
    // Zeilen bilden: y-Cluster mit Toleranz, absteigend. Die Hochstellung fällt
    // dabei in ihre Trägerzeile, ohne dass dieses Modul etwas über
    // Hochstellungen wissen müsste.
    const sortiert = [...spalte].sort((a, b) => b.y - a.y);
    const alleZeilen: Stueck[][] = [];
    for (const st of sortiert) {
      const letzte = alleZeilen[alleZeilen.length - 1];
      if (letzte && letzte[0].y - st.y <= ZEILE_TOLERANZ) letzte.push(st);
      else alleZeilen.push([st]);
    }

    // Fussnoten-Apparat am Seitenfuss abschneiden: erste Zeile, die mit einer
    // kleinen Hochzahl beginnt UND deren übriger Satz Kleinsatz ist. Die
    // Ziffernhöhe allein trägt nicht — sie überschneidet sich mit echten
    // Absatzzahlen (ZH-211.1 S. 24: Absatzzahl h = 5.04).
    let apparatAb = alleZeilen.length;
    for (let i = 0; i < alleZeilen.length; i++) {
      const zeile = [...alleZeilen[i]].sort((a, b) => a.x - b.x);
      const hoch = zeile.filter((s) => s.h <= APPARAT_H);
      if (hoch.length === 0 || hoch[0] !== zeile[0]) continue;
      const rest = zeile.filter((s) => s.h > APPARAT_H);
      if (rest.length > 0 && rest.every((s) => s.h <= KLEINSATZ_H)) {
        apparatAb = i;
        break;
      }
    }
    const zeilen = alleZeilen.slice(0, apparatAb);

    for (const zeile of zeilen) {
      zeile.sort((a, b) => a.x - b.x);
      const body = zeile.filter((s) => s.h >= 8.7);
      if (body.length === 0) continue; // Tabellen-/Kleinsatz-Zeile
      const text = zeile.map((s) => s.s).join(' ').replace(/\s+/g, ' ').trim();
      if (SCHLUSSAPPARAT.test(text) || ANHANG_TITEL.test(text)) {
        imSchluss = true;
        break;
      }
      // Beide Zählweisen sammeln und erst am Ende entscheiden (s. unten) —
      // ein «§»-Erlass enthält umbrochene Zeilen, die mit «Art. 957 Abs. 2
      // ZGB» beginnen, und ein «Art.»-Erlass umgekehrt.
      const par = text.match(KOPF_PARAGRAF);
      if (par) {
        parKoepfe.push(token(par));
        continue;
      }
      const art = text.match(KOPF_ARTIKEL);
      if (art) {
        artKoepfe.push(token(art));
        continue;
      }
      if (LIT_ZEILE.test(text)) litZeilen++;
      const ersteBodyX = body[0].x;
      absatzKandidaten += zeile.filter(
        (s) => s.h < 7 && s.h > APPARAT_H && /^\d+$/.test(s.s.trim()) && s.x < ersteBodyX,
      ).length;
    }
  }
  // Zählweise je Erlass: die Marke mit den mehr Treffern gewinnt. Bei
  // Gleichstand (auch 0:0) der Regelfall «§».
  const roh = artKoepfe.length > parKoepfe.length ? artKoepfe : parKoepfe;
  const gesehen = new Set<string>();
  const koepfe: string[] = [];
  for (const t of roh) {
    if (gesehen.has(t)) continue;
    gesehen.add(t);
    koepfe.push(t);
  }
  return { koepfe, litZeilen, absatzKandidaten };
}

