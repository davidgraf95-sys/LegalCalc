# FAHRPLAN-FEDLEX-PORTFOLIO.md — erledigte §§ (ausgelagert per Fahrplan-§-Diät, aufraeumen.md §4b)

*Ausgelagert 15.8.2026 (BAUPLAN-UMBAU). Der Wortlaut unten ist **unverändert** aus
`fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md` übernommen — nie zusammengefasst. Im Fahrplan steht je § eine Stub-Zeile,
die den §-Anker hält und hierher zeigt.*

---

## §Paket 2 — Botschaften / Bundesblatt (P1, Vorzeige-Paket) *(ausgelagert 15.8.2026)*

## Paket 2 — Botschaften / Bundesblatt (P1, Vorzeige-Paket)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p2-botschaften`; Go David «go zu allem»; Trailer `Roadmap: W2·6`).**
> **POC live (Finding 5 erfüllt):** Reverse-Kette verifiziert, DSG→2 reproduziert (17.059+03.016); korpusweite Füllraten
> gemessen VOR dem Bau — **401 Botschaften** über die 218 Volltext-Erlasse, Datum 100 % · Titel DE/FR/IT je 100 % ·
> Curia 99,8 % · 27 Mantelerlasse · 97/218 Erlasse mit ≥1 Botschaft (Rest = Verordnungen ohne Botschaft, ehrlicher
> Leerzustand). **Performance-Härtung:** STRSTARTS (lexikalischer Präfix-Join, ~1,5 s/SR) durch die direkte Graph-Kante
> `?proj jolux:draftHasLegislativeTask ?event` ersetzt = **260× schneller** (Korpus 2,6 s), Ergebnismenge byte-gleich.
> **Determinismus-Fix:** eine Botschaft kann mehreren Projekt-Knoten zugeordnet sein (`fga/2016/467`→2 projs) → projEli/Curia
> deterministisch aus dem kleinsten proj (zwei Läufe byte-identisch).
> **Join-Felder (Finding 1, P0):** `projEli`/`ocUris`/`botschaftDate` persistiert → Paket 5 kann joinen. **i18n (Finding 10):**
> `titel_de/fr/it`. **Key (Finding 9):** `BOTSCHAFT-<jahr>-<fga-num>` (fga-intrinsisch, rebuild-fest, dedupe-korrekt — bewusste
> Abweichung vom `<KÜRZEL>`-Format, weil Kürzel bei Mantelerlassen instabil wäre; disclosed).
> **Speicher:** Botschaften NICHT im in-Bundle `MATERIAL_REGISTER` (§15), sondern build-zeitlich via `ALLE_MATERIALIEN` in die
> lazy `register.json`-Projektion gemerged (727 Materialien); `check:paritaet` deckt register.json bereits (byte-Roundtrip),
> `daten-manifest.json` nachgezogen. **Bridge B1 (Moat-Hebel 1):** «Entstehungsgeschichte»-Gruppe IM bestehenden `KontextPanel`
> (Norm-Kontext-Bus, alle 3 Instanzen), kein Silo — Genese neben Anwendung/Auslegung/Werkzeug an einer Stelle. Locale-Titel
> (Finding 10), fedlexLokalisiert-Link, Curia→parlament.ch (AffairId live verifiziert), Fetch-Fehler≠leer (Finding 15).
> **Neu/erweitert:** `scripts/materialien/botschaften-generieren(.ts/-run.ts)`, `check-botschaften-netz.ts`,
> `src/lib/materialien/{botschaften.generated.ts,botschaften.ts,typen.ts,register.ts}` (BehoerdeId `BR`, DoktypId `botschaft`),
> `material-manifest.ts`/`check-materialien.ts` (Botschaften kuratiert-äquivalent + Join-Feld-Integrität), `KontextPanel.tsx`,
> 2 Test-Dateien. **Tore grün:** tsc · lint (0 Fehler) · vitest (223 Dateien / 3636+14) · build (727 Material-Seiten) ·
> check:materialien · check:botschaften-netz (DSG→2) · check:paritaet · check:datenhaltung. Gegenprüfung-Glob deckt
> `scripts/materialien/**` + `public/materialien/*.json` bereits (Rot-Auslösung verifiziert). **Gegenprüfung bestanden**
> (unabhängiger Opus-Adversarial gegen Fedlex-SPARQL/fedlex/parlament). Beleg: `bibliothek/materialien/botschaften-2026-07-10.md`.
> **OFFEN (Nicht-Ziel P1):** kein Text-Snapshot (P2, geparkt bis nach 1.12.2026); Pre-2000 nur Live-Link.

### Ziel & Nicht-Ziel
**Ziel:** Auf jeder Bund-Gesetzesseite ein Abschnitt **«Entstehungsgeschichte»** mit den zugehörigen Botschaften des Bundesrats — Datum, Titel, Fedlex-Volltext-Link, Parlaments-/Curia-Nummer (→ parlament.ch). Kernwert = **automatische Verknüpfung Gesetz→Botschaft** über den Gesetzgebungs-Projekt-Graphen (kein Anbieter verzahnt Norm + Gesetzesgeschichte + Rechner an einer Stelle).

**Nicht-Ziel (P1):** kein eigener Text-Snapshot (Live-Link genügt); keine Botschaften zu Gesetzen ohne eigenen Volltext; keine Pre-2000-Botschaften (gescannte PDFs ohne Projekt-Link); keine Ratsdebatten (nur Deep-Link).

### P1-Umfang (scharf)
Nur Botschaften zu den **Bund-Erlassen mit Volltext-Snapshot** (`register.json`, `ebene==bund`, `status=='snapshot'` — 218 Erlasse, alle mit `sr`). Status **`nur-live-link`** (kein gehosteter Inhalt → kein §7-Extraktionsrisiko, keine Davids-Fachzeit → zeitsperre-konform). `normKeys` **automatisch** aus dem Taxonomie-Join.

### Phasen
- **P1 — Live-Link + Auto-Verknüpfung** (dieser Umfang): Pipeline + Register-Erweiterung + «Entstehungsgeschichte»-Abschnitt.
- **P2 (optional, später)** — Volltext-Snapshot einzelner Schlüssel-Botschaften: nur mit voller §7-Zitat-Ausnahme (a–d). Botschafts-HTML nutzt **dieselben CSS-Klassen** wie Fedlex-Gesetze → `scripts/normtext/extrahiere-fedlex.ts` wiederverwendbar. Braucht Davids Abnahme → **[D]**, geparkt bis nach 1.12.2026.
- **P3 (optional)** — UI-Ausbau: Filter nach Botschaftstyp, Curia-Verlauf, Zeitstrahl.

### Datenpipeline (konkret)
**Neues Skript:** `scripts/materialien/botschaften-generieren.ts` (Muster: `scripts/normtext/bund-stubs-generieren.ts`). Ausgabe: `src/lib/materialien/botschaften.generated.ts` (analog `bund-stubs.generated.ts`), gemerged ins `MATERIAL_REGISTER`. Nie von Hand editieren.

**Idempotenter Ablauf** `fetch → store-raw → parse → load`:
1. **Reverse-Query je Volltext-SR** (getestet):
   ```
   ?tax skos:notation "235.1"^^<.../notation-type/id-systematique>   # SR → Taxonomie (TYPISIERT! sonst Timeout)
   ?oc  jolux:classifiedByTaxonomyEntry ?tax ; jolux:legalResourceFamilyType <.../resource-family/oc>
   ?proj jolux:hasResultingLegalResource ?oc
   ?event jolux:legislativeTaskHasResultingLegalResource ?botschaft
   FILTER(STRSTARTS(STR(?event), STR(?proj)))
   ?botschaft jolux:typeDocument <.../resource-type/23>              # "Botschaft des Bundesrates"
   ```
   Kette geht **zwingend über `eli/oc`** (nicht `eli/cc`); `impactFromLegalResource` war Sackgasse. Batchen wie `fedlex-versionen-pruefen.ts` (VALUES-Liste), `--datum` aus Shell (§2, kein `Date.now`).
2. **Je Botschaft:** Datum, Titel, Curia-/Geschäftsnummer, Datei-URL via `jolux:isExemplifiedBy` (PDF/HTML/XML/DOCX; DE/FR/IT). Für P1 die HTML- oder PDF-Fedlex-URL als `quelleUrl`.
3. **store-raw:** SPARQL-Rohantwort je SR nach `bibliothek/materialien/botschaften-raw/<SR>.json` (Reproduzierbarkeit §11).
4. **load:** generierte Einträge deterministisch in `botschaften.generated.ts`.

**Feld-Mapping auf `MaterialRegistereintrag`:**
- `key` — stabil + URL-sicher, z. B. `BOTSCHAFT-DSG-17059` (Fallback ohne Curia: Datum). Muss `KEY_UNSICHER`-Regex bestehen.
- `behoerde` — **neuer `BehoerdeId` `'BR'`** (Bundesrat) in `typen.ts` + `BEHOERDEN` in `register.ts`.
- `doktyp` — **neuer `DoktypId` `'botschaft'`** (label «Botschaft») in `typen.ts` + `DOKTYPEN`.
- `titel` — amtlicher Botschafts-Titel aus SPARQL.
- `nummer` — Curia-/Geschäftsnummer (z. B. «17.059»); `null` wenn keine.
- `rechtsgebiet` — **geerbt vom verknüpften Erlass** (`ERLASS_REGISTER[normKey].rechtsgebiet`), nicht geraten (§2).
- `sprache` — `'de'`; FR/IT im `hinweis`.
- `status` — `'nur-live-link'` (P1-Zwang).
- `quelleUrl` — Fedlex-Botschafts-URL (HTML/PDF); Pflicht http(s), §7c.
- `stand` — Botschafts-Datum (ISO); Tor prüft «nicht in Zukunft».
- `rang` — Datum absteigend → jüngste Botschaft zuerst.
- `normKeys` — **automatisch** = Erlass-Keys, deren SR-Join diese Botschaft ergab (Mantelerlasse unter **jedem** betroffenen SR — Feature).
- `hinweis` — Provenienz/Ehrlichkeit («Automatisch über den Fedlex-Projekt-Graphen zugeordnet; maschinell, fachlich nicht geprüft.»).
- `sha` — `shaEintrag()`-Muster über die Identitätsfelder inkl. `normKeys` = Drift-/Currency-Token.

**`-N.pdf`-Mehrteiler:** für P1 (Live-Link) HTML-Fassung oder Sammel-PDF als `quelleUrl`, Mehrteiligkeit im `hinweis`.

### Betroffene Dateien
- **neu:** `scripts/materialien/botschaften-generieren.ts` · `src/lib/materialien/botschaften.generated.ts` · `bibliothek/materialien/botschaften-raw/*.json` · `bibliothek/materialien/botschaften-<datum>.md` (§11 + INDEX).
- **erweitert:** `src/lib/materialien/typen.ts` · `src/lib/materialien/register.ts` · `package.json` (Script `materialien:botschaften`) · `public/materialien/register.json` (regeneriert).
- **UI:** «Entstehungsgeschichte»-Abschnitt.

### UI / Design (§13)
**Andockpunkt:** `src/pages/gesetz-leser/inhalt.tsx` rendert bereits `<KontextPanel typ="norm" …/>` am Leseende (Z. 706/1041). **Empfohlen (A):** eigener Abschnitt **«Entstehungsgeschichte»** neben dem KontextPanel — semantisch getrennt von «Materialien, die auslegen» (Botschaften = Genese, nicht Auslegung); Auflösung `botschaftenFuerNorm(key)` (Filter `doktyp==='botschaft'`), Reihenfolge Datum absteigend. Alternative (B): weitere Gruppe im `KontextPanel` (billiger, aber vermischt Genese/Auslegung). Tokens statt Magic-Numbers (§13.1), Lesespalte `max-w-reading` (§13.2), Status-Marker «maschinell zugeordnet / amtliche Quelle massgeblich» (§8). DE-Link in P1; FR/IT im Hinweis.

### Verifikations-Tore & Gegenprüfung
- **Bestehend:** `check:materialien` prüft mit — key-Eindeutigkeit/URL-Sicherheit, `quelleUrl` http(s), `stand` ISO & nicht-zukünftig, `normKeys` ⊆ `ERLASS_REGISTER`, committetes `register.json` == frischer Build, P1-Status-Zwang.
- **Neu:** Botschaften-Netz-Tor (Reverse-Join-Drift, analog `check:fedlex-versionen`); Test für `botschaftenFuerNorm` (nur `botschaft`, Datum-absteigend). Ggf. Gegenprüfungs-Globs (`scripts/gegenpruefung/kern.ts`) um `scripts/materialien/**` + `public/materialien/*.json` erweitern.
- **Adversariale Gegenprüfung (Pflicht, §14/QS-GP):** unabhängiger Opus-Agent, Auftrag **widerlegen** — (a) gehört die Botschaft wirklich zum Gesetz? (Stichprobe ≥15 stratifiziert, gegen fedlex.admin.ch/parlament.ch); (b) falsch-positive Sammelerlasse; (c) Vollständigkeit an Referenzfällen (AVIG→11 1999–2023, DSG→17.059+2003); (d) Pre-2000-Ehrlichkeit (kein stummes «keine»). Dann `npm run gegenpruefung:ok`.

### Grenzen (ehrlich)
Automatische Zuordnung nur **~2000+**; ~6800 Botschaften total (P1 nur die zu 218 Volltext-Erlassen); frische Erlasse evtl. noch ohne Verknüpfung (Hinweis, nicht «keine»); Sammelerlasse unter jedem betroffenen SR (kennzeichnen).

**Aufwand grob:** Pipeline+Generator ~1 Session · Register/Typen + UI ~1 Session · Gegenprüfung + Tore ~0,5 Session. **Gesamt M–L.**

**§14-Intake:** ROADMAP-Schritt **W2·6** («Konsultieren-Klingen»), Unterpunkt «Entstehungsgeschichte / Botschaften», Detailquelle = dieser FAHRPLAN (bzw. ausgekoppelt `FAHRPLAN-MATERIALIEN-BOTSCHAFTEN.md`, verlinkt aus W2·6, damit **QS-PH** nicht rot). Kein 26×, kein Worktree. **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 2 — Botschaften / Projekt-Graph (W2·6, P1, Moat-Kern)**

**Ziel.** Je Bund-Gesetzesseite die zugehörigen **Botschaften des Bundesrats** (Datum, amtlicher Titel, Curia-/Geschäftsnummer, Fedlex-Live-Link), **automatisch** über den Projekt-Graphen verknüpft. Fundament für Paket 5 (Verzahnung) und Paket 3 (Generalisierung). **Nicht-Ziel (P1):** kein Text-Snapshot (`nur-live-link`, zeitsperre-konform); keine Botschaften zu Erlassen ohne Volltext; keine Pre-2000 (nur PDF-Scans ohne Projekt-Link — Lücke transparent); keine Ratsdebatten.

**Quelle+Endpunkt.** SPARQL, getestete Reverse-Kette (belegt AVIG→11, DSG→2; DSG=2 in Refutation live reproduziert):
```sparql
?tax skos:notation "235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .  # TYPISIERT
?oc  jolux:classifiedByTaxonomyEntry ?tax ;
     jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> .
?proj  jolux:hasResultingLegalResource ?oc .
?event jolux:legislativeTaskHasResultingLegalResource ?botschaft .
FILTER(STRSTARTS(STR(?event), STR(?proj)))
?botschaft jolux:typeDocument <https://fedlex.data.admin.ch/vocabulary/resource-type/23> .  # Botschaft des Bundesrates
```
Je Botschaft: Datum, Titel, Curia-/Geschäftsnummer, Datei-URLs via `jolux:isExemplifiedBy` (PDF/HTML/XML/DOCX; DE/FR/IT). **Kette zwingend über `eli/oc`, nicht `eli/cc`;** `impactFromLegalResource` ist belegte Sackgasse.

**Kritik-Korrekturen eingearbeitet:**
- **POC VOR Pipeline (Finding 5):** Die Prädikate für Datum/Titel/Curia-Nr. am Botschafts-Knoten sind unverifiziert und **sind der Inhalt jedes Eintrags**. `FILTER(STRSTARTS)` ist lexikalischer Präfix-Join — bei Legacy-URI-Schemata (Paket 3 belegt `6006`-Kodierung für Altjahre) kann er über-/untermatchen. **Opus misst korpusweit die Feld-Füllrate** (Datum/Titel/Curia über alle 218), nicht nur AVIG/DSG-Anekdoten, **bevor** der M–L-Aufwand freigegeben wird.
- **Artikel-Anker mitführen (Moat-Hebel 2):** Zusätzlich zu `normKeys` (Erlass) das Feld `artAnker?: string[]` (grobe `art_*`-Zuordnung, wo aus dem Graphen ableitbar) mitführen — nicht auf Erlass-Ebene zementieren. Auch leer zulässig; das Feld existiert, damit artikelweise Genese inkrementell wachsen kann (W3·10).
- **Join-Felder für Paket 5 persistieren (Finding 1, P0):** Paket 5 will `botschaft_key` über `?proj`/`botschaftDate` matchen — aber der Botschafts-Key `BOTSCHAFT-<KÜRZEL>-<CURIA>` enthält keins davon. **Paket 2 MUSS `projEli`/`ocUri` UND `botschaftDate` als Felder speichern**, sonst degradiert Paket 5 zwangsweise auf `botschaftKey=NULL` — die beworbene Verzahnung existiert dann nicht.
- **Trilingual (Finding 10):** `titel_de/fr/it` speichern (nicht nur DE + „FR/IT im Hinweis") — sonst bekommt der FR/IT-Leser deutschsprachige Abschnittsinhalte, Bruch der i18n-Zusage.

**Extraktion.** Neues `scripts/materialien/botschaften-generieren.ts` (Muster `bund-stubs-generieren.ts` + `sparqlBatch`). npm `materialien:botschaften`. Ablauf idempotent `fetch → store-raw (`bibliothek/materialien/botschaften-raw/<SR>.json`) → parse (deterministisch, Sortierung Datum absteigend, tie-break key) → load (`src/lib/materialien/botschaften.generated.ts`, „generiert, nie von Hand" → `MATERIAL_REGISTER` → `npm run materialien` regeneriert `public/materialien/register.json`)`. §11-Recherche-Ablage + INDEX. Extraktion/Writer getrennt (§1 Regel 5).

**DB-Schema.** `MaterialRegistereintrag` (`src/lib/materialien/typen.ts`) additiv:

| Feld | Wert |
|---|---|
| `key` | `BOTSCHAFT-<KÜRZEL>-<CURIA ohne Punkt>` (z.B. `BOTSCHAFT-DSG-17059`); Fallback Datum. `KEY_UNSICHER`-fest. |
| `behoerde` | neuer `BehoerdeId 'BR'` (Bundesrat) in `typen.ts` + `BEHOERDEN` |
| `doktyp` | neuer `DoktypId 'botschaft'` in `typen.ts` + `DOKTYPEN` |
| `titel_de/fr/it` | amtliche Titel je Sprache (nie umformulieren, §1) |
| `nummer` | Curia-/Geschäftsnummer; fehlt → weglassen |
| `rechtsgebiet` | **geerbt** aus `ERLASS_REGISTER[normKey]` (nicht raten, §2); bei mehreren normKeys primärer SR, Regel dokumentiert |
| `status` | `'nur-live-link'` (P1-Zwang) |
| `quelleUrl` | Fedlex-Botschafts-URL (HTML bevorzugt, sonst Sammel-PDF); Pflicht http(s) §7c |
| `stand` | Botschafts-Datum ISO (Tor: nicht in Zukunft) |
| `normKeys` | automatisch aus SR-Join (Mantelerlass → mehrere) |
| `artAnker?` | grobe `art_*`-Zuordnung (Moat-Hebel 2) |
| `projEli` / `ocUri` / `botschaftDate` | **für Paket-5-Join** (Finding 1) |
| `hinweis` | „Automatisch über den Fedlex-Projekt-Graphen zugeordnet; maschinell, fachlich nicht geprüft." + Mehrteiler |
| `sha` | `shaEintrag()` über Identitätsfelder **inkl. `normKeys`** (Drift-Token) |

**DB-Andockung ist BAU-SCHRITT, nicht „deckt automatisch" (Refutation-Treffer 2):** `ingest.ts` liest heute nur `normtext-bund`; Materialien sind **nicht** im Roundtrip. Also **explizit bauen:** `ingest.ts` um `ingestMaterialien()` erweitern (`public/materialien/register.json` als `datei(typ='materialien')` + je `BrowseMaterial` eine `eintrag`-Zeile, `id=key`, `blob`=Eintrags-Struktur, Reihenfolge=Manifest); `check-paritaet.ts` deckt `typ='materialien'` mit (Roundtrip byte-gleich). Serialisierungs-Vertrag (§1 Regel 3). **Nicht** die volle `materialien(…)`-Zieltabelle vorbauen (kommt mit E6b) — Blob-Roundtrip genügt, damit E1 nur den Schreibpfad umhängt. Vor E1 bleibt `botschaften.generated.ts` → `register.json` die Wahrheit.

**UI-Andockung — Moat-Hebel 1 (Norm-Kontext-Bus statt Silo):** Botschaften **nicht** als isolierte Parallel-Sektion, sondern in **denselben Norm-Kontext-Layer** einspeisen, der schon Entscheide an der Norm aufflächt (`<KontextPanel typ="norm">`). Lese-Brücke `botschaftenFuerNorm(key)` (Filter `doktyp==='botschaft'` über `normKeys`, Datum absteigend) routet in den Kontext-Bus. Sichtbar als Abschnitt **„Entstehungsgeschichte"** (semantisch: Botschaft = Genese, Entscheide = Anwendung) — im selben Panel, das Vergangenheit/Anwendung bündelt. Je Eintrag: Datum · Titel (UI-Sprache, Fallback DE) · Curia-Nr. (Deep-Link parlament.ch, extern gekennzeichnet — **URL-Muster [zu verifizieren durch Opus]**, Finding 18) · Fedlex-Live-Link.

- **Kritik-Korrekturen:**
  - **Leerzustand-Taxonomie (Finding 13):** vier unterscheidbare Ursachen — (a) pre-2000, (b) **Pa.Iv.-Ursprung ohne Botschaft**, (c) Fedlex-Verknüpfung noch nicht vorhanden (frischer Erlass), (d) echt keine. Nicht zu einem Text konflatieren; §8 verlangt konkrete Ursache.
  - **Fetch-Fehler ≠ Leer (Finding 15):** expliziter Fehlerzustand bei 404/500/offline, nie stilles „keine Daten".
  - **Beide Leser-Instanzen (Finding 12):** Haupt `inhalt.tsx:706` **und** Split-View-Pane `:1041` (Kopf `:689/878`) — bekanntes Vergessens-Muster.
  - **§15-Widerspruch auflösen (Finding 2):** `KontextPanel` fetcht `register.json` clientseitig → **nicht** Ctrl+F-prerendert. Entscheidung für dieses Paket: die §15-„voller Inhalt im DOM"-Zusage für diese Sektion **explizit als clientseitig-nachgeladen markieren** (nicht beides gleichzeitig behaupten); CLS über token-Mindesthöhe. (Build-seitiges Einbetten wäre die Alternative, wird aber wegen Bundle-Kosten hier nicht gewählt — Entscheid dokumentieren.)
  - **Payload/§15-Regression (Finding 11):** `register.json` wird clientseitig gefiltert; +200 Botschaften erhöhen die Last auf **jeder** Gesetzseite. Ab diesem Paket **Norm→Material-Index** (`public/materialien/norm-index.json`: `{erlassKey: [materialKey]}`) einführen, damit `botschaftenFuerNorm` nicht über die volle Liste iteriert. Konsistent mit Paket-5-Sharding.
  - Design: L0/§1 (Wortlaut unantastbar), §13 (Tokens), §8-Marker sichtbar; Materialien-Browse-Rubrik zeigt Doktyp „Botschaft" automatisch — Doktyp-Filter prüfen, damit 200+ Einträge die Übersicht nicht fluten.

**Verifikations-Tor.** `check:materialien` (erweitert: key-Eindeutigkeit/URL-Sicherheit, `quelleUrl` http(s), `stand` ISO+nicht-zukünftig, `normKeys ⊆ ERLASS_REGISTER`, committet==Build; **+ P1-Status-Zwang** `botschaft ⇒ nur-live-link`; **+ Coverage-Richtung `normKeys ⊇`**, Finding 8: bekannte Multi-Gesetz-Botschaft muss unter **allen** ihren Gesetzen erscheinen — Referenzfall-Assertion). `check:paritaet` deckt `register.json` (nach Ingest-Bau). **Neu `check:botschaften-netz`** (in `check:netz`): Stichproben-Reverse-Query, Treffermenge/shas vs. committet, Drift=rot (Exit 2 Netzfehler). Unit-Test `botschaftenFuerNorm` (nur doktyp, Datum absteigend, Mantelerlass unter 2 normKeys). **Gegenprüfungs-Glob:** `istRisikoPfad()` um `scripts/materialien/**` + `public/materialien/*.json` erweitern **und Rot-Auslösung positiv testen** (sonst No-Op, Refutation). Adversariale Gegenprüfung (≥15 stratifiziert, gegen fedlex.admin.ch/parlament.ch; Referenzfälle AVIG→11, DSG→17.059+2003; Pre-2000-Ehrlichkeit) → `gegenpruefung:ok`.

**Risiken.** Falsch-Zuordnung (Graph-Join) → typisierte Notation + `resource-type/23` + STRSTARTS-Filter + Stichprobe + §8-Marker. Unbelegte Prädikate → POC vor Bau. Unvollständigkeit (~2000/6800; Pre-2000 fehlt) → P1-Grenze, Lücke benannt. Rebuild-Key-Stabilität (Finding 9): ändert sich das Botschafts-Key-Schema, brechen Paket-5-`botschaft_key` still → Cross-Package-Key-Stabilitätstest nach Regeneration. Materialien-Übersicht geflutet → Doktyp-Trennung.

**DoD.** POC dokumentiert (Prädikate + Füllraten belegt, AVIG=11/DSG=2 reproduziert) · Generator idempotent + raw + §11 · `typen.ts`/`register.ts` erweitert (`BR`/`botschaft`) · `botschaften.generated.ts` + `register.json` committet · **`ingestMaterialien()` gebaut + `check:paritaet` deckt `register.json` (Roundtrip grün, positiv getestet)** · UI im Kontext-Bus (beide Instanzen), §8-Marker + Leerzustand-Taxonomie + Fehlerzustand · norm-index.json · alle Tore grün inkl. erweiterter `check:materialien`, `check:botschaften-netz`, Unit-Test · **Gegenprüfungs-Glob erweitert + Rot-Auslösung positiv getestet** · adversariale Gegenprüfung → `gegenpruefung:ok` · Schema-Rückkopplung in FAHRPLAN-DATENHALTUNG (`materialien`-Felder `projEli/ocUri/botschaftDate/artAnker`) · §14-Intake W2·6 · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M–L** (~2,5 Sessions: Pipeline+Generator+POC ~1 · Typen/Register+Kontext-Bus-UI ~1 · Ingest+Tore+Gegenprüfung ~0,5). **Abhängigkeiten:** nach Paket 1 empfohlen, technisch unabhängig. **Paket 5 hängt an diesem Paket** (`dep: [W2·6-BOT]`, erbt Pipeline + `botschaftDate`/`ocUri`-Join). E0 liegt vor; E1 ändert nur Schreibpfad.

---

---

## §Paket 5 — Änderungshistorie / Amtliche Sammlung (P1.5) *(ausgelagert 15.8.2026)*

## Paket 5 — Änderungshistorie / Amtliche Sammlung (P1.5)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p5-historie`; Go David «go zu allem»; Trailer `Roadmap: W2·6`).**
> **Füllraten-POC (Finding 6, VOR Aufwand-Freigabe korpusweit erhoben):** Pfad (b) live an DSG + 218 Erlassen —
> **3108 Änderungs-Erlasse** über alle 218 Volltext-Erlasse (Erlasse mit ≥1 Änderung 218/218), dateDocument 100 % ·
> Titel DE·FR·IT je 100 % · roFundstelle 100 %. **POC-Korrektur:** die Spec-OPTIONALs `jolux:historicalId`/`botschaftDate`
> liefern am oc-Knoten NICHTS (0/7 DSG, korpusweit leer) → RO/AS-Fundstelle deterministisch aus der oc-URI abgeleitet
> («AS <jahr> <num>», gegen `sequenceInTheYearOfPublication`+`publicationDate` gegengeprüft; Gegenprüfung bestätigte
> == `jolux:historicalId` «RO 1993 1945»), Botschafts-Join über die von Paket 2 persistierten `ocUris` (477 Joins).
> **Determinismus:** zwei Live-Läufe byte-identisch; Tor `check:revisionen` baut Sidecar aus store-raw neu == committet.
> **Sammelerlass-Cross-Check (§8):** Pfad-(a)-Geltungsstände des gepinnten cc-Abstracts ohne (b)-Erlass ab 2000 →
> 1942 «sammelerlass-marker» (nie stille Lücke). **nichtKonsolidiert-Marker (Finding 4):** 93 Einträge
> `dateEntryInForce > Korpus-Stand` (in Kraft, noch nicht konsolidiert — löst den «geändert-am-X-neben-Vor-Fassung»-Widerspruch).
> **DSG-Referenzfall:** Timeline spannt die Totalrevision (Alt-DSG oc/1993 + Neu-DSG oc/2022/491), Tor-Anker.
> **Speicher:** File-Sidecar `public/normtext/revisionen/<KEY>.json` (218, lazy) — **Übergangslösung**, Zielsenke ab E1
> `erlass_fassungen` (im Generator markiert, Schema-Rückkopplung in FAHRPLAN-DATENHALTUNG §3). Ingest erweitert
> (`normtext-revisionen`) → `check:paritaet` deckt die 218 byte-genau; `daten-manifest.json` nachgezogen.
> **Bridge B1 (Moat-Hebel 1):** «Änderungen / Revisionen»-Gruppe IM bestehenden `KontextPanel` neben der
> «Entstehungsgeschichte» (Norm-Kontext-Bus, KEIN Silo, ohne `gesetz-leser`-Änderung); Botschafts-Verweis über den
> ohnehin geladenen Bus (kein zweiter Fetch), Sammelerlass-Marker im `<details>`, locale-Titel, Fetch-Fehler≠leer.
> **Neu:** `scripts/normtext/revisionen-generieren(.ts/-run.ts)`, `check-revisionen.ts`,
> `src/lib/normtext/revisionen.ts`, `src/tests/normtext-revisionen.test.ts` (11), `bibliothek/normtext/revisionen-2026-07-10.md`;
> **erweitert:** `scripts/datenhaltung/ingest.ts`, `src/components/kontext/KontextPanel.tsx`, `package.json`. **Tore grün:**
> tsc · lint (0 F) · vitest 225/3661 · golden byte-gleich · build (61 Routen) · check:revisionen(-netz) · check:paritaet ·
> check:datenhaltung. **Gegenprüfung (Risiko-Pfad Extraktion) BESTANDEN** (unabh. Opus, frischer Kontext, live gegen den
> amtlichen Fedlex-SPARQL-Endpunkt: Drop-Check DSG7/MWSTG29/StGB58/BGBM2 deckungsgleich, DSG-Totalrevision, Marker
> 2025-04-01 belegt, Joins bidirektional, Q1 Bandjahr + Titel verbatim; 0 Befunde). Beleg `bibliothek/normtext/revisionen-2026-07-10.md`.
> **OFFEN (Nicht-Ziel P1):** kein AS-Volltext-Snapshot; keine Artikel-Diff-Darstellung (W3·10); Pre-2000-Marker bewusst nicht.
>
> **Nachtrag 11.7.2026 (Reconciliation Staatsverträge + korpusweiter roFundstelle-Fix, Branch `fix/revisionen-staatsvertraege`, Trailer `Roadmap: W2·6`):** Paket 4 (#186) fügte 9 Bund-Snapshots (SR 0.*: HKsÜ, HUVÜ, EAUe, CMR, Montrealer Übk., RBÜ, UNO-BRK, Istanbul-Konv., Apostille-Übk.) hinzu, ohne die Sidecars nachzuziehen → `check:revisionen` rötete main (Coverage-Drift 227 Grundmenge ↔ 218 Dateien). Generator für die 9 → **82 Änderungs-Einträge**, alle 9 mit ≥1. **Klargestellt (§8):** SR-0.*-Staatsverträge tragen im Fedlex-Graphen reguläre `eli/oc`-Änderungserlasse unter der SR-Taxonomie (Ratifikations-/Geltungsbereichs-Änderungen), Pfad (b) greift unverändert — **kein Leerzustand-Sidecar / keine Tor-Ausnahme nötig**; Botschafts-Join 0 (Staatsverträge tragen keine Paket-2-Botschaft), 2 Sammelerlass-Marker (EAUe).
>
> **Korpusweiter Treue-Defekt korrigiert (von der Gegenprüfung aufgedeckt):** Der Generator fabrizierte `roFundstelle` aus der ELI-Nummer — für **Einzel-Segment-ELI vor der AS-Reform 2019** ist diese die laufende `sequenceInTheYearOfPublication`, NICHT die AS-Seite ⇒ falsche Fundstelle (belegt: `oc/2005/566` ⇒ real AS 2005 4395, nicht «AS 2005 566»). Der POC-Befund «historicalId leer» galt nur für `jolux:historicalId`; die echte Fundstelle steht unter `<http://cogni.internal.system/model#historicalId>`. Neue `fundstelle()`: Einzel-Segment → `historicalId`-Seite; Multi-Segment-Alt-AS → DE-Ableitung (erstes Segment; historicalId dort FR-paginiert); Einzel-Segment ab 2019 → Ableitung (Sequenz == Seite). **Da `check:revisionen-netz` die Stichprobe live rebuildet, ist der Fix zwangsläufig korpusweit** → alle 227 Sidecars neu generiert (Diff nur `roFundstelle`/`sha`/`abgerufen`; 0 Einträge hinzu/weg, 0 Datums-Drift); +4 Unit-Tests. Determinismus 2 Läufe byte-identisch; `check:revisionen(-netz)` + `check:paritaet` (227) + `check:datenhaltung` (Manifest nachgezogen) + voller `gate` grün. **Gegenprüfung BESTANDEN** (unabh. Opus, live Fedlex-SPARQL + gerenderte AS-Seiten: Timeline deckungsgleich, roFundstelle-Fix gegen die amtlichen Werte belegt). Nur Daten, keine UI.

**Ziel:** Auf der Gesetzesseite ein Abschnitt **«Änderungen / Revisionen»** — welche Änderungserlasse (AS/RO, `eli/oc`) haben dieses Gesetz wann geändert, mit In-Kraft-Datum, Titel, RO-Fundstelle und Link zum AS-Text. Das ist die **Schwester zur «Entstehungsgeschichte» (Paket 2)**: Botschaft = Genese-*Absicht*, AS-Erlass = die *tatsächliche* Änderung; zusammen = die volle Gesetzes-Geschichte an einer Stelle (Burggraben). **Nicht-Ziel (P1):** kein Volltext-Snapshot des Änderungserlasses (Live-Link auf den AS-Text genügt); keine Artikel-für-Artikel-Diff-Darstellung (das ist der intertemporale Fassungsvergleich, W3·10 «Normfassungs-/Geltungsstand-Prüfer», separat).

### Machbarkeit — belegt (live getestet an DSG SR 235.1)

Zwei Kandidatenpfade geprüft; **Pfad (b) ist der verlässliche, dublettenfreie Lieferant** der «wann wurde was geändert»-Liste:

- **Pfad (a) — Konsolidierungs-Versionen:** `?cons jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`. Gibt die vollständige Liste der *Geltungsstände* (DSG-Alt-Abstract: 14 Daten 1993–2019). **ABER:** die `Consolidation` trägt **keinen** Link auf den auslösenden Erlass (kein `generationCause`/Trigger-Edge — live verifiziert) → kein Titel, keine AS-Fundstelle. Zudem ist sie **an einen Abstract gebunden**: die Totalrevision DSG 2020 erzeugt einen **neuen** Abstract (`cc/2022/491`) → Pfad (a) sieht die Historie über die Totalrevision hinweg **nicht** zusammenhängend. **= identisch mit den Daten, die der Gap-Report §3 schon hat** (Currency), nicht mehr.

- **Pfad (b) — Erlasse über die SR-Taxonomie (empfohlen):**
  ```sparql
  PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
  PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
  SELECT ?oc ?dateForce ?dateDoc ?roId ?botschaftDate (SAMPLE(?t) AS ?titel) WHERE {
    ?tax skos:notation "235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .
    ?oc jolux:classifiedByTaxonomyEntry ?tax ;
        jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ;
        jolux:dateEntryInForce ?dateForce .
    OPTIONAL { ?oc jolux:dateDocument   ?dateDoc . }
    OPTIONAL { ?oc jolux:historicalId   ?roId . }         # "RO 2019 625" = AS-Fundstelle
    OPTIONAL { ?oc jolux:botschaftDate  ?botschaftDate . } # Verzahnung → Paket 2
    OPTIONAL { ?oc jolux:isRealizedBy ?e . ?e jolux:title ?t . }
  }
  GROUP BY ?oc ?dateForce ?dateDoc ?roId ?botschaftDate
  ORDER BY DESC(?dateForce)
  ```
  Getestet: DSG → die Änderungs-**Erlasse** mit `dateEntryInForce` (1993-07-01 … 2025-07-07), jeder mit `dateDocument` (Erlass-Datum), **`historicalId` = RO-Fundstelle** (z. B. «RO 2019 625»), **`botschaftDate`** (Botschafts-Datum → direkte Verzahnung zu Paket 2) und `eli/oc`-Link zum AS-Text. **Spannt die Totalrevision** (Alt-DSG `oc/1993/1945` + Neu-DSG `oc/2022/491` liegen beide unter Taxonomie `5993`). Dubletten (die `cc`-Abstracts selbst) werden per `legalResourceFamilyType = …/resource-family/oc` **herausgefiltert**; Sprach-Realisierungen kollabieren über `GROUP BY ?oc`.

**Ehrliche Grenze (Vollständigkeit):** Pfad (b) listet nur Erlasse, die **primär** unter dieser SR klassifiziert sind. Änderungen, die über **Mantel-/Sammelerlasse anderer SR** eingebracht wurden, tauchen bei (b) **nicht** auf (sie erzeugen einen Geltungsstand, den nur Pfad (a) als Datum sieht) — es gibt **keine** saubere «amends»-Kante in den Abstract (live geprüft: reverse-Edges sind nur `isMemberOf`/`foreseenImpactToLegalResource(2)`/`subdivisionIsPartOf`, kein vollständiger Änderungs-Graph). **Umgang:** Pfad (b) ist die Timeline; **Cross-Check gegen Pfad (a)** (dessen Konsolidierungs-Daten der Gap-Report bereits hat): wo (a) *mehr* Geltungsstände als (b) Erlasse zeigt, gab es eine Mantelerlass-Änderung → ehrlicher Marker «weitere Änderung über einen Sammelerlass — siehe amtliche Sammlung» statt stiller Lücke (§8).

**Historische Reichweite:** strukturierte Verknüpfung mit `botschaftDate`/`historicalId` verlässlich **ab ~2000** (digitale AS). Ältere Erlasse sind als `eli/oc` mit RO-Fundstelle vorhanden (DSG bis `oc/1993`), aber ohne durchgehende Botschafts-Verknüpfung; Konsolidierung reicht bis zur Erstpublikation (Alt-DSG 1993). Grenze im UI benennen.

### Abgrenzung / Verzahnung
- **vs. Paket 1 (Currency):** Paket 1 beantwortet «welche **eine** geltende Fassung liefern wir?» (Pfad-a-Daten, für die Extraktions-Aktualität). Paket 5 beantwortet «welche Änderungen gab es über die **Zeit**?» (Pfad-b-Erlasse, als Lese-Feature). Gleiche Rohdaten-Ecke, anderer Zweck — **kein Doppel-Build:** Paket 5 nutzt die Konsolidierungs-Daten aus dem Gap-Report für den Vollständigkeits-Cross-Check.
- **vs. Paket 2 (Botschaften):** komplementär. Jeder AS-Änderungseintrag **verlinkt seine Botschaft** über `botschaftDate` bzw. den gemeinsamen `?proj`-Knoten (gleiche Kette) → im Reader stehen «Entstehungsgeschichte» (Botschaften) und «Änderungen/Revisionen» (AS-Erlasse) nebeneinander, gegenseitig verlinkt.

### Datenmodell / UI — Empfehlung: erlass-eigene Revisions-Timeline (NICHT Materialien-Doktyp)

**Empfehlung:** eine **erlass-eigene «Änderungen / Revisionen»-Timeline** als Sidecar am Normtext, **nicht** ein Materialien-Doktyp. Begründung: (1) AS-Änderungserlasse sind **kein browsbares Standalone-Korpus** — niemand blättert «alle AS-Erlasse»; sie werden immer im Kontext *eines* Gesetzes gelesen. (2) Als Materialien-Einträge würden hunderte fast identischer AS-Zeilen die Materialien-Übersicht fluten. (3) Die Daten sind eine reine **Build-time-Projektion aus dem Graphen, keyed nach SR** → am besten als Sidecar `public/normtext/revisionen/<KEY>.json` (oder ein `revisionen-index.json`), lazy vom Reader geladen — analog zum Norm→Entscheid-Index. **Alternative (ehrlich):** will David die AS-Erlasse *auch* durchsuchbar/browsbar, ginge ein Materialien-`doktyp: 'as-erlass'` (wie Botschaften mit `BehoerdeId 'BR'`) — für P1 **nicht empfohlen** (Flut + kein Browse-Bedarf).

**UI:** Abschnitt «Änderungen / Revisionen» in `src/pages/gesetz-leser/inhalt.tsx`, direkt neben «Entstehungsgeschichte» (beide am Leseende, über/neben dem `KontextPanel`). Je Eintrag: In-Kraft-Datum · Titel · RO-Fundstelle · AS-Live-Link · «Botschaft ansehen»-Verweis (wenn vorhanden). **Reihenfolge: Datum absteigend.** Status-Marker (§8): «maschinell aus dem amtlichen Fedlex-Graphen; massgeblich bleibt die amtliche Sammlung» + Vollständigkeits-Hinweis bei Mantelerlass-Lücken. Sprachwahl DE/FR/IT über die `isRealizedBy`-Realisierungen.

### P1-Umfang
Für die **218 Bund-Volltext-Erlasse** (`register.json`, `ebene==bund`, `status=='snapshot'`) je eine Revisions-Timeline aus Pfad (b), Status = Live-Link (kein AS-Volltext-Snapshot). `botschaftKey` automatisch verknüpft, wo Paket 2 den Eintrag kennt.

### Betroffene Dateien
- **neu:** `scripts/normtext/revisionen-generieren.ts` (Muster: der Paket-2-Generator / `bund-stubs-generieren.ts`; SPARQL Pfad (b) je SR + Cross-Check gegen Pfad-a-Daten) · `public/normtext/revisionen/*.json` bzw. `revisionen-index.json` · `bibliothek/normtext/revisionen-raw/*.json` (store-raw, §11).
- **neu (Lese-Brücke):** `revisionenFuerNorm(key)` in `src/lib/normtext/werkzeuge.ts` (oder `revisionen.ts`), sortiert Datum absteigend, verknüpft Botschaft.
- **erweitert:** `src/pages/gesetz-leser/inhalt.tsx` (Abschnitt) · ggf. `src/lib/kontext.ts` (falls ins Kontext-Modell integriert) · `package.json` (Script `normtext:revisionen`).

### Tore & Gegenprüfung
- **Neu:** `check:revisionen` (offline) — committetes Sidecar == frischer Build (Determinismus §2), key-/Datums-/URL-Validität, `botschaftKey` verweist nur auf existierende Paket-2-Einträge (kein toter Cross-Link, §8); **Netz-Tor** (Drift): Pfad-b-Query stichprobenweise nachfahren + Vollständigkeits-Cross-Check gegen Pfad (a).
- **Gegenprüfung (Pflicht §14, Risiko-Pfad):** unabhängiger Opus-Zweitpass, Auftrag **widerlegen** — Stichproben: (a) gehört der AS-Erlass wirklich zu diesem Gesetz (gegen die amtliche AS-Seite / RO-Fundstelle)? (b) stimmt das In-Kraft-Datum mit der amtlichen Fassung? (c) sind Mantelerlass-Lücken korrekt als «weitere Änderung über Sammelerlass» markiert statt verschwiegen? (d) Referenzfall DSG: Timeline enthält Alt- **und** Neu-DSG über die Totalrevision hinweg. `npm run gegenpruefung:ok` erst nach bestandenem Pass. **Quelle immer die amtliche Fedlex-Stelle** (SPARQL + AS-Filestore); **nie** `droid-f/fedlex`.

### Aufwand grob
Generator (Pfad b + Cross-Check, Paket-2-Pipeline geerbt) ~1 Session · Sidecar-Store + Reader-Abschnitt + Botschafts-Verzahnung ~1 Session · Tore + Gegenprüfung ~0,5 Session. **Gesamt M–L**, deutlich günstiger **nach** Paket 2.

### §14-Intake
ROADMAP **W2·6** (Konsultieren-Klingen, Schwester zu W2·6-BOT), Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md`. Kein 26×-Bezug, kein Worktree.
`<!-- @meta id: W2·6-REV · status: done · of: ja · blocker: null · dep: [W2·6-BOT] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->` — **✅ 10.7.2026 ausgeführt (siehe Stand-Block oben).** *(Zitat, nicht Steuerung — massgeblich ist das `@meta` in `ROADMAP.md`, §5.)*
**Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

**Historie-Modell vereinheitlicht (Fundament-Plan §4.4/§7 Punkt 5, David 3.7.2026 — verbindlich):** Der hier vorgeschlagene File-Sidecar `public/normtext/revisionen/<KEY>.json` ist eine **Übergangslösung**. **Zielsenke ist die Tabelle `erlass_fassungen` ab E1** (`FAHRPLAN-DATENHALTUNG.md §3`; §5-Doktrin «nie zwei Wahrheiten»: `erlass_fassungen` ist DAS Historie-Modell, kein paralleler Revisions-Sidecar). Wird Paket 5 VOR E1 gebaut, bleibt der Sidecar zulässig, ist aber im Generator **explizit als Übergangslösung zu markieren** + Migrationsnotiz «schreibt ab E1 in `erlass_fassungen`, Sidecar wird dann Projektion». Fundstellen-Rohstoff (`jolux:dateEntryInForce`, AS-`historicalId`) ist deckungsgleich. **Zusatznutzen:** dieselben Historie-Daten speisen die Artikel-Stabilitäts-Messung (Fundament-Plan §3.2 — Anteil `art_id`s stabil/verändert/verschwunden über die letzten N Revisionen von OR/ZGB/StGB), die das versionslose Verzahnungs-Kanten-Modell empirisch absichert, statt es nur zu behaupten.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 5 — Änderungshistorie / Amtliche Sammlung (W2·6-REV, P1.5)**

**Ziel.** Je Bund-Gesetzesseite Abschnitt **„Änderungen / Revisionen"**: welche AS/RO-Änderungserlasse (`eli/oc`) haben wann geändert — In-Kraft-Datum, Titel, RO-Fundstelle, AS-Live-Link, Botschafts-Verweis. Moat zusammen mit Paket 2: Botschaft = *Absicht*, AS = *tatsächliche* Änderung → volle Gesetzes-Geschichte an einer Stelle. **Nicht-Ziel (P1):** kein AS-Volltext-Snapshot; keine Artikel-Diff-Darstellung (W3·10) — **aber** Artikel-Anker mitführen (Moat-Hebel 2).

**Quelle+Endpunkt.** Pfad (b), live an DSG SR 235.1 verifiziert (DSG=19 in Refutation reproduziert, spannt Totalrevision):
```sparql
SELECT ?oc ?dateForce ?dateDoc ?roId ?botschaftDate (SAMPLE(?t) AS ?titel) WHERE {
  ?tax skos:notation "<SR>"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .
  ?oc jolux:classifiedByTaxonomyEntry ?tax ;
      jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ;
      jolux:dateEntryInForce ?dateForce .
  OPTIONAL { ?oc jolux:dateDocument  ?dateDoc . }
  OPTIONAL { ?oc jolux:historicalId  ?roId . }          # "RO 2019 625" = AS-Fundstelle
  OPTIONAL { ?oc jolux:botschaftDate ?botschaftDate . }  # Verzahnung → Paket 2
  OPTIONAL { ?oc jolux:isRealizedBy ?e . ?e jolux:title ?t . }
} GROUP BY ?oc ?dateForce ?dateDoc ?roId ?botschaftDate ORDER BY DESC(?dateForce)
```
Fallen: `skos:notation` typisiert; `resource-family/oc` filtert `cc`-Dubletten, `GROUP BY ?oc` kollabiert DE/FR/IT [Sprach-Kante zu verifizieren durch Opus]. **Mantel-/Sammelerlass-Lücke (strukturell):** keine `amends`-Kante → **Cross-Check gegen Pfad (a)** (`?cons jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`, Mechanik = `fedlex-versionen-pruefen.ts`); wo (a) mehr Stände zeigt als (b) Erlasse → **§8-Marker** „weitere Änderung über einen Sammelerlass — siehe amtliche Sammlung", nie stille Lücke. Totalrevision: Alt+Neu-Abstract unter derselben Taxonomie → Cross-Check über ALLE Abstracts der SR [Abstract-Enumeration zu verifizieren durch Opus]. Reichweite verlässlich ab ~2000.

**Kritik-Korrekturen eingearbeitet:**
- **Füllraten-POC VOR Aufwand-Freigabe (Finding 6):** `botschaftDate`/`historicalId`/Sprach-Kante/data-URI→Portal-Mapping sind alle `[zu verifizieren]`; der DSG-Test verifizierte nur die SELECT-Form, nicht die Füllung über 218. **Opus misst korpusweit die OPTIONAL-Feld-Füllraten**, bevor M–L freigegeben wird — sonst besteht die Timeline überwiegend aus Zeilen mit nur `dateEntryInForce` (geringer Nutzwert).
- **„Konsolidierung trailt AS"-Widerspruch (Finding 4, P0, user-sichtbar):** Paket 1 lässt ein frisch in Kraft getretenes, noch unkonsolidiertes Amendment mit **altem Normtext** stehen; Paket 5 listet dasselbe als „geändert am X". Der Leser sähe „geändert am 1.10.2026" neben Vor-Fassungs-Text. **Pflicht-Marker in Paket 5:** bei `dateEntryInForce > erlass.stand` → „Änderung noch nicht in den geltenden Text konsolidiert".
- **DB-Reife NICHT übertreiben (Refutation-Treffer 3):** `erlass_revisionen(... REFERENCES erlasse(key) ...)` ist **reines Zukunfts-Schema** — in E0 existiert weder `erlasse` noch `erlass_fassungen` noch `materialien`, der FK ist heute nicht anlegbar; `projektion.ts` kann keine typisierte-Tabelle→JSON. **Heutiger Beweis = ausschliesslich das `check:revisionen`-Sidecar-Tor, NICHT `check:paritaet`.**
- **Botschafts-Join auflösbar (Finding 1):** `botschaft_key` matcht über die von Paket 2 nun persistierten `ocUri`/`botschaftDate` (nicht über Curia-Nr., die Paket 5 nicht kennt). Nur bei belegtem Match setzen, sonst NULL + nur `botschaftDate` als Text (kein toter Link).
- **Trilingual korrekt** (Paket 5 speichert bereits `titel_de/fr/it`).

**Extraktion.** Neues `scripts/normtext/revisionen-generieren.ts` (Muster Paket-2-Generator + `sparqlBatch`). npm `normtext:revisionen`. Ablauf: SR → Pfad-b-Query → store-raw (`bibliothek/normtext/revisionen-raw/<KEY>.json`) → normalisieren/sortieren (Datum absteigend, kanonisch, stabil) → Pfad-a-Cross-Check → Sidecar. Idempotent, `--nur <KEY>`-Filter. Sequenziell/klein-Batch (Rate-Budget §2). Extraktion/Writer getrennt (§1 Regel 5).

**DB-Schema.** **File-Sidecar heute** `public/normtext/revisionen/<KEY>.json` (ein File je Erlass, lazy — kein Monolith; 218 × Timeline würde Reader-Load aufblähen). JSON-Felder = geplante Spalten (camelCase): `erlassKey, ocUri, dateEntryInForce, dateDocument, roFundstelle, titelDe/Fr/It, botschaftDate, botschaftKey?, artAnker?, art ('aenderung'|'sammelerlass-marker'|'nicht-konsolidiert-marker'), nichtKonsolidiert?, quelleUrl, stand, abgerufen, sha`. `sammelerlass-marker` = Pfad-(a)-Datum ohne `ocUri`-Erlass, synthetischer Key `paketa:<datum>`. **Zukunfts-Tabelle `erlass_revisionen` ist E6b-Schema** (in FAHRPLAN-DATENHALTUNG §3 zurückgetragen, Finding 17) — **heute nicht anlegen**. Sidecar ist **neu und nicht im Ingest** → Allowlist-Eintrag oder Ingest-Erweiterung (§1 Regel 2). Golden-schonend: rein additiv, `NormSnapshot`/`register.ts` unverändert (Sidecar-Existenz = Signal).

**UI-Andockung.** Abschnitt „Änderungen / Revisionen" in den **Norm-Kontext-Bus** (B1), neben „Entstehungsgeschichte" — Timeline **ans Leseende**, nicht in den `ErlassKopfBlock`. Lese-Brücke `revisionenFuerNorm(key)` (lädt Sidecar, sortiert, reichert `botschaftKey` an). Je Eintrag: In-Kraft-Datum · Titel (UI-Sprache, Fallback DE) · RO-Fundstelle · „AS-Text ↗" · „Botschaft ansehen" (nur bei `botschaftKey`) · ggf. „noch nicht konsolidiert"-Marker. Sammelerlass-Marker als abgesetzte Zeile. §8-Marker + Reichweiten-Hinweis (~ab 2000). **Beide Leser-Instanzen** (Finding 12). §15-Zusage konsistent zu Paket 2 (lazy-Sidecar explizit, token-Mindesthöhe, CLS=0). Leerzustand ehrlich, Fetch-Fehler ≠ Leer (Finding 15). L0/§1/§13/D1.

**Verifikations-Tor.** **Neu `check:revisionen` (offline, in `check`):** (1) Determinismus (Build aus raw == committetes Sidecar); (2) Schema-Validität (`dateEntryInForce` ISO, `quelleUrl` http/s, Key ∈ Register); (3) Cross-Link-Integrität (`botschaftKey` → existierender Paket-2-Eintrag; **Cross-Package-Key-Stabilität**, Finding 9); (4) Sortierung; (5) **DSG-Regressionsanker** (Timeline SR 235.1 enthält Einträge vor UND nach Totalrevision 2020); (6) `nicht-konsolidiert`-Marker gesetzt wo `dateEntryInForce > erlass.stand`. **Netz-Tor** `check:revisionen-netz` (in `check:netz`): Stichproben-Nachfahrt Pfad-b + Cross-Check (a)vs(b), Drift=Exit 1. **Gegenprüfung:** `public/normtext/revisionen/*.json` fällt bereits unter die bestehende `public/normtext/*.json`-Glob (Refutation bestätigt gedeckt) — aber `scripts/normtext/revisionen-generieren.ts` liegt unter `scripts/normtext/` = ebenfalls gedeckt. Adversarial: gehört AS-Erlass wirklich zum Gesetz (gegen RO-Fundstelle/amtliche AS-Seite)? In-Kraft-Datum? Sammelerlass-Lücken als Marker sichtbar? DSG Alt+Neu? → `gegenpruefung:ok`.

**Risiken.** Stille Mantelerlass-Lücke → Pflicht-Cross-Check (a)+Marker+Netz-Assertion. Datum-Matching (a)↔(b) unscharf (Konsolidierung trailt AS) → [an 3 Referenzgesetzen kalibrieren], im Zweifel Marker (falsch-positiver Marker §8-verträglicher als stille Lücke). Toter Botschafts-Link → `botschaftKey` nur bei belegtem Match. Pre-2000-Datenqualität → Quell-Grenze, nie Fabrikation. DB-Reife-Übertreibung → als Zukunfts-Schema klargestellt.

**DoD.** Füllraten-POC dokumentiert · Generator deterministisch, 218 Sidecars + raw, `--nur` · Reader zeigt Abschnitt (beide Instanzen) mit allen Feldern + §8/Sammelerlass/nicht-konsolidiert-Marker, DSG-Referenzfall visuell (Playwright, mobil+Dark) · `check:revisionen` grün + in `check`, `check:revisionen-netz` in `check:netz` · Gegenprüfung quittiert · Sidecar im Allowlist/Ingest, `erlass_revisionen` in FAHRPLAN-DATENHALTUNG zurückgetragen · Writer als E1-Flip-Punkt markiert · §14-Intake W2·6-REV · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M–L** (Generator+Cross-Check ~1 · Sidecar+Reader+Verzahnung ~1 · Tore+Gegenprüfung ~0,5). Günstiger NACH Paket 2. **Abhängigkeiten:** hart `dep: [W2·6-BOT]` (Verzahnung); baubar auch ohne (dann `botschaftKey`=NULL), nicht empfohlen. Helfer mit Paket 1 teilen (Pfad a). Vor E1 Sidecar, nach E1 Writer umhängen.

---

---

## §Paket 3 — Vernehmlassungen (P2) *(ausgelagert 15.8.2026)*

## Paket 3 — Vernehmlassungen (P2)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p3-vernehmlassungen`; Go David «go zu allem»; Trailer `Roadmap: W2·6`).**
> **POC MACHBAR (Phase 1, VOR Bau — §7 Quell-Wahl):** direkte `foreseenImpactToLegalResource`-Kante (einfacher als Paket 2,
> kein oc-Umweg) live über alle 218 SR — **822 Consultations**, 173/218 Erlasse mit ≥1 Verfahren, Voll-Lauf **1,6 s** (Batch 55).
> Füllraten status 100 % · Titel DE/FR/IT je 100 % · Frist 96,6 % · projEli 100 % (aus cons-URI). Reichweite **2000–2026** (besser
> als Plan-Annahme «~ab 2006»). Referenzfälle live: **OR→33 · DSG→3 · MWSTG→14** (Plan nannte MWSTG→4 — überholt/vertippt;
> live zweifach reproduziert = 14). Rest-POC a–d erledigt: (a) Voll-Lauf gemessen; (b) 18 «geplant» ohne Frist → kein leerer
> String; (c) **`institutionInChargeOfTheEvent` korpusweit LEER** → eröffnende-Stelle-Hinweis fallen gelassen, generische
> Behörde `BUND` statt `BR`; (d) Reichweite/Legacy-6xxx-Kodierung bestätigt.
> **Datenmodell:** `MaterialRegistereintrag` additiv `vernehmlassung: { status, fristStart?, fristEnde?, projEli }`; Status-Enum
> 1:1 vom Vokabular `consultation-status/0–6`; `key`=`VERN-{jahr}-{nr}` (Legacy `VERN-6006-36` erhalten); `stand`=Abfragedatum
> (Status mutabel), aber NICHT im `sha`-Drift-Token (kein Tages-Churn). Determinismus 2 Läufe byte-identisch.
> **Ingest:** über den bestehenden Merge-Pfad `ALLE_MATERIALIEN` (Paket 2 hat den generierten-Materialien-Pfad schon gebaut →
> kein eigener `ingestMaterialien()` nötig); `register.json` byte-parität-gegated. **UI (Bridge B1):** «Gesetzgebung in Arbeit»
> IM `KontextPanel` (Norm-Kontext-Bus), laufend zuerst, «läuft bis {Frist}», DE/FR/IT, §8-Marker, Fehler≠Leer.
> **Currency:** Netz-Tor `check:vernehmlassungen-netz` (Currency-Arbiter, in `check:netz`) + **Offline-Assertion**
> `laufend && fristEnde<heute ⇒ rot` in `check:materialien` (gegen echten heutigen Tag — belastbarer Schutz ohne Cron).
> **Neu/erweitert:** `scripts/materialien/vernehmlassungen-generieren(.ts/-run.ts)`, `check-vernehmlassungen-netz.ts`,
> `src/lib/materialien/{vernehmlassungen.generated.ts,vernehmlassungen.ts,typen.ts,register.ts}` (BehoerdeId `BUND`, DoktypId
> `vernehmlassung`, `VernehmlassungStatus`), `material-manifest.ts`/`check-materialien.ts` (BUND-Integrität + Frist-/Status-
> Assertionen), `KontextPanel.tsx`, 1 Test-Datei. **Tore grün:** tsc · lint (0 Fehler eigen) · vitest · build (1549 Material-
> Seiten) · check:materialien · check:vernehmlassungen-netz (OR:33·DSG:3·MWSTG:14) · check:paritaet · golden byte-gleich.
> Gegenprüfungs-Glob deckt `scripts/materialien/**`+`public/materialien/*.json`. **Gegenprüfung bestanden** (unabhängiger
> Opus-Adversarial gegen Fedlex-SPARQL). Beleg: `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.
> **BEWUSST OFFEN:** Laufend-Badge im Reader-Kopf (`src/pages/gesetz-leser/parts.tsx`) nicht gebaut — Datei in dieser
> Bau-Einheit TABU (§12 Parallel-Session-Kollision); nachzuziehen, wenn der gesetz-leser frei ist. Kein Text-Snapshot (P1-Nicht-Ziel).

**Wert:** «was kommt»-Vorschau (Anhörungen vor dem Parlament) — komplettiert die Konsultieren-Klinge **W3·11** (Gesetzgebungs-Tracking).

**Machbarkeit (teilweise offen — ehrlich):** Vernehmlassungen liegen unter `eli/dl/proj` (~2000). Die Projekt-Graph-Verknüpfung zum Gesetz ist **plausibel dieselbe** wie bei Botschaften (der `?proj`-Knoten trägt beide als `legislativeTask`-Ereignisse), **aber nicht end-to-end getestet**. **Vor Bau:** POC (§7 Quell-Wahl) — SPARQL-Probe, ob ein Vernehmlassungs-`event` am selben `?proj` hängt und sich per SR rückwärts auflöst. Erst wenn belegt bauen, sonst als Grenze dokumentieren.

**P1-Umfang (falls POC grün):** Vernehmlassungen zu unseren Volltext-Erlassen als Materialien-Typ `doktyp: 'vernehmlassung'`, Status `nur-live-link`. **Erbt die Botschaften-Pipeline** (`botschaften-generieren.ts` → generischer `projekt-graph-generieren.ts` mit `typeDocument`-Parameter) → billiger nach Paket 2.

**Grenze:** laufende vs. abgeschlossene Verfahren — Currency-Frage (welche noch offen?) braucht Datum-Feld + Wiedervorlage, sonst Liste toter Alt-Anhörungen. Im POC mitprüfen.

**Aufwand grob:** POC ~0,5 Session; Bau (POC grün, Pipeline geerbt) ~1 Session. **Gesamt L.**

**§14-Intake:** ROADMAP-Schritt **W3·11**. **Trailer:** `Roadmap: W3·11` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 3 — Vernehmlassungen (W3·11, P2 → durch POC auf M herabgestuft)**

**Ziel.** Je Bund-Gesetzesseite Abschnitt **„Gesetzgebung in Arbeit"**: laufende/abgeschlossene Vernehmlassungen mit Status, Frist, Live-Link. Komplettiert mit Paket 2/5 die Zeitachse Vergangenheit→Gegenwart→Zukunft. **Moat-Kritik eingearbeitet:** der differenzierende Wert ist **proaktiv** (Laufend-Tracking „was ändert sich in meinem Rechtsgebiet"), nicht die retrospektive Pro-Norm-Liste. Deshalb bleibt der **Laufend-Badge + Cross-Norm-Fähigkeit** in diesem Paket (nicht auf P2 verschoben, wo der Original-Plan den differenzierenden Teil weggeschnitten hätte).

**Quelle+Endpunkt (live belegt 2.7.2026; COUNT=2548 und OR→33 in Refutation reproduziert).** Direkte Kante — **einfacher als Paket 2**, keine oc-Reverse-Kette:
```sparql
?tax skos:notation "220"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .  # TYPISIERT
?cc jolux:classifiedByTaxonomyEntry ?tax .
?cons a jolux:Consultation ;
      jolux:foreseenImpactToLegalResource ?cc ;
      jolux:consultationStatus ?status .
OPTIONAL { ?cons jolux:eventTitle ?titel . FILTER(LANG(?titel)="de") }
OPTIONAL { ?cons jolux:hasSubTask ?open . ?open a jolux:ConsultationPhase ;
           jolux:eventStartDate ?start ; jolux:eventEndDate ?ende }
```
Belegt: OR(220)→33, DSG(235.1)→3, MWSTG(641.20)→4. URI `eli/dl/proj/{jahr}/{nr}/cons_1`, Legacy-Jahre `6006`–`6020`. **Status-Vokabular** `vocabulary/consultation-status/{0..6}` (0 In Vorbereitung · 1 Geplant · 2 Laufend · 3/4 Abgeschlossen-abwarten · 5 Abgeschlossen · 6 Zurückgezogen) — löst die Plan-offene „laufend vs. abgeschlossen"-Grenze amtlich. Fristen via Sub-Task `cons-open` (`eventStartDate`/`eventEndDate`). Titel/Beschreibung DE/FR/IT direkt am Knoten. Live-Link `https://www.fedlex.admin.ch/eli/dl/proj/{jahr}/{nr}/cons_1/de` (HTTP 200 geprüft).

Fallen: typisierte notation; SPA-Shell (200 ≠ Inhalt → Existenz per SPARQL prüfen, nie HTTP-Status); Zuordnungs-Grobheit (`foreseenImpact`: VDSG proj/6006/36 hängt auch am DSG-cc → §8-Marker); Mantelvorlagen unter jedem SR (Feature, kennzeichnen); `DISTINCT`. **Rest-POC [zu verifizieren durch Opus, ~0,25 Session]:** Voll-Lauf über 218 SR (Trefferverteilung/Laufzeit/Batch); Status-0/1 ohne `cons-open` (Frist „noch offen", nicht leerer String); `institutionInChargeOfTheEvent`-Labels; ältester Eintrag (Reichweite ~ab 2006).

**Extraktion.** Neues `scripts/materialien/vernehmlassungen-generieren.ts` (oder zweiter `typeDocument`-Modus des Paket-2-Generators, falls dieser existiert — **nicht vorab abstrahieren**, §1). npm `materialien:vernehmlassungen`. Ablauf idempotent `fetch → store-raw (`…/vernehmlassungen-raw/<SR>.json`) → parse → load (`vernehmlassungen.generated.ts` → `MATERIAL_REGISTER` → `register.json`)`. Sortierung (Status-Priorität laufend>geplant>abgeschlossen, Fristende absteigend, key). Exit 2 bei Netzfehler, keine halben Generate.

**DB-Schema.** `MaterialRegistereintrag` additiv: `DoktypId 'vernehmlassung'`; **`BehoerdeId 'BUND'`** (generisch — Vernehmlassungen kommen von BR/Departementen **oder parl. Kommissionen** (Pa.Iv.-Fälle wie „22.448 Caroni"), Paket-2-`'BR'` wäre teils falsch; eröffnende Stelle aus `institutionInChargeOfTheEvent`-Label im Hinweis). Neues Feld `vernehmlassung?: { status: 'in-vorbereitung'|'geplant'|'laufend'|'abgeschlossen-stellungnahmen'|'abgeschlossen-bericht'|'abgeschlossen'|'zurueckgezogen'; fristStart?; fristEnde?; projEli }` (1:1 vom Vokabular 0–6). `key` = `VERN-{jahr}-{nr}` (Legacy `VERN-6006-36` unverändert). `titel_de/fr/it` (Finding 10). `status: 'nur-live-link'`. `quelleUrl` = cons_1-Portal-URL. `stand` = Abfragedatum (Status **mutabel**). `normKeys` automatisch. `artAnker?` (Moat-Hebel 2, wo ableitbar). `sha` inkl. `vernehmlassung.status`+`fristEnde`+`normKeys` (Drift-Token).

**DB-Andockung (Refutation: wie Paket 2 — Bau-Schritt, nicht automatisch):** dieselbe Materialien-Roundtrip-Lücke. Wird Paket 3 **vorgezogen** (POC erlaubt es, da direkte Kante keine oc-Kette braucht), muss es `ingestMaterialien()` **selbst** bauen (nicht auf Paket 2 verlassen). Zukunfts-Mapping (E6b, in FAHRPLAN-DATENHALTUNG zurückgetragen): `materialien(…)` + additive Spalten `vern_status/frist_start/frist_ende/proj_eli`. Vor E1 Datei-Pfad. `norm-index.json` (Finding 11) mitnutzen — potenziell tausende Vernehmlassungen dürfen `register.json` nicht clientseitig voll-iterieren.

**UI-Andockung.** Abschnitt „Gesetzgebung in Arbeit" in den **Norm-Kontext-Bus** (B1), `vernehmlassungenFuerNorm(key)`, laufende zuerst. **Laufend-Badge (Moat-Teil, behalten):** kleiner Chip im `ErlassKopfBlock` (`parts.tsx`, Erweiterungspunkt `inhalt.tsx:903-904`) **nur** bei `status==='laufend'`: „Vernehmlassung läuft bis {fristEnde}", Anker auf Abschnitt. **Beide Leser-Instanzen.** §8-Marker sichtbar; leere Liste = ehrlicher Reichweiten-Hinweis (~ab 2006); Fetch-Fehler ≠ Leer. §15 lazy explizit (wie Paket 2). L0/§1/§13/D1; Status-Chips über Design-Tokens (kein `text-red-*`). Übersichtsseite „alle laufenden Vernehmlassungen" = W3·11-Ausbau, nicht dieses Paket.

**Verifikations-Tor.** `check:materialien` erweitert: URL http(s) auf `www.fedlex.admin.ch/eli/dl/proj/`, `fristStart<=fristEnde`, Status ∈ Enum, P1-Status-Zwang, Determinismus, **Konsistenz-Assertion `laufend && fristEnde < heute ⇒ rot`** (Finding 7 — gegen **heute** im Build, nicht gegen mit-alterndes `stand`). **Neu `check:vernehmlassungen-netz`** (in `check:netz`) = **Currency-Arbiter** (Vernehmlassungen sind mutable: `consultationStatus`+`previousConsultationStatus`+`consultationHasModification`): alle nicht-abgeschlossenen live nachfahren, sha-Vergleich, Statuswechsel/Fristverlängerung = Exit 1. **Kadenz-Hinweis (Finding 7 + Refutation):** Netz-Tore sind nur so gut wie ihr Aufruf; `check:netz` ist nicht im Default-`gate`. Solange kein Cron im Repo verankert ist, ist die Offline-Assertion `laufend && fristEnde<heute` der belastbare Schutz gegen still-falsche „laufend"-Anzeige. **Gegenprüfungs-Glob** wie Paket 2 (`scripts/materialien/**`+`public/materialien/*.json`, Rot-Auslösung positiv testen). Adversarial (≥15 stratifiziert: laufend/abgeschlossen/zurückgezogen/Legacy-6xxx/Mantel; Referenzfälle OR→33/DSG→3/MWSTG→4; VDSG-Grobheit als maschinell markiert; Pre-2006-Ehrlichkeit) → `gegenpruefung:ok`.

**Risiken.** Currency (Status veraltet) = Hauptrisiko → Netz-Tor + Offline-Assertion `fristEnde<heute`. Zuordnungs-Grobheit → §8-Marker, nie „amtlich bestätigt zugehörig". SPA-Shell → Existenz per SPARQL. Timeout → typisierte notation, VALUES-Batch, Rate-Budget. Doppelbau → Datei-Pfad bis E1, festes Spaltenmapping.

**DoD.** Rest-POC a–d verifiziert + §11 · Generator deterministisch + raw · alle 218 abgedeckt (Treffer oder ehrliches Leer) · UI + Laufend-Badge (beide Instanzen), DE/FR/IT, §8-Marker, Fehlerzustand · `check:materialien`-Erweiterung inkl. `fristEnde<heute`-Assertion + `check:vernehmlassungen-netz` grün · Engine-Golden byte-gleich · Gegenprüfungs-Glob + Rot-Test · adversariale Gegenprüfung → `gegenpruefung:ok` · Schema-Rückkopplung · §14-Intake **W3·11** · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M** (herabgestuft von L — Kernkette belegt + einfacher als Paket 2): Rest-POC ~0,25 · Generator+Schema ~1 · UI+Tore+Gegenprüfung ~1. **Abhängigkeiten:** erbt Materialien-Typen-Mechanik + Kontext-Bus von Paket 2; **technisch seit POC unabhängig baubar** (direkte `foreseenImpact`-Kante) — bei Vorziehen +~0,5 Session (eigenes `ingestMaterialien()`). Kollisionsfläche `src/lib/materialien/**` mit Paket 2 → bei Parallelbau §12-Worktree.

---

---

## §Paket 4 — Staatsverträge (P3) *(ausgelagert 15.8.2026)*

## Paket 4 — Staatsverträge (P3)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p4-staatsvertraege`; Go David «go zu allem»; Trailer `Roadmap: W2·6`). PAKET 4 KOMPLETT → PORTFOLIO-GESAMTSTAND: alle 5 Pakete (1/2/5/3/4) ✅.**
> **POC (§7-Pflicht, vor Bau):** Königsweg bestätigt = konsolidierte `eli/cc`-Pipeline (kein `eli/treaty`-Extraktor, kein neues Format/Skript). SPARQL-Graph exponiert **keine** strukturierte Vertragsparteien-/Ratifikations-/Inkrafttreten-je-Partei-Kante → diese Info steht als amtlicher «Geltungsbereich am …»-Anhang IM Filestore-HTML und wird verbatim als `annex_*`-Snapshot erfasst (deterministisch, §8 — nichts kuratiert-geraten). **html-N-Falle (P1-a) bestätigt:** html-0 war bei **5/9** Erlassen stale → kanonische html-N via `isExemplifiedBy` gepinnt. **Currency-Falle Apostille:** naive «max ≤ heute»-Query lieferte 2016 (SPA-Shell); Arbiter `check:fedlex-versionen` = **2024-09-04** (extrahierbares HTML, html-4) → Snapshot statt pdf-embed.
> **Gebaut (9, rang 110–118):** HKsÜ 96 (0.211.231.011), HUVÜ 1973 (0.211.213.02), EAUe (0.353.1), CMR (0.741.611), Montreal (0.748.411), RBÜ (0.231.15), UNO-BRK (0.109), Istanbul-Konv. (0.311.35), Apostille (0.172.030.4). International-Volltext 18→**27**, Bund 226→**227** (+ pdf-embed unverändert 2). **Bewusst verworfen (auf 6–10 gekürzt, Finding 19):** ESÜ (überholt durch HKsÜ), WÜD/WÜK (Immunitäts-Nische), DBA-DE (Struktur-/Scope-Creep-Risiko → eigenes DBA-Paket), EPÜ 2000 (weder HTML noch PDF/A → nur Live-Link, unter Qualitätsschwelle).
> **B1-Beleg (kein Silo):** neue Einträge fliessen automatisch in die bestehende International-Rubrik/Systematik + Leser (`register.ts`, Stand-Chip + «geltend geprüft am …»-Currency-Chip via `currency.json`) — kein neues UI, kein Silo. Testimonium «Zu Urkund dessen» (`schlussint`) bewusst als nicht-normative Boilerplate in `check:p-klassen` dokumentiert.
> **Gegenprüfungs-Befund (10.7., adressiert, NICHT stumm):** Der Extraktor erfasst Artikel + `annex_*`-Anhänge/Protokolle vollständig (Artikelzahl HTML==Snapshot in allen 9, Wortlaut/NBSP/Fussnoten treu), aber **nicht** die separate `<div id="scope">`-Sektion — «Geltungsbereich am …» (`scope_*`) + Schweizer «Vorbehalte und Erklärungen» (`decl_*`). Das ist eine **pre-existing korpusweite Extraktor-Grenze** (die 18 deployten Verträge droppen sie byte-identisch, an KRK verifiziert), **kein P4-Regress**; der Fix ist ein Kern-Extraktor-Ausbau über alle 27 Verträge (TABU diese Session) → **eigene Bau-Einheit, backlogged** in `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`. Bis dahin ist die volle Fassung inkl. Geltungsbereich/Vorbehalten über den amtlichen Live-Link (§7c) erreichbar (L0/§8: dokumentiert, nicht stumm). Detail: §11-Beleg §4a.
> **Verifikation:** `npm run check` grün (ausser vorbestehend-rot `check:plan` [W3·14 verwaist, aus PR #182, nicht dieser Diff] + gegenpruefung); `check:fedlex-versionen`/`check:pdf-netz` grün; `check:normtext-netz`-Rest-Drift (5 kant. PDFs AR/VD/FR/VS) = **vorbestehend auf main**, nicht dieser Diff; tsc/build grün (1458 Detailseiten, 0 übersprungen). Adversariale **Gegenprüfung (Opus, frischer Kontext) bestanden**. §11-Beleg: `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`. Push/Deploy = Davids §9-Ja.

**Wert:** punktuelle Ergänzung der International-Rubrik. **Ist-Stand:** bereits 20 SR-0.* (18 Volltext inkl. CISG/LugÜ/FZA/HKÜ/UNO-Pakte + 2 PDF-Embeds EMRK/NYÜ) + 8 EU-Verordnungen (EUR-Lex-Links). Grenznutzen weiterer Verträge **niedrig-mittel**.

**Machbarkeit (teilweise offen):** `eli/treaty` (~18 500) ist ein **anderer Namespace als `eli/cc`** mit potenziell anderem Markup. Ob `eli/treaty` dieselben `<article id="art_*">`-Strukturen liefert, ist **nicht verifiziert**. **Kein Bulk** — 18 500 Verträge sind zu 99 % kanzlei-irrelevant.

**P1-Umfang:** **kuratierte Auswahl** praxisrelevanter, heute fehlender Verträge (Kandidaten-Recherche nötig). Je Kandidat **POC-Fetch** (§7): extrahierbares HTML → `snapshot`; nur SPA-Shell → `pdf-embed` (wie EMRK/NYÜ); sonst `nur-live-link`. Andockpunkt `bund-stubs-generieren.ts` bzw. `pdf-embed.ts`.

**Abgrenzung:** Staatsverträge haben oft **keine artikelweise Konsolidierung**; Geltungsbereich/Vorbehalte je Vertragsstaat bildet die Norm-Snapshot-Struktur nicht ab — im Zweifel `pdf-embed` statt fehleranfälligem Struktur-Extrakt.

**Aufwand grob:** Recherche + POC ~0,5 Session; Bau je Handvoll ~0,5–1 Session. **Gesamt S–M.**

**§14-Intake:** ROADMAP-Schritt **W2·6**/**W3·13**, Detailquelle bestehende `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (dort verlinken, kein neuer FAHRPLAN). **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 4 — Staatsverträge (SR 0.*) — auf Backlog/opportunistisch (Moat-Kritik)**

**Priorisierungs-Korrektur (Moat-Kritik):** Paket 4 ist **reines Coverage-Padding, Null Moat** (Eigenurteil „Grenznutzen niedrig-mittel", Fedlex hat sie, Verlage kuratieren sie besser). **Keine Session dafür ausgeben, bevor der Norm-Kontext-Bus (B1) + Verzahnung existieren.** Bleibt letztes Paket; nur bei explizitem David-Entscheid vorziehen. Technisch das **sauberste** Paket (Refutation: „hier stimmt keine Doppelung wirklich").

**Ziel.** Kuratierte Ergänzung der International-Rubrik (heute 20 SR-0.*: 18 snapshot + 2 pdf-embed) um praxisrelevante fehlende Verträge, gleiche Qualität/Provenienz/Currency wie Bundesgesetze. **Kein Bulk** (18'500 `eli/treaty` zu 99% irrelevant).

**Quelle+Endpunkt (im Repo belegt).** Die 18 bestehenden Volltext-Verträge laufen **NICHT über `eli/treaty`, sondern über konsolidierte `eli/cc`-ELIs** — `fedlex-cache.sh:321` `cisg|cc/1991/307_307_307|…|0.221.211.1`, `:322 lugue|cc/2010/801|…`. Konsolidierte Staatsverträge = **selber Namespace + Markup-Vertrag** wie Bundesgesetze. **Königsweg = unveränderte bestehende Pipeline**, kein treaty-Extraktor. SR→ELI via `fedlex-eli-aufloesen.ts`; HTML via `fedlex-cache.sh`. `eli/treaty` **nur Fallback je Kandidat** (POC-Fetch, ob `dateApplicability`/`art_*`-HTML; [zu verifizieren durch Opus, nie generalisieren]).

**Extraktion — reine Wiederverwendung, keine neuen Skripte.**
- *Phase A Kuratierung (~0,5 Session):* Startliste [je Kandidat POC/Triage durch Opus]: HKsÜ 96 (0.211.231.011), HUnterhaltsÜ 2007 (0.211.213.02), ESÜ (0.211.230.01), Apostille (0.172.030.4), WÜD/WÜK (0.191.01/02), UNO-BRK (0.109), Istanbul-Konv. (0.311.35), EAUe (0.353.1), CMR (0.741.611), Montrealer Übk (0.748.411), EPÜ 2000 (0.232.142.2), RBÜ (0.231.15), DBA-DE (0.672.913.62). **Kritik-Korrektur (Finding 19):** Liste ist **nicht triagiert** — Risiko, dass ein Grossteil auf `pdf-embed`/`nur-live-link` fällt und der „gleiche Qualität"-Nutzen kleiner ausfällt als impliziert; auf ~6–10 kürzen mit dokumentierter Begründung.
- *Phase B POC je Kandidat (§7-Pflicht):* `eli-aufloesen --sr 0.x` → cc-ELI? → Filestore-HTML fetchen (`fetchMitWiederholung`) → `art_*`-Anker + Sanity → Triage: extrahierbar → `snapshot`; SPA-Shell/PDF → `pdf-embed`; sonst `nur-live-link`. Ergebnis je Kandidat mit Beleg (URL/Datum/Ankerzahl) dokumentieren.
- *Phase C Bau:* `snapshot` → Pin in `cache.sh` (Pflicht-Anker empirisch) → `extrahiere-fedlex.ts` (unverändert) → Registereintrag `bund(KEY,…,'0.x','international',lfd-Nr)`. `pdf-embed` → `PDF_EMBED`-Eintrag + amtliches PDF. Vor Extraktion Skill `scraping-swiss-official-sources` laden.

**DB-Schema.** **Kernentscheid: Staatsverträge sind ERLASSE, nicht Materialien** — schon heute `ErlassRegistereintrag`/`NormSnapshot`. Null neues Schema; landen bei E0 automatisch in `erlasse`/`artikel`/`erlass_fassungen`; `check:paritaet`/gegenpruefung-Globs greifen ohne Sonderfall (sauberste Andockung). Die `materialien`-Tabelle (E6b nennt „Staatsverträge") ist **nur für Begleitmaterialien** (Botschaft zum Vertrag = Paket 2) — Abgrenzung im Commit festhalten, damit E6b nicht doppelt baut. Kein Ad-hoc-Format.

**UI-Andockung.** **Kein neues UI.** Rubrik „International/Staatsverträge" existiert (`register.ts:67`); neue Einträge erscheinen automatisch in Systematik + Leser (Stand-Chip + `↗ geltende Fassung`) bzw. pdf-embed-Viewer. Reihenfolge hinter `STAATENLOSE` (108) fortführen. L0 (**Geltungsbereich-Anhänge/Protokolle nie stumm droppen** — LugÜ-Protokolle-Lektion), §1/§13/§15. `nur-live-link` → §8-Fallback-Stub-Muster.

**Verifikations-Tor.** Bestehende Tore greifen automatisch (`check:caches`, `check:fedlex-versionen`, `check:vollstaendigkeit`, `check:normtext`, `check:struktur-konsistenz`/`tabellen`/`bilder`/`confidence`/`pdf`/`pdf-netz`, `check:paritaet`). **[zu verifizieren durch Opus]:** ob `check:fedlex-versionen` für `eli/treaty`-Sonderfälle Consolidations findet — wenn nein, Kandidat NICHT als snapshot (pdf-embed/nur-live-link), Tor nie aufweichen. `check:gegenpruefung` Pflicht je Vertrag (Artikelzahl, Stichprobe-Wortlaut, Stand, Anhänge?) gegen amtliche Seite → `gegenpruefung:ok`. Playwright-Sichtprüfung (Desktop/mobil/Dark).

**Risiken.** Struktur-Untreue (fehlende artikelweise Konsolidierung, Vorbehalte/Geltungsbereich je Staat, mehrsprachig authentisch) = **Hauptrisiko** → Triage strikt „im Zweifel pdf-embed", Anhänge nie stumm (L0). `eli/treaty`-Markup unbekannt → nur Fallback, POC je Kandidat. Currency (Beitritts-Updates ohne neue Konsolidierung) → Restlücke dokumentieren (§8). Scope-Creep → harte Obergrenze, Mehrwert-Test §0.

**DoD.** Kuratierte Liste + Triage-Ergebnis je Kandidat in `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (kein neuer Fahrplan) · je Vertrag Pin/PDF_EMBED/Stub + Registereintrag + Snapshot · `npm run check` + `check:netz` + `check:gegenpruefung` grün · Playwright-Sichtprüfung, Anhänge gerendert oder als Hinweis+Link · kein neues Format/Skript · STRUKTUR.md + Fahrplan · §14 W2·6 · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: S–M** (Recherche+POC ~0,5 · Bau je Handvoll ~0,5–1). **Abhängigkeiten:** keine harte zu 1/2/5/3 (nur bestehende Gesetze-Pipeline). Botschaften ZU Verträgen (Genehmigungsbeschlüsse) = Paket 2. Baubar vor E0/E1.

---
