/**
 * erlass-identitaet — T2/S2-Fragment-Wächter + Identitäts-Split des komponierten
 * Erlass-Strings «Titel, Kürzel (Nr)». R8.3 (1.9.2026) wortgleich aus
 * browse-manifest.ts hierher verschoben: kanton-abk-roh.ts (Rückrechnungs-
 * Beweise) und kanton-abk-regeln.ts (R2-Komma-Wächter) brauchen die Funktionen,
 * browse-manifest.ts importiert seinerseits kanton-abk-roh.ts (Sidecar-
 * Projektion) — der Direktimport war ein Modul-Zyklus (check:zyklen).
 * browse-manifest.ts re-exportiert beide (Bestands-Importe unverändert, §6).
 */

// T2/S2 (BS-Audit 23.6.2026) — Erlassform-Endungen, die einen Mehrwort-/lowercase-
// Tail als ECHTES Kürzel ausweisen («ad personam-Verordnung», «Registratur- und
// Archivierungsverordnung», «Abfallvereinbarung BS - BL»). Endet ein Tail-Wort auf
// eine dieser Formen, ist es kein Satzfragment, sondern ein Kurztitel.
const KUERZEL_FORM_RE =
  /(gesetz|verordnung|reglement|ordnung|vertrag|vereinbarung|übereinkommen|uebereinkommen|konkordat|abkommen|statut|verfassung|beschluss|dekret|weisung|richtlinie|tarif|programm|prämie|preis|fonds|verbund|gelübde|gesetzessammlung)$/i;

/**
 * T2/S2 — Ist der Teil NACH dem letzten Komma ein Satzfragment statt eines
 * Kürzels/Kurztitels? Der naive Last-Comma-Split machte aus «Vertrag …, b) den
 * Betrieb der Hafenbahn …» einen mid-sentence-Fragment-Titel (H1/Breadcrumb/Tab
 * kaputt). Konservativ: nur klar fragmentartige Tails ablehnen; die ~318 echten
 * Komma-Kürzel (StG, EnG, AVO Inland, EG StPO, Abfallvereinbarung BS - BL, …)
 * bleiben unberührt (kein Regress des Vorzustands).
 *
 * Fragment, wenn:
 *  (a) Aufzählungs-Buchstabe «x) …» (BS-954.420 «b) den Betrieb …»);
 *  (b) klein-beginnend OHNE Erlassform-Wort («betreffend …», «über die …»,
 *      «nachstehend …», «abgeschlossen …», «handelnd …») — «ad personam-
 *      Verordnung» wird durch die Form-Ausnahme gerettet;
 *  (c) GROSSGESCHRIEBENES Mehrwort-Fragment: ≥3 Wörter, keine Erlassform-Endung,
 *      und (≥4 Wörter ODER kein Akronym) — deckt BS-955.700/952.820/428.100
 *      («Basel-Landschaft und Aargau …», «… über die Fachhochschule … (FHNW)»)
 *      sowie kurze Listen-Fragmente «Basel-Landschaft und Aargau» ab, ohne kurze
 *      akronym-dominierte Kürzel («VO EG BGS», «NAV Haushalt BS») zu treffen.
 */
export function istKuerzelFragment(tail: string): boolean {
  const t = tail.trim();
  if (!t) return false;
  const hatForm = t.split(/\s+/).some((w) => KUERZEL_FORM_RE.test(w));
  if (/^[A-Za-zÄÖÜäöü]\)\s/.test(t)) return true;
  if (/^[a-zäöü]/.test(t) && !hatForm) return true;
  const woerter = t.split(/\s+/);
  if (woerter.length >= 3 && !hatForm) {
    const hatAkronym = woerter.some((w) => /[A-ZÄÖÜ]{2,}/.test(w));
    if (woerter.length >= 4 || !hatAkronym) return true;
  }
  return false;
}

/** Kürzel + Titel + SR aus dem Snapshot-erlass-Feld (z.B. 'Verfahrenskostendekret, VKD (BSG 161.12)'). */
export function identitaetAusErlass(erlass: string): { kuerzel: string; titel: string; sr: string | null } {
  const klammer = erlass.match(/\(([^)]*)\)\s*$/);
  const sr = klammer ? klammer[1].trim() : null;
  const vor = erlass.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (vor.includes(',')) {
    const idx = vor.lastIndexOf(',');
    const kuerzel = vor.slice(idx + 1).trim();
    const titel = vor.slice(0, idx).trim();
    // T2/S2: Last-Comma-Split nur akzeptieren, wenn der Tail kürzel-typisch ist.
    // Ist er ein Satzfragment, ist der ganze (klammerlose) String Kürzel UND Titel —
    // der Reader-Kopf zeigt dann den vollen Erlassnamen statt eines Fragmentsatzes.
    if (kuerzel && titel && !istKuerzelFragment(kuerzel)) {
      return { kuerzel, titel, sr };
    }
    return { kuerzel: vor, titel: vor, sr };
  }
  // Kein Komma: das Kürzel steht allein vor der Klammer; voller String als Titel
  // (sonst wäre Titel == Kürzel und nichtssagend).
  return { kuerzel: vor, titel: erlass.trim(), sr };
}
