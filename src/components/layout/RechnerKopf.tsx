import type { Calculator } from '../../lib/calculators';
import { sansAmp } from '../typografie';
import { NormChip } from '../vorlagen/NormChip';
import { SeitenTitel } from '../ui/SeitenTitel';

// Gemeinsamer Rechner-Kopf (Vorlage Abschnitt 4): Overline, H1, Einleitung,
// Chips. Pfadangabe und Rückweg trägt die globale Leiste (`InhaltsKopf` in der
// Einzelansicht, `PaneKopf` im Split-View) — Herleitung am Streich-Kommentar
// unten (LM-181).
// Overrides (Fix 6.6.2026, Befund David): Rechner mit Binnen-Navigation
// (Zuständigkeit: Rechtswege Zivil/SchKG/Straf) zeigen sonst immer die
// ZPO-Chips der Registry — Kategorie/Beschrieb/Normen sind deshalb pro
// gewähltem Rechtsweg überschreibbar (reine Anzeige, §3).
export function RechnerKopf({ calc, titelOverride, kategorieOverride, kurzbeschriebOverride, normenOverride }: {
  calc: Calculator;
  titelOverride?: string;
  kategorieOverride?: string;
  kurzbeschriebOverride?: string;
  normenOverride?: string[];
}) {
  const titel = titelOverride ?? calc.titel;
  const kategorie = kategorieOverride ?? calc.kategorie;
  const kurzbeschrieb = kurzbeschriebOverride ?? calc.kurzbeschrieb;
  const normen = normenOverride ?? calc.normen;
  return (
    <div className="space-y-3 mb-8">
      {/* ── LM-181 (W2·17-UI-BEFUNDE/B14) · EINE PFADANGABE, NICHT ZWEI ────────
          Hier stand bis 4.9.2026 eine eigene Navigationszeile «← Alle Rechner |
          Rechner / <Titel>». Gemessen am selben Tag @1440 auf /rechner/zpo-fristen
          (Preview von origin/main) standen dadurch ZWEI vollständige Pfadangaben
          mit identischem Inhalt in unterschiedlicher Typografie übereinander:
            · «‹ Rechner › Verfahrens- & Rechtsmittelfristen ✕»  (InhaltsKopf)
            · «← Alle Rechner | Rechner / Verfahrens- & Rechtsmittelfristen» (hier)
          Die obere ist die GLOBALE Leiste jeder Inhaltsseite (`INHALT_RE` deckt
          `rechner/[^/]+` ab, InhaltsKopfKontext.ts); die untere ist später mit dem
          Inhalts-Kopf (W2·7-BEZUG) zur Doppelung geworden. Es weicht die lokale.

          W2·10-UI-NAV/N0a WIRD NICHT GEKIPPT (§0.2): N0a hat an dieser Zeile das
          ZIEL des Rückwegs von «/» auf «/rechner» korrigiert und das Label ans
          Ziel angeglichen. Genau diese Substanz trägt die verbleibende Leiste
          weiter — `kopfVonPfad` baut für `/rechner/<key>` die Krume
          `{ label: 'Rechner', to: '/rechner' }` (InhaltsKopfKontext.ts), also
          dasselbe Ziel unter demselben Label. Was entfällt, ist allein die zweite
          Darstellung desselben Weges. */}
      <p className="lc-overline">{kategorie}</p>
      {/* A-1: EIN Titel-Baustein (`ui/SeitenTitel`) — im Pane skaliert er an der
          Pane-Breite statt am Viewport. */}
      <SeitenTitel>{sansAmp(titel)}</SeitenTitel>
      <p className="text-body-l text-ink-600 max-w-reading">{kurzbeschrieb}</p>
      {/* lc-chip-zeile (LM-044/N1): die Norm-Chips sind <a> und tragen damit die
          Link-Unterstreichung als Form-Merkmal — ein Normverweis sieht anders aus
          als die Stand-/Metadatum-Chips derselben Anatomie (§23). */}
      <div className="lc-chip-zeile flex flex-wrap gap-1.5">
        {/* Norm-Chips mit Fedlex-Direktlink + Volltext-Popover (Spannen/ff. →
            führender Artikel; NormChip leitet URL/Snapshot aus dem Artikel ab). */}
        {normen.map((n) => (
          <NormChip key={n} artikel={n} title={`${n} auf Fedlex öffnen`} />
        ))}
      </div>
    </div>
  );
}
