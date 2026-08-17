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

**Der Umschalter ist noch nicht umgelegt, und nach dieser Messung soll er es
auch noch nicht werden.** Von den acht technischen Bedingungen sind sechs
erfüllt; zwei nicht — und eine davon ist nicht kosmetisch: auf dem **Handy** ist
im neuen Leser die Rechtsprechung zu einem Artikel **mit dem Finger überhaupt
nicht mehr erreichbar**. Im heutigen Leser stehen die Entscheide direkt unter dem
Artikel, ohne einen einzigen Tap. Im neuen Leser sind sie in ein Seitenblatt
gewandert, und der Knopf, der dieses Blatt öffnet, wird auf schmalen Bildschirmen
ausgeblendet. Mit Tastatur geht es (Taste «r»), mit dem Finger nicht.

**Was du siehst, wenn umgeschaltet wird:** eine ruhigere Kopfzeile, ein einziges
Suchfeld statt zwei, und auf jeder Breite die Möglichkeit, direkt «429» zu tippen
und dort zu landen — das ist der Fortschritt, und er ist gemessen (auf Handy und
mittlerer Breite **ein Bedienschritt weniger** als heute). Auf dem Desktop steht
zusätzlich die Warnung «Eine in Kraft getretene Änderung ist noch nicht
eingearbeitet» sichtbar im Bild; im heutigen Leser fehlt sie dort ganz.

**Was danach noch offen ist:** die Handy-Erreichbarkeit der Entscheide (oben),
ein Seitenblatt, das auf dem Desktop die Zeilenenden des Gesetzestexts verdeckt
(Ä60), zwei übereinanderliegende Ortsangaben und zwei Schliess-Kreuze je Fenster.
Das sind vier Bedienfragen, keine Rechenfehler — der Gesetzestext selbst ist
pixelgenau derselbe, das ist eigens geprüft.

**Wenn es dir nicht gefällt, geht es zurück:** der Umschalter bleibt bis zur
Etappe H5 bestehen. Ein Klick auf `?leser=v1` (bzw. das Zurücksetzen des Flags)
und du bist wieder im heutigen Leser — ohne Datenverlust, ohne Neubau.

### Frage an dich — Ja oder Nein zum Umschalten?

Meine Empfehlung: **noch nicht.** Erst die Handy-Erreichbarkeit der Entscheide
(NM-2) reparieren, dann umschalten. Alles andere lässt sich nach dem Umschalten
mit dem Flag als Rückweg beheben; ein Rechercheweg, den es auf dem Handy nicht
mehr gibt, nicht.

---

## 1 · Kriterien-Matrix (Kap. 7, «alle, nicht auswählbar»)

| # | Kriterium | Ergebnis | Zahl |
|---|---|---|---|
| 1 | unveränderte **N-Tests** grün unter Flag | ✅ | Projekt `leser-v3`: **110 passed, 1 skipped, Exit 0**; Gegenprobe Projekt `chromium` über dieselben N-Specs plus die vier B-Specs plus die zwei S1-Specs: **77 passed, Exit 0** |
| 2 | **`leser-kopf-paritaet`** grün | ✅ | 1 Test, beide Split-View-Panes, 9.6 s, im Flag-Projekt |
| 3 | **PX** (Pixelvergleich) grün | ✅ *(mit Bedingung)* | Ruhe-Bedingung: Branch **3/3**, Basis `a516f12ef` **3/3**. Unmittelbar nach einem 8-Worker-Lauf: **2/5**, dreimal 1869 px (0.01) auf dem **V1**-Arm — exakt die Signatur, die S2 als Scroll-/Rasterungs-Artefakt dokumentiert. **Nullprobe negativ** (Basis unter Last nicht gegengemessen, Ruhe grün) → kein A-8-Effekt, aber ein offener Lastfall (§17-Zeile unten) |
| 4 | **NM** in keiner der drei Aufgaben verschlechtert | ❌ | NM-2 kostet auf D und S **je einen Schritt mehr** und ist auf **H per Tap gar nicht erreichbar** (Tabelle §2) |
| 5 | **CLS ≤ Ist-Stand** | ⬜ *(siehe §4)* | |
| 6 | **axe** grün | ⬜ *(siehe §5)* | |
| 7 | **Kantons-Probe** grün | ⬜ *(siehe §5)* | |
| 8 | drei bekannte **Flaker** mit Wurzel-Fix | ⚠️ teilweise | 1 von 3 mit belegter Wurzel behoben, 2 von 3 **lokal nicht reproduzierbar** (0/65 unter 8-Worker-Last) → kein Blindfix (§0 Ziff. 2). Details §6 |
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
| | H | **0 Taps** · 8 ms | **nicht per Tap erreichbar** (0 Öffner, 0 Randlasche; nur Taste «r») | **Verlust** |
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
eingelöst. Ergebnis: auf einem Telefon führt kein Finger-Weg zur Rechtsprechung.
Das ist keine Geschmacksfrage, sondern der Verlust eines Rechercheweges (§8) und
für mich der **einzige harte Blocker** vor dem Umschalten.

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

## 4 · Layout-Sprünge (CLS)

⬜ *(wird gefüllt)*

---

## 5 · axe und Proben

⬜ *(wird gefüllt)*

---

## 6 · Die drei Flaker (Kap. 14) — Verteilungen vorher/nachher

⬜ *(wird gefüllt)*

---

## 7 · B-Specs — Umhäng-Liste für H4 (Vorbereitung, kein Umbau)

⬜ *(wird gefüllt)*

---

## 8 · Offene H4-Auflagen aus H2b/H3/S2

⬜ *(wird gefüllt)*

---

## 9 · Bilder

⬜ *(wird gefüllt)*

---

## 10 · Belege

⬜ *(wird gefüllt)*
