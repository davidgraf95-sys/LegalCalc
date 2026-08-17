import { useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { grundartMeta, kopfOverline } from '../helpers';
import { ErlassKopfBlock, ErlassLeserKopf } from '../parts';
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
import { SuchZone, SUCH_H_AKTIV, SUCH_H_RUHE } from './SuchZone';
import { ReiterAktion } from './ReiterAktion';
import { kopfHoehe, useKopfStufe } from './kopfStufen';
import { useSuchSprungKuerzel } from './suchKuerzel';
import { bestimmungsWort as bestimmungsWortVon, overlineGebiet, suchPlatzhalter, titelKennung } from './erlassAnsicht';
import { LeserUebersicht } from './LeserUebersicht';
import { useLeserV3Modell } from './leserV3Modell';

// ═══ LESER V3 · Rahmen (FAHRPLAN-LESER-V3, Etappe H1) ═══════════════════════
//
// **Nur Layout.** Daten und Effekte kommen fertig aus `./leserV3Modell` (die
// eine Naht zur geteilten Maschinerie), der Lesekörper aus `./LeserLesespalte`.
// Diese Datei entscheidet ausschliesslich, **wo etwas steht** — und ist damit
// die Datei, die man liest, um die Hülle zu verstehen.
//
// DER AUFBAU, VON OBEN:
//   LeserKopf   klebt · Ort · Ansicht · ✕ · [Such-Zone, wenn keine Spalte] (4a/Ä19)
//   ┌ aside ────────────┬ Zelle ───────────────────────────┐
//   │ Übersicht (zu)    │ ErlassLeserKopf                  │  (Kap. 4b/4e)
//   │ Feld klebt zuoberst│ ErlassKopfBlock (Ingress)       │
//   │ Gliederung klebt  │ Lesespalte  ← KERN, eingefroren  │  (Kap. 1.3)
//   └───────────────────┴──────────────────────────────────┘
// OHNE Spalte (Handy · Split-Pane · Gliederung eingeklappt) wandert das Feld in
// den klebenden Kopf-Block (`./SuchZone`) und die Gliederung in ein Bottom-Sheet
// hinter ☰. Die Regel dahinter, auf allen drei Breiten dieselbe: das Feld ist das
// oberste Element des klebenden Blocks.
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
// — kein leerer Kasten, keine Fläche, kein CLS: ein Erweiterungspunkt darf im
// Grundzustand nichts kosten (§15).
//
// ── EINE WURZEL FÜR PANE UND BREITE (Kap. 10) ───────────────────────────────
// `imPane`/`istSekundaer`/`istXl` kommen als `umgebung` aus dem Modell und
// werden GENAU HIER gelesen — sonst nirgends in `v3/` (bewacht von
// `src/tests/leser-v3-fundament.test.ts`). Die zwei Werte, die daraus folgen,
// stehen als CSS-Variablen am Wurzel-Element — damit rechnet auch der
// Sprung-Offset der Anker aus derselben Quelle (Risiko R1, Lehre LM-003).
//
// Bis 16.8. lag `umgebung` zusätzlich in einem React-Kontext
// (`LeserV3Kontext.ts`) mit NULL Konsumenten — alle Bauteile bekommen ihre Werte
// als Prop. Gestrichen statt bewacht (§17 Rückbau, Architektur-Review A2).

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
  const { modell: m, umgebung } = useLeserV3Modell({ ebene, schluessel });
  const { stufe, kopfRef } = useKopfStufe();

  // ⌘K / «/» — Zusage des RAHMENS, nicht des Feldes (Bug-Check B1). Steht VOR den
  // frühen Rückgaben, weil Hooks nicht bedingt laufen dürfen.
  // A3: WELCHES Pane den Tastendruck bekommt, entscheidet `./suchKuerzel` am
  // Fokus. KEIN `onKuerzel` mehr — seit Ä19/A2 ist das Feld in jeder Lage im DOM
  // (Spalte · Kopf-Zone · offenes Blatt), es ist also nichts zu öffnen (§17
  // Rückbau; der Zweig war unerreichbar, Beleg im Vollzugsvermerk).
  const suchFeldRef = useRef<HTMLInputElement>(null);
  useSuchSprungKuerzel({ feldRef: suchFeldRef, imSekundaerenPane: umgebung.istSekundaer });

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
  const bestimmungsWort = bestimmungsWortVon(erlass.key); // B8: EINE Ableitung
  const hatLeiste = eintraege.length > 0;
  const zweiSpalten = umgebung.istXl && hatLeiste && m.tocOffen;
  const blattOffen = !umgebung.istXl && m.tocAuf && hatLeiste; // A2: Feld im Blatt

  // Ä20 · Platzhalter-Beispiel = amtliches Etikett des ERSTEN Eintrags («Art. 1»
  // bzw. «§ 1»), nie aus dem Bestimmungswort gebaut (§5, `./erlassAnsicht`).
  const beispielBestimmung = eintraege[0]?.artikelLabel ?? null;

  const suchFeld = (
    <SuchSprungFeld wert={m.suche} setzeWert={m.setSuche} loeseArtikel={m.loeseArtikel}
      onSprung={m.springeZuArtikel} feldRef={suchFeldRef}
      platzhalter={suchPlatzhalter(beispielBestimmung)} escLeert={!blattOffen}
      // H2 (Kap. 4h): ↑↓ und Enter bedienen dieselbe Fundstellen-Folge wie die
      // ↑↓-Knöpfe im Kopf der Trefferliste — EIN Weg, zwei Bedienarten (§5).
      hatTreffer={m.fundstellen > 0}
      onVor={() => m.springeZuFundstelle?.(1)}
      onZurueck={() => m.springeZuFundstelle?.(-1)} />
  );

  const leiste = (imSheet: boolean) => (
    <LeserSeitenleiste
      // Ä32: im TREFFER-Blatt keine Ankunfts-Übersicht über der Trefferliste.
      uebersicht={imSheet && m.sucheAktiv ? undefined : <LeserUebersicht m={m} bestimmungsWort={bestimmungsWort} />}
      // Ä19: Feld nur in der SPALTE — ohne Spalte trägt es die Such-Zone des
      // Kopf-Blocks (`./SuchZone`) bzw., bei offenem Blatt, dessen Kopf (A2).
      suchFeld={imSheet ? undefined : suchFeld}
      baum={<LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />}
      baumKnoepfe={!m.sucheAktiv} // Ä32: «alles auf/zu» nur zum Baum
      // Ä10: im Sheet benennt der Sheet-Kopf die Zone (sonst «Gliederung» doppelt).
      baumTitel={imSheet ? undefined : (m.sucheAktiv ? 'Treffer' : 'Gliederung')}
      onAlleAuf={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, true])) }))}
      onAlleZu={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, false])) }))}
      alleOffen={m.alleKnotenIds.length > 0 && m.alleKnotenIds.every((id) => m.tocBaum[id] === true)}
      onAnfang={m.zumAnfang}
      extra={leisteExtra} />
  );

  // Ä19: Wo die Gliederung NICHT als Spalte steht, trägt der klebende Kopf-Block
  // das Feld (Regel in `./SuchZone`) — ausser das Blatt ist offen, dann es (A2).
  const suchZoneKlebt = hatLeiste && !zweiSpalten;
  const suchZone = suchZoneKlebt
    ? (
      <SuchZone suchFeld={blattOffen ? undefined : suchFeld} sucheAktiv={m.sucheAktiv}
        bestimmungen={m.treffer.length} fundstellen={m.fundstellen}
        bestimmungsWort={bestimmungsWort}
        // Die eine Geste «zeig mir die Leiste»: Spalte @≥1024 px, Sheet darunter.
        onListe={() => { if (umgebung.istXl) m.setTocOffen(true); else m.setTocAuf(true); }} />
    )
    : undefined;

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
        // Ä19: Höhe der Such-Zone — 0, wo die Leiste als Spalte das Feld trägt.
        // Zwei feste Werte, damit `--nt-stick` unten aus derselben Quelle rechnet.
        // B9: die zwei Werte gehören der Zone (`./SuchZone`), nicht dieser Datei.
        '--leser-v3-such-h': suchZoneKlebt ? (m.sucheAktiv ? SUCH_H_AKTIV : SUCH_H_RUHE) : '0rem',
        // Ä1: Wrapper-Polsterung, die der Kopf verschluckt. Vorgabe in index.css
        // (Shell `py-8 sm:py-12`); im Pane sind es `py-6` (Pane.tsx).
        ...(umgebung.imPane ? { '--leser-v3-kopf-luecke': '1.5rem' } : {}),
        '--leser-sub-h': umgebung.imPane ? 'var(--leser-v3-kopf-h)' : '0rem',
        '--nt-stick': umgebung.imPane
          ? 'calc(var(--leser-sub-h) + var(--leser-v3-such-h))'
          : 'calc(var(--leser-kopf-h) + var(--leser-v3-kopf-h) + var(--leser-v3-such-h))',
      } as CSSProperties}>

      <LeserKopf erlass={erlass} aktArtikel={m.aktArtikel} fussnotenAnzahl={m.fussnotenAnzahl}
        stufe={stufe} gliederungKnopf={gliederungKnopf} panelOeffner={panelOeffner}
        suchZone={suchZone} />

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie
          (Dialog-Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) —
          §5, kein zweiter Overlay-Mechanismus. */}
      {blattOffen && (() => {
        const ziel = (umgebung.imPane && umgebung.overlayWurzel?.current) || null;
        const sheet = (
          // ── H2 · DAS SHEET TRÄGT SEINE PANE-ROLLE (Befund 16.8.2026) ──────
          // Gemessen im Split @1440 (Pane 590 px, also unter der xl-Schwelle):
          // das Sheet wird per Portal in die Overlay-Schicht gehängt und landet
          // dabei AUSSERHALB von `[data-pane="…"]` — die Vorfahrenkette des
          // Suchfelds endete bei `#root`. Damit verliert die einzige Bedienung
          // des Panes, die es in dieser Breite gibt, ihre Zugehörigkeit: von
          // aussen ist nicht mehr zu sagen, zu welchem Pane das offene Sheet
          // gehört — bei ZWEI offenen Sheets sind zwei identische Suchfelder
          // ununterscheidbar nebeneinander im DOM.
          //
          // Das ist kein Test-Problem, sondern eine Lücke im Portal-Vertrag,
          // und H3 hängt das Kontext-Panel in dieselbe Schicht. Die Rolle
          // wandert darum MIT: ein Attribut an der Sheet-Wurzel, gesetzt aus
          // derselben Quelle, aus der auch der Adress-Schreiber seine
          // Pane-Weiche zieht (`istSekundaer`, nicht `imPane` — B1-Falle).
          // Ä5: der BEHÄLTER nennt seine Fläche, der klebende Leisten-Sockel liest
          // sie (`.lc-leiste-sockel`, index.css) — sonst malte er `paper` auf ein
          // `paper-raised`-Blatt (gemessen 17.8.2026 als Tonkante).
          <div data-v3-pane={umgebung.istSekundaer ? 'sekundaer' : 'primaer'}
            style={{ '--leser-leiste-flaeche': 'var(--paper-raised)' } as CSSProperties}>
            <GliederungSheet sheetRef={m.refs.tocDrawerRef} inPane={ziel != null}
              onSchliessen={() => m.setTocAuf(false)}
              pfad={m.siePfad} aktArtikelLabel={m.siePfadArtikel}
              // A2/Ä32: DASSELBE Feld zuoberst im Blatt (Fokus-Falle, WCAG 2.4.3;
              // die Such-Zone gibt es solange her) · «Sie sind hier» nur zum Baum.
              sprungFeld={suchFeld} feldZuoberst ortAnzeigen={!m.sucheAktiv}
              // Ä10: der Blatt-Kopf benennt die Zone; die Leiste darin schweigt.
              titel={m.sucheAktiv ? 'Treffer' : 'Gliederung'}
              baum={leiste(true)} />
          </div>
        );
        return ziel ? createPortal(sheet, ziel) : sheet;
      })()}

      {/* ── Zwei Spalten, IMMER — nur die linke schrumpft (David 16.8.2026) ────
          Befund am gebauten H1-Stand, @1440 reproduziert: klappte man die
          Gliederung ein, verschwand das Grid ganz. Die Lesespalte sprang dabei
          um 175 px nach links (x 600 → 424) und gewann ganze 31 px Breite
          (641 → 672, mehr lässt das Lesemass nicht zu) — der Nutzer sah einen
          Sprung ohne Gewinn. Und der einzige Weg zurück war ein 24-px-☰ OHNE
          Beschriftung, ganz rechts im Kopf (x = 1101) — also an der
          gegenüberliegenden Seite von dem, was es zurückholt.
          Jetzt bleibt das Grid stehen und die linke Spalte wird zur schmalen
          Schiene mit beschriftetem Öffner. Der Öffner steht damit DORT, wo die
          Gliederung war, die Fläche gewinnt echte 15.75 rem, und die Bewegung
          ist eine Breitenänderung statt eines Umbruchs. */}
      <div
        className={hatLeiste && umgebung.istXl
          ? 'grid gap-8 motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-out'
          : ''}
        style={hatLeiste && umgebung.istXl
          ? { gridTemplateColumns: m.tocOffen ? '18rem minmax(0,1fr)' : '2.25rem minmax(0,1fr)' }
          : undefined}>
        {hatLeiste && umgebung.istXl && !m.tocOffen && (
          // Die Schiene: ein einziger Knopf, senkrecht beschriftet, klebend auf
          // Höhe des Lesetexts. Senkrecht, weil 2.25 rem für «Gliederung»
          // waagrecht nicht reichen und eine Abkürzung («Gl.») niemandem hilft;
          // `writing-mode` dreht echten Text, es bleibt vorlesbar und
          // durchsuchbar — kein Bild, kein `aria-label` als Ersatz für Inhalt.
          <div className="sticky self-start" style={{ top: 'var(--nt-stick)' }}>
            <button type="button" data-v3-gliederung-schiene
              onClick={() => m.setTocOffen(true)}
              aria-expanded={false} title="Gliederung einblenden"
              className="flex min-h-11 w-9 flex-col items-center gap-2 rounded-md border border-line py-3 text-micro text-ink-600 transition-colors hover:border-brass-300 hover:bg-paper-sunken/60 hover:text-brass-700">
              <span aria-hidden className="text-base leading-none">☰</span>
              <span className="[writing-mode:vertical-rl] [text-orientation:mixed]">Gliederung</span>
            </button>
          </div>
        )}
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
                {/* Ä12 (Ästhetik-Review 16.8.2026): hier stand nur
                    «ausblenden» — Wort für Wort dasselbe wie «Seitenleiste
                    ausblenden» der App-Leiste zwei Zentimeter weiter oben, aber
                    mit anderer Wirkung. Zwei gleich beschriftete Knöpfe, die
                    Verschiedenes tun, sind eine Falle (§8). Der Knopf sagt
                    jetzt, WAS er ausblendet. */}
                <span aria-hidden>‹</span><span>Gliederung ausblenden</span>
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
            // Ä-(d) aus S3: bei sehr langen Titeln steht die Kennung VOR dem Titel
            // statt am Ende einer dreizeiligen H1 (`erlassAnsicht.titelKennung`).
            kennung={titelKennung(erlass)}
            overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet(erlass, m.kantonSys))}
            hinweis="Snapshot — massgeblich ist die amtliche Fassung"
            aktionen={
              <>
                {fassungsWahl}
                <ReiterAktion kuerzel={erlass.kuerzel} onGeoeffnet={() => {
                  m.setReiterToast(true);
                  const toastRef = m.refs.reiterToastTimerRef;
                  if (toastRef.current) window.clearTimeout(toastRef.current);
                  toastRef.current = window.setTimeout(() => m.setReiterToast(false), 3200);
                }} />
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
              ? <LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />
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
