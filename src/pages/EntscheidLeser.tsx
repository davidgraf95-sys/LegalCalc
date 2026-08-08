import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EntscheidBody } from '../components/rechtsprechung/EntscheidBody';
import RegesteBlock from '../components/rechtsprechung/RegesteBlock';
import { spracheBadgeTitel } from '../components/rechtsprechung/format';
import { Tabs } from '../components/ui/Tabs';
import { ABSCHNITT_TITEL, abschnittAnker, ersteFundstelle, erwaegungsGliederung } from '../lib/rechtsprechung/abschnitte';
import { ErwaegungsRail } from '../components/rechtsprechung/ErwaegungsRail';
import { StatusBadge } from '../components/verzahnung/StatusBadge';
import { entscheidDatum } from '../lib/verzahnung/artikel-revisionen';
import { zitatMitAusweis, heuteIso } from '../lib/format';
import { ZitierteNormenGruppe, ZitiertGruppe } from '../components/rechtsprechung/EntscheidVerzahnung';
import { NormText } from '../components/NormText';
import { KontextPanel } from '../components/kontext/KontextPanel';
import { ladeEntscheidEintrag, ladeEntscheid } from '../lib/rechtsprechung/browse';
import { kopfModell, type KopfLabelKey, type KopfModell } from '../lib/rechtsprechung/kopf';
import { normalisiereRegeste, type BrowseEntscheid, type RichterRef } from '../lib/rechtsprechung/register';
import { besetzungsTeile } from '../lib/rechtsprechung/besetzung-verlinkung';
import { GEBIET_LABEL } from '../lib/normtext/register';
import {
  LESE_PARAM, leseAusParam, loescheNennungen, maleNennungen, nennungsAnker,
  trefferInErwaegungen, urlMitHash, urlMitLese, zaehleNennungen, zaehleTreffer,
} from './entscheidLeserRegeln';
import { setzeSuchHighlight } from './gesetz-leser/suchHighlight';
import { usePaneKontext } from '../components/layout/PaneKontext';
import { useMeldeInhaltsKopf } from '../components/layout/InhaltsKopfKontext';
import type { EntscheidAbschnitt, EntscheidSnapshot, EntscheidSprache, Abschnittstyp, Entscheidquelle } from '../lib/rechtsprechung/typen';

// Provenienz-Fuss (§7): Daten-Label je Quelle — BS-Tranche §7.1 (vorher hart
// «OpenCaseLaw», was für gerichte-bs falsch wäre). Deklariert, kein Raten.
const QUELLE_LABEL: Record<Entscheidquelle, string> = {
  opencaselaw: 'OpenCaseLaw',
  entscheidsuche: 'entscheidsuche.ch',
  'gerichte-bs': 'Rechtsprechungs-Datenbank der Gerichte Basel-Stadt (amtlich)',
};

// Reader EINES Entscheids (/rechtsprechung/:key). Lädt Manifest-Eintrag → Datei
// → Snapshot; Kopf, sticky Sprung-Navigation, hervorgehobene Regeste,
// EntscheidBody (mit Norm-Verlinkung) und eine Fuss-Provenienz. Reine
// Darstellung (§3) — keine Rechtslogik.

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

// Sprung zu einem Anker im Body + kurzes Ziel-Blinken (bestehendes lc-ziel-blink
// aus dem Gesetz-Leser; §13-Token, keine neue Optik). Respektiert reduced-motion.
// Rein clientseitig (nur aus Klick-/Effekt-Handlern) — kein SSR-Pfad.
function springeZuAnker(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduziert = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'start', behavior: reduziert ? 'auto' : 'smooth' });
  el.classList.add('lc-ziel-blink');
  window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
  return true;
}

// Manche BGE tragen nur das Bandjahr-Platzhalterdatum (YYYY-01-01) statt eines echten
// Urteilsdatums (ein echtes Urteil datiert nie auf den 1.1. — Feiertag). Diese ehrlich
// als «BGE-Jahrgang» zeigen statt eines fingierten «1.1.» (§8). Sentinel = das
// Platzhalterdatum selbst, NICHT azaUrteil (Bug-Check 26.6.: Auszug-BGE können ein
// echtes Datum tragen trotz fehlendem azaUrteil — die zeigen korrekt «Urteil vom …»).
function istBandjahr(snap: EntscheidSnapshot): boolean {
  return snap.gericht === 'bge' && /-01-01$/.test(snap.datum);
}
// Angezeigter Jahrgang folgt der BGE-Band-Nummer (Band N → Jahr 1874+N), deterministisch
// (§2) — robuster als das Platzhalter-Jahr, das bei OCL gelegentlich um 1 abweicht.
function bgeJahrgang(snap: EntscheidSnapshot): string {
  const band = parseInt(snap.bgeReferenz ?? '', 10);
  return band ? String(band + 1874) : snap.datum.slice(0, 4);
}

// Rubrum-Beschriftungen je Sprache (zukunftsfest; heute trägt der Korpus nur de,
// fr/it greifen automatisch, sobald solche Entscheide importiert werden). rm → de.
const KOPF_LABEL: Record<EntscheidSprache, Record<KopfLabelKey, string>> = {
  de: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
  fr: { gegenstand: 'Objet', parteien: 'Parties', vorinstanz: 'Autorité précédente', besetzung: 'Composition' },
  it: { gegenstand: 'Oggetto', parteien: 'Parti', vorinstanz: 'Autorità inferiore', besetzung: 'Composizione' },
  rm: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
};

// ── Besetzungs-Zeile: amtlicher Wortlaut, Richter:innen klickbar ────────────
//
// Der Wortlaut bleibt UNVERÄNDERT — `besetzungsTeile()` zerschneidet ihn nur und
// hängt die Teile lückenlos wieder aneinander (§8, Test-Invariante). Verlinkt
// werden ausschliesslich richterliche Mitwirkende mit eindeutigem Kanon-Slug;
// Gerichtsschreiber:innen und nicht eindeutig zuordenbare Namen bleiben Text
// (die Facette `?richter=` führt GS nicht — ein Link liefe ins Leere).
//
// Optik (§13): derselbe dezente Inline-Link wie die Norm-Verweise im Lesetext
// (gepunktete Unterstreichung, Akzent erst im Hover) — als Link erkennbar, ohne
// den Rubrum-Block zu tigern. Fokus trägt der globale :focus-visible-Outline (F3).
const BESETZUNG_LINK = 'underline decoration-dotted underline-offset-2 hover:text-brass-700';

// §15.4: der React Compiler ist AUS — die Zerlegung (ein Parser-Lauf) darf nicht
// an jedem Render des Lesers hängen (Tab-Wechsel, Kopiert-Toast, Lese-Modus,
// Schriftgrösse). `useMemo` + `React.memo` mit Default-Komparator.
const BesetzungWert = memo(function BesetzungWert({ freitext, gericht, refs }: {
  freitext: string;
  gericht: string;
  refs: RichterRef[] | undefined;
}) {
  const teile = useMemo(
    () => besetzungsTeile(freitext, gericht, refs),
    [freitext, gericht, refs],
  );
  // Genau ein Teil OHNE Slug = reiner Wortlaut (nichts verlinkbar). Ein einzelner
  // Teil MIT Slug ist dagegen ein gültiger Link (Freitext besteht nur aus dem
  // Namen) und darf nicht wegfallen — Befund Gegenprüfung 20.7.2026.
  if (teile.length === 1 && !teile[0].slug) return <>{freitext}</>;
  return (
    <>
      {teile.map((t, i) => (t.slug
        ? (
          <Link key={i} to={`/rechtsprechung?richter=${encodeURIComponent(t.slug)}`}
            className={BESETZUNG_LINK}
            // §8 genau: die Facette zeigt ALLE Entscheide dieser Person — auch den
            // gerade gelesenen. «Übrige» wäre eine kleine Unwahrheit.
            title={`Alle Entscheide mit ${t.text} anzeigen`}>
            {t.text}
          </Link>
        )
        : <span key={i}>{t.text}</span>
      ))}
    </>
  );
});

// Ehrlicher Marker, wenn die Thema-Leitzeile abgeleitet ist (keine amtliche Regeste, §8).
const SYNTH_MARKER: Record<EntscheidSprache, string> = {
  de: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
  fr: 'Domaine déduit de la structure du dossier — aucun regeste officiel disponible.',
  it: 'Ambito dedotto dalla struttura degli atti — nessuna massima ufficiale disponibile.',
  rm: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
};

// Reihenfolge der Sprung-Ziele (amtliche Gliederung); Regeste vorangestellt.
const NAV_TYPEN: Abschnittstyp[] = ['regeste', 'sachverhalt', 'erwaegung', 'dispositiv'];

// ── V5 · Rechen-Anschluss des Erwägungs-Rails ───────────────────────────────
//
// Die drei Ableitungen (Gliederung · Suchtreffer · Normen-Fundstellen) leben
// HIER und nicht in `ErwaegungsRail`: sie sind Regeln des Lesers
// (`entscheidLeserRegeln`, `abschnitte`), und die Rail-Komponente soll ein
// reiner Renderer bleiben — dieselbe Arbeitsteilung wie Reader ↔ `BezuegeZeile`.
// Eigene `memo`-Grenze, damit ein Tastendruck im Suchfeld nicht den ganzen
// Leser (Kopf, Tabs, Fuss-Panel) neu rendert; die Ableitungen selbst hängen in
// `useMemo` (React Compiler ist AUS, §15.4).
const ErwRail = memo(function ErwRail({ abschnitte, zitierteNormen, suche, onSuche, springe, imPane }: {
  abschnitte: EntscheidAbschnitt[];
  zitierteNormen: string[];
  suche: string;
  onSuche: (v: string) => void;
  springe: (anker: string) => void;
  imPane: boolean;
}) {
  const gliederung = useMemo(() => erwaegungsGliederung(abschnitte), [abschnitte]);
  const treffer = useMemo(() => trefferInErwaegungen(abschnitte, suche), [abschnitte, suche]);
  const trefferGesamt = useMemo(() => zaehleTreffer(abschnitte, suche), [abschnitte, suche]);
  // Angewandte Normen MIT wörtlicher Nennung in einer Erwägung. Ohne Fundstelle
  // KEIN Chip: ein Sprungziel, das es nicht gibt, wird nicht angeboten (§8) —
  // die Norm selbst bleibt im Fuss-Panel («Zitierte Normen») sichtbar.
  const normen = useMemo(() => {
    const out: { zitat: string; anker: string }[] = [];
    const gesehen = new Set<string>();
    for (const z of zitierteNormen) {
      if (gesehen.has(z)) continue;
      gesehen.add(z);
      const anker = nennungsAnker(abschnitte, z)[0];
      if (anker) out.push({ zitat: z, anker });
    }
    return out;
  }, [abschnitte, zitierteNormen]);
  return (
    <ErwaegungsRail gliederung={gliederung} treffer={treffer} trefferGesamt={trefferGesamt}
      normen={normen} suche={suche} onSuche={onSuche} springe={springe} imPane={imPane} />
  );
});

// Datums-Aussage der Meta-Zeile — EINE Regel für Kopf UND Lesemodus (§5):
// 1) datumUnbekannt (BS §7.2): die amtliche Quelle publiziert KEIN Entscheiddatum
//    → das Platzhalterdatum (<GN-Jahr>-01-01) nie als echtes Datum zeigen (§8);
//    stattdessen ehrlich «Entscheiddatum nicht publiziert» + Erstpublikation.
// 2) BGE-Bandjahr-Platzhalter → «BGE-Jahrgang». 3) sonst «Urteil vom …».
function DatumMeta({ snap }: { snap: EntscheidSnapshot }) {
  if (snap.datumUnbekannt) {
    return (
      <span title="Die amtliche Quelle publiziert kein Entscheiddatum">
        Entscheiddatum nicht publiziert
        {snap.erstpublikation && <> · Erstpublikation <span className="num">{formatiereDatum(snap.erstpublikation)}</span></>}
      </span>
    );
  }
  if (istBandjahr(snap)) return <span>BGE-Jahrgang <span className="num">{bgeJahrgang(snap)}</span></span>;
  return <span>Urteil vom <span className="num">{formatiereDatum(snap.datum)}</span></span>;
}

// Lese-Schriftgrössen (R17, A−/A+); Index 1 = Default (1.08rem).
const FS_STUFEN = [1.0, 1.08, 1.18, 1.3];
// QS-CODE-AUSSENKANTEN: der Key hiess bis 4.8.2026 `rsp-fs-idx` — ausserhalb des
// `lexmetrik.`-Präfix-Schemas und darum vom Einstellungen-Reset (RESET_PRAEFIXE)
// nicht sicher erfasst. Neuer Key MIT Migrationslese: bestehende Werte unter dem
// alten Key werden einmalig übernommen, unter dem neuen Key weitergeschrieben und
// der alte Key gelöscht.
const FS_IDX_KEY = 'lexmetrik.rsp-fs-idx';
const FS_IDX_KEY_ALT = 'rsp-fs-idx';
function ladeFsIdx(): number {
  try {
    // Null-Guard (D-1.1): `Number(null) === 0` liess jeden ERSTBESUCHER still auf
    // Stufe 0 (1.0rem) statt Default 1 (1.08rem) fallen — R2-Bruch ohne Symptom.
    let roh = localStorage.getItem(FS_IDX_KEY);
    if (roh === null) {
      const alt = localStorage.getItem(FS_IDX_KEY_ALT);
      if (alt !== null) {
        roh = alt;
        localStorage.setItem(FS_IDX_KEY, alt);
        localStorage.removeItem(FS_IDX_KEY_ALT);
      }
    }
    if (roh !== null) {
      const v = Number(roh);
      if (Number.isInteger(v) && v >= 0 && v < FS_STUFEN.length) return v;
    }
  } catch { /* localStorage nicht verfügbar */ }
  return 1;
}

// Reine Chip-Reihe (Sprung-Ziele). Der sticky-Rahmen liegt im gemeinsamen
// Kopf-Block (zusammen mit den BGE-Tabs), damit sich nicht zwei sticky-Leisten
// überlagern (Bug-Fix: Sprung-Leiste verdeckte die Tab-Leiste beim Scrollen).
// LM-209 (Prod-Messung 2.8.2026): als nackte `<a href="#…">` pushte JEDER
// Reiter-Klick browsernativ einen History-Eintrag (`history.length` 4→5→6→7);
// nach drei Klicks war man vier «Zurück» vom Gesetz entfernt, ohne die Seite je
// verlassen zu haben. Der `href` BLEIBT (Teilbarkeit, Mittelklick, Kontextmenü),
// der normale Linksklick wird jedoch selbst bedient: scrollen + Hash per
// `replaceState` — dasselbe Muster wie die `?ansicht=`-Spiegelung (N0d·J5).
// Modifier-/Mittelklicks bleiben dem Browser überlassen (neuer Tab/Fenster).
function SprungNavigation({ ziele, springe, aktiv }: {
  ziele: { anker: string; label: string }[];
  springe: (anker: string) => void;
  /** LM-005: der Anker des Abschnitts an der Scroll-Position, oder null (kein
   *  Abschnitt sichtbar ⇒ keine Chip-Auszeichnung, die Leiste «tritt zurück»). */
  aktiv: string | null;
}) {
  if (ziele.length === 0) return null;
  return (
    <nav aria-label="Abschnitte">
      {/* Mobil: horizontaler Chip-Streifen (scrollbar); Desktop: normale Reihe. */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mb-0.5 pr-5 sm:pr-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:thin]">
        {ziele.map((z) => (
          <a key={z.anker} href={`#${z.anker}`}
            aria-current={aktiv === z.anker ? 'true' : undefined}
            onClick={(e) => {
              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              springe(z.anker);
            }}
            className={`lc-chip shrink-0 whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400 ${aktiv === z.anker ? 'lc-chip-aktuell' : ''}`}>
            {z.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function EntscheidLeserInhalt({ schluessel, ansichtParam, normParam, leseParam }: {
  schluessel: string;
  ansichtParam: string | null;
  normParam: string | null;
  leseParam: string | null;
}) {
  const navigate = useNavigate();
  const { imPane, wurzel } = usePaneKontext();
  // W2·5d U-POSITION/A17: im SEKUNDÄREN Pane ist die massgebliche Fundstelle-/
  // Hash-Quelle die PANE-LOKALE Location (react-router `<Routes location>`), NICHT
  // `window.location.hash` (= die Haupt-URL). Wird ein Entscheid via ⧉ aus einem
  // Gesetz-Leser geöffnet, dessen Haupt-URL ein `#art-…` trägt, würde der
  // `?norm=`-Fundstellen-Sprung sonst fälschlich als „Hash gewinnt" abgebrochen
  // ⇒ das Pane öffnete oben statt an der Erwägung (stumm falsch, §8).
  const paneLoc = useLocation();
  const hashRoh = (imPane ? paneLoc.hash : typeof window !== 'undefined' ? window.location.hash : '').slice(1);
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  const [snap, setSnap] = useState<EntscheidSnapshot | null>(null);
  // Manifest-Eintrag desselben Entscheids — trägt die korpus-kanonisierten
  // Richter-Slugs für die Besetzungs-Verlinkung. Bewusst im SELBEN Lade-Schritt
  // gesetzt wie `snap` (der Eintrag ist ohnehin schon geladen, bevor der
  // Snapshot geholt wird): kein zweiter async-Sprung, also kein Nachwachsen und
  // kein Layout-Shift (§15.2).
  const [eintrag, setEintrag] = useState<BrowseEntscheid | null>(null);
  const [zustand, setZustand] = useState<'laden' | 'fehlt' | 'da'>('laden');
  const [kopiert, setKopiert] = useState(false);
  // LM-210: der Lesemodus lag bisher nur im lokalen State — nicht teilbar, nach
  // dem Neuladen weg. Er steht jetzt als `?lese=1` in der Adresse (Start-Zustand
  // von dort, Spiegelung per replaceState), nach dem gebauten `?ansicht=`-Muster
  // (N0d·J5): kein Router-Rerender, kein Neulauf des Lade-Effekts, kein
  // Verlaufseintrag fürs Umschalten einer Ansicht derselben Seite.
  const [lese, setLese] = useState(() => leseAusParam(leseParam));
  // BGE-Umschalter: 'voll' = vollständiges Urteil (Default), 'auszug' = amtl. BGE-Sammlungstext.
  const [bodyTab, setBodyTab] = useState<'voll' | 'auszug'>('voll');
  // Im Pane bleibt die Haupt-URL unberührt (dieselbe Grenze wie bei `wechsleTab`):
  // ein Overlay über dem Nebenpane darf die Adresse des Haupt-Dokuments nicht umschreiben.
  const spiegleLese = useCallback((offen: boolean) => {
    if (imPane || typeof window === 'undefined' || !window.history) return;
    window.history.replaceState(window.history.state, '', urlMitLese(window.location.href, offen));
  }, [imPane]);
  const oeffneLese = useCallback(() => { setLese(true); spiegleLese(true); }, [spiegleLese]);
  const closeLese = useCallback(() => { setLese(false); spiegleLese(false); }, [spiegleLese]);
  // W2·10-UI-NAV/N0d·J5: Tab-Klick spiegelt die gewählte Fassung als ?ansicht=
  // (teilbar/reload-fest — die Start-Ansicht-Weiche liest sie beim Laden) und
  // scrollt an den Dokumentanfang (neuer Fassungstext, oben beginnen). Die URL
  // wird per replaceState gespiegelt (kein Router-Rerender/Lade-Effekt-Neulauf);
  // im Pane bleibt die Haupt-URL unberührt, gescrollt wird die Pane-Wurzel.
  const wechsleTab = useCallback((neu: 'voll' | 'auszug') => {
    setBodyTab(neu);
    if (!imPane && typeof window !== 'undefined' && window.history) {
      const u = new URL(window.location.href);
      u.searchParams.set('ansicht', neu);
      window.history.replaceState(window.history.state, '', u);
    }
    if (imPane) wurzel?.current?.scrollTo({ top: 0, behavior: 'smooth' });
    else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [imPane, wurzel]);
  // LM-209: Sprung zu einem Abschnitt/Anker OHNE Verlaufseintrag. Der Hash bleibt
  // in der Adresse (teilbar), wird aber per replaceState gesetzt — die Verlaufs-
  // Ökonomie gehört den echten Ortswechseln. Kein Scroll-Ereignis schreibt hier je
  // in die URL (§Z Ziff. 7 bleibt gewahrt: verworfen war der LAUFENDE Hash-Sync).
  // Im Pane bleibt die Haupt-URL unberührt (Konvention von `wechsleTab`).
  const springeZuAbschnitt = useCallback((anker: string) => {
    if (!springeZuAnker(anker)) return;   // kein Ziel im DOM ⇒ auch kein Hash (§8)
    if (imPane || typeof window === 'undefined' || !window.history) return;
    window.history.replaceState(window.history.state, '', urlMitHash(window.location.href, anker));
  }, [imPane]);
  // Laufindex des «nächste Fundstelle»-Knopfes (LM-208), zyklisch über die Ziele.
  const [fundIdx, setFundIdx] = useState(0);
  // V5 «Im Entscheid suchen» — komponenten-lokal wie die In-Gesetz-Suche vor
  // ihrer Adress-Spiegelung: der Begriff ist eine Lesehilfe, kein Ort. Er kommt
  // bewusst NICHT in die URL (kein Verlaufseintrag je Tastendruck, §Z Ziff. 7).
  const [suche, setSuche] = useState('');
  const [fsIdx, setFsIdx] = useState<number>(ladeFsIdx);
  const setFs = (i: number) => {
    const x = Math.max(0, Math.min(FS_STUFEN.length - 1, i));
    setFsIdx(x);
    try { localStorage.setItem(FS_IDX_KEY, String(x)); } catch { /* egal */ }
  };

  useEffect(() => {
    // Zustand startet auf 'laden' (Default); der Wrapper remountet via key={schluessel},
    // daher KEIN synchrones setState hier nötig (react-hooks/set-state-in-effect).
    let lebt = true;
    void ladeEntscheidEintrag(schluessel).then(async (eintrag) => {
      if (!lebt) return;
      if (!eintrag) { setZustand('fehlt'); return; }
      // Direktaufruf eines Verweis-Keys (vollständiges Urteil zu einem BGE; kein eigener
      // Snapshot, datei=null): auf das Ziel-BGE mit voraktivierter Ansicht weiterleiten
      // statt «nicht verfügbar» zu zeigen — das Ziel ist im Manifest bekannt (§8).
      if (eintrag.verweis && !eintrag.datei) {
        // ?norm= mitschleppen (Review 3.7.): der Fundstellen-Sprung überlebt den
        // Verweis-Redirect auf das Ziel-BGE.
        const normSuffix = normParam ? `&norm=${encodeURIComponent(normParam)}` : '';
        navigate(`/rechtsprechung/${encodeURIComponent(eintrag.verweis.zielKey)}?ansicht=${eintrag.verweis.ansicht}${normSuffix}`, { replace: true });
        return;
      }
      if (!eintrag.datei) { setZustand('fehlt'); return; }
      const s = await ladeEntscheid(eintrag.datei);
      if (!lebt) return;
      if (!s) { setZustand('fehlt'); return; }
      setEintrag(eintrag);
      setSnap(s);
      setZustand('da');
      // Start-Ansicht GENAU EINMAL festlegen (Lade-Effekt, nicht pro Render →
      // kein Flash, Davids manueller Tab-Wechsel wird nie überschrieben):
      // ?ansicht= aus der Übersicht hat Vorrang, sonst öffnen Leitentscheide mit
      // amtlichem Auszug zuerst den BGE-Auszug, alles andere das volle Urteil.
      const init: 'voll' | 'auszug' =
          ansichtParam === 'voll'   ? 'voll'
        : ansichtParam === 'auszug' ? 'auszug'
        : (s.leitcharakter === 'leitentscheid' && (s.auszugAbschnitte?.length ?? 0) > 0) ? 'auszug'
        : 'voll';
      setBodyTab(init);
    });
    return () => { lebt = false; };
    // normParam: nur vom Verweis-Redirect gelesen; Lade-Pfade sind Promise-
    // gecacht → ein Re-Run bei ?norm-Wechsel ist idempotent und billig.
  }, [schluessel, ansichtParam, normParam, navigate]);

  // Parität zum Gesetz-Leser: Kopfdaten (Breadcrumb Rechtsprechung › Ebene › Nr)
  // melden — der nächste Provider fängt sie (Einzelansicht → Inhalts-Kopf, Pane →
  // PaneKopf). Ebene nicht klickbar (Übersicht filtert nicht nach Bund/Kanton).
  useEffect(() => {
    if (!snap) return;
    meldeInhaltsKopf({
      breadcrumb: [
        { label: 'Rechtsprechung', to: '/rechtsprechung' },
        { label: snap.kanton === 'CH' ? 'Bund' : `Kanton ${snap.kanton}` },
        { label: snap.bgeReferenz ?? snap.nummer },
      ],
    });
  }, [snap, meldeInhaltsKopf]);
  useEffect(() => () => meldeInhaltsKopf(null), [meldeInhaltsKopf]);

  // Browser-Tab: Zitierung des Entscheids.
  useEffect(() => {
    if (!snap || typeof document === 'undefined') return;
    document.title = `${snap.zitierung} — LexMetrik`;
  }, [snap]);

  // Deep-Link auf eine Erwägung (#e-2-4 aus «Fundstelle kopieren»): der Entscheid
  // lädt on-demand (fetch), das Ziel-Element existiert beim Routen-Hash-Sprung
  // (App.tsx:ScrollZuHash, 30 Frames) oft noch nicht. Nach dem Snapshot-Render
  // hier erneut versuchen — §15-konform (nur scrollIntoView nach Mount, kein
  // CLS-Hack). Einmalig pro geladenem Entscheid (ref-Wächter), damit späteres
  // manuelles Scrollen nicht überschrieben wird.
  const hashGesprungen = useRef<string | null>(null);
  // ?norm=«Art. 957 OR» (Fundstellen-Sprung, Auftrag David 3.7.2026): jeder
  // eingehende Link (Gesetz-Leitfall-Chip, Kontext-Panel, Suche) darf die Norm
  // mitgeben, um deren ERSTE Erwägungs-Fundstelle er sich dreht. Auflösung über
  // dieselbe ersteFundstelle-Logik wie die Zitierte-Normen-Chips (§5, inkl.
  // i.V.m.-Kette). Keine Fundstelle ableitbar → ehrlicher Seitenanfang, kein
  // toter Anker (§8). Ein expliziter #hash hat Vorrang (präziseres Ziel).
  // Einmalig pro (Entscheid, Norm) — ref-Wächter wie beim Hash-Sprung.
  const normGesprungen = useRef<string | null>(null);
  useEffect(() => {
    if (zustand !== 'da' || !snap || !normParam || typeof window === 'undefined') return;
    if (hashRoh) return;                                   // expliziter #hash gewinnt (Pane-lokal bzw. Fenster)
    const merkKey = `${schluessel}?${normParam}`;
    if (normGesprungen.current === merkKey) return;
    // Fundstelle in der beim Laden AKTIVEN Fassung suchen (Auszug bevorzugt beim
    // Leitentscheid — dieselbe Weiche wie die Start-Ansicht); nicht auf spätere
    // Tab-Wechsel reagieren (kein erneuter Sprung unter dem Leser).
    const abschnitte = bodyTab === 'auszug' && (snap.auszugAbschnitte?.length ?? 0) > 0
      ? snap.auszugAbschnitte!
      : snap.abschnitte;
    const anker = ersteFundstelle(abschnitte, normParam);
    if (!anker) { normGesprungen.current = merkKey; return; } // ehrlicher Seitenanfang
    let frames = 0;
    let raf = requestAnimationFrame(function versuche() {
      if (springeZuAnker(anker)) { normGesprungen.current = merkKey; return; }
      if (frames++ < 60) raf = requestAnimationFrame(versuche);
    });
    return () => cancelAnimationFrame(raf);
    // bodyTab bewusst NICHT in den Deps: der Sprung gilt der Start-Ansicht.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zustand, snap, normParam, schluessel]);
  // LM-208: die wörtlichen Nennungen der HERKUNFTS-Norm im Lesetext markieren.
  // Erst nach einem Frame — der Body wird beim Fassungswechsel neu aufgebaut, und
  // ein synchrones setState im Effekt-Rumpf wäre ohnehin unzulässig. Der Lesemodus
  // zeigt einen EIGENEN Body: dann Markierung zurücknehmen statt auf abgehängte
  // Knoten zeigen zu lassen.
  const koerperRef = useRef<HTMLElement>(null);
  // LM-005: misst die tatsächlich gerenderte Höhe des sticky Kopf-Blocks
  // (Umschalter + Sprung-Chips) für den Scroll-Spy weiter unten — kein
  // zweiter Rem-Konstanten-Pfad neben `--rsp-stick`.
  const stickLeisteRef = useRef<HTMLDivElement>(null);
  // V5: EINE Markierungs-Schicht im Lesetext. Die Highlight-API kennt je Namen
  // genau eine Menge (`SUCH_HIGHLIGHT`, geteilt mit A35) — Suche und
  // Herkunfts-Nennung können darum nicht gleichzeitig leuchten. Vorrang hat die
  // SUCHE: sie ist die aktive Handlung des Lesers, die Herkunfts-Markierung ein
  // Zustand aus dem Aufruf. Leert er das Feld, kehrt die Norm-Markierung zurück.
  useEffect(() => {
    if (zustand !== 'da' || lese) { loescheNennungen(); return; }
    if (suche.trim() !== '') {
      setzeSuchHighlight(koerperRef.current, suche);
      return () => loescheNennungen();
    }
    if (!normParam) { loescheNennungen(); return; }
    maleNennungen(koerperRef.current, normParam);
    return () => loescheNennungen();
  }, [zustand, snap, normParam, lese, bodyTab, suche]);

  useEffect(() => {
    if (zustand !== 'da' || typeof window === 'undefined') return;
    if (!hashRoh) return;
    const id = decodeURIComponent(hashRoh);
    if (hashGesprungen.current === `${schluessel}#${id}`) return;
    let frames = 0;
    let raf = requestAnimationFrame(function versuche() {
      if (springeZuAnker(id)) { hashGesprungen.current = `${schluessel}#${id}`; return; }
      if (frames++ < 60) raf = requestAnimationFrame(versuche);
    });
    return () => cancelAnimationFrame(raf);
  }, [zustand, schluessel, hashRoh]);

  // LM-005 (W2·17-UI-BEFUNDE-B3, K-01): `SprungNavigation` («Sachverhalt |
  // Erwägungen | Dispositiv») trug KEINE Aktivmarkierung — reine `.lc-chip`-
  // Anker ohne Scroll-Spy. Der gemeldete «Sachverhalt bleibt aktiv markiert,
  // auch wenn nichts mehr sichtbar ist» stammte nachweislich nicht aus einem
  // Spy-Zustand, sondern aus dem :focus-Ring des zuletzt geklickten Chips
  // (Dedup-Notiz, Befundliste). Echter Scroll-Spy: IntersectionObserver auf
  // die Abschnitts-Anker (`[id^="abschnitt-"]` innerhalb des Lesekörpers),
  // Root-Margin um die GEMESSENE sticky Leisten-Höhe (`stickLeisteRef`, nicht
  // der `--rsp-stick`-Rem-Wert — vermeidet ein zweites Duplikat derselben
  // switcherSichtbar/hatAuszug-Herleitung vor dem `zustand`-Guard unten, §5).
  // Kein Abschnitt sichtbar (Kontext-Panel/Fusszeile erreicht, oder Lesemodus)
  // ⇒ aktivAnker=null — die Leiste «tritt zurück» (Erwartet-Text des Befunds).
  // Muss VOR den frühen `return`s stehen (Hook-Reihenfolge); die eigentliche
  // Ziel-Liste hängt an post-Guard-Werten (`snap`) und wird darum ERST im
  // Effekt-Rumpf per DOM-Abfrage gelesen, nicht aus `navZiele` (unten, §Hooks).
  const [aktivAnker, setAktivAnker] = useState<string | null>(null);
  useEffect(() => {
    if (zustand !== 'da' || lese || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setAktivAnker(null);
      return;
    }
    const wurzelEl = koerperRef.current;
    if (!wurzelEl) { setAktivAnker(null); return; }
    const elemente = Array.from(wurzelEl.querySelectorAll<HTMLElement>('[id^="abschnitt-"]'));
    if (elemente.length === 0) { setAktivAnker(null); return; }
    const root = imPane ? wurzel?.current ?? null : null;
    const stickPx = Math.ceil(stickLeisteRef.current?.getBoundingClientRect().height ?? 0);
    const sichtbar = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => sichtbar.set(en.target, en.isIntersecting));
      const oben = elemente.find((el) => sichtbar.get(el));
      setAktivAnker(oben?.id ?? null);
    }, { root, rootMargin: `-${stickPx}px 0px -60% 0px`, threshold: 0 });
    elemente.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [zustand, snap, bodyTab, lese, imPane, wurzel]);

  if (zustand === 'fehlt') {
    return (
      <div className="space-y-4">
        <Link to="/rechtsprechung" className="text-body-s text-brass-700">‹ Zur Rechtsprechung</Link>
        <div className="lc-notice lc-notice-warn">
          Dieser Entscheid ist nicht verfügbar. Möglicherweise wurde er noch nicht erfasst.
        </div>
      </div>
    );
  }
  if (zustand === 'laden' || !snap) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Der Entscheid wird abgerufen …</p>
      </div>
    );
  }

  const regesteText = snap.regeste ? normalisiereRegeste(snap.regeste.text) : null;
  // Einheitlicher Kopf: Modell aus der reinen Regel-Lib (§3) — Komponente rendert nur.
  const kopf = kopfModell(snap);
  const kopfLabel = KOPF_LABEL[snap.sprache];
  // BGE-Umschalter: nur wenn ein separater amtlicher Sammlungs-Auszug vorliegt.
  const hatAuszug = !!snap.auszugAbschnitte && snap.auszugAbschnitte.length > 0;

  // ── EINE Ansicht-Weiche (SSoT) — alles Sichtbare hängt an `ansicht` ────────
  // Der Tab-Umschalter erscheint nur beim BGE mit Volltext; sonst steht die
  // Ansicht fest (BGE ohne Volltext = amtlicher Auszug, alles übrige = Urteil).
  const switcherSichtbar = snap.gericht === 'bge' && hatAuszug;
  const ansicht: 'voll' | 'auszug' = switcherSichtbar ? bodyTab : (snap.gericht === 'bge' ? 'auszug' : 'voll');
  // Rubrum (Art. 112 BGG) gehört zum vollständigen Urteil, nicht zum kuratierten
  // Sammlungs-Auszug. Regeste umgekehrt: prominent im Leitentscheid-Auszug, nicht
  // über dem vollständigen Urteil (David: «bei vollständiges urteil nicht regeste oben»).
  const zeigeRubrum = ansicht === 'voll' && kopf.rubrumZeilen.length > 0;
  const zeigeRegeste = !!regesteText && (ansicht === 'auszug' || snap.gericht !== 'bge');
  // Massgebliche Fassung folgt der Ansicht: Voll → unterliegendes Urteil (aza),
  // Auszug → BGE-Sammlung. Fehlt die Urteils-Quelle, ehrlich markieren statt den
  // BGE als Urteil auszugeben (§8) und auf die BGE-Quelle zurückfallen.
  const massgeblicheUrl = ansicht === 'voll' ? (snap.azaUrteil?.quelleUrl ?? snap.quelleUrl) : snap.quelleUrl;
  // NUR beim BGE-Volltext ohne aufgelöstes aza-Urteil ist die Urteils-Quelle der Fallback
  // (BGE-Sammlung). Kantonale/Nicht-BGE-Entscheide haben quelleUrl = ihr eigenes Urteil →
  // kein «n.v.»-Marker, kein erfundener «BGE-Sammlungs»-Bezug (Bug-Check 26.6., §8).
  const massgeblichFehlt = snap.gericht === 'bge' && ansicht === 'voll' && !snap.azaUrteil?.quelleUrl;
  const massgeblichTitel = massgeblichFehlt
    ? 'Urteils-Quelle nicht verfügbar — dieser Link führt zur amtlichen BGE-Sammlungsquelle'
    : 'Die amtliche, massgebliche Fassung bei der Quelle öffnen';

  // Body folgt der Ansicht (nicht nur dem rohen Tab): im Auszug der amtliche
  // Sammlungstext, sonst das vollständige Urteil.
  const aktiveAbschnitte = ansicht === 'auszug' && hatAuszug ? snap.auszugAbschnitte! : snap.abschnitte;
  // sticky-Höhe als CSS-Variable: zweizeilig (Tabs + Sprung-Chips) bzw. einzeilig
  // (nur Sprung-Chips). Anker-Sektionen verrechnen das als scroll-margin-top.
  // In der Einzelansicht klebt die Leiste UNTER dem Inhalts-Kopf (Topbar 4rem +
  // Kopf 2.25rem); im Pane liegen Topbar/PaneKopf AUSSERHALB des Scroll-Containers
  // → Offset ~0. scroll-margin (--rsp-stick) entsprechend.
  const stickHoehe = imPane
    ? (switcherSichtbar ? '7rem' : '3.5rem')
    : (switcherSichtbar ? '12.75rem' : '9.25rem');
  // Sprung-Ziele: nach dem aktiven Body (+ Regeste, wenn sie gezeigt wird) — passt zur sichtbaren Ansicht.
  const vorhandene = new Set<Abschnittstyp>(aktiveAbschnitte.map((a) => a.typ));
  if (zeigeRegeste) vorhandene.add('regeste');
  const navZiele = NAV_TYPEN
    .filter((t) => vorhandene.has(t))
    .map((t) => ({
      anker: t === 'regeste' ? 'abschnitt-regeste' : abschnittAnker(t),
      label: t === 'regeste' && !snap.regesteAmtlich ? 'Zusammenfassung' : ABSCHNITT_TITEL[t],
    }));

  // ── LM-208 · Herkunft der Ankunft (nur bei ?norm=) ────────────────────────
  // Beide Zahlen kommen aus DEMSELBEN Muster wie die Markierung im Text (§5,
  // entscheidLeserRegeln): `ziele` sind die anspringbaren Erwägungs-Blöcke,
  // `gesamt` alle wörtlichen Nennungen der sichtbaren Fassung. Aus den Daten
  // gerechnet, nicht aus dem DOM — die Zeile steht damit im ersten Render
  // richtig da (kein Nachwachsen/Umspringen, §15.2). Linearer Regex-Lauf über
  // die Blöcke der aktiven Fassung; nur bei gesetztem ?norm=.
  const herkunft = normParam ? {
    ziele: nennungsAnker(aktiveAbschnitte, normParam),
    gesamt: aktiveAbschnitte.reduce(
      (n, a) => n + a.bloecke.reduce((m, b) => m + zaehleNennungen(b.text, normParam), 0), 0),
  } : null;
  const springeZuFundstelle = () => {
    if (!herkunft || herkunft.ziele.length === 0) return;
    springeZuAbschnitt(herkunft.ziele[fundIdx % herkunft.ziele.length]);
    setFundIdx((n) => (n + 1) % herkunft.ziele.length);
  };

  // R12 «Kopieren mit Fundstelle»: Zitierung + Stand-Ausweis in die Zwischenablage.
  // B-6 (QS-BASIS): Abrufdatum + Permalink (§7 a–d); ein Entscheid hat keine
  // Konsolidierung → keine «Fassung» (§8). Ohne origin (SSR/kein window): nur die
  // Zitierung, ehrlich ohne erfundenen Permalink.
  const kopiereZitat = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const url = typeof location !== 'undefined' ? `${location.origin}${location.pathname}` : '';
    navigator.clipboard.writeText(url ? zitatMitAusweis(snap.zitierung, { abruf: heuteIso(new Date()), permalink: url }) : snap.zitierung)
      .then(() => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); })
      .catch(() => { /* Clipboard nicht verfügbar */ });
  };

  return (
    <div className="space-y-5" style={{ '--rsp-stick': stickHoehe } as CSSProperties}>
      {/* Anker-Sektionen des EntscheidBody tragen ein festes scroll-mt-[7rem]; hier
          auf die tatsächliche sticky-Höhe (--rsp-stick) heben, damit ein angesprungener
          Abschnitt nicht hinter dem gemeinsamen Kopf-Block verschwindet. Greift nur im
          Haupt-Body (.rsp-anker), nicht im Lesemodus-Overlay (eigene schlanke Leiste).
          LM-002 (W2·17-UI-BEFUNDE-B3, K-01): `#kontext-titel` (KontextPanel-
          Überschrift «Kontext») liegt AUSSERHALB von `.rsp-anker` (nach dem
          `<footer>`, s. u.) — aber innerhalb DIESES Wrappers, der `--rsp-stick`
          trägt, darum hier reichbar. Ohne eigene scroll-margin landete ein
          gezielter Sprung/eine Find-Landung dorthin unter der klebenden
          Sachverhalt/Erwägungen/Dispositiv-Leiste (nur die unterste Pixelreihe
          der Überschrift blieb sichtbar) — reproduziert exakt wie gemeldet. */}
      <style>{`.rsp-anker [id],#kontext-titel{scroll-margin-top:var(--rsp-stick,7rem)}`}</style>
      {/* Breadcrumb trägt der Kopf (Inhalts-Kopf in der Einzelansicht, PaneKopf im
          Split-View) — kein Inline-Dup mehr (Parität zum Gesetz-Leser). */}
      <header className="space-y-2.5 border-b border-line pb-5">
        {/* 1 Identität (stets): Gericht · Abteilung · Sachgebiet */}
        <p className="lc-overline">
          {snap.gerichtName}
          {snap.abteilung && <span className="text-ink-500"> · {snap.abteilung}</span>}
          <span className="text-brass-700"> · {GEBIET_LABEL[snap.sachgebiet]}</span>
        </p>
        {/* 2 Zitierung = Identitäts-Anker (stets, prominent). LM-019 (§8 B7): bei
            offenem Lesemodus blendet NUR der `<article>`-Body aus (weiter unten,
            `{!lese && …}`) — dieser Kopf inkl. H1 blieb bisher im DOM, während das
            Overlay (LesemodusOverlay, `createPortal`) DENSELBEN Titel als EIGENES
            H1 zeigt: zwei H1 mit identischem Text gleichzeitig im Dokument (axe/
            WCAG 1.3.1, Doppel-Landmarke). `hidden` (display:none) nimmt dieses H1
            aus dem Accessibility-Baum, solange das Overlay-H1 die Rolle trägt —
            visuell ohnehin unter dem opaken Vollbild-Overlay verdeckt. */}
        <h1 className={`text-h2 sm:text-h1 font-display font-semibold text-ink-900 num${lese ? ' hidden' : ''}`}>{snap.zitierung}</h1>

        {/* 3 Abgeleitete Sachgebiets-Leitzeile — nur wenn weder ein Rubrum-Gegenstand
            noch die Regeste-Box das Thema trägt (kopf.ts entscheidet, §3/§5). Nüchtern +
            ehrlicher Marker, dass sie aus der Struktur abgeleitet ist (§8). */}
        {kopf.leitzeile && (
          <div className="space-y-0.5">
            <p className="text-body-s leading-snug text-ink-700">{kopf.leitzeile}</p>
            <p className="text-micro italic text-ink-500">{SYNTH_MARKER[snap.sprache]}</p>
          </div>
        )}

        {/* 3b LM-208 · Herkunfts-Hinweis: wer über einen Norm-Chip hierher kam, sah
            bisher nirgends, über welche Norm — und musste die Stelle in einem
            24'000-Zeichen-Urteil selbst suchen. Chip-Grammatik der Metazeile
            (<span> flach, <button> gerahmt); die Norm selbst über NormText, damit
            der Rückweg ein lebender Link ist (§13-D1). Der A17-Seitenanfang bleibt
            unangetastet — hier kommt nur eine Zeile hinzu, kein Sprungverhalten. */}
        {herkunft && normParam && (
          <div className="lc-chip-zeile flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-ink-500">
            <span>Aufgerufen über <NormText text={normParam} /></span>
            {herkunft.ziele.length > 0 ? (
              <button type="button" onClick={springeZuFundstelle}
                className="lc-chip hover:text-brass-700 hover:border-brass-400"
                title="Zur nächsten wörtlichen Nennung in den Erwägungen springen">
                {/* Abstand als Klasse, nicht als Leerzeichen: `.lc-chip` ist ein
                    Flex-Container, dort fallen reine Whitespace-Knoten zwischen
                    zwei Flex-Items weg (Screenshot-Befund «Fundstelle1/2»). */}
                ↓ Fundstelle
                <span className="num ml-1">{(fundIdx % herkunft.ziele.length) + 1}/{herkunft.ziele.length}</span>
              </button>
            ) : herkunft.gesamt > 0 ? (
              // Genannt, aber ausserhalb der Erwägungen (Sachverhalt/Dispositiv):
              // markiert ja, anspringbarer Anker nein — ehrlich benannt (§8).
              <span title="Die Nennung liegt ausserhalb der Erwägungen und ist im Text markiert">
                im Text markiert, kein Erwägungs-Anker
              </span>
            ) : (
              // Der reproduzierte Fall: der Entscheid schreibt «Art. 367 ff. OR».
              // Das «ff.» aufzulösen wäre geraten (§1/§8) — also ehrlich sagen,
              // dass die Norm nicht wörtlich in dieser Form im Text steht.
              <span title="Der Entscheid nennt diese Norm nicht in exakt dieser Form (z. B. nur als «… ff.» oder mit Absatz-Angabe)">
                im Text nicht wörtlich genannt
              </span>
            )}
          </div>
        )}

        {/* 4 Rubrum-Zeilen IM Kopf (Art. 112 BGG): nur befüllte Felder, feste Reihenfolge
            Gegenstand→Parteien→Vorinstanz→Besetzung, per Haarlinie abgesetzt (kein Kasten).
            Nur in der Voll-Ansicht — der amtliche BGE-Auszug trägt kein Rubrum. */}
        {zeigeRubrum && (
          <dl className="mt-1 grid grid-cols-1 sm:grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-line/60 pt-3 text-body-s">
            {kopf.rubrumZeilen.map((z) => (
              <div key={z.label} className="contents">
                <dt className="lc-overline pt-0.5">{kopfLabel[z.label]}</dt>
                <dd className={z.label === 'gegenstand' ? 'text-ink-800' : 'text-ink-700'}>
                  {z.label === 'besetzung'
                    ? <BesetzungWert freitext={z.wert} gericht={snap.gericht} refs={eintrag?.richter} />
                    : z.wert}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* 5 Meta + Badges + Lese-Steuerung — gedämpfte Schlusszeile.
            lc-chip-zeile (LM-047): Chip-Grammatik wie im Erlasskopf (LM-045) —
            <a> unterstrichen, <button> gerahmt, <span> flach; die gewollte
            Badge↔Chip-Trennung (VZUI §1.2/§1.3) bleibt unberührt. */}
        <div className="lc-chip-zeile flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
          <DatumMeta snap={snap} />
          {snap.bgeReferenz && (
            <>
              <span className="text-ink-300" aria-hidden>·</span>
              <span className="num">{snap.bgeReferenz}</span>
            </>
          )}
          {/* BS §7.2: parallele Zweit-Geschäftsnummer desselben Verfahrens
              («ZB.2023.4 (AG.2023.…)») — Identität, keine zweite Zitierung. */}
          {snap.nummerSekundaer && (
            <>
              <span className="text-ink-300" aria-hidden>·</span>
              <span className="num" title="Parallele Geschäftsnummer desselben Verfahrens">({snap.nummerSekundaer})</span>
            </>
          )}
          {/* V1.2 (W2·7-VZUI): geteiltes StatusBadge-Vokabular — aria-label
              textgleich zu Suche/Panel/Leitfall-Zeile; hier interaktiv (Begriff-
              Tooltip, fokussier- und touch-bedienbar, Magic Moment 4). */}
          {snap.leitcharakter === 'leitentscheid' && <StatusBadge praedikat="leitentscheid" interaktiv />}
          <span className="lc-badge lc-badge-soft uppercase" title={spracheBadgeTitel(snap.sprache)}>{snap.sprache}</span>
          {snap.kuratierung === 'maschinell' && <StatusBadge praedikat="maschinell" />}
          <span className="ml-auto inline-flex flex-wrap items-center justify-end gap-2 gap-y-1.5">
            {/* Amtliche Quelle direkt oben erreichbar (massgebliche Fassung, §8) —
                folgt der Ansicht (Voll → Urteil/aza, Auszug → BGE-Sammlung). */}
            <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer"
              className="lc-chip hover:text-brass-700 hover:border-brass-400"
              title={massgeblichTitel}>
              ↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}
            </a>
            {/* R17: Lese-Schriftgrösse */}
            {/* shrink-0: die Schlusszeile ist ein flex-wrap-Streifen; ohne dies
                staucht der Flex die overflow-hidden-Gruppe bei 390 unter ihre
                Inhaltsbreite und beschnitt «A− A+» (Responsive-Audit D5). */}
            <span className="inline-flex shrink-0 items-stretch rounded border border-line overflow-hidden" role="group" aria-label="Schriftgrösse">
              <button type="button" onClick={() => setFs(fsIdx - 1)} disabled={fsIdx === 0}
                className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift kleiner">A−</button>
              <button type="button" onClick={() => setFs(fsIdx + 1)} disabled={fsIdx === FS_STUFEN.length - 1}
                className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40 border-l border-line" title="Schrift grösser">A+</button>
            </span>
            <button type="button" onClick={kopiereZitat}
              className="lc-chip hover:text-brass-700 hover:border-brass-400"
              title="Zitierung + Link in die Zwischenablage kopieren">
              {kopiert ? '✓ kopiert' : '⧉ Zitat kopieren'}
            </button>
            <button type="button" onClick={oeffneLese}
              className="lc-chip hover:text-brass-700 hover:border-brass-400"
              title="Ablenkungsfreier Lesemodus">
              ▭ Lesemodus
            </button>
          </span>
        </div>
      </header>

      {/* Gemeinsamer sticky Kopf-Block (§13-Bug-Fix: EIN sticky-Element statt zweier
          sich überlagernder). Oben — beim BGE mit Volltext — der Fassungs-Umschalter
          (§8: «Amtlicher BGE-Auszug» ⟷ «Vollständiges Urteil»), darunter die Sprung-Chips.
          Die App-Topbar liegt mit z-20 darüber, dieser Block mit z-[15] darunter.
          LM-007 (W2·17-UI-BEFUNDE-B3, K-01, Mittel): Topbar + dieser Block belegten
          beim BGE-Volltext (Umschalter sichtbar) rund 190 px dauerhaft sichtbare
          Höhe. B6 (FAHRPLAN-VERZAHNUNG-UI.md §9, «minimalistischer») als Muster
          übernommen — kein Feature-Abbau, nur knapperes Mass: `py-2`→`py-1.5`,
          `space-y-2`→`space-y-1.5`, Umschalter-Tabs `groesse="s"` (h-10/h-8 statt
          h-11/h-9). `stickHoehe` bleibt bewusst UNVERÄNDERT (grosszügig statt knapp
          bemessen) — die Sprung-Ziele landen weiterhin sicher unterhalb der Leiste,
          nur mit etwas mehr Luft als nötig statt zu wenig. */}
      {(switcherSichtbar || navZiele.length > 0) && (
        <div ref={stickLeisteRef} style={{ top: imPane ? '0.5rem' : 'calc(4rem + 2.25rem)' }}
          className="sticky z-[15] -mx-5 sm:-mx-6 px-5 sm:px-6 py-1.5 bg-paper border-b border-line space-y-1.5">
          {switcherSichtbar && (
            <Tabs
              items={[
                { code: 'auszug', label: 'Amtlicher BGE-Auszug' },
                { code: 'voll', label: <>Vollständiges Urteil{snap.azaUrteil && <span className="num"> · {snap.azaUrteil.aktenzeichen}</span>}</> },
              ]}
              value={bodyTab}
              onChange={wechsleTab}
              mode="tab"
              groesse="s"
              ariaLabel="Textfassung des Entscheids"
            />
          )}
          <SprungNavigation ziele={navZiele} springe={springeZuAbschnitt} aktiv={aktivAnker} />
        </div>
      )}

      {/* Einordnung der gewählten Fassung (nicht sticky), gekoppelt an die Ansicht. */}
      {switcherSichtbar && (
        <p className="text-micro text-ink-500 max-w-reading">
          {ansicht === 'voll'
            ? <>Das vollständige unterliegende Urteil <span className="num">{snap.azaUrteil?.aktenzeichen}</span> — Grundlage der amtlichen Sammlung BGE <span className="num">{snap.bgeReferenz}</span>.</>
            : <>Der amtlich publizierte Auszug der Sammlung BGE <span className="num">{snap.bgeReferenz}</span> — vom Gericht kuratiert.</>}
        </p>
      )}

      {/* BGE ohne aufgelösten Volltext: nur der Sammlungs-Auszug + Live-Link (§8). */}
      {snap.gericht === 'bge' && !hatAuszug && (
        <p className="text-micro text-ink-500 max-w-reading">
          Auszug aus der amtlichen Sammlung (BGE <span className="num">{snap.bgeReferenz}</span>). Das vollständige Urteil ist bei der Quelle verfügbar (↗ massgebliche Fassung oben).
        </p>
      )}

      {/* ── Lesefläche + Erwägungs-Rail (V5, W2·10-UI-NAV) ────────────────────
          Ab `xl` zwei Spalten: links die unveränderte Lesespalte (Regeste +
          EntscheidBody, weiterhin `max-w-reading`), rechts der sticky
          Navigations-Rail. Darunter — und im Pane, wo keine zweite Spalte
          hineinpasst — steht der Rail als aufklappbarer Block ÜBER dem Text
          (`order`), nie darunter: eine Navigation hinter dem Ziel ist keine.
          Regeste und Body liegen bewusst in DERSELBEN Spalte, sonst fluchtete
          die Regeste-Box auf `xl` nicht mehr mit dem Text darunter.
          Bei offenem Lesemodus entfällt NUR der `<article>` — der Overlay zeigt
          denselben EntscheidBody, und doppelte Abschnitts-`id` wären ungültiges
          HTML + brächen Anker-Sprünge. Die Regeste bleibt wie bisher im DOM
          (ihr Anker `#abschnitt-regeste` ist Sprungziel der Leiste). */}
      {(
        <div className={imPane
          ? 'flex flex-col gap-4'
          : 'flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start xl:gap-8'}>
          {/* B6 (§9-Bug-Check 4.8.2026): im LESEMODUS gibt es den Rail nicht.
              Dort ist der Haupt-Body ausgehängt (der Overlay zeigt seinen
              eigenen), die Treffer-Markierung ist abgeschaltet und jeder
              Sprung liefe still ins Leere — eine Trefferzahl neben toten
              Sprungzielen ist genau die Halb-Auskunft, die §8 verbietet.
              Der Suchbegriff bleibt im State: wer den Lesemodus schliesst,
              findet seine Suche unverändert vor. */}
          {!lese && (
            <ErwRail abschnitte={aktiveAbschnitte} zitierteNormen={snap.zitierteNormen}
              suche={suche} onSuche={setSuche} springe={springeZuAbschnitt} imPane={imPane} />
          )}
          <div className={imPane ? 'order-2 min-w-0' : 'order-2 min-w-0 xl:order-1 xl:col-start-1 xl:row-start-1'}>
            {/* Regeste prominent im Leitentscheid-Auszug (zeigeRegeste). Beim amtlich
                publizierten BGE «Regeste», sonst maschinelle «Zusammenfassung» — ehrlich
                gekennzeichnet (Abnahme-Kritik: kein Etikettenschwindel).
                D-1.4 (Befund 20): Regeste in die Lesespalte — vorher volle Breite
                (~115–120 CPL im wichtigsten Textblock); jetzt dieselbe zentrierte
                max-w-reading-Spalte wie der EntscheidBody darunter. */}
            {zeigeRegeste && snap.regeste && (
              <div className="mx-auto mb-5 w-full max-w-reading">
                <RegesteBlock regeste={snap.regeste} amtlich={snap.regesteAmtlich} />
              </div>
            )}
            {/* Lesespalte 60–75 Zeichen (Reglement R1). */}
            {!lese && (
              <article ref={koerperRef} className="rsp-anker mx-auto w-full max-w-reading" style={{ '--rsp-fs': `${FS_STUFEN[fsIdx]}rem` } as CSSProperties}>
                <EntscheidBody abschnitte={aktiveAbschnitte} zitierung={snap.zitierung} bgeReferenz={snap.bgeReferenz} />
              </article>
            )}
          </div>
        </div>
      )}

      {/* Provenienz / Rechtslage (§7/§8) */}
      <footer className="mt-12 border-t border-line pt-5 space-y-3 text-body-s text-ink-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer"
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
            title={massgeblichTitel}>
            ↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}
          </a>
          <span className="text-ink-500">Daten: {QUELLE_LABEL[snap.quelle] ?? snap.quelle}</span>
        </div>
        <p className="text-micro text-ink-500 max-w-reading leading-relaxed">
          Der Urteilstext ist als amtliches Werk gemeinfrei (Art. 5 URG). Eine allfällige
          Regeste ist redaktionell. Diese Wiedergabe ersetzt die amtliche Fassung nicht und
          stellt keine Rechtsberatung dar — massgeblich ist stets die amtliche Quelle.
        </p>
        {/* B2/R1 (QS-UI 8b Teil 2): Der Norm-Hinweis lief als einziger Absatz des
            Provenienz-Fusses mit 976 px über die volle Breite — auf allen 5'093
            Entscheid-Seiten. Die beiden Absätze darüber halten `max-w-reading`
            bereits; der Hinweis kommt aus einer geteilten Komponente und wird
            darum HIER auf die Lesespalte gesetzt (kein Eingriff in die geteilte
            Komponente, die auch der Gesetzes-Fläche gehört — W2·5h). */}
        <div className="max-w-reading"><NormTextHinweis /></div>
      </footer>

      {/* Einheitliches Kontext-Panel (B3) — V1.3 (W2·7-VZUI §2.2): beide
          Verzahnungs-Richtungen am Dokumentfuss. «Zitierte Normen» (artikelscharf,
          Sprung zur Erwägungs-Fundstelle) ERSETZT die grobe Erlass-Gruppe (keine
          Doppel-Darstellung); «Zitierte Entscheide» löst die maschinell gelesenen
          Zitate gegen das kuratierte Manifest auf. Die Regeste bleibt oben
          ungestört (§0-1d). Fundstellen folgen der sichtbaren Ansicht. */}
      <KontextPanel typ="entscheid" normKeys={snap.normKeys}
        artikelZitate={snap.zitierteNormen}
        ohneNormen={snap.zitierteNormen.length > 0}
        zusatzGruppen={(snap.zitierteNormen.length > 0 || snap.zitierteEntscheide.length > 0) ? (
          <>
            <ZitierteNormenGruppe
              abschnitte={aktiveAbschnitte}
              zitierteNormen={snap.zitierteNormen}
              regesteAnker={zeigeRegeste ? 'abschnitt-regeste' : null}
              entscheidDatum={entscheidDatum(snap.datum, snap.gericht)}
            />
            <ZitiertGruppe
              zitierteEntscheide={snap.zitierteEntscheide}
              abschnitte={aktiveAbschnitte}
              selbstKey={schluessel}
            />
          </>
        ) : undefined} />

      <nav className="border-t border-line pt-5 text-body-s" aria-label="Weitere Entscheide">
        <Link to="/rechtsprechung" className="text-ink-500 hover:text-brass-700">‹ Zur Übersicht</Link>
      </nav>

      {lese && (
        <LesemodusOverlay snap={snap} abschnitte={aktiveAbschnitte}
          regesteText={zeigeRegeste ? regesteText : null}
          massgeblicheUrl={massgeblicheUrl} massgeblichTitel={massgeblichTitel} massgeblichFehlt={massgeblichFehlt}
          fsIdx={fsIdx} setFs={setFs} onClose={closeLese}
          // LM-014 (§8 B7): der Lesemodus liess Gegenstand/Besetzung weg — dieselbe
          // Weiche wie die Voll-Ansicht oben (kopf/kopfLabel sind reine Ableitungen
          // aus snap, §5 EINE Quelle; nur `eintrag.richter` ist Seiten-State und
          // muss darum als Prop durchgereicht werden, die Regel selbst bleibt in
          // kopfModell()/besetzungsTeile()).
          zeigeRubrum={zeigeRubrum} kopf={kopf} kopfLabel={kopfLabel} richterRefs={eintrag?.richter} />
      )}
    </div>
  );
}

// ── Lesemodus: ablenkungsfreies Vollbild-Overlay ────────────────────────────
// Zeigt NUR den Entscheid in einer ruhigen Lesespalte (grosse Serif, viel
// Weissraum), blendet die App-Shell aus. Wiederverwendung des EntscheidBody +
// der Regeste (keine Duplizierung der Rechtsdarstellung, §3/§5). Provenienz/
// massgebliche Fassung bleibt sichtbar (§8). ESC schliesst, Body-Scroll gesperrt.
function LesemodusOverlay({ snap, abschnitte, regesteText, massgeblicheUrl, massgeblichTitel, massgeblichFehlt, fsIdx, setFs, onClose, zeigeRubrum, kopf, kopfLabel, richterRefs }: {
  snap: EntscheidSnapshot;
  abschnitte: EntscheidSnapshot['abschnitte'];
  // Bereits an der Ansicht ausgerichtet (null = im vollständigen Urteil keine Regeste oben);
  // kein Fassungs-Desync zwischen Hauptspalte und Lesemodus.
  regesteText: string | null;
  massgeblicheUrl: string;
  massgeblichTitel: string;
  massgeblichFehlt: boolean;
  fsIdx: number;
  setFs: (i: number) => void;
  onClose: () => void;
  /** LM-014: dieselben Rubrum-Zeilen (Gegenstand/Parteien/Vorinstanz/Besetzung)
   *  wie die Voll-Ansicht — Ableitung bleibt in kopfModell() (§5), hier nur Render. */
  zeigeRubrum: boolean;
  kopf: KopfModell;
  kopfLabel: Record<KopfLabelKey, string>;
  richterRefs: RichterRef[] | undefined;
}) {
  const schliessRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vorigerFokus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      // Fokus-Falle: Tab bleibt im Dialog (a11y, aria-modal).
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (f.length === 0) return;
        const erst = f[0], letzt = f[f.length - 1];
        if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }
        else if (!e.shiftKey && document.activeElement === letzt) { e.preventDefault(); erst.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    schliessRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = vorher;
      vorigerFokus?.focus?.();   // Fokus zum Auslöser zurück
    };
  }, [onClose]);

  // Per Portal an <body>: sonst fängt ein `@container/pane`-Vorfahr (Split-View)
  // das `position:fixed`-Overlay ein und der Lesemodus wäre nicht mehr vollflächig
  // (B-1-Bugcheck #7). Default geschlossen → kein SSR/Prerender-Pfad.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Lesemodus — ${snap.zitierung}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper">
      {/* schlanke, sticky Kopfleiste: Identität + Schriftgrösse + Schliessen */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-paper/95 px-5 py-2.5 backdrop-blur-sm">
        <span className="num text-body-s font-medium text-ink-700">{snap.bgeReferenz ?? snap.zitierung}</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="inline-flex items-stretch overflow-hidden rounded border border-line" role="group" aria-label="Schriftgrösse">
            <button type="button" onClick={() => setFs(fsIdx - 1)} disabled={fsIdx === 0}
              className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift kleiner">A−</button>
            <button type="button" onClick={() => setFs(fsIdx + 1)} disabled={fsIdx === FS_STUFEN.length - 1}
              className="border-l border-line min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift grösser">A+</button>
          </span>
          <button ref={schliessRef} type="button" onClick={onClose}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400" title="Lesemodus schliessen (Esc)">
            ✕ schliessen
          </button>
        </span>
      </div>

      <article className="mx-auto w-full max-w-reading px-5 py-10 sm:py-14"
        style={{ '--rsp-fs': `${FS_STUFEN[fsIdx]}rem` } as CSSProperties}>
        <p className="lc-overline">
          {snap.gerichtName}
          {snap.abteilung && <span className="text-ink-500"> · {snap.abteilung}</span>}
          <span className="text-brass-700"> · {GEBIET_LABEL[snap.sachgebiet]}</span>
        </p>
        <h1 className="mt-2 text-h2 sm:text-h1 font-display font-semibold text-ink-900 num">{snap.zitierung}</h1>
        <p className="mt-1 text-xs text-ink-500">
          <DatumMeta snap={snap} />
          {snap.bgeReferenz && <> · <span className="num">{snap.bgeReferenz}</span></>}
          {snap.nummerSekundaer && <> · <span className="num" title="Parallele Geschäftsnummer desselben Verfahrens">({snap.nummerSekundaer})</span></>}
        </p>

        {/* LM-014 (§8 B7): dieselben 4 Rubrum-Zeilen wie die Voll-Ansicht (Art. 112
            BGG) — der Lesemodus liess sie bisher weg, obwohl er denselben Kopf
            zitiert. Identisches Markup zur Voll-Ansicht (oben, `zeigeRubrum`-Block). */}
        {zeigeRubrum && (
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-line/60 pt-3 text-body-s">
            {kopf.rubrumZeilen.map((z) => (
              <div key={z.label} className="contents">
                <dt className="lc-overline pt-0.5">{kopfLabel[z.label]}</dt>
                <dd className={z.label === 'gegenstand' ? 'text-ink-800' : 'text-ink-700'}>
                  {z.label === 'besetzung'
                    ? <BesetzungWert freitext={z.wert} gericht={snap.gericht} refs={richterRefs} />
                    : z.wert}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {regesteText && snap.regeste && (
          <div className="mt-7">
            <RegesteBlock regeste={snap.regeste} amtlich={snap.regesteAmtlich} mitAnker={false} />
          </div>
        )}

        <div className="mt-9">
          <EntscheidBody abschnitte={abschnitte} zitierung={snap.zitierung} bgeReferenz={snap.bgeReferenz} />
        </div>

        <footer className="mt-12 border-t border-line pt-5 text-body-s text-ink-500">
          <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer" title={massgeblichTitel}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}</a>
          <p className="mt-3 text-micro text-ink-500 leading-relaxed">
            Der Urteilstext ist als amtliches Werk gemeinfrei (Art. 5 URG); massgeblich ist stets die amtliche Quelle. Keine Rechtsberatung.
          </p>
        </footer>
      </article>
    </div>,
    document.body,
  );
}

// Kleiner Hinweis, dass genannte Bundesnormen im Text verlinkt sind (NormText
// im Body) — über NormText, damit der Verweis selbst auch ein lebender Link ist.
function NormTextHinweis() {
  return (
    <p className="text-micro text-ink-500">
      Im Text genannte Bundesnormen (z. B. <NormText text="Art. 8 ZGB" />) sind direkt mit der Gesetzessammlung verlinkt.
    </p>
  );
}

export function EntscheidLeser() {
  const { key: keyRoh } = useParams<{ key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  // Übersicht→Detail-Brücke: ?ansicht=voll|auszug wählt die Start-Fassung.
  const [sp] = useSearchParams();
  const ansichtParam = sp.get('ansicht');
  const normParam = sp.get('norm');
  // LM-210: `?lese=1` öffnet den Lesemodus direkt beim Laden (teilbar, reload-fest).
  const leseParam = sp.get(LESE_PARAM);
  return <EntscheidLeserInhalt key={schluessel} schluessel={schluessel} ansichtParam={ansichtParam} normParam={normParam} leseParam={leseParam} />;
}
