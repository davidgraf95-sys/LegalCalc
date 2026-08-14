---
name: gegenpruefung
description: Use when the LexMetrik gate `check:gegenpruefung` is red, or before committing changes to risk paths (Extraktion/Rechnen/Norm-Tarif). Trigger-Beispiele (nicht abschliessend): src/lib/vorlagen, src/lib/tarif, src/data/tarif, src/lib/fristenspiegel, src/lib/normtext, scripts/normtext, public/normtext (*.json), scripts/fedlex-*, scripts/datenhaltung, daten/, scripts/materialien, scripts/verzahnung, src/lib/verzahnung/revisionen-extrakt.ts, plus Rechen-Engines (verjaehrung/streitwert/schkg/beurkundung/gruendung/bger). Massgeblich: istRisikoPfad() in scripts/gegenpruefung/kern.ts.
---

# Gegenprüfung — adversariales Protokoll (QS-GP)

## Zweck

Die teuersten LexMetrik-Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust,
falsche Frist/Quote — Vorfallswelle Juni/Juli 2026, prominentester Fall PR #309
am 20.7.2026: elf erfundene Amtsträger:innen ~1 h auf Prod; Tor-Geburtsbeweis
`f87921e53`) sind an **Session-Blindheit** entstanden: der Autor prüft
seinen eigenen Output und übersieht dieselbe Lücke zweimal. Dieser Skill ist der
**unabhängige Zweitdurchgang**. Auftrag ist nicht «bestätigen», sondern
**widerlegen** — den Output aktiv zu Fall bringen.

Das Tor `check:gegenpruefung` (in `npm run gate`) blockiert jeden Diff auf einer
Risiko-Datei, bis genau für diesen Diff ein `bestanden`-Nachweis vorliegt.

## Eiserne Regeln

1. **Unabhängig & frischer Kontext.** Diesen Durchgang idealerweise als eigener
   Sub-Agent / eigene Session mit **frischem Kontext** und Modell **Opus**
   (Daueranweisung David) fahren — nicht im selben Gedankengang, der den Output
   erzeugt hat.
2. **Amtliche Quelle vor sich.** Immer gegen die **amtliche** Fassung prüfen
   (Fedlex-Filestore-HTML für Bund, LexWork/amtlicher Erlass für Kanton), nicht
   gegen den Code, nicht gegen eine zweite Ableitung. Bei Unsicherheit zur
   Quell-Wahl den Skill `scraping-swiss-official-sources` heranziehen.
3. **Widerlegen, nicht abnicken.** Aktiv nach dem Fehler suchen. Erst wenn ein
   ernsthafter Widerlegungsversuch scheitert, ist das Verdikt `bestanden`.
4. **Belegpflicht.** Jeder Befund UND jedes `bestanden` mit konkreter Norm
   (Artikel/§) + Link + Stand hinterlegen (Daueranweisung David: doppelt
   verifizieren, jeder Wert mit Norm-Anker).

## Minimum eines echten Durchgangs

«Ernsthaft widerlegen» (Regel 3) und «echter Durchgang» heissen mindestens,
**in dieser Prüfsession**:

1. Die amtliche Quelle **tatsächlich geöffnet** — nicht aus Erinnerung zitiert,
   egal wie lange sie vorhin offen war.
2. Den unabhängigen Wert/Text **schriftlich notiert, BEVOR** mit dem Output
   verglichen wird. Wer den Ausgabewert schon gesehen hat — der Autor immer —,
   ist geankert: dann blind aus der Norm rechnen/ableiten, Resultat hinschreiben,
   erst danach vergleichen. Den Code zu lesen ist kein Ersatz: Lesen reproduziert
   dessen Fehler mitsamt der Autoren-Lücke; der Beweis ist das unabhängige
   Nachrechnen aus der Norm.
3. Mindestens einen **Randfall** konkret durchgespielt (Staffel-Grenze, Rundung,
   `bis`/`ter`, Regime-Wechsel).

Fehlt eines davon, ist das Verdikt nicht `bestanden` — egal wie plausibel der
Output wirkt. Das «idealerweise» in Regel 1 betrifft nur das Vehikel (Sub-Agent
vs. eigene Session); es erlaubt nie, dass der Autor im selben Gedankengang
abnickt. **Den Buchstaben der Gegenprüfung erfüllen (Token quittieren ohne
echten Widerlegungs-Durchgang) verletzt ihren Geist** — `gegenpruefung:ok`
prüft die Belege technisch nicht, genau deshalb bist du die Prüfung, nicht das
Tool.

## Rationalisierungen (und warum sie nicht zählen)

| Ausrede | Realität |
|---|---|
| «Ich hatte die Norm drei Stunden vor mir — nochmal öffnen ist Ritual.» | Das war die Autorensicht. Prüfung beginnt mit dem Öffnen der amtlichen Quelle in der Prüfsession — plausibel ≠ geprüft. |
| «Mein Kopf-Überschlag stimmt grob — das IST das Nachrechnen.» | Kopf-Überschlag zählt NICHT. Unabhängiger Wert schriftlich VOR dem Vergleich, plus Randfall. |
| «Regel 1 sagt nur ‹idealerweise› — geht also auch ohne frischen Kontext.» | «Idealerweise» wählt das Vehikel, nicht ob geprüft wird. Autoren-Selbstabnahme im selben Gedankengang ist genau die Session-Blindheit aus dem Zweck-Abschnitt. |
| «Ich habe scharf draufgeschaut und keinen Fehler gefunden.» | Draufschauen ist kein Widerlegungsversuch. Ernsthaft = die drei Minimum-Punkte oben, nachweisbar. |
| «Code gelesen und verstanden = geprüft.» | Lesen reproduziert die Fehler des Codes. Nur unabhängiges Rechnen aus der Norm kann ihn widerlegen. |
| «Alle anderen Tore sind grün — ein Fehler wäre längst aufgefallen.» | Nachbar-Tore prüfen Form und Struktur, nie Norm-Treue. Dafür gibt es genau dieses Tor. |
| «David wartet / Autonom-Modus heisst durchziehen.» | Autonom-Modus hebt kein Tor auf. Zeitdruck ist nie ein Verdikt-Grund. |
| «Zu müde — ehrlicher ist quittieren und morgen frisch draufschauen.» | Ehrlich ist: NICHT quittieren, Tor bleibt rot, morgen prüfen. Müdigkeit macht `bestanden` nicht wahrer. |
| «Artikel + Link + Stand kenne ich auswendig, das schreibe ich in die Notiz.» | Ein Beleg aus dem Gedächtnis ist eine zweite Ableitung. Der Beleg entsteht am geöffneten Quelltext. |
| «Nur ein kleiner Fix mit einer Zahl.» | Die teuersten Bugs waren Ein-Wert-Fehler. Kleiner Diff = gleiches Protokoll. |
| «Risikolos — beim nächsten Edit kippt eh der Hash und es gibt einen neuen Durchgang.» | Der Hash erzwingt nur künftige Durchgänge, er findet keine Fehler. Ein falscher Wert steht bis dahin live. |
| «Der Durchgang von vorhin gilt weiter — der Folge-Edit war trivial, ich quittiere einfach neu.» | Der Nachweis bindet an genau EINEN Diff. Nach jedem Edit ist es ein neuer Output ⇒ neuer Durchgang. Neu quittieren ohne neu zu prüfen ist Token-Recycling von Hand — genau das, was der Hash verhindern soll. |
| «Drei Stunden Arbeit drin, nur die Quittung fehlt noch.» | Sunk Cost. Wenn wirklich alles verifiziert ist, kostet der echte Durchgang Minuten — wenn er sich «zu teuer» anfühlt, fehlt er. |

## Red Flags — STOP und neu ansetzen

Wenn eines davon zutrifft, bist du gerade am Abnicken:

- Du willst quittieren, ohne die amtliche URL **in dieser Prüfsession** geöffnet
  zu haben.
- Dein einziger «Nachweis» ist ein Überschlag im Kopf oder die Erinnerung an den
  eigenen Fix.
- Du hast den Code gelesen statt aus der Norm gerechnet.
- Du formulierst gerade, warum **diesmal** kein frischer Kontext / kein Randfall
  nötig ist.
- Du denkst «nur noch die Quittung» oder «Prüf-Theater».
- Der Grund fürs Quittieren ist die Uhrzeit, ein wartender Merge oder die bereits
  investierte Zeit — nicht ein gescheiterter Widerlegungsversuch.
- Du überträgst ein Verdikt aus einer Stichprobe oder einem früheren Durchgang
  auf den ganzen, inzwischen geänderten Diff.

## Beschaffung als Sub-Agent — was übergeben werden darf (QS-TOK/T11)

Wird dieser Durchgang als **eigener Sub-Agent** gefahren (Regel 1, empfohlen), darf der
Orchestrator dir die **Beschaffung** abnehmen, um die Fetch-/Such-Runde (~5–15k Tok) zu sparen —
aber **nie die Prüfung**:

- **Übergeben werden darf:** der **gepinnte amtliche Filestore-HTML-Pfad** (via
  `scripts/fedlex-cache.sh`) und der **Scope-Anker aus der roten Tor-Meldung** (welche
  Dateien/Artikel im Diff). Das ist reine Beschaffung.
- **Bei dir bleibt vollständig:** die **Re-Derivation aus der Norm** (unabhängig rechnen/
  ableiten, Randfall, schriftlicher Wert VOR dem Vergleich, Beleg mit §/Link/Stand). Der Pin
  ersetzt das Öffnen der Quelle in der Prüfsession NICHT — er ist die Quelle, die du öffnest.

**Common-Mode-Schutz (nicht verhandelbar):**

1. Führe den **Currency-Check SELBST** (`npm run check:fedlex-versionen` / `check:caches`).
   Übernimm den gepinnten Snapshot **nur bei eigenem Grün**; ist er überholt (Fedlex-P1a/b: Pins
   z. T. veraltet), hol die geltende Fassung **live** (Skill `scraping-swiss-official-sources`).
2. Übernimm **nie** den Grün-Status des Bau-Pfads, zeig **nie** auf den Code oder eine zweite
   Ableitung (Regeln 2+5). Ein übergebener Pin ist ein Start-Artefakt, kein Verdikt.

## Modus wählen

Sieh dir die geänderten Risiko-Dateien an (die rote Tor-Meldung listet sie):

### Modus Extraktion / Darstellung
für `scripts/normtext/**`, `src/lib/normtext/**`, `public/normtext/**.json`,
Snapshot-/Struktur-Outputs.

- Output **zeichenweise** gegen die amtliche Quellfassung vergleichen.
- Gezielt jagen: **Drop** (fehlende Artikel/Absätze/`items`/lit./Ziff.),
  **Leak** (Fussnoten-/Navigations-Text im Normtext), **zerrissene
  Abkürzungen**, **`bis`/`ter`-Verlust** (`art_335_c` etc.), Tabellen-Zellen,
  Tausendertrenner, falsches «aufgehoben».
- Vollständigkeit prüfen: **alle** Artikel des Erlasses vorhanden, nicht nur die
  zitierten (§7 Build-Regel).

### Modus Rechnen
für `src/lib/vorlagen/**`, `src/lib/tarif/**`, `src/data/tarif/**`,
`src/lib/fristenspiegel/**` und die Rechen-Engines
(`verjaehrung|streitwert|schkg|beurkundung|gruendung|frist|kosten|gebuehr|
zustaendigkeit|straf|bger`).

- **Unabhängig aus der Norm nachrechnen — den Code NICHT lesen.** Artikel für
  Artikel selbst rechnen (Frist, Quote, Gebühr, Zuständigkeit, Streitwert) und
  erst danach mit dem Ausgabewert vergleichen. Den Code zu lesen reproduziert
  dessen Fehler.
- Randfälle konstruieren: Grenzwerte der Staffeln, Rundung, Feiertags-/Computus-
  Verschiebung, Regime-Wechsel (§4 regime-treu — verschiedene Rechtsregimes
  dürfen nicht kollabiert sein).

## Ergebnis

- **`widerlegt`** → Befunde mit Norm-Beleg zurückgeben; NICHT quittieren. Erst
  fixen, dann erneut prüfen.
- **`bestanden`** → im Repo-Wurzelverzeichnis quittieren:

  ```
  npm run gegenpruefung:ok -- --verdikt=bestanden \
    --engine="<Snapshot/Engine>" \
    --quelle="fedlex <name> <YYYYMMDD>" \
    --notiz="<kurzer Beleg: was gegen welche Norm/Quelle geprüft>"
  ```

  Das berechnet den Diff-Hash (gleiche Kernfunktion wie das Tor), schreibt
  `bibliothek/.gegenpruefung-pending` und hängt die Register-Zeile an. Danach
  ist das Tor grün — solange die Dateien unverändert bleiben (erneutes Editieren
  kippt den Hash ⇒ neuer Durchgang nötig).

- **Commit-Trailer** setzen (§14 Trailer-Konvention):
  `Gegenpruefung: bestanden (Opus, <Linsen>) — <Befunde/„keine">`
  bzw. bei reiner Tor-/Test-Änderung `Gegenpruefung: n/a — reine Prüflogik`.

## Nicht-Ziele

- Kein Aufweichen eines anderen Tors, kein `--verdikt=bestanden` ohne echten
  Durchgang. Der Nachweis ist an genau diesen Diff gebunden; Recyceln alter
  Token ist ausgeschlossen (der Hash passt dann nicht).
