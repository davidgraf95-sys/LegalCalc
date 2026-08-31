# FAHRPLAN — Kantonale Gesetze & Darstellung (Ultracode-Synthese 12.7.2026)
<!-- @lagebild name: Kantonale Gesetze · zweck: Die kantonalen Erlasse so sauber darstellen und sichern wie das Bundesrecht. -->

> **ROADMAP-Schritt:** `W2·13-KANTONE` (Welle 2, hinter den laufenden Reader-/Verzahnungs-Strängen).
> **Auftrag David 12.7.2026 (wörtlich):** «recherche mit ultracode zu kantonalen gesetze und
> deren darstellung und setze befunde um».
> **Quelle:** Ultracode-Recherche 12.7.2026 — 44 Befunde **F1–F44** (Register-/Korpus-Zählungen ·
> Live-Abgleiche gegen Amtsquellen bgs.zg.ch/bgs.so.ch/ar.clex.ch · Playwright-Proben gegen Prod ·
> Code-Lektüre Reader/Suche/Adapter) plus 3 adversariale Kritik-Linsen: **regel-treue** (42
> Verdikte, 0 Streichfälle, 1 Massnahme ersetzt, 5 Bündelungen), **beleg-haerte** (10 Befunde
> selbst re-verifiziert, davon 4 live an der Amtsquelle; 4 Korrekturen), **praxis-roi**
> (8 Repo-Spot-Checks, alle bestätigt; Bündelung + Priorisierung).
> Dieses Dokument ist die **Synthese**: Verdikt-gefilterte Befunde, zu Bau-Einheiten gebündelt
> (§14.2), **sofort baubare Einheiten zuerst** (kantons-einzelne Fixes, Display-/UI-Schicht),
> **gegatete 26×-Einheiten klar dahinter** (Slot durch E3/W2·6-DATA belegt). Verworfenes steht
> explizit mit Grund (§Z), Beleg-Qualität in §B, Korrekturen aus den Kritiken in §K.
>
> **Bilanz:** 44 Befunde → Dubletten-Merges (F43≡F6 · F15≈F8 · F27 zerfällt in F9/F11 + Rest-Item)
> → **41 netto** → **39 übernommen** (davon 7 mit korrigierter/verschärfter Massnahme aus den
> Kritiken) · **1 Massnahme ersetzt** (F10-Client-Kanton-Index → F35/F36, Arbiter-Entscheid) ·
> **1 Positivbefund ohne Aktion** (F34 Mobil/§-Weiche = Verifikations-Baseline).
> Kein Befund verlangt Headless-Scraping; keiner verletzt den OCL-Schema-Entscheid (11.7.:
> kein korpusweiter json_content-Wechsel).

---

## §0 · Verbindliche Prozess-Regeln (gelten für JEDE Einheit dieses Plans)

1. **G1 — Amtsquellen-only (§7 + Lizenz-Leitplanke).** Texte/Metadaten/PDF ausschliesslich von
   den amtlichen Kantonsportalen (bgs.*, *.clex.ch, gesetzessammlung.bs.ch, m3.ti.ch, sz.ch,
   zh.ch, VD BLV …). **lexfind.ch nur als Fakten-/Lücken-Signal** (Enumeration, Versions-Heuristik),
   nie als Text-/PDF-Quelle, nie Aggregator-Dateien einbacken. Quell-Menü **je Kanton empirisch**
   erheben (Daueranweisung; GL-Lektion `/app/` vs `/api/` — Content-Type prüfen, Angular-Shells
   erkennen). **Headless ist KEIN zulässiger Fallback** — bietet ein Portal nur JS-gerendertes
   HTML: strukturierte Endpunkte/PDF oder Verzicht.
2. **G2 — 26×-Slot-Regel (Leitprinzip 4).** Der Slot ist durch **E3 (W2·6-DATA)** belegt. Nie
   zwei 26-Kantone-Massenläufe parallel. **Kantons-einzelne Fixes und Display-/UI-Schicht sind
   frei**; jeder korpusnahe Lauf (≥ ~3 Kantone Regeneration, 26-Kantone-Läufer, Vollkorpus-Import)
   ist eine **gegatete Einheit** (§1-B) — nur vorbereiten, nicht starten. Sequenzielle
   Kantons-Tranchen dürfen nicht als Schlupfloch für einen faktischen Vollkorpuslauf dienen
   (regel-treue-Auflage zu F1/F4). Sonderfall: ein **BS-Neulauf (859 Erlasse)** ist formal 1 Kanton,
   faktisch ein Massenzugriff auf einen Amts-Host → Tranchen + Rate-Limit + eigene Bau-Einheit.
3. **G3 — Gegenprüfungs-Pflicht (Skill `gegenpruefung`, Tor `check:gegenpruefung`).** Zwingend
   bei allen Tarif-/Extraktions-Risikopfaden dieses Plans: **K-4, K-6, K-7, K-14** sowie jeder
   Regeneration eines Tarif-Belegs (FR-261.16/8428, SG-2935/3849, TI-Gerichtskosten, SZ-Notariat,
   ZH-AnwGebV, VD-Notariat/Steuer, GL-Gebührentarif). Quittung `npm run gegenpruefung:ok`,
   Trailer `Gegenpruefung:` am Commit. PDF-Extraktion zusätzlich mit **pdfplumber-Gegenprobe**
   (nicht-lasttragend, s. W3·12-Werkzeug-Fund B3).
4. **G4 — Harte Sequenz-Constraints.**
   - **F20 (Dehyphenation) VOR jedem FR/VS/AR-PDF-Nachzug** — sonst stille Regression
     («se - condaire»); Snapshots FR-8428/VS-1413 bleiben bis dahin gesperrt.
   - **F41 (Art.-Self-Link-Unterdrückung) VOR oder MIT F40** (§-Selbstverweise) — sonst fehlt der Ersatz.
   - **Adapter-Fixes VOR Regenerations-Welle:** K-7 (Range-Platzhalter) + K-8 (<p>-Struktur)
     mergen, DANN K-G1 fahren — sonst zweite Welle. F13-Betroffenheits-Rescan NACH K-G1.
   - **K-G1/K-G2/K-G3/K-G4/K-G5 erst nach E3-Slot-Freigabe** (Etikett-Übergabe per
     `plan:set`-Commit, check.ts 5b).
5. **G5 — Beweis-Anker je Fläche.** Reader-/Display-Fixes: **golden byte-gleich für Bund beweisen,
   nicht annehmen** (F24-Auflage) + e2e/DOM-Reihenfolge-Test. Adapter-Fixes: Unit-Test mit dem
   echten Quell-Markup (AR-133.1, VD-105539-Negativfälle) + Golden-Diff korpusweit **offline**
   (additiv beweisen). Jeder Snapshot-Nachzug mit eigenem **version_uid-Drift-Token**; jede
   Fassungs-Entscheidung **gegen die Amtsquelle** (nie nach Datei-Alter). Zahlen am Bau-Tag frisch
   erheben, nicht aus diesem Audit abschreiben.
6. **G6 — Modell-Daueranweisung.** Bau = Opus (Default), Risikopfade IMMER Opus + `effort: high`;
   mechanische Display-Einzeiler (K-1c) Sonnet zulässig. Fable orchestriert nur.
7. **G7 — Davids Fachzeit.** Nichts in diesem Plan blockiert auf David (Zeitsperre 1.12.2026).
   Empfohlene Touchpoints (nicht blockierend): Kantons-Priorisierung K-G5 (ZH→BE→VD→AG→SG→LU→GE
   als Vorschlag) · spätere Abnahme der K-12-Kern-Erlass-Liste (Abnahme-Warteschlange).
   Push/Deploy bleibt §9.

---

## §2 · ROADMAP-Spec W2·13-KANTONE + W2·13-KANTONE-DATEN (wörtlich verschoben 31.7.2026; Aufteilung Darstellung/Daten 8.8.2026)

> **Aufteilung 8.8.2026 (Entscheid David, Entstückelung):** Die 14 Einheiten K-1…K-14 sind in der
> ROADMAP neu auf zwei sortenreine Dach-Schritte verteilt — `W2·13-KANTONE` (Darstellung & Suche,
> Nicht-Risiko: K-1, K-2, K-3, K-5, K-11) und `W2·13-KANTONE-DATEN` (Daten & Extraktion,
> Risikopfad: K-4, K-6, K-7, K-8, K-9, K-10, K-12, K-13, K-14). Die Bau-Spezifikation der
> Einheiten bleibt unverändert §1-A dieser Datei; die frühere serielle `dep`-Kette war
> Abarbeitungsordnung, kein fachlicher Zwang.

> **→ Bau-Spec: «§1-A · SOFORT BAUBARE EINHEITEN» (K-1…K-14), dazu §1-B/§1-C/§1-D dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  44 Befunde + 3 Kritik-Linsen, davon 10 live an Amtsquellen re-verifiziert)* — **14 sofort
  baubare Einheiten K-1…K-14** (kantons-einzelne Fixes + Display-/UI-Schicht, slot-frei):
  P0 Reader-Treue (Lesereihenfolge in 404 Erlassen zerrissen · GL-Routen tot · falsches
  «SR»-Label) → §8-Ehrlichkeit (Currency-Chip «Geltung ungeprüft», Kontext-Panel-Hinweis,
  Abdeckungs-Ausweis) → Suche-Ebenen-Fix (Kanton-Treffer landen auf `/gesetze/bund/`) →
  Einzel-Nachzüge (ZG-161.7 stale seit 1.7.! · SZ-Stand-2027 · Invariante «stand ≤ heute») →
  NormText-§-Verweise (F41 vor F40) → Quellen-Hygiene (9 lexfind-quelleUrls = §7-Verstoss →
  amtliche Portale, Dedupe-Tor) → PDF-Werkstatt (Dehyphenation-**GATE** vor jedem
  FR/VS/AR-PDF-Nachzug; VD/SZ/ZH-Profile) → Werkzeug-Brücke, AR-Sidecars, Perf-Profil,
  Reports, Systematik-7, Zitat-Vokabular-POC. **Gegatet dahinter (26×-Slot durch E3 belegt,
  nur ausgewiesen): K-G1…K-G5** — pre-S1-Regenerationswelle (93 Snapshots/23 Kantone),
  Currency-/Juli-Drift-Läufer, Gliederungs-Extraktion korpusweit, Tabellen/Barème,
  Vollkorpus-Ausbau (BS+AR = 91,4 % des Korpus, ZH 3/~940) — **K-G5 hängt in `W3·12` ein,
  kein Parallel-Schritt** (§14.3). Risikopfade (Tarif/Extraktion) je Opus + `gegenpruefung`.
  Verworfen u. a. Client-Kanton-Suchindex (K10/§15-Arbiter). Detail: diese Datei.
  **§14-Intake 20.7.2026 (David) — zwei Punkte HIER eingegliedert statt danebengelegt (§14.3), weil sie
  exakt dieselbe Bau-Fläche treffen (`scripts/normtext`, `public/normtext/kanton`, kantonale Adapter):**
  - **K-15 · Kantonale Extraktionstiefe** *(**ULTRACODE**, David: später)*. **Befund, nicht Vermutung:**
    **BS hat 41 % Erlasse ohne Gliederung** · kantonale Fussnoten sind **um Faktor ~40 dünner als beim
    Bund** · **ZH hat 0 Struktur-Dateien**. **Hypothese** (ausdrücklich als solche markiert): Quellen-
    Priorität bzw. PDF-Tier — kantonale Erlasse werden aus schwächeren Quellformaten gezogen als die
    Bundes-Erlasse. **DIAGNOSE VOR FIX, verbindlich:** erst je Kanton erheben, **welches Quellformat**
    tatsächlich verwendet wird und **wo** die Struktur verloren geht (Quelle dünn? Adapter dünn?
    Nachbearbeitung?). Ein Fix ohne diese Zuordnung repariert die falsche Schicht. Passt zur bestehenden
    Leitplanke «korpusweiter Adapter-Hebel VOR jedem Bulk» (`archiv/FAHRPLAN-BS-VORBILDKANTON.md`) und zu
    K-G3 (Gliederungs-Extraktion korpusweit) — dort einhängen, nicht doppelt planen.
  - **K-16 · Kantonale Änderungshistorie + Fundstelle im Kantonsblatt** *(David: «wenn möglich»)*.
    **Feasibility 🟢, belegt:** die kantonale Quelle liefert das **strukturiert** — `change_documents`
    und `history_information_map`. Es ist also Mapping-Arbeit, keine Text-Heuristik. **Zwei Auflagen:**
    (i) §7 Norm + Link + **Stand** je Fundstelle; (ii) die Kantonsblatt-Fundstelle ist eine amtliche
    Referenz — **stichprobenweise gegen das Kantonsblatt selbst verifizieren**, nicht der API blind
    glauben. Beide Punkte sind Risikopfad (Extraktion) ⇒ `check:gegenpruefung`, Opus.
  **§14-Intake 21.7.2026 (David) — hier eingegliedert (§14.3, gleiche Bau-Fläche `scripts/normtext` +
  `public/normtext/kanton`):**
  - **K-17 · enumeration_item-Verschachtelung: explizite `tiefe` im LexWork-Adapter** *(Anlassfall
    `BS-154.100` § 71 GOG, David: «Tabelle nicht stimmig»)*. **Kette komplett diagnostiziert (nicht
    Hypothese):** die amtliche LexWork-Quelle TRÄGT die Stufe (Unterpunkt = leere erste Nummernzelle
    + zweite `number`-Zelle im `enumeration_item`-Markup), `adapter-lexwork.ts` flacht beim
    Extrahieren ab (`items` ohne `tiefe` — das Feld existiert seit M6 nur für Bund/Fedlex), und die
    Renderer-Fallback-Heuristik (`ArtikelBody.tsx`) rät die Stufen mit der **inversen** Annahme
    (lit.=Hauptstufe, Ziff. danach=Unterstufe) → § 71 rückt «2. das Dreiergericht» UNTER lit. a/b
    ein, Haupt- und Unterpunkte erscheinen vertauscht. **§1-Folge, darum kein Kosmetik-Punkt: die
    Zitat-Kette der Zitierknöpfe baut auf den geratenen Stufen** — präzise Zitate («§ 71 Abs. 1
    Ziff. 2 lit. b GOG») können falsch zusammengesetzt werden. Konkreter, **sofort baubarer**
    Einzelfall der K-15-Klasse mit bereits erfüllter Diagnose-Auflage (richtige Schicht = Adapter,
    Quelle ist nachweislich reich genug); NICHT K-G4 (das ist die andere Block-Klasse
    `enumeration_tabular`/Barème). Risikopfad (Extraktion) ⇒ `check:gegenpruefung`, Opus.
    Detail: diese Datei §1-D.
  - **K-18 · Verweis-Erkenner: zusammengesetzte Abs.-/Art.-Angaben** *(Anlassfall `BS-154.100`
    § 92 Abs. 1 lit. d/f GOG, David: StGB-Verweise nicht verlinkt)*. **Am Erkenner reproduziert:**
    `normVerweiseImText` (geteilt, `src/lib/fedlex.ts`) erkennt «Art. 62c **Abs. 1-3 und Abs. 6**
    StGB», «Art. 63b **Abs. 2, 3 und 5** StGB» und «(Art. 7 **Abs. 3, 39 und 40** JStPO)» NICHT
    (je 0 Treffer); einfache Formen inkl. Buchstaben-Artikel (62a/62c) treffen. **Wirkung
    site-weit, nicht kantonsspezifisch** — Ausmass obere Schranke ~117 Stellen / **72 Erlasse**
    (Bund + Kanton). Vorbild für den Fix: `artikelnPluralVerweise` (Plural-Formen sind gelöst).
    Eigene Einheit statt K-5-Anbau (K-5 = «EINE Einheit, gleiche Datei» für §-Verweise); kein
    Korpus-Rebuild, golden-neutral; Leitplanke «kein Link besser als falscher Link» (§1).
    Detail: diese Datei §1-D/K-18.
  Trailer `Roadmap: W2·13-KANTONE`.

> **Ist-Stand-Messung 31.8.2026 (lebendige Spec, Anlass: Bau-Session W2·13-KANTONE; Erhebung
> read-only am Stand `337d2c9ef`).** Die §1-A-Specs (12.7., archiviert) sind an mehreren Stellen
> vom Ist-Code überholt — massgeblich für den Bau ist dieser Block:
> - **Bereits gebaut:** K-1c «SR»-Label (Ä75 18.8.2026, Weiche `src/pages/gesetz-leser/helpers.tsx`
>   `kennungEtikett`) · K-1d Titel-Dopplung Kopf-Teil (`ErlassLeserKopf.tsx`, `titelRedundant`) ·
>   K-2c Abdeckungs-Kontextzeile (`src/pages/Gesetze.tsx`, Kommentar nennt K-2c).
> - **Gegenstandslos:** K-1e Fussnoten-Stern-Strip — 0 `*`-Vorkommen in 23 370 Marginalien +
>   17 670 Titeln (A42-Generatorfix verwirft `<strong>*</strong>` quellseitig); kein Display-Code
>   bauen (§17-Gegengewicht: was nicht scheitern kann, wird gestrichen statt bewacht).
> - **Zahlen überholt:** F24 betrifft nach der Regenerierung vom 27.7. noch **3** Erlasse
>   (BS-569.500 · GR-310.250 · ZG-641.1), nicht 404; Beleg AG-291.150 trägt heute durchgehend
>   `gliederung`. F26-Prämisse falsifiziert: `currency.json` hat 0 kantonale Einträge — der Chip
>   behauptet keine Geltung mehr; offen ist nur die fehlende zweite Stufe («Geltung ungeprüft»).
> - **Anker-Umzüge:** `inhalt-volltext.tsx`-Zweig → `v3/LeserLesespalte.tsx` (Block-vor-Sektionen);
>   `GesetzLeser.tsx:6` → `src/pages/GesetzLeser.tsx:56`; `relevanz.ts` →
>   `src/lib/normtext/relevanz.ts`; `suche-kern.ts` → `scripts/datenhaltung/suche-kern.ts`;
>   statischer Suchpfad `artikelVolltext.ts` ist bereits ebenen-bewusst, nur der Online-Pfad
>   (`onlineVolltext.ts`) nicht.
> - **K-11-Profil (31.8.2026, Dossier `bibliothek/seo/kanton-reader-profil-2026-08-31.md`):** das
>   50-s-Symptom der Spec war ohne Messbedingung notiert und liess sich nicht reproduzieren
>   (Maximum 21.6 s bei 6×-CPU + langsamem 3G; Streuung n=12: 8.7 %). Gemessene Blocker:
>   `/rechtsprechung/register.json` (753 KB gzip) lädt auf jeder Leserseite (−16–19 % First-Article
>   im A/B) · serielle Kette Register→Snapshot · Drei-Wellen-Chunk-Kaskade. Fixes = eigener
>   Schritt mit §15-Logikverlust-Bewertung, nicht Teil von W2·13-KANTONE.
> - **Prozess:** `src/lib/normtext/**` zählt mechanisch als Risikopfad (`istRisikoPfad`) — auch
>   Display-nahe Edits dort (relevanz.ts, erlassKopfText.ts) brauchen die Gegenprüfung. Der
>   K-3-Deploy-Vorbehalt («§9-Ja») vom 12.7. ist durch Davids Blanko-Go 24.7. entsperrt.

### Teilschritt-Spezifikation W2·13-KANTONE (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026, Nachhalte-Konvention*
*Ausführungs-Protokoll Ziff. 6). Die ROADMAP führt je Teilschritt nur noch Checkbox,*
*`@meta` und einen Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

**Schnitt-Begründung (Session-Granularität AP-6) — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Session-Granularität (AP-6, 31.7.2026):** je Einheit ein Teilschritt, dieser Schritt bleibt das
  Dach. Die `dep`-Kette K-1 → … → K-14 bildet die Vorgabe des Fahrplans **«Ausführungsreihenfolge =
  Tabellen-Reihenfolge»** (§1-A) maschinenlesbar ab und erfüllt damit zugleich den harten
  G4-Constraint «K-7a F20-Gate vor jedem FR/VS/AR-PDF-Nachzug» (betrifft K-12a). **Bewusst NICHT
  als Teilschritt:** K-G1…K-G5 (gegatet bis zur E3-Slot-Freigabe, Leitprinzip 4), K-15 (David:
  «später»), K-16/K-17/K-18 (§14-Intake-Nachträge, bleiben vorerst unter dem Dach).

**Ursprünglicher Wortlaut der Teilschritt-Bullets — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  - [ ] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5, M)* — Lesereihenfolge, Doppel-Decode, «SR»-Label, Titel-Dopplung, Fussnoten-Stern-Strip, A14-Relevanz fr/it; reine Display-Schicht. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K1`.
  - [ ] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest, S–M)* — zweistufiger Currency-Chip, Kanton-Hinweis im KontextPanel, Abdeckungs-Kontextzeile, «Stand unbekannt», Systematik-Hinweis; reine Anzeige. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K2`.
  - [ ] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36, S)* — Edge-DTO um `ebene`/`kanton`, Treffer-Href auf `/gesetze/<ebene>/…`, Kanton-Marke, Reader-Redirect als Defense-in-depth. **`api/suche`-Änderung geht erst mit Davids §9-Ja live.** Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K3`.
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion, S — **Risikopfad**, `QS-GP`)* — ZG-161.7 nachziehen, SZ-Stand klären, Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`, Vollständigkeits-Invariante gegen den strukturell blinden Drift-Check. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K4`.
  - [ ] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42, M)* — **EINE Einheit (gleiche Datei)**, golden-neutral; harte Binnenfolge **F41 vor F40** (sonst fehlt der Ersatz), F42 nachrangig. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K5`.
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22, M — **Risikopfad**, `QS-GP`)* — **pro Kanton eine Tranche**; Binnenfolge K-6a (Dedupe) vor K-6d (GL-Key-Migration). Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K6`.
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** *(F20-GATE/F17a/F18/F16/F19/F23/F13, M — **Risikopfad**, `QS-GP` + pdfplumber-Gegenprobe)* — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K7`.
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21, M)* — `parseSegment` im LexWork-Adapter, Schema nur additiv, Golden-Diff korpusweit offline; **Regeneration kantonsweise, > 2 Kantone → in K-G1 einhängen**. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K8`.
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38, M)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s zu `KANTON_ERLASS_WERKZEUGE`, Mapping nur bei exaktem Match, Konsistenz-Tor; reine Metadaten, kein Slot. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K9`.
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR, M)* — 263 der 314 fehlenden Struktur-Sidecars sind AR; nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**; 1 Kanton = slot-frei. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K10`.
  - [ ] **K-11 · Kanton-Reader-Performance profilieren** *(F32, M)* — **erst messen**: `check:perf-budget` um den Kanton-Leserpfad erweitern, nichts «fixen» vor dem Profil (Ursache unbewiesen). Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K11`.
  - [ ] **K-12 · Reports & kuratierte Listen** *(F3-Report/F4-Liste/F33-Daten, S–M)* — lesend/planend; K-12b ist reine Planung ohne Fetch, K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K12`.
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43, M)* — ZH/GE/VD/TI/SZ/NE/JU fehlen (19 von 26 vorhanden); Quell-Erhebung je Kanton empirisch und browserlos, kantons-einzeln frei. Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K13`.
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39, L — **Risikopfad**, `QS-GP`)* — POC über 5 Gerichts-Kantone × 6 Entscheide, nur exakte Sammlungsnummer-Matches, additiver Extraktions-Pass. **Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau gegen `W2·6-NKEY` nachmessen.** Detail: diese Datei §1-A. Trailer `Roadmap: W2·13-KANTONE-K14`.

### Dach-Prosa W2·13-KANTONE im Wortlaut (verschoben 31.7.2026) *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026); massgebliche Fassung.*

>   44 Befunde + 3 Kritik-Linsen, davon 10 live an Amtsquellen re-verifiziert)* — **14 sofort
>   baubare Einheiten K-1…K-14** (kantons-einzelne Fixes + Display-/UI-Schicht, slot-frei);
>   Extraktions-Anteile sind Risikopfad ⇒ `QS-GP` + golden byte-gleich.
>   **Detail:** diese Datei §2. Trailer `Roadmap: W2·13-KANTONE`.


---

## §3 · Inhaltsdrift der kantonalen Snapshots gegen die Quellen (`W2·13-KANTONE-DRIFT`, Befund 2.8.2026)

**Befund (Herkunft ehrlich ausgewiesen).** Beim Nachführungs-Durchgang vom 2.8.2026 wurde die
Bundes-Ebene bewusst allein bearbeitet (`--nur=bund`). Der Drift-Abgleich meldete dabei für die
**kantonale Ebene rund 28 Snapshots mit echter Inhaltsdrift** gegenüber den Amtsquellen, unter
anderem:

- **BE 154.21** — neue Fassung per **1.8.2026**;
- **AG 291.150** — neu **aufgehobene Artikel**.

**Verifikations-Stand: UNVERIFIZIERT.** Die Zahl 28 und die beiden Beispiele stammen aus dem
Lauf-Protokoll jenes Durchgangs und sind hier als **Anlass** festgehalten, nicht als Ergebnis. Sie
werden im Schritt selbst **neu erhoben** (`npm run check:normtext-netz`, nackt, volle Ausgabe
lesen) — die Liste wird sich bis dahin bewegt haben, und eine übernommene Zahl wäre eine zweite
Wahrheit (§5) plus eine Behauptung ohne eigenen Beleg (§7). Ausgangspunkt ist der Lauf, nicht
dieser Absatz.

**Warum ein eigener Schritt und kein Anhängsel.** Kantonale Nachführung ist **Korpus-Produktion**,
nicht Darstellung: pro Erlass Quelle mit Stand, Anker-Prüfung, Re-Extraktion, Snapshot-Neubau.
Das ist ein **Risiko-Pfad** und wird nach Skill **`korpus-werkstatt`** gefahren, mit
`npm run check:gegenpruefung` als Tor. An einen UI- oder Currency-Schritt angehängt, liefe es
ungegated mit — genau die Vermischung von Risiko-Klassen, die §14.2 untersagt.

**Auflagen (bindend).**

1. **Je Erlass ein Beleg:** amtliche Quelle-URL + Konsolidierungs-/Abrufdatum, sichtbarer
   Live-Link im UI, Drift-Erkennung aktiv — die vier Merkmale der Zitat-Ausnahme (CLAUDE.md §7).
   Fehlt eines, wird der Snapshot **nicht** aktualisiert, sondern der Erlass als offen ausgewiesen.
2. **Aufgehobene Artikel** (AG-Fall) sind ein §8-Thema, kein Löschthema: die Aufhebung wird
   **sichtbar** gemacht, nicht der Artikel stillschweigend entfernt.
3. **Determinismus:** Generator zwei Läufe byte-gleich; Diffs an unbeteiligten Kantonen sind ein
   Fehlschlag, kein Rauschen.
4. **`verified: true` / Status «geprüft» setzt niemand automatisch** — fachliche Abnahme David
   (§7/§8).
5. **Portionierung:** kanton-weise, nicht in einem Rutsch — ein Sammel-Commit über 28 Erlasse ist
   nicht mehr prüfbar.

*Hinweis zur Herkunft: Zu diesem Punkt hat ein Sub-Agent am 2.8.2026 einen Task-Chip angelegt.
Der Chip ist durch diesen Plan-Eintrag **ersetzt** (Vorgabe David: keine Chips) — massgeblich ist
allein dieser §.*

---

## §4 · ZH-Tranche: Inventar → Kern-Erlasse → Ausbau (Auftrag David 31.8.2026, lebendige Spec)

**Anlass:** Auftrag David 31.8.2026 «Zürcher Gesetze inventarisieren und in LexMetrik
einbauen», zwingend gestuft (Messen vor Handeln). Grundlage: Dossier
[`bibliothek/recherche/zh-quellinventar-2026-08-31.md`](../bibliothek/recherche/zh-quellinventar-2026-08-31.md)
(944 in-Kraft-Erlasse, Formate, Fallen) + interner Pipeline-Befund (HEAD `cec6cdbfb`).

**Stufe 1 — Inventar: erledigt 31.8.2026.** Kernbefunde: Bestand **944** (amtlicher
JSON-Endpunkt `lawcollectionsearch…zhweb-zhlex-ls.zhweb-cache.json`, ordner-weise
`fileNumber=1…14`, Kappungs-Flag geprüft); Volltext **nur PDF** (kein XML/DOCX/HTML —
Formatleiter-Abstieg beweisgeführt, `adapter-zh-pdf.ts` bleibt der Weg); Systematik
Ebene 1 = **14 Ordner** browserlos aus server-gerendertem HTML; Drift-Token =
**PDF-ETag/Last-Modified** auf notes.zh.ch (Registry-`Last-Modified` ist Abrufzeit,
unbrauchbar); lexfind für ZH obsolet (und dessen API-Vertrag ohnehin gebrochen —
eigener ROADMAP-Punkt).

**Stufe 2 — Kern-Tranche (Bauschritt, kein Datenlauf):**

1. **ZH-4a · Deklarative ZH-Quellenliste** (~20 Kern-Erlasse aus Dossier §6:
   KV 101 · GOG 211.1 · AnwG 215.1 · NotG 242 · StG 631.1 · VRG 175.2 · GG 131.1 ·
   EG ZGB 230 · PolG 550.1 · PBG 700.1 … je LS-Nr + Registry-URL + erwartetes Kürzel),
   eingehängt in `sammleZhPdfInventar()` (`inventar-kanton.ts:340`) **UND**
   `check-drift.ts:321` — NIE über `src/data/tarif/*.ts` (reisst `lexmetrik-golden.json`).
   Damit schliesst sich die §7-d-Lücke (Erlasse ohne Tarif-Zitat waren driftblind).
2. **ZH-4b · `holeZhPdf`-Retry (§17-Wurzelfix):** nacktes `fetch` ×3/Erlass →
   `fetchMitWiederholung` (`netz-retry.ts`), Tranchen-Rate ≤ ~1 req/s gegen notes.zh.ch
   (BS-Sonderfall-Regel G2: ein Kanton, aber Massenzugriff). Fetch-Fehler dürfen nie
   still verschluckt werden (Lauf bricht sichtbar ab oder listet Fehl-Erlasse).
3. **ZH-4c · Systematik ZH Ebene 1** (K-13-Anteil): die 14 Ordner (Nummernband→Thema,
   Dossier §3) als ZH-Eintrag in `kanton-systematik.json` — Quelle server-gerendertes
   HTML der Suchseite; Zuordnung Erlass→Ordner deterministisch über das Nummernband.
4. **Beweise (G5):** je Snapshot Norm + amtliche Quell-URL + Stand + `fassungsToken`
   (quelleHash; §7-Zitat-Ausnahme alle vier Merkmale) · `lexmetrik-golden.json`
   byte-gleich · `normtext-snapshot.json` rein additiv (Alt-Keys unverändert, git-diff) ·
   pdfplumber-Gegenprobe an ≥2 neuen PDFs (G3) · Identitätsbeleg n ≥ 10 gegen die
   Amtsquelle im PR-Body (landung 6b) · Gegenprüfung Pflicht, Auto-Merge gesperrt.
5. **Bekannte Fallen** (Dossier §5/§7): HTTP 204 leer bei 0 Treffern · 150er-Kappung ·
   AEM-Komponenten-ID zur Laufzeit auflösen · `istZh21111`-Hardcode + `'4' in artikel`-
   Staffel-Heuristik je neuem Erlass prüfen · Spiegelrand-Layout-Annahmen empirisch
   verifizieren (VRG 1959 und PBG 1975 sind alte Sätze!).

**Stufe 3 — Ausbau in Tranchen** (Richtung 944, Katalog-Generator über den
JSON-Endpunkt): erst nach gelandeter Stufe 2 und sauberer Stichproben-Abnahme;
G2-Slot-Regel beachten (kein faktischer Vollkorpuslauf als Tranchen-Schlupfloch —
Freigabe je Tranche beim Orchestrator/David).

---

## Archivierte Abschnitte *(Plan-Neuschnitt 29.8.2026)*

9 Abschnitt(e) dieser Datei sind wörtlich nach
[`archiv/fahrplaene/FAHRPLAN-KANTONE.md`](../archiv/fahrplaene/FAHRPLAN-KANTONE.md) ausgelagert — sie tragen keine offene
ROADMAP-Bindung mehr. Titel:

- §1-A · SOFORT BAUBARE EINHEITEN (slot-frei; Ausführungsreihenfolge = Tabellen-Reihenfolge)
- §1-B · GEGATETE EINHEITEN (26×-Slot durch E3 belegt — ausgewiesen, NICHT starten)
- §Z · Verworfenes (explizit, mit Grund)
- §K · Korrekturen aus den Kritik-Linsen (in die Einheiten eingearbeitet)
- §B · Beleg-Qualität (Kurzreferenz)
- §S · Sequenz-Übersicht (Kurzform)
- §1-C · §14-Intake 20.7.2026 (David) — K-15 und K-16
- §1-D · §14-Intake 21.7.2026 (David) — K-17
- §3-N · ROADMAP-Spec `W2·13-KANTONE-DRIFT` — Nachzug (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)
