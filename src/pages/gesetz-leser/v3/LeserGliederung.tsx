import { SektionBaumTOC } from '../parts';
import { ArtikelIndex } from '../parts/ArtikelIndex';
import { TrefferListe } from '../parts/TrefferListe';
import type { LeserV3Modell } from './leserV3Modell';

// ─── Zone B der Seitenleiste: Baum ODER Treffer (Kap. 4b) ───────────────────
//
// EINE Komponente für beide Zustände, weil es EINE Fläche ist. Solange gesucht
// wird, tritt der Baum zurück und die Trefferliste steht an seinem Platz;
// verlässt man die Suche, steht er unverändert wieder da — derselbe
// Klapp-Zustand, kein Remount des Modells (Entscheid David (c) 8.8.2026).
//
// Zwei Listen gleichzeitig — eine sichtbar, eine in einem versteckten Container
// — wären die Doppelwahrheit, die a32 für das Kontext-Panel schon einmal
// ausgeschlossen hat. Darum die Weiche hier und nirgends sonst (§5).
//
// Welcher Baum gezeigt wird, entscheidet das Gliederungs-MODELL, nicht diese
// Datei: `b1` Sektionsbaum · `b2/b4` flacher Artikel-Index · `b3` die ehrliche
// Leerzeile. Das ist der Unterschied zwischen «Darstellung» und «Entscheidung»
// (§3) — und der Grund, warum ein Erlass ohne amtliche Gliederung hier keine
// Sonderbehandlung braucht.
//
// Die Trefferliste selbst ist in H1 der BESTEHENDE Baustein: Reihenfolge und
// ✕-Verhalten sind Etappe H2, hier wechselt nur ihr Ort mit.

export function LeserGliederung({ m }: { m: LeserV3Modell }) {
  if (m.sucheAktiv) {
    return (
      <TrefferListe treffer={m.treffer} begriff={m.sucheBegriff} fundstellen={m.fundstellen}
        fussnotenAus={m.fussnotenAus} position={m.trefferPos} aktivToken={m.trefferAktivToken}
        onZurueck={() => m.springeZuFundstelle?.(-1)} onVor={() => m.springeZuFundstelle?.(1)}
        onSprung={(t) => m.springeZuTreffer?.(t)} />
    );
  }

  const { gliederung } = m;
  if (gliederung.modus === 'b3-leer') {
    return (
      <p className="text-micro leading-snug text-ink-500 [overflow-wrap:anywhere]">
        Für diesen Erlass ist keine Gliederung erfasst.
      </p>
    );
  }

  const anhangAst = gliederung.knoten.filter((k) => k.art === 'anhang');
  const anhangEl = anhangAst.length > 0
    ? (
      <SektionBaumTOC knoten={anhangAst} aktivPfad={m.aktivIds} aktivToken={m.aktivToken} offen={m.tocBaum}
        startOffeneTiefe={gliederung.startOffeneTiefe}
        onToggle={m.tocToggleGruppe} onSprung={m.springeZuSektion} onSprungArtikel={m.springeZuArtikel} />
    )
    : undefined;

  if (gliederung.modus === 'b2-index' || gliederung.modus === 'b4-mini') {
    return (
      <ArtikelIndex gruppen={gliederung.artikelIndex} aktivToken={m.aktivToken}
        onSprung={m.springeZuArtikel} anhang={anhangEl} />
    );
  }

  // A36: das Modell ist auf dem KURATIERTEN Baum gebaut; Sprung- und
  // Toggle-Handler arbeiten weiter über die Ids des vollen Baums (Teilmenge).
  // `onSprungArtikel` bedient die synthetischen Zeilen (Vorspann/Anhänge), die
  // keine `sek-N`-Identität haben und über ihren ersten Artikel-Token springen.
  return (
    <SektionBaumTOC knoten={gliederung.knoten} aktivPfad={m.aktivIds} aktivToken={m.aktivToken} offen={m.tocBaum}
      startOffeneTiefe={gliederung.startOffeneTiefe}
      onToggle={m.tocToggleGruppe} onSprung={m.springeZuSektion} onSprungArtikel={m.springeZuArtikel} />
  );
}
