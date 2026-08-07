# Ent-Regulierungs-Analyse 7.8.2026 (QS-SELBSTOPT)

**Anlass:** Roadmap-Schritt `QS-SELBSTOPT`, gleichwertiger Auftrag Ent-Regulierung
(David 5.8.2026: «nicht überregulieren, keine unnötigen Sicherungen, die Bauzeit
kosten»). Prüfkriterium: Anthropic-Löschkriterium «würde das Fehlen einen realen
Fehler verursachen? sonst streichen», mit Provenienz-Pflicht (Chesterton's Fence).

**Methode:** Read-only-Analyse (Opus, adversarial) über drei Schichten — Tore
(`check:*` + `gate.sh`), Hooks (`.claude/hooks/`), Regelwerk (CLAUDE.md/Skills) —
mit Laufzeitmessung, Anlage-Commit-Recherche und Rot-Historie aus Commit-Messages,
`ROADMAP-CHRONIK.md` und Lehren-Register. Danach Umsetzungs-Gegenprüfung durch den
Bau-Agenten am Ist-Zustand (zwei Prämissen widerlegt, siehe unten). Stand: main
`90df6d494` / Branch `feat/qs-selbstopt`.

## Kernbefunde (gemessen 7.8.2026)

| Messgrösse | Wert |
|---|---|
| 43 Tore der `check:seriell`-Kette, parallel | **16,0 s** (seriell ~95 s) |
| `gate:schnell` (Stop-Hook nach jeder Antwort) | **37,7 s** — dokumentiert waren «~7 s» (5,4× überholt) |
| Tor-Laufzeit ist NICHT der Kostentreiber | grösster Einzelposten ist die Stop-Hook-Frequenz |

Die Tor-Schicht wurde bereits zweimal ent-reguliert (21 Allowlist-Streichungen
20./21.7.; Tor-Wirksamkeits-Audit #318). Von 66 `check:*`-Einträgen sind nur ~52
eigenständige Prüfungen (vier `--netz`-Zwillinge, zwei Ketten).

## Umgesetzt in dieser Session (Branch `feat/qs-selbstopt`)

- `check:tot` → **`report:tot`** — knip mit `--no-exit-code` kann bauartbedingt nie
  rot werden; ein `check:`-Präfix darauf verletzt §6.7 wörtlich (`b153c7dad`).
- `check:rss-oc` → in `check:netz` + `normen-monitor.yml` **verdrahtet** — ein
  Wächter, der nirgends läuft, wacht nicht; Lauffähigkeit real belegt (`0cff492e7`).
- `gate.sh`: Laufzeit-Angabe auf Messwert korrigiert, TZ-Kommentar 16 → 4 Zeilen
  (`418583325`).
- `bildSeiten.ts` 823 Z. → §6.6-Split (`19bd9dabb`) — behebt das seit 5.8. auf main
  rote `check:schlankheit` (Erosionsmuster F2e: rotes Tor, das niemand ernst nimmt).

## Widerlegte Streich-Prämissen (Lehre: Ist-Zustand schlägt Doku-Lage)

1. **`check:confidence` ist KEIN Waise** — Pflichtschritt der Kantons-Pipeline
   (`korpus-werkstatt/tools/normtext-pipeline.md`), Verifikationsschritt in
   `PLAN-OCL-ABBAU.md` (W11), getestetes Logikmodul. Aber: gleicher Defekt wie
   `check:tot` (kein Exit ≠ 0). Richtige Massnahme wäre `report:confidence` bzw.
   ein echter Exit-Code — **~14 Referenz-Dateien**, gehört in eine Korpus-Session.
2. **`check:suchindex` NICHT in `check:seriell` verdrahten** — `public/such-index/`
   ist gitignored (in frischer Arbeitskopie dauer-rot), mit Vor-Generierung wäre es
   Selbstvalidierung (F2a); Repo-Entscheid existiert bereits
   (`archiv/STRUKTUR-SESSIONKARTEN.md:1825`: Drift strukturell unmöglich, Tor für
   manuelle Prüfung). Die Rot-Historie CHRONIK Z. 525 stammt vom Query-Testset.

## Wartet auf David (Konfig-/Regelwerk-Ebene — Agenten- und Berechtigungssystem sperren sie korrekt für Sessions)

1. **`gate-stopp.py`-Frequenz** — von David am 11.6. angelegt («0 Tokens bei Grün»,
   damals ~7 s); heute 37,7 s nach **jeder** Antwort mit schmutzigem `src/`/`scripts/`.
   Nutzen (Rot früh sehen) ist real, die Frequenz passt zur Prüfung pro *Commit*,
   nicht pro *Turn*. Optionen: (a) Trigger auf Commit-Grenze, (b) Testmenge im
   Schnell-Modus verkleinern, (c) belassen. Grösster einzelner Bauzeit-Posten.
2. **`tor-schutz.py`-Präzisions-Patch** (Fehlalarm belegt: blockiert Tor-Namen, die
   nur als grep-Suchmuster vorkommen — auch das Prüfskript des Befunds selbst).
   Fertiger, beidseitig getesteter Patch (echte Pipes bleiben blockiert):

   ```python
   # vor der Segment-Schleife:
   GREP_KOPF = re.compile(r"^\s*(?:[A-Za-z_]\w*=\S+\s+)*(?:grep|egrep|fgrep|rg|ag|ack)\b")

   def ohne_suchmuster(seg: str) -> str:
       """Bei grep/rg/ag die ZITIERTEN Argumente entfernen: dort steht ein
       Suchmuster, kein ausgefuehrtes Kommando. Pipes ausserhalb der Quotes
       bleiben stehen — `grep "x" f | npm run lint | tail` blockiert weiter."""
       return re.sub(r"'[^']*'|\"[^\"]*\"", " ", seg) if GREP_KOPF.match(seg) else seg

   # in der Schleife als erste Zeile:
   seg = ohne_suchmuster(seg)
   ```
3. **CLAUDE.md §16 auf Kurzform** (~10 Zeilen Dauerkontext → 4; Entscheid und
   Anker-Begründung bleiben): «Die frühere Nachschlage-Regel ist gestrichen, nicht
   verschoben — sie gehört in die Doku des Werkzeugs, mit dem man nachschlägt.
   **Die Nummer 16 wird nicht neu belegt**, damit Bestandsverweise nicht still auf
   eine andere Regel zeigen; eine künftige Regel bekommt §17 oder höher.»
4. **Dispatch-§0-Prüfvariante** — read-only-Klassen (pruefung/recherche) tragen
   heute inapplikable Bau-Pflichten (Commits, Sonden, Merge-Verbot) im Widerspruch
   zum eigenen TABU; ~150 Token je Prüf-Dispatch. Umbau braucht Variant-Fähigkeit
   in Generator, `dispatch-schutz.py` UND `check:dispatch-klausel` (zweiter
   Sollwert — sonst wird der Wächter zur Attrappe). Eigener Roadmap-Schritt.

## Weitere Befunde (unbewertet oder aufgeschoben)

- Überlappende Pflicht-Sequenzen an der Landungs-Grenze (bauschritt/landung/
  deploy-check/aufraeumen, 4 Skills, ~1500 Zeilen) — Konsolidierungs-Kandidat.
- Drei parallele §-Konkordanz-Schichten (CLAUDE.md-Kopf, `auftrag` 9, `refactoring` 8).
- `check:gegenpruefung` verweist auf maschinenlokalen Skill (`~/.claude/…`) — auf
  frischem Klon/CI wirkungslos; Schweregrad mittel.
- §11 ohne Bagatell-Schwelle; `check:lik-frische` ohne Commit-Erwähnung (ungemessen);
  `check:ci-laeufe` doppelt verdrahtet (nach #419 nicht defekt, Redundanz ungeprüft).
- CI-Läufe (letzte 50): success 27 · cancelled 15 · failure 8. **Deutung
  entschieden (7.8.2026, Gegenprüfung):** `cancelled` ist **kein** Ausfall. Von
  den 15 abgebrochenen Läufen liegen **11 auf `main`** (Verdrängung wartender
  Läufe durch die Concurrency-Gruppe, gewolltes Verhalten), 4 sind designtes
  cancel-in-progress auf PRs. Die Ausfallquote rechnet seither nur über Läufe
  **mit Verdikt**: 8 von 35 = **23 %**, nicht 46 %. Die Berufung auf F2c war
  falsch — dort geht es um einen GEPLANTEN Wächter-Lauf, dessen Abbruch eine
  unterlassene Prüfung verdeckt; ein verdrängter `main`-Lauf unterlässt nichts,
  weil der verdrängende Lauf denselben oder einen neueren Stand prüft.
  `cancelledRate` steht als eigenes Feld in der Messreihe, `je` trägt weiterhin
  die rohe Aufschlüsselung.
- **Nebenfund daraus:** 11 abgebrochene `main`-Läufe sind 11 Deploy-Stände ohne
  eigenes CI-Verdikt. Das ist kein Defekt (der nachfolgende Lauf deckt den
  neueren Stand), aber ein Hinschau-Anlass — verwandt mit `QS-BASIS-DOKU-CI`,
  wo es ebenfalls um die Frage geht, welche `main`-Pushes ein eigenes Verdikt
  bekommen. Nicht in diesem Schritt entschieden.

**Nachweislich tragend (Gegenprobe, nicht anfassen):** `tor-schutz.py` als Hook
(F1, drei belegte Realfälle) · `check:tor-paritaet` (F2b, 21 widerlegte
Allowlist-Einträge) · `check:plan`-Spec-Bindung (F2f, Geburtsbeweis dreifach rot) ·
`check:golden-normtext` (+59 gerettete Schlüssel) · `check:schlankheit` (rot
beobachtet 5.–7.8.).

**Status: einfach belegt** (Erstrecherche + Umsetzungs-Gegenprüfung am Ist-Zustand;
Laufzeiten einmalig gemessen, Rot-Historie aus Repo-Quellen ohne Actions-Log-Abfrage —
«nie rot belegt» heisst nicht «nie rot gewesen»). Zeitreihe: `messwerte/selbstopt-zeitreihe.json`.
