import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ladeMaterial } from '../lib/materialien/browse';
import { KontextPanel } from '../components/kontext/KontextPanel';
import { StatusBadge } from '../components/verzahnung/StatusBadge';
import { GEBIET_LABEL } from '../lib/normtext/register';
import { MASSGEBLICH_SATZ } from '../lib/benennung';
import { Datum } from '../components/ui/Datum';
import { QuellLink } from '../components/ui/QuellLink';
import { useMeldeInhaltsKopf } from '../components/layout/InhaltsKopfKontext';
import type { BrowseMaterial } from '../lib/materialien/typen';

// ─── Reader EINES Materials (/materialien/:key) ─────────────────────────────
//
// Amtliche Ressource (Soft-Law). Zeigt NUR bibliografische Metadaten + einen
// prominenten Live-Link zur amtlichen Fassung — KEIN gespeicherter Dokument-
// inhalt (§7/§8: kein Normtext, kein Extraktionsrisiko, massgeblich bleibt die
// amtliche Quelle). Dazu die Verzahnung zu Gesetzen + Werkzeugen über normKeys
// (Burggraben-Keim, später B3-Kontext-Panel). Reine Darstellung (§3); maschinell
// kuratiert, fachlich noch nicht durch David geprüft (Abnahme-Zeitsperre, §8).

const SPRACH_LABEL: Record<string, string> = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch' };

export function MaterialLeser() {
  const { key = '' } = useParams();
  const meldeKopf = useMeldeInhaltsKopf();
  // Ein Zustand pro geladenem key — `laden` wird abgeleitet (kein synchrones
  // setState im Effect; vermeidet kaskadierende Renders, react-hooks-Regel).
  const [data, setData] = useState<{ key: string; material: BrowseMaterial | null } | null>(null);

  useEffect(() => {
    let lebt = true;
    ladeMaterial(decodeURIComponent(key)).then((m) => {
      if (!lebt) return;
      setData({ key, material: m });
      if (m) document.title = `${m.titel} — LexMetrik`;
    });
    return () => { lebt = false; };
  }, [key]);

  // Kopf melden (sonst zeigte der Pfad-Fallback «Zuletzt geöffnet», weil
  // verlaufLabel keine Materialien-Keys auflöst). Kurz-Label = Klammer-Inhalt
  // des Titels (z. B. «WML»), sonst der Titel.
  //
  // ── A-3 (Design-Konsistenz 31.8.2026) · DER GUARD WAR EINER ZU VIEL ────────
  // Hier stand `if (imPane) return;` — die Meldung unterblieb im Split-View.
  // GEMESSEN: das Pane hiess dann «Material öffnen» (der Verlauf-Fallback),
  // während dieselbe Seite in der Einzelansicht «Materialien › WML» trug: zwei
  // Namen für dasselbe Dokument, und der eine benennt eine HANDLUNG statt des
  // Inhalts (§8 — der Kopf sagt, was offen ist, nicht was man tun könnte).
  // Der Guard war aus der Sorge geboren, die Meldung könnte den Kopf der
  // Hauptfläche überschreiben. Sie kann es nicht: die Melde-Kette ist
  // PANE-LOKAL — `Pane.tsx:125` legt einen eigenen `InhaltsKopfMeldeProvider`
  // um seinen `RouteSwitch`, die Meldung aus dem Pane erreicht darum nur den
  // `PaneKopf` desselben Panes. Damit trägt die Prop `imPane` hier keine
  // Aussage mehr und ist mit dem Guard weggefallen (§17 Rückbau).
  useEffect(() => {
    const mat = data && data.key === key ? data.material : null;
    if (!mat) return;
    const kurz = mat.titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? mat.titel;
    meldeKopf({ breadcrumb: [{ label: 'Materialien', to: '/materialien' }, { label: kurz }] });
  }, [data, key, meldeKopf]);
  // KEIN Unmount-Cleanup `meldeKopf(null)` — gleiche Wurzel wie im
  // EntscheidLeser (Befund David 21.8.2026, Herleitung dort): die Shell setzt
  // bei jedem Pfadwechsel zurück, das passive Cleanup wischte sonst die
  // Kopf-Reservierung der Folgeseite weg.

  const laden = !data || data.key !== key;
  const material = laden ? null : data.material;

  if (laden) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Das Material wird abgerufen …</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="space-y-6">
        <SeitenKopf overline="Amtliche Ressourcen" titel="Material nicht gefunden"
          intro="Dieser Eintrag existiert nicht (mehr). Zurück zur Übersicht der Materialien." />
        <Link to="/materialien" className="lc-btn lc-btn-outline lc-btn-sm">← Alle Materialien</Link>
      </div>
    );
  }

  const m = material;
  const overline = m.nummer ? `${m.behoerdeKuerzel} · ${m.doktypLabel} ${m.nummer}` : `${m.behoerdeKuerzel} · ${m.doktypLabel}`;

  return (
    <article className="space-y-8">
      <SeitenKopf overline={overline} titel={m.titel}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-body-s text-ink-500">
          <span>{m.behoerdeName}</span>
          <span aria-hidden>·</span>
          {/* B-3: das Datum lief hier in der Mono-Stimme (`.num`) — die ist
              nach der Design-Grundlage Kap. 2.1 «auf SR-Nr./Aktenzeichen
              begrenzt». Jetzt der geteilte `Datum`-Baustein (proportional +
              tabular-nums), wie im Erlass-Kopf. */}
          <span>Stand <Datum iso={m.stand} /></span>
          <span aria-hidden>·</span>
          <span>{SPRACH_LABEL[m.sprache] ?? m.sprache}</span>
          <span aria-hidden>·</span>
          <span>{GEBIET_LABEL[m.rechtsgebiet] ?? m.rechtsgebiet}</span>
          {/* V3-Vorzug (E6a·M5): kein gehosteter Volltext — nur Verweis + Live-Link. */}
          <StatusBadge praedikat="nur-verweis" />
        </div>
      </SeitenKopf>

      {/* §8: ehrlicher Status — Soft-Law, kein Gesetzesrang, fachlich ungeprüft. */}
      <div className="lc-notice max-w-reading">
        <p>
          <strong>Behördenpublikation, kein Gesetzesrang.</strong> Verwaltungsverordnungen
          (Kreisschreiben, Wegleitungen, Leitfäden u.&nbsp;a.) binden die Verwaltung intern und
          sind faktisch praxisleitend, aber für Gerichte und Private nicht direkt verbindlich.
          {' '}{MASSGEBLICH_SATZ} Maschinell erfasst, fachlich noch nicht
          geprüft.
        </p>
        {m.hinweis && <p className="mt-2 text-ink-500">{m.hinweis}</p>}
      </div>

      {/* Sichtbarer Live-Link zur amtlichen Fassung (§7c).
          ── B-1 (31.8.2026) · EIN NAME, EINE FORM ──────────────────────────────
          GEMESSEN stand hier die lauteste von vier Formen desselben Links: ein
          schwarzer Primärknopf mit «Zur amtlichen Fassung ↗», während derselbe
          Link im Erlass-Kopf seit Ä110 ein ruhiger Textlink «Amtliche Fassung ↗»
          ist. Ein Primärknopf ist die Form für die EINE Erledigung einer Seite;
          hier führt er aus der Seite hinaus zu einer Auskunft. Beides — Wort und
          Form — kommt jetzt aus dem geteilten `QuellLink`.
          Der ROHE URL-ABDRUCK darunter BLEIBT: er ist keine blosse Dopplung des
          `href`, sondern eine datierte Transparenz-Zusage (§7c/§8) — dass man
          VOR dem Klick sieht, auf welche Behörden-Domain man geschickt wird.
          Sie ist als solche zugesichert (`e2e/materialien-m1…m4`: «Die URL steht
          zusätzlich als sichtbarer Text»). Ihn im Zug einer Design-Angleichung
          zu entfernen, wäre ein Abbau von Ehrlichkeit, nicht von Dopplung. */}
      <div>
        <QuellLink href={m.quelleUrl} />
        <p className="mt-2 text-xs text-ink-500 break-all max-w-reading">{m.quelleUrl}</p>
      </div>

      {/* Einheitliches Kontext-Panel (B3): Norm ↔ Entscheid ↔ Werkzeug über die
          normKeys des Materials (Burggraben — Behördenpraxis an die Norm/den
          Entscheid gebunden). */}
      <KontextPanel typ="material" normKeys={m.normKeys} />

      <div className="border-t border-line pt-6">
        <Link to="/materialien" className="lc-btn lc-btn-outline lc-btn-sm">← Alle Materialien</Link>
      </div>
    </article>
  );
}
