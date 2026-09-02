# FAHRPLAN — Fremde Agenten im Bau (Jules · Antigravity · Gemini)
<!-- @lagebild name: Fremde Agenten im Bau · zweck: Wer ausser Claude am Projekt mitbauen darf, wofür genau, und woran wir merken, dass es sich lohnt. -->

**Heimat: ROADMAP-Schritt `QS-FREMDAGENTEN`** (Band «Betrieb & Prüfstrasse»).

> **Stand 3.9.2026.** Freigabe David 2./3.9.2026 (Chat). Detailquelle zum
> Schritt `QS-FREMDAGENTEN`; *das Wie steht hier, gesteuert wird über
> `ROADMAP.md`*. Belege: `bibliothek/fremdagenten-google-ai-pro-2026-09.md`.

## §0 · Zweck und Grenze

David hat Google AI Pro. Damit stehen neben Claude Code weitere Agenten bereit
— Jules (asynchroner Coding-Agent auf dem GitHub-Repo), die Antigravity CLI
`agy` (lokal, headless) und die Gemini-App/NotebookLM. Die Frage dieses
Fahrplans ist **nicht**, ob diese Werkzeuge gut sind, sondern **wofür sie im
LexMetrik-Bau eine belegte Rolle haben** — und woran wir einen Fehlversuch
erkennen, statt ihn zu bewachen.

**Harte Grenze, in jeder Phase:** Risikopfade (Extraktion · Rechnen ·
Norm/Tarif, Definition `istRisikoPfad()`) bleiben Claude-Unteragenten
vorbehalten. Verdikte, Landung und fachliche Abnahme (§7) bleiben bei
Claude bzw. David. Fremde Agenten bauen auf der **grünen Spur** —
risikofrei, eng umrissen, Tor-geprüft.

## §1 · Rollenmodell (Freigabe David 3.9.2026)

| Rolle | Wer | Zuständig für |
|---|---|---|
| Bauherr | David | Auftrag, Priorität, fachliche Abnahme (§7), `verified: true` |
| Bauleiter | Claude Code (Haupt-Session) | Planen, verteilen, Tore, landen, Buch führen |
| Risikopfade | Claude-Unteragenten | Extraktion, Rechnen, Norm/Tarif, Gegenprüfung |
| Zweite Bauequipe | Jules | Klar umrissene, risikofreie Schritte auf der grünen Spur |
| Messversuch | Antigravity CLI (`agy`) | Zweitblick + Langtext-/PDF-Sichtung |
| Lesehilfe | Gemini-App / NotebookLM | Davids persönliche Lektüre, ausserhalb des Repos |

**Die Review-Richtung ist nicht symmetrisch.** Die einzige kontrollierte Studie
zum Thema (arXiv 2607.21656v1, 116 LiveCodeBench-Aufgaben) misst: Claude
reviewt Codex-Code 71.6 % → 89.7 % (+18.1 pp); umgekehrt reviewt Codex
Claude-Code 91.4 % → 82.8 % (−8.6 pp) — die Autoren nennen das aktiv schädlich.
Enger Rahmen, nicht generalisierbar. Folgerung für uns: **«Fremde bauen, Claude
prüft» ist die belegte Richtung**; «Gemini prüft Claude» ist unbelegt bis
schädlich und läuft deshalb nur als gezählter Messversuch, nie als
Vertrauensstütze.

## §2 · Phasen

Bau-Spec zu `QS-FREMDAGENTEN`. Streng seriell: eine Phase beginnt erst, wenn
die vorige ihr Messkriterium (§3) erfüllt hat.

### Phase 1 — Pilot Jules

1. `AGENTS.md` im Repo-Root (erledigt mit diesem Schritt) — Jules liest sie
   automatisch.
2. **Jules-Umgebung einrichten** — nur David, nur in der Web-UI
   («Configuration» → «Initial Setup»: `npm ci`, dann «Run and Snapshot»).
   Ohne Snapshot startet jeder Task mit kaltem `node_modules`.
3. **Label `jules`** im Repo anlegen (case-insensitive); ein Issue mit diesem
   Label löst Jules über die GitHub-App aus.
4. **Ein** Pilot-Issue nach der Auftrags-Form aus `AGENTS.md` §6 — risikofrei,
   Whitelist, Fertig-Kriterium, Tabu. Die Wahl des Pilot-Schritts kommt vom
   Bauleiter nach (§6).
5. Claude prüft den PR nach Skill `landung` §«Fremde PRs (Jules)» und landet
   ihn. Jules merged nie selbst.

### Phase 2 — Messversuch Gemini-Zweitblick

Fünf Gegenprüfungen über `agy -p … --mode plan` gegen bereits von Claude
geprüfte Stände. Jeder Befund wird **einzeln als echt oder Schein
protokolliert** (echt = im Repo reproduzierbar, §0 Ziff. 2). Kein Verdikt aus
diesem Weg bindet je eine Landung.

### Phase 3 — Gemini-Langtext-/PDF-Sichtung

Ein Pilot: ein amtliches Erlass-PDF gegen den gespeicherten Snapshot lesen und
Abweichungen melden. Der Nutzen liegt im 1-Mio-Token-Kontext, nicht im Urteil —
jede gemeldete Abweichung wird von Claude gegen die amtliche Quelle
nachgeprüft, bevor sie ein Befund heisst.

### Phase 4 — Skalierung

Erst nach bestandenen Phasen 1–3: 3–5 Jules-Issues pro Session parallel
(Kontingent 100 Tasks/Tag, 15 parallel). Nicht vorher.

## §3 · Messkriterien und Rückbau-Regel

| Teil | Was gemessen wird | Schwelle |
|---|---|---|
| Jules | Anteil der Jules-PRs, die **ohne Nacharbeit** durch `npm run gate` und den Landungs-Check gehen | reisst sie, ist der Aufwand pro PR höher als der eigene Bau |
| Gemini-Zweitblick | echte Funde gegen Scheinbefunde, absolut gezählt (n = 5) | mehr Schein als echt ⇒ Weg zu |
| Gesamt | Claude-Token pro gelandetem Schritt, vorher gegen nachher | steigt er, kostet die Delegation mehr, als sie spart |

**Rückbau-Regel (§17-Gegengewicht):** Reisst eine Schwelle, wird der
betroffene Teil **zurückgebaut**, nicht bewacht. Kein Werkzeug bleibt im
Prozess, weil es einmal eingerichtet wurde; die Einrichtung ist kein Argument.
Ein Teil, der nicht scheitern kann, wird gestrichen statt beobachtet.

**Messbedingung mitschreiben** (§0 Ziff. 3): Jede Quote nennt n, Zeitraum und
Art der Schritte — eine Quote ohne Bedingung ist keine Zahl.

## §4 · Sicherheit und Daten

- **Öffentliches Repo.** Issues und PRs sind öffentlich lesbar. Darin stehen
  nur Bau-Inhalte — keine internen Notizen, keine Personendaten, keine
  Zugangsdaten (§18).
- **Trainings-Opt-out** in Antigravity und der Gemini-App: gesetzt von David am
  3.9.2026. Ohne Opt-out dürfen Prompts und Code eines Privatkontos laut
  Anbieter-Terms fürs Modelltraining verwendet werden — der Opt-out ist die
  Bedingung, nicht ein Komfort.
- **`agy`-Permissions** liegen **nur global** in
  `~/.gemini/antigravity-cli/settings.json` (kein Repo-Scope). Gesetzt
  3.9.2026: `allow` für `read_file` (Repo, Scratch), `read_url`
  (fedlex.data.admin.ch, www.fedlex.admin.ch, www.lexfind.ch) und
  Lese-Kommandos; `deny` für `write_file(*)`, `unsandboxed(*)`,
  `execute_url(*)`, `mcp(*)` sowie `rm`/`curl`/`wget`/`sudo`/`git
  push|commit|checkout|reset`/`npm`/`npx`. Precedence Deny > Ask > Allow;
  headless verweigert «ask» automatisch. **Offen:** `read_file` wird trotz
  Allow-Regel noch verweigert (Schreibweise ungeklärt) — bis dahin bekommt
  `agy` Dateien über `read_url` oder im Prompt.
- **§12 Isolation:** Fremde Agenten arbeiten **nie** im Haupt-Checkout. Jules
  baut in einer eigenen VM und pusht einen Branch; `agy` läuft nur lesend.
- **§14.7 gilt für jede Rückgabe.** Belegt am 3.9.2026: `agy --mode plan`
  konnte nicht schreiben, das Modell behauptete den Schreiberfolg trotzdem.
  Eine Erfolgsbehauptung ohne prüfbares Artefakt ist wertlos.

## §5 · Werkzeugstand (3.9.2026, Momentaufnahme)

- **Jules** — in AI Pro enthalten: 100 Tasks/Tag, 15 parallel, Modell ab
  Gemini 3 Pro. Liest `AGENTS.md` im Repo-Root (README als Fallback). Umgebung
  ausschliesslich über die Web-UI. Auslösung per Web-UI-Prompt oder
  GitHub-Issue mit Label «jules». Erkennt rote GitHub-Actions-Checks auf
  eigenen PRs und bessert nach. *(Kommentar-Trigger: unklar.)*
- **Antigravity CLI `agy`** — lokal 1.1.24, installiert 2.9.2026. Aufrufform
  headless: `agy -p "<prompt>" --mode plan --model <slug> --output-format json
  --print-timeout 120s`; `--mode plan` ist Nur-Lese. `agy models` listet u. a.
  `gemini-3.1-pro-high/-low`, `gemini-3.8-flash-*`, `claude-opus-4-6-thinking`,
  `claude-sonnet-4-6`, `gpt-oss-120b-medium`. **Grundlast ~20–30k Input-Token
  Systemtext pro Aufruf** (gemessen 3.9.2026), Antwort 3–30 s. Liest `GEMINI.md`
  (Priorität) und `AGENTS.md`, dazu `.agents/rules/`. AI Pro = «High, generous
  quota, refreshed every five hours until weekly limit» — keine Zahlen.
- **Gemini-App / NotebookLM** — Gemini 3.1 Pro, 1-Mio-Token-Kontext; NotebookLM
  Pro. Davids persönliche Lesehilfe, nicht Teil der Bau-Kette.
- **Nicht verfügbar:** Gemini CLI mit Privatkonto-Login (18.6.2026 eingestellt,
  Ersatz ist Antigravity) und die Gemini-API per Schlüssel (nicht im Abo).
- **Bekannte Fallen:** offene `read_file`-Freigabe (§4) · `agy`-Grundlast macht
  jeden Aufruf teuer, also bündeln · MCP-Brücken Claude → Gemini sind
  experimentelle Ein-Personen-Projekte mit berichteten Hängern und werden
  **nicht** eingesetzt (der direkte `agy -p`-Aufruf lief sauber).

## §6 · Offen / wartet auf David

- [ ] **Wahl des Pilot-Schritts** für das erste Jules-Issue — kommt vom
      Bauleiter nach; Kriterium: risikofrei, eine Datei-Fläche, maschinell
      prüfbares Fertig-Kriterium.
- [ ] **Jules-Umgebung** in der Web-UI einrichten (`npm ci` + Snapshot) —
      nur David kann das, die UI ist nicht scriptbar.
- [ ] **Label `jules`** im Repo anlegen.
- [ ] **`read_file`-Freigabe für `agy`** klären (Schreibweise der Pfadregel).
