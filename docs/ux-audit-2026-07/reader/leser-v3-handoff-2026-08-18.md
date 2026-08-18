# Übergabe Gesetz-Leser V3 — Stand 18.8.2026 (Session 18.8., Orchestrator)

Massgeblich sind `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7 Etappen + Vollzugsvermerke,
Kap. 8/9 Entscheide, Kap. 12, Kap. 14) und der Kontaktbogen
`docs/ux-audit-2026-07/reader/leser-v3-h4/README.md`. Diese Datei ist der
Momentaufnahme-Zeiger für die Folge-Session; Vorgängerfassung (17.8.) in der
git-Historie, sie ist mit dieser Datei ersetzt worden.

## Wo der Leser steht
**V3 ist seit H4 der Standard-Leser** (`src/pages/GesetzLeser.tsx`, Grundzustand
`'v3'`; David-Ja 17.8. «ja und c, mach so»). `?leser=v1` ist der Rückweg und
bleibt bis **H5** — dort fällt die alte Hülle samt Flag und dem Playwright-Projekt
`leser-v1`. **Ä60 = (c)** ist gebaut: der Leser-Rahmen darf breiter werden als
eine Textseite (max. 84 rem), das Beiwerk-Blatt hat eine eigene Spur und verdeckt
ab 1024 px Fensterbreite **0 px** statt 320/257/192/112.

## Gelandet auf main (live)
`#539 H2` `19a989f93` · `#547 S1` `2538dd356` · `#548 H2b` `98558b561` ·
`#549 H3` `2992501b0` · `#550 S2` `afc008c19` · `#551 Nachzug 17.8.` `f225f9c5d`.
Ästhetik-Verlauf: H1 5,5 · H2 6,0 · H2b 6,5 · H3 6 · S1 8 · S2 7 · Nachzug 7 · **H4 7,5**.

## Offen im PR (Branch `feat/leser-v3-h4-vorbereitung-2`)
H4-Flip + Rahmen (c) + Handy-Öffner + **Nachzug A und B** nach drei Prüfern und
Klick-Test. PR-Body liegt unter
`/Users/david/Developer/LexMetrik-briefs-2026-08-17/h4-pr-body.md`.
- **Prüfer:** Bug — 2 Befunde, beide **vor** Merge behoben · Ästhetik **7,5/10** ·
  Architektur **7/10, «ja mit Nachzug»** · Klick-Test **186 Bilder**; A1 (V1-Seite)
  zurückgestellt, weil V1 mit H5 ohnehin fällt.
- **Nachzug A** = Kopf/Gliederungswege, Steckbrief-Lage (Ä89), Icon-Bauform (Ä90),
  `data-toc-baum`. **Nachzug B** = Ä81 «nur der Kopf warnt», Schalter-Wortlaut,
  `AnfangSlot`, Klick-Test-Protokoll.
- **A×B-Wechselwirkung, in der Integration gefangen** (18.8.): der Fall
  `leser-v3-uebersicht` (c3) aus A zählte das Box-Warnfach, B nahm der Box mit Ä81
  ebendiese Ausgabe. Beide Zweige einzeln grün, zusammen rot. Behoben: (c3) zählt
  jetzt die **Seite** (1 auf der Seite · 1 im Kopf · 0 im Box-Fach, je Lage).
- **CLS-Fall `leser-r1-r2` (A9-DoD)** — der eine offen rote Fall des Standes ist
  **entschieden und grün**, s. nächster Abschnitt.

## Entscheide David (gelten, mit Wortlaut)
- **17.8.:** «**ja und c, mach so**» → H4-Flip **und** Ä60 = (c).
- **17.8.:** «**v2 gefällt mir besser aber fussnoten hochgestellt**» → F3 = V2
  (17 px / lh 1.55) + Fussnotenmarke hochgestellt.
- **18.8.:** «**pr deckel aufgehoben wenn sinnvoll**» → mehrere PRs je Etappe zulässig.
- **18.8., Auftrag:** «**fundierte Ästhetik-Prüfung an der Live-Seite + sauberer
  machen, alles richtig benannt**» → steuert die nächsten zwei Schritte (unten).

## Orchestrator-Entscheide 18.8. (delegiert, David hat Stopp-Recht)
- **Ä75** «SR» nur am Bundeserlass, kantonale Nummer nackt, **kein** erfundenes
  Ersatzkürzel (die Sammlungs-Siglen sind SG/LS/SAR/BSG, nicht das Kantonskürzel).
- **Ä81** nur der Erlass-Kopf warnt; der «Stand» bleibt in der Box (Datums-Kette).
- **CLS-Fall, Weg 3:** Verhalten bleibt (Such-Zone wächst beim Tippen um 24 px,
  B9-Regel), **Budget bleibt 0**, die Test-**Geste** wird echtes Tippen
  (`pressSequentially` statt `fill()`). Rot-Beweis: `fill()` 0.0202 gegen 0 → rot,
  echt getippt input-frei 0.0016 → grün. Die **Grösse** des Sprungs bewacht
  weiterhin `leser-v3-suchfeld-ueberall` (e) über die Zonen-Höhen 44/68 px.
  Verworfen: Weg 1 (24 px Dauer-Reserve), Weg 2 (Dauer-Zeile) — beide in §7c als
  Bauanleitung erhalten, falls David sie doch will.

## Wartet auf David — nur diese drei
1. **Ä64** Regler-Hierarchie (welcher Regler ist der obere).
2. **Ä33/Ä34** Chrome-Zielwert @390 — der Icon-Deckel (zwei reine Icons) ist
   gerissen, drei stehen im Kopf; die Zahl selbst ist ein Entscheid.
3. **Kantonale Sammlungs-Siglen** ja/nein — Registerfeld + Verifikation je Kanton
   (Datenaufgabe, H5/Korpus). Nein heisst: die Nummer bleibt dauerhaft nackt.

Alles andere aus den früheren Listen ist entschieden oder gebaut.

## Nächste Bauschritte (Reihenfolge)
1. **Live-Ästhetik-Prüfer nach dem Deploy** — Davids Auftrag, an der echten Seite,
   hell und dunkel, Handy/Split/Desktop. Nicht am Prototyp, nicht an Screenshots.
2. **Säuberungs-/H5-PR** — «sauberer machen, alles richtig benannt»:
   - Löschliste H5: alte Hülle + Flag, `LeserAnsichtMenu`/`OptSwitch`,
     `KontextPanel` samt Kante `inhalt-ansichten`, Playwright-Projekt `leser-v1`
     und `V1_PINNED`. **`BezugFacettenWahl` NICHT löschen**; 37-px-Band bleibt.
   - **Benennung:** die «V3»-Suffixe fallen, sobald es kein V1 mehr gibt;
     `data-v3-*` per Codemod auf die endgültigen Namen.
   - **Deckungslücken §7b** des Kontaktbogens abarbeiten.
   - `springeZuArtikel`-Doppel zusammenlegen · `uebersichtsZeile` ist ein toter
     Export · **drei Breiten-Messer → einer**.
   - Ä9-Rest / Ä83 (Layout) · **C5** `aria-controls` (braucht eine erzeugte id im
     Kern-Markup) · **B6-Wurzelfix** 404 von Netzfehler trennen —
     **Risikopfad `src/lib/normtext/**`, eigener PR mit Gegenprüfung**.
3. **ANHANG_DOMINANZ-Doppel** (Risikopfad, eigener PR mit Gegenprüfung).
4. **§17-Positionen:** QS-PERF (Kopf-Reflow +161 px, createRoot→hydrateRoot),
   QS-DATA-INGEST-DRIFT, PX-Lastfall (QS-E2E-STABIL), Vitest-Zeitbudgets schwerer
   Sweeps unter Parallel-Last.

## Feste Regeln (David, unverändert)
Drei Prüfer je Etappe vor Merge (Bug · Ästhetik hell/dunkel · Architektur/
Erlass-Neutralität, **anderes Modell**) → Nachzug mit frischem Agent in denselben
PR; Ä-Checkliste bis zum Schluss; Bund- + Kantons-Probe; Split-View; Suchfeld
oberstes sticky Element; Kern unangetastet ausser deklarierter Ausnahme; Golden
byte-gleich; Commit-Typen ehrlich, `-F`, nie amend/stash/reset; **§14.7 wörtlich
in jeden Sub-Agenten-Auftrag**; Unteragenten enden mit prüfbarer Rückgabe; Merge
und Aufräumen nie in einer Kommandozeile; nach Merge `state == MERGED` prüfen.

## Werkzeug-Hinweise
Deploy = CI-Job «Deploy (Prod, Vercel CLI)»; Live-Check
`curl -s https://lexmetrik.vercel.app/ | grep lexmetrik-build` == Merge-SHA.
Agenten-Briefe dieser Session unter `/Users/david/Developer/LexMetrik-briefs-2026-08-17/`.
Playwright-Port ist worktree-abhängig; der e2e-Server ist `preview` auf `dist/` →
**nach jeder `src`-Änderung `npm run build`**. Lokal offen: `git config --unset
core.hooksPath` (zeigt ins Leere, git-Hooks laufen nie — wartet auf David).
Bekannter CI-Flake `leser-ohne-gliederungslinie:71` Shard 7 →
`gh run rerun <id> --failed`.
