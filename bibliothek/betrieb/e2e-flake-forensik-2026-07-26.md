# e2e-Flake-Forensik — drei 2-vCPU-Rotfälle, zwei kalibriert, einer widerlegt (26.7.2026)

**Erstellt:** 26.7.2026, Auftrag David («Härtung im 1bcca6b3-Muster» für drei als
2-vCPU-flaky belegte e2e-Tests). Verortung `QS-PERF`. Anlass-Dossier:
[AUDIT-TORE-2026-07-20.md](../register/AUDIT-TORE-2026-07-20.md) — 11 von 17
roten CI-Läufen kamen aus e2e-Shards.
**Status:** ERSTRECHERCHE (eigene Messreihen, je 4 Läufe; die Kalibrier-Höhen
folgen der Revisions-Politik `QS-PERF` Ziff. 5. Fachliche Abnahme durch David
offen — der Befund in §3 ist ausdrücklich UNGEKLÄRT, nicht behoben.)

**Messumgebung.** Container 4 vCPU Intel Xeon @2.1 GHz, 15 GB RAM, Chromium
1194 (Playwright 1.60 erwartet 1223 — Revisions-Abweichung offengelegt, sie
betrifft die Browser-Version, nicht die Mess-Semantik). Gebautes `dist/` via
`npm run build`, `vite preview`. Alle Messungen im **CI-Zweig**
(`CI=1` ⇒ 4× CPU-Drossel, `workers=1`) und mit `--retries=0`, damit
Wiederholungen keine Flakes verdecken. Die Maschine ist pro Kern langsamer als
eine Entwickler-Maschine und damit ein brauchbarer, aber nicht identischer
Stellvertreter des 2-vCPU-Runners.

---

## 1. Bilanz vorweg

| Fall | Gemeldete Diagnose | Verdikt nach Messung |
|---|---|---|
| `leser-kopf-a9` Reaktions-Budgets | 2-vCPU-Streuung, 15–25 % über Deckel | **BESTÄTIGT** — Deckel kalibriert (5000 → 8000 ms auf CI) |
| `gesetze-ia-v2-walks` Ergebnis-Kopfzeile | Kopfzeile erst nach allen Manifesten | **BESTÄTIGT und schärfer als gemeldet** — die Wartezeit übersteigt den 10-s-Default schon ohne 2-vCPU-Contention; Latte 30 s |
| `norm-sprung` A9 Suchtreffer-Latte | lokal unter Host-Last rot | **WIDERLEGT als Flake** — reproduzierbarer **bimodaler ~48-s-Stall** ohne Contention; nicht gehärtet (§3) |

Die dritte Zeile ist der wichtigste Befund: eine Härtung hätte dort genau den
Lag verdeckt, den der Test messen soll.

---

## 2. Die zwei kalibrierten Fälle

### 2.1 `leser-kopf-a9` — Reaktions-Budgets (`e2e/leser-kopf-a9.e2e.ts`)

Belegter Anlass: main-CI Lauf `30213927546`, Shard 8/8, 3× rot —
«Switch Linien zu langsam» 5766 bzw. 6263 ms, «Gliederungs-Sprung zu langsam»
5756 ms gegen ein festes 5000-ms-Budget; lokal grün (25.8 s Gesamtlauf).

Eigene Messreihe (4 Läufe, alle grün, ohne Worker-Contention):

| Fenster | Messwerte (ms) | Maximum vs. Budget 5000 |
|---|---|---|
| Dropdown öffnen | 4342 · 4057 · 4074 · 4713 | **94 %** |
| Switch Fussnoten | 3452 · 3375 · 3122 · 3495 | 70 % |
| Switch Linien | 3996 · 3610 · 3835 · 3754 | 80 % |
| Switch Verweise | 2795 · 3008 · 2993 · 2808 | 60 % |
| Gliederungs-Sprung | 3955 · 4087 · 3784 · 3737 | 82 % |

Der Deckel hatte auf 4 vCPU also nur 6 % Luft. Im Budget-Fenster steckt zudem
nicht nur die App-Reaktion, sondern auch Playwrights Aktionierbarkeits-Prüfung
(«visible, enabled and stable» über aufeinanderfolgende Frames) — und die
skaliert mit der Drossel. Der Deckel misst damit zu einem guten Teil
Runner-Tempo statt Interaktions-Lag.

**Kalibrierung:** `REAKTIONS_BUDGET` = 8000 ms auf CI, lokal unverändert 5000 ms.
Herleitung nach `QS-PERF` Ziff. 5 («Deckel = Ist + max(3 sd, ~25 %), Anhebung
nur mit Mess-Beleg»): Ist = 6263 ms (schlechtester belegter Wert), 3 sd ≈ 915 ms,
25 % = 1566 ms → max ⇒ 7829 ms ⇒ gerundet 8000. Die web-first-Latte liegt mit
Budget + 3000 ms bewusst DARÜBER, sonst riss die Assertion-Frist zuerst und die
Budget-Assertion könnte gar nicht mehr feuern (§6.7). Container-Budget auf CI
120 s, weil der Test gemessen ~49 s je Lauf braucht und ein Container-Timeout die
Diagnose «welche Interaktion» verschluckt.

**Sabotage-Probe (§6.7, Tor einmal rot gezeigt).** Drossel nach dem Setup auf 16×
gehoben (nur die gemessenen Interaktionen betroffen, Ready-Latten unberührt):
der kalibrierte Deckel wurde ROT und benannte die Stelle —
`Dropdown öffnen zu langsam · Expected < 8000 · Received 17394`. Probe danach
byte-gleich zurückgebaut (sha256 gegen den Vor-Stand verglichen). Die belegten
Runner-Werte liegen bei 72–78 % des neuen Deckels; eine Verdoppelung der
Reaktionszeit fällt weiterhin auf.

### 2.2 `gesetze-ia-v2-walks` — Ergebnis-Kopfzeile (`:152`)

Belegter Anlass: PR-CI Lauf `30209953784`, Shard 5/8, 3× Timeout am 10-s-Default;
lokal 5.3 s.

Die Latte ist eine **Lade-Synchronisation**, kein Interaktions-Prüfschritt: die
Kopfzeile wird erst sichtbar, wenn JEDE Suchgruppe fertig geladen ist
(`SuchResultate.tsx` hält den bereits reservierten Slot solange auf `invisible`) —
also Artikel-Index UND alle Erlass-Manifeste. Das ist eine strikt stärkere
Bedingung als der «Sprung»-Treffer, auf den `sprungWalk` in derselben Datei mit
20 s wartet.

Eigene Messreihe (4 Läufe, alle grün): **12 189 · 11 998 · 11 364 · 11 413 ms.**
Die Wartezeit liegt auf langsamer Hardware also **schon ohne 2-vCPU-Contention
über dem 10-s-Default** — der gemeldete Rotfall ist strukturell, nicht marginal.
Mit dem für dieses Repo gemessenen CI-Faktor (~3.9, Beleg im Kopf von
`playwright.config.ts`) projizieren die lokalen 5.3 s auf ~21 s.

**Kalibrierung:** Latte 30 s (~40 % über der Projektion, weit im 90-s-Datei-Budget).
Prüfaussage unverändert: geprüft wird weiterhin, dass die Kopfzeile mit der festen
Aufschlüsselung «n Treffer, davon x Erlasse / y Artikel» sichtbar wird.

---

## 3. NICHT gehärtet: bimodaler ~48-s-Stall in `norm-sprung` A9

**Gemeldet war** ein lokaler Host-Last-Flake («Suchtreffer-Listbox nicht in
12 s», auf ruhiger Maschine 4.7 s). **Gemessen wurde etwas anderes.**

Die erste gedrosselte Such-Latte im A9-Test (`feld.fill('OR 257d')` → «Sprung»
sichtbar, direkt nach dem Query-Reset) im CI-Zweig, `workers=1`, ohne jede
Contention:

| Konfiguration | latch-1 «Sprung» sichtbar (ms) |
|---|---|
| unverändert (CLS-Höhen-Sampler aktiv) | **48 241** · 604 · **49 585** · **48 619** |
| Gegenprobe: Sampler deaktiviert | 720 · 770 · **47 887** · 400 |

Zwei Modi, nichts dazwischen über 8 Beobachtungen: entweder ~0.4–0.8 s oder
~48–50 s. Bei 4× Drossel entsprechen ~48 s etwa **12 s un-gedrosselter
Rechenzeit**. Die unmittelbar folgende, **identische** zweite Latte braucht in
jedem Lauf 0.29–0.40 s — die Arbeit fällt also genau einmal an.

**Ausgeschlossen (gemessen, nicht vermutet):**

- **Host-Last / Worker-Contention** — alle Läufe mit `workers=1`, keine
  Parallel-Last; der Stall tritt trotzdem auf.
- **Test-Instrumentierung** — der Verdacht lag nahe, weil
  `clsBeobachtenInstallieren` (`e2e/helpers/cls.ts`) eine **unbegrenzte
  rAF-Schleife** startet, die pro Frame `getBoundingClientRect()` auf 13
  Elementen aufruft (erzwungenes Layout je Frame, ab Installation bis Test-Ende)
  und unmittelbar VOR dieser Latte installiert wird. Die Gegenprobe mit
  deaktiviertem Sampler zeigt den Stall unverändert. **Nicht die Ursache** — die
  Dauer-Schleife bleibt als eigenständiger Nebenbefund festzuhalten (sie belastet
  jede gedrosselte Messung nach ihrer Installation), aber sie erklärt diesen
  Befund nicht.

**Ursache offen.** Nicht ermittelt wurde, welche Arbeit die ~12 s
un-gedrosselter Rechenzeit trägt (Verdachtsfeld: der per `useDeferredValue`
entkoppelte ~4-MB-Artikel-Index-Pfad, der genau einmal je Query-Zustand rechnet).
Ein Profiling-Lauf steht aus.

**Auffällige Nachbarschaft, ausdrücklich als HYPOTHESE (§8, nicht als belegte
Identität).** Die Signatur — streng bimodal, hoher Modus ~11–12 s
un-gedrosselt, nichts dazwischen, unabhängig von der Maschinen-Geschwindigkeit —
gleicht dem offenen `QS-PERF`-Befund «**OR-LCP ist bimodal — Ursache offen**»
(20.7.2026: `/gesetze/bund/OR` misst LCP entweder ~3.5 s oder ~11.3–11.6 s).
Wenn beides dieselbe Wurzel hat, ist sie hier **lokal reproduzierbar**, was für
den LCP-Befund bisher nicht gelang. Das ist eine Spur, kein Beweis.

**Warum nicht gehärtet.** Eine höhere Latte hätte genau den Lag verdeckt, den
dieser Test messen soll («Interaktion flüssig unter Drossel, ohne Timeout-Nähe»).
Der 12-s-Deckel hat hier korrekt gemeldet; das Problem liegt nicht in seiner
Kalibrierung. `e2e/norm-sprung.e2e.ts` bleibt darum in diesem Arbeitsgang
**byte-gleich unverändert** (§1: Treue vor grünem CI).

**Nebenbefund, ebenfalls nicht angetastet.** Die Pfeil-Navigations-Latte
(`aria-activedescendant`, Deckel 12 s) läuft in jedem gemessenen Lauf bei
**56–99 % ihres Budgets** (6698 · 7288 · 9482 · 10 433 · 10 511 · 10 780 ·
11 940 ms). Das ist ein echter Kandidat für eine Kalibrierung — aber erst,
**nachdem** der Stall verstanden ist, sonst kalibriert man dieselbe Erscheinung
zweimal weg.

---

## 4. Was offen bleibt

- **Ursache des bimodalen Stalls** (§3) — Profiling ausstehend; solange offen,
  ist `norm-sprung` A9 auf langsamer Hardware weiter rot-anfällig, und das ist
  **gewollt** (der Test meldet einen echten Zustand).
- **Dauer-rAF-Sampler in `e2e/helpers/cls.ts`** — belastet jede gedrosselte
  Messung nach seiner Installation mit einem erzwungenen Layout je Frame. Als
  Diagnose-Werkzeug gebaut, läuft er ohne Abschalt-Bedingung bis Test-Ende.
  Nicht Ursache des §3-Befunds, aber ein eigener Prüf-Genauigkeits-Posten.
- **Pfeil-Navigations-Latte** — marginal (§3 Nebenbefund), bewusst zurückgestellt.
- **Kalibrier-Höhen 8000 / 30 000 ms auf dem echten 2-vCPU-Runner** nicht
  gegengemessen; sie stützen sich auf die belegten CI-Werte plus die eigene
  4-vCPU-Reihe plus den dokumentierten CI-Faktor. Hält die Kalibrierung nicht,
  ist der nächste Schritt eine gemessene Runner-Reihe (Muster
  `perf-kalibrierung.yml`), **nicht** ein weiteres Anheben.
