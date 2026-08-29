# FAHRPLAN — Geräte-Last / Performance (Detailquelle)
<!-- @lagebild name: Tempo · zweck: Geräte-Last und Ladezeit, ohne Logikverlust (§15). -->

> **Heimat:** Verlinkt aus `ROADMAP.md` → Querschnitt-Band **`QS-PERF`**. Diese Datei ist
> **nur Detailquelle**, nie zweiter Einstieg (CLAUDE.md §14). Der Bau-Grundsatz steht
> verbindlich in **CLAUDE.md §15** und als **Leitprinzip 7** in `ROADMAP.md`.
>
> **Provenienz:** ultracode-Performance-Audit 30.6.2026 (Multi-Agent, Opus, adversarial
> verifiziert: 6 Dimensionen kartiert → jeder Befund unabhängig auf *reale Kosten* **und**
> *Logikverlust-Risiko* geprüft → Synthese). **25 verifizierte, logik-sichere Befunde aus 31
> roh; 38 Agenten.** Keiner der adoptierten Punkte erzwingt einen Treue-Kompromiss.

---

## §0 · Zweck

Detailquelle zu `QS-PERF`/`W2·15-CLS` — Geräte-Last und Performance-Massnahmen.
Nie zweiter Einstieg (§14). Bau-Grundsatz verbindlich in CLAUDE.md §15: nicht
merklich langsamer werden, **solange daraus kein Logikverlust entsteht** — bei
Konflikt gewinnt immer die Treue, nie das Tempo (§1). Jede Massnahme trägt eine
explizite Logikverlust-Bewertung.

---

## §1 · ROADMAP-Spec QS-PERF (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «Bau-Grundsatz», «Das Tor «perf-budget»» und «Die priorisierte Abarbeitung» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  durchlaufen die vollen Browser-Smoke-Shards + Perf-Budget (~20–25 min Wall-Clock je Push, plus
  Flake-Reruns wie A35 auf Shard 3), obwohl kein `src/`-/`public/`-Pfad berührt ist. **Bau:** In
  `ci.yml` Browser-Smoke + Perf-Budget hinter einen Pfad-Filter legen (laufen nur bei Berührung von
  `src/`, `public/`, `index.html`, `vite.config*`, `tailwind.config*`, `package*.json`, `e2e/`,
  `scripts/` AUSSER `scripts/plan/`); bei Nicht-Lauf **protokolliertes SKIP** (§6 Ziff. 7 lit. b —
  sichtbarer Job-Status «skipped wegen Pfad-Filter», nie still grün; `check:ci-laeufe`-Verträglichkeit
  prüfen). Tore-Job (tsc/vitest/golden/lint/checks) läuft IMMER. Sabotage-Probe: ein `src/`-Diff muss
  die Shards nachweislich wieder auslösen. Abgrenzung: Shard-Neupackung bleibt der eigene, an den
  Merge-Queue-Entscheid gekoppelte Posten (s. u.) — hier nur die Auslöse-Bedingung.

  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer). Detailquelle: diese Datei (ultracode-Audit 30.6.2026, 25 verifizierte,
  logik-sichere Befunde; adversarial gegen Logikverlust geprüft). Gemessener Anlass: `/gesetze/bund/OR`
  unter 4× CPU Score **42**, **CLS 0,64**; Startseite CLS 0,57. **Empfohlene Reihenfolge:**
  - **a · Tor `check:perf-budget`** — **`[✓]` KOMPLETT (5.7.2026, PR feat/qs-perf-a-b):**
    Bundle-Teil + `check:perf-lighthouse` (Mobil-Preset, Median aus 3, letzte CI-Stufe nach den
    Treue-Toren = §15-Gegenkopplung). Wortlaut → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
  - **b · Billig & verlustfrei zuerst** — **`[✓]` bereits in `main`** (Quick-Win-Batches 30.6./1.7., hier
    nur verifiziert + durch das Tor abgesichert).
    Wortlaut → `ROADMAP-CHRONIK.md` → QS-PERF (31.7.2026).
  - **c · M-Daten-Pfad** *(adopt-with-care, golden-gegated)*: OR-Fetch/Struktur-Parse per
    `requestIdleCallback` defern (vollen Parse behalten) · Suchindex (16 MiB) in Web-Worker (bzw. **FlexSearch `export()`/`import()`** — Index build-time serialisieren statt Client-Rebuild, Audit-1-B4; entfällt evtl. via E2-Edge-Suche, `FAHRPLAN-DATENHALTUNG.md` §8) ·
    `register.json` in Bund/Kanton sharden · Snapshot-Format verschlanken (Provenienz-Header-Hoist).
  - **d · Render-/Split-View-Feinschliff** *(zuletzt — nach den Memos marginal)*: TOC stabilisieren,
    `aktArtikel`-Tracker auslagern, Pane-Open-Guard + Such-Debounce, Fallback-Font-Metriken.
  - **e · CLS-Race-Härtung Reader-e2e** — **`[✓]` KOMPLETT (10.7.2026, `fix/cls-race-haertung`):**
    drei CI-Parallel-Last-Rotfälle an der Wurzel gefixt, Schwellen UNVERÄNDERT. Wortlaut →
    `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026); Detail STRUKTUR-Karte 10.7.

    `/gesetze/bund/OR` LCP entweder **~3.5 s** (4×) oder **~11.3–11.6 s** (4×), nichts dazwischen,
    **unabhängig von der Runner-Geschwindigkeit** (die Kalibrier-Referenz korreliert nicht mit dem
    Modus). Der naheliegende Verdacht «warm/kalt geladen» ist durch die Chrome-Isolation
    ausgeschlossen — jeder Lauf ist kalt. Vermutung, ungeprüft: Lighthouse wählt je nach Timing ein
    anderes LCP-Element. Der Deckel 13500 liegt ~16 % über dem hohen Modus und ist damit sicher;
    bevor er verschärft wird, muss die Bimodalität verstanden sein (sonst deckelt man sie nur weg, §8).

    *(neuer Befund 26.7.2026, Messung durch delegierte Analyse; Dossier ebd. §3.5)*. Der Fix oben
    korrigiert die MESSUNG, nicht die Ladekosten. Gemessen auf 4 vCPU @2.1 GHz, un-gedrosselt:
    `ergaenze('bund')` **13 480 ms als EIN einziger, nicht unterbrechbarer Task**
    (`src/lib/suche/artikelVolltext.ts:308`, via `:249–253` ohne Yield) +
    `ergaenzeGestaffelt('kanton')` **15 023 ms in 16 Häppchen à 324–1 386 ms** (`:320–328`).
    Un-gedrosselt liegen die Häppchen schon über dem 200-ms-Reaktionsanspruch, unter 4× Drossel bei
    1.3–5.5 s je Block — die Zusicherung «Tippen/Scrollen bleibt flüssig» (`:112–113`) ist damit
    **nicht eingehalten**. **Hebel (gehört zu Strang c):** Aufbau in einen Worker, oder den Index
    build-time serialisieren (FlexSearch `export()`/`import()` — steht in Strang c schon als
    Audit-1-B4). **Nicht ermittelt:** ob im langsamen Modus Stufe 1 oder Stufe 2 im Drossel-Fenster
    lag (13.5 vs. 15.0 s passen beide numerisch) — das entscheidet nur ein Chromium-Trace mit
    Long-Task-Attribution.

    `src/components/suche/useUniversalSuche.ts:88` fängt einen gescheiterten Index-Load mit
    `.catch(() => setArtikelSuche({ suche: () => [], fehlendeEbenen: [] }))` ab. Wegen
    `fehlendeEbenen: []` ist `unvollstaendig` falsy (`src/lib/universalSuche.ts:292`) ⇒ die
    Oberfläche meldet «0 Artikel, fertig durchsucht», obwohl **nichts** indexiert wurde. Genau der
    Fehlschluss, gegen den `artikelVolltext.ts:30–34` und `src/tests/suche/gestaffelterIndex.test.ts`
    argumentieren — im Fehlerfall aber nicht abgedeckt. **Zweiter Defekt am selben Pfad:**
    `artikelVolltext.ts:60` räumt `ladePromise` bei Rejection nicht (ein Netz-Blip auf 46 MB
    degradiert die Suche bis zum Reload permanent) — die repo-eigene Regel O-1.7 in
    `src/lib/normtext/laden.ts:44–52` macht es ausdrücklich anders. Klein, eigener Commit.

    da 21.7.2026 — geparkt, gekoppelt an Davids Merge-Queue-Entscheid)*.
    Die Gruppen in `e2e/shard-gruppen.json` sind gegen LOKALE Dauern gepackt (Spread <0.1 %), die
    aber nicht uniform auf den CI-Runner skalieren: `leser-gliederung-a33.e2e.ts` braucht lokal 92 s,
    auf CI ~360 s (**Faktor ~3.7–3.9**), andere Specs weit weniger. **CI-Messbefund (Lauf
    `29779602507`): 283 Tests / 2100 s bei `workers:1`; die Top-10-Specs tragen 66 % der Zeit;
    `leser-gliederung-a33.e2e.ts` allein 342 s = 16 % der Gesamtzeit in nur 4 Tests; Shard 3 ist
    systematisch am längsten**, weil die Packung nach lokalen Zeiten geschah. Eine Neupackung auf
    geschätzter Grundlage wurde bewusst UNTERLASSEN (kann die Balance ebenso gut verschlechtern,
    §14.2) — jetzt liegen die CI-echten Per-Spec-Zeiten als `playwright-report.json`-Artefakte je
    Shard-Job vor, damit ist die Packung **gemessen**. **Hebel:** Neupackung nach CI-Messwerten,
    optional **`a33`-Split in zwei Spec-Dateien** (Tests byte-gleich, Anzahl 283 vorher = nachher)
    bzw. feineres Sharding — **kein Prüfumfang-Abbau (§6.3)**. **Strukturelle Grenze:** a33 ist mit
    ~342–360 s bereits grösser als das Shard-Drittel; Datei-Granularität allein löst das nicht (der
    Spec-Split ist der eigentliche Hebel). **Kopplung (§14.2):** ausdrücklich an den noch offenen
    **Merge-Queue-Entscheid Davids** gebunden (`QS-BASIS` B-12 / `QS-OPT` O-3.2/O-3.3) — ein CI-Umbau,
    nicht zwei; erst zusammen mit der Merge-Queue-Richtung neu packen.
  - **Constraints:** alles `[OF]`/zeitsperre-konform (Darstellungs-/Lade-/Build-Schicht); **kein**
    DOM-entfernendes Virtualisieren/`hydrateRoot`/Teilparse (Treue-Verlust, verworfen); Snapshot-
    Regenerierung (c) öffnet **keinen** 26×-Slot (nur Format, Union byte-gleich); Worktree-Isolation
    bei `vite.config.ts`/Generatoren/`public/normtext/**` (§12).
  - **e · Tor-Nachlese aus #312/#314 (§14-Intake 20.7.2026) — fünf offene Posten.** Der Tag hat das Tor
    kalibriert, aber in einem **bewusst stumpfen Übergangszustand** hinterlassen; das darf nicht
    einschlafen. **Reihenfolge nach Hebel:**
    1. **LCP-Element-Attribution — die DRINGENDSTE Einzeländerung, ~5 Zeilen, reine Diagnose.**
       `largest-contentful-paint-element` aus dem LHR ins Log **und** in `dist/_perf/lighthouse.json`.
       Sie entscheidet, ob die **OR-LCP-Bimodalität** (8× ~3,5 s / 8× ~11,4 s) ein Messartefakt ist oder
       der **Replace-Repaint als LCP-Element** — im zweiten Fall wäre der 11,4-s-Modus **reales
       Nutzererleben** und der 3,5-s-Modus misst schlicht das falsche Ereignis. **Jede Messreihe ohne
       diese Angabe ist verschenkt** — darum vor allen weiteren Messungen.
    2. **TBT auf OR wieder scharf stellen.** Heute **6500 = bewusst stumpf**; CLS (0,05) trägt derzeit
       **allein** die Regressions-Last. Erst nach (1) und nach neu erhobener Verteilung.
    3. **Zwei NEUE blinde Flecken, die #314 selbst erzeugt hat** (ehrlich mitführen, nicht verschweigen):
       **(a)** Die Chrome-Isolation macht jeden Lauf **kalt** — die entfernte «Drift» war zugleich ein
       **akzidenteller Detektor für aufschaukelnde Degradation** (Lecks, Listener, Cache-Bloat).
       Defekte ab der **2. Navigation** werden jetzt **nie** gemessen. **(b)** `nurAbInstall` verbannt
       **Layout-Sprünge >500 ms nach Interaktion** aus **jedem** Budget — auf langsamen Geräten real
       sichtbar. Beide brauchen eine bewusste Antwort (eigene Warm-/Interaktions-Messreihe), nicht ein
       Achselzucken.
    4. **Versions-Pinning der Deckel dokumentieren — gebündelt mit dem Lighthouse-Major-Bump
       (§14-Intake 22.7.2026, David).** Die Schwellen sind implizit **Lighthouse-versions-gepinnt** —
       bisher **undokumentiert**. Ein Lighthouse-Upgrade verschiebt sie still. **Anlass des Bündels:**
       `npm audit` meldet **17 moderate Findings**, alle EINE Wurzel — `@opentelemetry/core` < 2.8.0
       ([GHSA-8988-4f7v-96qf](https://github.com/advisories/GHSA-8988-4f7v-96qf), Baggage-DoS) über die Kette
       instrumentation-\* → `@sentry/node` → **`lighthouse`** (reine Dev-Dependency, keine Prod-Exposition —
       die App ist statisch/clientseitig; der Code liefe nur im CI-Runner). Fix erfordert
       `npm audit fix --force` = **Lighthouse-Major-Bump** ⇒ genau der Fall dieses Postens. **DoD des
       Bündels:** (a) Lighthouse-Major heben · (b) Schwellen NICHT übernehmen, sondern **neu vermessen**
       (16-Runner-Reihe wie 20.7., `perf-kalibrierung.yml`) · (c) Pinning ab dann **explizit dokumentiert**
       (Lighthouse-Version neben den Deckeln in `scripts/perf/lighthouse-budget.ts`) · (d) `npm audit`
       moderate = 0. **Vorsicht Lockfile:** lokales npm 11 prunt bei jedem Tree-Write den von CIs npm 10
       verlangten verschachtelten `typescript@5.9.3`-Eintrag (Vorfall 21./22.7., PR #326) — Diff vor dem
       Commit prüfen, ggf. chirurgisch setzen.
    5. **Revisions-Politik für legitimes Wachstum.** Vorschlag: **Deckel = Ist + max(3 sd, ~25 %)**,
       **Anhebung nur mit Mess-Beleg**. Ohne solche Politik wird jeder Deckel irgendwann «mal eben»
       hochgesetzt — und misst danach nichts mehr (Lektion 20.7.).
    **Abgrenzung:** Der **echte CLS-Defekt auf `/gesetze` (0.109 @8×)** gehört **NICHT hierher**, sondern
    ist ein Produktfehler mit eigenem Schritt **`W2·15-CLS`** — Tor-Arbeit und Defekt-Behebung dürfen sich
    nicht gegenseitig verdecken (§14.2).
  - **f · Serif-Preload nachziehen** *(§14-Intake 20.7.2026 — kleiner UX-Trade-off, Folge von
    `font-display:optional`)*. `font-display:optional` hat die CLS-Ursache (Serif-Font-Swap unter Linux)
    beseitigt — **um den Preis**, dass die Serif-Schrift bei langsamer Verbindung im ersten Paint
    **gar nicht** erscheint und der Wechsel erst beim nächsten Besuch sichtbar wird. Ein gezielter
    `preload` der tatsächlich im ersten Viewport benutzten Schnitte holt den Trade-off zurück, **ohne**
    den CLS-Gewinn aufzugeben. **Auflage:** mit CLS-Messung **vorher/nachher** belegen — eine
    Preload-Änderung, die CLS wieder hebt, ist keine Verbesserung. Klein, eigener Commit.
    Trailer `Roadmap: QS-PERF`.

---

### QS-PERF · §14-Intakes und Perf-Posten im Wortlaut (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026). Die ROADMAP führt*
*den Posten seither als Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

>   **§14-Intake 20.7.2026 (David):** TBT-Budget `/gesetze/bund/OR` (#28) — VOR jeder Feature-Zuschreibung Nullprobe + Streuung (Dispatch §0 Ziff. 3): das Budget ist der einzige Job mit Rot im Sample, die Rausch-Rotquote allein erklärt den Grossteil. Lighthouse-Median n≥3 statt Einzelwert gehört in `scripts/perf/` (Worktree `lm-ci`).
>   **§14-Intake 24.7.2026 (David, «ja nimm den pfad-filter als intake auf»): CI-Pfad-Filter für
>   Doku-/Plan-PRs.** Anlass gemessen: reine Plan-/Doku-PRs (#332/#333, nur `*.md` + `scripts/plan/`)
>   durchlaufen die vollen Browser-Smoke-Shards + Perf-Budget, obwohl kein `src/`-Pfad berührt ist.
>   **Bau:** in `ci.yml` beide hinter einen Pfad-Filter legen, bei Nicht-Lauf **protokolliertes SKIP**
>   (§6 Ziff. 7 lit. b — nie still grün); der Tore-Job läuft IMMER. **Detail:** diese Datei §1.
> <!-- @meta-Zeile bleibt in ROADMAP.md -->
>   Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
>   immer, §15). Reihenfolge a–e: a Tor `check:perf-budget` ✅ · b billige Quick-Wins ✅ · **c M-Daten-Pfad**
>   (Idle-Defer, Suchindex in Worker/`export()`, `register.json` sharden) · **d Render-/Split-View-Feinschliff**
>   · e CLS-Race-Härtung ✅. **Detail:** diese Datei §1.
>   - [~] **TBT-Deckel je Job normieren statt absolut prüfen** *(gebaut, gemessen, VERWORFEN
>     20.7.2026)*. Zwei 8er-Runner-Reihen widersprechen sich; die unterstellte Proportionalität
>     besteht nicht. **Assertiert wird darum weiter der Rohwert**; Kalibrierung bleibt als
>     Diagnose-Ausgabe. **«TBT auf OR wieder scharf» ist damit NICHT erreicht und bleibt offen**
>     (§8). Mess-Detail → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
>   - [x] **Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung** *(erledigt 20.7.2026)* —
>     frische Instanz je Messung; Schwellen über 16 Runner neu erhoben und verschärft (Start-TBT
>     400 · Start-LCP 10000 · OR-TTI 13000 · Start-Score 55; OR-TBT 6500 und CLS 0.05 unverändert).
>     Wortlaut → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
>   - [ ] **OR-LCP ist bimodal — Ursache offen** *(neuer Befund 20.7.2026)*. In der 8er-Messreihe misst
>     `/gesetze/bund/OR` LCP entweder ~3.5 s oder ~11.3–11.6 s, nichts dazwischen und unabhängig von der
>     Runner-Geschwindigkeit; Deckel 13500 ist sicher, wird aber erst nach verstandener Bimodalität verschärft (§8).
>   - [x] **Bimodaler ~48-s-Stall in der ersten gedrosselten Such-Interaktion — AUFGEKLÄRT + BEHOBEN**
>     *(26.7.2026, `bibliothek/betrieb/e2e-flake-forensik-2026-07-26.md` §3, PR #382)*. Wortlaut →
>     `ROADMAP-CHRONIK.md` → QS-PERF (31.7.2026). **Deckel byte-gleich** (12 000/15 000 ms), Latte löst
>     jetzt in 0.36–0.54 s statt im Münzwurf auf, Spec 44/44 grün bei `--retries=0`. Die Pfeil-Latte
>     (`aria-activedescendant`), vorher bei 56–99 % ihres Budgets, ist damit ebenfalls entlastet und
>     braucht **keine** Kalibrierung.
>   - [ ] **Der Artikel-Suchindex kostet ~28.5 s Main-Thread-Aufbau — struktureller Perf-Posten**
>     *(Befund 26.7.2026, Dossier `bibliothek/betrieb/e2e-flake-forensik-2026-07-26.md`)* — Client-Rebuild
>     des Index, kein Flake. **Detail:** diese Datei §1.
>   - [ ] **§8-Auskunftslücke im Fehlerpfad der Artikel-Suche** *(neuer Befund 26.7.2026, ebd.)*.
>     Der Fehlschlag wird still geschluckt statt ausgewiesen. **Detail:** diese Datei §1.
>   - [ ] **«~4 MB Artikel-Index» ist in ~10 Kommentaren falsch — real 45.7 MiB**
>     *(Befund 26.7.2026, ebd.)*. `public/such-index/artikel.json` = 47 964 020 Bytes, 54 444 Einträge
>     (~9.7 MB gzip, so auch in `scripts/check-perf-budget.ts:92` beziffert). Die Zahl «~4 MB» steht
>     u. a. in `src/components/suche/useUniversalSuche.ts:128,131`, `e2e/norm-sprung.e2e.ts` und
>     `e2e/gesetze-ia-v2-walks.e2e.ts:18,45`. Sie hat die Flake-Suche in die falsche Grössenordnung
>     gelenkt (§5: eine Zahl, zehnfach kopiert und nirgends nachgeführt). Reine Kommentar-Korrektur.
>   - [ ] **Dauer-rAF-Sampler in `e2e/helpers/cls.ts` ohne Abschalt-Bedingung** *(Nebenbefund 26.7.2026,
>     Dossier ebd.)*. `clsBeobachtenInstallieren` startet eine unbegrenzte `requestAnimationFrame`-Schleife,
>     die pro Frame `getBoundingClientRect()` auf 13 Elementen aufruft (erzwungenes Layout je Frame) und
>     bis Test-Ende läuft. Als Wachser-Diagnose gebaut (19.7.), belastet sie jede gedrosselte Messung nach
>     ihrer Installation. **Nicht** Ursache des Stalls oben (gegengemessen), aber ein eigener
>     Prüf-Genauigkeits-Posten: eine Abschalt-Bedingung nach dem Auslesen wäre verlustfrei.
>   - [ ] **e2e-Shard-Balance gegen GEMESSENE CI-Dauern packen** *(vorbereitet 20.7.2026; CI-Messwerte
>     da 21.7.2026 — geparkt, gekoppelt an Davids Merge-Queue-Entscheid)*. Mit den weiteren offenen
>     Perf-Posten (Mess-Forensik, Budget-Politur, Serif-Preload): **Detail:** diese Datei §1.

### §1-N · ROADMAP-Spec QS-PERF — Nachzug (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Querschnitt-Band, Schritt `QS-PERF` — AP-11 rückwirkend angewandt
(ROADMAP-Diät Welle 3, 4.8.2026). Der Wortlaut unten stand bis dahin in der ROADMAP und ist
zwischen dem 31.7.2026 (Anlage von §1) und dem 4.8.2026 dort fortgeschrieben worden; er ist
darum die **jüngere** Fassung gegenüber dem Blockzitat oben. In der ROADMAP bleiben Titel,
`@meta`, der steuernde Kurzabsatz (a–e) und der Pointer auf diesen §. Steuert nicht —
Spec-Heimat. **→ Bau-Spec: «Die priorisierte Abarbeitung» dieser Datei.***

  **§14-Intake 20.7. + 24.7.2026 (David):** TBT-Budget `/gesetze/bund/OR` (#28) — Nullprobe +
  Streuung VOR jeder Feature-Zuschreibung, Lighthouse-Median n≥3 · CI-Pfad-Filter für Doku-/Plan-PRs
  mit **protokolliertem SKIP** (§6 Ziff. 7 lit. b), Tore-Job läuft immer.

  **`wip` freigegeben 3.8.2026:** der Marker stand seit 1.7.2026 unbewegt und trug zuletzt die
  Runner-Robustheit — die ist mit **PR #421 (`23f4be7fb`) gelandet**, der Anlass damit erledigt.
  Offen bleiben c, d und die fünf Befunde unten; ein Querschnitt-Schritt trägt `wip` nur für die
  Dauer einer Session (Skill `auftrag`, Ziff. 2). Wortlaut der Prüfung → `ROADMAP-CHRONIK.md`.
  - [ ] **OR-LCP ist bimodal — Ursache offen** *(20.7.2026)* — ~3.5 s oder ~11.3–11.6 s, nichts dazwischen; Deckel 13500 bleibt bis zur verstandenen Bimodalität (§8).
  - [ ] **Artikel-Suchindex kostet ~28.5 s Main-Thread-Aufbau** *(26.7.2026)* — Client-Rebuild des Index, kein Flake.
  - [ ] **Eager-Kette `Shell→Sidebar→lib/navigation→normtext/register` lädt ~276 KB roh auf JEDER Route** *(Code-Inventur 4.8.2026)* — die Sidebar braucht aus `register.ts` nur die `GEBIETE`-Labels, zieht aber das ganze 189-KB-Register plus `startseiteConfig` (87 KB) in den kritischen Pfad; Entry gemessen 52.1 KB gz = 87 % des Budgets (Einzelwert, dist älter als HEAD — vor Zuschreibung §3-Streuung). Suchindex-Monolith 45.9 MB roh / 9.5 MB gz als EIN fetch, Budget zu 91 % ausgeschöpft. Zahlen: `bibliothek/betrieb/code-inventur-2026-08-04.md`.
  - [ ] **§8-Auskunftslücke im Fehlerpfad der Artikel-Suche** *(26.7.2026)* — der Fehlschlag wird still geschluckt statt ausgewiesen.
  - [ ] **«~4 MB Artikel-Index» ist in ~10 Kommentaren falsch — real 45.7 MiB** *(26.7.2026)* — reine Kommentar-Korrektur (§5).
  - [ ] **Dauer-rAF-Sampler in `e2e/helpers/cls.ts` ohne Abschalt-Bedingung** *(26.7.2026)* — belastet jede gedrosselte Messung; Abschalt-Bedingung wäre verlustfrei.
  - [x] **e2e-Shard-Balance gegen GEMESSENE CI-Dauern packen** — Shards nach gemessener Wanduhr statt nach Datei-Zahl. **Entkoppelt 3.8.2026:** die frühere Kopplung «erst Merge Queue G7, dann packen» ist hinfällig — `QS-BASIS-MQ` ist am 3.8.2026 gestrichen (GitHub-Feature-Gate, nur Org-Repos; Chronik). **Gebaut 4.8.2026 (Bau-Evaluations-Session):** LPT-Neupackung aus den per-Spec-Dauern des grünen Laufs 30852386612 (63 Specs, 44.2 min) — Max-Gruppe von 8.5 auf 5.6 min Testzeit, alle 8 Gruppen ausgeglichen; Schieflage kam aus 8 seit dem 25.7. zugewachsenen Specs. Union-Wächter grün.

---

### §1-N2 · ROADMAP-Spec QS-PERF — Nachzug (wörtlich verschoben 29.8.2026, Plan-Neuschnitt)

Zwei Messblöcke, die bis zum 29.8.2026 im ROADMAP-Schritt `QS-PERF` standen — Erst-Render-Zeit
des OR samt Nullprobe, und der Reader-Kopf-Reflow nach dem Client-Takeover. Wortlaut unverändert;
die ROADMAP nennt nur noch den Ein-Satz-Befund mit der Zahl. Datierte Messangaben werden hier nie
an einen neuen Ist-Stand nachgeführt, nur ergänzt (§0 Ziff. 2b).

  (§15). Offen: M-Daten-Pfad (9,5-MB-`register.json` ist der lohnendste Hebel) +
  Render-/Split-View-Feinschliff. **Neu 17.8.2026 — Erst-Render OR, vermessen:** der
  Leser braucht auf dem OR (2038 Art.) **8,4–17,2 s bis zur Bedienbarkeit** auf einem
  schnellen, unbelasteten Rechner, zweigipflig mit einem ungeklärten Sprung von ~6,8 s;
  auf `main` wie im V3-Branch identisch (A/B je n=11, Arm-Unterschied ≤ 3,6 % und im
  Vorzeichen wechselnd). Das ist die Wurzel des Shard-7-Rots auf `e2e/leser-ohne-
  gliederungslinie.e2e.ts:71` und `e2e/leser-r1-r2.e2e.ts:544` (20-s-Budget) und
  schliesst zugleich Punkt (b) von `QS-E2E-STABIL`. Messreihe und Nullproben:
  [FAHRPLAN-LESER-V3.md](fahrplaene/FAHRPLAN-LESER-V3.md) «Nebenfunde aus H2», `Ä24`.
  **Nullprobe 17.8.2026 (S1-Nachzug), lokal warm:** `e2e/leser-ohne-gliederungslinie.e2e.ts
  --project=leser-v3 --repeat-each=3` fällt auf **unverändertem `main` (19a989f93)
  6 von 6** (beide Tests, alle Wiederholungen, «Test timeout of 30000ms exceeded»
  beim Warten auf den «Ansicht»-Knopf). Das ist keine Zuschreibung aus der Doku,
  sondern gemessen: der Worktree wurde dafür auf `main` gestellt und neu gebaut.
  Damit ist belegt, dass der Deckel gegen die **Erst-Render-Zeit des OR/ZGB**
  reisst und nicht gegen eine Feature-Änderung — der Fix gehört hierher, nicht in
  eine Spec-Anpassung.
  **Neu 17.8.2026 (S1-Nachzug, §17) — Reader-Kopf reflowt nach dem Client-Takeover:**
  gemessen `header 161 → 238 px`, `h1 49 → 75 px` (+161 px), Quelle
  `div.flex.shrink-0`. Für die Nutzerin ein Lade-Sprung; der CLS-Beitrag ist
  **bimodal 0.006 ↔ 0.119** und kippt allein mit der Parallel-Last (ob das Lese-Grid
  zum Reflow-Zeitpunkt schon gemalt ist). Gedeckt ist er nur nachgelagert
  (`check:perf-lighthouse`, post-merge) — kein Merge-Blocker. Fix gehört in die
  Startlast: Kopf-Geometrie vor dem Takeover reservieren, statt die Schranke zu
  heben (§8). Diagnose: `e2e/gesetze-historie-badge.e2e.ts`, Datei-Kopf.

---


---

## Archivierte Abschnitte *(Plan-Neuschnitt 29.8.2026)*

10 Abschnitt(e) dieser Datei sind wörtlich nach
[`archiv/fahrplaene/FAHRPLAN-PERFORMANCE.md`](../archiv/fahrplaene/FAHRPLAN-PERFORMANCE.md) ausgelagert — sie tragen keine offene
ROADMAP-Bindung mehr. Titel:

- Stand (Bau-Fortschritt)
- Der Anlass (gemessen, Produktion `lexmetrik.vercel.app`)
- Bau-Grundsatz (verbindlich — Kurzfassung, voll im Skill `perf` (§15-Träger seit A4, 25.7.2026))
- Das Tor «perf-budget» (operationalisiert die Garantie)
- Die priorisierte Abarbeitung (nach ROI; Treue-Vorbehalt je Punkt)
- Constraints & Hygiene
- Architektur-Befunde aus dem Bau (30.6.2026 — präziser als der Roh-Audit)
- Audit-Rohdaten
- Nachlese aus #312/#314 + echter CLS-Defekt (§14-Intake 20.7.2026)
- §2 · ROADMAP-Spec W2·15-CLS (wörtlich verschoben 31.7.2026)
