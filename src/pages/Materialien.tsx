import { useEffect, useMemo, useState } from 'react';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { usePaneKlasse } from '../components/layout/PaneKontext';
import { useSucheAusUrl } from '../components/suche/useSucheAusUrl';
import { MaterialKarte } from '../components/materialien/MaterialKarte';
import {
  ladeMaterialManifest, gruppiereNachBehoerde, filtere, vorhandeneDoktypen,
  type MaterialFilterWerte,
} from '../lib/materialien/browse';
import type { BrowseMaterial, BehoerdeId, DoktypId } from '../lib/materialien/typen';

// ─── Rubrik «Amtliche Ressourcen / Materialien» (Auftrag David, Auftrag 5) ──
//
// Übersicht der praxisleitenden Behörden-Publikationen (ESTV-Kreisschreiben,
// EDÖB-Leitfäden, SECO-Wegleitungen, BSV-Wegleitungen, EHRA-Praxismitteilungen,
// FINMA-Rundschreiben, IGE-Richtlinien). Das sind KEINE Gesetze und keine
// Gerichtsentscheide, sondern faktisch praxisleitendes «Soft-Law». Jede Karte
// führt auf eine In-App-Detailseite mit Metadaten + Live-Link; massgeblich bleibt
// stets die amtliche Quelle (§7/§8). Reine Darstellung (§3); maschinell kuratiert,
// fachlich noch nicht durch David geprüft (Abnahme-Zeitsperre).

export function Materialien() {
  const [materialien, setMaterialien] = useState<BrowseMaterial[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [behoerde, setBehoerde] = useState<BehoerdeId | ''>('');
  const [doktyp, setDoktyp] = useState<DoktypId | ''>('');
  // ?q= aus dem «alle N →»-Sprung der Universal-Suche (UI-NAV S1) füllt das
  // Filterfeld vor — sonst landete man auf der ungefilterten Rubrik (§8).
  const [suche, setSuche] = useSucheAusUrl();
  const pk = usePaneKlasse();

  useEffect(() => {
    let lebt = true;
    ladeMaterialManifest().then((m) => {
      if (!lebt) return;
      if (!m) { setFehler(true); return; }
      setMaterialien(m.materialien);
    });
    return () => { lebt = false; };
  }, []);

  const doktypOptionen = useMemo(() => vorhandeneDoktypen(materialien ?? []), [materialien]);
  const gefiltert = useMemo(() => {
    if (!materialien) return [];
    const f: MaterialFilterWerte = {
      behoerde: behoerde || undefined,
      doktyp: doktyp || undefined,
      suche: suche || undefined,
    };
    return filtere(materialien, f);
  }, [materialien, behoerde, doktyp, suche]);
  const gruppen = useMemo(() => gruppiereNachBehoerde(gefiltert), [gefiltert]);

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Amtliche Ressourcen"
        titel="Materialien"
        intro="Praxisleitende Publikationen der Bundesbehörden — Kreisschreiben, Wegleitungen, Leitfäden, Rundschreiben und Praxismitteilungen. Das ist faktisches «Soft-Law», kein Gesetzesrang: jeder Eintrag führt mit Live-Link zur amtlichen Fassung. Diese Rubrik führt keine eigenen Volltexte; massgeblich ist stets die amtliche Quelle."
      />

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!materialien && !fehler && (
        <div className="py-12 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Die Übersicht wird abgerufen …</p>
        </div>
      )}

      {materialien && (
        <>
          <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Materialien filtern">
            <label className="flex flex-wrap items-center gap-2 text-body-s text-ink-600">
              <span>Behörde</span>
              <select
                value={behoerde}
                onChange={(e) => setBehoerde(e.target.value as BehoerdeId | '')}
                className="lc-select lc-input-sm w-full min-w-0 sm:w-auto sm:min-w-[12rem]"
              >
                <option value="">Alle</option>
                {gruppiereNachBehoerde(materialien).map((g) => (
                  <option key={g.behoerde} value={g.behoerde}>{g.kuerzel} — {g.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-wrap items-center gap-2 text-body-s text-ink-600">
              <span>Dokumenttyp</span>
              <select
                value={doktyp}
                onChange={(e) => setDoktyp(e.target.value as DoktypId | '')}
                className="lc-select lc-input-sm w-full min-w-0 sm:w-auto sm:min-w-[11rem]"
              >
                <option value="">Alle</option>
                {doktypOptionen.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>
            {/* O5 (W2·10-UI-NAV-O): das lokale Feld erklärt seinen Scope. Ohne
                Label sah es aus wie die App-Suche im Kopf und weckte die falsche
                Erwartung, es fände Gesetzesartikel — es filtert aber nur die
                Felder dieser Rubrik. Der Wortlaut nennt genau, worüber `filtere`
                in lib/materialien/browse.ts sucht (Titel · Nummer · Behörde ·
                Dokumenttyp), und zeigt den Weg zur grossen Suche. Von Anfang an
                im Layout (§15.2, kein CLS) und programmatisch mit dem Feld
                verknüpft (aria-describedby) — dieselbe Anatomie wie das
                Scope-Label auf /gesetze (§5). */}
            <label className="flex flex-col gap-1.5 text-body-s text-ink-600 flex-1 min-w-[12rem]">
              <span className="sr-only">Suche</span>
              <input
                type="search"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Titel, Nummer oder Behörde suchen …"
                aria-describedby="materialien-filter-scope"
                className="lc-input lc-input-sm w-full"
              />
              <span id="materialien-filter-scope" className="block min-h-5 text-xs text-ink-500">
                Nur Titel, Nummer, Behörde und Dokumenttyp dieser Rubrik — Gesetzes- und Entscheidtext über die Suche oben.
              </span>
            </label>
          </div>

          {gruppen.length === 0 ? (
            <p className="text-body-s text-ink-500">Kein Material gefunden. Filter zurücksetzen?</p>
          ) : (
            <div className="space-y-10">
              {gruppen.map((g) => (
                <section key={g.behoerde} id={`b-${g.behoerde}`} className="space-y-3 scroll-mt-24">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h2 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{g.kuerzel}</h2>
                      <span aria-hidden className="flex-1 h-px bg-line" />
                      <span className="num text-body-s text-ink-500">{g.materialien.length}</span>
                    </div>
                    <p className="text-body-s text-ink-500 max-w-reading">{g.name}</p>
                  </div>
                  <div className={pk('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 @3xl/pane:grid-cols-3 gap-3')}>
                    {g.materialien.map((m) => <MaterialKarte key={m.key} m={m} />)}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
