# FAHRPLAN — Oberflächen-Qualität app-weit (`QS-UI`)
<!-- @lagebild name: Oberflächen-Qualität & Anleitung · zweck: Laufender UI-Qualitäts-Pass; später Funktions-Inventar und Bedienungsanleitung. -->

> **ROADMAP-Schritt:** `QS-UI` (Querschnitt-Band — **kontinuierlich, kein Reihenfolge-Slot**).
> **Anlass:** Ideen-Intake 20.7.2026, Idee 8a («UI app-weit optimieren»); die Gesetzes-Fläche
> folgt als 8b in `W2·5h-GESETZ-UI`. Dieser Schritt hängt **nicht per `dep`** an diesem Strang —
> `QS-UI` ist kontinuierlich und erreicht nie «fertig», ein `dep` wäre nie erfüllbar. Die Sequenz
> «erst die Pässe (a) Fundament und (b) Hierarchie, dann die Gesetzes-Fläche» gilt als Prosa-Regel
> hier und in `FAHRPLAN-GESETZES-UX.md` §13.1; beide Pässe sind seit 4.8.2026 eingelöst. *(Das
> frühere Vehikel `seq-hart` ist am 14.8.2026 gestrichen — QS-PLAN-EINFACH: 0 auswertende Stellen.)*
> **Charakter:** Dieses Dokument ist die **Umbrella-Detailquelle** für einen mess-getriebenen
> Dauer-Strang. Es ist **kein Redesign-Plan** und **kein zweiter Einstieg** (§14.1) — es
> koordiniert und härtet, es baut nicht neben den bestehenden UI-Schritten her.
>
> **Fundament steht bereits:** Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente
> (`-RECHNER`, `-RECHTSPRECHUNG`, `-VORLAGEN`, `-NORMTEXT`), Tor `scripts/check-farbwelt.ts`
> (OKLCH/WCAG/APCA) und `@axe-core/playwright`. Dieser Strang erfindet keine neue
> Design-Schicht, sondern **zieht die vorhandene flächendeckend durch und verschärft ihre Tore**.

---

## §0 · Ziel und Nordstern

**Nordstern: Kanzlei-Praxistauglichkeit** — nicht Schönheit. Die Messlatte jeder Einheit ist,
ob eine Anwältin **schneller zu einem belegten Ergebnis** kommt: weniger Klicks bis zum Verdikt,
weniger Rätselraten, wo etwas herkommt, weniger Rückwege ins Nichts.

Daraus folgen drei Leitsätze, die über allen Teil-Schritten stehen:

1. **§13.2 zuerst:** Verdikt zuerst, Warum auf Abruf. Eine Fläche, die den Nutzer erst durch
   Herleitung schickt, ist unabhängig von ihrer Optik mangelhaft.
2. **§8 vor Politur:** keine Oberfläche suggeriert mehr Gewissheit, als der Korpus trägt.
   Ein hübscher Zustand, der eine Unsicherheit wegglättet, ist ein **Rückschritt**.
3. **§15 gilt:** kein UX-Gewinn, der Treue kostet. Bei Konflikt gewinnt immer die Treue.

**Ausdrücklich NICHT Ziel:** ein grosser visueller Wurf, ein Marken-Relaunch oder ein
Umbau der Token-Schicht. Farbwärme/Atmosphäre ist und bleibt `W2·11-DESIGN`.

## §2.4 · Teilpass (e) — Stand 5.9.2026 und offene Liste

*(Neuer Abschnitt. §2.1–§2.3 liegen in [`archiv/fahrplaene/FAHRPLAN-UI-QUALITAET.md`](../archiv/fahrplaene/FAHRPLAN-UI-QUALITAET.md); dort steht die Herleitung, hier der laufende Stand. §4 Ziff. 1–3 — Gate-Verschärfung — ebenfalls im Archiv.)*

**Erledigt in dieser Einheit** (Trailer `Roadmap: QS-UI`):

| §4 | Punkt | Ergebnis |
|---|---|---|
| Ziff. 2 | axe von Stichprobe auf Flächendeckung | `e2e/a11y-flaeche.e2e.ts` — alle 62 prerenderten Routen (Quelle `prerenderRouten()`, §5 SSoT) statt bisher sieben, plus Rechner-Ergebnis und Wizard-Schritt 2. Erstlauf rot mit **vier** echten Verstössen (2 critical, 2 serious) auf `/rechner/schkg-fristen` und `/rechner/kuendigung`; alle vier gefixt, Nachlauf 58/58 grün in 29.4 s (4 Worker, lokal, kalt). |
| Ziff. 1 | Farbwelt-Baseline enger | Pflichtpaare **80 → 102**: Fliesstext (ink-900) und Sekundärtext (ink-600) auf allen fünf Tönungsflächen (brass-100, warn/danger/sage/slate-bg) sind jetzt hart geprüft. Die Baseline kannte dort bisher nur die Kanten und je einen Textton — genau daran war der 4.36:1-Befund oben vorbeigelaufen. Keine neue Warnung; die acht beratenden D-1/D-4/D-5-Warnungen bleiben unverändert (ihr Abbau ist Token-Arbeit = `W2·11-DESIGN`, §0 «ausdrücklich NICHT Ziel»). |
| §17 | `aria-label` mit Zustand | ESLint-Regel `ARIA_ZUSTANDSNAME` (`eslint.config.js`) — konstanter Name neben `aria-expanded/pressed/selected/checked`. Ein Fund gefixt (`SektionBaumTOC`), zwei zurückgestellt (unten). |

**Offen — mit Grund, nicht vergessen:**

1. **`Topbar.tsx` Seitenleisten-Schalter.** Gemessen @1440: «Seitenleiste ausblenden»/`pressed=true` →
   nach Klick «Seitenleiste einblenden»/`pressed=false`. Der Zustand steht doppelt und
   gegenläufig. Fix = konstanter Name; er ändert den zugänglichen Namen und damit die
   Bestands-Assertion `e2e/leser-history-hash.e2e.ts:129`. Test-Änderung ist nach §6.3 eine
   fachliche Änderung ⇒ eigener deklarierter Schritt. Inline gegrandfathert, mit Verweis hierher.
2. **`ArtikelLeser.tsx` Artikel-Chevron.** Gemessen an `/gesetze/bund/GEBV_HREG`: **zwölf** Knöpfe
   mit dem wortgleichen Namen «Artikel einklappen» auf einer Seite (auf dem OR wären es 1099) —
   für Screenreader ununterscheidbar, für Sprachsteuerung nach dem Klick nicht mehr auffindbar
   (WCAG 4.1.2). Muster für den Fix steht fertig im Zwilling `SektionBaumTOC.tsx`. Blockiert
   durch `e2e/gesetze-ux-9punkte.e2e.ts:76–89` (dieselbe §6.3-Lage wie Ziff. 1).
   **Ziff. 1+2 zusammen sind EIN kleiner Folgeschritt** — zwei `aria-label`, drei Test-Zeilen.
3. **Restliste Ziff. 6/7 (Archiv §2.2/§2.3) unverändert offen:** der Settle-Fix gegen die
   Falsch-Rot-Klasse von `e2e/qsui-hierarchie.e2e.ts` unter Parallel-Last (Ziff. 7) und das
   Nachziehen von I3 auf `checkVisibility()` (Ziff. 6, ausdrücklich **erst nach** Ziff. 7).
   Beide leben in `e2e/qsui-hierarchie.e2e.ts` — Bestands-Spec, in dieser Einheit per Auflage
   nicht anzufassen. Sie brauchen denselben Folgeschritt-Rahmen wie Ziff. 1+2.
4. **`bg-brass-200` als Text-Grund ungeprüft.** Gemessen ink-500/brass-200 = 3.739 hell ·
   2.619 dunkel, ink-600/brass-200 = 5.398 · 3.917 — beide unter AA im dunklen Modus. Heute
   folgenlos: die einzigen Call-Sites sind `hover:bg-brass-200` an `lc-chip` (Hover-Zustand,
   von axe nicht gemessen). Kein Pflichtpaar aufgenommen, weil es heute rot wäre und der
   Konsument ein Hover-Zustand ist — aber die Zahl steht hier, statt still zu verschwinden (§8).

## §8 · ROADMAP-Spec QS-UI (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §1–§6 dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher, mess-getriebener
  Querschnitt-Strang** auf dem vorhandenen Fundament: Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente,
  Tor `scripts/check-farbwelt.ts` (OKLCH/WCAG/APCA) und `@axe-core/playwright`. **Nordstern:
  Kanzlei-Praxistauglichkeit** — nicht Schönheit, sondern schneller zum belegten Ergebnis.
  **Teil-Schritte statt vagem «UI besser machen»:** **(a) Fundament-Pass** app-weit gemeinsame Muster
  und Navigation · **(b) Informationshierarchie-Pass** «Verdikt zuerst, Warum auf Abruf» (§13.2) über
  alle Werkzeuge · **(c) Muster-/Navigations-Konsistenz** (⌘K, Verlauf, Breadcrumb) · **(d)
  Kanzlei-Alltags-Flow-Audits** domänenweise gegen das jeweilige Reglement · **(e) Gate-Verschärfung**
  (Farbwelt-Baseline enger ziehen, axe von Stichprobe auf Flächendeckung, ggf. Flow-/Hierarchie-Checks).
  **Feasibility 🟢 aus-Bestand** (Reglemente + Farbwelt-Gate + axe stehen). **Abgrenzung (§14.3,
  verbindlich):** `QS-UI` **koordiniert und härtet**, es **dupliziert nicht** `W2·10-UI-NAV`
  (Navigations-Plumbing), `W2·11-DESIGN` (Farbwärme) oder `W3-AUSBAU` (Split/Responsive; vormals
  `W3·14`, Etiketten-Konsolidierung 15.8.2026) — diese bleiben die
  konkreten Sub-Efforts, die dieser Strang treibt und einfordert. Nachgelagert hängt
  **`W2·5h-GESETZ-UI`** (Gesetzes-Fläche) an diesem Fundament. Detailquelle: diese Datei.
  **DoD je Teil-Schritt:** §13-Tore grün (`check:farbwelt`, axe) · golden byte-gleich, wo die Änderung
  verhaltensrelevant ist. Trailer `Roadmap: QS-UI`.

---

---

## §9 · ROADMAP-Spec W2·16-INVENTAR (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §7.1 «Schritt 1 — Funktions-Inventar» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Vollständige, ehrliche Aufnahme dessen, **was Lexmetrik heute kann** — je Werkzeug/Fläche: Zweck,
  Eingaben, Grenzen, Status (§8 `verified`/`entwurf`/`geplant`), Fundort. **Der Nutzen liegt VOR der
  Anleitung:** das Inventar ist **Input für `QS-UI`** — man kann eine Oberfläche nicht konsistent machen,
  solange niemand die Funktionsmenge aufgeschrieben hat. Darum **früh** und **nicht** an die Anleitung
  gekettet. Quelle ist der bestehende **Funktions-Katalog** (`ROADMAP.md` §Funktions-Katalog) + `src/lib/startseiteConfig.ts`
  (§5-SSoT); Heimat des Ergebnisses: `bibliothek/` nach §11.
  **DoD:** jede Karte aus `src/lib/startseiteConfig.ts` erfasst · Status-Marker gegen die Realität geprüft, nicht
  abgeschrieben (§8) · `check:bibliothek` grün · Eintrag in `bibliothek/INDEX.md`.
  Trailer `Roadmap: W2·16-INVENTAR`.

---

## §10 · ROADMAP-Spec W2·16-ANLEITUNG (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §7.2 «Schritt 2 — Bedienungsanleitung / Onboarding» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — eine Anleitung auf eine Oberfläche zu schreiben,
  die gleich danach umgebaut wird, ist doppelte Arbeit und veraltet sofort. Darum **nach `QS-UI` (8a) und
  nach `W2·5h-GESETZ-UI` (8b)**.
  **Sequenz maschinenlesbar, bewusst getrennt (§14.3 — dieselbe Konstruktion wie bei `W2·5h-GESETZ-UI`):**
  `dep` trägt nur **`W2·16-INVENTAR`** (echte Bau-Voraussetzung, endlicher Schritt). `QS-UI` ist ein
  **kontinuierlicher Querschnitt ohne Endzustand** — ein `dep` darauf wäre nie erfüllbar und machte diesen
  Schritt dauerhaft nicht startbar; massgeblich ist darum die Prosa-Sequenz auf die konkreten
  Teil-Schritte (a)/(b) — beide eingelöst 4.8.2026. *(`seq-hart` als Feld gestrichen 14.8.2026.)*
  **DoD:** deckt die Funktionsmenge aus `W2·16-INVENTAR` **vollständig** ab (keine stille Auslassung, §8) ·
  Sprache nach §13 Ziff. 3 (Fach **und** Laie) · axe · golden byte-gleich.
  Trailer `Roadmap: W2·16-ANLEITUNG`.

---


---

## Archivierte Abschnitte *(Plan-Neuschnitt 29.8.2026)*

8 Abschnitt(e) dieser Datei sind wörtlich nach
[`archiv/fahrplaene/FAHRPLAN-UI-QUALITAET.md`](../archiv/fahrplaene/FAHRPLAN-UI-QUALITAET.md) ausgelagert — sie tragen keine offene
ROADMAP-Bindung mehr. Titel:

- §1 · Audit-Methodik gegen das DESIGN-REGLEMENT
- §2 · Informationshierarchie-Pass («Verdikt zuerst»)
- §3 · Navigations- und Muster-Konsistenz
- §4 · Gate-Verschärfung
- §5 · Teil-Schritt-Backlog und Verweise
- §6 · Definition of Done je Teil-Schritt
- §7 · Funktions-Inventar und Bedienungsanleitung (`W2·16-INVENTAR` / `W2·16-ANLEITUNG`)
- §11 · `QS-UI-WARNLINE` — `--warn-line`-Kontrast robust machen
