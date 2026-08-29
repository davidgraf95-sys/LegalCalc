# scripts/archiv — abgeschlossene Einmal-/POC-Skripte (H-5/B7+B29: Archiv-Move statt Löschen — Reproduzierbarkeits-Beweise für Datenstände, §11-nah; Ausführungs-Beleg je Kopfzeile)

- `ti-miete-generieren.ts` — TI_MIETE-Patch aemterKantone.json (Dossier §51), angewandt 12.6.2026
- `refetch-bestand-netz.ts` — Erwägungs-Re-Fetch Bestands-Korpus via OCL, marke 34 %→91 %
- `backfill-legal-area.ts` — legalArea-Backfill (258 BGer + 3 Kanton), Commit `efd5ebd2`
- `poc-linkedom-tiefenzaehler.ts` — W2·5b-POC, Verdikt «Regex bleibt» (Register-Beleg 5.7.2026)
- `kanton-fuellpunkt-nachzug.ts` — Kanton-Nachzug Füllpunkt-Tarifzeilen G3b Schritt 3 (Klasse C), angewandt 5.7.2026
- `kanton-spalten-nachzug.ts` — Kanton-Nachzug aufs kanonische `spalten`-Modell G3b Schritt 1 (Klasse A+D), angewandt 5.7.2026
- `remap-sachgebiet.ts` — GELÖSCHT 29.8.2026 (J3, Bug-Check B5): lief noch auf der Vor-J3-Kette (ungefilterte legal_area, kein StG-Signal) und hätte per `--schreiben` die F1/F2-Fehlklassierungen wieder eingespielt; Nachfolger ist `scripts/normtext/remap-sachgebiet-j3.ts`
- `rubrum-bereinigen.ts` — Bestands-Reinigung implausibler Rubrum-Felder (Falsch-Positive des Best-effort-Extraktors)
- `sachverhalt-strukturieren.ts` — Bestands-Strukturierung des Sachverhalts (Buchstaben-Abschnitte A.a/A.b …) mit Wort-Invariante
