# Externe Quellen, APIs und Repos — Sichtung 3.8.2026

**Erstellt:** 3.8.2026 — Auftrag David (Chat, dreistufig): (1) «bringt dieses
Repo etwas für lexmetrik» zu `github.com/benjamin-arfa/swiss-law` und
`rnckp/awesome-open-legal-switzerland`, (2) «suche weiter … ich will am Ende
eine Liste mit möglichen Funktionen … was würde uns das Leben einfacher
machen», (3) Einschränkung: «nichts überstürzen. es soll hauptsächlich
Bestehendes unterstützen».

**Status:** ERSTRECHERCHE. Jeder hier gelistete Endpunkt wurde am 3.8.2026
selbst angefragt; der HTTP-Code steht je Zeile. **Die fachliche Bewertung und
die Verortung im Bauplan sind bewusst OFFEN** — Auftrag David: «baue es einfach
als findings ein. andere session soll es dann nochmals neu evaluieren». Hebel
für die Folge-Session: Roadmap-Schritt `QS-EXTQUELLEN`, offene Fragen in §5.

**Umfang der Suche:** rund 60 Abfragen — GitHub-Repo-Suche über Fedlex, Korpus,
Kantonsrecht, Rechtsprechung, alle Rechner-Domänen (Fristen, Verjährung,
Mietrecht, SchKG, Tarife, Gerichtskosten), Stammdaten und Infrastruktur; dazu
`ckan.opendata.swiss`, Web-Suche zu amtlichen Schnittstellen und Live-Proben an
sieben Endpunkten.

---

## 1 — Stützt Bestehendes (Kern des Auftrags)

### 1.1 Feiertage — unabhängige Zweitquelle für eine tragende Annahme

**Befund.** [`src/data/zpoFeiertage.ts`](../../src/data/zpoFeiertage.ts) trägt
weit mehr als die ZPO: `zpoFristen`, `schkgFristen`, `erbFristen`,
`bggVwvgFristen`, `allgemeineFrist` und der gesamte Fristenspiegel greifen auf
`istFeiertag`/`naechsterWerktag` zu. Grundlage ist **eine** Quelle — das
BJ-Verzeichnis nach Art. 11 des Übereinkommens vom 16.5.1972 (SR 0.221.122.3),
**Stand 1.1.2011**, dokumentiert in
[`normen/feiertage-kantone-bj.md`](../normen/feiertage-kantone-bj.md).

**Was stützt.** Zwei Dinge, ohne Codeänderung:

1. Prüfen, ob das BJ inzwischen **neu publiziert** hat. Das ist keine neue
   Regel, sondern der bereits registrierte Prüfauftrag — Verfallsregister-Zeile
   «Feiertagsverzeichnis (EJPD)» nennt genau das («bei neuer BJ-Publikation
   Matrix neu abgleichen», Nächste Prüfung: offen). **Keine neue S6-Zeile
   nötig.**
2. **[HexagonSwiss/swiss_holidays](https://github.com/HexagonSwiss/swiss_holidays)**
   (MIT, Dart, letzter Push 30.7.2026, abgerufen 3.8.2026) — kantonale *und*
   kommunale Feiertage, je Eintrag mit zitierter **kantonaler Rechtsgrundlage
   und abgerufener URL**, dazu JSON-Schema und Golden-Tests. Zitiert damit
   nicht das BJ-Sammelverzeichnis, sondern die Norm selbst — genau die
   Unabhängigkeit, die eine Gegenprobe braucht.

**Vorbehalt (entscheidend).** `data/cantons/` enthält heute **nur `ch-zh.yaml`
und `ch-ti.yaml`** plus eine Gemeinde (Zürich, BFS 261). Als 26-Kantone-
Gegenprobe **heute unbrauchbar**; Wert = zwei Stichproben und ein Datenschema.
Der Repo-eigene `GAPS.md` benennt die Lücken.

**Berührt:** `src/data/zpoFeiertage.ts` · `src/data/schkgFeiertage.ts` ·
[`normen/feiertage-kantone-bj.md`](../normen/feiertage-kantone-bj.md) ·
[`register/parameter-verfall.md`](../register/parameter-verfall.md) (Zeile
«Feiertagsverzeichnis (EJPD)»).

### 1.2 Normtext-Drift — unabhängiger Zweitbestand für ein bestehendes Tor

**Befund.** `check:fedlex-versionen`, `currency.json` und die Wiedervorlage
prüfen heute gegen **die Quelle**. Ein Ein-Quellen-Check kann nicht
unterscheiden zwischen «unser Snapshot ist aktuell» und «unser Pin ist stale,
aber konsistent stale». Ein unabhängiger Zweitbestand kann das.

| Kandidat | Umfang CH | Lizenz | Abruf 3.8.2026 |
|---|---|---|---|
| [benjamin-arfa/swiss-law](https://github.com/benjamin-arfa/swiss-law) | 9 038 Bunderlasse + 21 000+ kantonale, DE/FR/IT, Markdown + YAML-Frontmatter, ~59 600 rückdatierte Commits, wöchentlich | Pipeline MIT, Texte gemeinfrei | aktiv (Push < 3 h) |
| [legalize-dev/legalize](https://github.com/legalize-dev/legalize) ⭐266 | Rahmenwerk über 31 Jurisdiktionen; `legalize-ch` = 5 789 Bunderlasse | MIT | aktiv |
| [droid-f/fedlex](https://github.com/droid-f/fedlex) ⭐24 | **rohe Fedlex-Backend-JSON nach ELI-Pfad** — BBl ~146 000, AS ~45 000, SR ~17 000 Werke + ~50 000 Konsolidierungen, Staatsverträge, 40 Vokabulare; dazu `updates.json` (Änderungs-Zeitstempel je Datei) | **CC BY-NC-SA 4.0 — nicht kommerziell** | mehrmals täglich |

**Einordnung.** `swiss-law` läuft auf dem `legalize`-Rahmenwerk (Paket
`src/legalize_ch/`), ist für die Schweiz aber deutlich vollständiger als
`legalize-ch`. Für uns direkt verwertbar wäre der **Node/TypeScript-Client**
aus `legalize-sdks`. `droid-f` führt als einziger die **Konsolidierungs-
Metadaten**, ist damit für Pins und Wiedervorlage inhaltlich am nächsten — und
zugleich lizenzrechtlich am heikelsten (§4).

**Berührt:** `QS-CURRENCY-KANON` · `QS-CURRENCY-TESTS` · `QS-FRIT-DRIFT` ·
`W2·13-KANTONE-DRIFT` · `scripts/fedlex-versionen-pruefen.ts` ·
`scripts/fedlex-wiedervorlage-generieren.ts` · `public/normtext/currency.json`.

### 1.3 Gemeindeverzeichnis (BFS, historisiert) — macht Zuständigkeit auflösbar

**Quelle.** `https://www.agvchapp.bfs.admin.ch/api/communes/snapshot?date=DD-MM-YYYY`
— **HTTP 200**, `text/plain`, CSV, abgerufen 3.8.2026. Spalten:
`HistoricalCode, BfsCode, ValidFrom, ValidTo, Level, Parent, Name, ShortName,
Inscription, Radiation`. Amtlicher Standard **eCH-0071** (historisiertes
Gemeindeverzeichnis, V1.2.0 vom 7.8.2023), Trägerin BFS, frei.

**Warum es Bestehendes stützt.** `zustaendigkeit.ts` und
`schkgZustaendigkeit.ts` bestimmen den Ort rechtlich korrekt (Art. 46–55 SchKG
bzw. ZPO), nehmen ihn aber als freie Eingabe entgegen. Das Verzeichnis macht
daraus eine gegen ein amtliches Register **prüfbare** Angabe — und der
Stichtags-Parameter löst Gemeindefusionen bei Altfällen deterministisch auf
(§2: gleiche Eingabe + gleicher Stichtag → gleiche Ausgabe).

**Berührt:** `src/lib/zustaendigkeit.ts` · `src/lib/schkgZustaendigkeit.ts` ·
`src/lib/kantone.ts` · Vorlagen mit Ortseingabe.

### 1.4 Amtskreise je Kanton — die letzte Meile der SchKG-Zuständigkeit

**Quelle.** `ckan.opendata.swiss` `package_search` (**HTTP 200 nur mit
User-Agent-Header**; ohne → 403), abgerufen 3.8.2026:

- **BE:** «Betreibungs- und Konkursämter», «Regionalgerichte», «Regionale
  Staatsanwaltschaften», «Regionale Zwangsmassnahmengerichte» — GeoPackage
  **und Parquet** (Amt für Geoinformation)
- **ZH:** «Notariats-, Grundbuch- und Konkursamtskreise» — WFS/WMS
- SO, LU, TG: Grundbuch-/Notariatskreise in wechselnden Formaten

**Passt technisch.** Parquet wird bereits gelesen (`hyparquet` in
[`scripts/datenhaltung/masse-ingest.ts`](../../scripts/datenhaltung/masse-ingest.ts)).

**Vorbehalt.** Kantonal und lückenhaft — **es existiert kein nationales
Register** (§3). Vollabdeckung hiesse 26 Quellen pflegen, also potenziell ein
26×-Asset mit allen Folgen der Slot-Regel.

**Berührt:** `src/lib/schkgZustaendigkeit.ts` · `bibliothek/behoerden/`.

### 1.5 Rechtsprechung — Werkzeuge der Betreiber

[entscheidsuche-Organisation](https://github.com/entscheidsuche) (abgerufen
3.8.2026): `NeueScraper`, `entscheidsuche-feeder`,
`headless-scraping-subsystem`, `txt2chunk` — aktiv gepflegt (19–26 Tage). Dazu
[rnckp/entscheidsuche-client](https://github.com/rnckp/entscheidsuche-client)
(Python) als saubere Dokumentation der Endpunkte. API-Probe
`https://entscheidsuche.ch/_search.php` → **HTTP 200**.

Relevant nur bei Weiterarbeit am bestehenden Entscheid-Korpus.
**Berührt:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](../../fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md).

### 1.6 Amtliche Referenzen ohne Code-Wert

[swiss/fedlex-jolux](https://github.com/swiss/fedlex-jolux) (JOLux-Ontologie-
Dokumentation) und [swiss/fedlex-sparql](https://github.com/swiss/fedlex-sparql)
(SPARQL-Tutorial) — Repos der Bundeskanzlei. Kein übernehmbarer Code, aber die
massgebliche Referenz für `scripts/fedlex-sparql.ts`.

---

## 2 — Erweitert, statt zu stützen (geparkt, Auftrag David)

Fachlich belegt, aber jedes macht die Plattform **breiter**, nicht das
Bestehende sicherer. Hier festgehalten, damit die Recherche nicht wiederholt
wird — **nicht** als Bauvorschlag.

| Kandidat | Beleg (Abruf 3.8.2026) | Was es wäre |
|---|---|---|
| **SHAB-API** | `https://www.shab.ch/api/v1/publications?publicationStates=PUBLISHED&…` → **HTTP 200**, JSON, viersprachig, ohne Authentifizierung (**ohne** `publicationStates` → 401). `…/api/v1/rubrics` → 200, vollständiger Rubrikenbaum. Probe `rubrics=SB` lieferte SB02 «Zahlungsbefehl» / «Precetti esecutivi» | Publikationen, die Fristen auslösen: Zahlungsbefehl, Konkurseröffnung, Kollokationsplan-Auflage, Schuldenruf; über Mandanten-Rubriken auch kantonale Amtsblätter (Testamentseröffnung, Erbenaufruf, gerichtliche Vorladung). Die `legalRemedy`-Felder führen amtliche Rechtsmittelbelehrungen im Wortlaut. **Laufzeitdaten** — im Produktpfad nur als Build-Time-Snapshot analog `scripts/materialien/adapter-seco.ts` (§2) |
| **QR-Rechnung** | [schoero/swissqrbill](https://github.com/schoero/swissqrbill) ⭐241, TypeScript, Node **und** Browser, MIT | QR-Zahlteil in Vorlagen (Honorarnote, Kostenvorschuss, Mahnung). Läuft im Browser → zustandslos |
| **eSchKG-XML** | Standard des BJ, produktiv ist **allein Version 2.2.01**; ältere Versionen dürfen die Ämter zurückweisen. Schema + Handbuch publiziert ([eschkg.ch](https://www.eschkg.ch/), abgerufen 3.8.2026) | Betreibungsbegehren zusätzlich als amtskonformes XML. Reine deterministische Serialisierung. Nebenbefund: AS 2025 630 hat gerade Art. 15a/15b GebV SchKG zu eSchKG geändert |
| **PDF/A** | justitia.swiss seit März 2025 in BL im Pilot; **BEKJ in Kraft ab 1.7.2027** ([justitia40.ch](https://www.justitia40.ch/de), [SAV](https://digital.sav-fsa.ch/en/elektronischer-rechtsverkehr-justitia4.0-worum-geht-es)) | PDF-Export als PDF/A-2b statt generisch. Mit `jspdf` nicht sauber erreichbar. **Einziger Punkt dieser Liste mit einem Datum** |
| **CHLexML** | Verein [ejustice.ch](https://ejustice.ch/) führt den Standard neben Fedlex' JOLux | Nur relevant, falls Normtext je exportierbar werden soll; für die Extraktion ohne Wert |

---

## 3 — Negativbefunde (S5 — damit niemand dasselbe nochmals sucht)

1. **Keine brauchbaren Rechner-Repos.** Gesucht: `fristenrechner`, `deadline
   calculator legal`, `verjährung`, `mietrecht`, `schkg betreibung`, `anwalt
   tarif rechner`, `gerichtskosten`, `obligationenrecht`, `swiss civil
   procedure zpo`, `betreibungsamt`. Ergebnis durchweg null Treffer oder
   Studienprojekte und RAG-Chatbots. **Für die Rechen-Engines existiert weder
   eine Vorlage noch ein Zweitbestand** — die Gegenprobe bleibt der amtliche
   Wortlaut (§7).
2. **Kein maschinenlesbares nationales Gerichts- oder Behördenverzeichnis.**
   Die Bundeskanzlei verweist für den elektronischen Rechtsverkehr auf
   `ch.ch/ejustice`; die URL antwortet mit **HTTP 200, liefert aber eine
   404-Fehlerseite** (geprüft 3.8.2026, auch `/de/ejustice/`). Ein
   strukturiertes Verzeichnis ist erst mit justitia.swiss zu erwarten.
3. **Kein nationales Amtskreis-Register** — siehe §1.4, nur kantonal.
4. **Keine belegte offene ESTV-Schnittstelle** für MWST-Sätze oder
   Fremdwährungskurse. *Präzise:* der geratene Endpunkt
   `backend-rates.ezv.admin.ch/api/xmldaily` antwortete nicht (Code 000), und
   die Web-Recherche fand keine Dokumentation. Es ist damit **nicht bewiesen,
   dass keine existiert** — nur, dass sie nicht auffindbar publiziert ist.
5. **`rnckp/awesome-open-legal-switzerland`** (CC0, 15 Rubriken) ist eine
   Landkarte, kein Datenlieferant: Fedlex, LexFind, entscheidsuche, BGer und
   OpenCaseLaw sind bei uns bereits im Einsatz. Neu darin nur die 26
   Kantonsportal-URLs (Gegenprobe zu
   `scripts/normtext/kanton-discovery-quellen.ts`) und zwei Forschungs-
   datensätze (Swiss Federal Supreme Court Dataset, 127k Fälle 2007–2024, auf
   Zenodo; FSCS). Die Rubriken «Legal Commentary» und «Administrative
   Guidance» fallen unter die Art.-5-URG-Grenze (Leitbild) bzw. sind
   Sekundärquellen — bewusst nicht aufgenommen.
6. **MCP-Server** (`malkreide/*`, `bettercallclaude` u. a., teils Stunden alt)
   scheiden im Produktpfad aus (§2: kein Laufzeit-LLM, kein Mittelsmann).

---

## 4 — Lizenz- und Doktrin-Fallen

- **`droid-f/fedlex` ist CC BY-NC-SA 4.0 — nicht-kommerziell.** Eine
  Datenübernahme scheidet damit praktisch aus. Verwertbar ist allenfalls das
  **Muster** `updates.json` (Änderungs-Zeitstempel je ELI-Objekt) für eine
  eigene Wiedervorlage-Anzeige; die Daten selbst holen wir ohnehin amtlich über
  `scripts/fedlex-sparql.ts`.
- **Dritt-Korpora sind nie Quelle.** Dieselbe Leitplanke wie bei OCL
  ([PLAN-OCL-ABBAU.md](../../PLAN-OCL-ABBAU.md), Ziff. 1): «Load-bearing = nie
  über OCL zur Laufzeit», Dritt-Repo ist Seed, Diff-Orakel und Technik-Vorlage,
  **nie Mittelsmann**. §7 verlangt amtliche Quelle-URL, Live-Link und
  Drift-Erkennung *gegen die Quelle*; ein Repo dazwischen wäre eine zweite
  Wahrheit (§5).
- **PDF→Markdown-Konvertierung Dritter** (`swiss-law` für 9 Kantone) ist
  genau die Fehlerklasse, die `scripts/normtext/adapter-pdf.ts` bei uns selbst
  absichert. Als Orakel brauchbar, als Inhalt nicht.

---

## 5 — Offene Bewertungsfragen für die Folge-Session

Ausdrücklich **nicht** hier entschieden (Auftrag David: Neubewertung durch
Folge-Session, Roadmap `QS-EXTQUELLEN`):

1. Ist ein Dritt-Zweitbestand als **Diff-Orakel** doktrin-verträglich, oder ist
   er faktisch der Mittelsmann, den PLAN-OCL-ABBAU Ziff. 1 ausschliesst? Der
   Unterschied liegt darin, ob er je etwas *anzeigt* oder je etwas *liefert*.
2. Feiertage: genügt die BJ-Neupublikations-Prüfung, oder ist die im
   Verfallsregister als «offen» geführte kantonale Einzelverifikation der
   eigentliche Schritt? Die Zweitquelle deckt heute 2 von 26 Kantonen.
3. Gemeindeverzeichnis: Build-Time-Snapshot des vollen historisierten Bestands
   oder nur eine Validierungsliste des geltenden Stands? Grössen- und
   Perf-Wirkung (§15) ungeprüft.
4. Amtskreise: fällt der Vollausbau unter die **26×-Slot-Regel**? Und ist ein
   Teilausbau (BE, ZH) ehrlich darstellbar, ohne den Eindruck der
   Vollabdeckung zu erwecken (§8)?
5. **Frage an David:** wird LexMetrik kommerziell betrieben? Davon hängt ab,
   ob `droid-f/fedlex` (NC) überhaupt berührt werden darf.
