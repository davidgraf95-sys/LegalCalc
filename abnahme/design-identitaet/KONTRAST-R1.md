# KONTRAST-PROTOKOLL R1 — W2·24-DESIGN-IDENTITAET

**Erhoben:** 6.9.2026, deterministisch aus `src/index.css` (`:root` + `html.dark`)
über `scripts/farbwelt-messung.ts` (culori, WCAG-2.x-Kontrastformel, sRGB).
Alle Werte sind **gemessen, nicht geschätzt** (§7); reproduzierbar durch das Tor
`npm run check:farbwelt`, das dieselbe Messfunktion benutzt.

**Anlass:** Runde R1 «Grundschicht» tauscht Papier, Tinte, die ganze
Messing-Skala, die Radien, die Schatten und beide Schriftfamilien. Damit ändert
sich **jede** Kontrastzahl der App — die Zahlen aus
`abnahme/startseite-v3/KONTRAST-PROTOKOLL.md` sind ab hier Herkunft, nicht
Ist-Stand (§2b: ein datierter Beleg wird ergänzt, nicht nachgeführt).

## 1 · Was verbindlich geprüft wird

`scripts/farbwelt-tabellen.ts` führt nach R1 **126 WCAG-Pflichtpaare**
(hell + dunkel), **6 Referenzwerte**, **2 Fixpunkte** und die Flächen-L-Leiter
in beiden Modi. Neu darunter: die vier Registerfarben als **Text**-Paare
(4.5:1) auf `--paper`, `--surface` und `--paper-raised`.
Tor-Ausgabe nach dem Bau:

```
Farbwelt-Tor ok — 126 WCAG-Pflichtpaare (hell+dunkel), 6 Referenzwerte (§4b-B),
2 Fixpunkte, Flächen-L-Leiter beide Modi. 1 beratende Warnung(en) offen.
```

## 2 · Ergebnis in einem Satz

**Kein AA-Verstoss.** Das knappste geprüfte **Text**-Paar ist
`ink-500`/`well` hell mit **4.82:1** (Schwelle 4.5) — der Tertiärton auf dem
versenkten Eingabefeld. Das knappste geprüfte **Nicht-Text**-Paar ist
`warn-line`/`warn-bg` hell mit **3.29:1** (Schwelle 3.0), unverändert aus
QS-UI-WARNLINE; neu dazu kommt `karte-kante`/`karte-voll` hell mit **3.66:1**
(vorher gold, jetzt Register «Gesetze» — die Reserve ist **grösser** als zuvor).

## 3 · Bewusst NICHT als Pflichtpaar aufgenommen (§8 statt stiller Lücke)

* **`reg-w`/`well` hell = 4.43:1** — unter AA. Die Registerfarbe «Werkzeuge»
  steht als Strich, Reiter-Unterkante, Randmarke und Kopfzeile auf Papier,
  Karte und schwebender Ebene; sie steht **nicht** in einem Eingabefeld. Ein
  Pflichtpaar ohne Konsumenten wäre ein erfundener Befund (§7) — die Zahl steht
  darum hier, gemessen, statt im Tor. Wer in R2–R5 einen Registerton in ein
  `.lc-input` setzt, muss ihn vorher abdunkeln.
* **`--rule-soft` (#DADADA hell / #333333 dunkel)** — die 1-px-Zeilentrennung
  ist rein dekorativ (WCAG 1.4.11 nimmt rein dekorative Grafik aus; die
  Trennung trägt keine Information, die nicht auch aus Abstand und Satz folgt).
  Die informationstragende 2-px-Kante `--rule` ist die Tinte selbst
  (17.65:1 hell / 15.60:1 dunkel).
* **`danger-500`/`paper` dunkel = 2.72:1** — unveränderter Altbestand mit
  Baseline-Guard (`RISSE`), alle Call-Sites sind auf `--danger-line` aliassiert.

## 4 · Abweichungen vom Referenzbild, mit Grund

| Referenzbild | Umgesetzt | Grund |
|---|---|---|
| `--paper` hell `#FFFFFF` | `#FBFBFB` | `check-farbwelt.ts` erzwingt die Flächen-Leiter `well < paper < surface < paper-raised` (FAIL, nicht Warnung). Über dem Papier braucht es zwei hellere Flächen — `#FFFFFF` ist jetzt `--paper-raised`, die schwebende Ebene. Sichtbarer Unterschied zu Reinweiss: ΔL ≈ 0.006. |
| `--ink-3` hell `#767676` | `--ink-500` `#696969` | `#767676` liegt auf `--well` bei 4.44:1 — unter AA. Der dunklere Ton hält 4.82:1 und bleibt tonal derselbe Tier. |
| Ink-Rampe warm (Referenz `#ECEAE4` dunkel) | chromafrei (`#EDEDED`) | Die Wärme WAR die halbe Creme-Signatur (Fahrplan §1). C = 0 in beiden Modi; der harte Hue-Drift-Wächter für `ink` greift bei C = 0 nicht mehr, die L-Monotonie bleibt geprüft. |
| Archivo `wdth` 87.5 | Breite normal (`wght`-Achse) | Die `wdth`-Achse kostet im latin-Subset **90.1 KB statt 34.9 KB** (+158 % Erstlast) für eine Breitenstufe (§15). Rückkehr = Import auf `wdth.css` + `font-stretch: 87.5%`; Entscheid offen für R2/R5. |

## 5 · Schrift-Nutzlast (gemessen, latin-Subset «normal» — was deutscher Text zieht)

| | Datei | roh | gzip |
|---|---|---:|---:|
| vorher | `geist-latin-wght-normal.woff2` | 29 400 B | 29 458 B |
| vorher | `geist-mono-latin-wght-normal.woff2` | 23 128 B | 23 191 B |
| vorher | `source-serif-4-latin-wght-normal.woff2` | 50 824 B | 50 901 B |
| **vorher, Summe** | | **103 352 B (100.9 KB)** | **103 550 B (101.1 KB)** |
| nachher | `archivo-latin-wght-normal.woff2` | 34 928 B | 35 002 B |
| nachher | `literata-latin-wght-normal.woff2` | 52 496 B | 52 486 B |
| **nachher, Summe** | | **87 424 B (85.4 KB)** | **87 488 B (85.4 KB)** |

**−15.5 %** — trotz zweier neuer Familien, weil `--font-mono` seit R1 eine
System-Kette ohne eigenes Paket ist. (woff2 ist bereits Brotli-komprimiert;
gzip darüber ist wirkungslos und im Zweifel minim grösser — die Spalte steht
nur, weil das Budget-Tor in gzip rechnet.)
`check:perf-budget` grün: entry 56.5 KB / Budget 60.0 KB.
Beide Familien OFL-1.1 (`check:lizenzen` grün, 0 rote Pakete).

## 6 · CLS-Sicherung

Die metrik-angepassten Fallbacks sind neu aus den **echten** woff2 gemessen
(`npx vite-node scripts/gen-font-fallbacks.ts`, @capsizecss), nicht geraten:

* `Archivo Fallback` (Arial/Arimo/Liberation Sans): ascent 85.8362 %,
  descent 20.5303 %, line-gap 0 %, size-adjust 102.2878 %
* `Literata Fallback` (Georgia): ascent 109.3141 %, descent 28.6056 %,
  size-adjust 107.6714 %
* `Literata Times Fallback` (Liberation Serif/Tinos/Times, Linux-CI):
  ascent 99.6159 %, descent 26.0677 %, line-gap 0 %, size-adjust 118.1538 %

## 7 · Vollständige Messreihe

### Fliesstext und Tiers

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `ink-900` | `paper` | 17.65 | 15.60 |
| `ink-900` | `surface` | 17.95 | 14.87 |
| `ink-900` | `well` | 16.02 | 16.49 |
| `ink-900` | `paper-raised` | 18.26 | 13.75 |
| `ink-600` | `paper` | 8.56 | 8.42 |
| `ink-600` | `surface` | 8.71 | 8.03 |
| `ink-600` | `well` | 7.78 | 8.90 |
| `ink-600` | `paper-raised` | 8.86 | 7.42 |
| `ink-500` | `paper` | 5.31 | 5.72 |
| `ink-500` | `surface` | 5.40 | 5.45 |
| `ink-500` | `well` | 4.82 | 6.05 |
| `ink-500` | `paper-raised` | 5.49 | 5.04 |
| `placeholder` | `well` | 4.96 | 5.59 |

### Akzent (ehem. Messing, jetzt Tinte) und Fokus

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `brass-700` | `paper` | 17.65 | 15.60 |
| `brass-700` | `surface` | 17.95 | 14.87 |
| `brass-700` | `well` | 16.02 | 16.49 |
| `brass-700` | `paper-raised` | 18.26 | 13.75 |
| `brass-700` | `brass-100` | 16.17 | 13.42 |
| `brass-800` | `brass-100` | 17.21 | 14.42 |
| `ink-900` | `brass-100` | 16.17 | 13.42 |
| `ink-600` | `brass-100` | 7.85 | 7.25 |
| `brass-line` | `surface` | 4.47 | 5.45 |
| `focus` | `paper` | 17.65 | 5.72 |
| `focus` | `surface` | 17.95 | 5.45 |
| `focus` | `well` | 16.02 | 6.05 |
| `focus` | `paper-raised` | 18.26 | 5.04 |

### Registerfarben

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `reg-g` | `paper` | 11.10 | 8.18 |
| `reg-g` | `surface` | 11.29 | 7.80 |
| `reg-g` | `paper-raised` | 11.48 | 7.22 |
| `reg-r` | `paper` | 9.86 | 8.21 |
| `reg-r` | `surface` | 10.03 | 7.82 |
| `reg-r` | `paper-raised` | 10.20 | 7.24 |
| `reg-m` | `paper` | 5.82 | 9.44 |
| `reg-m` | `surface` | 5.92 | 8.99 |
| `reg-m` | `paper-raised` | 6.02 | 8.32 |
| `reg-w` | `paper` | 4.88 | 9.11 |
| `reg-w` | `surface` | 4.96 | 8.68 |
| `reg-w` | `paper-raised` | 5.05 | 8.03 |
| `reg-w` | `well` | 4.43 | 9.63 |

### Status (unverändert, auf neuem Papier neu gemessen)

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `sage-700` | `sage-bg` | 5.91 | 8.43 |
| `slate-700` | `slate-bg` | 6.68 | 7.76 |
| `warn-700` | `warn-bg` | 5.25 | 7.31 |
| `danger-700` | `danger-bg` | 7.72 | 6.67 |
| `ink-900` | `warn-bg` | 15.91 | 12.69 |
| `ink-900` | `danger-bg` | 15.17 | 13.82 |
| `ink-900` | `sage-bg` | 15.54 | 13.26 |
| `ink-900` | `slate-bg` | 15.37 | 13.51 |
| `ink-600` | `warn-bg` | 7.72 | 6.85 |
| `ink-600` | `danger-bg` | 7.36 | 7.46 |
| `ink-600` | `sage-bg` | 7.54 | 7.16 |
| `ink-600` | `slate-bg` | 7.46 | 7.29 |
| `warn-line` | `warn-bg` | 3.29 | 3.94 |
| `danger-line` | `danger-bg` | 5.58 | 6.67 |
| `sage-line` | `sage-bg` | 4.05 | 8.43 |
| `slate-line` | `slate-bg` | 4.66 | 7.76 |
| `sage-line` | `surface` | 4.68 | 9.45 |
| `slate-line` | `surface` | 5.44 | 8.53 |
| `danger-line` | `paper` | 6.49 | 7.53 |

### Kantonskarte (Füllungen neu: Register «Gesetze»)

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `karte-kante` | `karte-voll` | 3.66 | 4.88 |
| `karte-kante` | `karte-auswahl` | 5.83 | 6.27 |
| `karte-kante` | `karte-duenn` | 8.71 | 7.99 |
| `karte-kante` | `karte-leer` | 10.29 | 11.66 |

### Aufgelöste Token-Werte

| Token | hell | dunkel |
|---|---|---|
| `--paper` | #FBFBFB | #151515 |
| `--paper-raised` | #FFFFFF | #212121 |
| `--paper-sunken` | #F0F0F0 | #0E0E0E |
| `--surface` | #FDFDFD | #1A1A1A |
| `--well` | #F0F0F0 | #0E0E0E |
| `--ink-900` | #151515 | #EDEDED |
| `--ink-800` | #262626 | #DCDCDC |
| `--ink-700` | #383838 | #C9C9C9 |
| `--ink-600` | #4A4A4A | #B0B0B0 |
| `--ink-500` | #696969 | #909090 |
| `--ink-400` | #8C8C8C | #6E6E6E |
| `--ink-300` | #B0B0B0 | #4F4F4F |
| `--placeholder` | #676767 | #8A8A8A |
| `--brass-800` | #0D0D0D | #F5F5F5 |
| `--brass-700` | #151515 | #EDEDED |
| `--brass-600` | #4A4A4A | #C9C9C9 |
| `--brass-500` | #767676 | #909090 |
| `--brass-400` | #A3A3A3 | #6E6E6E |
| `--brass-300` | #C7C7C7 | #4F4F4F |
| `--brass-200` | #E4E4E4 | #2E2E2E |
| `--brass-100` | #F1F1F1 | #232323 |
| `--reg-g` | #1F3A5F | #8FB0DC |
| `--reg-r` | #7A1F2B | #E39AA6 |
| `--reg-m` | #4E6B3A | #A4C48C |
| `--reg-w` | #8A6A1F | #D2B46A |
| `--rule` | #151515 | #EDEDED |
| `--rule-soft` | #DADADA | #333333 |
| `--focus` | #151515 | #909090 |
