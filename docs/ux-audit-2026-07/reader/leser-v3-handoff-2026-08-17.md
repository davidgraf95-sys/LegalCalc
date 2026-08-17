# Übergabe Gesetz-Leser V3 — Stand 17.8.2026 mittags (Session 17.8., Pause wegen Laptop-Neustart)

Massgeblich sind `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7 Etappen + Vollzugsvermerke H1/H2/H2b/S1/S3,
Kap. 8/9 Entscheide, Kap. 12, Kap. 14) und die ROADMAP-Checkliste `W2·5m-LESER-V3`. Diese Datei ist der
Momentaufnahme-Zeiger für die Folge-Session. Vorgängerfassung: `archiv/`-los, in git-Historie (#541).

## Gelandet (main, live)
- **#539 H2** (Suchverhalten V3 + S4 + PX + QS-UI-HIGHLIGHT) — Merge `19a989f93`, live 17.8. vormittags.
- **#547 S1** (Änderungsvermerke zweiwertig, «Verweise» weg, Migration; beide Hüllen; Ästhetik 8/10, Architektur 8,5/10) — Merge `2538dd356`, **live** (Prod-Build `2538dd35` geprüft).
- **#548 H2b** (Ästhetik-Nachzug: Kopf bündig, Suchfeld je Pane/im Blatt, App-Seitenleiste eingeklappt (Schlüssel `.v2`), ⌘K pane-bewusst, Ä1–Ä23 + Ä35–Ä44; Ästhetik 6,5/10, Architektur 8/10) — Merge `98558b561`, **live** (Prod-Build `98558b56`).
- Deploy läuft aus der CI (Job «Deploy (Prod, Vercel CLI)»); bekannter CI-Flake `leser-ohne-gliederungslinie:71` (Shard 7, OR, «Ansicht»-Knopf nicht in 20 s) → `gh run rerun <id> --failed` (heute 1×, dann grün).

## Entscheide David 17.8.2026 (neu, gelten)
- **F3 = V2 «amtsnah kompakt» + Fussnotenmarke hochgestellt** (Wortlaut «v2 gefällt mir besser aber
  fussnoten hochgestellt», am Bildbogen `docs/ux-audit-2026-07/reader/leser-v3-s2/bogen.html`, auch als
  Artefakt https://claude.ai/code/artifact/4569ae72-18ba-4dae-9105-afeabb48b9b1). Ersetzt «F3 = V1».
- «arbeite token sparend, delegiere viel» — Orchestrator-Rolle bestätigt.
- Bild-Bogen-Commit lokal auf main: `493cda91a` (kommt mit dem Sammel-Push).

## Offene Etappen — exakter Zustand (Worktrees `LexMetrik-h3`, `LexMetrik-s2` bleiben stehen)
| Etappe | Branch / Worktree | Zustand | Nächster Handgriff |
|---|---|---|---|
| **H3** | `feat/leser-v3-h3` · `LexMetrik-h3` | Bau + drei Prüfer (Bug 3 vor Merge · Ästhetik **6/10** · Architektur 8,5/10) + **Nachzug fertig** (c7ed252d5: Lade-Ende-Signal, Ansicht-Öffner je Pane, `r` pane-bewusst, Blatt ab Kopf-Unterkante + nicht-modal auf D, echtes Bottom-Sheet, kompakte `PanelFilterZeile`, BestimmungsWort/Sonde beidseitig, `leserGeometrie.ts`/`LeserGliederungSchiene.tsx`, tote Slots weg; **§7-Abweichung: Randlasche GESTRICHEN** (16 px im Normtext @390, wortgleiches Doppel des Kopf-Chips) → wartet auf David; Ä60: D-Blatt deckt 112 px jeder Textzeile → Spalten-Entscheid H4). Rebase-Agent läuft: `rebase --onto origin/main 9555f96e8`, D1 (S1-Rest: «Änderungsvermerke»-Schalter in V3 nur bei Erlassen mit Vermerken) | nach Rebase-Rückgabe: PR mit Trailer (`Roadmap: W2·5m-LESER-V3` / `Roadmap-Status: ready`), CI, `gh pr merge --squash`, Deploy-Check |
| **S2** | `feat/leser-v3-s2` · `LexMetrik-s2` (auf main 2538dd356 umgehängt, 9a5eb98b7) | Bau fertig (V2 17 px/1.55, Fussnote hochgestellt, Beiwerk-Zone artikelweise aus dem Datenmodell, A-1 Regler `[data-lese]`, PX-Wurzelfix `MESS_HOEHE_PX`), drei Prüfer (Bug · Ästhetik **7/10** · Architektur 8,5/10). **Nachzug-Agent läuft** (Orchestrator-Entscheid: **Ä25 zurückgenommen** — `NormText.INLINE_CLASS` ist site-weit, Kontrast 1.00:1 auf Rechnerseiten; Ä25 → wartet auf David; Ä52-Marker-Kollision + Ä53-Marken-Waisen (Kern), Ä7 Sektionsköpfe, Doku-Drifts, Token-Rename-Reste) | nach Nachzug: Rebase auf main (nach H3-Merge), Tore, PR, CI, Merge |
| **H4-Vorbereitung** | — | noch nicht begonnen | Flip-Kriterien Kap. 7 sammeln (acht N-Tests unter Flag, `leser-kopf-paritaet`, PX, NM-Tabelle, CLS, axe, Kantons-Probe, drei Flaker mit Wurzel-Fix), vier B-Specs umhängen, Kontaktbogen; **HALT vor dem Flip (Davids Ja)** |

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
