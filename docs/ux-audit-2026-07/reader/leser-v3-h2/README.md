# Kontaktbogen H2 — Leser V3, Suchverhalten

Etappe **H2** des Roadmap-Schritts `W2·5m-LESER-V3` (Fahrplan
`fahrplaene/FAHRPLAN-LESER-V3.md`, Kap. 7). Stand 16.8.2026, Branch
`feat/leser-v3-h2`, PR #539.

**Messbedingung für alles hier:** lokal macOS, `vite preview` gegen frisch
gebautes `dist/`, warm. Wo eine Zahl unter Parallel-Last entstanden ist, steht
es dabei — eine Rate ohne Bedingung ist keine Zahl (§0 Ziff. 3).

---

## NM · Nutzer-Massstab (Klicks/Tastendrücke, Ist gegen V3)

Gemessen im Browser mit protokollierten Einzelschritten, nicht geschätzt.
Rohdaten: `nm-messung.json`. Erlass: StPO.

| Aufgabe | Breite | Ist (V1) | V3 | Δ |
|---|---|---|---|---|
| **NM-1** «Art. 429 aufschlagen» | Desktop 1280 | 3 | **3** | ±0 |
| **NM-1** | Handy 390 | 4 | **4** | ±0 |
| **NM-3** «Begriff suchen, zur 3. Fundstelle» | Desktop 1280 | 5 | **5** | ±0 |
| **NM-3** | Handy 390 | 5 | **6** | **+1** |

**Ehrlich gelesen: H2 senkt keine der Zahlen, und auf dem Handy kostet NM-3
einen Schritt mehr.** Nach der NM-Regel (Kap. 7) ist eine Etappe, die keine Zahl
senkt und keine als Preis ausweist, nicht abnahmefähig. Der Preis wird hier
ausgewiesen: der zusätzliche Handy-Schritt ist das Öffnen des Bottom-Sheets, in
dem das Suchfeld sitzt. Was H2 stattdessen verbessert, ist **nicht in
Schrittzahlen messbar**, sondern in Treffsicherheit: die Trefferliste ist von
«7/34» auf eine Zeile je Fundstelle mit Kontext-Schnipsel umgestellt — der
Nutzer sieht vorher, wohin er springt, statt blind weiterzuklicken. Diese
Aussage bleibt eine Behauptung, bis sie an einem Menschen geprüft ist; sie ist
mit den vorliegenden Mitteln nicht belegt.

## Bund-Probe (Kap. 7)

Je ein Erlass jeder Art, unter Flag geprüft, alle drei im Korpus vorhanden:

| Art | Erlass | Screens |
|---|---|---|
| Bundesgesetz | **StPO** (SR 312.0) | Ruhe + offene Suche, H/D/S, hell + dunkel |
| Verordnung | **VMWG** | Ruhe, H/D/S, hell + dunkel |
| Staatsvertrag | **LugÜ** | Ruhe, H/D/S, hell + dunkel |

**Befund: kein Sonderpfad.** Kopf-Etikett, Übersichtsbox, Gliederung und
Trefferliste sind in allen drei Arten gleich aufgebaut; die Unterschiede
stammen aus dem Datenmodell (Erlasstyp-Etikett, Artikelzahl, Anhang-Behandlung
beim LugÜ). Der automatische Sweep über **alle** Bundeserlasse bleibt
Flip-Kriterium H4 — diese Probe ist eine Stichprobe von drei, kein Beweis für
1458 Erlasse.

## Screens

46 Bilder unter `screens/`, Namensform
`<erlass>-<zustand>-<breite>-<schema>-<huelle>.png` mit
Breite ∈ {H = 390, D = 1280, S = Split ~720}, Schema ∈ {hell, dunkel},
Hülle ∈ {v1, v3}.

**Fehlend, ohne Beschönigung:** `stpo-ruhe-H-dunkel-v3`,
`stpo-suche-S-dunkel-v3`, `stpo-suche-S-hell-v3` — drei V3-Screens der StPO
sind nicht erzeugt worden. Die zugehörigen V1-Gegenstücke liegen vor.

## Barrierefreiheit (axe-core)

Rohdaten: `axe-cls.json`. V3, StPO, 1280×800, **Trefferliste nachweislich
offen** (56 Trefferzeilen im Baum gezählt, bevor gemessen wurde — sonst hätte
der Lauf eine leere Leiste geprüft und wäre folgenlos grün gewesen).

**52 Regeln ausgeführt, 48 bestanden, 1 unvollständig, 3 Verstoss-Gruppen:**

| Regel | Schwere | Knoten | Selektor |
|---|---|---|---|
| `link-in-text-block` | **serious** | 1 | `.hover\:text-brass-600` |
| `region` | moderate | 2 | `.lg\:block`, `.text-ink-600…text-micro` |
| `aria-allowed-role` | minor | 1 | `.self-start` |

Der `serious`-Befund heisst: ein Link im Fliesstext ist allein durch Farbe von
seiner Umgebung unterschieden, ohne Unterstreichung oder ausreichenden
Kontrastabstand — wer Farben schlecht unterscheidet, sieht ihn nicht als Link.
**Alle drei sind offen und in keiner Etappe eingeplant**; sie gehören der
Substanz nach zu **H2b** (Gestaltung) bzw. zur Ist-Hülle und sind dort noch
nicht als Positionen geführt.

## Layout-Sprung (CLS) beim Öffnen/Schliessen der Suche

| Aktion | CLS | Schwelle |
|---|---|---|
| Suche auf («Entschädigung» tippen) | **0** | 0.1 |
| Suche zu (Feld leeren) | **0** | 0.1 |

Gemessen mit `PerformanceObserver('layout-shift')`, `hadRecentInput`
ausgenommen, nach 2.5 s Abklingen der Startlast. Der Wert 0 ist der erwartete:
Trefferliste und Suchbereich entstehen in der Seitenleiste, der Normtext wird
nicht umgebrochen.

---

## Was auffällt (Sicht auf die Screens, ungefiltert)

Beim Durchsehen von `stpo-suche-D-hell-v3.png` fallen Dinge auf, die über die
bereits benannten Ästhetik-Positionen hinausgehen:

1. **Zwei Krumen-Leisten übereinander.** «Gesetze › Bund › StPO» (App-Ebene)
   und darunter «Gesetze › StPO Schweizerische Strafprozessordnung»
   (Leser-Ebene), getrennt durch eine leere Zone von rund 95 px. Dieselbe
   Ortsangabe zweimal, in zwei Formulierungen — **Ä1**, in H2b eingeplant.
2. **Zwei ✕ direkt nebeneinander im Suchfeld**, dazu `⌘K`. Das eine leert das
   Feld, das andere schliesst vermutlich die Suche; von aussen sind sie nicht
   unterscheidbar. **Bisher nirgends als Position geführt** — gehört zu H2b.
3. **Zwei Schliessen-✕ am rechten Rand** (auf Höhe beider Krumen-Leisten) mit
   verschiedener Wirkung. Gleiche Falle wie Ä12, andere Stelle.
4. **Schriftregler «A− 100 % A+» steht in der App-Leiste** sichtbar über dem
   Leser — bestätigt **Ä9** am Bild.
5. **Abgeschnittener Text im Trefferzähler**: «50 Artikel · 88 Fundste… -/88».
   Der Zähler ist die Kernauskunft der Trefferliste und darf nicht ellipsieren.
   **Bisher nicht als Position geführt.**
6. **Die App-Seitenleiste ist im Leser ausgeklappt** und nimmt links rund
   260 px — genau der Grund, warum die Lesespalte schmal wirkt (Ä1/Ä2, H2b).

Punkte 2 und 5 sind neu und sollten in H2b mit aufgenommen werden.

---

# Nachtrag — unabhängige Zweitmessung (Mess-Auftrag H2, 16.8.2026)

Dieser Teil stammt aus einem **getrennt beauftragten Mess-Lauf**, der parallel
zum Kontaktbogen oben lief und dieselbe Fläche unabhängig vermessen hat.
Er ersetzt nichts darüber, sondern ergänzt es — und korrigiert eine Stelle.
Rohdaten: `nm-messung.json`, `axe-v3-trefferliste.json`, `cls-v3-suche.json`,
`cls-positivkontrolle.json`, `screens-nachschuss.json`.

**Kollisions-Vermerk (§0 Ziff. 5).** Beide Läufe schrieben in denselben Ordner.
`nm-messung.json`, `screens/` und `screens-protokoll.json` stammen aus diesem
Mess-Lauf und wurden vom Kontaktbogen-Lauf mitcommittet (63c8aa267); `README.md`
(Teil 1) und `axe-cls.json` stammen vom Kontaktbogen-Lauf. Doppelarbeit ist
gemeldet, nicht stillschweigend wiederholt worden.

## Die drei fehlenden Screens sind nachgeholt — und zwei waren kein Flake

`screens/` enthält jetzt **48 von 48** Bildern. Die drei oben als fehlend
vermerkten sind erzeugt (`screens-nachschuss.json`):

| Screen | Warum der erste Lauf scheiterte |
|---|---|
| `stpo-ruhe-H-dunkel-v3.png` | Ladezeit-Überschreitung unter Parallel-Last — echter Flake, im Nachschuss grün |
| `stpo-suche-S-hell-v3.png` | **kein Flake:** `[data-v3-suchsprung] input` existiert im Split gar nicht |
| `stpo-suche-S-dunkel-v3.png` | dito |

## Befund S-1 — im Split verschwindet das V3-Suchfeld, in der Ist-Hülle nicht

Gemessen bei Viewport 1600 × 900, zwei Panes zu je **670 px** (StPO links,
VMWG rechts), Zählung der sichtbaren `<input>`-Elemente:

| Hülle | Sichtbare Suchfelder im Split | Weg zur Suche im Gesetz |
|---|---|---|
| Ist (V1) | 3 (Topbar + **je Pane eines**) | direkt, 0 Zusatzklicks |
| V3 | 1 (nur Topbar) | erst «Gliederung» des Panes öffnen, +1 Klick |

Im V3-Split ist das Feld **nicht bloss unsichtbar, sondern gar nicht im DOM**
(`count === 0`) — es lebt hinter dem Blatt, das der ≡-Knopf je Pane öffnet.
Das ist dieselbe Ursache wie der Handy-Mehrschritt bei NM-3: unterhalb der
Pane-Breitenschwelle fällt die Seitenleiste in die Blatt-Form, und das Suchfeld
fällt mit ihr. Die Kernaussage der Etappe («EIN Feld sucht UND springt») trägt
damit auf Desktop, aber nicht auf Handy und nicht im Split.

**Verschärfend:** das Blatt deckt das linke Pane **vollständig** ab
(`stpo-suche-S-hell-v3.png`). Wer im Split sucht, verliert genau den Text aus
dem Blick, in dem er sucht — die Trefferliste steht dann neben der *anderen*
Norm. In V1 bleibt der Text daneben stehen.

## Korrektur zu Teil 1 — die Trefferzeilen haben den Schnipsel *verloren*

Teil 1 begründet H2 damit, die Trefferliste sei «auf eine Zeile je Fundstelle
mit Kontext-Schnipsel umgestellt — der Nutzer sieht vorher, wohin er springt».
Die Messung am Bedienbaum zeigt das Gegenteil, gleicher Erlass, gleicher
Suchbegriff «Entschädigung»:

| Hülle | Beschriftung der ersten Trefferzeile |
|---|---|
| Ist (V1) | `Art. 47 Kosten 1 Entschädigungspflichten aus Rechtshilfemassnahmen trägt der ersuch…` |
| V3 | `Art. 47 Kosten 1` |

**V1 trägt den Kontext-Schnipsel, V3 nicht mehr.** Sichtbar auch in
`stpo-suche-D-hell-v3.png`. Was V3 dafür gewinnt, ist real, aber ein anderes:
die Trefferliste steht **direkt unter dem Suchfeld im oberen Bildbereich**
(V1: erst ab ca. 646 px, unterhalb des Falzes), und sie hat **Facetten**
(Alles · Titel · Text · Fussnoten), die V1 nicht kennt. Der Gewinn ist
Sichtbarkeit und Filterung, nicht Vorschau. Die Aussage in Teil 1 ist in
dieser Form nicht belegt und sollte vor der Abnahme berichtigt werden.

## Befund S-2 — die zwei ✕ im Suchfeld, mit Ursache

Teil 1 nennt sie als Beobachtung; hier die Wurzel. Das V3-Feld ist
`type="search"`, also rendert Chromium seinen eigenen Lösch-✕
(`::-webkit-search-cancel-button`). V3 legt **zusätzlich** einen eigenen Knopf
daneben:

```
<input type="search" class="… pr-16 sm:pr-20" aria-label="Im Gesetz suchen oder zu einem Artikel springen">
<button data-v3-such-leeren="true" aria-label="Suche leeren" class="absolute right-6 …">✕</button>
<kbd class="… right-2 …">⌘K</kbd>
```

In keinem Stylesheet des gebauten Stands steht eine Regel zu
`search-cancel-button` (Suche über alle `document.styleSheets`: 0 Treffer).
Die Ist-Hülle hat das Problem nicht, weil sie **keinen** eigenen Lösch-Knopf
mitbringt. Wurzel-Fix ist daher eine Zeile CSS oder `type="text"`, nicht eine
Umgestaltung.

## Barrierefreiheit — vier Bedingungen statt einer, mit Nullprobe

`axe-v3-trefferliste.json`. Tags wie `e2e/a11y.e2e.ts`
(`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`), Thema deterministisch gepinnt,
`reducedMotion: reduce`, Trefferliste vor jeder Messung positiv nachgewiesen
(**56 Trefferzeilen** im Baum gezählt).

| Lauf (V3, StPO, Trefferliste offen) | Regeln ausgeführt | bestanden | Verstösse |
|---|---|---|---|
| hell · 1280×800 | 32 | 30 | 1 |
| dunkel · 1280×800 | 32 | 30 | 1 |
| hell · 390×844 | 33 | 30 | 2 |
| dunkel · 390×844 | 33 | 30 | 2 |

| Regel | Schwere | Knoten | Selektor | wo |
|---|---|---|---|---|
| `link-in-text-block` | serious | 1 | `.hover\:text-brass-600` | alle vier Läufe |
| `aria-valid-attr-value` | **critical** | 1 | `button[aria-label="Navigation öffnen"]` | nur Handy |

**Nullprobe (§0 Ziff. 3): beide Befunde liegen auf dem Bestand, nicht auf V3.**
Derselbe Lauf gegen die Ist-Hülle (`?leser=v1`, Trefferliste ebenfalls offen)
liefert Zeichen für Zeichen dieselben zwei Verstösse — Handy 2, Desktop 1. V3
fügt keinen a11y-Verstoss hinzu und beseitigt keinen.

Der kritische Befund ist präzise benennbar: der Schubladen-Knopf der App-Leiste
trägt `aria-controls="seitenleisten-schublade"`, aber dieses Element existiert
nur, solange die Schublade offen ist — bei geschlossener Schublade zeigt das
Attribut ins Leere. Shell-Ebene, gehört nicht in H2b, sondern in die Ist-Hülle.

*Abweichung zu `axe-cls.json` aus Teil 1 (52 Regeln, `region`,
`aria-allowed-role`): andere Messbedingung und ein anderer, inzwischen
überbauter `dist/`-Stand. Beide Zahlenreihen sind je für sich belegt; für die
Abnahme gilt die hier, weil sie die Nullprobe mitführt.*

## Layout-Sprung (CLS) — vier Bedingungen, mit Positivkontrolle

`cls-v3-suche.json`. `PerformanceObserver('layout-shift')`,
`hadRecentInput` übersprungen, 2.5 s Abklingen vor dem Nullen, 900 ms Nachlauf
je Aktion (Muster `e2e/gesetze-footer-cls.e2e.ts`).

| Erlass | Viewport | CPU-Drossel | Suche **auf** | Suche **zu** (Esc) |
|---|---|---|---|---|
| StPO | 1280×800 | 6× | **0** | **0** |
| StPO | 390×844 | 6× | **0** | **0** |
| StPO | 1280×800 | 1× | **0** | **0** |
| VMWG | 1280×800 | 6× | **0** | **0** |

Kein einziger Verschiebungs-Quellknoten wurde protokolliert; nach Esc ist die
Trefferliste nachweislich aus dem DOM (`count === 0`), der Weg ist also
wirklich gelaufen.

**Positivkontrolle (§6.7), damit die Null etwas heisst:** derselbe Beobachter,
dieselbe Seite, ein künstlich eingefügter 220-px-Block am Seitenanfang ohne
Nutzereingabe ⇒ **CLS 0.1719** mit benannten Quellknoten
(`cls-positivkontrolle.json`). Der Messaufbau kann also rot werden; die Null
oben ist eine Messung, kein totes Werkzeug.

## Messbedingung, ehrlich

- Lokal macOS, `vite preview` gegen `dist/`, Port 4650, **warm**.
- **Unter Parallel-Last:** während aller Läufe fuhren fremde Playwright-Suiten
  mit mehreren Workern auf derselben Maschine. Auf Zeitmessungen wird deshalb
  **keine** Aussage gestützt; CLS, axe-Befunde und Schrittzahlen sind
  lastunabhängig. Der eine Ladezeit-Ausfall (`stpo-ruhe-H-dunkel-v3`) ist genau
  darauf zurückzuführen und im Nachschuss verschwunden.
- **Bau-Stand nicht einheitlich über den ganzen Screen-Satz:** `dist/` wurde am
  16.8. um 22:37 neu gebaut, der Screen-Lauf lief 22:33–22:38. Ein Teil der 45
  Bilder stammt aus dem Stand davor, der Rest und der Nachschuss aus dem
  danach. Für Augenschein und Struktur-Befunde trägt das; für einen
  **Pixelvergleich taugt der Satz nicht** — dafür wäre ein Neuschuss unter
  Bau-Sperre nötig.

## Bund-Probe — Ergebnis dieses Laufs

Alle drei Arten sind im Korpus und tragen denselben Code:

| Art | Key | SR | Artikel | Kopf-Etikett im Bild |
|---|---|---|---|---|
| Bundesgesetz | `STPO` | 312.0 | 480 | «BUNDESGESETZ · VERFAHRENSRECHT» |
| Verordnung | `VMWG` | 221.213.11 | 32 | «VERORDNUNG · PRIVATRECHT» |
| Staatsvertrag | `LUGUE` | 0.275.12 | 91 | «STAATSVERTRAG» |

Der Korpus führt **29 Staatsverträge** (SR-Nummern mit führender `0.`,
`public/normtext/register.json`) — es musste keiner erfunden werden.
**Kein Sonderpfad sichtbar**, mit einer Einschränkung, die erst am
Staatsvertrag auffällt: die zweite (Leser-)Krumenleiste nimmt den vollen
Erlasstitel auf und muss ihn bei LugÜ nach über hundert Zeichen abschneiden
(`lugue-ruhe-D-dunkel-v3.png`) — direkt über der H1, die denselben Titel
vollständig zeigt. Der Doppel-Krumen-Befund aus Teil 1 (Ä1) ist bei Verträgen
also nicht nur Redundanz, sondern eine abgeschnittene Redundanz.

## Was zusätzlich auffällt (Augenschein an den Bildern)

1. **Der Trefferzähler ellipsiert nur in der Desktop-Seitenleiste.** «50 Artikel
   · 88 Fundste… –/88» in `stpo-suche-D-hell-v3.png`, aber vollständig im
   Split-Blatt und auf dem Handy-Blatt (dort ist die Fläche breiter). Es ist
   also kein Textproblem, sondern eine zu schmale Seitenleiste — dieselbe
   Wurzel wie Ä1/Ä2.
2. **Auf dem Handy tragen die Leser-Knöpfe keine Wortmarke mehr.** V1 zeigt
   «Gliederung · Im Gesetz suchen · Rechtsprechung · Ansicht» als Text, V3 nur
   noch ≡ und ⋯ (`stpo-ruhe-H-dunkel-v3.png`). Der Weg zur Suche im Gesetz ist
   damit nicht nur einen Klick länger, sondern auch unbeschriftet.
3. **Vorbestehend, nicht V3:** das Topbar-Suchfeld ist auf dem Handy 42 px
   breit, der Platzhalter «Suche · OR 257d …» passt nicht hinein und das Feld
   sieht wie eine leere Kachel aus. In V1 und V3 identisch gemessen — gehört
   zur Ist-Hülle, nicht zu dieser Etappe.
