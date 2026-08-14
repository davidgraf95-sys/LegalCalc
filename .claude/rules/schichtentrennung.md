---
paths:
  - "src/**"
---
# §3 Schichtentrennung: Logik ≠ Darstellung

<!-- Wortlaut unverändert aus CLAUDE.md §3 hierher verschoben (QS-HOOKS-AUSBAU
     14.8.2026). Lädt pfad-gescoped bei Berührung von src/** — Doku-Sessions
     tragen die Regel nicht mehr im Grundrauschen. §-Nummer bleibt vergeben. -->

- **`src/lib/`** enthält die gesamte Rechtslogik und keine UI. Jede Rechtsregel
  lebt an genau **einer** Stelle.
- **`src/pages/`, `src/components/`** enthalten Darstellung, Navigation,
  Speicherung — und keine Rechtslogik: keine Fristberechnung, keine
  Schwellenwerte, keine Normtexte ausserhalb von Schema oder Engine.
- Verkleinerungen (Entdopplung, Hooks, generische Rahmen) finden deshalb in der
  Darstellungsschicht statt. Umbauten der Logikschicht laufen ausschliesslich
  über das Protokoll von §4/§6, nie beiläufig im Zuge einer UI-Verkleinerung.
