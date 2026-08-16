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
