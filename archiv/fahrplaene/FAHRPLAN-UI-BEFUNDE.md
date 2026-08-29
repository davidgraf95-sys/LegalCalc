# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-UI-BEFUNDE.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

---

## §1 · Triage-Ergebnis 31.7.2026

### §1.0 · Herkunft der Sichtprüfung (aus `ROADMAP.md` verschoben 31.7.2026)

*Wörtlicher ROADMAP-Wortlaut, QS-TOK-Nachdiät 31.7.2026 — die ROADMAP führt den Schritt
seither nur noch mit Triage-Zahlen und Pointer hierher:*

> Externe Cowork-Sichtprüfung über ~45 Seiten, Breiten 390–2560 px, hell/dunkel, Druck, Tastatur,
> 140 % Schriftskala; geschnitten nach Bauteil K-01…K-20. **Dedup-Triage 31.7.2026** (7 Opus-Agenten
> gegen den Bestand): **45 NEIN · 144 VERDACHT · 15 BEREITS-GEBAUT · 6 SICHER** — die 6 SICHER werden
> **nicht** neu eingeplant (LM-202 war eine **David-Frage**, entschieden 3.8.2026 — s. §1.1: der
> Bestand hat den Scroll-Hash-Sync bewusst verworfen, `FAHRPLAN-UI-NAVIGATION.md` §Z Ziff. 7).
> **20 Batches** — 19 Bau-Batches mit
> 7–16 baubaren Befunden (189) + 1 Prüf-Batch (15). Wortlaut: `docs/ui-befunde-2026-07/`.

210 Befunde, geprüft von 7 Opus-Agenten gegen den Bestand (Fahrpläne, Code, Abnahme-Berichte):

| Marke | Anzahl | Bedeutung |
|---|---:|---|
| **NEIN** | 45 | kein Bestandsbezug gefunden — Neubau |
| **VERDACHT** | 144 | Bestandsbezug vorhanden, aber nicht deckungsgleich — Referenz vor dem Bau lesen (§0.2) |
| **BEREITS-GEBAUT** | 15 | im Code nachweisbar gebaut — «Prüfung wiederholen, dann erledigt» (letzter Batch) |
| **SICHER** | 6 | deckungsgleich mit einem bestehenden Posten — **kein Neubau** (unten) |

**Baubar eingeplant: 189** (NEIN + VERDACHT) in 19 Bau-Batches · **15** im Prüf-Batch ·
**6** hier abgehandelt und in keinem Batch.

### §1.1 · SICHER — wird NICHT als Neubau eingeplant

Je Eintrag: Referenz aus dem Bestand + der Ein-Zeilen-Grund, warum kein Neubau.

- **LM-020** (Mittel, K-02) — gemischte Richternamen-Formen: identischer Defekt an derselben Stelle; `W2·6-RESOLVER`
  (vormals `W2·6-RNAME`, Etiketten-Konsolidierung 15.8.2026) hat
  dafür bereits eine verbindliche Regel (Auflösung nur bei Eindeutigkeit, Kollisions-Report,
  Risikopfad nach dem #309-Vorfall). Dort abarbeiten, nicht doppelt einplanen.
  Referenz: `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md §6 «Richternamen gegen den Staatskalender auflösen»; ROADMAP.md → @meta W2·6-RESOLVER`
- **LM-104** (Hoch, K-10) — «SR»-Präfix an kantonalem Erlass: identische Stelle
  (`src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx`), im Bestand als **F28** mit
  Snapshot-Tor geführt. Als F28 abarbeiten.
  Referenz: `FAHRPLAN-KANTONE.md Z.81 §c: «F28 «SR»-Label (ErlassLeserKopf.tsx:37): bei ebene='kanton' Präfix weg (SAR/LS/BLV/GS tragen ihr Kürzel selbst). Ein-Zei…`
- **LM-140** (Mittel, K-13) — Methodik-Seitenhöhe: der Fix ist als **D3** bereits gebaut (10 470 → 5 977 px), die Liste
  ist seither gewachsen (69 → 78 Karten). Also D3 nachmessen und um den Rest ergänzen, den
  D3 nie adressiert hat (Gruppierung/Aufklappen) — kein neuer Posten.
  Referenz: `abnahme/responsive-audit/BERICHT.md Defekt D3 («methodik | 2560 | Inhalts-/Pflege-Listen bleiben eine schmale Einzelspalte → Seite wird ~10 470 px hoc…`
- **LM-144** (Detail, K-13) — toter Rand @2560: identischer Befund, bereits verdiktet als **bewusste Lesbreite** (§13.2)
  und ausdrücklich NICHT als 20 Einzelbugs. Neu ist allein die Variante «Chrome auf
  Inhaltsbreite begrenzen» — das wäre ein Design-Entscheid, kein Defekt.
  Referenz: `abnahme/responsive-audit/BERICHT.md §Gesamtbefund («Ultrawide @2560 nutzt durchgängig eine zentrierte max-width-Spalte — bewusste Lesbreite §13.2») +…`
- **LM-150** (Hoch, K-14) — In-Gesetz-Suche ohne Treffer-Hervorhebung: deckungsgleich mit dem offenen **R1**, dort
  einlaufen lassen. **Achtung Bau-Session:** das Highlight IST gebaut (A35), aber über die
  CSS Custom Highlight API — eine DOM-Messung auf `<mark>` findet es nicht.
  Referenz: `FAHRPLAN-UI-NAVIGATION.md §4 R1 («In-Gesetz-Suche: Treffer-Highlight … <mark>-Hervorhebung in den gefilterten Artikeln + Trefferzahl je Artikel + Vor/…`
- **LM-202** (Hoch, K-20) — **David-Entscheid 3.8.2026: URL nur bei explizitem Klick/Teilen
  aktualisieren.** Der kontinuierliche Scroll-Hash-Sync bleibt verworfen (Kollision mit der
  empirisch begründeten A16-Architektur, Perf-/History-Falle bestätigt); Ersatzweg ist R3
  (Zitat + Permalink, `W2·10-UI-NAV-R2`). Neuer, eigener Bau-Punkt für den expliziten
  Klick/Teilen-Weg: `W2·10-UI-NAV-URL` (ROADMAP.md).
  Referenz: `FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Z. 545–547): «Kontinuierlicher Scroll-Hash-Sync in der URL (#13-Teil) — kollidiert mit der empirisch begründeten…`

  > **Stand — Ist-Aufnahme + Bau 4.8.2026 (`W2·10-UI-NAV-URL`).** Ein laufender
  > Scroll→URL-Sync war **nicht vorhanden und musste darum nicht zurückgebaut
  > werden** — der Auftrag hatte ihn als möglich unterstellt, der Code trug ihn
  > nie. Belegt an allen drei Scroll-Pfaden des Lesers: `inhalt-hooks.tsx`
  > schreibt den Leseort in die In-Memory-Registry (`scrollAnker.ts`) und
  > entprellt in den Reiter-Tracker (`lib/tabs.ts` → localStorage),
  > `App.tsx` in die Positions-Map; keiner ruft eine History-API. Der irreführend
  > benannte `src/lib/liveUrlSync.ts` betraf nie den Leser, sondern den
  > Rechner-Permalink (LM-205, Eingabe-Entprellung).
  >
  > **Gebaut wurde die zweite Hälfte des Entscheids: die Teilen-Aktion.** Der
  > «Link»-Knopf am Artikel (R3) kopierte den Permalink, ohne die Adresse
  > mitzuziehen — reproduziert 4.8.2026 (Zwischenablage `#art-31`, Adressleiste
  > blieb `#art-5`). Genau das ist die LM-202-Beobachtung «Adresse `#art-257_d`,
  > Breadcrumb Art. 400». Der Teilen-Klick setzt den Anker jetzt per
  > `replaceState` auch in die Adresse. Beweise: `e2e/leser-adresse-lm202.e2e.ts`
  > (15 Scroll-Schritte ⇒ URL byte-identisch · Anker-Klick ⇒ `#art-N` ohne
  > Verlaufs-Spam · Teilen ⇒ kopierte URL == Adresse · Deep-Link unverändert)
  > + `src/tests/leser-adresse-lm202.test.ts` (Quellen-Sonde gegen einen
  > wieder eingezogenen Scroll-Sync; beide Tore einmal rot gezeigt, §6.7).
  >
  > **§9-Bug-Check 4.8.2026 — zwei Lücken vor dem Merge geschlossen:**
  > **(B1)** Die Teilen-Grenze hiess `!imPane`. Falsch: `Shell.tsx` montiert im
  > Split-View AUCH das primäre Pane mit `imPane: true` — unterschieden wird nur
  > über `rolle`. Der Knopf schwieg damit im Split auf BEIDEN Seiten, während
  > `springeZuArtikel` im primären Pane weiterschrieb; das LM-202-Symptom
  > überlebte genau in der Ansicht, für die gebaut wurde. Reproduziert, dann auf
  > `!istSekundaer` gezogen — dieselbe Grenze wie `springeZuArtikel` (§5).
  > **(B2)** Der Permalink war handgebaut, die Adresse lief über `urlMitHash`.
  > Bei **54** Artikel-Token mit Leerzeichen/Halbgeviert (gezählt über
  > `public/normtext/**`; z. B. BS-215.400 «22 a», AR-233.3 «36–42») liefen Kopie
  > («#art-22 a») und Adresse («#art-22%20a») auseinander — und ein Leerzeichen
  > im Permalink bricht die Auto-Verlinkung in Mail/Chat. Jetzt EINE Kodierung.
  > Kein Golden trug den alten Roh-Permalink; `golden:vergleich` blieb byte-gleich.
  >
  > **Vermerkt, nicht gebaut (Fundstellen für den Plan):**
  > - **B3** — das `?r=`-Verhalten (Adresse behält den Instanz-Diskriminator, der
  >   kopierte Link nicht) ist erklärter Vorsatz; e2e deckt bislang nur den Fall
  >   mit leerer Query ab. Lücke, kein Defekt.
  > - **B5** — `src/components/rechtsprechung/EntscheidBody.tsx:104` schreibt den
  >   Hash handgerollt (`history.replaceState(null, '', \`#${anker}\`)`) und ohne
  >   Pane-Wächter. Vorbestand ausserhalb dieses Deltas; dieselbe Fehlerklasse wie
  >   B1+B2 an einer zweiten Stelle.
  > - **B6** — der ABSATZ-Permalink (`ZitierMarke` in `ArtikelBody.tsx`, gespeist
  >   aus `permalinkBasis` in `ArtikelLeser.tsx`) ist weiterhin handgebaut und
  >   trägt darum bei denselben 54 Token die Roh-Form. Der Artikel-Permalink ist
  >   gefixt, dieser nicht — eine Zeile, aber ausserhalb des Auftragsdeltas.
  >
  > **Nebenbefund für B11 (K-09b, §11), nicht hier gefixt:** die Trefferfläche
  > des «Link»- und des «Zitat»-Knopfs misst 21 × 13 px — weit unter dem
  > 44-px-Mass, das die übrigen A9-Tests anlegen. Der A9-Test hält den
  > gemessenen Ist-Wert als Regressions-Boden fest und behauptet ausdrücklich
  > nicht, das Tap-Ziel sei ausreichend (§8).

---

## §2 · B1 — Chips, Badges und Normzitate (K-05 + K-10)

**16 Befunde** · Blocker 3 · Hoch 3 · Mittel 7 · Detail 3 · `W2·17-UI-BEFUNDE-B1`

**Prod-Re-Audit 2.8.2026: 16/16 reproduziert (12 voll, 4 teilweise); 13 gebaut, 3 zurückgestellt
(Bestands-Entscheide).**

> **Nachtrag 2.8.2026 — David-Entscheid über die drei Zurückgestellten (§0.2 «entweder er trägt,
> oder er wird ausdrücklich und begründet geändert»).** Damit ist keiner der drei mehr «offen ohne
> Adresse»: **LM-048 verworfen** (Bestands-Entscheid W2·7-BEZUG trägt, abgehakt) · **LM-041
> geöffnet** als eigener Schritt `W2·7-VZUI-SACHGEBIET` (nur die Sachgebiet-Achse, deterministisch;
> die Zitier-Rolle bleibt ausdrücklich zu) · **LM-044 geöffnet** als eigener Schritt
> `W2·17-UI-BEFUNDE-N1`, nachdem die Prüfung den DEFER-Grund als **stale Kopie** entlarvt hat
> (§5-Heilung, s. dort). Bau-Stand dieses Batches unverändert: **13 gebaut**; die zwei geöffneten
> Befunde werden **nicht** hier gebaut, sondern in ihren eigenen Schritten.

- [x] **LM-040** · Blocker · Der gewählte Chip unterscheidet sich vom ungewählten nur in der Rahmenfarbe … [Verdacht → DESIGN-REGLEMENT.md F4 «selected» + FAHRPLAN-UI-QUALITAET.md §3(c) Muster-/Zustands-Konsistenz…] — gebaut: `.lc-chip-selected` (gefüllte Fläche + ✓, hell/dunkel), Commit 0844615c4.
- [ ] **LM-041** · Hoch · Der Chip unterscheidet nicht, in welcher Rolle die Norm im Entscheid … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9/B1 Facetten-Datenmodell + §1.2 KantenChip-Dichteregel…] — → **geöffnet per David-Entscheid 2.8.2026 als `W2·7-VZUI-SACHGEBIET`** (nur Sachgebiet, deterministisch aus der amtlichen BGE-Bandnummer; Rolle bleibt zu). Der Bestands-Entscheid (FAHRPLAN-VERZAHNUNG-UI.md §9/B1 + §1.2: Facetten-Modell abschliessend definiert, Dichte-Regel EIN Zusatz je Chip) wird nicht still gekippt, sondern ausdrücklich um EINE Dimension erweitert — Nachtrag dort, Spec in §12 derselben Datei. Die Zitier-**Rolle** bleibt zu: nicht deterministisch ableitbar (§2).
- [x] **LM-044** · Mittel · Normverweis, Statusbadge («Entwurf», «Zu unterzeichnen»), Standangabe, Sprache, Instanz und Gemeinwesen sehen … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 (Z.1429: «NormChip/Materialien (DEFER, U-VERWEIS-Kollisio…] — **erledigt durch N1** (Element-Art-Achse), Commit `cffda92e0`; Metadatum-Achse bleibt bei `W2·10-UI-NAV`. → **geöffnet per David-Entscheid 2.8.2026** (U-VERWEIS-Prüfung: Sperrgrund seit 10.7.2026 weg — `#170` gemergt `7f6b9a17b` —, C-3 war am 11.7.2026 gebaut `13fee95ed`; der DEFER-Vermerk in FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 war eine **stale Kopie**, §5-geheilt) → **`W2·17-UI-BEFUNDE-N1`** (§23).
- [x] **LM-045** · Mittel · Fünf gleich aussehende Chips sind drei verschiedene Dinge: «↗ geltende Fassung» … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 A25/C-2 (Currency-Tonung) + src/index.css:699–700 (`.lc-chip-geltend`/`.lc-chip-vorbehalt`); Code src/pages…] — gebaut zusammen mit LM-046/LM-047: Chip-Grammatik (Link/Knopf/Angabe) über Container-Klasse `lc-chip-zeile`, Commit fd68383da.
- [x] **LM-046** · Mittel · Der Chip sieht wie die naheliegendste Aktion aus, ist aber ein … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §X «Fassungsvergleich/Zeitreise» (hart gegated: Fedlex-P1a/b + David-…] — gebaut: Form-Korrektur (kein Linkziel vorgetäuscht), §X-Fassungs-Gate unangetastet, Commit fd68383da.
- [x] **LM-047** · Mittel · Sechs Elemente in einer Zeile, drei Formensprachen: «★ Leitentscheid» (grüne Pille), … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.2/§1.3 (KantenChip vs. StatusBadge = zwei bewusste Anatomien) + FA…] — gebaut: Aktion/externer Link/Angabe an der Container-Klasse `lc-chip-zeile` getrennt, Commit fd68383da.
- [x] **LM-048** · Mittel · Je Verweis ist bereits eine Gewichtung erfasst: im OR 768× Wert … [Verdacht → src/pages/gesetz-leser/parts/BezuegeZeile.tsx:44–51 (Komponente `BezuegeZeile`) + src/lib/rechtsprechung/bezuege.ts:36–45 (Interface `BezugsEintrag`)…] — **erledigt (verworfen) — David-Entscheid 2.8.2026: W2·7-Entscheid bestätigt, wird nicht umgesetzt** (Gegenprüfung Runde 1/B3 + B7: `gewicht:null` = «nicht messbar», R16-Ampel/Treatment-Darstellung bleibt gesperrt). Kein Nachfolge-Schritt, keine Wiedervorlage.
- [x] **LM-049** · Mittel · Der Überlaufhinweis «+2» (bzw. «+5», «+6») steht als blosser Text neben … [neu] — gebaut: «+N weitere» statt reinem Zähler-Text, Commit 0966c0f28.
- [x] **LM-050** · Detail · An den Entscheid-Chips stehen bis zu drei Symbole hintereinander: «★» hinter … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.3 StatusBadge (★ «verliert sein aria-hidden-ohne-Erklärung-Dasein»…] — gebaut: ZeichenLegende als Toggletip ohne `aria-expanded`, B4-Wächtertest 32/32 grün, Commits 5960f032c + 64b80f3ac + 4f7b2a45f.
- [x] **LM-051** · Detail · Beschriftung und Zahl stehen im Text ohne Trenner aneinander: kopiert ergibt … [Verdacht → Code src/components/rechtsprechung/EntscheidFilter.tsx:36–42 (Funktion `FacettenGruppe`)] — gebaut: Trenner-Leerzeichen als eigener Textknoten, Commit 0966c0f28.
- [x] **LM-101** · Blocker · Im Markup steht «Form (Art. 266l–266o OR)». Per text-transform uppercase wird … [neu] — gebaut: 266l/266o nicht mehr uppercase-entstellt, `MietrechtForm.tsx` auf `.lc-overline-soft`, Commit d9af2b128.
- [x] **LM-102** · Blocker · Die Erlasskürzel in den Entscheidkarten sind durchgehend versal gesetzt und verlieren … [neu] — gebaut: `normLabel()` löst via `ERLASS_REGISTER` auf (60 Kürzel korrigiert, u. a. SchKG/StGB/LugÜ), 19 Schreibweisen live gegen Fedlex-SPARQL verifiziert, Commit a0e80f51c.
- [x] **LM-103** · Hoch · Normzitate brechen am Zeilenende um: «Art. 60 Abs. 1 / OR», … [neu] — gebaut: `whitespace-nowrap` in `NormLink`/`ui.tsx`, Bemerkung bleibt umbruchfähig, Commit 5ce64b912.
- [x] **LM-105** · Hoch · Das Zitat steht doppelt untereinander: «BGE 152 V 52 · Bundesgericht … [neu] — gebaut: Aktenzeichen nur bei Abweichung vom BGE-Zitat, Commit 0966c0f28.
- [x] **LM-106** · Mittel · Das Lugano-Übereinkommen wird als «LUGUE» geführt — der Umlaut des amtlichen … [neu] — gebaut zusammen mit LM-102 (dieselbe `normLabel()`/`ERLASS_REGISTER`-Lösung), Commit a0e80f51c.
- [x] **LM-107** · Detail · Hochgestellte «bis» erscheinen in derselben Ansicht in zwei Grössen: 9 px … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E2 = A30 «bis/ter bei 1bis hochgestellt (Fedlex-Referenz)» — geb…] — gebaut: `margLabel`-`<sup>` auf `text-[0.62em]` vereinheitlicht (A30-konform), Commit 89ad3ff67.

**Code-Flächen (grob, aus den Routen):** `src/components/NormText.tsx`, `src/components/NormPopover.tsx`, `src/components/verzahnung`, `src/components/rechtsprechung`, `src/pages/gesetz-leser`.
**Risiko-Klasse:** gemischt — reines UI, ABER die Fundstellen-Beschriftung berührt Norm-Anker (§7/D1).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §3 · B2 — Verlauf und Zustand in der URL (K-20)

**11 Befunde** · Blocker 2 · Hoch 5 · Mittel 4 · Detail 0 · `W2·17-UI-BEFUNDE-B2`

**Prod-Re-Audit 3.8.2026: 11/11 geprüft (8 voll, 2 teilweise, 1 unklar); 10 gebaut, 1
zurückgestellt (QS-PERF).**

- [x] **LM-199** · Blocker · Nach «Zurück» landet man am Anfang des Gesetzes statt an der … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 (U-POSITION = A2+A16+A17) und §10.9 A16 (Z. 1292–1307, «Zu…] — gebaut: verbrauchter Einstiegs-Hash kapert die Zurück-Position nicht mehr (A16-Konvergenzschleife), Commit 2c651e43c.
- [x] **LM-200** · Blocker · Vier Bedienelemente derselben Seite hinterlegen ihren Zustand auf drei verschiedene Arten: … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116: «Rechtsprechungs-Suchbegriff in URL spiegeln (debo…] — gebaut zusammen mit LM-203/LM-206: eine Zustands-Weiche `src/components/rechtsprechung/zustand.ts` (Inhalt→URL, Darstellung→localStorage), Commit 0668af120.
- [x] **LM-201** · Hoch · Beim Wechsel auf eine kürzere Seite bleibt kurzzeitig die alte Scrollposition … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.9 A16 (Z. 1292–1307, anker-basierte Restauration, history.scrollRes…] — gebaut: synchroner Scroll-Reset vor dem ersten Paint beim Routenwechsel ohne Restauration, Commit 75b435823.
- [x] **LM-203** · Hoch · Zwei Filterarten mit unterschiedlichem Verhalten in derselben Filterzeile: Das Sachgebiet schreibt … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116) — dieselbe Fläche src/pages/Rechtsprechung.tsx:75] — gebaut zusammen mit LM-200/LM-206 (dieselbe Zustands-Weiche, §3/zustand.ts): Gleichbehandlung aller Facetten-Achsen hergestellt; LM-203s History-Push-Erwartung bewusst nicht gebaut (Prod-Messung 2.8.2026: `?rg=` erzeugt keinen Verlaufseintrag, Bestand fährt durchgehend `replace` — Beseitigung der Asymmetrie erfüllt den Befundkern, ein Push je Facetten-Klick würde den Rückweg fluten), Commit 0668af120.
- [x] **LM-204** · Hoch · Vier Bereiche, vier verschiedene Regeln. Beim Lesen eines Gesetzes ändert sich … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Scroll-Hash-Sync verworfen) + §2/S1 + §1/N0d·J5 (?ansicht…] — **miterfüllt durch die Systematik der Lose** (Dach-Befund, kein eigener Bau): Kommentar an der Weiche in `zustand.ts` hält fest, welche Zustandsklasse wohin gehört und warum; die drei tragenden Commits, die dieselbe Inhalt→URL/Darstellung→localStorage-Regel über drei Flächen hinweg konsistent anwenden, sind 0668af120 (Rechtsprechungs-Facetten), e9c430e8a (Rechenzustand) und 2ef8ce242 (Lesemodus).
- [x] **LM-205** · Hoch · Der Rechenzustand steht erst nach dem Drücken von «Link teilen» in … [neu] — gebaut: Rechenzustand live in der URL (debounced replaceState, ein Serializer im geteilten `LinkTeilenButton`, gilt für alle Rechner), Commit e9c430e8a.
- [x] **LM-206** · Hoch · Nach dem Neuladen ist die Richter-Auswahl wiederhergestellt und die Karten-Ansicht ebenfalls, … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116, URL-Zustand der Rechtsprechungs-Recherche) · §8-Eh…] — gebaut zusammen mit LM-200/LM-203 (dieselbe Zustands-Weiche, §3/zustand.ts), Commit 0668af120.
- [ ] **LM-207** · Mittel · Die Darstellung blockierte dabei so lange, dass eine Auswertung nach 45 … [Verdacht → ROADMAP.md QS-PERF (@meta Z. 191, status wip) — offene Posten «Der Artikel-Suchindex kostet ~28…] — ⛔ zurückgestellt — QS-PERF-Fläche (@wip), Nachmessung 3.8. abgespeckt negativ; Wiedervorlage nach QS-PERF.
- [x] **LM-208** · Mittel · Die Adresse trägt den Parameter «?norm=Art. 367 OR», die Entscheidseite zeigt … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 / §10.9 A17 (Split-View bzw. Entscheid öffnet direkt an de…] — gebaut: Herkunfts-Hinweis «Aufgerufen über …» + Markierung der wörtlichen Fundstellen; «ff.» bewusst nicht aufgelöst (§1/§8), Commit 4a9690c4e.
- [x] **LM-209** · Mittel · Jeder Klick auf einen Abschnittsreiter erzeugt einen Verlaufseintrag (#abschnitt-erwaegung, #abschnitt-dispositiv). Drei … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (History-/Hash-Politik, verworfener Scroll-Hash-Sync) · §1…] — gebaut: Abschnittsreiter scrollen selbst, Hash per `replaceState` statt History-Push, Commit 960f9b3a2.
- [x] **LM-210** · Mittel · Der Lesemodus verändert die Adresse nicht. Ein Verweis auf die Leseansicht … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0d·J5 (Z. 94–95, ?ansicht=voll|auszug in die URL zurückgeschriebe…] — gebaut: Lesemodus steht als `?lese=1` in der Adresse (teilbar, reload-fest, N0d·J5-Muster), Commit 2ef8ce242.

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/pages/gesetz-leser`, `src/pages/EntscheidLeser.tsx`, `src/pages/Rechtsprechung.tsx`.
**Risiko-Klasse:** reines UI/Navigation — aber History-Architektur (A16), Perf-Falle beachten.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §4 · B3 — Klebende Leisten (K-01)

**7 Befunde** · Blocker 2 · Hoch 4 · Mittel 1 · Detail 0 · `W2·17-UI-BEFUNDE-B3`

- [x] **LM-001** · Blocker · gebaut (8.8.2026, `72e84e441`) — reproduziert (96 %-Deckkraft liess den Seiteninhalt am oberen Rand der Topbar sichtbar durchlaufen); `.lc-glass` volldeckend, `backdrop-filter` entfernt (G2b-Aufschub begründet geschlossen, §0.2).
- [x] **LM-002** · Blocker · gebaut (8.8.2026, `63d6ce8d9`) — reproduziert (`#kontext-titel` ohne scroll-margin-top landete unter der Sprung-Leiste); in dieselbe `.rsp-anker [id]`-Regel aufgenommen.
- [x] **LM-003** · Hoch · gebaut (8.8.2026, `5ba7aa185`) — exakt reproduziert (PaneKopf-Unterkante 101 px, Leiste fixiert auf 109 px); `top: 0` statt `0.5rem`.
- [x] **LM-004** · Hoch · gebaut (8.8.2026, `5ba7aa185`) — dieselbe Stelle wie LM-003 (`data-such-bar`); `shadow-sm` entfernt, liest sich als Fortsatz des PaneKopfs statt als schwebender Kasten.
- [x] **LM-005** · Hoch · gebaut (8.8.2026, `63d6ce8d9`) — reproduziert (reine `.lc-chip`-Anker ohne Scroll-Spy, gemeldete Aktivmarkierung war der :focus-Ring); IntersectionObserver + `.lc-chip-aktuell` ergänzt, tritt bei keinem sichtbaren Abschnitt zurück.
- [x] **LM-006** · Hoch · gebaut (8.8.2026, `72e84e441`) — dieselbe Fläche wie LM-001 (`.lc-glass backdrop-filter`, Repaint-Verdacht laut Dedup-Notiz); mit dem `backdrop-filter`-Entfall mitbehoben, Flash-Artefakt selbst nicht unabhängig nachmessbar (Sandbox ohne GPU-Kompositierung, s. Bau-Bericht).
- [x] **LM-007** · Mittel · gebaut (8.8.2026, `63d6ce8d9`) — B6-Minimalismus-Muster übernommen (`py-1.5`, `groesse="s"`), `--rsp-stick` bewusst grosszügig belassen statt neu vermessen.

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/index.css`.
**Risiko-Klasse:** reines UI (CSS/Layout).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §5 · B4 — Leseansicht Gesetz (K-14)

**12 Befunde** · Blocker 2 · Hoch 4 · Mittel 5 · Detail 1 · `W2·17-UI-BEFUNDE-B4`

- [x] **LM-146** · Blocker · Die Gliederung ist nicht navigierbar. Sie enthält 2299 Einträge, alle als … [Verdacht → src/pages/gesetz-leser/inhalt.tsx:465-497 (springeZuSektion: Pfad öffnen → flushSync → scrollIn…] — **erledigt (überholt)**: am frischen Build nicht reproduzierbar (Playwright-Adhoc: TOC-Sprung scrollt zuverlässig, grosse scrollY-Deltas bei Titel- UND Blattklicks). Zwei bereits gelandete Fixes tragen das: `90df6d494` (Gliederung startet zugeklappt, 5.8.) + `21fe94fc0` QS-E2E-STABIL (zugeklappte Äste waren unsichtbar-klickbar, 7.8.).
- [x] **LM-147** · Blocker · Allein die Gliederung enthält 2887 Tabstopps, die ganze Seite 23'537. Es … [Verdacht → src/pages/gesetz-leser/parts/SektionBaumTOC.tsx:42 (Klappknopf trägt aria-label «Einklappen»/«A…] — **gebaut** (`9014a7bf8`, `4148c5e4d`): aria-expanded am Klappknopf, role=navigation+aria-label an der TOC-`<aside>`, Skip-Link „Gliederung überspringen" → Lesespalte. aria-current/aria-label an den Klappknöpfen waren laut Dedup-Notiz schon vorhanden (bestätigt).
- [x] **LM-148** · Hoch · Links das Inhaltsverzeichnis, rechts unmittelbar daneben dieselbe Struktur nochmals als Dokumentkopf … [Verdacht → src/pages/gesetz-leser/inhalt-volltext.tsx:314-326 (<aside … className="mb-0 sticky flex-col" m…] — **erledigt (überholt/verschoben)**: Sticky-Teil am frischen Build bei 1440px nicht reproduzierbar (Playwright-Adhoc: aside bleibt sticky). Doppelte-Struktur-Teil (TOC-Label ≈ Dokumentkopf-Überschrift) ist inhärentes TOC-Muster (wie Fedlex), keine Regression; eine bewusste Verdichtung/Differenzierung gehört in den Kopfzeilen-Dach-Auftrag `W2·5h-GESETZ-UI` K6 (Grenzauflage §24.1) — dort vorgemerkt, nicht hier gebaut.
- [x] **LM-149** · Hoch · Zwei Trennlinien: eine über der linken Spalte, eine weiter rechts auf … [Verdacht → DESIGN-REGLEMENT-NORMTEXT.md §4b (EINE Linien-Sprache, 3 Rollen-Tokens --guide-gliederung/--rul…] — **gebaut** (`4148c5e4d`): Ingress/Präambel (ErlassKopfBlock) folgt jetzt demselben 16rem+gap-Spaltenrhythmus wie die Lesespalte darunter (leere TOC-Zelle + mx-auto/w-full) — Trennlinien fluchten exakt (Playwright: links=656=656 statt 312≠656 vorher).
- [x] **LM-151** · Hoch · Die Bestandteile der Fussnotenzeile laufen ohne Trennzeichen ineinander: Fussnotennummer, vorangestelltes Datum … [neu] — **gebaut** (`da1af5bec`): explizite Trennzeichen (` · `, `: `) zwischen Nummer/Sortier-Datum/Fussnotentext in der Chronologie-Ansicht (data-hist-chrono) statt reiner CSS-Margin; amtlicher Fussnotentext unangetastet. Exakt am Befund-Beispiel (OR 269d Fn 106) reproduziert und verifiziert.
- [x] **LM-152** · Hoch · Der Kasten ist 256 × 582 px gross, der Inhalt 17'589 … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K1 (W2·5h-GESETZ-UI, Z. 2041-2046) + §17 Intake 24.7.] — **gebaut** (`ed1bb4719`), Tiefen-Teil **verschoben**: der vertikale Tiefen-Teil (K1, Default-Aufklappzustand) ist explizit W2·5h-Territorium (Grenzauflage §24.1) — übersprungen. Der horizontale Überhang (129 px, KontextPanel-Chips mit whitespace-nowrap in der TOC-Spalte) war NICHT durch K1 gedeckt — gebaut: Chips brechen in der `seitenleiste`-Variante jetzt um (scrollWidth==clientWidth verifiziert).
- [x] **LM-153** · Mittel · Die Marke im Text ist hochgestellt und goldfarben; der Eintrag in … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E2/A30+A31 (Z. 1836-1840, gebaut)] — **gebaut** (`4148c5e4d`, `da1af5bec`): Fussnoten-Nummer in Artikel-/Kopf-/Chronologie-Apparat jetzt brass-700 (wie die Marke im Fliesstext) statt ink-500; Baseline/Grösse bewusst unverändert (Lesbarkeit der Liste).
- [x] **LM-154** · Mittel · Verweise auf fedlex sind goldfarben, aber ohne Unterstreichung und ohne Hinweis … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §3 V4 (NormChip-href, «amtlich ↗» als sichtbarer Zweitlink) + FAHRPLA…] — **gebaut** (`6088a4684`): reine Fedlex-Verweise (BBl/AS) im Fussnotenapparat tragen jetzt persistente gepunktete Unterlinie (wie Normverweise im Fliesstext, NormText.tsx) + title-Hinweis auf externen Tab-Wechsel.
- [x] **LM-155** · Mittel · Acht Einrückungsebenen liegen bei 330, 340, 346, 349, 356, 365, 375 … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.9 Entscheid A28 (Z. 1489-1504, gebaut 12.7.) + U-LINIEN/A8 (Z. 890)…] — **NEUBAU gebaut** (`2c64e2c39`, Position `B4-N1`, Freigabe David 8.8.2026 «du darfst neubauen» — revidiert die 12.7.-Abschaltung): Tiefenführung **im Gliederungsbaum**, ohne Linie im Normtext-Körper (A28-Scheiter-Gründe einzeln adressiert: falscher Ort / falsches Mass / aufgedrängt). Drei Mittel — Ebenen-Stimme nach der Sprache, die der Fliesstext schon spricht (`s.randtitel` → Serif-Stimme wie `SektionKopf`), bedeutungsgetragene Schrittweite (amtliche Stufe 0.875 rem, Randtitel-Feinstufe 0.625 rem, gedeckelt), Rhythmus (12 px / 6 px Vorlauf). Gemessen /gesetze/bund/OR @1440: x-Schritte 9.6 px konstant → 14|14|10|10|10|10; unterscheidbare Typo-Signaturen 2 von 7 → 4 von 7; Ebene 1 vs 4 vorher typografisch IDENTISCH → 12/600/Sans gegen 12/400/Serif. A28 (`autoGuide=false`, `data-linien`) unangetastet; golden byte-gleich, axe hell+dunkel grün, Mobil 390 ohne H-Overflow.
- [x] **LM-156** · Mittel · Der aktive Pfad ist allein durch Schriftschnitt markiert: 21 von 2299 … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R2 («Sie sind hier» + markiert, mobiles Sheet) + FAHRPLAN-GESETZES…] — **gebaut** (`9014a7bf8`): die im Code dokumentierte Fläche (bg-brass-100/70) erzeugte real KEINE CSS-Regel (Opazitäts-Modifikator auf CSS-Var-Farbe, siehe Commit) — auf funktionierendes bg-brass-100 umgestellt. Vier-Schriftgrössen-Behauptung nicht reproduzierbar (nur zwei: text-body-s/text-xs).
- [x] **LM-157** · Mittel · Beim frischen Aufruf mit Anker springt der Text korrekt zu Art. … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K5 (Scroll-Ziel/#art--Deep-Links) + FAHRPLAN-UI-NAVIGATION.md §1 N0…] — **gebaut** (`85cefcaf6`): Hash-Seed-Sprung setzt aktivIds/aktArtikel jetzt synchron mit dem Sprung, statt auf den (beim programmatischen Erstsprung unzuverlässigen) Scroll-Spy zu warten. Anderer Defekt als K5 (dort: Sichtbarkeit des Sprungziels selbst).
- [ ] **LM-158** · Detail · Die Standangabe erscheint zweimal gleichzeitig. Auf Mobil belegt die Angabe in … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K6 (Kopfzeile gesamthaft: Elemente/Ordnung/Responsive-Verdichtung)…] — **umgezogen nach `W2·5h-GESETZ-UI` K6**: K6 ist der explizit benannte Dach-Auftrag für genau diese Leiste inkl. Elemente/Ordnung/Verdichtung (Grenzauflage §24.1) — dort zu bauen, Kästchen bleibt darum offen (§22.1).

**Code-Flächen (grob, aus den Routen):** `src/pages/gesetz-leser`, `src/components/NormText.tsx`, `src/components/normtext`.
**Risiko-Klasse:** gemischt — Gliederung/Fussnoten/Standangaben sind §7-nah (Norm, Link, Stand).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §6 · B5 — Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)

**8 Befunde** · Blocker 2 · Hoch 2 · Mittel 3 · Detail 1 · `W2·17-UI-BEFUNDE-B5`

- [x] **LM-173** · Blocker · gebaut — Ursache am Prod-Stand mit computed styles belegt (Rechenweg/Annahmen/Hinweise
  drucken leer: Inhalt bei geschlossenem Akkordeon gar nicht im DOM + Kopf-`<button>` von der pauschalen
  Druck-Regel verschluckt; Phase-Tabs kollabieren auf ~6×6px). Fix: `ErgebnisAnzeige.tsx` erzwingt via
  `matchMedia('print')` den offenen Zustand nur für den Druck, `.lc-druck-kopf`/`.lc-druck-chevron` (index.css)
  halten den Akkordeon-Kopf sichtbar; `Tabs.tsx` blendet die Button-Gruppe im Druck aus und zeigt die Wahl als
  Klartext. Titel/Quelle-Link druckten bereits (Z2-Regel `a[href^=http]::after`). Seitenzahl/Datum bewusst NICHT
  gebaut (Golden-/SSR-Determinismus-Risiko bzw. unverifizierbar mit `page.emulateMedia` — offener Punkt, s. Bericht).
- [x] **LM-174** · Blocker · übersprungen — reproduziert (pristine Zustand bleibt bei dunklem OS-Farbschema hell, — **Umentschieden David 8.8.2026 (System-Schema), gebaut PR #474 (B5-N1)**; 19.6.-Entscheid revidiert.
  computed: `html.className === 'light'`), ABER Befund widerspricht direkt einem dokumentierten Entscheid (Auftrag
  David 19.6.2026, `src/components/thema.ts`: Pristine-Default ist bewusst ZEITbasiert, nicht system-basiert, und
  extra als «Automatisch (Tageszeit)» statt «(System)» gelabelt, damit das UI nichts verspricht, was es nicht
  hält — §8). Explizite Wahl «Automatisch» (nach Klick durch den 3er-Zyklus) folgt dem System korrekt (verifiziert).
  §0.2: nicht still gekippt — Entscheid David nötig, s. Bericht.
- [x] **LM-175** · Hoch · gebaut — Kontrast von Sa/So-Ziffern auf der `bg-brass-100`-Frist-Bande im Dunkelmodus
  gemessen 4.54:1 (computed styles, technisch AA, aber am Rand — «kaum lesbar» plausibel). `FristenKalender.tsx`:
  `text-ink-600` statt `text-ink-500` NUR für `frei && band==='frist'` → 6.79:1; die dokumentierte 25.6.-Kalibrierung
  ausserhalb des Bandes bleibt unberührt. Legenden-Swatch-Farbmismatch NICHT reproduzierbar (Pixel-Sample: Swatch
  und Bande exakt identisch #2C2616 im Dunkelmodus) — vermutlich Wahrnehmungs-Artefakt der Sichtprüfung.
- [x] **LM-176** · Mittel · gebaut — «beide Parteien verpflichtet» auf gewählter `bg-brass-100`-Kachel gemessen
  4.37:1 (computed styles, unter AA). `text-ink-500`→`text-ink-600` (Präzedenz-Muster 25.6.2026) in `VorlageNda.tsx`
  UND — dieselbe Fehlerklasse, mechanisch identisch gefunden — `VorlageWerkvertrag.tsx`, `VorlageArbeitsvertrag.tsx`,
  `VorlageAuftrag.tsx` (Auswahlkacheln mit Hilfetext, §17 Wurzel-Fix statt Einzelfall).
- [x] **LM-177** · Hoch · erledigt (überholt) — Kernaussage «Reiter verschwindet ersatzlos» widerlegt: Playwright-
  Messung zeigt den zweiten Pane per horizontalem Snap-Scroll erreichbar (`scrollWidth` 1800 vs. `clientWidth` 900,
  Scroll bringt ihn vollständig in den Viewport) — B-4 (Commit 3587d1fd) trägt wie dokumentiert (§0.2). Erwartet-
  Kriterium («erreichbar, notfalls über Umschalter») damit erfüllt. Restbefund («kein sichtbarer Hinweis auf ein
  zweites Dokument») real, aber vom Erwartet-Text nicht verlangt — als Anregung im Bericht vermerkt, nicht gebaut.
- [x] **LM-178** · Mittel · gebaut — Ziehgriff war `bg-transparent` im Ruhezustand (nur Cursor erkennbar, belegt).
  `Shell.tsx`: Ruhezustand jetzt `bg-line-strong` (sichtbare, aber dezente Linie); Hover-Ton von `bg-brass-300/60`
  (DESIGN-D0: Deckkraft-Suffix auf opakem Hex-Token erzeugte keine Regel) auf `bg-brass-300` korrigiert.
- [x] **LM-179** · Mittel · gebaut — Ursache exakt lokalisiert: `inhalt-hooks.tsx` unterdrückte die Reiter-Live-
  Positions-Aktualisierung für Sekundär-Panes vollständig (`if (!istSekundaer)`, dokumentiert als bewusste
  Vereinfachung, aber laut Dedup-Notiz als «konkreter Defekt» zur Reproduktion freigegeben). Fix: Guard entfernt,
  `window.location.search` durch pane-eigenes `location.search` (`paneLocationSearch`, neuer Prop analog
  `paneLocationHash`) ersetzt. Playwright-Reproduktion: OR-Reiter vorbelegt mit veralteter `#art-366`-Position,
  nach Scroll im Sekundär-Pane zu Art. 684 aktualisiert sich der Reiter-Eintrag live auf `#art-683`. Der separate,
  deutlich fragilere Seed-Hash-Effekt (A34/A17/LM-199, Zeile ~347) bewusst NICHT angefasst — deckt nicht das
  gemeldete Szenario (Scrollen im bereits offenen Pane) und trägt drei gestapelte Bugfix-Historien.
- [x] **LM-180** · Detail · gebaut (teilweise) — «Alle schliessen» war ein `<button>` ohne Button-Optik (belegt,
  Screenshot); `ReiterUebersicht.tsx` nutzt jetzt `lc-btn-outline lc-btn-sm` (geteilte Button-Familie statt Ad-hoc-
  Stil) statt `hover:bg-paper-sunken/60` (DESIGN-D0, wirkungslos). Die zwei weiteren Teilbefunde NICHT
  reproduzierbar: Icon-Inkonsistenz Gesetze/Rechtsprechung/Rechner (Playwright-Screenshot zeigt Schweizerkreuz UND
  ∑-Pikto gleichermassen sichtbar) und Platzverschwendung beim abgeschnittenen Reiternamen (gemessen: Zeile exakt
  ausgefüllt, kein Slack — `li` 294px = Navigations-Button 216px + vier Aktions-Icons).

**Code-Flächen (grob, aus den Routen):** `src/index.css`, `src/components/layout/Pane.tsx`, `src/components/layout/TabPanel.tsx`, `src/components/layout/ThemaUmschalter.tsx`.
**Risiko-Klasse:** reines UI (CSS/Layout).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §21 · B20 — Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)

**15 Befunde** · Blocker 1 · Hoch 5 · Mittel 6 · Detail 3 · `W2·17-UI-BEFUNDE-B20`

**Prod-Nachmessung 3.8.2026: 13/15 bestätigt, 2 Vorlagen (LM-042 Extraktion, LM-112 David).**

- [x] **LM-011** · Hoch · Die Suche lässt sich per Tastatur öffnen (Strg+K setzt den Fokus … [bereits gebaut → src/components/layout/HeaderSuche.tsx:142–156 + 170–177; src/components/suche/SuchResultate.tsx…] — Prod-Nachmessung 3.8.2026: ArrowDown setzt genau 1 `aria-selected`-Option, Enter navigiert zu `#art-257`, Fokus bleibt im Suchfeld.
- [x] **LM-012** · Hoch · Der Lesemodus öffnet als Dialog mit korrekter Auszeichnung (role=dialog, aria-modal=true, Beschriftung … [bereits gebaut → src/pages/EntscheidLeser.tsx:669–691 (useEffect im LesemodusOverlay)] — Prod-Nachmessung 3.8.2026: Fokus liegt beim Öffnen auf dem ✕-Knopf im Dialog, Tab bleibt in der Fokusfalle.
- [x] **LM-013** · Hoch · «A+» ist im Moment des Öffnens bereits gesperrt (disabled), «A−» nicht. … [bereits gebaut → src/pages/EntscheidLeser.tsx:157–169 (FS_STUFEN, ladeFsIdx) + 232–236 (setFs, localStorage rsp-…] — Prod-Nachmessung 3.8.2026: A− und A+ beim Öffnen beide `disabled=false`, Klick auf A+ hebt `rsp-fs-idx` sauber.
- [x] **LM-017** · Mittel · Beide Panels sind ebenfalls weit links vom Auslöser verankert und überlagern … [bereits gebaut → src/components/layout/ReiterUebersicht.tsx:35–46 + 163; src/components/layout/VerlaufUebersicht…] — Prod-Nachmessung 3.8.2026: beide Panels rechtsbündig exakt am Auslöser (Panel-`right` = Trigger-`right`, 4px darunter).
- [ ] **LM-042** · Hoch · Ein «ff.»-Zitat wird auf mehrere Einzelartikel gebucht: Derselbe Entscheid (Sozialversicherungsgericht BS … [bereits gebaut → src/lib/rechtsprechung/zitat-extraktion.ts:365 (GLIED_KOPF: «Sub-Marker/ff. werden bewusst NICH…] — ⛔ Rest offen — ff.-Marker fehlt im Artefakt, Fix läge in der Zitat-Extraktion (Risiko-Klasse §0.3); als Auflage beim nächsten Extraktions-Schritt (→ ROADMAP `W2·6`, Zeile «Zitationsnetz», Merkposten dort; vormals `W2·6-ZNETZ`, Etiketten-Konsolidierung 15.8.2026).
- [x] **LM-043** · Hoch · Am Verweis ist nicht erkennbar, ob der Entscheid zur geltenden Fassung … [bereits gebaut → FAHRPLAN-VERZAHNUNG-UI.md §V1c «Normrevisions-Ehrlichkeit»; Code src/lib/verzahnung…] — Prod-Nachmessung 3.8.2026: ↻-Chip an Art. 367/370 trägt `aria-label`/`title` mit Revisionsdatum 01.01.2026 + AS 2025 270.
- [x] **LM-062** · Blocker · Die Tabelle wird rechts abgeschnitten, ohne Scrollbereich und ohne Hinweis. Die … [bereits gebaut → src/components/forms/ErbteilungForm.tsx:305 (lc-card p-5 overflow-x-auto) + :307 (table min-w-[…] — Prod-Nachmessung 3.8.2026: `overflow-x-auto` mit `scrollWidth 712 > clientWidth 298`, Pflichtteil-Spalte nach Scroll vollständig sichtbar.
- [x] **LM-092** · Mittel · Der Erklärtext ist gepunktet unterstrichen, aber nicht klickbar, und steht auf … [bereits gebaut → src/components/EntwurfLegende.tsx:33-42; FAHRPLAN-UI-NAVIGATION.md §1 N0d·W3 (✅ gebaut 11.7.202…] — Prod-Nachmessung 3.8.2026: Erklärtext ist `<button aria-expanded>`, Klick öffnet die Toggletip-Karte; `cursor:help` statt Link-Optik.
- [x] **LM-100** · Detail · Zwei Links in derselben Zeile in zwei Stilen: «Kantonale Gesetzessammlungen (lexfind) … [bereits gebaut → src/pages/Gesetze.tsx:538-545 (auch :425-426)] — Prod-Nachmessung 3.8.2026: beide Links identisch gestylt (`text-brass-700`, `no-underline`, 12px), einziger Unterschied der bewusste ↗-Aussenmarker.
- [ ] **LM-112** · Mittel · Das Zählformat wechselt je nach Filterzustand zwischen «LEITENTSCHEIDE 2» und «LEITENTSCHEIDE … [bereits gebaut → src/pages/gesetz-leser/bezugPortion.ts:128 zahlText() + W2·7-BEZUG B7, Commit 5a10f8150 (David…] — ⛔ David-Vorlage — Entscheid 29.7.2026 (zahlText, 5a10f8150) trägt; sichtbare Erklärung der ‹X von Y›-Zählweise wäre Änderungsentscheid.
- [x] **LM-120** · Detail · «Index (Basis Dezember 2020 =100)» — Leerzeichen vor dem Gleichheitszeichen, keines … [bereits gebaut → src/components/forms/TeuerungForm.tsx:164 und :169 (auch :114)] — Prod-Nachmessung 3.8.2026: beide Ergebniskarten zeigen «= 100» mit Leerzeichen vor und nach dem Gleichheitszeichen.
- [x] **LM-128** · Mittel · Der goldene Aufzählungspunkt klebt ohne Abstand am ersten Buchstaben: «•WENDET AN … [bereits gebaut → src/index.css:549-550 — .lc-punkt { … margin-right:.375em; }] — Prod-Nachmessung 3.8.2026: gemessener Abstand Marke→erstes Zeichen 4.13px (`margin-right .375em`), kein Kleben.
- [x] **LM-135** · Detail · Innerhalb einer Zeile wechselt die Schrift: «Eidgenössische Steuerverwaltung · Stand 01.02.2022 … [bereits gebaut → DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel»: «Serif … zitierfähiger Quelltext; Sans a…] — Prod-Nachmessung 3.8.2026: nur `.num`-Elemente (Zahlen/Aktenzeichen) stehen in Geist Mono — Zwei-Stimmen-Regel greift durchgängig, kein Gegenbeispiel.
- [x] **LM-193** · Mittel · Ganz rechts in der Brotkrumenleiste steht ein «×» ohne Beschriftung und … [bereits gebaut → src/components/layout/InhaltsKopf.tsx:154–157 (aria-label/title = «Schliessen (zur Startseite)»…] — Prod-Nachmessung 3.8.2026: ✕ trägt `aria-label`/`title` «Schliessen (zur Startseite)», abgegrenzt vom Lesemodus-✕ mit sichtbarem Text.
- [x] **LM-194** · Mittel · Die Übersicht stellt sämtliche 1549 Detailverweise auf einmal dar, ohne Blätterung … [bereits gebaut → src/pages/Materialien.tsx:73–108 (Behörden-Select, Doktyp-Select, Suchfeld «Titel, Nummer oder…] — Prod-Nachmessung 3.8.2026: Behörde-/Doktyp-Select + Suchfeld filtern wirksam, 1549 → 2 Treffer bei Eingabe «Umstruktur».

> **Nachtrag 3.8.2026 — zwei Neu-Beobachtungen aus der Prod-Nachmessung, keine neuen Schritte:**
> **LM-193-Nachsatz:** eine *sichtbare* Beschriftung des ✕ («zur Startseite») gibt es weiterhin
> nicht, nur über den zugänglichen Namen (`aria-label`/`title`) — sichtbare Beschriftung wäre ein
> neuer Posten, kein B20-Fund. **LM-194-Nachsatz:** ungefiltert rendert `/materialien` alle 1549
> Detailverweise auf einmal, ohne Blätterung/Nachladen — das ist ein §15-/Perf-Posten (Nähe
> QS-PERF), kein Auffindbarkeits-Posten.

**Code-Flächen (grob, aus den Routen):** `src/components`, `src/pages`.
**Risiko-Klasse:** kein Neubau — Nachmessung; nur wenn eine Prüfung fehlschlägt, wird daraus ein Bau-Posten.
**Prod-Re-Audit-Pflicht:** dieser Batch **ist** das Re-Audit — je Befund die Spalte «Prüfen»
am Prod-Stand wiederholen; verschwunden ⇒ abhaken, sonst als Bau-Posten neu aufnehmen.

---

## §22 · Fortschritts-Regel

1. Ein erledigter Befund wird **in seinem Batch-§ abgehakt** (`- [ ]` → `- [x]`), mit
   einem Halbsatz dahinter, was gebaut wurde bzw. warum er überholt war.
   **Drei Erledigt-Formen (Ergänzung 2.8.2026, Anlass LM-048/041/044):** *gebaut* ·
   *erledigt (überholt)* nach §0.1 · **erledigt (verworfen)** — der Befund wird bewusst NICHT
   umgesetzt, weil ein Bestands-Entscheid trägt (§0.2). «Verworfen» wird ebenfalls **abgehakt**,
   mit Entscheid-Datum und Entscheider im Halbsatz; ein unerledigtes Kästchen für etwas, das
   niemand mehr baut, ist eine Unwahrheit im Fortschritt (§8). Wird ein Befund dagegen in einen
   **eigenen Schritt** ausgelagert, bleibt das Kästchen offen und die Zeile nennt die Ziel-ID —
   er ist dann nicht erledigt, sondern umgezogen.
2. Ist ein Batch vollständig abgehakt, wird der ROADMAP-Teilschritt gesetzt:
   `npm run plan:set -- W2·17-UI-BEFUNDE-B<k> status=done` — danach `npm run check:plan`.
3. **Session-Karte Pflicht** (Übergabe-Block: was gebaut, was überholt, was offen blieb).
4. Sind alle Batches done, wird `W2·17-UI-BEFUNDE` selbst auf `done` gesetzt.
5. Der Wortlaut in `docs/ui-befunde-2026-07/` wird dabei **nicht** angefasst — er ist die
   Quelle, nicht der Stand (§5).

---

## §23 · N1 — LM-044-Nachzug: Chip-Grammatik `lc-chip-zeile` ausrollen

**1 Befund (LM-044, Mittel, K-05/K-10)** · `W2·17-UI-BEFUNDE-N1` · reines UI (§3)

**Herkunft.** LM-044 stand in §2 als «⛔ zurückgestellt» mit dem Grund «Bestands-Entscheid trägt:
`FAHRPLAN-GESETZES-UX.md` §10.8 A25/C-3 = ausdrücklich DEFER, U-VERWEIS-Kollision». Die Prüfung
vom 2.8.2026 hat diesen Grund widerlegt: **U-VERWEIS (#170) ist am 10.7.2026 gemergt**
(`7f6b9a17b`), **C-3 selbst am 11.7.2026 gebaut** (`feat/v2-c3`, `13fee95ed`), und die Spec-Heimat
[`FAHRPLAN-GESETZESDARSTELLUNG-V2.md`](FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §2/F5 (C-3-Zeile) sagt
das seit demselben Tag wörtlich («Deferral-Grund weg»). Der DEFER-Vermerk in §10.8 war eine **stale
Kopie** — zwei Wahrheiten über denselben Sachverhalt (§5). Die Kopie ist am 2.8.2026 geheilt
worden; der Bestands-Entscheid, auf den sich die Zurückstellung berief, existierte zum Zeitpunkt
der Zurückstellung schon nicht mehr. **David-Entscheid 2.8.2026: geöffnet.**

**Auftrag (klein, abgeschlossen).** Die in B1 gebaute Container-Klasse **`lc-chip-zeile`**
(`src/index.css:742–755`) auf die übrigen Chip-Reihen ausrollen, damit dieselbe Form überall
dasselbe bedeutet:

- **Fläche a — Filter-Chips Rechtsprechung:** `src/components/rechtsprechung/EntscheidFilter.tsx`
  (Facetten-Knöpfe `FacettenGruppe` :36–42 und die Aktiv-Filter-Chips :275–279 — beides
  `button.lc-chip`).
- **Fläche b — Materialien-/Vorlagen-Routen:** die Chip-Reihen der `src/pages/Materialien.tsx`-
  und Vorlagen-Strecken samt `src/components/vorlagen/NormChip.tsx`.

**Was schon von allein trägt und was nicht (Prüfbefund 2.8.2026, §8).** Es gibt **zwei**
Komponenten namens `NormChip`, und nur eine erbt automatisch:

| Komponente | Element | Verhalten unter `lc-chip-zeile` |
|---|---|---|
| `src/components/vorlagen/NormChip.tsx` (`CHIP_LINK_CLASS`, :48/:50) | `<a>` | **erbt automatisch** die Link-Unterstreichung |
| `src/components/rechtsprechung/NormChip.tsx` (:11) | `<span role="button">` | **erbt NICHTS** — die Grammatik-Selektoren heissen `a.lc-chip` / `button.lc-chip` |

Der `span` ist dort **kein Versehen, sondern begründet** (Kommentar :4–10: der Chip liegt als
Nachkomme in einem Karten-`<a>`; ein `<a>`/`<button>` darin wäre ungültiges Inhaltsmodell). Die
Auftragsannahme «NormChip rendert als `<a>` und erbt automatisch» trifft darum nur auf die
Vorlagen-Variante zu. **Zu entscheiden im Bau, nicht vorher anzunehmen:** entweder die Grammatik
bekommt eine dritte Regel `[role="button"].lc-chip` mit derselben Optik wie `button.lc-chip`
(dann sieht die Aktions-Achse überall gleich aus) — oder die Rechtsprechungs-Karte bleibt
ausdrücklich ausserhalb der Grammatik, mit einer Zeile, warum.

**Ehrliche Abgrenzung (bindend).** Dieser Schritt deckt **nur die Element-Art-Achse**
(Link `a` / Aktion `button` / Angabe `span`). Die **Metadatum-Achse** — also welche Angaben
überhaupt als Chip auftreten dürfen und welche als Fliesstext (Normverweis vs. Statusbadge vs.
Standangabe vs. Sprache vs. Instanz vs. Gemeinwesen, der eigentliche Kern von LM-044) — gehört zu
[`FAHRPLAN-UI-QUALITAET.md`](FAHRPLAN-UI-QUALITAET.md) §3(c) / `W2·10-UI-NAV` und wird hier
**nicht vorgegriffen**. Wer sie hier mitbaut, greift einem anderen Schritt vor (§14.3).

**Sequenz (§12).** Bau erst **nach der Landung von PR #408** (`lc-chip-zeile` entsteht dort — vorher
existiert die Klasse auf `main` nicht) **und PR #409** (Flächen-Überschneidung Vorlagen/Normzitate).
Beides ist eine PR-Landung, keine Plan-ID, und darum als `seq-hart`-Vermerk am `@meta` geführt, nicht
als `dep` — `dep` kennt nur Schritt-IDs.

**DoD.** Golden byte-gleich · CLS 0 · hell/dunkel je Fläche gesichtet · Gegenprüfung `n/a`
(reines UI, kein Risiko-Pfad) · die Grammatik-Entscheidung zum `span[role=button]` steht danach
als Satz in `src/index.css` beim Regelblock, nicht nur im Fahrplan.

### §23 · Stand — **gebaut** (3.8.2026, Commits `cffda92e0` + `a74396601`)

- [x] **Grammatik-Entscheid `span[role=button]`** — Variante 1 der beiden in §23 offen gelassenen:
  die Aktions-Achse wird an der **Rolle** festgemacht, nicht am Tag-Namen. Die Grammatik hat die
  dritte Regel `.lc-chip-zeile [role="button"].lc-chip` bekommen; der role-lose `<span>` bleibt
  unberührt flach. Begründung steht als Satz **in `src/index.css`** beim Regelblock (DoD): am Tag
  festgemacht sähen auf **einer** Seite (`/rechtsprechung`) zwei Bedienelemente gleicher Wirkung —
  Facetten-`button.lc-chip` und Karten-`span[role=button].lc-chip` — verschieden aus; das wäre
  derselbe Befund, nur eine Stufe verschoben.
- [x] **Fläche a — Filterleiste** `EntscheidFilter.tsx` (Facetten-Gruppe + Aktiv-Filter-Chips).
- [x] **Fläche b — Karten/Zeilen** `EntscheidKarte.tsx`, `EntscheidZeile.tsx` (die
  `span[role=button]`-Norm-Chips), `MaterialKarte.tsx` (Stand-Chip bleibt erklärt **flach**),
  `RechnerKopf.tsx`, `ErgebnisAnzeige.tsx` (2 Reihen), `MassgebendeGesetze.tsx`, `wizard.tsx`
  und die drei Vorlagen-Köpfe mit eigener Reihe (GmbH-Gründung, Kapitalerhöhung,
  Kündigung Vermieter). `vorlagen/NormChip.tsx` erbt als `<a>` automatisch — die
  Tailwind-Utility `no-underline` verliert dabei gegen `.lc-chip-zeile a.lc-chip` (Spezifität
  (0,2,1) vs. (0,1,0); Tailwind v3 legt Utilities in keine eigene Kaskaden-Ebene). Am Dev-Server
  gemessen: `text-decoration-line: underline` trotz `no-underline`.
- [x] **Selected-Zustand gehalten** — die Flächen-Deklaration greift nur via
  `:not(.lc-chip-selected)`; ohne das hätte `(0,2,1)` die brass-100-Auswahlfläche von
  `.lc-chip-selected` `(0,1,0)` still weggebügelt. Hell **und** dunkel gemessen
  (hell `#F1E8D6` / dunkel `rgb(44,38,22)` bleiben stehen, Rahmen kommt additiv dazu).
- [x] **CLS 0** — Chip-Höhe unverändert (`min-height: 24px`, `border-box`); der Rahmen liegt
  bewusst **nicht** auf `border-left` (dort sitzt der Zustands-Tick, A25/C-1/C-2).
- [x] **Tore** — `npm run gate` (voll) grün; Golden byte-gleich; `check:gegenpruefung` grün
  (kein Risiko-Pfad, Gegenprüfung `n/a` wie vorgesehen).
- [x] **Tests** — `src/tests/chip-grammatik-n1.test.tsx` (6). Alle drei Wächter einmal **rot**
  gezeigt (§6.7): `:not()`-Guard entfernt → rot · `[role=button]`-Selektor entfernt → rot ·
  Container-Klasse in `MaterialKarte` entfernt → rot.
- **Nicht gebaut (Abgrenzung gehalten, §14.3):** die **Metadatum-Achse** (welche Angabe überhaupt
  als Chip auftreten darf) — bleibt `FAHRPLAN-UI-QUALITAET.md` §3(c) / `W2·10-UI-NAV`. Ebenfalls
  bewusst aussen vor: die Startseiten-Chips (`start/GesetzeChips.tsx`), die auf keiner der vier
  LM-044-Routen liegen.

---
