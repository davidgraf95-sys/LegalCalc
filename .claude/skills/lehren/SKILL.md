---
name: lehren
description: Verwenden, wenn etwas schiefgegangen ist und die Lehre daraus bleiben soll — Trigger «das ist schon wieder passiert», «warum haben wir das nicht gemerkt», «Lehre festhalten», «Postmortem», «das darf nicht nochmal passieren» — oder wenn beim Bau ein wiederkehrendes Fehlermuster auffällt. AUCH verwenden bei §17-Prozessarbeit — ein CI-/Merge-/Doku-/Werkzeug-Prozess soll an der Wurzel behoben, verschlankt, gelöscht oder automatisiert werden: dafür die Fünf-Schritte-Reihenfolge hier. Enthält zudem das Register der belegten Fehlerklassen F1–F6 samt Mechanismus und die Regel, in welcher FORM eine neue Lehre abzulegen ist.
---

# Lehren — belegte Fehlerklassen und wo ihr Gegenmittel sitzt

**Zweck:** Lehren aus Vorfällen lagen früher ausserhalb des Repos (Memory) —
unversioniert, für Sub-Agenten unsichtbar. Dieses Register liegt im Repo und
kostet im Normalbetrieb nur seine Description.

## Die Formregel (wichtiger als jede einzelne Lehre)

> **Eine Regel kostet dort am wenigsten, wo sie am spätesten gelesen wird.**

`CLAUDE.md` wird bei **jedem** Dispatch geladen (nach dem A4-Umzug 25.7.2026
~2 500 Token statt ~7 200 — der Hebel wird dadurch kleiner, nicht gegenstandslos).
Eine Zeile dort kostet bei jeder delegierten Einheit. Reihenfolge der Wahl:

| Form | Kosten je Dispatch | Wählen, wenn |
|---|---|---|
| **Tor / Hook** | 0 Token | die Regel maschinell prüfbar ist — **immer erste Wahl** |
| **Dispatch-§0** | ~150 Tok, nur im Auftrag | die Regel den Sub-Agenten erreichen muss, bevor er arbeitet |
| **Skill** | nur die Description | die Regel situativ gilt (Landung, Gegenprüfung, Postmortem) |
| **CLAUDE.md** | volle Kosten, immer | letzte Wahl — nur wenn nicht maschinalisierbar und immer gültig |

Das Design-Reglement sagt das selbst (`DESIGN-REGLEMENT.md` E1, früher zitiert
als `CLAUDE.md` §13 Ziff. 6): maschinell prüfbare Regeln gehören in ESLint/Tests,
nicht ins .md. **Netto-Prosa-Zuwachs ist zu begründen.**

Und: **ein Tor ist erst ein Tor, wenn es einmal rot war.** Wer eines baut, zeigt
den Sabotage-Beweis (§6.7 — Skill `refactoring`, Ziff. 7).

## Register der belegten Fehlerklassen (Vorfälle 18.–20.7.2026)

| # | Klasse | Was passierte | Gegenmittel — wo es sitzt |
|---|---|---|---|
| **F1** | Merge vor Prüfung | PR #309: 11 erfundene Amtsträger:innen ~1 h auf prod. Die Merge-Erlaubnis stand im **Bau**-Auftrag; der Agent hat korrekt befolgt, was dastand. | `tor-schutz.py` blockiert `gh pr merge` → `check:merge-schutz` (committeter Bereich, nicht Working Tree). Prosa hätte es NICHT verhindert. |
| **F2a** | Tor validiert sich selbst | Wächter prüfte gegen die eigene Sync-Marke statt gegen eine unabhängige Grösse. | Wächter gegen **unabhängige** Referenz (erwartete Zeilenzahl aus dem Manifest). |
| **F2b** | Tor läuft in CI gar nicht | `check:seriell` fährt 36 Tore, CI 11. Lokal grün sagte nichts über CI, und CI konnte das strukturell nie melden. | `check:tor-paritaet` — Listenvergleich mit begründeter Allowlist. Friert die Lücke ein: sie kann nur kleiner werden. |
| **F2c** | `cancelled` gilt als «nicht rot» | 5 stumm abgebrochene `turso-sync`-Läufe, Suchindex veraltete unbemerkt. | `landung`-Skill Schritt 5: `cancelled`/`skipped` **zählen als rot**. |
| **F2d** | Beleg = Substring | `ft.includes(nachSlug)`: «ott» galt als belegt durch «rottenberg». | `istWortTreffer()` in `check-besetzung.ts` — Segment-exakte Identität. |
| **F2e** | Tor kann strukturell nie grün werden | Wächter (`check:ci-laeufe`) zählte sich selbst mit: einmal rot ⇒ eigener jüngster Lauf rot ⇒ für immer rot. 15/15 Läufe seit Anlage 20.7.2026 rot, niemand fand «rot» noch bedeutsam — genau die stillen Ausfälle, die er melden sollte (turso, Normen-Monitor), blieben unsichtbar. Spiegelbild von §6.7: ein Tor, das nicht grün werden KANN, ist so wertlos wie eines, das nicht rot werden kann. | Selbstausschluss im Wächter (Fix 3.8.2026, PR #419) + §6.7-Erweiterung: ein neues Tor zeigt man einmal rot UND einmal grün, bevor man ihm glaubt. |
| **F2f** | Tor prüft Container, nicht Inhalt | Bauplan-Review 4./5.8.2026: `check:plan` prüfte je `fahrplan:`-Verweis nur die Datei-Existenz — 3 §-Anker zeigten auf falsche/tote §§ (u. a. ein Risikopfad-Schritt auf eine fremde Spec), 2 weitere fand erst das neue Tor, 2 erzeugte der Fix selbst. Die Klasse «Anker löst auf, trifft aber das Falsche» ist für Existenz-Checks unsichtbar. | `check:plan` Regel 11 «Spec-Bindung» (`scripts/plan/specBindung.ts`): Anker muss als Überschrift auflösen UND der §-Abschnitt muss die Schritt-ID tragen; begründete Allowlist, Geburtsbeweis rot auf `d316f5884`. |
| **F2g** | Tor rot ohne Defekt (Render-Timing) | 15.8.2026: `qsui-hierarchie.e2e.ts` kippte 3–6/65 unter Last — `.lc-route` blendet ab opacity:0 ein, `checkVisibility({opacityProperty:true})` auf dem Null-Frame ist für jeden Nachfahren false; wechselnde Routen, kein Produktfehler. Ein rotes Tor ohne Defekt ist die §17-Klasse «umschiffter CI-Defekt». | e2e-Specs, die Sichtbarkeit/Geometrie messen, setzen `page.emulateMedia({reducedMotion:'reduce'})` im `beforeEach` (index.css schaltet Animationen ab; Haus-Muster a11y/hist-ansicht/rechtsprechung-richter) — nie `waitForTimeout`. Beweis: 2× 65/65 unter workers=16. |
| **F3** | Diagnose ohne Verteilung | 4× an einem Tag wurde Messrauschen als Feature-Regression gedeutet; Reruns = ~72 % der CI-Wanduhr. **2. Vorfall 8./9.8.2026 TROTZ §0.3 (a33-Flake):** ein Bau-Agent schloss aus 5/5 grün auf Kausalität (reale Rate ~15 % ⇒ 5/5 ist Glück) und fuhr die Nullprobe erst nach vier widerlegten Hypothesen; derselbe Stand mass kalt 2–4/20 rot, warm 0/40 — die Messbedingung war der grössere Fund. | Dispatch §0 Ziff. 3, **eskaliert 9.8.2026**: (a) Nullprobe am ANFANG der Diagnose (Re-Run auf unverändertem Stand oder reiner Doku-Diff — `ci.yml` klassifiziert seit der CI-Härtung 3.8.2026 selbst) + (b) Streuung gegen den Schwellenabstand + (c) Stichprobe gegen die vermutete Rate dimensionieren und die Messbedingung (kalt/warm, Parallel-Last) mitnennen — eine Rate ohne Bedingung ist keine Zahl. |
| **F4** | Bericht als Wahrheit | 1× fabrizierter Erfolgsbericht bei 0 Tool-Calls; 1× Injection-Versuch. | `CLAUDE.md` §14 Ziff. 7 (Orchestrator) **+** Dispatch §0 Ziff. 1 (Sub-Agent). Bewusste Doppelablage: Sub-Agenten sehen `CLAUDE.md` nicht. |
| **F5** | Verlorene Agenten-Arbeit | ~6 Agenten-Tode, einmal ~2 h fast verloren. **2. Form 15.8.2026 (Wartetod):** ein `lex-daten`-Agent spawnte selbst eine Gegenprüfung und wartete 5 h auf deren Verdikt — Sub-Agenten können keine Nachrichten empfangen, das Verdikt landete beim Orchestrator; die fertige Arbeit lag uncommittet im Worktree. | Dispatch §0 Ziff. 4: WIP-Commit nach jedem Teilschritt. Muss den Agenten erreichen, **bevor** er stirbt — ein toter Agent liest nichts nach. **Wartetod:** Sub-Agenten spawnen nie etwas, auf dessen Antwort sie warten müssten — Gegenprüfung ist Orchestrator-Sache (`lex-daten.md` RISIKOPFAD-Zeile, Skill `auftrag` Ziff. 6); der Orchestrator prüft bei >2 h Stille den Worktree (`git status`) statt zu warten. |
| **F6** | Doppelarbeit | 2 Sessions bauten denselben CLS-Fix in `SuchResultate.tsx`. **2. Vorfall 28.7.2026 TROTZ §0.5:** `W2·6-NKEY` doppelt gebaut (#397 gemergt, #398 verworfen — ein voller Opus-Bau entsorgt). Die PR-Sonde war blind (Parallel-PR noch nicht offen), der Remote-Branch `worktree-w26-nkey` der Parallel-Session **war sichtbar**; zudem stand der Schritt nie auf `wip`. | Dispatch §0 Ziff. 5, **eskaliert 28.7.2026** (Regel 5): drei Sonden statt einer — PR-Liste + `git ls-remote --heads origin` + `git worktree list` — und Früh-Push des eigenen Branchs. Orchestrator-Seite: Skill `auftrag` Ziff. 2 (@meta `wip` **vor** Baubeginn setzen und pushen). **Eskalation 5.8.2026** (Spiegel-Fall: wip überlebt das Session-Ende — QS-TOK/QS-TOK-AUFRAEUMEN standen nach gelandetem Bau stundenlang «im Bau»): `plan:next` warnt maschinell bei wip ohne Bau-Spur (Branch/Worktree/PR), Landung-Skill Schritt 9 schliesst den Status vor Session-Ende. |
| **F7** | Zustands-Spiegel nur vorwärts getestet | 7.8.2026 (W2·10-UI-NAV-S): die neue `?q=`-URL-Spiegelung wurde nur vorwärts getestet (tippen → Adresse → Reload); die Gegenprüfung fand per History-Back einen deterministischen Verlust — die Echo-Merkung des Spiegels verfiel nie, ein Back wurde als eigenes Echo missdeutet und binnen 300 ms wieder überschrieben. | Wer eine Zustands↔URL-Spiegelung baut, testet auch **rückwärts** (Back/Forward, geteilte URL, Reload mitten im Debounce), nicht nur vorwärts. Wiederverwendbares Gegenmittel im Code: `src/components/suche/useSucheAusUrl.ts` (reine Übergangsfunktionen, Echo-Merkung verfällt nach genau einem Konsum) samt Unit-Kontrakt + e2e-Back-Szenario — neue Spiegelungen docken dort an statt eigene Merkung zu erfinden (§5). |

## Eine neue Lehre ablegen

1. **Klasse bestimmen.** Fällt der Vorfall unter F1–F6? Dann dort das Gegenmittel
   verschärfen — **keine neue Regel danebenlegen**.
2. **Form wählen** nach der Tabelle oben. Maschinell schlägt Prosa, immer.
3. **Beim Tor: Sabotage-Beweis zeigen** (einmal rot).
4. **Neue Klasse** nur, wenn sie wirklich neu ist — mit Beleg (PR-Nr., Datum,
   Schaden). Eine Klasse ohne Vorfall ist eine Vermutung, keine Lehre.
5. **Zweimal aufgetreten trotz Gegenmittel** ⇒ das Gegenmittel greift nicht;
   Form eskalieren (Prosa → Dispatch → Tor).

## §17-Prozessarbeit: die Fünf-Schritte-Reihenfolge

*Herkunft: zugeschnitten aus `malkreide/musk-algorithm-skill` (Hayal Oezkan,
Stadt Zürich, MIT-Lizenz; gesichtet 4.8.2026). Entscheid David 4.8.2026: kein
eigener Skill, nur dieser Anhang — übernommen sind Reihenfolge und Leitplanken,
nicht das Original-Protokoll.*

**Geltungsbereich — nur Prozess, nie Produkt:** CI/Tore, Merge- und
Plan-Prozesse, Steuer-Doku, Werkstatt-Scripts. **Nicht anwendbar** auf
`src/lib/`-Rechtslogik, Engines und alles unter §1/§4/§6 — dort gilt Skill
`refactoring` (Golden-Beweis), und «lieber 50 Zeilen Duplikat als eine falsche
Abstraktion» schlägt jede Vereinfachungs-Intuition.

Wer nach §17 ein Prozessproblem an der Wurzel behebt, arbeitet in dieser
Reihenfolge. **Sie ist nicht verhandelbar** — insbesondere: nie automatisieren,
was nicht vorher gelöscht, vereinfacht und stabil geworden ist.

1. **Anforderung hinterfragen (Chesterton's Fence).** Erst Provenienz klären:
   wer hat die Regel/das Tor wann, aus welchem Anlass angelegt (Commit, PR,
   Vorfall im Register oben)? Eine Regel, deren Anlass niemand benennen kann,
   ist ein Streichkandidat; eine mit benanntem Anlass fällt erst, wenn der
   Anlass entfallen ist.
2. **Löschen.** Was den Zweck nicht mehr erfüllt, wird entfernt — nicht
   umschifft (§17: Workaround ohne Wurzel-Fix ist ein offener Mangel). git
   macht Löschen reversibel; tot Mitgeschlepptes kostet jede Session.
3. **Vereinfachen.** Erst, was das Löschen überlebt hat — nie einen Schritt
   optimieren, der in Schritt 2 hätte fallen müssen.
4. **Beschleunigen.** Erst nach Stabilisierung, und Tempo-Diagnosen nur mit
   Nullprobe (F3): Streuung messen, bevor einer Änderung etwas zugeschrieben
   wird.
5. **Automatisieren — zuletzt und nur Stabiles.** Ein automatisierter kaputter
   Prozess zementiert den Fehler (F2e: der nie-grüne Wächter lief 15× rot, bis
   «rot» nichts mehr bedeutete). Für neue Tore gilt §6.7: einmal rot UND einmal
   grün zeigen.

## Bewusst NICHT geregelt

Über-Regulierung ist selbst ein Effizienzproblem. Verworfen und warum:

- **Generisches Meta-Tor `check:tore`** — ein statischer Analysator für
  Tor-Semantik wäre heuristisch und erzeugt eine selbst verrottende Allowlist.
  Stattdessen das exakte `check:tor-paritaet`.
- **`fail-closed`-Sweep über alle Tore** — die `existsSync`-Gatter sind
  grösstenteils bewusste, dokumentierte CI/lokal-Zweige; ein pauschaler Umbau
  bräche funktionierende Tore.
- **Claim-Registry `.claude/anspruch.json`** gegen F6 — ein neues Zustandsfile
  ist eine neue Drift-Quelle. *Wiederaufgerollt 28.7.2026 nach dem 2.
  F6-Vorfall (#397/#398), Entscheid bestätigt: die Lücke war nicht fehlender
  Zustand, sondern eine zu enge Sonde. Eskaliert wurde innerhalb der
  Dispatch-Form (drei Sonden + Früh-Push, §0.5) plus wip-Pflicht im Skill
  `auftrag`. Tritt F6 ein DRITTES Mal auf, ist die Registry (oder ein Tor)
  dran.*
- **SessionStart-Injektion von Lehren** — git-zustandsabhängiger
  `additionalContext` ist byte-instabil und zerstört den Prompt-Cache
  (QS-TOK/T19, gemessen bei 95,8 % Cache-Read-Anteil). Nur byte-**konstante**
  SessionStart-Texte; Hooks gehören in PreToolUse/Stop (0 Token bei Grün).
- **ROADMAP-Restrukturierung** — Council-Entscheid 3.7.2026 geprüft und
  getragen: die Befunde sind Inhalts-**Frische**, nicht Architektur; ein
  zweiter autoritativer Artefakt hätte die Drift verdoppelt.
