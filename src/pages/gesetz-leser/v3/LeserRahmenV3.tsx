import { useRef, type CSSProperties, type ReactNode } from 'react';
import { grundartMeta } from '../helpers';
import { ErlassKopfBlock } from '../parts';
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
import { LeserLeisteSheet } from './LeserLeisteSheet';
import { LeserErlassKopfZone } from './LeserErlassKopfZone';
import { LeserPanelZone } from './LeserPanelZone';
import { PanelZaehler } from './LeserPanelOeffner';
import { normZitat, shardGeladen, trefferZahl, usePanelBezuege, usePanelZustand } from './panelModell';
import { SuchSprungFeld } from './SuchSprungFeld';
// B9 (H2b-Nachzug): die zwei Zonen-Höhen gehören der Such-Zone, nicht hierher.
import { SuchZone, SUCH_H_AKTIV, SUCH_H_RUHE } from './SuchZone';
import { kopfElemente, kopfHoehe, useKopfStufe } from './kopfStufen';
import { useSuchSprungKuerzel } from './suchKuerzel';
// B8 (H2b-Nachzug): EINE Ableitung des Bestimmungsworts. `overlineGebiet`,
// `titelKennung` und `ReiterAktion` sind mit dem Erlass-Kopf nach
// `./LeserErlassKopfZone` gewandert (H3-Auslagerung, §6.6).
import { bestimmungsWort as bestimmungsWortVon, suchPlatzhalter } from './erlassAnsicht';
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

// ── H3 · DIE ZWEI PANEL-SLOTS SIND WIEDER WEG (deklariert) ───────────────────
// `panelOeffner`/`panelSlot` waren als `ReactNode`-Slots gedacht. Von aussen
// nicht füllbar: Zähler und Panel brauchen `useLeserV3Modell`, das erst HIER
// läuft — ein äusserer Aufrufer hätte die Naht ein zweites Mal ziehen müssen
// (§5-Bruch). Gestrichen statt bewacht (§17, Präzedenz `LeserV3Kontext.ts`); der
// Rahmen setzt das Panel selbst zusammen. Herleitung im Vollzugsvermerk H3.
export interface LeserRahmenV3Props {
  ebene: string;
  schluessel: string;
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
  ebene, schluessel, beiwerkSlot, fassungsWahl, leisteExtra,
}: LeserRahmenV3Props) {
  const { modell: m, umgebung } = useLeserV3Modell({ ebene, schluessel });
  const { stufe, dockFaehig, kopfRef } = useKopfStufe();
  // H3 · Panel: Zustand und Bezugs-Daten. BEIDE Hooks stehen VOR den frühen
  // Rückgaben (Hooks laufen nicht bedingt) und kosten im Ruhezustand nichts —
  // `usePanelBezuege` bekommt den Erlass-Key erst, wenn das Panel einmal offen
  // war, und ohne Key lädt die Bezugs-Hook nicht (Nachladen, Kap. 7).
  const panel = usePanelZustand();
  const bezuege = usePanelBezuege(m.erlass?.key, panel.jeGeoeffnet);

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

  // ── H3 · Panel: WO es steht, WAS am Öffner steht ──────────────────────────
  // Die Overlay-Wurzel und die Pane-Rolle stehen hier EINMAL — Gliederungs-Blatt
  // und Panel-Blatt hängen in dieselbe Schicht und müssen dieselbe Rolle tragen
  // (H2-Befund, `./LeserLeisteSheet`).
  const overlayZiel = (umgebung.imPane && umgebung.overlayWurzel?.current) || null;
  const paneRolle = umgebung.istSekundaer ? 'sekundaer' as const : 'primaer' as const;
  // «Nie drei vertikale Flächen» ist im Pane eine HARTE Regel (Design-Grundlage
  // Kap. 8) — dort immer Blatt, unabhängig von der Breite. Sonst entscheidet die
  // gemessene Breite (`panelAlsSpalte`, gerechnete Schwelle in `./kopfStufen`).
  const panelModus = !umgebung.imPane && dockFaehig && hatLeiste ? 'spalte' as const : 'blatt' as const;
  const panelArtikel = m.aktArtikel;
  // Die Zone steht, solange ein Öffner sichtbar IST oder das Panel offen ist —
  // das zweite ist der F8-Fall: mit «Rechtsprechung im Text: aus» gibt es keine
  // Lasche und keinen Zähler, das per `r` geöffnete Panel muss trotzdem rendern
  // (`panelModell`, `offen` ist bewusst nicht mit `oeffnerSichtbar` verrechnet).
  const panelZone = panel.oeffnerSichtbar || panel.offen;
  const panelZahl = trefferZahl(bezuege.bezuegeFuer, shardGeladen(bezuege.klassenImErlass), m.aktivToken);

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
        stufe={stufe} gliederungKnopf={gliederungKnopf}
        // F8-Regel David 16.8.2026: «Rechtsprechung im Text» aus ⇒ Zähler UND
        // Lasche weg (`panel.oeffnerSichtbar`, eine Stelle). Ä11: auf `mini` trägt die
        // Kopfzeile den Zähler nicht — dort ist die Lasche der Öffner
        // (`kopfElemente(stufe).panel`).
        panelOeffner={panel.oeffnerSichtbar && kopfElemente(stufe).panel
          ? (
            <PanelZaehler anzahl={panelZahl} artikelLabel={panelArtikel} offen={panel.offen}
              onKlick={panel.umschalten} />
          )
          : undefined}
        suchZone={suchZone} />

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie
          (Dialog-Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) —
          §5, kein zweiter Overlay-Mechanismus. Portal-Vertrag und Pane-Rolle:
          `./LeserLeisteSheet` (H3-Auslagerung, §6.6 — die B10-Auflage des
          H2b-Nachzugs). Der Rahmen entscheidet OB (`blattOffen`), WOHIN
          (`ziel`/`paneRolle`) und WAS im Blatt steht; das WIE des Portals steht
          dort. */}
      {blattOffen && (
        <LeserLeisteSheet ziel={overlayZiel} paneRolle={paneRolle}
          sheetRef={m.refs.tocDrawerRef} onSchliessen={() => m.setTocAuf(false)}
          pfad={m.siePfad} aktArtikelLabel={m.siePfadArtikel}
          // A2/Ä32 (H2b-Nachzug): DASSELBE Feld zuoberst im Blatt (Fokus-Falle,
          // WCAG 2.4.3; die Such-Zone gibt es solange her) · «Sie sind hier» nur
          // zum Baum, nicht über der Trefferliste.
          sprungFeld={suchFeld} feldZuoberst ortAnzeigen={!m.sucheAktiv}
          titel={m.sucheAktiv ? 'Treffer' : 'Gliederung'} baum={leiste(true)} />
      )}

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
      {/* ── H3 · DIE DRITTE SPUR, nach derselben Regel wie die erste ───────────
          Rechts eine Spur, die steht, solange ein Öffner da ist: 2.25 rem für die
          Lasche, 22 rem für das offene Panel — wörtlich die Bauart, die David am
          16.8. für die Gliederung links entschied (Breitenänderung statt Umbruch).
          `PANEL_DOCK_PX` (1344) sichert, dass 18 + 40 + 22 rem gleichzeitig Platz
          haben: das Öffnen VERSCHIEBT den Text, es bricht ihn nicht neu um.
          Darunter und in jedem Pane gilt `blatt` — keine dritte Spur, die Zone ist
          dann ein `display: contents`-Träger (Begründung dort). */}
      <div
        className={hatLeiste && umgebung.istXl
          ? 'grid gap-8 motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-out'
          : ''}
        style={hatLeiste && umgebung.istXl
          ? {
            gridTemplateColumns: `${m.tocOffen ? '18rem' : '2.25rem'} minmax(0,1fr)${
              panelModus === 'spalte' && panelZone ? (panel.offen ? ' 22rem' : ' 2.25rem') : ''}`,
          }
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
          {/* Der geteilte Erlass-Kopf (Kap. 4e) — Prop-Weitergabe in
              `./LeserErlassKopfZone` (H3-Auslagerung, §6.6). */}
          <LeserErlassKopfZone m={m} erlass={erlass} artikelAnzahl={eintraege.length}
            bestimmungsWort={bestimmungsWort} fassungsWahl={fassungsWahl} />

          {m.kopf && <ErlassKopfBlock kopf={m.kopf} intern={m.internRefs} />}

          <LeserLesespalte m={m} beiwerkSlot={beiwerkSlot}
            // Rand-Fall: keine Leiste, aber breit genug — dann stünde die
            // Trefferliste nirgends. Lieber über dem Text als verschwunden (§8).
            trefferListe={m.sucheAktiv && !zweiSpalten && umgebung.istXl
              ? <LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />
              : undefined} />
        </div>

        {/* H3 · Panel/Lasche. EIN Aufrufpunkt für beide Modi: im Spalten-Modus
            füllt die Zone die dritte Grid-Spur, im Blatt-Modus hat sie keine Box
            und liegt ausserhalb des Flusses. */}
        {panelZone && (
          <LeserPanelZone modus={panelModus} paneZiel={overlayZiel} paneRolle={paneRolle}
            zustand={panel} bezuege={bezuege} erlassKey={erlass.key} quelleUrl={erlass.quelleUrl}
            normZitat={normZitat(panelArtikel, erlass.kuerzel)}
            artikelLabel={panelArtikel} aktArtikel={m.aktivToken} zaehler={panelZahl} />
        )}
      </div>

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
          // H3 · «r» zieht das Panel auf (KEINE zweite Tastaturebene, Kap. 4h) —
          // der Weg, der bleibt, wenn Zähler und Lasche nach der F8-Regel weg
          // sind; darum UNABHÄNGIG von `oeffnerSichtbar` gesetzt.
          <LeserTastatur tokens={m.artTokens} aktivToken={m.aktivToken} onSprung={m.springeZuArtikel}
            onPanel={() => panel.oeffne('entscheide')} />
        )}
      </div>
    </div>
  );
}
