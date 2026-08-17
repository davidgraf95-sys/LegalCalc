import { gruppiereTausender } from '../../lib/normtext/darstellung';

// Tarif- und Tabellen-Darstellung des Normtext-Artikels. Aus ArtikelBody.tsx
// ausgelagert (verhaltensneutral, §6/§6.6-Churn-Regrowth: die Vereinigung von
// S2-Typografie und H3-Panel-Zone hob ArtikelBody.tsx über die Baseline-Toleranz).
// Der Wortlaut der Blöcke ist UNVERÄNDERT übernommen — reine Darstellung (§3),
// kein Normtext wird erzeugt. Nachbarschaftsmuster wie BildElemente.tsx.

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

// TABELLEN-REGEL (Auftrag David 20.6.2026): erkannte Tarif-/Gebühren-Staffeln
// (staffelZeilen) werden als gestylte Tabelle dargestellt — umrandeter Block,
// abgesetzte Kopfzeile, Zeilen-Trenner je Band, tabular-nums. REIN DARSTELLUNG
// (§3): der Wortlaut je Zeile bleibt unverändert; verschmolzene PDF-Ziffern
// werden NICHT neu getrennt (§1). Wird sowohl für Absatz-Blöcke als auch für
// Tarif-Items (lit./Ziff.) verwendet — viele Notariats-/Grundbuchtarife stehen
// als Items.
// Reiner Text je Zeile (wie die ursprüngliche Staffel-Darstellung) — kein
// Autolink/NormText in den Tabellen-Zeilen: Tarif-Bänder enthalten ohnehin keine
// zitierten Normen, und so bleibt das Markup einfach (keine verschachtelten
// Fragmente/Key-Themen). Reine Darstellung (§3), Wortlaut unverändert.
export function StaffelTabelle({ zeilen }: { zeilen: string[] }) {
  return (
    <span className="mt-1.5 block rounded-md border border-line overflow-hidden [text-indent:0] [font-variant-numeric:tabular-nums]">
      {zeilen.map((z, j) => (
        <span key={j}
          className={`block px-3 py-1.5 leading-snug ${
            j === 0 ? 'font-medium text-ink-800 bg-paper-sunken/40' : 'border-t border-rule-artikel'
          }`}>
          {z}
        </span>
      ))}
    </span>
  );
}

// Hilfsfunktion: Zelle gilt als (rechtsbündiger) Betrag, wenn sie Ziffern
// enthält, aber kein Wort mit ≥4 Buchstaben (à la «über», «bis», «zuzügl.»,
// «übersteigenden») — lange Text-Zellen bleiben linksbündig. AUSNAHME: reine
// Positions-/Tarif-Nummern («1.1.1.1», «1.», «5000») sind KEINE Beträge → bleiben
// linksbündig zur Hierarchie. Rein Darstellung (§3); steuert Ausrichtung.
function istNumerischeZelle(s: string): boolean {
  const t = s.trim();
  if (t === '' || /^\d+(\.\d+)*\.?$/.test(t)) return false;
  return /\d/.test(t) && !/[A-Za-zÀ-ÿ]{4,}/.test(t);
}

// Spaltentyp des kanonischen Modells (M10, T-B1) — spiegelt
// scripts/normtext/tabelle-normalisieren.ts; hier lokal, weil die Render-Schicht
// nicht aus scripts/ importiert (§3-Schichtentrennung).
type TabSpalte = { typ: 'bereich' | 'zahl' | 'text' | 'betrag'; titel: string };

// N-Spalten-Tabelle aus block.mehrspaltig. Dispatcht: kanonisches `spalten`-Modell
// (Bund, M10) → dumme typgesteuerte Projektion; Alt-`{kopf,zeilen}` (Kanton/Legacy)
// → unveränderter Alt-Renderer (abwärtskompatibel, byte-gleiche Darstellung).
export function MehrspaltigeTabelle({ spalten, kopf, zeilen }: { spalten?: TabSpalte[]; kopf?: string[]; zeilen: string[][] }) {
  if (spalten && spalten.length > 0) return <KanonischeTabelle spalten={spalten} zeilen={zeilen} />;
  return <LegacyMehrspaltigeTabelle kopf={kopf} zeilen={zeilen} />;
}

// Kanonische Tabelle (T-C1–C6/T-D1–D7): N = spalten.length, Ausrichtung +
// Tausender-Gruppierung rein typgesteuert; KEINE Inhalts-Heuristik, KEIN Padding
// (§3 dumme Projektion). Zell-Wortlaut unverändert (nur Tausender-Apostroph = Anzeige).
function KanonischeTabelle({ spalten, zeilen }: { spalten: TabSpalte[]; zeilen: string[][] }) {
  const N = spalten.length;
  // Defensive (T-E5): empfängt der Renderer trotz Gate eine aritätsverletzende
  // Zeile, rendert er linear (verlustfrei, alle Werte in Quellreihenfolge) statt
  // ein verschobenes Gitter — heilt nie, wirft nie.
  if (zeilen.some((z) => z.length !== N)) {
    return (
      <span data-mehrspaltig="" className="mt-1.5 block text-ink-700">
        {zeilen.map((z, ri) => (
          <span key={ri} className="block leading-snug">{z.filter((c) => c.trim() !== '').join(' · ')}</span>
        ))}
      </span>
    );
  }
  const rechts = (typ: TabSpalte['typ']) => typ === 'zahl' || typ === 'betrag';
  const gruppieren = (typ: TabSpalte['typ']) => typ !== 'text'; // bereich/zahl/betrag: Swiss-Apostroph
  const hatKopf = spalten.some((s) => s.titel !== '');
  const zelleCls = (typ: TabSpalte['typ'], kopfZeile: boolean) =>
    `table-cell px-3 py-1.5 leading-snug align-baseline${rechts(typ) ? ' text-right whitespace-nowrap [font-variant-numeric:tabular-nums]' : ''}${
      kopfZeile || rechts(typ) ? ' font-medium text-ink-800' : ' text-ink-700'
    }`;
  return (
    <span data-mehrspaltig="" tabIndex={0} role="group" aria-label="Tabelle, seitlich scrollbar" className="lc-scroll-x mt-1.5 block overflow-x-auto rounded-md border border-line [text-indent:0]">
      {/* ARIA-Tabellen-Semantik auf den display:table-Spans; je Datenzeile genau
          N cell zu N columnheader (folgt aus T-B2). Echtes <table> ist im
          Phrasing-/<p>-Kontext nicht möglich. */}
      <span role="table" aria-label="Tarif-Tabelle" className="table min-w-full w-max">
        {hatKopf && (
          <span role="row" className="table-row bg-paper-sunken/40">
            {spalten.map((s, ci) => (
              <span key={ci} role="columnheader" className={zelleCls(s.typ, true)}>{s.titel}</span>
            ))}
          </span>
        )}
        {zeilen.map((z, ri) => (
          <span key={ri} role="row" className="table-row">
            {z.map((cell, ci) => (
              <span
                key={ci}
                role="cell"
                className={`${zelleCls(spalten[ci].typ, false)}${ri > 0 || hatKopf ? ' border-t border-rule-artikel' : ''}`}
              >
                {gruppieren(spalten[ci].typ) ? gruppiereTausender(cell) : cell}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

// Alt-Renderer für Legacy-`{kopf,zeilen}` (Kanton/nicht migrierte Bund-Fallbacks):
// UNVERÄNDERT übernommen — Inhalts-Heuristik + Padding bleiben, damit Kanton-Tabellen
// byte-gleich rendern (L0-Abwärtskompatibilität). Bund nutzt KanonischeTabelle.
function LegacyMehrspaltigeTabelle({ kopf, zeilen }: { kopf?: string[]; zeilen: string[][] }) {
  const spalten = Math.max(kopf?.length ?? 0, ...zeilen.map((z) => z.length));
  const padZeile = (z: string[]) => {
    const padded = [...z];
    while (padded.length < spalten) padded.push('');
    return padded;
  };
  const spalteNumerisch = Array.from({ length: spalten }, (_, ci) =>
    zeilen.some((z) => istNumerischeZelle(z[ci] ?? '')),
  );
  const zelleCls = (ci: number, kopfZeile: boolean) =>
    `table-cell px-3 py-1.5 leading-snug align-baseline${spalteNumerisch[ci] ? ' text-right whitespace-nowrap' : ''}${
      kopfZeile ? ' font-medium text-ink-800' : spalteNumerisch[ci] ? ' font-medium text-ink-800' : ' text-ink-700'
    }`;
  return (
    <span data-mehrspaltig="" tabIndex={0} role="group" aria-label="Tabelle, seitlich scrollbar" className="lc-scroll-x mt-1.5 block overflow-x-auto rounded-md border border-line [text-indent:0] [font-variant-numeric:tabular-nums]">
      <span role="table" aria-label="Tarif-Tabelle" className="table min-w-full w-max">
        {kopf && kopf.length > 0 && (
          <span role="row" className="table-row bg-paper-sunken/40">
            {padZeile(kopf).map((h, ci) => (
              <span key={ci} role="columnheader" className={zelleCls(ci, true)}>{h}</span>
            ))}
          </span>
        )}
        {zeilen.map((z, ri) => (
          <span key={ri} role="row" className="table-row">
            {padZeile(z).map((cell, ci) => (
              <span
                key={ci}
                role="cell"
                className={`${zelleCls(ci, false)}${ri > 0 || (kopf && kopf.length) ? ' border-t border-rule-artikel' : ''}`}
              >
                {gruppiereTausender(cell)}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

// 2-Spalten-Tarif (Beschreibung | Betrag) aus strukturiertem block.tabelle.
// Reine Darstellung (§3); Wortlaut je Zelle unverändert.
export function TarifTabelle({ zeilen }: { zeilen: Array<{ beschreibung: string; betrag: string }> }) {
  return (
    <span role="table" aria-label="Tarif-Tabelle" className="mt-1.5 block rounded-md border border-line overflow-hidden [text-indent:0] [font-variant-numeric:tabular-nums]">
      {zeilen.map((z, j) => (
        <span key={j} role="row" className={`flex items-baseline justify-between gap-4 px-3 py-1.5 leading-snug ${j > 0 ? 'border-t border-rule-artikel' : ''}`}>
          <span role="cell" className="text-ink-700">{z.beschreibung}</span>
          <span role="cell" className="shrink-0 text-right font-medium text-ink-800">{gruppiereTausender(z.betrag)}</span>
        </span>
      ))}
    </span>
  );
}
