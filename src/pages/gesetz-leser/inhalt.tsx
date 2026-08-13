import { useCallback, useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { aktualisiereTabArtikel } from '../../lib/tabs';
import { baueGliederungsbaum, type Sektion } from '../../lib/normtext/browse';
import { verifizierLinkSektion } from '../../lib/normtext/verifikationslink';
import { linienProfil } from './linienAufbau';
import { pfadZu, grundartMeta } from './helpers';
import { ArtikelLeser, SektionKopf, SektionBaumTOC } from './parts';
import { ArtikelIndex } from './parts/ArtikelIndex';
import {
  paneRoot, istAnhangToken, findeArt, kuratiereTocSektionen,
} from './berechnungen';
import { baueGliederungsModell, findeSynthPfad } from './gliederungsModell';
import { useArtikelKontext } from './artikelKontext';
import { LadeAnzeige, FruehAnsicht } from './inhalt-ansichten';
import { LeserVolltextInhalt } from './inhalt-volltext';
import { useLeserDaten, useInhaltsKopfMeldung, useLeserSprungSpy, loeseSpyNachlauf } from './inhalt-hooks';
import { useLeserZustand, useLeserTocZustand, useLeserAnsichtZustand } from './inhalt-zustand';
import { useArtikelAbleitungen, useArtikelTokens, useNachbarn } from './inhalt-ableitungen';
import { useSektionSprung, useInternRefs } from './inhalt-sprung';
import { useWeiterlesen } from './inhalt-weiterlesen';
import { LeserOverlays } from './inhalt-overlays';
import { useSuchTreffer } from './inhalt-suchtreffer';

// ═══ ABSCHNITT · Zusammenführende Reader-Datei (§6.6-Fassade) ════════════════
// Reine Rechenlogik lebt in ./berechnungen (QS-TOK/P5). Der §6.6-Split
// (W2·12-HYGIENE/B24) hat die Nicht-Volltext-Ansichten (./inhalt-ansichten), die
// Volltext-Ansicht (./inhalt-volltext) und die Effekt-Hooks (./inhalt-hooks)
// ausgelagert; QS-TOK/T14 hat den seither zurückgewachsenen Rest in vier weitere
// Aspekt-Module geschnitten: ./inhalt-zustand (State/Refs/Pane-Viewport),
// ./inhalt-ableitungen (useMemo-Ableitungen), ./inhalt-sprung (Sektions-Sprung,
// Instanz-Navigation, Such-Scroll, InternRefs), ./inhalt-weiterlesen +
// ./inhalt-overlays (R4/R8) und ./inhalt-suchtreffer (A35-Highlight,
// R1-Fundstellen, R2-Quickjump).
//
// VERHALTENSNEUTRAL: die HOOK-REIHENFOLGE ist unverändert, weil jeder ausgelagerte
// Hook einen KONTIGUEN Block kapselt und an exakt derselben Position gerufen wird.
//
// Was hier bleiben MUSS und warum:
//  · `linienProfil()`, `linien.guideEbene` (renderSektion) und `data-guide-auto`
//    am .lc-leser-Root — `check:linien-kanon` (Teil B0) liest sie im Quelltext
//    GENAU dieser Datei und meldet den Aufbau-Default sonst als abgeklemmt.
//  · `springeZuArtikel` mit `window.history.replaceState(null, '', ziel)` — die
//    LM-202-Quellensonde (src/tests/leser-adresse-lm202.test.ts) prüft den einen
//    erlaubten Adress-Schreiber in dieser Datei. Ihn zu verschieben hiesse, einen
//    Test anzupassen, und das verbietet §6 Ziff. 2 bei einem Refactoring.
// Ab hier NUR noch: Zusammenführung der Hooks, die Ansichts-Weichen und der
// Volltext-Render (renderSektion + reader-root-Hülle).

export function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();

  // ═══ ABSCHNITT · Zustand (./inhalt-zustand, drei kontigue Blöcke) ═══════════
  const {
    erlass, setErlass, eintraege, setEintraege, struktur, setStruktur, kopf, setKopf,
    manifest, setManifest, currency, setCurrency,
    bezuegeFuer, kantoneVerfuegbar, klassenImErlass, bezugHistogramm, bezugBereich,
    fehler, setFehler, reiterToast, setReiterToast, reiterToastTimer,
    suche, setSuche, sucheDebounced, scrollVorSucheRef, sucheVorherRef,
    revisionFuer, historieFuer, nichtKonsolidiert,
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

  // §6.6-Split: Datenladung (Manifest/Currency/Struktur/Kopf/Kanton-Systematik/
  // Erlass/Einträge, Case-Redirect N0b, pdf-embed/nur-live-link) + Browser-Tab-Titel
  // + Kopf-Aufräumen — verhaltensneutral in ./inhalt-hooks. Drei useEffects in
  // exakt dieser Reihenfolge wie zuvor inline (Hook-Reihenfolge erhalten).
  useLeserDaten({
    ebene, schluessel, navigate, erlass, istSekundaer, meldeInhaltsKopf,
    setManifest, setCurrency, setStruktur, setKopf, setKantonSys, setErlass, setEintraege, setFehler,
  });

  // ═══ ABSCHNITT · Abgeleitete Werte ═══════════════════════════════════════════
  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  // E4/A36: kuratierter Baum NUR für die GLIEDERUNG (SektionBaumTOC) — die
  // Lesespalte (renderSektion unten) arbeitet weiter auf dem vollen `sektionen`
  // (§15-Treue: Inhalt/Anker/Ctrl+F/Print vollständig; reine TOC-Kuration).
  const tocSektionen = useMemo(() => kuratiereTocSektionen(sektionen), [sektionen]);

  // W2·19-GLIEDERUNG/S4: das Gliederungs-MODELL (S3) ist seit hier die Eingabe der
  // Leiste — Modus, Zählwerte, Bereiche, Einzelkind-Verdichtung, Vorspann- und
  // Anhang-Knoten kommen aus der reinen, unit-getesteten Ableitung statt aus der
  // Render-Rekursion (§3 Schichtentrennung).
  //
  // `startSichtbarGo: true` — Davids Entscheid vom 8.8.2026 (Bau-Spec §11 Ziff. 1,
  // Entscheid-Protokoll: «1 = Ja, sichtbar»). Er MODULIERT den 5.8.-Entscheid
  // «alles zu», er hebt ihn nicht auf: kleine Bäume (≤ 40 Zeilen) und der
  // Artikel-Index starten sichtbar, grosse Kodifikationen (OR/ZGB) bleiben
  // unverändert zugeklappt — die Unterscheidung trifft das Modell an der
  // Zeilenzahl (gliederungsModell.ts, `startOffeneTiefe`).
  const modell = useMemo(
    () => baueGliederungsModell({
      sektionen: tocSektionen, ohneGliederung, eintraege: eintraege ?? [], struktur,
      startSichtbarGo: true,
    }),
    [tocSektionen, ohneGliederung, eintraege, struktur],
  );

  // W2·19-GLIEDERUNG/S9 (Bau-Spec §3.2/§9-S9 «Mini-Collapse»): B4 startet
  // eingeklappt (`modell.leisteStartetZu`) — der `tocOffen`-State selbst lebt
  // in ./inhalt-zustand mit `useState(true)` (fester Anfangswert, weil er VOR
  // jeder Modell-Berechnung existieren muss). Sobald der Modus für DIESEN
  // Erlass feststeht, wird er hier einmal auf den modus-eigenen Startwert
  // gezogen — `erlass?.key` in den Deps, damit ein Wechsel zum nächsten Erlass
  // (derselbe Reader-Mount, ?r-Instanz) den Schalter neu setzt, ein blosses
  // Re-Render desselben Erlasses ihn aber nicht gegen einen manuellen Klick
  // zurückdreht. `eintraege` MUSS geladen sein: solange der Snapshot noch
  // fehlt, rechnet `modell` auf dem `?? []`-Leerstand (Zeile oben) — dort
  // stünde `artikelAnzahl=0` und damit transient IMMER b4-mini, auch für eine
  // grosse Kodifikation. Ohne diese Wache kollabierte die Leiste kurz und
  // sprang beim Eintreffen der echten Daten wieder auf (Lade-Flacker).
  useEffect(() => {
    if (eintraege && modell.leisteStartetZu) setTocOffen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erlass?.key, eintraege, modell.leisteStartetZu]);

  // W2·19-GLIEDERUNG/S6: Eingabe des Erfassungsgrads (§8, erfassungsgrad.ts) —
  // die in LexMetrik ERFASSTE Erlass-Zahl des Kantons dieses Erlasses, gezählt
  // aus dem ohnehin geladenen Browse-Manifest (§5: keine zweite Zählung, keine
  // hartkodierte Menge). Bund trägt keinen Erfassungsgrad ⇒ null.
  const kantonErlassAnzahl = useMemo<number | null>(() => {
    const kanton = erlass?.kanton;
    if (!kanton || !manifest) return null;
    return manifest.erlasse.reduce((n, e) => (e.kanton === kanton ? n + 1 : n), 0);
  }, [erlass?.kanton, manifest]);

  // W2·5d U-LINIEN (A8): das Linien-Regelwerk «wann welche Linie» leitet der Reader
  // aus dem TATSÄCHLICHEN Aufbau des Erlasses ab (Struktur-Sidecar: Gliederungstiefe
  // + Artikel-Dichte je Ebene), NICHT mehr aus der grundart-Schublade (der frühere
  // K11-Default «nur KODIFIKATION»). `guideEbene` sagt renderSektion, welche Sektions-
  // tiefe den EINEN vertikalen Guide trägt; `autoGuide` steuert den Auto-Default
  // (data-guide-auto am .lc-leser → index.css). Reine Darstellung (§3, SSoT
  // linienAufbau.ts, im Tor `check:linien-kanon` korpusweit gegated).
  const linien = useMemo(() => linienProfil(struktur), [struktur]);

  // V2·K-2: Gesamtzahl der Fussnoten aus dem Struktur-Sidecar (Kopf-Signal + Zähler
  // am Fussnoten-Chip). null = Sidecar noch nicht geladen ⇒ der Chip erscheint erst
  // danach (kein Zahl-Nachwachsen im Kopf → CLS-schonend). EINMAL je Sidecar berechnet.
  const fussnotenAnzahl = useMemo<number | null>(() => {
    if (!struktur) return null;
    let n = 0;
    for (const v of Object.values(struktur)) n += v?.fussnoten?.length ?? 0;
    return n;
  }, [struktur]);

  // §6.6-Split: Kopf-Meldung (Breadcrumb · Stand · Live-Artikel · Ansicht-/Such-Slot)
  // — verhaltensneutral in ./inhalt-hooks (EIN useEffect). Steht NACH
  // `linien`/`fussnotenAnzahl` (TDZ des A26-Ansicht-Slots), wie zuvor inline.
  // W2·19-GLIEDERUNG/S9: `sektionen` fällt hier weg — der ☰-Knopf hängt seit
  // dem Schwachstelle-8-Fix an `eintraege` (hatLeiste-Logik), nicht mehr an
  // der amtlichen Gliederung (inhalt-hooks.tsx, `zeigeGliederung`).
  useInhaltsKopfMeldung({
    erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, linien, fussnotenAnzahl,
    kantoneVerfuegbar, klassenImErlass, bezugHistogramm, bezugBereich,
    suche, setSuche, istXl, tocOffen, tocAuf, setTocOffen, setTocAuf,
  });

  // Sektions-Positionen/-Meta/-Labels + Randtitel-Anzeige (./inhalt-ableitungen).
  const { sekPos, artIndex, sektionMeta, artLabelByToken, margAnzeige } = useArtikelAbleitungen({
    sektionen, eintraege, struktur,
  });

  // ═══ ABSCHNITT · Navigation & Sprünge (Artikel/Sektion, Hash, Permalink) ════
  // Interner Artikel-Sprung (Querverweise im Wortlaut): Vorfahren öffnen, scrollen,
  // Permalink setzen — derselbe Mechanismus wie der Hash-Sprung. Bleibt HIER, weil
  // die LM-202-Quellensonde den `replaceState`-Aufruf in dieser Datei prüft.
  const springeZuArtikel = useCallback((token: string) => {
    // Suchmodus verlassen. Die URSPRÜNGLICHE Begründung ist mit S8 entfallen —
    // «sonst ist das Ziel nicht im DOM (nur Treffer gerendert)» stimmt nicht
    // mehr, weil die Lesespalte nicht mehr gefiltert wird. Das VERHALTEN bleibt
    // trotzdem, und zwar bewusst: dieser Pfad trägt die Sprünge, die den
    // Suchvorgang wirklich beenden (Quickjump «Art. N», ein Verweis im
    // Wortlaut, «Weiterlesen», der Hash-Sprung). Der Sprung AUS DER
    // TREFFERLISTE läuft nicht hier durch, sondern über `springeZuTreffer`
    // (inhalt-suchtreffer) — er lässt Suche und Markierung ausdrücklich stehen,
    // sonst erlösche beim ersten Klick genau das, wonach man gesucht hat (§4.5:
    // «kein stilles Umschalten der Ansicht beim Sprung»).
    // Kein Zurück zur Vor-Such-Position (wir springen ja gezielt zum Artikel).
    scrollVorSucheRef.current = null;
    setSuche('');
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    if (ids.length) {
      setOffen((o) => { const n = { ...o }; for (const id of ids) n[id] = true; return n; });
      // TOC sofort auf den Zielpfad + Spy während des (zweistufigen, wegen
      // content-visibility ungenauen) Sprungs stilllegen — sonst flackert der Baum
      // durch die kurz zentrierten Zwischensektionen auf/zu. autoOffenRef/manuellOffenRef
      // bleiben unangetastet (der Zweig wird vom Spy normal nachgeführt + collabiert
      // beim Wegscrollen wieder), nur ein evtl. manuelles ZU wird aufgehoben.
      for (const id of ids) manuellZuRef.current.delete(id);
      // F3: einen noch schwebenden Auto-Akkordeon-Timer verwerfen — der Klick-Sprung
      // setzt den Zielpfad sofort und autoritativ; ein verspäteter Auto-Update dürfte
      // ihn nicht überschreiben.
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      jumpLockRef.current = true;
    } else {
      // F2 (§9-Bug-Check 13.8.2026): Artikel OHNE amtliche Sektion — Vorspann,
      // Nachspann, Mittelgruppe, Anhang. `pfadZu` findet für sie nichts, und
      // bis hierher endete die Markierung damit stumm: die Leiste behauptete
      // weiter den zuletzt bekannten Standort (§8), obwohl der Leser
      // anderswo steht. Belegt am RBUE, wo 47 von 49 Artikeln so liegen.
      // Welche Zeile den Artikel deckt, weiss allein das Modell — dieselbe
      // Auflösung, die der Scroll-Spy schon nutzt (inhalt-hooks, §5).
      const synth = findeSynthPfad(modell.knoten, token);
      if (synth) {
        if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
        setAktivIds(synth);
      }
    }
    if (typeof window === 'undefined') return;
    // ?search (Instanz-Diskriminator ?r) erhalten, sonst verliert ein Mehrfach-
    // Reiter seine Identität. Aktiven Reiter auf diesen Artikel melden → Live-
    // Label «Kürzel – Art. X» bei Mehrfach-Instanz (Auftrag David).
    // Sekundäres Pane: NIE die Haupt-URL/-Reiter überschreiben (es ist nicht die
    // adressierte Seite). Primär/1-Pane: wie heute URL + Reiter-Live-Label pflegen.
    if (!istSekundaer) {
      const ziel = `${basisPfad}${window.location.search}#art-${token}`;
      window.history.replaceState(null, '', ziel);
      aktualisiereTabArtikel(ziel);
    }
    // Erst nach dem Aufklapp-Render scrollen (behavior:auto wie der Hash-Sprung);
    // grosse Sektionen wachsen beim Aufklappen → nach Settle ein Korrektur-Scroll.
    const scrolle = () => {
      const el = findeArt(paneRoot(imPane, wurzel), token);
      if (!el) return;
      // R1: an den OBEREN Lese-Rand sprungen (block:'start' + nt-anker-scroll-margin
      // ≈5rem) statt zentrieren — deckt sich mit der oben angesetzten Scroll-Spy-
      // Bezugslinie, sonst markierte der Spy nach dem Sprung den Vorgänger-Artikel.
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      // N2 (Bug-Check 3.8.2026): mit dem Lösen des Locks EINE Spy-Auswertung
      // nachholen — sonst bliebe der Kopf ohne weiteres Scrollen auf dem Artikel
      // vor dem Sprung stehen (Herleitung: inhalt-hooks.tsx bei `spyNachlauf`).
      window.setTimeout(() => { scrolle(); jumpLockRef.current = false; loeseSpyNachlauf(); }, 400);
    }, 110));
    // Bewusst draussen: setSuche/setOffen/setAktivIds/setTocBaum (useState-Setter,
    // von React als stabil garantiert) und scrollVorSucheRef/manuellZuRef/
    // tocBaumTimer/jumpLockRef (useRef-Objekte, über die Lebenszeit identisch).
    // Seit dem T14-Split kommen sie aus ./inhalt-zustand herein, wo die Regel
    // ihre Stabilität nicht mehr sehen kann — Deps darum byte-gleich zum Stand
    // vor dem Split (Aufnahme wäre eine stille Verhaltens-Änderung, §6).
    // `modell.knoten` kommt seit F2 (§9-Bug-Check 13.8.2026) dazu: der
    // Synth-Pfad-Zweig liest den aktuellen Baum. Ohne die Dep hielte der
    // Callback beim Erlass-Wechsel den Baum des VORIGEN Erlasses fest und
    // markierte eine Zeile, die es nicht mehr gibt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektionen, basisPfad, istSekundaer, imPane, wurzel, modell.knoten]);

  // R4 «Weiterlesen» + R8 Tastatur brauchen den aktiven Artikel als TOKEN
  // (./inhalt-ableitungen); der Angebots-Zustand liegt in ./inhalt-weiterlesen,
  // das Markup der beiden Overlays in ./inhalt-overlays.
  const { tokenByLabel, aktivToken, artTokens } = useArtikelTokens({ artLabelByToken, eintraege, aktArtikel });
  // W2·19-GLIEDERUNG/S7: Wegweiser zum aktiv gelesenen Artikel (Bau-Spec §5.2).
  // Der Hook lebt HIER im Leser, nicht im KontextPanel — so bleibt die Gruppe im
  // Panel eine reine, hart gegatete Prop und kann nicht in den Entscheid-Leser
  // lecken. Speist sich aus bereits geladenen Shards (Promise-Cache) und dem
  // schon entprellten `aktivToken`; kein eigener Takt, kein zweiter Fetch.
  const artikelKontext = useArtikelKontext({
    erlass, token: aktivToken, label: aktArtikel, eintraege, struktur,
    revision: aktivToken ? revisionFuer(aktivToken) : undefined,
  });
  const { weiterlesen, weiterlesenSprung, weiterlesenVerwerfen } = useWeiterlesen({
    erlass, eintraege, istSekundaer, locationHash: location.hash, aktArtikel, aktivToken, springeZuArtikel,
  });

  // Sektions-Sprung (TOC) + Instanz-Navigation (?r/#art-) + Such-Scroll-Rettung
  // — verhaltensneutral in ./inhalt-sprung (vier Hooks, unveränderte Reihenfolge).
  // Muss ÜBER dem early-return stehen, sonst wären die Hooks bedingt.
  const springeZuSektion = useSektionSprung({
    sektionen, sekRefs, location, istSekundaer, imPane, wurzel, sucheDebounced, springeZuArtikel,
    setOffen, setTocBaum, setAktivIds, setTocAuf, scrollVorSucheRef, sucheVorherRef,
    refs: { jumpLockRef, autoOffenRef, autoTickRef, manuellOffenRef, manuellZuRef, tocBaumTimer },
  });

  const internRefs = useInternRefs({ eintraege, basisPfad, springeZuArtikel, istSekundaer, navigate });

  // §6.6-Split: der FLIESSTEXT-Offen-Zustand (istOffen/toggle) lebt jetzt in der
  // Volltext-Ansicht (./inhalt-volltext), `oeffnePfad` im Sprung-/Spy-Hook
  // (./inhalt-hooks) — beide arbeiten weiter auf demselben `offen`/`setOffen`.

  // §6.6-Split: Hash-Sprung-Seed + geteilter Aktiv-Artikel-Beobachter (Scroll-Spy) +
  // TOC-Mitscroll + Nutzer-Interaktions-Guard + Scroll-Anker — verhaltensneutral in
  // ./inhalt-hooks. Acht Hooks (2 useRef + 6 useEffect) in EXAKT der bisherigen
  // Reihenfolge; alle geteilten Refs/Setter/abgeleiteten Werte werden durchgereicht,
  // damit tocToggleGruppe/springeZuArtikel/springeZuSektion weiter dieselben Refs treffen.
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

  // ═══ ABSCHNITT · In-Gesetz-Suche & Treffer ═══════════════════════════════════
  const sucheTrim = sucheDebounced.trim().toLowerCase(); // Rank 9: entprellt (nicht `suche`)
  const { vorher, nachher } = useNachbarn({ manifest, erlass });
  const sucheFeldLeer = suche.trim() === '';
  // W2·19-GLIEDERUNG/S8: die Treffer entstehen SEIT HIER im Such-Hook (aus
  // `leserSuche.ts`), nicht mehr als Filter über `eintraege` — die Lesespalte
  // wird nicht mehr gefiltert (Entscheid David (c) 8.8.2026). A35-Hervorhebung
  // (jetzt artikelweise, IntersectionObserver-getrieben), Fundstellen-
  // Navigation, R2-Quickjump + «Sie sind hier» bleiben in ./inhalt-suchtreffer.
  const {
    leseRef, treffer, fundstellen, fussnotenAus, trefferPos, aktivToken: trefferAktivToken,
    springeZuFundstelle, springeZuTreffer, loeseArtikel, siePfad, siePfadArtikel,
  } = useSuchTreffer({
    erlassKey: erlass?.key ?? null, eintraege, struktur,
    sucheTrim, sucheFeldLeer, sektionen, aktivIds, internRefs, aktArtikel, tokenByLabel,
    // B3/B4 (Bug-Check §9 zu S8): DERSELBE Klapp-Zustand, den Fliesstext und
    // Scroll-Spy führen — der Sprung muss ein zugeklapptes Ziel öffnen können,
    // und der Markierungs-Beobachter muss von neuen Artikeln erfahren.
    offen, setOffen,
    // B7: die Bezugsfläche des Beobachters — im Split-View scrollt der Pane.
    imPane, wurzel,
  });

  // ═══ ABSCHNITT · Ansichts-Weichen vor dem Volltext-Zweig ════════════════════
  // Fehlseite · Currency-Pin · pdf-embed · nur-live-link — in ./inhalt-ansichten,
  // gleiche Reihenfolge, gleiche Bedingungen (`null` = weiter zum Volltext).
  const frueheAnsicht = FruehAnsicht({ fehler, schluessel, manifest, erlass, currency, kopf, internRefs });
  if (frueheAnsicht) return frueheAnsicht;
  if (!erlass || !eintraege) {
    // Mindesthöhe reserviert die volle Lesehöhe, solange Snapshot/Struktur async
    // laden: ohne sie kollabiert das (bei Bund prerenderte) Volltext-Dokument auf
    // die kurze Spinner-Zeile und der einwachsende React-Baum erzeugt den grossen
    // CLS-Sprung. min-h-screen ist ein Token (§13), reserviert nur Platz, kürzt
    // keinen Inhalt (§15/2). Derselbe `LadeAnzeige`-Platzhalter wie der Currency-Pin.
    return <LadeAnzeige />;
  }

  // §6.6-Split (W2·12-HYGIENE/B24): der Innen-Render des Volltext-Readers lebt in der
  // reinen Präsentationskomponente ./inhalt-volltext (Markup + Handler byte-gleich).
  // `renderSektion` (Linien-Kanon: border-guide / linien.guideEbene / data-normtext-
  // linie) und die reader-root-Hülle (data-grundart / data-guide-auto) bleiben HIER —
  // dort gated sie `check:linien-kanon` (READER-Liste). renderSektion wird als Prop
  // hereingereicht; sie arbeitet weiter auf demselben `offen`/`setOffen`.
  const istOffen = (id: string, defOpen: boolean) => offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) => setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRefs.current.set(id, el); else sekRefs.current.delete(id);
  };
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;

  // W2·5d G3a: Grundart-Metadaten zur Laufzeit aus dem Register (SSoT, §5) per key —
  // steuert Kopf-Label (erlassTyp), §-Zähl-Substantiv (bestimmungsEtikett, ⑥) und den
  // grundart-abhängigen Linien-Default (data-grundart am .lc-leser-Root, K11).
  const meta = grundartMeta(erlass.key);

  // Jede Sektionsstufe ist klappbar (Fedlex-analog); Inhalt rendert nur offen.
  // Randtitel-promotete Knoten (s.randtitel) bekommen einen ruhigen Einzug-Strich,
  // damit die Buchstaben-/Ziffern-Gruppierung als Verschachtelung lesbar bleibt.
  // Ein Knoten kann seit 6b DIREKTE Artikel UND Unter-Knoten tragen (z. B.
  // «II. Handlungsfähigkeit» enthält Art. 12 direkt und die Untergruppe
  // «2. Voraussetzungen») — beide werden in Dokument-Reihenfolge gemischt.
  // W2·19-GLIEDERUNG/S9: `randTiefe` zählt NUR innerhalb einer randtitel-Kette
  // («A.»=0, «I.»=1, «1.»=2) — sie startet bei 0 sobald ein amtlicher Knoten
  // (nicht randtitel) folgt, sonst zählt sie am Elternwert weiter (Herleitung:
  // SektionKopf.tsx `randTiefe`-Doku). Optionaler 4. Parameter, Default 0 —
  // der bestehende Aufrufer in inhalt-volltext.tsx (`renderSektion(s, true, 0)`)
  // bleibt unverändert lauffähig (§6: kein Test angefasst).
  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number, randTiefe = 0): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    const kinderRandTiefe = s.randtitel ? randTiefe + 1 : 0;
    // Kinder + direkte Artikel in EINER nach Dokument-Position sortierten Liste.
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1, kinderRandTiefe) })),
          ...s.artikel.map((e) => ({
            pos: artIndex.get(e.artikel) ?? 0,
            el: <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />,
          })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    // Linien-Kanon (W2·5d G1 + U-LINIEN/A8, DESIGN-REGLEMENT-NORMTEXT §4b Regel 1 +
    // §Weissraum-Rhythmus): HÖCHSTENS EINE vertikale Guide-Linie gleichzeitig — genau
    // die aufbau-abhängige `linien.guideEbene` trägt den Guide (Ebene 0 bei einer
    // einzigen Gliederungsebene → «flache Ebene sichtbar», sonst Ebene 1); tiefere
    // Ebenen tragen ihre Tiefe allein über den EINZUG (kein gestapelter «Barcode» aus
    // border-l pro Ebene, der ZGB Art. 684 / OR Art. 319 zupflasterte). `guideEbene
    // === null` (flache Artikelliste) ⇒ gar kein Guide. Einzug-Skala (V2·L-1): Tiefe
    // 1–5 → je eine `einzug`-Stufe (20px), gedeckelt bei 5 (vorher 3 — tiefe
    // Kodifikationen ZGB/OR verloren ab Ebene 3 die visuelle Verschachtelung, David-
    // Befund «funktioniert praktisch nicht»). MOBIL kollabiert der Einzug NICHT mehr
    // auf 0, sondern trägt `einzug-mobil` (~0.75rem, `pl-einzug-mobil sm:pl-einzug`)
    // → die Verschachtelung flüstert auch @390 weiter; die eine Guide bleibt am
    // Spaltenrand. CLS 0: Einzug = padding, Guide = border darauf. Der Guide wird bei
    // jedem Erlass mit Gliederung emittiert; ob er im Auto-Default SICHTBAR ist,
    // entscheidet der aufbau-basierte `data-guide-auto`-Toggle rein per CSS (kein
    // Artikel-Re-Render, §15). `data-linien="aus"` kollabiert den Einzug weiterhin
    // auf 0 über ALLE Ebenen (index.css, padding-left:0).
    const guide = linien.guideEbene !== null && tiefe === linien.guideEbene;
    const eingerueckt = tiefe > 0 && tiefe <= 5;
    const einzugCls = eingerueckt ? 'pl-einzug-mobil sm:pl-einzug' : '';
    return (
      <section key={s.id} data-normtext-linie className={`space-y-3 ${guide ? 'border-l border-guide' : ''} ${einzugCls}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sektionMeta.get(s.id)?.bereich} bereichEinzel={sektionMeta.get(s.id)?.einzel ?? false}
          // EID-2 (W2·5d §12): Sektions-Deep-Link zur amtlichen Fassung — nur wenn
          // das EID-1-Sidecar eine Container-eId trägt UND der Erlass eine ELI-
          // Quelle hat (Builder liefert sonst null ⇒ kein Link, §8).
          amtlichUrl={verifizierLinkSektion(erlass, s.eId) ?? undefined}
          randTiefe={randTiefe} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
      </section>
    );
  };

  // Gliederungs-Baum EINMAL beschreiben (genutzt in der xl-Spalte UND im mobilen
  // Drawer, §5 — kein doppelter onSprung). `springeZuSektion`/`tocToggleGruppe` sind
  // oben als useCallback definiert (über dem early-return, Rank 4).
  // W2·19-GLIEDERUNG/S9 (Bau-Spec §3.2, §9-S9): Zone B ist seit hier MODUS-
  // abhängig, nicht mehr ausschliesslich der Sektionsbaum.
  //   · b3-leer  — ehrliche Leerzeile (§8); der Quickjump steht bereits in
  //     Zone A (inhalt-volltext.tsx), hier kommt nichts Zweites dazu (§5).
  //     Seit dem 13.8.2026 (W2·18-FEHLERBUCH, Auftrag David) trifft dieser
  //     Modus nur noch den Erlass OHNE jeden Artikel. Die 68 Erlasse ohne
  //     Sidecar/Randtitel, die hier früher endeten, zeigen jetzt den flachen
  //     Index — die Artikel-Folge steht im Snapshot, sie braucht keine
  //     Gliederung (Herleitung: gliederungsModell.ts, `waehleModus`).
  //   · b2-index / b4-mini — der flache Artikel-Index (S9, gliederungsModell.ts
  //     `artikelIndex`); ein Mini-Erlass böte sonst beim Öffnen von ☰ eine
  //     leere Fläche (`knoten` bleibt für ihn praktisch leer, s. dort).
  //   · b1-offen / b1-kompakt — unverändert der Sektionsbaum (S4).
  // In JEDEM Fall der Anhang-Ast, falls vorhanden (`knoten` trägt ihn immer
  // ausser in b3-leer, §3.4) — Index und Baum sind zwei verschiedene Fragen
  // (Artikel vs. Bereiche), der Anhang bleibt eine Sache des Baum-Renderers.
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
        // A36: das Modell ist auf dem KURATIERTEN Baum gebaut (tocSektionen) —
        // Sprung-/Toggle-Handler arbeiten weiter über die Ids des vollen Baums
        // (Teilmenge, pfadZu findet sie identisch). `onSprungArtikel` bedient die
        // synthetischen Zeilen (Vorspann/Anhänge), die keine `sek-N`-Identität
        // haben und darum über ihren ersten Artikel-Token springen.
        <SektionBaumTOC knoten={modell.knoten} aktivPfad={aktivIds} aktivToken={aktivToken} offen={tocBaum}
          startOffeneTiefe={modell.startOffeneTiefe}
          onToggle={tocToggleGruppe} onSprung={springeZuSektion} onSprungArtikel={springeZuArtikel} />
      );

  return (
    // `lc-leser`: Scope-Anker für die G2a-Options-CSS (index.css) — die
    // data-linien/-fussnoten/-verweise-Regeln greifen NUR im Reader, nie im
    // Norm-Popover der Rechner o. Ä. `data-guide-auto` (U-LINIEN/A8): der
    // AUFBAU-abhängige Linien-Default 'auto' wertet CSS hieran aus — 'aus' = tiefe
    // Kodifikation bleibt ruhig (Guide unsichtbar, Einzug bleibt), 'an' = flaches/
    // mittleres Gesetz zeigt seine EINE Guide-Ebene. Löst den grundart-Kategorie-
    // Default (K11) ab. `data-grundart` bleibt als semantischer Marker (§5).
    <div className="lc-leser space-y-5" data-grundart={meta.grundart ?? undefined} data-guide-auto={linien.autoGuide ? 'an' : 'aus'}
      // W2·10-UI-NAV/N0c: reale Sticky-Höhe für die .nt-anker-Sprünge. Einzelansicht:
      // Topbar (4rem) + Inhalts-Kopf (2.25rem) — die frühere dritte klebende Such-Zeile
      // (~3rem) entfiel mit A35 (Suchfeld jetzt IM Inhalts-Kopf). Im Pane liegen Topbar/
      // PaneKopf ausserhalb des Scroll-Containers → nur die pane-lokale Such-Leiste
      // (top 0.5rem, ~3.5rem) klebt (Muster --rsp-stick, Entscheid-Leser B3).
      //
      // W2·19-GLIEDERUNG/S2 (§2 Bau-Spec, §17-Wurzelfix der LM-003/LM-004-Klasse):
      // Die Kopf-Höhen standen bis hierher SECHSMAL ausgeschrieben (hier, die
      // TOC-Spalte in inhalt-volltext.tsx, das GliederungSheet) — jede
      // Kopf-Änderung musste an allen Stellen von Hand nachgezogen werden, und
      // genau dieses Nachziehen wurde bei LM-003 vergessen (0.5rem-Streifen).
      // Ab jetzt gibt es GENAU EINE Stelle, an der die Zahlen stehen:
      //   --leser-kopf-h  Chrome OBERHALB des Lesebereichs, in beiden Ansichten
      //                   gleich hoch: Topbar 4rem + Inhalts-Kopf bzw. PaneKopf
      //                   2.25rem = 6.25rem. Einzelansicht: beide kleben und
      //                   verdecken den Text. Im Pane: beide liegen AUSSERHALB
      //                   des Pane-Scrollers, verkürzen aber die sichtbare
      //                   Pane-Höhe um denselben Betrag.
      //   --leser-sub-h   pane-lokale Such-Leiste ([data-such-bar], sticky top-0
      //                   INNERHALB des Pane-Scrollers) — nur im Pane > 0.
      // `--nt-stick` (die reale Sticky-Höhe für Sprünge) speist sich daraus und
      // bleibt der EINE Konsument-Anker: Einzelansicht = --leser-kopf-h, im Pane
      // = --leser-sub-h (Topbar/PaneKopf scrollen dort nicht mit dem Text).
      // Rechnerisch byte-gleich zum Vorzustand (6.25rem bzw. 3.5rem).
      style={{
        '--leser-kopf-h': 'calc(4rem + 2.25rem)',
        '--leser-sub-h': imPane ? '3.5rem' : '0rem',
        '--nt-stick': imPane ? 'var(--leser-sub-h)' : 'var(--leser-kopf-h)',
      } as CSSProperties}>
      <LeserVolltextInhalt
        erlass={erlass} eintraege={eintraege} struktur={struktur} kopf={kopf} currency={currency}
        vorher={vorher} nachher={nachher}
        sektionen={sektionen} ohneGliederung={ohneGliederung} linien={linien} fussnotenAnzahl={fussnotenAnzahl}
        meta={meta} internRefs={internRefs} margAnzeige={margAnzeige} kantonSys={kantonSys}
        basisPfad={basisPfad} renderSektion={renderSektion}
        imPane={imPane} istXl={istXl} overlayWurzel={overlayWurzel}
        treffer={treffer} suche={suche} sucheDebounced={sucheDebounced} setSuche={setSuche}
        tocBaumEl={tocBaumEl} tocOffen={tocOffen} tocAuf={tocAuf} setTocOffen={setTocOffen} setTocAuf={setTocAuf}
        springeZuArtikel={springeZuArtikel}
        // W2·19-GLIEDERUNG/S8: datenseitiger Fundstellen-Zähler (§4.4 Ziff. 1),
        // Badge-Ehrlichkeit bei ausgeblendetem Apparat, Vor/Zurück-Sprungtasten
        // und der Treffer-Klick (springt, ohne die Suche zu verlassen).
        fundstellen={fundstellen} fussnotenAus={fussnotenAus}
        trefferPos={trefferPos} trefferAktivToken={trefferAktivToken}
        springeZuFundstelle={springeZuFundstelle} springeZuTreffer={springeZuTreffer}
        // W2·10-UI-NAV/R2: Quickjump + «Sie sind hier» des Gliederungs-Sheets.
        loeseArtikel={loeseArtikel} siePfad={siePfad} siePfadArtikel={siePfadArtikel}
        bezuegeFuer={bezuegeFuer} revisionFuer={revisionFuer} historieFuer={historieFuer}
        kantoneVerfuegbar={kantoneVerfuegbar} klassenImErlass={klassenImErlass}
        bezugHistogramm={bezugHistogramm} bezugBereich={bezugBereich}
        reiterToast={reiterToast} setReiterToast={setReiterToast} reiterToastTimerRef={reiterToastTimer}
        tocDrawerRef={tocDrawerRef} leseRef={leseRef} navigate={navigate}
        // W2·19-GLIEDERUNG/S6: Zone-C-Sockel (Erlass-Übersicht) + Kopf-Warnung.
        kennzahlen={modell.kennzahlen} kantonErlassAnzahl={kantonErlassAnzahl}
        nichtKonsolidiert={nichtKonsolidiert}
        // W2·19-GLIEDERUNG/S7: Wegweiser zur Leseposition (eigene, gegatete Prop).
        artikelKontext={artikelKontext}
      />
      <LeserOverlays istSekundaer={istSekundaer}
        weiterlesen={weiterlesen} onWeiterlesen={weiterlesenSprung} onVerwerfen={weiterlesenVerwerfen}
        artTokens={artTokens} aktivToken={aktivToken} onSprung={springeZuArtikel} />
    </div>
  );
}
