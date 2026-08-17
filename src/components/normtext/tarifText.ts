// Tarif-TEXT-Aufbereitung des Normtext-Artikels: reine Zeichenketten-Funktionen
// ohne JSX. Eigenes Modul, weil eine Datei nicht Komponenten UND Hilfsfunktionen
// exportieren darf (eslint react-refresh/only-export-components) — Muster wie
// wortverbinder.ts. Aus ArtikelBody.tsx ausgelagert (verhaltensneutral, §6);
// reine Darstellung (§3), der Wortlaut wird nie erzeugt oder geaendert.

// Tarif-Staffel-Tabelle (z. B. ZH GebV OG § 4) landet aus dem PDF-Snapshot als
// EIN Fliesstext-Block («… bis 1000 25 % … über 1000 bis 5000 250 …»), weil die
// PDF-Spalten beim Extrahieren verschmelzen. Rein für die DARSTELLUNG (§3, Text
// unverändert) zerlegen wir solche Staffeln in Zeilen je Streitwert-Band —
// deutlich lesbarer als der eine Blob. Bewusst ENG getriggert (Fee-Table-Marker
// + mindestens zwei «über N»-Bänder), damit normale Absätze nie zerschnitten
// werden. Bandgrenze: «über <Zahl>» — das nachfolgende « <Ziffer>» grenzt sauber
// gegen «übersteigenden» ab (dort folgt kein « Ziffer»). KEINE \b-Wortgrenze:
// Umlaute zählen in JS-Regex nicht als \w, «\büber» würde nie matchen. Die erste
// Zeile (Kopf + erstes Band) wird vor «bis <Zahl>» getrennt.
export function staffelZeilen(text: string): string[] | null {
  // (1) Gerichtsgebühren-Staffel «über N …» (ZH GebV OG § 4-Stil).
  if (/zuzügl\.|Grundgebühr|betragen/.test(text) && (text.match(/über \d/g) ?? []).length >= 2) {
    const zeilen = text
      .split(/(?=über \d)/)
      .flatMap((s, i) => (i === 0 ? s.split(/(?=bis \d)/) : [s]))
      .map((s) => s.trim())
      .filter(Boolean);
    if (zeilen.length >= 3) return zeilen;
  }
  // (2) Anhang-Tarif-Staffel mit «–»-Bändern (ZH NotGebV-Anhang-Stil:
  //     «… –höchstens 1 Jahr im Rahmen von 100–1000 –mehr als 1 Jahr …»). Mehrere
  //     « –<Wort>»-Bänder mit Gebühren-Marke (‰ / «im Rahmen von» / Fr.). Jedes
  //     Band auf eine eigene Zeile; der Teil vor dem ersten «–» bleibt Kopf.
  //     ENG getriggert (≥2 Bänder + Marke), damit normale Absätze nie zerschnitten
  //     werden. Rein Darstellung (§3) — der Text bleibt unverändert.
  const baender = text.match(/ –\p{L}/gu) ?? [];
  if (baender.length >= 2 && /‰|im Rahmen von|Fr\./.test(text)) {
    const zeilen = text.split(/(?= –\p{L})/u).map((s) => s.trim()).filter(Boolean);
    if (zeilen.length >= 3) return zeilen;
  }
  // (3) Prozent-/Promille-Staffel mit «vom Mehrbetrag über …» (Notariats-/
  //     Grundbuchtarife, z. B. BS Notariatstarif: «… bis CHF 2 Mio. 0,25%, vom
  //     Mehrbetrag über CHF 2 Mio. 0,2%, vom Mehrbetrag über 5 Mio. 0,1% …»).
  //     NUR Zeilenumbrüche an den Band-Markern «vom Mehrbetrag über» bzw.
  //     «plus N ‰/%» — der WORTLAUT bleibt unverändert (kein Ziffern-Trennen,
  //     §1), darum risikolos. ENG: Tarif-Marke (‰/Promille/Mehrbetrag) + ≥2 Bänder.
  if (/‰|promille|mehrbetrag/i.test(text)) {
    const marker = text.match(/vom Mehrbetrag über|plus \d/g) ?? [];
    if (marker.length >= 2) {
      const zeilen = text.split(/(?=vom Mehrbetrag über|plus \d)/).map((s) => s.trim()).filter(Boolean);
      if (zeilen.length >= 3) return zeilen;
    }
  }
  return null;
}

// Tarif-/Anhang-Text aus PDF-Spalten verschmilzt Wort und Zahl ohne das Trenn-
// Leerzeichen («Allgemeinen1.1.1», «Verkehrswert1‰», «mindestens100», «1‰4.1»).
// Rein für die DARSTELLUNG (§3): das vom PDF verschluckte Leerzeichen zwischen
// Buchstabe↔Ziffer bzw. ‰↔Ziffer wieder einfügen. Der WORTLAUT bleibt unangetastet
// — es wird NUR ein fehlendes Trenn-Leerzeichen ergänzt, kein Zeichen geändert,
// entfernt oder umgestellt (Freigabe David 17.6.2026: Darstellung darf normalisiert
// werden, solange der Wortlaut nicht angefasst wird).
export function normalisiereTarifText(text: string): string {
  return text
    .replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/(‰)(\d)/gu, '$1 $2')
    .replace(/ {2,}/g, ' ')
    .trim();
}
