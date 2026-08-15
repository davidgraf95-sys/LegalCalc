# Refactoring — Referenz: §-Konkordanz für Alt-Verweise (§6.x)

<!-- Wortlaut unverändert aus SKILL.md Ziff. 8 ausgelagert (QS-EFFIZIENZ
     15.8.2026, Skills-Diät). Reine Verweis-Auflösung: gebraucht nur, wenn ein
     Bestands-Verweis «§6.x» aufzulösen ist. -->

Die Unterparagraphen von §6 sind seit dem A4-Umzug (25.7.2026) in den Skill
`refactoring` gezogen. Rund 220 Verweise im Bestand (Code-Kommentare,
Fahrpläne, Tests) zeigen weiterhin auf die alten Nummern — sie lösen hier auf:

| Alt (`CLAUDE.md`) | Neu (Skill `refactoring`) |
|---|---|
| §6.1 Ablauf, Tore vorher grün | Ziff. 1 |
| §6.2 Golden festhalten | Ziff. 1, Schritt 2 |
| §6.3 Tests nicht anpassen | Ziff. 2 — **steht zusätzlich weiter in `CLAUDE.md` §6** |
| §6.4 Performance ändert nur den Ladezeitpunkt | Ziff. 5 |
| §6.5 Diagnose sparsam | Ziff. 6 |
| §6.6 Datei-Schlankheit, Fassaden-Muster | Ziff. 4 |
| §6.7 Wann ein Tor ein Tor ist (a)–(d) | Ziff. 7 |

Gleiches Muster: `auftrag/referenz-konkordanz.md` für §14.x,
`perf/referenz-konkordanz.md` für §15.x.
