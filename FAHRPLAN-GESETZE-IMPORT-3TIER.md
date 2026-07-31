# FAHRPLAN — Kantonale Gesetze: 3-Tier-Import + Confidence-Quarantäne

**Auftrag David (22./23.6.2026):** alle kantonalen Gesetze sauber + klickbar auf
LexMetrik abbilden, OHNE jedes Gesetz einzeln prüfen zu müssen — besser als reines
PDF (klickbare Normen, Querverweise, mobil).

**Nordstern-Verankerung:** Breite (alle Kantone) ohne Davids Fach-Abnahme pro
Erlass → passt zur Abnahme-Zeitsperre bis 1.12.2026 (FAHRPLAN-LERNPHASE-2026.md
Strang A/B: Status-Marker + Verifikations-Infrastruktur, kein «geprüft» ohne David).

---

## 0. Ehrliches Verdikt zuerst (§8)

«Sauber + klickbar GANZ OHNE Prüfung» ist **nicht** erreichbar — empirisch belegt
durch den eigenen Korpus-Review (58/150 = 39 % mit Befunden). Erreichbar und ehrlich
ist: **maschinelle Treue-Gates + Confidence-Quarantäne** ersetzen den Fan-out
(1 Agent pro Gesetz) → der Mensch sieht nur noch die geflaggte Minderheit. Auto-
akzeptierte Imports bleiben Status «entwurf», nie «geprüft»/«verified» (§7/§8).

Rest-Review-Quote (Konsens der Workflow-Kritik): Tier A 5–10 %, Tier B 20–30 %,
Tier C 60–100 %; Gesamt-Floor **~25–40 %**. Das Gate misst **Quell-Treue**, nie
juristische Richtigkeit (= Davids nicht-delegierbare Abnahme).

---

## 1. Architektur: Entdeckung ⟂ Anzeige (der LexFind-Trick)

LexFind/clex sind **nicht-massgebende Komfortschicht**; massgebend bleibt die
amtliche kantonale Sammlung (Live-Link im UI, §7-Zitat-Ausnahme). Zwei entkoppelte
Schichten:

- **Entdeckung:** LexFind-API listet pro Kanton ALLE Erlasse + `original_url`.
- **Anzeige:** Normtext aus der amtlichen Quelle, nach Erschliessungsgrad gestuft:

| Tier | Quelle | Pfad | Render |
|---|---|---|---|
| **A** strukturiert | clex/LexWork `xhtml_tol`/`show_as_json` | bestehender `adapter-lexwork.ts` | getypter Baum, klickbare Normen, `uid`-Deep-Links |
| **B** PDF-extrahierbar | amtliches PDF | `adapter-pdf.ts`-Profile | HTML mit höherer Stichprobe |
| **C** PDF-embed | PDF/HTM ohne sichere Extraktion | — | Original-PDF eingebettet + Suchindex |

**Schlüssel-Befund (Phase 0, 23.6.2026):** clex *ist* LexWork/Sitrox. Der bestehende
`adapter-lexwork` erschliesst die clex-Kantone **ohne neuen Parser** (§10). AR lief
bisher nur auf PDF, weil seine Tarif-Zitate auf clex-PDF-URLs zeigen — über
`/api/de/texts_of_law/{sn}` ist es voll strukturiert.

---

## 2. Stand dieser Session (Branch `feat/gesetze-import-3tier`)

**Gebaut + getestet (rein, §2):**
- `scripts/normtext/confidence-logik.ts` — Treue-Invarianten (leerer Artikel,
  Fussnoten-Marker im Text, verklebte Tokens, Mojibake, Absatz-Lücke) +
  Kreuzdiff-Normalform + Token-Recall + Confidence-Score (Min-orientiert, harte
  Vetos). Tests: `src/tests/normtext-confidence.test.ts` (20).
- `scripts/normtext/lexfind-discovery.ts` — kantonsweite Enumeration via LexFind +
  reine Quell-Klassifikation (Host → Tier A/B/C) + clex-URL-Ableitung. Tests:
  `src/tests/normtext-lexfind-discovery.test.ts` (7).
- Recherche-Dossier `bibliothek/recherche/lexfind-clex-quellen.md` (+ INDEX, §11).

**Empirisch bewiesen:**
- Phase 0: clex `show_as_json` = getypter, absatzgranularer Baum mit `uid`-Ankern +
  separaten Fussnoten mit `law_link` (klickbare Querverweise).
- Tier-A-Pilot AR 146.1 via bestehendem Adapter: **35 Artikel sauber**, 0 Treue-
  Flags, **Confidence 1.000** → auto-live-fähig (entwurf).
- Discovery AR: **331 Erlasse in Kraft, alle 331 Tier A** (0 PDF-only).

**Phase 1 AUSGEFÜHRT für AR (23.6.2026):**
`npm run normtext -- --nur=kanton --kanton=AR --discovery --datum=$(date +%F)` →
**266 Gesetze / 6327 Artikel** strukturiert (Tier A, bestehender `adapter-lexwork`),
0 Fetch-Fehler; Register 150→491 Erlasse; Confidence 410/412 Auto-Akzept (100%),
2 Quarantäne; Status entwurf (§8); Gate grün. Generator-Wiring: `--discovery` +
`erzeugeKantonsSnapshots(inventarOverride)` + `kanton-discovery-quellen.ts`.

**NOCH offen (nächste Schritte):** weitere clex-Kantone (gleicher Befehl je Kanton);
`render_mode`/Tier-Badge im UI (golden-gegatet → §6-Protokoll); Kreuzdiff-Gate C
(Netz, `normalisiereVolltext`+`tokenRecall` gegen amtliches PDF); Tier B/C (PDF/embed)
für Nicht-clex-Kantone. Keine golden-Render-Komponente wurde geändert.

---

## 3. Nächste Phasen

**Phase 1 — EIN Kanton voll (AR) durch die echte Pipeline.**
- Routing: clex-Kantone über Discovery → `holeLexWork(host, lang, sn)` in den
  Snapshot-Generator (`normtext-snapshot.ts`) einklinken — Quelle nicht mehr nur
  tarif-zitierte Artikel, sondern der per Discovery enumerierte Vollkorpus.
- Generator-Lauf `npm run normtext -- --kanton=AR --datum=$(date +%F)` (§7-Build-
  Regel: Vollabdeckung, geltende Fassung, Provenienz, Drift-Token).
- `confidence-logik` als sechstes Gate: Runner `scripts/normtext/check-confidence.ts`
  → `public/normtext/confidence.json`; Schwelle gegen die 58 Befunde vom 22.6.
  kalibrieren (Akzeptanztest: das Gate MUSS sie wiederfinden).
- Kreuzdiff Gate: Struktur-Snapshot vs. amtliches PDF (`normalisiereVolltext` +
  `tokenRecall`), als separater `--netz`-Lauf (Cache, analog `fedlex-cache.sh`).
- `render_mode`/`tier` additiv an `ErlassRegistereintrag` (register.ts) +
  `BrowseErlass` durchreichen; `ErlassKarte`/`GesetzLeser` Render-Pfad-Auswahl,
  neuer `pdf-embed`-Modus — additiv, golden byte-gleich (§6).
- UI: Qualitätsstufen-Badge (Tier A/B/C · entwurf/geprüft) + Quelle/Stand (§8).

**Phase 2 — Bulk Tier-A-Kantone.** Discovery + Routing über alle clex/LexWork-
Kantone (AR/GR/SG/LU/FR/VS/BE/TG + clex-Geschwister). Nur Confidence-hoch auto-live,
Rest → Quarantäne. Re-Fetch-Welle (kantonsgefiltert) als Dauerprozess (Drift-Tor).

**Phase 3 — Tier B + C.** `adapter-pdf` für Nicht-clex-PDF; ZH/SZ/TI/GE/VD +
Gemeinde als eingebettetes Original-PDF + Suchindex. Tarif-/Tabellen-Erlasse
generell aus dem «kein-Check»-Versprechen ausgenommen (Layout pro Erlass, nicht
pro Toolchain).

---

## 4. Deine Idee «PDF-Vergleich → Markdown»

Im Kern goldrichtig — aber als **Prüf-Werkzeug**, nicht als Anzeigeformat:
- Der *Vergleich* gegen das amtliche PDF = das Kreuzdiff-Gate (stärkster Hebel,
  deckt sich mit der Doppelverifizierungs-Pflicht). Genau dafür ist
  `normalisiereVolltext` + `tokenRecall` gebaut.
- «→ Markdown» als Speicher-/Render-Ziel: **nein** — Markdown verliert Randtitel,
  verschachtelte Ziffern-Hierarchie, Fussnoten-Anker, mehrspaltige Tarif-Tabellen
  (genau die Schmerzklassen). Render-Modell bleibt der getypte Baum (Tier A) bzw.
  eingebettetes PDF (Tier C). Markdown/Plaintext nur als Diff-Normalform.

---

## 5. Anschluss an den Datenquellen-Denk-Brief

- **Fedlex Linked Data / ELI fassungsspezifisch** = Tier A für den Bund
  (ELI-Resolver `scripts/fedlex-eli-aufloesen.ts` existiert). SPARQL nur, wo
  Versionsketten abgefragt werden; sonst gepinnte Konsolidierung (XML).
- **Massgebend vs. nicht-massgebend + fail-loud** = das `authoritative`-/Status-
  Flag oben; harte Sperre, dass nicht-massgebende Daten nie in Zitat/Berechnung
  geraten. LexFind/MultiLegalPile = Komfortschicht.
- **Zuständigkeitsengine (Geo + Norm)** = eigener Strang (nicht hier). Schnittstelle:
  die Norm-Schicht (Gemeinde→Gericht aus GOG) zitiert über denselben Norm-Anker.

---

## §6 · ROADMAP-Spec W3·12 (wörtlich verschoben 31.7.2026)

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  **SLOT-ÜBERGABE 20.7.2026: dieser Schritt hält jetzt den 26×-Slot.** E3 (`W2·6-DATA`) hatte ihn seit
  3.7.2026 belegt, war aber am selben Tag fertig — der Slot wurde 17 Tage lang nur nicht zurückgegeben und
  hat W3·12 grundlos geparkt gehalten. Übergabe folgt der `@slot-kette` und Davids Reihenfolge-Entscheid
  2.7.2026 («E3 zuerst, W3·12 danach»); Blocker `26x-slot` damit aufgelöst, Status `parked` → `ready`.
  **Achtung Umfang (§8, keine Schönung):** «ready» heisst hier *slot-frei und startbar*, nicht *klein*.
  Dies ist ein 26×-Massenimport; er steht bewusst weit unten in Welle 3 und läuft **nicht** an Davids
  laufender Queue vorbei. Vor dem Start gilt Leitprinzip 4 (nie zwei 26×-Assets parallel).
  §14-gebündelt (Phase 0): führende Detailquelle
  `FAHRPLAN-GESETZE-IMPORT-3TIER.md`; **BS-Sofortfixes S1–S13** = `archiv/FAHRPLAN-BS-VORBILDKANTON.md`
  (**S1–S13 sind gebaut** — die Datei trägt hier nur noch die Leitplanke «korpusweiter Adapter-Hebel
  VOR jedem Bulk», keine offene Arbeitsliste); Volltext-Kanton = `archiv/FAHRPLAN-RECHTSSAMMLUNG.md` (P6).
  BS-Pilot; Kantonale-Entscheide-Import hart **nachgelagert**, nie gleichzeitig. *Werkzeug-Funde (Audit 1):
  LexWork-Adapter auf dieselbe DOM-Parser-Infra wie der linkedom-POC heben (strikt NACH dessen Bestehen, B5);
  `pdfplumber` (Python) NUR als nicht-lasttragendes Gegenprüf-Skript, falls die TS-PDF-Extraktion
  (pdfjs-Koordinaten) belegt versagt (B3) — kein Sprachwechsel am Produktpfad.*
  **Zubringer (12.7.2026):** `FAHRPLAN-KANTONE.md §K-G5` liefert Priorisierung
  (ZH→BE→VD→AG→SG→LU→GE), Kern-Erlass-Inventarquelle und §7-Quell-Menü-Auflagen
  (kein Headless, lexfind nur Fakten-Signal) — dort einhängen, kein Parallel-Schritt.
