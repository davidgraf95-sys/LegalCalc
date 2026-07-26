# e2e-Flake-Forensik — drei 2-vCPU-Rotfälle: zwei kalibriert, einer an der Ursache behoben (26.7.2026)

**Erstellt:** 26.7.2026, Auftrag David («Härtung im 1bcca6b3-Muster» für drei als
2-vCPU-flaky belegte e2e-Tests; Nachtrag desselben Tags: «mache es so, dass alles
grün ist» — was den dritten Fall von «dokumentieren» auf «Ursache finden» hob).
Verortung `QS-PERF`. Anlass-Dossier:
[AUDIT-TORE-2026-07-20.md](../register/AUDIT-TORE-2026-07-20.md) — 11 von 17
roten CI-Läufen kamen aus e2e-Shards.
**Status:** ERSTRECHERCHE (eigene Messreihen, je 4 Läufe; die Kalibrier-Höhen
folgen der Revisions-Politik `QS-PERF` Ziff. 5. Fachliche Abnahme durch David
offen. Der Befund in §3 ist **aufgeklärt und behoben** — die Rest-Perf-Frage
daraus ist benannt und bleibt offen.)

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
| `norm-sprung` A9 Suchtreffer-Latte | lokal unter Host-Last rot | **WIDERLEGT als Kalibrierfrage — Ursache gefunden und behoben:** der Warmlauf des Tests wartete auf das falsche Ladesignal, dadurch fiel der Einmal-Load des Artikel-Index in die gedrosselte Messphase (§3). Deckel byte-gleich, Test 44/44 grün |

Die dritte Zeile ist der wichtigste Befund. Eine höhere Latte hätte hier nichts
geheilt, sondern einen echten Messfehler zementiert — und zwar in beide
Richtungen: der Test hätte weiter Ladezeit statt Interaktions-Lag gemessen, nur
ohne davon rot zu werden.

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
## 3. Aufgeklärt und behoben: der bimodale ~48-s-Stall in `norm-sprung` A9

**Gemeldet war** ein lokaler Host-Last-Flake («Suchtreffer-Listbox nicht in
12 s», auf ruhiger Maschine 4.7 s). **Gemessen wurde etwas anderes**, und die
Ursache liegt im Test selbst — nicht in einem zu knappen Deckel und nicht in
einem Interaktions-Lag der App.

### 3.1 Der Befund

Die erste gedrosselte Such-Latte im A9-Test (`feld.fill('OR 257d')` → «Sprung»
sichtbar, direkt nach dem Query-Reset), CI-Zweig, `workers=1`, ohne Contention:

| Konfiguration | latch-1 «Sprung» sichtbar (ms) |
|---|---|
| unverändert (CLS-Höhen-Sampler aktiv) | **48 241** · 604 · **49 585** · **48 619** |
| Gegenprobe: Sampler deaktiviert | 720 · 770 · **47 887** · 400 |

Zwei Modi, nichts dazwischen über 8 Beobachtungen: entweder ~0.4–0.8 s oder
~48–50 s. Bei 4× Drossel entsprechen ~48 s etwa **12 s un-gedrosselter
Rechenzeit**. Die unmittelbar folgende, **identische** zweite Latte braucht in
jedem Lauf 0.29–0.40 s — die Arbeit fällt also genau einmal an.

Auf dem echten 2-vCPU-Runner riss der Test damit **alle drei Versuche**
(Original + Retry 1 + Retry 2, PR #382 Shard 7/8, `element(s) not found`) — die
drei Retries können den langsamen Modus nicht wegwiederholen, wenn er dreimal
trifft. Auf `main` ging derselbe Test durch, weil dort mindestens ein Versuch
den schnellen Modus erwischte. Dieselbe Erscheinung, anderer Würfelwurf.

### 3.2 Was als Ursache ausgeschlossen wurde (gemessen, nicht vermutet)

- **Host-Last / Worker-Contention** — alle Läufe `workers=1`, keine
  Parallel-Last; der Stall tritt trotzdem auf.
- **Test-Instrumentierung** — der Verdacht lag nahe, weil
  `clsBeobachtenInstallieren` (`e2e/helpers/cls.ts`) eine **unbegrenzte
  rAF-Schleife** startet, die pro Frame `getBoundingClientRect()` auf 13
  Elementen aufruft (erzwungenes Layout je Frame) und unmittelbar VOR dieser
  Latte installiert wird. Die Gegenprobe mit deaktiviertem Sampler zeigt den
  Stall unverändert. **Nicht die Ursache** — die Dauer-Schleife bleibt als
  eigenständiger Nebenbefund bestehen (sie belastet jede gedrosselte Messung
  nach ihrer Installation), erklärt diesen Befund aber nicht.

### 3.3 Die Ursache

Der Warmlauf des Tests wartete auf das **falsche Ladesignal**. Er wartete auf
den «Sprung»-Treffer — aber der ist der DETERMINISTISCHE Norm-Sprung aus
Register/Parser und steht schon, **während der ~4-MB-Artikel-Index noch lädt**.
Der Kontrakt des Tests verlangt ausdrücklich das Gegenteil: «auf dem WARMEN
Index, NICHT Kaltstart unter Drossel».

Direkt gemessen, wie viel Ladearbeit nach dem Erscheinen von «Sprung» noch
offen ist (Warten auf die sichtbare Ergebnis-Kopfzeile = `allesGeladen`):

```
warmlauf-restlast   11 586 · 13 065 · 13 546 · 14 484 ms   (un-gedrosselt)
```

Das sind genau die ~12 s, die vorher in die gedrosselte Messphase rutschten und
dort — mit 4× multipliziert — als ~48-s-Stall erschienen. **Die Bimodalität ist
das Rennen** zwischen diesem Einmal-Load und dem Query-Reset: wurde der Load
vorher fertig, misst der Test 0.5 s; wurde er es nicht, zahlt die Messphase ihn
gedrosselt nach. Nichts dazwischen, weil es zwei Zustände sind und nicht ein
Kontinuum.

**Zwei Präzisierungen aus der delegierten Code-Analyse** (Messungen mit wörtlich
repliziertem Aufbau-Code gegen den echten Index, dieselbe Maschinenklasse):

- **Der Index wird NICHT erneut angestossen.** `artikelVolltext.ts:41–62` hält
  eine modulweite In-flight-Promise-Memoisierung (`ladePromise`), und die
  Suchleiste hängt in der persistenten App-Shell (`Topbar.tsx:93` →
  `Shell.tsx:339`), nicht in einer Route. Query-Reset und Unmount des
  Ergebnisbaums (`SuchResultate.tsx:195`) verlieren den Index also nicht. Die
  naheliegende Vermutung «der Reset löst die Arbeit neu aus» ist **widerlegt** —
  das Rennen ist ein Timing-Rennen mit EINEM Load, kein Doppel-Load.
- **Der Aufbau ist ZWEISTUFIG, und die Kopfzeile bindet nur die erste Stufe.**
  Gemessen un-gedrosselt: `ergaenze('bund')` **13 480 ms als ein einziger,
  nicht unterbrechbarer Task** (`artikelVolltext.ts:308`), danach
  `ergaenzeGestaffelt('kanton')` **15 023 ms in 16 Häppchen à 324–1 386 ms**
  (`:320–328`). Die zweite Stufe setzt `unvollstaendig`, NICHT `laedt`
  (`universalSuche.ts:286` vs. `:292`) — `allesGeladen` erfasst sie darum nicht.
  Der Fix unten wartet deshalb auf ZWEI Signale, nicht nur auf die Kopfzeile.

Welche der beiden Stufen im langsamen Modus im Drossel-Fenster lag, ist **nicht
ermittelt** (13.5 s und 15.0 s passen beide numerisch auf die zurückgerechneten
~12 s). Das entscheidet nur ein Chromium-Trace mit Long-Task-Attribution.

**Korrektur einer tragenden Zahl (§5).** Der Index ist **nicht «~4 MB»**, wie
rund zehn Kommentare im Repo behaupten (u. a. `useUniversalSuche.ts:128,131`,
`norm-sprung.e2e.ts`, `gesetze-ia-v2-walks.e2e.ts:18,45`), sondern
**47 964 020 Bytes = 45.7 MiB** roh mit 54 444 Einträgen (~9.7 MB gzip — so
beziffert es `scripts/check-perf-budget.ts:92` korrekt). Faktor ~11 daneben. Die
falsche Grössenordnung hat die Fehlersuche in die falsche Richtung gelenkt: bei
«4 MB» wirkt ein 13-Sekunden-Aufbau unplausibel und man sucht die Ursache
woanders. Als offener Posten notiert.

### 3.4 Der Fix

Der Warmlauf wartet jetzt auf den Ladezustand, den er zu erreichen behauptet:
(a) die sichtbare Ergebnis-Kopfzeile erscheint erst, wenn jede `laedt`-Gruppe
fertig ist (`SuchResultate.tsx` hält den reservierten Slot bis dahin auf
`invisible`), und (b) der Vorbehalt «wird noch ergänzt», den die Kopfzeile bei
`waechstNoch` anhängt, ist verschwunden — das ist das einzige im DOM sichtbare
Signal für das Ende der gestaffelten zweiten Aufbaustufe. Ohne (b) blieb ein
Rest der zweiten Stufe im gedrosselten Fenster und damit ein Rest des Rennens.

Das **verschärft** die Prüfung, statt sie zu lockern:

| | vorher | nachher |
|---|---|---|
| gedrosselte Latten | 12 000 / 15 000 ms | **byte-gleich** unverändert |
| erste Such-Latte löst auf in | 0.5 s **oder** 48 s (Münzwurf) | 454 · 540 · 359 · 531 ms |
| Ausnutzung des 12-s-Budgets | 4 % oder Riss | **~4 %, stabil** |
| Spec-Lauf `--retries=0`, 4 Wiederholungen | riss reihum | **44/44 grün** |

Kein `expect` entfernt, kein Budget gehoben, keine Prüfaussage geändert (§6.3).
Die A9-Aussage «Interaktion flüssig unter Drossel, ohne Timeout-Nähe» wird jetzt
überhaupt erst gemessen — vorher mass der Test in einem von zwei Fällen
Ladezeit, die sein eigener Kontrakt ausschliesst.

### 3.5 Was daraus als Perf-Frage bleibt (offen)

Der Fix korrigiert die MESSUNG, nicht die Ladekosten. Die ~12 s
un-gedrosselter Rechenzeit für Artikel-Index + Manifeste sind ein reales
Ladekosten-Faktum auf langsamer Hardware und gehören als solches zu `QS-PERF`
(Strang c, Suchindex/Sharding) — nicht in den A9-Interaktionstest, der sie laut
Kontrakt ausschliesst. Was diese Zeit im Detail verbraucht (Fetch, Parse,
Index-Aufbau) ist hier NICHT ermittelt.

**Auffällige Nachbarschaft, weiterhin als Hypothese (§8).** Der offene
`QS-PERF`-Befund «OR-LCP ist bimodal» zeigt dieselbe Signatur-Klasse (streng
bimodal, hoher Modus ~11–12 s, nichts dazwischen; im `main`-Lauf 30214798195
protokolliert als «LCP: 11.3 · 3.4 · 11.2 s»). Hier ist der Mechanismus jetzt
BENANNT: ein asynchroner Einmal-Load, der je nach Timing innerhalb oder
ausserhalb des Messfensters landet. Ob der LCP-Fall dieselbe Wurzel hat, ist
damit eine prüfbare Frage geworden — beantwortet ist sie nicht.

**Nebenbefund, jetzt entschärft.** Die Pfeil-Navigations-Latte
(`aria-activedescendant`, Deckel 12 s) lag in der Messreihe MIT dem Lade-Leck bei
56–99 % ihres Budgets (6698 – 11 940 ms). Mit korrektem Warmlauf ist auch diese
Belastung weg; der Deckel braucht keine Kalibrierung. Er wäre sonst zum zweiten
Mal auf dieselbe Erscheinung angepasst worden.


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
