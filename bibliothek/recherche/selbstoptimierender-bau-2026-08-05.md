# Selbstoptimierender Bau — Recherche 5.8.2026

**Erstellt:** 5.8.2026 (Auftrag David, Recherche lex-recherche-Agent) ·
**Stand aller Quellen:** 5.8.2026 · **Runde 2 (Primärquellen) ergänzt:** 5.8.2026 abends

**Auftrag:** David 5.8.2026 («wie kriegen wir es hin, dass sich der Bau von selbst
optimiert?»). Web-/GitHub-Recherche (lex-recherche-Agent, ~20 Abfragen), Übersetzung
auf das LexMetrik-System. **Abnahme-Status: Recherche-Entwurf** — Vorschläge 1–3/5
sind Bau-Kandidaten, 4/6 zurückgestellt; fachliche Priorisierung bei David.
**Pflegebedarf:** GitHub-Actions-Metrics-API und gh-aw-Reifegrad bei Bau erneut
prüfen (Stand aller Quellen: 5.8.2026).

## A · Externe Befunde (Quelle · Kernaussage · Reifegrad)

**Messung:**
- GitHub Actions Performance-Metrics (docs.github.com/en/actions/concepts/metrics,
  GA seit 3/2025): Job-/Workflow-Laufzeiten, Queue-Zeiten, Failure-Rates, 1 Jahr
  Historie — nativ, kostenlos. *Produktiv.*
- flexion/devops-deployment-metrics (GitHub, MIT): DORA-Kennzahlen (Deployment
  Frequency, Change-Fail-Rate, MTTR) rein aus der Workflow-API. *Klein, funktionsfähig.*
- Apache DevLake (devlake.apache.org): Standard für self-hosted DORA — eigener
  Dienst + DB, für unsere Grösse überdimensioniert. *Produktiv, nicht passend.*
- Flaky-Quarantäne (trunk.io, buildpulse.io): nur kommerzielle SaaS mit
  Daten-Upload. *§5-Risiko, nicht passend.*
- Error-Budgets als Prozess-Trigger: etabliertes SRE-Muster, kein Fertigtool für
  Bau-Prozess-Metriken gefunden. *Muster, Eigenbau nötig.*

**Agenten-Selbstverbesserung:**
- github/gh-aw «Agentic Workflows» + Self-Healing-CI-Bericht (pascoal.net 3/2026):
  Agent in Actions, read-only mit deklarierten «Safe Outputs» (nur PR/Issue/Kommentar);
  unterscheidet transiente/permanente CI-Fehler, öffnet verifizierte Fix-PRs.
  *Technical Preview — Muster gut, Reife begrenzt.*
- BerriAI/self-improving-agent: Agent schlägt minimalen Diff vor, explizite
  Nutzer-Bestätigung Pflicht, Draft-PR, minimal-scoped Token. *Referenzarchitektur.*
- Anthropic skill-creator Eval-Modus (claude.com/blog, anthropics/skills):
  Executor/Grader/Comparator/Analyzer, A/B-Vergleich von Skill-Versionen —
  «Skill-Änderung messen statt glauben». *Offiziell, jung (2026).*
- DSPy (arxiv 2507.14241): metrik-getriebene Prompt-Optimierung; braucht
  Gold-Labels — Übertragbarkeit auf Prosa-Skills unklar. *Offen.*

**Organisatorisch:** Blameless-Postmortem-Automatik nur als SaaS (incident.io,
rootly) · Andon-Cord-Muster ist bei uns durch Tore/Merge-Schutz bereits real ·
schlanke Retro-Bots: nichts Repo-natives gefunden. *Offen markiert.*

## B · Vorschläge für LexMetrik (priorisiert; Regel deterministisch formuliert)

1. **Mess-Zeitreihe (M):** Generiertes JSON (nie handgepflegt, §5-Projektion wie
   Korpus-Artefakte): Tor-Rot-Ereignisse je `check:*` · CI-Failure-Rate/Reruns aus
   der nativen Actions-API · Rework-Heuristik (Folge-Commits kurzer Frist auf
   denselben Dateien; Beobachtungsgrösse, nie Tor-Kriterium) · Lehren-Register-
   Treffer. Andockt an `scripts/plan/lage.ts` + Muster `check-ci-laeufe.ts`;
   Anzeige im Lagebild.
2. **Wirksamkeits-Sonde je Lehren-Zeile (S, setzt auf 1 auf):** Rückfall-Zähler je
   F-Klasse (wie oft blockierte das Gegenmittel real; war ein neues Tor je rot) —
   macht Register-Regel 5 («zweimal trotz Gegenmittel ⇒ eskalieren») messbar.
3. **GitHub-native Metrics statt Eigenbau (S):** `check-ci-laeufe.ts` um Raten über
   Zeit ergänzen (heute nur letzter-Lauf-grün/rot).
4. **§17-Retro als `npm run retro:17` (M), NICHT als Cron:** liest nur 1+2+Chronik,
   erzeugt ROADMAP-**Entwurfs**block (klar markiert, kein Auto-Commit); Hebung zum
   Scheduled Agent erst nach Bewährung (gh-aw-Safe-Outputs-Muster). §17-Reihenfolge:
   Automatisieren zuletzt.
5. **Flaky-Feld statt SaaS (S):** Retry-Zähler aus den e2e-Shards in die Zeitreihe.
6. **Skill-Evals nach skill-creator-Muster (L, niedrig):** nur Prozess-Skills, nur
   als Empfehlungssignal — nie CI-blockierend (LLM-Grader ≠ deterministisch, §2).

## Bewusst nicht (mit Grund)

- Cron-Agent mit Auto-Commit/-Merge von Prozessänderungen (§17 «Automatisieren
  zuletzt»; §6/§9 verbieten Prozess-Merge ohne Prüfung).
- Externe SaaS-Plattformen für Metriken/Postmortems (zweite Wahrheit ausserhalb
  des Repos, §5; Kosten/Betrieb).
- Selbstoptimierung an Rechtslogik-nahen Skills/Engines (§1/§2/§7: nie automatisch,
  fachliche Abnahme bleibt bei David).

## Geltungsbereich

Nur Bau-/Prüf-/Plan-Prozess. Rechtslogik (`src/lib/`), Engines und Korpus sind
ausdrücklich ausgenommen — dort gilt Golden-Beweis + Gegenprüfung + Abnahme, keine
Selbstoptimierung.


## Runde 2 (5.8.2026 abends) — Primärquellen zum selbstverstärkenden Kreislauf

Auftrag David: «zukünftiger Bau soll sich automatisch weiterentwickeln … Infos von
Anthropic-Mitarbeitern oder anderen KI-Forschern». Kernfunde (je Quelle · Stand 5.8.2026):

**Anthropic-Primärquellen:**
- **Löschkriterium (offiziell, Best-Practices-Doku, code.claude.com/docs/en/best-practices):**
  «Keep it concise. For each line, ask: would removing this cause Claude to make mistakes?
  If not, cut it. Bloated CLAUDE.md files cause Claude to ignore your actual instructions.»
  Anti-Muster «the over-specified CLAUDE.md»: was das Modell ohnehin richtig macht, streichen
  oder in einen Hook wandeln.
- **Halbjahres-Entrümpelung (Boris Cherny, Claude-Code-Schöpfer, YC-Talk 2026):** «Every six
  months, delete your CLAUDE.md, delete your skills, delete your hooks, and see what the model
  does» — viele Regeln sind Patches für Schwächen des damaligen Modells; Anthropic strich für
  Opus 5 selbst 80 % des Claude-Code-Systemprompts. (Anekdotischer Erfahrungswert.)
- **Skills wachsen aus Gotchas (T. Shihipar, claude.com/blog «How we use skills»):** beste
  Skills starten mit wenigen Zeilen + einem Gotcha und wachsen an echten Fehlkanten;
  PreToolUse-Logging macht Unter-/Übernutzung messbar (Nutzungsdaten statt Meinung).
- **Automatisierungs-Vertrauen in «baby steps» (Cat Wu/T. Shihipar via Simon Willison,
  21.7.2026):** Review-Automatisierung wird eval-belegt schrittweise ausgeweitet, nie sofort
  vollautonom — deckt §17 «Automatisieren zuletzt».
- **Cache-Ökonomie:** CLAUDE.md-Edits mitten in der Session invalidieren den Präfix-Cache —
  Kostenargument für GEBÜNDELTE Lehren-Pflege am Session-Ende statt Dauer-Edits.

**Forschung (empirisch belegt):**
- **Reflexion** (arXiv:2303.11366): sprachliche Fehler-Reflexionen als Kontext des nächsten
  Versuchs, HumanEval 80→91 % — Begründung, warum reine TEXT-Lehren (unser Register) wirken.
- **Voyager** (arXiv:2305.16291): wachsende Bibliothek ausführbarer, geprüfter Skills als
  Anti-Vergessen — Forschungs-Analogon zu `.claude/skills/`.
- **Darwin-Gödel-Machine** (Sakana, arXiv:2505.22954): Selbstmodifikation überlebt nur bei
  objektiv besserem Benchmark (SWE-bench 20→50 %) — ohne echtes Tor driftet Selbstverbesserung.
- **AlphaEvolve** (DeepMind, arXiv:2506.13131): Fitness-Signal ausschliesslich deterministische
  Evaluatoren, >1 Jahr produktiv — deckt §2.
- **Reward-Hacking-Zahl** (arXiv:2607.05904): LLM-Richter im Self-Play vergab 0.72→0.94
  Erfolg, wahre Korrektheit blieb 0.20 — der empirische Grund, warum ein LLM-Urteil NIE
  Tor-Kriterium ist. Ergänzend Anthropic (arXiv:2511.18397): Reward-Hacking im RL-Training
  generalisiert zu breiter Fehlausrichtung (Analogie-Warnung, kein 1:1-Mechanismus).
- **Goodhart** (Sekundärquellen): Messgrösse als Ziel verdirbt die Messgrösse — Rework-/
  CI-Raten bleiben Beobachtung, nie Ziel.

**Unbestätigt/nicht gefunden:** «Auto-Dream»-Konsolidierungs-Subagent (nur Drittquellen, keine
Anthropic-Primärquelle — als Gerücht führen) · kein quantitativer Vorher/Nachher-Beleg eines
Teams für Regel-Pflege-Gewinne · kein offizieller Lösch-Rhythmus für Skills.

**Essenz für `QS-SELBSTOPT` (ins Mandat übernommen):** (1) Löschkriterium je Zeile +
terminierter Lösch-Review als eigener wiederkehrender Posten — Ent-Regulierung ist ein
gleichwertiger Verbesserungsschritt (Auftrag David 5.8.: keine Über-Regulierung, keine
unnötigen Sicherungen, die Bauzeit kosten) · (2) Lehren gebündelt am Session-Ende
konsolidieren, aktiv kürzen · (3) Fitness-Signale nur deterministisch (nie LLM-Richter) ·
(4) Automatisierung eval-belegt in kleinen Schritten · (5) Metriken als Beobachtung, nie
als Ziel.
