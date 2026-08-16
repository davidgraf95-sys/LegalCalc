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

### Layout-Sprünge (CLS) — V3 liegt unter dem Ist-Stand

Gemessen mit `PerformanceObserver('layout-shift')` über 2,5 s nach dem Laden,
Chromium, Dev-Server, kalter Kontext je Messung:

| Fall | Ist (V1) | V3 | |
|---|---|---|---|
| StPO @1440 | 0.0050 | **0.0006** | −88 % |
| StPO @390 | 0.0056 | **0.0024** | −57 % |
| BS EG StPO @1440 | 0.0039 | **0.0004** | −90 % |

Die Auflage «CLS ≤ Ist-Stand» ist damit nicht nur gehalten, sondern deutlich
unterschritten. Der Grund ist baulicher Art: die V3-Kopfzeile hat eine feste,
aus **einer** Quelle gesetzte Höhe (`--leser-v3-kopf-h`), und die Übersichtsbox
steht geschlossen — es wächst nach dem ersten Bild nichts mehr ein.

### Kantons-Probe (Risiko R5)

`BS-257.100` (EG StPO Basel-Stadt, 48 Paragraphen) rendert unter dem Flag
vollständig: Titel, Kopf, Gliederung, Lesetext — dieselbe Artikelzahl wie im
Ist-Stand, CLS 0.0004. Die Kopf-Felder, die es nur beim Bund gibt (SR-Nummer,
Fedlex-Konsolidierung), entfallen dort still, statt einen Platzhalter zu zeigen.

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
| A-6 | Kap. 12 A-3: Guard-Parität des Browser-Tab-Titels | **Erledigt** — nicht «war schon da»: auf `main` setzt `EntscheidLeser.tsx` den Titel **ohne** Guard, im Split-View trug der Reiter darum den Entscheid statt des Gesetzes. Die Vorprobe dieses PRs hat den Guard ergänzt; `src/tests/tab-titel-paritaet.test.ts` bewacht beide Leser. *(Der Vollzugsvermerk hatte das zuerst falsch als «bestand bereits» notiert — gemessen am eigenen Arbeitsbaum statt an `main`.)* |
| A-4 | Kap. 10, Zeile «e2e N»: «8 bleiben unverändert grün» neben **zehn** Namen | Zahl auf 10 korrigiert | Bereits in der Vorprobe gemeldet; mit diesem Schnitt vollzogen. |
| A-5 | Kap. 12, A-1 (`scrollAnker.ts`-Claim) | Zeile gestrichen | In der Vorprobe widerlegt: der Spiegel existiert (`lesePosition.ts:54/:98`, Schlüssel `lexmetrik-leseposition`). |

## 4b · Die N-Tests im Flag-Projekt — was der Paritätsbeweis wirklich zeigt

Der Fahrplan (Kap. 10) lässt zehn «N»-Specs **doppelt** laufen: ohne Flag gegen
den Ist-Stand, mit Flag gegen V3. «Diese Doppelung IST der Paritätsbeweis — eine
Hülle, die den Normtext verändert, wird auf genau einer Seite rot.»

**Ergebnis nach H1: 49 von 60 grün, 11 rot** (`npx playwright test
--project=leser-v3`, gegen den frischen Build). Jede der elf roten Zeilen wurde
einzeln nachgesehen. **Keine einzige betrifft den Normtext** — alle prüfen die
**Struktur der Ist-Hülle**, die V3 planmässig ersetzt:

| Rot | Was der Test verlangt | Warum V3 es nicht erfüllt |
|---|---|---|
| `gesetze-ux-g3a` (3) | Der Erlass-Kopf ist ein **direktes Kind** von `.lc-leser` (`.lc-leser > header`) | In V3 sitzt er in der rechten Rasterzelle, damit die Gliederung nicht unter die Falz rutscht (Ziff. 2). **Der geprüfte Inhalt stimmt**: «Verordnung» statt «Bundesgesetz» (VMWG), «Bundesgesetz» (ELG), «Paragraphen» + `#art-`-Anker (AG) sind in V3 unverändert vorhanden — nur der Anker-Selektor der Prüfung greift nicht mehr |
| `leser-optionen` (3) | **Genau zwei** `role="switch"` («Fussnoten», «Verweise») im Ist-Ansicht-Menü | V3 hat **drei** («Fussnoten», «Änderungsvermerke», «Rechtsprechung im Text») und keinen Verweise-Schalter — genau der Rückbau von Kap. 4f (24 → 8 Kombinationen). Ein grüner Test wäre hier der Beweis, dass H1 nichts getan hat |
| `leser-r1-r2` (4) | Ein **zweites** Feld «Zu Artikel springen» im TOC-Kopf und im Sheet | V3 hat **ein** Feld für Suche und Sprung — Pos. 4, die Behebung von K2. Der Test fordert genau die Dopplung, die die Etappe beseitigt |
| `leser-ruecksprung-r5-r7` (1) | Der Rücksprung landet **< 140 px** unter der Fensterkante | V3 landet auf **156 px** — und das ist korrekt: 156 px ist die exakte Höhe des klebenden Chrome (Topbar 64 + App-Leiste 36 + V3-Kopfzeile 56). Die 140-px-Schwelle war auf das Ist-Chrome (100 px) kalibriert. **Zugleich die schärfste Zahl für Abweichung A-2**: sobald H4/H5 die beiden Leisten verschmelzen, fällt der Wert unter die Schwelle |

**Was daraus folgt — eine Korrektur an Kap. 10, die David sehen sollte:** die
N-Liste ist **nicht sortenrein**. Sie enthält neben echter Normtext-Treue
(Marginalien, PDF-Download, Anhänge, Linien-Rückbau, Such-Vertrag, die neun
UX-Punkte — **alle 49 grün**) auch Specs, die die **Ist-Hüllen-Struktur**
festschreiben. Gegen eine neue Hülle können die letzteren **konstruktiv nicht**
grün werden; sie als Paritätsbeweis zu führen hiesse, jede Hüllen-Änderung als
Normtext-Verletzung zu melden. Der Fahrplan sieht ihr Ende ohnehin vor (H4:
«11 alte B-Tests werden entfernt/umgehängt») — **die Zuordnung ist nur zu früh
als «N» geführt**. Vorschlag: die vier Dateien beim nächsten Schnitt in Kap. 10
als **B** (Bedienung/Hülle) einordnen; N bleiben `gesetze-marginalie`,
`gesetze-pdf-download`, `gesetze-ux-9punkte`, `gesetze-ux-g3b-anhang`,
`leser-ohne-gliederungslinie`, `leser-suche-vertrag-b8` — und die sind **alle
grün**, in beiden Hüllen.

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
