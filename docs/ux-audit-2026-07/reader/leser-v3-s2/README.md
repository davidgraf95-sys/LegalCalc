# S2-Typo-Kontaktbogen (Pos. 19, W2·5m-LESER-V3)
Bild-Bogen für David-Entscheid F3. Kein Produkt-Code — Aufnahme via
temporärem Playwright-Skript `…/scratchpad/konzept/typo-kontaktbogen.spec.ts`.

**Messbedingung:** `npm run build` (main 17.8.2026) + `vite preview`, Chromium,
hell (18 Bilder) + 2× dunkel (`html.dark`). Immer V3-Rahmen (`?leser=v3`, Query
vor Hash). Breiten 390/1440/720px (720 = Näherung Split-Pane, kein zweites
Pane offen). `content-visibility` vor Aufnahme erzwungen. Element-Screenshot
`#art-<N>` + 40px Rand.

## Selektor-Mapping
| Kennwert | Selektor | Fundort |
|---|---|---|
| Fliesstext | `.nt-art-cv [data-lese]` | ArtikelBody.tsx:711 |
| Lesemass | `.nt-art-cv .max-w-normtext` | ArtikelLeser.tsx:556 |
| Marginalie | `.font-serif.leading-snug > div` | ArtikelLeser.tsx:451/453 |
| Absatzziffer | `.num.w-9` (≠ `.num.w-6` Item) | ArtikelBody.tsx:650/850 |
| Fussnotenmarke | `.align-super` | ArtikelBody.tsx:190 |
| Fussnoten-Body | `[data-fn-apparat] > p` | ArtikelLeser.tsx:613-616 |
| Titelstufen | `.text-h1/.text-h2/.text-h3` | tailwind.config.js:104-106 |

Gemessen @1440, STPO 429 (`getComputedStyle`+`canvas.measureText`):
Ist 18px/29.7px/632px-Pane/~56ch · V1 19px/32.3px/632px/~53ch ·
V2 17px/26.35px/632px/~59ch. Lesemass-Token (40/42/42rem) sind bei 1440px
alle grösser als die reale V3-Pane (632px) — 40↔42rem greift hier optisch
nicht.

## Näherungen
- **Absatzziffer hängend (V1):** `transform: translateX`; `overflow-x-clip`
  (Produktiv-Schutz, ArtikelLeser.tsx:556) dafür NUR in der Aufnahme gelockert.
- **Klammer-Fussnote (V2):** `::before`/`::after`, kein Wortlaut geändert.
- **Titelstufen/Kapitälchen (V1):** Regel steht, in den zwei Artikeln aber
  nicht sichtbar (kein Sektions-Header im Bildausschnitt).

## Entscheid David 17.8.2026 (F3)
Am Bogen, Wortlaut **«v2 gefällt mir besser aber fussnoten hochgestellt»**:
gewählt ist **V2 «amtsnah kompakt»**, mit **einer Abweichung** — die
Fussnotenmarke bleibt **hochgestellt und ohne Klammern** (V1-Form), nicht in
runden Klammern wie in der V2-Spalte des Fahrplans.

## Gebaut (S2, 17.8.2026)
Umgesetzt ist genau diese Fassung. Die Nachher-Bilder liegen unter `nachher/`,
die alte PX-Baseline als Vorher-Beleg unter `vorher/`.

**Gemessen am gebauten Stand** (`nachher/messwerte.json`, Chromium, warmer
Preview, V3-Rahmen):

| Kennwert | Ist (vorher) | S2 (gebaut) |
|---|---|---|
| Fliesstext | 18 px | **17 px** |
| Zeilenabstand des Absatztexts | 29.25 px (**1.625**) | **26.35 px (1.55)** |
| Zeilenabstand des Containers | 29.7 px (1.65) | 26.35 px (1.55) |
| Randtitel | 16 px Serif | **13 px Sans** |
| Fussnoten-Apparat | 12 px | **11 px** |
| Fussnotenmarke | 0.62 em | **0.72 em, hochgestellt, klammerlos** |
| Lesemass | `max-w-normtext` 42 rem | unverändert |
| Zeilenlänge @1440 (StPO/OR/BS) | 68 / 68 / 56 ch | 73 / 71 / 61 ch |

**Wichtig zum Zeilenabstand:** der Absatztext lief NIE auf den 1.65 des
Containers — `ArtikelBody` setzte `leading-relaxed` (1.625) unbedingt auf den
Block-Wrapper und schlug die Container-Zeilenhöhe. Der Ist-Wert «1.65» im Bogen
und im Fahrplan war also schon vorher nur der Container-Wert. S2 nimmt den
Override heraus; damit liefert der Leser die 1.55 des Entscheids wirklich.

Die ch-Werte stammen aus der Messmethode der Spec (`leser-lesemass.e2e.ts`:
Textlänge / Zeilenkästen) — nicht aus der `canvas.measureText`-Näherung des
Bogens oben (dort «~59 ch» für V2). Beide Methoden sind in sich stimmig, aber
nicht miteinander vergleichbar; verbindlich ist die der Spec, weil das Tor sie
prüft (WCAG 1.4.8: ≤ 80 ch, lh ≥ 1.5 — erfüllt an 390/720/1440).

## Was die Nachher-Bilder ausserdem zeigen
**Ä4 ist am Objekt sichtbar** (`stpo-429-1440-s2.png`, rechter Rand): die
Leitentscheide-Chips laufen über die Spaltenkante und werden abgeschnitten.
Gemessen, nicht nur gesehen: der Chip-Streifen `.lc-bezug-linie` ist ein
horizontaler Scroll-Streifen (scrollWidth 875 gegen clientWidth 414 @1440), und
17 Nachfahren der Beiwerk-Zone ragen rechts über die Artikelkante — bis 232 px
@720. Kein Dokument-Überlauf (Seiten-Scrollbreite 0), der Inhalt wird also
still beschnitten, nicht sichtbar überlaufend. **In S2 NICHT behoben**, mit
Grund: H3 ersetzt diese Chip-Zeile durch den leisen Zähler «⚖ n Entscheide →»
(so auch im Fahrplan angelegt) — eine Überarbeitung hier wäre verworfene Arbeit
und eine Kollision mit der H3-Baufläche. Zugewiesen an H3.

**Vorbehalt für Davids Auge:** die Sachüberschrift (Randtitel-Blatt) ist mit V2
von 16 px auf 13 px gefallen. Das folgt der V2-Zeile, die David gewählt hat,
berührt aber denselben Auftrag vom 26.6.2026, der verlangte, sie dürfe nicht
«zu einem blassen Abschnittslabel verkümmern». Gegengesteuert ist mit Gewicht
und Farbe (semibold, ink-800 statt der V2-Farbe ink-600); ob das genügt, ist am
Bild zu entscheiden.

## Messbedingung der Nachher-Bilder
Wie oben: `npm run build` + `vite preview`, Chromium, V3-Rahmen (`?leser=v3`),
`content-visibility` am Mess-Artikel erzwungen, Element-Screenshot `#art-<N>`
+ 40 px Rand. Hell 390/720/1440, dazu 2× dunkel @1440.

## Dateien
`stpo-429-{390,1440,720}-{ist,v1,v2}.png` (9) · `or-336c-{…}.png` (9) ·
`dunkel-{stpo-429,or-336c}-1440-v1.png` (2) · `bogen.html` · diese Datei ·
`nachher/{stpo-429,or-336c}-{390,720,1440}-s2.png` (6) +
`nachher/dunkel-{stpo-429,or-336c}-1440-s2.png` (2) + `nachher/messwerte.json` ·
`vorher/px-{or-336c,stpo-429}-VORHER-s1-baseline.png` (2, die abgelöste
PX-Baseline).
