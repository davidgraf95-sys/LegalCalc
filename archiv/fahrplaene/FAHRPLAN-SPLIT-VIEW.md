# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-SPLIT-VIEW.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

---

## Warum (Produkt)

Split-View macht den **Verzahnungs-Burggraben** sichtbar: „Norm → Werkzeug →
Schriftsatz" buchstäblich nebeneinander. Das kann weder Fedlex noch entscheidsuche.
Strikt zustandslos: Panes speichern **nur Pfade**, nie Formular-/Falldaten
(Berufsgeheimnis — wie `lib/tabs.ts` heute).

## Reihenfolge (Davids Entscheide 29.6.2026, FIXIERT)

1. **Erst Strang A** (Breiten-Umschalter, klein, eigenständig live), **dann Strang B** (Split-View).
2. **Layout-Modus B3**: Primär-Pane treibt die URL wie heute; Sekundär-Panes additiv;
   „Layout teilen" kodiert auf Klick in einen Permalink.
3. **Bis 3 Panes, responsiv**: 1 mobil · 2 ab ~1440px · 3 ab ~1920px.

---

## Architektur-Befund (29.6.2026 gelesen, nichts geändert)

| Baustein | Ist | Folge |
|---|---|---|
| Versionen | React **19.2** · react-router-dom **7.16** · react-dom **19.2** | MemoryRouter + `<Routes location>` + React-19-Suspense pro Pane verfügbar |
| Routing | `BrowserRouter`/`StaticRouter`, **eine** Route in **einem** `<main>` (`App.tsx <Routes>`) | für N Panes: Routen-Schalter standalone mountbar machen |
| Routen-Register | datengetrieben `ROUTEN_MANIFEST`, katalog-gegatet | Routentabelle ist Daten → pro Pane wiederverwendbar (§5) |
| Shell | `Shell.tsx`: verstellbare/einklappbare Sidebar + Inhalt in **einem** `max-w-content`-Wrapper (70rem) | die eine Stelle für A; B erweitert Single-`children` → N Panes |
| Lesespalte | `max-w-reading` (40rem), 47× im Gesetzestext | bleibt in A **und** B unangetastet → Normtext-Lesbarkeit geschützt |
| **Reiter-System** | `lib/tabs.ts` (localStorage `lexmetrik-tabs`), `useTabs`, `TabTracker`, `ReiterUebersicht`, Drag-Sort, **`?r=<n>` Mehrfachinstanz**, navigationsbasiert | **Fundament von B**: offene Reiter sind schon eine Pfad-Datenliste → Panes = 2–3 davon sichtbar |
| Scroll | global `window` + per-Reiter `ScrollWiederherstellung` (Schlüssel `tabSchluessel`) | in B pro Pane (eigene Scrollachse) statt global |
| Persistenz-Muster | `useSeitenleiste.ts`: typeof-window-Guard, localStorage, SSR/prerender-sicher (render-then-replace, kein Hydrate) | Blaupause für `useInhaltsbreite` (A) + `usePaneLayout` (B) |
| SSR/Prerender | zwei-Pass (`react-dom/static`→`renderToString`); Drift-Tore: kein `<script`, kein Fallback-Text | Default-Zustand = heutiges Verhalten ⇒ Golden bleibt byte-gleich |
| Tore | `npm run gate` · Golden byte-gleich · `routenManifest.test.ts` · axe-Tor | jede Phase: Default unverändert |

### ⚠ Kernbefund — Viewport-Breakpoints brechen in schmalen Panes
- Code reagiert auf **Bildschirm**breite: **450 Vorkommen** `sm:/md:/lg:/xl:` in
  **89 Dateien**; Container-Queries **nicht installiert, 0× genutzt**.
- Ein 600px-Pane auf 2560px rendert weiter `xl:`-Layouts (Gesetzesleser-TOC
  `xl:grid-cols-[16rem_…]`, Schnellrechner `lg:grid-cols-[18rem_…]`) → **sieht kaputt aus**.
- **Optimale Lösung = CSS Container-Queries:** jedes Pane `container-type: inline-size`;
  Layout reagiert auf **Pane**-Breite. Tailwind 3.4 braucht dafür
  `@tailwindcss/container-queries` (Plugin) **oder** handgeschriebene `@container`-Regeln.
- **Migration gestuft — Empfehlung CQ-1:** nur **layoutbestimmende** Breakpoints der
  **pane-fähigen** Seiten umstellen (Gesetzesleser-TOC, Schnellrechner, Rechtsprechung-Split,
  EntscheidLeser-`dl`; ~10–15 Stellen). Kosmetik (`sm:px-`, `sm:text-`) bleibt am Viewport.
  CQ-2 (alle Grids) / CQ-3 (alle 450) bewusst **nicht** — Risiko/Nutzen.
- **Dieser Container-Query-Schritt ist der eigentliche Hauptaufwand von B, nicht das Routing.**

---

## STRANG B — Split-View (2–3 Panes)  *(Fundament, mehrphasig)*

Jede Phase: Default = heutiges 1-Pane-Verhalten ⇒ Golden grün.

- **B-0 `RouteSwitch`-Extraktion** *(✅ FERTIG, Commit `2ed15aa7`)*: `<Routes>…</Routes>` aus
  `App.tsx` in `src/RouteSwitch.tsx` gezogen; App.tsx rendert `<RouteSwitch />` an gleicher
  Stelle. Verhaltensneutral bewiesen (golden byte-gleich, 57 Routen prerendern, Runtime-Smoke
  sauber). Risikoarmes Fundament gelegt.
- **B-0b Container-Query-Fundament** *(✅ Plugin-Teil FERTIG, Commit `9e66cd98`; CQ-1-Migration
  in B-1 eingeflossen)*: `@tailwindcss/container-queries` installiert + verdrahtet, verhaltensneutral.
- **B-1 Pane-Container in `Shell.tsx`** *(✅ FERTIG, Commit `e3795776`)*: `usePaneLayout` (nur
  Pfade, localStorage, max 2 sekundär). Shell: Default-Branch byte-gleich; Multipane-Branch (ab lg,
  ≥1 sekundär) = Flex-Reihe primär + `sekundaer.map`. **Default 1 Pane = exakt heute** (golden
  byte-gleich, 57 Routen prerendern, Smoke 0 Fehler, mobil Fallback).
  - Primär-Pane: bestehender `BrowserRouter` (treibt URL — B3).
  - Sekundär-Pane: **`<RouteSwitch location={pfad}>`** (= `<Routes location>`) im SELBEN Router —
    **NICHT** MemoryRouter (react-router v7 verbietet verschachtelten Router; im Smoke bestätigt).
  - **Pro Pane eigene `<Suspense>` + `<ErrorBoundary>`** + `@container/pane` + eigener Scroll.
  - CQ-1: Rechtsprechung/Schnellrechner via `paneKlasse` (@3xl/pane); gesetz-leser im Pane
    einspaltig+Drawer (`istXl` pane-aware). `container-type` NUR am Pane-Wrapper (kein Default-Drift).
- **B-1-Bugcheck (ultracode, 6 Linsen, 13 bestätigt — alle LATENT bis ein Opener existiert):**
  Kernbefund: der **gesetz-leser ist an window/document-Globals gekoppelt** (`window.history.
  replaceState` in `springeZuArtikel`, `window.location`-Reads, Tab-Tracker, document-globale
  `getElementById('art-…')` + IntersectionObserver). Als **Primär**-Pane korrekt (es IST die URL),
  als **Sekundär**-Pane fehlerhaft (zerstört Haupt-URL, scrollt falsches Pane via Duplikat-`art-`-IDs,
  trackt falschen Tab). Rechner-Panes sind sauber.
- **B-2 Pane-Steuerung** *(✅ FERTIG — SICHERE Scope, Commit `ec4bb1d8`)*: „⧉ daneben öffnen" im
  Gesetzleser-`KontextPanel` («Passende Werkzeuge») öffnet einen **Rechner** als Sekundär-Pane
  (Gesetz primär | Rechner sekundär — die Verzahnung, smoke-bestätigt). `PaneSteuerung`-Kontext
  (`oeffneDaneben`/`kannOeffnen`, nur ab lg + freie Kapazität, max 2 sekundär). Schliessen +
  Fokus-Rückgabe. **Nur pane-SICHERE Ziele (Rechner).**
- **B-2.5 (NEU, vorgelagert vor weitere Pane-Inhalte) — gesetz-leser pane-fähig machen**
  *(die B-1-Bugcheck-Majors; nötig BEVOR ein Gesetz im Sekundär-Pane geöffnet werden darf)*:
  1. `springeZuArtikel`/Deeplink/Tab-Tracker: `window.history.replaceState` + `window.location`-Reads
     bei `imPane` unterdrücken (Pane darf Haupt-History/-URL nie schreiben).
  2. DOM-Queries (`getElementById('art-…')`, `querySelectorAll('[id^=art-]')`, IntersectionObserver)
     auf den **Pane-Root** scopen (Ref via Kontext) statt `document` — sonst Duplikat-ID-Kollision.
  3. Scroll/Observer auf den **Pane-Scroll-Container** statt `window` (Midpoint aus Pane-Rect).
  4. „Nächste Instanz"/`merkeTab`/`aktualisiereTabArtikel` aus `basisPfad` statt `window.location`.
  Danach: B-2-Opener auch für Gesetze/Entscheide freigeben + EntscheidLeser-Lesemodus per Portal
  aus dem `@container/pane` lösen (sonst nicht mehr vollflächig).
- **B-2.5** *(✅ FERTIG, Commit `9170ee59` + Bugcheck-Fix `c9a8cca9`)*: gesetz-leser pane-fähig —
  DOM-Queries/Scroll/Observer auf Pane-Wurzel gescopt (Modulhelfer `paneRoot`/`findeArt`),
  sekundäres Pane unterdrückt window.history/location/title/Reiter; ⧉ «daneben» auch für
  «Angewandte Erlasse» (Gesetz neben Entscheid/Material); EntscheidLeser-Lesemodus per Portal.
  Verifiziert: zwei Gesetze nebeneinander, kein URL-Korrupt, kein Re-Render-Loop.
- **B-3 Scroll & Fokus pro Pane** *(grösstenteils in B-2.5 erledigt; Rest offen)*: pro-Pane-Scroll
  + Spy laufen; OFFEN: Scroll-POSITIONS-Wiederherstellung (`ScrollWiederherstellung`/`ScrollZuHash`
  in App.tsx weiterhin window-basiert, im Multipane-Primär ohne Wirkung) + Tastatur-Pane-Wechsel.
- **B-4 Mobil-Faltung** *(✅ FERTIG, Commit `3587d1fd`)*: Multipane responsiv — ab lg nebeneinander,
  darunter horizontales Snap-Wischen (je Pane volle Breite); Opener bleibt lg-only. Spalte `h-dvh`.
- **B-5 Layout teilen** *(✅ FERTIG, Commit `860d914b` + Fix `c9a8cca9`)*: `?p=pfad||pfad` seedet
  den Pane-Satz (gewinnt über localStorage, wird nach Seed gestrippt); «teilen»-Knopf kopiert den
  Permalink. Round-trip verifiziert.
- **B-4 Mobil-Faltung**: < `lg` → 1 Pane + Reiter-Umschaltung (kein 3-Spalten-Quetschen);
  bestehende Schubladen-Logik nutzen.
- **B-5 (optional) Layout teilen**: aktueller Pane-Satz → `?p=…`-Permalink (B3→B2-Brücke);
  eigener Schritt, erst nach B-0..4. `/split` noindex/SPA-only, nicht im Prerender-Satz.

### Querschnitt-Regeln (B)
- **Zustandslos:** nur Pfade speichern, nie Formularinhalt (wie `tabs.ts`). Harte Grenze.
- **§5:** keine zweite Routenquelle (`RouteSwitch` = eine), kein zweiter Tab-Speicher —
  Pane-Layout referenziert die Reiter-Identität (`tabSchluessel`).
- **Performance:** lazy-Chunks bleiben; FlexSearch-Index ist Modul-Singleton (1×, nicht pro Pane);
  in B-3 messen.
- **SEO/Prerender:** Split ist Client-Laufzeitsicht; prerenderte Einzelrouten unverändert
  (Default 1 Pane).

---

## Reihenfolge & Tore (Zusammenfassung)
A → B-0 → B-0b → B-1 → B-2 → B-3 → B-4 → (B-5 optional). Eigener Worktree;
jede Phase `npm run gate` grün + Default Golden byte-gleich; visuell breit/2-/3-Pane + mobil.

## Entscheide (alle getroffen 29.6.2026)
- ✅ **A: Breit-Wert** — `max-w-screen-2xl` (1536px) gewählt + umgesetzt (Strang A).
- ✅ **B-0b: Container-Query-Tiefe = CQ-1** (David 29.6.): nur die ~10–15 layoutbestimmenden
  Breakpoints der pane-fähigen Seiten; Kosmetik bleibt am Viewport.
- ✅ **B-0b: Technik = Plugin** `@tailwindcss/container-queries` (David 29.6.), nicht handgeschrieben.

> **⚠ Vor B-0b zu klären (Befund dieser Session):** B-0b liegt im Plan VOR B-1 (Panes). Setzt man
> `container-type: inline-size` schon am heutigen Einzel-Wrapper, feuern die `@xl:`-Utilities künftig
> auf die **Container**breite (Inhaltsfläche, schmaler als der Viewport um Sidebar + Padding) statt auf
> die **Viewport**breite — d. h. der Default ist NICHT mehr exakt das heutige Verhalten (Golden bleibt
> grün, weil es nur Engines prüft; die Verschiebung ist rein visuell). Entweder `container-type` erst in
> B-1 mit dem Pane-Container einführen, oder den Schwellenwert je Stelle so nachziehen, dass das
> Einzel-Pane optisch unverändert bleibt (Visualdiff-Tor). Darum ist B-0b eine **eigene fokussierte
> Session** wert.

> **Bekanntes Merkmal aus dem Review (kein Bug):** Der A-Umschalter erscheint ab `lg`,
> wirkt sich aber erst aus, wenn die verfügbare Inhaltsbreite 1120px übersteigt (abhängig
> von der ziehbaren Sidebar). In einem schmalen Band (Laptop + offene Sidebar) ist „Breit"
> sichtbar, aber ohne Effekt. Inhärent bei einem max-width-Umschalter; ein sauberer
> statischer Breakpoint existiert wegen der ziehbaren Sidebar nicht. Belassen bei `lg`.

---

## §2 · ROADMAP-Spec-Nachzug `W3·14-S` (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 3, Teilschritt `W3·14-S` — AP-11 rückwirkend angewandt (ROADMAP-Diät
Welle 3, 4.8.2026). In der ROADMAP bleiben Titel, `@meta`, der Einzeiler und der Pointer auf §1.
Steuert nicht — Spec-Heimat.*

> **S1** Breadcrumbs in der Pane laufen über globalen
> Router-`<Link>` (`InhaltsKopf.tsx` Z.30) statt PaneKontext-Navigator → fixen · **S2** Tracker «alles
> schliessen» muss auch `usePaneLayout` (Pane-Store) leeren. S1+S2 bündeln.
