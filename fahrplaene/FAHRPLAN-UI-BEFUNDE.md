# FAHRPLAN — UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)
<!-- @lagebild name: Feinschliff-Befundliste · zweck: Abarbeitung der 210 Befunde einer externen Sichtprüfung (29.7.2026) in Paket-Kette. -->

**Heimat: ROADMAP-Schritt `W2·17-UI-BEFUNDE`** · Stand 31.7.2026 (Anlage AP-9, QS-TOK-Aufräumwelle).

Wortlaut aller 210 Befunde: [`docs/ui-befunde-2026-07/BEFUNDLISTE-COWORK-2026-07-29.md`](../docs/ui-befunde-2026-07/BEFUNDLISTE-COWORK-2026-07-29.md).
Hier steht **nur die Steuerung** — kein Volltext, keine zweite Wahrheit (§5).

---

## §0 · Quer-Lektionen (vor JEDEM Batch lesen)

**§0.1 Vintage-Regel.** Die Sichtprüfung stammt vom **29.7.2026**; seither ist gebaut worden
(u. a. W2·7-BEZUG B7 am 29.7.). **Vor jedem Batch werden die betroffenen Befunde am
Prod-Stand reproduziert** — genau nach der Spalte «Prüfen», die zugleich das Fertig-Kriterium
ist. Was sich nicht mehr reproduzieren lässt, wird als **«erledigt (überholt)»** geschlossen,
mit einer Zeile, warum. Nie blind bauen: ein Fix ohne vorher gesehenen Fehlschlag ist kein Fix.

**§0.2 Referenz-Pflicht.** Jeder Befund mit Dedup-Marker trägt eine `dedup_referenz`. Die wird
**vor** dem Bau gelesen. Wo der Bestand einen Entscheid dokumentiert hat (gebaut, verworfen,
aufgeschoben mit Grund), wird dieser Entscheid **nicht still gekippt** — entweder er trägt,
oder er wird ausdrücklich und begründet geändert (§14).

> **Anker-Form (Nachtrag 31.7.2026, Endprüfungs-Funde 16/17).** Eine **blosse Zeilenangabe
> ist kein gültiger Anker.** Sieben Referenzen waren schon zwei Commits nach dem Schreiben der
> Befundliste auf den Nachbarabsatz gerutscht (Kopfzeilen-Einschübe aus AP-7 und der
> Nachdiät), eine (LM-124) traf von Anfang an die falsche Stelle. Jede `dedup_referenz` nennt
> darum einen **§-, Überschriften- oder `@meta`-Anker**; eine Zeilenangabe darf nur
> *zusätzlich* danebenstehen und ist nie der Anker selbst.
>
> **Geltungsbereich — ehrlich begrenzt (Nachtrag 31.7.2026, Endprüfungs-Fund R2-21).** Die
> Regel gilt **ab sofort für jeden neuen Eintrag**. Der **Altbestand** ist NICHT vollständig
> umgestellt: in dieser Datei stehen weiterhin Referenzen mit blosser `Z.`-Angabe (u. a.
> LM-025, LM-095, LM-098). Umgestellt wurden bisher die sieben nachweislich verrutschten plus
> LM-124 und LM-096. **Auflage für den Altbestand:** jede noch vorhandene Zeilenangabe trägt
> beim nächsten Anfassen zusätzlich den §-/Überschriften-Kontext, und zwar im Batch, der den
> Befund baut (`B1`…`B20`) — nicht in einem eigenen Durchgang. Bis dahin ist die Regel eine
> **Vorwärts-Regel**, keine erfüllte Bestands-Aussage (§8: nicht mehr behaupten, als gedeckt ist).

**§0.3 Risiko-Trennung.** Der grösste Teil ist reine Darstellung (§3) und läuft ohne
Gegenprüfung. Drei Klassen laufen anders: **Such-/Query-Logik** (Relevanz, Ranking,
Substring-Treffer) — nie «UI-Fix», sondern eigener Nachweis; **§1-nahe Logik** (Eingabe-Parsing,
Formate, die in eine Engine laufen); **Risiko-Pfade** nach `istRisikoPfad()` →
`npm run check:gegenpruefung`. Die Risiko-Klasse steht in der Fussnote jedes Batches.

**§0.4 Werkzeug-Falle Scroll-Prüfung (B7-Lehre, 8.8.2026).** Programmatisches
Scrollen (`window.scrollBy`, CDP-Scroll) feuert KEINE echten Browser-Events —
wer Scroll-VERHALTEN (Menü-Schliessen, Listener) prüft, muss echte
`wheel`/`touchmove`-Eingaben senden (Playwright `mouse.wheel`), sonst täuscht
die Probe. Kostete in B7 eine Fehlrunde an LM-009.

**§0.5 SSoT.** Wortlaut ausschliesslich in `docs/ui-befunde-2026-07/`. Der Fortschritt
ausschliesslich hier (Checkboxen) und in `ROADMAP.md` (`@meta status`). Kein Feld doppelt.

---

## §7 · B6 — Fehler-, Leer- und Ladezustände (K-15)

**14 Befunde** · Blocker 1 · Hoch 9 · Mittel 2 · Detail 2 · `W2·17-UI-BEFUNDE-B6`

- [x] **LM-159** · Blocker · Das eingebettete PDF erscheint als grosse schwarze Fläche (gemessen 965 × … [Verdacht → FAHRPLAN-GESETZES-UX.md §2.2 ⑦ PDF_EMBED (Z. 259-262) / G3a-Ausführungsvermerk; Code src/pages/…] — **gebaut** (Commit `2096971ac`): Ladezustand + sichtbare Rahmenbeschriftung in `PdfEmbedAnsicht`.
- [x] **LM-160** · Hoch · Die Meldung «EINGABEFEHLER · Fristlänge muss eine ganze Zahl > 0 … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix inkl. error) + Repo-Präzedenz src/components…] — **gebaut** (Commit `b76e344cf`): aria-invalid + globale `.lc-input[aria-invalid]`-Regel.
- [x] **LM-161** · Hoch · `/rechner/prozesskosten`, `/rechner/notariat-grundbuch`, `/rechner/gerichtszitat` und `/rechner/betreibungskosten` enden im Ausgangszustand direkt nach der … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1 N0d/W1 (Streitwert-Platzhalter, ✅ gebaut 11.7.2026) + FAHRPLAN-UI-…] — **teils erledigt (überholt), teils gebaut** (Vintage-Regel §0.1, Commit `db5670a5c`): prozesskosten/notariat-grundbuch/betreibungskosten tragen `ErgebnisPlatzhalter` bereits (QS-UI-8b-Nachzug); nur `GerichtszitatForm` fehlte er noch.
- [x] **LM-162** · Hoch · Der Ergebniskasten hat eine feste Höhe von 384 px. Im Ausgangszustand … [Verdacht → FAHRPLAN-GESETZES-UX.md §11 IA-3 (A–Z-Register) + Code src/pages/gesetze-teile/AzRegister.tsx, Datei-Kopf «Perf (§15/R-PERF-5)» (§0.2-Anker-Nachzug: die frühere `:1…`-Zeilenangabe ist ersetzt)] — **gebaut** (B6-N1, 30.8.2026, Entscheid David 8.8.2026): `h-96` → `max-h-96`. Der `h-96`-Entscheid wird ausdrücklich GEÄNDERT, nicht still gekippt — Herleitung im Datei-Kopf: die PR-#347-Gegenmittel gegen die INPUT-FREIEN Shifts bleiben unverändert (kein content-visibility, `key` am `<ul>`), die Aussenhöhe ändert sich nur auf Buchstaben-Klick. Der leere Ausgangszustand war schon **erledigt (überholt)** (Befund 19, 18.8.2026, §0.1). Rot-Beweis 30.8.2026: «Z» (3 Titel) mass 384 px Rahmen; danach grün, CLS-Tore (`gesetze-az-register` V→G unter Drossel 6×, `gesetze-footer-cls`) unverändert 0.
- [ ] **LM-163** · Hoch · Beim Scrollen erscheint ein vollständig leeres Fenster, das erst nach kurzer … — **Verdacht widerlegt, nicht reproduzierbar** (Nachprüfung 9.8.2026, W2·19-DoD): 1'469 einzeln ausgewertete Screencast-Frames, davon 1'042 auf Leser-Flächen (OR/ZPO, 1×/4×, hell/dunkel) — **0 Leer-Frames**; die frühere B6-«Live-Repro» war ein Werkzeug-Artefakt (mouse.wheel ÜBER das Seitenende erzeugt headless 40–60 % Leer-Frames auf JEDER Seite, auch auf einer nackten HTML-Kontrollseite ohne LexMetrik-Code; Tastatur-Kadenz auf derselben Seite: 0 %). Der content-visibility-Verdacht (GESETZES-UX §10.9) ist damit zurückgezogen; Mess-Hygiene-Regeln daraus → Skill `perf` §Messung. OFFEN bleibt: (a) headed GPU-Compositing/Trackpad-Momentum (headless nicht prüfbar — Davids Beobachtungsbedingung), (b) plausible Alternativ-Erklärung: ECHTE ~370-px-Leerfläche am Ende der Liste `/gesetze?ebene=bund` (Footer klebt nicht am Boden) füllt beim Scroll ans Ende den halben Bildschirm — risikoarm prüf-/behebbar (Fehlerbuch-Zeile W2·18). Status: offene Beobachtung — falls David es wieder sieht: Seite, Scrollrichtung und ob am Seitenende notieren.
- [x] **LM-164** · Hoch · Artikel ohne erfasste Rechtsprechung zeigen gar nichts — bei Art. 368, … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.3/§0 (Badges nur für Abweichungen, Default nackt; Zähler «n erfasste …») + FAHRPLAN-UI-NAVIGATION.md §0 Ziff. 4] — **erledigt (überholt)** (B6-N2, 30.8.2026, Vintage-Regel §0.1 — kein Fix ohne vorher gesehenen Fehlschlag). Reproduktion am gebauten Stand (`vite preview`, `/gesetze/bund/OR`, 1440 px), Art. 366–372 einzeln im DOM ausgewertet: **kein** Artikel trägt eine Rechtsprechungs-Zeile — weder `[data-bezuege-zeile]` noch `[data-leitfall-zeile]`, die Beiwerk-Zone ist an allen sieben leer. Die im Befund beschriebene Asymmetrie («366 trägt LEITENTSCHEIDE 1, 368 nichts») kann nicht mehr entstehen: die V1-Hülle, in der sie am 29.7.2026 gesehen wurde, ist am 21.8.2026 gelöscht (H5); V3 reicht `bezuege` bewusst gar nicht mehr an `ArtikelLeser` (Herleitung in `v3/LeserLesespalte.tsx`, «H3 · POS. 12»), die Entscheide stehen im Reiter «Entscheide». **Die §8-Substanz des Befundes ist dort bereits gebaut** und trennt sogar schärfer als verlangt — `v3/PanelEntscheide.tsx` kennt DREI Zustände mit drei Sätzen: «Keine Instanz eingeschaltet» (Bedienung) · «Entscheide werden geladen …» (Wissen) · «Zu Art. N ist kein Entscheid der eingeschalteten Instanzen erfasst.» (Bestand). Der VZUI-Entscheid «Default bleibt nackt» musste dafür nicht geändert werden. **Offener Rest-Punkt für David (nicht gebaut, Entscheid-Frage):** der Panel-ÖFFNER (⚖) bildet «noch nicht geladen» und «geladen, null erfasst» auf dieselbe Beschriftung ab (`panelModell.ts` `oeffnerLabel`: `null` und `0` beide → «Rechtsprechung»). Ein «keine erfasst» am geschlossenen Öffner wäre die letzte Meile von §8 — es stünde aber dauerhaft an ~79 % der Erlasse ohne Bezugs-Shard und ist damit eine Geschmacks-/Prominenz-Frage, keine Bau-Aufgabe; der offene Reiter sagt den Satz bereits.
- [x] **LM-165** · Hoch · Der Assistent meldet korrekt «EINGABEFEHLER · Zweck der Offenlegung angeben.» und … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix, error) — gemeinsame Klasse mit LM-160] — **gebaut** (Commit `b76e344cf`), gemeinsamer Muster-Pass mit LM-160.
- [ ] **LM-166** · Hoch · Sachgebiete ohne Treffer verschwinden ersatzlos aus der Liste: ungefiltert stehen sechs … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6 J3 (Sachgebiets-Pipeline, Risiko-Pfad QS-GP) + §2 S5-Etappe 2 (Fac…] — **übersprungen** (B6-Bau-Session, Risiko-Pfad-Fläche `istRisikoPfad`/QS-GP, per Bau-Auftrag ausgenommen).
- [x] **LM-167** · Hoch · Beim EMRK fehlt die Lese-Leiste vollständig — kein «Im Gesetz suchen», … [Verdacht → FAHRPLAN-GESETZES-UX.md G2b-Ausführungsvermerk (Z. 567-569: «der pdf-embed-Kopf NICHT … keine t…] — **gebaut** (Commit `2096971ac`): sichtbarer Hinweis auf fehlende Werkzeuge, Ergänzung des G2b-Entscheids.
- [x] **LM-168** · Hoch · Unter dem PDF folgt eine Liste von BGE mit Regeste-Auszügen, die … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §8-Badge-Vokabular («maschinell» = «Automatisch zugeordnet — keine re…] — **gebaut** (Commit `2096971ac`): `kuerzeRegeste` wortgrenzen-sicher (SSoT), Anzeige-Absicherung in KontextPanel, sichtbarer Vorbehalt im «Rechtsprechung»-Panel. Datenregeneration von `public/rechtsprechung/register.json` bleibt offen (TABU `public/`/`scripts/` in diesem Batch — eigener Daten-Schritt nötig).
- [x] **LM-169** · Mittel · Der Block beschreibt eine Tabelle, die ohne Ereignisdatum nicht gerendert wird. … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Zustandsmatrix: empty) — gemeinsame Klasse mit LM-161] — **gebaut** (Commit `3b6fc50c7`).
- [x] **LM-170** · Mittel · Der Balken «RECHTLICHER HINWEIS – KEINE RECHTSBERATUNG» erscheint zweimal — einmal … [neu] — **gebaut** (Commit `6301e61d5`).
- [x] **LM-171** · Detail · Der Untertext bricht mitten im Satz ab: «Fristende ist Werktag bzw. … [neu] — **gebaut** (Commit `746bed1a1`).
- [x] **LM-172** · Detail · Dieselbe Aussage einmal gross, einmal klein geschrieben: «Staatlich anerkannte Feiertage …» … [neu] — **gebaut** (Commit `3b6fc50c7`).

**Code-Flächen (grob, aus den Routen):** `src/components/fehlermeldung.ts`, `src/components/ErrorBoundary.tsx`, `src/components/suche/SucheLeerzustand.tsx`, `src/pages/NotFound.tsx`.
**Risiko-Klasse:** reines UI — Text der Zustände ist §8-relevant (Ehrlichkeit, keine Beschönigung).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §8 · B7 — Overlays und Menüfenster (K-02)

**8 Befunde** · Blocker 1 · Hoch 3 · Mittel 4 · Detail 0 · `W2·17-UI-BEFUNDE-B7`

- [x] **LM-008** · Blocker · gebaut (`96c9fcbae`) — Trefferpanel im Header-Dropdown ab 640 px viewport-verankert (fixed) statt feldbreit, bis 1400 px; Titel/Snippets/Badges wieder lesbar auf jeder Breite.
- [x] **LM-009** · Hoch · gebaut (`f4bc4cead`, Nachbesserung `2edb4ae6f`) — Ansicht-Menü schliesst jetzt bei echtem Scrollen (wheel/touchmove) und Resize, zusätzlich zu Escape/Klick-ausserhalb. Erster Anlauf (generisches `scroll`-Event) verursachte eine Regression in `leser-kopf-a9.e2e.ts` (Browser-Scroll-Anchoring beim Fussnoten-Toggle schloss das Menü ohne Nutzer-Geste) — per Nullprobe (§0.3) erkannt und korrigiert.
- [x] **LM-010** · Hoch · **erledigt (überholt)** (B7-N1, 30.8.2026, Vintage-Regel §0.1). Der Befund beschreibt ein «rund 460 px hohes Rechtsprechungs-Menü, das über dem Gesetzestext liegt». Gemessen am gebauten Stand @1440 (`/gesetze/bund/OR`): der Öffner ⚖ erzeugt **gar kein Overlay** — seit H3/Ä60 (18.8.2026) steht die Fläche als eigene Layout-SPUR neben dem Text (`rahmenSpalten`, `usePopoverAutoZu` Modus `spalte`), nicht darüber. Ein Scrim wäre dort sachlich falsch; die Zusage von `kopfStufen.panelForm` («Lesetext bleibt sichtbar und LESBAR, Panel ist Beiwerk») ist am 17.8.2026 mit Ä52 ausdrücklich gegen einen Scrim entschieden worden. Der Scrim-Teil des Befundes ist über LM-015 gebaut, wo er zutrifft.
- [x] **LM-014** · Hoch · gebaut (`5a24e8d50`) — Lesemodus zeigt jetzt dieselben Rubrum-Zeilen (Gegenstand/Parteien/Vorinstanz/Besetzung) wie die Voll-Ansicht, über dieselbe kopfModell()-Ableitung (§5).
- [x] **LM-015** · Mittel · **gebaut** (B7-N1, 30.8.2026, Entscheid David 8.8.2026): Scrim hinter dem «Ansicht ▾»-Menü — `createPortal` am `<body>`, `fixed inset-0 z-[16] bg-black/30`, Klick schliesst, `aria-hidden`, kein Tab-Stopp. Reproduziert war der Scrim-Teil: das Menü mass 240 × 199 px auf deckendem `paper-raised`, ohne jede Abdunklung dahinter. **Die Regel, die den Bau trägt und ihn zugleich begrenzt: DER SCRIM FOLGT DER FOKUS-FALLE, nicht der Fläche.** «Ansicht ▾» läuft im Modus `popover` und fängt den Fokus (`useDialogFokus`) — es war längst modal und sagte es nur nicht; `beiwerk`/`spalte` fangen ihn bewusst nicht und bleiben scrimlos (Ä52 unangetastet, eigener Wächter-Fall). Der «sichtbare Bezug zum auslösenden Knopf» ist mitgelöst, ohne zweites Bauteil: `z-[16]` liegt UNTER dem klebenden Kopf (`z-[17]`), Öffner und Menü stehen scharf im abgedunkelten Feld. **Nebenbefund mitbehoben:** der modale Blatt-Scrim (`LeserPanelZone`) stand auf `bg-ink-900/30` — `--ink-900` flippt mit dem Thema (dunkel `#E9E7E2`) und hellte im Dunkelmodus AUF statt abzudunkeln; jetzt `bg-black/30` wie die Shell-Schublade. Beweis: neuer Wächter `e2e/leser-v3-scrim-b7n1.e2e.ts` (7 Fälle, zuerst 4 rot gesehen), Deckfarbe in beiden Themes gegen denselben Wert; Leuchtdichte im Lesefeld gemessen hell 237.5 → 166.1, dunkel 32.7 → 23.0 (je −30 %).
- [ ] **LM-016** · Mittel · **zurückgestellt, nicht gebaut** — Root-Cause ist strukturell, nicht im Sprachmenü: die Topbar-Icon-Zeile endet (bei 1440 px) rund 126 px vor dem rechten Rand der `.max-w-content`-gekapselten Brotkrumleiste darunter, darum bleibt deren ✕ neben dem korrekt am Trigger verankerten Panel sichtbar. Eine Menü-Breite/-Position, die das kaschiert, wäre eine fragile Magic-Number-Lösung; der eigentliche Fix (Topbar-Icon-Zeile an `max-w-content` ausrichten) berührt die Topbar auf JEDER Route mit Brotkrumleiste — braucht einen eigenen, bewusst entschiedenen Schritt statt eines Bauteils in diesem Batch.
- [x] **LM-018** · Mittel · gebaut (`96c9fcbae`) — Trefferzahl-Zeile («N Treffer, davon …») trägt im Header-Dropdown jetzt einen eigenen Hintergrund (bg-paper); sie lag zuvor transparent über der Brotkrumleiste (Hero/`/suche` unberührt, dort dieselbe Komponente ohne Hintergrund-Problem).
- [x] **LM-019** · Mittel · gebaut (`5a24e8d50`) — das Haupt-H1 trägt `hidden`, solange der Lesemodus offen ist (vorher zwei H1 mit identischem Text gleichzeitig im DOM). Die im Befund behauptete Schrift-Abweichung war bereits code-widerlegt (beide H1 identisch `text-h2 sm:text-h1 font-display font-semibold`, Dedup-Notiz).

**Code-Flächen (grob, aus den Routen):** `src/components/layout/HeaderSuche.tsx`, `src/components/layout/ReiterUebersicht.tsx`, `src/components/layout/VerlaufUebersicht.tsx`, `src/components/suche`.
**Risiko-Klasse:** reines UI (Verankerung, Fokus, Schliessverhalten).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §9 · B8 — Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)

**10 Befunde** · Blocker 1 · Hoch 3 · Mittel 4 · Detail 2 · `W2·17-UI-BEFUNDE-B8`

- [ ] **LM-021** · Hoch · Das Menü enthält zwei Erklärabsätze in 11 px Grauschrift, zusammen rund … [Verdacht → src/components/verzahnung/BezugFacettenWahl.tsx:152–158; src/components/verzahnung/BezugZeitWah…]
- [ ] **LM-022** · Hoch · Die Filterschalter zeigen keinen erkennbaren Aktivzustand: «alle» sieht aus wie «AG». … [Verdacht → ROADMAP.md → W2·7-BEZUG B7 + ROADMAP-CHRONIK.md → W2·7-BEZUG (B7, done 29.7.2026); src/components/v…]
- [ ] **LM-023** · Mittel · «Linien», «Fussnoten» und «Verweise» tragen rechts ein ausgeschriebenes «✓ an» bzw. … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz, §13-F4-Zustandsmatrix, Z.65–72); src/pages/gese…]
- [ ] **LM-024** · Mittel · Das Balkendiagramm zeigt sechs verschieden hohe Balken ohne Werte, ohne Achsenbeschriftung … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9 B5; src/components/verzahnung/BezugZeitWahl.tsx:1–34 +…]
- [ ] **LM-025** · Detail · Neben «Fussnoten» steht eine unerklärte Zahl (932); bei «Linien» und «Verweise» … [Verdacht → FAHRPLAN-GESETZES-UX.md Z.1430 (A26, David 11.7.2026); src/pages/gesetz-leser/LeserAnsichtMenu.…]
- [ ] **LM-026** · Detail · «aus» und «Fussnoten» stehen inline nebeneinander, «Chronologie» steht darunter in eigener … [neu]
- [ ] **LM-061** · Blocker · Die letzte Karte bzw. der letzte Chip wird am rechten Containerrand … [Verdacht → abnahme/responsive-audit/BERICHT.md D10 + D11 + Systematik-Befund S-B; FAHRPLAN-UI-NAVIGATION.md §6 J2 (#57-Rest); Code `src/components/start/NewsHeader.tsx` (Streifen-`div` am `streifenRef`) · `src/components/start/ZuletztVerwendet.tsx` (Streifen-`div`) · Muster `src/components/rechtsprechung/SachgebietKacheln.tsx` (Verlauf-`div` unter der `<ul>`)] — **VORGEMESSEN, NICHT GEBAUT** (B7-N1-Session, 30.8.2026): der Bau ist genau dort blockiert, wo die Dedup-Notiz es vorhergesagt hat. Reproduktion am gebauten Stand `/` @1440: **genau EIN** waagrecht überlaufender Streifen auf der Seite — die News-Reihe (`overflow-x-auto pb-1.5`), sichtbar 1'072 px, Inhalt 3'660 px, **2'588 px verborgen**, ohne Verlauf, ohne Maske, ohne sichtbare Scrollleiste. Die «Zuletzt verwendet»-Reihe erscheint in einer frischen Sitzung gar nicht (sie lebt vom lokalen Verlauf) und war darum nicht messbar. Damit liegt die einzige heute reproduzierbare Hälfte des Blockers auf **D11**, dem dokumentierten Entscheid «bewusstes Karussell — die angeschnittene Karte IST die Affordanz». **Entscheid-Frage an David (§0.2, nicht still gekippt):** trägt eine angeschnittene Karte als einzige Affordanz für 2'588 px verborgenen Inhalt (rund 2½ Streifenbreiten)? Wenn nein, ist die saubere Bauform nicht der statische Verlauf von D10 — der behauptet auch dann «hier geht es weiter», wenn nichts mehr kommt (§8) —, sondern eine Affordanz, die den Scrollstand kennt und je Seite nur dann steht, wenn dort wirklich mehr liegt; sie gehört als geteiltes Bauteil an alle drei Streifen (§5/§10), nicht als vierte Kopie.
- [ ] **LM-063** · Hoch · Unter etwa 800 px wird der letzte Tab abgeschnitten («Schiedsverfah»). Kein … [Verdacht → abnahme/responsive-audit/BERICHT.md S-B + D10 (Chip-Band-Affordanz gefixt in SachgebietKacheln.…]
- [ ] **LM-064** · Mittel · Der Gliederungskasten hat eine feste Höhe und schneidet die letzte sichtbare … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E4/A32 (Kontextpanel im TOC-Scroller, gebaut 25.7.2026, PR #346)…]
- [ ] **LM-065** · Mittel · In einem 560 px breiten Reiter ist ein einzelner Entscheid-Chip («Appellationsgericht … [Verdacht → ROADMAP-CHRONIK.md:1227–1245 (W2·7-BEZUG B7, gebaut 29.7.2026, PR #406 5a10f8150); Code: src/pa…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/components/forms`, `src/index.css`.
**Risiko-Klasse:** reines UI — Zählwerte in Menüs müssen der Datenlage entsprechen (§8).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §10 · B9 — Textsatz und Umbruch (K-12)

**12 Befunde** · Blocker 1 · Hoch 2 · Mittel 4 · Detail 5 · `W2·17-UI-BEFUNDE-B9`

- [ ] **LM-122** · Blocker · Die H1 bricht mitten im Wort: «Geheimhaltungsvereinbarun / g (NDA)» — … [Verdacht → FAHRPLAN-GESETZES-UX.md Z.162-165 (Silbentrennungs-Fix, G1 ✅) + DESIGN-REGLEMENT-NORMTEXT.md Z.…]
- [x] **LM-123** · Hoch · Die Textspalte hat über die 1686 Artikel des OR sechs verschiedene … [Verdacht → DESIGN-REGLEMENT-NORMTEXT.md Z.174-183 (Einzug-Skala, Deckel 5 Stufen) + FAHRPLAN-GESETZES-UX.m…] **✅ behoben 29.8.2026 durch PR #570 (Staffelung aufgehoben — eine Textkante; der Verdachts-Zeiger auf die Einzug-Skala §4b ist mit deren Streichung gegenstandslos).**
- [ ] **LM-124** · Hoch · Auf 140 % werden die Verfahrensphasen-Leiste («Materielle Fr…») und der Suchfeld-Platzhalter … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D5 (A−/A+-Steller beschnitten, Such-Placeholder auf…]
- [ ] **LM-125** · Mittel · Der Hinweis läuft über rund 1070 px bei 11 px Schriftgrösse … [Verdacht → DESIGN-REGLEMENT.md §B2b-Zeile der Audit-Tabelle («Lesespalte ✅ erfüllt, 38× max-w-reading») +…]
- [ ] **LM-126** · Mittel · 19 verschiedene Schriftgrössen über 41 Seiten, darunter Paare wie 14 und … [Verdacht → DESIGN-REGLEMENT.md §B2-Zeile der Audit-Tabelle («🟡 teilweise … 22× text-[…rem] + 6× text-sm/ba…]
- [ ] **LM-127** · Mittel · Vor einem Komma steht ein Leerzeichen: «Dr. A. Pfleiderer (Vorsitz), C. … [Verdacht → public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/AH.2025.7.json (Feld rubrum.beset…]
- [ ] **LM-129** · Mittel · Die Regeste-Auszüge brechen mitten im Wort mit Auslassungspunkten ab («… gehören … [Verdacht → ROADMAP.md → W2·6-BGE, Chronik `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug («BGE-Auszug abgeschnitten — vollständig gefixt 34/34», Schutz-Tor U+20…]
- [ ] **LM-130** · Detail · Text läuft aus der Karte heraus: «Grundausstattung» ragt über den Rand. [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D1 + Systematik-Befund S-C («Grid-Fremdkinder auf Mo…]
- [ ] **LM-131** · Detail · Label-Stile gemischt: oben Monospace-Versalien («DATUM (EREIGNIS)», «FRIST»), im unteren Rechnerteil Grotesk … [Verdacht → DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel» (Z.393-399: Mono nur Zahlen/Aktenzeichen) + src/ind…]
- [ ] **LM-132** · Detail · Leerzeichen vor dem Komma: «Dr. med. R. von Aarburg , Dr. … [Verdacht → public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/UV.2023.8.json (rubrum.besetzung:…]
- [ ] **LM-133** · Detail · Uneinheitliche Schreibweise des Ingress-Datums: «Vom 23. März 2005 (Stand 3. November … [Verdacht → public/normtext/struktur/bund/*.json (Zeichenkette «Stand am …» steckt im extrahierten Quelltex…]
- [ ] **LM-134** · Detail · Vor jedem Auszug steht ein «★» ohne Beschriftung und ohne Legende; … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §0/1b + §1.2 + Abnahme-Szenario 4 («Studentin am ★ bekommt an allen v…]

**Code-Flächen (grob, aus den Routen):** `src/components/typografie.tsx`, `src/index.css`, `src/components/NormText.tsx`.
**Risiko-Klasse:** reines UI — Umbruch in Normtext darf den Wortlaut nicht verändern (§7).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §11 · B10 — Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)

**7 Befunde** · Blocker 1 · Hoch 1 · Mittel 5 · Detail 0 · `W2·17-UI-BEFUNDE-B10`

- [ ] **LM-084** · Blocker · Die Sprungmarken «↓ Ergebnis» und «Vorschau ↓» sind bei 390 px … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1 N0d/W5 («↓ Ergebnis»-FAB per IntersectionObserver ausblenden — ✅ g…]
- [ ] **LM-086** · Hoch · Der Rücksetz-Link «zurücksetzen» erscheint nur, wenn die Richter-Auswahl gesetzt ist. Bei … [Verdacht → Code: src/components/rechtsprechung/EntscheidFilter.tsx:149–170 + :265 — Kommentar dokumentiert…]
- [ ] **LM-090** · Mittel · Jede Zeile trägt vier Symbolknöpfe (▲ ▼ ⧉ ✕) von je … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass) und §1 N0d/O3 (Reiter-Tracker); abnahme/respo…]
- [ ] **LM-091** · Mittel · Beim Überfahren erscheint rechts oben eine Leiste «Zitat | Link | … [Verdacht → FAHRPLAN-GESETZES-UX.md §12.5 (EID-2 ✅ 25.7., PR #349 — «David-Gate Platzierung … Sichtprüfung…]
- [ ] **LM-095** · Mittel · Der gewählte Name steht als Chip «C. Müller ×» rechts neben … [Verdacht → ROADMAP.md Z.485-489 R-RICHTER «Block B offen, reines UI (Autocomplete-Facette + ?richter-URL-A…]
- [ ] **LM-096** · Mittel · Neben jedem Normchip steht ein eigenes, etwa 16 px grosses Kopiersymbol … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md **§0. Kritik-Einarbeitung**, Tabellenzeile 3b (Grammatik-Regel 1: «⧉ nur auf KontextPanel-Chips + NormPopover…]
- [ ] **LM-098** · Mittel · Zwei Paare «A− A+» sind gleichzeitig sichtbar: eines links in der … [Verdacht → Reglement-Konflikt: DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.200-203 R17 (Reader-eigener A−/A+) geg…]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/pages/gesetz-leser`, `src/components/rechtsprechung`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §12 · B11 — Karten (K-04)

**13 Befunde** · Blocker 0 · Hoch 4 · Mittel 7 · Detail 2 · `W2·17-UI-BEFUNDE-B11`

- [ ] **LM-027** · Hoch · Die Metazeile der Karten («1'458 Erlasse im Volltext», «23 Rechner», «26 … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648); src/components/start/RubrikK…]
- [ ] **LM-028** · Hoch · Dasselbe Muster: «ESTV · Stand 01.02.2022» hängt am Titel statt am … [Verdacht → befundliste.json LM-027 (interne Dublette, gleiches Muster andere Route); FAHRPLAN-ARCHIV-RESTP…]
- [ ] **LM-029** · Hoch · Die Zähler (10, 4, 5, 12, 3 …) sitzen direkt hinter … [neu]
- [ ] **LM-030** · Hoch · Die Sachgebietszeile im Kartenkopf bricht je nach Länge auf eine bis … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648)]
- [ ] **LM-031** · Mittel · Unter dem Inhalt der Erlass-Karten bleiben bis zu 62 px leer … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–649); Code src/components/normtext…]
- [ ] **LM-032** · Mittel · In Ergebniskartenreihen fehlt einzelnen Karten die dritte Zeile (Normzeile); unter dem … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/vorlagen/ui.tsx:210–220 (EckdatenKach…]
- [ ] **LM-033** · Mittel · Die hervorgehobene Karte einer Dreierreihe ist durch ihre Akzentlinie 3–4 px … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/index.css:580–585 (.lc-tile 1px-Rahmen vs. .lc-a…]
- [ ] **LM-034** · Mittel · Werte in einer Kartenreihe mischen Schriftarten: «Neues Recht (ab 1.1.2023)» grotesk … [Verdacht → DESIGN-REGLEMENT.md §4b(e) «Zwei-Stimmen-Regel» (Z.394–399: «Mono nur Zahlen/Aktenzeichen»); Co…]
- [ ] **LM-035** · Mittel · Drei Karten in einer Reihe mit drei verschieden bestückten Metazeilen: EMRK … [Verdacht → FAHRPLAN-GESETZES-UX.md §2 Grundarten ⑦ PDF_EMBED / ⑧ LIVE_VERWEIS (Z.259–266); Code src/compon…]
- [ ] **LM-036** · Mittel · Der Titel ist auf zwei Zeilen begrenzt, füllt sie aber nicht … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/rechtsprechung/EntscheidKarte.tsx:60–…]
- [ ] **LM-037** · Mittel · In einer etwa 20 px hohen Zeile stehen drei Schriftbilder nebeneinander: … [Verdacht → DESIGN-REGLEMENT.md §4b(e) Zwei-Stimmen-Regel; Code src/components/rechtsprechung/EntscheidKart…]
- [ ] **LM-038** · Detail · Die Karte «Kantone» trägt eine Zusatzzeile «Erfassungsgrad je Kanton: vollständig · … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.2 «Erfassungsgrad-Semantik (SSoT, BINDEND)» + IA-2 (✅ gebaut 16.7.2…]
- [ ] **LM-039** · Detail · Die Karte enthält nur «–» neben zwei gefüllten Karten. [Verdacht → DESIGN-REGLEMENT.md F4 (Zustands-Matrix inkl. empty-State, Z.200–203) + FAHRPLAN-UI-QUALITAET.m…]

**Code-Flächen (grob, aus den Routen):** `src/components/Katalog.tsx`, `src/components/start`, `src/components/ui`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §13 · B12 — Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)

**11 Befunde** · Blocker 0 · Hoch 4 · Mittel 7 · Detail 0 · `W2·17-UI-BEFUNDE-B12`

- [ ] **LM-066** · Hoch · Bedienelemente derselben Zeile sind unterschiedlich hoch: Segmentschalter 39 px neben Datumsfeld … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (UX-PUNKTELISTE A3, Betreibungskosten-Kacheln items-start sta…]
- [ ] **LM-067** · Hoch · Auswahlfelder schneiden ihren Wert hart ab, nie mit Auslassung: «– Vorlage … [Verdacht → abnahme/responsive-audit/BERICHT.md D9 (Gesetze-Suchkürzel «hart ohne Ellipsis abgeschnitten»…]
- [ ] **LM-068** · Hoch · Platzhalter werden mitten im Wort abgeschnitten: «Suchen oder Nc» (Kopfleiste mobil), … [Verdacht → abnahme/responsive-audit/BERICHT.md D9 (gefixt: Placeholder «Suchen — Kürzel, Titel, SR-Nr. …»…]
- [ ] **LM-069** · Hoch · Die Liste enthält zwei Einträge mit identischer Beschriftung und verschiedenen Zahlen: … [neu]
- [ ] **LM-070** · Mittel · Das native Datumsfeld ist 52 px hoch, das Zahlen- und das … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3, Zeilen-Ausrichtung Rechner-Formulare, David-Abnahme offe…]
- [ ] **LM-071** · Mittel · Für denselben Bauteiltyp existieren drei rechte Reserven für das Chevron: 38 … [neu]
- [ ] **LM-072** · Mittel · Einzelne Felder sind willkürlich schmal: «Lebende Kinder (Anzahl)» rund 110 px, … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Ausrichtung in Rechner-Formularen, auto-r…]
- [ ] **LM-073** · Mittel · Das obere Datumsfeld ist ein natives Browserfeld mit Standard-Kalendersymbol und abweichendem … [neu]
- [ ] **LM-074** · Mittel · Die Anzeige folgt der Browsersprache, nicht der Seitensprache: «07/29/2026» statt «29.07.2026». … [neu]
- [ ] **LM-075** · Mittel · Die beiden Datumsfelder sind Browser-Standardfelder und fallen aus dem übrigen Formularbild: … [neu]
- [ ] **LM-076** · Mittel · Das Kästchen ist der Browser-Standard, gemessen 13 × 15.8 px — … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/forms`, `src/components/DatumsFeld.tsx`, `src/components/BetragsFeld.tsx`, `src/components/ui`.
**Risiko-Klasse:** gemischt — Datums-/Zahlenfelder speisen Rechen-Engines: Eingabe-Parsing ist §1-nah.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §14 · B13 — Zahlen-, Datums- und Zählformate (K-11)

**12 Befunde** · Blocker 0 · Hoch 3 · Mittel 5 · Detail 4 · `W2·17-UI-BEFUNDE-B13`

- [ ] **LM-108** · Hoch · Drei Tausendertrennzeichen im Einsatz: typografischer Apostroph 1’000 (`/`, `/rechner/teuerung`), gerader Apostroph … [Verdacht → src/lib/konventionen.ts (SSoT Formulierungsstandard: «CHF 50'000», gerader Apostroph) + PROJEKT…]
- [ ] **LM-109** · Hoch · Die Zahlen der drei Filterzeilen folgen nach dem Filtern verschiedenen Regeln: … [Verdacht → DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.184 R15 (Facetten mit Trefferzahl) + dokumentierter Code-E…]
- [ ] **LM-110** · Hoch · Alle drei verbliebenen Chips zeigen dieselbe Zahl: «Alle 140 · Kantone … [Verdacht → W2·7-BEZUG B7 (c), Commit 5a10f8150 / PR #406: «Ein Schalter, der in 98,5 % der Fälle nichts be…]
- [ ] **LM-111** · Mittel · «5%» ohne Abstand auf `/rechner/kuendigung`, `/rechner/verzugszins` und `/rechner/inkasso-strecke`, sonst «5 %». [Verdacht → src/lib/konventionen.ts:44 — Regel «Prozent mit Leerschlag («5 %», nicht «5%»)», Muster /\d%/ i…]
- [ ] **LM-113** · Mittel · «+1weitere» — fehlendes Leerzeichen. Erscheint auf jeder Artikelgruppe. [neu]
- [ ] **LM-114** · Mittel · Dieselbe Etikette bedeutet Verschiedenes: Bei der DSGVO steht «Stand 27.04.2016» — … [neu]
- [ ] **LM-115** · Mittel · Ein Platzhalter bleibt stehen: Die Beschriftung lautet «Nachwirkungsfrist vereinbaren (Geheimhaltung gilt … [neu]
- [ ] **LM-116** · Mittel · Ungefiltert steht «5093 Entscheide · 1259 Leitentscheide · 1248 Volltext-Verweise», nach … [neu]
- [ ] **LM-117** · Detail · Der Platzhalter lautet hier «tt.mm.jjjj» in Kleinbuchstaben, in den Rechnern «TT.MM.JJJJ» … [neu]
- [ ] **LM-118** · Detail · Kürzel stehen meist in Klammern («Medizinprodukteverordnung (MepV)»), einmal aber freistehend in … [neu]
- [ ] **LM-119** · Detail · Die Zahl «1'469 Erlasse nach Titel» ist in gesperrter Monospace gesetzt … [neu]
- [ ] **LM-121** · Detail · «Zuständigkeit & Rechtsmittel (ZPO) → · Streitwert (ZPO) → · Fristenrechner … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/locale.tsx`, `src/components/ErgebnisAnzeige.tsx`, `src/components/forms`.
**Risiko-Klasse:** gemischt — Formatierung ist Darstellung, aber jede Zahl stammt aus einer Engine (§3).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §15 · B14 — Brotkrume, Kopfzeilen und Seitenmeta (K-19a)

**8 Befunde** · Blocker 0 · Hoch 3 · Mittel 1 · Detail 4 · `W2·17-UI-BEFUNDE-B14`

- [ ] **LM-181** · Hoch · Oben die Leiste «Rechner › Verfahrens- & Rechtsmittelfristen ✕», direkt darunter … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0a (Z. 55–63, gebaut 11.7.) · FAHRPLAN-UI-QUALITAET.md §3 + §5 (c…]
- [ ] **LM-183** · Hoch · In der Kopfleiste «A− 100 % A+», in der Meta-Zeile nochmals … [Verdacht → FAHRPLAN-GESETZES-UX.md §3.1 (Z. 305: «Bewusst NICHT als Toggle: Schriftgrösse (existiert globa…]
- [ ] **LM-184** · Hoch · Der Zähler in der Kopfleiste steigt beim Öffnen eines Entscheids von … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0d·O3 (Z. 96–97, «Toast/Fly-to zum Reiter-Tracker + Tooltip ‹Reit…]
- [ ] **LM-188** · Mittel · Die 404-Seite trägt den Seitentitel der Startseite («LexMetrik — Schweizer Recht … [neu]
- [ ] **LM-195** · Detail · «ESTV» steht als Abschnittsüberschrift und zusätzlich in jeder Karte. Die Karten … [neu]
- [ ] **LM-196** · Detail · Der Knopf steht auf SchKG in einer eigenen Zeile über dem … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §7/Z1 (Z. 447: «ICS-/Kalender-Export des Frist-Ergebnisses … Ist-Stan…]
- [ ] **LM-197** · Detail · Auf einer Seite stehen «‹ Zur Übersicht», «↗ massgebliche Fassung», «↗ … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: «Chip- und Badge-Grammatik», Bau in W2·10-UI-NA…]
- [ ] **LM-198** · Detail · Das Sprungziel heisst «b-BJ», der Abschnitt trägt die Überschrift «EHRA» mit … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/layout/InhaltsKopf.tsx`, `src/components/RouteMeta.tsx`, `src/pages/Materialien.tsx`.
**Risiko-Klasse:** reines UI/SEO-Meta.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §16 · B15 — Umschalter, Tabs und Akkordeons (K-06)

**9 Befunde** · Blocker 0 · Hoch 2 · Mittel 6 · Detail 1 · `W2·17-UI-BEFUNDE-B15`

- [ ] **LM-052** · Hoch · In Buttongruppen ist eine Option zweizeilig («Automatisch / folgt dem System»), … [neu]
- [ ] **LM-053** · Hoch · Geschlossen erscheint die Klappe als voll breiter, gerahmter Kasten, der nur … [Verdacht → Code src/components/rechtsprechung/EntscheidFilter.tsx:229–230 (<details className="lc-card"> +…]
- [ ] **LM-054** · Mittel · Zwei Umschalter-Stile auf einer Seite: einmal aktiv = fett ohne Fläche, … [Verdacht → Code src/pages/Gesetze.tsx:63–88 (Ebene-tablist) vs. src/pages/gesetze-teile/KantonAuswahl.tsx:…]
- [ ] **LM-055** · Mittel · Ein dritter Umschalter-Stil auf derselben Seitengruppe: aktiv = beige hinterlegt. Das … [neu]
- [ ] **LM-056** · Mittel · Zwei Akkordeon-Stile auf derselben Seite: einmal rechtsbündiges ▼, einmal winziger Pfeil … [neu]
- [ ] **LM-057** · Mittel · Vier Umschaltergruppen gleichzeitig sichtbar, in drei verschiedenen Darstellungen: «Bund | Kantone … [Verdacht → wie LM-054: src/pages/Gesetze.tsx:63–88 + src/pages/gesetze-teile/KantonAuswahl.tsx:110–130; Ka…]
- [ ] **LM-058** · Mittel · Ein weiterer Umschalter-Stil: nummerierte Kreise mit Beschriftung, der aktive Schritt in … [Verdacht → Code src/components/vorlagen/ui.tsx:101–143 (geteilter Stepper)]
- [ ] **LM-059** · Mittel · Die drei Abschnitts-Reiter tragen dasselbe Bild wie die Filterchips der Trefferliste … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Chip-/Badge-Grammatik) + FAHRPLAN-VERZAHNUNG-UI.md §1.2 (KantenChi…]
- [ ] **LM-060** · Detail · Das Akkordeon hat zwei Pfeilmarken (▼ mittig und ▸ ganz rechts); … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/components/layout/TabPanel.tsx`, `src/components/forms`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §17 · B16 — Seitengerüst und Inhaltsbreite (K-13)

**8 Befunde** · Blocker 0 · Hoch 2 · Mittel 3 · Detail 3 · `W2·17-UI-BEFUNDE-B16`

- [ ] **LM-136** · Hoch · Die Inhaltsbreite springt: `/einstellungen` bricht bei 1015 px ab, Rechnerseiten bei … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D7 («Content-Container breiter als bei den Schwester…]
- [ ] **LM-137** · Hoch · Der Inhalt endet auf der Materialienseite bei 940 px, während Brotkrumenleiste … [Verdacht → abnahme/responsive-audit/BERICHT.md §Systematik S-D + §0-Befund-Bereiche («materialleser 390/25…]
- [ ] **LM-138** · Mittel · Der Kasten ist 620 px breit und mittig gesetzt, während alle … [Verdacht → abnahme/responsive-audit/BERICHT.md §0-Befund-Bereiche: «entscheidleser-bge (768–2560)» — von z…]
- [ ] **LM-139** · Mittel · Spalte «Navigation» hat rund 52 px Zeilenabstand gegenüber der kompakten Spalte … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D2 + §Abarbeitung («D2 ✅ gefixt: Shell-Kopf/Fuss-Tap…]
- [ ] **LM-141** · Mittel · Die 859 Erlasse sind in zwei nebeneinanderliegenden Spalten gesetzt; beim Lesen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11 IA-3 «A–Z-/Kürzel-Register ✅ GEBAUT + GEMERGT 25.7.2026» (Z.1727-17…]
- [ ] **LM-142** · Detail · Der Kalender nutzt nur rund zwei Drittel der Kartenbreite; rechts bleiben … [neu]
- [ ] **LM-143** · Detail · Der Erklärtext beginnt ganz links bei x ≈ 346, der zugehörige … [neu]
- [ ] **LM-145** · Detail · Die Navigationsspalte setzt fünf Links in 14 px mit rund 47 … [Verdacht → abnahme/responsive-audit/BERICHT.md D2 (✅ gefixt: Fuss-Tap-Ziele 44 px) + src/components/layout…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout/Shell.tsx`, `src/components/layout/Footer.tsx`, `src/index.css`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §18 · B17 — Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)

**8 Befunde** · Blocker 0 · Hoch 1 · Mittel 6 · Detail 1 · `W2·17-UI-BEFUNDE-B17`

- [ ] **LM-085** · Hoch · Drei Gewichtungen nebeneinander: «PDF-Rechenbericht» gefüllt, «In Kalender (.ics)» outline, «Link teilen» … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: Kopier-/Export-Affordanz, §13-F4-Zustandsmatrix…]
- [ ] **LM-087** · Mittel · 34 verschiedene Button-Varianten aus Höhe · Radius · Schriftgrad · Schnitt … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz) + §4 Ziff. 1/3 (Gate-Verschärfung); DESIGN-REGL…]
- [ ] **LM-088** · Mittel · Mehrere Aktionen sind reiner Text ohne Fläche oder Rahmen und dadurch … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass, Hitbox ≥24 px/Ziel 44, WCAG 2.5.8 — offen, Re…]
- [ ] **LM-089** · Mittel · Deaktivierte Knöpfe sind allein über opacity 0.5 gekennzeichnet. Der primäre «Weiter … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix «inkl. disabled/loading/selected/empty/error…]
- [ ] **LM-093** · Mittel · Die noch nicht verfügbare Karte «Verwaltung» unterscheidet sich von den drei … [Verdacht → DESIGN-REGLEMENT.md Z.196-201 (Zustandsmatrix inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(…]
- [ ] **LM-094** · Mittel · Der gesperrte «Weiter →» behält die volle dunkle Füllung (rgb 28,26,21) … [Verdacht → DESIGN-REGLEMENT.md Z.196-201 (alle Zustände inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(c…]
- [ ] **LM-097** · Mittel · Der Knopf ist die einzige nahezu schwarze Fläche der Seite und … [Verdacht → CLAUDE.md §7 Zitat-Ausnahme lit. c (im UI sichtbarer Live-Link) + Code-Entscheid src/pages/Mate…]
- [ ] **LM-099** · Detail · «heute» ist fetter Text ohne Fläche oder Rahmen. [Verdacht → FAHRPLAN-UI-QUALITAET.md §3/§5(c) (Muster-Konsistenz, Chip-/Badge-Grammatik) + Token src/index.…]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/index.css`, `src/components/vorlagen`.
**Risiko-Klasse:** reines UI — der Deaktiviert-Zustand darf keine Bedienlogik verändern.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §19 · B18 — Listen, Suche und Relevanz (K-19b)

**8 Befunde** · Blocker 0 · Hoch 1 · Mittel 7 · Detail 0 · `W2·17-UI-BEFUNDE-B18`

- [ ] **LM-182** · Hoch · Rund 110 px Zeilenabstand pro Eintrag — sichtbar sind etwa 6 … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6/O2 (Z. 429–433, Sidebar-Konsistenz) · §4/R6 (Z. 321–328, Chevron-H…]
- [ ] **LM-185** · Mittel · Die Zeilenlabels stehen inline und sind unterschiedlich lang — die drei … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6/J2 (Z. 397–402, Filterblock/Bottom-Sheet mobil) · FAHRPLAN-UI-QUAL…]
- [ ] **LM-186** · Mittel · Drei Suchfelder mit drei Bedeutungen, drei Gestaltungen und zwei Ausrichtungen: «Suchen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-4 (gebaut+gemergt 25.7.2026, PR #350) · FAHRPLAN-UI-NAVIGATION…]
- [ ] **LM-187** · Mittel · Die Suche liefert Art. 74 OR, Art. 581a OR, Art. 699b … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-1 (gebaut 16.7.2026, PR #264 — «OR 257d» Zielartikel oben, e2e…]
- [ ] **LM-189** · Mittel · Die Kantonsflächen sind rosa, violett, hellblau, mintgrün — ausserhalb der warmen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-2 + §11.9 Ziff. 14 (O4-Korrektur: «Kartenrest nur nach Prod-Re…]
- [ ] **LM-190** · Mittel · Am Monatsübergang stossen zwei separat abgerundete Pillen aneinander — sichtbare Kerbe … [neu]
- [ ] **LM-191** · Mittel · Die Spalte ist linksbündig gesetzt; dadurch steht «Jahre» bei «10 Jahre» … [neu]
- [ ] **LM-192** · Mittel · Internationale Erlasse liegen unter «/gesetze/bund/EMRK», «/gesetze/bund/CISG», «/gesetze/bund/LUGUE» — die Adresse führt … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.4 Ziff. 3 + §11.10/IA-6 (gebaut+gemergt 25.7.2026, PR #353) sowie §…]

**Code-Flächen (grob, aus den Routen):** `src/pages/Gesetze.tsx`, `src/components/suche`, `src/lib/suche`.
**Risiko-Klasse:** RISIKO — Such-/Ranking-Logik (LM-187 Substring-Treffer) ist keine reine UI: `check:gegenpruefung` + `eval:suche`.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §20 · B19 — Eingabe- und Auswahlfelder — Detail (K-08b)

**7 Befunde** · Blocker 0 · Hoch 0 · Mittel 0 · Detail 7 · `W2·17-UI-BEFUNDE-B19`

- [ ] **LM-077** · Detail · Die drei Optionen liegen 11 px versetzt zueinander. [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — gleichrangige Bedienelemente einer Reihe auf einer Lini…]
- [ ] **LM-078** · Detail · Ein Label für zwei Bedienelemente; das Zahlenfeld hat keine eigene Beschriftung. [neu]
- [ ] **LM-079** · Detail · Zwei Label-Ebenen im selben Formular (dunkel/fett gegenüber klein/grau) ohne erkennbare Logik; … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — src/components/forms/GebvKostenForm.tsx:97, Betreibungs…]
- [ ] **LM-080** · Detail · Die Felder in der Unterkarte sind gegenüber den Feldern ausserhalb um … [neu]
- [ ] **LM-081** · Detail · «Erwägung» ist halb so breit wie «Band» und «Seite»; die zweite … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Disziplin in Rechner-Formularen, offen)]
- [ ] **LM-082** · Detail · Der Radiobutton steht bei zweizeiligen Titeln vertikal zentriert zwischen den Zeilen, … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Ausrichtung gleichrangiger Bedienelemente, offen)]
- [ ] **LM-083** · Detail · Die zweite Rasterreihe enthält nur zwei Karten, die dritte Rasterzelle bleibt … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Kachel-/Rasterverhalten in Rechner-Formularen, auto-row…]

**Code-Flächen (grob, aus den Routen):** `src/components/forms`, `src/components/ui`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §24 · ROADMAP-Spec-Nachzug `W2·17-UI-BEFUNDE` (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 2, Schritt `W2·17-UI-BEFUNDE` — AP-11 rückwirkend angewandt
(ROADMAP-Diät Welle 3, 4.8.2026). In der ROADMAP bleiben Titel, `@meta`, das Triage-Ergebnis, die
Queue-Regel, die Batch-Einzeiler B3…B19 und der Pointer auf §1. Steuert nicht — Spec-Heimat.
**Davids Freigabe-Wortlaut ist unverändert übernommen.***

> **Freigabe David 3.8.2026:** Kette B3→B19 läuft wie geplant seriell; stehende Erlaubnis, ein
> blockiertes Glied zu überspringen und zu melden (Übersprungenes bleibt offen, Kette läuft weiter).

### §24.1 `W2·17-UI-BEFUNDE-B4` — Grenz-Auflage im Wortlaut *(→ Bau-Spec: §5 dieser Datei)*

*Herkunft: `ROADMAP.md` (verschoben 4.8.2026, ROADMAP-Diät Welle 3); dort bleibt der Grenz-Hinweis
in Kurzform.*

> **Grenze:** hier werden nur die 12 extern erhobenen Einzelbefunde abgearbeitet — der flächige UX-Pass derselben Seite ist `W2·5h-GESETZ-UI`, die Darstellungs-Vorschriften sind `W2·5d`. Kollisions-Precheck gegen beide vor dem Bau.


---

## Archivierte Abschnitte *(Plan-Neuschnitt 29.8.2026)*

9 Abschnitt(e) dieser Datei sind wörtlich nach
[`archiv/fahrplaene/FAHRPLAN-UI-BEFUNDE.md`](../archiv/fahrplaene/FAHRPLAN-UI-BEFUNDE.md) ausgelagert — sie tragen keine offene
ROADMAP-Bindung mehr. Titel:

- §1 · Triage-Ergebnis 31.7.2026
- §2 · B1 — Chips, Badges und Normzitate (K-05 + K-10)
- §3 · B2 — Verlauf und Zustand in der URL (K-20)
- §4 · B3 — Klebende Leisten (K-01)
- §5 · B4 — Leseansicht Gesetz (K-14)
- §6 · B5 — Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)
- §21 · B20 — Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)
- §22 · Fortschritts-Regel
- §23 · N1 — LM-044-Nachzug: Chip-Grammatik `lc-chip-zeile` ausrollen
