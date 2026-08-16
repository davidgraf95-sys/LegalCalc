import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { naechsteInstanz, merkeTab } from '../../../lib/tabs';
import { grundartMeta, kopfOverline } from '../helpers';
import { ErlassKopfBlock, ErlassLeserKopf } from '../parts';
import { ErlassUebersicht } from '../parts/ErlassUebersicht';
import { GliederungSheet } from '../parts/GliederungSheet';
import { AmtlichesPdf } from '../parts/AmtlichesPdf';
// Geteilte ANSICHTS-ZUSTÄNDE (Fehlseite · Currency-Pin · pdf-embed · Laden).
// Der zweite verbleibende Berührungspunkt zur `inhalt-*`-Familie neben dem
// Daten-Adapter — und ein bewusster: das sind Zustände des LESERS, nicht der
// Hülle. Sie umzuziehen hiesse, eine unter FL-4 eingefrorene Datei anzufassen;
// die Umbenennung in einen neutralen Namensraum gehört zu H5.
import { LadeAnzeige, FruehAnsicht } from '../inhalt-ansichten';
import { WeiterlesenChip } from '../parts/WeiterlesenChip';
import { LeserTastatur } from '../parts/LeserTastatur';
import { LeserKopf } from './LeserKopf';
import { LeserSeitenleiste } from './LeserSeitenleiste';
import { LeserGliederung } from './LeserGliederung';
import { LeserLesespalte } from './LeserLesespalte';
import { SuchSprungFeld } from './SuchSprungFeld';
import { UebersichtBox } from './UebersichtBox';
import { kopfHoehe, useKopfStufe } from './kopfStufen';
import { useSuchSprungKuerzel } from './suchKuerzel';
import { overlineGebiet, uebersichtsZeile } from './erlassAnsicht';
import { useLeserV3Modell } from './leserV3Modell';

// ═══ LESER V3 · Rahmen (FAHRPLAN-LESER-V3, Etappe H1) ═══════════════════════
//
// **Nur Layout.** Daten und Effekte kommen fertig aus `./leserV3Modell` (die
// eine Naht zur geteilten Maschinerie), der Lesekörper aus `./LeserLesespalte`.
// Diese Datei entscheidet ausschliesslich, **wo etwas steht** — und ist damit
// die Datei, die man liest, um die Hülle zu verstehen.
//
// DER AUFBAU, VON OBEN:
//   LeserKopf            klebt · Ort · Ansicht · ✕            (Kap. 4a)
//   ┌ aside ────────────┬ Zelle ───────────────────────────┐
//   │ Übersicht (zu)    │ ErlassLeserKopf                  │  (Kap. 4b/4e)
//   │ Such-/Sprungfeld  │ ErlassKopfBlock (Ingress)        │
//   │ Gliederung klebt  │ Lesespalte  ← KERN, eingefroren  │  (Kap. 1.3)
//   └───────────────────┴──────────────────────────────────┘
// Unter 1024 px wird aus der Spalte ein Bottom-Sheet hinter ☰ — dasselbe
// Bauteil, anderer Behälter.
//
// ── ERWEITERUNGSPUNKTE (Fundament-Auflage 3, Auftrag David 16.8.2026) ───────
// Die kommenden Etappen hängen an benannten, typisierten Slots — nicht an
// TODO-Kommentaren im JSX. Wer sie füllt, ändert **eine** Prop-Zeile:
//
//   panelOeffner   H3 · Rechtsprechungs-/Kontext-Panel: der Zähler «⚖ 14
//                  Entscheide →» in der Kopfzeile, der das Panel aufzieht.
//   panelSlot      H3 · das Panel bzw. Sheet selbst (Fläche rechts auf D,
//                  Sheet auf S/H — «nie drei vertikale Flächen», Kap. 4d).
//   beiwerkSlot    S2 · Beiwerk-Zone mit reservierter Mindesthöhe je Artikel
//                  (Fassung · Entscheid-Zähler · Fussnoten), Pos. 13.
//   fassungsWahl   W2·5g · Zeitmaschine/Fassungswahl neben dem Erlass-Kopf.
//   leisteExtra    Zusätzliche Blöcke am Fuss der Seitenleiste (Kontext-Reiter).
//
// Alle sind `ReactNode | undefined`. Ein nicht gesetzter Slot rendert **nichts**
// — kein leerer Kasten, keine reservierte Fläche, kein CLS. Das ist Absicht:
// ein Erweiterungspunkt darf im Grundzustand nichts kosten (§15), sonst zahlt
// jeder Leser für eine Etappe, die es noch nicht gibt.
//
// ── EINE WURZEL FÜR PANE UND BREITE (Kap. 10) ───────────────────────────────
// `imPane`/`istSekundaer`/`istXl` kommen als `umgebung` aus dem Modell und
// werden GENAU HIER gelesen — sonst nirgends in `v3/` (bewacht von
// `src/tests/leser-v3-fundament.test.ts`). Die zwei Werte, die daraus folgen,
// stehen als CSS-Variablen am Wurzel-Element — damit rechnet auch der
// Sprung-Offset der Anker aus derselben Quelle (Risiko R1, Lehre LM-003).
//
// Bis 16.8. lag `umgebung` zusätzlich in einem React-Kontext
// (`LeserV3Kontext.ts`, Provider hier, `useLeserV3Kontext` dort). Der hatte
// nach dem Fundament-Umbau NULL Konsumenten: alle Bauteile bekommen, was sie
// brauchen, als Prop. Gestrichen statt bewacht (§17 Rückbau, Architektur-Review
// A2); braucht H3 eine Verteilung ohne Prop-Drilling, legt es sie in fünf
// Zeilen neu an — mit dem dann bekannten Konsumenten.

export interface LeserRahmenV3Props {
  ebene: string;
  schluessel: string;
  /** H3 — Öffner des Rechtsprechungs-Panels (Zähler) in der Kopfzeile. */
  panelOeffner?: ReactNode;
  /** H3 — das Panel/Sheet selbst. */
  panelSlot?: ReactNode;
  /** S2 — Beiwerk-Zone unter dem Lesetext (Fassung · Zähler · Fussnoten).
   *  Der Rahmen reicht ihn an `LeserLesespalte` durch; ungesetzt rendert die
   *  Spalte dafür KEIN Element (kein leerer Kasten, kein CLS). */
  beiwerkSlot?: ReactNode;
  /** W2·5g — Fassungswahl/Zeitmaschine in den Aktionen des Erlass-Kopfs. */
  fassungsWahl?: ReactNode;
  /** Zusätzliche Blöcke am Fuss der Seitenleiste (Kontext-Reiter u. Ä.). */
  leisteExtra?: ReactNode;
}

export function LeserRahmenV3({
  ebene, schluessel, panelOeffner, panelSlot, beiwerkSlot, fassungsWahl, leisteExtra,
}: LeserRahmenV3Props) {
  const navigate = useNavigate();
  const { modell: m, umgebung } = useLeserV3Modell({ ebene, schluessel });
  const { stufe, kopfRef } = useKopfStufe();

  // ⌘K / «/» — Zusage des RAHMENS, nicht des Feldes (Bug-Check B1): erst die
  // Fläche öffnen, in der das Feld steht, dann fokussieren. Steht VOR den
  // frühen Rückgaben, weil Hooks nicht bedingt laufen dürfen; der Ist-Zustand
  // wird erst beim Tastendruck gelesen, nicht beim Registrieren.
  const suchFeldRef = useRef<HTMLInputElement>(null);
  useSuchSprungKuerzel({
    feldRef: suchFeldRef,
    onKuerzel: () => {
      if ((m.eintraege?.length ?? 0) === 0) return;
      // @≥1024 px: zugeklappte Spalte aufziehen (sonst gäbe es kein Feld zu
      // fokussieren). Darunter: Bottom-Sheet öffnen. Beides idempotent.
      if (umgebung.istXl) m.setTocOffen(true);
      else m.setTocAuf(true);
    },
  });

  // Frühe Ansichten (Fehlseite · Currency-Pin · pdf-embed · nur-live-link) und
  // der Ladezustand — dieselben Bausteine wie die Ist-Hülle (§5).
  const frueheAnsicht = FruehAnsicht({
    fehler: m.fehler, schluessel, manifest: m.manifest, erlass: m.erlass,
    currency: m.currency, kopf: m.kopf, internRefs: m.internRefs,
  });
  if (frueheAnsicht) return frueheAnsicht;
  if (!m.erlass || !m.eintraege) return <LadeAnzeige />;

  const { erlass, eintraege } = m;
  const meta = grundartMeta(erlass.key);
  const bestimmungsWort = meta.bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';
  const hatLeiste = eintraege.length > 0;
  const zweiSpalten = umgebung.istXl && hatLeiste && m.tocOffen;

  const suchFeld = (
    <SuchSprungFeld wert={m.suche} setzeWert={m.setSuche} loeseArtikel={m.loeseArtikel}
      onSprung={m.springeZuArtikel} feldRef={suchFeldRef} />
  );

  const leiste = (imSheet: boolean) => (
    <LeserSeitenleiste
      uebersicht={(
        <UebersichtBox zusammenfassung={uebersichtsZeile(erlass, eintraege.length, bestimmungsWort)}
          warnung={m.nichtKonsolidiert
            ? (
              <p className="flex items-start gap-1 text-micro leading-snug text-warn-700">
                <span aria-hidden className="shrink-0">⚠</span>
                <span>Eine in Kraft getretene Änderung ist noch nicht eingearbeitet — massgeblich ist die amtliche Fassung.</span>
              </p>
            )
            : undefined}>
          <ErlassUebersicht erlass={erlass} kopf={m.kopf} currency={m.currency?.[erlass.key]}
            erlassTyp={meta.erlassTyp} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
            bestimmungsEtikettStatus={meta.bestimmungsEtikettStatus}
            gliederungsTiefe={m.gliederungsTiefe} kennzahlen={m.gliederung.kennzahlen}
            kantonSys={m.kantonSys} kantonErlassAnzahl={m.kantonErlassAnzahl}
            nichtKonsolidiert={m.nichtKonsolidiert} />
        </UebersichtBox>
      )}
      // Im Sheet trägt dessen eigene Anatomie das Feld bereits zuoberst
      // (§5 — nie zwei Eingaben für dieselbe Absicht, genau der Fehler K2).
      suchFeld={imSheet ? undefined : suchFeld}
      baum={<LeserGliederung m={m} />}
      baumTitel={m.sucheAktiv ? 'Treffer' : 'Gliederung'}
      onAlleAuf={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, true])) }))}
      onAlleZu={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, false])) }))}
      alleOffen={m.alleKnotenIds.length > 0 && m.alleKnotenIds.every((id) => m.tocBaum[id] === true)}
      onAnfang={m.zumAnfang}
      extra={leisteExtra} />
  );

  // ☰ nur, wenn die Gliederung gerade NICHT als Spalte steht — sonst ein Knopf
  // ohne Wirkung (Design-Grundlage Kap. 6, Icon-Flut-Verbot).
  const gliederungKnopf = hatLeiste && !zweiSpalten
    ? (
      <button type="button" data-v3-gliederung-auf
        aria-expanded={umgebung.istXl ? m.tocOffen : m.tocAuf}
        onClick={() => { if (umgebung.istXl) m.setTocOffen(true); else m.setTocAuf((v) => !v); }}
        title="Gliederung" aria-label="Gliederung" className="lc-leiste-griff">
        <span aria-hidden>☰</span>
      </button>
    )
    : undefined;

  return (
    <div
      ref={kopfRef}
      data-leser-v3="rahmen"
      className="lc-leser space-y-5"
      data-grundart={meta.grundart ?? undefined}
      // ── Die EINE Stelle, an der Kopf-Geometrie steht (Risiko R1) ────────
      // `--leser-kopf-h` behält seine Ist-BEDEUTUNG (Topbar + App-Leiste) —
      // sie umzudeuten hätte das geteilte `GliederungSheet` still verstellt,
      // das daraus seine Höhe rechnet (§5: eine Variable, eine Bedeutung).
      // `--nt-stick` speist sich daraus und ist damit automatisch richtig,
      // wenn die Kopfzeile ihre Stufe wechselt — genau das fehlte im Ist-Stand.
      style={{
        '--leser-v3-kopf-h': kopfHoehe(stufe),
        '--leser-v3-kopf-top': umgebung.imPane ? '0rem' : 'var(--leser-kopf-h)',
        '--leser-kopf-h': 'calc(4rem + 2.25rem)',
        '--leser-sub-h': umgebung.imPane ? 'var(--leser-v3-kopf-h)' : '0rem',
        '--nt-stick': umgebung.imPane
          ? 'var(--leser-sub-h)'
          : 'calc(var(--leser-kopf-h) + var(--leser-v3-kopf-h))',
      } as CSSProperties}>

      <LeserKopf erlass={erlass} aktArtikel={m.aktArtikel} fussnotenAnzahl={m.fussnotenAnzahl}
        stufe={stufe} gliederungKnopf={gliederungKnopf} panelOeffner={panelOeffner} />

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie
          (Dialog-Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) —
          §5, kein zweiter Overlay-Mechanismus. */}
      {!umgebung.istXl && m.tocAuf && hatLeiste && (() => {
        const ziel = (umgebung.imPane && umgebung.overlayWurzel?.current) || null;
        const sheet = (
          <GliederungSheet sheetRef={m.refs.tocDrawerRef} inPane={ziel != null}
            onSchliessen={() => m.setTocAuf(false)}
            pfad={m.siePfad} aktArtikelLabel={m.siePfadArtikel}
            sprungFeld={suchFeld} baum={leiste(true)} />
        );
        return ziel ? createPortal(sheet, ziel) : sheet;
      })()}

      <div className={zweiSpalten ? 'grid grid-cols-[18rem_minmax(0,1fr)] gap-8' : ''}>
        {zweiSpalten && (
          <aside role="navigation" aria-label="Gliederung" data-v3-aside
            // Geometrie WÖRTLICH wie die Ist-Spalte, und aus demselben Grund:
            // `top` ist derselbe Ausdruck wie der Sprung-Offset der Anker, damit
            // Spalte und Sprung konstruktiv nicht auseinanderlaufen (LM-003).
            // `flex flex-col` + `maxHeight` ist die tragende Kombination — NICHT
            // `overflow-hidden` mit `h-full` im Kind: `height:100%` löst gegen
            // eine Maximalhöhe nicht auf, der Scroller wüchse auf die volle
            // Inhaltshöhe und der Überschuss würde stumm abgeschnitten
            // (reproduziert am OR @1440×900).
            className="sticky flex min-h-0 flex-col self-start"
            style={{
              top: 'var(--nt-stick)',
              maxHeight: umgebung.imPane
                ? 'calc(100dvh - var(--leser-kopf-h) - var(--leser-sub-h) - 1rem)'
                : 'calc(100vh - var(--nt-stick) - 1.5rem)',
            }}>
            <div className="flex items-center justify-end pb-1">
              <button type="button" data-v3-gliederung-zu onClick={() => m.setTocOffen(false)}
                aria-expanded={m.tocOffen} title="Gliederung ausblenden"
                className="lc-leiste-griff gap-1 px-1.5 text-micro">
                <span aria-hidden>‹</span><span>ausblenden</span>
              </button>
            </div>
            {leiste(false)}
          </aside>
        )}

        {/* Rechte Zelle: Erlass-Kopf UND Lesespalte. Der Erlass-Kopf lief bis
            H1 über die VOLLE Breite und schob die Seitenleiste bei 1440 px
            unter die Falz — obwohl sie in V3 die Hauptnavigation ist. */}
        <div className="min-w-0 space-y-5">
          {/* Der geteilte Erlass-Kopf, seit S3 im Neu-Design (Kap. 4e): Titel ·
              Fakten · Stand+Status · Aktionen. Er trägt Stand und die Warnung
              «nicht konsolidiert» — damit ist «Stand + Warnung erkennen» in
              JEDER Breite ohne Umweg erfüllt, auch dort, wo die Leiste ein
              Sheet ist.
              S3-Nachzug: `kennzahlen` ist dieselbe Kennzahl, die die
              Erlass-Übersicht daneben schon bekommt (§5) — sie speist die
              Anhang-Dominanz («Einträge» statt «Artikel»); `nichtKonsolidiertSeit`
              gibt der Warnung ihren Zeitbezug. Ohne beides sagte der V3-Kopf
              weniger als der Ist-Kopf, obwohl es dieselbe Komponente ist. */}
          <ErlassLeserKopf erlass={erlass} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
            currency={m.currency?.[erlass.key]} nichtKonsolidiert={m.nichtKonsolidiert}
            kennzahlen={m.gliederung.kennzahlen} nichtKonsolidiertSeit={m.nichtKonsolidiertSeit}
            overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet(erlass, m.kantonSys))}
            hinweis="Snapshot — massgeblich ist die amtliche Fassung"
            aktionen={
              <>
                {fassungsWahl}
                <button type="button"
                  onClick={() => {
                    const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
                    merkeTab(ziel, erlass.kuerzel);
                    navigate(ziel);
                    m.setReiterToast(true);
                    const toastRef = m.refs.reiterToastTimerRef;
                    if (toastRef.current) window.clearTimeout(toastRef.current);
                    toastRef.current = window.setTimeout(() => m.setReiterToast(false), 3200);
                  }}
                  className="lc-chip hover:text-brass-700" title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
                {erlass.pdfUrl && (
                  <AmtlichesPdf href={erlass.pdfUrl} stand={erlass.pdfStand ?? erlass.stand} extern />
                )}
              </>
            } />

          {m.kopf && <ErlassKopfBlock kopf={m.kopf} intern={m.internRefs} />}

          <LeserLesespalte m={m} beiwerkSlot={beiwerkSlot}
            // Rand-Fall: keine Leiste, aber breit genug — dann stünde die
            // Trefferliste nirgends. Lieber über dem Text als verschwunden (§8).
            trefferListe={m.sucheAktiv && !zweiSpalten && umgebung.istXl
              ? <LeserGliederung m={m} />
              : undefined} />
        </div>
      </div>

      {panelSlot}

      {/* R4 «Weiterlesen» + R8 Tastatur — dieselben BAUSTEINE wie die Ist-Hülle
          (Kap. 4h: KEINE zweite Tastaturebene), direkt aus `parts/` statt über
          den Ist-Wrapper `inhalt-overlays`. Nur die PRIMÄR-/Einzelansicht: im
          sekundären Pane liefe sonst ein zweiter globaler keydown-Listener und
          j/k sprängen doppelt.
          `display: contents` am Träger ist kein Zierrat, sondern der Fix eines
          gemessenen 20-px-Shifts: `.lc-leser` trägt `space-y-5`, und dessen
          `> * + *`-Regel gäbe dem Lese-Inhalt einen Margin, sobald ein zweites
          Kind danebensteht — obwohl beide Overlays `fixed` sind und gar keinen
          Platz brauchen. Ein Träger ohne eigene Box nimmt den Margin entgegen
          und wirft ihn weg. */}
      <div className="contents">
        {/* Der Reiter-Toast gehört hierher, nicht an den Kopf des Rahmens: er
            ist `fixed` und braucht keinen Platz, stand als ERSTES Grid-Kind aber
            im `space-y-5`-Fluss und gab der Kopfzeile darunter ein `mt-5` — ein
            sichtbarer Sprung von 20 px, sobald er erschien (Bug-Check «Nice»,
            16.8.2026). Derselbe `display: contents`-Träger, der das schon für
            «Weiterlesen» und die Tastatur löst, nimmt den Margin entgegen und
            wirft ihn weg. */}
        {m.reiterToast && (
          <div role="status" aria-live="polite"
            className="fixed right-3 top-20 z-50 flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-body-s text-ink-700 shadow-lg">
            <span aria-hidden className="text-brass-700">⧉</span>
            Im neuen Reiter geöffnet — oben unter ☰
          </div>
        )}
        {!umgebung.istSekundaer && m.weiterlesen && (
          <WeiterlesenChip label={m.weiterlesen.label}
            onWeiterlesen={m.weiterlesenSprung} onVerwerfen={m.weiterlesenVerwerfen} />
        )}
        {!umgebung.istSekundaer && (
          <LeserTastatur tokens={m.artTokens} aktivToken={m.aktivToken} onSprung={m.springeZuArtikel} />
        )}
      </div>
    </div>
  );
}
