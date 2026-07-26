# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, AG-/GMBH-GRUENDUNG, BGER-RECHTSWEG,
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN, FUNDAMENT-UMBAU). Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026; mechanisiert 10.7.2026,
QS-TOK/T1):** Dieses Dokument wird in jeder Session und jedem Subagenten gelesen —
Karten abgeschlossener Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU
nach `archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt der
Verweis-Abschnitt. Neue Karten werden am Anker `<!-- KARTEN -->

## Session 26.7.2026 (Parallel-Worktree) — Reader-Fix: Bild-Blöcke verschluckten ihre items — amtliche <dl> unsichtbar (DBG 22, STHG 7) (PR #372, offen)
**Auftrag David:** vorbestehenden main-Defekt aus der FN-5-Gegenprüfung (26.7., Runde 2) reproduzieren, fixen, e2e-Wächter, korpusweit zählen. `ArtikelBody.tsx` kehrte bei `bild`/`bildKacheln` früh zurück und renderte `b.items` nie — die amtliche Aufzählung am Formelbild («Ist diese Rendite negativ oder null, so beträgt der Ertragsanteil null Prozent.») fehlte im Reader (§1/§8).
- **Repro bewiesen:** neuer Wächter `e2e/bild-block-items.e2e.ts` gegen gebautes dist VOR dem Fix rot gezeigt (§6.7), danach grün; in Shard-Gruppe 1 (Union-Wächter grün).
- **Fix (§3, reine Darstellung):** Item-Renderpfad als geteilte `itemListe` extrahiert (EINE Stelle, §5; Code unverändert verschoben); Bild-Blöcke rendern Bild UND danach ihre items über genau diesen Pfad. Itemlose Bild-Blöcke DOM-identisch (eigener Zweig, exakt bisheriges Markup).
- **Korpus-Zählung:** 277 Bild-/Kachel-Blöcke (3318 JSON, alle 21 bild-tragenden Dateien erfasst), genau **4 mit items** — DBG 22 Blöcke 3+4, STHG 7 Blöcke 4+5 (10 Items); 0 titel-Blöcke mit items.
- **Beweis:** `npm run gate` GRÜN (tsc · vitest 275/4389 · golden byte-gleich · lint · check 37/37 inkl. gegenpruefung) · volle e2e-Suite lokal **309/309 grün** (7.6 min) · Screenshot dist DBG 22. Gegenprüfung n/a — keine Risiko-Pfad-Globs im Diff.
- **Nachzug in derselben Session (FN-5 #371 landete VOR #372):** origin/main in den Branch gemergt — FN-5-Inline-Marker in die `itemListe`-Struktur integriert (`segmentiert` auf Komponenten-Ebene, Item-Platzierung + vglFnNr-Endmarker-Merge unverändert übernommen; Merge `1d2c6da9`). **B1-Riegel nach Slot getrennt gelockert** (ArtikelLeser.tsx): Item-pos auf Bild-Blöcken routet wieder wortgenau inline — fn 57 sitzt jetzt AM Rendite-Item statt (via Legacy-`absatz='3'`) am Ende des Abs.-3-Fliesstexts zwei Blöcke darüber; Absatz-Text-pos auf Bild-Blöcken + titel-Blöcke bleiben verworfen. Wächter geschärft (fn57/fn27 genau einmal im Rendite-Item); FN-5-B1-Assertion unverändert, Titel/Kommentar als deklarierte Änderung nachgezogen.
- **Erneute adversariale Gegenprüfung des Routings (Opus, 3 Linsen): Routing BESTANDEN** — Spiegel-Korrektheit exakt (inkl. titel:null-/leere-Kacheln-Fallen, korpusweit 0 Vorkommen), kein Verlust/kein Doppel (continue + itemInlineGesetzt, beide Fallback-Wege sauber), Regressions-Radius exakt {DBG 22 fn57, STHG 7 fn27}, 0 weitere pos auf Bild-/titel-Blöcken (16'894 pos gescannt). **Zwei Ernst-Befunde behoben:** (B2) falsche Lockerungs-Begründung in Dossier/Kommentaren korrigiert (Legacy = Absatz-Ende, nie falsches Item); (B3) Zitier-Marken auf Bild-Block-Items unterdrückt — beide «Ziff. 2» hätten identisch «Art. 22 Ziff. 2 DBG» kopiert, eine amtlich nicht existierende Fundstelle (§1/D1). Restbefund (Hinweis, ausgelagert): `tiefe` fehlt bei Fortsetzungs-Ziffern der Bild-Block-Staffeln → Einrückung/Kette unvollständig (korpus-werkstatt). Dossier-Nachtrag in `bibliothek/normen/fn5-wortgenaue-marker-2026-07-26.md`.
## Session 26.7.2026 (W2·5i H1-Befund) — Revisions-Extrakt erkennt «in Kraft vom X bis zum Y» + Fremd-Adressierungs-Wächter (PR offen)
**Auftrag David:** Befund aus der H1-Gegenprüfung (W2·5i): `TRIGGER_RE` in `src/lib/verzahnung/revisionen-extrakt.ts` kennt die amtliche befristete Form «in Kraft vom X bis zum Y» nicht (AHVG 34bis, VTS 95) — solche Fussnoten landen in der Chronologie-Ansicht unter «ohne Datum» (falsche Ordnung, §1). Deklarierte fachliche Änderung mit Golden-Wirkung (kein Refactoring, §6.3).
- **TDD (Fixtures = amtliche Wortlaute, §7):** Trigger «in Kraft vom» + Jahr-Ellipse «vom 21. März bis zum 20. Sept. 2020» (Jahr nur beim Enddatum, gilt für beide; ohne Sonderform griffe der Parser das ABLAUF-Datum). Abweichung zum Auftrag offengelegt: AHVG 34bis endet amtlich 31.12.**2033**, nicht 2030.
- **Gegenprüfung Opus, 2 Runden, frischer Kontext:** R1 **widerlegt** — F1 Scope-Leak: «Art. 40c in Kraft vom …» (Gliederungstitel-Fussnote, Sidecar-Host Art. 39) ist FREMD-adressiert; mein max-Ansatz kippte AHVG 39 auf 2025 statt amtlich 2024, der eigene Test zementierte den Fehler. Fix: host-bewusster Wächter `ART_PRAEFIX_RE` (Klausel mit unmittelbar vorangestelltem «Art. \<Nr\>» zählt nur bei Token-Gleichheit; korpusweit 2 Fälle: AHVG 39→40c, OR 732→734f — OR-Golden unverändert, max griff dort zufällig richtig). R2 **bestanden** (17 Artikel/14 Erlasse live re-deriviert VOR Shard-Einsicht; Kollateral-Lauf über alle 202 Sidecars; Präfix-Fenster-Angriff 9 Randfälle; AIG «Art. 127 hiernach» feuert korrekt nicht). Quittiert, `check:gegenpruefung` grün (Hash 76b9d441c766…).
- **Golden-Delta (deklariert):** 19 Shards, **35 Artikel neu datiert + 6 auf späteres max-Datum, 0 Verluste** (u. a. AHVG 34bis 2025-01-01 · AVIG 35 2025-09-27 · KVG 106 2015-01-01). VTS 95/AHVV 41bis unverändert — Schwester-Fussnoten lieferten schon dasselbe/ein späteres Datum (max-Logik, verifiziert).
- **§11-Ablage:** `bibliothek/normtext/artikel-revisionen-fussnotenformen-2026-07-26.md` (+ INDEX) — Zensus der erkannten 3 Formen + Wächter + **Rest-Familie 46 Artikel / 11 nicht erkannte Varianten** («, Kraft seit», «trat am … in Kraft», «In Kraft seit» …) als deklarierter Folge-Schritt über den ROADMAP-Eingang.
- **Beweis:** vitest 276 Dateien / 4417 Tests grün · `check:artikel-revisionen` synchron (202/12 939) · lint 0 Fehler · tsc sauber · `check:bibliothek` grün. Kollision geprüft: PR #375 (H1-UI) berührt die Kernflächen nicht, nur `bibliothek/INDEX.md` überlappt trivial (serielle Landung).
- **Offen:** Rest-Familie (46 Art.) als eigener Schritt · `check:fedlex-versionen` rot wegen nicht-kanonischer Pins `voeb`/`chemrrv` (präexistent, ausserhalb dieses Diffs; Befund des Prüf-Agenten) · OR 734f bleibt undatiert (Abschnitts-Fussnote hängt im Sidecar nur an 732 — Attributions-Grenze, nicht Parser).

## Session 26.7.2026 (W2·5d/FN-5 + QS-TOK) — wortgenaue Fussnoten-Marker gelandet (PR #371, Squash `47c5e89d`) + Chronik-Rotation (PR #370)
**Auftrag David:** «bau» + «run till dry». Abgearbeitet in Queue-Reihenfolge: QS-TOK-Pflege, dann FN-5/M14 (expliziter Bau-Auftrag David 25.7. «nächste session … am richtigen ort»).
- **PR #370 (gemergt):** Rule-6-Chronik-Rotation QS-CURRENCY + R-RICHTER Block A; Steuerung byte-neutral bewiesen (plan:next byte-identisch, check:plan grün, Checkboxen 24/39). **Rest-Befund:** ROADMAP bleibt mit ~157 KB über dem 100-KB-Wächter-Budget — verbleibende Masse ist Steuerungs-Prosa OFFENER Schritte (Intake-Dekrete 24.–26.7.), die die T7-Konvention im Plan behält; tiefere Diät (Verlagerung in FAHRPLAN-Dateien oder Budget-Anhebung) = **David-Entscheid, offen**.
- **T14-Stufe-1 kein Neubau:** `parts.tsx` ist längst 12-Zeilen-Fassade über `parts/`, `inhalt.tsx` mit 793 Z. unter der §6.6-Schwelle — durch frühere Hygiene-Slices de facto erledigt.
- **PR #371 (gemergt = deployt):** FN-5 als **Sidecar-Variante der M14-Spec** (§7-Abweichung vom ROADMAP-Wortlaut «Haupt-Snapshot-Diff» offengelegt — Snapshots byte-unverändert): `fussnoten-offsets.ts` (Platzhalter-Parse U+E000/E001 durch die UNVERÄNDERTE Pipeline + Zwei-Zeiger-Ausrichtung; Offset NUR bei zeichengenau bewiesener Gleichheit, sonst Fallback), Sidecar-Feld `pos{b,it,o,l}` mit `l`-Drift-Riegel, Reader-Segmentierung (ArtikelLeser-Routing + ArtikelBody-Segmente durch die bestehende verlinkt/gruppiere-Pipeline). **16'894 Marker wortgenau** (97.7 % der text-verorteten; `<dt>`-Marken 3'799 + Kopf/Sektion 10'453 ausgewiesen ohne Textstelle). Differ-Beweis 227/227 Sidecars: nur `erzeugt`+`pos`.
- **Gegenprüfung (Opus, frischer Kontext, 3 Runden):** R1 **widerlegt** — B1 Marker-Verlust bei `pos` auf Bild-/Titel-Block (DBG 22 fn57, STHG 7 fn27) → Routing-Riegel + e2e-Wächter; Engine selbst 14/14 Re-Derivationen + Kreuzprüfung ALLER 16'894 pos, 0 unerklärte Abweichungen. R2/R3 **bestanden** (Fix-Simulation 31'146 Fussnoten, Guard-Spiegelung 69'469 Blöcke, Divergenz 0). Zweite Linse Sonnet-Code-Lupe: befundfrei bis auf JSON-Einrückung (gefixt). Register-Zeile committet; Merge-Schutz-Required grün (Trailer-Block-Falle: Leerzeile vor Co-Authored-By zerreisst `%(trailers)` — gelöst).
- **Beweis:** volle §9-Batterie grün (tsc · vitest 4400+ · lint · build · golden byte-gleich · 37 Checks · perf-budget); e2e: CI-8-Shard-Wand komplett grün; lokale Volläufe je 1 last-flakiger Such-/CLS-Test (3 Läufe, 3 verschiedene, alle isoliert deterministisch grün — Maschinen-Last, kein Code). Neue Wächter: `e2e/fn5-wortposition.e2e.ts` (ZGB 798a fn667 mitten im Satz · KKV-FINMA 60 fn14 · DBG-B1-Fall) + 12 Unit-Negativfälle.
- **Ausgelagert (Chips):** B4 Fedlex-Quell-Artefakte (ARGV5 «20006», VSTV «Anteilsan») · vorbestehender Defekt «items auf Bild-Blöcken unsichtbar» (DBG 22/STHG 7, schon auf main). Dossier: `bibliothek/normen/fn5-wortgenaue-marker-2026-07-26.md`.

## Session 26.7.2026 (QS-OPT) — CI flüssiger: e2e-Wand geachtelt + Bau/Tore-Split, PR-Lauf ~30 → ~10 min (PR #367, Squash `d2e576b1`)
**Auftrag David:** «alles zu kompliziert … CI-Checks gehen regelmässig 20 Minuten … muss flüssiger werden … drastischere Änderungen, nur Nötiges.» Befund aus echten Lauf-Daten (Lauf 30175300387, 29.6 min grün): `tore` (5.5 min, alle Node-Checks) lief seriell VOR den Shards; die 3er-Shards waren nach LOKALEN Dauern gepackt, real 11.8/15.5/21.0 min; Perf wartete aufs langsamste Shard. Die 59 check:*-Tore kosten zusammen <6 min und sind NICHT der Engpass.
- **8 statt 3 Shards**, LPT-gepackt aus CI-GEMESSENEN Spec-Dauern der `playwright-report-gruppe-*`-Artefakte (56 Specs, 44.0 min Gesamttestzeit, Makespan 6.4 min, Rest je 5.4). Union-Wächter unverändert scharf. Reine Verteilung, kein Test/Timeout/Umfang (§6.3).
- **Neuer `bau`-Job** (nur Build + dist-Artefakt); `tore` läuft parallel zu den Shards, Tor-Umfang unverändert (R1-Lehre: Tore streichen ist die falsche Vereinfachung). Kein needs/dist-Download in `tore` — Review-Beleg: kein einziger tore-Check liest `dist/`.
- **Perf nur noch auf main/merge_group** (Entscheid David 26.7.); Review-Nachzug: `cancel-in-progress` gilt nicht mehr für main-Läufe, sonst hinterliesse ein schneller Folge-Merge einen Deploy-Stand ohne §15-Messung.
- Beweis: volle §9-Batterie lokal grün (tsc · vitest · golden · lint · build · 37 Checks · perf-budget · 314 e2e); adversariales Review (Blocker: Kontext-Umzug nötig · Ernst: Cancel-Lücke → behoben); zwei CI-Läufe grün, zweiter ~10 min Wandzeit.
- **Offen:** Branch-Schutz-Kontexte `/3`→`/8` + neuer Name `Tore (Tests · Lint · Checks)` + Perf raus — API-PATCH vom Berechtigungs-Classifier blockiert, Handschritt/Freigabe David; bis dahin hängen Code-PRs auf «expected». `ci-doku-noop.yml`-Zwilling in dieser Session nachgezogen (Teil des Rotations-PRs).

## Session 25.7.2026 (W2·5) — Kanton-Volltext im Suchindex: 54 444 Artikel statt 25 389, Ranking-Regression gefunden und behoben (PR #365, offen)
**Auftrag David:** erst PR #364 landen (erledigt, `dd624ee7` auf main), dann W2·5-Restposten «Kanton-Volltext im Index nachziehen». Auflagen: Ebene nirgends mehr hartcodiert · kantonaler Treffer als kantonal erkennbar mit Kanton · Index-Grösse messen und melden statt still kürzen · kein Erlass darf stillschweigend wegfallen. W2·5b/5c/5d/5g/5h/5i und die zehn unverlinkten FAHRPLAN-Dateien unberührt gelassen.
- **Ebene ist jetzt Parameter, nicht Literal.** `EBENEN = ['bund','kanton']` → `baueEbenenIndex(ebene)` → `baueIndex()`; Artefakt `public/such-index/artikel-bund.json` → `artikel.json` (Prod-Smoke-Pfad mitgezogen). **54 444 Artikel: Bund 25 389 + Kanton 29 055 aus allen 26 Kantonen** (1 231 kantonale Erlasse).
- **Herkunft ehrlich (§8):** Einträge tragen `eb`/`kt`; Treffer nennt den Kanton doppelt — Label «· AI» **und** Marke «AI» **ohne** `redundant`, weil `redundant: true` die Marke auf Mobile ausblendet (`SuchResultate.tsx`) und ein Handy-Nutzer die Herkunft sonst komplett verlöre. href auf `/gesetze/<eb>/<key>`.
- **Der eigentliche Fund — Ranking-Regression, gefunden weil das Testset auf den VOLLEN Index umgestellt wurde:** «Miete» fand OR 253 nicht mehr. FlexSearch kappt **je Feld** bei `limit`; im gemeinsamen Index teilten sich die Ebenen das Kontingent, 193 kantonale Gliederungs-Treffer drückten OR 253 im `g`-Feld von Rang 259 auf **339** — aus dem 300er-Fenster. OR 253 führt «Miete» nur in der Gliederung, war also unauffindbar. **Fix: ein FlexSearch-Index je Ebene** (Bund-Recall exakt wie vorher, unabhängig vom kantonalen Volumen) + Tiebreak **Bund vor Kanton** bei gleicher Themennähe (`EBENEN_RANG`) statt Key-Alphabetik («AG-291.150» < «AHVG»). Danach «Miete» → OR 253 **Rang 1**.
- **Kein stiller Verlust:** Generator protokolliert jede nicht indexierte Datei mit Grund (`unlesbar`/`kein-eintraege-array`/`kein-volltext`) im Artefakt und in der CLI-Ausgabe — vorher schluckte `catch { continue }` kaputtes JSON spurlos. Real übersprungen: **genau eine** Datei, `kanton/index.json` (URL→Datei-Karte, kein Erlass). Neues Tor prüft gegen `register.json` in beide Richtungen; **§6.7-Sabotage gefahren** (Erlass fallen lassen → rot; `kt` blanken → 1 229 rot).
- **Geräte-Last gemessen (§15), nicht geschätzt:** **25.97 → 47.96 MB** roh, **5.44 → 9.94 MB** gzip (+83 %). **Lazy-Loading hält:** Vollaufbau von `/gesetze` löst empirisch **0** Index-Anfragen aus, der Index lädt erst beim ersten Tastendruck — First Paint unberührt. **Browser-Beweis:** «Handänderungssteuer» liefert jetzt AI-/AR-Steuergesetzartikel, Klick landet auf `/gesetze/kanton/AI-640.000#art-116`, keine Konsolenfehler.
- **Beweis:** `npm run gate` voll grün (tsc · vitest 274 Dateien/4389 Tests · lint · check 37/37) · `check:suchindex` grün · **Golden byte-gleich 249/249** · `check:gegenpruefung` grün (kein Risiko-Pfad berührt, daher kein Gegenprüfungs-Protokoll).
- **CI war ROT (Browser-Smoke Shard 1/3, dadurch `Perf-Budget` übersprungen) — Ursache gemessen und behoben.** Drei Such-Specs liefen nach 2 Retries in `Timeout: 10000ms` mit `Received: 0`: keine falsche Erwartung, keine Flakiness, sondern der auf **3 153 → 6 143 ms (+95 %)** gestiegene clientseitige FlexSearch-Aufbau (Query selbst 2.8 → 4.3 ms, vernachlässigbar).
- **Nachtrag David (3 Aufträge, alle erledigt).** **(1) Gestaffelter Aufbau** (`baueSucher` inkrementell, Doc-IDs = globale Positionen → Kanton rückt nach, ohne den Bund-Index neu zu bauen): Bund zuerst, Kanton in 2000er-Häppchen mit Yield. **Der volle Index wird weiterhin vollständig geladen — gestaffelt ist nur der Zeitpunkt, nicht der Inhalt.** Beide Auflagen gegated (`gestaffelterIndex.test.ts`, 8 Tests): der Teilzustand ist in der Trefferliste sichtbar (`hinweis` «Kantonale Erlasse werden noch geladen — kantonale Treffer fehlen hier noch», plus «— wird noch ergänzt» in der Kopfzeile), **und die Gruppe bleibt auch bei NULL Treffern stehen** — sonst verschwände bei einer rein kantonalen Query der Hinweis mitsamt der Gruppe und die Suche behauptete stumm «nichts gefunden» über ungelesenen Bestand. Neuauswertung läuft automatisch: neues `ArtikelSuche`-Objekt → neue Identität → React-Memo rechnet neu, niemand muss nochmals tippen. **(2) Index-Grösse im Perf-Budget** (`check:perf-budget`, Deckel 10 400 KB gzip bei heute 9 667 KB — hergeleitet aus ~3.6 KB gzip je Kanton-Erlass ⇒ ~200 weitere Erlasse Luft; Sabotage-Probe rot gezeigt). **(3) Ebenen-Tiebreak** als provisorische Anzeige-Ordnung gekennzeichnet, Logik unverändert — mit dem Vermerk, dass er in Gebieten kantonaler Zuständigkeit (EG-Gesetze, Notariat, Steuern, Gerichtsorganisation) die einschlägige Norm systematisch nach hinten schiebt.
- **Zeitmessung im Browser (lokal, `vite preview`):** erste Trefferanzeige **5 328 → 3 668 ms**, Kopfzeile mit Aufschlüsselung **5 344 → 3 941 ms** — beide zurück auf Bund-Niveau bei vollem Inhalt. Volle E2E-Suite lokal **314/314 grün**.
- **Offen für David:** ob ~9.7 MB gzip bei der ersten Suche tragbar sind · ob «Bund vor Kanton» die gewollte Relevanz-Politik ist. **Befund nebenbei:** `check:suchindex` hängt in **keiner** Gate-Kette (`check:seriell` kennt es nicht) — Index-Drift ist heute ungetestet, ausser jemand ruft es von Hand.

## Session 25.7.2026 (A4) — Reglements-Aufteilung geprüft, Lücken geschlossen: CLAUDE.md 384→202 Z., Prozeduren in Skills (PR #362 gemergt, `518a41f2`)
**Auftrag David:** Ausserhalb von Claude Code eingespielte Markdown-Änderung prüfen (kein fremder WIP): CLAUDE.md auf die Invarianten kürzen, Prozeduren in Skills; §-Nummern §1–§16 beibehalten, weil ~200 Verweise darauf zeigen. Alte Fassung gesichert unter `.scratch/CLAUDE.md.vor-a4`.
- **Paragraph-für-Paragraph-Abgleich alt→neu: kein Substanzverlust.** §1/§2/§3/§5/§8/§11 vollständig in der CLAUDE.md geblieben · §4+§6 → Skill `refactoring` (alle sieben Unterpunkte inkl. Fassaden-Muster, Tor-Bedingungen a–d, Sabotage-Probe) · §7-Quell-Wahl + die sechs Build-Regeln → `korpus-werkstatt` (Kernsatz + Zitat-Ausnahme a–d bleiben Invariante in der CLAUDE.md) · §9 → `deploy-check` · §10/§14.1–§14.6 → `auftrag` · §12 → `landung` · §15 → `perf` · **§14.7 Vertrauensgrenze bewusst in der CLAUDE.md geblieben** (Sicherheitsklausel, die erst bei der Tätigkeit lädt, kommt zu spät). §13-Operativregeln liegen belegt in `DESIGN-REGLEMENT.md` (A1/A4/B1/B3/C2/D1/D2/E1/E2/F7 verifiziert).
- **Vier echte Lücken gefunden und geschlossen:** (1) **STRUKTUR-Pflicht** war auf einen DoD-Halbsatz eingedampft — Parallel-Session-Pflicht, «nur die fehlende Karte nachtragen» und `npm run struktur:aktuell` als Ziff. 4a in `auftrag` wiederhergestellt · (2) §6.7 lit. c hatte den Erzwingungs-Mechanismus `check:ci-laeufe`/`waechter.yml` verloren → in `refactoring` Ziff. 7 zurück · (3) §7-Quell-Wahl-Belege (Memory `extraktion-amtliche-quellen-beste-option`, `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur-Entscheid`, `FAHRPLAN-DATENHALTUNG.md`) → in `korpus-werkstatt` zurück · (4) §14.4-Detailquelle `docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md` → in `auftrag` zurück.
- **Ein Fehlverweis + 12 hängende Rückverweise korrigiert.** `auftrag` zeigte für die Bibliotheks-Ablage auf §9 statt §11. Die Skills `korpus-werkstatt` (6 Stellen inkl. Unterdateien), `lehren` (3), `deploy-check` (2) und `docs/token-oekonomie/dispatch-template.md` zeigten auf CLAUDE.md-Inhalte, die es dort nicht mehr gibt (§7 Build-Regeln, §6.5, §13 Ziff. 6, Kopf-Abschnitt «STRUKTUR.md aktuell halten», `HANDLUNGSPLAN.md`). **Neu: §-Konkordanz-Tabellen** in `refactoring` (§6.1–§6.7) und `auftrag` (§14.1–§14.7) — gemessen zeigen **340** Bestandsverweise auf diese Unternummern (§6.x 219, §14.x 121), die sonst ins Leere gelaufen wären.
- **Deploy-check-Widerspruch bereinigt (Davids Ziff. 3):** ausser der bereits umgeschriebenen Kopfzeile blieben zwei Stellen — die Rationalisierungs-Zeile «§9-Grenze» (jetzt Selbstverweis auf Schritt 3) und die Nachkontrolle auf die 2026 verschwundene `HANDLUNGSPLAN.md` (→ `ROADMAP.md` + Zeiger auf die STRUKTUR-Pflicht).
- **Beweis:** `npm run gate` voll grün, vorher wie nachher (`tsc -b` · vitest **273 Dateien / 4377 Tests** · `golden:vergleich` **249/249 byte-gleich** · lint · `check` 37/37). Davids Umgebung konnte vitest/golden mangels plattformabhängiger Bibliothek nicht fahren — hier nachgeholt, nichts rot, kein Test aufgeweicht. Gegenprüfung n/a: reine Reglements-/Doku-Arbeit, kein Rechtslogik- oder Extraktionscode berührt.
- **Nachtrag (A4-Coda, PR #363 + Folge-PR):** `.gitignore` schliesst das Cowork-Statuswerkzeug aus (`COWORK*.md`, `scripts/cowork/` — betreibt David ausserhalb des Repos, nichts gelöscht). **§16-Entscheid festgehalten:** die Streichung war Absicht (Werkzeug-Regel gehört in die Werkzeug-Beschreibung), und **die Nummer 16 wird nicht neu belegt** — sonst zeigte jeder Bestandsverweis still auf eine andere Regel (Umkehrung der Unternummern-Lücke: kein toter Verweis, sondern ein lebender, der das Falsche trifft). `STRATEGIE-PLATTFORM.md` F5 entsprechend als nummerierungs-überholt markiert; **über die Inhalte des Entwurfs ist nichts entschieden**, sie bekämen bei Annahme freie Nummern ab §17.
- **Bewusst NICHT angetastet:** die zehn aus keinem ROADMAP-Schritt verlinkten `FAHRPLAN-*.md` (datierte David-Aufträge, Davids Ausschluss) · `COWORK*.md` und `scripts/cowork/` (fremder untracked Stand) · §5-Zeile zum QS-DATA-Flip-Stand und die §9-Reichweiten-Details (PR #345) — Status, nicht Invariante, gehört in ROADMAP/Fahrplan. **Offen für David:** §16 ist als «entfällt» deklariert (Context7-Regel lebt nur noch in der Werkzeug-Beschreibung), und `STRATEGIE-PLATTFORM.md` F5 schlägt weiterhin ein anderes «§16 Vorfalls-Disziplin» vor — dieser Entwurf ist damit stale.

## Session 25.7.2026 — «bau»: W2·5i H0-Trennbarkeits-Verdikt BESTANDEN (Messung, kein UI-Bau)
**Auftrag David:** «bau». §14-Protokoll: `plan:next` → QS-TOK (autonomer Rest leer) → W2·5d (Rest nur David-gegatet: L-3/FN-5/EID-Gos/Y-C) → W2·5h (dep-blockiert) → **W2·5i-HIST-ANSICHT**, dort zwingende Vorstufe **H0** (V2 §7.3: Trennbarkeit messen, BEVOR Umschalter-UI gebaut wird).
- **H0 gemessen, Verdikt BESTANDEN:** korpusweit 37'849 Fussnoten (227 Bund- + 1'189 Kanton-Sidecars) deterministisch klassifiziert (`scripts/analyse/hist-h0.ts`, 5 Klassen, Seed-Stichprobe reproduzierbar): AENDERUNG 67.0 % · VERWEIS 27.3 % · GRAUZONE ~1–3 % · ZITAT 1.7 % · UNKLAR 2.8 %. **Sicherheitsrichtung Substanz→ausblendbar: 0/60 in der von Hand gelabelten 300er-Stichprobe + Vollscan aller 25'367 AENDERUNG-Fälle (27 Risiko-Signal-Treffer einzeln durchgesehen, 732 «exotische» Fälle inventarisiert) → 2 klare (+9 grenzwertige) Fehler ≈ 0.008–0.04 % ≪ 5 %-Schwelle.** Recall ≈ 96.7 %; «aus» blendete 67 % aller Fussnoten aus (Bund 78 %).
- **Kern-Erkenntnisse:** OR/Bund ist NICHT repräsentativ — Kanton hat nur 11 % Historie, 75 % echte Verweise (Umschalter-Nutzen = Bund-Fläche). OR-Konsistenzprobe zur Intake-Zahl 778/77 ✓ (789/75). Grauzone real, aber klein und regelbasiert erkennbar (SchlB/UeB-Zeiger, «Heute:», Aufhebung-mit-Nachfolger, Wert-Provenienz) — bleibt immer sichtbar.
- **Ablage:** Verdikt + bindende H1-Auflagen 1–5 in `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md` (+ INDEX) · gelabelte Stichprobe `docs/ux-audit-2026-07/hist-h0/stichprobe-300-gelabelt.json` · Ausführungsvermerke V2 §7.3 + ROADMAP. **H1 (UI + build-seitige Klassifikation) ist NICHT gebaut** — nächste Einheit; Klassifikator-Umzug nach `scripts/normtext/` wird Risiko-Pfad (Gegenprüfung Pflicht). ZITAT-Behandlung = David-Entscheid. Gegenprüfung dieser Session: n/a — reine Messung/Doku, kein Produktiv-/Extraktionscode berührt.

## Session 25.7.2026 (III-Coda) — Feedback-Runde + Chips 1/2: Kontextfenster-Fluss, Footer-CLS, a33-Härtung (PRs #357–#359)
**Davids Vormittags-Runde:** (1) **#358** Kontextfenster-Korrektur auf sein Live-Feedback («schneidet gliederung ab»): 33vh-Slot ersatzlos raus, Panel im Fluss IM `[data-toc]`-Scroller unter dem vollen Baum (Sichtfenster 57 %→97 %); (2) **#357** Footer-CLS (Chip 2): `min-h-inhalt-region`-Token, Rot-Beweis 0.0463 → 5×/CLS 0; Rebase-Konflikt mit #358 in `tailwind.config.js` sauber aufgelöst (Slot-Token blieb draussen); (3) **#359** a33-Flake-Härtung (Chip 1) in ZWEI Kalibrier-Runden: lokal 4/4 reproduziert, gehärtet (volle Guard-Fenster-Messung, schärfer als vorher), CI deckte dann auf, dass die Spy-Pipeline unter Drossel allein >1,5 s braucht → atomare Armierung+Messung + kontrakt-treues Re-Arm; Sabotage-Proben je rot/grün, 10/10 unter 6×-Drossel. **FN-5/M14 im Bauplan verankert** (ROADMAP W2·5d: Bau-Auftrag steht, nächste Session als eigene Einheit; Chip 3 damit abgelöst). Chips 1/2 durch Bau abgelöst (IDs nach App-Neustart ohnehin verfallen). Kampagnen-Total: **21 gemergte PRs #338–#359** (zzgl. Doku-PRs), 0 rote Landungen auf main.

## Session 24./25.7.2026 (III, ABSCHLUSS) — «bau, run till dry»: 18 PRs #338–#355 · W2·12 + W2·5b komplett · W2·5d-§11 komplett · EID-1/2 · §9-Gate zu
**Abschluss-Nachtrag 25.7. (Morgen):** Weitere 4 PRs — **#352 IA-5+Y-A** (Rechtsgebiet-Kanonisierung + Kachel-Demotion, David-JA 16.7. eingelöst) · **#353 IA-6** (International-Kanonik Stufe 1, 5-Anker-Regressionsbeweis; Beifang: A35-Clear-Prädikat 15s→45s kalibriert — Clear dauert real ~16 s, Timeout war strukturell zu knapp) · **#354 FN-4/A21** (⭐ §0.2-Musterfall: Defekt durch P1-Re-Pin bereits geheilt — Korpus-Audit 0 Treffer, Regeneration byte-identisch; e2e-Wächter statt Nichts-Fix; unabhängige Orchestrator-Gegenprobe FZA/LugÜ/VZG) · **#355 IA-7** (Sidebar-Kantons-Badges, Prerender 8164/8164 identisch). **Damit W2·5d-§11 KOMPLETT (IA-1…IA-7 + Y-A/Y-B; offen Y-C St. 2), E-Reihe komplett, §12 EID-1/2 gebaut.** 3 Task-Chips für David: a33-Flake-Härtung (5 CI-Instanzen heute!) · Footer-CLS · FN-5/M14 (XL). CI-Beobachtung: a33-F2/V1-mouse.wheel-Timeout ist der dominante Flake (wandert über Shards, Reruns heilen). CLAUDE.md: nur §9-Faktenkorrektur (Required-Kontext steht); T16-Umbau bewusst an frische Session (Kampagnen-Ende + chirurgisches Risiko).

## Session 24./25.7.2026 (III-Welle-2) — «bau, run till dry»: W2·12 + W2·5b komplett, W2·5d-Welle #344–#350 (E4 · IA-3 · IA-4 · EID-1 · EID-2 · Merge-Schutz-Required)
**Nachtrag 25.7. (Nacht):** Sieben weitere PRs gelandet — **#344** Plan-Pflege · **#345** `Merge-Schutz (Required-Kontext)` als dedizierter CI-Job + echter Doku-Zwilling, danach per gh api als **7. Required Check in die Branch-Regeln** gehoben (→ §9-DAVID-GATE GESCHLOSSEN, API-verifiziert) · **#346 E4** (A32 Kontextfenster unter die Gliederung, CLS-0-Slot; A36 ZGB-TOC-Kuration render-seitig) — E-Reihe E1–E7 damit KOMPLETT · **#347 IA-3** A–Z-Register (CI fand echten CLS-Befund 0.0657 → 3-Quellen-Attribution + §15.2-Fix ohne Tor-Aufweichung; a33-Contention-Flake 2× quergeschlagen → Rerun heilte, Härtung als Task-Chip) · **#348 EID-1** Container-eIds additiv (Gegenprüfung bestanden: 15 970-Kongruenz-Stichprobe, Doppel-Section-Angriff; Annex-Grenze dokumentiert) · **#349 EID-2** Verifizier-Deep-Links «amtliche Fassung ↗» Artikel+Sektion (Gegenprüfung bestanden: 20+ Live-Proben; David-Sichtprüfung Platzierung erbeten; 1 e2e-Locator deklariert präzisiert; MM4-Flake per Nullprobe als Bestand belegt) · **#350 IA-4** Scope-Label+Chip (deklarierte Default-Scope-Änderung; Footer-CLS-Bestandsfund als Task-Chip). Bau-Agenten auf **Fable 5** (Davids Direktive), Gegenprüfungen auf Opus. 2 Task-Chips für David: a33-Flake-Härtung · Footer-CLS. T16/CLAUDE.md-§9-Text bewusst ans Kampagnen-Ende (T19 Cache-Hygiene).

## Session 24./25.7.2026 (III-Mitte) — «bau, run till dry»: W2·12-HYGIENE + W2·5b KOMPLETT (PRs #338–#343), Blanko-Go David, W2·5d E4 im Bau
**Nachtrag 25.7. (Fortsetzung derselben Session):** **M11 + M6-D gelandet** (PR #342, 3-Runden-Gegenprüfungs-Loop: R2 widerlegte ENUM-Lücke/FAMZG-Fehlziel/Bedingungssatz-False-Positive → Nachfix mit 49-Block-Korpus-Enumeration → R3 bestanden; deklarierte Folge: 59 Misch-Aufzähler-Artikel jetzt TOC-konsistent, R3-Pin-Test) · **HAENGEND-Härtung gelandet** (PR #343, kalibriert: «gen» bewusst raus [Motorwa-gen-Silbenriss], als/noch/nebst rein; No-op byte-identisch 26 206 Zeilen) · **W2·5b damit ABGESCHLOSSEN** (alle M1–M12; ROADMAP done, aus @queue) · **Plan-Korrektur:** A22/K-1 war stale «offen» — faktisch gebaut PR #213 (12.7., Git-Abgleich) · **Davids Blanko-Go 24.7.** («du hast für alles go») für alle Alt-Gates → Memory `david-blanko-go-2026-07-24` (Grenzen: fachliche Abnahme, L-3/A27-Rückzug) · **Modell-Direktive David:** Bau-Agenten auf Fable 5 («opus 5» existiert nicht — als 5er-Topmodell interpretiert), Gegenprüfung bleibt Opus · **W2·5d-Status-Audit** (Explore): E-Reihe bis auf **E4** komplett, IA-3…IA-7/Y-A-Mini/EID-1–3 offen-entsperrt · **E4 (A32 Kontextfenster + A36 ZGB-TOC-Kuration) im Bau** (Worktree `lm-e4`, Fable-Agent). Sichtprüfungs-Notiz: Browser-Pane-Screenshots bei tiefem Scroll schwarz = Tool-Capture-Artefakt, DOM/e2e massgeblich.

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026 · **10.7.2026** alle
139 Session-Karten datiert 12.6.2026–3.7.2026 (Rotations-Auftrag «Karten
≤3.7.2026 ins Archiv»; neuester Block liegt jetzt zuoberst im Archiv,
Reihenfolge unverändert). · **10.7.2026 (QS-TOK/T1, mechanisiert):** 34 Karten
≤6.7.2026 byte-genau ins Archiv rotiert (nur die drei 10.7.-Karten bleiben);
Byte-Bilanz bestätigt (kein Inhaltsverlust), Rotation läuft künftig automatisch.

## Verifikationsstand (eine Zeile)

Stand 11.6.2026: Build + 38 Prerender-Routen ✓ · Lint 0/0 ✓ · Suite 1404
grün + 2 skipped (78 Dateien) ✓ · tsc STRICT · Golden 104/104 byte-gleich ✓
· Logik-Sweep 14'448 Kombinationen ✓ — Workflow: **`npm run gate`** (bzw.
`gate:schnell` pro Iteration; leise bei Grün, volle Ausgabe nur für rote
Tore, CLAUDE.md §6 Ziff. 1/5); `npm run check` für die Offline-Checks,
`npm run check:netz` für Fedlex; vor Deploys unabhängige Review-Agents
(Skill `deploy-check`).

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
