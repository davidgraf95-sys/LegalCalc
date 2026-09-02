# Zitatgraph-Warnungen — Fedlex ↔ LexMetrik-Verweiserkennung

> **Bericht, kein Tor.** Erzeugt von `npm run check:zitatgraph`, Exit stets 0,
> nicht Teil von `npm run gate`. Quelle: `messwerte/fedlex-zitatgraph.json`
> (amtliche `jolux:Citation`, DEU) gegen die Fassade `src/lib/fedlex`,
> angewandt auf die gespeicherten Normtext-Snapshots.

## Bekannte Rausch-Klassen — vor jeder Zeile mitlesen

**R1 · Fussnoten-Herkunft ist nicht unterscheidbar.** Fedlex führt Citations aus
dem Normtext UND aus den Fussnoten (Quellenverweise, AS-/BBl-Fundstellen) unter
demselben `citationFromReference`-eId; das Datenmodell trägt kein Merkmal, das
beide trennt (live geprüft 2.9.2026). LexMetrik speichert nur den Normtext —
jede Fussnoten-Citation MUSS hier als «nicht verlinkt» erscheinen. Ein
unbekannter, aber vermutlich erheblicher Teil der Zeilen unten gehört dazu.

**R2 · Ziel ausserhalb des Korpus** — der Leser könnte dort gar nicht verlinken;
separat gezählt, nicht in den Warnungen. **R3 · Absichtliche Zurückhaltung (§1)**
— wo das Ziel nicht deterministisch feststeht, verlinkt die Erkennung bewusst
nicht. **R4 · eId ohne Snapshot-Eintrag** (Anhänge, Übergangsrecht) — separat
gezählt.

**R5 · Verweis auf den GANZEN Erlass, ohne Artikelnummer.** Fedlex zählt auch
«… gilt zudem das Bundesgesetz vom 4. Oktober 1991 über das bäuerliche
Bodenrecht» (OR art_218) als Citation. LexMetriks Erkennung setzt durchweg an
einer Artikelnummer an — einen Erlass-Chip ohne Bestimmung kennt der Leser
nicht. Solche Kanten landen zwangsläufig in Klasse B; sie sind eine bewusste
Modell-Grenze, keine Lücke. Systematische Stichprobe von 10 Klasse-B-Zeilen
(2.9.2026): in KEINER steht eine «Artikel N …»-Stelle mit dem Zielkürzel im
Normtext (OR art_218 → BGBB, MVG art_79 → BVG, ZPO art_5 → FINIG …).

Eine Zeile ist damit ein **Prüfhinweis**, kein Fehlerbeleg.

## Zahlen

| Grösse | Wert |
|---|---|
| Erlasse im Graph | 227 |
| davon verglichen (Snapshot vorhanden) | 227 |
| Fedlex-Kanten vergleichbar (Ziel im Korpus, eId im Snapshot) | 3703 |
| davon vom Leser verlinkt | 1393 (37.6 %) |
| **A · Ziel erkannt, aber nicht verlinkt (N2 Form A)** | **824 (22.3 %)** |
| **B · Warnungen (Fedlex kennt Ziel, Leser erkennt es dort nicht)** | **1486 (40.1 %)** |
| R2 · Ziel ausserhalb des Korpus | 1689 |
| R4 · eId ohne Snapshot-Eintrag | 188 |
| Graph-Erlasse ohne Snapshot | 0 |

**Klasse A ist der belegte Rückstand**, Klasse B die offene Frage. In A nennt der
Normtext das Zielkürzel ausgeschrieben («Artikel N Absatz M KÜRZEL»), LexMetrik
erkennt es und verlinkt es trotzdem nicht (Kontrakt heute: nur Unterdrückung des
falschen Self-Links) — und Fedlex bestätigt genau dieses Ziel. In B mischen sich
R1 (Fussnoten) und R3 (absichtliche Zurückhaltung); B ist ohne Einzelprüfung
nicht auswertbar.

## Klasse A — erkannt, nicht verlinkt (Top 25)

| Erlass | SR | A | B | verlinkt |
|---|---|---|---|---|
| IVG | 831.20 | 51 | 22 | 34 |
| AIG | 142.20 | 48 | 19 | 30 |
| AsylG | 142.31 | 38 | 24 | 14 |
| UVG | 832.20 | 24 | 14 | 29 |
| StPO | 312.0 | 23 | 24 | 15 |
| IVV | 831.201 | 20 | 18 | 17 |
| BVG | 831.40 | 20 | 20 | 21 |
| MVG | 833.1 | 19 | 9 | 17 |
| AHVG | 831.10 | 18 | 20 | 21 |
| FINIV | 954.11 | 18 | 15 | 10 |
| AVIG | 837.0 | 17 | 17 | 17 |
| ZPO | 272 | 16 | 43 | 18 |
| VZG | 281.42 | 16 | 5 | 27 |
| FZG | 831.42 | 16 | 7 | 13 |
| ELG | 831.30 | 15 | 6 | 10 |
| EOV | 834.11 | 14 | 5 | 3 |
| KKV-FINMA | 951.312 | 13 | 21 | 6 |
| VEV | 142.204 | 12 | 6 | 3 |
| MStP | 322.1 | 12 | 8 | 21 |
| KVG | 832.10 | 12 | 18 | 12 |
| EOG | 834.1 | 12 | 31 | 10 |
| GwG | 955.0 | 12 | 2 | 15 |
| KAG | 951.31 | 11 | 26 | 15 |
| BankG | 952.0 | 11 | 11 | 14 |
| BankV | 952.02 | 11 | 6 | 6 |

### A · IVG (SR 831.20) — 51 Stellen

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_1`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_10`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_10`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_11`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_14_bis`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_14_bis`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_14_ter`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_22_bis`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_24_ter`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_27`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_28_a`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_3`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- … 39 weitere.

### A · AIG (SR 142.20) — 48 Stellen

- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_102_c`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108_d_bis`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108_d_quinquies`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_109_c`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_109_f`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 321.0 (MStG) aus eId `art_109_f`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_110_b_bis`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_111_d`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_124_a`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 321.0 (MStG) aus eId `art_124_a`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_31`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_31`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- … 36 weitere.

### A · AsylG (SR 142.31) — 38 Stellen

- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_102_c`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_102_m`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_102_m`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_107`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_109`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_109`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 321.0 (MStG) aus eId `art_109`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_111_a_quater`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_13`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_24_a`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_37`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- … 26 weitere.

### A · UVG (SR 832.20) — 24 Stellen

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_100`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_103`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_105_a`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_109`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_15`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_20`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_22`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_3`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_31`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_37`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_39`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- … 12 weitere.

### A · StPO (SR 312.0) — 23 Stellen

- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_121`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_165`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_170`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_171`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_173`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 812.121 (BetmG) aus eId `art_173`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_176`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_177`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_184`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_19`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_231`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_24`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.
- … 11 weitere.

## Klasse B — Erlasse mit den meisten Warnungen (Top 25)

| Erlass | SR | B | A | verlinkt | R2 | R4 |
|---|---|---|---|---|---|---|
| ZPO | 272 | 43 | 16 | 18 | 22 | 1 |
| OR | 220 | 31 | 2 | 17 | 16 | 12 |
| EOG | 834.1 | 31 | 12 | 10 | 15 | 0 |
| SchKG | 281.1 | 30 | 9 | 35 | 3 | 2 |
| ZEMIS-V | 142.513 | 27 | 6 | 8 | 38 | 4 |
| KAG | 951.31 | 26 | 11 | 15 | 3 | 0 |
| ZGB | 210 | 25 | 0 | 10 | 12 | 9 |
| AsylG | 142.31 | 24 | 38 | 14 | 11 | 2 |
| StPO | 312.0 | 24 | 23 | 15 | 33 | 3 |
| StGB | 311.0 | 22 | 4 | 25 | 40 | 0 |
| EBG | 742.101 | 22 | 7 | 9 | 14 | 2 |
| IVG | 831.20 | 22 | 51 | 34 | 11 | 6 |
| AHVV | 831.101 | 21 | 9 | 9 | 15 | 4 |
| KVV | 832.102 | 21 | 2 | 16 | 34 | 4 |
| KKV-FINMA | 951.312 | 21 | 13 | 6 | 8 | 11 |
| AHVG | 831.10 | 20 | 18 | 21 | 13 | 4 |
| BVG | 831.40 | 20 | 20 | 21 | 8 | 6 |
| FIDLEG | 950.1 | 20 | 7 | 11 | 0 | 0 |
| AIG | 142.20 | 19 | 48 | 30 | 26 | 0 |
| LFG | 748.0 | 18 | 3 | 13 | 9 | 0 |
| BetmG | 812.121 | 18 | 0 | 7 | 9 | 0 |
| IVV | 831.201 | 18 | 20 | 17 | 6 | 2 |
| KVG | 832.10 | 18 | 12 | 12 | 20 | 0 |
| StHG | 642.14 | 17 | 3 | 10 | 8 | 1 |
| AVIG | 837.0 | 17 | 17 | 17 | 13 | 0 |

## Klasse B — einzelne Hinweise

Je Erlass höchstens 12 Zeilen; vollständige Kantenliste im Artefakt.

### B · ZPO (SR 272) — 43 Hinweise

- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_145`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_199`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 291 (IPRG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_200`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_21`, Leser verlinkt dort nicht darauf.
- … 31 weitere.

### B · OR (SR 220) — 31 Hinweise

- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_1126`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_1135`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_1150`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_1151`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_1166`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_1184`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.301 (FusG) aus eId `art_181`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_193`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.412.11 (BGBB) aus eId `art_218`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_259_i`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_273`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_301`, Leser verlinkt dort nicht darauf.
- … 19 weitere.

### B · EOG (SR 834.1) — 31 Hinweise

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_16_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_16_i`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- … 19 weitere.

### B · SchKG (SR 281.1) — 30 Hinweise

- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_129`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_136`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_158`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_174`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 272 (ZPO) aus eId `art_185`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.110 (BGG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.231 (PartG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- … 18 weitere.

### B · ZEMIS-V (SR 142.513) — 27 Hinweise

- Fedlex kennt Ziel-SR 141.0 (BüG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_13`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_17`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.11 (DSV) aus eId `art_17`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.40 (Staatenlose) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- … 15 weitere.

### B · KAG (SR 951.31) — 26 Hinweise

- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_111`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_118_h`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_121`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_126`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_137`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_145`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- … 14 weitere.

### B · ZGB (SR 210) — 25 Hinweise

- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_d`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_363`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_365`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_375`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_413`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_43_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_449_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_455`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_456`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_46`, Leser verlinkt dort nicht darauf.
- … 13 weitere.

### B · AsylG (SR 142.31) — 24 Hinweise

- Fedlex kennt Ziel-SR 173.32 (VGG) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_108_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_121`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_17`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_41_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_43`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_58`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- … 12 weitere.

### B · StPO (SR 312.0) — 24 Hinweise

- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_127`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.222.338 (PAVO) aus eId `art_168`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_171`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_23`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_258_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_258_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_264`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_266`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.121 (BetmG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- … 12 weitere.

### B · StGB (SR 311.0) — 22 Hinweise

- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_108`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 101 (BV) aus eId `art_265`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 101 (BV) aus eId `art_275`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 742.101 (EBG) aus eId `art_285`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 742.101 (EBG) aus eId `art_286`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.101 (EMRK) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 642.14 (StHG) aus eId `art_305_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_321`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_325_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_326_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_352`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_352`, Leser verlinkt dort nicht darauf.
- … 10 weitere.

### B · EBG (SR 742.101) — 22 Hinweise

- Fedlex kennt Ziel-SR 152.3 (BGÖ) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_15_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 700 (RPG) aus eId `art_18`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_18_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_18_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_18_f`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_18_u`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 152.3 (BGÖ) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.056.1 (BöB) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.220.1 (BPG) aus eId `art_40_a_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_40_a_quinquies`, Leser verlinkt dort nicht darauf.
- … 10 weitere.

### B · IVG (SR 831.20) — 22 Hinweise

- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_11_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_14_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.056.1 (BöB) aus eId `art_21_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_23`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_24`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_26`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_36`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_39`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_3_a_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_3_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_3_b`, Leser verlinkt dort nicht darauf.
- … 10 weitere.

### B · AHVV (SR 831.101) — 21 Hinweise

- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.513 (ZEMIS-V) aus eId `art_133_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_141_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_141_septies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_174`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.11 (DSV) aus eId `art_174`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_211_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_28`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_34`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_35`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_41_bis`, Leser verlinkt dort nicht darauf.
- … 9 weitere.

### B · KVV (SR 832.102) — 21 Hinweise

- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_105_j`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_105_k`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_10_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_132`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_31`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_38`, Leser verlinkt dort nicht darauf.
- … 9 weitere.

### B · KKV-FINMA (SR 951.312) — 21 Hinweise

- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_109`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_111`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_116`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_116`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_79`, Leser verlinkt dort nicht darauf.
- … 9 weitere.

### B · AHVG (SR 831.10) — 20 Hinweise

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_153_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_24_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_28_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_43_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_43_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_43_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_49_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_50_a`, Leser verlinkt dort nicht darauf.
- … 8 weitere.

### B · BVG (SR 831.40) — 20 Hinweise

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_18`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_33_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_41`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.425 (FZV) aus eId `art_41`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_48`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_5`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_52_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_53_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_56`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_57`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_64`, Leser verlinkt dort nicht darauf.
- … 8 weitere.

### B · FIDLEG (SR 950.1) — 20 Hinweise

- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_34`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_4`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_4`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 954.1 (FINIG) aus eId `art_4`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_45`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 954.1 (FINIG) aus eId `art_45`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_51`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 954.1 (FINIG) aus eId `art_51`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_53`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_55`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 954.1 (FINIG) aus eId `art_55`, Leser verlinkt dort nicht darauf.
- … 8 weitere.

### B · AIG (SR 142.20) — 19 Hinweise

- Fedlex kennt Ziel-SR 173.32 (VGG) aus eId `art_108_d_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108_d_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108_f_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_122_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_43`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_44`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_45`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.40 (Staatenlose) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_59_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_59_b`, Leser verlinkt dort nicht darauf.
- … 7 weitere.

### B · LFG (SR 748.0) — 18 Hinweise

- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_100_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.748.0 (ICAO-Übk.) aus eId `art_11_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_21_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_26`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_36_d`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_36_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 700 (RPG) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_37_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_37_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_37_f`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_3_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 711 (EntG) aus eId `art_44`, Leser verlinkt dort nicht darauf.
- … 6 weitere.

### B · BetmG (SR 812.121) — 18 Hinweise

- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_12`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_12`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_16`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_16`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.21 (HMG) aus eId `art_1_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_26`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.201 (MWSTV) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 817.0 (LMG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- … 6 weitere.

### B · IVV (SR 831.201) — 18 Hinweise

- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_1_septies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_20_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_20_quinquies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_21_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_21_septies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 412.10 (BBG) aus eId `art_22`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 942.20 (PüG) aus eId `art_24_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_25`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_25`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.101 (AHVV) aus eId `art_32`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_3_decies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.102 (KVV) aus eId `art_3_septies`, Leser verlinkt dort nicht darauf.
- … 6 weitere.

### B · KVG (SR 832.10) — 18 Hinweise

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_102`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.102 (KVV) aus eId `art_49`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.32 (VGG) aus eId `art_53`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 642.11 (DBG) aus eId `art_65`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_8`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_83`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_84_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.11 (DSV) aus eId `art_84_b`, Leser verlinkt dort nicht darauf.
- … 6 weitere.

### B · StHG (SR 642.14) — 17 Hinweise

- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 700 (RPG) aus eId `art_12`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 232.14 (PatG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 232.16 (SortG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.21 (HMG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 420.1 (Kulturförderungsgesetz) aus eId `art_25_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_35`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.110 (BGG) aus eId `art_57_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_7`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_7`, Leser verlinkt dort nicht darauf.
- … 5 weitere.

### B · AVIG (SR 837.0) — 17 Hinweise

- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_121`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_22_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 412.10 (BBG) aus eId `art_60`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_83`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_88`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.40 (BVG) aus eId `art_92`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_94`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_95`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_96`, Leser verlinkt dort nicht darauf.
- … 5 weitere.
