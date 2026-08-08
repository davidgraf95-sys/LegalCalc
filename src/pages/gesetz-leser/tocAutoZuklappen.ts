// ═══ W2·19-GLIEDERUNG · S5 — F2: Auto-Zuklappen der Gliederung ═══════════════
//
// Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §3.6, §9-S5.
//
// WAS DIESES MODUL ENTSCHEIDET. Welche automatisch geöffneten Äste des
// Gliederungsbaums beim Weiterlesen wieder zugehen dürfen — und wie viel
// Scroll-Höhe dabei OBERHALB des Sichtbands verschwindet, also um wie viel
// `scrollTop` gegenzuhalten hat, damit die sichtbaren Zeilen stillstehen.
// Reine Messung + Entscheidung, kein State, kein React: das macht die Regel
// prüfbar und hält `inhalt-hooks.tsx` unter der §6.6-Schwelle.
//
// ── WAS VORHER GALT UND WARUM ES KEIN VERSEHEN WAR ───────────────────────────
// Der bisherige Wächter liess einen Ast nur zuklappen, wenn er GANZ UNTERHALB
// des Sichtbandes lag (`r.top >= contRect.bottom`). Er stammt aus der
// A9-CLS-Forensik vom 19.7.2026 (BEFUND 3) und war die richtige Antwort auf
// einen echten, gemessenen Schaden: kollabiert ein Ast OBERHALB der sichtbaren
// Zeilen, rückt der gesamte sichtbare Inhalt darunter nach oben — auf dem
// 2-vCPU-Runner riss genau das das CLS-Budget (gemeldetes `li` 248×195→0×0 als
// Kind eines solchen Oberhalb-Astes). Die damalige Lösung war bewusst
// konservativ: lieber gar nicht zuklappen als sichtbar springen.
//
// ── WAS SIE GEKOSTET HAT ─────────────────────────────────────────────────────
// Beim Vorwärtslesen liegen die verlassenen Äste IMMER oberhalb. Die Bedingung
// konnte also praktisch nie zutreffen — gemessen (Perf-Diagnose 8.8.2026, U4):
// NULL Zuklapp-Ereignisse in jedem Lauf, der Baum wuchs monoton von 18 auf 140
// sichtbare Zeilen (+330 % Höhe). Daraus folgte U5, Davids «sie springt
// komisch»: der wachsende Baum schob den aktiven Eintrag aus dem Sichtband, der
// Mitscroll-Nudge musste immer weiter nachfassen (Sprung-Sätze 777 px Median,
// bis 8 524 px). Der Wächter hat also nicht ein Problem gelöst, sondern zwei
// gegeneinander getauscht.
//
// ── WAS JETZT GILT ───────────────────────────────────────────────────────────
// Zugeklappt wird richtungsunabhängig — ober- UND unterhalb —, aber nie ein
// Ast, der das Sichtband BERÜHRT:
//   · UNTERHALB: sein Kollaps bewegt ausschliesslich off-screen-Inhalt. Nichts
//     zu kompensieren (Verhalten wie bisher).
//   · OBERHALB: der Kollaps zieht den sichtbaren Inhalt nach oben. Genau um
//     diese Höhe nimmt der Aufrufer `scrollTop` im SELBEN Frame vor dem Paint
//     zurück — die sichtbaren Zeilen stehen dann still.
//   · IM BAND: bleibt offen. Hier gäbe es nichts zu kompensieren, weil der Ast
//     SELBST sichtbar ist und sein Verschwinden ein echter Sprung wäre (§15.2).
//     Für diesen Fall behält der 19.7.-Wächter recht und bleibt in Kraft.
//
// ── FALLBACK, DEKLARIERT (Spec §3.6) ─────────────────────────────────────────
// Geht die Kompensation auf dem gedrosselten Runner reproduzierbar nicht auf,
// wird NICHT an ihr nachjustiert, sondern die Oberhalb-Richtung wieder
// abgeschaltet (`F2_OBERHALB = false`, eine Zeile) — dann gilt exakt der
// 19.7.-Zustand. Nie ein springender Baum.

/**
 * Nachlauf-Fenster in Pfadwechseln: ein automatisch geöffneter Zweig bleibt so
 * lange offen, bis die Leseposition ihn um so viele distinkte Pfadwechsel hinter
 * sich gelassen hat. Verhindert das sichtbare Auf-/Zuklappen beim Hin-und-Her
 * (PageUp nach PageDown).
 *
 * GEMESSEN und bei 6 BELASSEN (die Bau-Spec §3.6 nennt ebenfalls 6). Das
 * Perf-Dossier schlug 6→2–3 vor, um den Baum auf ~39 Zeilen zu drücken. Am
 * gebauten Stand nachgemessen (OR, 4× CPU-Drossel, 60 × 1200 px Dokument-Scroll,
 * 1440×900; «Zeilen» = wirklich gerenderte `li`, seit dem Unmount deckungsgleich
 * mit dem, was der Nutzer sieht):
 *   Nachlauf 6 → max 96 … 110 Zeilen (4 Läufe)
 *   Nachlauf 3 → max 73 …  81 Zeilen (2 Läufe)
 * Der schnellere Nachlauf kauft also rund 25 Zeilen. Er kauft sie NICHT billiger:
 * der CLS-Anteil im [data-toc] streut in dieser Messreihe über ALLE geprüften
 * Varianten zwischen 0.060 und 0.27 — auch beim Vorzustand ohne jedes Zuklappen
 * (1bbb00e26) lag ein Lauf bei 0.060. Die Streuung ist damit so gross wie der
 * Unterschied, den sie zeigen soll; §0-3: dann IST die Messung das Ergebnis und
 * nicht das Feature. Ohne belegten Vorteil bleibt der Spec-Wert stehen, statt
 * einen Alt-Entscheid auf ein Rauschen hin zu kippen.
 * Der Dossier-Zielwert ~39 war eine Projektion, keine Messung, und wird von
 * keiner der beiden Einstellungen erreicht — das gehört so gesagt (§8). Das
 * eigentliche Ziel ist trotzdem erfüllt: statt monoton auf 140+ zu wachsen
 * (U4: NULL Zuklapp-Ereignisse je Lauf), bleibt der Baum beschränkt, und die
 * DOM-Last im Baum fällt von 20 389 auf ~1 300–1 500 Knoten.
 */
export const AUTO_ZU_NACHLAUF = 6;

/**
 * Fallback-Schalter (s. o.): `false` stellt exakt den 19.7.-Zustand her — es
 * klappen nur noch Äste GANZ UNTERHALB des Sichtbands zu.
 *
 * STEHT AUF `true`. Der Fallback wurde am 9.8.2026 kurzzeitig GEZOGEN und nach
 * einer Nullprobe wieder gelöst — die Begründung dafür ist lehrreich genug, um
 * sie hier zu behalten:
 *
 *  1. `leser-gliederung-a33` «A9 — Lese-Scroll unter CPU-Drossel» riss im vollen
 *     Vor-Merge-Lauf mit CLS 0.050354 (Budget 0.05); drei sichtbare Baumzeilen
 *     280×43 → 0×0. Isoliert 5/5 grün — der Fall braucht Parallel-Last.
 *  2. Sonde (231 protokollierte Entscheidungen): zum MESSZEITPUNKT lag in allen
 *     acht Geometrie-Urteilen KEINE Kind-Zeile im Band. Die Hypothese «der
 *     Wächter misst nur den Ast-Kopf» war damit widerlegt.
 *  3. `F2_OBERHALB = false` → erst 5/5 grün, dann 2/5 rot mit BIT-IDENTISCHEM
 *     Wert. Also nicht die Ursache; der erste Fünferlauf war Glück.
 *  4. Unmount zurückgebaut → 3/10 rot, gleiche Signatur. Auch nicht die Ursache.
 *  5. NULLPROBE gegen den Stand VOR dieser Slice (1bbb00e26, S4): 1/10 rot —
 *     gleiche drei Zeilen, gleicher Wert 0.06495/0.050354. Der Defekt ist ÄLTER
 *     als das Auto-Zuklappen und hat mit ihm nichts zu tun.
 * Konsequenz: der Schalter bleibt in der gebauten Stellung, weil kein Befund
 * gegen ihn spricht. Die Ursache des a33-Falls ist NICHT gefunden und ist als
 * eigener Befund gemeldet — sie liegt in S4 oder davor (die verschwindenden
 * Zeilen sind laut Herkunfts-Sonde TOP-LEVEL-Knoten sek-275/1052/1680/1782, und
 * die kann kein Ast-Kollaps entfernen).
 *
 * §0-3 in Reinform: vier Hypothesen, jede durch eine Messung widerlegt, und die
 * eine Messung, die alles entschieden hat, war die Nullprobe. Sie hätte am
 * Anfang stehen müssen, nicht am Ende.
 */
export const F2_OBERHALB = true;

/**
 * Sicherheitssaum um das Sichtband, in px (W2·19-GLIEDERUNG/S5, Nachtrag).
 *
 * ANLASS — ein roter a33-Lauf, keine Vermutung. Im vollen Vor-Merge-Lauf (520
 * Fälle parallel, 4× CPU-Drossel) riss «A9 — Lese-Scroll unter CPU-Drossel» mit
 * CLS 0.050354 gegen das Budget 0.05. Das Protokoll nannte drei
 * Gliederungszeilen bei y = 251 / 306 / 360, je 280×43 → 0×0: drei SICHTBARE
 * Zeilen wurden vom Auto-Zuklappen ausgehängt.
 *
 * WAS DIE MESSUNG SAGT (Sonde im gebauten Stand, OR, 4× Drossel, 110
 * Scroll-Schritte, jede Entscheidung protokolliert): 231 Entscheidungen, davon 8
 * mit Geometrie-Urteil — und in ALLEN acht lag zum MESSZEITPUNKT keine einzige
 * Kind-Zeile im Sichtband (`imBand: 0`; Ast-Unterkanten −199 … −876 px gegen eine
 * Bandoberkante von 123 px). Die naheliegende Erklärung «der Wächter misst nur
 * den Ast-Kopf statt der Ausdehnung des Teilbaums» ist damit WIDERLEGT: gemessen
 * wird der Kind-Container, und der spannt den ganzen gerenderten Teilbaum auf.
 *
 * WAS BLEIBT: zwischen Messen und Mutieren kann sich die Geometrie ändern. Der
 * Beschluss entsteht im 200-ms-Timer; die Mutation lief für den Fall «Ast
 * unterhalb» als GEWÖHNLICHES setState — React committet das später, unter Last
 * deutlich später, und inzwischen scrollt der Nutzer weiter und der
 * Mitscroll-Nudge verschiebt den Scroller. Ein Ast, der beim Messen sauber
 * ausserhalb lag, kann beim Aushängen im Band stehen. Darum zwei Änderungen:
 *   1. Beschluss und Mutation liegen jetzt IMMER im selben Frame (`flushSync`,
 *      s. inhalt-hooks) — nicht mehr nur dann, wenn kompensiert wird.
 *   2. Dieser Saum: ein Ast muss um mindestens eine Zeilenhöhe am Band VORBEI
 *      sein, nicht haarscharf daneben. 64 px ≈ 1½ Baumzeilen (gemessen 43 px) —
 *      genug für den Restweg eines Frames unter Drossel, wenig genug, dass das
 *      Zuklappen wirksam bleibt (in derselben Sonde lagen alle acht Fälle
 *      199–876 px daneben, also weit jenseits des Saums).
 * §15/§0-3: der Saum kostet im Zweifel ein paar nicht zugeklappte Äste — die
 * Alternative kostet einen sichtbaren Sprung. Die Richtung gibt die Spec vor
 * («nie ein springender Baum», §3.6).
 */
export const F2_SICHERHEITSSAUM = 64;

/**
 * B3 (Bug-Check 9.8.2026) — EINE ZEILE, EIN ZIELWERT.
 *
 * Eine verdichtete Einzelkind-Kette ist EINE Baumzeile mit MEHREREN
 * Sektions-Ids. Der Chevron kippte sie bis hierher EINZELN
 * (`k.ids.forEach(tocToggle)`). Standen die Ids nicht im gleichen Zustand — und
 * genau das hinterlässt ein Sektions-Sprung, der nur die äusserste Id öffnet —,
 * kam ein GEMISCHTER Zustand heraus. Weil eine Zeile als offen gilt, sobald
 * IRGENDEINE ihrer Ids offen ist (`zeileIstOffen`, `.some(Boolean)`), liess sich
 * der Ast danach nie wieder schliessen: `aria-expanded` blieb dauerhaft `true`,
 * und der Nutzer hatte keinen Ausweg. Betroffen sind alle Zeilen mit
 * Verdichtung UND Kindern (ZGB, VVG, KOV, mehrere BS-Erlasse).
 *
 * Die Regel steht HIER und nicht im Zustands-Hook, damit sie ohne React und
 * ohne DOM prüfbar ist (§6.7: das Tor muss den Fall rot zeigen können).
 * `istOffen` kommt vom Aufrufer, weil die Zeile ihren sichtbaren Zustand auch
 * aus dem Modell beziehen kann (`startOffen`, `startOffeneTiefe`) — eine Zeile
 * ohne Eintrag in der Karte liesse sich sonst mit dem ersten Klick nicht
 * schliessen.
 */
export function klappZeile(
  offen: Record<string, boolean>, ids: string[], istOffen: boolean,
): Record<string, boolean> {
  const ziel = !istOffen;
  return { ...offen, ...Object.fromEntries(ids.map((id) => [id, ziel])) };
}

export interface ZuklappPlan {
  /** Ids, deren Ast zugeklappt werden darf (Reihenfolge unerheblich). */
  schliessen: string[];
  /** Höhe in px, die OBERHALB der Sichtband-Oberkante verschwindet. */
  kompensation: number;
}

/** Id → gerenderte Zeile. `data-sektion-ids~="…"` trifft auch die INNEREN Stufen
 *  einer verdichteten Einzelkind-Kette (S3/S4): sie haben kein eigenes Element,
 *  werden aber von der Zeile getragen, die sie zeigt. */
function zeileZu(tocCont: HTMLElement, id: string): HTMLElement | null {
  // `CSS.escape` nur, wo es existiert — dasselbe Muster wie `findeArt`
  // (berechnungen.ts). Ohne diese Klammer wirft das Modul in jeder Umgebung ohne
  // `CSS`-Global, und genau daran ist der erste Lauf des Unit-Tors gescheitert
  // (§6.7: das Tor hat beim ersten Mal etwas gefunden). Die `sek-N`-Ids brauchen
  // die Maskierung nicht; sie steht für den Fall, dass die Id-Vergabe je ändert.
  const sicher = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
  return tocCont.querySelector(`[data-sektion-ids~="${sicher}"]`);
}

/** Der KIND-Container einer Zeile — das, was beim Zuklappen verschwindet. Die
 *  Zeile selbst bleibt stehen; gemessen wird darum nie sie, sondern ihr Ast. */
function astVon(el: HTMLElement): HTMLElement | null {
  return el.querySelector(':scope > div.grid');
}

type Lage = 'oben' | 'unten' | null;

/**
 * Plant den Zuklapp-Durchgang. Mutiert NICHTS — der Aufrufer führt die
 * Buchhaltung (Auto-Set, Ticks) und den State-Update aus.
 */
export function planeZuklappen(opts: {
  tocCont: HTMLElement | null;
  /** Automatisch geöffnete Ast-Ids (Kandidatenmenge). */
  auto: Iterable<string>;
  /** Ids des AKTIVEN Pfads — die bleiben offen. */
  aktivIds: string[];
  /** Monotoner Pfadwechsel-Zähler und die letzte Aktiv-Runde je Ast. */
  tick: number;
  ticks: Map<string, number>;
  nachlauf?: number;
  oberhalbErlaubt?: boolean;
  /** Sicherheitssaum um das Sichtband (px), s. F2_SICHERHEITSSAUM. */
  saum?: number;
}): ZuklappPlan {
  const { tocCont, auto, aktivIds, tick, ticks } = opts;
  const nachlauf = opts.nachlauf ?? AUTO_ZU_NACHLAUF;
  const oberhalb = opts.oberhalbErlaubt ?? F2_OBERHALB;
  const saum = opts.saum ?? F2_SICHERHEITSSAUM;
  const leer: ZuklappPlan = { schliessen: [], kompensation: 0 };
  if (!tocCont) return leer; // kein Container ⇒ nichts anfassen (keine Blind-Aktion)
  const contRect = tocCont.getBoundingClientRect();

  const lageVon = (ast: HTMLElement): Lage => {
    const r = ast.getBoundingClientRect();
    if (r.height === 0) return null;
    // Der Saum weitet das Sichtband nach beiden Seiten: nicht «gerade eben
    // draussen» zählt, sondern «mit Abstand draussen» (Herleitung bei
    // F2_SICHERHEITSSAUM — ein roter a33-Lauf mit drei ausgehängten SICHTBAREN
    // Zeilen). Ohne den Saum entscheidet der letzte Pixel, und der überlebt den
    // Weg von der Messung bis zur Mutation unter Last nicht zuverlässig.
    if (r.top >= contRect.bottom + saum) return 'unten';
    if (oberhalb && r.bottom <= contRect.top - saum) return 'oben';
    return null; // berührt das Sichtband (samt Saum) ⇒ offen lassen
  };

  const schliessen: string[] = [];
  const obenAeste: HTMLElement[] = [];
  for (const id of auto) {
    if (aktivIds.includes(id)) continue; // im aktiven Pfad → offen halten
    if (tick - (ticks.get(id) ?? 0) <= nachlauf) continue; // noch im Nachlauf-Fenster
    const el = zeileZu(tocCont, id);
    if (!el) continue; // nicht gerendert (z. B. selbst in einem zugeklappten Ast)
    const ast = astVon(el);
    if (!ast) continue; // kein offener Kind-Container ⇒ nichts zu schliessen
    const lage = lageVon(ast);
    if (lage === null) continue;
    if (lage === 'oben') obenAeste.push(ast);
    schliessen.push(id);
  }
  // NUR die ÄUSSERSTEN kollabierenden Äste zählen: klappen ein Ast und sein
  // eigener Unterast im selben Durchgang zu, steckt die Höhe des Unterastes
  // bereits in der des Oberastes. Summierte man beide, überkompensierte der
  // Scroll und der Baum spränge in die andere Richtung — derselbe Schaden, nur
  // mit umgekehrtem Vorzeichen.
  // B1 (Bug-Check 9.8.2026, HOCH): erst DEDUPLIZIEREN, dann summieren. Eine
  // verdichtete Einzelkind-Kette trägt alle ihre Ids an DERSELBEN Zeile — steht
  // mehr als eine davon im Auto-Set, liefert `zeileZu` für jede dasselbe
  // Element, und `obenAeste` enthielt denselben Ast mehrfach. Der
  // Verschachtelungs-Filter unten fängt das NICHT ab: er vergleicht `b !== a`,
  // und bei identischer Referenz ist das falsch, beide bleiben stehen. Die Höhe
  // wäre n-fach in die Kompensation eingegangen und der Baum in die
  // GEGENRICHTUNG gesprungen — schlimmer als gar keine Korrektur. Betroffen
  // sind genau die Erlasse mit Ketten (ZGB, BS-211.100, BS-640.100).
  const einmalig = [...new Set(obenAeste)];
  const kompensation = einmalig
    .filter((a) => !einmalig.some((b) => b !== a && b.contains(a)))
    .reduce((n, a) => n + a.getBoundingClientRect().height, 0);
  return { schliessen, kompensation };
}
