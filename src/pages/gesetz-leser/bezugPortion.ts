// ─── B7: die Portion einer Instanz-Linie — reine Anzeige-Arithmetik ──────────
//
// W2·7-BEZUG/B7, Vorgabe David 29.7.2026 wörtlich: «es soll einfach 5 entscheide
// pro linie sein und mit klick lädt es die nächsten 5.»
//
// EIGENE DATEI und nicht in `parts/BezuegeZeile.tsx`, aus zwei Gründen, die in
// dieselbe Richtung zeigen:
//  · Die Testumgebung dieses Repos ist `environment: 'node'` (vite.config.ts) —
//    es gibt kein jsdom, also keinen Klick im Test. Die Schritt-Arithmetik muss
//    darum ohne Komponente prüfbar sein, sonst wäre sie nur über den Browser
//    belegbar (§6: beweisen, nicht behaupten).
//  · `react-refresh/only-export-components` (Lint-Tor) verbietet es, aus einer
//    Komponenten-Datei zusätzlich Konstanten und Funktionen zu exportieren.
//    Beides zusammen heisst: die rechnende Hälfte gehört hierher, die rendernde
//    dorthin (§3, gleiche Trennung wie `bezugAuswahl.ts` neben `BezugFacettenWahl`).
//
// Rein und deterministisch (§2): kein Zustand, kein DOM, keine Uhr.

/**
 * Wie viele Entscheide EINE Linie auf einmal zeigt — und wie viele ein Klick
 * nachlädt. Dieselbe Zahl für beides, weil David dieselbe Zahl genannt hat und
 * zwei Zahlen (erst 5, dann 10) niemandem etwas erklären würden.
 *
 * UNIVERSELL, ohne Schwelle: die Regel gilt für jede Linie, ob sie sechs oder
 * 4'140 Entscheide führt. Eine Schwelle («erst ab N stückeln») hiesse, dass die
 * Linie sich je nach Datenlage anders bedient — und der Nutzer müsste raten,
 * warum. Gleiches Verhalten überall ist die ruhigere Bedienung.
 *
 * ── WAS DAS AUCH LÖST (§15) ────────────────────────────────────────────────
 * Art. 42 BGG trägt 4'140 Kanten an EINEM Artikel (Beschwerdebegründung — den
 * zitiert praktisch jedes Bundesgerichtsurteil). Alle Chips eines Erlasses auf
 * einmal zu rendern, hiesse im BGG-Leser fünfstellig viele DOM-Knoten
 * aufzubauen, von denen ein Nutzer vielleicht fünf ansieht — die Idle-Herde aus
 * W2·7-VZUI (§15.4) an anderer Stelle. Mit 5 je Linie ist der Grundzustand des
 * BGG-Lesers unabhängig von der Korpusgrösse.
 *
 * ── WARUM KLICK UND NICHT SCROLL-AUTOMATIK (abgelöste Bauform) ─────────────
 * Die erste B7-Fassung hängte beim Scrollen ans Ende automatisch nach. Das war
 * bequem und undurchsichtig zugleich: die Linie wuchs unter der Hand, und man
 * sah nie, wo man in 4'140 Entscheiden steht. Ein Klick, der die Zahl sichtbar
 * hochzählt («5 von 4'140» → «10 von 4'140»), macht dieselbe Sache
 * nachvollziehbar — und er ist tastaturbedienbar, was eine Scroll-Automatik
 * nicht ist.
 *
 * ── WARUM DER STAND NICHT PERSISTIERT WIRD ─────────────────────────────────
 * «Ich habe hier schon dreimal nachgeladen» ist eine Aussage über den aktuellen
 * Blick, nicht über eine Einstellung. Der Leser-Options-Store hält Dinge, die
 * eine ABSICHT ausdrücken (welche Instanzen, welcher Zeitraum) — ein Lade-Stand
 * gehört nicht dazu, und ihn je Artikel und Klasse zu speichern hiesse, den
 * Store mit Sitzungsstaub zu füllen. Jeder Besuch beginnt bei den fünf neusten.
 */
export const PRO_SCHRITT = 5;

/** Zahl mit Schweizer Tausendertrennung — «4'140» statt «4140». */
export const zahl = (n: number): string => n.toLocaleString('de-CH');

/**
 * Wie viele Chips nach EINEM Klick sichtbar sind. Geklammert an die Menge: der
 * letzte Schritt nimmt nur noch den Rest, statt über das Ende hinauszuzählen.
 */
export function naechsteSichtbar(bisher: number, anzahl: number): number {
  return Math.min(bisher + PRO_SCHRITT, anzahl);
}

/**
 * WARUM eine Linie kürzer ist, als der Artikel hergibt (§8).
 *
 * ── DER BEFUND, DER DIESE ACHSE ERZWUNGEN HAT (Gegenprüfung Runde 2/J1) ────
 * Die erste Fassung kannte nur `zeitAktiv: boolean`. Der KANTONS-Schnitt
 * verkürzt die Linie aber genauso — und weil er kein Flag setzte, fiel der
 * Zähler in den «alles gezeigt»-Zweig und schrieb die verkürzte Menge als
 * Vollzahl hin. Reproduziert am ausgelieferten Bestand:
 *   · StPO Art. 428, Kanton «GR», Zeitraum offen → sichtbar «1». Tatsächlich
 *     hat der Artikel 882 kantonale Entscheide; einer davon ist aus GR.
 *   · BGG Art. 42, Kanton «AG» → «5» statt eines Hinweises auf 3'398.
 * Eine Zahl ohne «von» heisst in dieser Zeile «das ist alles» — genau die
 * Vollständigkeits-Behauptung, die der Kopf dieser Datei verbietet. Der Fehler
 * war nicht die Formel, sondern dass sie nur EINE von zwei Ursachen kannte.
 *
 * Die Ursache wird BENANNT und nicht bloss gezählt: «5 von 12 im Zeitraum» und
 * «1 von 882 im Kanton» sind verschiedene Aussagen, und wer die Verkürzung
 * aufheben will, muss wissen, welchen Schalter er sucht.
 */
export type Verkuerzung = 'zeit' | 'kanton' | 'beide';

/** Kurzform für die sichtbare Zeile — knapp, weil daneben zwei Zahlen stehen. */
const URSACHE_KURZ: Readonly<Record<Verkuerzung, string>> = {
  zeit: 'im Zeitraum',
  kanton: 'im Kanton',
  beide: 'in der Auswahl',
};

/** Langform für den `title` — dort ist Platz, und dort steht die dritte Zahl. */
export const URSACHE_LANG: Readonly<Record<Verkuerzung, string>> = {
  zeit: 'im gewählten Zeitraum',
  kanton: 'im gewählten Kanton',
  beide: 'in der gewählten Auswahl',
};

/**
 * Welche Ursache trifft zu? `null`, wenn kein einschränkender Schalter aktiv
 * ist. Rein (§2) — die Frage, OB eine bestimmte Gruppe wirklich verkürzt wurde,
 * beantwortet der Aufrufer aus den Zahlen (siehe `StatusGruppe`), nicht diese
 * Funktion aus den Schalterstellungen.
 */
export function verkuerzungAus(zeit: boolean, kanton: boolean): Verkuerzung | null {
  if (zeit && kanton) return 'beide';
  if (zeit) return 'zeit';
  if (kanton) return 'kanton';
  return null;
}

/**
 * Zahl am Gruppenkopf: WIE VIEL VON WIE VIEL steht gerade in der Linie (§8).
 *
 * Drei Fälle, drei Formen:
 *  · alles gezeigt, nichts verkürzt ⇒ «4'140»   (ein «4'140 von 4'140» wäre Lärm)
 *  · gestückelt                     ⇒ «5 von 4'140»
 *  · Filter hat verkürzt            ⇒ «5 von 12 im Zeitraum» / «1 von 882 im Kanton»
 *
 * Die Bezugsgrösse ist die GRUNDMENGE DER LINIE, also das, was nach dem Filter
 * überhaupt zu holen wäre — nie die Zahl der gerade gerenderten Chips. Ist die
 * Linie verkürzt, steht das «von» AUCH dann, wenn alles geladen ist: sonst läse
 * sich die gefilterte Menge wie die Datenlage. Dass es ohne Filter insgesamt
 * mehr gibt, nennt der `title` des Kopfes; die sichtbare Zeile bleibt bei zwei
 * Zahlen (Minimalismus-Vorgabe David).
 */
export function zahlText(gezeigt: number, grundmenge: number, verkuerzt: Verkuerzung | null): string {
  if (gezeigt >= grundmenge && !verkuerzt) return zahl(grundmenge);
  return `${zahl(gezeigt)} von ${zahl(grundmenge)}${verkuerzt ? ` ${URSACHE_KURZ[verkuerzt]}` : ''}`;
}

/**
 * Ist DIESER Klick der letzte — verschwindet das «weitere»-Element danach?
 *
 * Eigene Funktion, weil daran eine Fokus-Entscheidung hängt (WCAG 2.4.3,
 * Gegenprüfung Runde 2/J4): wer das Element per Tastatur bedient, verlöre beim
 * letzten Klick den Fokus ins Nichts, weil der Knopf unmountet. Die Komponente
 * setzt den Fokus deshalb VORHER auf die Linie — und die Bedingung dafür ist
 * hier prüfbar, statt in einem Klick-Handler zu verschwinden, den diese
 * node-Testumgebung nicht auslösen kann.
 */
export function istLetzterSchritt(sichtbar: number, anzahl: number): boolean {
  return naechsteSichtbar(sichtbar, anzahl) >= anzahl;
}
