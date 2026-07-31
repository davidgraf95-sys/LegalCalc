# Fahrplan — entscheidsuche voll ausschöpfen (Teil-B-Ausbau)

**Heimat: ROADMAP-Schritte `W2·6-FILTER` und `W2·6-RNAME`.**

**Auftrag David (24.6.2026):** Den vollen Mehrwert von entscheidsuche
(`https://mcp.entscheidsuche.ch/` + darunterliegende API) für LexMetrik heben.
Dieser Plan priorisiert die noch ungenutzten Hebel und gibt je Phase konkrete
Dateien, Tore und Risiken. **Reiner Plan — nichts hier ist umgesetzt** (§9).

## §0 · Zweck

Detailquelle zu `W2·6-FILTER`/`W2·6-RNAME` — entscheidsuche.ch (MCP + Live-Suche)
für LexMetrik voll ausschöpfen. Steuert nicht; kein zweiter Einstieg (§14). Datei-
spezifisch: **reiner Plan, nichts hier ist umgesetzt** (§9) — Umsetzungsstand steht
allein in `ROADMAP.md`/`STRUKTUR.md`, nicht in diesem Dokument.

## 0. Ausgangslage (Stand 24.6.2026)

- **Genutzt:** Cross-Check serverseitig über den MCP (deckte Rubrum-Daten-Bug auf);
  **B2 Live-Volltextsuche** über `entscheidsuche.ch/_search.php` — aber nur minimal
  (`query_string` + Relevanz/Datum-Sort + erste 20 Treffer).
- **§7-Vertrag (empirisch verifiziert):**
  - MCP `/mcp`: stateless JSON-RPC, keine Auth; Tools `search`,
    `search_by_case_number`, `fetch_document`, `list_hierarchy`, `list_facets`,
    `server_info`. **Browser-untauglich** (POST mit `Origin` → 403). → Nur
    **serverseitig/Build-Zeit** nutzbar.
  - `entscheidsuche.ch/_search.php`: CORS `*`, browser-tauglich, ES-Query-DSL;
    `_source`: `date`, `title{de/fr/it}`, `abstract{de/fr/it}`, `reference[]`,
    `hierarchy[]`, `canton`, `attachment.content_url`, `id`. → **Browser-Feature.**
  - ES-Backend `entscheidsuche.pansoft.de:9200` (CORS `*`), `facets_url`
    `entscheidsuche.ch/docs/Facetten.json` (Facetten-Baum) — CORS vor Nutzung prüfen.

## 1. Leitplanken (verbindlich)

- **§2:** Live-Recherche ist **Discovery, keine Engine.** Keine deterministische
  Rechtslogik mit Live-Daten; Engines/golden bleiben unberührt.
- **§8:** Externe Treffer immer als **nicht kuratiert** markieren, amtlicher Link
  je Treffer; **opt-in** und offengelegt, dass Suchbegriffe an entscheidsuche.ch
  gehen (Berufsgeheimnis).
- **§3/§5:** reine Query-Bauer/Mapper in `src/lib/rechtsprechung/livesuche.ts`
  (SSoT), Komponenten rein darstellend; serverseitige Ingestion in `scripts/`.
- **Browser → `_search.php` · Server/Build-Zeit → MCP bzw. ES-Bulk** (MCP 403 im
  Browser ist die harte Architektur-Grenze).
- **§9:** kein Push/Deploy ohne Davids Ja. **Abnahme-Zeitsperre bis 1.12.2026**
  beachten: Ingestion mit `kuratierung:'maschinell'`, keine fachliche Abnahme nötig.

## 2. Phasen (priorisiert nach Wert ÷ Aufwand ÷ Risiko)

### P1 — Live-Suche reif machen (Browser, `_search.php`, geringes Risiko) ★ zuerst
Den grössten Sofort-Nutzen aus B2 holen.
- **Facetten-/Filter-Navigation:** Gericht/Kanton/Kammer + Sprache als Filter.
  Quelle: ES-`aggregations` via `_search.php` ODER `Facetten.json` (CORS prüfen);
  Hierarchie-IDs in die Query als `filter`-Terme. UI: schlanke Filterleiste an der
  bestehenden `LiveSuche`-Komponente.
- **Paginierung:** `from`/`search_after` + „mehr laden" (heute nur 20).
- **Sprachfilter de/fr/it** (heute keiner).
- **Treffer-Detail:** `attachment.content_url` ist verlinkt; optional Inline-Vorschau.
- Dateien: `src/lib/rechtsprechung/livesuche.ts` (Query-Bauer um Filter/Pagination
  erweitern, rein + Tests), `src/components/rechtsprechung/LiveSuche.tsx`.
- Tore: tsc/lint/Tests (reiner Query-Bauer), Playwright hell/dunkel/mobil,
  §8-Marker, kein Engine-/golden-Bezug.
- Risiko: ES-/Facetten-Vertrag instabil → defensiv mappen, ehrlicher Fehlerzustand.

### P2 — Direktzugriff per Geschäftsnummer (Browser, gering)
- `search_by_case_number`-Äquivalent über `_search.php` (Phrasen-Query): Eingabe
  „BGE 150 III 1" / „4A_123/2024" → direkt öffnen.
- Zweitnutzen: **Zitat-Verifikation** — im Reader/GesetzLeser genannte Entscheide
  gegen den Live-Bestand prüfen (Existenz/Fundstelle), §7.
- Dateien: `livesuche.ts` (+ `sucheNachAktenzeichen`), kleine UI im `/rechtsprechung`-Kopf.

### P3 — Norm↔Entscheid live (Burggraben, mittel)
- Im `GesetzLeser`/Norm-Kontext „Rechtsprechung zu Art. X — auch live im ganzen
  CH-Korpus" via `_search.php` (Query auf Normzitat). Ergänzt den lokalen
  `norm-index.json`, ohne ihn zu ersetzen.
- §8: lokal-kuratiert vs. live-extern klar getrennt darstellen.
- Dateien: `livesuche.ts` (Norm-Query), Einbindung in `GesetzLeser.tsx`/`NormText`.

### P4 — Neueste-Entscheide-Feed (Startseite, gering–mittel)
- `NewsHeader` der Startseite live-augmentieren via `sort=date` (heute offen, weil
  „verifizierter API-Vertrag" fehlte — der liegt nun vor).
- §2: nur Anzeige; §8: extern markiert, Link amtlich.
- Dateien: `src/components/start/NewsHeader.tsx`, `livesuche.ts`.

### P5 — Breiten-Ingestion künftiger Entscheide (Server/Build-Zeit, GROSS, höheres Risiko)

> **QS-DATA-Nachtrag (2.7.2026):** P5-Senke ist das DB-Artefakt (E3, `FAHRPLAN-DATENHALTUNG.md`), nicht direkt `public/rechtsprechung/`; die Such-Achse wird langfristig **selbst gehostet** (Edge-Suche E2 über die eigene DB) — P1–P4 (`_search.php`-Live-Suche) bleiben als Zweitkanal/Fallback.
- Korpus über die 265 kuratierten BGE hinaus (alle Instanzen, Kantone,
  BGer-only, fr/it). **Serverseitig** über den MCP (kein 403) bzw. ES-Bulk/
  HF-Parquet als Backfill.
- Architektur golden-schonend: eigener Baum `public/rechtsprechung/`,
  `quelle:'entscheidsuche'`, `kuratierung:'maschinell'`, Drift-Token, §7-Provenienz.
- Pipeline an bestehendes `adapter-entscheide.ts`/`entscheide-schreiben.ts` andocken;
  Dedup über Geschäftsnummer (BGE erscheint in beiden DBs).
- Tore: `check:entscheide`, Wort-Invarianten, golden byte-gleich (Gesetze unberührt).
- Risiko: Datenmenge/Qualität, Regeste-Lizenz (Graustufe Art. 5 URG), Excerpt-Last
  → klein starten, klare Kuratierungs-Achse.

### P6 — Korpusweiter Build-Zeit-Cross-Check (Server, gering, hoher Wert)
- Den MCP serverseitig als **Verifikations-Tor über den GANZEN Bestand** einsetzen
  (nicht nur 4 Repro): Regeste/Rubrum/Daten-Drift gegen entscheidsuche prüfen,
  als `check:`-Schritt. Hätte den Rubrum-Bug früher gefangen.
- Dateien: `scripts/normtext/check-entscheide-netz.ts` (neu), in `check:netz`.

## 3. Reihenfolge & Abhängigkeiten

P1 → P2 → (P4 ‖ P3) → P6 → P5. P1–P4 sind reine Browser-Display-Features (schnell,
golden-neutral, ohne Davids Fachzeit). P5 ist der grosse, separat zu entscheidende
Daten-Ausbau; P6 ist ein günstiges Qualitäts-Tor, das vor P5 stehen sollte.

## 4. Offene Verifikationspunkte (vor Bau prüfen)

- Facetten-Quelle browser-CORS (`Facetten.json` bzw. ES-`aggregations`).
- Rate-Limits/Fair-Use von `_search.php` (Debounce, Caching, „mehr laden" statt
  Auto-Feuern).
- Lizenz/Nutzungsbedingungen entscheidsuche (Open Data) für gespeicherte Inhalte (P5).

---

## 5. Entscheid-Filter über die API (`W2·6-FILTER`, §14-Intake 20.7.2026)

**Auftrag David (Queue-Plätze 2 und 3):** Richterfilter **über die API**, und Gerichtsentscheide
**allgemein** besser filterbar — ausdrücklich nicht nur BS. ULTRACODE ist für Teil b freigegeben.

### 5.1 Warum a und b EINE Einheit sind
Beide brauchen dieselbe Kette: Turso-Schema → Sync (Voll-Rebuild seit PR #313) → `api/suche`-Query →
Facetten-UI. Sie getrennt zu bauen hiesse, dieselbe Kette zweimal anzufassen (§14.2). Getrennt bleibt
dagegen die **Namens-Auflösung** (`W2·6-RNAME`, §6) — dort werden Personen *identifiziert*, hier nur
*abgefragt*; das sind verschiedene Risiko-Klassen.

### 5.2 Teil a — Richterfilter
| | |
|---|---|
| Schema | `entscheid_richter(entscheid_id, slug, rolle)` + Index auf `slug` |
| API | `api/suche` um `?richter=<slug>` |
| Datenlage | 19 467 Nennungen · 484 Personen · 100 % eindeutig (Stand #311) |
| Feasibility | 🟢 — reine Schema-/Query-Arbeit, keine neue Extraktion |

**Auflage:** `check:turso-frische` prüft Vollständigkeit gegen **Soll-Zahlen**. Eine neue Tabelle ohne
neue Soll-Zahl ist eine Tabelle, deren Ausfall niemand bemerkt — die Soll-Zahl gehört in denselben PR.

### 5.3 Teil b — allgemeine Filter, drei Klassen (§8 ehrlich getrennt)

**🟢 Billig und sofort** — durchgängig befüllt, direkt als Facette nutzbar:
`datum` · `leitcharakter` (**1259 Leitentscheide**) · `sprache` · `regesteVorhanden` · `gerichtstyp`.

**🔴 `normKeys` — NICHT als Filter versprechen.** Nur **18 % befüllt**. Ein Filter darauf liefert
«keine Treffer», wo in Wahrheit «nicht erfasst» gilt — ein **stilles Falsch-Negativ**. Das ist
strukturell derselbe Fehler wie in PR #313 (halber Index ausgeliefert, nie rot geworden). Zwei
zulässige Wege: Abdeckung vorher heben, **oder** die Lücke im UI ausweisen («Normen-Filter deckt
derzeit 18 % der Entscheide ab»). Nicht zulässig: stillschweigend filtern.

**🟠 Geschäftsnummer-Präfix → Verfahrensart — verifikationspflichtig.**
Erhoben: VD 612 · BES 494 · SB 450 · IV 429 (u. a.). Die Ableitung ist wertvoll, aber ein Filter-Label
«Verfahrensart» ist eine **Rechtsaussage**, keine String-Operation. **Vor der Auslieferung MUSS jede
Abkürzung gegen die amtliche Geschäftsordnung bzw. das amtliche Abkürzungsverzeichnis des jeweiligen
Gerichts verifiziert werden** (§7: Norm + Link + Stand). Kantonale Präfixe sind **nicht** über Kantone
hinweg übertragbar — die Verifikation ist je Gericht zu führen, nicht einmal für alle. Risikopfad ⇒
`check:gegenpruefung`, Opus.

### 5.4 Abgrenzung
Ranking und Prognose über Richter:innen bleiben gesperrt (`richter-analytik-gate`, `W3·15-RICHTER`).
Filtern, Facettieren und Verlinken sind ausdrücklich frei (Grenze bestätigt 20.7.2026).

---

## 6. Richternamen gegen den Staatskalender auflösen (`W2·6-RNAME`, §14-Intake 20.7.2026)

**Ziel:** «P. Kaderli» → «Kaderli Peter», abgeglichen gegen **Staatskalender / amtliches
Behördenverzeichnis** (§7: amtliche Quelle mit Stand).

### 6.1 Die Regel, die den Schritt definiert
**Aufgelöst wird NUR bei Eindeutigkeit.** Zwei verschiedene Personen mit gleichem Nachnamen und
gleicher Initiale werden **nie** verschmolzen; bei jeder Mehrdeutigkeit bleiben die Einträge getrennt
und gehen in einen **Kollisions-Report**.

### 6.2 Warum die Regel nicht verhandelbar ist
PR #309 ging mit **11 erfundenen Amtsträger:innen** live — «présidant» als Nachname, «Donzallaz Beusch»
als Verschmelzung zweier Bundesrichter, «Daniela»/«Ramon»/«bauer» aus Word-Zeilenumbrüchen. Gefunden
wurden sie **erst nach dem Merge**. Namens-Auflösung ist **genau die Operation, die diese Fehlerklasse
erzeugt**: sie nimmt unvollständige Information und ergänzt sie. Jede Ergänzung ohne Eindeutigkeits-
Nachweis ist eine Erfindung.

### 6.3 Auflagen (DoD)
1. Auflösung nur bei Eindeutigkeit; Mehrdeutigkeiten getrennt lassen **und ausweisen**.
2. Kollisions-Report als committetes Artefakt (§11, `bibliothek/`).
3. Phantom-Scan + Vorsitz-Kardinalität (die Tore aus #310) grün über die **volle** Grundgesamtheit
   (19 467 Nennungen) — **nicht** über eine Stichprobe. #309 fiel durch, weil nur 4 % geprüft wurden.
4. `check:gegenpruefung` bestanden: unabhängiger Opus-Pass, der die Auflösungen gegen den
   Staatskalender zu **widerlegen** versucht.
5. Staatskalender-Abruf mit Stand pinnen — Amtsträger:innen wechseln (Beispiel: der für Herbst 2026
   angekündigte Wechsel in der Advokaturprüfungskommission BS).

**Fundament zugleich für** `W3·15-RICHTER` (Analytik, gesperrt) und Davids «Kenne-deine-Prüfer»-Dossier.

---

## §7 · ROADMAP-Spec W2·6-FILTER (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «5. Entscheid-Filter über die API» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  **Gebündelt, weil beide Teile dieselbe Bau-Fläche tragen** (Turso-Schema + Sync + `api/suche` + Facetten-UI)
  und dieselbe Risiko-Klasse haben (Abfrage/Projektion, **kein** Rechtsinhalt) — §14.2. Reihenfolge folgt
  Davids Queue: **a vor b**. Vorleistung steht: Besetzung ist extrahiert und verlinkt (#309/#310/#311),
  die Sync-Architektur trägt seit #313 einen atomaren Voll-Rebuild.
  - **a · Richterfilter über die API** — Turso-Tabelle **`entscheid_richter(entscheid_id, slug, rolle)`** +
    Slug-Index, `api/suche` um **`?richter=<slug>`**. Heute existiert der Filter nur client-seitig über die
    ausgelieferten Projektionen; über die API ist er nicht abfragbar. **Feasibility 🟢** — Daten liegen vor
    (19 467 Nennungen, 484 Personen, 100 % eindeutig), es ist Schema + Sync + Query-Parameter.
  - **b · Gerichtsentscheide allgemein besser filterbar** — gilt **allgemein, nicht nur BS** (David).
    **Datenlage erhoben, drei ehrlich getrennte Klassen (§8):**
    🟢 **billig, sofort:** `datum` · `leitcharakter` (**1259 Leitentscheide**) · `sprache` ·
    `regesteVorhanden` · `gerichtstyp` — alle durchgängig befüllt.
    🔴 **teuer, NICHT als Filter versprechen:** `normKeys` ist **nur zu 18 % befüllt**. Ein Normen-Filter auf
    18 % Abdeckung erzeugt stille Falsch-Negative («keine Treffer» statt «nicht erfasst») — das ist der
    Fehler aus PR #313 in neuer Form. Entweder vorher die Abdeckung heben oder die Lücke im UI **ausweisen**;
    nicht stillschweigend filtern. **Abdeckung heben = eigener Schritt `W2·6-NKEY`** (§14-Intake 21.7.2026).
    🟠 **ableitbar, aber verifikationspflichtig:** **Geschäftsnummer-Präfix → Verfahrensart**
    (VD 612 · BES 494 · SB 450 · IV 429 …). Die Ableitung ist plausibel und wertvoll, aber sie ist eine
    **Rechtsaussage über die Verfahrensart** — sie **MUSS gegen die amtliche Geschäftsordnung/das amtliche
    Abkürzungsverzeichnis verifiziert werden**, bevor sie ein Filter-Label wird (§7 Norm+Link+Stand). Bis
    dahin nicht ausliefern. Dieser Teil ist Risikopfad ⇒ `check:gegenpruefung`, Opus.
  **Abgrenzung:** Ranking und Prognose über Richter:innen bleiben gesperrt (`richter-analytik-gate`,
  `W3·15-RICHTER`); Filtern/Facette/Verlinkung sind ausdrücklich frei. Richter im Entscheid klickbar (#24)
  ist ✅ mit #311 erledigt und hier **nicht** erneut geplant.
  **DoD:** `check:entscheide` · `check:besetzung` · `check:turso-frische` (Soll-Zahlen mitziehen!) ·
  Verifikations-Beleg für jede Verfahrensart-Abkürzung · golden byte-gleich. Trailer `Roadmap: W2·6-FILTER`.

---

## §8 · ROADMAP-Spec W2·6-RNAME (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «6. Richternamen gegen den Staatskalender auflösen» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Abgekürzte Vornamen auflösen: **«P. Kaderli» → «Kaderli Peter»**, Abgleich gegen **Staatskalender /
  amtliches Behördenverzeichnis** (§7: amtliche Quelle, mit Stand). **Bewusst NICHT mit `W2·6-FILTER`
  gebündelt (§14.2): andere Risiko-Klasse** — hier werden Personen identifiziert, dort nur abgefragt.
  **Harte Gegenrichtung, die den Schritt definiert:** zwei verschiedene Personen mit gleichem Nachnamen +
  gleicher Initiale werden **NIE verschmolzen**. Aufgelöst wird **nur bei Eindeutigkeit**; bei jeder
  Mehrdeutigkeit bleiben die Einträge **getrennt** und wandern in einen **Kollisions-Report**. Diese Regel
  ist nicht optional: #309 ging mit **11 erfundenen Amtsträger:innen** live (u. a. «Donzallaz Beusch» =
  zwei Bundesrichter verschmolzen), gefunden erst **nach** dem Merge. Eine Namens-Auflösung ist exakt die
  Operation, die diese Fehlerklasse erzeugt.
  **DoD:** Auflösung nur bei Eindeutigkeit · Kollisions-Report als Artefakt · Phantom-Scan + Vorsitz-
  Kardinalität (die Tore aus #310) grün über die **volle** Grundgesamtheit, nicht über eine Stichprobe ·
  `check:gegenpruefung` **bestanden** (Opus, unabhängig gegen den Staatskalender) · golden byte-gleich.
  **Fundament zugleich für** `W3·15-RICHTER` und Davids «Kenne-deine-Prüfer»-Dossier.
  Trailer `Roadmap: W2·6-RNAME`.
