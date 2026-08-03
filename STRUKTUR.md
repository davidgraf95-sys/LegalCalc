# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE). Die
laufenden Fahrpläne liegen seit AP-8 der QS-TOK-Aufräumwelle (31.7.2026) NICHT
mehr im Root, sondern in **`fahrplaene/`** (Stand 3.8.2026: 27 Dateien —
NOTEBOOKLM-EINSATZ und OPENCASELAW-QUELLEN sind mit der Aufräumung 3.8.2026 nach
`archiv/` gewandert; Dateinamen unverändert, geführt über `ROADMAP.md` /
`npm run plan:next`; das Link-Tor `check:plan` scannt genau diesen Ordner). Aus der früheren Aufzählung
ist nur noch VORLAGEN-AUSBAU aktiv; GRUNDLAGEN, GMBH-GRUENDUNG, BGER-RECHTSWEG,
VERTRAGS-VARIANTEN und FUNDAMENT-UMBAU sind mit der Archiv-Welle 31.7.2026
nach `archiv/` gewandert, AG-GRUENDUNG schon am 7.6.2026. Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026; die 11 verwaisten Fahrpläne der QS-TOK-Aufräumwelle —
31.7.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026; mechanisiert 10.7.2026,
QS-TOK/T1):** Dieses Dokument wird in jeder Session und jedem Subagenten gelesen —
Karten abgeschlossener Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU
nach `archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt der
Verweis-Abschnitt. Neue Karten werden am Anker `<!-- KARTEN -->

## Session 4.8.2026 — Sichtung `musk-algorithm-skill` → §17-Fünf-Schritte-Reihenfolge im Skill `lehren`
**Eine Doku-Landung auf `main`. Kein Bau.**

- **Auftrag David:** externes Skill-Repo `malkreide/musk-algorithm-skill` (5-Schritte-Algorithmus,
  Hayal Oezkan, MIT) auf LexMetrik-Tauglichkeit sichten. Befund: als Ganzes kollidiert es mit
  §1/§4 («Vereinfachen/Löschen» vs. Korrektheit vor Eleganz); tragfähig ist nur der Prozess-Kern.
- **Entscheid David («bau variante 3»):** KEIN neuer Skill — die zugeschnittene
  Fünf-Schritte-Reihenfolge (hinterfragen → löschen → vereinfachen → beschleunigen →
  automatisieren) als §17-Anhang im Skill `lehren`, Geltungsbereich hart auf Prozess/CI/Doku
  begrenzt, `src/lib/` ausgeschlossen; Trigger in der Skill-Description ergänzt, Zeiger in der
  CLAUDE.md-Skill-Tabelle nachgezogen. Provenienz (Repo, Lizenz, Datum) steht im Anhang selbst. — Entscheide-Paket David: BMV-SSoT #422 gelandet, L-3-Versuch #423 verworfen
**Fortsetzung der Aufräum-Session (Orchestrator). Zwei PRs, fünf David-Entscheide, zwei neue Schritte.**

- **David-Entscheide umgesetzt:** B3→B19-Kette freigegeben (seriell, Überspring-Erlaubnis) ·
  LM-202 entschieden → Schritt `W2·10-UI-NAV-URL` · QS-TOK-Reste pauschal frei · BMV nachführen ·
  L-3 reaktivieren (s.u., am Live-Blick gescheitert).
- **#422 gelandet (`373d73f7f`):** BMV-SSoT-Wurzelfix — Verfallsregister-Generator keyt gegen dieselbe
  Aufhebungs-Deklaration wie das Tor (§5/§17); die Aufhebung selbst war seit #287 nachgeführt, der
  Auftragstext beruhte auf dem Register-Widerspruch. Gegenprüfung Durchgang 1 **widerlegte** eine
  Testlücke (Mutations-Matrix: 3/4 Guards ungebunden), Fix `856d87c21` (R4/R5), Durchgang 2 bestanden
  (Register `f4755e386`). Amtlich doppelt belegt: Nachfolge-Totalrevision `cc/2025/408` gleiche SR,
  in Kraft 1.3.2026 — **fehlt im Korpus** → neuer Schritt `QS-KORPUS-BMV`.
- **#423 GESCHLOSSEN, nicht gelandet:** L-3-Reaktivierung war voll gebaut+bewiesen (Tor erst rot,
  840 Auto-Guides, Golden byte-gleich, 15/15 e2e) — Davids Preview-Blick aufs ZGB bestätigte sein
  12.7.-Urteil («eine einzige linie und unbrauchbar»). A28 bleibt der Stand; neuer KONZEPT-Schritt
  `W2·5k-LINIEN-KONZEPT` (Prototypen zur David-Abnahme VOR Vollbau, nie wieder blosse Default-Umkehr).
  Nebenbefunde des Versuchs verwertet: vorbestehender Erlass-Leser-CLS 0.05–0.22 → in `W2·15-CLS`.
- **Koordination:** 3 Parallel-Sessions aktiv (W2·5d-Lanes + Bauplan-Review); Flächen abgeglichen,
  Linien-Fläche nach #423-Schliessung freigemeldet. `strict:true` bewährte sich (beide Landungen
  per update-branch). VPS-Bestellanleitung an David; Memory konsolidiert (10→8), globale
  Memory-Grundsätze in `~/.claude/CLAUDE.md` angelegt.

## Session 3.8.2026 (Abend) — Recherche externe Quellen, als Befundliste in den Plan gehoben
**Eine Doku-Landung auf `main` (`233eb8923`). Kein Bau, keine Bewertung.**

- **Auftrag David, dreistufig:** zwei Repos bewerten (`benjamin-arfa/swiss-law`,
  `rnckp/awesome-open-legal-switzerland`) → «suche weiter … Liste möglicher Funktionen» →
  Einschränkung «es soll hauptsächlich Bestehendes unterstützen» → «baue es einfach als findings
  ein, andere session soll es dann nochmals neu evaluieren».
- **Ergebnis:** [`bibliothek/recherche/externe-quellen-repos-2026-08-03.md`](bibliothek/recherche/externe-quellen-repos-2026-08-03.md)
  (~60 Abfragen, 7 Endpunkte live geprüft, HTTP-Code je Zeile) + **ein** Roadmap-Schritt
  `QS-EXTQUELLEN` im Querschnitt-Band. Vier Befunde stützen Bestehendes (Feiertags-Zweitquelle ·
  Normtext-Diff-Orakel · BFS-Gemeindeverzeichnis · kantonale Amtskreise), vier sind erweiternd
  und geparkt (SHAB-API · QR-Rechnung · eSchKG 2.2.01 · PDF/A ab BEKJ 1.7.2027), sechs
  Negativbefunde nach S5.
- **Bewusst NICHT getan:** die Befunde an bestehende Schritte angedockt oder in Bau-Schritte
  zerlegt — das ist Gegenstand von `QS-EXTQUELLEN` selbst (Anordnung David). Fünf offene Fragen
  im Dossier §5, eine davon an David: kommerzieller Betrieb? Davon hängt ab, ob `droid-f/fedlex`
  unter CC BY-NC-SA überhaupt berührt werden darf.
- **Offener Mangel, ehrlich:** `ROADMAP.md` liegt bereits über dem QS-TOK-Budget (100 KB); dieser
  Eintrag hat sie um rund 2 KB verlängert. Bewusst auf zwei Zeilen begrenzt, die Substanz liegt
  im Dossier — der Rückbau bleibt Sache von `QS-TOK`.

## Session 3.8.2026 (Tag) — Aufräum-Tag: CI-Härtung, Totcode, Roadmap-Verschlankung
**Vier Landungen auf `main`, ein Doku-Finale, ein PR im Anflug. Kein Feature-Bau.**

- **#414 gelandet (`9c63c647a`)** — Fedlex-Frische + Kanonik-Fix an 8 Pins (`zgb`, `mwstg`, `bbg`,
  `usg`, `gwg`, `kag`, `fza`, `cmr`) + Stopp des Workflow-Selbstattests. **Gegenprüfung Durchgang 1
  widerlegte den Stand** → Fix → Durchgang 2 bestanden (Register `553bdc393`).
- **#417 GESCHLOSSEN ohne Merge** — der Inhalt des `sleepy-mestorf`-Worktrees lag bereits über
  #412/#413 auf `main` (`changed_files=0`). Worktree und Branch entfernt.   `QS-AUTOMATIK-BERICHT` (Verwaiste-Worktree-Sonde; am selben Tag mit dem Wächter-Zustandsbericht fusioniert): Diff-leer gegen `main` = gelandet, nicht abgeräumt.
- **#418 gelandet (`d18429d18`)** — Totcode-Entfernung: 142 `export`-Strips, 8 Definitionen,
  7 Re-Export-Zeilen, 5 CSS-Klassen; **knip 162 → 1** Meldung. Gegenprüfung bestanden, Beweis
  **8164 Prerender-Seiten byte-gleich** (Register `7a1e2fa46`) — von Hand geführt, daher der neue
  Schritt `QS-GP-PRERENDER`.
- **#419 gelandet (`02df51a0a`)** — CI-Härtung **K1–K13**: Wächter-Selbstverriegelung gelöst (war
  15/15 rot), `ci.yml`-Umbau mit Diff-Klassierung statt Zwilling (`ci-doku-noop.yml` gelöscht),
  Kontext-Selbstheilung, Bot-PR-CI-Dispatch, Kanonik-Selbstheilung im Wochenlauf, `fedlex-cache.sh`
  scheitert laut statt still (Alt-Repro: OR bekam falschen Text mit Wortdiff), Monitor-Triage,
  `check:verfall` raus aus dem PR-Pfad, Actions v5. Gegenprüfung bestanden (Register `b377330f9`).
- **Prozess-Doku direkt (`437e92950` + `4e9ab9eb2`)** — CLAUDE.md §17, PR-Template mit DoD,
  Dispatch-Template-Arbeitsteilung, Lehren F2e + F3-Update, Landung-Skill-Notiz, `launch.json`.
- **#420 gelandet (`d864a9caa`)** — Nachzug-Bündel: Rest-Totcode (dabei erwies sich der
  `fmtCHF`-Re-Export als **LEBEND** — Prüferbefund aus #418 korrigiert), Cache-Inhalts-Sonde,
  Wiedervorlage-Kanonik. Gegenprüfung bestanden (Register `860352850`/`212e22609`).
- **Doku-Finale (diese Session)** — **ROADMAP 117.4 → ~97 KB**, wieder unter dem 100-KB-Ceiling:
  24 erledigte Schritte vollständig in `ROADMAP-CHRONIK.md` überführt (wörtlich, nie
  zusammengefasst), **6 Streichungen** je mit Begründungszeile in der Chronik, 2 Fahrpläne nach
  `archiv/` (29 → 27). **Entparkt** (David 3.8.): `W1·4` · `W2·5g-ZEIT` · `W2·5j-TABELLEN` — die drei
  Blocker trugen ihre Auflösung selbst im Register, die Vorbedingungen leben als Bau-Reihenfolge im
  Schritt weiter. **12 neue Schritte** (§14-Intake 3.8.), je mit Anlass-Satz. Neu in der Bibliothek:
  `ci-fehlerklassen-2026-08-03.md` (K1–K13, Abnahme-Status entwurf).
- **David-Entscheide 3.8.:** `strict:true` AKTIV (per API) · Secret `AUTOMERGE_TOKEN` angelegt
  (17:54Z) · TBT-Bewertung → **normiert** · Merge Queue **G7 JA**, Aktivierung nach TBT-Landung
  (`QS-BASIS-MQ`) · Pflege-Routine wöchentlich JA.
- **Nachtrag 20:55Z:** PR #421 «Runner-Robustheit» ist **gelandet** (`23f4be7fb`, TBT-Bewertung
  normiert + OR-e2e-Timeouts runner-fest). Merge Queue **G7 nicht aktivierbar**: GitHub bietet
  Merge Queues nur für **Organisations**-Repos an, LexMetrik liegt auf dem persönlichen Account
  (Ruleset-API 422, leeres Feature-Gate) — **David-Entscheid 3.8. abends: Verzicht**;
  `QS-BASIS-MQ` gestrichen (Chronik), `strict:true` + serielle Landung bleiben die Absicherung.
  Pflege-Routine aktiv (`trig_01WtC2EnU5y2BUN4SmpLhNP1`, Mo 06:45 UTC).
- **Bauplan-QS (Nachtrag ~22:00Z, Auftrag David «nochmals bauplan überarbeiten»)** — Qualitäts-Pass
  über `ROADMAP.md` + alle 27 Fahrpläne, **keine** weitere Massenverschiebung. **1 Fusion**
  (`QS-AUTOMATIK-WT` → `QS-AUTOMATIK-BERICHT`, gleiche Datei/Risiko-Klasse) · **3 Entdopplungen**
  (Datenhaltung stand an drei Stellen: `QS-DATA` auf das VPS-David-Gate verengt, Bau bleibt
  `W2·6-DATA`; `QS-BASIS`-Posten (a)/(b)/(d) an ihre Owner verwiesen; `R-RICHTER` Block B nur noch
  bei `W2·6-FILTER`) · **5 tote `dep`** gelöst (`W2·10-UI-NAV-S/-V/-J/-J3/-O` warteten auf `W2·5d`,
  obwohl §0.2 des Fahrplans nur Reader-Flächen sequenziert) · **2 tote `seq`-Verweise** auf das
  erledigte `W2·5b` entfernt · **3 verbrannte Titel-Nummern** korrigiert (5e/5f zeigten auf IDs, die
  es nie gab) · **10 einseitige Fahrplan-Links** geschlossen (die Schritte des §14-Intakes 3.8.
  kannten ihren Fahrplan, kein Fahrplan kannte sie — je ein `ROADMAP-Spec`-§ ergänzt) ·
  **42 Boilerplate-Zeilen** entfernt (Trailer + Session-Granularität), Regel je einmal im
  Ausführungs-Protokoll. ROADMAP **100 384 → ~99 900 Bytes**, Ceiling 102 400 gehalten.
  `QS-PERF` **wip → ready** (Anlass #421 gelandet), TBT-Posten abgehakt, e2e-Shard-Balance von
  der gestrichenen Merge Queue entkoppelt. Stand-Notizen bei hartem Widerspruch:
  `FAHRPLAN-BASIS-AUSBAU.md` A11 (Merge Queue gegenstandslos) · `FAHRPLAN-DATENHALTUNG.md` §13.
- **Ehrliche Reste:** **K4/K8/K9/K10** der CI-Diagnose tragen im Repo keinen Beleg und sind bewusst
  nicht rekonstruiert. `QS-CURRENCY-KANON` bleibt offen: die 8 Wurzeln sind nachgeführt, die
  **Ursache** ist es nicht. Aus dem Bauplan-QS unerledigt: `W3·10` zeigt weiter auf eine
  **Archivdatei** (`archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`, Stand 14.6.2026) — der einzige
  Schritt ohne aktiven Fahrplan; die Restpunkte-Extraktion steht als erster Arbeitsschritt drin.
  Die **W2·17-UI-BEFUNDE-Kette B3→B19** ist streng seriell verkettet (17 `dep`-Glieder) — bewusst,
  aber es heisst: fällt B3 aus, steht die ganze Reihe.

## Session 2./3.8.2026 (Nacht) — Vorsorgeauftrag-Vollausbau W2·8/V9, PR #411 gelandet
**Grundlage → Direktbau → 3 GP-Runden → Merge `12bc72521` (3.8. 08:17Z, Squash).**
- **Fachliche Grundlage** [bibliothek/recherche/vorsorgeauftrag-inhalte.md] (PV-Vorbild):
  Art. 360–369 am Snapshot verifiziert, Befundregister V-1…V-10 — darunter 2× SCHWER:
  der alte Personensorge-Blocker zitierte Art. 360 Abs. 1 ZGB **contra legem**
  (Wortlaut erlaubt jur. Personen ausdrücklich); Registrierung amtlich belegt
  (Art. 23a ZStV, Anhang 1 Ziff. 23 ZStGV: **CHF 75 Fixtarif**, «+30» gestrichen).
- **Engine** `vorsorgeauftrag.ts` v1.1.0: Ersatzpersonen mit `typ`/`bereiche` ·
  Vertretungsregel einzeln/gemeinsam (V02c/V02d) · V13 spricht Widerruf aus
  (Art. 362 Abs. 1+3) + Ergänzungs-Klausel V13b · Datums-Warnung · Interessen-
  kollisions-Hinweis (Art. 365) · **Gate-Herabstufung** jur. Person→Hinweis/
  Medizin-Warnung (als Lehre gekennzeichnet) · 10 Zitat-Korrekturen.
- **SSoT:** `beurkundungsHinweis()` gestrichen (3 belegte Abweichungen TG/BE/SG) →
  UI aus `NOTARIATE` + `berechneBeurkundung` (Norm/Stand/Link, D1).
- **Beweis:** Golden 254→255 (additiv + je Commit deklariert, kein Nicht-VA-Fall) ·
  **Gegenprüfung 3 Opus-Runden** (R1: B1–B7 · R2: B8+L1–L5 · R3 bestanden),
  Register-Zeile 2026-08-03 mit Hand-Hash (Tool working-tree-gebunden) ·
  Gate voll + e2e 352 + perf-budget grün · CI inkl. Merge-Schutz grün.
- **Offen (David):** fachliche Abnahme (Dossier unabgehakt, Herabstufung V-1/V-2
  rückholbar) · Fahrplan §V9.1–V9.5 vertagt (Beiblatt, BGE 151 III 81,
  formel_extern-Minimum, ZStGV-Drift-Pin, GP-Nebenfunde N1–N4).
- **Nachzug-Session 3.8. (vormittags), gelandet #415 `accbf09d6` + #416 `2a0bb2133`:**
  V9.5 gebaut (GP bestanden + Delta-Runde; Golden 256) · V9.2 BGE 151 III 81 am
  Entscheid verifiziert (E. 3.5.5/3.6; neue Status-Stufe `quelleGeprueft`, Abnahme
  offen) · Dossier-Drift geheilt + Wächter `check:dossiers` (CI) · V9.4 ZStGV:
  Fakten gesichert, Pin bewusst zurück — **David-Entscheid Weg A/B**
  (`bibliothek/normen/zstgv-drift-erkennung-2026-08-03.md`; Frist 15.10.2026) ·
  Dependabot #13 dismissed (RSC-only, ungenutzt, belegt) · Lighthouse grün
  (OR CLS 0.009). Befunde: e2e `leser-kopf-a9` flakt im Voll-Lauf (Nullprobe auf
  main rot, Isolation grün) · `check:fedlex-versionen` main-rot (3 Pins
  nicht-kanonisch, u.a. ZGB html-1→2 — eigener Risiko-Schritt) · BGE-Register
  41 unregistrierte Zitate (vorbestehend).

## Session 2./3.8.2026 (Nacht) — fünf Landungen: Verfallsregister #410, B1 #408, Uppercase-Sweep #409, B2 #412, N1 #413
**Kurzkarte der Nacht-Session-Kette (Details in den jeweiligen Einzelkarten/PRs).**
- **#410 Verfallsregister** — 10 künftige Fassungen nachgeführt, Gegenprüfung bestanden, Squash `849581faa`.
- **#408 W2·17-UI-BEFUNDE-B1** — 13 von 16 Befunden gebaut (Chips/Badges/Normzitate), 3 per
  Bestands-Entscheid zurückgestellt; auto-squash-gelandet 22:55Z (Details: Karte unten).
- **#409 Uppercase-Sweep** — Normzitat-Suffixe an 15 Stellen nicht mehr uppercase-entstellt
  (Heimarbeitsvertrag + Sweep); auto-gelandet 23:11Z.
- **#412 W2·17-UI-BEFUNDE-B2** — Verlauf und Zustand in der URL (K-20): 10 von 11 Befunden
  gebaut in 4 Losen, LM-207 zurückgestellt (QS-PERF-Fläche, Nachmessung 3.8. abgespeckt negativ).
  Kernstück: eine Zustands-Weiche `src/components/rechtsprechung/zustand.ts`
  (Inhalt→URL/Darstellung→localStorage, durchgängig `replace`-Politik) erfüllt LM-200/203/206
  und trägt den Dach-Befund LM-204 mit. Gate voll grün (tsc/vitest/golden/lint/check), Prod-Re-Audit
  3.8.2026 vorab: 11/11 geprüft (8 voll, 2 teilweise, 1 unklar). Gelandet als Squash `ac44aa937`.
- **#413 W2·17-UI-BEFUNDE-N1** — LM-044-Nachzug: `lc-chip-zeile`-Grammatik auf NormChip-/Materialien-/
  Rechner-/Filter-Flächen ausgerollt (12 Dateien, `[role=button]`-Regel, `.lc-chip-selected` per `:not()`
  geschützt); Metadatum-Achse bleibt bei W2·10-UI-NAV §3(c). Gelandet als Squash `e5b1fb8b5`.
  Offene Morgen-Vorlagen für David: LM-041-Sachgebiet-Tabelle (§7-Auflage), LM-112, LM-042 (Extraktion),
  OR-Leser-Default kantonal, W2·7-BEZUG-LADEN (§15), QS-CURRENCY-KANON, W2·13-KANTONE-DRIFT.
  (`feat/ui-befunde-b2` → `main`), kein Merge in diesem Auftrag.

## Session 2.8.2026 — W2·17-UI-BEFUNDE-B1: Chips, Badges und Normzitate, 13/16 gebaut (Parallel-Worktree, Branch `claude/sleepy-mestorf-5dbea7`)
**Auftrag:** Batch B1 (16 UI-Befunde, K-05+K-10, §2) in einem eigenen Worktree parallel zum
Hauptzweig bauen — Prod-Re-Audit vor Baubeginn (§0.1), drei Lose (Fable 5 / Opus / Sonnet 5),
Doku-Abschluss und PR dieser Session.
- **Prod-Re-Audit 2.8.2026** (lexmetrik.vercel.app, DOM + `getComputedStyle`): **16/16
  reproduziert** — 12 voll, 4 teilweise (LM-041/044/050/051; Fundort teils überholt, Grunddefekt
  bestätigt).
- **13 gebaut** (10 Commits): LM-101 Blocker (266l/266o nicht mehr uppercase-entstellt) ·
  LM-103 (Normzitate `whitespace-nowrap`) · LM-107 (`margLabel`-`<sup>` vereinheitlicht) ·
  LM-102+LM-106 (`normLabel()` löst via `ERLASS_REGISTER` auf, 60 Kürzel korrigiert, 19
  Schreibweisen live gegen Fedlex-SPARQL verifiziert) · LM-105+LM-049+LM-051 (Aktenzeichen nur
  bei Abweichung vom BGE-Zitat, «+N weitere», Trenner-Textknoten) · LM-040
  (`.lc-chip-selected`, gefüllte Fläche + ✓) · LM-045+LM-046+LM-047 (Chip-Grammatik über
  Container-Klasse `lc-chip-zeile`) · LM-050 (ZeichenLegende als Toggletip, B4-Wächter 32/32
  grün, Test nicht angepasst).
- **3 zurückgestellt** (Bestands-Entscheide, §0.2 — Öffnung nur per David-Entscheid): LM-041
  (Facetten-Modell FAHRPLAN-VERZAHNUNG-UI.md §9/B1 abschliessend definiert, kein
  Sachgebiet/Zitier-Rolle) · LM-044 (FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 ausdrücklich DEFER,
  U-VERWEIS-Kollision) · LM-048 (`gewicht:null` = «nicht messbar», W2·7-BEZUG-Entscheid, R16-
  Ampel gesperrt).
- **Tore (2.8.2026):** tsc ok · vitest ok (4859, inkl. B4-Wächter) · `golden:vergleich`
  byte-gleich · lint ok · `check` 39/40 — einzig `check:verfall` rot, und zwar als
  **vorbestehender Bestandsdefekt** belegt (Nullprobe im sauberen `main`-Checkout am 2.8.2026
  identisch rot: 10 «Künftige Fassung»-Termine per 1.8.2026 kalendarisch verfallen, unabhängig
  von B1, separat geflaggt).
- **Nebenbefund** (separat geflaggt, nicht Teil des PR): Prod zeigt auf `/gesetze/bund/OR` keine
  kantonalen Bezüge mehr im OR-Leser und deckelt BGE-Gruppen — Spannung zum
  W2·7-BEZUG-B7-Landungsvermerk, zu prüfen.
- **PR:** dieser Commit/Push (`claude/sleepy-mestorf-5dbea7` → `main`), kein Merge in diesem
  Auftrag — Landung ist ein eigener, nachgelagerter Schritt (Skill `landung`).

## Session 31.7.2026 (Nachlauf) — Endprüfung der QS-TOK-Aufräumwelle, Fix-Runden 1 und 2 (Branch `feat/qs-tok-aufraeumwelle`)
**Auftrag David:** die Aufräumwelle vor der Landung adversarial endprüfen und die Funde abarbeiten. Zwei Runden unabhängiger Nur-Lese-Prüfagenten, danach je eine Fix-Runde.
- **Fix-Runde 1 (Commits `b329a5ab3`, `4786e3f3c`, `f9d7fbb74`, `357eb3179`):** tote Links + Wurzel-Pfade + Welle-Überschriften + 33 Bau-Spec-Zeiger (A) · vier Steuerskript-Lücken, jede zuerst rot gezeigt (B) · Ist-Kennzahlen, stabile Befund-Anker, W2·9-Zeiger (C/D) · Slicer-Aufruf und `fahrplaene/`-Pfade in CLAUDE.md + 5 Skills nachgezogen.
- **Fix-Runde 2 (Commits `a571203d6`, `8966781fe`, `8ebf138a7`, `bb4a6f794` = diese Karte, `73a376fdf`):** 24 Funde, davon 2 KRITISCH. `73a376fdf` ist der einzige Commit der Runde, der einen SKILL ändert: `auftrag` nennt jetzt `plan:set` — im Plan-Stand-Block (Ziff. 2) und als eigenen DoD-Punkt (Ziff. 4 Nr. 5) mit nachgeschaltetem `check:plan` (R2-7). Er entstand nach dieser Karte und fehlte hier bis Fix-Runde 3 (R3-12).
  - **Wurzelfix Checkbox↔`@meta`-Kopplung.** `parse.ts` und `set.ts` suchten die Checkbox in der «nächsten nicht-leeren Zeile darüber» und brachen dort ab. EINE Prosa-Zeile dazwischen kappte die Bindung; `check:plan` Regel 2 prüft nur `if (e.checkbox && …)` und war genau dort blind — `plan:set … status=done` schrieb das `@meta`, die sichtbare Liste blieb auf «offen», das Tor blieb grün (§6.7: ein Tor, das nicht scheitern kann). Belegt an `W2·17-UI-BEFUNDE-B20` (5 Prosa-Zeilen, eingezogen von `f9d7fbb74` selbst) und `W2·5g-ZEIT`. Neue Regel `bindeCheckbox` (EINE Implementierung für Parser und Setzer, §5) + neue **Regel 10** von der Gegenseite. **Vier Checkboxen neu gebunden** (W2·5d, W2·5g-ZEIT, W2·7-BEZUG-B7, W2·9), **null** dadurch rote Kopplungen — es war keine Drift-Heilung nötig. **Nachtrag Fix-Runde 3 (R3-6/R3-10):** Die Karte nannte zuerst **fünf** und führte B20 mit. Das war für den Fix-Zeitpunkt richtig, für den Commit, in dem der Satz steht, nicht mehr: `8ebf138a7` hat B20s `@meta` zusätzlich aus dem Prosa-Block heraus **unmittelbar unter seine Bullet gezogen** — eine reine Zeilenverschiebung, undeklariert, weil sie kein Feld ändert und der Neutralitäts-Beweis über `plan:dump` nur Feldwerte deckt. Seither bindet B20 auch unter der ALTEN Regel. Nachgemessen über alle `@meta` je Stand (alte «nächste nicht-leere Zeile darüber»-Regel gegen `bindeCheckbox`): `357eb3179` 5 · `a571203d6` 5 · `8966781fe` 5 · `8ebf138a7` **4** · `73a376fdf` **4** · HEAD **4**. Lehre: Zeilen-Umstellungen an `@meta` gehören separat deklariert.
  - **`W2·13-KANTONE-K1`-Anker geheilt.** Teil a zeigte auf `inhalt.tsx:1220–1226`; die Datei hat seit dem §6.6-Split `b56b9193f` 806 Zeilen. Zielcode heute `src/pages/gesetz-leser/inhalt-volltext.tsx`, Render-Zweig `ohneGliederung.length > 0` — der F24-Defekt ist dort unverändert live. Beide K-1-Anker auf Symbol-Form gehoben; die Datei in die `kollision:`-Liste aufgenommen (die §12-Kollisionssonde war auf genau ihr blind).
  - **Weiter:** `[d]`-Legendenmarke überlebt `plan:set` wieder · `seq-hart`/`seq-weich` sind Teil des Etiketts (wurden bis dahin still gelöscht — §12-Reihenfolge auf geteilten Dateien) · `plan:set` trägt fehlende optionale Felder nach, statt sie still zu ignorieren und «gesetzt» zu melden · neues Skript **`npm run plan:dump`** (alle Einheit-Felder inkl. `checkbox`, dazu `@queue` und Blocker-Register) — der bisherige Ad-hoc-Dump war blind für genau das Feld, in dem die B20-Regression steckte · vier fahrplanlose ready-Schritte (`W3·10`, `W3·11`, `W3·14-S`, `W3·14-a11y`) haben ein `fahrplan:`-Feld · `W3·13` zeigt nicht mehr in die Archivdatei — **dafür zeigt `W3·10` seither neu HINEIN** (`archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`), womit die in derselben Runde aufgestellte Regel im selben Commit gebrochen wurde; Fix-Runde 3 hat den Zeiger als **deklarierte Ausnahme** im Bullet-Text von W3·10 offengelegt statt ihn stillschweigen zu lassen (R3-3/R3-11) · `# §A`/`# §B` in FAHRPLAN-BASIS-AUSBAU auf `##` gehoben (der Slicer erfasst nur `#{2,3}`) → **alle Ziele der 35 «→ Bau-Spec»-Zeiger lösen auf** (vorher 2 Fehlschläge), **35/35** ROADMAP-Spec-§§ tragen den Zeiger. Die frühere Angabe «61/61» ist in Fix-Runde 3 gestrichen: inhaltlich stimmte sie (0 Fehlschläge), die **Zahl** liess sich mit keiner Konvention nachrechnen (35 Blöcke · 57 «…»-Ziele · 66 mit freien §-Verweisen · 68 über alle Zeiger-Zeilen) und stand ohne Messbefehl im Repo — dieselbe Klasse wie die Kennzahlen, die diese Runde selbst korrigiert hat (R3-13) · Zahlfixe (R2-8 «Ziffernvertauschung» zurückgenommen, 83.4→83.7 KB, «15 KB» gestrichen, «3 Restpunkte» → «2 + 1 Statusbefund»).
  - **Ehrlichkeits-Korrekturen statt Schönfärben (§8):** Die Anker-Regel in FAHRPLAN-UI-BEFUNDE §0.2 gilt jetzt ausdrücklich nur **vorwärts** — der Altbestand trägt weiterhin blosse `Z.`-Angaben und wird im jeweiligen Bau-Batch nachgezogen. Die 68 «diese Datei»-Neutralisierungen wurden **nicht** zurückgedreht; stattdessen trägt jeder betroffene «wörtlich»-Block eine Deklarationszeile (32 Blöcke). Die Selbstverweis-Konvention steht jetzt in `fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md`, samt ausdrücklichem Vermerk, dass kein flächiger Durchgang gelaufen ist.
- **Tore am Rundenende:** `check:plan` grün · Plan-Test-Satz **115/115** grün (16 davon zuvor wörtlich rot gezeigt) · `tsc -b` sauber · `plan:next` **byte-gleich** zum Stand vor der Runde · `plan:dump`-Diff = **genau die 6 gewollten** Feld-Änderungen (K1-`kollision`, 4× `fahrplan` nachgetragen, `W3·13`-`fahrplan` umgestellt).
- **Kennzahlen nach Runde 2 (gemessen `wc -c`):** `ROADMAP.md` **111.0 KB** (113 679 B) — Wächter weiterhin **ROT** (+11.0 KB), gegenüber Fix-Runde 1 (110.0 KB) um ~1 KB gewachsen: die Begründungs-Prosa der Zeiger-Korrekturen. Das wird **nicht** weggerechnet — die Diät-Etappe für die restlichen ~11 KB (Leitprinzipien, Ausführungs-Protokoll) steht weiterhin aus. `STRUKTUR.md`: Ist-Zahl über den Wächter — `python3 .claude/hooks/struktur-rotieren.py --check` (Ceiling 60 KB, grün); geführt wird die Kennzahl an genau EINER Stelle, in `fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md` §Stand. **Korrektur Fix-Runde 3 (R3-4/R3-5):** Hier stand «**40.2 KB** (41 192 B)», deklariert als `wc -c`-Messung — nachgemessen ergab derselbe Commit `41 630 B`, also 438 B mehr; der Wert war vor der letzten Bearbeitung dieser Karte genommen worden. Genau die Fehlerklasse, die diese Runde an anderen Stellen korrigiert hat: eine Kennzahl, die ihren Messbefehl nennt und ihn nicht besteht. Statt sie nachzuziehen, ist sie **entfernt** — eine zweite geführte Zahl neben der Tabelle wäre eine zweite Wahrheit (§5).
- **Fix-Runde 3 (final), 13 Rest-Funde:** Der «Wurzelfix» der Runde 2 liess **einen LIVE-Fall derselben Klasse stehen** (R3-1/R3-9, KRITISCH). `W2·7-BEZUG` trug sein `@meta` **hinter** dem `@meta` seines Unterschritts B7: die Rückwärts-Bindung brach an dessen Kommentar-Grenze, der Vorwärts-Blick von Regel 10 an der Unter-Bullet — die Einheit fiel durch beide Netze. Vor dem Fix reproduziert: `checkbox = null`, `setField(…,'status','wip')` schrieb `status: wip` und liess `- [x]` stehen, `pruefe()` meldete **null Probleme**. Der Test-Satz führte genau dieses Layout als «GEGENPROBE → kein Problem», also als **gewolltes** Verhalten — die doppelte Leerzeile war ehrlich als «GRENZE» deklariert, diese Lücke nicht (§8).
  - **Zwei Ebenen geheilt.** (a) ROADMAP: `@meta` unmittelbar unter die Bullet gezogen — dieselbe Handbewegung wie bei B20, diesmal **deklariert**. (b) Regel 10: nur noch eine **gleich-/höherrangige** Bullet beendet die Bindungs-Einheit; das gebundene `@meta` eines tieferen Unterschritts wird übersprungen statt zum Abbruch genommen. Zuerst rot gezeigt (§6.7), Fixture = das echte alte ROADMAP-Layout; `check:plan` war auf der echten ROADMAP rot, bis (a) sass.
  - **Regel 10 war zudem falsch-positiv (R3-7):** `bindeCheckbox` prüfte die Kommentar-Grenze **vor** dem Bullet-Test, `z.includes('-->')` traf also auch blossen Fliesstext — ein Pfeil im Schritt-Titel machte das Tor rot mit einer Meldung auf die falsche Ursache. Reihenfolge getauscht; eine Bullet-Zeile ist nie eine Kommentar-Grenze (0 `@meta` auf Bullet-Zeilen, am Bestand folgenlos).
  - **`[d]`-Erzeugung zurückgenommen (R3-2).** Runde 2 hatte `parked`/`blocked` in `CHECKBOX_FUER` aufgenommen; begründet war nur das BEWAHREN, und das hängt an der `CHECKBOX_STATUS`-Abfrage. Als **Erzeuger** beschriftete der Eintrag einen bloss blockierten Schritt als «geparkt/zurückgestellt» (§8), und derselbe Status erschien je nach Vorzustand als `[ ]` **oder** `[d]` — von keinem Tor gedeckt, weil die Kopplungstabelle beides duldet. Normalform wieder `[ ]`; Bewahrung (`[D]`+blocked ⇒ `[D]`) unangetastet.
  - **Tore:** `check:plan` grün (nackt) · Plan-Test-Satz + `fahrplanSlice` **136/136**, davon **7 zuvor wörtlich rot** · `tsc -b` sauber · `plan:next` **byte-gleich** · `plan:dump`-Diff = **genau die gewollte** Bindung (`W2·7-BEZUG` `checkbox: — → [x]`) plus den `pos`-Tausch mit B7 (61↔62), den die Zeilenverschiebung arithmetisch nach sich zieht — beide `done`, `plan:next` darum unberührt. Dass `pos` die Umstellung zeigt, ist die Antwort auf die Lehre aus R3-10.
  - **Bewusst NICHT gebaut:** der Halbsatz zu checkbox-losen Einheiten in Skill `auftrag` DoD Ziff. 5 (R3-8) — `.claude/` war in diesem Auftrag TABU, Wortlaut liegt beim Orchestrator · `check:plan`-Regel «`fahrplan: archiv/…` nur bei `done`» und ein Zähl-Skript für die Bau-Spec-Zeiger (in den Funden als «optional» geführt, nicht beauftragt).
- **Vermerk:** PR #407 am 31.7.2026 nach Skill `landung` gelandet — Squash-Commit `607e8a5b1` auf `main`, Vercel-Prod-Deploy success, 8 Kernrouten HTTP 200. Tor-Batterie vor dem Merge: tsc/test(4855)/build/golden(249 byte-gleich)/check(40)/perf-budget grün; lint-Errors lagen ausschliesslich in git-ignorierten `.scratch/`-Altdateien (committete Flächen: 0 Errors); zwei e2e-Ausfälle als Flakes belegt (isoliert 9/9 grün, CI-Rerun grün).

## Session 31.7.2026 — QS-TOK-Aufräumwelle (T7-Fortsetzung), ABSCHLUSS: Plan-Diät + Ablage-Ordnung + Nachhalte-Konvention (PR #407, Branch `feat/qs-tok-aufraeumwelle`)
**Auftrag David:** QS-TOK-Aufräumwelle fortsetzen; Plan vorab adversarial verifiziert (10 Nur-Lese-Prüfagenten).
- **Auf `main`:** QS-TOK auf `wip` gesetzt + OBERSTER-Zeile auf → W2·5d nachgeführt (Commit `8c7dd9425`); am Session-Ende auf `ready` zurück und OBERSTER wieder `QS-TOK` (Queue-Kopf).
- **Etappen auf dem Branch (Kurzform):** AP-0 `plan:set`-Blockquote-Härtung, Regressionstest erst rot gezeigt (`1cd9c68`) · AP-1 wip-Marker · AP-2 STRUKTUR-Rotation + diese Karte (`20e62fe`) · AP-3/AP-4 Archiv-Wellen 11 + 9 Fahrpläne (`be0a74e`, `ccbd291`, `4531695`) · B1 done-Blöcke wörtlich → `ROADMAP-CHRONIK.md` (`9b68204`) · B2 Archiv-Restpunkte-Datei (`b8d39ae`) · B3 Querschnitt-Verdichtung (`fb92a3e`) · B4 Spec-Prosa offener Schritte wörtlich in ihre Fahrpläne (`902b287`) · AP-9 W2·17-UI-BEFUNDE, 210 Befunde in 20 Batches (`92fd394`) · AP-6 42 Teilschritte (`5066edb`) · AP-7 Heimat-Zeile + §0-Kopf je aktivem Fahrplan (`16d466e`) · AP-8 Umzug nach `fahrplaene/` samt Link-Tor-Umstellung mit Negativ-Beweis (`d7aa4e1`) + Skill-Nachzug (`04abc05`) · AP-10/11 Stand-Nachführung + Nachhalte-Konvention (dieser Commit).
- **Kennzahlen (gemessen, `wc -c`, Stand Fix-Runde 1 nach der Endprüfung 31.7.2026):** `STRUKTUR.md` 81.5 → **36.1 KB** (Ceiling 60 KB, **grün**) · `ROADMAP.md` 162.2 → **110.0 KB** (Ceiling 100 KB, **ROT**, +10.0 KB) · 20 Fahrpläne archiviert, **29** aktiv in `fahrplaene/`, Root 51 → **22** `.md`. Ist-Zahl immer über `python3 .claude/hooks/struktur-rotieren.py --check`; die frühere fixe Angabe (123.4 KB / +23.4 KB) war seit `07bef2dee` stale und überzeichnete den Diät-Rest um Faktor 3 (Endprüfungs-Funde 6/12/31).
- **Ehrlich zur ROADMAP-Zahl:** Die Diät erreichte bei B4 (`902b287c4`) **83.7 KB** (85 731 B; hier stand «83.4 KB», korrigiert 31.7.2026 nach Endprüfungs-Fund R2-11) — grün. Danach schrieben zwei inhaltliche Etappen derselben Session wieder hinein: AP-9 (+10 KB) und AP-6 (+27 KB), dazu AP-8 (+3 KB Pfad-Präfixe). Der Re-Akkumulations-Wächter meldet das korrekt; die Meldung bleibt stehen, statt weggerechnet zu werden. DoD ≤ ~65 KB **nicht** erreicht — Rest sind Leitprinzipien, Ausführungs-Protokoll und offene Steuerung; deren Auslagerung ist eine eigene Etappe.
- **Rotations-Lücke dokumentiert:** `DATUM_RE` in `.claude/hooks/struktur-rotieren.py` erkennt Doppel-Datum-Titel («Session 24./25.7.2026») nicht; solche Karten gelten als undatiert und rotieren nie — **3** liegen dauerhaft in der Karten-Region. Kein Datenverlust; Fix-Skizze in `fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md` §Stand 31.7.2026.
- **Neue Konvention (AP-11):** Abschluss-Prosa direkt in `ROADMAP-CHRONIK.md`, Spec-Prosa direkt in die `fahrplaene/`-Datei; Kontrolle ist der bestehende SessionStart-Wächter, **kein neues Tor**. Steht im ROADMAP-Ausführungs-Protokoll Ziff. 6.
- **Vermerk:** PR #407 gelandet 31.7.2026 (Squash `607e8a5b1`, siehe Landungs-Vermerk in der Fix-Runden-Karte oben).

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
