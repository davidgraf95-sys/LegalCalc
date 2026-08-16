import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { aktualisiereTabArtikel, naechsteInstanz, merkeTab } from '../../../lib/tabs';
import { baueGliederungsbaum, type Sektion } from '../../../lib/normtext/browse';
import { verifizierLinkSektion } from '../../../lib/normtext/verifikationslink';
import { GEBIET_LABEL } from '../../../lib/normtext/register';
import { strukturTiefe } from '../strukturTiefe';
import { pfadZu, grundartMeta, kopfOverline, verifiziertesSachgebiet } from '../helpers';
import { ArtikelLeser, SektionKopf, SektionBaumTOC, ErlassKopfBlock, ErlassLeserKopf } from '../parts';
import { ArtikelIndex } from '../parts/ArtikelIndex';
import { ErlassUebersicht } from '../parts/ErlassUebersicht';
import { GliederungSheet } from '../parts/GliederungSheet';
import { TrefferListe } from '../parts/TrefferListe';
import { AmtlichesPdf } from '../parts/AmtlichesPdf';
import { paneRoot, istAnhangToken, findeArt, kuratiereTocSektionen } from '../berechnungen';
import { baueGliederungsModell, findeSynthPfad, type GliederungsKnoten } from '../gliederungsModell';
import { LadeAnzeige, FruehAnsicht } from '../inhalt-ansichten';
import { useLeserDaten, useLeserSprungSpy, loeseSpyNachlauf } from '../inhalt-hooks';
import { useLeserZustand, useLeserTocZustand, useLeserAnsichtZustand } from '../inhalt-zustand';
import { useArtikelAbleitungen, useArtikelTokens, useNachbarn } from '../inhalt-ableitungen';
import { useSektionSprung, useInternRefs } from '../inhalt-sprung';
import { useWeiterlesen } from '../inhalt-weiterlesen';
import { LeserOverlays } from '../inhalt-overlays';
import { useSuchTreffer } from '../inhalt-suchtreffer';
import { formatiereDatum } from '../helpers';
import { LeserKopf } from './LeserKopf';
import { LeserSeitenleiste } from './LeserSeitenleiste';
import { SuchSprungFeld } from './SuchSprungFeld';
import { kopfHoehe, useKopfStufe } from './kopfStufen';

// ═══ LESER V3 · Rahmen (FAHRPLAN-LESER-V3, Etappe H1) ════════════════════════
//
// WAS DIESE DATEI IST. Die neue HÜLLE des Gesetzes-Lesers: Kopfzeile,
// Seitenleiste, Lesespalte. Sie hängt hinter dem Flag `?leser=v3` (FL-1…FL-3)
// und lebt neben der eingefrorenen Ist-Hülle (`inhalt.tsx`, FL-4), bis H4/H5
// beide zusammen mit dem Flag ablösen (FL-7).
//
// WAS SIE AUSDRÜCKLICH NICHT IST. Sie fasst den KERN nicht an. `ArtikelLeser`,
// `ArtikelBody`, `renderSektion`, die Einzug-Skala, die Trennlinien und die
// Typo des Normtexts sind byte-gleich zur Ist-Hülle übernommen — der
// Pixelvergleich PX (Kap. 7/10) misst genau das. Wer hier eine Zeile am
// Lesekörper ändert, bricht die Treue-Grenze, nicht nur einen Test.
//
// WARUM DIE HOOK-ORCHESTRIERUNG HIER NOCH EINMAL STEHT. FL-4 friert die Ist-
// Hülle ein: `inhalt.tsx` darf nicht umgebaut werden, also lässt sich die
// gemeinsame Verdrahtung im Fenster nicht in einen geteilten Hook ziehen. Die
// ~200 Zeilen Hook-Aufrufe sind darum bewusstes, befristetes Duplikat — §1
// («lieber 50 Zeilen Duplikat als eine Abstraktion, die zwei Fälle
// stillschweigend gleich behandelt») und §17-Gegengewicht: die Auflösung ist
// H5 und dort Abnahmezeile, nicht Nacharbeit. Was NICHT dupliziert ist: jeder
// einzelne Hook, jede Ableitung und jede Berechnung kommt unverändert aus den
// bestehenden Modulen (§5) — dupliziert ist allein die Reihenfolge der Aufrufe.
//
// EINE WURZEL-QUELLE FÜR PANE UND BREITE (Kap. 10, Ziel «Kopf-/Layout-
// Verzweigungen 21 → 0»). `imPane`/`wurzel`/`overlayWurzel` werden GENAU HIER
// einmal gelesen (über `useLeserAnsichtZustand` → `usePaneKontext`), und die
// beiden Werte, die davon abhängen, werden als CSS-Variablen ausgelegt:
//   --leser-v3-kopf-top  wo die Kopfzeile klebt (Einzelansicht unter Topbar +
//                        App-Leiste; im Pane 0, weil PaneKopf ausserhalb des
//                        Pane-Scrollers liegt)
//   --leser-v3-kopf-h    wie hoch sie ist (aus der gemessenen Breite, ./kopfStufen)
// `LeserKopf` selbst kennt weder `imPane` noch einen Breakpoint — deshalb ist
// er in beiden Panes derselbe, und deshalb kann `leser-kopf-paritaet` das
// überhaupt prüfen.

export function LeserRahmenV3({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();

  // ── Zustand (unverändert aus ./inhalt-zustand, drei kontigue Blöcke) ───────
  const {
    erlass, setErlass, eintraege, setEintraege, struktur, setStruktur, kopf, setKopf,
    manifest, setManifest, currency, setCurrency,
    bezuegeFuer, revisionFuer, historieFuer, nichtKonsolidiert,
    // `reiterToastTimer` heisst hier `…Ref`: die Lint-Regel `react-hooks/
    // immutability` erkennt einen Ref am Namen, und dieser wird beschrieben.
    // Die Ist-Hülle löst dasselbe über die Prop-Umbenennung im Volltext-Modul.
    fehler, setFehler, reiterToast, setReiterToast, reiterToastTimer: reiterToastTimerRef,
    suche, setSuche, sucheDebounced, scrollVorSucheRef, sucheVorherRef,
  } = useLeserZustand();
  const {
    offen, setOffen, tocBaum, setTocBaum, tocToggleGruppe, aktivIds, setAktivIds, tocAuf, setTocAuf,
    jumpLockRef, autoOffenRef, autoTickRef, autoTickNowRef, manuellOffenRef, manuellZuRef,
  } = useLeserTocZustand();
  const {
    tocOffen, setTocOffen, istXl, imPane, wurzel, overlayWurzel, istSekundaer,
    meldeInhaltsKopf, aktArtikel, setAktArtikel, kantonSys, setKantonSys,
    sekRefs, tocDrawerRef, tabArtikelTimer, aktArtikelTimer, tocBaumTimer, tocTouchRef,
  } = useLeserAnsichtZustand({ tocAuf, setTocAuf });

  useLeserDaten({
    ebene, schluessel, navigate, erlass, istSekundaer, meldeInhaltsKopf,
    setManifest, setCurrency, setStruktur, setKopf, setKantonSys, setErlass, setEintraege, setFehler,
  });

  // ── Abgeleitete Werte (unverändert) ───────────────────────────────────────
  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );
  const tocSektionen = useMemo(() => kuratiereTocSektionen(sektionen), [sektionen]);
  const modell = useMemo(
    () => baueGliederungsModell({
      sektionen: tocSektionen, ohneGliederung, eintraege: eintraege ?? [], struktur,
      startSichtbarGo: true,
    }),
    [tocSektionen, ohneGliederung, eintraege, struktur],
  );
  useEffect(() => {
    if (eintraege && modell.leisteStartetZu) setTocOffen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erlass?.key, eintraege, modell.leisteStartetZu]);

  const kantonErlassAnzahl = useMemo<number | null>(() => {
    const kanton = erlass?.kanton;
    if (!kanton || !manifest) return null;
    return manifest.erlasse.reduce((n, e) => (e.kanton === kanton ? n + 1 : n), 0);
  }, [erlass?.kanton, manifest]);
  const gliederungsTiefe = useMemo(() => strukturTiefe(struktur), [struktur]);
  const fussnotenAnzahl = useMemo<number | null>(() => {
    if (!struktur) return null;
    let n = 0;
    for (const v of Object.values(struktur)) n += v?.fussnoten?.length ?? 0;
    return n;
  }, [struktur]);

  // ── Kopf-Meldung an die App-Leiste ────────────────────────────────────────
  //
  // V3 meldet NUR die Ortsangabe (Brotkrume · Stand · laufender Artikel) — KEIN
  // `ansichtSlot`, KEIN `sucheSlot`. Beide Bedienelemente leben in V3 in der
  // eigenen Kopfzeile bzw. in der Seitenleiste; sie zusätzlich in die App-Leiste
  // zu melden hiesse, dieselbe Funktion an zwei Orten anzubieten (§5) — und im
  // Pane gäbe es sie dort ohnehin nicht (PaneKopf trägt keine Slots), womit
  // genau die Kopf-Asymmetrie zurückkäme, die H1 beseitigt.
  //
  // Warum die App-Leiste überhaupt weiter gefüttert wird: sie ist NICHT der
  // Leser-Kopf, sondern die Klammer der Anwendung (woher komme ich, Stand,
  // Schliessen zur Startseite) und liegt ausserhalb der Hülle — dieselbe
  // Aufteilung, die der Entscheid-Leser seit je hat (eigener sticky Kopfblock
  // unter der App-Leiste). Die im Fahrplan Kap. 4a skizzierte VERSCHMELZUNG der
  // beiden Leisten verlangt Änderungen an `src/components/layout/**`; sie
  // gehört zu H4/H5, wenn V3 der Default ist — vorher hätte sie die Ist-Hülle
  // mit umgebaut und FL-4 gebrochen.
  useEffect(() => {
    if (!erlass) return;
    const ebeneLabel = erlass.rechtsgebiet === 'international'
      ? 'International'
      : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`;
    const ebeneTo = erlass.rechtsgebiet === 'international'
      ? '/gesetze?ebene=international'
      : erlass.ebene === 'bund' ? '/gesetze'
        : `/gesetze?ebene=kanton&kt=${encodeURIComponent(erlass.kanton ?? '')}`;
    meldeInhaltsKopf({
      breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: ebeneLabel, to: ebeneTo }, { label: erlass.kuerzel }],
      stand: erlass.stand ? formatiereDatum(erlass.stand) : null,
      artikel: aktArtikel ? `${aktArtikel} ${erlass.kuerzel}` : null,
    });
  }, [erlass, aktArtikel, meldeInhaltsKopf]);

  const { sekPos, artIndex, sektionMeta, artLabelByToken, margAnzeige } = useArtikelAbleitungen({
    sektionen, eintraege, struktur,
  });

  // ── Artikel-Sprung (byte-gleiche Logik zu inhalt.tsx) ─────────────────────
  // Der EINE erlaubte Adress-Schreiber der Hülle (LM-202): `replaceState`, nie
  // `pushState`, nie eine direkte Hash-Zuweisung. Die Quellensonde dazu steht in
  // `src/tests/leser-v3-adresse.test.ts` — sie bewacht diese Datei so, wie
  // `leser-adresse-lm202.test.ts` `inhalt.tsx` bewacht.
  const springeZuArtikel = useCallback((token: string) => {
    scrollVorSucheRef.current = null;
    setSuche('');
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    if (ids.length) {
      setOffen((o) => { const n = { ...o }; for (const id of ids) n[id] = true; return n; });
      for (const id of ids) manuellZuRef.current.delete(id);
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      jumpLockRef.current = true;
    } else {
      // F2: Artikel ohne amtliche Sektion (Vorspann/Anhang/Mittelgruppe) — der
      // synthetische Pfad kommt aus demselben Modell, das der Scroll-Spy nutzt.
      const synth = findeSynthPfad(modell.knoten, token);
      if (synth) {
        if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
        setAktivIds(synth);
      }
    }
    if (typeof window === 'undefined') return;
    if (!istSekundaer) {
      const ziel = `${basisPfad}${window.location.search}#art-${token}`;
      window.history.replaceState(null, '', ziel);
      aktualisiereTabArtikel(ziel);
    }
    const scrolle = () => {
      const el = findeArt(paneRoot(imPane, wurzel), token);
      if (!el) return;
      // R1: an den oberen Lese-Rand (`block:'start'` + `.nt-anker`-scroll-margin,
      // die aus `--nt-stick` kommt) — in V3 rechnet `--nt-stick` die neue
      // Kopfhöhe mit ein (weiter unten), der Sprung landet also unter der
      // klebenden Kopfzeile statt darunter zu verschwinden.
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      window.setTimeout(() => { scrolle(); jumpLockRef.current = false; loeseSpyNachlauf(); }, 400);
    }, 110));
    // Deps byte-gleich zu inhalt.tsx (Setter/Refs sind stabil, s. dort).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektionen, basisPfad, istSekundaer, imPane, wurzel, modell.knoten]);

  const { tokenByLabel, aktivToken, artTokens } = useArtikelTokens({ artLabelByToken, eintraege, aktArtikel });
  const { weiterlesen, weiterlesenSprung, weiterlesenVerwerfen } = useWeiterlesen({
    erlass, eintraege, istSekundaer, locationHash: location.hash, aktArtikel, aktivToken, springeZuArtikel,
  });

  const springeZuSektion = useSektionSprung({
    sektionen, sekRefs, location, istSekundaer, imPane, wurzel, sucheDebounced, springeZuArtikel,
    setOffen, setTocBaum, setAktivIds, setTocAuf, scrollVorSucheRef, sucheVorherRef,
    refs: { jumpLockRef, autoOffenRef, autoTickRef, manuellOffenRef, manuellZuRef, tocBaumTimer },
  });
  const internRefs = useInternRefs({ eintraege, basisPfad, springeZuArtikel, istSekundaer, navigate });

  useLeserSprungSpy({
    ebene, schluessel, eintraege, sektionen, ohneGliederung, istSekundaer, imPane, wurzel,
    paneLocationHash: location.hash, paneLocationSearch: location.search, basisPfad, offen, sucheDebounced, aktivIds, tocBaum,
    gliederungsKnoten: modell.knoten, umhaengPraefix: modell.umhaengPraefix,
    istXl, tocOffen, artLabelByToken, setOffen, setAktArtikel, setAktivIds, setTocBaum,
    refs: {
      jumpLock: jumpLockRef, autoOffenRef, autoTickRef, autoTickNowRef, manuellOffenRef, manuellZuRef,
      tocBaumTimer, tabArtikelTimer, aktArtikelTimer, tocTouchRef,
    },
  });

  // ── In-Gesetz-Suche & Treffer (unverändert aus ./inhalt-suchtreffer) ───────
  const sucheTrim = sucheDebounced.trim().toLowerCase();
  const { vorher, nachher } = useNachbarn({ manifest, erlass });
  const sucheFeldLeer = suche.trim() === '';
  const {
    leseRef, treffer, fundstellen, fussnotenAus, trefferPos, aktivToken: trefferAktivToken,
    springeZuFundstelle, springeZuTreffer, loeseArtikel,
    siePfad, siePfadArtikel,
  } = useSuchTreffer({
    erlassKey: erlass?.key ?? null, eintraege, struktur,
    sucheTrim, sucheFeldLeer, sektionen, aktivIds, internRefs, aktArtikel, tokenByLabel,
    offen, setOffen, imPane, wurzel,
  });

  // ── Breite → Zuschnitt der Kopfzeile (EINE Quelle, kein `imPane`) ──────────
  const rahmenRef = useRef<HTMLDivElement>(null);
  const stufe = useKopfStufe(rahmenRef);
  const suchFeldRef = useRef<HTMLInputElement>(null);

  // ── «alles auf/zu» (Pos. 16) ──────────────────────────────────────────────
  // Sichtbarer Knopf, kein Tastenkürzel (ARIA APG kennt für ein globales
  // Auf/Zu keinen Baum-Standard, Kap. 4b). Der Zustand ist NICHT zusätzlich
  // gespeichert: was «alle» bedeutet, wird aus dem Modell abgeleitet, damit es
  // beim Erlass-Wechsel nicht veraltet (§5).
  const alleIds = useMemo(() => {
    const ids: string[] = [];
    const geh = (knoten: readonly GliederungsKnoten[]) => {
      for (const k of knoten) { if (k.kinder.length > 0) { ids.push(k.id); geh(k.kinder); } }
    };
    geh(modell.knoten);
    return ids;
  }, [modell.knoten]);
  const alleOffen = alleIds.length > 0 && alleIds.every((id) => tocBaum[id] === true);
  const setzeAlle = useCallback((auf: boolean) => {
    setTocBaum((o) => ({ ...o, ...Object.fromEntries(alleIds.map((id) => [id, auf])) }));
  }, [alleIds, setTocBaum]);

  // «↑ Anfang» — genau EIN Knopf pro Seite (Pos. 15). Scrollt den Bezugsraum:
  // im Pane den Pane-Scroller, sonst das Fenster. `paneRoot` ist dieselbe
  // Auflösung, die auch der Artikel-Sprung benutzt (§5).
  const zumAnfang = useCallback(() => {
    const wurzelEl = paneRoot(imPane, wurzel);
    if (wurzelEl && wurzelEl !== document) (wurzelEl as HTMLElement).scrollTo({ top: 0, behavior: 'auto' });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [imPane, wurzel]);

  // ── Ansichts-Weichen vor dem Volltext-Zweig (unverändert) ─────────────────
  const frueheAnsicht = FruehAnsicht({ fehler, schluessel, manifest, erlass, currency, kopf, internRefs });
  if (frueheAnsicht) return frueheAnsicht;
  if (!erlass || !eintraege) return <LadeAnzeige />;

  // ── Lesekörper: byte-gleich zur Ist-Hülle (Treue-Grenze PX) ───────────────
  const istOffen = (id: string, defOpen: boolean) => offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) => setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRefs.current.set(id, el); else sekRefs.current.delete(id);
  };
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;
  const meta = grundartMeta(erlass.key);
  const bestimmungsWort = meta.bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';

  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number, randTiefe = 0): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    const kinderRandTiefe = s.randtitel ? randTiefe + 1 : 0;
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1, kinderRandTiefe) })),
          ...s.artikel.map((e) => ({
            pos: artIndex.get(e.artikel) ?? 0,
            el: <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />,
          })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    const eingerueckt = tiefe > 0 && tiefe <= 5;
    const einzugCls = eingerueckt ? 'pl-einzug-mobil sm:pl-einzug' : '';
    return (
      <section key={s.id} data-normtext-linie className={`space-y-3 ${einzugCls}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sektionMeta.get(s.id)?.bereich} bereichEinzel={sektionMeta.get(s.id)?.einzel ?? false}
          amtlichUrl={verifizierLinkSektion(erlass, s.eId) ?? undefined}
          randTiefe={randTiefe} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
      </section>
    );
  };

  // ── Gliederungsbaum (unverändert aus inhalt.tsx) ──────────────────────────
  const anhangAst = modell.knoten.filter((k) => k.art === 'anhang');
  const anhangEl = anhangAst.length > 0
    ? (
      <SektionBaumTOC knoten={anhangAst} aktivPfad={aktivIds} aktivToken={aktivToken} offen={tocBaum}
        startOffeneTiefe={modell.startOffeneTiefe}
        onToggle={tocToggleGruppe} onSprung={springeZuSektion} onSprungArtikel={springeZuArtikel} />
    )
    : undefined;
  const tocBaumEl = modell.modus === 'b3-leer'
    ? (
      <p className="text-micro leading-snug text-ink-500 [overflow-wrap:anywhere]">
        Für diesen Erlass ist keine Gliederung erfasst.
      </p>
    )
    : modell.modus === 'b2-index' || modell.modus === 'b4-mini'
      ? <ArtikelIndex gruppen={modell.artikelIndex} aktivToken={aktivToken} onSprung={springeZuArtikel} anhang={anhangEl} />
      : (
        <SektionBaumTOC knoten={modell.knoten} aktivPfad={aktivIds} aktivToken={aktivToken} offen={tocBaum}
          startOffeneTiefe={modell.startOffeneTiefe}
          onToggle={tocToggleGruppe} onSprung={springeZuSektion} onSprungArtikel={springeZuArtikel} />
      );

  // ── Zone B der Leiste: Trefferliste statt Baum, solange gesucht wird ───────
  // «Vorerst wie heute» (Auftrag H1): Reihenfolge und ✕-Verhalten der Liste
  // sind Etappe H2 — hier wechselt nur der Ort mit, an dem sie steht.
  const sucheAktivTrim = sucheDebounced.trim();
  const sucheAktiv = sucheAktivTrim !== '';
  const hatLeiste = eintraege.length > 0;
  const trefferListeEl = (
    <TrefferListe treffer={treffer} begriff={sucheAktivTrim} fundstellen={fundstellen}
      fussnotenAus={fussnotenAus} position={trefferPos} aktivToken={trefferAktivToken}
      onZurueck={() => springeZuFundstelle?.(-1)} onVor={() => springeZuFundstelle?.(1)}
      onSprung={(t) => springeZuTreffer?.(t)} />
  );

  const overlineGebiet: string | null = erlass.ebene === 'bund'
    ? GEBIET_LABEL[erlass.rechtsgebiet]
    : verifiziertesSachgebiet(erlass, kantonSys)?.top ?? null;

  const uebersichtEl = (
    <ErlassUebersicht erlass={erlass} kopf={kopf} currency={currency?.[erlass.key]}
      erlassTyp={meta.erlassTyp} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
      bestimmungsEtikettStatus={meta.bestimmungsEtikettStatus}
      gliederungsTiefe={gliederungsTiefe} kennzahlen={modell.kennzahlen}
      kantonSys={kantonSys} kantonErlassAnzahl={kantonErlassAnzahl}
      nichtKonsolidiert={nichtKonsolidiert} />
  );

  const suchFeldEl = (
    <SuchSprungFeld wert={suche} setzeWert={setSuche} loeseArtikel={loeseArtikel}
      onSprung={springeZuArtikel} feldRef={suchFeldRef}
      onKuerzel={() => { if (!istXl && hatLeiste) setTocAuf(true); }} />
  );

  const leisteEl = (imSheet: boolean) => (
    <LeserSeitenleiste
      uebersicht={uebersichtEl}
      // Im Sheet trägt die Sheet-Anatomie das Feld bereits zuoberst
      // (`sprungFeld`-Slot, §5 — kein zweites Feld daneben).
      suchFeld={imSheet ? undefined : suchFeldEl}
      baum={sucheAktiv ? trefferListeEl : tocBaumEl}
      baumTitel={sucheAktiv ? 'Treffer' : 'Gliederung'}
      onAlleAuf={() => setzeAlle(true)} onAlleZu={() => setzeAlle(false)} alleOffen={alleOffen}
      onAnfang={zumAnfang} />
  );

  // ☰ nur, wenn die Gliederung gerade NICHT als Spalte steht — sonst wäre es
  // ein Knopf ohne Wirkung (Design-Grundlage Kap. 6, Icon-Flut-Verbot).
  const gliederungKnopf = hatLeiste && !(istXl && tocOffen)
    ? (
      <button type="button" data-v3-gliederung-auf
        aria-expanded={istXl ? tocOffen : tocAuf}
        onClick={() => { if (istXl) setTocOffen(true); else setTocAuf((v) => !v); }}
        title="Gliederung" aria-label="Gliederung"
        className="lc-leiste-griff">
        <span aria-hidden>☰</span>
      </button>
    )
    : undefined;

  const zweiSpalten = istXl && hatLeiste && tocOffen;

  return (
    <div
      ref={rahmenRef}
      data-leser-v3="rahmen"
      className="lc-leser space-y-5"
      data-grundart={meta.grundart ?? undefined}
      // ── Die EINE Stelle, an der Kopf-Geometrie steht (Risiko R1) ───────────
      // `--leser-v3-kopf-h`  Höhe der V3-Kopfzeile (aus der gemessenen Breite).
      // `--leser-v3-kopf-top` wo sie klebt: Einzelansicht unter Topbar (4rem) +
      //                      App-Leiste (2.25rem); im Pane 0 (PaneKopf liegt
      //                      ausserhalb des Pane-Scrollers).
      // `--leser-kopf-h`     gesamtes Chrome oberhalb des Lesebereichs — das
      //                      Gliederungs-Sheet rechnet daraus seine Höhe.
      // `--leser-sub-h`      klebender Anteil INNERHALB des Pane-Scrollers.
      // `--nt-stick`         der Sprung-Offset der `.nt-anker`. Er speist sich
      //                      aus den beiden darüber und ist damit automatisch
      //                      richtig, wenn die Kopfzeile ihre Stufe wechselt —
      //                      genau das fehlte im Ist-Stand (Kap. 4h/R1).
      style={{
        '--leser-v3-kopf-h': kopfHoehe(stufe),
        '--leser-v3-kopf-top': imPane ? '0rem' : 'calc(4rem + 2.25rem)',
        '--leser-kopf-h': imPane
          ? 'var(--leser-v3-kopf-h)'
          : 'calc(4rem + 2.25rem + var(--leser-v3-kopf-h))',
        '--leser-sub-h': imPane ? 'var(--leser-v3-kopf-h)' : '0rem',
        '--nt-stick': imPane ? 'var(--leser-sub-h)' : 'var(--leser-kopf-h)',
      } as CSSProperties}>

      {reiterToast && (
        <div role="status" aria-live="polite"
          className="fixed right-3 top-20 z-50 flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-body-s text-ink-700 shadow-lg">
          <span aria-hidden className="text-brass-700">⧉</span>
          Im neuen Reiter geöffnet — oben unter ☰
        </div>
      )}

      <LeserKopf erlass={erlass} aktArtikel={aktArtikel} fussnotenAnzahl={fussnotenAnzahl}
        stufe={stufe} gliederungKnopf={gliederungKnopf} />

      {/* Erlass-Kopf: in H1 der BESTEHENDE `ErlassLeserKopf` (das Neu-Design der
          Fakten-/Status-/Aktionen-Zeile ist Etappe S3, Kap. 4e). Er trägt Titel,
          SR-Nummer, Stand und die Warnung «nicht konsolidiert» — damit ist NM-3
          («Stand + Warnung erkennen») in JEDER Breite ohne Umweg erfüllt, auch
          dort, wo die Seitenleiste ein Sheet ist. */}
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
        currency={currency?.[erlass.key]} nichtKonsolidiert={nichtKonsolidiert}
        overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet)}
        hinweis="Snapshot — massgeblich ist die amtliche Fassung"
        aktionen={
          <>
            <button type="button"
              onClick={() => {
                const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
                merkeTab(ziel, erlass.kuerzel);
                navigate(ziel);
                setReiterToast(true);
                if (reiterToastTimerRef.current) window.clearTimeout(reiterToastTimerRef.current);
                reiterToastTimerRef.current = window.setTimeout(() => setReiterToast(false), 3200);
              }}
              className="lc-chip hover:text-brass-700" title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
            {erlass.pdfUrl && (
              <AmtlichesPdf href={erlass.pdfUrl} stand={erlass.pdfStand ?? erlass.stand} extern />
            )}
          </>
        } />

      {kopf && (
        <div className={zweiSpalten ? 'grid grid-cols-[18rem_minmax(0,1fr)] gap-8' : ''}>
          {zweiSpalten && <div aria-hidden />}
          <ErlassKopfBlock kopf={kopf} intern={internRefs} />
        </div>
      )}

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie (Dialog-
          Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) — §5, kein
          zweiter Overlay-Mechanismus. */}
      {!istXl && tocAuf && hatLeiste && (() => {
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const sheet = (
          <GliederungSheet sheetRef={tocDrawerRef} inPane={inPane}
            onSchliessen={() => setTocAuf(false)}
            pfad={siePfad} aktArtikelLabel={siePfadArtikel}
            sprungFeld={suchFeldEl} baum={leisteEl(true)} />
        );
        return ziel ? createPortal(sheet, ziel) : sheet;
      })()}

      <div className={zweiSpalten ? 'grid grid-cols-[18rem_minmax(0,1fr)] gap-8' : ''}>
        {zweiSpalten && (
          <aside role="navigation" aria-label="Gliederung"
            data-v3-aside
            // Klebt unter der Kopfzeile und nutzt die Resthöhe des Fensters
            // bzw. des Panes. `--leser-kopf-h` ist die EINE Quelle dafür.
            className="sticky max-h-[calc(100dvh-var(--leser-kopf-h)-2rem)] min-h-0 self-start overflow-hidden"
            style={{ top: 'calc(var(--leser-v3-kopf-top) + var(--leser-v3-kopf-h) + 0.5rem)' }}>
            <div className="flex items-center justify-end pb-1">
              <button type="button" data-v3-gliederung-zu onClick={() => setTocOffen(false)}
                aria-expanded={tocOffen} title="Gliederung ausblenden"
                className="lc-leiste-griff gap-1 px-1.5 text-micro">
                <span aria-hidden>‹</span><span>ausblenden</span>
              </button>
            </div>
            {leisteEl(false)}
          </aside>
        )}

        {/* Lesespalte — Markup, Klassen und Reihenfolge byte-gleich zur
            Ist-Hülle (`inhalt-volltext.tsx`). Hier darf nichts «aufgeräumt»
            werden: `#lc-lesespalte`, `max-w-normtext` und `mx-auto` tragen das
            Lesemass (A37) und sind zugleich der Bezugsrahmen des
            Pixelvergleichs PX. */}
        <div ref={leseRef} id="lc-lesespalte" className="mx-auto w-full max-w-normtext">
          {/* Ohne Leiste (kein Sektions-/Indexbaum darstellbar) hätte die
              Trefferliste keinen Ort — dann steht sie wie im Ist-Stand über
              dem Text, statt zu verschwinden (§8). */}
          {sucheAktiv && !zweiSpalten && istXl && (
            <div className="mb-8 border-b border-line pb-4">{trefferListeEl}</div>
          )}
          <div className="space-y-2">
            {ohneGliederung.length > 0 && (
              <div className="space-y-5 mb-6">
                {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
              </div>
            )}
            {sektionen.map((s) => renderSektion(s, true, 0))}
          </div>

          <nav className="mt-12 border-t border-line pt-5 flex justify-between gap-4 text-body-s" aria-label="Weitere Erlasse">
            {vorher ? <Link to={`/gesetze/${vorher.ebene}/${encodeURIComponent(vorher.key)}`} className="text-brass-700 hover:underline">‹ {vorher.kuerzel}</Link> : <span />}
            <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">Übersicht</Link>
            {nachher ? <Link to={`/gesetze/${nachher.ebene}/${encodeURIComponent(nachher.key)}`} className="text-brass-700 hover:underline text-right">{nachher.kuerzel} ›</Link> : <span />}
          </nav>
        </div>
      </div>

      {/* R4 «Weiterlesen» + R8 Tastatur — dieselben Overlays wie die Ist-Hülle
          (Kap. 4h: KEINE zweite Tastaturebene, `LeserTastatur` bleibt die eine). */}
      <LeserOverlays istSekundaer={istSekundaer}
        weiterlesen={weiterlesen} onWeiterlesen={weiterlesenSprung} onVerwerfen={weiterlesenVerwerfen}
        artTokens={artTokens} aktivToken={aktivToken} onSprung={springeZuArtikel} />
    </div>
  );
}
