# Übergabe Gesetz-Leser V3 — Stand 18.8.2026 (Session 18.8., Orchestrator)

Massgeblich: `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7 Etappen/Vollzugsvermerke,
Kap. 8/9 Entscheide, Kap. 12/14) + Kontaktbogen `…/leser-v3-h4/README.md`. Diese
Datei ersetzt `…-handoff-2026-08-17.md` (git-Historie).

## Wo der Leser steht
**V3 ist seit H4 der Standard-Leser** (`src/pages/GesetzLeser.tsx`, Grundzustand
`'v3'`; David-Ja 17.8. «ja und c, mach so»). `?leser=v1` ist der Rückweg bis
**H5** — dort fallen alte Hülle, Flag und das Playwright-Projekt `leser-v1`.
**Ä60 = (c)** gebaut: Rahmen bis 84 rem, Beiwerk-Blatt in eigener Spur, verdeckt
ab 1024 px Fensterbreite **0 px** statt 320/257/192/112.
**Gelandet auf main:** `#539 H2` 19a989f93 · `#547 S1` 2538dd356 · `#548 H2b`
98558b561 · `#549 H3` 2992501b0 · `#550 S2` afc008c19 · `#551 Nachzug` f225f9c5d.
Ästhetik: H1 5,5 · H2 6,0 · H2b 6,5 · H3 6 · S1 8 · S2 7 · Nachzug 7 · **H4 7,5**.

## Offen im PR (Branch `feat/leser-v3-h4-vorbereitung-2`)
H4-Flip + Rahmen (c) + Handy-Öffner (NM-2: 1 Tap statt 2) + **Nachzug A und B**;
PR-Body: `/Users/david/Developer/LexMetrik-briefs-2026-08-17/h4-pr-body.md`.
- **Prüfer:** Bug 2 Befunde, beide **vor** Merge behoben · Ästhetik **7,5/10** ·
  Architektur **7/10 «ja mit Nachzug»** · Klick-Test **186 Bilder** (Befund A1
  betrifft V1, zurückgestellt, weil V1 mit H5 fällt). **Nachzug A:** Kopf-/
  Gliederungswege, Ä89, Ä90, `data-toc-baum`. **B:** Ä81, Schalter-Wortlaut,
  `AnfangSlot`, Protokoll.
- **A×B-Wechselwirkung, in der Integration gefangen:** `leser-v3-uebersicht` (c3)
  aus A zählte das Box-Warnfach, B nahm es mit Ä81 weg — einzeln grün, zusammen
  rot. (c3) zählt jetzt die **Seite**: 1 Seite · 1 Kopf · 0 Box, je Lage. Zweiter
  Fund: `check:e2e-shards` rot — `shard-gruppen.json` hinkte der Annotation nach.

## Säuberung nach der Live-Prüfung (18.8.2026, Branch `feat/leser-v3-saeuberung-bau`)
Auftrag David wörtlich: «… es nochmals sauberer gemacht werden soll. alles
richtig benannt usw.» Grundlage: Live-Protokoll
`…/leser-v3-h4/aesthetik-live-2026-08-18.md` (Note **8/10**, Ä97–Ä125).
Vollzugsvermerk mit Tabelle Ä | vorher | Fix | Spec: **Fahrplan Kap. 7**,
Abschnitt «✅ Säuberung nach Live-Prüfung (18.8.2026)».
- **18 Ä-Zeilen geschlossen**: Ä97 · Ä98 · Ä100–Ä103 · Ä106–Ä108 · Ä110–Ä112 ·
  Ä114–Ä117 · Ä119–Ä122 (Beschriftungen, Doppelungen, Zeichen-Flut; kein Layout,
  keine Struktur, keine Rechenlogik).
- **NEU: das Benennungs-Glossar ist die eine Wahrheit** —
  `…/leser-v3-design-grundlage.md` **Kap. 11 «Benennung (Glossar, 18.8.2026)»**,
  bewacht von `src/tests/leser-benennung.test.ts`. Wer eine Beschriftung setzt,
  schlägt dort nach; wer ein Wort ändern will, ändert es dort zuerst.
- **Wichtig für jede Folge-Session:** vier Namen unterscheiden sich jetzt je
  Hülle (V3 ≠ V1). Die eine Quelle für e2e-Locators ist
  `e2e/helpers/leserBeschriftung.ts` — **nie** wieder ein Literal in die Spec.
  Sie fällt mit H5 ersatzlos weg.
- **Davids Regel «Suchfeld oberstes sticky Element» ist am gebauten Stand NICHT
  eingelöst** (Ä99). Gemessen klebt die GANZE Seitenleiste, samt Übersichtsbox:
  `sticky` sitzt am `<aside data-v3-aside>`, nicht am Baum. Die Doku behauptete
  bis 18.8. das Gegenteil («scrollt MIT weg») — **korrigiert und datiert**
  (Fahrplan Kap. 4b + Ä81-Vermerk). **Der Bau ist offen (H5)** und ist eine
  Layout-Frage, keine Beschriftungsfrage: entweder die Box aus dem
  Sticky-Container lösen oder «die Leiste klebt als Ganzes» als Entscheid
  festschreiben. Das gehört David vorgelegt, weil es seine Regel berührt.
- **Offen aus derselben Prüfung (H5):** Ä104 (Treffer im Randtitel markieren =
  Suchlogik) · Ä105 · Ä109 · Ä123 · Ä124 · Ä125 · die **App-Hälften** von
  Ä110/Ä111/Ä112/Ä118 (`components/layout/**`, `NormPopover`, `NormChip`) · der
  Jargon «Fedlex-Graphen (SR-Taxonomie)» im Revisions-Sidecar (Risikopfad).
- **Bei David:** Ä113 (= Ä64) Regler-Hierarchie bei 130 % · Ä33/Ä34 Chrome @390.

## Entscheide David (gelten, Wortlaut)
- **17.8.** «ja und c, mach so» → H4-Flip **und** Ä60 = (c).
- **17.8.** «v2 gefällt mir besser aber fussnoten hochgestellt» → F3 = V2
  (17 px / lh 1.55), Fussnotenmarke hochgestellt. **18.8.** «pr deckel aufgehoben
  wenn sinnvoll» → mehrere PRs je Etappe zulässig.
- **18.8., Auftrag:** «fundierte Ästhetik-Prüfung an der Live-Seite + sauberer
  machen, alles richtig benannt» → steuert die nächsten zwei Schritte.

## Orchestrator-Entscheide 18.8. (delegiert; David hat Stopp-Recht)
- **Ä75** «SR» nur am Bundeserlass, kantonale Nummer **nackt**, kein erfundenes
  Ersatzkürzel (die Siglen sind SG/LS/SAR/BSG, nicht das Kantonskürzel).
- **Ä81** nur der Erlass-Kopf warnt; der «Stand» bleibt in der Box (Datums-Kette).
- **CLS-Fall `leser-r1-r2`, Weg 3:** Verhalten bleibt (Such-Zone wächst beim
  Tippen um 24 px, B9-Regel), **Budget bleibt 0**, die Test-**Geste** wird echtes
  Tippen (`pressSequentially` statt `fill()`). Rot-Beweis: `fill()` 0.0202 → rot,
  echt getippt input-frei 0.0016 → grün. Die **Grösse** des Sprungs bewacht
  `leser-v3-suchfeld-ueberall` (e) über die Zonen-Höhen 44/68 px. Verworfen:
  Weg 1 (24 px Dauer-Reserve), Weg 2 (Dauer-Zeile) — beide in §7c als Bauanleitung.

## Wartet auf David — nur diese drei
1. **Ä64** Regler-Hierarchie.
2. **Ä33/Ä34** Chrome-Zielwert @390 — der Icon-Deckel (zwei reine Icons) ist mit
   drei Icons gerissen; die Zahl selbst ist ein Entscheid.
3. **Kantonale Sammlungs-Siglen** ja/nein — Registerfeld + Verifikation je Kanton
   (H5/Korpus); «nein» heisst, die Nummer bleibt dauerhaft nackt.
Alles Übrige aus den früheren Listen ist entschieden oder gebaut.

## Nächste Bauschritte
1. **Live-Ästhetik-Prüfer nach dem Deploy** — an der echten Seite, hell und
   dunkel, Handy/Split/Desktop. Nicht am Prototyp, nicht an Screenshots.
2. **Säuberungs-/H5-PR** («sauberer machen, alles richtig benannt»):
   - Löschliste H5: alte Hülle + Flag, `LeserAnsichtMenu`/`OptSwitch`,
     `KontextPanel` samt Kante `inhalt-ansichten`, Projekt `leser-v1`,
     `V1_PINNED`. **`BezugFacettenWahl` NICHT löschen**; 37-px-Band bleibt.
   - **Benennung:** «V3»-Suffixe fallen mit V1; `data-v3-*` per Codemod.
   - Deckungslücken §7b · `springeZuArtikel`-Doppel · `uebersichtsZeile` (toter
     Export) · **drei Breiten-Messer → einer** · Ä9-Rest/Ä83 · **C5**
     `aria-controls` (braucht erzeugte id im Kern-Markup).
3. **Risikopfade, je eigener PR mit Gegenprüfung:** **B6-Wurzelfix** (404 von
   Netzfehler trennen, `src/lib/normtext/**`) · **ANHANG_DOMINANZ-Doppel**.
4. **§17:** QS-PERF (Kopf-Reflow +161 px, createRoot→hydrateRoot),
   QS-DATA-INGEST-DRIFT, PX-Lastfall (QS-E2E-STABIL), Vitest-Zeitbudgets.

## Feste Regeln (David, unverändert)
Drei Prüfer je Etappe vor Merge (Bug · Ästhetik hell/dunkel · Architektur/
Erlass-Neutralität, **anderes Modell**) → Nachzug mit frischem Agent in denselben
PR; Ä-Checkliste bis zum Schluss; Bund- + Kantons-Probe; Split-View; Suchfeld
oberstes sticky Element; Kern unangetastet ausser deklarierter Ausnahme; Golden
byte-gleich; Commit-Typen ehrlich, `-F`, nie amend/stash/reset; **§14.7 wörtlich
in jeden Sub-Agenten-Auftrag**; Unteragenten enden mit prüfbarer Rückgabe; Merge
und Aufräumen nie in einer Kommandozeile; nach Merge `state == MERGED` prüfen.

## Werkzeug
Deploy = CI-Job «Deploy (Prod, Vercel CLI)»; Live-Check `curl -s
https://lexmetrik.vercel.app/ | grep lexmetrik-build` == Merge-SHA. Briefe unter
`/Users/david/Developer/LexMetrik-briefs-2026-08-17/`. Playwright-Port ist
worktree-abhängig; e2e-Server ist `preview` auf `dist/` → **nach jeder
`src`-Änderung `npm run build`**. Neue e2e-Spec → `// @shard-gruppe: N` in Zeile 1
**und** `npm run gen:e2e-shards`, sonst `check:e2e-shards` rot. Lokal offen
(David): `git config --unset core.hooksPath`. CI-Flake
`leser-ohne-gliederungslinie:71` Shard 7 → `gh run rerun <id> --failed`.
