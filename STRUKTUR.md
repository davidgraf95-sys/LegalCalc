# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/ROADMAP,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP). Die AG-Bausteinliste ist seit
dem 14.8.2026 (Entscheid David) **kein Bestand mehr**, sondern ein Erzeugnis:
`npm run abnahme:ag` schreibt sie bei Bedarf in <1 s ins Root, gitignoriert. Die
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

## Session 16./17.8.2026 (Nachmittag–Nacht) — Gesetz-Leser V3: Konzept → Design-Grundlage → Prototyp → H1 live, S3 gemergt, H2 im Landeanflug (W2·5m-LESER-V3)

- **Phase 0/0b/V-0 (docs, #532):** 19 Anmerkungen David gesammelt (`00-auftrag`), Ist-Inventar 16 068 Z./71 Dateien, Referenz-/HIG-Recherche (Primärbeleg per Browser), Council-Review (5 Berater · 3 Peer-Reviews · Advocatus Diaboli · Vorsitz) kippte den Entwurf auf **Option III Hybrid**: neue Hülle hinter `?leser=v3` in der 8-Zeilen-Fassade, Kern unangetastet, Deckel 5 Hüllen-PRs, Flip + Löschung eigene Etappen. Design-Grundlage (7 Typo-Stufen · 8 Spacing · 14 Farbrollen · 3 Radien/Ebenen), Klick-Prototyp (StPO Art. 426–432 echt, 12 Screens) → David: F3=V1 · F7=A · F8=Lasche (weg, wenn «Rechtsprechung im Text» aus) · D-A/D-B/D-C.
- **Gelandet:** D0 Farbfix (#534: Tailwind `/NN` bei `var()`-Farben erzeugte keine Regel, 22 Klassen/90 Stellen unsichtbar; `alphaFaehig()` + Wächter) · **H1** (#537, `2a1388efb`): Rahmen · Kopf · Seitenleiste (Übersichtsbox → Such-/Sprungfeld → Gliederung) · Flag-Playwright-Projekt · Tab-Titel-Parität; zwei Prüfer (Bug + Architektur «tragfähig mit Nachzug» → eingearbeitet), Ästhetik-Live-Urteil 5,5/10 → Ä1–Ä14 · **S3** (#540, `210ec466f`): Erlass-Kopf neu, Standausweis «gegen Fedlex-Konsolidierung geprüft», Warnung nur bei geltender nicht konsolidierter Änderung (Stichtagsfilter — vorher 66 Erlasse mit Warnung bis 2034), Gegenprüfung bestanden mit Fund **FZA falsch-positiv** (Generator, QS-KORPUS-Position), Ästhetik 7/10.
- **H2** (#539, Branch `feat/leser-v3-h2`, Worktree `LexMetrik-h2`): drei Prüfer durch, Nachzüge drin; CI-Rot Shard 7 (OR, alte Hülle) diagnostiziert «kein H2-Defekt, Wurzel auf main»; Merge-Konflikt mit S3 offen → **Übergabe an neue Session** (`docs/ux-audit-2026-07/reader/leser-v3-handoff-2026-08-17.md`).
- **Prozess-Lehren:** Hook «Merge + Aufräumen nie in einer Zeile» (#535, Vorfall #533) · §0 «refactor ohne Testdateien» (#538, Vorfall #536) · §0 «tsc -b statt --noEmit -p» · §0 «sparsam pushen» (Vercel-Tageslimit 16.8. abends — Prod 24 h blockiert, Wurzel-Fix wartet auf David) · Testtreue-Squash-Muster (#537).
- **Regeln David 16.8. (Memory `leser-v3-dauer-go`):** Dauer-Go bis H4-Vorbereitung; je Etappe drei Prüfer (Bug · Ästhetik · Architektur/Erlass-Neutralität + Wartbarkeit); Ä-Checkliste bis zum Schluss; Bund-/Kantons-Probe; Split-View immer; H4 nur mit seinem Ja.
- **Wartet auf David:** H4-Flip (Kontaktbogen) · S2 (Bild) · Vercel-Wurzelfix · `git config --unset core.hooksPath` (lokal).

## Session 16.8.2026 — W2·5h-GESETZ-UI abgeschlossen (Linien-Rückbau V1, #530) + Deploy-Ausfall seit #519 behoben (#531)

- **Gebaut (1 lex-bau, 2 lex-pruefung):** Guide-Mechanik komplett zurückgebaut (Entscheid David 13.8. «linien ganz entfernen»): `linienAufbau.ts`→`strukturTiefe.ts` (Kennzahl über 1 420 Sidecars identisch), Schalter «Linien» + Feld `linien` weg, CSS/Tailwind-Token `guide` weg, Linien-Kanon Teil B gestrichen (§6.7, Teil A rot-geprobt), Reglement §4b/§4b-A/§4c aufgehoben; Wächter-Spec `leser-ohne-gliederungslinie` neu. Vorher/Nachher-Beweis `docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/` (Prüfer-Korrektur: 1 CSS-px Horizontalverschiebung, nicht «layout-neutral»). Merge `1d571c6ed`, Dach-Schritt done (letzte Position).
- **Tore:** gate grün · golden 256 byte-gleich · e2e voll 529/531 (2 Flakes im Einzellauf grün) · CI 15/15 · kein Risikopfad.
- **§17-Wurzel-Fix:** Auto-Buchung scheiterte an `check:plan` («@queue-ID ist done») → `plan:set status=done` räumt die eigene ID jetzt selbst aus der `@queue` (`scripts/plan/set.ts` + 3 Tests). Hand-Buchung im Sammel-Push.
- **Deploy-Ausfall entdeckt und behoben (PR #531, `835bcd06e`, QS-AUTOMATIK):** Nachkontrolle zeigte Prod ohne den Rückbau — ALLE Prod-Deployments seit #519 (15.8.) waren `Canceled by Ignored Build Step` (#520, #512, #521, #524, #529, #523, #530 nie live; Prod-Smoke sah nur HTTP 200). Ursache: `git rev-parse --verify <40-Hex>` = Exit 0 ohne Objekt (Shallow-Clone), `git diff` «bad object», grep leer, `!` ⇒ Skip. Fix: `scripts/vercel-ignore.sh` (POSIX; unsicher ⇒ bauen; Vercel-Limit 256 Zeichen erzwang die Datei — Inline-Fassung starb als Preview-ERROR), `<meta name="lexmetrik-build">` in allen 8169 Seiten, Prod-Smoke-Wächter `pruefeBuildStand` (Rot-Beweis gegen Live: «Build-Kennung fehlt»; Frische-Toleranz misst jüngsten CODE-Commit — Prüfer-Auflage), Test 9 Fälle alt/neu. Nach Merge: Vercel baute (`835bcd06` live, Linien-Token 0, Smoke 15/15 grün) — 8 Merges auf einen Schlag live. Lehren verankert: §0 Commit-Message per -F/Heredoc (2 Backtick-Vorfälle), Landung-Nachkontrolle prüft Deployment-STATE.
- **Offen:** für David nur lokal: `git config --unset core.hooksPath` (zeigt auf gelöschtes `~/Desktop/LegalCalc/.git/hooks`, Hooks laufen nie; Classifier sperrte den Befehl). Nebenfunde nicht gebaut: Wächter-Spec blind für Linien via `::before`/`box-shadow` (niedrig); `.github/scripts/prod-smoke.sh` (normen-monitor) kennt den Prod-Stand-Wächter nicht; 2 alte `worktree-agent-*`-Branches ohne Schritt-Bezug (fremd, nicht angefasst).

## Session 15.8.2026 — BAUPLAN-UMBAU: lebendige Specs, Gross-Schnitt, Doku-Diät (PR #507)

**QS-EFFIZIENZ · BAUPLAN-UMBAU (David 15.8.) komplett; 8 Unteragenten (3 Recherche, 2 Bau, 3 Gegenprüfung).** Messen vor Handeln: SotA-Web-Recherche (`bibliothek/betrieb/agenten-bauplanung-sota-2026-08-15.md`) + Repo-Inventar + Messdaten (Kern-Beleg: 51 % Doku-Commits seit 1.8. vs. 12,5 % Produkt-Code; fahrplaene/ 16 015 Zeilen).

- **Lebendige Spec** (OpenSpec-Muster): Banner in `fahrplan-slice` an jedem Slice, bauschritt Station B, Fahrplan-§-Diät als aufraeumen.md §4b; live angewandt: GESETZES-UX/FEDLEX-PORTFOLIO −795 Z. wörtlich archiviert (5/5 byte-geprüft).
- **Gross-Schnitt:** 14 Etiketten → 5 Dächer (65 → 53; W2·6, W2·6-RESOLVER, W2·5g-ZEIT, W3-AUSBAU neu, QS-KORPUS neu); unabhängige Gegenprüfung BESTANDEN MIT AUFLAGEN → Auflagen behoben (Risikoklassen-Doku wahr, QS-GP-Vermerke an MEHRSPRACH/FILTER-Zeile, 22+2+5 tote ID-Stellen nachgezogen). Nebenfund-Fix: `RECHNEN_RE` +zustellfiktion/zustellung.
- **Doku-Diät:** Kurzkarte = Session-Karten-Default (Station E). §9-Bug-Check: Code-Lupe + 6/6 empirische Repros, keine blockierenden Befunde.
- **Dependabot:** #501 gemergt; #500/#502/#504 Auto-Merge scharf (Lock-Fix npx npm@10, H-8-Muster, auf #502/#504 gepusht); #503 tailwind 3→4 + Lock-Wurzelfix → QS-BASIS-Checklisten-Zeilen.
- **Nachmittag/Nacht (Weiterbau bis Stopp, «alles Angefangene vollständig beenden», David 15./16.8.) — 15 PRs gelandet (#507–#529 ohne #510/#525–528):** Lock-Wurzelfix npm-Major (#508) · MCP-Hook-Deckung + toter Deploy-Matcher repariert (#509) · Lagebild-Nachzug (#511) · Rückbau-Sweep: Jagdgebiet sauber, blindes WARN-Tor scharf (#512) · Skills-Diät −13 % + main-Push-Hook (#513) · Dependabot-Gruppen (#514) · QS-TYP-LUECKE 30 Typfehler, 2 Logiklücken (#515, GP bestanden) · QS-AUTOMATIK Bericht/Autozug/Paritäts-Sonde (#516) · tsc inkrementell 21 s→0.2 s (#517) · QS-CURRENCY-TESTS 15 Fälle (#518) · vercel.json: nur main baut + PREVIOUS_SHA (#519) · QS-CODE-PROP 12 Engines/81 Invarianten/99 Tests, kein Engine-Defekt, 2 SchKG-Fachfragen an David (#520) · kanton-manifest Import-Schreibeffekt weg (#521, GP) · QS-UI (b) konform + Tor entflakt (#522) · QS-FRIT-DRIFT Stufe 1: 3 echte Fedlex-Fehler OR/PatG/BewG fr/it (#523, GP) · ESTV-MWST-Drift behoben, Monitor grün, Issue #496 zu (#524, GP) · Steuerungs-Deckel check:steuerdeckel in Kette+CI (#529). QS-EXTQUELLEN done (13 Befunde, David: «nicht kommerziell» → Lizenz-Politik im Quellen-Register).
- **Lehren verankert (Formregel Tor>Skill>Prosa):** F2g Tor rot ohne Defekt (reduced-motion), F2h Wächter wartet stumm auf CLEAN (7 h Stillstand 17:24→00:33 — Merge-Kriterium = Required-Liste, Stillstand laut, Stillstands-Anker Pflicht Station D), F5-Wartetod (Sub-Agent spawnt nie eigene Gegenprüfung → dispatch.ts daten-Klasse). **Vereinfacht:** Landungs-Rolle nur bei Parallel-Session, Buchungs-Trailer EINE Quelle (PR-Body), §9-Bug-Check nach Diff-Klasse, Regel «Feature einzeln / Verwaltung gebündelt» (Hook + Skills), Preview-Deploys aus. **Auto-Buchung lief erstmals live** (PAT-Secret aktiv, «QS-AUTOMATIK -> ready automatisch»).
- **Zeilenbilanz Session:** src/lib ±0 · Darstellung ±0 · Tests +2 084 (Prüftiefe Rechtslogik, gewollt) · Doku +980 (Chronik-Wortlaut/Archiv, Umzug) · Steuerung +240 (→ Deckel) · Konfig −181.
- **OFFEN für Folge-Session:** QS-EFFIZIENZ-Zeile ist eine Merge-Konflikt-Falle (heute 6 Konflikte in EINER Zeile — Checkliste in eigene Datei auslagern) · SchKG-Fachfragen SF-F1/F2 (David) · Fedlex-Meldung der 4 fr/it-Fehler (David) · QS-FRIT-DRIFT Stufe 2 · Fahrplan-§-Diät auf restliche 24 Fahrpläne (~−5 000 Z., grösster Rückbau-Posten).
- **Landung (Nachtrag):** #507 gemergt als `f6d8925fa`, Prod-Deploy success, 6 Kernrouten 200. Verzögerung ~7 h: Vercel-Tageslimit + Wächter-Lücke (mein Ad-hoc-Monitor deckte BEHIND nicht ab — Regel stand im Landung-Skill Ziff. 2, war im Monitor nicht implementiert; behoben durch Hand-`update-branch`, Folge-Monitor mit BEHIND-Pfad). Plan-Buchung: Workflow «success» ohne Push (still!) — Beleg am offenen Auto-Buchungs-Punkt vermerkt, Hand-Buchung `status=ready` ausgeführt.

## Session 14./15.8.2026 (Teil 5) — Aktivierungs-Audit, Rechtsstand-Reparatur, Test-Stabilisierung (#495, #497, #498, #499, #505)

**Fortsetzung derselben Session (Dauerauftrag); ~12 weitere Unteragenten (Recherche/Bau/Daten/Mechanik/Gegenprüfung), jede Landung einzeln gegengeprüft.** Auslöser war Davids Frage nach dem Token-Messungs-Ausfall: «prüfe, was sonst noch liegen geblieben ist».

- **Aktivierungs-Audit (Klasse «gebucht, nie bewiesen»):** Normen-Monitor ≥5 Wochen rot bei ignorierter Eskalation · Wächter 5 Tage rot ohne Meldeweg · Fedlex-Auto-Merge nie End-zu-Ende · Selbstopt-Messreihe handbetrieben · Token-Messung halb konfiguriert. ALLE fünf behoben oder verankert; sauber belegt: prod-smoke, turso, perf-lighthouse, Hook-Kette.
- **Der Monitor hatte recht — echte Rechtsstand-Lücken (#499, Risikopfad, Verdikt registriert):** LIK 2026-05→07 (BFS, 0 stille Revisionen, Vollabgleich 3184/3184) · Botschaften 401→405 (AIG + 3 Nachzügler, SPARQL-rederiviert 5/5) · VERN-2026-79 = Fedlex-Umnummerierungs-Doppel mit fremdführendem Link (§8) bereinigt · Projektions-Kaskade (Sidecars/Zähler/Manifest) nachgezogen — Kaskaden-Lücke als Befund (g), Frische-Automat um gen:historie/check:historie ergänzt.
- **#497 (14 Pins) nach 2 Gegenprüfungs-Runden gelandet:** Kanonik 14/14 selbst rederiviert; PR von 574 auf 10 Dateien entbläht (Automaten-Churn inkl. 115 Kanton-Dateien = Befund a2); currency.json-Behalt begründet; TGBV-Leerzeichen als Extraktor-Muster (h) erkannt, Daten quellentreu belassen.
- **QS-E2E-STABIL done (#505):** 43 Messläufe/4 Lastbedingungen; Kern-Einsicht: Parallel-Last verzehnfacht die STREUUNG, nicht den Mittelwert — Deckel je QS-PERF Ziff. 5 aus dokumentierten Reihen, eine Budget-Quelle statt 7 Gabeln (wertgleich bewiesen), 6/6 Abnahme ohne Timeout-Flake; Rohdaten kompakt committet (Minimalismus: 20 606→673 Diff-Zeilen). Folgebefunde als Fehlerbuch-Zeilen.
- **Werkzeug-Analyse umgesetzt (#498):** ast-grep endlich real installiert (Präambel-Pflicht war unerfüllbar), MCP-Deploy-/Kauf-Riegel (Rot/Grün bewiesen), dependabot, QS-TYP-LUECKE als ready-Schritt (33 belegte Typfehler ausserhalb tsc-Abdeckung). Lockfile-Lehre: Neuschriebe nur mit npm@10 (CI-Version; npm 11 warf nested-Eintrag weg).
- **Automatik End-zu-Ende bewiesen:** PLAN_BUCHUNG_TOKEN (David) → erste vollautomatische Plan-Buchung durch den Branch-Schutz · Wächter-Selbstmeldung erzeugte live Issue #496 · Token-Spool schrieb erste Zeile.
- **Regel-Anker (Auftrag David):** Minimalismus-Prinzip ausserhalb der Rechtsschicht (rules/schichtentrennung, pfad-lazy) · Code-Streich-Massstab «Beweis vor Löschung, §1-Vorbehalt» (aufraeumen.md) · Alt-Entscheide-Audit: Direktive 14.6. als revidiert markiert, HANDLUNGSPLAN-Totverweise korrigiert · Entregulierung Runde 2 geplant (Start ~21.8., Prompt im Dossier entregulierung-2026-08-07).
- **Eigenfehler quittiert:** 2× main-Push in offene Landekette (Falle c — kostete je einen update-branch-Zyklus).
- **Schluss-Runde 15.8. (nach Karten-Erstfassung):** Fedlex-Auto-Merge erstmals End-zu-Ende (#497 mergte unbeaufsichtigt nach Verdikt) · Bau-Prompt 25→10 Zeilen verschlankt (Kopien raus, je Streichung Regelverlust-Tor; Token-Zeile auf Davids Wunsch drin; Grössen-Zeile raus) · Schritt-Grössenordnung hochkalibriert (Referenz = orchestrierte Session; Zusammenlegung W2·6-Familie u. a. als erster Zug der Folge-Session) · Shard-Neubalancierung (#506, Spread 2 Min→<1 s, Beweis-Lauf 4.3–4.9 Min) · Testapparat-Rückbau in §17-Gegengewicht verankert · Dependabot lieferte sofort 5 PRs (#500–504, tailwind-Major dabei).
- **Wartet auf David:** nur Domain lexmetrik.ch (seit Juni offen, Squatting-Risiko).

## Session 14.8.2026 (Teil 4) — Effizienz-Dauerauftrag Runde 1+2 (#492, #493) + QS-TOK-DECKEL per Messung

**Gleiche Session wie Teil 3; stehender Auftrag David («bau immer weiter … bis ich stop sage», Memory `dauerauftrag-effizienz-2026-08-14`), Anker `QS-EFFIZIENZ` (wip, Querschnitt), Worktree `lexmetrik-effizienz`. 5 Unteragenten (2 Bau sonnet, 1 Mechanik, 2 Recherche sonnet, 1 Gegenprüfung fable); #492 mergte David per Auto-Merge, #493 der Orchestrator.**

- **#492:** plan-buchung.yml liest Trailer ersatzweise aus dem PR-Body (Wurzel-Fix Lehre #491; Gegenprüfung erzwang Footer-Toleranz — sonst wäre der Fallback bei Haus-Bodies nie gefeuert —, Squash-Verifikation gegen falschen PR-Bezug, Einrückungs-/Fence-Härtung) · dispatch-schutz-Vorschlag vom 7.8. angewendet (Prüf-Freitexte 3 statt 6 Punkte; Tor-Guard «0 geprüfte Dateien ⇒ rot»). PR-Body-Trailer-Konvention in `landung` Schritt 9 verankert. Erster Live-Lauf des Fallbacks: korrekt still.
- **#493:** Halden (verwaistes Fixture gelöscht, 2 Doku-Snapshots byte-gleich nach archiv/; COWORK-Duo als gitignorierte Lokaldateien erkannt und unangetastet — Mechanik-Guard fing zwei Sweep-Fehlklassierungen) · Regelaudit nach §17-Gegengewicht (Befund: Bestand weitgehend konsolidiert, 0 unverzahnte Duplikate; §11 gestrafft, Gegenprüfungs-Skill als einziger undatierter datiert) · Testtreue-Präfix-Grenzfälle eingefroren (Audit-Anlass war teils überholt — Nullprobe des Bau-Agenten korrigierte ihn).
- **QS-TOK-DECKEL done per Messung statt Bau:** 19 getrackte Root-md ≤ Deckel 20 (Ist 22 vom 31.7. durch QS-PLAN-EINFACH überholt); nichts verschoben.
- Offen im Dauerauftrag: Live-Beweis subagent-wache (`agent_type`-Laufzeitwert; erst Folge-Session — Hooks laden beim Start).

## Session 14.8.2026 (Teil 3) — QS-HOOKS-AUSBAU: SubagentStop-Wache §14.7, Abschluss-Wache §17, Pfad-Regeln, Sandbox-Entscheid (#491)

**Fable-Orchestrator, 4 Unteragenten (1 Recherche sonnet, 1 Bau sonnet, 1 Synthese, 1 Gegenprüfung opus); Merge durch David (Auto-Merge um 16:44 aktiviert, feuerte bei CI-Grün).** Alle vier freigegebenen Punkte gebaut; Schritt `done` (Hand-Buchung, s. Lehre).

- **SubagentStop-Wache** (`subagent-wache.py`): Erfolgsbericht schreibender lex-Klassen ohne prüfbares Artefakt → einmal blockiert (§14.7 auf Tool-Ebene). Rot/Grün mit 10 Sonden + 15 Vitest-Fällen (`hooks-wache.test.ts`).
- **Abschluss-Wache** (`abschluss-wache.py`): SessionEnd (nicht blockierbar, Doku-Befund) misst uncommitted/unpushed → `.session-nachlass.json`; SessionStart meldet einmal in den Kontext (§17-Check über die Session-Grenze). wip allein löst nichts aus (Cry-Wolf-Auflage).
- **`.claude/rules/`**: §3/§4/§13 wortlaut-treu (SHA-verifiziert) in paths-gescopte Regel-Dateien; CLAUDE.md 247→232 Zeilen (Richtwert <200 nicht erreicht — Rest ist nicht pfadgebunden, gemeldet statt gequetscht). Live-Ladeverhalten für Sub-Agenten noch unbelegt.
- **Sandbox geprüft, nicht aktiviert:** gh (Landungs-Werkzeug) scheitert laut Doku teils an TLS unter Seatbelt; belegte Vorfallsklassen schon durch Hooks/Permissions gedeckt. Dossier `bibliothek/recherche/sandbox-pruefung-2026-08-14.md`, David-Veto möglich.
- **Gegenprüfung (Opus, gegen die installierte Binary 2.1.220)** fand 2 schwere + 4 moderate Befunde VOR der Landung — u. a. blockierte die Wache schema-treue Berichte (B1), las verneinte Erfolgswörter als Erfolg (B2), und `stop_hook_active`/`reason` existieren entgegen der Web-Doku (B3/B5). Alle Auflagen umgesetzt, Original-Sonden grün nachgefahren; Artefakt-Pflicht (Commit-SHA) jetzt auch im RÜCKGABE-Schema von daten/mechanisch/synthese.
- **Token-Disziplin dauerhaft:** TOKEN-DISZIPLIN-Zeile in der gemeinsamen Agenten-Präambel (dispatch-agents.ts, Auftrag David 14.8.2026).
- **Lehre (Auto-Buchung):** Davids Auto-Merge nahm den GitHub-Standard-Squash-Text — der vorbereitete `Roadmap-Status:`-Trailer erreichte den Commit nie, `plan-buchung.yml` blieb korrekt still, Buchung von Hand. Wurzel-Fix (Trailer-Fallback aus dem PR-Body) ist erster Punkt des anschliessenden Effizienz-Dauerauftrags (Chat-Freigabe David 14.8.2026, s. Memory).

## Session 14.8.2026 (Teil 2) — QS-PLAN-EINFACH abgeschlossen: Skills-Diät, Halden-Abbau, Etiketten 79→63, Auto-Buchung, CI-Klasse app-fern, Lagebild (#490)

**Fable-Orchestrator, 6 Unteragenten nach Stufen (2× Bau sonnet, 2× Mechanik, 1× Recherche, 2× Gegenprüfung + 1 Einsortierungs-Prüfung), Merge durch David.** Rest-Checkliste von QS-PLAN-EINFACH vollzogen + Davids Optimierungs-Punkte 1–3; Schritt `done`, Block in der Chronik.

- **Skills-Diät:** auftrag 15.9→9.5 KB (neu: Einsortier-Tabelle), bauschritt/aufraeumen je ~−33 %. Das Regelverlust-Tor fing eine zu scharfe Kürzung (Station-W-Wortlaute) — wörtlich bedient, Test unverändert (§6.3).
- **Halden:** Sessionkarten 791 KB → 3 Monatsdateien (308 Karten byte-treu, Hook rotiert monatsweise nach Karten-Datum) · 15 Null-Verweis-Archivdateien gelöscht (Audit «17/155 KB» unabhängig auf 15/130 korrigiert) · 22 erledigte Fahrplan-Abschnitte → `archiv/FAHRPLAN-ERLEDIGT-ABSCHNITTE.md` (Byte-Bilanz exakt), 2 Grenzfälle belassen.
- **Etiketten 79→63:** 16 Kleinst-Etiketten als Checklisten-Zeilen in 7 Dächer; Einsortierung durch unabhängigen Prüfer verifiziert (Verdikt OK; Auflagen umgesetzt: Worktree-Pflicht QS-GP/QS-BASIS, Trailer-Zeilen dreier Fahrpläne, Kollisions-Pfade, Chronik-Präzisierung).
- **Auto-Buchung (Punkt 1):** `plan-buchung.yml` bucht `Roadmap-Status:`-Trailer nach Merge; Gegenprüfung fand Shell-Injection (env-Mapping + Zeichensatz-Wache nachgerüstet, Rotfälle im Test) + Push-Race (Rebase). Erster Live-Lauf: korrekt still (GitHub-Standard-Merge-Text trägt den Trailer nicht im Trailer-Block — Fail-safe wie designt; Lagebild-Prompt liefert den Trailer künftig richtig).
- **CI-Klasse `code-fern` (Punkt 3):** app-ferne Diffs überspringen nur die 8 Playwright-Shards (78 % der CI-Zeit), Bau + Node-Tore voll; Regex-Parität Bash↔TS gegengeprüft, `\.md$` nachgeschärft.
- **Lagebild (David):** Anstehend-Karten (1-Satz-Ziel, Checklisten-Fortschritt), Verknüpfungs-Chips (dieselbe `kollidiert()`-Regel wie der Resolver), Bau-Prompt mit Checklisten-Spec + Trailer-Hinweis; bildSeiten.ts bewusst in die Schlankheits-Baseline (843 Z., Begründung im Commit).
- **Freigaben verankert:** `QS-HOOKS-AUSBAU` entsperrt («alle hooks freigegeben», Bau in eigener Session). **Lehre (§12.2, an mir selbst):** zwei `add -A`-Commits während laufender Agenten zogen fremde Halbstände mit — ab da nur Pathspec-Commits; bestehende Regel, kein neuer Anker nötig.
- e2e: 539 grün + 2 isolierte Flakes (Wiederholung 8/8 grün; als Fehlerbuch-Zeile erfasst). Gate voll grün, alle 42 Tore.

## Session 14.8.2026 — QS-PLAN-EINFACH gebaut: Feld-Diät, ROADMAP 100→78 KB, Schein-Tore ehrlich (feat/qs-plan-einfach)

**Fable-Orchestrator, drei Commits, Auftrag David im Chat («roadmap zu kompliziert — vereinfachen, Sessions sollen offener entscheiden»).** Kern des offenen Schritts `QS-PLAN-EINFACH` umgesetzt; alle Massnahmen folgen dem gegengeprüften Audit vom 13./14.8.

- **Feld-Diät (`cc89fd3d0`):** `of`, `seq-hart`, `seq-weich`, `statusAgent` aus Etikett-Typ, Parser (tolerant), Serializer, `plan:set`-FELDER, `dump`, `resolve` (Zweig `wartetFachzeit` entfernt) und allen 79 ROADMAP-Etiketten gestrichen; `check:plan` Regel 12 (`groesse`-Vokabular) weg. 310 Plan-Tests nachgezogen (deklarierte fachliche Änderung), tsc + check:plan grün.
- **ROADMAP-Verschlankung (`9785f3596`):** 100.1 → 77.9 KB. Schritt-Prosa auf Zielform; neu im Kopf: **«Schritte nennen Ziel und Grenzen, nicht den Weg.»** Leitprinzip 6 an die geltende Deploy-Praxis angeglichen (Merge = Deploy — alter Wortlaut «nur auf Davids frisches Ja» widersprach dem Protokoll). Beweis: `plan:dump` vorher/nachher **byte-gleich**; erledigte Checkbox-Zeilen + Streichungs-Begründung in der Chronik (Voll-Wortlaut: ROADMAP@`cc89fd3d0`).
- **Pflege billiger (`8c544a9fd`):** Rotations-Hysterese (Riss ⇒ Räumen bis 90 % Budget statt 49 Byte Luft) · `check:zitate` mit echtem Abbruchpfad, live rot gezeigt (ohne Caches meldete es bisher «0 Befunde» bei null geprüften Zitaten) · `check:inventur` → `report:inventur`, aus check:seriell + ci.yml entfernt. `check:tor-paritaet` OK, alle 42 Sub-Checks parallel grün (14.2 s).
- **Offen am Schritt (Checkliste):** Skill-Diät (`auftrag`/`bauschritt`/`aufraeumen.md`) · Halden-Abbau (791-KB-Kartenarchiv, tote Archivdateien, nicht-steuernde Fahrplan-§§) · Etiketten-Sterblichkeit (50/79 nie in einem Commit genannt).

## Session 7.–8.8.2026 (Nacht) — W2·10-UI-NAV -S/-V/-O/-J gelandet + QS-GP-BEREICH + 3 Sicherheits-Patches (#463–#467)

**Fable-Orchestrator, entschleunigter Zyklus je Einheit: Opus-Bau → adversariale Gegenprüfung (anderes Modell, read-only) → Auflagen-Fix → nächste; adversarialer Schlussdurchgang vor der Landung; serielle Landekette #464→#463→#465→#466→#467, alle gemergt.**

- **W2·10-UI-NAV (PR #464, Squash `d919d9d03`):** vier Teilschritte — **-S** `?q=`-Durchreichung + mobiler Such-Fokusmodus (≥16 px, kein iOS-Zoom) · **-V** Hover-Vorschau am NormPopover (nicht-modal, ohne Klick-Fänger) + interner NormChip-href + Vorlage↔Rechner-Kreuzlinks über bestehendes `related` (§5) · **-O** Sidebar-Konsistenz (Label navigiert, Auto-Expand; tote Sprunganker angeschlossen) + Kantons-Intro §8-ehrlich + Scope-Labels + `lc-input-sm`-Zoom-Fix · **-J** Jahrgangs-Sprungleiste mit Sichtfenster-Deckel (kein Klick rendert > eine Batch-Breite; Restoration inkl. Reload) + Mobil-Filter-Bottom-Sheet + News-Karten-Politur. Vom Dach offen nur noch **-J3** (Risikopfad, eigene Session). Gegenprüfungen fanden u. a.: Back-Rücknahme des `?q=`-Spiegels (ERNST, gefixt + F7-Lehre), Hover-Backdrop-Flacker-Blocker (gefixt mit Ursachen-Rotbeweis), Jahr-Sprung sprengte den DOM-Deckel (Fenster-Umbau), Zähl-Paritäten. Risiko-Quittung startseiteKartenFristen im Register (Hash unabhängig nachgerechnet).
- **QS-GP-BEREICH (PR #466, done):** `gegenpruefung:ok --bereich` + Tor prüft `origin/main..HEAD` — beendet die Hand-Hash-Ära (4 Präzedenzfälle); Gegenprüfung mit Live-Sabotagen bestanden (Auflagen umgesetzt: Range-Semantik ehrlich inkl. Voll-Bereich-Warnung, getracktes Pending enttrackt, Diagnose-Ehrlichkeit, Gitlink wirft). `QS-GP-PREPUSH` damit baubar.
- **Sicherheit:** #463 react-router/dompurify (beide Pfade nicht erreichbar, Patch-Bumps) · #467 nanoid 5.1.16 (Alert #22, chirurgischer 6-Zeilen-Lock-Patch gegen die Coverage-Peer-Dep-Falle) — **0 offene Alerts**.
- **Negativ-Ergebnis verankert (PR #465):** r1-r2-CI-Wurzel «rendert alle Treffer» durch Messung WIDERLEGT; echte Signatur: zweiter schwerer OR-Reader je Chromium-Worker wird nie betreten, Retry = frischer Worker; nächster Schritt CI-Forensik (QS-E2E-STABIL nachgeführt).
- **§17-Ernte:** Lehre F7 (URL-Spiegel rückwärts testen) · aufraeumen-Verify grept jetzt bibliothek/docs/Root + check:bibliothek vor Doku-Push (toter-Link-Vorfall heilte `57ebeca56`) · QS-GP-COMMITDIFF-Duplikat in QS-GP-BEREICH fusioniert · QS-KORPUS-RSPR-DATUM neu (bge_151_II_475 trägt Datum 1999) · merge-schutz-Diff-Härtung als QS-GP-NACHBEFUNDE (d) · Landungs-Lektion: API-`update-branch` löst kein Vercel-Deployment aus (Required-Kontext fehlt dann) — echter Push nötig.

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
(Skill `landung`).

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

**Spät-Session 7.6.2026 (Kurzspiegel; Details ROADMAP.md A.0):**
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
