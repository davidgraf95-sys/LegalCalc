# FAHRPLAN — Plan-Steuerung «ein Etikett pro Schritt» (Detailquelle)
<!-- @lagebild name: Plan-Steuerung · zweck: Werkzeuge, mit denen der Plan selbst geführt wird (plan:next, dieses Lagebild). -->

> **Stand 1.7.2026.** Detailquelle zum Querschnitt **`QS-PH`** (Plan-Hygiene-Wächter) in
> `ROADMAP.md`. Verlinkt aus dem `QS-PH`-Eintrag des Querschnitt-Bands (Pflicht §14.1; das Tor
> `check:plan` setzt die Verlinkung selbst durch — s. u.). *Das Wie steht hier; gesteuert wird über
> `ROADMAP.md`.*
>
> **Doppelt verifiziert:** dieser Spec wurde gegen das reale Repo geprüft (Struktur von `ROADMAP.md`,
> `package.json`-Scripts, `scripts/gate.sh`, `CLAUDE.md` §-Regeln) **und** durch einen unabhängigen
> adversarialen Opus-Agenten auf Lücken durchgesehen (16 Befunde, alle hier eingearbeitet).

---

## §0 · Zweck

Detailquelle zu `QS-PH` — die `@meta`-DSL (Etiketten, Felder, Tor `check:plan`),
mit der `ROADMAP.md` ihren Zustand deterministisch statt in Prosa trägt. **Das
Wie steht hier; gesteuert wird über `ROADMAP.md`.** Einzige Doku der `@meta`-DSL —
keine Ersatz-Heimat (vgl. `FAHRPLAN-ARCHIV-RESTPUNKTE.md`).

---

## Anlass (gemessen in dieser Session, 30.6.2026)

Der Bauplan kodiert den Schritt-Zustand in **Prosa**, die gelesen und interpretiert werden muss. Reale
Defekte:

1. **Widerspruch (§5-Verletzung).** Die `- [ ]`-Checkboxen und der Prosa-Block «Fortschritt 28.6.»
   widersprechen sich: Schritt 1 ist `[ ]`, im Fortschritt «✅ LIVE»; Schritt 4 ist `[ ]`, real aber an
   Recherche `wbqdyap3x` gebunden.
2. **Autonomie-Versprechen gebrochen.** Das Ausführungs-Protokoll verspricht autonomes Abarbeiten — ein
   Lauf würde Schritt 1 nachbauen oder in den blockierten Schritt 4 rennen (beides kostet eine Session).

**Ziel:** den Schritt-Zustand **maschinell auflösbar und widerspruchsfrei** machen, ohne die
menschenlesbare Prosa zu verändern. Eine Wahrheit, eine Datei (§5 + §14).

---

## Leitentscheid: eingebettet als HTML-Kommentar, nicht separate Datei

Der maschinenlesbare Zustand lebt als **HTML-Kommentar `<!-- @meta … -->`-Zeile** unmittelbar **bei**
jeder etikettierbaren Einheit in `ROADMAP.md` — nicht in einer zweiten Datei.

- **Warum eingebettet:** §5/§14-treu — `ROADMAP.md` bleibt der **eine** Einstieg und die **eine**
  Wahrheit; kein zweiter autoritativer Artefakt, kein Sync-Zwang. Die ROADMAP ist zu ~90 % nuancierte
  Prosa, die sich nicht in JSON pressen lässt; eine separate `plan.json` als SSoT hätte Prosa *und* JSON
  → genau die Drift, die das Problem ist.
- **Warum HTML-Kommentar statt sichtbarer Code-Span:** verschwindet im Markdown-Render und stört das
  Lesen der Prosa nicht (Daueranweisung Lesbarkeit) — der Mensch liest Prosa + Checkbox, die Maschine
  liest `@meta`. Das trennt sauber **Maschinen-Zustand** von **narrativer Prosa** (s. «Eine Wahrheit»
  unten). Eindeutiger Anker (kein Verwechseln mit Referenz-Bullets).
- Die einzige Schwäche (von Hand fehleranfällig) wird durch das Tor `check:plan` neutralisiert: ein
  unsinniges/fehlendes `@meta` scheitert **laut rot**, nie still. Der `plan:set`-Helfer schreibt das
  `@meta` ohnehin maschinell.

---

## Geltungsbereich — welche Einheiten ein `@meta` tragen (Befund #1, #10, #15)

Nicht jeder Bullet ist ein Schritt. Erfasst werden **ausschliesslich** Einheiten in diesen Sektionen:

**ETIKETTIERT (Inventar):**
- `## ⚡ S0 …` (Überschrift, checkbox-los)
- Sektion **«Die geordnete Abarbeitung»**: jeder Schritt-Bullet `- [ /x/~] **<N> · <Titel>**`
  (Schritte 1–14 über Welle 1–3) **und** jedes eigenständig schedulebare **Unter-Bündel** mit eigener
  Checkbox (`- [ ] **+ Auftrags-Eingang …: Bündel B/S**`, Responsive-Audit, a11y-Restpunkte).
- Sektion **«Querschnitt-Band»**: jeder Top-Level-Strang-Bullet `- **<Titel>** *(<ID>, …)*`
  (checkbox-los; ID aus dem Klammerteil: `QS-GP`, `QS-PH`, `QS-PERF`, `QS-DATA`, sowie `LERNPHASE-AB` für
  «Status-Marker…» und `SEO-A11Y` für «SEO/A11y»).

**NICHT etikettiert (Referenz, explizit ausgeschlossen):** «So sieht das Taschenmesser aus»,
«Leitprinzipien», «Geparkt», «Pflege & Termine», «Funktions-Katalog», «Strang-Detailpunkte & Hygiene»,
«Studierende-Layer», «Batch-Deploy-Fenster», der `> ■ Auftrags-Eingang`-Blockquote (= narrative
Historie, s. u.).

**Erwartungs-Regel von `check:plan`:** Genau die Einheiten im Inventar **müssen** ein `@meta` tragen;
ausserhalb des Inventars wird kein `@meta` erwartet. Die kanonische Inventar-Liste (nur die IDs, kein
Status) liegt **einmal** in `scripts/plan/inventar.ts` (§5); `check:plan` prüft beidseitig: jede
Inventar-ID existiert als Einheit in `ROADMAP.md` **und** trägt ein `@meta`; kein verwaistes `@meta`.
Toleranz: harmlose Prosa-Edits ausserhalb des Inventars machen das Tor **nie** rot (Befund #15).

---

## Das Etikett `@meta` — 9 Felder

Eine Kommentar-Zeile direkt **unter** der ersten Zeile der Einheit (Schritt-Bullet bzw. Überschrift),
Felder durch ` · ` getrennt:

```
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/norm-index.ts] · worktree: ja · 26x: nein -->
  - Mehrsprachiger Normvergleich DE/FR/IT …   ← gewohnte Prosa + Unter-Bullets, unverändert
```

Checkbox-lose Einheiten tragen es analog direkt unter Überschrift/Bullet (S0, Querschnitt).

| Feld | Bedeutung | Werte |
|---|---|---|
| `id` | Stabile Schritt-ID (explizit) | `S0` · `W1·1` · `W2·6` · `W3·14` · `QS-PERF` · Bündel `W2·6-B1` |
| `status` | Die Ampel | `ready` · `wip` · `blocked` · `done` · `parked` (Grammatik s. u.) |
| `of` | Ohne Davids Fachzeit baubar (Zeitsperre)? | `ja` / `nein` |
| `blocker` | Token, falls `blocked`/`parked` | Token aus dem Blocker-Register oder `null` |
| `dep` | Einheiten, die erst `done` sein müssen | Liste von IDs, z. B. `[W1·4]` oder `[]` |
| `kollision` | repo-relative Dateien/Globs, die sie anfasst | Liste, z. B. `[src/lib/norm-index.ts]` |
| `worktree` | Braucht eigenen Worktree (§12)? | `ja` / `nein` |
| `26x` | Eines der 5 grossen Datenassets? | `ja` / `nein` |
| `fahrplan` | Detail-Datei (optional) | Pfad (`fahrplaene/…` bzw. `archiv/…`) oder leer |
| `slot` | 26×-Slot-Inhaberschaft (optional) | `inhaber` oder leer |
| `seq-hart` | Harte Reihenfolge auf geteilten Dateien, §12 (optional) | Liste, z. B. `[QS-PERF(ArtikelBody.tsx)]` |
| `seq-weich` | Weiche Reihenfolge-Empfehlung (optional) | Liste, analog |
| `groesse` | Geschätzter Bau-Umfang (optional, s. u.) | `S` · `M` · `L` oder leer |

*(Die vier optionalen Felder standen faktisch längst im Bestand; `seq-hart`/`seq-weich` kannte
der Etikett-Typ bis zum 31.7.2026 aber nicht und `serializeEtikett` verwarf sie beim
Neu-Schreiben — `plan:set` löschte die Kollisionsreihenfolge damit still mit, Endprüfungs-Fund
R2-16. Seither Teil des Typs, byte-treuer Round-Trip. **Die Tabellen-Überschrift «9 Felder» ist
die historische Zählung der Pflichtfelder + `fahrplan`; die optionalen kommen hinzu.**)*

### Feld `groesse` — die Auswahl-Hilfe (Auftrag David 5.8.2026)

**Anlass, wörtlich:** David wählt auf der Lagebild-Übersicht Bau-Prompts aus und will dabei
«nicht zu grosse oder kleine nehmen». Bis dahin sah die Übersicht jedem Schritt gleich gross aus:
ein Einzeiler-Doku-Posten und ein Dach-Schritt über 19 Batches trugen denselben Knopf.

| Wert | Bedeutung | Was daraus folgt |
|---|---|---|
| `S` | Trägt **keine eigene Session** — die Fixkosten (Startlektüre, `plan:next`, Spec-Slice) lohnen sich allein nicht. | Nur **gebündelt** nehmen. Der Skill `bauschritt` bündelt in Station A mit 1–2 kollisionsfreien Nachbarn gleicher Risikoklasse. |
| `M` | **Sessionfüllend** — der Normalfall. | Ohne Zusatz-Handgriff bauen. |
| `L` | Voraussichtlich **zu gross** für eine Session. | **Vor** dem Bau in sessionfüllende Teilschritte schneiden (AP-6-Muster). Bei Dach-Schritten läuft der Bau ohnehin über die Unterschritte — dort den Unterschritt nehmen. |

**Die Schätzung ist Heuristik und Steuerhilfe, nie ein Tor-Kriterium.** Kein `check:*` leitet aus
ihr ein Verdikt ab; sie steuert weder Reihenfolge (`@queue`) noch Baubarkeit (`dep`/`blocker`).
Weicht der Befund im Bau ab, wird das Feld korrigiert — die Abweichung ist ein Datum, kein Verstoss.

**Schätzgrundlage** (so ist der Bestand am 5.8.2026 befüllt worden — 14× `S`, 60× `M`, 36× `L`):
Anlass-/Spec-Text · Zahl der `kollision`-Flächen · Risikopfad bzw. Gegenprüfungspflicht ·
erwarteter Golden-Re-Bless. **Im Zweifel `M`.** Ausgewiesene Konzept- und Entscheid-Schritte sowie
reine Doku-Posten sind `S`; Dach-Schritte mit eigenen Unterschritten sind `L`.

**Fehlen ist zulässig.** Ein Schritt ohne Feld zeigt im Lagebild «Grösse ungeschätzt» — die Anzeige
rät **nicht** aus Kollisionszahl oder Prosalänge (§8). `check:plan` Regel 12 prüft ausschliesslich
das **Vokabular** eines gesetzten Werts, nie dessen Vorhandensein und nie dessen Richtigkeit.
Entsprechend wirft `parseEtikett` bei unbekanntem Wert bewusst **nicht** (anders als bei `status`
und `slot`): ein Tippfehler in einer Lese-Hilfe darf nicht die ganze Plan-Werkzeugkette lahmlegen,
er gehört als eine benannte Tor-Meldung ins `check:plan`.

**Status-Grammatik (Befund #11):** `status := <wert> ('(' <agent/worktree> ')')?`. Der Schema-Check
prüft nur den `<wert>` vor der Klammer gegen die erlaubte Menge; die optionale Klammer-Annotation hält
bei `wip` den Bauenden fest: `status: wip(reader-wt)` → Selbst-Koordination paralleler Agenten (heute
manuell: «an Bündel R sitzt ein anderer Agent»).

**IDs** folgen §14.5 (`W2·6` = «Welle 2 · Schritt 6»). `S0` und `W3·14` sind feste IDs. Bündel erben den
Eltern-Präfix (`W2·6-B1`). Vorbestehende CLAUDE.md-Drift «S0 + Wellen 1–13» (Schritt 14 existiert)
wird **nicht** in diesem Schritt gefixt (fremde Datei), nur notiert.

---

## Eine Wahrheit: `@meta` zählt, Prosa ist Historie (Befund #4)

`check:plan` und der Resolver lesen **ausschliesslich** das `@meta` (und, wo vorhanden, die Checkbox als
gekoppelte Zweitanzeige). **Nicht** als Wahrheit gelesen werden: die Status-Sätze in der Schritt-Prosa
(«✅ FERTIG + LIVE», «erledigt 28.6.»), der `> ■ Auftrags-Eingang 30.6.`-Blockquote und der frühere
Fortschritts-Block. Diese sind **narrative Historie**. Die Erst-Befüllung löst den **Fortschritts-Block**
in `@meta`+Checkboxen auf und entfernt ihn; Blockquote und Schritt-Prosa bleiben als Geschichte stehen,
sind aber per dieser Regel ausdrücklich nicht-autoritativ.

**Folgeregel für Stand-Prosa (5.8.2026, Bauplan-Review-Befund B2): einen gemessenen Wert nennt
die Prosa nie als Zahl, sondern als Messwerkzeug.** Statt «das Ceiling ist wieder eingehalten»
oder «Ist-Stand 110.0 KB» gehört dorthin der Befehl, der die Zahl im Moment des Lesens liefert
(hier `python3 .claude/hooks/struktur-rotieren.py --check`). Anlass: der QS-TOK-Satz «Das
ROADMAP-Ceiling ist am 3.8.2026 wieder eingehalten» war rund **drei Stunden** wahr — beim
nächsten Doku-Commit war er falsch und blieb es tagelang, ohne dass ein Tor ihn sehen konnte.
Ein Momentwert in nicht-autoritativer Prosa altert unbemerkt und wird trotzdem gelesen; der
Messbefehl altert nicht. Wo ein historischer Zahlenstand belegt werden soll, gehört er in einen
**datierten** Beleg-Satz («Stand 31.7.2026: 110.0 KB»), nie in eine Gegenwarts-Aussage.

### Checkbox ↔ Status (Befund #2, #5)

Wo eine Einheit eine Checkbox hat, gilt die Kopplung — und **nur dort**:

| Checkbox | erlaubter `status` |
|---|---|
| `[x]` | `done` |
| `[~]` | `wip` |
| `[ ]` | `ready` · `blocked` · `parked` |
| `[d]` / `[D]` | `parked` · `blocked` (Legendenmarke «geparkt/zurückgestellt») |

**Normalform ist `[ ]`** (Richtigstellung 31.7.2026, Endprüfungs-Fund R3-2). `plan:set` **erzeugt**
die Legendenmarke `[d]` nie — es **bewahrt** sie nur: eine vorhandene `[d]`/`[D]` überlebt einen
Wechsel nach `parked` oder `blocked`, eine nicht passende Marke wird auf `[ ]` nachgezogen. Kurzzeitig
galt am selben Tag das Gegenteil (`CHECKBOX_FUER` erzeugte `[d]` für beide Status); das beschriftete
einen bloss blockierten Schritt als «geparkt/zurückgestellt» (§8) und liess denselben Status je nach
Vorzustand als `[ ]` **oder** `[d]` erscheinen, ohne dass ein Tor es sah — die Tabelle duldet beides.
Wer parken **will**, setzt `[d]` von Hand.

Checkbox-lose Einheiten (S0-Überschrift, Querschnitt-Stränge) haben **keine** Kopplungs-Prüfung; ihr
`status` ist die alleinige Wahrheit (kein Häkchen-Konflikt möglich). `[~]` wird als gültiger
Checkbox-Zustand anerkannt (real bei Schritt 5).

**Wie die Checkbox gefunden wird (Neufassung 31.7.2026, Endprüfungs-Fund R2-1/R2-10).** Bis dahin
galt «die nächste nicht-leere Zeile über dem `@meta`». Eine einzige Prosa-Zeile dazwischen kappte
die Bindung — `checkbox = null` —, und weil die Kopplungsregel nur *bei vorhandener* Checkbox
prüft, war das Tor genau dort blind: `plan:set … status=done` schrieb das `@meta`, die sichtbare
Liste blieb auf «offen», `check:plan` blieb grün. Gültig ist jetzt:

> Rückwärts vom `@meta` bis zur **ersten Listen-Bullet-Zeile**; deren Checkbox bindet. Trägt sie
> keine, bindet nichts (Querschnitt-Fall). Abbruch an Überschrift, Kommentar-Grenze (`<!--`/`-->`,
> also auch an einem fremden `@meta`) und an einer doppelten Leerzeile. Der Bullet-Test läuft
> **vor** der Kommentar-Grenze: eine Bullet-Zeile ist nie eine Kommentar-Grenze, auch wenn sie
> `-->` oder `<!--` als Fliesstext im eigenen Titel führt (Fund R3-7 — ein Pfeil im Schritt-Namen
> kappte sonst die Bindung und machte Regel 10 falsch-positiv rot).

Dieselbe Funktion (`bindeCheckbox` in `scripts/plan/parse.ts`) bedient Parser UND `plan:set` — zwei
Kopien derselben Nachbarschafts-Regel wären zwei Wahrheiten (§5). Gegenprobe von vorn erzwingt
**Regel 10** in `check:plan`: steht unter einer Checkbox-Bullet ein `@meta`, bevor die nächste
Bindungs-Einheit beginnt, MUSS es daran gebunden sein — sonst rot. Praktische Folge für Autoren:
**`@meta` gehört unmittelbar unter seine Bullet-Zeile**; Begründungs-Prosa steht darunter, nicht
dazwischen.

**Was die Bindungs-Einheit beendet (Nachschärfung 31.7.2026, Endprüfungs-Fund R3-1/R3-9).** Nur eine
**gleich- oder höherrangige** Bullet, eine Überschrift oder eine doppelte Leerzeile. Eine **tiefer
eingezogene** Unter-Bullet tut es nicht — sie gehört noch zum Block ihrer Dach-Bullet, und ihr
bereits gebundenes `@meta` wird beim Weiterlaufen übersprungen statt zum Abbruch genommen. Vorher
beendete jede Checkbox-Bullet jeder Tiefe die Einheit; eine Dach-Bullet, deren eigenes `@meta`
**hinter** dem `@meta` ihres Unterschritts stand, fiel damit durch beide Netze — der Vorwärts-Blick
brach an der Unter-Bullet ab, die Rückwärts-Bindung am `@meta` des Unterschritts. Genau diese Drift
war im Bestand **live** an `W2·7-BEZUG`: `plan:set … status=wip` schrieb das `@meta`, die sichtbare
`- [x]` blieb stehen, und `check:plan` meldete null Probleme. Der Test-Satz führt das alte
ROADMAP-Layout jetzt als **Negativ**-Fixture (es stand dort zuvor als «GEGENPROBE», also als
gewolltes Verhalten — eine Grenze, die keine war).

---

## Blocker-Register (Befund #9 — keine Zeilennummern, keine Prosa)

Blocker-Tokens werden gegen ein **explizites Register** validiert, nie gegen Fliesstext/Zeilennummern.
Das Register ist ein benannter HTML-Kommentar-Block in `ROADMAP.md` (bei den «Verifikations-Blockaden»):

```
<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren (Recherche offen)
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
-->
```

`check:plan`: jede `blocker`-Token eines `blocked`/`parked`-Schritts muss im Register stehen; jede
`dep`-ID muss als Inventar-ID existieren. Keine Logik hängt an Zeilennummern (die die Erst-Befüllung
ohnehin verschiebt).

---

## Der `next`-Resolver — Regeln + vollständige Ausgabe (Befund #6, #7, #12, #13, #16)

**`ready-now` (grün, jetzt baubar)** wenn **alle**: `status==ready` · `of==ja` · `blocker==null` · alle
`dep` sind `done` · falls `26x==ja`: **kein anderes 26× ist aktiv ODER bereits empfohlen** — d. h. kein
26× auf `wip` UND in dieser Auflösung wurde noch kein anderes 26× in `ready-now` zugelassen (höchstens
**ein** 26× gleichzeitig aktiv/empfohlen — ROADMAP-Leitprinzip 4 «nie zwei 26×-Assets parallel»; der
zuerst zugelassene = lexikografisch erster). Verfehlt ein `ready`-26× diese Bedingung, fällt es **nicht
durch**, sondern in den Bucket `wartet auf 26×-Slot` (Befund Task-3-Review: stiller Durchfall + zwei
frische 26× gleichzeitig).

**`26x`/`parked`-Semantik (Befund #12):** `parked` und `blocked` belegen den 26×-Slot **nicht** (nur
`wip` tut es). Das Parken eines 26×-Schritts gibt also den Slot frei (ROADMAP-Leitprinzip 4 →
Voraussetzung für Schritt 11/12). `blocked` ≠ `parked`: blocked = technisch gehindert (Blocker
auflösbar), parked = bewusst zurückgestellt (Steuer-Entscheid).

**`npm run plan:next` druckt ALLE Buckets** (nichts verschwindet lautlos — der Fehlermodus, den der
Spec heilt):
1. **`ready-now`** + welche **parallel** gehen — Lanes über **paarweise disjunkte, kanonisierte,
   real existierende** `kollision`-Pfade; bei mehreren maximalen Mengen **greedy in lexikografischer
   ID-Reihenfolge** (deterministisch, §2). Lane-Regel: **leere `kollision` = undeklariert →
   konservativ eigene Lane (nie blind parallelisiert)**; Globs/Verzeichnis-Präfixe zählen als
   Überlappung (z. B. `public/x/*.json` kollidiert mit `public/x/OR.json`).
2. **wartet auf dep** (mit der offenen dep-ID)
3. **wartet auf Davids Fachzeit** (`of==nein`)
4. **blockiert** (mit Blocker-Token + Klartext aus dem Register)
5. **geparkt**
6. **in Arbeit (wip)** — die aktiven `wip`-Einheiten (dürfen nicht lautlos verschwinden)
7. **wartet auf 26×-Slot** (ready-26×, aber ein anderes 26× ist aktiv/bereits empfohlen — nichts geht still verloren)
8. **26×-Slot belegt von …** (falls zutreffend)

Determinismus (§2): gleiche ROADMAP → gleiche Ausgabe. Tagesbezug nie in der Auswahllogik.

---

## Bausteine (alle unter `scripts/plan/`, Runner `vite-node`)

| Baustein | Datei / Script | Aufgabe |
|---|---|---|
| **Grammatik** | `scripts/plan/etikett.ts` | `@meta`-Parse/Serialize + Feld-Schema + Inventar-Bezug. Einmal (§5). |
| **Inventar** | `scripts/plan/inventar.ts` | Kanonische ID-Liste der etikettierbaren Einheiten. |
| **Leser** | `scripts/plan/parse.ts` | `ROADMAP.md` → Einheiten-Objekte (Sektion-bewusst, s. Geltungsbereich). |
| **Resolver** | `scripts/plan/next.ts` → `npm run plan:next` | Regeln + alle Buckets + Lanes. |
| **Setzer** | `scripts/plan/set.ts` → `npm run plan:set -- <id> <feld>=<wert>` | Mutiert Feld **und** toggelt die gekoppelte Checkbox (Befund #3). |
| **Wächter** | `scripts/plan/check.ts` → `npm run check:plan` | Schema + Logik + FAHRPLAN-Link (s. u.). |

**`plan:set` toggelt die Checkbox mit (Befund #3):** ändert es `status`, setzt es die Checkbox der
Einheit konsistent (`done→[x]` · `wip→[~]` · sonst `[ ]`); checkbox-lose Einheiten unverändert. So kann
der unmittelbar danach laufende `check:plan` nie an der eigenen Setzer-Aktion rotschlagen.

### `check:plan` — die Prüfungen (das ist die `QS-PH`-Schärfe)

- **Schema:** jede Inventar-Einheit hat genau ein `@meta`; alle Felder vorhanden; Werte gültig
  (Status-Wert vor optionaler Klammer); kein verwaistes `@meta`.
- **Checkbox-Kopplung:** nur für Einheiten **mit** Checkbox, gemäss Tabelle oben.
- **Blocker/dep:** Tokens im `@blockers`-Register; dep-IDs im Inventar; **dep-Graph azyklisch**
  (Zyklus → rot, Befund #13).
- **26×:** nicht zwei `26x==ja` gleichzeitig auf `wip`.
- **`kollision`:** jeder Pfad/Glob ist repo-relativ **und** expandiert auf ≥1 real existierende Datei
  (sonst läuft die Lane-Disjunktheit leer → §12-Falle; Lehre aus ROADMAP-`QS-GP`).
- **FAHRPLAN-Link-Check (eingegliedertes Ur-`QS-PH`, Befund #8):** jede `FAHRPLAN-*.md` im Repo-Wurzel
  ist aus `ROADMAP.md` verlinkt — **ausser** den im `ARCHIV_BACKLOG` grandfatherten Altlasten
  (Archiv-Kandidaten, s. ROADMAP «Strang-Detailpunkte»); eine **NEUE/neu referenzierte** unverlinkte
  FAHRPLAN wird rot. Damit ist `check:plan` ⊇ dem ursprünglich für `QS-PH` geplanten Verlinkungs-
  Wächter — kein zweites Tool, nichts fällt unter den Tisch.
- **Nur Prüflogik** → golden byte-gleich (§6).

**Einhängung — Stand 20.7.2026 (as-built, ersetzt die Bau-Zeit-Planung):** `check:plan` läuft in
`check:seriell` (`package.json`) **und** als Schritt in `.github/workflows/ci.yml` — also nicht mehr
nur lokal. `npm run check:plan` grün verifiziert 20.7.2026. Muster = reale `check:*`-Skripte
(`check:perf-budget`, `check:design-tokens`). **Korrektur:** die frühere Zeile «`check:gegenpruefung`
ist noch nicht gebaut» ist überholt — das Tor steht seit PR #67 (1.7.2026, Bausteine a+b+c) und ist
seither eine taugliche Vorlage. Neue `.ts` müssen `npm run lint` (eslint, in `gate voll`) bestehen.

---

## Einmalige Erst-Befüllung (die eigentliche Heilung)

Konkretes Inventar (Befund #10 — abschliessend, prüfbar gegen `inventar.ts`):
**S0 · Schritte W1·1, W1·2, W1·3, W1·4 · W2·5, W2·5b, W2·6, W2·7, W2·8, W2·9 · W3·10…W3·14 ·
Querschnitt LERNPHASE-AB, QS-GP, QS-PH, SEO-A11Y, QS-PERF · nested Bündel W2·6-B,
W3·14-Responsive-Audit, W3·14-S, W3·14-a11y.** (Nomenklatur: es sind **Schritte 1–14 über
Welle 1–3**, nicht «Wellen 1–14».)

Schritte:
1. Jede Inventar-Einheit mit `@meta` versehen — Werte aus Prosa + Fortschritts-Block + Memory abgeleitet.
2. Veraltete Checkboxen korrigieren: **W1·1 → done** (`[x]`, LIVE; PDF-Block bewusst aus) ·
   **W1·4 → status nach Steuer-Entscheid** (s. Punkt 6) · **W2·5 bleibt `[~]`→wip**.
3. **`@blockers`-Register** anlegen (`wbqdyap3x`, `§4-lizenz`).
4. **Fortschritts-Block** (die zweite Wahrheit) in `@meta`+Checkboxen auflösen und **entfernen**;
   Blockquote + Schritt-Prosa bleiben als Historie (per «Eine Wahrheit»-Regel nicht-autoritativ).
5. Header-Datum aktualisieren; `QS-PH`-Eintrag im Querschnitt-Band um Link auf **diese** Datei +
   `check:plan`-Beschreibung ergänzen (sonst schlägt der eigene FAHRPLAN-Link-Check an).
6. **Schritt 4 = Steuer-Entscheid, nicht raten (§7/§1):** `blocked` (Blocker auflösbar, 26×-Slot bleibt)
   vs. `parked` (bewusst zurückgestellt, **gibt 26×-Slot frei** für Schritt 11/12). *Klarstellung
   (Befund #12): den 26×-Slot belegt allein `wip`; `blocked` wie `parked` belegen ihn nicht — «Slot
   bleibt» meint hier nur, dass der blockierte Schritt seinen 26×-Anspruch behält, nicht eine
   aktive Belegung.* Die ROADMAP
   dokumentiert den **Park-Entscheid** als Absicht — beim Befüllen mit dieser dokumentierten Absicht
   abgleichen; im Zweifel David bestätigen lassen, nicht eigenmächtig den Slot-Status setzen.

Nach der Erst-Befüllung gilt: **Plan == Realität**, und der Wächter hält es so.

---

## Risiko, Tore, Hygiene

- **Berührt keinen Produkt-Code** — nur `ROADMAP.md`, `scripts/plan/**`, `package.json`. Keine
  Rechtslogik, kein `public/normtext`, kein Rechner/Schema. ⇒ **golden byte-gleich trivial** (§6),
  **kein Deploy** (§9), **`[OF]`** (keine Fachzeit), **kein 26×-Slot**.
- **Determinismus (§2):** rein, keine Heuristik, kein `Date.now()` in der Logik (Tagesbezug nur Anzeige).
- **Tests** nach Projektmuster: Leser gegen Beispiel-Einheiten (Schritt-Bullet, Querschnitt-Bullet,
  S0-Überschrift, `[~]`-Fall) · Resolver gegen Regel-Tabelle (jede Regel + jeder Bucket je ein Fall,
  inkl. Zyklus + 26×-Slot-Belegung) · Wächter **negativ→rot→grün** (wie `check:perf-budget`), inkl.
  Setzer↔Wächter-Konsistenz (Befund #3) und FAHRPLAN-Link-Check.
- **Parallel-Isolation (§12):** Die Erst-Befüllung schreibt `ROADMAP.md` stark um. Da gerade ein zweiter
  Agent läuft, geschieht sie in einem **eigenen Worktree**, Rückgabe als **ein** Commit (Pathspec-
  explizit). `scripts/plan/**` + `package.json` sind additiv und kollidieren nicht.
- **Trailer (§14.5):** `Roadmap: QS-PH` · `Gegenpruefung: n/a — reine Prüflogik`.

---

## Definition of Done

- `scripts/plan/{etikett,inventar,parse,next,set,check}.ts` vorhanden; `plan:next`/`plan:set`/
  `check:plan` in `package.json`; `check:plan` in der `check`-Kette.
- `plan:set` toggelt die gekoppelte Checkbox mit (verifiziert per Test).
- Tests grün: Leser (alle Einheitstypen + `[~]`), Resolver (alle Regeln + alle Buckets + Zyklus),
  Wächter (Schema, Checkbox-Kopplung nur-bei-Checkbox, Blocker/dep/Azyklie, 26×, kollision-Existenz,
  FAHRPLAN-Link), Setzer↔Wächter-Konsistenz.
- `ROADMAP.md`: alle **Inventar**-Einheiten etikettiert; Checkboxen == Status; `@blockers`-Register
  vorhanden; Fortschritts-Block aufgelöst; `QS-PH`-Eintrag verlinkt diese Datei.
- `npm run plan:next` liefert auf dem realen Plan plausible Buckets (W1·1 done, W1·4 nach Steuer-
  Entscheid, mind. die bekannten freien [OF]-Reste als ready-now; Querschnitt sichtbar).
- `npm run gate` grün; golden byte-gleich. Session-Karte in `STRUKTUR.md` nachgezogen.

---

## Bewusst NICHT im Scope (YAGNI)

- Keine separate `plan.json`/DB (s. Leitentscheid).
- Kein Web-UI/Dashboard — `plan:next` druckt Text.
- Keine automatische ROADMAP-Generierung aus den Etiketten (Prosa bleibt handgeschrieben).
- Keine CI-Verdrahtung (`check:plan` bleibt **lokal**, wie die Geschwister-Tore).
- Kein Fix der CLAUDE.md-«Wellen 1–13»-Drift (fremde Datei) — nur notiert.

---

## Lagebild-Generator `plan:bild` (Schritt `QS-PLAN-BILD`, Auftrag David 4.8.2026)

**Zweck.** Ein Befehl `npm run plan:bild`, der aus dem Plan-Bestand eine **laienverständliche**
HTML-Übersichtsseite erzeugt — «wo steht der Aufbau, was ist offen, was wartet auf wen» — für
David und Aussenstehende, ohne dass jemand ROADMAP/Fahrpläne lesen muss. Referenz-Vorlage ist
das handgebaute Lagebild der Session vom 4.8.2026 (von David abgenommen); dessen Gliederung ist
verbindlicher Ausgangspunkt, nicht Pixel-Vorgabe.

**Datenquellen (alle bestehend, nur lesen):**

1. `scripts/plan/parse.ts` — Schritte mit `status`, `dep`, `blocker`, `26x`, `fahrplan:`-Feld
   (KEINE Duplikation der Parse-Logik; das Skript importiert den Parser, Befund-Klasse §5/SSoT).
2. `ROADMAP.md` — Bold-Titel je Schritt (Klartext), `@queue`-Zeile.
3. `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` — Phasen-Namen für die Zeitleiste (statisch
   nachgeführt genügt; die Phasen ändern sich selten).
4. Korpus-/Katalog-Zählungen: `public/normtext/bund` + `kanton` (Dateizahl),
   `public/rechtsprechung/register.json` (`entscheide.length`), `status:`-Verteilung der
   Startseiten-Karten (`src/lib/startseiteKarten*.ts`, `startseiteVorlagen.ts`).

**Seiten-Gliederung (Vorlage 4.8.2026):** Kopf mit Stand-Datum · Bestand-Kacheln (live-Zahlen) ·
Phasen-Zeitleiste mit Positions-Marker · Kasten «Wartet auf David» (alle `blocker:`-Einträge
plus als David-Frage markierte Posten) · `@queue` als nummerierte Liste in Klartext ·
Baustellen-Karten gruppiert nach `fahrplan:`-Feld (Fortschritt done/gesamt, nächster
`ready`-Schritt, Blocker-Hinweis, `<details>` mit Einzelschritten) · Arbeitsweise-Fussnote.

**Steuerpult-Auflage 1 — Bau-Prompt je baubarem Schritt (Go David 4.8.2026).** Jede Karte
eines `ready`-Schritts trägt einen **Kopier-Knopf** (`navigator.clipboard`), der einen fertigen
Bau-Auftrag für eine neue Session kopiert. Der Prompt wird mechanisch aus den Plan-Daten
gebaut und enthält zwingend: Schritt-ID + Klartext-Titel · `npm run plan:set -- <id> status=wip`
als erste Handlung (Skill `auftrag` Ziff. 2) · Worktree-Pflicht gemäss `worktree:`-Feld ·
den Slice-Befehl `npm run fahrplan -- <fahrplan:-Feld> <§>` · Definition of Done
(Skill `auftrag` Ziff. 4, inkl. Gegenprüfung falls Risikopfad) · die §14.7-Vertrauensklausel
wörtlich. Kein Prompt für `blocked`-/`wip`-Schritte (dort stattdessen der Grund).

**Steuerpult-Auflage 2 — Sektion «Gerade im Bau» (Go David 4.8.2026).** Eine eigene Sektion
zeigt den Bau-Zustand **zum Erzeugungszeitpunkt**: (a) alle Schritte mit `status: wip`
(die Wahrheit hierfür ist die wip-Disziplin aus Skill `auftrag` Ziff. 2 — die Sektion sagt das
dazu); (b) offene PRs mit Titel, `Roadmap:`-Trailer-Zuordnung und CI-Status via
`gh pr list/checks` (JSON); (c) aktive Worktrees/Feature-Branches (`git worktree list`,
`git branch`). Fortschritts-Aussage je Bau: PR vorhanden? Checks grün? — mehr behauptet die
Seite nicht (kein geschätzter Prozentwert, §8-Geist). Ist `gh` nicht verfügbar, degradiert
die Sektion mit sichtbarem Hinweis statt zu scheitern.

**«Live»-Grenze (ehrlich benannt):** Eine statische Seite kann den Repo-Zustand nicht selbst
abfragen. «Live» heisst hier: `npm run plan:bild -- --watch` regeneriert periodisch (z. B. alle
60 s) und die Seite lädt sich selbst neu (Meta-Refresh/JS-Reload); der Erzeugungs-Zeitstempel
steht sichtbar im Kopf, damit nie ein älterer Stand als aktuell durchgeht. Ein Dienst/Server
wird dafür ausdrücklich NICHT gebaut. Weil der Plan-Teil aus dem **lokalen** Checkout gelesen
wird, gibt es das Opt-in-Flag `--pull` (David 4.8.2026): vor jeder Erzeugung ein stilles
`git pull --ff-only` — scheitert es (schmutzig/divergiert), unterbleibt es folgenlos und die
Seite zeigt den lokalen Stand.

**Drei Konventionen (Reibungspunkte-Fix, Go David 4.8.2026):**

1. **«Detail:»-Schreibweise ist maschinengelesen.** Die bestehende Form
   `**Detail:** [Datei](…) §N` (auch `Bau-Spec:`) ist die eine Quelle des
   §-Ankers im Bau-Prompt — bewusst KEIN eigenes @meta-Feld (das wäre eine
   zweite, drift-fähige Wahrheit neben der Prosa, §5). Schritte, die einen
   konkreten Slice-Befehl im Prompt wollen, schreiben den Verweis in dieser
   Form; §§-Bereiche bleiben Platzhalter (ein Teil-Slice führte irre).
2. **wip-Verstoss-Sonde.** Existiert ein Worktree/Branch, dessen Name zur
   Schritt-ID passt (Slug-Vergleich), während der Schritt nicht auf `wip`
   steht, zeigt die Sektion «Gerade im Bau» eine sichtbare Warnung samt
   Handlungsanweisung (`plan:set … status=wip`). Die Sonde ersetzt die
   Disziplin nicht — sie macht den Verstoss sichtbar statt die Anzeige still
   falsch.
3. **`@lagebild`-Kopfzeile je Fahrplan.** Jede `fahrplaene/FAHRPLAN-*.md`
   trägt nach der Titelzeile `<!-- @lagebild name: … · zweck: … -->` —
   Klartext-Name und Laien-Zweck leben bei ihrer Datei (SSoT §5), nicht im
   Generator; der hält nur den Dateinamen-Fallback. Neue Fahrpläne bringen
   die Zeile mit (diese Konvention gehört zur Fahrplan-Anlage, Skill
   `auftrag` Ziff. 1).

**Mehrseiten-Ausbau (Go David 4.8.2026).** `plan:bild` erzeugt seither **vier** untereinander
verlinkte Seiten statt einer — dieselben Design-Tokens, eine gemeinsame Navigations-Leiste mit
markierter aktiver Seite, ein Knopf «Zur Live-Plattform» (`https://lexmetrik.vercel.app`) und der
Erzeugungs-Zeitstempel im Kopf jeder Seite; im `--watch`-Modus tragen alle vier den Meta-Refresh:

1. `plan-bild.html` — **Lagebild** (Einstieg): Plan-Stand wie bisher, ergänzt um Navigation,
   Live-Link und einen Kurz-Teaser «Was ist LexMetrik?».
2. `plan-bild-projekt.html` — **Projekt & Produkt**: Selbstbeschreibung, Werkzeug-Katalog nach
   Sektionen mit Status je Karte, Gesetzes-Korpus (Bundes-Tabelle, 26er-Kantonsraster) und
   Rechtsprechung (Zeitraum, Gerichtstypen, Sprachen).
3. `plan-bild-geschichte.html` — **Geschichte & Bau-Statistik**: Chronik als Monats-Zeitachse
   (Datierung = erste Datumsangabe im Eintrag, deklarierte Heuristik) plus Commits, gemergte PRs,
   Prüf-Tore, Test-Dateien.
4. `plan-bild-methode.html` — **Arbeitsweise & Glossar**: vier Bahnen, Landungs- und
   Gegenprüfungs-Regeln, 26×-Slot, Rollenteilung, Begriffe je in einem Laien-Satz.

**Der Dateiname der Index-Seite bleibt `plan-bild.html`** — App-Kachel und LaunchAgent zeigen auf
diesen Anker. `--out` bezeichnet weiterhin die Index-Seite; die drei Zusatzseiten entstehen daneben
mit demselben Präfix und werden relativ verlinkt (funktioniert unter `file://`). Aufbau nach §6.6:
`bild.ts` (CLI/Zusammenbau) · `bildDaten.ts` (Sammler) · `bildHtml.ts` (Tokens/Rahmen/Navigation) ·
`bildSeiten.ts` (die vier Inhalte).

**Eine Zählweise über alle vier Seiten (§5).** Werkzeug-Zahlen kommen aus `ALLE_KARTEN`,
Korpus-Zahlen aus `public/normtext/register.json` bzw. `public/rechtsprechung/register.json` —
auch für die Bestand-Kacheln der Index-Seite. Die frühere Ein-Seiten-Fassung zählte dort Dateien
im Ordner und `status:`-Literale in den Karten-Quelldateien; beides wich von der aufgeschlüsselten
Darstellung ab (Befund 4.8.2026: 227/1232 statt 238/1231, 66/86 statt 53/81 — die Regex zählte die
`szenarien`-Einträge konsolidierter Karten mit). Zwei verlinkte Seiten mit verschiedenen Zahlen zum
selben Gegenstand sind eine zweite Wahrheit; die Register und der Katalog sind die SSoT.

**Bau-Prompt-Härtung (adversariale Prüfung aller 70 Prompts, 4.8.2026).** Sechs Wurzel-Fixes:

1. **Titel nur aus EINHEITEN-Zeilen.** Der Rückwärts-Scan nahm die erste `**fett**`-Passage jeder
   Zeile, auch aus Fliesstext — `QS-PERF` hiess dadurch «protokolliertem SKIP». Der Scan
   akzeptiert jetzt nur Listen-Bullets (`BULLET_RE` aus `parse.ts`, §5), Überschriften und den
   **Kopf** eines Blockzitat-Dekrets (erste Zeile des Zitat-Absatzes, beginnt fett — die
   Fortsetzungszeilen desselben Absatzes beginnen teils ebenfalls fett und gelten nicht).
2. **Keine Doppelung im Wortlaut.** Die fette ID·Titel-Passage wird aus dem Wortlaut gestrippt;
   sie steht bereits im Einleitungssatz.
3. **Kappung sichtbar und praktisch abgeschafft.** Eine Kappung schneidet auf Wortgrenze und
   trägt den Marker «… [gekürzt — der Schritt-Wortlaut in ROADMAP.md ist massgeblich …]». Die
   Grenze ist **1600 Zeichen für alle Schritte** (längster Wortlaut im Plan: 1534 ⇒ kappt heute
   nichts). Die frühere Grenze 700 beruhte auf der Annahme, ein `fahrplan:`-Feld trage das Detail
   ohnehin doppelt — falsch: `QS-AUTOMATIK-PARITAET` HAT einen Fahrplan, aber der am 4.8.2026
   nachgetragene Scope (`check:suchindex`, `check:rss-oc`, `report:confidence`) stand damals nur in
   ROADMAP.md (inzwischen in `FAHRPLAN-BASIS-AUSBAU.md` §3-N.5 übernommen — Faktenkorrektur 8.8.2026,
   Gegenprüfung QS-CONFIDENCE-EHRLICH; die Kappungs-Regel selbst bleibt davon getragen).
4. **`**Befunde:**`/`**Dossier:**` sind maschinengelesen** — analog `Detail:`. Der Pfad wird als
   eigene Zeile «Pflichtlektüre: `<pfad>`» in den Prompt gehoben, statt im Wortlaut unterzugehen.
5. **§-Anker: Buchstaben erlaubt, Auflösung verprobt.** Neben `§N`/`§N.M`/`§«…»` greift
   `§<Grossbuchstabe>…` (z. B. `§S`). **Jeder** Anker wird bei der Erzeugung mit `trefferFuer()`
   aus `scripts/fahrplanSlicerKern.ts` gegen den Ziel-Fahrplan geprüft; löst er nicht auf, wird er
   verworfen **und im Prompt benannt** (Fall `W2·5k` → «§L-3/A28» existiert in
   `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` nicht — Plan-Datenfehler, im Prompt sichtbar statt still).
6. **`dep:` steht im Prompt.** Nach der Worktree-Zeile: «Abhängigkeit: setzt `<ids>` voraus
   (Stand bei Erzeugung: erfüllt/OFFEN — bei offen NICHT bauen, sondern melden)», Stand aus der
   done-Menge des geparsten Plans.

Nebenbefund desselben Fixes: `scripts/fahrplan-slice.ts` führte seine CLI **beim blossen Import**
aus. Die Logik liegt seither in `scripts/fahrplanSlicerKern.ts` (ohne Seiteneffekt), die alte Datei
ist CLI-Hülle mit `export *` — bestehende Importpfade und `npm run fahrplan` unverändert. Eine
Einstiegspunkt-Weiche wäre kein Ersatz: unter `vite-node` steht der Skriptpfad nicht in
`process.argv` (empirisch geprüft 4.8.2026).

**Grenzen/Auflagen:**

- Reine Lese-/Werkzeug-Schicht: kein Code in `src/`, kein Artefakt in `public/`, kein
  Deploy-Gegenstand. Ausgabepfad per Argument (Default ausserhalb des Repos oder gitignored) —
  keine zweite eingecheckte Wahrheit neben ROADMAP (§5).
- Klartext-Übersetzungen der Schritt-Titel sind zulässig, aber **keine neuen Behauptungen**:
  jede Zahl kommt aus einer der vier Quellen oben; das Stand-Datum ist Systemdatum
  (Werkzeug-Schicht, §2 gilt nur für Rechenlogik).
- «Erledigt»-Zählungen ehrlich beschriften: der Plan führt fast nur den offenen Rest,
  abgeschlossene Wellen liegen in der Chronik — das Bild sagt das dazu (Fussnote), statt
  kleine done-Zahlen als Gesamtfortschritt auszugeben (§8-Geist).
- Runner `vite-node`, Eintrag `"plan:bild"` in `package.json` neben `plan:next`/`plan:dump`.

**Fertig, wenn** `npm run plan:bild` ohne Argumente eine vollständige HTML-Datei erzeugt, deren
Kennzahlen mit `plan:next`/`plan:dump` übereinstimmen (Stichprobe im PR-Text belegt), die Seite
in hell/dunkel lesbar ist, ein kopierter Bau-Prompt alle sechs Pflicht-Bestandteile aus
Auflage 1 enthält (an einem Beispiel-Schritt belegt) und die «Gerade im Bau»-Sektion einen
laufenden `wip`-Schritt samt PR-Status korrekt zeigt (oder ihren Degradations-Hinweis, falls
gerade nichts im Bau ist).

### §Laien-Block «Was gerade passiert» (Schritt `QS-PLAN-BILD-LAGE`, Auftrag David 5.8.2026)

**Anlass, wörtlich.** «ich brauche einfachere Sprache um zu verstehen was gerade passiert».
Die vier Seiten sind laienverständlich gemeint, ihr Einstieg beginnt aber mit Plan-Vokabular
(`wip`, `dep`, Baustellen, `@queue`). Der Block beantwortet drei Fragen davor — ohne dass
irgendwo ein Fachbegriff vorausgesetzt wird.

**Ort.** Oberster Inhalt von `plan-bild.html`, direkt nach dem Kopf und **vor** allen
Fachsektionen (Sprungmarke `#jetzt`, in der «Springen zu»-Leiste an erster Stelle). Die drei
übrigen Seiten bleiben unberührt — der Block bringt **keine eigenen Design-Tokens** mit,
sondern nutzt ausschliesslich bestehende Klassen aus `STIL`; sonst änderten sich alle vier
Seiten mit.

**Drei Unterteile, alle Sätze statisch:**

1. **«Gerade im Bau»** — je `wip`-Schritt der Klartext-Titel plus seine belegten Flächen,
   übersetzt über eine **statische Zuordnungstabelle Pfad → Alltagsbegriff**
   (`scripts/plan` → «Werkzeuge der Bau-Planung», `public/normtext` → «gespeicherte
   Gesetzestexte», `.claude` → «Arbeitsregeln der KI-Sessions» …). Getroffen wird der
   längste passende Präfix **an einer Trennstelle**; ein unbekannter Pfad bleibt
   unübersetzt stehen, statt einen erfundenen Oberbegriff zu bekommen (§8). Dazu ein Satz
   zur Zahl paralleler Bau-Plätze aus `git worktree list`.
2. **«Zuletzt fertig geworden»** — die letzten fünf Betreffzeilen von `main` mit Datum,
   **im Wortlaut unverändert** unter einer Laien-Überschrift, die sagt, dass es Fachtitel
   sind. Gelesen wird `main` und nicht `HEAD`: fertig ist, was gelandet ist (§9).
3. **«Wartet auf David»** — Schritte, deren `blocker:`-NAME «david» enthält, je mit Titel
   und Blocker-Namen. Übrige blockierte Schritte werden **gezählt** und mit einem Verweis
   auf die Fachsektion `#david` ausgewiesen, sonst widerspräche der Block der Gesamtzahl
   in der Kopfzeile derselben Seite (belegter Fall: `richter-analytik-gate` verlangt laut
   Register Davids Freigabe, trägt «david» aber nicht im Namen). Abschliessend der
   statische Verweis auf «Arbeitsweise & Glossar» für alle Fachbegriffe.

**Determinismus (§2).** Jeder Satz steht im Code, gefüllt werden nur Werte — kein Modell zur
Laufzeit, keine Formulierung aus Repo-Prosa. Insbesondere werden die `Anlass:`-Texte der
ROADMAP **nicht** übernommen: sie sind Fachprosa und verfehlten den Zweck. Der Block trägt
den statischen Hinweis «Stand: beim letzten `npm run plan:bild`-Lauf».

**Degradation statt Absturz (§8).** Beide git-Sammler (`bauPlaetze`, `letzteCommits` in
`bildDaten.ts`) laufen über den Runner **mit hartem Timeout** aus `lage.ts` (`laufeEcht`) und
liefern bei Ausfall `null` — die Anzeige setzt dann eine Hinweiszeile, statt eine leere Liste
als «nichts ist fertig geworden» misszuverstehen. Der Runner ist injizierbar, damit die
Fehlerpfade ohne echtes git prüfbar sind.

**Aufbau (§6.6).** Sammler in `bildDaten.ts` (Wiederverwendung von `parseWorktrees`/`laufeEcht`
aus `lage.ts`, kein zweiter Regex, §5) · Tabelle und reiner Formatierer `wasGeradePassiert()`
in `bildHtml.ts` · Verdrahtung in `lagebildSeite()` aus **denselben** Resolver-Daten wie die
Fachsektionen darunter — der Block übersetzt, er zählt nicht neu.

**Fertig, wenn** `npm run plan:bild` den Block erzeugt, die drei übrigen Seiten **byte-gleich**
bleiben und der Diff der Index-Seite nur die neue Sektion und die Sprungleiste trifft; die
Formatierung mit injizierten Daten getestet ist (wip-Liste, Commit-Liste, David-Blocker,
Übersetzungstabelle inklusive unbekanntem Pfad, Fehlerpfad git) und `check:plan` grün ist.

### §Frische-Warnung «stale wip» (Schritt `QS-PLAN-WIP-FRISCHE`, 5.8.2026)

**Anlass, belegt.** Am 5.8.2026 baute eine Session `QS-TOK` und `QS-TOK-AUFRAEUMEN` fertig,
landete die PRs (#457/#458) und beendete sich, **ohne die wip-Marke freizugeben**. Das Lagebild
zeigte stundenlang «im Bau», was längst auf `main` lag — bis David nachfragte. Das ist der
**zweite** Fall desselben Musters nach dem 10-wip-Vorfall vom ~20.7.2026. Zweimal Prosa, zweimal
nicht gehalten ⇒ Eskalation Prosa→Maschine (Skill `lehren`, Regel 5): Was eine Session vergessen
kann, muss der Pflicht-Einstieg `plan:next` von sich aus sagen.

**Verhältnis zur Prosa-Seite (§5, keine zweite Wahrheit).** Derselbe Vorfall hat am 5.8.2026 die
Prozess-Seite erzeugt: Skill `landung` Schritt 9 («wip verlässt die Session nie») und der
F6-Registernachtrag im Skill `lehren`. Diese Spec beschreibt **nur die Maschine**; sie ist das
Netz, nicht der Prozess. Wer den Prozess sucht, liest den Landung-Skill.

**Regel.** Für jeden `wip`-Schritt sucht der Lage-Block eine **Bau-Spur** — einen Namen, den die
bestehende Zuordnung `schrittFuerNamen()` auf diesen Schritt abbildet:

1. ein **Bau-Platz** aus `git worktree list` (Platzname UND ausgecheckter Branch, wie in der
   Worktree-Zeile), oder
2. ein **lokaler Branch** aus `git branch`, oder
3. — nur mit `--prs` — ein **offener PR**, über `headRefName` oder über einen
   **Wortgrenzen**-Treffer der ID im Titel (`idTrifft` aus `specBindung.ts`, geteilt statt
   kopiert, §5; blosse Substring-Präsenz liesse «QS-TOK» in «QS-TOK-AUFRAEUMEN» als Spur gelten).

Findet sich keine, erscheint je Schritt eine WARN-Zeile mit ID und dem Freigabe-Befehl
(`plan:set <ID> status=ready|done|parked`). Ohne `--prs` trägt sie den Zusatz «offene PRs nicht
geprüft — netzfrei», und zwar **genau dann, wenn mindestens eine Warnung erscheint** (§8: die
Warnung darf sich nicht sicherer lesen, als sie ist; ohne Warnung wäre der Zusatz Rauschen).

**«Nicht prüfbar» ist nicht «stale».** Fällt `git worktree list` oder `git branch` aus, wird
**nicht** gewarnt — es bleibt bei der vorhandenen Ausfall-Hinweiszeile. Eine Warnung aus
fehlenden Daten forderte zum Freigeben einer möglicherweise belegten Fläche auf; das ist
schädlicher als gar keine Warnung. Kein neues Zustandsfile, keine Zeit-Heuristik («seit X
Stunden»): beides wurde für den Lage-Block bereits verworfen und bleibt verworfen.

**Aufbau (§6.6).** Reine Funktion `staleWip(roh, ids)` in `lage.ts`, aufgerufen aus
`lageZeilen()` nach den Bestandszeilen und **vor** der Ausfall-Zeile. Keine neue Erhebung —
gearbeitet wird ausschliesslich auf `LageRoh`, das bereits erhoben ist; `plan:next` bleibt
netzfrei und importfrei gegenüber dem `startseiteConfig`-Graphen.

**Fertig, wenn** die fünf Fälle mit injizierten Daten getestet sind (Spur vorhanden · ohne Spur ·
PR-Treffer bei `--prs` · git-Ausfall ohne Warnung · zwei stale wip in stabiler Reihenfolge), eine
Mutation den Test rot zeigt (§6.7), die Bestandszeilen des Blocks unverändert sind und
`check:plan` grün ist.

### §Einfach · Plan-System vereinfachen (Schritt `QS-PLAN-EINFACH`, Auftrag David 14.8.2026)

**Der Auftrag ist bewusst OFFEN.** David, 14.8.2026: «wichtig ist das alles weniger kompliziert
wird … neue session soll selbstständig entscheiden können was sie anpassen soll». Dieser § ist
darum **Befundlage, keine Bau-Anweisung**. Die bauende Session wählt selbst, was sie anfasst, in
welcher Reihenfolge und wie weit sie geht. Verbindlich ist allein das Ziel; wer hier eine
Schritt-für-Schritt-Vorschrift sucht, hat den Auftrag missverstanden.

**Drei Ziele.** (1) Die Roadmap wird kürzer. (2) Ihre Schritte werden **offener** formuliert — Ziel
klar, Weg frei; die heutige Durchspezifikation nimmt Folge-Sessions das Urteil ab und veraltet
schneller, als sie gepflegt werden kann. (3) Der **Pflegeprozess selbst** wird billiger — wie ein
Schritt angelegt, abgehakt, rotiert und archiviert wird (Skills `auftrag`, `bauschritt`, Datei
`aufraeumen.md`, Hook `struktur-rotieren.py`).

**Ausgangslage, gemessen 13./14.8.2026** (Mehr-Agenten-Audit, 40 gegengeprüfte Befunde, 7 in der
Gegenprüfung widerlegt und darum nicht aufgeführt):

- **39 %** aller Commits der letzten sieben Wochen (470 von 1192) fassen ausschliesslich
  Steuer-Dokumente an. Auf eine substanzielle Erledigung kommen rund 26 Buchungs-Commits.
- **50 von 79** offenen Etiketten wurden in der gesamten Repo-Historie nie in einer
  Commit-Nachricht genannt. 187 Anlagen gegen 18 substanzielle Erledigungen in 7 Wochen (4,3 : 1);
  Median-Lebensdauer eines wieder entfernten Etiketts: 7 Tage.
- **32 von 80** offenen Schritten betreffen das System selbst, nicht das Produkt — Zeitreihe
  0 (29.6.) → 11 (21.7.) → 32 (13.8.), kein Plateau.
- Vier Etikett-Felder unterscheiden **nie** etwas: `of: ja` steht 20 686-mal, `of: nein` nie (der
  Zweig `wartetFachzeit` kann nicht feuern) · `seq-hart`/`seq-weich` 3 Vermerke, 0 auswertende
  Code-Stellen · `statusAgent` 0 Vorkommen. Konstantfelder = 3908 von 22 096 Byte aller
  Etikettenzeilen (18 %).
- Zwei Tore in der Kette haben **null Abbruchpfade** und melden immer grün
  (`scripts/katalog-inventur.ts`, `scripts/norm-zitate-pruefen.ts`) — §6.7-Fall.
- Drei Halden ohne Leser: `archiv/STRUKTUR-SESSIONKARTEN.md` 791 085 Byte (+12 KB/Tag) · 17 tote
  Archivdateien (155 KB) · 50 Fahrplan-Abschnitte, die in ihrer eigenen Überschrift sagen, dass
  sie nicht steuern (187 714 Byte; Spitze 45 % einer Datei). Doppelungsprobe: nur 0,4 % davon
  steht auch anderswo — es ist Verschieben, nicht Löschen.
- Die Rotation ist **fehlkalibriert**: sie räumte zuletzt auf 49 Byte unter die Marke; der nächste
  Doku-Commit musste sie reissen und tat es 3 h 43 min später.
- **Nicht** die Prüfstrasse: alle Tore laufen parallel in 15,5 s; 78 % der CI-Zeit (38,3 von
  49,1 min) gehen an acht Browser-Prüfungen. Die Ersparnis liegt in Sitzungs- und Lesezeit.

**Was die Gegenprüfung ausdrücklich verteidigt hat — nicht antasten ohne neuen Befund:** die
ID-Liste in `scripts/plan/inventar.ts` (sieht wie eine Kopie aus, ist aber die einzige Wache
dagegen, dass eine Rotation einen *unerledigten* Schritt mitnimmt; lief in 30 Tagen 28-mal) ·
Regel 1c (Dubletten, fand am 31.7. eine echte) · Regel 3 (blockiert ohne Blocker-Eintrag) · das
Feld `groesse` selbst (nur die Vokabelprüfung darum herum ist entbehrlich) · der Sammler der
Selbstoptimierung (einzige Zahlenquelle über den eigenen Bau — die Zahlen oben stammen daraus) ·
die acht Browser-Prüfungen (andere Risikoklasse) · `check:verfall` bleibt aus der Pflichtkette
ausgeschlossen (hängt an der Wanduhr) · §7, §14.7, §18 und alles Fachliche.

**Was David entscheidet, nicht die Session:** Ob die Chronik ihren Wortlaut behält (Empfehlung des
Audits: ja — sie ist die einzige Stelle, an der er ohne Werkzeuge nachlesen kann, warum etwas so
gebaut wurde) · ob eine harte Obergrenze für die Schrittzahl gilt (Empfehlung: vorerst nein) · die
Streichung der zwei QS-Schritte auf Risiko-Pfaden.

**Aufgegangen in diesem Schritt:** `QS-PLAN-SEQ-FRISCHE` (angelegt 13.8., ersatzlos abgelöst
14.8.). Er wollte ein **neues Tor** bauen, das die Veralterung genau der `seq-hart`-Vermerke
überwacht, die hier zur Streichung stehen — ein totes Feld erzeugte neuen Bau. Der auslösende Fall
bleibt als Beleg erhalten: `W2·5h-GESETZ-UI` trägt seit 31.7. einen `seq-hart`-Vorbehalt auf
`QS-UI`, der am 4.8. eingelöst wurde (`FAHRPLAN-UI-QUALITAET.md` §2.2 wörtlich «ist damit
eingelöst») und trotzdem unverändert in der Zeile steht; er las sich in der Sitzung vom 13.8. als
Sperre der Gesetzes-Oberfläche, die es nicht gab.

**Die Wurzel — und warum der Gegenmechanismus kein Text sein darf.** §17 verlangt, jede Störung an
der Wurzel zu beheben; das erzeugt zuverlässig Regeln, Felder, Tore, Schritte, und nichts verlangte
je das Gegenteil. Beleg: Vor dem 3.8.2026 wurde in der gesamten Plan-Historie **kein einziges
Etikett je entfernt**. Schärfster Beleg: Der Commit, der den Grössen-Deckel gerissen hat, heisst
«§17 bekommt sein Gegengewicht — Rückbau ist Teil der Prozessverbesserung» und war 1532 Byte neue
Prosa. Das Gegengewicht als Text hat als Erstes das Problem verschlimmert, das es beheben sollte.
Vorschlag des Audits, den die Session prüfen (und verwerfen) darf: Der Gegenmechanismus setzt am
**Zeitpunkt der Anlage** an — wer eine Regel, ein Feld, ein Tor oder einen QS-Schritt anlegt,
notiert in derselben Zeile, **woran man erkennt, dass es wirkt** und **wann es ersatzlos entfällt**.
Fehlt eines von beidem, wird nichts angelegt. Das macht jede spätere Streichrunde zur Ablesung
statt zur Archäologie.

**Fertig, wenn** die Roadmap spürbar kürzer ist, ihre Schritte das Ziel statt des Weges nennen, der
Pflegeprozess weniger Handgriffe braucht — und die Session in einem Satz sagen kann, was sie
bewusst NICHT angefasst hat. Kein Vorher/Nachher-Beweis auf Byte-Ebene verlangt; wohl aber die
Zahl vorher und nachher. Reine Steuer-Doku und Plan-Werkzeug ⇒ `Gegenpruefung: n/a`, sofern kein
Risiko-Pfad berührt wird. Trailer `Roadmap: QS-PLAN-EINFACH`.

## Selbstverweise in Fahrplänen — Konvention (AP-11, Nachtrag 31.7.2026)

Der AP-8-Umzug nach `fahrplaene/` hat in den Fahrplänen selbst Links hinterlassen, die auf die
eigene Datei zeigten und nach dem Umzug ins Leere liefen. Die Fix-Runde 1 hat 68 solcher Stellen
auf «diese Datei» neutralisiert — jedoch nicht regelgeleitet: in
`FAHRPLAN-FEDLEX-PORTFOLIO.md` blieben zwei Zeilen weiter unten und in derselben Datei drei
weitere Selbstnamen bar stehen (Endprüfungs-Fund R2-24). Damit war für Leser unklar, welchen
Status die jeweils andere Form hat.

**Konvention (ab 31.7.2026 verbindlich):**

1. Der **bare Selbstname** ist zulässig und die Normalform: `` `FAHRPLAN-X.md` `` innerhalb von
   `FAHRPLAN-X.md`. Er ist stabil, umzugsfest und für die Suche auffindbar.
2. Gestrippt wird ausschliesslich der **tote Selbst-Link**: `[FAHRPLAN-X.md](fahrplaene/FAHRPLAN-X.md)`
   → `` `FAHRPLAN-X.md` ``. Ein Link, dessen Ziel die Datei ist, in der er steht, ist kein Zeiger,
   sondern eine Schleife.
3. Formulierungen wie «diese Datei» sind **erlaubt, aber nicht Pflicht**. Wo sie in einem Block
   stehen, der sich als wortgleiche ROADMAP-Kopie deklariert, trägt der Block eine
   Deklarationszeile («Wörtlich bis auf die Selbstverweise …») — sonst behauptet er eine
   Provenienz, die er nicht mehr hat (§8, Fund R2-18).
4. **Abschnitts-Anker** in Selbstverweisen nennen die Überschrift, nie eine Zeilennummer
   (§0.2-Anker-Regel aus `FAHRPLAN-UI-BEFUNDE.md`, hier als Konvention für alle Fahrpläne
   übernommen — die Fehlerklasse ist repo-weit, s. Fund R2-2/R2-20).

**Restbestand:** Die Durchsicht des 31.7.2026 hat die Deklarationszeilen gesetzt und die
FEDLEX-Portfolio-Inkonsistenz auf Form 1 vereinheitlicht. Ein flächiger Durchgang über alle
Fahrpläne ist **nicht** gelaufen und wird nicht behauptet; er läuft mit, wenn eine Datei ohnehin
angefasst wird.

## Bauplan-Review 4.8.2026 — Befunde, Umsetzung, Prävention (Spec-§ für `QS-PLAN-REVIEW`)

**Anlass:** Auftrag David 4.8.2026 abends («schau dir den bauplan an … was könnte man
verbessern? ist alles richtig zugeordnet» + «überlege … was zukünftig solche fehler
vermeidet»). Vier unabhängige read-only-Prüfagenten (Zuordnung, Realitäts-Abgleich,
Hygiene, Koordination) über ROADMAP.md, alle 28 Fahrpläne, git-Historie und offene PRs.
Gesamtbild: mechanisch sauber (`check:plan` grün, kein falsches `done`, Blockaden gültig,
Kopfzahlen 238/1231/53/81 exakt) — die Fehler sitzen dort, wo das Tor blind ist.

### Befunde (Kurzform, Stand main 036675654)

- **B1 — Anker falsch (3 von ~80):** `W2·5k-LINIEN-KONZEPT` → GESETZESDARSTELLUNG-V2
  «§L-3/A28» (existiert nicht; richtig: §2/F4 bzw. GESETZES-UX §10.9) ·
  `QS-KORPUS-BMV` → FEDLEX-PORTFOLIO §17 (behandelt nur fza/cmr; BMV-Spec existiert
  nirgends) · `QS-UI-HIGHLIGHT` → UI-NAVIGATION §S (Stand-Chronik, keine Bau-Spec).
  Fehlerklasse: Anker löst auf, trifft aber das Falsche — für Tor-Regel 6 unsichtbar.
- **B2 — Stale Steuerungs-Prosa:** ROADMAP-Empfehlung «danach W2·5d» (done; gemeint
  heute W2·5h-GESETZ-UI) · QS-TOK-Stand behauptet «Ceiling eingehalten» (seit 3.8.
  ~23:35 falsch) · TOKEN-OEKONOMIE §8 widerspricht dem eigenen Stand-Block (Go 27.7.).
- **B3 — Geparkte Arbeit unsichtbar:** QS-CODE-Reihe steht `ready`, obwohl fertig
  gebaut in 10 offenen PRs (#444, #446–448, #450–454); #454 in keinem Stand-Dokument.
  Frische Session baut doppelt (F6-Nachbarschaft).
- **B4 — Rotations-Regex-Bug:** `.claude/hooks/struktur-rotieren.py` DATUM_RE parst
  nur `## Session T.M.JJJJ`, nicht das Übernacht-Format `T./T.M.JJJJ` — 7 von 16
  Karten rotieren nie (89 % des STRUKTUR-Budget-Risses, 13.4 von 15 KB).
- **B5 — Kleineres:** verwaiste B2-Arbeit (M13/M14) in FAHRPLAN-NORMTEXT-DARSTELLUNG
  ohne steuernden Schritt · `QS-EXTQUELLEN`/`QS-CI-VERCEL` ohne `fahrplan:`-Feld ·
  done-Blöcke (QS-PLAN-BILD, QS-CODE-FRISTENKERN u. a.) nicht in die Chronik migriert ·
  Dach-Präfix-Liste des Intake-Kopfs unvollständig · `plan:next` ohne Priorisierung
  (45 ready + 16 Lanes ungefiltert).

### Umsetzung (Reihenfolge nach §17-Fünf-Schritten, Skill `lehren`)

1. **Sofort-Korrekturen ROADMAP/Fahrpläne** (B1, B2, B3-Vermerk, B5-Kleinteile):
   reine Doku-Edits, EIN Commit — **erst nach Landung der laufenden
   STRUKTUR-Rotation** (Parallel-Session 4.8.), um Merge-Konflikte auf den
   Steuer-Doku zu vermeiden. QS-CODE-Reihe: Status auf `parked`,
   `grund: pr-444ff-offen`, damit `plan:next` sie nicht mehr als baubar anbietet.
2. **Regex-Fix Rotation** (B4): DATUM_RE um `T./T.M.JJJJ` erweitern (zweites Datum
   als Referenz), Testfall mit Übernacht-Karte. Wurzel-Fix des Budget-Risses —
   mit der Rotations-Session koordinieren, nicht parallel anfassen.
3. **Tor-Erweiterung `check:plan` — Spec-Bindung** (Prävention B1, Formregel: Tor
   vor Prosa): neue Regel prüft je `fahrplan:`-Verweis mit §-Anker, dass (a) der
   §-Anker als Überschrift in der Zieldatei auflöst und (b) der §-Abschnitt die
   Schritt-ID wörtlich enthält (Intake-Regel «Bau-Spec im ROADMAP-Spec-§ des
   verlinkten Fahrplans» wird damit prüfbar). Sonderformen (Archiv-Ausnahme
   W3·10→§P3, «STRANG B», Weiterzeiger-§§) über begründete Allowlist analog
   `ARCHIV_BACKLOG`. **Geburtsbeweis:** Das Tor MUSS auf dem Stand vor Schritt 1
   dreifach rot sein (B1) — damit ist §6.7 (einmal rot) by construction erfüllt;
   nach Schritt 1 grün zeigen. Danach Registereintrag im Skill `lehren`
   (F2-Familie: Tor prüfte Container-Existenz, nicht Inhalt).
4. **Sichtbarkeit für Parallel-Sessions** (Prävention B3 + Auftrag «andere
   Sessions wissen, was im Bau ist»): KEIN SessionStart-Hook (Entscheid
   QS-TOK/T19: git-zustandsabhängiger SessionStart-Text zerstört den
   Prompt-Cache — bleibt stehen) und KEINE Claim-Registry (zweimal verworfen,
   Skill `lehren`; Eskalation erst beim dritten F6-Vorfall). Stattdessen:
   (a) `plan:next` bekommt einen **Lage-Block** — wip-Schritte mit ihren
   `kollision:`-Globs, `git worktree list`, dazu Flag `--prs` für
   `gh pr list` (offline-Default bleibt netzfrei). plan:next ist laut CLAUDE.md
   ohnehin der Pflicht-Einstieg jeder Session — 0 Zusatzkosten im Cache.
   (b) **Namenskonvention** Branch/Worktree trägt den Schritt-ID-Slug — macht
   die bestehende wip-Verstoss-Sonde im Lagebild (bildSeiten) treffsicher;
   Heimat: Dispatch-§0 Ziff. 5 (dort steht schon der Früh-Push) + Skill
   `auftrag` Ziff. 2. (c) Skill `auftrag` Ziff. 2 ergänzen: Wer bei Sessionende
   `wip` freigibt, während die Arbeit in einem offenen PR parkt, setzt
   `parked` + `grund: pr-NNN` statt stillschweigend `ready`.
5. **Nice-to-have, eigener Schritt, nicht Teil dieses §:** `plan:next`-Top-N/
   `--phase`-Filter gegen die 45er-Wand; B2-Arbeit M13/M14 entweder als Schritt
   anlegen oder im Fahrplan als bewusst-ungesteuert markieren.

**Nicht gebaut wird:** Prosa-Frische-Heuristik (Über-Regulierung; die Klasse B2
schrumpft mit dem Ziff.-6-Vollzug von selbst) und jedes neue Zustandsfile.

### Stand 5.8.2026 — Befunde B3/B4 erledigt, Schritt 1 gebaut

- **B4 (Rotations-Regex) ✅ erledigt** — die Nacht-Session 4./5.8.2026 hat `DATUM_RE` in
  `.claude/hooks/struktur-rotieren.py` um das Übernacht-Format `T./T.M.JJJJ` erweitert; die
  zuvor nie rotierenden Karten rotieren. Damit ist der Wurzel-Fix des Budget-Risses gebaut
  (§17), nicht umschifft.
- **B3 (geparkte Arbeit unsichtbar) ✅ erledigt** — dieselbe Nacht-Session hat die Landekette
  **10/10** abgearbeitet; die QS-CODE-Reihe steht nicht mehr `ready` neben offenen PRs, sondern
  `done`. Die **Prävention** zu B3 ist damit nicht erledigt, sondern in Ziff. 4 unten verortet:
  Lage-Block, Namenskonvention und die `parked`-Regel im Skill `auftrag` Ziff. 2 (letztere ist
  am 5.8.2026 geschrieben, samt der Branch-/Worktree-Slug-Regel).
- **Schritt 1 (Sofort-Korrekturen ROADMAP/Fahrpläne) ✅ gebaut** — Branch
  `feat/qs-plan-review-doku`, 14 Korrekturen: die drei falschen Anker aus B1 (`QS-KORPUS-BMV`
  → §20.4 · `QS-UI-HIGHLIGHT` → neue Bau-Spec `FAHRPLAN-UI-NAVIGATION.md` §9 ·
  `W2·5k-LINIEN-KONZEPT` → GESETZESDARSTELLUNG-V2 §2/F4 + GESETZES-UX §10.9), die stale
  Steuerungs-Prosa aus B2 (@queue-Kommentar, Ceiling-Satz, TOKEN-OEKONOMIE §8 Ziff. 4), die
  B5-Kleinteile (Dach-Präfix-Liste samt deklarierter `fahrplan:`-Ausnahme, LERNPHASE-§3-Titel,
  FEDLEX §19 als `##` statt `###`) und die zwei fehlenden Schritte
  (`W2·5l-NORMTEXT-B2`, `QS-PLAN-REVIEW`).
- **Offen — der eigentliche Präventions-Bau:** Ziff. 3 (Tor-Erweiterung `check:plan` auf
  Spec-Bindung, **Geburtsbeweis nur noch auf dem Stand VOR Schritt 1 führbar** — also gegen
  `main@d316f5884` oder den Elter-Commit dieses Branches, nicht gegen den heutigen Stand) und
  Ziff. 4a/4b (Lage-Block in `plan:next`, Namenskonvention im Dispatch-§0 Ziff. 5).
- **Nachtrag zu B1:** `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §9.2 trägt denselben toten Anker
  «→ Bau-Spec: §L-3/A28 dieser Datei» wie zuvor die ROADMAP. Er ist **nicht** mitkorrigiert
  (lag ausserhalb der Bau-Whitelist) und bleibt ein offener B1-Rest — das
  Spec-Bindungs-Tor aus Ziff. 3 muss ihn erwischen.

### Endstand 5.8.2026 nachts — alle Befunde gefixt, beide Präventionen gelandet (Schritt done)

Serielle Landung durch die Orchestrier-Session (David: «fixe alle befunde … du orchestrierst,
unter-sessions bauen»), vier Bau-Agenten in Worktrees:

- **Ziff. 3 Tor gelandet** — `check:plan` Regel 11 «Spec-Bindung» (`scripts/plan/specBindung.ts`,
  25 Tests). **Geburtsbeweis geführt:** auf `d316f5884` dreifach rot wie gefordert PLUS zwei
  Neubefunde (`W2·6` →`§12` löst nicht auf · `W2·17-UI-BEFUNDE` →`§1` statt §24) — auch der
  V2-§9.2-Nachtrag und zwei vom Doku-Fix selbst erzeugte Fehl-Anker (`§10.9`, `§2` ohne
  ID-Bindung) wurden vom Tor erwischt und sind korrigiert (Ziff.-Schreibweise für
  Überschriften ohne §-Sigel). Allowlist: genau 1 Eintrag (`W3·10 §P3`, Archiv-Ausnahme,
  Schlüssel id+anker). Auf dem Endstand: **grün.**
- **Ziff. 4a Lage-Block gelandet** — `plan:next` zeigt belegte Flächen (wip+`kollision:`),
  Worktrees/Branches mit Slug→Schritt-Zuordnung («ohne Schritt-Bezug» = unangemeldeter Bau),
  `--prs` optional netzbehaftet; bestehende Ausgabe byte-identisch (cmp-Beweis), 17 Tests.
- **Ziff.-6-Vollzug** — die 5 verbliebenen done-Blöcke (QS-CODE-Reihe, W2·5d) wörtlich in die
  Chronik, `dep: [W2·5d]` zweifach als erfüllt entfernt, Inventar nachgezogen; plan:next
  vorher/nachher byte-identisch.
- **QS-CI-VERCEL-Testplan vollzogen** — Doku-Diff nach Limit-Reset: Vercel-Check
  `success` («Canceled by Ignored Build Step») ⇒ Merge-Bedingung Skip=success erfüllt,
  #445 per Auto-Squash eingereiht (Merge-Go David 4.8.).

**Offene Kleinposten (bewusst, je klein — kein eigener Roadmap-Schritt, Mitnahme beim
nächsten Bau an `scripts/plan/`):** (a) Regel 11 prüft Blockquote-Prosa ohne Bullet-Block
nicht (einziger Bestandsfall: `QS-TOK`) und keine `§§3–§7`-Bereiche — beide Grenzen im Code
mit Test dokumentiert; (b) `bildSeiten.ts` hält eine lokale Slug-Kopie, die `slug()` aus
`lage.ts` importieren sollte (Entdopplungs-Richtung: schwer importiert leicht).


## Selbstoptimierender Bau (`QS-SELBSTOPT` — EIN Schritt, eine ganze Session, ergebnisoffen)

**Anlass:** Auftrag David 5.8.2026; Recherche mit allen Quellen und drei bewussten
Absagen (SaaS/§5 · Auto-Merge/§17 · Rechtslogik nie selbstoptimierend):
`bibliothek/recherche/selbstoptimierender-bau-2026-08-05.md`.

**Mandat:** Entscheid David 5.8.2026 — der Schritt ist bewusst EIN Gesamtschritt: eine
ganze Session widmet sich der Selbstoptimierung und entscheidet ergebnisoffen, was den
Bau am meisten verbessert. Der folgende Zwei-Stufen-Pfad ist Empfehlung, kein Korsett.

**Stufe 1 — erst messen:** Ein generiertes JSON (reine
§5-Projektion, nie handgepflegt) sammelt je Zeitpunkt: Tor-Rot-Ereignisse je
`check:*` · CI-Failure-Rate/Rerun-Rate aus der nativen GitHub-Actions-Metrics-API
(GA seit 3/2025, kein Fremddienst) · Rework-Heuristik (Folge-Commits kurzer Frist
auf denselben Dateien — Beobachtungsgrösse, nie Tor-Kriterium) · Flaky-Retry-Zähler
aus den e2e-Shards · Rückfall-Zähler je F-Klasse des Lehren-Registers. Andockt an
`scripts/plan/lage.ts` (Anzeige im Lagebild) und das Muster von
`scripts/check-ci-laeufe.ts`. Fertig, wenn die Zeitreihe zwei reale Läufe trägt und
das Lagebild sie zeigt; Scheiterns-Fähigkeit einmal gezeigt (§6.7).

**Ent-Regulierung — gleichwertige Stufe (Auftrag David 5.8.2026):** Die Session prüft
bestehende Sicherungen mit dem offiziellen Anthropic-Löschkriterium («would removing this
cause mistakes? If not, cut it») und der Zeitreihe als Beleg: ein Tor, das seit Geburt nie
rot war, aber Laufzeit kostet, ist Streichkandidat — vorher Provenienz klären (Skill
`lehren`, Fünf-Schritte: Hinterfragen → Löschen zuerst). Cherny-Muster als Rhythmus-Idee:
periodisches radikales Entrümpel-Review von CLAUDE.md/Skills/Hooks, weil viele Regeln
Patches für Schwächen des DAMALIGEN Modells sind. Belege: Runde 2 der Recherche.

**Stufe 2 — dann deuten, manuell:** `npm run retro:17`
liest NUR Zeitreihe + Chronik und formuliert einen als ENTWURF markierten
ROADMAP-Vorschlagsblock (kein Auto-Commit, kein Auto-PR); die startende Session
entscheidet über Übernahme. Hebung zu einem geplanten Agenten (Safe-Outputs-Muster)
erst nach Bewährung und mit David-Entscheid — §17-Fünf-Schritte: Automatisieren
zuletzt. Ausdrücklich ausgenommen bleiben Rechtslogik, Engines und Korpus (§1/§2/§7).

**Entscheid David 7.8.2026 («stufe 1 ja»):** Der Vorschlags-Autopilot — Stufe 1 der
drei aufgeklärten Autopilot-Stufen: Cron-Lauf führt `retro:17` aus und eröffnet bei
Befunden einen Entwurfs-PR, kein Auto-Merge — ist **freigegeben**, gebunden an die
Mindestdatenlage ≥ 5 Snapshots (Schritt `QS-AUTOPILOT-STUFE1`, Blocker
`zeitreihe-5-snapshots`). Stufe 2 (autonome Umsetzung auf Prozess-Fläche) und
Stufe 3 (autonomer Bau) sind ausdrücklich NICHT freigegeben — je eigener künftiger
David-Entscheid.


## QS-SESSION-ZYKLUS — der Skill `bauschritt` und sein Auslöser (done 5.8.2026)

Der Session-Ablauf lag verstreut (Bau-Prompt, `auftrag`, `landung`, Gewohnheit);
jetzt liegt er an EINER Stelle (§5): `.claude/skills/bauschritt/SKILL.md` — fünf
Stationen A–E, Grössen-Check in A (sessionfüllend: zu klein ⇒ bündeln, zu gross ⇒
AP-6-Schnitt), Token-Regel-Kasten; Obergrenze ~120 Zeilen, Verweis-Architektur.
Ausgelöst durch die ERSTE Zeile jedes Lagebild-Bau-Prompts («Nutze den Skill
`bauschritt` … Schritt: <ID>», `bauPrompt` in scripts/plan/bildSeiten.ts);
Erste-Zeile-Zusicherung + Bestands-Härtungen testgesichert
(src/tests/plan-bild-lage.test.ts, Rot-Beweis geführt).
