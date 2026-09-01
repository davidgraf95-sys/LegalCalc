# Leser-Tempo QS-PERF — Zeit bis bedienbar, A/B vor und nach zwei Massnahmen

> **Messung mit Massnahme.** Anders als das Vorgänger-Dossier
> [Kanton-Reader-Profil](kanton-reader-profil-2026-08-31.md) (reines Profil,
> «erst messen, nichts fixen») hält dieses Dossier eine **A/B-Reihe** fest: der
> Basis-Stand und derselbe Stand mit zwei gebauten Massnahmen, gemessen in
> derselben Sitzung auf derselben Maschine.

- **Erstellt:** 1.9.2026, ROADMAP-Schritt `QS-PERF` (Leser-Tempo), Branch
  `feat/qs-perf-leser-tempo`, Basis-Stand `cd4dc65cb`.
- **Status:** ERSTRECHERCHE (Messwerte; jede Zahl auf EINER Maschine erhoben —
  belastbar sind die **A/B-Differenzen und Verhältnisse**, nicht die
  Absolutwerte).
- **Abnahme-Status:** keine fachliche Abnahme nötig und keine erteilt — es sind
  Messwerte, keine Rechtsinhalte.
- **Pflegebedarf:** Die Zahlen altern mit jedem Bundle- und Datenzuwachs. Sie
  werden **nicht nachgeführt, sondern ergänzt** (§0 Ziff. 2b). Laufende Wächter
  bleiben `check:perf-budget` (Nutzlast) und `check:perf-lighthouse` (CLS/LCP).
- **Quellen:** eigene Messreihen gegen `dist/` via `vite preview` +
  Playwright-Chromium/CDP. Werkzeug: `scripts/perf/leser-tempo.ts`
  (`npm run perf:leser`) — in diesem Schritt gebaut, im Repo, reproduzierbar.

## Messaufbau (reproduzierbar)

```
npm run build
npm run perf:leser -- --laeufe=5 --cpu=4 --netz=4g
npm run perf:leser -- --wasserfall --cpu=4 --netz=4g --route=/gesetze/bund/OR
```

- **Messgrösse «bedienbar»** = `[data-v3-ansicht]` im DOM. Bewusst genau die
  Bedingung, gegen die neun Leser-Specs warten
  (`e2e/helpers/leserBereit.ts`): der Ansicht-Öffner steht **nicht** im
  Prerender-HTML (dort ist kein einziger `<button>`), er existiert erst nach
  dem Client-Render. Zweite Messgrösse `article[id^="art-"]` (erster Artikel des
  interaktiven Lesers) — dieselbe wie im Kanton-Reader-Profil, damit die Reihen
  vergleichbar bleiben. Beide Marker fielen in allen Läufen zusammen.
- Erfasst per **MutationObserver aus einem Init-Script**, nicht per Polling —
  Polling verzerrt unter CPU-Drossel die eigene Messung.
- **Jeder Lauf kalt:** frischer Browser-Kontext + `Network.setCacheDisabled`.
- Drossel über CDP (`Emulation.setCPUThrottlingRate`,
  `Network.emulateNetworkConditions`); langsames 4G = 1.6 Mbit/s ↓ / 150 ms RTT,
  langsames 3G = 400 kbit/s ↓ / 400 ms RTT. Viewport 1440×900.
- **Netz-Mitschnitt über CDP**, nicht über `PerformanceResourceTiming` —
  Letzteres legt den Eintrag erst bei Abschluss an und übersieht genau die
  Downloads, die beim Marker noch laufen (Lehre aus dem Vorgänger-Dossier).

## Kalibrierung gegen das Vorgänger-Dossier

Bevor die A/B-Reihe zählt, muss das Werkzeug dieselbe Welt sehen wie das
Profil vom 31.8.2026. Auf dem Basis-Stand, 6× CPU + langsames 3G, n=5:

| Route | hier gemessen (Median) | Profil 31.8.2026 (n=3) |
|---|--:|--:|
| `/gesetze/bund/OR` | 38 296 ms | 36 979 ms |
| `/gesetze/kanton/BS-154.100` | 18 538 ms | 17 360 ms |

Abweichung +3.6 % bzw. +6.8 % — dieselbe Grössenordnung, plausibel aus
Datenzuwachs und Tagesform. Das Werkzeug misst, was das Profil gemessen hat.

## Wasserfall auf dem Basis-Stand (`/gesetze/bund/OR`, 4× CPU + langsames 4G)

Marker «bedienbar» 10 009 ms. Gekürzt auf die taktgebende Kette:

| von → bis (ms) | KB | Ressource |
|---|--:|---|
| 0 → ~190 | 217 | `/gesetze/bund/OR` (Prerender-HTML) |
| 167 → 1989 | ~190 | 18 Eager-Chunks (`index`, `vendor-react`, `startseiteConfig`, `register-*`, `browse-*`, `fedlex`, `kantone`, `katalogSuche` …) |
| 2554 → 3154 | 45 | Route-Welle (`GesetzLeser`, `NormText`, `KontextPanel`, `werkzeuge` …) |
| 2672 → 5200 | 148 | `/normtext/register.json` |
| 2676 → **läuft beim Marker noch** | (753) | `/rechtsprechung/register.json` |
| 3166 → 3912 | 35 | `LeserRahmenV3` |
| 3923 → 5286 | 84 | `/normtext/struktur/bund/OR.json` |
| **5215 → 8861** | 344 | `/normtext/bund/OR.json` ← **der Snapshot** |
| — | | Marker **10 009** |

**Die zentrale Zahl: der Snapshot wird erst nach 5215 ms von 10 009 ms
angefordert — 52 % der Wartezeit vergehen, bevor die eigentliche Nutzlast
überhaupt bestellt ist.** Grund ist eine harte Abhängigkeit: `ladeErlass(key)`
wartet auf das Register, weil `e.datei` erst daraus kommt
(`src/lib/normtext/browse.ts:75–78`, `src/pages/gesetz-leser/inhalt-hooks.tsx:94`).
Das bestätigt Kandidat **K2** des Vorgänger-Dossiers auf der Bund-Route; **K1**
(`/rechtsprechung/register.json` auf jeder Gesetzes-Leserseite) ist ebenfalls
sichtbar — der Download läuft beim Marker noch.

## Die zwei gebauten Massnahmen

| # | Massnahme | Logikverlust |
|---|---|---|
| M1 | `Shell.tsx` lädt ein Browse-Manifest nur noch, wenn ein **tatsächlich gezeigter** Pfad ein Label daraus braucht (`[pathname, ...liveSek]`) | **keiner** — kein Label geht verloren, es lädt bei Bedarf nach; Muster von `ReiterUebersicht.tsx` |
| M2 | Prerender setzt `<link rel="preload" as="fetch" crossorigin="anonymous">` für Snapshot, Register und Struktur-Sidecar in den Kopf jeder Erlass-Seite | **keiner** — Preload ändert nur das WANN, nie das WAS; Register bleibt im Client die einzige Quelle des Dateinamens (§5) |

Nicht gebaut wurden die im Vorgänger-Dossier als verlustbehaftet bewerteten
Varianten («Lader ganz auf Rechtsprechungs-Pfade beschränken», «Dateipfad im
Client ableiten»).

## A/B-Ergebnis (Median, n=5 je Zelle, je Lauf kalt)

### 1× CPU · Netz ungedrosselt (schnelle Maschine, lokaler Server)

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 788 | 775 | −13 ms (−1.6 %) |
| `/gesetze/bund/ZGB` | 708 | 707 | −1 ms |
| `/gesetze/bund/StGB` | 547 | 556 | +9 ms |
| `/gesetze/kanton/BS-154.100` | 427 | 434 | +7 ms |

**Ungedrosselt wirkt keine der Massnahmen** — und muss es nicht: dort ist die
Seite schon vorher unter 1 s bedienbar. Die Differenzen liegen innerhalb der
Streuung der Einzelläufe und sind **kein Gewinn**, sondern Rauschen.

### 4× CPU · langsames 4G (Lighthouse-Mobil-Profil)

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 10 368 | 7 406 | **−2 962 ms (−28.6 %)** |
| `/gesetze/bund/ZGB` | 8 486 | 6 232 | **−2 254 ms (−26.6 %)** |
| `/gesetze/bund/StGB` | 6 511 | 4 551 | **−1 960 ms (−30.1 %)** |
| `/gesetze/kanton/BS-154.100` | 4 902 | 3 501 | **−1 401 ms (−28.6 %)** |

### 6× CPU · langsames 3G

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 38 296 | 26 762 | **−11 534 ms (−30.1 %)** |
| `/gesetze/kanton/BS-154.100` | 18 538 | 13 140 | **−5 398 ms (−29.1 %)** |

Die Spannen der Einzelläufe überlappen zwischen den Armen in **keiner** Zelle
der gedrosselten Bedingungen (z. B. OR @4×/4G: 10 226–10 593 gegen
7 379–7 421 ms) — der Unterschied ist nicht die Streuung.

### Anteil je Massnahme (4× CPU + langsames 4G, n=3, Zwischenstände)

| Route | Basis | nur M1 | M1+M2 |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 10 009 | 7 609 (−24.0 %) | 7 346 (−3.5 % weiter) |
| `/gesetze/bund/ZGB` | 8 410 | 6 556 (−22.0 %) | 6 180 (−5.7 %) |
| `/gesetze/bund/StGB` | 6 273 | 5 093 (−18.8 %) | 4 548 (−10.7 %) |
| `/gesetze/kanton/BS-154.100` | 4 824 | 4 016 (−16.8 %) | 3 472 (−13.5 %) |

M1 trägt den grösseren Teil und deckt sich mit der Gegenprobe des
Vorgänger-Dossiers (−16 bis −19 % durch blosses Abwürgen derselben Datei). M2
wirkt relativ stärker auf den **kleineren** Erlassen — dort hatte die serielle
Kette den grösseren Anteil an der Gesamtzeit.

## Befunde

### B1 — Der Befund «OR 8,4–17,2 s bis bedienbar» ist ungedrosselt nicht mehr reproduzierbar

`fahrplaene/FAHRPLAN-PERFORMANCE.md` §1-N2 hält für den **17.8.2026** fest: OR
«8,4–17,2 s bis zur Bedienbarkeit auf einem schnellen, unbelasteten Rechner».
Am 1.9.2026 misst dieselbe Grösse auf dem Basis-Stand `cd4dc65cb`
ungedrosselt **788 ms** (n=5, Spanne 776–853 ms).

**Der alte Wert wird nicht nachgeführt** (§0 Ziff. 2b) — er gilt für seinen
Stand. Die naheliegende, hier **nicht bewiesene** Erklärung: zwischen beiden
Daten landete `QS-BASIS (d) K3` (Commit `cd4dc65cb`, 1.9.2026), das den
statischen Suchindex um **4.66 MiB gzip (−46.8 %)** verkleinert hat. Wer die
Frage schliessen will, misst `19a989f93` gegen `cd4dc65cb` mit demselben
Werkzeug; das ist hier bewusst **nicht** getan (der Schritt baut das
Leser-Tempo, er rekonstruiert keine Mess-Historie).

Praktische Folge: **Die Zielgrösse «unter 2 s bis bedienbar» war auf einer
schnellen Maschine schon vor diesem Schritt erfüllt.** Der reale Gewinn dieses
Schritts liegt dort, wo Nutzerinnen ihn spüren — auf gedrosselter CPU und
langsamem Netz (−27 bis −30 %).

### B2 — Gedrosselt ist die Strecke bandbreitengebunden, nicht mehr kettengebunden

Nach M1+M2 starten Snapshot, Register und Struktur-Sidecar bei ~181 ms statt
bei 5215/2672/3923 ms (CDP-Wasserfall nach dem Bau). Was bleibt, ist die
**Summe der Bytes**: rund 1.1 MB gzip auf dem kritischen Pfad des OR
(217 KB Prerender-HTML + ~190 KB Eager-JS + 344 KB Snapshot + 148 KB Register +
84 KB Struktur + ~110 KB Schriften) — bei 1.6 Mbit/s allein rund 5.5 s reine
Downloadzeit. Weitere Gewinne auf dieser Achse verlangen **weniger Bytes**,
nicht eine andere Reihenfolge.

Der grösste Einzelposten ist strukturell: derselbe Normtext liegt zweimal auf
dem Pfad — einmal als prerendertes HTML (für Crawler und JS-lose Leser) und
einmal als JSON (für den interaktiven Leser). Beide Hälften zu streichen wäre
Logikverlust (SEO/no-JS gegen Bedienbarkeit); der Posten bleibt offen.

### B3 — `crossorigin` am Preload ist kein Kosmetik-Attribut

`<link rel="preload" as="fetch">` **ohne** `crossorigin` legt eine
no-cors-Anforderung an; der spätere `fetch()` (mode cors, credentials
same-origin) kann sie nicht wiederverwenden und lädt die Datei ein zweites Mal
— aus einer Beschleunigung würde eine Verdopplung der Nutzlast. Mit
`crossorigin="anonymous"` empirisch geprüft: im CDP-Wasserfall nach dem Bau
steht je Datei **genau ein** Eintrag.

## Offen (nicht in diesem Schritt gebaut)

- **K3 — Drei-Wellen-Chunk-Kaskade.** In der Eager-Welle stehen Chunks, die der
  Leser nicht braucht (`katalogSuche`, drei `browse-*`, `kantone`, `fedlex`,
  `startseiteConfig`). Erwarteter Gewinn nach obiger Rechnung: rund 300 ms
  @4G je 60 KB. Berührt das Bundle-Budget und verlangt Golden-Beweis.
- **Reader-Kopf-Reflow** (`header 161 → 238 px`, `h1 49 → 75 px`, Quelle
  `div.flex.shrink-0`; Befund 17.8.2026, `FAHRPLAN-PERFORMANCE.md` §1-N2).
  Nicht angefasst: der Fix reserviert Kopf-Geometrie und ist damit eine
  **Design-Entscheidung** (§13, wie viel Leerraum ein kurzer Titel trägt), kein
  reiner Perf-Eingriff. `check:perf-lighthouse` misst OR-CLS aktuell bei
  **0.003** gegen eine Schranke von 0.05.
- **`main.tsx` nutzt `createRoot` statt `hydrateRoot`** (ROADMAP-Unterpunkt von
  `QS-BASIS`). Bewusst **nicht** hier gebaut: der Skill `perf` verbietet in
  Bauregel 5 ausdrücklich das naive `hydrateRoot` (ein Markup-Mismatch ist
  stiller Normtext-Verlust), und die ROADMAP verlangt für den Posten einen
  eigenen PR mit Hydrations-Fehler-Wächter und Gegenprüfung. Sein gemessener
  Anteil (27–78 ms nach `load`) ist gegenüber den hier gehobenen 3–11 s klein.

## Verwandtes

- [Kanton-Reader-Profil (K-11)](kanton-reader-profil-2026-08-31.md) — das
  Profil, dessen Kandidaten K1/K2 hier gebaut wurden; enthält die
  Logikverlust-Vorbewertung je Variante.
- [CWV-Baseline (W1.11)](cwv-baseline.md) — misst LCP/Transfer der prerenderten
  Seiten, also die **andere** Grösse (erster Text auf dem Schirm).
