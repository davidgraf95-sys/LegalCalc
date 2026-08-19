// e2e/helpers/leserBeschriftung.ts — die EINE Quelle für zwei Beschriftungen,
// die in BEIDEN Leser-Hüllen verschieden heissen (Säuberung 18.8.2026).
//
// ── WARUM ES DIESE DATEI GIBT ────────────────────────────────────────────────
//
// Seit dem H4-Flip ist V3 der Standard-Leser; die Ist-Hülle lebt unter
// `?leser=v1` weiter und wird vom Playwright-Projekt `leser-v1` gefahren.
// DIESELBEN Spec-Dateien laufen also gegen BEIDE Hüllen — und genau darum darf
// ein Locator nicht an einer Beschriftung hängen, die sich in einer der beiden
// geändert hat.
//
// Die Säuberung 18.8.2026 hat zwei solche Beschriftungen bewegt (Glossar:
// `docs/ux-audit-2026-07/reader/leser-v3-design-grundlage.md`, Kap. 11):
//
//   Ä114  Ansicht-Menü      V3 «Ansicht»                    V1 «Darstellungsoptionen»
//   Ä126  Leser-Suchfeld    V3 «Im Erlass ‹Kürzel› suchen …»  V1 «Im Gesetz suchen»
//
// V1 bleibt bis H5 unangetastet (FL-4) — die Abweichung ist also Absicht und
// kein Rückstand. Sie verschwindet, wenn die Ist-Hülle fällt; dann fällt diese
// Datei mit ihr (§17-Rückbau: dann trägt sie nichts mehr, was die Glossar-Sonde
// `src/tests/leser-benennung.test.ts` nicht schon sagt).
//
// GEMESSEN, warum das nötig wurde: der Playwright-Volllauf vom 18.8.2026 nach
// der Säuberung meldete **49 rote Fälle in 15 Spec-Dateien** — ausnahmslos
// Locator-Treffer auf die alten Wörter, kein einziger ein Verhaltens-Fehler.
//
// ── WARUM EINE UNION UND KEIN ZWEITER PFAD ───────────────────────────────────
// Naheliegend wäre `istV3(page) ? … : …`. Das wäre eine Verzweigung je Spec —
// also die Sorte Kopie, die diese Helper-Schicht ausdrücklich einsammelt
// (`budgets.ts`). Eine CSS-Union bzw. ein Namens-Muster trifft in beiden Hüllen
// GENAU EIN Element und braucht kein Wissen darüber, welche gerade läuft.

/**
 * Das aufgezogene Ansicht-Menü (die `role=group` mit den Schaltern).
 *
 * V3 trägt seit Ä114 die IDENTITÄT `data-v3-ansicht-panel`, V1 den Namen
 * «Darstellungsoptionen». Als CSS-Union, damit derselbe Ausdruck in
 * `page.locator(...)` UND in `document.querySelector(...)` innerhalb von
 * `page.evaluate` funktioniert — beide Formen kommen in den Specs vor.
 *
 * ── WARUM DIE V3-HÄLFTE NICHT AM NAMEN HÄNGT ────────────────────────────────
 * Ä114 gibt Öffner UND Panel denselben Namen «Ansicht» — für einen
 * Screenreader ist das richtig und eindeutig (die ROLLE unterscheidet: «Ansicht
 * Schaltfläche» zieht «Ansicht Gruppe» auf). Ein reiner Attribut-Selektor
 * `[aria-label="Ansicht"]` unterscheidet sie NICHT: gemessen am 18.8.2026 traf
 * `.first()` danach den KNOPF, und jede Suche nach einem Schalter darin lief
 * ins Leere («element(s) not found» an einem Panel, das offen dastand).
 * Darum die Identität statt der Beschriftung — dieselbe Lehre wie der
 * `data-fn-ref`-Fix aus H2: ein Wächter darf ein Element nicht über sein
 * Aussehen (hier: seinen Namen) suchen, wenn es eine Identität hat.
 */
export const ANSICHT_PANEL = '[data-v3-ansicht-panel], [aria-label="Darstellungsoptionen"]';

/**
 * Der zugängliche Name desselben Menüs für `getByRole('group', { name: … })`.
 * Wortgrenze statt Teilstring (§7): «Ansicht» soll nicht in «Ansichts-Optionen»
 * eines künftigen dritten Elements hineintreffen.
 */
export const ANSICHT_NAME = /^(Ansicht|Darstellungsoptionen)$/;

/**
 * Der zugängliche Name des Leser-Suchfelds.
 *
 * V3 nennt seit Ä112/Ä126 den Erlass («Im Erlass StPO suchen oder zu einer
 * Bestimmung springen»), V1 sagt «Im Gesetz suchen». Gemeinsam ist beiden der
 * Kern «Im … suchen» — daran hängt das Muster, und zwar mit `Im` als Anker: ein
 * blosses /suchen/ träfe auch das APP-Suchfeld der Topbar («Suchen oder Norm
 * springen …») und damit genau die Verwechslung, die Ä112 behoben hat.
 *
 * Ä126 hat den Wortlaut der V3-Hälfte verschoben (Kürzel raus aus dem
 * sichtbaren Platzhalter, «Erlass» als Substantiv davor) — das Muster blieb
 * dabei UNVERÄNDERT gültig. Das ist kein Zufall, sondern der Grund, warum hier
 * ein Namens-Muster steht und kein Literal: die Beschriftung darf sich
 * bewegen, solange sie ihre Sache noch benennt.
 */
export const LESER_SUCHFELD_NAME = /^Im .+ suchen/;

/**
 * Der Schalter für die Fassungs-Zeile am Artikelfuss.
 *
 * V3 «Fassung» (Ä116 — der Schalter heisst wie das Element, das er schaltet),
 * V1 weiter «Änderungsvermerke». Die WIRKUNG ist in beiden Hüllen dieselbe
 * (geteiltes Feld `histansicht`, `leserOptionen.ts`); nur der Name ist in der
 * Ist-Hülle stehengeblieben.
 *
 * Verankert (`^…$`), damit das Muster nicht in einen künftigen Schalter
 * «Fassungs-Zeitleiste» o. ä. hineintrifft (§7).
 */
export const VERMERKE_SCHALTER_NAME = /^(Fassung|Änderungsvermerke)$/;

/**
 * Der Schalter für die Rechtsprechung.
 *
 * V3 «Rechtsprechung in der Kopfzeile» (Ä115 — Substantiv wie seine beiden
 * Nachbarn, und er benennt seit B2 seine wirkliche Wirkung), V1
 * «Rechtsprechung anzeigen». Gemeinsamer Anker ist das erste Wort.
 */
export const RECHTSPRECHUNG_SCHALTER_NAME = /^Rechtsprechung/;
