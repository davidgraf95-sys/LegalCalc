# FAHRPLAN-LESER-V3 — Gesetz-Leser V3 (Hülle neu, Kern unangetastet)

Endfassung 16.8.2026 nach Council-Review. Grundlage: Auftrag David 16.8.2026 (19 Positionen),
Ist-Inventar (main @ d6faa05c5), Referenz-/HIG-Recherche, Standausweis-Prüfung, Council-Antworten
A–E + R1–R3 + Advocatus, Council-Verdikt (Option III Hybrid, 14 Plan-Änderungen).
Entwurfsfassung liegt im Scratchpad (`04-plan-leser-v3.md`) und ist damit **abgelöst**.

> **Achtung, Prozess-Kopplung (nicht ignorieren):** `scripts/plan/check.ts:302` verlangt, dass
> **jede** `FAHRPLAN-*.md` in `fahrplaene/` aus `ROADMAP.md` verlinkt ist. Diese Datei ist es
> noch **nicht** — `check:plan` läuft rot, bis ein `fahrplan: fahrplaene/FAHRPLAN-LESER-V3.md`
> im `@meta` eines ROADMAP-Schritts steht. Das Anlegen dieses Schritts war nicht Teil des
> Auftrags und ist der **erste** Handgriff der nächsten Session.

---

## Für David — Kurzfassung in Alltagssprache

**Was wir machen.** Der Gesetzestext selbst (Wortlaut, Fussnoten, Stand, Quelle) wird **nicht
angefasst**, neu gebaut wird nur das Drumherum — und zwar **neben** dem Alten: per Adresszusatz
`?leser=v3` schaltest du um und vergleichst. Erst auf dein «so ist es besser» wird umgestellt.

| Etappe | Du siehst … |
|---|---|
| H1 | eine aufgeräumte Kopfzeile (Ort · Artikel · ein Menü) und eine Seitenleiste mit **einem** Feld, in das du entweder ein Suchwort oder «Art. 429» tippst. |
| H2 | Suchtreffer in der Reihenfolge des Gesetzes statt kreuz und quer, gruppiert je Artikel — und das Schliessen der Suche wirft dich nicht mehr im Gesetz herum. |
| H3 | ein eigenes Fenster für Rechtsprechung mit Trefferzahl, statt Entscheid-Zeilen unter jedem Artikel. |
| H4/H5 | dasselbe wie H3, aber ohne Adresszusatz — die neue Ansicht ist ab jetzt die normale; danach verschwindet der alte Code (der eigentliche Aufräum-Gewinn). |
| S1 | den Schalter «Änderungsvermerke» wirkt endlich vollständig: bei «aus» bleibt keine Spur mehr im Lesetext. |
| S2 | den Gesetzestext in neuer Schriftgrösse und neuem Zeilenmass — und gleichmässige Abstände zwischen Artikeln, egal was ein-/ausgeblendet ist. |
| S3 | einen aufgeräumten Erlass-Kopf: Fakten, Stand, Warnung, Aktionen sauber getrennt und in verständlicher Sprache. |

**Reihenfolge und erster Anblick.** H1 → H2 → H3 → H4 (Umstellung) → H5 (Löschung); die kleinen
S-Etappen laufen dazwischen, sobald du die zugehörige Frage beantwortet hast. Etwas Neues siehst
du schon nach dem **ersten** gelandeten PR (H1) auf der echten Seite über `?leser=v3` — ohne
diesen Zusatz sieht jeder andere weiterhin exakt das Heutige; kein Zwischenzustand geht je live.

**Was du entscheiden musst** (Details Kap. 9; jede Etappe wartet auf ihre Frage):

| Frage | Dann sieht der Nutzer … | Empfehlung |
|---|---|---|
| F1 Den dritten Historie-Modus «Chronologie» streichen? | … nur noch «Änderungsvermerke: an/aus» statt drei Wahlmöglichkeiten für dieselbe Information. | **Ja** |
| F2 Den Schalter «Verweise» streichen? | … keinen Unterschied — der Schalter wirkt heute nur auf eine gepunktete Linie, die erst beim Darüberfahren mit der Maus erscheint. | **Ja** |
| F3 Schriftbild-Variante V1 oder V2? | … bei V1 grössere, luftigere Zeilen (19 px, kürzere Zeilen); bei V2 ein kompakteres, amtsnäheres Bild (17 px). Du entscheidest **nach** dem Bildvergleich. | **V1** |
| F4 Entscheide unter dem Artikel nur noch als Zähler («14 Entscheide») statt als Zeilen? | … einen ruhigen Gesetzestext; die Entscheide stehen einen Klick entfernt im Seitenfenster, keiner geht verloren. | **Ja** |
| F5 Standausweis-Wortlaut ändern? | … statt «geltend geprüft am 14.08.2026» neu «gegen Fedlex-Konsolidierung geprüft am 14.08.2026» plus einen Klartext-Satz, wenn Fedlex einer geltenden Änderung hinterherhinkt. | **Ja** |
| F6 Blätter-Pfeile zum nächsten Artikel? | … einen zusätzlichen Knopf — mehr Bedienung, nicht weniger. | **Nein, später** |

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
| K3 | **Optionsvielfalt ohne Bedarfsnachweis:** 24 Grundkombinationen. Der Schalter «Verweise» wirkt nachweislich nur auf die gepunktete Unterstreichung **bei :hover**. | `leserOptionen.ts:88,122,182`; `index.css:468-472` | F2. |
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

**Entscheid: (III).** Die eine Frage, an der der Entwurf scheiterte, lautete: *Kann die
Fundament-Etappe die `imPane`-Weberei auflösen, ohne Scroll- und Hash-Logik anzufassen?* Die
Antwort ist nachweislich **nein** — nicht wegen der Etappe, sondern weil rund 30 der
Fundstellen korrektes Scoping sind, das in **jeder** Option bleiben muss. Damit ist das alte
Ziel («≤ 8 Fundstellen») unerreichbar und wird ersetzt (Kap. 10). Gleichzeitig zeigt die
Messung, dass der Umstieg billiger ist als befürchtet: die Fassade ist **8 Zeilen**, beide
Panes laufen hindurch, und die Hooks sind bereits als Funktionen mit Prop-Signaturen extrahiert
(`useLeserDaten`, `useLeserSprungSpy`, `useSektionSprung`, `useInternRefs`, `useWeiterlesen`,
`useSuchTreffer`, `useLeserZustand`) — eine neue Hülle **importiert** sie, statt sie neu zu
schreiben. Genau das trennt (III) von (II).

**Was wir dafür verlieren** (stärkste Gegenstimme, bewusst stehen gelassen): Für die Dauer des
Fensters existieren zwei Hüllen — das widerspricht dem Buchstaben von §5 und Davids «bau nicht
auf Neuem auf». Jede Korrektur an der alten Hülle im Fenster ist verlorene oder doppelte
Arbeit. Das Flag ist neue Steuerung (§17-Gegengewicht) und muss in H5 mit verschwinden. Die
Leser-e2e laufen im Fenster doppelt (CI-Minuten). **Ohne harten Flip- und Löschtermin wäre
(III) schlechter als (I)** — deshalb Deckel und H5 als Pflicht, nicht als Option.

---

## 4 · Skizze «Leser V3»

Drei Breiten: **H** Handy ≤ 640 px · **D** Desktop ≥ 1024 · **S** Split-View halbe Breite
(≈ 620–760 px). HIG-Tags ausschliesslich aus den acht Begriffen von Kap. 1 Ziff. 1.

### (a) Kopfzeile — ein Vertrag für alle drei Breiten

```
D  ┌────────────────────────────────────────────────────────────────────────┐
   │ Gesetze › StPO            Art. 429                      Ansicht ▾   ✕ │
   └────────────────────────────────────────────────────────────────────────┘
S  ┌──────────────────────────────────────────┐  (identisch, Krume gekürzt)
   │ StPO      Art. 429            Ansicht ▾ ✕│
   └──────────────────────────────────────────┘
H  ┌──────────────────────────────┐
   │ StPO · Art. 429    ☰   ···  ✕│   ☰ Gliederung-Sheet · ··· Ansicht
   └──────────────────────────────┘
```

| Element | Entscheid | HIG (8er-Kanon) |
|---|---|---|
| Brotkrume + Live-Artikel | behalten — einzige Ortsangabe | **Simplicity** (Hierarchie: «wo bin ich») |
| Suchfeld | raus → Seitenleiste (Pos. 4) | **Familiarity** (Suche steht bei der Struktur) |
| Menü «Rechtsprechung ▾» | raus → Panel (Pos. 3) | **Simplicity** |
| Chip «Stand …» | raus → Erlass-Kopf (Pos. 18) | **Responsibility** (eine Stand-Wahrheit an einem Ort) |
| Menü «Ansicht ▾» | behalten, 3 Schalter | **Agency** |
| Overflow-Regel | unter 900 px fällt zuerst «Gesetze», dann der Volltitel; **nie** der Artikel, nie «Ansicht»; auf H wandert «Ansicht» ins `···` | **Flexibility** |
| Split-View | derselbe Baustein, nur schmaler; `data-such-bar` entfällt (K1) | **Familiarity**, **Flexibility** |

### (b) Seitenleiste — feste Reihenfolge, nur der Baum ist sticky

```
D/S ┌── Spalte links (≈ 18rem D / 15rem S) ──────────────┐
    │ ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)       │  scrollt MIT weg
    │ [ Suchen oder «Art. 429» …                    ⌘K ] │  scrollt MIT weg
    │ Gliederung          [alles auf/zu]   [↑ Anfang]    │  ◀ ab hier sticky
    │  1. Teil … / 1. Titel …                            │
    └────────────────────────────────────────────────────┘
H   Gliederung + Suchfeld als Bottom-Sheet hinter ☰; «↑ Anfang» schwebt unten
    rechts, mit Text-Label, erst ab > 4 Bildschirmhöhen (NN/g).
```

| Element | Entscheid | HIG |
|---|---|---|
| **Eine** Übersichtsbox, nicht sticky (Fedlex hat drei) | neu (Pos. 10) | **Simplicity** |
| **Ein** Feld für Suche und Sprung — «Art. 429» erkennt `loeseArtikelEingabe` (`suchTreffer.ts:38-42`) und springt, sonst Volltextsuche | neu, löst K2 | **Simplicity**, **Agency** |
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
D  Text ───────────────────────┐ ┌── Panel rechts (≈ 22rem, einklappbar) ──┐
                               │ │ [Entscheide] Änderungen  Materialien     │
                               │ │ Filter: Instanz ▾ Kanton ▾ Zeit ▾        │
                               │ │ BGE 148 IV 22 · 14.03.2022 …             │
S  Panel wird zum Sheet über dem Pane — Regel: NIE drei vertikale Flächen.
H  Bottom-Sheet, ein Schliessweg.
```

| Element | Entscheid | HIG |
|---|---|---|
| Drei Reiter statt sechs bedingter Sektionen (`KontextPanel.tsx` 765 Z.) | umbauen | **Simplicity** |
| Facetten Instanz/Kanton/Zeit ziehen aus dem Kopf-Dropdown ins Panel — dorthin, wo ihr Ergebnis steht | umziehen | **Agency** |
| Trefferzahl am Öffner | neu (Pos. 3) | **Familiarity** (Zustand sichtbar) |
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
| Titel + SR + Artikelzahl = Fakten, eine Zeile | neu | **Simplicity** |
| **Eine** Stand-Zeile statt bis zu neun Chips | neu | **Simplicity** |
| Warnung nur bei zutreffendem `nichtKonsolidiert`, in Klartext; betrifft heute **5 von 227** Erlassen (BGG, BMV, FZA, STPO, TXG) | neu | **Responsibility** |
| Aktionen in eigener Zeile | neu | **Familiarity** |

### (f) Zustände & Persistenz — Zielbild

| Option heute | Werte | Entscheid | Begründung |
|---|---|---|---|
| `fussnoten` | an/aus | **behalten** | amtlicher Apparat; David-Entscheid A1 |
| `histansicht` | aus/fussnoten/chronologie | **auf 2 Werte** (an/aus) | dritter Modus für dieselbe Information; **Vorbedingung F1** |
| `verweise` | an/aus | **streichen** | wirkt nur auf die Hover-Unterstreichung (`index.css:468-472`); **Vorbedingung F2** |
| `leitfaelle` | an/aus | **umwidmen** → «Rechtsprechung im Text: an/aus» | Facetten wandern ins Panel |
| Facetten Klasse/Kanton/Zeit | Mehrfachwahl | **umziehen** ins Panel | Ort statt Anzahl |
| `lesePosition`, `PANES_KEY` | — | **behalten** | Rückkehr an die Lesestelle; Split-Vertrag |

Ziel: **3 zweiwertige Schalter** (Fussnoten · Änderungsvermerke · Rechtsprechung) → **8 statt 24
Kombinationen**. **Migration:** gespeichertes `histansicht:"chronologie"` liest V3 als `"an"`;
unbekannte Werte fallen auf den Default (Vitest-Fall Pflicht).

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

## 6 · Vorprobe H1 — bevor irgendetwas gebaut wird

Erst **ein** Schritt, ohne Produkt-Code, im Scratchpad zu belegen: dass die 8-Zeilen-Fassade als
Schaltpunkt für Einzelansicht **und** beide Panes trägt. Aufbau: Fassade liest Flag →
`GesetzLeserInhalt` (Ist) oder `GesetzLeserV3` (zunächst ein **leerer** Rahmen, der
`ArtikelLeser` und die bestehenden Hooks importiert); dazu das Playwright-Flag-Projekt.

| Schritt | Prüfung | Erwartung |
|---|---|---|
| **V-1 Nullprobe zuerst** | Flag **aus**: `bash scripts/gate.sh voll` + alle 41 Leser-/Gesetze-e2e + `golden:vergleich` + `split-view-a34` | **alles unverändert grün.** Rot hier ⇒ der Defekt liegt auf `main`, nicht am Vorhaben — Diagnose stoppt, bevor irgendetwas dem Umbau zugeschrieben wird |
| **V-2 Tor kann scheitern (§6.7)** | Flag **an**, drittes Playwright-Projekt `leser-v3` neben `schwer`/`chromium` (`playwright.config.ts:118,123`): dieselben 8 N-Tests gegen den V3-Rahmen | **mindestens einer muss zuerst ROT sein** (leerer Rahmen), dann grün, sobald `ArtikelLeser` eingehängt ist. Ohne diesen Rot-Beweis ist das Flag-Projekt ein Tor, das nicht scheitern kann — dann ist die gesamte Paritäts-Aussage wertlos |
| **V-3 Basisrate statt Schätzung** | Zwei Zahlen aus dem Repo-Verlauf holen: (a) wie viele «Rückbau-zuletzt»-Etappen bisheriger Fahrpläne tatsächlich gelandet sind (Streichquote), (b) wie viele Etappen bisherige Leser-Fahrpläne real pro Woche schafften | daran den **Deckel von 5 PRs kalibrieren**; weicht die Basisrate stark ab, wird der Deckel angepasst **bevor** gebaut wird, nicht während |

**Ohne bestandene Vorprobe wird H1 nicht begonnen.**

---

## 7 · Etappenplan — zwei Stränge

**Strang H** (Hülle, hinter Flag, sequenziell) · **Strang S** (geteilte Schicht, in place,
klein, je an eine David-Entscheidung gebunden; wirkt in **beiden** Hüllen).

**Regeln für jede Etappe:** 1 PR · sortenrein UI · Vorher/Nachher-Kontaktbogen ·
`gate voll` · `golden` byte-gleich · `check:linien-kanon` Teil A · `check:perf-budget` ·
axe-e2e · **N-e2e laufen im Flag-Projekt gegen V3 UND ohne Flag gegen den Ist-Stand** ·
**Split-View ist ein Test, kein Screenshot** (`leser-kopf-paritaet` prüft beide Panes) ·
**Kantons-Probe**: je ein Bund- und ein Kantons-Erlass unter Flag.

### Strang H

| E | Inhalt | Dateien (neu / entfernt / behalten) | Zeilenbilanz | B-Tests neu | Abnahme-Kriterium (ein Satz) | Aufwand |
|---|---|---|---|---|---|---|
| **H1** | **Fassaden-Flag + `LeserRahmenV3` + `LeserKopf` + Seitenleisten-Skelett mit Such-/Sprungfeld** — Pos. 1, 2, 4, 6, 7, 10, 15, 16; **sichtbar ab dem ersten PR** | neu: `GesetzLeserV3.tsx`, `LeserRahmenV3.tsx`, `LeserKopf.tsx`, `LeserSeitenleiste.tsx`, `SuchSprungFeld.tsx`, Playwright-Projekt `leser-v3` · entfernt: nichts (alter Baum eingefroren) · behalten: **alle Hooks unverändert importiert**, `ArtikelLeser`, `ArtikelBody`, `tocAutoZuklappen`, `leserSuche` | +900 / −0 | 4: `leser-kopf-paritaet` (beide Panes), `leser-v3-suche-sprung`, `leser-v3-seitenleiste-ordnung`, `leser-v3-umschalten` (FL-6) | Unter `?leser=v3` steht in beiden Panes derselbe Kopf, ein Feld sucht **und** springt, das Umschalten V1↔V3 hält die Leseposition — und ohne Flag ist der Ist-Stand bitgleich unverändert. | **L** |
| **H2** | **Suchverhalten** — Pos. 5 (UI-Seite), 14 | geändert: `TrefferListe`-Nachfolger in V3, Sprung-Offset gegen die Sticky-Höhe | +200 / −0 | 3: `leser-v3-treffer-reihenfolge`, `leser-v3-esc-ohne-sprung`, `leser-v3-treffer-mobil` | Treffer stehen in Erlass-Reihenfolge je Artikel gruppiert, und ✕/Esc bewegen den Scroll um 0 px. | **M** |
| **H3** | **Panel/Sheet für Rechtsprechung + Kontext** — Pos. 3, 12, 17; **Vorbedingung F4** | neu: `LeserPanel.tsx` (3 Reiter) · behalten: `bezuegeLaden`, `bezugAuswahl`, `bezugZeit`, `bezugPortion` (Datenlogik unverändert) | +450 / −0 | 3: `leser-v3-panel-facetten`, `leser-v3-panel-zaehler`, `leser-v3-kontext-cls` | Jeder Entscheid, der heute unter einem Artikel erreichbar ist, ist über Zähler → Panel erreichbar, in beiden Panes, ohne dritte vertikale Fläche. | **L** |
| **H4** | **Flip** — Flag-Default auf **an**; alte B-Tests gegen die alte Hülle löschen bzw. auf V3 umhängen | geändert: Fassade (Default), `playwright.config.ts` | ±0 | 0 neu (11 alte B-Tests werden entfernt/umgehängt) | Alle acht unveränderten N-Tests, `leser-kopf-paritaet`, CLS ≤ Ist-Stand und axe sind unter dem neuen Default grün, und David hat nach Kontaktbogen zugestimmt. | **M** |
| **H5** | **Löschung der alten Hülle + Flag** — Pos. 9 | entfernt: alte Hüllen-Dateien ohne eingehende Referenz, `inhalt-kopfmeldung.tsx`, `data-such-bar`-Pfad, `LeserMenuPaar`, `LeserRechtsprechungMenu`, Flag-Code, tote `data-linien`-Kommentare (`inhalt-zustand.tsx:365`, `leserOptionen.ts:9-15`) | **−2 500 bis −3 200** | 0 neu | Jede gelöschte Datei hat den Nichttrage-Nachweis **vor** der Löschung, alle Tore sind grün bei byte-gleichem Golden, und im Repo existiert kein Flag-Code mehr. | **M** |

### Strang S (in place, wirkt in beiden Hüllen)

| E | Inhalt | Vorbedingung | Tests | Abnahme-Kriterium | Aufwand |
|---|---|---|---|---|---|
| **S1** | Optionen-Rückbau: Historie zweiwertig, «Fassung»-Overline an denselben Schalter, «Verweise» streichen, Migration alter Werte (Pos. 8) | **F1 + F2 schriftlich «ja»** | **2 N neu**: `hist-ansicht-w25i`, `gesetze-historie-badge`; `leser-optionen` bleibt grün; Vitest-Migration | «Änderungsvermerke: aus» lässt keine Historie-Spur im Lesekörper zurück, und der DOM bleibt vollständig. | **S** |
| **S2** | Artikel-Raster (Beiwerk-Zone) + Typografie-Tokens (Pos. 13, 19) | **F3 entschieden, nach Bild-Bogen** (Kap. 8) | 2: `leser-breite-a37`, `leser-lesemass` | Das Umschalten aller drei Schalter erzeugt an keinem Artikel einen Layout-Sprung, und der Satzspiegel entspricht der von David gewählten Variante. | **M** |
| **S3** | Erlass-Kopf + Standausweis-Wortlaut (Pos. 11, 18) | **F5 «ja»** | 3 Vitest + 1 e2e-Wortlaut; `aufhebung-kopf` bleibt grün | UI-Kopf und prerenderter SEO-Kopf tragen **denselben** neuen Wortlaut, und die Warnung erscheint genau bei den fünf betroffenen Erlassen. | **S/M** |
| **S4** | Sortierung der Suchtreffer auf Erlass-Reihenfolge (`leserSuche.ts:390-393`) | keine | Vitest an der Sortierfunktion; `leser-r1-r2`, `leser-suche-vertrag-b8` bleiben grün | Die Sortierfunktion liefert Dokumentreihenfolge als Primärschlüssel, bewiesen ohne Browser. | **S** |

### Fenster-Deckel und Flip-Kriterien

| Regel |
|---|
| **Höchstens 5 H-PRs bis einschliesslich H4.** H1–H3 sind drei; zwei PRs bleiben als Puffer für Nachbesserungen. Wird der Deckel gerissen, folgt ein **Abbruch-Review** (Rückbau des Flags und Rückfall auf In-Place-Etappen), keine stillschweigende Verlängerung. |
| **Flip-Kriterien für H4 (alle, nicht auswählbar):** die acht unveränderten N-Tests grün unter Flag · `leser-kopf-paritaet` grün · CLS ≤ Ist-Stand · axe grün · Kantons-Probe grün · David-Go nach Kontaktbogen. |
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

**Pos. 8 im Klartext.** Der Modus «Chronologie» entfällt; der Schalter heisst «Änderungsvermerke:
an/aus». Bei «aus» verschwinden Marker, Apparat-Zeile **und** die «Fassung»-Overline gemeinsam.
Der Sichtbarkeits-Wächter (§8) ist gewahrt, weil (a) der Normtext unberührt bleibt, (b) alle
Historie-Texte im DOM verbleiben und über «an» samt Ctrl+F wiederherstellbar sind, (c) die
Historie-Zeile im Repo ausdrücklich als *abgeleitete Metadaten, kein Wortlaut* geführt wird
(`ArtikelLeser.tsx:603-604`, `data-such-meta`). Präzedenz ist David-Entscheid A1 vom 5.7.2026.

**Pos. 11/18 im Klartext.** Kein Software-Fehler: alle drei heutigen Anzeigen sind für sich wahr,
aber «geprüft am 14.08.2026» liest sich für Laien wie «alles aktuell», obwohl gleichzeitig ein
Passus fehlt. Neu: Chip «gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)» plus
Klartext-Warnzeile nur bei `nichtKonsolidiert` mit `dateEntryInForce ≤ heute`. **§5-Pflicht:**
derselbe Wortlaut steht an zwei Stellen (`ErlassLeserKopf.tsx:79`, `seo-detail.ts:269`) — beide
im **selben** PR, sonst zwei Wahrheiten; zusätzlich die Kommentar-Referenzen `index.css:867,909`.

---

## 8 · Typografie-Varianten (Pos. 19, entscheidet S2)

| Kennwert | Ist | **V1 «ruhiger Satzspiegel»** | **V2 «amtsnah kompakt»** |
|---|---|---|---|
| Fliesstext | `text-body-l` 1.125 rem / lh 1.6, Override `leading-[1.65]` (`ArtikelLeser.tsx:563`) | 1.1875 rem (19 px) / lh 1.7 | 1.0625 rem (17 px) / lh 1.55 |
| Lesemass | `max-w-normtext` 42 rem ≈ 70–72 ch | 40 rem ≈ 64–66 ch | 42 rem ≈ 76 ch |
| Marginalie/Randtitel | Stufen nach `gesetze-marginalie` | 0.875 rem, Serif, ink-600 | 0.8125 rem, Sans, ink-600 |
| Titelstufen | h3 20 / h2 25.6 / h1 32 (`tailwind.config.js:59-60`) | 20 / 24 / 30, Overline in Kapitälchen | unverändert |
| Absatzziffern (¹ ² ³) | inline | **hängend** in der Marge, ink-500 | inline, halbfett |
| Fussnotenmarke | hochgestellt, klassenabhängig | 0.72 em hochgestellt, ohne Klammer | in runden Klammern, 0.8 em |
| Fussnoten-Body | `text-micro` 0.6875 rem / lh 1.2 | 0.75 rem / lh 1.45 | 0.6875 rem / lh 1.3 |
| Einzug je Stufe | 20 px, max 5 Stufen | unverändert | unverändert |
| WCAG 1.4.8 (≤ 80 ch, lh ≥ 1.5) | erfüllt | erfüllt | erfüllt (76 ch, lh 1.55) |

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

Keine Etappe startet ohne ihre Vorbedingung. Fehlt der Entscheid, wartet die Etappe — sie wird
**nicht** «auf Verdacht nach Empfehlung» gebaut (Council A/D: sonst liegt ein fertiger
Test-Rewrite vor, den David kippen könnte).

| # | Frage in Alltagssprache | Konsequenz «dann sieht der Nutzer …» | Empfehlung | Blockiert |
|---|---|---|---|---|
| **F1** | Heute gibt es drei Einstellungen dafür, wie Änderungsvermerke im Gesetzestext erscheinen (aus / bei den Fussnoten / als datierte Liste). Auf zwei reduzieren? | … nur noch «Änderungsvermerke: an/aus». Die datierte Liste entfällt; die Information selbst geht nicht verloren, sie steht dann bei den Fussnoten. | **Ja** — dritter Modus für dieselbe Information; er kommt als eigener Schritt zurück, falls Bedarf entsteht | **S1** |
| **F2** | Der Schalter «Verweise» soll weg. | … keinen Unterschied im Alltag: der Schalter wirkt heute nur auf eine gepunktete Linie unter Querverweisen, die ohnehin erst beim Darüberfahren mit der Maus erscheint. Farbe, Klickbarkeit und Ctrl+F bleiben in jedem Fall. | **Ja** | **S1** |
| **F3** | Zwei Schriftbilder für den Gesetzestext stehen zur Wahl. | … bei **V1** grössere Schrift und kürzere Zeilen (ruhiger, mehr Weissraum); bei **V2** ein kompakteres Bild, näher am amtlichen Fedlex-Aussehen (mehr Text pro Bildschirm). | **V1** — Entscheid aber **erst nach** dem 18-Bilder-Vergleich (Kap. 8); vorher ist die Empfehlung unverbindlich | **S2** |
| **F4** | Unter jedem Artikel stehen heute scrollbare Zeilen mit Gerichtsentscheiden. Ersetzen durch eine leise Zeile «⚖ 14 Entscheide →», die ein Seitenfenster öffnet? | … einen ruhigen Gesetzestext ohne Entscheid-Zeilen; ein Klick auf den Zähler öffnet das Fenster mit allen Entscheiden samt Filtern. Kein Entscheid wird unerreichbar. | **Ja** | **H3** |
| **F5** | Der Standausweis im Erlass-Kopf soll neu formuliert werden. | … statt «geltend geprüft am 14.08.2026 (maschinell)» neu «gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)» — und dort, wo es zutrifft, den Klartextsatz «Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text eingearbeitet». Heute betrifft das fünf Erlasse. | **Ja, beides** — der Chip sagt, *was* geprüft wurde, die Warnzeile, *was trotzdem fehlt* | **S3** |
| **F6** | Blätter-Pfeile «voriger/nächster Artikel» aufnehmen? | … einen zusätzlichen Knopf im Kopf oder am Artikelfuss — bequem beim Durchlesen, aber ein Element mehr statt weniger. | **Nein, nicht in V3** — nach der Landung als eigener kleiner Schritt bewerten | — |

---

## 10 · Test-Preis, Treue-Grenze und Zielzahlen

### Test-Preis

| Kategorie | Bestand | Wirkung |
|---|---|---|
| e2e **N** (Normtext-Treue) | ~10 | **8 bleiben unverändert grün** — Pflicht: `leser-optionen`, `leser-r1-r2`, `leser-ruecksprung-r5-r7`, `leser-suche-vertrag-b8`, `gesetze-marginalie`, `gesetze-pdf-download`, `gesetze-ux-9punkte`, `gesetze-ux-g3a`, `gesetze-ux-g3b-anhang`, `leser-ohne-gliederungslinie`. **2 neu geschrieben** (deklarierte fachliche Änderung, §6.3, in S1): `hist-ansicht-w25i`, `gesetze-historie-badge`. Diese acht laufen **doppelt**: mit Flag gegen V3, ohne Flag gegen den Ist-Stand — das ist der Paritätsbeweis |
| e2e **B** (Bedienung/Layout) | ~17 | **11 neu geschrieben, aber nur EINMAL** (gegen V3, nicht als Interim + Endzustand): 10 in H1–H3 + `leser-breite-a37`/`leser-lesemass` in S2. Die alten Gegenstücke fallen in H4/H5 |
| e2e **P** (Perf/CLS) | ~5 | 2 neu, 3 bleiben |
| Vitest (DOM-frei) | 21 | ~4 berührt: `leser-suche-w219`, `gesetz-leser-uebersicht-s6`, `hist-chronologie` (entfällt mit dem Modus), `kontext`/`kontext-artikel-s7`; **neu**: Fassaden-Default (R10), Optionen-Migration, Sortierung (S4) |
| Infrastruktur | — | **Playwright-Projekt `leser-v3`** neben `schwer`/`chromium` — Aufwand **S**; **CI-Zeit der Leser-Suite ×2 im Fenster** (Shard-Balance beobachten) |
| Wortlaut-Tests (S3) | 4 Stellen | `aufhebung-kopf.test.tsx:56,64`, `v2-c2-farbwoerterbuch.test.tsx:62`, `fedlex-versionen-aufhebung.test.ts:29`, e2e `leser-kopf-g2b.e2e.ts:71,81,88` |

**Tore, die die Hülle NICHT berührt:** `check:normtext` · `check:golden-normtext` ·
`golden`/`golden:vergleich` · `check:fedlex-versionen` · `check:zitate`. **Berührt:**
`check:linien-kanon` Teil A (`data-normtext-linie`, `ArtikelLeser.tsx:406`) ·
`check:design-tokens` (S2) · `check:perf-budget` · `check:seo-index` (S3).
Ein Skript `prerender-golden` existiert **nicht**; der Prerender ist hüllenunabhängig
(`scripts/prerender.ts` schreibt SEO-HTML aus Manifesten/Snapshots, kein React-Render der
Hülle) — geteilt ist nur der S3-Wortlaut.

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
vergessen (Council A). Sie sind hiermit **Abnahmekriterien von H1** — H1 gilt ohne sie als
nicht abgeschlossen:

| # | Kriterium | Prüfung |
|---|---|---|
| A-1 | **`scrollAnker.ts`-Claim verifiziert.** Die Datei behauptet in Kommentaren einen localStorage-Spiegel, der per Grep nicht auffindbar war. | Entweder Fundstelle benennen oder den Kommentar als falsch korrigieren — H1 berührt die Scroll-Restauration und darf nicht auf einer unbelegten Annahme aufsetzen |
| A-2 | **`#art_N` → `#art-` korrigiert.** Die Referenz-Notiz nennt Fedlex' Anker-Schema als «unser». | Korrektur in `02-referenzen.md` (Scratchpad) belegt; verbindlich ist `#art-<token>` (`inhalt-sprung.tsx:159`) |
| A-3 | **`EntscheidLeser.tsx:409` ist ausserhalb des Leser-Scopes** und wird in H1 mit angefasst (Guard-Parität für den Tab-Titel, Pos. 7). | Im PR-Titel ausdrücklich benannt; sortenrein bleibt es (reine UI/Guard-Parität), aber nicht stillschweigend |

---

## 13 · Was diese Fassung gegenüber dem Entwurf ändert

| Nr. | Änderung | Ort |
|---|---|---|
| 1 | `imPane`-Baseline 38 → 102 Z./114 Vorkommen; Ziel neu «Kopf-/Layout-Verzweigungen 21 → 0» | Kap. 2, Kap. 10 |
| 2 | Option (B) → (B-hybrid) mit Deploy-Dimension (Live-Zustände, Rückbau-Mechanik) | Kap. 3 |
| 3 | Etappen neu in Strang H (H1–H5) und Strang S (S1–S4) | Kap. 7 |
| 4 | N-e2e im Flag-Projekt gegen V3 **und** ohne Flag gegen Ist; Split-View als Test | Kap. 7 (Regeln), Kap. 6 |
| 5 | Widerspruch «InhaltsKopf vorerst behalten» aufgelöst; **Suchlücke entfällt durch (III)** | Kap. 3, Kap. 5 (FL-5) |
| 6 | Fenster-Deckel 5 PRs, Flip-Kriterien, H5-Frist | Kap. 7 |
| 7 | Test-Preis: Flag-Projekt, CI ×2, B-Tests nur einmal | Kap. 10 |
| 8 | Neue Risiken R9 (Dauerzustand) und R10 (Flag leckt); R3 auf «alter Baum eingefroren» | Kap. 11 |
| 9 | F1–F6 in Alltagssprache mit Konsequenz-Beispiel und als harte Vorbedingung; F3-Widerspruch aufgelöst | Kap. 9, Kap. 7 |
| 10 | HIG-Tags auf die acht Begriffe der 02b-Quelle zurückgeführt | Kap. 1 Ziff. 1, Kap. 4 |
| 11 | Grenze Hülle/Kern geschärft (nur Token + Beiwerk-Zone, sonst deklarierte Ausnahme) | Kap. 1 Ziff. 3 |
| 12 | Pfad des Bild-Bogen-Skripts genannt; Bogen ist Vorbedingung für S2 | Kap. 8 |
| 13 | Die drei Mitdenk-Punkte sind Abnahmekriterien von H1 | Kap. 12 |
| 14 | Kantons-Probe je H-Etappe | Kap. 7 (Regeln) |
| + | Kurzfassung für David; Flag-/Umschalt-Regel FL-1…FL-7; Vorprobe H1 mit Nullprobe, Rot-Beweis und Basisrate | Kap. «Für David», Kap. 5, Kap. 6 |
