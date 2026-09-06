import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { KategorieSektion } from '../components/Katalog';
import { kartenDerKategorie } from '../lib/katalogKategorie';
import { KatalogHinweis } from '../components/KatalogHinweis';
import { MassgebendeGesetze } from '../components/normtext/MassgebendeGesetze';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { EntwurfLegende } from '../components/EntwurfLegende';
import { STARTSEITE_ZAEHLER } from '../data/startseiteZaehler.generated';

// ─── Vorlagen-Übersicht (/vorlagen) — UI-Welle, Ersatz für /recherche ───────
//
// Eigene Rubrik-Übersicht analog zu /gesetze und /rechner (Auftrag David):
// die fünf Dokument-Gruppen (Behördeneingaben · Verträge · Einseitige
// Willenserklärungen · Gesellschaftsrecht · Vorsorge & Nachlass) mit
// Rechtsgebiet-Filter, browsbar auf EINER Seite. Reine Wiederverwendung der
// bestehenden KategorieSektion/VorlagenRegister (§3/§5).
const VORLAGEN_KATEGORIE = OBERKATEGORIEN.find((k) => k.id === 'vorlagen')!;

export function VorlagenUebersicht() {
  return (
    <div className="space-y-8">
      {/* D11/D22 (David 6.9.2026) — Kopf-Regel für ALLE fünf Übersichten,
          Herleitung in `components/layout/SeitenKopf.tsx`: H1 = Bereichsname
          wie im Reiter, DARUNTER die Ausgabe-Zeile aus dem Register — keine
          Overline, keine halbe Haarlinie, kein Erklär-Absatz. */}
      <SeitenKopf
        titel="Vorlagen"
        ausgabe={`${STARTSEITE_ZAEHLER.vorlagen} Vorlagen, nach Rechtsgebiet filterbar`}
      />

      <EntwurfLegende />

      <KategorieSektion kat={VORLAGEN_KATEGORIE} karten={kartenDerKategorie(KATALOG_KARTEN, 'vorlagen')} ohneKopf />

      <MassgebendeGesetze modus="vorlage" />
      <KatalogHinweis />
    </div>
  );
}
