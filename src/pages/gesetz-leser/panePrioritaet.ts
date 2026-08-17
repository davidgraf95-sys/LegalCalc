// ─── WELCHES PANE beansprucht einen Tastendruck? (A3/A2, eine Quelle) ────────
//
// BEFUND 1, gemessen 17.8.2026 im Split @1600 (BGFA | BGBM, `?leser=v3`): seit
// Ä19 hat JEDES Pane ein Suchfeld, also lief der ⌘K-Hook zweimal und hängte zwei
// `window`-Listener in derselben Capture-Phase. Beide beanspruchten den
// Tastendruck, beide reichten Fokus nach — der zuletzt registrierte gewann.
// Gemessen: Fokus im primären Pane, ⌘K ⇒ Fokus landete im SEKUNDÄREN Feld
// (`imPrimaer:false, imSekundaer:true`), und ebenso, wenn er schon sekundär war.
// Das Kürzel bediente damit nie das Pane, in dem der Leser arbeitet.
//
// BEFUND 2, gemessen 17.8.2026 im Split (H3-Nachzug A2): dieselbe Frage stellte
// sich für die Taste «r» (Panel aufziehen) — nur hatte sie dort NICHT dieselbe
// Antwort. Der Leser-Tastatur-Listener lief absichtlich nur im PRIMÄREN Pane
// (ein zweiter globaler Listener hätte j/k doppelt springen lassen), also öffnete
// «r» aus dem sekundären Pane das Panel des primären. Ein Kürzel, das eine andere
// Fläche bedient als die, in der man liest, ist schlimmer als keines (§8).
//
// DIE REGEL, in einem Satz: der Tastendruck gehört dem Pane, in dem
// `document.activeElement` steht. Steht der Fokus in KEINEM Pane (Body, Topbar,
// Krume), gewinnt das primäre — das ist die Fläche, die der Leser sieht, wenn er
// noch nichts gewählt hat.
//
// WARUM EIGENE, GETEILTE DATEI: sie ist die EINE Antwort für BEIDE Kürzel-Wege
// (`v3/suchKuerzel` für ⌘K/«/», `parts/LeserTastatur` für j/k/t/r/?). Bis zum
// H3-Nachzug stand sie in `v3/suchKuerzel.ts`; von dort hätte `parts/` sie nicht
// holen dürfen — die geteilten Bausteine rendert auch die Ist-Hülle und dürfen
// nicht an `v3/` hängen (FL-4, Abhängigkeitsrichtung). Zwei Kopien der Regel
// wären beim ersten Nachjustieren auseinandergelaufen (§5).
//
// §2: rein DOM-LESEND, ohne Zustand. Die Entscheidung fällt beim Tastendruck,
// nicht beim Registrieren des Listeners — sonst wäre sie beim Pane-Wechsel
// veraltet.

/**
 * Gehört dieser Tastendruck dem Leser in diesem Pane?
 *
 * @param imSekundaerenPane Rolle des fragenden Lesers. Vorgabe-Fall `false`
 *   deckt die Einzelansicht UND das primäre Pane ab; nur der sekundäre Leser
 *   übergibt `true`.
 */
export function tastendruckGehoertPane(imSekundaerenPane: boolean): boolean {
  if (typeof document === 'undefined') return !imSekundaerenPane;
  const ziel = document.activeElement as Element | null;
  const fokusPane = ziel?.closest?.('[data-pane]')?.getAttribute('data-pane') ?? null;
  // Kein Pane unter dem Fokus ⇒ Fallback primär (auch in der Einzelansicht, wo
  // es überhaupt kein `[data-pane]` gibt: dort ist `imSekundaerenPane` false).
  return (fokusPane === 'sekundaer') === imSekundaerenPane;
}
