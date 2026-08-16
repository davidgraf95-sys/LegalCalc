# Klick-Prototyp «Gesetz-Leser V3» (V-0)

Stand 16.8.2026 · Branch `feat/leser-v3-konzept` · Roadmap-Schritt `W2·5m-LESER-V3`, Position **V-0**
Grundlage: `../leser-v3-design-grundlage.md` · `../../../../fahrplaene/FAHRPLAN-LESER-V3.md` Kap. 4, 6, 9

**Kein Produkt-Code.** Nichts hier wird gebaut, gebündelt oder ausgeliefert; `src/` und `public/`
sind unberührt. Der Prototyp ist eine einzelne HTML-Datei ohne jede externe Anfrage.

---

## Für David — so bedienst du ihn

**Öffnen:** `index.html` doppelklicken. Kein Server, kein Internet nötig.

Ganz oben liegt eine **dunkle Leiste — das ist die Prototyp-Steuerung, nicht der Entwurf.**
Sie gehört nicht zum Produkt; sie ist nur da, damit du alle Fassungen in einem Fenster
vergleichen kannst. Alles unterhalb der Leiste ist der Vorschlag.

| Schalter | Was er tut |
|---|---|
| **Breite** | Handy 390 · Split 720 · Desktop 1280 — dieselbe Oberfläche in den drei Grössen |
| **Variante** | **A** = Kopfzeile mit «Ansicht ▾»-Menü · **B** = Kopfzeile ohne Menü, die drei Schalter liegen im Seitenfenster unter dem Reiter «Anzeige» → **das ist Entscheid F7** |
| **Schrift** | **V1** 19 px, luftig, kurze Zeilen · **V2** 17 px, kompakt, amtsnah → **das ist Entscheid F3** |
| **Modus** | Hell / Dunkel |
| **Split-View** | Zweites Fenster daneben (grauer Platzhalter für den Entscheid-Leser). Fixiert die Breite auf 720, weil genau das der Split-Fall ist |
| **Klicks** | Zählt jeden Klick im Entwurf — damit misst du, ob Variante B wirklich einen Klick mehr kostet |
| **Sprung beim Umschalten** | Zeigt in Pixeln, wie weit der Text wegrutscht, wenn du Fussnoten oder Änderungsvermerke an/aus schaltest. Soll **0 px** sein — das ist das Versprechen «nichts springt» |

**Was du ausprobieren solltest**

1. Ins Suchfeld links `429` tippen → der Leser springt zu Art. 429. `Genugtuung` tippen → Trefferliste,
   Fundstellen im Text markiert. `Esc` leert das Feld, **ohne** die Lesestelle zu verlieren.
2. Die drei Schalter (in A im Menü «Ansicht», in B im Reiter «Anzeige») ein- und ausschalten und
   dabei die Anzeige «Sprung beim Umschalten» beobachten.
3. Unter einem Artikel auf «⚖ 163 Entscheide →» klicken — das Seitenfenster geht auf.
4. Auf Handy-Breite umstellen: die Gliederung liegt hinter **☰**, das Seitenfenster kommt von unten.
5. Tastatur: `⌘K` oder `/` springt ins Suchfeld, `Esc` schliesst der Reihe nach Menü, Sheet, Panel.

**Die beiden Entscheide, um die es geht**

- **F3 — Schriftbild.** V1 gegen V2 am besten direkt umschalten, am Bildschirm, an Art. 429.
  Die Bilder in `screens/` sind nur ein Abzug; verbindlich ist das, was du live siehst.
- **F7 — Kopfzeile mit oder ohne Menü.** A und B nacheinander bedienen, dabei den Klick-Zähler
  zurücksetzen und dieselbe Aufgabe zweimal erledigen (z. B. «Fussnoten aus, Text lesen, wieder an»).

---

## Was echt ist und was Attrappe

**Echt — unverändert aus dem Repo-Korpus** (der Generator liest die Dateien, nichts ist abgetippt):

| Inhalt | Quelle |
|---|---|
| Wortlaut Art. 426–432 samt Absätzen und Buchstaben | `public/normtext/bund/STPO.json` |
| Randtitel, Gliederung (Titel/Kapitel/Abschnitt), Fussnoten 275–277 | `public/normtext/struktur/bund/STPO.json` |
| Änderungsvermerke («gilt seit 01.01.2024») zu Art. 429 und 431 | `public/normtext/historie/STPO.json` |
| Entscheid-Zähler je Artikel (327 · 16 · 888 · 163 · 29 · 43 · 18) | `public/rechtsprechung/bezuege/STPO.json` |
| Die 14 BGE im Seitenfenster samt Regeste | dieselbe Datei |
| Erlass-Kopf: Titel, SR 312.0, 480 Artikel, Stand 01.04.2025 | `public/normtext/register.json` |
| Warnung «noch nicht konsolidiert», AS 2024 490, gilt seit 01.07.2025 | `public/normtext/revisionen/STPO.json` |
| Prüfdatum 14.08.2026 im Standausweis | ebenda (`abgerufen`) |

**Attrappe — im Prototyp sichtbar gekennzeichnet:**

- Die **Filter-Chips** (Instanz · Kanton · Zeitraum) klicken durch, filtern aber nichts → Marke «Filter Demo».
- Die **Trefferliste** im Reiter «Entscheide» zeigt immer die Bezüge zu Art. 429; bei anderen Artikeln
  steht das ausdrücklich dran. Die Zähler-Zahl selbst ist bei jedem Artikel echt.
- Der Reiter **«Materialien»** ist leer — nur der Platz ist reserviert.
- Der **Split-Partner** rechts ist eine graue Fläche; der Entscheid-Leser ist nicht nachgebaut.
- Alle **Links** (geltende Fassung, PDF, Entscheide) zeigen ins Leere oder auf Fedlex, sie führen zu keiner
  Prototyp-Seite.
- Die neun übrigen **Titel im Gliederungsbaum** sind nur benannt; nur der 10. Titel ist aufgelöst.

---

## Was bewusst NICHT drin ist

| Weggelassen | Warum |
|---|---|
| **Blätterpfeile** «voriger/nächster Artikel» | Entscheid **F6 = nein** (Fahrplan Kap. 9) |
| **Schalter «Verweise»** | Entscheid **F2 = ja** (streichen) — es bleiben genau drei Schalter |
| **Dritter Historie-Modus** «Chronologie» | Entscheid **F1 = ja** — Änderungsvermerke sind zweiwertig |
| **Scrollbare Entscheid-Zeilen unter dem Artikel** | Entscheid **F4 = ja** — nur noch der leise Zähler |
| **legalviz-Ideen** (Legaldefinitionen, DE/FR nebeneinander, PDF-Auszug) | Fahrplan Kap. 14: ausdrücklich nicht Teil von V-0 |
| **Vierter Filter «Sachgebiet»** | Platz vorgesehen, Daten sind eigener Risikopfad-Schritt |
| Übrige 473 Artikel, andere Erlasse, echte Volltextsuche über den Korpus | Ein Prototyp entscheidet zwei Fragen, er ersetzt das Produkt nicht |

---

## Technisches

**Aufbau.** `index.html` wird **erzeugt**, nicht von Hand gepflegt:

```
node docs/ux-audit-2026-07/reader/leser-v3-prototyp/bau.mjs      # index.html neu bauen
node docs/ux-audit-2026-07/reader/leser-v3-prototyp/schuss.mjs   # Selbsttest + 12 Bilder in screens/
```

- `vorlage.html` — HTML, CSS und JS von Hand gepflegt; hier wird editiert.
- `bau.mjs` — schneidet den Datenslice aus dem Korpus und bettet die Schrift ein → `index.html`.
- `schuss.mjs` — öffnet `index.html` per `file://` mit Playwright, klickt sich durch und legt
  12 PNG in `screens/` ab. Bricht ab, sobald die Seite auch nur einen Konsolen-Fehler wirft.

**Warum ein Generator?** Damit nachweisbar bleibt, dass jeder Rechtstext aus
`public/normtext/**` stammt und nicht abgeschrieben ist (§5, eine Quelle). **`index.html` nie von
Hand editieren** — Änderungen gehören in `vorlage.html`, danach `bau.mjs` laufen lassen.

**Schrift.** Source Serif 4 Variable (latin, normal + kursiv, 102 KB) ist als `data:`-URI
eingebettet — dieselbe Schrift wie im Produkt, kein CDN, kein Netzzugriff. Die Bedienoberfläche
nutzt die Systemschrift (`-apple-system`, auf dem Mac SF Pro), SR-Nummern eine Monospace.
Dadurch ist `index.html` rund 210 KB gross.

**Design-Bindung.** Die 14 Farbrollen aus Kap. 4 der Design-Grundlage stehen wörtlich als
CSS-Variablen (`--label-1` … `--focus`) in hell und dunkel; ebenso die 7 Schriftstufen, die
8 Abstandsstufen, die 3 Radien und die Bewegungsdauern aus Kap. 7. Wer die Namen sucht,
findet sie am Anfang der `<style>`-Blocks.

**Zugänglichkeit.** Semantisches HTML (`header`/`nav`/`aside`/`main`/`article`), echte `<button>`,
`aria-expanded`/`aria-pressed`/`role="tree"`/`role="tab"`, sichtbarer Fokusring aus der Rolle
`focus`, Trefferflächen ≥ 24 px. `prefers-reduced-motion` schaltet jede Bewegung ab.
Die Kontraste sind die aus der Design-Grundlage gemessenen (AA bis AAA) — sie wurden hier
übernommen, nicht neu gemessen.

**Grenzen, die man kennen sollte**

- Die drei Breiten werden über einen **Rahmen** nachgestellt, nicht über echte Media-Queries.
  Auf einem echten Handy nutzt der Rahmen die volle Fensterbreite; das Layout entspricht dann
  der eingestellten Breite, nicht automatisch «Handy». Für den Handy-Eindruck also **Breite: Handy 390** wählen.
- **Fussnotenmarken** stehen am Ende des Absatzes bzw. Buchstabens, zu dem sie gehören. Fedlex
  setzt sie mitten im Satz; die genaue Position steckt im Snapshot (`pos`), wird hier aber nicht
  ausgewertet — für das Schriftbild ist das ohne Belang, für das Produkt nicht.
- Die **Volltextsuche** läuft nur über die sieben Artikel des Ausschnitts.
- Der **Sprung-Zähler** misst die Verschiebung des gerade gelesenen Artikels, nicht den offiziellen
  CLS-Wert des Browsers. Für die verbindliche Messung ist Wächter **W-2** vorgesehen.

**Selbsttest, letzter Lauf**

```
12/12 Bilder geschrieben · Konsolen-Fehler 0
«/» fokussiert das Suchfeld · Esc schliesst das Panel
Sprung «Art. 429» → Kopfzeile zeigt Art. 429
Volltextsuche «Genugtuung» → 6 Treffer in Erlass-Reihenfolge
Layout-Sprung beim Umschalten der drei Schalter: 0 px
```

## Offene Fragen an David

1. **F3** — V1 (19 px, ruhig) oder V2 (17 px, kompakt)?
2. **F7** — Variante A (Kopf mit «Ansicht ▾») oder B (Kopf ohne Menü, Schalter im Seitenfenster)?
3. Der Öffner des Seitenfensters liegt am rechten Rand als schmale Lasche «⚖ 163». Der Fahrplan
   nennt «einen Knopf mit Trefferzahl», sagt aber nicht, wo. Ist die Lasche recht, oder soll der
   Zähler unter dem Artikel der einzige Weg ins Seitenfenster sein (eine Fläche weniger)?
