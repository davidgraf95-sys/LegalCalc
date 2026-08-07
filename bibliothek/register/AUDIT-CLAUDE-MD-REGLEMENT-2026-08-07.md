# Reglement-Audit: Wirkt CLAUDE.md — und lösen ihre Verweise auf? (7.8.2026)

**Erstellt:** 7.8.2026, Auftrag David («unbefangener Blick auf CLAUDE.md» — jede
Session liest sie zuerst und hält sie deshalb für gut; Prüfung bewusst von
ausserhalb des Repos gestartet, Datei als Prüfobjekt gelesen, nicht als
Anweisung geladen).
**Status:** ERSTRECHERCHE (einfach belegt). Zusatzmarker: drei **unabhängige**
Read-only-Prüfagenten (2× Opus, 1× Sonnet) mit getrennten Fragen; Kernbehaupt-
ungen gegen Ground Truth verifiziert (`package.json`, `.github/workflows/ci.yml`,
`git show <sha>:CLAUDE.md`, grep im Ist-Bestand). **Kein** adversarialer
Zweitdurchgang über die Befunde selbst; keine Sabotage-Proben (im Unterschied zu
[AUDIT-TORE-2026-07-20.md](AUDIT-TORE-2026-07-20.md)).
**Analyse-Stand:** `main @ 3a57cd29c` (7.8.2026, Arbeitsbaum sauber).
**Read-only:** nichts geändert, nichts committet, keine Tore ausgelöst. Parallel
lief eine Bau-Session an CLAUDE.md/Skills (Branch `feat/qs-selbstopt`) — jeder
Befund ist vor einem Fix am dann aktuellen Stand nachzuprüfen.
**Quellen:** ausschliesslich Repo-Bestand (Dateien, git-Historie); keine
externen Quellen. Fundstellen als Datei:Zeile bzw. Commit-SHA im Text.

## Kurzurteil

CLAUDE.md ist kein totes Papier — aber sie **wirkt fast ausschliesslich dort,
wo ein Paragraph in ein maschinelles Tor übersetzt wurde**. Prosa-Regeln wurden
nachweislich gebrochen (§6.7 sechsmal, §12 Doppelbau, §3 Massenverstoss);
Tor-Regeln hielten (§2, §5, §9, §13, §14.7, §15). Das Präambel-Versprechen
«alle §-Verweise lösen weiterhin auf» hält nur für die Stämme §1–§17; bei den
Unternummern zeigen **~130 Verweise ins Leere** (§15.x allein 111), weil beim
A4-Umzug (25.7., `b2fa14dda`) nur §6 und §14 eine Konkordanz im Ziel-Skill
bekamen. Der Chronik-Drift ist messbar: 36 von 38 Commits vergrössern die
Datei, beide bewussten Kürzungen (20.7. −20 Z., 25.7. −182 Z.) waren nach 5–11
Tagen wieder aufgeholt; §16+§17 = ~15 % der Datei sind datiertes Memo. Die
Doppelpflege-Fehlerklasse, die am 20.7. in CLAUDE.md korrigiert wurde
(«§15-Falschaussage», `601b8bf5e`), ist zwischen den Skills neu aufgetreten
(`perf` beschreibt `check:perf-budget` fachlich falsch; `deploy-check` führt
dasselbe Tor korrekt).

## Teil A — Verweis-Audit (Auflösungskette der §-Verweise)

### A1. Bestandszahl «rund 200» (CLAUDE.md:8) ist um Faktor 20–25 zu tief

Konservative Zählung (Token `§N`/`§N.M`, N ≤ 17, ohne Leerzeichen =
Reglement-Stil; Gesetzes-§ stehen im Repo fast durchweg als «§ 4 Abs. 1» mit
Leerzeichen + Erlass-Kürzel; nur Kommentarzeilen in Code; Zeilen mit fremdem
Dokumentnamen ausgeschlossen): ~4 850 Token auf ~4 400 Zeilen — `src/`+
`scripts/` ~4 530, `.claude/skills/` ~261, `fahrplaene/` (nur Zeilen, die
CLAUDE.md nennen) 43, Rest ~15. Stichproben (30 Code-Treffer: ~10 %
Fehlklassierung; 2×70/30 Zeilen Gesamtbestand: in `fahrplaene/` meint rund die
Hälfte der bare-§-Token ebenfalls das Reglement → +~1 000). **Realistische
Bandbreite 4 000–5 500 echte CLAUDE.md-Verweise.** Die Teilzahl in Skill
`auftrag` Ziff. 9 («rund 120 auf alte §14-Nummern») stimmt dagegen (~140).

### A2. Tote Unternummern-Verweise (die realen Löcher)

Konkordanz vorhanden, Kette hält: **§6** → `refactoring` Ziff. 8 (Tabelle
§6.1–§6.7) · **§14** → `auftrag` Ziff. 9 (§14.1–§14.6; §14.7 in CLAUDE.md
selbst). Kein Verweis nutzt §6.8+/§14.8+.

| Loch | Umfang | Befund |
|---|---|---|
| **§15.1–§15.6** | **111 Zeilen / 128 Token / 57 Dateien — vollständig tot** | Inhalte stehen im Skill `perf` als «Bauregeln 1–6» ohne §-Etikett; `grep "§15\.2"` über `perf/SKILL.md` = 0 Treffer; auch in `archiv/` nirgends eine Überschrift `15.x`. Beleg: schon die Vor-A4-Fassung (`git show b2fa14dda^:CLAUDE.md`, Z. 350 ff.) nummerierte «1.–6.» ohne §-Anker — «§15.2» war immer Kurzschrift, wurde aber erst durch den Umzug zur Sackgasse. Nester: `fahrplaene/FAHRPLAN-DATENHALTUNG.md` (8), `FAHRPLAN-GESETZES-UX.md` (8), `FAHRPLAN-UI-NAVIGATION.md` (7), `src/pages/gesetz-leser/inhalt-zustand.tsx` (5), `EntscheidLeser.tsx`/`bezuegeLaden.ts`/`inhalt-hooks.tsx` (je 4), +50 Dateien à 1–3. |
| **§13.1–§13.5** («§13 Ziff. 3/6») | 12 Stellen, tot | Ziel `DESIGN-REGLEMENT.md` zählt mit Buchstaben-Codes (A1–A4, B1/B2, D1/D2, E1, F4/F7); die alte Ziff.-1–7-Liste ist ersatzlos weg. U. a. `FAHRPLAN-UI-QUALITAET.md:29/60/164/389/404/452`, `FAHRPLAN-RECHTSPRECHUNG.md:745`, `lehren/SKILL.md:29`, `src/components/HerkunftIcon.tsx:6`, `RegesteBlock.tsx:52`, `Methodik.tsx:66`, `FAHRPLAN-SPLIT-VIEW.md:206`, `FAHRPLAN-UI-BEFUNDE.md:94`. Mutmassliche Zuordnung: §13.2→B1, §13.5→D1, §13.3→A1–A3, «Ziff. 6»→E1. |
| **§12.2** («§12 Ziff. 2») | 5 Stellen, Anker tot, **Kollision** | Inhalt (Pathspec-Commits) lebt in der §12-Prosa, Anker existiert nicht. Erschwerend: `FAHRPLAN-VERZAHNUNG-UI.md:541` definiert ein EIGENES lebendes «§12.2» — der tote Verweis trifft einen falschen Anker; exakt die Fehlerklasse, die §16 verhindern will. Fundstellen: `docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md:160`, `FAHRPLAN-GESETZES-UX.md:833/1417/1901`, `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-12.md:75`. |
| **§16 (gestrichener Inhalt)** | 1 Stelle | `docs/token-oekonomie/fixkosten-audit-t10.md:33` meint noch die am 25.7. gestrichene Regel «Framework-APIs live nachschlagen». Die 3 übrigen §16-Verweise (`auftrag/SKILL.md:49`, `scripts/plan/bildMethode.ts:37`, `bildHtml.ts:545`) sind korrekt (Anker-Logik). |

### A3. Notationsbruch und Namensraum-Kollisionen (mehrdeutig, auflösbar)

- «§x Ziff. y» statt «§x.y» mischt CLAUDE.md-Stamm mit Skill-Ziffern:
  `scripts/check-ci-laeufe.ts:157`, `src/tests/besetzung-worttreffer.test.ts:1`,
  `scripts/rechtsprechung/check-besetzung.ts:202`, `STRUKTUR.md:296`,
  `FAHRPLAN-BASIS-AUSBAU.md:394`, `lehren/SKILL.md:47`.
- Fahrpläne vergeben dieselben §-Nummern neu (`VERZAHNUNG-UI` §12.1–12.5,
  `UI-QUALITAET` §2.x/§7.x, `TOKEN-OEKONOMIE` §11.x, `GESETZES-UX` 10.x/11.x);
  **vier** Dokumente führen ein eigenes §16 (`ARCHIV-RESTPUNKTE:515`,
  `GESETZES-UX:2112`, `FEDLEX-PORTFOLIO:891`, `UI-BEFUNDE:469`). Die
  §16-Sperre wirkt nur innerhalb CLAUDE.md.
- Beifang (kein CLAUDE.md-Fall): `FAHRPLAN-UI-QUALITAET.md:9` verweist auf
  «`FAHRPLAN-GESETZES-UX.md` §13.1» — die Zieldatei hat keinen §13.
- ⚠ Branch `feat/qs-selbstopt` (`53fb09e9d`, 7.8.) führt bereits ein **§18**
  ein — bei Landung wächst der Bestand auf unverändertem Auflöse-Mechanismus.

### A4. Stämme ohne definierte Unternummern

§1–§5, §7–§13, §15, §17 definieren nirgends Unternummern. Real referenziert
mit Unternummern (= Löcher): nur §15, §13, §12 (oben). Übrige Stämme werden im
Bestand nur bare zitiert und lösen auf. **Negativbefund (S5):** kein einziger
Verweis auf einen nicht existierenden Hauptparagraphen gefunden.

## Teil B — Praxis-Wirksamkeit (Regeln vs. Vorfalls-/Lehren-Bestand)

Basis: `lehren/SKILL.md` (Register F1–F6), `bibliothek/ci-fehlerklassen-2026-08-03.md`
(K1–K13), [AUDIT-TORE-2026-07-20.md](AUDIT-TORE-2026-07-20.md),
[gegenpruefung-register.md](gegenpruefung-register.md) (~125 Verdikte),
~15 Prozess-Commits. Eigenständige Postmortem-Dokumente existieren nicht
(bewusst: Lehren wandern in Register/Tor-Kopfkommentare, `lehren/SKILL.md:8-11`).

### B1. Verstösse gegen damals schon geltende Regeln (Prosa griff nicht)

| Vorfall | Verletzter § | Warum die Prosa nicht griff |
|---|---|---|
| PR #309 (`4f363fd0d`, 20.7.): 11 erfundene Amtsträger:innen ~1 h live | §1, §7 | Zu spät im Arbeitsfluss + falscher Adressat: Sub-Agenten sehen CLAUDE.md nicht; `tor-schutz.py:10-16` selbst: «Prosa hätte #309 NICHT verhindert.» |
| F2a–F2f (Tor validiert sich selbst · läuft nicht in CI · `cancelled` galt als nicht-rot · Substring-Beleg · 15/15 rot seit Anlage · prüft Container statt Inhalt) | §6.7 | **Die Regel gegen defekte Tore war selbst die einzige Invariante ohne Tor** — sechsmal verletzt. |
| Doppelbau `W2·6-NKEY` 28.7. (#397 gemergt, #398 = voller Opus-Bau entsorgt) | §12, §14 | Zu abstrakt: Regel sagt nichts über Kollisionssonden; Remote-Branch war sichtbar, PR-Sonde blind. |
| `inhalt.tsx` 781→1090 Z. in 12 Tagen (`check-schlankheit.ts:4-11`) | §6.6 | Reine Prosa-Schwelle; «niemand merkte es, bis eine Session zufällig nachmass». |
| Kantons-Korpus: «schwerste §1-Verstösse des Laufs, alle live belegt»; 9 lexfind-`quelleUrls` (`FAHRPLAN-KANTONE.md:76,174,528`) | §1, §7 | Extraktions-Risiko lief am damaligen Tor vorbei. |
| 20 stale Erlasse live + parser-blindes Monitoring-Loch (`FAHRPLAN-FEDLEX-PORTFOLIO.md:246`) | §7 | Tor vorhanden, aber mit Loch. |
| `f6d1b368a` (#316, 20.7.): Gegenmittel aus #315 selbst defekt, 16 Befunde | §6.7 | Härtung reproduzierte die bekämpfte Klasse (`check-dispatch-klausel.ts:7-19`). |

### B2. Lücken, die danach verankert wurden (Reglement lernt)

F4 fabrizierter Erfolgsbericht → §14.7 + Dispatch-§0 (Doppelablage bewusst,
Sub-Agenten sehen CLAUDE.md nicht) + `check:dispatch-klausel` + Hook
`dispatch-schutz.py` · F1 Merge vor Prüfung → `check-merge-schutz.ts` + Hook +
Required-Job · F2b → `check-tor-paritaet.ts` (friert Lücke ein) · F2c →
`landung` Schritt 5 + `check:ci-laeufe` in `waechter.yml` · F2e → Selbstaus-
schluss `check-ci-laeufe.ts:36-98` + §6.7-Erweiterung «einmal rot UND einmal
grün» · F2f → `scripts/plan/specBindung.ts`, `check:plan` Regel 11 · F6 →
Dispatch-§0.5 dreistufig eskaliert (zuletzt 5.8.: `plan:next` warnt maschinell
bei `wip` ohne Bau-Spur) · §6.6-Regrowth → `check:schlankheit` (grandfathered)
· 3.8. sieben umschiffte CI-Defekte = 1 Arbeitstag → §17 (`437e92950`,
Dauermandat `992fe1238`).

### B3. Durchsetzungs-Stichprobe scharfer Regeln

| Regel | Absicherung | Beleg |
|---|---|---|
| §6.3 Tests bei Refactorings nicht anpassen | ❌ nur Prosa (doppelt: CLAUDE.md:80-82 + `refactoring/SKILL.md:29-31`) | Empirie: 6 von ~400 Commits (`refactor`-Typ) berührten bestehende Testdateien (`888515e81`, `6e5d337bc`, `784951846`, `5809e4525`, `0e0e86c66`, `7d8893d01`); Stichprobe 2 Diffs: rein additiv. De facto eingehalten — ungesichert. |
| §6 Golden byte-gleich | ✅ dreifach: `gate.sh:40-42` · Stop-Hook `gate-stopp.py` · `ci.yml:267-269` | 25 Golden-Änderungen seit Juni, alle in deklarierten `feat`/`fix`; einzige `refactor`-Re-Baseline (`888515e81`) mit Beweis in der Message. |
| §9 Auto-Merge auf Risikopfaden gesperrt | ✅ vierfach: PreToolUse-Hook `tor-schutz.py:78-124` (fail-closed, fasst `gh api …/merge`) · `check-merge-schutz.ts` (prüft committeten Bereich) · Step im Tore-Job · Required-Job `merge-schutz` (`ci.yml:486-499`) | Verdikt-Form maschinell geprüft (nach Sabotage-Befund 20.7., als `Gegenpruefung: x` grün machte). |
| §7 `verified` nie automatisch | ⚠ Tor vorhanden, nie auslösbar gewesen | `src/tests/abnahmeGate.test.ts` verlangt `abnahme/<id>.md` mit 6 Pflichtteilen; `startseiteConfig.test.ts:39-42` erzwingt `verified === false`. Ist: 0 geprüft, 0 verified, 0 Protokolle — «Gate ist trivial grün»; §6.7 («einmal rot zeigen») für dieses Gate nie geleistet. Bis Abnahme-Zeitsperre (1.12.2026) nicht rot-fähig. |
| §2 Determinismus | ✅ hart: `eslint.config.js:31-43` (seit `17df0d44e`, 10.6.) | Alle 21 `Date.now`/`Math.random`-Treffer unter `src/lib/` sind erklärende Kommentare, kein Aufruf. |

### B4. Urteil je Paragraph

- **Trägt nachweislich (Tor hat gegriffen):** §2 · §5 (`check:dossiers`/
  `zaehler`/`historie`/`paritaet`/`datenhaltung`/`golden-normtext`) · §6-Golden
  + §6.6 · §9 · §11 (`bibliothek-check.sh`) · §13 (`check:design-tokens`/
  `farbwelt`/`linien-kanon`/`p-klassen` + ESLint-R2) · §14.7 · §15
  (`check:perf-budget`, `check:perf-lighthouse`).
- **Trotz Text verletzt:** §6.7 (6×) · §12 (Doppelbau, 3× eskaliert) · §1/§7
  auf Extraktionspfaden.
- **Papier ohne Prüfung:** **§10** (kein Tor, kein Vorfall, kein substanzieller
  Verweis — Streichkandidat nach der Chesterton-Fence-Prüfung des `lehren`-
  Skills) · **§3** (0 Tor + belegter Massenverstoss: `check-ui-normzitate.ts`
  dokumentiert ~1 100 hart kodierte «Art.»-Zitate in `src/pages`+
  `src/components`; das Tor fängt seit 4.8. Zitate, aber keine Berechnungen)
  · §4 (nur indirekt via Golden) · §16 (bewusst tot — sauber).

## Teil C — Drift und Doppelpflege

### C1. Wachstumskurve CLAUDE.md

| Datum | SHA | Zeilen | Anlass |
|---|---|---|---|
| 05.06. | `35c9c0ff9` | 93 | Gründung, 10 Grundprinzipien |
| 25.06. | `906f6df6b` | 246 | Design-Block F |
| 03.07. | `6c3c44c28` | 367 | Nordstern/Fundament |
| 20.07. | `8b01c3a42` | 393 | Peak 1 |
| **20.07.** | **`601b8bf5e`** | **373** | **Kürzung 1 (−20 Z., #315)** — dabei damalige §15-Falschaussage korrigiert («`check:perf-budget` liege in der gate-Kette. Verifiziert falsch.») |
| 25.07. | `1bd412e85` | 384 | Peak 2 — 5 Tage nach Kürzung 1 wieder darüber |
| **25.07.** | **`b2fa14dda`** | **202** | **Kürzung 2 «A4» (−182 Z.)** — Prozeduren in 6 Skills |
| 05.08. | `992fe1238` | 229 | +27 Z. in 11 Tagen (§17-Ausbau) |

**36 von 38 Commits vergrössern die Datei.** Memo-Anteil heute: §16
(Z. 182–194, 11 Inhaltszeilen, reines Begründungs-Memo einer Nicht-Regel) +
§17 (Z. 196–211, 15 Zeilen, Regel vermischt mit 2 datierten Mandaten + einge-
bettetem Vorfallsbericht Z. 206–209) = **26 von 176 Inhaltszeilen ≈ 15 %**.
Übrige David-Nennungen (Z. 95, 168, 211) sind zeitlose Rollen-Referenzen.

### C2. Doppelpflege: Skill-Drift (dieselbe Fehlerklasse wie 20.7., neue Stelle)

- **`perf/SKILL.md:61-63` beschreibt `check:perf-budget` fachlich falsch:**
  behauptet Lighthouse-CI unter 4×CPU und «läuft nur in CI». Ground Truth
  (`package.json:114-115`, `scripts/check-perf-budget.ts:1-14`): Chrome-frei,
  nur gzip-Bundle-Budgets, läuft lokal; Lighthouse ist das separate Tor
  `check:perf-lighthouse` (`scripts/perf/lighthouse-budget.ts`).
  `deploy-check/SKILL.md:38-50` führt dasselbe Tor **korrekt**.
- **`deploy-check/SKILL.md:195-197`** («Lighthouse manuell, bis ein CI-Chrome
  verdrahtet ist») ist hinter den Ist-Stand zurückgefallen —
  `.github/workflows/ci.yml:471-477` fährt `check:perf-lighthouse` automatisiert.
- **`landung/SKILL.md:152-153`** («KEIN `--auto`, solange Required Checks nicht
  gesetzt — David-Handschritt offen») widerspricht `deploy-check/SKILL.md:76-98`
  (`--auto` als Normalfall); Required Checks sind seit 20.7. gesetzt+wirksam.
- **Negativbefund (S5):** §4/§6↔`refactoring`, §9↔`deploy-check`,
  §10/§14↔`auftrag`, §7↔`korpus-werkstatt` — keine Widersprüche; Kernsätze
  wörtlich oder sinngleich deckungsgleich.

### C3. Weitere Einzelbefunde

- Skill `gegenpruefung` liegt **nur** in `~/.claude/skills/` (private
  Umgebung), nicht in `.claude/skills/` — CLAUDE.md §9 + Schlusstabelle
  verweisen darauf; Ausfallrisiko für CI-/Cloud-/Fremd-Sessions, ausgerechnet
  beim Sicherheitsnetz der Risiko-Pfade.
- Tabelle «Wo der Rest steht» führt die Repo-Skills `bauschritt`
  (Session-Lebenszyklus) und `aufraeumen` nicht.
- `check:schlankheit` läuft bewusst nicht in CI (`check-tor-paritaet.ts:76`) —
  bei einem Tor, das aus unbemerktem Regrowth entstand, die verwundbarste
  Stelle der Tor-Landschaft.
- Stale Dokumente: `PROJEKTBESCHRIEB.md:8,70` («§1–§16») ·
  `STRATEGIE-PLATTFORM.md:193-194,219,337` (Entwurf «§16 Vorfalls-Disziplin»,
  dort als überholt markiert).

## Massnahmen-Rangfolge (Empfehlung; Umsetzung = Bau-Session, nicht dieses Dossier)

1. `perf`-Faktenfehler + `deploy-check:195-197`- und `landung:152-153`-Altstände
   korrigieren (billigster Fix, verhindert Weiterkopieren).
2. §15- und §13-Konkordanzen nach dem §6/§14-Muster nachziehen; §12.2-Kollision
   auflösen; Präambel-Zahl «rund 200» durch pflegefreie Formulierung ersetzen;
   `fixkosten-audit-t10.md:33` bereinigen.
3. §18 (Branch `feat/qs-selbstopt`) vor Landung aufs Konkordanz-Muster heben.
4. Zwei Tore, wo Prosa versagt hat: §6.3-Diff-Tor (~30 Zeilen, rot+grün zeigen)
   · §3-ESLint-Tor (Übertragung des §2-Musters auf `src/pages`+`components`,
   Bestand grandfathern).
5. §16 auf ~2 Zeilen, §17 auf Regelkern (~6 Zeilen); Memo-Teile in Skill
   `lehren`. Erwägen: Zeilen-Budget für CLAUDE.md im struktur-rotieren-Wächter
   (Drift ist strukturell, nicht zufällig).
6. §10 streichen (Nummer sperren wie §16) oder Anlass benennen.
7. Skill `gegenpruefung` ins Repo; Tabelle um `bauschritt`/`aufraeumen` ergänzen.
8. **Wartet auf David:** §7-Abnahme-Gate einmal rot zeigen (Abnahme-Domäne) ·
   fachliche Status-Hebungen · Budget-Entscheide.

## Pflegebedarf

Dossier ist ein **datierter Snapshot** (`3a57cd29c`); nach Umsetzung der
Massnahmen je Punkt als erledigt markieren oder Dossier in den Fahrplan-/
Lehren-Bestand überführen und hier auf ARCHIV setzen. Zahlen (111/12/5
Fundstellen, 229 Zeilen) nicht fortschreiben — bei Bedarf neu messen.
