// e2e/helpers/budgets.ts — die EINE Quelle der A9-Zeitbudgets (§5, QS-E2E-STABIL).
//
// ── Warum diese Datei existiert ───────────────────────────────────────────────
// Die A9-Reihe (Bedienbarkeit + Flüssigkeit unter CPU-Drossel) prüft in acht
// Specs dieselbe Sache mit denselben Zahlen. Bis 14.8.2026 stand die Gabelung
// `process.env.CI ? … : …` in JEDER dieser Specs neu — die Drossel achtfach, das
// Reaktions-Budget vierfach (leser-kopf-a9, leser-linien-eid3, rechtsprechung,
// qsui-hierarchie), der CI-Container-Deckel ebenfalls vierfach. Die
// Kalibrierungs-Empirie lag dabei nur an EINER Stelle (leser-kopf-a9), die
// übrigen trugen einen Kommentar «wie leser-kopf-a9» — also einen Verweis, den
// nichts prüft. Genau das ist die §5-Verletzung: derselbe Fachinhalt (hier: die
// Zeitschranke, gegen die die Prüfaussage läuft) an vier Orten gepflegt.
// Praktische Folge: drei unabhängige Prüf-Agenten verloren am 3./4.8.2026 je
// einen Diagnose-Zyklus an dieselbe Budget-Klasse, weil aus der Einzelspec nicht
// hervorging, dass die Zahl geteilt ist.
//
// Diese Datei ändert KEINEN Wert. Sie hebt die vorhandenen Werte an einen Ort,
// samt der Herleitung, die vorher nur in leser-kopf-a9.e2e.ts stand.
//
// ── CPU-Drossel: CI 4× / lokal 6× (Muster #163) ──────────────────────────────
// Die A9-Prüfung braucht eine langsame Maschine, sonst beweist sie nichts über
// den Fall, für den die Interaktion gebaut ist. Lokal (10-Kern-Maschine) ergibt
// 6× eine realistische Mittelklasse-Last; der 2-vCPU-CI-Runner ist von Haus aus
// langsamer, dort würde 6× die Messung ins Container-Budget treiben — darum 4×.
//
// ── Reaktions-Budget: CI 8000 ms / lokal 5000 ms ─────────────────────────────
// DEKLARIERTE Test-Änderung nach §6.3 (26.7.2026, Muster 1bcca6b3) — sie hebt
// einen Deckel, darum steht die Messreihe hier und nicht in der Commit-Message.
//
// Belegter Anlass: auf main-CI (Lauf 30213927546, Shard 8/8) riss leser-kopf-a9
// 3× an den Reaktions-Budgets — «Switch Linien zu langsam» 5766 bzw. 6263 ms und
// «Gliederungs-Sprung zu langsam» 5756 ms gegen das feste 5000-ms-Budget —,
// während derselbe Code lokal grün blieb (25.8 s Gesamtlauf).
//
// Gegengemessen (26.7.2026, 4-vCPU-Container @2.1 GHz, CI-Zweig also 4× Drossel,
// workers=1 ohne Contention, 4 Läufe, alle grün):
//   Dropdown öffnen  4342 · 4057 · 4074 · 4713 ms   (Maximum bei 94 % des Budgets)
//   Switch Fussnoten 3452 · 3375 · 3122 · 3495 ms
//   Switch Linien    3996 · 3610 · 3835 · 3754 ms
//   Switch Verweise  2795 · 3008 · 2993 · 2808 ms
//   Gliederungs-Spr. 3955 · 4087 · 3784 · 3737 ms
// Das 5000-ms-Budget hat auf 4 vCPU also nur noch 6 % Luft; der 2-vCPU-Runner ist
// nochmals langsamer und überschreitet es entsprechend um 15–25 %. Gemessen wird
// im Budget-Fenster ohnehin nicht nur die App-Reaktion, sondern auch Playwrights
// Aktionierbarkeits-Prüfung («visible, enabled and stable» über aufeinander
// folgende Frames) — und die skaliert mit der Drossel mit. Der Deckel misst damit
// zu einem guten Teil Runner-Tempo, nicht Interaktions-Lag.
//
// Höhe nach der Revisions-Politik QS-PERF Ziff. 5 («Deckel = Ist + max(3 sd,
// ~25 %), Anhebung nur mit Mess-Beleg»): Ist = 6263 ms (schlechtester belegter
// Wert), 3 sd der Messreihe ≈ 915 ms, 25 % = 1566 ms → max ⇒ 7829 ms, gerundet
// 8000 ms. Der Deckel bleibt damit scharf: die belegten Runner-Werte liegen bei
// 72–78 % davon, eine echte Verdoppelung der Reaktionszeit fällt weiterhin auf
// (§6.7 — kein Tor, das nicht scheitern kann).
//
// Die PRÜFAUSSAGE ist unberührt (§6.3): geprüft wird weiterhin, dass jede
// Interaktion unter Drossel ohne Hänger reagiert und der Fluss CLS 0 hält — nur
// die Schranke ist auf die Hardware kalibriert, gegen die sie läuft. Hält die
// Kalibrierung nicht, ist der nächste Schritt eine gemessene Runner-Reihe
// (Muster `perf-kalibrierung.yml`), NICHT ein weiteres Anheben.

const AUF_CI = !!process.env.CI

/** CPU-Drossel der A9-Reihe: CI 4× (2-vCPU-Runner), lokal 6×. */
export const DROSSEL = AUF_CI ? 4 : 6

/**
 * Deckel für eine EINZELNE gedrosselte Interaktion (Klick → sichtbare Wirkung).
 * Herleitung siehe Kopf dieser Datei.
 */
export const REAKTIONS_BUDGET = AUF_CI ? 8000 : 5000

/**
 * Web-first-Latte der zugehörigen `expect(...).toBeVisible({ timeout })`.
 * MUSS über dem Budget liegen, sonst risse künftig zuerst die Assertion-Frist
 * und die Budget-Assertion könnte gar nicht mehr feuern.
 */
export const REAKTIONS_LATTE = REAKTIONS_BUDGET + 3000

/**
 * Container-Budget (`test.setTimeout`) der gedrosselten A9-Tests auf CI: 120 s.
 * Gemessen braucht ein solcher Test auf dem 4-vCPU-Container ~49 s je Lauf; der
 * 2-vCPU-Runner liegt darüber, und die Summe der gemessenen Fenster plus der
 * ungedrosselten Ready-Latten kommt dem 90-s-Projekt-Default nahe. Reisst der
 * Container zuerst, lautet die Meldung «Test timeout» — und sagt nicht mehr,
 * WELCHE Interaktion zu langsam war; genau diese Auskunft ist der Ertrag des
 * Tests. Lokal unverändert (Projekt-Default 30 s), darum `null`.
 */
export const CONTAINER_BUDGET_CI: number | null = AUF_CI ? 120_000 : null
