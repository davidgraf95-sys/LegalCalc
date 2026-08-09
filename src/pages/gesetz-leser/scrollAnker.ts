// W2·5d U-POSITION/A16: anker-basierte Scroll-Restoration für den Gesetz-Leser.
//
// David 5.7.2026: «Zurück landet EXAKT am Ausgangsort.» Wurzel-Problem — die
// gespeicherte absolute Scrollposition (window.scrollY, App.tsx:ScrollWieder-
// herstellung) ist bei langen Gesetzen mit `content-visibility:auto` UNZUVERLÄSSIG:
// die Platzhalterhöhen off-screen materialisieren erst beim Rendern, ein absolutes
// scrollY=X landet nach Re-Layout an einem ANDEREN Artikel («Seitenanfang statt
// Art. 5»). Davids eigener Hinweis: anker-basiert wiederherstellen — «letzter
// sichtbarer Artikel + Offset».
//
// Diese kleine Registry hält je Reiter-Identität (tabSchluessel, Pfad + ?r, ohne
// #Hash/?preset) den zuletzt beobachteten Anker {Artikel-Token, Offset}. Der Reader
// pflegt ihn beim Scrollen; App.tsx:ScrollWiederherstellung löst ihn beim
// Zurück-/Reiter-Wechsel gegen das AKTUELLE DOM auf (element-basiert → robust gegen
// die content-visibility-Höhen-Neuschätzung) und fällt auf das gespeicherte scrollY
// zurück, wenn der Anker (noch) nicht auflösbar ist.
//
// ZUSTANDSLOS (§5): nur Pfad-Schlüssel + Zahl/Token, nie Fall-/Formulardaten.
// Reine Darstellungs-Infrastruktur (§3), deterministisch bei gleichem DOM (§2).

export interface ScrollAnker {
  /** Artikel-Token (id ohne «art-»-Präfix), z. B. «5» oder «335_c». */
  token: string;
  /** px, um die die Artikel-Oberkante ZUM Aufnahmezeitpunkt ÜBER der Bezugslinie
   *  lag (≥ 0 = in den Artikel hineingescrollt). Bewahrt die Feinposition. */
  offset: number;
}

const anker = new Map<string, ScrollAnker>();

export function merkeAnker(key: string, a: ScrollAnker): void {
  anker.set(key, a);
}

export function leseAnker(key: string): ScrollAnker | undefined {
  return anker.get(key);
}

// LM-199 (W2·17-UI-BEFUNDE-B2): Verdikt «der Einstiegs-Hash der aktuellen
// History-Position ist VERBRAUCHT». Entscheider ist App.tsx:useVerbrauchterHash
// (dort steht die Herleitung: POP aus einer anderen Reiter-Identität, Anker
// vorhanden). Der Reader hat NEBEN App.tsx:ScrollZuHash eigene Hash-Springer
// (Seed-Sprung beim Erlass-Laden, letzteNavKey-Instanzwechsel) — die müssen
// dasselbe Verdikt lesen, sonst kapert der Seed-Sprung nach dem Remount die
// von A16 restaurierte Rückkehr-Position erneut (genau der LM-199-Fehler).
// EIN Verdikt, EINE Quelle (§5); nur Fenster-/Primär-Navigation, Panes haben
// ihre eigene lokale History und bleiben unberührt.
let hashVerbraucht = false;

export function setzeHashVerbraucht(wert: boolean): void {
  hashVerbraucht = wert;
}

export function istHashVerbraucht(): boolean {
  return hashVerbraucht;
}

/**
 * Landepunkt eines Sprungs (px ab Container-Oberkante) — die REALE Sticky-Höhe
 * des Reader-Kopfs. Nicht nachgerechnet, sondern dort gelesen, wo sie ohnehin
 * steht: im `scroll-margin-top` eines `.nt-anker` (index.css: `var(--nt-stick)`,
 * gesetzt am Reader-Root in inhalt.tsx). Damit gibt es GENAU EINE Zahl (§5), und
 * sie ist per Konstruktion dieselbe, die `scrollIntoView` benutzt.
 *
 * §17-WURZELFIX (Diagnose 9.8.2026, Befund David «der Sprung landet im Abschnitt
 * davor»): hier stand bis dahin die Konstante `5 * remPx` = 80 px, und die
 * Kommentare in dieser Datei wie in `inhalt-hooks.tsx` behaupteten beide, sie sei
 * mit dem Landepunkt «deckungsgleich». Sie war es nicht: `--nt-stick` ist
 * `calc(4rem + 2.25rem)` = 100 px, gemessen am gebauten Reader. Die 12 px
 * Differenz (Linie 88 gegen Landepunkt 100) liessen die Linie nach einem
 * Sektions-Sprung NOCH IM letzten Artikel des VORIGEN Abschnitts liegen
 * (OR: Art. 551, Unterkante 92 px) — der Spy meldete darum den Vorgänger,
 * sobald der Sprung-Lock fiel. Ein Zahlen-Duplikat, das lautlos driftet, ist
 * genau der Fall, vor dem §5 warnt.
 *
 * Ohne Anker-Element (SSR, leeres Dokument) bleibt der bisherige 5-rem-Wert als
 * Rückfall — er ist dann so gut oder schlecht wie zuvor, aber nie schlechter.
 */
export function ankerLandepunkt(el: Element | null | undefined): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 80;
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  if (!el) return 5 * remPx;
  const wert = parseFloat(getComputedStyle(el).scrollMarginTop);
  return Number.isFinite(wert) && wert > 0 ? wert : 5 * remPx;
}

/**
 * Bezugslinie (px ab Container-Oberkante), an der «der oberste angeschnittene
 * Artikel» gemessen wird — deckungsgleich mit dem Scroll-Spy (`inhalt-hooks.tsx`)
 * und dem `.nt-anker`-scroll-margin. `containerTop` = 0 für das Fenster, sonst
 * Pane-Oberkante; `landepunkt` kommt aus `ankerLandepunkt`.
 *
 * Das Epsilon von 8 px bleibt: die Linie soll nach einem Sprung INNERHALB des
 * angesprungenen Elements liegen, nicht exakt auf seiner Oberkante — sonst
 * entscheidet Rundung darüber, ob das Ziel als «erreicht» gilt.
 */
export function bezugslinie(containerTop: number, landepunkt: number): number {
  return containerTop + landepunkt + 8;
}

/**
 * Löst den gespeicherten Anker gegen das aktuelle Dokument (Fenster-Scroll) in ein
 * Ziel-scrollY auf. null, wenn kein Anker existiert oder das Artikel-Element (noch)
 * nicht im DOM ist (⇒ Aufrufer nutzt den scrollY-Fallback). Element-basiert und
 * darum robust gegen die content-visibility-Höhenschätzung: das Artikel-Element
 * liegt IMMER im DOM (nur off-screen unrendered), getElementById findet es.
 */
export function aufloeseAnkerY(key: string): number | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const a = anker.get(key);
  if (!a) return null;
  const el = document.getElementById(`art-${a.token}`);
  if (!el) return null;
  // Der Artikel IST ein `.nt-anker` — sein scroll-margin-top ist der Landepunkt.
  const bezug = bezugslinie(0, ankerLandepunkt(el));
  const top = el.getBoundingClientRect().top;
  // Ziel-scrollY so, dass die Artikel-Oberkante wieder `offset` px über der
  // Bezugslinie liegt: scrollY + (top - (bezug - offset)).
  return Math.max(0, Math.round(window.scrollY + top - bezug + a.offset));
}

// ─── W2·10-UI-NAV/R5 · Rücksprung nach TOC-Sprüngen ──────────────────────────
//
// A16 hat Verweis-Sprünge zu echten History-Einträgen gemacht — «Zurück» landet
// dort exakt (Davids U-POSITION-Befund ist gebaut). ÜBRIG bleibt genau eine
// Lücke: der Sprung aus dem Gliederungs-Baum erzeugt KEINEN History-Eintrag (er
// scrollt nur, bewusst — er soll die Adresse nicht mit jedem Klick zumüllen,
// LM-202). Wer im TOC auf «Zweiter Abschnitt» klickt, verliert damit seine
// Leseposition ohne Rückweg: der Browser-Zurück-Knopf führt aus dem Gesetz
// heraus, nicht an die verlassene Stelle.
//
// Antwort: ein FLÜCHTIGER Chip statt eines History-Eintrags. Vor dem Sprung wird
// die verlassene Stelle hier vermerkt, der Chip bietet sie einige Sekunden lang
// an, danach verfällt sie. Bewusst NICHT in der Adresse und NICHT in
// localStorage — ein Rückweg, den man drei Tage später noch hätte, ist kein
// Rückweg mehr, sondern Ballast (§5: der Reader hat mit `zuletztVerwendet`
// bereits eine dauerhafte Wiedereinstiegs-Spur; das hier ist die flüchtige).
//
// Reine Darstellungs-Infrastruktur (§3), zustandslos (§5): nur Token + Etikett.

export interface Ruecksprung {
  /** Artikel-Token der verlassenen Stelle (id ohne «art-»-Präfix). */
  token: string;
  /** Angezeigtes Etikett, WÖRTLICH aus dem DOM gelesen («Art. 335c»). Nie aus
   *  dem Token rekonstruiert — die Etikett-Regel (labelMitBereich: Art./§,
   *  bis/ter-Suffixe) lebt in der Artikel-Komponente und hätte hier eine zweite,
   *  driftende Fassung bekommen (§5). Ist kein Anker lesbar, bleibt das Etikett
   *  leer und der Chip spricht neutral von der «Leseposition» (§8). */
  label: string;
}

let ruecksprung: Ruecksprung | null = null;
const hoerer = new Set<(r: Ruecksprung | null) => void>();

/** Aktuellen Rücksprung setzen/löschen und die Hörer wecken. */
export function setzeRuecksprung(r: Ruecksprung | null): void {
  ruecksprung = r;
  for (const h of hoerer) h(r);
}

export function leseRuecksprung(): Ruecksprung | null {
  return ruecksprung;
}

/** Abo für den Chip. Gibt die Abmeldung zurück (useEffect-Cleanup). */
export function abonniereRuecksprung(fn: (r: Ruecksprung | null) => void): () => void {
  hoerer.add(fn);
  return () => { hoerer.delete(fn); };
}

/**
 * Den Artikel bestimmen, den der Leser GERADE liest: das letzte Artikel-Element,
 * dessen Oberkante noch nicht unter die Bezugslinie gerutscht ist — exakt die
 * Definition, mit der auch der Scroll-Spy den aktiven Artikel markiert (§5, EINE
 * Lesart von «wo bin ich»). Rein aus dem DOM, kein State: deterministisch bei
 * gleichem DOM (§2). null, wenn kein Artikel im Dokument liegt.
 */
export function ermittleLesePosition(): Ruecksprung | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const arts = document.querySelectorAll<HTMLElement>('article[id^="art-"]');
  if (arts.length === 0) return null;
  const bezug = bezugslinie(0, ankerLandepunkt(arts[0]));
  let treffer: HTMLElement | null = null;
  for (const el of arts) {
    // `<=` statt `<`: ein Artikel, der GENAU auf der Linie sitzt (der Normalfall
    // direkt nach einem Sprung), ist der gelesene — sonst zeigte der Rücksprung
    // nach dem zweiten TOC-Klick auf den Vorgänger.
    if (el.getBoundingClientRect().top <= bezug) treffer = el;
    else break; // Dokumentreihenfolge ⇒ ab hier liegt alles darunter
  }
  // Vor dem ersten Artikel (Ingress/Kopf) gibt es nichts zurückzuspringen.
  if (!treffer) return null;
  const token = treffer.id.slice('art-'.length);
  // Etikett aus dem Anker selbst (sein Textinhalt IST das Label, der
  // Fussnoten-Marker steht ausserhalb des <a>). Fehlt der Anker (Trefferliste
  // rendert einen <button>), bleibt das Etikett leer — der Chip wird neutral.
  const anker = treffer.querySelector<HTMLElement>(`a[href="#art-${CSS.escape(token)}"]`);
  return { token, label: anker?.textContent?.trim() ?? '' };
}

/**
 * Die aktuelle Leseposition als Rücksprung vormerken — vom TOC-Sprung aufgerufen,
 * BEVOR gescrollt wird. Nichts zu merken (kein Artikel sichtbar) ⇒ alter Eintrag
 * wird gelöscht, damit der Chip nie eine veraltete Stelle anbietet (§8).
 */
export function merkeRuecksprungVonDom(): void {
  setzeRuecksprung(ermittleLesePosition());
}

/**
 * Zurückspringen: scrollt an die vorgemerkte Stelle und löscht sie. Nutzt
 * dieselbe Mechanik wie der TOC-Sprung (`scrollIntoView` + `.nt-anker`-
 * scroll-margin), damit die Landung identisch ausfällt. KEIN History-/Hash-
 * Eingriff (LM-202: die Adresse ändert sich nur bei ausdrücklichem Teilen-Klick).
 * false, wenn das Ziel nicht (mehr) im DOM liegt.
 */
export function springeZurueck(r: Ruecksprung): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(`art-${r.token}`);
  if (!el) { setzeRuecksprung(null); return false; }
  el.scrollIntoView({ block: 'start', behavior: 'auto' });
  setzeRuecksprung(null);
  return true;
}
