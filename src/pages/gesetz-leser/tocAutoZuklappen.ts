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

/** Fallback-Schalter (s. o.): `false` stellt exakt den 19.7.-Zustand her. */
export const F2_OBERHALB = true;

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
  return tocCont.querySelector(`[data-sektion-ids~="${CSS.escape(id)}"]`);
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
}): ZuklappPlan {
  const { tocCont, auto, aktivIds, tick, ticks } = opts;
  const nachlauf = opts.nachlauf ?? AUTO_ZU_NACHLAUF;
  const oberhalb = opts.oberhalbErlaubt ?? F2_OBERHALB;
  const leer: ZuklappPlan = { schliessen: [], kompensation: 0 };
  if (!tocCont) return leer; // kein Container ⇒ nichts anfassen (keine Blind-Aktion)
  const contRect = tocCont.getBoundingClientRect();

  const lageVon = (ast: HTMLElement): Lage => {
    const r = ast.getBoundingClientRect();
    if (r.height === 0) return null;
    if (r.top >= contRect.bottom) return 'unten';
    if (oberhalb && r.bottom <= contRect.top) return 'oben';
    return null; // berührt das Sichtband ⇒ offen lassen (19.7.-Wächter)
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
  const kompensation = obenAeste
    .filter((a) => !obenAeste.some((b) => b !== a && b.contains(a)))
    .reduce((n, a) => n + a.getBoundingClientRect().height, 0);
  return { schliessen, kompensation };
}
