<!-- Definition of Done (Skill `auftrag` Ziff. 4) — Haken erst setzen, wenn belegt. -->

## Was ändert dieser PR?

<!-- 1–3 Sätze. Bei Bau-Einheiten: Roadmap-Schritt nennen. -->

## Definition of Done

- [ ] **Tore grün**: `npm run gate` lokal, Exit 0 (Ausgabe im PR oder Commit belegt)
- [ ] **Golden byte-gleich** — oder die Abweichung ist als fachliche Änderung
      im selben Commit deklariert und begründet (§6)
- [ ] **Risiko-Pfad?** Falls `istRisikoPfad()` eine geänderte Datei trifft:
      adversariale Gegenprüfung gelaufen, Verdikt im Register
      (`bibliothek/register/gegenpruefung-register.md` +1 Zeile), Trailer gesetzt
- [ ] **Trailer**: `Roadmap: <ID>` und ggf. `Gegenpruefung: …` (Leerzeile VOR dem
      Trailer-Block, §14.5)
- [ ] **Plan-Rückschrieb** nach der Landung: `npm run plan:set -- <id> status=done`
      + `npm run check:plan`
- [ ] **STRUKTUR-Karte** in derselben Session nachgezogen (Skill `auftrag` Ziff. 4a)

<!-- Landung: seriell nach Skill `landung` — EIN PR aufs Mal, generierte Dateien
     nie von Hand mischen, cancelled/skipped zählen als rot. -->
