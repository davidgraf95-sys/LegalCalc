# Übergabe Gesetz-Leser V3 — Stand 17.8.2026 früh (Session 16./17.8.)

Massgeblich sind `fahrplaene/FAHRPLAN-LESER-V3.md` (Plan, Kap. 7 Etappen mit Vollzug, Kap. 9
Entscheide, Kap. 12 Abnahme, Kap. 14 Verhältnis zu anderen Schritten) und die ROADMAP-Checkliste
`W2·5m-LESER-V3`. Diese Datei ist nur der Momentaufnahme-Zeiger für die Folge-Session.

## Gelandet (main)
- #530 Linien-Rückbau (W2·5h done) · #531 Deploy-Wurzelfix (Vercel-Ignored-Build-Step) · #532 Konzept
  + Design-Grundlage + Prototyp · #534 D0 Farbfix · #535/#538 Lehren · **#537 H1** (neue Hülle hinter
  `?leser=v3`) · **#540 S3** (Erlass-Kopf neu, Standausweis-Wortlaut, Gegenprüfung bestanden).
- Live-Stand: bis #537 live; **#540 wartet auf den Vercel-Reset** (Tageslimit 100 Deployments,
  gerissen 16.8. abends). Nach dem Reset deployt Vercel nicht von selbst — der nächste main-Merge
  löst aus; Prod-Stand-Wächter (`smoke:prod`) meldet «hinkt hinter main».

## In Arbeit
- **H2** — PR #539, Branch `feat/leser-v3-h2`, Worktree `/Users/david/Developer/LexMetrik-h2`.
  Inhalt: Trefferliste gruppiert/sortiert, Esc ohne Sprung, Highlight-Registry je Instanz
  (QS-UI-HIGHLIGHT absorbiert), S4-Sortierung (beide Hüllen), PX-Pixelvergleich (Opt-in),
  Leser-eigene Schriftskala (nur V3), Davids Anmerkungen (Gliederungs-Öffner, Klick auf Titel,
  Fussnoten-Schalter, Suchfeld ganz oben sticky, Lesespalte breiter bei zugeklappter Gliederung),
  W-1 (`--toc-deckel` in V3), Ä2/Ä3/Ä12. Drei Prüfer durch (Bug · Ästhetik 6,0/10 · Architektur
  «ja mit Nachzug» → eingearbeitet). **Letzter Stand:** Diagnose der CI-Roten Shard 7
  (`leser-r1-r2:544`, `leser-ohne-gliederungslinie:71`, alte Hülle auf OR) → Befund «kein
  H2-Defekt, Wurzel auf main» (Commit «Ae24»); Merge-Konflikt mit S3 in `v3/leserV3Modell.ts` +
  `LeserRahmenV3.tsx` ist zu lösen (beide Beiträge behalten), dann Push, CI, Merge.
- Offen für **H2b** (direkt nach H2, eigener PR, Whitelist inkl. `src/components/layout/**`):
  Ä1 (Leerzone unter dem Kopf, Krumen-Leiste zeigt in Split falschen Artikel), App-Seitenleiste im
  Leser standardmässig eingeklappt, Ä5 (Kästen/hängendes «·»), Ä8 (Hover-Block), Ä9 (doppelter
  Regler), Ä10 (Handy-Details), Ä14 (Fokusring), Ä15 (Zähler ellipsiert), Ä16 (doppeltes ✕),
  Ä17 (Kontext-Schnipsel je Artikel im Ruhezustand), Ä18 (Sheet-Reihenfolge = D), **Ä19 (im Split
  existiert kein Suchfeld — vor der Abnahme)**, Ä20/Ä21/Ä23 (Platzhalter/Doppeltitel/«Artikel»→
  Bestimmungswort bei Kantonen), Ä-(a)/(b)/(d) aus S3 (Titel-Reservierung, Datums-Mischform,
  Kürzel bei Staatsverträgen), ANHANG_DOMINANZ-Doppel (Risikopfad → Gegenprüfung).
- Danach **H3** (Panel Entscheide · Änderungen · Materialien, Lasche/Zähler, Regel «Rechtsprechung
  im Text aus ⇒ Zähler UND Lasche weg», Panel-Nachladen + SEO-Prüfpunkt, Ä4/Ä11, 3-Spalten-Grid,
  `usePopoverAutoZu`), **S1** (Historie zweiwertig, «Verweise» weg, F1/F2 ja), **S2**-Bildbogen
  (V1 19 px vs. Ist, StPO 429 + OR 336c — Davids Ja am Bild), dann Umschalt-Kriterien H4 sammeln
  (Kontaktbogen); **H4 selbst nur mit Davids Ja**, H5 spätestens einen PR danach.

## Feste Regeln (David 16.8.)
Je Etappe vor Merge **drei Prüfer** (Bug-Check · Ästhetik-Prüfer Live/Screens H/D/S ·
Architektur/Erlass-Neutralität + Wartbarkeit); Ästhetik-Checkliste Ä1–Ä24 bis zum Schluss
führen, jeder Punkt sinnvoll umgesetzt; Bund-Probe je Etappe (Gesetz + Verordnung + Staatsvertrag)
und Kantons-Probe; Split-View immer mitdenken; Suchfeld immer zugreifbar (oberstes Element im sticky
Block); wartungsarmer, änderbarer, sortierter Code; Push sparsam (Vercel-Limit); Commit-Typen
ehrlich (`refactor` nie mit Testdateien); Commit-Messages per `-F`; Merge und Aufräumen nie in
einer Kommandozeile; nach Merge `state == MERGED` prüfen, dann abräumen.

## Wartet auf David
H4-Umschalten (Ja am Kontaktbogen) · S2 (Ja am Bild) · Vercel-Wurzelfix (Dashboard/Token/Plan) ·
lokal `git config --unset core.hooksPath`.
