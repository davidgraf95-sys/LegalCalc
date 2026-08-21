# Kontaktbogen H4 — Leser V3, die Flip-Kriterien gemessen

Vorbereitung der Etappe **H4** des Roadmap-Schritts `W2·5m-LESER-V3` (Fahrplan
`fahrplaene/FAHRPLAN-LESER-V3.md`, Kap. 7). Stand 17.8.2026, Branch
`feat/leser-v3-h4-vorbereitung`, Basis `a516f12ef` (= S2 inkl. Nachzug).

> ## ✅ DER UMSCHALTER IST UMGELEGT — 18.8.2026
>
> **Grundlage: Davids Ja vom 17.8.2026 spätabends** (Chat, wörtlich «ja und c,
> mach so») — damit ist Kriterium 9 der Matrix unten erfüllt und **Ä60 = (c)**
> entschieden (breiterer Leser-Rahmen; baut ein eigener PR).
> Gebaut auf Branch `feat/leser-v3-h4-flip`, Basis `f918a0b12`.
>
> **Was gilt seither:** ohne Adresszusatz sieht jede Besucherin **V3**. Der
> Rückweg ist `?leser=v1` und wird gemerkt (eigener Schlüssel `lm.leser.v1`,
> damit der alte `lm.leser.v3='1'` niemandem still das Gegenteil seiner Wahl
> zeigt). Die alte Hülle bleibt bis **H5** lauffähig; H5 folgt spätestens einen
> PR später.
>
> **Der Text unterhalb dieser Zeile ist der Stand VOR dem Flip** und bleibt zur
> Nachvollziehbarkeit unverändert stehen — er ist die Grundlage, auf der David
> entschieden hat. Was der Flip selbst gemessen hat, steht in §1 unter
> «Flip-Stand 18.8.2026»; was am Testapparat geschehen ist, in §7 unter
> «Vollzug».

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
>
> **NACHGEFÜHRT 18.8.2026 — der Umschalter IST umgelegt.** Der Satz an dieser
> Stelle lautete bis hierher «weiterhin nicht umgelegt und wartet auf dein Ja»
> und war seit dem Abend des 17.8. überholt: Du hast das Ja gegeben («ja und c,
> mach so»), und der Flip ist gebaut — `src/pages/GesetzLeser.tsx`,
> Grundzustand `'v3'`. Der ganze Bogen unterhalb ist als Entscheidungsvorlage
> geschrieben; er bleibt im Wortlaut stehen, weil die Messungen darin die
> Grundlage des Entscheids sind, ist aber ab hier **Protokoll, nicht Frage**.
> Der Rückweg `?leser=v1` steht bis H5.

**Von den acht technischen Bedingungen sind sieben erfüllt.** Was noch offen ist,
steht unten. Das Seitenblatt, das auf dem Desktop die Zeilenenden des
Gesetzestexts verdeckte (Ä60), ist seit dem 18.8.2026 **erledigt** — nach deinem
Entscheid (c) vom 17.8. steht es jetzt neben dem Text statt darüber. Offen bleibt
eine Aufräumarbeit an der Prüfstrasse (B-Specs), damit ein Fehler künftig als
Fehlermeldung erscheint statt als hängender Testlauf.

*Ursprüngliche Fassung (17.8.2026), zur Nachvollziehbarkeit: «auf dem Handy ist
im neuen Leser die Rechtsprechung zu einem Artikel mit dem Finger überhaupt nicht
mehr erreichbar». Das war der Messfehler, den §2 korrigiert.*

**Was du siehst, wenn umgeschaltet wird:** eine ruhigere Kopfzeile, ein einziges
Suchfeld statt zwei, und auf jeder Breite die Möglichkeit, direkt «429» zu tippen
und dort zu landen — das ist der Fortschritt, und er ist gemessen (auf Handy und
mittlerer Breite **ein Bedienschritt weniger** als heute). Auf dem Desktop steht
zusätzlich die Warnung «Eine in Kraft getretene Änderung ist noch nicht
eingearbeitet» sichtbar im Bild; im heutigen Leser fehlt sie dort ganz.

**Was danach noch offen ist (Stand 18.8.2026):** nur noch die B-Spec-Umhängung in
der Prüfstrasse. Erledigt sind seit der ersten Fassung: die Handy-Erreichbarkeit
der Entscheide, die zwei übereinanderliegenden Ortsangaben, die zwei
Schliess-Kreuze je Fenster — und seit dem 18.8. das verdeckte Zeilenende (Ä60):
auf einem 1440er-Bildschirm stehen Gliederung, Gesetzestext und Seitenblatt jetzt
nebeneinander, auf schmaleren Fenstern weicht die Gliederung auf ihre Schiene,
damit der Text seine Breite behält (Bilder unter §9, Suffix `-rahmen`). Das sind alles Bedienfragen, keine Rechenfehler —
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

1. ~~**Ä60 — das Seitenblatt verdeckt Zeilenenden**~~ — **erledigt am 18.8.2026.**
   Du hast am 17.8. spätabends **(c)** gewählt («ja und c, mach so»): der Leser
   darf breiter werden als eine Textseite. Gebaut und gemessen: das Seitenblatt
   steht jetzt **neben** dem Gesetzestext statt darüber, verdeckt sind ab 1024 px
   Fensterbreite **0 px** statt 320/257/192/112. Der Erlass-Titel liegt ebenfalls
   nicht mehr darunter (das war Ä59). Unter 1024 px bleibt alles wie bisher —
   genau die Grenze, die du gezogen hast.
2. **B-Specs umhängen** — reine Prüfstrassen-Arbeit, kein Entscheid nötig.
   ✅ **vollzogen 18.8.2026**, s. §7/§7a.

**BEANTWORTET am 17.8.2026 spätabends: «ja und c, mach so».** Damit ist der
Umschalter umgelegt — V3 ist der Standard-Leser, `?leser=v1` bleibt bis H5 der
Rückweg. Die zwei Punkte oben sind beide erledigt. Was hier ab jetzt noch auf
dich wartet, sind **keine Flip-Fragen mehr**, sondern die drei einzelnen Punkte
in §8 («Wartet auf David»).

---

## 1 · Kriterien-Matrix (Kap. 7, «alle, nicht auswählbar»)

### ✅ Flip-Stand 18.8.2026 — dieselben Kriterien, am geflippten Stand nachgemessen

Die Matrix darunter entstand **vor** dem Flip, mit V1 als Grundzustand und V3
unter Flag. Sie ist die Grundlage von Davids Ja und bleibt unverändert stehen.
Diese Tabelle misst dieselben Kriterien noch einmal **am Flip-Stand**, also
gegen den neuen Grundzustand — ohne Adresszusatz.

**Messbedingung:** macOS Apple Silicon, `vite preview` gegen frisch gebautes
`dist/` (Basis `f918a0b12` + Flip-Commits), 1280 × 900 sofern nicht anders
vermerkt, je Kombination ein frischer Browser-Kontext (kalt), `reducedMotion:
reduce`, Thema per `localStorage` gepinnt **und** `colorScheme` emuliert.
Rohdaten `flip-stand.json`.

| # | Kriterium | Ergebnis | Zahl am Flip-Stand |
|---|---|---|---|
| 1 | unveränderte **N-Tests** grün — jetzt im **Default**-Projekt gegen V3 | ✅ | **43 Fälle über 9 N-Spec-Dateien, 0 rot** (`leser-v3-flag` 3 · `leser-suche-vertrag-b8` 5 · `leser-ohne-gliederungslinie` 2 · `gesetze-marginalie` 4 · `gesetze-pdf-download` 2 · `gesetze-ux-9punkte` 9 · `gesetze-ux-g3b-anhang` 6 · `gesetze-ux-g3a` 4 · `leser-kopf-g2b` 8). Gegenprobe alte Hülle: `--project=leser-v1` **132 passed, Exit 0** |
| 2 | **`leser-kopf-paritaet`** grün | ✅ | 1 Fall, beide Split-View-Panes, im **Default**-Projekt gegen V3 — vor dem Flip lief er im Flag-Projekt |
| 3 | **PX** (Pixelvergleich) grün | ✅ **3/3 in Ruhe** | `PX=1 --project=px` dreimal hintereinander: **2 passed, Exit 0 · 24.0 s / 24.0 s / 23.9 s**. Der Lastfall aus der Matrix unten (2/5 unmittelbar nach einem 8-Worker-Lauf) ist damit **nicht** entkräftet — er bleibt der offene §17-Punkt, hier wurde die Ruhe-Bedingung gemessen |
| 4 | **NM** in keiner der drei Aufgaben verschlechtert | ⚠️ unverändert wie unten | Der Flip ändert am Bedienweg nichts — er ändert, wer ihn ohne Adresszusatz sieht. NM-2 bleibt der ausgewiesene Preis (+1 Schritt gegenüber V1), NM-1/NM-3 bleiben besser |
| 5 | **CLS ≤ Ist-Stand** | ✅ *(mit einem gemeldeten Fall)* | `leser-kopf-cls-s3` **4/4 grün seriell** (`--workers=1`). Im 5-Worker-Voll-Lauf riss `v3 @390` einmal — **seriell grün**, also Parallel-Last, kein Produktbefund (Messbedingung nennen: §0 Ziff. 3c). **Der zuvor gemeldete Fall ist erledigt:** `leser-r1-r2` (A9-DoD) mass @390 unter 6× Drossel CLS 0.0202 gegen Budget 0; entschieden 18.8.2026 nach Weg 3 — Budget bleibt 0, die Test-Geste wird echtes Tippen, input-frei 0.0016 → **grün**. Herleitung und Stopp-Recht in §7c |
| 6 | **axe** grün, hell **und** dunkel | ✅ | **0 critical/serious in 10 Kombinationen** (5 Erlasse × hell/dunkel), alle **ohne Flag**, also gegen V3 als Grundzustand. Dokumentiert bleibt je 1 × der begründete `link-in-text-block` (B-2). Tags `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` wie `e2e/a11y.e2e.ts` |
| 7 | **Kantons-Probe** grün, ohne Flag | ✅ | **BS-640.100** (292 Bestimmungen) und **ZH-211.11** (23) ohne Adresszusatz: V3-Rahmen 1 · V3-Kopf 1 · Gliederung 1 · **0 Konsolenfehler**; V1-Menü 0. Bund-Probe gleich: StPO (480) · VMWG (32) · LugÜ (91). Die `h1` trägt in allen fünf Fällen den amtlichen Titel |
| 8 | drei bekannte **Flaker** mit Wurzel-Fix | ⚠️ teilweise, unverändert | `leser-ohne-gliederungslinie` **2/2 grün seriell** (im Voll-Lauf unter 5 Workern einmal rot — dieselbe Signatur wie am 17.8., Wurzel Locator-Kosten). 2 von 3 weiterhin nicht reproduzierbar |
| 9 | **David-Go** nach Kontaktbogen | ✅ **erteilt 17.8.2026** | Chat, wörtlich «ja und c, mach so» |
| — | **Rückweg wirksam** *(neu, erst am Flip-Stand prüfbar)* | ✅ | `?leser=v1` auf BS-640.100: V3-Rahmen **0**, V1-Ansicht-Menü **1**, gemerkt `lm.leser.v1='1'`. Der Rückweg ist damit **positiv** belegt, nicht bloss über die Abwesenheit des V3-Rahmens |

**Rot-Beweis, dass die umgehängten Specs wirklich V3 messen (§6.7).** Der Default
wurde lokal für einen Lauf auf V1 zurückgestellt (`leserFlag.ts`, neu gebaut,
danach zurückgenommen — im Branch ist davon nichts):

| Spec | gegen den ALTEN Default | gegen den Flip-Stand |
|---|---|---|
| `leser-optionen:76` (auf drei Schalter umgehängt) | **ROT** — `getByRole('switch', {name: 'Rechtsprechung im Text'})`: *element(s) not found* | grün |
| `leser-v3-umschalten` (c) (R10 gespiegelt) | **ROT** — `[data-leser-v3="rahmen"]`: erwartet 1, erhalten **0** | grün |
| `gesetze-ux-g3a` (Parität, in `N_SPECS`) | **grün** | grün |

Die dritte Zeile ist die Kontrollgruppe: eine echte Paritäts-Spec muss in beiden
Hüllen grün sein, sonst misst sie die Hülle statt den Normtext.

---

### Die Matrix vor dem Flip (17./18.8.2026) — Entscheidungsgrundlage, unverändert


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
*(ERLEDIGT 18.8.2026, H4-Nachzug Teil A — Ä91/Ä87: das ✕ ist auf jeder Breite
gestrichen, `zeigeSchliessKreuz` gibt es nicht mehr, die Auflage ist datiert
ersetzt durch «höchstens ein ✕ je Kopfzeile, Rücksprung immer beschriftet».
Nachher vier Elemente @720.)*

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
verschwände auf jedem Fenster zwischen 1024 und 1071 px.

**Nachgeführt 18.8.2026 (nach Ä60 (c)): die Umstellung bleibt aus, und jetzt mit
drei Zahlen statt einer.** Die Tabelle oben ist am gebauten H4-Stand
nachgemessen und gilt unverändert (VP 1071 → 1023 px, **VP 1072 → 1024 px**):
die Aufweitung aus Ä60 hängt am OFFENEN Seitenblatt, bei geschlossenem ist der
Rahmen weiter auf 1072 px gedeckelt. Als Schwelle wäre er ausserdem
rückgekoppelt — der Rahmen entschiede über seine Breite anhand seiner Breite.
Die neue Messgrösse `raum` (`v3/rahmenSpalten.ts`) läge zwar richtig (Fenster
− 48 px, Schwelle 976 ⟺ Viewport 1024), misst im geteilten Fenster aber
`clientWidth` und damit ohne Scrollbar, während `PANE_BREIT_PX` ausdrücklich
border-box misst, «damit die Scrollbar die Schwelle nicht verschiebt» (Differenz
0 px auf macOS, 15 px auf Chromium/Linux). Und `istXl` trägt beide Hüllen: V3
allein umzuhängen erzeugte eine dritte Wahrheit, statt eine zu beseitigen.

A-8 bleibt damit **teilweise erledigt** — die Regeln und die Messung liegen an
einem Ort — und wird mit **H5** abgeschlossen, wenn V1 fällt; dort ist es eine
Streichung statt einer Verschiebung.

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

## 7 · B-Specs — Umhäng-Liste für H4 ✅ **VOLLZOGEN 18.8.2026**

> **Vollzug, und was die Liste unten NICHT wusste.** Die Umhängung ist gebaut
> (Commits `39f3a27d5`, `b92a5956c`, `dc9301893`). Die Arbeitsliste unten war
> **unvollständig**: sie entstand per Grep gegen die Ist-Hülle und kannte sechs
> betroffene Dateien. Der erste **Voll-Lauf am Flip-Stand**
> (`npx playwright test --project=chromium`, 634 Tests, 18.8.2026) meldete **47
> rot in 18 Dateien** — **zwölf Dateien mehr**, als hier stehen. Das ist der
> belegte Grund, warum die Reihenfolge «erst flippen, dann messen, dann
> umhängen» richtig war und eine Grep-Liste den Lauf nicht ersetzt (§0 Ziff. 3:
> Verteilung statt Einzelwert).
>
> Die zwölf zusätzlichen Dateien fallen alle in **eine** Klasse, die die Liste
> unten strukturell nicht sehen konnte: sie greppte nach Hüllen-Selektoren
> (`.lc-leser > header`, `data-such-slot`), nicht nach **Montagepunkten**. Die
> Rechtsprechungs- und Materialien-Auskunft stand in V1 am **Artikelfuss** und im
> **Gliederungs-Scroller**; V3 hat sie mit Pos. 12 / Kap. 4d ins Panel gezogen.
> Jede Spec, die dort etwas behauptet, ist in V3 nicht falsch, sondern
> **gegenstandslos** — und keine davon trägt einen der gegreppten Selektoren.

### 7a · Vollzugs-Tabelle (gemessen am Flip-Stand, 18.8.2026)

Verdikte: **UMGEHÄNGT** = Anker/Selektor an V3 nachgezogen, Aussage unverändert ·
**GEPINNT (ganz)** = Datei läuft nur noch im Projekt `leser-v1` (`V1_NUR`) ·
**GEPINNT (Fall)** = Datei läuft in beiden Projekten, der Einzelfall trägt
`test.skip` mit Begründung (`V1_GEMISCHT`, Muster `e2e/helpers/istHuelle.ts`) ·
**GELÖSCHT** = Fall entfallen, Nichttrage-Nachweis in der Spalte rechts.

| Spec (Fälle rot/total) | Verdikt | Was geschah · V3-Deckung bzw. Lücke |
|---|---|---|
| `gesetze-ux-g3a` | **UMGEHÄNGT** | `.lc-leser > header` → `.lc-leser header` (gemessen BV @1440: direktes Kind 0/1, Nachfahre 1/1). Steht seither in `N_SPECS` = läuft in BEIDEN Hüllen. Der `, header`-Fallback fiel — er wich auf den Topbar-Header aus und konnte nicht scheitern (§6.7) |
| `leser-kopf-g2b` | **UMGEHÄNGT** | dieselbe Selektor-Korrektur, ebenfalls zurück in `N_SPECS` |
| `leser-kopf-v2` | **UMGEHÄNGT** | Fussnotenmarke `[data-fn-ref]` statt `button[aria-label^="Fussnote"]` (der alte Selektor griff nach dem Flip den Menü-Schalter); B-1 misst die Facetten-Wirkung im Panel statt an der Bezüge-Zeile |
| `leser-optionen` | **UMGEHÄNGT + 1 Paar GELÖSCHT** | drei `role=switch` statt zwei, beim NAMEN geprüft statt gezählt. Gelöscht: das B3-Paar — Nichttrage-Nachweis `leser-v3-umschalten` (a2) prüft dieselbe Aussage an denselben Erlassen **plus** dem null-Fall ZH-211.11 |
| `leser-r1-r2` | **UMGEHÄNGT · vollständig grün** | Sheet-/Quickjump-Fall auf das EINE Feld (Pos. 4); ehrliche Ablehnung als sichtbarer Satz statt `role="alert"`. Ein Fall gelöscht («Desktop-TOC-Kopf trägt denselben Baustein» — `leser-v3-suchfeld-ueberall` (a)/(c) sagt strenger, dass es nur EINEN gibt). **A9-DoD war der eine offen rote Fall; entschieden 18.8.2026 nach Weg 3 (Geste statt Budget), s. 7c** |
| `leser-ruecksprung-r5-r7` | **UMGEHÄNGT** | `tocSprung` über `button[title]` statt `:not([aria-expanded])` (in V3 trägt auch der Titel-Knopf `aria-expanded`; gemessen 0 statt 39 Treffer, 90-s-Leerlauf). Rücksprung-Orakel wird gemessen statt auf die V1-Kopfhöhe 88 px gesetzt |
| `leser-v3-umschalten` (1/n) | **UMGEHÄNGT** | R10 **gespiegelt**: ohne Flag rendert V3, `?leser=v1` führt zurück. Beide Richtungen im Fall, V1-Beweis POSITIV über `[data-ansicht-menu]` |
| `leser-spy-w25d` (1/4) | **UMGEHÄNGT** | derselbe `aria-expanded`-Befund wie bei r5-r7 — der Locator fand 0 Elemente und lief ins 120-s-Budget, ohne je zu prüfen |
| `leser-adresse-lm202` (1/16) | **UMGEHÄNGT** | Locator nimmt beide Feldnamen (V1 «Zu Artikel springen», V3 «Im Gesetz suchen oder zu einer Bestimmung springen») |
| `leser-suche-a35-a40-a41` (1/4) | **UMGEHÄNGT** | Kopf-Zone `[data-v3-kopf]` neben `data-such-slot`/`data-inhalt-kopf`; geprüft wird «in EINER der beiden», weil A-2 die zwei Leisten verschmolzen hat |
| `bezuege-facetten-b4` (6/6) | **GEPINNT (ganz)** | `[data-rechtsprechung-menu]` + `[data-bezuege-zeile]`. V3-Deckung: `leser-v3-panel-facetten` (a) prüft den ORT der drei Facetten. **Lücke: ihre WIRKUNG** (Zähler «5 von 16», Persistenz, Kanton-Schnitt) ist am V3-Panel unbewacht |
| `bezuege-zeitstrahl-b5` (12/12) | **GEPINNT (ganz)** | derselbe Montagepunkt + Zeitstrahl. **Lücke: Von-Bis-Wirkung und die zwei MIGRATIONS-Fälle** («5 J.» → Von-Datum, «alle» bleibt offen) am V3-Panel unbewacht |
| `leser-kontext-e4` (3/3) | **GEPINNT (ganz)** | Kontextfenster IM `[data-toc]`-Scroller (David 25.7.2026). V3-Deckung: `leser-v3-kontext-cls` |
| `leser-trefferliste-overlay-mobil-w219` (2/2) | **GEPINNT (ganz)** | mobiles Feld liegt in V1 hinter dem Knopf «Im Gesetz suchen». V3-Deckung: `leser-v3-suchfeld-ueberall` (b), `leser-v3-blatt`, `leser-v3-treffer-reihenfolge` |
| `split-view-a34` (2/2) | **GEPINNT (ganz)** | beide Fälle brauchen das ⧉ an der Bezüge-Zeile als Einstieg; Bug 1 misst zudem V1-Mechanik (Seed-Hash beim imPane-Wechsel). V3-Deckung: `leser-kopf-paritaet` (Split über NormPopover), `leser-v3-highlight-split`. **Lücke: A34/Bug1 (Leseposition beim Öffnen) und Bug2 («Ansicht» bleibt im Split sichtbar) mit V3-Einstieg** |
| `verzahnung` (6/11) | **GEPINNT (Fall)** | 5 Fälle hüllenneutral und weiter scharf. **Lücke: MM4 ★-Wortlaut-Vergleich, MM5 «via Art. N» am Panel-Entscheid, Erwägungs-Sprung ab Panel** |
| `leitfaelle-chips` (3/6) | **GEPINNT (Fall)** | «(d) V3» im Titel meint die UI-NAV-Stufe, nicht die Hülle. **Lücke: Kurztext-Popover am Panel-Chip** |
| `normrevision-badge` (2/3) | **GEPINNT (Fall)** | ↻ an der Leitfall-Zeile. Die Temporal-Regel selbst deckt `src/tests` DOM-frei. **Lücke: ↻ am V3-Panel-Entscheid** |
| `materialien-m5-verzahnung` (2/3) | **GEPINNT (Fall)** | **Die gewichtigste Lücke** — hier hängen RECHTSDATEN (kuratiertes «via Art. 24», Dokument-Stand, async-Merge). V3 HAT den Reiter «Materialien» (`v3/PanelMaterialien.tsx`), aber keine Spec weist die Daten dort nach |
| `rechtsprechung` (1/n) | **GEPINNT (Fall)** | B3-Kontext-Panel am Leser-Fuss (`KontextPanel.tsx`, nur Ist-Hülle). V3-Deckung: `leser-v3-panel-facetten` (b) |
| `leser-breite-a37` (1/3) | **GEPINNT (Fall)** | gemessen: V3 640 px (`max-w-reading`) gegen V1 672 px (`max-w-normtext`) — der Wert gehört zur 784-px-Zelle der alten Hülle. Die Zahl NICHT auf 640 gezogen: **Ä60 (c) ändert die V3-Rahmenbreite im Parallel-PR**, ein Anker, den ein anderer PR gleichzeitig verstellt, ist keiner |
| `druck-fundstellen-z2` (1/7) | **GEPINNT (Fall)** | ⧉ an der Bezüge-Zeile als Split-Einstieg. **Lücke: der Druck IM Split für V3** |
| `leser-weiterlesen-r4-r8` (1/10) | **GEPINNT (Fall)** | **kein Defekt, ein entschiedener Vorrangwechsel**: «/» und ⌘K gehören im V3-Leser dem Leser-Feld, nicht der Kopf-Suche (`v3/suchKuerzel.ts`, Bug-Check B1 16.8.2026). V3-Deckung: `leser-v3-suche-sprung` + `src/tests/leser-v3-kuerzel.test.ts` |
| `hist-ansicht-w25i` | **UNBERÜHRT, grün** | die §7-Zeile unten verlangte Umhängen «(verifiziert)». Nachgemessen 18.8.2026: alle 10 Fälle laufen im Regelprojekt gegen V3 **ohne jede Änderung** grün. Nicht angefasst — ein Umbau ohne Fehlschlag ist keiner (§0 Ziff. 2) |
| `gesetze-historie-badge` · `leser-kopf-cls-s3` · `leser-marken-geometrie` · `leser-kopf-a9` · `leser-lesemass` · `leser-gliederung-a33` · `leser-gliederung-kein-overflow` · `leser-history-hash` · `leser-suche-klappzustand` · `leser-toc-sprung` · `leser-position-u` | **UNBERÜHRT, grün** | alle im Voll-Lauf gegen V3 grün. Die §7-Zeilen unten führten sechs davon als «UMHÄNGEN — Verdacht»; der Verdacht ist **widerlegt**, und keine Zeile wurde «auf Verdacht» angefasst |

### 7b · H5-Auflage: die Deckungslücken, an einer Stelle

H5 löscht die Ist-Hülle **erst**, wenn für jede Zeile hier eine `leser-v3-*`-Spec
steht. Sonst verschwindet mit der alten Hülle auch der Wächter, und niemand
merkt es. Nach Gewicht:

1. **Materialien-Daten am V3-Panel** (`materialien-m5-verzahnung`) — Rechtsdaten,
   höchstes Gewicht: kuratiertes Sublabel «via Art. 24», Dokument-Stand,
   async-Merge des Soft-Law-Shards.
   **21.8.2026 (§7b-Deckungsprüfung):** geprüft und ausdrücklich NICHT gebaut —
   `PanelMaterialien.tsx` schliesst Soft-Law/kuratierte Nachträge bewusst aus
   dem Reiter aus («SOFT LAW BLEIBT DRAUSSEN», Dateikopf-Kommentar dort: eine
   dritte/vierte Sache neben Entstehung/In-Arbeit, kein blosser Bau-Rückstand).
   Nachbau wäre >150 Zeilen (Shard-Merge, kuratiertes Sublabel, Erlass-Ebene-
   Zähler) UND ein Produktentscheid (gehört Soft-Law überhaupt in diesen
   Reiter?), keine reine Test-Deckungslücke. **Zusicherung in V3 bewusst
   entfallen — Alt-Spec fällt in H5 ersatzlos; David-Veto offen.**
2. **Facetten- und Zeitstrahl-WIRKUNG am V3-Panel** (`bezuege-facetten-b4`,
   `bezuege-zeitstrahl-b5`) — inkl. der beiden Migrations-Fälle gespeicherter
   Alt-Stufen. `leser-v3-panel-facetten` prüft heute nur den Ort.
3. **★-Wortlaut-Gleichheit und «via Art. N»** am Panel-Entscheid (`verzahnung`
   MM4/MM5) sowie das **↻** (`normrevision-badge`).
   **21.8.2026 (§7b-Deckungsprüfung):** MM4 und MM5 geprüft und ausdrücklich
   NICHT gebaut — beides dokumentierte V3-Produktentscheide, kein Bau-
   Rückstand. **MM4 (★):** `PanelEntscheide.tsx` Ä106-Kommentar («DAS ★ IST
   GESTRICHEN», Live-Ästhetik-Prüfung 18.8.2026) — die Leitfall-Zeile, an der
   der Vier-Orte-Vergleich seinen dritten Bein hatte, ist absichtlich
   entfallen; der Gruppenkopf trägt die Auskunft bereits im Wort. **MM5 («via
   Art. N»):** architektonisch entfallen — das V3-Panel ist gemäss Dateikopf
   («an EINEM Ort», Kap. 4d) IMMER auf den gelesenen Artikel gescopet, nie
   erlass-weit aggregiert; ohne Aggregat gibt es keine Mehrdeutigkeit, die ein
   Artikel-Sublabel auflösen müsste. Ein Nachbau widerspräche der erklärten
   Architektur und wäre zudem >150 Zeilen. **Zusicherung in V3 bewusst
   entfallen (Verweis auf die Ä106- bzw. Kap.-4d-Kommentare oben) — Alt-Spec
   fällt in H5 ersatzlos; David-Veto offen.** Das ↻ (`normrevision-badge`)
   bleibt offen — anders als MM4/MM5 eine reine Bau-Lücke, kein Entscheid.
4. **Erwägungs-Sprung und Kurztext-Popover** ab Panel-Chip (`verzahnung`
   Fundstelle A, `leitfaelle-chips` (d)).
5. **A34/Bug1 + Bug2 mit V3-Einstieg** und der **Druck im Split**
   (`split-view-a34`, `druck-fundstellen-z2`).

### 7c · Der eine rote Fall — Befund, drei Messungen, Entscheid (grün seit 18.8.2026)

> **Kurz:** Der Fall war rot, weil der Test die Eingabe programmatisch setzte und
> der Browser den Folge-Sprung darum nicht als eingabe-nah verbuchte. Entschieden
> ist **Weg 3** (unten): Geste wird echt, Budget bleibt 0, Verhalten bleibt.
> Der Abschnitt behält den vollständigen Befund, weil der Entscheid nur aus ihm
> heraus nachvollziehbar ist.

`leser-r1-r2:517` (A9-DoD, «Suche, Fundstellen-Sprung und Gliederungs-Sheet ohne
Layout-Shift») misst @390 unter 6× CPU-Drossel **CLS 0.0202 gegen Budget 0**
(zweimal gemessen: im Voll-Lauf und seriell mit `--workers=1`; Quelle laut Sonde
ein `DIV` der Such-Zone, der beim Suchstart um 24 px wächst und die Lesespalte
schiebt).

Drei Gründe, warum hier nichts gelockert und nichts gepinnt wird:

- **Die Assertion ist hüllenneutral richtig.** «Kein Layout-Sprung ohne
  Nutzereingabe» gilt in V3 genauso. Diesen Fall an die alte Hülle zu pinnen
  hiesse, einen echten V3-Befund zu verstecken (§8) — anders als bei allen
  Zeilen in 7a, wo der geprüfte ORT verschwunden ist.
- **Das Budget nachzugeben wäre §6.3-Bruch.** Ein Tor, dessen Zahl man an den
  Ist-Wert schiebt, misst nichts mehr.
- **Der Fix liegt in `src/pages/gesetz-leser/v3/SuchZone`** — dieselbe Fläche,
  die der Ä60-(c)-PR gerade umbaut, und er widerspricht
  `leser-v3-suchfeld-ueberall` (e) («die ausgelegte Höhe der Such-Zone deckt ihr
  Markup — ohne Luft»). Höhe reservieren heisst dort Luft einbauen. **Das ist
  ein Entscheid, kein Handgriff** — und er gehört in den Rahmen-PR, nicht in den
  Flip-PR.

**Einordnung:** kein Rechenfehler und kein Normtext-Befund (der Golden-Beweis ist
byte-gleich, s. Tore); ein Bedien-Detail auf dem Handy unter künstlicher
Drossel. Es blockiert den Flip nicht, aber es war der **eine offene rote Fall**
des Standes und durfte nicht als grün gemeldet werden. *(Die drei Gründe oben
gelten unverändert — nichts wurde gelockert, nichts gepinnt, und der Fix in
`v3/SuchZone` ist nicht gebaut worden. Der Fall ist über die Mess**geste** grün
geworden, nicht über die Schwelle; Herleitung unten.)*

#### Nachgemessen in der H4-Integration (18.8.2026) — drei Zahlen

Messbedingung durchgehend: `vite preview` aus `dist/`, Chromium,
`/gesetze/bund/BV` @390, CPU-Drossel 6×, Beobachter nach `#art-1`, nur Schritt 1
(«Suche beginnen»). Alle Reihen bit-stabil über ihre Läufe — Geometrie, kein
Rauschen.

| Messung | Ergebnis |
|---|---|
| **Ursache, punktgenau** | `[data-v3-such-zone]` 44 px (Ruhe) → 68 px (Suche läuft), also `SUCH_H_RUHE` 2.75rem → `SUCH_H_AKTIV` 4.25rem. Protokollierter Shift `DIV 178·666 → 202·642` = dieselben 24 px. Δ**0.0202**; die zweite Zeile Δ0.0016 ist die bekannte fremde Topbar-Grundlast |
| **Nullprobe gegen die alte Hülle** (§0 Ziff. 3) — dieselbe Geste, derselbe Build, `?leser=v1`, n=3 | **CLS 0.5509 / 0.5524 / 0.5524** (Mittel 0.5519), Grossbeitrag Δ0.5436 aus den `.lc-reveal`-Blöcken des V1-Suchmodus. V3 ist an dieser Geste **rund 27× besser** als der Ist-Stand — das Flip-Kriterium «CLS ≤ Ist-Stand» (Kap. 7) ist hier klar erfüllt. Der rote Fall misst kein V3-Defizit, er misst V3 gegen die **Null**, die V1 nie erreicht hat |
| **Messbedingung, die den Fall rot macht** — `fill()` gegen echtes Tippen (`click()` + `pressSequentially`), je n=2 | `fill()`: input-frei **0.0218**, als Input verbucht 0.0000. Echtes Tippen: input-frei **0.0016** (nur die fremde Topbar), als Input verbucht **0.0202**. Der Browser flaggt den Shift bei echter Eingabe `hadRecentInput = true` — für einen realen Leser ist er nach der CLS-Definition **ausgeschlossen**, genau wie es der Kopf von `v3/SuchZone` seit H2b behauptet |

#### ENTSCHIEDEN 18.8.2026 — Weg 3, und der Fall ist grün

**Provenienz.** Die drei Wege wurden David am 18.8.2026 mit allen Zahlen
vorgelegt; er hat nicht widersprochen. Der Orchestrator hat daraufhin **Weg 3**
gewählt. Das ist ein Prozess-/Mess-Entscheid (delegiert, Audit-P8 8.8.2026),
kein fachlich-juristischer — **Davids Stopp-Recht steht**: will er stattdessen
die 24 px Reserve (Weg 1) oder die Dauer-Zeile (Weg 2), öffnet das diesen Fall
wieder, und die Wege 1/2 stehen unten unverändert als Bauanleitung bereit.

| Weg | Entscheid | Grund in einem Satz |
|---|---|---|
| 1 · Höhe dauerhaft reservieren | **verworfen** | Nimmt jedem Leser, der nie sucht, 24 px Lesehöhe genau dort, wo der klebende Block das ganze Chrome ist — und stürzt die Zusage von `leser-v3-suchfeld-ueberall` (e) («deckt ihr Markup — ohne Luft») |
| 2 · zweite Zeile immer zeigen | **verworfen** | Verlangt eine neue inhaltliche Zusage (Standort-Angabe im Ruhezustand), die es heute nicht gibt — echtes Design, das nicht in einen Landungs-PR gehört |
| 3 · die Test-**Geste** auf echtes Tippen | **GEWÄHLT** | Kostet an der Oberfläche nichts, ändert kein Budget und keine Schwelle — nur die Art, wie die Eingabe erzeugt wird, und zwar in Richtung Wirklichkeit |

**Was konkret geändert wurde** (`e2e/leser-r1-r2.e2e.ts`, Schritt 1): `fill()` →
`click()` + `pressSequentially('Kanton', { delay: 60 })`. **Das Budget bleibt
0** für jeden Sprung ohne `hadRecentInput`; keine Zahl angehoben, keine Zeile
übersprungen, kein `skip`. Das Verhalten des Produkts bleibt unverändert: die
Such-Zone wächst beim Tippen weiter um 24 px — als bewusstes Feedback, B9-Regel
«die Zonen-Höhe hängt am Such-Zustand».

**Warum das keine Lockerung ist.** `fill()` setzt den Wert programmatisch; der
Browser sieht keine Nutzereingabe und flaggt den Folge-Shift
`hadRecentInput = false`. Die CLS-Definition schliesst eingabe-nahe
Verschiebungen ausdrücklich aus — der Test mass bis hierher also einen Wert,
**den kein Nutzer je erzeugen kann**. Nach der Umstellung deckt der Fall alles
ab, was er vorher deckte, und zusätzlich den Fall «ein Shift beim Tippen kommt
zu spät, um noch als eingabe-nah zu gelten»; mit `fill()` wäre der von der
Grundlast nicht zu unterscheiden gewesen.

**Der Einwand aus dem Vorstand — und was ihn auffängt.** Gegen Weg 3 stand hier
bis zum Entscheid: «der Sprung bliebe sichtbar, und der Test hörte auf, ihn zu
zeigen». Der erste Halbsatz stimmt und ist gewollt. Der zweite trifft nicht: die
**Grösse** des Sprungs hängt an `leser-v3-suchfeld-ueberall` (e), das die beiden
Zonen-Höhen festnagelt (Ruhe 44 px · Suche 68 px, rot zu bekommen über
`SUCH_H_RUHE`). Wächst die Zone künftig um mehr als diese 24 px, wird (e) rot —
nicht dieser Fall. Arbeitsteilung nach der Umstellung: **(e) bewacht die Geometrie,
A9-DoD bewacht die Metrik.** Ungedeckt bliebe allein ein Sprung, der beim Tippen
entsteht, aber ausserhalb des Eingabe-Fensters landet — und genau den fängt die
neue Geste, die alte nicht.

**Rot-Beweis (§6.7), gemessen 18.8.2026 am Integrationsstand:** mit `fill()`
CLS **0.0202** gegen Budget 0 → rot; mit echtem Tippen input-frei **0.0016**
(nur die fremde Topbar-Griffzone, nicht zugerechnet) → grün. Rot
zurückzuholen: `pressSequentially` in Schritt 1 durch `fill()` ersetzen.

**Die beiden verworfenen Wege — als Bauanleitung, falls David sie doch will:**

1. **Höhe dauerhaft reservieren** (`--leser-v3-such-h` konstant auf
   `SUCH_H_AKTIV`). Der Sprung verschwindet vollständig. **Preis:** 24 px
   dauerhaft leerer Raum im klebenden Kopf-Block — und zwar genau auf den
   Breiten, wo er am teuersten ist (Handy, Split-Panes, Desktop mit
   eingeklappter Gliederung), weil der Block dort das ganze Chrome ist.
   Zusätzlich fällt damit die Positiv-Sonde von `leser-v3-suchfeld-ueberall` (e)
   («die Zone wächst überhaupt») — die Zusage müsste ehrlich neu geschrieben
   werden, nicht gelockert.
2. **Die zweite Zeile immer zeigen, mit wechselndem Inhalt.** Die Zone bleibt
   konstant 68 px hoch; im Ruhezustand trägt die zweite Zeile eine ruhige
   Standort-Angabe (Gliederungspfad der sichtbaren Stelle), bei laufender Suche
   den Zähler «N Artikel · M Fundstellen · Treffer anzeigen →». Kein Sprung,
   kein Leerraum. **Preis:** ein Element mehr im Dauerbild und eine neue
   inhaltliche Zusage, die es heute nicht gibt — also echtes Design, nicht
   Nacharbeit.

---

### 7d · Die ursprüngliche Arbeitsliste (Stand 17.8.2026, unverändert)

*Sie bleibt als Grundlage stehen — 7a nennt, wo sie recht hatte und wo nicht.*

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
| **Ä60 ✅** | 825 | Beiwerk-Blatt verdeckt auf D @1440 die äusseren 112 px (18 %) jeder Textzeile; keine feste Blattbreite behebt es | **ERLEDIGT 18.8.2026 nach David-Entscheid (c) vom 17.8.** — der Leser-Rahmen wächst bei offenem Blatt auf höchstens 84 rem (1344 px), das Blatt bekommt eine eigene Spur; verdeckt ab Fenster 1024 px **0 px** (vorher 320/257/192/112), Erlass-Titel **0 px** (Ä59). Unter 1024 px unverändert. Mess-Tabelle: Fahrplan Kap. 7, Vollzugsvermerk «Ä60 (c) breiterer Leser-Rahmen» |
| ~~**Ä45 Doppelkrume**~~ | 938–940 | App-Krume und V3-Ortsangabe zeigten @390 denselben Ort in zwei `nav`-Krumen übereinander | ✅ **erledigt 17.8.2026 mit A-2** (Leisten-Verschmelzung; Vollzugsvermerk Kap. 7 des Fahrplans, bewacht von `e2e/leser-v3-eine-kopfzeile`). *Kein Flip-Blocker mehr — dieser Bogen entstand vor A-2 und führte ihn weiter (Nachzug 17.8. abends).* |
| ~~**Ä46 zwei ✕ je Pane**~~ | 940–941 | zwei Schliess-Kreuze je Pane mit verschiedener Bedeutung; gemessen im Split @1600 **44 px übereinander** (Griffleiste y = 69, V3-Kopf y = 113) | ✅ **erledigt 17./18.8.2026 mit H4-II** — im Pane trägt nur noch die Griffleiste ein ✕; die Inhalts-Handlung («zur Übersicht») steht benannt als «‹ Gesetze» mit demselben Ziel `/gesetze`. Bewacht von `e2e/leser-v3-h4-kopfwege` (b), `leser-kopf-paritaet`, `leser-v3-eine-kopfzeile` (d). *Kein Flip-Blocker mehr* |
| ~~**Ä79 zwei ☰ @1440**~~ | 724, 1785 | Gliederung eingeklappt @1440 → Kopf-☰ (x = 1117) **und** Schienen-☰ (x = 184) für dieselbe Handlung | ✅ **erledigt 17./18.8.2026 mit H4-II** — der Kopf-☰ weicht, solange die beschriftete Schiene steht; unter der Schienen-Schwelle bleibt er. Bewacht von `e2e/leser-v3-h4-kopfwege` (c)/(c2) |
| **Icon-Deckel @390** (neu, hier gemessen) | — | Kopfzeile @390 trägt **drei** reine Icons (⚖ · ☰ · ···), erlaubt sind zwei (Design-Grundlage Kap. 6); vor H4-II waren es dieselben drei (☰ · ··· · ✕) | **kann H5 tragen** — unverändert, kein Rückschritt; der Chip trägt seine Zahl erst nach dem Nachladen (§8 verbietet eine erfundene 0). *Nachgeführt 18.8.2026 (H4-Nachzug Teil A, Ä90): die drei stehen jetzt in **einer** Bauform mit 32-px-Ziel (vorher drei Umrisse, alle 24 px). Der Deckel bleibt **gerissen** — die Zahl selbst gehört zu Ä33/Ä34.* |
| ~~**Kopfzeile @720 = 5 Elemente**~~ | — | Einzelansicht `kompakt`: Ort · Zähler · ☰ · ··· · ✕ reisst den Vier-Elemente-Deckel — Befund älter als H4-II | ✅ **erledigt 18.8.2026 (H4-Nachzug Teil A, Ä91)** — das ✕ ist auf JEDER Breite gestrichen (Ä87: @1440 lag es 47 px über dem ✕ des offenen Blatts). Die Ä46-Auflage «Einzelansicht bleibt bei 1» ist **datiert ersetzt**: «höchstens ein ✕ je Kopfzeile, Rücksprung immer beschriftet». Nachher vier Elemente @720; bewacht von `leser-v3-h4-kopfwege` (d)/(e) |
| ~~**Ä87 / Ä92 / Ä89**~~ | Ästhetik-Prüfung 18.8.2026 | zwei ✕ gestapelt bei offenem Blatt (47 px) · Menü-Eintrag «Entscheide & Kontext …» als zweiter Öffner neben dem Chip · Steckbrief-Klappe unter statt über der Reiter-Leiste | ✅ **erledigt 18.8.2026 (H4-Nachzug Teil A)** — Kopf-✕ gestrichen · Öffner-Ordnung «ein Öffner je Breite» (F8-Regel unberührt) · Steckbrief-Zeile als Panel-Prop über den Reitern, `[role=tabpanel]` frei. Specs: `leser-v3-h4-kopfwege` (d)/(g), `leser-v3-uebersicht` (c2)/(c3) |
| ~~**Ä88 / P1-1**~~ | Ästhetik + Bug-Check 18.8.2026 | Panel-Öffnen im Schiebe-Modus schob `#art-429` hinter den Kopf (@1024 Abstand −1 → −45 px) · der Schienen-Griff war beim ersten Klick wirkungslos | ✅ **erledigt 18.8.2026 (H4-Nachzug Teil A)** — Stick-Ausgleich trägt beide Auslöser (@1024 nachher −1 → 0) · `schieneHoltPlatz` fragt die Lage statt `tocOffen` (ein Klick genügt). Specs: `leser-v3-rahmen` (e2)/(g) |
| ~~**B1 / B7 / B2**~~ | Klick-Test 18.8.2026 | Gliederungs-Blatt blieb nach Artikel-Tap offen (@390 VMWG 1 → 1) · Taste «t» fokussierte den Fedlex-Link im Steckbrief · Schalter «Rechtsprechung im Text» hatte im V3-Text 0 Wirkung | ✅ **erledigt 18.8.2026 (H4-Nachzug Teil A)** — `setTocAuf(false)` im Artikel-Sprung (beide Hüllen) · neue Marke `data-toc-baum` · Wortlaut «Rechtsprechung anzeigen» nach der wirklichen Wirkung. Spec: `leser-v3-h4-gliederungswege` (a)–(c) |
| **Ä86 ✅** | Klick-Test 18.8.2026 | Das angedockte Panel schloss bei JEDEM Klick in die Lesespalte (Modus «beiwerk») — **Textmarkieren bei offenem Panel unmöglich**, gemessen am Stand `6ca1609b3` @1440/@1024 | **ERLEDIGT 18.8.2026 mit Ä60 (c)** — wo das Blatt eine eigene Spur hat (@1440 und im Schiebe-Modus 1024–1391) ist es Layout, kein Popover: kein Aussenklick-Schluss, heraus über ✕ · Esc · Zweitklick auf den Zähler · «r». Unter 1024 px unverändert. Bewacht: `leser-v3-rahmen` (f)/(f2) |
| **A-8** (Rest) | 773, 1070, 1698 | Der 1024er-Spalten-Entscheid hängt noch an `istXl`; Umstellung verschiebt die Grenze auf Viewport 1072 (§3) | **NICHT umgehängt, 18.8.2026 — kein David-Entscheid mehr nötig, sondern drei Messgründe** (§3): die 1072er-Zahl gilt am H4-Stand unverändert, die Alternative `raum` misst im Pane ohne Scrollbar, und `istXl` trägt beide Hüllen. Abschluss mit **H5** |
| **B-Specs umhängen** | 1240, 1610, 1622 | §7 dieses Bogens | **BLOCKER VOR FLIP** — sonst Timeout-Hänger statt Fehlermeldungen |
| **Flaker** | 1746 | §6 dieses Bogens | **teilweise**; 2 von 3 brauchen CI-Forensik, nicht mehr lokale Läufe |
| **Ä9 Regler-Doppel** | 527, 938 | globaler App-Schriftregler im Leser noch zusätzlich sichtbar | **H5** — *nachgemessen 18.8.2026 (H4-Nachzug Teil A): @1440 steht der App-Regler (133 × 35 px), der Leser-Regler aber nur im aufgezogenen «Ansicht ▾» — im Ruhezustand stehen sie **nicht** nebeneinander; @390 ist der App-Regler ohnehin aus. NICHT gebaut, weil der saubere Weg (ein zweites `KopfDaten`-Feld) drei `layout/`-Dateien kostet und ein routen-gebundenes Ausblenden `?leser=v1` den **einzigen** Schriftregler nähme. Mit H5 fällt V1 — und der Einwand mit ihm.* |
| ~~**A-2 Leisten-Verschmelzung**~~ | 527, 644, 995 | zwei Leisten statt einer, 37 px Chrome-Preis; berührt `src/components/layout/**` | ✅ **erledigt 17.8.2026** (Vollzugsvermerk «A-2 Leisten-Verschmelzung», Fahrplan Kap. 7). **Arch 6, korrigiert 18.8.2026:** diese Zeile führte den Punkt weiter, als könne H5 die 37 px noch abräumen. Das ist überholt — das Band der App-Leiste **bleibt**, transparent und `pointer-events-none`, und der Leser-Kopf verschluckt es über `--leser-v3-app-band`. Ohne die Reservierung rückte `main#inhalt` 102 → 65 px hoch und das Bestands-Tor `leser-kopf-cls-s3` riss v3 @390 mit **0.0573 gegen 0.05**. Der Messwert ist seit dem Nachzug 17.8. **`APP_BAND_H` = 36 px** (`2.25rem`, Bug 8), nicht 37. Sichtbar gewonnen sind die 37 px trotzdem (Chrome D @1440 159 → 121 px, H @390 195 → 157 px). **Für H5 bleibt hier nichts zu löschen** |
| **Ä33/Ä34** | 941–944 | Chrome bis zur Lesefläche @390 = 183 px (22 %) ruhend, 207 px (25 %) mit Suche | **braucht Davids Entscheid** — es gibt keinen Zielwert, nur den Messwert |
| **Ä63 Handy-Einzug** | 548, 1404 | OR/ZGB @390 Einzug x = 80 px gegen StPO 44 px | **kann H5 tragen** — Typografie-Detail |
| **Ä64 Regler-Hierarchie** | 549, 1404 | Schriftregler skaliert nur `[data-lese]`; Hierarchie kippt bei 130 % | **braucht Davids Entscheid** — Umbau auf em-relative Tokens |
| **Ä57/Ä58** | 826 | Panel-Kopf ohne Warnzeichen bei «noch nicht im Text»; Chips gerahmt, ☰ nicht | **kann H5 tragen** |
| **Randlasche (F8)** | 772 | die Lasche hält an keiner Breite | **kein Flip-Blocker mehr** — sie war die *vermutete* Ursache des NM-2-Aufschlags auf H; der ist mit dem Kopf-Chip behoben, ohne dass die Lasche zurückkehrt. Was bleibt, ist Davids Bestätigung der §7-Abweichung zu F8 («Lasche behalten»). **Nachgeführt 18.8.2026:** David hat (c) gewählt, der Platz ist mit Ä60 da — die Lasche bleibt trotzdem gestrichen, weil an derselben Breite bereits der Kopf-Zähler steht und «ein Öffner je Breite» gilt. Der Platz ist da, gebraucht wird er nicht |
| **`leser-lesemass` umhängen · `LeserRahmenV3`-Schnitt** | 1240 | Test-Umzug bzw. Datei-Schnitt | **kann H5 tragen** |
| ~~**Ä84-Rest · «↑ Anfang» steht allein**~~ | Vermerk «H4-Nachzug — Teil B», Kap. 7 | Im Treffer-Blatt @390 trug der Blatt-Kopf **genau ein** Element (358 × 34 px für einen 62-px-Knopf, 246 px leer) — und direkt darunter stand das Suchbereich-Segment mit 288 px in einem 358-Kasten, also 70 px Stummel | ✅ **erledigt 18.8.2026 (Teil B, Ä94) — ohne dass ein Entscheid nötig war.** Der Widerspruch zu **Ä32** («der Knopf bleibt im Blatt») löst sich, weil der Knopf nicht gestrichen, sondern **abgegeben** wird: die Leiste reicht ihn in die Werkzeugzeile der Trefferliste, wo er genau den Stummel füllt (288 + 8 + 62 = 358). Zone A **34 → 0 px**, Blattinhalt 4052 → 3738 px, «↑ Anfang» weiterhin GENAU EINMAL im Blatt (`leser-v3-blatt` (d) unverändert grün, (f) neu) |
| **Panel-Reiter-Leiste bricht nicht um** (neu, 18.8.2026 gemessen) | Vermerk «H4-Vorbereitung II», Kap. 7 | Die Leiste hat @1440 **334 px** Platz; die drei Reiter belegen 269 px + 24 px Abstände, also bleiben **41 px**. Ein vierter Reiter passt damit an keiner ehrlichen Beschriftung («Steckbrief» 82 px, «Erlass» 55, «Norm» 51) — gebaut verschluckte die Leiste ihr viertes Fach (`scrollWidth` 369 gegen `clientWidth` 334). Fix wäre **ein Wort** an `[role="tablist"]` in `v3/LeserPanel.tsx` (`flex-wrap` oder `overflow-x-auto`) | **kann H5 tragen** — heute nichts unbedienbar (die Klappe über der Tafel löst den Steckbrief-Fall ohne Fach). **Aber:** Kap. 14 sieht für «Zitat-Export & Fussnoten-Ausgabe» ausdrücklich «vierter Reiter oder Fusszeile» als Platz vor — der vierte Reiter ist mit dieser Messung keine Option mehr, solange die Leiste nicht umbricht |
| **Ä75 ✅** | 1214, 1830 | «SR» stand über kantonalen Nummern («SR 640.100», «SR 211.11») — eine falsche Fundstellenangabe, keine Beschriftungsfrage | ✅ **erledigt 18.8.2026 (Teil B), Orchestrator-Entscheid mit Davids Stopp-Recht** — «SR» nur am Bundeserlass, die kantonale Nummer steht nackt. KEIN Ersatzkürzel: die kantonalen Sammlungen führen eigene Siglen (BS «SG», ZH «LS», AG «SAR», BE «BSG»), «BS 640.100» wäre erfunden (§7). Die Sigle ins Datenmodell zu nehmen ist H5/Korpus. Begründung in Fahrplan Kap. 9 |
| **Ä81 ✅** | 1825 | Die Konsolidierungs-Warnung stand ZWEIMAL gleichzeitig sichtbar (Übersichtsbox + Erlass-Kopf, gemessen StPO @1440) | ✅ **erledigt 18.8.2026 (Teil B), Orchestrator-Entscheid mit Davids Stopp-Recht** — nur der Kopf warnt; der «Stand» im Steckbrief BLEIBT (er ist dort Teil der Datums-Kette, nicht der Aktualitäts-Aussage). Begründung in Fahrplan Kap. 9 |
| **B6 · «Änderungen» meldete einen Fehler, den es nicht gab** (Klick-Test) | Vermerk «H4-Nachzug — Teil B», Kap. 7 | An jedem Kantonserlass «Änderungsverlauf konnte nicht geladen werden» — ohne Netzfehler. Gemessen: 227 Revisions-Sidecars, davon 0 kantonale; 404 und Fetch-Fehler enden beide als `null` | ✅ **Wortlaut erledigt 18.8.2026 (Teil B)** — der Satz nennt jetzt beide Möglichkeiten. **Der Wurzelfix bleibt offen:** 404 von Netzfehler trennen heisst `src/lib/normtext/revisionen.ts` anfassen = Risikopfad, eigener Schritt (§17 hinterlegt) |
| **B9 · 81 px Seiten-Überlauf @390** (Klick-Test) | Vermerk «H4-Nachzug — Teil B», Kap. 7 | Gemeldet als Tabellen-Fehler an ZH-211.11 § 4; nachgemessen ist die Tabelle korrekt gefasst, der Überläufer ist der Nachbar-Erlass-Link | ✅ **erledigt 18.8.2026 (Teil B)** — `min-w-0` + `[overflow-wrap:anywhere]` in beiden Hüllen; neuer Wächter `e2e/leser-kein-seitenueberlauf.e2e.ts` |
| **C5 · Fussnoten-Marker ohne `aria-controls`** (Klick-Test) | — | Der Marker wechselt `aria-expanded`, verweist aber auf nichts | **kann H5 tragen** — der Marker sitzt im **Kern-Render** (`components/normtext/ArtikelBody.tsx`), und das per Portal geöffnete `span[role="note"]` trägt heute gar keine `id`. Ein `aria-controls` verlangt also eine erzeugte id im Kern-Markup, das die Golden-Ausgaben decken |
| **C1 · Gliederung/Steckbrief über Reload vergessen** (Klick-Test) | Vermerk «H4-Nachzug — Teil B», Kap. 7 | Layout-Zustände überleben den Reload nicht, die Optionen schon | ✅ **entschieden 18.8.2026 (Teil B): bewusst NICHT persistieren** — Optionen sind Lese-Präferenzen über alle Erlasse, Gliederungs- und Steckbrief-Zustand sind Ankunfts-Zustände EINES Erlasses; dazu käme ein Pre-Paint-Lesen (§15.2) |

### Nachtrag 18.8.2026 · Säuberung nach der Live-Ästhetik-Prüfung

Der Live-Prüfer hat den gebauten Standard gegen dieselben Massstäbe gemessen
(Note **8/10**, Protokoll `aesthetik-live-2026-08-18.md`) und **Ä97–Ä125**
gemeldet. Die Säuberung (Branch `feat/leser-v3-saeuberung-bau`, Vollzugsvermerk
im Fahrplan Kap. 7) hat davon **18 Zeilen geschlossen**; die Tabelle oben ändert
sich dadurch an drei Stellen:

| Zeile oben | Was der Nachtrag ändert |
|---|---|
| **Ä81 ✅** | Der dort ausdrücklich **nicht mitentschiedene** `vorbehalt` («nächste Fassung ab …») ist jetzt entschieden — **Ä97**. Am OR @1440 stand er gemessen zweimal gleichzeitig; die Box trägt seither **gar keine** Warn-Zelle mehr, beide Aussagen gehören dem Kopf |
| **Ä75 ✅** | Die positive Hälfte («kantonale Sigle ins Datenmodell») bleibt H5/Korpus — **aber die §7-Lücke, die sie offenliess, ist zu**: **Ä98**, der Zitat-Text trug «SR» auch über kantonalen Nummern und schrieb damit eine falsche Fundstelle in die Zwischenablage. `baueZitat` liest jetzt dieselbe Weiche wie die sichtbare Kopfzeile |
| **B1/B7/B2 ✅** | Der dort neu gesetzte Wortlaut «Rechtsprechung anzeigen» ist mit **Ä115** noch einmal geschärft: «Rechtsprechung in der Kopfzeile» — dieselbe Wirkung, aber ein Substantiv wie seine beiden Nachbarn, statt eines Satzes, den das Zustandszeichen daneben zu Ende spricht |

**Neu offen für H5** (aus derselben Prüfung, in dieser Etappe bewusst nicht
gebaut — je mit Grund im Fahrplan Kap. 7, Tabelle Ä97–Ä125): **Ä99** (die
Übersichtsbox klebt; die Doku sagte bis 18.8. das Gegenteil — korrigiert, Bau
offen), **Ä104** (Treffer im Randtitel markieren = Suchlogik, keine
Beschriftung), **Ä109**, **Ä123**, **Ä124**, **Ä125** sowie die **App-Hälften**
von Ä110/Ä111/Ä112/Ä118 (`components/layout/**`, `NormPopover`, `NormChip` — in
dieser Etappe TABU).

**Weiterhin bei David** (unverändert, nicht gebaut): **Ä33/Ä34** (Chrome-Anteil
@390), **Ä64 = Ä113** (Regler-Hierarchie bei 130 %).

**Stand nach dem H4-Nachzug, Teil B (18.8.2026).** Geschlossen sind seit dem
Nachzug **Ä84** vollständig (Ä94 — der allein stehende «↑ Anfang» füllt jetzt den
Stummel neben dem Segment, statt gestrichen zu werden; **kein Entscheid nötig**),
**Ä96** (Randtitel ohne Ellipse, Schnipsel einzeilig), **Ä75** und **Ä81** (beide
per Orchestrator-Entscheid, **David hat Stopp-Recht** — Begründung in Fahrplan
Kap. 9) sowie aus dem Klick-Test **B6** (Wortlaut), **B9** und **C1**
(Entscheid). Dazu die Test-Nachzüge **P1-2/P1-3/P1-4** und **P3-8**. Der
Klick-Test liegt vollständig als Beleg unter
`klicktest-2026-08-18.md` in diesem Ordner.

**Was aus Teil B offen bleibt, benannt statt weggeglättet:** der **Wurzelfix zu
B6** (404 von Netzfehler trennen — Risikopfad `src/lib/normtext/**`), die
**kantonale Sammlungs-Sigle** (Ä75 positive Hälfte, braucht ein Registerfeld und
Verifikation je Kanton), **C5** (`aria-controls` verlangt eine erzeugte id im
Kern-Markup) und die **`vorbehalt`-Dopplung** («nächste Fassung ab …»), die Ä81
ausdrücklich NICHT mitentschieden hat, weil sie nicht gemessen werden konnte —
im Korpus lag kein Probe-Erlass mit `naechsteFassungAb` vor.

**Unverändert offen aus «H4-Vorbereitung II»:** **Arch 7** (Treffer-Blatt ohne
`usePopoverAutoZu`; Empfehlung im Vermerk: Beiwerk, nicht Popover).

**Erledigt 18.8.2026 — der letzte rote Fall.** `leser-r1-r2` (A9-DoD, CLS @390)
ist **grün**, entschieden nach **Weg 3** (§7c): das Verhalten bleibt (die
Such-Zone wächst beim Tippen um 24 px, B9-Regel), das Budget bleibt **0**, und
die Test-Geste wird die des Nutzers — `click()` + `pressSequentially` statt
`fill()`. Weder Schwelle angehoben noch Fall übersprungen; die **Grösse** des
Sprungs bewacht weiterhin `leser-v3-suchfeld-ueberall` (e) über die beiden
Zonen-Höhen 44/68 px. Rot-Beweis: mit `fill()` 0.0202 gegen 0 → rot, mit echtem
Tippen input-frei 0.0016 → grün. **Wartet auf David nur noch als Stopp-Recht:**
will er stattdessen die 24 px Dauer-Reserve (Weg 1) oder die Dauer-Zeile
(Weg 2), öffnet das den Fall wieder — beide stehen in §7c als Bauanleitung.


---

## 9 · Bilder

**24 von 24** unter `bilder/`, Namensform
`<erlass>-<breite>-<schema>-<huelle>.png` mit Breite ∈ {D = 1280, S = 720,
H = 390}, Schema ∈ {hell, dunkel}, Hülle ∈ {v1, v3}. Erlasse: **StPO Art. 429**
(gleicher Anker, gleiche Scrollposition in beiden Hüllen) und **BS-640.100**.
`deviceScaleFactor: 1`, `reducedMotion: reduce`, Schriften abgewartet.
Protokoll: `bilder-protokoll.json`.

**Vier Bilder kamen am 18.8.2026 dazu** (Ä60 (c), Suffix `-rahmen`, Panel offen):
`stpo-429-D1150-hell-rahmen.png` · `-D1150-dunkel-` · `-D1440-hell-` ·
`-D1440-dunkel-`. Sie zeigen die zwei Lagen, um die es beim Entscheid ging —
@1440 drei Spuren (Gliederung · Text · Blatt), @1150 Schiene · Text · Blatt.

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
