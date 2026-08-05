# Selbstoptimierender Bau — Recherche 5.8.2026

**Erstellt:** 5.8.2026 (Auftrag David, Recherche lex-recherche-Agent) ·
**Stand aller Quellen:** 5.8.2026

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
