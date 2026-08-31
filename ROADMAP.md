# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Die einzige Steuerungsquelle:** Reihenfolge + bau-jetzt vs. geparkt. Das *Wie* je Strang steht
> in der jeweiligen `fahrplaene/FAHRPLAN-*.md` (Detailquelle), der **Ist-Zustand/Deploy** in
> `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`.
>
> **Schritte nennen Ziel und Grenzen, nicht den Weg** (Vereinfachungs-Auftrag David 14.8.2026):
> verbindlich sind das Ziel, die Risiko-Klassierung und die genannten harten Auflagen — Reihenfolge
> im Schritt, Werkzeugwahl und Umsetzungsweg entscheidet die bauende Session selbst.
>
> **Gliederung = die sieben Baufelder** (Plan-Neuschnitt 29.8.2026, Auftrag David «radikal,
> Kontrolle abbauen wo nicht nötig»; löst den Council-Entscheid vom 3.7.2026 gegen eine
> ROADMAP-Restrukturierung ausdrücklich ab). Jeder Schritt trägt genau ein `feld:` — es sagt, auf
> welcher Code-Fläche er liegt, und ersetzt die früheren `kollision:`-Globlisten: **zwei Schritte
> desselben Felds laufen nie parallel, zwei verschiedener Felder immer.** Die Reihenfolge INNERHALB
> und QUER über die Felder steuert allein die `@queue`.

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** (`npm run plan:next`); blockierte/`[D]` überspringen.
2. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
3. **Markiere erledigt** (`plan:set … status=done`), Karten-Zeile in `STRUKTUR.md` nachziehen.
   Push/PR/Auto-Merge stehend freigegeben (§9: Merge nach `main` = Deploy; Sorgfalt VOR dem Merge).
   Commit-Trailer immer `Roadmap: <@meta id>`.
4. **Nur was steuert, bleibt hier.** Erledigt-Prosa wandert wörtlich in die
   [`ROADMAP-CHRONIK.md`](ROADMAP-CHRONIK.md), Detail-WIE in den verlinkten Fahrplan; je Streichung
   eine Begründungszeile in der Chronik. Grössen-Wächter: `struktur-rotieren.py --check`.

---

## Leitprinzipien (gelten immer)

1. **Amtliche Quellen, urheberrechtlich frei.** Inhalte ruhen **nur** auf amtlichen Werken
   (Art. 5 URG): Fedlex/kantonale amtliche Sammlungen, amtlich publizierte Entscheide + Regesten,
   amtliche Tarife/Verzeichnisse/Formulare, Botschaften/BBl. **Keine Kommentare/geschützte
   Sekundärliteratur.**
2. **Mehrwert-Test (§0).** Nur bauen/behalten, was echten Mehrwert über generische Werkzeuge
   liefert (sonst streichen + in `KATALOG-ROADMAP.md` begründen).
3. **Zeitsperre bis 1.12.2026.** Nur Arbeit, die (a) **keine Davids-Fachzeit** braucht `[OF]`
   und (b) die spätere Abnahme-Welle billiger macht. Kein `verified`/`geprüft` ohne David
   (§7/§8). `[D]` = geparkt, in der Abnahme-Warteschlange (nicht drängen).
4. **Eine Datensäule fertig führen.** Grosse Daten-Bulkläufe (Massenkorpora, Kantons-Import,
   Tarif-Tranchen) nie zwei gleichzeitig — die Reihenfolge steht als `dep` am Schritt, die
   Warnung bei belegter Fläche gibt `plan:next` (gleiches `feld` auf `wip`). *Ein P0-Bugfix an
   einem Asset ist kein Daten-Bulklauf.*
5. **Worktree-Isolation (§12)** bei jeder Parallel-Session; welche Schritte einander ausschliessen,
   sagt das `feld:`.
6. **Merge nach `main` ist der Deploy (§9, stehend freigegeben — Sorgfalt VOR dem Merge);** jeder
   verhaltensändernde Schritt golden-gegated (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind
   Invarianten über allen Feldern. **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.
7. **Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust** (CLAUDE.md §15): bei Konflikt
   gewinnt **immer die Treue**; jede Optimierung trägt eine Logikverlust-Bewertung.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** — die Recherche zu Schlichtungs-/Reduktionsfaktoren ist `[OF]` und **Teil von
  `W1·4`** (Entparkung 3.8.2026, David): erster Arbeitsschritt des Schrittes, kein Wartegrund.

<!-- @blockers
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
vps-bestellung-david: E3-Serving + E4-UI hängen an einer VPS-Bestellung (David, ~15 Min; Entscheid David 8.8.2026: «mach ich erst wenn UI noch optimierter wird» — bewusst zurückgestellt, nicht vergessen) — Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md` (PR #271). ECHTES David-Gate, kein Bau-Blocker. Bis dahin sind QS-DATA/W2·6-DATA nur im NICHT-VPS-Teil baubar (E0–E4 sind lokal fertig).
richter-analytik-gate: Richter-/Spruchkörper-Analytik (W3·15-RICHTER). GRENZE (20.7.2026): Filtern/Facette/Verlinkung sind FREI und gebaut (#309/#311); gesperrt bleiben allein RANKING und PROGNOSE. Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht, Persönlichkeitsschutz, richterliche Unabhängigkeit)
david-entscheid-org-umzug: QS-ORG-UMZUG — Repo-Transfer in eine Gratis-Organisation für die native Merge Queue (User-Konten haben keine); Infrastruktur-Entscheid mit ~1 h Nacharbeit (Vercel, Branch-Schutz, Secrets). Erst prüfen, ob der Auto-Nachzug (Checklisten-Zeile unter QS-AUTOMATIK) den BEHIND-Schmerz ausreichend dämpft (Entscheid David 7.8.2026: «B als Schritt, A parken»)
-->

<!-- @david-fragen
zgb-a36-anhang: Die ZGB-Gliederung zeigt 74 Artikel des Anhangs «Wortlaut der früheren Bestimmungen des sechsten Titels» bewusst NICHT (Alt-Kuration A36; es sind aufgehobene Alt-Fassungen, im Lesetext weiterhin vorhanden und verlinkbar). Deine Vorgabe 13.8. («Artikel-Ebene in allen Gesetzen») ist sonst korpusweit erfüllt. Sollen diese 74 Alt-Artikel AUCH in der Leiste erscheinen? Aufwand: eine Zeile. Empfehlung: Nein (Alt-Recht bläht die Navigation, Lesetext deckt es ab).
-->
<!-- ^ Offene Fragen an David OHNE eigenen blockierten Schritt (sonst gehören sie in @blockers).
     Das Lagebild liest diesen Block mechanisch (davidFragen, scripts/plan/bildDaten.ts) —
     beantwortete Fragen HIER löschen, dann verschwinden sie von der Seite (§5). -->

<!-- @queue: W2·13-KANTONE, W2·6b-MAT-FINMA, W2·11-DESIGN -->
<!-- ^ SSoT der Bau-Reihenfolge: plan:next wertet die @queue VOR der Dokumentreihenfolge aus;
     Integrität erzwingt check:plan Regel 8. Priorität ändern = NUR diese Zeile ändern.
     Ohne Queue-Eintrag entscheidet die Dokumentreihenfolge — Produkt-Felder stehen darum
     vor `Betrieb & Prüfstrasse`. -->

> **⬆ OBERSTER OFFENER SCHRITT: `W2·6b-MAT-FINMA`** — `W2·13-KANTONE` seit 31.8.2026 im Bau
> (wip, Worktree lexmetrik-kantone); W2·10-UI-NAV komplett gelandet 29.8.2026 (Chronik)
> (Risikopfad, eigene Session). Fokus-Dekret 24.7.2026 (David): die Gesetzesdarstellung steht im
> Vordergrund — Gesetzes-Schritte prioritär, daneben `W2·6b-MAT-FINMA` (Bewerbungs-Kontext FINMA).
> Wortlaute der Dekrete → `ROADMAP-CHRONIK.md`.

---

## Leser — Gesetzes-Darstellung  *(`feld: leser`)*

- [ ] **Gesetz-Leser V3 — Hülle neu, Kern unangetastet** *(`W2·5m-LESER-V3`, Auftrag David 16.8.2026)*
  <!-- @meta id: W2·5m-LESER-V3 · status: ready · blocker: null · dep: [] · feld: leser · fahrplan: fahrplaene/FAHRPLAN-LESER-V3.md -->
  Ziel: Leser-Oberfläche nach Apple-HIG-Prinzipien radikal vereinfacht; Kern (`ArtikelBody`,
  `ArtikelLeser`, Datenlogik) unangetastet, Golden byte-gleich. **Fertig, wenn** H1–H5 gelandet
  und die S-Etappen abgehakt sind. H1–H5 sind seit 21.8.2026 gebaut (Chronik).
  **Detail:** [FAHRPLAN-LESER-V3.md](fahrplaene/FAHRPLAN-LESER-V3.md) (Kurzfassung zuoberst; Kap. 7 Etappen H1–H5/S1–S4, Kap. 9 Fragen F1–F6).
  - [ ] **D0 · Farb-Vorarbeit** — Tailwind-Deckkraft-Klassen (`bg-brass-100/70`) erzeugen keine CSS-Regel; Wurzel-Fix + Rot-Beweis, eigener kleiner PR. Kap. 14.
  - [ ] **S1 · Historie-Modell** — «Änderungsvermerke: an/aus», bei «aus» keine Spur im Lesetext (Sichtbarkeits-Wächter §8) — **wartet auf F1/F2**. Kap. 7.
  - [ ] **S2 · Typografie + Artikel-Raster** — Variante nach Bildvergleich (**F3**), gleichmässige Abstände, CLS 0. Kap. 7/8.
  - [ ] **S4 · Kantons-Probe** — Kantonserlasse rendern unverändert (Fokus Bund, nichts bricht); der H2-Kontaktbogen deckt nur Bund ab. Kap. 7.
  - [ ] **Tor-Konflikt `erlassAnsicht.ts`-Deckel** *(§17-Wurzel-Fix, Befund 31.8.2026)* — `leser-v3-fundament` verlangt jede `.ebene`-Ableitung in `erlassAnsicht.ts` UND deckelt die Datei (421/420er-Grenze, muss unter `leserV3Modell.ts` bleiben); die nächste erzwungene Ableitung hat keinen Platz. Deckel neu kalibrieren oder Datei schneiden — Wurzel-Fix, kein Einzelfall-Umschiffen.

- [~] **Kantonale Gesetze — Darstellung & Suche** *(`W2·13-KANTONE`, Auftrag David 12.7.2026, `[OF]`)*
  <!-- @meta id: W2·13-KANTONE · status: wip · blocker: null · dep: [] · feld: leser · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Hier die NICHT-Risiko-Einheiten (reine Darstellung/Suche/Anzeige); Extraktion & Daten liegen in
  `W2·13-KANTONE-DATEN`. **Fertig, wenn** K-1 bis K-11 abgehakt sind.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [x] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5)* — ✅ 31.8.2026: F24 dokumentlinear (4 Erlasse inkl. Bund/KKV), F25 pathname-Decode (3 GL-Schlüssel geheilt), F5 fr/it (+38 Erlasse); F28/F33 waren seit 18.8. gebaut, F29 gegenstandslos (0 `*`-Vorkommen). §1-A + Ist-Stand-Block Fahrplan §2.
  - [x] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest)* — ✅ 31.8.2026: «Geltung ungeprüft» (interaktiv + prerendert, lebt-Gate), «Stand unbekannt», Kanton-Leerzustände der Panels, Systematik-Hinweis; F44 war seit K-2c gebaut. §1-A.
  - [x] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36)* — ✅ 31.8.2026: Edge-DTO additiv um ebene/kanton, Href + Kanton-Marke, Ebenen-Routing via Kantonskürzel-Regel (heilt auch chipZiel & Co.); Betriebs-Vorbehalt: Live-Turso braucht Spalten aus PR #313 (nach Merge geprüft). §1-A.
  - [x] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42)* — ✅ 31.8.2026: F41 (199 falsche Self-Links gesperrt, 0 nachher), F40 (3267 §-Links in 464 Erlassen), Bund byte-unverändert; F42 entfällt nach Messung (<1 % Ertrag, Falschlink-Risiko). §1-A.
  - [x] **K-11 · Kanton-Reader-Performance profilieren** *(F32)* — ✅ 31.8.2026 NUR gemessen: 50-s-Symptom nicht reproduzierbar, Blocker beziffert (753-KB-Register je Leserseite u. a.), Wächter-Route im Lighthouse-Tor, Dossier `bibliothek/seo/kanton-reader-profil-2026-08-31.md`; Fixes = eigener Schritt mit §15-Bewertung. §1-A.
  - [ ] **des/der-Guard Bund passus-tolerant** *(K-5-Ausläufer, Messung 31.8.2026)* — hätte 371 Self-Links in 226 **Bundes**-Erlassen entfernt ⇒ fachliche Änderung mit eigenem Schritt (§6.3), nicht golden-neutral; Caveat: die «über»-Alternative erzeugt echte Self-Verweise (VTS art_222j), 7 von 8 Stichproben der Kandidaten waren falsch.
  - [ ] **«§ N» in Fremdgesetz-Chapeau-Items verlinken** *(K-5-Lücke, 31.8.2026)* — `ArtikelBody` baut `fremdIntern` ohne `paragrafDesigniert`; dort bleibt «§ N» unverlinkt (konservativ, §1-konform — Nachzug klein).

- [~] **Verzahnung sichtbar machen** *(`W2·7-VZUI`, David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)*
  <!-- @meta id: W2·7-VZUI · status: wip · blocker: null · dep: [] · feld: leser · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik für die Verzahnung, ohne neue Rechtsregel (§3). Offen: V2 (E3-Serving)
  und V3 (E6a) — an den Datenstrang gekoppelt. **Fertig, wenn** die Panel-Reiter fachlich sauber
  geschnitten sind («Passende Werkzeuge» und `kontextSoftLaw` gehören nicht in «Materialien»)
  — ✅ **erfüllt 31.8.2026** mit dem vierten Reiter «Anwendung» (s. Checkliste). *(Quell-Zeiger
  berichtigt 31.8.2026: die Zeile nannte «Kontaktbogen H4 §7a»; dort steht die Vollzugs-Tabelle der
  B-Spec-Umhängung. Der Wortlaut steht in `archiv/fahrplaene/FAHRPLAN-LESER-V3.md` C6/W2·7-VZUI-Restzeilen.)*
  **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §11.
  - [x] **«Grundzustand ohne Zusatz-Fetch» ehrlich gemacht** *(31.8.2026; §13-Weg 2, Weg 1 gegenstandslos)* — nachgemessen: das §15-Versprechen ist am Ist-Stand **strenger** eingelöst als der Kommentar behauptete, nur an anderer Stelle. Die Ladeweiche ist das Panel-Gate (`usePanelBezuege`/`jeGeoeffnet`), nicht `istErweitert` (deren einziger Konsument ist der Hinweistext in `BezugFacettenWahl.tsx:106`); der schlanke `norm-index`-Shard wird im Gesetz-Leser seit H3/H4 gar nicht mehr geholt — der §13-Befund «beide Shards unterwegs» ist mit der V3-Hülle entfallen. Korrigiert: vier falsche Zusagen, darunter **ein sichtbarer Nutzertext** («steht am Artikel als eigene Linie … gezeigt werden fünf, ein Klick lädt die nächsten fünf» / «Weitere Instanzen laden zusätzliche Daten nach» — es gibt weder Artikel-Linie noch Fünferportion noch Nachladen). Tor statt Prosa: `e2e/leser-v3-prerender-bezuege.e2e.ts` bewacht jetzt **beide** Shard-Familien (rot gesehen 31.8.).
  - [x] **Ankunfts-Sprung `?norm=` nutzt beide Fundstellen-Regeln** *(Auftrag David 30.8.2026)* — `ankunftsAnker` (`src/pages/entscheidLeserRegeln.ts`): Fedlex-Fundstelle, sonst erste wörtliche Nennung; e2e-Deckung des SPLIT-Wegs neu (`e2e/split-erwaegungssprung.e2e.ts`). Gemessen über alle 75 365 Kanten: 46.6 % → 48.8 % (Bund 54.3 → 55.3 %, **Kanton 0.0 → 9.1 %**).
  - [x] **Panel-Reiter fachlich sauber geschnitten — vierter Reiter «Anwendung»** *(31.8.2026)* — die Behörden-Ressourcen (`kontextSoftLaw`) und die «Passenden Werkzeuge» hatten seit H3 keinen Ort mehr: sie gehören nicht in «Materialien» (dort steht die Entstehung), waren im V3-Panel aber ersatzlos entfallen. Neu `v3/PanelAnwendung.tsx` mit zwei Abschnitten (Behörden-Praxis · Werkzeuge) hinter demselben Panel-Gate wie die anderen Reiter. Bestand gemessen statt geraten: ARG = beide Abschnitte · DBG = nur Behörden-Praxis (Werkzeug-Karten geplant ⇒ §8-ausgeblendet) · OR = 15 artikelscharfe Gruppen, kein Kanten-Shard. Reiter-Leiste @1440 nachgemessen: 385 px in 350 px ⇒ 35 px Scrollweg (der Fall, für den H4-II sie scrollbar gemacht hat); @390 passt sie ganz. e2e `leser-v3-panel-anwendung.e2e.ts` (5 Fälle, 4× rot gesehen).
  - [ ] **Kantonaler Zitat-Resolver** — 9 674 kantonale Kanten haben weiterhin kein Sprungziel: `fedlexLinkFuerArtikel`/`normVerweiseImText` kennen nur Bundesrecht, und die wörtliche Regel greift nur, wo der Entscheid exakt `§ N <Kürzel>` schreibt. Nötig wäre eine Kürzel-/Alias-Tabelle je kantonalem Erlass **mit Kanton-Scoping** (ein «StG» in BS ist nicht das «StG» in ZH — ohne Scoping entstünde ein stumm falscher Sprung, §1). Risiko-Pfad Extraktion ⇒ eigener Schritt mit Gegenprüfung, nicht als UI-Nebenprodukt.

---

## Korpus — Gesetzes- & Materialiendaten  *(`feld: korpus`, durchgehend Risikopfad)*

> Jede Zeile dieses Felds berührt Extraktion oder amtliche Substanz ⇒ **Gegenprüfung Pflicht**,
> Beleg mit Norm + Link + Stand (§7), Korrektur nie in der Projektion, immer in der Pipeline-Quelle
> (§5), golden byte-gleich bzw. deklarierter Re-Bless.

- [ ] **Norm-Zeitmaschine + Fassungs-Diff** *(`W2·5g-ZEIT`, Ideen-Intake 20.7.2026)*
  <!-- @meta id: W2·5g-ZEIT · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» + visueller Diff zweier Konsolidierungen; harte Bau-Reihenfolge
  (a) POC → (b) AKN-XML Phase 1 + `G-HIST` → (c) Bau.
  **Detail:** [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §8.
  - [ ] **Tabellen in Gesetzen lesbar machen** — Beispiel-Defekt `/gesetze/kanton/BS-154.810#art-29`; Zellinhalte exakt wie Quelle, mehrdeutig ⇒ Block als Text belassen (§1). Grenze zu `K-7` beachten. [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §18.
  - [ ] **Mehrsprachiger Normvergleich DE/FR/IT** — Auslegungswerkzeug nach Art. 14 PublG; heute ist nur `de` befüllt. Regel aus `QS-FRIT-DRIFT`: **eId trägt nicht über Sprachen** — Abgleich über die Artikelnummer.

- [ ] **Schlusstitel/UeB/Anhänge (M13) + wortgenaue Fussnoten (M14)** *(`W2·5l-NORMTEXT-B2`)*
  <!-- @meta id: W2·5l-NORMTEXT-B2 · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md -->
  **Golden-Re-Bless erwartet** (additiv). Tragende Falle: Token-Kollision `disp_u1`/`art_1` — ohne
  eigenen id-Raum stiller Daten-Verlust.
  **Detail:** [FAHRPLAN-NORMTEXT-DARSTELLUNG.md](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md) §M13/§M14
  (§-Sigel nachgezogen 30.8.2026 — Regel 11 bindet).

- [ ] **Kantonale Gesetze — Daten & Extraktion** *(`W2·13-KANTONE-DATEN`, Aufteilung 8.8.2026, sortenrein)*
  <!-- @meta id: W2·13-KANTONE-DATEN · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Skill `korpus-werkstatt` + Gegenprüfung + golden byte-gleich; zwingende Binnenfolgen stehen an der
  Zeile. **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion)* — Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`. §1-A.
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22)* — pro Kanton eine Tranche; K-6a vor K-6d. §1-A.
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. §1-A.
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21)* — Schema nur additiv, Golden-Diff korpusweit offline. §1-A.
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s + Konsistenz-Tor. §1-A.
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR)* — nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**. §1-A.
  - [ ] **K-12 · Reports & kuratierte Listen** — lesend/planend; K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. §1-A.
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43)* — ZH/GE/VD/TI/SZ/NE/JU fehlen; Quell-Erhebung je Kanton empirisch und browserlos. §1-A.
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39)* — nur exakte Sammlungsnummer-Matches; Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau nachmessen. §1-A.
  - [ ] **PDF-Pfad liest Ziffern-Tarife falsch** *(19B-Nachtrag 13.8.)* — SG-3849-Wurzel: generisches «Art. N»-Muster greift auch in Querverweisen; Regel «Nr. XX.YY am Zeilenanfang» nötig. §1-A.
  - [ ] **Fassungs-Drift PDF-erfasster Snapshots unbemerkt** *(§17-Wurzel-Fix)* — `fassungsToken` ändert sich nicht bei neuer Portal-Fassung (SG-2808 hängt an 2808/2012, amtlich gilt 3863). Nötig: Tor `current_version.id` ↔ Snapshot. §1-A.
  - [ ] **Kern-Kategorie als Registerfeld statt Titel-Muster** *(§17-Wurzel-Fix, Gegenprüfung 31.8.2026 Befunde 1+2)* — heute entscheidet die zufällige Wortzusammensetzung («Handänderungs**steuergesetz**» trifft, «Gesetz über die Handänderungssteuer» nicht; 15 Erlasse tragen die Sache nur im Kürzel, Bestandsmuster lesen nur den Titel). Deklariertes Feld in der Pipeline-Quelle, Muster-Raten zurückbauen; dabei die David-Frage «Handänderungs-/Grundbuchabgaben = Kernklasse?» mitentscheiden lassen.
  - [ ] **Manifest-Sprache ehrlich + Dubletten** *(Befund Bau W2·13-KANTONE 31.8.2026)* — 37 fr/it-Erlasse als `sprache:'de'` deklariert (nur 2 korrekt ≠ de, §8); mehrere Erlasse doppelt im Manifest (FR-261.16-Notariatstarif, JU-Décret émoluments, TI-Legge tariffa giudiziaria, VS-Notariats-Règlement). Pipeline-Quelle fixen, nie die Projektion (§5).

- [ ] **Kantonale Snapshots gegen die Quellen nachführen** *(`W2·13-KANTONE-DRIFT`, Befund 2.8.2026)*
  <!-- @meta id: W2·13-KANTONE-DRIFT · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Der Bundes-Durchgang vom 2.8.2026 meldete **~28 kantonale Snapshots mit echter Inhaltsdrift** —
  bewusst ausgeklammert und **unverifiziert**. **Reihenfolge gegen `K-7`** beachten.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §3.

- [ ] **Kanton-Gesetze-Bündel** *(`W3·12`, GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6)*
  <!-- @meta id: W3·12 · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md -->
  Grosser Kantons-Massenimport. Nach Leitprinzip 4 die nächste zu führende Datensäule (Davids
  Reihenfolge-Entscheid 2.7.2026); erst öffnen, wenn keine andere Bulk-Tranche läuft.
  **Detail:** [FAHRPLAN-GESETZE-IMPORT-3TIER.md](fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md) §6.

- [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(`W2·6-DATA`, Council 2.7.2026)*
  <!-- @meta id: W2·6-DATA · status: ready · blocker: null · dep: [W3·12] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  Die Adapter befüllen ein libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion
  (Tor `check:paritaet`). **Heiss/Kalt-Grenze bleibt DAVID-GATE.** Die `dep` auf `W3·12` hält
  Leitprinzip 4 fest, das früher das Feld `26x`/`slot` trug (Kette 20.7.2026: E3 → W3·12 → E5).
  **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §14.
  **Merkposten:** `register.json` steht bei 97 % des 780-KB-gzip-Deckels — wer es weiter belädt,
  reisst `check:perf-budget`; Lösung ist eine eigene Projektion, nie das Anheben der Schranke (§8).

- [ ] **FINMA-Materialien prioritär + Verzahnung** *(`W2·6b-MAT-FINMA`, §14-Intake 24.7.2026)*
  <!-- @meta id: W2·6b-MAT-FINMA · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  FINMA-Rundschreiben/Wegleitungen als nächste Quelle der Materialien-Pipeline (Verweis-/
  Register-Ebene, kein Volltext-Nachbau). Kontext: Bewerbung David bei der FINMA.
  **Detail:** [FAHRPLAN-MATERIALIEN-VERZAHNUNG.md](fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) §10.

- [ ] **Watchlist & Änderungs-Signale** *(`W2·14-SIGNAL`, Ideen-Intake 20.7.2026)*
  <!-- @meta id: W2·14-SIGNAL · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert.» **Baut ausschliesslich auf vorhandenen Signalen**
  (Currency/Register/Wiedervorlage); Speicherung lokal, Werkzeuge bleiben zustandslos. Bau-Reihenfolge
  B1 → B2 → GER. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16.
  - [ ] **B1 · Statischer Änderungs-Feed** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister; nur der VORWÄRTS-Fall (`naechsteFassungAb`).
  - [ ] **B2 · Client-Watchlist** — localStorage-Liste gemerkter Normen, gegen Build-Artefakte geprüft; Rückblick-Flag gegen `fassungsToken`/`sha`, nie `geprueftAm`.
  - [ ] **GER · Gerichts-Delta mit ehrlicher Latenz** — Build-Zeit-Delta je Gericht/Norm; eigenes Verdikt, Import-Kadenz sichtbar (§8).

- [ ] **Korpus-Pflege: fehlende und fehlerhafte amtliche Substanz** *(`QS-KORPUS`, Fusion 15.8.2026)*
  <!-- @meta id: QS-KORPUS · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md -->
  Dach für die offenen Reparaturen an Normtext- und Rechtsprechungs-Korpus; je Zeile eine
  sortenreine Bau-Einheit. **Detail:** [FAHRPLAN-OFFENE-BEFUNDE.md](fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md) §1.
  - [ ] **`adapter-lexwork.ts:778` Fetch-Ergebnis unvalidiert** — Shape vor Verwendung prüfen.
  - [ ] **Bezüge-Kanten mit Phantom-Zitaten** *(Befund Split-Bau 30.8.2026, PR #582)* — 18 854 von
    75 365 Artikel↔Entscheid-Kanten nennen den Artikel im Entscheid-Snapshot gar nicht; Stichprobe
    `bge_148_V_265` trägt `«Art. 4 BGE»` in `zitierteNormen` (Extraktions-Artefakt). Wurzel im
    Bezüge-/Zitat-Generator suchen (Risikopfad, Gegenprüfung), nie in den Daten flicken.
  - [ ] **Geltende BMV in den Korpus aufnehmen** — Totalrevision `cc/2025/408` (gleiche SR 412.103.1) fehlt; Nutzer finden nur den historischen Text.
  - [ ] **scope/decl-Sektionen von 12 Staatsverträgen ingestieren** — 23 amtliche Sektionen liegen ausserhalb `div#annex`; golden-Diff erwartet (neue amtliche Substanz).
  - [ ] **Entscheid-Datumsfehler bereinigen** — `bge_151_II_475` trägt 1999 statt 2025; Register-Sweep nach weiteren Band/Jahr-Diskrepanzen.

- [ ] **`fza`/`cmr` NICHT-KANONISCH klären und kanonisch nachführen** *(`QS-CURRENCY-KANON`)*
  <!-- @meta id: QS-CURRENCY-KANON · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Bestandsdefekt auf `main`; erst Ursache klären, dann re-pinnen + regenerieren + §7-Verifikation.
  **Nullprobe zuerst** — `fedlex-cache.sh:368` pinnt `fza` bereits auf html-9, der Befund vom 2.8.
  könnte dafür erledigt sein. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §17.
  - [ ] **fedlex-frische.yml auf `--nur=bund` umstellen** — regeneriert heute sinnlos alle Kantone ohne LexWork-Token; Wurzel zweier Golden-Verluste.
  - [ ] **`gen:pdf-quellen --nur=kanton` nachfahren + `check:pdf-quellen` in den Tor-Block** — sonst driftet der amtliche PDF-Link still auf überholte Fassungen.
  - [ ] **`public/normtext/pdf-quellen.json` in eine Paritäts-Klasse aufnehmen** — kann heute byte-abweichen, ohne dass `check:paritaet` es sieht.
  - [ ] **`aufgehoben`-Flag ist golden-neutral (blinder Fleck)** — eine FALSCHE Aufhebungs-Markierung sieht kein Drift-Tor (§8).

- [ ] **FR/IT-Drift-Wächter Stufe 2** *(`QS-FRIT-DRIFT`, Stufe 1 gebaut 15.8.2026)*
  <!-- @meta id: QS-FRIT-DRIFT · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Erstlauf-Befund: OR, PatG und BewG weichen in fr/it real ab ⇒ **`eId` trägt nicht sprachübergreifend**.
  Dossier: [frit-drift-2026-08-15.md](bibliothek/register/frit-drift-2026-08-15.md).
  **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.1.
  - [ ] **WARTET AUF DAVID:** die 4 Fedlex-Fundstellen dem Fedlex-Betrieb melden? Empfehlung: ja — belegte Fehler in der amtlichen Publikation, Meldung kostet wenig.
  - [ ] Stufe 2: Abgleich über Artikelnummer statt eId; Vollausbau auf alle 227 Pins nach Laufzeit.

- [ ] **Normen-Monitor seit ≥5 Wochen rot — Wurzel-Fix** *(`QS-MONITOR-ROT`, Aktivierungs-Audit 14.8.2026)*
  <!-- @meta id: QS-MONITOR-ROT · status: ready · blocker: null · dep: [] · feld: korpus · fahrplan: fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md -->
  Rechtsstand-relevant: `normen-monitor.yml` 5/5 Läufe failure. Diagnose 14.8. — **das Rot ist ECHT**,
  der Monitor korrekt. **Detail:** [FAHRPLAN-OFFENE-BEFUNDE.md](fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md) §2.
  - [ ] LIK-Reihe 2026-05→2026-07 nachziehen (amtliche Werte ⇒ Gegenprüfung).
  - [ ] 10 ESTV-MWST-Snapshot-Drifts aktualisieren · AIG-Botschaft BOTSCHAFT-2025-3067 nachführen · VRV-Vernehmlassung VERN-2026-79 bereinigen.
  - [ ] **§17-Wurzel-Fix:** soft-law-Detektor prüft nur den ToC-Token, nicht das Publikationsdatum — Detektor zusätzlich auf `stand`-Wechsel, Token nur über cipherDisplay-Anker.
  - [ ] Sieben Materialien-System-Befunde (a)–(h) je mit eigenem Wurzel-Fix — Liste im Fahrplan-§.
  - [ ] Verfahrens-Gap Reparatur-Arm vs. Detektions-Arm: Kadenz/Reihenfolge entscheiden; die `check:netz`-&&-Kette zeigt nur den ersten Befund.

---

## Rechtsprechung  *(`feld: rechtsprechung`)*

- [ ] **Konsultieren-Klingen — Dach der Rechtsprechungs-Fläche** *(`W2·6`, `[OF]`, amtlich)*
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · feld: rechtsprechung · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Leitsatz David 16.8.2026 (dejure-Modell): **Nachweisdatenbank statt Volltextsammlung** —
  Fundstellen + Link auf die amtliche Quelle, Anbindung entscheidsuche.ch.
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13.
  - [ ] **Gerichts-/Behörden-Adressregister** — Lese-/Index-Schicht über die bestehenden Bestände, **kein Datenduplikat** (§5); Quelle `bibliothek/behoerden/`.
  - [ ] **Entscheid-Filter über die API — Richter + allgemeine Facetten** — eine Bau-Fläche (Turso-Schema + `api/suche.ts` + Facetten-UI); Risikopfad ⇒ Gegenprüfung. [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §7.
  - [ ] **Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** — deterministisch aus dem Zitat-Graph (§2 — kein Ranking-Modell); Merkposten LM-042 («ff.»-Sammelzitate) als Auflage. [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §10.
  - [ ] **Rechtsprechungs-Übersicht: P0-Rest + Korpus-Breite** — SG-Regeste-Rest und die Übersichts-/Facetten-Breite; **erst nach `W2·6-RESOLVER`**.

- [ ] **Kantonaler Norm-Resolver → Kantonalnorm-Buckets (P0-Kern)** *(`W2·6-RESOLVER`)*
  <!-- @meta id: W2·6-RESOLVER · status: ready · blocker: null · dep: [] · feld: rechtsprechung · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  `norm-index` füllt heute nur Bundesnorm-Buckets; der Resolver ist Voraussetzung der kantonalen
  Stufe. Risikopfad-Dach der Rechtsprechungs-DATEN.
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13.
  - [ ] **Richternamen gegen den Staatskalender auflösen** — abgekürzte Vornamen auflösen, Abgleich gegen den amtlichen Staatskalender; Extraktion/Personendaten = Risikopfad, nie raten. [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §8.

- [ ] **Sachgebiet-Facette an der Norm↔Entscheid-Kante** *(`W2·7-VZUI-SACHGEBIET`)*
  <!-- @meta id: W2·7-VZUI-SACHGEBIET · status: ready · blocker: null · dep: [] · feld: rechtsprechung · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  Deterministisch aus der amtlichen BGE-Bandnummer I–V (§2, keine Heuristik). Extraktion =
  Risikopfad ⇒ Gegenprüfung.
  **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §12.

- [ ] **Spruchkörper-Analytik** *(`W3·15-RICHTER`, bewusst freigabe-pflichtig)*
  <!-- @meta id: W3·15-RICHTER · status: blocked · blocker: richter-analytik-gate · dep: [] · feld: rechtsprechung · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Ausschliesslich deskriptive Spruchkörper-Muster; **keine Erfolgsquoten, keine Prognose über
  Personen** (§2/§8).
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §14.

---

## Suche & Datenhaltung  *(`feld: suche`)*

- [ ] **Datenhaltung / VPS-Gate** *(`QS-DATA`)*
  <!-- @meta id: QS-DATA · status: blocked · blocker: vps-bestellung-david · dep: [] · feld: suche · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  Trägt nur das David-Gate: E3-Serving + E4-UI-Panels hängen an einer VPS-Bestellung (~15 Min
  David). Der Datenhaltungs-BAU selbst liegt in `W2·6-DATA`.
  **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §13.

- [ ] **Ingest-Strecke ist in drei Tagen 3× langsamer geworden** *(`QS-DATA-INGEST-DRIFT`, gemessen 17.8.2026)*
  <!-- @meta id: QS-DATA-INGEST-DRIFT · status: ready · blocker: null · dep: [] · feld: suche · fahrplan: fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md -->
  `scripts/datenhaltung/suche.test.ts` reisst dadurch seinen Hook-Deckel. **Nicht der Deckel ist
  falsch, die Basis ist gewandert** (10.85 s → Mittel 31.4 s, Nullprobe-belegt auf `main`).
  **Wurzel-Fix, nicht Deckel-Anhebung (§17):** erst klären, WARUM die Strecke 3× teurer wurde.
  **Detail:** [FAHRPLAN-OFFENE-BEFUNDE.md](fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md) §3.

---

## Design & Oberfläche  *(`feld: design`)*

- [ ] **Design-Wärme & Atmosphäre** *(`W2·11-DESIGN`, Ultracode-Synthese 11.7., reine Token-Schicht)*
  <!-- @meta id: W2·11-DESIGN · status: ready · blocker: null · dep: [] · feld: design · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie nach §13; Normtext-Körper bleibt farbfrei, golden byte-gleich.
  **Detail:** [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5.
  - [ ] **Design-Qualitäts-Pass Gesetzes-Bereich** *(Auftrag David 21.8.2026, nach H5)* — fünf parallele Review-Blickwinkel (Typografie · Farbe/Themes · Header/Chrome · Layout/Hierarchie · Legal-Tech-Benchmark), je hell+dunkel, Desktop+Handy; Geschmacksfragen als Vorlage an David.
  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. §2 (D-6).
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. §2 (D-7).
  - [ ] **DESIGN-D8a · slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen.
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann Rest (D-8.2)** — ~50 Fundstellen; **Pilot zuerst**, nicht flip-reversibel, **nach D8a**.
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten; **nach D8b**.

- [~] **UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)** *(`W2·17-UI-BEFUNDE`)*
  <!-- @meta id: W2·17-UI-BEFUNDE · status: wip · blocker: null · dep: [] · feld: design · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  Externe Sichtprüfung, geschnitten nach Bauteil; alles reine Darstellungsschicht, Blocker zuerst.
  **Detail:** [FAHRPLAN-UI-BEFUNDE.md](fahrplaene/FAHRPLAN-UI-BEFUNDE.md) §24.
  - [x] **B6-N1 · LM-162: Ergebniskasten wächst mit dem Inhalt** — Entscheid David 8.8.2026; CLS-Budget trotzdem halten. §7.
  - [x] **B6-N2 · LM-164: «nicht erfasst» wird ausgewiesen** — **erledigt (überholt)** 30.8.2026: am gebauten Stand nicht mehr reproduzierbar (V1-Hülle gelöscht, kein Artikel trägt eine Rechtsprechungs-Zeile), §8-Substanz im V3-Reiter «Entscheide» bereits gebaut (drei Zustände, drei Sätze). Rest-Punkt am Panel-Öffner wartet auf David. §7.
  - [x] **B7-N1 · Scrim hinter Overlays (LM-010/LM-015)** — gebaut 30.8.2026 am «Ansicht ▾»-Menü (Regel: der Scrim folgt der Fokus-Falle, Ä52 bleibt); LM-010 erledigt (überholt) — das Rechtsprechungs-Panel ist seit Ä60 eine Spur neben dem Text, kein Overlay. Dunkelmodus-Fehler des Blatt-Scrims mitbehoben. §8.
  - [ ] **B8 · Menüinhalt, Zustandsanzeige, Scrollbereiche (K-03 + K-07)** — 10 Befunde (Blocker 1 · Hoch 3). §9. · **Blocker LM-061 vorgemessen 30.8.2026, wartet auf David:** News-Reihe verbirgt 2'588 px ohne Affordanz — der Bau würde den Entscheid D11 («angeschnittene Karte IST die Affordanz») revidieren. Messung + Bauform-Vorschlag im Fahrplan.
  - [ ] **B9 · Textsatz und Umbruch (K-12)** — 12 Befunde (Blocker 1 · Hoch 2). §10.
  - [ ] **B10 · Aktions-Anker, Symbolknöpfe, Trefferflächen (K-09b)** — 7 Befunde (Blocker 1 · Hoch 1). §11.
  - [ ] **B11 · Karten (K-04)** — 13 Befunde. §12. · **B12 · Eingabe-/Auswahlfelder (K-08a)** — 11 Befunde. §13.
  - [ ] **B13 · Zahlen-, Datums-, Zählformate (K-11)** — 12 Befunde. §14. · **B14 · Brotkrume/Kopfzeilen (K-19a)** — 8 Befunde. §15.
  - [ ] **B15 · Umschalter, Tabs, Akkordeons (K-06)** — 9 Befunde. §16. · **B16 · Seitengerüst/Inhaltsbreite (K-13)** — 8 Befunde. §17.
  - [ ] **B17 · Schaltflächen (K-09a)** — 8 Befunde. §18. · **B18 · Listen/Suche/Relevanz (K-19b)** — 8 Befunde. §19. · **B19 · Felder Detail (K-08b)** — 7 Befunde. §20.

- [ ] **Davids Alltags-Fehlerfunde** *(`W2·18-FEHLERBUCH`, stehender Sammel-Schritt, Entscheid David 8.8.2026)*
  <!-- @meta id: W2·18-FEHLERBUCH · status: ready · blocker: null · dep: [] · feld: design · fahrplan: fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md -->
  David sammelt Fehler aus der täglichen Nutzung formlos; Fix-Batch-Sessions arbeiten mehrere
  Positionen sortenrein ab. **Risikopfad-Funde gehören NICHT hierher**, sondern in den passenden
  Risiko-Dach-Schritt. Der Schritt bleibt stehen (nie `done`).
  **Detail:** [FAHRPLAN-OFFENE-BEFUNDE.md](fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md) §4 — dort die
  vollständige, wörtlich übernommene Befundliste (33 offene Positionen mit ihren Belegen);
  Such-/Navigations-Posten zusätzlich in [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §7.

- [ ] **Oberflächen-Qualität app-weit** *(`QS-UI`, reines UI/Design §13, kontinuierlich)*
  <!-- @meta id: QS-UI · status: ready · blocker: null · dep: [] · feld: design · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Kontinuierlicher Oberflächen-Pass (Fundament → Hierarchie → Politur), kein Einzel-Redesign.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §8.
  - [ ] Teilpass (e) Rest: Farbwelt-Baseline enger, axe von Stichprobe auf Flächendeckung; Restliste §2.3 Ziff. 6.

- [ ] **Aufräum-Item — zwei Restpunkte** *(`W2·9`)*
  <!-- @meta id: W2·9 · status: ready · blocker: null · dep: [] · feld: design · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  (a) A3 Kachel-Höhen (zur David-Abnahme geflaggt); (b) globaler Schalter «aufgehobene Normen
  ausblenden» nie gebaut. Abhaken bleibt David-Entscheid.
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20.

- [ ] **Bedienungsanleitung / Onboarding** *(`W2·16-ANLEITUNG`, §14-Intake 20.7.2026, bewusst spät)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · blocker: null · dep: [W2·16-INVENTAR] · feld: design · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Die Anleitung folgt dem Inventar (`dep`).
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §10.

---

## Werkzeuge — Rechner & Vorlagen  *(`feld: werkzeuge`)*

- [ ] **Prozesskosten-Cockpit Restbau** *(`W1·4`, Hauptmoat, ENTPARKT 3.8.2026 David)*
  <!-- @meta id: W1·4 · status: ready · blocker: null · dep: [] · feld: werkzeuge · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Ziel: Tarif-Modifikatoren an amtlichen Tarifen recherchieren (Risikopfad ⇒ Gegenprüfung), damit
  I2 bauen, dann Festsetzung/Dispositiv. Die Tarif-Tranche ist eine Datensäule nach Leitprinzip 4.
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.

- [ ] **Frist × Kosten verzahnen** *(`W1·5-PRAXIS`, Ideen-Intake 20.7.2026, UI-Orchestrierung)*
  <!-- @meta id: W1·5-PRAXIS · status: ready · blocker: null · dep: [] · feld: werkzeuge · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Weg** verketten
  (Frist → Kosten → Vorlage), reine UI-Orchestrierung ohne neue Rechtsregel (§3).
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.

- [ ] **Schriften-Baukasten** *(`W2·8`, VORLAGEN)*
  <!-- @meta id: W2·8 · status: ready · blocker: null · dep: [] · feld: werkzeuge · fahrplan: fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Berufung/BGG-Beschwerde/Sistierung/Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur
  Hinweis, Status «entwurf».
  **Detail:** [FAHRPLAN-VORLAGEN-AUSBAU.md](fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md) §1.
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** — Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3`); Formvorschriften bestimmen die angebotenen Exportformate (§8).

- [ ] **Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(`W2·16-INVENTAR`, §14-Intake 20.7.2026)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · blocker: null · dep: [] · feld: werkzeuge · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Ehrliche Aufnahme dessen, was LexMetrik heute kann — Quelle `startseiteConfig.ts` (§5),
  Status-Modell ungeschönt (§8).
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §9.

- [ ] **Welle-3-Ausbau: Rechner · Fedlex · Vorlagen · UI** *(`W3-AUSBAU`, Dach der Fusion 15.8.2026)*
  <!-- @meta id: W3-AUSBAU · status: ready · blocker: null · dep: [] · feld: werkzeuge -->
  Vier Horizont-Stränge unter einem Dach, opportunistische Reihenfolge; **je Zeile eine sortenreine
  Bau-Einheit** (Flächen nie in EINER Session mischen).
  - [ ] **Neue Rechner-Klingen** — Zustellfiktions-Engine · Gesellschaftsrechts-Schwellen (OR 727/671/653s) · IGE-Gebühren · Geltungsstand-Prüfer · Kantonale Gerichtsferien-Datenschicht. **Erster Arbeitsschritt:** Restpunkte-Extraktion aus `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3 in einen aktiven Fahrplan (deklarierte Archiv-Ausnahme).
  - [ ] **Gesetzgebungs-/Rechtsetzungs-Tracking** — Übersicht «was kommt»: Parlamentsgeschäfte, künftige-Fassungen-Drift, laufende Vernehmlassungen, Laufend-Badge im Reader-Kopf. `fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3`.
  - [ ] **Vorlagen-Breite** — Tiefe vor Stückzahl: GmbH qualifizierte Gründung (777c II) · Musterklagen · Basistypen (Kauf/Schenkung/Pacht/Darlehen/Bürgschaft). [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10.
  - [ ] **Gemeinde-Validierungsliste (BFS eCH-0071)** — Build-Time-Snapshot mit gepinntem Stichtag; prüft Ortseingaben als **Hinweis**, nie als Blockade (§8).
  - [ ] **QR-Zahlteil (`swissqrbill`, MIT)** — gebunden an die Existenz einer Zahlungs-Vorlage; browser-seitig, deterministisch; §15-Bewertung vor Aufnahme.
  - [ ] **PDF/A-2b-Export vorbereiten** *(Wiedervorlage 1.1.2027)* — BEKJ tritt 1.7.2027 in Kraft, `jspdf` erreicht PDF/A-2b nicht → Export-Schicht-Umbau mit Vorlauf.
  - [ ] **Multi-Pane / Split-View** *(Fundament-Umbau, eigener Worktree §12; Auftrag David 29.6.2026)* — Restposten B3 Scroll-Positions-Wiederherstellung + Tastatur-Pane-Wechsel · Bündel S · 3 a11y-Restpunkte. [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.

- [ ] **Eigenschafts-Tests (property-based) für die Rechen-Engines** *(`QS-CODE-PROP`, Entscheid David 7.8.2026)*
  <!-- @meta id: QS-CODE-PROP · status: ready · blocker: null · dep: [] · feld: werkzeuge · fahrplan: fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md -->
  Runde 1 ist gebaut (12 Engines, 81 Invarianten, kein Engine-Defekt — Chronik). Offen bleiben ein
  Korpus-Defekt und zwei fachliche David-Fragen.
  **Detail:** [FAHRPLAN-OFFENE-BEFUNDE.md](fahrplaene/FAHRPLAN-OFFENE-BEFUNDE.md) §5.
  - [ ] **`nichtKonsolidiert`-Marker bei Staatsverträgen falsch-positiv (FZA)** — Wurzel-Fix: AS-Fundstelle im Konsolidierungs-XML als Konsolidiert-Beleg werten; Gegenrechnung über alle 87 Marker.
  - [ ] **WARTET AUF DAVID (fachlich, §7):** SF-F1 (Art.-63-Verlängerung bei gehemmter Frist?) und SF-F2 (Wartefrist-Ablauf in den Betreibungsferien) — Katalog-Zeilen «fachlich vorzulegen».

---

## Betrieb & Prüfstrasse  *(`feld: betrieb`)*

> Dieses Feld steht bewusst zuletzt: ohne `@queue`-Eintrag entscheidet die Dokumentreihenfolge,
> und dann soll ein Produkt-Schritt gewinnen, nicht ein Prozess-Schritt.

- [ ] **Effizienz-Dauerauftrag (Token/Prozess)** *(`QS-EFFIZIENZ`, stehender Auftrag David 14.8.2026)*
  <!-- @meta id: QS-EFFIZIENZ · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-EFFIZIENZ-CHECKLISTE.md -->
  «bau immer weiter an dingen die bei zukünftigem bau token sparen … bis ich stop sage»: fortlaufende,
  serielle Kleinschritte an Skills/Hooks/Toren/Steuer-Doku; je Punkt eigener Commit/PR, Grenzen
  unverändert (§1, Abnahme, Risiko-Gegenprüfung).
  **Detail:** [FAHRPLAN-EFFIZIENZ-CHECKLISTE.md](fahrplaene/FAHRPLAN-EFFIZIENZ-CHECKLISTE.md) §1 —
  die Checkliste liegt seit 29.8.2026 dort statt hier (sie war eine Merge-Konflikt-Falle: 6 Konflikte
  in EINER Zeile bei 15 PRs).

- [ ] **Automatik-Gesundheit** *(`QS-AUTOMATIK`, `[OF]`)*
  <!-- @meta id: QS-AUTOMATIK · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  Läuft unsere Automatik wirklich, und würde sie scheitern können? Offen: Turso-Wächter-Abdeckung +
  Wachstums-Schwellen.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §1.

- [ ] **Basis-Ausbau — Fundament** *(`QS-BASIS`, `[OF]`)*
  <!-- @meta id: QS-BASIS · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  CI/lokal-Tor-Parität + offene B-Einheiten.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
  - [ ] **`main.tsx` nutzt `createRoot` statt `hydrateRoot`** — prerendertes DOM wird 27–78 ms nach `load` verworfen (Nullprobe auf main bestätigt); Wurzel der «flaky» Tastatur-/Skip-Link-Specs und ein CLS-/TTI-Posten. Fix mit Hydrations-Fehler-Wächter, Vorher/Nachher-Messung, Gegenprüfung, eigener PR.
  - [ ] Totcode-Meldung wird echtes Tor `check:tot` — blockierend bei NEUEN Meldungen (Basis: 1). §3.2.
  - [ ] Dependency-Frische: `npm audit` + Majors + knip-Unlisted als Meldung, nie Stopper. **Lockfile nur über `npx npm@10`.** §3.3.
  - [ ] tailwind 3→4-Migration (PR #503; ~249 className-Dateien visuelle Regression — kein Dependabot-Merge).
  - [ ] Dependabot-Lock-Wurzelfix: npm-Major-Mismatch erzeugt fehlende genestete Einträge (H-8-Muster) — Weg finden, der den Lock automatisch mit npm@10 nachzieht.

- [ ] **Adversariale Gegenprüfung — Restkampagne + Werkzeug-Härtungen** *(`QS-GP`, `[OF]`)*
  <!-- @meta id: QS-GP · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  Offen ist Baustein d (rückwirkende Kampagne, Stufen 2–3 + BGE-Korpus-Regenerierung).
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §2.
  - [ ] `check:prerender-golden` als Opt-in-Beweiswerkzeug (nicht im Pflicht-Gate) — der Seiten-Byte-Gleichheits-Beweis ist heute Handarbeit. §3.2.
  - [ ] Verdikt-Prüfung vor dem Push (lokaler pre-push-Hook) — spart den 11-Minuten-CI-Umweg; einmal rot zeigen (§6.7). §3.3.
  - [ ] Vier Härtungen aus Gegenprüfungen: (a) fedlex-Extraktionsschicht Risiko-klassieren; (b) `leakErkannt` ohne Konsument; (c) `trenneInterneTitel` unterläuft `PARTEI_RE`; (d) `check-merge-schutz.ts` diffs ohne `-z`/`--no-renames`. **b/c Risikopfad ⇒ Gegenprüfung**; je Punkt Rot-Beweis. §3.6.

- [ ] **Status-Marker-Audit + Verifikations-Infrastruktur** *(`LERNPHASE-AB`, `[OF]`)*
  <!-- @meta id: LERNPHASE-AB · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  Jede Karte/Engine trägt sichtbaren ehrlichen Status + Stand; Golden-Abdeckung und
  Norm-Anker-Prüfung automatisieren.
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §1.

- [ ] **SEO/A11y** *(`SEO-A11Y`)*
  <!-- @meta id: SEO-A11Y · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  A11y zahlt auf Bedienbarkeit ein → begleitendes Tor (Tabellen-Semantik, Tastatur-e2e, hreflang).
  Reines SEO bleibt geparkt.
  **Detail:** [FAHRPLAN-SEO-A11Y-GOVERNANCE.md](fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md) §4/§5
  (§-Sigel nachgezogen 30.8.2026 — Regel 11 bindet).

- [ ] **Geräte-Last / Performance** *(`QS-PERF`, `[OF]`)*
  <!-- @meta id: QS-PERF · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  Nicht merklich langsamer, ohne Logikverlust (§15). Offen: M-Daten-Pfad (9,5-MB-`register.json` ist
  der lohnendste Hebel) + Render-/Split-View-Feinschliff. Der **Erst-Render des OR braucht 8,4–17,2 s
  bis zur Bedienbarkeit** (vermessen 17.8.2026, Nullprobe auf `main` 6/6 rot) — das ist die Wurzel
  des Shard-7-Rots und der Fix gehört hierher, nicht in eine Spec-Anpassung.
  **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §1 (dort seit 29.8.2026
  auch die vollständige Messreihe und der Reader-Kopf-Reflow-Befund, wörtlich aus der ROADMAP).

- [ ] **Optimierungs-Research Juli 2026** *(`QS-OPT`, `[OF]`)*
  <!-- @meta id: QS-OPT · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Betriebs-/Tor-/Bau-Optimierungen ohne Rechtsinhalt (O-Reihe); keine Massnahme kürzt Beweis, Tor
  oder Prüfung.
  **Detail:** [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.

- [x] **Vorschlags-Autopilot (Entwurfs-PRs aus der Messreihe)** *(`QS-AUTOPILOT-STUFE1`)*
  <!-- @meta id: QS-AUTOPILOT-STUFE1 · status: done · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md -->
  David: «stufe 1 ja», gebunden an ≥ 5 Snapshots; Stufe 2/3 NICHT freigegeben. Cron fährt `retro:17`,
  eröffnet Entwurfs-PR, kein Auto-Merge.
  **Detail:** [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md) § «Selbstoptimierender Bau».

- [ ] **Repo in eine GitHub-Organisation überführen (Merge Queue)** *(`QS-ORG-UMZUG`)*
  <!-- @meta id: QS-ORG-UMZUG · status: blocked · blocker: david-entscheid-org-umzug · dep: [] · feld: betrieb -->
  Erst, wenn der Auto-Nachzug (Checklisten-Zeile unter `QS-AUTOMATIK`) nicht reicht.
  **Detail:** [entregulierung-2026-08-07.md](bibliothek/betrieb/entregulierung-2026-08-07.md).

---

## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3)* — Mandats-/Dossierverwaltung & «Meine
  Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless. Umfasst auch das nie gebaute
  schlanke URL-Kontext-Rückgrat (PRODUKTAUSBAU P2) samt Bau-Auflagen — Detail
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
- **Betriebs-Instrumente (später):** Sentry (erst bei Traffic) · CodeQL · Claude-Code-PR-Action —
  Detail + Verworfen-Liste: `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`.
- **L-3 (Auto-Default-Umkehr ZGB/OR)** — hinter David/Council-Gate, nicht gebaut; L-1/L-2 gebaut,
  L-4 entfällt (Chronik). V2 §2 F4.
- **Abnahme-Warteschlange** (Haftungsrang: 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge; aufgereiht,
  nicht gedrängt): BGER-RECHTSWEG (§7) · BEURKUNDUNGS-AUSBAU · NOTARIAT/LUECKEN (`geprüft`) ·
  GESETZESTEXT-POPUP-Snapshots · GRUNDLAGEN G2/B.
- **Offene David-Grundsatzfragen** (gebündelt mitführen): Dienstjahr-Stichtag Kündigungsfrist ·
  Sperrtage-Konvention · 3 Export-Antworten · GebV-SchKG-Promille-Rundung (0.01 vs. amtlich 0.05).

---

## Pflege & Termine  *(Quelle: `bibliothek/register/parameter-verfall.md`)*

- **Anfang Sept.** — Referenzzins (quartalsweise). · **1.11.2026** — BE-Formularpflicht.
  · **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 vs. Staffel 1.1.2022.
  · **Vor Mietvertrags-Abnahme** — VMWG Art. 19a am Original. · **Feiertage** je Kanton vor
  «geprüft» (BJ-Liste Stand 2011).
- **1.1.2027 — Ganz-Aufhebung `PatV` (SR 232.141) und `VGV` (SR 814.621).** Beide sind in
  `scripts/fedlex-cache.sh` gepinnt und werden per 1.1.2027 **vollständig aufgehoben** (amtlich
  angekündigt). Massnahme am Stichtag: Snapshot ersetzen/entfernen, Nachfolgeerlass prüfen (§7/§8)
  — ein ausgeliefertes Gesetz, das es nicht mehr gibt, ist der schwerere Fehler als eine Lücke.
  **Bereits erfolgt:** `BMV` (SR 412.103.1) aufgehoben 1.3.2026 (#287/#422); **Nachfolger
  `cc/2025/408` fehlt noch im Korpus** → Schritt `QS-KORPUS`.

---

## Nachschlagewerke (steuern nicht)

- **Funktions-Katalog** (18 Werkzeuge: Welle · neu/vorhanden · §2 · Quelle · Aufwand) und die
  Kern-Auflagen je Werkzeug stehen wörtlich in
  [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §1 — Bau-Auflagen, keine Steuerung:
  vor dem Bau des jeweiligen Werkzeugs lesen. Dieselbe Datei ordnet in §2 die offenen Detailpunkte,
  das Infrastruktur-Fundament und das Klein-Backlog.
- **Restpunkte der Archiv-Welle 31.7.2026** (20 `FAHRPLAN-*.md` verify-then-archive) — wörtlich in
  [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md), je Strang ein § (§1–§20).
- **Token-Ökonomie-Fundament** (Baseline, Steuer-Doku-Diät, Dispatch/Prozess, Werkzeuge/Output,
  Code-Struktur) — wörtlich in [`archiv/fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md`](archiv/fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md);
  am 29.8.2026 ins Archiv gezogen, weil kein offener Schritt mehr darauf zeigt — der laufende
  Auftrag ist `QS-EFFIZIENZ`.
- **Etikett-System (`@meta`/`@queue`/`@blockers`) und Tor-Regeln** —
  [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md).
