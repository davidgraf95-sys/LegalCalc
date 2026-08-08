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
david-entscheid-konfig-entlastungen: QS-ENTREG-KONFIG — drei fertig ausgearbeitete Konfig-Entlastungen (Stop-Hook-Frequenz 37,7 s/Antwort, tor-schutz.py-Präzisions-Patch, CLAUDE.md-§16-Kurzform). Hooks + Regelwerk sind für Sessions gesperrt (Agenten-§0 + Berechtigungssystem, Befund 7.8.2026) ⇒ ECHTES David-Gate; Entscheidungsgrundlage in bibliothek/betrieb/entregulierung-2026-08-07.md
david-freigabe-dispatch-p0: QS-DISPATCH-P0-PRUEF baut an der Pflichtklausel-Durchsetzung selbst (Generator + dispatch-schutz.py + check:dispatch-klausel) — Freigabe und anschliessende Abnahme durch David; Grundlage in bibliothek/betrieb/entregulierung-2026-08-07.md
zeitreihe-5-snapshots: QS-AUTOPILOT-STUFE1 ist von David freigegeben (Entscheid 7.8.2026 «stufe 1 ja»), aber an die Mindestdatenlage gebunden: erst bauen, wenn messwerte/selbstopt-zeitreihe.json ≥ 5 Snapshots trägt (retro:17-Schwelle — darunter sind Vorschläge statistisch nicht belegbar). Prüfbar: npm run retro:17 meldet die Datenlage selbst
david-freigabe-hooks-ausbau: QS-HOOKS-AUSBAU baut an Hooks/.claude/rules/CLAUDE.md — dieselbe für Sessions gesperrte Konfig-Fläche wie QS-ENTREG-KONFIG; Freigabe + Anwendung mit David. Grundlage: bibliothek/recherche/state-of-the-art-abgleich-2026-08-07.md
david-entscheid-org-umzug: QS-ORG-UMZUG — Repo-Transfer in eine Gratis-Organisation für die native Merge Queue (User-Konten haben keine); Infrastruktur-Entscheid mit ~1 h Nacharbeit (Vercel, Branch-Schutz, Secrets). Erst prüfen, ob QS-MERGE-AUTOZUG den BEHIND-Schmerz ausreichend dämpft (Entscheid David 7.8.2026: «B als Schritt, A parken»)
-->

<!-- @david-fragen
kalender-transp: Kalender-Export: Termine als «frei» statt «beschäftigt» markieren (TRANSP:TRANSPARENT)? Bricht einen Golden-Anker — nur mit Go. · quelle: Session-Karte 3./4.8.2026 (archiv/STRUKTUR-SESSIONKARTEN.md)
kommerz-lizenz: Kommerzieller Betrieb ja/nein? Entscheidet, ob eine CC-BY-NC-SA-Zweitquelle berührt werden darf. · quelle: ROADMAP.md, QS-EXTQUELLEN
lm174-farbschema: UI-Befund LM-174: Dunkelmodus folgt beim ersten Aufruf nicht dem Betriebssystem — dein Entscheid 19.6.2026 sagt bewusst «Automatisch (Tageszeit)» statt System-Schema. Befund schliessen oder auf systembasiert umentscheiden? · quelle: FAHRPLAN-UI-BEFUNDE.md §6 (B5, 8.8.2026)
-->
<!-- ^ Offene Fragen an David OHNE eigenen blockierten Schritt (sonst gehören sie in @blockers).
     Das Lagebild liest diesen Block mechanisch (davidFragen, scripts/plan/bildDaten.ts) —
     beantwortete Fragen HIER löschen, dann verschwinden sie von der Seite (§5; Umzug aus dem
     Generator-Code 8.8.2026, dort waren sie eine hartkodierte zweite Wahrheit). -->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W3·12 (Kanton-Gesetze, übergeben 20.7.2026 — E3 war seit 3.7.2026 fertig, der Slot nur nie zurückgegeben)
kette: ~~E3(W2·6-DATA) ✅ 3.7.2026~~ · W3·12(Kanton-Gesetze) ← JETZT · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung, W2·6-DATA) · Gerichtsferien-Matrix
begruendung-uebergabe: E3 ist gebaut (195 342 Entscheide, 2 Voll-Läufe determinismus-gleich, Gegenprüfung bestanden) ⇒ Leitprinzip 4 «eine Säule fertig führen» erfüllt. Der offene E3-**Serving**-Rest ist KEIN Massenimport, sondern hängt am David-Gate `vps-bestellung-david` — er rechtfertigt keine Slot-Bindung. Nächstes Kettenglied ist laut Kette W3·12 (Davids Reihenfolge-Entscheid 2.7.2026, `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §10(1)); W1·4 wäre falsch (26x: nein — der frühere Zusatzgrund «eigener Blocker `wbqdyap3x`» ist mit der Entparkung vom 3.8.2026 entfallen).
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, src/tests, scripts/gegenpruefung] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Dach-Auftrag offen** (die drei Werkzeug-Andockungen sind
  seit 5.7.2026 fertig, Strang A und die Anker-Automatisierung nicht). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §1.
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  <!-- @meta id: QS-GP · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/gegenpruefung, .claude/skills/gegenpruefung, bibliothek/register] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  erweitert die Verifikations-Infrastruktur: adversarialer Zweitdurchgang (unabhängiger Opus-Agent,
  frischer Kontext, Auftrag «Output widerlegen») als Tor statt Session-Disziplin. Bausteine a+b+c
  gebaut+live (PR #67); **offen bleibt Baustein d** (rückwirkende Kampagne) — davon ist nur Stufe 1
  «Rechnen» gelaufen, offen Stufe 2 (extrahierte Normen), Stufe 3 (Rest) + BGE-Korpus-Regenerierung.
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §2.
- **Automatik-Gesundheit: läuft unsere Automatik wirklich?** *(QS-AUTOMATIK, `[OF]`, neu 20.7.2026 — §14-Intake)*.
  <!-- @meta id: QS-AUTOMATIK · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows, scripts/datenhaltung/check-turso-frische.ts, scripts/check-ci-laeufe.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  **Läuft unsere Automatik wirklich, und würde sie scheitern können?** Gebündelt aus zwei Befunden
  vom 20.7. (a zwei tote Workflows `normen-monitor.yml`/`fedlex-frische.yml` · b Turso-Wächter-
  Abdeckung + Alarmpfad + Wachstums-Schwellen). **Offen bleibt** die Turso-Wächter-Abdeckung samt
  Wachstums-Schwellen — darum `ready` und nicht `done`. Leitplanke, Stand 3.8.2026 (PR #419) und
  die Mitnahmen der Code-Inventur:
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §1.
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  <!-- @meta id: SEO-A11Y · status: ready · of: ja · blocker: null · dep: [] · kollision: [public/normtext/register.json, src/lib/seo.ts, scripts/prerender.ts, vercel.json] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**
- [ ] **`QS-CURRENCY-KANON` · `fza`/`cmr` NICHT-KANONISCH klären und kanonisch nachführen** *(Befund 2.8.2026, **Risikopfad**)* — **Bestandsdefekt auf `main`** — Nullprobe 2.8.2026 im unveränderten Haupt-Checkout ebenfalls Exit 1 (§3 Verteilung statt Einzelwert). Erst Ursache klären, dann re-pinnen + regenerieren + §7-Verifikation der Anker. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §17.
  <!-- @meta id: QS-CURRENCY-KANON · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, scripts/fedlex-repin-kanonik.ts, public/normtext/bund] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`, neu 30.6.2026 — Leitprinzip 7 + CLAUDE.md §15. **Neuer Befund 7.8.2026, e2e-Diagnose #461:** die Erlass-Leseseite lädt 9,5 MB `rechtsprechung/register.json` [+1,9 MB Volltext, 1,4 MB Struktur] — auf 2-vCPU-Runnern >30 s bis zum Leser; der lohnendste Hebel, weil er die e2e-Ladebudgets überflüssig machen würde statt sie zu verbreitern; Verdacht: dieselbe Wurzel wie der offene bimodale OR-LCP-/norm-sprung-Befund)*.
  <!-- @meta id: QS-PERF · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/check-perf-budget.ts, src/pages/gesetz-leser, src/lib/rechtsprechung, vite.config.ts] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer, §15). Reihenfolge a–e: a Tor `check:perf-budget` ✅ · b billige Quick-Wins ✅ · **c M-Daten-Pfad**
  (Idle-Defer, Suchindex in Worker/`export()`, `register.json` sharden) · **d Render-/Split-View-Feinschliff**
  · e CLS-Race-Härtung ✅. Offene Befunde und Bau-Auflagen: **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §1.
- **Datenhaltung / VPS-Gate: E3-Serving + E4-UI-Panels** *(QS-DATA, `[OF]`, neu 2.7.2026 — Council-Entscheid)*.
  <!-- @meta id: QS-DATA · status: blocked · of: ja · blocker: vps-bestellung-david · dep: [] · kollision: [scripts/datenhaltung, daten] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  **Abgegrenzt 3.8.2026 — dieser Schritt trägt nur noch das David-Gate**, nicht den Datenhaltungs-Bau:
  er hält sichtbar, dass E3-Serving (rsync + cold-FTS, 195 342 Entscheide) und die E4-UI-Panels an
  **einer VPS-Bestellung** hängen (~15 Min David, Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md`).
  **Fertig, wenn** der VPS steht und Serving + Panels darauf laufen. Alles andere — DB-Artefakt als
  eine Quelle (§5), Etappen E0–E6b, Datenhaltungs-Optimierung — liegt in **`W2·6-DATA`** und wird hier
  nicht zweitgeführt. **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §13.
- **Optimierungs-Research Juli 2026 — Betrieb/Frische/Prüf-Tore/FR-IT** *(QS-OPT, `[OF]`, neu 12.7.2026)*.
  <!-- @meta id: QS-OPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [vercel.json, .github/workflows/normen-monitor.yml, src/lib/normtext/laden.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Kritik-gefilterte Ablage des allgemeinen Ultracode-Optimierungs-Research: Betriebs-/Tor-/Bau-
  Optimierungen ohne Rechtsinhalt (O-Reihe). **Leitplanke:** keine Massnahme kürzt Beweis, Tor oder
  Prüfung; jede Einheit golden byte-gleich (§6). **Detail:** [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.
- **Basis-Ausbau — Fundament-Handlungsplan** *(QS-BASIS, `[OF]`, neu 17.7.2026)*.
  <!-- @meta id: QS-BASIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows, package.json] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  Kritik-gefilterte Ablage des Ultracode-Fundament-Research (B-Reihe): Tor-Parität lokal/CI,
  Doku-/Register-Wahrheit — Fundament, kein Feature. **Eigener Bau-Umfang = Posten (c)** des
  §14-Intakes 20.7.2026: **CI/lokal-Tor-Parität** (16/36 Tore in CI, Rest-Lücke 20) plus die
  offenen B-Einheiten. **Nicht hier gebaut** (3.8.2026 abgegrenzt, war dreifach geführt):
  Posten (a) Turso-Wächter-Abdeckung → **`QS-AUTOMATIK`** · Posten (b) CI-Fehlläufe #30 → mit
  PR #419 erledigt (Chronik) · Posten (d) Datenhaltungs-Optimierung inkl. R6 → **`W2·6-DATA`**.
  Wortlaut aller vier Posten: [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
- [ ] **`QS-UI` — Oberflächen-Qualität app-weit** *(Ideen-Intake 20.7.2026 · reines UI/Design, §13 · kontinuierlich)*
  <!-- @meta id: QS-UI · status: ready · of: ja · blocker: null · dep: [] · kollision: [DESIGN-REGLEMENT.md, src/index.css, tailwind.config.js, scripts/check-farbwelt.ts, e2e/a11y.e2e.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher Oberflächen-Pass**
  app-weit (Fundament → Hierarchie → Politur), der VOR den flächigen Gesetzes-UI-Schritten läuft.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §8.

**§14-Intake 3.8.2026 (Aufräum-Session — Nebenfunde der CI-Diagnose, der Totcode-Welle und der
Gegenprüfungen des Tages).** Alle `[OF]`, alle klein; je Schritt steht der **Anlass** dabei, damit
später prüfbar bleibt, warum es ihn gibt. Sie stehen im Querschnitt-Band, weil sie **keinen
Reihenfolge-Slot** brauchen (klein, jederzeit einschiebbar), nicht weil sie dauerhaft mitlaufen;
ihr **Dach-Schritt** steht im ID-Präfix (`QS-AUTOMATIK-*` → Automatik-Gesundheit · `QS-BASIS-*` →
Basis-Ausbau · `QS-GP-*` → Gegenprüfung · `QS-TOK-*` → Token-Ökonomie · `QS-CURRENCY-*` →
Fedlex-Currency · `QS-CODE-*` → Code-Verbesserung · `QS-KORPUS-*` → Fedlex-Portfolio
(Korpus-Pflege) · `QS-FRIT-*` → Fedlex-Drift · `QS-E2E-*` → Lernphase
(Verifikations-Infrastruktur)). Jeder trägt seine Bau-Spec im `ROADMAP-Spec`-§ des verlinkten
Fahrplans — **deklarierte Ausnahme:** reine Bewertungs-/Recherche-Schritte, deren Substanz
vollständig in einem `bibliothek/`-Dossier liegt und die nichts zu bauen haben, tragen kein
`fahrplan:`-Feld und zeigen stattdessen auf ihr Dossier (aktuell `QS-EXTQUELLEN`).

- [ ] **`QS-FRIT-DRIFT` · FR/IT-Drift-Wächter Stufe 1 (eId-Mengenvergleich DE/FR/IT)** *(Anlass: sämtliche Norm-Verifikationen vom 3.8.2026 liefen **nur auf DE** — eine französische oder italienische Fassung könnte längst abweichen, ohne dass ein Tor es sieht)* — **Ausdrücklich KEIN dreisprachiges Korpus**; das Befüllen der `fr`/`it`-Fassungen ist **`W2·6-MEHRSPRACH`** und bleibt dort. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.
  <!-- @meta id: QS-FRIT-DRIFT · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows/normen-monitor.yml, scripts/fedlex-versionen-pruefen.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-CURRENCY-TESTS` · Testbindung `cacheBefund` + Kanonik-Ausschluss** *(Anlass: Gegenprüfung zu PR #420, Befund 1 — die neue Cache-Inhalts-Sonde und die Kanonik-Ausschlussliste hängen an keinem Test; ein Tor, das nicht scheitern kann, ist gefährlicher als keines, §6.7)* — Reine Prüflogik (`Gegenpruefung: n/a`) — **die Ursachenklärung der `fza`/`cmr`-Wurzeln ist Risikopfad und liegt in `QS-CURRENCY-KANON`**; hier wird kein Pin geändert. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.2.
  <!-- @meta id: QS-CURRENCY-TESTS · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, src/tests] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-KORPUS-BMV` · Geltende BMV (Totalrevision `cc/2025/408`) in den Korpus aufnehmen** *(Anlass: BMV-Nachführung 3.8.2026, PR #422 — die alte BMV ist korrekt als aufgehoben markiert, aber die seit 1.3.2026 GELTENDE Nachfolge-Verordnung gleicher SR 412.103.1 fehlt; Nutzer finden nur den historischen Text plus Fedlex-Link)* — Risikopfad ⇒ Gegenprüfung. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §20.4.
  <!-- @meta id: QS-KORPUS-BMV · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, public/normtext/bund, src/lib/normtext/aufhebungen.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-E2E-SHARD-GEN` · Shard-Zuordnung in die Spec, JSON generieren** *(Anlass: Landekette 4.8.2026 — 5 von 6 Nachzieh-Konflikten sassen in `e2e/shard-gruppen.json`, weil jede neue Spec dieselben Listen editiert)* — **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.5.
  <!-- @meta id: QS-E2E-SHARD-GEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [e2e, scripts/e2e-shard-gruppen.mjs, .gitattributes] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-CODE-PROP` · Eigenschafts-Tests (property-based) für die Rechen-Engines** *(Anlass: Entscheid David 7.8.2026, Verbesserungs-Runde — die Engines sind deterministisch [§2] und damit der ideale Boden für generative Tests: tausende erzeugte Eingaben gegen formulierte Invarianten [«eine Frist endet nie vor ihrem Beginn», «eine Quote liegt nie über 100 %»] statt nur handgewählter Beispiele; findet Randfälle, an die beim Testschreiben niemand dachte — für das §1-Versprechen die wertvollste Testsorte)* — Umsetzung: `fast-check` (o. Ä.) als Dev-Abhängigkeit, je Engine ein Invarianten-Katalog. **Die Invarianten-Formulierung ist fachlich:** Katalog vor der Verdrahtung mit Gegenprüfung härten und David zur Abnahme vorlegen (§7); die Tests selbst sind reine Prüflogik (`Gegenpruefung: n/a`); Scheiterns-Fähigkeit je Invariante einmal rot zeigen (§6.7). Inline, kein Fahrplan.
  <!-- @meta id: QS-CODE-PROP · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/tests, package.json] · worktree: ja · 26x: nein · groesse: M -->
- [ ] **`QS-UI-HIGHLIGHT` · `::highlight()`-Registry je Leser-Instanz** *(Anlass: Bug-Check zu PR #432, Befund B3 — EINE `lc-such-treffer`-Registry, drei Schreiber [`gesetz-leser/inhalt.tsx`, `entscheidLeserRegeln.ts`, `EntscheidLeser.tsx`]; im Split-View löscht jeder Tastendruck im Rail-Suchfeld die Gesetz-Markierung des Nachbar-Panes, gemessen 190→1 Ranges; Vorbestand, durch den dritten Schreiber verschärft)* — Reine Darstellung. **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §9.
  <!-- @meta id: QS-UI-HIGHLIGHT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/entscheidLeserRegeln.ts, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **`QS-E2E-STABIL` · Lokale e2e-/Test-Budgets an gemessene Streuung binden** *(Anlass 3./4.8.: BS-640.100-axe 60 s lokal, suche.test.ts-Hook-Timeout)* — ✅ **7.8., #461: Stall-Wurzel gefixt** (a11y-Defekt zugeklappter TOC-Äste) samt Druck-Budget und CI-Eindämmung; ✅ **8.8. nachts: die `leser-r1-r2`-Wurzelvermutung ist gemessen und WIDERLEGT** (Suchmodus rendert 282 statt 1686 Knoten) — beide Befunde samt Messwerten wörtlich in `ROADMAP-CHRONIK.md` § «Umschichtung 8.8.2026» (✅-Teilerfolge). **Offen, steuert weiter:** (a) Budgets an 4 Stellen CI/lokal gegabelt → Budget-Modul `e2e/helpers/`; (b) `leser-r1-r2`-Wurzel — echte CI-Signatur «element not found» am ZWEITEN schweren OR-Reader im selben Chromium-Worker, lokal nicht reproduzierbar; nächster Schritt ist CI-Forensik (`trace:'on'` für diese Datei bzw. Experiment Worker-Neustart je Test), **KEIN UI-Bau ins Blaue und weiterhin NICHT per Timeout maskieren**; (c) norm-sprung-Forensik und Erst-Render OR-Leser → `QS-PERF`-Fläche. Keine CI-Änderung. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.4.
  <!-- @meta id: QS-E2E-STABIL · status: ready · of: ja · blocker: null · dep: [] · kollision: [playwright.config.ts, e2e/a11y.e2e.ts, scripts/datenhaltung] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-KORPUS-SCOPE` · scope/decl-Sektionen von 12 Staatsverträgen ohne annex-Container ingestieren** *(Anlass: Gegenprüfung zu PR #425/`W2·5d-ANNEX` 3.8.2026, Nebenbefund N2 — 23 amtliche `scope_`/`decl_`-Sektionen in 12 Staatsverträgen liegen ausserhalb eines `div#annex`-Containers und fehlen darum vollständig in Snapshot+Sidecar; Vorbestand, an CISG/KRK/UNO_PAKT_II/CEDAW belegt)* — **Risikopfad** ⇒ Gegenprüfung; golden-Diff erwartet (neue amtliche Substanz). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §19.
  <!-- @meta id: QS-KORPUS-SCOPE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-GP-PRERENDER` · `check:prerender-golden` als Opt-in-Beweiswerkzeug** *(Anlass: der 8164-Seiten-Byte-Gleichheits-Beweis der Totcode-Gegenprüfung zu PR #418 war Handarbeit — der stärkste Beweis des Tages hatte kein Werkzeug)* — ein **nicht** im Pflicht-Gate verdrahteter Befehl. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.2.
  <!-- @meta id: QS-GP-PRERENDER · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/prerender.ts, package.json] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-GP-PREPUSH` · Verdikt-Prüfung vor dem Push (lokaler pre-push-Hook)** *(Anlass: Bau-Evaluation 3.8.2026 — der CI-Lauf zu PR #422 brauchte 11 Minuten, um ein fehlendes Gegenprüfungs-Verdikt zu melden, das `check:gegenpruefung` lokal in Sekunden gezeigt hätte)* — Braucht die Bereichs-Prüfung aus `QS-GP-BEREICH` (erledigt 8.8., Chronik; `dep` darum geleert). Reine Prüflogik; **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.3.
  <!-- @meta id: QS-GP-PREPUSH · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/git-setup.sh, scripts/check-gegenpruefung.ts] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-GP-NACHBEFUNDE` · Drei Härtungen aus den Gegenprüfungen der QS-CODE-Landekette** *(adversariale Prüfungen #447/#448, 4./5.8.2026: (a) fedlex-Extraktionsschicht nie Risiko-klassiert; (b) `leakErkannt` ohne Pipeline-Konsument; (c) `trenneInterneTitel` unterläuft `PARTEI_RE`, belegt. Nachbefund (d) aus der QS-GP-BEREICH-Prüfung 8.8.2026: `check-merge-schutz.ts` diffs ohne `-z`/`--no-renames` — ein Nicht-ASCII-Risiko-Pfad käme C-quoted an, `behalten()` träfe nie ⇒ latentes CI-Falsch-Grün [heute alle Risiko-Pfade ASCII; das lokale Bereichs-Tor aus #466 ist strenger und fängt es]; Rename-Kanten divergieren analog)* — b/c **Risikopfad** ⇒ Gegenprüfung; je Punkt Rot-Beweis/Regressionstest (§6.7). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.6.
  <!-- @meta id: QS-GP-NACHBEFUNDE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/gegenpruefung/kern.ts, src/lib/rechtsprechung/besetzung, scripts/normtext/entscheide-schreiben.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-KORPUS-RSPR-DATUM` · Entscheid-Datumsfehler im Rechtsprechungs-Register bereinigen** *(Anlass: Gegenprüfung W2·10-UI-NAV-J 8.8.2026, Befund B6 — `bge_151_II_475` trägt `datum: 1999-06-21`, Band 151 = 2025; die neue Jahrgangs-Sprungleiste zeigt dadurch den faktisch falschen Chip «1999 · BGE 151»)* — Bau inline: Datum gegen die amtliche Quelle (bger.ch-Volltext des Entscheids) verifizieren und in der Pipeline-Quelle korrigieren (nie im Projektions-JSON von Hand, §5); Sweep über das ganze Register nach weiteren Band/Jahr-Diskrepanzen (BGE-Band ↔ Datumsjahr, deterministische Plausibilitätsregel) mit Befundliste; **Risikopfad** (Korpus-Daten) ⇒ Gegenprüfung + Verdikt im Register. **Detail-Heimat:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md).
  <!-- @meta id: QS-KORPUS-RSPR-DATUM · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung/register.json] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
- [ ] **`QS-AUTOMATIK-BERICHT` · Wächter-Zustandsbericht + Verwaiste-Worktree-Sonde** *(zwei Anlässe, ein Bau: **(a)** die CI-Diagnose vom 3.8.2026 musste 80 Läufe einzeln auswerten, um 13 Fehlerklassen zu finden — es gibt keine Stelle, die sagt, wie es den Wächtern gerade geht; **(b)** PR #417 — der Worktree-Inhalt lag längst über #412/#413 auf `main` (`changed_files=0`), Branch und Worktree standen trotzdem noch, das kostete eine Session-Anfangsstunde)* — **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.1.
  <!-- @meta id: QS-AUTOMATIK-BERICHT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/check-ci-laeufe.ts, .github/workflows] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-TOT` · Totcode-Meldung wird echtes Tor: blockierend bei NEUEN Meldungen** *(Anlass: die Totcode-Welle PR #418/#420 hat knip von 162 auf 1 Meldung gesenkt — die Basis ist erstmals klein genug, um Neuzugang hart zu melden, statt wieder anzuwachsen; seit 7.8.2026 heisst der nie-rot-fähige Ist-Stand ehrlich `report:tot` (QS-SELBSTOPT) — dieser Schritt baut daraus das echte Tor `check:tot`)* — Reine Prüflogik. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.2.
  <!-- @meta id: QS-BASIS-TOT · status: ready · of: ja · blocker: null · dep: [] · kollision: [knip.json, package.json] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-DEPS` · Dependency-Frische: `npm audit` + Majors + knip-Unlisted** *(Anlass: knip meldet `playwright` und `react-router` als unlisted, und der Abhängigkeitsstand wurde seit Monaten nicht systematisch geprüft. **Dringlichkeit 7.8.2026:** GitHub/Dependabot meldet auf main 2 Verwundbarkeiten — 1 hoch, 1 mittel)* — Audit als **Meldung, nie Stopper** (Geparkt-Entscheid Betriebs-Instrumente bleibt). **ACHTUNG Lockfile:** Änderungen nur über `npx npm@10` — lokales npm 11 erzeugt eine CI-inkompatible `package-lock.json`. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.3.
  <!-- @meta id: QS-BASIS-DEPS · status: ready · of: ja · blocker: null · dep: [] · kollision: [package.json, package-lock.json, knip.json] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-BASIS-DOKU-CI` · Doku-Kurzpfad auch für main-Pushes — David-Entscheid nötig** *(Anlass: Bau-Evaluation 3.8.2026 — fünf `docs(plan)`-Pushes auf `main` liefen an einem Tag je ~15 Minuten Voll-CI; der PR-Kurzpfad `art=doku` existiert seit der CI-Härtung, greift aber bewusst nur bei `pull_request`)* — **Blockiert**, weil es den dokumentierten Grundsatz «ein Deploy-Stand wird nie nach Dateiendungen abgekürzt» (ci.yml, Diff-Klassierung) lockert — das entscheidet David, nicht eine Session. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.4.
  <!-- @meta id: QS-BASIS-DOKU-CI · status: blocked · of: ja · blocker: david-entscheid-doku-kurzpfad-main · dep: [] · kollision: [.github/workflows/ci.yml] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-AUTOMATIK-PARITAET` · Paritäts-Sonde: PR-Deckung ≠ Wächter-Deckung** *(Anlass: F2b-Vorfall 4.8.2026 — #425 änderte 226 Normtext-Snapshots ohne Manifest-Nachzug und passierte das PR-CI grün, weil `check:tor-paritaet` das nur in `turso-sync.yml` laufende `check:datenhaltung` als «gedeckt» zählte; ein post-merge-Wächter kann aber keinen Merge verhindern — die Drift meldete erst der rote Sync NACH der Landung)* — Schärfung **einmal rot zeigen** (§6.7). **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.5.
  <!-- @meta id: QS-AUTOMATIK-PARITAET · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/check-tor-paritaet.ts, .github/workflows] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-TOK-DECKEL` · Root-Markdown-Deckel 22 → ~20** *(Anlass: der Deckel «rund 20 Root-Markdown-Dateien» steht seit 31.7.2026 im Skill `auftrag`, der Ist-Stand liegt bei 22 — ein Deckel, der überschritten und nie nachgezogen wird, ist keiner)* — datierte Audit-/Backlog-Dateien nach `archiv/`, Verweise nachziehen. Reine Doku. **Detail:** [FAHRPLAN-TOKEN-OEKONOMIE.md](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §11.1.
  <!-- @meta id: QS-TOK-DECKEL · status: ready · of: ja · blocker: null · dep: [] · kollision: [archiv] · worktree: nein · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
- [ ] **`QS-EXTQUELLEN` · Externe Quellen/APIs/Repos — Befundliste bewerten und verorten** *(Recherche 3.8.2026, Anordnung David: «andere session soll es neu evaluieren» — dieser Schritt IST die Neubewertung)* — 4 stützende + 4 geparkte Befunde; fertig, wenn je Befund entschieden und die fünf §5-Fragen beantwortet sind (EINE an David: kommerzieller Betrieb? entscheidet über CC-BY-NC-SA-Quelle). **Befunde (Detailquelle):** [externe-quellen-repos-2026-08-03.md](bibliothek/recherche/externe-quellen-repos-2026-08-03.md).
  <!-- @meta id: QS-EXTQUELLEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [bibliothek/recherche] · worktree: nein · 26x: nein · groesse: S -->
- [ ] **`QS-HOOKS-AUSBAU` · Vier Hook-/Konfig-Ausbauten aus dem State-of-the-Art-Abgleich** *(Web-Recherche 7.8.2026 gegen Anthropic-Doku)* — (a) `SubagentStop` macht §14.7 durchsetzbar (+ Langläufer-Timer-Kandidat 7.8.); (b) `.claude/rules/`-Pfad-Scoping, CLAUDE.md < 200 Z.; (c) `SessionEnd`-Lehren-Check + `ConfigChange`; (d) `/sandbox` prüfen. Konfig-Fläche ⇒ mit David. **Detail:** [state-of-the-art-abgleich-2026-08-07.md](bibliothek/recherche/state-of-the-art-abgleich-2026-08-07.md) § «Lücken».
  <!-- @meta id: QS-HOOKS-AUSBAU · status: blocked · of: ja · blocker: david-freigabe-hooks-ausbau · dep: [] · kollision: [.claude/hooks, CLAUDE.md] · worktree: nein · 26x: nein · groesse: M -->
- [ ] **`QS-AUTOPILOT-STUFE1` · Vorschlags-Autopilot: geplanter Agent erzeugt Entwurfs-PRs aus der Messreihe** *(Entscheid David 7.8.2026 «stufe 1 ja», gebunden an ≥ 5 Snapshots; Stufe 2/3 ausdrücklich NICHT freigegeben — je eigener David-Entscheid)* — Safe-Outputs: Cron fährt `retro:17`, eröffnet Entwurfs-PR, kein Auto-Merge; §17-Grenzen unverändert. **Detail:** [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md) § «Selbstoptimierender Bau».
  <!-- @meta id: QS-AUTOPILOT-STUFE1 · status: blocked · of: ja · blocker: zeitreihe-5-snapshots · dep: [] · kollision: [.github/workflows, scripts/plan] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md -->
- [ ] **`QS-MERGE-AUTOZUG` · Wächter zieht BEHIND-PRs mit scharfem Auto-Merge automatisch nach** *(Entscheid David 7.8.2026; Anlass: 3 manuelle Nachzieh-Zyklen à ~15 min an einem Tag, #445-Fall — Auto-Merge feuert bei BEHIND nie; Merge Queue auf User-Konten nicht verfügbar → `QS-ORG-UMZUG`)* — seriell, max. 1 PR/Lauf, §6.7 einmal real. **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §3.1.
  <!-- @meta id: QS-MERGE-AUTOZUG · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
- [ ] **`QS-ORG-UMZUG` · Repo in eine GitHub-Organisation überführen (Merge Queue)** *(Entscheid David 7.8.2026 «A parken»; Queue nur für Org-Repos, ~1 h Nacharbeit Vercel/Branch-Schutz/Secrets; erst wenn `QS-MERGE-AUTOZUG` nicht reicht)* — **Detail:** [entregulierung-2026-08-07.md](bibliothek/betrieb/entregulierung-2026-08-07.md).
  <!-- @meta id: QS-ORG-UMZUG · status: blocked · of: ja · blocker: david-entscheid-org-umzug · dep: [] · kollision: [.github/workflows] · worktree: nein · 26x: nein · groesse: M -->


---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `fahrplaene/FAHRPLAN-*.md`.
>
> **Etikett-System (`@meta`/`@queue`/`@blockers`), Tor-Regeln und Geltungsbereich der IDs:**
> [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md). Der frühere Wächter-Schritt
> `QS-PH` ist darin aufgegangen (erledigt; Wortlaut → `ROADMAP-CHRONIK.md`, 3.8.2026).
>
> **`groesse: S|M|L` schätzt den Bau-Umfang** (Auftrag David 5.8.2026, damit die Auswahl im Lagebild
> «nicht zu grosse oder kleine» trifft): **S** trägt keine eigene Session und wird nur gebündelt
> genommen · **M** ist sessionfüllend, der Normalfall · **L** wird vor dem Bau in Teilschritte
> geschnitten (bei Dach-Schritten: den Unterschritt nehmen). Die Angabe ist eine **Schätzung und
> kein Tor-Kriterium** — sie steuert weder Reihenfolge noch Baubarkeit, und `check:plan` prüft nur
> ihr Vokabular; Fehlen ist zulässig und zeigt «Grösse ungeschätzt». Definition und Schätzgrundlage:
> [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md) § «Feld `groesse`».

<!-- @queue: W2·10-UI-NAV, W2·5h-GESETZ-UI, W2·13-KANTONE, W2·6b-MAT-FINMA -->
<!-- ^ Prozess-Schritte stehen vorn (Entscheid David 8.8.2026: «prozess soll grundsätzlich
     vorgehen» — revidiert die Produkt-Phase vom Vormittag). Gequeuete Querschnitt-Schritte
     steigen seit demselben Datum in die Hauptreihenfolge auf (aufloesen.ts). -->
<!-- ^ SSoT der Bau-Reihenfolge (Einbau 24.7.2026): plan:next wertet die @queue VOR der
     Dokumentreihenfolge aus; Integrität erzwingt check:plan Regel 8 (tote/erledigte IDs rot,
     Prosa-«OBERSTER» muss dem Queue-Kopf entsprechen). Priorität ändern = NUR diese Zeile
     ändern, nicht Prosa. Begründung je Schritt in den Dekret-Blöcken darunter.
     Präzedenz QS-TOK vor Gesetzesdarstellung: von David BESTÄTIGT (Chat 24.7.2026, «nein
     passt»); will er später die Gesetzesdarstellung vorziehen, `W2·5h-GESETZ-UI` an den Kopf
     dieser Zeile setzen (`W2·5d` ist erledigt — eine done-ID in der @queue macht Regel 8.3 rot) (der frühere Platzhalter `W2·12-HYGIENE` ist erledigt, Chronik 3.8.2026). -->

> **⬆ OBERSTER OFFENER SCHRITT: `W2·10-UI-NAV`** (Queue-Kopf; Prozess vor Produkt, Entscheid David 8.8.2026; Fokus-Dekret 24.7.2026 unten). Am 8.8.2026 gelandet → Chronik: `QS-SKILL-DIAET` (PR #468), `QS-CONFIDENCE-EHRLICH` (PR #469), `QS-AUDIT-VERWEISE` (PR #470, alle 8 Checklisten-Positionen).
> Stand 8.8.2026: Teilschritte -S/-V/-O/-J sind gelandet (PR #464), vom Dach offen ist nur noch `-J3` (Risikopfad, eigene Session).
> `QS-TOK` ist am 5.8.2026 abgeschlossen (Rest T10 · T12-Stufe-2 · T14-Stufe-1 · T16 · T20
> gelandet via PRs #457/#458; Stand-Block im Fahrplan §Stand 5.8.2026, Wortlaut des
> Dekret-Blocks → `ROADMAP-CHRONIK.md` → QS-TOK-Abschluss 5.8.2026). Das ROADMAP-Ceiling misst
> weiterhin allein `python3 .claude/hooks/struktur-rotieren.py --check`; Hebel bei einem Riss
> ist die Rotation samt Chronik-Überführung.

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
  <!-- @meta id: W1·4 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/prozesskosten.ts, src/pages/RechnerProzesskosten.tsx, src/lib/verzahnung] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  **Reihenfolge:** (a) Recherche der Modifikatoren an amtlichen Tarifen (Risikopfad ⇒ `QS-GP`) →
  (b) **I2** damit bauen → (c) Festsetzung/Dispositiv. **26×-Slot bleibt frei** (`26x: nein`); die
  Tarif-Tranche des Schrittes ist Kettenglied 3 der `@slot-kette`. Entparkungs-Wortlaut und Stand:
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.
 
- [ ] **5-PRAXIS · Frist × Kosten verzahnen** *(Ideen-Intake 20.7.2026 · UI-Orchestrierung, `[OF]`)*:
  <!-- @meta id: W1·5-PRAXIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechnerPermalinks.ts, src/lib/permalink.ts, src/lib/icsExport.ts, src/pages/RechnerProzesskosten.tsx, src/pages/RechnerStreitwert.tsx, src/pages/RechnerZpo.tsx, src/pages/RechnerUebersicht.tsx, src/components/forms/ProzesskostenForm.tsx, src/components/forms/StreitwertForm.tsx, src/components/forms/ZpoFristenForm.tsx, src/components/forms/VorlagenSprung.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Weg** verketten
  (Frist → Kosten → Vorlage), reine UI-Orchestrierung ohne neue Rechtsregel (§3).
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [ ] **L-3 (Auto-Default-Umkehr ZGB/OR)** — weiterhin **hinter David/Council-Gate**, NICHT in
  feat/v2-l1-l2 gebaut; Rest von A24 (L-1/L-2 gebaut, L-4 entfällt) und der erledigte Elter `5d`
  stehen in `ROADMAP-CHRONIK.md`. V2 §2 F4.
- [ ] **10-UI-NAV · UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.)** *(`[OF]`, reine UI/Navigation)*:
  <!-- @meta id: W2·10-UI-NAV · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/suche, src/lib/suche, src/lib/universalSuche.ts, src/components/layout, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, src/pages/gesetz-leser, src/pages/GesetzLeser.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  Priorisierter UI-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen — Suche, Navigation und
  Auffindbarkeit über alle Oberflächen; reine Darstellungsschicht (§3), keine Rechtslogik.
  Offen ist nur noch **-J3** (-S/-V/-J/-O erledigt 8.8.2026, Chronik); `dep`-Korrektur und Diät-Herkunft:
  **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §8.
  - [ ] **UI-NAV-J3 · Sachgebiets-Pipeline verfeinern (J3)** — **bewusst allein**, weil Risiko-Pfad: `QS-GP` Pflicht + golden byte-gleich, eigene Gegenprüfungs-Runde. §6.
    <!-- @meta id: W2·10-UI-NAV-J3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung/register.json, src/lib/normtext/browse.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **11-DESIGN · Design-Wärme & Atmosphäre (Ultracode-Synthese 11.7.)** *(`[OF]`, reine Darstellung/Token-Schicht)*:
  <!-- @meta id: W2·11-DESIGN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css, tailwind.config.js, DESIGN-REGLEMENT.md, scripts/check-design-tokens.ts, src/components/rechtsprechung, src/pages/EntscheidLeser.tsx, src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/pages/Startseite.tsx, src/components/start] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen — Token-Schicht nach
  §13, Normtext-Körper bleibt farbfrei, golden byte-gleich.
  **Dach-Schritt mit Checkliste (entstückelt 8.8.2026, Entscheid David):** Abarbeitung von oben
  (Token-Schicht vor Anwendungs-Schicht), sessionfüllende Batches, je Position eigener Commit; die
  frühere `dep`-Kette D6→D8c war Reihenfolge-Empfehlung, kein fachlicher Zwang — zwingende
  Binnenfolgen stehen an der Zeile.
  **Detail:** [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5.
  - [ ] **DESIGN-D0 · Deckkraft-Suffix-Klassen reparieren (Infrastruktur-Fund B4, 8.8.2026)** — Tailwind-Klassen mit Opacity-Zusatz (`bg-brass-100/70` u. ä.) erzeugen am aktuellen Stand KEINE CSS-Regel und rendern unsichtbar (belegt: LM-156, unsichtbare Aktiv-Zeile der Gesetzes-Gliederung, PR #472); Repo-weiter Sweep nach betroffenen Stellen + Wurzel-Fix in `tailwind.config.js`, danach Sichtprüfung der Fundstellen. Vor D6–D8 ziehen (dieselbe Token-Fläche).
  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — surface dunkel heben · warme Schattenbasis · Lichtkante · Scrim-Audit; Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. §2 (D-6).
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — Lese-Basis + Entscheid-Stepper als Multiplikatoren, CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. §2 (D-7).
  - [ ] **DESIGN-D8a · Wörterbuch auf die Fläche: slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen; Playwright-Screens in die Abnahme-Mappe.
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann mechanischer Rest (D-8.2)** — ~50 verteilte Fundstellen; **Pilot zuerst** (Startseite + 1 Rechner) mit Vorher/Nachher-Screens, danach der Rest. Nicht flip-reversibel; **nach D8a**. **Grenze zu `W2·17-UI-BEFUNDE` Position B12** beachten (§5 dort).
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten, Abschluss der Anwendungs-Schicht; **nach D8b**.

- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W2·5g-ZEIT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, src/lib/normtext, public/normtext] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» (verknüpft mit dem Entscheiddatum) + **visueller Diff zweier
  Konsolidierungen**; konsolidiert **M16** «Point-in-Time» + **G-HIST** als Daten-Unterbau in eine
  getrackte Einheit. Extraktions-Risikopfad ⇒ `QS-GP`. Harte Bau-Reihenfolge (a) POC → (b) AKN-XML
  Phase 1 + `G-HIST` → (c) Bau; Wortlaut der Entparkung und der Vorbedingungen:
  **Detail:** [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §8.
 
- [ ] **5h-GESETZ-UI · Gesetzes-Webseite: UX-Pass** *(Ideen-Intake 20.7.2026 · reine UI/Darstellung)*:
  <!-- @meta id: W2·5h-GESETZ-UI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/normtext, src/components/suche] · seq-hart: [QS-UI(a Fundament-Pass + b Hierarchie-Pass)] · seq-weich: [W2·10-UI-NAV(gesetz-leser, GesetzLeser.tsx, components/suche), W3·14(Split-View-Rahmen)] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Folgeschritt aus `QS-UI`** (Davids Sequenz: erst app-weit, dann die Gesetzes-Seite): UX-Pass auf
  der Gesetzes-Webseite inkl. Kopfzeilen-Bündel — reine UI/Darstellung, amtliche Substanz unangetastet.
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §17.
- [ ] **5j-TABELLEN · Tabellen in Gesetzen lesbar machen** *(§14-Intake 20.7.2026 · Extraktion + Darstellung, `QS-GP`)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W2·5j-TABELLEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext/adapter-pdf.ts, src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  Beispiel-Defekt `/gesetze/kanton/BS-154.810#art-29`. Extraktion = Risikopfad ⇒ `QS-GP` + golden
  byte-gleich; Zellinhalte exakt wie Quelle, mehrdeutig ⇒ Block als Text belassen (§1).
  **Grenze zu `W2·13-KANTONE-K7`** beachten (dort die PDF-Extraktion davor, hier die Darstellung).
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §18.
- [ ] **5k-LINIEN-KONZEPT · Linienführung tiefer Kodifikationen neu konzipieren** *(Anlass: Davids
  zweifaches Live-Verdikt — 12.7.2026 (A28) und 3.8.2026 nach Preview von PR #423: «eine einzige
  linie und unbrauchbar». Die EINE Auto-Guide-Linie auf der Gliederungsebene trägt bei ZGB/OR
  keine nützliche Orientierung; der Schalter-Flip wurde zweimal gebaut und zweimal am selben
  Urteil verworfen)* — **KONZEPT-Schritt, kein Bau**, **zur David-Abnahme VOR jedem Vollbau**.
  Harte Regel aus der Lehre: dieser Gegenstand wird **nie wieder über eine blosse Default-Umkehr**
  gelöst. **Detail:**
  [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §9.2
  (Spec-Wortlaut; Sachstand: §2, Massnahme F4 «Liniengliederung reparieren», Posten L-3 samt Bau-
  und Rücknahme-Vermerk); Vorgeschichte A28: [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) Ziff. 10.9.
  <!-- @meta id: W2·5k-LINIEN-KONZEPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/linienAufbau.ts, scripts/check-linien-kanon.ts] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
- [ ] **5l-NORMTEXT-B2 · Schlusstitel/UeB/Anhänge (M13) + wortgenaue Fussnoten (M14)** *(Anlass:
  Bauplan-Review 4.8.2026, Befund B5 — `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` führt B2 seit dem
  29.6.2026 als «Nächste Arbeit», David hat die Batch-Grenze am 28.6.2026 bestätigt, aber **kein
  ROADMAP-Schritt steuert sie**; verwaiste Arbeit ist für `plan:next` unsichtbar)* —
  **Risikopfad** (`scripts/normtext`) ⇒ Gegenprüfung; **golden-Re-Bless erwartet** (additiv).
  <!-- @meta id: W2·5l-NORMTEXT-B2 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund, golden] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md -->
  **M13** Schlusstitel/UeB/Anhänge: eigener **additiver** Re-Bless, `disp_`/`annex_`-Token-
  Namespace — die tragende Falle ist die **Token-Kollision `disp_u1`/`art_1`** (ohne eigenen
  id-Raum stiller Daten-Verlust). **M14** wortgenaue Fussnoten: G14-Wort-Offsets im **Sidecar**,
  baut auf dem tag-bewussten `clean()` aus G15 auf. **Bekannter Rest aus B1:** der
  Inline-Marker-Strip in `entferneTags` hinterlässt ~800 verwaiste Spaces vor Satzzeichen; B1
  glättet sie nur render-seitig — der saubere Extraktions-Fix gehört in den G14-Re-Bless.
  **Detail:** [FAHRPLAN-NORMTEXT-DARSTELLUNG.md](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md)
  §M13/§M14 + Resume-Hinweis.
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Vier eigenständige Unterschritte tragen den Strang: Mehrsprach-Vergleich · Norm-Resolver ·
  Adressregister · Übersicht/Korpus-Breite (unten). **Detail + Schnitt-Begründung:**
  [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13.
    - [ ] **6-MEHRSPRACH · Mehrsprachiger Normvergleich DE/FR/IT** — Auslegungswerkzeug nach Art. 14 PublG: drei Sprachfassungen je Erlass + Synopse-UI; heute ist nur `de` befüllt. §13.
      <!-- @meta id: W2·6-MEHRSPRACH · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund, src/pages/gesetz-leser] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-RESOLVER · Kantonaler Norm-Resolver → Kantonalnorm-Buckets (P0-Kern)** — `norm-index` füllt heute nur Bundesnorm-Buckets; der Resolver ist Voraussetzung der kantonalen Stufe. **Risikopfad.** §13.
      <!-- @meta id: W2·6-RESOLVER · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechtsprechung/norm-index.ts, public/rechtsprechung/norm-index] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-ADRESSEN · Gerichts-/Behörden-Adressregister** — Lese-/Index-Schicht über die bestehenden Bestände, **kein Datenduplikat** (§5). Quelle `bibliothek/behoerden/`. §13.
      <!-- @meta id: W2·6-ADRESSEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [bibliothek/behoerden, src/lib/kontext.ts, src/pages/RechnerUebersicht.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-UEBERSICHT · Rechtsprechungs-Übersicht: P0-Rest + Korpus-Breite** — SG-Regeste-Rest und die Übersichts-/Facetten-Breite; Kantons-Ausweitung setzt den Resolver voraus (darum `dep`). §13.
      <!-- @meta id: W2·6-UEBERSICHT · status: ready · of: ja · blocker: null · dep: [W2·6-RESOLVER] · kollision: [src/pages/Rechtsprechung.tsx, src/components/rechtsprechung, public/rechtsprechung/register.json] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [~] **Richter-/Spruchkörper-Filter — Fundament** *(`R-RICHTER`, Direktauftrag David 20.7.2026)*:
      Block A ✅, Block B trägt `W2·6-FILTER`. Detail: `fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md` §13 (Spec); Richter-Filter: Ziff. 12.
    *— Datenausbau-Unterschritte (Quellen → DB → Korpus = Fundament der Verzahnung):*
    - [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · groesse: L · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
      Andockpunkt **eine Schicht UNTER dem heutigen Generator**: die bestehenden Adapter befüllen ein
      libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion (Tor `check:paritaet`).
      **Heiss/Kalt-Grenze bleibt DAVID-GATE.**
      **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §14.
- [ ] **6-FILTER · Entscheid-Filter über die API — Richter + allgemeine Facetten** *(§14-Intake 20.7.2026, David — Queue-Plätze 2 und 3; **ULTRACODE freigegeben** für Teil b)*
  <!-- @meta id: W2·6-FILTER · status: ready · of: ja · blocker: null · dep: [] · kollision: [api/suche.ts, scripts/datenhaltung, src/components/suche, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  **Gebündelt, weil beide Teile dieselbe Bau-Fläche tragen** (Turso-Schema + `api/suche.ts` + Facetten-UI):
  Richter-Facette (aus `R-RICHTER` Block B) und die allgemeinen Entscheid-Facetten über die API.
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §7.
- [ ] **6-RNAME · Richternamen gegen den Staatskalender auflösen** *(§14-Intake 20.7.2026, David · **Extraktion/Personendaten — Risikopfad**, `QS-GP`)*
  <!-- @meta id: W2·6-RNAME · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  Abgekürzte Vornamen auflösen: **«P. Kaderli» → «Kaderli Peter»**, Abgleich gegen den amtlichen
  Staatskalender. **Extraktion/Personendaten = Risikopfad** ⇒ `QS-GP` Pflicht, nie raten.
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §8.
- [ ] **6-ZNETZ · Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** *(Ideen-Intake 20.7.2026 · Daten-Derivation, `QS-GP`)*:
  <!-- @meta id: W2·6-ZNETZ · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/verzahnung, src/lib/verzahnung, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  «Welche Entscheide zitieren diesen?» (Rückwärts-Kanten) + **Leitentscheid-Score**, deterministisch
  aus dem Zitat-Graph abgeleitet (§2 — kein Ranking-Modell, kein Bedeutungs-Urteil); Daten-Derivation
  ⇒ `QS-GP`. **Merkposten LM-042** («ff.»-Sammelzitate) als Auflage mitführen, kein eigener Posten.
  **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §10.
- **Merkposten aus `W2·6-NKEY` (28.7.2026, gilt für jeden Schritt, der `register.json` belädt):**
  `register.json` trägt `normKeys` je Entscheid und steht damit bei **97 % des 780-KB-gzip-Deckels**
  (756.9 KB) — die Verschlankung (eigene Projektion, wie `richter.json` sie für die Spruchkörper-Slugs
  vormacht) ist **nicht** durch Anheben der Schranke zu lösen (§8). Wer `register.json` weiter belädt,
  reisst `check:perf-budget`.
- [ ] **7-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — ✅ V1a/V1b/V1c gebaut 3./4.7.2026 (Chronik):
  <!-- @meta id: W2·7-VZUI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik für die Verzahnung (KantenChip · StatusBadge nur-Abweichung · KontextPanel),
  reine UI auf vorhandenen Daten (§3). **Offen: V2 (E3-Serving) · V3 (E6a)** — beide an den Datenstrang
  gekoppelt. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §11.
  - [ ] **VZUI-SACHGEBIET · Sachgebiet-Facette an der Norm↔Entscheid-Kante** *(David-Entscheid 2.8.2026 — UI-Befund LM-041 als Variante (b) «nur Sachgebiet» geöffnet)* — EINE neue Facette `sachgebiet`, **deterministisch aus der amtlichen BGE-Bandnummer I–V** (§2, keine Heuristik). Extraktion = Risiko-Pfad ⇒ Gegenprüfungspflicht. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §12 (+ Modell-Nachtrag in §9/B1).
    <!-- @meta id: W2·7-VZUI-SACHGEBIET · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/verzahnung/facetten.ts, src/lib/rechtsprechung/bezuege.ts, scripts/normtext/bezuege-bauen.ts, src/pages/gesetz-leser/bezugAuswahl.ts, src/components/verzahnung/BezugFacettenWahl.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
- [ ] **7-BEZUG-LADEN · §15-Versprechen «Grundzustand ohne Zusatz-Fetch» wiederherstellen ODER Doku ehrlich machen** *(Entscheid-Schritt, Befund 2.8.2026)* — `bezugAuswahl.ts:18–23` verspricht «kein zusätzlicher Fetch» im Grundzustand, das JSDoc `bezuegeLaden.ts:86` beschreibt ein Feld `erweitert`, **das es nicht gibt**. Status quo — Zusage ohne Deckung — ist keine Option (§5/§8). **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §13 (Referenz B4/B7).
  <!-- @meta id: W2·7-BEZUG-LADEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/bezugAuswahl.ts, src/pages/gesetz-leser/bezuegeLaden.ts, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
- [ ] **6b-MAT-FINMA · FINMA-Materialien prioritär + Verzahnung** *(§14-Intake 24.7.2026;
  <!-- @meta id: W2·6b-MAT-FINMA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  **Fokus-Dekret-Priorität**, Kontext Bewerbung David bei der FINMA mit Verweis auf LexMetrik)* —
  FINMA-Rundschreiben/Wegleitungen als nächste Quelle der bestehenden Materialien-Pipeline (E6a
  Stufe 1: Verweis-/Register-Ebene, §7 a–d, kein Volltext-Nachbau).
  **Detail:** [FAHRPLAN-MATERIALIEN-VERZAHNUNG.md](fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) §10.
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** *(Ideen-Intake 20.7.2026, `[OF]`, klein → inline §14.1)* —
    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3`) + Fussnoten-Ausgabe; Formvorschriften
    bestimmen die angebotenen Exportformate (§8). **Detail:** [FAHRPLAN-VORLAGEN-AUSBAU.md](fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md) §1.
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. **Verengt 31.7.2026 auf zwei Restpunkte.**
  <!-- @meta id: W2·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components, src/pages] · worktree: nein · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  **Restbestand:** (a) **A3** — Anw. 18 «Kacheln einer Reihe gleich hoch» vs. gebautes `items-start`
  (`src/components/forms/GebvKostenForm.tsx:97`), zur David-Abnahme geflaggt; (b) **E-Optional** —
  globaler Schalter «aufgehobene Normen ausblenden» nie gebaut. **Das Abhaken bleibt David-Entscheid**
  (Status-Hoheit), darum steht `status` unverändert auf `ready`.
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20 (massgebliche
  Fassung samt Herkunftsbeleg). Herkunft der Verengung → `ROADMAP-CHRONIK.md` → W2·9 (3.8.2026).
- [ ] **13 · Kantonale Gesetze — Darstellung & Suche** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit: 44 Befunde + 3 Kritik-Linsen, 10 live an Amtsquellen re-verifiziert)*
  <!-- @meta id: W2·13-KANTONE · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/NormText.tsx, src/components/kontext/KontextPanel.tsx, src/lib/suche/onlineVolltext.ts, api/suche.ts, src/components/suche, src/lib/normtext/relevanz.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  **Aufgeteilt 8.8.2026 (Entscheid David, sortenrein):** hier die NICHT-Risiko-Einheiten (reine
  Darstellung/Suche/Anzeige); Extraktion & Daten → `W2·13-KANTONE-DATEN`. Dach-Schritt mit
  Checkliste — die frühere `dep`-Kette K-1→K-14 war Abarbeitungsordnung, kein fachlicher Zwang;
  sessionfüllende Batches, je Position eigener Commit.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5, M)* — Lesereihenfolge, Doppel-Decode, «SR»-Label, Titel-Dopplung, Fussnoten-Stern-Strip, A14-Relevanz fr/it; reine Display-Schicht. §1-A.
  - [ ] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest, S–M)* — zweistufiger Currency-Chip, Kanton-Hinweis im KontextPanel, Abdeckungs-Kontextzeile, «Stand unbekannt», Systematik-Hinweis; reine Anzeige. §1-A.
  - [ ] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36, S)* — Edge-DTO um `ebene`/`kanton`, Treffer-Href auf `/gesetze/<ebene>/…`, Kanton-Marke, Reader-Redirect. §1-A.
  - [ ] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42, M)* — **EINE Einheit (gleiche Datei)**, golden-neutral; harte Binnenfolge **F41 vor F40** (sonst fehlt der Ersatz), F42 nachrangig. §1-A.
  - [ ] **K-11 · Kanton-Reader-Performance profilieren** *(F32, M)* — **erst messen**: `check:perf-budget` um den Kanton-Leserpfad erweitern, nichts «fixen» vor dem Profil (Ursache unbewiesen). §1-A.
- [ ] **13-DATEN · Kantonale Gesetze — Daten & Extraktion (Risikopfad)** *(Aufteilung 8.8.2026 aus `W2·13-KANTONE`, sortenrein)*:
  <!-- @meta id: W2·13-KANTONE-DATEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton, public/normtext/struktur, public/normtext/register.json, public/normtext/kanton-systematik.json, src/lib/startseiteConfig.ts, scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Extraktions- und Datenanteile der Kantons-Arbeit — durchgehend **Risikopfad** ⇒ Skill
  `korpus-werkstatt` + `QS-GP` + golden byte-gleich; Batches klein genug für eine saubere
  Gegenprüfung, zwingende Binnenfolgen stehen an der Zeile. Dach-Schritt mit Checkliste.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion, S — **Risikopfad**, `QS-GP`)* — ZG-161.7 nachziehen, SZ-Stand klären, Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`, Vollständigkeits-Invariante gegen den strukturell blinden Drift-Check. §1-A.
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22, M — **Risikopfad**, `QS-GP`)* — **pro Kanton eine Tranche**; Binnenfolge K-6a (Dedupe) vor K-6d (GL-Key-Migration). §1-A.
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** *(F20-GATE/F17a/F18/F16/F19/F23/F13, M — **Risikopfad**, `QS-GP` + pdfplumber-Gegenprobe)* — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. §1-A.
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21, M)* — `parseSegment` im LexWork-Adapter, Schema nur additiv, Golden-Diff korpusweit offline. §1-A.
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38, M)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s zu `KANTON_ERLASS_WERKZEUGE` + Konsistenz-Tor; reine Metadaten. §1-A.
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR, M)* — 263 der 314 fehlenden Struktur-Sidecars sind AR; nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**; 1 Kanton = slot-frei. §1-A.
  - [ ] **K-12 · Reports & kuratierte Listen** *(F3-Report/F4-Liste/F33-Daten, S–M)* — lesend/planend; K-12b ist reine Planung ohne Fetch, K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. §1-A.
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43, M)* — ZH/GE/VD/TI/SZ/NE/JU fehlen (19 von 26 vorhanden); Quell-Erhebung je Kanton empirisch und browserlos, kantons-einzeln frei. §1-A.
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39, L — **Risikopfad**, `QS-GP`)* — POC über 5 Gerichts-Kantone × 6 Entscheide, nur exakte Sammlungsnummer-Matches, additiver Extraktions-Pass. **Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau gegen `W2·6-NKEY` nachmessen.** §1-A.
  - [ ] **KANTONE-DRIFT · Kantonale Snapshots gegen die Quellen nachführen** *(Befund 2.8.2026, **Risikopfad**, Skill `korpus-werkstatt` + `QS-GP`)* — beim Bundes-Durchgang vom 2.8.2026 (`--nur=bund`) meldete der Drift-Abgleich **~28 kantonale Snapshots mit echter Inhaltsdrift** — bewusst ausgeklammert und **unverifiziert**. **Reihenfolge gegen `K-7`** beachten. **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §3.
    <!-- @meta id: W2·13-KANTONE-DRIFT · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
- [ ] **14-SIGNAL · Watchlist & Änderungs-Signale** *(Ideen-Intake 20.7.2026 · Infra/UI, kein Rechtsinhalt)*:
  <!-- @meta id: W2·14-SIGNAL · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json, public/rechtsprechung/register.json, src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut ausschliesslich auf vorhandenen
  Signalen** (Currency/Register/Wiedervorlage); Speicherung lokal, Werkzeuge bleiben zustandslos.
  **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16.
  - [ ] **14-SIGNAL-B1 · Statischer Änderungs-Feed (🟢)** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister; **nur der VORWÄRTS-Fall** (`naechsteFassungAb`).
    <!-- @meta id: W2·14-SIGNAL-B1 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-B2 · Client-Watchlist (🟢)** — localStorage-Liste gemerkter Normen, beim Besuch gegen die Build-Artefakte geprüft. **Rückblick-Flag gegen `fassungsToken`/`sha`, nie `geprueftAm`.**
    <!-- @meta id: W2·14-SIGNAL-B2 · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B1] · kollision: [src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-GER · Gerichts-Delta mit ehrlicher Latenz (🟡)** — Build-Zeit-Delta über `register.json` je Gericht/Norm; **eigenes Verdikt**, Import-Kadenz sichtbar ausgeliefert (§8).
    <!-- @meta id: W2·14-SIGNAL-GER · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B2] · kollision: [public/rechtsprechung/register.json, scripts/rechtsprechung] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **15-CLS · Echter CLS-Defekt auf `/gesetze` (0.109 @8× CPU)** *(§14-Intake 20.7.2026 · **Produktfehler**, reine UI)*
  <!-- @meta id: W2·15-CLS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/Gesetze.tsx, src/components/start] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  **Bewusst ein eigener Schritt und NICHT unter `QS-PERF` mitgeführt** — ein gemessener Produktfehler
  auf `/gesetze` (CLS 0.109 @8× CPU), reine UI, keine Logik-Berührung. Befund-Erweiterung 3.8.2026
  (Erlass-Leser-Seiten):
  **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §2.
- [ ] **16-INVENTAR · Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(§14-Intake 20.7.2026, David: «erst wenn es Sinn ergibt» → Zweischritt, dies ist Schritt 1)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, bibliothek/INDEX.md] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Vollständige, **ehrliche** Aufnahme dessen, was Lexmetrik heute kann — Quelle bleibt
  `startseiteConfig.ts` (§5), Status-Modell entwurf/geprüft/geplant ungeschönt (§8).
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §9.
- [ ] **16-ANLEITUNG · Bedienungsanleitung / Onboarding** *(§14-Intake 20.7.2026, David — Schritt 2, **bewusst spät**)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · of: ja · blocker: null · dep: [W2·16-INVENTAR] · kollision: [src/pages, src/components/layout] · seq-hart: [QS-UI(8a), W2·5h-GESETZ-UI(8b)] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — die Anleitung folgt dem Inventar, nicht
  umgekehrt (`dep: [W2·16-INVENTAR]`); bewusst spät, damit sie nichts beschreibt, was sich noch bewegt.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §10.
- [~] **17 · UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)** *(Auftrag David 31.7.2026, Lieferung einer externen Sichtprüfung vom 29.7.)*
  <!-- @meta id: W2·17-UI-BEFUNDE · status: wip · of: ja · blocker: null · dep: [] · kollision: [src/components, src/pages, src/index.css] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  Externe Sichtprüfung, geschnitten nach Bauteil K-01…K-20; Triage 31.7.2026: **45 NEIN · 144 VERDACHT ·
  15 BEREITS-GEBAUT · 6 SICHER**, davon **20 Batches** (19 Bau-Batches mit 189 Befunden + 1 Prüf-Batch, 15).
  **Reihenfolge-Freigabe (`@queue`) bleibt Davids Entscheid** — darum bewusst NICHT in der Queue;
  Freigabe-Wortlaut David 3.8.2026: **Detail:** [FAHRPLAN-UI-BEFUNDE.md](fahrplaene/FAHRPLAN-UI-BEFUNDE.md) §24 (Spec; Triage: §1).
  **Dach-Schritt mit Checkliste (entstückelt 8.8.2026, Entscheid David):** Reihenfolge = Priorität
  (Blocker zuerst); die frühere `dep`-Kette B3→B19 war reine Abarbeitungsordnung, kein fachlicher
  Zwang. Sessionfüllende Batches à mehrere Positionen, alles reine Darstellungsschicht (kein
  Risikopfad), je Position eigener Commit mit Trailer `Roadmap: W2·17-UI-BEFUNDE`.
  - [x] **B3 · Klebende Leisten (K-01)** — 7 Befunde (Blocker 2 · Hoch 4). §4. ✅ 8.8.2026, PR #471.
  - [x] **B4 · Leseansicht Gesetz (K-14)** — 12 Befunde (Blocker 2 · Hoch 4). ✅ 8.8.2026, PR #472 (LM-155: Verwerfen-Entscheid von David am 8.8.2026 REVIDIERT — Neubau freigegeben, siehe Position B4-N1; LM-158 → `W2·5h-GESETZ-UI` K6 gemäss Grenz-Auflage §24.1; Rest gebaut/überholt). §5.
  - [ ] **B4-N1 · LM-155-Neubau: Gliederungs-Tiefenführung im Gesetzes-Leser** — Freigabe David 8.8.2026 («du darfst neubauen»; ersetzt die 12.7.-Abschaltung «funktioniert überhaupt nicht» — diesmal design-sorgfältig, DESIGN-REGLEMENT-Dach, e2e-gesichert). §5 (LM-155).
  - [x] **B5 · Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)** — 8 Befunde (Blocker 2 · Hoch 2). ✅ 8.8.2026, PR #473 (7/8: LM-174 wartet auf David — 19.6.-Entscheid «Automatisch (Tageszeit)»; Rest gebaut/nachgemessen-überholt). §6.
  - [ ] **B6 · Fehler-, Leer- und Ladezustände (K-15)** — 14 Befunde (Blocker 1 · Hoch 9). §7.
  - [ ] **B7 · Overlays und Menüfenster (K-02)** — 8 Befunde (Blocker 1 · Hoch 3). §8.
  - [ ] **B8 · Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)** — 10 Befunde (Blocker 1 · Hoch 3). §9.
  - [ ] **B9 · Textsatz und Umbruch (K-12)** — 12 Befunde (Blocker 1 · Hoch 2). §10.
  - [ ] **B10 · Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)** — 7 Befunde (Blocker 1 · Hoch 1). §11.
  - [ ] **B11 · Karten (K-04)** — 13 Befunde (Blocker 0 · Hoch 4). §12.
  - [ ] **B12 · Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)** — 11 Befunde (Blocker 0 · Hoch 4). §13.
  - [ ] **B13 · Zahlen-, Datums- und Zählformate (K-11)** — 12 Befunde (Blocker 0 · Hoch 3). §14.
  - [ ] **B14 · Brotkrume, Kopfzeilen und Seitenmeta (K-19a)** — 8 Befunde (Blocker 0 · Hoch 3). §15.
  - [ ] **B15 · Umschalter, Tabs und Akkordeons (K-06)** — 9 Befunde (Blocker 0 · Hoch 2). §16.
  - [ ] **B16 · Seitengerüst und Inhaltsbreite (K-13)** — 8 Befunde (Blocker 0 · Hoch 2). §17.
  - [ ] **B17 · Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)** — 8 Befunde (Blocker 0 · Hoch 1). §18.
  - [ ] **B18 · Listen, Suche und Relevanz (K-19b)** — 8 Befunde (Blocker 0 · Hoch 1). §19.
  - [ ] **B19 · Eingabe- und Auswahlfelder — Detail (K-08b)** — 7 Befunde (Blocker 0 · Hoch 0). §20.
- [ ] **18-FEHLERBUCH · Davids Alltags-Fehlerfunde (stehender Sammel-Schritt)** *(Entscheid David 8.8.2026 — Kleinvieh bündeln statt einzeln durch die volle Maschine)*
  <!-- @meta id: W2·18-FEHLERBUCH · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components, src/pages] · worktree: nein · 26x: nein · groesse: M -->
  David sammelt Fehler aus der täglichen Nutzung formlos hier als `- [ ]`-Zeile (oder meldet sie im
  Chat — die Session trägt sie ein). Eine Fix-Batch-Session arbeitet mehrere Positionen sortenrein
  ab: ein Branch, einmal Tore, eine Landung. **Risikopfad-Funde gehören NICHT hierher**, sondern als
  Position in den passenden Risiko-Dach-Schritt (`QS-GP` Pflicht). Der Schritt bleibt stehen (nie
  `done`); erledigte Positionen werden abgehakt und periodisch in die Chronik geräumt.
  *(noch keine offenen Positionen — neue Funde als `- [ ]`-Zeile hier anfügen)*

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **10 · Neue Rechner-Klingen** *(`[OF]`, §2/§7)*: **Zustellfiktions-Engine** (deterministisch,
  <!-- @meta id: W3·10 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib, src/lib/startseiteConfig.ts, src/pages] · worktree: nein · 26x: nein · groesse: L · fahrplan: archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md -->
  fristrelevant) · **Gesellschaftsrechtliche Schwellen-Module** (OR 727/671/653s, harte Zahlen) ·
  **Schutzrechts-Gebühren IGE** · **Normfassungs-/Geltungsstand-Prüfer** (intertemporal) ·
  **Kantonale Gerichtsferien-Datenschicht** (eigene/zusätzliche Gerichtsferien im kant.
  Verfahrensrecht VRPG/Justizgesetz, optionale Schicht über der bestehenden `stillstandsperioden`-
  Strategie, je Kanton eigene Deklaration — **26×-Datenasset, Leitprinzip 4/Slot beachten**;
  Bau-Auflagen Zustellfiktion SchKG strikt trennen, BGE 138 III 225 nur offengelegte Annahme:
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3).
  **`fahrplan: archiv/…` ist eine deklarierte Ausnahme** (31.7.2026); **erster Arbeitsschritt** ist
  darum die Restpunkte-Extraktion aus §P3 in einen aktiven Fahrplan. Begründung wörtlich →
  `ROADMAP-CHRONIK.md` → W3·10 (3.8.2026).
- [ ] **11 · Gesetzgebungs-/Rechtsetzungs-Tracking** *(neu, amtlich)*. Übersicht «was kommt»:
  <!-- @meta id: W3·11 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, src/lib/fedlex, public/normtext, src/pages] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Vernehmlassungen (admin.ch), Parlamentsgeschäfte (parlament.ch), in AS/BBl publiziert aber noch
  nicht in Kraft (Fedlex), künftige Fassungen — Drift gegen die geltende Fassung. Andockpunkt
  `fedlex.ts`/Drift-System.
  **Teil-ERLEDIGT 10.7.2026 (Fedlex-Portfolio Paket 3: Vernehmlassungen, 822 Verfahren).** Wortlaut → `ROADMAP-CHRONIK.md` → W3·11 (26.7.2026); Detail `fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3` + `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.
  **Rest offen:** Parlamentsgeschäfte (parlament.ch), künftige-Fassungen-Drift, Übersichtsseite «alle
  laufenden Vernehmlassungen», Laufend-Badge im Reader-Kopf (gesetz-leser war TABU).
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton, src/pages/gesetz-leser] · worktree: nein · 26x: ja · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md · slot: inhaber -->
  **SLOT-ÜBERGABE 20.7.2026: dieser Schritt hält jetzt den 26×-Slot** (`slot: inhaber`); Reihenfolge
  E3 → W3·12 entschieden (David 2.7.). Kanton-Gesetze-Bündel = 3-Tier-Import + BS-Vorbildkanton +
  Rechtssammlung P6 + POPUP-Kanton-Rest; nie zwei 26×-Assets parallel (Leitprinzip 4).
  **Detail:** [FAHRPLAN-GESETZE-IMPORT-3TIER.md](fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md) §6.
- [ ] **13 · Vorlagen-Breite** *(VORLAGEN V5/V6/V8, GMBH G2, VERTRAGS-VARIANTEN P3; Worktree)*.
  <!-- @meta id: W3·13 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  Tiefe vor Stückzahl. GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) ·
  Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft).
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10
  (Vertrags-Varianten) + §11 (GmbH-Gründung) — W3·13 trägt beide Stränge.
- [ ] **14 · Multi-Pane / Split-View** *(SPLIT-VIEW, Fundament-Umbau, eigener Worktree; Auftrag
  <!-- @meta id: W3·14 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Topbar.tsx, src/App.tsx, tailwind.config.js] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  David 29.6.2026)*. 2–3 „Engines" nebeneinander **wie im Browser** → der **Verzahnungs-Burggraben
  sichtbar** (Gesetz | Rechner | Begründungs-Absatz). **Erst Strang A** (Inhaltsbreite-Umschalter),
  dann der Fundament-Umbau; eigener Worktree (§12).
  **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
  - [ ] **14-B3 · Scroll & Fokus pro Pane — Restposten** — pro-Pane-Scroll und Spy laufen; **offen**: Scroll-POSITIONS-Wiederherstellung (`App.tsx` noch window-basiert) + Tastatur-Pane-Wechsel. §STRANG B (B-3).
    <!-- @meta id: W3·14-B3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/App.tsx, src/components/layout/usePaneLayout.ts, src/components/layout/Pane.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  - [ ] **+ Auftrags-Eingang 30.6.: Bündel S** — **S1** Breadcrumb-Navigation in der Pane · **S2**
    <!-- @meta id: W3·14-S · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    Tracker «alles schliessen». S1+S2 bündeln. Wortlaut: [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
  - [ ] **Split-View a11y-Restpunkte** *(SPLIT-VIEW, `[OF]`, NIEDRIG — aus §9-Bug-Check 29.6.2026)* —
    <!-- @meta id: W3·14-a11y · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    3 verifizierte, bewusst **nach** dem Prod-Deploy zurückgestellte a11y-Kanten der Pane-Schicht.
    **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
- [ ] **15-RICHTER · Spruchkörper-Analytik** *(Ideen-Intake 20.7.2026 · **bewusst freigabe-pflichtig**)* —
  <!-- @meta id: W3·15-RICHTER · status: blocked · of: ja · blocker: richter-analytik-gate · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung, src/pages/Rechtsprechung.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
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
