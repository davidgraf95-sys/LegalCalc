# Übergabe Gesetz-Leser V3 — Stand 17.8.2026 mittags (Session 17.8., Pause wegen Laptop-Neustart)

Massgeblich sind `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7 Etappen + Vollzugsvermerke H1/H2/H2b/S1/S3,
Kap. 8/9 Entscheide, Kap. 12, Kap. 14) und die ROADMAP-Checkliste `W2·5m-LESER-V3`. Diese Datei ist der
Momentaufnahme-Zeiger für die Folge-Session. Vorgängerfassung: `archiv/`-los, in git-Historie (#541).

## Gelandet (main, live)
- **#539 H2** (Suchverhalten V3 + S4 + PX + QS-UI-HIGHLIGHT) — Merge `19a989f93`, **Prod = 19a989f9**
  (Deploy-Job grün, `curl … | grep lexmetrik-build` geprüft). Vergleich: `/gesetze/bund/STPO?leser=v3`.
- Deploy läuft seit 17.8. aus der CI (Job «Deploy (Prod, Vercel CLI)»); Vercel-Git-Deploys aus.

## Entscheide David 17.8.2026 (neu, gelten)
- **F3 = V2 «amtsnah kompakt» + Fussnotenmarke hochgestellt** (Wortlaut «v2 gefällt mir besser aber
  fussnoten hochgestellt», am Bildbogen `docs/ux-audit-2026-07/reader/leser-v3-s2/bogen.html`, auch als
  Artefakt https://claude.ai/code/artifact/4569ae72-18ba-4dae-9105-afeabb48b9b1). Ersetzt «F3 = V1».
- «arbeite token sparend, delegiere viel» — Orchestrator-Rolle bestätigt.
- Bild-Bogen-Commit lokal auf main: `493cda91a` (kommt mit dem Sammel-Push).

## Offene Etappen — exakter Zustand (Worktrees bleiben stehen!)
| Etappe | Branch / Worktree | HEAD | Zustand | Nächster Handgriff |
|---|---|---|---|---|
| **S1** | `feat/leser-v3-s1` · `LexMetrik-s1` | `788e4d4a5` (gepusht) | **PR #547** offen; drei Prüfer + Nachzug durch; CI-Lauf 32023000319 **ROT im Job «Tore»: `struktur-rotieren.py --check` — ROADMAP.md 100.5 KB > 100 KB** (S1-Nachzug legte QS-PERF- und QS-DATA-INGEST-DRIFT-Zeilen an) | Steuer-Doku rotieren nach `.claude/skills/bauschritt/aufraeumen.md` (erledigte Schritte ins Archiv, ≥ 1 KB), im S1-Branch committen, pushen, CI abwarten, `gh pr merge 547 --squash`; Trailer steht im PR-Body (`Roadmap-Status: ready`) |
| **H2b** | `feat/leser-v3-h2b` · `LexMetrik-h2b` | `9555f96e8` (gepusht, force-with-lease nach Rebase auf main) | Bau + drei Prüfer (Bug · Ästhetik 6,5/10 · Architektur 8/10) + **Nachzug fertig** (A1–A5, B1–B9, B11–B15 erledigt; B10 = H3-Auflage; Vollzugsvermerk «H2b-NACHZUG» Ä35–Ä44). Tore lokal grün ausser `gate` (nur `allgemeineFrist.property` unter Load 28–40; isoliert grün; S1-Branch trägt den Fix). Kern-Berührungen deklariert: `ArtikelBody.tsx` (Ä8 Hover), `leserSuche.baueAusschnitt` (Ä29 Wortgrenze, beide Hüllen) | Nach S1-Merge: `git rebase origin/main` (Konflikt `LeserAnsichtV3.tsx` klein), Tore nackt, PR mit Trailer (`Roadmap: W2·5m-LESER-V3` / `Roadmap-Status: ready`), CI, `gh pr merge --squash`. **Basis von H3** (H3 basiert auf 37159526f = VOR dem Nachzug → `rebase --onto`) |
| **H3** | `feat/leser-v3-h3` · `LexMetrik-h3` | `36fb8387b` (gepusht) + 8 uncommittete Dateien | Bau-Agent lief (Panel 3 Reiter, Zähler, Nachladen, 4 Specs, «angedockte Panel-Spalte gestrichen»); Basis = H2b `37159526f` (VOR dem H2b-Nachzug) | Uncommittetes sichten/committen (WIP), Bau ggf. mit frischem Agent zu Ende führen (Brief `h3-brief.md` im alten Scratchpad ist weg — Spec: Fahrplan Kap. 4d/7 «Panel-Nachladen», Vollzugsvermerk H1 «Folge-Etappen»), dann `git rebase --onto <H2b-HEAD> 37159526f feat/leser-v3-h3`, drei Prüfer, Nachzug (dazu **B3-V3-Rest aus S1**: Schalter «Änderungsvermerke» in V3 nur bei Erlassen mit Vermerken), PR, Merge |
| **S2** | `feat/leser-v3-s2` · `LexMetrik-s2` | `788e4d4a5` + 23 uncommittete Dateien | Bau-Agent gerade gestartet (V2-Tokens, Beiwerk-Zone Pos. 13, Ä-(a)/(b)/Ä7/Ä26/Ä4/**Ä25** (Verweis-Farbtoken ≥ 3:1, Linie erst bei Hover), PX-Baseline einmalig neu, A-1 Regler, Specs `leser-breite-a37`/`leser-lesemass`); Basis = S1 | Uncommittetes sichten; frischen Agent mit Brief neu aufsetzen (Kap. 8 Spalte V2 + Fussnote hochgestellt; s. Fahrplan Kap. 8/9 nach Nachtrag), drei Prüfer, PR, Merge; nach S1-Merge auf main umhängen |
| **H4-Vorbereitung** | — | — | noch nicht begonnen | Flip-Kriterien Kap. 7 sammeln, Kontaktbogen; PX-Baseline worktree-unabhängig machen; vier B-Specs umhängen; **HALT vor dem Flip (Davids Ja)** |

## §17-Funde dieser Session (verankert)
- `allgemeineFrist.property.test.ts` (`tageZwischen`, 1000 Läufe, 12.8 s isoliert / >30 s unter Last) → Zeitbudget 120 s im S1-Branch, `numRuns` unverändert.
- `leser-ohne-gliederungslinie:71` lokal auf unverändertem main 6/6 rot (Projekt `leser-v3`) → QS-PERF-Zeile (Wurzel createRoot→hydrateRoot); CI-Läufe waren bisher grün — bei CI-Rot `gh run rerun --failed`, nicht lockern.
- `scripts/datenhaltung/suche.test.ts` Hook-Deckel 95 s, Ingest 3× langsamer als Kalibrierung 14.8. → ROADMAP `QS-DATA-INGEST-DRIFT` (S1-Branch).
- Reader-Kopf reflowt nach Client-Takeover +161 px (Lade-Sprung) → QS-PERF-Zeile (S1-Branch).
- Muster (S1-Nachzug-Agent): drei Deckel gegen isolierte Werte bemessen, Streuung frisst die Reserve — QS-PERF/QS-DATA-INGEST-DRIFT zusammen angehen.
- ANHANG_DOMINANZ-Doppel (`gliederungsModell.ts` 0.5 vs. `erlassKopfText.ts` 0.9): NICHT in H2b (Risikoklassen nicht mischen) — eigener kleiner Risikopfad-PR mit Gegenprüfung, offen.

## Feste Regeln (David 16./17.8.), unverändert
Drei Prüfer je Etappe vor Merge (Bug · Ästhetik Screens H/D/S hell/dunkel · Architektur/Erlass-Neutralität, anderes Modell) → Befunde als Nachzug mit frischem Agent in denselben PR; Ä-Checkliste bis zum Schluss (Nummernkreis: S1-Prüfung vergab Ä25–Ä27, H2b-Nachzug Ä35–Ä44); Bund- + Kantons-Probe unter `?leser=v3`; Split-View mitdenken; Suchfeld oberstes sticky Element; «Rechtsprechung im Text» aus ⇒ Zähler UND Lasche weg; Kern unangetastet ausser deklarierter Ausnahme (S-Strang); Golden byte-gleich; Commit-Typen ehrlich, `-F`, nie amend/stash/reset; §14.7 wörtlich in jeden Sub-Agenten-Auftrag; Unteragenten enden mit prüfbarer Rückgabe.

## Wartet auf David
H4-Umschalten (Kontaktbogen) · Vercel-Wurzelfix (Dashboard/Token/Plan) · lokal `git config --unset core.hooksPath` · **Ä-K4-Hinweis:** «Änderungsvermerke: aus» blendet auch «Gilt seit» und Fassungs-Zeitleiste aus (Plan Pos. 8; mehr als F1 wörtlich) — Einspruch möglich, sonst gilt es.
