# FAHRPLAN-CODE-VERBESSERUNG — Bau-Specs der Code-Inventur 4.8.2026

**Herkunft:** Drei read-only Explore-Analysen am Stand `2c4d97e54` (Auftrag
David 4.8.2026, «plane Verbesserung des Codes, denk gross»; Einbau-Anordnung
«ok baue es ein»). Vollständige Befunde mit Belegen:
[code-inventur-2026-08-04.md](../bibliothek/betrieb/code-inventur-2026-08-04.md).
Dieser Fahrplan trägt nur die **Bau-Specs** der fünf neuen Schritte (§1–§5)
und das Verortungs-Register (§6): welche Befunde in bestehende Schritte
geflossen sind, damit nichts doppelt geführt wird.

Gemeinsame Leitplanken aller Schritte: §1 (Korrektheit vor allem), §6
(Verhaltensneutralität beweisen — Tests unangepasst, Golden byte-gleich),
Skill `refactoring` für jeden Umbau, `istRisikoPfad()` entscheidet über die
Gegenprüfungspflicht, nicht die Selbsteinschätzung.

---

## §1 QS-CODE-TURSO · Sync-Durchsatz-Wurzelfix

**Befund:** `turso-sync.yml` misst 32.8 min, davon 22.3 min allein der
zeilenweise Insert in `fts_entscheide_schaufenster` (~4 Zeilen/s, 165 MiB);
Bandbreite als Ursache im Workflow-Kommentar ausgeschlossen. Timeout-Reserve
90 min ⇒ der Entscheid-Korpus trägt ~3.7× seine heutige Grösse — dann steht
der Kantons-Ausbau (`W2·13-KANTONE`) vor der Wand.

**Bau:** Wurzel-Fix des Insert-Pfads in `scripts/datenhaltung/turso-sync.ts` —
Kandidaten in Prüf-Reihenfolge: (a) Batch-/Multi-Row-Statements bzw. grössere
Transaktionsblöcke, (b) `fts_`-Rebuild serverseitig aus der Content-Tabelle
statt Zeilen-Replikation, (c) Dump-/Import-Transport statt Statement-Replay.
Jede Variante zuerst an einer Teiltabelle messen (Verteilung, nicht Einzelwert
— §0 Ziff. 3), dann umstellen.

**Fertig, wenn** der Voll-Sync unter ~15 min liegt **und** die Schaufenster-
Tabelle nach dem Sync zeilen- und stichproben-inhaltsgleich ist (Manifest-shas
grün, `check:turso-frische` grün, ein dokumentierter Vorher/Nachher-Messwert).

**Risiko:** `scripts/datenhaltung` ist Risikopfad ⇒ Gegenprüfung. **Abgrenzung:**
Datenhaltungs-Architektur (E-Etappen, VPS, §5-Artefakt) bleibt `W2·6-DATA`/
`QS-DATA`; hier wird nur der Durchsatz des BESTEHENDEN wöchentlichen Syncs
gefixt. Die Wachstums-Schwellen-Überwachung bleibt `QS-AUTOMATIK`.

## §2 QS-CODE-FRISTENKERN · Grenzwert-Batterie für die geteilte Fristen-Infrastruktur

**Befund:** `src/lib/fristenEngine.ts` (198 Z) trägt `fristendeTage`,
`fristendeKalender`, `normalisiereEnde`, `nthWerktagNach` und die
Stillstands-Perioden für fünf Rechtsgebiets-Engines — und hat 6 direkte
Testfälle. Ein Fehler dort schlägt gleichzeitig auf ZPO-, SchKG-,
Verjährungs- und Mietfristen durch.

**Bau:** Reiner Test-**Zubau** (keine bestehende Test-Änderung, §6.3), eigene
Datei `src/tests/fristenEngine.grenzen.test.ts`: Monatsend-Fälle (31.→28./29.,
Schaltjahr), Feiertags-Kaskaden (Ende auf Feiertag+Wochenende-Folge),
Stillstands-Überschneidungen (Frist beginnt/endet IN der Periode, Periode
umschliesst Frist), `nthWerktagNach` über Jahreswechsel, Grenzwerte 0/1 Tag.
Jeder Fall mit Norm-Anker im Kommentar. Zweitrangig, gleiche Natur: je eine
Mini-Batterie für `bggVwvgFristen` (5 Fälle heute) und `suche/artikelRanking`
(0 direkte Tests, Reihenfolge-Logik).

**Fertig, wenn** die Batterie steht, grün ist und mindestens ein Fall je
Kategorie durch bewusste Mutation der Engine **einmal rot** gezeigt wurde
(§6.7-Geist: ein Test, der nicht scheitern kann, beweist nichts).
`Gegenpruefung: n/a — reine Prüflogik` (kein Engine-Code angefasst; falls die
Batterie einen ECHTEN Fehler findet, ist dessen Fix ein eigener
Risikopfad-Schritt mit Gegenprüfung).

## §3 QS-CODE-AUSSENKANTEN · Unbewachte Aussenkanten härten (UI-Normzitate-Tor + JSON-Typkanten)

**Befund a:** 1'141 hart kodierte `Art.`-Zitate in 107 `pages`/`components`-
Dateien sind eine zweite Norm-Quelle neben den Engine-Zitaten; kein Tor prüft
sie. Ändert ein Erlass seine Nummerierung, ist die Trefferfläche unkontrolliert.
**Befund b:** 9× `as unknown as` an JSON-Importen in `src/data/{plz,
schlichtung,betreibung}` — bei Struktur-Drift schweigt der Compiler.

**Bau a:** Neues Tor `check:ui-normzitate` (scripts/, read-only): extrahiert
`Art.`-Zitate mit Erlass-Kontext aus `src/pages` + `src/components` und prüft
sie gegen das Norm-Register (Existenz des Artikels im referenzierten Erlass);
Allowlist mit Begründung für nicht-auflösbare Fälle (Fremdrecht, Prosa).
Meldung zuerst (`--no-exit-code`-Phase wie bei `check:tot`), Blockierend erst
nach Basislinien-Deklaration. **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7:
ein künstlich falsches Zitat muss gemeldet werden).
**Bau b:** Je JSON-Kante ein `zod`-freier struktureller Guard (vorhandene
Muster in `src/data` nutzen; kein neues Paket) oder ein generiertes Interface +
Ladezeit-Assertion; die 9 `as unknown as` fallen weg.

**Fertig, wenn** Tor verdrahtet (mindestens in `check:seriell`), einmal rot
gezeigt, und `grep -c "as unknown as" src/data` = 0. Verhaltensneutral
(`Gegenpruefung: n/a — reine Prüflogik` für a; b golden byte-gleich).

## §4 QS-CODE-ENTDOPPLUNG · Entdopplungs-Programm Darstellungsschicht (D1–D7)

**Befund:** Sechs belegte Duplikationsmuster (Details + Fundstellen im
Bibliotheks-Dossier §3). Ausdrücklich §3-konform: Verkleinerung findet in der
Darstellungsschicht statt, `src/lib` wird nicht berührt.

**Bau — Reihenfolge nach Hebel, je Posten ein eigener PR** (nicht bündeln über
Risiko hinweg; jede Einheit e2e-grün + golden byte-gleich, Skill `refactoring`):

1. **D6** `VorlageAgGruendung.tsx` auf `useWizardState` (55 useState → 1;
   Serialisierungs-Block entfällt).
2. **D1** 24 Vorlagen-Seiten auf den existierenden Rahmen `VorlagenSeite.tsx`
   ziehen; dabei `istIsoDatum()`/`docxAktiv()` statt der 15/51 Inline-Kopien.
   In Tranchen (z. B. 6er-Gruppen), nicht als Monster-PR.
3. **D2** `GerichtsWahlBlock`-Komponente extrahieren (6 Kopien).
4. **D4** Hook `usePermalinkFelder(spec, defaults)` als erstes Mitglied eines
   neuen `src/hooks/`; die 17 wortgleichen Einlese-Blöcke umstellen.
5. **D3** `KantonsVergleichTabelle` (4 Kopien).
6. **D5** handgerollte Kacheln auf `SelectionGrid` (+ `aria-pressed`-Gewinn);
   **D7** rohe Checkboxen auf `<Checkbox>` opportunistisch je berührter Datei.

**Fertig je Posten, wenn** Golden-/e2e-Beweis vorliegt und die Kopienzahl im
Dossier-Befund messbar gesunken ist. **Kollisionsvorsicht:** Vorlagen-Fläche
ist ruhig, aber vor jedem Posten die drei §0-Sonden fahren.

## §5 QS-CODE-SPLITS · Grossdatei-Aufteilungen mit klarem Schnitt

**Befund:** Sechs Misch-Dateien mit dokumentiertem Trenner (Dossier §2):
`fedlex.ts` (4 Achsen) · `zustaendigkeit.ts` (2 Engines, Schnitt Z 655) ·
`besetzung.ts` (Parser↔Kanon, Z 690) · `prozesskosten.ts` (Rechner↔Bericht) ·
`zitat-extraktion.ts` (Regex-Korpus↔Extraktoren) · `EntscheidLeser.tsx`
(893-Z-Monolith; Vorbild: `gesetz-leser/` ist in 28 Dateien zerlegt).

**Bau:** Je Datei ein eigener verhaltensneutraler Schritt nach Skill
`refactoring` (Fassaden-Muster: alte Import-Pfade re-exportieren, Golden
byte-gleich, Tests unangepasst). Reihenfolge opportunistisch — **immer dann,
wenn ohnehin an der Datei gebaut wird**, nie als Selbstzweck-Welle.
`gruendungsunterlagen.ts` nur trennen (GmbH/AG), nie verschmelzen (§4
regime-treu). **Risiko:** `fedlex.ts`/`zustaendigkeit.ts`/`besetzung.ts`
liegen auf oder nahe Risikopfaden — `istRisikoPfad()` entscheidet, im
Zweifel Gegenprüfung. `EntscheidLeser.tsx` kollidiert mit `QS-UI-HIGHLIGHT`
(gleiche Datei) — bündeln oder sequenzieren, nicht parallel.

## §6 Verortungs-Register — Befunde, die NICHT hier gebaut werden

| Befund | Gehört zu | Vermerk |
|---|---|---|
| Suchindex-Monolith 45.9 MB / Budget 91 % + Eager-Kette `Sidebar→navigation→register` (276 KB roh je Route) + Entry 87 % Budget | **`QS-PERF`** Posten c (FAHRPLAN-PERFORMANCE §1) | dort bereits als «Suchindex in Worker/`export()`, `register.json` sharden» geführt; Inventur liefert die Ist-Zahlen |
| Nirgends laufende Tore `check:suchindex` / `check:rss-oc` / `check:confidence` | **`QS-AUTOMATIK-PARITAET`** | ROADMAP-Eintrag am 4.8.2026 um diese drei erweitert |
| Manifest-Nullzeilen (5 Tabellen) + Prod-Smoke-Doppelung (sh vs. ts) | **`QS-AUTOMATIK`** | ROADMAP-Eintrag am 4.8.2026 ergänzt; Nullzeilen sind zuerst eine David-Frage (§7) |
| `@vitest/coverage-v8` entfernen | **`QS-BASIS-DEPS`** | einzige echt ungenutzte devDependency; `linkedom` bleibt (5 produktive Nutzer trotz POC-Kommentar) |
| e2e-Shard-Balance | erledigt | am 4.8.2026 bereits neu gepackt (QS-PERF-Unterpunkt ✅) |
| 5 One-Shot-Skripte nach `scripts/archiv/` · `erfasste-keys.generated.ts`-Ortszuordnung · `'rsp-fs-idx'`-Key-Präfix · Formatter-Restdublette (`chf` 3×) | Kleinvieh | bei der nächsten Session auf der jeweiligen Fläche mitnehmen; kein eigener Schritt |

## §7 Offene David-Entscheide

1. **Manifest-Nullzeilen:** Sind die 5 leeren Tabellen in `daten-manifest.json`
   gewollte Ausbaustufe oder eine stille Lücke des Frische-Wächters?
2. **`normalisiereTarifText`-Freigabe:** Der Code-Kommentar (`ArtikelBody.tsx:257`)
   zitiert eine Freigabe «David 17.6.2026» — bestätigen und als Satz ins
   Normtext-Domänen-Reglement heben, oder Normalisierung zurückbauen. Bis zum
   Entscheid gilt der Kommentar als unbelegte Behauptung (§14.7-Geist).
