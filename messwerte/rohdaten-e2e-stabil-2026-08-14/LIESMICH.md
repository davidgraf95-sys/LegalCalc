# Rohdaten QS-E2E-STABIL, 14.8.2026

Auswertung und Einordnung: `../e2e-stabil-messrohdaten-2026-08-14.md`.
Hier liegen nur die unbearbeiteten Spuren, damit die Zahlen dort nachprüfbar sind.

| Datei | Inhalt |
|---|---|
| `per-test-dauern.json` | Per-Test-Dauern und -Status aller 43 Messläufe, auf die untersuchten Specs eingedampft. Schlüssel = Lauf-Label (s. u.), Wert = `{stats, tests: {"<spec> :: <titel>": [[ms, status], …]}}`. |
| `phase1.log` | Bedingung I (isoliert), Wandzeiten je Lauf |
| `voll.log` | Bedingung P (Standard-Voll-Lauf), Wandzeit + Last vor/nach |
| `diag.log` · `null.log` | Bedingung S vor dem Fix bzw. Nullprobe auf `11c39e8e0` |
| `frei.log` | Bedingung Ü (übersättigt, als Kalibrierbasis verworfen) |
| `abnahme.log` · `abnahme-last.log` | Abnahme nach Spec-Wortlaut bzw. unter Reproduktionsbedingung |
| `suche.log` | `suche.test.ts` unter Parallel-Last |
| `*.sh`, `*.mjs` | die verwendeten Mess- und Auswert-Skripte |

**Lauf-Label → Bedingung:** `iso-*` = I · `voll-*` = P · `diag-last-*`,
`nullprobe-*`, `abnahme-last-*` = S · `frei-*` = Ü · `abnahme-*` = ein
gleichzeitiger Build · `last-suche-*` = `suche.test.ts` unter Parallel-Last.

**Unzensiert.** Die Reihen P, Ü und die Nullprobe liefen mit
`--timeout=300000`, damit die Dauern nicht am Deckel abgeschnitten sind. Die
Abnahme-Reihen liefen mit den ECHTEN Deckeln — sonst bewiesen sie nichts.
