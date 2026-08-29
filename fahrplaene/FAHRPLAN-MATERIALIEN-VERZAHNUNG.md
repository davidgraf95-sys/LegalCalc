# FAHRPLAN-MATERIALIEN-VERZAHNUNG — E6a Stufe 1 vorgezogen
<!-- @lagebild name: Amtliche Materialien · zweck: Botschaften, Rundschreiben und Co. einbinden und mit den Normen verzahnen. -->

**Heimat: ROADMAP-Schritte `W2·6a-MAT` und `W2·6b-MAT-FINMA`.**

**Auftrag:** David 3.7.2026 — «Fundament, dass zukünftige Materialien direkt verlinkt sind: Wegleitungen
SECO für ArG, EDÖB für DSG, ESTV für MWSTG usw.» Vorgezogen VOR VPS.
**Stufe 1 = Verweis-/Register-Ebene:** pro Dokument eine Index-Karte (Nr./Titel/Datum/Behörde/PDF- bzw.
HTML-Live-Link, §7 a–d) + Norm-Mapping als Kanten am Norm-Artikel. **KEINE Volltext-Einbettung.**
**Rahmen:** CLAUDE.md §5 SSoT, §7 Zitat-Ausnahme a–d, §8 Ehrlichkeit, §15 Performance;
FAHRPLAN-DATENHALTUNG §3.1 `soft_law`/§3.2 `norm_referenzen`/§5 E6/Weiche C;
FAHRPLAN-VERZAHNUNG-UI §1.0 `VerzahnungsKante`, §V3.

---

## §0 · Kritik-Einarbeitungs-Tabelle

Zwei unabhängige Kritiken (A = 14 Befunde, B = 10 Befunde) gegen die Erst-Spec. Verdikte nach
Repo-Verifikation; jede Konsequenz nennt den Ziel-Abschnitt.

| # | Befund (kurz) | Verdikt | Konsequenz |
|---|---|---|---|
| A1 | Normrevisions-Problem ungelöst: kein Fassungs-Abgleich Dokument-Stand ↔ Ziel-Norm (revDSG 1.9.2023, MWSTG-Teilrev 1.1.2025, SECO-Stände 2012–2025); Drift-Tokens überwachen nur die Quelle, nie die Ziel-Norm | **berechtigt (Blocker)** | Neu §2.4 Revisions-Invariante: Cutoff-Tabelle je erlass_key, Downgrade artikelscharf→Erlass-Ebene, UI-Stand-Anzeige + Staleness-Hinweis, Wortlaut «verweist auf … (Stand des Dokuments: …)»; Tor-erzwungen (§4) |
| A2/B1 | DDL ungültig: `COALESCE(…)` im PRIMARY KEY wirft in SQLite/node:sqlite «expressions prohibited» — M0 scheitert am ersten CREATE | **berechtigt (Blocker)** | §2.1: `artikel`/`fundstelle` als `TEXT NOT NULL DEFAULT ''` (`'' = Erlass-Ebene`, dokumentiert), nackter UNIQUE-Key |
| A3 | Scheinautorität: ALLE Kanten als `herkunft='amtlich'` zementiert, obwohl Q4-Seiten-Fallback selbst «Heuristik» heisst und Q3 «kuratiert» ist — widerspricht VZUI-§1.0-Pflichtfeld | **berechtigt (Blocker)** | §2.1/§3: `quelle` je Kante ehrlich `'amtlich'\|'kuratiert'\|'maschinell'`; Invariante erweitert; UI nutzt bestehende Badge-Regel (zusammengeführt mit B7) |
| B2 | Append-only-Historie ohne committeten Träger: `daten/*.db` ist gitignored + wegwerfbar; «galt damals» und die Append-only-Invariante haben in CI/frischem Clone keine Baseline; echter Live-Rebuild kann Entlistetes prinzipiell nicht reproduzieren; volatile quell_ids in client-gefetchtem register.json = §15-Leak | **berechtigt (Blocker)** | Neu §2.3 committetes Zustands-Manifest (`bibliothek/register/soft-law-zustand.jsonl` — unter `daten/` unmöglich, da Parent gitignored); Weiche C präzisiert: Rebuild = deterministisch aus (Zustands-Manifest + Snapshot), nie Live-Quelle allein; register.json schlank (nur gelistete, ohne Interna); Snapshot-Beleg ehrlich reduziert auf «sha+Metadaten committet, Roh-Substrat lokal» |
| A4 | §7 a–d falsch gemappt: echte Buchstaben = Stand / Quelle-URL / **im UI sichtbarer Live-Link** / **automatische Drift-Erkennung**; «abgerufen» ist kein §7-Buchstabe, (c) wurde gar nicht geprüft; DB-Dokumente erscheinen schon ab M1 im Browse | **berechtigt** | §4 Tor auf echte a–d präzisiert; M1-DoD: Playwright-Beweis, dass die MaterialLeser-Karte für DB-Dokumente den sichtbaren Live-Link rendert |
| A5 | Entlistete Dokumente: Projektions-/UI-Verhalten undefiniert → tote amtliche Links bzw. Massen-Entlistung bei Crawl-Bruch | **berechtigt** | §2.5: entlistet ⇒ aus BEIDEN Projektionen raus; Entlistung nur bei grünen Count-Gates desselben Laufs; Quoten-Schwelle im Tor |
| A6 | Q1-Drift per «Publiziert am»-Stichprobe erkennt In-place-Änderungen nicht gesampelter Ziffern nicht; publicationId-Wechsel bei jeder Änderung unbewiesen | **berechtigt** | §3 Q1: Arbiter = Hash über komplettes ToC-XHTML inkl. aller cipherKeyDates je Publikation (1 GET/Publikation); Stichprobe nur Zweitsignal |
| A7 | Wortfeld-Tor-Löcher: `src/pages/MaterialLeser.tsx` nicht im Grep-Pfad; Grep über JSON trifft verbatim übernommene AMTLICHE Titel (falsch ROT bzw. Zwang zum Umschreiben amtlicher Titel) | **berechtigt** | §4: Pfade + `src/pages/Material*.tsx`; in JSON nur EIGENE Felder greppen, amtliche titel/beschreibung als Zitat-Felder ausgenommen |
| A8 | `drift_token NOT NULL DEFAULT ''` sabotiert das eigene Tor (leerer Default besteht die Prüfung) | **berechtigt** | §2.1: DEFAULT gestrichen; Tor prüft nicht-leer für stand/quelle_url/abgerufen/drift_token |
| A9 | Geister-Anker-Validierung undefiniert für Kanten auf AUFGEHOBENE Artikel (real existierende Kommentierungen) | **berechtigt** | §2.4: deterministischer Downgrade auf Erlass-Ebene + Protokoll-Log, nie stummer Drop, nie Tor-ROT |
| A10 | Q3-ID-Stabilität unbelegt: EDÖB hat keine Nummern-Systematik, Titel-Slug ⇒ Titelretusche = falsche Entlistung + Duplikat | **berechtigt** | §3 Q3: Slug-Normalisierung + Alias-Tabelle (alt→neu) im Adapter; Tor warnt bei Entlisten+Neuanlegen mit hoher Titel-Ähnlichkeit |
| A11/B10c | `fundstelle_url` mit volatiler publicationId ⇒ Link-Fäulnis zwischen Snapshots + kompletter Shard-Churn je ESTV-Neuversion | **berechtigt** | §2.1/§3 Q1: Basis-URL-Indirektion (Basis je Dokument in `quell_ids`, Kante trägt Suffix; Projektion setzt zusammen); Ziffer-Link-Stichprobe (url_effective/Soft-404) ins Netz-Tor |
| A12 | ROADMAP-`dep: []` unehrlich: M5 hängt hart am V1a-Merge, nur Fliesstext bildet das ab | **berechtigt** | @meta: `dep: [W2·7-VZUI (nur M5)]` |
| A13 | quell_snapshot-BLOBs = Repo-Bloat in der «git-getrackten» DB | **teilweise — Prämisse falsch:** `daten/*.db` ist gitignored (verifiziert .gitignore Z. 59), es gibt keinen git-Bloat | Grössen-Disziplin trotzdem übernommen (§2.2: nur extrahiertes Substrat, gzip, DB-Budget im Tor); Beleg-Frage löst B2 |
| A14 | M2-Vollständigkeits-Gate kippt in Dauerrot (Korpus führt Aufgehobene, SECO hat dafür kein PDF) oder stille Ignore-Liste | **berechtigt** | §3 Q2: Gate = Korpus-Bestand MINUS aufgehoben-markierte MINUS begründete Ausnahmeliste (Datum+Grund); neue unerklärte Lücke ⇒ ROT |
| B3 | Key-Kollisionen bei ALLEN 4 Quellen, nicht nur Q4 (verifiziert: `ESTV-MWST-INFO-09`, `SECO-WEGL-ARG-*`, `EDOEB-LEITFADEN-DATABREACH/-TOM/…` existieren); Spec-Beispiele schrieben die Dubletten selbst fest | **berechtigt** | §2.6: Abgleich-Tabelle + 1:1-Tor für alle vier Adapter; bestehender MATERIAL_REGISTER-Key gewinnt; Dubletten-Tor via quelle_url-/Nummern-Match |
| B4 | VBGÖ ist nicht im Korpus (kein VBGOE.json, kein ERLASS_REGISTER-Key — verifiziert) → reisst das spec-eigene Geister-Anker-Tor | **berechtigt** | §1: VBGÖ aus Stufe-1-Scope gestrichen; §2.4 Regel für nicht-korpusierte Erlasse (DB ja, Projektion nein) |
| B5 | 300-KB-Shard-Budget bricht sicher am ERSTEN Testfall MWSTG (10⁴+ Kanten × lange URLs ≈ MB); «Folge-Entscheid» ist keine Eventualität | **berechtigt** | §2.2: JETZT entschieden — Kanten je (Dokument, Artikel) aggregiert (Ziffern-Liste als Feld) + Basis-URL-Indirektion + Bucket-Split ab M0 gebaut; im M1-Aufwand eingepreist |
| B6 | M1–M4 sind Prod-sichtbare Content-Releases (register.json wird live von Suche+Browse gefetcht; Auto-Merge + main=Prod) und brauchen `src/lib/materialien/{typen,register}.ts` (DoktypId/Labels); nicht registrierte Behörde/Doktyp verschwindet still aus Browse | **berechtigt** | §6: je Adapter-Etappe als Content-Release benannt (Lesbarkeits-/Perf-Stichprobe in DoD); @meta-Kollisionsliste ergänzt; §4 Tor «jedes DB-Dokument hat registrierte Behörde+Doktyp» |
| B7 | norm_referenzen weicht vom ENTSCHIEDENEN §3.2-Schema ab (zitat_key/roh_zitat/konfidenz/quelle fehlen) — bricht den Nordstern «EIN Query über alle Doktypen» | **berechtigt** | §2.1: §3.2-Spalten vollständig übernommen; `quelle`-Enum bewusst um `'amtlich'` erweitert (Nachtrag in FAHRPLAN-DATENHALTUNG §3.2 = M0-Posten); stand/abgerufen/fundstelle_url als additive Spalten |
| B8 | robots.txt `Disallow: /` auf www.gate.estv…: Vollcrawl + wiederkehrende Drift-Läufe sind ein Governance-Entscheid, kein «offener Punkt: keiner»; `check:netz` wird von keinem Workflow aufgerufen (normen-monitor.yml ruft Netz-Checks einzeln); Crawl dauert bei Concurrency 1–2 Stunden | **berechtigt** | §8: robots-Freigabe Q1 = expliziter David-Entscheid, M1 daran gated; §4: `check:materialien-netz` als eigener normen-monitor.yml-Step (M1-DoD); Crawl-Dauer in §6 ausgewiesen |
| B9 | Aufwand 5–7 Tage optimistisch: check-materialien.ts ist Hard-Assert `Manifest == MATERIAL_REGISTER` → Neubau, nicht «Erweiterung»; gegenpruefung-Läufe je Etappe; Shard-Split + Crawl-Dauer obendrauf | **berechtigt** | §6: M0 1½–2 T, M1 2–3 T, Summe ehrlich **7–10 Tage** |
| B10a | gen:zaehler zählt Materialien heute gar nicht — Pflicht wirkungslos | **berechtigt** | §4/§5: Pflicht-Lauf bleibt (billig, no-op ist harmlos); Zähler-Erweiterung um Materialien = expliziter M5-Posten, wenn die UI sie zeigt |
| B10b | `StatusBadge 'nur-verweis'` ist in V1a NICHT gebaut (VZUI: erst V3) — M5 baut die Variante selbst | **berechtigt** | §5.3: M5 baut die Variante (bewusster V3-Vorzug); eine Nachtragszeile in FAHRPLAN-VERZAHNUNG-UI §V3 = M5-Posten |
| B10d | Sequenz-Gate V1a verifiziert korrekt; `src/lib/kontext.ts` dort ebenfalls Sperrfläche («nur M5» im @meta korrekt) | **bestätigt** | kein Fix nötig |

---

## §10 · ROADMAP-Spec W2·6b-MAT-FINMA (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «§9 · Stufe 2 — FINMA prioritär» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Fokus-Dekret-Priorität** — Kontext: Bewerbung David bei der FINMA mit Verweis auf LexMetrik,
  der Bereich muss vorzeigbar sein)* — **F1:** FINMA als nächste Quelle der bestehenden
  Stufe-1-Pipeline (Rundschreiben/Wegleitungen/Aufsichtsmitteilungen, amtlich Art. 5 URG;
  browserloser Adapter nach §3-Muster, Provenienz §7 a–d; Quell-Wahl zuerst: strukturierte
  Endpunkte vs. PDF empirisch erheben). **F2 (evtl., David «wenn möglich»):** direkte Verzahnung
  FINMA-Schreiben ↔ Erlass-Artikel (FINMAG/FIDLEG/FINIG/KAG/BankG/GwG/VAG) via Referenz-Extraktion —
  VOR Bau H0-Machbarkeits-Verdikt mit Zahlen; Extraktion ⇒ `check:gegenpruefung`. Kanten tragen die
  `W2·7-BEZUG`-Facetten (`quelltyp: materialien`). Detail: diese Datei §9.
  Trailer `Roadmap: W2·6b-MAT-FINMA`.


---

## Archivierte Abschnitte *(Plan-Neuschnitt 29.8.2026)*

9 Abschnitt(e) dieser Datei sind wörtlich nach
[`archiv/fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`](../archiv/fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) ausgelagert — sie tragen keine offene
ROADMAP-Bindung mehr. Titel:

- §1 · Scope-Entscheid
- §2 · Datenmodell (`daten/soft-law.db` lokal + committeter Zustandsträger, Weiche C präzisiert)
- §3 · Adapter (browserlos, §7 Build-Regel 5/6)
- §4 · Tore
- §5 · UI-Andocken (minimales Delta, Sequenz-Gate)
- §6 · Etappierung + Aufwand (ehrlich, §0/B9), je PR mit Toren
- §7 · Bewusst NICHT (Stufe 1)
- §8 · Offener Punkt für David (genau EINER)
- §9 · Stufe 2 — FINMA prioritär (`W2·6b-MAT-FINMA`, §14-Intake 24.7.2026)
