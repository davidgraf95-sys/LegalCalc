# Ästhetik- und Benennungs-Prüfung Gesetzes-Leser — LIVE, 18.8.2026

Live-Stand geprüft: `<meta name="lexmetrik-build" content="2298d577">` (build.txt). Werkzeug: Playwright/Chromium 1.60,
kalt je Zustand (frischer Context), deviceScaleFactor 1, reducedMotion, Dunkelmodus per `localStorage.lexmetrik-thema=dunkel`
+ `colorScheme:'dark'` (Mechanik: `src/components/thema.ts`). Bilder: `screens/` (127 PNG, Volltreue) und `view/`
(JPEG-Ansichtskopien + Crops). Alle zitierten Bilder wurden angeschaut. Massstab: Design-Grundlage Kap. 1–8, HIG-Begriffe,
Fahrplan Kap. 7 (höchste belegte Nummer **Ä96** → neue Befunde ab **Ä97**), Kontaktbogen H4 §8.

Erlasse: StPO (#art-429, Warnung) · OR (#art-336c) · VMWG · LugÜ · BS-640.100 · ZH-211.11 · FR-635.1.1.
Breiten: 1920 · 1440 · 1280 · 1150 · 1024 · 720 · 390. Zustände: Ruhe · Suche · Treffer-Blatt · Ansicht-Menü · Panel
(Spalte/Schiebe/Sheet, drei Reiter, Instanzen-Filter) · Steckbrief (Leiste/Panel/Sheet) · Schiene · Schriftskala 130 % ·
Fussnoten/Änderungsvermerke an/aus · Split @1440 (AIG → StGB, Panel im Pane, Suche im Pane) · Hover/Fokus · Startseite,
/gesetze @1440/@390.

## 1 · Note

**8 / 10** (zuletzt 7,5). Gewonnen: die H4-Positionen sind sichtbar da — Kopfzeile ≤ 4 Elemente auf jeder Breite, ein ✕ je
Fläche, das Beiwerk-Blatt hat @1440 eine eigene Spur und verdeckt nichts, Steckbrief-Zeile über den Reitern, Treffer-Blatt
ohne Stummel, Trefferzeilen ohne Randtitel-Ellipse, ein Ansicht-Menü mit identischem Inhalt D/H, ruhiger Serif-Satz mit
hängenden Ziffern; Dunkelmodus rollen-treu (Warn, Akzent, Flächen). Abzüge: (1) Benennungs-Streuung (Ansicht/Darstellung,
Reiter/Fenster/Pane/Split-View, Übersicht doppelt belegt, geltende/amtliche Fassung, «amtlich ↗»); (2) ein §7-naher Rest
(Zitat-Text «SR» vor kantonaler Nummer); (3) drei sichtbare Doppelungen (Vorbehalt-Warnung Box+Kopf, zwei fast gleich
beschriftete Suchfelder übereinander, doppelte Linie unter dem Ingress); (4) Zeichen-Flut in Trefferliste (Randtitel-Chip,
Versal-Mono-Gruppenköpfe mit Ellipse) und Panel (★ 25×). Nichts davon ist Struktur — alles ist Säuberung.

Fedlex-Vergleich (Eindruck): Fedlex ist dichter, sans, dreispaltig mit Kästen; V3 liest sich ruhiger und typografisch
hochwertiger. Gemeinsame Schwäche: viel Chrome oben (H @390: Topbar 80 + Kopf 52 + Suchfeld 46 ≈ 178 px vor der ersten
Textzeile — Ä33/34 unverändert).

## 2 · Ä-Zeilen aus H4 / Nachzug A / Nachzug B — am Live-Stand

| Ä | Stand | Bild |
|---|---|---|
| Ä87 zwei ✕ | **bestätigt** — Kopf trägt bei offenem Blatt kein ✕ | screens/stpo-panel-entscheide-1440-hell.png |
| Ä88 Panel faltet Gliederung / Artikel hinter Kopf @1024 | **bestätigt** — «Ansprüche / Art. 429» steht frei unter dem Block | view/crop-panel-1024.jpg |
| Ä89 Steckbrief-Zeile über den Reitern | **bestätigt** (Spalte 1440 mit Schiene, 1150, 1024, Sheet 390) | view/stpo-schiene-panel-1440-hell.jpg, view/crop-panel-1024.jpg, view/stpo-panel-entscheide-390-hell.jpg |
| Ä90 eine Icon-Bauform @390 | **bestätigt** — ⚖ ☰ ··· gleiche Pille | view/stpo-ruhe-390-hell.jpg |
| Ä91 vier Elemente @720 | **bestätigt** — Ort · Rechtsprechung · ☰ · Ansicht | view/stpo-ruhe-720-hell.jpg |
| Ä92 ein Öffner je Breite | **bestätigt** — Menü ohne «Entscheide & Kontext …» neben Chip, D und H | view/crop-ansicht-1440.jpg, view/crop-ansicht-390.jpg |
| Ä94/Ä84 Treffer-Blatt @390 | **bestätigt** (Segment + «↑ Anfang» eine Zeile); **teilweise** wegen Zählerzeile «–/88» schief (→ Ä103) | view/stpo-treffer-blatt-390-hell.jpg |
| Ä96 D-Trefferzeilen | **bestätigt** — Randtitel zweizeilig ohne Ellipse, Schnipsel einzeilig | view/crop-suche-leiste.jpg |
| Ä75 «SR» am Kanton | **teilweise** — sichtbar OK (BS «640.100», ZH «LS 211.11», FR «RSF 635.1.1»); im Zitat-Text weiter «SR LS 211.11»/«SR RSF 635.1.1»/«SR 640.100» (→ Ä98) | view/bs-ruhe-1440-hell.jpg, view/zh-ruhe-1440-hell.jpg, view/crop-steck-fr.jpg; labels.txt |
| Ä81 Warnung nur im Kopf | **bestätigt** für die Konsolidierungs-Warnung (StPO); die Vorbehalt-Zeile steht doppelt (→ Ä97) | view/crop-steck-1440.jpg, view/stpo-kopf-1440-hell.jpg, view/crop-or-steck.jpg |
| Ä60 (c) Rahmen 84 rem | **bestätigt** @1440 (Blatt eigene Spur, kein Verdecken); Schiebe @1150/@1024 verdeckt nichts | view/stpo-panel-entscheide-1440-hell.jpg, view/stpo-panel-entscheide-1150-hell.jpg |
| B2 «Rechtsprechung anzeigen» | **bestätigt** Wortlaut; Lesbarkeit mit «✓ an» → Ä115 | view/crop-ansicht-1440.jpg |
| Ä9-Rest Regler-Doppel | **offen bestätigt** — Topbar «A− 100 % A+» und Menü «Gesetzestext A− 100 % A+» | view/crop-ansicht-1440.jpg |
| Ä83/C6 Topbar-Stummel @390 | **offen bestätigt** — leerer grauer Kasten in der App-Leiste | view/stpo-ruhe-390-hell.jpg |
| Ä64 Regler-Hierarchie 130 % | **offen bestätigt** — nur Fliesstext wächst; «Art. 429», Randtitel, Ziffern bleiben klein | view/stpo-schrift130-1440-hell.jpg |
| Icon-Deckel @390 (3 Icons) | **offen bestätigt** (⚖ ☰ ···; dazu 5 Topbar-Icons) | view/stpo-ruhe-390-hell.jpg |
| Ä86 Aussenklick, B1/B7, Fassungs-Zeitleiste-Inhalt | **nicht geprüft** | — |

## 3 · Neue Befunde (Ä97 ff.) — Schwere: N = Nachzug-PR · S = spätere Etappe/H5 · D = Davids Entscheid

| Ä | Befund (Bild) | Schwere | Vorschlag · Datei-Vermutung |
|---|---|---|---|
| **Ä97** | Vorbehalt doppelt: «⚠ nächste Fassung ab 01.10.2026» gleichzeitig in Übersichtsbox UND Kopf-Standzeile (OR @1440; Kontaktbogen §8 nannte den Fall «nicht messbar» — er ist am OR live) (view/crop-or-steck.jpg) | N | wie Ä81: nur der Kopf; `v3/UebersichtBox.tsx` / `uebersichtAngaben.ts` (`data-v3-uebersicht-warnung`) |
| **Ä98** | Zitat-Text «SR» vor kantonaler Nummer: aria «Zitat kopieren: § 1 …, SR LS 211.11», «… SR RSF 635.1.1», «… SR 640.100» — die Zwischenablage trägt eine falsche Fundstelle (labels.txt / inventar.json) | N (§7-nah) | `helpers.tsx:121 baueZitat` nutzt `kennungText` (Z. 73) statt `SR ${sr}` |
| **Ä99** | Übersichtsbox klebt: `[data-v3-aside]` sticky top 120; bei Art. 429 (scrollY 247 790) Box y = 148 sichtbar, in jeder Scroll-Lage (mess4). Kap. 4b «scrollt weg» und der Ä81-Vermerk-Satz «Wer tief in Art. 429 liest, hat weder Kopf noch Box» sind am Live-Stand falsch. Folge: Suchfeld ist NICHT oberstes Element des klebenden Bereichs («‹ Gliederung ausblenden» + Box davor); offene Box klebt mit und nimmt dem Baum ~240 px (view/crop-steck-1440.jpg) | S + Doku-N | entweder Vermerk/Kap. 4b korrigieren («Box klebt bewusst, Leiste scrollt eigen») oder Box aus dem Sticky-Container lösen; `v3/LeserSeitenleiste.tsx` / `LeserRahmenV3.tsx` |
| **Ä100** | Doppelte Linie zwischen Ingress-Fussnoten und erstem Sektionskopf (StPO @1440/@390, ~25 px Abstand) (view/crop-kopf-linien.jpg, view/stpo-kopf-390-hell.jpg) — Kap. 3 «eine Linienrolle pro Ebene» | N | Ingress-Fussnoten-Sockel oder Sektionsregel; Datei nicht sicher (`parts/SektionKopf.tsx` / Ingress-Bauteil) |
| **Ä101** | Silbentrennung im Erlass-Kopf-h1 («Aner-kennung», «Strafprozess-ordnung») (view/lugue-ruhe-1440-hell.jpg, view/stpo-kopf-390-hell.jpg) — Kap. 8 Nr. 7 | N | `hyphens` am h1 aus; `parts/ErlassLeserKopf.tsx` (trägt `hyphens`) |
| **Ä102** | Trefferliste: Gruppenkopf Versal-Mono mit Tracking ellipsiert («3. TITEL: PARTEIEN UND ANDERE…») @1440 UND @390 — Gliederungsort ist Kernauskunft (view/crop-suche-leiste.jpg, view/stpo-treffer-blatt-390-hell.jpg) | N | Sans-Overline in Normalschreibung, zweizeilig erlaubt; `v3/LeserTrefferListe.tsx:273` (`line-clamp-1`) |
| **Ä103** | Zähler «–/88» vor der ersten Navigation bedeutungslos; @390 zweizeilig im Kasten (Zähler über den Pfeilen), Kasten im Kasten (Segment + Werkzeugzeile auf `well`) (view/stpo-treffer-blatt-390-hell.jpg) | N | «0 von 88» oder erst nach dem ersten Sprung; einzeilig; `v3/LeserTrefferListe.tsx:106, ~200–225` |
| **Ä104** | «Randtitel»-Chip je Trefferzeile = Kasten mit unklarer Aussage; der Treffer im Randtitel selbst ist NICHT markiert («Entschädigung der amtlichen Verteidigung» ohne Marke) (view/crop-suche-leiste.jpg) | N/S | Treffer im Randtitel markieren, Chip streichen; `v3/LeserTrefferListe.tsx ~320` |
| **Ä105** | Verweise-Zeile doppelt zu den Inline-Links: ZH § 1 zeigt drei Mono-Kästen «Art. 95 Abs. 2 lit. a ZPO» direkt unter denselben Links (view/zh-ruhe-1440-hell.jpg) — Kap. 8 Nr. 1/9 | S (S-Strang, Beiwerk-Entscheid) | Zeile nur für Verweise ohne Inline-Link oder als Textzeile ohne Kasten |
| **Ä106** | ★ an jedem der 25 Einträge unter «LEITENTSCHEIDE» — Icon-Flut, redundant zur Gruppe (view/crop-panel-ent-d.jpg) | N | ★ nur in gemischten Gruppen; `v3/PanelEntscheide.tsx` |
| **Ä107** | Steckbrief-Datumsformate gemischt: «5. Oktober 2007» neben «01.01.2011», FR «01.05.1996» (view/crop-steck-1440.jpg, view/crop-steck-fr.jpg) | N | ein Format (numerisch wie Kopf); `v3/uebersichtAngaben.ts` |
| **Ä108** | Steckbrief FR «Art: Kanton FR» — das Feld «Art» trägt die Ebene statt der Erlassart (view/crop-steck-fr.jpg) | N | ohne Grundart Zeile weglassen; `v3/uebersichtAngaben.ts` |
| **Ä109** | Kantonale Sigle uneinheitlich: BS nackt, ZH «LS», FR «RSF» (Bilder wie Ä75) | S (Korpus, Ä75 positive Hälfte) | Registerfeld je Kanton |
| **Ä110** | Aktionszeile Kopf: «↗ geltende Fassung · ⧉ In neuem Reiter · ⬇ Amtliches PDF» — Grossschreibung gemischt; derselbe Fedlex-Link heisst im Kopf «geltende Fassung», am Artikel «amtliche Fassung ↗», im Steckbrief «amtliches PDF» klein (view/stpo-kopf-1440-hell.jpg, view/crop-hover-art.jpg, view/crop-steck-1440.jpg) | N | ein Name («amtliche Fassung ↗»), eine Schreibung; `parts/ErlassLeserKopf.tsx`, `parts/ArtikelLeser.tsx:510ff`, `v3/UebersichtBox.tsx` |
| **Ä111** | Zwei ☰ in derselben Kopfzone @390: Topbar «Navigation öffnen» links, Leser «Gliederung» rechts — gleiche Glyphe, zwei Ziele; Leser-aria sagt nicht, was passiert (view/stpo-ruhe-390-hell.jpg) | N (aria) / S (Glyphe) | aria «Gliederung öffnen»; Glyphe aus `Icon.tsx`; `v3/LeserKopf.tsx` |
| **Ä112** | Zwei Suchfelder mit gleichem Anfang übereinander (Topbar «Suchen oder Norm springen …», Leser «Suchen oder «Art. 1» …») @720–1440 — unklar, welches wo sucht (view/stpo-ruhe-720-hell.jpg) | N | Leser-Platzhalter/aria nennen den Erlass: «Im StPO suchen oder «Art. 1» …»; `v3/SuchSprungFeld.tsx:132` |
| **Ä113** | = Ä64 bestätigt (view/stpo-schrift130-1440-hell.jpg) | D | — |
| **Ä114** | «Ansicht» (Öffner) vs «Darstellungsoptionen» (aria) vs «DARSTELLUNG» (Overline) vs title «Darstellung: …» (view/crop-ansicht-1440.jpg) | N | ein Wort «Ansicht»; `v3/LeserAnsichtV3.tsx:192,197` |
| **Ä115** | «Rechtsprechung anzeigen ✓ an» liest sich als Satz; die zwei anderen Schalter sind Substantive (view/crop-ansicht-1440.jpg) | N | «Rechtsprechung in der Kopfzeile»; `v3/LeserAnsichtV3.tsx` |
| **Ä116** | Schalter «Änderungsvermerke» schaltet ein Element, das «FASSUNG · Gilt seit …» heisst — Schalter ≠ Beschriftung (view/crop-fn-aus.jpg) | N | «Fassung («Gilt seit …»)» oder Overline angleichen |
| **Ä117** | Gedankenstrich gemischt: «–» in «Amtliche Fedlex-Quelle – öffnet …» (`helpers.tsx:432`), «Art. 66a StGB – Obligatorische …» (Popover), «—» sonst | N | ein Strich; grep « – » in `pages/gesetz-leser`, `components/NormPopover.tsx` |
| **Ä118** | Ein Feature, vier Wörter: «In neuem Reiter» (Kopf), «Alle geöffneten Reiter»/«Reiter & Split-View» (Topbar), «Hauptfenster schliessen»/«zum Hauptfenster machen» (Griffleiste), «Pane-Breite anpassen» (Trenner), «Layout-Link kopieren» (Jargon) — und «Reiter» zugleich für die Panel-Reiter («Kontext-Reiter») (labels.txt; view/split-ruhe-1440-hell.jpg) | N (Leser-eigen) / S (App) | «Fenster» für die Split-Sache («In neuem Fenster», «Alle Fenster», «Fensterbreite anpassen», «Fensteranordnung als Link kopieren»); «Reiter» bleibt dem Panel; `v3/ReiterAktion.tsx`, `components/layout/PaneKopf.tsx` |
| **Ä119** | «Übersicht» doppelt belegt: Steckbrief-Box UND Fussnav «‹ ZPO Übersicht BGG ›» (Link /gesetze) (view/stpo-ruhe-1440-hell.jpg; labels.txt NAV «Weitere Erlasse») | N | Fussnav «Alle Gesetze» |
| **Ä120** | Suchbereich-Segment «Titel» kollidiert mit «2. TITEL» direkt darunter (view/crop-suche-leiste.jpg) | N | «Überschriften»; `v3/SuchBereichWahl.tsx` LABEL |
| **Ä121** | Panel «Änderungen»: Erklärtext klebt an der Reiterlinie, Jargon («Fedlex-Graphen (SR-Taxonomie)»); Link-Text «amtlich ↗» (auch Materialien) nennt kein Ziel; 5× identische Zeile «Änderung über einen Sammelerlass — nur das Datum ist erfasst.» (view/crop-panel-aend.jpg, view/crop-panel-mat.jpg) | N (Text) / S (Struktur) | «Fedlex ↗»/«AS 2024 490 ↗»; Hinweis einmal, Zeilen nur Datum; `v3/PanelAenderungen.tsx`, `v3/PanelMaterialien.tsx` |
| **Ä122** | Steckbrief FR Hinweise «Kanton FR: dünn, 6 Erlasse erfasst. Zähl-Etikett «Artikel» noch nicht amtlich verifiziert (Entwurf).» — Innenjargon (view/crop-steck-fr.jpg) | N | Klartext: «Kanton FR: erst 6 Erlasse erfasst. Ob dieser Erlass in «Artikel» oder «§» zählt, ist noch nicht geprüft.»; `v3/uebersichtAngaben.ts` |
| **Ä123** | Kopf-Chip trägt drei Gesichter: «⚖ Rechtsprechung» → nach Nachladen «⚖ 25 Entscheide» → @390 «⚖ 25»; Breitenwechsel im Kopf beim Nachladen (view/stpo-ruhe-1440-hell.jpg vs view/stpo-panel-entscheide-1440-hell.jpg) | S | «⚖ Rechtsprechung» konstant, Zahl als Badge; `v3/LeserPanelOeffner.tsx:105` |
| **Ä124** | Sektionsköpfe Versal mit «BIS» als Wortteil («ACHTER TITELBIS», «ERSTER ABSCHNITTBIS», OR) und ein «[tab]» in einer Zitat-Beschriftung (LugÜ «Anhang VI Ziff. 4.2 lit. [tab]») — **nur aus dem DOM-Inventar (labels.txt), ohne Bild** | S (Kern-Render/Daten) | Suffix «bis» hochgestellt/klein; «[tab]»-Leck im Label-Bau |
| **Ä125** | Gliederung folgt der Lesestelle uneinheitlich: gleicher Kaltlauf @1440 hell bis «1. Abschnitt» aufgeklappt, dunkel nur bis «10. Titel» (view/stpo-ruhe-1440-hell.jpg vs view/stpo-ruhe-1440-dunkel.jpg) — **ein Lauf je Zustand, Verdacht, keine Zuschreibung (§0.3)** | S (Messreihe) | 10 Kaltläufe je Modus, dann entscheiden |
| — | Kopf-Zeile «Snapshot — massgeblich ist die amtliche Fassung»: englisches Jargonwort in der Kernauskunft (view/stpo-kopf-1440-hell.jpg) | N | «Kopie vom … — massgeblich ist die amtliche Fassung» |
| — | Ansicht-Menü ist adaptiv (LugÜ ohne «Änderungsvermerke») — Options-Ort nicht identisch über Erlasse (labels.txt title «Darstellung: Fussnoten · Rechtsprechung anzeigen · Grösse …») | S | Schalter zeigen, `disabled` mit Grund |

Kontext Startseite//gesetze (view/start-1440-hell.jpg, view/gesetze-1440-hell.jpg): gleiche Tokens (Brass, Mono-Overlines,
Papier), aber lauter als der Leser — Hero-Farbfläche, «SCHNELLRECHNER»/«SCHNELL RECHNEN» doppelt, 2 bzw. 4 Suchfelder pro
Bild. Der Leser ist heute die ruhigste Fläche der App; das Suchfeld-Doppel (Ä112) importiert er aus der App.

## 4 · Benennungs-Glossar (Sache · heute · Vorschlag)

| Sache | heute verwendete Wörter | Vorschlag |
|---|---|---|
| Menü der Darstellungsschalter | Ansicht · Darstellung · Darstellungsoptionen | **Ansicht** |
| Steckbrief-Box | Übersicht (UI) · Steckbrief (Doku/Tests) · Übersicht = auch Fussnav-Link auf /gesetze | UI **Übersicht** behalten; Fussnav **Alle Gesetze** |
| Rechtsprechungs-Fläche | Rechtsprechung (Chip) · N Entscheide (Chip geladen) · Rechtsprechung & Kontext (Panel) · Entscheide & Kontext … (Menü) · Leitentscheide (Gruppe) · Gerichtsentscheide (Reiter-title) | Fläche **Rechtsprechung** (Chip konstant), Reiter **Entscheide**, Gruppe Leitentscheide |
| Split-View-Fläche | Reiter · Fenster/Hauptfenster · Pane · Split-View · Layout-Link | **Fenster**; «Reiter» nur für Panel-Reiter |
| Fedlex-Link | geltende Fassung · amtliche Fassung ↗ · Amtliche Fedlex-Quelle · amtlich ↗ · Intern öffnen (SR-Link) | **amtliche Fassung ↗** (Erlass/Artikel), **Fedlex ↗** in Listen |
| Gliederungs-Griff | Gliederung · Gliederung ein-/ausblenden · Navigation öffnen (Topbar-☰) | Leser: **Gliederung öffnen/schliessen** |
| Suchfeld Leser | Suchen oder «Art. 1» … · Im Gesetz suchen oder zu einer Bestimmung springen | **Im StPO suchen oder «Art. 1» …** (Kürzel einsetzen) |
| Suchbereich | Alles · Titel · Text · Fussnoten | Alles · **Überschriften** · Text · Fussnoten |
| Fassungs-Zeile | Änderungsvermerke (Schalter) · FASSUNG / Gilt seit … (Element) · Fassungs-Zeitleiste (title) | **Fassung** überall |
| Kopf-Standausweis | Snapshot · Stand · geprüft (maschinell) | **Kopie vom …** / Stand |
| Trefferzähler | –/88 · 50 Artikel · 88 Fundstellen | **Fundstelle 0 von 88** |
| Gedankenstrich | – und — gemischt | ein Zeichen (App-weit «—» ist der Bestand) |
| Aktionen am Artikel | Zitat · Link (sichtbar) vs «Zitat kopieren», «Permalink kopieren» (aria) | sichtbar **Zitat kopieren · Link kopieren** (Hover-only, Platz da) |

## 5 · Säuberungs-Liste (nächster PR, priorisiert)

1. Ä98 `baueZitat` → `kennungText` (helpers.tsx:121) — falsche Fundstelle in der Zwischenablage.
2. Ä97 Vorbehalt nur im Kopf (UebersichtBox.tsx / uebersichtAngaben.ts).
3. Ä114 «Ansicht» statt Darstellung (LeserAnsichtV3.tsx:192,197 + title).
4. Ä112 Leser-Suchfeld nennt den Erlass (SuchSprungFeld.tsx:132, Platzhalter-Quelle).
5. Ä110 Aktionszeile: ein Name für den Fedlex-Link, eine Schreibung (ErlassLeserKopf.tsx, ArtikelLeser.tsx:510ff, UebersichtBox.tsx).
6. Ä100 doppelte Linie Ingress → 1. Titel.
7. Ä101 `hyphens` am h1 aus (ErlassLeserKopf.tsx).
8. Ä102 + Ä103 + Ä120 Trefferliste (LeserTrefferListe.tsx:106/273/~200–225, SuchBereichWahl.tsx).
9. Ä106 ★ nur in gemischten Gruppen (PanelEntscheide.tsx).
10. Ä121 «amtlich ↗» → Ziel nennen; Erklärtext Luft + Klartext (PanelAenderungen.tsx, PanelMaterialien.tsx).
11. Ä107 + Ä108 + Ä122 Steckbrief (uebersichtAngaben.ts).
12. Ä115 + Ä116 Schalter-Wortlaut (LeserAnsichtV3.tsx).
13. Ä119 Fussnav «Alle Gesetze» (Nachbar-Nav; Datei nicht sicher).
14. Ä117 ein Gedankenstrich (helpers.tsx:432, NormPopover.tsx, grep).
15. Ä111 aria «Gliederung öffnen» (LeserKopf.tsx) + Ä118 Leser-eigen «In neuem Fenster» (ReiterAktion.tsx); Snapshot → «Kopie vom …».

Nicht in den Nachzug: Ä99 (Doku-Korrektur jetzt, Bau später), Ä105 (Beiwerk-Entscheid), Ä109 (Korpus), Ä64/Ä113 (David),
Ä123 (Chip-Gesichter), Ä124 (Kern-Render), Ä125 (Messreihe), Ä9-Rest/Ä83/Ä33-34/Icon-Deckel (bekannt, H5/David).

## 6 · Nicht geprüft

Ä86 (Aussenklick bei offenem Panel), B1/B7 (Gliederungs-Blatt nach Tap, Taste «t»), Inhalt der Fassungs-Zeitleiste
(unter dem Viewport), Zeitraum-Filtermenü (Esc schloss vorher das Panel), Tastatur-Reihenfolge vollständig, Erhöhter-
Kontrast-Modus, axe, Safari/Firefox, Touch-Hover (`[@media(hover:none)]`), Ansicht-Menü im Split-Pane, OR #art-336c
(Anker im 1686-Artikel-Erlass innerhalb der Wartezeit nicht erreicht — Bild zeigt den Kopf), 1280/1920 nur Ruhe.

## 7 · Artefakte

- `screens/` — 127 PNG (Volltreue) · `view/` — JPEG-Kopien und Crops · `inventar.json` / `labels.txt` /
  `labels-chrome.txt` — Accessible-Name-Inventar (Text · aria-label · title · placeholder) je Bild ·
  `mess2.json`, Ausgabe `mess4.mjs` (Sticky-Messung) · `build.txt` (Live-Kennung) · `log.txt`.
- Skripte: `shoot.mjs`, `shoot2.mjs`, `shoot3.mjs`, `mess4.mjs`, `crop.py`.
