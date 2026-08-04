# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Stand 20.7.2026.** Die **einzige Steuerungsquelle**: sie entscheidet **Reihenfolge** +
> **bau-jetzt vs. geparkt** und ist so geordnet, dass eine **künftige Session sie autonom
> Schritt für Schritt abarbeiten** kann. Sie faltet das frühere `HANDLUNGSPLAN.md` ein
> (→ `archiv/`). Das *Wie* je Strang steht in der jeweiligen `fahrplaene/FAHRPLAN-*.md` (Detailquelle),
> der **Ist-Zustand/Deploy** in `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`.
>
> **Chronologische Ordnungs-Schicht:** `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` (Council+Fable 2.7.2026) ordnet
> ALLE offenen Stränge in **7 Phasen bis zum Nordstern** (Juli 2026 → ab Mitte 2027) — 4 Parallel-Bahnen,
> serieller 26×-Slot (@meta-Etikett), Autonomie bis 1.12.2026, Abnahme-Welle ab Feb 2027. Sie ist eine
> **reine Lese-/Ordnungs-Sicht** (steuert nicht selbst): Sie **ordnet** diese ROADMAP, ersetzt sie nicht;
> bei Divergenz gilt die ROADMAP nach Davids **Freigabe-Paket T0b** (= der David-Touchpoint «Freigabe-Paket»,
> definiert in `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` Phase 0 — ein ~30-Min-Ja/Nein-Paket, ohne das der Default gilt).

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** der «Geordneten Abarbeitung», dessen Abhängigkeiten
   erfüllt sind (`[OF]` zuerst; `[D]`/blockierte überspringen). Die **phasen-übergreifende
   Reihenfolge** (welcher Strang wann, konfliktfrei) gibt `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` vor.
2. **Halte die Leitprinzipien** (Zeitsperre/`[OF]` · amtliche Quellen · nie zwei 26×-Assets
   parallel · Worktree-Isolation · golden-gegated · Deploy nur auf Davids Ja).
3. **Bau in eigenem Worktree**, wenn der Schritt eine Kollisionsdatei berührt (§12).
4. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
5. **Markiere erledigt** (Häkchen + Datum hier), zieh die Session-Karte in `STRUKTUR.md` nach,
   → nächster Schritt. **Push/PR/Auto-Merge stehend freigegeben (§9 Weg 1, David 3.7.2026:
   Merge nach `main` = Deploy-Entscheid; die §9-Sorgfalt — Tore/Golden/Bug-Check — gilt VOR dem
   Merge).** *(Ersetzt das frühere «Push/Deploy nicht selbst — sammeln fürs Batch-Deploy-Fenster».)*
6. **Erledigt-Prosa gehört in die Chronik (Token-Ökonomie, QS-TOK/T7).** Ein abgeschlossener
   Schritt wandert **vollständig** nach [`ROADMAP-CHRONIK.md`](ROADMAP-CHRONIK.md) — wörtlich, nie
   zusammengefasst; die ROADMAP führt nur, was noch steuert. Die **Spec-Prosa eines neuen Schrittes**
   entsteht von Anfang an in der zugehörigen `fahrplaene/FAHRPLAN-*.md` (hier: Titel, `@meta`, ein bis
   zwei Sätze Zweck + Anlass, `**Detail:**`-Link). Dort steht auch die **Schnitt-Begründung** eines
   in Teilschritte zerlegten Dach-Schrittes (AP-6, 31.7.2026) — im jeweiligen `ROADMAP-Spec`-§ des
   Fahrplans, nicht hier. **Der Commit-Trailer eines Schrittes ist immer `Roadmap: <@meta id>`**
   (Skill `auftrag`, Ziff. 5) — er wird darum je Schritt nicht mehr einzeln wiederholt
   (36 Wiederholungen entfernt 3.8.2026). **Streichungen** tragen eine Begründungszeile in der
   Chronik — es verschwindet nichts stillschweigend. Kontrolle ist kein neues Tor, sondern der
   Re-Akkumulations-Wächter `python3 .claude/hooks/struktur-rotieren.py --check` (Ceilings
   `ROADMAP.md` 100 KB · `STRUKTUR.md` 60 KB): meldet er rot, wird verschoben, nie das Ceiling gehoben.
   Wortlaut der abgelösten Fassung → `ROADMAP-CHRONIK.md` → Ausführungs-Protokoll Ziff. 6 (3.8.2026).

---

## So sieht das Taschenmesser aus (Produktvision)

**LexMetrik ist DIE EINE Anlaufplattform für alle Rechtsanwender** *(Nordstern geschärft, David
3.7.2026)* — Kanzlei, Gericht, Inhouse, **Steuerbehörden, Ämter/Verwaltung, Notariate, Treuhänder**,
Studierende — um **das Schweizer Recht zu konsultieren und damit zu arbeiten.** Ein vielseitiges
Werkzeug, zu dem man zuerst greift; **alles auf amtlichen Quellen** (Fedlex, amtliche
Entscheid-Sammlungen, amtliche Tarife/Materialien — Art. 5 URG, urheberrechtlich frei),
**deterministisch gerechnet statt KI-geschätzt.**

Die «Klingen» (= die Informationsarchitektur):

- **Konsultieren.** Gesetze (Volltext + amtliche Systematik, **mehrsprachig DE/FR/IT zum
  Vergleich**) · Rechtsprechung (BGE/BGer-Korpus, amtliche Regesten) · amtliche Materialien
  (Botschaften/BBl) · **Gesetzgebung/Rechtsetzung** (was kommt: Vernehmlassung/Parlament/AS-BBl) · **Verwaltungsverordnungen/amtliche Praxis** (Kreisschreiben ESTV/BSV/FINMA/SEM, Weisungen, Merkblätter, Rundschreiben — Etappe E6a, Detail `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §5).
- **Rechnen.** Die deterministischen Klingen: Fristen · Streitwert · Prozesskosten · Verzug/
  Forderung · Zuständigkeit/Rechtsweg · Verjährung · Beurkundung · Gründungen — jeder Wert mit
  Norm + Link + Stand.
- **Verzahnen (der Burggraben).** **Norm → Werkzeug → Schriftsatz** und zurück: vom Artikel in
  den passenden Rechner/Entscheid, vom Rechen-Ergebnis in den kopierfertigen Begründungs-Absatz.
  Und quer über den ganzen Korpus: **Norm ↔ Entscheid ↔ Material ↔ Verwaltungsverordnung** — ein
  Kreisschreiben zeigt, welche Norm es auslegt; ein Entscheid, welchen Artikel er anwendet; eine
  Botschaft hängt am Gesetz; von jedem Artikel zu allem, was ihn betrifft, und zurück. **Dieselbe
  Graph-Struktur, nicht vier Silos — das Organisationsprinzip des gesamten Datenausbaus**
  (Architektur `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §0/§0bis/§1; Etappen E4/E5/E6), nicht nur der Rechner-Achse.
- **Finden (der Griff).** Eine Auffindbarkeits-Schicht: zweiachsiger Einstieg (Rechtsgebiet ×
  Aufgabe) + globale Suche → die richtige Klinge in einem Klick.

Universell, nicht in Personas-Schubladen: dieselben Klingen dienen allen; einzig die Verpackung
(Einstiege, Erklär-/Übungs-Layer) variiert. **Geparkt:** Dossier-/Mandatsverwaltung — alle
Werkzeuge bleiben **strikt zustandslos** (rechnen/drucken/ICS, keine Persistenz von Falldaten).

**Verzahnung als Rückgrat (Organisationsprinzip, kein Einzelfeature):** die tragenden Schritte dieses
Plans sind Glieder EINES Graphen (Norm ↔ Entscheid ↔ Material ↔ VerwVO) — das kann kein einzelnes
Amtsportal, darum ist die Verzahnung Burggraben UND das Einsortierungs-Kriterium für neue Schritte
(§14: neue Doktypen docken an den Graphen an, nie als Silo). *Ehrliche Grenze: Plan-Doktrin, kein
maschinelles Tor.* Glieder-Aufzählung und Code-Bestands-Inventar (kontext.ts/KontextPanel/norm-index):
`fahrplaene/FAHRPLAN-DATENHALTUNG.md` §0bis.

---

## Leitprinzipien (gelten immer)

1. **Amtliche Quellen, urheberrechtlich frei.** Inhalte ruhen **nur** auf amtlichen Werken
   (Art. 5 URG): Fedlex/kantonale amtliche Sammlungen, amtlich publizierte Entscheide + Regesten,
   amtliche Tarife/Verzeichnisse/Formulare, Botschaften/BBl. **Keine Kommentare/geschützte
   Sekundärliteratur.** Funktion, die das bräuchte ⇒ verwerfen oder auf amtliches Surrogat bauen.
2. **Mehrwert-Test (§0).** Nur bauen/behalten, was echten Mehrwert über generische Werkzeuge
   liefert (sonst streichen + in `KATALOG-ROADMAP.md` begründen).
3. **Zeitsperre bis 1.12.2026.** Nur Arbeit, die (a) **keine Davids-Fachzeit** braucht `[OF]`
   und (b) die spätere Abnahme-Welle billiger macht. Kein `verified`/`geprüft` ohne David
   (§7/§8). `[D]` = geparkt, in der Abnahme-Warteschlange (nicht drängen). G1-Gespräche ab Feb 2027.
4. **Nie zwei 26×-Datenassets gleichzeitig offen** — eine Säule fertig führen. Die sechs 26×-Assets — **fertig gebaut + aus dem Slot entlassen**
   (Abnahme ausstehend): Notariat-Grundbuch · Beurkundungs-Ausbau (entlassen 2.7.2026); **offen,
   Reihenfolge = @slot-kette-Kommentar unten:** BGer-Massenkorpus (QS-DATA E3) · Gesetze-Import-3Tier
   (W3·12) · Prozesskosten-Cockpit (W1·4-Rest) · Kantonale-Entscheide (E5). *Ein P0-Bugfix an einem Asset ist kein Daten-Bulklauf und **öffnet den
   26×-Slot nicht**.*
5. **Worktree-Isolation (§12)** bei Datei-Kollision: FUNDAMENT-UMBAU ⟂ VORLAGEN-AUSBAU ⟂
   VERTRAGS-VARIANTEN ⟂ Startseiten-Rahmen (`App.tsx`/`startseiteConfig.ts`/`vorlagenRegistry`);
   SEO-A11Y (`register.json`/`seo.ts`/`prerender.ts`/`vercel.json`).
6. **Push/Deploy nur auf Davids frisches Ja (§9);** jeder verhaltensändernde Schritt golden-gegated
   (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind Invarianten über allen Wellen.
   **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.
7. **Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust** (David 30.6.2026, Wortlaut in
   **CLAUDE.md §15**): bei Konflikt gewinnt **immer die Treue**; jede Optimierung trägt eine explizite
   Logikverlust-Bewertung. Tor `check:perf-budget` → `QS-PERF` / `fahrplaene/FAHRPLAN-PERFORMANCE.md`.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** — die Recherche zu Schlichtungs-/Reduktionsfaktoren ist `[OF]` und **Teil von
  `W1·4`** (Entparkung 3.8.2026, David): sie ist der erste Arbeitsschritt des Schrittes, kein Wartegrund.

<!-- @blockers
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
vps-bestellung-david: E3-Serving + E4-UI hängen an einer VPS-Bestellung (David, ~15 Min) — Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md` (PR #271). ECHTES David-Gate, kein Bau-Blocker. Bis dahin sind QS-DATA/W2·6-DATA nur im NICHT-VPS-Teil baubar (E0–E4 sind lokal fertig). Befund 20.7.2026: dieser Blocker stand bisher NUR im Fliesstext («🔒 BLOCKER»), das @meta trug `blocker: null` — für `check:plan` unsichtbar.
richter-analytik-gate: Richter-/Spruchkörper-Analytik (W3·15-RICHTER). GRENZE (20.7.2026): Filtern/Facette/Verlinkung sind FREI und gebaut (#309/#311); gesperrt bleiben allein RANKING und PROGNOSE. Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht, Persönlichkeitsschutz, richterliche Unabhängigkeit)
david-entscheid-doku-kurzpfad-main: QS-BASIS-DOKU-CI lockert den ci.yml-Grundsatz «ein Deploy-Stand wird nie nach Dateiendungen abgekürzt» für reine `.md`-Pushes auf main (~75 CI-Min/Tag bei aktueller Plan-Commit-Frequenz). Sicherheits-Trade auf dem Deploy-Stand ⇒ ECHTES David-Gate (Bau-Evaluation 3.8.2026); Entscheidungsgrundlage in fahrplaene/FAHRPLAN-BASIS-AUSBAU.md §3.4
-->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W3·12 (Kanton-Gesetze, übergeben 20.7.2026 — E3 war seit 3.7.2026 fertig, der Slot nur nie zurückgegeben)
kette: ~~E3(W2·6-DATA) ✅ 3.7.2026~~ · W3·12(Kanton-Gesetze) ← JETZT · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung, W2·6-DATA) · Gerichtsferien-Matrix
begruendung-uebergabe: E3 ist gebaut (195 342 Entscheide, 2 Voll-Läufe determinismus-gleich, Gegenprüfung bestanden) ⇒ Leitprinzip 4 «eine Säule fertig führen» erfüllt. Der offene E3-**Serving**-Rest ist KEIN Massenimport, sondern hängt am David-Gate `vps-bestellung-david` — er rechtfertigt keine Slot-Bindung. Nächstes Kettenglied ist laut Kette W3·12 (Davids Reihenfolge-Entscheid 2.7.2026, `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §10(1)); W1·4 wäre falsch (26x: nein — der frühere Zusatzgrund «eigener Blocker `wbqdyap3x`» ist mit der Entparkung vom 3.8.2026 entfallen).
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Dach-Auftrag offen** (die drei Werkzeug-Andockungen sind
  seit 5.7.2026 fertig, Strang A und die Anker-Automatisierung nicht). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §1.
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  <!-- @meta id: QS-GP · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  erweitert die Verifikations-Infrastruktur: adversarialer Zweitdurchgang (unabhängiger Opus-Agent,
  frischer Kontext, Auftrag «Output widerlegen») als Tor statt Session-Disziplin. Bausteine a+b+c
  gebaut+live (PR #67); **offen bleibt Baustein d** (rückwirkende Kampagne) — davon ist nur Stufe 1
  «Rechnen» gelaufen, offen Stufe 2 (extrahierte Normen), Stufe 3 (Rest) + BGE-Korpus-Regenerierung.
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §2.
- **Automatik-Gesundheit: läuft unsere Automatik wirklich?** *(QS-AUTOMATIK, `[OF]`, neu 20.7.2026 — §14-Intake)*.
  <!-- @meta id: QS-AUTOMATIK · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows, scripts/datenhaltung/check-turso-frische.ts, scripts/check-ci-laeufe.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  **Läuft unsere Automatik wirklich, und würde sie scheitern können?** Gebündelt aus zwei Befunden
  vom 20.7. (a zwei tote Workflows `normen-monitor.yml`/`fedlex-frische.yml` · b Turso-Wächter-
  Abdeckung + Alarmpfad + Wachstums-Schwellen). **Leitplanke:** jedes Tor gegen eine *unabhängige*
  Referenz prüfen und seine Scheiterns-Fähigkeit an einem ECHTEN Aufruf belegen (§6 Ziff. 7).
  a/b sind reine Prüflogik (`Gegenpruefung: n/a`); der `chemrrv`-Re-Pin (a′) ist die Ausnahme —
  Extraktions-Risikopfad ⇒ eigener Commit mit `QS-GP`-Verdikt, kein Auto-Merge.
  **Stand 3.8.2026 (PR #419, K1–K13):** die beiden toten Workflows laufen wieder, der Alarmpfad ist
  gebaut (Monitor-Triage: Grün schliesst, 3× Rot eskaliert) und der Wächter zieht fehlende
  Required-Kontexte nach. **Offen bleibt** die Turso-Wächter-Abdeckung samt Wachstums-Schwellen —
  darum `ready` und nicht `done`; sie ist zugleich Posten (a) des QS-BASIS-Intakes und wird
  **allein hier** gebaut (Abgrenzung 3.8.2026, Wächter gegen eine UNABHÄNGIGE Grösse, nie gegen
  die Sync-Marke). Diagnose-Übersicht: `bibliothek/ci-fehlerklassen-2026-08-03.md`.
  **Mitnahme 4.8.2026 (Code-Inventur):** (a) ~~Manifest-Nullzeilen~~ **geklärt — gewollt**
  (Ausbaustufe, David 4.8.2026; keine Wächter-Lücke). (b) Prod-Smoke existiert
  doppelt (`.github/scripts/prod-smoke.sh` wöchentlich + `scripts/betrieb/prod-smoke.ts`
  6-stündlich, überlappende Prüfungen) — konsolidieren oder Schnitt dokumentieren.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §1.
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  <!-- @meta id: SEO-A11Y · status: ready · of: ja · blocker: null · dep: [] · kollision: [public/normtext/register.json, src/lib/seo.ts, scripts/prerender.ts, vercel.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**
- [ ] **`QS-CURRENCY-KANON` · `fza`/`cmr` NICHT-KANONISCH klären und kanonisch nachführen** *(Befund 2.8.2026, **Risikopfad**)* — `check:fedlex-versionen` meldet im Kanonik-Arbiter beide Staatsverträge mit falscher `html-N`-Wurzel (`fza` html-5 statt html-9 · `cmr` html-3 statt html-6); die **Fassung** ist aktuell, die **Wurzel** nicht. **Bestandsdefekt auf `main`** — Nullprobe 2.8.2026 im unveränderten Haupt-Checkout ebenfalls Exit 1 (§3 Verteilung statt Einzelwert). Erst Ursache klären, dann re-pinnen + regenerieren + §7-Verifikation der Anker. *(Anmerkung 3.8.2026: die Kanonik-Wurzeln von acht Pins — `zgb`,`mwstg`,`bbg`,`usg`,`gwg`,`kag`,`fza`,`cmr` — sind mit PR #414 nachgeführt; dieser Schritt bleibt offen, bis die Ursache belegt und die Anker §7-verifiziert sind.)* **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §17.
  <!-- @meta id: QS-CURRENCY-KANON · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, scripts/fedlex-repin-kanonik.ts, public/normtext/bund] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`, neu 30.6.2026 — Leitprinzip 7 + CLAUDE.md §15)*.
  **§14-Intake 20.7. + 24.7.2026 (David):** TBT-Budget `/gesetze/bund/OR` (#28) — Nullprobe +
  Streuung VOR jeder Feature-Zuschreibung, Lighthouse-Median n≥3 · CI-Pfad-Filter für Doku-/Plan-PRs
  mit **protokolliertem SKIP** (§6 Ziff. 7 lit. b), Tore-Job läuft immer.
  <!-- @meta id: QS-PERF · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer, §15). Reihenfolge a–e: a Tor `check:perf-budget` ✅ · b billige Quick-Wins ✅ · **c M-Daten-Pfad**
  (Idle-Defer, Suchindex in Worker/`export()`, `register.json` sharden) · **d Render-/Split-View-Feinschliff**
  · e CLS-Race-Härtung ✅. **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §1.
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
- **Datenhaltung / VPS-Gate: E3-Serving + E4-UI-Panels** *(QS-DATA, `[OF]`, neu 2.7.2026 — Council-Entscheid)*.
  <!-- @meta id: QS-DATA · status: blocked · of: ja · blocker: vps-bestellung-david · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  **Abgegrenzt 3.8.2026 — dieser Schritt trägt nur noch das David-Gate**, nicht den Datenhaltungs-Bau:
  er hält sichtbar, dass E3-Serving (rsync + cold-FTS, 195 342 Entscheide) und die E4-UI-Panels an
  **einer VPS-Bestellung** hängen (~15 Min David, Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md`).
  **Fertig, wenn** der VPS steht und Serving + Panels darauf laufen. Alles andere — DB-Artefakt als
  eine Quelle (§5), Etappen E0–E6b, Datenhaltungs-Optimierung — liegt in **`W2·6-DATA`** und wird hier
  nicht zweitgeführt. **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §13.
- **Optimierungs-Research Juli 2026 — Betrieb/Frische/Prüf-Tore/FR-IT** *(QS-OPT, `[OF]`, neu 12.7.2026)*.
  <!-- @meta id: QS-OPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [vercel.json, .github/workflows/normen-monitor.yml, src/lib/normtext/laden.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Kritik-gefilterte Ablage des allgemeinen Ultracode-Optimierungs-Research: Betriebs-/Tor-/Bau-
  Optimierungen ohne Rechtsinhalt (O-Reihe). **Leitplanke:** keine Massnahme kürzt Beweis, Tor oder
  Prüfung; jede Einheit golden byte-gleich (§6). **Detail:** [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.
- **Basis-Ausbau — Fundament-Handlungsplan** *(QS-BASIS, `[OF]`, neu 17.7.2026)*.
  <!-- @meta id: QS-BASIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  Kritik-gefilterte Ablage des Ultracode-Fundament-Research (B-Reihe): Tor-Parität lokal/CI,
  Doku-/Register-Wahrheit — Fundament, kein Feature. **Eigener Bau-Umfang = Posten (c)** des
  §14-Intakes 20.7.2026: **CI/lokal-Tor-Parität** (16/36 Tore in CI, Rest-Lücke 20) plus die
  offenen B-Einheiten. **Nicht hier gebaut** (3.8.2026 abgegrenzt, war dreifach geführt):
  Posten (a) Turso-Wächter-Abdeckung → **`QS-AUTOMATIK`** · Posten (b) CI-Fehlläufe #30 → mit
  PR #419 erledigt (Chronik) · Posten (d) Datenhaltungs-Optimierung inkl. R6 → **`W2·6-DATA`**.
  Wortlaut aller vier Posten: [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
- [ ] **`QS-UI` — Oberflächen-Qualität app-weit** *(Ideen-Intake 20.7.2026 · reines UI/Design, §13 · kontinuierlich)*
  <!-- @meta id: QS-UI · status: ready · of: ja · blocker: null · dep: [] · kollision: [DESIGN-REGLEMENT.md, src/index.css, tailwind.config.js, scripts/check-farbwelt.ts, e2e/a11y.e2e.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher Oberflächen-Pass**
  app-weit (Fundament → Hierarchie → Politur), der VOR den flächigen Gesetzes-UI-Schritten läuft.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §8.
  - [x] **UI-WARNLINE · `--warn-line`-Kontrast 3.008 minimal abdunkeln** *(Anlass: Kontrast-Messung 3.8.2026 — der Wert liegt 0.008 über der 3:1-Schwelle für nicht-textliche Kontraste, also innerhalb jeder Mess-Streuung; ein Token-Tick Abdunklung macht die Einhaltung robust)* — reine Token-Änderung, `check:farbwelt` + axe, flip-reversibel. Priorität **niedrig**. **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §11. §13/DESIGN-REGLEMENT.
    <!-- @meta id: QS-UI-WARNLINE · status: done · of: ja · blocker: null · dep: [] · kollision: [src/index.css, scripts/check-farbwelt.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->

**§14-Intake 3.8.2026 (Aufräum-Session — Nebenfunde der CI-Diagnose, der Totcode-Welle und der
Gegenprüfungen des Tages).** Alle `[OF]`, alle klein; je Schritt steht der **Anlass** dabei, damit
später prüfbar bleibt, warum es ihn gibt. Sie stehen im Querschnitt-Band, weil sie **keinen
Reihenfolge-Slot** brauchen (klein, jederzeit einschiebbar), nicht weil sie dauerhaft mitlaufen;
ihr **Dach-Schritt** steht im ID-Präfix (`QS-AUTOMATIK-*` → Automatik-Gesundheit · `QS-BASIS-*` →
Basis-Ausbau · `QS-GP-*` → Gegenprüfung · `QS-TOK-*` → Token-Ökonomie · `QS-CURRENCY-*` →
Fedlex-Currency). Jeder trägt seine Bau-Spec im `ROADMAP-Spec`-§ des verlinkten Fahrplans.

- [ ] **`QS-FRIT-DRIFT` · FR/IT-Drift-Wächter Stufe 1 (eId-Mengenvergleich DE/FR/IT)** *(Anlass: sämtliche Norm-Verifikationen vom 3.8.2026 liefen **nur auf DE** — eine französische oder italienische Fassung könnte längst abweichen, ohne dass ein Tor es sieht)* — im Monitor je **~30 Kern-Erlass** die eId-**Mengen** der drei Sprachfassungen vergleichen und Abweichungen melden; Vollausbau auf alle 227 optional. **Ausdrücklich KEIN dreisprachiges Korpus** — dieser Schritt vergleicht nur MENGEN und meldet; das Befüllen der `fr`/`it`-Fassungen ist **`W2·6-MEHRSPRACH`** und bleibt dort. Reine Prüflogik, kein Snapshot-Schreiben. **Fertig, wenn** der Monitor je Kern-Erlass drei eId-Mengen vergleicht und eine künstlich eingebaute Abweichung **einmal rot** zeigt (§6.7). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.
  <!-- @meta id: QS-FRIT-DRIFT · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows/normen-monitor.yml, scripts/fedlex-versionen-pruefen.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-CURRENCY-TESTS` · Testbindung `cacheBefund` + Kanonik-Ausschluss** *(Anlass: Gegenprüfung zu PR #420, Befund 1 — die neue Cache-Inhalts-Sonde und die Kanonik-Ausschlussliste hängen an keinem Test; ein Tor, das nicht scheitern kann, ist gefährlicher als keines, §6.7)* — je einen Negativfall bauen, der die Sonde und den Ausschluss **einmal rot** zeigt, dann grün. Reine Prüflogik (`Gegenpruefung: n/a`) — **die Ursachenklärung der `fza`/`cmr`-Wurzeln ist Risikopfad und liegt in `QS-CURRENCY-KANON`**; hier wird nur die Scheiterns-Fähigkeit der Sonde gebaut, kein Pin geändert. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.2.
  <!-- @meta id: QS-CURRENCY-TESTS · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, src/tests] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-KORPUS-BMV` · Geltende BMV (Totalrevision `cc/2025/408`) in den Korpus aufnehmen** *(Anlass: BMV-Nachführung 3.8.2026, PR #422 — die alte BMV ist korrekt als aufgehoben markiert, aber die seit 1.3.2026 GELTENDE Nachfolge-Verordnung gleicher SR 412.103.1 fehlt; Nutzer finden nur den historischen Text plus Fedlex-Link)* — regulärer Bundeserlass-Ingest nach Skill `korpus-werkstatt` (Pin, Snapshot, Sidecar, Register; neuer Register-Key neben dem historischen `bmv`), §7-Verifikation, Risikopfad ⇒ Gegenprüfung. Amtsbeleg: AKN `eli/cc/2025/408/20260301`, Art. 34 (Aufhebung alt) / Art. 36 (Inkrafttreten 1.3.2026). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §17.
  <!-- @meta id: QS-KORPUS-BMV · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, public/normtext/bund, src/lib/normtext/aufhebungen.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-E2E-SHARD-GEN` · Shard-Zuordnung in die Spec, JSON generieren** *(Anlass: Landekette 4.8.2026 — 5 von 6 Nachzieh-Konflikten sassen in `e2e/shard-gruppen.json`, weil jede neue Spec dieselben Listen editiert)* — Gruppen-Annotation im Spec-Kopf, JSON generiert ⇒ `merge=regen`-Treiber greift, Konflikt-Klasse entfällt; Union-Wächter bleibt scharf. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.5.
  <!-- @meta id: QS-E2E-SHARD-GEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [e2e, scripts/e2e-shard-gruppen.mjs, .gitattributes] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-UI-HIGHLIGHT` · `::highlight()`-Registry je Leser-Instanz** *(Anlass: Bug-Check zu PR #432, Befund B3 — EINE `lc-such-treffer`-Registry, drei Schreiber [`gesetz-leser/inhalt.tsx`, `entscheidLeserRegeln.ts`, `EntscheidLeser.tsx`]; im Split-View löscht jeder Tastendruck im Rail-Suchfeld die Gesetz-Markierung des Nachbar-Panes, gemessen 190→1 Ranges; Vorbestand, durch den dritten Schreiber verschärft)* — Highlight-Name je Pane/Leser-Instanz, alle drei Schreiber umstellen; Beweis: beide Suchen gleichzeitig markiert. Reine Darstellung. **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §S.
  <!-- @meta id: QS-UI-HIGHLIGHT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/entscheidLeserRegeln.ts, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **`QS-E2E-STABIL` · Lokale e2e-/Test-Budgets an gemessene Streuung binden** *(Anlass: 3./4.8.2026 verloren drei unabhängige Prüf-Agenten je einen Diagnose-Zyklus an dieselben zwei main-verorteten Flakes — BS-640.100-axe reisst lokal 60 s, `suche.test.ts` Hook-Timeout unter Parallellast)* — Budgets streuungs-begründet setzen bzw. Lauf teilen; keine CI-Änderung. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.4.
  <!-- @meta id: QS-E2E-STABIL · status: ready · of: ja · blocker: null · dep: [] · kollision: [playwright.config.ts, e2e/a11y.e2e.ts, scripts/datenhaltung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-KORPUS-SCOPE` · scope/decl-Sektionen von 12 Staatsverträgen ohne annex-Container ingestieren** *(Anlass: Gegenprüfung zu PR #425/`W2·5d-ANNEX` 3.8.2026, Nebenbefund N2 — 23 amtliche `scope_`/`decl_`-Sektionen in 12 Staatsverträgen liegen ausserhalb eines `div#annex`-Containers und fehlen darum vollständig in Snapshot+Sidecar; Vorbestand, an CISG/KRK/UNO_PAKT_II/CEDAW belegt)* — Extraktor-Erweiterung + Regeneration der 12 Erlasse, §7-Verifikation; Mitnahme N1 (ANNEX_CONTAINER-Regex-Härtung, gleiche Datei). **Risikopfad** ⇒ Gegenprüfung; golden-Diff erwartet (neue amtliche Substanz). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §19.
  <!-- @meta id: QS-KORPUS-SCOPE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-GP-BEREICH` · `gegenpruefung:ok --bereich A..B` + `check:gegenpruefung` prüft auch `origin/main..HEAD`** *(Anlass: drei Hand-Hash-Quittungen an einem Tag — 3.8.2026 —, weil das Tor nur den Working Tree sieht; committete Branch-Arbeit muss heute per Hand-Hash quittiert werden)* — Bereichs-Argument + Commit-Bereich-Diff, damit der Regelfall wieder mechanisch quittierbar ist. Tor-Code ohne Inhaltsänderung; **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.1.
  <!-- @meta id: QS-GP-BEREICH · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/gegenpruefung-ok.ts, scripts/check-gegenpruefung.ts, scripts/gegenpruefung/kern.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-GP-PRERENDER` · `check:prerender-golden` als Opt-in-Beweiswerkzeug** *(Anlass: der 8164-Seiten-Byte-Gleichheits-Beweis der Totcode-Gegenprüfung zu PR #418 war Handarbeit — der stärkste Beweis des Tages hatte kein Werkzeug)* — ein **nicht** im Pflicht-Gate verdrahteter Befehl, der zwei Prerender-Läufe byte-vergleicht und die Differenz benennt; wer ihn ruft, bekommt denselben Beweis reproduzierbar. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.2.
  <!-- @meta id: QS-GP-PRERENDER · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/prerender.ts, package.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-GP-PREPUSH` · Verdikt-Prüfung vor dem Push (lokaler pre-push-Hook)** *(Anlass: Bau-Evaluation 3.8.2026 — der CI-Lauf zu PR #422 brauchte 11 Minuten, um ein fehlendes Gegenprüfungs-Verdikt zu melden, das `check:gegenpruefung` lokal in Sekunden gezeigt hätte)* — `scripts/git-setup.sh` (npm `prepare`) verdrahtet einen pre-push-Hook, der bei Risiko-Diff in `origin/main..HEAD` ohne Quittung den Push mit Hinweis stoppt; `--no-verify` bleibt als bewusster Ausweg. Braucht die Bereichs-Prüfung aus `QS-GP-BEREICH`. Reine Prüflogik; **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.3.
  <!-- @meta id: QS-GP-PREPUSH · status: ready · of: ja · blocker: null · dep: [QS-GP-BEREICH] · kollision: [scripts/git-setup.sh, scripts/check-gegenpruefung.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-AUTOMATIK-BERICHT` · Wächter-Zustandsbericht + Verwaiste-Worktree-Sonde** *(zwei Anlässe, ein Bau: **(a)** die CI-Diagnose vom 3.8.2026 musste 80 Läufe einzeln auswerten, um 13 Fehlerklassen zu finden — es gibt keine Stelle, die sagt, wie es den Wächtern gerade geht; **(b)** PR #417 — der Worktree-Inhalt lag längst über #412/#413 auf `main` (`changed_files=0`), Branch und Worktree standen trotzdem noch, das kostete eine Session-Anfangsstunde)* — **ein** Befehl in `scripts/check-ci-laeufe.ts`, der (a) je Wächter/Workflow letzten Lauf, Ergebnis und Alter ausgibt und (b) meldet, wenn ein Worktree-/Branch-Diff gegen `main` **leer** ist (gelandet, aber nicht abgeräumt). **Fusioniert 3.8.2026** aus `QS-AUTOMATIK-BERICHT` + `QS-AUTOMATIK-WT`: dieselbe Datei, dieselbe Risiko-Klasse (reine Prüflogik), zweimal denselben Bericht anzufassen wäre doppelte Arbeit (Skill `auftrag`, Ziff. 3). **Erweitert 3.8.2026 (Bau-Evaluation):** Sonde (b) gleicht zusätzlich Branches ohne Worktree (lokal wie `origin/*`) gegen offene PRs ab und meldet Worktrees ausserhalb des Repo-Verzeichnisses (Scratchpad-Pfade beendeter Sessions) — Ist-Befund: 9 Worktrees, 6 Feature-Branches; die manuelle Rest-Inventur skaliert nicht über parallele Sessions. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.1.
  <!-- @meta id: QS-AUTOMATIK-BERICHT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/check-ci-laeufe.ts, .github/workflows] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-TOT` · `check:tot` blockierend bei NEUEN Meldungen** *(Anlass: die Totcode-Welle PR #418/#420 hat knip von 162 auf 1 Meldung gesenkt — die Basis ist erstmals klein genug, um Neuzugang hart zu melden, statt wieder anzuwachsen)* — Basislinie = **1 Falsch-Positiv (`SkalaEintrag`)**, deklariert und begründet; alles darüber ist rot. `--no-exit-code` fällt damit weg. Reine Prüflogik. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.2.
  <!-- @meta id: QS-BASIS-TOT · status: ready · of: ja · blocker: null · dep: [] · kollision: [knip.json, package.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-DEPS` · Dependency-Frische: `npm audit` + Majors + knip-Unlisted** *(Anlass: knip meldet `playwright` und `react-router` als unlisted, und der Abhängigkeitsstand wurde seit Monaten nicht systematisch geprüft)* — Audit als **Meldung, nie Stopper** (Geparkt-Entscheid Betriebs-Instrumente bleibt), Major-Sprünge einzeln bewertet. **Mitnahme 4.8.2026 (Code-Inventur):** `@vitest/coverage-v8` ist die einzige echt ungenutzte devDependency (kein Import, kein `--coverage`, kein Workflow) — entfernen; `linkedom` trotz POC-Kommentar behalten (5 produktive Nutzer). **ACHTUNG Lockfile:** Änderungen nur über `npx npm@10` — lokales npm 11 erzeugt eine CI-inkompatible `package-lock.json`. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.3.
  <!-- @meta id: QS-BASIS-DEPS · status: ready · of: ja · blocker: null · dep: [] · kollision: [package.json, package-lock.json, knip.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-DOKU-CI` · Doku-Kurzpfad auch für main-Pushes — David-Entscheid nötig** *(Anlass: Bau-Evaluation 3.8.2026 — fünf `docs(plan)`-Pushes auf `main` liefen an einem Tag je ~15 Minuten Voll-CI; der PR-Kurzpfad `art=doku` existiert seit der CI-Härtung, greift aber bewusst nur bei `pull_request`)* — die Diff-Klassierung aus `ci.yml` auf `push`-Events nach `main` ausweiten, gleiche konservative Regeln (nur reine `.md`-Diffs; im Zweifel Volllauf). **Blockiert**, weil es den dokumentierten Grundsatz «ein Deploy-Stand wird nie nach Dateiendungen abgekürzt» (ci.yml, Diff-Klassierung) lockert — das entscheidet David, nicht eine Session. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.4.
  <!-- @meta id: QS-BASIS-DOKU-CI · status: blocked · of: ja · blocker: david-entscheid-doku-kurzpfad-main · dep: [] · kollision: [.github/workflows/ci.yml] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-AUTOMATIK-PARITAET` · Paritäts-Sonde: PR-Deckung ≠ Wächter-Deckung** *(Anlass: F2b-Vorfall 4.8.2026 — #425 änderte 226 Normtext-Snapshots ohne Manifest-Nachzug und passierte das PR-CI grün, weil `check:tor-paritaet` das nur in `turso-sync.yml` laufende `check:datenhaltung` als «gedeckt» zählte; ein post-merge-Wächter kann aber keinen Merge verhindern — die Drift meldete erst der rote Sync NACH der Landung)* — Regel (1) der Sonde auf `ci.yml`-Deckung schärfen; die 5 heute nur wächter-gedeckten Tore (`check:verfall`, `check:normtext`, `check:struktur-konsistenz`, `check:verklebung`, `check:paritaet`) je einzeln evaluieren: PR-CI-Verdrahtung oder begründeter Allowlist-Eintrag mit benanntem Ersatz-Arbiter (Regel 3 bindet den Verweis maschinell). Schärfung **einmal rot zeigen** (§6.7). **Erweitert 4.8.2026 (Code-Inventur):** zusätzlich die drei NIRGENDS laufenden Tore `check:suchindex` (Artefakt gitignored, besonders drift-anfällig!), `check:rss-oc`, `check:confidence` einbeziehen — verdrahten oder mit Begründung streichen. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.5.
  <!-- @meta id: QS-AUTOMATIK-PARITAET · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/check-tor-paritaet.ts, .github/workflows] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-TOK-DECKEL` · Root-Markdown-Deckel 22 → ~20** *(Anlass: der Deckel «rund 20 Root-Markdown-Dateien» steht seit 31.7.2026 im Skill `auftrag`, der Ist-Stand liegt bei 22 — ein Deckel, der überschritten und nie nachgezogen wird, ist keiner)* — datierte Audit-/Backlog-Dateien nach `archiv/`, Verweise nachziehen. Reine Doku. **Detail:** [FAHRPLAN-TOKEN-OEKONOMIE.md](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §11.1.
  <!-- @meta id: QS-TOK-DECKEL · status: ready · of: ja · blocker: null · dep: [] · kollision: [archiv] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
- [ ] **`QS-TOK-AUFRAEUMEN` · Skill `aufraeumen` (Playbook der Session vom 3.8.2026)** *(Anlass: die Aufräum-Session hat ein wiederholbares Verfahren erzeugt — Rotation, Chronik-Überführung, Streich-Massstab, Fahrplan-Archivierung, Tor-Reihenfolge —, das heute nur im Kopf steht)* — als Skill ablegen, damit die nächste Aufräumung nicht wieder erfunden wird. Prozedur gehört in einen Skill, nicht ins Reglement (CLAUDE.md-Kopf). **Detail:** [FAHRPLAN-TOKEN-OEKONOMIE.md](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §11.2.
  <!-- @meta id: QS-TOK-AUFRAEUMEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [.claude/skills] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
- [ ] **`QS-EXTQUELLEN` · Externe Quellen/APIs/Repos — Befundliste bewerten und verorten** *(Recherche 3.8.2026 auf Auftrag David, ~60 Abfragen und 7 live geprüfte Endpunkte; **die Bewertung ist ausdrücklich OFFEN gelassen — dieser Schritt IST die Neubewertung**, Anordnung David: «baue es einfach als findings ein, andere session soll es dann nochmals neu evaluieren»)* — Vier Befunde **stützen Bestehendes**: (a) unabhängige Feiertags-Zweitquelle mit kantonalen Normzitaten gegen das BJ-Verzeichnis **Stand 1.1.2011**, das `src/data/zpoFeiertage.ts` und damit sämtliche Fristen-Engines trägt — die Zweitquelle deckt heute aber nur ZH/TI; (b) unabhängiger Normtext-Zweitbestand als **Diff-Orakel** für `check:fedlex-versionen`/`currency.json` (ein Ein-Quellen-Check kann «aktuell» nicht von «konsistent stale» unterscheiden); (c) BFS-Gemeindeverzeichnis historisiert (HTTP 200, eCH-0071, Stichtags-Parameter) als amtlich prüfbare Ortseingabe für `zustaendigkeit.ts`/`schkgZustaendigkeit.ts`; (d) kantonale Amtskreis-Geodaten als letzte Meile der SchKG-Zuständigkeit — **nur BE/ZH/SO/LU/TG, kein nationales Register**. Geparkt, weil erweiternd statt stützend: SHAB-API, QR-Rechnung, eSchKG 2.2.01, PDF/A (BEKJ 1.7.2027). **Fertig, wenn** je Befund entschieden ist — eigener Schritt, an einen bestehenden angedockt (Kandidaten: `QS-CURRENCY-KANON`, `QS-FRIT-DRIFT`, `W2·13-KANTONE-DRIFT`) oder verworfen — und die fünf offenen Fragen aus §5 des Dossiers beantwortet sind, darunter **eine an David** (kommerzieller Betrieb? davon hängt ab, ob `droid-f/fedlex` unter CC BY-NC-SA überhaupt berührt werden darf). **Befunde:** [externe-quellen-repos-2026-08-03.md](bibliothek/recherche/externe-quellen-repos-2026-08-03.md).
  <!-- @meta id: QS-EXTQUELLEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [bibliothek/recherche] · worktree: nein · 26x: nein -->
- [~] **`QS-PLAN-BILD` · Lagebild-Generator `npm run plan:bild`** *(Auftrag David 4.8.2026 — das handgebaute HTML-Lagebild dieser Session hat sich bewährt («ja gefällt mir»); als Schnappschuss veraltet es, darum als Generator verankern)* — ein Skript auf dem bestehenden Parser (`scripts/plan/parse.ts`), das die **laienverständliche** Übersichtsseite deterministisch erzeugt: Bestand-Kacheln · Phasen-Position (GESAMTAUFBAU) · «Wartet auf David» (Blocker + offene Entscheide) · `@queue` in Klartext · Baustellen-Karten je `fahrplan:`-Gruppe mit Fortschritt und nächstem Schritt. **Erweitert zum Steuerpult (Go David 4.8.2026):** je `ready`-Schritt ein generierter, kopierbarer Bau-Prompt für Untersessions (inkl. wip-Setzen, Worktree, Slice-Befehl, DoD, §14.7 wörtlich) + Sektion «Gerade im Bau» (`wip`-Schritte, offene PRs mit CI-Status, Worktrees) mit `--watch`-Auto-Refresh; kein Server. Reine Lese-/Werkzeug-Schicht: kein `src/`-Code, kein Deploy-Artefakt, Ausgabe als eigenständige HTML-Datei ausserhalb von `public/`. Kein Risikopfad. **Detail:** [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md) §«Lagebild-Generator `plan:bild`».
  <!-- @meta id: QS-PLAN-BILD · status: wip · of: ja · blocker: null · dep: [] · kollision: [scripts/plan, package.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md -->

**§14-Intake 4.8.2026 (Code-Inventur — drei read-only Analysen der Logik-, Darstellungs- und
Pipeline-Schicht auf Auftrag David, «denk gross»).** Befunde mit Belegen:
[code-inventur-2026-08-04.md](bibliothek/betrieb/code-inventur-2026-08-04.md) · Bau-Specs:
[FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) (§6 dort = Verortungs-
Register der Befunde, die in bestehende Schritte geflossen sind; die zwei David-Fragen aus §7 sind
am 4.8.2026 beantwortet: Manifest-Nullzeilen gewollt · `normalisiereTarifText`-Freigabe bestätigt
und in `DESIGN-REGLEMENT-NORMTEXT.md` §1 gehoben).

- [ ] **`QS-CODE-TURSO` · Turso-Sync-Durchsatz: Wurzel-Fix des FTS-Insert-Pfads** *(Anlass: Code-Inventur 4.8.2026 — 22.3 von 32.8 min Sync entfallen auf zeilenweises Insert in `fts_entscheide_schaufenster` bei ~4 Zeilen/s; Timeout-Reserve trägt nur ~3.7× Korpusgrösse, kollidiert mit `W2·13-KANTONE`)* — Batch/Rebuild/Dump-Varianten messen, dann umstellen; Ziel <15 min Voll-Sync bei inhaltsgleicher Tabelle. **Risikopfad** (`scripts/datenhaltung`) ⇒ Gegenprüfung. Abgrenzung: nur Durchsatz des bestehenden Syncs — Architektur bleibt `W2·6-DATA`, Wachstums-Schwellen bleiben `QS-AUTOMATIK`. **Detail:** [FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) §1.
  <!-- @meta id: QS-CODE-TURSO · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/datenhaltung, .github/workflows/turso-sync.yml] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md -->
- [~] **`QS-CODE-FRISTENKERN` · Grenzwert-Batterie für `fristenEngine.ts`** *(Anlass: Code-Inventur 4.8.2026 — die von 5 Rechtsgebiets-Engines geteilte Fristen-Infrastruktur hat 6 direkte Testfälle; ein Fehler dort schlägt auf ZPO-, SchKG-, Verjährungs- und Mietfristen gleichzeitig durch)* — reiner Test-ZUBAU (Monatsenden, Feiertags-Kaskaden, Stillstands-Überschneidungen, Jahreswechsel), jeder Fall mit Norm-Anker; Scheiterns-Fähigkeit per Mutation **einmal rot** zeigen (§6.7). `Gegenpruefung: n/a — reine Prüflogik`; findet die Batterie einen echten Fehler, ist dessen Fix ein eigener Risikopfad-Schritt. **Detail:** [FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) §2.
  <!-- @meta id: QS-CODE-FRISTENKERN · status: wip · of: ja · blocker: null · dep: [] · kollision: [src/tests] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md -->
- [ ] **`QS-CODE-AUSSENKANTEN` · Unbewachte Aussenkanten: Tor `check:ui-normzitate` + typisierte JSON-Kanten** *(Anlass: Code-Inventur 4.8.2026 — 1'141 hart kodierte `Art.`-Zitate in 107 UI-Dateien sind eine zweite Norm-Quelle ohne Tor gegen das Register; 9× `as unknown as` an JSON-Importen in `src/data` lassen Struktur-Drift compiler-stumm)* — neues Tor gegen das Norm-Register (Meldungs-Phase → Basislinie → blockierend, einmal rot zeigen) + strukturelle Guards statt der 9 Blind-Casts. Verhaltensneutral. **Detail:** [FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) §3.
  <!-- @meta id: QS-CODE-AUSSENKANTEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts, src/data, package.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md -->
- [ ] **`QS-CODE-ENTDOPPLUNG` · Entdopplungs-Programm Darstellungsschicht (D1–D7)** *(Anlass: Code-Inventur 4.8.2026 — 24 von 29 Vorlagen-Seiten rollen von Hand, was der existierende Rahmen `VorlagenSeite.tsx` kann; `VorlageAgGruendung` hält 55 Einzel-useState neben dem 24-fach genutzten `useWizardState`; Gerichtswahl-Block 6×, Kantonsvergleichs-Tabelle 4×, Permalink-Einlesen 17× kopiert)* — §3-konforme Verkleinerung NUR in der Darstellungsschicht, je Posten ein PR (Reihenfolge D6→D1→D2→D4→D3→D5/D7), jede Einheit e2e-grün + golden byte-gleich; Nebengewinn `aria-pressed` auf 7 handgerollten Kacheln. **Detail:** [FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) §4.
  <!-- @meta id: QS-CODE-ENTDOPPLUNG · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages, src/components/vorlagen, src/components/forms] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md -->
- [ ] **`QS-CODE-SPLITS` · Grossdatei-Aufteilungen mit dokumentiertem Schnitt** *(Anlass: Code-Inventur 4.8.2026 — sechs Misch-Dateien mit klarem Trenner: `fedlex.ts` 1'017 Z/4 Achsen, `zustaendigkeit.ts` 986 Z/2 Engines, `besetzung.ts` 874 Z Parser↔Kanon, `prozesskosten.ts`, `zitat-extraktion.ts`, `EntscheidLeser.tsx` 893-Z-Monolith neben dem in 28 Dateien zerlegten Gesetz-Leser)* — je Datei ein verhaltensneutraler Schritt nach Skill `refactoring` (Fassade, Golden byte-gleich, Tests unangepasst), **opportunistisch beim ohnehin anstehenden Bau an der Datei**, nie als Selbstzweck-Welle; `istRisikoPfad()` entscheidet über Gegenprüfung; `EntscheidLeser` mit `QS-UI-HIGHLIGHT` sequenzieren (gleiche Datei). **Detail:** [FAHRPLAN-CODE-VERBESSERUNG.md](fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md) §5.
  <!-- @meta id: QS-CODE-SPLITS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/fedlex.ts, src/lib/zustaendigkeit.ts, src/lib/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-CODE-VERBESSERUNG.md -->

---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `fahrplaene/FAHRPLAN-*.md`.
>
> **Etikett-System (`@meta`/`@queue`/`@blockers`), Tor-Regeln und Geltungsbereich der IDs:**
> [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md). Der frühere Wächter-Schritt
> `QS-PH` ist darin aufgegangen (erledigt; Wortlaut → `ROADMAP-CHRONIK.md`, 3.8.2026).

<!-- @queue: QS-TOK, W2·10-UI-NAV, W2·5h-GESETZ-UI, W2·13-KANTONE, W2·6b-MAT-FINMA -->
<!-- ^ SSoT der Bau-Reihenfolge (Einbau 24.7.2026): plan:next wertet die @queue VOR der
     Dokumentreihenfolge aus; Integrität erzwingt check:plan Regel 8 (tote/erledigte IDs rot,
     Prosa-«OBERSTER» muss dem Queue-Kopf entsprechen). Priorität ändern = NUR diese Zeile
     ändern, nicht Prosa. Begründung je Schritt in den Dekret-Blöcken darunter.
     Präzedenz QS-TOK vor Gesetzesdarstellung: von David BESTÄTIGT (Chat 24.7.2026, «nein
     passt»); will er später die Gesetzesdarstellung vorziehen, `W2·5d` an den Kopf dieser
     Zeile setzen (der frühere Platzhalter `W2·12-HYGIENE` ist erledigt, Chronik 3.8.2026). -->

> **⬆ OBERSTER OFFENER SCHRITT: `QS-TOK`.** Steht am Kopf der `@queue` (Priorisierung David
> 10.7.2026, Wortlaut «oberster schritt soll sein den token verbrauch zu minimieren»); die
> Aufräumwelle vom 31.7.2026 (AP-0…AP-11, PR #407) ist gebaut, der Schritt daher wieder
> **`ready`** statt `wip`. Offener Rest: **T10 · T12-Stufe-2 · T14 · T16 · T20** (Go David
> 27.7.2026 erteilt; T16 nur in frischer Session). Das ROADMAP-Ceiling ist am **3.8.2026 wieder
> eingehalten** (Aufräumwelle: erledigte Schritte in die Chronik überführt); die Ist-Zahl liefert
> `python3 .claude/hooks/struktur-rotieren.py --check` und wird hier bewusst **nicht**
> zweitgeführt — die frühere fixe Zahl war überholt, Endprüfungs-Funde 6/12/31.
> **Bau-Spec: [`fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md`](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §§3–§7, Reihenfolge §8; Stand/Belege: §Stand 31.7.2026.**
> Danach folgt `W2·5d` gemäss `@queue`.
> <!-- @meta id: QS-TOK · status: ready · of: ja · blocker: null · dep: [] · kollision: [package.json, scripts, .claude, CLAUDE.md, ROADMAP.md, STRUKTUR.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
> Bau verbraucht **weniger Tokens** — nur über Effizienz (gezielter lesen, kompakter übergeben,
> deterministisch statt modellgetrieben, cachen, indizieren); Einmal-Investitionen ok.
> **Leitplanke (nicht verhandelbar):** keine Massnahme kürzt Beweis, Tor oder Prüfung —
> Gegenprüfung/Doppel-Verifikation/iterative Bug-Checks/golden byte-gleich bleiben unangetastet.
> Die Feature-Reihenfolge steht in der **`@queue`-Zeile oben** (SSoT); abgelöste Fassung wörtlich
> → `ROADMAP-CHRONIK.md` → Steuerungs-Prosa (24.7.2026).
> **Stand 31.7.2026:** autonomer Bau-Rest der Pakete T1–T19 ist gebaut; offen bleiben die fünf
> Posten oben (Go David 27.7.2026) plus das ROADMAP-Ceiling. Nachmess-Beleg und die drei Massgaben
> (T16 nur in frischer Session · T12-Stufe-2 Weglassungs-Begründung neu bewerten · T20 ist ein
> stehendes Instrument, kein Einmal-Bau) wörtlich → `ROADMAP-CHRONIK.md` → QS-TOK (3.8.2026).

> **■ Fokus-Dekret 24.7.2026 (David, §14-Intake): die Gesetzesdarstellung steht im Vordergrund.**
> Reihenfolge **(1)** verhaltensneutrale Code-Anpassungen, die die Gesetzes-Strecke einfacher machen →
> **(2)** die Gesetzes-Schritte prioritär (W2·5-Familie, `W2·5h`, `W2·13-KANTONE`) → **(3)** daneben
> `W2·6b-MAT-FINMA` (Bewerbungs-Kontext FINMA). Das Verzahnungs-Fundament `W2·7-BEZUG` aus (3) ist seit
> 29.7.2026 eingelöst. **SSoT der Reihenfolge = `@queue`-Zeile oben**; Wortlaut des Dekrets →
> `ROADMAP-CHRONIK.md` → Fokus-Dekret 24.7.2026 (3.8.2026).

> **■ Auftrags-Eingang 30.6.2026 (David) — §14 gebündelt + verortet.** 13 Aufträge, alle `[OF]`; offen
> ist daraus nur noch **Bündel S** (`W3·14-S`). Quell-Architektur-Entscheid (AKN-XML Phase 1) und der
> Intake «Informations-Nutzung der Gesetze» (G-REF/G-HIST) stehen im Volltext in
> [`FAHRPLAN-NORMTEXT-DARSTELLUNG.md`](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md) `§Quell-Architektur-Entscheid` bzw. `§Intake`;
> der ganze Block wörtlich in [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §2.

### Welle 1 — Kern: Norm → Werkzeug → Schriftsatz + die Alltags-Klingen

- [ ] **4 · Prozesskosten-Cockpit Restbau** *(PROZESSKOSTEN-COCKPIT, Hauptmoat)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W1·4 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  **Anlass der Entparkung:** der Blocker `wbqdyap3x` trug seine eigene Auflösung im Register —
  «kein David-Gate, die Recherche ist `[OF]` und selbst Teil von W1·4; sonst bleibt der Hauptmoat
  dauerhaft geparkt». Er ist gestrichen; die Recherche ist jetzt **Arbeitsschritt (a)** dieses Schrittes.
  **Reihenfolge:** (a) Recherche Schlichtungs-/Reduktions-/Rechtsmittel-Modifikatoren an amtlichen
  Tarifen belegen (Norm + Link + Stand, §7 — Risikopfad ⇒ `QS-GP`) → (b) **I2** damit bauen →
  (c) Festsetzung/Dispositiv. **I4 ✅** (1.7.2026, Bemessungskriterien 25 GK + 26 PE, §7-belegt,
  QS-GP bestanden) · **I9-Rest ✅** (Notariats-/Grundbuch-Querverweis) — Wortlaut →
  `ROADMAP-CHRONIK.md` → W1·4 (22.7.2026). **26×-Slot bleibt frei** (`26x: nein`); die Tarif-Tranche
  des Schrittes ist Kettenglied 3 der `@slot-kette`. **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md).
 
- [ ] **5-PRAXIS · Frist × Kosten verzahnen** *(Ideen-Intake 20.7.2026 · UI-Orchestrierung, `[OF]`)*:
  <!-- @meta id: W1·5-PRAXIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechnerPermalinks.ts, src/lib/permalink.ts, src/lib/icsExport.ts, src/pages/RechnerProzesskosten.tsx, src/pages/RechnerStreitwert.tsx, src/pages/RechnerZpo.tsx, src/pages/RechnerUebersicht.tsx, src/components/forms/ProzesskostenForm.tsx, src/components/forms/StreitwertForm.tsx, src/components/forms/ZpoFristenForm.tsx, src/components/forms/VorlagenSprung.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Weg** verketten
  (Frist → Kosten → Vorlage), reine UI-Orchestrierung ohne neue Rechtsregel (§3).
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [x] **5d · Gesetzes-UX & Darstellungs-Reglement** *(GESETZES-UX, `[OF]`, eigener Worktree; Auftrag David 4.7.)*:
  <!-- @meta id: W2·5d · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/pages/gesetz-leser/inhalt.tsx, src/components/normtext/ArtikelBody.tsx, src/lib/normtext/register.ts, src/components/suche, scripts/normtext] · seq-hart: [QS-PERF(ArtikelBody.tsx)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Detail (Spec wörtlich, inkl. Nachzug-Wellen A19–A25/A29–A40, IA-Reihe §11, eId-Reihe §12):** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §16.
  - [x] **5d-EID3 · EID-3 Teil (b): Linien-Tiefe aus der eId-Pfadlänge** — Guide-/Einzugstiefe aus dem kumulativen eId-Pfad statt aus der Sidecar-Rekursionstiefe; golden-neutral, Tor `check:linien-kanon`.
    <!-- @meta id: W2·5d-EID3 · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/linienAufbau.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [x] **5d-ANNEX · eId-Anker für Annex-Sections** — die aus EID-1 bekannte Grenze schliessen: Container-eIds auch auf dem separaten Anhang-Pfad mitschneiden. **Extraktion = Risikopfad.**
    <!-- @meta id: W2·5d-ANNEX · status: done · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext/struktur-extrahiere.ts, public/normtext/bund] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [x] **5d-SPY · V3/H6 — Scroll-Spy-Härtung (rootMargin ↔ Bezugslinie)** — der einzige offene Härtungs-Posten der E-Reihe; **erst reproduzieren, dann fixen** (H6 ist unreproduziert).
    <!-- @meta id: W2·5d-SPY · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts/SektionBaumTOC.tsx, src/pages/gesetz-leser/scrollAnker.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [x] **5d-YC · IA-Rest Y-C: `/international` Stufe 2** — echter Redirect mit Hash-Mapping; §11 ist sonst komplett, Stufe 2 war dem Stufe-1-Betrieb nachgelagert.
    <!-- @meta id: W2·5d-YC · status: done · of: ja · blocker: null · dep: [] · kollision: [src/lib/seo.ts, src/lib/navigation.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [~] **A24** (L-1+L-2+L-3): Linien-Reparatur, Auto-Default-Umkehr ZGB/OR (Umkehr
    #161, David freigegeben); L-4 entfällt. V2 §2 F4.
    - [ ] **L-3** (Auto-Default-Umkehr): weiterhin **hinter David/Council-Gate** —
      NICHT in feat/v2-l1-l2 gebaut. V2 §2 F4.
- [ ] **10-UI-NAV · UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.)** *(`[OF]`, reine UI/Navigation)*:
  <!-- @meta id: W2·10-UI-NAV · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/components/suche, src/lib/suche, src/lib/universalSuche.ts, src/components/layout, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, src/pages/gesetz-leser, src/pages/GesetzLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  Priorisierter UI-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen — Suche, Navigation und
  Auffindbarkeit über alle Oberflächen; reine Darstellungsschicht (§3), keine Rechtslogik.
  **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §8.
  **`dep`-Korrektur 3.8.2026:** §0.2 des Fahrplans sequenziert nur die **Reader-Flächen**
  (`parts.tsx`/`inhalt.tsx`/`ArtikelBody.tsx`/`index.css`) hart hinter die A-Restposten von `W2·5d`
  und nennt Suche-/Rechtsprechungs-/Sidebar-Einheiten ausdrücklich «weitgehend kollisionsfrei und
  zuerst schneidbar». Die Teilschritte **-S · -V · -J · -J3 · -O** trugen trotzdem `dep: [W2·5d]`
  und standen damit hinter einem Dach-Schritt, dessen offener Rest (EID-3, Härtung) sie gar nicht
  berührt — die dep ist dort gestrichen. Reader-Flächen (**-VR · -R1 · -R2 · -R3 · -R4 · -Z**)
  behalten sie.
  - [ ] **UI-NAV-S · Suche-Rest (S1 + S6)** — Query-Durchreichung `?q=` in die Browse-Pages + mobiler Such-Fokusmodus (≥16 px gegen iOS-Zoom). §2.
    <!-- @meta id: W2·10-UI-NAV-S · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/universalSuche.ts, src/components/suche, src/components/layout/HeaderSuche.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-V · Verzahnung ohne Reader-Fläche (V2 + V4 + V6)** — Hover-Trigger am bestehenden NormPopover · NormChip-`href` intern (Cmd-Klick landet intern) · Vorlage↔Rechner-Kreuzlinks. §3.
    <!-- @meta id: W2·10-UI-NAV-V · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/NormPopover.tsx, src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-VR · Verzahnung auf Reader-Fläche (V3 + V5)** — Regeste-Popover am KantenChip + Erwägungs-Navigation im Entscheid-Leser; `parts.tsx`-Kollisions-Precheck Pflicht (§0.2). §3.
    <!-- @meta id: W2·10-UI-NAV-VR · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/EntscheidLeser.tsx, src/lib/rechtsprechung/abschnitte.ts, src/pages/gesetz-leser/parts.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-R1 · Reader: Finden im Gesetz (R1 + R2)** — In-Gesetz-Suche mit Treffer-Highlight + mobile Gliederung als Bottom-Sheet mit «Sie sind hier». §4.
    <!-- @meta id: W2·10-UI-NAV-R1 · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/parts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-R2 · Reader: Zitieren und Zurückspringen (R3 + R5 + R7)** — zitierfähige Referenz mit Permalink · Rücksprung-Chip-Restscope · Deep-Link-Skeleton «Springe zu Art. X …». §4.
    <!-- @meta id: W2·10-UI-NAV-R2 · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/scrollAnker.ts, src/components/layout/InhaltsKopf.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-URL · Scroll-Hash nur bei explizitem Klick/Teilen (LM-202, David-Entscheid 3.8.2026)** — kontinuierlichen Scroll-Sync der URL entfernen (falls vorhanden); URL ändert sich nur bei Klick auf einen Artikel-Anker bzw. bei der Teilen-Aktion; Rückweg-/History-Verhalten testen; e2e linkTeilen-Tests beachten. FAHRPLAN-UI-BEFUNDE.md §1.1 LM-202.
    <!-- @meta id: W2·10-UI-NAV-URL · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/scrollAnker.ts, src/components/LinkTeilenButton.tsx, src/lib/liveUrlSync.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [x] **UI-NAV-R3 · Reader: Weiterlesen und Tastatur (R4 + R8)** — Positions-Persistenz «Weiterlesen bei Art. X» + Tastatur-Navigation j/k mit «?»-Overlay (R8 = niedrigste Priorität der Reihe). §4.
    <!-- @meta id: W2·10-UI-NAV-R3 · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/lib/zuletztVerwendet.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-R4 · Trefferflächen und a11y (R6 + E4)** — Tap-Target-Sammelticket mit **Token-Regel ins `DESIGN-REGLEMENT.md`** + a11y-Prüfauftrag der Linsen. **Grenze zu `W2·17-UI-BEFUNDE-B10`:** hier entsteht die REGEL (ein Token, eine Reglement-Zeile), dort werden die einzelnen Symbolknöpfe und Aktions-Anker daran angepasst. §4/§7.
    <!-- @meta id: W2·10-UI-NAV-R4 · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/index.css, e2e/a11y.e2e.ts, DESIGN-REGLEMENT.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-J · Rechtsprechungs-Seiten (J1 + J2 + J4)** — Browse-Liste mit Batching und Band-Sprungleiste · Mobil-Filter als Bottom-Sheet · «Neues vom Bundesgericht»-Karten. **Grenze zu `W2·6-UEBERSICHT` (gleiche Seite!):** hier die **Darstellung** der Liste (Batching, Sprungleiste, Sheet), dort die **Korpus-Breite** dahinter (SG-Regeste-Rest, Facetten-Umfang, Kantons-Ausweitung). Wer zuerst baut, macht den Kollisions-Precheck. §6.
    <!-- @meta id: W2·10-UI-NAV-J · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/Rechtsprechung.tsx, src/components/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-J3 · Sachgebiets-Pipeline verfeinern (J3)** — **bewusst allein**, weil Risiko-Pfad: `QS-GP` Pflicht + golden byte-gleich, eigene Gegenprüfungs-Runde. §6.
    <!-- @meta id: W2·10-UI-NAV-J3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung/register.json, src/lib/normtext/browse.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-O · Übersichten und Sidebar (O2 + O4 + O5)** — Sidebar-Konsistenz · Kantons-Einstieg mit Abdeckung vor dem Klick · Scope-Labels der lokalen Suchfelder; alle drei S. §6.
    <!-- @meta id: W2·10-UI-NAV-O · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout/Sidebar.tsx, src/pages/Gesetze.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [x] **UI-NAV-Z · Zusatzposten Ausleitung (Z1 + Z2)** — ICS-/Kalender-Export der Fristergebnisse + Print-CSS für Fundstellen; Ist-Stand vor dem Bau erheben. §7.
    <!-- @meta id: W2·10-UI-NAV-Z · status: done · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/lib/icsExport.ts, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **11-DESIGN · Design-Wärme & Atmosphäre (Ultracode-Synthese 11.7.)** *(`[OF]`, reine Darstellung/Token-Schicht)*:
  <!-- @meta id: W2·11-DESIGN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css, tailwind.config.js, DESIGN-REGLEMENT.md, scripts/check-design-tokens.ts, src/components/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen — Token-Schicht nach
  §13, Normtext-Körper bleibt farbfrei, golden byte-gleich.
  **Detail:** [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5.
  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — surface dunkel heben · warme Schattenbasis · Lichtkante · Scrim-Audit; Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. §2 (D-6).
    <!-- @meta id: W2·11-DESIGN-D6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — Lese-Basis + Entscheid-Stepper als Multiplikatoren, CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. §2 (D-7).
    <!-- @meta id: W2·11-DESIGN-D7 · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D6] · kollision: [src/index.css, src/pages/EntscheidLeser.tsx, src/components/rechtsprechung, DESIGN-REGLEMENT.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8a · Wörterbuch auf die Fläche: slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen; Playwright-Screens in die Abnahme-Mappe.
    <!-- @meta id: W2·11-DESIGN-D8a · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D7] · kollision: [src/components/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann mechanischer Rest (D-8.2)** — ~50 verteilte Fundstellen; **Pilot zuerst** (Startseite + 1 Rechner) mit Vorher/Nachher-Screens, danach der Rest. Nicht flip-reversibel. **Grenze zu `W2·17-UI-BEFUNDE-B12`:** hier nur der Schriftart-Tausch (mono → Text), dort Verhalten und Zustände derselben Felder — nacheinander bauen, nicht gleichzeitig (`src/components/forms`, `DatumsFeld.tsx`, `BetragsFeld.tsx`).
    <!-- @meta id: W2·11-DESIGN-D8b · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D8a] · kollision: [src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/pages/Startseite.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten, Abschluss der Anwendungs-Schicht.
    <!-- @meta id: W2·11-DESIGN-D8c · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D8b] · kollision: [src/components/start, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->

- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W2·5g-ZEIT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, src/lib/normtext, public/normtext] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» (verknüpft mit dem Entscheiddatum) + **visueller Diff zweier
  Konsolidierungen**; konsolidiert **M16** «Point-in-Time» + **G-HIST** als Daten-Unterbau in eine
  getrackte Einheit. Extraktions-Risikopfad ⇒ `QS-GP`.
  **Anlass der Entparkung:** der Blocker `zeit-historik-poc` war kein fremdes Gate, sondern der erste
  Arbeitsschritt des Schrittes selbst. Er ist gestrichen; die Vorbedingungen bleiben als **harte
  Bau-Reihenfolge** erhalten: **(a) POC** historische Fedlex-Konsolidierungs-Extraktion (auf Platte
  liegt nur die geltende Fassung; `dateApplicability` per SPARQL vorhanden, Durchlauf gross) →
  **(b)** AKN-XML Phase 1 (Quell-Architektur-Entscheid Council 30.6.2026, schaltet M16 frei) und
  **G-HIST** als Daten-Unterbau — beide sind **keine getrackten Schritte** und darum nicht als `dep`
  abbildbar (Wortlaut: [FAHRPLAN-NORMTEXT-DARSTELLUNG.md](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md)
  `§Intake`) → **(c)** Bau. Vor (c) je Kandidat das POC-Ergebnis vorlegen (§8: kein Fassungs-Diff auf
  geratener Historie). **Detail:** [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §8.
 
- [ ] **5h-GESETZ-UI · Gesetzes-Webseite: UX-Pass** *(Ideen-Intake 20.7.2026 · reine UI/Darstellung)*:
  <!-- @meta id: W2·5h-GESETZ-UI · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/normtext, src/components/suche] · seq-hart: [QS-UI(a Fundament-Pass + b Hierarchie-Pass)] · seq-weich: [W2·10-UI-NAV(gesetz-leser, GesetzLeser.tsx, components/suche), W3·14(Split-View-Rahmen)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Folgeschritt aus `QS-UI`** (Davids Sequenz: erst app-weit, dann die Gesetzes-Seite): UX-Pass auf
  der Gesetzes-Webseite inkl. Kopfzeilen-Bündel — reine UI/Darstellung, amtliche Substanz unangetastet.
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §17.
- [ ] **5j-TABELLEN · Tabellen in Gesetzen lesbar machen** *(§14-Intake 20.7.2026 · Extraktion + Darstellung, `QS-GP`)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W2·5j-TABELLEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext/adapter-pdf.ts, src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Anlass der Entparkung:** der Blocker `david-spaeter-tabellen` war **kein technischer** — Daten und
  Weg sind seit 20.7.2026 geklärt (656 `mehrspaltig`-Blöcke in 137 Erlassen); er hing allein an Davids
  «später», und das ist am 3.8.2026 aufgehoben. Kein Bau-Vorlauf nötig.
  Beispiel-Defekt `/gesetze/kanton/BS-154.810#art-29`. Extraktion = Risikopfad ⇒ `QS-GP` + golden
  byte-gleich; Zellinhalte exakt wie Quelle, mehrdeutig ⇒ Block als Text belassen (§1).
  **Grenze zu `W2·13-KANTONE-K7` (PDF-Werkstatt):** dieser Schritt macht **erkannte
  `mehrspaltig`-Blöcke lesbar** (Tabellen-Semantik + Darstellung); K-7 repariert die **PDF-Extraktion
  davor** (Dehyphenations-Gate, VD/SZ/ZH). Wer an `adapter-pdf.ts` die Texterkennung ändert, ist in
  K-7, nicht hier.
  **Detailquellen (fertige Implementation Plans, gestuft):**
  [Stufe 1 · Füllpunkt-Zweispalter (SG)](docs/superpowers/plans/2026-06-22-kantonale-tarif-tabellen.md) ·
  [Stufe 2 · Mehrspalten-Tarif-Tabellen (ZH § 4 x-geometrisch, Klasse A NW/BS/SO/VS)](docs/superpowers/plans/2026-06-22-mehrspalten-tarif-tabellen.md) ·
  [Design-Spec (3 Defektklassen, Ansatz «Generator-Extrakt, gestuft» — von David gewählt)](docs/superpowers/specs/2026-06-22-kantonale-tarif-tabellen-design.md);
  ROADMAP-Spec: [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §18.
- [ ] **5k-LINIEN-KONZEPT · Linienführung tiefer Kodifikationen neu konzipieren** *(Anlass: Davids
  zweifaches Live-Verdikt — 12.7.2026 (A28) und 3.8.2026 nach Preview von PR #423: «eine einzige
  linie und unbrauchbar». Die EINE Auto-Guide-Linie auf der Gliederungsebene trägt bei ZGB/OR
  keine nützliche Orientierung; der Schalter-Flip wurde zweimal gebaut und zweimal am selben
  Urteil verworfen)* — **KONZEPT-Schritt, kein Bau**: 2–3 Varianten entwerfen (z.B. Linie je
  aktiver Verschachtelungsebene, Sticky-Gliederungs-Kontext, Hover-/Fokus-Guides), als klickbare
  Prototypen (Preview-Deploy) **zur David-Abnahme VOR jedem Vollbau**. Harte Regel aus der Lehre:
  dieser Gegenstand wird **nie wieder über eine blosse Default-Umkehr** gelöst. A28 (Auto-Guide
  aus, manuell einschaltbar) bleibt bis zur Abnahme der Live-Stand. Referenz-Baustand des
  verworfenen Versuchs: geschlossener PR #423 (`fd44b37b3`, mit Beweisen). **Detail:**
  [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §L-3/A28.
  <!-- @meta id: W2·5k-LINIEN-KONZEPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/linienAufbau.ts, scripts/check-linien-kanon.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Vier eigenständige Unterschritte tragen den Strang: Mehrsprach-Vergleich · Norm-Resolver ·
  Adressregister · Übersicht/Korpus-Breite (unten). **Detail + Schnitt-Begründung:**
  [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13.
    - [ ] **6-MEHRSPRACH · Mehrsprachiger Normvergleich DE/FR/IT** — Auslegungswerkzeug nach Art. 14 PublG: drei Sprachfassungen je Erlass + Synopse-UI; heute ist nur `de` befüllt. §13.
      <!-- @meta id: W2·6-MEHRSPRACH · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund, src/pages/gesetz-leser] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-RESOLVER · Kantonaler Norm-Resolver → Kantonalnorm-Buckets (P0-Kern)** — `norm-index` füllt heute nur Bundesnorm-Buckets; der Resolver ist Voraussetzung der kantonalen Stufe. **Risikopfad.** §13.
      <!-- @meta id: W2·6-RESOLVER · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechtsprechung/norm-index.ts, public/rechtsprechung/norm-index] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-ADRESSEN · Gerichts-/Behörden-Adressregister** — Lese-/Index-Schicht über die bestehenden Bestände, **kein Datenduplikat** (§5). Quelle `bibliothek/behoerden/`. §13.
      <!-- @meta id: W2·6-ADRESSEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [bibliothek/behoerden, src/lib/kontext.ts, src/pages/RechnerUebersicht.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-UEBERSICHT · Rechtsprechungs-Übersicht: P0-Rest + Korpus-Breite** — SG-Regeste-Rest und die Übersichts-/Facetten-Breite; Kantons-Ausweitung setzt den Resolver voraus (darum `dep`). §13.
      <!-- @meta id: W2·6-UEBERSICHT · status: ready · of: ja · blocker: null · dep: [W2·6-RESOLVER] · kollision: [src/pages/Rechtsprechung.tsx, src/components/rechtsprechung, public/rechtsprechung/register.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [~] **Richter-/Spruchkörper-Filter — Fundament** *(`R-RICHTER`, Direktauftrag David 20.7.2026)*:
      **Block A (Daten) ✅ 20.7.2026** (Extraktion + Kanon + `richter.json` + Tor `check:besetzung`).
      **Block B (Facetten-UI) wird von `W2·6-FILTER` getragen** und hier nicht zweitgeführt
      (Entdopplung 3.8.2026 — er stand als offener Posten an beiden Stellen). Detail:
      `fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md` §12/§13.
    *— Datenausbau-Unterschritte (Quellen → DB → Korpus = Fundament der Verzahnung):*
    - [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
      Andockpunkt **eine Schicht UNTER dem heutigen Generator**: die bestehenden Adapter befüllen ein
      libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion (Tor `check:paritaet`).
      **E0–E4 gebaut**; offen ist (i) VPS-gebunden E3-Serving + E4-UI-Panels (David-Gate
      `vps-bestellung-david`), (ii) frei baubar die Datenhaltungs-Optimierung, nachgelagert E5 (26×)/E6a/E6b.
      **Heiss/Kalt-Grenze bleibt DAVID-GATE** — was die Suche behaupten darf, wenn der Long-Tail kalt
      liegt, ist eine §8-Frage, nicht technisch entscheidbar; bis dahin nicht implementieren.
      **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §14.
- [ ] **6-FILTER · Entscheid-Filter über die API — Richter + allgemeine Facetten** *(§14-Intake 20.7.2026, David — Queue-Plätze 2 und 3; **ULTRACODE freigegeben** für Teil b)*
  <!-- @meta id: W2·6-FILTER · status: ready · of: ja · blocker: null · dep: [] · kollision: [api/suche.ts, scripts/datenhaltung, src/components/suche, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  **Gebündelt, weil beide Teile dieselbe Bau-Fläche tragen** (Turso-Schema + `api/suche.ts` + Facetten-UI):
  Richter-Facette (aus `R-RICHTER` Block B) und die allgemeinen Entscheid-Facetten über die API.
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §7.
- [ ] **6-RNAME · Richternamen gegen den Staatskalender auflösen** *(§14-Intake 20.7.2026, David · **Extraktion/Personendaten — Risikopfad**, `QS-GP`)*
  <!-- @meta id: W2·6-RNAME · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  Abgekürzte Vornamen auflösen: **«P. Kaderli» → «Kaderli Peter»**, Abgleich gegen den amtlichen
  Staatskalender. **Extraktion/Personendaten = Risikopfad** ⇒ `QS-GP` Pflicht, nie raten: ohne
  eindeutigen amtlichen Treffer bleibt die Abkürzung stehen (§8).
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §8.
- [ ] **6-ZNETZ · Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** *(Ideen-Intake 20.7.2026 · Daten-Derivation, `QS-GP`)*:
  <!-- @meta id: W2·6-ZNETZ · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/verzahnung, src/lib/verzahnung, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  «Welche Entscheide zitieren diesen?» (Rückwärts-Kanten) + **Leitentscheid-Score**, deterministisch
  aus dem Zitat-Graph abgeleitet (§2 — kein Ranking-Modell, kein Bedeutungs-Urteil); Daten-Derivation
  ⇒ `QS-GP`. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §10.
  **Merkposten (LM-042, UI-Befunde B20, Prod-Nachmessung 3.8.2026):** Sammelzitate («ff.») werden
  nicht kenntlich gemacht — `zitat-extraktion.ts` GLIED_KOPF fängt Sub-Marker/ff. bewusst nicht
  (fliesst nie in den Norm-Key), das Artefakt trägt kein `ff.`-Flag. Fix liegt in der
  Zitat-Extraktion, nicht in der Darstellung (§0.3 Risiko-Klasse) — bei diesem Schritt als Auflage
  mitführen, kein eigener Posten.
- **Merkposten aus `W2·6-NKEY` (28.7.2026, gilt für jeden Schritt, der `register.json` belädt):**
  `register.json` trägt `normKeys` je Entscheid und steht damit bei **97 % des 780-KB-gzip-Deckels**
  (756.9 KB) — die Verschlankung (eigene Projektion, wie `richter.json` sie für die Spruchkörper-Slugs
  vormacht) ist **nicht** durch Anheben der Schranke zu lösen (§8). Wer `register.json` weiter belädt,
  reisst `check:perf-budget`.
- [ ] **7-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — **V1a ✅ 3.7. · V1c ✅ 4.7. · V1b ✅ 4.7.2026 GEBAUT** (Fundament/Vereinheitlichung · Normrevisions-Ehrlichkeit · E4-Rangliste; Gegenprüfungen bestanden; Wortlaut → `ROADMAP-CHRONIK.md` → W2·7-VZUI, 24.7.2026) · **offen: V2 (E3-Serving) · V3 (E6a)**:
  <!-- @meta id: W2·7-VZUI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik für die Verzahnung (KantenChip · StatusBadge nur-Abweichung · KontextPanel),
  reine UI auf vorhandenen Daten (§3). **Offen: V2 (E3-Serving) · V3 (E6a)** — beide an den Datenstrang
  gekoppelt. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §11.
  - [ ] **VZUI-SACHGEBIET · Sachgebiet-Facette an der Norm↔Entscheid-Kante** *(David-Entscheid 2.8.2026 — UI-Befund LM-041 als Variante (b) «nur Sachgebiet» geöffnet)* — EINE neue Facette `sachgebiet`, **deterministisch aus der amtlichen BGE-Bandnummer I–V** (§2, keine Heuristik); Darstellung als **Filter** im «Rechtsprechung ▾», nicht als zweiter Chip-Zusatz (Dichteregel §1.2 bleibt). Die Zitier-**Rolle** bleibt ausdrücklich zu (nicht deterministisch ableitbar). Extraktion = Risiko-Pfad ⇒ Gegenprüfungspflicht. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §12 (+ Modell-Nachtrag in §9/B1).
    <!-- @meta id: W2·7-VZUI-SACHGEBIET · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/verzahnung/facetten.ts, src/lib/rechtsprechung/bezuege.ts, scripts/normtext/bezuege-bauen.ts, src/pages/gesetz-leser/bezugAuswahl.ts, src/components/verzahnung/BezugFacettenWahl.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
- [ ] **7-BEZUG-LADEN · §15-Versprechen «Grundzustand ohne Zusatz-Fetch» wiederherstellen ODER Doku ehrlich machen** *(Entscheid-Schritt, Befund 2.8.2026)* — `bezugAuswahl.ts:18–23` verspricht «kein zusätzlicher Fetch» im Grundzustand, das JSDoc `bezuegeLaden.ts:86` beschreibt ein Feld `erweitert`, **das es nicht gibt**; tatsächlich lädt der Default beide Shards und rendert immer `BezuegeZeile`, `istErweitert()` steuert nur die Menü-Optik. Zwei Wege: **(1)** Code auf das Versprechen zurückbauen (Verhaltensänderung ⇒ §15-Logikverlust-Bewertung, Skill `perf`, golden-gegated) ODER **(2)** Doku/Kommentare nachführen. Status quo — Zusage ohne Deckung — ist keine Option (§5/§8). **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §13 (Referenz B4/B7).
  <!-- @meta id: W2·7-BEZUG-LADEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/bezugAuswahl.ts, src/pages/gesetz-leser/bezuegeLaden.ts, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
- [ ] **6b-MAT-FINMA · FINMA-Materialien prioritär + Verzahnung** *(§14-Intake 24.7.2026;
  <!-- @meta id: W2·6b-MAT-FINMA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  **Fokus-Dekret-Priorität**, Kontext Bewerbung David bei der FINMA mit Verweis auf LexMetrik)* —
  FINMA-Rundschreiben/Wegleitungen als nächste Quelle der bestehenden Materialien-Pipeline (E6a
  Stufe 1: Verweis-/Register-Ebene, §7 a–d, kein Volltext-Nachbau).
  **Detail:** [FAHRPLAN-MATERIALIEN-VERZAHNUNG.md](fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) §10.
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** *(Ideen-Intake 20.7.2026, `[OF]`, klein → inline §14.1)* —
    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3`) + Fussnoten-Ausgabe; Formvorschriften
    bestimmen die angebotenen Exportformate (§8). **Detail:** [FAHRPLAN-VORLAGEN-AUSBAU.md](fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md) §1.
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. **Verengt 31.7.2026 auf zwei Restpunkte.**
  <!-- @meta id: W2·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  **Restbestand:** (a) **A3** — Anw. 18 «Kacheln einer Reihe gleich hoch» vs. gebautes `items-start`
  (`src/components/forms/GebvKostenForm.tsx:97`), zur David-Abnahme geflaggt; (b) **E-Optional** —
  globaler Schalter «aufgehobene Normen ausblenden» nie gebaut. **Das Abhaken bleibt David-Entscheid**
  (Status-Hoheit), darum steht `status` unverändert auf `ready`.
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20 (massgebliche
  Fassung samt Herkunftsbeleg; die Archivdatei `archiv/FAHRPLAN-UX-PUNKTELISTE.md` trägt die überholte
  20-Punkte-Liste). Herkunft der Verengung und die Abgrenzung zur Bedienungsanleitung (Träger sind
  `W2·16-INVENTAR`/`W2·16-ANLEITUNG`, nicht dieser Schritt) → `ROADMAP-CHRONIK.md` → W2·9 (3.8.2026).
- [ ] **13 · Kantonale Gesetze & Darstellung** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit
  <!-- @meta id: W2·13-KANTONE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, src/pages/gesetz-leser/inhalt.tsx, src/pages/GesetzLeser.tsx, src/components/NormText.tsx, src/lib/suche/onlineVolltext.ts, src/lib/normtext/relevanz.ts, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  44 Befunde + 3 Kritik-Linsen (10 live an Amtsquellen re-verifiziert) — **14 sofort baubare Einheiten
  K-1…K-14**; Extraktions-Anteile sind Risikopfad ⇒ `QS-GP` + golden byte-gleich.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5, M)* — Lesereihenfolge, Doppel-Decode, «SR»-Label, Titel-Dopplung, Fussnoten-Stern-Strip, A14-Relevanz fr/it; reine Display-Schicht. §1-A.
    <!-- @meta id: W2·13-KANTONE-K1 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/inhalt-volltext.tsx, src/pages/GesetzLeser.tsx, src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx, src/lib/normtext/relevanz.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest, S–M)* — zweistufiger Currency-Chip, Kanton-Hinweis im KontextPanel, Abdeckungs-Kontextzeile, «Stand unbekannt», Systematik-Hinweis; reine Anzeige. §1-A.
    <!-- @meta id: W2·13-KANTONE-K2 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K1] · kollision: [src/components/kontext/KontextPanel.tsx, src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36, S)* — Edge-DTO um `ebene`/`kanton`, Treffer-Href auf `/gesetze/<ebene>/…`, Kanton-Marke, Reader-Redirect. §1-A.
    <!-- @meta id: W2·13-KANTONE-K3 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K2] · kollision: [src/lib/suche/onlineVolltext.ts, api/suche.ts, src/components/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion, S — **Risikopfad**, `QS-GP`)* — ZG-161.7 nachziehen, SZ-Stand klären, Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`, Vollständigkeits-Invariante gegen den strukturell blinden Drift-Check. §1-A.
    <!-- @meta id: W2·13-KANTONE-K4 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K3] · kollision: [scripts/normtext/check-drift.ts, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42, M)* — **EINE Einheit (gleiche Datei)**, golden-neutral; harte Binnenfolge **F41 vor F40** (sonst fehlt der Ersatz), F42 nachrangig. §1-A.
    <!-- @meta id: W2·13-KANTONE-K5 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K4] · kollision: [src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22, M — **Risikopfad**, `QS-GP`)* — **pro Kanton eine Tranche**; Binnenfolge K-6a (Dedupe) vor K-6d (GL-Key-Migration). §1-A.
    <!-- @meta id: W2·13-KANTONE-K6 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K5] · kollision: [public/normtext/kanton, scripts/normtext/lexfind-discovery.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** *(F20-GATE/F17a/F18/F16/F19/F23/F13, M — **Risikopfad**, `QS-GP` + pdfplumber-Gegenprobe)* — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. §1-A.
    <!-- @meta id: W2·13-KANTONE-K7 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K6] · kollision: [scripts/normtext, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21, M)* — `parseSegment` im LexWork-Adapter, Schema nur additiv, Golden-Diff korpusweit offline. §1-A.
    <!-- @meta id: W2·13-KANTONE-K8 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K7] · kollision: [scripts/normtext/adapter-lexwork.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38, M)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s zu `KANTON_ERLASS_WERKZEUGE` + Konsistenz-Tor; reine Metadaten. §1-A.
    <!-- @meta id: W2·13-KANTONE-K9 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K8] · kollision: [src/lib/startseiteConfig.ts, public/normtext/register.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR, M)* — 263 der 314 fehlenden Struktur-Sidecars sind AR; nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**; 1 Kanton = slot-frei. §1-A.
    <!-- @meta id: W2·13-KANTONE-K10 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K9] · kollision: [public/normtext/struktur, scripts/normtext/struktur-extrahiere.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-11 · Kanton-Reader-Performance profilieren** *(F32, M)* — **erst messen**: `check:perf-budget` um den Kanton-Leserpfad erweitern, nichts «fixen» vor dem Profil (Ursache unbewiesen). §1-A.
    <!-- @meta id: W2·13-KANTONE-K11 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K10] · kollision: [src/pages/gesetz-leser] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-12 · Reports & kuratierte Listen** *(F3-Report/F4-Liste/F33-Daten, S–M)* — lesend/planend; K-12b ist reine Planung ohne Fetch, K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. §1-A.
    <!-- @meta id: W2·13-KANTONE-K12 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K11] · kollision: [scripts/normtext/inventar-kanton.ts, scripts/normtext/lexfind-discovery.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43, M)* — ZH/GE/VD/TI/SZ/NE/JU fehlen (19 von 26 vorhanden); Quell-Erhebung je Kanton empirisch und browserlos, kantons-einzeln frei. §1-A.
    <!-- @meta id: W2·13-KANTONE-K13 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K12] · kollision: [scripts/normtext/kanton-systematik-run.ts, public/normtext/kanton-systematik.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39, L — **Risikopfad**, `QS-GP`)* — POC über 5 Gerichts-Kantone × 6 Entscheide, nur exakte Sammlungsnummer-Matches, additiver Extraktions-Pass. **Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau gegen `W2·6-NKEY` nachmessen.** §1-A.
    <!-- @meta id: W2·13-KANTONE-K14 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K13] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **KANTONE-DRIFT · Kantonale Snapshots gegen die Quellen nachführen** *(Befund 2.8.2026, **Risikopfad**, Skill `korpus-werkstatt` + `QS-GP`)* — beim Bundes-Durchgang vom 2.8.2026 (`--nur=bund`) meldete der Drift-Abgleich **~28 kantonale Snapshots mit echter Inhaltsdrift** (u. a. BE 154.21 neue Fassung 1.8.2026, AG 291.150 neu aufgehobene Artikel) — bewusst ausgeklammert und **unverifiziert**: Zahl und Liste werden im Schritt neu erhoben (`check:normtext-netz`), nicht übernommen (§5/§7). Kanton-weise portioniert, je Erlass Quelle+Stand+Live-Link, `verified` nie automatisch. **Reihenfolge gegen `K-7` (3.8.2026 festgehalten):** für **PDF-Kantone** erst das Dehyphenations-Gate aus K-7, sonst zementiert der Nachzug genau die Extraktionsfehler, die K-7 beheben soll — K-7 sperrt jeden FR/VS/AR-PDF-Nachzug ausdrücklich. Nicht-PDF-Kantone sind davon frei. **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §3.
    <!-- @meta id: W2·13-KANTONE-DRIFT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
- [ ] **14-SIGNAL · Watchlist & Änderungs-Signale** *(Ideen-Intake 20.7.2026 · Infra/UI, kein Rechtsinhalt)*:
  <!-- @meta id: W2·14-SIGNAL · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json, public/rechtsprechung/register.json, src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut ausschliesslich auf vorhandenen
  Signalen** (Currency/Register/Wiedervorlage); Speicherung lokal, Werkzeuge bleiben zustandslos.
  **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16.
  - [ ] **14-SIGNAL-B1 · Statischer Änderungs-Feed (🟢)** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister; **nur der VORWÄRTS-Fall** (`naechsteFassungAb`).
    <!-- @meta id: W2·14-SIGNAL-B1 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-B2 · Client-Watchlist (🟢)** — localStorage-Liste gemerkter Normen, beim Besuch gegen die Build-Artefakte geprüft. **Rückblick-Flag gegen `fassungsToken`/`sha`, nie `geprueftAm`.**
    <!-- @meta id: W2·14-SIGNAL-B2 · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B1] · kollision: [src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-GER · Gerichts-Delta mit ehrlicher Latenz (🟡)** — Build-Zeit-Delta über `register.json` je Gericht/Norm; **eigenes Verdikt**, Import-Kadenz sichtbar ausgeliefert (§8).
    <!-- @meta id: W2·14-SIGNAL-GER · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B2] · kollision: [public/rechtsprechung/register.json, scripts/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **15-CLS · Echter CLS-Defekt auf `/gesetze` (0.109 @8× CPU)** *(§14-Intake 20.7.2026 · **Produktfehler**, reine UI)*
  <!-- @meta id: W2·15-CLS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/Gesetze.tsx, src/components/start] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  **Bewusst ein eigener Schritt und NICHT unter `QS-PERF` mitgeführt** — ein gemessener Produktfehler
  auf `/gesetze` (CLS 0.109 @8× CPU), reine UI, keine Logik-Berührung.
  **Befund-Erweiterung 3.8.2026 (L-3-Nullprobe, §0.3):** Auch die **Erlass-Leser-Seiten** tragen
  einen vorbestehenden CLS von **0.05–0.22** (3 Läufe, unverändertes A28-main; VMWG am höchsten,
  STG schwankt ±0.12 zwischen Läufen) — unabhängig von den Linien. Wurzel-Fix hier miterledigen
  oder als Messartefakt belegen (§17: nicht umschiffen).
  **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §2.
- [ ] **16-INVENTAR · Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(§14-Intake 20.7.2026, David: «erst wenn es Sinn ergibt» → Zweischritt, dies ist Schritt 1)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, bibliothek/INDEX.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Vollständige, **ehrliche** Aufnahme dessen, was Lexmetrik heute kann — Quelle bleibt
  `startseiteConfig.ts` (§5), Status-Modell entwurf/geprüft/geplant ungeschönt (§8).
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §9.
- [ ] **16-ANLEITUNG · Bedienungsanleitung / Onboarding** *(§14-Intake 20.7.2026, David — Schritt 2, **bewusst spät**)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · of: ja · blocker: null · dep: [W2·16-INVENTAR] · kollision: [src/pages, src/components/layout] · seq-hart: [QS-UI(8a), W2·5h-GESETZ-UI(8b)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — die Anleitung folgt dem Inventar, nicht
  umgekehrt (`dep: [W2·16-INVENTAR]`); bewusst spät, damit sie nichts beschreibt, was sich noch bewegt.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §10.
- [ ] **17 · UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)** *(Auftrag David 31.7.2026, Lieferung einer externen Sichtprüfung vom 29.7.)*
  <!-- @meta id: W2·17-UI-BEFUNDE · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/**] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  Externe Sichtprüfung, geschnitten nach Bauteil K-01…K-20; Triage 31.7.2026: **45 NEIN · 144 VERDACHT ·
  15 BEREITS-GEBAUT · 6 SICHER**, davon **20 Batches** (19 Bau-Batches mit 189 Befunden + 1 Prüf-Batch, 15).
  **Detail:** [FAHRPLAN-UI-BEFUNDE.md](fahrplaene/FAHRPLAN-UI-BEFUNDE.md) §1.
  **Reihenfolge-Freigabe (`@queue`) bleibt Davids Entscheid** — darum bewusst NICHT in der Queue.
  **Freigabe David 3.8.2026:** Kette B3→B19 läuft wie geplant seriell; stehende Erlaubnis, ein
  blockiertes Glied zu überspringen und zu melden (Übersprungenes bleibt offen, Kette läuft weiter).
  - [ ] **B3 · Klebende Leisten (K-01)** — 7 Befunde (Blocker 2 · Hoch 4). §4.
    <!-- @meta id: W2·17-UI-BEFUNDE-B3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B4 · Leseansicht Gesetz (K-14)** — 12 Befunde (Blocker 2 · Hoch 4). **Grenze:** hier werden nur die 12 extern erhobenen Einzelbefunde abgearbeitet — der flächige UX-Pass derselben Seite ist `W2·5h-GESETZ-UI`, die Darstellungs-Vorschriften sind `W2·5d`. Kollisions-Precheck gegen beide vor dem Bau. §5.
    <!-- @meta id: W2·17-UI-BEFUNDE-B4 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B3] · kollision: [src/pages/gesetz-leser, src/components/NormText.tsx, src/components/normtext] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B5 · Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)** — 8 Befunde (Blocker 2 · Hoch 2). §6.
    <!-- @meta id: W2·17-UI-BEFUNDE-B5 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B4] · kollision: [src/index.css, src/components/layout/Pane.tsx, src/components/layout/TabPanel.tsx, src/components/layout/ThemaUmschalter.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B6 · Fehler-, Leer- und Ladezustände (K-15)** — 14 Befunde (Blocker 1 · Hoch 9). §7.
    <!-- @meta id: W2·17-UI-BEFUNDE-B6 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B5] · kollision: [src/components/fehlermeldung.ts, src/components/ErrorBoundary.tsx, src/components/suche/SucheLeerzustand.tsx, src/pages/NotFound.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B7 · Overlays und Menüfenster (K-02)** — 8 Befunde (Blocker 1 · Hoch 3). §8.
    <!-- @meta id: W2·17-UI-BEFUNDE-B7 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B6] · kollision: [src/components/layout/HeaderSuche.tsx, src/components/layout/ReiterUebersicht.tsx, src/components/layout/VerlaufUebersicht.tsx, src/components/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B8 · Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)** — 10 Befunde (Blocker 1 · Hoch 3). §9.
    <!-- @meta id: W2·17-UI-BEFUNDE-B8 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B7] · kollision: [src/components/layout, src/components/forms, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B9 · Textsatz und Umbruch (K-12)** — 12 Befunde (Blocker 1 · Hoch 2). §10.
    <!-- @meta id: W2·17-UI-BEFUNDE-B9 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B8] · kollision: [src/components/typografie.tsx, src/index.css, src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B10 · Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)** — 7 Befunde (Blocker 1 · Hoch 1). §11.
    <!-- @meta id: W2·17-UI-BEFUNDE-B10 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B9] · kollision: [src/components/ui, src/pages/gesetz-leser, src/components/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B11 · Karten (K-04)** — 13 Befunde (Blocker 0 · Hoch 4). §12.
    <!-- @meta id: W2·17-UI-BEFUNDE-B11 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B10] · kollision: [src/components/Katalog.tsx, src/components/start, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B12 · Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)** — 11 Befunde (Blocker 0 · Hoch 4). §13.
    <!-- @meta id: W2·17-UI-BEFUNDE-B12 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B11] · kollision: [src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B13 · Zahlen-, Datums- und Zählformate (K-11)** — 12 Befunde (Blocker 0 · Hoch 3). §14.
    <!-- @meta id: W2·17-UI-BEFUNDE-B13 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B12] · kollision: [src/components/locale.tsx, src/components/ErgebnisAnzeige.tsx, src/components/forms] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B14 · Brotkrume, Kopfzeilen und Seitenmeta (K-19a)** — 8 Befunde (Blocker 0 · Hoch 3). §15.
    <!-- @meta id: W2·17-UI-BEFUNDE-B14 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B13] · kollision: [src/components/layout/InhaltsKopf.tsx, src/components/RouteMeta.tsx, src/pages/Materialien.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B15 · Umschalter, Tabs und Akkordeons (K-06)** — 9 Befunde (Blocker 0 · Hoch 2). §16.
    <!-- @meta id: W2·17-UI-BEFUNDE-B15 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B14] · kollision: [src/components/ui, src/components/layout/TabPanel.tsx, src/components/forms] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B16 · Seitengerüst und Inhaltsbreite (K-13)** — 8 Befunde (Blocker 0 · Hoch 2). §17.
    <!-- @meta id: W2·17-UI-BEFUNDE-B16 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B15] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Footer.tsx, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B17 · Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)** — 8 Befunde (Blocker 0 · Hoch 1). §18.
    <!-- @meta id: W2·17-UI-BEFUNDE-B17 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B16] · kollision: [src/components/ui, src/index.css, src/components/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B18 · Listen, Suche und Relevanz (K-19b)** — 8 Befunde (Blocker 0 · Hoch 1). §19.
    <!-- @meta id: W2·17-UI-BEFUNDE-B18 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B17] · kollision: [src/pages/Gesetze.tsx, src/components/suche, src/lib/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B19 · Eingabe- und Auswahlfelder — Detail (K-08b)** — 7 Befunde (Blocker 0 · Hoch 0). §20.
    <!-- @meta id: W2·17-UI-BEFUNDE-B19 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B18] · kollision: [src/components/forms, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **10 · Neue Rechner-Klingen** *(`[OF]`, §2/§7)*: **Zustellfiktions-Engine** (deterministisch,
  <!-- @meta id: W3·10 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md -->
  fristrelevant) · **Gesellschaftsrechtliche Schwellen-Module** (OR 727/671/653s, harte Zahlen) ·
  **Schutzrechts-Gebühren IGE** · **Normfassungs-/Geltungsstand-Prüfer** (intertemporal) ·
  **Kantonale Gerichtsferien-Datenschicht** (eigene/zusätzliche Gerichtsferien im kant.
  Verfahrensrecht VRPG/Justizgesetz, optionale Schicht über der bestehenden `stillstandsperioden`-
  Strategie, je Kanton eigene Deklaration — **26×-Datenasset, Leitprinzip 4/Slot beachten**;
  Bau-Auflagen Zustellfiktion SchKG strikt trennen, BGE 138 III 225 nur offengelegte Annahme:
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3).
  **`fahrplan: archiv/…` ist eine deklarierte Ausnahme** (31.7.2026): für W3·10 gibt es keinen
  aktiven Nachfolger, die Archivdatei trägt Stand 14.6.2026 und ist teilweise stale. **Erster
  Arbeitsschritt** ist darum die Restpunkte-Extraktion aus §P3 in einen aktiven Fahrplan.
  Begründung wörtlich → `ROADMAP-CHRONIK.md` → W3·10 (3.8.2026).
- [ ] **11 · Gesetzgebungs-/Rechtsetzungs-Tracking** *(neu, amtlich)*. Übersicht «was kommt»:
  <!-- @meta id: W3·11 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Vernehmlassungen (admin.ch), Parlamentsgeschäfte (parlament.ch), in AS/BBl publiziert aber noch
  nicht in Kraft (Fedlex), künftige Fassungen — Drift gegen die geltende Fassung. Andockpunkt
  `fedlex.ts`/Drift-System.
  **Teil-ERLEDIGT 10.7.2026 (Fedlex-Portfolio Paket 3: Vernehmlassungen, 822 Verfahren).** Wortlaut → `ROADMAP-CHRONIK.md` → W3·11 (26.7.2026); Detail `fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3` + `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.
  **Rest offen:** Parlamentsgeschäfte (parlament.ch), künftige-Fassungen-Drift, Übersichtsseite «alle
  laufenden Vernehmlassungen», Laufend-Badge im Reader-Kopf (gesetz-leser war TABU).
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja · fahrplan: fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md · slot: inhaber -->
  **SLOT-ÜBERGABE 20.7.2026: dieser Schritt hält jetzt den 26×-Slot** (`slot: inhaber`); Reihenfolge
  E3 → W3·12 entschieden (David 2.7.). Kanton-Gesetze-Bündel = 3-Tier-Import + BS-Vorbildkanton +
  Rechtssammlung P6 + POPUP-Kanton-Rest; nie zwei 26×-Assets parallel (Leitprinzip 4).
  **Detail:** [FAHRPLAN-GESETZE-IMPORT-3TIER.md](fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md) §6.
- [ ] **13 · Vorlagen-Breite** *(VORLAGEN V5/V6/V8, GMBH G2, VERTRAGS-VARIANTEN P3; Worktree)*.
  <!-- @meta id: W3·13 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  Tiefe vor Stückzahl. GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) ·
  Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft).
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10
  (Vertrags-Varianten) + §11 (GmbH-Gründung) — W3·13 trägt beide Stränge. *(Zeiger 31.7.2026
  umgestellt, Endprüfungs-Fund R2-14/R2-19: `fahrplan:` zeigte auf `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md`
  und lieferte damit die archivierte Vollfassung statt der massgeblichen Restpunkte — dieselbe
  Lage und dieselbe Begründung wie bei `W2·9`; §0 der Archiv-Restpunkte erklärt die archivierten
  Köpfe ausdrücklich für teilweise stale.)*
- [ ] **14 · Multi-Pane / Split-View** *(SPLIT-VIEW, Fundament-Umbau, eigener Worktree; Auftrag
  <!-- @meta id: W3·14 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Topbar.tsx, src/App.tsx, tailwind.config.js] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  David 29.6.2026)*. 2–3 „Engines" nebeneinander **wie im Browser** → der **Verzahnungs-Burggraben
  sichtbar** (Gesetz | Rechner | Begründungs-Absatz). **Erst Strang A** (Inhaltsbreite-Umschalter),
  dann der Fundament-Umbau; eigener Worktree (§12).
  **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
  - [ ] **14-B3 · Scroll & Fokus pro Pane — Restposten** — pro-Pane-Scroll und Spy laufen; **offen**: Scroll-POSITIONS-Wiederherstellung (`App.tsx` noch window-basiert) + Tastatur-Pane-Wechsel. §STRANG B (B-3).
    <!-- @meta id: W3·14-B3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/App.tsx, src/components/layout/usePaneLayout.ts, src/components/layout/Pane.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  - [ ] **+ Auftrags-Eingang 30.6.: Bündel S** — **S1** Breadcrumbs in der Pane laufen über globalen
    <!-- @meta id: W3·14-S · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    Router-`<Link>` (`InhaltsKopf.tsx` Z.30) statt PaneKontext-Navigator → fixen · **S2** Tracker «alles
    schliessen» muss auch `usePaneLayout` (Pane-Store) leeren. S1+S2 bündeln. Wortlaut: [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
  - [ ] **Split-View a11y-Restpunkte** *(SPLIT-VIEW, `[OF]`, NIEDRIG — aus §9-Bug-Check 29.6.2026)* —
    <!-- @meta id: W3·14-a11y · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    3 verifizierte, bewusst **nach** dem Prod-Deploy zurückgestellte a11y-Kanten der Pane-Schicht.
    **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
- [ ] **15-RICHTER · Spruchkörper-Analytik** *(Ideen-Intake 20.7.2026 · **bewusst freigabe-pflichtig**)* —
  <!-- @meta id: W3·15-RICHTER · status: blocked · of: ja · blocker: richter-analytik-gate · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Ziel = **ausschliesslich deskriptive** Spruchkörper-Muster auf Entscheid-Metadaten (Sachgebiete/
  Formalien je Kammer und Zeitraum). **Verfahrensausgänge sind bewusst NICHT Gegenstand** — keine
  Erfolgsquoten, keine Prognose über Personen (§2/§8). **Bleibt freigabe-pflichtig**
  (Blocker `richter-analytik-gate`); Fundament liegt in `W2·6-FILTER`/`R-RICHTER`.
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §14.

---


## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3, PRODUKTAUSBAU Säule A)* — Mandats-/Dossier­
  verwaltung & «Meine Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless. Umfasst auch
  das nie gebaute schlanke URL-Kontext-Rückgrat (PRODUKTAUSBAU P2, A-E0–E3 `fallakte`/`c_`-Transport)
  samt Bau-Auflagen (keine Kanonisierung mehrdeutiger Beträge, `koPrefill` nicht anfassen) — Detail
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
- **Betriebs-Instrumente (später):** Sentry (erst bei Traffic; A5-Fehler-Link deckt jetzt) · CodeQL ·
  Claude-Code-PR-Action (bewusster Entscheid) — Detail + Verworfen-Liste:
  `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`. *(`npm audit` 3.8.2026 aus dieser Liste genommen: die
  Meldungs-Variante ist als `QS-BASIS-DEPS` in Arbeit; geparkt bleibt nur die Stopper-Variante.)*
- **Abnahme-Warteschlange** (Haftungsrang: 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge; aufgereiht,
  nicht gedrängt): BGER-RECHTSWEG (§7) · BEURKUNDUNGS-AUSBAU · NOTARIAT/LUECKEN (`geprüft`) ·
  GESETZESTEXT-POPUP-Snapshots · GRUNDLAGEN G2/B.
- **Offene David-Grundsatzfragen** (gebündelt mitführen): Dienstjahr-Stichtag Kündigungsfrist ·
  Sperrtage-Konvention · 3 Export-Antworten · GebV-SchKG-Promille-Rundung (0.01 vs. amtlich 0.05).

---

## Pflege & Termine  *(Quelle: `bibliothek/register/parameter-verfall.md`)*

- **30.6.2026** — SG-GKV (erledigt, s. Chronik → S0). · **Anfang Sept.** — Referenzzins (quartalsweise).
  · **1.11.2026** — BE-Formularpflicht. · **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 vs.
  Staffel 1.1.2022. · **Vor Mietvertrags-Abnahme** — VMWG Art. 19a am Original. · **Feiertage** je
  Kanton vor «geprüft» (BJ-Liste Stand 2011).
- **1.1.2027 — Ganz-Aufhebung `PatV` (SR 232.141) und `VGV` (SR 814.621).** Beide sind in
  `scripts/fedlex-cache.sh` gepinnt und werden per 1.1.2027 **vollständig aufgehoben** (amtlich
  angekündigt, maschinell aus dem Fedlex-SPARQL-Graphen geerntet; Register-Lauf 3.8.2026 —
  `bibliothek/register/parameter-verfall.md` §«Aufgehobene und zur Aufhebung angekündigte Erlasse»).
  Massnahme am Stichtag: Snapshot ersetzen/entfernen, Nachfolgeerlass prüfen (§7/§8) — ein
  ausgeliefertes Gesetz, das es nicht mehr gibt, ist der schwerere Fehler als eine Lücke.
  **Bereits erfolgt:** `BMV` (SR 412.103.1) aufgehoben 1.3.2026 — Aufhebung nachgeführt in #287,
  Register-SSoT-Filter in #422; **Nachfolger `cc/2025/408` (gleiche SR, in Kraft 1.3.2026) fehlt
  noch im Korpus** → Schritt `QS-KORPUS-BMV`.

---

## Funktions-Katalog (Aufbau + Auflagen je Werkzeug)

Quellen durchgehend amtlich (Fedlex / amtliche Sammlungen / amtliche Entscheide+Regesten / amtliche
Tarife+Verzeichnisse — Art. 5 URG). Alle Werkzeuge **stateless**. «grenzwertig» = amtlich nutzbar mit
harter Auflage.

**Katalog-Tabelle (18 Werkzeuge: Welle · neu/vorhanden · §2 · Quelle · Aufwand) und die Kern-Auflagen
je Werkzeug** stehen wörtlich in [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §1
(Tabelle dorthin verschoben 3.8.2026, damit Katalog und Auflagen an EINEM Ort stehen, §5). Sie sind
Bau-Auflagen, keine Steuerung — vor dem Bau des jeweiligen Werkzeugs lesen.

---

## Strang-Detailpunkte & Hygiene  *(steuern nicht — Heimat = jeweilige `fahrplaene/FAHRPLAN-*.md`/`STRUKTUR.md`)*

- **Offene Detailpunkte · Infrastruktur-Fundament · Archiv-Kandidaten · Stale Doku-Köpfe · Klein-Backlog**
  — wörtlich ausgelagert nach [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §2 (Stand 31.7.2026).
- **Restpunkte der Archiv-Welle 31.7.2026** (20 `FAHRPLAN-*.md` verify-then-archive nach `archiv/`, je
  Datei ein Nur-Lese-Opus-Verdikt, alle NUR-MIT-NACHTRAG) — wörtlich in
  [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md), je Strang ein § (§1–§20),
  dort auch die Herkunft (AP-3/AP-4) und die drei begründet im Root gebliebenen Dateien. Die frühere
  20-zeilige Strang-Liste hier war ein zweites Inhaltsverzeichnis derselben Datei (Chronik 3.8.2026).

---
*Konsolidiert 28.6.2026 aus den 26 `FAHRPLAN-*.md` + Strategie-Dokumenten + dem früheren
`HANDLUNGSPLAN.md` (→ `archiv/`) + ultracode-Funktions-Ideation (alle Juristen, amtliche Quellen).
Detailquellen = die jeweilige `fahrplaene/FAHRPLAN-*.md`; Ist-Zustand/Deploy = `STRUKTUR.md`; G1-Abdeckung =
`KATALOG-ROADMAP.md`. Diese Datei ordnet sie und ist der eine Plan, der Schritt für Schritt
abgearbeitet wird.*
