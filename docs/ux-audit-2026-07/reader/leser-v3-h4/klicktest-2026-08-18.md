# Klick-Test Gesetzes-Leser — Protokoll 17./18.8.2026

**Was das hier ist.** Ein vollständiger Durchklick beider Hüllen (V3 unter
`?leser=v3`, V1 als damaliger Standard) über vier Breiten und fünf Erlasse: jedes
bedienbare Element einmal angefasst, jede Wirkung notiert. Abgelegt, weil die
Befunde den H4-Nachzug gesteuert haben und weil §11 verlangt, dass Erforschtes
nicht nur im Chat existiert.

**Messbedingung.** Worktree `LexMetrik-h4t`, detached `6ca1609b3` (= main),
eigener Build (`npm run build`, 62 Routen prerendert), `vite preview --port 4471`,
Playwright/Chromium 1223 headless, **warm** (lokal, ohne CPU-Drossel). Hell für
alle Läufe; dunkel für fünf Screens (keine Kontrast-/Layout-Auffälligkeit
gesehen, nicht tiefer geprüft). In **allen** Läufen: 0 `pageerror`,
0 `console.error/warning`, 0 HTTP ≥ 400, 0 `requestfailed`.

**Rohdaten** (Skripte, Logs, JSON, 182 Bilder) liegen im Sitzungs-Scratchpad und
sind nicht mitgeführt — die Bildnamen unten sind Verweise, keine Dateien in
diesem Ordner.

---

## 1 · Inventar

«DOM gesamt» = alle `button` / `a[href]` / `role=menuitem|tab|switch` / `input` /
`select` / `summary` / `[tabindex]` · «Chrome» = ohne Artikel-Inhalte und ohne
App-Shell · «Vertreter» = je Signatur (Tag/Rolle/Region/Namensklasse) höchstens
zwei angeklickt; externe Links (Fedlex, BBl, PDF) nicht angeklickt, nur
`target`/`rel` gelesen. Erlass: StPO, Einstieg `#art-429`, je Element kalt
(frischer `localStorage`).

| Hülle@Breite | DOM gesamt | Chrome | Vertreter geklickt | Wirkung | ohne Wirkung* | extern |
|---|---|---|---|---|---|---|
| v3@1440 | 5998 | 533 | 37 | 26 | 3 | 8 |
| v3@1024 | 5998 | 533 | 37 | 26 | 3 | 8 |
| v3@720 | 5962 | 489 | 25 | 17 | 2 | 6 |
| v3@390 | 5961 | 488 | 24 | 16 | 2 | 6 |
| v1@1440 | 8421 | 596 | 64 | 34 | 5 | 24 |
| v1@1024 | 8421 | 608 | 66 | 35 | 5 | 24 |
| v1@720 | 7408 | 558 | 53 | 27 | 2 | 24 |
| v1@390 | 7408 | 557 | 52 | 26 | 2 | 24 |

\* «ohne Wirkung» ist ausnahmslos erklärbar: `main[tabindex]` (Skip-Ziel),
Suchfelder (Klick = Fokus), `<summary>` (von der Sonde nicht gemessen, manuell
verifiziert: öffnet), V1 «Zum Artikel springen» mit leerem Feld. **Kein einziger
Klick ohne erklärbare Wirkung.**

---

## 2 · Befund A — kaputt

| Nr | Hülle · Erlass · Breite | Ist | Soll | Fundstelle |
|---|---|---|---|---|
| **A1** | V1 (damals Standard) · StPO, BGFA · 390 und 720 | Tap auf einen Trefferlisten-Eintrag leert das Feld, schliesst die Liste und lässt den Scroll exakt an der Vor-Such-Position stehen (scrollY 2670 → 2670; Ziel `#art-47` liegt bei top = 23 084 px). 3/3 warm @390, 3/3 @720. @1024+ funktioniert es (3/3). Das Ziel bekommt `lc-ziel-blink` — darum ist `e2e/leser-trefferliste-overlay-mobil-w219` grün: sie prüft nur die Blink-Klasse, nicht die Sicht | Tap schliesst UND springt sichtbar zum Artikel | `inhalt-volltext.tsx:232` — der mobile Pfad ruft `setSuche('')`, das den Rücksprung auf `scrollVorSucheRef` auslöst und den Sprung überschreibt; der Desktop-Pfad (Z. 218) lässt die Suche stehen |

**Zurückgestellt (H5 löscht V1).** Bilder: `V1-390-trefferklick-art47.jpg`,
`V1-StPO-390-treffer-klick.jpg`.
**Tor-Lehre daneben:** `leser-trefferliste-overlay-mobil-w219` kann diesen Fehler
nicht fangen — sie misst eine Klasse, nicht die Sichtbarkeit. §6.7-Kandidat; wird
mit dem A1-Fix auf `toBeInViewport` geschärft, falls V1 länger lebt.

---

## 3 · Befund B — verwirrend / inkonsistent

| Nr | Hülle · Erlass · Breite | Ist | Soll | Stand 18.8.2026 |
|---|---|---|---|---|
| **B1** | V3 · VMWG, StPO · Split alle, einzeln 390/720 | Tap auf einen **Artikel**-Eintrag im Gliederungs-Sheet springt (`#art-3`), aber das Sheet bleibt offen und deckt den Text. **Sektions**-Einträge schliessen es | jeder Sprung aus dem Sheet schliesst es | `inhalt.tsx:199` `springeZuArtikel` ohne `setTocAuf(false)` (vgl. `inhalt-sprung.tsx:107`) → **Teil A** |
| **B2** | V3 · StPO · alle Breiten | Schalter «Rechtsprechung im Text» hat im V3-Text keine Wirkung (0 `[data-bezug-linie]` gegen 326 in V1 — H3 Pos. 12, bewusst); er blendet den Panel-Zähler in der Kopfzeile aus (1 → 0 @≥720, main-HTML −530). @390 ändert sich sichtbar nichts. Beschriftung ≠ Wirkung | Beschriftung, die sagt, was passiert | `v3/LeserAnsichtV3.tsx:198-208` → **Teil A** |
| **B3** | V3 · Split · 1440/1024/720 | A+/A− und «Fussnoten» im sekundären Pane wirken auf **beide** Panes (17 → 18.36 px links und rechts) — ein globaler Options-Store | pane-lokal ODER im Menü kenntlich machen | **zurückgestellt**: der Store ist bewusst global (H2). Eine Präferenz «Schriftgrösse» gilt für den Leser, nicht für ein Fenster; zu ändern wäre der Store, nicht die Beschriftung. H5 |
| **B4** | V3 · Split · 1440 | Krume «‹ Gesetze» und ✕ navigieren INNERHALB des Panes, ohne History-Eintrag; Browser-Zurück verlässt die Seite statt das Pane wiederherzustellen | Zurück holt den Pane-Zustand ODER die Pane-Navigation legt einen Eintrag an | **zurückgestellt**: gehört zu B10 (eine History-Regel für alle Sprünge), nicht zu einem Einzelknopf. H5 |
| **B5** | V3 · StPO · 1440/1024 | Jeder Klick in die Lesespalte schliesst das angedockte Panel (`usePopoverAutoZu`, Modus «beiwerk») — Text markieren bei offenem Panel unmöglich | Aussenklick-Schluss nur in Modal-Form | ✅ **erledigt 18.8.2026 mit Ä60 (c)** (Ä86 im Kontaktbogen §8) |
| **B6** | V3 · BS-640.100, ZH-211.11 · 1440/390 | Panel-Reiter «Änderungen» meldet «Änderungsverlauf konnte nicht geladen werden» — ohne Netzfehler | neutrale Formulierung wie bei «Materialien» | ✅ **erledigt 18.8.2026, Teil B** — Ursache gemessen: 227 Revisions-Sidecars, davon 0 kantonale; 404 und Fetch-Fehler enden beide als `null`. Wortlaut nennt jetzt beide Möglichkeiten; Wurzelfix im Risikopfad ist als eigener Schritt vermerkt |
| **B7** | V3 · StPO · 1440 | Taste `t` landet bei offenem Steckbrief auf «↗ geltende Fassung», bei geschlossenem nirgends — `[data-toc]` umfasst den Steckbrief | `t` fokussiert den ersten Baum-Eintrag | `parts/LeserTastatur.tsx:170-176` → **Teil A** |
| **B8** | V1 · StPO · 390 | Escape leert nur das Feld; die Suchleiste bleibt und deckt Gliederung/Rechtsprechung/Ansicht/✕ | Escape im leeren Feld schliesst die Leiste | **zurückgestellt** — V1-Bedienweg, H5 löscht ihn |
| **B9** | V1 + V3 · ZH-211.11 · 390 | 81 px horizontaler Seiten-Überlauf, zugeschrieben der § 4-Tabelle in `span.lc-scroll-x` | 0 px Überlauf | ✅ **erledigt 18.8.2026, Teil B — mit korrigierter Ursache.** Die Tabelle ist korrekt gefasst (Scroller clientWidth 312 / scrollWidth 1002 / `overflow-x: auto`); der einzige ungeklippte Überläufer ist der Nachbar-Erlass-Link «Notariatsgebührenverordnung (NotGebV) ›» (191 px, rechte Kante 471 bei Fenster 390) |
| **B10** | V1 + V3 · StPO · alle Breiten | Sprünge und Gliederungs-Klicks nutzen `replaceState`, Anker-Links `push`. Nach drei Sprüngen führt EIN Zurück aus dem Gesetz | eine Regel für alle Sprünge | **zurückgestellt** — betrifft beide Hüllen und den Sprung-Kern; braucht einen eigenen Entscheid, nicht einen Nachzug. H5 |

---

## 4 · Befund C — kosmetisch

| Nr | Ist | Stand 18.8.2026 |
|---|---|---|
| **C1** | Steckbrief-Zustand und Gliederung ein/aus werden über Reload vergessen (`useState(true)`, `inhalt-zustand.tsx:332`, 3/3 Reloads); die Optionen bleiben | ✅ **entschieden 18.8.2026, Teil B: bewusst NICHT persistieren.** Begründung im Fahrplan-Vermerk «H4-Nachzug — Teil B» |
| **C2** | Krume «Bund» und «Gesetze» führen beide auf `/gesetze` — zwei Elemente, eine Handlung | **zurückgestellt** — Krumen-Frage der App-Shell, nicht des Lesers. H5 |
| **C3** | ZH-211.11: das Kürzel IST der Volltitel «Gebührenverordnung des Obergerichts (GebV OG)»; @390 steht in der Kopfzeile «Gebührenverordnung des O… · § 1» | **zurückgestellt — Daten**, kein Hüllen-Befund (kein Kürzel hinterlegt). *Es war aber der Auslöser von B9: die Zeile darf an keinem Wert brechen, unabhängig davon, ob die Daten stimmen* |
| **C4** | VMWG-Gliederungstitel «Art. 6b — b Bezug von Elektrizität …» (doppelter Buchstabe aus der Marginalie) | **zurückgestellt — Datenextraktion**, nicht Hülle. H5/Korpus |
| **C5** | Fussnoten-Marker (`[data-fn-ref]`): `aria-expanded` wechselt, `aria-controls` fehlt | **zurückgestellt** — der Marker sitzt im **Kern-Render** (`components/normtext/ArtikelBody.tsx`), und das dort per Portal geöffnete `span[role="note"]` trägt heute gar keine `id`, auf die verwiesen werden könnte. Ein `aria-controls` verlangt also eine erzeugte id im Kern-Markup, das die Golden-Ausgaben decken — eigener Schritt, H5 |
| **C6** | App-Topbar @390: 42 px breites Suchfeld, Platzhalter unsichtbar → leeres Kästchen | = **Ä83**, `src/components/layout/**` → **Teil A** (Whitelist-Zeile) |
| **C7** | Gliederung ausblenden @1440 gewinnt der Lesespalte 0 px (620 → 620) | **bewusst** (David 16.8.2026) — nur Notiz |

---

## 5 · Grün geprüft (Auszug)

Ansicht-Menü (4 Breiten): Zweitklick/Escape/Aussenklick, Fussnoten 2 → 0 Marker
(Reload behält), Änderungsvermerke 110 → 0 Historie-Zeilen bei bleibenden
Fussnoten (Ä68), Schriftregler 17 → 18.36 → 20.06 → 22.1 px mit korrekt
deaktivierten Endanschlägen · Panel: drei Öffner (Zähler, Menü, `r`), drei
Schliesswege mit Fokus-Rückgabe, Reiter mit `aria-selected`, Instanz-Filter
(BGE 262 · BGer 7 · Eidg. 4 · Kantonal 1275), Entscheid-Link und Rücksprung an
dieselbe Stelle, im Split beide Panels gleichzeitig · Suche/Sprung (5 Erlasse):
«429»/«Art. 429»/«art429» → Sprung, «9999» kein Hinweis, «Entschädigung» → «50
Artikel · 88 Fundstellen» (BS «20 Paragraphen · 41 Fundstellen» — Zählwort
erlassgerecht), ↑↓/Enter, Escape leert · Gliederung: ein/aus, alles auf/zu
(790 ↔ 796), ↑ Anfang, Sheet mit `role=dialog aria-modal` · Steckbrief (5
Erlasse): keine «undefined/NaN/null» in 10 Erlass×Breite-Kombis · Split: je Pane
eigener Kopf, Scroll-Spy, Panel und Sheet · Erlass-Neutralität: § statt Art. bei
BS/ZH durchgehend · Tastatur: vollständige Tab-Reihe mit sichtbaren Ringen, `?`
öffnet die Hilfe · Persistenz: kalter Deep-Link landet, `?leser=v1`/`?leser=v3`
schalten sauber um · Handy @390: kein Überlauf ausser B9, Sprungziel bei
top 156 px nicht verdeckt.

---

## 6 · Nicht geprüft — die Grenzen dieses Tests

- Nur Chromium headless, Maus/Tastatur: **keine echten Touch-Gesten** (Swipe
  zwischen gestapelten Panes @720, Pinch), kein Safari/Firefox, **keine
  CPU-Drossel** — alle Zahlen sind warm.
- Dunkelmodus nur per Screenshot gesichtet (5 Bilder), keine Kontrastmessung.
- Fedlex-Fremdverweis-Popover, V1-Split mit zwei Gesetzen, Pane-Gutter,
  PDF-Download und Druck: nicht geprüft.
- V1 @390 Gliederungs-Sheet Artikel-Eintrag (B1-Pendant) nicht abgeschlossen —
  das Skript brach an der B8-Überlagerung ab.
- «Rechtsprechung im Text» AUS @390: ob der Menü-Eintrag verschwindet, blieb
  ungemessen (main-HTML −145 deutet auf einen entfernten Knoten).
- Der Preview-Server wurde vom Sandbox-Hintergrund mehrfach beendet (Exit 144);
  **jeder** Lauf mit `ERR_CONNECTION_REFUSED` wurde vollständig wiederholt — keine
  Zahl in diesem Protokoll stammt aus einem toten Server.
