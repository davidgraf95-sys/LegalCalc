# Testapparat-Fang-Historie 31.8.2026 (QS-EFFIZIENZ · Ent-Regulierung Runde 2)

**Erstellt:** 31.8.2026 — Auftrag David, Ent-Regulierung Runde 2
(`bibliothek/betrieb/entregulierung-2026-08-07.md` §Runde 2; Startbedingung
«17 Token-Spool-Messpunkte» erfüllt). Zweck: Bevor am Testapparat zurückgebaut
wird, muss die Frage «was hat dieses Prüfmittel je gefangen?» mit den vorhandenen
Artefakten beantwortet — oder ihre Unbeantwortbarkeit festgehalten — werden
(CLAUDE.md §17 Gegengewicht Ziff. 2, Streich-Massstab
`.claude/skills/bauschritt/aufraeumen.md`).

**Status:** ERSTRECHERCHE (einfach belegt). **Abnahme-Status: «Indizien, kein
Fang-Protokoll vorhanden»** — der Massstab «was hat er je gefangen» ist für die
meisten Prüfmittel mit den vorhandenen Artefakten NICHT positiv beweisbar (siehe
§Nicht klärbar). Jeder darauf gestützte Rückbau ist Indizienarbeit und braucht
zusätzlich einen Ist-Beweis am Code.

**Methode:** Read-only-Recherche (Opus-Agent, 31.8.2026) über vier Quellen —
(a) GitHub-Actions-Laufzeiten des Voll-Code-Laufs 33344001148 (30.8.2026),
(b) lokales Tor-Ereignis-Log `.selbstopt-ereignisse.jsonl` (8.–30.8.2026,
2865 Ereignisse), (c) `ROADMAP-CHRONIK.md` + Lehren-Register nach expliziten
Fang-Nennungen, (d) `git log` je Spec-Datei (Commit-Zahl = Berührungs-Historie).
Nachverifikation der tragenden Prämisse (V2/V3-Alleinbetrieb) am Ist-Code durch
den Bau-Agenten, 31.8.2026, Stand `origin/main` = `337d2c9ef` (siehe §Nachtrag).

## Quellen mit Stand

| Quelle | Stand / Abruf |
|---|---|
| GitHub-Actions-Lauf `33344001148` (Voll-Code-Lauf) | 30.8.2026 |
| `.selbstopt-ereignisse.jsonl` (lokal, nicht im Repo) | 8.–30.8.2026, 2865 Ereignisse |
| `ROADMAP-CHRONIK.md`, Lehren-Register `.claude/skills/lehren/` | 31.8.2026 |
| `git log` über `e2e/*.e2e.ts` und `src/**/*.test.ts*` | 31.8.2026 |
| `src/pages/GesetzLeser.tsx`, `src/pages/gesetz-leser/` | 31.8.2026, `337d2c9ef` |

## 1 Kostenbild (gemessen, CI-Lauf 33344001148, 30.8.2026)

| Klasse | Runner-Sekunden | Anteil |
|---|---|---|
| **Browser-Smoke Shards 1–8 (e2e)** | **2737 s** (8 Jobs, max. Shard 430 s) | **~73 %** |
| Deploy (Vercel) | 224 s | 6 % |
| Perf-Budget | 205 s | 5 % |
| Bau (dist) | 153 s | 4 % |
| Tore-Job gesamt | 352 s | 9 % |
| — davon `vitest` (5661 Tests) | 138 s | |
| — davon Lint | 50 s | |
| — davon **alle ~45 `check:*` zusammen** | **~101 s** (grösster Einzelposten: Datenhaltungs-Manifest 31 s) | |
| Merge-Schutz + Diff-Klassierung | 66 s | 2 % |

Umfang zum Stand 30.8.2026: **116 e2e-Specs / 571 Fälle**; **369 Unit-Dateien /
5661 Fälle**; 67 `check:*`-Skripte, davon 50 im lokalen Tor-Log.

**Regel (deterministisch, aus diesen Zahlen ableitbar):** Der Kostenhebel der
Prüfstrasse ist **e2e**, nicht die `check:*`-Tore. 45 Tore kosten zusammen 101 s
— dort liegt Kognitionslast, kein Zeitgewinn. Ein Rückbau, der Tore streicht und
e2e unberührt lässt, spart CI-Zeit im Promille-Bereich.

**Zweite Regel:** Weil CI mit `workers: 1` je Shard fährt
(`playwright.config.ts`), ist die CI-Kosten-Grösse die **Summe der Fall-Dauern
je Shard**, und die Wandzeit die **grösste** davon. Das Zusammenlegen von
Spec-DATEIEN ohne Fall-Wegfall spart deshalb **keine** CI-Zeit; es verkleinert
allein die Regelfläche. Umgekehrt kann eine Zusammenlegung über Shard-Gruppen
hinweg die Wandzeit *verschlechtern*, wenn sie schwere Fälle in einer Gruppe
bündelt — die Gruppen-Zuordnung ist deshalb Teil jeder Zusammenlegung.

## 2 Fang-Historie der Tore (lokales Tor-Log, 8.–30.8.2026)

Rot je Tor: `gate:check` 8/54 · `gate:lint` 5/54 · `gate:vitest` 4/67 ·
`check:gegenpruefung` 4/60 · `check:e2e-shards` 2/60 · `check:steuerdeckel` 2/22 ·
`check:bibliothek` 1/60 · `check:schlankheit` 1/60.
**Alle übrigen 42 Tore: 0 rot in 60 Läufen** — darunter `gate:tsc` und
`gate:golden:vergleich` (0/67).

**Geltung/Grenze:** «0 rot in 60 Läufen» ist ein Indiz für Kostenlosigkeit, KEIN
Beweis für Nutzlosigkeit — ein Tor, das nie rot wird, kann eine Fehlerklasse
abschrecken, statt sie zu fangen. Das Log deckt 23 Tage; ältere Fänge sind darin
nicht enthalten.

## 3 Streich-/Konsolidier-Kandidaten (Kosten × kein Fang × kein Rechtsbezug)

| # | Kandidat | Beleg | Chesterton-Gegenargument |
|---|---|---|---|
| 1 | **Steuerungs-Selbsttests**: 22 Unit-Dateien (`plan-*`, `fahrplanSlice`, `dispatch-klausel`, `hooks-wache`, `hook-mcp-deckung`, `ci-diff-klassieren`, `check-testtreue`, `plan-dump`) = **511 Tests / ~5300 Zeilen** | 0 Rechtsbezug; Chronik-Treffer für `plan-selbstopt\|plan-bild-lage\|plan-buchung\|hooks-wache\|ci-diff` gesamt 2 (beide Bau-Erwähnungen, kein Defektfang); `hooks-wache`, `ci-diff-klassieren` je 1 Commit = seit Geburt (14.8.) nie reagiert | Plan-Mechanik falsch ⇒ falscher Bau-Stand. Aber 511 Tests für ein Steuerwerk, das der Mensch täglich liest, ist Überdeckung — Zusammenlegung auf ~1 Datei je Werkzeug plausibel |
| 2 | **e2e-Kopf-Familie**: 8 Specs (`leser-kopf-a9/-cls-s3/-g2b/-paritaet/-v2`, `leser-v3-eine-kopfzeile/-h4-kopfwege/-kopf-buendig`) | reine Darstellung; `leser-kopf-a9` 1 Fall in 9 Commits | `leser-kopf-paritaet` deckt den behaupteten V2/V3-Unterschied — vor Streichung klären, ob V2 noch ausgeliefert wird. **31.8. geklärt, siehe §Nachtrag: die Prämisse trägt nicht** |
| 3 | **e2e-Panel-Familie V3**: 8 Specs `leser-v3-panel-*` (+ Unit `leser-v3-panel.test.tsx`, 38 Tests) | 5 davon 1 Commit seit Geburt (17.–21.8.), nie berührt, keine Doku-Nennung | Panel ist jung; Fang-Fenster war kurz — Streichung frühestens nach Stabilisierung |
| 4 | **19 e2e-Specs mit genau 1 Commit** (Geburt = letzter Stand, überwiegend `leser-v3-*`, 8/2026) | nie geändert, keine Chronik-Nennung ⇒ kein dokumentierter Fang | s. 3 |
| 5 | **Überlauf-Trio** `leser-kein-seitenueberlauf` · `leser-gliederung-kein-overflow` · `topbar-kein-ueberlauf-320` | äusserlich dieselbe Sorge, drei Dateien | 320-px-Spec entstand 29.8. aus konkreter Mobile-Welle — jüngster Anlass, behalten. **31.8. nachgeprüft: drei VERSCHIEDENE Prüfgegenstände, siehe §Nachtrag** |
| 6 | **Nie-rote Prozess-Tore ohne Rechtsbezug**: `check:zaehler`, `check:sweep`, `check:smoke`, `check:inventur` (nur 8 Läufe, seit 14.8. tot), `check:tor-paritaet`, `check:dispatch-klausel`, `check:seo-index`, `check:verfall-ui` | 0/60 rot, Doku-Treffer 0–2 | Kosten je 1–2 s — Streichung spart Zeit nicht, nur Regelfläche; Rückbau lohnte nur bei `check:inventur`. **31.8. nachgeprüft: bereits vollzogen, siehe §Nachtrag** |

## 4 Tabu — nicht anfassen (Rechtsdaten / Rechtslogik)

**Tore:** `check:normtext`, `check:golden-normtext`, `check:vollstaendigkeit`,
`check:struktur-konsistenz`, `check:verklebung`, `check:stand-zukunft`,
`check:invarianten`, `check:tabellen`, `check:p-klassen`, `check:bilder`,
`check:revisionen`, `check:artikel-revisionen`, `check:historie`,
`check:bezuege`, `check:normkeys`, `check:ui-normzitate`, `check:entscheide`,
`check:bs-entscheide`, `check:besetzung`, `check:materialien`, `check:pdf`,
`check:pdf-quellen`, `check:dossiers`, `check:datenhaltung`, `check:paritaet`,
`check:grundart`, `gate:golden:vergleich`, alle `*-netz`-Tore.

**Unit:** die 347 Nicht-Meta-Dateien (5150 Tests), namentlich `zustaendigkeit`
(94), `zitat-extraktion` (85), `normtext-fedlex` (81), `fedlex` (69),
`prozesskosten` (68), alle `*.property.test.ts` (Fristen/Rechtsweg/Erbrecht).

**e2e mit Rechtsdaten-Bezug:** `gesetze-az-register`, `normrevision-badge`,
`norm-sprung`, `verweis-u`, `fn5-wortposition`, `fussnote-absatz-altform`,
`druck-fundstellen-z2`, `entscheid-verweis-praezision`, `rechtsprechung*`,
`materialien-m1…m5`, `international-kanonik-ia6`.

## 5 Letzte 10 CI-Failures (29.–31.8.2026): echter Defekt oder Flake?

- 4× **Tore-Job** (Merge-Schutz + Tore) auf `QS-MONITOR-ROT`/`abk-Tor`-Zweigen —
  echte Rot-Gründe im Bau, kein Flake.
- 2× **Bau/Tore** auf Dependabot `tailwindcss 3.4.19 → 4.3.3` (Major) — echter
  Fang durch Bau/tsc, wiederholt.
- 3× **Playwright-Shards** — Signatur durchweg `toBeVisible`/`toContainText`-
  Timeout mit 2 Retries. Bei `33252171869` (`suche-q-fokus-s1-s6.e2e.ts`, S6
  mobiler Fokusmodus) im PR derselben Mobile-Kopf-Welle ⇒ **echter
  UI-Regressionsfang**. Die beiden anderen (Dependabot-Browserbump,
  Fedlex-Frische) sind mit derselben Signatur **Flake-verdächtig**, nicht
  abschliessend belegt.
- 1× **Deploy (Vercel)** — Infra.

## 6 Nicht klärbar (Negativbefunde, S5)

- **Per-Spec-Laufzeiten:** `e2e/shard-gruppen.json` enthält nur die
  Gruppenzuordnung; Dauern stehen als Prosa im `_kommentar` (Stand 7.–9.8.). Die
  2737 s sind je Klasse geschätzt (Mittel 23.6 s/Spec), nicht je Datei.
- **CI-Historie reicht nur ~2 Tage zurück** (100 Läufe = 29.–31.8.2026, hohe
  Frequenz). Ältere Rot-Ursachen sind über `gh` nicht mehr erreichbar; GitHub
  löscht Lauf-Logs nach 90 Tagen.
- **Es gibt kein Fehlerbuch, das Fänge Tests zuordnet.** Die Chronik nennt genau
  EINEN expliziten e2e-Fang (Zeile 212: axe/`a11y.e2e.ts` fing einen zweiten
  Kontrastfehler) — in 116 Specs. Der Massstab «was hat er je gefangen» ist mit
  den vorhandenen Artefakten für die meisten Prüfmittel **nicht positiv
  beweisbar**. Das ist selbst der wichtigste Befund dieser Recherche.

## 7 Nachtrag — Ist-Verifikation durch den Bau-Agenten (31.8.2026, `337d2c9ef`)

Drei Prämissen der Tabelle in §3 wurden vor dem Rückbau am Code nachgeprüft;
zwei davon tragen **nicht**. §7 (verifizieren, nicht vertrauen) — die Recherche
wird dadurch nicht «nachgeführt», sondern ergänzt (§0 Ziff. 2b).

1. **V3-Alleinbetrieb: BESTÄTIGT.** `src/pages/GesetzLeser.tsx` rendert
   bedingungslos `LeserRahmenV3` (Z. 49–50 lazy-Import, Z. 81–85 Render); es gibt
   keinen `leser=`-Query-Switch im Produktcode (`grep -rn "leser=" src/` trifft
   ausschliesslich vier Kommentar-Zeilen), kein `v2`-Verzeichnis unter
   `src/pages/gesetz-leser/`, keinen Nicht-V3-`LeserRahmen`. **Folge: `?leser=v3`
   in Test-URLs ist ein toter Parameter.**
2. **«V2-Erbe» in `e2e/leser-kopf-v2.e2e.ts` und `e2e/leser-kopf-paritaet.e2e.ts`:
   WIDERLEGT.** Beide Dateinamen bezeichnen *nicht* den Leser V2.
   `leser-kopf-v2` heisst nach dem Fahrplan **GESETZESDARSTELLUNG-V2** (Etappe
   K-1/K-2/B-1/B-2) und prüft ausschliesslich den heute ausgelieferten Stand —
   der B-1-Fall greift `[data-v3-panel]`-Selektoren. `leser-kopf-paritaet` prüft
   die **Pane-Parität** («ein Vertrag für drei Breiten»: Einzelansicht, primäres
   und sekundäres Split-Pane tragen denselben V3-Kopf), nicht eine V2↔V3-Parität.
   **Folge: keine der beiden Dateien darf als V2-Erbe gestrichen werden.**
3. **`check:inventur`-Leiche: KEINE.** `package.json` kennt nur noch
   `report:inventur`; ein repo-weiter Sweep (ohne `node_modules`/`.git`) findet
   `check:inventur` nur in **datierten Artefakten** — `archiv/`,
   `messwerte/selbstopt-zeitreihe.json`, `bibliothek/register/AUDIT-TORE-2026-07-20.md`.
   Die dürfen nach §0 Ziff. 2b nicht nachgeführt werden. **Folge: nichts zu
   entfernen; der Rückbau war mit `8c544a9fd` bereits vollständig.**
4. **«Überlauf-Trio»: nur teilweise dieselbe Sorge.** Die drei Specs messen drei
   verschiedene Gegenstände: `topbar-kein-ueberlauf-320` den App-Streifen @320
   (und ausdrücklich NICHT die Seite — der Datei-Kopf begründet das mit dem
   offenen Gliederungs-Überläufer aus PR #567); `leser-kein-seitenueberlauf` die
   ganze Seite @390 auf ZH-211.11 mit dem «ungeklippt»-Filter;
   `leser-gliederung-kein-overflow` den TOC-Scroller intern
   (`scrollWidth <= clientWidth`) @1440 und im Mobil-Sheet. **Folge: nur die
   beiden Leser-Specs sind zusammenlegbar, und zwar unter Erhalt aller vier
   Fälle; `topbar-kein-ueberlauf-320` bleibt eigenständig.**

## 8 Pflegebedarf

- **Fang-Protokollierung fehlt.** Solange kein Artefakt Fänge Prüfmitteln
  zuordnet, bleibt jeder Testapparat-Rückbau Indizienarbeit. Wurzel-Fix:
  Fang-Vermerk-Pflicht im Streich-Massstab (`.claude/skills/bauschritt/aufraeumen.md`,
  ergänzt 31.8.2026) — wer einen Defekt fixt, schreibt der Chronik-Zeile den
  Fänger zu.
- **Kostenbild verfällt.** Die 73-%-Zahl gilt für den Bestand vom 30.8.2026
  (116 Specs). Bei nennenswerter Bestandsänderung neu messen, nicht fortschreiben.
- **Tor-Log ist lokal.** `.selbstopt-ereignisse.jsonl` liegt nicht im Repo; die
  Zahlen in §2 sind ohne die Maschine, auf der sie entstanden, nicht
  reproduzierbar.
