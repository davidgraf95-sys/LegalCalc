# DESIGN-D0 — Bildlegende zum Deckkraft-Fix

Beide Aufnahmen: **derselbe** gebaute DOM (`/`, Chromium 1280×900, Hauptnavigation),
getauscht wurde allein die kompilierte `dist/assets/*.css`. Gemessener Zustand ist
der **Hover** auf «Kantone» (`hover:bg-brass-100/40`) — die Zustands-Fläche, die
Fund B4 unsichtbar liess.

| Bild | CSS-Stand | `getComputedStyle().backgroundColor` |
|---|---|---|
| `navigation-hover-vorher.png` | Build vor dem Fix | `rgba(0, 0, 0, 0)` — Regel existiert nicht, Hover unsichtbar |
| `navigation-hover-nachher.png` | Build nach dem Fix | `oklab(0.933259 0.00247568 0.025723 / 0.4)` — brass-100 @ 40 % |

Erzeugt am 16.8.2026 im Worktree `LexMetrik-d0` gegen `vite preview` auf `dist/`.
Das Aufnahme-Skript war ein Wegwerf-Helfer und ist bewusst nicht eingecheckt: den
Regressionsschutz trägt `check:design-tokens` Prüfung 3, nicht ein Pixelvergleich
(Kosten-Argument der Design-Grundlage Kap. 10, W-3).
