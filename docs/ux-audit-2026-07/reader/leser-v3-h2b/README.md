# Kontaktbogen H2b — Ästhetik-Nachzug (17.8.2026, Branch `feat/leser-v3-h2b`)

Bilder zum Vollzugsvermerk H2b in `fahrplaene/FAHRPLAN-LESER-V3.md` (Kap. 7).
Dort steht die Position-für-Position-Abrechnung samt Messwerten und
Rot-Beweisen; diese Datei erklärt nur, **was auf welchem Bild zu sehen ist**.

## Aufbau

`vorher/` = Stand `022c3088e` (Ende H2) · `nachher/` = Stand H2b. Gleiche
Erlasse, gleiche Breiten, gleiche Modi, gleiche Wartezeiten — erzeugt mit
demselben Skript gegen `vite preview` aus `dist/`.

| Achse | Werte |
|---|---|
| Breiten | Desktop 1440 × 900 · Mobil 390 × 844 · Split 1440 (zwei Panes) |
| Modi | hell · dunkel (Schlüssel `lexmetrik-thema`, wie die App ihn setzt) |
| Erlasse | `stpo-429` Bundesgesetz **mit** Warnzeile «nicht konsolidiert» · `vmwg` Verordnung · `lugue` Staatsvertrag (langer Titel) · `zh-211-11` Kantonserlass mit §-Etikett |
| Split | `split-stpo-vmwg-*` im Ruhezustand · `split-suche-*` mit laufender Suche |

Die vier Erlasse sind die **Bund-Probe** aus Kap. 7: ein Bundesgesetz, eine
Verordnung, ein Staatsvertrag und ein Kantonserlass müssen identisch aufgebaut
sein. Unterschiede im Bild dürfen nur aus dem Datenmodell stammen (Etikett
«Artikel»/«Paragraphen», Overline, Vorhandensein der Warnzeile).

## Worauf zu schauen ist

| Bildpaar | Der Unterschied |
|---|---|
| `desktop-*` (alle) | App-Seitenleiste ist eingeklappt (Ä1c) — die Lesefläche gewinnt 256 px; der V3-Kopf sitzt bündig unter der Krumen-Leiste statt 48 px darunter (Ä1a); die Übersichtsbox in der Leiste ist kein gerahmter Kasten mehr (Ä5) |
| `desktop-zh-211-11-*` | Der lange Kantons-Name steht in der V3-Ortsangabe **einmal** statt zweimal (Ä21); die Leiste zählt «23 Paragraphen» (Ä23) |
| `desktop-lugue-*` | Die Kennung «LugÜ» steht **vor** dem dreizeiligen Volltitel statt am Ende (Ä-(d)) |
| `mobil-*` | Das Such-/Sprungfeld steht sichtbar im klebenden Kopf-Block — vorher war es nur hinter ☰ erreichbar (Ä18/Ä19); der Platzhalter nennt eine Bestimmung, die es hier gibt (Ä20) |
| `split-stpo-vmwg-*` | **Je Pane ein Suchfeld** (vorher: keines, gemessen `count === 0`) — der gewichtigste Befund des Reviews (Ä19) |
| `split-suche-*` | Der Zähler «49 Artikel · 110 Fundstellen» steht vollständig da und ist nicht ellipsiert (Ä15); die Zeile «Treffer anzeigen →» benennt den Weg zur Liste, statt ihn als ☰ erraten zu lassen; der Lesetext bleibt in beiden Panes sichtbar |

**Richtigstellung 17.8.2026 (H2b-Nachzug, Befund der Bug-Check-Prüfung).** Für
das Paar `split-suche-*` gibt es **kein echtes Vorher-Bild**: `vorher/split-suche-hell.png`
und `vorher/split-stpo-vmwg-hell.png` sind derselbe Blob
(`e402f52a6a86ce8d87cf6edd77e9cfcbc175aa9e`), ebenso die beiden dunklen
(`b07c157f…`). Das ist kein Aufnahmefehler, sondern der Befund selbst: im
Split gab es vor H2b **kein Suchfeld**, also liess sich dort keine Suche starten
und kein Vorher-Zustand «mit laufender Suche» aufnehmen. Die zwei Vorher-Bilder
zeigen darum den Ruhezustand — die Nachher-Bilder sind die einzige Aufnahme
einer laufenden Split-Suche, die es gibt. Die Zeile oben ist als
Nachher-Beschreibung zu lesen, nicht als Vergleich.

## Was die Bilder NICHT zeigen können

Hover- und Fokuszustände (Ä8, Ä14) und die Trefferzeilen-Schnipsel (Ä17) hängen
an einer Interaktion; sie sind statt am Bild an Messwerten und Specs abgenommen
(Vollzugsvermerk H2b, Spalte «Beleg»). Der Hover-Befund Ä8 liegt zudem im Kern
und wirkt in **beiden** Hüllen — dort ist die Spec der einzige verlässliche
Zeuge, weil ein Screenshot den Mauszeiger nicht mitbringt.

Dasselbe gilt für **alles, was der H2b-Nachzug (17.8.2026) geändert hat**: die
zehn Positionen Ä35–Ä44 hängen an Fokus, Tastatur, Overlay-Reihenfolge und
Speicherzustand. Es gibt darum bewusst KEINE neue Bildserie, sondern Messwerte
und Specs — Vollzugsvermerk **H2b-NACHZUG** in `fahrplaene/FAHRPLAN-LESER-V3.md`
(Kap. 7), mit 27 Rot-Beweisen. Ein Screenshot kann nicht zeigen, wo der Fokus
steht, was Esc tut oder was im `localStorage` liegt.
