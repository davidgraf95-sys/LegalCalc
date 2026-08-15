# FAHRPLAN-FEDLEX-PORTFOLIO — Nützliche Fedlex-Datenarten für LexMetrik
<!-- @lagebild name: Bundesrecht aktuell halten · zweck: Wächter gegen Abweichungen zur amtlichen Quelle; Korpus-Lücken schliessen; Watchlist. -->

**Heimat: ROADMAP-Schritte `QS-CURRENCY` und `W2·14-SIGNAL`** (je Paket am Ende dieses
Dokuments benannt). *Nachtrag 14.8.2026 (QS-PLAN-EINFACH): die früheren Teil-Etiketten
`W2·14-SIGNAL-B1/-B2/-GER` sind Checklisten-Zeilen des Dachs — Trailer ist einheitlich
`Roadmap: W2·14-SIGNAL`.*

## §0 · Zweck und Quer-Regeln

> **Fahrplan-§-Diät 15.8.2026 (`aufraeumen.md` §4b).** Die vier ausgeführten Pakete **2, 5, 3, 4**
> stehen im vollen, unveränderten Wortlaut in [`archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`](../archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md);
> hier hält je eine Stub-Zeile den §-Anker. Offen und darum **hier** geblieben sind Paket 1
> (nur P1-a/b gebaut), Bridge B1 und die §§ 15–20.

Detailquelle (§14) zu den oben genannten ROADMAP-Schritten — sechs verwertbare
Fedlex-Datenarten für LexMetrik, Paket für Paket. Kein zweiter Einstieg.
**Fable plant, Opus baut** — jedes Paket ist Risiko-Pfad (Extraktion/Norm) ⇒
`check:gegenpruefung` Pflicht (§14 DoD), §7-Verifikation, §9-Deploy nur mit
Davids Ja. **Quellen-Hygiene (für ALLE Pakete):** ausschliesslich die amtliche
Fedlex-Stelle (SPARQL-Endpoint + Filestore-HTML) — nie ein Dritt-Repo.

> **Rolle dieses Dokuments:** Detailquelle (§14) zu den ROADMAP-Schritten, die am Ende je Paket benannt sind. **Kein** zweiter Einstieg. **Fable plant, Opus baut** — jedes Paket ist Risiko-Pfad (Extraktion/Norm) → `check:gegenpruefung` Pflicht (§14 DoD), §7-Verifikation, §9-Deploy nur mit Davids Ja.
> **Quellen-Hygiene (für ALLE Pakete):** ausschliesslich die amtliche Fedlex-Stelle — SPARQL `https://fedlex.data.admin.ch/sparqlendpoint` (POST, `Accept: application/sparql-results+json`, `curl --data-urlencode`) + Filestore-HTML. **Nie** das Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA, kommerziell verboten). Kein fremdes Byte fliesst ins Produkt.
>
> Status: Plan (2.7.2026), noch kein Code. §14-Intake (ROADMAP-Verlinkung) erfolgt erst mit Davids Freigabe je Paket.
>
> **Ergänzt 3.7.2026:** Opus-Härtung (7 Untersuchungs-Briefs + 3 adversariale Kritiken + 3 live-verifizierte Repo-Fakten) in DIESE eine Datei eingearbeitet — Fable-Überblick bleibt §0; Andockregeln/Bausteine/Moat-Hebel/Verifikationspunkte/Meilensteine (Abschnitte 0b–0d + je Paket «Opus-Härtung» + Bridge B1 + Abschnitte «Recht/Lizenz-Leitplanken» / «Offene Verifikationspunkte» / «Reihenfolge & Meilensteine») stammen aus dem Opus-Bauplan. Reihenfolge bindend **1 → 2 → (B1) → 5 → 3 → 4**.
>
> **Drei live gegen den Arbeitsbaum verifizierte Repo-Fakten (nicht nur aus den Briefs übernommen; Currency-Blindfleck ist Paket-1-relevant):**
> 1. `scripts/fedlex-pins.ts:19` = `/^\s*"([a-z_]+)\|([a-z0-9/_]+)\|(\d{8})\|/gm` — Namensgruppe ohne `0-9`.
> 2. `scripts/fedlex-cache.sh` enthält **bereits** 13+ Ziffern-Namen-Pins (`asylv1/2/3`, `argv1..5`, `bvv_2`, `bvv3`, `co2_gesetz`, …) → diese Pins sind **jetzt parser-blind** = latenter Currency-Blindfleck. 218 Pin-Zeilen total.
> 3. `scripts/datenhaltung/ingest.ts:8,32` ingestet **nur** `public/normtext/bund` als `typ='normtext-bund'`; `scripts/gegenpruefung/kern.ts:63-84` Risiko-Globs = `scripts/normtext/`, `src/lib/normtext/`, `public/normtext/*.json`, `scripts/**/*check*` — **nicht** `scripts/materialien/`, **nicht** `public/materialien/`, **nicht** `scripts/`-root (also `fedlex-cache.sh`-Edits triggern das Gate nicht).

---

## 0. Portfolio-Überblick

Fedlex ist die **Gesetzgebungs-Datenbank** des Bundes (Erlasse, Materialien, Verfahren, Staatsverträge) — **nicht** Rechtsprechung. Sechs Datenarten sind für LexMetrik verwertbar; fünf davon bauen, eine ist bewusst ausserhalb des Scopes.

| # | Paket | Wert | Machbarkeit (heute) | Aufwand | Priorität |
|---|-------|------|---------------------|---------|-----------|
| **1** | **Gesetze-Currency & Coverage** (20 stale aktualisieren + Monitoring-Lücke schliessen + 56 künftige als Wiedervorlage) | **Hoch** — Kernversprechen «immer geltende Fassung» (§7 Build-Regel 3); heute liefern wir 20 veraltete Erlasse aus | **Belegt** — Gap-Report fertig (`fedlex-gap-report-2026-07-02.md`); Pipeline (`normtext`/`fedlex-cache.sh`/`check:fedlex-versionen`) existiert | **M** (Datenlauf + kleiner Tor-Umbau) | **P0** |
| **2** | **Botschaften / Bundesblatt** (Entstehungsgeschichte je Gesetz) | **Hoch** — neue Klinge «amtliche Materialien», Burggraben Norm↔Gesetzesgeschichte; kein Wettbewerber verzahnt das | **Belegt** — SPARQL-Reverse-Kette getestet (AVIG→11, DSG→2); Materialien-Modell trägt es fast unverändert | **M–L** (neuer Datentyp + Pipeline + UI-Abschnitt) | **P1** |
| **5** | **Änderungshistorie / Amtliche Sammlung** (Revisions-Timeline je Gesetz: welche AS/RO-Erlasse haben es wann geändert) | **Hoch** — Schwester zu Paket 2; Botschaft = Genese-Absicht, AS-Erlass = die tatsächliche Änderung → zusammen volle Gesetzes-Geschichte | **Belegt** — live getestet (DSG 235.1): Pfad über `classifiedByTaxonomyEntry` + `dateEntryInForce` liefert Änderungs-Erlasse mit Datum, Titel, RO-Fundstelle, Botschafts-Verzahnung | **M–L** (teilt Paket-2-Pipeline) | **P1.5** |
| **3** | **Vernehmlassungen** (`eli/dl/proj`, ~2000) | **Mittel** — «was kommt»-Vorschau, ergänzt Gesetzgebungs-Tracking (`W3-AUSBAU`, vormals W3·11) | **Teilweise offen** — Projekt-Graph-Andockung plausibel (gleiche `?proj`), aber **nicht** end-to-end getestet; POC nötig | **L** (nach Botschaften-Pipeline günstiger) | **P2** |
| **4** | **Staatsverträge** (`eli/treaty`, ~18 500) | **Mittel-niedrig** — punktuelle Lücken der International-Rubrik (wir haben 18 Volltext + 2 PDF) | **Teilweise offen** — `eli/treaty` ≠ `eli/cc`-Markup; kuratierte Auswahl statt Masse; POC je Kandidat | **S–M** (kuratiert, kein Bulk) | **P3** |
| **6** | **Rechtsprechung** | — | **Nicht in Fedlex** | — | **Out of scope** (OpenCaseLaw/bger, W2·6) |

**Empfohlene Reihenfolge (Wert × Machbarkeit × Aufwand): 1 → 2 → 5 → 3 → 4.** Paket 1 heilt einen **aktiven Treuedefekt** (wir liefern Veraltetes) bei belegter Pipeline und geringstem Aufwand → zuerst. Paket 2 ist das Vorzeige-Paket mit belegter Machbarkeit und hohem Neuwert → als Nächstes. Paket 5 folgt **unmittelbar auf 2** (erbt dessen Pipeline, Currency-Daten liegen schon vor, komplettiert die volle Gesetzes-Geschichte). Paket 3 erbt ebenfalls die Graph-Pipeline, Machbarkeit erst per POC → vierte Stelle. Paket 4 ist kuratierte Feinarbeit mit dem geringsten Grenznutzen → zuletzt.

---

## 0a. Endziel & Moat-These (warum dieses Fundament) — Opus-Bauplan

**Endziel (ROADMAP.md:30-52):** LexMetrik = „Schweizer Taschenmesser für alle Juristen" mit vier Klingen — **Konsultieren** (Gesetze DE/FR/IT, Rechtsprechung, Materialien, Gesetzgebung), **Rechnen** (deterministisch, jeder Wert mit Norm+Link+Stand), **Verzahnen** (der eigentliche Burggraben: Norm → Werkzeug → Schriftsatz und zurück), **Finden**. Alles auf amtlichen, URG-freien Quellen (Art. 5 URG). Das Fedlex-Portfolio sitzt in **Welle W2·6** („Konsultieren-Klingen") und ist der Datenausbau, der die Konsultieren-Klinge vertieft und die Rohkanten für Verzahnen legt.

**Moat-These (STRATEGIE-PLATTFORM.md:39-45):** Der Moat ist **nicht der Code** (Engine + SPARQL-Ketten sind in Wochen kopierbar), sondern (B) die **kuratierten, quervernetzten Datenassets**, (C) der **Verifikations-Prozess** und (D) Davids fachkundige Abnahme. Daraus folgt die zentrale Härtung dieses Plans gegen die Moat-Kritik:

- **Der Moat sitzt einen Schritt hinter dem Punkt, wo die Original-Specs aufhören.** Eine flache `nur-live-link`-Liste („Botschaft: Datum + Titel + Fedlex-Link") ist ein hübscherer Curia-Vista-Ausschnitt — Fedlex besitzt diese Daten nativ, ein Link darauf ist Commodity. **Verteidigbar** sind erst (a) die **norm-verankerte Aggregation** (die Genese steht *auf* der Gesetzesseite, nicht in einem separaten Portal) und (b) die **Verzahnung** dieser Kanten mit Rechtsprechung (Zitat-Graph) und Rechnern.
- **Deshalb drei Moat-Härtungen, die in die Specs eingearbeitet sind** (Details §4): (1) Pakete 2/5/3 speisen in **denselben Norm-Kontext-Bus** ein, der schon Entscheide an einer Norm aufflächt (`KontextPanel typ="norm"`), statt fünf Silo-Sektionen nebeneinander; (2) **Artikel-Anker mitführen** (nicht auf Erlass-Ebene zementieren), damit artikelweise Genese/Änderung inkrementell wachsen kann — genau das, wofür Verlage Geld nehmen und was Fedlex nicht bietet; (3) **Currency als sichtbares Produkt** („geltend geprüft am TT.MM., maschinell") statt Minimal-Chip — eine verteidigbare Freshness-Aussage, weil selbst die Fedlex-Konsolidierung die AS trailt.

**Warum dieses Fundament zuerst:** Paket 1 behebt einen **Live-Defekt** (20+ stale Erlasse werden heute ausgeliefert, davon 13+ in einem parser-blinden Monitoring-Loch) und vertieft direkt Moat-Asset C. Ohne belastbaren Currency-Boden ist jede weitere Datenart nur mehr potenziell-veraltete Fläche. Reihenfolge daher bindend **1 → 2 → 5 → 3 → 4**, mit einem eingeschobenen **Bridge-Meilenstein B1 (Norm-Kontext-Bus)** nach Paket 2 (§7).

---

## 0b. Architektur-Grundsatz (Andockung an die neue DB; Datei↔DB-Koexistenz; Abstraktions-Schnittstelle) — Opus-Bauplan

**Verbindliche Speicher-Architektur (FAHRPLAN-DATENHALTUNG.md, Council 2.7.2026):** libSQL/SQLite, ein generator-erzeugtes, **gitignored** Artefakt `daten/lexmetrik.db`; die DB wird **Single Source of Truth** für Korpus-Inhalte, `public/*.json` + prerenderte Seiten werden **Projektion daraus**. Andockpunkt eine Schicht **unter** dem heutigen Generator: Adapter (`extrahiere-fedlex.ts` etc.) bleiben Extraktions-Wahrheit, schreiben künftig Zeilen ins DB-Artefakt; Prerender liest weiter nur JSON-Projektion. Parität nie auf `.db`-Rohbytes, sondern (a) JSON-Projektion byte-gleich + (b) kanonisches Dump-Manifest.

**Ist-Stand E0/E1 (verifiziert, NICHT der Memory-„nichts gebaut"-Stand):**
- **E0 ist gebaut.** `scripts/datenhaltung/{schema,ingest,projektion,build,check-paritaet}.ts`; `check:paritaet` läuft in der `check`-Kette als **In-Memory-Roundtrip** JSON→DB→JSON byte-gleich. **Schema heute minimal-generisch:** `datei(pfad,typ,erzeugt)` + `eintrag(pfad,idx,id,erlass,artikel,artikel_label,blob)`. `ingest.ts` ingestet **ausschliesslich** `public/normtext/bund` (`typ='normtext-bund'`, `ingestBundNormtext`, `BUND_DIR` konst.). `projektion.ts` rekonstruiert generisch via `blob = JSON.stringify(eintrag)` und setzt `{erzeugt, eintraege}` zusammen.
- **E1 (Generator-Flip) ist NICHT gebaut** (kein `daten/`-Verzeichnis, kein Adapter-→-DB-Schreibpfad). Der heutige **Direktpfad Adapter → `public/*.json`** bleibt gültig und ist der Schreibweg für alle fünf Pakete.
- Die reichen Ziel-Tabellen aus FAHRPLAN-DATENHALTUNG §3 (`erlasse`, `artikel`, `erlass_fassungen`, `materialien`, `erlass_revisionen`, FTS5) **existieren in E0 noch nicht**. Sie sind Zukunfts-Schema (E6). **Kein Paket darf sie als vorhanden unterstellen** (härtet die Refutation gegen Paket 5, die eine `REFERENCES erlasse(key)`-Reife suggerierte, die E0 nicht hergibt).

**Daraus die verbindlichen Andock-Regeln (gelten für alle Pakete):**

1. **Kein Paket baut einen eigenen DB-Layer vorweg.** Geschrieben wird in die bestehenden Datei-Formate (`NormSnapshot`/`register.json`/Sidecar). Beim E1-Flip wird **nur der Schreibpfad umgehängt**, der Adapter-Output bleibt byte-identisch (FAHRPLAN-FEDLEX-PORTFOLIO.md:47; FAHRPLAN-DATENHALTUNG §8).
2. **`check:paritaet` deckt heute NUR Bund-Normtext — das ist kein automatisches Sicherheitsnetz für neue Dateien** (Refutation-Treffer 2 + Vollständigkeits-Finding 3). Jedes Paket, das eine neue Projektionsdatei erzeugt (`currency.json`, `materialien/register.json`, `revisionen/*.json`), muss **entweder** `ingest.ts` + `check-paritaet.ts` additiv um seinen Datei-Typ erweitern (mit eigenem Roundtrip-Nachweis) **oder** eine explizite **„noch-nicht-in-DB"-Allowlist** führen, sodass eine ungedeckte neue Datei **rot** statt still-grün ist. „`check:paritaet` deckt automatisch mit" ist als Behauptung **verboten**.
3. **Serialisierungs-Vertrag ist der echte Paritäts-Hebel** (Refutation-Treffer bei Paket 1): Der Blob-Roundtrip ist strukturagnostisch — eine neue Block-Form roundtrippt byte-gleich. Bruch entsteht nur, wenn (a) der Generator Key-Reihenfolge/Whitespace/Trailing-Newline ändert (`projektion` erzwingt `JSON.stringify(obj,null,2)` ohne Trailing-Newline) oder (b) eine Datei ein **drittes Top-Level-Feld** neben `erzeugt`/`eintraege` bekommt (würde still gedroppt). Wer eine neue Datei ins Ingest zieht, hält exakt diesen Vertrag ein.
4. **Schema-Rückkopplung Pflicht** (Vollständigkeits-Finding 17): Neue Spalten (Paket 3: `vern_status`, `frist_start/ende`, `proj_eli`) und neue Tabellen (Paket 5: `erlass_revisionen`) sind **Änderungen am FAHRPLAN-DATENHALTUNG-Schema**. Jedes Paket, das solche definiert, trägt sie in denselben Commit als Notiz in `FAHRPLAN-DATENHALTUNG.md §3` zurück (E6b-Koordination), damit E6 nicht ein zweites, divergierendes Schema baut.
5. **Abstraktions-Schnittstelle im Generator:** Jeder neue Generator wird von Anfang an **zweigeteilt** geschnitten — reine `extrahiere()`/`parse()`-Funktion (Roh → normalisierte Datensätze, deterministisch, injizierbare `fetchImpl`) getrennt von `schreibe()` (Sidecar/Register-Writer). Beim E1-Flip wird nur `schreibe()` auf DB-Insert umgehängt. **Kein** `Date.now()` in der Logik (§2): `--datum=$(date +%F)` aus der Shell.

---

## 0c. Gemeinsame Bausteine (wiederverwendbar über alle Pakete) — Opus-Bauplan

Wiederverwenden statt neu bauen (§1 CLAUDE.md: lieber Duplikat behalten als falsche Abstraktion — aber **verhaltensneutrale** Mechanik wird geteilt):

**Fetch/Cache/Retry**
- `scripts/normtext/netz-retry.ts` → `fetchMitWiederholung()`: Timeout+Backoff-Hülle, **deterministisch** (kein `Math.random`), injizierbare `fetchImpl`/`warte` (testbar), Retry bei 429/5xx/Netzwurf. **Alle SPARQL-POSTs laufen darüber.**
- `scripts/fedlex-cache.sh` (406 Z., `npm run check:caches`): Basis-URL `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli`; Array `EINTRAEGE` = `name|eli|kons(YYYYMMDD)|html-N|pflicht-anker|SR`. Re-Pin-Historie als Kommentare (§7-Nachverifikation).
- **store-raw (Reproduzierbarkeit §11):** jede SPARQL-Rohantwort nach `bibliothek/materialien/<typ>-raw/<SR>.json` bzw. `bibliothek/normtext/revisionen-raw/<KEY>.json` — Parser-Bug ⇒ **Re-Parse aus Raw, nie Re-Crawl**.
- **Globales Rate-Budget** (Vollständigkeits-Finding 20): `check:netz` bündelt künftig `fedlex-versionen` + `botschaften-netz` + `revisionen-netz` + `vernehmlassungen-netz`, jeder mit 218-SR-Läufen gegen **denselben amtlichen Endpunkt**. Gemeinsame **sequenzielle/klein-batchende** Drossel (VALUES-Batch à ~60 wie Gap-Report; keine paketübergreifende Parallelität) in `netz-retry.ts` als geteilte `mitDrossel()`-Hülle. Höflichkeit + eigene Timeouts.

**SPARQL-Endpunkt (einzige Materialien-/Currency-Quelle)**
- `https://fedlex.data.admin.ch/sparqlendpoint` — POST, `Content-Type: application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`. Mechanik verbindlich aus `scripts/fedlex-versionen-pruefen.ts` (VALUES-Batch, typisierter `skos:notation`-Join).
- **Zwei belegte Fallen, immer beachten:** (i) `skos:notation` MUSS typisiert sein (`"235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique>`), sonst Endpunkt-**Timeout**; (ii) **keine UNION-Queries** für Coverage-Läufe (bekannte ~700-statt-alle-Falle) — VALUES-Batching, Ergebnis gegen bekannte Gesamtzahl plausibilisieren (218 Volltext-Erlasse / 229 Bund-Erlasse Gap-Report).

**ID-Auflösung ELI / Geschäfts-Nr / SR**
- `scripts/fedlex-eli-aufloesen.ts` (SR→ELI, geltend = grösste `dateApplicability` ≤ heute, gibt fertige `cache.sh`-Zeilen aus).
- `scripts/fedlex-pins.ts` `lesePins()` = **SSoT** (parst `cache.sh`, keine zweite SR-Liste). **P1-b fixt hier zuerst die Regex** (`[a-z0-9_]+`, §Paket 1) — bis dahin ist jede Pin-basierte Zählung über Ziffern-Namen blind.
- Erlass-Grundmenge = `ERLASS_REGISTER` / `public/normtext/register.json` mit `ebene==='bund' && status==='snapshot'` (218 Erlasse, alle mit `sr`).

**Currency-Sonde**
- `scripts/fedlex-versionen-pruefen.ts` (`npm run check:fedlex-versionen`): `?c jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`, geltend = `max(date ≤ heute)`, künftig = `min(date > heute)`. Exit 0 OK/HINWEIS · 1 ÜBERHOLT · 2 Netzfehler. **Currency-Arbiter für alle Snapshot-/PDF-Erlasse.**

**Verifikations-Tore (Bestand, `scripts/normtext/` + Composite `check`)**
- `check:vollstaendigkeit` (jedes `art_*`-Token braucht Snapshot; Kanton-Zitat-Abdeckung; Inhalts-Sanity; Manifest), `check:normtext`/`-netz` (Drift Fassungstoken vs. cache.sh; Pflicht-Anker; Kanton `--netz`), `report:confidence` (Quarantäne < Schwelle), `check:struktur-konsistenz`, `check:tabellen`, `check:bilder`, `check:pdf`/`-netz`, `check:invarianten`, `check:entscheide`, `check:caches`, `check:verfall`.
- `scripts/check-gegenpruefung.ts` + `scripts/gegenpruefung/kern.ts`: Diff-basiertes Gate. **Risiko-Globs heute:** `scripts/normtext/`, `src/lib/normtext/`, `public/normtext/*.json`, `scripts/**/*check*`. **Bekannte Löcher, die Pakete schliessen müssen:** kein `scripts/materialien/`, kein `public/materialien/`, kein `scripts/`-root. → **Jedes materialien-schreibende Paket erweitert `istRisikoPfad()` und testet die Rot-Auslösung positiv** (DoD-Pflicht, sonst ist `check:gegenpruefung` ein No-Op).

**Neue geteilte Helfer, die dieses Portfolio einführt**
- `sparqlBatch(query, valuesListe, fetchImpl)` — aus `fedlex-versionen-pruefen.ts` extrahiert (verhaltensneutral, §1), von Paket 1/2/3/5 genutzt.
- `shaEintrag()` / `KEY_UNSICHER`-Regex — aus `src/lib/materialien/register.ts` (Key-Sicherheit + Drift-Token).
- **§8-Status-Marker-Baustein** (Design-Token-konform): einheitlicher „maschinell aus dem amtlichen Fedlex-Graphen zugeordnet; massgeblich bleibt die amtliche Quelle" + Reichweiten-Hinweis + Fetch-**Fehler**-Zustand (≠ Leerzustand, Finding 15).

---

## 0d. Moat-Hebel (die 2–3 Verknüpfungen, die den Burggraben vertiefen) — Opus-Bauplan

*(= Verzahnungs-Rückgrat der ROADMAP-Produktvision; Code-Bestand `FAHRPLAN-DATENHALTUNG.md` §0bis. Bewusst VOR den Paketen: Hebel 1 «Norm-Kontext-Bus statt fünf Silos» ist die Fedlex-Instanz des Verzahnungs-Rückgrats, das Organisationsprinzip vor den Paket-Details.)*

**Hebel 1 — Norm-Kontext-Bus statt fünf Silos (Bridge B1, teuerster Einzelgewinn).** Botschaft (Genese) + Revision (Änderung) + Entscheide (aus dem bereits vorhandenen Zitat-Graphen `norm_kanten`/`zitat_kanten`, ~11,9M/8,7M Kanten) + Rechner an **einer** norm-verankerten Stelle. `<KontextPanel typ="norm">` existiert und trägt schon Entscheide — Pakete 2/5/3 speisen dort ein, statt daneben zu stehen. Das kann weder Fedlex noch entscheidsuche noch ein Gratis-Verlag. Umsetzung: `botschaftenFuerNorm`/`revisionenFuerNorm`/`vernehmlassungenFuerNorm` in denselben Bus routen (kein neuer Datenbau — Graph liegt vor).

**Hebel 2 — Artikel-Ebene statt Erlass-Ebene.** Eine Botschaft/ein AS erklärt *bestimmte Artikel*. Pakete 2/5/3 führen ab jetzt `artAnker?` mit (grob, wo ableitbar) — die Datenstruktur wird **nicht** auf Erlass-Ebene zementiert, damit die artikelweise Entstehungs-/Änderungsgeschichte (wofür Verlage Geld nehmen, was Fedlex nicht bietet) inkrementell wachsen kann (`W3-AUSBAU`, vormals W3·10, Etiketten-Konsolidierung 15.8.2026).

**Hebel 3 — Verifikation als sichtbares Produkt (Freshness-SLA).** Paket 1 macht Currency zum dauerhaft maschinell bewiesenen Zustand (Coverage-Assertion, `check:fedlex-versionen` Exit 0, Regex-Fix gegen den Blindfleck). P1-d hebt das vom Minimal-Chip zum sichtbaren **„geltend geprüft am TT.MM. (maschinell)"** — eine verteidigbare Vertrauensaussage, die kein Wettbewerber macht (selbst Fedlex-Konsolidierung trailt die AS). Prominent, nicht Randnotiz.

**Anti-Moat-Warnung (Moat-Kritik):** Eine flache `nur-live-link`-Liste ist Commodity. Gegen Fedlex gewinnt nur **Aggregation + Verzahnung + Rechner**, nie das Nachbauen von Fedlex-Links; gegen entscheidsuche nur **Norm↔Urteil** (via Zitat-Graph, den B1 anzapft). Paket 4 verteidigt nichts → Backlog.

---

## Paket 1 — Gesetze-Currency & Coverage (P0)

> **✅ P1-a/b PIN-KANONIK GEBAUT 11.7.2026 (Opus-Bau-Session; Branch `fix/fedlex-p1ab-pin-kanonik`; Trailer `Roadmap: W2·6`). QUERSCHNITTS-WURZEL GESCHLOSSEN.**
> Die noch offene P1-a/b-Wurzel (FAHRPLAN-GESETZESDARSTELLUNG-V2 §Querschnitts-Wurzel):
> `fedlex-cache.sh` dockte bei **166/227** Pins an die nicht-kanonische **Alias-URL**
> (`…-de-html.html`, html-N-Feld 0) an → Alt-Generations-Dumps + Soft-404-Casemates-
> Shells; die 1–5-Fallback-Heuristik konnte die echten kanonischen N (kov/ssv/
> kkv_finma=14, chemrrv=26, finma_gebv=17, mwstv=11) nie erreichen. **Fix:** jedes
> html-N ist jetzt die registrierte `isExemplifiedBy`-Manifestation — aufgelöst von
> `scripts/fedlex-manifest.ts` (`loeseHtmlManifeste`/`nAusUrl`), angewandt von
> `fedlex-repin-kanonik.ts`, dauerhaft bewacht vom neuen **Kanonik-Arbiter** in
> `check:fedlex-versionen` (html-N ≠ isExemplifiedBy ⇒ Exit 1; negativ-getestet).
> **Datenlauf:** 104 Snapshots + 130 Struktur-Sidecars aus der kanonischen Fassung
> regeneriert (reine Datum-Churn zurückgesetzt), register.artikelAnzahl + artikel-
> revisionen-Shards + Bilder (4 verwaiste weg, GBV-Dangling-Ref geheilt) nachgezogen.
> **KEIN Parser-Eingriff** → jeder Text-Diff ist AMTLICH (Quelle alias→kanonisch):
> 10 Erlasse +Artikel (Soft-404-Heilung), 85 nur FN/Text-Drift, 9 nur −`lvl_`-Struktur
> (kein `art_`-Verlust). Musterheilung OR (Kronjuwel, html-4→html-12): Alias-Dump
> trug «Mietzinse die künftig fällig werden» ohne Kommata + «2 e 3»-Leak — kanonisch
> korrekt. **Härtung (b):** cache.sh Casemates-Shell- + Anker-Count-Sonde; `struktur-
> run` «0 übersprungen»-Pflichtkontrolle (fehlender Cache = harter Fehler statt still).
> 23 neue `[tab]`-Marker-Artefakte (Anhang-Inhalt) ins Expected-Fail-Register triagiert
> (Text je erhalten, Sanierung = P5). Neue `[tab]`-`<p>`-Klasse `man-space-before-0`
> (leerer Spacer) entschieden. Voller `npm run gate` grün; engine golden byte-gleich.
> **Gegenprüfung bestanden** (unabh. Opus-Zweitdurchgang, 5 Stichproben live gegen
> Fedlex: OR/UNO_PAKT_II/GFK/LUGUE/DBG — kein Norm-Verlust, DBG-Beträge exakt).
> Beleg: `bibliothek/register/fedlex-pin-kanonik-2026-07-11.md`.
>
> **✅ P1-a + P1-b (Currency-Datenlauf) AUSGEFÜHRT 5.7.2026 (Branch `feat/fedlex-p1-ab`; Trailer `Roadmap: QS-CURRENCY`).**
> **P1-b (Monitoring dicht, zuerst):** Regex-Fix `fedlex-pins.ts` `[a-z_]+`→`[a-z0-9_]+` (die 11 Ziffern-Namen-Pins
> asylv1/2/3, argv1..5, bvv_2, bvv3, co2_gesetz waren parser-blind → jetzt 207→218 überwacht) + Parser-Selbsttest
> `src/tests/fedlex-pins.test.ts` (geparste Pins == cache.sh-Datenzeilen, Gegen-Regex). **Coverage-Assertion** in
> `check:normtext` (offline, `drift-logik.ts` `pruefeCoverage`/`fedlexEliAusUrl`): jeder Register-Eintrag bund/snapshot
> mit Fedlex-ELI braucht einen cache.sh-Pin, jedes pdf-embed einen PDF_EMBED_QUELLEN-Eintrag — rot bei jedem künftigen
> ungepinnten Volltext. **PDF-Embed-Pins ins Monitoring:** `fedlex-versionen-pruefen.ts` merged `lesePdfEmbedPins()`
> (EMRK/NYÜ) in dieselbe SPARQL-Currency-Prüfung; `lesePins()`-Signatur unverändert.
> **P1-a (Datenlauf):** die echten 18 überholten Snapshots (Stand 5.7.: kvg kvv svg rpg klv vrv ssv rpv vts mepv bpv vil
> fdv → 20260701; argv2 → 20260201; asylv1/2/3 icao → 20260612) neu gepinnt (html-N SPARQL-kanonisch via
> `jolux:isExemplifiedBy` — klv/vrv=8, **ssv=14** ausserhalb der 1–5-Fallback-Heuristik; Filestore-Inhalts-Sonde
> Anker+SR + SPARQL deckungsgleich) und gezielt re-extrahiert (`--nur=bund --erlass=…`). Artikel-Diff: **+85 neue
> Artikel, 9 eId-Renames/Bereichs-Regroups 1:1 belegt, 0 echter Verlust** (SVG disp_u2_art_108→108; VRV/RPV Annex-Reorg;
> ASYLV2-Bereiche; VIL 27bbis = reale swisstopo-Änderung). VRV-«99 geändert» ≈ Soft-Hyphen-Bereinigung der N=8-Fassung
> (kein Sachinhalt). **2 PDF-Embeds:** EMRK 20050323→20220916 (kanonische pdf-a trägt Suffix `-2`; suffixlos = ÄLTERER
> Re-Issue → neues Feld `pdfSuffix` in `pdf-embed.ts`), NYÜ 20200207→20260506. `check:fedlex-versionen` **Exit 0 (0 stale,
> beide Pin-Quellen)**. **Zwei Mechanik-Bugs, die der Lauf aufdeckte:** (1) Golden-`--erlass`-Merge behielt die ALTEN
> Keys der regenerierten Erlasse → 9 Phantom-Golden-Keys; jetzt werden nur die regenerierten Erlasse verworfen + frisch
> ersetzt. (2) `check:pdf --netz`-Currency: notation-Join × `LIMIT 300` = Partial-Result-Falle (EMRK geltend fälschlich
> 20050323) → ELI-ConsolidationAbstract-Query. ASYLV2 art_41 Formel-`<dl>` («[tab]», Content erhalten) als Expected-Fail
> registriert. **P1-d-Refresh:** `gen:fedlex-wiedervorlage` neu gelaufen → die 18 tragen jetzt den geprüft-Chip
> (currency.json 200→218). Alle Tore grün, engine golden 201 byte-gleich. Gegenprüfung **bestanden** (unabhängiger
> Opus-Adversarial gegen Fedlex-SPARQL+Filestore). Beleg: `bibliothek/register/fedlex-currency-2026-07-05.md`.
>
> **✅ P1-c + P1-d AUSGEFÜHRT 4.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p1-cd`; Trailer `Roadmap: QS-CURRENCY`).**
> Neu: geteilter SPARQL-Helfer `scripts/fedlex-sparql.ts` (`sparqlBatch`, injizierbare fetchImpl) + Generator
> `scripts/fedlex-wiedervorlage-generieren.ts` (`npm run gen:fedlex-wiedervorlage -- --datum=…`), getrieben aus der
> **Register-Grundmenge** (`register.json`, ebene=bund & status=snapshot = 218; NICHT `lesePins()`, dessen Regex 11
> Ziffern-Pins verfehlt). **P1-c:** 56 künftige Konsolidierungen (`dateApplicability` > Laufdatum) als datierter
> AUTO-Block (`<!-- AUTO fedlex-wiedervorlage -->`, 5-Spalten-Grammatik, idempotent) in `parameter-verfall.md`;
> `gen:verfall` nachgezogen (69 terminierte Einträge), `check:verfall`/`-ui` grün. **P1-d:** Sidecar
> `public/normtext/currency.json` ({key:{geprueftAm, naechsteFassungAb?}}), zwei Chips «geltend geprüft am … (maschinell)»
> + «nächste Fassung ab …» in der **geteilten** `ErlassLeserKopf` (G2b — beide Panes) UND im prerenderten SEO-Kopf
> (`erlassVolltextHtml`, CLS 0). **§8-Härtung (Abweichung vom Wortlaut):** «geltend geprüft» wird NUR für Erlasse
> geschrieben, deren Pin == geltende Fassung ist — überholte erhalten keinen falschen Freshness-Chip. `currency.json`
> in `ingest.ts`-Paritätsklasse aufgenommen; `istRisikoPfad()` um `scripts/fedlex-*` erweitert (Rot-Auslösung positiv
> getestet). Gegenprüfung **bestanden** (10 Stichproben OR/ZGB/STGB/KVV/AHVG/BVV_2/CISG/KRK/VIL/ASYLV1 unabhängig gegen
> Fedlex-SPARQL, 2 Filestore-Proben). golden byte-gleich, `check:paritaet`/`datenhaltung`/`normtext`/`smoke` + e2e grün.
>
> **⚠ KORREKTUR: P1-a + P1-b sind NICHT gemergt.** Der Ausführungsvermerk unten (PR #117, docs-only) beschreibt Arbeit
> aus **PR #103 — die CLOSED (nicht merged) wurde**: Regex-Fix, `sparqlBatch`, Coverage-Assertion, PDF-Embed-Merge und
> die 20-Erlass-Aktualisierung fehlen in `main`. Empirisch 4.7.: `fedlex-pins.ts` Regex weiter `[a-z_]+`; kein
> `fedlex-currency-2026-07-03.md`; **`check:fedlex-versionen` rot — 18 Pins überholt** (der register-getriebene P1-c-Lauf
> sieht 18, `check:fedlex-versionen` via `lesePins` nur 14 — die 4 zusätzlichen ASYLV1/2/3+ARGV2 sind exakt das
> parser-blinde Ziffern-Loch). **P1-a/P1-b bleiben OFFEN** (nächste Bau-Einheit, eigener Risiko-/Golden-Pfad; nicht mit
> P1-c/d gebündelt, §14.2). Der folgende «✅ P1-a + P1-b»-Block ist daher als **Plan**, nicht als Ist-Stand zu lesen:
>
> **P1-a + P1-b (Plan; PR #103 geschlossen, siehe Korrektur oben):**
> Frischer Ist-Befund 3.7. == Gap-Report (18 stale Pins + EMRK/NYÜ). **P1-b:** Regex-Fix `fedlex-pins.ts` `[a-z0-9_]+`
> (207→**218** überwachte Pins; die 11 «ohne Pin» waren in Wahrheit parser-blinde Ziffern-Pins — Kritik-Korrektur bestätigt)
> + Parser-Selbsttest `src/tests/fedlex-pins.test.ts` + **Pin-Coverage-Assertion** in `check:normtext` (negativ rot-getestet)
> + **`check:pdf-netz`-Fix** (notation-Join × LIMIT 300 = Partial-Result-Falle; EMRK-Pin 20050323 bestand fälschlich grün —
> jetzt ELI-Abstract-Query) + Gegenprüfungs-Glob `scripts/fedlex-*` + Tests. **P1-a:** alle 18 Snapshots + 2 PDF-Embeds
> (EMRK→20220916 **pdf-a-Suffix `-2` kanonisch**, NYÜ→20260506) auf die geltende Konsolidierung; html-N je Erlass via
> `jolux:isExemplifiedBy` (klv=8/vrv=8/**ssv=14** ausserhalb Fallback -1..-5!); Artikel-Diff je Erlass **ohne Verlust**
> (+81 neue Artikel, eId-Reshuffles asylv2/svg/vil/vrv/rpv dokumentiert); 54/54 Wortlaut-Stichproben; alle Tore grün,
> golden byte-gleich; Gegenprüfung 3+1 Opus-Agents. **Bonus aus der Gegenprüfung (F2):** Extraktor-Ordinalia auf
> sexies…decies erweitert — heilt 2 STILL GEDROPPTE Absätze VSTG art_5 (1sexies/1septies) + BPV/ELG/VZAE-Labels +
> HMG/FINMA_GEBV-Marker (5 Zusatz-Erlasse, quell-verifiziert). Beleg: `bibliothek/register/fedlex-currency-2026-07-03.md`.
> **OFFEN: P1-c** (Wiedervorlage-Generator für die 56 künftigen Fassungen) **+ P1-d** (Currency-Chips/`currency.json`) —
> beide unten spezifiziert, nächste Session.

**Ziel:** Kein Erlass wird veraltet ausgeliefert, und keine Currency-Lücke bleibt strukturell unsichtbar. **Nicht-Ziel:** neue Erlasse aufnehmen (Coverage ist laut Report vollständig — 218/229 Volltext, 11 bewusste Stubs).

**Grundlage:** `bibliothek/register/fedlex-gap-report-2026-07-02.md` (bereits erhoben). Drei Befund-Klassen → drei Arbeitsschritte:

### P1-a · Die 20 stale Erlasse aktualisieren (Datenlauf)
- **14 gepinnt-überholt** (RPG, SVG, VRV, SSV, VTS, KVG, KVV, KLV, BPV, RPV, VIL, FDV, MepV, ICAO-Übk. 0.748.0): in `scripts/fedlex-cache.sh` den Konsolidierungs-Stand auf die geltende Fassung (meist `20260701`) neu pinnen, **Anker/Wortlaute neu verifizieren** (§7), dann `npm run normtext -- --datum=$(date +%F)` regenerieren.
- **6 blinde Flecken** (AsylV 1/2/3 = SR 142.311/312/314, ArGV 2 = 822.112, EMRK 0.101, NYÜ 0.277.12): dieselbe Aktualisierung; die 2 PDF-Embeds (EMRK/NYÜ) über `scripts/normtext/pdf-fetch.ts` (neuer `kons`-Wert in `src/lib/normtext/pdf-embed.ts` → `PDF_EMBED_QUELLEN`).
- **Vor** jeder Re-Extraktion: Artikel-Diff («neuere Fassung» ≠ «für uns relevante Artikel geändert»). Golden byte-gleich für unveränderte Teile; verhaltensändernde Text-Änderung ist erwartet und wird als solche gegated.

### P1-b · Monitoring-Lücke schliessen (Tor-Härtung — der eigentliche Hebel)
Der Cron `check:fedlex-versionen` sieht **nur gepinnte** ELIs (`scripts/fedlex-pins.ts` parst `fedlex-cache.sh`). **11 Volltexte ohne Pin** (AsylV 1/2/3, CO2-Gesetz, BVV 2, ArGV 1–5) sind strukturell unsichtbar.
- **Fix:** alle 11 in `fedlex-cache.sh` pinnen (Format `name|eli|YYYYMMDD|html-N|anker|sr`).
- **Zusätzliche Absicherung (empfohlen):** eine **Coverage-Assertion** im Tor — «jeder `snapshot`-Bund-Erlass mit ELI-`quelleUrl` hat einen Pin». So kann künftig kein Volltext ohne Pin durchrutschen. Das ist der dauerhafte Wächter, nicht der Einmal-Lauf.

### P1-c · 56 künftige Fassungen als Wiedervorlage (Verfallsregister)
Fedlex hat 56 future-dated Konsolidierungen im Triplestore (z. B. OR ab 2026-10-01, StGB ab 2026-10-01) — **kein Fehler, sondern Re-Extraktions-Horizont**.
- **Fix:** je Erlass das nächste In-Kraft-Datum > heute als **Verfallsregister-Eintrag** (§11 Pflegebedarf) andocken an das bestehende Drift-/Verfall-System (`scripts/verfall-*.ts`, `check:verfall`). Mehrwert = datierte Wiedervorlage statt flüchtiger Warnung.

**Betroffene Dateien:** `scripts/fedlex-cache.sh` · `scripts/fedlex-pins.ts` · `scripts/fedlex-versionen-pruefen.ts` · `src/lib/normtext/pdf-embed.ts` · `scripts/normtext/pdf-fetch.ts` · `public/normtext/bund/*.json` (regeneriert) · `public/normtext/register.json` (regeneriert) · Verfallsregister. **QS-DATA-Kopplung:** sobald der Generator-Flip (E1, `FAHRPLAN-DATENHALTUNG.md`) vollzogen ist, schreibt der Currency-Lauf in das DB-Artefakt; `public/normtext/` bleibt byte-gleiche Projektion (`check:paritaet`) — Paket 1 baut keinen zweiten Pfad.

**Tore:** bestehend `check:normtext`, `check:normtext-netz`, `check:fedlex-versionen`, `check:tabellen`, `check:invarianten`, `golden:vergleich`; **neu** die Coverage-Assertion. **Gegenprüfung (Risiko-Pfad):** adversarialer Zweitpass je re-extrahiertem Erlass gegen die Filestore-HTML-Quelle — die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust) sassen real hier.

**Aufwand grob:** P1-a ~1 Datenlauf-Session (Artikel-Diff je Erlass = Zeitfresser) · P1-b ~0,5 Session · P1-c ~0,5 Session. **Gesamt M.**

**§14-Intake:** neuer Querschnitt **`QS-CURRENCY`** im Querschnitt-Band der `ROADMAP.md` (begleitende Korpus-Pflege). Kein 26×-Bezug. **Trailer:** `Roadmap: QS-CURRENCY` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 1 — Gesetze-Currency & Coverage (QS-CURRENCY, P0)**

**Ziel.** Kein Bund-Erlass wird veraltet ausgeliefert; keine Currency-Lücke bleibt strukturell unsichtbar. Heute verletzt: 20 stale Erlasse live + **ein parser-blindes Monitoring-Loch** + 56 künftige Fassungen ohne Wiedervorlage. Moat = Verifikations-Prozess (Asset C) wird dauerhaft maschinell bewiesen. **Nicht-Ziel:** neue Erlasse (Coverage vollständig: 218/229 Volltext, 11 bewusste Stubs).

**Kritik-Korrektur (Refutation-Treffer, in Repo bestätigt): Die Prämisse „11 Volltexte OHNE Pin" ist sachlich falsch.** `asylv1/2/3`, `argv1..5`, `bvv_2`, `bvv3`, `co2_gesetz` sind **bereits in `fedlex-cache.sh` gepinnt** — aber mit Ziffern-Namen, die die Parser-Regex `([a-z_]+)` in `fedlex-pins.ts:19` **nicht matcht**. Sie *sehen überwacht aus, sind es aber nicht* — schlimmer als ungepinnt. Der Regex-Fix ist damit **kein theoretischer Hinweis, sondern die dringlichste Einzelmassnahme des ganzen Portfolios**.

**Quelle+Endpunkt.** Ausschliesslich amtlich: SPARQL `fedlex.data.admin.ch/sparqlendpoint` (Currency-Query wie `fedlex-versionen-pruefen.ts:30-35`) + Filestore-HTML via `fedlex-cache.sh`; PDF/A via `pdfaUrl()` (`src/lib/normtext/pdf-embed.ts:52-54`). Nie `droid-f/fedlex`.

**Extraktion — Bau-Reihenfolge P1-b → P1-a → P1-c → P1-d** (erst Monitoring dichtmachen, dann Datenlauf über vollständige Pin-Basis).

*P1-b · Monitoring-Lücke (der dauerhafte Hebel):*
1. **Regex-Fix ZUERST:** `fedlex-pins.ts:19` Namensgruppe `([a-z_]+)` → `([a-z0-9_]+)` (ELI-Gruppe erlaubt Ziffern bereits). **+ Selbsttest im Parser/Tor:** Anzahl geparster Pins == Anzahl `"…|…|YYYYMMDD|"`-Zeilen in `cache.sh` (verifiziert: 218 Zeilen). Unit-Test in `src/tests/`. Ohne diesen Fix läuft P1-a über eine parser-blinde Basis.
2. **11 fehlende Volltexte prüfen/pinnen:** Nach dem Regex-Fix erneut `check:fedlex-versionen` fahren — die 13+ Ziffern-Pins werden erstmals *gesehen*; verbleibende echt-ungepinnte Volltexte (falls nach Regex-Fix noch welche) via `fedlex-eli-aufloesen.ts` nachpinnen (2–4 Pflicht-Anker empirisch am HTML verifizieren, `kons` = Bautag-geltend).
3. **Coverage-Assertion (neues dauerhaftes Tor-Stück):** in `check-drift.ts` (offline-Teil `check:normtext`): jeder Register-Eintrag `ebene=='bund' && status=='snapshot'` mit Fedlex-ELI-`quelleUrl` hat einen Pin; jeder `status=='pdf-embed'` einen `PDF_EMBED_QUELLEN`-Eintrag. Rot bei jedem künftigen ungepinnten Volltext. (`nur-live-link` + Nicht-Fedlex/EU-VO ausgenommen.)
4. **PDF-Embeds ins Versions-Monitoring:** `fedlex-versionen-pruefen.ts` prüft heute nur `lesePins()` — EMRK/NYÜ strukturell blind. Additiv zweite Quelle `lesePdfEmbedPins()` aus `PDF_EMBED_QUELLEN` (`pdf-embed.ts:31`, trägt `eli`+`kons`) in die geprüfte Liste mergen; `lesePins()`-Signatur unverändert (auch vom Gegenprüfungs-Tor genutzt).

*P1-a · 20 stale Erlasse aktualisieren (Datenlauf):*
- **18 Snapshots** (14 gepinnt-überholt: RPG, RPV, SVG, VRV, SSV, VTS, KVG, KVV, KLV, BPV, VIL, FDV, MepV, ICAO-Übk 0.748.0; 4 blinde Flecken: AsylV 1/2/3, ArGV 2): je Erlass neu pinnen (frisch erhobene geltende Konsolidierung, **html-N empirisch sondieren** — OR-Falle: `n=0` UND `n=1` können echtes HTML liefern, `n=0` stale), dann regenerieren via `npm run normtext -- --datum=$(date +%F)`, gescoped auf betroffene Keys [Flag `--nur=` zu verifizieren durch Opus in `scripts/normtext-snapshot.ts`].
- **Vor jeder Re-Extraktion Artikel-Diff:** „neuere Fassung" ≠ „relevante Artikel geändert". Alte + neue HTML laden, `art_*`-Inventar + per-Artikel-Inhalt diffen; Befund als Re-Pin-Kommentar in `cache.sh` (§7-Konvention) + §11-Notiz.
- **2 PDF-Embeds** (EMRK 0.101 → geltend 2022-09-16; NYÜ 0.277.12 → geltend 2026-05-06): neuen `kons` in `PDF_EMBED_QUELLEN`, Refetch via `pdf-fetch.ts`; **Probe-Fetch vor Pin**, ob PDF/A unter neuem `kons` existiert [zu verifizieren durch Opus]; wenn nicht: Fallback dokumentieren, Status ehrlich (§8).
- Golden: unveränderte Erlasse byte-gleich; die 20 Text-Änderungen sind **deklarierte fachliche Änderung**, so committen und gaten.

*P1-c · 56 künftige Fassungen als datierte Wiedervorlage:* Andocken an Verfall-System (`scripts/verfall-parse.ts`, `check:verfall`), SSoT `bibliothek/register/parameter-verfall.md`. Neues `scripts/fedlex-wiedervorlage-generieren.ts`: fragt je Bund-Erlass die **nächste** künftige Konsolidierung > `--datum` (geteilte `sparqlBatch`-Funktion, §2) und schreibt einen **markierten Auto-Block** (`<!-- AUTO fedlex-wiedervorlage --> … <!-- /AUTO -->`) in der bestehenden 5-Spalten-Grammatik. Idempotent (Block ersetzen, nie appenden; Sortierung Datum→SR). npm `gen:fedlex-wiedervorlage` (netz). `check:verfall` liest offline mit; fällige Einträge = automatisch rot.
- **Kritik-Korrektur (Finding 16):** Diese 56 künftigen Daten sind zugleich die `gueltig_bis`-Grenzen für den späteren `erlass_fassungen`-Flip (`gueltig_bis` = Datum der nächsten Fassung). Join-Abhängigkeit im Code als E1-Flip-Notiz dokumentieren.

*P1-d · Currency als sichtbares Produkt (Moat-Hebel 3, aufgewertet):* Kein „stale"-Badge (stale darf nie deployen — das erzwingen die Tore). Stattdessen (§8-ehrlich) **zwei** Chips neben Stand-Chip + Live-Link-Chip:
- **„geltend geprüft am TT.MM.YYYY (maschinell)"** — der sichtbare Freshness-Beweis (Moat-Asset C wird Produkt, nicht Randnotiz). Datum = letzter grüner `check:fedlex-versionen`-Lauf.
- **„Fassung ab TT.MM.YYYY angekündigt"** — nur wenn künftige Konsolidierung bekannt.
- Datenfluss: derselbe P1-c-Generator schreibt Sidecar `public/normtext/currency.json` (`{erlassKey:{geprueftAm, naechsteFassungAb?}}`, nur Zukunfts-/Prüf-Daten zum Generierungsdatum → keine Datums-Logik im Client). **Beide** Leser-Instanzen (Haupt `inhalt.tsx:689-690` + Split-View-Pane `:877-879`).

**DB-Schema.** Kein neues Schema, kein DB-Layer. Regeneration über bestehenden Generator; `check:paritaet` muss grün bleiben — **aber** `currency.json` ist **neu und heute nicht im Ingest** → entweder `ingest.ts`/`check-paritaet.ts` um `typ='currency'` erweitern **oder** Allowlist-Eintrag (§1 Regel 2). Serialisierungs-Vertrag halten (§1 Regel 3). Späteres Mapping (nur einhalten, nichts bauen): Pin ≙ `erlass_fassungen`-Zeile, geltend = `gueltig_bis IS NULL`; SSoT der Pins bleibt `cache.sh` bis E1.

**UI-Andockung.** Meta-Leiste `inhalt.tsx:689/877` (beide Instanzen); optional über `meldeInhaltsKopf()` (`:240-246`) in den Shell-Kopf. `DESIGN-REGLEMENT-NORMTEXT.md` L0 (Chip nur in Meta-Leiste, nie im Wortlaut), CLAUDE.md §13 (Tokens, kein `text-red-*`), §15 (prerender-stabil / token-Mindesthöhe, CLS=0). Leerer Zustand ohne Chip, kein Fehlerzustand.

**Verifikations-Tor.** `check:fedlex-versionen` Exit 0 über cache.sh-Pins **und** PDF-Embed-Pins · Coverage-Assertion grün · Pins-Parser-Selbsttest grün · `check:normtext`/`caches`/`vollstaendigkeit`/`struktur-konsistenz`/`tabellen`/`invarianten`/`bilder` grün · `check:verfall` (56 terminiert, keiner fällig) · `check:paritaet` grün inkl. `currency.json`-Deckung · `golden:vergleich` byte-gleich ausser den 20. **Gegenprüfung (Skill `gegenpruefung`, Pflicht):** adversarialer Zweitpass je re-extrahiertem Erlass — (a) Artikel-Inventar alt/neu vollständig (kein `art_*` verloren, `bis`/`ter` intakt), (b) Tabellen-Drop/Footnote-Leak, (c) ≥3 geänderte + ≥3 unveränderte Artikel wortlaut-verglichen, (d) html-N-Wahl SPARQL-belegt, (e) 56 Wiedervorlage-Daten stichprobenweise. **Kritik-Korrektur:** Gegenprüfungs-Glob `istRisikoPfad()` um `scripts/fedlex-*` (root) erweitern — sonst triggern reine `cache.sh`/`pins.ts`-Edits das Gate nicht. Jeder Pin: SPARQL-`dateApplicability` **und** Filestore-Inhalts-Probe müssen übereinstimmen. Dann `npm run gegenpruefung:ok`.

**Risiken.** Stille Extraktions-Regression (Tabellen-Drop/Leak/bis-ter) → Artikel-Diff + adversariale Gegenprüfung + Struktur-Tore. Parser-Regex frisst Ziffern-Namen still → Fix + Selbsttest + Coverage-Assertion (dreifach). html-N-Falle → Inhalts-Probe + SPARQL. Konsolidierung trailt AS (STALE-PENDING unerkennbar via `dateApplicability`) → ehrlich dokumentierte Grenze; RSS-OC-Überwachung ist Backlog, nicht P1-Scope. Paritäts-Risiko **präzise auf Serialisierung/Top-Level-Form** fassen, nicht auf Blockform (Refutation). Parallelbau QS-DATA E1 auf gleichen Dateien → §12-Worktree.

**Definition of Done.** (1) `check:fedlex-versionen` Exit 0 über beide Pin-Quellen; 20 stale tragen Bautag-Fassung mit frischem `stand`/`fassungsToken`/`sha`/`abgerufen`. (2) Regex-Fix + Selbsttest + Coverage-Assertion grün. (3) 56 Wiedervorlage-Einträge + beide Currency-Chips (beide Leser-Instanzen), Token-konform. (4) `npm run gate` + `check:netz` grün, `check:paritaet` inkl. `currency.json`. (5) Gegenprüfung bestanden + quittiert, Re-Pin-Kommentare + §11-Ablage; Gegenprüfungs-Glob um `scripts/fedlex-*` erweitert und Rot-Auslösung positiv getestet. (6) §14-Intake `QS-CURRENCY` im Querschnitt-Band; STRUKTUR.md. **Push/Deploy nur auf Davids §9-Ja.**

**Aufwand: M** (P1-b ~0,5 · P1-a ~1 [Artikel-Diff = Zeitfresser] · P1-c ~0,5 · P1-d ~0,25 Session). **Abhängigkeiten:** blockiert von nichts, blockiert nichts; Paket 5 erbt die frischen Daten + `sparqlBatch`-Helfer.

**Betroffene Dateien:** `scripts/fedlex-cache.sh` · `scripts/fedlex-pins.ts` (Regex+Selbsttest) · `scripts/fedlex-versionen-pruefen.ts` (PDF-Embed-Merge, `sparqlBatch` extrahieren) · `scripts/normtext/check-drift.ts` (Coverage-Assertion) · `src/lib/normtext/pdf-embed.ts` · **neu** `scripts/fedlex-wiedervorlage-generieren.ts` · `bibliothek/register/parameter-verfall.md` (Auto-Block) · `public/normtext/bund/*.json` + `register.json` (regeneriert) · **neu** `public/normtext/currency.json` · `scripts/gegenpruefung/kern.ts` (Glob) · `scripts/datenhaltung/{ingest,check-paritaet}.ts` (currency-Typ/Allowlist) · `src/pages/gesetz-leser/inhalt.tsx` (:689/:877) · `package.json`.

---

## Paket 2 — Botschaften / Bundesblatt (P1, Vorzeige-Paket) ✅ (erledigt 10.7.2026 — AUSGEFÜHRT, Wortlaut: `archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`)

*Ausgelagert 15.8.2026 per Fahrplan-§-Diät (`aufraeumen.md` §4b): der volle, unveränderte Wortlaut steht in [`archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`](../archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md). Der §-Anker bleibt hier bestehen — `npm run fahrplan` und `check:plan` Regel 11 lösen weiter auf. Code: `scripts/materialien/botschaften-generieren.ts`.*

## Bridge B1 — Norm-Kontext-Bus verdrahten (Moat-Kern, nach Paket 2, vor Paket 5)

**Warum eigener Meilenstein (Moat-Kritik):** Vier Pakete addieren *konsultierbare Daten*; fast keines addiert *Verzahnungs-Kanten* — genau die sind laut ROADMAP der Burggraben. Der teuerste einzelne Moat-Gewinn liegt quer zur Paket-Struktur: **Botschaft (Genese) + Revision (Änderung) + Entscheide (Anwendung, aus dem bereits vorhandenen Zitat-Graphen `norm_kanten`/`zitat_kanten`) an EINER norm-verankerten Stelle** zusammenführen. `<KontextPanel typ="norm">` existiert und trägt schon Entscheide — er ist der Verzahnungs-Anker.

**Inhalt.** Nach Paket 2: `botschaftenFuerNorm` (und ab Paket 5 `revisionenFuerNorm`) in **denselben** Kontext-Layer routen, der Entscheide trägt — nicht als parallele Sektionen. Ergebnis auf Art. X: *warum entstanden* (Botschaft) + *was geändert* (AS) + *wie ausgelegt* (BGE aus Graph) + *Rechner* — an einer Stelle. Das kann weder Fedlex noch entscheidsuche noch ein Gratis-Verlag. **Kein neuer Datenbau** (Zitat-Graph liegt vor, DB-Brief E4) — reine UI-/Bus-Verdrahtung. **Aufwand: S–M.** Kein separater §14-Slot nötig; als Teil-DoD von Paket 2/5 führen, aber als expliziten Prüfpunkt „speist in Kontext-Bus, nicht Silo" gaten.

---

## Paket 5 — Änderungshistorie / Amtliche Sammlung (P1.5) ✅ (erledigt 10.7.2026 — AUSGEFÜHRT, Wortlaut: `archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`)

*Ausgelagert 15.8.2026 per Fahrplan-§-Diät (`aufraeumen.md` §4b): der volle, unveränderte Wortlaut steht in [`archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`](../archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md). Der §-Anker bleibt hier bestehen — `npm run fahrplan` und `check:plan` Regel 11 lösen weiter auf. Code: `scripts/normtext/revisionen-generieren.ts`.*

## Paket 3 — Vernehmlassungen (P2) ✅ (erledigt 10.7.2026 — AUSGEFÜHRT, Wortlaut: `archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`)

*Ausgelagert 15.8.2026 per Fahrplan-§-Diät (`aufraeumen.md` §4b): der volle, unveränderte Wortlaut steht in [`archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`](../archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md). Der §-Anker bleibt hier bestehen — `npm run fahrplan` und `check:plan` Regel 11 lösen weiter auf. Der Ausbau «Übersichtsseite alle laufenden Vernehmlassungen» ist NICHT Teil dieses Pakets, sondern die `W3-AUSBAU`-Zeile «Gesetzgebungs-/Rechtsetzungs-Tracking».*

## Paket 4 — Staatsverträge (P3) ✅ (erledigt 10.7.2026 — AUSGEFÜHRT, Wortlaut: `archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`)

*Ausgelagert 15.8.2026 per Fahrplan-§-Diät (`aufraeumen.md` §4b): der volle, unveränderte Wortlaut steht in [`archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md`](../archiv/FAHRPLAN-FEDLEX-PORTFOLIO-erledigt.md). Der §-Anker bleibt hier bestehen — `npm run fahrplan` und `check:plan` Regel 11 lösen weiter auf.*

## Paket 6 — Was Fedlex NICHT hergibt (ehrliche Abgrenzung)

**Rechtsprechung ist NICHT in Fedlex.** Fedlex = **nur Gesetzgebung** (Erlasse, Materialien, Verfahren, Staatsverträge). Bundesgerichts-/kantonale Entscheide kommen aus **OpenCaseLaw / bger.ch / entscheidsuche.ch** und sind bereits eigener Strang (ROADMAP **W2·6**, `FAHRPLAN-RECHTSPRECHUNG.md`, `FAHRPLAN-OPENCASELAW-QUELLEN.md`) — **hier ausserhalb des Scopes.** Ebenfalls nicht Fedlex: EU-Recht (EUR-Lex → `international-extern.ts`), kantonale Erlasse (LexWork/lexfind), Parlaments-Ratsdebatten (parlament.ch/Curia → nur Deep-Link).

---

## 5. Recht/Lizenz-Leitplanken (Do/Don't)

**DO.**
- Ausschliesslich `https://fedlex.data.admin.ch/sparqlendpoint` (POST, live) + Fedlex-Filestore-HTML für alle Pakete. `jolux:*` ist Legilux-Vokabular auf dem amtlichen CH-Endpunkt = amtlich, kein Dritt-Byte.
- Jeder Eintrag mit `quelleUrl` (http/s, Pflicht §7c), `stand`, `abgerufen`, Live-Link, §8-Status-Marker („maschinell zugeordnet, amtliche Quelle massgeblich").
- P1-Umfang strikt `nur-live-link` für Botschaften/Historie/Vernehmlassungen — kein Snapshot ohne volle §7-Zitat-Ausnahme (a)-(d). Staatsverträge = Erlasse/Snapshots (§7-Zitat-Ausnahme über `stand`/`quelleUrl`/`abgerufen`/`fassungsToken`/`sha` erfüllt).
- Vor jeder Extraktion Skill `scraping-swiss-official-sources` laden (Daueranweisung).

**DON'T.**
- **Nie `droid-f/fedlex` (CC BY-NC-SA)** oder irgendeinen Dritt-Crawl als Datenquelle — auch nicht „nur zur Beschleunigung". Kein fremdes Byte fliesst ins Produkt. (Fakten/Lücken-Liste lesen wäre erlaubt, wird hier aber nicht gebraucht — SPARQL reicht direkt.)
- Keine Machbarkeits-Annahme ungeprüft bauen (Prädikate/Füllraten/`eli/treaty`-Markup) — erst POC/Query-Probe, dann Pipeline.
- Keine UNION-Query ungeprüft für Coverage-Zählungen (~700-statt-alle-Falle) — gegen bekannte Gesamtzahl (218/229) plausibilisieren.
- Keine Text-Snapshots von Botschaften/AS/Vernehmlassungen in P1 (Zeitsperre bis 1.12.2026, §7).

---

## 6. Offene Verifikationspunkte für Opus (empirisch VOR Bau prüfen)

**P0 (blockieren Aufwand-Freigabe des jeweiligen Pakets):**
1. **Paket 2/5 Feld-Füllraten korpusweit** (nicht nur AVIG/DSG): Datum/Titel/Curia (P2) und `botschaftDate`/`historicalId`/Sprach-Kante (P5) über alle 218 messen — sonst halbe/leere Einträge trotz „belegt"-Status.
2. **Paket 2 Prädikate am Botschafts-Knoten** (Datum/Titel/Curia via `isExemplifiedBy`) + `FILTER(STRSTARTS)`-Verhalten bei Legacy-`6006`-URIs (über-/untermatch).
3. **Join-Kette P2↔P5**: dass `ocUri`/`botschaftDate` in Paket 2 gespeichert und in Paket 5 matchbar sind (sonst `botschaftKey` durchgehend NULL).

**P1 (vor Produktivsetzung):**
4. Generator-Erlass-Filter-Flag (`--nur=`?) in `scripts/normtext-snapshot.ts`.
5. PDF/A-Existenz unter neuen `kons` für EMRK (20220916)/NYÜ (20260506) per Probe-Fetch.
6. Paket 5: Sprach-Kante an `isRealizedBy`; data-URI→Portal-URL-Mapping für AS-Anzeige-Link; Abstract-Enumeration je SR (Totalrevision); Datum-Matching-Toleranz (a)↔(b) an 3 Referenzgesetzen.
7. Paket 3 Rest-POC: Voll-Lauf 218 SR (Trefferverteilung/Batch), Status-0/1 ohne `cons-open`, Institutions-Labels, ältester Eintrag.
8. parlament.ch-Deep-Link-URL-Muster (Curia-Nr. → Geschäft-URL) — sonst D1-Verstoss (Wert ohne validen Link).
9. Paket 4: `eli/treaty`-Markup je Kandidat; Triage jeder Startlisten-Position (snapshot/pdf-embed/nur-live-link).

**Bestätigt (nicht mehr offen):** Endpunkt real + Datenlieferung (COUNT=2548, OR→33, DSG-Botschaften=2, DSG-Revisionen=19 live reproduziert); Regex-Blindfleck + 13+ Ziffern-Pins (Repo-verifiziert); `ingest.ts` deckt nur Bund-Normtext; gegenpruefung-Globs-Löcher.

---

## Priorisierte Gesamt-Reihenfolge

1. **Paket 1 — Currency/Coverage** `[P0, QS-CURRENCY]` — heilt aktiven Treuedefekt, Pipeline belegt, Aufwand M.
2. **Paket 2 — Botschaften** `[P1, W2·6]` — Vorzeige-Paket, Machbarkeit belegt, hoher Neuwert, Aufwand M–L.
3. **Paket 5 — Änderungshistorie / Amtliche Sammlung** `[P1.5, W2·6-REV]` — Schwester zu Paket 2, erbt dessen Pipeline, Machbarkeit belegt (DSG live), Aufwand M–L. Komplettiert mit Paket 2 die volle Gesetzes-Geschichte.
4. **Paket 3 — Vernehmlassungen** `[P2, W3-AUSBAU]` *(vormals `W3·11`, Etiketten-Konsolidierung 15.8.2026)* — erbt Paket-2-Pipeline, Machbarkeit erst per POC, Aufwand L.
5. **Paket 4 — Staatsverträge** `[P3, W2·6/W3-AUSBAU]` *(vormals `W2·6/W3·13`, Etiketten-Konsolidierung 15.8.2026)* — kuratierte Feinarbeit, geringster Grenznutzen, Aufwand S–M.

**Querschnitt für alle:** amtliche Fedlex-Quelle only · Opus baut (Risiko-Pfad → `check:gegenpruefung` Pflicht) · §7-Verifikation · §9-Deploy nur mit Davids Ja · je Paket §14-Intake gesetzt.

---

## 7. Reihenfolge & Meilensteine (mit abnahme-tauglichen Zwischenständen)

| # | Meilenstein | Abnahme-tauglicher Zwischenstand (David kann es prüfen) | Aufwand |
|---|---|---|---|
| **M1** | **Paket 1 · P1-b** (Regex-Fix + Selbsttest + Coverage-Assertion + PDF-Embed-Monitoring) | `check:fedlex-versionen` sieht erstmals die 13+ Ziffern-Pins; kein Volltext ohne Pin mehr möglich (Tor rot bei Verstoss) | ~0,5 S |
| **M2** | **Paket 1 · P1-a/c/d** (20 stale aktualisiert, 56 Wiedervorlagen, Currency-Chips) | Kein stale Erlass live; „geltend geprüft am"-Chip sichtbar (beide Leser-Instanzen); Gap-Report-Defekt behoben | ~1,75 S |
| **M3** | **Paket 2 · Botschaften** (Entstehungsgeschichte, POC-belegt, Kontext-Bus, `ingestMaterialien`) | Auf DSG/AVIG die Botschaften *auf der Gesetzseite*; §8-Marker; Gegenprüfung quittiert | ~2,5 S |
| **M4** | **Bridge B1 · Norm-Kontext-Bus** | Botschaft + (bestehende) Entscheide im selben Panel an der Norm — der Verzahnungs-Beweis | ~0,5–1 S |
| **M5** | **Paket 5 · Änderungshistorie** (Revisionen-Timeline, Verzahnung mit M3, nicht-konsolidiert-Marker) | Auf DSG die Timeline vor+nach Totalrevision 2020; „Botschaft ansehen"-Verweis funktioniert | ~2,5 S |
| **M6** | **Paket 3 · Vernehmlassungen** (Laufend-Badge, Currency-Arbiter-Netztor) | Auf OR die 33 Verfahren + Laufend-Badge „läuft bis …"; abgelaufene nie als laufend | ~2,25 S |
| **M7** | **Paket 4 · Staatsverträge** (opportunistisch, nach B1) | ~6–10 kuratierte Verträge in gleicher Qualität; Anhänge nie stumm | ~1–1,5 S |

**Reihenfolge bindend 1 → 2 → (B1) → 5 → 3 → 4.** Jeder Meilenstein endet mit: alle Tore grün, adversariale Gegenprüfung quittiert (`gegenpruefung:ok`), Playwright-Sichtprüfung (mobil+Dark), §14-Intake gesetzt, STRUKTUR.md nachgezogen — **und wartet auf Davids §9-Ja vor Push/Deploy.** Autonom-Modus (Daueranweisung): innerhalb eines freigegebenen Pakets alles am Stück, pro Schritt Bug-Check, ohne Rückfrage — hebt das §9-Deploy-Ja nicht auf.

**Cross-Package-Invarianten (über alle Meilensteine gaten):** (a) `check:paritaet` deckt jede neue Projektionsdatei explizit (Ingest-Erweiterung ODER Allowlist — nie still-grün); (b) `check:gegenpruefung`-Globs decken jeden neuen Risiko-Pfad (`scripts/fedlex-*`, `scripts/materialien/**`, `public/materialien/*.json`) und die Rot-Auslösung ist positiv getestet; (c) Norm→Material-Index/Sidecar-Sharding statt clientseitiger Voll-Iteration über `register.json` (§15); (d) beide Leser-Instanzen (Haupt + Split-View-Pane) bei jedem neuen Abschnitt; (e) neue Schema-Elemente in FAHRPLAN-DATENHALTUNG §3 zurückgetragen (E6b-Koordination); (f) trilinguale Titel (`titel_de/fr/it`) in allen materialien-Paketen; (g) Fetch-Fehler-Zustand ≠ Leerzustand.

---

## Offene Entscheidungen für David

1. **Live-Link vs. Snapshot (Botschaften).** Empfehlung: P1 **`nur-live-link`** (kein §7-Risiko, keine Fachzeit, zeitsperre-konform); Volltext-Snapshot erst P2 → **[D]** bis 1.12.2026.
2. **Nur vorhandene Gesetze vs. alle (Botschaften).** Empfehlung: P1-Grenze «nur die 218 Volltext-Erlasse» halten.
3. **Umgang mit Pre-2000.** Empfehlung: Lücke transparent als Hinweis ausweisen (nicht stumm weglassen).
4. **Behörden-Taxonomie für den Bundesrat.** Empfehlung: gleicher Namespace mit neuem Doktyp `botschaft` + eigener «Entstehungsgeschichte»-UI-Sektion (minimaler Umbau, klare Trennung).
5. **Currency-Coverage-Assertion (Paket 1).** Empfehlung: **hart** blockieren (Exit 1), wenn ein Volltext-Erlass keinen Pin hat — genau die Blindstelle, die den Report nötig machte.

---

## Paket 7 — Watchlist & Änderungs-Signale (`W2·14-SIGNAL`, Ideen-Intake 20.7.2026)

> **ROADMAP-Schritt:** `W2·14-SIGNAL` (Welle 2). Dieser Abschnitt ist die aus der ROADMAP
> verlinkte Detailquelle (§14.1). Der Optionen-Vergleich B1/B2/Push mit Kosten und Bruchstellen
> liegt in `bibliothek/recherche/watchlist-signale-architektur.md`; hier steht die Bau-Spec.
> **Lose an `QS-CURRENCY`** — dieses Paket nutzt die Currency-Infra der Pakete 1/5, ändert sie nicht.

### 7.0 · Welches Feld das Signal WIRKLICH trägt (empirisch nachgelesen, §7)

Das ist die zentrale Korrektur zum Erst-Intake — sie entscheidet über Brauchbarkeit oder
Falschmeldungen:

| Quelle | Tatsächlicher Inhalt (Repo-Stand 20.7.2026, nachgezählt) | Taugt für |
|---|---|---|
| `public/normtext/currency.json` | 227 Erlasse, je `{geprueftAm, naechsteFassungAb?}` — z. B. `AHVG {geprueftAm: 2026-07-10, naechsteFassungAb: 2034-01-01}` | **nur VORWÄRTS** (`naechsteFassungAb`) |
| `public/normtext/<ebene>/<ERLASS>.json` → `eintraege[]` | je Artikel `stand` + `fassungsToken` + `sha` — nachgeprüft an `bund/ADOV` `art_1` (`stand 2023-01-23`, `fassungsToken 20230123`, `sha 8e02eda78a7b…`) | **RÜCKBLICK** (echtes Änderungs-Delta) |
| `public/rechtsprechung/register.json` | 6341 Einträge, je `gericht`/`gerichtstyp`/`kanton`/`datum`/`normKeys`/`fassungsToken` | Gerichts-Delta (s. 7.2) |

**`geprueftAm` ist NICHT verwendbar für «hat sich geändert».** Es ist das Datum **unseres**
Currency-Laufs: es wandert bei jedem Re-Check auch dann, wenn sich nichts geändert hat
(→ systematische Falschmeldungen), und es markiert eine echte Änderung nicht als solche.
**Der Watchlist-Vergleich läuft gegen `fassungsToken`/`sha` der Snapshots.** Wer hier
`geprueftAm` verdrahtet, hat die Funktion gebaut, die es zu vermeiden galt.

### 7.1 · B1 🟢 statischer Änderungs-Feed · B2 🟢 Client-Watchlist

**B1** — RSS/Atom/JSON, zur **Build-Zeit** aus `currency.json` (Vorwärts-Fall) + Verfallsregister
`bibliothek/register/parameter-verfall.md` erzeugt, exakt analog zum bestehenden
`gen:fedlex-wiedervorlage` (`scripts/fedlex-wiedervorlage-generieren.ts`).
**B2** — localStorage-Liste gemerkter Normen/Gerichte, beim Besuch gegen die statischen
Build-Artefakte geprüft → «seit deinem letzten Besuch geändert»-Flag; exakt das bestehende
`src/lib/zuletztVerwendet.ts`-Muster. Beide **zustandslos-konform** (CLAUDE.md §5): kein Server,
keine Identität, kein Subscription-State.

### 7.2 · Gerichts-Hälfte — eigenes Verdikt 🟡, NICHT unter dem Fedlex-🟢 mitgeführt (§8)

Die Currency-Belege dieses Fahrplans (`check:fedlex-versionen`, `check:rss-oc`,
`fedlex-wiedervorlage-generieren.ts`, `currency.json`) sind **ausnahmslos Norm-seitig** — auch
`check:rss-oc` prüft den Amtliche-Sammlung-RSS, **nicht** Gerichte. «Gericht X entscheidet neu»
trägt ein **anderer** Bestand: `public/rechtsprechung/register.json` + die Import-Strecke
`scripts/rechtsprechung/` (BS) und `scripts/normtext-entscheide.ts`.

**Verdikt 🟡 — baubar mit ehrlicher Einschränkung:** ein Build-Zeit-Delta über `register.json`
(neue Einträge je Gericht/Norm seit Datum X) ist deterministisch und billig. Es gibt aber
**keinen Live-Gerichts-Feed**: das Signal feuert erst, wenn **wir** neu importieren. Die Latenz
ist die **Import-Kadenz**, nicht die Publikationsgeschwindigkeit des Gerichts. **Das wird in der
UI offengelegt** («Stand des Entscheid-Bestands: …») — sonst suggeriert die Funktion eine
Aktualität, die der Korpus nicht trägt.

### 7.3 · 🟠 Push/E-Mail-Abo — Architektur-BRUCH, nicht in B1/B2 mischen

Ein echtes Abo verlangt Nutzeridentität, serverseitigen Subscription-State und einen Sendedienst
und verletzt damit «Werkzeuge bleiben zustandslos» (CLAUDE.md §5). **Kein Bau ohne ausdrücklichen
Architektur-Entscheid Davids** — und ausdrücklich **nicht** in den B1/B2-Bau hineinziehen, auch
nicht «vorbereitend».

### 7.4 · DoD

Feed-Generator deterministisch (2 Läufe byte-gleich) · **keine Mandats-/Personendaten in
localStorage** (§8, Berufsgeheimnis) · Rückblick-Flag nachweislich gegen `fassungsToken`/`sha`
gebildet, **nicht** gegen `geprueftAm` · Gerichts-Signal mit sichtbarem Bestands-Stand
ausgeliefert (§8-Offenlegung der Import-Latenz) · Tore grün.
Trailer `Roadmap: W2·14-SIGNAL`.

---

## §15 · ROADMAP-Spec W2·6/FEDLEX-PORTFOLIO (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «Paket 1» … «Paket 6» und «Priorisierte Gesamt-Reihenfolge» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

      Fedlex-Datenarten (Erlasse/Materialien/Verfahren/Staatsverträge u.a.), ausschliesslich amtliche Fedlex-Stelle
      (SPARQL + Filestore, nie Dritt-Repo). **Detailquelle:** `FAHRPLAN-FEDLEX-PORTFOLIO.md`.
      **Alle 5 Pakete (1 Currency · 2 Botschaften · 5 AS-Revisionen · 3 Vernehmlassungen · 4 Staats-
      verträge) ✅ AUSGEFÜHRT (Stand 10.7.2026)** — Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md`; Wortlaut →
      `ROADMAP-CHRONIK.md` → Fedlex-Portfolio (22.7.2026).

---

## §16 · ROADMAP-Spec W2·14-SIGNAL (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «Paket 7 — Watchlist & Änderungs-Signale» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut auf** vorhandener Currency-/
  Drift-Infra: `check:fedlex-versionen`, `check:rss-oc`, `scripts/fedlex-wiedervorlage-generieren.ts`,
  `register/parameter-verfall.md`, `public/normtext/currency.json`, Muster `src/lib/zuletztVerwendet.ts`.
  **Feasibility bewusst gespalten (§8) — die zwei baubaren Stufen sind NICHT das, wonach es klingt:**
  **B1 🟢 statischer Änderungs-Feed** (RSS/Atom/JSON, zur Build-Zeit aus `currency.json` + Verfallsregister
  erzeugt, analog `gen:fedlex-wiedervorlage`) · **B2 🟢 Client-Watchlist** (localStorage-Liste gemerkter
  Normen/Gerichte, beim Besuch gegen die statischen Build-Artefakte geprüft → «seit deinem letzten Besuch
  geändert»-Flag; exakt das `zuletztVerwendet`-Muster). Beide sind **zustandslos-konform** und aus dem
  Bestand baubar.
  **Welches Feld das Rückblick-Signal WIRKLICH trägt (empirisch nachgelesen, §7 — Korrektur zum
  Erst-Intake):** `public/normtext/currency.json` führt je Erlass nur `{geprueftAm, naechsteFassungAb?}`.
  `geprueftAm` ist das Datum **unseres Currency-Laufs**, kein Norm-Änderungsdatum — es wandert bei jedem
  Re-Check auch ohne jede Änderung (→ Falschmeldungen) und markiert eine echte Änderung nicht als solche.
  **Tragfähig ist es nur für den VORWÄRTS-Fall** (`naechsteFassungAb`, «ab wann kommt eine neue Fassung»).
  Das **RÜCKBLICK-Signal kommt aus den Normtext-Snapshots**: `public/normtext/**/<ERLASS>.json` führt je
  Artikel `stand` (In-Kraft-Datum) + `fassungsToken` + `sha` (§7 Build-Regel 4) — nachgeprüft an
  `bund/ADOV` Art. 1 (`stand: 2023-01-23`, `fassungsToken: 20230123`). Der Watchlist-Vergleich läuft
  darum gegen `fassungsToken`/`sha`, nicht gegen `geprueftAm`.
  **Gerichts-Hälfte — eigenes Verdikt, nicht unter dem Fedlex-🟢 mitgeführt (§8, Korrektur zum
  Erst-Intake):** die oben genannten Belege (`check:fedlex-versionen`, `check:rss-oc`,
  `fedlex-wiedervorlage-generieren.ts`, `currency.json`) sind **ausnahmslos Norm-seitig** — auch
  `check:rss-oc` prüft den Amtliche-Sammlung-RSS, nicht Gerichte. Der Bestand, der «Gericht X entscheidet
  neu» trägt, ist ein **anderer**: `public/rechtsprechung/register.json` (6341 Einträge, je Eintrag
  `gericht`/`gerichtstyp`/`kanton`/`datum`/`normKeys`/`fassungsToken`) plus die Import-Strecke
  `scripts/rechtsprechung/` (BS) und `scripts/normtext-entscheide.ts`. **Verdikt darauf: 🟡 baubar mit
  ehrlicher Einschränkung** — ein Build-Zeit-Delta über `register.json` (neue Einträge je Gericht/Norm
  seit Datum X) ist deterministisch und billig; es gibt aber **keinen Live-Gerichts-Feed**: das Signal
  feuert erst, wenn WIR neu importieren. Die Latenz ist damit die Import-Kadenz, nicht die Publikations-
  geschwindigkeit des Gerichts — **das wird in der UI offengelegt** («Stand des Entscheid-Bestands: …»),
  sonst suggeriert die Funktion eine Aktualität, die der Korpus nicht trägt.
  **🟠 Echtes Push-/E-Mail-Abo ist ein Architektur-BRUCH** — es verlangt Nutzeridentität,
  serverseitigen Subscription-State und einen Sendedienst und verletzt damit «Werkzeuge bleiben zustandslos»
  (CLAUDE.md §5): **kein Bau ohne ausdrücklichen Architektur-Entscheid Davids**, und **nicht** in den
  B1/B2-Bau mischen. Optionen-Vergleich (B1/B2/Push, mit Kosten und Bruchstellen):
  `bibliothek/recherche/watchlist-signale-architektur.md`. Currency-Fläche: `FAHRPLAN-FEDLEX-PORTFOLIO.md`;
  lose an `QS-CURRENCY`. **DoD:** Feed-Generator deterministisch (2 Läufe byte-gleich) · **keine
  Mandats-/Personendaten in localStorage** (§8, Berufsgeheimnis) · Rückblick-Flag nachweislich gegen
  `fassungsToken`/`sha` gebildet, **nicht** gegen `geprueftAm` (sonst Falschmeldungen) · Gerichts-Signal
  mit sichtbarem Bestands-Stand ausgeliefert (§8-Offenlegung der Import-Latenz) · Tore grün.
  Trailer `Roadmap: W2·14-SIGNAL`.

### Teilschritt-Spezifikation W2·14-SIGNAL (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026, Nachhalte-Konvention*
*Ausführungs-Protokoll Ziff. 6). Die ROADMAP führt je Teilschritt nur noch Checkbox,*
*`@meta` und einen Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

**Schnitt-Begründung (Session-Granularität AP-6) — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Session-Granularität (AP-6, 31.7.2026):** die Spec portioniert selbst in B1 · B2 · Gerichts-Hälfte;
  die drei Teilschritte unten folgen dieser Reihenfolge (B2 prüft gegen das Build-Artefakt aus B1, das
  Gerichts-Signal hängt sich an die Watchlist aus B2). Dieser Schritt bleibt das Dach. **Bewusst NICHT
  als Teilschritt:** das 🟠 Push-/E-Mail-Abo — Architektur-BRUCH gegen «Werkzeuge bleiben zustandslos»,
  kein Bau ohne ausdrücklichen Architektur-Entscheid Davids und **nicht** in B1/B2 hineinziehen.

**Ursprünglicher Wortlaut der Teilschritt-Bullets — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  - [ ] **14-SIGNAL-B1 · Statischer Änderungs-Feed (🟢)** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister, analog `gen:fedlex-wiedervorlage`; **nur der VORWÄRTS-Fall** (`naechsteFassungAb`). DoD: Generator deterministisch, 2 Läufe byte-gleich. Detail: diese Datei §7.1. Trailer `Roadmap: W2·14-SIGNAL` (Teil-Etikett 14.8.2026 ins Dach konsolidiert).
  - [ ] **14-SIGNAL-B2 · Client-Watchlist (🟢)** — localStorage-Liste gemerkter Normen, beim Besuch gegen die statischen Build-Artefakte geprüft (`zuletztVerwendet`-Muster). **Rückblick-Flag zwingend gegen `fassungsToken`/`sha`, nie gegen `geprueftAm`** (sonst systematische Falschmeldungen); keine Mandats-/Personendaten in localStorage (§8). Detail: diese Datei §7.0/§7.1. Trailer `Roadmap: W2·14-SIGNAL` (Teil-Etikett 14.8.2026 ins Dach konsolidiert).
  - [ ] **14-SIGNAL-GER · Gerichts-Delta mit ehrlicher Latenz (🟡)** — Build-Zeit-Delta über `register.json` (neue Einträge je Gericht/Norm seit Datum X); **eigenes Verdikt, nicht unter dem Fedlex-🟢 mitgeführt**. Es gibt keinen Live-Gerichts-Feed — die Import-Kadenz wird als «Stand des Entscheid-Bestands» sichtbar ausgeliefert (§8). Detail: diese Datei §7.2. Trailer `Roadmap: W2·14-SIGNAL` (Teil-Etikett 14.8.2026 ins Dach konsolidiert).

### Dach-Prosa W2·14-SIGNAL im Wortlaut (verschoben 31.7.2026) *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026); massgebliche Fassung.*

>   «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut ausschliesslich auf vorhandenen
>   Signalen** (Currency/Register/Wiedervorlage) — kein neuer Rechtsinhalt, keine Beratung; Speicherung
>   lokal, Werkzeuge bleiben zustandslos (Leitbild).
>   **Detail:** diese Datei §16. Trailer `Roadmap: W2·14-SIGNAL`.


---

## §17 · Kanonik-Arbiter meldet `fza`/`cmr` NICHT-KANONISCH (`QS-CURRENCY-KANON`, Befund 2.8.2026)

**Befund, reproduziert.** `npm run check:fedlex-versionen` endet mit **Exit 1**; im Abschnitt
«Kanonik-Arbiter (html-N vs. `isExemplifiedBy`)» stehen zwei Erlasse:

```
NICHT-KANONISCH  fza: gepinnt html-5, kanonisch html-9  → re-pinnen + regenerieren!
NICHT-KANONISCH  cmr: gepinnt html-3, kanonisch html-6  → re-pinnen + regenerieren!
```

Beide sind **Staatsverträge** (FZA `cc/2002/243`, Konsolidierung 2020-12-15 · CMR
`cc/1970/851_851_851`, Konsolidierung 2021-02-10). Die Versionszeile davor meldet für beide `OK`
(«gepinnt … = neueste Konsolidierung») — es geht also **nicht** um eine veraltete Fassung, sondern
um die **Alias-/Alt-Revisions-Wurzel innerhalb derselben Konsolidierung**: gepinnt ist eine andere
`html-N`-Datei als die, die Fedlex über `isExemplifiedBy` als kanonisch ausweist.

**Bestandsdefekt auf `main`, kein Feature-Nebenwirkung (§3 Verteilung statt Einzelwert).**
Nullprobe am 2.8.2026 im **unveränderten Haupt-Checkout**: derselbe Fehlschlag, Exit 1; die
betroffenen `scripts/fedlex-cache.sh`-Zeilen sind **byte-identisch zu `origin/main`**. Der Befund
gehört damit dem Bestand, nicht der laufenden Arbeit — und er ist beim Verfallsregister-Durchgang
vom 2.8.2026 nur **aufgefallen**, nicht verursacht worden.

**Was zu tun ist.**

1. **Klären, warum** die kanonische Wurzel abweicht — Staatsvertrags-Erlasse tragen bei Fedlex
   mehrere `html-N`-Ausprägungen derselben Konsolidierung (Sprach-/Ausgabe-Varianten,
   Nachpublikationen). Die Ursache gehört in die Übersichtsliste (`bibliothek/`, CLAUDE.md §11),
   nicht nur in einen Commit-Text: ohne verstandene Ursache ist ein Re-Pin ein Ratespiel, und der
   Arbiter meldet beim nächsten Lauf dasselbe.
2. **Kanonisch nachführen:** `scripts/fedlex-repin-kanonik.ts` auf beide Erlasse, danach
   Snapshots/Struktur **regenerieren**.
3. **§7-Verifikation nach dem Re-Pin:** Anker und Wortlaute der beiden Erlasse gegen die amtliche
   Fassung nachprüfen — ein Wurzel-Wechsel kann Artikel-Anker verschieben. Extraktions-/
   Generator-Fläche ⇒ **Risiko-Pfad**, `npm run check:gegenpruefung` pflichtig, golden byte-gleich
   (Änderungen an FZA/CMR sind erwartbar und müssen als **erklärter** Diff ausgewiesen werden, nicht
   als «golden angepasst»).
4. **Abschluss-Kriterium:** `npm run check:fedlex-versionen` meldet für `fza`/`cmr` keine
   Kanonik-Abweichung mehr. *Das Tor bleibt davon unabhängig rot, solange andere Pins überholt
   sind — das ist die laufende Currency-Pflege und gehört **nicht** in diesen Schritt (§14.3).*

**Abgrenzung.** Reiner Nachzug an der Kanonik-Wurzel. Keine Portfolio-Erweiterung, kein neuer
Erlass, keine Änderung am Arbiter selbst — wenn der Arbiter falsch läge, wäre das ein eigener
Befund und müsste zuerst an einem echten Fehlschlag gezeigt werden (§6.7).

*Hinweis zur Herkunft: Zu diesem Punkt hat ein Sub-Agent am 2.8.2026 einen Task-Chip angelegt.
Der Chip ist durch diesen Plan-Eintrag **ersetzt** (Vorgabe David: keine Chips) — massgeblich ist
allein dieser §.*

---

## §18 · §14-Intake 3.8.2026 (`QS-FRIT-DRIFT`, `QS-CURRENCY-TESTS`)

*Angelegt 3.8.2026 (Bauplan-QS). Beide sind reine Prüflogik ohne Snapshot-Schreiben —*
*`Gegenpruefung: n/a`. Die Ursachenklärung der Kanonik-Wurzeln bleibt `QS-CURRENCY-KANON` (§17).*

### §18.1 `QS-FRIT-DRIFT` — FR/IT-Drift-Wächter Stufe 1

- **Anlass:** sämtliche Norm-Verifikationen vom 3.8.2026 liefen **nur auf DE**. Eine
  französische oder italienische Fassung könnte längst abweichen, ohne dass ein Tor es sieht.
- **Zu bauen:** im `normen-monitor.yml` je **~30 Kern-Erlass** die **eId-Mengen** der drei
  Sprachfassungen über SPARQL abfragen und vergleichen; Abweichung ⇒ Meldung mit Erlass,
  Sprache und Differenz-Menge. Vollausbau auf alle 227 Pins ist optional und folgt der Laufzeit.
- **Ausdrücklich NICHT:** ein dreisprachiges Korpus. Dieser Schritt **vergleicht Mengen und
  meldet** — er schreibt keinen Snapshot. Das Befüllen der `fr`/`it`-Fassungen ist ein eigener
  Produktentscheid (Speicher, Pflege, §8-Ehrlichkeit) und liegt in **`W2·5g-ZEIT`**, Zeile
  «Mehrsprachiger Normvergleich» (vormals `W2·6-MEHRSPRACH`, Etiketten-Konsolidierung 15.8.2026).
- **Fertig, wenn:** eine künstlich verfälschte Mengenliste den Wächter **einmal rot** zeigt
  (§6.7) und der Grün-Fall über die 30 Kern-Erlasse reproduzierbar durchläuft.
- **Dateien:** `.github/workflows/normen-monitor.yml`, `scripts/fedlex-versionen-pruefen.ts`.

### §18.2 `QS-CURRENCY-TESTS` — Testbindung `cacheBefund` + Kanonik-Ausschluss

- **Anlass (Gegenprüfung zu PR #420, Befund 1):** die neue Cache-Inhalts-Sonde und die
  Kanonik-Ausschlussliste hängen an **keinem Test**. Ein Tor, das nicht scheitern kann, ist
  gefährlicher als keines (§6.7).
- **Zu bauen:** je einen Negativfall — (a) ein Cache-Eintrag mit falschem Inhalt muss
  `cacheBefund` rot machen; (b) ein Erlass, der fälschlich auf der Ausschlussliste steht, muss
  auffallen. Beide zuerst **rot gezeigt**, dann grün gestellt.
- **Nicht hier:** re-pinnen, regenerieren oder Anker verifizieren — das ist Risikopfad und
  liegt in `QS-CURRENCY-KANON` (§17). Dieser Schritt ändert **keinen Pin**.
- **Dateien:** `scripts/fedlex-cache.sh`, `src/tests/`.

## §19 `QS-KORPUS-SCOPE` — scope/decl-Sektionen ohne annex-Container ingestieren

*Nachzug 15.8.2026 (Etiketten-Konsolidierung BAUPLAN-UMBAU): Das Etikett `QS-KORPUS-SCOPE` ist
aufgegangen — bauender Schritt dieser Spec ist seither das Dach `QS-KORPUS` (Korpus-Pflege,
Risikopfad ⇒ Gegenprüfung), die Zeile steht dort als Checklisten-Eintrag. **Trailer also
`Roadmap: QS-KORPUS`.** Gegenstand unverändert.*

- **Anlass (Gegenprüfung zu PR #425 / `W2·5d-ANNEX`, Nebenbefund N2, 3.8.2026):** 12
  Staatsverträge (cedaw, cisg, eaue, hbewue, huvue, krk, montreal, pvue, uno_antifolter,
  uno_brk, uno_pakt_i, uno_pakt_ii) tragen amtlich zusammen **23** `scope_`/`decl_`-Sektionen
  (Geltungsbereich / CH-Erklärungen und Vorbehalte) **ausserhalb** eines `div#annex`-Containers.
  `alleAnhangAnker` beginnt am Container — diese Inhalte fehlen darum **vollständig** in
  Snapshot und Sidecar. **Vorbestand** (vor und nach #425 identisch), an CISG/KRK/UNO_PAKT_II/
  CEDAW belegt. Zum Vergleich: bei den 14 Verträgen MIT Container (LUGUE-Klasse) sind dieselben
  Sektionstypen erfasst — die Lücke ist ein Container-Artefakt, kein Inhaltsentscheid.
- **Zu bauen:** Extraktor-Erweiterung, die `scope_*`/`decl_*`-Geschwister auch ohne
  `div#annex`-Container erfasst (eigener `div#scope`-Pfad); Snapshot + Sidecar der 12 Erlasse
  regenerieren; §7-Verifikation je Erlass (Identitätstreffer gegen die ELI-Fassung).
- **Mitnahme (Nebenbefund N1, gleiche Datei):** `ANNEX_CONTAINER`-Regex in
  `extrahiere-fedlex.ts` — Literal-Capture statt case-insensitivem Capture härten
  (`getElementById` ist case-sensitiv; Korpus heute 0 Varianten, reine Robustheit).
- **Risikopfad** (Extraktion) ⇒ adversariale Gegenprüfung Pflicht; golden-Diff ist hier
  ERWARTET (neue amtliche Substanz) und wird als beabsichtigt abgenommen, Drop/Leak-Prüfung
  über den textuellen Snapshot-Diff.
- **Dateien:** `scripts/normtext/extrahiere-fedlex.ts`, `scripts/normtext/struktur-extrahiere.ts`,
  `public/normtext/bund` (nur via Generator-Lauf).

---

## §20 · ROADMAP-Spec-Nachzug (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Querschnitt-Band — AP-11 rückwirkend angewandt (ROADMAP-Diät Welle 3,
4.8.2026). In der ROADMAP bleiben je Schritt Checkbox, Titel, `@meta`, der **Anlass** (dort
ausdrücklich verlangt) und der Pointer auf den jeweiligen §; die **Bau-Spec** steht unten und in
den §§17–19. Steuert nicht — Spec-Heimat.*

### §20.1 `QS-CURRENCY-KANON` — Bau-Spec im Wortlaut *(→ Bau-Spec: §17 dieser Datei)*

> `check:fedlex-versionen` meldet im Kanonik-Arbiter beide Staatsverträge mit falscher `html-N`-Wurzel (`fza` html-5 statt html-9 · `cmr` html-3 statt html-6); die **Fassung** ist aktuell, die **Wurzel** nicht. *(Anmerkung 3.8.2026: die Kanonik-Wurzeln von acht Pins — `zgb`,`mwstg`,`bbg`,`usg`,`gwg`,`kag`,`fza`,`cmr` — sind mit PR #414 nachgeführt; dieser Schritt bleibt offen, bis die Ursache belegt und die Anker §7-verifiziert sind.)*

### §20.2 `QS-FRIT-DRIFT` — Bau-Spec im Wortlaut *(→ Bau-Spec: §18.1 dieser Datei)*

*Nachzug 15.8.2026 (Etiketten-Konsolidierung BAUPLAN-UMBAU): das im Wortlaut unten genannte
`W2·6-MEHRSPRACH` heisst seither `W2·5g-ZEIT` (Zeile «Mehrsprachiger Normvergleich»); die
Abgrenzung «hier nur Mengenvergleich, dort das Befüllen» ist unverändert.*

> im Monitor je **~30 Kern-Erlass** die eId-**Mengen** der drei Sprachfassungen vergleichen und Abweichungen melden; Vollausbau auf alle 227 optional. **Ausdrücklich KEIN dreisprachiges Korpus** — dieser Schritt vergleicht nur MENGEN und meldet; das Befüllen der `fr`/`it`-Fassungen ist **`W2·6-MEHRSPRACH`** und bleibt dort. Reine Prüflogik, kein Snapshot-Schreiben. **Fertig, wenn** der Monitor je Kern-Erlass drei eId-Mengen vergleicht und eine künstlich eingebaute Abweichung **einmal rot** zeigt (§6.7).

### §20.3 `QS-CURRENCY-TESTS` — Bau-Spec im Wortlaut *(→ Bau-Spec: §18.2 dieser Datei)*

> je einen Negativfall bauen, der die Sonde und den Ausschluss **einmal rot** zeigt, dann grün. Reine Prüflogik (`Gegenpruefung: n/a`) — **die Ursachenklärung der `fza`/`cmr`-Wurzeln ist Risikopfad und liegt in `QS-CURRENCY-KANON`**; hier wird nur die Scheiterns-Fähigkeit der Sonde gebaut, kein Pin geändert.

### §20.4 `QS-KORPUS-BMV` — Bau-Spec im Wortlaut

*Nachzug 15.8.2026 (Etiketten-Konsolidierung BAUPLAN-UMBAU): Das Etikett `QS-KORPUS-BMV` ist
aufgegangen — bauender Schritt dieser Spec ist seither das Dach `QS-KORPUS` (Korpus-Pflege,
Risikopfad ⇒ Gegenprüfung), die Zeile steht dort als Checklisten-Eintrag. Gegenstand unverändert.*

*(Kein Weiterzeiger: anders als §20.1/§20.3/§20.5 hat `QS-KORPUS-BMV` keinen eigenen
Befund-§ weiter oben — §17 behandelt ausschliesslich die `fza`/`cmr`-Kanonik. **Dieser
Abschnitt IST die Bau-Spec**; der frühere Verweis «→ §17» war ein Copy-Paste-Erbe von
§20.1 und zeigte auf einen fremden Gegenstand, Bauplan-Review 4.8.2026, Befund B1.)*

> regulärer Bundeserlass-Ingest nach Skill `korpus-werkstatt` (Pin, Snapshot, Sidecar, Register; neuer Register-Key neben dem historischen `bmv`), §7-Verifikation, Risikopfad ⇒ Gegenprüfung. Amtsbeleg: AKN `eli/cc/2025/408/20260301`, Art. 34 (Aufhebung alt) / Art. 36 (Inkrafttreten 1.3.2026).

### §20.5 `QS-KORPUS-SCOPE` — Bau-Spec im Wortlaut *(→ Bau-Spec: §19 dieser Datei)*

*Nachzug 15.8.2026 (Etiketten-Konsolidierung BAUPLAN-UMBAU): aufgegangen im Dach `QS-KORPUS` —
Trailer `Roadmap: QS-KORPUS`, Gegenstand unverändert.*

> Extraktor-Erweiterung + Regeneration der 12 Erlasse, §7-Verifikation; Mitnahme N1 (ANNEX_CONTAINER-Regex-Härtung, gleiche Datei). **Risikopfad** ⇒ Gegenprüfung; golden-Diff erwartet (neue amtliche Substanz).
