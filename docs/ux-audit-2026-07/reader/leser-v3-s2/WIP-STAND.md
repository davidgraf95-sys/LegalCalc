# S2 · WIP-Stand vor Pause (17.8.2026, Branch `feat/leser-v3-s2`, Basis `788e4d4a5`)

**Entscheid David 17.8.2026 (F3):** V2 «amtsnah kompakt» + Fussnotenmarke hochgestellt.
`npx tsc -b` **grün**. Tore sonst NICHT gefahren (Pause). Kein PR, kein Merge.

## Erledigt (Brief-Aufgaben)
- **1 Typo-Tokens** ✅ `tailwind.config.js`: `leser-text` 1.0625/1.55 · `leser-rand` 0.8125/1.35 · `leser-fn` 0.6875/1.3. Nur 3 statt 7 Stufen (die anderen 4 wären wertgleiche Zweitnamen zu `h1`/`h2`/`body-s`/`overline`, §5). `--fn-marke:.72em` in `index.css` ersetzt **6×** `text-[0.62em]`. Fliesstext-Override `leading-[1.65]` ist weg.
- **2 Beiwerk-Zone + Ä26** ✅ `[data-beiwerk]` umschliesst Verweise·Rechtsprechung·Fassung·Apparat. Reserve nur wo möglich: `erlass.ebene === 'bund'` — **belegt**: 209 Historie-Shards, alle Bund, **0** von 1231 Kanton-Erlassen; 0 Gegenbeispiele über alle 205 Shards mit Einträgen. Token `hist-zeile` → **`beiwerk`** (Wert 1.5 rem, gemessen 24.00 px). Grundlagen-Wert 2.5 rem **abweichend nicht** übernommen (hätte 16 px Leerraum je Artikel = Ä26 an neuer Stelle).
- **3 Ä7** ✅ Randtitel 13 px Sans, Vorfahren ink-600, Blatt ink-800/semibold (Abweichung begründet); Artikelnummer unverändert 16 px bold ⇒ 3 Stufen. **Ä-(b)** ✅ Stand-Zeile: `.num` (Mono) raus, `tabular-nums` an der Zeile — Risikopfad `src/lib/normtext/**` unberührt.
- **3b Ä25** ✅ **Unmöglichkeitsbeweis** statt Farbwahl: dunkel verlangt L ≤ 0.1983 (3:1 gg. Text) UND L ≥ 0.2084 (4.5:1 gg. Grund) — leeres Intervall, **kein** Farbwert existiert. Gebaut: Ruhe = `font-medium` + Akzentfarbe, Linie erst bei `hover`/`focus-visible`. `INLINE_CLASS`-Duplikat entdoppelt (`VERWEIS_RUHE`/`VERWEIS_INLINE_CLASS` in `NormText.tsx`, Import in `KantonNormText.tsx`).
- **5 A-1** ✅ Regler auf Grundlagen-Faktoren `[1.0, 1.08, 1.18, 1.3]` × 1.0625 rem = 1.0625/1.1475/1.25375/1.38125 (100·108·118·130 %). **Wurzel-Fix**: CSS-Selektor `.text-body-l` → `[data-lese]` (Utility-Name war kein Vertrag und wäre nach S2 still ins Leere gelaufen).

## Offen
- **4 PX-Baseline** (alte PNGs als `vorher/` sichern, neu setzen, 5× grün) · **6 Tests** (`leser-lesemass`, `leser-breite-a37`, Vitest-Quellensonde, Shard-Einordnung, Rot-Beweise) · **7 Tore/Golden/axe** · **8 Kontaktbogen `nachher/`** · **9 Fahrplan-Nachtrag + Vollzugsvermerk S2** · **Ä-(a)** Titel-Reservierung (nicht angefasst) · **Ä4** (nicht angefasst).

## Bekannt rot / Fallen
- `e2e/zz-sonde-s2.e2e.ts` ist eine **temporäre Mess-Sonde** — **vor den Toren löschen**, sonst `check:e2e-shards` rot.
- `src/tests/leser-schriftskala.test.ts` **wird rot** (prüft `SCHRIFT_REM.normal === 1.125`, `[100,111,122,133]`, Selektor-String `.text-body-l`) — deklarierte fachliche Änderung §6.3, muss nachgezogen werden.
- Erwartet rot/anzupassen: `e2e/leser-v3-schriftskala`, `gesetze-marginalie`, alles was 18 px / `text-body-l` / `min-h-hist-zeile` hart prüft. `e2e/px-textkoerper` reisst **absichtlich** (Baseline-Neusetzung, Aufgabe 4).
- V3-Asymmetrie vermieden: Reserve hängt an `erlass.ebene`, nicht an einer neuen Prop ⇒ wirkt in beiden Hüllen, `v3/**` unberührt.

## Messwerte VORHER (17.8.2026, @1440, warmer Preview, chromium, 1 Worker)
| | STPO | OR | BS-640.100 |
|---|---|---|---|
| Fliesstext | 18 px / 29.7 px (lh 1.65) | dito | dito |
| Spalte / ch | 652 / 58 | 572 / 53 | 632 / 58 |
| CLS | 0.00508 | 0.00432 | 0.01564 |
| hist-Slots (leer) | 480 (370) | 1598 (1129) | 278 (**278**) |
| Toggle-Δ max (Fn/Hist/Leitf.) | 86 / 200 / 176 px | 367 / 160 / 132 px | 39 / 214 / 54 px |

**Befund für den Vollzugsvermerk:** Das Abnahme-Kriterium «Umschalten aller drei Schalter erzeugt keinen Layout-Sprung» ist mit David-Entscheid **A1 (5.7.2026, «AUS» = verschwinden)** nicht erfüllbar — der Apparat misst 27–187 px je Artikel; ihn höhenfest zu reservieren wäre genau das verbotene Dämpfen. Ein Boden fängt nur Elemente kleiner als er selbst. Erfüllbar und gemessen ist die CLS-Zusage.

## Nächster Handgriff
`src/tests/leser-schriftskala.test.ts` nachziehen (§6.3 deklariert), dann Sonde löschen, dann Aufgaben 6 → 4 → 7 → 8 → 9.
