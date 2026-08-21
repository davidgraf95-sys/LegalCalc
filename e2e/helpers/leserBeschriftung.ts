// e2e/helpers/leserBeschriftung.ts — Beschriftungen des Lesers, an EINER Stelle
// benannt (§5), damit ein künftiger Wortlaut-Wechsel nicht jede Spec einzeln
// nachziehen muss.
//
// GESCHICHTE (Säuberung 18.8.2026, H5 21.8.2026): bis zum Flip-Fenster trug
// diese Datei UNIONS aus zwei Beschriftungen — V3s eigener und der der
// Ist-Hülle («Darstellungsoptionen», «Im Gesetz suchen», «Änderungsvermerke»,
// je als CSS-Union/Namens-Muster, damit dieselbe Spec gegen beide Hüllen lief.
// Mit H5 ist die Ist-Hülle gelöscht; die Konstanten tragen jetzt nur noch die
// V3-Beschriftung. Die Namen bleiben unverändert, damit die 16 konsumierenden
// Specs unangetastet bleiben (§6.3) — nur die Definitionen sind schlanker.

/** Das aufgezogene Ansicht-Menü (die `role=group` mit den Schaltern) — trägt
 *  die Identität `data-v3-ansicht-panel`. Als Selektor-String, damit derselbe
 *  Ausdruck in `page.locator(...)` UND in `document.querySelector(...)`
 *  innerhalb von `page.evaluate` funktioniert. */
export const ANSICHT_PANEL = '[data-v3-ansicht-panel]';

/** Der zugängliche Name desselben Menüs für `getByRole('group', { name: … })`. */
export const ANSICHT_NAME = 'Ansicht';

/**
 * Der zugängliche Name des Leser-Suchfelds («Im Erlass ‹Kürzel› suchen …»,
 * Ä112/Ä126). `Im` als Anker, damit das Muster nicht auch das APP-Suchfeld der
 * Topbar trifft («Suchen oder Norm springen …»).
 */
export const LESER_SUCHFELD_NAME = /^Im .+ suchen/;

/** Der Schalter für die Fassungs-Zeile am Artikelfuss (Ä116 — heisst wie das
 *  Element, das er schaltet). Verankert (`^…$`), damit das Muster nicht in
 *  einen künftigen Schalter «Fassungs-Zeitleiste» o. ä. hineintrifft (§7). */
export const VERMERKE_SCHALTER_NAME = /^Fassung$/;

/** Der Schalter für die Rechtsprechung («Rechtsprechung in der Kopfzeile»,
 *  Ä115 — Substantiv wie seine beiden Nachbarn, benennt seit B2 seine
 *  wirkliche Wirkung). */
export const RECHTSPRECHUNG_SCHALTER_NAME = /^Rechtsprechung/;
