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

/**
 * §§-SAMMELZEILE (Härtung nach Befund B-4, Gegenprüfung Runde 2, 31.8.2026).
 *
 * `KOPF_PARAGRAF` verlangt ein einzelnes «§» und sah die Sammel-Aufhebungsköpfe
 * darum nie — genau die blinde Stelle, die der Produktions-Adapter hatte. Die
 * Mengengleichheit (Prüfung 1) war deshalb TRÜGERISCH grün: was beide Seiten
 * nicht lesen, fehlt beiden Seiten gleich.
 *
 * Bewusst NUR die Textgestalt, ohne den Kopf-Einzug, den der Adapter benutzt
 * (§6.7 lit. d — sonst wäre die Prüfung ein Spiegel des Geprüften). Die
 * Zeile muss mit «§§» beginnen, eine reine Nennungsliste tragen und mit dem
 * Punkt ENDEN; damit fallen Querverweise im Satz («… nach §§ 88–90. Davon
 * ausgenommen …», «§§ 156–159 GG,») heraus, ohne Geometrie zu bemühen. Der
 * verbleibende Unterschied zum Adapter (ZH-331 § 17 «Vorbehalten bleiben
 * §§ 23–23 b und 35 b.») ist harmlos: das Tor verlangt nur, dass die genannten
 * §§ im Snapshot VORKOMMEN — dort stehen sie als echte Artikel.
 */
const SAMMEL_ZEILE_ZWEIT =
  /^§§\s*\d+\s*[a-z]?\s*(?:bis|ter|quater|quinquies)?(?:\s*[–—−-]\s*|\s*,\s*|\s+und\s+)[\d\sa-z–—−,.]*\.$/;

/** Hochgestellte Absatznummer — inkl. lat. Suffix (Befund B-1: das alte Muster
 *  /^\d+$/ kannte ihn nicht, also konnte das Tor den Verlust nicht sehen). */
const ABSATZ_HOCHZAHL_ZWEIT = /^\d+(?:bis|ter|quater|quinquies)?$/;

/** Gliederungs-Überschrift der zählenden Form (Befund B-3). Unabhängig vom
 *  Adapter formuliert: hier reicht das Vorkommen IRGENDWO im Snapshot-Text als
 *  Verdacht, dort entscheidet der Zeilenanfang. */
export const GLIEDERUNG_IM_TEXT =
  /(?:^|\s)(?:\d+|[IVXLC]+|(?:Ers|Zwei|Drit|Vier|Fünf|Sechs|Sieb|Sieben|Ach|Neun|Zehn|Elf|Zwölf)ter)\.?\s+(?:Kapitel|Abschnitt|Unterabschnitt|Teil|Titel|Abteilung):/;

export interface Zweitlesung {
  /** Kopf-Token in Reihenfolge des Auftretens, dedupliziert. */
  koepfe: string[];
  /** Zahl der Zeilen, die mit einer lit.-Marke beginnen. */
  litZeilen: number;
  /** Zahl der hochgestellten reinen Ziffern links vom Zeilentext. */
  absatzKandidaten: number;
  /** §-Tokens, die eine §§-Sammelzeile nennt (Bereiche aus reinen Zahlen
   *  ausgezählt, gemischte Grenzen nur mit ihren Endpunkten). */
  sammelTokens: string[];
  /** Zahlen-SPANNEN der genannten Bereiche («§§ 74–80 d.» → {von:74,bis:80}).
   *  Das Tor akzeptiert jeden Snapshot-Eintrag, dessen Nummer darin liegt: die
   *  Zweitlesung zählt bewusst konservativ aus (sie rät keine Zwischenstufen),
   *  der Adapter darf mehr auffüllen — nur NICHTS ausserhalb. */
  sammelSpannen: Array<{ von: number; bis: number }>;
  /** Absatz-Hochzahlen MIT lat. Suffix, je §-Token («7» → ['1bis','1ter']). */
  suffixAbsaetze: Record<string, string[]>;
  /** Alle Ziffernfolgen des ganzen Dokuments (Werte-Wächter, Prüfung 7).
   *  Bewusst OHNE Schlussapparat-/Fussnoten-Schnitt: das ist die Obermenge,
   *  gegen die der Snapshot ⊆ sein muss. */
  zahlen: Set<string>;
}

function token(m: RegExpMatchArray): string {
  return [m[1], m[2], m[3]].filter(Boolean).map((t) => t.toLowerCase()).join('_');
}

/**
 * §§ einer Sammelzeile auszählen — UNABHÄNGIG von `expandiereSammelbereich`
 * nachgebaut (§6.7 lit. d) und bewusst konservativer: nur reine Zahlenspannen
 * werden aufgefüllt, jede andere Grenze zählt nur mit sich selbst. Das Tor
 * verlangt damit nie mehr, als der Kopf ohne Raten hergibt.
 */
export function sammelTokensAus(zeile: string): {
  tokens: string[];
  spannen: Array<{ von: number; bis: number }>;
} {
  const liste = zeile.replace(/^§§\s*/, '').replace(/\s*\.$/, '');
  const raus: string[] = [];
  const spannen: Array<{ von: number; bis: number }> = [];
  const nimm = (t: string): void => {
    if (t && !raus.includes(t)) raus.push(t);
  };
  const lies = (roh: string): { zahl: number; rest: string } | null => {
    const m = roh.trim().match(/^(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?$/);
    if (!m) return null;
    return {
      zahl: Number(m[1]),
      rest: [m[1], m[2], m[3]].filter(Boolean).join('_'),
    };
  };
  for (const teil of liste.split(/\s*,\s*|\s+und\s+/)) {
    const grenzen = teil.trim().split(/\s*[–—−-]\s*/);
    if (grenzen.length === 1) {
      const g = lies(grenzen[0]);
      if (g) nimm(g.rest);
      continue;
    }
    const von = lies(grenzen[0]);
    const bis = lies(grenzen[grenzen.length - 1]);
    if (!von || !bis) continue;
    nimm(von.rest);
    nimm(bis.rest);
    if (bis.zahl >= von.zahl && bis.zahl - von.zahl <= 100) {
      spannen.push({ von: von.zahl, bis: bis.zahl });
    }
    const reinZahlig = von.rest === String(von.zahl) && bis.rest === String(bis.zahl);
    if (reinZahlig && bis.zahl > von.zahl && bis.zahl - von.zahl <= 100) {
      for (let n = von.zahl; n <= bis.zahl; n++) nimm(String(n));
    }
  }
  return { tokens: raus, spannen };
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
  const sammelTokens: string[] = [];
  const sammelSpannen: Array<{ von: number; bis: number }> = [];
  const suffixAbsaetze: Record<string, string[]> = {};
  const zahlen = new Set<string>();
  // Laufender Kopf, um Suffix-Absaetze ihrem § zuzuordnen.
  let laufenderKopf: string | null = null;

  // Werte-Waechter (Pruefung 7): ALLE Ziffernfolgen des Dokuments, ohne jeden
  // Schnitt — die Obermenge, gegen die der Snapshot Teilmenge sein muss.
  for (let p = 1; p <= doc.numPages; p++) {
    const inhalt = await (await doc.getPage(p)).getTextContent();
    for (const it of inhalt.items) {
      const item = it as { str: string };
      if (!item.str) continue;
      for (const z of item.str.match(/\d+/g) ?? []) zahlen.add(z);
    }
  }

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
      // §§-Sammelzeile (Härtung B-4): die §§, die sie nennt, MÜSSEN im
      // Snapshot vorkommen — als Platzhalter oder als echter Artikel.
      // Die amtliche Fussnoten-Ziffer hängt hinter dem Schlusspunkt in derselben
      // y-Zeile («§§ 45–47. 51») und wird davor abgestreift; ohne das griffe die
      // Gestalt-Prüfung bei keinem Kopf mit Änderungs-Fussnote.
      const ohneFussnote = text.replace(/\s*\d+(?:\s*,\s*\d+)*$/, '');
      if (SAMMEL_ZEILE_ZWEIT.test(ohneFussnote)) {
        const aus = sammelTokensAus(ohneFussnote);
        for (const t of aus.tokens) {
          if (!sammelTokens.includes(t)) sammelTokens.push(t);
        }
        sammelSpannen.push(...aus.spannen);
        continue;
      }
      // Beide Zählweisen sammeln und erst am Ende entscheiden (s. unten) —
      // ein «§»-Erlass enthält umbrochene Zeilen, die mit «Art. 957 Abs. 2
      // ZGB» beginnen, und ein «Art.»-Erlass umgekehrt.
      const par = text.match(KOPF_PARAGRAF);
      if (par) {
        parKoepfe.push(token(par));
        laufenderKopf = token(par);
        continue;
      }
      const art = text.match(KOPF_ARTIKEL);
      if (art) {
        artKoepfe.push(token(art));
        laufenderKopf = token(art);
        continue;
      }
      if (LIT_ZEILE.test(text)) litZeilen++;
      const ersteBodyX = body[0].x;
      const hochzahlen = zeile.filter(
        (s) =>
          s.h < 7 &&
          s.h > APPARAT_H &&
          ABSATZ_HOCHZAHL_ZWEIT.test(s.s.trim()) &&
          s.x < ersteBodyX,
      );
      absatzKandidaten += hochzahlen.length;
      // Suffix-Absätze je § festhalten (Härtung B-4 lit. b): sie waren dem Tor
      // bisher unsichtbar, weil das Muster nur nackte Ziffern kannte.
      if (laufenderKopf !== null) {
        for (const s of hochzahlen) {
          const nr = s.s.trim();
          if (/^\d+$/.test(nr)) continue;
          const liste = (suffixAbsaetze[laufenderKopf] ??= []);
          if (!liste.includes(nr)) liste.push(nr);
        }
      }
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
  return { koepfe, litZeilen, absatzKandidaten, sammelTokens, sammelSpannen, suffixAbsaetze, zahlen };
}

