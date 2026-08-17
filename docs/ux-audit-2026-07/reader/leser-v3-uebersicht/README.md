# Bildbogen Übersichtsbox (17.8.2026, Branch `feat/leser-v3-uebersicht`)

Auftrag David: **«das übersichtfeld ist sehr unästhetisch. insbesondere wenn es
aufgeklappt ist. mach das schöner und orientiere dich an fedlex.»**

Die Position-für-Position-Abrechnung samt Messwerten und Rot-Beweisen steht im
Vollzugsvermerk «ÜBERSICHTSBOX» in `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7).
Diese Datei erklärt nur, **was auf welchem Bild zu sehen ist** — und woran man
den Fedlex-Bezug prüft.

## Aufbau

`vorher/` = Stand `afc008c19` (Ende S2) · `nachher/` = Stand nach Ä70–Ä74.
Gleiche Erlasse, gleiche Breiten, gleiche Modi, gleiche Wartezeiten, erzeugt mit
**demselben** Skript gegen `vite preview` aus `dist/`.

| Achse | Werte |
|---|---|
| Erlasse | `stpo` Bundesgesetz **mit** Warnung «nicht konsolidiert» · `vmwg` Verordnung · `lugue` Staatsvertrag · `bs-640-100` und `zh-211-11` Kanton mit §-Etikett |
| Breiten | `d-` Desktop 1440×900 · `h-` Handy 390×844 (Gliederungs-Blatt) · `split-` 1440 mit zwei Panes |
| Modi | `hell` · `dunkel` (Schlüssel `lexmetrik-thema`, wie die App ihn setzt) |
| Zustand | `-ruhe` zugeklappt · `-offen` aufgeklappt · `-seite`/`-blatt` = ganze Seite statt Box-Ausschnitt |

Die fünf Erlasse sind die **Neutralitätsprobe** aus Fahrplan Kap. 7: Bund,
Verordnung, Staatsvertrag und zwei Kantonserlasse müssen identisch aufgebaut
sein. Unterschiede im Bild dürfen **nur** aus dem Datenmodell stammen.

## Werkzeuge (beide committet, damit die Matrix reproduzierbar bleibt)

```
npm run build && npm run preview -- --port 4321 --strictPort
node docs/ux-audit-2026-07/reader/leser-v3-uebersicht/schuss.mjs <zielordner>
node docs/ux-audit-2026-07/reader/leser-v3-uebersicht/mass.mjs
```

`schuss.mjs` erzeugt den Bogen, `mass.mjs` die Messreihe (Kappung in px,
Zeilenzahl der Ruhezeile, Schrift-Familie, Zahl der Klapp-Ebenen, Vorkommen des
«massgeblich»-Halbsatzes). Zwei Fallen sind im Skript verankert, weil sie beim
ersten Anlauf zugeschlagen haben:

- Das Thema kennt **`hell`|`dunkel`|`auto`**. Der erste Lauf schrieb
  `dark`/`light`; das wird als «keine Wahl» verworfen und fällt auf
  `prefers-color-scheme` zurück — es entstanden **zwei byte-gleiche hell-Bilder**
  statt eines Paars. Gegenprobe seither: `d-stpo-hell-offen.png` ≠
  `d-stpo-dunkel-offen.png`.
- Auf dem Handy und im Split trägt kein Pane eine Spalte; die Box liegt dort im
  **Gliederungs-Blatt** hinter `[data-v3-gliederung-auf]`. Im **Treffer-Blatt**
  ist sie per Ä32/B11-Weiche bewusst abwesend (`e2e/leser-v3-blatt` (d)) — ein
  fehlendes Bild dort ist kein Aufnahmefehler.

## Worauf zu schauen ist

| Bildpaar | Der Unterschied |
|---|---|
| `d-*-ruhe` (alle fünf) | Die Ruhezeile ist **einzeilig** statt dreizeilig und läuft in der Sans statt in `Geist Mono Variable`. Der Stand ist aus ihr heraus in die Liste gewandert |
| `d-stpo-hell-offen` | Der Kern des Auftrags. Vorher: Etikett «ERLASS-ÜBERSICHT» mit eigener Linie, «Massgeblich ist stets die amtliche Fassung.» direkt unter einer Warnung, die denselben Halbsatz trägt, «Art: Bundesgesetz · Die Bundesversammlung der S…» mit Auslassungspunkten, zweite Klappe «Mehr zu diesem Erlass». Nachher: Label/Wert-Liste zwischen zwei Haarlinien, der Erlassgeber **vollständig** über drei Zeilen, keine zweite Überschrift, keine zweite Klappe |
| `d-bs-640-100-*-offen` | **Ä74**: vorher «Erlassdatum · Vom 12. April 2000 (Stand 1. Januar 2026)» und direkt darunter «Stand · 01.01.2026»; nachher nur noch «Vom 12. April 2000». Ausserdem stehen die beiden §8-Sätze (Erfassungsgrad des Kantons, Zähl-Etikett im Entwurf) jetzt offen statt hinter der zweiten Klappe |
| `d-lugue-*-offen` | Staatsvertrag: «Art · Staatsvertrag», und **keine** Zeile «In Kraft seit» — der Erlass trägt sie nicht, also entsteht sie nicht (§8, keine leere Wertspalte) |
| `d-zh-211-11-*-offen` | Der kürzeste Fall: **zwei** Zeilen (Art · Stand). Kanton ZH hat keinen Struktur-Sidecar (0 von 1193), also gibt es weder Erlassgeber noch Erlassdatum — und ohne verifizierte Systematik wird kein Sachgebiet behauptet. Die Liste ist kurz, nicht kaputt |
| `d-vmwg-*-offen` | Verordnung: dieselben Zeilen, anderer Wert («Verordnung», «Der Schweizerische Bundesrat») — kein `if (verordnung)` |
| `*-dunkel-*` | Label `ink-600`, Wert `ink-800`, Haarlinien `--line` — alle drei kommen aus den Rollen und drehen im Dunkelmodus mit; die Warnung bleibt `warn` |
| `h-*-offen` | Handy-Blatt @390: die Box bleibt in ihrer Breite, nichts tritt über den Rand (Ä10-Erbe, jetzt gemessen bewacht) |

**Ein Aufnahme-Artefakt, damit es niemand für einen Befund hält:** auf den
`-offen`-Bildern steht der Mauszeiger nach dem Klick noch auf der Ruhezeile, die
darum ihren Hover-Ton (`brass-700`) zeigt. Im Ruhezustand ist sie `ink-600`.

## Die Fedlex-Referenz daneben

`docs/ux-audit-2026-07/fedlex/or-top.png` (SR 220, Stand 23.06.2026) zeigt links
neben dem Erlass die Karte **«Allgemeine Informationen»**: Label links, Wert
rechts, je Paar eine Zeile, dazwischen Haarlinien — «Abkürzung OR», «Beschluss
30. März 1911», «Inkrafttreten 1. Januar 1912», «Quelle AS 27 317»; Sans, keine
Doppelpunkte, keine gemischten Schriftstimmen. Darunter zwei weitere Karten
(«Werkzeug», «Alle Fassungen»). Im Textkopf steht der Datumssatz «vom 30. März
1911 (Stand am 1. Januar 2026)».

**Übernommen:** der Label/Wert-Rhythmus, eine Zeile je Angabe, Sans für alles
Meta, keine Doppelpunkte, das Datum in der amtlichen «vom …»-Form.

**Nicht übernommen — mit Grund:**

| Fedlex | LexMetrik | Warum |
|---|---|---|
| gerahmte Karte | keine Fläche, keine Kante — nur EINE Haarlinie über und EINE unter der Liste | Design-Grundlage Kap. 8 Nr. 1: «Keine Rahmen/Boxen um jedes Element — Trennung über Weissraum, dann Linie». Genau dieser Kasten war der Ä5-Befund aus H2b |
| Haarlinie je Zeile | Weissraum auf dem 4-px-Raster | eine Linienrolle pro Ebene (Kap. 3); acht Linien in einer 18-rem-Leiste sind Gitter, nicht Rhythmus |
| **drei** Karten übereinander, aufgeklappt | **eine** Box, zugeklappt | Fahrplan Kap. 4b Pos. 10 wörtlich: «Eine Übersichtsbox, nicht sticky (Fedlex hat drei)» — wer im Gesetz liest, sucht in der Leiste die Gliederung, nicht die Metadaten |
| Werte rechtsbündig | linksbündig auf einer Kante | Fedlex' Karte ist ~200 px breit und trägt kurze Werte; hier bleiben nach der Label-Spalte ~184 px, und ein umbrechender Wert («Die Bundesversammlung der Schweizerischen Eidgenossenschaft») liefe rechtsbündig mit ausgefranstem linkem Rand |
| «Zitate», «Chronologie», «Änderungen» als Kartenzeilen | nicht in der Box | die tragen bei uns das Panel (H3, «ein Ort, drei Reiter») — sie hier zu spiegeln hiesse, dieselbe Sache an zwei Orten zu pflegen (§5) |

## Was die Bilder NICHT zeigen können

Die Erlass-Neutralität über die Fälle hinaus, die kein Bild hat: ein Erlass ohne
SR-Nummer (12 von 1469), einer mit leerem `stand` (2), ein ganz aufgehobener,
einer ohne amtliche Quelle. Die stehen als Fälle in
`src/tests/leser-v3-uebersicht.test.ts`; die Geometrie (Kappung, Überlauf,
Wertkante, Schriftfamilie, Zahl der Klappen) misst
`e2e/leser-v3-uebersicht.e2e.ts`.
