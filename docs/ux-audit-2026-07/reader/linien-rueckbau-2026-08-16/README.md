# Vorher/Nachher-Beweis — Gliederungslinie im Lesetext entfernt (Variante V1)

**Anlass:** ROADMAP `W2·5h-GESETZ-UI`, letzte Checklisten-Position.
**Spec:** `fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §9.3.
**Entscheid:** David, Chat 13.8.2026, wörtlich *«ja linien ganz entfernen. 2 es
reicht. 3 nein. 4. ok»* — Variante **V1** (Rückbau), V2 (Typo-Nachrüstung) und V3
(Scroll-Guide) ausdrücklich verworfen.
**Gebaut:** 16.8.2026.

Deklarierte Verhaltensänderung nach §6 — kein verstecktes Refactoring. Darum
dieser Beweis, analog L-1/L-2.

## Wie er erhoben wird (reproduzierbar)

Dev-Server starten (`npm run dev`), dann dasselbe Skript einmal auf dem Stand
VOR und einmal auf dem Stand NACH dem Rückbau laufen lassen:

```
node docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/beweis.mjs vorher
node docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/beweis.mjs nachher
```

Gemessen wird an **ZGB Art. 684** — Gliederungstiefe 5, der tiefste Punkt des
Korpus und genau die Stelle, an der David die Linie zweimal verworfen hat.

## Ergebnis

| Messgrösse | vorher | nachher |
|---|---|---|
| Elemente mit Klasse `border-guide` im ZGB-DOM | **19** | **0** |
| markierte `section[data-normtext-linie]` über Art. 684 | 7 | 0 |
| davon mit sichtbarer Guide-Kante (Grundzustand) | 0 | 0 |
| … nach Klick «Linien AN» | **1** | *(Schalter existiert nicht mehr)* |
| Schalter im Menü «Ansicht ▾» | Linien · Fussnoten · Verweise | Fussnoten · Verweise |
| `html[data-linien]` | `auto` | *(Attribut fort)* |
| `.lc-leser[data-guide-auto]` | `aus` | *(Attribut fort)* |
| CSS-Token `--guide-gliederung` | `oklab(… 18 %)` | *(nicht mehr definiert)* |

Rohdaten: `vorher-messung.json` / `nachher-messung.json`.

## Zu den Screenshots — ehrlich eingeordnet (§8)

`vorher-3-zgb-684-linien-an.png` gegen `nachher-1-zgb-684-grundzustand.png`:
kein Zeilenumbruch, kein Höhensprung; **horizontal rückt der Fliesstext um
1 CSS-px nach links** (Pixel-Diff der beiden Screenshots bei 2× DPR: exakt
−2 Gerätepixel, Bug-Check 16.8.2026), weil der Alt-Default `linien=auto` die
1-px-`border-l` transparent *reserviert* liess und sie jetzt ganz fehlt — also
nicht layout-neutral, sondern eine deklarierte, minimale Verschiebung ohne
Umbruch (Lesemass ≤ 75 ch unberührt, `leser-lesemass` grün). Nutzer, die
`linien=aus` gespeichert hatten, sehen den Einzug wieder — er ist nun
dauerhaft, kein Schalter mehr (Altwert wird beim Laden ignoriert, beim ersten
Speichern verworfen). Die Linie selbst ist im
Vorher-Bild nur bei genauem Hinsehen als Haarlinie am linken Rand der Lesespalte
zu erkennen. Das ist kein Mangel des Beweises, sondern der belegte Befund: sie
lag bei ~18 % Deckung, und genau daran hat David sie dreimal verworfen
(«praktisch unsichtbar», «eine einzige linie und unbrauchbar»). Die für Nutzer
**sichtbare** Änderung ist darum der Schalter-Bestand im Ansicht-Menü, nicht das
Schriftbild — und die Zahlen oben, die den Code-Zustand belegen.

Was bewusst blieb: **Typo + Einzug** (Ränge 1 und 2 der Rangfolge aus
`DESIGN-REGLEMENT-NORMTEXT` §4b; der Einzug ist jetzt dauerhaft statt
abschaltbar) und die Seitenleiste mit Gliederungsbaum (`W2·19-GLIEDERUNG`), die
die Übersichts-Aufgabe seit dem 13.8.2026 trägt.

## Dauerhafter Wächter

Der Einmal-Beweis wird von einer Spec abgelöst, die bei jedem Lauf prüft, dass
die Linie weg bleibt — und die den Einzug positiv festnagelt, damit ein späterer
«Rückbau» den Fliesstext nicht still flachzieht:
`e2e/leser-ohne-gliederungslinie.e2e.ts`.
