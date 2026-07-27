import { Link } from 'react-router-dom';
import type { InternRefs } from '../../components/NormText';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { CurrencyMap, ErlassKopf } from '../../lib/normtext/browse';
import { KontextPanel } from '../../components/kontext/KontextPanel';
import { formatiereDatum } from './helpers';
import { ErlassKopfBlock, ErlassLeserKopf } from './parts';
import { AmtlichesPdf } from './parts/AmtlichesPdf';

// ═══ ABSCHNITT · Nicht-Volltext-Leseansichten (§6.6-Split, W2·12-HYGIENE/B24) ═══
// Reine Präsentationskomponenten (Props rein, §3) — aus GesetzLeserInhalt
// ausgelagert, damit die Reader-Datei unter der §6.6-Schlankheitsschwelle bleibt.
// VERHALTENSNEUTRAL: identisches Markup wie die früheren Inline-Zweige (golden/
// Snapshot byte-gleich); keine Rechtsregel, kein Normtext, keine Reihenfolge berührt.

// §15.2 CLS-Lade-Reservierung: solange Snapshot/Struktur/Currency async laden,
// reserviert min-h-screen (Token, §13) die volle Lesehöhe. Kein Inhalt wird
// versteckt/gekürzt (§15/2) — es ist derselbe Spinner-Platzhalter für alle
// Lade-Pfade (Fehler ausgenommen), damit der einwachsende React-Baum keinen
// grossen Sprung erzeugt.
export function LadeAnzeige() {
  return (
    <div className="min-h-screen py-12 text-center space-y-3">
      <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
      <p className="text-body-s text-ink-500">Der Erlass wird abgerufen …</p>
    </div>
  );
}

// ── pdf-embed: amtliches PDF in-app (kein extrahierbarer Volltext-HTML) ──────
// Auftrag David 25.6.2026: statt nacktem Live-Link das amtliche Fedlex-PDF in
// den vollen Reader-Rahmen einbetten (Breadcrumb, Kopf, Provenienz, Download,
// native PDF-Suche). Fedlex setzt X-Frame-Options: DENY → Hotlink unmöglich,
// darum SELBST gehostet (same-origin). Wichtig: die globale DENY-Header-Politik
// (vercel.json) ist für /normtext/ auf SAMEORIGIN + frame-ancestors 'self'
// gelockert, sonst blockiert der Browser auch den eigenen PDF-iframe (Prod-only).
// Massgeblich bleibt die amtliche Quelle (sichtbarer Live-Link, §7/§8); Drift-
// Tor: check:pdf (offline Integrität + netz Drift & geltende Konsolidierung).
export function PdfEmbedAnsicht({ erlass, currency, kopf, internRefs }: {
  erlass: BrowseErlass;
  currency: CurrencyMap | null;
  kopf: ErlassKopf | null;
  internRefs: InternRefs | undefined;
}) {
  return (
    <div className="space-y-5">
      {/* Breadcrumb trägt der Kopf (Inhalts-Kopf bzw. PaneKopf) — kein Inline-Dup.
          G2b: EINE Kopf-Komponente (ErlassLeserKopf) — hier ohne Options-Leiste,
          da am eingebetteten PDF Linien/Fussnoten/Verweise wirkungslos wären
          (keine toten Steuerelemente, §13 F4). */}
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={null} currency={currency?.[erlass.key]}
        overline={`${erlass.ebene === 'bund' ? 'Staatsvertrag' : `Kanton ${erlass.kanton}`} · amtliches PDF`}
        hinweis="Amtliches PDF — massgeblich ist die amtliche Fassung"
        aktionen={
          <AmtlichesPdf href={`/normtext/${erlass.pdfPfad}`} stand={erlass.stand} extern={false} dateiname={`${erlass.kuerzel}.pdf`} />
        } />
      {/* M5: Erlass-Kopf-Slot auch im pdf-embed-Pfad (für PDF-Erlasse ohne
          Struktur-Sidecar bleibt kopf=null → nichts gerendert). */}
      {kopf && <ErlassKopfBlock kopf={kopf} intern={internRefs} />}
      {/* Eingebettetes amtliches PDF (same-origin → Browser-Viewer mit nativer
          Suche/Zoom/Druck). iframe ist für Inline-PDF am zuverlässigsten; darunter
          ein sichtbarer Fallback-Link für Browser ohne PDF-Viewer. */}
      {/* ⑦ PDF-Rahmen (W2·5d G3a): der iframe-Rahmen nutzt die benannte Struktur-
          Linie (border-rule-struktur) statt der Ad-hoc border-line — konsistent mit
          dem Linien-Kanon (§2.2⑦). Das PDF IST die amtliche Fassung (§7/§8). */}
      <iframe src={`/normtext/${erlass.pdfPfad}#view=FitH`} title={`${erlass.kuerzel} — amtliches PDF`}
        className="w-full rounded-lg border border-rule-struktur bg-paper-sunken/30"
        style={{ height: 'min(82vh, 1100px)' }} />
      {/* Einheitliches Kontext-Panel (B3): Entscheide/Materialien/Werkzeuge zu
          diesem Erlass am Leseende (Single Source mit dem Volltext-Reader). */}
      <KontextPanel typ="norm" normKeys={[erlass.key]} />
      <nav className="mt-4 border-t border-line pt-5 flex flex-wrap justify-between gap-3 text-body-s" aria-label="Weitere Erlasse">
        <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">‹ Übersicht</Link>
        <a href={`/normtext/${erlass.pdfPfad}`} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">Amtliches PDF in neuem Tab öffnen ↗</a>
      </nav>
    </div>
  );
}

// ── ⑧ LIVE_VERWEIS: kein In-App-Volltext — ehrliche Verweiskarte (§8) ────────
// Statt der «nicht verfügbar»-Fehlerseite: prominenter amtlicher Live-Link +
// Stand + ehrlicher Hinweis «nicht als In-App-Volltext gehostet» (FAHRPLAN
// §2.2⑧, Referenz DSGVO). Massgeblich bleibt die amtliche Quelle (§7/§8). Reine
// Darstellung; eintraege bleibt null (darum VOR dem Lade-Guard unten).
export function LiveVerweisAnsicht({ erlass, currency }: {
  erlass: BrowseErlass;
  currency: CurrencyMap | null;
}) {
  const verweisOverline = `${erlass.rechtsgebiet === 'international' ? 'International' : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`} · amtlicher Verweis`;
  return (
    <div className="space-y-5">
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={null} currency={currency?.[erlass.key]}
        overline={verweisOverline}
        hinweis="Verweis — massgeblich ist die amtliche Fassung" />
      <section className="max-w-reading space-y-4 rounded-lg border border-rule-struktur bg-paper-sunken/20 p-5">
        <p className="font-serif text-body-l leading-[1.65] text-ink-700">
          Dieser Erlass wird in LexMetrik <strong className="font-semibold">nicht als In-App-Volltext gehostet</strong>.
          Massgeblich und vollständig ist die amtliche Fassung bei der Quelle.
        </p>
        {erlass.quelleUrl && (
          <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-brass-400 px-3 py-2 text-body-s font-medium text-brass-700 no-underline hover:border-brass-500 hover:bg-brass-100/40 transition-colors">
            <span aria-hidden>↗</span> Amtliche Fassung öffnen
          </a>
        )}
        {erlass.stand && (
          <p className="text-micro text-ink-500">Stand der zuletzt erfassten Referenz: <span className="num">{formatiereDatum(erlass.stand)}</span></p>
        )}
      </section>
      {/* Einheitliches Kontext-Panel (B3) auch hier: Entscheide/Materialien/
          Werkzeuge zu diesem Erlass (Single Source, §5). */}
      <KontextPanel typ="norm" normKeys={[erlass.key]} />
      <nav className="mt-4 border-t border-line pt-5 flex flex-wrap justify-between gap-3 text-body-s" aria-label="Weitere Erlasse">
        <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">‹ Übersicht</Link>
        {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">Amtliche Fassung in neuem Tab öffnen ↗</a>}
      </nav>
    </div>
  );
}
