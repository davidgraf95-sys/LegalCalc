# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

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
