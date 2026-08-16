# Kontaktbogen H1 — «Leser V3, Fundament»

Etappe **H1** aus `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7, Strang H).
Stand 16.8.2026, Branch `feat/leser-v3-h1`.

**Ansehen:** irgendein Gesetz mit `?leser=v3` öffnen, z. B.
`/gesetze/bund/STPO?leser=v3`. Zurück mit `?leser=v1`. Ohne Parameter sieht
jeder Besucher unverändert den heutigen Stand (FL-3, Risiko R10).

---

## 0 · Für David — in Alltagssprache

Der Gesetzes-Leser hat eine **zweite Hülle** bekommen. «Hülle» heisst: alles
ausser dem Gesetzestext selbst — die Kopfzeile, die Seitenleiste mit der
Gliederung, das Suchfeld. Der **Gesetzestext ist Zeichen für Zeichen derselbe**;
das ist gemessen und nicht behauptet (unten «Treue»).

Drei Dinge sind neu und sofort sichtbar:

1. **Eine Kopfzeile statt zweier Menüs.** «Gesetze › StPO · Art. 429» links,
   rechts ein einziges Menü «Ansicht» mit **drei** Schaltern (vorher vier
   Optionen mit 24 Kombinationen, jetzt drei mit acht) und die Schriftgrösse.
2. **Ein Feld statt zwei.** Bisher gab es im Gesetz zwei Eingaben: ein Suchfeld
   oben und ein Sprungfeld «Art. N» in der Gliederung. Jetzt gibt es **eines**:
   tippt man «429», bietet es den Sprung an; tippt man ein Wort, sucht es.
   Gemessen: Eingabefelder im Gesetz **2 → 1**.
3. **Die Gliederung steht wieder oben.** Vorher schob der Erlass-Kopf die
   Seitenleiste unter den unteren Bildschirmrand; jetzt ist der Baum ohne
   Scrollen da.

**Was noch fehlt und bewusst fehlt:** das Rechtsprechungs-Panel mit den Filtern
(Instanz/Kanton/Zeit) gibt es in der neuen Hülle noch nicht — es ist Etappe H3.
Die Entscheid-Hinweise **am Artikel** sind unverändert vorhanden (326 Zeilen in
beiden Hüllen, gemessen). Wer die Filter braucht, schaltet mit `?leser=v1`
zurück; die Einstellungen wandern mit.

**Wartet auf dich:** nichts Zwingendes für H1. Zwei Punkte zum Anschauen stehen
unten unter «Abweichungen» — die Schriftgrössen-Stufen und die zweite schmale
Leiste am oberen Rand.

---

## 1 · Nutzer-Massstab NM (Kap. 7, Abnahme-Kriterium)

**Messbedingung** (§0 Ziff. 3c — eine Zahl ohne Bedingung ist keine Zahl):
Chromium, Dev-Server, Erlass **StPO** (SR 312.0, 480 Artikel), Gesetz bereits
geöffnet, Scrollposition oben. **D** = 1440×900 · **H** = 390×844 · **S** =
Split-View-Pane ≈ 700 px (unter 1024 px verhält es sich wie H — dieselbe
Bottom-Sheet-Regel, Kap. 4b). Gezählt werden **Klicks/Taps** und
**Tastendrücke**; Sekunden sind hier nicht aussagekräftig, weil die Zahl der
Anschläge («429» + ↵) in beiden Hüllen identisch ist.

| Aufgabe | Breite | Ist (V1) | V3 | Verdikt |
|---|---|---|---|---|
| **NM-1** «Art. 429 aufschlagen» | D | 1 Klick + 5 Tasten (Feld «Art. N» in der Gliederung) | **0 Klicks** + 6 Tasten (`⌘K` → «429» → ↵) bzw. 1 Klick + 5 Tasten mit der Maus | **gesenkt** (Klicks 1 → 0); zusätzlich fällt die Entscheidung «welches der beiden Felder?» weg |
| | H | 2 Taps + 5 Tasten (☰ → Feld «Art. N» → «429» → ↵) | 2 Taps + 5 Tasten (☰ → Feld → «429» → ↵) | unverändert |
| | S | wie H | wie H | unverändert |
| **NM-2** «Entscheide zu Art. 429 sehen» | D | 0 Klicks am Artikel (Bezüge-Zeile) · Filter im Kontext-Panel der Seitenleiste (0–1 Klick) | 0 Klicks am Artikel (**dieselbe** Bezüge-Zeile, 326 in beiden Hüllen) · **Filter nicht verfügbar** | **Preis, ausgewiesen** — das Panel ist Etappe H3 (Kap. 4d). Der Ist-Wert ist dokumentiert, nicht verloren: `?leser=v1` zeigt ihn unverändert |
| | H/S | wie D, Panel am Leseende | wie D, kein Panel | **Preis, ausgewiesen** |
| **NM-3** «Stand + Warnung erkennen» | D · H · S | 0 Klicks (Stand in der App-Leiste **und** im Erlass-Kopf; Warnung «Änderung in Kraft, noch nicht konsolidiert» im Erlass-Kopf) | 0 Klicks (identisch) — zusätzlich steht «SR 312.0 · 480 Artikel · Stand 01.04.2025» in der **geschlossenen** Übersichtszeile der Seitenleiste | unverändert; Weg nicht länger |

**Damit ist die NM-Regel erfüllt:** NM-1 senkt eine Zahl (D), NM-2 weist einen
Preis aus (Panel → H3), NM-3 bleibt gleich.

**Nebenbefund, ehrlich benannt:** die reine *Volltextsuche* kostet auf **H**
einen Tap mehr (Ist: Lupe im Kopf = 1 Tap · V3: ☰ → Feld = 2 Taps), weil Kap. 4b
Suchfeld **und** Gliederung gemeinsam ins Bottom-Sheet legt. Das ist keine der
drei NM-Aufgaben, gehört aber in den Bogen. Kandidat für H2 (Suchverhalten).

---

## 2 · Treue — der Kern ist unangetastet

Gemessen am selben Erlass, beide Hüllen, je hell und dunkel:

| Grösse | Ist (V1) | V3 | |
|---|---|---|---|
| Artikel im DOM | 480 | 480 | gleich |
| Lesespalte `#lc-lesespalte` @1440 | 672 px | 672 px | gleich (A37-Lesemass) |
| Lesespalte @390 | 350 px | 350 px | gleich |
| Bezüge-Zeilen `[data-leitfall-zeile]` | 326 | 326 | gleich |
| Eingabefelder **im Gesetz** @1440 | 2 | **1** | Zielzahl Kap. 10 erreicht |
| Höhe der V3-Kopfzeile | — | 57 px (D) / 49 px (H) | Design-Grundlage Kap. 3 (56 / 48 + Haarlinie) |
| Höhe der App-Leiste | 37 px | 37 px | unverändert |

Der Sprung-Offset rechnet die neue Kopfhöhe mit: `#art-429` landet nach dem
Sprung auf **y = 156 px** = Topbar 64 + App-Leiste 36 + Kopfzeile 56 — also
exakt unter dem klebenden Chrome und nicht dahinter (Risiko R1, gemessen).

---

## 3 · Bilder

`bilder/<Breite>-<Thema>-<Hülle>.png`, erzeugt mit Playwright gegen denselben
Erlass, gleiche Scrollposition, `deviceScaleFactor: 1`:

| Datei | Inhalt |
|---|---|
| `D-light-v1.png` / `D-light-v3.png` | 1440×900, hell — Vorher/Nachher |
| `D-dark-v1.png` / `D-dark-v3.png` | 1440×900, dunkel |
| `H-light-v1.png` / `H-light-v3.png` | 390×844, hell |
| `H-dark-v1.png` / `H-dark-v3.png` | 390×844, dunkel |

**Split-View (S)** ist bewusst **kein** Bild, sondern ein Test:
`e2e/leser-kopf-paritaet.e2e.ts` prüft, dass in beiden Panes derselbe Kopf
steht (Fahrplan Kap. 7: «Split-View ist ein Test, kein Screenshot»).

---

## 4 · Abweichungen vom Fahrplan (datiert, mit Grund)

| # | Vorgabe | Umsetzung in H1 | Grund |
|---|---|---|---|
| A-1 | Schriftgrössen-Regler **4 Stufen** `[1.0, 1.08, 1.18, 1.3]` wie im Entscheid-Leser (Design-Grundlage Kap. 2.3, Entscheid D-A) | Der Regler im Ansicht-Menü bedient den **bestehenden globalen Skala-Store** (`lexmetrik-schriftskala`, 6 Stufen 0.9–1.4), den heute nur die Topbar ab `lg` anbietet | Zwei Gründe. (a) Ein zweiter Schriftgrössen-Speicher wäre eine zweite Wahrheit für dieselbe Frage (§5). (b) Die vier Werte sind **absolute** rem-Grössen für den Fliesstext und setzen die V3-Normtextgrösse (19 px) voraus — die kommt erst mit **S2**. In H1 bleibt der Normtext byte-gleich (Treue-Grenze PX); ein Regler mit Stufe 0 = 1.0 rem hätte ihn sofort verkleinert. **Vorschlag: die vier Stufen mit S2 nachziehen**, wenn die Baseline ohnehin einmalig neu gesetzt wird. |
| A-2 | Kopfzeile Kap. 4a mit ✕ | Die V3-Kopfzeile sitzt **unter** der bestehenden App-Leiste (Einzelansicht `InhaltsKopf`, Split-View `PaneKopf`) statt sie zu ersetzen; ihr ✕ heisst «Gesetz schliessen (zur Gesetzesübersicht)», das ✕ der App-Leiste behält seine App-Bedeutung | Die Verschmelzung beider Leisten verlangt Änderungen in `src/components/layout/**`. Die liegen ausserhalb der H1-Fläche und hätten die Ist-Hülle mitverändert — FL-4 friert sie ein. Dieselbe Aufteilung hat der Entscheid-Leser seit je (eigener sticky Kopfblock unter der App-Leiste). **Gehört zu H4/H5**, wenn V3 der Default ist. Preis heute: 37 px Chrome. |
| A-3 | «Rechtsprechung im Text» aus ⇒ Zähler **und** Lasche weg (Entscheid David 16.8., V-0/F8) | Der Schalter ist in V3 vorhanden und umgewidmet; Zähler und Lasche selbst gibt es noch nicht | Panel und Lasche sind **H3**. In H1 ist nur der Öffner-Platz vorgesehen, wie beauftragt. |
| A-4 | Kap. 10, Zeile «e2e N»: «8 bleiben unverändert grün» neben **zehn** Namen | Zahl auf 10 korrigiert | Bereits in der Vorprobe gemeldet; mit diesem Schnitt vollzogen. |
| A-5 | Kap. 12, A-1 (`scrollAnker.ts`-Claim) | Zeile gestrichen | In der Vorprobe widerlegt: der Spiegel existiert (`lesePosition.ts:54/:98`, Schlüssel `lexmetrik-leseposition`). |

## 5 · Kern-Ausnahmen

**Keine.** `ArtikelLeser`, `ArtikelBody` und die übrigen Kern-Dateien sind
unverändert; die V3-Hülle importiert sie. Die Quellensonde
`src/tests/leser-v3-adresse.test.ts` hält das fest (sie wird rot, sobald die
Hülle den Lesekörper selbst zusammensetzt).

## 6 · Belege

- `src/tests/leser-v3-optionen.test.ts` — die dreiwertige Historie zweiwertig zeigen, ohne den Store zu beschädigen
- `src/tests/leser-v3-kopfstufen.test.ts` — Overflow-Regel über **jede** Breite 280–2000 px
- `src/tests/leser-v3-adresse.test.ts` — ein Adress-Schreiber, kein Scroll-Sync, kein `imPane` in der Kopfzeile
- `src/tests/leser-v3-flag.test.ts` — Grundzustand AUS (FL-3/R10, aus der Vorprobe)
- `e2e/leser-kopf-paritaet.e2e.ts`, `e2e/leser-v3-suche-sprung.e2e.ts`,
  `e2e/leser-v3-seitenleiste-ordnung.e2e.ts`, `e2e/leser-v3-umschalten.e2e.ts`
- Playwright-Projekt `leser-v3`: dieselben zehn N-Specs gegen die neue Hülle
