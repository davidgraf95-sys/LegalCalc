# Fortsetzungs-Tiefe bei bild-unterbrochenen Aufzählungen (DBG 22 / STHG 7 u. a.)

**Erstellt:** 26.7.2026 · Anlass: Befund 6 der Routing-Gegenprüfung zu PR #372
(«tiefe fehlt bei Fortsetzungs-Ziffern»; Task-Chip 26.7.2026).
**Status:** ERSTRECHERCHE + adversariale Gegenprüfung gemäss Skill »gegenpruefung«
(Verdikt im Commit-Trailer dieser Bau-Einheit; Register `bibliothek/register/gegenpruefung-register.md`).
**Quellen (alle amtlich, am gepinnten Stand geöffnet 26.7.2026):**
Fedlex-Filestore-HTML via `scripts/fedlex-cache.sh` (dbg 20260101 · sthg 20250101 ·
rbue 20240606 · hzue 20230612 · vvv 20260101) und die zugehörigen amtlichen
PDF-Manifestationen derselben Konsolidierungen (Layout-Arbiter).

## 1 · Befund (Eingabe → Ausgabe)

Fedlex rendert Aufzählungen, die von einem Formelbild/`<p class="bild">` oder
einer Tabelle unterbrochen werden, in ZWEI Quellformen:

- **Form A — anonyme Unter-`<dl>` als direktes `<dl>`-Kind** («`<dl><dl><dt>2.…`»):
  Struktur-Signal vorhanden. Der bisherige dt/dd-Scanner von
  `parseDefinitionsListe` (scripts/normtext/extrahiere-fedlex.ts) flachte sie ab —
  die Items verloren ihre Ebene.
- **Form B — flache Fortsetzungs-`<dl>` direkt nach dem Bild-`<p>`** (kein
  Struktur-Signal; die `man-space-*`-Klassen sind Abstands-, nicht Tiefen-Signale —
  DBG-«c.» trägt beide, STHG trägt keine).

## 2 · Regel (deterministisch, §2)

1. **Form A:** eine anonyme direkte Unter-`<dl>` wird rekursiv **eine Stufe
   tiefer** zerlegt (Struktur = amtliches Signal). Implementiert als
   sequentieller dt/dl-Scanner in `parseDefinitionsListe`.
2. **Form B:** NUR beim Anhängen einer Liste an einen **Bild-/Kachel-Block**:
   beginnt sie mit dem reinen Ziffern-**Nachfolger** (n → n+1) des letzten
   Items der unterbrochenen Liste und trägt dieses `tiefe > 0`, erbt die
   führende Nachfolger-Kette dessen Tiefe (`ergaenzeFortsetzungsTiefe`).
   Abbruch an der ersten Nicht-Nachfolger-Marke. Keine lit.-Marken, keine
   Blöcke ohne Bild — bewusst eng (§1).
3. **Renderer-Kette (Darstellung, §3):** Items an absatz-losen Bild-Blöcken
   beziehen «Abs.»-Anker und lit.-Vorfahren blockübergreifend (nächstvorheriger
   Nicht-Bild-Block mit Absatznummer + Items der dazwischenliegenden
   Bild-Blöcke) — Zitier-Marke «Art. 22 Abs. 3 lit. c Ziff. 2 DBG» statt
   Unterdrückung; ohne herleitbaren Anker bleibt die Marke unterdrückt.

## 3 · Amtliche Verifikation (PDF-Layout, x-Positionen der Marken)

| Stelle | lit-Ebene | Ziff-Ebene | Fortsetzungs-Item | Verdikt |
|---|---|---|---|---|
| DBG 22 (PDF 1.1.2026, S. 17) | x=90 (b., c.) | x=108 (1.) | «2.» beide x=108 | tiefe 1 ✓ |
| STHG 7 (PDF 1.1.2025, S. 6/7) | x=45/90 | x=62/108 | «2.» x=62 bzw. 108 | tiefe 1 ✓ |
| RBUE 25 (PDF 6.6.2024, S. 17) | 1)–4) x=79, b)/c) x=90 | — | i)–v) x=108 | tiefe 1 ✓ (alt: i–v flach NEBEN 4) — invertiert) |
| RBUE annex_u1 (S. 30) | 4) x=34 | — | i)/ii) x=62 | tiefe 1 ✓ |
| HZUE annex_u1 (S. 12) | 1./2. x=34 | — | Formularzeilen x=62 | tiefe 1 ✓ (alt: «2.» fälschlich vertieft) |
| VVV annex_4 (S. 50) | 3.22/3.3/3.4 x=34 | — | Striche x=62 | tiefe 1 ✓ (alt: erste Strich-Gruppe inkonsistent flach) |

Korpusweite Wirkung: **genau 5 Erlasse** (DBG, STHG, HZUE, RBUE, VVV), alle
Diffs oben einzeln amtlich belegt; alle übrigen 222 Bund-Snapshots byte-gleich
(Datum-Churn zurückgesetzt). Struktur-Sidecars (`pos`) byte-stabil.

## 4 · Geltungsbereich und Ausnahmen

- Form A wirkt überall, wo Fedlex `<dl>` direkt in `<dl>` schachtelt (heute die
  5 Erlasse); Form B NUR an Bild-/Kachel-Blöcken mit Ziffern-Nachfolger.
- Die Fallback-Heuristik des Renderers (Daten ohne `tiefe`) bleibt unverändert.
- Wächter: `src/tests/fortsetzungs-tiefe.test.ts` (Form A/B + 3 Negativfälle,
  vor dem Fix rot gezeigt) · `e2e/bild-block-items.e2e.ts` (Fundstellen-Titel
  Abs. 3 lit. a/c Ziff. 2 DBG, Abs. 2 lit. c Ziff. 2 StHG).

## 5 · Pflegebedarf

- Regeneration (`npm run normtext -- --nur=bund --datum=…`) wendet die Regeln
  bei jedem Lauf an; kein separater Pflegelauf.
- Kippt ein Fedlex-Re-Pin eine der 6 Stellen strukturell (z. B. Form B wird zu
  Form A), greifen die Regeln weiterhin; der Snapshot-Diff zeigt es.
- Verfallsrelevanz: keine (keine datierten Werte).
