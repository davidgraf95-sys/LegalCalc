// ─── Beschriftungen, die BEIDE Leser-Hüllen führen (Säuberungs-Nachzug 18.8.) ─
//
// WOZU DIESE DATEI. Das Benennungs-Glossar (`docs/ux-audit-2026-07/reader/
// leser-v3-design-grundlage.md`, Kap. 11) ist die eine Wahrheit über die
// WÖRTER; sein Wächter (`src/tests/leser-benennung.test.ts`) deckt aber
// bewusst nur die V3-Fläche. Für Wörter, die auch die eingefrorene Ist-Hülle
// führt, ist das zu wenig: dort kann derselbe Link anders heissen, ohne dass
// eine Sonde anschlägt — genau so ist P1-4 entstanden (V3-Kopf «Amtliche
// Fassung ↗», V1-Übersicht drei Zentimeter daneben «↗ geltende Fassung»).
//
// Hier stehen darum GENAU die Beschriftungen, die über die Hüllen-Grenze
// laufen. Nicht mehr: Wörter, die nur V3 führt, bleiben als Literal an ihrem
// Bauteil, wo ihre Herleitung steht, und werden vom Glossar-Wächter gedeckt.
// Eine Datei, die alle Beschriftungen einsammelte, verlöre genau das (§1: die
// Herleitung gehört zum Bauteil, nicht in ein Wörterbuch).
//
// FL-4 BLEIB GEWAHRT, bis H5 die Ist-Hülle löschte (PR #560, 21.8.2026): bis
// dahin war V1 eingefroren, hier wurde nichts an ihrer Mechanik geändert, nur
// EIN Wort geteilt, das in beiden Hüllen dasselbe Ziel benannte.
//
// KORRIGIERT 21.8.2026 (H5-Nachlese): die hier vorausgesagte Regel «fällt die
// Ist-Hülle, fällt diese Datei mit ihr» hat sich NICHT bewahrheitet — die
// Datei blieb, weil ihre Importer (`AmtlichesPdf.tsx`, `ArtikelLeser.tsx`,
// `ErlassUebersicht.tsx`, `SektionKopf.tsx`, `v3/uebersichtAngaben.ts`)
// durchweg V3 sind. Ihr Zweck ist seither nicht mehr «über die Hüllen-Grenze
// laufen» (es gibt nur noch eine Hülle), sondern schlicht: geteilte
// Beschriftungen mehrerer V3-Bauteile an einem Ort. §17-Rückbau bleibt
// offen — zu prüfen, ob die Datei aufzulösen ist (Wörter an ihre einzigen
// Verwender zurückverschieben) oder als geteilte Quelle sinnvoll bleibt.

/** Ä110 · der Live-Link auf die amtliche Fassung — Pfeil «↗» steht HINTEN. */
export const AMTLICHE_FASSUNG = 'Amtliche Fassung';

/** §8: bei aufgehobenem Erlass führt derselbe Link auf die aufgehobene
 *  Konsolidierung — das gehört in den Namen, nicht in eine Fussnote. */
export const AMTLICHE_FASSUNG_AUFGEHOBEN = 'Amtliche (aufgehobene) Fassung';

/**
 * Ä127 · der Zusatz im ZUGÄNGLICHEN NAMEN eines Links, der auswärts öffnet.
 *
 * GEMESSEN am Live-Stand 18.8.2026: dieselbe Tatsache stand in drei Wortlauten
 * da — «(neues Fenster)» am Artikel- und am Sektionskopf-Link, «(öffnet in
 * neuem Tab)» am amtlichen PDF. Das erste kollidiert zusätzlich mit dem
 * Glossar: «Fenster» ist im Leser die ZWEITE LESEFLÄCHE (Split, Ä118) — ein
 * Screenreader-Nutzer hört «neues Fenster» und erwartet die Split-Fläche, nicht
 * den Browser. «Neuer Tab» ist frei von dieser Doppelbelegung und beschreibt,
 * was `target="_blank"` in jedem heutigen Browser tut.
 */
export const NEUER_TAB = '(neuer Tab)';
