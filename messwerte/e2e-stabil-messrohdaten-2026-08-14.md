# QS-E2E-STABIL — Mess-Rohdaten 14.8.2026

**Zweck.** Belegbasis der Budget-Änderungen in `e2e/helpers/budgets.ts`,
`e2e/leser-*.e2e.ts` und `scripts/datenhaltung/suche.test.ts`. Wer eines dieser
Budgets wieder anfasst, prüft es gegen diese Zahlen — nicht gegen ein Gefühl.

**Maschine.** macOS 26.5.2, 10 Kerne, 16 GB. Warmer `vite preview` auf Port 4783
(aus dem Arbeitsverzeichnis abgeleitet, s. `playwright.config.ts`); `dist/` einmal
vor der Messreihe gebaut und danach unberührt. Alle Zeiten in Millisekunden,
sofern nicht anders angegeben; Werte aus dem Playwright-JSON-Report
(`result.duration` je Test), nicht aus der Wandzeit des Kommandos.

**Warum die Messbedingung überall mitsteht.** Eine Rate ohne Bedingung ist keine
Zahl (Dispatch §0 Ziff. 3). Der Lastfaktor dieser Test-Familie liegt zwischen
1.8× und 12×, je nach Bedingung — eine Zahl ohne Bedingung ist deshalb hier
nicht bloss unpräzise, sie ist irreführend.

---

## Die vier Messbedingungen

| Kürzel | Bedingung | Last-Mittel (1 min) |
|---|---|---|
| **I** | Isoliert — ein Spec allein, sonst nichts auf der Maschine | < 3 |
| **P** | Standard-Lokal-Lauf `npm run test:e2e` (fullyParallel, 10 Worker auf 10 Kernen) | 10–12 |
| **S** | P **plus** dauernd laufender `vite build` (je einer, sequenziell neu gestartet) | 13–17 |
| **Ü** | wie S, aber mit verwaisten Build-Schleifen aus Vorläufen — **übersättigt, als Kalibrierbasis verworfen** | 26–32 |

**I ist NICHT die Bedingung, gegen die ein lokales Budget bemessen wird.** Lokal
fährt Playwright `fullyParallel` mit einem Worker je Kern; der lokale Lauf ist
also die Bedingung MIT Contention. (Auf CI ist es umgekehrt: dort `workers: 1`.)
Wer lokal gegen I kalibriert, misst die Maschine im Leerlauf und wundert sich
später über «Flakes».

**Ü ist verworfen.** Bei Last 26–32 hat die Streuung dieselbe Grössenordnung wie
der Mittelwert (a11y BS-640.100: mittel 49 915, sd 35 567). Ein Deckel nach
`Ist + 3 sd` läge dort bei 218 000 ms für einen Test, der isoliert 9 100 ms
braucht — das wäre ein Tor, das nicht mehr scheitern kann (§6.7). Die Werte
stehen unten trotzdem, als obere Schranke.

---

## 1 · Bedingung I — isoliert, n = 5 je Test

Alle Läufe grün. `npx playwright test <spec>`, sequenziell, warmer preview-Server.

| Test | roh | mittel | sd |
|---|---|---|---|
| a11y `Reader BS-640.100` | 8756 · 9115 · 9148 · 9201 · 9310 | 9106 | 209 |
| a11y `Reader BS-640.100 (dunkel)` | 8902 · 9109 · 9141 · 9148 · 9334 | 9127 | 154 |
| leser-kopf-a9 `A9-Dropdown/Sprung` | 15182 · 15331 · 15519 · 15632 · 15715 | 15476 | **218** |
| a33 `A9 — Lese-Scroll` | 24371 · 24377 · 24404 · 25148 · 25597 | 24779 | 564 |
| a33 `F1 — Lese-Scroll` | 15560 · 15577 · 15618 · 15627 · 16837 | 15844 | 556 |
| druck-z2 `Leser-Spalten` | 8067 · 8079 · 8091 · 8150 · 8164 | 8110 | 44 |
| druck-z2 `Split-View-Ausdruck` | 5908 · 5948 · 5981 · 5990 · 6035 | 5972 | 48 |
| r5-r7 `Chip verfällt von selbst` | 14097 · 14304 · 14332 · 14336 · 14379 | 14290 | 111 |
| r5-r7 `A9 — Chip` | 8591 · 8613 · 8652 · 8837 · 9021 | 8743 | 183 |
| r5-r7 `Toter Anker` | 3821 · 3864 · 3998 · 4225 · 4654 | 4112 | 341 |

`scripts/datenhaltung/suche.test.ts`, Datei-Gesamtdauer in s (n = 5, alle grün):
**11.66 · 10.67 · 10.62 · 10.58 · 10.70** → mittel **10.85**, sd **0.45**.

---

## 2 · Bedingung P — Standard-Voll-Lauf, n = 5

`npm run test:e2e` mit `--timeout=300000`, damit die Dauern **unzensiert** sind.
Das ist der methodische Kernpunkt: ein am Deckel abgeschnittener Wert ist keine
Messung, sondern der Deckel. Ohne diesen Griff hätte die Reihe fünfmal «30 000»
gemeldet und nichts über den Bedarf gesagt.

Wandzeiten der fünf Läufe: 316 s · 322 s · 404 s · 432 s · 371 s.
Last vor/nach je Lauf zwischen 9.35 und 11.76.

| Test | roh | mittel | sd | Ist | Deckel `Ist + max(3sd, 25 %)` |
|---|---|---|---|---|---|
| **leser-kopf-a9** `A9` | 23523 · 26591 · 26812 · 31084 · 33406 | 28283 | 3930 | 33406 | 45196 |
| **leser-linien-eid3** `EID-3(b)` | 21241 · 22769 · 24602 · 26454 · 29414 | 24896 | 3194 | 29414 | 38996 |
| **e4** `S7/B1` | 17900 · 21119 · 22649 · 23558 · 37462 | 24538 | 7538 | 37462 | 60076 |
| **e4** `S7` | 28442 · 31558 · 33760 · 35694 · 47967 | 35484 | 7481 | 47967 | 70410 |
| **a33** `A9 — Lese-Scroll` | 33585 · 38662 · 40134 · 45156 · 60034 | 43514 | 10114 | 60034 | 90376 |
| a33 `F1` | 20821 · 24618 · 25577 · 27792 · 34921 | 26746 | 5218 | 34921 | 50575 |
| a11y `BS-640.100` | 11750 · 15634 · 17704 · 18617 · 19724 | 16686 | 3141 | 19724 | 29147 |
| a11y `BS-640.100 (dunkel)` | 12722 · 15652 · 17022 · 18730 · 38846 | 20594 | 10437 | 38846 | 70157 |
| druck-z2 `Leser-Spalten` | 10117 · 11067 · 13415 · 14634 · 19765 | 13800 | 3790 | 19765 | 31135 |
| verweis-u `A9-Popover` | 15967 · 17149 · 17455 · 18136 · 18563 | 17454 | 1000 | 18563 | 23204 |
| weiterlesen `R8/A9` | 13810 · 15049 · 15611 · 17407 · 17647 | 15905 | 1620 | 17647 | 22499 |
| r5-r7 `A9 — Chip` | 9478 · 10048 · 11935 · 12104 · 12240 | 11161 | 1297 | 12240 | 15891 |
| qsui `A9 · Abkürzung` | 5671 · 6065 · 6254 · 6460 · 6948 | 6280 | 473 | 6948 | 8685 |
| rechtsprechung `A9 Rail` | 4102 · 4549 · 4549 · 5149 · 5237 | 4717 | 472 | 5237 | 6653 |

**Lastfaktor I → P**: leser-kopf-a9 15476 → 28283 = **1.8×**; die Streuung wächst
dabei von sd 218 auf sd 3930, also um mehr als eine Grössenordnung. Das ist der
eigentliche Befund: nicht der Mittelwert wandert, die **Verteilung** wird breit.

Nicht-grün in dieser Reihe (alle NICHT Timeout-Klasse, ausserhalb des Auftrags):
`international-kanonik-ia6` `toBeInViewport` in Lauf 3.

---

## 3 · Bedingung S — Voll-Lauf + Dauer-Build

### 3a Vor dem Fix, echte Deckel (Diagnose, n = 2)

Beide Läufe: **dieselben drei Tests rot, 2/2, mit «Test timeout of 30000ms
exceeded»** — der lokale Container-Deckel, nicht eine Assertion.

| Test | Lauf 1 | Lauf 2 |
|---|---|---|
| leser-kontext-e4 `S7/B1` | 35780 | 36850 |
| leser-kopf-a9 `A9` | 35650 | 36563 |
| leser-linien-eid3 `EID-3(b)` | 33086 | 35857 |

Zusätzlich sporadisch (1/2): qsui `/vorlagen/kuendigung-vermieter`,
suche-seite `Deep-Link ?q=Miete`.

### 3b Nullprobe (F3) — unveränderter Vor-Konsolidierungs-Stand `11c39e8e0`

`git checkout 11c39e8e0 -- e2e/`, gleiche Bedingung, n = 2. Ergebnis: **dieselben
drei Tests rot, 2/2.** Der Defekt ist damit **vorbestehend**, keine Regression der
Modul-Zusammenlegung. Genaue Hänge-Stellen aus dem list-Reporter:

- `leser-kontext-e4.e2e.ts:290` — `toBeAttached({ timeout: 60000 })`.
  **Strukturell tot**: die Latte lag ÜBER dem 30-s-Container und konnte lokal nie
  feuern (§6.7).
- `leser-kopf-a9.e2e.ts:119` — `toBeHidden()` (Latte 10 000), Container riss zuerst.
- `leser-linien-eid3.e2e.ts:125` — `keyboard.press('Escape')`, Container riss zuerst.
- `suche-seite.e2e.ts:27` — `expect.poll(...).toBeGreaterThan(6)`, erhalten 0
  (Latte 10 000). **Andere Klasse** — Assertions-Latte, kein Container.

Der zweite Nullproben-Lauf lief bei tieferer Aushungerung (14.3 min) und hatte
**18** Fehlschläge über 12 Specs. Das ist der Beleg dafür, dass die Fehlerzahl
eine Funktion der Aushungerungstiefe ist und nicht eines einzelnen Tests.

### 3c Nach dem Fix, echte Deckel (Abnahme, n = 3)

Wandzeit 401 s · 419 s · 432 s, Last-Mittel 13–17.

| Test | roh | mittel | neuer Deckel | Reserve auf Ist |
|---|---|---|---|---|
| leser-kopf-a9 `A9` | 31192 · 32937 · 35264 | 33131 | 50000 | +42 % |
| leser-linien-eid3 | 29526 · 30959 · 31913 | 30799 | 50000 | +57 % |
| e4 `S7/B1` | 25782 · 30236 · 37805 | 31274 | 95000 | +151 % |
| e4 `S7` | 37670 · 38380 · 42853 | 39634 | 95000 | +122 % |
| a33 `A9 — Lese-Scroll` | 46623 · 50358 · 56024 | 51002 | 95000 | +70 % |

**Timeout-Flakes: 0 in 3/3.** Einziger Fehlschlag: `leser-position-u`
`toBeInViewport` in Lauf 3 — Assertions-Latte, andere Klasse.

---

## 4 · Bedingung «ein gleichzeitiger Build» — Abnahme nach Spec-Wortlaut, n = 3

Voll-Lauf plus **ein** `vite build` (Wandzeit 32.4 s / 14.3 s / 15.6 s, deckt also
nur 4–9 % des Laufs). Ergebnis **3/3 vollständig grün**, je 539 Tests,
`unexpected: 0`, `flaky: 0`, Wandzeit 368 s · 364 s · 378 s.

Diese Bedingung ist die im Fahrplan wörtlich genannte, aber die **schwächere**;
massgeblich für die Abnahme ist 3c (dieselbe Bedingung, unter der der Defekt
vorher 2/2 reproduzierte).

---

## 5 · `scripts/datenhaltung/suche.test.ts`

Bedingung «Parallel-Last (Builds + e2e)» wörtlich nach Fahrplan §3.4: voller
`npm run test:e2e` **plus** Dauer-Build, Last-Mittel ~14. Datei-Gesamtdauer in s,
n = 5:

**46.23 · 66.60 · 49.08 · 48.97 · 41.78** → mittel **50.53**, sd **9.46**.

Lauf 2 **rot**: `Error: Hook timed out in 60000ms.` — der dokumentierte Anlass
reproduziert, Rate 1/5 unter dieser Bedingung.

Lastfaktor I → Parallel-Last: 10.85 → 50.53 s = **4.7×**; sd 0.45 → 9.46 s
(Faktor 20). Deckel nach QS-PERF Ziff. 5: 66 600 + max(3 sd 27 840, 25 % 16 650)
= 94 440 → **95 000 ms**.

Gegenprobe nach dem Fix, unter noch laufender Last: **63.37 s, grün** — mit dem
alten 60-s-Deckel wäre derselbe Lauf rot gewesen.

---

## 6 · Bedingung Ü — verworfene Übersättigung (obere Schranke)

Nur zur Einordnung, **nicht** als Kalibrierbasis verwendet. n = 5, Container per
CLI gehoben:

| Test | roh | mittel | sd |
|---|---|---|---|
| a11y `BS-640.100` | 110895 · 26657 · 25238 · 36098 · 50685 | 49915 | 35567 |
| a11y `BS-640.100 (dunkel)` | 90646 · 30782 · 27902 · 33801 · 49720 | 46570 | 26045 |
| a33 `A9 — Lese-Scroll` | 66253 · 57707 · 59085 · 86735 · 59579 | 65872 | 12122 |
| e4 `S7/B1` | 59027 · 38893 · 42072 · 60782 · 37968 | 47748 | 11218 |
| leser-kopf-a9 `A9` | 35575 · 36178 · 37639 · 40143 · 33359 | 36579 | 2518 |

Lastfaktor I → Ü bei a11y BS-640.100: 9106 → 49915 = **5.5×**, Einzelspitze
110 895 = **12×**. sd in derselben Grössenordnung wie der Mittelwert ⇒ als
Bemessungsgrundlage untauglich.

---

## 7 · Was die Messung dem Fahrplan §3.4 widerspricht

Offengelegt nach §7 (abweichend umsetzen und die Abweichung benennen):

- **(a) a11y BS-640.100 reisst das 60-s-Budget** — reproduziert **nicht**.
  Isoliert 9106 ms (6.6× Reserve), im Voll-Lauf 16686 ms, Ist 19724 ms → 3× Reserve.
  Rot wurde er nur unter der verworfenen Übersättigung Ü. **Nicht angefasst.**
- **(d) druck-fundstellen-z2 reisst ihr 30-s-Attach-Budget DETERMINISTISCH** —
  reproduziert **nicht** auf dieser Maschine. Isoliert 8110 ms, im Voll-Lauf
  13800 ms, Ist 19765 ms. In 11 Voll-Läufen kein einziger Fehlschlag. Die
  Beobachtung stammt vom 2-vCPU-Runner; das CI-Budget (90 s) bleibt unberührt.
  *(Die parallele CI-Forensik meldet diesen Fall als häufigsten CI-Flake der
  letzten 30 Tage — der Widerspruch ist echt und liegt an der Maschine, nicht an
  der Messung. Auf CI bleibt der Fall also offen.)*
- **(e) leser-kopf-a9 fällt unter Parallel-Last 3/3** — **bestätigt**, und die
  Wurzel benannt: nicht das 400-ms-Fenster der Scroll-Spy-Kopfzeile, sondern der
  nie gemessene lokale 30-s-Container.
- **(c) leser-gliederung-a33** — bestätigt, aber knapper als vermutet: der
  `test.slow()`-Deckel hatte auf den schlechtesten Wert noch **1 %** Reserve.
- **NEU, im Fahrplan nicht verzeichnet:** `leser-kontext-e4` «S7/B1» trug **gar
  kein** eigenes Zeitbudget und fiel 2/2 — bei einer Latte von 60 000 ms in einem
  30-s-Container.
