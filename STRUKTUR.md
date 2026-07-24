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

## Session 24./25.7.2026 (III, laufend) — «bau, run till dry»: W2·12-HYGIENE + W2·5b KOMPLETT (PRs #338–#343), Blanko-Go David, W2·5d E4 im Bau
**Nachtrag 25.7. (Fortsetzung derselben Session):** **M11 + M6-D gelandet** (PR #342, 3-Runden-Gegenprüfungs-Loop: R2 widerlegte ENUM-Lücke/FAMZG-Fehlziel/Bedingungssatz-False-Positive → Nachfix mit 49-Block-Korpus-Enumeration → R3 bestanden; deklarierte Folge: 59 Misch-Aufzähler-Artikel jetzt TOC-konsistent, R3-Pin-Test) · **HAENGEND-Härtung gelandet** (PR #343, kalibriert: «gen» bewusst raus [Motorwa-gen-Silbenriss], als/noch/nebst rein; No-op byte-identisch 26 206 Zeilen) · **W2·5b damit ABGESCHLOSSEN** (alle M1–M12; ROADMAP done, aus @queue) · **Plan-Korrektur:** A22/K-1 war stale «offen» — faktisch gebaut PR #213 (12.7., Git-Abgleich) · **Davids Blanko-Go 24.7.** («du hast für alles go») für alle Alt-Gates → Memory `david-blanko-go-2026-07-24` (Grenzen: fachliche Abnahme, L-3/A27-Rückzug) · **Modell-Direktive David:** Bau-Agenten auf Fable 5 («opus 5» existiert nicht — als 5er-Topmodell interpretiert), Gegenprüfung bleibt Opus · **W2·5d-Status-Audit** (Explore): E-Reihe bis auf **E4** komplett, IA-3…IA-7/Y-A-Mini/EID-1–3 offen-entsperrt · **E4 (A32 Kontextfenster + A36 ZGB-TOC-Kuration) im Bau** (Worktree `lm-e4`, Fable-Agent). Sichtprüfungs-Notiz: Browser-Pane-Screenshots bei tiefem Scroll schwarz = Tool-Capture-Artefakt, DOM/e2e massgeblich.

## Session 24.7.2026 (III-Start) — «bau, run till dry»: QS-TOK-Rest eingeordnet, B24-Split gelandet, M12 im Gegenprüfungs-Loop (Fable-Orchestrator, PR #338 + Worktree `lm-m12`)
**Auftrag David:** «bau» + «geregelt und eins nach dem anderen» + «run till dry». §14-Protokoll: `plan:next` → oberster Schritt **QS-TOK**.
- **QS-TOK als autonom-fertig eingeordnet** (kein Neubau): Nachmessung ergab T1/T2/T3/T5/T6/T7/T9/T15/T17/T18/T19 + `map`/`zeige`/`fahrplan`/Dispatch-Template gebaut; Rest ist David-gegatet (§8 Ziff. 4: T10/T12-St.2/T14/T16/T20-je-Einsatz) oder unwirtschaftlich (T13-Rest läge auf Risikopfaden = Gegenprüfungs-Zeremoniell für reine Kommentare).
- **W2·12-HYGIENE abgeschlossen:** **H-3** als No-op geschlossen (frische Erhebung: 0 gemergte Branches, nur Haupt-Worktree). **B24** gebaut + gelandet (**PR #338**, Squash `b56b9193`): §6.6-Split `gesetz-leser/inhalt.tsx` **1494→781 Z.** + 3 Geschwister (`inhalt-ansichten` 119 · `inhalt-volltext` 346 · `inhalt-hooks` 556), Hook-Reihenfolge byte-äquivalent (§15.4), `renderSektion`+reader-root wegen `check:linien-kanon` in der Datei belassen. Beweis: gate voll grün, golden 249/249, e2e 29/29 unangepasst, Sichtprüfung (Suche/Highlight/Ansicht-Menü/Mobile-Drawer). Delegiert an Opus-Bau-Agent (Dispatch-Template), Artefakt-Verifikation im Orchestrator.
- **W2·5b Batch C per Nachmessung geschlossen** (ROADMAP-Auflage «erst verifizieren, dann bauen»): M4 (mobiler Gliederungs-Drawer + Lupe-Suche, live 375×812 geprüft) · M5 (e2e A35 Suchfeld im Kopf) · M7 (`.nt-anker`-scroll-margin 5rem) · M8 (`suchHighlight.ts` + e2e A40) — Häkchen mit Beleg im FAHRPLAN nachgezogen, kein Doppelbau.
- **W2·5b/M12 (Randtitel-Verklebung) GEBAUT + GELANDET (PR #340, Squash `c872e4a9`):** Root-Cause §7-verifiziert (Fedlex setzt `<br>`/Spacer/Trennstriche in Randtiteln; `reinText()` strippte ersatzlos). Zwei-Runden-Loop wie vorgesehen: Bau-Agent (Fix + Tor `check:verklebung`, Sabotage 64 rot, 227 Sidecars) → **Gegenprüfung R1 (unabh. Opus): WIDERLEGT** (`-<br>`-Silbentrennungs-Riss «Adoptions- urlaub»; vorbestehender `<b>/<i>`-Inhalts-Strip «( )»/«Cyber pezialistinnen») → Nachfix mit vollständiger Korpus-Enumeration (93 b/i-Kandidaten + alle Naht-Klassen, kontextabhängige `loeseTrennung()`/`biErsetzung()`, Tor-Klassen B/C, Sabotage 21 rot) → **Gegenprüfung R2 (frischer Opus): BESTANDEN** (eigene Enumeration 0 Fehlmerge, 10+ Soll-vor-Ist-Stichproben, bis/ter, Negativ-Proben, eigene Tor-Sabotage). Quittung Register-Hash `ce06aa72` (229 Risiko-Dateien), `check:merge-schutz` + volles Gate grün, Merge manuell (kein `--auto`, Risikopfad). Deklarierte Folge-Härtung: HAENGEND-Liste erweitern (FAHRPLAN-GESETZESDARSTELLUNG-BUND §M12, korpusweit 0 Treffer).

## Session 24.7.2026 (II) — Ultracode-Fahrplan-Umbau: @queue-Mechanik macht plan:next dekret-treu (Branch `plan/queue-mechanik`, Roadmap QS-PH)
**Auftrag David:** «baue mit ultracode den fahrplan sodass es sinn macht.» Council-Workflow (4 Analyse-Leser · 3 Entwürfe · 3 Judges, Sieger «Mechanik» einstimmig 26:20:14): Befund war, dass VIER gestapelte Prosa-Dekrete am Abarbeitungs-Kopf lagen, `plan:next` aber stur nach Dokumentposition sortierte und LERNPHASE-AB (Querschnitt-Band, «kein Reihenfolge-Slot») als obersten meldete — gegen QS-TOK-Dekret (10.7.) und Fokus-Dekret (24.7.). 4 Commits:
- **@queue-Direktive** in `ROADMAP.md` (SSoT der Bau-Reihenfolge: QS-TOK → W2·12-HYGIENE → W2·5b/5d/5h/5i → W2·13-KANTONE → W2·7-BEZUG/W2·6b-MAT-FINMA) + `parse.ts` liest sie, `aufloesen.ts`/`next.ts` sortieren readyNow nach Queue-Rang und führen Querschnitt-Band-Schritte als «begleitend», `check.ts` Regel 8 (ID existiert / keine Dublette / kein done/parked / Prosa-«OBERSTER» == echte plan:next-Ausgabe). Sabotage-Proben 8.1/8.3/8.4 je rot gezeigt; 59 Plan-Tests grün.
- **T7-Rotation** abgelöster Steuerungs-Prosa (Quell-Architektur-Essay, Informations-Nutzungs-Intake, I1/I2, VZUI-✅-Block) wörtlich nach `ROADMAP-CHRONIK.md`; Vollinhalt vorher in den FAHRPLAN-Detailquellen verifiziert; Beweis `plan:next` byte-identisch vorher/nachher. Offene Posten (B1/B2/S1/S2) unangetastet.
- **W2·5b-Kollisionsfläche** um M12-Pfade erweitert (scripts/normtext, struktur-Snapshots, Such-Index) — Lane-Korrektheit.
- **Adversariale Verifikation** (3 Opus-Widerleger): 0 kritisch; Mittel-Befund (8.4 band an queue[0] statt an die echte Ausgabe) + 2 Gering-Befunde umgesetzt und getestet. **David-Ratifikation erfolgt** (Chat 24.7., «nein passt»): QS-TOK bleibt vor der Gesetzesdarstellung an der Spitze; Wechsel wäre ein Einzeiler an der @queue-Zeile. CI-Lehre: gitignorierte Artefakt-Pfade taugen nicht als kollision-Pfade (Regel 6 prüft Existenz im Checkout) — Generator-Pfad führen.

## Session 24.7.2026 — §14-Intake: 14 Anmerkungen David (Gesetzesdarstellung + Verzahnungs-Fundament + FINMA) in den Plan verortet (Branch `docs/plan-intake-2026-07-24`, reine Plan-Doku)
**Auftrag:** Anmerkungs-Session («go» = einbauen). 14 Anmerkungen nach §14 gebündelt und verortet — kein Bau:
- **Fokus-Dekret 24.7.** im Abarbeitungs-Kopf der `ROADMAP.md`: Gesetzesdarstellung im Vordergrund — (1) erst Code-Vereinfachung der Gesetzes-Strecke (Vehikel W2·12-HYGIENE, §6-neutral) → (2) Gesetzes-Schritte prioritär → (3) daneben prioritär `W2·7-BEZUG` + `W2·6b-MAT-FINMA`.
- **Neu `W2·7-BEZUG`** (Bezüge am Artikel — Facetten-Fundament alle Instanzen: kantonale Entscheide, BGer-Nicht-Leitentscheide, Facetten Quelltyp/Ebene/Kanton/Gericht/Leitentscheid-Status, Filter-UI Default konservativ; Long-Tail bleibt W2·6-DATA) → Detail `FAHRPLAN-VERZAHNUNG-UI.md` §9 (neu).
- **Neu `W2·6b-MAT-FINMA`** (FINMA-Materialien prioritär, Kontext Bewerbung David bei der FINMA; F1 Quelle in Stufe-1-Pipeline, F2 evtl. direkte Artikel-Verzahnung nach H0-Machbarkeits-Verdikt) → Detail `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` §9 (neu).
- **W2·5h-Intake «Gesetzes-Kopfzeile & Gliederungs-Default»** K1–K7 (Default kompakter · Abstand · Suche als Lupe in die Sticky-Leiste · Gliederungs-Toggle · Scroll-Ziel-Verdeckung · Kopfzeile gesamt · Ansicht ▾ als Personalisierungs-Zentrum) → Detail `FAHRPLAN-GESETZES-UX.md` §15 (neu); Prior-Art-Abgleich M4/M5/M7/M8, PRs #284/#301 vermerkt.
- **W2·5b-Intake M12 Randtitel-Leerzeichen-Verklebung** — live + Daten verifiziert (OR Art. 10 «Wirkungeneines unterAbwesenden…»; Defekt in `public/normtext/struktur/bund/*.json` ≥8 Erlasse + vererbt in Such-Index, `bloecke` sauber) → Befund/Bau `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` M12 (neu); Extraktions-Risikopfad, Gegenprüfung beim Bau.
- Inventar `scripts/plan/inventar.ts` +2 IDs; `check:plan` grün, `plan:next` zeigt beide neu als ready. Gegenprüfung n/a — reine Plan-Doku.

## Session 21./22.7.2026 — Nacht-Aufräumung: Repo auf «nur main», zwei Falsch-Rot-Wurzeln gezogen, Steuer-Doku rotiert (Hauptcheckout, Auftrag David «tiefgründiges Aufräumen, run till dry»)
**Auftrag:** Repo konsolidieren, bis nur `main` übrig ist; alles Liegengebliebene zusammenführen. Repo wurde von David von `LegalCalc` auf **`LexMetrik`** umbenannt (Remote-URL nachgezogen).
- **Branch-/Worktree-Kahlschlag (nur belegt Gefahrloses):** 5 saubere Worktrees (`lm-ci/-fundament/-planintake/-toraudit/-verankerung`) aufgelöst · 13 lokale + 25 remote Branches gelöscht — jeder erst nach Beleg «PR gemergt + keine Nach-Merge-Commits» (Epochen-Vergleich mergedAt↔Tip; ein erster String-Vergleich war zeitzonenfalsch und wurde verworfen). `feat/richter-fundament` erst nach Nachweis gelöscht, dass seine 5 Nach-Merge-Commits identisch als PR #310 gemergt sind. UX-Audit-Screenshots (35 PNG, 3./4.7.) als PR #323 eingecheckt.
- **Falsch-Rot-Wurzel 1 · `check:materialien` (PR #324):** `datenhaltung:build` erzeugt eine **hohle** `soft-law.db` (nur Blob-Ingest; `norm_referenzen`/`soft_law` leer, gemessen dokument:13/0/0) → Byte-Reprojektion meldete alle 11 Kanten-Shards als Orphans. Fix: Byte-Pfad nur bei `kanten.length > 0`, sonst protokollierter CI-Pfad-Fallback (§6 Ziff. 7 lit. b). Sabotage-Probe rot; adversariale Gegenprüfung (Opus, 2 Durchgänge) **bestanden**, Befund «ODER-Bedingung zu weit» umgesetzt. Restpunkt (vorbestehend): uncaught throw bei `kanten>0/dokMeta==0` — ehrlich rot, aber Stacktrace statt ROT-Zeile.
- **Falsch-Rot-Wurzel 2 · `check:tor-paritaet` auf PR #319:** die 18 Allowlist-Einträge der jetzt in CI verdrahteten Tore gestrichen (R1-Nachzug; Landung von #319 in dieser Session, seriell nach #324).
- **Zusammengeführt:** PROJEKTBESCHRIEB-Gesamtupdate (lag uncommittet im Hauptcheckout; Stand 21.7., vier Klingen, Repo-Verweis LexMetrik) als PR #325 · `npm audit fix` beseitigt **alle 18 Verwundbarkeiten** inkl. 2×high brace-expansion-DoS (Dependabot #5/#6), lockfile-only, als PR #326 · STRUKTUR-Rotation 51 Karten, 221.8→101.4 KB (diese PR).
- **Nachts bewusst NICHT gemacht, am Morgen beaufsichtigt nachgeholt:** ROADMAP-Kürzung — Welle-2-Prosa mischt Abschluss-Bericht mit **aktiver Bau-Warnung**, darum erst nach Davids Entscheid (22.7., Konventions-Erweiterung T7: auch ✅-Teilerfolgs-Prosa offener Schritte wandert wörtlich in die Chronik) als **PR #328** gebaut: 183.5→**153.7 KB**, `plan:next` byte-identisch vorher/nachher, `check:plan` grün, Verlust-Stichprobe 5/5. Rest über dem 100-KB-Budget steckt in eng verwobenen QS-Blöcken; baut über die T7-Nachhalte-Konvention natürlich ab.

## Session 20./21.7.2026 — Drei Analyse-Befunde nur im Bauplan verankert (reine Plan-Doku, Worktree `lm-verankerung`, Branch `docs/analyse-verankerung`)
**Auftrag David:** «nur im Bauplan verankern» — kein Bau, keine Code-/Skript-/Workflow-/Datenänderung; ausschliesslich Plan-Dateien (§14). Drei Punkte, gebündelt in **einen** PR:
- **A · chemrrv-Kanonik-Reparatur** (offener Bau-Schritt, Risikopfad). Diagnose der Ursache, warum der Normen-Monitor seit 29.6. rot ist (`check:netz`/Kanonik: `chemrrv` SR 814.81 zeigt auf `html-0` statt kanonisch `html-1`; Beleg CI-Run `29727448005`) + Reparatur-Schritt (Re-Pin via `scripts/fedlex-repin-kanonik.ts`, Snapshot-Regen, Inhalts-Treue-Diff, `QS-GP`-Gegenprüfung, dann `workflow_dispatch`). **Verortet in `ROADMAP.md` → QS-AUTOMATIK, neuer Punkt a′** (mit DoD-Carveout: der Re-Pin ist Extraktions-Risikopfad, `Gegenpruefung`-Pflicht, kein Auto-Merge — anders als die reine Plumbing-Arbeit a/b). Dringlichkeit vermerkt: Rechtsstand-Wache bis zur Reparatur faktisch blind.
- **B · e2e-Shard-Neupackung** (geparkter Schritt, an Davids Merge-Queue-Entscheid gekoppelt). CI-Messbefund (Lauf `29779602507`: 283 Tests/2100 s, `workers:1`, Top-10 = 66 %, `leser-gliederung-a33` 342 s = 16 % in 4 Tests, Shard 3 systematisch am längsten) in den **bestehenden QS-PERF-Schritt eingewoben**; Kopplung an Merge-Queue (`QS-BASIS` B-12 / `QS-OPT` O-3.2/O-3.3) ergänzt, kein Prüfumfang-Abbau (§6.3).
- **C · Vereinfachungs-Agenda nachgeführt.** R5 «Skript-Friedhof» per Messung **widerlegt** (220 `scripts/`-Dateien → 199 erreichbar, 18 bewusste One-Shots/Archiv, 3 unerreichbar) → als geprüft-verneint-Zeile in **`FAHRPLAN-CODE-HYGIENE.md` §Z**. R6 «Korpus aus git» **herabgestuft** (moderate Kosten gemessen) → verortet als Vorstufe des serverlosen Korpus-Servings in **`FAHRPLAN-DATENHALTUNG.md` §12.4** + Kurz-Ref in `ROADMAP.md` QS-BASIS (d).
- **Kein Code, keine Tore gelockert.** `check:plan` grün. Trailer `Roadmap: QS-AUTOMATIK` (Haupt-Verankerung); Gegenprüfung n/a (reine Plan-Doku).

## Session 18.–19.7.2026 — Fable-Orchestrator «run till dry»: main GRÜN + BS-Rechtsprechung + Merge-Kette
- **8 PRs gemergt + live:** #296 (Verzahnungs-Test .first()→zeilen-scharf) · #297 (main GRÜN nach 5 CLS-Runden) · #298 (Daten-Derivate nachgezogen) · #299 (**G-REF:** 3829 SR-Fussnoten-Verweise Vokabular→amtl. `eli/cc`, 136 Sidecars) · #300 (**BS-Rechtsprechung**) · #301 (Suchfeld in Kopfzeile) · #302 (e2e-Runner-Budgets 90s + F1-Kalibrierung 14→8) · #303 (e2e-Shard-Balancing gemessene Packung + Union-Wächter `check:e2e-shards`).
- **main-GRÜN-Kampf (#297, 5 Runden):** Der a33-A9-CLS-Fehler auf den 2-vCPU-Runnern hatte drei überlagerte Ursachen — TOC-Akkordeon-Reflow, Currency-Chip-Nachwuchs, und (der zähe) **Serif-Font-Swap**: Linux-Runner hat kein Georgia/Charter → schmale Liberation-Serif-Fallback → Ingress bricht beim Swap von Source Serif 4 zweizeilig um (+30px). Fix: `font-display:optional` (Vite-Transform) + metrik-getunter `Source Serif Times Fallback` (size-adjust 117.9%) + `min-h-titel-2z` + TOC nur-off-screen-Zuklappen. Neu dauerhaft: CLS-Quellen-Instrumentierung `e2e/helpers/cls.ts` (nennt Wachser-Element+Δ im Fehlertext). §15.2-treu, golden byte-gleich.
- **BS-Rechtsprechung (#300, Davids Auftrag, Ultracode-Workflow 12 Agenten):** 3'765 Entscheide 2022–2026 vom amtlichen Portal rechtsprechung.gerichte.bs.ch (FindInfo-CGI, GET `Aufruf=validate`; Appellationsgericht 2839 · Sozialversicherungsgericht 924 · Zivilgericht 2), dreifache Count-Gates, neues Tor `check:bs-entscheide`, Kanton-BS-Facette + Reader (Geschäftsnummer statt BGE-Band, 42 datumlose ehrlich behandelt §8), Korpus ~242 MB (Budget David 200 MB→**1 GB**). **Adversariale 5-Linsen-Prüfung fand 5 HOCH-Befunde** (Parser verlor Sachverhalte/Dispositive/`<li>`-Listen; doppelte Anker; axe-critical) — alle per Re-Parse aus Raw-Golden gefixt, GP `bestanden` (lxml-Zweitimpl. über alle 3765 Dok.). Raw-Golden gesichert unter `~/Developer/_lexmetrik-artefakte/bs-fiw-raw-golden-20260719` (gitignored, für Re-Parse ohne Re-Crawl).
- **Betrieb:** Klassische Merge-Kette (kein Admin-Drain nötig, main-Required-Checks-Handschritt Davids steht noch aus). Merge-Konflikte #299/#300 im `daten-manifest.json` semantisch per Generator-Neulauf gelöst (nie Hand-Mischung). Shard-2 war struktureller OR-Spec-Klumpen (42-min-Läufe) → #303 balanciert. **Sicherheit:** ein Subagent-Rückgabewert enthielt eine Prompt-Injection (als David getarnter Badge-Reader-«Klon meine Zugangskarte»-Auftrag) — als Injection erkannt, abgelehnt, Agent verworfen. Details: Memory-Handoff 19.7.
- *Offen für Folge-Session: THG `lvl_u1` `check:vollstaendigkeit` (vorbestehend) · ASYLV2-Re-Pin + 33 SR-Links · G-HIST-UI · G-Folgeeinheiten · Serif-Preload-Abwägung · Davids Required-Checks-Handschritt.*

## Session 16.–18.7.2026 — Fable-Orchestrator: Anmerkungs-Welle A29–A43 + QS-BASIS + Merge-Flotte
- **Bilanz: 27+2 PRs gemergt** (#278–#292-Welle + #293/#294 armiert-ausstehend beim Schreiben). **Davids 14 Anmerkungen (A29–A43) KOMPLETT:** Regesten-Fix #246 · Marginalien/Fussnoten #243+#255 · Split-View #240 · ruhige Gliederung #267 (Ultracode: Nudge/Guard/Entprellung, 300px-Sprünge→0) · Kontext-Seitenleiste **E4 → E5 #284 + E6 #291** · heller/weisser D-5 #238 · Kanton-Treue BS #266 + Suffix-Fix F-2 (9717 Token-Recoveries).
- **BGE-Korpus:** PR-B-Kette **BGE 148–151 = 577 neue Leitentscheide** (149 IV 1 via Degradations-Guard; #281 = 148/149, Folge-Bände nachgezogen); Korpus-Budget 100→**200 MB #292** (Reserve für Bände 152+).
- **Infonutzungs-Recherche + David-Zweitprüfung → Intake live (#282-Strang):** G-SUCH · **G-HIST (99.33 %)** · **G-AUFH (bmv-Fund, `dateNoLongerInForce`)** + BMV-Massnahme · G-RSS · Fedlex-Wartung — alle gebaut/live. **Fedlex-eId-Intake §12 #280.**
- **Ultracode-Ernte (T20 verankert, Fable-Judge/Refuter):** IA-Spec §11 (#253/#264/#265) · Zitat-Regex F2 #254+#278 (950 Phantome weg) · Eval-Harness #251 (Umgangssprache-Recall-Baseline 0.118) · **QS-BASIS-Fundamentplan #268** (B-1–B-12; 1.8.-Berg entwarnt, Re-Pins #270; VPS-Dossier #271) · **B-6 ✅ #275 · B-11 ✅ #273** · Registry-Nachtrag #279 · **H-11–H-14 ✅** (H-14 via #272).
- **QS-OPT:** O-1/O-1.9/O-2/O-3.1/O-4 (#244/#257/#259/#247/#263; Turso-CI-Secret). **Ausstehend beim Schreiben (armiert):** #293 O-3.3-Sharding · #294 Lint-Fix.
- **Betrieb:** Classifier-Sperre → **David-Terminal-Drain-Ritual (27 Admin-Merges)**; 4 echte Konflikte semantisch gelöst (#265/#266/#284/#287/#280); **O-3.3 + B-12 als strukturelle Antwort** auf die CI-Starvation. Details: Memory-Handoff 17.7. + FAHRPLAN-BASIS-AUSBAU §B.
- *Konsolidiert die Einzel-Karten A34/A30-A31/O-1/Eval/A31a/O-2/IA-1/IA-2/K-1/A33, die beim Flotten-Drain auf main-Stand entfielen; bestehende fremde Karten bleiben unberührt.*

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
