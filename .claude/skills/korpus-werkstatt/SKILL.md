---
name: korpus-werkstatt
description: "Verwenden bei «neuen Bundeserlass/Kantonserlass hinzufügen», «Erlass/Snapshot aktualisieren», «verifizier den Erlass X», «stimmt der Anker/Stand?», «Render-Bug / falsches «aufgehoben» / Tausendertrenner / text-indent / zerrissene Abkürzung», «Rechtsprechungs-Korpus erweitern», «BGE-Leitentscheid», «Snapshot generieren», «review / prüf das» — Content-Produktion + Verifikation für die Lexmetrik-Korpora Normtext (Gesetze) und Rechtsprechung (Urteile): Erlass/Entscheid extrahieren, mit Norm+Link+Stand belegen, Render/Extraktion prüfen."
---

# Korpus-Werkstatt LexMetrik (Normtext + Rechtsprechung)

Die Orchestrierungs- und Verifikations-Schicht VOR Abnahme und Deploy: einen
neuen Erlass/Entscheid extrahieren, jeden Wert mit Norm+Link+Stand belegen,
Render und Extraktion adversarial prüfen. Sie übernimmt weder das §9-Deploy-Tor
(→ `landung`) noch die fachliche Abnahme (→ `abnahme`), sondern bringt den
Korpus prüffertig bis zu deren Eingang.

Dieser Skill wird **selten** aufgerufen — er setzt darum nichts voraus und
verweist auf die Single Source of Truth, statt sie zu kopieren (§5).

## So ist dieser Skill aufgebaut (Progressive Disclosure)

Drei Schichten, bewusst getrennt:

- **`methodology/`** — *was + warum* (die fachliche Reihenfolge je Korpus).
  `methodology/normtext.md` (Bund + Kanton), `methodology/rechtsprechung.md`.
- **`tools/`** — *wie* (die exakte Mechanik: Befehle, JSON-Schema, Editier-
  Stellen). `tools/normtext-pipeline.md`, `tools/rechtsprechung-pipeline.md`,
  `tools/verifikation.md`.
- **`review.md`** — der user-getriggerte adversariale Zusatz-Audit (Bugklassen),
  nie automatisch (= der «Zusatz-Pass» aus ‹Verifikation — zwei Pässe›).

**Eine `tools/`-Datei erst beim jeweiligen Schritt in den Kontext ziehen, nicht
alle vorab** — sonst lädt dieser selten genutzte Skill seinen ganzen Mechanik-
Ballast vorsorglich. Mini-Durchlauf: «Normtext neu → lies `methodology/normtext.md`;
beim Schritt ‹Cache laden / Snapshot generieren› ziehe `tools/normtext-pipeline.md`;
beim Verifizieren `tools/verifikation.md`; zum Abschluss (user-getriggert) `review.md`.»

## Klassifizieren und routen

Die **Aufgabe** ist die Weiche, nicht der Inhaltstyp allein. Für «verifizieren»
und «Render-Bug fixen» ist `methodology` der FALSCHE Zweig — diese überspringen
die Produktions-Pipeline.

| Inhaltstyp | **neu produzieren** | **bestehendes verifizieren** | **Render-Bug fixen** |
|---|---|---|---|
| Normtext-Bund | `methodology/normtext.md` → `tools/normtext-pipeline.md` → nach Produktion `review.md` | `review.md` + `tools/verifikation.md` (Pipeline/methodology überspringen) | `tools/verifikation.md` (Playwright/Screenshots via Bash) + zugehörige `review.md`-Bugklasse (methodology überspringen) |
| Normtext-Kanton | `methodology/normtext.md` (Kanton-Spur) → `tools/normtext-pipeline.md` (Kanton-Tor-Block) → `review.md` | `review.md` + `tools/verifikation.md` | `tools/verifikation.md` + `review.md`-Bugklasse |
| Rechtsprechung | `methodology/rechtsprechung.md` → `tools/rechtsprechung-pipeline.md` → `review.md` | `review.md` + `tools/verifikation.md` | `tools/verifikation.md` + `review.md`-Bugklasse |

## Zielgerichtet vs. offen — «Stop early»

Die methodology-Dateien geben eine **Default-Reihenfolge für offene Aufgaben**.
Eine **gezielte** Anfrage springt direkt zum relevanten Schritt — keine starre
Pipeline:

- «verifizier Art. 335c OR» → direkt `review.md`, nicht der ganze Neu-Anlage-Flow.
- «Render-Bug: Tausendertrenner in DBG» → direkt `tools/verifikation.md` +
  die passende `review.md`-Bugklasse, kein Produktionslauf.
- «BGE-Leitentscheid zu X finden/aufnehmen» → `methodology/rechtsprechung.md`,
  Zweig BGE-Leitentscheide.

Den vollen Ablauf nur fahren, wenn die Aufgabe wirklich offen ist. Stop, sobald
das Nötige erreicht ist.

## Disambiguierung (EINE Rückfrage bei Unklarheit)

Ist der **Inhaltstyp** (Bund / Kanton / welcher Kanton / Rechtsprechung) **oder**
die **Aufgabe** (produzieren / verifizieren / Render-Bug) nicht eindeutig aus dem
Auftrag ableitbar → **eine** gezielte Rückfrage stellen, bevor in methodology/tools
geroutet wird. Begründung: Eine Fehlroute riskiert verifizierte Kantons-Snapshots
(vgl. `--nur=bund`, §2 Determinismus) und ist im selten genutzten Skill teurer als
die Rückfrage.

## Grenzen (kein Duplikat — nur Verweise)

- **Dach:** `CLAUDE.md` §1–§15, insb. §2 (Determinismus), §5 (Single Source of
  Truth), §7 (Kernsatz «verifizieren, nicht vertrauen» + Zitat-Ausnahme
  (a)–(d) — die Build-Regeln stehen seit 25.7.2026 **in diesem Skill**), §8
  (Status/Ehrlichkeit), §11 (Wissensablage). §14.4 (Definition of Done) und
  §14.5 (Trailer) stehen im Skill `auftrag`.
- **Bibliotheks-Standards:** `bibliothek/STANDARDS.md` — **S2** (Status-Vokabular
  ERSTRECHERCHE / ZWEIFACH GEPRÜFT / ABGENOMMEN, koppelt an `verifiziert`/«geprüft»),
  **S5** (Negativbefunde sind Pflicht), **S6** (Datiertes sofort ins
  Verfallsregister), **S8** (Korrektur-Protokoll am eigenen Bestand).
- **Übergabe:** Release → Skill `landung` (§9-Ritual). Fachliche Abnahme →
  Skill `abnahme` (Status-Hebung auf «geprüft»/`verified:true`).
- **Nicht-Ziele:** kein Endnutzer-Feature, keine LLM-Schicht in der App
  («deterministisch statt KI», §2); keine Tarife/Vorlagen (späterer Ausbau);
  keine Fremd-/Sekundärliteratur (Art. 5 URG); zustandslos.

## Eiserne Regeln

- **Snapshots nie von Hand editieren** — nur über den Generator
  (`npm run normtext …` bzw. `npm run entscheide …`); Build-Regel §7.
- **Datum immer aus der Shell:** `--datum=$(date +%F)` (§2 Determinismus, kein
  `Date.now()`/kein abgetipptes Datum).
- **`verifiziert`/«geprüft»/`verified:true` nie automatisch** — das setzt Davids
  fachliche Abnahme voraus (§7/§8, Zeitsperre bis 1.12.2026); Hebung nur über den
  Skill `abnahme`.
- **Jeder Rechtswert mit Norm + Link + Stand** (§13 D1, verzahnt mit §7).
- **Nur amtliche / URG-freie Quellen** (Art. 5 URG, S3): Fedlex (Bund), kantonale
  Erlasssammlungen via API, amtliche Gerichts-/Behördenseiten — keine Kommentare.

## §7 · Quell-Wahl und Build-Regeln Norm-Snapshots (wohnen hier)

Seit dem A4-Umzug (25.7.2026) stehen die §7-Build-Regeln in diesem Skill;
`CLAUDE.md` §7 trägt weiterhin den Kernsatz («verifizieren, nicht vertrauen»)
und die Zitat-Ausnahme (a)–(d), weil beides Invarianten sind.

**Quell-Wahl zuerst.** Vor jeder Datenextraktion aus einer amtlichen Quelle
**empirisch erheben, welches Format oder welcher Endpunkt das Ziel technisch am
besten erreicht** — strukturiertes Schema > gerendertes HTML > PDF; an die
**höchste verfügbare Struktur** andocken, nicht reflexhaft die naheliegende
Quelle nehmen. Probe-Fetch je Kandidat, Inhalt prüfen (Soft-404-Shells
erkennen). **Aber:** ein Quell- oder Formatwechsel wird per Messung (POC,
Differenz) belegt, nie angenommen — Fehler sitzen oft in der eigenen
Transformation, nicht in der Quelle. Wechsel inkrementell, nie Big-Bang.
Beispiel und Detail: Memory `extraktion-amtliche-quellen-beste-option`,
`fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur-Entscheid` (Fedlex-HTML
vs. Akoma-Ntoso-XML).

**Die sechs Build-Regeln.** Die Volltext-Snapshots (`public/normtext/`) werden
ausschliesslich vom Generator erzeugt
(`npm run normtext -- --datum=$(date +%F)`), nie von Hand editiert. Jede neue
Quelle folgt zwingend diesem Muster:

1. **Vollabdeckung** — ALLE Artikel je Erlass extrahieren (Bund: jedes
   `<article id="art_*">` der gepinnten Fedlex-Konsolidierung; Kanton: jeder
   Artikel des LexWork-Erlasses), nicht nur die zitierten.
2. **Aufzählungen vollständig** — lit. und Ziff. als `items` je Absatz; nichts
   abschneiden, sonst wirkt die Bestimmung unvollständig.
3. **Immer die GELTENDE Fassung** — Bund über die gepinnte, als aktuell
   verifizierte Konsolidierung (`scripts/fedlex-cache.sh` +
   `check:fedlex-versionen`); Kanton über `current_version` der LexWork-API
   (`version_uid` als Drift-Token). Künftige, noch nicht in Kraft stehende
   Fassungen werden NICHT verlinkt.
4. **Provenienz je Eintrag** — `stand` (In-Kraft-Datum), `quelleUrl`,
   `fassungsToken`, `sha` über Text und items; deckt die Zitat-Ausnahme
   (a)–(d) aus `CLAUDE.md` §7.
5. **Drift-Tor** — `check:normtext` (offline) und `check:normtext-netz` (live
   version_uid/Konsolidierung) müssen grün sein; im `gate` und `check:netz`
   verdrahtet. Neue Quellen ergänzen einen **browserlosen** Adapter (Fetch +
   strukturierte Extraktion + Drift-Token) — kein Headless-Browser, kein
   Scraping pro Kanton.
6. **DB-Artefakt als kanonische Zwischenschicht** — `public/*.json` und die
   prerenderten Seiten dürfen deterministische Projektion aus
   `daten/lexmetrik.db` sein. `check:paritaet` beweist die Projektion
   byte-gleich; die Drift-Tore aus Regel 5 bleiben Arbiter gegen die amtliche
   Quelle. Massgeblich ist immer die amtliche Fassung, nie das Artefakt
   (`CLAUDE.md` §5). Bedingungen im Detail: `fahrplaene/FAHRPLAN-DATENHALTUNG.md`.

Quellen-Priorität und PDF-Extraktionsregeln im Detail:
`bibliothek/normen/norm-vorschau-snapshot-system.md`.

## Verifikation — zwei Pässe, sauber getrennt

- **Pflicht-Pass (§14.4):** Nach **jeder** Extraktions-Produktion auf einem
  Risiko-Pfad ist die adversariale Gegenprüfung **verpflichtend**, nicht auf Abruf.
  Das Tor `check:gegenpruefung` (Skript `scripts/check-gegenpruefung.ts`, in
  `check:seriell`) erzwingt sie über die geteilte Kernfunktion `istRisikoPfad()`
  (`scripts/gegenpruefung/kern.ts`): Normtext-Pfade (`scripts/normtext/**`,
  `src/lib/normtext/**`, `public/normtext/**/*.json`, `scripts/fedlex-*`) und der
  Entscheid-Generator `scripts/normtext-entscheide.ts` sind Risiko-Pfade — die reinen
  Entscheid-Outputs `public/rechtsprechung/**` NICHT. Bei reinen Entscheid-Output-Läufen
  (`public/rechtsprechung/**`) greift das Tor nicht — die Pflicht-Gegenprüfung dennoch
  fahren und nur im §14.5-Trailer quittieren (`tools/verifikation.md`). Beweismittel:
  adversariale Agenten / das `AUDIT-…md`-Muster; Werkzeugkasten `tools/verifikation.md`.
- **Zusatz-Pass (on-demand):** Davon getrennt der **user-getriggerte**
  `review.md`-Audit («prüf das», «stimmt das?», «review»). Das ist **nicht** der
  §14.4-Pflicht-Pass, sondern ein zusätzlicher Audit — nie automatisch starten.

## Definition of Done (§14.4/§14.5 — am Produktionsabschluss abhaken)

Wortlaut von §14.4/§14.5 seit 25.7.2026 im Skill `auftrag`, Ziff. 4/4a/5.

- [ ] §6-/§9-Tore grün (Tor-Status pro Schritt notiert).
- [ ] Pflicht-Gegenprüfung gelaufen (Risiko-Pfad, §14.4).
- [ ] Status-Marker §8 gesetzt — «verifiziert»/«geprüft» **nie automatisch**.
- [ ] STRUKTUR.md-Session-Karte nachgezogen (§14.4 / Skill `auftrag`, Ziff. 4a).
- [ ] §11-Wissensablage erfolgt (Schritt in der jeweiligen `methodology/`-Datei).
- [ ] §14.5-Trailer am Produktions-Commit: `Roadmap: <ID>` und auf Risiko-Pfaden
      zusätzlich `Gegenpruefung: <Verdikt> (<Modell>, <Linsen>) — <Befunde>`
      (bzw. `Gegenpruefung: n/a — reine Prüflogik`).

## Fehlerfälle — Tor rot / Quelle fehlt (je eine Sofortmassnahme)

1. **Cache/Stand-Tor rot** (`npm run check:fedlex-versionen` Exit 1) → geltende
   Konsolidierung neu pinnen, die Zeile in `scripts/fedlex-cache.sh` aktualisieren,
   Cache neu laden — **nicht aus dem Gedächtnis rekonstruieren** (Update-Pfad in
   `methodology/normtext.md`).
2. **Quelle / OCL nicht erreichbar** → Lauf abbrechen statt halben Korpus
   schreiben; offline über `npm run entscheide:seed` / Fixtures weiterarbeiten;
   ehrlicher §8-Fallback-Status statt erfundener Werte.
3. **SR-Kollision** (Pflicht-Anker/SR-Sonde schlägt an) → Quarantäne; Identität
   in `src/lib/normtext/register.ts` (Register-Eintrag + Feld `fedlexKey`), der
   `FEDLEX`-Taxonomie in `src/lib/fedlex.ts` und `ERLASS_MAP` in
   `scripts/normtext-snapshot.ts` klären (Identität ≠ Normtext); **erst dann**
   Snapshot generieren.
4. **Gate / vitest rot** → §6.5-Diagnoseweg (Skill `refactoring`, Ziff. 6): nur die rote vitest-Datei
   einzeln (`npx vitest run src/tests/<datei>`), `npm run golden:diff -- <id>`;
   **nie `dist`/`golden`/Lock direkt lesen**.

**Abschluss-Regel:** Bei rotem Tor **kein Push, keine Übergabe an `landung`**
(§9). Die exakten Fehlerfall-Verweise (die vier Fälle oben) stehen ausführlich
in `tools/verifikation.md` — damit der seltene Aufrufer keinen Vorwissen-Sprung
machen muss.
