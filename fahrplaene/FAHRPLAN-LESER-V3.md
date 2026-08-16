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
| F2 Den Schalter «Verweise» streichen? | … keinen Unterschied — der Schalter wirkt heute nur auf eine gepunktete Linie, die erst beim Darüberfahren mit der Maus erscheint. | **Ja** |
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
| **PX · Pixelvergleich Textkörper** (zusätzliches Treue-Tor, ab H1) | Playwright `toHaveScreenshot()` auf die Region `.lc-leser article`, gleiche Artikel (StPO Art. 429, OR Art. 336c), gleiche Breite, V1 gegen V3. Der **Textkörper darf sich beim Hüllen-Umbau nicht um ein Pixel ändern** — das ist der schärfste verfügbare Beweis für «Kern unangetastet» und fängt, was DOM-Tests durchlassen (Abstände, Einzüge, Zeilenumbrüche). **Einzige zugelassene Ausnahme: S2**, wo die Baseline **einmalig und deklariert** neu gesetzt wird; die Neusetzung wird im PR begründet und der alte Screenshot als Vorher-Bild beigelegt (§6.3 — eine Baseline stillschweigend zu erneuern wäre ein Tor, das nicht scheitern kann). |

### Strang H

| E | Inhalt | Dateien (neu / entfernt / behalten) | Zeilenbilanz | B-Tests neu | Abnahme-Kriterium (ein Satz) | Aufwand |
|---|---|---|---|---|---|---|
| **H1** | **Fassaden-Flag + `LeserRahmenV3` + `LeserKopf` + Seitenleisten-Skelett mit Such-/Sprungfeld** — Pos. 1, 2, 4, 6, 7, 10, 15, 16; **sichtbar ab dem ersten PR** | neu: `GesetzLeserV3.tsx`, `LeserRahmenV3.tsx`, `LeserKopf.tsx`, `LeserSeitenleiste.tsx`, `SuchSprungFeld.tsx`, Playwright-Projekt `leser-v3` · entfernt: nichts (alter Baum eingefroren) · behalten: **alle Hooks unverändert importiert**, `ArtikelLeser`, `ArtikelBody`, `tocAutoZuklappen`, `leserSuche` | +900 / −0 | 4: `leser-kopf-paritaet` (beide Panes), `leser-v3-suche-sprung`, `leser-v3-seitenleiste-ordnung`, `leser-v3-umschalten` (FL-6) | Unter `?leser=v3` steht in beiden Panes derselbe Kopf, ein Feld sucht **und** springt, das Umschalten V1↔V3 hält die Leseposition — und ohne Flag ist der Ist-Stand bitgleich unverändert. | **L** |
| **H2** | **Suchverhalten** — Pos. 5 (UI-Seite), 14 | geändert: `TrefferListe`-Nachfolger in V3, Sprung-Offset gegen die Sticky-Höhe | +200 / −0 | 3: `leser-v3-treffer-reihenfolge`, `leser-v3-esc-ohne-sprung`, `leser-v3-treffer-mobil` | Treffer stehen in Erlass-Reihenfolge je Artikel gruppiert, und ✕/Esc bewegen den Scroll um 0 px. | **M** |
| **H3** | **Panel/Sheet für Rechtsprechung + Kontext** — Pos. 3, 12, 17; **Vorbedingung F4**. Enthält **Panel-Nachladen** (s. u.) | neu: `LeserPanel.tsx` (3 Reiter, vierter Filter «Sachgebiet» **vorgesehen**, Datenlogik dazu bleibt `W2·7-VZUI-SACHGEBIET`) · behalten: `bezuegeLaden`, `bezugAuswahl`, `bezugZeit`, `bezugPortion` (Datenlogik unverändert) | +450 / −0 | 4: `leser-v3-panel-facetten`, `leser-v3-panel-zaehler`, `leser-v3-kontext-cls`, `leser-v3-prerender-bezuege` | Jeder Entscheid, der heute unter einem Artikel erreichbar ist, ist über Zähler → Panel erreichbar, in beiden Panes, ohne dritte vertikale Fläche — und das prerenderte HTML trägt die Bezüge unverändert. | **L** |
| **H4** | **Flip** — Flag-Default auf **an**; alte B-Tests gegen die alte Hülle löschen bzw. auf V3 umhängen | geändert: Fassade (Default), `playwright.config.ts` | ±0 | 0 neu (11 alte B-Tests werden entfernt/umgehängt) | Alle acht unveränderten N-Tests, `leser-kopf-paritaet`, CLS ≤ Ist-Stand und axe sind unter dem neuen Default grün, und David hat nach Kontaktbogen zugestimmt. | **M** |
| **H5** | **Löschung der alten Hülle + Flag** — Pos. 9 | entfernt: alte Hüllen-Dateien ohne eingehende Referenz, `inhalt-kopfmeldung.tsx`, `data-such-bar`-Pfad, `LeserMenuPaar`, `LeserRechtsprechungMenu`, Flag-Code, tote `data-linien`-Kommentare (`inhalt-zustand.tsx:365`, `leserOptionen.ts:9-15`) | **−2 500 bis −3 200** | 0 neu | Jede gelöschte Datei hat den Nichttrage-Nachweis **vor** der Löschung, alle Tore sind grün bei byte-gleichem Golden, und im Repo existiert kein Flag-Code mehr. | **M** |

### Strang S (in place, wirkt in beiden Hüllen)

| E | Inhalt | Vorbedingung | Tests | Abnahme-Kriterium | Aufwand |
|---|---|---|---|---|---|
| **S1** | Optionen-Rückbau: Historie zweiwertig, «Fassung»-Overline an denselben Schalter, «Verweise» streichen, Migration alter Werte (Pos. 8) | **F1 + F2 schriftlich «ja»** | **2 N neu**: `hist-ansicht-w25i`, `gesetze-historie-badge`; `leser-optionen` bleibt grün; Vitest-Migration | «Änderungsvermerke: aus» lässt keine Historie-Spur im Lesekörper zurück, und der DOM bleibt vollständig. | **S** |
| **S2** | Artikel-Raster (Beiwerk-Zone) + Typografie-Tokens (Pos. 13, 19) | **F3 entschieden, nach Bild-Bogen** (Kap. 8) | 2: `leser-breite-a37`, `leser-lesemass` | Das Umschalten aller drei Schalter erzeugt an keinem Artikel einen Layout-Sprung, und der Satzspiegel entspricht der von David gewählten Variante. | **M** |
| **S3** | Erlass-Kopf + Standausweis-Wortlaut (Pos. 11, 18) | **F5 «ja»** | 3 Vitest + 1 e2e-Wortlaut; `aufhebung-kopf` bleibt grün | UI-Kopf und prerenderter SEO-Kopf tragen **denselben** neuen Wortlaut, und die Warnung erscheint genau bei den fünf betroffenen Erlassen. | **S/M** |
| **S4** | Sortierung der Suchtreffer auf Erlass-Reihenfolge (`leserSuche.ts:390-393`) | keine | Vitest an der Sortierfunktion; `leser-r1-r2`, `leser-suche-vertrag-b8` bleiben grün | Die Sortierfunktion liefert Dokumentreihenfolge als Primärschlüssel, bewiesen ohne Browser. | **S** |

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

> **Entscheide David 16.8.2026 (Chat, «go, empfehlungen übernehmen, bau den prototyp»):** F1 ja · F2 ja · F4 ja · F5 ja · F6 nein · **F3 = V1 (19 px) · F7 = A (Kopf mit «Ansicht ▾») · F8 = Panel-Randlasche behalten; **Regel David 16.8.: Schalter «Rechtsprechung im Text» aus ⇒ Zähler UND Randlasche weg** (Panel bleibt über «Ansicht ▾»/Tastatur erreichbar; H3) — entschieden am Prototyp V-0, David 16.8.2026 («V1, a, Lasche behalten — weiter mit H1»)** · Design-Grundlage D-A Regler ja · D-B Dunkelmodus behalten (14 Rollen) · D-C Serif behalten. Blocker `david-go-leser-v3` gelöst; Schritt auf wip.

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
| e2e **N** (Normtext-Treue) | ~10 | **8 bleiben unverändert grün** — Pflicht: `leser-optionen`, `leser-r1-r2`, `leser-ruecksprung-r5-r7`, `leser-suche-vertrag-b8`, `gesetze-marginalie`, `gesetze-pdf-download`, `gesetze-ux-9punkte`, `gesetze-ux-g3a`, `gesetze-ux-g3b-anhang`, `leser-ohne-gliederungslinie`. **2 neu geschrieben** (deklarierte fachliche Änderung, §6.3, in S1): `hist-ansicht-w25i`, `gesetze-historie-badge`. Diese acht laufen **doppelt**: mit Flag gegen V3, ohne Flag gegen den Ist-Stand — das ist der Paritätsbeweis |
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
| A-1 | **`scrollAnker.ts`-Claim verifiziert.** Die Datei behauptet in Kommentaren einen localStorage-Spiegel, der per Grep nicht auffindbar war. | Entweder Fundstelle benennen oder den Kommentar als falsch korrigieren — H1 berührt die Scroll-Restauration und darf nicht auf einer unbelegten Annahme aufsetzen |
| A-2 | **`#art_N` → `#art-` korrigiert.** Die Referenz-Notiz nennt Fedlex' Anker-Schema als «unser». | Korrektur in `02-referenzen.md` (Scratchpad) belegt; verbindlich ist `#art-<token>` (`inhalt-sprung.tsx:159`) |
| A-3 | **`EntscheidLeser.tsx:409` ist ausserhalb des Leser-Scopes** und wird in H1 mit angefasst (Guard-Parität für den Tab-Titel, Pos. 7). | Im PR-Titel ausdrücklich benannt; sortenrein bleibt es (reine UI/Guard-Parität), aber nicht stillschweigend |

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
| **`W2·10-UI-NAV` / `B14`** (ROADMAP:434) — «Brotkrume, Kopfzeilen und Seitenmeta (K-19a)», 8 Befunde, davon 3 «hoch» | Deckungsgleich mit Pos. 1 (Kopfzeile) und Pos. 18 (Seitenmeta) | **H1** (Krume/Kopf) + **S3** (Seitenmeta) | Die **8 Befunde aus `FAHRPLAN-UI-NAVIGATION.md` §15 werden als Abnahme-Checkliste in den H1- bzw. S3-PR kopiert** und einzeln abgehakt — nicht «sinngemäss mitgemacht». Die 3 Hoch-Befunde sind Blocker der jeweiligen Etappe |
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

### Kollisionshinweis für die Folge-Session

`W2·10-UI-NAV`, `W2·7-VZUI`, `W2·13-KANTONE` und `QS-PERF` führen `src/pages/gesetz-leser` bzw.
`GesetzLeser.tsx` in ihrer `kollision:`-Liste — solange V3 läuft, ist die Fläche belegt. Vor
jedem dieser Schritte gilt die Drei-Sonden-Prüfung (offene PRs · fremde Remote-Branches ·
Worktrees); im Zweifel wartet der andere Schritt.
