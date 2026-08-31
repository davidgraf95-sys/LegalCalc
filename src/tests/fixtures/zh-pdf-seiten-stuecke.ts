/**
 * Echte pdfjs-Roh-Stücke ZWEIER ZH-PDF-Seiten (Koordinaten unverändert,
 * abgerufen 31.8.2026) — Prüfmaterial für die Geometrie-Entscheide in
 * `montiereZhSeite()`.
 *
 * Bereits angewandt wie im Adapter: Kopf-/Fussband (y ausserhalb 60…530) und
 * Erlasstitel (h ≥ 11) sind entfernt; sonst nichts verändert.
 *
 * ZH_212812_SEITE2 — Gebührenverordnung SVGer (LS 212.812), Seite 2.
 *   Trägt die drei am Bestand belegten Fehlerbilder:
 *   · Fussnoten-Verweis «³» am Zeilenende (x 330.48, y 500.66) über der Zeile
 *     y 497.90 — wurde als Absatznummer gelesen und riss § 4 Abs. 2 im Wort
 *     «Entschädigungsver-|ordnung» auf (B-2).
 *   · Zwei Fussnoten-Verweise «⁴»/«⁶» (y 468.08) über der Zeile y 465.32.
 *   · Echte Absatz-Hochzahlen bei x 102.06 (linksbündig vor dem Text) und
 *     x 124.98 (zwischen «§ 5.» und dem Text) — sie müssen bleiben.
 *   · Marginalien im Aussenrand (x 28.32, h 7.50).
 *
 * ZH_1752_SEITE1 — Verwaltungsrechtspflegegesetz (LS 175.2), Seite 1.
 *   Trägt die Falle, die in der Fix-Runde selbst erzeugt wurde: die Randnoten
 *   «Grundsatz⁵²» (x 371.46, y 442.58, h 4.62) und «Prüfung der
 *   Zuständigkeit³⁴» (x 382.68, y 129.86, h 4.62) tragen Fussnoten-Ziffern in
 *   Apparat-Schriftgrösse MITTEN auf der Seite. Wird die Apparat-Kante vor dem
 *   Marginalien-Filter bestimmt, kappt sie den halben Erlass.
 *   Ausserdem: «§ 4 a.» als drei Fragmente («§» | «4» | «a.») — die Zürcher
 *   Sammlung setzt den Buchstaben-Suffix mit Abstand (am Druckbild verifiziert).
 */
export interface ZhStueckFixture {
  x: number;
  y: number;
  h: number;
  w: number;
  s: string;
}

export const ZH_212812_SEITE2: ZhStueckFixture[] = [
  {
    "x": 102.06,
    "y": 521.06,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 107.16,
    "y": 518.3,
    "h": 9.18,
    "w": 255.58,
    "s": "Die Entschädigung von Zeuginnen und Zeugen, Auskunftsperso"
  },
  {
    "x": 362.64,
    "y": 518.3,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 508.1,
    "h": 9.18,
    "w": 274.67,
    "s": "nen und Sachverständigen richtet sich nach der Entschädigungsver"
  },
  {
    "x": 362.52,
    "y": 508.1,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 497.9,
    "h": 9.18,
    "w": 242.59,
    "s": "ordnung der obersten kantonalen Gerichte vom 11. Juni 2002"
  },
  {
    "x": 330.48,
    "y": 500.66,
    "h": 5.7,
    "w": 2.85,
    "s": "3"
  },
  {
    "x": 333.3,
    "y": 497.9,
    "h": 9.18,
    "w": 2.29,
    "s": "."
  },
  {
    "x": 102.06,
    "y": 488.48,
    "h": 5.7,
    "w": 2.85,
    "s": "3"
  },
  {
    "x": 107.16,
    "y": 485.72,
    "h": 9.18,
    "w": 258.39,
    "s": "Die Entschädigung der Übersetzerinnen und Übersetzer richtet"
  },
  {
    "x": 87.84,
    "y": 475.52,
    "h": 9.18,
    "w": 278.01,
    "s": "sich nach der Sprachdienstleistungsverordnung vom 19. Dezember 2018 /"
  },
  {
    "x": 87.84,
    "y": 465.32,
    "h": 9.18,
    "w": 55.85,
    "s": "7. Januar 2019"
  },
  {
    "x": 143.64,
    "y": 468.08,
    "h": 5.7,
    "w": 2.85,
    "s": "4"
  },
  {
    "x": 146.52,
    "y": 465.32,
    "h": 9.18,
    "w": 2.29,
    "s": "."
  },
  {
    "x": 148.8,
    "y": 468.08,
    "h": 5.7,
    "w": 2.85,
    "s": "6"
  },
  {
    "x": 28.32,
    "y": 448.22,
    "h": 7.5,
    "w": 45.03,
    "s": "b. Ausserhalb"
  },
  {
    "x": 28.32,
    "y": 440.24,
    "h": 7.5,
    "w": 28.36,
    "s": "hängiger"
  },
  {
    "x": 28.32,
    "y": 432.2,
    "h": 7.5,
    "w": 33.75,
    "s": "Verfahren"
  },
  {
    "x": 102.06,
    "y": 448.22,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 108.9,
    "y": 448.22,
    "h": 9.18,
    "w": 6.92,
    "s": "5."
  },
  {
    "x": 124.98,
    "y": 450.98,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 130.14,
    "y": 448.22,
    "h": 9.18,
    "w": 235.69,
    "s": "Die Gebühr für die Zustellung einer Kopie eines Entscheids"
  },
  {
    "x": 87.84,
    "y": 438.02,
    "h": 9.18,
    "w": 107.44,
    "s": "beträgt in der Regel Fr. 30."
  },
  {
    "x": 102.06,
    "y": 428.6,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 107.16,
    "y": 425.84,
    "h": 9.18,
    "w": 258.48,
    "s": "Bescheinigungen, die durch Stempel auf der Ausfertigung eines"
  },
  {
    "x": 87.84,
    "y": 415.64,
    "h": 9.18,
    "w": 277.82,
    "s": "Entscheids angebracht oder im Formular einer Amtsstelle eingesetzt"
  },
  {
    "x": 87.84,
    "y": 405.44,
    "h": 9.18,
    "w": 238.71,
    "s": "werden können, sind einschliesslich Zustellungen kostenlos."
  },
  {
    "x": 102.06,
    "y": 395.96,
    "h": 5.7,
    "w": 2.85,
    "s": "3"
  },
  {
    "x": 107.16,
    "y": 393.2,
    "h": 9.18,
    "w": 255.52,
    "s": "Für andere Tätigkeiten des Gerichts ausserhalb hängiger Verfah"
  },
  {
    "x": 362.64,
    "y": 393.2,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 383.0,
    "h": 9.18,
    "w": 248.59,
    "s": "ren kann es die ihm entstandenen Kosten in Rechnung stellen."
  },
  {
    "x": 28.32,
    "y": 365.96,
    "h": 7.5,
    "w": 19.61,
    "s": "Partei"
  },
  {
    "x": 47.88,
    "y": 365.96,
    "h": 7.5,
    "w": 2.5,
    "s": "-"
  },
  {
    "x": 28.32,
    "y": 357.98,
    "h": 7.5,
    "w": 46.65,
    "s": "entschädigung"
  },
  {
    "x": 102.06,
    "y": 365.96,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 108.9,
    "y": 365.96,
    "h": 9.18,
    "w": 6.92,
    "s": "6."
  },
  {
    "x": 124.98,
    "y": 368.72,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 130.14,
    "y": 365.96,
    "h": 9.18,
    "w": 235.66,
    "s": "Eine Entschädigung kann auch zugesprochen werden, wenn"
  },
  {
    "x": 87.84,
    "y": 355.76,
    "h": 9.18,
    "w": 277.9,
    "s": "die beschwerdeführende Partei die Beschwerde zurückzieht oder wenn"
  },
  {
    "x": 87.84,
    "y": 345.56,
    "h": 9.18,
    "w": 277.83,
    "s": "der Versicherungsträger den angefochtenen Entscheid zugunsten der"
  },
  {
    "x": 87.84,
    "y": 335.36,
    "h": 9.18,
    "w": 278.02,
    "s": "beschwerdeführenden Partei in Wiedererwägung zieht oder sich mit ihr"
  },
  {
    "x": 87.84,
    "y": 325.16,
    "h": 9.18,
    "w": 41.58,
    "s": "vergleicht."
  },
  {
    "x": 102.06,
    "y": 315.74,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 107.16,
    "y": 312.98,
    "h": 9.18,
    "w": 258.65,
    "s": "Eine Entschädigung kann verweigert werden, wenn die obsiegende"
  },
  {
    "x": 87.84,
    "y": 302.78,
    "h": 9.18,
    "w": 201.37,
    "s": "Partei den Prozess schuldhaft selbst veranlasst hat."
  },
  {
    "x": 102.06,
    "y": 293.3,
    "h": 5.7,
    "w": 2.85,
    "s": "3"
  },
  {
    "x": 107.16,
    "y": 290.54,
    "h": 9.18,
    "w": 258.53,
    "s": "Die obsiegende Partei kann zur Zahlung einer Entschädigung an"
  },
  {
    "x": 87.84,
    "y": 280.34,
    "h": 9.18,
    "w": 277.73,
    "s": "die unterliegende Partei verpflichtet werden, wenn sich diese wegen"
  },
  {
    "x": 87.84,
    "y": 270.14,
    "h": 9.18,
    "w": 274.94,
    "s": "rechtswidrigen Verhaltens der obsiegenden zur Prozessführung veran"
  },
  {
    "x": 362.7,
    "y": 270.14,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 259.94,
    "h": 9.18,
    "w": 35.21,
    "s": "lasst sah."
  },
  {
    "x": 28.32,
    "y": 242.9,
    "h": 7.5,
    "w": 44.97,
    "s": "b. Bemessung"
  },
  {
    "x": 102.06,
    "y": 242.9,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 108.9,
    "y": 242.9,
    "h": 9.18,
    "w": 6.92,
    "s": "7."
  },
  {
    "x": 124.98,
    "y": 245.66,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 130.14,
    "y": 242.9,
    "h": 9.18,
    "w": 235.64,
    "s": "Für unnötigen oder geringfügigen Aufwand einer Partei wird"
  },
  {
    "x": 87.84,
    "y": 232.7,
    "h": 9.18,
    "w": 164.6,
    "s": "keine Parteientschädigung zugesprochen."
  },
  {
    "x": 102.06,
    "y": 223.22,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 107.16,
    "y": 220.46,
    "h": 9.18,
    "w": 258.58,
    "s": "Wird eine Parteientschädigung beansprucht, reicht die Partei dem"
  },
  {
    "x": 87.84,
    "y": 210.26,
    "h": 9.18,
    "w": 278.05,
    "s": "Gericht vor dem Endentscheid eine detaillierte Zusammenstellung über"
  },
  {
    "x": 87.84,
    "y": 200.06,
    "h": 9.18,
    "w": 277.97,
    "s": "ihren Zeitaufwand und ihre Barauslagen ein. Im Unterlassungsfall setzt"
  },
  {
    "x": 87.84,
    "y": 189.86,
    "h": 9.18,
    "w": 203.75,
    "s": "das Gericht die Entschädigung nach Ermessen fest."
  },
  {
    "x": 28.32,
    "y": 172.82,
    "h": 7.5,
    "w": 48.33,
    "s": "Unentgeltliche"
  },
  {
    "x": 28.32,
    "y": 164.84,
    "h": 7.5,
    "w": 22.48,
    "s": "Rechts"
  },
  {
    "x": 50.82,
    "y": 164.84,
    "h": 7.5,
    "w": 2.5,
    "s": "-"
  },
  {
    "x": 28.32,
    "y": 156.8,
    "h": 7.5,
    "w": 34.17,
    "s": "vertretung"
  },
  {
    "x": 102.06,
    "y": 172.82,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 108.9,
    "y": 172.82,
    "h": 9.18,
    "w": 6.92,
    "s": "8."
  },
  {
    "x": 124.98,
    "y": 172.82,
    "h": 9.18,
    "w": 237.99,
    "s": "Die Entschädigung der unentgeltlichen Rechtsvertretung rich"
  },
  {
    "x": 362.76,
    "y": 172.82,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 162.62,
    "h": 9.18,
    "w": 56.5,
    "s": "tet sich nach §"
  },
  {
    "x": 146.58,
    "y": 162.62,
    "h": 9.18,
    "w": 6.85,
    "s": "7."
  },
  {
    "x": 28.32,
    "y": 140.3,
    "h": 7.5,
    "w": 42.51,
    "s": "Kostenbezug"
  },
  {
    "x": 102.06,
    "y": 140.3,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 108.9,
    "y": 140.3,
    "h": 9.18,
    "w": 6.92,
    "s": "9."
  },
  {
    "x": 124.98,
    "y": 143.06,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 130.14,
    "y": 140.3,
    "h": 9.18,
    "w": 232.44,
    "s": "Die Gerichtskasse bezieht die Gebühren, Kosten und Ord"
  },
  {
    "x": 362.64,
    "y": 140.3,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 130.1,
    "h": 9.18,
    "w": 115.38,
    "s": "nungsbussen für das Gericht."
  },
  {
    "x": 102.06,
    "y": 120.68,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 107.16,
    "y": 117.92,
    "h": 9.18,
    "w": 255.46,
    "s": "Sie kann diese Aufgabe der Gerichtskasse des Obergerichts über"
  },
  {
    "x": 362.64,
    "y": 117.92,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 87.84,
    "y": 107.72,
    "h": 9.18,
    "w": 27.85,
    "s": "tragen."
  },
  {
    "x": 28.32,
    "y": 347.6,
    "h": 7.5,
    "w": 39.56,
    "s": "a. Anspruch"
  }
];

export const ZH_1752_SEITE1: ZhStueckFixture[] = [
  {
    "x": 256.08,
    "y": 520.04,
    "h": 7.44,
    "w": 7.44,
    "s": "42"
  },
  {
    "x": 53.82,
    "y": 499.82,
    "h": 9.18,
    "w": 77.03,
    "s": "(vom 24. Mai 1959)"
  },
  {
    "x": 130.92,
    "y": 502.58,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 53.82,
    "y": 469.58,
    "h": 9.18,
    "w": 250.91,
    "s": "Erster Abschnitt: Die sachliche Zuständigkeit der Verwaltungs"
  },
  {
    "x": 304.74,
    "y": 469.58,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 459.38,
    "h": 9.18,
    "w": 38.34,
    "s": "behörden"
  },
  {
    "x": 337.32,
    "y": 440.3,
    "h": 7.5,
    "w": 34.11,
    "s": "Grundsatz"
  },
  {
    "x": 371.46,
    "y": 442.58,
    "h": 4.62,
    "w": 4.65,
    "s": "52"
  },
  {
    "x": 68.04,
    "y": 440.3,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 440.3,
    "h": 9.18,
    "w": 6.92,
    "s": "1."
  },
  {
    "x": 90.96,
    "y": 440.3,
    "h": 9.18,
    "w": 237.62,
    "s": "Öffentlichrechtliche Angelegenheiten werden von den Ver"
  },
  {
    "x": 328.62,
    "y": 440.3,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 430.1,
    "h": 9.18,
    "w": 274.54,
    "s": "waltungsbehörden und vom Verwaltungsgericht entschieden. Privat"
  },
  {
    "x": 328.5,
    "y": 430.1,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 419.9,
    "h": 9.18,
    "w": 274.43,
    "s": "rechtliche Ansprüche sind vor den Zivilgerichten geltend zu machen."
  },
  {
    "x": 337.32,
    "y": 402.86,
    "h": 7.5,
    "w": 35.43,
    "s": "Ausnahme"
  },
  {
    "x": 68.04,
    "y": 402.86,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 402.86,
    "h": 9.18,
    "w": 6.92,
    "s": "2."
  },
  {
    "x": 90.96,
    "y": 405.62,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 96.12,
    "y": 402.86,
    "h": 9.18,
    "w": 235.65,
    "s": "Über Schadenersatzansprüche von Privaten gegen Staat und"
  },
  {
    "x": 53.82,
    "y": 392.66,
    "h": 9.18,
    "w": 277.88,
    "s": "Gemeinde sowie gegen deren Beamte und Angestellte entscheiden die"
  },
  {
    "x": 53.82,
    "y": 382.46,
    "h": 9.18,
    "w": 53.34,
    "s": "Zivilgerichte."
  },
  {
    "x": 68.04,
    "y": 373.04,
    "h": 5.7,
    "w": 2.85,
    "s": "2"
  },
  {
    "x": 73.14,
    "y": 370.28,
    "h": 9.18,
    "w": 258.54,
    "s": "Sie entscheiden auch über die Schadenersatzansprüche Privater"
  },
  {
    "x": 53.82,
    "y": 360.08,
    "h": 9.18,
    "w": 277.74,
    "s": "gegen die Inhaber behördlicher Konzessionen, Bewilligungen oder"
  },
  {
    "x": 53.82,
    "y": 349.88,
    "h": 9.18,
    "w": 32.96,
    "s": "Patente."
  },
  {
    "x": 337.32,
    "y": 332.78,
    "h": 7.5,
    "w": 33.34,
    "s": "Vorbehalt"
  },
  {
    "x": 337.32,
    "y": 324.8,
    "h": 7.5,
    "w": 36.64,
    "s": "besonderer"
  },
  {
    "x": 337.32,
    "y": 316.76,
    "h": 7.5,
    "w": 38.32,
    "s": "gesetzlicher"
  },
  {
    "x": 337.32,
    "y": 308.78,
    "h": 7.5,
    "w": 49.1,
    "s": "Bestimmungen"
  },
  {
    "x": 68.04,
    "y": 332.78,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 332.78,
    "h": 9.18,
    "w": 6.92,
    "s": "3."
  },
  {
    "x": 90.96,
    "y": 332.78,
    "h": 9.18,
    "w": 237.6,
    "s": "Besondere gesetzliche Bestimmungen, welche die Zuständig"
  },
  {
    "x": 328.62,
    "y": 332.78,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 322.58,
    "h": 9.18,
    "w": 161.87,
    "s": "keit anders ordnen, bleiben vorbehalten."
  },
  {
    "x": 53.82,
    "y": 284.18,
    "h": 9.18,
    "w": 185.24,
    "s": "Zweiter Abschnitt: Das Verwaltungsverfahren"
  },
  {
    "x": 53.82,
    "y": 263.96,
    "h": 9.18,
    "w": 78.11,
    "s": "A. Geltungsbereich"
  },
  {
    "x": 337.32,
    "y": 244.94,
    "h": 7.5,
    "w": 53.71,
    "s": "Geltungsbereich"
  },
  {
    "x": 68.04,
    "y": 244.94,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 244.94,
    "h": 9.18,
    "w": 6.92,
    "s": "4."
  },
  {
    "x": 81.78,
    "y": 247.7,
    "h": 5.7,
    "w": 5.73,
    "s": "34"
  },
  {
    "x": 96.66,
    "y": 244.94,
    "h": 9.18,
    "w": 231.98,
    "s": "Die Bestimmungen dieses Abschnittes gelten für das Ver"
  },
  {
    "x": 328.62,
    "y": 244.94,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 234.74,
    "h": 9.18,
    "w": 277.92,
    "s": "fahren vor den Verwaltungsbehörden der Gemeinden, der Bezirke und"
  },
  {
    "x": 53.82,
    "y": 224.54,
    "h": 9.18,
    "w": 249.12,
    "s": "des Kantons, soweit nicht abweichende Vorschriften bestehen."
  },
  {
    "x": 53.82,
    "y": 192.14,
    "h": 9.18,
    "w": 110.49,
    "s": "B. Allgemeine Vorschriften"
  },
  {
    "x": 337.32,
    "y": 173.06,
    "h": 7.5,
    "w": 35.8,
    "s": "Beschleuni"
  },
  {
    "x": 373.14,
    "y": 173.06,
    "h": 7.5,
    "w": 2.5,
    "s": "-"
  },
  {
    "x": 337.32,
    "y": 165.02,
    "h": 7.5,
    "w": 37.06,
    "s": "gungsgebot"
  },
  {
    "x": 68.04,
    "y": 173.06,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 173.06,
    "h": 9.18,
    "w": 4.59,
    "s": "4"
  },
  {
    "x": 80.88,
    "y": 173.06,
    "h": 9.18,
    "w": 6.92,
    "s": "a."
  },
  {
    "x": 87.78,
    "y": 175.82,
    "h": 5.7,
    "w": 5.67,
    "s": "33"
  },
  {
    "x": 102.66,
    "y": 173.06,
    "h": 9.18,
    "w": 225.75,
    "s": "Die Verwaltungsbehörden behandeln die bei ihnen ein"
  },
  {
    "x": 328.5,
    "y": 173.06,
    "h": 9.18,
    "w": 3.06,
    "s": "-"
  },
  {
    "x": 53.82,
    "y": 162.86,
    "h": 9.18,
    "w": 277.8,
    "s": "geleiteten Verfahren beförderlich und sorgen ohne Verzug für deren"
  },
  {
    "x": 53.82,
    "y": 152.66,
    "h": 9.18,
    "w": 46.75,
    "s": "Erledigung."
  },
  {
    "x": 337.32,
    "y": 135.56,
    "h": 7.5,
    "w": 38.92,
    "s": "Prüfung der"
  },
  {
    "x": 337.32,
    "y": 127.58,
    "h": 7.5,
    "w": 45.4,
    "s": "Zuständigkeit"
  },
  {
    "x": 382.68,
    "y": 129.86,
    "h": 4.62,
    "w": 4.65,
    "s": "34"
  },
  {
    "x": 68.04,
    "y": 135.56,
    "h": 9.18,
    "w": 4.59,
    "s": "§"
  },
  {
    "x": 74.94,
    "y": 135.56,
    "h": 9.18,
    "w": 6.92,
    "s": "5."
  },
  {
    "x": 90.96,
    "y": 138.32,
    "h": 5.7,
    "w": 2.85,
    "s": "1"
  },
  {
    "x": 96.12,
    "y": 135.56,
    "h": 9.18,
    "w": 235.54,
    "s": "Bevor eine Verwaltungsbehörde auf die Behandlung einer"
  },
  {
    "x": 53.82,
    "y": 125.36,
    "h": 9.18,
    "w": 276.28,
    "s": "Sache eintritt, hat sie von Amtes wegen ihre Zuständigkeit zu prüfen."
  }
];
