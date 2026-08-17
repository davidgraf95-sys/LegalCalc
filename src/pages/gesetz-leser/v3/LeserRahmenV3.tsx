import { isValidElement, useId, useRef } from 'react';
import { grundartMeta } from '../helpers';
import { paneRoot } from '../berechnungen';
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
import { LeserGliederungSchiene } from './LeserGliederungSchiene';
import { LeserLesespalte } from './LeserLesespalte';
import { LeserLeisteSheet } from './LeserLeisteSheet';
import { LeserErlassKopfZone } from './LeserErlassKopfZone';
import { LeserPanelZone } from './LeserPanelZone';
import { PanelZaehler } from './LeserPanelOeffner';
import { normZitat, panelBezug, trefferZahl, usePanelBezuege, usePanelZustand } from './panelModell';
import { SuchSprungFeld } from './SuchSprungFeld';
import { suchZoneAufbau } from './suchZoneAufbau';
import { useTrefferBlatt } from './useTrefferBlatt';
import { useKopfAnspruch } from './useKopfAnspruch';
import { useStickAusgleich } from './useStickAusgleich';
import { leserCssVariablen } from './leserGeometrie';
import { kopfElemente, panelForm, useKopfStufe, zeigeSchliessKreuz } from './kopfStufen';
import { useSuchSprungKuerzel } from './suchKuerzel';
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
// ── DIE ERWEITERUNGS-SLOTS SIND GESTRICHEN (C4/H3, ein Eintrag statt zwei) ──
// `beiwerkSlot` · `fassungsWahl` · `leisteExtra` (H1, Fundament-Auflage 3) und
// `panelOeffner`/`panelSlot` (H3): null Aufrufer über drei Etappen, und die
// beiden Panel-Slots waren von aussen gar nicht füllbar (sie brauchen
// `useLeserV3Modell`, das erst HIER läuft — §5-Bruch). §17 in der Fassung vom
// 13.8.2026: was nicht scheitern kann, wird gestrichen statt bewacht; sie sind
// in der Historie greifbar, wenn ein echter Konsument auftritt. Vollständige
// Herleitung samt Befundliste: Vollzugsvermerk H3 im Fahrplan Kap. 7.
// (Gestrafft H4-II 18.8.2026 — der Absatz stand hier in voller Länge und die
// Datei klemmte an der 420-Zeilen-Sonde; §6.6.)
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
}

export function LeserRahmenV3({ ebene, schluessel }: LeserRahmenV3Props) {
  const { modell: m, umgebung } = useLeserV3Modell({ ebene, schluessel });
  const { stufe, kopfRef } = useKopfStufe();
  // V6: Höhenausgleich beim Ein-/Ausklappen der Gliederung — Befund, Messreihe und
  // der Vertrag von `setzeTocOffen`/`wurzelRef`: `./useStickAusgleich`. Scroller aus
  // derselben `paneRoot`-Auflösung wie «↑ Anfang» (§5).
  const { wurzelRef, setzeTocOffen } = useStickAusgleich(m.tocOffen, m.setTocOffen,
    paneRoot(umgebung.imPane, umgebung.wurzel), m.aktivToken);
  // A3: die Id der Panel-Fläche entsteht HIER — Öffner und Fläche stehen in
  // verschiedenen Teilbäumen und brauchen dieselbe (`aria-controls`).
  const panelId = useId();
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
  // Ä76: Offen-Zustand des Treffer-Blattes (Herleitung in `./LeserTrefferBlatt`).
  // Vor den frühen Rückgaben — Hooks laufen nicht bedingt.
  const trefferBlatt = useTrefferBlatt(m.sucheBegriff);

  // Frühe Ansichten (Fehlseite · Currency-Pin · pdf-embed · nur-live-link) und
  // der Ladezustand — dieselben Bausteine wie die Ist-Hülle (§5).
  const frueheAnsicht = FruehAnsicht({
    fehler: m.fehler, schluessel, manifest: m.manifest, erlass: m.erlass,
    currency: m.currency, kopf: m.kopf, internRefs: m.internRefs,
  });
  // V1: Der Kopf-Anspruch der Fassade ist eine RESERVIERUNG und auf drei Wegen falsch
  // (Fehlseite · pdf-embed · nur-live-link — dort stand weder App-Krume noch ✕); der
  // Lade-Platzhalter ist der Übergang, für den sie existiert (`./useKopfAnspruch`).
  useKopfAnspruch(isValidElement(frueheAnsicht) && frueheAnsicht.type !== LadeAnzeige);

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
      onAnfang={m.zumAnfang} />
  );

  // Ä19: Wo die Gliederung NICHT als Spalte steht, trägt der klebende Kopf-Block
  // das Feld (Regel in `./SuchZone`) — ausser das Blatt ist offen, dann es (A2).
  const suchZoneKlebt = hatLeiste && !zweiSpalten;
  // Zusammensetzung in `./suchZoneAufbau` (Auslagerung des Integrations-Nachzugs
  // 17.8.2026, §6.6 — Anlass und Messung dort). Der Rahmen sagt weiterhin, OB die
  // Zone klebt und WAS darin steht; `useTrefferBlatt` bleibt oben im Rahmen,
  // damit der Offen-Zustand keinen Lagewechsel verliert.
  const suchZone = suchZoneAufbau({
    klebt: suchZoneKlebt, istXl: umgebung.istXl, sucheAktiv: m.sucheAktiv,
    blattOffen, suchFeld, bestimmungsWort,
    liste: <LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />,
    bestimmungen: m.treffer.length, fundstellen: m.fundstellen,
    trefferBlatt, onSheet: () => m.setTocAuf(true),
  });

  // ── H3 · Panel: WO es steht, WAS am Öffner steht ──────────────────────────
  // Die Overlay-Wurzel und die Pane-Rolle stehen hier EINMAL — Gliederungs-Blatt
  // und Panel-Blatt hängen in dieselbe Schicht und müssen dieselbe Rolle tragen
  // (H2-Befund, `./LeserLeisteSheet`).
  const overlayZiel = (umgebung.imPane && umgebung.overlayWurzel?.current) || null;
  const paneRolle = umgebung.istSekundaer ? 'sekundaer' as const : 'primaer' as const;
  // Ohne Leseposition gilt der ERSTE Artikel — benannt, nicht stillschweigend
  // (Begründung und Befund in `./panelModell`, `panelBezug`).
  const panelZiel = panelBezug(m.aktArtikel, m.aktivToken, eintraege[0]);
  const panelArtikel = panelZiel.label;
  // Die Zone steht, solange ein Öffner sichtbar IST oder das Panel offen ist —
  // das zweite ist der F8-Fall: mit «Rechtsprechung im Text: aus» gibt es keine
  // Lasche und keinen Zähler, das per `r` geöffnete Panel muss trotzdem rendern
  // (`panelModell`, `offen` ist bewusst nicht mit `oeffnerSichtbar` verrechnet).
  const panelZone = panel.oeffnerSichtbar || panel.offen;
  // A1: die Zahl gilt nur, wenn der Lade-VERSUCH durch ist — `bezuege.geladen`
  // kommt aus der Hook, die den Fetch kennt (Herleitung dort). Der abgelöste
  // Klassen-Zähler konnte «nichts erfasst» nicht von «lädt noch» trennen.
  const panelZahl = trefferZahl(bezuege.bezuegeFuer, bezuege.geladen, panelZiel.token);

  // Ä79 (H4-II): steht die Schiene, ist SIE der eine Griff — die Herleitung samt
  // Messreihe steht am Bauteil, das sie betrifft (`./LeserGliederungSchiene`).
  const schieneSteht = hatLeiste && umgebung.istXl && !m.tocOffen;
  // ☰ nur, wenn die Gliederung gerade NICHT als Spalte steht — sonst ein Knopf
  // ohne Wirkung (Design-Grundlage Kap. 6, Icon-Flut-Verbot).
  const gliederungKnopf = hatLeiste && !zweiSpalten && !schieneSteht
    ? (
      <button type="button" data-v3-gliederung-auf
        aria-expanded={umgebung.istXl ? m.tocOffen : m.tocAuf}
        onClick={() => { if (umgebung.istXl) setzeTocOffen(true); else m.setTocAuf((v) => !v); }}
        title="Gliederung" aria-label="Gliederung" className="lc-leiste-griff">
        <span aria-hidden>☰</span>
      </button>
    )
    : undefined;

  return (
    <div
      ref={(el) => { kopfRef(el); wurzelRef.current = el; }}
      data-leser-v3="rahmen"
      className="lc-leser space-y-5"
      data-grundart={meta.grundart ?? undefined}
      // Die Geometrie (sechs voneinander abhängige CSS-Variablen, Risiko R1) ist
      // eine reine Funktion in `./leserGeometrie` — dort steht auch die Herleitung
      // samt LM-003. Der Rahmen sagt nur noch, WELCHE Lage gilt (C5a, §6.6).
      style={leserCssVariablen({
        stufe, vollflaechig: !umgebung.imPane, suchZoneKlebt, sucheAktiv: m.sucheAktiv,
      })}>

      <LeserKopf erlass={erlass} aktArtikel={m.aktArtikel} fussnotenAnzahl={m.fussnotenAnzahl}
        hatAenderungsvermerke={m.hatAenderungsvermerke}
        stufe={stufe} gliederungKnopf={gliederungKnopf}
        // F8-Regel David 16.8.2026 («Rechtsprechung im Text» aus ⇒ Zähler weg):
        // unverändert der EINE wirksame Torwächter, `panel.oeffnerSichtbar`.
        // H4-II: die Stufe entscheidet nur noch die GESTALT des Zählers, nicht
        // sein Dasein (`kopfElemente(stufe).panel`, Herleitung dort).
        panelOeffner={panel.oeffnerSichtbar
          ? (
            <PanelZaehler anzahl={panelZahl} artikelLabel={panelArtikel} offen={panel.offen}
              form={kopfElemente(stufe).panel}
              // A3: dieselbe Id wie die Fläche — sonst ist `aria-controls` null.
              panelId={panel.offen ? panelId : undefined}
              onKlick={panel.umschalten} />
          )
          : undefined}
        // A2: der Weg zum Panel, der keine Tastatur braucht und keinen Schalter —
        // steht in JEDEM Pane und auf JEDEM Zuschnitt (`./LeserAnsichtV3`).
        onPanelOeffnen={() => panel.oeffne('entscheide')}
        // Ä46/H4-II: das ✕ steht, wo es NICHT das Duplikat des Rücksprungs
        // «‹ Gesetze» ist — die eine Ableitung samt Messreihe: `./kopfStufen`.
        zeigeSchliessen={zeigeSchliessKreuz(stufe, !umgebung.imPane)}
        suchZone={suchZone} />

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie
          (Dialog-Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) —
          §5, kein zweiter Overlay-Mechanismus. Portal-Vertrag und Pane-Rolle:
          `./LeserLeisteSheet` (H3-Auslagerung = B10-Auflage des H2b-Nachzugs,
          §6.6); der Rahmen entscheidet OB, WOHIN und WAS darin steht. */}
      {blattOffen && (
        <LeserLeisteSheet ziel={overlayZiel} paneRolle={paneRolle}
          sheetRef={m.refs.tocDrawerRef} onSchliessen={() => m.setTocAuf(false)}
          pfad={m.siePfad} aktArtikelLabel={m.siePfadArtikel}
          // A2/Ä32: DASSELBE Feld zuoberst im Blatt (Fokus-Falle, WCAG 2.4.3;
          // die Such-Zone gibt es solange her) · «Sie sind hier» nur zum Baum.
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
      {/* ── H3 · KEINE DRITTE SPUR — gemessen, nicht entschieden ───────────────
          Der Fahrplan verlangt «auf D rechts 22 rem (3-Spalten-Grid)». Im heutigen
          Seitenrahmen ist das auf JEDER Desktop-Breite arithmetisch unmöglich: der
          Route-Wrapper deckelt auf `max-w-content` = 70 rem, gemessen 17.8.2026
          exakt 1072 px bei Viewport 1280/1440/1600/1920 (Lesespalte 640 px). Für
          18 + 40 + 22 rem samt zwei Abständen braucht es 1344 px — 272 fehlen;
          selbst mit eingeklappter Gliederung bleiben nur 332 statt 352.
          Ein Grid-Zweig, den keine Breite erreicht, ist toter Code (§17) — darum
          keine dritte Spur. Das Panel ist überall ein Blatt. Was zu entscheiden
          wäre, damit die Spalte möglich wird, steht im Vollzugsvermerk H3. */}
      <div
        className={hatLeiste && umgebung.istXl
          ? 'grid gap-8 motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-out'
          : ''}
        style={hatLeiste && umgebung.istXl
          ? { gridTemplateColumns: m.tocOffen ? '18rem minmax(0,1fr)' : '2.25rem minmax(0,1fr)' }
          : undefined}>
        {hatLeiste && umgebung.istXl && !m.tocOffen && (
          // Optik und Herleitung in `./LeserGliederungSchiene` (C5b, §6.6).
          <LeserGliederungSchiene onAuf={() => setzeTocOffen(true)} />
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
              <button type="button" data-v3-gliederung-zu onClick={() => setzeTocOffen(false)}
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
            bestimmungsWort={bestimmungsWort} />

          {m.kopf && <ErlassKopfBlock kopf={m.kopf} intern={m.internRefs} />}

          {/* Ä76: der `trefferListe`-Prop ist gestrichen — er traf die
              EINGEKLAPPTE Spalte statt des angekündigten Rand-Falls, und der ist
              unerreichbar. Herleitung samt Messreihe steht am Bauteil, das sie
              betrifft (`./LeserLesespalte`, `./LeserTrefferBlatt`). */}
          <LeserLesespalte m={m} />
        </div>

        {/* H3 · Panel/Lasche. EIN Aufrufpunkt für beide Modi: im Spalten-Modus
            füllt die Zone die dritte Grid-Spur, im Blatt-Modus hat sie keine Box
            und liegt ausserhalb des Flusses. */}
        {panelZone && (
          <LeserPanelZone form={panelForm(stufe, !umgebung.imPane)} panelId={panelId}
            paneZiel={overlayZiel} paneRolle={paneRolle}
            zustand={panel} bezuege={bezuege} erlassKey={erlass.key} quelleUrl={erlass.quelleUrl}
            normZitat={normZitat(panelArtikel, erlass.kuerzel)}
            artikelLabel={panelArtikel} bestimmungsWort={bestimmungsWort} aktArtikel={panelZiel.token}
            steckbrief={zweiSpalten || blattOffen ? null : <LeserUebersicht m={m} bestimmungsWort={bestimmungsWort} />} />
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
        {/* H3 · «r» zieht das Panel auf (KEINE zweite Tastaturebene, Kap. 4h) —
            der Weg, der bleibt, wenn der Zähler nach der F8-Regel weg ist; darum
            UNABHÄNGIG von `oeffnerSichtbar` gesetzt.
            A2 (Nachzug): der Listener läuft jetzt in BEIDEN Panes. Vorher stand er
            unter `!istSekundaer` — mit der Folge, dass «r» aus dem sekundären Pane
            das PRIMÄRE Panel aufzog (gemessen 17.8.2026). Doppelte j/k-Sprünge
            verhindert nicht mehr die Abwesenheit des Listeners, sondern seine
            Zuständigkeitsprüfung: er beansprucht den Tastendruck nur, wenn der
            Fokus in SEINEM Pane steht — dieselbe Regel wie bei ⌘K, aus derselben
            Quelle (`../panePrioritaet`). */}
        <LeserTastatur tokens={m.artTokens} aktivToken={m.aktivToken} onSprung={m.springeZuArtikel}
          onPanel={() => panel.oeffne('entscheide')} imSekundaerenPane={umgebung.istSekundaer} />
      </div>
    </div>
  );
}
