# Übergabe Gesetz-Leser V3 — Stand 17.8.2026 spätabends (Session 17.8., Orchestrator)

Massgeblich sind `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7 Etappen + Vollzugsvermerke,
Kap. 8/9 Entscheide, Kap. 12, Kap. 14) und der Kontaktbogen
`docs/ux-audit-2026-07/reader/leser-v3-h4/README.md` (alle offenen David-Punkte gebündelt).
Diese Datei ist der Momentaufnahme-Zeiger für die Folge-Session; Vorgängerfassung in
git-Historie (Commit `932df3a90`).

## Gelandet (main, live — Prod-Build geprüft)
- **#539 H2** (Suchverhalten V3) — Merge `19a989f93`.
- **#547 S1** (Änderungsvermerke zweiwertig) — Merge `2538dd356`.
- **#548 H2b** (Ästhetik-Nachzug) — Merge `98558b561`.
- **#549 H3** (Rahmen/Blatt/Gliederung) — Merge `2992501b0`.
- **#550 S2** (Typografie V2 + Fussnote) — Merge `afc008c19`.
- Live-Vergleich: https://lexmetrik.vercel.app/gesetze/bund/STPO?leser=v3 vs. ohne Flag.
- Ästhetik-Verlauf: H1 5,5 · H2 6,0 · H2b 6,5 · H3 6 · S1 8 · S2 7 · Nachzug 7.

## Gelandet — PR #551 (Merge `f225f9c5d`, 17.8. spätabends; Worktree/Branch abgeräumt)
Deploy-Job im Actions-Lauf des Merge-Commits und `curl -s https://lexmetrik.vercel.app/ | grep lexmetrik-build` == `f225f9c5` prüfen (die Übergabe-Session hat den Deploy-Wächter gestartet; falls nicht `f225f9c5`: Actions-Lauf ansehen).

Inhalt:
- **A-2 Leisten-Verschmelzung:** eine Kopfzeile statt zwei (`KopfDaten.kopfzeileSelbst`,
  `PaneKopf.nurSteuerung`, `useKopfAnspruch`), Chrome-Ersparnis Desktop −38 px / Handy −38 px.
- **Drei Live-Befunde David:** Treffer-Blatt am Suchfeld (`LeserTrefferBlatt`/`useTrefferBlatt`);
  Fussnoten von Änderungsvermerken entkoppelt (Fussnoten = Marker+Apparat aller Klassen,
  Vermerke = nur `[data-hist-slot]`, beide eigene Hüllen); Fokusring `outline-offset −2px`.
- **Übersichtsbox** als Fedlex-Steckbrief (`uebersichtAngaben.ts`, Ä70–Ä75).
- **H4-Vorbereitung ohne Flip:** Kontaktbogen `leser-v3-h4/README.md`, `useElementBreite`,
  Flaker-Wurzel Ä24 (`e2e/helpers/leserBereit.ts`), `useStickAusgleich`.
- Drei Prüfer durch: Bug · Ästhetik 7/10 · Architektur 8,5/10.

## Entscheide David 17.8.2026 (gelten)
- **F3 = V2** «amtsnah kompakt» (17 px/1.55) **+ Fussnote hochgestellt** (Bildbogen).
- «arbeite token sparend, delegiere viel» — Orchestrator-Rolle bestätigt.
- «bring alles Angefangene zu Ende, dann Prompt für nächste Session» → diese Übergabe.
- Kopfzeile verschmelzen · Übersichtsbox nach Fedlex-Vorbild · drei Live-Befunde (siehe PR #551).

## Wartet auf David — gebündelt im H4-Kontaktbogen
`docs/ux-audit-2026-07/reader/leser-v3-h4/README.md`:
1. **H4-Umschalten** (V3 als Standard) Ja/Nein; Blocker: NM-2 Handy (prüfen, ob H3-Nachzug
   «Ansicht ▾»-Öffner das schon löst), Ä60 Spalten-Entscheid (1024/1072-Grenze), Ä46 zwei ✕,
   B-Spec-Umhängung.
2. Randlasche gestrichen (H3, gegen F8 «behalten») — drei Optionen im H3-Vermerk.
3. Ä25 Verweis-Linie (Design-Grundlage Kap. 8 vs. WCAG G183 — Empfehlung: behalten).
4. Ä75 «SR» bei Kantonserlassen (957 hart kodiert).
5. Ä81 Steckbrief dupliziert Erlass-Kopf (Stand 3×) → «nur Kopf warnt»?
6. Treffer-Blatt deckt Textrand 38–86 px — so lassen? Kein Aussenklick-Schluss.
7. Am Bild: Sachüberschrift 13 px, Fussnoten-Apparat 11 px (Folgen V2), Lesemass 75→80 ch?
8. K4-Hinweis S1: «Änderungsvermerke aus» blendet auch «Gilt seit»/Zeitleiste aus.
9. Vercel-Wurzelfix (Dashboard/Token/Plan) · lokal `git config --unset core.hooksPath`.

## Nächste Bauschritte (Reihenfolge)
1. Kontaktbogen von David beantworten lassen.
2. Bei Ja: **H4-Flip** — Flag-Default, B-Specs umhängen/löschen, N/V3-Listen in
   `playwright.config.ts`, Kap.-10-Korrektur (`hist-ansicht-w25i`/`gesetze-historie-badge`
   NICHT in `N_SPECS`).
3. **H5** — Löschung alte Hülle + Flag (Löschliste Fahrplan Zeile H5, inkl.
   `LeserAnsichtMenu`/`OptSwitch`, `KontextPanel` samt Kante `inhalt-ansichten`;
   `BezugFacettenWahl` NICHT löschen; 37-px-Band bleibt).
4. Offene H4-Zeilen: Ä9 Regler-Doppel Topbar, Ä33/Ä34/Ä83 App-Topbar Suchkästchen @390,
   Ä54 Handy-Einzug, Ä55 Regler-Hierarchie, Ä79 zwei ☰, Ä80/Ä84, `leser-lesemass` umhängen,
   `LeserRahmenV3`-Schnitt (Sonde 420, Adapter 419).
5. ANHANG_DOMINANZ-Doppel (Risikopfad, eigener PR mit Gegenprüfung).
6. §17-Positionen: QS-PERF (Kopf-Reflow +161 px, `leser-ohne-gliederungslinie` unter
   4 Workern, createRoot→hydrateRoot), QS-DATA-INGEST-DRIFT, PX-Lastfall (QS-E2E-STABIL),
   Vitest-Zeitbudgets schwerer Sweeps unter Parallel-Last.

## Feste Regeln (David, unverändert)
Drei Prüfer je Etappe vor Merge (Bug · Ästhetik hell/dunkel · Architektur/Erlass-Neutralität,
anderes Modell) → Nachzug mit frischem Agent in denselben PR; Ä-Checkliste bis zum Schluss
(Nummernkreise: Ä25–Ä27 S1, Ä35–Ä44 H2b, Ä45–Ä59 H3, Ä61–Ä66 S2, Ä67–Ä69+Ä76 Fix,
Ä70–Ä75 Übersicht, Ä77–Ä85 Nachzug); Bund- + Kantons-Probe; Split-View; Suchfeld oberstes
sticky Element; Kern unangetastet ausser deklarierter Ausnahme; Golden byte-gleich;
Commit-Typen ehrlich, `-F`, nie amend/stash/reset; §14.7 wörtlich in jeden Sub-Agenten-Auftrag;
Unteragenten enden mit prüfbarer Rückgabe; Merge und Aufräumen nie in einer Kommandozeile;
nach Merge `state == MERGED` prüfen; bekannter CI-Flake `leser-ohne-gliederungslinie:71`
Shard 7 → `gh run rerun <id> --failed`.

## Werkzeug-Hinweise
Deploy = CI-Job «Deploy (Prod, Vercel CLI)»; Live-Check
`curl -s https://lexmetrik.vercel.app/ | grep lexmetrik-build` == Merge-SHA; Vercel-Tageslimit
hinfällig (CI-Deploy). Agenten-Briefe dieser Session unter
`/Users/david/Developer/LexMetrik-briefs-2026-08-17/`. Playwright-Port ist worktree-abhängig;
e2e-Server ist `preview` auf `dist/` → nach `src`-Änderung `npm run build`.
