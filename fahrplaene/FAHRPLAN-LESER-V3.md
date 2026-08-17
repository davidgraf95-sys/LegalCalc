# FAHRPLAN-LESER-V3 — Gesetz-Leser V3 (Hülle neu, Kern unangetastet)

Endfassung 16.8.2026 nach Council-Review. Grundlage: Auftrag David 16.8.2026 (19 Positionen),
Ist-Inventar (main @ d6faa05c5), Referenz-/HIG-Recherche, Standausweis-Prüfung, Council-Antworten
A–E + R1–R3 + Advocatus, Council-Verdikt (Option III Hybrid, 14 Plan-Änderungen).
Entwurfsfassung liegt im Scratchpad (`04-plan-leser-v3.md`) und ist damit **abgelöst**.

> Roadmap-Zeiger: Dach-Schritt `W2·5m-LESER-V3` (ROADMAP.md, `fahrplan:` verlinkt, Status blocked bis Davids Go — Blocker `david-go-leser-v3`).

---

## Für David — Kurzfassung in Alltagssprache

**Was wir machen.** Der Gesetzestext selbst (Wortlaut, Fussnoten, Stand, Quelle) wird **nicht
angefasst**, neu gebaut wird nur das Drumherum — und zwar **neben** dem Alten: per Adresszusatz
`?leser=v3` schaltest du um und vergleichst. Erst auf dein «so ist es besser» wird umgestellt.

| Etappe | Du siehst … |
|---|---|
| **V-0** | **zuerst gar keine Software, sondern einen Klick-Prototyp** mit echtem StPO-Text in zwei Fassungen (mit und ohne «Ansicht»-Menü) — du klickst dich durch und sagst, welche gebaut wird. |
| H1 | eine aufgeräumte Kopfzeile (Ort · Artikel · ein Menü) und eine Seitenleiste mit **einem** Feld, in das du entweder ein Suchwort oder «Art. 429» tippst. |
| H2 | Suchtreffer in der Reihenfolge des Gesetzes statt kreuz und quer, gruppiert je Artikel — und das Schliessen der Suche wirft dich nicht mehr im Gesetz herum. |
| H3 | ein eigenes Fenster für Rechtsprechung mit Trefferzahl, statt Entscheid-Zeilen unter jedem Artikel. |
| H4/H5 | dasselbe wie H3, aber ohne Adresszusatz — die neue Ansicht ist ab jetzt die normale; danach verschwindet der alte Code (der eigentliche Aufräum-Gewinn). |
| S1 | den Schalter «Änderungsvermerke» wirkt endlich vollständig: bei «aus» bleibt keine Spur mehr im Lesetext. |
| S2 | den Gesetzestext in neuer Schriftgrösse und neuem Zeilenmass — und gleichmässige Abstände zwischen Artikeln, egal was ein-/ausgeblendet ist. |
| S3 | einen aufgeräumten Erlass-Kopf: Fakten, Stand, Warnung, Aktionen sauber getrennt und in verständlicher Sprache. |

**Reihenfolge und erster Anblick.** V-0 (Prototyp) → H1 → H2 → H3 → H4 (Umstellung) → H5
(Löschung); die kleinen S-Etappen laufen dazwischen, sobald du die zugehörige Frage beantwortet
hast. Auf der echten Seite siehst du Neues ab dem **ersten** gelandeten PR (H1) über
`?leser=v3` — ohne diesen Zusatz sieht jeder andere exakt das Heutige; kein Zwischenzustand
geht je live.

**Zwei Vorarbeiten.** (1) Ein bekannter Darstellungsfehler wird zuerst repariert: manche
Farbflächen erscheinen heute unsichtbar, weil eine Schreibweise im Baukasten keine Regel erzeugt
(`DESIGN-D0`) — darauf lässt sich nichts Schönes bauen. (2) Gemessen wird ab jetzt **dein**
Aufwand: drei Aufgaben (Art. 429 aufschlagen · Entscheide dazu sehen · Stand und Warnung
erkennen) in **Klicks und Sekunden vorher/nachher**, als Tabelle in jedem Kontaktbogen —
«einfacher» heisst damit weniger Klicks, nicht weniger Codezeilen.

**Was du entscheiden musst** (Details Kap. 9; jede Etappe wartet auf ihre Frage):

| Frage | Dann sieht der Nutzer … | Empfehlung |
|---|---|---|
| F1 Den dritten Historie-Modus «Chronologie» streichen? | … nur noch «Änderungsvermerke: an/aus» statt drei Wahlmöglichkeiten für dieselbe Information. | **Ja** |
| F2 Den Schalter «Verweise» streichen? | … keinen Unterschied — der Schalter wirkt heute nur auf eine gepunktete Linie unter Querverweisen. **KORREKTUR S1-Nachzug 17.8.2026 (Ä25, §7):** der Satzteil «die erst beim Darüberfahren mit der Maus erscheint» war FALSCH — die Linie stand dauerhaft da. Der Entscheid «Ja» bleibt richtig (die Linie ist Zierde, nicht Funktion), aber er nahm dem Nutzer mehr weg als beschrieben. | **Ja** |
| F3 Schriftbild-Variante V1 oder V2? | … bei V1 grössere, luftigere Zeilen (19 px, kürzere Zeilen); bei V2 ein kompakteres, amtsnäheres Bild (17 px). Du entscheidest **nach** dem Bildvergleich. | **V1** |
| F4 Entscheide unter dem Artikel nur noch als Zähler («14 Entscheide») statt als Zeilen? | … einen ruhigen Gesetzestext; die Entscheide stehen einen Klick entfernt im Seitenfenster, keiner geht verloren. | **Ja** |
| F5 Standausweis-Wortlaut ändern? | … statt «geltend geprüft am 14.08.2026» neu «gegen Fedlex-Konsolidierung geprüft am 14.08.2026» plus einen Klartext-Satz, wenn Fedlex einer geltenden Änderung hinterherhinkt. | **Ja** |
| F6 Blätter-Pfeile zum nächsten Artikel? | … einen zusätzlichen Knopf — mehr Bedienung, nicht weniger. | **Nein, später** |
| F7 Kopfzeile **mit** «Ansicht»-Menü (A) oder **ohne** Menü (B, Einstellungen wandern ins Seitenfenster)? | … bei A ein Menü rechts oben wie heute; bei B eine Kopfzeile ganz ohne Menü — die Schalter liegen im Seitenfenster unter «Anzeige». **Du entscheidest am Prototyp**, nicht am Text. | **B** — aber mit Einschränkung, siehe Kap. 9 |

**Preis, ehrlich.** Rund **dreizehn** automatische Prüfungen müssen neu geschrieben werden (elf
für Bedienung und Layout, zwei für den Gesetzestext). Zwei Oberflächen bestehen im Umbaufenster
nebeneinander — **hart gedeckelt auf fünf PRs**, sonst Abbruch-Review statt Verlängerung.

**Was garantiert unangetastet bleibt.** Amtlicher Wortlaut, Fussnoten-Substanz, Stand- und
Quellenangaben, Rechenlogik, Datenprüfungen gegen Fedlex. Kein blosser Vorsatz: die Tore, die
sie bewachen (`golden`, `check:normtext`, `check:golden-normtext`, `check:fedlex-versionen`),
laufen bei **jedem** PR und liegen ausserhalb von allem, was hier gebaut wird.

---

## 1 · Zweck, Leitbild und die Grenze Hülle/Kern

1. Anspruch (David 16.8.): bestes und schönstes Gesetzes-Leseprodukt; Massstab sind die acht
   Apple-HIG-Prinzipien in der Fassung vom 8.6.2026 — **Purpose · Agency · Responsibility ·
   Familiarity · Flexibility · Simplicity · Craft · Delight**. Andere Begriffe (Deference,
   Clarity, Consistency, Feedback, Direct Manipulation, Depth) sind Apples **alte**
   iOS-7-Leitmotive und werden in diesem Fahrplan **nicht** verwendet (Council C/E).
2. **Unantastbar:** amtlicher Wortlaut · Fussnoten-Substanz · Stand/Quelle · Golden byte-gleich ·
   Rechtslogik (CLAUDE.md §1, §5, §7).
3. **Grenze Hülle/Kern — scharf gezogen** (Council B, Verdikt-Änderung 11):
   - *Hülle* (neu baubar): Kopfzeile, Seitenleiste, Suche-Bedienung, Menüs, Panels,
     Layout-Gerüst, Pane-Rahmen.
   - *Kern* (tor-gesichert): `normtext/ArtikelBody.tsx` (926 Z.), `parts/ArtikelLeser.tsx`
     (679 Z.), Datenlade- und Drift-Logik.
   - **Kern-Dateien werden ausschliesslich berührt durch (a) Tailwind-Token-Änderungen und
     (b) die Beiwerk-Zone in S2. Jede weitere Kern-Zeile ist eine deklarierte Ausnahme mit
     schriftlicher Begründung im PR** — nicht «unterwegs mitgemacht».
4. **Fokus Bund** (`/gesetze/bund/<SR>`); Kantons-Erlasse laufen durch dieselbe Fassade
   (`GesetzLeser.tsx` liest `ebene` aus der Route). Jede H-Etappe wird deshalb gegen **einen
   Bund- und einen Kantons-Erlass** unter Flag geprüft (Verdikt-Änderung 14).
5. **Split-View ist Pflicht-Dimension.** Sie ist heute nicht «versehentlich eingewoben»,
   sondern zu rund einem Drittel echte Zuständigkeit (Kap. 2) — der Fahrplan trennt beides.
6. Fachbegriffe (Erstnennung): *Hülle/Kern* wie oben · *Tor/Gate* = automatische Prüfung, die
   den Merge blockiert · *CLS* = sichtbares Nachspringen des Layouts · *Flag* = ein Schalter im
   Code, der eine neue Version nur für den zeigt, der sie ausdrücklich anfordert · *Fassade* =
   eine winzige Datei, die nur entscheidet, welche grosse Komponente geladen wird · *e2e-Test* =
   Prüfung, die einen echten Browser fernsteuert · *N-Test* = e2e-Test, der die Treue des
   Gesetzestexts am fertigen Bildschirm prüft · *B-Test* = e2e-Test für Bedienung und Layout ·
   *axe* = automatische Barrierefreiheits-Prüfung · *Disclosure* = ein Knopf, der einen Bereich
   auf-/zuklappt (im Gegensatz zu einem Menü mit Pfeiltasten-Bedienung).

---

## 2 · Diagnose in Zahlen

| Kennzahl | Ist | Beleg |
|---|---|---|
| Umfang Leser-Scope | 16 068 Z. / 71 Dateien | Ist-Inventar §0 |
| Hüllen-Buckets (SEI+SUC+ANS+KOP+KTX+REC) | 8 473 Z. = 53 % | Ist-Inventar §1 |
| Kern-Buckets (FLI+FUS) | 3 368 Z. = 21 % | Ist-Inventar §1 |
| **`imPane`/`istSekundaer` in `src/pages/gesetz-leser/**`** | **102 Zeilen / 114 Vorkommen** (src-weit 169 in 23 Dateien) | **eigene Nachmessung 16.8. — die im Ist-Inventar genannte «38» war falsch** (Verdikt-Änderung 1) |
| davon Kopf-/Layout-/Breiten-Verzweigungen | **~21** (`inhalt-kopfmeldung.tsx:96,115,131`, `inhalt-volltext.tsx:313,423,465,497,549`, `inhalt.tsx:500-501`, `inhalt-zustand.tsx:336-349`) | Verdikt, stichprobenartig nachgeprüft |
| davon Scroll-/Hash-/Navigations-Scoping | **~30**, davon 16 `paneRoot()`-Aufrufe | eigene Messung; **bleibt in jeder Option** — zwei Panes brauchen zwei Wurzeln |
| Split-View-e2e-Deckung | **eine** Datei (`e2e/split-view-a34.e2e.ts`) | eigene Prüfung |
| Feature-Flag-Mechanismus im Repo | **existiert nicht** (nur `VITE_BUILD_ID`, `VITE_KONTAKT_EMPFAENGER`) | eigene Prüfung |
| Fassade als Schaltpunkt | `src/pages/GesetzLeser.tsx` = **8 Zeilen**; `Pane.tsx:125` rendert `<RouteSwitch>` → **beide Panes laufen durch dieselbe Fassade** | eigene Prüfung |
| Playwright-Projekte heute | 2 (`schwer`, `chromium`), `playwright.config.ts:118,123` | eigene Prüfung |

**Fünf Kernbefunde**

| # | Befund | Beleg | Wirkung |
|---|---|---|---|
| K1 | **Zwei Kopfzeilen-Welten.** Einzelansicht trägt `InhaltsKopf` (17 opts-Felder); Split-View ruft ihn **gar nicht** und baut die Leiste `data-such-bar` pane-lokal nach. | `inhalt-kopfmeldung.tsx:96-124` | Jede Kopf-Änderung wird zweimal gebaut und zweimal getestet (Pos. 6). |
| K2 | **Zwei Suchwege, ein Ziel.** In-Gesetz-Suche (1 129 Z.) vs. Quickjump (121 Z.) — zwei Felder, zwei Orte. | Ist-Inventar §5/§6 | David will ein Feld (Pos. 4). |
| K3 | **Optionsvielfalt ohne Bedarfsnachweis:** 24 Grundkombinationen. Der Schalter «Verweise» wirkte nur auf die gepunktete Unterstreichung der Verweis-Links. **KORREKTUR S1-Nachzug 17.8.2026 (Ä25, §7):** «**bei :hover**» war falsch. Gemessen am gebauten Stand (StGB Art. 66a, chromium): `NormText.tsx` `INLINE_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-brass-700'` — `underline` ist UNBEDINGT, nur die FARBE wechselt bei Hover. `text-decoration-line: underline`, `style: dotted` im Ruhezustand, **100 solche Links in diesem einen Artikel**. Der Befund K3 (Optionsvielfalt) bleibt gültig, seine Begründung war zu schwach angesetzt. | `NormText.tsx:38`; `KantonNormText.tsx:31` | F2. |
| K4 | **Historie ist doppelt benannt und nur halb geschaltet.** `data-histansicht="aus"` blendet ausschliesslich `[data-fn-klasse="A"]` aus (`index.css:437-464`). Die vom Nutzer gesehene «Fassung»-Marke ist eine **andere**, ungeschaltete Komponente: `ArtikelHistorie.tsx:106-107`, unbedingt gerendert in `ArtikelLeser.tsx:605-607`. | eigene Sonde | Vollständige Erklärung für Pos. 8 — **kein Schalter-Bug, sondern zwei Dinge mit einem Namen**. |
| K5 | **Kontext-Panel ohne eigenen Ort:** 765 Z. hängen *im* Gliederungs-Scroller als Zone C. | `inhalt-volltext.tsx:654-661` | Ursache des Überlaufens (Pos. 17). |

---

## 3 · Grundentscheid: (B-hybrid)

Bewertet wurden drei Wege. Neu gegenüber dem Entwurf sind die beiden **Deploy-Zeilen** —
sie entscheiden, weil bei uns gilt: Merge nach `main` **ist** der Deploy (§9).

| Kriterium | (I) In-Place, 8 Etappen | (II) Strangler komplett neu | **(III = B-hybrid) neue Hülle hinter Flag, Kern + Hooks + Datenlogik wiederverwendet** |
|---|---|---|---|
| **Live-Zustände zwischen PRs** | 8 — darunter eine Etappe **ohne Sucheingabe im Gesetz** (Kopf nach Mockup gebaut, Ersatz erst eine Etappe später) | 1 | **1** — die Hauptroute bleibt bis zum Flip unverändert |
| **Rückbau-Mechanik** | forensischer Zeilennachweis in 700-Zeilen-Hooks (klassisch gestrichene Etappe) | Dateien ohne eingehende Referenz löschen | **Dateien ohne eingehende Referenz löschen + Flag-Entfernung als Abnahmezeile** |
| Reversibilität je PR | gering (Revert lässt Interimszustand zurück) | hoch | **hoch** (Flag aus = alter Stand) |
| Zeit bis David Sichtbares hat | spät (Fundament-Etappe unsichtbar) | spät (Big-Bang-Neigung) | **nach dem ersten PR, Vorher/Nachher im selben Deploy** |
| Treue-Tor-Risiko | gering (Tests laufen echt gegen den Ist-Stand) | **hoch** — Tests wären trivial grün, weil sie die alte Route prüfen | **gering, aber nur mit Flag-Testprojekt**: dieselben 8 N-Tests gegen **beide** Hüllen = stärkster Paritätsbeweis |
| Split-View-Sauberkeit | K1 lebt bis zur letzten Etappe | ein Kopf ab Tag 1 | **ein Kopf ab Tag 1 im V3-Baum; alter Baum eingefroren** |
| Test-Preis | 11 B-Tests teils **zweimal** (Interim + Endzustand) | 13 neu, einmal | **13 neu, einmal** |
| Zwei-Wahrheiten-Risiko (§5) | keines | **hoch, Fenster unbegrenzt** | **begrenzt: nur die Hülle, Deckel 5 PRs, Flip und Löschung sind eigene Etappen** |
| Passung zu «bau nicht auf Neuem auf» | gut | schlecht | **mittel** — Kern, Hooks, Datenlogik und Tore werden wiederverwendet; «neu» ist nur die Hülle |

**Entscheid: (III).** Die Frage, an der der Entwurf scheiterte: *Kann die Fundament-Etappe die
`imPane`-Weberei auflösen, ohne Scroll- und Hash-Logik anzufassen?* Nachweislich **nein** —
weil rund 30 der Fundstellen korrektes Scoping sind, das in **jeder** Option bleiben muss; das
alte Ziel «≤ 8 Fundstellen» ist damit unerreichbar und wird ersetzt (Kap. 10). Zugleich ist der
Umstieg billiger als befürchtet: die Fassade ist **8 Zeilen**, beide Panes laufen hindurch, und
die Hooks (`useLeserDaten`, `useLeserSprungSpy`, `useSektionSprung`, `useInternRefs`,
`useWeiterlesen`, `useSuchTreffer`, `useLeserZustand`) sind bereits mit Prop-Signaturen
extrahiert — eine neue Hülle **importiert** sie, statt sie neu zu schreiben. Genau das trennt
(III) von (II).

**Was wir dafür verlieren** (stärkste Gegenstimme, bewusst stehen gelassen): Im Fenster
existieren zwei Hüllen — gegen den Buchstaben von §5 und Davids «bau nicht auf Neuem auf»; jede
Korrektur an der alten Hülle ist verlorene oder doppelte Arbeit; das Flag ist neue Steuerung
(§17-Gegengewicht) und muss in H5 mit verschwinden; die Leser-e2e laufen doppelt (CI-Minuten).
**Ohne harten Flip- und Löschtermin wäre (III) schlechter als (I)** — deshalb Deckel und H5 als
Pflicht, nicht als Option.

---

## 4 · Skizze «Leser V3»

Drei Breiten: **H** Handy ≤ 640 px · **D** Desktop ≥ 1024 · **S** Split-View halbe Breite
(≈ 620–760 px). HIG-Tags ausschliesslich aus den acht Begriffen von Kap. 1 Ziff. 1.

### (a) Kopfzeile — ein Vertrag für alle drei Breiten

```
D  │ Gesetze › StPO         Art. 429                    Ansicht ▾   ✕ │
S  │ StPO      Art. 429                       Ansicht ▾ ✕│  (Krume gekürzt)
H  │ StPO · Art. 429    ☰   ···  ✕│   ☰ Gliederung-Sheet · ··· Ansicht
```
*(Bei F7-Variante B entfällt «Ansicht ▾» in allen drei Breiten.)*

| Element | Entscheid | HIG (8er-Kanon) |
|---|---|---|
| Brotkrume + Live-Artikel | behalten — einzige Ortsangabe | **Simplicity** (Hierarchie: «wo bin ich») |
| Suchfeld | raus → Seitenleiste (Pos. 4) | **Familiarity** |
| Menü «Rechtsprechung ▾» | raus → Panel (Pos. 3) | **Simplicity** |
| Chip «Stand …» | raus → Erlass-Kopf (Pos. 18) | **Responsibility** (eine Stand-Wahrheit an einem Ort) |
| Menü «Ansicht ▾» | behalten (A) oder ins Panel (B) — **F7** | **Agency** |
| Overflow-Regel | unter 900 px fällt zuerst «Gesetze», dann der Volltitel; **nie** der Artikel, nie «Ansicht» | **Flexibility** |
| Split-View | derselbe Baustein, nur schmaler; `data-such-bar` entfällt (K1) | **Familiarity**, **Flexibility** |

### (b) Seitenleiste — feste Reihenfolge, nur der Baum ist sticky

```
D/S │ ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)       │  scrollt MIT weg
    │ [ Suchen oder «Art. 429» …                    ⌘K ] │  scrollt MIT weg
    │ Gliederung          [alles auf/zu]   [↑ Anfang]    │  ◀ ab hier sticky
    │  1. Teil … / 1. Titel …                            │  Spalte 18rem/15rem
H   Gliederung + Suchfeld als Bottom-Sheet hinter ☰; «↑ Anfang» schwebt unten
    rechts, mit Text-Label, erst ab > 4 Bildschirmhöhen (NN/g).
```

| Element | Entscheid | HIG |
|---|---|---|
| **Eine** Übersichtsbox, nicht sticky (Fedlex hat drei) | neu (Pos. 10) | **Simplicity** |
| **Ein** Feld für Suche und Sprung — «Art. 429» erkennt `loeseArtikelEingabe` (`suchTreffer.ts:38-42`) und springt, sonst Volltextsuche | neu, löst K2 | **Simplicity**, **Agency** |
| **Korrektur 16.8.2026 (David):** das Feld gehört in den KLEBENDEN Block und steht dort **zuoberst** — Reihenfolge: 1. Such-/Sprungfeld · 2. Gliederungs-Kopfzeile · 3. scrollbarer Baum. Die Skizze oben zeigt es noch über dem klebenden Bereich; das war falsch: «Das Suchfeld muss immer zugreifbar sein, auch wenn ich in der Gliederung scrolle.» Die Übersichtsbox bleibt darüber und scrollt weiterhin weg — sie ist Ankunfts-Information, kein Werkzeug. Umgesetzt in H2 | korrigiert | **Agency** |
| Gliederung sticky | behalten | **Flexibility** (Kontext bewahren) |
| «alles ein-/ausklappen» als sichtbarer Knopf, **kein** Shortcut (W3C ARIA APG: globales Auf/Zu ist kein Tastatur-Standard) | neu (Pos. 16) | **Familiarity** |
| «↑ Anfang», genau **ein** Knopf pro Seite, Text-Label | neu (Pos. 15) | **Agency** |
| Kontext-Panel raus aus Zone C (K5) | weg → (d) | **Simplicity** |

### (c) Fliesstext + Beiwerk — festes Artikel-Raster

```
   Art. 429   Ansprüche                        ← Titelzeile (Höhe reserviert)
   ¹ Die beschuldigte Person hat Anspruch auf …
   ─────────────────────────────────────────    ← Trennlinie (unverändert)
   [ BEIWERK-ZONE — feste Mindesthöhe, IMMER reserviert ]
     Fassung · gilt seit 01.01.2011   ·   ⚖ 14 Entscheide →
     ¹⁾ Eingefügt durch Ziff. I des BG vom … (AS 2024 490)
```

| Element | Entscheid | HIG |
|---|---|---|
| Beiwerk-Zone mit fester Mindesthöhe unabhängig vom Inhalt — löst Pos. 13. Vorbild ist der bestehende Mechanismus `min-h-hist-zeile` 1.5 rem (`tailwind.config.js:138`; ohne ihn CLS 0.0227 statt 0.0002, `ArtikelLeser.tsx:595-602`); S2 hebt ihn von einer Zeile auf die ganze Zone | neu | **Craft** |
| Fussnoten: Substanz unverändert, «AUS» versteckt Marker/Apparat visuell, DOM bleibt (Präzedenz A1, David 5.7.2026, `DESIGN-REGLEMENT-NORMTEXT.md:405ff`) | behalten | **Agency** |
| Historie zweiwertig; «Fassung»-Overline (`ArtikelHistorie.tsx:107`) an denselben Schalter gebunden — hängt heute an gar keinem (K4) | umbauen (S1) | **Simplicity** |
| Rechtsprechung im Text: leiser Zähler «⚖ 14 Entscheide →» statt Kanten-Linien (`BezuegeZeile.tsx` 277 Z. verlässt den Lesekörper) | umbauen (Pos. 12, H3) | **Purpose** (der Leser ist zum Lesen da) |
| Artikeltrenner/Abstände `border-t … pt-7 mt-7`, Anhang `pt-9 mt-9` | unverändert | **Familiarity** |

### (d) Rechtsprechungs-/Kontext-Panel — ein Ort, drei Reiter

```
D  Text ───────────┐ │ [Entscheide] Änderungen  Materialien  (Anzeige*)  │
                   │ │ Filter: Instanz ▾ Kanton ▾ Zeit ▾ (Sachgebiet ▾)  │
                   │ │ BGE 148 IV 22 · 14.03.2022 …    Panel rechts 22rem│
S  Sheet über dem Pane — Regel: NIE drei vertikale Flächen.  H  Bottom-Sheet.
   * Reiter «Anzeige» nur bei F7-Variante B.  (…) = Platz reserviert, s. Kap. 14
```

| Element | Entscheid | HIG |
|---|---|---|
| Drei Reiter statt sechs bedingter Sektionen (`KontextPanel.tsx` 765 Z.) | umbauen | **Simplicity** |
| Facetten Instanz/Kanton/Zeit ziehen aus dem Kopf-Dropdown ins Panel — dorthin, wo ihr Ergebnis steht; vierter Filter «Sachgebiet» baulich vorgesehen (Daten = eigener Schritt) | umziehen | **Agency** |
| Trefferzahl am Öffner; Daten laden erst beim Öffnen (Kap. 7) | neu (Pos. 3) | **Familiarity** (Zustand sichtbar) |
| S/H: Sheet statt drittes Panel | neu | **Flexibility** |

### (e) Erlass-Kopf — Fakten / Status / Aktionen getrennt

```
   Schweizerische Strafprozessordnung (StPO)
   SR 312.0 · 480 Artikel
   Stand 01.04.2025 · gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)
   ⚠ Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text
      eingearbeitet — massgeblich ist die amtliche Fassung.     [nur wenn zutreffend]
   ↗ geltende Fassung   ⬇ amtliches PDF   ⧉ neuer Reiter        [Aktionen]
```

| Element | Entscheid | HIG |
|---|---|---|
| Fakten (Titel · SR · Zahl) und Aktionen je in **einer** Zeile; **eine** Stand-Zeile statt bis zu neun Chips. Wo Anhänge dominieren, heisst die Zahl «Einträge», nicht «Artikel» (Kap. 14) | neu | **Simplicity**, **Familiarity** |
| Warnung nur bei zutreffendem `nichtKonsolidiert`, in Klartext; betrifft heute **5 von 227** Erlassen (BGG, BMV, FZA, STPO, TXG) | neu | **Responsibility** |

### (f) Zustände & Persistenz — Zielbild

| Option heute | Werte | Entscheid | Begründung |
|---|---|---|---|
| `fussnoten` | an/aus | **behalten** | amtlicher Apparat; David-Entscheid A1 |
| `histansicht` | aus/fussnoten/chronologie | **auf 2 Werte** (an/aus) | dritter Modus für dieselbe Information; **Vorbedingung F1** |
| `verweise` | an/aus | **streichen** | wirkt auf die gepunktete Unterstreichung der Verweis-Links. **KORREKTUR S1-Nachzug 17.8.2026 (Ä25, §7):** «nur auf die **Hover**-Unterstreichung» war falsch — die Linie war DAUERHAFT (Messung s. Kap. 2 K3). **Vorbedingung F2** |
| `leitfaelle` | an/aus | **umwidmen** → «Rechtsprechung im Text: an/aus» | Facetten wandern ins Panel |
| Facetten Klasse/Kanton/Zeit | Mehrfachwahl | **umziehen** ins Panel | Ort statt Anzahl |
| `lesePosition`, `PANES_KEY` | — | **behalten** | Rückkehr an die Lesestelle; Split-Vertrag |

Ziel: **3 zweiwertige Schalter** (Fussnoten · Änderungsvermerke · Rechtsprechung) → **8 statt 24
Kombinationen**. **Migration:** gespeichertes `histansicht:"chronologie"` liest V3 als `"an"`;
unbekannte Werte fallen auf den Default (Vitest-Fall Pflicht).

✅ S1 gebaut 17.8.2026 (Branch `feat/leser-v3-s1`) — Vollzugsvermerk in Kap. 7.

### (g) URL/Hash-Vertrag — unverändert

`#art-<token>` bleibt (`inhalt-sprung.tsx:159`). Kein Query-Parameter für die In-Gesetz-Suche —
ein teilbarer Suchlink erzeugte eine zweite Adress-Wahrheit neben `#art-`.
*Korrektur (Council A):* Die Referenz-Notiz nennt `#art_N` als «unser» Schema — das ist
**Fedlex'** Schema. Verbindlich ist `#art-`. Siehe Abnahmekriterien Kap. 11.

### (h) Tastatur

| Taste | Wirkung | HIG |
|---|---|---|
| `⌘K` / `Ctrl+K` oder `/` | fokussiert das eine Such-/Sprungfeld (mobil öffnet es das Sheet) | **Familiarity** |
| `Esc` | leert das Feld, schliesst die Trefferliste, **springt nicht** — Scrollposition bleibt exakt (Pos. 14) | **Agency** («recover from mistakes») |
| ↑/↓ in der Trefferliste | Treffer wechseln; Sprung mit Offset-Ausgleich für die Sticky-Höhe (fehlt heute ganz: `inhalt-suchtreffer.tsx:240-271`) | **Familiarity** (klares Feedback) |
| Baum-Navigation | unverändert nach ARIA APG; **kein** globaler Auf/Zu-Shortcut | **Flexibility** |

Einhängen im bestehenden `LeserTastatur.tsx` (180 Z.) — **keine** zweite Tastaturebene.

---

## 5 · Die Flag- und Umschalt-Regel (verbindlich)

Diese Regel ersetzt die Interims-Regeln des Entwurfs. Sie ist der Grund, warum es **keine
Suchlücke** mehr gibt (Council D/E — das Problem ist unter (III) gegenstandslos).

| Nr. | Regel |
|---|---|
| FL-1 | **Schaltpunkt ist die Fassade** `src/pages/GesetzLeser.tsx` (8 Z.). Sie liest das Flag und rendert entweder `GesetzLeserInhalt` (Ist) oder `GesetzLeserV3`. Weil `Pane.tsx:125` beide Panes durch dieselbe Fassade schickt, schaltet **ein** Flag Einzelansicht **und** beide Panes gemeinsam. |
| FL-2 | **Keine Nebenroute.** `/gesetze-v3/…` wäre falsch: interne Links (`basisPfad`, Teilen-Funktion, TOC-Anker) zeigen auf `/gesetze/…` und liefen ins Leere. |
| FL-3 | **Aktivierung:** `?leser=v3` setzt `lm.leser.v3` (localStorage), `?leser=v1` löscht es. **Default ist aus** — ohne ausdrückliche Anforderung sieht jeder Besucher exakt den Ist-Stand. Ein Vitest an der Fassade beweist den Default (Risiko R10). |
| FL-4 | **Die alte Hülle wird im Fenster eingefroren.** Keine Verbesserung, kein Redesign, keine neuen Optionen dort — nur Fehlerbehebungen mit Live-Wirkung. Damit gibt es zu keinem Zeitpunkt zwei gepflegte Wahrheiten. |
| FL-5 | **Die Suche geht nie verloren.** Die alte Hülle behält ihr Suchfeld unverändert bis H5. Die neue Hülle bringt ihr eigenes Feld **ab H1** mit — H1 ist erst abnahmefähig, wenn in V3 gesucht **und** gesprungen werden kann. Ein Zustand «Kopf neu, Suche fehlt» existiert in keinem PR. |
| FL-6 | **Umschalten verliert die Leseposition nicht.** Beim Wechsel V1↔V3 bleiben Erlass und `#art-`-Anker erhalten; die Optionen (`lm.leser.optionen`) sind **geteilt**, nicht dupliziert (§5). e2e-Nachweis in H1. |
| FL-7 | **Das Flag ist Zuwachs auf Zeit.** Es wird in H5 mit der alten Hülle **entfernt**; die Entfernung ist Abnahmezeile von H5, nicht Nacharbeit (§17-Gegengewicht). |

---

## 6 · Vorarbeiten und Vorprobe — bevor irgendetwas gebaut wird

### V-0 · Klick-Prototyp (David entscheidet am Objekt, nicht am Text)

Statischer HTML-Prototyp, **kein Produkt-Code**, kein Build-Eingriff.
Ablage: `docs/ux-audit-2026-07/reader/leser-v3-prototyp/` (Ordner-Präzedenz:
`…/reader/linien-rueckbau-2026-08-16`).

| Merkmal | Vorgabe |
|---|---|
| Inhalt | echter StPO-Wortlaut aus dem Umfeld von **Art. 429** (aus dem Snapshot kopiert, unverändert) |
| Breiten | H (390) · D (1440) · S (720 = Pane) — je eine Datei oder ein Breiten-Umschalter |
| anklickbar | Such-/Sprungfeld (Eingabe «Art. 429» springt) · Gliederung auf/zu · Panel öffnen/schliessen |
| **Variante A** | Kopf **mit** «Ansicht ▾» und drei Schaltern (Fussnoten · Änderungsvermerke · Rechtsprechung im Text) |
| **Variante B** | Kopf **ohne** Menü — Schalter liegen im Panel-Reiter «Anzeige» |
| Ergebnis | **F7** (Kap. 9) entschieden; erst danach wird `LeserKopf` in H1 gebaut |
| HIG | **Craft** — «Experiment and iterate: früh prototypen, verwerfen, was nicht trägt» (02b Ziff. 7) |

### V-D0 · Vorbedingung DESIGN-D0 (eigener kleiner PR, **vor** H1)

`DESIGN-D0` (ROADMAP.md:283): Tailwind-Klassen mit Deckkraft-Zusatz (`bg-brass-100/70` u. ä.)
erzeugen **keine CSS-Regel** und rendern unsichtbar (belegt LM-156, unsichtbare Aktiv-Zeile der
Gesetzes-Gliederung, PR #472) — auf diesem Fundament setzte eine neue Hülle ihre Zustandsflächen
blind. Deshalb Repo-weiter Sweep + Wurzel-Fix in `tailwind.config.js` + Sichtprüfung als
**eigener PR vor H1**. **`DESIGN-D8a`** (ROADMAP.md:286) wird mitgezogen, weil der
Entscheid-Leser der Split-View-Partner ist und sonst zwei Farbwelten im selben Bild stehen.

### V-1 bis V-3 · Fassaden-Vorprobe

Ohne Produkt-Code zu belegen: die 8-Zeilen-Fassade trägt als Schaltpunkt für Einzelansicht
**und** beide Panes. Aufbau: Fassade liest Flag → `GesetzLeserInhalt` (Ist) oder
`GesetzLeserV3` (zunächst **leerer** Rahmen, der `ArtikelLeser` und die bestehenden Hooks
importiert); dazu das Playwright-Flag-Projekt.

| Schritt | Prüfung | Erwartung |
|---|---|---|
| **V-1 Nullprobe zuerst** | Flag **aus**: `bash scripts/gate.sh voll` + alle 41 Leser-/Gesetze-e2e + `golden:vergleich` + `split-view-a34` | **alles unverändert grün.** Rot hier ⇒ der Defekt liegt auf `main`, nicht am Vorhaben — Diagnose stoppt, bevor irgendetwas dem Umbau zugeschrieben wird |
| **V-2 Tor kann scheitern (§6.7)** | Flag **an**, drittes Playwright-Projekt `leser-v3` neben `schwer`/`chromium` (`playwright.config.ts:118,123`): dieselben 8 N-Tests gegen den V3-Rahmen | **mindestens einer muss zuerst ROT sein** (leerer Rahmen), dann grün, sobald `ArtikelLeser` eingehängt ist. Ohne diesen Rot-Beweis ist das Flag-Projekt ein Tor, das nicht scheitern kann — dann ist die gesamte Paritäts-Aussage wertlos |
| **V-3 Basisrate statt Schätzung** | Zwei Zahlen aus dem Repo-Verlauf holen: (a) wie viele «Rückbau-zuletzt»-Etappen bisheriger Fahrpläne tatsächlich gelandet sind (Streichquote), (b) wie viele Etappen bisherige Leser-Fahrpläne real pro Woche schafften | daran den **Deckel von 5 PRs kalibrieren**; weicht die Basisrate stark ab, wird der Deckel angepasst **bevor** gebaut wird, nicht während |

**Ohne V-0 (F7 entschieden), V-D0 (gelandet) und bestandene Vorprobe V-1…V-3 wird H1 nicht
begonnen.**

### ✅ Vollzugsvermerk V-1 bis V-3 (16.8.2026, Branch `feat/leser-v3-h1`)

**Protokoll mit allen Ausgaben:** `docs/ux-audit-2026-07/reader/leser-v3-vorprobe.md`.

| Schritt | Ergebnis |
|---|---|
| **V-1** | **bestanden.** `gate.sh voll` grün (Exit 0, `golden:vergleich` inbegriffen) · `npm run build` Exit 0 · Leser-/Gesetze-/Split-View-e2e `195 passed` Exit 0. Kein Defekt auf `main`. |
| **V-2** | **bestanden.** Projekt `leser-v3` gebaut (`playwright.config.ts`, Aktivierung über `storageState`, bestehende Specs unverändert). Rot-Beweis mit leerem Rahmen: `56 failed / 1 passed`, Exit 1 → mit eingehängtem `ArtikelLeser`-Baum: `57 passed`, Exit 0. Zusätzlich `e2e/leser-v3-flag.e2e.ts` als Selbsttest des Projekts (Marker positiv gesehen), ebenfalls einzeln rot gezeigt. |
| **V-3** | **erhoben, aber nicht tragfähig für den Deckel** — siehe Abweichung unten. |

**Zwei Korrekturen an diesem Fahrplan** (Belege im Protokoll):

- **Kap. 10, Zeile «e2e N»:** «8 bleiben unverändert grün» steht neben einer Aufzählung von
  **zehn** Namen. Das Flag-Projekt fährt alle zehn. Die Zahl ist beim nächsten Schnitt auf 10 zu
  korrigieren.
- **Kap. 12, A-1:** Die Behauptung, `scrollAnker.ts` beschreibe einen nicht auffindbaren
  localStorage-Spiegel, ist falsch. Die Datei sagt ausdrücklich das Gegenteil
  (`scrollAnker.ts:134–137`), und der dauerhafte Spiegel existiert und ist greppbar
  (`lesePosition.ts:54`/`:98`, Schlüssel `lexmetrik-leseposition`). A-1 ist damit erledigt und
  die Zeile beim nächsten Schnitt zu streichen.

**Abweichung V-3 — der Deckel lässt sich an diesem Repo nicht kalibrieren (wartet auf David).**
(a) Streichquote: über alle 63 Fahrpläne gibt es nur **n = 2** streng zählbare Fälle einer
«Rückbau-zuletzt»-Etappe (1 gelandet, 1 offen, 0 still gestrichen). Das ist eine Anekdote, keine
Rate (§0 Ziff. 3c). Ursache ist ein eigener Befund: **das Repo kennt keinen Feature-Flag-
Mechanismus** (Kap. 2, Zeile 109) — grosse Umbauten liefen bisher ohne Doppelspur, weshalb R9
schlicht keine Vorgeschichte hat. (b) Durchsatz: 41 PR-Landungen auf `src/pages/gesetz-leser` in
4,1 Wochen (≈ 10/Woche), davon ≈ 26 benannte Etappen (≈ 6/Woche) — der 5-PR-Deckel bindet die
**Bauzeit** also nicht und taugt nur als Abbruch-Schwelle, nicht als Zeitplan. Der nächste
Verwandte `archiv/FAHRPLAN-STARTSEITE-V3.md` baute die Startseite in **5 PRs direkt am Bestand**
um — ohne Flag, ohne Parallel-Hülle. Vorschlag: Deckel als Abbruch-Schwelle behalten, H5
(Flag-Entfernung) aber schon als Abnahmezeile von **H1** mitschreiben statt erst am Ende.

---

## 7 · Etappenplan — zwei Stränge

**Strang H** (Hülle, hinter Flag, sequenziell) · **Strang S** (geteilte Schicht, in place,
klein, je an eine David-Entscheidung gebunden; wirkt in **beiden** Hüllen).

**Regeln für jede Etappe:** 1 PR · sortenrein UI · Vorher/Nachher-Kontaktbogen ·
`gate voll` · `golden` byte-gleich · `check:linien-kanon` Teil A · `check:perf-budget` ·
axe-e2e · **N-e2e laufen im Flag-Projekt gegen V3 UND ohne Flag gegen den Ist-Stand** ·
**Split-View ist ein Test, kein Screenshot** (`leser-kopf-paritaet` prüft beide Panes) ·
**Kantons-Probe**: je ein Bund- und ein Kantons-Erlass unter Flag.

Dazu zwei Regeln, die den Erfolg **am Nutzer** und **am Bild** messen, nicht an Codezeilen:

| Regel | Inhalt |
|---|---|
| **NM · Nutzer-Massstab** (Abnahme-Kriterium **jeder** Etappe) | Drei Aufgaben, je Breite (H/D/S), **vorher und nachher** in **Klicks/Tastendrücken** und **Sekunden**: (1) «Art. 429 aufschlagen» · (2) «Entscheide zu Art. 429 sehen» · (3) «Stand und Warnung erkennen». Die Tabelle steht im Kontaktbogen. Eine Etappe, die keine der drei Zahlen senkt und keine als Preis für eine andere ausweist, ist **nicht abnahmefähig** — «einfacher» wird damit erstmals in Nutzer-Grössen belegt, nicht nur in Zeilen und DOM. |
| **Ästhetik-Review** (David 16.8.2026) | Vor dem Merge beurteilt ein SEPARATER Agent die Screens H/D/S in hell und dunkel gegen die Design-Grundlage und die acht HIG-Begriffe. Befunde gehen als Nachzug in dieselbe Etappe oder als benannte Position in die nächste — nie als «später mal». Grund für den eigenen Agenten: wer eine Fläche gebaut hat, sieht sie nicht mehr mit fremden Augen. |
| **Bund-Probe** (David 16.8.2026) | Je Etappe mindestens EIN Bundesgesetz + EINE Verordnung + EIN Staatsvertrag unter Flag prüfen — Kopf-Etikett, Übersichtsbox, Gliederung und Trefferliste müssen identisch aufgebaut sein. «Achte auf Einheitlichkeit, dass alle Verordnungen und Gesetze vom Bund gleich sind.» Abweichungen werden als Befund GEMELDET, nicht stillschweigend gefixt (ausser trivial). **Flip-Kriterium H4:** automatischer Sweep über alle Bundeserlasse auf identischen Aufbau. |
| **Drei Prüfer vor jedem Merge** (David 16.8.2026) | Vor jedem Merge laufen **drei unabhängige Prüfer**, gestartet vom Orchestrator, nie vom Bauenden. **(1) Bug-Check §9.** **(2) Ästhetik-Prüfer** — Screens H/D/S in hell und dunkel gegen die Design-Grundlage und die HIG-Begriffe; die Ästhetik-Checkliste **Ä1–Ä14 wird fortgeschrieben**, und jeder Punkt braucht eine **sinnvolle Umsetzung, nicht nur ein Häkchen** (präzisiert die Zeile «Ästhetik-Review» oben, ersetzt sie nicht — §5). **(3) Architektur- und Erlass-Neutralitäts-Prüfer**, zwingend mit einem **anderen Modell als dem bauenden**: derselbe Code trägt Bundesgesetz, Verordnung, Kantonserlass und Staatsvertrag **ohne Sonderpfade**, Unterschiede stammen ausschliesslich aus dem Datenmodell. Er prüft zusätzlich Abhängigkeitsrichtung (Hülle → Kern, nie umgekehrt), typisierten Vertrag, benannte Erweiterungspunkte, Dateigrösse gegen Verantwortung, Vitest je Komponente und die **Rückbaubarkeit der Ist-Hülle**. Probe je Etappe unter `?leser=v3` mit **je einem Erlass jeder Art**. |
| **PX · Pixelvergleich Textkörper** (zusätzliches Treue-Tor, ab H1) | Playwright `toHaveScreenshot()` auf die Region `.lc-leser article`, gleiche Artikel (StPO Art. 429, OR Art. 336c), gleiche Breite, V1 gegen V3. Der **Textkörper darf sich beim Hüllen-Umbau nicht um ein Pixel ändern** — das ist der schärfste verfügbare Beweis für «Kern unangetastet» und fängt, was DOM-Tests durchlassen (Abstände, Einzüge, Zeilenumbrüche). **Einzige zugelassene Ausnahme: S2**, wo die Baseline **einmalig und deklariert** neu gesetzt wird; die Neusetzung wird im PR begründet und der alte Screenshot als Vorher-Bild beigelegt (§6.3 — eine Baseline stillschweigend zu erneuern wäre ein Tor, das nicht scheitern kann). |

### Strang H

| E | Inhalt | Dateien (neu / entfernt / behalten) | Zeilenbilanz | B-Tests neu | Abnahme-Kriterium (ein Satz) | Aufwand |
|---|---|---|---|---|---|---|
| **H1** | **Fassaden-Flag + `LeserRahmenV3` + `LeserKopf` + Seitenleisten-Skelett mit Such-/Sprungfeld** — Pos. 1, 2, 4, 6, 7, 10, 15, 16; **sichtbar ab dem ersten PR** | neu: `GesetzLeserV3.tsx`, `LeserRahmenV3.tsx`, `LeserKopf.tsx`, `LeserSeitenleiste.tsx`, `SuchSprungFeld.tsx`, Playwright-Projekt `leser-v3` · entfernt: nichts (alter Baum eingefroren) · behalten: **alle Hooks unverändert importiert**, `ArtikelLeser`, `ArtikelBody`, `tocAutoZuklappen`, `leserSuche` | +900 / −0 | 4: `leser-kopf-paritaet` (beide Panes), `leser-v3-suche-sprung`, `leser-v3-seitenleiste-ordnung`, `leser-v3-umschalten` (FL-6) | Unter `?leser=v3` steht in beiden Panes derselbe Kopf, ein Feld sucht **und** springt, das Umschalten V1↔V3 hält die Leseposition — und ohne Flag ist der Ist-Stand bitgleich unverändert. | **L** |
| **H2** | **Suchverhalten** — Pos. 5 (UI-Seite), 14 | geändert: `TrefferListe`-Nachfolger in V3, Sprung-Offset gegen die Sticky-Höhe | +200 / −0 | 3: `leser-v3-treffer-reihenfolge`, `leser-v3-esc-ohne-sprung`, `leser-v3-treffer-mobil` | Treffer stehen in Erlass-Reihenfolge je Artikel gruppiert, und ✕/Esc bewegen den Scroll um 0 px. | **M** |
| **H2b** | **Ästhetik-Nachzug** — die Positionen des Ästhetik-Reviews H1, die H2 aus Deckelgründen liegen liess (s. Ä-Tabelle im Vollzugsvermerk H2). Inhalt: **Ä1** Leerzone unter der Krumen-Leiste schliessen + Krumen-Leiste zeigt im Split den falschen Artikel (**Wahrheitsproblem §7**, eine Ortsangabe aus EINER Scroll-Spy-Quelle) + **App-Seitenleiste im Leser eingeklappt starten** · **Ä5** Seitenleiste als drei gerahmte Kästen, hängendes «·», Durchschimmern unter dem klebenden Block · **Ä8** Hover auf lit. a füllt einen breiten beigen Block (Farbfläche ohne Bedeutung) · **Ä9** Schriftregler doppelt (App-Leiste UND Ansicht-Menü) — im Leser nur EINER · **Ä10** Handy-Sheet: «GLIEDERUNG» doppelt, Überlauf in der Übersicht, «···»-Popover öffnet links statt am Auslöser · **Ä14** Fokusring am Suchfeld doppelt/dick | **Ä1 berührt als einzige Position `src/components/layout/**`** (App-Seitenleiste, Krumen-Leiste) — bis hierher war die Fläche für alle H-Etappen TABU. Sie wird darum mit **deklarierter Whitelist** geöffnet: nur die Dateien, die den Seitenleisten-Default und die Krumen-Quelle tragen, jede mit Nennung im PR. Alles andere in `layout/` bleibt gesperrt. Übrige Positionen: `src/pages/gesetz-leser/v3/**`, `src/index.css` | +150 / −80 | keine neuen Tore nötig — die Positionen sind an den Ästhetik-Screens abzunehmen, nicht an Zusicherungen; Ausnahme **Ä1 Krumen-Wahrheit**: eigener Test, weil eine falsche Ortsangabe ein §7-Fehler ist und kein Geschmack | Die sechs Positionen sind **sinnvoll umgesetzt, nicht abgehakt** (Drei-Prüfer-Regel oben, Prüfer 2), die Krumen-Leiste nennt im Split denselben Artikel wie die Lesespalte, und ohne Flag ist der Ist-Stand unverändert. | **M** |
| **H3** ✅ | **Panel/Sheet für Rechtsprechung + Kontext** — Pos. 3, 12, 17; **Vorbedingung F4**. Enthält **Panel-Nachladen** (s. u.) | neu: `LeserPanel.tsx` (3 Reiter, vierter Filter «Sachgebiet» **vorgesehen**, Datenlogik dazu bleibt `W2·7-VZUI-SACHGEBIET`) · behalten: `bezuegeLaden`, `bezugAuswahl`, `bezugZeit`, `bezugPortion` (Datenlogik unverändert) | +450 / −0 | 4: `leser-v3-panel-facetten`, `leser-v3-panel-zaehler`, `leser-v3-kontext-cls`, `leser-v3-prerender-bezuege` | Jeder Entscheid, der heute unter einem Artikel erreichbar ist, ist über Zähler → Panel erreichbar, in beiden Panes, ohne dritte vertikale Fläche — und das prerenderte HTML trägt die Bezüge unverändert. *(Erfüllt; zwei Teile GEMESSEN ANDERS als vorgesehen: das prerenderte HTML trug nie Bezüge, und die 22-rem-SPALTE passt nicht in den 70-rem-Seitenrahmen — Rechnung, Ersatz und nötiger Entscheid im Vollzugsvermerk H3.)* | **L** |
| **H4** | **Flip** — Flag-Default auf **an**; alte B-Tests gegen die alte Hülle löschen bzw. auf V3 umhängen | geändert: Fassade (Default), `playwright.config.ts` | ±0 | 0 neu (11 alte B-Tests werden entfernt/umgehängt) | Alle acht unveränderten N-Tests, `leser-kopf-paritaet`, CLS ≤ Ist-Stand und axe sind unter dem neuen Default grün, und David hat nach Kontaktbogen zugestimmt. | **M** |
| **H5** | **Löschung der alten Hülle + Flag** — Pos. 9 | entfernt: alte Hüllen-Dateien ohne eingehende Referenz, `inhalt-kopfmeldung.tsx`, `data-such-bar`-Pfad, **`LeserAnsichtMenu.tsx` samt der darin definierten `OptSwitch`** (S1-Nachzug 17.8.2026, Architektur-Prüfer C3 — namentlich aufgeführt, weil `OptSwitch` die V1-KOPIE von `V3Switch` ist: gleiche Optik, gleiche ARIA-Mechanik, seit dem Ä27-Nachzug auch gleiche `hinweis`/`aria-describedby`-Logik. Sie darf H5 nicht überleben, sonst bleibt die Doppelung als zweite Wahrheit stehen, §5), `LeserMenuPaar`, `LeserRechtsprechungMenu`, Flag-Code, tote `data-linien`-Kommentare (`inhalt-zustand.tsx:365`, `leserOptionen.ts:9-15`) · **`components/kontext/KontextPanel.tsx`** — und dann zwingend die Kante `v3/leserV3Modell` → `../inhalt-ansichten` → `KontextPanel` mitschneiden. **NICHT auf die Liste** gehört `components/verzahnung/BezugFacettenWahl.tsx`: geteilter Baustein, den V3 im Panel selbst mountet (Korrektur H3-Nachzug 17.8.2026); ebenfalls **nicht** `gesetz-leser/berechnungen.ts` mit `bieteAenderungsvermerkeSchalter` — geteilte Quelle, die V1 UND V3 tragen (D1, H3-Nachzug 17.8.2026) · dazu die dann leere `v3/GesetzLeserV3.tsx`-Naht und `helpers/panelOeffnen.ts`, sobald es nur noch EINE Hülle gibt | **−2 500 bis −3 200** | 0 neu | Jede gelöschte Datei hat den Nichttrage-Nachweis **vor** der Löschung, alle Tore sind grün bei byte-gleichem Golden, und im Repo existiert kein Flag-Code mehr. | **M** |

### ✅ Vollzugsvermerk H2 (16.8.2026, Branch `feat/leser-v3-h2`)

**Gebaut:** Trefferliste als Verzeichnis (`v3/LeserTrefferListe.tsx`) in
Erlass-Reihenfolge, je Artikel gruppiert, mit einer Zeile JE Fundstelle samt
Kontext-Schnipsel; Suchbereich-Segment (`v3/SuchBereichWahl.tsx`); ↑↓/Enter im
Feld; ✕/Esc ohne jede Scroll-Bewegung; S4 (Dokument-Reihenfolge) in
`leserSuche.ts`; `QS-UI-HIGHLIGHT` behoben.

**Was über die Zeile hinausgeht und hier festgehalten gehört:**

- **QS-UI-HIGHLIGHT reichte weiter als gemeldet.** Der Roadmap-Text nennt das
  Rail-Suchfeld im Split-View. Der Rot-Beweis zeigte: die Panes überschrieben
  einander bei **jeder Eingabe**, nicht erst beim Leeren — die Vereinigung
  entstand nie. Und es gab einen **zweiten Schreiber**: `entscheidLeserRegeln.ts`
  hielt eine eigene Kopie von `highlightApi()` und schrieb dieselbe Position
  direkt, weshalb ein Entscheid neben einem Gesetz beim Verlassen die Markierung
  des Gesetzes mitnahm. Beides läuft jetzt über eine Buchführung je Instanz.
  **Bewusst offen:** zwei ENTSCHEID-Panes teilen weiterhin eine Modul-Instanz —
  unverändert gegenüber dem Vorzustand, ausserhalb des Befunds.
- **Pos. 14 war ein echter Defekt, kein fehlendes Feature.** `inhalt-sprung.tsx`
  scrollte beim BEGINN der Suche an den Anfang und beim Leeren wieder zurück.
  Die Begründung im Code nennt ihren eigenen Ablauf: nötig war das, WEIL die
  Trefferliste den Volltext ersetzte. Seit S8 tut sie das nicht mehr. V3 steigt
  über `scrollBeiSuchwechsel: false` aus; die Ist-Hülle behält ihr Verhalten
  (FL-4). Damit ist auch **Ä3** des Ästhetik-Reviews erledigt.
- **Der Suchbereich steuert Liste, Zähler und ↑↓-Folge — NICHT die
  Hervorhebung** im Wortlaut. `sammleTrefferRanges` malt jedes Vorkommen des
  Begriffs im sichtbaren Text und kennt keine Feldklassen. Beide Zusagen sind
  für sich wahr und beantworten verschiedene Fragen; sie zu vermengen hiesse,
  dem DOM-Walker eine Feldkenntnis anzudichten, die er nicht hat. **Bewusste
  Grenze, kein offener Rest.**

#### A-7 · PX ist eingelöst — und hat die Zusage aus Kap. 7 widerlegt

Opt-in-Projekt `px` (`PX=1`), bewusst NICHT in den CI-Shards: die Baseline
entsteht lokal auf macOS, der CI-Runner ist Linux, Font-Rasterung unterscheidet
sich dort systematisch. **Flake-Basisrate 0/5 Läufe (20 Test-Ausführungen);
Messbedingung: lokal macOS, warm, `vite preview`, keine Parallel-Last.**

**Der Befund und seine Auflösung.** OR Art. 336c riss mit **40 276 Pixeln
(ratio 0.05)**, in jedem Lauf exakt dieselbe Zahl — kein Rauschen, also nie eine
Toleranz-Frage. StPO Art. 429 war pixelgleich. Drei Erklärungen wurden geprüft
und **ausgeschlossen**, nicht geglaubt: der Sprung-Puls `lc-ziel-blink`
(entfernt und abgewartet, Zahl blieb); der Satzspiegel (real — @1440 Spalte
874 gegen 691 px, Artikel 744 gegen 561 px —, seit der Mess-Klemme auf 640 px
aber keine Erklärung mehr); und Knoten-für-Knoten-Sonden, die **nichts** fanden
(139 sichtbare Knoten beidseits, Artikelhöhe 1526 px, 3145 Zeichen, gleiche
Schriftmasse).

**Die Ursache wurde im Diff-BILD gesehen, nicht gerechnet** — daran war die
vorige Diagnose gescheitert, die ausschliesslich gerechnet hatte. Markiert war
weder ein Rand noch ein Subpixel-Saum, sondern **jeder Buchstabe**: die Signatur
von «eine Seite ist leer». Nachgemessen an der Aufnahme (Screenshot-Bytes als
Tinten-Indikator):

| | V1 | V3 |
|---|---|---|
| Element-Screenshot | 341 696 B | **5 856 B** ← nur Papier |
| dasselbe mit `content-visibility: visible` | — | 341 673 B ← Text da |

`.nt-art-cv` trägt `content-visibility: auto` (1686 Artikel allein im OR). Ein
**übersprungener** Artikel behält über `contain-intrinsic-size: auto` seine
zuletzt bekannte Grösse: **er misst sich vollständig und malt nichts.** Genau
deshalb war jede DOM-Sonde grün, während das Bild leer blieb. In V3 steht der
Artikel 56 px tiefer (höhere Kopfzeile) — das genügt für eine andere
Relevanz-Entscheidung des Browsers bei Playwrights Element-Aufnahme.

**Kein Produktfehler, geprüft statt angenommen:** ein Viewport-Bild derselben
V3-Seite ohne Element-Clip zeigt Art. 336c vollständig gesetzt. Leer war die
**Aufnahme**, nie die Seite. Dieselbe Falle ist im Druck schon einmal
aufgeschlagen und dort gleich gelöst (`@media print`).

**Folge fürs Tor:** `artikelBild` schaltet das ausgelagerte Rendering am
Mess-Artikel ab — in beiden Hüllen gleich, mit von Hand nachgezogener
Einschliessung, damit weiterhin das AUSGELIEFERTE Bild gemessen wird. **Die
Toleranz wurde nicht angefasst** (`maxDiffPixelRatio` unverändert 0.001), die
Baseline **nicht** neu aufgenommen. Rot-Beweis (§6.7), beides gesehen: ohne
Abschaltung 40 276 px; mit Abschaltung, aber ohne Einschliessung 4383 px
(StPO 429) bzw. 15 350 px (OR 336c). **Das Tor kann scheitern.**

**⚠ ENTSCHEID DAVID — Satzspiegel, bleibt offen.** Dass V3 den Text schmaler
setzt als V1, ist gemessen und durch die Auflösung oben **nicht** erledigt: PX
misst seit der Klemme ausdrücklich den **Text-Kern**, nicht den Satzspiegel.
«Der Textkörper ändert sich nicht um ein Pixel» (Kap. 7 PX) und «die neue Hülle
hat eine 18-rem-Seitenleiste» (Kap. 4b) sind bei gleicher Fensterbreite nach wie
vor nicht gleichzeitig erfüllbar; welche Zusage weicht, entscheidet keine
Bau-Etappe nebenbei (§7). Der Punkt hängt mit **Ä2** zusammen.

#### Ästhetik-Review H1 (5,5/10) — was H2 nimmt und was bleibt

Erledigt in H2: **Ä3** (Tippen sprang an den Seitenanfang — s. o.).

**NICHT in H2 gebaut, mit Grund und Ort.** Der Review kam an, als H2 seinen
Deckel (+200 Zeilen, Kap. 7) bereits deutlich überschritten hatte; acht
Gestaltungsänderungen ohne eigene Screens und ohne zweiten Ästhetik-Durchgang
hinterherzuschieben hiesse, dieselbe Etappe ein zweites Mal unbesehen zu
vergrössern. Sie sind darum als **benannte Positionen** eingetragen, nicht als
«später mal»:

| Nr. | Inhalt | Ort |
|---|---|---|
| **Ä1** | Leerzone unter der Krumen-Leiste schliessen (V3-Kopf bündig, `top-16`); Krumen-Leiste zeigt im Split den falschen Artikel («Art. 428» statt «Art. 429») — **Wahrheitsproblem §7**, eine Ortsangabe aus EINER Scroll-Spy-Quelle; dazu **App-Seitenleiste im Leser eingeklappt starten** (aus Ä2 hierher gezogen, weil dieselbe Fläche `src/components/layout/**` betroffen ist) | ✅ **erledigt in H2b** — Lücke 48 → 0 px auf H/D/S (`leser-v3-kopf-buendig`); die Krumen-Wahrheit war NICHT reproduzierbar (eine Quelle bereits vorhanden) und ist jetzt BEWACHT (`leser-v3-ortsangabe`); App-Seitenleiste startet im Leser eingeklappt. Vollverschmelzung bleibt H4 |
| **Ä2** | Lesespalte 556–616 px @1280; Lesespalte auf 40 rem | ✅ **erledigt in H2** (`max-w-normtext` → `max-w-reading`, Nachtrag 16.8.); der Seitenleisten-Default ist nach **Ä1/H2b** gewandert |
| **Ä5** | Seitenleiste als drei gerahmte Kästen; hängendes «·» in der Übersichtszeile; Übersichtsbox schimmert unter dem klebenden Block durch | ✅ **erledigt in H2b** — Box entrahmt (Weissraum statt Kasten), hängendes «·» weg, klebender Sockel trägt die Fläche seines Behälters |
| **Ä8** | Hover auf lit. a füllt einen breiten beigen Block (Farbfläche ohne Bedeutung, Kap. 8 Nr. 3) | ✅ **erledigt in H2b** — `paper-sunken` statt `brass-200/60`, kein 2-px-Lift mehr. KERN-BERÜHRUNG deklariert (`ArtikelBody.tsx`, wirkt in beiden Hüllen) |
| **Ä9** | Schriftgrösse doppelt (App-Leiste UND Ansicht-Menü) — im Leser nur EIN Regler, und zwar im Ansicht-Menü | ⏳ **teilweise in H2b, Rest → H4.** Erledigt: der Leser-Regler heisst «Gesetzestext» und ist der einzige für den Normtext (`[role=group][aria-label="Schriftgrösse"]` 2 → 1 bei offenem Panel). OFFEN: den globalen App-Regler im Leser AUSBLENDEN. Das geht heute nur über Flag-Wissen in der Topbar (FL-1) oder einen V1-Umbau (FL-4) — beides teurer als der Befund wiegt. Der Punkt fällt darum mit der **Leisten-Verschmelzung A-2 in H4**, wo die Topbar ohnehin angefasst wird. **Kein David-Entscheid nötig** — technische Sequenzierung, Orchestrator-Entscheid 17.8.2026 |
| **Ä10** | Handy-Sheet: «GLIEDERUNG» doppelt, Überlauf in der Übersicht, «···»-Popover öffnet links statt am Auslöser | ✅ **erledigt in H2b**, soweit reproduzierbar — «GLIEDERUNG» 2× → 1×; Überlauf (0 px gemessen) und Popover-Position (0 px Abweichung) waren NICHT reproduzierbar und sind gemeldet, nicht gefixt |
| **Ä12** | «Seitenleiste ausblenden» (App) gegen «‹ ausblenden» (Gliederung) — gleiche Wortwahl, zwei Wirkungen | ✅ **erledigt in H2** (der Knopf sagt jetzt, WAS er ausblendet) |
| **Ä14** | Fokusring am Suchfeld doppelt/dick — ein 2-px-Ring in der Fokus-Rolle | ✅ **erledigt in H2b-NACHZUG** — H2b nahm nur den `box-shadow` weg und liess Rahmenfarbe + `outline-offset: 1px` stehen, also wieder zwei Messing-Kanten (Ä41). Jetzt: Rahmen im Fokus neutral, Ring ohne Spalt |
| **Ä15** | Trefferzähler ellipsiert seine Kernauskunft («9 Artikel · 15 Fundstellen» braucht 159 px in einer 155-px-Spalte). Umbruch erlauben oder kürzen («9 Art. · 15 Stellen») — an einer Kernauskunft ist eine Ellipse nie richtig (§8) | ✅ **erledigt in H2b** — Umbruch statt Ellipse (176 px in 148 px → 148 = 148); bewusst KEINE Abkürzung |
| **Ä16** | **Zwei ✕ im Suchfeld, Wurzel gemessen:** das Feld ist `type="search"`, Chromium rendert dazu seinen eigenen `::-webkit-search-cancel-button`, und V3 legt zusätzlich `data-v3-such-leeren` daneben. Im gebauten Stand existiert **keine** `search-cancel-button`-Regel (0 Treffer über alle `document.styleSheets`); V1 hat das Problem nicht, weil es keinen eigenen Lösch-Knopf mitbringt. Fix: nativen Cancel per Utility ausblenden (`[&::-webkit-search-cancel-button]:appearance-none`) **oder** `type="text"` mit passendem `inputmode` — **eine** Löschung, nicht zwei | ✅ **erledigt in H2b** — `type="text"` + `role="searchbox"`; die Ursache ist weg, nicht das Pseudoelement übermalt |
| **Ä17** | Trefferzeilen haben den **Kontext-Schnipsel verloren** (V1: «Art. 47 Kosten 1 Entschädigungspflichten aus Rechtshilfe…», V3: «Art. 47 Kosten 1»). Im Ruhezustand je Artikelgruppe die **erste** Fundstelle mit Schnipsel zeigen, den Rest beim Aufklappen — damit trägt die Liste wieder, was der Vollzugsvermerk ihr zuschreibt | ✅ **erledigt in H2b** — jede Trefferzeile trägt im Ruhezustand ihren Ausschnitt (aus `LeserTreffer.ausschnitt`, kein zusätzlicher Lauf) |
| **Ä18** | Bottom-Sheet auf dem Handy ordnet Feld → Übersicht → Treffer, der Desktop Übersicht → Feld → Treffer. Zwei Reihenfolgen für dieselbe Leiste (§5) | ✅ **erledigt in H2b**, in H2b-NACHZUG **präzisiert** — EINE Regel auf allen Breiten: das Feld ist das oberste Element des klebenden Blocks; im OFFENEN Blatt ist das der Blatt-Kopf (Ä35), sonst Spalte bzw. Kopf-Block. Es gibt weiterhin genau EIN Feld im DOM |
| **Ä19** | **Im Split-View existiert gar kein Suchfeld** (`count === 0`; V1 hat je Pane eines), und das geöffnete Blatt verdeckt das Pane vollständig — wer im Split sucht, verliert den Text aus dem Blick, in dem er sucht. Dieselbe Wurzel wie der Handy-Mehrschritt bei NM-3. **Gewichtigster offener Punkt** | ✅ **erledigt in H2b** — klebende Such-Zone im Kopf-Block (`v3/SuchZone.tsx`): im Split 0 → 2 Felder, je Pane eines, ohne Geste und ohne Overlay über dem Text (`leser-v3-suchfeld-ueberall`) |
| **Ä20** | Platzhalter im Suchfeld ist fix «Suchen oder «Art. 429» …» — auch bei §-Erlassen (gemessen an ZH-211.11, wo sonst durchweg korrekt «§/Paragraphen» steht). Platzhalter je Erlassart aus dem Erlass ableiten | ✅ **erledigt in H2b** — Platzhalter aus dem Erlass («Suchen oder «§ 1» …»), Beispiel = Etikett der ersten Bestimmung |
| **Ä21** | Kanton-Kopf zeigt den Titel **dreimal**: App-Krume, Leser-Krume, H1. Bei ZH-211.11 schärfer als beim Bund, weil dort das Register-Kürzel bereits der volle Name ist — Kürzel und Volltitel sind wortgleich. Wenn Kürzel = Volltitel: nur einmal ausgeben (`LeserKopf.tsx`) | ✅ **erledigt in H2b**, in H2b-NACHZUG **geschärft** — `zeigeVolltitel()` prüft neu WORTGLEICHHEIT statt `startsWith` (Ä36) |
| **Ä22** | LugÜ-Titel wird silbengetrennt umbrochen | **S3** (mit Ä6, Erlass-Kopf) |
| **Ä23** | **«Artikel» ist in `LeserTrefferListe.tsx` hart kodiert** (2 Stellen) — `bestimmungsWort` existiert bereits in `LeserRahmenV3.tsx`, gehört nach `erlassAnsicht.ts` und muss durchgereicht werden, damit §-Erlasse in der Trefferliste nicht «Artikel» zählen | ✅ **erledigt in H2b**, in H2b-NACHZUG **vollzogen** — H2b reichte den Wert durch, liess ihn aber als Literal an fünf Stellen stehen; jetzt Typ + Ableitung + Zählform in `erlassAnsicht.ts`, bewacht (Ä42) |
| **Ä4** | Beiwerk-Chips laufen über den Rand | ~~H3/S2~~ ⇒ **H3** — in S2 reproduziert und vermessen (Scroll-Streifen `.lc-bezug-linie`, scrollWidth 875 gegen clientWidth 414 @1440; 17 Nachfahren über die Artikelkante, bis 232 px @720; kein Dokument-Überlauf). Nicht dort behoben, weil **H3 diese Chip-Zeile durch den Zähler «⚖ n Entscheide →» ersetzt** (F4) — Detail im Vollzugsvermerk S2 |
| **Ä6** | Erlass-Kopf | **S3** |
| **Ä7** | Randtitel über Artikelnummer (Hierarchie) | **S2** ✅ gebaut — drei sichtbare Stufen (Nummer 16 px bold ink-900 > Blatt 13 px semibold ink-800 > Vorfahren 13 px regular ink-600). **Rest im S2-Nachzug** erledigt: die dritte Randtitel-Stufe der SEKTIONSKÖPFE lief noch auf `text-micro` (11 px Serif 500, lh 1.2) — leiser als der Blatt-Randtitel des Artikels darunter und so klein wie der Apparat; sie steht jetzt auf `leser-rand`. Stufen 0/1 der Gliederungsköpfe bewusst unverändert (David hat sie nicht am Bogen gesehen, §7) |
| **Ä11** | Split-Pane-Icon-Flut | **H3/H4** |
| **Ä25** | **Verweis-Unterstreichung steht dauerhaft im Ruhezustand** (nicht «nur bei Hover», wie fünf Doku-Stellen behaupteten) — gemessen 100 gepunktete Linien in StGB Art. 66a | ⏸ **wartet auf David.** S1 korrigierte die Fakten und baute den Design-Umbau NICHT; S2 baute ihn (Ruhe = `font-medium` + Farbe, Linie erst bei Hover/Fokus); der **S2-Nachzug hat ihn ZURÜCKGENOMMEN** — Ist-Stand ist wieder die dauerhafte gepunktete Linie. Grund: `INLINE_CLASS` (`NormText.tsx`) ist die Verweis-Klasse der **ganzen Site**, nicht des Lesers (~20 prerenderte Rechner-/Vorlagen-Seiten), und ohne Linie trägt allein die Farbe — gemessen **1.00 : 1** auf `/rechner/verjaehrung`, **1.06 : 1** auf den übrigen Rechner-Seiten, **2.14 : 1** im Leser, gegen die 3 : 1 der WCAG-Technik G183. Die axe-Ausnahme `link-in-text-block` ist ein David-Entscheid (`docs/ux-audit-2026-07/BERICHT.md` B-2) und wird von einer Typografie-Etappe nicht ausgeweitet. **Der Entscheid, den David fällt:** Design-Grundlage Kap. 8 («Linie erst bei Hover») gegen G183 (3 : 1 nötig; im Dunkelmodus in keiner der 14 Rollen erreichbar — Rechnung im Vollzugsvermerk S2 und an `VERWEIS_INLINE_CLASS`). **Empfehlung: Linie behalten.** Ist-Bilder: `docs/ux-audit-2026-07/reader/leser-v3-s1/ae25-ist-ruhezustand-stgb-66a-{light,dark}.png` |
| **Ä26** | Historie-Slot reserviert 40 px auch dann, wenn der Erlass nie eine Fassung trägt (Phantom-Lücke unter jedem Artikel) | **S2** ✅ gebaut — Reserve folgt **artikelweise** dem Datenmodell (`fussAnzeige.length > 0 \|\| historie`; der Generator baut Historie-Einträge nur aus Artikel-Fussnoten ⇒ Invariante, 0 Gegenbeispiele in 24 511 Artikeln). Korpusweit 25 403 → 17 547 reservierende Artikel (−31 %); BS-640.100 **−264 von 278** (Nachzug-Korrektur 17.8.2026: der Nenner ist 278, nicht 292 — die 14 aufgehobenen Artikel starten eingeklappt und rendern die Beiwerk-Zone gar nicht, konnten also nie reservieren; die 14 Fussnoten-Artikel sind eine davon **disjunkte** Menge, am Korpus geprüft). **Ausdrücklich KEINE Ebenen-Weiche** (`erlass.ebene` wäre ein Erlass-Sonderpfad) — Rot-Beweis dazu im Vollzugsvermerk |
| **Ä61** | lit.-Marke läuft über den Item-Text («cbisvor», «cquatersolange», «abismüssen») | **S2-Nachzug** ✅ gebaut — `w-6` (feste 24-px-Spalte) → `min-w-6`. Gemessen @1440 vorher, in beiden Hüllen identisch: OR 336c `cbis.`/`cter.` +10 px, `cquater.` +35.2 px, `cquinquies.` +60.41 px; AIG 5 `abis.` +10 px. Neue Spec `e2e/leser-marken-geometrie.e2e.ts`, Rot-Beweis 5/5 |
| **Ä62** | Fussnotenmarke fällt allein an den Zeilenanfang | **S2-Nachzug** ✅ gebaut — Marker-Träger `whitespace-nowrap` + Wort-Verbinder INNERHALB. Gemessen vorher: StGB 13/532 (V3) bzw. 16/532 (V1), StPO 8/276; nachher je 0. Die im Auftrag vermutete Ursache (`inline-block`) ist **widerlegt** — Blink erzwingt für `<button>` unabhängig von `display` eine atomare Inline-Box; Gegenbeweis per DOM-Chirurgie. Herleitung an `FnRef` |
| **Ä63** | Handy-Einzug: OR/ZGB @390 beginnt der Fliesstext bei x = 80 px (StPO 44 px) — zwei Einzüge für dieselbe Rolle | **H4/S3** — in S2 nur festgehalten, nicht behoben (kein Nachzug: der Wert hängt am hängenden Einzug `pl-9`, der Kap. 4c mitentscheidet) |
| **Ä64** | Der Schriftregler skaliert nur `[data-lese]` — Randtitel, Apparat und Marken bleiben stehen, bei 130 % kippt die Hierarchie | **H4** — in S2 nur festgehalten. Die Stufen müssten em-relativ am Lesekörper hängen statt an eigenen rem-Tokens; das ist ein Skalen-Umbau, kein Nachzug |
| **Ä65** | Doku-Drift: der Reserve-Kommentar in `tailwind.config.js` beschrieb `erlass.ebene === 'bund'`, gebaut ist `fussAnzeige.length > 0 \|\| historie` | **S2-Nachzug** ✅ erledigt — Wortlaut aus `berechnungen.ts` übernommen, die Ebenen-Weiche ausdrücklich als NICHT gebaut benannt |
| **Ä66** | Apparat-Links und Fliesstext-Verweise sprachen zwei Verweis-Sprachen (Apparat mit Linie, Fliesstext ohne) | **S2-Nachzug** ✅ erledigt — **durch die Ä25-Rücknahme**, ohne eigenen Eingriff: der Fliesstext trägt wieder dieselbe gepunktete Linie wie der Apparat |
| **Ä27** | Bei «Fussnoten: aus» steht «Änderungsvermerke ✓ an», sichtbar ist aber nur die «Fassung»-Zeile — die Abhängigkeit ist im flachen Menü unerkennbar | ✅ **S1-Nachzug**: Hinweiszeile am Schalter, nur bei «Fussnoten: aus», V1 **und** V3 aus einer Konstante (`HINWEIS_VERMERKE_OHNE_FUSSNOTEN`); als `aria-describedby`, nicht im Namen |

**Deckel-Stand:** H2 ist der zweite der höchstens fünf H-PRs (Kap. 7).

#### Abschluss H2 — Zeilenbilanz, Dateien, Abweichungen

**Zeilenbilanz gegen `main`** (gemessen, nicht geschätzt): `src/` +1666 / −147 ·
`e2e/` +911 / −14 · Steuer-Doku +109 / −3. Davon in der V3-Hülle selbst
(`src/pages/gesetz-leser/v3/`) **+508 / −36**. **Der Deckel «+200 Zeilen» aus
Kap. 7 ist um das Zweieinhalbfache gerissen** — das ist die wichtigste
Abweichung dieser Etappe und der Grund, warum der Ästhetik-Nachzug als eigene
Etappe **H2b** ausgelagert wurde, statt H2 ein drittes Mal zu vergrössern.

**Neue Dateien:** `v3/LeserTrefferListe.tsx`, `v3/SuchBereichWahl.tsx`,
`gesetz-leser/leserSchrift.ts`, `e2e/px-textkoerper.e2e.ts` (+ zwei Baselines),
`e2e/leser-v3-{treffer-reihenfolge,esc-ohne-sprung,highlight-split,schriftskala}.e2e.ts`,
`src/tests/{leser-schriftskala,fussnoten-toggle-huellenneutral}.test.ts`.

**Drei Abweichungen, die über den Auftrag hinausgehen:**

1. **FL-4-Bruch an der eingefrorenen V1 — gefunden und behoben.** Der erste Fix
   des Fussnoten-Defekts verengte den CSS-Selektor auf `#lc-lesespalte`.
   Gemessen an der Ist-Hülle (BGBM): **4 von 29 Marker-Buttons liegen ausserhalb
   der Lesespalte** (Erlasskopf, Ingress) — dort schaltete der Toggle seither
   gar nicht mehr. Das ist eine Verhaltensänderung an V1 und verletzt FL-4. Die
   Wurzel liegt tiefer: **eine CSS-Regel darf Elemente nicht über ihren Text
   suchen.** Der Marker trägt jetzt die eigene Kennung `data-fn-ref`
   (`ArtikelBody.tsx`); Wächter `src/tests/fussnoten-toggle-huellenneutral.test.ts`.
   `[data-fn-marker]` wurde als Ersatz-Scope geprüft und **verworfen** — 19/29
   (BGBM) bzw. 476/847 (OR) Marker liegen ausserhalb eines solchen Clusters.
   *Whitelist-Überschreitung:* `src/components/normtext/ArtikelBody.tsx` liegt im
   Kern und war nicht freigegeben; die Kennung dort zu setzen **ist** der
   Wurzel-Fix, jede Alternative wäre ein Workaround gewesen (§17). Golden und
   `gate voll` decken die Änderung ab.
2. **A-7/PX aufgelöst** — s. o. Die Ursache war eine leere **Aufnahme**, kein
   Pixelunterschied; Toleranz und Baseline blieben unangetastet.
3. **Drei Specs beschrieben einen Stand, den es nicht mehr gab** (Portal-Rolle
   des Sheets, deaktivierter Anschlag-Knopf, Feld im klebenden Block). Alle drei
   wurden nachgezogen, keine Assertion gelockert; zwei wurden dabei **schärfer**
   (Pane-Rollen-Probe, `toBeDisabled` statt folgenlosem Klick). Nebenbefund: in
   `leser-v3-schriftskala` war «Schrift verkleinern» nicht auf das Ansicht-Panel
   gescopt und hätte den **App**-Regler bedient — Hin- und Rückweg hätten zwei
   verschiedene Steller gemessen (Ä9 beisst, jetzt in H2b).

---

### ✅ Vollzugsvermerk H2b (17.8.2026, Branch `feat/leser-v3-h2b`)

**Vorher/Nachher-Bilder:** `docs/ux-audit-2026-07/reader/leser-v3-h2b/{vorher,nachher}/`
— je 20 Aufnahmen: Desktop 1440 · Mobil 390 · Split 1440 (auch mit laufender
Suche), hell **und** dunkel, je StPO Art. 429 (Bund, Warnzeile) · VMWG
(Verordnung) · LugÜ/0.275.12 (Staatsvertrag) · ZH-211.11 (Kanton, §-Etikett).
Jede Position unten ist **gemessen**, nicht besehen (Ist-Werte im Klammerzusatz).

| Nr. | Was gebaut wurde | Beleg |
|---|---|---|
| **Ä1a** | Leerzone unter der Krumen-Leiste geschlossen: der Kopf verschluckt die Wrapper-Polsterung über `--leser-v3-kopf-luecke` (Vorgabe `index.css` mit `theme('screens.sm')`, Pane-Wert inline). **48 px → 0 px** @1440, 0 px @390, 0 px im Pane | `leser-v3-kopf-buendig` (a)(b)(c) |
| **Ä1b** | Krumen-Wahrheit: **nicht reproduzierbar** — beide Angaben stammen schon aus EINER Quelle (`aktArtikel`, Scroll-Spy). Statt eines Fixes ein Wächter, der die Übereinstimmung MISST (Chrome ↔ V3-Kopf, Einzelansicht und beide Panes mit verschiedenen Nummern) | `leser-v3-ortsangabe` (a)(b) |
| **Ä1c** | App-Seitenleiste startet im Gesetz-Leser eingeklappt. `useSeitenleiste` unterscheidet neu «noch nicht gewählt» (`null`) von einer Wahl — vorher schrieb ein Mount-Effekt `'0'` und machte beides ununterscheidbar. Lesefläche @1440 +256 px | `sidebar-o2-konsistenz`, Bilder |
| **Ä5** | Übersichtsbox entrahmt (Weissraum statt Kasten, Kap. 8 Nr. 1: **4 → 3** Rahmen-Elemente in der Leiste, keiner davon ein Kasten); hängendes «·» entfernt; klebender Sockel trägt neu die Fläche seines Behälters (`.lc-leiste-sockel` — im Blatt lagen drei Töne übereinander: `paper-raised`/`paper`/`paper-sunken`) | `leser-v3-auskunft` (Ä10+Ä5), `leser-v3-bauteile` |
| **Ä8** | Leiser Hover statt breitem Brass-Block: `brass-200/60` + 2-px-Lift → `paper-sunken`, kein Transform. **KERN-BERÜHRUNG** (s. u.) | `ArtikelBody.test.tsx` (2 Fälle umgekehrt) |
| **Ä9** | Der Leser-Regler heisst «Gesetzestext», nicht mehr «Schriftgrösse» — `[role=group][aria-label="Schriftgrösse"]` **2 → 1** bei offenem Panel. Warum der App-Regler bleibt: s. Entscheid unten | `leser-v3-schriftskala` (Namen + Panel-Scope) |
| **Ä10** | «Gliederung» im Handy-Blatt **2× → 1×** (die Leiste schweigt dort, der Blatt-Kopf benennt die Zone und wechselt auf «Treffer»). Überlauf/Popover-Position: **nicht reproduzierbar** (s. u.) | `leser-v3-auskunft` (Ä10+Ä5) |
| **Ä14** | EIN 2-px-Fokusring in der Rolle `focus` statt Rahmenfarbe + `--ring` (2 px Papier-Saum + 2 px Messing): `box-shadow` **→ none** | `leser-v3-auskunft` (Ä14) |
| **Ä15** | Trefferzähler bricht um statt zu ellipsieren: `scrollWidth` **176 px in 148 px → 148 = 148**. Gewählt Umbruch, nicht «9 Art. · 15 Stellen» — «Stellen» ist keine amtliche Einheit | `leser-v3-auskunft` (Ä15+Ä17) |
| **Ä17** | Kontext-Schnipsel zurück in JEDER Trefferzeile des Ruhezustands (**0 → alle**), aus dem ohnehin vorhandenen `LeserTreffer.ausschnitt` — kein zusätzlicher Lauf (§15) | `leser-v3-auskunft` (Ä15+Ä17) |
| **Ä16** | EINE Löschung: `type="search"` → `type="text"` + `role="searchbox"`/`inputMode`. Ursache entfernt statt UA-Pseudoelement übermalt | `leser-v3-auskunft` (Ä16) |
| **Ä18/Ä19** | **Die klebende Such-Zone** (`v3/SuchZone.tsx`): wo die Gliederung nicht als Spalte steht, trägt der klebende **Kopf-Block** das Feld. Im Split **0 → 2** Felder (je Pane eines, ohne Geste, ohne Overlay über dem Text); auf dem Handy und @1440 mit eingeklappter Gliederung ebenfalls neu vorhanden. Das Blatt trägt kein zweites Feld mehr (§5/K2). Damit gilt auf H/D/S **eine** Reihenfolge-Regel: das Feld ist das oberste Element des klebenden Blocks | `leser-v3-suchfeld-ueberall` (a)(b)(c), `leser-v3-treffer-deckel` |
| **Ä20** | Platzhalter aus dem Erlass: «Suchen oder «§ 1» …» statt fix «Art. 429». Beispiel = `artikelLabel` des ERSTEN Eintrags, nicht aus dem Bestimmungswort gebaut | `leser-v3-auskunft` (Ä20+Ä23) |
| **Ä21** | Der Name steht einmal: `zeigeVolltitel()` lässt den Volltitel entfallen, wenn der Titel mit dem Kürzel beginnt (ZH-211.11: 3 → 2 Ausgaben, davon eine in der App-Krume). Bund/Verordnung/Staatsvertrag unberührt | `leser-v3-erlassansicht`, Bilder |
| **Ä23** | «Artikel» war an 2 Stellen hart kodiert → `bestimmungsWort` durchgereicht, mit Zählform («1 Paragraph»). ZH-211.11: «9 Artikel» → «9 Paragraphen» | `leser-v3-auskunft` (Ä20+Ä23) |
| **Ä-(d)** | Kennung VOR dem Titel, wenn der Titel länger als 80 Zeichen ist: LugÜ-H1 liest neu «LugÜ · Übereinkommen vom 30. Oktober 2007 …» statt «… (LugÜ)» am Ende der dritten Zeile. Optionale Prop am geteilten Kopf, Regel rein in `erlassAnsicht.titelKennung` — die Ist-Hülle setzt sie nicht (FL-4) | `leser-v3-erlassansicht`, Bilder |

**Rot-Beweis (§6.7) — alle 13 Fälle der vier neuen Specs einmal rot gesehen**
(gemeinsamer Sabotage-Lauf 17.8.2026, je Spec-Kopf notiert, wie):
`kopf-buendig` (a) 48 px / (b) 32 px / (c) 24 px statt 0 · `suchfeld-ueberall`
(a) 2 → 0 Felder, (b)/(c) Feld verschwindet · `ortsangabe` (a)(b) Chrome nennt
«Art. 1» gegen den echten Artikel · `auskunft` Ä14 Doppelring wieder da, Ä16
`type=search`, Ä15 ellipsiert, Ä17 Marker weg, Ä20 «Im Gesetz suchen …» ohne §,
Ä23 «Artikel» am §-Erlass, Ä10 «Gliederung» 2×.

**Drei Entscheide, die über die Zeile hinausgehen:**

1. **Ä9 — der App-Regler bleibt im Leser (wartet ggf. auf David).** «Im Leser nur
   EIN Regler» ist erfüllt: es gibt genau einen für den *Gesetzestext*, und er
   steht im Ansicht-Menü. Den *globalen* Regler dort auszublenden hätte nur zwei
   Wege, und beide kosten mehr als der Befund wiegt: an einen Leser-Pfad gebunden
   verliert die **eingefrorene Ist-Hülle** ihren einzigen Schriftregler (sie hat
   keinen eigenen — FL-4-Bruch); an das Flag gebunden wüsste die App-Topbar vom
   Flag, dessen Schaltpunkt ausdrücklich die eine Fassade ist (FL-1). Behoben ist
   die Ursache der Verwechslung — zwei Werkzeuge, zwei Namen. Will David den
   App-Regler im Leser dennoch weg, ist das ein eigener Schritt in H4/H5, wo die
   Leisten ohnehin verschmelzen (A-2).
2. **Ä1c berührt BEIDE Hüllen — deklariert.** Der Seitenleisten-Default ist
   App-Chrome und kann nicht hüllenweise gelten, ohne Flag-Wissen in die Shell zu
   tragen. Er wirkt darum auch in der Ist-Hülle. Das ist neben Ä8/Ä9 die dritte
   bewusste Kreuzung der FL-4-Linie; sie ändert eine **Vorgabe**, kein Verhalten,
   und eine bestehende Nutzerwahl gewinnt weiterhin überall.
3. **Zwei Positionen NICHT reproduzierbar — kein Fix ohne gesehenen Fehlschlag
   (§0 Ziff. 2).** *Ä10 «Überlauf in der Übersicht»:* @390 im Blatt gemessen
   0 px horizontaler Überlauf (Box 358 px in 390 px, Scroller `scrollWidth ===
   clientWidth`); der einzige `scrollWidth > clientWidth` ist eine bewusst
   `truncate`-te Zeile im GETEILTEN `ErlassUebersicht` (§15.2-Entscheid, in V1
   identisch). *Ä10 «···-Popover öffnet links»:* Panel-Rechtskante = Auslöser-
   Rechtskante, Abweichung **0 px** @390 (Auslöser x 314–342, Panel 102–342) — es
   ist ein rechtsbündiges Popover, das nach links wächst, weil rechts kein Platz
   ist. Beides gemeldet, nicht gefixt.

**Zeilenbilanz gegen `main`** (gemessen): `src/` +807 / −128, davon in der
V3-Hülle (`src/pages/gesetz-leser/v3/`) **+561 / −97**; `e2e/` +575 / −26. Der
Deckel «+150/−80» aus Kap. 7 ist gerissen — Grund und Gegenmassnahme: die
Ä19-Zone ist ein eigenes Bauteil geworden, und die Dateischlankheits-Sonde
(`leser-v3-fundament`, ≤ 420 Zeilen, grösste Datei = der Adapter) hat den Rahmen
**dreimal rot gemeldet**, bis `SuchZone.tsx`, `LeserUebersicht.tsx` und
`ReiterAktion.tsx` herausgelöst waren. Der Rahmen steht bei 414 Zeilen (vorher
402), also schlanker als vor dem Zuwachs zu erwarten war.

**Neue Dateien:** `v3/SuchZone.tsx`, `v3/LeserUebersicht.tsx`,
`v3/ReiterAktion.tsx`; `e2e/leser-v3-{kopf-buendig,suchfeld-ueberall,ortsangabe,auskunft}.e2e.ts`.
**Kern-Berührung:** `src/components/normtext/ArtikelBody.tsx` (Ä8, wirkt in
beiden Hüllen — der Befund ist heute live). Golden byte-gleich (Engines/Vorlagen
sind unberührt).
**Whitelist-Überschreitungen, je mit Grund:** `parts/ErlassLeserKopf.tsx` und
`parts/GliederungSheet.tsx` (optionale Props, Vorgabe = Ist-Verhalten — Ä-(d)
bzw. Ä10/Ä19 sind ohne sie nicht baubar); `layout/InhaltsKopf.tsx` +
`layout/PaneKopf.tsx` (Testanker `data-ort-artikel` für den Ä1-Wächter — sie
SIND die Krumen-Quelle und damit von der Ä1-Whitelist gedeckt);
`src/tests/{ArtikelBody,leser-v3-bauteile}.test.tsx` und
`e2e/leser-v3-suche-sprung.e2e.ts` (§6.3-Nachzüge, je am Ort deklariert, keine
Assertion gelockert, zwei ausdrücklich verschärft).

**Zwei rote Tore, die NICHT von H2b kommen — Nullprobe am Basisstand
`022c3088e` gemacht (§0 Ziff. 3a):**

- `src/tests/allgemeineFrist.property.test.ts` («tageZwischen») läuft im vollen
  Vitest-Lauf in den 30-s-Timeout. **Am Basisstand identisch rot**, gleiche
  Meldung. Isoliert grün, braucht aber allein schon 19.9 s und 24.9 s reine
  Testzeit (2 Läufe) — also 66–83 % des Budgets, bevor irgendeine Parallel-Last
  dazukommt. Kein H2b-Anteil; die Datei und `lib/allgemeineFrist.ts` sind nicht
  angefasst (`git diff` = 0 Zeilen). **Offener §17-Punkt für den Orchestrator.**
- `e2e/px-textkoerper.e2e.ts` (Opt-in `PX=1`): beide Fälle rot mit **exakt
  17 918 px bzw. 38 082 px, Höhe 857 statt 856 px**. Dreimal gemessen — mit H2b,
  mit H2b **ohne** die Ä8-Kernänderung, und am Basisstand — **jedes Mal
  bytegleich dieselbe Zahl**. Der Featureanteil ist damit 0; die Baseline stammt
  aus dem Worktree `LexMetrik-h2` und ist gegen diesen hier um eine Pixelzeile
  verschoben. Baseline und Toleranz **nicht angefasst** (Kap. 7 PX erlaubt die
  Neusetzung nur in S2, deklariert). **Offener Punkt für den Orchestrator.**

**Tore grün:** `gate` (nur der Basis-Timeout oben) · `check:testtreue` ·
`check:e2e-shards` (94 Specs) · `build` · `check:perf-budget` · `leser-v3-*` +
`leser-kopf-*` im Projekt `chromium` **62/62** und im Flag-Projekt `leser-v3`
**44 passed / 1 skipped** · `a11y.e2e.ts` **47/47** (hell und dunkel).

### ✅ Vollzugsvermerk H3 (17.8.2026, Branch `feat/leser-v3-h3`)

**Gebaut.** Rechtsprechung und Kontext stehen an EINEM Ort mit drei Reitern
(`v3/LeserPanel.tsx` + `PanelEntscheide`/`PanelAenderungen`/`PanelMaterialien`),
der Lesekörper führt keine Entscheid-Zeilen mehr (Pos. 12), der Bezugs-Shard
wird erst beim Öffnen geholt (Kap. 7). Zähler in der Kopfzeile + Randlasche (F8).

| Zusage | Nachweis |
|---|---|
| **Erreichbarkeit jedes Entscheids** | Der Öffner ist artikelbezogen und führt in den Reiter «Entscheide», der die Kanten des gelesenen Artikels aus **derselben** Datenlogik zieht wie bisher der Artikelfuss (`useBezuege` → `waehleBezuege`, unverändert). `leser-v3-panel-zaehler` (a) prüft Öffnen → Zahl → Gruppen, (c) beide Panes, (e) den Fall ohne Leseposition. Was die `BezuegeZeile` je zeigte, zeigt das Panel — nur ohne Kappung auf fünf je Instanz (die war eine Folge der festen Zeilenhöhe, keine Aussage über die Daten) |
| **Nachladen-Zahl** | `check:perf-budget` misst die Shards: **BGG 298.7 KB · BV 122.3 KB · STPO 102.0 KB gzip**. VORHER gingen sie beim Seitenaufruf über die Leitung (idle, aber unbedingt), NACHHER **null Byte** bis zum ersten Öffnen. Gemessen als Verhalten, nicht behauptet: `leser-v3-prerender-bezuege` (b) zählt die Anfragen auf `/rechtsprechung/bezuege/` — **0 vor dem Öffnen** (2.5 s Wartezeit für den Idle-Lader), **genau 1 danach**, und **keine zweite** beim Wieder-Öffnen (`jeGeoeffnet`, nicht `offen`). Rot gesehen mit entferntem `bezuegeVorladen: false` |
| **SEO-Wächter — §7-BEFUND, ABWEICHEND** | Der Fahrplan verlangt «der Prerender behält die Bezüge serverseitig im HTML». **Nachgemessen: er trug nie welche.** `erlassVolltextHtml` (`src/lib/seo-detail.ts`) schreibt Kopf + Artikel-Volltext; weder sie noch `scripts/prerender.ts` nennen `bezuege` oder `norm-index`. Die Prämisse des Prüfpunkts ist falsch — es gibt nichts zu verlieren. Der Wächter sichert darum die REALE Fassung derselben Sorge: (a) das prerenderte HTML trägt Art. 429 samt Wortlaut und > 400 `<article>`, ohne jedes Hüllen-Attribut; (c) ohne JavaScript bleibt die Seite lesbar und holt keinen Shard; dazu eine **Quellensonde**, die den Prerender-Pfad von Bezugs-Schicht und V3-Hülle freihält (`leser-v3-fundament.test.ts`). `check:seo-index` grün |
| **F8-Regel (David 16.8.)** | «Rechtsprechung im Text» aus ⇒ Zähler UND Lasche weg: `leser-v3-panel-zaehler` (b), rot gesehen. Und die Kehrseite gemessen (d): mit ausgeschaltetem Schalter öffnet **`r`** das Panel weiterhin, Esc schliesst es. Die Regel hat **genau einen** wirksamen Ort (`LeserRahmenV3`, `panelZone`/`panelOeffner`) — der erste Rot-Versuch in `LeserPanelZone` blieb grün und hat das gezeigt |
| **DREI-Spalten-Grid — NICHT GEBAUT, gemessen begründet** | Der Route-Wrapper deckelt den Leser auf `max-w-content` = 70 rem: **gemessen 1072 px bei Viewport 1280/1440/1600/1920** (Lesespalte je 640 px). 18 rem Gliederung + 40 rem Lesemass + 22 rem Panel + zwei Abstände brauchen **1344 px** — es fehlen 272; selbst mit eingeklappter Gliederung bleiben 332 statt 352. Ein Grid-Zweig, den keine Breite erreicht, ist toter Code (§17), darum gestrichen (samt Dock-Schwelle und dem dritten `usePopoverAutoZu`-Modus). **Statt der Spalte: die Gestalt der Skizze als Überlagerung** — auf D ein rechts angeschlagenes Blatt von 22 rem (`panelForm(stufe, imPane)`), auf H ein Bottom-Sheet, im Pane immer Bottom-Sheet. Es nimmt dem Text keine Spalte, bricht ihn also nie neu um. **Entscheid nötig** (offene Punkte unten) |
| **`usePopoverAutoZu` geteilt** | EIN Hook für «Ansicht ▾» und Panel (`v3/usePopoverAutoZu.ts`, zwei deklarierte Modi mit Tabelle). Die drei lokalen Effekte in `LeserAnsichtV3` sind ersetzt, LM-009 wörtlich mitgezogen. Bewacht: keine andere V3-Datei registriert `pointerdown`/`wheel` selbst, und BEIDE Flächen rufen den Hook (Positiv- und Negativ-Sonde) |
| **Kern-Berührung** | **KEINE.** Die Frage des Auftrags ist beantwortet: der Prop-Vertrag genügt. `bezuege` einfach **nicht zu setzen** lässt `ArtikelLeser` die `LeitfallZeile` rendern, und die kehrt ohne `leitfaelle` mit `null` zurück — unter dem Artikel steht nichts. Kein neuer Slot, `src/lib/normtext/**` unberührt, Golden byte-gleich. Ein Zähler JE ARTIKEL ist bewusst **nicht** gebaut: seine Zahl käme erst nach dem Öffnen und dann an jedem Artikel gleichzeitig — ein Sprung über das ganze Dokument, den `leser-v3-kontext-cls` verbietet. Er gehört in die höhenfeste Beiwerk-Zone von **S2** |
| **Ä4 / Ä11** | **Ä11 (Icon-Flut) mitgelöst, soweit H3 sie verantwortet:** die neue Fläche vergrössert die Kopfzeile nicht — auf `mini` trägt sie keinen Zähler (`kopfElemente(stufe).panel`, Unit-Sonde), dort ist die Lasche der Öffner und liegt in der Daumenzone. **Ä4 (Beiwerk-Chips laufen über den Rand) nicht berührt:** die Chips leben in der Beiwerk-Zone am Artikel, die H3 gerade LEERT — die Position wandert damit vollständig zu S2, wo die Zone entsteht |
| **Sachgebiet-Platzhalter** | `v3/PanelSachgebiet.tsx` — fertiger Vertrag, fertige Optik, heute **kein Element** (leere Gebietsliste ⇒ `null`). Beidseitig geprüft: Unit-Sonde rendert ihn mit Daten und ohne, e2e (c)/(d) misst die Abwesenheit an Bund und Kanton. Rot gesehen ohne die `return null`-Zeile. Datenlogik bleibt `W2·7-VZUI-SACHGEBIET` |
| **Zitat-Export-Platz** | Benannter Anschluss `fuss` in `LeserPanel`, ungesetzt rendert er **kein Element** — reservierter Platz heisst ein Anschluss, keine leere Fläche. Nicht gebaut |
| **Erlass-Neutralität** | Bund (STPO/VMWG/LUGUE) und Kanton (BS-640.100) ohne Sonderpfad. Der Kantonserlass zeigt **keinen leeren Zähler** (`zaehlerAttribut`: keine Zahl bei 0 und bei «unbekannt») und **kein leeres Steuerelement**, sondern den ehrlichen Satz «Zu § 1 ist kein Entscheid der eingeschalteten Instanzen erfasst» — die Instanzen-Zeile nennt daneben 79 kantonale, die der Nutzer zuschalten kann. Drei Zustände, drei Sätze (Bedien-, Wissens-, Bestands-Zustand) |
| **W2·7-VZUI-Restzeilen** | Das `KontextPanel` ist in V3 **abgelöst, nicht gelöscht** — die Ist-Hülle und die Fehl-/Früh-Ansichten (`inhalt-ansichten`) nutzen es weiter, es fällt mit H5. Von den VZUI-Zeilen sind inhaltlich erledigt: «Kontext-Panel überladen» (Pos. 17, drei Reiter statt sechs bedingter Sektionen) und «Facetten am Ort ihres Ergebnisses». **Offen bleiben:** «Passende Werkzeuge» und die Behörden-Ressourcen (`kontextSoftLaw`) — sie sind kein Material zur Entstehung und gehören nicht in den Reiter «Materialien»; sowie der Wegweiser zum aktiv gelesenen Artikel (S7), den V3 anders löst (der Panel-Kopf nennt den Artikel). Die ROADMAP-Zeile ist nach H5 zu formulieren, nicht jetzt: sie darf nicht mit einer Komponente weiterleben, die es dann nicht mehr gibt |

**Rot-Beweise (§6.7 — jede Spec einmal rot GESEHEN, mit Ausgabe):**

| Spec | Sabotage | Ausgabe |
|---|---|---|
| `leser-v3-panel-zaehler` (b) | F8-Torwächter im Rahmen entfernt | `locator('[data-v3-panel-zaehler]') Expected 0, Received 1` |
| `leser-v3-panel-facetten` (c)+(d) | `return null` in `PanelSachgebiet` gestrichen | `locator('[data-v3-panel-sachgebiet]') Expected 0, Received 1` (beide Erlasse) |
| `leser-v3-kontext-cls` (a) | Andock-Schwelle 1344 → 1024 (am Zwischenstand mit Spalte) | `Artikel senkrecht verschoben: 883,1162,1514,1961,2241 → 1064,1402,1890,2624,2991` |
| `leser-v3-prerender-bezuege` (b) | `bezuegeVorladen: false` entfernt | `Bezugs-Shard schon beim Seitenaufruf geladen: …/bezuege/STPO.json` |

**Vier Fehler, die die Sonden beim ERSTEN Lauf gefunden haben** (alle behoben,
alle mit eigener Sonde):
1. `data-v3-panel-anzahl="0"` am Öffner, während das Label «Rechtsprechung» zeigte
   — zwei Aussagen an einem Knopf (§8). Neu `zaehlerAttribut`, mit Deckungs-Sonde
   über den ganzen Wertebereich.
2. Die Randlasche war im Split-Pane **sichtbar, aber nicht klickbar**: die
   Overlay-Schicht des Panes steht auf `pointer-events: none`, die Rücknahme
   fehlte («subtree intercepts pointer events»).
3. **@390 ohne Leseposition** stand «kein Entscheid der eingeschalteten Instanzen
   erfasst» — an einem Erlass mit 1443 Verknüpfungen. Der Scroll-Spy hat auf dem
   Handy-Zuschnitt beim Ankommen noch keine Position gesetzt. Neu gilt der ERSTE
   Artikel, und der Panel-Kopf benennt ihn (`panelBezug`, fünf Unit-Fälle).
4. Die **Fundament-Sonde** hat `panelForm(stufe, imPane)` in `kopfStufen.ts`
   zurückgewiesen — `imPane` darf nur in den Wurzel-Dateien stehen, und die Sonde
   sieht keinen Unterschied zwischen «liest den Hüllen-Zustand» und «bekommt ihn
   als Prop». Zu Recht: der Parameter hiess nach der Umgebung statt nach der
   Sache. Er heisst jetzt `vollflaechig` (Eigenschaft der LESEFLÄCHE), die eine
   Übersetzung `!umgebung.imPane` steht im Rahmen. Die Sonde blieb dabei streng —
   sie wurde nicht aufgeweicht.

**Bilder:** `docs/ux-audit-2026-07/reader/leser-v3-h3/` — **66 Bilder**: vier
Erlasse (STPO mit Bezügen · VMWG Verordnung · LugÜ Staatsvertrag · BS-640.100
Kanton) × D/H × hell/dunkel × geschlossen + drei Reiter, dazu Split-View
geschlossen und offen.

**Tore (nackt gefahren, Exit-Code 0):** `gate` · `check:testtreue` ·
`check:e2e-shards` (98 Specs) · `build` · `check:perf-budget` ·
`check:seo-index` · `leser-v3-*` + `leser-kopf-*` im Projekt `chromium`
**77/77** und im Flag-Projekt `leser-v3` **59 passed / 1 skipped** · axe auf der
GEÖFFNETEN Panel-Fläche in beiden Gestalten grün (neuer Fall (e) — die bestehende
a11y-Stichprobe läuft nur im Projekt `chromium` und öffnet das Panel nicht).

**Offen aus H3 (nicht stillschweigend erledigt):**

| Punkt | Grund / was zu entscheiden ist |
|---|---|
| **RANDLASCHE GESTRICHEN — §7-Abweichung, wartet auf David** (Nachzug 17.8.) | F8 lautete «V1, a, Lasche behalten». Am gebauten Stand hält die Prämisse an keiner Breite: die Lasche lag 16 px (@390) bzw. 4 px (@1024) IM Normtext, und bei 1024 px bleiben zwischen Lesespalte und Leser-Rand nur 8 px — eine 36-px-Schiene passt unterhalb ~1200 px nirgends. Wo sie passte (@1440), war sie das wortgleiche Doppel des Kopf-Zählers (Kopfzeile 5 Elemente statt ≤ 4). Umgesetzt ist darum: Kopf-Zähler auf `voll`/`kompakt`, Menü-Eintrag «Entscheide & Kontext …» überall, `r` überall. **Was David entscheidet:** (a) so lassen; (b) Lasche zurück und dafür den Kopf-Chip opfern (dann bleibt die Überlappung @390/@1024); (c) Lasche zurück, sobald der Leser-Seitenrahmen breiter wird (H4-Spalten-Entscheid darunter) — dann passt sie ohne Überlappung. **Empfehlung: (a) jetzt, (c) mit H4** |
| **Angedockte Panel-SPALTE braucht eine Entscheidung** | Drei Wege, alle ausserhalb des H3-Auftrags: (1) **weiterer Seitenrahmen für den Leser** (`max-w-content` 70 rem → ~84 rem nur auf der Leser-Route) — Design-Autorität; (2) **schmalerer Satzspiegel** im offenen Zustand — berührt das Lesemass und damit S2/§1; (3) **gegenseitiges Einklappen** von Gliederung und Panel (dann passt es mit 20 rem statt 22) — Bedien-Entscheid, weil eine Geste eine zweite Fläche zuklappt. Gehört zur EINEN Breiten-Quelle von **H4** (`useElementBreite` mit `d`/`s`/`sheet`); die Zusagen der Spalte sind in `leser-v3-kontext-cls` schon gemessen und werden am Tag des Baus rot, wenn sie brechen |
| **Kein leichtes Zähl-Sidecar ⇒ der Zähler ist vor dem ersten Öffnen zahllos** | «Zähler am Öffner mit Trefferzahl» ist nur nach dem ersten Öffnen erfüllt: die Zahl steckt im schweren Shard (`gesamtProArtikel`), und den holt H3 bewusst nicht mehr im Voraus. Eine 0 zu zeigen wäre eine Behauptung aus Unwissen (§8), darum steht dort «⚖ Rechtsprechung». **Wurzel-Fix als eigener Schritt:** ein Zähl-Sidecar `rechtsprechung/bezuege-zahlen/<ERLASS>.json` (Artikel-Token → Kanten je Status, ~2 % der Shard-Grösse) aus `scripts/normtext/bezuege-bauen.ts`. Das ist ein **Daten-/Risikopfad** mit Gegenprüfung, nicht Teil einer UI-Etappe |
| **`leser-kopf-cls-s3` (v3 @390) hat keine Reserve** | Nullprobe mit/ohne Panel-Öffner, 6 Messungen: **mit** 0.0192 / 0.0051 / 0.0480 · **ohne** 0.0039 / 0.0492 / 0.0192 — kein Ordnungsunterschied, das Panel ist NICHT die Quelle. Die Schwelle 0.05 liegt am oberen Rand einer Verteilung von 0.004–0.049 (Messbedingung: warm, workers=1, eigener Kontext je Fall); unter 5 Workern gemessen 0.0509 ⇒ rot. **Wurzel-Fix, nicht Lockerung:** die Spec soll wie `leser-v3-kontext-cls` nach `sources` filtern und nur Shifts IM Lesekörper zählen — S3 hat den Befund («die Shift-Quellen liegen im Seiten-Chrom») schon notiert, aber nicht in die Messung übernommen. Eigener, deklarierter Schritt (fachliche Änderung an einem Tor, §6.3) |
| **`leser-kopf-a9` (Ist-Hülle) reisst das 5000-ms-Budget knapp** | Gemessen 5059 / 5250 ms unter 3–5 Workern, isoliert (workers=1, 4× CPU-Drossel) **1 von 5 rot mit 5132 ms** — der KALTE Erstlauf. Läuft auf `/gesetze/bund/BV` **ohne** V3-Flag, H3 ist also nicht beteiligt. Nicht gelockert (Auftrag); Messbedingung und Rate hier festgehalten. §17-Position: Budget mit Reserve neu bemessen ODER die Drossel-Messung aus dem parallelen Shard nehmen |
| **`leser-v3-seitenleiste-ordnung` (b)/(c) auf OR unter Last** | 2 von 2 rot bei 5 Workern («`[data-leser-v3="rahmen"]` nicht sichtbar in 20 s»), **8 von 8 grün** isoliert und **77/77 grün** bei 3 Workern. Das ist die in `shard-gruppen.json` dokumentierte OR-Signatur (zweiter schwerer OR-Reader je Chromium-Worker), keine H3-Fläche. In der CI liegen die Specs in verschiedenen Shard-Gruppen; die vier neuen sind bewusst auf die Gruppen 3/4/5/6 verteilt |
| **Sheet-Anatomie zweimal** | Das Panel-Blatt teilt die MECHANIK mit dem Gliederungs-Blatt (`useDialogFokus`, Portal in die Pane-Overlay-Schicht, `data-v3-pane`, z-40/50, `overscroll-contain`), aber nicht die Komponente: `GliederungSheet` liegt in `parts/` und ist unter FL-4 eingefroren, sein Inhalt («Sie sind hier», Quickjump) passt nicht. Eine geteilte `SheetHuelle` ist ein sinnvoller Schnitt für **H5**, wenn `parts/` ohnehin aufgeht |
| **`panelOeffner`/`panelSlot` sind gestrichen** | H1 hatte sie als `ReactNode`-Slots vorgesehen. Von aussen nicht füllbar: Zähler und Panel brauchen `useLeserV3Modell`, das erst IM Rahmen läuft — ein äusserer Aufrufer hätte die eine Naht ein zweites Mal ziehen müssen (§5). Gestrichen statt bewacht (Präzedenz `LeserV3Kontext.ts`); `beiwerkSlot`/`fassungsWahl`/`leisteExtra` bleiben unverändert. **Lehre für kommende Slot-Vorplanung:** ein Erweiterungspunkt trägt nur, wenn der Füller an dieselben Daten kommt wie der Rahmen |
| **Ä59** (im Vollzug als «Ä25 (neu)» geführt — Nummer war vergeben, s. Nachzug unten) | Der Erlass-Titel steht auf D teilweise UNTER dem rechts angeschlagenen Blatt (Bildbogen `stpo-d-hell-entscheide`). Bei einer Überlagerung unvermeidlich; sichtbar wird es nur, weil der Titel bis an den rechten Rand läuft. Mit der Spalten-Entscheidung oben zusammen zu lösen, nicht davor. **Vom Nachzug NICHT behoben:** das Blatt beginnt jetzt unter dem Kopf (Ä52), der Erlass-Titel liegt aber darunter im Fluss |

**Vereinigung mit dem H2b-Nachzug (17.8.2026).** H3 war auf dem H2b-Stand
`37159526f` gebaut; der Nachzug (`37159526f..9555f96e8`) fasste danach dieselben
Stellen an. Rebase auf den Nachzug, zwei Konfliktstellen in `LeserRahmenV3.tsx`,
beide Beiträge behalten: (1) Import-Block vereinigt — `SUCH_H_AKTIV`/`SUCH_H_RUHE`
und `bestimmungsWort()` (B8/B9) bleiben, `kopfElemente`/`panelForm` kommen dazu,
`ReiterAktion`/`overlineGebiet`/`titelKennung` entfallen, weil sie mit dem
Erlass-Kopf nach `LeserErlassKopfZone.tsx` gewandert sind. (2) Gliederungs-Blatt —
**die H3-Auslagerung `LeserLeisteSheet.tsx` gewinnt und erledigt damit die
B10-Auflage des Nachzugs**, trägt aber die Nachzug-Semantik: dasselbe Suchfeld
zuoberst im Blatt (A2/Ä18), «Sie sind hier» nur zum Baum (Ä32), Esc schliesst das
Blatt — als drei durchgereichte Props, der Rahmen entscheidet weiter das WAS, das
Bauteil nur das WIE des Portals. Zwei Regressionen der Vereinigung hat die
Fundament-Sonde gefangen (rot gesehen, dann behoben): das Zähl-Substantiv in
`LeserErlassKopfZone` stand als Literal-Union statt als Typ `BestimmungsWort`
(B8), und der Rahmen lag mit 419 Zeilen gleichauf mit `leserV3Modell.ts` und wurde
zur grössten Datei in `v3/` — Konflikt-Kommentare gestrafft, jetzt 412. Zusätzlich
war `e2e/shard-gruppen.json` nicht neu erzeugt (100 Specs gegen 96 in der
Projektion, `check:e2e-shards` rot); die Annotationen 3/4/5/6 der vier H3-Specs
standen, nur die Projektion fehlte. Keine Spec nachgezogen, keine Funktion
aufgegeben.

**Deckel-Stand:** H3 ist der dritte der höchstens fünf H-PRs (H1 · H2/H2b · H3);
zwei bleiben für H4 und Nachbesserungen.

#### Nachzug nach drei Prüfern (17.8.2026) — Note Ästhetik **6/10**, Architektur 8,5

**Nummernkreis.** Der Ästhetik-Bericht zu H3 vergab Ä45–Ä51 — Ä45/Ä46 waren vom
H2b-Nachzug schon als H4-Vormerkung belegt (Doppelkrume · zwei ✕ je Pane). Belegte
Nummern werden nicht neu belegt (dieselbe Regel wie für die §-Nummern, CLAUDE.md);
dieser Nachzug führt darum **Ä52–Ä58**, das frühere «Ä25 (neu)» wird **Ä59**.

| Befund | Was geschah · Beleg |
|---|---|
| **A1** ewiges «Entscheide werden geladen …» | «geladen» war aus `klassenImErlass` abgeleitet; ein 404 ergibt dort `{}` — nicht unterscheidbar von «noch nichts da». Gemessen: **311** Bezugs-Shards, **kein einziger für ZH** ⇒ ZH-211.11 zeigte nach 8 s nur den Ladesatz, an **1149 von 1459** Erlassen (79 %). Fix: Lade-Ende-Signal `useBezuege().geladen` (auch bei 404 `true`); `shardGeladen` **gestrichen statt bewacht** — die Funktion KONNTE die Lage nicht ausdrücken (§17). Spec `leser-v3-panel-nachzug` (a) + `panel-facetten` (d) jetzt über BEIDE Kantons-Erlasse |
| **A2** F8-Kehrseite unerreichbar | @390 mit «Rechtsprechung im Text: aus» blieb nur die Taste `r` — ohne Hardware-Tastatur war die Fläche weg. Neu: Öffner «Entscheide & Kontext …» im «Ansicht ▾»/«···»-Menü, auf JEDEM Zuschnitt und in JEDEM Pane. Und `r` ist pane-bewusst: die Regel liegt geteilt in `panePrioritaet.ts` (zweiter Verbraucher neben ⌘K), die Leser-Tastatur läuft jetzt in BEIDEN Panes und beansprucht den Tastendruck nur am Fokus. Specs (b) + `leser-v3-kuerzel` A2 |
| **A3** Öffner im offenen Zustand | `aria-controls` war am Kopf-Zähler gemessen **null** (@1024/@1440): der Rahmen reichte die Id nie durch. Neu entsteht `panelId` im Rahmen, beide Seiten teilen sie; der Klick ist ein bewusster Umschalter (auf D ohne Scrim). Spec (c) |
| **Ä52** Blatt deckte den Kopf | Gemessen: Blatt-Oberkante y **100**, V3-Kopf y **100–159** — das Blatt lag über Öffner, «Ansicht ▾» und ✕. Neu beginnt es an `--nt-stick` (EINE Geometrie-Quelle, LM-003). Zweiter Teil: `panelForm('rechts')` verspricht «Beiwerk», gebaut war Scrim + `aria-modal` + Fokusfalle ⇒ auf D **nicht mehr modal** (`usePopoverAutoZu` Modus `beiwerk` — der gestrichene dritte Modus kehrt zurück, jetzt MIT Aufrufer). Spec (d) prüft jeden Kopf-Griff ohne Toleranz und den Klick in den Lesetext |
| **Ä53/Ä56** Randlasche | Gemessen im Normtext: **16 px @390**, **4 px @1024**; bei 1024 lässt die Lesespalte nur **8 px** Rand — eine 36-px-Schiene passt unterhalb ~1200 px nirgends. @1440 war sie das wortgleiche Doppel des Kopf-Zählers (Kopfzeile bei 5 Elementen). **Gestrichen**; Öffner-Ordnung neu: `voll`/`kompakt` Kopf-Zähler · `mini` Menü-Eintrag · überall Menü + `r`. **§7-ABWEICHUNG von Davids F8 «Lasche behalten» — wartet auf David** (offene Punkte). Spec (f) |
| **Ä54** «Filterzeile» war ein Block | Gemessen **348 px** hoch, erste Gruppe 352 px unter dem Panel-Kopf (drei Erklär-Absätze, Histogramm, zwei Datumsfelder). Neu `v3/PanelFilterZeile.tsx`: EINE Zeile, zwei Klappen, die ihren Stand NENNEN; die geteilten Bausteine `BezugFacettenWahl`/`BezugZeitWahl` sind **unangetastet** (V1 nutzt sie), die Datenlogik unverändert. Spec (g), Deckel 64 px |
| **Ä55** «Bottom-Sheet» hing oben | Gemessen @390: y 100, Höhe **744 von 844 px** — Vollbild. Neu unten angeschlagen mit 55-%-Deckel, Artikel bleibt darüber sichtbar und wird nicht verschoben. Spec (e). Eine GETEILTE `SheetHuelle` bleibt H5-Auflage (`GliederungSheet` liegt in `parts/`, FL-4) |
| **C1** «Artikel» hart im Code | Drei Stellen; an BS-640.100 (§-Erlass) dreimal falsch. `bestimmungDativ()` in `erlassAnsicht.ts`, durchgereicht bis Panel-Kopf und Tooltip. Die **Fundament-Sonde war einseitig** (nur «Paragraphen» verboten) — jetzt auch `\bArtikel\b`, rot gesehen |
| **C2 · C3 · C4 · C5** | «Sammelerlass anderer SR» → ohne Bund-Annahme · tote Enden weg (`className?`, `bezuegeFuer` aus der Modell-Oberfläche — durchgehend `undefined` und eine Falle) · `beiwerkSlot`/`fassungsWahl`/`leisteExtra` **gestrichen** (kein Aufrufer über drei Etappen; S2 baut die Beiwerk-Zone im Kern) · `leserGeometrie.ts` (CSS-Variablen als reine Funktion) + `LeserGliederungSchiene.tsx`; Rahmen **412 → 398**, Modell 419 → 417. Die 13 doppelten Schienen-Utilities sind durch **Löschen der zweiten Kopie** erledigt, die Werte stehen als `.lc-leiste-schiene` bei der `lc-leiste-*`-Familie |
| **C6** H5-Löschliste korrigiert | `BezugFacettenWahl.tsx` ist ein GETEILTER Baustein (`src/components/verzahnung/`) und gehört **nicht** auf die Löschliste. Löschbar ist `components/kontext/KontextPanel.tsx` — H5 muss dann die Kante **`v3/leserV3Modell` → `../inhalt-ansichten` → `KontextPanel`** mitschneiden (`FruehAnsicht`/`LadeAnzeige` kommen von dort). W2·7-VZUI: erledigt sind «Kontext-Panel überladen» und «Facetten am Ort ihres Ergebnisses»; offen bleiben «Passende Werkzeuge»/`kontextSoftLaw` und S7 |
| **Ä60** (neu, beim Bildbogen gefunden — H4) | Das Beiwerk-Blatt auf D verdeckt die äusseren **112 px jeder Textzeile** (gemessen @1440: Spalte x 580…1200, Blatt x 1088…1440 = 18 % der Spaltenbreite) — die Zeilenenden fehlen, der Text ist sichtbar aber nicht lesbar. Keine feste Blattbreite behebt das: der Rand rechts der Spalte misst @1440 240 px, @1280 nur 160. Dieselbe Arithmetik wie bei der gestrichenen Spalte ⇒ gehört zum **Spalten-Entscheid** unten. Der Kommentar an `panelForm` behauptet die Lesbarkeit nicht mehr, sondern nennt den Messwert (§8) |
| **Ä57/Ä58** (nur eingetragen, H4) | Ä57: der Panel-Kopf nennt «… · Art. 429» über erlassweiten Reitern, und «noch nicht im Text» steht ohne Warnzeichen. Ä58: gerahmte Chips gegen ungerahmtes ☰ — die Rahmen-Regel des Chromes ist nicht einheitlich |
| **D1** Änderungsvermerke-Schalter in V3 | ✅ **ERLEDIGT NACH REBASE** (17.8.2026, `--onto origin/main`). Bis zum Rebase war es begründet NICHT umgesetzt: die eine Quelle (`bieteAenderungsvermerkeSchalter`/`zaehleAenderungsvermerke` in `pages/gesetz-leser/berechnungen.ts`) lag auf `main` (S1, #547) und nicht in der Branch-Basis (H2b) — ein Nachbau in `v3/` wäre die zweite Wahrheit gewesen, die §5 verbietet. **Gebaut wie aufgelegt:** `leserV3Modell.ts` bildet `hatAenderungsvermerke` mit **derselben** Funktion, die `inhalt.tsx` (V1) zieht, und reicht es als EINE Prop über `LeserRahmenV3` → `LeserKopf` an `LeserAnsichtV3`; dort steht die Bedingung, kein zweiter Ableitungsweg. Mitgenommen (§8, gleiche Sorge): der Tooltip des «Ansicht ▾»-Öffners nennt «Änderungsvermerke» nur, wenn es den Schalter gibt. Zeilen-Grenze `v3/` (420, `leser-v3-fundament`) gehalten, indem im Adapter **Prosa** gekürzt wurde, nicht Sachverhalt — der Adapter bleibt der grösste Baustein. Spec `leser-v3-umschalten` **(a3)**: STPO 3 Schalter, BS-640.100 und ZH-211.11 je 2 ohne «Änderungsvermerke»; ROT gesehen auf frisch gebautem Bundle (Bedingung entfernt ⇒ «Expected 0, Received 1») |

**Bilder:** `docs/ux-audit-2026-07/reader/leser-v3-h3/nachzug/`.

---

### ✅ Vollzugsvermerk H2b-NACHZUG (17.8.2026, Branch `feat/leser-v3-h2b`)

Drei unabhängige Prüfer (Bug-Check · Ästhetik **6,5/10** · Architektur 8/10 «ja
mit Nachzug») haben H2b geprüft. **Nummernkreis:** die S1-Prüfung vom 17.8. hat
Ä25–Ä27 parallel anders belegt (Verweis-Unterstreichung · Historie-Slot-Phantom ·
Fussnoten-Abhängigkeit); dieser Nachzug vergibt darum **Ä35–Ä44**.

| Nr. | Befund (gemessen 17.8.2026) | Vollzug |
|---|---|---|
| **Ä35** | @390 bei offenem Treffer-Blatt fokussierte ⌘K das VERDECKTE Kopf-Feld (`sheet.contains(activeElement) === false`), Tippen landete unsichtbar, Esc leerte das Feld statt das Blatt zu schliessen — und im Blatt war überhaupt kein Feld erreichbar (`felderImBlatt: 0`) | ✅ Das Blatt trägt das Feld, solange es offen ist — DASSELBE Bauteil, nicht ein zweites (die Such-Zone gibt es solange her, `count === 1` bleibt). `escLeert={!blattOffen}`: im Dialog gehört Esc dem Dialog (WCAG 2.1.2), der Begriff bleibt stehen. `leser-v3-blatt` (a)(b) |
| **Ä36** | `zeigeVolltitel` prüfte `startsWith`: `kanton/BS-BeE 610.100` zeigte nur «Finanzreglement», obwohl `BS-154.125` dasselbe Kürzel trägt; `ASYLG` verlor «Asylgesetz», `BS-121.100` «Bürgerrechtsgesetz» | ✅ WORTGLEICHHEIT statt Präfix, gemessen an der ANGEZEIGTEN Zeichenkette. Korpus-Wirkung 784 → **775** unterdrückte Volltitel. Kein `title` als Ersatz für sichtbare Auskunft; der widersprüchliche Kommentar in `LeserKopf.tsx` ist bereinigt |
| **Ä37** | ⌘K traf im Split IMMER dasselbe Pane: seit Ä19 hängen zwei Listener am Fenster, der zuletzt registrierte gewann (Fokus primär ⇒ Sprung ins sekundäre Feld, und umgekehrt genauso) | ✅ Das Kürzel bedient das Pane, in dem `document.activeElement` steht (Fallback primär); die Wache steht VOR `preventDefault`, sonst schwiege zusätzlich die Header-Suche. `leser-v3-blatt` (c) |
| **Ä38** | Ä25-Regression: das Kürzel «LugÜ» wurde zu «Lu…» (`scrollWidth` 29 in `clientWidth` 23) — Ä21 gab ihm `truncate`, und zwei `truncate`-Geschwister teilen den Mangel | ✅ `shrink-0`, sobald ein Volltitel daneben steht; nur ohne ihn darf gekürzt werden (dann IST das Kürzel der Name). `leser-v3-kopf-buendig` (d), LugÜ · StPO · ZH-211.11 @1440/@390 |
| **Ä39** | Ä10/Ä26: das Anhang-Etikett «Protokoll 1 über bestimmte Zuständigkeits-…» (80 Zeichen) trug `shrink-0` und riss den Leisten-Scroller auf **699 px in 280 px** (Blatt @390: 699/366), der Fundstellen-Zähler lag aus dem Bild | ✅ Etikett `min-w-0 truncate` (Wortlaut im `title`), Zähler behält `shrink-0`. `leser-v3-nachzug-auskunft` (d) misst LugÜ/«Gericht» auf `scrollWidth <= clientWidth` UND den Zähler innerhalb der Leiste |
| **Ä40** | Ä5/Ä27: `details > summary::after {content:'  ▸'}` hängte an JEDE Übersichtszeile ein zweites Glyph ans Ende (`::after` = `"  ▸"` PLUS Textknoten «▸») — das hängende Zeichen war umgezogen, nicht weg. Ä28: die Warnung «nicht konsolidiert» stand in der aufgeklappten Box ZWEIMAL, in zwei Wortlauten | ✅ Die App-weite Regel bleibt, für diese eine Box gestrichen (`content: none`) — mit Positiv-Sonde, dass sie an fremden `<details>` weiterlebt. Die Warnung steht einmal: die ausführlichere der Box; zugleich trägt sie jetzt die `aufgehoben`-Grenze, die Erlass-Kopf und -Übersicht beide ziehen (§8) |
| **Ä41** | Ä29 Kontext-Ausschnitte begannen mitten im Wort («… on erhebt») · Ä30 der Zähler brach zwischen Zahl und Einheit («15 Paragraphen» / «· 62 Fundstellen») · Ä31 Fokus: outline 2 px brass + Rahmen brass + offset 1 px = zwei Ringe | ✅ Schnitt an der Wortgrenze, nur nach innen und mit hartem Schnitt als Rückfall (`leserSuche`, unit-geprüft, **KERN-BERÜHRUNG** — wirkt in beiden Hüllen wie Ä8) · Segmente `whitespace-nowrap`, «·» ist die einzige Bruchstelle · Rahmen im Fokus neutral, `outline-offset: 0` |
| **Ä42** | Architektur 1/2/3: das Literal `'Paragraphen'` an fünf Stellen in `v3/`, die Ableitung doppelt, die Singular-Regel dreifach; die zwei Höhen der Such-Zone als rem-Literale im Rahmen statt bei ihrem Markup | ✅ `BestimmungsWort` + `bestimmungsWort(key)` + `zaehlform()` in `erlassAnsicht.ts`, drei neue Fundament-Sonden («kein Paragraphen-Literal in `v3/` ausser dort»). Höhen als `SUCH_H_RUHE`/`SUCH_H_AKTIV` in `SuchZone.tsx`, vom Rahmen importiert |
| **Ä43** | Ä32: im TREFFER-Blatt standen «Sie sind hier — Noch keine Leseposition erfasst.» und die Erlass-Übersicht, «⌄ alles auf ↑ Anfang» hing etikettlos rechts; der ✕ hiess dort «Gliederung schliessen» | ✅ Im Treffer-Blatt: keine Ortsangabe, keine Ankunfts-Übersicht, kein «alles auf/zu» (es klappt einen Baum, der gar nicht steht) — «↑ Anfang» bleibt, es meint den Erlass. Dialog UND ✕ heissen, was das Blatt zeigt. `leser-v3-blatt` (d)(e) |
| **Ä44** | B1: `titelKennung` mass `erlass.titel.length`, gedruckt wird `titelOhneSuffix` — **42 von 1469** Erlassen bekamen die vorangestellte Kennung, obwohl ihr angezeigter Titel unter der Schwelle liegt (MSchG: roh 87, angezeigt 60) | ✅ Die Regex lebt einmal in `helpers.titelOhneKlammerSuffix` und speist Kopf, Längen- und Gleichheitsprüfung. Kennungen 268 → **226**; LugÜ (angezeigt 155) behält sie |
| **Ä45b (CI-Fund, PR #548)** — in PR #548 als «Ä45» eingetragen; die Nummer war beim Merge von H3 (17.8.2026) doppelt belegt, weil **Ä45/Ä46** hier schon die H4-Vormerkungen Doppelkrume · zwei ✕ tragen (s. «Für H4 vorgemerkt» am Ende dieses Vermerks) und H3 darauf aufbaut. Belegte Nummern werden nicht neu belegt (dieselbe Regel wie für die §-Nummern, CLAUDE.md), darum trägt der CI-Fund als NACHTRAG zu Ä44 das Suffix **b**; der H3-Nachzug führt unverändert **Ä52–Ä59** | `e2e/leser-history-hash.e2e.ts` (LM-201) klickte den Startseiten-Link direkt über `nav[aria-label="Hauptnavigation"]` — Ä1c lässt die App-Seitenleiste im Leser eingeklappt starten, die Sidebar (und damit dieser Link) ist dann gar nicht im DOM; Desktop hat auch kein Topbar-Logo (`Topbar.tsx` bewusst `lg:hidden` ab `lg`). Spec lief in `test.timeout` (270 s Shard-Override) | ✅ Kein Produktfehler: der Topbar-Knopf «Seitenleiste einblenden» ist im Leser immer sichtbar und öffnet die Sidebar, danach ist der Link da — realer, dauerhaft vorhandener Nutzerweg. Spec klickt jetzt zuerst den Knopf, dann den Link (§6.3, deklarierte Anpassung an den Ä1c-Stand, Sache LM-201 unverändert streng) |

**A1 · die Ä1c-Vorgabe war für Bestandsnutzer wirkungslos** (Bug-Check, VOR
MERGE): der Stand vor H2b schrieb `lexmetrik-seitenleiste-eingeklappt='0'` bei
JEDEM Mount ohne Nutzerhandlung; H2b las das als Wahl. Gemessen @1440 mit
vorbelegtem `'0'`: App-Leiste **256 px offen** (fabrikneu 0 px). Fix: Schlüssel
versioniert (`…-eingeklappt.v2`). Aus dem Alt-Schlüssel wird **nur `'1'`**
übernommen — das konnte nur eine Wahl sein, denn eingeklappt war nie die
Vorgabe; `'0'` ist vom Mount-Schrieb nicht zu unterscheiden und zählt nicht.
Der Alt-Schlüssel wird nicht geschrieben und nicht gelöscht (eine Migration im
Mount wäre genau der gerügte Fehler). Tri-State unit-geprüft, e2e auf drei
Lagen: Alt-`'0'` im Leser eingeklappt · Alt-`'1'` bleibt Wahl · ausserhalb des
Lesers offen und **kein** Speicherschreiben.

**§17-Rückbau, im Nachzug gefunden:** der `onKuerzel`-Zweig des Rahmens («erst
die Fläche öffnen, dann fokussieren», B1-Nachzug aus H1) war seit Ä19/A2
**unerreichbar** — das Feld ist in jeder Lage im DOM, und
`leser-v3-suche-sprung` (e) verlangt ausdrücklich, dass ⌘K die Spalte NICHT
aufzieht. Zwei Tore forderten Gegensätzliches; der Zweig ist gestrichen, die
Sonde in `leser-v3-kuerzel` bewacht jetzt den Rückbau (§6.3-Nachzug am Ort
deklariert). Der Rahmen sinkt dadurch von 415 auf **411** Zeilen und bleibt
unter dem Adapter (416) — die Datei-Sonde bleibt grün, ohne dass die Zahl weicht.

**Rot-Beweis (§6.7) — 30 Sabotagen, alle einmal rot gesehen** (Lauf 17.8.2026,
je im Spec-/Test-Kopf notiert, wie): A1 unit + e2e · B1 · B2 · B8 (Regel und
Sonde) · Ä29 · B9 (Sonde, e2e zu hoch, e2e zu tief) · A3 (Sonde und e2e) · B3
beide Richtungen · A4 · A5 · Ä27 · Ä28 · Ä30 · Ä31 · A2 (Feld, Esc, Feldzahl) ·
Ä32 (Ort, Übersicht, alles-auf) · B11 · Ä18-Reihenfolge · Ä30 gegen Ä15 ·
Esc-Spec (d) · Ä30 nach der Nachbesserung.
**ZWEI ZUSICHERUNGEN WAREN BLIND und sind ersetzt** — das ist der wichtigste
Einzelbefund dieses Nachzugs, weil er die Methode betrifft, nicht ein Feature:
(1) die untere Schranke von Ä1 liess sich über `marginTop` nicht reissen (die
Wrapper-Polsterung schluckt den Wert, `top` klemmt ihn ab); tragfähig ist
`top: '0rem'` ⇒ **−101 px** nach 1200 px Scroll. (2) Die B9-Höhenprüfung
verglich die gemessene Höhe mit der Variable, die sie selbst setzt — eine
Tautologie. Sie misst jetzt die NATÜRLICHE Höhe (`height: auto`): Ruhe 40 gegen
ausgelegt 44 px, mit Suche 64 gegen 68; erlaubt sind höchstens 4 px Reserve.

**Zwei EIGENE Regressionen, in der Batterie gefangen und behoben** (kein
fremder Befund — der Nachzug hat sie erzeugt, das Tor hat sie gemeldet):
1. **Ä30 gegen Ä15.** Die Segmente `whitespace-nowrap` zu geben nahm der Zeile
   ihre LETZTE Bruchstelle: JSX verschluckt Zeilenumbrüche zwischen Elementen,
   und `mx-1` am Trenner ist kein Textknoten. Gemessen StPO/«Kosten» @1440:
   176 px in 148 px, Höhe 20 px — EINE Zeile mit Überlauf, also genau die Ellipse,
   die Ä15 beseitigt hatte (`leser-v3-auskunft` Ä15+Ä17 rot). Fix: echte
   Leerzeichen (`{' '}`) statt `mx-1`, und der Trenner klebt am ERSTEN Segment,
   damit er nicht als einzelnes Zeichen an den Anfang der zweiten Zeile rutscht
   (das wäre das hängende Zeichen aus Ä5). Beide Richtungen rot gesehen.
2. **`leser-v3-esc-ohne-sprung` (d) forderte das Gegenteil von A2** und war
   zugleich falsch benannt: der Fall hiess «Esc im Sheet-Feld», traf über
   `[data-v3-suchsprung] input` aber seit Ä19 das Feld im KOPF-Block — das Blatt
   hatte gar keines. Der Test war grün, während die Bedienung im offenen Blatt
   unerreichbar war. Umgedreht und geschärft (§6.3-Nachzug am Ort deklariert):
   Esc schliesst den Dialog, der Begriff bleibt, und der Scroll-Offset bleibt
   stehen — der Kern von Pos. 14 ist damit STÄRKER geprüft als vorher.

**Messbedingung der Tore (§0 Ziff. 3c).** Gemessen auf einer Maschine, auf der
zwei Schwester-Worktrees (`LexMetrik-h3`, `LexMetrik-s1`) parallel bauen und
testen — Load Average 28–40. `npm run gate` meldete im ersten Lauf SIEBEN
Timeout-Dateien (Fristen · Prozesskosten · Strassen · Materialien · Suche ·
Ranking), im zweiten nur noch `allgemeineFrist.property`. Nullprobe: der Diff
gegen `19a989f9` berührt `src/lib/**`, `src/data/**`, `scripts/**` und diese
sieben Testdateien mit **0 Zeilen**; isoliert laufen alle sieben grün (86 s
Wall-Clock, 225 s Testzeit), `allgemeineFrist.property` allein in 17.4 s. Kein
Feature-Anteil — dieselbe Klasse, die der Vollzugsvermerk H2b schon für diese
eine Datei vermerkt hat, unter höherer Last auf sechs weitere ausgedehnt.
Ebenso in der Leser-Batterie: bei 5 Workern fielen die zwei OR-Fälle von
`leser-v3-seitenleiste-ordnung` in den 20-s-Locator-Timeout, isoliert brauchen
sie 26.0 s bzw. 28.7 s und sind grün; mit `--workers=3` ist die ganze Batterie
grün (75/75). **Offener §17-Punkt für den Orchestrator, unverändert:** die
Vitest-Zeitbudgets der schweren Sweeps halten Parallel-Last nicht aus.

**Auflage an H3** (B10): der Sheet-Block des Rahmens gehört in ein eigenes
Bauteil. NICHT hier gebaut — die Kollisions-Sonde zeigt, dass der Worktree
`LexMetrik-h3` den Rahmen bereits umbaut (174 geänderte Zeilen) und
`v3/LeserLeisteSheet.tsx` dort schon **existiert**. H3 vollzieht die Auslagerung
also selbst; dieser Nachzug hält seine Hunks im Rahmen klein und lokal
(+19/−12 vor dem Rückbau, danach netto −4 Zeilen) und baut die Grid-Struktur nicht an.

**Commit-Typ-Hinweis** (B12, keine Historien-Änderung): Commit `37159526f` heisst
`docs(…)`, ändert aber `src/index.css`, `src/tests/ArtikelBody.test.tsx` und
`e2e/leser-v3-suche-sprung.e2e.ts`. Nicht umgeschrieben (kein `amend`, kein
`rebase`), aber hier und im PR-Body benannt — `check:testtreue` deckt nur
`refactor(`, `docs(` läuft ihm durch.

**Für H4 vorgemerkt** (aus den Prüfer-Befunden, hier nur eingereiht):
**Ä9-Rest** (globaler App-Regler im Leser ausblenden, A-2) · **Ä45** Doppelkrume
(App-Krume und V3-Ortsangabe nennen denselben Ort übereinander; gemessen @390
zwei `nav`-Krumen) · **Ä46** zwei ✕ je Pane mit verschiedener Bedeutung
(gemessen 2 Stück) · **Ä33/Ä34** aus der Ästhetik-Prüfung. MESSWERT als H4-Ziel:
das Chrome bis zum Beginn der Lesefläche ist @390 **183 px = 22 %** der
Fensterhöhe im Ruhezustand (Topbar 65 · Krumen-Leiste bis 102 · V3-Kopf bis 183)
und wächst mit laufender Suche um 24 px auf **207 px = 25 %**.

**Tore:** s. Abschluss-Block unten.

---

### ✅ Vollzugsvermerk H1 (16.8.2026, Branch `feat/leser-v3-h1`)

**Kontaktbogen mit NM-Tabelle, Treue-Messwerten und Bildern:**
`docs/ux-audit-2026-07/reader/leser-v3-h1/README.md`.

**Neue Dateien** (Hülle, alle unter `src/pages/gesetz-leser/v3/`):
`LeserRahmenV3.tsx` · `LeserKopf.tsx` · `LeserAnsichtV3.tsx` ·
`LeserSeitenleiste.tsx` · `SuchSprungFeld.tsx` · `UebersichtBox.tsx` ·
`kopfStufen.ts` · `v3Optionen.ts`; dazu `GesetzLeserV3.tsx` gefüllt (lazy).
**Entfernt: nichts** — die Ist-Hülle ist unberührt (FL-4).

**Abnahme-Kriterium der Zeile erfüllt:** unter `?leser=v3` steht in beiden Panes
derselbe Kopf (`e2e/leser-kopf-paritaet`), ein Feld sucht **und** springt
(`leser-v3-suche-sprung`), das Umschalten V1↔V3 hält Erlass, Anker und Optionen
(`leser-v3-umschalten`, FL-6) — und ohne Flag ist der Ist-Stand unverändert
(`golden:vergleich` byte-gleich, Flag-Vitest FL-3/R10).

**Vier Punkte, die über die Zeile hinausgehen und hier festgehalten gehören:**

- **Kopf-Verzweigung 21 → 0 in der neuen Hülle** ist erreicht, aber anders
  gelöst als vermutet: `LeserKopf.tsx` enthält **kein** `imPane` und **keinen**
  Breakpoint (Quellensonde `src/tests/leser-v3-adresse.test.ts`). Die Overflow-
  Regel misst die **Element-Breite** (ResizeObserver, `kopfStufen.ts`) statt des
  Viewports — nur deshalb gilt in Einzelansicht, breitem und schmalem Pane
  dieselbe Regel aus einer Quelle. Ein `xl:`-Präfix hätte im Pane den Viewport
  gemessen und das Desktop-Bild in eine 620-px-Spalte gezwungen.
- **Zielzahl «Sucheingabe-Felder 2 → 1 (nach H1, V3)» ist gemessen erreicht:**
  V1 trägt @1440 zwei Eingaben im Gesetz («Im Gesetz suchen …», «Art. N»), V3
  eine («Suchen oder «Art. 429» …»).
- **Der Sprung-Offset rechnet die neue Kopfhöhe mit** (Risiko R1): `#art-429`
  landet nach dem Sprung auf y = 156 px = Topbar 64 + App-Leiste 36 + Kopfzeile
  56. Im Ist-Stand fehlte diese Verrechnung ganz.
- **Kein Kern angefasst:** `ArtikelLeser`/`ArtikelBody` unverändert importiert;
  Artikelzahl (480), Lesespalten-Breite (672 px @1440 / 350 px @390) und
  Bezüge-Zeilen (326) sind in beiden Hüllen identisch gemessen.

**Zwei Abweichungen** (Herleitung im Kontaktbogen, Ziff. 4):

- **A-1 Schriftgrössen-Regler.** Er bedient den bestehenden globalen Skala-Store
  (`lexmetrik-schriftskala`) statt eines zweiten 4-Stufen-Speichers. Grund: ein
  zweiter Speicher für dieselbe Frage wäre eine zweite Wahrheit (§5), und die
  vier absoluten rem-Werte der Design-Grundlage (Kap. 2.3) setzen die
  V3-Normtextgrösse voraus, die erst **S2** bringt — in H1 bliebe sonst der
  Normtext nicht byte-gleich (Treue-Grenze PX). **Vorschlag: die vier Stufen
  mit S2 nachziehen**, wenn die Baseline ohnehin einmalig neu gesetzt wird.
- **A-2 Zwei Leisten statt einer.** Die V3-Kopfzeile sitzt **unter** der
  bestehenden App-Leiste, statt sie zu ersetzen. Die Verschmelzung verlangt
  Änderungen an `src/components/layout/**` und hätte die Ist-Hülle mit
  umgebaut (FL-4). Sie gehört zu **H4/H5**; Preis heute 37 px Chrome. Dieselbe
  Aufteilung hat der Entscheid-Leser seit je.

**Fundament-Auflage David 16.8.2026** («richtig guter Code, der sich als
Fundament auch für weitere Gesetze und Darstellungen eignet») — umgesetzt und im
Kontaktbogen Ziff. 4c mit Modulgraph belegt: **eine Naht** zur geteilten
Maschinerie (`v3/leserV3Modell.ts`, typisiertes `LeserV3Modell`) statt acht
verstreuter `inhalt-*`-Importe · **kein `if (bund)` in Komponenten**
(`v3/erlassAnsicht.ts` leitet Ebene, Overline und Übersichtszeile aus dem
Datenmodell ab — Bund, Kanton und Staatsvertrag laufen durch denselben Rahmen) ·
**eine Wurzel** für Pane und Breite (`v3/LeserV3Kontext.ts`) · **fünf benannte
Erweiterungspunkte** als Props (`panelOeffner`, `panelSlot`, `beiwerkSlot`,
`fassungsWahl`, `leisteExtra`), die ungesetzt nichts rendern · Rahmen von 597 auf
285 Zeilen, Lesekörper und Gliederung als eigene Bauteile. Bewusst NICHT
abstrahiert: die Hook-Reihenfolge im Adapter (koppelt geteilte Refs, §6.6), die
Umbenennung der `inhalt-*`-Module (fasst FL-4-eingefrorene Dateien an → H5), der
Lesekörper (PX misst ihn), die Breiten-Messung per ResizeObserver (sie speist
`--nt-stick`; zwei Geometrie-Quellen wären die LM-003-Konstellation) und ein
gemeinsamer Rahmen mit dem Entscheid-Leser (§1: keine Abstraktion über zwei
Fälle, von denen einer noch umgebaut wird). Der Umbau war verhaltensneutral:
identische Messwerte, alle 15 V3-e2e grün.

**Befund zur N-Liste (Kap. 10) — die Zuordnung ist zu früh als «N» geführt.**
Das Flag-Projekt steht nach H1 bei **49 von 60 grün**. Alle elf roten Zeilen
wurden einzeln nachgesehen; **keine betrifft den Normtext**, alle prüfen die
**Struktur der Ist-Hülle**, die V3 planmässig ersetzt: `gesetze-ux-g3a` (3 ×
`.lc-leser > header` als direktes Kind), `leser-optionen` (3 × «genau zwei
role=switch» — V3 hat die drei von Kap. 4f), `leser-r1-r2` (4 × das zweite Feld
«Zu Artikel springen», das Pos. 4 gerade beseitigt) und `leser-ruecksprung-r5-r7`
(1 × Rücksprung «< 140 px»; V3 landet auf **156 px** = exakt das klebende Chrome
64 + 36 + 56 — die Schwelle war auf das Ist-Chrome von 100 px kalibriert).
Diese vier Dateien können gegen eine neue Hülle **konstruktiv nicht** grün
werden; sie als Paritätsbeweis zu führen hiesse, jede Hüllen-Änderung als
Normtext-Verletzung zu melden. **Vorschlag beim nächsten Schnitt:** die vier in
Kap. 10 als **B** einordnen (H4 entfernt/hängt sie ohnehin um). Als N bleiben
`gesetze-marginalie`, `gesetze-pdf-download`, `gesetze-ux-9punkte`,
`gesetze-ux-g3b-anhang`, `leser-ohne-gliederungslinie`, `leser-suche-vertrag-b8`
— **alle sechs sind in beiden Hüllen grün**, und das ist der Paritätsbeweis, der
wirklich einer ist. Herleitung je Zeile im Kontaktbogen, Ziff. 4b.

**Zwei Befunde aus der Prüfung, die H1 selbst betrafen und behoben sind:** die
Gliederungsspalte konnte nicht scrollen (`max-height` am Vorfahren löst kein
`height:100%` im Kind auf — der Überschuss wurde stumm abgeschnitten), und der
GETEILTE Scroll-Spy fand seinen Container nicht, weil der V3-Leiste die Marken
`[data-toc]`/`[data-toc-zone-a]` fehlten (die Gliederung wäre beim Lesen still
stehen geblieben, P9b/A33). Beide reproduziert, behoben und nachgemessen.

**Nebenbefund für H2:** die reine Volltextsuche kostet auf **H** einen Tap mehr
als im Ist-Stand (Ist: Lupe im Kopf = 1 Tap · V3: ☰ → Feld = 2 Taps), weil
Kap. 4b Suchfeld und Gliederung gemeinsam ins Bottom-Sheet legt. Keine der drei
NM-Aufgaben, aber die Stelle, an der H2 ansetzen sollte.

#### Nachzug nach Bug-Check und Architektur-Review (16.8.2026, vor Merge)

Behoben: ⌘K/«/» hatten ZWEI Empfänger (V3-Feld und Header-Suche) — der Leser hat
jetzt Vorrang über die Capture-Phase, und das Kürzel hängt am RAHMEN, weil das
Feld bei zugeklappter Spalte @≥1024 px gar nicht im DOM ist · das Hüllen-Flag
wurde in einem `useEffect` vollzogen, sodass das zweite Split-Pane V1 neben V3
rendern konnte (jetzt synchron und idempotent) · `aria-controls` am
Ansicht-Öffner zeigte im Ruhezustand auf eine nicht existierende Id ·
`inhalt-hooks` re-exportierte aus `inhalt-kopfmeldung` und zog damit
`LeserMenuPaar` + `InGesetzSuche` transitiv nach `v3/` (Re-Export gestrichen,
Fundament-Sonde läuft jetzt **eine Ebene transitiv**) · `beiwerkSlot` stand im
Interface, ohne angeschlossen zu sein (geht jetzt an `LeserLesespalte` durch) ·
`LeserV3Kontext.ts` hatte NULL Konsumenten und ist gestrichen (§17 Rückbau; H3
legt ihn bei Bedarf mit bekanntem Konsumenten neu an).

**Folge-Etappen, die daraus feststehen:**
- **H3** braucht ein DREI-Spalten-Grid, damit `panelSlot` rechts stehen kann
  (heute zwei Spalten), und einen GETEILTEN `usePopoverAutoZu`-Hook —
  Ansicht-Panel und Kontext-Panel schliessen sonst mit zwei Kopien derselben
  Aussenklick-/Esc-Logik (§5).
- **H4** braucht EINE Breiten-Quelle (`useElementBreite`) mit den Modi
  `d`/`s`/`sheet`; heute entscheiden `istXl` (Rahmen) und `kopfStufe`
  (Kopfzeile) unabhängig über denselben Platz. Dorthin gehört auch das
  Umhängen der vier B-Specs (Kap. 10).

**Deckel-Stand:** H1 ist der erste der höchstens fünf H-PRs (Kap. 7).

---

### Strang S (in place, wirkt in beiden Hüllen)

| E | Inhalt | Vorbedingung | Tests | Abnahme-Kriterium | Aufwand |
|---|---|---|---|---|---|
| **S1** | Optionen-Rückbau: Historie zweiwertig, «Fassung»-Overline an denselben Schalter, «Verweise» streichen, Migration alter Werte (Pos. 8) | **F1 + F2 schriftlich «ja»** | **2 N neu**: `hist-ansicht-w25i`, `gesetze-historie-badge`; `leser-optionen` bleibt grün; Vitest-Migration | «Änderungsvermerke: aus» lässt keine Historie-Spur im Lesekörper zurück, und der DOM bleibt vollständig. | **S** |
| **S2** ✅ **gebaut 17.8.2026** (Vollzugsvermerk unten) | Artikel-Raster (Beiwerk-Zone) + Typografie-Tokens (Pos. 13, 19) | **F3 entschieden 17.8.2026: V2 + Fussnote hochgestellt** (Kap. 8) | 2: `leser-breite-a37`, `leser-lesemass` | Der Satzspiegel entspricht der von David gewählten Variante (V2, gemessen 17 px / lh 1.55). — **Der erste Halbsatz «Umschalten aller drei Schalter erzeugt keinen Layout-Sprung» ist mit David-Entscheid A1 (5.7.2026) NICHT erfüllbar** und darum durch die verlustfreie Rundlauf-Zusage ersetzt; Herleitung und beide Zusagen im Vollzugsvermerk S2. | **M** |
| **S3** | Erlass-Kopf + Standausweis-Wortlaut (Pos. 11, 18) | **F5 «ja»** | 3 Vitest + 1 e2e-Wortlaut; `aufhebung-kopf` bleibt grün | UI-Kopf und prerenderter SEO-Kopf tragen **denselben** neuen Wortlaut, und die Warnung erscheint genau bei den fünf betroffenen Erlassen. | **S/M** |
| **S4** ✅ | Sortierung der Suchtreffer auf Erlass-Reihenfolge — **erledigt 16.8.2026 mit H2** (deklarierte Verhaltensänderung, wirkt in beiden Hüllen) | keine | Vitest an der Sortierfunktion; `leser-r1-r2`, `leser-suche-vertrag-b8` bleiben grün | Die Sortierfunktion liefert Dokumentreihenfolge als Primärschlüssel, bewiesen ohne Browser. | **S** |

### ✅ Vollzugsvermerk S3 (16.8.2026, Branch `feat/leser-v3-s3`)

**Gebaut.** Erlass-Kopf nach Skizze 4e in vier Bänder getrennt (Titel · Fakten ·
Stand+Status · Aktionen), Chip-Optik weg, Standausweis-Wortlaut nach **F5**.
Wirkt in BEIDEN Hüllen (geteilte Komponente `ErlassLeserKopf`).

| Zusage | Nachweis |
|---|---|
| §5-Einheit UI ↔ prerenderter SEO-Kopf | EIN Wortlaut-Modul `src/lib/normtext/erlassKopfText.ts`; Vitest sucht den String der einen Seite im Dokument der anderen. Nebenbefund behoben: die zwei Templates waren im DATUMSFORMAT bereits auseinander (UI `14.08.2026`, Prerender `2026-08-14`) — darum liegt auch die Datumsform dort, `formatiereDatum` ist ihre Fassade |
| F5-Wortlaut live | `dist/`: 224 Bund-Erlass-Seiten tragen «gegen Fedlex-Konsolidierung geprüft am …», der alte Wortlaut hat **null** Treffer im ganzen `dist/` |
| Warnung genau bei zutreffendem Fall | s. §7-Korrektur unten |
| Anhang-Dominanz | `zaehlWort()` ab 90 % Anhang «Einträge»; im V2-Baum verdrahtet, V3 s. offene Punkte |
| CLS | Kopf-Zelle höhenfest `.lc-kopf-stand` (vier gemessene Fenster-Werte in `index.css`). Gemessen 0.0216 @390 · 0.0060 @1280 für die GANZE Seite; die Shift-Quellen liegen laut `layout-shift`-`sources` im Seiten-Chrom, nicht im Kopf. Nullprobe auf Seiten ohne diesen Kopf, gleicher Lauf: `/gesetze` 0.31/0.73, `/rechtsprechung` 2.15/2.19 |
| Kantons-Probe | BS-640.100 hell+dunkel, Desktop+Mobil: kein Standausweis (kein `geprueftAm`), «Paragraphen», keine leeren Trenner; axe grün |
| Belege | `docs/ux-audit-2026-07/reader/leser-v3-s3/` — 16 Kopf-Screenshots (StPO mit Warnung · OR ohne · VMWG Verordnung · BS-Kantonserlass, je Desktop/Mobil × hell/dunkel) |

**§7-Korrektur beim Bau — abweichend umgesetzt und offengelegt.** Der erste
Bau warnte bei jeder als `nichtKonsolidiert` markierten Revision. Ein
e2e-Fehlschlag auf OR deckte auf, dass der Marker «tritt später in Kraft als der
Korpus-Stand» bedeutet und damit auch **rein künftige** Änderungen umfasst.
Gemessen über alle 227 Sidecars: **66** Erlasse mit Marker, aber nur **4** mit
einer bereits geltenden Änderung; spätester Marker **2034-01-01**. Der Satz
«Fedlex hat eine seit 01.01.2034 geltende Änderung noch nicht eingearbeitet»
wäre eine falsche Tatsachenbehauptung (§1/§8). Dieser Fahrplan verlangt den
Filter oben («`dateEntryInForce ≤ heute`», Pos. 11/18) — der erste Bau hatte ihn
übersehen. Gefiltert wird gegen einen **datengetragenen Stichtag**
(`currency.geprueftAm`), nicht gegen eine Uhr: kein `Date.now()`, prerender-stabil
(§2). Ergebnis = exakt die hier genannte Menge (FZA, STPO, TXG, BGG; BMV
unterdrückt bereits die Aufhebungs-Regel). Das gefilterte Ja/Nein gilt **auch für
die Erlass-Übersicht und die V3-Hülle** — sie hätten sonst bei 66 statt 4
Erlassen gewarnt.

**Offen aus S3 (nicht stillschweigend erledigt):**

| Punkt | Grund |
|---|---|
| `check:gegenpruefung` ROT | `src/lib/normtext/**` ist Blanket-Risikopfad; berührt sind `erlassKopfText.ts` (neu, reiner Text) und `revisionen.ts` (+2 reine Funktionen). Das Tor wurde **nicht** umgangen — ein Verschieben der Logik aus dem Risikopfad ist genau das Muster, vor dem `scripts/gegenpruefung/kern.ts` selbst warnt (Besetzungs-Präzedenz). Adversariale Gegenprüfung vor dem Merge fahren |
| ~~V3-Hülle ohne `kennzahlen`~~ | **Erledigt im Nachzug 16.8.2026** (Prüferbefund): `leserV3Modell` führt `nichtKonsolidiertSeit` mit, der Rahmen reicht es samt `kennzahlen` an den Kopf. Zugleich ist die Übergangs-Prop `nichtKonsolidiert: boolean \| string` in zwei klare Props aufgelöst — ihr Grund (das auf `boolean` gepinnte V3-Modell in fremder Bauhand) ist damit weg |
| ~~`xl`-Reservierung zu klein für V3~~ | **Erledigt im Nachzug 16.8.2026** (Prüferbefund): der `xl`-Schritt (37 px) passte nur zur Ist-Hülle. V3 stellt den Kopf in eine Spalte von 656 px @1280 (Deckel 752 px auch @1600), wo OR 53.5 px braucht — der Schritt hätte je Nachschub 16.5 px Sprung erzeugt. Schritt gestrichen, ab 768 px gilt einheitlich 3.375rem; der CLS-Wächter läuft jetzt über **beide** Hüllen (v3 @1280: 0.0014) |
| **`ANHANG_DOMINANZ` zweimal, mit verschiedenem Wert** | `gliederungsModell.ts:90` = **0.5** (ab wann der Anhang-Ast aufgeklappt startet) und `erlassKopfText.ts:88` = **0.9** (ab wann die Fakten-Zeile «Einträge» statt «Artikel» sagt). Gleicher Name, verschiedene Sache, verschiedener Wert — wer den einen liest und den anderen meint, ändert stillschweigend das Falsche. Zusätzlich rechnet `zaehlWort()` den Quotienten neu, obwohl `kennzahlen.anhangAnteil` ihn bereits trägt (§5). **Nachzug, nicht hier gebaut:** `erlassKopfText.ts` liegt im Risikopfad `src/lib/normtext/**`, eine Änderung kippt den Gegenprüfungs-Hash dieses PR. Im nächsten Risikopfad-PR mit Gegenprüfung: Konstante zu `ANHANG_ZAEHLWORT_SCHWELLE` umbenennen und `anhangAnteil` verwenden statt neu zu dividieren |
| Warnung fehlt im prerenderten Kopf | `seo-detail.ts` trägt den Standausweis, nicht die Warnzeile: dafür müsste der Revisions-Sidecar in den Prerender-Pfad. Eigener Schritt |
| `Stand` im SEO-Kopf bleibt ISO | `Stand 2025-04-01 · gegen Fedlex-Konsolidierung geprüft am 14.08.2026` mischt zwei Datumsformen in einem Satz. Der Fix ist eine Zeile, ändert aber jede prerenderte Seite — ausserhalb des F5-Auftrags |
| `lc-chip-geltend`/`lc-chip-vorbehalt` sind tot | Nach dem Chip-Rückbau in `src/` unbenutzt. Ihr Rückbau berührt das Farb-Wörterbuch in `DESIGN-REGLEMENT-NORMTEXT.md` §264-269/304 — eine Design-Autoritäts-Entscheidung, keine Nebenwirkung eines UI-PR (§17-Rückbau als eigener Schritt) |
| Falschverweis in diesem Fahrplan | Kap. 14 nennt «die 8 Befunde aus `FAHRPLAN-UI-NAVIGATION.md` §15». Diese Datei hat kein §15; die Befunde stehen in **`FAHRPLAN-UI-BEFUNDE.md` §15** (LM-181/183/184/188/197). Unten korrigiert |

### ✅ Vollzugsvermerk S1 (17.8.2026, Branch `feat/leser-v3-s1`)

**Gebaut.** Optionen-Rückbau der GETEILTEN Schicht (Strang S, wirkt in beiden
Hüllen) auf **3 zweiwertige Schalter → 8 statt 24 Kombinationen**. Vorbedingungen
F1/F2 lagen schriftlich vor (Kap. 9, David 16.8.2026).

| Zusage | Nachweis |
|---|---|
| `histansicht` zweiwertig (F1) | `HistAnsicht`, `HIST_ANSICHTEN`, `setzeHistAnsicht`, `useHistAnsicht` und die Sonderzeile für `data-histansicht` sind **weg**: das Feld läuft als gewöhnliches `OptFeld` in `FELDER` mit. Damit entfällt auch `v3/v3Optionen.ts` samt `histZuSicht`/`sichtZuHist`/`histUmschalten` (Datei gelöscht) — ihr Zweck war die Abbildung auf den dritten Wert. Der «Chronologie»-Modus ist restlos zurückgebaut: `<ol data-hist-chrono>`, drei CSS-Regeln, `baueChronologie` + `ChronoFussnote`/`ChronoEintrag`. `fnNrSortKey` **bleibt** (ordnet den Apparat) |
| «Verweise» gestrichen (F2) | Feld, beide Menü-Schalter, `data-verweise` (auch aus dem `attributeFilter` von `inhalt-suchtreffer.tsx`) und die CSS-Regel auf `.decoration-dotted` sind entfernt; kein Toter-Code-Rest (`grep -rnE '\bverweise\b' src e2e` findet nur noch die Verweis-CHIPS und -Links, eine andere Sache). Was F2 zusagte, ist positiv gedeckt: `leser-optionen` prüft, dass Farbe, `href`, Ctrl+F **und die Unterstreichung** bleiben — die Regel wurde nicht auf «aus» eingebrannt. **KORREKTUR S1-Nachzug 17.8.2026 (Ä25, §7):** hier stand «die **:hover**-Unterstreichung». Falsch: die gepunktete Linie ist DAUERHAFT (`NormText.tsx:38`, `underline` unbedingt; gemessen an StGB Art. 66a, 100 Links, `text-decoration-line: underline` im Ruhezustand). Der Vollzug selbst ist unberührt — der Schalter ist weg und die Linie bleibt in jeder Stellung; nur die Beschreibung ihres Zustands war falsch |
| «Fassung»-Overline am selben Schalter (Befund K4) | Sie hing an gar keinem Schalter und blieb bei «aus» als einzige Historie-Spur stehen. Neu `[data-hist-slot]` + eine Regel. Ausgeblendet wird der **Slot**, nicht nur die Zeile: sonst bliebe seine reservierte Höhe (16+24 px) als Phantom-Lücke unter jedem Artikel — «aus» hätte doch eine Spur hinterlassen |
| **Kern-Berührung deklariert** | `src/pages/gesetz-leser/parts/ArtikelLeser.tsx`, genau zwei Stellen: **Z. 221–225** (Chronologie-Berechnung entfernt, vier Importe verwaisten mit) und **Z. 594–620** (`data-hist-slot` am Historie-Slot; der `<ol data-hist-chrono>`-Block darunter entfernt). **Kein Wortlaut, kein Layout des Normtexts** — Golden 256/256 byte-gleich belegt es |
| Migration alter Werte, Vitest **Pflicht** | Reine, exportierte `migriereOptFelder()` in `leserOptionen.ts` + `src/tests/leser-optionen-migration.test.ts` (8 Fälle): `hist:"chronologie"` UND `"fussnoten"` → `"an"` (beide bedeuteten «Vermerke sichtbar» — «aus» wäre §8-Substanzverlust), `"aus"` → `"aus"`, 12 unbekannte Werte → Default ohne Wurf, `verweise` ignoriert und beim nächsten Schreiben abgeräumt. Zusätzlich derselbe Weg im Browser (`hist-ansicht-w25i`: Alt-Speicher via `addInitScript`, Schalter steht danach auf «an», Vermerke sichtbar, kein `data-verweise` am `<html>`) |
| Zusage der Etappe: keine Spur, DOM vollständig | `hist-ansicht-w25i` prüft alle drei Träger GEMEINSAM (Marker · Apparat-Rahmen · Fassungs-Slot) und die DOM-Vollständigkeit mit unverändertem Text — und die Rückkehr über «an». Parität: `leser-v3-umschalten` **(a2)** zeigt denselben Vorgang V3→V1 |
| Golden byte-gleich | `npm run golden:vergleich` → **IDENTISCH, 256 Fälle** (kein Golden neu geschrieben) |

**Rot-Beweise (§6.7), je einzeln erzeugt und zurückgenommen:**

| Mutation | Wird rot |
|---|---|
| `[data-hist-slot]`-Regel aus `index.css` entfernt | `hist-ansicht-w25i` «S1-ZUSAGE» + «Schalter bei Fussnoten aus», `leser-v3-umschalten` (a2) — 3 Tests, **beide Hüllen** |
| `min-h-hist-zeile` am Slot entfernt | `gesetze-historie-badge` «Reservierung hält»: «Artikel 2 verschoben: 1516 → 1552». Der alte CLS-Test wäre bei diesem below-fold-Sprung vermutlich grün geblieben — der neue ist strenger |
| Schalter-Beschriftung geändert | `leser-optionen` (Bestückung) + `leser-kopf-v2` (B-2) |
| `chronologie`→`aus` in `migriereOptFelder` | 2 Vitest-Fälle |
| `verweise` wieder in `FELDER` | 2 Vitest-Fälle |
| *(ungeplant, aber echt)* Die Alt-Fassung von `leser-schriftskala.test.ts` wurde beim ersten Lauf von selbst rot (`'an'` statt `'chronologie'`, `verweise`/`hist` nicht mehr geschrieben) — der Bestandstest hat die Migration gefangen, bevor der neue sie prüfte |

**Flake-Wurzel `gesetze-historie-badge` (Kap. 14 wies sie S1 zu) — kein Timeout,
keine Retry-Erhöhung:**

| | vorher | nachher |
|---|---|---|
| ganze Datei, lokal warm, volle Parallelität (10 Kerne / 5 Worker) | **1/10 rot** | **0/40 rot** |
| nur dieser Test, isoliert | 0/20 | — |
| isoliert, CPU-Drossel 1×/4×/8× | 0/13, CLS stabil 0.0058–0.0075 | 0/7, CLS **0.00000** (inkl. 6×) |

Treiber ist **Parallel-Last, nicht CPU-Tempo**, und die Streuung ist bimodal
(≈0.006 gegen 0.119) — keine Wolke um die Schwelle. Ursache: `buffered: true`
rechnete dem Badge das Lade-CLS der GANZEN Seite zu. Dominant ist der Reader-Kopf
nach dem Client-Takeover (`⇑Wachser: header +161px→238, h1 +49px→75`); er tritt in
jedem Lauf auf (Δ0.0052 in 20 Sonden-Läufen) und wird nur dann zu Δ0.1190, wenn
die Artikelliste zu dem Zeitpunkt schon gemalt ist — dann liegt das 976×312-Grid
in seiner Wirkfläche. Der Badge selbst tauchte in **keinem** Lauf unter den
Top-Quellen auf; seine Höhe ist reserviert. Das ist dieselbe Fehlerklasse, die
`helpers/cls.ts` am 20.7.2026 schon einmal behoben hat (Messfenster-Korrektur
`nurAbInstall`) — für diesen Test damals ausdrücklich NICHT, mit der Begründung
«für einen Lade-CLS-Test ist das genau richtig». Der Satz stimmt für ein
Seiten-Budget, nicht für einen Badge-Test (§6.7). Fix: Shard per `page.route`
anhalten, Beobachter erst nach fertigem Reader, dann freigeben — und die
Reservierung exakt prüfen (y der Folgeartikel und `scrollHeight` unverändert).

**KORREKTUR S1-NACHZUG (17.8.2026, Bug-Check B2/§6.7):** die Budget-Zusicherung
(`expect(cls).toBeLessThan(0.05)`) ist aus diesem Test **gestrichen** — sie
konnte den Defekt nicht melden, den sie benannte. Mutations-Sonde (Reservierung
`min-h-hist-zeile` entfernt): Geometrie **rot** («Artikel 2 verschoben:
1516 → 1552», Seitenhöhe 10735 → 10807), CLS **0.00000 und damit grün**, weil
alle hist-Slots von BGBM below-fold liegen. Gegenprobe mit dem Slot IM Ausschnitt:
CLS 0.0118515625 (3/3 bitgleich) — reisst 0.05 ebenfalls nicht. Der Test wird von
den drei Geometrie-Zeilen getragen; der handgerollte PerformanceObserver ist mit
der Zusicherung entfallen, der Timeline-Test nutzt wieder `helpers/cls.ts` (§5).

#### Nachzug nach drei Prüfern (17.8.2026)

Drei unabhängige Prüfer (Bug-Check · Ästhetik · Architektur) haben S1 geprüft;
hier je Befund eine Zeile mit Beleg. Nicht umgesetzt: **B3 in V3** (Kollision) und
**D1/Ä25 Design-Umbau** (Abweichung, s. «Offen aus S1»).

| Befund | Was · Beleg |
|---|---|
| **A1** blockierend | `leser-kopf-a9.e2e.ts` klickte den gestrichenen Schalter «Verweise». Rot reproduziert («Test timeout of 50000ms exceeded · waiting for … switch { name: 'Verweise' }»), auf `'Änderungsvermerke'` gezogen (§6.3 deklariert: geprüfte Sache = Reaktionszeit je Schalter, unverändert) → 1 passed (22.5 s). `grep`-Sweep gross/klein: zwei veraltete Kommentare nachgezogen (`main.tsx`, `index.css`); Domänen-Begriffe (`normverweise`) und Migrations-Specs bewusst unberührt |
| **B1** | «gedeckt im Lighthouse-Tor `check:perf-budget` (CLS ≤ 0.05)» war doppelt falsch: `check:perf-budget` misst gzip-**Bytes** (Chrome-frei), die CLS-Schranke lebt in `scripts/perf/lighthouse-budget.ts` = `check:perf-lighthouse`, und der Job läuft erst **nach** dem Merge (ci.yml `perf`: `if: … != 'pull_request'`). An beiden Stellen korrigiert; Kopf-Reflow (+161 px, CLS bimodal 0.006 ↔ 0.119) als Zeile in ROADMAP-Schritt **QS-PERF** (`check:plan` grün) |
| **B2** | CLS-Zusicherung des Badge-Tests **gestrichen** (§6.7) — Mutations-Sonde: Reservierung weg ⇒ Geometrie rot (art2 1516 → 1552), CLS 0.00000 und grün; Gegenprobe mit dem Slot im Ausschnitt 0.0118515625 (3/3 bitgleich) reisst 0.05 ebenfalls nicht. Die drei Geometrie-Zeilen tragen den Test. Der handgerollte PerformanceObserver fiel mit; der Timeline-Test nutzt wieder `helpers/cls.ts` (§5) |
| **B3** | Schalter «Änderungsvermerke» nur, wenn der Erlass Vermerke trägt (§8) — reine Ableitung in `berechnungen.ts`, **zwei** Träger (`kl:'A'` + Historie-Shard), **drei** Eingaben (die dritte, `erlassGeladen`, weil `ladeStruktur` 404 und «lädt noch» beide auf `null` abbildet — ohne sie behielte ZH-211.11 den Schalter). Korpus-Messung: 1217/1420 ohne `kl:'A'`, davon 2 mit wirksamer Fassungs-Zeile. Rot-Beweis + 12 Vitest, e2e positiv/negativ (StPO ja, BS-640.100 nein). **V3 offen**, s. u. |
| **B4** | Kommentar `HIST_SLOT = 40` nachgezogen («bei JEDEM Artikel» gilt bei «aus» nicht mehr). Bewusst nicht nachgerechnet: tolerierte Richtung «echte Höhe ≤ Schätzung», und eine Options-Abhängigkeit band eine reine Funktion an einen Darstellungs-Store (§2/§3/§15). Nur Kommentar |
| **C1** | Vier veraltete Begründungen: `ErlassKopfBlock.tsx` **neu begründet** (der «Chronologie»-Grund ist weg, das Ergebnis bleibt richtig — im Vorspann steht kein Gemisch aus Vermerk und Verweis, das zu trennen wäre; Ausblenden wäre reine Substanz-Wegnahme, §8) · `ArtikelBody.tsx` **NUR-KOMMENTAR-BERÜHRUNG DES KERNS, deklariert** · `suchHighlight.ts` · `BezugFacettenWahl.tsx` (Verweis auf die toten Namen `ZeitraumWahl`/`HistAnsichtWahl` entfernt) |
| **C2** | §11: `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md` Ziff. 7.4 auf **zwei Stellungen** und den **dritten Träger `[data-hist-slot]`** nachgezogen, datiert, mit der Folgeauflage aus B3; `INDEX.md` mitgezogen. `check:bibliothek` grün |
| **C3** | H5-Löschliste nennt jetzt **`LeserAnsichtMenu.tsx` samt `OptSwitch`** namentlich (die V1-Kopie von `V3Switch` darf H5 nicht überleben, §5). `fnNrSortKey` ≡ `ArtikelBody.tsx:114-123` als Zeile in «Offen aus S1» (Heimat `src/lib/normtext/`, Risikopfad ⇒ Gegenprüfung) |
| **C4** | `leserOptionen.ts` von **531 → 443 Zeilen** (Kommentaranteil 53 % → 45 %); vor S1 waren es 486, das Ziel «kürzer als vorher» ist um 43 Zeilen erreicht. Gekürzt wurde ausschliesslich die Chronik der gestrichenen Felder (sie steht hier); die mechanischen Gründe (CSP, stabile `getSnapshot`-Referenz, sofortiges Zurückschreiben der Zeitraum-Migration, Hydration-Getter) stehen unverändert |
| **D1/Ä25** | Faktenfehler an **sieben** Stellen datiert korrigiert; **Design-Umbau abweichend nicht gebaut** (§7) — Begründung und Messung in «Offen aus S1» |
| **D2/Ä27** | Hinweiszeile am Schalter, nur bei «Fussnoten: aus», V1 **und** V3 aus einer Konstante. Als `aria-describedby` und NICHT im `aria-label`: im Namen hiess der Schalter «… mit den Fussnoten ausgeblendet» und wurde dadurch von seinem Nachbarn «Fussnoten» ununterscheidbar — zwei bestehende Specs kippten sofort («strict mode violation … resolved to 2 elements»). Im Bau aufgetreten und behoben |
| **D3/Ä26** | Nicht gebaut, gehört S2 (Beiwerk-Zone) — als Zeile in «Offen aus S1» und in die Ä-Tabelle |
| **E1** | §17-Wurzelfix des main-Flakes `allgemeineFrist.property.test.ts`. Gemessen je Test: `tageZwischen` **12 775 ms** isoliert gegen 484 ms für die sieben anderen (96 % der Datei); unter Parallel-Last Datei 26.26 s, dieser Test also ~25.8 s bei 30 s Deckel — der Abstand ist kleiner als die Lastschwankung. Fester Zeit-Budget `{ timeout: 120_000 }` mit Begründung, **`numRuns` unverändert** (Prüftiefe auf Rechtslogik bleibt, §1 vor §15) |

**Kollision, gemeldet statt doppelt gebaut (§0 Ziff. 5)** — ✅ **aufgelöst am
17.8.2026:** H3 wurde auf `origin/main` (mit S1 #547 und H2b #548) rebased und hat
B3/D1 in derselben Bau-Einheit nachgezogen; Vollzug in der D1-Zeile des
H3-Nachzugs. Der Vermerk unten hält den Grund der Verzögerung fest, nicht mehr
einen offenen Punkt. — B3 ist in V1 gebaut und war in **V3 offen**.
Die Bedingung braucht einen Prop-Weg über `v3/leserV3Modell.ts` →
`v3/LeserRahmenV3.tsx` → `v3/LeserKopf.tsx`; alle drei liegen auf fremder
Bau-Fläche: `origin/feat/leser-v3-h2b` ändert sie (offen, nicht in `main`), und der
Worktree `LexMetrik-h3` hält sie samt `inhalt-zustand.tsx` **unfestgeschrieben**
geändert. Darum läuft die V1-Ableitung bewusst über `inhalt.tsx` (`eintraege` +
`historieFuer`) statt über `inhalt-zustand.tsx`. V3 ist nicht ausgeliefert
(H4-Flip wartet auf David), die Asymmetrie trifft also keine Nutzerin; der Vermerk
steht im Datei-Kopf von `v3/LeserAnsichtV3.tsx`. **Nachzug-Auflage für H3/H4:** wer
diese drei Dateien anfasst, reicht `hatAenderungsvermerke` mit durch.

**Offen aus S1 (nicht stillschweigend erledigt):**

| Punkt | Grund |
|---|---|
| **Echter Befund, nicht S1s Fläche: der Reader-Kopf reflowt nach dem Takeover um +161 px** | Aus der Flake-Diagnose gefallen. Für den Nutzer ein Lade-Sprung (bimodal 0.006 ↔ 0.119, lastabhängig). **KORREKTUR S1-Nachzug (17.8.2026, B1):** hier stand «gedeckt im Lighthouse-Tor `check:perf-budget` (CLS ≤ 0.05)» — falsch. `check:perf-budget` ist Chrome-frei und misst gzip-**Bytes** der Bundle-Topologie; die CLS-Schranke lebt in `scripts/perf/lighthouse-budget.ts` (`clsMax: 0.05`, OR + Startseite) = `check:perf-lighthouse`, und dieser Job läuft **erst nach dem Merge** (ci.yml, Job `perf`: `if: github.event_name != 'pull_request'`), ist also kein Merge-Blocker. Als Checklisten-Zeile im Roadmap-Schritt **QS-PERF** angelegt; gehört in die Auslieferung/Startlast, nicht in einen Optionen-Rückbau |
| **Ä25 · Verweis-Unterstreichung im Ruhezustand — Faktenfehler korrigiert, Design-Änderung ABWEICHEND NICHT gebaut (§7)** | Der Auftrag lautete: Ruhe = Verweisfarbe ohne Linie, Linie erst bei `hover`/`focus-visible` (Design-Grundlage `docs/ux-audit-2026-07/reader/leser-v3-design-grundlage.md` §8). Der **Faktenteil ist umgesetzt**: die Behauptung «wirkt nur bei :hover» ist an fünf Stellen datiert korrigiert (Kap. «Kurzfassung» F2, Kap. 2 K3, Kap. 4f, Kap. 9 F2, Vollzugsvermerk S1) und in `NormText.tsx`-Nachbarschaft (`LeserAnsichtMenu.tsx`, `leserOptionen.ts`). Der **Farb-/Linien-Umbau ist NICHT gebaut** — gemessen am gebauten Stand (chromium, StGB Art. 66a, 100 Inline-Verweise) trägt der Ruhezustand die Linie UND die Akzentfarbe, und der Farbabstand zum Fliesstext beträgt: **hell 2.04 : 1** (Link `#826225` gegen Fliesstext `#3C3932`), **dunkel 1.14 : 1** (`#D8BD78` gegen `#CFCCC5`). Die Linie zu entfernen liesse die Verweise also **durch Farbe allein** unterschieden, unter der 3 : 1-Schwelle der WCAG-Technik G183 — und damit gegen die Hausregel «Farbe trägt NIE allein» (§13/F2, `index.css:718`) und gegen die Auflage derselben Design-Grundlage «**Nie** hover-only … Hover verbirgt Zierde, nie Funktion» (auf Touch gibt es kein Hover). Der Umbau braucht darum ZUERST einen Entscheid, der über einen Nachzug hinausgeht: entweder ein neues Verweis-Token mit ≥ 3 : 1 gegen den Fliesstext in **beiden** Themen (Farbwert = Design-/David-Entscheid, DESIGN-REGLEMENT verbietet das Reparieren durch Werte-Tausch) oder ein leiseres Nicht-Farb-Signal im Ruhezustand. Heimat: **S2** (Typografie/Beiwerk, Kap. 8). Ist-Bilder für den Entscheid am Objekt: `docs/ux-audit-2026-07/reader/leser-v3-s1/ae25-ist-ruhezustand-stgb-66a-{light,dark}.png` |
| **Ä25-Nebenfund: `INLINE_CLASS` steht zweimal** | `src/components/NormText.tsx:38` und `src/components/KantonNormText.tsx:31` tragen denselben String zeichengleich (§5). Wer Ä25 baut, muss beide ändern, sonst laufen Bund- und Kanton-Verweise auseinander. Entdopplung gehört zum Ä25-Bau, nicht davor |
| **Ä26 · Historie-Slot reserviert 40 px auch ohne je eine Fassung (Phantom-Lücke)** | Ästhetik-Prüfer 17.8.2026. Bewusst **nicht** in S1 gebaut: der Slot ist die Beiwerk-Zone, deren Neuordnung Etappe **S2** trägt (Grundlage Kap. 3 Pos. 13). Ein Vorziehen würde die Reservierung anfassen, die der Badge-Test exakt prüft — ohne die S2-Zonen-Entscheide wäre es Raten |
| **`berechnungen.ts:176 fnNrSortKey` ≡ `ArtikelBody.tsx:114-123` (key) zeichengleich** | Architektur-Prüfer 17.8.2026: dieselbe Sortierregel für Fussnoten-Nummern zweimal im Code (§5). Entdopplung in eine spätere Etappe, **Heimat `src/lib/normtext/`**; Risikopfad (Fussnoten-Reihung am amtlichen Apparat) ⇒ **Gegenprüfung Pflicht**, darum nicht als Nebenzug im Nachzug |
| `hist-ansicht-w25i` läuft nur im Projekt `chromium` | Die Spec steht in keiner der Listen `N_SPECS`/`V3_SPECS`, `--project=leser-v3` sammelt sie also nicht. Die V3-Seite der S1-Zusage ist über `leser-v3-umschalten` (a2) gedeckt (läuft in BEIDEN Projekten, mit Rot-Beweis). Das Umhängen der Spec-Listen ist ausdrücklich **H4** (Kap. 10) — hier bewusst nicht angefasst |
| Vitest-Suite trägt einen last-abhängigen Flake **auf main** | Nullprobe auf dem unveränderten Basis-Commit `19a989f9`: **1/4 rot**, `allgemeineFrist.property.test.ts` mit 30-s-Timeout (`import 335 s` = massive Contention). Auf HEAD dieselbe Datei, 1/3. Ein Lauf unter Doppellast (Gate + volle Playwright-Matrix gleichzeitig) traf statt dessen `ArtikelBody`/`tap-ziel-token`. Ohne Nebenlast ist `npm run gate` grün. Nicht S1s Verursachung, aber offen |

### ✅ Vollzugsvermerk S2 (17.8.2026, Branch `feat/leser-v3-s2`)

**Entscheid, der die Etappe auslöste:** David 17.8.2026 am Bildbogen, «v2 gefällt
mir besser aber fussnoten hochgestellt» ⇒ **F3 = V2, Marke hochgestellt ohne
Klammern** (Kap. 8, dort auch die abgelöste V1-Empfehlung).

| Zusage | Nachweis |
|---|---|
| Fliesstext auf der V2-Stufe | Token `leser-text` 1.0625 rem / lh 1.55 (`tailwind.config.js:138`), gesetzt in `ArtikelLeser.tsx:551`. **Gemessen 17.00 px / 26.35 px = lh 1.55** an StPO/OR/BS-640.100, je @390/720/1440 |
| Der rohe `leading-[1.65]`-Override fällt | weg in `ArtikelLeser.tsx`; Wächter `src/tests/leser-typo-tokens.test.ts` (5 Fälle) + `check:design-tokens` grün |
| Marginalie/Randtitel 0.8125 rem Sans | Token `leser-rand`, `helpers.tsx:margStufeStil` + `ArtikelLeser.tsx:459`. Gemessen 13 px |
| Fussnoten-Apparat 0.6875 rem / lh 1.3 | Token `leser-fn`, gemessen 11 px — an **allen drei** Apparat-Stellen (Artikelfuss, Aufhebungsnotiz, Kopf-Apparat) |
| Fussnotenmarke hochgestellt, klammerlos | `--hochgestellt: .72em` (`index.css`) ersetzt **6×** `text-[0.62em]`; e2e prüft `vertical-align: super`, kein «(» im Markentext, Grösse 0.72 em. **Nachzug 17.8.2026:** das Token hiess `--fn-marke` und trug damit den Namen nur EINER seiner zwei Rollen — es setzt die Fussnotenmarke UND das Ordnungs-Suffix «bis/ter» an Marginalien; der Name ist jetzt rollenneutral (Arch-Prüfer 6) |
| WCAG 1.4.8 | lh 1.55; ≤ 80 ch gegated an 390/720/1440 in `e2e/leser-lesemass.e2e.ts`. **Zeichen je Zeile @1440, EINE Messung mit der Methode des Tors (Nachzug 17.8.2026, Arch-Prüfer 9):** ZGB 68 · OR 71 · StPO 73 · VMWG 74 · **StGB 77**. Die WCAG-Decke (80) hält überall; die engere HAUSdecke von 75 ch nicht mehr überall — Detail und offener Entscheid im Nachzug-Abschnitt |
| Lesemass 42 rem unverändert | `max-w-normtext`, `leser-breite-a37` grün |
| Beiwerk-Zone als EIN Ort | `[data-beiwerk]` umschliesst Verweise · Rechtsprechung · Fassungs-Slot · Apparat (`ArtikelLeser.tsx:595–703`) |
| Ä26 Phantom-Lücke | Reserve folgt dem Datenmodell **artikelweise**: `fussAnzeige.length > 0 \|\| historie`. Reservierende Artikel korpusweit **25 403 → 17 547 (−31 %)**; BS-640.100 **264 von 278 Slots weg (95 %)** (Nachzug-Korrektur: der Nenner ist 278 — die 14 aufgehobenen Artikel starten eingeklappt und rendern die Beiwerk-Zone nie, konnten also nie reservieren; die 14 Fussnoten-Artikel sind davon disjunkt, am Korpus geprüft), OR 1092 von 1686, StPO 346 von 480 |
| Ä7 Randtitel-Hierarchie | drei sichtbare Stufen: Artikelnummer 16 px bold ink-900 > Blatt 13 px semibold ink-800 > Vorfahren 13 px regular ink-600. **Nachzug:** die dritte Stufe der SEKTIONSKÖPFE (`SektionKopf.tsx`) lief noch auf `text-micro` 11 px Serif 500 und war damit leiser als das Blatt darunter — jetzt auf `leser-rand` |
| Ä-(b) Datums-Mischform | Stand-Zeile trägt EINE Auszeichnung (`tabular-nums` an der Zeile, `.num`-Mono raus); Risikopfad `src/lib/normtext/**` unberührt |
| Ä25 Verweis-Linie | ⏸ **im Nachzug ZURÜCKGENOMMEN — wartet auf David.** S2 baute «Ruhe ohne Linie»; der Ist-Stand ist wieder die dauerhafte gepunktete Linie. Der **Unmöglichkeitsbeweis für ein Farb-Token bleibt gültig** (dunkel verlangt L ≤ 0.1983 für 3:1 gegen den Text UND L ≥ 0.2084 für 4.5:1 über dem Grund — leeres Intervall). Zurückgenommen wurde die zweite Weiche, weil die Klasse die ganze Site trägt; Messwerte und Entscheid-Vorlage im Nachzug-Abschnitt. Der §5-Nebenfund (`INLINE_CLASS`-Duplikat) **bleibt entdoppelt**, die zusammengesetzten Strings sind byte-gleich zum Stand vor S2 |
| A-1 Regler, vier Stufen | Grundlagen-Faktoren `[1.0, 1.08, 1.18, 1.3]` × 1.0625 rem ⇒ **17 / 18.36 / 20.06 / 22.1 px** (100·108·118·130 %), im Browser bestätigt (`leser-v3-schriftskala` 3/3) |
| Golden byte-gleich | `golden:vergleich` → «IDENTISCH — 256 Fälle byte-gleich» |

**Kern-Berührungen (deklariert, nur Klassen/Tokens — kein Wortlaut, kein DOM):**
`ArtikelLeser.tsx` 293/448/459/527/551/595–707 · `ArtikelBody.tsx` 846
(`leading-relaxed` nur im Leser-Zweig) · `ErlassKopfBlock.tsx` 39–52/111 ·
`SektionKopf.tsx` 88 · `helpers.tsx` 189/391–421 · `index.css` 291/533–580 ·
`leserSchrift.ts` 44–70 · `tailwind.config.js` 129–140/252.

#### Drei Wurzel-Fixe, die S2 nicht bestellt hatte (§17)

1. **Der Entscheid war nicht geliefert.** Der Absatztext lief auf lh **1.625**,
   nicht auf den 1.55 des Entscheids: `ArtikelBody` setzte `leading-relaxed`
   unbedingt auf den Block-Wrapper und schlug die Zeilenhöhe der Stufe. Auch der
   Ist-Wert «1.65» war nie gerendert (Basis-Messung: Container 29.7 px,
   Absatztext 29.25 px). **Gefunden nur, weil ein Rot-Beweis GRÜN blieb** — die
   Stufe versuchsweise auf lh 1.4 gesetzt, und der WCAG-Fall merkte nichts.
   Lehre als Wächter verankert (`leser-typo-tokens.test.ts`: keine Leading-Klasse
   auf demselben Element wie eine Leser-Stufe).
2. **A-1 hing an einem Utility-Namen.** Die CSS-Regel des Schriftgrössen-Reglers
   selektierte `.text-body-l`; nach dem Stufen-Tausch hätte sie STILL nichts mehr
   getroffen (Regler wirkungslos, kein Tor rot — «Tor, das nicht scheitern kann»,
   §6.7). Sie hängt jetzt an `[data-lese]`, dem Attribut auf demselben Element.
   Zwei neue Wächter: Selektor darf kein `text-*`-Utility tragen; die Regler-Basis
   wird aus `tailwind.config.js` GELESEN statt abgeschrieben. Beide rot gesehen.
3. **PX-Tor: der notierte «1-px-Höhen-Wackler» ist behoben.** Der Spec-Kopf führte
   ihn als «ausdrücklich NICHT in dieser Etappe erledigt». Diagnose: V1 und V3
   rendern den Artikel bis aufs letzte Merkmal gleich (beide 784.921875 px hoch,
   gleiche Subpixel-Phase 0.1875, gleiche Grössen/Farben/Dekorationen/`:target`);
   unterschiedlich ist nur die y-Position (V3 sitzt 56 px tiefer). Bei Fensterhöhe
   900 lag der Artikel GENAU auf der Bruchstelle — teils im Fenster, teils darüber
   —, und Playwright nimmt ein nicht passendes Element scrollend auf, was die
   Rasterung der 11-px-Schriften verschiebt (1869 px, 5/5 reproduzierbar).
   **Nullprobe** (§0 Ziff. 3, am Anfang): Basis `788e4d4a5` mit frischer Baseline
   im eigenen Worktree **2/2 grün**; gegen die committete Baseline 2/2 rot mit
   «640×856 statt 640×857» = genau der notierte Wackler. Fix: `MESS_HOEHE_PX =
   1800` (derselbe Gedanke wie die erzwungene BREITE) plus ein Wächter, der rot
   wird, wenn ein Mess-Artikel doch nicht ins Fenster passt.

#### PX-Baseline: deklarierte Neusetzung (die im Fahrplan zugelassene Ausnahme)

Neu gesetzt, weil die Typografie sich absichtlich ändert. **Vorher-Bild
beigelegt:** `docs/ux-audit-2026-07/reader/leser-v3-s2/vorher/px-{or-336c,stpo-429}-VORHER-s1-baseline.png`.
Danach **5× grün, Exit 0** (Messbedingung: macOS/darwin, warmer Preview,
`workers=1`, `retries: 0`, keine Parallel-Last). Bemerkenswert: beim Setzen wurde
die Baseline nur EINMAL je Fall geschrieben — V3 traf die V1-Aufnahme exakt, die
Hüllen-Parität hält also byte-genau.

#### Der Konflikt im Abnahmekriterium — beide Zusagen, offengelegt (§7)

Das Kriterium der Etappe lautet: «Das Umschalten aller drei Schalter erzeugt an
keinem Artikel einen Layout-Sprung.» Das ist mit **David-Entscheid A1 vom
5.7.2026** («AUS» = die Fussnoten VERSCHWINDEN, statt gedämpft zu werden) **nicht
erfüllbar**: der Apparat misst je Artikel 27–187 px, und ihn höhenfest zu
reservieren wäre genau das verbotene Dämpfen — ein Boden fängt nur, was kleiner
ist als er selbst. **Nicht eigenmächtig gegen A1 gelöst.** Gebaut ist, was ohne
A1-Verletzung reservierbar ist (Fassungs-/Bezugs-Zeile), und der Apparat bleibt
A1-konform. Zwei Nebenbefunde: es sind seit S1 **zwei** Schalter, nicht drei
(«Rechtsprechung» ist ein Dropdown); und die Toggle-Δ-Messung über Artikelhöhen
ist bei grossen Erlassen durch `content-visibility` verfälscht (off-screen-Artikel
melden ihre Platzhalterhöhe).

Statt der unerfüllbaren Zusage ist die **verlustfreie Rundlauf-Zusage** gegated:
an→aus→an stellt jede Artikelhöhe exakt wieder her, und der Fall prüft zuerst,
dass der Schalter überhaupt WIRKT. Genau diese Fehlerklasse (eine Reserve, die
den Schalter überlebt) hat Ä26 und S1-K4 erzeugt — und auf der Basis war sie
real: BS-640.100 hinterliess beim Rundlauf von «Änderungsvermerke» einen Rest von
**53 px**, jetzt **0 px** auf allen drei Erlassen.

**CLS vorher/nachher** (gleiches Skript, Basis `788e4d4a5` gegen diesen Stand):

| @1440 | StPO | OR | BS-640.100 |
|---|---|---|---|
| vorher | 0.00461 | 0.04339 | 0.00855 |
| nachher | 0.00542 | 0.04480 | 0.00868 |

Die Differenzen (+0.0008 / +0.0014 / +0.0001) liegen in der Streuung, und die
Messung lief **nicht lastisoliert** (ein zweiter Preview-Server lief parallel) —
darum ausdrücklich **keine Verbesserungs- und keine Verschlechterungs-Behauptung**
(§0 Ziff. 3). Die Aussage, die trägt: CLS bleibt in derselben Grössenordnung, und
die Kopf-CLS-Wächter (`leser-kopf-cls-s3`, 4/4) bleiben grün.

#### Nicht gebaut, mit Grund

| Punkt | Stand |
|---|---|
| **Ä-(a) Titel-Reservierung** (`min-h-titel-2z` 2.35em ⇒ ~37 px Leerraum bei einzeiligem Titel; 8 von 12 geprüften Erlassen sind @1280 einzeilig) | **Untersucht, NICHT geändert.** Ohne die Reservierung bleibt `leser-kopf-cls-s3` grün (4/4) — aber diese Spec misst den **Sidecar**-Nachschub, nicht den Font-Swap, gegen den die Reservierung steht. Der Versuch, den Swap direkt zu messen (woff2 blockieren), ist **fehlgeschlagen**: beide Läufe zeigten die Webfont, das Ergebnis beweist nichts. Auf einer Fläche mit datiertem CLS-Vorfall (0.0227 am 9.8.2026) wird ohne Beweis nicht geändert (§6). **Nächstes Experiment, konkret:** Fallback über `document.fonts` erzwingen statt über Netz-Blockade, Zeilenzahl des `h1` je Erlass web↔fallback @1280/390 vergleichen; nur bei 0 Abweichungen die Reserve streichen. Heimat **H4/S3-Nachzug** |
| **Ä4 Beiwerk-Chips über den Rand** | **Reproduziert und vermessen, NICHT behoben.** `.lc-bezug-linie` ist ein horizontaler Scroll-Streifen (scrollWidth 875 gegen clientWidth 414 @1440); 17 Nachfahren der Beiwerk-Zone ragen rechts über die Artikelkante, bis **232 px @720**. Kein Dokument-Überlauf (Seiten-Scrollbreite 0) — der Inhalt wird still beschnitten. Am Objekt sichtbar in `nachher/stpo-429-1440-s2.png`. **Grund für den Aufschub:** H3 ersetzt genau diese Chip-Zeile durch den leisen Zähler «⚖ n Entscheide →» (F4); eine Überarbeitung hier wäre verworfene Arbeit und eine Kollision mit der H3-Baufläche. Zugewiesen an **H3** |
| **Sachüberschrift 16 px → 13 px** | Folgt der V2-Zeile, die David gewählt hat, berührt aber den Auftrag vom 26.6.2026 («darf nicht zu einem blassen Abschnittslabel verkümmern»). Gegengesteuert mit Gewicht und Farbe (semibold, ink-800 statt V2-ink-600). **Wartet auf Davids Auge** an `nachher/` |
| **Toter Zweig in `gesetze-marginalie`** | Die Vorfahren-Zusicherungen laufen **nie** — alle 11 ZGB-Stapel haben genau EIN Kind; über ZGB und OR 40 000 px gescrollt kein einziger mehrstufiger Stapel. Belegt durch einen Rot-Beweis, der grün blieb (Blatt auf `semibold text-ink-400`, also heller als jeder Vorfahr ⇒ 4/4 grün). **Vorbestehend, nicht von S2 verursacht.** Die Zusicherungen bleiben (sie sind richtig, nur unerreicht), der falsche Eindruck von Deckung nicht: Befund steht an der Spec. Ein zuerst gebauter «verschmolzen»-Fall ist wieder **entfernt** — er war aus demselben Grund unerreichbar (§6.7/§17) |
| **ROADMAP-Deckel** | `check:steuerdeckel` rot: ROADMAP.md 100.5 KB > 100 KB. **Nicht von S2** — die Datei ist byte-identisch zum Basis-Commit `788e4d4a5`, das Tor war schon dort rot. Gehört zum Doku-Rotationscommit des S1-Branches |

**§6.3-Anpassungen an Bestands-Tests, deklariert** (drei Dateien, je mit
Begründung an der Stelle): `src/tests/leser-schriftskala.test.ts` (Stufenwerte,
1.0625 rem, Selektor — dazu zwei NEUE Wächter), `e2e/leser-v3-schriftskala.e2e.ts`
(Selektor + `STUFEN_PX`), `e2e/gesetze-marginalie.e2e.ts` (Prominenz über
Gewicht/Farbe statt über absolute Grösse). Kein `refactor(`-Commit fasst eine
Testdatei an.

**Tore (nackt, Exit-Code):** `npm run gate` 42/43 (einzig rot:
`check:steuerdeckel`, s. o.) · `check:design-tokens` 0 · `check:e2e-shards` 0
(90 Specs) · `check:testtreue` 0 · `check:perf-budget` 0 · `check:linien-kanon` 0
· `golden:vergleich` 0 · `npm run build` 0 · `npx tsc -b` 0 · Playwright
chromium 54/54 (inkl. aller sechs N-Specs) · V3-/Kopf-Batterie 29/29 · restliche
V3-Specs 21/21 · `leser-v3-schriftskala` 3/3 · `leser-kopf-cls-s3` 4/4 ·
`a11y --project=schwer` 47/47 · `PX=1 --project=px` **5/5**. Der bekannte Flake
`allgemeineFrist.property` trat in keinem Lauf auf.

**Rot-Beweise (§6.7), je einmal gesehen:** Config-Drift der Regler-Basis
(«Regler-Basis und Fliesstext-Stufe laufen auseinander (§5)») · `text-*`-Utility
zurück im Schriftskala-Selektor · Stufen-Wert in `tailwind.config.js` verstellt ·
Fliesstext-Override zurück · **Ä26 auf `erlass.ebene === 'bund'` zurückgedreht
⇒ «Reserve fehlt (Ä26-Regel greift nicht auf Kantonsrecht ⇒ Erlass-Sonderpfad)»**
· PX-Fensterhöhe zu klein ⇒ Wächter mit Handlungsanweisung · «Schalter wirkt
nicht» im Rundlauf-Fall. Zwei Beweise sind bewusst als MISSLUNGEN protokolliert,
weil sie grün blieben und damit einen echten Defekt aufdeckten (lh-Override,
toter Marginalie-Zweig).

#### Nachzug nach drei Prüfern (17.8.2026)

Drei unabhängige Prüfungen: Bug-Check · Ästhetik **7/10** · Architektur **8,5/10**
(«ja mit Nachzug»). Je Befund eine Zeile, jeder reproduziert, bevor er behoben wurde.

**Nummernkreis:** die S2-Ästhetik vergab Ä52–Ä57 und kollidierte damit mit dem
H3-Nachzug (Ä52–Ä59). Die S2-Punkte heissen darum **Ä61–Ä66** (Ä52→Ä61 · Ä53→Ä62 ·
Ä54→Ä63 · Ä55→Ä64 · Ä56→Ä65 · Ä57→Ä66); die alten Nummern gelten für H3.

| Befund | Stand |
|---|---|
| **Ä25 Verweis-Linie** | ⏸ **zurückgenommen, wartet auf David.** Ist-Stand wieder dauerhafte Linie. Gemessener Kontrast Link↔Umgebung ohne Linie: **1.00 : 1** (`/rechner/verjaehrung`), **1.06 : 1** (übrige Rechner-Seiten), **2.14 : 1** (Leser) gegen die 3 : 1 der WCAG-Technik G183 — die Klasse `INLINE_CLASS` trägt ~20 prerenderte Rechner-/Vorlagen-Seiten, nicht nur den Leser, und die axe-Ausnahme `link-in-text-block` ist ein David-Entscheid (BERICHT.md B-2). **Entscheid:** Design-Grundlage Kap. 8 gegen G183. **Empfehlung: Linie behalten.** Ä66 (zwei Verweis-Sprachen) ist damit ohne eigenen Eingriff erledigt |
| **A1 / Ä65 Doku-Drift** | ✅ `tailwind.config.js` beschrieb die Ä26-Reserve als `erlass.ebene === 'bund'`; gebaut ist artikelweise `fussAnzeige.length > 0 \|\| historie`. Wortlaut aus `berechnungen.ts` übernommen |
| **A2 / Ä61 Marken-Kollision** | ✅ `w-6` → `min-w-6`. Gemessen @1440, **beide Hüllen identisch** (vorbestehend): OR 336c `cbis.`/`cter.` je +10 px, `cquater.` +35.2, `cquinquies.` +60.41; AIG 5 `abis.` +10. Neue Spec, Rot-Beweis 5/5. **Kern-Berührung** |
| **A3 / Ä62 Marken-Waisen** | ✅ Träger `whitespace-nowrap` + Wort-Verbinder INNERHALB. Vorher StGB 13/532 (V3), 16/532 (V1), StPO 8/276 → **je 0**. Die Auftrags-Ursache (`inline-block`) ist **widerlegt**: Blink erzwingt für `<button>` unabhängig von `display` eine atomare Inline-Box (13 Waisen vor UND nach `display:inline`); `overflow-wrap: anywhere` ebenfalls ausgeschlossen. Beweis über DOM-Chirurgie. **Kern-Berührung** |
| **A4 / Ä7-Rest** | ✅ dritte Randtitel-Stufe der Sektionsköpfe von `text-micro` (11 px Serif 500) auf `leser-rand` (13 px Sans). Stufen 0/1 bewusst unverändert (§7) |
| **B1/B10 toter Zweig** | ✅ die Vorfahren-Schleife in `gesetze-marginalie` lief nie (11 von 11 ZGB-Stapeln mit genau EINEM Kind) — nach §17(2) **gestrichen statt bewacht**; an ihre Stelle EINE lebende, vollständige Blatt-Zusicherung (13 px / 600 / ink-800). Rot-Beweis gesehen |
| **B2 Token-Rename** | ✅ `min-h-hist-zeile` → `min-h-beiwerk` restlos in den lebenden Dateien, inkl. der Rot-Beweis-Anleitung in `gesetze-historie-badge` |
| **B3 PX-Kommentare** | ✅ «Baseline nicht neu aufgenommen» und «Wurzel-Fix NICHT in dieser Etappe» stehen auf dem Ist-Stand |
| **B4 Token-Name** | ✅ `--fn-marke` → `--hochgestellt` (zwei Fachinhalte: Fussnotenmarke + Marginalien-Suffix); stale «9px/12px» entfernt |
| **B5 Hülle** | ✅ `leser-lesemass` sagt im Kopf, welche Hülle es prüft (Ist-Hülle; Stufe ist Kern, nur der Regler ist V3-gegated) und hat EINEN Fall unter `?leser=v3` mit Positiv-Sicherung. Rot-Beweis: Flag entfernt ⇒ «Expected 1, Received 0» |
| **B6 Prop-Doku** | ✅ `zitierKontext` trägt am Vertrag die Doku seiner zweiten Wirkung (der Typografie-Schalter) |
| **B7 Zahlen** | ✅ EINE Messung, Methode des Tors, @1440: **ZGB 68 · OR 71 · StPO 73 · VMWG 74 · StGB 77 ch**. Korrigiert: `tailwind.config.js` («70–72 ch, ≥ 3 ch Luft» war die 18-px-Zahl), `ArtikelLeser.tsx` («53–58 ch»), Ä26-Nenner (278 statt 292 ⇒ **264** Slots weg) |
| **B9 später** | ✅ nur eingetragen: **Ä63** Handy-Einzug (OR/ZGB @390 x = 80 gegen StPO 44) → H4/S3 · **Ä64** Regler skaliert nur `[data-lese]`, Hierarchie kippt bei 130 % → H4 |

**PX-Baseline erneut deklariert neu gesetzt.** Ä61/Ä62 verändern den Textkörper
(Marken-Spalte und Marken-Umbruch), die S2-Aufnahme galt also nicht mehr. Vorher-Bilder
`vorher/px-{or-336c,stpo-429}-VORHER-s2-nachzug.png`; Messbedingung wie oben (macOS,
warmer Preview, `workers=1`, `retries: 0`, keine Parallel-Last). Wie in S2 wurde die
Baseline je Fall nur EINMAL geschrieben — V3 traf die V1-Aufnahme exakt, die
Hüllen-Parität hält byte-genau.

**Tore des Nachzugs (nackt, Exit-Code):** `npm run gate` **GRÜN** (43/43 Sub-Checks;
`check:steuerdeckel` ist inzwischen grün) · `check:testtreue` 0 · `check:e2e-shards` 0
(91 Specs) · `check:design-tokens` 0 · `check:perf-budget` 0 · `golden:vergleich` 0
(«IDENTISCH — 256 Fälle byte-gleich») · `npm run build` 0 · `npx tsc -b` 0 ·
Playwright `chromium` auf `leser-*`/`gesetze-*` **247/247** · Projekt `leser-v3` auf
`leser-v3-*`/`leser-kopf-*` **32/32 + 1 skip** · `gesetze-marginalie` in beiden
Projekten 8/8 · `leser-marken-geometrie` 5/5 · `PX=1 --project=px` **5/5** ·
`a11y --project=schwer` **47/47** (hell + dunkel).

**Rot-Beweise des Nachzugs (§6.7), je einmal gesehen:** die neue Spec
`leser-marken-geometrie` 5/5 rot gegen den Stand vor dem Fix, mit den Messzahlen im
Fehlertext (`cquinquies.» +60.41 px`, «13 von 532 Marken») · Blatt-Stufe in
`gesetze-marginalie` auf 16 px verstellt ⇒ «Erwartet 16, erhalten 13» · der neue
V3-Fall in `leser-lesemass` ohne `?leser=v3` gefahren ⇒ «Expected 1, Received 0» (er
kann nicht still gegen die Ist-Hülle grün werden) · die neue Spec ohne Eintrag in
`shard-gruppen.json` ⇒ «FEHLT: leser-marken-geometrie.e2e.ts». **Zwei Kandidaten sind
als MISSLUNGEN protokolliert und haben genau dadurch die Auftrags-Ursache widerlegt:**
`display:inline` am Fussnoten-Marker (13 Waisen vorher UND nachher) und
`overflow-wrap: break-word`/`normal` (unverändert 13/8) — die Ursache ist die atomare
Inline-Box des `<button>`, bewiesen per DOM-Chirurgie (Ersatz durch echte Inline-Spans
⇒ 0 Waisen).

**Vorbehalte für Davids Auge** (nichts davon entscheidet ein Test, §8):
1. **Sachüberschrift 13 px** statt 16 px — folgt der V2-Zeile, berührt aber den
   Auftrag vom 26.6.2026 («darf nicht zu einem blassen Abschnittslabel verkümmern»);
   gegengesteuert mit semibold/ink-800.
2. **Fussnoten-Apparat 11 px** (vorher 12 px) — die kleinste Schrift im Leser, @390
   am kritischsten. Kontrast selbst nachgemessen (StPO Art. 429, `[data-fn-apparat]`
   auf der 11-px-Stufe): **5.10 : 1 hell** (`#6F6B61` auf `#FCFAF6`) und
   **5.52 : 1 dunkel** (`#918D83` auf `#16150F`) — beides über der AA-Schwelle
   4.5 : 1, die bei 11 px gilt. *(Der Bug-Check hatte 4.98 : 1 für hell notiert; nicht
   reproduziert, gemessen sind 5.10 : 1. Die dunkle Zahl deckt sich.)* Die Frage ist
   also nicht die Lesbarkeit im Normsinn, sondern ob es sich am Objekt zu klein
   anfühlt.
3. **Lesemass:** die Hausdecke 75 ch hat beim VMWG 1 ch Luft, das StGB liegt mit
   77 ch darüber (WCAG 80 ch hält überall). Entweder `max-w-normtext` wird für die
   17-px-Stufe schmaler, oder die Hausdecke geht bewusst auf 80.

### ✅ Nachzug David-Befunde 17.8.2026 abends (B1–B3), Branch `fix/leser-v3-david-17-8`

Drei Live-Befunde am Prod-Stand `afc008c19` unter `?leser=v3`. Alle drei zuerst
**gemessen**, dann gefixt; neue Punkte **Ä67–Ä70** (Ä61–Ä66 sind S2).

| # | Befund (Wortlaut David) | Ursache, gemessen | Fix |
|---|---|---|---|
| **B1 / Ä70** | «wenn die gliederung ausgeblendet ist funktioniert suche nicht mehr resp. resultat ist versteckt. andere lösung finden» | Der `trefferListe`-Zweig der Lesespalte hing an `!zweiSpalten` und traf damit die **eingeklappte** Spalte — ein Zweig, der etwas anderes tat als sein Kommentar («Rand-Fall ohne Leiste»). Die Liste lag @1440 **und** @1024 inline über dem Lesetext: **y = 755, Höhe 3596 px**, also unter der Falz, und schob den Gesetzestext um 3,6 Bildschirmhöhen nach unten | Trefferliste als **Blatt am Suchfeld** (`v3/LeserTrefferBlatt.tsx`, 18 rem, `max-h 50dvh`, kein Scrim, Esc/✕, Zähler-Zeile führt zurück). Der Inline-Zweig ist **gestrichen**, nicht verengt: `hatLeiste` ist `eintraege.length > 0`, der angekündigte Rand-Fall ist unerreichbar (§17) |
| **B2 / Ä68+Ä69** | «wenn änderungsvermerke abgewählt wird dann verschwinden auch fussnoten» | `[data-histansicht=aus]` blendete `[data-fn-klasse="A"]` und den A-only-Apparat aus. `kl:'A'` ist beim Bund die **Regel**: StPO Apparat-Einträge sichtbar **285 → 98**, Marker **285 → 105**; ZGB **809 → 90** bzw. **809 → 173**. Der Schalter war faktisch ein zweiter Fussnoten-Schalter (§8) | **Entkoppelt** (Entscheid David): Fussnoten-Schalter trägt Marker + Apparat **aller** Klassen, Vermerke-Schalter **nur** `[data-hist-slot]`. Ä27-Hinweis samt `hinweis`-Slot gestrichen — die erklärte Kreuz-Abhängigkeit gibt es nicht mehr |
| **B3 / Ä67** | «um das suchfeld erscheint bei klick darin ein braun umrundetes feld dass abgeschnitten ist» | `outline` liegt aussen (`offset 0`): Ring x = **182…466**, Clip `[data-v3-leiste-scroller]` (`overflow-x: hidden`) beginnt bei **184** ⇒ linke Kante **2 px abgeschnitten**, hell wie dunkel; gescrollt trifft es die obere Kante | `outline-offset: -2px` — der Ring liegt vollständig **im** Element und kann von keinem Vorfahren mehr beschnitten werden (Wurzel statt Umschiffung, §17). Höhen der Kopf-Zone unberührt: `outline` nimmt nie Platz |

**Warum B1 ein Blatt und keine aufziehende Spalte:** die zweite Option wurde
**gemessen verworfen** — das Grid wechselt `2.25rem → 18rem`, der zentrierte
Satzspiegel wandert @1440 um **126 px** seitwärts, und zwar beim Tippen und bei
Esc wieder zurück. Genau diesen Sprung hat David am 16.8. gerügt. Das Blatt liegt
`absolute` und verschiebt den Lesetext um **0 px** (Spec (e) misst es).

**Die Anbieten-Regel bleibt — gemessen, nicht geschlossen.** Korpus 17.8. (1420
Sidecars gegen 205 Shards mit Einträgen): **0** Erlasse tragen `kl:'A'` ohne
Fassungszeile, die `kl:'A'`-Bedingung überanbietet also heute nirgends. Neuer
Wächter in `aenderungsvermerke-schalter.test.ts` wird rot, sobald das kippt.

**Deklarierte fachliche Änderungen (§6.3), beide in BEIDEN Hüllen** (die Regeln
hängen an `.lc-leser`, nicht am Flag — sonst zwei Bedeutungen für ein
Steuerelement, §5/FL-1): die A-Zusicherungen in `hist-ansicht-w25i` sind
**umgekehrt**, jede als zweiseitige Sonde, dazu neu die **2×2-Matrix** über Bund
(BGBM) und Kanton (BS-640.100); `leser-optionen` prüft statt des Ä27-Hinweises
dessen Abwesenheit **plus** die Unabhängigkeit selbst. Nachtrag in
`bibliothek/normen/hist-ansicht-h0-trennbarkeit.md` §7.4a — H0-Auflage 1 gilt
jetzt für **jede** Klasse, ist also strenger erfüllt als zuvor.

**Rot-Beweise (§6.7), am Vorzustand gesehen:** 15 von 28 Fällen rot — u. a.
«Vermerke=aus nimmt Apparat-Zeilen mit — Expected 29, Received 8» (BGBM) ·
«A-Marker 0 verschwindet mit den Änderungsvermerken» · «Ring links um 2 px vom
Clip ‹data-v3-leiste-scroller› beschnitten» (hell **und** dunkel) · «Trefferliste
fehlt ganz — Expected 1, Received 0». Ein Fehlschlag war **Prüfmechanik statt
Sache** und ist protokolliert: die gescrollte Leiste kam nur 55 px weit (Baum
eingeklappt), die Spec klappt jetzt erst auf und sichert die Scrollbarkeit positiv.

### Panel-Nachladen (H3) — Startlast senken, ohne SEO zu verlieren

| Punkt | Regel |
|---|---|
| Was | Bezugs- und Kontext-Daten werden im Browser **erst beim Öffnen des Panels** geladen, nicht beim Seitenaufruf. Heute rendert `BezuegeZeile` unter **jedem** Artikel und zieht die Daten unbedingt (`bezuegeLaden.ts`). |
| Beweis | Die Ersparnis wird als **Zahl aus `check:perf-budget`** ausgewiesen (Daten-Nutzlast gzip, das Tor führt die Bezugs-Shards bereits als eigene Budget-Zeile) — vorher/nachher im PR, keine Behauptung. |
| **SEO-Prüfpunkt (harte Grenze)** | Der **Prerender behält die Bezüge serverseitig im HTML** — nur der Browser lädt nach. Grund: `scripts/prerender.ts` schreibt das SEO-HTML aus Manifesten und Snapshots, unabhängig von der Hülle; würde das Nachladen dort durchschlagen, verlöre jede Erlass-Seite ihre Verzahnung für Suchmaschinen. |
| Wächter | Neuer Test `leser-v3-prerender-bezuege`: das **prerenderte** HTML einer Erlass-Seite enthält die Bezüge weiterhin (Vitest gegen die Prerender-Ausgabe bzw. e2e mit deaktiviertem JS), zusätzlich `check:seo-index` grün. Ohne diesen Test wird H3 nicht abgenommen. |

### Fenster-Deckel und Flip-Kriterien

| Regel |
|---|
| **Höchstens 5 H-PRs bis einschliesslich H4.** H1–H3 sind drei; zwei PRs bleiben als Puffer für Nachbesserungen. Wird der Deckel gerissen, folgt ein **Abbruch-Review** (Rückbau des Flags und Rückfall auf In-Place-Etappen), keine stillschweigende Verlängerung. |
| **Flip-Kriterien für H4 (alle, nicht auswählbar):** die acht unveränderten N-Tests grün unter Flag · `leser-kopf-paritaet` grün · Pixelvergleich PX grün · Nutzer-Massstab NM in keiner der drei Aufgaben verschlechtert · CLS ≤ Ist-Stand · axe grün · Kantons-Probe grün · die drei bekannten Flaker (s. Kap. 14) mit Wurzel-Fix statt Timeout · David-Go nach Kontaktbogen. |
| **H5 spätestens einen PR nach H4.** Die Löschung ist keine optionale Aufräumetappe, sondern die Bedingung, unter der (III) überhaupt gewählt wurde. |
| **Streich-Massstab für H5** (`bauschritt`/`aufraeumen.md` §3, Auftrag David 14.8.2026): Eine Zeile/Datei fällt nur, wenn der Nachweis des Nichttragens **vor** der Löschung steht — (a) keine eingehenden Verweise, (b) alle Tore grün und golden byte-gleich nach dem Entfernen, (c) bei Rechtslogik zusätzlich §1-Blick. «Beweis vor Löschung, nie löschen-und-schauen.» |

### Positions-Abdeckung 1–19

| Pos. | Verdikt | Etappe | Pos. | Verdikt | Etappe |
|---|---|---|---|---|---|
| 1 Kopfzeile | Neu | H1 | 11 Standausweis-Widerspruch | Umbauen (Wortlaut) | S3 |
| 2 Dropdown-Konzept | Umbauen | H1 | 12 Entscheide im Fliesstext | Umbauen | H3 |
| 3 Rechtsprechung → Panel | Neu | H3 | 13 gleichmässige Abstände | Neu | S2 |
| 4 ein Such-/Sprungfeld | Umbauen | H1 | 14 ✕ springt nicht mehr | Umbauen | H2 |
| 5 Trefferliste ordnen | Umbauen | H2 (UI) + S4 (Sortierung) | 15 «Zum Anfang» | Neu | H1 |
| 6 Split-View einheitlich | Neu | H1 | 16 Gliederung ganz auf/zu | Neu | H1 |
| 7 Tab-Titel bleibt | Umbauen | H1 (`EntscheidLeser.tsx:409`) | 17 Kontext-Panel überladen | Neu (Ort) | H3 |
| 8 Änderungshistorie | Umbauen + Weg | S1 | 18 Meta-Zeile Erlass-Kopf | Neu | S3 |
| 9 Code simplifizieren | Umbauen | H5 | 19 Typografie | Umbauen | S2 |
| 10 Übersichtsbox | Neu | H1 | | | |

**Nachtrag S3 — drei Ästhetik-Positionen aus der Gegenprüfung (16.8.2026, Urteil
7/10 «Merge ja mit Nachzug»). Bewusst NICHT in S3 gebaut:** sie betreffen
Typografie und Titel-Anatomie, also die Fläche, über die **F3/S2** am Bildbogen
entscheidet — sie jetzt einzeln zu setzen, nähme diesem Entscheid vorweg.

| # | Befund | Heimat |
|---|---|---|
| (a) | Die Titel-Reservierung hält zwei Zeilen (`min-h-titel-2z`, 2.35em). Bei einzeiligem Titel — der Regelfall bei kurzen Kürzeln — steht darunter sichtbarer Leerraum, seit S3 stärker wahrnehmbar, weil der Kopf sonst ruhig geworden ist. Die Reservierung selbst ist CLS-Pflicht (Font-Swap) und darf nicht ersatzlos fallen; zu prüfen ist eine metrisch angeglichene Fallback-Schrift, die mit weniger Reserve auskommt | **S2** |
| (b) | Die Stand-Zeile mischt Datumsformen: `Stand 01.04.2025` läuft in der Ziffern-Mono-Auszeichnung (`.num`), das Datum im Standausweis proportional — dieselbe Grösse, zwei Anmutungen in einem Satz | **S2** |
| (d) | Bei Staatsverträgen mit sehr langem Volltitel steht das Kürzel am Ende einer dreizeiligen `<h1>` und ist damit schlecht auffindbar, obwohl es die Kennung ist, nach der gesucht wird. Betrifft die Titel-Anatomie, nicht den Standausweis | ✅ **erledigt in H2b** — die Kennung steht VOR dem Titel, sobald er über 80 Zeichen lang ist (`erlassAnsicht.titelKennung`, rein und unit-geprüft; optionale Prop am geteilten Kopf, Vorgabe = S3-Zitierform, die Ist-Hülle setzt sie nicht). LugÜ: «LugÜ · Übereinkommen vom 30. Oktober 2007 …» |

**Pos. 8 im Klartext.** «Chronologie» entfällt; der Schalter heisst «Änderungsvermerke: an/aus»,
und bei «aus» verschwinden Marker, Apparat-Zeile **und** «Fassung»-Overline gemeinsam. §8 ist
gewahrt: der Normtext bleibt unberührt, alle Historie-Texte bleiben im DOM (über «an» samt
Ctrl+F wiederherstellbar), und die Historie-Zeile ist im Repo ausdrücklich als *abgeleitete
Metadaten, kein Wortlaut* geführt (`ArtikelLeser.tsx:603-604`, `data-such-meta`). Präzedenz:
David-Entscheid A1 vom 5.7.2026.

**Pos. 11/18 im Klartext.** Kein Software-Fehler — alle drei heutigen Anzeigen sind für sich
wahr, aber «geprüft am 14.08.2026» liest sich für Laien wie «alles aktuell», obwohl ein Passus
fehlt. Neu: Chip «gegen Fedlex-Konsolidierung geprüft am …» plus Klartext-Warnzeile nur bei
`nichtKonsolidiert` mit `dateEntryInForce ≤ heute`. **§5-Pflicht:** derselbe Wortlaut steht an
zwei Stellen (`ErlassLeserKopf.tsx:79`, `seo-detail.ts:269`) — beide im **selben** PR; zusätzlich
die Kommentar-Referenzen `index.css:867,909`.

---

## 8 · Typografie-Varianten (Pos. 19, entscheidet S2)

> **ENTSCHIEDEN — David 17.8.2026 am Bildbogen**
> (`docs/ux-audit-2026-07/reader/leser-v3-s2/bogen.html`), Wortlaut
> «v2 gefällt mir besser aber fussnoten hochgestellt»: **Spalte V2 «amtsnah
> kompakt» ist GEWÄHLT**, mit **einer Abweichung** — die Fussnotenmarke bleibt
> **hochgestellt und ohne Klammern** (V1-Form). Gebaut in S2, Nachweise im
> Vollzugsvermerk S2 (Kap. 7).

| Kennwert | Ist | **V1 «ruhiger Satzspiegel»** | **V2 «amtsnah kompakt» ✅ GEWÄHLT** |
|---|---|---|---|
| Fliesstext | `text-body-l` 1.125 rem / lh 1.6, Override `leading-[1.65]` (`ArtikelLeser.tsx:563`) | 1.1875 rem (19 px) / lh 1.7 | ✅ 1.0625 rem (17 px) / lh 1.55 — Token `leser-text`; **gemessen 17.00 px / 26.35 px = 1.55** |
| Lesemass | `max-w-normtext` 42 rem ≈ 70–72 ch | 40 rem ≈ 64–66 ch | ✅ 42 rem, unverändert |
| Marginalie/Randtitel | Stufen nach `gesetze-marginalie` | 0.875 rem, Serif, ink-600 | ✅ 0.8125 rem, Sans — Token `leser-rand`; **Blatt abweichend ink-800/semibold** (Auftrag David 26.6.2026, s. Vermerk) |
| Titelstufen | h3 20 / h2 25.6 / h1 32 (`tailwind.config.js:59-60`) | 20 / 24 / 30, Overline in Kapitälchen | ✅ unverändert |
| Absatzziffern (¹ ² ³) | inline | **hängend** in der Marge, ink-500 | ✅ inline, halbfett |
| Fussnotenmarke | hochgestellt, klassenabhängig | 0.72 em hochgestellt, ohne Klammer | ⚠️ **ABWEICHUNG David 17.8.2026:** NICHT in Klammern/0.8 em, sondern **0.72 em hochgestellt ohne Klammer** (V1-Form) — Token `--hochgestellt` (im Nachzug rollenneutral umbenannt, vorher `--fn-marke`), ersetzt 6× `text-[0.62em]` |
| Fussnoten-Body | ~~`text-micro` 0.6875 rem / lh 1.2~~ → **am Code gemessen `text-xs` 12 px / lh 1.5**; der Ist-Vermerk war falsch (§7) | 0.75 rem / lh 1.45 | ✅ 0.6875 rem / lh 1.3 — Token `leser-fn`; gemessen 11 px |
| Einzug je Stufe | 20 px, max 5 Stufen | unverändert | ✅ unverändert |
| WCAG 1.4.8 (≤ 80 ch, lh ≥ 1.5) | erfüllt | erfüllt | ✅ erfüllt — **gemessen 73/71/61 ch @1440 (StPO/OR/BS-640.100), lh 1.55**; an 390/720/1440 gegated |

**KORREKTUR ZUM IST-STAND, gemessen (S2, 17.8.2026).** Der Absatztext lief NIE
auf lh 1.65. `ArtikelBody` setzte `leading-relaxed` (1.625) unbedingt auf den
Block-Wrapper und schlug damit die Zeilenhöhe des Containers — der Ist-Wert
«1.65» in der Spalte links ist nur der CONTAINER-Wert, gerendert waren **1.625**.
Auf der Basis `788e4d4a5` nachgemessen: Container 29.7 px, Absatztext 29.25 px
= 18 × 1.625. S2 nimmt den Override im Leser-Zweig heraus; erst damit liefert der
Leser die 1.55 des Entscheids wirklich. Gefunden wurde es nur, weil ein
Rot-Beweis GRÜN blieb (Stufe versuchsweise auf lh 1.4 gesetzt — der WCAG-Fall
merkte nichts). Lehre: eine Grössen-Stufe ist erst geliefert, wenn kein
Leading-Token daneben auf demselben Element steht; Wächter dafür ist jetzt
`src/tests/leser-typo-tokens.test.ts`.

**Token-Schranke:** `check:design-tokens` verbietet rohe Grössen wie `text-[19px]`
(`scripts/check-design-tokens.ts` Z. 4-7) — jede neue Grösse tritt als **Token** in
`tailwind.config.js` ein. Das gilt auch für den heutigen `leading-[1.65]`-Override.

**Bild-Bogen (Vorbedingung für S2, kein Produkt-Code).** Skript-Pfad:
`…/scratchpad/konzept/typo-kontaktbogen.spec.ts`, Ausgabe nach
`…/scratchpad/konzept/typo-bogen/`. Inhalt: **StPO Art. 429** und **OR Art. 336c**, je drei
Breiten (390 / 1440 / 720 px = Pane) und drei Zustände (Ist · V1 · V2), V1/V2 per
`page.addStyleTag()` injiziert = **18 PNG**. Erst danach entscheidet David F3.

---

## 9 · Entscheide F1–F6 — als harte Vorbedingungen

> **Entscheide David 16.8.2026 (Chat, «go, empfehlungen übernehmen, bau den prototyp»):** F1 ja · F2 ja · F4 ja · F5 ja · F6 nein · ~~**F3 = V1 (19 px)**~~ **← ABGELÖST, s. nächster Absatz** · F7 = A (Kopf mit «Ansicht ▾») · F8 = Panel-Randlasche behalten; **Regel David 16.8.: Schalter «Rechtsprechung im Text» aus ⇒ Zähler UND Randlasche weg** (Panel bleibt über «Ansicht ▾»/Tastatur erreichbar; H3) — entschieden am Prototyp V-0, David 16.8.2026 («V1, a, Lasche behalten — weiter mit H1») · Design-Grundlage D-A Regler ja · D-B Dunkelmodus behalten (14 Rollen) · D-C Serif behalten. Blocker `david-go-leser-v3` gelöst; Schritt auf wip.

> **Entscheid David 17.8.2026 (am Bildbogen `docs/ux-audit-2026-07/reader/leser-v3-s2/bogen.html`),
> Wortlaut «v2 gefällt mir besser aber fussnoten hochgestellt»:
> F3 = V2 «amtsnah kompakt» (17 px / lh 1.55) + Fussnotenmarke HOCHGESTELLT,
> ohne Klammern.** Dieser Entscheid **löst die F3-Empfehlung «V1» vom 16.8.2026
> ab** — sie war ausdrücklich unverbindlich «bis nach dem 18-Bilder-Vergleich»
> (Kap. 8), und der Vergleich hat jetzt stattgefunden. Die alte Zeile bleibt oben
> durchgestrichen stehen, damit die Reihenfolge der Entscheide nachvollziehbar
> bleibt. Gebaut in **S2**; Nachweise, Messwerte und die eine Abweichung von der
> V2-Spalte im Vollzugsvermerk S2 (Kap. 7).

Keine Etappe startet ohne ihre Vorbedingung. Fehlt der Entscheid, wartet die Etappe — sie wird
**nicht** «auf Verdacht nach Empfehlung» gebaut (Council A/D: sonst liegt ein fertiger
Test-Rewrite vor, den David kippen könnte).

| # | Frage in Alltagssprache | Konsequenz «dann sieht der Nutzer …» | Empfehlung | Blockiert |
|---|---|---|---|---|
| **F1** | Heute gibt es drei Einstellungen dafür, wie Änderungsvermerke im Gesetzestext erscheinen (aus / bei den Fussnoten / als datierte Liste). Auf zwei reduzieren? | … nur noch «Änderungsvermerke: an/aus». Die datierte Liste entfällt; die Information selbst geht nicht verloren, sie steht dann bei den Fussnoten. | **Ja** — dritter Modus für dieselbe Information; er kommt als eigener Schritt zurück, falls Bedarf entsteht | **S1** |
| **F2** | Der Schalter «Verweise» soll weg. | … keinen Unterschied im Alltag: der Schalter wirkt heute nur auf eine gepunktete Linie unter Querverweisen. Farbe, Klickbarkeit und Ctrl+F bleiben in jedem Fall. **KORREKTUR S1-Nachzug 17.8.2026 (Ä25, §7):** «die ohnehin erst beim Darüberfahren mit der Maus erscheint» war FALSCH; die Linie stand im Ruhezustand. David hat also auf einer zu harmlosen Beschreibung entschieden. Der Entscheid wird NICHT eigenmächtig umgedeutet: er bleibt in Kraft (die Linie ist Zierde), und die Frage «soll die Linie im Ruhezustand überhaupt stehen?» ist als eigener Punkt Ä25 geführt — sie ist eine Design-Frage, keine Rückbau-Frage. | **Ja** | **S1** |
| **F3** | Zwei Schriftbilder für den Gesetzestext stehen zur Wahl. | … bei **V1** grössere Schrift und kürzere Zeilen (ruhiger, mehr Weissraum); bei **V2** ein kompakteres Bild, näher am amtlichen Fedlex-Aussehen (mehr Text pro Bildschirm). | ~~**V1**~~ ⇒ **ENTSCHIEDEN 17.8.2026: V2** + Fussnote hochgestellt (am Bildbogen; die V1-Empfehlung war bis zum Bildvergleich unverbindlich) | **S2** ✅ gebaut |
| **F4** | Unter jedem Artikel stehen heute scrollbare Zeilen mit Gerichtsentscheiden. Ersetzen durch eine leise Zeile «⚖ 14 Entscheide →», die ein Seitenfenster öffnet? | … einen ruhigen Gesetzestext ohne Entscheid-Zeilen; ein Klick auf den Zähler öffnet das Fenster mit allen Entscheiden samt Filtern. Kein Entscheid wird unerreichbar. | **Ja** | **H3** |
| **F5** | Der Standausweis im Erlass-Kopf soll neu formuliert werden. | … statt «geltend geprüft am 14.08.2026 (maschinell)» neu «gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)» — und dort, wo es zutrifft, den Klartextsatz «Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text eingearbeitet». Heute betrifft das fünf Erlasse. | **Ja, beides** — der Chip sagt, *was* geprüft wurde, die Warnzeile, *was trotzdem fehlt* | **S3** |
| **F6** | Blätter-Pfeile «voriger/nächster Artikel» aufnehmen? | … einen zusätzlichen Knopf im Kopf oder am Artikelfuss — bequem beim Durchlesen, aber ein Element mehr statt weniger. | **Nein, nicht in V3** — nach der Landung als eigener kleiner Schritt bewerten | — |
| **F7** | Soll die Kopfzeile ein «Ansicht»-Menü haben (**A**) oder gar keines (**B**, Schalter wandern in den Panel-Reiter «Anzeige»)? Du entscheidest am **Klick-Prototyp** (V-0), nicht am Text. | … bei **A** rechts oben ein Menü wie heute, nur mit drei statt vier Schaltern. Bei **B** eine Kopfzeile aus vier Elementen ohne jedes Menü; wer etwas ein-/ausblenden will, öffnet das Seitenfenster. B ist die ruhigere Kopfzeile, kostet aber einen Klick mehr für jede Umschaltung — genau das misst der Nutzer-Massstab (NM) am Prototyp. | **B — mit einer Einschränkung** (nächster Absatz lesen) | **H1** (Kopf), **H3** (Reiter «Anzeige») |

**Zu F7, Variante B — geprüft und ehrlich berichtet.** Der Auftrag umschreibt Variante B mit
«Fussnoten immer an». Das ist mit der Präzedenz **nicht** vereinbar, und zwar nicht knapp:
Der G2b-Eintrag vom 4.7.2026 hält fest, es gebe «**EINE** Fussnoten-Bedienung: der
`data-fussnoten`-Options-Toggle», der frühere zweite Schalter sei **entfernt** worden; der
David-Entscheid **A1 vom 5.7.2026** regelt anschliessend, was «AUS» tut (verschwinden statt
dämpfen) — er **setzt einen AUS-Zustand voraus**. Beide stehen in
`DESIGN-REGLEMENT-NORMTEXT.md:395-415`. Den Schalter ersatzlos zu streichen, hiesse einen
datierten David-Entscheid stillschweigend zu kassieren; das darf dieser Fahrplan nicht.

**Deshalb wird B in einer Fassung vorgeschlagen, die die Präzedenz wahrt:** Der Kopf verliert
sein Menü, **alle drei** Schalter — Fussnoten **eingeschlossen** — ziehen in den Panel-Reiter
«Anzeige». Die Bedienung bleibt damit vollständig erhalten (weiterhin genau **eine**
Fussnoten-Bedienung, nur an einem anderen Ort), nur der Kopf wird ruhig. Wer die Fussnoten
tatsächlich fest anschalten und den Schalter löschen will, braucht dafür einen **ausdrücklichen
neuen Entscheid Davids**, der A1/G2b aufhebt — der Prototyp V-0 zeigt beide Fassungen, damit
diese Frage am Bild und nicht am Text beantwortet wird.

---

## 10 · Test-Preis, Treue-Grenze und Zielzahlen

### Test-Preis

| Kategorie | Bestand | Wirkung |
|---|---|---|
| e2e **N** (Normtext-Treue) | ~10 | **10 bleiben unverändert grün** *(korrigiert 16.8.2026, Vollzug H1: die Zahl «8» stand neben einer Aufzählung von zehn Namen; das Flag-Projekt fährt alle zehn — Befund aus der Vorprobe V-2)* — Pflicht: `leser-optionen`, `leser-r1-r2`, `leser-ruecksprung-r5-r7`, `leser-suche-vertrag-b8`, `gesetze-marginalie`, `gesetze-pdf-download`, `gesetze-ux-9punkte`, `gesetze-ux-g3a`, `gesetze-ux-g3b-anhang`, `leser-ohne-gliederungslinie`. **2 neu geschrieben** (deklarierte fachliche Änderung, §6.3, in S1): `hist-ansicht-w25i`, `gesetze-historie-badge`. Diese acht laufen **doppelt**: mit Flag gegen V3, ohne Flag gegen den Ist-Stand — das ist der Paritätsbeweis |
| e2e **B** (Bedienung/Layout) | ~17 | **11 neu geschrieben, aber nur EINMAL** (gegen V3, nicht als Interim + Endzustand): 10 in H1–H3 + `leser-breite-a37`/`leser-lesemass` in S2. Die alten Gegenstücke fallen in H4/H5 |
| e2e **P** (Perf/CLS) | ~5 | 2 neu, 3 bleiben |
| Vitest (DOM-frei) | 21 | ~4 berührt: `leser-suche-w219`, `gesetz-leser-uebersicht-s6`, `hist-chronologie` (entfällt mit dem Modus), `kontext`/`kontext-artikel-s7`; **neu**: Fassaden-Default (R10), Optionen-Migration, Sortierung (S4) |
| Infrastruktur | — | **Playwright-Projekt `leser-v3`** neben `schwer`/`chromium` — Aufwand **S**; **CI-Zeit der Leser-Suite ×2 im Fenster** (Shard-Balance beobachten) |
| Wortlaut-Tests (S3) | 4 Stellen | `aufhebung-kopf.test.tsx:56,64`, `v2-c2-farbwoerterbuch.test.tsx:62`, `fedlex-versionen-aufhebung.test.ts:29`, e2e `leser-kopf-g2b.e2e.ts:71,81,88` |

**Tore, die die Hülle NICHT berührt:** `check:normtext` · `check:golden-normtext` ·
`golden`/`golden:vergleich` · `check:fedlex-versionen` · `check:zitate`. **Berührt:**
`check:linien-kanon` Teil A (`data-normtext-linie`, `ArtikelLeser.tsx:406`) ·
`check:design-tokens` (S2) · `check:perf-budget` (H3-Nachladen, gemessen) ·
`check:seo-index` (H3 Prerender-Bezüge, S3 Wortlaut).

**B-Specs der Ist-Hülle laufen im Flag-Projekt erst ab H4 (umgehängt).** Vier der
zehn als «N» geführten Specs prüfen die STRUKTUR der Ist-Hülle, nicht den
Normtext, und können gegen eine neue Hülle konstruktiv nicht grün werden:
`gesetze-ux-g3a` (`.lc-leser > header` als direktes Kind), `leser-optionen`
(«genau zwei `role=switch`»), `leser-r1-r2` (das zweite Sprungfeld, das Pos. 4
beseitigt), `leser-ruecksprung-r5-r7` (Schwelle «< 140 px», auf das Ist-Chrome
von 100 px kalibriert; V3 landet auf 156 px). Seit dem H1-Nachzug (16.8.2026,
CI-Anlass Run 31962198006 Shard 4/8) fährt das Playwright-Projekt `leser-v3`
darum **sechs** N-Specs plus die V3-eigenen Specs; im Projekt `chromium` laufen
die vier unverändert weiter und schützen dort die alte Hülle. Umgehängt bzw.
entfernt werden sie in **H4**.

**Neue Treue-Grenze PX (Pixelvergleich).** Über die DOM-Tests hinaus wird der Textkörper
`.lc-leser article` ab H1 pixelweise gegen V1 verglichen (StPO Art. 429, OR Art. 336c, gleiche
Breite). Damit ist «Kern unangetastet» erstmals **bildlich** bewiesen: Abstände, Einzüge und
Zeilenumbrüche fallen sonst durch jedes DOM-Raster. **S2 ist die einzige Etappe, die die
Baseline neu setzt** — deklariert, begründet, mit Vorher-Bild im PR (§6.3). Ein Skript
`prerender-golden` existiert **nicht**; der Prerender ist hüllenunabhängig — geteilt sind nur
der S3-Wortlaut und die H3-Bezüge.

### Zielzahlen (korrigiert)

| Grösse | Vorher | Ziel V3 | Messzeitpunkt |
|---|---|---|---|
| Zeilen Leser-Scope | 16 068 | **≤ 13 500** | nach H5 |
| Dateien | 71 | **≤ 60** | nach H5 |
| Hüllen-Buckets | 8 473 | **≤ 6 400** | nach H5 |
| Kern-Buckets (FLI+FUS) | 3 368 | **3 368 ± Token-Zeilen** | laufend |
| **Kopf-/Layout-Verzweigungen auf `imPane`** | **~21** | **0** | nach H5 |
| **Scroll-/Hash-Scoping** (`paneRoot()`/Rolle) | ~30, davon 16 `paneRoot()`-Aufrufe | **bleibt — Ziel ist EINE Quelle (`PaneKontext.ts`), nicht weniger Aufrufe** | nach H5 |
| *(gestrichenes Altziel «imPane 38 → ≤ 8»)* | — | **ersatzlos gestrichen** — Baseline war falsch (102/114 statt 38) und ≥ 30 Fundstellen sind korrektes Scoping | — |
| Schalter im Ansicht-Menü | 4 (3× 2-wertig + 1× 3-wertig) | **3× 2-wertig** | nach S1 |
| Options-Kombinationen (ohne Facetten) | 24 | **8** | nach S1 |
| Menüs/Popover/Overlays | 6 | **4** | nach H3 |
| Kopfzeilen-Pfade | 2 | **1** | nach H5 |
| Sucheingabe-Felder | 2 | **1** | nach H1 (V3) / H5 (Repo) |
| Split-View-e2e-Dateien | 1 | **≥ 3** | nach H3 |
| Feature-Flag-Code | 0 | 1 im Fenster → **0** | nach H5 |
| **NM-1 «Art. 429 aufschlagen»** (Klicks/Sekunden, je H/D/S) | **wird in V-0 am Ist-Stand erhoben** | **≤ Ist in allen drei Breiten** | jede Etappe |
| **NM-2 «Entscheide zu Art. 429 sehen»** | wird in V-0 erhoben | **≤ Ist**; steigt sie durch das Panel, wird der Anstieg im PR als bewusster Preis ausgewiesen | jede Etappe, scharf ab H3 |
| **NM-3 «Stand + Warnung erkennen»** | wird in V-0 erhoben | **≤ Ist**, zusätzlich: Warnung ohne Fachbegriff verständlich | jede Etappe, scharf ab S3 |
| **Startlast Bezugsdaten** (`check:perf-budget`, gzip) | heutiger Wert beim Seitenaufruf | **messbar kleiner** durch Panel-Nachladen; Prerender-HTML unverändert | nach H3 |

*Die drei NM-Zeilen tragen bewusst keinen Zahlenwert: der Ist-Wert wird in V-0 **gemessen**,
nicht geschätzt — ein geschätzter Zielwert wäre eine Zahl ohne Messbedingung.*

---

## 11 · Risiken & Gegenmittel

| # | Risiko | Gegenmittel |
|---|---|---|
| R1 | **CLS/Sticky-Offsets:** neue Kopfhöhe → Sprünge landen falsch | Sticky-Höhe als **eine** CSS-Variable, Sprung-Offset daraus (fehlt heute ganz, `inhalt-suchtreffer.tsx:240-271`); P-e2e je Etappe |
| R2 | **a11y-Regression:** neues Menü/Panel als `role=menu` statt Disclosure | A4-Präzedenz zwingend (`aria-expanded` + `aria-controls`, `role="group"`); axe-e2e als Tor je Etappe |
| R3 | **Split-View-Drift** | Ein Rahmen-Kontext im V3-Baum; **der alte Baum ist eingefroren** (FL-4), es entsteht keine zweite gepflegte Welt; `leser-kopf-paritaet` als Test, nicht als Screenshot; Split-View-e2e von 1 auf ≥ 3 Dateien |
| R4 | **Persistenz-Migration** alter localStorage-Werte | Lese-Migration in `leserOptionen.ts` (unbekannt → Default), Vitest-Fall; kein Schreibzugriff auf Alt-Schlüssel; Optionen sind geteilt, nicht dupliziert (FL-6) |
| R5 | **Kantons-Erlasse mitgerissen** (Kopf-Felder teils Bund-only) | Kantons-Probe als Etappen-Regel (Kap. 7); `leser-kopf-v2`-Nachfolger deckt beide Ebenen |
| R6 | **Prerender/SEO** | Prerender ist hüllenunabhängig; nur der S3-Wortlaut ist geteilt → Doppel-PR (§5) + `check:seo-index` + `prerender` vor dem Merge |
| R7 | **Bundle-Grösse** (Panel + Rahmen im Entry) | `check:perf-budget` je Etappe; Panel lazy laden; **im Fenster liegen beide Hüllen im Build** — Budget bewusst beobachten, ggf. V3-Baum lazy |
| R8 | **Abnahme-Ermüdung** | Je Etappe **ein** Kontaktbogen (Vorher/Nachher, 3 Breiten); Typografie einmalig als 18-Bild-Bogen; David sieht ab H1 Sichtbares |
| **R9** | **Die Parallel-Hülle wird Dauerzustand** (der häufigste Ausgang solcher Vorhaben) | Deckel 5 H-PRs mit Abbruch-Review; H5 spätestens einen PR nach H4; H5 ist Abnahmezeile, nicht Nacharbeit; Streichquote aus der Basisrate (V-3) kalibriert den Deckel |
| **R10** | **Das Flag leckt** — Besucher sehen unfertige V3 | Default **false** an der Fassade, per Vitest bewiesen; Aktivierung nur über expliziten Query-Parameter; kein Server-seitiges Setzen; Prerender rendert die Hülle ohnehin nicht |

---

## 12 · Abnahmekriterien H1 (die drei «5-Minuten-Punkte»)

Diese drei Punkte standen im Entwurf nur unter «Mitdenk-Hinweise» und werden erfahrungsgemäss
vergessen (Council A). Ohne sie gilt H1 als **nicht abgeschlossen**:

| # | Kriterium | Prüfung |
|---|---|---|
| ~~A-1~~ | ~~**`scrollAnker.ts`-Claim verifiziert.**~~ **ERLEDIGT UND GESTRICHEN** (Vorprobe 16.8.2026): die Behauptung war falsch. `scrollAnker.ts:134–137` sagt ausdrücklich das Gegenteil, und der dauerhafte Spiegel existiert und ist greppbar (`lesePosition.ts:54`/`:98`, Schlüssel `lexmetrik-leseposition`). | — |
| ~~A-2~~ | ~~**`#art_N` → `#art-` korrigiert.**~~ **ERLEDIGT** (Vorprobe 16.8.2026): die genannte Datei `02-referenzen.md` existiert im Repo nicht (Scratchpad); der einzige `#art_`-Treffer steht in eingefangenem Fedlex-Fremd-HTML (`docs/ux-audit-2026-07/fedlex/inspect.json`) und ist dort korrekt. Verbindlich bleibt `#art-<token>` (`inhalt-sprung.tsx:159`). | — |
| A-3 | **`EntscheidLeser.tsx:409` ist ausserhalb des Leser-Scopes** und wird in H1 mit angefasst (Guard-Parität für den Tab-Titel, Pos. 7). | **ERLEDIGT** in der Vorprobe dieses PRs. `EntscheidLeser.tsx` setzte `document.title` **ohne** Guard (so steht es bis heute auf `main`, Z. 408–411) — im Split-View trug der Browser-Reiter darum den Entscheid, obwohl das Hauptfenster das Gesetz zeigte (§8: der Reiter log über seinen Inhalt). Der Guard `if (rolle === 'sekundaer') return;` ist ergänzt und liegt unter der Quellensonde `src/tests/tab-titel-paritaet.test.ts`, die BEIDE Leser prüft. Im PR-Body benannt, wie die Zeile es verlangt. *(Selbstkorrektur 16.8.2026: der Vollzugsvermerk notierte hier zuerst «die Parität besteht bereits» — gemessen am Arbeitsbaum statt an `main`, also am Zustand NACH dem eigenen Fix. Der Befund war echt; die Nullprobe gegen die Basis fehlte.)* |
| **A-7** | **Abweichung, deklariert 16.8.2026 — der Pixelvergleich PX fehlt in H1.** Kap. 10 schreibt ihn «ab H1» vor; H1 liefert ihn NICHT. **Folge: H2.** Begründung: `toHaveScreenshot` ist im Repo bisher nirgends im Einsatz — die Flake-Basisrate eines Pixel-Tors auf diesem CI-Runner ist unbekannt, und ein Tor, dessen Ausfallrate man nicht kennt, erzeugt rote Läufe ohne Aussage (§0 Ziff. 3: Rate immer mit Messbedingung). Dazu kommt, dass die Baseline erst mit der Design-Grundlage **W-3** fachlich feststeht; eine Baseline, die S2 ohnehin neu setzt, in H1 einzufrieren hiesse, zweimal zu messen. In H1 tragen die DOM-Sonden und `check:linien-kanon` die Kern-Grenze. | Offen bis H2 — dort mit gemessener Flake-Rate (Stichprobe gegen die vermutete Rate dimensioniert, kalt **und** warm) |
| **A-8** | **Abweichung, deklariert 16.8.2026 — S-Breite.** Unter 1024 px zeigt V3 die Seitenleiste als **Sheet** statt als 15-rem-Spalte, wie sie `PANE_BREIT_PX` nahelegt. **Entscheid: H4.** Begründung: heute entscheiden zwei Quellen unabhängig über denselben Platz — `istXl` (Rahmen, 1024-px-Schwelle) und `kopfStufe` (Kopfzeile, 900/640 px). Eine dritte Schwelle in H1 einzuziehen, hiesse eine dritte Wahrheit über die Breite (§5). H4 führt **eine** Breiten-Quelle (`useElementBreite`) mit den Modi `d`/`s`/`sheet` ein; dort — und nur dort — wird die S-Breite entschieden. | Offen bis H4 |

---

## 13 · Was diese Fassung gegenüber dem Entwurf ändert

**Erste Runde (Council-Verdikt, 14 Änderungen).** (1) `imPane`-Baseline 38 → 102 Z./114
Vorkommen, Ziel neu «Kopf-/Layout-Verzweigungen 21 → 0» → Kap. 2/10 · (2) Option (B) →
(B-hybrid) mit Deploy-Dimension → Kap. 3 · (3) Etappen in Strang H und S → Kap. 7 · (4) N-e2e
doppelt (Flag/ohne Flag), Split-View als Test → Kap. 6/7 · (5) Suchlücke entfällt durch (III) →
Kap. 3, FL-5 · (6) Deckel 5 PRs, Flip-Kriterien, H5-Frist → Kap. 7 · (7) Test-Preis:
Flag-Projekt, CI ×2, B-Tests nur einmal → Kap. 10 · (8) R9/R10 neu, R3 umformuliert → Kap. 11 ·
(9) F1–F6 in Alltagssprache und als harte Vorbedingung → Kap. 9/7 · (10) HIG auf die acht
02b-Begriffe → Kap. 1.1/4 · (11) Grenze Hülle/Kern geschärft → Kap. 1.3 · (12) Bild-Bogen-Pfad
als S2-Vorbedingung → Kap. 8 · (13) Mitdenk-Punkte als H1-Abnahmekriterien → Kap. 12 ·
(14) Kantons-Probe je H-Etappe → Kap. 7. Zusätzlich: Kurzfassung für David, Flag-Regel
FL-1…FL-7, Vorprobe mit Nullprobe, Rot-Beweis und Basisrate.

**Zweite Runde (16.8., Auftrag David «bau das alles ein» + Roadmap-Sweep).** (15) **V-0
Klick-Prototyp** (echter StPO-Text, drei Breiten, Varianten A/B) als erster Schritt überhaupt →
Kap. 6, Kap. «Für David» · (16) **neue Frage F7** (Kopf mit/ohne Menü) samt Präzedenz-Prüfung
gegen A1/G2b → Kap. 9 · (17) **Nutzer-Massstab NM** — drei Aufgaben in Klicks/Sekunden als
Abnahme-Kriterium jeder Etappe und als Zielzahl-Zeilen → Kap. 7/10 · (18) **Panel-Nachladen**
in H3 mit `check:perf-budget`-Zahl und hartem **SEO-Prüfpunkt** → Kap. 7/10 · (19)
**Pixelvergleich PX** ab H1, Baseline-Wechsel nur in S2 → Kap. 7/10 · (20) **`DESIGN-D0` als
Vorbedingung V-D0 vor H1**, `DESIGN-D8a` mitgezogen → Kap. 6 · (21) **neues Kap. 14** —
Verhältnis zu dreizehn offenen Roadmap-Schritten.

---

## 14 · Verhältnis zu anderen offenen Roadmap-Schritten

> **Externe Referenzen (David 16.8.2026):** *legalviz.eu* (Maastricht Law & Tech, EU-Rechtsakte-Leser, React/Vite/Tailwind, GPLv3 — Code nicht übernehmbar, Ideen ja): ⌘K-Suche + Deep-Links und einklappbares Inhaltsverzeichnis (bereits im Plan), Rechtsprechung je Artikel (haben wir, Panel geht weiter), **Hervorhebung definierter Begriffe mit Legaldefinition** (Idee für später, nach H5; Extraktions-Risikopfad), **zweisprachiger Leser DE/FR** (später, hängt an FR/IT-Korpus W2·5g-ZEIT), PDF-Export ausgewählter Abschnitte (später, zu Zitat-Export). *eurlex2lexparency* (Python, MIT, EUR-Lex→Lexparency-Format): reines Daten-Konversionswerkzeug für Formex-XML — für Fedlex/Akoma-Ntoso nicht brauchbar, keine UI-Ideen. **Ergänzung 2 (David 16.8.2026) — *dejure.org*:** jede Vorschrift mit Querverweisen auf zugehörige Bestimmungen, die dazu ergangene Rechtsprechung und Literaturhinweise; Entscheid-Volltexte liegen NICHT auf der Plattform, sondern werden auf amtliche und nichtamtliche Quellen verlinkt. **Leitsatz für H3 und W2·6:** Nachweisdatenbank statt Volltextsammlung — das Panel zeigt Fundstellen (Gericht · Datum · Aktenzeichen · Regeste-Zeile) und verlinkt auf BGer/entscheidsuche.ch/kantonale Quelle; für ein kleines Projekt der einzig tragfähige Weg und lizenzrechtlich der saubere (vgl. Blocker `§4-lizenz`).

Sweep 16.8.2026 über `ROADMAP.md`. Alle IDs unten wurden im Plan verifiziert (Zeilennummern
angegeben). Zweck: V3 baut nicht neben laufenden Schritten her, und kein Schritt wird
stillschweigend doppelt gebaut (§17-Gegengewicht, Kollisionsregel).

### Absorbiert — diese Schritte werden von V3 miterledigt

| Schritt-ID | Bezug zu V3 | Etappe | Beim Bau abzuhaken |
|---|---|---|---|
| **`QS-UI-HIGHLIGHT`** (ROADMAP:210) — `::highlight()`-Registry je Leser-Instanz; heute löscht im Split-View das Rail-Suchfeld die Markierung des Nachbar-Panes | Genau der Defekt, den ein Suchfeld pro Pane erzeugt. V3 hat **ein** Suchfeld je Pane mit pane-eigener Registry | **H2** | Registry ist an die Pane-Wurzel gebunden (nicht global); e2e: Suche in Pane A löscht Markierung in Pane B **nicht**; danach `QS-UI-HIGHLIGHT` in ROADMAP als erledigt abhaken mit Zeiger hierher |
| **`W2·10-UI-NAV` / `B14`** (ROADMAP:434) — «Brotkrume, Kopfzeilen und Seitenmeta (K-19a)», 8 Befunde, davon 3 «hoch» | Deckungsgleich mit Pos. 1 (Kopfzeile) und Pos. 18 (Seitenmeta) | **H1** (Krume/Kopf) + **S3** (Seitenmeta) | Die **8 Befunde aus `FAHRPLAN-UI-BEFUNDE.md` §15 werden als Abnahme-Checkliste in den H1- bzw. S3-PR kopiert** *(Dateiname korrigiert 16.8.2026 beim S3-Bau: `FAHRPLAN-UI-NAVIGATION.md` hat kein §15 — die Befunde LM-181/183/184/188/197 stehen in UI-BEFUNDE)* und einzeln abgehakt — nicht «sinngemäss mitgemacht». Die 3 Hoch-Befunde sind Blocker der jeweiligen Etappe |
| **`W2·7-VZUI`** (ROADMAP:349) — Verzahnung sichtbar machen, Rest-Umfang am `KontextPanel` | H3 **ersetzt** das KontextPanel durch das V3-Panel | **H3** | Nach H3 prüfen, welche VZUI-Restzeilen inhaltlich noch offen sind; erledigte Zeilen in ROADMAP abhaken, Rest umformulieren — der Schritt darf nicht mit einer Komponente weiterleben, die es nicht mehr gibt |
| **`W2·7-VZUI-SACHGEBIET`** (ROADMAP:355) — Sachgebiet-Facette aus der BGE-Bandnummer | V3 sieht im Panel **den vierten Filter «Sachgebiet» baulich vor** (Platz, Reiter-Layout, Filterzeile) | **H3** (nur Hülle) | Filter-Platzhalter existiert und ist bei fehlenden Daten sauber ausgeblendet (kein leeres Steuerelement). **Die Datenlogik bleibt ausdrücklich `W2·7-VZUI-SACHGEBIET`** — Risikopfad mit Gegenprüfung, nicht Teil von V3 |
| **`QS-PERF`-Restposten** (ROADMAP:163) — Klickpfad Gliederungszeile **161 ms @4×**, Lese-Kadenz-TBT, langer Artikel-Index | Alle drei liegen in der Hülle, die V3 ohnehin neu setzt | **H1** (Messlatte) | Die 161 ms sind die **Messlatte, die H1 unterbieten muss — nicht nur halten**. Messung unter denselben Bedingungen (4× CPU-Drossel, kalt), Zahl im Kontaktbogen neben NM-1 |
| **Wording Anhang-Dominanz** — «N Artikel» im Erlass-Kopf ist falsch, wo Anhänge dominieren; richtig «Einträge» | Teil der Fakten-Zeile des neuen Erlass-Kopfs | **S3** | Kopf zählt und benennt korrekt; Wortlaut an **beiden** Stellen (`ErlassLeserKopf.tsx`, `seo-detail.ts`) — §5 wie beim Standausweis |
| **Flakes** `leser-weiterlesen-r4-r8`, `gesetze-historie-badge`, `leser-kontext-e4` | Alle drei prüfen Flächen, die V3 anfasst | **H4** (erste zwei) / **S1** (`gesetze-historie-badge`) | **Wurzel-Fix, kein Timeout und keine Retry-Erhöhung** (§17: dieselbe Störung darf keiner Folge-Session erneut Zeit kosten). Flip-Kriterium H4 nennt sie ausdrücklich |
| **Zitat-Export & Fussnoten-Ausgabe** | Braucht einen Ort in der Oberfläche | **nach H5** | Das V3-Panel **reserviert den Platz** (vierter Reiter oder Fusszeile im Reiter «Anzeige»), baut die Funktion aber nicht — Platz reservieren ist billig, Funktion nachrüsten teuer, umgekehrt nicht |

### Bewusst NICHT Teil von V3 — mit Begründung

| Schritt-ID | Warum draussen |
|---|---|
| **`W2·5g-ZEIT`** (ROADMAP:290) — Norm-Zeitmaschine + Fassungs-Diff | Kern und Extraktion, Risikopfad mit `QS-GP`; berührt `ArtikelBody.tsx` und die Snapshots. V3 ist Hülle — Vermischung würde die Treue-Tore in einen UI-PR ziehen |
| **`W2·5l-NORMTEXT-B2`** (ROADMAP:319) — Schlusstitel/UeB/Anhänge, wortgenaue Fussnoten | Ebenfalls Kern/Extraktion mit golden-Bindung |
| **`W2·13-KANTONE`** (ROADMAP:373) | **Nach H5.** V3 leistet jetzt nur die **Kantons-Probe** (jede H-Etappe gegen einen Kantons-Erlass), damit die neue Hülle kantonstauglich entsteht — der Ausbau selbst folgt auf der fertigen Hülle, nicht parallel dazu |
| **`W2·15-CLS`** (ROADMAP:408) — CLS-Defekt 0.109 @8× auf `/gesetze` | Betrifft die **Übersichtsseite** `/gesetze`, nicht den Leser (`src/pages/Gesetze.tsx`) — andere Fläche, eigener Schritt |
| **Leerfläche ~370 px am Ende von `/gesetze`** (ROADMAP:455) | Ebenfalls Übersichtsseite |

### Nebenfunde aus H2 (16.8.2026)

- **`Ä13` · Korpus-Datenqualität, NICHT V3.** Die VMWG-Gliederung zeigt
  «Art. 6b — b Bezug…» — der Randtitel-Buchstabe steht doppelt. Das ist ein
  Extraktions-/Datenbefund und gehört an **`QS-KORPUS`**, nicht in eine
  Hüllen-Etappe: V3 malt, was im Sidecar steht.
- **`QS-UI-HIGHLIGHT` ist mit H2 erledigt** — Registry-Buchführung je
  Leser-Instanz in `suchHighlight.ts`, Rot-Beweis in
  `src/tests/suchHighlight.test.ts`, Browser-Beweis in
  `e2e/leser-v3-highlight-split.e2e.ts`. **Rest, bewusst offen:** zwei
  ENTSCHEID-Panes teilen weiterhin eine Modul-Instanz (unverändert gegenüber dem
  Vorzustand, ausserhalb des gemeldeten Befunds).

- **`Ä24` · Shard-7-Rot auf dem OR ist KEIN H2-Defekt — die Wurzel liegt auf
  `main` und gehört an `QS-PERF`.** Gemessen 17.8.2026 (Diagnose-Auftrag zu
  PR #539); der Ausgangsverdacht lautete: «H2 hat die V1-Hülle auf dem grossen
  OR verlangsamt» (Kandidaten S4-Sortierung, Highlight-Registry, Trefferliste).

  **Symptom.** Im Projekt `chromium` (= OHNE Flag = eingefrorene V1-Hülle) fielen
  `e2e/leser-ohne-gliederungslinie.e2e.ts:71` (OR Art. 319, hart rot über alle
  drei Versuche) und `e2e/leser-r1-r2.e2e.ts:544` (OR-Suchmodus, flaky). **Beide
  scheiterten NICHT an ihrer Sachaussage**, sondern an der Bereitschaft der
  Seite: «element(s) not found» nach 20 s auf
  `getByRole('button', {name:'Ansicht'})` bzw. `[data-treffer-leiste]`. Die
  eigentlichen Aussagen (keine Gliederungslinie, kein Massen-Remount) wurden nie
  erreicht — das Tor fiel im Vorraum.

  **Nullprobe (§0 Ziff. 3a) — zwei unabhängige, beide negativ.**
  (i) *Gleiche Bytes, einmal grün, einmal rot:* Run `31973757595` auf `f54ff49aa`
  war vollständig grün, Run `31974377602` auf `eca91b2b2` auf Shard 7 rot.
  Zwischen beiden liegen **30 Zeilen `.claude/`-Doku und sonst nichts**
  (`git diff --stat f54ff49aa eca91b2b2`). So verhält sich kein deterministischer
  Code-Defekt.
  (ii) *Lokales A/B Branch gegen Merge-Base:* Zeit bis der «Ansicht»-Knopf auf
  `/gesetze/bund/OR#art-319` sichtbar ist, zwei getrennte `vite preview`-Server
  auf demselben Rechner, je 11 Messungen.

  **Verteilung (§0 Ziff. 3b) — der Messwert ist ZWEIGIPFLIG, und beide Gipfel
  stehen in beiden Armen:**

  | Arm | schneller Gipfel | langsamer Gipfel | Anteil langsam |
  |---|---|---|---|
  | Branch (H2) | 8.9–9.3 s, Median **9.19 s** | 14.9–16.5 s, Median **15.82 s** | 7/11 |
  | `main` (Merge-Base) | 8.4–9.5 s, Median **8.87 s** | 15.8–17.2 s, Median **15.97 s** | 5/11 |

  **Innerhalb desselben Gipfels sind die Arme ununterscheidbar:** +321 ms
  (+3.6 %) im schnellen, −148 ms (Branch SCHNELLER) im langsamen — die Vorzeichen
  widersprechen einander, was gegen jeden gerichteten Effekt spricht. Der
  Unterschied der Roh-Mediane entsteht allein daraus, wie oft der langsame
  Zustand eintrat; 7/11 gegen 5/11 ist bei dieser Stichprobe keine Aussage. Der
  Sprung zwischen den Gipfeln beträgt **~6.8 s**, rund das Zwanzigfache des
  grössten Arm-Unterschieds: **der Featureanteil verschwindet in der Streuung.**

  **Messbedingung (§0 Ziff. 3c).** macOS, Apple Silicon, `dist` aus
  `npm run build`, `vite preview`, je Messung ein frischer Browser-Kontext,
  ungedrosselt, Rechner unbelastet. Die erste Reihe lief mit beiden Armen
  GLEICHZEITIG und ist nur als Kontrolle geführt; die Tabelle poolt sie mit einer
  zweiten, streng sequenziellen Reihe — beide zeigen dieselben zwei Gipfel, mit
  vertauschten Anteilen. CI ist ein 2-Kern-Linux-Runner mit `workers: 1`.

  **Gegenprobe unter CI-naher Last (`Emulation.setCPUThrottlingRate: 4`, je n=3).**
  Sie zeigt den Ausfall direkt, statt ihn hochzurechnen: Branch **46,5–49,7 s**,
  `main` **32,8–47,4 s** — beide Arme reissen das 20-s-Budget um das 2,3- bis
  2,6-Fache, und die grösste Einzelstreuung steht auf `main`, nicht im Branch.
  Ohne Hash dasselbe Bild (Branch 45,2–46,3 s, `main` 50,2–52,0 s; hier ist `main`
  der langsamere Arm). Damit ist die Arm-Unabhängigkeit unter genau der Bedingung
  belegt, unter der CI rot wurde.

  **Wurzel.** Der Leser braucht auf dem OR (2038 Artikel) **8.4–17.2 s bis zur
  Bedienbarkeit — auf einem schnellen, unbelasteten Rechner**. Die Spec gewährt
  20 s. Der langsame Gipfel liegt damit schon lokal bei 86 % des Budgets; auf dem
  CI-Runner reisst er es. Das Tor misst folglich nicht mehr seine Sachaussage,
  sondern die Tagesform des Runners. Zwei Nebenbefunde: (a) die Hash-Form der
  Adresse ist NICHT die Ursache — `/gesetze/bund/OR` ohne `#art-319` zeigt
  dieselbe Zweigipfligkeit; (b) die grüne CI-Historie von `main` ist **kein**
  Gegenbeweis: in 5 der 7 letzten `main`-Läufe war Shard 7 nach 4 s fertig, weil
  die Diff-Klassierung ihn als `art=doku` übersprang.

  **Was daraus NICHT folgt.** Kein Timeout-Anheben und keine Test-Lockerung in
  H2 — beides maskierte genau die Zahl, die hier belegt ist. Die Ursache
  (Erst-Render/Hydration des OR und die Herkunft des ~6.8-s-Sprungs zwischen den
  Gipfeln) ist ein Perf-Thema der Ist-Hülle und liegt ausserhalb der H2-Fläche.

  **Übergabe.** Gehört an **`QS-PERF`** (Erst-Render OR) und schliesst den
  ausdrücklich offen gelassenen Punkt (b) von `QS-E2E-STABIL` — «`leser-r1-r2`-
  Wurzel per CI-Forensik, kein UI-Bau ins Blaue, nicht per Timeout maskieren».
  Die Forensik ist hiermit geliefert, der Bau steht aus.

### Kollisionshinweis für die Folge-Session

`W2·10-UI-NAV`, `W2·7-VZUI`, `W2·13-KANTONE` und `QS-PERF` führen `src/pages/gesetz-leser` bzw.
`GesetzLeser.tsx` in ihrer `kollision:`-Liste — solange V3 läuft, ist die Fläche belegt. Vor
jedem dieser Schritte gilt die Drei-Sonden-Prüfung (offene PRs · fremde Remote-Branches ·
Worktrees); im Zweifel wartet der andere Schritt.
