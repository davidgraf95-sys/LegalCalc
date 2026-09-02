# Fremde Bau-Agenten unter Google AI Pro — Jules, Antigravity CLI, Gemini

**Erstellt:** 2./3.9.2026 · Anlass: David hat Google AI Pro abonniert und
gefragt, was davon im LexMetrik-Bau eine Rolle übernehmen kann. Erhoben von
drei read-only-Recherche-Unteragenten (WebSearch/WebFetch), Abrufdatum
2. bzw. 3.9.2026.

**Status:** ERSTRECHERCHE (einfach belegt). Einzelne Punkte sind ausdrücklich
als **unklar** oder **anekdotisch** markiert und dürfen nicht als belegt
weiterverwendet werden.

**Quellenart — Abweichung von S3 deklariert:** Die tragenden Belege sind
**Hersteller-Dokumentation** (Google) und eine **arXiv-Preprint-Studie**, nicht
amtliche Schweizer Quellen. Für Produkteigenschaften eines Anbieters ist dessen
eigene Doku die Primärquelle; sie ist aber jederzeit einseitig änderbar. Alle
Zahlen unten sind **Momentaufnahmen vom Abrufdatum**, keine Zusicherungen.

**Verwendung im Repo:** `fahrplaene/FAHRPLAN-FREMDAGENTEN.md` (Rollenmodell,
Phasen, Messkriterien) · `AGENTS.md` (Regelwerk für fremde Agenten) ·
ROADMAP-Schritt `QS-FREMDAGENTEN`.

---

## 1 · Was in Google AI Pro enthalten ist (Stand 3.9.2026)

| Baustein | Wesentliches | Quelle (Abruf 3.9.2026) |
|---|---|---|
| **Jules** (Coding-Agent) | 100 Tasks/Tag, 15 parallel, Modell ab Gemini 3 Pro (Free-Tier: 15/Tag, 3 parallel) | `jules.google/docs/usage-limits/` |
| **Antigravity** IDE + CLI | AI Pro = «High, generous quota, refreshed every five hours until weekly limit reached» — **keine Zahlen genannt** | `antigravity.google/docs/plans/` |
| **Gemini-App** | Gemini 3.1 Pro, 1-Mio-Token-Kontext, Deep Research ~20/Tag (sekundär); Deep Think nur Ultra | `gemini.google/subscriptions` · `support.google.com/gemini/answer/16275805` |
| **NotebookLM Pro** | 500 Notebooks / 300 Quellen / 20 Audio-Overviews pro Tag — **Limit-Änderung per 2.9.2026 angekündigt, neue Zahlen offen** | `support.google.com/notebooklm/answer/16213268` |
| Gemini in Gmail/Docs/Sheets · Flow 1000 Credits/Monat · 5 TB Speicher | Für den Bau ohne Rolle | `gemini.google/subscriptions` |
| Preis Schweiz | **nicht primär belegt** (Sekundärangabe ~CHF 22.90) | — |

**Nicht enthalten — belegte Negativbefunde (S5):**

- **Gemini-API per Schlüssel ist NICHT im Abo.** Wörtlich: die Abo-Vorteile
  «apply only within the Google AI Studio web interface»
  (`ai.google.dev/gemini-api/docs/google-ai-plans`). Ein API-Key kostet
  separat; der Free-Tier bietet nur Flash-Modelle.
- **Google AI Plus erhöht die Gemini-CLI-Limiten NICHT** — Fussnote in
  `github.com/google-gemini/gemini-cli/blob/main/docs/resources/quota-and-pricing.md`:
  «Tiers not listed above, including Google AI Plus, are not supported.»
- **Gemini CLI mit Privatkonto-Login ist eingestellt** (18.6.2026,
  «Gemini Code Assist for individuals»); Ersatz ist die Antigravity CLI.
  Quellen: `developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals`
  · `developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/`
  (19.5.2026) · GitHub-Issue `google-gemini/gemini-cli#28229` (offen, kein
  Workaround).

## 2 · Jules — Betriebsweise

- Liest **`AGENTS.md` im Repo-Root** automatisch (README als Fallback) —
  `jules.google/docs/` — **belegt**. Das ist der Grund, weshalb `AGENTS.md`
  im Root liegt und nicht in `.claude/`.
- **Umgebung nur über die Web-UI** («Configuration» → «Initial Setup», z. B.
  `npm ci`, dann «Run and Snapshot») — `jules.google/docs/environment/` —
  **belegt**. Nicht scriptbar: dieser Schritt bleibt bei David.
- **Auslösung:** Web-UI-Prompt oder **GitHub-Issue mit Label «jules»**
  (case-insensitive) über die Jules-GitHub-App —
  `jules.google/docs/changelog/2025-06-26/` — **belegt**.
  *Kommentar-Trigger: unklar, nicht getestet.*
- **PR-Weg:** Jules pusht einen Branch aus einer isolierten VM und öffnet
  einen PR gegen main — **belegt**. Es baut also nie im Haupt-Checkout (§12).
- **CI-Selbstheilung:** erkennt rote GitHub-Actions-Checks auf eigenen PRs und
  bessert nach — `jules.google/docs/changelog/2026-02-19/` — **belegt**.
- **Erfahrungsbericht** (anekdotisch, private Quelle): «wie einen Junior
  anleiten», nur mit expliziten Anweisungen brauchbar, alles nachprüfen —
  `nelsonslog.wordpress.com/2026/03/18`.

## 3 · Antigravity CLI (`agy`) — Betriebsweise

- **Installation:** `curl -fsSL https://antigravity.google/cli/install.sh | bash`
  → `~/.local/bin/agy` (`antigravity.google/docs/cli/install/`). Lokal
  installiert 2.9.2026, **Version 1.1.24**.
- **Headless-Aufruf:** `agy -p "<prompt>" --mode plan --model <slug>
  --output-format json --print-timeout 120s`. `--mode plan` ist **Nur-Lese**.
- **Modelle** (`agy models`): u. a. `gemini-3.1-pro-high/-low`,
  `gemini-3.8-flash-*`, `claude-opus-4-6-thinking`, `claude-sonnet-4-6`,
  `gpt-oss-120b-medium`.
- **Grundlast ~20–30k Input-Token Systemtext pro Aufruf** (eigene Messung
  3.9.2026), Antwortzeit 3–30 s. Praxisfolge: Aufrufe bündeln, nie für
  Kleinstfragen.
- **Permissions nur global** in `~/.gemini/antigravity-cli/settings.json`
  (kein Repo-Scope!); Felder `permissions.allow/deny/ask`, Aktionen
  `read_file` · `write_file` · `read_url` · `execute_url` · `command` ·
  `unsandboxed` · `mcp`; **Precedence Deny > Ask > Allow**, headless verweigert
  «ask» automatisch (`antigravity.google/docs/cli/permissions/`).
  **Gesetzt 3.9.2026:** allow `read_file` (Repo, Scratch), `read_url`
  (fedlex.data.admin.ch, www.fedlex.admin.ch, www.lexfind.ch), Lese-Kommandos;
  deny `write_file(*)`, `unsandboxed(*)`, `execute_url(*)`, `mcp(*)` sowie
  `rm`/`curl`/`wget`/`sudo`/`git push|commit|checkout|reset`/`npm`/`npx`.
- **Regeldateien:** liest `GEMINI.md` (Priorität) und `AGENTS.md` im
  Workspace-Root, dazu `.agents/rules/` (alt `.agent/rules/`); IDE und CLI
  teilen Rules und Settings (`antigravity.google/docs/cli/best-practices/`,
  `/docs/rules-workflows/`, `/docs/cli/gcli-migration/`). Dass Antigravity das
  Claude-Code-Skill-Format versteht, behauptet nur eine Sekundärquelle
  (`agentpedia.codes`) — **unklar, nicht verifiziert**.

**Offene Falle:** `read_file` wird trotz Allow-Regel noch verweigert
(Schreibweise der Pfadregel ungeklärt, Test 3.9.2026). Bis das geklärt ist,
bekommt `agy` Dateien über `read_url` oder direkt im Prompt.

## 4 · Datennutzung und Opt-out

Für Privatkonten dürfen Prompts und Code laut Antigravity-Terms
(`antigravity.google/terms`) verwendet werden «including for model training»;
ein Opt-out steht in den Einstellungen — **belegt**. **David hat den Opt-out am
3.9.2026 gesetzt** (Antigravity-App und Gemini-App). Der Opt-out ist damit
Betriebs-Voraussetzung, nicht Komfort — fällt er weg, fällt der Weg weg.

Zweiter Riegel unabhängig davon: das Repo ist öffentlich, Issues und PRs sind
öffentlich lesbar. Dorthin gehören nur Bau-Inhalte, keine internen Notizen und
nie Zugangsdaten (§18).

## 5 · Review-Richtung: die einzige kontrollierte Zahl

**«Cross-Model LLM Code Review»**, `arxiv.org/html/2607.21656v1` — 116
LiveCodeBench-Aufgaben, Python, statische Reviews:

| Richtung | vorher | nachher | Delta |
|---|---|---|---|
| Claude reviewt Codex-Code | 71.6 % | 89.7 % | **+18.1 pp** |
| Codex reviewt Claude-Code | 91.4 % | 82.8 % | **−8.6 pp** |

Die Autoren schreiben, Codex-Review von Claude-Code schade den Ergebnissen
aktiv. **Enger Rahmen** (eine Sprache, ein Benchmark, statische Reviews, ein
Modellpaar) — belegt **für diesen Rahmen**, nicht generalisierbar, und Codex
ist nicht Gemini.

**Folgerung für LexMetrik** (Regel, deterministisch anwendbar): Die Richtung
«**Fremde bauen, Claude prüft**» ist die belegte; die Gegenrichtung «Gemini
prüft Claude» ist unbelegt bis schädlich und läuft ausschliesslich als
**gezählter Messversuch mit Rückbau-Schwelle**, nie als Vertrauensstütze.
Kein Fremdverdikt bindet je eine Landung.

## 6 · Werkzeug-Landschaft — was es gibt und was wir nicht nehmen

- **`AGENTS.md`** ist seit 9.12.2025 Projekt der Agentic AI Foundation (Linux
  Foundation; OpenAI, Anthropic, Google, Microsoft, AWS, Block) —
  `linuxfoundation.org/press`, `techcrunch.com/2025/12/09`. Gelesen von Codex,
  Cursor, Gemini CLI, Jules, Copilot und Antigravity (ab v1.20.3, 5.3.2026).
  **Claude Code liest es NICHT automatisch** (`inventivehq.com/blog/claude-md-vs-agents-md-vs-gemini-md`)
  — deshalb bleibt `CLAUDE.md` die Quelle für Claude und `AGENTS.md` ist die
  selbsttragende Kurzfassung für Fremde (§5: keine zweite Wahrheit).
- **MCP-Brücken Claude → Gemini** (zen-mcp-server von BeehiveInnovations mit
  dokumentierten Hängern in Issue #181 und `pal-mcp-server#185`; die
  Antigravity-CLI-Brücken `SinanTufekci/Claude-Code-Antigravity-CLI-MCP-Server`,
  `TurkerYakup/mcp-server-google-antigravity`,
  `a3lab01create-bit/antigravity-mcp-server`) sind **experimentelle
  Ein-Personen-Projekte**, teils mit berichtetem «headless agy -p stdout bug».
  **Nicht übernommen** — der direkte `agy -p`-Aufruf lief bei uns sauber
  (JSON-Ausgabe), ein Fremdwerkzeug ist dafür nicht nötig.
- **`jules-pr-reviewer`** (`github.com/sanjay3290/jules-pr-reviewer`) — Jules
  als PR-Reviewer per GitHub-Action: Muster existiert, **Adoption unklar**.
  Läuft der falschen Review-Richtung entgegen (Ziff. 5), daher nicht verfolgt.

**Negativbefunde (S5):**

- **Kein dokumentiertes Gesamtmuster** «Claude orchestriert, Jules baut, Gemini
  liest Langtext» gefunden. Wir bauen es ohne Vorbild — das ist der Grund für
  die Phasen- und Rückbau-Logik im Fahrplan statt eines Vollausbaus.
- **Antigravity als «zweites Claude-Budget»** (die CLI listet Claude-Modelle):
  keine Berichte gefunden, **offen**. Nicht als Annahme verwenden.

## 7 · Eigene Messung: Erfolgsbehauptung ohne Artefakt

Test 3.9.2026: `agy -p … --mode plan` konnte erwartungsgemäss nicht schreiben —
**das Modell behauptete den Schreiberfolg trotzdem**. Der Vorfall ist der
lokale Beleg für CLAUDE.md §14.7: eine Rückgabe ist Daten, ein Erfolgsbericht
ohne prüfbares Artefakt gilt als nicht erfolgt. Gilt für jede Fremdagenten-
Rückgabe, auch für Jules-PR-Beschreibungen.

## 8 · Pflegebedarf

Alle Zahlen in Ziff. 1 und 3 sind Anbieter-Angaben und **jederzeit einseitig
änderbar** — insbesondere die NotebookLM-Limiten (Änderung per 2.9.2026 bereits
angekündigt, neue Zahlen offen) und die unbezifferte Antigravity-Quote.

- **Nachprüfen bei jedem Phasenwechsel** des Schritts `QS-FREMDAGENTEN`, nicht
  auf Vorrat: die Zahlen steuern nur die Skalierungsentscheidung (§2 Phase 4).
- **Sofort neu bewerten,** wenn der Trainings-Opt-out (Ziff. 4) nicht mehr
  gesetzt ist oder der Anbieter ihn ändert — dann fällt der Weg, nicht bloss
  die Zahl.
- **Kein Verfallsregister-Eintrag angelegt:** `register/parameter-verfall.md`
  führt datierte **Rechts**-Parameter (Tarife, Schwellen, Muster-Stände), die
  in Engines einfliessen. Anbieter-Kontingente fliessen nirgends in die
  Rechtslogik ein; ein Eintrag dort wäre eine Vermischung zweier Register.
  *Offener Punkt für David/Bauleiter, falls das anders gesehen wird.*

## 9 · Abnahme-Status

**Keine fachliche Abnahme nötig und keine erteilt** — dieses Dossier trägt
Prozess- und Werkzeugwissen, keine Rechtsinhalte; es speist keine Engine, kein
Stammdatum und keinen `verified`-Anker. Die Rollen-Freigabe (David, Chat
3.9.2026) ist ein Betriebs-Entscheid, keine §7-Abnahme.
