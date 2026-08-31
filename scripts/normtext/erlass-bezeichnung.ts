/**
 * Erlass-Bezeichnung «Volltitel, Kürzel (Nr)» — reines Modul, OHNE main()-
 * Seiteneffekt importierbar (R8.3, 1.9.2026: normtext-snapshot.ts führt beim
 * Import ausserhalb von vitest sein main() aus; der Rohfeld-Generator
 * kanton-abk-roh-generieren.ts braucht erlassBezeichnung aber für den
 * Round-Trip-Beweis der Rückrechnung). Wortlaut der Funktionen unverändert
 * aus scripts/normtext-snapshot.ts hierher verschoben; dort re-exportiert
 * (bestehende Importe/Tests unberührt, §6).
 */

// ── Erlass-Bezeichnung lesbar ────────────────────────────────────────────────
// Format: 'Volltitel, Kürzel (SR-Nr.)'. Das nachgelagerte browse-manifest
// (identitaetAusErlass) splittet am LETZTEN Komma: davor der Titel, danach das
// Kürzel; die Klammer ist die SR-Nr. So zeigen Liste UND Reader den echten
// Volltitel, das Kürzel separat.
//
// S9 (BS-Audit 23.6.2026) — VOR dem Fix war «basis = abkuerzung || erlassName»:
// sobald eine Abkürzung vorlag, fiel der Volltitel komplett weg → 129 Erlasse
// zeigten nur «KÜRZEL (SR)», ~406 trugen den Langtitel fälschlich im Kürzel-Feld.
// Jetzt wird der Volltitel (tol.title via meta.titel, sonst erlassName) als Titel
// geführt und die Abkürzung NUR dann separat als Kürzel angehängt, wenn sie
// existiert UND sich vom Titel unterscheidet (keine zweite Wahrheit, §5).
export function erlassBezeichnung(titel: string, abkuerzung: string, erlassNr: string): string {
  const t = titel.trim();
  const abk = abkuerzung.trim();
  const nr = erlassNr.trim();
  // Basis-Anzeige: Titel; fehlt der Titel, das Kürzel als Notbehelf.
  let basis: string;
  if (t && abk && abk !== t) {
    basis = `${t}, ${abk}`;
  } else {
    basis = t || abk;
  }
  return nr ? `${basis} (${nr})` : basis;
}

// S-27.7.2026-B2 (Gegenprüfung PR #391 Befund 2) — Fallback-Akronym aus dem
// repo-kuratierten Erlassnamen, wenn die API-Abkürzung LEER ist.
//
// Manche Kanton-APIs (z.B. AG gesetzessammlungen.ag.ch, Beleg: version_uid
// 1c8fd03927f498fe939c30dd5e6ea7d0, `abbreviation: ''`) liefern kein Kürzel,
// obwohl der repo-kuratierte Zitat-Name (g.erlassName, z.B.
// src/data/tarif/grundbuch.ts: "Gesetz über die Grundbuchabgaben (GBAG)") ein
// amtliches Akronym in Klammern trägt. Seit Zeile ~484 die API-Abkürzung
// bedingungslos übernimmt, ging dieses Akronym beim Kanton-Titel-Nachzug
// (PR #391, AG-725.100) verloren — kein Einzelfall-Hack, sondern eine
// GENERISCHE Regel: ein Grossbuchstaben-Akronym (2+ Zeichen, optional Ziffern)
// in Klammern am ENDE des kuratierten Namens wird als Kürzel-Fallback
// übernommen, unabhängig von Kanton oder Erlass. Kein Treffer (kein
// Klammer-Akronym im Namen) → '' wie bisher, keine Verhaltensänderung.
export function akronymAusErlassName(erlassName: string): string {
  const m = erlassName.trim().match(/\(([A-ZÄÖÜ][A-ZÄÖÜ0-9]{1,14})\)\s*$/);
  return m ? m[1] : '';
}
