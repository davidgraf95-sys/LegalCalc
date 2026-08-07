# State-of-the-Art-Abgleich selbstoptimierender Bau (7.8.2026)

**Erstellt:** 7.8.2026 (Auftrag David, lex-recherche/Opus) · **Abrufdatum aller
Web-Quellen:** 7.8.2026 · **Abgrenzung:** Fortschreibung von
[selbstoptimierender-bau-2026-08-05.md](selbstoptimierender-bau-2026-08-05.md) —
dort Belegtes wird nicht wiederholt. · **Abnahme-Status:** Recherche-Entwurf ·
**Pflegebedarf:** Claude-Code-Versionsstand (hier 2.1.220) bei Umsetzung erneut
prüfen; mehrere Angaben sind versionsgebunden (v2.1.139 `/goal`, v2.1.178
Agent-Teams, v2.1.206 `/doctor`-Trim). · **Geltungsbereich:** nur
Bau-/Prüf-/Plan-Prozess; Rechtslogik, Engines, Korpus ausgenommen (§1/§2/§7).

## Quellenlage

| Quelle | Stand | Relevanz |
|---|---|---|
| code.claude.com/docs/en/best-practices | Abruf 7.8.2026 | Verifikations-Schleife, CLAUDE.md-Löschkriterium, adversarialer Review-Subagent, Stop-Hook-Übersteuerung nach 8 Blocks. |
| code.claude.com/docs/en/memory | Abruf 7.8.2026 | 200-Zeilen-Ziel, `.claude/rules/` mit Pfad-Scoping, Verhalten nach `/compact`. |
| code.claude.com/docs/en/hooks | Abruf 7.8.2026 | ~30 Hook-Ereignisse mit Blockier-Semantik; «exit 1 ist nicht blockierend». |
| code.claude.com/docs/en/monitoring-usage | Abruf 7.8.2026 | OpenTelemetry-Export **lokal ohne Fremddienst** (Prometheus `localhost:9464` / OTLP `localhost:4317`). |
| code.claude.com/docs/en/costs | Abruf 7.8.2026 | Token-Senkung: Effort-Stufen, Hook-Vorfilter, `/usage`-Attribution je Skill/Subagent. |
| code.claude.com/docs/en/goal | Abruf 7.8.2026 | `/goal` = Stop-Hook mit LLM-Evaluator; Abstufung Skript-Tor vs. Modell-Urteil. |
| code.claude.com/docs/en/agent-teams | Abruf 7.8.2026 | Experimentell; Agenten-Nachrichten gelten als **nicht** vertrauenswürdige Zustimmung; ~7× Token im Plan-Modus. |
| code.claude.com/docs/en/security | Abruf 7.8.2026 | Prompt-Injection-Modell, isolierter WebFetch-Kontext, `ConfigChange`-Hook, `/sandbox` (Seatbelt). |
| anthropic.com/engineering/claude-code-auto-mode | 25.3.2026 | Freigabe-Klassifikator: **17 % Falsch-Negativ-Rate**, kein Ersatz für Prüfung auf Risiko-Pfaden. |
| anthropic.com/engineering/demystifying-evals-for-ai-agents | 9.1.2026 | Eval-Rezept: 20–50 Fälle, Code-Grader vor Modell-Grader, Transkripte lesen. |
| anthropic.com/engineering/effective-harnesses-for-long-running-agents | 26.11.2025 | Fortschritts-Datei + Commits + Merkmalsliste als Wiederanlauf. |
| anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills | 16.10.2025 | Progressive Disclosure; SKILL.md splitten statt wachsen lassen. |
| platform.claude.com …/claude-code-analytics-api | Abruf 7.8.2026 | Analytics-API **für Einzelkonten nicht verfügbar** (Admin-Key nötig) — schliesst die offene Frage der Vorrecherche. |
| simonwillison.net/guides/agentic-engineering-patterns/subagents/ | 17.3.2026 | Subagenten schonen den Wurzel-Kontext; Warnung vor Dutzenden Spezialisten. |
| simonwillison.net/guides/agentic-engineering-patterns/ («Hoard things») | 26.2./16.3.2026 | Lauffähige Beispiele horten — «einen nützlichen Trick nur einmal herausfinden». |
| 2026 Agentic Coding Trends Report (Anthropic, PDF) | 2026 | Strategisch: KI in ~60 % der Arbeit, nur 0–20 % voll delegierbar. |

## Abgleich: wo wir dem Stand entsprechen

- **Deterministische Tore statt Modell-Urteil** — Anthropics eigene Abstufung
  (Prompt < `/goal`-Evaluator < Stop-Hook mit Skript < Subagent-Zweitmeinung)
  endet genau bei unserer Kette `gate.sh` + Hooks.
- **Hooks für Ausnahmslosigkeit** («must happen every time with zero exceptions»)
  = unsere Formregel Tor > Dispatch-§0 > Skill > Prosa; alle blockierenden Hooks
  nutzen korrekt `exit 2`.
- **Adversariale Gegenprüfung im frischen Kontext** — dokumentiertes Muster,
  deckt Skill `gegenpruefung`; inkl. der dortigen Warnung vor Über-Konstruktion.
- **Vertrauensgrenze §14.7 ist Produktstand geworden:** Agent-Teams behandeln
  Teammate-Nachrichten explizit als nicht-autorisierende Eingabe; WebFetch läuft
  isoliert. Unsere Regel war dem Produkt voraus.
- **Subagenten-Zuschnitt** (6 Klassen, Modellwahl nach Schwierigkeit) im Rahmen
  der Empfehlungen; **Skills statt CLAUDE.md-Aufblähung** ebenso.

## Lücken / Verbesserungspotenzial (priorisiert; Umsetzungs-Stand 7.8.2026)

1. **Token-/Kostenmessung** (S–M) — Davids Ziel nennt Tokenverbrauch, gemessen
   wurde nur CI/Git. Lokaler OTel-Export (`claude_code.token.usage`,
   `claude_code.cost.usage`) via `OTEL_METRICS_EXPORTER=prometheus` auf
   `localhost:9464`, kein Fremddienst. **→ Sammler in QS-SELBSTOPT eingebaut;
   Aktivierung (Env-Variable) wartet auf David (QS-ENTREG-KONFIG).**
2. **`SubagentStop`-Hook macht §14.7 durchsetzbar** (S) — «Erfolgsbericht ohne
   prüfbares Artefakt» könnte per `exit 2` das Subagenten-Ende blockieren.
   **→ Schritt QS-HOOKS-AUSBAU (David-Freigabe).**
3. **CLAUDE.md < 200 Zeilen + `.claude/rules/` mit Pfad-Scoping** (S) — §3/§13
   sind lupenreine Pfad-Regeln; `@`-Importe sparen nichts, nur Skills und
   Pfad-Regeln sparen. **→ QS-HOOKS-AUSBAU; §16-Kurzform bereits umgesetzt.**
4. **Weitere Hook-Ereignisse** (S je Stück): `SessionEnd` (Lehren-Konsolidierung
   automatisch), `PreCompact`/`PostCompact` (nach `/compact` lädt nur die
   Wurzel-CLAUDE.md neu!), `ConfigChange` (stille Konfig-Änderung blocken).
   **→ QS-HOOKS-AUSBAU.**
5. **Stop-Hook-Obergrenze dokumentieren** (S) — Übersteuerung nach 8 Blocks in
   Folge: Bremsklotz, kein Zaun. **→ in gate.sh-Kopf verankert (QS-SELBSTOPT).**
6. **Prozess-Skill-Evals** (M) — 20–50 reale Fälle aus vergangenen Fehlkanten,
   Code-Grader («Tor gelaufen? Artefakt im Bericht?») statt LLM-Richter.
   **→ Kandidat für einen künftigen Schritt nach Datenlage.**
7. **`/sandbox` statt reiner Erlaubnisliste** (S) — Seatbelt auf macOS, weniger
   Rückfragen bei gleichem Schutz. **→ QS-HOOKS-AUSBAU (David-Entscheid).**
8. **Wiederanlauf-Artefakte** — weitgehend gedeckt (plan:next, WIP-Commits);
   fehlend nur die Gewohnheit «Session beginnt mit End-zu-End-Test».

## Bewusste Abweichungen, die tragen

- **Kein Auto-Modus auf Risiko-Pfaden** — Anthropic beziffert die
  Falsch-Negativ-Rate selbst mit 17 %; unsere Merge-Sperre ist damit belegt.
- **`/goal` nicht als Tor** — LLM-Evaluator, als Fitness-Signal ausgeschlossen
  (§2, Reward-Hacking-Beleg der Vorrecherche).
- **Analytics-API aussen vor** — für Einzelkonten schlicht nicht verfügbar;
  OTel lokal ist der einzige Weg.
- **Ein Repo statt Plugin-Marktplatz** — bei einem Auftraggeber reiner
  Zusatzaufwand.

## Nicht übernehmen

- **Agent-Teams** — experimentell, ~7× Token, bekannte Mängel; Subagenten
  leisten dasselbe billiger. Übernehmenswert nur die Idee der Aufgaben-Hooks.
- **Auto-Memory als Prozessgedächtnis** — maschinenlokal, nie geteilt: wäre eine
  zweite Wahrheit neben dem Repo (§5); «Repo vor Memory» bleibt richtig.
- **Community-«Self-improving-CLAUDE.md»-Werkzeuge** — Fundlage ohne prüfbare
  Zahlen; die tragende Einsicht (mehrfach verletzte Regel ⇒ Hook) ist bei uns
  Formregel.
- **Externe Observability-/Postmortem-Dienste** — Absage vom 5.8. bleibt gültig.

## Methodik-Grenzen

- Doku ändert sich pro Minor-Version; Aussagen gelten für die abgerufene Fassung.
- Trends-Report nur nach Stichwörtern durchgesehen; ein Engineering-Artikel
  (effective-context-engineering) nicht im Volltext gelesen und hier nicht als
  Beleg verwendet.
- **Weiterhin nicht gefunden:** offizielles Anthropic-Muster für automatisierte
  Retrospektiven aus Prozess-Metriken; quantitativer Beleg, dass Regel-Pflege
  Ausschuss messbar senkt; offizieller Lösch-Rhythmus für Skills.

**Status: einfach belegt** (Web-Erstrecherche, Ist-Stand gegen Repo verifiziert).
