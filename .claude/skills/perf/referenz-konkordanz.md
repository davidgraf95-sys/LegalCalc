# Perf — Referenz: §-Konkordanz für Alt-Verweise (§15.x)

<!-- Wortlaut unverändert aus SKILL.md ausgelagert (QS-EFFIZIENZ 15.8.2026,
     Skills-Diät). Reine Verweis-Auflösung: gebraucht nur, wenn ein
     Bestands-Verweis «§15.x» aufzulösen ist — darum nicht mehr im Skill-Kopf.
     Verweise werden NICHT umgeschrieben; diese Tabelle löst sie auf. -->

Die Unterparagraphen von §15 sind seit dem A4-Umzug (25.7.2026, `b2fa14dda`)
hierher gezogen; gut 150 Bestands-Verweise lösen hier auf. Die Ziffer der
Bauregel ist die Ziffer der alten Unternummer (1:1).

| Alt (`CLAUDE.md` §15) | Neu (Skill `perf`) |
|---|---|
| §15.1 Keine DOM-entfernende Virtualisierung von Normtext | Bauregel 1 |
| §15.2 CLS = 0 durch reservierten Platz, nie durch weniger Inhalt | Bauregel 2 |
| §15.3 Schwere Features lazy und off-critical-path, nie eager-Korpus | Bauregel 3 |
| §15.4 Memoisierung ist Pflicht (React Compiler aus) | Bauregel 4 |
| §15.5 Render-then-replace bleibt; kein naives `hydrateRoot` | Bauregel 5 |
| §15.6 Long-Tail on demand bleibt inhaltsvollständig | Bauregel 6 |
| §15 bar zitiert (Grundsatz, Logikverlust-Begriff, Perf-Tor) | bleibt `CLAUDE.md` §15; Wortlaut im Skill-Kopf, «Was ‹Logikverlust› heisst» und «Messung» |

**Über §15.6 hinaus gab es nie eine Unternummer** — ein Verweis auf §15.7+ ist
ein Tippfehler, kein Umzugsverlust. Zwei Fallen beim Auflösen: die alten Nummern
waren schon vor dem Umzug Kurzschrift (Vor-A4-Fassung `git show
b2fa14dda^:CLAUDE.md` zählte «1.–6.» ohne §-Anker), und Verweise auf das Tor im
alten §15-Schluss (`check:perf-budget` als Lighthouse-Lauf) sind seit der
Faktenkorrektur 7.8.2026 überholt — massgeblich ist «Messung» im Skill.

Gleiches Muster: `auftrag/referenz-konkordanz.md` für §14.x,
`refactoring/referenz-konkordanz.md` für §6.x.
