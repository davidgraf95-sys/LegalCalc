# LexMetrik — Befundliste UI

> **Wortlaut-Quelle, unverändert.** Dieser Ordner hält den gelieferten Text fest;
> gesteuert wird der Bau in [FAHRPLAN-UI-BEFUNDE.md](../../fahrplaene/FAHRPLAN-UI-BEFUNDE.md) (§5).

Externe Sichtprüfung, Stand 29.07.2026 · 161 Befunde, geschnitten nach berührtem Bauteil · rund 45 Seiten, Breiten 390–2560 px, hell und dunkel, Druck, Tastatur, Schriftskala 140 %, Fehler- und Leerzustände, Menüs, Reiter- und Split-Ansicht, Gliederung, Browser-Verlauf, Norm-Entscheid-Verknüpfung, Adresszeile, Kantone, International, Assistenten, Tastatur

«Prüfen» ist zugleich das Fertig-Kriterium: Prüfung wiederholen, dann muss die Beobachtung verschwunden sein. «Erwartet» beschreibt den Zielzustand, nicht den Weg dorthin. Keine Dateipfade aus dem Repo — Verortung über Route und sichtbaren Text.

---

## Befunde

### K-01 · Klebende Leisten

#### LM-001 · 1 Blocker

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px · hell und dunkel — langsam scrollen und den obersten 8-px-Streifen der Kopfleiste beobachten
- **Beobachtung:** Die Kopfleiste ist nicht blickdicht. Beim Scrollen läuft der Seiteninhalt sichtbar durch ihren oberen Rand. Mehrfach auf verschiedenen Seiten und in beiden Farbmodi reproduziert.
- **Erwartet:** Unter der Kopfleiste durchlaufender Inhalt bleibt vollständig verdeckt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md Z.597–600 + Z.613–616 (G2b-Ausführungsvermerk); src/index.css:783–786 (.lc-glass)
- **Dedup-Notiz:** «Sticky-Kopf opak» ist für die Reader-Chrome gebaut; der Bestand hält ausdrücklich fest: «die einzige Rest-Transluzenz ist die globale Topbar (lc-glass 96 %) — bewusst NICHT angefasst» + «Bewusst NICHT (G2b-Scope): keine globale Topbar-Opazität». Code bestätigt: color-mix(paper 96%) + blur(12px). Also kein neuer Befund, sondern ein bewusst aufgeschobener Rest — Bau-Session muss den Scope-Entscheid kennen.

#### LM-002 · 1 Blocker

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — bis zum Abschnitt «KONTEXT» scrollen
- **Beobachtung:** Die klebende Leiste «Sachverhalt | Erwägungen | Dispositiv» deckt die Überschrift «KONTEXT» ab: sichtbar bleibt nur die unterste Pixelreihe der Buchstaben, und die Linie unter der Überschrift läuft durch die Leiste. Auch ein gezielter Sprung an die Stelle landet unter der Leiste.
- **Erwartet:** Eine angesprungene Überschrift steht vollständig unterhalb der klebenden Leiste.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1 N0c (Z.74–81); FAHRPLAN-GESETZES-UX.md §15 K5 (Z.2055–2061); src/pages/EntscheidLeser.tsx:432–437
- **Dedup-Notiz:** Gleiche Fehlerklasse (Anker-Landung unter Sticky-Leiste), aber N0c/K5 betreffen den GESETZ-Leser (.nt-anker/scroll-margin). Im Entscheid-Leser ist scroll-margin nur für `.rsp-anker [id]` gesetzt (--rsp-stick); das KontextPanel mit der Überschrift «KONTEXT» liegt AUSSERHALB von .rsp-anker (Z.618) → eigener, ungedeckter Defekt.

#### LM-003 · 2 Hoch

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px · ein zweites Dokument über «In neuem Reiter» öffnen, dann scrollen — Streifen zwischen Reiter-Kopfzeile und Werkzeugleiste beobachten
- **Beobachtung:** Zwischen der klebenden Reiter-Kopfzeile und der darunter klebenden Werkzeugleiste bleibt ein waagerechter Streifen unbedeckt, durch den der Gesetzestext sichtbar hindurchläuft. Gemessen: Werkzeugleiste fixiert auf top 109 px, Kopfzeile darüber endet bei 101 px (Einzelreiter) bzw. 65 px (Reiter-Kopfzeilen statt Breadcrumb) — Streifen von 8 px bzw. 44 px. Ein Treffertest auf halber Streifenhöhe landet auf dem Artikelinhalt, nicht auf einer Leiste.
- **Erwartet:** Die klebenden Leisten schliessen lückenlos aneinander an.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §9 B6 (Werkzeugleisten-Gesamtüberarbeitung, gebaut 29.7.2026 PR #405 `efba2dce`); FAHRPLAN-GESETZES-UX.md §10.10 E3/A34; src/pages/gesetz-leser/inhalt-volltext.tsx:236–238
- **Dedup-Notiz:** Thematisch B6 (Leiste neu ordnen) und E3/A34 (Split-View/Pane-Leiste), aber anderer konkreter Defekt. Code deckt die Messung exakt: die pane-lokale `data-such-bar` klebt mit `top: '0.5rem'` = 8 px unter der Reiter-Kopfzeile → der gemeldete 8-px-Streifen ist genau dieser Offset. B6 ist als done markiert ⇒ Befund-Vintage vor/nach B6 klären (§0.1 Vintage-Regel).

#### LM-004 · 2 Hoch

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px · zwei Reiter offen — oberste Zeilen beider Reiter ansehen
- **Beobachtung:** Die Werkzeugleiste jedes Reiters schwebt als eigener Kasten über dem Textbereich statt in der Reiter-Kopfzeile zu sitzen. Sie verdeckt in beiden Reitern dauerhaft die obersten Zeilen — links die Aufzählungspunkte «a.» und «b.» von Art. 269c, rechts die Entscheid-Chipreihe.
- **Erwartet:** Die Werkzeugleiste eines Reiters belegt eigenen Platz und verdeckt keinen Text.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §9 B6; FAHRPLAN-GESETZES-UX.md §10.10 E3/A34; src/pages/gesetz-leser/inhalt-volltext.tsx:229–238
- **Dedup-Notiz:** Dieselbe Fläche wie LM-003 und wie E3/A34 (dort: «keine Möglichkeit mehr, die Ansicht im Split-View zu ändern» — A26 liess das Menü bewusst im ErlassLeserKopf für `imPane`), aber anderer Defekt. Code bestätigt: die Pane-Leiste ist ein sticky, gerundeter Kasten mit shadow-sm über dem Text (`rounded-lg … shadow-sm`, sticky top 0.5rem), nur im `imPane`-Zweig.

#### LM-005 · 2 Hoch

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — über das Dispositiv hinaus bis zur Fusszeile scrollen und die klebende Leiste beobachten
- **Beobachtung:** Die Leiste mit den drei Abschnitten bleibt sichtbar, auch wenn keiner der drei Abschnitte mehr im Fenster steht; «Sachverhalt» behält dabei die Aktivmarkierung. Die Leiste zeigt damit einen Zustand, der nicht mehr zutrifft.
- **Erwartet:** Die Abschnittsleiste zeigt den Abschnitt, in dem man sich befindet, oder tritt zurück, wenn keiner sichtbar ist.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §3 V5 (Erwägungs-Navigation im Entscheid-Leser, Z.258–266); src/pages/EntscheidLeser.tsx:175–189
- **Dedup-Notiz:** V5 ist die thematische Heimat (Navigation im Entscheid), aber ein anderer Bau. Code-Befund korrigiert die Beobachtung: `SprungNavigation` hat GAR KEINE Aktivmarkierung/Scroll-Spy — es sind schlichte `lc-chip`-Anker. Die berichtete «Aktivmarkierung Sachverhalt» stammt also nicht aus einem Spy-Zustand (eher :target/:focus des zuletzt geklickten Chips) — beim Bau zuerst reproduzieren.

#### LM-006 · 2 Hoch

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /rechtsprechung · /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` (Karten) und `/materialien/ESTV-KS-DBG-5A` · 1440 px — mit dem Mausrad mehrere Umdrehungen scrollen und während der Bewegung hinsehen
- **Beobachtung:** Während des Scrollens bleibt ein grosser Teil des Fensters für einen Moment leer weiss, und das feste Gerüst (Seitenleiste und Kopfleiste) erscheint um mehrere hundert Pixel nach unten versetzt; nach dem Anhalten steht die Seite wieder richtig. In zwei von zwei geprüften Fällen aufgetreten.
- **Erwartet:** Das feste Gerüst bleibt während des Scrollens an seiner Stelle.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/index.css:783–786 (.lc-glass backdrop-filter) = dieselbe Fläche wie LM-001; Abgrenzung: FAHRPLAN-UI-NAVIGATION.md §Z-2 + FAHRPLAN-GESETZES-UX.md A2 (content-visibility)
- **Dedup-Notiz:** Kein Bestands-Zwilling. Wichtige Abgrenzung für die Bau-Session: die Virtualisierungs-/content-visibility-Debatte (§Z-2, A2) greift hier NICHT — `content-visibility` liegt allein auf `.nt-art-cv` (index.css:481, Normtext) und ist auf /rechtsprechung und /materialien gar nicht aktiv. Naheliegender Erstverdacht ist stattdessen der `backdrop-filter: blur(12px)` der sticky Topbar (Repaint-Artefakt) — damit an LM-001 gekoppelt.

#### LM-007 · 3 Mittel

- **Bauteil:** K-01 · Klebende Leisten
- **Route:** /rechtsprechung/bge_152_V_52
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bge_152_V_52` · 1440 px — Höhe der dauerhaft sichtbaren Leisten messen
- **Beobachtung:** Kopfleiste, Breadcrumb und zwei Tab-Ebenen kleben gleichzeitig und belegen zusammen rund 190 px Bildschirmhöhe.
- **Erwartet:** Die dauerhaft sichtbaren Leisten lassen genug Lesefläche.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §9 B6; FAHRPLAN-GESETZES-UX.md §15 K6 (Z.2062–2064); src/pages/EntscheidLeser.tsx:401–408
- **Dedup-Notiz:** B6/K6 sind derselbe Auftrag («Leiste minimalistischer/praktischer», Höhe/Ordnung) — aber für die GESETZES-Werkzeugleiste. Hier: Entscheid-Leser, wo `stickHoehe` in der Einzelansicht bewusst 12.75rem (204 px) bzw. 9.25rem beträgt. Deckungsgleiche Zielsetzung, andere Fläche ⇒ eingeplant lassen, B6-Ergebnis als Muster übernehmen.

### K-02 · Overlays und Menüfenster

#### LM-008 · 1 Blocker

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechner/zpo-fristen
- **Breite:** 1030 px
- **Prüfen:** `/rechner/zpo-fristen` · 1030 px · «OR 257d» in die Kopfsuche tippen — Ergebnisliste ansehen
- **Beobachtung:** Unter etwa 1000 px übernimmt das Ergebnis-Panel die Breite des Suchfelds (rund 300 px) statt einer eigenen Mindestbreite. Titel und Snippets werden auf ein bis zwei Wörter beschnitten («OR · Art. 2…», «Bundesgese…»), die Badges «Gesetzestext» und «Sprung» liegen über dem Text. Ab etwa 1400 px ist dasselbe Panel einwandfrei.
- **Erwartet:** Das Suchergebnis ist auf jeder Breite lesbar; Badges überlagern keinen Text.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §2 S6 (Mobiler Such-Fokusmodus, Z.199–207); src/components/layout/HeaderSuche.tsx:189–194
- **Dedup-Notiz:** S6 deckt nur den Mobil-Fall. Code zeigt die Lücke exakt: unter `sm` ist das Panel viewport-verankert (`max-sm:fixed inset-x-2`), ab `sm` erbt es die FELDbreite (`absolute left-0 right-0`) — der Bereich ~640–1400 px ist von keiner Regel gedeckt. Anderer konkreter Defekt als S6, bleibt eingeplant.

#### LM-009 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Ansicht» öffnen, dann scrollen, im Gesetz suchen und das Fenster verkleinern
- **Beobachtung:** Das geöffnete Ansicht-Menü schliesst nicht. Es bleibt über Scrollen, eine Suche im Gesetz und eine Fenstergrössenänderung hinweg offen und liegt dabei mitten im Gesetzestext. Auf 531 px nimmt es fast die halbe Bildschirmbreite ein.
- **Erwartet:** Das Menü schliesst bei Scrollen, Klick daneben und Escape.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/gesetz-leser/LeserAnsichtMenu.tsx:137–148 (useDialogFokus + pointerdown-Ausserhalb)
- **Dedup-Notiz:** Zwei der drei geforderten Schliess-Wege sind nachweislich gebaut: Escape + Fokus-Rückgabe über `useDialogFokus`, Klick-daneben über einen document-pointerdown-Handler. Ungedeckt bleiben nur Scroll und Resize. Die Beobachtung «schliesst nicht» ist damit zu weit gefasst — Umfang vor dem Bau auf Scroll/Resize verengen und zuerst reproduzieren.

#### LM-010 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «§ Rechtsprechung» öffnen und Höhe sowie Hintergrund prüfen
- **Beobachtung:** Das Rechtsprechungs-Menü ist rund 460 px hoch und liegt ohne abdunkelnden Hintergrund über dem Gesetzestext; Text scheint links und rechts hindurch.
- **Erwartet:** Ein Menü dieser Grösse tritt vom Inhalt dahinter ab.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §b «Ton vor Schatten» (Z.375–379); src/pages/gesetz-leser/LeserRechtsprechungMenu.tsx:190–205
- **Dedup-Notiz:** Das Panel ist NICHT durchscheinend: `bg-paper-raised` + `border-line` + `shadow-lg`, also genau das im Reglement vorgeschriebene Muster (Tiefe = Stufe + Border, Schatten sekundär). Verlangt wird ein zusätzlicher Scrim — das ist eine Reglement-Änderung und kollidiert mit Davids Minimalismus-Vorgabe 28.7.2026 (B5/B6, «Optik des Gesetzes nicht überladen») ⇒ als Entscheid-Frage führen, nicht als Bug.

#### LM-011 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Strg+K drücken, «OR 257» tippen, dann Pfeil-unten und Enter
- **Beobachtung:** Die Suche lässt sich per Tastatur öffnen (Strg+K setzt den Fokus ins Feld) und mit Escape schliessen, aber die Trefferliste ist nicht bedienbar: Nach Pfeil-unten verliert der Fokus das Suchfeld und landet auf dem Seitenkörper; es gibt keinen markierten Treffer (weder aria-selected noch aria-activedescendant, gemessen 0 Elemente). Ein Treffer lässt sich mit der Tastatur nicht auswählen.
- **Erwartet:** Die Trefferliste lässt sich mit Pfeiltasten durchlaufen und mit Enter öffnen; der aktive Treffer ist markiert.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/layout/HeaderSuche.tsx:142–156 + 170–177; src/components/suche/SuchResultate.tsx:88–91 + 160–165
- **Dedup-Notiz:** Der geforderte Zustand ist vollständig im Code: role=combobox mit aria-expanded/aria-controls/aria-activedescendant, ArrowDown/ArrowUp über `naechsterKey`/`vorigerKey`, Enter öffnet den hervorgehobenen Treffer, Optionen tragen role=option + aria-selected + Hervorhebung. Das gemeldete Symptom entsteht nur, solange `flach.length === 0` (Trefferliste noch nicht geladen) — dann greift kein preventDefault und der Fokus wandert weiter. ⇒ Prüfung nach vollständigem Laden wiederholen; falls reproduzierbar, ist es ein Ladephasen-Race (Klasse S3/#52 Enter-Puffer), nicht fehlende Tastaturbedienung.

#### LM-012 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — «Lesemodus» anklicken und danach Tab drücken
- **Beobachtung:** Der Lesemodus öffnet als Dialog mit korrekter Auszeichnung (role=dialog, aria-modal=true, Beschriftung gesetzt, Escape schliesst, Hintergrund gegen Scrollen gesperrt), aber der Fokus bleibt auf dem auslösenden Knopf in der verdeckten Seite dahinter. Wer mit der Tastatur weitergeht, läuft durch die Seite hinter dem Dialog statt durch den Dialog.
- **Erwartet:** Beim Öffnen wandert der Fokus in den Dialog und bleibt darin, bis er geschlossen wird.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/pages/EntscheidLeser.tsx:669–691 (useEffect im LesemodusOverlay)
- **Dedup-Notiz:** Fokus-Mechanik ist gebaut: `schliessRef.current?.focus()` beim Öffnen, Tab-/Shift-Tab-Falle über `dialogRef.querySelectorAll('a[href], button:not([disabled])')`, Fokus-Rückgabe an `vorigerFokus` beim Schliessen, Body-Scroll-Sperre. ⇒ Prüfung wiederholen. Nur falls reproduzierbar: die Falle greift konstruktionsbedingt nicht, wenn der Initial-Fokus scheitert (sie prüft nur activeElement === erstes/letztes Element) — dann dort ansetzen.

#### LM-013 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Lesemodus öffnen und den Knopf «A+» oben rechts drücken
- **Beobachtung:** «A+» ist im Moment des Öffnens bereits gesperrt (disabled), «A−» nicht. Die Schrift lässt sich im Lesemodus nur verkleinern, nie vergrössern — die Ansicht startet an ihrer Obergrenze.
- **Erwartet:** Im Lesemodus lässt sich die Schrift in beide Richtungen verstellen, oder die Grenze wird benannt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/pages/EntscheidLeser.tsx:157–169 (FS_STUFEN, ladeFsIdx) + 232–236 (setFs, localStorage `rsp-fs-idx`)
- **Dedup-Notiz:** Vier Stufen, Default ist Index 1 von 4 — bei Erstbesuch sind A− UND A+ bedienbar. `A+ disabled` beim Öffnen bedeutet, dass der Prüfer die Stufe zuvor (im Hauptkopf, derselbe Regler) auf das Maximum gesetzt hatte; der Wert wird in localStorage persistiert. ⇒ Prüfung mit geleertem `rsp-fs-idx` wiederholen; danach voraussichtlich erledigt.

#### LM-014 · 2 Hoch

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Lesemodus öffnen und den Kopf mit dem der normalen Ansicht vergleichen
- **Beobachtung:** Der Lesemodus lässt «GEGENSTAND» und «BESETZUNG» weg — die beiden Zeilen, die sagen, worum es im Entscheid geht und wer ihn gefällt hat. Übrig bleiben Titel, Urteilsdatum und Geschäftsnummer. Der Volltext mit Sachverhalt, Erwägungen und Dispositiv ist vollständig enthalten.
- **Erwartet:** Die Leseansicht enthält die Kopfangaben, die den Entscheid identifizieren.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-015 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Ansicht» und «§ Rechtsprechung» öffnen und den Hintergrund dahinter ansehen
- **Beobachtung:** Die Menüfenster haben keine abdunkelnde Fläche dahinter und keinen sichtbaren Bezug zum auslösenden Knopf; Gesetzestext und Menüinhalt laufen ineinander.
- **Erwartet:** Solange ein Menü offen ist, ist erkennbar, wozu es gehört, und der Inhalt dahinter tritt zurück.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** befundliste.json LM-010 (interne Dublette); DESIGN-REGLEMENT.md §b (Z.375–379); src/pages/gesetz-leser/LeserAnsichtMenu.tsx:184 + LeserRechtsprechungMenu.tsx:205
- **Dedup-Notiz:** Weitgehend deckungsgleich mit LM-010 derselben Liste (dort «Rechtsprechung»-Menü, hier beide Menüs) — vor der Einplanung zusammenlegen. Zusatz gegenüber LM-010 ist allein der «sichtbare Bezug zum auslösenden Knopf»; die Verankerung selbst existiert (`absolute right-0 top-full` am Trigger-Wrapper).

#### LM-016 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Sprachmenü («DE ▾») öffnen und die Position zum Knopf prüfen
- **Beobachtung:** Das Sprachmenü ist links vom auslösenden Knopf verankert, obwohl dieser rechts aussen sitzt, und überlagert die Breadcrumb-Leiste; deren ✕ bleibt daneben sichtbar.
- **Erwartet:** Das Menü ist am Auslöser verankert und überlagert die Leiste vollständig statt teilweise.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/components/SprachUmschalter.tsx:43
- **Dedup-Notiz:** Die Kernbehauptung ist code-widerlegt: das Panel ist mit `absolute right-0 top-full` AM AUSLÖSER verankert (rechte Kante bündig, das 14rem breite Panel wächst nach links — das dürfte als «links verankert» fehlgedeutet worden sein). Übrig bleibt nur der zweite Teil («überlagert die Breadcrumb-Leiste teilweise») ⇒ Umfang entsprechend verengen.

#### LM-017 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Verlaufs- und Reiter-Panel öffnen
- **Beobachtung:** Beide Panels sind ebenfalls weit links vom Auslöser verankert und überlagern die Breadcrumb-Leiste.
- **Erwartet:** Panels sind am Auslöser verankert.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/layout/ReiterUebersicht.tsx:35–46 + 163; src/components/layout/VerlaufUebersicht.tsx:102–108
- **Dedup-Notiz:** Der geforderte Zustand («Panels sind am Auslöser verankert») ist gebaut und war sogar schon einmal Gegenstand eines Fixes: die Position wird aus `trigger.getBoundingClientRect()` gerechnet (`left = clamp(r.right - breite …)`, `top = r.bottom + 4`); der Code-Kommentar nennt den früheren Zustand «fixed top-16 right-2» ausdrücklich als behoben. Das 20rem-Panel wächst vom Auslöser nach links — vermutlich als «links verankert» gemessen. ⇒ Prüfung wiederholen.

#### LM-018 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechner/zpo-fristen
- **Breite:** 1030 px
- **Prüfen:** `/rechner/zpo-fristen` · 1030 px — «OR 257d» suchen und die Zeile mit der Trefferzahl ansehen
- **Beobachtung:** Der Trefferzähler («51 Treffer, davon 40 Artikel — wird noch ergänzt») wird in die Breadcrumb-Leiste gerendert und überlagert sie auf schmalen Breiten.
- **Erwartet:** Der Trefferzähler gehört sichtbar zum Suchpanel und überlagert nichts.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-019 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Titel im Lesemodus und Titel der normalen Ansicht nebeneinanderhalten
- **Beobachtung:** Derselbe Titel steht im Lesemodus in der serifenlosen Schrift, in der normalen Ansicht in der Serifen-Auszeichnungsschrift. Solange der Dialog offen ist, enthält die Seite zwei H1-Überschriften mit demselben Text.
- **Erwartet:** Derselbe Titel trägt in beiden Ansichten dieselbe Schrift; im Dokument steht eine Hauptüberschrift.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/EntscheidLeser.tsx:448 (Haupt-H1) vs. :726 (Lesemodus-H1); DESIGN-REGLEMENT.md §e Zwei-Stimmen-Regel
- **Dedup-Notiz:** Die Schrift-Hälfte des Befunds ist code-widerlegt: beide Überschriften tragen identisch `text-h2 sm:text-h1 font-display font-semibold`. Bestätigt bleibt das Doppel-H1: bei offenem Overlay wird nur der `<article>`-Body ausgeblendet (`{!lese && …}`), der `<header>` mit dem H1 bleibt im DOM. ⇒ Befund auf den Doppel-H1-Teil verengen.

#### LM-020 · 3 Mittel

- **Bauteil:** K-02 · Overlays und Menüfenster
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — im Feld RICHTER:IN «mül» tippen und die Vorschlagsliste lesen
- **Beobachtung:** Die Vorschläge mischen Namensformen: «C. Müller 140», «Patrik Müller-Arenja 4», «P. Müller 1». Abgekürzte und ausgeschriebene Vornamen stehen nebeneinander; ob «C. Müller» und ein ausgeschriebener Vorname dieselbe Person meinen, ist nicht erkennbar. Die Liste verdeckt beim Öffnen die darunterliegenden erweiterten Filter.
- **Erwartet:** Namen erscheinen in einer Form; gleiche Personen stehen in einem Eintrag.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md §6 «Richternamen gegen den Staatskalender auflösen» (`W2·6-RNAME`); ROADMAP.md → @meta `W2·6-RNAME`
- **Dedup-Notiz:** Derselbe konkrete Defekt an derselben Stelle: gemischte Namensformen in der Richter-Auswahl («P. Kaderli» → «Kaderli Peter»), inkl. der Frage, ob abgekürzt und ausgeschrieben dieselbe Person meinen. RNAME hat dafür bereits eine verbindliche Regel (Auflösung NUR bei Eindeutigkeit, Kollisions-Report, Risikopfad `QS-GP` nach dem #309-Vorfall mit 11 erfundenen Amtsträger:innen). NICHT doppelt einplanen. Nicht gedeckt ist allein der Nebensatz «Vorschlagsliste verdeckt die erweiterten Filter» (reines UI).

### K-03 · Menüinhalt und Zustandsanzeige

#### LM-021 · 2 Hoch

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «§ Rechtsprechung» öffnen, Fliesstext im Menü zählen
- **Beobachtung:** Das Menü enthält zwei Erklärabsätze in 11 px Grauschrift, zusammen rund zehn Zeilen («Jede zugeschaltete Instanz steht am Artikel als eigene Linie …» und ein zweiter Absatz zum Zeitraum).
- **Erwartet:** Erklärungen stehen ausserhalb des Menüs oder auf Abruf.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/components/verzahnung/BezugFacettenWahl.tsx:152–158; src/components/verzahnung/BezugZeitWahl.tsx:218–232; FAHRPLAN-VERZAHNUNG-UI.md §9 B5/B7
- **Dedup-Notiz:** Beide Absätze sind bewusst gesetzte §8-Offenlegungen aus W2·7-BEZUG B5/B7 (was der Grundzustand kostet; was die Zahl am Schalter zählt; woraus die Verteilung stammt und was sie NICHT ist). Ein Verschieben «ausserhalb des Menüs oder auf Abruf» berührt die §8-Auflage ⇒ als Gestaltungs-/Entscheidfrage führen, nicht als reine Politur.

#### LM-022 · 2 Hoch

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «§ Rechtsprechung» öffnen, Schalter «BGE | BGer | Eidg. | Kantonal» und «alle | AG | BS | GR»
- **Beobachtung:** Die Filterschalter zeigen keinen erkennbaren Aktivzustand: «alle» sieht aus wie «AG». «Eidg. 0» ist trotz Nullwert anwählbar.
- **Erwartet:** Der Zustand jedes Filters ist auf einen Blick erkennbar; Schalter ohne Treffer sind als solche kenntlich.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** ROADMAP.md → W2·7-BEZUG B7 + ROADMAP-CHRONIK.md → W2·7-BEZUG (B7, done 29.7.2026); src/components/verzahnung/BezugFacettenWahl.tsx:35–76 + 109–125; FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix)
- **Dedup-Notiz:** Der «Eidg.»-Teil ist bereits abgearbeitet: B7/c (David 28.7. «Eidg. das scheint keine funktion zu haben?») hat reproduziert, dass es kein Bug ist (164 von 75'365 Kanten), und die Ehrlichkeit gebaut — gedämpfte LEER-Optik + erklärender Titel. Das Nicht-Deaktivieren ist dort ein begründeter a11y-Entscheid (ein `disabled` nähme Screenreadern die 0). Offen bleibt allein die Kontrast-/Erkennbarkeitsfrage des Aktivzustands (AKTIV = bg-brass-100/60 + font-medium) → Heimat QS-UI §3 Zustandsmatrix.

#### LM-023 · 3 Mittel

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Ansicht» öffnen und die fünf Zeilen vergleichen
- **Beobachtung:** «Linien», «Fussnoten» und «Verweise» tragen rechts ein ausgeschriebenes «✓ an» bzw. «○ aus». Die Optionen der Änderungshistorie («aus | Fussnoten | Chronologie») unterscheiden sich dagegen nur durch Schriftschnitt (400 gegenüber 500) und Textfarbe (#6F6B61 gegenüber #1C1A15) — gemessen bei aktiver «Chronologie».
- **Erwartet:** Ein Zustandsbild für alle Schalter eines Menüs.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz, §13-F4-Zustandsmatrix, Z.65–72); src/pages/gesetz-leser/LeserAnsichtMenu.tsx:49–62 vs. 94–107
- **Dedup-Notiz:** QS-UI §3 ist die zuständige Heimat für genau diese Frage («gleiche Handlung, gleiches Muster … Zustandsmatrix inkl. selected»), aber ohne konkreten Befund. Code bestätigt die Beobachtung: `OptSwitch` = role=switch mit «✓ an/○ aus», `HistAnsichtWahl` = aria-pressed-Streifen; die Streifen-Optik ist ausdrücklich als «identisch zu ZeitraumWahl/BezugFacettenWahl» gewollt — eine Vereinheitlichung trifft also drei Streifen, nicht nur diesen.

#### LM-024 · 3 Mittel

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «§ Rechtsprechung» → Abschnitt «Zeitraum»
- **Beobachtung:** Das Balkendiagramm zeigt sechs verschieden hohe Balken ohne Werte, ohne Achsenbeschriftung und ohne Einheit; darunter stehen nur «2019» und «2026». Ob es anklickbar ist, ist nicht erkennbar.
- **Erwartet:** Werte, Einheit und Bedienbarkeit sind ablesbar — oder die Grafik entfällt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §9 B5; src/components/verzahnung/BezugZeitWahl.tsx:1–34 + 153–195 + 218–232
- **Dedup-Notiz:** Der geforderte Zustand ist teilweise da und im Übrigen bewusst so entschieden: je Balken ein `title` «Jahr: N Verknüpfungen», Einheit + Grundgesamtheit im Fusssatz, Bedienbarkeit über `cursor-ew-resize` + aria-label «Ziehen wählt einen Bereich». «Keine zweite Achse, keine Legende, kein Dashboard» ist Davids Minimalismus-Vorgabe vom 28.7.2026 ⇒ sichtbare Achsenbeschriftung wäre eine Entscheid-Änderung, kein Bugfix.

#### LM-025 · 4 Detail

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Ansicht» öffnen, Zeile «Fussnoten»
- **Beobachtung:** Neben «Fussnoten» steht eine unerklärte Zahl (932); bei «Linien» und «Verweise» steht keine.
- **Erwartet:** Zahlenangaben sind erklärt oder entfallen überall.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md Z.1430 (A26, David 11.7.2026); src/pages/gesetz-leser/LeserAnsichtMenu.tsx:195–210
- **Dedup-Notiz:** Die Zahl ist kein Zufall, sondern der per David-Entscheid A26 in das Menü aufgegangene Fussnoten-Chip (V2·K-2, «Zähler N am Fussnoten-Schalter»); der Accessible-Name lautet bereits «Fussnoten (N)». Dass Linien/Verweise keine Zahl tragen, ist damit erklärt (nur Fussnoten haben eine sinnvolle Menge). ⇒ Befund auf die SICHTBARE Erklärung verengen; Entfernen kollidiert mit A26.

#### LM-026 · 4 Detail

- **Bauteil:** K-03 · Menüinhalt und Zustandsanzeige
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Ansicht» öffnen, Gruppe «Änderungshistorie»
- **Beobachtung:** «aus» und «Fussnoten» stehen inline nebeneinander, «Chronologie» steht darunter in eigener Zeile ohne Einrückung — obwohl alle drei zur selben Gruppe gehören.
- **Erwartet:** Zusammengehörige Optionen stehen erkennbar beieinander.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

### K-04 · Karten

#### LM-027 · 2 Hoch

- **Bauteil:** K-04 · Karten
- **Route:** /
- **Breite:** 1440 px
- **Prüfen:** `/` · 1440 px — Abschnitt «Alle Bereiche», die fünf Karten und ihre Fusszeilen vergleichen
- **Beobachtung:** Die Metazeile der Karten («1'458 Erlasse im Volltext», «23 Rechner», «26 Vorlagen») klebt am Fliesstext statt am unteren Kartenrand. Bei gleich hohen Karten sitzen die Metazeilen einer Reihe auf fünf verschiedenen Höhen.
- **Erwartet:** Die Zusatzangaben gleichartiger Karten liegen in einer Reihe auf derselben Höhe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648); src/components/start/RubrikKacheln.tsx:64–80
- **Dedup-Notiz:** Dieselbe Gestaltungsfrage an anderer Stelle: A3 («Kacheln einer Reihe gleich hoch» vs. gebautes `items-start`) hängt seit 26.6.2026 an Davids Abnahme — die Antwort dort präjudiziert die Kartenreihen-Ausrichtung app-weit. Code bestätigt die Beobachtung (Zähler steht im `space-y-1`-Block direkt unter dem Nutzen-Satz, kein `mt-auto`).

#### LM-028 · 2 Hoch

- **Bauteil:** K-04 · Karten
- **Route:** /materialien
- **Breite:** 1440 px
- **Prüfen:** `/materialien` · 1440 px — erste Kartenreihe, Karten mit ein- und zweizeiligem Titel
- **Beobachtung:** Dasselbe Muster: «ESTV · Stand 01.02.2022» hängt am Titel statt am Kartenfuss; bei zweizeiligen Titeln sitzen die Metazeilen einer Reihe unterschiedlich hoch.
- **Erwartet:** Wie oben.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** befundliste.json LM-027 (interne Dublette, gleiches Muster andere Route); FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 A3
- **Dedup-Notiz:** Identisches Muster wie LM-027, nur auf /materialien — als EIN Kartenfuss-Posten bündeln (§14.2). Gleiche Abhängigkeit von der offenen A3-Abnahme.

#### LM-029 · 2 Hoch

- **Bauteil:** K-04 · Karten
- **Route:** /rechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner` · 1440 px — Block «Einstieg nach Rechtsgebiet», x-Position der Zahlen vergleichen
- **Beobachtung:** Die Zähler (10, 4, 5, 12, 3 …) sitzen direkt hinter dem Titel und springen dadurch pro Zeile an eine andere x-Position, obwohl rechts eine feste Chevron-Spalte existiert.
- **Erwartet:** Die Zahlen bilden eine lesbare Kolonne.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-030 · 2 Hoch

- **Bauteil:** K-04 · Karten
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — «Karten» wählen und zwei nebeneinanderliegende Karten mit verschieden langem Sachgebiet vergleichen
- **Beobachtung:** Die Sachgebietszeile im Kartenkopf bricht je nach Länge auf eine bis drei Zeilen um («Privatrecht» gegen «Steuern, Sozialversicherung & Abgaben»). Die Marken «Leitentscheid» links und «ungeprüft» rechts sind an diesem Block mittig ausgerichtet und sitzen dadurch in benachbarten Karten auf verschiedener Höhe; der Kartenkopf ist entsprechend unterschiedlich hoch.
- **Erwartet:** Der Kartenkopf hat in einer Reihe dieselbe Höhe, und gleichartige Marken sitzen auf gleicher Höhe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648)
- **Dedup-Notiz:** Gleiche offene Grundsatzfrage «gleiche Höhe in einer Reihe» (A3, David-Abnahme offen seit 26.6.2026), hier für den Kartenkopf der Rechtsprechungs-Karten. Anderer konkreter Ort ⇒ eingeplant lassen, aber gemeinsam mit LM-027/028 entscheiden.

#### LM-031 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /gesetze?ebene=bund
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=bund` · 1440 px — Kartenreihen durchscrollen, Leerraum unter dem Inhalt messen
- **Beobachtung:** Unter dem Inhalt der Erlass-Karten bleiben bis zu 62 px leer (Median 20 px), weil die Zeile «N passende Werkzeuge» nur bei manchen Karten vorhanden ist und die Karten einer Reihe die Höhe der grössten übernehmen.
- **Erwartet:** Gleiche Zeilenstruktur in allen Karten einer Reihe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–649); Code src/components/normtext/ErlassKarte.tsx:56–70
- **Dedup-Notiz:** A3 ist derselbe Defekt-TYP («Kacheln einer Reihe gleich hoch», auto-rows-fr/h-full statt items-start) auf anderer Fläche (GebvKostenForm, David-Abnahme offen seit 26.6.2026) — kein Zwilling, aber der Fix-Kanon steht dort. Code bestätigt: die Zeile «N passende Werkzeuge» hängt bedingt in derselben flex-wrap-Metazeile (ErlassKarte.tsx:63–68), bricht also nur bei manchen Karten um.

#### LM-032 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /rechner/bgg-fristen · /rechner/verjaehrung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/bgg-fristen` und `/rechner/verjaehrung` · 1440 px — Ergebniskartenreihe, dritte Karte
- **Beobachtung:** In Ergebniskartenreihen fehlt einzelnen Karten die dritte Zeile (Normzeile); unter dem Wert bleibt der Platz leer, während die Nachbarkarten gefüllt sind.
- **Erwartet:** Gleiche Zeilenstruktur in allen Karten einer Reihe; fehlende Angaben ausdrücklich als «—» oder Kurztext.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/vorlagen/ui.tsx:210–220 (EckdatenKachel, `sub` optional)
- **Dedup-Notiz:** Gleiche A3-Familie (gleiche Zeilenstruktur je Reihe). Ursache code-bestätigt: `sub` ist ein optionales Prop der geteilten EckdatenKachel — fehlt es, fehlt die dritte Zeile. Fix wirkt an EINER Stelle für alle Rechner.

#### LM-033 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /rechner/mietrecht
- **Breite:** 1440 px
- **Prüfen:** `/rechner/mietrecht` · 1440 px — die drei Ergebniskarten, Oberkanten der Beschriftungen vergleichen
- **Beobachtung:** Die hervorgehobene Karte einer Dreierreihe ist durch ihre Akzentlinie 3–4 px nach unten versetzt; Beschriftungen und Werte fluchten nicht mit den Nachbarkarten. Betrifft SchKG, BGG, Erbrecht, Mietrecht, Verzugszins, Inkasso und Teuerung.
- **Erwartet:** Eine hervorgehobene Karte steht auf derselben Grundlinie wie ihre Nachbarn.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/index.css:580–585 (.lc-tile 1px-Rahmen vs. .lc-akzent-brass border-top:3px)
- **Dedup-Notiz:** Thematisch A3 (Reihen-Ausrichtung). Code bestätigt den Mechanismus und liefert die EINE Fix-Stelle: die Akzent-Oberkante ist bewusst als geteilte Klasse geführt («EINE Quelle statt 6× inline»), der 2-px-Versatz entsteht dort und nirgends sonst.

#### LM-034 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /rechner/erbteilung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/erbteilung` · 1440 px — die drei Ergebniskarten nebeneinander lesen
- **Beobachtung:** Werte in einer Kartenreihe mischen Schriftarten: «Neues Recht (ab 1.1.2023)» grotesk fett, «1/2» grotesk regulär, «nur Quoten (keine Beträge erfasst)» monospace und zweizeilig. Ebenso auf Erbrecht («10.06.2026» mono neben «nein» fett grotesk) und BGG («30 Tage» mono neben «I. zivilrechtliche Abteilung»).
- **Erwartet:** Mono für Zahlen, Daten und Normen, Grotesk für Text — durchgehend.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §4b(e) «Zwei-Stimmen-Regel» (Z.394–399: «Mono nur Zahlen/Aktenzeichen»); Code src/components/forms/ErbteilungForm.tsx:296–301
- **Dedup-Notiz:** Die geforderte Regel EXISTIERT bereits als Reglement; ihr grep-Audit vom 12.7.2026 prüfte nur `font-serif`, nicht die Mono-Achse. Code bestätigt die Ursache: `num` ist ein Prop je KACHEL, nicht je Wert — «nur Quoten (keine Beträge erfasst)» erbt darum Mono. Befund = Reglement-Verstoss, nicht neuer Wunsch.

#### LM-035 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /gesetze?ebene=international
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=international` · 1440 px — die Karten EMRK, DSGVO und CISG nebeneinander lesen
- **Beobachtung:** Drei Karten in einer Reihe mit drei verschieden bestückten Metazeilen: EMRK «SR 0.101 · amtliches PDF · Stand 16.09.2022» ohne Artikelzahl; DSGVO «nur Live-Link · Stand 27.04.2016» ohne Nummer und ohne Artikelzahl, dafür mit einer vierten Zeile «↗ amtliche Fassung»; CISG «SR 0.221.211.1 · 101 Artikel · Stand 22.05.2026» vollständig. Was «nur Live-Link» und «amtliches PDF» bedeuten, steht nirgends.
- **Erwartet:** Karten einer Reihe haben dieselbe Zeilenstruktur; abweichende Verfügbarkeit wird benannt statt in ein Metadatum gepackt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §2 Grundarten ⑦ PDF_EMBED / ⑧ LIVE_VERWEIS (Z.259–266); Code src/components/normtext/ErlassKarte.tsx:59–66
- **Dedup-Notiz:** Die Grundart-Spec regelt ⑦/⑧ nur im LESER (PDF-Rahmen, Verweiskarte), nicht auf der Übersichts-Karte — die Karten-Metazeile ist ungeregelt, dort entsteht die ungleiche Zeilenstruktur. Zeilenhöhen-Anteil zusätzlich A3 (ARCHIV §20). Was «nur Live-Link»/«amtliches PDF» heissen, steht heute nirgends im UI.

#### LM-036 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Karten-Ansicht, eine Reihe mit einzeiligem und zweizeiligem Titel
- **Beobachtung:** Der Titel ist auf zwei Zeilen begrenzt, füllt sie aber nicht immer aus. Die Normchip-Reihe darunter sitzt deshalb in benachbarten Karten auf verschiedener Höhe, während die Fusszeile beider Karten auf gleicher Höhe steht — die Karte ist unten ausgerichtet, in der Mitte nicht.
- **Erwartet:** Gleichartige Zeilen benachbarter Karten stehen auf gleicher Höhe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/rechtsprechung/EntscheidKarte.tsx:60–79
- **Dedup-Notiz:** A3-Familie (Reihen-Ausrichtung). Code bestätigt exakt: Titel `line-clamp-2` im `flex-1`-Block, Normchip-Reihe folgt direkt darauf, nur der Fuss ist über `flex-1` ausgerichtet — Mitte also unausgerichtet.

#### LM-037 · 3 Mittel

- **Bauteil:** K-04 · Karten
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Karten kantonaler Entscheide, Kopfzeile
- **Beobachtung:** In einer etwa 20 px hohen Zeile stehen drei Schriftbilder nebeneinander: die Sachgebietszeile in Schreibmaschinenschrift und Versalien, «amtl. Betreff» in kursiver Serifenschrift, «ungeprüft» in der serifenlosen Marke.
- **Erwartet:** Eine Zeile trägt eine Schrift, oder die Unterschiede haben eine erkennbare Bedeutung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §4b(e) Zwei-Stimmen-Regel; Code src/components/rechtsprechung/EntscheidKarte.tsx:39–55
- **Dedup-Notiz:** Reglement-Verstoss derselben Achse wie LM-034 (dort Mono, hier drei Register in einer Zeile). Code bestätigt: `lc-overline` (Mono/Versal) + `italic` für «amtl. Betreff»/«ohne amtl. Regeste» + `lc-badge-soft` für «ungeprüft» in EINER Statuszeile.

#### LM-038 · 4 Detail

- **Bauteil:** K-04 · Karten
- **Route:** /gesetze
- **Breite:** 1440 px
- **Prüfen:** `/gesetze` · 1440 px — die drei Einstiegskarten «Bundesrecht | Kantone | International»
- **Beobachtung:** Die Karte «Kantone» trägt eine Zusatzzeile «Erfassungsgrad je Kanton: vollständig · Auswahl · dünn», die den Knopf «Öffnen →» gegenüber den Nachbarkarten nach unten schiebt. Die drei Stufen sind unterschiedlich ausgezeichnet, ohne dass erklärt wird, was sie bedeuten.
- **Erwartet:** Gleiche Zeilenstruktur in den drei Karten; die Stufen sind benannt oder weggelassen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11.2 «Erfassungsgrad-Semantik (SSoT, BINDEND)» + IA-2 (✅ gebaut 16.7.2026, Z.1833–1850); Code src/components/normtext/Erfassungsgrad.tsx:36–43
- **Dedup-Notiz:** Die bemängelte Zusatzzeile IST die bewusst gebaute IA-2-Kurzlegende; die Stufen-Semantik (Enumerations-Beleg / n≥20 / n<20) steht in §11.2, ist im UI aber nirgends erklärt — genau der Rest, den der Befund trifft. Der Zeilen-/Höhen-Anteil gehört zu A3. NICHT ersatzlos entfernen: §8-/K-2c-Entscheid.

#### LM-039 · 4 Detail

- **Bauteil:** K-04 · Karten
- **Route:** /rechner/mietrecht
- **Breite:** 1440 px
- **Prüfen:** `/rechner/mietrecht` · 1440 px — dritte Ergebniskarte «Anfechtung/Erstreckung bis»
- **Beobachtung:** Die Karte enthält nur «–» neben zwei gefüllten Karten.
- **Erwartet:** Ein nicht anwendbarer Wert wird benannt, nicht durch einen Strich angedeutet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md F4 (Zustands-Matrix inkl. empty-State, Z.200–203) + FAHRPLAN-UI-QUALITAET.md §3 (leere und Fehlerzustände); Code src/components/forms/MietrechtForm.tsx:282–286
- **Dedup-Notiz:** Kein Befund-Zwilling, aber F4/QS-UI §3 ist die zuständige Heimat für leere Zustände. Code bestätigt: `wert={… ?? '–'}` — der Strich ist ein Fallback-Literal, keine Aussage. Vorsicht §8: «nicht anwendbar» und «nicht berechenbar» dürfen nicht denselben Text bekommen.

### K-05 · Chips und Badges

#### LM-040 · 1 Blocker

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px · hell — «BS» in der Zeile GEMEINWESEN anklicken und die Reihe danach ansehen, ohne zu wissen, welcher Chip geklickt wurde
- **Beobachtung:** Der gewählte Chip unterscheidet sich vom ungewählten nur in der Rahmenfarbe (rgb 229,231,235 gegenüber rgb 199,171,117) und in der Schriftfarbe; die Fläche ist bei beiden identisch (rgb 246,244,238). Hinzu kommt, dass die ungewählten Chips einen goldenen linken Rand tragen, den der gewählte verliert — die Auswahl nimmt eine Auszeichnung weg statt eine hinzuzufügen. Der Zustand ist technisch gesetzt (aria-pressed).
- **Erwartet:** Der gewählte Chip einer Reihe ist auf einen Blick und ohne Farbvergleich zu erkennen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md F4 «selected» + FAHRPLAN-UI-QUALITAET.md §3(c) Muster-/Zustands-Konsistenz; Code src/components/rechtsprechung/EntscheidFilter.tsx:36–41
- **Dedup-Notiz:** Kein konkreter Bestandsbefund, aber QS-UI §3 ist der deklarierte Ort für Chip-/Badge-Grammatik und Zustandsmatrix (Abgrenzungs-Precheck QS-UI §1 beachten: gebaut wird in W2·10-UI-NAV). Code bestätigt: aktiv = nur `border-brass-400 text-brass-700` auf identischer `.lc-chip`-Fläche; `aria-pressed` ist korrekt gesetzt, das Problem ist rein visuell.

#### LM-041 · 2 Hoch

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR#art-367
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-367` · 1440 px — den einzigen Entscheid-Chip am Artikel ansehen und ihn öffnen
- **Beobachtung:** Der Chip unterscheidet nicht, in welcher Rolle die Norm im Entscheid vorkommt. An Art. 367 OR (Prüfung des Werkes und Mängelrüge) steht als einziger Verweis «Sozialversicherungsgericht BS UV.2023.8 vom 23.05.2023». Der Entscheid nennt die Norm einmal in einem Klammerhinweis — «… für die werkvertraglichen Haftungsfragen Voraussetzung wäre (vgl. Art. 367 ff. OR)» — und entscheidet selbst über Unfallversicherung; sein Gegenstand lautet «Beschwerde abgewiesen. Zahlungen an juristische Person erfolgten in Umgehungsabsicht». Die Entscheidseite weist das Sachgebiet «Steuern, Sozialversicherung & Abgaben» aus; am Chip im Gesetz erscheint diese Angabe nicht.
- **Erwartet:** Am Chip ist erkennbar, in welchem Gewicht die Norm im Entscheid vorkommt — mindestens durch das Sachgebiet, besser durch die Unterscheidung zwischen tragender Erwägung und beiläufiger Erwähnung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §9/B1 Facetten-Datenmodell + §1.2 KantenChip-Dichteregel + Grammatik-Regel 5
- **Dedup-Notiz:** B1 deklariert die Facetten abschliessend: quelltyp · ebene · kanton · gericht/Instanz · Leitentscheid-Status — Sachgebiet und Zitier-ROLLE (tragende Erwägung vs. Klammerhinweis) sind NICHT dabei. Der Befund ist damit eine Erweiterung des B1-Modells, kein Anzeigefehler; Regel 5 verlangt Prop am bestehenden KantenChip, die Dichte-Regel §1.2 lässt nur EINEN Zusatz je Chip zu.

#### LM-042 · 2 Hoch

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Art. 367 und Art. 370 nacheinander ansehen und die Chips vergleichen
- **Beobachtung:** Ein «ff.»-Zitat wird auf mehrere Einzelartikel gebucht: Derselbe Entscheid (Sozialversicherungsgericht BS UV.2023.8) steht als einziger Verweis sowohl an Art. 367 als auch an Art. 370 OR. Im Entscheidtext stehen «Art. 367 ff. OR» und «Art. 370 OR».
- **Erwartet:** Ein Sammelzitat wird als solches kenntlich gemacht und nicht als eigenständiger Verweis auf jeden einzelnen Artikel des Bereichs geführt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/lib/rechtsprechung/zitat-extraktion.ts:365 (GLIED_KOPF: «Sub-Marker/ff. werden bewusst NICHT gefangen (fliessen nie in den Norm-Key)»)
- **Dedup-Notiz:** Die Prämisse ist code-widerlegt: ein «ff.»-Zitat erzeugt GENAU EINEN Norm-Key (Art. 367), es gibt keinen Fan-out auf 368/369/370. Dass derselbe Entscheid auch an Art. 370 hängt, erklärt der Befund selbst — der Entscheidtext nennt «Art. 370 OR» separat. Verbleibender Restpunkt (klein, neu): das Sammelzitat ist am Chip nicht als solches kenntlich. Prüfung wiederholen, dann auf diesen Rest verengen.

#### LM-043 · 2 Hoch

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR#art-367 · /rechtsprechung/bezuege/OR.json · /normtext/historie/OR.json
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-367` · 1440 px — Chip «FASSUNG Gilt seit 01.01.2026» am Artikel und das Datum des verlinkten Entscheids vergleichen; gegenprüfen über `/rechtsprechung/bezuege/OR.json` und `/normtext/historie/OR.json`
- **Beobachtung:** Am Verweis ist nicht erkennbar, ob der Entscheid zur geltenden Fassung des Artikels ergangen ist. Gemessen über die ausgelieferten Datensätze von OR, ZGB, ZPO und SchKG: 1073 von 8752 Verweisen (12.3 %) hängen an einer Fassung, die nach dem Entscheiddatum in Kraft trat; in der ZPO sind es 969 von 3885 (24.9 %). Im OR gibt es 16 Artikel, bei denen sämtliche Verweise älter sind als die geltende Fassung — darunter Art. 201, 362, 367, 370, 654 und 691. Bei Art. 367 OR gilt die Fassung seit 01.01.2026 (eingefügter Abs. 1bis), der einzige Verweis stammt vom 23.05.2023. Die Daten enthalten alles Nötige: je Artikel «giltSeit» und je Ereignis den betroffenen Absatz, je Entscheid ein Datum.
- **Erwartet:** Am Verweis ist erkennbar, ob er zur geltenden Fassung ergangen ist — und wenn nicht, zu welcher.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §V1c «Normrevisions-Ehrlichkeit»; Code src/lib/verzahnung/revisionen-extrakt.ts + src/pages/gesetz-leser/parts/BezuegeZeile.tsx:172–180; Artefakt public/verzahnung/artikel-revisionen/OR.json
- **Dedup-Notiz:** V1c ist gebaut UND im neuen Bezüge-Pfad (B4/B7) verdrahtet: `klassifiziereFassungsBezug(entscheidDatum, revision)` setzt am Chip den ↻-StatusBadge «Norm revidiert seit Entscheid» mit Revisionsdatum + AS-Fundstelle. Am Artefakt geprüft: OR Art. 367 → {iso 2026-01-01, as «AS 2025 270»}, Art. 370 identisch — der Verweis von 2023 MUSS also ↻ tragen. Dass der Prüfer ihn nicht erkannte, ist LM-050 (Glyph ohne Legende). Rest der Erwartung («und wenn nicht, zu WELCHER Fassung») = FAHRPLAN-UI-NAVIGATION.md §X Fassungsvergleich/Zeitreise, hart gegated (Fedlex P1a/b + David-Freigabe).

#### LM-044 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechner/zpo-fristen · /vorlagen · /materialien
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen`, `/vorlagen`, `/materialien`, `/rechtsprechung` · 1440 px — Chips nebeneinanderhalten
- **Beobachtung:** Normverweis, Statusbadge («Entwurf», «Zu unterzeichnen»), Standangabe, Sprache, Instanz und Gemeinwesen sehen alle gleich aus: heller Grund, goldener Linksbalken. Vorhanden sind bereits eigene Klassen für Chip-Arten; die Ununterscheidbarkeit entsteht durch nahezu gleiche Flächen- und Rahmenwerte.
- **Erwartet:** Ein Chip zeigt an seiner Form, worum es sich handelt — Normverweis, Metadatum oder Status.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 (Z.1429: «NormChip/Materialien (DEFER, U-VERWEIS-Kollision)»); FAHRPLAN-VERZAHNUNG-UI.md §1.2/§1.3
- **Dedup-Notiz:** A25/C-1 (KantenChip norm=brass / entscheid=slate) und C-2 (Currency-Tonung) sind im Code umgesetzt (src/index.css:687–700, Test src/tests/v2-c2-farbwoerterbuch.test.tsx); C-3 — genau die hier bemängelten NormChip-/Materialien-Chips — ist ausdrücklich DEFER und damit der offene Zwilling. VZUI §1.2/1.3 hält die Anatomie-Grenze Chip↔Badge fest.

#### LM-045 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Metazeile unter dem Titel, die fünf Chips anfassen
- **Beobachtung:** Fünf gleich aussehende Chips sind drei verschiedene Dinge: «↗ geltende Fassung» und «⬇ Amtliches PDF» sind externe Links mit target=_blank, «⧉ In neuem Reiter» ist ein Knopf, «geltend geprüft am 27.07.2026 (maschinell)» und «nächste Fassung ab 01.10.2026» sind reine Textangaben.
- **Erwartet:** Aktion, externer Link und reine Angabe sind an ihrer Form unterscheidbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.8 A25/C-2 (Currency-Tonung) + src/index.css:692–700; Code src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx:62–76
- **Dedup-Notiz:** Teilweise überholt: die fünf Chips sind NICHT völlig gleich — C-2 gibt «geltend geprüft» (sage) und «nächste Fassung ab» (warn) je einen eigenen Tick. Die Unterscheidung trennt aber ZUSTÄNDE, nicht Aktion/externer Link/reine Angabe — dieser Achsen-Defekt ist neu und in keinem Bestand geführt (Heimat QS-UI §3 Chip-Grammatik).

#### LM-046 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Chip «nächste Fassung ab 01.10.2026» anklicken
- **Beobachtung:** Der Chip sieht wie die naheliegendste Aktion aus, ist aber ein span und nicht klickbar. Ein Weg zur künftigen Fassung fehlt.
- **Erwartet:** Was aussieht wie eine Aktion, ist eine.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §X «Fassungsvergleich/Zeitreise» (hart gegated: Fedlex-P1a/b + David-Freigabe); Code src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx:72–76
- **Dedup-Notiz:** Beobachtung code-bestätigt (`<span className="lc-chip lc-chip-vorbehalt">`, kein Ziel). ACHTUNG Scope: «ein Weg zur künftigen Fassung» ist der gegatete Teil (§X — ein Fassungs-Dropdown vor P1a/b wäre §8-Bruch). Sofort baubar ist nur die Form-Trennung «Angabe ≠ Aktion».

#### LM-047 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechtsprechung/bge_152_V_52
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bge_152_V_52` · 1440 px — Meta-Zeile unter dem Titel
- **Beobachtung:** Sechs Elemente in einer Zeile, drei Formensprachen: «★ Leitentscheid» (grüne Pille), «DE» und «maschinell» (graue Pillen), «↗ massgebliche Fassung» (Chip mit Goldbalken), «⧉ Zitat kopieren» und «▭ Lesemodus» (Aktionen).
- **Erwartet:** Zustände und Aktionen sind auf den ersten Blick unterscheidbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §1.2/§1.3 (KantenChip vs. StatusBadge = zwei bewusste Anatomien) + FAHRPLAN-UI-QUALITAET.md §3; Code src/pages/EntscheidLeser.tsx:498–528
- **Dedup-Notiz:** Teil-Bestand: dass «★ Leitentscheid»/«maschinell» als Badge und der Rest als Chip erscheint, IST die gewollte VZUI-Grammatik (Badge = Abweichung, Chip = Referenz). Ungeregelt ist, dass derselbe `lc-chip` zugleich externer Link, Kopier-Aktion und Lesemodus-Schalter trägt (+ die bordierte A−/A+-Gruppe, im Befund nicht erwähnt). Identischer Defekt wie LM-045 auf der Entscheid-Fläche — zusammen schneiden.

#### LM-048 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechtsprechung/bezuege/OR.json
- **Breite:** 
- **Prüfen:** `/rechtsprechung/bezuege/OR.json` abrufen und das Feld «gewicht» je Verweis mit der Darstellung am Artikel vergleichen
- **Beobachtung:** Je Verweis ist bereits eine Gewichtung erfasst: im OR 768× Wert 0, 92× 1, 26× 2, 3× 3, 1× 5 und 576× ohne Wert. In der Anzeige sehen alle Chips gleich aus. Der Verweis an Art. 367 OR trägt keinen Wert.
- **Erwartet:** Eine erfasste Gewichtung wird in der Darstellung sichtbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/gesetz-leser/parts/BezuegeZeile.tsx:44–51 + src/lib/rechtsprechung/bezuege.ts:36–45; FAHRPLAN-VERZAHNUNG-UI.md §1.0 («gewicht: In-degree, nie ‹Autorität›») + Grammatik-Regeln 2/7
- **Dedup-Notiz:** KOLLISION, nicht Lücke: die Nicht-Anzeige des `gewicht` ist ein dokumentierter Entscheid aus W2·7-BEZUG (Gegenprüfung Runde 1/B3 + B7) — `gewicht: null` heisst NICHT MESSBAR (kantonale/eidg. Geschäftsnummern trifft der Zitier-Graph nicht), darum wird es «weder als 0 noch als ‹–›» gerendert und seit B7 nicht einmal mehr als Sortierachse. Die 576 Verweise «ohne Wert» im Befund sind genau diese Klasse. Umsetzung nur mit David-Entscheid; R16 (Ampel/Treatment) ist zu.

#### LM-049 · 3 Mittel

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Karten-Ansicht, Normchips einer Karte, z. B. «AHVG BGG BPG DBG +2»
- **Beobachtung:** Der Überlaufhinweis «+2» (bzw. «+5», «+6») steht als blosser Text neben den gerahmten Chips, ohne Rahmen und ohne Abstand nach dem Muster der Chips. Ob er anklickbar ist und was er aufklappt, ist nicht erkennbar.
- **Erwartet:** Der Überlaufhinweis ist als das erkennbar, was er ist — Text oder Bedienelement.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-050 · 4 Detail

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — Entscheid-Chips am Artikel
- **Beobachtung:** An den Entscheid-Chips stehen bis zu drei Symbole hintereinander: «★» hinter der BGE-Nummer, «↻» dahinter und ein Kopiersymbol daneben. Keines ist beschriftet, es gibt keine Legende.
- **Erwartet:** Symbole sind erklärt oder beschriftet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §1.3 StatusBadge (★ «verliert sein aria-hidden-ohne-Erklärung-Dasein») + §1.7 Begriff-Glossar («NICHT nur `title`», touch-tauglich); Code src/components/verzahnung/StatusBadge.tsx:88–97
- **Dedup-Notiz:** Teilweise überholt: ★ und ↻ tragen bereits `role=img` + `aria-label` + `title` mit Erklärtext (beim ↻ inkl. Revisionsdatum + AS-Fundstelle). Offen bleibt genau das, was VZUI §1.7 als Muster fordert: touch-/tastaturtaugliche Erklärung statt `title` und eine sichtbare Legende. Korrektur: das dritte Zeichen ⧉ ist kein Kopiersymbol, sondern «nebeneinander öffnen» (ArtikelLeser.tsx, aria-label vorhanden).

#### LM-051 · 4 Detail

- **Bauteil:** K-05 · Chips und Badges
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — einen Filterchip der Zeile GEMEINWESEN markieren und kopieren
- **Beobachtung:** Beschriftung und Zahl stehen im Text ohne Trenner aneinander: kopiert ergibt der Chip «AG6», «BS3765», «Alle5093». Optisch trennt ein Abstand die beiden Teile, im Text nicht.
- **Erwartet:** Beschriftung und Zahl sind auch ausserhalb der optischen Darstellung getrennt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Code src/components/rechtsprechung/EntscheidFilter.tsx:36–42
- **Dedup-Notiz:** Scope-Korrektur: der Chip trägt bereits `aria-label={label}: {voll} ({n})` — Screenreader und Tooltip sind sauber getrennt. Der Restdefekt betrifft NUR die Text-/Kopier-Repräsentation (fehlender Trenner im DOM-Textknoten). Kein Bestandsbefund; Heimat QS-UI §3.

### K-06 · Umschalter, Tabs und Akkordeons

#### LM-052 · 2 Hoch

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /einstellungen
- **Breite:** 1440 px
- **Prüfen:** `/einstellungen` · 1440 px — Gruppe «Farbschema», Höhen der drei Knöpfe messen
- **Beobachtung:** In Buttongruppen ist eine Option zweizeilig («Automatisch / folgt dem System»), die anderen einzeilig — die Knöpfe sind dadurch unterschiedlich hoch. Gleiches Muster bei «Vorlagen — Detailgrad» und im Vorlagen-Wizard («Einfach | Standard | Experte»).
- **Erwartet:** Optionen einer Gruppe sind gleich hoch, unabhängig von der Länge ihrer Beschriftung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-053 · 2 Hoch

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — die geschlossene Klappe «Erweiterte Filter» ansehen, öffnen, Seite neu laden
- **Beobachtung:** Geschlossen erscheint die Klappe als voll breiter, gerahmter Kasten, der nur die Beschriftung «Erweiterte Filter» und einen kleinen goldenen Punkt enthält — kein Pfeil, kein anderes Zeichen dafür, dass sich etwas aufklappen lässt; der Kasten sieht aus wie ein leeres Eingabefeld. Der Punkt steht auch dann, wenn kein erweiterter Filter gesetzt ist. Der geöffnete Zustand überlebt das Neuladen nicht, die Richter-Auswahl daneben schon.
- **Erwartet:** Eine Klappe zeigt, dass sie sich öffnen lässt, und ihr Zustand verhält sich wie der der übrigen Filter.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Code src/components/rechtsprechung/EntscheidFilter.tsx:229–230 (`<details className="lc-card">` + `<summary className="… text-brass-700">`)
- **Dedup-Notiz:** Beobachtung korrigiert: der «kleine goldene Punkt» ist der NATIVE <summary>-Marker, eingefärbt durch `text-brass-700` — also sehr wohl ein Aufklapp-Zeichen, nur unlesbar klein/als Aktiv-Indikator missverstanden. Damit ist «kein Pfeil» falsch, «Punkt steht auch ohne gesetzten Filter» erklärt. Der Persistenz-Teil ist bestätigt (kein `open`-State, keine Speicherung — anders als der Richter-Filter über die URL).

#### LM-054 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /gesetze?ebene=kanton
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=kanton` · 1440 px — «Bund | Kantone | International» und «Karte | Liste» vergleichen
- **Beobachtung:** Zwei Umschalter-Stile auf einer Seite: einmal aktiv = fett ohne Fläche, einmal aktiv = weisse Fläche mit Rand. Zusätzlich ist «← Übersicht» als Link innerhalb des Segmentschalters platziert.
- **Erwartet:** Ein Umschalter-Bild je Seite; Links stehen nicht in Umschaltergruppen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Code src/pages/Gesetze.tsx:63–88 (Ebene-tablist) vs. src/pages/gesetze-teile/KantonAuswahl.tsx:110–115 (Karte|Liste) und Gesetze.tsx:303–309 («← Übersicht»)
- **Dedup-Notiz:** Zwei von drei Behauptungen code-widerlegt: (a) «Bund | Kantone | International» und «Karte | Liste» tragen DASSELBE Bild (`rounded-md border border-line bg-paper-sunken/50 p-0.5`, aktiv `bg-paper … shadow-sm`) — kein Stilbruch zwischen diesen beiden; (b) «← Übersicht» steht als Geschwister VOR dem `role="tablist"`, nicht darin. Der echte Stilbruch ist der beige Aktiv-Stil von Sortieren/Gliederung (→ LM-055/LM-057). Vintage-Regel FAHRPLAN-UI-NAVIGATION.md §0.1 anwenden.

#### LM-055 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /gesetze?ebene=bund
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=bund` · 1440 px — Sortierumschalter «Relevanz | Systematisch | Rechtsgebiet»
- **Beobachtung:** Ein dritter Umschalter-Stil auf derselben Seitengruppe: aktiv = beige hinterlegt. Das Label «GLIEDERUNG» steht ohne Abstand direkt vor den Optionen und liest sich wie eine vierte Option.
- **Erwartet:** Ein Umschalter-Bild; Label und Optionen sind unterscheidbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-056 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — «Rechenweg (6 Schritte)» und «Für die Rechtsschrift …» öffnen
- **Beobachtung:** Zwei Akkordeon-Stile auf derselben Seite: einmal rechtsbündiges ▼, einmal winziger Pfeil ▸ direkt am Text, der beim Öffnen nicht rotiert.
- **Erwartet:** Aufklappbare Bereiche sehen überall gleich aus und zeigen ihren Zustand an.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-057 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /gesetze?ebene=kanton&kt=BS
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=kanton&kt=BS` · 1440 px — alle Umschaltergruppen der Seite zählen und ihre Aktivzustände vergleichen
- **Beobachtung:** Vier Umschaltergruppen gleichzeitig sichtbar, in drei verschiedenen Darstellungen: «Bund | Kantone | International» (aktiv fett ohne Fläche), «Karte | Liste» (aktiv weisse Fläche mit Rand), «SORTIEREN Alphabet | Erlass-Zahl | Erfassungsgrad | Region» (aktiv beige hinterlegt) und die Reihe der 26 Kantonskürzel «AG 4 | AI 4 | AR 266 | … | BS 859» (aktiv beige). Die Kürzelreihe bricht so um, dass in der zweiten Zeile nur «ZH 3» steht.
- **Erwartet:** Ein Umschalter-Bild je Seite.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** wie LM-054: src/pages/Gesetze.tsx:63–88 + src/pages/gesetze-teile/KantonAuswahl.tsx:110–130; Kantons-Pills = IA-2 (FAHRPLAN-GESETZES-UX.md Z.1833–1850, gebaut)
- **Dedup-Notiz:** Kern bestätigt (mehrere Umschalter-Bilder gleichzeitig), Zählung korrigiert: es sind ZWEI Bilder, nicht drei — Ebene und Karte|Liste teilen den bordierten Stil, Sortieren/Gliederung/Kantons-Pills den beigen. Die 26er-Pill-Reihe samt Zahl ist gebaute IA-2-Fläche (Erlass-Zahl + Zustands-Wort, §8) — beim Umbau nicht wegvereinheitlichen.

#### LM-058 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /rechner/zustaendigkeit
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zustaendigkeit` · 1440 px — Schrittleiste «1 Was möchten Sie tun? … 6 Fahrplan»
- **Beobachtung:** Ein weiterer Umschalter-Stil: nummerierte Kreise mit Beschriftung, der aktive Schritt in einer Pille mit Rand, die übrigen grau. Ob die grauen Schritte anklickbar sind, ist nicht erkennbar; ein Fortschritt über die sechs Schritte wird nicht dargestellt.
- **Erwartet:** Die Schrittleiste zeigt, welche Schritte erreichbar sind und wo man steht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Code src/components/vorlagen/ui.tsx:101–143 (geteilter `Stepper`)
- **Dedup-Notiz:** Zur Hälfte überholt: Fortschritt IST dargestellt — erledigte Schritte tragen einen gefüllten Messing-Kreis mit ✓, der aktive einen Ring, mobil läuft sogar eine `role=progressbar`-Leiste. Offen bleibt allein die Erreichbarkeits-Affordanz: künftige Schritte sind nur `text-ink-500 cursor-default`, ohne `disabled`/`aria-disabled` — für Maus wie Screenreader nicht als unerreichbar erkennbar. Fix wirkt an EINER geteilten Stelle (auch Vorlagen-Wizards).

#### LM-059 · 3 Mittel

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7 · /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Leiste «Sachverhalt | Erwägungen | Dispositiv» mit den Filterchips auf `/rechtsprechung` vergleichen
- **Beobachtung:** Die drei Abschnitts-Reiter tragen dasselbe Bild wie die Filterchips der Trefferliste — gleiche Form, gleicher goldener linker Rand, gleiche Schreibmaschinenschrift. Dieselbe Gestalt steht damit einmal für «Filter setzen» und einmal für «Abschnitt anspringen».
- **Erwartet:** Reiter und Filterchips sind an ihrer Gestalt zu unterscheiden.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Chip-/Badge-Grammatik) + FAHRPLAN-VERZAHNUNG-UI.md §1.2 (KantenChip = der EINE Chip für Dokument-Referenzen); Code src/pages/EntscheidLeser.tsx:175–186 vs. src/components/rechtsprechung/EntscheidFilter.tsx:36–41
- **Dedup-Notiz:** Code bestätigt die Gleichgestalt exakt: die Abschnitts-Sprungziele sind `<a className="lc-chip …">`, die Filter-Chips `<button className="lc-chip …">`. VZUI reserviert `lc-chip`/KantenChip für Dokument-REFERENZEN — weder Sprungziel noch Filter ist eine Kante; die Grammatik ist also schon deklariert, nur nicht durchgesetzt. Kein konkreter Bestandsbefund.

#### LM-060 · 4 Detail

- **Bauteil:** K-06 · Umschalter, Tabs und Akkordeons
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Akkordeon «Vorschau & Bausteinprotokoll»
- **Beobachtung:** Das Akkordeon hat zwei Pfeilmarken (▼ mittig und ▸ ganz rechts); darunter rund 160 px Leerraum vor dem Footer.
- **Erwartet:** Ein aufklappbarer Bereich hat eine Marke.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

### K-07 · Scrollbereiche

#### LM-061 · 1 Blocker

- **Bauteil:** K-07 · Scrollbereiche
- **Route:** /
- **Breite:** 1440 px
- **Prüfen:** `/` · 1440 px — Reihen «Neues vom Bundesgericht» und «Zuletzt verwendet», rechten Rand ansehen
- **Beobachtung:** Die letzte Karte bzw. der letzte Chip wird am rechten Containerrand hart mitten im Wort gekappt («BGer 5A_543/2017 vom 6. Fe», «BGer 12T_4/2025 vom 1»). Kein Verlauf, kein Scroll-Hinweis.
- **Erwartet:** An scrollbaren Reihen ist am Rand erkennbar, dass es weitergeht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md D10 + D11 + Systematik-Befund S-B; FAHRPLAN-UI-NAVIGATION.md §6 J2 (#57-Rest); Code: src/components/start/NewsHeader.tsx:95, src/components/start/ZuletztVerwendet.tsx:38 (beide overflow-x-auto ohne Verlauf) vs. src/components/rechtsprechung/SachgebietKacheln.tsx:56 (Verlauf-Utility existiert)
- **Dedup-Notiz:** Gleiche Defektklasse («bewusste overflow-x-Rail ohne visuelle Scroll-Affordanz»), andere Stellen. ACHTUNG Widerspruch: D11 betrifft exakt die News-Reihe und wurde als «bewusstes Karussell — die angeschnittene Karte IST die Affordanz, kein Bruch» eingestuft; D10 (Chip-Band) wurde dagegen mit Verlauf gefixt. Die «Zuletzt verwendet»-Reihe ist in keinem Bestand erfasst. Bau-Session braucht David-Entscheid, ob D11 revidiert wird.

#### LM-062 · 1 Blocker

- **Bauteil:** K-07 · Scrollbereiche
- **Route:** /rechner/erbteilung
- **Breite:** 390 px
- **Prüfen:** `/rechner/erbteilung` · 390 px — Tabelle «Erbteile & Pflichtteile» nach rechts zu scrollen versuchen
- **Beobachtung:** Die Tabelle wird rechts abgeschnitten, ohne Scrollbereich und ohne Hinweis. Die komplette Spalte «Pflichtteil» inklusive des Werts der Zeile «Verfügbare Quote» fehlt. Gleiches auf `/rechner/verjaehrung-board`.
- **Erwartet:** Jede Tabellenspalte bleibt erreichbar, insbesondere die Ergebnisspalte.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/forms/ErbteilungForm.tsx:305 (`lc-card p-5 overflow-x-auto`) + :307 (`table min-w-[42rem]`); src/pages/RechnerVerjaehrungBoard.tsx:44 (`overflow-x-auto`); abnahme/responsive-audit/BERICHT.md, 0-Befund-Liste: «alle rechner-* (390 — … erbteilung-Erbteile-Tabelle scrollt im overflow-x-auto-Card)»
- **Dedup-Notiz:** Die Behauptung «ohne Scrollbereich» ist code-widerlegt: beide Tabellen liegen in einem eigenen horizontalen Scroll-Container, die Pflichtteil-Spalte ist erreichbar. Ehrlich bleibt nur der Rest «kein Hinweis» = fehlende Scroll-Affordanz → gehört zu LM-061/LM-063. Prüfung im Browser wiederholen, dann auf die Affordanz verengen oder erledigen.

#### LM-063 · 2 Hoch

- **Bauteil:** K-07 · Scrollbereiche
- **Route:** /rechner/schkg-fristen
- **Breite:** 720 px
- **Prüfen:** `/rechner/schkg-fristen` · 720 px — Verfahrensphasen-Leiste, rechten Rand ansehen
- **Beobachtung:** Unter etwa 800 px wird der letzte Tab abgeschnitten («Schiedsverfah»). Kein Hinweis, dass gescrollt werden kann. Auf `/rechner/schkg-fristen` beginnt der achte Tab bei 390 px erst bei x ≈ 1050. Gleiches auf `/rechner/zpo-fristen`, `/rechner/tagerechner` und den Sachgebiets-Tabs von `/rechtsprechung`.
- **Erwartet:** Auf jeder Breite ist die Leiste entweder ganz sichtbar oder klar als scrollbar erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md S-B + D10 (Chip-Band-Affordanz gefixt in SachgebietKacheln.tsx); Code: src/components/ui/Tabs.tsx:42 (`w-fit max-w-full overflow-x-auto`, gemeinsamer Baustein für zpo-/schkg-Phasenleisten, ZpoFristenForm.tsx:191)
- **Dedup-Notiz:** Gleiche Defektklasse wie D10 (Rail ohne Verlauf/Schatten), andere Bauteile. Vorteil für die Bau-Session: es ist EIN gemeinsamer Baustein (ui/Tabs.tsx) — ein Fix deckt alle genannten Leisten ab.

#### LM-064 · 3 Mittel

- **Bauteil:** K-07 · Scrollbereiche
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Gliederungskasten, unteren Rand und waagerechte Leiste ansehen
- **Beobachtung:** Der Gliederungskasten hat eine feste Höhe und schneidet die letzte sichtbare Zeile mitten durch. Er hat zusätzlich einen horizontalen Scrollbalken, weil der Inhalt breiter ist als der Kasten, und keinen sichtbaren Rahmen — im Dunkelmodus wirkt der Schnitt wie ein Darstellungsfehler.
- **Erwartet:** Die Gliederung ist in einer Richtung scrollbar, als Scrollbereich erkennbar, und schneidet keine Zeile an.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.10 E4/A32 (Kontextpanel im TOC-Scroller, gebaut 25.7.2026, PR #346) und E7/A33 (TOC-Scroll-Spy-Fix 17.7.2026); Code: src/pages/gesetz-leser/inhalt-volltext.tsx ~Z. 318–352 (sticky `maxHeight: calc(100vh - …)`, `div[data-toc] flex-1 min-h-0 overflow-y-auto`, kein Rahmen)
- **Dedup-Notiz:** Dieselbe Fläche (Gliederungsspalte), anderer konkreter Defekt: E4/A33 betrafen Einklemmung durch den 33vh-Slot bzw. Sprungverhalten, hier geht es um Anschnitt der letzten Zeile, fehlenden Rahmen und den zusätzlichen horizontalen Balken (overflow-y:auto ⇒ overflow-x:auto). Reader-Fläche ⇒ §0.2-Sequenzierung von FAHRPLAN-UI-NAVIGATION.md beachten.

#### LM-065 · 3 Mittel

- **Bauteil:** K-07 · Scrollbereiche
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px · zwei Reiter offen — Entscheid-Chipreihe im rechten Reiter
- **Beobachtung:** In einem 560 px breiten Reiter ist ein einzelner Entscheid-Chip («Appellationsgericht BS VD.2022.207 …») bereits breiter als die Spalte und wird abgeschnitten; die Chipreihe bekommt einen eigenen Scrollbalken innerhalb einer ohnehin schmalen Spalte.
- **Erwartet:** Entscheidangaben bleiben auch in schmalen Spalten lesbar, notfalls umgebrochen statt seitlich abgeschnitten.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** ROADMAP-CHRONIK.md:1227–1245 (W2·7-BEZUG B7, gebaut 29.7.2026, PR #406 `5a10f8150`); Code: src/pages/gesetz-leser/parts/BezuegeZeile.tsx:163 (`lc-bezug-linie flex h-7 … overflow-x-auto overflow-y-hidden`)
- **Dedup-Notiz:** Kollision mit einem frischen David-Entscheid: «je Instanz EINE scrollbare Linie, alle Entscheide sichtbar» ist Davids wörtlicher Intake vom 28.7.2026 und wurde am 29.7. so gebaut. Der Befund verlangt das Gegenteil (Umbruch statt seitlichem Scroll) — das ist keine Politur, sondern eine Revision; als David-Frage vorlegen, nicht autonom umbauen.

### K-08 · Eingabe- und Auswahlfelder

#### LM-066 · 2 Hoch

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/gewaehrleistung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/gewaehrleistung` · 1440 px — «Art des Mangels» und «Rüge erhoben am» in derselben Zeile, Höhen messen
- **Beobachtung:** Bedienelemente derselben Zeile sind unterschiedlich hoch: Segmentschalter 39 px neben Datumsfeld 50 px — 11 px Unterschied. Ebenso `/rechner/erbteilung` (Zahlfeld 50 px neben Knopf «+ Stamm hinzufügen» 36 px). Insgesamt kommen Felder in 50, 44, 52 und 36 px vor.
- **Erwartet:** Bedienelemente einer Zeile sind gleich hoch und liegen auf einer Linie.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (UX-PUNKTELISTE A3, Betreibungskosten-Kacheln `items-start` statt `auto-rows-fr`/`h-full`, David-Abnahme offen seit 26.6.2026); Code: src/index.css:611 (.lc-input padding 12/14 ⇒ ~50 px), :659 (.lc-btn 44 px), :670 (.lc-btn-sm 36 px), :628 (.lc-input-sm 36 px)
- **Dedup-Notiz:** Gleiche Familie «Zeilen-Ausrichtung/Höhen in Rechner-Formularen», anderer konkreter Ort. Wichtig für die Bau-Session: die Höhenspreizung 50/44/36 stammt aus den Komponentenklassen selbst — ein Fix je Call-Site heilt die Wurzel nicht, und A3 ist eine noch offene David-Abnahme derselben Frage.

#### LM-067 · 2 Hoch

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/zpo-fristen
- **Breite:** 720 px
- **Prüfen:** `/rechner/zpo-fristen` · 720 px — Auswahlfeld «Frist-Vorlage» und «Ereignis»
- **Beobachtung:** Auswahlfelder schneiden ihren Wert hart ab, nie mit Auslassung: «– Vorlage wählen (oder manuell u», «SchKG-Betreibungsferien (Art. 56,», «Ausschlagung – gesetzliche Erbin/gesetzlicher Erbe (3 Mon», «Zustellung eines erstinstanzliche». Zusätzlich nutzen die Felder oft nur die halbe verfügbare Spaltenbreite.
- **Erwartet:** Der gewählte Wert ist ablesbar; wo gekürzt wird, ist die Kürzung erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md D9 (Gesetze-Suchkürzel «hart ohne Ellipsis abgeschnitten», gefixt via knappem Placeholder in Gesetze.tsx) und D5 (Header-Placeholder «Suc»)
- **Dedup-Notiz:** Gleiche Defektklasse (Beschriftung hart im Wort gekappt, keine Ellipsis), andere Bauteile: D9/D5 betrafen Such-/Placeholder-Felder, hier <select>-Werte auf /rechner/zpo-fristen. Beim Bau beachten: der gewählte Wert eines nativen <select> lässt sich nicht per text-overflow kürzen — entweder Optionstexte kürzen oder Feldbreite (zweiter Teil des Befunds).

#### LM-068 · 2 Hoch

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /materialien · /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/materialien` · 1440 px und `/rechtsprechung` · 490 px — Platzhalter der Suchfelder
- **Beobachtung:** Platzhalter werden mitten im Wort abgeschnitten: «Suchen oder Nc» (Kopfleiste mobil), «Suchen — Thema, Aktenzeichen, Norr», «Titel, Nummer oder Behörde s…». Auf `/materialien` ist das Suchfeld deutlich schmaler als die beiden Auswahlfelder daneben.
- **Erwartet:** Platzhalter sind auf jeder Breite als vollständiger Hinweis lesbar; das Suchfeld ist nicht schmaler als die Filter.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md D9 (gefixt: Placeholder «Suchen — Kürzel, Titel, SR-Nr. …» + h-11) und D5/D2 (Header-Suche `pr-3 lg:pr-14`, Ergebnis «Suchen oder No…»)
- **Dedup-Notiz:** Der Teil «Suchen oder Nc» (mobile Kopfleiste) ist das Resultat des D2/D5-Fixes vom 10.7.2026 — dort wurde bewusst gekürzt; Beobachtung teilweise überholt. Neu und ungedeckt sind /materialien (Suchfeld schmaler als die Filter) und /rechtsprechung @490.

#### LM-069 · 2 Hoch

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — «Erweiterte Filter» öffnen und die Auswahlliste «Gericht» aufklappen
- **Beobachtung:** Die Liste enthält zwei Einträge mit identischer Beschriftung und verschiedenen Zahlen: «Bundesgericht (24)» und «Bundesgericht (1259)». Woran sich die beiden unterscheiden, ist an der Beschriftung nicht erkennbar. Die übrigen zwölf Einträge sind eindeutig; die Summe aller Zahlen ergibt korrekt 5093.
- **Erwartet:** Zwei Einträge derselben Liste sind an ihrer Beschriftung unterscheidbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Herkunft geprüft: src/components/rechtsprechung/EntscheidFilter.tsx:62 baut die Liste aus den distinkten {gericht, gerichtName}-Paaren des Bestands — zwei verschiedene Gerichts-IDs tragen denselben Anzeigenamen «Bundesgericht». Fix gehört an die Daten-/Label-Schicht, nicht ans Formular; §8-relevant (Zahlen sind ehrlich, nur die Beschriftung ist mehrdeutig).

#### LM-070 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /
- **Breite:** 1440 px
- **Prüfen:** `/` · 1440 px — Schnellrechner, «Datum (Ereignis)» und «Frist» nebeneinander
- **Beobachtung:** Das native Datumsfeld ist 52 px hoch, das Zahlen- und das Auswahlfeld daneben 50 px. Gleiches auf `/rechner/tagerechner`.
- **Erwartet:** Wie oben.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3, Zeilen-Ausrichtung Rechner-Formulare, David-Abnahme offen); Code-Wurzel: src/components/forms/EinfacheFristForm.tsx:198 (`<input type="date">` nativ) — geteilt von Startseiten-Schnellrechner (start/Schnellrechner.tsx:115) und /rechner/tagerechner (RechnerTagerechner.tsx:112)
- **Dedup-Notiz:** Selbe Ausrichtungs-Familie wie A3, anderer Ort. Die 52-vs-50-px-Differenz hat dieselbe Wurzel wie LM-073/074: EIN nativer Datepicker in einer sonst mit DatumsFeld gebauten App — beide Befunde mit einem Schnitt heilbar.

#### LM-071 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — rechte Innenabstände der Auswahlfelder vergleichen
- **Beobachtung:** Für denselben Bauteiltyp existieren drei rechte Reserven für das Chevron: 38 px, 44 px und 56 px. Die Komponentenklasse selbst setzt 38 px; die anderen Werte stammen aus Überschreibungen.
- **Erwartet:** Gleiche Bauteile haben gleiche Innenabstände.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Stichprobe bestätigt die Beobachtung wörtlich: src/index.css:633 ff. `select.lc-input, .lc-select { padding-right: 38px; background-position: right 12px center }` — die 44/56-px-Werte stammen tatsächlich aus Call-Site-Überschreibungen.

#### LM-072 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/erbteilung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/erbteilung` · 1440 px — «Lebende Kinder (Anzahl)» neben den übrigen Feldern
- **Beobachtung:** Einzelne Felder sind willkürlich schmal: «Lebende Kinder (Anzahl)» rund 110 px, «Vereinbarte Kündigungsfrist in Monaten» rund 110 px, «Betrag alt (CHF)» rund 175 px, «Aktenzeichen / Referenz» rund 285 px — jeweils neben Feldern von 490 px. Daneben bleiben Rasterzellen leer.
- **Erwartet:** Feldbreiten folgen dem Raster; leere Rasterzellen sind gewollt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Ausrichtung in Rechner-Formularen, `auto-rows-fr`/`h-full` vs. `items-start`, David-Abnahme offen); FAHRPLAN-UI-QUALITAET.md §5 (a) Fundament-Pass
- **Dedup-Notiz:** Gleiche Familie (Raster-Disziplin in Rechner-Formularen), anderer konkreter Defekt (Feldbreiten + leere Rasterzellen statt Zeilenhöhen). A3 ist die noch offene Grundsatzfrage dazu.

#### LM-073 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/tagerechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner/tagerechner` · 1440 px — oberes und unteres Datumsfeld vergleichen
- **Beobachtung:** Das obere Datumsfeld ist ein natives Browserfeld mit Standard-Kalendersymbol und abweichendem Innenabstand; alle übrigen Datumsfelder der Seite tragen das eigene Design mit goldenem Symbol. Auch die Felder im Rechtsprechungs-Menü sind native Felder.
- **Erwartet:** Ein Datumsfeld-Erscheinungsbild im ganzen Produkt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Stichprobe bestätigt: eigenes DatumsFeld (src/components/DatumsFeld.tsx, «ersetzt den nativen Browser-Datepicker») steht neben nativen Feldern in EinfacheFristForm.tsx:198, rechtsprechung/EntscheidFilter.tsx:246/251, verzahnung/BezugZeitWahl.tsx:250 («Nativ type=date» im Kommentar deklariert), GmbhDokumentmappe, vorlage-ag-gruendung u. a. — die Stelle existiert also noch.

#### LM-074 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px · Browser mit englischer Oberflächensprache — Datumsfeld ansehen
- **Beobachtung:** Die Anzeige folgt der Browsersprache, nicht der Seitensprache: «07/29/2026» statt «29.07.2026». Im Schnellrechner wird der Wert zusätzlich am rechten Rand gekappt.
- **Erwartet:** Datumsangaben erscheinen im Schweizer Format und passen vollständig ins Feld.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Gleiche Code-Wurzel wie LM-073 (natives `<input type="date">`); Anzeigeformat folgt zwingend der Browser-Locale — heilbar nur durch Umstellung auf DatumsFeld (dort dd.MM.yyyy fest, DatumsFeld.tsx:22).

#### LM-075 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — «Erweiterte Filter» öffnen, Felder «Urteil ab» und «Urteil bis» ansehen
- **Beobachtung:** Die beiden Datumsfelder sind Browser-Standardfelder und fallen aus dem übrigen Formularbild: Der Platzhalter steht klein geschrieben als «tt.mm.jjjj», während die Seite Daten sonst als «14.04.2026» setzt, und rechts im Feld sitzt das Kalendersymbol des Browsers, das kein anderes Feld der Seite hat.
- **Erwartet:** Datumsfelder tragen dieselbe Handschrift wie die übrigen Felder der Seite.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Stichprobe bestätigt die Stelle: src/components/rechtsprechung/EntscheidFilter.tsx:246 und :251 (`<input type="date" lang="de-CH" className="lc-input h-9 py-0">`) — nativ, mit Browser-Kalendersymbol; `lang="de-CH"` steuert die Anzeige nicht.

#### LM-076 · 3 Mittel

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Kontrollkästchen «Nur Leitentscheide (amtliche BGE)» in den erweiterten Filtern
- **Beobachtung:** Das Kästchen ist der Browser-Standard, gemessen 13 × 15.8 px — nicht quadratisch und deutlich kleiner als jedes andere Bedienelement der Seite; die zugehörige Beschriftung läuft über zwei Zeilen, das Kästchen sitzt an der ersten.
- **Erwartet:** Ein Kontrollkästchen ist quadratisch, hat eine bedienbare Grösse und sitzt zur mehrzeiligen Beschriftung passend.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Stichprobe widerspricht der Messung teilweise: src/components/rechtsprechung/EntscheidFilter.tsx:257 setzt `h-4 w-4 accent-brass-600` (= 16×16, quadratisch, eingefärbt), nicht den nackten Browser-Standard — die 13×15.8 px vor dem Bau nachmessen. Bestätigt ist die Ausrichtungs-Rüge: `self-end pb-1` am Label bindet das Kästchen an die Unterkante, nicht an die erste Textzeile. Grösse < 24 px (WCAG 2.5.8) bleibt offen.

#### LM-077 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/tagerechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner/tagerechner` · 1440 px — die drei Optionen unter «Ferien / Stillstand»
- **Beobachtung:** Die drei Optionen liegen 11 px versetzt zueinander.
- **Erwartet:** Gleichrangige Optionen liegen auf einer Linie.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — gleichrangige Bedienelemente einer Reihe auf einer Linie; David-Abnahme offen seit 26.6.2026)
- **Dedup-Notiz:** Gleiche Frage («Elemente einer Reihe fluchten»), anderer Ort (/rechner/tagerechner Ferien-Optionen statt Betreibungskosten-Kacheln). Der A3-Entscheid präjudiziert die Lösung.

#### LM-078 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Gruppe «Fristtyp & Länge»
- **Beobachtung:** Ein Label für zwei Bedienelemente; das Zahlenfeld hat keine eigene Beschriftung.
- **Erwartet:** Jedes Eingabefeld hat eine eigene Beschriftung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling; auch FAHRPLAN-SEO-A11Y-GOVERNANCE.md führt keine Label-Zuordnungs-Position (Welle 1 = Fokus/axe-Tor/Heading-Hierarchie).

#### LM-079 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/betreibungskosten
- **Breite:** 1440 px
- **Prüfen:** `/rechner/betreibungskosten` · 1440 px — Labels «Forderung in Betreibung (CHF)» und «weitere Ausfertigungen»
- **Beobachtung:** Zwei Label-Ebenen im selben Formular (dunkel/fett gegenüber klein/grau) ohne erkennbare Logik; unter zwei Feldern fehlen die sonst überall vorhandenen Hilfetexte.
- **Erwartet:** Ein Formular verwendet eine Label-Ebene; Hilfetexte folgen einer erkennbaren Regel.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — `src/components/forms/GebvKostenForm.tsx:97`, Betreibungskosten, David-Abnahme offen seit 26.6.2026, Commit `3ccfd9d7e`)
- **Dedup-Notiz:** Dieselbe Datei und Seite, anderer konkreter Defekt (Label-Ebenen und fehlende Hilfetexte statt Kachelhöhen). Beide Punkte sinnvollerweise in EINEM Schnitt — und die offene A3-Abnahme muss die Bau-Session kennen, sonst wird gegen einen wartenden David-Entscheid gebaut.

#### LM-080 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/streitwert
- **Breite:** 1440 px
- **Prüfen:** `/rechner/streitwert` · 1440 px — linke Feldkante innerhalb und ausserhalb der Unterkarte «Begehren 1»
- **Beobachtung:** Die Felder in der Unterkarte sind gegenüber den Feldern ausserhalb um rund 17 px eingerückt.
- **Erwartet:** Alle Felder eines Formulars haben dieselbe linke Kante.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-081 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/gerichtszitat
- **Breite:** 1440 px
- **Prüfen:** `/rechner/gerichtszitat` · 1440 px — Felder «Teil», «Band», «Seite», «Erwägung»
- **Beobachtung:** «Erwägung» ist halb so breit wie «Band» und «Seite»; die zweite Rasterzeile hat zwei leere Spalten. «Teil» hat keinen Hilfetext, «Band» und «Seite» schon — dadurch unterschiedlich hohe Blöcke in einer Zeile.
- **Erwartet:** Felder einer Zeile sind gleich breit und gleich hoch aufgebaut.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Disziplin in Rechner-Formularen, offen)
- **Dedup-Notiz:** Gleiche Familie (Feldbreiten/-höhen einer Rasterzeile, leere Zellen), anderer Rechner (/rechner/gerichtszitat). Umbrella-Referenz, kein identischer Defekt.

#### LM-082 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/tagerechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner/tagerechner` · 1440 px — Optionen mit zweizeiligem Titel (Betreibungsferien, Verwaltungs-Stillstand, BGG-Stillstand)
- **Beobachtung:** Der Radiobutton steht bei zweizeiligen Titeln vertikal zentriert zwischen den Zeilen, bei einzeiligen auf Höhe der ersten Zeile.
- **Erwartet:** Der Radiobutton steht immer auf Höhe der ersten Textzeile.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Ausrichtung gleichrangiger Bedienelemente, offen)
- **Dedup-Notiz:** Gleiche Ausrichtungs-Familie, anderer konkreter Defekt (Radiobutton vertikal zentriert bei zweizeiligem Titel). Verwandt mit dem Ausrichtungs-Teil von LM-076 (`self-end`-Muster) — beim Bau zusammen anschauen.

#### LM-083 · 4 Detail

- **Bauteil:** K-08 · Eingabe- und Auswahlfelder
- **Route:** /rechner/tagerechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner/tagerechner` · 1440 px — zweite Rasterreihe der Ferien-Optionen
- **Beobachtung:** Die zweite Rasterreihe enthält nur zwei Karten, die dritte Rasterzelle bleibt leer.
- **Erwartet:** Das Raster füllt sich auf oder die Spaltenzahl passt sich der Anzahl an.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Kachel-/Rasterverhalten in Rechner-Formularen, `auto-rows-fr`/`h-full`-Frage offen)
- **Dedup-Notiz:** Gleiche Raster-Familie, anderer konkreter Defekt (unvollständige zweite Rasterreihe statt ungleicher Höhen).

### K-09 · Schaltflächen und Aktionen

#### LM-084 · 1 Blocker

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/schkg-fristen
- **Breite:** 390 px
- **Prüfen:** `/rechner/schkg-fristen` · 390 px — schwebende Marke «↓ Ergebnis» beim Scrollen
- **Beobachtung:** Die Sprungmarken «↓ Ergebnis» und «Vorschau ↓» sind bei 390 px absolut positioniert, ohne Sicherheitsabstand und teils über den rechten Viewportrand hinaus. Sie liegen auf dem Inhalt: über der Karte «Frist-Vorlage», über dem Normhinweis «(Art. 462 ZGB)» auf `/rechner/erbteilung`, über dem Tabellenkopf auf `/rechner/verjaehrung-board`, über der Karte «Experte» auf `/vorlagen/nda`, über der Option «Geldforderung mahnen» auf `/vorlagen/mahnung`.
- **Erwartet:** Sprungmarken verdecken auf keiner Breite Inhalt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1 N0d/W5 («↓ Ergebnis»-FAB per IntersectionObserver ausblenden — ✅ gebaut 11.7.2026) und abnahme/responsive-audit/BERICHT.md D1 (Vorschau-FAB @390, gefixt); Code: src/components/vorlagen/ui.tsx:235–247, src/components/vorlagen/wizard.tsx:83/191
- **Dedup-Notiz:** Teilwiderlegt und teilweise gebaut: der gemeinsame Baustein ist `fixed bottom-4 right-4 z-40` (nicht «absolut positioniert», nicht über den Viewportrand hinaus) und blendet seit W5 aus, sobald das Ziel sichtbar ist; wizard.tsx:83 hält dafür eigens `pb-20` mobil frei (Auftrag David 25.6.2026). Offen bleibt allein das Überdecken von Inhalt in der Zwischenzeit. Vor dem Bau am aktuellen Prod-Stand reproduzieren (§0.1-Vintage-Regel).

#### LM-085 · 2 Hoch

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px · hell und dunkel — Aktionsleiste unter dem Ergebnis
- **Beobachtung:** Drei Gewichtungen nebeneinander: «PDF-Rechenbericht» gefüllt, «In Kalender (.ics)» outline, «Link teilen» reiner Text ohne Affordanz. Im Dunkelmodus kehrt sich die Hierarchie um — der PDF-Knopf wird grau, «In Kalender» gold und dominant.
- **Erwartet:** Die Hauptaktion ist erkennbar, und die Rangfolge bleibt in beiden Farbmodi dieselbe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: Kopier-/Export-Affordanz, §13-F4-Zustandsmatrix) und §4 Ziff. 2 (axe flächendeckend Hell UND Dunkel); Code: src/index.css:663–668 (lc-btn-primary/-outline/-ghost)
- **Dedup-Notiz:** Umbrella-Überlappung, kein identischer Bestandseintrag. Der harte Teil (Hierarchie kippt im Dunkelmodus: primär wird grau, outline gold-dominant) ist in keinem Bestand erfasst und ist ein echter Zusatzbefund; er hängt an der Farbwelt-/Dunkelmodus-Kalibrierung, nicht an einer einzelnen Seite.

#### LM-086 · 2 Hoch

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — einmal nur einen Gemeinwesen-Chip setzen, einmal nur die Richter-Auswahl, und jeweils unter dem Filterblock nachsehen
- **Beobachtung:** Der Rücksetz-Link «zurücksetzen» erscheint nur, wenn die Richter-Auswahl gesetzt ist. Bei gesetztem Gemeinwesen- oder Sprachfilter fehlt er, obwohl die Trefferliste ebenso eingeschränkt ist. Er ist zudem klein, kleingeschrieben und ohne Knopf-Anmutung unter dem Filterkasten platziert.
- **Erwartet:** Solange irgendein Filter gesetzt ist, gibt es einen erkennbaren Weg zurück zur ungefilterten Liste.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Code: src/components/rechtsprechung/EntscheidFilter.tsx:149–170 + :265 — Kommentar dokumentiert den identischen Defekt für die Richter-Achse («Befund Gegenprüfung 20.7.2026») und dessen Fix via `richterAktiv`; Gemeinwesen (kanton/ebene) bewusst ohne Aktiv-Chip («sonst doppelte Repräsentation»), Sprache fehlt in der Liste ganz
- **Dedup-Notiz:** Derselbe Defekt wurde für EINE Achse (Richter) am 20.7.2026 bereits gefixt, für Gemeinwesen/Sprache nicht — die Rücksetz-Zeile rendert nur bei `aktiveChips.length > 0 || suchAktiv || richterAktiv`. Kein Plan-Bestands-Zwilling, aber die Bau-Session muss den Präzedenzfall kennen (Chip-Freiheit der Gemeinwesen-Facette ist gewollt; nur das Mitzählen fehlt).

#### LM-087 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/zpo-fristen · /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** site-weit, Beispiel `/rechner/zpo-fristen` und `/vorlagen/nda` · 1440 px — Höhen und Radien der Knöpfe vergleichen
- **Beobachtung:** 34 verschiedene Button-Varianten aus Höhe · Radius · Schriftgrad · Schnitt · Innenabstand, gemessen über 41 Seiten. Höhen: 24, 25, 29, 30, 32, 34, 36, 39, 43, 44, 46, 50, 53, 56, 64, 78, 86 px. Radien: 0, 4, 8, 12 px. Schnitte: 400/500/600. Komponentenklassen für primär, outline, ghost und klein existieren bereits — die Varianten entstehen dadurch, dass sie umgangen werden.
- **Erwartet:** Gleichartige Schaltflächen sehen gleich aus; Unterschiede stehen für eine Bedeutung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz) + §4 Ziff. 1/3 (Gate-Verschärfung); DESIGN-REGLEMENT.md «Offene Punkte» Ziff. 1 (E1-Schranke gegen Ad-hoc-Klassen — Status «🟠 offen: KEINE Schranke gegen text-sm/Arbitrary/Ad-hoc-Farben»); Code: src/index.css:659–678
- **Dedup-Notiz:** Umbrella-Überlappung: QS-UI (a)/(e) und der offene E1-Punkt des Dach-Reglements adressieren genau diese Wurzel («Komponentenklassen existieren, werden umgangen»), aber ohne die 34-Varianten-Messung. Der Befund ist damit die fehlende Empirie zu einem bereits geplanten Tor — Bau nur zusammen mit der Gate-Verschärfung, sonst wächst die Streuung nach.

#### LM-088 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/zpo-fristen · /rechner/verzugszins
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — «Kopieren» im Ergebniskopf; `/rechner/verzugszins` — «heute»; Verlaufspanel — «Verlauf leeren»; Reiter-Menü — «Alle schliessen»
- **Beobachtung:** Mehrere Aktionen sind reiner Text ohne Fläche oder Rahmen und dadurch nicht als Aktion erkennbar. «heute» ist auf dem Handy zusätzlich ein zu kleines Ziel.
- **Erwartet:** Alle Aktionen sehen wie Aktionen aus und sind gut zu treffen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass, Hitbox ≥24 px/Ziel 44, WCAG 2.5.8 — offen, Reader-sequenziert); Code: src/components/layout/TabPanel.tsx:176–182 («Alle schliessen» = reiner Textknopf)
- **Dedup-Notiz:** R6 deckt die Grössen-Hälfte («heute» zu klein), aber ausdrücklich nur Reader-Flächen (Zitat/Fussnoten/Chevrons/Breadcrumbs). Die Affordanz-Hälfte (Aktion sieht nicht wie Aktion aus) und die genannten Orte (Ergebniskopf, Verlaufspanel, Reiter-Menü) sind ungedeckt.

#### LM-089 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Wizard-Navigation «← Zurück» im ersten Schritt
- **Beobachtung:** Deaktivierte Knöpfe sind allein über opacity 0.5 gekennzeichnet. Der primäre «Weiter →» behält dabei seine dunkle Füllung und sieht weiterhin wie die Hauptaktion aus.
- **Erwartet:** Ein eigener Deaktiviert-Zustand mit ruhiger Fläche und ausreichendem Textkontrast.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix «inkl. disabled/loading/selected/empty/error»); Code: src/index.css:673–678 (`.lc-btn:disabled { opacity: .5; cursor: not-allowed }`, je Variante ausbuchstabiert)
- **Dedup-Notiz:** Beobachtung code-bestätigt (opacity .5 als einziger Deaktiviert-Marker, Füllung bleibt). Der Bestand plant die Zustands-Grammatik, hat aber keinen konkreten Befund dazu — Befund bleibt eingeplant und liefert der Zustandsmatrix ihren ersten belegten Fall.

#### LM-090 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Reiter-Menü öffnen, Symbolknöpfe je Zeile
- **Beobachtung:** Jede Zeile trägt vier Symbolknöpfe (▲ ▼ ⧉ ✕) von je rund 14 px dicht nebeneinander, deren Bedeutung nicht beschriftet ist.
- **Erwartet:** Bedienknöpfe sind gross genug und beschriftet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass) und §1 N0d/O3 (Reiter-Tracker); abnahme/responsive-audit/BERICHT.md D2 (Kopfzeilen-Controls auf 44 px, Reiter-Trigger 45×44 gefixt); Code: src/components/layout/TabPanel.tsx:122–195
- **Dedup-Notiz:** Messung teilwiderlegt: die vier Zeilen-Knöpfe sind ▲/▼/⧉ je `w-6 h-7` (24×28 px) und ✕ `w-7 h-7` (28×28 px) — also ≥24 px (WCAG 2.5.8 erfüllt, 44 px verfehlt); die «rund 14 px» sind die Glyphengrösse, nicht die Zielfläche. Jeder Knopf trägt ein sprechendes `aria-label` («Reiter «X» schliessen» usw.) — unbeschriftet ist nur die visuelle Ebene. Vor dem Bau nachmessen; R6 ist die richtige Heimat.

#### LM-091 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — mit der Maus über einen Artikel fahren, dann dasselbe per Tastatur versuchen
- **Beobachtung:** Beim Überfahren erscheint rechts oben eine Leiste «Zitat | Link | amtliche Fassung ↗». Die drei Aktionen sind reiner Text ohne Rahmen und ohne Abstand voneinander, in derselben Farbe wie Fliesstext-Links; sie erscheinen nur bei Mausbedienung.
- **Erwartet:** Die Aktionen sind als solche erkennbar und über die Tastatur erreichbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §12.5 (EID-2 ✅ 25.7., PR #349 — «David-Gate Platzierung … Sichtprüfung David erbeten») + FAHRPLAN-UI-NAVIGATION.md §4 R3/R6
- **Dedup-Notiz:** Dieselbe Aktionszeile, anderer konkreter Defekt. Beobachtung teilweise widerlegt (src/pages/gesetz-leser/parts/ArtikelLeser.tsx:432): die Zeile trägt gap-3, focus-within:opacity-100 (Tastatur enthüllt sie) und [@media(hover:none)]:opacity-100 (Touch). Offen bleibt nur «als Aktion erkennbar» (text-micro/ink-500, kein Rahmen). Bau-Session muss EID-2 kennen, sonst wird eine gerade abgenommene Platzierung erneut umgeworfen.

#### LM-092 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner · /vorlagen
- **Breite:** 1440 px
- **Prüfen:** `/rechner` und `/vorlagen` · 1440 px — Legende «Entwurf | erstellt, fachlich noch nicht geprüft»
- **Beobachtung:** Der Erklärtext ist gepunktet unterstrichen, aber nicht klickbar, und steht auf einer Zeile mit dem Filterfeld.
- **Erwartet:** Erklärender Text sieht nicht wie ein Link aus und steht nicht dort, wo ein Feldlabel erwartet wird.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/EntwurfLegende.tsx:33-42; FAHRPLAN-UI-NAVIGATION.md §1 N0d·W3 (✅ gebaut 11.7.2026)
- **Dedup-Notiz:** Prämisse widerlegt: der gepunktet unterstrichene Text IST ein <button> (aria-expanded, Klick/Enter öffnet die Erklär-Karte, Escape/Aussenklick schliesst) — die dotted-Auszeichnung ist die korrekte Affordanz, nicht ein Link-Schein. Rest (Platzierung neben dem Filterfeld) ist eine Positionsfrage, nicht der gemeldete Defekt. Vor Einplanung Prüfung wiederholen.

#### LM-093 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/zustaendigkeit
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zustaendigkeit` · 1440 px — die vier Rechtsweg-Karten, davon «Verwaltung» mit Badge «in Vorbereitung»
- **Beobachtung:** Die noch nicht verfügbare Karte «Verwaltung» unterscheidet sich von den drei wählbaren allein durch den Schriftschnitt des Titels (normal statt fett) und ein graues Badge «in Vorbereitung». Fläche, Rahmen und Textfarbe sind identisch. Dasselbe Muster wie im Sprachmenü, wo EN, FR und IT ebenfalls nur ein Badge tragen.
- **Erwartet:** Eine nicht wählbare Option ist als solche erkennbar, bevor man sie anklickt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md Z.196-201 (Zustandsmatrix inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(c) «Zustandsmatrix inkl. disabled/loading/selected/empty/error»
- **Dedup-Notiz:** Gleiche Zustands-Grammatik-Frage wie LM-094, andere Fläche. Beobachtung teilwiderlegt (src/components/forms/ZustaendigkeitForm.tsx:71-83): die Karte trägt disabled + opacity-55 + cursor-not-allowed + title «In Vorbereitung — eigene Engine folgt»; der Schriftschnitt ist identisch (font-medium für alle vier). Echter Kern = Dämpfung allein über opacity, wie bei LM-094.

#### LM-094 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Schritt 2, Knöpfe «← Zurück» und «Weiter →» im gesperrten Zustand
- **Beobachtung:** Der gesperrte «Weiter →» behält die volle dunkle Füllung (rgb 28,26,21) und wird nur über opacity 0.5 abgeschwächt — er sieht weiterhin wie die Hauptaktion aus. «← Zurück» daneben ist reiner Text ohne Fläche und ohne Rahmen. Dasselbe Paar findet sich im Zuständigkeits-Assistenten.
- **Erwartet:** Ein gesperrter Knopf ist als gesperrt erkennbar; die beiden Navigationsknöpfe eines Assistenten gehören sichtbar zusammen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md Z.196-201 (alle Zustände inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(c)
- **Dedup-Notiz:** Am Token bestätigt: src/index.css:673-678 — .lc-btn-primary:disabled behält background ink-900 und dämpft nur über opacity .5; .lc-btn-ghost («Zurück») hat keine Fläche/keinen Rahmen. Kein Befund-Zwilling im Bestand, aber die Zustandsmatrix ist bereits als QS-UI-Teilschritt (c) angemeldet — Fix gehört als Token-Entscheid dorthin, nicht als Einzelfall in /vorlagen/nda.

#### LM-095 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — nach der Auswahl eines Namens das Feld RICHTER:IN und dessen Umgebung ansehen
- **Beobachtung:** Der gewählte Name steht als Chip «C. Müller ×» rechts neben dem Eingabefeld, während das Eingabefeld selbst auf seinen Platzhalter «Name eingeben …» zurückspringt. Für einen Wert stehen damit zwei Bedienelemente nebeneinander, und das Feld sieht leer aus, obwohl gefiltert wird.
- **Erwartet:** Ein gesetzter Wert steht an einer Stelle, und das zugehörige Feld zeigt ihn oder tritt zurück.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** ROADMAP.md Z.485-489 R-RICHTER «Block B offen, reines UI (Autocomplete-Facette + ?richter-URL-Achse)» + FAHRPLAN-RECHTSPRECHUNG.md §12/§13
- **Dedup-Notiz:** Gleiche Fläche, anderer konkreter Defekt. Im Code bestätigt: src/components/rechtsprechung/RichterFilter.tsx:70-75 setzt nach der Wahl setQ('') → Feld fällt auf den Platzhalter zurück, während der Aktiv-Chip daneben steht (Z.161-174; Kommentar EntscheidFilter.tsx:213-217 begründet, dass der Chip bewusst IN der Komponente lebt). Achtung: Block B ist im ROADMAP noch als offen geführt, die Komponente existiert aber bereits — Status vor Bau klären.

#### LM-096 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7 · /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` und `/materialien/ESTV-KS-DBG-5A` · 1440 px — Block «WENDET AN · ERLASSE»
- **Beobachtung:** Neben jedem Normchip steht ein eigenes, etwa 16 px grosses Kopiersymbol ausserhalb des Chips. Bei zwei Chips ergibt das vier Ziele dicht nebeneinander, alle deutlich unter der sonst verwendeten Bedienhöhe, keines beschriftet; was kopiert wird, ist nicht angegeben.
- **Erwartet:** Eine Kopieraktion ist beschriftet, bedienbar gross und nicht mehrfach je Zeile wiederholt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md **§0. Kritik-Einarbeitung**, Tabellenzeile 3b (Slicer-Schlüssel `"0. Kritik-Einarbeitung"`; Grammatik-Regel 1: «⧉ nur auf KontextPanel-Chips + NormPopover, unter dem Gating kannOeffnen && !istOffen») + FAHRPLAN-UI-NAVIGATION.md §3 V3 («⧉ an jedem Chip bleibt VERWORFEN», A6 «keine Sekundär-Buttons je Zeile») + FAHRPLAN-GESETZES-UX.md §10.7 · Ausführungsvermerke der §10-Einheiten, Gruppen-Reihenfolge-Absatz (Z.1092-1094)
  *(Anker 31.7.2026 korrigiert, Endprüfungs-Fund R2-20: «§0 Kritik-Tabelle» war mehrdeutig — die Zieldatei hat ZWEI Sektionen mit «0», nämlich `## §0 · Zweck und Leitplanken` (ohne Tabelle) und `## 0. Kritik-Einarbeitung` (mit Tabelle). Der Slicer hätte den Schlüssel «0» auf die erste aufgelöst und sie ohnehin als `stets`-Sektion mitgeliefert — wer dem alten Anker folgte, landete garantiert in der Sektion ohne die Tabelle.)*
- **Dedup-Notiz:** Beobachtung in der Sache widerlegt: das Symbol ist kein Kopiersymbol, sondern der ⧉-«nebeneinander öffnen»-Knopf — src/components/kontext/KontextPanel.tsx:93-102: h-6 w-6 (=24 px, WCAG 2.5.8), border, title UND aria-label «… nebeneinander öffnen». Der verbleibende Punkt («nicht mehrfach je Zeile») steht gegen einen dokumentierten Entscheid → Entscheid-Frage, nicht Bug.

#### LM-097 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` · 1440 px — Knopf «Zur amtlichen Fassung ↗» und die Zeile darunter
- **Beobachtung:** Der Knopf ist die einzige nahezu schwarze Fläche der Seite und dominiert sie entsprechend; unmittelbar darunter steht sein Ziel noch einmal als voller Link-Text in grauer Schreibmaschinenschrift. Das genannte Ziel führt auf das Verzeichnis der Kreisschreiben, nicht auf das Dokument — was der Hinweiskasten darüber erklärt, der Knopftext aber nicht erwarten lässt.
- **Erwartet:** Der Knopf trägt das Gewicht, das seiner Bedeutung entspricht, nennt sein Ziel einmal, und seine Beschriftung trifft zu, wo er landet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** CLAUDE.md §7 Zitat-Ausnahme lit. c (im UI sichtbarer Live-Link) + Code-Entscheid src/pages/MaterialLeser.tsx:112 «Prominenter Live-Link zur amtlichen Fassung (§7c)»
- **Dedup-Notiz:** Gewicht des Knopfes ist eine §7c-Auflage — eine Abschwächung braucht die §7-Abwägung. Bestätigt: MaterialLeser.tsx:113-121 (lc-btn-primary + URL noch einmal als break-all-Text darunter). Der dritte Teil (Knopftext verspricht das Dokument, Ziel ist das Verzeichnis) hat keinen Zwilling im Bestand und ist §8-relevant; m.hinweis darüber trägt die Erklärung bereits.

#### LM-098 · 3 Mittel

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — die Schriftgrössen-Knöpfe der Kopfleiste und die der Entscheid-Leiste zugleich ansehen
- **Beobachtung:** Zwei Paare «A− A+» sind gleichzeitig sichtbar: eines links in der Kopfleiste mit der Anzeige «90 %», eines rechts in der Entscheid-Leiste ohne Anzeige. Gleiche Beschriftung, gleiche Gestalt, verschiedener Wirkungsbereich; welches worauf wirkt, ist nicht angegeben.
- **Erwartet:** Zwei Bedienelemente mit gleicher Beschriftung auf einem Bildschirm sind in ihrem Wirkungsbereich unterscheidbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** Reglement-Konflikt: DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.200-203 R17 (Reader-eigener A−/A+) gegen FAHRPLAN-GESETZES-UX.md §3.1 Z.305-307 («Bewusst NICHT als Toggle: Schriftgrösse — existiert global in der Topbar … nicht duplizieren»)
- **Dedup-Notiz:** Der Doppel-Steller ist kein Versehen, sondern die Folge zweier Reglemente. Auflösung nach CLAUDE.md §13 (speziellere Domäne gewinnt in ihrer Domäne) muss ausdrücklich getroffen werden, sonst baut die Session gegen eines der beiden.

#### LM-099 · 4 Detail

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /rechner/verzugszins
- **Breite:** 1440 px
- **Prüfen:** `/rechner/verzugszins` · 1440 px — «heute» neben dem Stichtagsfeld
- **Beobachtung:** «heute» ist fetter Text ohne Fläche oder Rahmen.
- **Erwartet:** Eine anklickbare Abkürzung sieht anklickbar aus.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3/§5(c) (Muster-Konsistenz, Chip-/Badge-Grammatik) + Token src/index.css:667-668 (.lc-btn-ghost)
- **Dedup-Notiz:** Kein Einzelfall, sondern die Ghost-Variante des Knopf-Tokens (VerzugszinsForm.tsx:185 nutzt lc-btn-ghost: 44 px Höhe, transparente Fläche, Hover brass-100). Ein Fix ist eine Token-Entscheidung und gehört zur Zustands-/Muster-Grammatik, nicht in den Verzugszins-Rechner allein.

#### LM-100 · 4 Detail

- **Bauteil:** K-09 · Schaltflächen und Aktionen
- **Route:** /gesetze?ebene=kanton&kt=BS
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=kanton&kt=BS` · 1440 px — Zeile «Vollständigkeit: Kantonale Gesetzessammlungen (lexfind) ↗ · Was ist durchsuchbar»
- **Beobachtung:** Zwei Links in derselben Zeile in zwei Stilen: «Kantonale Gesetzessammlungen (lexfind) ↗» goldfarben mit Pfeil, «Was ist durchsuchbar» dunkel ohne Auszeichnung.
- **Erwartet:** Links derselben Zeile sehen gleich aus.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/pages/Gesetze.tsx:538-545 (auch :425-426)
- **Dedup-Notiz:** Widerlegt: beide Links tragen identisch className «text-brass-700 no-underline hover:text-brass-600» — «Was ist durchsuchbar» ist NICHT dunkel/ohne Auszeichnung. Einziger Unterschied ist das ↗ am externen Link (bewusster Aussen-Marker, §8). Prüfung am aktuellen Prod-Stand wiederholen, dann erledigen.

### K-10 · Normzitate und Artikelnummern

#### LM-101 · 1 Blocker

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /rechner/mietrecht
- **Breite:** 1440 px
- **Prüfen:** `/rechner/mietrecht` · 1440 px — Abschnittstitel über der Checkbox «Familienwohnung»
- **Beobachtung:** Im Markup steht «Form (Art. 266l–266o OR)». Per text-transform uppercase wird daraus «FORM (ART. 266L–266O OR)»: aus dem Buchstabenzusatz l wird L, aus o wird O, das in der Monospace-Schrift wie eine Null aussieht. Site-weit gibt es vier Grossbuchstaben-Labels mit Normbezug; nur dieses enthält Buchstabenzusätze und ist damit sinnentstellend.
- **Erwartet:** Artikelnummern erscheinen überall exakt so, wie sie zitiert werden — Buchstabenzusätze bleiben klein (266l, 266o, 257d, 271a).
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Im Code bestätigt und Wurzel gefunden: MietrechtForm.tsx:257 <GruppenTitel>Form (Art. 266l–266o OR)</GruppenTitel> → vorlagen/ui.tsx:71-77 rendert .lc-overline → index.css:528-532 text-transform:uppercase. Fix-Vehikel existiert bereits: .lc-overline-soft (index.css:536, text-transform:none) — kein neues Token nötig. Berührt zusätzlich DESIGN-REGLEMENT A2 (Versalien nur für kurze Labels).

#### LM-102 · 1 Blocker

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /rechtsprechung · /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Karten-Ansicht, alle Normchips durchsehen und mit den Chips auf `/materialien/ESTV-KS-DBG-5A` vergleichen
- **Beobachtung:** Die Erlasskürzel in den Entscheidkarten sind durchgehend versal gesetzt und verlieren dabei die amtliche Schreibweise: SCHKG, STGB, STPO, JSTPO, STHG, BETMG, ASYLG, BEWG, BGERR, STBOG, VSTRR, VSTG, MSTG, PARLG, HREGV, GWG, PATG, VWVG — amtlich sind SchKG, StGB, StPO, JStPO, StHG, BetmG, AsylG, BewG, BGerR, StBOG, VStrR, VStG, MStG, ParlG, HRegV, GwG, PatG, VwVG. Es handelt sich nicht um eine CSS-Versalie (text-transform ist «none»), der Text selbst ist versal. Auf der Materialien-Detailseite erscheinen dieselben Kürzel korrekt gemischt («FusG», «StPO», «VStrR»).
- **Erwartet:** Erlasskürzel erscheinen überall in der amtlichen Schreibweise.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Wurzel im Code: src/lib/rechtsprechung/browse.ts:128 normLabel() reicht den Roh-Key durch (NormChip.tsx:28/31), und die normKeys entstehen versal in lib/rechtsprechung/zitat-extraktion.ts:670 (lawRaw.toUpperCase()). Amtliche Schreibweise liegt bereits als kuerzel im ERLASS_REGISTER (src/lib/normtext/register.ts) → Anzeige-Mapping ist der §5-treue Weg; ein Eingriff in die Extraktion wäre Risiko-Pfad (QS-GP).

#### LM-103 · 2 Hoch

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /rechner/verjaehrung-board
- **Breite:** 1440 px
- **Prüfen:** `/rechner/verjaehrung-board` · 1440 px — Spalte «Normen», Zeilenenden
- **Beobachtung:** Normzitate brechen am Zeilenende um: «Art. 60 Abs. 1 / OR», «Art. 60 Abs. / 1bis OR», «Art. 128a / OR». Ebenso auf `/rechner/schkg-fristen` («Art. 142 / Abs. 3 ZPO»), `/rechner/zpo-fristen` («Art. 74 Abs. / 1 lit. a BGG»), `/rechner/erbteilung` («Art. 15/16 SchlT / ZGB», «Art. 457 ff., 462, 470 / ff. ZGB»).
- **Erwartet:** Ein Normzitat steht immer zusammen auf einer Zeile.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: kein whitespace-nowrap an der Inline-Norm-Auszeichnung (src/components/NormText.tsx:38 INLINE_CLASS). Fix gehört als geteilte Utility an EINE Stelle (§5), nicht je Rechner.

#### LM-104 · 2 Hoch

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /gesetze/kanton/BS-111.100
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/kanton/BS-111.100` · 1440 px — Metazeile unter dem Titel
- **Beobachtung:** Ein kantonaler Erlass wird mit «SR 111.100» ausgewiesen. «SR» bezeichnet die Systematische Rechtssammlung des Bundes; Basel-Stadt führt eine Systematische Gesetzessammlung. Die Nummer selbst stimmt, die Bezeichnung davor nicht.
- **Erwartet:** Die Sammlungsbezeichnung entspricht der Ebene des Erlasses.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** FAHRPLAN-KANTONE.md Z.81 §c: «F28 «SR»-Label (ErlassLeserKopf.tsx:37): bei ebene='kanton' Präfix weg (SAR/LS/BLV/GS tragen ihr Kürzel selbst). Ein-Zeiler, höchste Glaubwürdigkeits-ROI»; Snapshot-Test als Tor vorgesehen
- **Dedup-Notiz:** Derselbe Defekt an derselben Stelle, seit dem Bestandseintrag ungefixt: src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx:41 rendert «SR {erlass.sr}» ohne jede Ebene-Prüfung (Zeilennummer 37→41 verschoben). Vgl. auch FAHRPLAN-KANTONE.md Z.522. Nicht doppelt einplanen — als F28 abarbeiten.

#### LM-105 · 2 Hoch

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Karten-Ansicht, Fusszeile einer beliebigen Karte
- **Beobachtung:** Das Zitat steht doppelt untereinander: «BGE 152 V 52 · Bundesgericht · 27.01.2026» und unmittelbar darunter «(152 V 52)». Dasselbe bei jeder BGE-Karte («BGE 152 II 19» / «(152 II 19)»).
- **Erwartet:** Ein Zitat steht einmal je Karte.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: src/components/rechtsprechung/EntscheidKarte.tsx:88 (hauptIdentitaet = «BGE …») und :96 ({istBge(e) && <span title="Aktenzeichen">({e.nummer})</span>}) — bei BGE-Einträgen ist nummer die BGE-Referenz, der «Aktenzeichen»-Zusatz wiederholt sie also.

#### LM-106 · 3 Mittel

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /rechtsprechung · /gesetze?ebene=international
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Normchip «LUGUE» suchen, und `/gesetze?ebene=international` mit derselben Bezeichnung vergleichen
- **Beobachtung:** Das Lugano-Übereinkommen wird als «LUGUE» geführt — der Umlaut des amtlichen Kürzels LugÜ ist zu «UE» aufgelöst und die Schreibweise versal. Dieselbe Form steht in der Adresse (`/gesetze/bund/LUGUE`).
- **Erwartet:** Das Kürzel wird in seiner amtlichen Form angezeigt, unabhängig davon, wie es intern geschlüsselt ist.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Gleiche Wurzel wie LM-102 (normLabel reicht den Key durch) — zusammen einplanen. Das amtliche Kürzel liegt bereits vor: src/lib/normtext/register.ts:314 bund('LUGUE', 'LugÜ', …). Der Key/die URL LUGUE ist unproblematisch (N0b-Normalisierung), nur die Anzeige ist zu mappen.

#### LM-107 · 4 Detail

- **Bauteil:** K-10 · Normzitate und Artikelnummern
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — hochgestellte «bis» in Normbezeichnungen vergleichen
- **Beobachtung:** Hochgestellte «bis» erscheinen in derselben Ansicht in zwei Grössen: 9 px und 12 px.
- **Erwartet:** Eine Grösse für hochgestellte Zusätze.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.10 E2 = A30 «bis/ter bei 1bis hochgestellt (Fedlex-Referenz)» — gebaut als PR #243 (f2b7726e1)
- **Dedup-Notiz:** Dieselbe Fläche, anderer Defekt: A30 stellte das Hochstellen her, die UNEINHEITLICHE Grösse blieb. Im Code sichtbar: helpers.tsx:131 nacktes <sup> (Browser-Default) gegen ArtikelBody.tsx:178 text-[0.62em] bzw. :824 <sup className="num …">. Fedlex-Seitenvergleich wie bei A30 als Beweis nutzen.

### K-11 · Zahlen-, Datums- und Zählformate

#### LM-108 · 2 Hoch

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — «CHF 15 000» im Checkbox-Label und «z. B. 12'000» im Feld «Streitwert» auf derselben Seite
- **Beobachtung:** Drei Tausendertrennzeichen im Einsatz: typografischer Apostroph 1’000 (`/`, `/rechner/teuerung`), gerader Apostroph 1'000 (`/rechner/verzugszins`, `/rechner/inkasso-strecke`, `/vorlagen/klage-ordentlich`, `/methodik`), Leerzeichen 15 000 (`/rechner/zpo-fristen`, `/methodik`) — und gar keines im Platzhalter «z. B. 500000» auf `/rechner/erbteilung`. Im Rechtsprechungs-Menü steht «1465 Verknüpfungen» ganz ohne Trenner.
- **Erwartet:** Zahlen und Beträge sind überall gleich formatiert, nach Schweizer Konvention.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/lib/konventionen.ts (SSoT Formulierungsstandard: «CHF 50'000», gerader Apostroph) + PROJEKTBESCHRIEB.md Z.177; DESIGN-REGLEMENT-NORMTEXT.md Z.137 (Tausender-Apostroph ist Anzeige, nie im Snapshot)
- **Dedup-Notiz:** Kein Befund-Zwilling, aber die Regel existiert bereits als SSoT — die Bau-Session darf keine zweite Konvention erfinden (§5). Lücke: der Konventions-Linter prüft nur die generierte Vorlagen-Textausgabe, nicht die UI. Achtung Gegenrichtung: .num/tabular-nums lässt den Apostroph gesperrt wirken (vgl. LM-119).

#### LM-109 · 2 Hoch

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — «BS» in der Zeile GEMEINWESEN wählen und danach alle drei Filterzeilen lesen
- **Beobachtung:** Die Zahlen der drei Filterzeilen folgen nach dem Filtern verschiedenen Regeln: INSTANZ und SPRACHE rechnen auf die gefilterte Menge um («Alle 3765», «Kantone 3765», «Deutsch 3765»), GEMEINWESEN behält die ungefilterten Zahlen («Alle 5093 · Bund 1298 · Kantone 3795 · BS 3765»). In derselben Ansicht bedeuten dieselben Zahlen damit Verschiedenes.
- **Erwartet:** Alle Facettenzahlen einer Ansicht beziehen sich auf dieselbe Grundmenge.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.184 R15 (Facetten mit Trefferzahl) + dokumentierter Code-Entscheid src/components/rechtsprechung/EntscheidFilter.tsx:71-78 («Cross-gefilterte Facetten-Zähler … je Achse OHNE die eigene Achse»)
- **Dedup-Notiz:** Beobachtung trifft zu, ist aber die gewollte Cross-Facetten-Konvention (jede Achse zeigt, was ein Klick brächte); gwBasis blendet ebene/kanton aus, sprBasis die Sprache. Der Erwartungssatz «alle Zahlen auf derselben Grundmenge» kippte diese Konvention → Entscheid-/Design-Frage, nicht Bugfix. Verbleibender echter Kern: die Ungleichbehandlung ist für Nutzer nicht erklärt.

#### LM-110 · 2 Hoch

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — im Feld RICHTER:IN «C. Müller» auswählen und die Zeile GEMEINWESEN lesen
- **Beobachtung:** Alle drei verbliebenen Chips zeigen dieselbe Zahl: «Alle 140 · Kantone 140 · BS 140». Die Facette unterscheidet nichts mehr, bleibt aber als Auswahl stehen.
- **Erwartet:** Eine Facette, deren Optionen alle dasselbe Ergebnis liefern, ist als solche erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** W2·7-BEZUG B7 (c), Commit 5a10f8150 / PR #406: «Ein Schalter, der in 98,5 % der Fälle nichts bewirkt … ist von einem kaputten nicht zu unterscheiden (§13 F4)» → Lösung: Zahl am Schalter, gedämpft statt disabled, Titel nennt die korpusweite Zahl
- **Dedup-Notiz:** Identische Fehlerklasse (wirkungslose Facette), andere Fläche (Rechtsprechungs-Übersicht statt Leser-Bezüge). Muster ist bereits entschieden und gebaut — übernehmen statt neu erfinden. EntscheidFilter.tsx:102 prunt heute nur Null-Optionen, nicht «alle Optionen gleich».

#### LM-111 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechner/verzugszins
- **Breite:** 1440 px
- **Prüfen:** `/rechner/verzugszins` · 1440 px — Prozentangaben im Zeitstrahl und im Ergebnissatz
- **Beobachtung:** «5%» ohne Abstand auf `/rechner/kuendigung`, `/rechner/verzugszins` und `/rechner/inkasso-strecke`, sonst «5 %».
- **Erwartet:** Eine Schreibweise für Prozentangaben.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/lib/konventionen.ts:44 — Regel «Prozent mit Leerschlag («5 %», nicht «5%»)», Muster /\d%/ im Konventions-Linter; PROJEKTBESCHRIEB.md Z.177
- **Dedup-Notiz:** Die Regel ist bereits verbindlich formuliert und maschinell geprüft — allerdings nur über die generierte Vorlagen-Textausgabe, nicht über UI-Strings. Zusammen mit LM-108 als EINE Konventions-Ausweitung einplanen; keine zweite Regel-Heimat anlegen (§5).

#### LM-112 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — Zeilen «LEITENTSCHEIDE» und «KANTONAL» am Artikel, mit und ohne aktiven Filter
- **Beobachtung:** Das Zählformat wechselt je nach Filterzustand zwischen «LEITENTSCHEIDE 2» und «LEITENTSCHEIDE 5 von 6», teils direkt untereinander mit «KANTONAL 1» und «KANTONAL 5 von 8» — ohne dass der Unterschied erklärt wird.
- **Erwartet:** Eine Zählweise mit erkennbarer Bedeutung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/pages/gesetz-leser/bezugPortion.ts:128 zahlText() + W2·7-BEZUG B7, Commit 5a10f8150 (David wörtlich 29.7.2026: «5 entscheide pro linie … mit klick lädt es die nächsten 5»; «Zähler zählt sichtbar hoch: 5 von 4'140 … alles geladen und kein Filter ⇒ schlicht 4'140»)
- **Dedup-Notiz:** Die zwei Formen sind der ausdrückliche David-Entscheid vom 29.7.2026, die Erklärung liegt im title/aria-label des Gruppenkopfs (BezuegeZeile.tsx:136-141/158-168). Eine «Vereinheitlichung» würde einen frischen David-Entscheid und die §8-Ehrlichkeit (Zahl mit Bezugsgrösse) zurückdrehen — nicht ohne David bauen.

#### LM-113 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — Chip am Ende einer Entscheid-Reihe
- **Beobachtung:** «+1weitere» — fehlendes Leerzeichen. Erscheint auf jeder Artikelgruppe.
- **Erwartet:** Zwischen Zahl und Wort steht ein Leerzeichen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt und Ursache gefunden: src/components/verzahnung/MehrKante.tsx:24 «+<span class=num>{rest}</span> weitere» in .lc-chip = inline-flex (index.css:681) → das Leerzeichen zwischen den Flex-Items entfällt. Nachbarschaft beachten: in der Bezüge-Zeile ist die «+n weitere»-Grammatik durch «weitere n» ersetzt (BezuegeZeile.tsx:207-217, Test bezuege-zeile-b4.test.tsx:162); MehrKante lebt nur noch in der Leitfall-Zeile (ArtikelLeser.tsx:102).

#### LM-114 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze?ebene=international
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=international` · 1440 px — «Stand» bei DSGVO und bei CISG vergleichen
- **Beobachtung:** Dieselbe Etikette bedeutet Verschiedenes: Bei der DSGVO steht «Stand 27.04.2016» — das ist das Erlassdatum der Verordnung. Bei CISG steht «Stand 22.05.2026», bei den Bundeserlassen bezeichnet «Stand» den Nachführungsstand der geltenden Fassung.
- **Erwartet:** «Stand» bezeichnet überall dasselbe, oder das Feld heisst anders.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: src/lib/normtext/international-extern.ts:19-30 setzt bei den EU-Verordnungen stand = Erlassdatum (DSGVO '2016-04-27'), während stand bei Fedlex-Erlassen den Nachführungsstand meint. §8-relevant (gleiche Etikette, zwei Bedeutungen). Berührt IA-6/International-Kanonik.

#### LM-115 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Schritt 2, Beschriftung der Checkbox «Nachwirkungsfrist» mit dem Feld darunter vergleichen
- **Beobachtung:** Ein Platzhalter bleibt stehen: Die Beschriftung lautet «Nachwirkungsfrist vereinbaren (Geheimhaltung gilt N Jahre über das Vorhaben hinaus)», obwohl unmittelbar darunter «Dauer nach Beendigung (Jahre)» auf 3 steht. Das «N» wird nicht durch den eingestellten Wert ersetzt.
- **Erwartet:** Eine Beschriftung, die einen Wert ankündigt, zeigt den eingestellten Wert.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: src/pages/VorlageNda.tsx:111 — Label enthält wörtlich «Geheimhaltung gilt N Jahre über das Vorhaben hinaus», der eingestellte Wert wird nicht eingesetzt.

#### LM-116 · 3 Mittel

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Zählzeile unter den Filtern ungefiltert und gefiltert vergleichen
- **Beobachtung:** Ungefiltert steht «5093 Entscheide · 1259 Leitentscheide · 1248 Volltext-Verweise», nach dem Setzen eines Filters nur noch «3765 Entscheide». Die beiden anderen Angaben verschwinden, statt ihren Wert für die gefilterte Menge zu zeigen; die Zeile wird dabei kürzer und der darunterliegende Inhalt rutscht nach oben.
- **Erwartet:** Eine Zählzeile behält ihre Bestandteile und zeigt deren Wert für die aktuelle Menge.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: src/pages/Rechtsprechung.tsx:263-265 — {leitAnzahl > 0 && …} und {volltextAnzahl > 0 && …} entfernen die Bestandteile ganz, statt 0 zu zeigen; damit auch der beschriebene Höhensprung der Zeile (§15.2/CLS).

#### LM-117 · 4 Detail

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «§ Rechtsprechung» → Felder «von» und «bis», Platzhalter mit denen der Rechner vergleichen
- **Beobachtung:** Der Platzhalter lautet hier «tt.mm.jjjj» in Kleinbuchstaben, in den Rechnern «TT.MM.JJJJ» in Grossbuchstaben.
- **Erwartet:** Eine Schreibweise für denselben Platzhalter.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt, Ursache benannt: die von/bis-Felder sind native <input type="date"> (BezugZeitWahl.tsx:250, EntscheidFilter.tsx:246/251) — «tt.mm.jjjj» ist der Browser-Platzhalter, kein App-Text; die Rechner nutzen das eigene DatumsFeld.tsx:145 mit «TT.MM.JJJJ». Fix = entweder DatumsFeld auch dort oder die Abweichung bewusst hinnehmen.

#### LM-118 · 4 Detail

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze
- **Breite:** 1440 px
- **Prüfen:** `/gesetze` · 1440 px — A–Z-Register, Buchstabe «M», Einträge mit Kürzel
- **Beobachtung:** Kürzel stehen meist in Klammern («Medizinprodukteverordnung (MepV)»), einmal aber freistehend in Monospace («… Basel-Stadt, Mietreglement MR»); derselbe Eintrag enthält «Mietreglement» zweimal.
- **Erwartet:** Eine Kürzel-Schreibweise.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: src/pages/gesetze-teile/AzRegister.tsx:33/38 hängt das Kürzel ohne Klammern an, während Bundes-Titel das Kürzel schon in Klammern IM Titel führen. Fläche stammt aus IA-3 (FAHRPLAN-GESETZES-UX.md §11.10, ✅ 25.7.2026, PR #347) — dort einlaufen lassen, nicht daneben bauen.

#### LM-119 · 4 Detail

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /gesetze
- **Breite:** 1440 px
- **Prüfen:** `/gesetze` · 1440 px — Kopfzeile des A–Z-Registers
- **Beobachtung:** Die Zahl «1'469 Erlasse nach Titel» ist in gesperrter Monospace gesetzt und liest sich dadurch als «1 ' 469».
- **Erwartet:** Der Tausenderapostroph steht ohne Sperrung direkt zwischen den Ziffern.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Bestätigt: AzRegister.tsx:94 rendert toLocaleString('de-CH') in .num (index.css:522: mono + tabular-nums) → der Apostroph bekommt eine volle Ziffernbreite. Gehört sachlich zu LM-108 (Zahlformat) und zur IA-3-Fläche.

#### LM-120 · 4 Detail

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechner/teuerung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/teuerung` · 1440 px — Beschriftung der Index-Ergebniskarte
- **Beobachtung:** «Index (Basis Dezember 2020 =100)» — Leerzeichen vor dem Gleichheitszeichen, keines danach.
- **Erwartet:** Vor und nach dem Gleichheitszeichen steht je ein Leerzeichen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/forms/TeuerungForm.tsx:164 und :169 (auch :114)
- **Dedup-Notiz:** Widerlegt: der Code enthält ' = 100)' bzw. `= 100` mit Leerzeichen VOR und NACH dem Gleichheitszeichen an allen drei Stellen. Prüfung am aktuellen Stand wiederholen, dann erledigen.

#### LM-121 · 4 Detail

- **Bauteil:** K-11 · Zahlen-, Datums- und Zählformate
- **Route:** /rechner/bgg-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/bgg-fristen` · 1440 px — Fusszeile des Rechners
- **Beobachtung:** «Zuständigkeit & Rechtsmittel (ZPO) → · Streitwert (ZPO) → · Fristenrechner →» — Pfeil und Mittelpunkt stehen beide als Trennzeichen nebeneinander.
- **Erwartet:** Ein Trennzeichen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

### K-12 · Textsatz und Umbruch

#### LM-122 · 1 Blocker

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /vorlagen/nda
- **Breite:** 390 px
- **Prüfen:** `/vorlagen/nda` · 390 px — Überschrift der Seite
- **Beobachtung:** Die H1 bricht mitten im Wort: «Geheimhaltungsvereinbarun / g (NDA)» — ein einzelnes «g» in Zeile 2. Betrifft alle langen Komposita (Scheidungsbegehren, Nichtbekanntgabe, Vorsorgeauftrag). Auf `/gesetze/bund/OR` wird derselbe Fall dagegen korrekt mit Trennstrich umbrochen («Ergän-zung») — das Verhalten existiert im Produkt bereits.
- **Erwartet:** Überschriften brechen an Wort- oder Silbengrenzen, nie mitten im Wort.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md Z.162-165 (Silbentrennungs-Fix, G1 ✅) + DESIGN-REGLEMENT-NORMTEXT.md Z.187-190 («hyphens: manual», overflow-wrap:anywhere als Overflow-Schutz)
- **Dedup-Notiz:** Gleiche Fehlerklasse (Wortbruch/Silbentrennung), aber andere Fläche: Bestand behandelt NUR den Normtext-Body, LM-122 die Vorlagen-H1. Fundort der Ursache: src/components/vorlagen/wizard.tsx:97 trägt `[overflow-wrap:anywhere] hyphens-auto` — `anywhere` bricht ohne Trennstrich, sobald `auto` nicht greift; genau das erklärt «…vereinbarun/g» hier gegenüber «Ergän-zung» im Leser. Bau-Session muss die Normtext-Regel kennen, damit nicht zwei Trennregeln entstehen (§5).

#### LM-123 · 2 Hoch

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Art. 257c, 257d, 257e und 258 nacheinander, linke Textkante beobachten
- **Beobachtung:** Die Textspalte hat über die 1686 Artikel des OR sechs verschiedene linke Kanten (691, 712, 732, 752, 772, 792 px — Spanne 101 px) und sechs Zeilenlängen (571 bis 672 px). Benachbarte Artikel springen um bis zu 40 px.
- **Erwartet:** Der Fliesstext eines Gesetzes hat eine feste linke Kante und eine gleichbleibende Zeilenlänge; die Gliederungstiefe wird anders ausgedrückt als durch Einrücken des Artikeltexts.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT-NORMTEXT.md Z.174-183 (Einzug-Skala, Deckel 5 Stufen) + FAHRPLAN-GESETZES-UX.md Z.1428 (A24 · L-1 ✅ GEBAUT 11.7., Einzug-Cap 3→5)
- **Dedup-Notiz:** Kein Zwilling, aber ein Ziel-Konflikt: die springende linke Kante IST die von David angeordnete Tiefen-Darstellung («funktioniert das mit der liniengliederung praktisch nicht» → Cap 3→5 angehoben). Der geforderte Soll-Zustand (feste Kante, Tiefe anders ausdrücken) nähme diesen Entscheid zurück und ist als Alternativen-Skizze bereits dokumentiert (FAHRPLAN-GESETZES-UX §A28-Skizze Ziff. 1/4, «kein Bau ohne separaten David-Entscheid»). Ausserdem existiert der geforderte Zustand schon als Nutzerwahl: `data-linien=aus` kollabiert den Einzug über ALLE Ebenen auf 0.

#### LM-124 · 2 Hoch

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — A+ bis 140 % klicken, dann Tab-Leiste und Suchfeld ansehen
- **Beobachtung:** Auf 140 % werden die Verfahrensphasen-Leiste («Materielle Fr…») und der Suchfeld-Platzhalter bereits bei 1440 px abgeschnitten. Positiv: kein horizontaler Overflow, und der A+-Knopf ist am Maximum korrekt ausgegraut.
- **Erwartet:** Beschriftungen bleiben auf allen Skalenstufen lesbar oder klar als scrollbar erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md Defekt D5 (A−/A+-Steller beschnitten, Such-Placeholder auf «Suc» gequetscht) — ROADMAP.md → @meta `W3·14-Responsive-Defekte` (dort ist D5 ausdrücklich als «gefixt» geführt), Wortlaut `ROADMAP-CHRONIK.md` → W3·14-Responsive-Defekte
- **Dedup-Notiz:** Gleiche Klasse (Beschriftung/Placeholder überläuft den reservierten Platz), dort @390 im Entscheid-Kopf, hier bei Skalenstufe 140 %. Zusatz-Beleg: src/components/layout/useSchriftskala.ts:25-26 begründet das Stufenband 0.9–1.4 ausdrücklich damit, dass «Tap-Ziele und Layout nicht brechen» — der Befund widerlegt diese Annahme an ihrem Maximum.

#### LM-125 · 3 Mittel

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Hinweis unter «Eingaben zurücksetzen», Zeichen pro Zeile zählen
- **Beobachtung:** Der Hinweis läuft über rund 1070 px bei 11 px Schriftgrösse — über 130 Zeichen pro Zeile.
- **Erwartet:** Fliesstext hat eine lesbare Zeilenlänge, besonders in kleinen Graden.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §B2b-Zeile der Audit-Tabelle («Lesespalte ✅ erfüllt, 38× max-w-reading») + FAHRPLAN-UI-QUALITAET.md §2 (Prüffrage «Ist die Lesespalte gewahrt?»)
- **Dedup-Notiz:** Der Bestand quittiert B2b als erfüllt; LM-125 ist ein konkretes Gegenbeispiel auf einer Vorlagen-Fläche. Kein identischer Befund im Bestand — der Hierarchie-Pass QS-UI (b) ist der natürliche Landeplatz.

#### LM-126 · 3 Mittel

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** site-weit, Beispiel `/rechner/zpo-fristen` · 1440 px — benachbarte Kleintexte vergleichen (Feld-Erläuterung gegenüber Chip-Beschriftung)
- **Beobachtung:** 19 verschiedene Schriftgrössen über 41 Seiten, darunter Paare wie 14 und 14.72 px, 12 und 12.88 px, 11 und 11.04 px, 32 und 29.44 px. Die krummen Werte entstehen aus einem 0.92-Faktor, der neben der runden Skala existiert.
- **Erwartet:** Es gibt eine Schriftgrössen-Staffel; benachbarte Texte unterscheiden sich sichtbar oder gar nicht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §B2-Zeile der Audit-Tabelle («🟡 teilweise … 22× text-[…rem] + 6× text-sm/base + 7× inline fontSize») + «Offene Punkte» Ziff. 1 (E1-Schranke nie gebaut) + FAHRPLAN-UI-QUALITAET.md §4 (Gate-Verschärfung)
- **Dedup-Notiz:** Dieselbe Wurzel (Typo-Skala wird durch Arbitrary-/Inline-Grössen gebrochen), aber andere Fundstelle: der Bestand lokalisiert sie in GesetzLeser/EntscheidBody, LM-126 misst sie auf den Rechner-Flächen. Der 0.92-Faktor ist im Bestand nirgends beschrieben — neu. Bau gehört mit der offenen E1-Schranke zusammen, sonst wächst es nach.

#### LM-127 · 3 Mittel

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Zeile «BESETZUNG» lesen
- **Beobachtung:** Vor einem Komma steht ein Leerzeichen: «Dr. A. Pfleiderer (Vorsitz), C. Müller , lic. iur. S. Bammatter-Glättli und a.o. Gerichtsschreiberin lic. iur. B. Pongracz Leimer». Zudem steht «lic. iur.» einmal vor dem Namen und die Titelangaben sind uneinheitlich verteilt; die Richternamen sind verlinkt, die Gerichtsschreiberin nicht.
- **Erwartet:** Satzzeichen stehen ohne vorangehendes Leerzeichen; Titel und Verlinkung folgen in der Zeile einer Regel.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/AH.2025.7.json (Feld rubrum.besetzung enthält «C. Müller ,») + src/pages/EntscheidLeser.tsx:81-92 (R-RICHTER-Verlinkungsregel) + FAHRPLAN-ARCHIV-RESTPUNKTE.md §7 (BS-Tranche/Rubrum)
- **Dedup-Notiz:** Zweigeteilt. (a) Das Leerzeichen vor dem Komma steht IM extrahierten Datensatz, nicht im UI — Fix wäre Extraktions-/Datenpfad (Risiko-Pfad, QS-GP), nicht Darstellung; der Renderer garantiert ausdrücklich «Wortlaut bleibt UNVERÄNDERT» (Test-Invariante). (b) Die ungleiche Verlinkung ist ein dokumentierter Entscheid: Gerichtsschreiber:innen bleiben Text, weil die Facette `?richter=` sie nicht führt — nicht als Bug bauen.

#### LM-128 · 3 Mittel

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7 · /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` und `/materialien/ESTV-KS-DBG-5A` · 1440 px — Überschriften «WENDET AN · ERLASSE 2» und «WIRD ZITIERT VON · BUNDESGERICHTSENTSCHEIDE 19»
- **Beobachtung:** Der goldene Aufzählungspunkt klebt ohne Abstand am ersten Buchstaben: «•WENDET AN · ERLASSE 2». In der versalen Schreibmaschinenschrift mit Sperrung fällt der fehlende Abstand besonders auf.
- **Erwartet:** Zwischen Marke und Text steht ein Abstand.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/index.css:549-550 — `.lc-punkt { … margin-right:.375em; }`
- **Dedup-Notiz:** Der geforderte Abstand zwischen Marke und Text existiert als Token (0.375em ≈ 4 px bei 11 px Overline). Kandidat für «Prüfung wiederholen»: wenn er optisch zu knapp wirkt, ist das eine Token-Justierung an EINER Stelle, kein fehlender Abstand.

#### LM-129 · 3 Mittel

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` · 1440 px — Liste unter «WIRD ZITIERT VON»
- **Beobachtung:** Die Regeste-Auszüge brechen mitten im Wort mit Auslassungspunkten ab («… gehören sowohl die Üb…»), und das Kopiersymbol steht anschliessend im laufenden Text statt am Zeilenrand. Ein Eintrag beginnt «BGE 151 II 884 ★ — a Art. 29 Abs. 1 BGG» — das einzelne «a» nach dem Gedankenstrich ist der Rest einer Regeste-Bezeichnung.
- **Erwartet:** Auszüge brechen an einer Wortgrenze ab; Bedienelemente stehen nicht im Fliesstext; abgeschnittene Bezeichnungen erscheinen nicht als einzelne Buchstaben.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** ROADMAP.md → W2·6-BGE, Chronik `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug («BGE-Auszug abgeschnitten — vollständig gefixt 34/34», Schutz-Tor U+2026 in `check:entscheide`) + src/lib/rechtsprechung/browse.ts:208-231 (`regesteLeitsatz`, Trunkierungs-Krümel-Schutz) + FAHRPLAN-GESETZES-UX.md §10.10 E1/A29 (Mehrfach-Regesten «Regeste a/b», gebaut)
- **Dedup-Notiz:** Gleiche Fehlerklasse (Auszug bricht mitten im Wort mit «…»), aber anderer Ort: der Bestandsfix sass in der BGE-Extraktion, LM-129 beobachtet es in der Bezüge-Liste des Material-Lesers. `regesteLeitsatz` hat einen Krümel-Schutz — er greift hier offenbar nicht. Das einzelne «a» nach dem Gedankenstrich ist ein durchgereichtes Regeste-Teil-Label aus A29; das Kopiersymbol im Fliesstext ist neu.

#### LM-130 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /vorlagen/nda
- **Breite:** 390 px
- **Prüfen:** `/vorlagen/nda` · 390 px — Karte «Standard» im Block «Detailgrad»
- **Beobachtung:** Text läuft aus der Karte heraus: «Grundausstattung» ragt über den Rand.
- **Erwartet:** Text bleibt innerhalb seiner Karte.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md Defekt D1 + Systematik-Befund S-C («Grid-Fremdkinder auf Mobil», Vorlagen-Untertyp-Raster @390)
- **Dedup-Notiz:** Gleiche Fläche und Breite (Vorlagen-Kartenraster @390), aber anderer konkreter Defekt (Text ragt aus der Karte statt Fremdkind im Raster). /vorlagen/nda war nicht im 30er-Motivsatz des Audits — deshalb kein Zwilling. S-C verlangt beim Fix ausdrücklich, «weitere Untertyp-Raster-Vorlagen mit abzuklopfen».

#### LM-131 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechner/tagerechner
- **Breite:** 1440 px
- **Prüfen:** `/rechner/tagerechner` · 1440 px — Labels oben und im unteren Rechnerteil
- **Beobachtung:** Label-Stile gemischt: oben Monospace-Versalien («DATUM (EREIGNIS)», «FRIST»), im unteren Rechnerteil Grotesk gemischtschriftlich («Startdatum (auslösendes Ereignis)», «Länge»).
- **Erwartet:** Ein Label-Stil je Ebene, seitenübergreifend gleich.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel» (Z.393-399: Mono nur Zahlen/Aktenzeichen) + src/index.css:528-536 (`lc-overline` / `lc-overline-soft`) + FAHRPLAN-UI-QUALITAET.md §3 (Muster-/Chip-/Badge-Grammatik)
- **Dedup-Notiz:** Thematischer Zwilling: die Schrift-Rollen sind reglementiert und beide Label-Stile existieren als Token — dass sie AUF EINER Seite gemischt auftreten, steht nirgends im Bestand. Prüfen, ob das Mono-Versal-Label «DATUM (EREIGNIS)» die Zwei-Stimmen-Regel (Mono nur Zahlen/Aktenzeichen) bereits verletzt; dann ist der Fix regelgetrieben statt Geschmacksfrage.

#### LM-132 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_UV.2023.8
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_UV.2023.8` · 1440 px — Zeile «BESETZUNG»
- **Beobachtung:** Leerzeichen vor dem Komma: «Dr. med. R. von Aarburg , Dr. T. Fasnacht».
- **Erwartet:** Kein Leerzeichen vor dem Komma.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/UV.2023.8.json (rubrum.besetzung: «Dr. med. R. von Aarburg , Dr. T. Fasnacht») — identische Wurzel wie LM-127
- **Dedup-Notiz:** Kein Bestands-Zwilling, aber ein Zwilling INNERHALB der neuen Liste: LM-127 und LM-132 sind derselbe Datendefekt an zwei Entscheiden der BS-Tranche. Als EIN Datenschritt führen (korpusweiter Sweep über rubrum.besetzung), nicht als zwei UI-Tickets — und als Extraktions-/Risiko-Pfad, nicht als Darstellung (§3).

#### LM-133 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /gesetze/kanton/BS-111.100 · /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/kanton/BS-111.100` und `/gesetze/bund/OR` · 1440 px — die Ingress-Zeile vergleichen
- **Beobachtung:** Uneinheitliche Schreibweise des Ingress-Datums: «Vom 23. März 2005 (Stand 3. November 2025)» beim kantonalen Erlass, «vom 30. März 1911 (Stand am 1. Januar 2026)» beim Bundeserlass — gross gegenüber klein, «Stand» gegenüber «Stand am».
- **Erwartet:** Eine Schreibweise für dieselbe Angabe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** public/normtext/struktur/bund/*.json (Zeichenkette «Stand am …» steckt im extrahierten Quelltext, u. a. VOEB, EPV, JSTG) + CLAUDE.md §7 Zitat-Ausnahme + FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (C5 Ingress/Erlassformel als M5 gebaut)
- **Dedup-Notiz:** Thematisch die Ingress-Fläche, die mit C5/M5 schon einmal gebaut wurde — aber der konkrete Unterschied «Stand» vs. «Stand am» und gross/klein ist AMTLICHER Quelltext (Fedlex vs. kantonale Sammlung), nicht LexMetrik-Formatierung. Vereinheitlichen hiesse zitierten Wortlaut umschreiben (§7). Zulässig wäre höchstens eine eigene, klar getrennte Meta-Zeile neben dem Zitat.

#### LM-134 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` · 1440 px — Stern vor den Regeste-Auszügen
- **Beobachtung:** Vor jedem Auszug steht ein «★» ohne Beschriftung und ohne Legende; ob er Leitentscheid, Gewichtung oder Herkunft bedeutet, steht nirgends auf der Seite.
- **Erwartet:** Ein Symbol, das eine Eigenschaft anzeigt, ist auf der Seite erklärt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §0/1b + §1.2 + Abnahme-Szenario 4 («Studentin am ★ bekommt an allen vier Fundorten dieselbe Erklärung, auch per Tastatur/Touch») + src/components/verzahnung/StatusBadge.tsx:34-35
- **Dedup-Notiz:** Teilweise gebaut: der ★ trägt bereits aria-label/Tooltip «Leitentscheid — amtlich publizierter BGE». Offen bleibt genau das, was LM-134 verlangt — eine SICHTBARE Erklärung/Legende auf der Seite. Muster liegt vor: die Ein-Zeilen-Legende am Katalog-Kopf aus FAHRPLAN-UI-NAVIGATION.md §1 N0d/W3.

#### LM-135 · 4 Detail

- **Bauteil:** K-12 · Textsatz und Umbruch
- **Route:** /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` · 1440 px — Metazeile unter dem Titel
- **Beobachtung:** Innerhalb einer Zeile wechselt die Schrift: «Eidgenössische Steuerverwaltung · Stand 01.02.2022 · Deutsch · Steuern, Sozialversicherung & Abgaben» — nur das Datum steht in Schreibmaschinenschrift, der Rest serifenlos.
- **Erwartet:** Eine Metazeile trägt eine Schrift, oder der Wechsel folgt einer erkennbaren Regel.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel» Z.393-399: «Serif … zitierfähiger Quelltext; Sans alles Interaktive; Mono nur Zahlen/Aktenzeichen» (grep-auditiert 12.7.2026)
- **Dedup-Notiz:** Die zweite Alternative des Erwartet-Satzes («oder der Wechsel folgt einer erkennbaren Regel») ist erfüllt: Mono ist reglementiert auf Zahlen/Aktenzeichen — genau das Datum in der Metazeile. Kandidat für «Prüfung wiederholen, dann erledigt»; ein Bau würde eine geltende Reglement-Regel umstossen.

### K-13 · Seitengerüst und Inhaltsbreite

#### LM-136 · 2 Hoch

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /einstellungen · /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/einstellungen` und `/rechner/zpo-fristen` · 1440 px — rechte Kante des Inhalts vergleichen
- **Beobachtung:** Die Inhaltsbreite springt: `/einstellungen` bricht bei 1015 px ab, Rechnerseiten bei 1384 px, der Fliesstextblock der Startseite ist schmaler als alles darüber.
- **Erwartet:** Gleichartige Seiten nutzen dieselbe Inhaltsbreite.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md Defekt D7 («Content-Container breiter als bei den Schwesterseiten … andere max-w-*-Token → Design-System-Inkonsistenz der Lesbreite», als «bereits geheilt» quittiert) + Systematik-Befund S-D
- **Dedup-Notiz:** Gleiche Klasse, anderes Seitenpaar: D7 verglich die Gesetze-Sichten (geheilt: 1120 == 1120 px), LM-136 vergleicht /einstellungen (1015) mit den Rechnern (1384). Der Shell deckelt zentral auf `max-w-content` (src/components/layout/Shell.tsx:87-93) — die Abweichung entsteht folglich in inneren Wrappern. Bau-Session muss D7 kennen, sonst wird die Heilung erneut behauptet statt gemessen.

#### LM-137 · 2 Hoch

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /materialien/ESTV-KS-DBG-5A · /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` und `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — Breite des Inhalts mit der Breite der Leisten vergleichen
- **Beobachtung:** Der Inhalt endet auf der Materialienseite bei 940 px, während Brotkrumenleiste und Kopfleiste bis zum Fensterrand laufen; rechts bleiben rund 490 px leer. Innerhalb derselben Seite sind die Trennlinien verschieden breit: die Linie unter «KONTEXT» endet bei 940, die Linie über «Zur Übersicht» läuft bis 1330. Auf der Entscheidseite dasselbe Muster in anderer Ausprägung: Titel- und Metablock von 364 bis 1330, der Entscheidtext von 558 bis 1130.
- **Erwartet:** Der Inhalt einer Seite steht in einer Spaltenbreite, und Trennlinien derselben Ebene sind gleich breit.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md §Systematik S-D + §0-Befund-Bereiche («materialleser 390/2560» ausdrücklich befundfrei) + FAHRPLAN-GESETZES-UX.md §10.10 E6/A37 (Reader-Layout-Breite, gebaut)
- **Dedup-Notiz:** Zwei Gründe für VERDACHT statt NEIN: (a) die Materialien-/Entscheid-Fläche ist im Bestands-Audit als 0-Befund quittiert — LM-137 widerspricht dem und muss vor dem Bau reproduziert werden (Vintage-Regel §0.1); (b) E6/A37 hat exakt dieses Problem für den Gesetz-Leser gelöst («gib dem Gesetz mehr Platz», `max-w-normtext` 42rem) — dasselbe Muster ist hier zu übernehmen, nicht neu zu erfinden. Der Trennlinien-Teil gehört in den Linien-Kanon (DESIGN-REGLEMENT-NORMTEXT §4b, `check:linien-kanon`).

#### LM-138 · 3 Mittel

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /rechtsprechung/bge_152_V_52
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bge_152_V_52` · 1440 px — Regeste-Kasten gegenüber den übrigen Elementen
- **Beobachtung:** Der Kasten ist 620 px breit und mittig gesetzt, während alle anderen Elemente linksbündig über 1070 px laufen. Links entsteht eine 220 px breite Leerspalte.
- **Erwartet:** Der Regeste-Kasten fügt sich in die Satzbreite der Seite ein.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md §0-Befund-Bereiche: «entscheidleser-bge (768–2560)» — von zwei unabhängigen Durchgängen als befundfrei bestätigt
- **Dedup-Notiz:** Genau diese Seite und dieser Breitenbereich sind im Bestand als geprüft und befundfrei protokolliert. Kein Zwilling, aber ein Widerspruch: zuerst reproduzieren (Regeste-Kasten im RegesteBlock/EntscheidLeser trägt selbst kein max-w/mx-auto — die 620 px kommen aus einem Wrapper), sonst wird ein Screenshot-Artefakt gebaut.

#### LM-139 · 3 Mittel

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /
- **Breite:** 1440 px
- **Prüfen:** `/` · 1440 px — Footer, Zeilenabstand der Spalten «Navigation» und «Hinweise» vergleichen
- **Beobachtung:** Spalte «Navigation» hat rund 52 px Zeilenabstand gegenüber der kompakten Spalte «Hinweise»; unter Spalte 1 bleibt eine grosse leere Fläche.
- **Erwartet:** Die Footer-Spalten wirken als ein Block.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md Defekt D2 + §Abarbeitung («D2 ✅ gefixt: Shell-Kopf/Fuss-Tap-Ziele auf 44 px») + src/components/layout/Footer.tsx:44-47 (`min-h-11` je Link) + FAHRPLAN-UI-NAVIGATION.md §4 R6 (WCAG 2.5.8)
- **Dedup-Notiz:** Kein Zwilling, aber eine Kollision, die die Bau-Session kennen MUSS: der grosse Zeilenabstand der Navigations-Spalte ist das direkte Ergebnis des D2-Fixes (44-px-Tap-Ziele). Zusammendrücken nähme ihn zurück. Zulässiger Weg ist Ausgleich der Spaltenhöhen ohne Verkleinerung der Trefferflächen.

#### LM-140 · 3 Mittel

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /methodik
- **Breite:** 1440 px
- **Prüfen:** `/methodik` · 1440 px — Seitenhöhe und Anzahl Karten
- **Beobachtung:** 78 gleich aufgebaute Parameterkarten ohne Gruppierung oder Aufklappen — Seitenhöhe rund 14'600 px. Die restlichen Methodik-Inhalte sind praktisch unerreichbar.
- **Erwartet:** Eine lange Parameterliste ist überblickbar, ohne dass der Rest der Seite unerreichbar wird.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md Defekt D3 («methodik | 2560 | Inhalts-/Pflege-Listen bleiben eine schmale Einzelspalte → Seite wird ~10 470 px hoch, viel toter Rechtsraum») + §Abarbeitung D3 ✅ gefixt (10 470 → 5 977 px) + Systematik S-D
- **Dedup-Notiz:** Derselbe Defekt an derselben Stelle, bereits einmal gebaut: src/pages/Methodik.tsx:62-68 dokumentiert den Fix im Code, VerfallUebersicht.tsx:84 rendert `sm:grid-cols-2 xl:grid-cols-3`. Die Höhe ist seither wieder gewachsen (Liste 69 → 78 Karten). Offen bleibt der Teil, den D3 NICHT adressiert hat: Gruppierung/Aufklappen. Also nicht neu einplanen, sondern D3 nachmessen und um den Gruppierungs-Rest ergänzen.

#### LM-141 · 3 Mittel

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /gesetze?ebene=kanton&kt=BS
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=kanton&kt=BS` · 1440 px — die Erlassliste durchlesen
- **Beobachtung:** Die 859 Erlasse sind in zwei nebeneinanderliegenden Spalten gesetzt; beim Lesen springt man zwischen den Spalten statt einer Liste zu folgen. Die Systematiknummer erscheint zweimal je Zeile in zwei Schreibweisen: links «111.100», im Titel «Verfassung des Kantons Basel-Stadt (11100)».
- **Erwartet:** Eine Liste liest sich von oben nach unten; die Nummer steht einmal und in einer Schreibweise.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11 IA-3 «A–Z-/Kürzel-Register ✅ GEBAUT + GEMERGT 25.7.2026» (Z.1727-1740, 1814) + §11 Kernidee (BS 859) + G5/A14/A15 + public/normtext/register.json (Feld `titel` = «Verfassung des Kantons Basel-Stadt (111.100)», Nummer zusätzlich in `sr`)
- **Dedup-Notiz:** Der Einstiegs-Schmerz «859 Erlasse durchsuchen» ist mit IA-3 adressiert (A–Z-Register als Browse-Zwilling); die konkrete Leserichtung des zweispaltigen Rasters (src/components/normtext/GesetzeGliederung.tsx:85/123 `sm:grid-cols-2`) steht nirgends im Bestand — neu. Die doppelte Systematiknummer ist eine Datenredundanz (Nummer steckt zusätzlich im `titel`) und damit §5-Fläche, nicht Layout.

#### LM-142 · 4 Detail

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /rechner/schkg-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/schkg-fristen` · 1440 px — Kalenderblock «Fristenlauf» in seiner Karte
- **Beobachtung:** Der Kalender nutzt nur rund zwei Drittel der Kartenbreite; rechts bleiben etwa 450 px leer. Ebenso `/rechner/kuendigung` und `/rechner/mietrecht`.
- **Erwartet:** Der Kalender füllt seine Karte oder die Karte richtet sich nach ihm.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-143 · 4 Detail

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /gesetze?ebene=bund
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=bund` · 1440 px — Erklärtext zur Sortierung und den zugehörigen Umschalter
- **Beobachtung:** Der Erklärtext beginnt ganz links bei x ≈ 346, der zugehörige Umschalter steht rechtsbündig bei x ≈ 1020.
- **Erwartet:** Erklärung und Umschalter stehen sichtbar beieinander.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-144 · 4 Detail

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /rechner/zpo-fristen
- **Breite:** 2560 px
- **Prüfen:** `/rechner/zpo-fristen` · 2560 px — Anteil der genutzten Fläche
- **Beobachtung:** Die Inhaltsbreite bleibt bei rund 1070 px; auf 2560 px bleiben damit rund 58 % der Fläche leer, während Kopfleiste und Breadcrumb über die volle Breite laufen.
- **Erwartet:** Entweder die Chrome auf Inhaltsbreite begrenzen oder die Raster auf breiten Schirmen mitwachsen lassen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md §Gesamtbefund («Ultrawide @2560 nutzt durchgängig eine zentrierte max-width-Spalte — bewusste Lesbreite §13.2») + §Systematik S-D («~24–41 % toter Rechtsrand @2560 ist über ~20 Seiten bewusst und konsistent — NICHT 20 Einzelbugs»)
- **Dedup-Notiz:** Identischer Befund, identische Breite, bereits verdiktet: der leere Rand @2560 ist eine bewusste Entscheidung, keine Regression — nur die drei benannten Ausnahmen (D3 methodik, D7 Container-Inkonsistenz, D8 Ingress) galten als Defekt und sind abgearbeitet. Neu an LM-144 ist allein die Variante «Chrome auf Inhaltsbreite begrenzen» statt «Raster mitwachsen lassen»; das wäre eine Design-Entscheidung für David, kein Bugfix.

#### LM-145 · 4 Detail

- **Bauteil:** K-13 · Seitengerüst und Inhaltsbreite
- **Route:** /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/materialien/ESTV-KS-DBG-5A` · 1440 px — Fusszeile, Spalten «NAVIGATION» und «HINWEISE» nebeneinander
- **Beobachtung:** Die Navigationsspalte setzt fünf Links in 14 px mit rund 47 px Zeilenabstand, die Hinweisspalte daneben besteht aus eng gesetzten Absätzen. Die beiden Spalten enden dadurch auf sehr verschiedener Höhe.
- **Erwartet:** Nebeneinanderstehende Fussspalten sind im Zeilenmass aufeinander abgestimmt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** abnahme/responsive-audit/BERICHT.md D2 (✅ gefixt: Fuss-Tap-Ziele 44 px) + src/components/layout/Footer.tsx:44-47 (`min-h-11`) — sowie LM-139 derselben Liste
- **Dedup-Notiz:** Doppelt zu LM-139: identischer Footer, identischer Defekt, nur andere Route — als EIN Posten führen. Dieselbe Kollision wie dort: das weite Zeilenmass ist das Ergebnis des 44-px-Tap-Ziel-Fixes und darf nicht durch Zusammendrücken zurückgenommen werden.

### K-14 · Leseansicht Gesetz

#### LM-146 · 1 Blocker

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — in der Gliederung einen Eintrag anklicken, der weit weg von der aktuellen Leseposition liegt, und prüfen, ob der Text springt
- **Beobachtung:** Die Gliederung ist nicht navigierbar. Sie enthält 2299 Einträge, alle als <button> ohne href — kein einziger ist ein Link. Dasselbe gilt für kantonale Erlasse: die Gliederung der Verfassung des Kantons Basel-Stadt besteht aus 28 Knöpfen und einem Link. Ein Klick klappt einen Ast auf oder zu; bei Blatteinträgen passiert gar nichts. Gemessen: sichtbarer Artikel vor dem Klick «art-364», nach dem Klick auf «1. Im Allgemeinen» (Art. 4 f.) unverändert «art-364»; die Gliederung wurde stattdessen von 17'589 auf 18'282 px Inhaltshöhe aufgeklappt. Auch «Siebenter Titel: Die Schenkung» und «Elfter Titel: Der Werkvertrag» bewirken weder Sprung noch URL-Änderung.
- **Erwartet:** Ein Klick auf einen Gliederungseintrag führt an die entsprechende Stelle im Gesetzestext.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/gesetz-leser/inhalt.tsx:465-497 (`springeZuSektion`: Pfad öffnen → flushSync → `scrollIntoView({block:'start'})`) + src/pages/gesetz-leser/parts/SektionBaumTOC.tsx:44 (`onClick={() => onSprung(s.id)}`) + FAHRPLAN-GESETZES-UX.md §10.10 E7/A33 (Gliederungs-Scroll-Spy ✅ 17.7.2026) + §15 K4/K5 (Gliederungs-Toggle, «Scroll-Ziel nie verdeckt», intermittierend)
- **Dedup-Notiz:** Kern-Behauptung «Klick führt nicht an die Stelle» ist am Code NICHT gedeckt: ein Sprung-Handler mit scrollIntoView existiert und ist e2e-belegt (leser-gliederung-a33.e2e.ts). «<button> ohne href» ist bewusste Bauform, kein Defekt. Plausible Restlücke: `sekRefs.current.get(id)` liefert nichts, wenn die Zielsektion (noch) nicht gerendert ist — das wäre der reproduzierbare Bug. K5 beschreibt bereits einen benachbarten, ausdrücklich als intermittierend markierten Sprung-Defekt. Vor jedem Bau reproduzieren (§0.1 Vintage-Regel), Blocker-Prio erst danach.

#### LM-147 · 1 Blocker

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — vom Suchfeld aus wiederholt Tab drücken und zählen, bis der Gesetzestext erreicht ist
- **Beobachtung:** Allein die Gliederung enthält 2887 Tabstopps, die ganze Seite 23'537. Es gibt innerhalb der Leseansicht keinen Weg, die Gliederung per Tastatur zu überspringen. Der Container ist kein <nav>, hat keine role und kein aria-label; die 581 Klappknöpfe tragen kein aria-expanded, kein aria-label und kein title; der aktive Eintrag hat kein aria-current.
- **Erwartet:** Die Gliederung ist per Tastatur überspringbar, als Navigationsbereich ausgezeichnet, und ihre Klappknöpfe geben ihren Zustand bekannt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/gesetz-leser/parts/SektionBaumTOC.tsx:42 (Klappknopf trägt `aria-label` «Einklappen»/«Aufklappen») und :44 (`aria-current` am aktiven Eintrag) + src/pages/gesetz-leser/inhalt-volltext.tsx:310-326 (`<aside>` ohne Label/Rolle) + FAHRPLAN-SEO-A11Y-GOVERNANCE.md §W2.3 (Tastatur-e2e erweitern) + FAHRPLAN-UI-NAVIGATION.md §7 E4 (a11y-Prüfauftrag Skip-Link/Fokus/aria-live)
- **Dedup-Notiz:** Zwei der vier Einzelbehauptungen sind am Code widerlegt (aria-label an den Klappknöpfen, aria-current am aktiven Eintrag) — Blocker-Prio entsprechend prüfen. Bestätigt bleiben: kein `aria-expanded`, der Container ist ein `<aside>` ohne Rolle/Label, keine Überspringbarkeit. Diese Reste gehören in den bestehenden a11y-Strang (W2.3/E4), nicht in einen neuen.

#### LM-148 · 2 Hoch

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/ZPO
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/ZPO` · 1440 px — Gliederung links und Dokumentkopf rechts vergleichen, dann scrollen
- **Beobachtung:** Links das Inhaltsverzeichnis, rechts unmittelbar daneben dieselbe Struktur nochmals als Dokumentkopf («1. TEIL Allgemeine Bestimmungen Art. 1–196»), in anderer Typografie. Die linke Gliederung scrollt bei rund 200'000 px Seitenhöhe sofort weg — sie ist nicht sticky.
- **Erwartet:** Die Navigation innerhalb eines Gesetzes bleibt beim Lesen erreichbar und existiert einmal.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** src/pages/gesetz-leser/inhalt-volltext.tsx:314-326 (`<aside … className="mb-0 sticky flex-col"` mit `top: calc(4rem + 2.25rem)` und `maxHeight: calc(100vh - …)`) + FAHRPLAN-GESETZES-UX.md §15 K1/K4 (Gliederungs-Default kompakter, Gliederungs-Toggle in der Kopfzeile) + §10.10 E7/A33
- **Dedup-Notiz:** Der Sticky-Teil des Befunds ist am Code widerlegt: die TOC-Spalte IST sticky — allerdings nur bei `istXl` (Viewport bzw. Pane-Container breit genug), `sektionen.length > 0` und geöffnetem TOC. Reproduzieren, unter welcher dieser drei Bedingungen sie bei 1440 px wegfällt. Der zweite Teil (Gliederung links UND dieselbe Struktur nochmals als Dokumentkopf) ist neu; er berührt K1 (Default-Aufklappzustand) und die §15-Treue (der Dokumentkopf ist amtliche Substanz, keine Navigation — nicht einfach löschen).

#### LM-149 · 2 Hoch

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/ZPO
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/ZPO` · 1440 px — Übergang vom Ingress zur Gliederung, die beiden Trennlinien
- **Beobachtung:** Zwei Trennlinien: eine über der linken Spalte, eine weiter rechts auf anderer Höhe beginnend. Sie überschneiden sich horizontal und stehen vertikal versetzt.
- **Erwartet:** Trennlinien liegen auf einer Höhe und überschneiden sich nicht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** DESIGN-REGLEMENT-NORMTEXT.md §4b (EINE Linien-Sprache, 3 Rollen-Tokens `--guide-gliederung`/`--rule-artikel`/`--rule-struktur`) + Tor `check:linien-kanon` + FAHRPLAN-GESETZES-UX.md Z.491 (G1 ✅ Linien-Sprache)
- **Dedup-Notiz:** Thematisch genau die Linien-Fläche, die G1 vereinheitlicht und die `check:linien-kanon` bewacht; der konkrete Defekt (zwei Trennlinien am Ingress→Gliederungs-Übergang überschneiden sich horizontal und stehen vertikal versetzt) steht dort nicht. Fix muss durch das Linien-Kanon-Tor — kein Ad-hoc-Strich. Sachverwandt mit dem Trennlinien-Teil von LM-137.

#### LM-150 · 2 Hoch

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — «Kündigung» ins Feld «Im Gesetz suchen» eingeben
- **Beobachtung:** Die Suche filtert das Dokument auf 69 Artikel, hebt aber kein einziges Vorkommen im Artikeltext hervor. Die Zeile «69 Treffer für «Kündigung»» steht rund 600 px unterhalb des Suchfelds in der Inhaltsspalte. Es gibt keine Möglichkeit, von Treffer zu Treffer zu springen.
- **Erwartet:** Fundstellen sind im Text erkennbar, der Trefferzähler steht beim Suchfeld, und es gibt einen Weg von Treffer zu Treffer.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §4 R1 («In-Gesetz-Suche: Treffer-Highlight … `<mark>`-Hervorhebung in den gefilterten Artikeln + Trefferzahl je Artikel + Vor/Zurück-Sprungtasten», offen) + FAHRPLAN-GESETZES-UX.md §10.10 E5/A35 (Suche in die Kopfzeile + Suchtreffer im Text markieren)
- **Dedup-Notiz:** Derselbe konkrete Defekt an derselben Stelle — R1 deckt alle drei Forderungen wörtlich ab und ist offen; nicht als neuer Posten einplanen, sondern in R1 einlaufen lassen. WICHTIG für die Bau-Session: der Highlight-Teil IST gebaut (A35, src/pages/gesetz-leser/inhalt.tsx:606-622 + suchHighlight.ts) — allerdings über die CSS Custom Highlight API, also OHNE `<mark>` im DOM. Eine DOM-basierte Messung sieht deshalb «kein Highlight», obwohl visuell markiert wird; der Befund ist insoweit vermutlich ein Mess-Artefakt und R1s `<mark>`-Formulierung überholt. Echt offen bleiben: Position des Trefferzählers (~600 px unter dem Feld) und die Treffer-zu-Treffer-Navigation.

#### LM-151 · 2 Hoch

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — «Ansicht» → Änderungshistorie «Chronologie», dann die Fussnotenzeilen unter dem Artikel
- **Beobachtung:** Die Bestandteile der Fussnotenzeile laufen ohne Trennzeichen ineinander: Fussnotennummer, vorangestelltes Datum und Fussnotentext ergeben «1061. Oktober 2025Eingefügt durch Ziff. I des BG vom 29. Sept. 2023 …». Dieselbe Zeile enthält zwei Datumsformate («1. Oktober 2025» und «1. Okt. 2025») und nennt das Datum doppelt, weil der Satz ohnehin mit «in Kraft seit 1. Okt. 2025» endet.
- **Erwartet:** Nummer, Datum und Text sind voneinander getrennt; ein Datumsformat; keine doppelte Datumsangabe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-152 · 2 Hoch

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Gliederungskasten in beide Richtungen scrollen
- **Beobachtung:** Der Kasten ist 256 × 582 px gross, der Inhalt 17'589 px hoch — rund 30 Kastenhöhen. Zusätzlich beträgt die Inhaltsbreite 374 px bei 245 px Sichtbreite, also 129 px horizontaler Überhang. Die Gliederung muss dadurch in zwei Richtungen gescrollt werden.
- **Erwartet:** Die Gliederung ist in einer Richtung scrollbar und in ihrer Tiefe beherrschbar — etwa indem sie nicht vollständig aufgeklappt startet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §15 K1 (W2·5h-GESETZ-UI, Z. 2041-2046) + §17 Intake 24.7.
- **Dedup-Notiz:** K1 «Gliederungs-Default kompakter, nicht vollständig aufgeklappt starten» deckt exakt die im Erwartet genannte Abhilfe für die Tiefe (17'589 px). NICHT gedeckt: der horizontale Überhang (374 px Inhalt bei 245 px Sicht). Bau-Session muss K1 kennen, sonst wird zweimal gebaut.

#### LM-153 · 3 Mittel

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR#art-269_d
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-269_d` · 1440 px — Fussnotenmarke im Text und den zugehörigen Eintrag darunter
- **Beobachtung:** Die Marke im Text ist hochgestellt und goldfarben; der Eintrag in der Fussnotenliste steht auf der Grundlinie, in normaler Grösse und grau.
- **Erwartet:** Marke und Eintrag tragen dieselbe Auszeichnung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.10 E2/A30+A31 (Z. 1836-1840, gebaut)
- **Dedup-Notiz:** E2 hat Fussnoten-Marker/Superscript im Fliesstext gegen die Fedlex-Referenz gerichtet — andere Stelle: dort Marker↔Fliesstext, hier Marke↔Apparat-Eintrag. Thematisch dieselbe Typografie-Familie, Defekt neu.

#### LM-154 · 3 Mittel

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Verweise «BBl 1905 II 1», «AS 1971 1465» im Fussnotenapparat anklicken
- **Beobachtung:** Verweise auf fedlex sind goldfarben, aber ohne Unterstreichung und ohne Hinweis darauf, dass sie einen neuen Reiter öffnen. Normverweise im Fliesstext und in den Rechnern sind dagegen gepunktet unterstrichen.
- **Erwartet:** Links sind als Links erkennbar, und ein Wechsel auf eine externe Seite ist vorher sichtbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §3 V4 (NormChip-href, «amtlich ↗» als sichtbarer Zweitlink) + FAHRPLAN-UI-QUALITAET.md §3 (Chip-/Badge-Grammatik, Muster-Konsistenz)
- **Dedup-Notiz:** V4 behandelt Norm-Chips (intern/extern), nicht die Fedlex-Verweise im Fussnotenapparat (BBl/AS). Link-Affordanz + Extern-Kennzeichnung ist bislang nirgends als Befund geführt.

#### LM-155 · 3 Mittel

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — die Ebenen «Neunter Titel» / «Erster Abschnitt» / «B. Wirkungen» / «I. Pflichten» / «1. Im Allgemeinen» / «a. Feststellung» untereinander vergleichen
- **Beobachtung:** Acht Einrückungsebenen liegen bei 330, 340, 346, 349, 356, 365, 375 und 385 px — also 6 bis 10 px Versatz je Ebene, ohne Linienführung oder Farbabstufung. Die Hierarchie ist praktisch nicht ablesbar.
- **Erwartet:** Die Gliederungstiefe ist auf einen Blick erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.9 Entscheid A28 (Z. 1489-1504, gebaut 12.7.) + U-LINIEN/A8 (Z. 890) + check:linien-kanon
- **Dedup-Notiz:** KOLLISION mit David-Entscheid: A28 hat den aufgedrängten Gliederungs-Guide korpusweit AUS gesetzt («funktioniert überhaupt nicht»), Justage nur auf neues positives David-Signal. Der Befund verlangt genau wieder sichtbare Tiefen-Führung — nicht autonom bauen, David vorlegen.

#### LM-156 · 3 Mittel

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — den Pfad zur aktuellen Leseposition in der Gliederung suchen
- **Beobachtung:** Der aktive Pfad ist allein durch Schriftschnitt markiert: 21 von 2299 Einträgen stehen auf 500 statt 400. Keine Fläche, keine Farbe, kein Marker. Zusätzlich verwendet die Gliederung vier Schriftgrössen (11, 12, 14 und 16 px).
- **Erwartet:** Die aktuelle Leseposition ist in der Gliederung deutlich markiert.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §4 R2 («Sie sind hier» + markiert, mobiles Sheet) + FAHRPLAN-GESETZES-UX.md §10.10 E7/A33 (gebaut 17.7.)
- **Dedup-Notiz:** R2 fordert die Positions-Markierung nur für die MOBILE Gliederung; A33 hat das Scroll-Spy-VERHALTEN gefixt (Nudge/Guard/Entprellung), nicht die Auszeichnung der aktiven Zeile. Desktop-Markierung + Schriftgrössen-Wildwuchs sind neu.

#### LM-157 · 3 Mittel

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR#art-367
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-367` · 1440 px — die Seite mit dem Anker frisch aufrufen, dann Gliederung und Breadcrumb ansehen
- **Beobachtung:** Beim frischen Aufruf mit Anker springt der Text korrekt zu Art. 367, aber die Gliederung zeigt weiterhin den Anfang des Gesetzes («Erste Abteilung … Erster Titel …») und die Breadcrumb nennt keinen Artikel («Gesetze › Bund › OR»). Beide laufen erst mit, sobald von Hand gescrollt wird.
- **Erwartet:** Gliederung und Breadcrumb zeigen auch beim Aufruf über einen Anker die tatsächliche Position.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §15 K5 (Scroll-Ziel/#art--Deep-Links) + FAHRPLAN-UI-NAVIGATION.md §1 N0c (scroll-margin) + §4 R7 (Deep-Link-Skeleton)
- **Dedup-Notiz:** K5/N0c/R7 betreffen die SICHTBARKEIT des Sprungziels beim Anker-Load; hier ist der Defekt, dass Scroll-Spy und Breadcrumb beim Erstaufruf gar nicht initialisiert werden. Gleiche Mechanik-Fläche (Anker-Pfad), anderer Defekt.

#### LM-158 · 4 Detail

- **Bauteil:** K-14 · Leseansicht Gesetz
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px und 531 px — Standangabe in der Metazeile und in der Werkzeugleiste
- **Beobachtung:** Die Standangabe erscheint zweimal gleichzeitig. Auf Mobil belegt die Angabe in der Werkzeugleiste rund 130 px und drängt die sechs Bedienelemente daneben zusammen.
- **Erwartet:** Die Standangabe steht an einer Stelle.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §15 K6 (Kopfzeile gesamthaft: Elemente/Ordnung/Responsive-Verdichtung) + §10.8 A22-K1/A26 (Meta-Zeile «Stand», gebaut)
- **Dedup-Notiz:** K6 ist der Dach-Auftrag für genau diese Leiste inkl. Verdichtung auf schmalen Viewports; die konkrete Doppelung Metazeile ↔ Werkzeugleiste ist dort nicht benannt.

### K-15 · Fehler-, Leer- und Ladezustände

#### LM-159 · 1 Blocker

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze/bund/EMRK
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/EMRK` · 1440 px · hell — Seite laden und den Bereich unter dem Titel ansehen
- **Beobachtung:** Das eingebettete PDF erscheint als grosse schwarze Fläche (gemessen 965 × 598 px) ohne Ladehinweis, ohne Rahmenbeschriftung und ohne Ersatzdarstellung, falls die Einbettung nicht greift. Auf einer sonst durchgehend hellen Seite ist das der auffälligste Block.
- **Erwartet:** Ein eingebettetes Dokument zeigt seinen Ladezustand und hat eine Ersatzdarstellung.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §2.2 ⑦ PDF_EMBED (Z. 259-262) / G3a-Ausführungsvermerk; Code src/pages/gesetz-leser/inhalt-ansichten.tsx:66
- **Dedup-Notiz:** Der PDF-Rahmen (border-rule-struktur) und ein Ersatz-/Fallback-Link («Amtliches PDF in neuem Tab öffnen ↗», selbe Datei, nav am Fuss) sind bereits gebaut; offen bleibt allein der Ladezustand und die sichtbare Rahmenbeschriftung. Umfang schrumpft entsprechend.

#### LM-160 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/zpo-fristen · -5 · 0
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Fristlänge auf `-5`, dann `0`, dann `1.5` setzen
- **Beobachtung:** Die Meldung «EINGABEFEHLER · Fristlänge muss eine ganze Zahl > 0 sein» erscheint korrekt, aber das fehlerhafte Feld bleibt unmarkiert, die Meldung steht rund 400 px weiter unten, und der gesamte Ergebnisblock samt Kalender verschwindet — die Seite springt um mehrere hundert Pixel. Die Meldung ist in kleiner Monospace-Versalschrift gesetzt und wirkt schwächer als die Hinweisboxen daneben.
- **Erwartet:** Ein Eingabefehler ist am Feld selbst erkennbar, die Meldung steht in dessen Nähe, und die Seite springt nicht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix inkl. error) + Repo-Präzedenz src/components/forms/AllgemeineFristForm.tsx:257/347
- **Dedup-Notiz:** Fehlerzustands-Grammatik ist als QS-UI-Aufgabe geführt, der konkrete Befund nicht. Code-Stichprobe: AllgemeineFristForm setzt aria-invalid bereits genau für diese Bedingung, ZpoFristenForm.tsx:222 nicht — Muster existiert, ist nur nicht ausgerollt.

#### LM-161 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/prozesskosten · /rechner/streitwert
- **Breite:** 1440 px
- **Prüfen:** `/rechner/prozesskosten` und `/rechner/streitwert` · 1440 px — Seiten im Ausgangszustand vergleichen
- **Beobachtung:** `/rechner/prozesskosten`, `/rechner/notariat-grundbuch`, `/rechner/gerichtszitat` und `/rechner/betreibungskosten` enden im Ausgangszustand direkt nach der Formularkarte im Footer — kein Ergebnisblock, kein Platzhalter, kein Hinweis. `/rechner/streitwert` zeigt an derselben Stelle einen gestrichelten «ERGEBNIS»-Platzhalter.
- **Erwartet:** Alle Rechner verhalten sich im Ausgangszustand gleich und sagen, was einzugeben ist.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1 N0d/W1 (Streitwert-Platzhalter, ✅ gebaut 11.7.2026) + FAHRPLAN-UI-QUALITAET.md §3
- **Dedup-Notiz:** Der im Befund als Vorbild genannte Streitwert-Platzhalter IST das Ergebnis von N0d/W1; der neue Befund verlangt das Ausrollen auf prozesskosten/notariat-grundbuch/gerichtszitat/betreibungskosten. Referenz-Umsetzung liegt vor, kein Neubau.

#### LM-162 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze
- **Breite:** 1440 px
- **Prüfen:** `/gesetze` · 1440 px — A–Z-Register im Ausgangszustand, dann Buchstabe «M» wählen
- **Beobachtung:** Der Ergebniskasten hat eine feste Höhe von 384 px. Im Ausgangszustand ist er vollständig leer, bis auf den Hinweis «Noch nichts gewählt — die Liste erscheint hier.», der genau auf der oberen Rahmenlinie sitzt und von ihr angeschnitten wird. Auch mit Treffern bleibt er starr: bei 8 Titeln unter «M» sind 246 px gefüllt und 138 px leer, gefolgt von rund 120 px Abstand bis zum Footer.
- **Erwartet:** Der Kasten wächst mit seinem Inhalt; der Hinweis im Leerzustand steht innerhalb des Rahmens.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11 IA-3 (A–Z-Register) + Code src/pages/gesetze-teile/AzRegister.tsx:176-183
- **Dedup-Notiz:** Die feste Höhe ist ein dokumentierter CLS-Entscheid («Skalen-Wert h-96, bleibt in JEDEM Zustand gleich», dazu Remount-Fix aus CI-Befund PR #347). Die Erwartung «Kasten wächst mit dem Inhalt» kippt diesen Entscheid — Begründung/Abwägung muss in die Bau-Session, nicht still überschrieben werden.

#### LM-163 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze?ebene=bund · /gesetze/bund/ZPO · /rechtsprechung/bge_152_V_52
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=bund`, `/gesetze/bund/ZPO`, `/rechtsprechung/bge_152_V_52` · 1440 px · hell und dunkel — zügig scrollen und auf leere Bilder achten
- **Beobachtung:** Beim Scrollen erscheint ein vollständig leeres Fenster, das erst nach kurzer Zeit nachzeichnet — fünfmal beobachtet, auf vier verschiedenen Seiten und in beiden Farbmodi, auch auf der reinen Listenseite. In zwei Fällen verschwand dabei die klebende Kopfleiste samt Seitenleiste; in einem Fall waren Kopfleiste und Seitenleiste um rund 270 px nach unten versetzt. Im Dunkelmodus erscheint der leere Bereich als schwarzer Balken.
- **Erwartet:** Beim Scrollen bleibt immer Inhalt sichtbar, und die klebenden Leisten verschwinden nie.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.9 U-POSITION/A2 (content-visibility + contain-intrinsic-size, Z. 894) + §10.10 E7/A33 («H3/H4 content-visibility-Flip-Flop: 0 Flackermuster», widerlegt)
- **Dedup-Notiz:** A2 adressiert die Scrollbalken-Proportionalität derselben content-visibility-Fläche; A33 hat Flackern NUR für den TOC untersucht und verneint. Der Befund (leeres Fenster + verschwindende Sticky-Leisten, auch auf reinen Listenseiten) geht darüber hinaus — als Bug reproduzieren, nicht als Feature planen.

#### LM-164 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Art. 366 bis 372 durchscrollen und die Rechtsprechungszeilen vergleichen
- **Beobachtung:** Artikel ohne erfasste Rechtsprechung zeigen gar nichts — bei Art. 368, 369 und 371 OR fehlt die Zeile ersatzlos, während Art. 366 «LEITENTSCHEIDE 1», Art. 367 und 370 «KANTONAL 1» und Art. 372 «LEITENTSCHEIDE 1» tragen. «Nicht erfasst» ist dadurch nicht von «nicht vorhanden» zu unterscheiden, obwohl die Seite «Kuratierte Auswahl … verzahnt mit der angewandten Norm» verspricht und 5093 Entscheide nennt. Der ausgelieferte Datensatz bestätigt, dass es sich um Lücken und nicht um eine Filterung handelt: Art. 368, 369 und 371 OR haben schlicht keine Einträge; im ganzen OR tragen 469 von 1686 Artikeln Verweise.
- **Erwartet:** Ein Artikel ohne Verweise sagt, dass keine erfasst sind — statt die Zeile wegzulassen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §1.3/§0 (Badges nur für Abweichungen, Default nackt; Zähler «n erfasste …») + FAHRPLAN-UI-NAVIGATION.md §0 Ziff. 4 (§8-Ehrlichkeit als Bau-Kriterium)
- **Dedup-Notiz:** Die Doktrin «Default bleibt nackt, keine grauen Nicht-Link-Reihen» ist ein dokumentierter VZUI-Entscheid und erklärt die fehlende Zeile; der Befund verlangt das Gegenteil («nicht erfasst» explizit ausweisen). Entscheid-Änderung, nicht bloss Fix.

#### LM-165 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px — Schritt 1 ausfüllen, «Weiter» drücken, in Schritt 2 nichts eintragen
- **Beobachtung:** Der Assistent meldet korrekt «EINGABEFEHLER · Zweck der Offenlegung angeben.» und «Bitte Pflichtfelder ausfüllen» über dem gesperrten Knopf. Das genannte Feld selbst ist aber in keiner Weise markiert: kein «required», kein «aria-invalid», derselbe Rahmen wie alle anderen Felder.
- **Erwartet:** Das Feld, das die Meldung nennt, ist selbst als fehlerhaft erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix, error) — gemeinsame Klasse mit LM-160
- **Dedup-Notiz:** Gleiche Fehlerzustands-Lücke wie im Rechner, andere Fläche (Vorlagen-Assistent). Zusammen als ein Muster-Pass bauen, sonst zweimal dieselbe Grammatik.

#### LM-166 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Sachgebietsliste links vor und nach dem Setzen eines Filters vergleichen
- **Beobachtung:** Sachgebiete ohne Treffer verschwinden ersatzlos aus der Liste: ungefiltert stehen sechs Einträge, nach «BS» fünf (Verfahrensrecht fällt weg), nach der Richter-Auswahl drei. Die Liste wird dabei kürzer, und die verbleibenden Einträge rücken unter dem Zeiger nach oben.
- **Erwartet:** Die Sachgebietsliste behält ihre Einträge und zeigt an, welche leer sind.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §6 J3 (Sachgebiets-Pipeline, Risiko-Pfad QS-GP) + §2 S5-Etappe 2 (Facetten mit Counts)
- **Dedup-Notiz:** J3 behandelt die Sachgebiets-ZUORDNUNG (Fehlklassierung, «maschinell»-Badge), S5-Etappe 2 die Facetten-Counts; das Verschwinden leerer Facetten-Einträge samt Springen der Liste ist neu, liegt aber auf derselben Filter-/Facetten-Fläche.

#### LM-167 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze/bund/EMRK · /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/EMRK` gegen `/gesetze/bund/OR` · 1440 px — die Leiste über dem Text vergleichen
- **Beobachtung:** Beim EMRK fehlt die Lese-Leiste vollständig — kein «Im Gesetz suchen», kein «§ Rechtsprechung», kein «Ansicht». Ein Hinweis, dass diese Werkzeuge bei einem nur als PDF vorliegenden Erlass nicht zur Verfügung stehen, fehlt ebenfalls; die Seite sieht aus, als sei die Leiste vergessen worden.
- **Erwartet:** Fehlende Werkzeuge sind benannt, nicht weggelassen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md G2b-Ausführungsvermerk (Z. 567-569: «der pdf-embed-Kopf NICHT … keine toten Steuerelemente, §13 F4»); Code inhalt-ansichten.tsx:48-52
- **Dedup-Notiz:** Das Weglassen der Options-/Lese-Leiste am pdf-embed ist ein bewusster, begründeter Entscheid (tote Steuerelemente). Der Befund fordert stattdessen eine Benennung der fehlenden Werkzeuge — das ist eine Ergänzung des Entscheids, kein Bugfix; Referenz zwingend in den Bau-Prompt.

#### LM-168 · 2 Hoch

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /gesetze/bund/EMRK
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/EMRK` · 1440 px — unterhalb des PDF bis zur Fussnote scrollen
- **Beobachtung:** Unter dem PDF folgt eine Liste von BGE mit Regeste-Auszügen, die mitten im Wort abbrechen; einzelne Einträge tragen einen Herkunftshinweis «via Art. 3», andere keinen. Am Ende der Liste steht in etwa 10 px grauer Schrift: «12 erfasste Entscheide — maschinell aus den zitierten Normen zugeordnet, keine redaktionelle Präjudizienauswahl. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung.» Genau dieser Vorbehalt fehlt an den Entscheid-Chips der Artikel in der Leseansicht, wo er dieselbe Bedeutung hätte.
- **Erwartet:** Der Vorbehalt zur maschinellen Zuordnung steht dort, wo die Zuordnung benutzt wird, und in lesbarer Grösse.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-VERZAHNUNG-UI.md §8-Badge-Vokabular («maschinell» = «Automatisch zugeordnet — keine redaktionell erfasste Angabe») + FAHRPLAN-UI-NAVIGATION.md §6 J3 («sofort (S): Badge maschinell zugeordnet»)
- **Dedup-Notiz:** Das Badge-Vokabular für maschinelle Zuordnung existiert bereits als SSoT; der Befund verlangt seine Anwendung an den Entscheid-Chips der Leseansicht plus lesbare Grösse und saubere Regeste-Kürzung. Baustein vorhanden, Ausrollen fehlt.

#### LM-169 · 3 Mittel

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Block «Ereignis-Fristen» ohne Ereignisdatum
- **Beobachtung:** Der Block beschreibt eine Tabelle, die ohne Ereignisdatum nicht gerendert wird. Übrig bleibt eine leere Fläche vor dem Footer. Ebenso `/rechner/schkg-fristen`, `/rechner/erb-fristen`, `/rechner/kuendigung`.
- **Erwartet:** Was der Text ankündigt, ist entweder da oder als noch fehlend benannt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Zustandsmatrix: empty) — gemeinsame Klasse mit LM-161
- **Dedup-Notiz:** Leerzustands-Grammatik ist als QS-UI-Aufgabe geführt; der konkrete Fall «angekündigte Tabelle fehlt ersatzlos» (zpo-/schkg-/erb-fristen, kuendigung) steht in keinem Bestand.

#### LM-170 · 3 Mittel

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/notariat-grundbuch
- **Breite:** 1440 px
- **Prüfen:** `/rechner/notariat-grundbuch` · 1440 px — Bereich um die Tab-Leiste
- **Beobachtung:** Der Balken «RECHTLICHER HINWEIS – KEINE RECHTSBERATUNG» erscheint zweimal — einmal über und einmal direkt unter der Tab-Leiste, der zweite mit nur 8 px Abstand statt der sonst üblichen rund 24 px.
- **Erwartet:** Ein Hinweis erscheint pro Seite einmal.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-171 · 4 Detail

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/erb-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/erb-fristen` · 1440 px — Untertext der Karte «Verschoben»
- **Beobachtung:** Der Untertext bricht mitten im Satz ab: «Fristende ist Werktag bzw. Verschiebung aus».
- **Erwartet:** Sätze sind vollständig.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-172 · 4 Detail

- **Bauteil:** K-15 · Fehler-, Leer- und Ladezustände
- **Route:** /rechner/schkg-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/schkg-fristen` · 1440 px — Hilfetexte oben und unten vergleichen
- **Beobachtung:** Dieselbe Aussage einmal gross, einmal klein geschrieben: «Staatlich anerkannte Feiertage …» oben, «staatlich anerkannte Feiertage (Endregel)» unten. «Zustellung des Zahlungsbefehls» steht doppelt — als Wert und als Hilfetext direkt darunter.
- **Erwartet:** Gleiche Aussagen sind gleich geschrieben und stehen einmal.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

### K-16 · Druckausgabe

#### LM-173 · 1 Blocker

- **Bauteil:** K-16 · Druckausgabe
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Ergebnis erzeugen, dann Druckvorschau öffnen
- **Beobachtung:** Die Akkordeons «Hinweise/Vorbehalte», «Rechenweg (6 Schritte)» und «Annahmen» erscheinen als leere Striche. Die Tab-Leiste «Verfahrensphase wählen» druckt leer — welche Phase gewählt war, ist dem Ausdruck nicht zu entnehmen. Gedruckt werden stattdessen die leeren Formularfelder samt Platzhaltern («TT.MM.JJJJ», «z. B. 12'000») und Auswahlpfeilen. Es fehlen Titel, Datum, Quelle und Seitenzahl.
- **Erwartet:** Der Ausdruck enthält, was auf dem Bildschirm zu sehen ist: gewählte Verfahrensphase, Rechenweg, Annahmen und Vorbehalte im Klartext, Eingaben als Werte, dazu Titel, Stand und Quelle.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §7 Z2 (Print-CSS für Fundstellen, «S–M, Reader-Fläche nach §0.2») + Code src/index.css:506-515
- **Dedup-Notiz:** Z2 plant Druck-Tauglichkeit ausdrücklich nur für den Norm-/Entscheid-Reader, nicht für die Rechner. Das heutige @media print blendet alle button-Elemente aus (Akkordeons, Tab-Leiste) — Ursache im Code belegt, samt Kommentar-Eingeständnis «Rechenweg/Annahmen vor dem Drucken aufklappen; PDF-Export bleibt der präzisere Weg».

### K-17 · Farbschema und Kontrast

#### LM-174 · 1 Blocker

- **Bauteil:** K-17 · Farbschema und Kontrast
- **Route:** /
- **Breite:** 
- **Prüfen:** neues Browserprofil mit dunklem Betriebssystem · `/` — Einstellung «Automatisch» ist voreingestellt, Darstellung prüfen
- **Beobachtung:** Bei prefers-color-scheme dark bleibt die Wurzelklasse auf «light». Manuelles Umschalten funktioniert.
- **Erwartet:** Bei «Automatisch» folgt die Darstellung dem Betriebssystem, auch beim ersten Aufruf und bei späterem Wechsel.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-175 · 2 Hoch

- **Bauteil:** K-17 · Farbschema und Kontrast
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px · dunkel — Kalender, Samstage und Sonntage
- **Beobachtung:** Sa/So sind als «abgeschwächt» dunkelgrau auf dunkler Pille gesetzt und kaum lesbar. Der helle graue Legenden-Swatch «laufende Frist» passt farblich nicht zu den tatsächlich dunklen Pillen.
- **Erwartet:** Alle Kalendertage sind in beiden Farbmodi lesbar, und die Legende zeigt dieselben Farben wie der Kalender.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §4 Ziff. 2 (axe von Stichprobe auf Flächendeckung, alle Hauptrouten hell UND dunkel) + check:farbwelt
- **Dedup-Notiz:** Der Dunkelmodus-Kontrast ist als Gate-Verschärfung geplant, dieser konkrete Befund (Sa/So-Pillen + falsche Legenden-Swatch-Farbe) ist dort nicht erfasst — er ist genau ein Fund, den die geplante Flächendeckung liefern soll.

#### LM-176 · 3 Mittel

- **Bauteil:** K-17 · Farbschema und Kontrast
- **Route:** /vorlagen/nda
- **Breite:** 1440 px
- **Prüfen:** `/vorlagen/nda` · 1440 px · hell — Hilfetext «beide Parteien verpflichtet» und die Feld-Erläuterungen
- **Beobachtung:** Graue Hilfetexte (#6F6B61, 11–12 px) auf getönten Kartenflächen liegen bei rund 4.3 : 1 und damit knapp unter WCAG AA. Der Breadcrumb-Trenner «›» liegt bei 2.3 : 1, ist aber dekorativ.
- **Erwartet:** Auch die kleinen Hilfetexte erfüllen WCAG AA.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §4 Ziff. 1 (Farbwelt-Baseline enger ziehen, Ausnahmen abbauen) + Präzedenz src/index.css (.lc-overline/.lc-fineprint ink-500→ink-600, Auftrag David 25.6.2026)
- **Dedup-Notiz:** Dieselbe Fehlerklasse wie die bereits gefixten 11-px-Graustufen; hier für Hilfetexte auf getönten Kartenflächen. Fix-Muster liegt vor, Fläche neu.

### K-18 · Reiter- und Split-Ansicht

#### LM-177 · 2 Hoch

- **Bauteil:** K-18 · Reiter- und Split-Ansicht
- **Route:** /gesetze/bund/OR
- **Breite:** 900 px
- **Prüfen:** `/gesetze/bund/OR` · zwei Reiter öffnen, dann Fenster auf 900 px verkleinern
- **Beobachtung:** Unterhalb von etwa 1024 px verschwindet der zweite Reiter ersatzlos. Er bleibt im Dokument vorhanden und der Zähler in der Kopfleiste zeigt weiterhin die Gesamtzahl, aber in der Reiter-Kopfzeile gibt es keinen Umschalter und keinen Hinweis, dass ein zweites Dokument offen ist.
- **Erwartet:** Offene Reiter bleiben auf jeder Breite erreichbar, notfalls über einen Umschalter.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-SPLIT-VIEW.md B-4 Mobil-Faltung (✅ FERTIG, Commit 3587d1fd: «< lg → 1 Pane + Reiter-Umschaltung», Opener lg-only)
- **Dedup-Notiz:** B-4 beansprucht genau diese Funktion als gebaut (Snap-Wischen je Pane unter lg). Der Befund behauptet das Gegenteil — vor dem Bau reproduzieren und klären, ob «Reiter» hier das Pane oder den Reiter-Tracker (tabs.ts/ReiterUebersicht) meint; sonst wird ein Nicht-Defekt gebaut.

#### LM-178 · 3 Mittel

- **Bauteil:** K-18 · Reiter- und Split-Ansicht
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px · zwei Reiter — Bereich zwischen den Reitern ansehen und ziehen
- **Beobachtung:** Zwischen den Reitern liegt ein 6 px breiter Ziehgriff, der ausschliesslich über den Mauszeiger erkennbar ist — keine Linie, keine Griffpunkte, keine Färbung. Bei fester Hälftelung bricht der Gesetzestext auf rund 45 Zeichen um.
- **Erwartet:** Der Ziehgriff ist sichtbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

#### LM-179 · 3 Mittel

- **Bauteil:** K-18 · Reiter- und Split-Ansicht
- **Route:** /gesetze/bund/OR
- **Breite:** 
- **Prüfen:** `/gesetze/bund/OR` · zu Art. 269d scrollen, dann Reiter-Menü öffnen
- **Beobachtung:** Die Positionsangabe je Reiter ist veraltet: der OR-Reiter wird mit «Art. 366» geführt, während die Kopfzeile desselben Reiters «Art. 269d OR» zeigt.
- **Erwartet:** Die Positionsangabe entspricht dem Reiterzustand.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-SPLIT-VIEW.md B-2.5 Ziff. 4 (merkeTab/aktualisiereTabArtikel aus basisPfad statt window.location; sekundäres Pane unterdrückt Reiter-Update) + Code src/lib/tabs.ts:128
- **Dedup-Notiz:** B-2.5 hat genau die Reiter-Aktualisierungs-Mechanik umgebaut (Pane-Unterdrückung) — plausibler Herkunftsort der veralteten Positionsangabe. Anderer konkreter Defekt, aber dieselbe Fläche; Reproduktion Haupt- vs. Pane-Fenster nötig.

#### LM-180 · 4 Detail

- **Bauteil:** K-18 · Reiter- und Split-Ansicht
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — Reiter-Menü, Einträge und Fusszeile
- **Beobachtung:** «Alle schliessen» ist reiner Text ohne Button-Look. Rechtsprechung und Rechner haben ein Icon, die Gesetze nicht. Ein Reitername wird abgeschnitten («Verfahrens- & Rechts…»), obwohl daneben Platz frei ist.
- **Erwartet:** Gleichartige Einträge sehen gleich aus und werden nicht ohne Not gekürzt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** —

### K-19 · Navigation und Seitenmeta

#### LM-181 · 2 Hoch

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — obere zwei Zeilen unter der Kopfleiste
- **Beobachtung:** Oben die Leiste «Rechner › Verfahrens- & Rechtsmittelfristen ✕», direkt darunter nochmals «← Alle Rechner | Rechner / Verfahrens- & Rechtsmittelfristen» — zwei Navigationsebenen mit identischem Inhalt in unterschiedlicher Typografie.
- **Erwartet:** Pro Seite gibt es eine Pfadangabe.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1/N0a (Z. 55–63, gebaut 11.7.) · FAHRPLAN-UI-QUALITAET.md §3 + §5 (c) «Muster-Konsistenz: Breadcrumb und Rückweg»
- **Dedup-Notiz:** Code-bestätigt und NICHT gefixt: InhaltsKopfKontext.ts:39 (INHALT_RE enthält `rechner/[^/]+`) rendert die Leiste «Rechner › Titel ✕», RechnerKopf.tsx:34–43 rendert zusätzlich «← Alle Rechner | Rechner / Titel». N0a hat an genau dieser Nav-Zeile nur Ziel/Label/Tap-Höhe korrigiert, die Doppelung nicht adressiert (sie entstand später mit dem Inhalts-Kopf, W2·7-BEZUG). Bau-Session muss N0a kennen, damit die Rückweg-Korrektur nicht rückgängig gemacht wird.

#### LM-182 · 2 Hoch

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung
- **Breite:** 490 px
- **Prüfen:** `/rechtsprechung` · 490 px — Menü öffnen, Zeilenabstand und Chevrons
- **Beobachtung:** Rund 110 px Zeilenabstand pro Eintrag — sichtbar sind etwa 6 von über 30 Positionen. Zwei Chevron-Grössen für dieselbe Funktion («Bund ›» gross, «Nach Sachgebiet ▸» winzig). Das Overlay verdunkelt den Header nicht mit: Theme-, Sprach- und Verlaufs-Icons stehen ungedimmt darüber.
- **Erwartet:** Mehrere Ebenen sind ohne langes Scrollen überblickbar, gleichartige Einträge sehen gleich aus, und das Overlay legt sich über die gesamte Seite.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §6/O2 (Z. 429–433, Sidebar-Konsistenz) · §4/R6 (Z. 321–328, Chevron-Hitboxen) · §6/J2 (Z. 397–402, Mobil-Bottom-Sheet) · FAHRPLAN-SEO-A11Y-GOVERNANCE.md W1.7 (mobile Nav-Schublade role=dialog im axe-Tor)
- **Dedup-Notiz:** Thematisch gedeckt (Sidebar-/Chevron-Grammatik, Mobil-Kollaps), aber kein Bestandseintrag nennt Zeilenabstand ~110 px oder zwei Chevron-Grössen. Overlay-Teil des Befunds am Code NICHT bestätigt: Shell.tsx:437 Backdrop `fixed inset-0 z-30`, Topbar.tsx:26 `sticky z-20` — der Header müsste mitgedimmt werden; vor dem Bau am Prod reproduzieren (Vintage-Regel §0.1).

#### LM-183 · 2 Hoch

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung/bge_152_V_52
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bge_152_V_52` · 1440 px — Kopfleiste und Meta-Zeile des Entscheids
- **Beobachtung:** In der Kopfleiste «A− 100 % A+», in der Meta-Zeile nochmals «A− A+» in anderem Stil (ohne Prozentanzeige, teils ausgegraut) — zwei konkurrierende Bedienelemente für dieselbe Sache, gleichzeitig sichtbar.
- **Erwartet:** Es gibt eine Steuerung für die Schriftgrösse.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §3.1 (Z. 305: «Bewusst NICHT als Toggle: Schriftgrösse (existiert global in der Topbar … nicht duplizieren)») · FAHRPLAN-DESIGN-WAERME.md Z. 405 (Schriftgrad-Stepper 48: «Entscheid-Reader-Stepper + globale Schriftskala» als weitgehend gebaut)
- **Dedup-Notiz:** Die Nicht-Duplizieren-Regel steht im Bestand, gilt dort aber nur für den GESETZ-Reader; im Entscheid-Leser ist der zweite Stepper bewusst gebaut (EntscheidLeser.tsx:513–517 R17, zusätzlich im Lesemodus 706–710) neben der globalen Schriftskala (Topbar.tsx:21/55, R3). Also derselbe Konflikt, andere Fläche → Entscheid nötig, welche der beiden Steuerungen weicht; nicht autonom kippen (R17/R3 sind je begründet).

#### LM-184 · 2 Hoch

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — Zähler «≡ 13» in der Kopfleiste ablesen, einen Entscheid öffnen, Zähler erneut ablesen
- **Beobachtung:** Der Zähler in der Kopfleiste steigt beim Öffnen eines Entscheids von 13 auf 14, ohne dass der Nutzer eine Ansicht bewusst geöffnet hat. Beim Öffnen einer Materialien-Detailseite bleibt er stehen. Was gezählt wird und wie man den Bestand wieder verkleinert, geht aus der Kopfleiste nicht hervor.
- **Erwartet:** Ein Zähler in der Kopfleiste benennt, was er zählt, und wächst nur durch Handlungen, die der Nutzer als solche erkennt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1/N0d·O3 (Z. 96–97, «Toast/Fly-to zum Reiter-Tracker + Tooltip ‹Reiter & Split-View›» — gebaut 11.7.)
- **Dedup-Notiz:** Entdeckbarkeits-Teil ist gebaut (ReiterUebersicht.tsx:147/150 aria-label «Alle geöffneten Reiter» + title «Reiter & Split-View»); der Befund zielt auf die Zähl-SEMANTIK und die ist offen und code-bestätigt: TabTracker.tsx:13 `INHALT_ITEM = /^\/(rechner|vorlagen|gesetze|rechtsprechung)\/.+/` — jeder geöffnete Entscheid legt automatisch einen Reiter an, `materialien` fehlt in der Liste (daher der stehende Zähler auf Material-Detailseiten).

#### LM-185 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px und 490 px — Filterzeilen «GEMEINWESEN», «INSTANZ», «SPRACHE»
- **Beobachtung:** Die Zeilenlabels stehen inline und sind unterschiedlich lang — die drei Chip-Reihen beginnen auf drei x-Positionen. Auf schmalen Breiten umbrechen die Chips bis an den linken Rand, das Label bleibt allein in Zeile 1. «Alle 5093» erscheint dreimal identisch.
- **Erwartet:** Filtergruppen sind als Gruppen erkennbar und beginnen auf derselben Linie.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §6/J2 (Z. 397–402, Filterblock/Bottom-Sheet mobil) · FAHRPLAN-UI-QUALITAET.md §2/§3 (Hierarchie- und Muster-Pass)
- **Dedup-Notiz:** J2 deckt den mobilen Filterblock, aber nicht den konkreten Defekt (drei x-Startpositionen der Chip-Reihen wegen inline stehender, unterschiedlich langer Labels; dreimal identisches «Alle 5093»). Desktop-Ausrichtung ist in keinem Bestand benannt.

#### LM-186 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /gesetze
- **Breite:** 1440 px
- **Prüfen:** `/gesetze` · 1440 px — die drei Suchfelder der Seite
- **Beobachtung:** Drei Suchfelder mit drei Bedeutungen, drei Gestaltungen und zwei Ausrichtungen: «Suchen — Kürzel, Titel, SR-Nr. …» rechtsbündig, darunter der grosse Kasten «Direkt zum Artikel springen …» mit ⌘K, weiter unten «Im Register filtern …» linksbündig.
- **Erwartet:** Erkennbar, welches Feld wofür da ist; gleichartige Felder gleich ausgerichtet.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11.5/IA-4 (gebaut+gemergt 25.7.2026, PR #350) · FAHRPLAN-UI-NAVIGATION.md §6/O5 (Z. 435–439) · §11.9 Ziff. 3 (A5: «KEIN dritter Suchpfad», Palette gelöscht)
- **Dedup-Notiz:** Der «welches Feld wofür»-Teil ist durch IA-4 bereits geliefert (Gesetze.tsx:312–342: Scope-Label + Chip «auf alle Ebenen erweitern»); offen bleibt allein die optische Uneinheitlichkeit (Ausrichtung/Gestalt) der drei Flächen: Kopfsuche, CTA-Karte «Direkt zum Artikel springen» (Gesetze.tsx:119 — bindend nur CTA auf die HeaderSuche, kein eigener Suchpfad) und das lokale Filterfeld (Gesetze.tsx:318–324). Bau darf keine vierte Suchfläche erzeugen (§11.9 Ziff. 3).

#### LM-187 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — «OR 257d» in die Kopfsuche eingeben, Trefferliste lesen
- **Beobachtung:** Die Suche liefert Art. 74 OR, Art. 581a OR, Art. 699b OR — Substring-Treffer auf «or» innerhalb von Wörtern («Ort», «vorgeschrieben»), die zusätzlich fett hervorgehoben werden.
- **Erwartet:** Suchtreffer beziehen sich auf das Gesuchte; Hervorhebungen liegen auf sinnvollen Wortteilen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11.5/IA-1 (gebaut 16.7.2026, PR #264 — «OR 257d» Zielartikel oben, e2e-belegt) · FAHRPLAN-UI-NAVIGATION.md §2/S4 (Ranking, gebaut 12.7.) · §2/S3 (Snippet/`<mark>`-Politur, gebaut 11.7.)
- **Dedup-Notiz:** Kein Bestands-Zwilling für Rausch-Treffer + Hervorhebung auf Wortteilen. Code-Spur: artikelVolltext.ts:142–154 `tokenize: 'forward'` (Präfix-Recall → «Ort» auf «or») und artikelVolltext.ts:66 `lower.includes(w)` für das Snippet-Highlight (echter Substring → «vorgeschrieben»). Achtung: IA-1 hat für «OR 257d» den Zielartikel als obersten Sprung-Treffer bewiesen — der Befund ist gegen den aktuellen Prod-Stand zu reproduzieren, bevor an der Query-Engine gebaut wird (Risiko-Pfad, `check:gegenpruefung`).

#### LM-188 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /gibtesnicht
- **Breite:** 1440 px
- **Prüfen:** `/gibtesnicht` · 1440 px — Browsertab-Titel und Seitengerüst
- **Beobachtung:** Die 404-Seite trägt den Seitentitel der Startseite («LexMetrik — Schweizer Recht nachschlagen, Fristen und Kosten berechnen»). Ausserdem fehlt die Breadcrumb-Leiste, die alle anderen Seiten haben. Der Inhalt selbst ist in Ordnung.
- **Erwartet:** Eigener Seitentitel; Seitengerüst wie auf allen anderen Seiten.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Code-bestätigt: RouteMeta.tsx:22 setzt `document.title` nur bei vorhandenem Routen-Meta, mit Kommentar «Stub/NotFound/Redirects: Head unverändert lassen» → die 404-Route erbt den prerenderten Startseiten-Titel. NotFound.tsx rendert `SeitenKopf` ohne Breadcrumb; InhaltsKopf greift nicht (INHALT_RE trifft nicht). N0b (FAHRPLAN-UI-NAVIGATION §1) betrifft die Erlass-Fehlseite im GesetzLeser, nicht diese Route.

#### LM-189 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /gesetze?ebene=kanton
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=kanton` · 1440 px — Schweizer Karte
- **Beobachtung:** Die Kantonsflächen sind rosa, violett, hellblau, mintgrün — ausserhalb der warmen Palette der Seite. Die Farben tragen keine Information (keine Legende). Der Kartenrahmen ist 1070 px breit, die Karte selbst deutlich schmaler und zentriert.
- **Erwartet:** Die Karte gehört sichtbar zur Seite; Farbe steht für Information oder wird weggelassen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11.5/IA-2 + §11.9 Ziff. 14 (O4-Korrektur: «Kartenrest nur nach Prod-Repro») · FAHRPLAN-UI-NAVIGATION.md §6/O4 (Z. 420–427) · FAHRPLAN-DESIGN-WAERME.md (W2·11-DESIGN, Farbwelt)
- **Dedup-Notiz:** O4/IA-2 betreffen Abdeckungs-Badges/aria der Karte, nicht ihre Palette. Der Farbteil ist code-bestätigt: SchweizKarte.tsx:7–13 erzeugt die Füllung per Goldwinkel `hsl((i*137.508)%360 …)` — reine Unterscheidbarkeit, keine Information, ausserhalb der Papier/Messing-Achse. Heimat wäre W2·11-DESIGN/`check:farbwelt`; Kollisionsabgleich mit IA-2 (gleiche Datei) nötig.

#### LM-190 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /
- **Breite:** 1440 px
- **Prüfen:** `/` · 1440 px — Kalender im Schnellrechner, Übergang 31.07./01.08. und Ring um den Ereignistag
- **Beobachtung:** Am Monatsübergang stossen zwei separat abgerundete Pillen aneinander — sichtbare Kerbe im durchlaufenden Fristband. Der schwarze Ring des Ereignistags überlagert die linke Rundung der Pille. Die Legenden sind seitenabhängig unterschiedlich bestückt (Startseite ohne «Fristbeginn», Rechnerseite ohne «Gerichtsstillstand»). Der Juli-Block hat eine Zeile, der August fünf — darunter klafft links eine grosse Leerfläche.
- **Erwartet:** Das Fristband liest sich als durchgehender Zeitraum; eine gemeinsame Legende; Monatsblöcke gleich hoch.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-Hinweis für den Bau: Es gibt bereits EINE Quelle (§5) — components/start/FristenKalender.tsx ist nur eine Hülle um components/FristenKalender.tsx; die unterschiedlich bestückten Legenden sind bedingt gerendert (FristenKalender.tsx:225 `stillstandSichtbar &&`, aQuo-abhängiger Fristbeginn-Marker), also datenabhängig, nicht zwei Implementierungen.

#### LM-191 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechner/verjaehrung-board
- **Breite:** 1440 px
- **Prüfen:** `/rechner/verjaehrung-board` · 1440 px — Spalte «Relative Frist»
- **Beobachtung:** Die Spalte ist linksbündig gesetzt; dadurch steht «Jahre» bei «10 Jahre» nicht über «5 Jahre» und «3 Jahre».
- **Erwartet:** Zahlenspalten sind rechts- oder dezimalbündig.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling; natürliche Heimat wäre FAHRPLAN-UI-QUALITAET.md §2 (Hierarchie-Pass) bzw. DESIGN-REGLEMENT-RECHNER.md Z. 159 («Werte/Daten/Beträge im `num`-Schnitt»), das aber keine Bündigkeitsregel für Zahlenspalten kennt. Fundstelle: RechnerVerjaehrungBoard.tsx:49.

#### LM-192 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /gesetze?ebene=international
- **Breite:** 1440 px
- **Prüfen:** `/gesetze?ebene=international` · 1440 px — auf «EMRK» klicken und die Adresse ansehen
- **Beobachtung:** Internationale Erlasse liegen unter «/gesetze/bund/EMRK», «/gesetze/bund/CISG», «/gesetze/bund/LUGUE» — die Adresse führt sie als Bundesrecht, während die Oberfläche sie als eigene Ebene «International» ausweist und der Ebenen-Umschalter entsprechend gesetzt ist.
- **Erwartet:** Die Adresse benennt dieselbe Ebene wie die Oberfläche.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §11.4 Ziff. 3 + §11.10/IA-6 (gebaut+gemergt 25.7.2026, PR #353) sowie §11.4 Ziff. 5 («Reader-Routen /gesetze/{ebene}/{key} … unberührt») und §11.8 Y-C (Stufe 2 offen)
- **Dedup-Notiz:** IA-6 hat die Kanonik NUR für die Übersichts-Säule geregelt (/international ↔ ?ebene=international); die Reader-Route ist dort ausdrücklich unberührt gelassen. Code-bestätigt: register.ts:313/314 legen CISG/LugÜ per `bund(...)` an, 'international' ist dort ein RECHTSGEBIET, keine Ebene → /gesetze/bund/CISG. Eine Änderung berührt Y-C, den «kein 301»-Grundsatz (§11.4 Ziff. 1) und Deep-Link-Regressionen — nicht als reine UI-Korrektur einplanen.

#### LM-193 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7 · /materialien/ESTV-KS-DBG-5A
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` und `/materialien/ESTV-KS-DBG-5A` · 1440 px — Brotkrumenleiste am rechten Rand
- **Beobachtung:** Ganz rechts in der Brotkrumenleiste steht ein «×» ohne Beschriftung und ohne Titel. Ob es die Seite, die Ansicht oder den Eintrag im Zähler schliesst, ist nicht erkennbar; ein zweites «×» derselben Gestalt schliesst an anderer Stelle den Lesemodus.
- **Erwartet:** Eine Schliessen-Schaltfläche benennt, was sie schliesst.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/components/layout/InhaltsKopf.tsx:154–157 (`aria-label`/`title` = «Schliessen (zur Startseite)») · FAHRPLAN-UI-NAVIGATION.md §1/N0a (Z. 59–60: «Der ✕ («zur Startseite») bleibt — Label ist ehrlich»)
- **Dedup-Notiz:** Die Behauptung «ohne Beschriftung und ohne Titel» ist am Code widerlegt: der ✕ trägt aria-label UND title. Rest-Kern wäre höchstens die SICHTBARE Beschriftung und die Abgrenzung zum zweiten ✕ des Lesemodus (EntscheidLeser.tsx:713, title «Lesemodus schliessen (Esc)») — beide sind bereits unterschiedlich betitelt. Kandidat für «Prüfung wiederholen, dann erledigt».

#### LM-194 · 3 Mittel

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /materialien
- **Breite:** 1440 px
- **Prüfen:** `/materialien` · 1440 px — Seite laden und die Anzahl der Einträge messen
- **Beobachtung:** Die Übersicht stellt sämtliche 1549 Detailverweise auf einmal dar, ohne Blätterung und ohne Nachladen beim Scrollen; einzelne Behördenabschnitte umfassen über 140 Einträge (ESTV 144). Eine Sortierung oder Suche innerhalb der Seite gibt es nicht, nur die Sprungmarken je Behörde.
- **Erwartet:** Eine Übersicht dieser Länge lässt sich eingrenzen, ohne sie ganz zu durchscrollen.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** BEREITS-GEBAUT
- **Dedup-Referenz:** src/pages/Materialien.tsx:73–108 (Behörden-Select, Doktyp-Select, Suchfeld «Titel, Nummer oder Behörde suchen …»; seit Commit a0fe2e651, 27.6.2026)
- **Dedup-Notiz:** Die Beobachtung «Eine Sortierung oder Suche innerhalb der Seite gibt es nicht» ist am Code widerlegt — das Erwartete («lässt sich eingrenzen, ohne ganz zu durchscrollen») ist erfüllt. OFFEN bleibt der Nebenteil: die gefilterte Liste rendert weiterhin vollständig ohne Blätterung/Nachladen (Materialien.tsx:114–128, kein slice/Deckel) — das ist ein Perf-/§15-Posten (Nähe QS-PERF), kein Auffindbarkeits-Posten. Vor Neuplanung Prüfung wiederholen.

#### LM-195 · 4 Detail

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /materialien
- **Breite:** 1440 px
- **Prüfen:** `/materialien` · 1440 px — Abschnittsüberschrift und Karten desselben Abschnitts
- **Beobachtung:** «ESTV» steht als Abschnittsüberschrift und zusätzlich in jeder Karte. Die Karten haben keinen Link-Hinweis (kein Pfeil, kein Link-Stil), anders als in den übrigen Bereichen.
- **Erwartet:** Karten wiederholen nicht, was in der Abschnittsüberschrift steht, und ihre Klickbarkeit ist erkennbar.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-bestätigt: MaterialKarte.tsx wiederholt `m.behoerdeKuerzel` in jeder Karte, obwohl die Abschnittsüberschrift dieselbe Behörde trägt (Materialien.tsx:119); die Link-Affordanz «Details & amtliche Fassung →» existiert, ist aber `opacity-0 … group-hover:opacity-100` — auf Touch/im Ruhezustand also unsichtbar. Der Befund trifft damit zu, ist nur präziser zu fassen als «kein Link-Hinweis».

#### LM-196 · 4 Detail

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechner/schkg-fristen · /rechner/verjaehrung · /rechner/kuendigung
- **Breite:** 1440 px
- **Prüfen:** `/rechner/schkg-fristen`, `/rechner/verjaehrung`, `/rechner/kuendigung` · 1440 px — Position des Knopfs «In Kalender (.ics)»
- **Beobachtung:** Der Knopf steht auf SchKG in einer eigenen Zeile über dem Aktenzeichenfeld, auf vier anderen Rechnern neben «PDF-Rechenbericht», auf `/rechner/kuendigung` fehlt er ganz.
- **Erwartet:** Dieselbe Aktion steht auf allen Rechnern an derselben Stelle.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §7/Z1 (Z. 447: «ICS-/Kalender-Export des Frist-Ergebnisses … Ist-Stand zuerst erheben», eigene kleine Einheit nach N0)
- **Dedup-Notiz:** Z1 ist die zuständige Einheit, betrifft aber die Existenz/Ehrlichkeit des Exports, nicht seine Platzierung. Teil-Widerlegung der Beobachtung: /rechner/kuendigung HAT einen ICS-Knopf (KuendigungSperrForm.tsx:280/283) — er hängt am Tab «B+C – Kündigung», der Default-Tab «A – Lohnfortzahlung» hat kein Fristende. Vor Bau reproduzieren; der geteilte Baustein ist IcsExportButton.tsx (10 Aufrufer), Vereinheitlichung dort ansetzen.

#### LM-197 · 4 Detail

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — alle Pfeil- und Symbolzeichen der Seite zusammen ansehen
- **Beobachtung:** Auf einer Seite stehen «‹ Zur Übersicht», «↗ massgebliche Fassung», «↗ amtlich», «→» in der Fusszeile und «✕» in der Brotkrumenleiste — fünf verschiedene Zeichenformen für Richtungs- und Schliessen-Hinweise.
- **Erwartet:** Richtungs- und Schliessen-Zeichen folgen einem Satz.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: «Chip- und Badge-Grammatik», Bau in W2·10-UI-NAV) · DESIGN-REGLEMENT.md Z. 107 (Icons/Symbole nur zusätzlich zum Text)
- **Dedup-Notiz:** Zeichen-Kanon ist als Grammatik-Aufgabe im Bestand verortet, aber nirgends als konkreter Befund mit dieser Zeichenliste (‹ ↗ → ✕ …) erfasst. Achtung Bestands-Entscheide: ⧉ ist per A27/VZUI als Chip-Dekor bzw. Pane-Aktion belegt und darf nicht umgedeutet werden.

#### LM-198 · 4 Detail

- **Bauteil:** K-19 · Navigation und Seitenmeta
- **Route:** /materialien
- **Breite:** 1440 px
- **Prüfen:** `/materialien` · 1440 px — Sprungziel «b-BJ» und die Überschrift des zugehörigen Abschnitts vergleichen
- **Beobachtung:** Das Sprungziel heisst «b-BJ», der Abschnitt trägt die Überschrift «EHRA» mit dem Zusatz «Eidg. Amt für das Handelsregister (Bundesamt für Justiz)». Sprungmarke und sichtbarer Name derselben Stelle stimmen nicht überein; alle acht übrigen Abschnitte stimmen.
- **Erwartet:** Sprungmarke und sichtbare Überschrift benennen dieselbe Stelle gleich.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-bestätigt: Materialien.tsx:116 setzt `id={`b-${g.behoerde}`}` (Behörden-KEY, hier «BJ»), die Überschrift daneben rendert `{g.kuerzel}` («EHRA») — Sprungmarke und sichtbarer Name stammen aus zwei verschiedenen Feldern. Reine Darstellung, kein Risiko-Pfad.

### K-20 · Verlauf und Zustand in der URL

#### LM-199 · 1 Blocker

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — zu Art. 400 scrollen, einen Entscheid-Chip anklicken, dann im Browser zurück
- **Beobachtung:** Nach «Zurück» landet man am Anfang des Gesetzes statt an der verlassenen Stelle. Gemessen: verlassen bei Art. 400 (Scrollposition 278'165), nach «Zurück» Scrollposition 0 bei einer Dokumenthöhe von 820'653 px. Zweimal reproduziert, auch über «Vorwärts» und erneut «Zurück».
- **Erwartet:** «Zurück» führt an die Stelle zurück, die man verlassen hat.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 (U-POSITION = A2+A16+A17) und §10.9 A16 (Z. 1292–1307, «Zurück landet EXAKT am Ausgangsort», e2e `leser-position-u` belegt) · FAHRPLAN-UI-NAVIGATION.md §4/R5 (Z. 314–319: «Davids U-POSITION-Befund ist GEBAUT», Rest nur TOC-Sprünge)
- **Dedup-Notiz:** Kein Zwilling, sondern ein REGRESSIONS-/Lücken-Verdacht gegen eine als gebaut+bewiesen deklarierte Einheit — die Bau-Session MUSS A16 kennen, sonst wird die Anker-Mechanik doppelt gebaut. Code-Spur für die Lücke: App.tsx:34/59/67 speichert bei gesetztem `#hash` KEINE Scrollposition (`aktiv.current = hash ? '' : schluessel`); der Befund-Weg startet laut LM-202 mit stehendem `#art-257_d`. Erst reproduzieren (§0 Ziff. 2), dann fixen.

#### LM-200 · 1 Blocker

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px · hell — nacheinander «BS» in der Zeile GEMEINWESEN anklicken, «Karten» wählen, links «Privatrecht» wählen, im Feld RICHTER:IN einen Namen auswählen; nach jedem Schritt die Adresszeile lesen
- **Beobachtung:** Vier Bedienelemente derselben Seite hinterlegen ihren Zustand auf drei verschiedene Arten: Das Sachgebiet links schreibt sich in die Adresse (`?rg=privat`), die Richter-Auswahl ebenfalls (`?richter=muller-c`), die Filterreihen GEMEINWESEN, INSTANZ und SPRACHE gar nicht (die Adresse bleibt `/rechtsprechung`), und der Umschalter «Liste | Karten» steht ebenfalls nicht in der Adresse, überlebt aber das Neuladen. Eine gefilterte Trefferliste lässt sich damit weder verschicken noch als Lesezeichen ablegen, und beim Neuladen kommen nur zwei der vier Einstellungen zurück.
- **Erwartet:** Alle Filter einer Seite hinterlegen ihren Zustand auf dieselbe Weise; was die Seite nach dem Neuladen zeigt, entspricht dem, was die Adresse benennt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116: «Rechtsprechungs-Suchbegriff in URL spiegeln (debounced replaceState, Muster des bestehenden `?rg=`)», Prüfpunkt «Reload/Teilen … stellt rg UND q wieder her» — offen)
- **Dedup-Notiz:** S1 spiegelt nur den SUCHBEGRIFF `q`; der Befund betrifft die Filterreihen GEMEINWESEN/INSTANZ/SPRACHE und den Liste/Karten-Umschalter. Code-bestätigt: Rechtsprechung.tsx:103–111 hält `rest` (EntscheidFilterWerte), `sort`, `dichte` in React-State, während nur `rg`/`norm`/`richter` als URL-Achsen geführt werden (Z. 111 `type UrlAchse = 'rg' | 'norm' | 'richter'`). Gleiche Fläche wie S1 → als eine Bau-Einheit führen. Intra-Liste doppelt mit LM-203/LM-206.

#### LM-201 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — tief im Gesetz einen Entscheid-Chip anklicken und den ersten Moment nach dem Wechsel ansehen
- **Beobachtung:** Beim Wechsel auf eine kürzere Seite bleibt kurzzeitig die alte Scrollposition erhalten: Ankunft auf der Entscheid-Seite bei Scrollposition 2'520, obwohl das Dokument nur 3'249 px hoch ist — sichtbar als leerer Bildschirm, bevor nach oben gesprungen wird. history.scrollRestoration steht auf «manual», die Anwendung setzt die Position also selbst.
- **Erwartet:** Ein Seitenwechsel beginnt oben, ohne Zwischenzustand.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.9 A16 (Z. 1292–1307, anker-basierte Restauration, `history.scrollRestoration='manual'` ist dort begründet) · FAHRPLAN-UI-NAVIGATION.md §4/R7 (Z. 330–335, Deep-Link-Wahrnehmung/Skeleton)
- **Dedup-Notiz:** Kein Zwilling für den konkreten Zwischenzustand. Code-Spur: App.tsx:39–42 setzt `scrollRestoration='manual'`; der Reset auf 0 läuft im useEffect + rAF (Z. 90–93), also NACH dem ersten Paint → der beobachtete leere Bildschirm ist erklärbar. Änderungen dort berühren die A16-Konvergenzschleife (Z. 100–110) — golden/e2e `leser-position-u` grün halten.

#### LM-202 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — durch das Gesetz scrollen und dabei Adresszeile und Breadcrumb vergleichen, dann die Adresse kopieren
- **Beobachtung:** Die Adresse führt den Artikel beim Lesen nicht nach. Sie bleibt auf dem zuerst angesprungenen Anker stehen (#art-257_d), während die Breadcrumb korrekt «Art. 400» zeigt. Die aktuelle Fundstelle lässt sich dadurch weder kopieren noch als Lesezeichen sichern.
- **Erwartet:** Die Adresse benennt die Stelle, die man gerade liest.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** SICHER
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Z. 545–547): «Kontinuierlicher Scroll-Hash-Sync in der URL (#13-Teil) — kollidiert mit der empirisch begründeten A16-Architektur (manuelles pushState war der ‹widerlegte Irrweg›); Perf-/History-Falle. Teilbarkeit leistet R3 (Zitat+Permalink).»
- **Dedup-Notiz:** Derselbe konkrete Defekt an derselben Stelle ist im Bestand erfasst UND mit Begründung VERWORFEN (Nicht-Bauen-Notiz), mit R3 (§4, Z. 293–303) als bewusst gewähltem Ersatzweg. Neu einplanen hiesse einen dokumentierten Entscheid still kippen (§14) — höchstens als David-Frage vorlegen, nicht als Bau-Punkt.

#### LM-203 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechtsprechung
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung` · 1440 px — «Strafrecht» wählen, dann «BGer 1283», dabei Adresszeile und Trefferzahl beobachten, danach zurück
- **Beobachtung:** Zwei Filterarten mit unterschiedlichem Verhalten in derselben Filterzeile: Das Sachgebiet schreibt sich in die Adresse (?rg=straf) und erzeugt einen Verlaufseintrag; «Zurück» stellt korrekt 5093 Entscheide wieder her. Instanz, Gemeinwesen, Sprache und Richter:in wirken zwar (5093 auf 1283), erscheinen aber weder in der Adresse noch im Verlauf.
- **Erwartet:** Filter derselben Zeile verhalten sich gleich: entweder alle in der Adresse und im Verlauf oder keiner.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116) — dieselbe Fläche `src/pages/Rechtsprechung.tsx:75`
- **Dedup-Notiz:** Inhaltlich dieselbe Wurzel wie LM-200/LM-206 (nur rg/norm/richter sind URL-Achsen, Rechtsprechung.tsx:111); S1 deckt davon nur die Query-Spiegelung. Zusatzinformation gegenüber LM-200: der Verlaufs-/Zurück-Aspekt (nur `?rg=` erzeugt einen History-Eintrag). Innerhalb der neuen Liste vor Einplanung mit LM-200/206 zu EINEM Punkt bündeln (§14.2).

#### LM-204 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR · /rechtsprechung/<entscheid> · /rechner/zpo-fristen
- **Breite:** 
- **Prüfen:** nacheinander `/gesetze/bund/OR` (scrollen), `/rechtsprechung/<entscheid>` (Abschnittsreiter klicken), `/rechner/zpo-fristen` (Eingaben ändern), `/rechtsprechung` (Filter setzen) — jeweils die Adresszeile beobachten
- **Beobachtung:** Vier Bereiche, vier verschiedene Regeln. Beim Lesen eines Gesetzes ändert sich die Adresse nie; der Hash bleibt auf dem zuerst angesprungenen Artikel stehen, während die Breadcrumb mitläuft. Auf der Entscheidseite schreibt jeder Klick auf «Sachverhalt», «Erwägungen» oder «Dispositiv» einen Hash und einen Verlaufseintrag. Im Rechner ändern Fristlänge, Auswahlfelder und Verfahrensphase die Adresse nicht. In der Rechtsprechungsliste landet nur das Sachgebiet in der Adresse. Schriftgrösse und Farbschema ändern die Adresse zu Recht nicht.
- **Erwartet:** Die Adresse folgt einer erkennbaren Regel: Zustände, die man teilen oder wiederfinden können soll, stehen darin — und zwar überall nach demselben Muster.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Scroll-Hash-Sync verworfen) + §2/S1 + §1/N0d·J5 (`?ansicht=` gebaut) · FAHRPLAN-GESETZES-UX.md §11.4 (Migrations-/Redirect-Regeln, «kein 301») · FAHRPLAN-UI-QUALITAET.md §3
- **Dedup-Notiz:** Dach-Befund über vier Einzelbefunde (LM-199/200/202/205/209/210); im Bestand existieren die Teilregeln verstreut, aber keine geschriebene übergreifende URL-Doktrin. Wichtig für die Bau-Session: mindestens zwei der «Uneinheitlichkeiten» sind dokumentierte Entscheide (kein Hash-Sync im Gesetz-Leser §Z-7; Rechner-Permalink erst auf Knopf, s. LM-205) — eine Vereinheitlichung darf sie nicht stillschweigend überschreiben.

#### LM-205 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechner/zpo-fristen
- **Breite:** 1440 px
- **Prüfen:** `/rechner/zpo-fristen` · 1440 px — Eingaben ändern, Adresszeile beobachten, dann «Link teilen» drücken
- **Beobachtung:** Der Rechenzustand steht erst nach dem Drücken von «Link teilen» in der Adresse. Vorher zeigt sie nur «/rechner/zpo-fristen», danach den vollständigen Permalink mit elf Parametern («?e=…&u=tage&l=10&v=…&k=ZH&n=gesetzlich&z=…&m=…&ea=0&el=10&eu=tage»). Ein Neuladen oder ein Lesezeichen vor diesem Klick verliert die Eingaben.
- **Erwartet:** Was gerechnet wird, steht in der Adresse — ohne dass man erst einen Knopf dafür drücken muss.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** NEIN
- **Dedup-Referenz:** —
- **Dedup-Notiz:** Kein Bestands-Zwilling. Code-bestätigt und als Absicht dokumentiert: LinkTeilenButton.tsx:4–7/22 schreibt den kodierten Fall erst beim Klick per `navigate({search}, {replace:true})` — Kommentar «keine History-Flut»; die Rechner lesen den Permalink beim Mount (z. B. ZpoFristenForm.tsx:74–76). Zielkonflikt, den der Bau bewerten muss: laufendes URL-Schreiben legt Falldaten dauerhaft in Adresse/History ab (ROADMAP.md Z. 68: «Werkzeuge bleiben strikt zustandslos»).

#### LM-206 · 2 Hoch

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechtsprechung?richter=muller-c
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung?richter=muller-c` · 1440 px — Seite neu laden und die Filterreihen mit dem Zustand vor dem Neuladen vergleichen
- **Beobachtung:** Nach dem Neuladen ist die Richter-Auswahl wiederhergestellt und die Karten-Ansicht ebenfalls, der zuvor gesetzte Gemeinwesen-Filter «BS» dagegen nicht, und die Klappe «Erweiterte Filter» ist wieder zu. Der wiederhergestellte Zustand ist ein Ausschnitt des vorherigen, ohne dass die Seite darauf hinweist.
- **Erwartet:** Nach dem Neuladen steht entweder der ganze Zustand oder erkennbar keiner.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116, URL-Zustand der Rechtsprechungs-Recherche) · §8-Ehrlichkeit als Bau-Kriterium (§0 Ziff. 4)
- **Dedup-Notiz:** Gleiche Wurzel wie LM-200/LM-203 (Rechtsprechung.tsx:103–111: nur rg/norm/richter in der URL, `rest`/Klappe/Dichte lokal). Eigenständiger Zusatz: die stille Teil-Wiederherstellung ohne Hinweis ist ein §8-Punkt. Mit LM-200/203 bündeln.

#### LM-207 · 3 Mittel

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR` · 1440 px — zwölfmal hintereinander um je 1400 px scrollen
- **Beobachtung:** Die Darstellung blockierte dabei so lange, dass eine Auswertung nach 45 Sekunden abbrach; danach war die Seite wieder bedienbar. Die Dokumenthöhe beträgt mit vollständig aufgeklappter Gliederung 825'978 px.
- **Erwartet:** Zügiges Scrollen durch ein grosses Gesetz blockiert die Darstellung nicht.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** ROADMAP.md QS-PERF (@meta Z. 191, status wip) — offene Posten «Der Artikel-Suchindex kostet ~28.5 s Main-Thread-Aufbau» (Z. 213 f.) und «OR-LCP ist bimodal — Ursache offen» (Z. 205 f.); Vorbild-Aufklärung «bimodaler ~48-s-Stall» (Z. 208–212, PR #382) · FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 2 (DOM-entfernende Virtualisierung von Normtext VERBOTEN, CLAUDE.md §15.1) · FAHRPLAN-GESETZES-UX.md §10.9 A2/A9-DoD (Scroll unter CPU-Throttle flüssig, belegt)
- **Dedup-Notiz:** Gehört messtechnisch in QS-PERF, nicht in die UI-Navigations-Welle; die 45-s-Blockade passt zum offenen Main-Thread-Posten des Suchindex. Zwingende Leitplanke für jeden Fix: keine Windowing-/Virtualisierungslösung für Normtext (§15.1) und Verteilung statt Einzelwert messen.

#### LM-208 · 3 Mittel

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /gesetze/bund/OR#art-367
- **Breite:** 1440 px
- **Prüfen:** `/gesetze/bund/OR#art-367` · 1440 px — Entscheid-Chip anklicken und die Entscheidseite auf einen Hinweis zur Herkunft prüfen
- **Beobachtung:** Die Adresse trägt den Parameter «?norm=Art. 367 OR», die Entscheidseite zeigt ihn aber nirgends: kein Hinweis, über welche Norm man gekommen ist, und keine Markierung der Fundstelle im Entscheidtext. Man landet in einem 24'000 Zeichen langen Urteil und muss die Stelle selbst suchen.
- **Erwartet:** Wer über eine Norm auf einen Entscheid kommt, sieht auf der Entscheidseite, welche Norm das war, und findet die Fundstelle im Text.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 / §10.9 A17 (Split-View bzw. Entscheid öffnet direkt an der Fundstelle) · FAHRPLAN-UI-NAVIGATION.md §3/V3 (Z. 242–244: «Entscheid-Link trägt bereits `?norm=` und landet seit A17 an der Fundstelle — nicht doppeln»)
- **Dedup-Notiz:** Teil-widerlegt: der Fundstellen-SPRUNG ist gebaut (EntscheidLeser.tsx:307–336, `ersteFundstelle` inkl. i.V.m.-Kette; ohne auflösbare Fundstelle bewusst ehrlicher Seitenanfang, §8). Offen und nicht im Bestand: der sichtbare HERKUNFTS-Hinweis («über Art. 367 OR gekommen») und die Markierung der Fundstelle im Text. Nur diesen Delta-Teil einplanen, sonst A17-Doppelbau.

#### LM-209 · 3 Mittel

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechtsprechung/<entscheid>
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/<entscheid>` · 1440 px — nacheinander «Sachverhalt», «Erwägungen» und «Dispositiv» anklicken, dann dreimal zurück
- **Beobachtung:** Jeder Klick auf einen Abschnittsreiter erzeugt einen Verlaufseintrag (#abschnitt-erwaegung, #abschnitt-dispositiv). Drei Klicks bedeuten drei Mal «Zurück», bevor man wieder beim Gesetz ist — während die eigentliche Leseposition im Gesetz gar nicht im Verlauf steht.
- **Erwartet:** Der Verlauf bildet Ortswechsel ab, nicht das Umschalten zwischen Abschnitten derselben Seite.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (History-/Hash-Politik, verworfener Scroll-Hash-Sync) · §1/N0d·J5 (Z. 94–95: Tab-Klick schreibt `?ansicht=voll|auszug` zurück — gebaut, mit `replace`)
- **Dedup-Notiz:** Kein Zwilling für die Abschnitts-Sprungchips. Fundstelle: EntscheidLeser.tsx:410–417 (`navZiele` → Anker `abschnitt-…`); die `?ansicht=`-Spiegelung nutzt bereits bewusst `{replace:true}` (Z. 253) — dasselbe Muster wäre der naheliegende Fix. Verzahnt mit LM-199 (Verlaufs-Ökonomie des Rückwegs ins Gesetz).

#### LM-210 · 3 Mittel

- **Bauteil:** K-20 · Verlauf und Zustand in der URL
- **Route:** /rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7
- **Breite:** 1440 px
- **Prüfen:** `/rechtsprechung/bs_sozialversicherungsgericht_AH.2025.7` · 1440 px — «Lesemodus» öffnen und die Adresszeile lesen
- **Beobachtung:** Der Lesemodus verändert die Adresse nicht. Ein Verweis auf die Leseansicht lässt sich nicht weitergeben, und ein Neuladen im Lesemodus führt zurück auf die normale Ansicht.
- **Erwartet:** Eine Ansicht, die den ganzen Bildschirm einnimmt, ist in der Adresse benannt.
- **Status:** offen
- **Bemerkung:** —
- **Dedup-Triage 31.7.2026:** VERDACHT
- **Dedup-Referenz:** FAHRPLAN-UI-NAVIGATION.md §1/N0d·J5 (Z. 94–95, `?ansicht=voll|auszug` in die URL zurückgeschrieben — gebaut 11.7.)
- **Dedup-Notiz:** Gleiches Muster (Ansichts-Zustand in der Adresse), andere Steuerung: der Lesemodus ist reiner lokaler State (EntscheidLeser.tsx:213 `useState(false)`, Overlay ab Z. 642/656). Kein Bestandseintrag verlangt oder verbietet die URL-Spiegelung des Lesemodus; beim Bau die a11y-Auflage beachten (Lesemodus-Dialog mit Fokusfalle, FAHRPLAN-SEO-A11Y-GOVERNANCE.md W1.7).

---

## Sheet «Bauteile»

Bauteil-Pakete

Geschnitten nach berührtem Bauteil, nicht nach Bildschirmbereich. Ein Paket sollte in eine Session passen.

| Paket | Bauteil | Befunde | Blocker/Hoch | offen | erledigt | Umfang |
|---|---|---|---|---|---|---|
| K-01 | Klebende Leisten | 7 | 6 |  |  | Kopfleiste, Breadcrumb-Leiste, Reiter-Kopfzeile, schwebende Werkzeugleiste — alles, was beim Scrollen stehen bleibt. |
| K-02 | Overlays und Menüfenster | 13 | 7 |  |  | Such-Overlay, Sprach-, Verlaufs-, Reiter-, Ansicht- und Rechtsprechungsmenü — Verankerung, Schliessverhalten, Verdeckung. |
| K-03 | Menüinhalt und Zustandsanzeige | 6 | 2 |  |  | Wie ein Menü seine Schalter, Zustände, Zahlen und Erklärungen darstellt. |
| K-04 | Karten | 13 | 4 |  |  | Erlass-, Rechner-, Vorlagen-, Material- und Ergebniskarten: Zeilenstruktur, Verankerung, Höhen. |
| K-05 | Chips und Badges | 12 | 4 |  |  | Normverweis, Statusbadge, Metadatum, Entscheid-Chip, Symbole daran. |
| K-06 | Umschalter, Tabs und Akkordeons | 9 | 2 |  |  | Segmentschalter, Sortierumschalter, Verfahrensphasen, aufklappbare Bereiche. |
| K-07 | Scrollbereiche | 5 | 3 |  |  | Horizontal scrollende Reihen und Tabellen, Kanten, Scrollhinweise. |
| K-08 | Eingabe- und Auswahlfelder | 18 | 4 |  |  | Höhe, Breite, Beschnitt, Beschriftung, Datumsfelder, Platzhalter. |
| K-09 | Schaltflächen und Aktionen | 17 | 3 |  |  | Varianten, Hierarchie, Aktionen ohne Button-Look, Deaktiviert-Zustand, Trefferflächen. |
| K-10 | Normzitate und Artikelnummern | 7 | 5 |  |  | Alles, was eine Fundstelle bezeichnet. |
| K-11 | Zahlen-, Datums- und Zählformate | 14 | 3 |  |  | Tausendertrennung, Prozent, Datumsschreibweise, Zählweisen. |
| K-12 | Textsatz und Umbruch | 14 | 3 |  |  | Zeilenlänge, Silbentrennung, Wortbruch, Kleinsttext, Spaltenkanten. |
| K-13 | Seitengerüst und Inhaltsbreite | 10 | 2 |  |  | max-width-Stufen, Raster, Leerräume, Footer. |
| K-14 | Leseansicht Gesetz | 13 | 7 |  |  | Gliederung, Fussnotenapparat, Standangaben, Chronologie. |
| K-15 | Fehler-, Leer- und Ladezustände | 14 | 10 |  |  | Was die Seite zeigt, wenn nichts oder etwas Falsches da ist. |
| K-16 | Druckausgabe | 1 | 1 |  |  | @media print. |
| K-17 | Farbschema und Kontrast | 3 | 2 |  |  | Hell/Dunkel/Automatisch, Kontrastwerte. |
| K-18 | Reiter- und Split-Ansicht | 4 | 1 |  |  | Mehrere Dokumente nebeneinander, Reiterverwaltung. |
| K-19 | Navigation und Seitenmeta | 18 | 4 |  |  | Breadcrumb, mobiles Menü, Seitentitel, Suchtreffer-Relevanz. |
| K-20 | Verlauf und Zustand in der URL | 12 | 8 |  |  | Vor und Zurück im Browser, Scrollposition, was in der Adresse steht und was nicht. |

Total

Nach Priorität

| Priorität | Anzahl | offen |
|---|---|---|
| 1 Blocker |  |  |
| 2 Hoch |  |  |
| 3 Mittel |  |  |
| 4 Detail |  |  |


## Sheet «Belege & Positives»

Belege aus dem ausgelieferten Bundle

Beobachtungen im ausgelieferten Stylesheet — zum Bestätigen oder Widerlegen, nicht als Vorgabe.

.lc-glass ist definiert als background: color-mix(in oklab, var(--paper) 96%, transparent) – also 4 % Transparenz.

Der einzige nennenswerte @media-print-Block lautet: header, footer, nav, button, .lc-btn, .lc-live { display: none !important }. Die Verfahrensphasen-Leiste besteht aus <button>-Elementen, die Akkordeon-Köpfe tragen .lc-btn – beides verschwindet dadurch im Ausdruck. Ausgeklappt werden <details>-Elemente durch CSS ohnehin nicht.

Ein Token --control-h: 44px existiert. .lc-btn setzt height: 44px fest verdrahtet, nicht über das Token. .lc-input und .lc-select setzen gar keine Höhe, sondern padding: 12px 14px bei font-size: 1rem / line-height: 1.5rem – daraus ergeben sich die gemessenen 50 px, bei nativen Datumsfeldern 52 px. .lc-input-sm und .lc-btn-sm liegen bei 36 px (= --pill-h).

.lc-select setzt padding-right: 38px für das Chevron. Die gemessenen Varianten 44 px und 56 px stammen aus Überschreibungen ausserhalb der Komponentenklasse.

.lc-scroll-x setzt ausschliesslich scrollbar-width und scrollbar-color – es gibt keinen Verlauf und keinen Scroll-Hinweis an den Rändern.

Es existieren bereits .lc-btn, .lc-btn-primary, .lc-btn-outline, .lc-btn-ghost und .lc-btn-sm. Die gemessenen 34 Varianten entstehen also nicht aus fehlenden Komponenten, sondern daraus, dass sie an vielen Stellen umgangen werden. Dasselbe gilt für .lc-input, .lc-select, .lc-card, .lc-chip, .lc-badge-* und .lc-notice-*.

Eine Skala --space-1/2/3/4/6/8/12/16/24 (4–96 px) und --radius-sm/md/lg/xl/2xl (4/8/12/16/24 px) sind vorhanden. Die gemessenen 52 Padding-Werte und Zwischengrössen wie 6.4 px liegen ausserhalb dieser Skala.

Vorhanden sind .lc-chip, .lc-chip-entscheid, .lc-chip-geltend, .lc-chip-vorbehalt sowie .lc-badge-entwurf, -massgeblich, -ok, -warn, -danger, -soft. Die visuelle Ununterscheidbarkeit entsteht durch nahezu gleiche Flächen- und Rahmenwerte, nicht durch fehlende Klassen.

.lc-chip hat min-height: 24px. Die Kopiersymbole neben den Entscheid-Chips liegen bei 16 px.

Was funktioniert

Tastaturbedienung — 40 durchgetabbte Stationen, keine einzige ohne sichtbaren Fokus – durchgehend 2 px goldener Outline, plus ein «Zum Inhalt springen»-Link an erster Stelle. Besser gelöst als bei den meisten vergleichbaren Seiten; beim Umbau der Buttons (Nr. 31) nicht verlieren.

Farbpalette Hellmodus — Bis auf die kleinen Hilfetexte (Nr. 43) kontrastseitig sauber; nur zwei Schriftfamilien im Einsatz.

Fehlerprüfung — Die Rechner fangen ungültige Eingaben inhaltlich korrekt ab – nur die Darstellung des Fehlers ist das Problem (Nr. 20).

Bewegungsreduktion — prefers-reduced-motion ist umgesetzt: Übergänge und Animationen werden auf 0.001 ms gesetzt, .lc-reveal, .lc-route und .lc-wert-puls werden abgeschaltet, details::details-content bekommt transition: none.

Schriftskala — Die eingebaute Vergrösserung bis 140 % erzeugt keinen horizontalen Overflow, und der A+-Button ist am Maximum korrekt ausgegraut (Beschnitt siehe Nr. 75).

Seitenleiste einklappen — Funktioniert sauber, der Inhalt zentriert sich neu, keine Sprünge.

404-Inhalt — Eigene Gestaltung mit drei sinnvollen Einstiegen statt einer leeren Fehlermeldung (Titelproblem siehe Nr. 74).

Lange Eingaben — Sehr lange Partei- und Adressangaben brechen in der Vorlagen-Vorschau sauber um, ohne Überlauf.

Artikelanker — Sprungziele haben scroll-margin-top: 100px – genau die Höhe der klebenden Leisten. Ein Direktsprung auf einen Artikel landet sauber unter der Werkzeugleiste, nicht dahinter.

Silbentrennung im Gesetzestitel — Auf 531 px wird der Titel mit Trennstrich umbrochen («Ergän-zung»). Das ist die Behandlung, die dem Vorlagen-Titel aus Befund 6 fehlt.

Suche im Gesetz — Sie filtert schnell und zuverlässig, mit ✕ zum Leeren – die Schwäche liegt allein in der Rückmeldung (Befund 87).

A–Z-Register — Buchstaben ohne Treffer (Q, X, Y) sind ausgegraut statt ins Leere zu führen.

Split-Ansicht an sich — Zwei Gesetze nebeneinander, unabhängig scrollbar, mit eigener Werkzeugleiste je Reiter und einer Reiterverwaltung nach Gruppen – funktional das stärkste Stück der Anwendung.

Verweise im Gesetzestext — Querverweise wie «Artikel 269c» sind tatsächlich verlinkt und gepunktet unterstrichen; der Schalter «Verweise» im Ansicht-Menü wirkt.

Gliederung folgt der Leseposition — Beim Scrollen wandert die Markierung in der Gliederung mit und der Kasten scrollt automatisch nach.

Fussnotenmarken im Text — Sie sind hochgestellt und goldfarben und dadurch im Fliesstext gut auffindbar (die Gegenseite in der Fussnotenliste passt allerdings nicht dazu, siehe Befund 109).

