# FAHRPLAN VORLAGEN-AUSBAU — Verträge-Rahmen, P1-Vorlagen, Rechner-Erweiterungen
<!-- @lagebild name: Schriften-Baukasten · zweck: Vorlagen für Berufung, BGG-Beschwerde, Sistierung, Beweisverzeichnis. -->

**Heimat: ROADMAP-Schritt `W2·8`.** (Der separat genannte `ROADMAP-Anker: W3·13`
unten betrifft nur die hier mitgeführte Bürgschaft/Ehevertrag/ABV-Planung, nicht
die Heimat dieser Datei selbst.)

> **§14-gebündelt (Phase 0, 2.7.2026):** **Einzige Planungs-Heimat für Bürgschaft/Ehevertrag/ABV**
> (V5/V6). Die entsprechenden `FAHRPLAN-VERTRAGS-VARIANTEN.md`-Punkte (F/H/I) sind nur Verweis.
> ROADMAP-Anker: `W3·13`.

**Quelle:** Wettbewerbsanalyse 12.6.2026
(`bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md`,
Auftrag David `PROMPT-wettbewerbsanalyse.md`). **Stand: IN ARBEIT**
(Abarbeitungs-Stand am Dokumentende) — jede Phase ist ein eigener, an
Claude Code übergebbarer Schritt. Davids P1-Abnahme der Analyse ist am
12.6.2026 erfolgt (`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`).

**Leitplanken (jede Phase):** Normentreue §7 (alle [VF]-Anker empirisch am
Fedlex-Cache, Unsicheres als `// VERIFY:`) · Determinismus §2 (kein LLM) ·
eine Engine pro Rechtsgebiet §4 (KEINE Fusion verschiedener Vertragstypen
in ein Schema; Varianten nur innerhalb desselben Typs) · SSoT §5 (Katalog
nur `startseiteConfig.ts`, Inhalt nur `src/lib/vorlagen/<schema>.ts`,
`ausgabeArt` NUR im Schema) · neue Einträge starten `geplant`, gebaut =
`entwurf`, NIE `geprüft` ohne Davids Abnahme · Form-Gate je Vorlage über
`ausgabeArt` (`fertig`/`abschrift`/`entwurf`) · Design R1–R12 bzw.
Wizard-Muster, neue Strings Halbgeviert/U+2019.

**Proof-Workflow vor JEDEM Commit (volle Ausgabe bei Rot):** `npx tsc -b` ·
`npm test` · `npm run golden:vergleich` · `npm run lint` · `npm run check`
(Routine grün: `npm run gate`). Golden-Erweiterungen (`npm run golden`) nur
mit Begründung im selben Commit. **Kein `git push`, kein Deploy ohne Davids
ausdrückliches frisches Ja (§9).**

**Reihenfolge-Begründung:** V1 zuerst (der Rubrik-Rahmen ist Voraussetzung,
damit neue Vorlagen sofort auffindbar einsortieren — Empfehlung des
Auftrags); dann V2 (kleinste P1-Vorlagen = schnelle Praxis-Treffer, testen
den BO-Baustein-Rahmen), dann V3 (Vertrags-Grundtypen, brauchen V1-Rubriken
4/7), dann V4 (Detailgrad-Schalter braucht gebaute Verträge als Pilot),
V5/V6 danach (Form-Weiche bzw. grosser Einzelposten), V7 unabhängig
(Rechner-Erweiterungen, jederzeit einschiebbar). Abhängigkeiten: V3→V1,
V4→V3 (Pilot Arbeitsvertrag geht schon nach V1), V5/V6→V1; V0 ist
Pflichtteil JEDER bauenden Phase.

---

## §0 · Zweck

Detailquelle zu `W2·8` — Verträge-Rahmen, P1-Vorlagen und Rechner-Erweiterungen
nach Wettbewerbsanalyse 12.6.2026. Leitplanken (jede Phase): Normentreue §7 ·
Determinismus §2 (kein LLM) · eine Engine pro Rechtsgebiet §4 · SSoT §5 · neue
Einträge starten `geplant`, gebaut = `entwurf`, nie `geprüft` ohne Davids Abnahme.

---

## V0 (Pflicht-Vorschritt jeder Phase) — Normrecherche

Je Vorlage/Erweiterung VOR der Implementierung: Formvorschrift + zwingende
Schranken am Fedlex-Cache verbatim verifizieren (`scripts/fedlex-cache.sh`,
`check:caches` vor `check:zitate`); Ergebnis als §11-Dossier-Ergänzung in
`bibliothek/` (bestehendes Wettbewerbs-Dossier um Verifikations-Vermerke
[VF]→[V Datum] nachführen oder eigenes Bau-Dossier je Typ). Offene Anker
aus der Analyse u. a.: Art. 141 OR rev. (Verzichtsdauer) · Art. 165 I OR ·
Art. 493 OR (Weiche-Details) · Art. 634 II ZGB (Erbteilungs-Schriftform,
Quelle widersprach) · Art. 8a III lit. d SchKG · Art. 243 I OR ·
Art. 184 ZGB · Art. 530 ff. OR · Art. 9 DSG.

## V1 — Verträge-Rubriken + Form-Gate-Anzeige (Rahmen, Ziel C)

**Ziel:** Sektion II skaliert: 7 Rubriken, Form-Gate auf der Karte sichtbar.
**Dateien:** `src/lib/vorlagenKategorie.ts` (VERTRAG_RUBRIKEN analog
EINGABE_RUBRIKEN) · `src/lib/startseiteConfig.ts` (`vertragRubrik`-Feld auf
allen `art:'vertrag'`-Karten) · `src/components/Katalog.tsx`
(VorlagenRegister: Rubrik-Block für Verträge, `<details>`-Mechanik ab >6
verfügbaren) · WerkzeugZeile-Vorlagenzweig: ausgabeArt-Mikrozeile (Quelle:
Schema-Lookup, kein neues Katalogfeld) · `src/tests/vorlagenKategorie.test.ts`
(Vollständigkeit: jeder vertrag-Eintrag hat Rubrik).
**Akzeptanz:** Golden byte-gleich (reine Darstellungs-Schicht §3/§6) · alle
bestehenden Verträge-Karten einer Rubrik zugeordnet · Vorlagen-Karten zeigen
druckfertig/Abschrift/Entwurf-Zeile (SSR-sicher: EIN Template-Literal) ·
e2e-Sichtprüfung Playwright · Test bricht bei Rubrik-loser Vertrags-Karte.
**Commit:** `feat(katalog): Verträge-Sektion in 7 Rubriken + ausgabeArt-Zeile auf Vorlagen-Karten (FAHRPLAN-VORLAGEN-AUSBAU V1)`

## V2 — Kleine P1-Erklärungen & Eingaben (4 Stück)

**Ziel:** Verjährungsverzicht · Forderungsabtretung · Fristerstreckungs-
gesuch · Löschungsgesuch Betreibungsregister — je EIN Schema, Status
`entwurf`.
**Dateien:** je `src/lib/vorlagen/<typ>.ts` (Schema, `ausgabeArt:'fertig'`,
`// Dossier:`-Kopf) · `startseiteConfig.ts` (4 Karten: 2× erklaerung, 2×
eingabe mit Rubrik gesuch_sonstige) · Wizard-Seiten nach bestehendem Muster
(`formatvorlagen.ts`/`vorlagen/engine.ts` unverändert) · ThemenEinstieg-
Verdrahtung: Verjährungsverzicht ↔ `verjaehrung`, Fristerstreckung ↔
`zpo-fristen` (Permalink-Spec zentral in `rechnerPermalinks.ts`),
Löschungsgesuch ↔ SchKG-Vorlagen-Sprung · Golden-Fälle je Vorlage +
norm-zitate-Prüfer + Konventionen-Test.
**Akzeptanz:** V0-Verifikate dokumentiert · `npm run gate` grün · Golden
NUR um neue Fälle erweitert (deklariert) · Zähler/Inventur-Test stimmig ·
Round-Trip der neuen Permalinks getestet.
**Commits (je Vorlage einer):** z. B. `feat(vorlagen): Verjährungsverzichtserklärung (Art. 141 OR verifiziert) — P1 Wettbewerbsanalyse (V2)`

## V3 — Vertrags-Grundtypen (Auftrag · Werkvertrag · NDA · Konkubinat)

**Ziel:** die vier P1-Verträge als Baustein-Wizards; Rubriken 4/7 werden
sichtbar.
**Dateien:** je `src/lib/vorlagen/<typ>.ts` + Karte (`art:'vertrag'`,
`vertragRubrik` 4/6/7) + Wizard; Werkvertrag: EckdatenKachel-Verweis auf
`gewaehrleistung` (R10) · Hydration-Guards für Wizard-Arrays (Pflicht).
**Akzeptanz:** wie V2; zusätzlich: KEINE geteilte Rechtsregel zwischen den
vier Schemas (§4 — gemeinsam nur engine/format-Infrastruktur).
**Commits:** je Typ einer, deutsch, mit Norm-Verweis.

## V4 — Detaillierungsgrad-Schalter (Pilot)

**Ziel:** «einfach ↔ ausführlich» als Wizard-Kopf-Schalter; Pilot
Arbeitsvertrag + Mietvertrag.
**Dateien:** `src/lib/vorlagen/arbeitsvertrag.ts`/`mietvertrag*.ts`
(ausführlich-Bausteine als zusätzliche `includeIf`; bestehende Bausteine
UNVERÄNDERT) · Wizard-Kopf-Komponente (geteilt, §10) · Golden: je Stufe
ein Fall — Basis-Stufe MUSS byte-gleich zum heutigen Output sein (Beweis,
dass der Schalter additiv ist).
**Akzeptanz:** Golden Basis byte-gleich · neue ausführlich-Fälle deklariert
· kein Katalog-Eintrag dazugekommen.
**Commit:** `feat(vorlagen): Detailgrad einfach/ausführlich für Arbeits- und Mietvertrag — additive includeIf-Bausteine, Basis golden-bewiesen (V4)`

## V5 — Form-Weichen-Vorlagen (P2-Start: Bürgschaft, Ehevertrag)

**Ziel:** ausgabeArt dynamisch aus Eingaben: Bürgschaft (Betrag/Personentyp
→ fertig↔entwurf, Art. 493 OR) · Ehevertrag (4 Güterstands-Varianten,
immer `entwurf`).
**Voraussetzung:** Engine-Unterstützung für eingabeabhängige ausgabeArt
prüfen — falls `engine.ts` sie nicht kennt, ZUERST verhaltensneutraler
Rahmen-Schritt (§10, golden-gegated), dann die Vorlagen.
**Akzeptanz:** Weiche empirisch je Pfad getestet (Golden-Fall pro Zweig);
§8: Entwurf-Zweig mit Wasserzeichen + Beurkundungs-Hinweis.
**Commit:** `feat(vorlagen): Bürgschaft mit Art.-493-Form-Weiche (ausgabeArt aus Eingaben) + Ehevertrag-Entwürfe (V5)`

## V6 — Aktionärbindungsvertrag (grosser Einzelposten, Sektion IV)

**Ziel:** ABV-Wizard mit Modulen Vorkauf/Stimmbindung/Mitverkauf/
Konkurrenzverbot; Karte `art:'gesellschaft'`.
**Akzeptanz:** wie V3; Verweis-Brücken zu ag-gruendung/Statuten-Mappe.
**Commit:** `feat(vorlagen): Aktionärbindungsvertrag — Baustein-Wizard Gesellschaftsrecht (V6)`

## V7 — Rechner-Erweiterungen (unabhängig einschiebbar)

**Ziel:** (a) Mittlerer-Verfall-Option im `verzugszins` · (b) Ferienlohn-
Funktion in den künftigen Ferien-Rechner (NUR falls David die ROADMAP-
Ferien-Karte freigibt) · (c) Nettorendite-Modul in `mietzinsanpassung`
(NUR mit deren Bau, ROADMAP Lücken-Rang 6).
**Dateien:** (a) `src/lib/verzugszins.ts` + Form (additiv; bestehende
Zweige golden-bewiesen unverändert).
**Akzeptanz:** Handrechnungs-Empirie je neuer Funktion; Golden additiv.
**Commit (a):** `feat(verzugszins): Option mittlerer Verfall — Praxis-Vereinfachung, exakte Methode unverändert (V7a)`

---

## Aufträge David 12.6.2026 (im Chat, nach Plan-Erstellung — eingeschoben)

1. **GO erteilt** («weitermachen», dann «einfach weiterarbeiten bis du
   unbedingt meinen Input brauchst») — V1 ff. laufen; Push/Deploy bleibt
   gesperrt bis frisches Ja.
2. **Blanko-Download-Grundsatz (Daueranweisung):** JEDE Vorlage ist auch
   direkt herunterladbar, ohne etwas auszufüllen; wo Informationen fehlen,
   erscheint ein leeres Feld (Blanko-Striche). → eigener Rahmen-Schritt
   **V2b** vor den Musterklagen-Masken (§10); neue Vorlagen ab sofort
   blanko-fähig bauen (oderBlank-Konvention in der Zusammenstellung).
3. **Musterklagen-Rubrik + Masken (neue Phase V8):** weitere Rubrik mit
   Musterklagen analog `~/Desktop/LexMetrik Knowledge/Musterklagen
   Vertrags- und Haftplfichtrecht` und `…/Musterklagen im Familienrecht`,
   dann die entsprechenden Masken bauen. NUR Struktur aus den Quellen
   übernehmen (Urheberrechts-Lektion der Familienrecht-Bauspez.);
   Familienrecht-Bauspez. liegt: `bibliothek/recherche/familienrecht-
   klagen-vorlagen.md`. IA-Anker: Behördeneingaben-Rubrik
   `klage_besonders` (nach klageGebiet gruppiert) bzw. neue Rubrik gemäss
   Quellen-Zuschnitt.

## Abarbeitungs-Stand 12.6.2026 (Session «Wettbewerbsanalyse + Musterklagen», David abwesend)

ERLEDIGT + committet: **V1** (Verträge-Rubriken + formGate-Zeile, 8a78ee2) ·
**V2.1** Verjährungsverzicht (0b21767) · **V2b** Blanko-Download-Rahmen alle
Einzel-Wizards (270007c; Mappen offen) · **Musterklagen M1**: Scheidungsklage
unbegründet Art. 290 ZPO (b3ba2dc; Karte klage_besonders/Familienrecht).
WEITER ERLEDIGT (Fortsetzung): **Bd.-I-Struktur-Dossier** §§ 1–25 in
bibliothek/recherche/musterklagen-vertrag-haftpflicht-bd1.md (bdebf6d;
4 Struktur-Agents, NUR Struktur) · **Gemeinsames Scheidungsbegehren**
Art. 285/286 ZPO (00f7931) · **Eheschutzgesuch** Art. 175 ff. ZGB +
10 GEPLANT-Karten der Musterklagen-Rubrik (7175a01). Familienrecht-Masken
3/3 der ersten Welle gebaut (Scheidungsklage · Begehren · Eheschutz).
NÄCHSTE SCHRITTE (V8-Fortsetzung): Masken für die geplanten Karten nach
Davids Priorisierung — Kandidaten-Reihenfolge nach Dossier-Praxiswert:
Bauhandwerkerpfandrecht-Gesuch (4-Monats-Gate!) → Arbeit-Kündigungsklage
(Synergie 336b-Engine) → Werkmängel → VVG → Honorar → 158-ZPO →
Konkurrenzverbot → Personenschaden → Abänderung/Konkubinat. Dazu V2-Rest
(NDA, Zession, Fristerstreckung, 8a-SchKG-Löschung), V3–V7.
Push/Deploy weiter gesperrt (Davids frisches Ja).

## Abarbeitungs-Stand 13.6.2026 (Session «Pauschal-Abnahme + V2-Rest»)

P1-Priorisierung durch David ABGENOMMEN 12.6.2026 («alles abgenommen»,
`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`). **V2 KOMPLETT
(4/4):** Verjährungsverzicht (0b21767) · **Abtretungserklärung/Zession**
Art. 164/165/167/170 OR (5d4ccf8) · **Fristerstreckungsgesuch** Art.
143/144/148 ZPO mit Frist-Art-Weiche + Vor-Fristablauf-Gates (fd10ff1) ·
**Nichtbekanntgabe Betreibung** Art. 8a III lit. d SchKG, Fassung
1.1.2026 (AS 2025 522) am Cache verifiziert, 3-Monats-Schwelle
deterministisch (3d1fc99). NDA gehört zu V3 (Vertrags-Grundtyp).
OFFENE FOLGEPOSTEN aus V2: (a) Ergebnis-Prefill-Brücke zpo-fristen →
Fristerstreckung (laufende Frist reist mit, G3); (b) VorlagenSprung im
SchKG-Zuständigkeits-Rechner bräuchte ein neues Anliegen «Löschung/
Nichtbekanntgabe» (Engine-Änderung, Entscheid David). NÄCHSTE PHASEN:
V3 (Auftrag · Werkvertrag · NDA · Konkubinat) → V4 ff.; parallel V8 nach
Priorisierung. Push/Deploy weiter gesperrt (Davids frisches Ja).

## Abarbeitungs-Stand 13.6.2026 (Session «V3 + Verwaltungs-/BGG-Stillstand»)

**V3 KOMPLETT (4/4 Grundtypen, je eigener Commit, Gate je GRÜN):**
**Auftrag** `41dccc3` (Art. 394 ff. OR; Module Beratung/Treuhand/Inkasso;
Auflösungsrecht Art. 404 offengelegt) · **Werkvertrag** `704aa85`
(Art. 363 ff. OR; Weiche beweglich/unbeweglich → Rügefrist 60 T zwingend
Art. 367 Abs. 1bis + Verjährung 2/5 J Art. 371; Brücke Gewährleistungs-
Rechner; Rücktritt Art. 377) · **NDA** `5aa4b62` (Innominat Art. 19 OR;
einseitig/gegenseitig + Konventionalstrafe Art. 160/161/163, Herabsetzung
163 III offengelegt) · **Konkubinat** `d081391` (Art. 19 OR / 646/650/651
ZGB / 530/548/549 OR; Module Wohnen/Kosten/Inventar/einfache Gesellschaft/
Auflösung; kein gesetzliches Konkubinatsrecht + Kindesbelange nach Gesetz
offengelegt). Alle V0-Anker am Cache verifiziert, check:zitate 0 Befunde.
Endstand: 47 gebaut/43 sichtbar, Golden 159, Routen 49.

**EINGESCHOBEN (Auftrag David im Chat):** Verwaltungs-Stillstand
(Art. 22a VwVG) + BGG-Stillstand (Art. 46 BGG) im einfachen Fristenrechner
— neue Engine `lib/bggVwvgFristen.ts`, Dossier `bibliothek/recherche/
stillstand-vwvg-bgg.md`. Gilt NUR für nach Tagen bestimmte Fristen;
Abs.-2-Ausnahmen je Regime; periodengleich zur ZPO (golden-bewiesen).

NÄCHSTE PHASEN: V4 (Detailgrad-Schalter, Pilot Arbeits-/Mietvertrag) ·
V5 (Form-Weichen Bürgschaft/Ehevertrag) · V6 (ABV) · V7 (Rechner-
Erweiterungen) · V8 (Musterklagen-Masken). Fachliche Abnahmen der
V3-Vorlagen + Stillstand-Wortlaut offen. Push/Deploy gesperrt (frisches Ja).

## Davids Entscheide vor Start (Entscheidvorlage)

1. ~~P1-Listen (Dossier Abschn. 5) abnehmen/kürzen — insbesondere Reihenfolge
   V2 vor V3.~~ ERLEDIGT: P1 abgenommen 12.6.2026 (Pauschal-Abnahme).
2. Teil-D-Neuzugänge: Bussenkatalog-Rechner · Baumabstand kantonal ·
   Liquidations-Mappe AG/GmbH (P2) — je rein/Hinweis/raus.
3. Ziel-C-Konzept (Dossier Abschn. 6): Rubriken-Schnitt, ausgabeArt-Zeile,
   Detailgrad-Pilot — Abnahme als Design-Entscheid (analog RECHNER-EINHEIT).
4. Arbeitszeugnis endgültig ✗ (Quellbefund stützt den Teil-D-Vorschlag).

---

## V8 — Zitat-Export & Fussnoten-Ausgabe (`W2·8`, Ideen-Intake 20.7.2026)

> **ROADMAP-Schritt:** `W2·8` (Schriften-Baukasten), Unterpunkt «Zitat-Export & Fussnoten-Ausgabe».
> Detailquelle zum inline verorteten Schritt (§14.1).

**Ziel.** Ein-Klick-Zitat in korrekter amtlicher Form plus Word-Fussnoten-Export einer
gesammelten Zitatliste — damit ein Zitat aus LexMetrik ohne Nachtippen in eine Rechtsschrift geht.

**Zielformen (deterministisch, §2):**

```
BGE 148 III 1 E. 2.3
BGer 5A_691/2023 vom 14.03.2024 E. 4.1
ECLI:CH:BGER:2024:5A_691.2023          (optional, aus ecli.ts)
```

### V8.1 · Trägerbestand (verifiziert, Repo-Stand 20.7.2026)

| Baustein | Fundort | Rolle |
|---|---|---|
| BGE/BGer-Formatierer | `src/lib/gerichtszitat.ts` | **die Zitierform** |
| ECLI-Minting | `src/lib/rechtsprechung/ecli.ts` | optionale Zusatzform |
| Zitat-Extraktion | `src/lib/rechtsprechung/zitat-extraktion.ts` | Fundstellen im Text |
| Kopier-Hook | `src/components/useKopieren.ts` | Ein-Klick-Weg |
| docx-Renderer (produktiv) | `src/lib/vorlagen/vorlagenDocx.ts` (`docx ^9.7.1`) | Fussnoten-Ausgabe |
| Zitierer/Rubrum-Bausteine | aus `W2·7` gebaut | Einbettung in Schriften |

**Feasibility 🟢 aus-Bestand — ehrlich:** es fehlt **nur ein dünner Renderer** (docx-Fussnoten
über die vorhandenen `gerichtszitat`/`ecli`-Ausgaben) plus die Verdrahtung an Entscheid- und
Norm-Ansichten. Keine neue Abhängigkeit, kein neues Fundament, keine neue Rechtsregel.

### V8.2 · Bau-Schnitt

1. **Zitat-Objekt** (rein, deterministisch): Entscheid/Norm → `{ kurzform, langform, ecli?, fundstelleUrl, stand }`.
2. **Kopier-Aktion** an Entscheid-Leser und Norm-Ansicht (`useKopieren`, kein neuer Zustand).
3. **Sammelliste** rein clientseitig, **nur Kennungen** — keine Mandatsbezüge, keine Freitexte
   (§8, Berufsgeheimnis; Werkzeuge bleiben zustandslos, CLAUDE.md §5).
4. **docx-Fussnoten-Export** über `vorlagenDocx.ts` — derselbe Assemble-Weg wie die Vorlagen (§5,
   kein zweiter Renderer).

### V8.3 · Bewusst NICHT

Kein Zitierstil-Konfigurator (eine amtliche Form, keine Hausstile) · keine Literatur-/
Kommentar-Zitate (Art. 5 URG, nur amtliche Quellen) · keine BibTeX/CSL-Schicht · keine
serverseitige Zitat-Bibliothek.

### V8.4 · DoD

golden byte-gleich · Zitierform **stichprobenweise gegen die amtliche Fundstelle geprüft** (§7 —
nicht gegen das Modellgedächtnis) · Tore grün. Trailer `Roadmap: W2·8`.

---

## §1 · ROADMAP-Spec W2·8 (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «V8 — Zitat-Export & Fussnoten-Ausgabe» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3` · `BGer 5A_691/2023 vom …`)
    plus **Word-Fussnoten-Export** einer gesammelten Zitatliste. **Baut auf** fertigem Bestand:
    `src/lib/gerichtszitat.ts` (deterministischer BGE/BGer-Formatierer),
    `src/lib/rechtsprechung/ecli.ts` (ECLI-Minting), `src/lib/rechtsprechung/zitat-extraktion.ts`,
    `src/components/useKopieren.ts`, `src/lib/vorlagen/vorlagenDocx.ts` (produktiver docx-Renderer, `docx ^9.7.1`) und dem
    bereits gebauten Gerichts-Baustein-Set aus `W2·7` (Zitierer + Rubrum). **Feasibility 🟢
    aus-Bestand:** nur ein **dünner Renderer** (docx-Fussnoten über die vorhandenen
    `gerichtszitat`/`ecli`-Ausgaben) + Verdrahtung an Entscheid- und Norm-Ansichten — keine neue
    Abhängigkeit, kein neues Fundament. Detail in `FAHRPLAN-VORLAGEN-AUSBAU.md`. **DoD:** golden
    byte-gleich · Zitierform stichprobenweise gegen die amtliche Fundstelle geprüft · Tore grün.
    Trailer `Roadmap: W2·8`.

---

## V9 — Vorsorgeauftrag-Ausbau (Nachtlauf 2./3.8.2026, unter `W2·8`)

**Ziel:** Fachliche Härtung der VA-Engine nach dem Befundregister der Grundlage
[bibliothek/recherche/vorsorgeauftrag-inhalte.md](../bibliothek/recherche/vorsorgeauftrag-inhalte.md)
(V-1…V-10, N1, F1/F2/F6).

**Gebaut (Branch `feat/va-ausbau-2026-08`):**
- B1 Golden-Ausbau additiv (+6 VA-Fälle) — Verhalten vor Umbau festgehalten (§6).
- B2 Ersatzpersonen strukturell wie Hauptbeauftragte (`typ`, optionale
  `bereiche`) + Vertretungsregel `einzeln|gemeinsam` (V02c/V02d, Muster
  `VmVertretung`).
- B3/B4 Norm-Korrekturen (V13-Widerruf Art. 362 Abs. 1 + Ergänzungs-Klausel
  V13b · Zitat-Präzisierungen V-3…V-10) · Gate-Umbau V-1/V-2 (Herabstufung
  juristische Person: Hinweis/Warnung statt contra-legem-Blocker) ·
  Datums-Warnung · Interessenkollisions-Hinweis (Art. 365 Abs. 2/3).
- B5 SSoT: `beurkundungsHinweis()` gestrichen → `NOTARIATE` +
  `berechneBeurkundung`; Zivilstandsamt-Zeile amtlich korrigiert (ZStV Art. 23a,
  Anhang 1 Ziff. 23 ZStGV: CHF 75 fix, «+30» gestrichen).

**DoD:** Tore grün · Golden-Änderungen einzeln deklariert · Gegenprüfung
bestanden · fachliche Abnahme David (Dossier neu generiert, unabgehakt) ·
kein Merge vor Davids Review. Trailer `Roadmap: W2·8`.

**Vertagt (bewusst NICHT in dieser Einheit):**
- **V9.1 Merkblatt/Beiblatt für die beauftragte Person** (Empfänger-Wissen
  Art. 363 Abs. 3, 364, 365, 367–369; nicht unterschriftsbedürftig,
  austauschbar) — braucht Mehr-Dokument-Rahmen in `vorlagenPdf`/`vorlagenDocx`
  (§10: erst Rahmen, dann Feature). Analog auch für die Patientenverfügung.
  Abwägung: Grundlage Ziff. 8.
- **V9.2 BGE 151 III 81 verifizieren** (BGE-Register-Status «zu verifizieren»)
  vor fachlicher Abnahme der Beurkundungs-Hinweise.
- **V9.3 `formel_extern` strukturell härten** (Gegenprüfungs-Befund B3,
  3.8.2026): Kantonale Beurkundungs-Tarife mit gesetzlichem Minimum/Stunden-
  rahmen (z.B. BE Art. 8a Abs. 1 GebVN: «mindestens 300 Franken») rendern heute
  als «nach Vereinbarung/Aufwand» — das Minimum erreicht die Nutzerin nie.
  Fix gehört in `notariatGrundbuch.ts`/`ngPostenText` + Stammdaten
  (`beurkundung.ts`: min/rahmen strukturiert statt Freitext-`hinweis`),
  betrifft Beurkundungs-Rechner UND VA-Seite. Eigener Risiko-Pfad-Auftrag
  mit kantonaler Norm-Verifikation.
- **V9.4 ZStGV in die Drift-Erkennung** (GP-Runde-2-Nebenfund L4, 3.8.2026):
  Die VA-Seite trägt neu den amtlichen Wert CHF 75 (Anhang 1 Ziff. 23 ZStGV,
  SR 172.042.110, Stand 11.11.2024) — ZStGV fehlt aber in
  `scripts/fedlex-cache.sh`, also keine automatische Drift-Erkennung (§7
  Zitat-Ausnahme, Merkmal d). Brisanz: Teilrevision der ZStGV in
  Vernehmlassung bis 15.10.2026 (`VERN-2026-32`). Pin ergänzen
  (Korpus-Werkstatt-Fläche).
- **V9.5 GP-Runde-3-Nebenfunde N1–N4 — ✅ GEBAUT 3.8.2026** (Branch feat/va-nachzuege-2026-08, GP bestanden inkl. Delta-Runde; Nebenfunde b/c der GP dokumentiert offen) (3.8.2026, alle NIEDRIG/MITTEL,
  UI-unerreichbar bzw. kosmetisch): N1 `datum` ohne `.trim()` geprüft
  (Whitespace-Datum umgeht B8-Zweig + Warnung; via UI nicht erreichbar) ·
  N2 V14-`begruendung` nennt noch «Ort» als Formbestandteil · N3 Doppelkomma
  bei `ort='Basel,'` · N4 Golden-Fall für den «Datum: ________»-Zweig
  (vorl:va-ohne-ort-ohne-datum) ergänzen. Ein kleiner Sammel-Schritt,
  löst neuen GP-Durchgang aus.
