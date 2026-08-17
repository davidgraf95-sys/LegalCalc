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

## Dateien
`stpo-429-{390,1440,720}-{ist,v1,v2}.png` (9) · `or-336c-{…}.png` (9) ·
`dunkel-{stpo-429,or-336c}-1440-v1.png` (2) · `bogen.html` · diese Datei.
