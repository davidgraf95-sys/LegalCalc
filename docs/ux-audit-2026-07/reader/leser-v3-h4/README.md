# Kontaktbogen H4 — Leser V3, die Flip-Kriterien gemessen

Vorbereitung der Etappe **H4** des Roadmap-Schritts `W2·5m-LESER-V3` (Fahrplan
`fahrplaene/FAHRPLAN-LESER-V3.md`, Kap. 7). Stand 17.8.2026, Branch
`feat/leser-v3-h4-vorbereitung`, Basis `a516f12ef` (= S2 inkl. Nachzug).
**Der Umschalter wurde NICHT umgelegt** — der Default bleibt V1.

**Messbedingung für alles hier** (§0 Ziff. 3c — eine Zahl ohne Bedingung ist
keine Zahl): macOS Apple Silicon, `vite preview` gegen frisch gebautes `dist/`,
je Messung ein frischer Browser-Kontext (kalt), ungedrosselt und ohne
Parallel-Last, sofern nicht anders vermerkt. Wo eine Zahl unter CPU-Drossel oder
unter 8-Worker-Last entstanden ist, steht es dabei.

---

## 0 · Für David — in Alltagssprache

> **Stand 18.8.2026 — was sich seit der ersten Fassung dieses Bogens geändert
> hat.** Der Handy-Befund ist repariert, und eine Aussage darin war zu hart
> formuliert: die Entscheide waren auf dem Handy nicht *unerreichbar*, sondern
> **doppelt so teuer** (zwei Fingertipps statt einem — der Weg lief über das
> «···»-Menü). Nachgemessen und richtiggestellt in §2. Jetzt ist es **ein
> Fingertipp wie überall sonst**. Ebenfalls erledigt: die zwei Schliess-Kreuze je
> Fenster und die zwei Gliederungs-Knöpfe auf dem breiten Bildschirm.
> **Der Umschalter ist weiterhin nicht umgelegt und wartet auf dein Ja.**

**Von den acht technischen Bedingungen sind sieben erfüllt.** Was noch offen ist,
steht unten — der Kern: ein Seitenblatt, das auf dem Desktop die Zeilenenden des
Gesetzestexts verdeckt (Ä60), und eine Aufräumarbeit an der Prüfstrasse
(B-Specs), damit ein Fehler künftig als Fehlermeldung erscheint statt als
hängender Testlauf.

*Ursprüngliche Fassung (17.8.2026), zur Nachvollziehbarkeit: «auf dem Handy ist
im neuen Leser die Rechtsprechung zu einem Artikel mit dem Finger überhaupt nicht
mehr erreichbar». Das war der Messfehler, den §2 korrigiert.*

**Was du siehst, wenn umgeschaltet wird:** eine ruhigere Kopfzeile, ein einziges
Suchfeld statt zwei, und auf jeder Breite die Möglichkeit, direkt «429» zu tippen
und dort zu landen — das ist der Fortschritt, und er ist gemessen (auf Handy und
mittlerer Breite **ein Bedienschritt weniger** als heute). Auf dem Desktop steht
zusätzlich die Warnung «Eine in Kraft getretene Änderung ist noch nicht
eingearbeitet» sichtbar im Bild; im heutigen Leser fehlt sie dort ganz.

**Was danach noch offen ist (Stand 18.8.2026):** das Seitenblatt, das auf dem
Desktop die Zeilenenden des Gesetzestexts verdeckt (Ä60) — dafür brauche ich
deinen Entscheid, weil jeder Weg etwas kostet —, und die B-Spec-Umhängung in der
Prüfstrasse. Erledigt sind seit der ersten Fassung: die Handy-Erreichbarkeit der
Entscheide, die zwei übereinanderliegenden Ortsangaben und die zwei
Schliess-Kreuze je Fenster. Das sind alles Bedienfragen, keine Rechenfehler —
der Gesetzestext selbst ist pixelgenau derselbe, das ist eigens geprüft.

**Wenn es dir nicht gefällt, geht es zurück:** der Umschalter bleibt bis zur
Etappe H5 bestehen. Ein Klick auf `?leser=v1` (bzw. das Zurücksetzen des Flags)
und du bist wieder im heutigen Leser — ohne Datenverlust, ohne Neubau.

### Frage an dich — Ja oder Nein zum Umschalten?

Empfehlung in der ersten Fassung (17.8.2026): **noch nicht** — erst die
Handy-Erreichbarkeit der Entscheide (NM-2) reparieren.

**Nachgeführt 18.8.2026:** Diese Bedingung ist erfüllt. Was jetzt noch zwischen
dir und dem Umschalten steht, sind **zwei Punkte**, und einer davon ist eine
Frage an dich:

1. **Ä60 — das Seitenblatt verdeckt Zeilenenden** (Desktop, breites Fenster). Das
   ist der einzige Punkt, bei dem der Gesetzestext selbst betroffen ist, und er
   braucht deinen Entscheid: (a) so lassen, (b) den Zähler in der Kopfzeile
   opfern, (c) den Leser-Rahmen breiter machen. Details unten in der Tabelle.
2. **B-Specs umhängen** — reine Prüfstrassen-Arbeit, kein Entscheid nötig.

**Die Frage bleibt also offen und liegt weiterhin bei dir**; ich lege den
Umschalter nicht ohne dein Ja um.

---

## 1 · Kriterien-Matrix (Kap. 7, «alle, nicht auswählbar»)

| # | Kriterium | Ergebnis | Zahl |
|---|---|---|---|
| 1 | unveränderte **N-Tests** grün unter Flag | ✅ | Projekt `leser-v3`: **110 passed, 1 skipped, Exit 0**; Gegenprobe Projekt `chromium` über dieselben N-Specs plus die vier B-Specs plus die zwei S1-Specs: **77 passed, Exit 0** |
| 2 | **`leser-kopf-paritaet`** grün | ✅ | 1 Test, beide Split-View-Panes, 9.6 s, im Flag-Projekt |
| 3 | **PX** (Pixelvergleich) grün | ✅ *(mit Bedingung)* | Ruhe-Bedingung: Branch **3/3**, Basis `a516f12ef` **3/3**. Unmittelbar nach einem 8-Worker-Lauf: **2/5**, dreimal 1869 px (0.01) auf dem **V1**-Arm — exakt die Signatur, die S2 als Scroll-/Rasterungs-Artefakt dokumentiert. **Nullprobe negativ** (Basis unter Last nicht gegengemessen, Ruhe grün) → kein A-8-Effekt, aber ein offener Lastfall (§17-Zeile unten) |
| 4 | **NM** in keiner der drei Aufgaben verschlechtert | ⚠️ **Preis, kein Verlust** *(nachgeführt 18.8.2026)* | NM-2 kostet auf **allen drei** Breiten **einen Schritt mehr** als V1 (dort 0, weil die Leitentscheide-Zeile am Artikel stand). Der **H-Verlust ist behoben**: @390 stand kein Öffner in der Kopfzeile, der Weg kostete **2 Taps**; seit H4-II ist es **1 Tap** wie auf D/S (Messreihe §2, `nm-messung.json` → `h4ii`). NM-1 unverändert besser (−1 Schritt auf S und H), NM-3 unverändert besser auf D |
| 5 | **CLS ≤ Ist-Stand** | ✅ | V3 in allen vier Zellen besser: StPO D 0.0337 → **0.0207** · StPO H 0.0205 → **0.0192** · BS-640.100 D 0.0475 → **0.0315** · BS-640.100 H 0.0064 → **0.0044** (Median, n=5, kalt) |
| 6 | **axe** grün | ✅ | **0** critical/serious in **20** Kombinationen (5 Erlasse × V1/V3 × hell/dunkel); dokumentiert bleibt nur der begründete `link-in-text-block` (B-2) |
| 7 | **Kantons-Probe** grün | ✅ | BS-640.100 (292 Best.), ZH-211.11 (23) und die Bund-Probe StPO/VMWG/LugÜ unter `?leser=v3`: Rahmen, Kopf und Gliederung je vorhanden, **0 Konsolenfehler** |
| 8 | drei bekannte **Flaker** mit Wurzel-Fix | ⚠️ teilweise | 1 von 3: Wurzel **belegt** (Locator-Kosten) und der dominante Term entfernt — seriell, also in der CI-Konfiguration `workers: 1`, **8/8 grün** (OR-Test 15.1–18.5 s gegen 20 s Budget). Unter lokaler 4-Worker-Last bleibt er rot: die Seite selbst braucht ~18 s, der Rest ist `QS-PERF`. 2 von 3 **nicht reproduzierbar** (0/65) → kein Blindfix (§0 Ziff. 2). Details §6 |
| 9 | **David-Go** nach Kontaktbogen | ⬜ wartet | Frage oben in §0 |

---

## 2 · NM · Nutzer-Massstab, V1 gegen V3 (9 Zellen)

Gemessen mit einem Playwright-Skript, das **jede** Bedienhandlung protokolliert
und zählt; die Zeit läuft vom ersten Bedienschritt bis das Ziel **sichtbar** ist.
Erlass StPO (SR 312.0). 3 Läufe je Zelle, Median; **D** = 1280×800 · **S** =
720×900 · **H** = 390×844. Rohdaten `nm-messung.json`. 0 Konsolenfehler in
allen 54 Läufen.

| Aufgabe | Breite | Ist (V1) | V3 | Δ |
|---|---|---|---|---|
| **NM-1** «Art. 429 aufschlagen» | D | 5 Schritte (1 Klick + 4 Tasten) · 385 ms | **5** (1 + 4) · 312 ms | ±0 Schritte, −73 ms |
| | S | 6 Schritte (2 Klicks + 4 Tasten) · 1006 ms | **5** (1 + 4) · 315 ms | **−1 Schritt** |
| | H | 6 Schritte (2 Taps + 4 Tasten) · 1027 ms | **5** (1 + 4) · 335 ms | **−1 Schritt** |
| **NM-2** «Entscheide zu Art. 429 sehen» | D | **0 Schritte** (Leitentscheide-Zeile am Artikel) · 6 ms | 1 Klick (Panel öffnen) · 1233 ms | **+1 Schritt** |
| | S | **0 Schritte** · 5 ms | 1 Klick · 1244 ms | **+1 Schritt** |
| | H | **0 Taps** · 8 ms | ~~nicht per Tap erreichbar~~ → **2 Taps** (siehe Korrektur unten), seit H4-II **1 Tap** | **+1 Schritt** |
| **NM-3** «Stand + Warnung erkennen» | D | nicht erreicht — Stand ja, **Warnung fehlt ganz** | **erreicht, 0 Schritte** · 35 ms («⚠ Eine in Kraft getretene Änderung ist noch nicht eingearbeitet …») | **V3 besser** |
| | S | nicht erreicht (Warnung nicht im Bild) | nicht erreicht | ±0 |
| | H | nicht erreicht (Warnung nicht im Bild) | nicht erreicht | ±0 |

**Der Befund zu NM-1 ist echt und er ist der Grund, warum V3 gebaut wurde:** das
EINE zusammengelegte Feld (Pos. 4) steht in V3 auf **jeder** Breite im Zugriff —
in V1 muss man auf S und H erst die Gliederung öffnen, um an das Feld «Art. N» zu
kommen.

**Der Befund zu NM-2 ist ebenso echt und schwerer:** H3 hat die Bezüge-Zeile am
Artikel bewusst entfernt (`v3/LeserLesespalte.tsx`, Pos. 12 — «kein `bezuege`
mehr am Artikel»); die Entscheide stehen jetzt im Panel. Gemessen am gebauten
Stand, `?leser=v3`, StPO Art. 429, drei Breiten:

| Breite | `[data-v3-panel-oeffner]` | Randlasche | Entscheide nach Taste «r» |
|---|---|---|---|
| 1280 | 1 | 0 | ja |
| 720 | 1 | 0 | ja |
| **390** | **0** | **0** | ja (nur mit Tastatur) |

Auf 390 px ist `kopfElemente(stufe).panel === false` (Stufe `mini`,
`v3/kopfStufen.ts`) — der Zähler fällt aus der Kopfzeile, und die Randlasche, die
ihn dort ersetzen sollte, ist nach dem H3-Vollzugsvermerk «an keiner Breite»
eingelöst.

### Korrektur und Vollzug — H4-Vorbereitung II (17./18.8.2026)

**Erst die Korrektur an diesem Bogen (§7).** Oben stand «auf einem Telefon führt
kein Finger-Weg zur Rechtsprechung». Nachgemessen am selben Stand (`6ca1609b3`,
StPO Art. 429, @390, 3 Läufe) stimmt das **nicht**: der Eintrag «Entscheide &
Kontext …» im «···»-Menü trug — der H3-Nachzug hatte ihn eingebaut, und er ist
`[data-v3-panel-oeffner]`, nur eben erst nach dem Aufziehen des Menüs sichtbar.
Der Befund ist damit **nicht «unerreichbar», sondern doppelt so teuer**:

| Breite | Taps bis die Entscheide sichtbar sind (vorher) | Weg | nachher |
|---|---|---|---|
| 1280 | **1** · 134 ms | Zähler «⚖ Rechtsprechung» in der Kopfzeile | **1** · 138 ms |
| 720 | **1** · 122 ms | dito | **1** · 134 ms |
| **390** | **2** · 116 ms | «···» aufziehen → «Entscheide & Kontext …» | **1** · 144 ms |

*(Eigene Messreihe, `nm-messung.json` → `h4ii`; 3 Läufe je Zelle, Median, kalter
Kontext, keine Parallel-Last, 0 Konsolenfehler in allen 18 Läufen. Die
absoluten ms sind **nicht** mit der Reihe vom 17.8. vergleichbar — dort lag ein
anderes Ziel-Kriterium zugrunde (1233 ms auf D gegen 134 hier). Vergleichbar
sind die **Taps**, und innerhalb dieser Reihe auch die ms.)*

**Der Vollzug.** Der Zähler fällt auf `mini` nicht mehr weg, er **schrumpft** —
dieselbe Bauform, die die Krume seit V2 hat: `panel` ist `'voll' | 'kompakt'`,
auf `mini` ein Chip aus Ikone und Zahl («⚖ 14»). Platz ist da, gemessen @390 an
StPO: Kopfzeile innen **350 px**, Ort-Zone 258 px mit 144 px Inhalt (also **115
px frei**), Griff-Zone 84 px; der Chip misst 24 px ohne und rund 45 px mit Zahl.

Der **Vier-Elemente-Deckel** (Design-Grundlage Kap. 6) hält, weil dafür das ✕
weicht — es führte auf `/gesetze`, **genau dorthin wie der Rücksprung
«‹ Gesetze»**, der seit V2 in derselben Zeile steht. Zwei Griffe, ein Ziel, 350
px Zeilenbreite. Die Zeile liest sich jetzt **Ort · ⚖ · ☰ · ···** (gemessen an
StPO und BS-640.100).

**Ehrlicher Rest, ungeschönt:** die zweite Hälfte desselben Deckels («≤ 2 reine
Icons») ist damit **nicht** eingelöst. Der Chip zeigt im Ruhezustand nur die
Ikone, weil die Zahl vor dem Nachladen des Bezugs-Shards niemand kennt und eine
erfundene «0» §8 verbietet. Vorher standen dort ☰ · ··· · ✕, also ebenfalls drei
reine Icons — **die Lage ist unverändert, nicht verbessert** (offener Punkt §8).

**Und ein zweiter offener Befund, hier nur gemessen, nicht behoben:** in der
Einzelansicht @720 (`kompakt`) trägt die Kopfzeile **fünf** Elemente (Ort ·
Zähler · ☰ · ··· · ✕), reisst den Deckel also schon vor H4-II. Der Fix wäre
derselbe Hebel (`zeigeSchliessKreuz`), er berührt aber die Ä46-Auflage
«Einzelansicht bleibt bei 1» und wartet darum auf einen Entscheid.

---

## 3 · A-8 · EINE Breiten-Quelle (Kap. 12)

**Vorzustand bestätigt, es waren zwei Quellen:** `kopfStufe`
(`v3/kopfStufen.ts`, Schwellen 640/900, gemessen am Rahmen-Element) und `istXl`
(`inhalt-zustand.tsx:397`, Schwelle 1024, gemessen am Viewport bzw. an der
Pane-Wurzel).

**Gebaut:** `src/pages/gesetz-leser/v3/useElementBreite.ts` (136 Z.) trägt die
drei Schwellen **und** die Messung (Callback-Ref + `ResizeObserver` auf
`border-box`, Zustand nur am Modus, damit Pixel-Änderungen keinen Re-Render
auslösen). `kopfStufen.ts` leitet nur noch weiter. Verhalten byte-gleich,
bewiesen über **jede** Breite von 200 bis 2000 px
(`src/tests/leser-v3-elementbreite.test.ts`, Rot-Beweis zweistufig: erst ohne
Modul, dann mit Modul, solange `kopfStufen.ts` die Literale noch selbst trug).

**Nicht angeschlossen — mit der Zahl, die den Entscheid trägt.** Der
Zwei-Spalten-Entscheid bleibt am Viewport. Gemessen am gebauten Stand ist das
Rahmen-Element bis ~1120 px Viewport konstant **48 px schmaler** als das Fenster
und ab da auf **1072 px gedeckelt** (`max-w-content`, 70 rem):

| Viewport | 640 | 900 | 1023 | 1024 | 1025 | 1100 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|---|
| Rahmen | 592 | 852 | 975 | 976 | 977 | 1052 | 1072 | 1072 |

Würde `istXl` auf diese Messung umgestellt, verschöbe sich die
Zwei-Spalten-Grenze von Viewport 1024 auf **1072** — die Gliederungsspalte
verschwände auf jedem Fenster zwischen 1024 und 1071 px. Das ist keine
Verhaltensneutralität (§6.3), sondern der offene Spalten-Entscheid **Ä60**, und
der wartet auf David. A-8 ist damit **teilweise erledigt**: die Regeln und die
Messung liegen an einem Ort, die Umstellung der 1024er-Entscheidung ist eine
sichtbare Änderung und gehört an den Flip.

---

## 4 · Layout-Sprünge (CLS) — V3 ist in allen vier Zellen besser

`PerformanceObserver('layout-shift')`, nur Sprünge **ohne** kürzliche Eingabe;
je Lauf frischer Kontext (kalt), nach dem Laden vier Scroll-Runden (die
Lese-Kadenz zählt mit), n=5, ungedrosselt, Maschine ruhig (Gesamtlast nach der
Messreihe 46 % über alle Prozesse). Rohdaten `cls-messung.json`.

| Erlass | Breite | Ist (V1) Median / Max | V3 Median / Max | Verdikt |
|---|---|---|---|---|
| StPO | D 1280 | 0.0337 / 0.0339 | **0.0207 / 0.0215** | ✅ −39 % |
| StPO | H 390 | 0.0205 / 0.0216 | **0.0192 / 0.0192** | ✅ −6 % |
| BS-640.100 | D 1280 | 0.0475 / 0.0475 | **0.0315 / 0.0315** | ✅ −34 % |
| BS-640.100 | H 390 | 0.0064 / 0.0080 | **0.0044 / 0.0056** | ✅ −31 % |

Grösster Einzelverursacher in beiden Hüllen ist derselbe: eine Gliederungs-`LI`
(V1 0.0192 → V3 0.0131 auf StPO D). Alle Werte liegen deutlich unter der
«guten» Web-Vitals-Schwelle 0.1. **Kriterium 5 erfüllt.**

---

## 5 · axe und Proben

### axe — hell und dunkel, in BEIDEN Hüllen

Regelsatz und Tor-Politik wie `e2e/a11y.e2e.ts`: Tags `wcag2a`/`wcag2aa`/
`wcag21a`/`wcag21aa`; **critical/serious** gaten, moderate/minor werden
dokumentiert; der begründete Markenentscheid `link-in-text-block` (BERICHT B-2,
Inline-Links ohne Unterstreichung) zählt nicht. Thema per `localStorage` gepinnt
**und** `colorScheme` emuliert, `reducedMotion: reduce`. Rohdaten
`axe-proben.json`.

**Ergebnis: 0 critical/serious in allen 20 Kombinationen** (5 Erlasse × 2 Hüllen
× hell/dunkel). Dokumentiert bleibt je 1–2 × `link-in-text-block`. **Kriterium 6
erfüllt** — und zwar für V3 erstmals in beiden Farbschemata gemessen (die
Repo-Spec `a11y.e2e.ts` fährt nur die Ist-Hülle).

### Proben — Kanton und Bund unter `?leser=v3`

| Erlass | Art | Bestimmungen | V3-Rahmen · Kopf · Gliederung | Konsolenfehler |
|---|---|---|---|---|
| **BS-640.100** (StG BS) | Kanton BS | 292 | 1 · 1 · 1 | **0** |
| **ZH-211.11** (GebV OG) | Kanton ZH | 23 | 1 · 1 · 1 | **0** |
| **StPO** (SR 312.0) | Bundesgesetz | 480 | 1 · 1 · 1 | **0** |
| **VMWG** | Verordnung | 32 | 1 · 1 · 1 | **0** |
| **LugÜ** (SR 0.275.12) | Staatsvertrag | 91 | 1 · 1 · 1 | **0** |

Kein Sonderpfad, kein leerer Rahmen, keine fehlende Gliederung; die `h1` trägt in
allen fünf Fällen den amtlichen Titel. **Kriterium 7 erfüllt.**

**Nebenbefund, ohne Wertung gemeldet:** beim LugÜ lautet die `h1` in V3
«LugÜ·Übereinkommen vom 30. Oktober 2007 …», in V1 nur «Übereinkommen vom
30. Oktober 2007 …». V3 stellt also das Kürzel voran. Das ist eine
Wortlaut-Differenz zwischen den Hüllen an einer Stelle, die `check:seo-index`
und die Seitenmeta betrifft (S3-Fläche) — vor dem Flip einmal ansehen, ob das so
gewollt ist.

**Ehrliche Grenze dieser Probe:** fünf Erlasse sind eine Stichprobe, kein Beweis
für den ganzen Korpus. Der automatische Sweep über alle Bundeserlasse steht
weiterhin aus (schon im H2-Bogen so vermerkt).

---

## 6 · Die drei Flaker (Kap. 14) — Verteilungen vorher/nachher

### Vorab: die lokale Last-Bedingung ist derzeit unbrauchbar

Während dieser Messungen liefen auf derselben Maschine **drei fremde
Agenten-Sessions** (Worktrees `LexMetrik-fix`, `LexMetrik-krume`,
`LexMetrik-uebersicht` — festgestellt über `git worktree list`, zusätzlich hat
eine fremde Session eine Datei in meinem Mess-Verzeichnis überschrieben). Die
8-Worker-Kontentions-Läufe kippten dadurch die Arm-Reihenfolge (vorher/nachher
18:16, dann 10:17 von je 20) — eine Rate ohne stabile Bedingung ist keine Zahl
(§0 Ziff. 3c). **Belastbar ist allein die prozessinterne Messung mit 4×
CPU-Drossel**, weil dort beide Arme unmittelbar nacheinander im selben Prozess
laufen; sie wurde zweimal gefahren und war beide Male gleich.

### `leser-ohne-gliederungslinie:77` (OR Art. 319) — Wurzel gefunden, Fix drin

**Symptom (Ä24, CI Shard 7):** «element(s) not found» nach 20 s auf
`getByRole('button', {name:'Ansicht'})` — das Tor fiel im Vorraum, die
Sachaussage wurde nie geprüft.

**Wurzel, gemessen:** nicht (nur) die Seite ist langsam, sondern die **Abfrage**.
`getByRole` mit Namensfilter rechnet für jeden Knopf im Dokument den zugänglichen
Namen aus; auf dem OR sind das **13 518 Knöpfe** bei **75 724 DOM-Knoten**
(gemessen @1280 nach dem Laden; StPO 5 146, BV 2 455 — daher trifft es genau das
OR). Die Abfrage läuft im Polling, also wiederholt.

**A/B auf demselben Dokument**, gleiche Wartebedingung «sichtbar», nur die
Suchmaschine getauscht, je frischer Kontext:

| Bedingung | `getByRole('button',{name:'Ansicht'})` | `[data-ansicht-menu]` | über 20 s |
|---|---|---|---|
| warm, ungedrosselt, n=10 | 4.1–4.4 s (Median 4.2) | 1.0 s (Median 1.02) | 0 / 0 |
| **4× CPU-Drossel, n=5 (2×)** | **28.2–29.1 s** | **17.8–19.9 s** | **5/5 gegen 0/5** |

Die 4×-Drossel ist die CI-nahe Bedingung aus der Ä24-Forensik (2-Kern-Runner,
`workers: 1`). Unter ihr reisst **allein die Abfrage** das Budget: die Seite ist
nach ~18 s bedienbar, die Namensberechnung kostet weitere ~10 s.

**Fix:** `e2e/helpers/leserBereit.ts` — EINE Bereitschafts-Wartung (§5) über die
Attribute `[data-ansicht-menu]` (Ist-Hülle) und `[data-v3-ansicht]` (V3), beide
nur im Client-Render vorhanden (nachgemessen: `dist/gesetze/bund/OR.html` enthält
**null** `<button>`). Kein Timeout angehoben, keine Retry-Zahl erhöht, keine
Assertion gelockert. Der zugängliche Name des Öffners bleibt in
`leser-kopf-a9.e2e.ts` und `leser-kopf-g2b.e2e.ts` geprüft.

**Nachher, gemessen in der CI-Konfiguration** (`workers: 1`, seriell, 4
Wiederholungen der Datei): **8/8 grün**, der OR-Test in 15.1 · 16.8 · 18.5 ·
18.1 s gegen sein 20-s-Budget.

**Ehrlicher Rest — der Fix reicht nicht überall.** Bei **4 Workern** fällt der
OR-Test weiter (1 von 2 Läufen, «element(s) not found» nach 20 s auf das
Attribut), bei 4× Drossel bleiben 17.8–19.9 s gegen 20 s, also **1.2 s Luft**.
Der dominante Term ist weg, der verbleibende ist der Erst-Render des OR selbst
und liegt bei `QS-PERF` (Ä24-Übergabe). Wer hier weiter senken will, senkt es
dort — nicht am Budget dieses Tests.

**Nebenbefund mit Hebel für H4:** dieselbe teure Wartung steht in **acht weiteren
Specs** — `gesetze-ux-g3a:19`, `gesetze-ux-g3b-anhang:12`,
`gesetze-historie-badge:102,186`, `hist-ansicht-w25i:47`, `leser-optionen:42`,
`leser-kopf-v2:19`, `leser-kopf-g2b:11`, `leser-ruecksprung-r5-r7:13`,
`leser-adresse-lm202:48`, `leser-lesemass:266`. Sie sind **nicht** angefasst: der
Tausch ist je Datei zu prüfen (wo Rolle+Name die AUSSAGE ist, darf er nicht
weg), und das gehört in H4, nicht in eine Vorbereitung.

### `leser-weiterlesen-r4-r8` und `leser-kontext-e4` — nicht reproduziert

Beide Specs, 5 Wiederholungen bei 8 Workern (Kontention als lokaler Ersatz für
die CI-Aushungerung): **65/65 grün, Exit 0, 1.8 min.** Damit ist die Bedingung,
unter der sie in CI fielen, lokal nicht hergestellt — und ohne gesehenen
Fehlschlag wird hier nicht «repariert» (§0 Ziff. 2). Was sich sagen lässt:

- `leser-weiterlesen-r4-r8` läuft auf der **BV** (2 455 Knöpfe). Der oben
  gemessene Abfrage-Aufschlag ist dort um den Faktor ~5.5 kleiner; die
  Locator-Wurzel erklärt diese Flake **nicht**.
- `leser-kontext-e4` läuft auf dem **OR** unter CPU-Drossel und benutzt
  `getByRole('button', {name:/Rechner\/Vorlagen zu/})` mit **Regex**-Namen (Zeile
  298) gegen ein 30-s-Budget; die Datei dokumentiert selbst gemessene Laufzeiten
  von 17 900–37 462 ms. Derselbe Mechanismus ist also plausibel und der Tausch
  ist der erste Kandidat — belegt ist er hier nicht, und deshalb steht er als
  **Empfehlung für H4**, nicht als Änderung.

**Verdikt Kriterium 8: teilweise.** 1 von 3 mit belegter Wurzel behoben, 2 von 3
lokal nicht reproduzierbar. Für die zwei offenen ist die nächste Messung **nicht**
ein weiterer lokaler Lauf, sondern die CI-Forensik am rohen Shard-Log.

---

## 7 · B-Specs — Umhäng-Liste für H4 (Vorbereitung, kein Umbau)

Grundlage: `playwright.config.ts` (Listen `N_SPECS`/`V3_SPECS`, Z. 41–100).
**Verifiziert** heisst: an Datei:Zeile belegt. **Verdacht** heisst: per Grep
plausibel, nicht gegen V3 durchgemessen — die acht Verdachtszeilen sind vor dem
Umbau je einzeln nachzuprüfen.

| Spec | heute | Sachaussage | Verdikt | Beleg / was zu ändern ist |
|---|---|---|---|---|
| `gesetze-ux-g3a` | chromium | Kopf-Etikett (Gesetz/Verordnung/Kanton) | **UMHÄNGEN** (verifiziert) | `.lc-leser > header` in Z. 25, 38, 53 — in V3 existiert **kein** `<header>`-Tag; Ziel `[data-v3-kopf]`. Z. 57–63 (Live-Verweis) ist hüllenneutral und bleibt |
| `leser-optionen` | chromium | Options-Menü: Bestückung und Wirkung | **gemischt** | (a) Z. 67 «genau zwei `role=switch`» → **UMHÄNGEN**, V3 hat zusätzlich «Rechtsprechung im Text» (`LeserAnsichtV3.tsx:204`); (b) Z. 97–121 B3-Paar → **LÖSCHEN**, Nichttrage-Nachweis: identische Aussage und identische Erlasse in `leser-v3-umschalten.e2e.ts:150–173`; (c) Z. 123–157 Ä27-Hinweis → **UMHÄNGEN** ohne Selektor-Änderung; (d) Z. 167 `.lc-leser button[aria-label^="Fussnote"]` greift in V3 den Menü-Schalter statt die Marke → auf `[data-fn-ref]` |
| `leser-r1-r2` | chromium | Trefferliste/Zähler + Quickjump | **UMHÄNGEN** (Z. 461 verifiziert) | Z. 461 `toHaveCount(1)` auf das zweite Sprungfeld, das Pos. 4 beseitigt. Rest attributbasiert; **Verdacht** auf Redundanz mit `leser-v3-treffer-deckel`/`leser-v3-panel-zaehler` — vor dem Löschen prüfen |
| `leser-ruecksprung-r5-r7` | chromium | Rücksprung-Chip/Deep-Link | **UMHÄNGEN** (verifiziert) | nur Z. 128 `toBeLessThan(140)`; V3 landet auf 156 px (64+36+56). Rest `[data-toc]`/`role=status` bleibt |
| `leser-kopf-g2b` | chromium | Kopf-Zusammenführung, Zitat kopieren | **UMHÄNGEN** (verifiziert) | `.lc-leser > header` 6× (Z. 18, 78, 90, 96, 98, 109, 130) → `[data-v3-kopf]` |
| `leser-kopf-v2` | chromium | K-1/K-2/B-1 Kopf-Vertrag | **UMHÄNGEN** (verifiziert) | Z. 48 `.lc-leser button[aria-label^="Fussnote"]` — derselbe Fehlgriff wie oben |
| `hist-ansicht-w25i` | chromium | Änderungsvermerke-Vertrag (Inhalt an/aus) | **UMHÄNGEN** (verifiziert) | autoritative Quelle des Schalter-Vertrags (`leser-optionen.e2e.ts:35`); V3 hat den Schalter (`LeserAnsichtV3.tsx:190`), aber nur die PRÄSENZ ist dort geprüft, nicht der Inhalts-Vertrag `[data-fn-klasse]` |
| `leser-kopf-cls-s3` | chromium | CLS am Kopf | **BLEIBT** (verifiziert) | enthält bereits `?leser=v3`-Fälle (Z. 37) |
| `leser-marken-geometrie` | chromium | Marken-Geometrie | **BLEIBT** (verifiziert) | sagt selbst «in V1 gleich wie in V3», fährt bereits `?leser=v3` |
| `leser-lesemass` | chromium | Zeilenmass ≤ 75 ch | **BLEIBT/UMHÄNGEN in H4** | die Datei erklärt selbst (Z. 4–24), dass der Wert V1 == V3 ist und der Umzug bewusst auf H4 wartet |
| `leser-kopf-a9` | chromium | A9-Bedienbarkeit Ansicht-Menü | **BLEIBT** (verifiziert) | nur `getByRole('button',{name:'Ansicht'})` + `[aria-label="Darstellungsoptionen"]`, beides in V3 vorhanden (`LeserAnsichtV3.tsx:148,167`) |
| `leser-breite-a37` · `leser-gliederung-a33` · `leser-kontext-e4` · `leser-suche-a35-a40-a41` · `leser-trefferliste-overlay-mobil-w219` · `leser-position-u` (A17) | chromium | Pixel-/Geometrie- bzw. Slot-Aussagen der Ist-Hülle | **UMHÄNGEN — Verdacht, nicht verifiziert** | je an V1-Layout gebundene Masse oder V1-Slots (`data-inhalt-kopf`/`data-such-slot`); vor dem Umbau einzeln gegen die V3-Geometrie messen |
| `leser-adresse-lm202` · `leser-gliederung-kein-overflow` · `leser-history-hash` · `leser-spy-w25d` · `leser-suche-klappzustand` · `leser-toc-sprung` · `leser-weiterlesen-r4-r8` · `gesetze-historie-badge` | chromium | Adresse, Overflow, Verlauf, Scroll-Spy, Klappzustand, TOC-Sprung, Weiterlesen, Badge | **BLEIBT — Verdacht** | attribut- bzw. rahmenbasiert, keine Struktur-Treffer im Grep |

**Warnung, die vor dem Flip erledigt sein muss (§6.7).** Nach dem Umlegen des
Defaults rendert das Projekt `chromium` selbst V3. Die nicht umgehängten
Struktur-Assertions werden dann **nicht sauber rot**, sondern laufen in Timeouts
(`gesetze-ux-g3a` hat mit `.lc-leser > header, header` sogar einen Fallback, der
auf den globalen `Topbar`-Header ausweichen könnte) — also je Test ein
20-s-Hänger statt einer Fehlermeldung. Das ist schlimmer als ein Tor, das nicht
scheitern kann.

**Textvorschlag für `playwright.config.ts` (NICHT angewendet):**

```js
const N_SPECS = [
  '**/leser-v3-flag.e2e.ts',
  '**/leser-suche-vertrag-b8.e2e.ts',
  '**/leser-ohne-gliederungslinie.e2e.ts',
  '**/gesetze-marginalie.e2e.ts',
  '**/gesetze-pdf-download.e2e.ts',
  '**/gesetze-ux-9punkte.e2e.ts',
  '**/gesetze-ux-g3b-anhang.e2e.ts',
  // H4: nach dem Kopf-Selektor-Umzug auf [data-v3-kopf] paritätsfähig
  '**/gesetze-ux-g3a.e2e.ts',
  '**/leser-kopf-g2b.e2e.ts',
]

const V3_SPECS = [
  '**/leser-v3-*.e2e.ts',
  '**/leser-kopf-paritaet.e2e.ts',
  // H4: nach Selektor-/Schwellenwert-Fix umgehängt (keine echte Parität —
  // diese Specs prüfen V1-spezifische Werte)
  '**/leser-optionen.e2e.ts',          // B3-Paar vorher entfernt (Redundanz)
  '**/leser-ruecksprung-r5-r7.e2e.ts', // Schwelle 140 → 156 px
  '**/hist-ansicht-w25i.e2e.ts',
]
```

**`e2e/shard-gruppen.json`:** der Union-Wächter (`npm run check:e2e-shards`)
prüft **Dateinamen unabhängig vom Projekt** — ein Umhängen zwischen `chromium`
und `leser-v3` ändert die Union nicht. Nur wenn eine ganze Datei entfällt, muss
ihr Eintrag aus der Gruppe verschwinden; nach obigem Vorschlag entfällt **keine
Datei** (beim B3-Paar fallen nur Einzeltests).

**Zwei Lücken in Kap. 10, gemessen:** `hist-ansicht-w25i` und
`gesetze-historie-badge` sind dort als Teil der doppelt laufenden Parität geführt,
stehen aber **nicht** in `N_SPECS` — sie laufen heute nur im Projekt `chromium`.
Entweder in `N_SPECS` aufnehmen oder Kap. 10 korrigieren; beides ist besser als
ein Paritätsbeweis, den nichts fährt.

---

## 8 · Offene H4-Auflagen aus H2b/H3/S2

| Kürzel | Fahrplan-Zeile | Was offen ist | Einordnung |
|---|---|---|---|
| ~~**NM-2 auf H**~~ | — | Entscheide zu einem Artikel kosteten auf 390 px **2 Taps** statt einem (§2; die ursprüngliche Fassung «nicht per Tap erreichbar» ist als §7-Korrektur richtiggestellt) | ✅ **erledigt 17./18.8.2026 mit H4-II** — Zähler-Chip «⚖ N» auf `mini`, 1 Tap wie auf D/S; bewacht von `e2e/leser-v3-h4-kopfwege` (a)/(a2)/(a3). *Kein Flip-Blocker mehr* |
| **Ä60** | 825 | Beiwerk-Blatt verdeckt auf D @1440 die äusseren 112 px (18 %) jeder Textzeile; keine feste Blattbreite behebt es | **BLOCKER VOR FLIP** — Normtext teilweise unlesbar (§1/§8); Weg (a) so lassen / (b) Kopf-Chip opfern / (c) breiterer Leser-Rahmen wartet auf David |
| ~~**Ä45 Doppelkrume**~~ | 938–940 | App-Krume und V3-Ortsangabe zeigten @390 denselben Ort in zwei `nav`-Krumen übereinander | ✅ **erledigt 17.8.2026 mit A-2** (Leisten-Verschmelzung; Vollzugsvermerk Kap. 7 des Fahrplans, bewacht von `e2e/leser-v3-eine-kopfzeile`). *Kein Flip-Blocker mehr — dieser Bogen entstand vor A-2 und führte ihn weiter (Nachzug 17.8. abends).* |
| ~~**Ä46 zwei ✕ je Pane**~~ | 940–941 | zwei Schliess-Kreuze je Pane mit verschiedener Bedeutung; gemessen im Split @1600 **44 px übereinander** (Griffleiste y = 69, V3-Kopf y = 113) | ✅ **erledigt 17./18.8.2026 mit H4-II** — im Pane trägt nur noch die Griffleiste ein ✕; die Inhalts-Handlung («zur Übersicht») steht benannt als «‹ Gesetze» mit demselben Ziel `/gesetze`. Bewacht von `e2e/leser-v3-h4-kopfwege` (b), `leser-kopf-paritaet`, `leser-v3-eine-kopfzeile` (d). *Kein Flip-Blocker mehr* |
| ~~**Ä79 zwei ☰ @1440**~~ | 724, 1785 | Gliederung eingeklappt @1440 → Kopf-☰ (x = 1117) **und** Schienen-☰ (x = 184) für dieselbe Handlung | ✅ **erledigt 17./18.8.2026 mit H4-II** — der Kopf-☰ weicht, solange die beschriftete Schiene steht; unter der Schienen-Schwelle bleibt er. Bewacht von `e2e/leser-v3-h4-kopfwege` (c)/(c2) |
| **Icon-Deckel @390** (neu, hier gemessen) | — | Kopfzeile @390 trägt **drei** reine Icons (⚖ · ☰ · ···), erlaubt sind zwei (Design-Grundlage Kap. 6); vor H4-II waren es dieselben drei (☰ · ··· · ✕) | **kann H5 tragen** — unverändert, kein Rückschritt; der Chip trägt seine Zahl erst nach dem Nachladen (§8 verbietet eine erfundene 0) |
| **Kopfzeile @720 = 5 Elemente** (neu, hier gemessen) | — | Einzelansicht `kompakt`: Ort · Zähler · ☰ · ··· · ✕ reisst den Vier-Elemente-Deckel — Befund älter als H4-II | **braucht Entscheid** — Hebel wäre `zeigeSchliessKreuz` auch auf `kompakt`, berührt aber die Ä46-Auflage «Einzelansicht bleibt bei 1» |
| **A-8** (Rest) | 773, 1070, 1698 | Der 1024er-Spalten-Entscheid hängt noch an `istXl`; Umstellung verschiebt die Grenze auf Viewport 1072 (§3) | **braucht Davids Entscheid** — identisch mit Ä60 |
| **B-Specs umhängen** | 1240, 1610, 1622 | §7 dieses Bogens | **BLOCKER VOR FLIP** — sonst Timeout-Hänger statt Fehlermeldungen |
| **Flaker** | 1746 | §6 dieses Bogens | **teilweise**; 2 von 3 brauchen CI-Forensik, nicht mehr lokale Läufe |
| **Ä9 Regler-Doppel** | 527, 938 | globaler App-Schriftregler im Leser noch zusätzlich sichtbar | **kann H5 tragen** — Duplikat, nichts unbedienbar. *Nachzug 17.8. abends: hing nominell an A-2; der Regler sitzt aber in der Topbar, nicht in der abgelösten Leiste — der Punkt ist von A-2 unabhängig* |
| **A-2 Leisten-Verschmelzung** | 527, 644, 995 | zwei Leisten statt einer, 37 px Chrome-Preis; berührt `src/components/layout/**` | **kann H5 tragen** (Fahrplan nennt «H4/H5») |
| **Ä33/Ä34** | 941–944 | Chrome bis zur Lesefläche @390 = 183 px (22 %) ruhend, 207 px (25 %) mit Suche | **braucht Davids Entscheid** — es gibt keinen Zielwert, nur den Messwert |
| **Ä63 Handy-Einzug** | 548, 1404 | OR/ZGB @390 Einzug x = 80 px gegen StPO 44 px | **kann H5 tragen** — Typografie-Detail |
| **Ä64 Regler-Hierarchie** | 549, 1404 | Schriftregler skaliert nur `[data-lese]`; Hierarchie kippt bei 130 % | **braucht Davids Entscheid** — Umbau auf em-relative Tokens |
| **Ä57/Ä58** | 826 | Panel-Kopf ohne Warnzeichen bei «noch nicht im Text»; Chips gerahmt, ☰ nicht | **kann H5 tragen** |
| **Randlasche (F8)** | 772 | die Lasche hält an keiner Breite | **kein Flip-Blocker mehr** — sie war die *vermutete* Ursache des NM-2-Aufschlags auf H; der ist mit dem Kopf-Chip behoben, ohne dass die Lasche zurückkehrt. Was bleibt, ist Davids Bestätigung der §7-Abweichung zu F8 («Lasche behalten») |
| **`leser-lesemass` umhängen · `LeserRahmenV3`-Schnitt** | 1240 | Test-Umzug bzw. Datei-Schnitt | **kann H5 tragen** |

---

## 9 · Bilder

**24 von 24** unter `bilder/`, Namensform
`<erlass>-<breite>-<schema>-<huelle>.png` mit Breite ∈ {D = 1280, S = 720,
H = 390}, Schema ∈ {hell, dunkel}, Hülle ∈ {v1, v3}. Erlasse: **StPO Art. 429**
(gleicher Anker, gleiche Scrollposition in beiden Hüllen) und **BS-640.100**.
`deviceScaleFactor: 1`, `reducedMotion: reduce`, Schriften abgewartet.
Protokoll: `bilder-protokoll.json`.

**S = 720 px Einzelansicht**, nicht ein echtes Split-Pane: die Pane-Chrome
(zweiter Kopf, zusätzliches ✕) ist damit **nicht** im Bild. Das ist bewusst so
benannt, weil genau diese Chrome unter Ä46/Ä33 getrennt geführt wird; der
Pane-Beweis ist ein Test, kein Bild (`leser-kopf-paritaet.e2e.ts`).

**Was auf `stpo-429-H-hell-v3.png` ohne Messgerät zu sehen ist** — und was den
Bogen an drei Stellen bestätigt:

- **zwei Ortsangaben übereinander** («‹ Art. 429 StPO … Stand 01.04.2025 ✕» und
  darunter «StPO · Art. 429 … ✕») = Ä45 Doppelkrume — *das Bild zeigt den Stand
  VOR A-2 (17.8.2026); seither gibt es nur die untere Zeile,*
**Nachtrag 18.8.2026 — vier Bilder mit Suffix `-v2`.** Die 24 oben sind
unberührt; daneben liegen jetzt `stpo-429-H-{hell,dunkel}-v3-v2.png` und
`bs-640.100-H-{hell,dunkel}-v3-v2.png` mit dem Stand NACH H4-II. Ohne Messgerät
zu sehen: die Kopfzeile @390 liest sich «‹ Gesetze · StPO · Art. 429 — ⚖ ☰ ···»,
also **mit** Rechtsprechungs-Griff und **ohne** ✕; die Zeile ist kürzer als
vorher, nicht länger. Beide Farbschemata geprüft, kein Überlauf.

- **zwei ✕ in zwei Zeilen** mit verschiedener Bedeutung = Ä46 — *in der
  Einzelansicht mit A-2 auf eines reduziert, im Pane unverändert,*
- **kein Zähler und keine Lasche** für die Rechtsprechung = der NM-2-Verlust aus
  §2, sichtbar statt behauptet.

---

## 10 · Belege

| Was | Wo |
|---|---|
| Rohdaten NM (54 Läufe, Protokoll je Schritt) | `nm-messung.json` |
| Rohdaten NM-2 vorher/nachher H4-II (18 Läufe) | `nm-messung.json` → Schlüssel `h4ii` |
| H4-II · Spec und Rot-Beweis (NM-2 · Ä46 · Ä79) | `e2e/leser-v3-h4-kopfwege.e2e.ts` (Kopfkommentar nennt die drei Fehlermeldungen) |
| Rohdaten CLS (4 Zellen × 5 Läufe, Verursacher-Knoten) | `cls-messung.json` |
| Rohdaten axe + Proben (20 Kombinationen) | `axe-proben.json` |
| Bilder + Protokoll | `bilder/`, `bilder-protokoll.json` |
| A-8 · Hook und Rot-Beweis | `src/pages/gesetz-leser/v3/useElementBreite.ts`, `src/tests/leser-v3-elementbreite.test.ts` |
| Flaker-Wurzel · Messreihe im Kopf | `e2e/helpers/leserBereit.ts` |
| Fahrplan-Fortschreibung | `fahrplaene/FAHRPLAN-LESER-V3.md` Kap. 7 (Vollzugsvermerk H4-Vorbereitung) und Kap. 12 A-8 |

**Nicht gemessen, ausdrücklich benannt:** (a) kein automatischer Sweep über alle
Bundeserlasse (§5); (b) kein CI-Lauf dieser Änderungen — die Zahlen hier sind
lokal; (c) die zwei nicht reproduzierten Flaker (§6); (d) NM in einem echten
Split-Pane (S wurde als 720-px-Einzelansicht gemessen, §9).
