---
name: perf
description: Geräte-Last und Performance-Bauregeln — Virtualisierung, CLS, Lazy Loading, Memoisierung, Hydration, On-demand-Inhalte, dazu die Pflicht zur Logikverlust-Bewertung und das Perf-Budget-Tor. Verwenden bei Arbeiten an Ladezeit, Bundle-Grösse, Rendering, Scroll-Verhalten, Lighthouse-Werten oder wenn eine Seite als langsam gemeldet wird.
---

# Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust

LexMetrik wird so gebaut, dass es den Computer des Nutzers nicht merklich
langsamer macht — **solange daraus kein Logikverlust entsteht**. Diese Regel ist
der Korrektheit (CLAUDE.md §1) untergeordnet: bei Konflikt gewinnt immer die
Treue, nie das Tempo.

## Was «Logikverlust» heisst

Jeder Verlust an

- **Inhalts-Treue** — vollständiger Normtext, Tabellen, Fussnoten
- **Rechtsregel-Treue** — Rechner und Werte
- **Funktions-Treue** — Ctrl+F über das *ganze* Gesetz, `#art_`-Anker und
  Deep-Links, Print- und PDF-Vollständigkeit, Scroll-Spy und TOC,
  Split-View-Pane-Zustand
- **Golden-Byte-Gleichheit**

**Jede Performance-Massnahme trägt eine explizite Logikverlust-Bewertung. Ohne
sie wird sie nicht gemerged.**

## Bauregeln

**1. Keine DOM-entfernende Virtualisierung von Normtext.** Off-screen-Kosten nur
über CSS `content-visibility: auto` plus `contain-intrinsic-size`; jeder
Artikel-Knoten bleibt im DOM. Windowing oder Unmount, das Ctrl+F, Anker,
Kopieren, Screenreader oder SEO bricht, ist verboten.

**2. CLS = 0 durch reservierten Platz, nie durch weniger Inhalt.** Asynchron
einwachsende Blöcke bekommen am **prerenderten** Element eine token-basierte
Mindesthöhe. Client-Initialstate auf den Server-Zustand pinnen, Abweichung erst
per `useEffect`.

**3. Schwere Features lazy und off-critical-path, nie eager-Korpus.** Grosse
Parses erst bei Bedarf, per `requestIdleCallback` oder im Worker — nie synchron
im ersten Paint. Defer ändert nur das **Wann**, nie das **Was**: der volle Parse
bleibt.

**4. Memoisierung ist Pflicht, weil der React Compiler aus ist.** `React.memo`
nur mit Default-Komparator, `useCallback` mit vollständigen Deps, `useMemo` für
teure Ableitungen, geteilt via WeakMap auf die Datenreferenz — nie über einen
globalen Token-Key, das kollidiert zwischen Erlassen.

**5. Render-then-replace bleibt; kein naives `hydrateRoot`** — ein
Markup-Mismatch ist stiller Normtext-Verlust. Bundle-Splitting und Sharding sind
erlaubt, solange die Union byte-identisch bleibt und golden,
`check:normtext` und `check:struktur-konsistenz` grün bleiben.

**6. Long-Tail on demand bleibt inhaltsvollständig.** On-demand geladener Inhalt
trägt dieselben Treue-Pflichten wie prerenderter: Ctrl+F, Anker, Print,
Provenienz (CLAUDE.md §7 a–d), ehrlicher Fehlerzustand (§8). Ein Pfad, der
kürzt, ist Logikverlust.

## Messung

Zwei getrennte Tore (Faktenkorrektur 7.8.2026, Reglement-Audit — die frühere
Beschreibung vermischte sie): **`check:perf-budget`** prüft gzip-Bundle-Budgets
(`scripts/check-perf-budget.ts`, Chrome-frei, läuft auch lokal);
**`check:perf-lighthouse`** fährt die Lighthouse-Messung
(`scripts/perf/lighthouse-budget.ts`) und läuft in CI nach dem Merge auf main
(ci.yml, designt: nicht auf PR-Läufen). **Ein lokales Grün ohne
`check:perf-lighthouse` beweist also keine Lighthouse-Werte.**

Gegengekoppelt an `golden:vergleich` sowie `check:normtext` und
`check:struktur-konsistenz`: **Tempo zählt nur, wenn die Treue grün bleibt.**

Detail-Begründungen je Regel: `fahrplaene/FAHRPLAN-PERFORMANCE.md` (Querschnitt `QS-PERF`).

## §-Konkordanz (für Alt-Verweise im Bestand)

Die Unterparagraphen von §15 sind seit dem A4-Umzug (25.7.2026, `b2fa14dda`)
hierher gezogen. Gut 150 Verweise im Bestand zeigen weiterhin auf die alten
Nummern — sie lösen hier auf. Die Reihenfolge ist 1:1 erhalten: die Ziffer der
Bauregel ist die Ziffer der alten Unternummer.

| Alt (`CLAUDE.md` §15) | Neu (dieser Skill) |
|---|---|
| §15.1 Keine DOM-entfernende Virtualisierung von Normtext | Bauregel 1 |
| §15.2 CLS = 0 durch reservierten Platz, nie durch weniger Inhalt | Bauregel 2 |
| §15.3 Schwere Features lazy und off-critical-path, nie eager-Korpus | Bauregel 3 |
| §15.4 Memoisierung ist Pflicht (React Compiler aus) | Bauregel 4 |
| §15.5 Render-then-replace bleibt; kein naives `hydrateRoot` | Bauregel 5 |
| §15.6 Long-Tail on demand bleibt inhaltsvollständig | Bauregel 6 |
| §15 bar zitiert (Grundsatz, Logikverlust-Begriff, Perf-Tor) | bleibt `CLAUDE.md` §15; Wortlaut hier im Kopf, «Was ‹Logikverlust› heisst» und «Messung» |

**Über §15.6 hinaus gab es nie eine Unternummer** — ein Verweis auf §15.7+ ist
ein Tippfehler, kein Umzugsverlust.

Zwei Stellen sind beim Auflösen zu beachten:

- Die alten Nummern waren schon vor dem Umzug **Kurzschrift**: die Vor-A4-Fassung
  (`git show b2fa14dda^:CLAUDE.md`, Z. 352 ff.) zählte «1.–6.» ohne §-Anker. Der
  Umzug hat den Verweis nicht verschoben, sondern die Kurzschrift zur Sackgasse
  gemacht.
- Verweise auf das **Tor** im alten §15-Schluss (`check:perf-budget` als
  Lighthouse-Lauf) treffen einen überholten Sachverhalt: seit der Faktenkorrektur
  vom 7.8.2026 sind es zwei getrennte Tore, siehe «Messung». Massgeblich ist dort
  der heutige Text, nicht die Alt-Formulierung.

Verweise werden **nicht umgeschrieben** — die Anker-Logik hält die alten Nummern
stabil, diese Tabelle löst sie auf (gleiches Muster: Skill `auftrag` Ziff. 9 für
§14.x, Skill `refactoring` Ziff. 8 für §6.x).
