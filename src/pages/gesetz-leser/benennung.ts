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
// FL-4 BLEIBT GEWAHRT. V1 ist bis H5 eingefroren; hier wird nichts an ihrer
// Mechanik geändert, nur EIN Wort geteilt, das in beiden Hüllen dasselbe Ziel
// benennt. Fällt die Ist-Hülle, fällt diese Datei mit ihr (§17-Rückbau).

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
