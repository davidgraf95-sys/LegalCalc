// scripts/plan/inventar.ts
// Kanonische ID-Liste der etikettierbaren Einheiten (Geltungsbereich, fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md).
// AUFRÄUMUNG 3.8.2026 (Doku-Finale): Erledigte Schritte stehen nicht mehr im Steuerungsplan —
// ihr Wortlaut liegt vollständig in `ROADMAP-CHRONIK.md` (Umschichtung 3.8.2026). Ihre IDs sind
// hier gestrichen, weil check.ts Regel 1 sonst ein @meta verlangt, das es nicht mehr gibt.
// Entfernt (erledigt/überführt): S0 · W1·1 · W1·2 · W1·3 · W2·5 · W2·5b · W2·5c · W2·5i-HIST-ANSICHT
// · W2·6-B · W2·6-NKEY · W2·6a-MAT · W2·7 · W2·7-BEZUG · W2·7-BEZUG-B7 · W2·12-HYGIENE · QS-PH
// · QS-CURRENCY · W2·17-UI-BEFUNDE-B1/-B2/-B20/-N1 · W3·14-Responsive-Audit/-Defekte.
// Entfernt (gestrichen, Begründung in der Chronik): QS-WISSEN.
// DIÄT WELLE 2 (4.8.2026, Anlass: Wächter `struktur-rotieren.py --check` rot, ROADMAP.md 120.6 KB
// über dem 100-KB-Ceiling): dieselbe Mechanik, 14 weitere erledigte Schritte → Chronik-Abschnitt
// «Umschichtung 4.8.2026». Entfernt: QS-UI-WARNLINE · QS-PLAN-BILD · QS-CODE-FRISTENKERN
// · W2·5d-EID3/-ANNEX/-SPY/-YC · W2·10-UI-NAV-VR/-R1/-R2/-URL/-R3/-R4/-Z.
// ZIFF-6-VOLLZUG 5.8.2026 (Chronik-Überführung): fünf erledigte Schritte → ROADMAP-CHRONIK.md
// § «Übernahme 5.8.2026». Entfernt: QS-CODE-TURSO · QS-CODE-AUSSENKANTEN · QS-CODE-ENTDOPPLUNG
// · QS-CODE-SPLITS · W2·5d. Der Kommentar zur W2·5d-Bindung unten entfällt: die dep-Einträge
// in W2·10-UI-NAV und W2·5h-GESETZ-UI sind bereinigt (Ziff. 4), Regel 4 ist erfüllt.
// GESTRICHEN 8.8.2026 (Entscheid David, «machen wir das nicht»): QS-COCKPIT — Lagebild sollte
// Sessions per Klick starten; nach ~30 Min wieder entfernt, «Prompt kopieren» ist ausreichend.
// Begründung/Wortlaut in ROADMAP-CHRONIK.md § «Streichung 8.8.2026». Nie gebaut.
// ENTSTÜCKELUNG 8.8.2026 (Entscheid David): Ketten-Unterschritte sind Checklisten-Zeilen im
// Dach-Schritt, keine eigenen IDs mehr. Entfernt: W2·17-UI-BEFUNDE-B3…B19 · W2·11-DESIGN-D6…D8c
// · W2·13-KANTONE-K1…K14 (aufgeteilt auf W2·13-KANTONE [Darstellung] und neu
// W2·13-KANTONE-DATEN [Risikopfad]). Neu: W2·18-FEHLERBUCH (stehender Sammel-Schritt).
// UMSCHICHTUNG 7.8.2026 (QS-SELBSTOPT-Abschluss): drei erledigte Schritte → Chronik
// «Umschichtung 7.8.2026». Entfernt: QS-SELBSTOPT · QS-ENTREG-KONFIG · QS-DISPATCH-P0-PRUEF.
// UMSCHICHTUNG 8.8.2026, zweite Welle (QS-SKILL-DIAET-Abschluss): der erledigte Schritt
// → Chronik-Abschnitt «Umschichtung 8.8.2026, zweite Welle». Entfernt: QS-SKILL-DIAET · QS-CONFIDENCE-EHRLICH · QS-AUDIT-VERWEISE
// (dessen Block dort direkt anschliesst).
// UMSCHICHTUNG 8.8.2026 (Aufräum-Session, Anlass: Wächter `struktur-rotieren.py --check` rot,
// ROADMAP.md 104.8 KB über dem 100-KB-Ceiling): sechs erledigte Schritte → Chronik-Abschnitt
// «Umschichtung 8.8.2026». Entfernt: QS-E2E-TEMPO · QS-GP-BEREICH · W2·10-UI-NAV-S/-V/-J/-O.
// Das Dach W2·10-UI-NAV bleibt (status ready) — offen ist dort nur noch -J3.
// Folge-Bereinigung nach Regel 4 (Präzedenz 5.8.2026): `dep: [QS-GP-BEREICH]` in QS-GP-PREPUSH
// geleert, weil die Vorbedingung erledigt und ihr @meta mit in die Chronik gewandert ist.
// UMSCHICHTUNG 13.8.2026 (Aufräum-Session, Anlass: Wächter `struktur-rotieren.py --check` rot,
// ROADMAP.md 106.0 KB über dem 100-KB-Ceiling): drei erledigte Schritte → Chronik-Abschnitt
// «Umschichtung 13.8.2026». Entfernt: W2·5k-LINIEN-KONZEPT · W2·19-GLIEDERUNG · W2·19B-KORPUS.
// Deren offene Folgebefunde sind NICHT verschwunden: zwei Risikopfad-Nachträge stehen jetzt als
// Checklisten-Zeilen unter `W2·13-KANTONE-DATEN`, ein UI-Nachtrag unter `W2·18-FEHLERBUCH`
// (beide ohne eigenes @meta, darum hier nicht separat gelistet). Fahrplan
// `FAHRPLAN-W2-19-SEITENLEISTE.md` nach `archiv/` verschoben (Regel 7: unverlinkt nach dem
// Block-Wegfall).
// ZIFF-6-VOLLZUG 14.8.2026: QS-PLAN-EINFACH done -> Block in ROADMAP-CHRONIK.md.
// KONSOLIDIERUNG 14.8.2026 (QS-PLAN-EINFACH, Etiketten-Sterblichkeit): 16 Kleinst-
// Etiketten als Checklisten-Zeilen in ihre Daecher aufgegangen — QS-GP-PRERENDER/
// -PREPUSH/-NACHBEFUNDE → QS-GP · QS-BASIS-TOT/-DEPS → QS-BASIS · QS-AUTOMATIK-
// BERICHT/-PARITAET + QS-MERGE-AUTOZUG → QS-AUTOMATIK · W2·14-SIGNAL-B1/-B2/-GER
// → W2·14-SIGNAL · W2·7-BEZUG-LADEN → W2·7-VZUI · W2·5k-LINIEN-RUECKBAU →
// W2·5h-GESETZ-UI · W3·14-B3/-S/-a11y → W3·14. Begruendung: ROADMAP-CHRONIK.md.
// ERLEDIGT 15.8.2026: QS-CURRENCY-TESTS (15 Tests, Chronik-Block gleichen Datums).
// ERLEDIGT 15.8.2026: QS-EXTQUELLEN (alle Befunde entschieden, Chronik-Block gleichen Datums).
// KONSOLIDIERUNG 15.8.2026 (BAUPLAN-UMBAU, Auftrag David «schritte zusammenlegen /
// gross schneiden»): 14 Etiketten als Checklisten-Zeilen in fuenf Daecher aufgegangen,
// Wortlaut + Fusions-Begruendung in ROADMAP-CHRONIK.md § «Etiketten-Konsolidierung
// 15.8.2026». Entfernt: W2·6-ADRESSEN · W2·6-FILTER · W2·6-ZNETZ · W2·6-UEBERSICHT
// (→ W2·6) · W2·6-RNAME (→ W2·6-RESOLVER) · W2·5j-TABELLEN · W2·6-MEHRSPRACH
// (→ W2·5g-ZEIT) · W3·10 · W3·11 · W3·13 · W3·14 (→ neu W3-AUSBAU) · QS-KORPUS-BMV
// · QS-KORPUS-SCOPE · QS-KORPUS-RSPR-DATUM (→ neu QS-KORPUS). Neu: W3-AUSBAU,
// QS-KORPUS. Folge-Bereinigung nach Regel 4: die dep [W2·6-RESOLVER] von
// W2·6-UEBERSICHT ist Prosa geworden («erst nach dem Resolver-Teil»). W3·12
// (26x-Slot-Inhaber) und W3·15-RICHTER (blocked) bleiben eigenstaendig.
export const INVENTAR: readonly string[] = [
  'W1·4',
  'W2·6', 'W2·8', 'W2·9',
  'W3·12', 'W3-AUSBAU',
  'LERNPHASE-AB', 'QS-GP', 'SEO-A11Y', 'QS-PERF', 'QS-DATA',
  'W2·6-DATA', 'W2·7-VZUI', 'W2·10-UI-NAV', 'W2·11-DESIGN',
  'QS-OPT', 'QS-BASIS',

  // 'W2·12-HYGIENE' stand hier ein zweites Mal — Dublette entfernt 31.7.2026 (AP-6, QS-TOK).
  // Rein mechanisch: check.ts Regel 1 iteriert das Inventar und prüft nur die Existenz eines
  // @meta je ID, ein Doppeleintrag prüfte also zweimal dasselbe. Kein Verhaltensunterschied.
  'W2·13-KANTONE',

  // Ideen-Intake 20.7.2026 (§14): 8 Alleinstellungs-Ideen verortet.
  'W1·5-PRAXIS', 'W2·5g-ZEIT', 'W2·5h-GESETZ-UI', 'W2·5m-LESER-V3', 'W2·14-SIGNAL', 'W3·15-RICHTER', 'QS-UI',

  // §14-Intake 20.7.2026 (2. Welle, Befunde des Tages). Label-Vergabe bewusst geprüft:
  // W2·5e/5f sind VERBRANNT (am 20.7. doppelt vergeben, danach auf 5g/5h umbenannt) —
  // die Reihe wird darum bei 5i fortgesetzt, nicht mit den freigewordenen Buchstaben.
  // (W2·5j-TABELLEN, W2·6-FILTER und W2·6-RNAME sind am 15.8.2026 fusioniert — s. Kopf.)
  'W2·15-CLS', 'W2·16-INVENTAR', 'W2·16-ANLEITUNG', 'QS-AUTOMATIK',

  // §14-Intake 24.7.2026 (Anmerkungs-Session David): FINMA-Materialien.
  'W2·6b-MAT-FINMA',

  // §14-Intake 31.7.2026 (AP-9, QS-TOK-Aufräumwelle): externe UI-Befundliste (Cowork 29.7.2026,
  // 210 Befunde) — Dachschritt + 20 Batches (19 Bau + 1 Prüf-Batch), Fahrplan FAHRPLAN-UI-BEFUNDE.md.
  'W2·17-UI-BEFUNDE', 'W2·18-FEHLERBUCH',

  // AP-6 (QS-TOK-Aufräumwelle, 31.7.2026): Session-Granularität — offene Mehr-Sessions-Schritte
  // in Teilschritte zerlegt, die plan:next einzeln ausgibt und EINE Session abschliessen kann.
  // Der jeweilige Elter behält sein @meta und bleibt das Dach.
  'W2·6-RESOLVER',
  'W2·10-UI-NAV-J3',
  'W2·13-KANTONE-DATEN',
  // David-Entscheide 2.8.2026 (Nutzer-Turn): die drei per Bestands-Entscheid zurückgestellten
  // UI-Befunde des Batches B1 entschieden (LM-048 verworfen, LM-041/LM-044 geöffnet) + zwei
  // Nebenfunde des Verfallsregister-Durchgangs vom selben Tag in den Plan gehoben.
  // `-N1` statt `-B21`: Nachzug zu B1, NICHT Glied der Bau-Kette B1→…→B19 (s. ROADMAP-Prosa).
  // (`W2·17-UI-BEFUNDE-N1` am 3.8.2026 als erledigt in die Chronik überführt.)
  'W2·7-VZUI-SACHGEBIET', 'QS-CURRENCY-KANON', 'W2·13-KANTONE-DRIFT',

  // §14-Intake 3.8.2026 (Aufräum-Session): Nebenfunde der CI-Diagnose (K1–K13), der Totcode-Welle
  // (#418/#420) und der Gegenprüfungen des Tages — alle klein, alle mit Anlass-Satz in der ROADMAP.
  'QS-FRIT-DRIFT', // QS-BASIS-MQ gestrichen 3.8.2026 (David-Verzicht Merge Queue, nur Org-Repos; Chronik)
  // QS-AUTOMATIK-WT fusioniert 3.8.2026 in QS-AUTOMATIK-BERICHT (gleiche Datei
  // scripts/check-ci-laeufe.ts, gleiche Risiko-Klasse; Begründung in der Chronik).
  'QS-TOK-DECKEL',

  // Entscheide-Paket David 3.8.2026 spätabends: BMV-Nachfolger fehlt im Korpus (PR #422-Befund);
  // Linien-Neukonzeption nach zweifachem Live-Verdikt (12.7. A28 + 3.8. PR #423 geschlossen) —
  // Konzept-Schritt mit David-Abnahme vor Vollbau, nie wieder blosse Default-Umkehr.
  'QS-E2E-STABIL', 'QS-UI-HIGHLIGHT', 'QS-E2E-SHARD-GEN',

  // §14-Intake 17.8.2026 (S1-Nachzug, §17): der Vollauf riss den Hook-Deckel von
  // scripts/datenhaltung/suche.test.ts. Nullprobe: der Pfad ist byte-identisch zu
  // main, der Defekt liegt dort. Wurzel ist eine BASIS-Drift — die isolierte
  // Ingest-Dauer ist seit der Deckel-Kalibrierung vom 14.8. von 10.85 s auf ~31 s
  // gestiegen (3x in drei Tagen). Deckel-Anhebung erst nach der Ursache (§17).
  'QS-DATA-INGEST-DRIFT',

  // Entscheid David 13.8.2026 («ja linien ganz entfernen. 2 es reicht. 3 nein. 4. ok»):
  // W2·5k-LINIEN-KONZEPT entschieden (Variante V1), Rückbau-Bau-Schritt angelegt.
  // §14-Intake 4./5.8.2026 (Nacht-Landekette): Nebenbefunde der adversarialen Gegenprüfungen
  // zu PR #447/#448 — fedlex-Risiko-Klassifikation, leakErkannt-Konsument, PARTEI_RE-Härtung.
  // QS-GP-COMMITDIFF (7.8.2026) am 8.8. als Duplikat in QS-GP-BEREICH fusioniert (Fahrplan §3.7→§3.1).
  // Gegenprüfungs-Befund B6 der J-Runde 8.8.2026: Korpus-Datumsfehler (bge_151_II_475 = 1999).
  
  // Verbesserungs-Runde David 7./8.8.2026: CI-Wartezeit (Shard-Neu-Packung, in-Session gebaut)
  // + Eigenschafts-Tests für die Engines (vermerkt, Invarianten-Katalog mit Abnahme).
  'QS-CODE-PROP',

  // §14-Intake 3.8.2026 (Recherche-Session externe Quellen): Befundliste als EIN Schritt
  // aufgenommen, Bewertung und Verortung bewusst offen gelassen (Anordnung David) — die
  // Aufteilung in Bau-Schritte ist Gegenstand des Schritts selbst, nicht seiner Aufnahme.

  // §14-Intake 5.8.2026 (Recherche selbstoptimierender Bau, Auftrag David):
  // EIN ergebnisoffener Gesamtschritt (Entscheid David: ganze Session), Pfad im Fahrplan-§.

  // §14-Intake 7.8.2026 (Ent-Regulierung QS-SELBSTOPT, Dossier
  // bibliothek/betrieb/entregulierung-2026-08-07.md): zwei David-Gates (Konfig/Regelwerk
  // bleibt beim Menschen — Agenten-§0 und Berechtigungssystem sperren es für Sessions)
  // plus ein baubarer Ehrlichkeits-Fix am Confidence-Werkzeug.

  // Entscheid David 7.8.2026 («stufe 1 ja», nach Aufklärung über die drei Autopilot-Stufen):
  // Vorschlags-Autopilot freigegeben, gebunden an ≥5 Snapshots (Blocker zeitreihe-5-snapshots).
  // Stufe 2/3 ausdrücklich NICHT freigegeben — je eigener künftiger David-Entscheid.
  'QS-AUTOPILOT-STUFE1',

  // State-of-the-Art-Abgleich 7.8.2026 (Web-Recherche gegen Anthropic-Doku):
  // Hook-/Konfig-Ausbauten, gesperrte Fläche ⇒ blocked bis David-Freigabe.
  'QS-HOOKS-AUSBAU',
  'QS-EFFIZIENZ',
  // Fusion 15.8.2026 (BAUPLAN-UMBAU): Dach der Korpus-Pflege — nimmt die drei
  // Risikopfad-Reparaturen BMV/SCOPE/RSPR-DATUM als Checklisten-Zeilen auf.
  'QS-KORPUS',
  'QS-MONITOR-ROT',
  'QS-TYP-LUECKE',

  // Entscheid David 7.8.2026 (Überregulierungs-Frage) + Reglement-Audit PR #460:
  // Prosa-Diät und Verweis-Heilung als eigene Bau-Schritte.

  // Entscheid David 7.8.2026 abends («B als Schritt, A parken» — BEHIND-Kosten
  // der QS-SELBSTOPT-Landekette, 3 manuelle Nachzieh-Zyklen an einem Tag):
  'QS-ORG-UMZUG',

  // §14-Intake 4.8.2026 (Code-Inventur): vier Schritte erledigt, Ziff-6-Vollzug 5.8.2026.
  // (Die fünf Befunde aus der Code-Inventur: vier sind Struktur-Massnahmen und sind jetzt fertig.
  // Der fünfte Befund floss in andere Schritte QS-PERF/QS-AUTOMATIK/etc., wird dort gebaut.)

  // Bau-Evaluation 3.8.2026 (Nutzer-Turn): CI-Kosten- und Feedback-Latenz-Befunde.
  // Die Worktree-/Branch-Inventur aus derselben Evaluation ist KEIN neuer Schritt —
  // sie erweitert QS-AUTOMATIK-BERICHT (Bündelung, Skill `auftrag` Ziff. 3).
  // QS-BASIS-DOKU-CI erledigt 14.8.2026 (PR #488) → Chronik-Abschnitt oben in
  // ROADMAP-CHRONIK.md. David gab den Grundsatz frei, die Messung korrigierte die
  // Prämisse (nicht reine .md-Pushes waren teuer, sondern .md + inventar.ts).
  // F2b-Vorfall 4.8.2026 (#425 grün trotz Manifest-Drift): die Paritäts-Sonde
  // zählte Wächter-Workflows als Deckung. Akuter Fix (check:datenhaltung in
  // ci.yml) ist gebaut; die Sonden-Schärfung + Evaluation der 5 übrigen
  // wächter-gedeckten Tore ist dieser Schritt.
  // §17-Vorfall 4.8.2026: Vercel-Free-Tier-Tageslimit (>100 Preview-Deployments)
  // blockierte den merge-pflichtigen Vercel-Check eines App-fremden Diffs (#443,
  // Admin-Bypass durch David). Wurzel-Fix: Ignored Build Step für App-fremde Diffs.

  // Bauplan-Review 4.8.2026 (Auftrag David, vier read-only-Prüfagenten): der Review selbst
  // als Schritt (Befund-Fixes + die zwei Präventionen Spec-Bindungs-Tor und plan:next-Lage-
  // Block) sowie der bis dahin ungesteuerte B2-Pass des Normtext-Fahrplans (Befund B5:
  // «Nächste Arbeit» seit 29.6.2026, aber kein Schritt — für plan:next unsichtbar).
  'W2·5l-NORMTEXT-B2',

  // Auftrag David 5.8.2026 (Nutzer-Turn): der Lagebild-Einstieg soll «einfachere Sprache»
  // tragen — ein Laien-Block zuoberst auf `plan-bild.html`.

  // §17-Eskalation 5.8.2026 (zweiter Fall nach dem 10-wip-Vorfall vom ~20.7.): `plan:next`
  // warnt vor `wip`-Marken ohne Bau-Spur, statt sie stumm als «im Bau» auszuweisen.

  // §14-Intake 14.8.2026 (Auftrag David, bewusst OFFEN): Plan-System vereinfachen — kürzere
  // Roadmap, offener formulierte Schritte, billigerer Pflegeprozess. Löst den tags zuvor
  // angelegten QS-PLAN-SEQ-FRISCHE ersatzlos ab: jener wollte ein neues Tor für die
  // Veralterung toter Felder bauen, die hier zur Streichung stehen (Audit 13./14.8.2026).
];
