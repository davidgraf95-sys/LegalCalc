# Belege — W2·5m-LESER-V3 · Etappe S3 (Erlass-Kopf + Standausweis-Wortlaut)

Stand 16.8.2026 · Branch `feat/leser-v3-s3` · Fahrplan
[FAHRPLAN-LESER-V3.md](../../../../fahrplaene/FAHRPLAN-LESER-V3.md) Kap. 4e / Kap. 7 S3 /
Entscheid **F5** (Kap. 9).

## Was sich geändert hat

**Vorher** trug der Erlass-Kopf bis zu neun gleich aussehende Mono-Chips mit
Brass-Kante in einer umbrechenden Zeile — und darin drei grundverschiedene
Dinge nebeneinander: externe Links, einen Knopf und reine Textangaben
(Befund LM-045/046, Ästhetik-Urteil Ä6). **Nachher** stehen vier Bänder nach
Rolle getrennt:

```
BUNDESGESETZ · VERFAHRENSRECHT
Schweizerische Strafprozessordnung (StPO)
SR 312.0 · 480 Artikel
Stand 01.04.2025 · in Kraft seit 01.01.2011 · gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)
⚠ Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text eingearbeitet — massgeblich ist die amtliche Fassung.
↗ geltende Fassung   ⧉ In neuem Reiter   ⬇ Amtliches PDF (Fassung vom 01.04.2025)
```

**Wortlaut alt → neu (F5):**

| | |
|---|---|
| alt | `geltend geprüft am 14.08.2026 (maschinell)` |
| neu | `gegen Fedlex-Konsolidierung geprüft am 14.08.2026 (maschinell)` |
| neu (nur wo zutreffend) | `⚠ Fedlex hat eine seit 01.07.2025 geltende Änderung noch nicht in den Text eingearbeitet — massgeblich ist die amtliche Fassung.` |

Der alte Ausweis war für sich wahr, las sich aber wie «alles aktuell». Geprüft
wurde aber nur, ob unser gepinnter Text der aktuellen *Fedlex-Konsolidierung*
entspricht — nicht, ob Fedlex seinerseits alle in Kraft getretenen Änderungen
eingearbeitet hat. Genau diese Lücke ist der Positions-11-Befund.

## Die Bilder

16 Aufnahmen, je nur der `<header>` des Lesers:

| Fall | Warum |
|---|---|
| `stpo-mit-warnung-*` | Erlass **mit** nicht konsolidierter, bereits geltender Änderung — der F5-Klartextsatz |
| `or-ohne-warnung-*` | Erlass **ohne** — die Zeile trägt den Grundhinweis, nichts Beruhigendes wird behauptet (§8) |
| `vmwg-verordnung-*` | Verordnung statt Gesetz (andere Overline, andere Fakten-Zeile) |
| `bs-640-100-kanton-*` | **Kantons-Probe**: kein Standausweis (kein `geprueftAm`), «Paragraphen» statt «Artikel», keine leeren Trenner — der Bund-Fokus bricht nichts |

je `-desktop-` (1280) und `-mobil-` (390), je `-hell` und `-dunkel`.

## Wie sie erzeugt wurden

Einmalig, mit einem Wegwerf-Spec (bewusst **nicht** im Testlauf: ein Spec, der
bei jedem CI-Lauf Dokumentation neu schreibt, wäre kein Wächter, §6.7).
Zum Reproduzieren einen Spec unter `e2e/` anlegen, der je Fall
`page.locator('.lc-leser > header').first().screenshot()` aufruft — Viewport
setzen, `page.emulateMedia({ colorScheme })` wählen und nach dem Sichtbarwerden
des Kopfs ~1.5 s warten (beide Sidecars sind Netz-Nachzügler), dann laufen
lassen und wieder entfernen.

Was **bleibt**, ist der Wächter `e2e/leser-kopf-cls-s3.e2e.ts`: er misst den
Layout-Shift derselben Seite und hält die Reservierung fest.

## Messwerte (16.8.2026)

**CLS**, ganze Seite, warm, ohne CPU-Drossel, eigener Browser-Kontext je Fall:

| Seite | @390 | @1280 |
|---|---|---|
| `/gesetze/bund/STPO` (dieser Kopf, beide Sidecars als Nachzügler) | **0.0216** | **0.0067** |
| `/gesetze` — Nullprobe, **ohne** diesen Kopf | 0.31 | 0.73 |
| `/rechtsprechung` — Nullprobe, **ohne** diesen Kopf | 2.15 | 2.19 |

Die Shift-Quellen der Leser-Seite liegen laut `layout-shift`-`sources` **nicht**
im Erlass-Kopf, sondern im Seiten-Chrom (x-Bewegung der Kopfleisten-Gruppen nach
dem Font-Swap) und im Fliesstext. Die drei bereits kalibrierten Wächter
`leser-kontext-e4`, `leser-kopf-a9` und `gesetze-historie-badge` bleiben grün.

> Die beiden Nullproben sind ein Nebenbefund, kein S3-Gegenstand: `/gesetze` ist
> als `W2·15-CLS` bereits in der ROADMAP geführt (dort mit 0.109 @8× notiert),
> `/rechtsprechung` mit 2.15 bisher **nirgends**. Eine Probe je Seite, ohne
> Drossel — vor einer Zuschreibung gehört das sauber nachgemessen.

**Höhen-Reservierung** der Stand-/Status-Zelle (Endzustand des ungünstigsten
Erlasses je Fenster; Zeilenhöhe 16.5 px + 4 px Abstand):

| Fenster | gemessen | reserviert |
|---|---|---|
| < 640 px | STPO 86.5 px (2 Zeilen Stand + 3 Zeilen Warnung) | 5.4375rem |
| ≥ 640 px | STPO 70 px (2 + 2) | 4.375rem |
| ≥ 768 px | OR 53.5 px (2 + 1) | 3.375rem |
| ≥ 1280 px | OR 37 px (1 + 1) | 2.3125rem |

OR ist ab 768 px der ungünstigste Fall, nicht STPO: es trägt Inkrafttreten 1912
**und** Standausweis **und** Fassungsvorbehalt in einer Zeile.
